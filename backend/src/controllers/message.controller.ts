import { Request, Response } from "express";
import Message from "../models/message.model.js";
import { hasImagekitConfig, uploadChatMedia, getAuthParams } from "../lib/imagekit.js";
import { getRecieverSocketId, io } from "../lib/socket.js";
import Friendship from "../models/friendship.model.js";

const getConversations = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?._id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized",
      });
    }

    // Get all accepted friend IDs
    const friendships = await Friendship.find({
      $or: [{ requester: loggedInUserId }, { recipient: loggedInUserId }],
      status: "accepted",
    }).lean();

    const friendIds = friendships.map((f) =>
      f.requester.toString() === loggedInUserId.toString()
        ? f.recipient
        : f.requester,
    );

    if (friendIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No conversations found",
        status: 200,
        conversations: [],
      });
    }

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: loggedInUserId, receiverId: { $in: friendIds } },
            { senderId: { $in: friendIds }, receiverId: loggedInUserId },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$senderId", loggedInUserId] },
              then: "$receiverId",
              else: "$senderId",
            },
          },
          lastMessage: {
            $first: "$$ROOT",
          },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ["$receiverId", loggedInUserId] },
                    { $ne: ["$status", "seen"] },
                    { $ne: ["$isDeleted", true] },
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      {
        $sort: {
          "lastMessage.createdAt": -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          username: "$user.username",
          fullName: "$user.fullName",
          email: "$user.email",
          profilePic: "$user.profilePic",
          unreadCount: 1,
          lastMessage: {
            message: "$lastMessage.message",
            createdAt: "$lastMessage.createdAt",
            mediaUrl: "$lastMessage.mediaUrl",
            mediaType: "$lastMessage.mediaType",
            isEncrypted: "$lastMessage.isEncrypted",
            ciphertext: "$lastMessage.ciphertext",
            iv: "$lastMessage.iv",
            authTag: "$lastMessage.authTag",
            ratchetHeader: "$lastMessage.ratchetHeader",
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      status: 200,
      conversations: conversations || [],
    });
  } catch (error: any) {
    console.log(error);
    const statusCode =
      error.name === "ValidationError" || error.name === "CastError"
        ? 400
        : error.code === 11000
          ? 409
          : 500;
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: error.message || "Internal Server Error",
    });
  }
};

const getMessages = async (req: Request, res: Response) => {
  try {
    const receiverId = req.params.id; // userToChat
    const senderId = req.user?._id; // loggedinUser

    if (!receiverId || !senderId) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized",
      });
    }

    // Verify friendship before returning messages
    const isFriend = await Friendship.exists({
      $or: [
        { requester: senderId, recipient: receiverId, status: "accepted" },
        { requester: receiverId, recipient: senderId, status: "accepted" },
      ],
    });

    if (!isFriend) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: "You can only access messages with users on your friends list.",
      });
    }

    const conversations = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: 1 })
      .select("-password -updatedAt -__v");

    return res.status(200).json({
      success: true,
      message: "Conversation messages fetched successfully",
      status: 200,
      conversations: conversations || [],
    });
  } catch (error: any) {
    console.log(error);
    const statusCode =
      error.name === "ValidationError" || error.name === "CastError"
        ? 400
        : error.code === 11000
          ? 409
          : 500;
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: error.message || "Internal Server Error",
    });
  }
};

const sendMessage = async (req: Request, res: Response) => {
  try {
    const {
      message,
      mediaUrl: clientMediaUrl,
      mediaType: clientMediaType,
      isEncrypted,
      ciphertext,
      iv,
      authTag,
      ratchetHeader,
      x3dhHeader,
      mediaKeyCiphertext,
    } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user?._id;
    const file = req.file;
    let mediaUrl = clientMediaUrl || "";
    let mediaType: "image" | "video" | "audio" | "gif" | "" = clientMediaType || "";
    let mediathumbnailUrl = "";

    const hasPayload = isEncrypted ? Boolean(ciphertext) : Boolean(message || file || clientMediaUrl);

    if (!hasPayload || !receiverId || !senderId) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Message payload, receiverId, and senderId are required",
      });
    }

    // Verify friendship before allowing message send
    const isFriend = await Friendship.exists({
      $or: [
        { requester: senderId, recipient: receiverId, status: "accepted" },
        { requester: receiverId, recipient: senderId, status: "accepted" },
      ],
    });

    if (!isFriend) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: "You can only message users on your friends list.",
      });
    }

    if (file) {
      if (!hasImagekitConfig()) {
        return res.status(503).json({
          success: false,
          status: 503,
          message: "Storage Service is not available, try again later.",
        });
      }
      // upload media file
      const url = await uploadChatMedia(file);
      if (!url) {
        return res.status(503).json({
          success: false,
          status: 503,
          message: "Media upload failed, try again later.",
        });
      }

      mediaUrl = url?.url ?? "";
      if (file.mimetype.startsWith("image/")) {
        mediaType = file.mimetype.includes("gif") ? "gif" : "image";
      } else if (file.mimetype.startsWith("video/")) {
        mediaType = "video";
        mediathumbnailUrl = url?.thumbnailUrl ?? "";
      } else if (file.mimetype.startsWith("audio/")) {
        mediaType = "audio";
      }
    }

    const receiverSocketId = getRecieverSocketId(receiverId);
    const initialStatus = receiverSocketId ? "delivered" : "sent";
    const deliveredAt = receiverSocketId ? new Date() : undefined;

    const newMessage = new Message({
      senderId,
      receiverId,
      message: message || "",
      isEncrypted: Boolean(isEncrypted),
      ciphertext: ciphertext || "",
      iv: iv || "",
      authTag: authTag || "",
      ratchetHeader: ratchetHeader || undefined,
      x3dhHeader: x3dhHeader || undefined,
      mediaKeyCiphertext: mediaKeyCiphertext || "",
      mediaUrl: mediaUrl || "",
      mediaType: mediaType || undefined,
      thumbnailUrl: mediathumbnailUrl || req.body.thumbnailUrl || "",
      mediaSize: req.body.mediaSize || undefined,
      mediaDuration: req.body.mediaDuration || undefined,
      status: initialStatus,
      deliveredAt,
    });
    await newMessage.save();

    // Realtime Socket.IO emission to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new:message", newMessage);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      status: 201,
      newMessage,
    });
  } catch (error: any) {
    console.log(error);
    const statusCode =
      error.name === "ValidationError" || error.name === "CastError"
        ? 400
        : error.code === 11000
          ? 409
          : 500;
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: error.message || "Internal Server Error",
    });
  }
};

/**
 * Marks unread messages in a conversation as seen/read.
 */
const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const otherUserId = req.params.senderId;
    const loggedInUserId = req.user?._id;

    if (!otherUserId || !loggedInUserId) {
      return res.status(400).json({
        success: false,
        message: "Sender and receiver IDs are required",
      });
    }

    const readAt = new Date();
    const result = await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: loggedInUserId,
        status: { $in: ["sent", "delivered"] },
      },
      {
        $set: {
          status: "seen",
          readAt,
        },
      }
    );

    // Notify the other user via Socket.IO so their ticks turn double-blue
    const otherUserSocketId = getRecieverSocketId(otherUserId);
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("message:read", {
        conversationUserId: loggedInUserId.toString(),
        readAt,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/**
 * Soft-deletes a message (Tombstone pattern).
 */
const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const loggedInUserId = req.user?._id;

    if (!messageId || !loggedInUserId) {
      return res.status(400).json({
        success: false,
        message: "Message ID is required",
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender can delete for everyone
    if (message.senderId.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.message = "This message was deleted";
    message.ciphertext = "";
    message.mediaUrl = "";
    message.thumbnailUrl = "";
    message.mediaKeyCiphertext = "";
    await message.save();

    // Broadcast deletion to both sender and receiver
    const receiverSocketId = getRecieverSocketId(message.receiverId.toString());
    const senderSocketId = getRecieverSocketId(message.senderId.toString());

    const deletedPayload = {
      messageId: message._id.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      isDeleted: true,
      message: "This message was deleted",
    };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message:deleted", deletedPayload);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("message:deleted", deletedPayload);
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      updatedMessage: message,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/**
 * Returns a short-lived ImageKit auth token for direct client-side uploads.
 */
const getUploadAuth = (req: Request, res: Response) => {
  try {
    if (!hasImagekitConfig()) {
      return res.status(503).json({
        success: false,
        status: 503,
        message: "Storage service not available.",
      });
    }
    const params = getAuthParams();
    return res.status(200).json({ success: true, ...params });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  getUploadAuth,
};

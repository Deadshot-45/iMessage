import { Request, Response } from "express";
import Message from "../models/message.model.js";
import { hasImagekitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getRecieverSocketId, io } from "../lib/socket.js";

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

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
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
          lastMessage: {
            message: "$lastMessage.message",
            createdAt: "$lastMessage.createdAt",
            mediaUrl: "$lastMessage.mediaUrl",
            mediaType: "$lastMessage.mediaType",
          },
        },
      },
    ]);
    if (!conversations || conversations.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No conversations found",
        status: 200,
        conversations: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      status: 200,  
      conversations,
    });
  } catch (error: any) {
    console.log(error);
    const statusCode = error.name === "ValidationError" || error.name === "CastError" ? 400 : (error.code === 11000 ? 409 : 500);
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

    const conversations = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: 1 })
      .select("-clerkId -password -updatedAt -__v");

    if (!conversations || conversations.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No messages found in this conversation",
        status: 200,
        conversations: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation messages fetched successfully",
      status: 200,
      conversations,
    });
  } catch (error: any) {
    console.log(error);
    const statusCode = error.name === "ValidationError" || error.name === "CastError" ? 400 : (error.code === 11000 ? 409 : 500);
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: error.message || "Internal Server Error",
    });
  }
};

const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user?._id;
    const file = req.file;
    let mediaUrl = "";
    let mediaType: "image" | "video" | "" = "";
    let mediathumbnailUrl = "";

    if (!message || !receiverId || !senderId) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "All fields are required",
      });
    }

    if (file) {
      if (!hasImagekitConfig) {
        return res.status(500).json({
          success: false,
          status: 503,
          message: "Storage Service is not available, try again later.",
        });
      }
      // here we upload media file
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
        mediaType = "image";
      } else if (file.mimetype.startsWith("video/")) {
        mediaType = "video";
        mediathumbnailUrl = url?.thumbnailUrl ?? "";
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      mediaUrl,
      mediaType: mediaType || undefined,
      thumbnailUrl: mediathumbnailUrl,
    });
    await newMessage.save();

    // realtime Socket.Io
    const receiverSocketId = getRecieverSocketId(receiverId);
    // send message only if the user is online
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
    const statusCode = error.name === "ValidationError" || error.name === "CastError" ? 400 : (error.code === 11000 ? 409 : 500);
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: error.message || "Internal Server Error",
    });
  }
};

export { getConversations, getMessages, sendMessage };

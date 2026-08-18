// backend/src/controllers/friend.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import Friendship from "../models/friendship.model.js";
import User from "../models/user.model.js";
import { getRecieverSocketId, io } from "../lib/socket.js";

export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    // Find all accepted friendships where user is requester OR recipient
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    }).lean();

    const friendIds = friendships.map((f) =>
      f.requester.toString() === userId.toString() ? f.recipient : f.requester,
    );

    const friends = await User.find({ _id: { $in: friendIds } })
      .select("username fullName email profilePic")
      .lean();

    return res.status(200).json({
      success: true,
      friends,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const requests = await Friendship.find({
      recipient: userId,
      status: "pending",
    })
      .populate("requester", "username fullName email profilePic")
      .lean();

    return res.status(200).json({
      success: true,
      requests: requests || [],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const requestFriend = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const { targetUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!targetUserId) {
      return res
        .status(400)
        .json({ success: false, message: "Target user ID is required" });
    }

    if (userId.toString() === targetUserId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot send a friend request to yourself",
        });
    }

    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: targetUserId },
        { requester: targetUserId, recipient: userId },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === "accepted") {
        return res
          .status(400)
          .json({ success: false, message: "You are already friends" });
      } else if (existingFriendship.status === "pending") {
        if (existingFriendship.requester.toString() === userId.toString()) {
          return res
            .status(400)
            .json({ success: false, message: "Friend request already sent" });
        } else {
          return res
            .status(400)
            .json({
              success: false,
              message: "Friend request already received from this user",
            });
        }
      } else if (existingFriendship.status === "declined") {
        existingFriendship.requester = userId;
        existingFriendship.recipient = new mongoose.Types.ObjectId(targetUserId);
        existingFriendship.status = "pending";
        await existingFriendship.save();

        const populatedReq = await Friendship.findById(existingFriendship._id)
          .populate("requester", "username fullName email profilePic")
          .lean();

        const recipientSocketId = getRecieverSocketId(targetUserId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("friend:request_received", populatedReq);
        }

        return res
          .status(200)
          .json({ success: true, message: "Friend request sent successfully" });
      } else if (existingFriendship.status === "blocked") {
        return res
          .status(400)
          .json({ success: false, message: "Cannot send friend request" });
      }
    }

    const newFriendship = new Friendship({
      requester: userId,
      recipient: targetUserId,
      status: "pending",
    });

    await newFriendship.save();

    const populatedReq = await Friendship.findById(newFriendship._id)
      .populate("requester", "username fullName email profilePic")
      .lean();

    const recipientSocketId = getRecieverSocketId(targetUserId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("friend:request_received", populatedReq);
    }

    return res
      .status(201)
      .json({ success: true, message: "Friend request sent successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const { requestId } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!requestId) {
      return res
        .status(400)
        .json({ success: false, message: "Request ID is required" });
    }

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const friendship = await Friendship.findById(requestId);

    if (!friendship) {
      return res
        .status(404)
        .json({ success: false, message: "Friend request not found" });
    }

    if (friendship.recipient.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to respond to this friend request",
        });
    }

    friendship.status = status;
    await friendship.save();

    // Real-time notification on accept
    if (status === "accepted" && req.user) {
      const requesterId = friendship.requester.toString();
      const requesterSocketId = getRecieverSocketId(requesterId);
      if (requesterSocketId) {
        const newFriendDetails = {
          _id: req.user._id,
          username: req.user.username,
          fullName: req.user.fullName,
          email: req.user.email,
          profilePic: req.user.profilePic,
        };
        io.to(requesterSocketId).emit("friend:accepted", {
          friend: newFriendDetails,
        });
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Friend request responded successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFriend = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const { userIdToRemove } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!userIdToRemove) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    if (userId.toString() === userIdToRemove) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot remove yourself" });
    }

    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: userIdToRemove },
        { requester: userIdToRemove, recipient: userId },
      ],
    });

    if (!friendship) {
      return res
        .status(404)
        .json({ success: false, message: "Friendship not found" });
    }

    await friendship.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Friend removed successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

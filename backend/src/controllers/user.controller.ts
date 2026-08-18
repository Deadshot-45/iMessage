import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Friendship from "../models/friendship.model.js";

const getUsers = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?._id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized",
      });
    }

    const userId = new mongoose.Types.ObjectId(loggedInUserId);

    // Retrieve only accepted friendships
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    }).lean();

    const friendIds = friendships.map((f) =>
      f.requester.toString() === userId.toString() ? f.recipient : f.requester,
    );

    const users = await User.find({ _id: { $in: friendIds } })
      .select("username fullName email profilePic")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Friends fetched successfully",
      status: 200,
      users: users || [],
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

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || "").trim();
    const loggedInUserId = req.user?._id;

    if (!loggedInUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!query || query.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 3 characters",
      });
    }

    const userId = new mongoose.Types.ObjectId(loggedInUserId);

    // Exact or prefix match only; limit results to 10 to avoid scraping
    const matchedUsers = await User.find({
      _id: { $ne: userId },
      $or: [
        { username: { $regex: `^${query}`, $options: "i" } },
        { email: query.toLowerCase() },
        { fullName: { $regex: query, $options: "i" } },
      ],
    })
      .select("username fullName email profilePic")
      .limit(10)
      .lean();

    if (matchedUsers.length === 0) {
      return res.status(200).json({ success: true, users: [] });
    }

    // Enrich matched users with friendship status
    const userIds = matchedUsers.map((u) => u._id);
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, recipient: { $in: userIds } },
        { requester: { $in: userIds }, recipient: userId },
      ],
    }).lean();

    const enrichedUsers = matchedUsers.map((targetUser) => {
      const friendship = friendships.find(
        (f) =>
          (f.requester.toString() === userId.toString() &&
            f.recipient.toString() === targetUser._id.toString()) ||
          (f.requester.toString() === targetUser._id.toString() &&
            f.recipient.toString() === userId.toString()),
      );

      let relationship = "none";
      let requestId = undefined;

      if (friendship) {
        if (friendship.status === "accepted") {
          relationship = "friends";
        } else if (friendship.status === "pending") {
          relationship =
            friendship.requester.toString() === userId.toString()
              ? "pending_sent"
              : "pending_received";
          requestId = friendship._id;
        } else if (friendship.status === "declined") {
          relationship = "declined";
        } else if (friendship.status === "blocked") {
          relationship = "blocked";
        }
      }

      return {
        ...targetUser,
        relationship,
        requestId,
      };
    });

    return res.status(200).json({ success: true, users: enrichedUsers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { getUsers };

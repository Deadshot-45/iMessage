import { Request, Response } from "express";
import User from "../models/user.model.js";

const getUsers = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?.id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized",
      });
    }

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select(" -password -clerkId ");

    if (!users || users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users found",
        status: 200,
        users: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      status: 200,
      users,
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

export { getUsers };

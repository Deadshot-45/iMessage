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

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      status: 200,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

export { getUsers };

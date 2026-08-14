import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import type { NextFunction, Request, Response } from "express";

const checkUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized", success: false, status: 401 });
    }

    const userObj = typeof req.user.toObject === "function" ? req.user.toObject() : req.user;

    res
      .status(200)
      .json({
        ...userObj,
        message: "User is verified",
        success: true,
        status: 200,
      });
  } catch (error: any) {
    const statusCode = error.name === "ValidationError" || error.name === "CastError" ? 400 : (error.code === 11000 ? 409 : 500);
    res
      .status(statusCode)
      .json({ message: error.message || "Internal server error", success: false, status: statusCode });
  }
};

const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized", success: false, status: 401 });
    }

    console.log("user", userId);

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res
        .status(200)
        .json({ message: "User not found", success: false, status: 200 });
    }

    console.log("mongo user", user);

    // Attaching user to req
    req.user = user;
    next();
  } catch (error: any) {
    console.log(error);
    const statusCode = error.name === "ValidationError" || error.name === "CastError" ? 400 : (error.code === 11000 ? 409 : 500);
    res
      .status(statusCode)
      .json({ message: error.message || "Error in server side", success: false, status: statusCode });
  }
};

export { checkUser, protectRoute };

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

    res
      .status(200)
      .json({ message: "User is verified", success: true, status: 200 });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", success: false, status: 500 });
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
        .status(404)
        .json({ message: "User not found", success: false, status: 404 });
    }

    console.log("mongo user", user);

    // Attaching user to req
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error in server side", success: false, status: 500 });
  }
};

export { checkUser, protectRoute };

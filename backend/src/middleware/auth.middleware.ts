import User from "../models/user.model.js";
import { verifyToken } from "../lib/jwt.js";
import type { NextFunction, Request, Response } from "express";

const checkUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized", success: false, status: 401 });
    }

    const userObj =
      typeof req.user.toObject === "function" ? req.user.toObject() : req.user;

    res.status(200).json({
      ...userObj,
      message: "User is verified",
      success: true,
      status: 200,
    });
  } catch (error: any) {
    const statusCode =
      error.name === "ValidationError" || error.name === "CastError"
        ? 400
        : error.code === 11000
          ? 409
          : 500;
    res.status(statusCode).json({
      message: error.message || "Internal server error",
      success: false,
      status: statusCode,
    });
  }
};

const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Extract token from Cookie or Authorization header
    let token = req.cookies?.jwt;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided", success: false });
    }

    // 2. Verify JWT signature
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid Token", success: false });
    }

    // 3. Find User
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ message: "Internal server error in auth verification", success: false });
  }
};

export { checkUser, protectRoute };

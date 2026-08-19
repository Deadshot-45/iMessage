import jwt from "jsonwebtoken";
import type { Response } from "express";
import { redisCache } from "./redis.js";

const JWT_SECRET = process.env.JWT_SECRET || "imessage_super_secret_jwt_key_2026";
const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const generateToken = async (userId: string, res?: Response): Promise<string> => {
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  // Cache token in Redis for session tracking
  await redisCache.set(`session:${userId}`, token, TOKEN_EXPIRY_SECONDS);

  if (res) {
    res.cookie("jwt", token, {
      maxAge: TOKEN_EXPIRY_SECONDS * 1000,
      httpOnly: true, // prevent XSS attacks
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return token;
};

export const clearToken = async (userId?: string, res?: Response) => {
  if (userId) {
    await redisCache.del(`session:${userId}`);
  }

  if (res) {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
};

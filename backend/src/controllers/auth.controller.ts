import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken, clearToken } from "../lib/jwt.js";
import { redisCache } from "../lib/redis.js";
import type { Request, Response } from "express";

const getDeterministicColor = (name: string) => {
  const colors = [
    "#ff2d55",
    "#5856d6",
    "#34c759",
    "#007aff",
    "#af52de",
    "#ff9500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const checkUsername = async (req: Request, res: Response) => {
  try {
    const rawUsername = String(req.query.username || "").trim();

    if (!rawUsername) {
      return res.status(400).json({
        available: false,
        message: "Username is required",
        success: false,
      });
    }

    if (rawUsername.length < 3) {
      return res.status(400).json({
        available: false,
        message: "Username must be at least 3 characters",
        success: false,
      });
    }

    if (rawUsername.length > 30) {
      return res.status(400).json({
        available: false,
        message: "Username cannot exceed 30 characters",
        success: false,
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(rawUsername)) {
      return res.status(400).json({
        available: false,
        message: "Username can only contain letters, numbers, underscores, dashes, and periods",
        success: false,
      });
    }

    const cleanUsername = rawUsername.toLowerCase();

    // 1. Check Redis Cache
    const cachedStatus = await redisCache.get(`un_avail:${cleanUsername}`);
    if (cachedStatus !== null) {
      const isAvailable = cachedStatus === "true";
      return res.status(200).json({
        available: isAvailable,
        message: isAvailable ? "Username is available" : "Username is already taken",
        success: true,
      });
    }

    // 2. Query Database
    const existingUser = await User.exists({ username: cleanUsername });
    const isAvailable = !existingUser;

    // 3. Cache result in Redis for 30 seconds
    await redisCache.set(`un_avail:${cleanUsername}`, isAvailable ? "true" : "false", 30);

    return res.status(200).json({
      available: isAvailable,
      message: isAvailable ? "Username is available" : "Username is already taken",
      success: true,
    });
  } catch (error: any) {
    console.error("Check Username Error:", error);
    return res.status(500).json({
      available: false,
      message: "Error checking username availability",
      success: false,
    });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields (Full Name, Username, Email, Password)",
        success: false,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        success: false,
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return res.status(400).json({
          message: "An account with this email already exists",
          success: false,
        });
      }
      return res.status(400).json({
        message: "This username is already taken",
        success: false,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      avatarColor: getDeterministicColor(fullName.trim()),
    });

    await newUser.save();

    // Invalidate Redis username availability cache
    await redisCache.set(`un_avail:${cleanUsername}`, "false", 300);

    // Generate JWT token & set cookie
    const token = await generateToken(String(newUser._id), res);

    const userObj = {
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
      avatarColor: newUser.avatarColor,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      ...userObj,
      token,
      message: "Account created successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: error.message || "Internal server error during registration",
      success: false,
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Please provide both identifier (email/username) and password",
        success: false,
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find user with password field
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    }).select("+password");

    if (!user || !user.password) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Generate token & set cookie
    const token = await generateToken(String(user._id), res);

    const userObj = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      avatarColor: user.avatarColor || getDeterministicColor(user.fullName),
      createdAt: user.createdAt,
    };

    res.status(200).json({
      ...userObj,
      token,
      message: "Signed in successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Signin Error:", error);
    res.status(500).json({
      message: error.message || "Internal server error during login",
      success: false,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id ? String(req.user._id) : undefined;
    await clearToken(userId, res);

    res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Logout Error:", error);
    res.status(500).json({
      message: "Internal server error during logout",
      success: false,
    });
  }
};

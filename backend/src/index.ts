import "dotenv/config";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import connection from "./lib/db.js";
import job from "./lib/cron.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.route.js";
import e2eeRoutes from "./routes/e2ee.route.js";
import { app, server, isOriginAllowed } from "./lib/socket.js";

const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.get("/health", (req: Request, res: Response) => {
  res.json({ message: "OK", success: true });
});
// Primary API Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/e2ee", e2eeRoutes);

// Compatibility Alias (in case client cached double prefix)
app.use("/api/api/e2ee", e2eeRoutes);
app.use("/api/api/auth", authRoutes);
app.use("/api/api/message", messageRoutes);
app.use("/api/api/users", userRoutes);
app.use("/api/api/friends", friendRoutes);

app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Chat App Backend API is running with TypeScript!" });
});

// Serve Frontend Static Assets in Production
const frontendDist = path.join(process.cwd(), "..", "frontend", "dist");
const publicDir = path.join(process.cwd(), "public");

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("/*splat", (req: Request, res: Response) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get("/*splat", (req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
} else {
  console.log(
    "Static files directory not found. Defaulting / to API welcome message.",
  );
  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Chat App Backend API is running with TypeScript!" });
  });
}

// Start the server and listen to the socket.io
server.listen(PORT, async () => {
  await connection();
  console.log(`Server is running on port ${PORT}`);
  if (process.env.NODE_ENV === "production" || process.env.RENDER === "true") {
    job.start();
  }
});

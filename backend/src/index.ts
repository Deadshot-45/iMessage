import "dotenv/config";
import express, { Request, Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import connection from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import job from "./lib/cron.js";
import clerkWebhook from "./weebhooks/clerk.webhooks.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk middleware
app.use(clerkMiddleware());

// API Routes
app.get("/health", (req: Request, res: Response) => {
  res.json({ message: "OK", success: true });
});
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);
app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Chat App Backend API is running with TypeScript!" });
});

// Serve Frontend Static Assets in Production
const frontendDist = path.join(process.cwd(), "..", "frontend", "dist");
const publicDir = path.join(process.cwd(), "public");

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
} else {
  console.log("Static files directory not found. Defaulting / to API welcome message.");
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

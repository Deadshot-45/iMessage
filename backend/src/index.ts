import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

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

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Chat App Backend API is running with TypeScript!" });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ message: "OK", success: true });
});

app.listen(PORT, async () => {
  await connection();
  console.log(`Server is running on port ${PORT}`);
});

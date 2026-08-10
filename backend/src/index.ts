import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Chat App Backend API is running with TypeScript!" });
});

// Database Connection & Server Startup
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatapp";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    // Still start server even if DB connection fails for local development convenience
    app.listen(PORT, () => {
      console.log(
        `Server started on port ${PORT} (without database connection)`,
      );
    });
  });

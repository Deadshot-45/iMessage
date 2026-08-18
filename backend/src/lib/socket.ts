import express from "express";
import { Server, Socket } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL;

export const isOriginAllowed = (origin: string | undefined): boolean => {
  if (
    process.env.MODE === "development" ||
    process.env.NODE_ENV === "development"
  ) {
    return true;
  }
  if (!origin) return true;
  const allowedOrigins = [CLIENT_URL];
  return allowedOrigins.includes(origin);
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false); // Pass false instead of throwing error to match standard cors behaviors
      }
    },
    credentials: true,
  },
});

const getRecieverSocketId = (userId: string) => {
  return userSocketMap[userId];
};

const userSocketMap: Record<string, string> = {};

io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  const userId = socket.handshake.query.userId as string;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} is online`);
  }

  io.emit("online", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    if (userId && userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
      console.log(`User ${userId} is offline`);
      io.emit("online", Object.keys(userSocketMap));
    }
  });
});

export { server, app, io, getRecieverSocketId, userSocketMap };

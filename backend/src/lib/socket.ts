import express from "express";
import { Server, Socket } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL;

export const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  const allowedOrigins = [
    CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ];
  return (
    allowedOrigins.includes(origin) ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("http://192.168.") ||
    origin.startsWith("http://10.")
  );
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

  //socket.on("disconnect", () => {
  //  console.log(`User disconnected: ${socket.id}`);
  //  delete userSocketMap[userId];
  //  console.log(`User ${userId} is offline`);
  //  io.emit("online", Object.keys(userSocketMap));
  //});

  //socket.on("join", (roomId: string) => {
  //  console.log(`User ${socket.id} joined room ${roomId}`);
  //  socket.join(roomId);
  //});

  socket.on("message", (data: { roomId: string; message: string }) => {
    console.log(`Message in room ${data.roomId}: ${data.message}`);
    io.to(data.roomId).emit("message", data.message);
  });

  socket.on("new:message", (data: { userId: string; message: string }) => {
    console.log(`New message from ${data.userId}: ${data.message}`);
    const receiverSocketId = getRecieverSocketId(data.userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new:message", data);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

export { server, app, io, getRecieverSocketId, userSocketMap };

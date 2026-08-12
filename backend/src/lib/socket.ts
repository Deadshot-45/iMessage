import express from "express";
import { Server, Socket } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL;

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
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

  //socket.on("message", (data: { roomId: string; message: string }) => {
  //  console.log(`Message in room ${data.roomId}: ${data.message}`);
  //  io.to(data.roomId).emit("message", data.message);
  //});

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

export { server, app, io, getRecieverSocketId, userSocketMap };

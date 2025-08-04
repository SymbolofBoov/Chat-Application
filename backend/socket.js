// socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express(); // This will be attached to the server later

const server = http.createServer(); // Create server without app for modularity

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`✅ User connected: ${userId} (${socket.id})`);
  } else {
    console.warn("⚠️ Socket connection missing userId");
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(`❌ User disconnected: ${userId}`);
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { app, io, server };
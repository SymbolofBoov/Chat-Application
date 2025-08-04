// index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import { server, app } from "./socket.js"; // ✅ Use app from socket.js
import connectDB from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 8081;

// 🔍 Debug: Log incoming request origin
app.use((req, res, next) => {
  console.log("🔍 Incoming Origin:", req.headers.origin);
  next();
});

// ✅ CORS Configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Handle preflight requests

// ✅ Standard Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

// ⚠️ Fallback Route
app.use("*", (req, res) => {
  console.log("❌ Unknown route hit:", req.originalUrl);
  res.status(404).json({ message: "Route not found" });
});

// ✅ Attach Express app to server
server.on("request", app); // Ensures Express routes are served via same server

// 🚀 Start Server + Connect DB
server.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log("🔑 JWT Secret:", process.env.JWT_SECRET_KEY);
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
  }
});
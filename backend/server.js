import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http"; // ✅ needed for Socket.IO
import { Server } from "socket.io"; // ✅ needed for Socket.IO

import userRoutes from "./routes/userRoute.js";
import connectDB from "./utils/connectDB.js";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlist from "./routes/wishlistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import adminNotifications from "./routes/adminNotificationRoutes.js";

dotenv.config(); // ✅ Load .env before using it
connectDB(); // ✅ Call only after dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", userRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/wishlist", wishlist);

app.use("/api/payment", paymentRoutes);

app.use("/api/coupons", couponRoutes);

app.use("/api/otp", otpRoutes);

app.use("/api/save-address", addressRoutes);

app.use("/api/review", reviewRoutes);

app.use("/api/admin/banners", bannerRoutes);

app.use("/api/admin/notifications", adminNotifications);

// ------------------- SOCKET.IO SETUP -------------------
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});



io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
  
});

// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

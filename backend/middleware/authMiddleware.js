import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// ✅ Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
  try {
    // Try to get token from cookie first, then from Authorization header
    const token =
      req.cookies.authToken || // ✅ frontend cookie name
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

// ✅ Middleware to allow only admins
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};

// ✅ Get current authenticated user
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user; // Already populated by protect middleware
    res.status(200).json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

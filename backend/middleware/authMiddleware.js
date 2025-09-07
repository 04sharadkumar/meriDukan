import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


// ✅ Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('JWT Error:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
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

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user; // Already populated by middleware
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};






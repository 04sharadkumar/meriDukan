import express from "express";
import Notification from "../models/NotificationModel.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

// ---------------- GET UNREAD COUNT ----------------
// GET /api/admin/notifications/count
router.get("/count", protect, adminOnly, async (req, res) => {
  try {
    // Total unread notifications
    const unreadCount = await Notification.countDocuments({ isRead: false });

    // Optionally, total notifications as well
    const totalCount = await Notification.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        unread: unreadCount,
        total: totalCount,
        
      },
      message: "Notification counts fetched successfully",
    });
  } catch (err) {
    console.error("Notification count error:", err);
    res.status(500).json({
      success: false,
      data: { unread: 0, total: 0 },
      message: "Failed to fetch notification counts",
    });
  }
});


// ---------------- GET ALL NOTIFICATIONS WITH PAGINATION ----------------
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments();

    res.json({
      success: true,
      notifications,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- MARK SINGLE AS READ ----------------
router.put("/:id/read", protect, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
});

// ---------------- MARK ALL AS READ ----------------
router.put("/read-all", protect, adminOnly, async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to mark all" });
  }
});

export default router;

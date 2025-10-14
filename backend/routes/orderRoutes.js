import express from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getRecentOrders,
  createOrder,
  placeCashOrder,
  updateOrderStatus,
  updateDeliveryStatus,
  getTotalOrders,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// -------------------- USER ROUTES --------------------
// Place a new order
router.post("/place", protect, placeOrder);

// Get orders of logged-in user
router.get("/my-orders", protect, getMyOrders);

// Place cash-on-delivery order
router.post("/cash", protect, placeCashOrder);

// Create order (admin or custom)
router.post("/create", protect, createOrder);

// Get recent orders (admin or dashboard)
router.get("/totalOrder", protect, adminOnly, getTotalOrders);

router.get("/getRecentOrders", protect, adminOnly, getRecentOrders);

// -------------------- ADMIN ROUTES --------------------
// Get all orders
router.get("/getAllOrders", protect, adminOnly, getAllOrders);

// Update order payment/status
router.put(
  "/updateOrderStatus/:orderId",
  protect,
  adminOnly,
  updateOrderStatus
);

// Update delivery status
router.put(
  "/updateDelivery/:deliveryId",
  protect,
  adminOnly,
  updateDeliveryStatus
);

export default router;

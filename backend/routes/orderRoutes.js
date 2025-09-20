import express from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getRecentOrders,
  createOrder,
  placeCashOrder
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();


// User routes
router.post("/place", protect, placeOrder);  //Done

router.get("/my-orders", protect, getMyOrders);  //Done

router.get('/totalOrder',getRecentOrders);

router.get('/getRecentOrders',getRecentOrders);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllOrders);



router.post("/create", protect, createOrder);

router.post("/cash", protect, placeCashOrder);


export default router;

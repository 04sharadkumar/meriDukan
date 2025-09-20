import express from "express";
import { createCoupon, validateCoupon } from "../controllers/couponController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, adminOnly, createCoupon);

router.post("/validate", protect, validateCoupon);

export default router;



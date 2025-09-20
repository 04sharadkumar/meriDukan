import express from "express";
import { createCheckoutSession, verifypaymentSession } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🟢 Step 4 → Stripe Checkout start
router.post("/create-checkout-session", protect, createCheckoutSession);

// 🟢 Step 6 → Stripe se wapas aane ke baad verify
router.post("/verify", protect, verifypaymentSession);

export default router;

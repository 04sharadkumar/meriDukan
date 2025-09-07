import express from "express";
import { protect } from "../middleware/protect.js";
import { addAddress,getAddress  } from "../controllers/addressController.js";

const router = express.Router();

// POST /api/user/address
router.post("/address", protect, addAddress);

router.get("/address", protect, getAddress);

export default router;

import express from "express";
import multer from "multer";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { getCloudinaryStorage } from "../utils/cloudinary.js"; // same as used in user routes

const router = express.Router();

// ✅ Cloudinary storage for banners
const bannerUpload = multer({ storage: getCloudinaryStorage("banners") });

// Routes
router.get("/", getBanners);

// Upload image → stored in Cloudinary under "banners" folder
router.post("/", bannerUpload.single("image"), createBanner);

// Update banner → can also upload new image
router.put("/:id", bannerUpload.single("image"), updateBanner);

// Delete banner
router.delete("/:id", deleteBanner);

export default router;

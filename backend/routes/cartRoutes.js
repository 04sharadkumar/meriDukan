import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  moveWishlistToCart
  
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addToCart);
router.get("/", protect, getCart);
router.put("/:itemId", protect, updateCartItem);
router.delete("/single/:itemId", protect, removeFromCart);
router.delete("/clearAll", protect, clearCart);

//wishlist page me move all to cart ke liye h
router.post("/wishlist/move-to-cart", protect, moveWishlistToCart);

export default router;

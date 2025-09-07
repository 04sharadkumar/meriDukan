import express from 'express';
import {
  getWishlist,
  addToWishlist,
  deleteWishlistItem
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/', protect, addToWishlist);
router.delete('/', protect, deleteWishlistItem);

export default router;


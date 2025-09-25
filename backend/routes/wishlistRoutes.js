import express from 'express';
import {
  getWishlist,
  addToWishlist,
  deleteWishlistItem,
  clearWishlist,
  toggleWishlistItem,
  removeMultipleWishlistItems,
  isProductInWishlist
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/', protect, addToWishlist);
router.delete('/:id', protect, deleteWishlistItem);   // delete single
router.delete('/', protect, clearWishlist);           // delete all
router.post('/toggle', protect, toggleWishlistItem);  // add/remove single toggle
router.post('/remove-multiple', protect, removeMultipleWishlistItems); // bulk delete
router.get('/check/:productId', protect, isProductInWishlist);          // check if in wishlist

export default router;

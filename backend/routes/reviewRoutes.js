import express from 'express';
import { addReview,getReviews,countAllReviews ,countProductReviews,getProductReviewStats,getTopRatedProducts} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();




router.get('/count', countAllReviews);

router.get('/stats/:productId', getProductReviewStats);

router.get('/count/:productId', countProductReviews);

// POST /api/reviews/:productId
router.post('/:productId', protect, upload.single('image'), addReview);

router.get('/top-rated', getTopRatedProducts); 

router.get('/:productId', getReviews); 



export default router;


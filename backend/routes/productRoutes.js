import express from "express";
import {
  getAllProducts,
  getProductById,
  addProductReview,
  totalProduct,
  recent,
  getFlashSaleProducts ,
  similarProduct
} from "../controllers/productController.js";

import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get('/',getAllProducts);

router.get('/totalProduct',totalProduct);

router.get('/allProduct/:id', getProductById);

router.get('/similar/:id',similarProduct);

router.post("/:id/reviews", protect, addProductReview);


router.get('/recent',recent);

router.get('/flash-sale',getFlashSaleProducts);


export default router;


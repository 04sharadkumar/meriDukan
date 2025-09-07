import express from "express";

import {addProduct,updateProduct,deleteProduct,getAdminDashboardStats,totalUser ,getAdminStats,exportOrdersToExcel,getTotalRevenue,deleteUser,getAllOrders } from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

import { updateOrderStatus } from "../controllers/orderController.js";

import { getMonthlyRevenue } from '../controllers/adminController.js';

import multer from "multer";
import { getCloudinaryStorage } from "../utils/cloudinary.js";
import upload from "../utils/upload.js";

import { getAllUsers } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Admin profile access check
router.get("/profile", protect, adminOnly, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

const productUpload = multer({ storage: getCloudinaryStorage('products') });

router.post('/products', protect, adminOnly, upload.array("images", 3), addProduct);

router.put('/Singleproducts/:id',protect,adminOnly,upload.array("images",3),updateProduct);

router.delete("/products/:id", protect, adminOnly, deleteProduct);

router.get("/dashboard", protect, adminOnly, getAdminDashboardStats);

router.get("/totalUser",totalUser);



router.get('/export-orders-excel', exportOrdersToExcel);

router.get("/totalRevenue", getTotalRevenue);


router.get('/monthly-revenue', getMonthlyRevenue);

router.get('/stats', protect, adminOnly, getAdminStats);

router.get('/getAllUsers', protect, adminOnly, getAllUsers);

router.delete('/deleteUser/:id', protect, adminOnly, deleteUser );

router.get('/getAllOrders', protect, adminOnly,getAllOrders)


router.put("/updateOrderStatus/:orderId", protect, adminOnly, updateOrderStatus);

export default router;



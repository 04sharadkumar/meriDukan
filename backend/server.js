import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoute.js';
import connectDB from './utils/connectDB.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 
import orderRoutes from './routes/orderRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import wishlist from './routes/wishlistRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from "./routes/couponRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import reviewRoutes from './routes/reviewRoutes.js';
import addressRoutes  from './routes/addressRoutes.js'
import bannerRoutes from "./routes/bannerRoutes.js";

dotenv.config(); // ✅ Load .env before using it
connectDB(); // ✅ Call only after dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Adjust origin for frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ This enables req.cookies

// Routes
app.get('/', (req, res) => {
  res.send('✅ Backend is running');
});

app.use('/api/auth', userRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/products', productRoutes);

app.use('/api/orders',orderRoutes);

app.use('/api/cart',cartRoutes)

app.use('/api/wishlist',wishlist)






app.use("/api/payment", paymentRoutes);

app.use("/api/coupons", couponRoutes);

app.use("/api/otp", otpRoutes);

app.use("/api/save-address", addressRoutes );


app.use("/api/review",reviewRoutes);

app.use("/api/admin/banners", bannerRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

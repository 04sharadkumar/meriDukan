// controllers/orderController.js
import Stripe from "stripe";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import Order from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, shippingInfo, paymentMethod, totalAmount } = req.body;

    if (!cartItems || !shippingInfo || !paymentMethod || !totalAmount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔐 User id protect middleware se aayega
    const userId = req.user._id;

    const order = await Order.create({
      user: userId,

      // 🛒 Items mapping
      orderItems: cartItems.map((item) => ({
        product: item.productId || null, // agar Product ref bhej rahe ho
        name: item.name,
        qty: item.qty,
        price: item.price,
        image: item.image || "",
      })),

      // 📍 Address
      shippingAddress: {
        name: shippingInfo.name,
        mobile: shippingInfo.mobile,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: shippingInfo.country || "India",
        postalCode: shippingInfo.pincode,
      },

      // 💳 Payment
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid",

      // 💰 Price
      totalPrice: totalAmount,
      totalAmount, // optional field bhi store ho jayega

      // 📦 Status
      isPaid: paymentMethod !== "COD",
      paidAt: paymentMethod !== "COD" ? new Date() : null,
      isDelivered: false,
      orderStatus: "Processing", // agar tum schema me add karna chahte ho
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to place order" });
  }
};

export const getMyOrders = async (req, res) => {
  
  try {

    const userId = req.user._id; // logged-in user ID from auth middleware

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.status(201).json(orders);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not fetch orders." });
  }
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "username email");
  res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  let { status } = req.body;

  try {
    // Convert status to lowercase to match enum
    status = status.toLowerCase();

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const count = await Order.countDocuments();

    res.status(200).json({
      success: true,
      totalOrder: count,
      recentOrders: recentOrders,
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};










//new 

export const createOrder = async (req, res) => {
  try {
    const { userEmail, address, products, payment } = req.body;

    if (!userEmail || !address || !products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const order = new Order({
      user: req.user.id, // middleware se aayega
      userEmail,
      address,
      products,
      payment,
      status: "pending", // default status
    });

    await order.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Order Create Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// orderController.js me ek naya controller function:
export const placeCashOrder = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { cartItems, shippingInfo, totalAmount } = req.body;

    
    
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: "No items in cart" });

    // ✅ Duplicate COD check

    const existingCODOrder = await Order.findOne({
      user: userId,
      paymentMethod: "Cash On Delivery",
      paymentStatus: "pending",
      totalPrice: totalAmount,
    });

    if (existingCODOrder) {
      return res.status(201).json({ success: true, message: " Cash On Delivery order already exists", order: existingCODOrder });
    }

    // ✅ Map products properly
    const orderItems = cartItems.map((i) => ({
      product: i.id || i._id || null, // Save product _id here
      name: i.name || "Unknown Product",
      qty: i.qty || i.quantity || 1,
      price: i.discountPrice && i.discountPrice > 0 ? i.discountPrice : i.price,
      image: i.image || "",
    }));

    const order = new Order({
      user: userId,
      orderItems,
      shippingAddress: shippingInfo,
      paymentMethod: "Cash On Delivery",
      paymentStatus: "pending",
      totalPrice: totalAmount,
      isPaid: false,
    });

    await order.save();

    res.status(201).json({ success: true, message: "Cash On Delivery Order placed successfully", order });
  } catch (error) {
    console.error("Cash On Delivery Order Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};




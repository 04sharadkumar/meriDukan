import Stripe from "stripe";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Order from "../models/orderModel.js";
import Delivery from "../models/deliveryModel.js";
import Product from "../models/productModel.js";
import Notification from "../models/NotificationModel.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const toObjectId = (id) => {
  try {
    return id ? new mongoose.Types.ObjectId(id) : null;
  } catch {
    return null;
  }
};
// -------------------------
// 🟢 CREATE CHECKOUT SESSION (Stripe)
// -------------------------
export const createCheckoutSession = async (req, res) => {
  try {
    // 1. Token verify karo
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 2️⃣ Get cart & shipping info
    const { cartItems, shippingInfo, totalAmount } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "No items in cart" });
    }

    // 3. Stripe session banao
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // ₹ → paise
        },
        quantity: item.qty,
      })),

      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,

      metadata: {
        userId,
        cartItems: JSON.stringify(
          cartItems.map((i) => ({
            product: toObjectId(i.productId || i.id || i._id),
            name: i.name,
            qty: i.qty,
            price: i.price,
            image: i.image || "",
          }))
        ),
        shippingInfo: JSON.stringify(shippingInfo || {}),
        totalAmount: totalAmount?.toString() || "0",
      },
    });

    const orderItems = cartItems.map(i => ({
      
      product: toObjectId(i.productId || i.id || i._id),
      name: i.name,
      qty: i.qty,
      price: i.price,
      image: i.image || "",
    }));

    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress: {
        name: shippingInfo.name,
        mobile: shippingInfo.mobile,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: shippingInfo.country || "India",
        postalCode: shippingInfo.pincode,
      },
      paymentMethod: "Stripe",
      paymentStatus: "paid",
      totalPrice: totalAmount,
      isPaid: true,
      orderStatus: "processing",
    });

    // 5️⃣ Decrease stock + low stock alert
   for (const item of cartItems) {
  const productId = item.productId || item.id || item._id;
  const product = await Product.findById(productId);
  if (product) {
    product.stock = Math.max(product.stock - item.qty, 0);
    
    await product.save();

    if (product.stock <= 5) {
      await Notification.create({
        type: "stock",
        message: `⚠️ Stock running low for ${product.name} (Only ${product.stock} left)`,
      });
    }
  }
}

    // 6️⃣ Create delivery document
    const delivery = await Delivery.create({ order: order._id });
    order.delivery = delivery._id;
    await order.save();

    // 7️⃣ Notify admin about new order
    await Notification.create({
      message: `🛍️ New order placed by ${req.user.username || req.user.email} (Order ID: ${order._id.toString().slice(-6)})`,
      type: "orders",
    });

    // 4. Response bhejna
    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------------
// 🟢 VERIFY PAYMENT SESSION (Stripe)
// -------------------------
export const verifypaymentSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId)
      return res
        .status(400)
        .json({ success: false, message: "Session ID missing" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.json({ success: false, message: "Payment not completed" });
    }

    // ✅ Check if order already exists
    const existingOrder = await Order.findOne({
      "paymentResult.id": session.payment_intent,
    });
    if (existingOrder) {
      return res.json({
        success: true,
        message: "Order already exists",
        order: existingOrder,
      });
    }

    // ✅ Create order same way as COD
    const orderItems = JSON.parse(session.metadata.cartItems).map((i) => ({
      product: i.id || null,
      name: i.name || "Unknown Product",
      qty: i.qty,
      price: i.price,
      image: i.image || "",
    }));

    const shippingInfo = JSON.parse(session.metadata.shippingInfo || "{}");

    const order = new Order({
      user: session.metadata.userId,
      orderItems: JSON.parse(session.metadata.cartItems).map((i) => ({
        product: i.id || null,
        name: i.name || "Unknown Product",
        qty: i.qty,
        price: i.price,
        image: i.image || "",
      })),
      shippingAddress: JSON.parse(session.metadata.shippingInfo || "{}"),
      paymentMethod: "Stripe",
      paymentStatus: "paid",
      paymentResult: {
        id: session.payment_intent,
        status: session.payment_status,
      },
      totalPrice:
        Number(session.metadata.totalAmount) || session.amount_total / 100,
      isPaid: true,
      paidAt: new Date(),
    });

    // ✅ Delivery create karo
    const delivery = await Delivery.create({ order: order._id });
    order.delivery = delivery._id;
    await order.save();

    await order.save();

    return res.json({
      success: true,
      message: "Order stored successfully",
      order,
    });
  } catch (error) {
    console.error("Stripe Verify Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// -------------------------
// 🟢 CREATE CASH ON DELIVERY ORDER (COD)  [Step 6]
// -------------------------
export const createCashOrder = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { cartItems, shippingInfo, totalAmount } = req.body;

    console.log(req.body);

    if (!cartItems || cartItems.length === 0)
      return res.status(400).json({ message: "No items in cart" });

    // ✅ Duplicate COD check
    const existingCODOrder = await Order.findOne({
      user: userId,
      paymentMethod: "Cash On Delivery",
      paymentStatus: "pending",
      totalPrice: totalAmount,
    });

    if (existingCODOrder) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Pending COD order already exists",
          order: existingCODOrder,
        });
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

    res
      .status(201)
      .json({
        success: true,
        message: "Cash On Delivery Order placed successfully",
        order,
      });
  } catch (error) {
    console.error("Cash On Delivery Order Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get logged-in user's payment history
// @route   GET /api/payment/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all orders of this user
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 }) // latest first
      .select("paymentMethod paymentStatus totalPrice createdAt"); // only required fields

    res.status(200).json({ payments: orders });
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({ message: "Server error" });
  }
};

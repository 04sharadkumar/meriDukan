import Stripe from "stripe";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Order from "../models/orderModel.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -------------------------
// 🟢 CREATE CHECKOUT SESSION (Stripe)
// -------------------------
export const createCheckoutSession = async (req, res) => {
  try {
    // 1. Token verify karo
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 2. Request body se data lo
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
            id: i.id,
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
    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID missing" });
    }

    // 1. Stripe se session fetch
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Payment status check
    if (session.payment_status === "paid") {
      // Save Order in DB
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

      await order.save();

      return res.json({
        success: true,
        message: "Order stored successfully",
        order,
      });
    }

    res.json({ success: false, message: "Payment not completed" });
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
    // 1. Token verify karo
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 2. Body se data
    const { cartItems, shippingInfo, totalAmount } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "No items in cart" });
    }

    // 3. Order create karo DB me
    const order = new Order({
      user: userId,

      orderItems: cartItems.map((i) => ({
        product: i.id || null,
        name: i.name || "Unknown Product",
        qty: i.qty,
        price: i.price,
        image: i.image || "",
      })),

      shippingAddress: shippingInfo,

      paymentMethod: "COD",
      paymentStatus: "pending",

      totalPrice: totalAmount,

      isPaid: false,
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Cash On Delivery Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Cash On Delivery Order Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

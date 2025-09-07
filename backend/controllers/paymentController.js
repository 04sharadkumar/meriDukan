import Stripe from "stripe";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Order from "../models/orderModel.js"

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    // 1. Token nikaalna (Authorization header se)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decode token
    const userId = decoded.id; // <-- ab backend khud userId nikaal lega

    // 2. Body se cartItems lena
    const { cartItems } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "No items in cart" });
    }

    // 3. Stripe checkout session create karna
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
          unit_amount: Math.round(item.price * 100), // ₹ to paise
        },
        quantity: item.qty,
      })),

      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,

      metadata: {
        userId: userId, // backend se secure userId
        cartItems: JSON.stringify(
          cartItems.map((i) => ({ id: i.id, qty: i.qty }))
        ),
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
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


export const verifypaymentSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID missing" });
    }

    // Stripe se session fetch karo
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Save order in DB
      const order = new Order({
        userId: session.metadata.userId,   // jo metadata me bheja tha
        items: JSON.parse(session.metadata.cartItems),
        shippingInfo: JSON.parse(session.metadata.shippingInfo),
        paymentMethod: "Card",
        totalAmount: session.amount_total / 100, // cents to INR
        paymentInfo: {
          id: session.payment_intent,
          status: session.payment_status,
        },
      });

      await order.save();

      return res.json({ success: true, message: "Order stored successfully", order });
    }

    res.json({ success: false, message: "Payment not completed" });
  } catch (error) {
    console.error("Stripe Verify Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

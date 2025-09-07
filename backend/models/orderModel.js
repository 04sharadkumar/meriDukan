// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 🧑‍💻 User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🛒 Items (Detailed + Simple merge)
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String, // for simple order
        qty: { type: Number, default: 1 },
        price: { type: Number, required: true },
        image: String,
      },
    ],

    // 📍 Address (Detailed + Simple merge)
    shippingAddress: {
      name: String, // from 2nd schema
      mobile: String, // from 2nd schema
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      country: { type: String, default: "India" },
      postalCode: String, // (pincode)
    },

    // 💳 Payment
    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay", "Stripe", "upi", "card", "cash"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // 🔐 Payment result (for online)
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    // 💰 Price / Amount
    totalPrice: { type: Number, required: true }, // for 1st schema
    totalAmount: { type: Number }, // for 2nd schema (optional)

    // 📦 Order Tracking
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);

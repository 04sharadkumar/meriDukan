import mongoose from "mongoose";
import Delivery from "./deliveryModel.js"; 

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        qty: { type: Number, default: 1 },
        price: { type: Number, required: true },
        image: String,
      },
    ],

    shippingAddress: {
      name: String,
      mobile: String,
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      country: { type: String, default: "India" },
      postalCode: String,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash On Delivery", "COD", "Razorpay", "Stripe", "upi", "card", "cash"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],  // ALWAYS lowercase
      default: "pending",
    },

    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    totalPrice: { type: Number, required: true },
    totalAmount: { type: Number },

    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    orderStatus: { type: String, default: "Processing" },

    delivery: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },
  },
  { timestamps: true }
);

orderSchema.pre("remove", async function (next) {
  if (this.delivery) await Delivery.findByIdAndDelete(this.delivery);
  next();
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);

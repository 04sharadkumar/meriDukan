import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",  // Link to Order
      required: true,
      unique: true,  // One delivery per order
    },

    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or separate DeliveryBoy model
      default: null,
    },

    currentStatus: {
      type: String,
      enum: ["Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Processing",
      required: true,
    },

    expectedDeliveryDate: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from creation
    },

    actualDeliveryDate: {
      type: Date,
      default: null,
    },

    trackingUpdates: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        location: { type: String, default: "" },
        remark: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Delivery || mongoose.model("Delivery", deliverySchema);

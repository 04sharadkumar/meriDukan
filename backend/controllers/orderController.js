import Stripe from "stripe";
import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Delivery from "../models/deliveryModel.js";
import Notification from "../models/NotificationModel.js";
import Product from "../models/productModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const toObjectId = (id) => {
  try {
    return id ? new mongoose.Types.ObjectId(id) : null;
  } catch {
    return null;
  }
};

// -------------------- CREATE / PLACE ORDER stripe --------------------
export const placeOrder = async (req, res) => {
  try {
    const {
      cartItems,
      shippingInfo,
      paymentMethod,
      totalAmount,
      paymentResult,
    } = req.body;
    if (!cartItems || !shippingInfo || !paymentMethod || !totalAmount)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    const userId = req.user._id;

    const orderItems = cartItems.map((item) => ({
      product: toObjectId(item.productId || item.id || item._id),
      name: item.name,
      qty: item.qty,
      price: item.price,
      image: item.image || "",
    }));

    console.log(orderItems);
    

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
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
      totalPrice: totalAmount,
      totalAmount,
      isPaid: paymentMethod !== "COD",
      paidAt: paymentMethod !== "COD" ? new Date() : null,
      orderStatus: "processing",
    });

    // 1️⃣ Admin Notification: New Order
    await Notification.create({
      type: "New Order",
      message: `New order placed by ${req.user.username}`,
      referenceId: order._id,
    });

    // 2️⃣ Admin Notification: Low Stock (Optional)
    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (product && product.stock - item.qty <= 5) {
        // threshold example
        await Notification.create({
          type: "Stock Low",
          message: `Stock for ${product.name} is running low`,
          referenceId: product._id,
        });
      }
    }

    const delivery = await Delivery.create({ order: order._id });
    order.delivery = delivery._id;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "username email")
      .populate({ path: "delivery" })
      .populate("orderItems.product", "name price image");

    res.status(201).json({ success: true, order: populatedOrder });
  } catch (err) {
    console.error("Place Order Error:", err);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

// -------------------- PLACE CASH ON DELIVERY --------------------
export const placeCashOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartItems, shippingInfo, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No items in cart" });

    // Prevent duplicate pending COD orders
    const existingCODOrder = await Order.findOne({
      user: userId,
      paymentMethod: "COD",
      paymentStatus: "pending",
      totalPrice: totalAmount,
    });

    if (existingCODOrder) {
      const populatedExisting = await Order.findById(existingCODOrder._id)
        .populate("user", "username email")
        .populate({ path: "delivery" })
        .populate("orderItems.product", "name price image");

      return res.status(200).json({
        success: true,
        message: "COD order already exists",
        order: populatedExisting,
      });
    }

    const orderItems = cartItems.map((i) => ({
      product: toObjectId(i.productId || i.id || i._id),
      name: i.name || "Unknown Product",
      qty: i.qty || 1,
      price: i.discountPrice && i.discountPrice > 0 ? i.discountPrice : i.price,
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
      paymentMethod: "COD",
      paymentStatus: "pending",
      totalPrice: totalAmount,
      isPaid: false,
      orderStatus: "processing",
    });

    // 🏷️ Decrease stock for each product
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);

      console.log(product);
      
      if (product) {
        product.stock = Math.max(product.stock - item.qty, 0);
        await product.save();

        // Low stock alert for admin
        if (product.stock <= 5) {
          await Notification.create({
            type: "stock",
            message: `⚠️ Stock running low for ${product.name} (Only ${product.stock} left)`,
          });
        }
      }
    }

    const delivery = await Delivery.create({ order: order._id });
    order.delivery = delivery._id;
    await order.save();

    // 🔔 Notify Admin (new order)
    await Notification.create({
      message: `🛍️ New order placed by ${
        req.user.username || req.user.email
      } (Order ID: ${order._id.toString().slice(-6)})`,
      type: "orders",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "username email")
      .populate({ path: "delivery" })
      .populate("orderItems.product", "name price image");

    res.status(201).json({
      success: true,
      message: "COD Order placed successfully",
      order: populatedOrder,
    });
  } catch (err) {
    console.error("Place COD Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- GET USER ORDERS --------------------
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "username email")
      .populate({
        path: "delivery",
        select:
          "currentStatus trackingNumber expectedDate actualDeliveryDate updatedAt",
      })
      .populate("orderItems.product", "name price image")
      .sort({ createdAt: -1 });

    // Include deliveryStatus + shipping address for frontend
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      status: order.status,
      user: order.user,
      orderItems: order.orderItems,
      delivery: order.delivery,
      deliveryStatus: order.delivery?.currentStatus || "Pending",
      shippingAddress: {
        name: order.shippingAddress?.name || "",
        mobile: order.shippingAddress?.mobile || "",
        address: order.shippingAddress?.address || "",
        city: order.shippingAddress?.city || "",
        state: order.shippingAddress?.state || "",
        country: order.shippingAddress?.country || "",
        postalCode: order.shippingAddress?.postalCode || "",
      },
    }));

    res.status(200).json({ success: true, orders: formattedOrders });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

//Done

// -------------------- GET ALL ORDERS (ADMIN) --------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "username email")
      .populate({ path: "delivery" })
      .populate("orderItems.product", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch all orders" });
  }
};

//admin -done

// -------------------- GET  RECENT  5 ORDERS --------------------
export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate("user", "username email")
      .populate({ path: "delivery" })
      .populate("orderItems.product", "name price image")
      .sort({ createdAt: -1 })
      .limit(5);

    const totalOrders = await Order.countDocuments();

    res.status(200).json({ success: true, totalOrders, recentOrders });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch recent orders" });
  }
};

// -------------------- GET TOTAL ORDERS --------------------
export const getTotalOrders = async (req, res) => {
  try {
    // Count all orders in the database
    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      success: true,
      totalOrders,
      message: `There are ${totalOrders} orders in total.`,
    });
  } catch (err) {
    console.error("Error calculating total orders:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to calculate total orders" });
  }
};

//user- for get first 5 order

// -------------------- UPDATE Payment ORDER STATUS --------------------

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // "pending", "paid", "failed"

    if (!status)
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });

    const validStatuses = ["pending", "paid", "failed"];
    const lowerStatus = status.toLowerCase();

    if (!validStatuses.includes(lowerStatus))
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment status value" });

    const order = await Order.findById(orderId).populate(
      "user",
      "username email"
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.paymentStatus = lowerStatus;
    order.isPaid = lowerStatus === "paid";
    if (order.isPaid) order.paidAt = new Date();

    // ✅ Notification logic
    if (order.isPaid) {
      // User notification
      if (order.user?._id) {
        await Notification.create({
          userId: order.user._id,
          message: `Your payment for Order ${order._id
            .toString()
            .slice(-6)} is completed.`,
          type: "payment",
        });
      }

      // Admin notification
      await Notification.create({
        message: `Payment received for Order ${order._id
          .toString()
          .slice(-6)} by ${
          order.user?.username || order.user?.email || "Unknown User"
        }`,
        type: "orders",
      });
    }

    await order.save();

    // Populate order for frontend
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "username email")
      .populate({ path: "delivery" })
      .populate("orderItems.product", "name price image");

    res.status(200).json({
      success: true,
      message: "Payment status updated",
      order: populatedOrder,
    });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
};

// -------------------- UPDATE DELIVERY STATUS (ADMIN) --------------------
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status, actualDeliveryDate } = req.body;

    const validStatuses = [
      "Processing",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Invalid delivery status" });

    const delivery = await Delivery.findById(deliveryId).populate("order");
    if (!delivery)
      return res
        .status(404)
        .json({ success: false, message: "Delivery not found" });

    delivery.currentStatus = status;
    if (actualDeliveryDate) delivery.actualDeliveryDate = actualDeliveryDate;
    delivery.trackingUpdates.push({ status });
    await delivery.save();

    // ✅ Notification logic
    if (delivery.order) {
      const orderIdShort = delivery.order._id.toString().slice(-6);

      if (status === "Delivered") {
        // Notify user
        await Notification.create({
          userId: delivery.order.user,
          message: `Your Order ${orderIdShort} has been delivered.`,
          type: "delivery",
        });

        // Optional: Admin notification
        await Notification.create({
          message: `Order ${orderIdShort} has been marked as delivered.`,
          type: "orders",
        });

        // Update order as delivered
        const order = await Order.findById(delivery.order._id);
        if (order) {
          order.isDelivered = true;
          order.orderStatus = "completed";
          await order.save();
        }
      } else {
        // Notify user for other status changes
        await Notification.create({
          userId: delivery.order.user,
          message: `Your Order ${orderIdShort} status updated: ${status}`,
          type: "delivery",
        });
      }
    }

    // Update order if delivered
    if (status === "Delivered" && delivery.order) {
      const order = await Order.findById(delivery.order._id);
      if (order) {
        order.isDelivered = true;
        order.orderStatus = "completed";
        await order.save();
      }
    }

    // Return updated delivery and order
    const populatedDelivery = await Delivery.findById(deliveryId)
      .populate("order")
      .populate("order.orderItems.product", "name price image");

    res.status(200).json({
      success: true,
      message: "Delivery status updated",
      delivery: populatedDelivery,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update delivery status" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { address, products, paymentMethod } = req.body;

    if (!address || !products || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Map products to orderItems
    const orderItems = products.map((p) => ({
      product: toObjectId(p.productId || p.id || p._id),
      name: p.name,
      qty: p.qty || 1,
      price: p.price,
      image: p.image || "",
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    // Determine valid payment status
    let paymentStatus = "pending";
    if (
      paymentMethod &&
      paymentMethod !== "Cash On Delivery" &&
      paymentMethod !== "COD"
    ) {
      paymentStatus = "paid";
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: {
        name: address.name,
        mobile: address.mobile,
        address: address.address,
        city: address.city,
        state: address.state,
        country: address.country || "India",
        postalCode: address.postalCode,
      },
      paymentMethod: paymentMethod || "Cash On Delivery",
      paymentStatus: paymentStatus,
      totalPrice: totalAmount,
      totalAmount: totalAmount,
      isPaid: paymentStatus === "paid",
      paidAt: paymentStatus === "paid" ? new Date() : null,
      isDelivered: false,
      orderStatus: "Processing",
    });

    // Create associated delivery
    const delivery = await Delivery.create({
      order: order._id,
      currentStatus: "Processing",
    });

    order.delivery = delivery._id;
    await order.save();

    // 🔔 Notify Admin about new order
    await Notification.create({
      message: `New order placed by ${
        req.user.username || req.user.email
      } (Order ID: ${order._id.slice(-6)})`,
      type: "orders",
    });

    // 🔔 Optionally notify the user
    await Notification.create({
      userId: req.user._id,
      message: `Your order ${order._id.slice(
        -6
      )} has been successfully created.`,
      type: "orders",
    });

    // Populate for response
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "username email")
      .populate({
        path: "delivery",
        select:
          "currentStatus expectedDeliveryDate actualDeliveryDate trackingUpdates",
      })
      .populate("orderItems.product", "name price image");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

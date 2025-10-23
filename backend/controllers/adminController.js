import mongoose from "mongoose";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import ExcelJS from "exceljs";
import Notification from "../models/NotificationModel.js";
import { io } from "../server.js";
// ✅ Promote any user to admin (admin only)
export const makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isAdmin = true;
    await user.save();

    res.status(200).json({
      message: "User promoted to admin",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      stock,
      category,
      brand,
      sizes,
      specifications,
      additionalInfo,
      sku,
    } = req.body;

    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILES:", req.files);

    // ✅ Required fields check
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // ✅ Handle multiple images (if using multer for array upload)
    const images = req.files
      ? req.files.map((file) => ({
          url: file.path,
          public_id: file.filename,
        }))
      : [];

    // ✅ Convert JSON strings (if frontend sends as stringified JSON)
    let parsedSpecifications = [];
    let parsedAdditionalInfo = [];
    if (specifications) {
      parsedSpecifications =
        typeof specifications === "string"
          ? JSON.parse(specifications)
          : specifications;
    }
    if (additionalInfo) {
      parsedAdditionalInfo =
        typeof additionalInfo === "string"
          ? JSON.parse(additionalInfo)
          : additionalInfo;
    }

    // ✅ Auto-generate SKU if not provided
    const generatedSku =
      sku || `${category.substring(0, 3).toUpperCase()}-${Date.now()}`;

    // ✅ Create Product
    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      stock,
      category,
      brand,
      sizes: sizes || [],
      specifications: parsedSpecifications,
      additionalInfo: parsedAdditionalInfo,
      sku: generatedSku,
      images,
    });

    await product.save();

    // ✅ Create admin notification
    await Notification.create({
      message: `New product added: ${product.name} (Category: ${product.category})`,
      type: "product",
    });

    res.status(201).json({
      success: true,
      message: "✅ Product created successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // product id from URL
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      brand,
      stock,
      images,
      sizes,
      specifications,
      additionalInfo,
      isFeatured,
    } = req.body;

    // 1. Product exist karta hai ya nahi
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. Discount validation
    if (discountPrice !== undefined) {
      if (price !== undefined) {
        if (Number(discountPrice) >= Number(price)) {
          return res.status(400).json({
            success: false,
            message: "Discount price must be less than original price",
          });
        }
      } else {
        if (Number(discountPrice) >= Number(product.price)) {
          return res.status(400).json({
            success: false,
            message: "Discount price must be less than original price",
          });
        }
      }
    }

    // 3. Images validation (1–3 allowed)
    if (images && Array.isArray(images)) {
      if (images.length < 1 || images.length > 3) {
        return res.status(400).json({
          success: false,
          message: "You must upload between 1 to 3 images",
        });
      }
    }

    // 4. Update fields
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.discountPrice = discountPrice ?? product.discountPrice;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.stock = stock ?? product.stock;
    product.images = images ?? product.images;
    product.sizes = sizes ?? product.sizes;
    product.specifications = specifications ?? product.specifications;
    product.additionalInfo = additionalInfo ?? product.additionalInfo;
    product.isFeatured = isFeatured ?? product.isFeatured;

    // 5. Save
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id.trim();

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Server error. Could not delete product." });
  }
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    // Optional: Get orders grouped by date
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalRevenue: revenue,
      dailyOrders,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch dashboard data", error: err.message });
  }
};

export const totalUser = async (req, res) => {
  try {
    const count = await User.countDocuments();

    res.status(200).json({ success: true, totalUser: count });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const exportOrdersToExcel = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name"); // Optional: get product details

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // Define columns
    worksheet.columns = [
      { header: "Order ID", key: "_id", width: 25 },
      { header: "Customer Name", key: "customerName", width: 25 },
      { header: "Email", key: "email", width: 25 },
      { header: "Items", key: "items", width: 40 },
      { header: "Total Price", key: "totalPrice", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Shipping Address", key: "address", width: 30 },
      { header: "Date", key: "createdAt", width: 20 },
    ];

    // Add rows
    orders.forEach((order) => {
      const itemsList = order.orderItems
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(", ");

      const address = `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`;

      worksheet.addRow({
        _id: order._id,
        customerName: order.user?.name || "Guest",
        email: order.user?.email || "N/A",
        items: itemsList,
        totalPrice: order.totalPrice,
        status: order.status,
        address,
        createdAt: order.createdAt.toISOString().split("T")[0],
      });
    });

    // Response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=orders-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res.status(500).json({ success: false, message: "Excel export failed" });
  }
};

export const getTotalRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalRevenue = result[0]?.totalRevenue || 0;

    res.status(200).json({ success: true, totalRevenue });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to calculate revenue" });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const allOrders = await Order.find();

    const now = new Date();
    const currentMonthIndex = now.getMonth(); // 0 = Jan, 11 = Dec

    const monthlyData = Array(12).fill(0); // All months initially zero

    allOrders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      if (month <= currentMonthIndex) {
        monthlyData[month] += order.totalPrice;
      }
    });

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = monthNames
      .slice(0, currentMonthIndex + 1) // Only up to current month
      .map((name, i) => ({
        name,
        revenue: monthlyData[i],
      }));

    res.json(result);
  } catch (error) {
    console.error("Revenue Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const orders = await Order.find(); // get all orders
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

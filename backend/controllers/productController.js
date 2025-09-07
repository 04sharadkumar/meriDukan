import mongoose from "mongoose";
import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";




export const getAllProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 100000;
    const sort = req.query.sort || "latest";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const query = {
      name: { $regex: keyword, $options: "i" },
      category: { $regex: category, $options: "i" },
      price: { $gte: minPrice, $lte: maxPrice },
    };

    const sortOption =
      sort === "priceAsc"
        ? { price: 1 }
        : sort === "priceDesc"
        ? { price: -1 }
        : sort === "rating"
        ? { createdAt: -1 } // We'll sort by rating later manually
        : { createdAt: -1 };

    const total = await Product.countDocuments(query);

    // Fetch products
    const productsData = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'reviews', // populate review references
        select: 'rating',
      })
      .lean(); // convert to plain objects

    // Calculate averageRating & discountedPrice
    const products = await Promise.all(
      productsData.map(async (p) => {
        // If reviews are not embedded, fetch them from Review model
        const reviews = await Review.find({ productId: p._id }).select('rating');

        const avgRating =
          reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;

        const discount = p.discountPrice || 0;

        return {
          ...p,
          discountedPrice: p.price - discount > 0 ? p.price - discount : 0,
          averageRating: Number(avgRating.toFixed(1)),
          numReviews: reviews.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};






export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // ✅ Fetch product with populated reviews
    const product = await Product.findById(id)
      .populate("reviews.user", "username email") // only include safe fields
      .lean(); // better performance for read-only data

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("❌ Error finding product:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ➕ Add Review (Allow multiple reviews from same user)

export const addProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ➕ Add new review every time
    const newReview = {
      user: req.user._id,
      name: req.user.username,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(newReview);

    // ✅ Update count and average rating
    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added successfully", reviews: product.reviews });
  } catch (error) {
    res.status(500).json({ message: "Failed to add review", error: error.message });
  }
};


export const totalProduct  = async(req,res)=>{


  try {

    const count = await Product.countDocuments();

    res.status(200).json(
      {
      success:true,
      totalProduct:count
    })
    
  } catch (error) {

    console.error('Error fetching user count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
    
  }
}

export const recent = async (req, res) => {
  try {
    const recentThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days
    const recentProducts = await Product.find({ createdAt: { $gte: recentThreshold } }).sort({ createdAt: -1 });

    res.status(200).json(recentProducts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recent products", error: err.message });
  }
};

export const getFlashSaleProducts = async (req, res) => {
  try {
    // Fetch products under ₹1000
    const cheapProducts = await Product.find({ price: { $lt: 1000 } });

    // Randomly shuffle and pick 6
    const shuffled = cheapProducts.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    res.status(200).json(selected);
  } catch (error) {
    console.error("Error fetching flash sale products:", error);
    res.status(500).json({ message: "Server error while fetching flash sale products" });
  }
};



export const similarProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similar = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(6);

    res.json({ success: true, products: similar });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

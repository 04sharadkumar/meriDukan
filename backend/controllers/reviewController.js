import { v2 as cloudinary } from 'cloudinary';
import Review from '../models/reviewModel.js';
import productModel from '../models/productModel.js';
import mongoose from 'mongoose';


// Count total number of all reviews in the database
export const countAllReviews = async (req, res) => {
  try {
    const count = await Review.countDocuments();
    res.status(200).json({ totalReviews: count });
  } catch (error) {
    console.error('Error counting reviews:', error);
    res.status(500).json({ error: 'Failed to count reviews' });
  }
};

// Count reviews for a specific product
export const countProductReviews = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const count = await Review.countDocuments({ productId });
    res.status(200).json({ totalReviews: count });
  } catch (error) {
    console.error('Error counting product reviews:', error);
    res.status(500).json({ error: 'Failed to count product reviews' });
  }
};

export const addReview = async (req, res) => {
  const { productId } = req.params;

  console.log(req.params);
  
  const { rating, text } = req.body;

  console.log(req.body);
  

  try {
    const newReview = new Review({
      productId,
      userId: req.user._id, // assuming you set it via `protect` middleware
      rating,
      text,
      image: req.file?.path || '', // Cloudinary or local path
    });

    await newReview.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding review' });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const reviews = await Review.find({ productId }).populate('userId', 'name');
    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getProductReviewStats = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    // Aggregate reviews for this product
    const result = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({ averageRating: 0, totalReviews: 0 });
    }

    const { averageRating, totalReviews } = result[0];

    res.status(200).json({
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
    });
  } catch (err) {
    console.error('Error getting product review stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTopRatedProducts = async (req, res) => {
  try {
    const result = await Review.aggregate([
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
        },
      },
      {
        $match: {
          averageRating: { $gt: 3 }, // only products with avg > 3
        },
      },
      {
        $lookup: {
          from: "products", // collection name in MongoDB (should be lowercase)
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          _id: 0,
          product: "$productDetails",
          averageRating: { $round: ["$averageRating", 1] },
        },
      },
    ]);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching top-rated products:", err);
    res.status(500).json({ error: "Server error" });
  }
};
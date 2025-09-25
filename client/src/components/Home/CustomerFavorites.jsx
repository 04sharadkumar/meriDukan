import React, { useState, useEffect } from "react";
import { FiHeart, FiChevronRight } from "react-icons/fi";
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";
import axios from "axios";
import { useWishlist } from "../../context/WishlistContext";
import axiosInstance from "../../context/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function CustomerFavorites() {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [reviewStats, setReviewStats] = useState({});

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<BsStarFill key={i} className="text-yellow-400 text-xs" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<BsStarHalf key={i} className="text-yellow-400 text-xs" />);
      } else {
        stars.push(<BsStar key={i} className="text-yellow-400 text-xs" />);
      }
    }

    return stars;
  };

  const handleAddToCart = async (productId) => {
    try {
      await axiosInstance.post("/api/cart", {
        productId,
        quantity: 1,
      });
      toast.success("Added to cart!");
    } catch (err) {
      console.log(err);
      toast.error("Login to add to cart");
    }
  };

  useEffect(() => {
    const fetchTopRatedProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/review/top-rated"
        );
        setTopRatedProducts(res);
      } catch (error) {
        console.error("Error fetching top-rated products:", error);
      }
    };

    fetchTopRatedProducts();
  }, []);

  useEffect(() => {
    const fetchReviewStatsForAll = async () => {
      const stats = {};

      await Promise.all(
        topRatedProducts.data?.map(async (item) => {
          const productId = item.product._id;
          try {
            const res = await axios.get(
              `http://localhost:5000/api/review/stats/${productId}`
            );
            stats[productId] = res.data;
          } catch (error) {
            console.error(
              `Error fetching stats for product ${productId}`,
              error
            );
          }
        })
      );

      setReviewStats(stats);
    };

    if (topRatedProducts?.data?.length > 0) {
      fetchReviewStatsForAll();
    }
  }, [topRatedProducts]);

  return (
    <section className="mb-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-3">
          <BsStarFill className="text-3xl text-blue-600" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Customer Favorites
            </span>
          </h2>
        </div>

        <button className="group flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md">
          <span className="text-gray-700 font-medium text-sm">View All</span>
          <div className="relative w-5 h-5 overflow-hidden">
            <FiChevronRight className="absolute top-0 left-0 text-gray-600 transition-transform duration-300 group-hover:translate-x-full" />
            <FiChevronRight className="absolute top-0 -left-full text-gray-600 transition-transform duration-300 group-hover:translate-x-full" />
          </div>
        </button>
      </div>

      {/* Products Section */}
      <div className="relative">
        {/* Mobile: Horizontal scroll | Desktop: Grid */}
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 scrollbar-hide">
          {topRatedProducts.data?.map(({ product }) => (
            <div
              key={product._id}
              onClick={() => navigate(`/productDetail?id=${product._id}`)}
              className="flex-shrink-0 sm:flex-shrink bg-white rounded-xl shadow-md overflow-hidden w-52 sm:w-auto cursor-pointer transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-44 sm:h-52">
                <img
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />

                {/* Badge */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm flex items-center">
                  <BsStarFill className="mr-1 text-[0.6rem]" /> TOP
                </div>

                {/* Wishlist */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevents navigating to product page
                    toggleWishlist(product);
                  }}
                  className={`absolute top-2 right-2 p-2 rounded-full transition-all 
                    
                    ${isInWishlist(product._id) ? "bg-blue-600 text-white": "bg-white text-gray-700"} shadow-md hover:scale-105`}
                >
                  <FiHeart
                    className={`${
                      isInWishlist(product._id) ? "fill-current" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col justify-between h-36">
                <h3 className="text-sm font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center mb-3">
                  <div className="flex mr-2">
                    {renderStars(reviewStats[product._id]?.averageRating || 0)}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({reviewStats[product._id]?.totalReviews || 0})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-blue-700">
                      ₹{product.discountPrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{product.price}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product._id);
                    }}
                    className="text-xs bg-blue-600 text-white p-2  hover:bg-blue-700 transition-colors shadow-md"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CustomerFavorites;

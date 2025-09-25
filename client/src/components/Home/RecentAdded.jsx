import axios from "axios";
import { useState, useEffect } from "react";
import { FiHeart, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";

function RecentAdded() {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [recentProducts, setRecentProducts] = useState([]);
  const [localLikes, setLocalLikes] = useState({}); // Local visual toggle

  const handleWishlistClick = (product) => {
    // Update local state for animation/instant feedback
    setLocalLikes((prev) => ({
      ...prev,
      [product._id]: !prev[product._id],
    }));

    // Update actual wishlist context
    toggleWishlist(product);
  };

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/products/recent"
        );
        setRecentProducts(res.data);
      } catch (err) {
        console.error("Error fetching recent products:", err);
      }
    };

    fetchRecentProducts();
  }, []);

  return (
    <section className="mb-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute -inset-3 bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs font-bold">NEW</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Just Dropped
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

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recentProducts.map((product) => {
          const liked = localLikes[product._id] || isInWishlist(product._id);
          return (
            <div
              key={product._id}
              className="relative group"
              onClick={() => navigate(`/productDetail?id=${product._id}`)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-teal-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -m-2"></div>
              <div className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer relative h-full transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-xl">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images?.[0]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-4 left-4 bg-teal-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>{" "}
                    JUST ADDED
                  </div>
                  <button
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                      liked
                        ? "bg-teal-600 text-white"
                        : "bg-white text-gray-700 opacity-0 group-hover:opacity-100"
                    } shadow-md hover:bg-teal-600 hover:text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistClick(product);
                    }}
                  >
                    <FiHeart
                      className={`text-sm ${liked ? "fill-current" : ""}`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-teal-600">
                        ₹{product.discountPrice}
                      </span>
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₹{product.price}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/productDetail?id=${product._id}`);
                      }}
                      className="text-xs bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors shadow-md"
                    >
                      QUICK VIEW
                    </button>
                  </div>
                </div>

                {/* Bottom border */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default RecentAdded;

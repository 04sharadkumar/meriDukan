import { useEffect, useState } from "react";
import LeftSideFilter from './LeftSideFilter'
import {
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewSlide = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState([]);

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedFilters, setSelectedFilters] = useState({
    sortBy: "Relevance",
    category: "",
    gender: "",
    color: "",
    price: "",
    rating: "",
    discount: "",
  });

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  // 🔹 Fetch products with pagination
  const fetchProduct = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/products?page=${pageNum}`
      );

      if (res.data.products.length === 0) {
        setHasMore(false);
      } else {
        setAllProducts((prev) => {
  const newItems = res.data.products.filter(
    (p) => !prev.some((item) => item._id === p._id)
  );
  return [...prev, ...newItems];
});

      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setAllProducts([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct(page);
  }, [page]);

  // 🔹 Apply Filters
  useEffect(() => {
    let filtered = [...allProducts];

    if (selectedFilters.category) {
      filtered = filtered.filter(
        (p) => p.category === selectedFilters.category
      );
    }

    if (selectedFilters.gender) {
      filtered = filtered.filter((p) => p.gender === selectedFilters.gender);
    }

    if (selectedFilters.price) {
      filtered = filtered.filter((p) => {
        const price = p.price;
        switch (selectedFilters.price) {
          case "Under ₹99":
            return price < 99;
          case "₹100-500":
            return price >= 100 && price <= 500;
          case "₹500-1000":
            return price > 500 && price <= 1000;
          case "Above ₹1000":
            return price > 1000;
          default:
            return true;
        }
      });
    }

    if (selectedFilters.rating) {
      const ratingValue = parseFloat(selectedFilters.rating);
      filtered = filtered.filter((p) => p.ratings >= ratingValue);
    }

    if (selectedFilters.discount) {
      const discountValue = parseInt(selectedFilters.discount);
      filtered = filtered.filter((p) => parseInt(p.discount?.toString().replace("%","") || "0") >= discountValue);
    }

    switch (selectedFilters.sortBy) {
      case "Price (High to Low)":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "Price (Low to High)":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "Ratings":
        filtered.sort((a, b) => b.ratings - a.ratings);
        break;
      case "Discount":
        filtered.sort((a, b) => parseInt(b.discount) - parseInt(a.discount));
        break;
      default:
        break;
    }

    setProduct(filtered);
  }, [selectedFilters, allProducts]);

  // 🔹 Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.scrollHeight
      ) {
        if (!loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">1000+ Products</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            value={selectedFilters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          >
            <option value="Relevance">Relevance</option>
            <option value="New Arrivals">New Arrivals</option>
            <option value="Price (High to Low)">Price (High to Low)</option>
            <option value="Price (Low to High)">Price (Low to High)</option>
            <option value="Ratings">Ratings</option>
            <option value="Discount">Discount</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side - Filters */}
        <LeftSideFilter />

        {/* Right Side - Products */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.isArray(product) &&
              product.map((product, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/productDetail?id=${product._id}`)}
                  className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={
                        product.images?.[0].url ||
                        "https://via.placeholder.com/300x200?text=No+Image"
                      }
                      alt={product.name}
                      className="h-48 w-full object-cover rounded-md mb-3"
                    />
                    {product.isTrending && (
                      <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        Trending
                      </span>
                    )}
                    {product.isMall && (
                      <span className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                        Mall
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <h3 className="font-medium text-gray-800 mb-1.5 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center mb-1.5">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.discountPrice}
                    </span>
                    <span className="text-xs text-gray-500 line-through ml-2">
                      {product.price}
                    </span>
                    <span className="text-xs text-green-600 ml-2 bg-green-50 px-1 py-0.5 rounded">
                      {product.discount}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= product.averageRating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {product.averageRating} ({product.numReviews} reviews)
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* 🔹 Loader */}
          {loading && (
            <div className="flex justify-center mt-6">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* 🔹 No more products */}
          {!hasMore && (
            <p className="text-center text-gray-500 mt-6">
              No more products available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewSlide;

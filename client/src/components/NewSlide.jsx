import { useEffect, useState } from "react";
import LeftSideFilter from "./LeftSideFilter";
import { FiFilter, FiChevronDown, FiStar } from "react-icons/fi";
import { IoFlashOutline } from "react-icons/io5";
import axios from "axios";
import { useNavigate,useLocation} from "react-router-dom";

const NewSlide = () => {

  const navigate = useNavigate();
  const [product, setProduct] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";


  const [selectedFilters, setSelectedFilters] = useState({
    sortBy: "Relevance",
    category: "",
    gender: "",
    price: "",
    rating: "",
    discount: "",
  });

  const handleFilterChange = (filters) => {
    setSelectedFilters((prev) => ({ ...prev, ...filters }));
  };

  // Fetch products
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

  // Apply filters
 useEffect(() => {
  let filtered = [...allProducts];

  // Existing filters
  if (selectedFilters.category) {
    filtered = filtered.filter((p) => p.category === selectedFilters.category);
  }
  if (selectedFilters.gender) {
    filtered = filtered.filter((p) => p.gender === selectedFilters.gender);
  }
  if (selectedFilters.price) {
    filtered = filtered.filter((p) => {
      const price = p.price;
      switch (selectedFilters.price) {
        case "Under ₹99": return price < 99;
        case "₹100-500": return price >= 100 && price <= 500;
        case "₹500-1000": return price > 500 && price <= 1000;
        case "Above ₹1000": return price > 1000;
        default: return true;
      }
    });
  }
  if (selectedFilters.rating) {
    filtered = filtered.filter((p) => p.ratings >= parseFloat(selectedFilters.rating));
  }
  if (selectedFilters.discount) {
    filtered = filtered.filter(
      (p) => parseInt(p.discount?.replace("%","") || "0") >= parseInt(selectedFilters.discount)
    );
  }

  // ✅ SEARCH FILTER
  if (searchQuery) {
    filtered = filtered.filter((p) => {
      const name = p.name.toLowerCase();
      const category = p.category?.toLowerCase() || "";
      return name.includes(searchQuery) || category.includes(searchQuery);
    });
  }

  // Sorting
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
}, [selectedFilters, allProducts, searchQuery]); // <-- add searchQuery here


  // Infinite scroll
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  const getActiveFiltersCount = () => {
  return Object.entries(selectedFilters).filter(
    ([key, value]) => key !== "sortBy" && value !== ""
  ).length;
};

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Top bar with Sort & Filter */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            {allProducts.length}+ Products
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 text-sm font-normal text-blue-600">
                ({getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? "s" : ""} applied)
              </span>
            )}
          </h1>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300"
              >
                <span className="text-gray-700">{selectedFilters.sortBy}</span>
                <FiChevronDown className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {["Relevance", "New Arrivals", "Price (High to Low)", "Price (Low to High)", "Ratings", "Discount"].map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setSelectedFilters((prev) => ({ ...prev, sortBy: option }));
                        setSortOpen(false);
                      }}
                      className={`px-4 py-3 text-sm cursor-pointer transition-colors duration-150 hover:bg-blue-50 ${
                        selectedFilters.sortBy === option
                          ? "bg-blue-50 text-blue-600 font-semibold border-r-2 border-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => navigate("/filter")}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm bg-blue-600 text-white shadow hover:bg-blue-700 transition"
            >
              <FiFilter className="text-base" />
              Filter
              {getActiveFiltersCount() > 0 && (
                <span className="bg-white text-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 px-4 sm:px-6 py-6">
        {/* Left Filters (Desktop) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <LeftSideFilter
            onFilterChange={handleFilterChange}
            selectedFilters={selectedFilters}
          />
        </div>

        {/* Right Products */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {product.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/productDetail?id=${p._id}`)}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col transform hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Discount Badge */}
                {p.discount && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full shadow-lg">
                      <IoFlashOutline className="text-sm" />
                      {p.discount}% OFF
                    </span>
                  </div>
                )}

                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-50 rounded-t-2xl">
                  <img
                    src={p.images?.[0]?.url || "https://via.placeholder.com/300x200"}
                    alt={p.name}
                    className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 leading-tight">{p.name}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                      <FiStar className="text-green-600 text-xs fill-current" />
                      <span className="text-xs font-semibold text-green-700">{p.averageRating}</span>
                    </div>
                    <span className="text-gray-500 text-xs">({p.numReviews || 0})</span>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">₹{formatPrice(p.discountPrice || p.price)}</span>
                      {p.discount && <span className="text-gray-500 line-through text-sm">₹{formatPrice(p.price)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loader */}
          {loading && (
            <div className="flex justify-center mt-8 py-8">
              <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* No more products */}
          {!hasMore && product.length > 0 && (
            <div className="text-center py-8 text-gray-500">You've reached the end!</div>
          )}

          {/* Empty State */}
          {!loading && product.length === 0 && (
            <div className="text-center py-16 text-gray-500">No products found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewSlide;

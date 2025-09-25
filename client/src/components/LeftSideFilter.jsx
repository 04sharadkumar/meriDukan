import { useState } from "react";
import { FiX } from "react-icons/fi";

const LeftSideFilter = ({ onFilterChange, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState("");

  const categories = ["Men", "Women", "Kids", "Accessories"];
  const prices = ["Under ₹99", "₹100-500", "₹500-1000", "Above ₹1000"];
  const ratings = ["4", "3", "2", "1"];
  const discounts = ["10", "20", "30", "40", "50"];

  const applyFilter = () => {
    onFilterChange({
      category: selectedCategory,
      price: selectedPrice,
      rating: selectedRating,
      discount: selectedDiscount,
    });
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 bg-white h-full border-r shadow-sm p-4 relative">
      {/* Close button (mobile) */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <FiX size={22} />
        </button>
      )}

      <h2 className="text-base font-semibold text-gray-800 mb-4">Filters</h2>

      {/* Category */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat}>
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={selectedCategory === cat}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="accent-blue-600"
                />
                <span>{cat}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Price</h3>
        <ul className="space-y-2">
          {prices.map((p) => (
            <li key={p}>
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="radio"
                  name="price"
                  value={p}
                  checked={selectedPrice === p}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="accent-blue-600"
                />
                <span>{p}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Rating */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Rating</h3>
        <ul className="space-y-2">
          {ratings.map((r) => (
            <li key={r}>
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="radio"
                  name="rating"
                  value={r}
                  checked={selectedRating === r}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="accent-blue-600"
                />
                <span>{r}★ & above</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Discount */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Discount</h3>
        <ul className="space-y-2">
          {discounts.map((d) => (
            <li key={d}>
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="radio"
                  name="discount"
                  value={d}
                  checked={selectedDiscount === d}
                  onChange={(e) => setSelectedDiscount(e.target.value)}
                  className="accent-blue-600"
                />
                <span>{d}% or more</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Apply button */}
      <button
        onClick={applyFilter}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        Apply
      </button>
    </aside>
  );
};

export default LeftSideFilter;

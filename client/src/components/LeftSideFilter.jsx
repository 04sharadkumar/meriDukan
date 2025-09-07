import React, { useState } from "react";

const LeftSideFilter = ({ onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState([0, 2000]);
  const [selectedRating, setSelectedRating] = useState(null);

  const categories = ["Men", "Women", "Kids", "Accessories"];
  const ratings = [5, 4, 3, 2, 1];

  // Handle filter change
  const applyFilter = () => {
    onFilterChange({
      category: selectedCategory,
      price: selectedPrice,
      rating: selectedRating,
    });
  };

  return (
    <aside className="hidden lg:block w-64 bg-white rounded-xl shadow-md p-5 sticky top-20 h-fit">
      <h2 className="text-lg font-bold text-blue-700 mb-4">Filters</h2>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={selectedCategory === cat}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-600">{cat}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Price</h3>
        <input
          type="range"
          min="0"
          max="5000"
          step="100"
          value={selectedPrice[1]}
          onChange={(e) => setSelectedPrice([0, parseInt(e.target.value)])}
          className="w-full accent-blue-600"
        />
        <p className="text-sm text-gray-600 mt-2">
          ₹{selectedPrice[0]} - ₹{selectedPrice[1]}
        </p>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer Rating</h3>
        <ul className="space-y-1">
          {ratings.map((rate) => (
            <li key={rate}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={rate}
                  checked={selectedRating === rate}
                  onChange={(e) => setSelectedRating(parseInt(e.target.value))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-600">& {rate} ★ & above</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilter}
        className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 transition"
      >
        Apply Filters
      </button>
    </aside>
  );
};

export default LeftSideFilter;

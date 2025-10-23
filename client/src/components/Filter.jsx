import React, { useState } from "react";
import { filterData } from "../data/filterData";

const Filter = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [],
    size: [],
    gender: [],
    price: [],
    discount: [],
    sleeves: [],
    collar: [],
    fabric: [],
    pattern: [],
    occasion: [],
  });

  const [activeCategory, setActiveCategory] = useState("brands");
  const [searchTerms, setSearchTerms] = useState({});

  const toggleFilter = (category, value) => {
    const updated = selectedFilters[category].includes(value)
      ? selectedFilters[category].filter((v) => v !== value)
      : [...selectedFilters[category], value];

    setSelectedFilters({
      ...selectedFilters,
      [category]: updated,
    });
  };

  const handleSearch = (category, term) => {
    setSearchTerms({
      ...searchTerms,
      [category]: term.toLowerCase(),
    });
  };

  const applyFilters = () => {
    console.log("Applied Filters:", selectedFilters);
    alert("Applied Filters:\n" + JSON.stringify(selectedFilters, null, 2));
  };

  const clearAllFilters = () => {
    const reset = Object.keys(selectedFilters).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    setSelectedFilters(reset);
  };

  const getFilteredItems = (category, items) => {
    const searchTerm = searchTerms[category];
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.toLowerCase().includes(searchTerm)
    );
  };

  const renderCheckboxGroup = (category, items, search = false) => {
    const filteredItems = getFilteredItems(category, items);

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold text-gray-800 capitalize">
            {category}
          </h3>
          {selectedFilters[category].length > 0 && (
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              {selectedFilters[category].length} selected
            </span>
          )}
        </div>

        {search && (
          <div className="mb-5">
            <input
              type="text"
              placeholder={`Search ${category}`}
              onChange={(e) => handleSearch(category, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, i) => (
              <label
                key={i}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters[category].includes(item)}
                  onChange={() => toggleFilter(category, item)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm group-hover:text-blue-600 transition">
                  {item}
                </span>
              </label>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No items found</p>
          )}
        </div>
      </div>
    );
  };

  const categories = {
    brands: { title: "Brand", items: filterData.brands, search: true },
    size: { title: "Size", items: filterData.sizes },
    gender: { title: "Gender", items: filterData.genders },
    price: { title: "Price", items: filterData.prices },
    discount: { title: "Discount", items: filterData.discounts },
    sleeves: { title: "Sleeves", items: filterData.sleeves },
    collar: { title: "Collar", items: filterData.collars },
    fabric: { title: "Fabric", items: filterData.fabrics },
    pattern: { title: "Pattern", items: filterData.patterns },
    occasion: { title: "Occasion", items: filterData.occasions },
  };

  const totalSelected = Object.values(selectedFilters).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 flex border border-gray-200 rounded-2xl overflow-hidden shadow-md">
      {/* Sidebar Navigation */}
      <div className="w-38 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Filters</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {Object.keys(categories).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-5 py-3 border-b border-gray-100 text-sm transition rounded-md ${
                activeCategory === cat
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{categories[cat].title}</span>
                {selectedFilters[cat].length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {selectedFilters[cat].length}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-10 bg-gray-50">
          <div className="max-w-lg mx-auto">
            {renderCheckboxGroup(
              activeCategory,
              categories[activeCategory].items,
              categories[activeCategory].search
            )}
          </div>
        </div>

        {/* Apply and Clear Buttons */}
        <div className="border-t border-gray-200 bg-white p-6 flex items-center justify-between">
          <button
            onClick={clearAllFilters}
            className="px-5 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
          >
            Clear Filters
          </button>

          <div className="flex items-center gap-3">
            {totalSelected > 0 && (
              <span className="text-sm text-gray-600">
                {totalSelected} selected in total
              </span>
            )}
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;

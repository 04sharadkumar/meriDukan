import React, { useState } from "react";
import { FiX, FiChevronDown, FiChevronUp, FiSearch, FiCheck } from "react-icons/fi";
import { filterData } from "../data/filterData";

const LeftSideFilter = ({ onFilterChange, onClose }) => {
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

  const [expandedSections, setExpandedSections] = useState({
    brands: true,
    size: false,
    gender: false,
    price: false,
    discount: false,
    sleeves: false,
    collar: false,
    fabric: false,
    pattern: false,
    occasion: false,
  });

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

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const applyFilters = () => {
    onFilterChange(selectedFilters);
    if (onClose) onClose();
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(selectedFilters).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    setSelectedFilters(clearedFilters);
  };

  const getFilteredItems = (category, items) => {
    const searchTerm = searchTerms[category];
    if (!searchTerm) return items;
    
    if (category === 'price') {
      return items.filter(item => 
        item.range.toLowerCase().includes(searchTerm) || 
        item.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return items.filter((item) => 
      typeof item === 'string' ? item.toLowerCase().includes(searchTerm) : false
    );
  };

  const getSelectedCount = (category) => {
    return selectedFilters[category].length;
  };

  const renderCheckboxGroup = (category, items, search = false) => {
    const filteredItems = getFilteredItems(category, items);
    const selectedCount = getSelectedCount(category);

    return (
      <div className="border-b border-gray-200 pb-4 mb-4">
        {/* Section Header */}
        <div 
          className="flex items-center justify-between cursor-pointer py-3"
          onClick={() => toggleSection(category)}
        >
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-gray-900 capitalize">
              {category === 'price' ? 'Price Range' : category}
            </h3>
            {selectedCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {selectedCount}
              </span>
            )}
          </div>
          {expandedSections[category] ? (
            <FiChevronUp className="text-gray-400" size={16} />
          ) : (
            <FiChevronDown className="text-gray-400" size={16} />
          )}
        </div>

        {/* Expandable Content */}
        {expandedSections[category] && (
          <div className="pt-2">
            {search && (
              <div className="mb-4 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder={`Search ${category}`}
                  onChange={(e) => handleSearch(category, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className={`space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
              category === 'size' ? 'grid grid-cols-3 gap-2' : ''
            }`}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item, i) => {
                  const displayText = category === 'price' ? item.range : item;
                  const isSelected = selectedFilters[category].includes(item);

                  return (
                    <label
                      key={i}
                      className={`flex items-center space-x-3 cursor-pointer group p-2 rounded-lg transition-all ${
                        category === 'size' 
                          ? 'border border-gray-300 rounded-md justify-center hover:border-blue-500 hover:bg-blue-50' 
                          : 'hover:bg-gray-50'
                      } ${isSelected ? (category === 'size' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'bg-blue-50') : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFilter(category, item)}
                        className="hidden"
                      />
                      {category === 'size' ? (
                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                          {displayText}
                        </span>
                      ) : (
                        <>
                          <div className={`flex-shrink-0 w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                            {isSelected && <FiCheck className="text-white" size={12} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-700'} group-hover:text-blue-600 transition`}>
                              {displayText}
                            </span>
                            {category === 'price' && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                        </>
                      )}
                    </label>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No items found</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const categories = {
    brands: { title: "Brand", items: filterData.brands, search: true },
    size: { title: "Size", items: filterData.sizes },
    gender: { title: "Gender", items: filterData.genders },
    price: { title: "Price Range", items: filterData.prices },
    discount: { title: "Discount", items: filterData.discounts },
    sleeves: { title: "Sleeve Type", items: filterData.sleeves },
    collar: { title: "Collar Type", items: filterData.collars },
    fabric: { title: "Fabric", items: filterData.fabrics },
    pattern: { title: "Pattern", items: filterData.patterns },
    occasion: { title: "Occasion", items: filterData.occasions },
  };

  const totalSelectedFilters = Object.values(selectedFilters).reduce((total, current) => total + current.length, 0);

  return (
    <aside className="w-80 bg-white h-full border-r border-gray-200 shadow-sm p-6 relative flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          {totalSelectedFilters > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {totalSelectedFilters} filter{totalSelectedFilters !== 1 ? 's' : ''} applied
            </p>
          )}
        </div>
        
        {/* Close button (mobile) */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Clear All Button */}
      {totalSelectedFilters > 0 && (
        <div className="mb-4">
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {Object.keys(categories).map((cat) => 
          renderCheckboxGroup(
            cat,
            categories[cat].items,
            categories[cat].search
          )
        )}
      </div>

      {/* Apply Button */}
      <div className="pt-4 border-t border-gray-200 mt-4">
        <button
          onClick={applyFilters}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition shadow-sm flex items-center justify-center space-x-2"
        >
          <span>Apply Filters</span>
          {totalSelectedFilters > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalSelectedFilters}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default LeftSideFilter;
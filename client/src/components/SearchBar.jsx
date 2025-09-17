import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 mb-2">
      {/* Desktop SearchBar (Navbar ke andar) */}
      <div className="hidden md:flex flex-1 mx-6">
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            className="w-full py-2.5 px-4 pr-12 rounded-lg text-gray-700 border border-gray-300 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="absolute right-0 top-0 h-full px-4 text-white bg-blue-600 
                       rounded-r-lg hover:bg-blue-700 transition"
          >
            <FiSearch className="text-xl" />
          </button>
        </div>
      </div>

      {/* Mobile SearchBar (Navbar ke neeche full width) */}
      <div className="mt-3 md:hidden px-1">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full py-2 px-4 pr-10 rounded-lg text-gray-700 border border-gray-300 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-0 top-0 h-full px-3 text-blue-600">
            <FiSearch className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

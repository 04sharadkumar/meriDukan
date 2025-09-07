import React, { useState } from "react";
import {
  FiMenu,
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";
import { BiCategory } from "react-icons/bi";
import { IoFlashOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { cartItems = [] } = useCart();
  const { wishlist = {} } = useWishlist();

  return (
    <header className="bg-white sticky top-0 shadow-md z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Menu */}
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden text-blue-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FiMenu className="text-2xl" />
            </button>
            <Link to="/">
              <h1 className="text-2xl font-bold text-blue-600">Tanu & Manu</h1>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 mx-6">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full py-2.5 px-4 pr-10 rounded-lg text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-0 top-0 h-full px-4 text-blue-600">
                <FiSearch className="text-xl" />
              </button>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <Link to="/wishlist">
              <button className="relative text-blue-600 hover:text-blue-800">
                <FiHeart className="text-2xl" />
                {Object.keys(wishlist).length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Object.keys(wishlist).length}
                  </span>
                )}
              </button>
            </Link>

            <Link to="/cart">
              <button className="relative text-blue-600 hover:text-blue-800">
                <FiShoppingCart className="text-2xl" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </Link>

            <Link to="/profile">
              <button className="text-blue-600 hover:text-blue-800">
                <FiUser className="text-2xl" />
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full py-2 px-4 pr-10 rounded-lg text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-0 top-0 h-full px-3 text-blue-600">
              <FiSearch className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-blue-900 shadow-lg absolute top-16 left-0 right-0 z-20 p-4 border-t border-gray-200 rounded-b-xl">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <FiUser className="text-xl" />
              <span>My Account</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <FiHeart className="text-xl" />
              <span>Wishlist</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <BiCategory className="text-xl" />
              <span>Categories</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <IoFlashOutline className="text-xl" />
              <span>Offers</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;

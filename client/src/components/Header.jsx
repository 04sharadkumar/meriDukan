import React from "react";
import {
  FiUser,
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa"; // 🏬 shop icon
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import SearchBar from "./SearchBar";

function Header() {
  const { cartItems = [] } = useCart();
  const { wishlist = {} } = useWishlist();

  return (
    <header className="bg-white sticky top-0 shadow-md z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* ✅ Logo and Shop icon for mobile */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-1">
              {/* Mobile Logo */}
              
              <h1 className="text-2xl font-bold text-blue-600 sm:hidden">T&M</h1>
              {/* Shop Icon */}
              
            </Link>

            {/* Desktop Logo */}
            <Link to="/">
              <h1 className="text-2xl font-bold text-blue-600 hidden sm:block">
                Tanu & Manu
              </h1>
            </Link>
          </div>

          {/* ✅ SearchBar stays same */}
          <SearchBar />

          {/* ✅ Icons */}
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
      </div>
    </header>
  );
}

export default Header;

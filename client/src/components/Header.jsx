import React, { useState } from "react";
import {
  FiMenu,
  FiUser,
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";
import { BiCategory } from "react-icons/bi";
import { IoFlashOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import SearchBar from "./SearchBar";

function Header() {
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
              <h1 className="text-2xl font-bold text-blue-600 hidden  sm:block">Tanu & Manu</h1>
            </Link>
          </div>

          {/* ✅ Single SearchBar (handles desktop + mobile view) */}
          <SearchBar />

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

        {/* Mobile Menu */}
{mobileMenuOpen && (
  <div className="md:hidden fixed inset-0 z-50 flex">
    {/* Click outside overlay */}
    <div
      className="fixed inset-0 pointer-events-auto"
      onClick={() => setMobileMenuOpen(false)}
    ></div>

    {/* Sidebar */}
    <div
      className={`relative w-52 bg-white/30 backdrop-blur-md h-full shadow-lg transform transition-transform duration-300 ease-in-out pointer-events-auto ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Close Button */}
      <button
        className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 p-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        ✕
      </button>

      <div className="p-4 flex flex-col space-y-4 mt-6">
        <h2 className="text-lg font-bold text-blue-600 mb-3">Menu</h2>

        <Link
          to="/profile"
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50/30 transition"
          onClick={() => setMobileMenuOpen(false)}
        >
          <FiUser className="text-xl text-blue-600" />
          <span className="text-blue-700 font-medium text-sm">My Account</span>
        </Link>

        <Link
          to="/wishlist"
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50/30 transition"
          onClick={() => setMobileMenuOpen(false)}
        >
          <FiHeart className="text-xl text-blue-600" />
          <span className="text-blue-700 font-medium text-sm">Wishlist</span>
        </Link>

        <Link
          to="/categories"
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50/30 transition"
          onClick={() => setMobileMenuOpen(false)}
        >
          <BiCategory className="text-xl text-blue-600" />
          <span className="text-blue-700 font-medium text-sm">Categories</span>
        </Link>

        <Link
          to="/offers"
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50/30 transition"
          onClick={() => setMobileMenuOpen(false)}
        >
          <IoFlashOutline className="text-xl text-blue-600" />
          <span className="text-blue-700 font-medium text-sm">Offers</span>
        </Link>
      </div>
    </div>
  </div>
)}


      </div>
    </header>
  );
}


export default Header;

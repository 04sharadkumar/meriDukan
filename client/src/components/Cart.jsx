// Cart.jsx
"use client";
import { useEffect, useState } from "react";
import axiosInstance from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import LiveAddress from "./liveAddress";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/api/cart");
        

        setCart(res.data.items || []);
      } catch (err) {
        console.error("Failed to load cart:", err);
        toast.error("Unable to load cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Remove item
  const removeItem = async (itemId) => {
    try {
      await axiosInstance.delete(`/api/cart/single/${itemId}`);

      setCart((prev) => prev.filter((item) => item._id !== itemId));
      toast.success("Item removed from cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    }
  };

  // Update quantity
  const updateQuantity = async (itemId, qty) => {
    if (qty < 1) return;
    try {
      await axiosInstance.put(`/api/cart/${itemId}`, { quantity: qty });
      setCart((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, quantity: qty } : item
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quantity");
    }
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      navigate("/checkout");
    }
  };

  const clearCart = async () => {
    try {
      await axiosInstance.delete("/api/cart/clearAll");
      setCart([]);
      toast.success("Cart cleared!");
    } catch (err) {
      console.error("Clear cart failed:", err);
      toast.error("Failed to clear cart");
    }
  };

  // Totals
  const subtotal = cart.reduce(
  (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
  0
);
 const discount = cart.reduce(
  (sum, item) =>
    sum +
    ((item.price - (item.discountPrice || item.price)) > 0
      ? (item.price - (item.discountPrice || item.price)) * item.quantity
      : 0),
  0
);

const protectFee = cart.reduce(
  (sum, item) => sum + (item.protectFee || 0) * item.quantity,
  0
);
  const total = subtotal + protectFee;

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">Fetching your cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Address */}

            <LiveAddress />
            {/* Cart Items */}
            {cart.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-5 text-center text-gray-600">
                <p className="mb-4">Your cart is empty.</p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              cart.map((product) => {
                // const discountedPrice = product.price - (product.discount || 0);

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="flex justify-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-32 h-32 object-contain rounded-lg"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 text-lg mb-1">
                            {product.name}
                          </h3>

                          <p className="text-sm text-gray-500 mb-4">
                            Seller:{" "}
                            <span className="font-medium text-blue-600">
                              {product.seller || "Official Store"}
                            </span>
                          </p>

                          {/* Price Section */}
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="text-xl font-bold text-gray-800">
                              ₹{product.discountPrice || product.price}
                            </span>
                            {product.discountPrice && product.discountPrice < product.price &&  (
                              <>
                                <span className="line-through text-gray-500">
                                  ₹{product.price}
                                </span>
                                <span className="text-green-600 font-medium text-sm bg-green-100 px-2 py-1 rounded">
                                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% Off
                                 
                                </span>
                              </>
                            )}
                          </div>

                          {/* Protect Fee */}
                          {product.protectFee > 0 && (
                            <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                              <FaShieldAlt />
                              <span>
                                Protect Promise Fee: ₹{product.protectFee}
                              </span>
                            </div>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    product._id,
                                    product.quantity - 1
                                  )
                                }
                                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <FaMinus size={12} />
                              </button>
                              <span className="w-10 h-10 flex items-center justify-center text-gray-800 font-medium">
                                {product.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    product._id,
                                    product.quantity + 1
                                  )
                                }
                                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <FaPlus size={12} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(product._id)}
                              className="flex items-center gap-2 text-red-600 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                            >
                              <FaTrash />
                              REMOVE
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {cart.length > 0 && (
              <div className="p-5 bg-gray-50 rounded-xl shadow-md">
                <button
                  onClick={handleCheckout}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium text-sm w-full sm:w-auto float-right shadow-md hover:shadow-lg transition-all duration-300"
                >
                  PLACE ORDER
                </button>
                <button
                  onClick={clearCart}
                  className="mt-3 text-sm text-red-600 underline"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Right Section - Price Details */}
          {cart.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-5 h-fit sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-4 mb-4">
                PRICE DETAILS
              </h2>

            
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Price ({cart.length} item)
                  </span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>

                {protectFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protect Promise Fee</span>
                    <span>₹{protectFee}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="text-green-600">FREE</span>
                </div>
              </div>

              <hr className="my-4 border-gray-200" />

              <div className="flex justify-between font-bold text-lg text-gray-800 mb-4">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>

              <p className="text-green-600 font-medium text-sm py-3 border-t border-gray-200">
                You will save ₹{discount} on this order
              </p>

              <div className="mt-4 text-xs text-gray-500">
                <p>
                  Safe and Secure Payments. Easy returns. 100% Authentic
                  products.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;

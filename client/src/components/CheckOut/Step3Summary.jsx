"use client";
import { useEffect, useState } from "react";
import axiosInstance from "../../context/axiosInstance";
import toast from "react-hot-toast";

export default function Step3Summary({
  step,
  setStep,
  onCartUpdate,
  shippingInfo,
  paymentMethod,
  cart: cartProp = [],
}) {
  const [cart, setCart] = useState(cartProp || []);
  const [loading, setLoading] = useState(cartProp.length === 0); // 🔥 agar prop me data hai to loading=false

  useEffect(() => {
    if (step !== 3) return;

    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/api/cart");
        const items = (res.data.items || []).map((item) => ({
          ...item,
          quantity: item.quantity || item.qty || 1, // 🔥 normalize
        }));
        setCart(items);
        onCartUpdate && onCartUpdate(items);
      } catch (err) {
        console.error("Failed to load cart:", err);
        toast.error("Unable to load cart");
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [step]); // 🔥 warning hat gaya

  // Subtotal, discounts, etc.
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = cart.reduce(
    (sum, item) => sum + (item.discount || 0) * item.quantity,
    0
  );
  const protectFee = cart.reduce(
    (sum, item) => sum + (item.protectFee || 0) * item.quantity,
    0
  );
  const total = subtotal - discount + protectFee;

  if (step !== 3) return null;

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="border-b border-gray-200 bg-blue-50">
      <div
        className="flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors duration-200"
        onClick={() => setStep(3)}
      >
        <h2 className="font-semibold text-lg flex items-center gap-3">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-blue-600 text-white shadow-md">
            3
          </span>
          ORDER SUMMARY
        </h2>
        <span className="text-blue-600 text-sm">✓ ₹{total}</span>
      </div>

      <div className="p-6">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">
            Your cart is empty.
          </p>
        ) : (
          cart.map((item) => {
            const discountedPrice = item.price - (item.discount || 0);
            return (
              <div
                key={item._id || item.productId}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center mb-3 bg-white shadow-sm"
              >
                <div className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded-md mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-semibold">
                  ₹{discountedPrice * item.quantity}
                </span>
              </div>
            );
          })
        )}

        {cart.length > 0 && (
          <>
            <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center mb-3 bg-white">
              <span>Delivery Fee</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-xl">₹{total}</span>
            </div>

            <button
              onClick={() =>
                setStep(4, {
                  cartItems: cart.map((item) => ({
                    productId: item.productId || item._id,
                    name: item.name,
                    qty: item.quantity,
                    price: item.price,
                    image: item.image,
                  })),
                  totalAmount: {total},
                  shippingInfo,
                  paymentMethod,
                })
              }
              className="mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:opacity-90"
            >
              CONTINUE TO PAYMENT
            </button>
          </>
        )}
      </div>
    </div>
  );
}

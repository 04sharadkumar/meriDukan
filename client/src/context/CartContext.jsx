// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🟢 Fetch Cart Items from Backend
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/cart/my-cart", {
        withCredentials: true,
      });
      setCartItems(res.data?.items || []);
    } catch (err) {
      console.error("Fetch Cart Error:", err);
      setError("Failed to fetch cart. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Add Item to Cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await axios.post(
        "/api/cart/add",
        { productId, quantity },
        { withCredentials: true }
      );
      setCartItems(res.data?.items || []);
    } catch (err) {
      console.error("Add to Cart Error:", err);
    }
  };

  // 🟢 Remove Item from Cart
  const removeFromCart = async (productId) => {
    try {
      const res = await axios.post(
        "/api/cart/remove",
        { productId },
        { withCredentials: true }
      );
      setCartItems(res.data?.items || []);
    } catch (err) {
      console.error("Remove from Cart Error:", err);
    }
  };

  // 🟢 Clear Cart
  const clearCart = async () => {
    try {
      await axios.post(
        "/api/cart/clear",
        {},
        { withCredentials: true }
      );
      setCartItems([]);
    } catch (err) {
      console.error("Clear Cart Error:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 🟢 Custom hook
export const useCart = () => useContext(CartContext);

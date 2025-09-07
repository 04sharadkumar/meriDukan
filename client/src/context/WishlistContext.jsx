import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axios from '../context/axiosInstance';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({}); // { productId: true }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist on user change
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user) {
          const res = await axios.get('/api/wishlist');
          const wishlistMap = {};
          res.data?.wishlist?.forEach(item => {
            if (item.productId) wishlistMap[item.productId] = true;
          });
          setWishlist(wishlistMap);
        } else {
          const local = localStorage.getItem('wishlist');
          setWishlist(local ? JSON.parse(local) : {});
        }
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  // Toggle wishlist item
  const toggleWishlist = async (product) => {
    const updated = { ...wishlist };
    const isAdded = !updated[product._id];

    // Optimistic UI update
    if (isAdded) updated[product._id] = true;
    else delete updated[product._id];

    setWishlist(updated);

    try {
      if (!user) {
        localStorage.setItem('wishlist', JSON.stringify(updated));
      } else {
        if (isAdded) await axios.post('/api/wishlist', { productId: product._id });
        else await axios.delete(`/api/wishlist/${product._id}`);
      }
    } catch (err) {
      console.error('Wishlist update failed:', err);
      setWishlist(wishlist); // rollback on error
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => !!wishlist[productId];

  // Clear entire wishlist
  const clearWishlist = async () => {
    setWishlist({});
    if (user) {
      try {
        await axios.delete('/api/wishlist'); // delete all items
      } catch (err) {
        console.error('Failed to clear wishlist:', err);
      }
    } else {
      localStorage.removeItem('wishlist');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: Object.keys(wishlist).length,
        loading,
        error,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// Hook for easy usage
export const useWishlist = () => useContext(WishlistContext);

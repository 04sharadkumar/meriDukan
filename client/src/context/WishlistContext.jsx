import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import axiosInstance from "./axiosInstance";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  const [wishlist, setWishlist] = useState({}); // { productId: wishlistItemId }
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);

  const mergeWishlists = (serverList, localList) => ({ ...serverList, ...localList });

  // 🔹 Fetch wishlist
  useEffect(() => {
    
    const fetchWishlist = async () => {
      setLoadingFetch(true);
      setError(null);
      try {
        if (user) {
          const res = await axiosInstance.get("/api/wishlist");
          const serverWishlist = {};
          res.data?.wishlist?.forEach((item) => {
            if (item.productId) serverWishlist[item.productId] = item._id; // store wishlist item id
          });

          const local = localStorage.getItem("wishlist");
          const localWishlist = local ? JSON.parse(local) : {};
          const merged = mergeWishlists(serverWishlist, localWishlist);

          setWishlist(merged);
          localStorage.removeItem("wishlist");
        } else {
          const local = localStorage.getItem("wishlist");
          setWishlist(local ? JSON.parse(local) : {});
        }
      } catch (err) {
        console.error("❌ Failed to fetch wishlist:", err);
        setError("Failed to load wishlist");
      } finally {
        setLoadingFetch(false);
      }
    };

    fetchWishlist();
  }, [user]);

  // 🔹 Toggle wishlist (Add / Remove)
const toggleWishlist = useCallback(
  async (product) => {
    const prevWishlist = { ...wishlist };
    const isAdded = !wishlist[product._id];

    try {
      setLoadingAction(true);

      if (!user) {
        // Guest user -> local storage
        const updated = { ...wishlist };
        if (isAdded) updated[product._id] = true;
        else delete updated[product._id];
        setWishlist(updated);
        localStorage.setItem("wishlist", JSON.stringify(updated));
        toast.success(isAdded ? "Added to wishlist!" : "Removed from wishlist!");
      } else {
        if (isAdded) {
          const res = await axiosInstance.post("/api/wishlist", { productId: product._id });
          const wishlistItemId = res.data?.item?._id; // ✅ subdocument _id
          if (!wishlistItemId) throw new Error("Wishlist item ID not returned by server");
          setWishlist((prev) => ({ ...prev, [product._id]: wishlistItemId }));
          toast.success("Added to wishlist!");
        } else {
          const wishlistItemId = prevWishlist[product._id]; // ✅ use stored subdocument _id
          if (!wishlistItemId) throw new Error("Wishlist item ID not found");

          await axiosInstance.delete(`/api/wishlist/${wishlistItemId}`);
          const updated = { ...prevWishlist };
          delete updated[product._id];
          setWishlist(updated);
          toast.success("Removed from wishlist!");
        }
      }
    } catch (err) {
      console.error("❌ Wishlist update failed:", err);
      setWishlist(prevWishlist);
      toast.error("Wishlist update failed!");
    } finally {
      setLoadingAction(false);
    }
  },
  [wishlist, user]
);



  const isInWishlist = useCallback((productId) => !!wishlist[productId], [wishlist]);

  const clearWishlist = useCallback(async () => {
    const prevWishlist = { ...wishlist };
    setWishlist({});

    try {
      setLoadingAction(true);
      if (user) await axiosInstance.delete("/api/wishlist"); // clear server wishlist
      else localStorage.removeItem("wishlist");
      toast.success("Wishlist cleared!");
    } catch (err) {
      console.error("❌ Failed to clear wishlist:", err);
      setWishlist(prevWishlist);
      toast.error("Failed to clear wishlist");
    } finally {
      setLoadingAction(false);
    }
  }, [wishlist, user]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: Object.keys(wishlist).length,
        loadingFetch,
        loadingAction,
        error,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

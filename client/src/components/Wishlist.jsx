import { useState, useEffect } from 'react';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../context/axiosInstance';
import toast from 'react-hot-toast';


const Wishlist = ({ addToCart }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load wishlist items
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        if (user) {
          const res = await axiosInstance.get('/api/wishlist');

          console.log(res.data);
          
          setWishlistItems(res.data.wishlist || []);
        } else {
          const local = localStorage.getItem('wishlistItems');
          setWishlistItems(local ? JSON.parse(local) : []);
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    };
    loadWishlist();
  }, [user]);

  // Save to localStorage
  const saveWishlistLocal = (items) => {
    localStorage.setItem('wishlistItems', JSON.stringify(items));
  };

  // Remove item from wishlist

const removeFromWishlist = async (productId) => {
  const updatedItems = wishlistItems.filter(item => item.productId._id !== productId);
  setWishlistItems(updatedItems);

  if (user) {
    try {
      await axiosInstance.delete('/api/wishlist', {
        data: { productId },
      });
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
    }
  } else {
    saveWishlistLocal(updatedItems);
  }
};


  // Move all to cart
const moveAllToCart = async () => {
  try {
    if (!user) {
      // Guest user: localStorage se cart me add karo
      wishlistItems.forEach(item => addToCart(item.productId));
      setWishlistItems([]);
      localStorage.removeItem("wishlistItems");
      toast.success("All items moved to cart!");
      return;
    }

    // Logged in user: backend API call
    await axiosInstance.post("/api/cart/wishlist/move-to-cart");
    setWishlistItems([]);
    toast.success("All items moved to cart!");
  } catch (error) {
    console.error("Error moving all to cart:", error);
    toast.error("Something went wrong!");
  }
};

const handleAddToCart = async (productId) => {
  try {
    await axiosInstance.post('/api/cart', {
      productId,
      quantity: 1,
    });

    // Remove from wishlist also
    removeFromWishlist(productId);

    toast.success('Moved to cart!');
  } catch (err) {
    console.log(err);
    toast.error('Login to add to cart');
  }
};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <span className="ml-3 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
          {wishlistItems.length} items
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FiHeart className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Save your favorite items here for later.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={moveAllToCart}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <FiShoppingCart /> Move All to Cart
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(item => {
              const product = item.productId;
              if (!product) return null;

              return (
                <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                  <div className="relative">
                    <img
                      src={product.images?.[0]?.url || product.image || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-50 hover:text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${product.stock ? 'text-green-700' : 'text-red-600'}`}>
                        {product.stock ? 'In Stock' : 'Out of Stock'}
                      </span>


                      <button
                        disabled={!product.stock}
                        onClick={() => handleAddToCart(product._id)}
                        className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                          product.stock
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FiShoppingCart size={14} />
                        {product.stock ? 'Add to Cart' : 'Notify Me'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-blue-50 p-4 rounded-lg flex justify-between items-center">
            <p className="text-gray-600">
              Items in your wishlist are not reserved. Add to cart to complete your purchase.
            </p>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              Continue Shopping <FiArrowRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;

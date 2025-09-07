import { FiHeart, FiChevronRight } from "react-icons/fi";
import { IoFlashOutline } from "react-icons/io5";
import axios from "axios";
import { useState, useEffect } from "react";
import axiosInstance from "../../context/axiosInstance";
import toast from "react-hot-toast";

function FlashSale() {
  const [flashProducts, setFlashProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState({});
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  useEffect(() => {
    const fetchFlashProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/products/flash-sale"
        );
        setFlashProducts(res.data);
      } catch (err) {
        console.error("Error fetching flash sale products:", err);
      }
    };

    fetchFlashProducts();
  }, []);

  const toggleWishlist = (productId) => {
    setIsWishlisted((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleAddToCart = async (productId) => {
    try {
      await axiosInstance.post("/api/cart", {
        productId,
        quantity: 1,
      });
      toast.success("Added to cart!");
    } catch (err) {
      console.log(err);
      toast.error("Login to add to cart");
    }
  };

  function getTimeRemaining() {
    const now = new Date();
    const currentMillis = now.getTime();

    const cycleMillis = 4 * 60 * 60 * 1000; // 4 hours in ms
    const timeElapsedInCycle = currentMillis % cycleMillis;
    const timeRemaining = cycleMillis - timeElapsedInCycle;

    const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
    const seconds = Math.floor((timeRemaining / 1000) % 60);

    return { hours, minutes, seconds };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mb-16 relative overflow-hidden  shadow-lg bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
      <div className="relative z-10 p-6 sm:p-10">
        {/* Header + Timer */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <IoFlashOutline className="text-4xl text-yellow-300 animate-pulse mr-2" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide">
              FLASH SALE
            </h2>
          </div>
          <p className="text-blue-100 text-sm sm:text-base mb-6">
            Limited time offers – Grab your deal before time runs out!
          </p>

          {/* Timer */}
          <div className="flex justify-center space-x-3">
            {[
              {
                value: timeLeft.hours.toString().padStart(2, "0"),
                label: "HRS",
              },
              {
                value: timeLeft.minutes.toString().padStart(2, "0"),
                label: "MIN",
              },
              {
                value: timeLeft.seconds.toString().padStart(2, "0"),
                label: "SEC",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white text-blue-700 rounded-lg px-4 py-3 shadow-md"
              >
                <p className="text-2xl font-bold font-mono">{item.value}</p>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="relative">
          {/* Mobile = horizontal scroll | Desktop = grid */}
          <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 scrollbar-hide">
            {flashProducts.slice(0, 10).map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 sm:flex-shrink bg-white rounded-xl shadow-md overflow-hidden w-44 sm:w-auto cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-40 sm:h-48">
                  <img
                    src={product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Wishlist */}
                  <button
                    className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
                      isWishlisted[product.id]
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700"
                    } shadow hover:bg-blue-600 hover:text-white`}
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <FiHeart
                      className={`${
                        isWishlisted[product.id] ? "fill-current" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col justify-between h-32">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {product.name}
                  </h3>
                  <div>
                    <p className="text-lg font-bold text-blue-700">
                      ₹{product.discountPrice}
                    </p>
                    {product.originalPrice && (
                      <p className="text-xs line-through text-gray-400">
                        ₹{product.price}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="mt-2 w-full bg-blue-600 text-white py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8 text-center">
          <button className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-3 rounded-full font-bold text-sm flex items-center justify-center mx-auto shadow-lg transition">
            SHOP NOW <FiChevronRight className="ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default FlashSale;

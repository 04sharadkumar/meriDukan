import React, { useState, useEffect } from "react";

const Banner = () => {
  const images = [
    "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Light Overlay (for text readability but keep image clear) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative flex justify-end items-center h-full px-6 sm:px-12 lg:px-20">
        <div className="text-right max-w-lg">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-blue-700 drop-shadow-md">
            Elevate Your Style
          </h1>
          <p className="mt-4 text-gray-700 text-sm sm:text-base lg:text-lg font-medium">
            Discover our latest clothing collection designed for comfort and
            elegance. Shop now and refresh your wardrobe with premium styles.
          </p>
          <div className="mt-6 flex justify-end space-x-4">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-blue-700 transition-all">
              Shop Now
            </button>
            <button className="bg-white text-blue-600 border border-blue-600 px-5 py-2 rounded-full shadow-md hover:bg-gray-100 transition-all">
              Explore
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;

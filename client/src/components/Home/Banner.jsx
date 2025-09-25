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
    }, 8000); // 8 seconds for faster transitions

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
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}

        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 flex justify-end items-center h-full px-6 sm:px-12 lg:px-20">
        <div className="text-right max-w-lg sm:max-w-xl lg:max-w-2xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg leading-tight sm:leading-tight lg:leading-tight">
            Elevate Your Style
          </h1>
          <p className="mt-4 text-gray-200 text-sm sm:text-base lg:text-lg font-medium drop-shadow-sm">
            Discover our latest clothing collection designed for comfort and
            elegance. Shop now and refresh your wardrobe with premium styles.
          </p>
          <div className="mt-6 flex justify-end flex-wrap gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105">
              Shop Now
            </button>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Optional small indicators */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {images.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-125" : "bg-white/50"
            }`}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default Banner;

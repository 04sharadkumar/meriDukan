import React, { useState, useEffect } from "react";
import axios from "axios";

const Banner = () => {
  // Default fallback banners
  const fallbackBanners = [
    {
      imageUrl: "https://via.placeholder.com/1600x600.png?text=Default+Banner+1",
      title: "Default Title 1",
      subtitle: "Default Subtitle 1",
    },
    {
      imageUrl: "https://via.placeholder.com/1600x600.png?text=Default+Banner+2",
      title: "Default Title 2",
      subtitle: "Default Subtitle 2",
    },
  ];

  const [banners, setBanners] = useState(fallbackBanners);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/banners"); // 👈 update URL if needed

        console.log(res.data);

        if (res.data && res.data.banners.length > 0) {
          setBanners(res.data.banners); // use backend banners
        }
      } catch (err) {
        console.warn("⚠️ Using fallback banners (network issue):", err.message);
        setBanners(fallbackBanners);
      }
    };

    fetchBanners();
  }, []);

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners]);

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner.imageUrl}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 flex justify-end items-center h-full px-6 sm:px-12 lg:px-20">
        <div className="text-right max-w-lg sm:max-w-xl lg:max-w-2xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg leading-tight sm:leading-tight lg:leading-tight">
            {currentBanner?.title || "Default Title"}
          </h1>
          <p className="mt-4 text-gray-200 text-sm sm:text-base lg:text-lg font-medium drop-shadow-sm">
            {currentBanner?.subtitle || "Default Subtitle"}
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

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {banners.map((_, index) => (
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

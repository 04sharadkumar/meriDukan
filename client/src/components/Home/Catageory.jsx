import { FiChevronRight } from "react-icons/fi";
import { BiCategory } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Category() {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { id: 1, name: "Women Fashion", image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=200" },
    { id: 2, name: "Beauty", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200" },
    { id: 3, name: "Kids & Toys", image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=200" },
    { id: 4, name: "Men Fashion", image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=200" },
    { id: 5, name: "Electronics", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200" },
    { id: 6, name: "Home & Furniture", image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=200" },
    { id: 7, name: "Sports", image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=200" },
    { id: 8, name: "Groceries", image: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=200" },
  ];

  // sirf 4 dikhane ke liye
  const displayedCategories = showAll ? categories : categories.slice(0, 6);

  return (
    <section className="mb-16 px-4 mt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <BiCategory className="text-3xl text-blue-600 z-10 relative" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Trending Categories
            </span>
          </h2>
        </div>

        <button
          onClick={() => setShowAll(!showAll)}
          className="group flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
          aria-label="Browse all categories"
        >
          <span className="text-blue-600 font-medium text-sm">
            {showAll ? "Show Less" : "Explore All"}
          </span>
          <div className="relative w-5 h-5 overflow-hidden">
            <FiChevronRight className="absolute top-0 left-0 text-blue-600 transition-transform duration-300 group-hover:translate-x-full" />
            <FiChevronRight className="absolute top-0 -left-full text-blue-600 transition-transform duration-300 group-hover:translate-x-full" />
          </div>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {displayedCategories.map((category) => (
          <div
            key={category.id}
            className="group cursor-pointer"
            onClick={() =>
              navigate(`/products?category=${encodeURIComponent(category.name)}`)
            }
          >
            <div className="bg-white rounded-2xl shadow-md p-5 text-center h-full flex flex-col items-center justify-center transition-all duration-500 group-hover:shadow-xl border border-blue-100">
              <div className="relative mb-4 w-20 h-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-16 h-16 object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                {category.name}
              </p>
             
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Category;

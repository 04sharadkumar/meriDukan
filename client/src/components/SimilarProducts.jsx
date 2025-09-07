import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const SimilarProducts = ({ productId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/similar/${productId}`
        );
        setSimilarProducts(res.data.products || []); // ✅ products (plural) ka dhyan
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId]);

  if (loading) return <p>Loading similar products...</p>;

  if (similarProducts.length === 0) {
    return (
      <p className="text-gray-500 text-sm mt-4">
        No similar products found.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Similar Products
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {similarProducts.map((prod) => (
          <Link
            key={prod._id}
            to={`/productDetail?id=${prod._id}`}
            className="block bg-gray-50 rounded-lg shadow hover:shadow-lg transition"
          >
            <img
              src={prod.images?.[0]?.url || "/placeholder-product-2.jpg"}
              alt={prod.name}
              className="w-full h-40 object-cover rounded-t-lg"
            />
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                {prod.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold text-sm">
                  ₹{prod.discountPrice}
                </span>
                <span className="text-gray-500 line-through text-xs">
                  ₹{prod.price}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;

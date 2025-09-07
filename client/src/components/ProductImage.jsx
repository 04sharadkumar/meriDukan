import { useState, useEffect } from "react";
import axios from "axios";

const ProductImages = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/products/allProduct/${productId}`
        );

        // 👇 yahan dhyaan rahe response me `product` key h ya direct product object
        setProduct(res.data.product || res.data); 
        setMainImage(0); // default 1st image
        console.log("Fetched Product:", res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  if (loading) {
    return <p className="text-gray-500">Loading product images...</p>;
  }

  if (!product) {
    return <p className="text-red-500">Product not found.</p>;
  }

  const productImages = product?.images || [];

  if (productImages.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
        <div className="aspect-square flex items-center justify-center bg-gray-50">
          <img
            src="/placeholder.jpg"
            alt="No product images"
            className="object-contain w-full h-full p-8"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main Image */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
        <div className="aspect-square flex items-center justify-center bg-gray-50 relative">
          <img
            src={productImages[mainImage]?.url || "/placeholder.jpg"}
            alt={`Main product view ${mainImage + 1}`}
            className="object-contain w-full h-full p-8"
          />
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            {mainImage + 1}/{productImages.length}
          </div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-3 mb-6">
        {productImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(index)}
            className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
              mainImage === index ? "border-blue-500" : "border-transparent"
            }`}
          >
            <img
              src={img.url}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;

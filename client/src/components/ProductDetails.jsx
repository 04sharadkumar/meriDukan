import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Review from "./Product/Review";
import axiosInstance from "../context/axiosInstance";
import toast from "react-hot-toast";
import SimilarProducts  from './SimilarProducts'
import ProductImage from './ProductImage'

const ProductPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get("id");

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
 
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  });
  
  
  



  const sizes = [
    {
      code: "XS",
      details:
        "Bust Size: 34 in, Shoulder Size: 14 in, Kurta Waist Size: 32 in",
    },
    {
      code: "S",
      details:
        "Bust Size: 36 in, Shoulder Size: 14.5 in, Kurta Waist Size: 34 in",
    },
    {
      code: "M",
      details:
        "Bust Size: 38 in, Shoulder Size: 15 in, Kurta Waist Size: 36 in",
    },
    {
      code: "L",
      details:
        "Bust Size: 40 in, Shoulder Size: 15.5 in, Kurta Waist Size: 38 in",
    },
    {
      code: "XL",
      details:
        "Bust Size: 42 in, Shoulder Size: 16 in, Kurta Waist Size: 40 in",
    },
    {
      code: "XXL",
      details:
        "Bust Size: 44 in, Shoulder Size: 16.5 in, Kurta Waist Size: 42 in",
    },
  ];




  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/review/stats/${productId}`
        );
        setReviewStats(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching review count:", error);
      }
    };

    if (productId) {
      fetchReview();
    }
  }, [productId]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/allProduct/${productId}`
        );

        setProduct(res.data.product);
        console.log(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  if (!product) return <p>Loading...</p>;

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Section 1: Product Images and Actions */}
        <div className="lg:w-1/2">
          <div className="sticky top-4">
            {/* Main Product Image */}
           <ProductImage productId={productId} />

           

            {/* Product Title and Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.discountPrice}
                  </span>
                  <span className="text-gray-500 ml-2 line-through">₹{product.price}</span>
                  
                </div>

              
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  onClick={() => handleAddToCart(product._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Add to Cart
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Buy Now
                </button>
              </div>

             
            </div>

           {/* Similar Products Section */}
           <SimilarProducts productId={productId} />

          </div>
        </div>

        {/* Section 2: Product Details*/}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= 4 ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {reviewStats.averageRating} ({reviewStats.totalReviews}{" "}
                    reviews)
                  </span>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">View all</span>
              </button>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Select Size</h3>
                <button
                  onClick={() => setShowAllSizes(!showAllSizes)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showAllSizes ? "Show less" : "Size guide"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                {sizes.slice(0, showAllSizes ? sizes.length : 3).map((size) => (
                  <button
                    key={size.code}
                    onClick={() => setSelectedSize(size.code)}
                    className={`border rounded-lg py-2 px-3 text-center transition-all ${
                      selectedSize === size.code
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {size.code}
                  </button>
                ))}
              </div>

              {selectedSize && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                  <p>
                    <span className="font-medium">{selectedSize}:</span>{" "}
                    {sizes.find((s) => s.code === selectedSize).details}
                  </p>
                </div>
              )}
            </div>

            {/* Product Details Accordion */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold mb-2">Product Description:</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold mb-2">Additional Information</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {product.additionalInfo &&
                  product.additionalInfo.length > 0 ? (
                    product.additionalInfo.map((info, index) => (
                      <li key={index}>
                        <span className="font-medium">{info.key}: </span>
                        {info.value}
                      </li>
                    ))
                  ) : (
                    <li>No additional information available</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* Left column */}
                  <div className="space-y-2">
                    {product.specifications &&
                      product.specifications
                        .slice(0, Math.ceil(product.specifications.length / 2)) // first half
                        .map((spec, index) => (
                          <p key={index}>
                            <span className="font-medium text-gray-600">
                              {spec.key}:
                            </span>{" "}
                            {spec.value}
                          </p>
                        ))}
                  </div>

                  {/* Right column */}
                  <div className="space-y-2">
                    {product.specifications &&
                      product.specifications
                        .slice(Math.ceil(product.specifications.length / 2)) // second half
                        .map((spec, index) => (
                          <p key={index}>
                            <span className="font-medium text-gray-600">
                              {spec.key}:
                            </span>{" "}
                            {spec.value}
                          </p>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ratings and Reviews */}
          <Review />
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

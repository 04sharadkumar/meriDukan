import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    category: "",
    brand: "",
  });

  const [currentImages, setCurrentImages] = useState([]); // product existing images
  const [newImages, setNewImages] = useState([]); // new uploaded images
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/allProduct/${id}`,
          { withCredentials: true }
        );

        const product = res.data.product || res.data;

        setForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          discountPrice: product.discountPrice || "",
          stock: product.stock || "",
          category: product.category || "",
          brand: product.brand || "",
        });

        setCurrentImages(product.images || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle multiple image uploads
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    setNewImages(validFiles);

    // preview for new images
    setPreview(validFiles.map((file) => URL.createObjectURL(file)));
  };

  // ✅ Submit updated product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      // append new images if any
      newImages.forEach((file) => {
        formData.append("images", file);
      });

      await axios.put(
        `http://localhost:5000/api/admin/Singleproducts/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.success("✅ Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Edit Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ✅ Input fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["name", "brand", "category", "price", "discountPrice", "stock"].map(
              (field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    id={field}
                    name={field}
                    type={
                      field === "price" ||
                      field === "stock" ||
                      field === "discountPrice"
                        ? "number"
                        : "text"
                    }
                    value={form[field]}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              )
            )}
          </div>

          {/* ✅ Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* ✅ Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Images (max 3)
            </label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full border p-3 rounded-lg"
            />

            {/* Existing Images */}
            {currentImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {currentImages.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt="Current"
                    className="h-32 object-contain border rounded"
                  />
                ))}
              </div>
            )}

            {/* Preview New Images */}
            {preview.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {preview.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt="Preview"
                    className="h-32 object-contain border rounded"
                  />
                ))}
              </div>
            )}
          </div>

          {/* ✅ Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-3 rounded-lg text-white ${
                submitting
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {submitting ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;

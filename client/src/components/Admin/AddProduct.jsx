import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { categories, brands } from "../../data/filterData.js";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    category: "",
    subCategory: "",
    brand: "",
    sizes: [],
  });

  const [images, setImages] = useState([]);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [additionalInfo, setAdditionalInfo] = useState([{ key: "", value: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Handle basic input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    e.target.value = "";
  };

  // Dynamic fields for specifications & additional info
  const handleDynamicChange = (index, type, field, value) => {
    if (type === "specifications") {
      const newSpecs = [...specifications];
      newSpecs[index][field] = value;
      setSpecifications(newSpecs);
    } else {
      const newInfo = [...additionalInfo];
      newInfo[index][field] = value;
      setAdditionalInfo(newInfo);
    }
  };

  const addDynamicField = (type) => {
    if (type === "specifications") {
      setSpecifications([...specifications, { key: "", value: "" }]);
    } else {
      setAdditionalInfo([...additionalInfo, { key: "", value: "" }]);
    }
  };

  const removeDynamicField = (index, type) => {
    if (type === "specifications") {
      setSpecifications(specifications.filter((_, i) => i !== index));
    } else {
      setAdditionalInfo(additionalInfo.filter((_, i) => i !== index));
    }
  };

  // Get subcategories based on selected main category
  const selectedCategoryObj = categories.find((c) => c.name === form.category);
  const subCategories = selectedCategoryObj?.sub || [];

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (Array.isArray(form[key])) {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });

      images.forEach((img) => {
        formData.append("images", img);
      });

      formData.append("specifications", JSON.stringify(specifications));
      formData.append("additionalInfo", JSON.stringify(additionalInfo));

       await axios.post("http://localhost:5000/api/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      
      

      toast.success("✅ Product added successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            {/* Brand dropdown + custom input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <div className="flex gap-2">
                <select
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="w-1/2 p-2 border rounded-lg"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b, index) => (
                    <option key={`${b}-${index}`} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter new brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-1/2 p-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Category dropdown + custom input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <div className="flex gap-2">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-1/2 p-2 border rounded-lg"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat, index) => (
                    <option key={`${cat.name}-${index}`} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter new category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-1/2 p-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Subcategory dropdown (only if category has subs) */}
            {subCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                <select
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Subcategory</option>
                  {subCategories.map((sub, index) => (
                    <option key={`${sub}-${index}`} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount Price (₹)</label>
              <input
                name="discountPrice"
                type="number"
                value={form.discountPrice}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500"
            />
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Specifications</label>
            {specifications.map((spec, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={spec.key}
                  onChange={(e) =>
                    handleDynamicChange(i, "specifications", "key", e.target.value)
                  }
                  className="flex-1 p-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) =>
                    handleDynamicChange(i, "specifications", "value", e.target.value)
                  }
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeDynamicField(i, "specifications")}
                  className="px-2 bg-red-500 text-white rounded"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addDynamicField("specifications")}
              className="px-4 py-1 mt-2 bg-blue-500 text-white rounded"
            >
              + Add Specification
            </button>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Info</label>
            {additionalInfo.map((info, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={info.key}
                  onChange={(e) =>
                    handleDynamicChange(i, "additionalInfo", "key", e.target.value)
                  }
                  className="flex-1 p-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={info.value}
                  onChange={(e) =>
                    handleDynamicChange(i, "additionalInfo", "value", e.target.value)
                  }
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeDynamicField(i, "additionalInfo")}
                  className="px-2 bg-red-500 text-white rounded"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addDynamicField("additionalInfo")}
              className="px-4 py-1 mt-2 bg-green-500 text-white rounded"
            >
              + Add Info
            </button>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg text-white ${
                isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Processing..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    category: "",
    brand: "",
    sizes: [],
  });

  const [images, setImages] = useState([]); // multiple images
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [additionalInfo, setAdditionalInfo] = useState([{ key: "", value: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // handle basic input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // multiple images select
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    // Reset value so same file can be chosen again
    e.target.value = "";
  };

  // dynamic fields for specs & info
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // append basic fields
      Object.keys(form).forEach((key) => {
        if (Array.isArray(form[key])) {
          formData.append(key, JSON.stringify(form[key])); // handle sizes array
        } else {
          formData.append(key, form[key]);
        }
      });

      // append images
      images.forEach((img) => {
        formData.append("images", img); // must match backend upload.array("images")
      });

      // append specs & info as JSON
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

  const categories = [
  // Clothing - Women
  "Women T-shirts",
  "Women Tops And Tunics",
  "Women Kurtas",
  "Women Sarees",
  "Women Dresses",
  "Women Jeans",
  "Women Skirts",
  "Women Jackets",
  "Women Sweaters",
  "Women Shorts",
  "Women Leggings",

  // Clothing - Men
  "Men T-shirts",
  "Men Shirts",
  "Men Jeans",
  "Men Trousers",
  "Men Shorts",
  "Men Jackets",
  "Men Sweaters",
  "Men Kurta",
  
  // Clothing - Kids
  "Kids T-shirts",
  "Kids Dresses",
  "Kids Shorts",
  "Kids Jackets",
  "Baby Clothing",

  // Clothing - Accessories
  "Caps & Hats",
  "Belts",
  "Scarves & Mufflers",
  "Socks",
  "Innerwear",
  "Nightwear",

  // Beauty Section
  "Face Wash",
  "Moisturizer",
  "Lipstick",
  "Kajal",
  "Nail Polish",
  "Perfume",
  "Hair Oil",
  "Hair Shampoo",
  "Body Lotions & Creams",
  "Hand Sanitizer",
  "Hand Wash",
];


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic fields */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {["name", "brand", "category", "price", "discountPrice", "stock"].map((field) => {
    // Category field ko select banate hain
    if (field === "category") {
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Baaki fields normal input
    return (
      <div key={field}>
        <label className="block text-sm font-medium text-gray-700">
          {field.charAt(0).toUpperCase() + field.slice(1)}
        </label>

        <input
          name={field}
          type={["price", "discountPrice", "stock"].includes(field)
            ? "number"
            : "text"}
          value={form[field]}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          required={["name", "category", "price", "stock"].includes(field)}
        />
      </div>
    );
  })}
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

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500"
            />
            {/* 🔴 Removed preview rendering */}
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
                  onChange={(e) => handleDynamicChange(i, "specifications", "key", e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => handleDynamicChange(i, "specifications", "value", e.target.value)}
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
                  onChange={(e) => handleDynamicChange(i, "additionalInfo", "key", e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={info.value}
                  onChange={(e) => handleDynamicChange(i, "additionalInfo", "value", e.target.value)}
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

          {/* Submit */}
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

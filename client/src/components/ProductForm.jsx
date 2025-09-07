import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

const ProductForm = () => {
  const { id } = useParams(); // Product ID for edit
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    isFeatured: false,
    images: [],
  });

  const [loading, setLoading] = useState(false);

  // Load product data on edit
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        const p = res.data.product || res.data;

        setForm({
          name: p.name || '',
          description: p.description || '',
          price: p.price || '',
          category: p.category || '',
          brand: p.brand || '',
          stock: p.stock || '',
          isFeatured: p.isFeatured || false,
          images: p.images || [],
        });
      } catch (err) {
        toast.error('Failed to load product');
        console.error(err);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Upload image to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_upload_preset'); // 🔁 Change to your actual preset

    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', formData); // 🔁 Replace cloud name
      const newImage = {
        url: res.data.secure_url,
        public_id: res.data.public_id,
      };

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, newImage],
      }));
    } catch (err) {
      toast.error('Image upload failed');
      console.error(err);
    }
  };

  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await axios.put(`/api/products/${id}`, form);
        toast.success('Product updated');
      } else {
        await axios.post('/api/products', form);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Product deleted');
      navigate('/admin/products');
    } catch (err) {
      console.log(err);
      
      toast.error('Delete failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">{id ? 'Edit' : 'Create'} Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="brand"
          value={form.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="w-full p-2 border rounded"
        />
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock"
          className="w-full p-2 border rounded"
        />
        <label className="block">
          <input
            type="checkbox"
            name="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
            className="mr-2"
          />
          Is Featured?
        </label>
        <input type="file" onChange={handleImageUpload} className="block" />

        <div className="flex flex-wrap gap-2">
          {form.images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt="Preview"
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
          </button>
          {id && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

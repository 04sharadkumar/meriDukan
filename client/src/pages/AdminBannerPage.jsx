import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminBannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  // New text fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  // Fetch banners from backend
  const fetchBanners = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/banners");
      setBanners(res.data.banners || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch banners");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle file selection + preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Upload or update banner
  const handleUpload = async () => {
    if (!title || !subtitle) {
      toast.error("Please fill in title and subtitle");
      return;
    }

    const formData = new FormData();
    if (selectedFile) formData.append("image", selectedFile);
    formData.append("title", title);
    formData.append("subtitle", subtitle);

    try {
      setLoading(true);
      if (editId) {
        await axios.put(
          `http://localhost:5000/api/admin/banners/${editId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Banner updated!");
      } else {
        await axios.post("http://localhost:5000/api/admin/banners", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Banner added!");
      }

      // Reset state
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  // Delete banner
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/banners/${id}`);
      toast.success("Banner deleted!");
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete banner");
    }
  };

  // Enter edit mode
  const handleEditClick = (banner) => {
    setEditId(banner._id);
    setPreviewUrl(banner.imageUrl);
    setTitle(banner.title || "");
    setSubtitle(banner.subtitle || "");
    setSelectedFile(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setEditId(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle("");
    setSubtitle("");
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Homepage Banners</h1>

      {/* Upload/Edit Banner */}
      <div className="bg-white p-6 rounded shadow mb-8 flex flex-col gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="h-24 w-48 object-cover rounded border"
          />
        )}

        {/* Title input */}
        <input
          type="text"
          placeholder="Banner Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full"
        />

        {/* Subtitle input */}
        <textarea
          placeholder="Banner Subtitle / Description"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="border p-2 rounded w-full"
          rows="2"
        ></textarea>

        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            {loading
              ? "Saving..."
              : editId
              ? "Update Banner"
              : "Add New Banner"}
          </button>
          {editId && (
            <button
              onClick={handleCancelEdit}
              className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Existing Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {banners.map((banner) => (
          <div
            key={banner._id}
            className="relative bg-white rounded shadow overflow-hidden"
          >
            <img
              src={banner.imageUrl}
              alt="Banner"
              className="w-full h-48 object-cover"
            />
            <div className="p-3">
              <h3 className="font-bold text-gray-800">{banner.title}</h3>
              <p className="text-gray-600 text-sm">{banner.subtitle}</p>
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => handleEditClick(banner)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(banner._id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBannerPage;

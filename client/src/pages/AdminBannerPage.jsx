import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminBannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Upload new banner
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/admin/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Banner added!");
      setSelectedFile(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add banner");
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

  // Optional: Edit banner image
  const handleEdit = async (id) => {
    if (!selectedFile) {
      toast.error("Select a new image to update");
      return;
    }
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/admin/banners/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Banner updated!");
      setSelectedFile(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Homepage Banners</h1>

      {/* Upload New Banner */}
      <div className="bg-white p-6 rounded shadow mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Uploading..." : "Add New Banner"}
        </button>
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
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => handleEdit(banner._id)}
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

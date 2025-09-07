import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AccountSettingsTab = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    newsletter: false,
  });

  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // 🔹 Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          withCredentials: true,
        });

        const user = res.data.user;

        setFormData({
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          newsletter: user.newsletter || false,
        });

        setPreview(user.avatar || null);
      } catch (err) {
        console.log(err);
        
        toast.error('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 🔹 Handle avatar file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 🔹 Submit profile form to backend with FormData
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const data = new FormData();
    data.append('username', formData.username);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('newsletter', formData.newsletter);
    if (avatarFile) data.append('avatar', avatarFile);

    await axios.put(
      'http://localhost:5000/api/auth/update-profile',
      data,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    toast.success('Profile updated');
  } catch (err) {
    console.error(err);
    toast.error('Update failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <div className="flex items-center gap-4 mt-2">
            <img
              src={preview || '/default-avatar.png'}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
          />
        </div>

        {/* Email (disabled) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            disabled
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
          />
        </div>

        {/* Newsletter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="newsletter"
            name="newsletter"
            checked={formData.newsletter}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">Subscribe to newsletter</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default AccountSettingsTab;

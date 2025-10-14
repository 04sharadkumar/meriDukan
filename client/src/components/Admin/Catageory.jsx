import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiFolder,
  FiImage,
  FiSave,
  FiX,
  FiAlertCircle
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getCookie } from '../../utils/cookieHelper';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
    parentCategory: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const authToken = getCookie("authToken");
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/categories', { headers });
      setCategories(response.data.categories || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      // Fallback demo data
      setCategories([
        {
          _id: '1',
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          image: '/api/placeholder/300/200',
          productCount: 45,
          isActive: true,
          createdAt: new Date()
        },
        {
          _id: '2',
          name: 'Clothing',
          description: 'Fashion and apparel',
          image: '/api/placeholder/300/200',
          productCount: 32,
          isActive: true,
          createdAt: new Date()
        },
        {
          _id: '3',
          name: 'Home & Kitchen',
          description: 'Home appliances and kitchenware',
          image: '/api/placeholder/300/200',
          productCount: 28,
          isActive: true,
          createdAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      isActive: true,
      parentCategory: ''
    });
    setFormErrors({});
    setEditingCategory(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        // Update existing category
        await axios.put(
          `http://localhost:5000/api/categories/${editingCategory._id}`,
          formData,
          { headers }
        );
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await axios.post(
          'http://localhost:5000/api/categories',
          formData,
          { headers }
        );
        toast.success('Category created successfully');
      }
      
      setShowAddModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image || '',
      isActive: category.isActive,
      parentCategory: category.parentCategory || ''
    });
    setShowAddModal(true);
  };

  // Handle delete category
  const handleDelete = async () => {
    if (!editingCategory) return;

    setSubmitting(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/categories/${editingCategory._id}`,
        { headers }
      );
      toast.success('Category deleted successfully');
      setShowDeleteModal(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle category status
  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/categories/${categoryId}/status`,
        { isActive: !currentStatus },
        { headers }
      );
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Failed to update category status');
    }
  };

  // Open add modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Open delete modal
  const openDeleteModal = (category) => {
    setEditingCategory(category);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-2">Manage product categories and organization</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiFolder className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(cat => cat.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <FiSave className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <FiImage className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(cat => !cat.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchCategories}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading categories...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <FiFolder className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No categories found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
              </p>
              {!searchTerm && (
                <button
                  onClick={openAddModal}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Category
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 flex-shrink-0">
                            <img
                              src={category.image || '/api/placeholder/40/40'}
                              alt={category.name}
                              className="w-10 h-10 rounded-lg object-cover border"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/40/40';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {category.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{category.productCount || 0}</div>
                        <div className="text-sm text-gray-500">products</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleCategoryStatus(category._id, category.isActive)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            category.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Edit category"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(category)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Delete category"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter category name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter category description"
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Category is active
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>{submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                    <FiAlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Category</h3>
                    <p className="text-gray-600">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete the category <strong>"{editingCategory.name}"</strong>? 
                  {editingCategory.productCount > 0 && (
                    <span className="text-red-600 block mt-1">
                      This category has {editingCategory.productCount} products and deleting it may affect them.
                    </span>
                  )}
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>{submitting ? 'Deleting...' : 'Delete Category'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  FiTrash2,
  FiEdit,
  FiPlus,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiFilter,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ProductTab = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    stockStatus: 'all',
    priceRange: [0, 10000]
  });

  const PRODUCTS_PER_PAGE = 8;

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/products');
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Fetch products error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:5000/api/admin/products/${id}`, {
        withCredentials: true,
      });
      toast.success('Product deleted successfully');
      await fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
      console.error('Delete product error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term, filters);
    setCurrentPage(1);
  };

  const applyFilters = (search = searchTerm, filterParams = filters) => {
    let results = products;
    
    // Apply search filter
    if (search) {
      results = results.filter((product) =>
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (filterParams.category) {
      results = results.filter(product => 
        product.category.toLowerCase() === filterParams.category.toLowerCase()
      );
    }

    // Apply stock status filter
    if (filterParams.stockStatus !== 'all') {
      results = results.filter(product => 
        filterParams.stockStatus === 'inStock' ? product.stock > 0 : product.stock <= 0
      );
    }

    // Apply price range filter
    results = results.filter(product => 
      product.price >= filterParams.priceRange[0] && 
      product.price <= filterParams.priceRange[1]
    );

    setFilteredProducts(results);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceRangeChange = (index, value) => {
    const newRange = [...filters.priceRange];
    newRange[index] = Number(value);
    setFilters(prev => ({
      ...prev,
      priceRange: newRange
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      stockStatus: 'all',
      priceRange: [0, 10000]
    });
    setSearchTerm('');
    setFilteredProducts(products);
    setCurrentPage(1);
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(product => product.category))];

  // Memoized pagination calculations
  const paginationData = React.useMemo(() => {
    const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
    const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    return { currentProducts, totalPages };
  }, [currentPage, filteredProducts, PRODUCTS_PER_PAGE]);

  const paginate = (page) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-blue-500 text-4xl mb-3" />
          <span className="text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Product Dashboard</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition whitespace-nowrap shadow-sm"
              >
                <FiFilter size={16} /> Filters
              </button>
              
              <Link
                to="/admin/product/add"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap shadow-md hover:shadow-lg"
              >
                <FiPlus size={16} /> Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Filters</h3>
              <button 
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset all
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                <select
                  name="stockStatus"
                  value={filters.stockStatus}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="inStock">In Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                <FiSearch className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                {searchTerm || Object.values(filters).some(Boolean) 
                  ? 'No products match your criteria' 
                  : 'No products available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || Object.values(filters).some(Boolean)
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first product'}
              </p>
              <Link
                to="/admin/product/add"
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <FiPlus /> Add Product
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Summary Bar */}
              <div className="px-6 py-3 bg-gray-50 border-b flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{filteredProducts.length}</span> products
                </div>
                <div className="text-sm text-gray-600">
                  Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{paginationData.totalPages}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {paginationData.currentProducts.map((product) => (
                  <div 
                    key={product._id} 
                    className="border rounded-lg hover:shadow-lg transition flex flex-col h-full group"
                  >
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={product?.images?.[0]?.url || '/placeholder-product.png'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.png';
                        }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="p-4 flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                          {product.name}
                        </h3>
                        <span className="text-sm font-medium text-blue-600 whitespace-nowrap ml-2">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>
                              {star <= Math.floor(product.ratings || 0) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.numReviews || 0})
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          product.category === 'electronics' ? 'bg-purple-100 text-purple-800' :
                          product.category === 'clothing' ? 'bg-green-100 text-green-800' :
                          product.category === 'books' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.category}
                        </span>
                        
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.stock > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3 border-t flex justify-between bg-gray-50 rounded-b-lg">
                      <button
                        onClick={() => deleteProduct(product._id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition disabled:opacity-50"
                        title="Delete product"
                      >
                        <FiTrash2 size={18} />
                      </button>
                      <Link
                        to={`/admin/product/edit/${product._id}`}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition"
                        title="Edit product"
                      >
                        <FiEdit size={18} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {paginationData.totalPages > 1 && (
                <div className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiChevronLeft /> Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`w-10 h-10 rounded-md transition flex items-center justify-center ${
                          currentPage === page 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === paginationData.totalPages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                      currentPage === paginationData.totalPages 
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductTab;
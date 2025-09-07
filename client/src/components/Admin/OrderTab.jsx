import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FiSearch, FiRefreshCw, FiChevronDown, FiChevronUp
} from 'react-icons/fi';

function OrderTab() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });


  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/admin/getAllOrders', {
        withCredentials: true,
      });
      setOrders(res.data.orders);
      setFilteredOrders(res.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (searchTerm) {
      result = result.filter(order =>
        (order._id && order._id.includes(searchTerm)) ||
        (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.shippingAddress?.address && order.shippingAddress.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(order => order.status === statusFilter);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

const getStatusBadge = (status) => {
  const statusMap = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    processing: { color: 'bg-blue-100 text-blue-800', icon: '🔄' },
    completed: { color: 'bg-green-100 text-green-800', icon: '✅' },
    cancelled: { color: 'bg-red-100 text-red-800', icon: '❌' }
  };

  const lowerStatus = status?.toLowerCase();
  const selected = statusMap[lowerStatus] || { color: 'bg-gray-100 text-gray-800', icon: '❓' };

  const capitalizedStatus = lowerStatus
    ? lowerStatus.charAt(0).toUpperCase() + lowerStatus.slice(1)
    : 'Unknown';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${selected.color}`}>
      {selected.icon} {capitalizedStatus}
    </span>
  );
};


  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/updateOrderStatus/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(prev => (prev === orderId ? null : orderId));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateTotal = (order) => {
    return order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Order Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="all">All Statuses</option>
  <option value="pending">Pending</option>
  <option value="processing">Processing</option>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
</select>
              
              <button
                onClick={fetchData}
                className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No orders found matching your criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
              }}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('_id')}
                    >
                      <div className="flex items-center">
                        Order ID
                        {sortConfig.key === '_id' && (
                          sortConfig.direction === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === 'createdAt' && (
                          sortConfig.direction === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order._id.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.user?.email || 'Guest'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.orderItems?.length || 0} item(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${calculateTotal(order)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status || 'Pending')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleOrderExpand(order._id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View details"
                            >
                              {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                            {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="text-xs border rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Complete</option>
                                <option value="Cancelled">Cancel</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedOrder === order._id && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    <span className="text-gray-500">Order ID:</span> {order._id}
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-gray-500">Payment Method:</span> {order.paymentMethod}
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-gray-500">Total:</span> ${calculateTotal(order)}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="font-medium text-gray-900 mb-2">Shipping Information</h3>
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    <span className="text-gray-500">Address:</span> {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-gray-500">Country:</span> {order.shippingAddress?.country}
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-gray-500">Phone:</span> {order.shippingAddress?.phone || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="md:col-span-2">
                                <h3 className="font-medium text-gray-900 mb-2">Order Items</h3>
                                <div className="border rounded-lg overflow-hidden">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.orderItems?.map((item, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                                          <td className="px-4 py-2 text-sm text-gray-900">${item.price.toFixed(2)}</td>
                                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                                          <td className="px-4 py-2 text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{filteredOrders.length}</span> of{' '}
                    <span className="font-medium">{orders.length}</span> orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTab;
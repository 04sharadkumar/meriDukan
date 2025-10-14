import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getCookie } from '../utils/cookieHelper';
import {
  FiBox,
  FiUsers,
  FiDollarSign,
  FiShoppingCart,
  FiRefreshCw,
  FiTrendingUp,
  FiPackage,
  FiCreditCard,
  FiUserCheck,
  FiDownload,
  FiEye,
  FiCalendar,
  FiMapPin
} from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const StatCard = ({ icon, label, value, link, trend, loading }) => (
  <Link to={link} className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-blue-200">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        {loading ? (
          <Skeleton width="60%" height={28} />
        ) : (
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
        )}
        {trend && (
          <div className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
            trend.value > 0 
              ? 'bg-green-50 text-green-700' 
              : trend.value < 0 
              ? 'bg-red-50 text-red-700' 
              : 'bg-gray-50 text-gray-700'
          }`}>
            <FiTrendingUp className={`w-3 h-3 mr-1 ${trend.value < 0 ? 'transform rotate-180' : ''}`} />
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl">
        {icon}
      </div>
    </div>
  </Link>
);

const OrderCard = ({ order, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <Skeleton height={20} width="60%" />
        <Skeleton height={16} width="40%" />
        <Skeleton height={16} width="30%" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-900 text-sm">
              #{order._id?.slice(-8).toUpperCase()}
            </p>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.deliveryStatus)}`}>
              {order.deliveryStatus || 'Pending'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1 flex items-center">
            <FiUserCheck className="w-3 h-3 mr-1" />
            {order.user?.username || order.user?.email || 'Customer'}
          </p>
          <p className="text-sm text-gray-600 mb-1 flex items-center">
            <FiCalendar className="w-3 h-3 mr-1" />
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
          {order.shippingAddress?.city && (
            <p className="text-sm text-gray-600 flex items-center">
              <FiMapPin className="w-3 h-3 mr-1" />
              {order.shippingAddress.city}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
        <span className="text-lg font-bold text-gray-900">
          ₹{order.totalPrice?.toFixed(2) || '0.00'}
        </span>
        <Link 
          to={`/admin/orders/${order._id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          <FiEye className="w-3 h-3 mr-1" />
          View
        </Link>
      </div>
    </div>
  );
};

const authToken = getCookie("authToken");
const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    monthlyRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);


  // Fetch all statistics
  const fetchStats = async () => {
    try {
      const [
        usersRes,
        productsRes,
        ordersRes,
        revenueRes,
        
      ] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/totalUser", { headers }),
        axios.get("http://localhost:5000/api/products/totalProduct", { headers }),
        axios.get("http://localhost:5000/api/orders/totalOrder", { headers }),
        axios.get("http://localhost:5000/api/admin/totalRevenue", { headers }),
      
      ]);

      console.log(usersRes.data.totalUser,
        productsRes,
        ordersRes,
        revenueRes,
        );
      

      setStats({
        totalUsers: usersRes.data.totalUser || 0,
        totalProducts: productsRes.data.totalProduct || 0,
        totalOrders: ordersRes.data.totalOrders || 0,
        totalRevenue: revenueRes.data.totalRevenue || 0,
       
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error("Failed to load dashboard statistics");
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/getRecentOrders", { headers });
      const orders = res.data.recentOrders || [];

      if (orders.length > 0) {
        const latestOrderId = orders[0]._id;
        if (lastOrderId && latestOrderId !== lastOrderId) {
          toast.success("🛎️ New order received!");
        }
        setLastOrderId(latestOrderId);
      }

      setRecentOrders(orders);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load recent orders");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchRecentOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(fetchRecentOrders, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleDownload = async () => {
    if (!recentOrders || recentOrders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders Report');

    // Styling
    sheet.columns = [
      { width: 20 }, { width: 25 }, { width: 15 }, { width: 20 }, 
      { width: 15 }, { width: 20 }, { width: 15 }, { width: 25 }, 
      { width: 15 }, { width: 15 }, { width: 30 }
    ];

    // Header with styling
    const headerRow = sheet.addRow([
      'Order ID', 'Customer', 'Amount', 'Date', 'Payment Status',
      'Delivery Status', 'Shipping Name', 'Shipping Mobile', 'City', 'Country', 'Items'
    ]);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '3B82F6' }
    };

    // Data
    recentOrders.forEach(order => {
      sheet.addRow([
        order._id,
        order.user?.email || order.user || 'Guest',
        order.totalPrice,
        new Date(order.createdAt),
        order.paymentStatus || order.paymentMethod || 'N/A',
        order.deliveryStatus || 'Pending',
        order.shippingAddress?.name || '',
        order.shippingAddress?.mobile || '',
        order.shippingAddress?.city || '',
        order.shippingAddress?.country || '',
        (order.orderItems || []).map(item => `${item.name} (x${item.qty})`).join(', ')
      ]);
    });

    // Formatting
    sheet.getColumn(4).numFmt = 'dd/mm/yyyy hh:mm:ss';
    sheet.getColumn(3).numFmt = '₹#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `orders_report_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success("Orders exported successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your ecommerce store efficiently</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchAll}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <label className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-300">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Auto Refresh
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Last Updated */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-gray-500">
            Last updated: <strong>{lastUpdated || 'Loading...'}</strong>
          </div>
          <button
            onClick={handleDownload}
            disabled={recentOrders.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Export to Excel
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <StatCard 
            icon={<FiUsers />} 
            label="Total Users" 
            value={stats.totalUsers} 
            link="/admin/users"
            loading={loading}
          />
          <StatCard 
            icon={<FiBox />} 
            label="Products" 
            value={stats.totalProducts} 
            link="/admin/products"
            loading={loading}
          />
          <StatCard 
            icon={<FiShoppingCart />} 
            label="Total Orders" 
            value={stats.totalOrders} 
            link="/admin/orders"
            loading={loading}
          />
          <StatCard 
            icon={<FiDollarSign />} 
            label="Total Revenue" 
            value={`₹${stats.totalRevenue?.toFixed(2)}`} 
            link="/admin/revenue"
            loading={loading}
          />
          
          
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link 
                to="/admin/orders"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Orders →
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <OrderCard key={i} loading={true} />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentOrders.slice(0, 6).map((order) => (
                  <OrderCard key={order._id} order={order} loading={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiShoppingCart className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No recent orders found</p>
                <p className="text-gray-400 text-sm mt-1">Orders will appear here as they come in</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/admin/product/add" 
            className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-center"
          >
            <FiBox className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Add Product</p>
          </Link>
          <Link 
            to="/admin/categories" 
            className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-center"
          >
            <FiPackage className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Categories</p>
          </Link>
          <Link 
            to="/admin/banners" 
            className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-center"
          >
            <FiTrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Banners</p>
          </Link>
          <Link 
            to="/admin/settings" 
            className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-center"
          >
            <FiCreditCard className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
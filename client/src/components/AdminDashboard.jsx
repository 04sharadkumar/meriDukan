import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import RecentOrder from './RecentOrder';
import {
  FiBox,
  FiUsers,
  FiDollarSign,
  FiShoppingCart,
  FiRefreshCw,
} from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const StatCard = ({ icon, label, value, link }) => (
  <Link to={link} className="bg-white rounded-xl p-4 shadow flex gap-4 items-center">
    <div className="text-2xl text-blue-600">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="text-lg font-bold text-gray-900">{value}</h3>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ---------------- FETCH FUNCTIONS ----------------
  const fetchTotalUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/totalUser");
      setTotalUsers(res.data.totalUser || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  const fetchTotalProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/totalProduct");
      setTotalProducts(res.data.totalProduct || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    }
  };

  const fetchTotalOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/totalOrder");
      setTotalOrders(res.data.totalOrder || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    }
  };

  const fetchTotalRevenue = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/totalRevenue");
      setTotalRevenue(res.data.totalRevenue || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load revenue");
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/getRecentOrders");
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

  // ---------------- FETCH ALL ----------------
  const fetchAll = async () => {
    await Promise.all([
      fetchTotalUsers(),
      fetchTotalProducts(),
      fetchTotalOrders(),
      fetchTotalRevenue(),
      fetchRecentOrders(),
    ]);
    setLoading(false);
  };

  // ---------------- EFFECT ----------------
  useEffect(() => {
    fetchAll();
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(fetchRecentOrders, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // ---------------- EXPORT TO EXCEL ----------------
  const handleDownload = async () => {
    if (!recentOrders || recentOrders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');

    // Header
    sheet.addRow([
      'Order ID', 'Customer', 'Amount', 'Date', 'Payment Status',
      'Shipping Name', 'Shipping Mobile', 'Shipping Address', 'City', 'Country', 'Items'
    ]);

    // Data
    recentOrders.forEach(order => {
      sheet.addRow([
        order._id,
        order.user?.email || order.user || 'Guest',
        order.totalPrice,
        new Date(order.createdAt),
        order.paymentStatus || order.paymentMethod || 'N/A',
        order.shippingAddress?.name || '',
        order.shippingAddress?.mobile || '',
        order.shippingAddress?.address || '',
        order.shippingAddress?.city || '',
        order.shippingAddress?.country || '',
        (order.orderItems || []).map(item => `${item.name} (x${item.qty})`).join(', ')
      ]);
    });

    // Date formatting
    sheet.getColumn(4).numFmt = 'dd/mm/yyyy hh:mm:ss';

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'orders_report.xlsx');

    toast.success("Orders exported successfully!");
  };

  // ---------------- JSX ----------------
  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchAll}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <FiRefreshCw /> Refresh
          </button>
          <label className="text-sm text-gray-600 flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh
          </label>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 mb-4">
        Last updated at: <strong>{lastUpdated || 'Loading...'}</strong>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow">
                <Skeleton height={30} width={30} />
                <Skeleton width="60%" />
                <Skeleton width="40%" />
              </div>
            ))
          : <>
              <StatCard icon={<FiBox />} label="Products" value={totalProducts} link="/admin/products" />
              <StatCard icon={<FiShoppingCart />} label="Orders" value={totalOrders} link="/admin/orders" />
              <StatCard icon={<FiUsers />} label="Users" value={totalUsers} link="/admin/users" />
              <StatCard icon={<FiDollarSign />} label="Revenue" value={`₹${totalRevenue}`} link="/admin/revenue" />
              <StatCard icon={<FiRefreshCw />} label="Banners" value="Manage" link="/admin/banners" />
             
            </>
        }
      </div>

     

      {/* Export Button */}
      <div className="flex justify-end my-6">
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Export Orders to Excel
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard
import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderFilters from "./Order/OrderFilters";
import OrderTable from "./Order/OrderTable";
import { getCookie } from "../../utils/cookieHelper";

const OrderTab = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Fetch all orders
  const fetchData = async () => {

    const authToken = getCookie("authToken");
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/orders/getAllOrders", { headers: { Authorization: `Bearer ${authToken}` }, });
      setOrders(res.data.orders);
      setFilteredOrders(res.data.orders);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Fetch Orders Error:", err.response?.data || err.message);
    }
  };

  // Update payment status
  const updateOrderStatus = async (orderId, newStatus) => {

    const authToken = getCookie("authToken");

    try {
      await axios.put(
        `http://localhost:5000/api/orders/updateOrderStatus/${orderId}`,
        { status: newStatus },
        {headers: { Authorization: `Bearer ${authToken}` }},
      );
      fetchData();
    } catch (err) {
      console.error("Update Payment Status Error:", err.response?.data || err.message);
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async (deliveryId, newStatus) => {

    const authToken = getCookie("authToken");
    try {
      await axios.put(
        `http://localhost:5000/api/orders/updateDelivery/${deliveryId}`,
        { status: newStatus },
        {headers: { Authorization: `Bearer ${authToken}` }},
      );
      fetchData();
    } catch (err) {
      console.error("Update Delivery Status Error:", err.response?.data || err.message);
    }
  };

  // Expand/collapse order details
  const toggleOrderExpand = (orderId) =>
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let result = [...orders];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o._id.includes(searchTerm) ||
          (o.user?.username || "").toLowerCase().includes(lower) ||
          (o.user?.email || "").toLowerCase().includes(lower) ||
          (o.shippingAddress?.address || "").toLowerCase().includes(lower)
      );
    }
    if (statusFilter !== "All") {
      result = result.filter(
        (o) => (o.paymentStatus || "pending").toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Management
              </h1>
              <p className="text-gray-600">
                Manage and track all customer orders in one place
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                      {orders.filter(o => o.paymentStatus === 'pending').length}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {orders.filter(o => o.paymentStatus === 'completed').length}
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Filtered</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{filteredOrders.length}</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <OrderFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              loading={loading}
              fetchData={fetchData}
            />
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : (
            <OrderTable
              filteredOrders={filteredOrders}
              expandedOrder={expandedOrder}
              toggleOrderExpand={toggleOrderExpand}
              updateOrderStatus={updateOrderStatus}
              updateDeliveryStatus={updateDeliveryStatus}
            />
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {orders.length === 0 
                ? "No orders have been placed yet." 
                : "Try adjusting your search or filter criteria."}
            </p>
            {orders.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTab;
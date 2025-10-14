import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiPackage,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
  FiCalendar,
  FiTruck,
  FiBox,
  FiMapPin,
  FiUser,
  FiPhone,
  FiHome,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { getCookie } from "../utils/cookieHelper";

const statusStyles = {
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Processing: "bg-purple-50 text-purple-700 border-purple-200",
};

const statusIcons = {
  Delivered: <FiCheckCircle className="w-4 h-4" />,
  Shipped: <FiTruck className="w-4 h-4" />,
  Pending: <FiPackage className="w-4 h-4" />,
  Cancelled: <FiXCircle className="w-4 h-4" />,
  Processing: <FiLoader className="w-4 h-4 animate-spin" />,
};

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async () => {
    const authToken = getCookie("authToken");
    try {
      const res = await axios.get(
        "http://localhost:5000/api/orders/my-orders",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      console.log(res.data);

      const formattedOrders = (res.data.orders || []).map((order) => ({
        ...order,
        deliveryStatus: order.delivery?.currentStatus || "Pending",
      }));

      setOrders(formattedOrders);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
        </div>
        <div className="text-center">
          <p className="text-blue-600 font-medium text-lg">Loading your orders</p>
          <p className="text-gray-500 text-sm mt-1">Please wait while we fetch your order details</p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
            <FiPackage className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            When you place orders, they will appear here for you to track and manage.
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h2>
        <p className="text-gray-600">Track and manage your recent purchases</p>
      </div>

      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            {/* Order Header */}
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() =>
                setExpanded(expanded === order._id ? null : order._id)
              }
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FiBox className="w-6 h-6 text-blue-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {order.orderItems[0]?.name || "Unnamed Product"}
                      {order.orderItems.length > 1 && (
                        <span className="text-gray-500 font-normal ml-2">
                          +{order.orderItems.length - 1} more
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span>Order #{(order._id || "").slice(-8).toUpperCase()}</span>
                    <span>•</span>
                    <span className="font-medium text-gray-700">
                      ₹{order.totalPrice?.toFixed(2) || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border ${
                    statusStyles[order.deliveryStatus] ||
                    "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {statusIcons[order.deliveryStatus] || statusIcons.Pending}
                  <span>{order.deliveryStatus || "Pending"}</span>
                </div>

                <div className="text-gray-400">
                  {expanded === order._id ? (
                    <FiChevronUp className="w-5 h-5" />
                  ) : (
                    <FiChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            {expanded === order._id && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                {/* Order Items */}
                <div className="p-6 space-y-4">
                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Order Items ({order.orderItems.length})
                  </h4>
                  <div className="space-y-3">
                    {order.orderItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                      >
                        <img
                          src={item.image || "/api/placeholder/80/80"}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = "/api/placeholder/80/80";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Quantity: {item.qty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{(item.price * item.qty).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{item.price} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping and Delivery Information */}
                <div className="px-6 pb-6 space-y-4">
                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4 text-blue-500" />
                        <span>Shipping Address</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <FiUser className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Recipient Name
                              </label>
                              <p className="font-semibold text-gray-900">
                                {order.shippingAddress.name}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-2">
                            <FiPhone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Mobile Number
                              </label>
                              <p className="font-semibold text-gray-900">
                                {order.shippingAddress.mobile}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <FiHome className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Full Address
                              </label>
                              <p className="font-semibold text-gray-900">
                                {order.shippingAddress.address}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.shippingAddress.city}
                                {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                                {order.shippingAddress.postalCode && ` - ${order.shippingAddress.postalCode}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.shippingAddress.country}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Information */}
                  {order.delivery && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                        <FiTruck className="w-4 h-4 text-blue-500" />
                        <span>Delivery Information</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Current Status
                            </label>
                            <p className="font-semibold text-gray-900">
                              {order.delivery.currentStatus}
                            </p>
                          </div>
                          
                          {order.delivery.trackingNumber && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Tracking Number
                              </label>
                              <p className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded text-sm">
                                {order.delivery.trackingNumber}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {order.delivery.expectedDate && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Expected Delivery
                              </label>
                              <p className="font-semibold text-gray-900">
                                {new Date(order.delivery.expectedDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          
                          {order.delivery.actualDeliveryDate && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Delivered On
                              </label>
                              <p className="font-semibold text-gray-900">
                                {new Date(order.delivery.actualDeliveryDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tracking Updates */}
                      {order.delivery.trackingUpdates?.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-gray-100">
                          <h5 className="font-semibold text-gray-700 mb-3 text-sm">
                            Tracking History
                          </h5>
                          <div className="space-y-2">
                            {order.delivery.trackingUpdates.map((update, i) => (
                              <div
                                key={i}
                                className="flex items-center space-x-3 text-sm"
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                <span className="text-gray-600">{update.status}</span>
                                <span className="text-gray-400 text-xs flex-1 text-right">
                                  {update.timestamp && 
                                    new Date(update.timestamp).toLocaleDateString()
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
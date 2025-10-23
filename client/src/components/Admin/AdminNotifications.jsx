import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getCookie } from "../../utils/cookieHelper";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FiBell,
  FiPackage,
  FiUserPlus,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const tabs = [
  { key: "all", label: "All", icon: <FiBell /> },
  { key: "orders", label: "Orders", icon: <FiPackage /> },
  { key: "users", label: "Users", icon: <FiUserPlus /> },
  { key: "stock", label: "Stock", icon: <FiAlertTriangle /> },
];

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const authToken = getCookie("authToken");
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  const navigate = useNavigate();

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/notifications",
        { headers }
      );
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/notifications/${id}/read`,
        {},
        { headers }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to mark as read");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/admin/notifications/read-all",
        {},
        { headers }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.log(err);
      toast.error("Failed to mark all as read");
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Real-time notifications via socket.io
    const socket = io("http://localhost:5000", {
      auth: { token: authToken },
    });

    socket.on("newNotification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      toast.success("New notification received!");
    });

    return () => socket.disconnect();
  }, []);

  // Filter notifications by tab & search
  const filtered = notifications.filter(
    (n) =>
      (activeTab === "all" ? true : n.type === activeTab) &&
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiBell className="text-blue-600" /> Admin Notifications
          </h1>
          <div className="flex items-center gap-4">
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications.filter((n) => !n.isRead).length} Unread
              </span>
            )}
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg w-full mb-4"
        />

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={80} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FiBell className="text-5xl mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No notifications found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((notif) => (
              <div
                key={notif._id}
                className={`flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border ${
                  notif.isRead
                    ? "border-gray-200"
                    : "border-blue-300 bg-blue-50"
                } transition cursor-pointer`}
                onClick={() => {
                  if (notif.type === "orders" && notif.orderId) {
                    navigate(`/admin/orders/${notif.orderId}`);
                  }
                  markAsRead(notif._id);
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      notif.type === "orders"
                        ? "bg-green-100 text-green-600"
                        : notif.type === "users"
                        ? "bg-yellow-100 text-yellow-600"
                        : notif.type === "stock"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {notif.type === "orders" ? (
                      <FiPackage />
                    ) : notif.type === "users" ? (
                      <FiUserPlus />
                    ) : notif.type === "stock" ? (
                      <FiAlertTriangle />
                    ) : (
                      <FiBell />
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">{notif.message}</p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <FiClock className="mr-1" />
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  {notif.isRead ? (
                    <span className="flex items-center text-green-600 text-sm">
                      <FiCheckCircle className="mr-1" /> Read
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif._id);
                      }}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;

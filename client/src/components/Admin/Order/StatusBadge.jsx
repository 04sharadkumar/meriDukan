import React from "react";
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRefreshCw,
  FiTruck,
} from "react-icons/fi";

const StatusBadge = ({ status, type = "order" }) => {
  // Define mappings for order and delivery statuses
  const statusMap = {
    order: {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <FiClock />,
        label: "Pending",
      },
      processing: {
        color: "bg-blue-100 text-blue-800",
        icon: <FiRefreshCw className="animate-spin" />,
        label: "Processing",
      },
      completed: {
        color: "bg-green-100 text-green-800",
        icon: <FiCheckCircle />,
        label: "Completed",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: <FiXCircle />,
        label: "Cancelled",
      },
      refunded: {
        color: "bg-purple-100 text-purple-800",
        icon: "💜",
        label: "Refunded",
      },
      failed: { color: "bg-red-50 text-red-700", icon: "⚠️", label: "Failed" },
    },
    delivery: {
      processing: {
        color: "bg-blue-100 text-blue-800",
        icon: <FiRefreshCw className="animate-spin" />,
        label: "Processing",
      },
      packed: {
        color: "bg-purple-100 text-purple-800",
        icon: "📦",
        label: "Packed",
      },
      shipped: {
        color: "bg-indigo-100 text-indigo-800",
        icon: "🚚",
        label: "Shipped",
      },
      outForDelivery: {
        color: "bg-orange-100 text-orange-800",
        icon: "🛵",
        label: "Out for Delivery",
      },
      delivered: {
        color: "bg-green-100 text-green-800",
        icon: <FiCheckCircle />,
        label: "Delivered",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: <FiXCircle />,
        label: "Cancelled",
      },
      delayed: {
        color: "bg-yellow-50 text-yellow-800",
        icon: "⏰",
        label: "Delayed",
      },
    },
  };

  const lowerStatus = status?.replace(/\s+/g, "").toLowerCase();
  const selected = statusMap[type]?.[lowerStatus] || {
    color: "bg-gray-100 text-gray-800",
    icon: "ℹ️",
    label: status || "Unknown",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${selected.color} shadow-sm ring-1 ring-gray-200`}
      title={selected.label}
    >
      <span className="text-sm">{selected.icon}</span>
      {selected.label}
    </span>
  );
};

export default StatusBadge;

import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import OrderDetails from "./OrderDetails";

const OrderRow = ({
  order,
  expandedOrder,
  toggleOrderExpand,
  updateOrderStatus,
  updateDeliveryStatus,
}) => {
  const handlePaymentChange = (e) => {
    const newStatus = e.target.value;
    updateOrderStatus(order._id, newStatus);
  };

  const handleDeliveryChange = (e) => {
    const newStatus = e.target.value;
    updateDeliveryStatus(order.delivery._id, newStatus);
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          #{order._id.substring(0, 8)}...
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {order.shippingAddress?.name || order.user?.username || "Guest"}{" "}
          <br />
          <span className="text-gray-500 text-xs">{order.user?.email}</span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {order.orderItems?.length || 0} item(s)
        </td>
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          ₹{order.totalPrice}
        </td>

        {/* Payment Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={order.paymentStatus} />
          <select
            value={order.paymentStatus}
            onChange={handlePaymentChange}
            className="text-xs border rounded p-1 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </td>

        {/* Delivery Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          {order.delivery?._id && (
            <>
              <StatusBadge status={order.delivery.currentStatus} />
              <select
                value={order.delivery.currentStatus}
                onChange={handleDeliveryChange}
                className="text-xs border rounded p-1 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </>
          )}
        </td>

        <td className="px-6 py-4 text-right text-sm font-medium flex items-center space-x-2">
          <button
            onClick={() => toggleOrderExpand(order._id)}
            className="text-blue-600 hover:text-blue-900"
          >
            {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </td>
      </tr>

      {expandedOrder === order._id && (
        <tr>
          <td colSpan="8" className="px-6 py-4 bg-gray-50">
            <OrderDetails order={order} />
          </td>
        </tr>
      )}
    </>
  );
};

export default OrderRow;

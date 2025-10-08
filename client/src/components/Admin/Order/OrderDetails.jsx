import StatusBadge from "./StatusBadge";

const OrderDetails = ({ order }) => {
  return (
    <div className="space-y-6">
      {/* Order & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-5 border">
          <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">
            Order Details
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-medium text-gray-500">Order ID:</span>{" "}
              {order._id}
            </p>
            <p>
              <span className="font-medium text-gray-500">Payment Method:</span>{" "}
              {order.paymentMethod}
            </p>
            <p>
              <span className="font-medium text-gray-500">Total:</span>{" "}
              <span className="text-green-600 font-semibold">
                ₹{order.totalPrice}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-500">Payment Status:</span>{" "}
              <StatusBadge status={order.paymentStatus} />
            </p>
            <p>
              <span className="font-medium text-gray-500">
                Delivery Status:
              </span>{" "}
              <StatusBadge status={order.delivery?.currentStatus} />
            </p>
            <p>
              <span className="font-medium text-gray-500">Paid:</span>{" "}
              {order.isPaid ? "✅ Yes" : "❌ No"}
            </p>
            {/* <p>
              <span className="font-medium text-gray-500">Delivered:</span>{" "}
              {order.isDelivered ? "📦 Yes" : "🚚 No"}
            </p> */}
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white shadow rounded-lg p-5 border">
          <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">
            Shipping Information
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-medium text-gray-500">Address:</span>{" "}
              {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.postalCode || "N/A"}
            </p>
            <p>
              <span className="font-medium text-gray-500">Country:</span>{" "}
              {order.shippingAddress?.country}
            </p>
            <p>
              <span className="font-medium text-gray-500">Phone:</span>{" "}
              {order.shippingAddress?.mobile || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow rounded-lg p-5 border">
        <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">
          Order Items
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {order.orderItems?.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 text-gray-800">{item.name}</td>
                  <td className="px-4 py-2 text-gray-800">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-gray-800">{item.qty}</td>
                  <td className="px-4 py-2 text-gray-800 font-medium text-green-600">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

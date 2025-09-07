const RecentOrder = ({ recentOrders }) => {
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2 px-3">Order ID</th>
              <th className="py-2 px-3">Item</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <tr key={order._id} className="border-b text-gray-700">
                  <td className="py-2 px-3">{order._id.slice(-6)}</td>
                  <td className="py-2 px-3">{order.orderItems[0]?.name || 'N/A'}</td>
                  <td className="py-2 px-3">₹{order.totalPrice}</td>
                  <td className="py-2 px-3">{order.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-400">No recent orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default RecentOrder;

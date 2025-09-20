import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";

const RevenueTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [activeTab, setActiveTab] = useState("overview");

  // Chart colors
  const CHART_COLORS = {
    primary: "#4361ee",
    secondary: "#3f37c9",
    success: "#4cc9f0",
    danger: "#f72585",
    warning: "#f8961e",
    info: "#4895ef",
  };

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    yoyGrowth: 0,
    momGrowth: 0,
    avgOrderValue: 0,
    totalOrders: 0,
    repeatCustomerRate: 0,
    topProducts: [],
    revenueTrend: [],
    customerSegments: [],
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          "http://localhost:5000/api/admin/getAllOrders",
          {
            withCredentials: true,
          }
        );

        console.log();
        
        setOrders(data.orders || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    // Calculate metrics
    const calculatedMetrics = calculateMetrics(orders, dateRange);
    setMetrics(calculatedMetrics);
  }, [orders, dateRange]);

  const calculateMetrics = (orders) => {
    // Filter orders by date range if specified
    let filteredOrders = orders;

    if (startDate && endDate) {
      filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Calculate all metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => {
      const orderTotal = (order.orderItems || []).reduce((orderSum, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0; // 👈 yaha quantity nahi, qty hai
        return orderSum + price * qty;
      }, 0);

      return sum + orderTotal;
    }, 0);

    const totalOrders = filteredOrders.length;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth rates (simplified for example)
    const yoyGrowth = 12.5; // Would normally compare to same period last year
    const momGrowth = 5.2; // Would normally compare to previous month

    // Calculate revenue trend (last 12 months)
    const revenueTrend = calculateRevenueTrend(filteredOrders);

    // Top products
    const topProducts = calculateTopProducts(filteredOrders);

    
    
    


    // Customer segments (simplified)
   const calculateCustomerSegments = (orders) => {
  const customerOrderCount = {};

  // Count orders per customer
  orders.forEach((order) => {
    const userId = order.user?._id || order.user || "guest";
    customerOrderCount[userId] = (customerOrderCount[userId] || 0) + 1;
  });

  let newCustomers = 0;
  let repeatCustomers = 0;

  Object.values(customerOrderCount).forEach((count) => {
    if (count === 1) {
      newCustomers += 1;
    } else {
      repeatCustomers += 1;
    }
  });

  return [
    { name: "New Customers", value: newCustomers },
    { name: "Repeat Customers", value: repeatCustomers },
  ];
};

// Usage
const customerSegments = calculateCustomerSegments(filteredOrders);

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      yoyGrowth,
      momGrowth,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      totalOrders,
      repeatCustomerRate: 35, // Would normally calculate
      topProducts,
      revenueTrend,
      customerSegments,
    };
  };

const calculateRevenueTrend = (orders) => {
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      name: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear(),
      revenue: 0,
    });
  }

  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const monthIndex =
      (orderDate.getFullYear() - now.getFullYear()) * 12 +
      orderDate.getMonth() -
      now.getMonth() +
      11;

    if (monthIndex >= 0 && monthIndex < 12) {
      const orderTotal = order.orderItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), // ✅ fixed here
        0
      );
      months[monthIndex].revenue += orderTotal;
    }
  });

  return months;
};

const calculateTopProducts = (orders) => {
  const productMap = {};

  orders.forEach((order) => {
    (order.orderItems || []).forEach((item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 0;

      if (!productMap[item.name]) {
        productMap[item.name] = {
          name: item.name,
          revenue: 0,
          unitsSold: 0,
        };
      }

      productMap[item.name].revenue += price * qty;
      productMap[item.name].unitsSold += qty;
    });
  });

  return Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Revenue Analytics
          </h1>
          <div className="flex items-center space-x-4">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              placeholderText="Select date range"
              className="border rounded-md px-3 py-1 text-sm"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Export Report
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {["overview", "products", "customers", "channels"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-1 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Revenue"
                value={`₹${metrics.totalRevenue.toLocaleString()}`}
                change={metrics.yoyGrowth}
                icon={<FiDollarSign className="text-blue-500" size={24} />}
              />
              <MetricCard
                title="Orders"
                value={metrics.totalOrders.toLocaleString()}
                change={5.8}
                icon={<FiShoppingCart className="text-green-500" size={24} />}
              />
              <MetricCard
                title="Avg. Order Value"
                value={`₹${metrics.avgOrderValue.toFixed(2)}`}
                change={metrics.momGrowth}
                icon={<FiTrendingUp className="text-purple-500" size={24} />}
              />
              <MetricCard
                title="Repeat Customers"
                value={`${metrics.repeatCustomerRate}%`}
                change={2.3}
                icon={<FiUsers className="text-yellow-500" size={24} />}
              />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Revenue Trend</h2>
                  <button className="text-gray-400 hover:text-gray-500">
                    <BsThreeDotsVertical />
                  </button>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.revenueTrend}>
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={CHART_COLORS.primary}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_COLORS.primary}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip
                        formatter={(value) => [
                          `$${value.toLocaleString()}`,
                          "Revenue",
                        ]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={CHART_COLORS.primary}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Customer Segments</h2>
                  <button className="text-gray-400 hover:text-gray-500">
                    <BsThreeDotsVertical />
                  </button>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.customerSegments}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {metrics.customerSegments.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={Object.values(CHART_COLORS)[index % 6]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Percentage"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Top Products</h2>
                  <button className="text-blue-600 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Units Sold
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Price
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody className="bg-white divide-y divide-gray-200">
                      {metrics.topProducts.map((product) => (
                        <tr key={product.name}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            ₹{product.revenue.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {product.unitsSold}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            ₹{(product.revenue / product.unitsSold).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Transactions</h2>
                  <button className="text-blue-600 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order._id.slice(-6)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {order.user?.email || "Guest"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            ₹
                            {order.orderItems
                              .reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              )
                              .toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-gray-50">{icon}</div>
      </div>
      <div
        className={`mt-4 flex items-center text-sm ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12 7a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9v1h2a1 1 0 110 2H9v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h2v-1H5a1 1 0 110-2h2V8H5a1 1 0 010-2h2V5a1 1 0 112 0v1h2a1 1 0 011 1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12 13a1 1 0 100-2H9v-1h2a1 1 0 100-2H9V7h2a1 1 0 100-2H9V4a1 1 0 10-2 0v1H5a1 1 0 100 2h2v1H5a1 1 0 100 2h2v1H5a1 1 0 100 2h2v1a1 1 0 102 0v-1h2a1 1 0 100-2z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span>{Math.abs(change)}% vs previous period</span>
      </div>
    </div>
  );
};

export default RevenueTab;

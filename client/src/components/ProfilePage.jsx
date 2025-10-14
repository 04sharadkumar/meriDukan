import { useEffect, useState } from "react";
import {
  FiEdit,
  FiShoppingBag,
  FiHeart,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser
} from "react-icons/fi";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { removeCookie, getCookie } from "../utils/cookieHelper";

const ProfilePage = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatar: "",
    address: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const handleLogout = () => {
    removeCookie("authToken");
    navigate("/");
  };

  useEffect(() => {
    const authToken = getCookie("authToken");

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Auth fetch failed:", err.message);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const navItem = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
         ${isActive
           ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-semibold shadow"
           : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`
      }
      onClick={() => setSidebarOpen(false)}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 sm:px-6 py-6 relative">
      {/* Mobile Header */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-white shadow border border-gray-200 text-gray-600 hover:bg-gray-50 hover:shadow-md transition-all duration-200"
        >
          {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-[64px] left-0 z-20 h-[calc(100%-64px)] md:h-auto w-64 sm:w-56 bg-white rounded-r-2xl shadow-lg border border-gray-100 flex flex-col overflow-auto transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* User Info */}
          <div className="p-6 flex flex-col items-center border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="relative mb-4">
              <img
                src={user.avatar || "/placeholder.jpg"}
                alt="Profile"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <FiUser className="text-white text-xs" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 truncate text-center">
              {user.username || "Guest User"}
            </h2>
            <p className="text-gray-600 text-sm truncate text-center mt-1">
              {user.email || "user@example.com"}
            </p>

            <Link 
              to="/profile/account-settings" 
              className="mt-4 w-full"
              onClick={() => setSidebarOpen(false)}
            >
              <button className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium py-2.5 px-4 rounded-xl border border-blue-200 shadow-sm transition-all duration-200 hover:shadow-md">
                <FiEdit className="text-sm" /> 
                Edit Profile
              </button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-2 p-4">
            {navItem("/profile/orders", <FiShoppingBag />, "My Orders")}
            {navItem("/profile/wishlist", <FiHeart />, "Wishlist")}
            {navItem("/profile/paymentHistory", <FiCreditCard />, "Payment History")}
            {navItem("/profile/account-settings", <FiSettings />, "Account Settings")}
          </nav>

          {/* Logout */}
          <div className="border-t border-gray-100 p-4 mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-sm"
            >
              <FiLogOut /> 
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden min-h-[600px] transition-all duration-300 ${
            sidebarOpen ? "md:ml-64 sm:ml-56" : "ml-0"
          }`}
        >
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;

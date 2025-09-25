import { useEffect, useState } from "react";
import {
  FiEdit,
  FiShoppingBag,
  FiHeart,
  FiCreditCard,
  FiSettings,
  FiLogOut,
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

  const navigate = useNavigate();

  const handleLogout = () => {
    removeCookie("authToken");
    navigate("/");
  };

  useEffect(() => {
    const authToken = getCookie("authToken");

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Auth fetch failed:", err.message);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const navItem = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors duration-200 border border-gray-200
         ${isActive
           ? "bg-blue-100 text-blue-600 font-medium shadow-sm"
           : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-6 py-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {/* User Info */}
          <div className="p-4 flex flex-col items-center border-b border-gray-200">
            <img
              src={user.avatar || "/placeholder.jpg"}
              alt="Profile"
              className="w-12 h-12 md:w-20 md:h-20 rounded-full object-cover border border-gray-300 mb-2 md:mb-3"
            />
            <h2 className="hidden md:block text-lg font-semibold text-gray-800 truncate">
              {user.username}
            </h2>
            <p className="hidden md:block text-gray-500 text-sm truncate">
              {user.email}
            </p>

            <Link to="/profile/account-settings" className="hidden md:block">
              <button className="mt-2 md:mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                <FiEdit /> Edit Profile
              </button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1 p-3">
            {navItem("/profile/orders", <FiShoppingBag />, "My Orders")}
            {navItem("/profile/wishlist", <FiHeart />, "Wishlist")}
            {navItem("/profile/paymentHistory", <FiCreditCard />, "Payment History")}
            {navItem(
              "/profile/account-settings",
              <FiSettings />,
              "Account Settings"
            )}
          </nav>

          {/* Logout */}
          <div className="border-t border-gray-200 p-3">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center md:justify-start gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 border border-gray-200"
            >
              <FiLogOut /> <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;

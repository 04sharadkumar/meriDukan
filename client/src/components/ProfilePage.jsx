import { useEffect, useState } from 'react';
import { FiEdit, FiShoppingBag, FiHeart, FiMapPin, FiCreditCard, FiSettings, FiLogOut } from 'react-icons/fi';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccountSettingsTab from './profileTabs/AccountSettingsTab';
import { Link } from 'react-router-dom';
const ProfilePage = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    avatar: '',
    address: '',
  });

  const navigate = useNavigate();

  const handleLogout = async () => {
    await axios.post('http://localhost:5000/api/auth/logout', {}, {
      withCredentials: true,
    });
    navigate('/login');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.error('Auth fetch failed:', err.message);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const navItem = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 w-full px-6 py-4 text-left ${
          isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
        }`
      }
    >
      {icon} {label}
    </NavLink>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 flex flex-col items-center">
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 mb-4"
              />
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              
              <Link to='/profile/account-settings'>
              <button className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <FiEdit /> Edit Profile
              </button>
              </Link>
            </div>

            <nav className="border-t">
              {navItem('/profile/orders', <FiShoppingBag />, 'My Orders')}
              {navItem('/profile/wishlist', <FiHeart />, 'Wishlist')}

              {navItem('/profile/payment', <FiCreditCard />, 'Payment Methods')}
              {navItem('/profile/account-settings', <FiSettings />, 'Account Settings')}

              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-6 py-4 text-left text-red-600 hover:bg-gray-50"
              >
                <FiLogOut /> Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

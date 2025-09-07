import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Signup from './components/Signup';
import Cart from './components/Cart';
import ProfilePage from './components/ProfilePage';
import Wishlist from './components/Wishlist';

import AdminDashboard from './components/AdminDashboard';
import ProductTab from './components/Admin/ProductTab';
import AddProduct from './components/Admin/AddProduct';
import EditProduct from './components/Admin/EditProduct';
import User from './components/Admin/User';
import OrderTab from './components/Admin/OrderTab';

import CheckoutPage from './components/CheckOut/CheckoutPage';
import ProtectedRoute from './context/ProtectedRoute';


import OrdersTab from './components/profileTabs/OrdersTab';
import WishlistTab from './components/profileTabs/WishlistTab';
import PaymentTab from './components/profileTabs/PaymentTab';
import AccountSettingsTab from './components/profileTabs/AccountSettingsTab'
import RevenueTab from './components/Admin/RevenueTab';


import NewSlide from './components/NewSlide';
import ProductPage from './components/ProductDetails';

function App() {
  return (
    < >
      <Toaster position="top-right" />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />

       <Route path="/admin" element={<AdminDashboard />} />
       <Route path="/admin/products" element={<ProductTab />} />
       <Route path="/admin/product/add" element={<AddProduct />} />
       <Route path="/admin/product/edit/:id" element={<EditProduct />} />
       <Route path="/admin/users" element={<User />} />
       <Route path="/admin/orders" element={<OrderTab />} />
       <Route path="/admin/revenue" element={<RevenueTab />} />


        {/* ✅ Protected Routes */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}>
        


        <Route index element={<AccountSettingsTab />} />
        <Route path="orders" element={<OrdersTab />} />
        <Route path="wishlist" element={<WishlistTab />} />
        <Route path="payment" element={<PaymentTab />} />
        <Route path="account-settings" element={<AccountSettingsTab />} />
        </Route>

        <Route path="/wishlist" element={  <Wishlist />} />



        <Route path='/products' element={<NewSlide />} />
        <Route path='/productDetail' element={<ProductPage />} />


        <Route path="/checkout" element={<CheckoutPage />} />
        
      </Routes>
      <Footer />
    </>
  );
}

export default App;

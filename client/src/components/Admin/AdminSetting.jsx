import React, { useState, useEffect } from 'react';
import { 
  FiSettings, 
  FiSave, 
  FiRefreshCw, 
  FiMail, 
  FiCreditCard, 
  FiShoppingCart,
  FiTruck,
  FiUser,
  FiLock,
  FiBell,
  FiGlobe,
  FiDollarSign,
  FiShield,
  FiImage,
  FiPackage
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getCookie } from '../../utils/cookieHelper';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    storeName: 'My Ecommerce Store',
    storeEmail: 'admin@myecommerce.com',
    storePhone: '+91 9876543210',
    storeAddress: '123 Business Street, Mumbai, India',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en',
    
    // Payment Settings
    stripeEnabled: true,
    razorpayEnabled: true,
    paypalEnabled: false,
    codEnabled: true,
    testMode: true,
    
    // Shipping Settings
    freeShippingThreshold: 999,
    shippingCost: 49,
    estimatedDeliveryDays: 3,
    allowInternationalShipping: false,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    newOrderAlerts: true,
    
    // Security Settings
    requireStrongPasswords: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Product Settings
    lowStockThreshold: 10,
    allowReviews: true,
    autoApproveReviews: false,
    maxProductsPerPage: 24,
    
    // Maintenance Settings
    maintenanceMode: false,
    storeClosedMessage: 'We are currently performing maintenance. Please check back later.',
    allowAdminAccess: true
  });

  const authToken = getCookie("authToken");
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};


  // Load settings from API
  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/settings', { headers });
      if (response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
      toast.success('Settings loaded successfully');
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  
  // Save settings to API
  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.post('http://localhost:5000/api/admin/settings', settings, { headers });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        ...settings,
        freeShippingThreshold: 999,
        shippingCost: 49,
        estimatedDeliveryDays: 3,
        lowStockThreshold: 10,
        maxProductsPerPage: 24
      });
      toast.success('Settings reset to defaults');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <FiSettings /> },
    { id: 'payment', label: 'Payment', icon: <FiCreditCard /> },
    { id: 'shipping', label: 'Shipping', icon: <FiTruck /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'security', label: 'Security', icon: <FiShield /> },
    { id: 'products', label: 'Products', icon: <FiPackage /> },
    { id: 'maintenance', label: 'Maintenance', icon: <FiRefreshCw /> }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Name *
          </label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => handleInputChange('storeName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter store name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Email *
          </label>
          <input
            type="email"
            value={settings.storeEmail}
            onChange={(e) => handleInputChange('storeEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="admin@store.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Phone
          </label>
          <input
            type="text"
            value={settings.storePhone}
            onChange={(e) => handleInputChange('storePhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+91 9876543210"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Store Address
        </label>
        <textarea
          value={settings.storeAddress}
          onChange={(e) => handleInputChange('storeAddress', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter complete store address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Asia/Kolkata">India Standard Time</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="Europe/London">London Time</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiCreditCard className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Stripe</p>
              <p className="text-sm text-gray-500">Credit card payments</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.stripeEnabled}
              onChange={(e) => handleInputChange('stripeEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiDollarSign className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Razorpay</p>
              <p className="text-sm text-gray-500">Indian payment gateway</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.razorpayEnabled}
              onChange={(e) => handleInputChange('razorpayEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiShoppingCart className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Cash on Delivery</p>
              <p className="text-sm text-gray-500">Pay when product is delivered</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.codEnabled}
              onChange={(e) => handleInputChange('codEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiShield className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Test Mode</p>
              <p className="text-sm text-yellow-700">All payments are in test mode</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.testMode}
              onChange={(e) => handleInputChange('testMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Free Shipping Threshold (₹)
          </label>
          <input
            type="number"
            value={settings.freeShippingThreshold}
            onChange={(e) => handleInputChange('freeShippingThreshold', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
          <p className="text-sm text-gray-500 mt-1">Free shipping for orders above this amount</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Standard Shipping Cost (₹)
          </label>
          <input
            type="number"
            value={settings.shippingCost}
            onChange={(e) => handleInputChange('shippingCost', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Delivery (Days)
          </label>
          <input
            type="number"
            value={settings.estimatedDeliveryDays}
            onChange={(e) => handleInputChange('estimatedDeliveryDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="30"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiGlobe className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">International Shipping</p>
              <p className="text-sm text-gray-500">Allow shipping to other countries</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowInternationalShipping}
              onChange={(e) => handleInputChange('allowInternationalShipping', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Notification Channels</h3>
        
        {[
          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive order updates via email' },
          { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive important alerts via SMS' },
          { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Get notified when products are low in stock' },
          { key: 'newOrderAlerts', label: 'New Order Alerts', description: 'Get notified for every new order' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(e) => handleInputChange(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          { key: 'requireStrongPasswords', label: 'Require Strong Passwords', description: 'Force users to create strong passwords' },
          { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Enable 2FA for admin accounts' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(e) => handleInputChange(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (Minutes)
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="5"
            max="240"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="10"
          />
        </div>
      </div>
    </div>
  );

  const renderProductSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Low Stock Threshold
          </label>
          <input
            type="number"
            value={settings.lowStockThreshold}
            onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
          <p className="text-sm text-gray-500 mt-1">Alert when product quantity falls below this number</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Products Per Page
          </label>
          <input
            type="number"
            value={settings.maxProductsPerPage}
            onChange={(e) => handleInputChange('maxProductsPerPage', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="100"
          />
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'allowReviews', label: 'Allow Product Reviews', description: 'Let customers submit product reviews' },
          { key: 'autoApproveReviews', label: 'Auto-approve Reviews', description: 'Automatically publish reviews without moderation' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(e) => handleInputChange(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMaintenanceSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <FiRefreshCw className="w-5 h-5 text-orange-600" />
          <div>
            <p className="font-medium text-gray-900">Maintenance Mode</p>
            <p className="text-sm text-gray-500">Temporarily close the store for maintenance</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
        </label>
      </div>

      {settings.maintenanceMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maintenance Message
          </label>
          <textarea
            value={settings.storeClosedMessage}
            onChange={(e) => handleInputChange('storeClosedMessage', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter message to display during maintenance"
          />
        </div>
      )}

      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <FiUser className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-gray-900">Allow Admin Access</p>
            <p className="text-sm text-gray-500">Admins can access store during maintenance</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.allowAdminAccess}
            onChange={(e) => handleInputChange('allowAdminAccess', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'payment': return renderPaymentSettings();
      case 'shipping': return renderShippingSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'products': return renderProductSettings();
      case 'maintenance': return renderMaintenanceSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-600 mt-2">Manage your store configuration and preferences</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading settings...</span>
              </div>
            ) : (
              <>
                {renderTabContent()}
                
                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                  <button
                    onClick={resetToDefaults}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Reset to Defaults
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={loadSettings}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={saveSettings}
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

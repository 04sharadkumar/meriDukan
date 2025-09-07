"use client";
import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import axiosInstance from "../../context/axiosInstance";
import axios from "axios";

// Steps
import Step1Login from "./Step1Login";
import Step2Address from "./Step2Address";
import Step3Summary from "./Step3Summary";
import Step4Payment from "./Step4Payment";

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [token, setToken] = useState(Cookies.get("token") || null);
  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);

  // 🔹 Checkout form data
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "cash", // default
  });

  // 🔹 Fetch Cart 
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoadingCart(true);
        const res = await axiosInstance.get("/api/cart", { withCredentials: true });
        setCart(res.data.items || []);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setCart([]);
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();
  }, []);

  // 🔹 Check Login
  useEffect(() => {
    const tokenFromCookie = Cookies.get("token");
    if (tokenFromCookie) {
      setToken(tokenFromCookie);
      setStep(2);
    }
  }, []);

  // 🔹 Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Save order to backend after payment success
  const handleOrderSave = async (paymentResponse) => {
    try {
      const orderData = {
        userEmail: formData.email,
        address: {
          name: formData.name,
          mobile: formData.mobile,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
        },
        products: cart,
        payment: {
          method: formData.paymentMethod,
          transactionId: paymentResponse?.id || "txn_dummy_123",
          status: "success",
        },
      };

      const tokenFromCookie = Cookies.get("token");

      const res = await axios.post("http://localhost:5000/api/orders/create",
        orderData,
        { headers: { Authorization: `Bearer ${tokenFromCookie}` } }
      );

      console.log(res.data);
      

      if (res.data.success) {
        alert("✅ Order placed successfully!");
        setStep(1); // Reset checkout
        setCart([]); // Clear cart
      }
    } catch (err) {
      console.error("❌ Order Save Error:", err);
      alert("Order save failed!");
    }
  };

  // ✅ useCallback to fix ESLint missing dependency
  const handleCartUpdate = useCallback((updatedCart) => {
    setCart(updatedCart);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl overflow-hidden">
        
        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNum
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stepNum}
                </div>
                <span className="text-xs mt-1 text-gray-600">
                  {stepNum === 1
                    ? "Login"
                    : stepNum === 2
                    ? "Address"
                    : stepNum === 3
                    ? "Summary"
                    : "Payment"}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500 ease-in-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Steps */}
        {!token && step === 1 && (
          <Step1Login
            step={step}
            setStep={setStep}
            formData={formData}
            handleInputChange={handleInputChange}
            setToken={setToken}
          />
        )}

        {step === 2 && (
          <Step2Address
            step={step}
            setStep={setStep}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}

        {loadingCart ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-blue-600 font-medium">Loading Cart...</span>
          </div>
        ) : (
          <>
            {step === 3 && (
              <Step3Summary
                step={step}
                setStep={setStep}
                cart={cart}
                shippingInfo={{
                  name: formData.name,
                  mobile: formData.mobile,
                  address: formData.address,
                  city: formData.city,
                  pincode: formData.pincode,
                }}
                paymentMethod={formData.paymentMethod}
                onCartUpdate={handleCartUpdate}  // ✅ fixed with useCallback
              />
            )}

            {step === 4 && (
              <Step4Payment
                step={step}
                setStep={setStep}
                formData={{
                  items: cart,
                  shippingInfo: {
                    name: formData.name,
                    mobile: formData.mobile,
                    address: formData.address,
                    city: formData.city,
                    pincode: formData.pincode,
                  },
                  totalAmount: cart.reduce(
                    (sum, item) => sum + item.price * item.qty,
                    0
                  ),
                  paymentMethod: formData.paymentMethod,
                  userId: "", // Optional
                }}
                handleInputChange={handleInputChange}
                onPaymentSuccess={handleOrderSave}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

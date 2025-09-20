"use client";
import { useEffect, useState } from "react";
import axios from 'axios';
import { getCookie } from "../utils/cookieHelper";

export default function SuccessPage() {
  const [status, setStatus] = useState("processing"); // "processing" | "success" | "failed"
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id"); // Stripe session
        const codOrderId = params.get("order_id");   // COD order id

        const authToken = getCookie("authToken");
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        // ---------------- COD CASE ----------------
        if (codOrderId) {
          const { data } = await axios.get(
            `http://localhost:5000/api/orders/${codOrderId}`,
            { headers }
          );

          if (data.success) {
            setStatus("success");
            setOrder(data.order);
          } else {
            setStatus("failed");
          }
          return;
        }

        // ---------------- CARD / STRIPE CASE ----------------
        if (sessionId) {
          const { data } = await axios.post(
            "http://localhost:5000/api/payment/verify",
            { sessionId },
            { headers }
          );

          if (data.success) {
            setStatus("success");
            setOrder(data.order);
          } else {
            setStatus("failed");
          }
        }
      } catch (err) {
        console.error("Verify Error:", err);
        setStatus("failed");
      }
    };

    checkOrderStatus();
  }, []);

  // ---------------- UI ----------------
  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Processing Your Order</h1>
          <p className="text-gray-500 text-sm">Please wait while we verify your payment and place your order.</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-1">
              {order?.paymentMethod === "COD" ? "Order Placed Successfully!" : "Payment Successful!"}
            </h1>
            <p className="text-gray-500 text-sm">
              {order?.paymentMethod === "COD"
                ? "Your order has been placed and will be delivered soon."
                : "Your payment has been verified and order has been placed successfully."}
            </p>
          </div>

       
          
          
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Order Failed</h1>
        <p className="text-gray-500 text-sm mb-4">There was an issue with your order or payment. Please try again.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
import { useState } from "react";
import { getCookie } from "../../utils/cookieHelper";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Step4Payment({
  step,
  formData,
  handleInputChange,
  onPaymentSuccess,
  clearCart,
}) {
  const navigate = useNavigate(); // 🔹 navigate function
  const [loading, setLoading] = useState(false);

  if (step !== 4) return null;

  const handlePlaceOrder = async () => {
    if (!formData.paymentMethod) {
      alert("⚠️ Please select a payment method");
      return;
    }

    try {
      setLoading(true);

      const authToken = getCookie("authToken");
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

      // ----------------
      // CASE 1: Cash On Delivery
      // ----------------
      if (formData.paymentMethod === "cash") {
        const orderPayload = {
          cartItems: (formData.items || []).map((item) => ({
            productId: item.productId || item.product || item._id,
            name: item.name,
            qty: item.qty || item.quantity,
            price:
              item.discountPrice && item.discountPrice > 0
                ? item.discountPrice
                : item.price,
            image: item.image,
          })),
          shippingInfo: formData.shippingInfo || {},
          paymentMethod: "Cash On Delivery",
          paymentStatus: "pending",
          totalAmount: (formData.items || []).reduce((sum, item) => {
            const price =
              item.discountPrice && item.discountPrice > 0
                ? item.discountPrice
                : item.price;
            return sum + price * (item.qty || item.quantity);
          }, 0),
          isPaid: false,
        };

        const { data } = await axios.post(
          "http://localhost:5000/api/orders/cash",
          orderPayload,
          { headers }
        );

        

        if (data.success) {
          toast.success("Order placed successfully with COD!");

          // Parent ko notify karo
          onPaymentSuccess && onPaymentSuccess(data);

          // Cart clear karo
          if (typeof clearCart === "function") {
            await clearCart();
          }
          // Redirect karo (yaha "/" = home page)
          navigate("/");
        } else {
          alert("❌ Failed to place COD order");
        }
      }

      // ----------------
      // CASE 2: Card (Stripe)
      // ----------------
      else if (formData.paymentMethod === "card") {
        const cartItems = (formData.items || []).map((item) => ({
          productId: item.productId || item.product || item._id,
          name: item.name,
          qty: item.qty || item.quantity,
          price:
            item.discountPrice && item.discountPrice > 0
              ? item.discountPrice
              : item.price,
          image: item.image,
        }));

        try {
          setLoading(true);
          const { data } = await axios.post(
            "http://localhost:5000/api/payment/create-checkout-session",
            {
              cartItems,
              shippingInfo: formData.shippingInfo,
              totalAmount: formData.totalAmount,
            },
            { headers }
          );

         
          

          if (data.success && data.url) {
            // Redirect user to Stripe Checkout
            window.location.href = data.url;
          } else {
            alert("❌ Failed to create Stripe session!");
          }
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("❌ Payment Error:", error.response?.data || error.message);
      alert("❌ Something went wrong during payment!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50">
      {/* Header */}
      <div className="flex justify-between items-center p-6 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
        <h2 className="font-semibold text-lg flex items-center gap-3">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-blue-600 text-white shadow-md">
            4
          </span>
          PAYMENT OPTIONS
        </h2>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="space-y-4 mb-6">
          <h3 className="font-medium text-gray-700 mb-3">
            Select Payment Method
          </h3>
          {[
            {
              value: "card",
              label: "Credit / Debit Card (Stripe)",
              icon: "💳",
            },
            { value: "cash", label: "Cash on Delivery", icon: "💰" },
          ].map((method) => (
            <label
              key={method.value}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.paymentMethod === method.value
                  ? "border-blue-500 bg-blue-100"
                  : "border-gray-200 hover:border-blue-400"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={formData.paymentMethod === method.value}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3 flex items-center">
                <span className="mr-2 text-xl">{method.icon}</span>
                <span>{method.label}</span>
              </div>
            </label>
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className={`w-full ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:-translate-y-0.5"
          } text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300`}
        >
          {loading ? "Processing..." : "PLACE ORDER"}
        </button>
      </div>
    </div>
  );
}

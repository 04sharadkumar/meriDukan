import { useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // agar react-router use kar rahe ho
import axiosInstance from "../context/axiosInstance";

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // Backend ko hit karo order verify/save ke liye
      axiosInstance.post("/api/payment/verify", { sessionId })
        .then((res) => {
          if (res.data.success) {
            alert("✅ Order placed successfully!");
          } else {
            alert("❌ Order verification failed!");
          }
        })
        .catch((err) => {
          console.error("Error verifying order:", err);
        });
    }
  }, [sessionId]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-600">Payment Successful 🎉</h1>
      <p>Your order is being processed.</p>
    </div>
  );
}

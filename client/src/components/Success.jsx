import { useEffect } from "react";
import { useSearchParams ,useNavigate } from "react-router-dom"; // agar react-router use kar rahe ho
// import axiosInstance from "../context/axiosInstance";
import axios from "axios";
import toast from "react-hot-toast";

export default function Success() {
  const [searchParams] = useSearchParams();
   const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // Backend ko hit karo order verify/save ke liye
      axios.post("http://localhost:5000/api/payment/verify", { sessionId })
        .then((res) => {
          if (res.data.success) {
            toast.success("✅ Order & Delivery created successfully!");
            navigate("/"); // home page ya orders page
          } else {
            toast.error("❌ Order verification failed!");
          }
        })
        .catch((err) => {
          console.error("Error verifying order:", err);
          toast.error("❌ Something went wrong!");
        });
    }
  }, [sessionId,navigate]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-600">Payment Successful 🎉</h1>
      <p>Your order is being processed.</p>
    </div>
  );
}

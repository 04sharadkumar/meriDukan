import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Step1Login({ step, setStep, formData, handleInputChange }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5000/api/otp/send-otp", { email: formData.email });
      setOtpSent(true);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/otp/verify-otp", {
        email: formData.email,
        otp
      });
      toast.success('Email successful verified');

      // res.data.userId returned from backend after OTP verify
    const userId = res.data.userId;

    setStep(2, { userId, email: formData.email }); // pass to Step2
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  if (step !== 1) return null;

  
  return (
    <div className="border-b border-gray-200 bg-blue-50">
      <div className="flex justify-between items-center p-6 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
        <h2 className="font-semibold text-lg flex items-center gap-3">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-blue-600 text-white shadow-md">
            1
          </span>
          LOGIN OR SIGNUP
        </h2>
        <span className="text-blue-600 text-sm">
          {formData.email ? "✓ " + formData.email : "Not completed"}
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter Email Address"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={otpSent} // disable input after OTP sent
            />
          </div>

          {!otpSent ? (
            <button
              onClick={sendOtp}
              className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={!formData.email || loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-3 mt-3"
              />
              <button
                onClick={verifyOtp}
                className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                disabled={otp.length !== 6 || loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {error && <p className="text-red-500 mt-2">{error}</p>}

          <p className="text-xs text-gray-500 mt-4">
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and{" "}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>

        <div className="bg-blue-50 p-5 rounded-lg">
          <h3 className="text-gray-700 font-medium mb-4 text-lg">
            Advantages of our secure login
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">🚚 Easily Track Orders, Hassle free Returns</li>
            <li className="flex items-start gap-2">🔔 Get Relevant Alerts and Recommendations</li>
            <li className="flex items-start gap-2">⭐ Wishlist, Reviews, Ratings and more</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

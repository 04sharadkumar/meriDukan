import { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch payment history from backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/payment/history', {
          withCredentials: true,
        });
        setPayments(res.data.payments || []);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading payment history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 text-lg mb-4">No payment history found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">My Payment History</h1>

        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm"
            >
              <div>
                <h2 className="font-medium text-gray-900">
                  {payment.paymentMethod.toUpperCase()}
                </h2>
                <p className="text-gray-600">
                  Amount: ₹{payment.totalPrice}
                </p>
                <p className="text-gray-500 text-sm">
                  Date: {new Date(payment.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    payment.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : payment.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {payment.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;

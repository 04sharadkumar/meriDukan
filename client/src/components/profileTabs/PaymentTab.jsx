import { useState } from 'react';
import axios from 'axios';
import GooglePayButton from '../GooglePayButton';

const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleCardPayment = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        'http://localhost:5000/api/payment/create-checkout-session',
        { method: 'card' },
        { withCredentials: true }
      );

      if (res.data?.url) {
        setCheckoutUrl(res.data.url);
        // In a real app, you might redirect directly to the URL
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      alert('Card payment setup failed.');
    } finally {
      setLoading(false);
    }
  };

  const qrDetails = {
    googlepay: {
      qr: 'https://yourdomain.com/qr/googlepay.png',
      number: '9876543210',
      name: 'Google Pay',
      color: '#4285F4',
    },
    phonepe: {
      qr: 'https://yourdomain.com/qr/phonepe.png',
      number: '9123456789',
      name: 'PhonePe',
      color: '#5F259F',
    },
    paytm: {
      qr: 'https://yourdomain.com/qr/paytm.png',
      number: '9988776655',
      name: 'Paytm',
      color: '#00BAF2',
    },
    card: {
      name: 'Credit/Debit Card',
      color: '#6772E5',
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setCheckoutUrl('');
    setPaymentSuccess(false);
    if (method === 'card') handleCardPayment();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">Select your preferred payment method</p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4 mb-8">
            {['googlepay', 'phonepe', 'paytm', 'card'].map((method) => (
              <button
                key={method}
                onClick={() => handleMethodSelect(method)}
                className={`w-full flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedMethod === method
                    ? `border-[${qrDetails[method].color}] shadow-md`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selectedMethod === method ? { borderColor: qrDetails[method].color } : {}}
              >
                <div className="w-10 h-10 mr-4 flex items-center justify-center rounded-full bg-gray-100">
                  {selectedMethod === 'googlepay' && (
  <div className="text-center">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Pay with Google Pay</h2>
    <GooglePayButton amount="10.00" />
  </div>
)}
                  {method === 'phonepe' && (
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#5F259F" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                      <path fill="#5F259F" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                    </svg>
                  )}
                  {method === 'paytm' && (
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#00BAF2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                      <path fill="#00BAF2" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                    </svg>
                  )}
                  {method === 'card' && (
                    <svg className="w-6 h-6" fill="none" stroke="#6772E5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900 capitalize">
                    {qrDetails[method].name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {method === 'card' ? 'Secure card payment' : 'UPI payment'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Payment Details Section */}
          {selectedMethod && (
            <div className="bg-gray-50 rounded-xl p-6 transition-all duration-300">
              {['phonepe', 'paytm'].includes(selectedMethod) && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      Pay with {qrDetails[selectedMethod].name}
                    </h2>
                    <p className="text-gray-600">Scan the QR code or use the UPI ID below</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <img
                      src={qrDetails[selectedMethod].qr}
                      alt="QR Code"
                      className="mx-auto h-48 w-48 object-contain p-2 border border-gray-200 rounded"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                      <div className="flex items-center bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-mono text-gray-900">{qrDetails[selectedMethod].number}@upi</span>
                        <button 
                          className="ml-auto text-sm text-indigo-600 hover:text-indigo-800"
                          onClick={() => navigator.clipboard.writeText(`${qrDetails[selectedMethod].number}@upi`)}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                        onClick={() => setPaymentSuccess(true)}
                      >
                        I've made the payment
                      </button>
                    </div>
                  </div>
                </>
              )}

              {selectedMethod === 'card' && (
                <>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-gray-700">Preparing secure payment gateway...</p>
                    </div>
                  ) : checkoutUrl ? (
                    <div className="text-center">
                      <div className="mb-6">
                        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                          Secure Checkout Ready
                        </h2>
                        <p className="text-gray-600">You'll be redirected to our payment partner</p>
                      </div>
                      
                      <a
                        href={checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 mb-4"
                      >
                        Proceed to Payment
                      </a>
                      
                      <p className="text-sm text-gray-500">
                        <span className="inline-flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                          </svg>
                          Secure SSL encrypted
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Preparing card payment options...</p>
                    </div>
                  )}
                </>
              )}

              {paymentSuccess && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-6">Thank you for your purchase.</p>
                  <button 
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                    onClick={() => setPaymentSuccess(false)}
                  >
                    Back to payment options
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
     
    </div>
  );
};

export default PaymentPage;
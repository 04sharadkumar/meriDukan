import React from 'react';

const RazorpayPayButton = () => {
  const loadRazorpay = () => {
    const options = {
      key: 'YOUR_KEY_ID', // Replace with your Razorpay Key ID
      amount: 10000, // 10000 paise = ₹100
      currency: 'INR',
      name: 'Your Company',
      description: 'Test Transaction',
      image: 'https://your-logo.png',
      handler: function (response) {
        alert(`Payment successful! ID: ${response.razorpay_payment_id}`);
        console.log(response);
      },
      prefill: {
        name: 'Sharad Kumar',
        email: 'sharad@example.com',
        contact: '9999999999',
      },
      notes: {
        address: 'Test address',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button onClick={loadRazorpay} className="bg-blue-600 text-white px-4 py-2 rounded">
      Pay ₹100 with Razorpay
    </button>
  );
};

export default RazorpayPayButton;

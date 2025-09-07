import React, { useEffect } from 'react';

const GooglePayButton = () => {
  useEffect(() => {
    const paymentsClient = new window.google.payments.api.PaymentsClient({
      environment: 'TEST', // Change to 'PRODUCTION' later
    });

    const paymentRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['VISA', 'MASTERCARD'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example', // For demo purpose, use 'stripe' when real
            gatewayMerchantId: 'exampleGatewayMerchantId',
          },
        },
      }],
      merchantInfo: {
        merchantId: '01234567890123456789', // Required for PRODUCTION only
        merchantName: 'Demo Shop',
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: '1.00',
        currencyCode: 'USD',
        countryCode: 'US',
      },
    };

    const container = document.getElementById('google-pay-button-container');
    if (container) {
      const button = paymentsClient.createButton({
        onClick: () => {
          paymentsClient.loadPaymentData(paymentRequest)
            .then(paymentData => {
              console.log('Payment Success 🎉', paymentData);
              alert('Google Pay Success!');
            })
            .catch(err => {
              console.error('Payment Failed', err);
              alert('Google Pay Failed!');
            });
        }
      });
      container.appendChild(button);
    }
  }, []);

  return <div id="google-pay-button-container"></div>;
};

export default GooglePayButton;

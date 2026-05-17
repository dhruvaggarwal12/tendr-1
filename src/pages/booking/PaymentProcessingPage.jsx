// src/pages/payment/PaymentProcessingPage.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import axios from "axios";

const PaymentProcessingPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId, bookingDetails, amount, paymentId } = state || {};

  useEffect(() => {
    if (!orderId || !paymentId) {
      return navigate("/booking-review");
    }

    // Load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      openRazorpay();
    };
    document.body.appendChild(script);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, paymentId]);

  const BACKEND_BASE_URL = import.meta.env.VITE_BASE_URL;
  const openRazorpay = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay needs amount in paisa
      currency: "INR",
      name: "Tendr",
      description: bookingDetails?.eventName || "Event Booking",
      order_id: orderId, // orderId backend se aaya hua
      handler: async function (response) {
        try {
          // Payment verification call to backend
          const res = await axios.post(
            `${BACKEND_BASE_URL}/api/payments/verify`,
            {
              paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
            },
            { withCredentials: true }
          );

          // agar verification success hua
          if (res.data && res.data.payment?.status === "SUCCESS") {
            navigate("/booking/payment-success", {
              state: { bookingDetails, amount, orderId, paymentId },
            });
          } else {
            navigate("/booking/payment-failed", {
              state: { bookingDetails, amount, orderId, paymentId },
            });
          }
        } catch (err) {
          console.error("Payment verify error:", err);
          navigate("/payment-failed", {
            state: { bookingDetails, amount, orderId, paymentId },
          });
        }
      },
      theme: {
        color: "#2e1b0f",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF6EF]">
      <SEO title="Processing Payment" description="Your Tendr payment is being processed." path="/booking/payment-processing" noIndex={true} />
      <h2 className="text-xl font-bold text-[#2e1b0f]">
        Processing your payment, please wait...
      </h2>
    </div>
  );
};

export default PaymentProcessingPage;
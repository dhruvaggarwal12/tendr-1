// src/pages/payment/PaymentFailedPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import SEO from "../../components/SEO";
import logo from "../../assets/logos/tendr-logo-secondary.png";
import Footer from "../../components/Footer";
import HamburgerNav from "../../components/HamburgerNav";

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { orderId, bookingDetails, amount, paymentId } = state || {};
  const [loading, setLoading] = useState(false);

  const BACKEND_BASE_URL = import.meta.env.VITE_BASE_URL;
  const handleRetry = async () => {
    try {
      setLoading(true);

      // 🔹 Call backend retry API
      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/payments/${paymentId}/retry`,
        {},
        { withCredentials: true }
      );

      if (res.data && res.data.payment?.status === "SUCCESS") {
        // 🔹 Direct success page
        navigate("/booking/payment-success", {
          state: {
            orderId: res.data.order.id,
            bookingDetails,
            amount,
            paymentId: res.data.payment._id,
          },
        });
      } else {
        alert("Retry failed. Please try again later.");
      }
    } catch (err) {
      console.error("Retry error:", err);
      alert("Something went wrong during retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FFF6EF]">
      <SEO title="Payment Failed" description="Your Tendr payment could not be processed. Please try again." path="/booking/payment-failed" noIndex={true} />
      <HamburgerNav />
      {/* Main Container */}
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 flex flex-col items-center text-center">
          {/* Logo */}
          <img src={logo} alt="Tendr Logo" className="w-40 sm:w-48 mx-auto mb-6" />

          {/* Icon */}
          <div className="text-[#2e1b0f] text-6xl mb-4">❌</div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2e1b0f] mb-3">
            Payment Failed
          </h2>

          {/* Message */}
          <p className="text-gray-700 text-base sm:text-lg font-medium mb-6">
            Unfortunately, your payment could not be processed.  
            Please check your details and try again.
          </p>

          {/* Retry Button */}
          <button
            onClick={handleRetry}
            disabled={loading}
            className="w-full sm:w-60 bg-[#2e1b0f] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#2e1b0f]/80 transition disabled:opacity-50"
          >
            {loading ? "Retrying..." : "Retry Payment"}
          </button>

          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => navigate("/booking/review")}
              style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              ← Back to Review
            </button>
            <button onClick={() => navigate("/dashboard")}
              style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid rgba(139,69,19,0.2)", background: "#fff", color: "#6B3A1F", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Go to Dashboard
            </button>
          </div>
          {/* Contact Support */}
          <p className="text-sm text-gray-600 mt-4">
            Need help?{" "}
            <span onClick={() => navigate("/contact-us")} className="text-[#2e1b0f] cursor-pointer hover:underline">
              Contact Support
            </span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default PaymentFailedPage;
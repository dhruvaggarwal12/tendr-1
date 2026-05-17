// src/pages/payment/PaymentFailedPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SEO from "../../components/SEO";
import logo from "../../assets/logos/tendr-logo-secondary.png";
import Footer from "../../components/Footer";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { orderId, bookingDetails, amount } = state || {};
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    // Navigate back to payment selection with the same booking state
    navigate("/booking/payment", {
      state: {
        ...state,
        orderId: null, // force fresh order creation
      },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F2", fontFamily: font, display: "flex", flexDirection: "column" }}>
      <SEO title="Payment Failed" description="Your Tendr payment could not be processed. Please try again." path="/booking/payment-failed" noIndex={true} />
      <HamburgerNav />

      <div style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px rgba(139,69,19,0.1)", width: "100%", maxWidth: 480, padding: "40px 36px", textAlign: "center" }}>

          <img src={logo} alt="Tendr" style={{ height: 44, objectFit: "contain", marginBottom: 24 }} />

          <div style={{ fontSize: 52, marginBottom: 14 }}>❌</div>

          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#2C1A0E", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            Payment Failed
          </h2>

          <p style={{ fontSize: 15, color: "#6B5E52", lineHeight: 1.7, margin: "0 0 10px" }}>
            Your payment could not be processed. This could be due to an incorrect card number, expired card, or insufficient funds.
          </p>

          {amount && (
            <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 28px" }}>
              Amount: <strong style={{ color: "#1C1C1C" }}>₹{Number(amount).toLocaleString("en-IN")}</strong>
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <button
              onClick={handleRetry}
              disabled={retrying}
              style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: retrying ? "not-allowed" : "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)", opacity: retrying ? 0.7 : 1 }}
            >
              {retrying ? "Redirecting…" : "Try Payment Again →"}
            </button>

            <button
              onClick={() => navigate("/booking/review")}
              style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font }}
            >
              ← Back to Review & Pay
            </button>

            <button
              onClick={() => navigate("/")}
              style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "transparent", color: "#9B7450", fontSize: 13, cursor: "pointer", fontFamily: font }}
            >
              Return to Home
            </button>
          </div>

          <p style={{ fontSize: 13, color: "#9B7450" }}>
            Need help?{" "}
            <a href="https://wa.me/919211668427" target="_blank" rel="noopener noreferrer"
              style={{ color: "#C47A2E", fontWeight: 600, textDecoration: "none" }}>
              WhatsApp Support
            </a>
            {" or "}
            <span onClick={() => navigate("/contact-us")} style={{ color: "#C47A2E", fontWeight: 600, cursor: "pointer" }}>
              Contact Us
            </span>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentFailedPage;

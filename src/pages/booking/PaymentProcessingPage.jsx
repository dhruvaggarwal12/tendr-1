// src/pages/payment/PaymentProcessingPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import HamburgerNav from "../../components/HamburgerNav";
import logo from "../../assets/logos/tendr-logo-secondary.png";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const PaymentProcessingPage = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { orderId, amount, eventPlanId, formData } = state || {};
  const [status, setStatus] = useState("loading"); // loading | opening | notlive | success | failed
  const token = localStorage.getItem("tendr_token");

  useEffect(() => {
    // No orderId = backend not ready yet, show graceful message
    if (!orderId) {
      setStatus("notlive");
      return;
    }
    // Load Razorpay SDK then open checkout
    if (window.Razorpay) {
      setStatus("opening");
      openRazorpay();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { setStatus("opening"); openRazorpay(); };
    script.onerror = () => setStatus("failed");
    document.body.appendChild(script);
  }, [orderId]);

  const openRazorpay = () => {
    const options = {
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:      Math.round(amount * 100),
      currency:    "INR",
      name:        "Tendr",
      description: formData?.eventType ? `${formData.eventType} — Tendr Booking` : "Event Booking",
      image:       logo,
      order_id:    orderId,
      handler: async (response) => {
        // Verify with backend
        try {
          const res = await fetch(`${BASE_URL}/api/payments/verify-plan-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            credentials: "include",
            body: JSON.stringify({
              razorpayOrderId:   orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              eventPlanId,
              amount,
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setStatus("success");
            navigate("/booking/payment-success", {
              state: { ...state, paymentId: response.razorpay_payment_id, orderId },
            });
          } else {
            setStatus("failed");
            navigate("/booking/payment-failed", {
              state: { ...state, orderId },
            });
          }
        } catch {
          // If verification call fails, still treat as success (admin can verify manually)
          setStatus("success");
          navigate("/booking/payment-success", {
            state: { ...state, paymentId: response.razorpay_payment_id, orderId },
          });
        }
      },
      modal: {
        ondismiss: () => navigate("/booking/review"),
      },
      prefill: {
        name:  formData?.eventName || "",
        email: "",
      },
      theme:  { color: "#C47A2E" },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      setStatus("failed");
      navigate("/booking/payment-failed", { state: { ...state, orderId } });
    });
    rzp.open();
  };

  // ── Screens ─────────────────────────────────────────────────────────────────

  if (status === "notlive") {
    return (
      <div style={{ minHeight: "100vh", background: "#FFF8F2", fontFamily: font, display: "flex", flexDirection: "column" }}>
        <SEO title="Payment" description="Tendr payment page." path="/booking/payment-processing" noIndex={true} />
        <HamburgerNav title="Payment" active="Pay" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "44px 36px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(139,69,19,0.1)", border: "1.5px solid rgba(196,122,46,0.15)" }}>
            <div style={{ fontSize: 52, marginBottom: 18 }}>🚧</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
              Payments coming very soon!
            </h2>
            <p style={{ fontSize: 15, color: "#9B7450", lineHeight: 1.7, margin: "0 0 10px" }}>
              We're not accepting online payments just yet — but <strong>your booking is confirmed</strong> and our team will reach out with payment details shortly.
            </p>
            <p style={{ fontSize: 14, color: "#9B7450", lineHeight: 1.65, margin: "0 0 28px" }}>
              Thanks for your patience and trust in Tendr. 🙏
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/dashboard")}
                style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>
                Go to Dashboard
              </button>
              <a href="https://wa.me/919211668427?text=Hi%20Tendr%2C%20I%20just%20completed%20my%20booking%20and%20wanted%20to%20check%20payment%20details."
                target="_blank" rel="noopener noreferrer"
                style={{ padding: "12px 24px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F2", fontFamily: font, display: "flex", flexDirection: "column" }}>
      <SEO title="Processing Payment" description="Your Tendr payment is being processed." path="/booking/payment-processing" noIndex={true} />
      <HamburgerNav title="Payment" active="Pay" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: "pulse 1.5s infinite" }}>⏳</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#2C1A0E", margin: "0 0 8px" }}>Opening secure payment…</h2>
          <p style={{ fontSize: 14, color: "#9B7450" }}>Please don't close this window.</p>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
};

export default PaymentProcessingPage;

// src/pages/payment/PaymentSelectionPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import HamburgerNav from "../../components/HamburgerNav";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const METHODS = [
  { id: "upi",        label: "UPI",                icon: "📱", hint: "Google Pay, PhonePe, Paytm, BHIM" },
  { id: "card",       label: "Credit / Debit Card", icon: "💳", hint: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking",         icon: "🏦", hint: "All major Indian banks" },
  { id: "wallet",     label: "Wallets",             icon: "👛", hint: "Paytm, Amazon Pay, Mobikwik" },
];

export default function PaymentSelectionPage() {
  const navigate   = useNavigate();
  const { state }  = useLocation();
  const [method,   setMethod]  = useState("upi");
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState("");

  // Support both old (state.booking.amount) and new (state.totalAmount) formats
  const amount      = state?.totalAmount || state?.booking?.amount || 0;
  const eventPlanId = state?.eventPlanId || null;
  const token       = localStorage.getItem("tendr_token");

  const handleProceed = async () => {
    if (!amount || amount <= 0) {
      setError("No booking amount found. Please go back and try again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/payments/create-plan-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ eventPlanId, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      navigate("/booking/payment-processing", {
        state: {
          ...state,
          orderId:  data.orderId,
          amount:   data.amount || amount,
        },
      });
    } catch (err) {
      console.error("create-plan-order error:", err);
      // Graceful fallback — payment not live yet
      navigate("/booking/payment-processing", {
        state: { ...state, orderId: null, amount },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F2", fontFamily: font }}>
      <SEO title="Select Payment Method" description="Choose your payment method to complete your Tendr booking." path="/booking/payment" noIndex={true} />
      <HamburgerNav title="Select Payment" active="Pay" />

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Amount summary */}
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 18, padding: "20px 24px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Amount to Pay</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: 0 }}>
              ₹{Number(amount).toLocaleString("en-IN")}
            </p>
            {state?.referralCode && (
              <p style={{ fontSize: 11, color: "#CCAB4A", margin: "4px 0 0" }}>🎁 15% referral discount applied</p>
            )}
          </div>
          <div style={{ fontSize: 36 }}>🔒</div>
        </div>

        {/* Method selector */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 16px" }}>Choose Payment Method</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px", borderRadius: 14, cursor: "pointer",
                border: method === m.id ? "2px solid #C47A2E" : "1.5px solid rgba(196,122,46,0.18)",
                background: method === m.id ? "rgba(196,122,46,0.06)" : "#fff",
                fontFamily: font, transition: "all 0.15s",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E" }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: "#9B7450" }}>{m.hint}</div>
                </div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${method === m.id ? "#C47A2E" : "#ddd"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {method === m.id && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#C47A2E" }} />}
              </div>
            </button>
          ))}
        </div>

        {error && <p style={{ fontSize: 13, color: "#c0392b", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate(-1)}
            style={{ flex: "0 0 100px", padding: "13px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#6B3A1F", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            ← Back
          </button>
          <button onClick={handleProceed} disabled={loading}
            style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: loading ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: loading ? "#9ca3af" : "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: font, boxShadow: loading ? "none" : "0 4px 14px rgba(196,122,46,0.35)" }}>
            {loading ? "Creating secure order…" : `Pay ₹${Number(amount).toLocaleString("en-IN")} →`}
          </button>
        </div>

        <p style={{ fontSize: 12, color: "#bbb", textAlign: "center", marginTop: 16 }}>
          🔒 Secured by Razorpay · 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}

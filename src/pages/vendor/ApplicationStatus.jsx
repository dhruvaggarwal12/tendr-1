import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const STATUS_INFO = {
  pending: {
    icon: "⏳",
    title: "Under Review",
    message: "Your application is being reviewed by our team. We typically respond within 24-48 hours.",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  contacted: {
    icon: "✅",
    title: "Application Accepted!",
    message: "Great news! Your application has been accepted. Our team will reach out to you on WhatsApp or email with the vendor onboarding form very shortly.",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  registered: {
    icon: "🎉",
    title: "You're Onboarded!",
    message: "Welcome to Tendr! You are now a registered vendor. Please check your WhatsApp or email for your vendor profile link and next steps.",
    color: "#0369a1",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  rejected: {
    icon: "❌",
    title: "Application Not Approved",
    message: "Unfortunately, we couldn't proceed with your application at this time. You may reapply after 30 days or contact us at contacttendr@gmail.com for more information.",
    color: "#c0392b",
    bg: "#fff5f5",
    border: "#fca5a5",
  },
};

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/vendor-applications/check?phone=${phone}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "No application found for this number.");
        return;
      }
      setResult(data.application);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = result ? STATUS_INFO[result.status] : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: font }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>
            Vendor Portal
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.2rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 10px" }}>
            Check Application Status
          </h1>
          <p style={{ fontSize: 15, color: "#9B7450", margin: 0 }}>
            Enter your registered phone number to see your application status.
          </p>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg, #C47A2E, #CCAB4A)", borderRadius: 100, margin: "16px auto 0" }} />
        </div>

        {/* Form card */}
        <div style={{ background: "#FFFCF5", borderRadius: 24, padding: "32px", boxShadow: "0 8px 40px rgba(139,69,19,0.1)", border: "1px solid rgba(196,122,46,0.1)" }}>

          <form onSubmit={handleCheck} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6B3A1F", marginBottom: 6 }}>
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="10-digit number used during registration"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); setResult(null); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                maxLength={10}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: 12,
                  border: `1.5px solid ${error ? "#c0392b" : focused ? "#C47A2E" : "rgba(196,122,46,0.3)"}`,
                  fontSize: 15,
                  fontFamily: font,
                  color: "#2C1A0E",
                  background: "#fff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {error && <p style={{ fontSize: 12, color: "#c0392b", marginTop: 4 }}>{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: loading ? "#e5e7eb" : "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                color: loading ? "#9ca3af" : "#fff",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: font,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(196,122,46,0.35)",
              }}
            >
              {loading ? "Checking..." : "Check Status"}
            </button>
          </form>

          {/* Result */}
          {result && statusInfo && (
            <div style={{ marginTop: 24, background: statusInfo.bg, borderRadius: 14, padding: "20px", border: `1.5px solid ${statusInfo.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{statusInfo.icon}</span>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: statusInfo.color, margin: "0 0 8px" }}>{statusInfo.title}</h3>
                  <p style={{ fontSize: 14, color: "#5a3a1a", margin: "0 0 10px", lineHeight: 1.6 }}>{statusInfo.message}</p>
                  <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>Application by: <strong>{result.name}</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9B7450" }}>
          <span>Haven't applied yet? </span>
          <span onClick={() => navigate("/vendor/register")} style={{ color: "#C47A2E", fontWeight: 600, cursor: "pointer" }}>
            List Your Service
          </span>
          <span> · </span>
          <span onClick={() => navigate("/")} style={{ color: "#C47A2E", fontWeight: 600, cursor: "pointer" }}>
            Back to Home
          </span>
        </div>
      </div>
    </div>
  );
}

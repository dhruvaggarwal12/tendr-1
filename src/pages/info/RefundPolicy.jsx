import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

const font = "'Outfit', sans-serif";

const REFUND_TIERS = [
  { timing: "Within 24 hours of booking", refund: "100%", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  { timing: "15+ days before the event", refund: "75%", color: "#0369a1", bg: "#eff6ff", border: "#bfdbfe" },
  { timing: "8–14 days before the event", refund: "50%", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  { timing: "4–7 days before the event", refund: "25%", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
  { timing: "Less than 4 days before event", refund: "No refund", color: "#c0392b", bg: "#fff5f5", border: "#fca5a5" },
];

const SPECIAL_CASES = [
  { label: "Bookings made 7–14 days before event", detail: "Cancel within 48 hours → 50% refund" },
  { label: "Bookings made 3–6 days before event", detail: "Cancel within 24 hours → 25% refund" },
  { label: "Bookings made less than 3 days before event", detail: "Cancel within 12 hours → 10% refund" },
];

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: font, background: "#FFFCF5", minHeight: "100vh" }}>

      {/* Nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,252,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(139,69,19,0.1)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span onClick={() => navigate("/")} style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", cursor: "pointer", letterSpacing: "-0.02em" }}>TENDR</span>
          <button onClick={() => navigate("/")} style={{ fontSize: 13, fontWeight: 600, color: "#6B3A1F", background: "rgba(139,69,19,0.06)", border: "1px solid rgba(139,69,19,0.18)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontFamily: font }}>← Back to Home</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)", padding: "72px 24px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 14 }}>Policies</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 16px" }}>Refund Policy</h1>
        <p style={{ fontSize: 17, color: "#7A5535", maxWidth: 520, margin: "0 auto" }}>
          We strive to be fair to both our customers and vendors. Here's exactly how our refund process works.
        </p>
        <div style={{ width: 48, height: 3, background: "linear-gradient(90deg, #C47A2E, #CCAB4A)", borderRadius: 100, margin: "20px auto 0" }} />
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px 80px" }}>

        {/* Standard refunds */}
        <section style={{ marginBottom: 52 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 20px", letterSpacing: "-0.01em" }}>Standard Refunds</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {REFUND_TIERS.map(({ timing, refund, color, bg, border }) => (
              <div key={timing} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1.5px solid rgba(139,69,19,0.08)", boxShadow: "0 2px 10px rgba(139,69,19,0.05)", gap: 16 }}>
                <span style={{ fontSize: 15, color: "#5a3a1a", fontWeight: 500 }}>{timing}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, borderRadius: 100, padding: "4px 14px", whiteSpace: "nowrap", flexShrink: 0 }}>{refund}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Special circumstances */}
        <section style={{ marginBottom: 52 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 20px", letterSpacing: "-0.01em" }}>Special Circumstances</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SPECIAL_CASES.map(({ label, detail }) => (
              <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: "1.5px solid rgba(139,69,19,0.08)", boxShadow: "0 2px 10px rgba(139,69,19,0.05)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, color: "#C47A2E", fontWeight: 600 }}>{detail}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Processing */}
        <section style={{ background: "linear-gradient(135deg, #FFF8F2, #F5E6CC)", borderRadius: 18, padding: "28px 28px", border: "1.5px solid rgba(196,122,46,0.2)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 12px" }}>Processing</h2>
          <p style={{ fontSize: 15, color: "#5a3a1a", lineHeight: 1.7, margin: 0 }}>
            All refunds are processed within <strong>5–7 business days</strong> and issued to the original payment method. Processing fees are non-refundable. For any queries, contact us at{" "}
            <a href="mailto:contacttendr@gmail.com" style={{ color: "#C47A2E", fontWeight: 600, textDecoration: "none" }}>contacttendr@gmail.com</a>.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}

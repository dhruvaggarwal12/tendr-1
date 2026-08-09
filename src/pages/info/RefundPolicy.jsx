import React from "react";
import SEO from "../../components/SEO";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import HamburgerNav from "../../components/HamburgerNav";

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
      <SEO
        title="Refund Policy"
        description="Tendr refund policy — understand how refunds work for event bookings made through the Tendr platform across Delhi NCR."
        path="/refund-policy"
        noIndex={false}
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Refund Policy", path: "/refund-policy" }]}
      />

      <HamburgerNav />

      <style>{`
        .rp-dot-bg { background-color: #FFFCF5; background-image: radial-gradient(circle, rgba(196,122,46,0.22) 1.5px, transparent 1.5px); background-size: 26px 26px; }
        @keyframes rp-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .rp-in-0 { animation: rp-in 0.52s 0.05s cubic-bezier(.22,1,.36,1) both; }
        .rp-in-1 { animation: rp-in 0.52s 0.13s cubic-bezier(.22,1,.36,1) both; }
        .rp-in-2 { animation: rp-in 0.52s 0.21s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .rp-in-0,.rp-in-1,.rp-in-2 { animation: none !important; opacity: 1 !important; } }
      `}</style>
      {/* Hero */}
      <div className="rp-dot-bg" style={{ padding: "80px 24px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 62% 72% at 50% 50%, rgba(255,252,245,0.95) 0%, rgba(255,252,245,0.58) 60%, transparent 100%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <span className="rp-in-0" style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C47A2E", background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.22)", padding: "4px 14px", borderRadius: 100, marginBottom: 18 }}>
            Policies
          </span>
          <h1 className="rp-in-1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.2rem, 5vw, 3.4rem)", fontWeight: 300, color: "#2C1A0E", margin: "0 0 16px", lineHeight: 1.15 }}>
            Refund <em style={{ color: "#C47A2E", fontStyle: "italic" }}>Policy</em>
          </h1>
          <p className="rp-in-2" style={{ fontSize: 17, color: "#7A5535", maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
            We strive to be fair to both our customers and vendors. Here's exactly how our refund process works.
          </p>
        </div>
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
            <a href="mailto:contact@tendr.co.in" style={{ color: "#C47A2E", fontWeight: 600, textDecoration: "none" }}>contact@tendr.co.in</a>.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}

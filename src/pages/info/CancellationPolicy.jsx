import React from "react";
import SEO from "../../components/SEO";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";

const PENALTIES = [
  { count: "1st cancellation in a month", icon: "⚠️", title: "Warning Only", desc: "No penalty, but logged in the system.", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  { count: "2–3 cancellations", icon: "📉", title: "Rating Reduction", desc: "–0.2 to –0.5 stars + lower priority in search results.", color: "#0369a1", bg: "#eff6ff", border: "#bfdbfe" },
  { count: "4–5 cancellations", icon: "💸", title: "Commission Increase", desc: "+2–5% commission increase for the next 5 orders.", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { count: "6–7 cancellations", icon: "⏸️", title: "7-Day Suspension", desc: "Account suspended for 7 days + 5–10% higher commission for 10 orders after reinstatement.", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
  { count: "8+ cancellations", icon: "🚫", title: "30-Day Suspension", desc: "Account suspended for 30 days + mandatory vendor re-evaluation before reactivation.", color: "#c0392b", bg: "#fff5f5", border: "#fca5a5" },
];

export default function CancellationPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: font, background: "#FFFCF5", minHeight: "100vh" }}>
      <SEO
        title="Cancellation Policy"
        description="Tendr's vendor cancellation policy — understand penalties for repeated cancellations and how Tendr maintains reliability for customers and vendors across Delhi NCR."
        path="/cancellation-policy"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Cancellation Policy", path: "/cancellation-policy" }]}
      />
      <HamburgerNav />

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)", padding: "72px 24px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 14 }}>Policies</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 16px" }}>Cancellation Policy</h1>
        <p style={{ fontSize: 17, color: "#7A5535", maxWidth: 540, margin: "0 auto" }}>
          We value reliability and fairness. Repeated cancellations by vendors affect customer trust and are penalised as outlined below.
        </p>
        <div style={{ width: 48, height: 3, background: "linear-gradient(90deg, #C47A2E, #CCAB4A)", borderRadius: 100, margin: "20px auto 0" }} />
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px 80px" }}>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 24px", letterSpacing: "-0.01em" }}>Vendor Cancellation Penalties</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {PENALTIES.map(({ count, icon, title, desc, color, bg, border }) => (
            <div key={count} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1.5px solid rgba(139,69,19,0.08)", boxShadow: "0 2px 12px rgba(139,69,19,0.05)", display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, border: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>{title}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color, background: bg, border: `1px solid ${border}`, borderRadius: 100, padding: "2px 10px" }}>{count}</span>
                </div>
                <p style={{ fontSize: 14, color: "#7A5535", margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div style={{ background: "linear-gradient(135deg, #FFF8F2, #F5E6CC)", borderRadius: 16, padding: "24px 24px", marginTop: 36, border: "1.5px solid rgba(196,122,46,0.2)" }}>
          <p style={{ fontSize: 15, color: "#5a3a1a", lineHeight: 1.7, margin: 0 }}>
            These measures ensure accountability and maintain high standards for both vendors and customers on the Tendr platform. For any disputes or queries, reach us at{" "}
            <a href="mailto:contacttendr@gmail.com" style={{ color: "#C47A2E", fontWeight: 600, textDecoration: "none" }}>contacttendr@gmail.com</a>.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

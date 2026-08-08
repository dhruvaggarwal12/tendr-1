import React from "react";
import HamburgerNav from "../../components/HamburgerNav";
import FunActivitiesSection from "../../components/FunActivitiesSection";
import SEO from "../../components/SEO";

const F  = "'Outfit', sans-serif";
const FD = "'Cormorant Garamond', Georgia, serif";

export default function FunActivitiesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: F }}>
      <SEO
        title="Fun Activities — Tendr"
        description="Fixed-price entertainment add-ons for your event. Games, photo booths, caricature artists, and more across NCR."
        path="/fun-activities"
      />
      <HamburgerNav />

      <style>{`
        @keyframes fa-orb {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
          50%       { opacity: 0.8; transform: translateX(-50%) scale(1.07); }
        }
        @media (max-width: 640px) {
          .fa-hero-wrap  { padding: 52px 18px 40px !important; }
          .fa-hero-title { font-size: 2.8rem !important; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div className="fa-hero-wrap" style={{
        position: "relative", overflow: "hidden",
        background: "#FFFCF5",
        borderBottom: "1px solid rgba(196,122,46,0.1)",
        padding: "80px 24px 60px",
        textAlign: "center",
      }}>
        {/* ambient orb */}
        <div style={{
          position: "absolute", top: -90, left: "50%",
          width: 520, height: 520, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(204,171,74,0.17) 0%, transparent 65%)",
          animation: "fa-orb 4.5s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* eyebrow */}
        <p style={{
          position: "relative",
          fontSize: 11, fontWeight: 800, color: "#C47A2E",
          letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 16px",
        }}>Add Magic to Any Event</p>

        {/* headline */}
        <h1 className="fa-hero-title" style={{
          position: "relative",
          fontFamily: FD, fontSize: "clamp(3rem,6vw,4.6rem)",
          fontWeight: 300, color: "#2C1A0E",
          margin: "0 0 18px", lineHeight: 1.08, letterSpacing: "-0.01em",
        }}>
          Fun{" "}
          <em style={{ fontStyle: "italic", color: "#C47A2E" }}>Activities</em>
        </h1>

        {/* sub */}
        <p style={{
          position: "relative",
          fontSize: 15, color: "#7A5535",
          margin: "0 auto 32px", lineHeight: 1.65, maxWidth: 440,
        }}>
          Fixed-price entertainment add-ons — confirmed within 2 hours across all NCR locations.
        </p>

        {/* trust pills */}
        <div style={{ position: "relative", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {["Fixed Pricing", "2-hr Confirmation", "All NCR", "Verified Vendors"].map(pt => (
            <span key={pt} style={{
              fontSize: 12, fontWeight: 600, color: "#7A4A1E",
              background: "rgba(196,122,46,0.07)",
              border: "1px solid rgba(196,122,46,0.18)",
              padding: "6px 14px", borderRadius: 100,
            }}>✓ {pt}</span>
          ))}
        </div>
      </div>

      {/* ── Activities grid ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 64px" }}>
        <FunActivitiesSection grid={true} />
      </div>
    </div>
  );
}

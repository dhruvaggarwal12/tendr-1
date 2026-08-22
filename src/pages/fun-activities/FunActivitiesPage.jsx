import React from "react";
import HamburgerNav from "../../components/HamburgerNav";
import FunActivitiesSection from "../../components/FunActivitiesSection";
import SEO from "../../components/SEO";

const F  = "'Outfit', sans-serif";
const FD = "'Cormorant Garamond', Georgia, serif";

const TRUST = [
  { icon: "₹",  label: "Fixed Pricing"     },
  { icon: "⚡", label: "2-hr Confirmation" },
  { icon: "📍", label: "All NCR"           },
  { icon: "✓",  label: "Verified Vendors"  },
];

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
        .fa-dot-bg {
          background-color: #FFFCF5;
          background-image: radial-gradient(circle, rgba(196,122,46,0.25) 1.5px, transparent 1.5px);
          background-size: 26px 26px;
        }
        @keyframes fa-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fa-in-0 { animation: fa-in 0.55s 0.05s cubic-bezier(.22,1,.36,1) both; }
        .fa-in-1 { animation: fa-in 0.55s 0.15s cubic-bezier(.22,1,.36,1) both; }
        .fa-in-2 { animation: fa-in 0.55s 0.25s cubic-bezier(.22,1,.36,1) both; }
        .fa-in-3 { animation: fa-in 0.55s 0.35s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .fa-in-0, .fa-in-1, .fa-in-2, .fa-in-3 { animation: none; opacity: 1; }
        }
        @media (max-width: 640px) {
          .fa-hero   { padding: 56px 18px 44px !important; }
          .fa-hero h1 { font-size: 2.6rem !important; }
        }
      `}</style>

      {/* Editorial hero */}
      <div className="fa-hero" style={{
        position: "relative",
        background: "#1C0E04",
        borderBottom: "1.5px solid rgba(196,122,46,0.12)",
        padding: "72px 24px 60px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        <div aria-hidden style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,122,46,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(204,171,74,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 620, margin: "0 auto" }}>
          <p className="fa-in-0" style={{
            fontSize: 10, fontWeight: 700, color: "#CCAB4A",
            letterSpacing: "0.28em", textTransform: "uppercase",
            margin: "0 0 20px",
          }}>Live Entertainment</p>

          <h1 className="fa-in-1" style={{
            fontFamily: FD, fontSize: "clamp(2.6rem,6vw,4.4rem)",
            fontWeight: 300, color: "#FFF8EC",
            margin: "0 0 20px", lineHeight: 1.08,
          }}>
            Fun <em style={{ color: "#C47A2E", fontStyle: "italic" }}>Activities</em>
          </h1>

          <p className="fa-in-2" style={{
            fontSize: 15, color: "rgba(255,248,236,0.62)",
            margin: "0 auto 36px", lineHeight: 1.72, maxWidth: 420,
          }}>
            Fixed-price entertainment add-ons for your event — confirmed within 2 hours across all NCR locations.
          </p>

          <div className="fa-in-3" style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            {TRUST.map(({ icon, label }) => (
              <span key={label} style={{
                fontSize: 12, fontWeight: 600, color: "rgba(255,248,236,0.55)",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ color: "#CCAB4A" }}>{icon}</span> {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Activities grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 64px" }}>
        <FunActivitiesSection grid={true} />
      </div>
    </div>
  );
}

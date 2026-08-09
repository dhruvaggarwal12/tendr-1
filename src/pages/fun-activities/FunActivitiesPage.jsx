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

      {/* Dot-grid hero */}
      <div className="fa-hero fa-dot-bg" style={{
        position: "relative",
        borderBottom: "1.5px solid rgba(196,122,46,0.12)",
        padding: "84px 24px 68px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        {/* Radial vignette so dots recede from centre */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 58% 68% at 50% 50%, rgba(255,252,245,0.94) 0%, rgba(255,252,245,0.55) 60%, transparent 100%)",
        }} />

        <div style={{ position: "relative", maxWidth: 620, margin: "0 auto" }}>
          <span className="fa-in-0" style={{
            display: "inline-block",
            fontSize: 10, fontWeight: 800, color: "#C47A2E",
            letterSpacing: "0.22em", textTransform: "uppercase",
            background: "rgba(196,122,46,0.08)",
            border: "1px solid rgba(196,122,46,0.22)",
            padding: "5px 14px", borderRadius: 100, marginBottom: 20,
          }}>Add Magic to Any Event</span>

          <h1 className="fa-in-1" style={{
            fontFamily: FD, fontSize: "clamp(2.8rem,6vw,4.8rem)",
            fontWeight: 300, color: "#2C1A0E",
            margin: "0 0 20px", lineHeight: 1.05,
          }}>
            Fun <em style={{ color: "#C47A2E", fontStyle: "italic" }}>Activities</em>
          </h1>

          <p className="fa-in-2" style={{
            fontSize: 15, color: "#7A5535",
            margin: "0 auto 32px", lineHeight: 1.65, maxWidth: 420,
          }}>
            Fixed-price entertainment add-ons for your event — confirmed within 2 hours across all NCR locations.
          </p>

          <div className="fa-in-3" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {TRUST.map(({ icon, label }) => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 600, color: "#7A4A1E",
                background: "rgba(255,252,245,0.82)",
                border: "1px solid rgba(196,122,46,0.22)",
                padding: "7px 14px", borderRadius: 100,
                backdropFilter: "blur(6px)",
              }}>
                <span style={{ color: "#C47A2E", fontWeight: 800 }}>{icon}</span> {label}
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

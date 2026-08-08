import React from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";

const F  = "'Outfit', sans-serif";
const FD = "'Cormorant Garamond', Georgia, serif";

const FEATURES = [
  { emoji: "🪢", title: "Curated Rakhi Sets",    desc: "Premium rakhis + personalised gifts in one beautiful handcrafted box." },
  { emoji: "🎁", title: "Hampers for Everyone",   desc: "Brother, sister, and family packs — pick what fits the moment." },
  { emoji: "🚚", title: "Delhi NCR Delivery",     desc: "Delivered fresh to your doorstep before Raksha Bandhan." },
  { emoji: "✨", title: "Personalised Touch",      desc: "Custom messages, photos, and handwritten notes — no extra cost." },
];

const RakhiGiftHub = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: F }}>
      <SEO
        title="Rakhi Hampers — Tendr"
        description="Curated Rakhi hampers for your loved ones — personalised and delivered across Delhi NCR. Coming soon on Tendr."
        path="/rakhi-hampers"
      />
      <HamburgerNav title="Rakhi Hampers" showBack />

      <style>{`
        @keyframes rh-orb {
          0%, 100% { opacity: 0.45; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 0.75; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes rh-badge-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes rh-card-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .rh-hero     { padding: 64px 20px 56px !important; }
          .rh-hero-h1  { font-size: 3rem !important; }
          .rh-features { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Dark hero ── */}
      <div className="rh-hero" style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, #1C0A04 0%, #3A1808 55%, #2C1A0E 100%)",
        padding: "96px 24px 80px",
        textAlign: "center",
      }}>
        {/* orb */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 540, height: 540, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(204,171,74,0.13) 0%, transparent 68%)",
          animation: "rh-orb 5.5s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* "Coming Soon" badge */}
        <div style={{ position: "relative", marginBottom: 28, animation: "rh-badge-float 3.5s ease-in-out infinite" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(204,171,74,0.1)",
            border: "1.5px solid rgba(204,171,74,0.3)",
            borderRadius: 100, padding: "7px 18px",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#CCAB4A", display: "inline-block", boxShadow: "0 0 6px rgba(204,171,74,0.7)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Raksha Bandhan Special
            </span>
          </span>
        </div>

        {/* headline */}
        <h1 className="rh-hero-h1" style={{
          position: "relative",
          fontFamily: FD, fontSize: "clamp(3.2rem,7vw,5rem)",
          fontWeight: 300, color: "#FAF7F2",
          margin: "0 0 10px", lineHeight: 1.06,
        }}>
          Rakhi Hampers
        </h1>
        <p style={{
          position: "relative",
          fontFamily: FD, fontSize: "clamp(1.1rem,3vw,1.5rem)",
          color: "rgba(255,255,255,0.45)", fontStyle: "italic",
          margin: "0 0 24px",
        }}>For the ones who matter most</p>

        <p style={{
          position: "relative",
          fontSize: 15, color: "rgba(255,255,255,0.58)",
          lineHeight: 1.75, margin: "0 auto 40px", maxWidth: 420,
        }}>
          We're curating premium Rakhi hampers — personalised, beautiful, and delivered across Delhi NCR before Raksha Bandhan.
        </p>

        {/* CTAs */}
        <div style={{ position: "relative", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/gift-hampers-cakes")}
            style={{
              background: "linear-gradient(135deg,#C47A2E,#CCAB4A)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              padding: "14px 28px", borderRadius: 12, border: "none",
              cursor: "pointer", fontFamily: F,
              boxShadow: "0 4px 20px rgba(196,122,46,0.4)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Browse Gift Hampers →
          </button>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600,
              padding: "14px 28px", borderRadius: 12,
              border: "1.5px solid rgba(255,255,255,0.18)",
              cursor: "pointer", fontFamily: F, transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* ── What's Coming ── */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{
            fontSize: 11, fontWeight: 800, color: "#C47A2E",
            letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 12px",
          }}>What's Coming</p>
          <h2 style={{
            fontFamily: FD, fontSize: "clamp(2rem,5vw,3rem)",
            fontWeight: 300, color: "#2C1A0E",
            margin: 0, lineHeight: 1.15,
          }}>
            Built for{" "}
            <em style={{ fontStyle: "italic", color: "#C47A2E" }}>Raksha Bandhan</em>
          </h2>
        </div>

        <div className="rh-features" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{
              background: "#FFFCF5",
              border: "1.5px solid rgba(196,122,46,0.12)",
              borderRadius: 18,
              padding: "24px 22px",
              boxShadow: "0 2px 14px rgba(44,26,14,0.05)",
              display: "flex", gap: 16, alignItems: "flex-start",
              animation: `rh-card-in 0.5s ease both`,
              animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: "linear-gradient(135deg,rgba(196,122,46,0.12),rgba(204,171,74,0.08))",
                border: "1.5px solid rgba(196,122,46,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>{f.emoji}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Notify CTA */}
        <div style={{
          marginTop: 48,
          background: "linear-gradient(135deg, #2C1A0E 0%, #3A1808 100%)",
          borderRadius: 20, padding: "32px 28px", textAlign: "center",
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>🔔</div>
          <h3 style={{
            fontFamily: FD, fontSize: "1.6rem", fontWeight: 300,
            color: "#FAF7F2", margin: "0 0 10px",
          }}>Be the first to know</h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "0 0 20px", lineHeight: 1.6 }}>
            Rakhi Hampers launch before Raksha Bandhan. Meanwhile, explore our full gift hamper range.
          </p>
          <button
            onClick={() => navigate("/gift-hampers-cakes")}
            style={{
              background: "linear-gradient(135deg,#C47A2E,#CCAB4A)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              padding: "13px 28px", borderRadius: 12, border: "none",
              cursor: "pointer", fontFamily: F,
              boxShadow: "0 4px 16px rgba(196,122,46,0.35)",
            }}
          >Browse Gift Hampers →</button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RakhiGiftHub;

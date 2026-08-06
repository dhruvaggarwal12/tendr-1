import React from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";

const font = "'Outfit', sans-serif";

const RakhiGiftHub = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title="Rakhi Hampers — Tendr"
        description="Curated Rakhi hampers for your loved ones. Coming soon on Tendr."
        path="/rakhi-hampers"
      />
      <HamburgerNav title="Rakhi Hampers" showBack />

      <div style={{
        background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 55%,#3A200C 100%)",
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-10, left:"4%", fontSize:140, opacity:0.05, transform:"rotate(-15deg)", userSelect:"none", pointerEvents:"none" }}>🪢</div>
        <div style={{ position:"absolute", bottom:-10, right:"4%", fontSize:120, opacity:0.05, transform:"rotate(12deg)", userSelect:"none", pointerEvents:"none" }}>🎁</div>

        <div style={{ position: "relative", maxWidth: 520 }}>
          <div style={{ fontSize: 64, marginBottom: 20, lineHeight: 1 }}>🪢</div>

          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#CCAB4A", marginBottom: 16 }}>
            Raksha Bandhan Special
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.2rem,5vw,3.2rem)", fontWeight: 300, color: "#fff", margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            Rakhi Hampers
          </h1>

          <div style={{ display: "inline-block", background: "rgba(204,171,74,0.15)", border: "1.5px solid rgba(204,171,74,0.35)", borderRadius: 100, padding: "8px 24px", marginBottom: 24 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#CCAB4A", letterSpacing: "0.08em" }}>Coming Soon</span>
          </div>

          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, margin: "0 0 36px" }}>
            We're curating the perfect Rakhi hampers for your loved ones — personalised, beautiful, and delivered across Delhi NCR.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/")}
              style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, padding: "13px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: font }}
            >
              ← Back to Home
            </button>
            <button
              onClick={() => navigate("/gift-hampers-cakes")}
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600, padding: "13px 28px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer", fontFamily: font }}
            >
              Browse Gift Hampers →
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RakhiGiftHub;

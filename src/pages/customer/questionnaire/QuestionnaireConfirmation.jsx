import React from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../../components/HamburgerNav";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const GOLD_LIGHT = "#CCAB4A";
const BG = "#F8F4EF";

export default function QuestionnaireConfirmation() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: font }}>
      <HamburgerNav title="Submitted" showBack />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", marginBottom: 10 }}>Thank you for your answers</div>
        <div style={{ fontSize: 14, color: "#5A3A1A", lineHeight: 1.6, marginBottom: 28 }}>
          Your responses have been submitted. We use them to understand what customers really need, so Tendr's
          pricing and recommendations keep getting better.
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "13px 28px", borderRadius: 14, border: "none",
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#fff",
            fontSize: 14, fontWeight: 800, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 16px rgba(196,122,46,0.35)",
          }}
        >
          Back to home
        </button>
      </div>
    </div>
  );
}

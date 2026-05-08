import React from "react";
import { useNavigate } from "react-router-dom";
import tendrLogo from "../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";

export default function ToolNav({ title }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,252,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(139,69,19,0.1)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)", fontFamily: font }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src={tendrLogo} alt="Tendr" onClick={() => navigate("/")} style={{ height: 36, width: "auto", cursor: "pointer" }} />
        {title && <span style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E" }}>{title}</span>}
        <button onClick={() => navigate("/")} style={{ fontSize: 13, fontWeight: 600, color: "#6B3A1F", background: "rgba(139,69,19,0.06)", border: "1px solid rgba(139,69,19,0.18)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontFamily: font }}>
          ← Home
        </button>
      </div>
    </div>
  );
}

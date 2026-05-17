import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTypeById } from "../data/stationeryTypes";
import { PALETTES } from "../data/palettes";
import { FONT_PAIRINGS } from "../data/fonts";
import CardPreview from "./CardPreview";
import CustomiserPanel from "./CustomiserPanel";
import PricingEngine from "./PricingEngine";

const DEFAULT_DESIGN = {
  palette: PALETTES[0],
  fontPairing: FONT_PAIRINGS[0],
  fields: { coupleNames: "", date: "", time: "", venue: "", customMessage: "", rsvp: "" },
  showFloral: true,
  showMonogram: true,
  dividerStyle: "ornate",
};

export default function TemplateDesigner() {
  const { type } = useParams();
  const navigate = useNavigate();
  const stationery = getTypeById(type);

  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [quantity, setQuantity] = useState(50);

  useEffect(() => {
    // Load Google Fonts for selected pairing
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = design.fontPairing.googleUrl;
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, [design.fontPairing.id]);

  if (!stationery) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF7F2" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#9B8C78", fontFamily: "'Lato', sans-serif" }}>Stationery type not found.</p>
        <button onClick={() => navigate("/wedding")} style={{ marginTop: 12, color: "#C9A84C", background: "none", border: "none", cursor: "pointer", fontFamily: "'Lato', sans-serif" }}>← Back to Picker</button>
      </div>
    </div>
  );

  const handleProceed = () => {
    sessionStorage.setItem("ws_design", JSON.stringify({ design, quantity, stationery: { id: stationery.id, name: stationery.name, basePrice: stationery.basePrice } }));
    navigate("/wedding/order");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #EDE6D8", padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => navigate("/wedding")}
          style={{ fontSize: 13, color: "#9B8C78", background: "none", border: "none", cursor: "pointer", fontFamily: "'Lato', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
          ← Back
        </button>
        <div style={{ width: 1, height: 20, background: "#EDE6D8" }} />
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, color: "#1C1C1C", margin: 0 }}>
            {stationery.name}
          </h2>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={handleProceed}
            style={{
              padding: "10px 28px", background: "#1C1C1C", color: "#FAF7F2", border: "none",
              borderRadius: 4, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "'Lato', sans-serif", fontWeight: 600,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#C9A84C")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1C1C1C")}
          >
            Proceed to Order →
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 280px", flex: 1, gap: 0, maxHeight: "calc(100vh - 61px)", overflow: "hidden" }}>

        {/* LEFT — Customiser */}
        <div style={{ background: "#fff", borderRight: "1px solid #EDE6D8", overflowY: "auto" }}>
          <CustomiserPanel design={design} onChange={setDesign} stationery={stationery} />
        </div>

        {/* CENTER — Preview */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", overflowY: "auto", background: "linear-gradient(135deg, #F5F0E8 0%, #EDE5D5 100%)" }}>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9B8C78", marginBottom: 24 }}>
            Live Preview — {stationery.dimensions.label}
          </p>
          <div style={{ position: "relative" }}>
            <CardPreview design={design} stationery={stationery} />
          </div>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: "#B8A898", marginTop: 20, textAlign: "center" }}>
            Actual print may vary slightly · Colours are representative
          </p>
        </div>

        {/* RIGHT — Pricing */}
        <div style={{ borderLeft: "1px solid #EDE6D8", background: "#FDFAF6", padding: "24px 16px", overflowY: "auto" }}>
          <PricingEngine stationery={stationery} quantity={quantity} onQuantityChange={setQuantity} />

          <div style={{ marginTop: 16, padding: "14px", background: "#fff", borderRadius: 8, border: "1px solid #EDE6D8" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: "#1C1C1C", margin: "0 0 8px" }}>
              What's included
            </p>
            {["Premium 350gsm card stock", "Professional offset printing", "Individually packaged", "Quality checked before dispatch"].map(item => (
              <p key={item} style={{ fontSize: 12, color: "#6B5E52", margin: "4px 0", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#C9A84C" }}>✓</span> {item}
              </p>
            ))}
          </div>

          <button onClick={handleProceed}
            style={{
              width: "100%", marginTop: 16, padding: "13px", background: "#1C1C1C", color: "#FAF7F2",
              border: "none", borderRadius: 4, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "'Lato', sans-serif", fontWeight: 600, transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#C9A84C")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1C1C1C")}
          >
            Proceed to Order →
          </button>
        </div>
      </div>
    </div>
  );
}

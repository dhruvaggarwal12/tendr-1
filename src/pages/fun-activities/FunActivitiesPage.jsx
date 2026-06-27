import React from "react";
import HamburgerNav from "../../components/HamburgerNav";
import FunActivitiesSection from "../../components/FunActivitiesSection";

const F = "'Outfit', sans-serif";

export default function FunActivitiesPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#F8F4EF", fontFamily:F }}>
      <HamburgerNav />

      {/* Hero */}
      <style>{`
        @media(max-width:640px){.fun-hero{padding:24px 18px 22px!important}.fun-hero h1{font-size:1.6rem!important}.fun-hero p.sub{font-size:14px!important;margin-bottom:14px!important}}
        @media(max-width:480px){.fun-hero{padding:18px 16px 18px!important}.fun-hero h1{font-size:1.35rem!important}}
      `}</style>
      <div className="fun-hero" style={{ background:"linear-gradient(135deg,#FEF0D8 0%,#FDE8C0 100%)", padding:"40px 24px 32px", textAlign:"center", position:"relative", overflow:"hidden", borderBottom:"2px solid rgba(196,122,46,0.15)" }}>
        {/* Ghost decorations */}
        <div style={{ position:"absolute", top:-10, left:"4%", fontSize:90, opacity:0.13, transform:"rotate(-15deg)", userSelect:"none", pointerEvents:"none" }}>🎭</div>
        <div style={{ position:"absolute", top:10, right:"6%", fontSize:70, opacity:0.14, transform:"rotate(10deg)", userSelect:"none", pointerEvents:"none" }}>🎯</div>
        <div style={{ position:"absolute", bottom:-8, left:"18%", fontSize:60, opacity:0.12, transform:"rotate(-8deg)", userSelect:"none", pointerEvents:"none" }}>🎩</div>

        <div style={{ position:"relative", maxWidth:580, margin:"0 auto" }}>
          <p style={{ fontSize:10, fontWeight:800, color:"#8B4A0E", textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 8px", fontFamily:F }}>
            Add Magic to Any Event
          </p>
          <h1 className="page-main-h1" style={{ fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:900, color:"#2C1A0E", margin:"0 0 10px", letterSpacing:"-0.02em", lineHeight:1.15, fontFamily:F }}>
            Fun Activities
          </h1>
          <p className="sub" style={{ fontSize:15, color:"#6B3A10", margin:"0 0 20px", lineHeight:1.55, fontFamily:F }}>
            Fixed-price entertainment add-ons for your event. Confirmed within 2 hours.
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
            {["Fixed pricing", "Confirmed in 2 hrs", "All NCR locations"].map(pt => (
              <span key={pt} style={{ fontSize:11, fontWeight:700, color:"#7A3A0E", background:"rgba(139,74,14,0.12)", border:"1px solid rgba(139,74,14,0.22)", padding:"5px 12px", borderRadius:100, fontFamily:F }}>✓ {pt}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Activities grid */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 20px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
        <FunActivitiesSection grid={true} />
      </div>
    </div>
  );
}

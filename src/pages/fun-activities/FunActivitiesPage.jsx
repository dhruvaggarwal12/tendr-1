import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import FunActivitiesSection from "../../components/FunActivitiesSection";

const F = "'Outfit', sans-serif";
const PURPLE = "#7C3AED";
const BROWN  = "#2C1A0E";
const GOLD   = "#C47A2E";

export default function FunActivitiesPage() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  useEffect(() => { if (!user?.isAdmin) navigate("/"); }, [user, navigate]);
  if (!user?.isAdmin) return null;

  return (
    <div style={{ minHeight:"100vh", background:"#0F0A1A", fontFamily:F }}>
      <HamburgerNav />

      {/* Admin strip */}
      <div style={{ background:"rgba(124,58,237,0.18)", borderBottom:"1px solid rgba(124,58,237,0.25)", padding:"8px 20px", textAlign:"center" }}>
        <span style={{ fontSize:12, color:"#C4B5FD", fontWeight:700, fontFamily:F }}>
          🔒 Admin Preview — Fun Activities · Not visible to users yet
        </span>
      </div>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${PURPLE},#9333EA,#7C3AED)`, padding:"52px 24px 44px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)" }} />
        <div style={{ position:"relative", maxWidth:640, margin:"0 auto" }}>
          <p style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 12px", fontFamily:F }}>
            🎭 Add Magic to Any Event
          </p>
          <h1 style={{ fontSize:"clamp(2rem,5vw,3rem)", fontWeight:900, color:"#fff", margin:"0 0 14px", letterSpacing:"-0.02em", lineHeight:1.15, fontFamily:F }}>
            Fun Activities
          </h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.7)", margin:"0 0 28px", lineHeight:1.65, fontFamily:F }}>
            Fixed-price entertainment add-ons for your event. From magic shows to live bands — every activity is confirmed within 2 hours.
          </p>
          {/* Key selling points */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
            {["✓ Fixed pricing — no negotiations", "✓ Confirmed in 2 hrs", "✓ All NCR locations"].map(pt => (
              <span key={pt} style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.85)", background:"rgba(255,255,255,0.12)", padding:"6px 14px", borderRadius:100, fontFamily:F }}>{pt}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Activities grid */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 20px 80px", background:"transparent" }}>
        <FunActivitiesSection grid={true} />
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import LaunchSequence from "../components/LaunchSequence";

export default function LaunchLivePage() {
  const [started, setStarted] = useState(false);

  // Request fullscreen + landscape on mount
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    if (screen.orientation?.lock) screen.orientation.lock("landscape").catch(() => {});
    return () => { document.exitFullscreen?.().catch?.(() => {}); };
  }, []);

  if (started) {
    return (
      <LaunchSequence
        onComplete={() => { try { window.close(); } catch {} }}
      />
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#0d0d0d",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 900, color: "#CCAB4A", marginBottom: 12, letterSpacing: "-0.02em" }}>
        tendr
      </div>
      <div style={{ fontSize: "clamp(11px, 2vw, 14px)", color: "#666", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 56 }}>
        ready to launch
      </div>
      <button
        onClick={() => setStarted(true)}
        style={{
          padding: "clamp(18px,4vw,28px) clamp(48px,10vw,100px)",
          borderRadius: 20,
          border: "none",
          background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
          color: "#fff",
          fontSize: "clamp(20px, 4vw, 36px)",
          fontWeight: 900,
          cursor: "pointer",
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: "-0.01em",
          boxShadow: "0 8px 60px rgba(196,122,46,0.5)",
          animation: "pulse-glow 2s ease-in-out infinite",
        }}
      >
        🚀 Start
      </button>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 8px 40px rgba(196,122,46,0.4); transform: scale(1); }
          50%       { box-shadow: 0 8px 80px rgba(196,122,46,0.8); transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}

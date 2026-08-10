import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";

const font = "'Outfit', sans-serif";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const RakhiGiftHub = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [previewIdx, setPreviewIdx] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/admin/gift-hamper-samples?type=rakhi`)
      .then(r => r.json())
      .then(d => { setSamples(d.samples || []); setSamplesLoading(false); })
      .catch(() => setSamplesLoading(false));
  }, []);

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

      {/* Rakhi Hamper Gallery */}
      {(samplesLoading || samples.length > 0) && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "56px 20px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C47A2E", margin: "0 0 10px" }}>Sample Collection</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 300, color: "#1C0A04", margin: "0 0 10px" }}>
              Rakhi Hampers
            </h2>
            <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Browse our curated Rakhi hamper collection — personalised notes, premium packaging, delivered across Delhi NCR.</p>
          </div>

          {samplesLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: "#f5ede0" }}>
                  <div style={{ height: 220, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                  <div style={{ padding: 14 }}>
                    <div style={{ height: 12, width: "70%", background: "#f0ebe3", borderRadius: 6, marginBottom: 8 }} />
                    <div style={{ height: 10, width: "45%", background: "#f0ebe3", borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {samples.map((s, i) => (
                <div
                  key={s._id}
                  onClick={() => setPreviewIdx(i)}
                  style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1.5px solid rgba(196,122,46,0.12)", boxShadow: "0 2px 10px rgba(44,26,14,0.06)", cursor: "pointer", transition: "all 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(44,26,14,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(44,26,14,0.06)"; }}
                >
                  <div style={{ height: 220, overflow: "hidden", background: "#f5ede0" }}>
                    <img src={s.url} alt={s.name || "Rakhi Hamper"} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    />
                  </div>
                  <div style={{ padding: "12px 14px 14px" }}>
                    {s.name && <div style={{ fontSize: 13, fontWeight: 700, color: "#1C0A04", marginBottom: 4 }}>{s.name}</div>}
                    {s.priceRange && <div style={{ fontSize: 12, fontWeight: 600, color: "#C47A2E" }}>{s.priceRange}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full-screen preview */}
      {previewIdx !== null && samples[previewIdx] && (
        <div
          onClick={() => setPreviewIdx(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 560, width: "100%", background: "#fff", borderRadius: 20, overflow: "hidden", position: "relative" }}>
            <img src={samples[previewIdx].url} alt={samples[previewIdx].name || "Rakhi Hamper"} style={{ width: "100%", maxHeight: 420, objectFit: "cover", display: "block" }} />
            <div style={{ padding: "16px 20px 20px" }}>
              {samples[previewIdx].name && <div style={{ fontSize: 16, fontWeight: 700, color: "#1C0A04", marginBottom: 4 }}>{samples[previewIdx].name}</div>}
              {samples[previewIdx].priceRange && <div style={{ fontSize: 14, color: "#C47A2E", fontWeight: 600 }}>{samples[previewIdx].priceRange}</div>}
            </div>
            <button onClick={() => setPreviewIdx(null)} style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(28,10,4,0.6)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            {previewIdx > 0 && <button onClick={() => setPreviewIdx(p => p - 1)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(28,10,4,0.5)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>}
            {previewIdx < samples.length - 1 && <button onClick={() => setPreviewIdx(p => p + 1)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(28,10,4,0.5)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>}
          </div>
        </div>
      )}

      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>

      <Footer />
    </div>
  );
};

export default RakhiGiftHub;

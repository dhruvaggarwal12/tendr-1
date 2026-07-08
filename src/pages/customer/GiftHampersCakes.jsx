import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const GiftHampersCakes = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/admin/gift-hamper-samples`)
      .then(r => r.json())
      .then(d => { setSamples(d.samples || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const downloadPhoto = async (url, name) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${name || "gift-hamper"}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title="Gift Hampers — Tendr"
        description="Curated gift hampers for every celebration. Browse samples and talk to our team for custom orders."
        path="/gift-hampers-cakes"
      />
      <HamburgerNav title="Gift Hampers" showBack />

      {/* ── Header ── */}
      <style>{`
        @media(max-width:640px){
          .gh-hero{padding:36px 18px 32px!important}
          .gh-hero h1{font-size:clamp(1.6rem,6vw,2rem)!important}
          .gh-cta-btn{width:100%!important}
        }
      `}</style>
      <div className="gh-hero" style={{
        background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 55%,#3A200C 100%)",
        padding: "56px 24px 52px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ghost decorations */}
        <div style={{ position:"absolute", top:-10, left:"4%", fontSize:110, opacity:0.07, transform:"rotate(-15deg)", userSelect:"none", pointerEvents:"none" }}>🎁</div>
        <div style={{ position:"absolute", bottom:-8, right:"5%", fontSize:90, opacity:0.07, transform:"rotate(10deg)", userSelect:"none", pointerEvents:"none" }}>🎀</div>

        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#CCAB4A", display: "block", marginBottom: 14 }}>
            Curated for every occasion
          </span>
          <h1 className="gh-hero" style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: "#fff", margin: "0 0 14px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Gift Hampers &amp; Cakes
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", margin: "0 0 32px", lineHeight: 1.7, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Tell us your occasion, budget and preferences — our team will put together the perfect hamper or cake and handle delivery across Delhi NCR.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="gh-cta-btn"
              onClick={() => {
                try { sessionStorage.setItem("baat_karo_draft", "Hi! I'm looking for a custom gift hamper. Can you help me with options, pricing and delivery?"); } catch {}
                navigate("/baat-karo");
              }}
              style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, padding: "13px 32px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: font, boxShadow: "0 6px 24px rgba(196,122,46,0.45)", letterSpacing: "0.01em" }}
            >
              💬 Talk to Our Team
            </button>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>Replies within 2 hours · Custom orders welcome</p>
        </div>
      </div>

      {/* ── Sample Photos ── */}
      <div style={{ background: "#FFFCF5", padding: "52px 24px calc(60px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px" }}>For reference</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 6px" }}>Sample Gift Hamper Photos</h2>
            <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Download any image to share with our team as a reference</p>
            <div style={{ width: 40, height: 2, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "14px auto 0" }} />
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ borderRadius: 14, aspectRatio: "4/3", background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "ghShimmer 1.4s infinite" }} />
              ))}
              <style>{`@keyframes ghShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            </div>
          ) : samples.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "#9B7450" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
              <p style={{ fontSize: 14, margin: 0 }}>Sample photos coming soon. Talk to our team for options.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
              {samples.map(s => (
                <div key={s._id} style={{ borderRadius: 14, overflow: "hidden", background: "#fff", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 14px rgba(44,26,14,0.07)", display: "flex", flexDirection: "column" }}>
                  <img src={s.url} alt={s.name || "Gift Hamper"} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    {s.name && <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", lineHeight: 1.3 }}>{s.name}</div>}
                    {s.vendorName && <div style={{ fontSize: 11, color: "#9B7450" }}>by {s.vendorName}</div>}
                    <button
                      onClick={() => downloadPhoto(s.url, s.name)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font, marginTop: "auto", width: "fit-content" }}
                    >
                      ⬇ Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GiftHampersCakes;

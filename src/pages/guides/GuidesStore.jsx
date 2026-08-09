import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import { GUIDES } from "./guideData";

const font = "'Outfit', sans-serif";

// Warm espresso palette — resembles Tendr but deeper/richer
const STORE = {
  bg: "#1C0E06",
  surface: "#281508",
  card: "#341A0A",
  border: "rgba(196,122,46,0.18)",
  accent: "#C47A2E",
  accentSoft: "rgba(196,122,46,0.12)",
  text: "#F0DFC4",
  muted: "#9B7A50",
  heading: "#FFFBF5",
};

export default function GuidesStore() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight: "100vh", background: STORE.bg, fontFamily: font }}>
      <HamburgerNav title="Event Planning Guides" />

      <style>{`
        @keyframes gs-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gs-card { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, color: "#C47A2E", letterSpacing: "0.2em", textTransform: "uppercase", background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.25)", padding: "4px 14px", borderRadius: 100, marginBottom: 14 }}>
            Knowledge Base
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 300, color: STORE.heading, lineHeight: 1.15, margin: "0 0 10px" }}>
            Event Planning <em style={{ color: "#CCAB4A", fontStyle: "italic" }}>Guides</em>
          </h1>
          <p style={{ fontSize: 13, color: STORE.muted, maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>
            Practical, no-fluff guides for budgeting, decorating, and planning any event.
          </p>
        </div>

        {/* Guide cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: 16 }}>
          {GUIDES.map((guide, idx) => (
            <GuideCard key={guide.slug} guide={guide} index={idx} mounted={mounted} onOpen={() => navigate(`/guides/${guide.slug}`)} />
          ))}
        </div>

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 56, padding: "22px 24px", borderRadius: 16, border: `1px solid ${STORE.border}`, background: STORE.accentSoft }}>
          <p style={{ fontSize: 13, color: STORE.muted, margin: 0 }}>
            More guides coming soon — Corporate Event ROI Calculator, Vendor Negotiation Playbook, Wedding Timeline Template.
          </p>
        </div>
      </div>
    </div>
  );
}

function GuideCard({ guide, onOpen, index, mounted }) {
  const { theme } = guide;
  return (
    <div
      onClick={onOpen}
      className="gs-card"
      style={{
        background: STORE.card,
        border: `1px solid ${STORE.border}`,
        borderRadius: 20,
        padding: "26px 22px 22px",
        cursor: "pointer",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        position: "relative",
        overflow: "hidden",
        animation: mounted ? `gs-in 0.5s ${index * 0.07}s cubic-bezier(.22,1,.36,1) both` : "none",
        opacity: mounted ? undefined : 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = `${theme.accent}60`;
        e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.35)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = STORE.border;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Topic-colored stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: theme.accent }} />

      {/* Topic tag */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: theme.accent, background: `${theme.accent}18`, border: `1px solid ${theme.accent}30`, padding: "3px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {guide.tags[0]}
        </span>
      </div>

      <h3 style={{ fontSize: 17.5, fontWeight: 800, color: STORE.heading, margin: "0 0 7px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
        {guide.title}
      </h3>
      <p style={{ fontSize: 13, color: STORE.muted, margin: "0 0 18px", lineHeight: 1.6 }}>
        {guide.subtitle}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 11.5, color: "#6A5040" }}>{guide.readTime}</span>
          <span style={{ fontSize: 11.5, color: "#6A5040" }}>{guide.pages}pp</span>
        </div>
        <button style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: theme.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
          Preview →
        </button>
      </div>
    </div>
  );
}

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

  return (
    <div style={{ minHeight: "100vh", background: STORE.bg, fontFamily: font }}>
      <HamburgerNav title="Event Planning Guides" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: STORE.accentSoft, border: `1px solid ${STORE.border}`, borderRadius: 100, padding: "6px 18px", marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: STORE.accent, textTransform: "uppercase", letterSpacing: "0.12em" }}>Tips by Tendr · Free Resource Library</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900, color: STORE.heading, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px" }}>
            Event Planning Guides
          </h1>
          <p style={{ fontSize: 16.5, color: STORE.muted, maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>
            Practical, no-fluff guides for budgeting, decorating, and planning any event. Free to unlock with a WhatsApp number.
          </p>
        </div>

        {/* Guide cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 20 }}>
          {GUIDES.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} onOpen={() => navigate(`/guides/${guide.slug}`)} />
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

function GuideCard({ guide, onOpen }) {
  const { theme } = guide;
  return (
    <div
      onClick={onOpen}
      style={{
        background: STORE.card,
        border: `1px solid ${STORE.border}`,
        borderRadius: 20,
        padding: "26px 22px 22px",
        cursor: "pointer",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        position: "relative",
        overflow: "hidden",
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

      <div style={{ fontSize: 34, marginBottom: 14, lineHeight: 1 }}>{guide.coverEmoji}</div>

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
          <span style={{ fontSize: 11.5, color: "#6A5040" }}>📖 {guide.readTime}</span>
          <span style={{ fontSize: 11.5, color: "#6A5040" }}>📄 {guide.pages}pp</span>
        </div>
        <button style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: theme.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
          Preview →
        </button>
      </div>
    </div>
  );
}

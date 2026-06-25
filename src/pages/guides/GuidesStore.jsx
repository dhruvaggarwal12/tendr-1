import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GUIDES } from "./guideData";

const font = "'Outfit', sans-serif";

export default function GuidesStore() {
  const { user, token } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const isAdmin = user?.isAdmin === true || (() => {
    try {
      const payload = JSON.parse(atob(token?.split(".")[1] || ""));
      return payload.isAdmin === true;
    } catch { return false; }
  })();

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Admin Preview Only</div>
          <div style={{ fontSize: 14, color: "#7A8BA8", marginTop: 8 }}>This section is not yet public.</div>
          <button onClick={() => navigate("/")} style={{ marginTop: 24, padding: "10px 24px", borderRadius: 10, border: "none", background: "#4F8EF7", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", fontFamily: font }}>
      {/* Admin badge */}
      <div style={{ background: "rgba(79,142,247,0.12)", borderBottom: "1px solid rgba(79,142,247,0.2)", padding: "8px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#4F8EF7", textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin Preview</span>
        <span style={{ fontSize: 11, color: "#7A8BA8" }}>— This store is not yet visible to customers</span>
        <button onClick={() => navigate(-1)} style={{ marginLeft: "auto", background: "none", border: "1px solid rgba(79,142,247,0.3)", color: "#4F8EF7", fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 6, cursor: "pointer", fontFamily: font }}>
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4F8EF7", textTransform: "uppercase", letterSpacing: "0.12em" }}>Free Resource Library</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px" }}>
            Event Planning Guides
          </h1>
          <p style={{ fontSize: 17, color: "#7A8BA8", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            Practical, no-fluff guides for planning events of every size and type. Free to unlock — just share your WhatsApp.
          </p>
        </div>

        {/* Guide cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {GUIDES.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} onOpen={() => navigate(`/guides/${guide.slug}`)} />
          ))}
        </div>

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 60, padding: "24px", borderRadius: 16, border: "1px solid rgba(79,142,247,0.15)", background: "rgba(79,142,247,0.04)" }}>
          <p style={{ fontSize: 13, color: "#7A8BA8", margin: 0 }}>
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
        background: "#0F1629",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        padding: "28px 24px 24px",
        cursor: "pointer",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(79,142,247,0.35)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Color accent stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: theme.accent, opacity: 0.8 }} />

      {/* Emoji icon */}
      <div style={{ fontSize: 36, marginBottom: 16, lineHeight: 1 }}>{guide.coverEmoji}</div>

      {/* Tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {guide.tags.map((t) => (
          <span key={t} style={{ fontSize: 10, fontWeight: 700, color: theme.accent, background: theme.accentSoft.replace("0.12", "0.15"), border: `1px solid ${theme.accentSoft}`, padding: "3px 9px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {t}
          </span>
        ))}
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", margin: "0 0 8px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
        {guide.title}
      </h3>
      <p style={{ fontSize: 13, color: "#7A8BA8", margin: "0 0 20px", lineHeight: 1.6 }}>
        {guide.subtitle}
      </p>

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ fontSize: 12, color: "#4A5E7A" }}>📖 {guide.readTime}</span>
          <span style={{ fontSize: 12, color: "#4A5E7A" }}>📄 {guide.pages} pages</span>
        </div>
        <button
          style={{ padding: "7px 18px", borderRadius: 9, border: "none", background: theme.accent, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
        >
          Preview →
        </button>
      </div>
    </div>
  );
}

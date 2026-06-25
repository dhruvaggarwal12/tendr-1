import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GUIDES } from "./guideData";

const font = "'Outfit', sans-serif";

export default function GuidePreview() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const guide = GUIDES.find((g) => g.slug === slug);

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!guide) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Guide not found</div>
          <button onClick={() => navigate("/guides")} style={{ marginTop: 20, padding: "9px 22px", borderRadius: 9, border: "none", background: "#4F8EF7", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Browse All Guides
          </button>
        </div>
      </div>
    );
  }

  const { theme } = guide;
  const isDark = false; // all themes are now light-toned

  const handleUnlock = (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid 10-digit WhatsApp number.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.open(`/guides/${slug}/read`, "_blank");
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: font }}>
      {/* Back bar */}
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`, display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => navigate("/guides")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: theme.accent, fontFamily: font, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← All Guides
        </button>
        <span style={{ fontSize: 12, color: isDark ? "#4A5E7A" : "#9B9B9B" }}>/</span>
        <span style={{ fontSize: 13, color: isDark ? "#7A8BA8" : "#666", fontWeight: 500 }}>{guide.title}</span>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Tags */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 20 }}>
          {guide.tags.map((t) => (
            <span key={t} style={{ fontSize: 11, fontWeight: 700, color: theme.tagText, background: theme.tag, padding: "4px 11px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {t}
            </span>
          ))}
        </div>

        {/* Title block */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 42, marginBottom: 12, lineHeight: 1 }}>{guide.coverEmoji}</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: isDark ? "#FFFFFF" : theme.heading, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 14px" }}>
            {guide.title}
          </h1>
          <p style={{ fontSize: 17, color: isDark ? "#7A8BA8" : theme.muted, lineHeight: 1.65, margin: 0 }}>
            {guide.description}
          </p>
          <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
            <span style={{ fontSize: 13, color: isDark ? "#4A5E7A" : theme.muted }}>📖 {guide.readTime}</span>
            <span style={{ fontSize: 13, color: isDark ? "#4A5E7A" : theme.muted }}>📄 {guide.pages} pages</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>Free</span>
          </div>
        </div>

        {/* Hook */}
        <div style={{ background: isDark ? "rgba(79,142,247,0.07)" : theme.accentSoft, border: `1.5px solid ${isDark ? "rgba(79,142,247,0.18)" : theme.accent + "30"}`, borderRadius: 16, padding: "20px 22px", marginBottom: 32, borderLeft: `4px solid ${theme.accent}` }}>
          <p style={{ fontSize: 15.5, fontStyle: "italic", lineHeight: 1.7, color: isDark ? "#C8D8F0" : theme.text, margin: 0, fontWeight: 500 }}>
            "{guide.teaser.hook}"
          </p>
        </div>

        {/* Preview sections */}
        {guide.teaser.preview_sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: isDark ? "#FFFFFF" : theme.heading, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
              {section.heading}
            </h2>
            <p style={{ fontSize: 15, color: isDark ? "#A8B8D0" : theme.text, lineHeight: 1.75, margin: 0 }}>
              {section.content}
            </p>
          </div>
        ))}

        {/* Fade + tease */}
        <div style={{ position: "relative", marginBottom: 0 }}>
          {/* Tease line */}
          <div style={{ background: isDark ? "#0F1629" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`, borderRadius: 12, padding: "16px 20px", marginBottom: 0 }}>
            <p style={{ fontSize: 14, color: isDark ? "#7A8BA8" : theme.muted, margin: 0, lineHeight: 1.65, fontStyle: "italic" }}>
              {guide.teaser.tease_line}
            </p>
          </div>

          {/* Blur fade overlay */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
            background: `linear-gradient(to bottom, transparent, ${theme.bg})`,
            pointerEvents: "none",
          }} />
        </div>

        {/* Gate card */}
        <div style={{
          background: isDark ? "#0F1629" : "#FFFFFF",
          border: `1.5px solid ${isDark ? "rgba(79,142,247,0.2)" : theme.accent + "35"}`,
          borderRadius: 20,
          padding: "32px 28px",
          marginTop: 24,
          boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 12px 40px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>📲</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: isDark ? "#FFFFFF" : theme.heading, margin: "0 0 8px" }}>
            Read the Full Guide Free
          </h3>
          <p style={{ fontSize: 14, color: isDark ? "#7A8BA8" : theme.muted, margin: "0 0 24px", lineHeight: 1.6 }}>
            Enter your WhatsApp number to unlock — the guide opens instantly in a new tab.
          </p>

          <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 380, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", background: isDark ? "#070B14" : "#F8F8F8", border: `1.5px solid ${error ? "#EF4444" : isDark ? "rgba(79,142,247,0.2)" : "rgba(0,0,0,0.1)"}`, borderRadius: 12, overflow: "hidden" }}>
              <span style={{ padding: "0 14px", fontSize: 15, color: isDark ? "#7A8BA8" : "#666", borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, lineHeight: "48px", flexShrink: 0 }}>🇮🇳 +91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                placeholder="WhatsApp number"
                maxLength={10}
                style={{ flex: 1, padding: "14px 16px", border: "none", background: "transparent", fontSize: 15, color: isDark ? "#E8EDF8" : "#1A1A1A", outline: "none", fontFamily: font }}
              />
            </div>
            {error && <p style={{ fontSize: 12, color: "#EF4444", margin: 0, textAlign: "left" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: loading ? (isDark ? "#1A2540" : "#E0E0E0") : `linear-gradient(135deg, ${theme.accent}, ${theme.accent}CC)`,
                color: loading ? (isDark ? "#4A5E7A" : "#999") : "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: font,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? "Opening guide..." : "Unlock Full Guide →"}
            </button>
          </form>

          <p style={{ fontSize: 11.5, color: isDark ? "#4A5E7A" : "#BBBBBB", marginTop: 14 }}>
            No spam. Your number is only used to identify access.
          </p>
        </div>

        {/* What's inside teaser list */}
        <div style={{ marginTop: 32, padding: "20px 24px", borderRadius: 16, background: isDark ? "rgba(255,255,255,0.02)" : theme.accentSoft, border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : theme.accent + "25"}` }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#4A5E7A" : theme.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>
            What's inside
          </h4>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {guide.sections.slice(0, 4).map((s, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 14, color: theme.accent, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 14, color: isDark ? "#7A8BA8" : theme.text, lineHeight: 1.5 }}>{s.heading}</span>
              </li>
            ))}
            <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 14, color: theme.accent, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 14, color: isDark ? "#7A8BA8" : theme.text, lineHeight: 1.5 }}>+ Downloadable PDF version</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}

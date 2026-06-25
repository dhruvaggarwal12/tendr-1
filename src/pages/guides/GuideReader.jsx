import { useParams, useNavigate } from "react-router-dom";
import { GUIDES } from "./guideData";

const font = "'Outfit', sans-serif";

export default function GuideReader() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const guide = GUIDES.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Guide not found</div>
          <button onClick={() => navigate("/guides")} style={{ marginTop: 20, padding: "9px 22px", borderRadius: 9, border: "none", background: "#4F8EF7", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Browse Guides
          </button>
        </div>
      </div>
    );
  }

  const renderers = {
    "dark-tech": DarkTechGuide,
    "corporate-clean": CorporateCleanGuide,
    "party-fun": PartyFunGuide,
    "wedding-rose": WeddingRoseGuide,
    "earthy-green": EarthyGreenGuide,
  };

  const Renderer = renderers[guide.theme.name] || DarkTechGuide;
  return <Renderer guide={guide} />;
}

/* ─── Shared PDF print + download button ─── */
function PrintButton({ color, bg, label = "Download PDF" }) {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
        }
      `}</style>
      <button
        className="no-print"
        onClick={() => window.print()}
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, padding: "12px 22px", borderRadius: 12, border: "none", background: bg, color, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 8 }}
      >
        ⬇ {label}
      </button>
    </>
  );
}

/* ─── Shared Section Renderers ─── */
function renderSections(sections, theme, isDark) {
  return sections.map((s, i) => {
    if (s.type === "intro") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: isDark ? "#FFF" : theme.heading, margin: "0 0 12px", letterSpacing: "-0.01em" }}>{s.heading}</h2>
        <p style={{ fontSize: 15.5, color: isDark ? "#A8B8D0" : theme.text, lineHeight: 1.8, margin: 0 }}>{s.content}</p>
      </div>
    );

    if (s.type === "table") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: isDark ? "#FFF" : theme.heading, margin: "0 0 6px" }}>{s.heading}</h2>
        {s.caption && <p style={{ fontSize: 12.5, color: isDark ? "#4A5E7A" : theme.muted, margin: "0 0 14px", fontStyle: "italic" }}>{s.caption}</p>}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, fontFamily: font }}>
            <thead>
              <tr style={{ background: isDark ? "#1A2540" : theme.accentSoft }}>
                {s.headers.map((h, j) => (
                  <th key={j} style={{ padding: "10px 14px", textAlign: j === 0 ? "left" : "center", fontWeight: 700, color: isDark ? theme.accent : theme.heading, borderBottom: `2px solid ${theme.accent}30`, whiteSpace: "nowrap", fontSize: 12.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}` }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "10px 14px", textAlign: ci === 0 ? "left" : "center", color: isDark ? "#A8B8D0" : theme.text }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    if (s.type === "tips") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: isDark ? "#FFF" : theme.heading, margin: "0 0 16px" }}>{s.heading}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {s.tips.map((tip, ti) => (
            <div key={ti} style={{ background: isDark ? "#0F1629" : theme.accentSoft, border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : theme.accent + "22"}`, borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${theme.accent}` }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: theme.accent }}>{tip.label}</span>
              <p style={{ fontSize: 14, color: isDark ? "#8A9BB8" : theme.text, margin: "5px 0 0", lineHeight: 1.65 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    );

    if (s.type === "callout") return (
      <div key={i} style={{ marginBottom: 36, background: s.highlight ? (isDark ? theme.accentSoft : theme.accentSoft) : "transparent", border: `1.5px solid ${theme.accent}`, borderRadius: 16, padding: "22px 24px", borderLeft: `5px solid ${theme.accent}` }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: isDark ? "#FFF" : theme.heading, margin: "0 0 10px" }}>{s.heading}</h3>
        <p style={{ fontSize: 14.5, color: isDark ? "#A8B8D0" : theme.text, margin: 0, lineHeight: 1.75 }}>{s.content}</p>
      </div>
    );

    if (s.type === "checklist") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: isDark ? "#FFF" : theme.heading, margin: "0 0 16px" }}>{s.heading}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {s.items.map((item, ii) => (
            <div key={ii} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)", border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}` }}>
              <span style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${theme.accent}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: theme.accent, display: "block" }} />
              </span>
              <span style={{ fontSize: 14, color: isDark ? "#A8B8D0" : theme.text, lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    );

    if (s.type === "breakdown") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: isDark ? "#FFF" : theme.heading, margin: "0 0 6px" }}>{s.heading}</h2>
        {s.note && <p style={{ fontSize: 12.5, color: isDark ? "#4A5E7A" : theme.muted, margin: "0 0 14px", fontStyle: "italic" }}>{s.note}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {s.items.map((item, ii) => (
            <div key={ii} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`, flexWrap: "wrap", gap: 6 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#E8EDF8" : theme.text }}>{item.label}</div>
                {item.note && <div style={{ fontSize: 12, color: isDark ? "#4A5E7A" : theme.muted, marginTop: 2 }}>{item.note}</div>}
              </div>
              {item.amount && <span style={{ fontSize: 15, fontWeight: 800, color: theme.accent }}>{item.amount}</span>}
            </div>
          ))}
        </div>
      </div>
    );

    if (s.type === "timeline") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: isDark ? "#FFF" : theme.heading, margin: "0 0 20px" }}>{s.heading}</h2>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent}00)` }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {s.steps.map((step, si) => (
              <div key={si} style={{ paddingLeft: 44, position: "relative" }}>
                <div style={{ position: "absolute", left: 7, top: 4, width: 18, height: 18, borderRadius: "50%", background: theme.accent, border: `3px solid ${isDark ? "#0F1629" : "#fff"}`, boxShadow: `0 0 0 2px ${theme.accent}40` }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{step.time}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {step.tasks.map((task, ti) => (
                    <div key={ti} style={{ fontSize: 14, color: isDark ? "#A8B8D0" : theme.text, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ color: theme.accent, flexShrink: 0 }}>→</span> {task}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    return null;
  });
}

/* ─── Guide 1: Dark Tech (Budget Blueprint) ─── */
function DarkTechGuide({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: font, color: theme.text }}>
      <PrintButton color="#fff" bg={theme.accent} />
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #0D1628 0%, #0A1020 100%)`, padding: "56px 24px 48px", borderBottom: "1px solid rgba(79,142,247,0.12)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {guide.tags.map((t) => <span key={t} style={{ fontSize: 10, fontWeight: 700, color: theme.accent, background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", padding: "3px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t}</span>)}
          </div>
          <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>{guide.coverEmoji}</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px" }}>{guide.title}</h1>
          <p style={{ fontSize: 17, color: "#7A8BA8", lineHeight: 1.65, margin: "0 0 24px", maxWidth: 560 }}>{guide.subtitle}</p>
          <div style={{ display: "flex", gap: 3 }}>
            <div style={{ height: 3, flex: 2, background: theme.accent, borderRadius: 100 }} />
            <div style={{ height: 3, flex: 1, background: "rgba(79,142,247,0.3)", borderRadius: 100 }} />
            <div style={{ height: 3, flex: 3, background: "rgba(79,142,247,0.15)", borderRadius: 100 }} />
          </div>
        </div>
      </div>
      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        {renderSections(guide.sections, theme, true)}
        <TendrCTA theme={theme} isDark />
      </div>
    </div>
  );
}

/* ─── Guide 2: Corporate Clean ─── */
function CorporateCleanGuide({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: font }}>
      <PrintButton color="#fff" bg={theme.accent} label="Download PDF" />
      {/* Header bar */}
      <div style={{ background: theme.heading, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {guide.tags.map((t) => <span key={t} style={{ fontSize: 10, fontWeight: 700, color: theme.tagText, background: theme.tag, padding: "3px 10px", borderRadius: 100, textTransform: "uppercase" }}>{t}</span>)}
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{guide.readTime} · {guide.pages} pages</span>
      </div>
      {/* Hero */}
      <div style={{ background: theme.surface, borderBottom: `4px solid ${theme.accent}`, padding: "52px 32px 44px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{guide.coverEmoji}</div>
          <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 2.8rem)", fontWeight: 900, color: theme.heading, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px" }}>{guide.title}</h1>
          <p style={{ fontSize: 17, color: theme.muted, lineHeight: 1.65, margin: 0, maxWidth: 540 }}>{guide.subtitle}</p>
        </div>
      </div>
      {/* Content */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "44px 32px 80px" }}>
        {renderSections(guide.sections, theme, false)}
        <TendrCTA theme={theme} isDark={false} />
      </div>
    </div>
  );
}

/* ─── Guide 3: Party Fun ─── */
function PartyFunGuide({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ minHeight: "100vh", background: theme.surface, fontFamily: font }}>
      <PrintButton color={theme.text} bg={theme.accent} />
      {/* Loud hero */}
      <div style={{ background: theme.bg, padding: "52px 24px 44px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,217,61,0.15)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,107,71,0.2)" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>{guide.coverEmoji}</div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: 900, color: theme.heading, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px" }}>{guide.title}</h1>
          <p style={{ fontSize: 17, color: "rgba(26,10,0,0.65)", lineHeight: 1.65, margin: "0 0 20px", maxWidth: 500 }}>{guide.subtitle}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {guide.tags.map((t) => <span key={t} style={{ fontSize: 11, fontWeight: 800, color: theme.text, background: theme.accent, padding: "5px 13px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t}</span>)}
          </div>
        </div>
      </div>
      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "44px 24px 80px" }}>
        {renderSections(guide.sections, theme, false)}
        <TendrCTA theme={theme} isDark={false} />
      </div>
    </div>
  );
}

/* ─── Guide 4: Wedding Rose ─── */
function WeddingRoseGuide({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: font }}>
      <PrintButton color="#fff" bg={theme.accent} />
      {/* Elegant hero */}
      <div style={{ background: `linear-gradient(135deg, #FFF0F4 0%, #FFE4EA 100%)`, padding: "60px 24px 50px", textAlign: "center", borderBottom: `2px solid ${theme.accent}30` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 50, marginBottom: 14 }}>{guide.coverEmoji}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Tendr Wedding Series</div>
          <h1 style={{ fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", fontWeight: 900, color: theme.heading, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 14px" }}>{guide.title}</h1>
          <p style={{ fontSize: 16.5, color: theme.muted, lineHeight: 1.7, margin: "0 0 20px" }}>{guide.subtitle}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {guide.tags.map((t) => <span key={t} style={{ fontSize: 11, fontWeight: 700, color: theme.tagText, background: theme.tag, padding: "4px 12px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t}</span>)}
          </div>
        </div>
      </div>
      {/* Ornamental divider */}
      <div style={{ textAlign: "center", padding: "20px 0", color: theme.accent, fontSize: 18, letterSpacing: 8 }}>✦ ✦ ✦</div>
      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "8px 24px 80px" }}>
        {renderSections(guide.sections, theme, false)}
        <TendrCTA theme={theme} isDark={false} />
      </div>
    </div>
  );
}

/* ─── Guide 5: Earthy Green ─── */
function EarthyGreenGuide({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: font }}>
      <PrintButton color="#fff" bg={theme.accent} />
      {/* Editorial hero */}
      <div style={{ background: theme.accent, padding: "56px 32px 48px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>Tendr Event Guide · Decor Edition</div>
          <div style={{ fontSize: 52, marginBottom: 14, lineHeight: 1 }}>{guide.coverEmoji}</div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px" }}>{guide.title}</h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, margin: "0 0 22px", maxWidth: 520 }}>{guide.subtitle}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {guide.tags.map((t) => <span key={t} style={{ fontSize: 11, fontWeight: 700, color: theme.accent, background: "#FFFFFF", padding: "4px 13px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t}</span>)}
          </div>
        </div>
      </div>
      {/* Content on off-white */}
      <div style={{ background: theme.bg }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 80px" }}>
          {/* Pull quote */}
          <div style={{ borderLeft: `5px solid ${theme.accent}`, paddingLeft: 20, marginBottom: 36 }}>
            <p style={{ fontSize: 20, fontStyle: "italic", fontWeight: 600, color: theme.heading, lineHeight: 1.5, margin: 0 }}>
              "{guide.teaser.hook}"
            </p>
          </div>
          {renderSections(guide.sections, theme, false)}
          <TendrCTA theme={theme} isDark={false} />
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Tendr CTA at end of guide ─── */
function TendrCTA({ theme, isDark }) {
  return (
    <div style={{ marginTop: 48, padding: "28px 28px", borderRadius: 18, background: isDark ? "#0F1629" : theme.accentSoft, border: `1.5px solid ${theme.accent}35`, textAlign: "center" }}>
      <div style={{ fontSize: 24, marginBottom: 10 }}>🎊</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: isDark ? "#FFFFFF" : theme.heading, margin: "0 0 8px" }}>
        Ready to book your vendors?
      </h3>
      <p style={{ fontSize: 14, color: isDark ? "#7A8BA8" : theme.muted, margin: "0 0 18px", lineHeight: 1.6 }}>
        Find verified Decorators, Caterers, Photographers, and DJs on Tendr — compare, chat, and book in one place.
      </p>
      <a
        href="/"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 10, background: theme.accent, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
      >
        Explore Tendr →
      </a>
    </div>
  );
}

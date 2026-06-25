import { useEffect } from "react";
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
          <button onClick={() => navigate("/guides")} style={{ marginTop: 20, padding: "9px 22px", borderRadius: 9, border: "none", background: "#C47A2E", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Browse Guides
          </button>
        </div>
      </div>
    );
  }

  const renderers = {
    "amber-gold":      AmberGoldGuide,
    "corporate-navy":  CorporateNavyGuide,
    "warm-orange":     WarmOrangeGuide,
    "bridal-rose":     BridalRoseGuide,
    "terracotta":      TerracottaGuide,
  };

  useEffect(() => {
    const phone = sessionStorage.getItem('ebook_access_phone') || 'unknown';
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    fetch(`${BASE_URL}/admin/ebook-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, slug, action: 'read', title: guide?.title }),
    }).catch(() => {});
  }, [slug]);

  const Renderer = renderers[guide.theme.name] || AmberGoldGuide;
  return <Renderer guide={guide} />;
}

/* ─── Print + Download button ─── */
function PrintButton({ theme }) {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: ${theme.bg} !important; }
        }
      `}</style>
      <button
        className="no-print"
        onClick={() => {
          const phone = sessionStorage.getItem('ebook_access_phone') || 'unknown';
          const BASE_URL = import.meta.env.VITE_BASE_URL;
          fetch(`${BASE_URL}/admin/ebook-access`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, slug: window.location.pathname.split('/')[2], action: 'download' }),
          }).catch(() => {});
          window.print();
        }}
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, padding: "11px 20px", borderRadius: 12, border: "none", background: theme.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily, boxShadow: `0 6px 20px ${theme.accentSoft.replace("0.08", "0.35")}`, display: "flex", alignItems: "center", gap: 7 }}
      >
        ⬇ Download PDF
      </button>
    </>
  );
}

/* ─── Shared section renderer — all on the same bg ─── */
function renderSections(sections, theme) {
  return sections.map((s, i) => {
    if (s.type === "intro") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.heading, margin: "0 0 12px", letterSpacing: "-0.01em" }}>{s.heading}</h2>
        <p style={{ fontSize: 15.5, color: theme.text, lineHeight: 1.8, margin: 0 }}>{s.content}</p>
      </div>
    );

    if (s.type === "table") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.heading, margin: "0 0 6px" }}>{s.heading}</h2>
        {s.caption && <p style={{ fontSize: 12.5, color: theme.muted, margin: "0 0 14px", fontStyle: "italic" }}>{s.caption}</p>}
        <div style={{ overflowX: "auto", borderRadius: 14, border: `1.5px solid ${theme.accent}22`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, fontFamily: font }}>
            <thead>
              <tr style={{ background: theme.surface }}>
                {s.headers.map((h, j) => (
                  <th key={j} style={{ padding: "11px 14px", textAlign: j === 0 ? "left" : "center", fontWeight: 700, color: theme.accent, borderBottom: `2px solid ${theme.accent}33`, whiteSpace: "nowrap", fontSize: 12.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : `${theme.surface}88`, borderBottom: `1px solid ${theme.accent}15` }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "10px 14px", textAlign: ci === 0 ? "left" : "center", color: theme.text }}>{cell}</td>
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
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.heading, margin: "0 0 16px" }}>{s.heading}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {s.tips.map((tip, ti) => (
            <div key={ti} style={{ background: theme.surface, border: `1px solid ${theme.accent}20`, borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${theme.accent}` }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: theme.accent }}>{tip.label}</span>
              <p style={{ fontSize: 14, color: theme.text, margin: "5px 0 0", lineHeight: 1.65 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    );

    if (s.type === "callout") return (
      <div key={i} style={{ marginBottom: 36, background: theme.surface, border: `1.5px solid ${theme.accent}55`, borderRadius: 16, padding: "22px 24px", borderLeft: `5px solid ${theme.accent}` }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: theme.heading, margin: "0 0 10px" }}>{s.heading}</h3>
        <p style={{ fontSize: 14.5, color: theme.text, margin: 0, lineHeight: 1.75 }}>{s.content}</p>
      </div>
    );

    if (s.type === "checklist") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.heading, margin: "0 0 16px" }}>{s.heading}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {s.items.map((item, ii) => (
            <div key={ii} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", borderRadius: 10, background: theme.surface, border: `1px solid ${theme.accent}18` }}>
              <span style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${theme.accent}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: theme.accent, display: "block" }} />
              </span>
              <span style={{ fontSize: 14, color: theme.text, lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    );

    if (s.type === "breakdown") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.heading, margin: "0 0 6px" }}>{s.heading}</h2>
        {s.note && <p style={{ fontSize: 12.5, color: theme.muted, margin: "0 0 14px", fontStyle: "italic" }}>{s.note}</p>}
        <div style={{ borderRadius: 14, border: `1.5px solid ${theme.accent}22`, overflow: "hidden" }}>
          {s.items.map((item, ii) => (
            <div key={ii} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: ii % 2 === 0 ? "transparent" : theme.surface, borderBottom: ii < s.items.length - 1 ? `1px solid ${theme.accent}15` : "none", flexWrap: "wrap", gap: 6 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{item.label}</div>
                {item.note && <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{item.note}</div>}
              </div>
              {item.amount && <span style={{ fontSize: 15, fontWeight: 800, color: theme.accent }}>{item.amount}</span>}
            </div>
          ))}
        </div>
      </div>
    );

    if (s.type === "timeline") return (
      <div key={i} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.heading, margin: "0 0 20px" }}>{s.heading}</h2>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent}22)` }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {s.steps.map((step, si) => (
              <div key={si} style={{ paddingLeft: 44, position: "relative" }}>
                <div style={{ position: "absolute", left: 7, top: 4, width: 18, height: 18, borderRadius: "50%", background: theme.accent, border: `3px solid ${theme.bg}`, boxShadow: `0 0 0 2px ${theme.accent}44` }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{step.time}</div>
                <div style={{ background: theme.surface, borderRadius: 10, padding: "10px 14px", border: `1px solid ${theme.accent}18` }}>
                  {step.tasks.map((task, ti) => (
                    <div key={ti} style={{ fontSize: 14, color: theme.text, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 8, marginBottom: ti < step.tasks.length - 1 ? 6 : 0 }}>
                      <span style={{ color: theme.accent, flexShrink: 0, marginTop: 1 }}>→</span> {task}
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

/* ─── Tendr CTA at bottom ─── */
function TendrCTA({ theme }) {
  return (
    <div style={{ marginTop: 48, padding: "28px", borderRadius: 18, background: theme.surface, border: `1.5px solid ${theme.accent}35`, textAlign: "center" }}>
      <div style={{ fontSize: 24, marginBottom: 10 }}>🎊</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.heading, margin: "0 0 8px" }}>Ready to book your vendors?</h3>
      <p style={{ fontSize: 14, color: theme.muted, margin: "0 0 18px", lineHeight: 1.6 }}>
        Find verified Decorators, Caterers, Photographers, and DJs on Tendr — compare, chat, and book in one place.
      </p>
      <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 10, background: theme.accent, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
        Explore Tendr →
      </a>
    </div>
  );
}

/* ─── Shared tag row ─── */
function Tags({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
      {guide.tags.map((t) => (
        <span key={t} style={{ fontSize: 11, fontWeight: 700, color: theme.tagText, background: theme.tag, padding: "4px 11px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t}</span>
      ))}
    </div>
  );
}

/* ─── Guide 1: Amber Gold (Budget Blueprint) ─── */
function AmberGoldGuide({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: font }}>
      <PrintButton theme={theme} />
      {/* Hero — parchment with ruled lines feel */}
      <div style={{ background: theme.bg, borderBottom: `3px solid ${theme.accent}`, padding: "52px 24px 44px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Tags guide={guide} />
          <div style={{ fontSize: 48, marginBottom: 14, lineHeight: 1 }}>{guide.coverEmoji}</div>
          <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 2.8rem)", fontWeight: 900, color: theme.heading, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 12px" }}>{guide.title}</h1>
          <p style={{ fontSize: 17, color: theme.muted, lineHeight: 1.65, margin: "0 0 20px", maxWidth: 540 }}>{guide.subtitle}</p>
          {/* Ruled line decoration */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[1, 0.5, 0.25].map((op, i) => <div key={i} style={{ height: 2, background: theme.accent, opacity: op, borderRadius: 100, maxWidth: [200, 140, 80][i] }} />)}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "44px 24px 80px" }}>
        {renderSections(guide.sections, theme)}
        <TendrCTA theme={theme} />
      </div>
    </div>
  );
}

/* ─── Guide 2: Corporate Navy (Corporate Playbook) ─── */
function CorporateNavyGuide({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: font }}>
      <PrintButton theme={theme} />
      {/* Professional header bar */}
      <div style={{ background: theme.accent, padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Tendr Corporate Series</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{guide.readTime} · {guide.pages} pages</span>
      </div>
      {/* Hero */}
      <div style={{ background: theme.bg, padding: "48px 32px 40px", borderBottom: `2px solid ${theme.surface}` }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <Tags guide={guide} />
          <div style={{ fontSize: 48, marginBottom: 14 }}>{guide.coverEmoji}</div>
          <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 2.8rem)", fontWeight: 900, color: theme.heading, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 12px" }}>{guide.title}</h1>
          <p style={{ fontSize: 17, color: theme.muted, lineHeight: 1.65, margin: 0, maxWidth: 540 }}>{guide.subtitle}</p>
        </div>
      </div>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "44px 32px 80px" }}>
        {renderSections(guide.sections, theme)}
        <TendrCTA theme={theme} />
      </div>
    </div>
  );
}

/* ─── Guide 3: Warm Orange (House Party) ─── */
function WarmOrangeGuide({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: font }}>
      <PrintButton theme={theme} />
      {/* Bold energetic hero */}
      <div style={{ background: theme.accent, padding: "52px 24px 44px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
            {guide.tags.map((t) => <span key={t} style={{ fontSize: 11, fontWeight: 700, color: theme.accent, background: "#fff", padding: "4px 12px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t}</span>)}
          </div>
          <div style={{ fontSize: 52, marginBottom: 14, lineHeight: 1 }}>{guide.coverEmoji}</div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px" }}>{guide.title}</h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", lineHeight: 1.65, margin: 0, maxWidth: 500 }}>{guide.subtitle}</p>
        </div>
      </div>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "44px 24px 80px" }}>
        {renderSections(guide.sections, theme)}
        <TendrCTA theme={theme} />
      </div>
    </div>
  );
}

/* ─── Guide 4: Bridal Rose (Wedding Hamper) ─── */
function BridalRoseGuide({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: font }}>
      <PrintButton theme={theme} />
      {/* Elegant centered hero */}
      <div style={{ background: theme.bg, padding: "60px 24px 50px", textAlign: "center", borderBottom: `1px solid ${theme.accent}25` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 18 }}>Tendr Wedding Series</div>
          <div style={{ fontSize: 50, marginBottom: 14 }}>{guide.coverEmoji}</div>
          <h1 style={{ fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", fontWeight: 900, color: theme.heading, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 14px" }}>{guide.title}</h1>
          <p style={{ fontSize: 16.5, color: theme.muted, lineHeight: 1.7, margin: "0 0 20px" }}>{guide.subtitle}</p>
          <Tags guide={guide} />
          <div style={{ textAlign: "center", color: theme.accent, fontSize: 16, letterSpacing: 8, marginTop: 8 }}>✦ ✦ ✦</div>
        </div>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px 80px" }}>
        {renderSections(guide.sections, theme)}
        <TendrCTA theme={theme} />
      </div>
    </div>
  );
}

/* ─── Guide 5: Terracotta (Decor on a Budget) ─── */
function TerracottaGuide({ guide }) {
  const { theme } = guide;
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: font }}>
      <PrintButton theme={theme} />
      {/* Editorial left-aligned hero with side accent */}
      <div style={{ background: theme.bg, borderBottom: `3px solid ${theme.accent}`, padding: "56px 32px 48px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 6, background: theme.accent, borderRadius: 100, alignSelf: "stretch", minHeight: 80, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>Tendr Event Guide · Decor Edition</div>
            <Tags guide={guide} />
            <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>{guide.coverEmoji}</div>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)", fontWeight: 900, color: theme.heading, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px" }}>{guide.title}</h1>
            <p style={{ fontSize: 17, color: theme.muted, lineHeight: 1.65, margin: 0, maxWidth: 520 }}>{guide.subtitle}</p>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 80px" }}>
        {/* Pull quote */}
        <div style={{ borderLeft: `4px solid ${theme.accent}`, paddingLeft: 20, marginBottom: 36 }}>
          <p style={{ fontSize: 19, fontStyle: "italic", fontWeight: 600, color: theme.heading, lineHeight: 1.5, margin: 0 }}>
            "Lighting is the single most underrated element in event decor."
          </p>
        </div>
        {renderSections(guide.sections, theme)}
        <TendrCTA theme={theme} />
      </div>
    </div>
  );
}

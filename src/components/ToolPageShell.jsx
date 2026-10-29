import HamburgerNav from "./HamburgerNav";

const font = "'Outfit', sans-serif";

// Shared shell for the standalone Tools pages (Decor Analyser, Planning Timeline,
// Budget Allocator, Find by Style, Equipment Generator) — replaces the old flat
// `background:"#FFFCF5"` + bare-content-on-white pattern every one of them used,
// which read as generic/AI-templated. Each tool gets its own accent colour (so the
// 5 pages read as a family, not 5 identical clones) over a decorative gradient +
// dot-texture wash, a real icon badge instead of an emoji, and its content wrapped
// in a bordered "window" card rather than floating directly on the page.
export default function ToolPageShell({ accent, eyebrow, title, subtitle, icon, maxWidth = 640, children, headerExtra }) {
  return (
    <div style={{ minHeight: "100vh", background: "#FBF6EC", fontFamily: font, position: "relative" }}>
      {/* Decorative wash — replaces the plain flat background */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 65% 42% at 88% -6%, ${accent}2e 0%, transparent 60%), radial-gradient(ellipse 55% 40% at -6% 102%, ${accent}1c 0%, transparent 62%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${accent}26 1px, transparent 1px)`, backgroundSize: "26px 26px", opacity: 0.55 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <HamburgerNav />
        <div style={{ maxWidth, margin: "0 auto", padding: "28px 16px 60px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            {icon && (
              <div style={{ position: "relative", width: 54, height: 54, borderRadius: 16, flexShrink: 0 }}>
                <div aria-hidden style={{ position: "absolute", inset: -8, borderRadius: 20, background: `radial-gradient(circle, ${accent}3a 0%, transparent 72%)`, filter: "blur(1px)" }} />
                <div style={{ position: "relative", width: 54, height: 54, borderRadius: 16, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 22px ${accent}4a` }}>
                  {icon}
                </div>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              {eyebrow && <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{eyebrow}</div>}
              <h1 style={{ fontSize: "clamp(22px,4vw,26px)", fontWeight: 800, color: "#1C0900", margin: 0, lineHeight: 1.2 }}>{title}</h1>
              {subtitle && <p style={{ fontSize: 14, color: "rgba(28,9,0,0.55)", marginTop: 8, lineHeight: 1.65, maxWidth: 520 }}>{subtitle}</p>}
            </div>
            {headerExtra}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

// A contained "window" card — the replacement for content sitting bare on the page
// background. `accent` tints the border faintly so it still reads as part of that
// tool's colour family.
export function ToolWindow({ accent = "#C47A2E", style, children, ...rest }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        border: `1.5px solid ${accent}22`,
        boxShadow: "0 4px 24px rgba(28,9,0,0.05)",
        padding: "22px 20px",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

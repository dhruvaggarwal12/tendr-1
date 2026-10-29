import HamburgerNav from "./HamburgerNav";

const font = "'Outfit', sans-serif";

// Shared shell for the standalone Tools pages. First pass used a faint tint over a
// cream page — too subtle to actually read as designed, and every tool ended up
// looking like the same page with a different hex code. This version gives each
// tool a genuinely coloured hero band (not a wash), with its own decorative shapes,
// and the content card overlaps it for real depth instead of floating flat below it.
export default function ToolPageShell({ accent, accentDark, eyebrow, title, subtitle, icon, maxWidth = 640, children, headerExtra }) {
  const dark = accentDark || accent;
  return (
    <div style={{ minHeight: "100vh", background: "#F6F1E7", fontFamily: font }}>
      <HamburgerNav />

      {/* Coloured hero band — the actual decoration, not a faint tint */}
      <div style={{ position: "relative", background: `linear-gradient(145deg, ${dark} 0%, ${accent} 100%)`, overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
        <div aria-hidden style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.08)", top: -170, right: -70 }} />
        <div aria-hidden style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)", bottom: -130, left: "18%" }} />
        <div aria-hidden style={{ position: "absolute", width: 110, height: 110, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.18)", top: 20, left: "62%" }} />

        <div style={{ position: "relative", maxWidth, margin: "0 auto", padding: "30px 16px 56px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            {icon && (
              <div style={{ width: 58, height: 58, borderRadius: 18, flexShrink: 0, background: "rgba(255,255,255,0.16)", border: "1.5px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
                {icon}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              {eyebrow && <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>{eyebrow}</div>}
              <h1 style={{ fontSize: "clamp(24px,4.5vw,30px)", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>{title}</h1>
              {subtitle && <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 8, lineHeight: 1.65, maxWidth: 520 }}>{subtitle}</p>}
            </div>
            {headerExtra}
          </div>
        </div>
      </div>

      {/* Body — content card overlaps the band for depth instead of sitting flat below it */}
      <div style={{ maxWidth, margin: "-30px auto 0", padding: "0 16px 60px", position: "relative", zIndex: 1 }}>
        {children}
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
        boxShadow: "0 14px 40px rgba(28,9,0,0.12)",
        padding: "22px 20px",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

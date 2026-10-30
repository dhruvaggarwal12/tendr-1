import HamburgerNav from "./HamburgerNav";

const font = "'Outfit', sans-serif";

// Shared shell for the standalone Tools pages. First pass used a faint tint over a
// cream page — too subtle to actually read as designed, and every tool ended up
// looking like the same page with a different hex code. This version gives each
// tool a genuinely coloured hero band (not a wash), with its own decorative shapes,
// and the content card overlaps it for real depth instead of floating flat below it.
export default function ToolPageShell({ accent, accentDark, eyebrow, title, subtitle, icon, maxWidth = 640, children, headerExtra }) {
  const dark = accentDark || accent;
  // Whole page now carries this tool's colour, not just the header band — a faint
  // wash top and bottom, so the page itself reads as "this tool's colour" even
  // once you've scrolled past the hero.
  const pageBg = `radial-gradient(ellipse 75% 35% at 10% 0%, ${accent}14 0%, transparent 60%), radial-gradient(ellipse 65% 32% at 100% 100%, ${accent}0f 0%, transparent 65%), #F6F1E7`;
  return (
    <div style={{ minHeight: "100vh", background: pageBg, fontFamily: font }}>
      <HamburgerNav />

      {/* Coloured hero band — shorter now, just enough to establish the colour before
          handing off to the page wash above */}
      <div style={{ position: "relative", background: `linear-gradient(145deg, ${dark} 0%, ${accent} 100%)`, overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
        <div aria-hidden style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.08)", top: -150, right: -60 }} />
        <div aria-hidden style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.07)", bottom: -100, left: "18%" }} />
        <div aria-hidden style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.18)", top: 14, left: "62%" }} />

        <div style={{ position: "relative", maxWidth, margin: "0 auto", padding: "20px 16px 34px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
            {icon && (
              <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: "rgba(255,255,255,0.16)", border: "1.5px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
                {icon}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              {eyebrow && <div style={{ fontSize: 10.5, fontWeight: 800, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>{eyebrow}</div>}
              <h1 style={{ fontSize: "clamp(20px,4vw,25px)", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>{title}</h1>
              {subtitle && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 6, lineHeight: 1.6, maxWidth: 520 }}>{subtitle}</p>}
            </div>
            {headerExtra}
          </div>
        </div>
      </div>

      {/* Body — content card overlaps the band for depth instead of sitting flat below it */}
      <div style={{ maxWidth, margin: "-22px auto 0", padding: "0 16px 60px", position: "relative", zIndex: 1 }}>
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

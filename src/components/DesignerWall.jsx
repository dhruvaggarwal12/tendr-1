import { useRef, useState } from "react";

const GOLD = "#C47A2E";
const font = "'Outfit', 'Inter', sans-serif";

const CARD_STYLES = [
  { bg: "#FFFBF0", line: "#E8D08A", ink: "#2D1E0A", accent: "#B8691A", rotate: "-2deg" },
  { bg: "#FFF5F7", line: "#F0C0C8", ink: "#2A1015", accent: "#C0294A", rotate: "1.5deg" },
  { bg: "#F2FBF4", line: "#A8DDB4", ink: "#0F2714", accent: "#217A3C", rotate: "-1deg" },
  { bg: "#F6F2FF", line: "#C8B0F0", ink: "#1A0F2E", accent: "#6B35C8", rotate: "2.2deg" },
  { bg: "#FFF8EE", line: "#E0C898", ink: "#291A08", accent: "#9A6218", rotate: "-1.8deg" },
  { bg: "#F0F7FF", line: "#A8C8F0", ink: "#0A1929", accent: "#1A5FAB", rotate: "1deg" },
];
const PINS = ["📌", "⭐", "🌸", "💫", "✨", "📍"];

export default function DesignerWall({ onClose, items = [], title, wallEmoji = "✨" }) {
  const wallRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (!items.length) return;
    setDownloading(true);
    try {
      const h2c = (await import("html2canvas")).default;
      const canvas = await h2c(wallRef.current, {
        backgroundColor: "#140D04",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `${(title || "wall").replace(/\s+/g, "-").toLowerCase()}-tendr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Wall download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(5,3,1,0.95)",
      display: "flex", flexDirection: "column",
      fontFamily: font,
    }}>
      {/* Sticky top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        background: "rgba(10,6,2,0.96)",
        borderBottom: `1px solid rgba(196,122,46,0.18)`,
        backdropFilter: "blur(10px)",
        flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(245,236,216,0.7)", padding: "7px 16px", borderRadius: 10,
          cursor: "pointer", fontSize: 13, fontFamily: font, fontWeight: 600, letterSpacing: "0.02em",
        }}>← Back</button>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src="/tendr-logo-secondary.png" alt="Tendr" style={{ height: 22, objectFit: "contain" }} />
        </div>

        <button onClick={download} disabled={downloading || !items.length} style={{
          background: items.length ? GOLD : "rgba(196,122,46,0.25)",
          border: "none", color: "#fff",
          padding: "7px 18px", borderRadius: 10,
          cursor: items.length ? "pointer" : "not-allowed",
          fontSize: 13, fontFamily: font, fontWeight: 700, letterSpacing: "0.02em",
          opacity: downloading ? 0.7 : 1, transition: "opacity 0.15s",
          whiteSpace: "nowrap",
        }}>{downloading ? "Saving…" : "⬇ Download"}</button>
      </div>

      {/* Scrollable wall */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Captured area */}
        <div ref={wallRef} style={{
          minHeight: "100%",
          background: "linear-gradient(160deg, #1C1007 0%, #130C04 55%, #1A1208 100%)",
          padding: "44px 24px 64px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Ambient glow */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `
              radial-gradient(ellipse 60% 40% at 20% 15%, rgba(196,122,46,0.08) 0%, transparent 70%),
              radial-gradient(ellipse 50% 35% at 80% 85%, rgba(196,122,46,0.05) 0%, transparent 70%)
            `,
          }} />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 44, position: "relative" }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 800, letterSpacing: "0.32em",
                color: `${GOLD}90`, textTransform: "uppercase",
              }}>TENDR · EVENT PLANNING</span>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              justifyContent: "center", margin: "14px 0",
            }}>
              <div style={{ flex: 1, maxWidth: 100, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}50)` }} />
              <span style={{ fontSize: 26 }}>{wallEmoji}</span>
              <div style={{ flex: 1, maxWidth: 100, height: 1, background: `linear-gradient(270deg, transparent, ${GOLD}50)` }} />
            </div>

            <h1 style={{
              fontSize: 30, fontWeight: 700, color: "#F5ECD8",
              margin: "0 0 8px", letterSpacing: "0.015em",
              textShadow: `0 2px 24px rgba(196,122,46,0.25)`,
              fontFamily: font,
            }}>{title}</h1>

            <p style={{
              color: "rgba(245,236,216,0.3)", fontSize: 11,
              letterSpacing: "0.14em", textTransform: "uppercase", margin: 0,
            }}>
              {items.length} note{items.length !== 1 ? "s" : ""} · made with Tendr
            </p>
          </div>

          {/* Empty state */}
          {items.length === 0 && (
            <div style={{
              textAlign: "center", color: "rgba(245,236,216,0.25)",
              fontSize: 15, padding: "60px 0",
            }}>
              No notes yet — go back and add some!
            </div>
          )}

          {/* Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "28px 20px",
            maxWidth: 1040, margin: "0 auto",
            alignItems: "start",
          }}>
            {items.map((item, i) => {
              const s = CARD_STYLES[i % CARD_STYLES.length];
              const pin = PINS[i % PINS.length];
              const author = item.name || item.by || "Anonymous";
              return (
                <div key={item.id || i} style={{
                  background: s.bg,
                  border: `1px solid ${s.line}`,
                  borderRadius: 3,
                  padding: "26px 16px 18px",
                  transform: `rotate(${s.rotate})`,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.7)",
                  position: "relative",
                }}>
                  {/* Top edge fold */}
                  <div style={{
                    position: "absolute", top: 0, right: 0,
                    width: 0, height: 0,
                    borderStyle: "solid",
                    borderWidth: "0 14px 14px 0",
                    borderColor: `transparent ${s.line} transparent transparent`,
                    opacity: 0.5,
                  }} />

                  {/* Pin */}
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    fontSize: 18, lineHeight: 1,
                    filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.5))",
                  }}>{pin}</div>

                  {/* Open quote mark */}
                  <div style={{
                    position: "absolute", top: 14, left: 10,
                    fontSize: 52, lineHeight: 1,
                    color: s.accent, opacity: 0.13,
                    fontFamily: "Georgia, serif",
                    userSelect: "none", pointerEvents: "none",
                  }}>"</div>

                  {/* Message */}
                  <div style={{
                    fontSize: 13, lineHeight: 1.8, color: s.ink,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: "italic",
                    wordBreak: "break-word",
                    position: "relative", zIndex: 1,
                    paddingTop: 4, minHeight: 48,
                  }}>{item.text}</div>

                  {/* Author */}
                  <div style={{
                    marginTop: 14, paddingTop: 10,
                    borderTop: `1px solid ${s.line}`,
                    fontSize: 10.5, color: s.accent,
                    fontFamily: font, fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>— {author}</div>
                </div>
              );
            })}
          </div>

          {/* Bottom watermark */}
          <div style={{
            textAlign: "center", marginTop: 56,
            color: `rgba(196,122,46,0.25)`, fontSize: 10,
            letterSpacing: "0.22em", textTransform: "uppercase",
          }}>
            tendr · your event, elevated · tendr.in
          </div>
        </div>
      </div>
    </div>
  );
}

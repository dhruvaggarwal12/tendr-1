import { useState, useRef, useCallback } from "react";
import { useChatOverlay } from "../context/ChatContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const INK = "#1C0900";
const CREAM = "#FFFCF5";
const MUTED = "rgba(28,9,0,0.5)";

const EFFORT_STYLE = {
  DIY:          { bg: "rgba(34,197,94,0.1)",  color: "#15803d" },
  Professional: { bg: "rgba(196,122,46,0.12)", color: "#92400E" },
  Either:       { bg: "rgba(99,102,241,0.1)",  color: "#4338CA" },
};
const IMPACT_STYLE = {
  High:   { bg: "rgba(196,122,46,0.14)", color: "#92400E" },
  Medium: { bg: "rgba(245,158,11,0.1)",  color: "#B45309" },
  Low:    { bg: "rgba(28,9,0,0.06)",     color: MUTED      },
};

function resizeImage(file, maxPx = 1200) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.82), w, h });
    };
    img.src = url;
  });
}

function ZoneCard({ zone, index }) {
  const [open, setOpen] = useState(index < 2);
  const eff = EFFORT_STYLE[zone.effort] || EFFORT_STYLE.Either;
  const imp = IMPACT_STYLE[zone.impact] || IMPACT_STYLE.Medium;
  return (
    <div style={{ border: "1.5px solid rgba(196,122,46,0.15)", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", padding: "12px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left", fontFamily: F }}
      >
        <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(196,122,46,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
          {["🎨","🌸","✨","🕯️","🎀","🌿","💡"][index % 7]}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{zone.zone}</div>
          <div style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }}>{zone.suggestion}</div>
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: imp.bg, color: imp.color }}>{zone.impact}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2" strokeLinecap="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ fontSize: 12.5, color: "#4A2810", lineHeight: 1.6, marginBottom: 10 }}>{zone.details}</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {zone.effort && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: eff.bg, color: eff.color }}>{zone.effort}</span>}
            {zone.cost && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "rgba(28,9,0,0.05)", color: MUTED }}>{zone.cost}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DecorAnalyzer({ onClose, initialEventType = "", compact = false }) {
  const { openOccasionsChat } = useChatOverlay();
  const fileRef = useRef(null);

  const [phase, setPhase]       = useState("idle"); // idle | analyzing | done | error
  const [preview, setPreview]   = useState(null);
  const [imageData, setImageData] = useState(null);  // { base64, mediaType }
  const [analysis, setAnalysis] = useState(null);
  const [eventType, setEventType] = useState(initialEventType);
  const [colorPref, setColorPref] = useState("");
  const [drag, setDrag]         = useState(false);
  const [errMsg, setErrMsg]     = useState("");
  const [expandSection, setExpandSection] = useState({ zones: true, lighting: false, tips: false });

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const { dataUrl } = await resizeImage(file, 1200);
    setPreview(dataUrl);
    const base64 = dataUrl.split(",")[1];
    setImageData({ base64, mediaType: file.type.startsWith("image/png") ? "image/png" : "image/jpeg" });
    setPhase("idle");
    setAnalysis(null);
  }, []);

  const handleFile = (e) => { processFile(e.target.files?.[0]); e.target.value = ""; };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const analyse = async () => {
    if (!imageData) return;
    setPhase("analyzing");
    setErrMsg("");
    try {
      const res = await fetch(`${BASE_URL}/decor-analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageData.base64,
          mediaType: imageData.mediaType,
          context: { eventType, colorPreference: colorPref },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.analysis) throw new Error(data.error || "Analysis failed");
      setAnalysis(data.analysis);
      setPhase("done");
    } catch (e) {
      setErrMsg(e.message || "Something went wrong. Please try again.");
      setPhase("error");
    }
  };

  const sendToChat = () => {
    if (!analysis) return;
    const a = analysis;
    const lines = [
      `🎨 *Venue Decor Analysis*`,
      eventType ? `Event: ${eventType}` : "",
      ``,
      `*Space*: ${a.spaceType || "Your venue"} — ${a.style || ""}`,
      ``,
      `*Top Decoration Ideas:*`,
      ...(a.topPicks || []).map(p => `• ${p.title} (${p.cost || ""})`),
      ``,
      `*Decoration Zones:*`,
      ...(a.decorZones || []).map(z => `• ${z.zone}: ${z.suggestion}`),
      ``,
      "Can you help me decorate based on this analysis?",
    ].filter(l => l !== undefined);
    openOccasionsChat(lines.join("\n"));
    if (onClose) onClose();
  };

  const reset = () => {
    setPhase("idle"); setPreview(null); setImageData(null); setAnalysis(null); setErrMsg("");
  };

  const toggleSection = (k) => setExpandSection(s => ({ ...s, [k]: !s[k] }));

  // ── Upload screen ─────────────────────────────────────────────────────────
  if (phase === "idle" && !preview) return (
    <div style={{ fontFamily: F, display: "flex", flexDirection: "column", gap: 20, padding: compact ? 0 : "4px 0" }}>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${drag ? GOLD : "rgba(196,122,46,0.3)"}`,
          borderRadius: 16, padding: "36px 24px", textAlign: "center", cursor: "pointer",
          background: drag ? "rgba(196,122,46,0.05)" : "rgba(196,122,46,0.02)",
          transition: "all 0.18s",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 6 }}>Upload your venue photo</div>
        <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>Drop a photo or tap to browse</div>
        <div style={{ fontSize: 11, color: "rgba(196,122,46,0.6)", marginTop: 8 }}>JPG, PNG · Auto-resized · Not stored</div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      </div>

      {/* Context inputs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>Event type <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
          <input value={eventType} onChange={e => setEventType(e.target.value)}
            placeholder="e.g. Birthday party, Wedding, Farewell…"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: F, fontSize: 13, color: INK, background: "#fff", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>Colour preferences <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
          <input value={colorPref} onChange={e => setColorPref(e.target.value)}
            placeholder="e.g. Pastel pink and gold, Classic white…"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: F, fontSize: 13, color: INK, background: "#fff", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>
    </div>
  );

  // ── Preview + analyse button ───────────────────────────────────────────────
  if (phase === "idle" && preview) return (
    <div style={{ fontFamily: F, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", maxHeight: 260 }}>
        <img src={preview} alt="Venue" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
        <button onClick={reset}
          style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <input value={eventType} onChange={e => setEventType(e.target.value)}
            placeholder="Event type (optional)"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: F, fontSize: 13, color: INK, background: "#fff", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ flex: 1 }}>
          <input value={colorPref} onChange={e => setColorPref(e.target.value)}
            placeholder="Colour preference (optional)"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: F, fontSize: 13, color: INK, background: "#fff", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>
      <button onClick={analyse}
        style={{ padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${GOLD},#D4A848)`, color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(196,122,46,0.35)" }}>
        ✨ Analyse Venue Decor
      </button>
    </div>
  );

  // ── Analyzing ─────────────────────────────────────────────────────────────
  if (phase === "analyzing") return (
    <div style={{ fontFamily: F, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "32px 16px" }}>
      <div style={{ position: "relative" }}>
        <img src={preview} alt="Analysing" style={{ width: 120, height: 90, borderRadius: 12, objectFit: "cover", opacity: 0.7 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "da-spin 0.7s linear infinite" }} />
        </div>
      </div>
      <style>{`@keyframes da-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 4 }}>Analysing your venue…</div>
        <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>Our AI is reading the space, colours and layout<br />to suggest the best decor ideas for you.</div>
      </div>
      {["Identifying zones & focal points", "Matching colours to the space", "Building decoration suggestions"].map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: MUTED }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, animation: `da-pulse ${1.2 + i * 0.4}s ease-in-out infinite alternate` }} />
          <style>{`@keyframes da-pulse{from{opacity:0.3}to{opacity:1}}`}</style>
          {s}
        </div>
      ))}
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (phase === "error") return (
    <div style={{ fontFamily: F, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 36 }}>⚠️</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>Couldn't analyse the photo</div>
      <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{errMsg}</div>
      <button onClick={() => setPhase("idle")} style={{ padding: "11px 28px", borderRadius: 10, border: "none", background: GOLD, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F }}>Try Again</button>
    </div>
  );

  // ── Results ───────────────────────────────────────────────────────────────
  const a = analysis;
  return (
    <div style={{ fontFamily: F, display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Hero: image + style banner */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <img src={preview} alt="Venue" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 14, display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,9,0,0.75) 40%, transparent 75%)", borderRadius: 14 }} />
        <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>{a.spaceType}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{a.style || "Decoration Plan"}</div>
          {a.styleNote && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3, lineHeight: 1.4 }}>{a.styleNote}</div>}
        </div>
        <button onClick={reset}
          style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>↩</button>
      </div>

      {/* Summary */}
      {a.spaceSummary && (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(196,122,46,0.05)", border: "1px solid rgba(196,122,46,0.12)", fontSize: 13, color: "#4A2810", lineHeight: 1.6, marginBottom: 16 }}>
          {a.spaceSummary}
        </div>
      )}

      {/* Colour palette */}
      {a.colorPalette?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Recommended palette</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {a.colorPalette.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1.5px solid rgba(196,122,46,0.12)", borderRadius: 10, padding: "6px 10px" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: c.hex, flexShrink: 0, border: "2px solid rgba(0,0,0,0.08)" }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK, lineHeight: 1 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top picks */}
      {a.topPicks?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Top picks for this space</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {a.topPicks.map((p, i) => (
              <div key={i} style={{ background: "#fff", border: "1.5px solid rgba(196,122,46,0.15)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, flex: 1 }}>{p.title}</div>
                  {p.impact && <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20, ...(IMPACT_STYLE[p.impact] || IMPACT_STYLE.Medium), marginLeft: 8, flexShrink: 0 }}>{p.impact}</span>}
                </div>
                {p.description && <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5, marginBottom: 5 }}>{p.description}</div>}
                {p.cost && <div style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>{p.cost}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decoration zones */}
      {a.decorZones?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <button onClick={() => toggleSection("zones")}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "0 0 10px", fontFamily: F }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.12em" }}>Decoration zones ({a.decorZones.length})</div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2" strokeLinecap="round" style={{ transform: expandSection.zones ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {expandSection.zones && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {a.decorZones.map((z, i) => <ZoneCard key={i} zone={z} index={i} />)}
            </div>
          )}
        </div>
      )}

      {/* Lighting */}
      {a.lighting?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <button onClick={() => toggleSection("lighting")}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "0 0 10px", fontFamily: F }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.12em" }}>Lighting suggestions</div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2" strokeLinecap="round" style={{ transform: expandSection.lighting ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {expandSection.lighting && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {a.lighting.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#fff", border: "1.5px solid rgba(196,122,46,0.1)" }}>
                  <span style={{ flexShrink: 0 }}>💡</span>
                  <span style={{ fontSize: 13, color: INK, lineHeight: 1.5 }}>{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      {a.tips?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => toggleSection("tips")}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "0 0 10px", fontFamily: F }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.12em" }}>Pro tips</div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2" strokeLinecap="round" style={{ transform: expandSection.tips ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {expandSection.tips && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {a.tips.map((t, i) => (
                <div key={i} style={{ fontSize: 12, color: "#4A2810", padding: "7px 12px", borderRadius: 10, background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.12)", lineHeight: 1.5 }}>✦ {t}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={sendToChat}
          style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,#2C1A0E,#4A2810)`, color: "#CCAB4A", fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 4px 16px rgba(44,26,14,0.25)" }}>
          💬 Share with Tendr Team
        </button>
        <button onClick={reset}
          style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: GOLD, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
          New Photo
        </button>
      </div>
    </div>
  );
}

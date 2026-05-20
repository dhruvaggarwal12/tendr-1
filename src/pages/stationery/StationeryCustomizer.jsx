import React, { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TEMPLATES, FIELDS } from "./templates";
import { RENDERERS } from "./TemplateRenderer";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";

const font = "'Outfit', sans-serif";
const BLANK = { coupleName: "", date: "", day: "", time: "", venue: "", rsvp: "" };

function DownloadButton({ cardRef, filename }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleDownload = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `${filename || "stationery"}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      setStatus("done");
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
        background: loading ? "#D4B870" : "linear-gradient(135deg,#C9A84C,#D4B86A)",
        color: "#FFF", fontSize: 14, fontWeight: 700, fontFamily: font,
        cursor: loading ? "wait" : "pointer", letterSpacing: "0.06em",
        boxShadow: "0 4px 14px rgba(201,168,76,0.35)", transition: "all 0.18s",
      }}
    >
      {loading ? "Generating…" : status === "done" ? "Downloaded!" : status === "error" ? "Error — try again" : "Download PNG"}
    </button>
  );
}

function ShareButton({ data, templateName }) {
  const [copied, setCopied] = useState(false);

  const buildText = () => {
    const lines = [`*${data.coupleName || "Our Wedding"}*`];
    if (data.date) lines.push(`📅 ${data.date}`);
    if (data.day) lines.push(`🗓️ ${data.day}`);
    if (data.time) lines.push(`🕐 ${data.time}`);
    if (data.venue) lines.push(`📍 ${data.venue}`);
    if (data.rsvp) lines.push(`✉️ RSVP: ${data.rsvp}`);
    return lines.join("\n");
  };

  const handleShare = () => {
    const text = buildText();
    if (navigator.share) {
      navigator.share({ title: data.coupleName || "Wedding Invite", text });
    } else {
      const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(wa, "_blank");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button
        onClick={handleShare}
        style={{
          flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #25D366",
          background: "transparent", color: "#25D366", fontSize: 13, fontWeight: 700,
          fontFamily: font, cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.18s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#25D366"; e.currentTarget.style.color = "#FFF"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#25D366"; }}
      >
        Share via WhatsApp
      </button>
      <button
        onClick={handleCopy}
        style={{
          flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid rgba(201,168,76,0.4)",
          background: "transparent", color: "#9B7450", fontSize: 13, fontWeight: 600,
          fontFamily: font, cursor: "pointer", transition: "all 0.18s",
        }}
      >
        {copied ? "Copied!" : "Copy Text"}
      </button>
    </div>
  );
}

// ── Design customisation presets ─────────────────────────────────────────────
const COLOR_PALETTES = [
  { label: "Original",    bg: null,      accent: null,      text: null      },
  { label: "Rose Gold",   bg: "#FDF0F0", accent: "#B87070", text: "#4A1A1A" },
  { label: "Midnight",    bg: "#0D1020", accent: "#8B9EFF", text: "#E8EAFF" },
  { label: "Forest",      bg: "#EFF5EE", accent: "#3A7D44", text: "#1A3A1F" },
  { label: "Champagne",   bg: "#FDF8EE", accent: "#B8860B", text: "#2C1A00" },
  { label: "Lavender",    bg: "#F3F0FC", accent: "#7C5CBF", text: "#2D1F4F" },
  { label: "Rust",        bg: "#FBF1EC", accent: "#C1440E", text: "#3D1A09" },
  { label: "Slate",       bg: "#F2F4F6", accent: "#4A6FA5", text: "#1A2940" },
];

const FONT_PAIRS = [
  { label: "Classic",   script: "'Great Vibes', cursive",            body: "'Cormorant Garamond', serif",  url: "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:wght@300;400;600&display=swap" },
  { label: "Modern",    script: "'Dancing Script', cursive",          body: "'Outfit', sans-serif",          url: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Outfit:wght@400;700&display=swap" },
  { label: "Elegant",   script: "'Playfair Display', serif",         body: "'Lato', sans-serif",            url: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Lato:wght@400;700&display=swap" },
  { label: "Romantic",  script: "'Sacramento', cursive",              body: "'EB Garamond', serif",          url: "https://fonts.googleapis.com/css2?family=Sacramento&family=EB+Garamond:wght@400;600&display=swap" },
  { label: "Bold",      script: "'Abril Fatface', cursive",          body: "'Raleway', sans-serif",         url: "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Raleway:wght@400;700&display=swap" },
];

const TEXT_SIZES = [
  { label: "S", scale: 0.88 },
  { label: "M", scale: 1.0  },
  { label: "L", scale: 1.14 },
];

export default function StationeryCustomizer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const template = TEMPLATES.find(t => t.id === id);
  const Renderer = RENDERERS[id];

  const [data, setData] = useState({ ...BLANK });
  const [palette, setPalette] = useState(0);   // index into COLOR_PALETTES
  const [fontIdx, setFontIdx] = useState(0);   // index into FONT_PAIRS
  const [sizeIdx, setSizeIdx] = useState(1);   // 0=S 1=M 2=L
  const [designTab, setDesignTab] = useState("text"); // "text"|"style"

  // Load font when changed
  React.useEffect(() => {
    const fp = FONT_PAIRS[fontIdx];
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = fp.url;
    document.head.appendChild(link);
  }, [fontIdx]);

  const ov = {
    bg:     COLOR_PALETTES[palette].bg,
    accent: COLOR_PALETTES[palette].accent,
    text:   COLOR_PALETTES[palette].text,
  };

  const textScale = TEXT_SIZES[sizeIdx].scale;

  const onChange = useCallback((key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  if (!template || !Renderer) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8F4EF", fontFamily: font }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#9B7450", marginBottom: 12 }}>Template not found.</p>
          <button onClick={() => navigate("/stationery")} style={{ color: "#C9A84C", background: "none", border: "none", cursor: "pointer", fontFamily: font, fontSize: 14 }}>← Back to Gallery</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3EFE9", fontFamily: font }}>
      <SEO
        title={`${template.name} — Wedding Stationery | Tendr`}
        description={`Customise the ${template.name} stationery design online.`}
        path={`/stationery/${id}`}
      />
      <BasicSpeedDial />
      <HamburgerNav title={template.name} />

      {/* Top bar */}
      <div style={{ background: "#FFF", borderBottom: "1px solid rgba(201,168,76,0.18)", padding: "12px 28px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 20 }}>
        <button
          onClick={() => navigate("/stationery")}
          style={{ fontSize: 13, color: "#9B7450", background: "none", border: "none", cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 5, padding: "4px 0" }}
        >
          ← Gallery
        </button>
        <div style={{ width: 1, height: 18, background: "#EDE6D8" }} />
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, color: "#1C1208", fontWeight: 400 }}>{template.name}</span>
        <span style={{ fontSize: 11, background: "#FEF9EC", color: "#C9A84C", padding: "3px 9px", borderRadius: 20, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{template.category}</span>
      </div>

      {/* Main layout */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 58px)", gap: 0 }} className="customizer-layout">

        {/* Left — live preview */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 32px", background: "#F3EFE9", overflowX: "auto" }}>
          <div ref={cardRef} style={{ transformOrigin: "top center", transform: `scale(${textScale})`, transformOrigin: "top center" }}>
            <Renderer d={data} onChange={onChange} mini={false} ov={ov} />
          </div>
        </div>

        {/* Right — sidebar */}
        <div style={{ width: 360, background: "#FFF", borderLeft: "1px solid rgba(201,168,76,0.15)", overflowY: "auto", display: "flex", flexDirection: "column" }} className="customizer-sidebar">

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(201,168,76,0.15)", flexShrink: 0 }}>
            {[["text","✏️ Text"], ["style","🎨 Style"]].map(([t, label]) => (
              <button key={t} onClick={() => setDesignTab(t)}
                style={{ flex: 1, padding: "14px 0", border: "none", background: "transparent", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer",
                  color: designTab === t ? "#C9A84C" : "#9B7450",
                  borderBottom: designTab === t ? "2.5px solid #C9A84C" : "2.5px solid transparent" }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: "24px 24px 48px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>

          {/* ── TEXT TAB ── */}
          {designTab === "text" && (
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 400, color: "#1C1208", margin: "0 0 18px" }}>Edit Details</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {FIELDS.map(({ key, label, placeholder }) => (
                  <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9B7450" }}>{label}</span>
                    <input
                      type="text"
                      value={data[key]}
                      onChange={e => onChange(key, e.target.value)}
                      placeholder={placeholder}
                      style={{
                      padding: "10px 12px", borderRadius: 8, border: "1.5px solid rgba(201,168,76,0.25)",
                      fontFamily: font, fontSize: 13.5, color: "#1C1208", background: "#FDFCF8",
                      outline: "none", transition: "border-color 0.18s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")}
                  />
                </label>
              ))}
            </div>

              {/* Tip */}
              <div style={{ background: "#FEF9EC", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(201,168,76,0.2)", marginTop: 8 }}>
                <p style={{ fontSize: 12.5, color: "#9B7450", margin: 0, lineHeight: 1.55 }}>
                  <strong style={{ color: "#C9A84C" }}>Tip:</strong> Click any field in the preview to edit it directly.
                </p>
              </div>
            </div>
          )}

          {/* ── STYLE TAB ── */}
          {designTab === "style" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Colour palette */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7450", margin: "0 0 14px" }}>Colour Palette</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {COLOR_PALETTES.map((p, i) => (
                    <button key={i} onClick={() => setPalette(i)}
                      title={p.label}
                      style={{ borderRadius: 10, overflow: "hidden", border: palette === i ? "2.5px solid #C9A84C" : "2px solid rgba(201,168,76,0.2)", cursor: "pointer", padding: 0, background: "none" }}>
                      <div style={{ height: 36, background: p.bg || "#F8F4EF", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        {p.accent && <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.accent }} />}
                        {p.text   && <div style={{ width: 8,  height: 8,  borderRadius: "50%", background: p.text }} />}
                        {!p.accent && <span style={{ fontSize: 9, color: "#9B7450", fontFamily: font }}>Original</span>}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: palette === i ? "#C9A84C" : "#9B7450", padding: "4px 2px", background: "#FFFCF8", textAlign: "center", fontFamily: font }}>{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font pair */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7450", margin: "0 0 14px" }}>Font Style</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {FONT_PAIRS.map((fp, i) => (
                    <button key={i} onClick={() => setFontIdx(i)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, border: fontIdx === i ? "2px solid #C9A84C" : "1.5px solid rgba(201,168,76,0.2)", background: fontIdx === i ? "rgba(201,168,76,0.06)" : "transparent", cursor: "pointer", fontFamily: font }}>
                      <span style={{ fontSize: 14, fontFamily: fp.script, color: "#2C1A0E" }}>Aa</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: fontIdx === i ? "#C9A84C" : "#9B7450" }}>{fp.label}</span>
                      {fontIdx === i && <span style={{ fontSize: 10, color: "#C9A84C" }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text size */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7450", margin: "0 0 14px" }}>Text Size</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {TEXT_SIZES.map((sz, i) => (
                    <button key={i} onClick={() => setSizeIdx(i)}
                      style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: sizeIdx === i ? "2px solid #C9A84C" : "1.5px solid rgba(201,168,76,0.2)", background: sizeIdx === i ? "rgba(201,168,76,0.08)" : "transparent", fontSize: sizeIdx === i ? 16 : 13, fontWeight: 700, color: sizeIdx === i ? "#C9A84C" : "#9B7450", cursor: "pointer", fontFamily: font }}>
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset style */}
              <button
                onClick={() => { setPalette(0); setFontIdx(0); setSizeIdx(1); }}
                style={{ padding: "10px 0", borderRadius: 10, border: "1.5px solid rgba(201,168,76,0.2)", background: "transparent", color: "#9B7450", fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer" }}
              >
                Reset to Default Style
              </button>
            </div>
          )}

          {/* ── Save & Share (always visible) ── */}
          <div style={{ borderTop: "1px solid rgba(201,168,76,0.12)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7450", margin: 0 }}>Save & Share</h3>
            <DownloadButton cardRef={cardRef} filename={`${template.id}-stationery`} />
            <ShareButton data={data} templateName={template.name} />
          </div>

          <button
            onClick={() => navigate("/stationery")}
            style={{ padding: "11px 0", borderRadius: 10, border: "1.5px solid rgba(201,168,76,0.3)", background: "transparent", color: "#C9A84C", fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer" }}
          >
            Browse Other Designs
          </button>

          </div>{/* end inner padding div */}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Great+Vibes&family=Outfit:wght@400;600;700&display=swap');
        @media(max-width:768px){
          .customizer-layout{ flex-direction: column !important; }
          .customizer-sidebar{ width: 100% !important; border-left: none !important; border-top: 1px solid rgba(201,168,76,0.15) !important; }
        }
      `}</style>
    </div>
  );
}

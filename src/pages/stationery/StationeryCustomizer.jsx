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

export default function StationeryCustomizer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const template = TEMPLATES.find(t => t.id === id);
  const Renderer = RENDERERS[id];

  const [data, setData] = useState({ ...BLANK });

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
          <div ref={cardRef} style={{ transformOrigin: "top center" }}>
            <Renderer d={data} onChange={onChange} mini={false} />
          </div>
        </div>

        {/* Right — sidebar */}
        <div style={{ width: 340, background: "#FFF", borderLeft: "1px solid rgba(201,168,76,0.15)", padding: "28px 24px 48px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }} className="customizer-sidebar">

          {/* Section: Details */}
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
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(201,168,76,0.15)" }} />

          {/* Tip */}
          <div style={{ background: "#FEF9EC", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(201,168,76,0.2)" }}>
            <p style={{ fontSize: 12.5, color: "#9B7450", margin: 0, lineHeight: 1.55 }}>
              <strong style={{ color: "#C9A84C" }}>Tip:</strong> Click directly on any field in the preview to edit it inline, or use the form on the left.
            </p>
          </div>

          {/* Download */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7450", margin: 0 }}>Save & Share</h3>
            <DownloadButton cardRef={cardRef} filename={`${template.id}-stationery`} />
            <ShareButton data={data} templateName={template.name} />
          </div>

          {/* Browse more */}
          <button
            onClick={() => navigate("/stationery")}
            style={{ padding: "11px 0", borderRadius: 10, border: "1.5px solid rgba(201,168,76,0.3)", background: "transparent", color: "#C9A84C", fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer", letterSpacing: "0.04em" }}
          >
            Browse Other Designs
          </button>
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

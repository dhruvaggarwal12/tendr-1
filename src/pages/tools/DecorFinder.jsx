import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import { useChatOverlay } from "../../context/ChatContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const font = "'Outfit', sans-serif";

// ── Quiz questions ──────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "vibe",
    q: "What's the overall vibe you want?",
    options: [
      { value: "colorful", label: "Colorful & Fun", emoji: "🎉" },
      { value: "elegant",  label: "Elegant & Classic", emoji: "✨" },
      { value: "earthy",   label: "Natural & Earthy", emoji: "🌿" },
      { value: "clean",    label: "Clean & Simple", emoji: "⬜" },
    ],
  },
  {
    id: "palette",
    q: "Pick a color palette",
    options: [
      { value: "bold",    label: "Bold & Vibrant", emoji: "🌈" },
      { value: "pastel",  label: "Soft Pastels", emoji: "🌸" },
      { value: "warm",    label: "Earthy & Warm", emoji: "🍂" },
      { value: "neutral", label: "White & Neutral", emoji: "🤍" },
    ],
  },
  {
    id: "budget",
    q: "What's your decoration budget?",
    options: [
      { value: "low",    label: "Under ₹15,000", emoji: "💰" },
      { value: "mid",    label: "₹15,000 – ₹35,000", emoji: "💰💰" },
      { value: "high",   label: "₹35,000 – ₹60,000", emoji: "💰💰💰" },
      { value: "luxury", label: "Above ₹60,000", emoji: "👑" },
    ],
  },
  {
    id: "event",
    q: "What's the occasion?",
    options: [
      { value: "birthday",    label: "Birthday", emoji: "🎂" },
      { value: "wedding",     label: "Wedding / Engagement", emoji: "💍" },
      { value: "anniversary", label: "Anniversary", emoji: "💑" },
      { value: "corporate",   label: "Corporate / Party", emoji: "🏢" },
    ],
  },
  {
    id: "element",
    q: "Must-have décor element?",
    options: [
      { value: "flowers",   label: "Fresh Flowers", emoji: "🌺" },
      { value: "lights",    label: "Statement Lighting", emoji: "💡" },
      { value: "balloons",  label: "Balloons", emoji: "🎈" },
      { value: "backdrop",  label: "Backdrop / Stage", emoji: "🖼️" },
    ],
  },
];

// ── Theme scoring ──────────────────────────────────────────────────────────
function scoreThemes(answers) {
  const scores = {
    "Floral":              0,
    "Balloon Art":         0,
    "Lighting":            0,
    "Themed Decoration":   0,
    "Traditional":         0,
    "Modern":              0,
    "Rustic":              0,
    "Minimalist":          0,
  };

  const { vibe, palette, event, element } = answers;

  // Vibe signals
  if (vibe === "colorful")  { scores["Balloon Art"] += 3; scores["Themed Decoration"] += 2; scores["Floral"] += 1; }
  if (vibe === "elegant")   { scores["Floral"] += 3; scores["Modern"] += 2; scores["Minimalist"] += 1; }
  if (vibe === "earthy")    { scores["Rustic"] += 3; scores["Traditional"] += 2; scores["Floral"] += 1; }
  if (vibe === "clean")     { scores["Minimalist"] += 3; scores["Modern"] += 2; scores["Lighting"] += 1; }

  // Palette signals
  if (palette === "bold")    { scores["Balloon Art"] += 2; scores["Themed Decoration"] += 2; scores["Lighting"] += 1; }
  if (palette === "pastel")  { scores["Floral"] += 3; scores["Minimalist"] += 1; scores["Balloon Art"] += 1; }
  if (palette === "warm")    { scores["Rustic"] += 3; scores["Traditional"] += 2; }
  if (palette === "neutral") { scores["Minimalist"] += 3; scores["Modern"] += 2; }

  // Event signals
  if (event === "birthday")    { scores["Balloon Art"] += 2; scores["Themed Decoration"] += 3; }
  if (event === "wedding")     { scores["Floral"] += 3; scores["Traditional"] += 2; }
  if (event === "anniversary") { scores["Floral"] += 2; scores["Minimalist"] += 2; scores["Lighting"] += 1; }
  if (event === "corporate")   { scores["Modern"] += 3; scores["Minimalist"] += 2; scores["Lighting"] += 2; }

  // Element signals
  if (element === "flowers")  { scores["Floral"] += 4; scores["Traditional"] += 2; scores["Rustic"] += 1; }
  if (element === "lights")   { scores["Lighting"] += 4; scores["Modern"] += 2; }
  if (element === "balloons") { scores["Balloon Art"] += 4; scores["Themed Decoration"] += 2; }
  if (element === "backdrop") { scores["Themed Decoration"] += 3; scores["Modern"] += 2; scores["Minimalist"] += 1; }

  return scores;
}

function topThemes(answers) {
  const scores = scoreThemes(answers);
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([theme]) => theme);
}

// ── What you get (theme × budget) ──────────────────────────────────────────
const COMBOS = {
  "Floral": {
    low:    ["Simple fresh flower centrepiece", "Entrance marigold garland", "Stage bouquet arrangement", "1 floral arch (basic)", "Petals floor spread"],
    mid:    ["5–7 table centrepieces", "Floral entrance arch / gate", "Stage floral arrangement", "Bride & groom chair florals", "Aisle petal décor"],
    high:   ["10+ premium centrepieces", "Full floral ceiling installation", "Floral arch + aisle", "Bridal throne florals", "Fresh hanging florals on canopy"],
    luxury: ["Exotic bloom ceiling drape", "Full floral walls", "Suspended floral chandelier", "Luxury bridal stage with orchids / peonies", "Custom floral monogram"],
  },
  "Balloon Art": {
    low:    ["6-ft balloon arch", "3–4 balloon bouquets", "Helium cluster ceiling", "Foil number/letter balloons", "Basic organic garland (4 ft)"],
    mid:    ["Large balloon arch (12+ ft)", "Organic balloon garland (full table)", "Chrome/metallic balloons", "Ceiling cluster with streamers", "Custom colour scheme setup"],
    high:   ["Multiple balloon arches", "Balloon photo backdrop wall", "Balloon ceiling installation", "Balloon columns (4 pillars)", "Chrome + confetti mix balloons"],
    luxury: ["Full room balloon installation", "Balloon drop setup", "Giant balloon columns (8 ft+)", "Custom printed balloons", "Air-filled mosaic balloon art"],
  },
  "Lighting": {
    low:    ["Basic fairy string lights", "2–3 spotlights", "LED tea light candles", "Warm mood strip lights", "Simple coloured uplights"],
    mid:    ["Fairy lights + paper lanterns", "LED uplighting (4 points)", "LED floor lighting", "Starry ceiling string arrangement", "Coloured wash lights"],
    high:   ["LED par cans uplighting (8+)", "Gobo/monogram projections", "Starry ceiling truss effect", "Moving beam lights", "Ambient fog + light combo"],
    luxury: ["Full truss lighting rig", "Moving-head wash fixtures", "Intelligent lighting console", "Laser effects + haze", "LED video panel (backdrop)"],
  },
  "Themed Decoration": {
    low:    ["Theme backdrop (printed flex)", "2–3 colour balloons", "Simple table setup", "Name / age cutout", "Basic props set"],
    mid:    ["Custom theme backdrop", "Balloon garlands", "Character / theme cutouts", "LED fairy lights + table", "Photo-worthy entry gate"],
    high:   ["Immersive theme set", "Photo booth corner + props", "Step-and-repeat backdrop", "LED uplighting", "Custom neon word sign"],
    luxury: ["Premium branded theme", "Fog / bubble machine", "Giant props + stage", "Custom fabric draping", "Neon signs + acrylic elements"],
  },
  "Traditional": {
    low:    ["Marigold garlands (entry + stage)", "Mango leaf torans", "Terracotta diyas (20 pcs)", "Simple rangoli (stencil)", "Coconut & kalash setup"],
    mid:    ["Marigold arch (8 ft)", "Brass diya arrangement", "Hand-drawn floral rangoli", "Traditional fabric draping", "Floral mandap (basic)"],
    high:   ["Full mandap setup (basic)", "Kalash + coconut pillar décor", "Elaborate flower floor pattern", "Traditional entrance gate", "Brass + marigold stage arch"],
    luxury: ["Premium silk-draped mandap", "Hanging brass diyas chandelier", "Full-room marigold installation", "Elaborate artisan rangoli", "Traditional phoolon ki chadar"],
  },
  "Modern": {
    low:    ["Geometric balloon art", "Metallic streamers", "Simple monochrome setup", "Acrylic table number stands", "LED fairy lights"],
    mid:    ["Geometric backdrop panels", "Acrylic + mirror table décor", "LED letter marquee", "Mirror board installation", "Sleek draping (2 colour)"],
    high:   ["Neon sign (custom text)", "Floating geometric installation", "Small LED wall panel", "Custom monogram projection", "Premium acrylic + chrome décor"],
    luxury: ["Full LED video wall", "Suspended geometric art ceiling", "Custom neon sculptures", "Premium metallic draping", "Luxury architectural lighting"],
  },
  "Rustic": {
    low:    ["Burlap table runners", "Mason jar centrepieces", "Twine + fairy lights", "Simple wooden name board", "Wildflower mini-bunches"],
    mid:    ["Wooden pallet backdrop", "Macramé wall hanging", "Sunflower / wildflower arrangements", "Hanging lanterns (6 pcs)", "Edison bulb string lights"],
    high:   ["Wooden arch (8 ft)", "Hay bale seating accent", "Full Edison bulb canopy", "Hanging lanterns + greenery", "Rustic centrepieces (8 tables)"],
    luxury: ["Full barn-style setup", "Custom wooden signage collection", "Hanging floral + ivy greenery wall", "Vintage furniture accent pieces", "Antique lantern + candle arrangement"],
  },
  "Minimalist": {
    low:    ["White / nude balloon column", "Single-colour rose centrepiece", "Clean white table linen", "Minimalist name board", "Simple LED strip lighting"],
    mid:    ["Sleek acrylic signage", "Monochrome balloon garland", "Minimal white floral arch", "Subtle warm mood lighting", "Clean draping (single colour)"],
    high:   ["Premium white draping (full stage)", "Geometric white arch", "Luxury white + green florals", "Architectural spot lighting", "Marble-print table props"],
    luxury: ["Bespoke luxury minimal stage", "Crystal centrepieces", "Premium monotone floral walls", "Architectural lighting design", "Custom minimalist monogram installation"],
  },
};

const BUDGET_LABEL = { low: "Under ₹15,000", mid: "₹15,000 – ₹35,000", high: "₹35,000 – ₹60,000", luxury: "Above ₹60,000" };
const THEME_EMOJI  = {
  "Floral": "🌸", "Balloon Art": "🎈", "Lighting": "💡", "Themed Decoration": "🎭",
  "Traditional": "🪔", "Modern": "✨", "Rustic": "🍂", "Minimalist": "⬜",
};

// ── Component ───────────────────────────────────────────────────────────────
export default function DecorFinder() {
  const navigate = useNavigate();
  const { openVendorChat } = useChatOverlay();
  const [step, setStep]         = useState(0); // 0 = quiz, 1 = result
  const [qIdx, setQIdx]         = useState(0);
  const [answers, setAnswers]   = useState({});
  const [copied, setCopied]     = useState(null);
  const [byTheme, setByTheme]   = useState({});
  const [photoIdx, setPhotoIdx] = useState({}); // { [theme]: currentIndex }

  useEffect(() => {
    fetch(`${BASE_URL}/gallery`)
      .then(r => r.ok ? r.json() : {})
      .then(d => { if (d.byTheme) setByTheme(d.byTheme); })
      .catch(() => {});
  }, []);

  const pick = (val) => {
    const newAnswers = { ...answers, [QUESTIONS[qIdx].id]: val };
    setAnswers(newAnswers);
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      setStep(1);
    }
  };

  const themes     = useMemo(() => (step === 1 ? topThemes(answers) : []), [answers, step]);
  const budgetKey  = answers.budget || "mid";
  const primaryTheme = themes[0];

  const copyChecklist = (theme) => {
    const items = COMBOS[theme]?.[budgetKey] || [];
    const txt = `🎨 ${theme} — ${BUDGET_LABEL[budgetKey]}\n` +
      items.map((i, idx) => `${idx + 1}. ✅ ${i}`).join("\n") +
      "\n\nPowered by Tendr.co.in";
    navigator.clipboard.writeText(txt).then(() => {
      setCopied(theme);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const goToVendors = (theme) => {
    navigate(`/listings?serviceType=Decorator&theme=${encodeURIComponent(theme)}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: font }}>
      <HamburgerNav title="Decor Finder" />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎨</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Find Your Perfect Décor
          </h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0, lineHeight: 1.6 }}>
            Answer 5 quick questions → get your personalised décor theme + a budget breakdown
          </p>
        </div>

        {/* ── QUIZ ── */}
        {step === 0 && (
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(44,26,14,0.08)", border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden" }}>

            {/* Progress bar */}
            <div style={{ height: 4, background: "rgba(196,122,46,0.1)" }}>
              <div style={{ height: "100%", width: `${((qIdx + 1) / QUESTIONS.length) * 100}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", transition: "width 0.35s ease", borderRadius: 4 }} />
            </div>

            <div style={{ padding: "28px 24px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
                Question {qIdx + 1} of {QUESTIONS.length}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 22px", lineHeight: 1.3 }}>
                {QUESTIONS[qIdx].q}
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {QUESTIONS[qIdx].options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => pick(opt.value)}
                    style={{
                      padding: "16px 14px", borderRadius: 14,
                      border: "2px solid rgba(196,122,46,0.2)",
                      background: "#FFFCF5", cursor: "pointer", fontFamily: font,
                      textAlign: "center", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.background = "rgba(196,122,46,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.2)"; e.currentTarget.style.background = "#FFFCF5"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{opt.label}</div>
                  </button>
                ))}
              </div>

              {qIdx > 0 && (
                <button onClick={() => setQIdx(qIdx - 1)}
                  style={{ marginTop: 16, background: "none", border: "none", color: "#9B7450", fontSize: 13, cursor: "pointer", fontFamily: font }}>
                  ← Back
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Top theme card */}
            <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 20, padding: "24px 22px", color: "#fff" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(204,171,74,0.8)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Your Décor Profile</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <span style={{ fontSize: 44 }}>{THEME_EMOJI[primaryTheme] || "🎨"}</span>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px", color: "#CCAB4A" }}>{primaryTheme}</h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", margin: 0 }}>{BUDGET_LABEL[budgetKey]}</p>
                </div>
              </div>
              {themes[1] && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  Also matches: <span style={{ color: "#CCAB4A", fontWeight: 700 }}>{themes[1]}</span>
                </div>
              )}
            </div>

            {/* What you get checklist for top 2 themes */}
            {themes.map(theme => {
              const items = COMBOS[theme]?.[budgetKey] || [];
              const themePhotos = byTheme[theme] || [];
              const curIdx = photoIdx[theme] || 0;
              const curPhoto = themePhotos[curIdx];

              return (
                <div key={theme} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden" }}>
                  <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(196,122,46,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E" }}>
                        {THEME_EMOJI[theme]} {theme}
                      </div>
                      <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>
                        What ₹{budgetKey === "low" ? "15K" : budgetKey === "mid" ? "15–35K" : budgetKey === "high" ? "35–60K" : "60K+"} gets you
                      </div>
                    </div>
                    <button
                      onClick={() => copyChecklist(theme)}
                      style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: copied === theme ? "#22c55e" : "transparent", color: copied === theme ? "#fff" : "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "all 0.2s" }}
                    >
                      {copied === theme ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>

                  {/* Real photos from DB */}
                  {themePhotos.length > 0 && (
                    <>
                    <div style={{ position: "relative", background: "#1a0a00" }}>
                      <img
                        src={curPhoto.imageUrl}
                        alt={curPhoto.caption || theme}
                        style={{ width: "100%", height: 200, objectFit: "cover", display: "block", opacity: 0.92 }}
                      />
                      {/* Nav arrows */}
                      {themePhotos.length > 1 && (
                        <>
                          <button onClick={() => setPhotoIdx(p => ({ ...p, [theme]: (curIdx - 1 + themePhotos.length) % themePhotos.length }))}
                            style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                          <button onClick={() => setPhotoIdx(p => ({ ...p, [theme]: (curIdx + 1) % themePhotos.length }))}
                            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
                            {themePhotos.map((_, i) => (
                              <div key={i} onClick={() => setPhotoIdx(p => ({ ...p, [theme]: i }))}
                                style={{ width: i === curIdx ? 18 : 6, height: 6, borderRadius: 3, background: i === curIdx ? "#CCAB4A" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.2s" }} />
                            ))}
                          </div>
                        </>
                      )}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.65))", padding: "22px 14px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                        {curPhoto.vendorName && (
                          <span style={{ fontSize: 12, color: "#CCAB4A", fontWeight: 700 }}>by {curPhoto.vendorName}</span>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                          {curPhoto.caption && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{curPhoto.caption}</span>}
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginLeft: "auto" }}>{curIdx + 1}/{themePhotos.length}</span>
                        </div>
                      </div>
                    </div>
                    {/* Chat button + show all theme vendors */}
                    {curPhoto.vendorId && curPhoto.vendorName && (
                      <div style={{ padding: "10px 18px 0", display: "flex", flexDirection: "column", gap: 8 }}>
                        <button
                          onClick={() => openVendorChat({ _id: curPhoto.vendorId, name: curPhoto.vendorName, serviceType: "Decorator" })}
                          style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 12px rgba(196,122,46,0.28)", letterSpacing: "0.01em" }}
                        >
                          Chat with {curPhoto.vendorName} →
                        </button>
                        <button
                          onClick={() => goToVendors(theme)}
                          style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}
                        >
                          Show all {theme} vendors →
                        </button>
                      </div>
                    )}
                    </>
                  )}

                  <div style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {items.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1.5px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#16a34a", flexShrink: 0, marginTop: 1 }}>✓</div>
                          <span style={{ fontSize: 13.5, color: "#2C1A0E", lineHeight: 1.4 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: "0 18px 16px", display: "flex", gap: 10 }}>
                    <button onClick={() => goToVendors(theme)}
                      style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                      Show Me {theme} Vendors →
                    </button>
                  </div>
                </div>
              );
            })}

            {/* All themes reference */}
            <details style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden" }}>
              <summary style={{ padding: "14px 18px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#2C1A0E", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>📖 Browse all themes for your budget</span>
                <span style={{ fontSize: 12, color: "#C47A2E" }}>Expand →</span>
              </summary>
              <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(COMBOS).map(([th, bands]) => {
                  const items = bands[budgetKey] || [];
                  const thPhoto = byTheme[th]?.[0];
                  return (
                    <div key={th}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        {thPhoto ? (
                          <img src={thPhoto.imageUrl} alt={th} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <span style={{ fontSize: 22 }}>{THEME_EMOJI[th]}</span>
                        )}
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E" }}>{th}</div>
                          <div style={{ fontSize: 11, color: "#9B7450" }}>{BUDGET_LABEL[budgetKey]}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {items.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                            <span style={{ color: "#22c55e", fontSize: 12, marginTop: 1 }}>✓</span>
                            <span style={{ fontSize: 13, color: "#4A2810" }}>{item}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => goToVendors(th)}
                        style={{ marginTop: 8, padding: "7px 16px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                        Find {th} Vendors →
                      </button>
                    </div>
                  );
                })}
              </div>
            </details>

            {/* Restart */}
            <button onClick={() => { setStep(0); setQIdx(0); setAnswers({}); }}
              style={{ padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 13, cursor: "pointer", fontFamily: font }}>
              ↩ Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

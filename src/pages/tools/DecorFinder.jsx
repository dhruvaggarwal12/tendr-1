import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import { useChatOverlay } from "../../context/ChatContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const font = "'Outfit', sans-serif";

// ── Static option photos (fallbacks when DB photos not yet loaded) ──────────
const OPT_PHOTOS = {
  wowed:    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=160&q=70",
  cosy:     "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=160&q=70",
  fun:      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=160&q=70",
  elegant:  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=160&q=70",
  home:     "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=160&q=70",
  venue:    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=160&q=70",
  outdoor:  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=160&q=70",
  office:   "https://images.unsplash.com/photo-1497366216548-37526070297c?w=160&q=70",
  trad_yes: "https://images.unsplash.com/photo-1621116012704-5de74ee8ad8c?w=160&q=70",
  trad_no:  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=160&q=70",
  flowers:  "https://images.unsplash.com/photo-1490750967868-88df5691cc5a?w=160&q=70",
  balloons: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=160&q=70",
  candles:  "https://images.unsplash.com/photo-1544948503-7ad532b0f18c?w=160&q=70",
  lights:   "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=160&q=70",
  backdrop: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=160&q=70",
  surprise: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=160&q=70",
  theme_yes:"https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=160&q=70",
  theme_no: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=160&q=70",
};

// Photo choice themes shown in Q4 — one real photo per theme from DB
const PHOTO_Q_THEMES = ["Floral", "Balloon Art", "Modern", "Rustic"];

// ── New scoring ──────────────────────────────────────────────────────────────
function scoreThemes(answers) {
  const scores = { "Floral": 0, "Balloon Art": 0, "Lighting": 0, "Themed Decoration": 0, "Traditional": 0, "Modern": 0, "Rustic": 0, "Minimalist": 0 };
  const { hasTheme, isTraditional, feel, space, photoChoice, elements = [] } = answers;

  // Direct shortcut paths
  if (hasTheme === "yes") return { ...scores, "Themed Decoration": 10 };
  if (isTraditional === "yes") return { ...scores, "Traditional": 10, "Floral": 5 };

  // Feel signals
  if (feel === "wowed")   { scores["Themed Decoration"] += 3; scores["Lighting"] += 3; scores["Modern"] += 2; }
  if (feel === "cosy")    { scores["Rustic"] += 3; scores["Floral"] += 3; scores["Traditional"] += 2; }
  if (feel === "fun")     { scores["Balloon Art"] += 4; scores["Themed Decoration"] += 2; }
  if (feel === "elegant") { scores["Floral"] += 3; scores["Minimalist"] += 3; scores["Modern"] += 2; }

  // Space signals
  if (space === "home")   { scores["Balloon Art"] += 2; scores["Themed Decoration"] += 2; scores["Minimalist"] += 1; }
  if (space === "venue")  { scores["Floral"] += 2; scores["Lighting"] += 2; scores["Modern"] += 2; }
  if (space === "outdoor"){ scores["Rustic"] += 3; scores["Floral"] += 2; scores["Traditional"] += 1; }
  if (space === "office") { scores["Modern"] += 4; scores["Minimalist"] += 3; scores["Lighting"] += 2; }

  // Photo choice — direct +5 signal to chosen theme
  if (photoChoice && scores[photoChoice] !== undefined) scores[photoChoice] += 5;

  // Element multi-select signals
  if (elements.includes("flowers"))  { scores["Floral"] += 4; scores["Traditional"] += 2; scores["Rustic"] += 1; }
  if (elements.includes("balloons")) { scores["Balloon Art"] += 4; scores["Themed Decoration"] += 2; }
  if (elements.includes("candles"))  { scores["Traditional"] += 3; scores["Rustic"] += 2; scores["Minimalist"] += 1; }
  if (elements.includes("lights"))   { scores["Lighting"] += 4; scores["Modern"] += 2; }
  if (elements.includes("backdrop")) { scores["Themed Decoration"] += 3; scores["Modern"] += 2; }

  return scores;
}

function topThemes(answers) {
  const scores = scoreThemes(answers);
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([theme]) => theme);
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

// Quiz questions — all options have photo thumbnails; themed decoration LAST
const QUIZ_STEPS = [
  {
    id: "feel",
    q: "How do you want guests to feel when they walk in?",
    sub: "This shapes everything — décor, lighting, colours",
    options: [
      { value: "wowed",   label: "Completely Wowed",     sub: "Spectacular, jaw-dropping",   photo: OPT_PHOTOS.wowed },
      { value: "cosy",    label: "Cosy & Warm",          sub: "Intimate, homely, comfortable", photo: OPT_PHOTOS.cosy },
      { value: "fun",     label: "Fun & Energetic",      sub: "Vibrant, colourful, exciting",  photo: OPT_PHOTOS.fun },
      { value: "elegant", label: "Elegant & Polished",   sub: "Refined, sophisticated",        photo: OPT_PHOTOS.elegant },
    ],
  },
  {
    id: "isTraditional",
    q: "Is this for a traditional Indian occasion?",
    sub: "Puja, wedding rituals, festival, haldi, mehendi",
    options: [
      { value: "yes", label: "Yes — traditional ceremony", sub: "Marigolds, diyas, mandap", photo: OPT_PHOTOS.trad_yes },
      { value: "no",  label: "No — modern celebration",    sub: "Birthday, anniversary, party", photo: OPT_PHOTOS.trad_no },
    ],
  },
  {
    id: "space",
    q: "Where is the event?",
    sub: "Space changes what's possible",
    options: [
      { value: "home",    label: "At Home",              sub: "Living room / terrace",      photo: OPT_PHOTOS.home },
      { value: "venue",   label: "Venue / Banquet Hall", sub: "Hotel, community hall",      photo: OPT_PHOTOS.venue },
      { value: "outdoor", label: "Outdoor",              sub: "Garden, farmhouse, rooftop", photo: OPT_PHOTOS.outdoor },
      { value: "office",  label: "Office / Corporate",   sub: "Conference room, lobby",     photo: OPT_PHOTOS.office },
    ],
  },
  {
    id: "photoChoice",
    type: "photo-pick",
    q: "Which of these looks closest to what you want?",
    sub: "Pick the one that excites you most",
  },
  {
    id: "elements",
    type: "multiselect",
    q: "Anything you definitely want?",
    sub: "Pick all that apply — or none",
    options: [
      { value: "flowers",  label: "Flowers",    photo: OPT_PHOTOS.flowers },
      { value: "balloons", label: "Balloons",   photo: OPT_PHOTOS.balloons },
      { value: "candles",  label: "Candles",    photo: OPT_PHOTOS.candles },
      { value: "lights",   label: "Lights",     photo: OPT_PHOTOS.lights },
      { value: "backdrop", label: "Backdrop",   photo: OPT_PHOTOS.backdrop },
      { value: "surprise", label: "Surprise me", photo: OPT_PHOTOS.surprise },
    ],
  },
  {
    id: "hasTheme",
    q: "One last thing — do you have a specific theme in mind?",
    sub: "Like Bollywood, superhero, jungle, Barbie, vintage...",
    options: [
      { value: "yes", label: "Yes, I want a specific themed setup", sub: "Character / concept decoration", photo: OPT_PHOTOS.theme_yes },
      { value: "no",  label: "No, just the décor style you suggest", sub: "Based on my answers above",    photo: OPT_PHOTOS.theme_no },
    ],
  },
];

const QUIZ_KEY = 'tendr_decor_quiz';
const QUIZ_TTL = 24 * 60 * 60 * 1000;

// ── Component ───────────────────────────────────────────────────────────────
export default function DecorFinder() {
  const navigate  = useNavigate();
  const { openVendorChat } = useChatOverlay();
  const decorBudget = useSelector(s => s.eventPlanning?.categoryBudgets?.Decorator || null);
  const { token }   = useSelector(s => s.auth);

  // Restore quiz from localStorage (24hr TTL)
  const savedQuiz = (() => {
    try {
      const raw = localStorage.getItem(QUIZ_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (Date.now() - d.__savedAt > QUIZ_TTL) { localStorage.removeItem(QUIZ_KEY); return null; }
      return d;
    } catch { return null; }
  })();

  const [step, setStep]       = useState(savedQuiz ? 1 : 0);
  const [qIdx, setQIdx]       = useState(0);
  const [answers, setAnswers] = useState(savedQuiz?.answers || {});
  const [copied, setCopied]   = useState(null);
  const [byTheme, setByTheme] = useState({});
  const [vendorMap, setVendorMap] = useState({});
  const [selVendor, setSelVendor] = useState({});     // { [theme]: vendorId }
  const [vendorProfile, setVendorProfile] = useState(null); // vendor to show in profile peek
  const [chatFormVendor, setChatFormVendor] = useState(null);
  const [chatForm, setChatForm]             = useState({ venueType: '', guests: '', requirements: '' });

  useEffect(() => {
    fetch(`${BASE_URL}/gallery`)
      .then(r => r.ok ? r.json() : {})
      .then(d => { if (d.byTheme) setByTheme(d.byTheme); })
      .catch(() => {});
    fetch(`${BASE_URL}/vendors?serviceTypes=Decorator&limit=100`)
      .then(r => r.ok ? r.json() : { vendors: [] })
      .then(d => {
        const map = {};
        (d.vendors || []).forEach(v => { map[v._id] = { name: v.name, price: v.price || 0, avgReviewScore: v.avgReviewScore || 0, portfolioPhotos: v.portfolioPhotos || [], _id: v._id }; });
        setVendorMap(map);
      })
      .catch(() => {});
  }, []);

  const saveQuiz = (ans) => { try { localStorage.setItem(QUIZ_KEY, JSON.stringify({ answers: ans, __savedAt: Date.now() })); } catch {} };
  const retakeQuiz = () => { localStorage.removeItem(QUIZ_KEY); setStep(0); setQIdx(0); setAnswers({}); };

  const currentStep = QUIZ_STEPS[qIdx];

  const pick = (fieldId, val, isMulti = false) => {
    let newAnswers;
    if (isMulti) {
      const cur = answers[fieldId] || [];
      const updated = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val];
      newAnswers = { ...answers, [fieldId]: updated };
      setAnswers(newAnswers);
      saveQuiz(newAnswers);
      return; // don't advance — user taps "Continue" for multi-select
    }
    newAnswers = { ...answers, [fieldId]: val };
    setAnswers(newAnswers);
    saveQuiz(newAnswers);
    if (qIdx < QUIZ_STEPS.length - 1) setQIdx(qIdx + 1);
    else setStep(1);
  };

  const advanceMulti = () => {
    if (qIdx < QUIZ_STEPS.length - 1) setQIdx(qIdx + 1);
    else setStep(1);
  };

  const themes       = useMemo(() => (step === 1 ? topThemes(answers) : []), [answers, step]);
  const budgetKey    = (() => {
    if (!decorBudget) return "mid";
    if (decorBudget < 15000) return "low";
    if (decorBudget < 35000) return "mid";
    if (decorBudget < 60000) return "high";
    return "luxury";
  })();

  const inBudget = (vendorId) => {
    if (!decorBudget || !vendorId) return null;
    const v = vendorMap[vendorId];
    if (!v || !v.price) return null;
    return v.price <= decorBudget;
  };

  const copyChecklist = (theme) => {
    const items = COMBOS[theme]?.[budgetKey] || [];
    const txt = `🎨 ${theme} — ${BUDGET_LABEL[budgetKey]}\n` + items.map((it, i) => `${i + 1}. ✅ ${it}`).join("\n") + "\n\nPowered by Tendr.co.in";
    navigator.clipboard.writeText(txt).then(() => { setCopied(theme); setTimeout(() => setCopied(null), 1800); });
  };

  const goToVendors  = (theme) => navigate(`/listings?serviceType=Decorator&theme=${encodeURIComponent(theme)}`);
  const openChatForm = (vendor) => { setChatFormVendor(vendor); setChatForm({ venueType: '', guests: '', requirements: '' }); };
  const submitChatForm = () => { openVendorChat({ ...chatFormVendor, decorFormAnswers: chatForm }); setChatFormVendor(null); };

  // Per-theme vendor groups
  const vendorGroupsFor = (theme) => {
    const photos = byTheme[theme] || [];
    const groups = {};
    photos.forEach(p => {
      if (!p.vendorId) return;
      const vid = p.vendorId.toString();
      if (!groups[vid]) groups[vid] = { vendorId: vid, vendorName: p.vendorName, photos: [] };
      groups[vid].photos.push(p);
    });
    return Object.values(groups);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: font }}>
      <HamburgerNav title="Decor Finder" />

      {/* Vendor profile peek modal */}
      {vendorProfile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: font }}
          onClick={() => setVendorProfile(null)}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#4A2810,#7A4020)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#CCAB4A" }}>{vendorProfile.vendorName}</div>
              <button onClick={() => setVendorProfile(null)} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: "50%", fontSize: 14, cursor: "pointer" }}>✕</button>
            </div>
            {vendorProfile.photos?.length > 0 && (
              <div style={{ display: "flex", gap: 6, padding: "12px 16px 8px", overflowX: "auto" }}>
                {vendorProfile.photos.slice(0, 5).map((p, i) => (
                  <img key={i} src={p.imageUrl} alt="" style={{ width: 80, height: 64, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                ))}
              </div>
            )}
            <div style={{ padding: "8px 16px 16px" }}>
              {vendorMap[vendorProfile.vendorId]?.avgReviewScore > 0 && (
                <div style={{ fontSize: 12, color: "#C47A2E", fontWeight: 700, marginBottom: 4 }}>★ {vendorMap[vendorProfile.vendorId].avgReviewScore.toFixed(1)}</div>
              )}
              {vendorMap[vendorProfile.vendorId]?.price > 0 && (
                <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 10 }}>Starts from ₹{Number(vendorMap[vendorProfile.vendorId].price).toLocaleString("en-IN")}</div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setVendorProfile(null); openChatForm({ _id: vendorProfile.vendorId, name: vendorProfile.vendorName, serviceType: "Decorator" }); }}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Chat →
                </button>
                <button onClick={() => { setVendorProfile(null); navigate(`/listings?serviceType=Decorator`); }}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-chat form modal */}
      {chatFormVendor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: font }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#4A2810,#7A4020)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#CCAB4A" }}>Chat with {chatFormVendor.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Share a few details so they can help you better</div>
              </div>
              <button onClick={() => setChatFormVendor(null)} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Venue Type</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Indoor", "Outdoor", "Both"].map(v => (
                    <button key={v} onClick={() => setChatForm(p => ({ ...p, venueType: v }))}
                      style={{ flex: 1, padding: "9px", borderRadius: 9, border: `2px solid ${chatForm.venueType === v ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: chatForm.venueType === v ? "rgba(196,122,46,0.08)" : "#fff", color: "#2C1A0E", fontSize: 13, fontWeight: chatForm.venueType === v ? 700 : 500, cursor: "pointer", fontFamily: font }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Guest Count</label>
                <input type="number" placeholder="e.g. 50" value={chatForm.guests} onChange={e => setChatForm(p => ({ ...p, guests: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Specific Requirements <span style={{ textTransform: "none", fontWeight: 500 }}>(optional)</span></label>
                <textarea placeholder="Colours, must-have elements, theme references..." value={chatForm.requirements} onChange={e => setChatForm(p => ({ ...p, requirements: e.target.value }))}
                  rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <button onClick={submitChatForm} disabled={chatFormStep === 1}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
                Start Chat with {chatFormVendor.name} →
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: step === 1 ? 1100 : 660, margin: "0 auto", padding: "32px 16px 80px", transition: "max-width 0.3s" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>🎨</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Find Your Perfect Décor</h1>
          <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Answer {QUIZ_STEPS.length} quick questions → get your perfect décor match</p>
        </div>

        {/* ── QUIZ ── */}
        {step === 0 && (
          <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 8px 32px rgba(44,26,14,0.08)", border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden" }}>
            {/* Progress */}
            <div style={{ height: 4, background: "rgba(196,122,46,0.1)" }}>
              <div style={{ height: "100%", width: `${((qIdx + 1) / QUIZ_STEPS.length) * 100}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", transition: "width 0.35s ease", borderRadius: 4 }} />
            </div>

            <div style={{ padding: "26px 22px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
                {qIdx + 1} / {QUIZ_STEPS.length}
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px", lineHeight: 1.3 }}>{currentStep.q}</h2>
              {currentStep.sub && <p style={{ fontSize: 12.5, color: "#9B7450", margin: "0 0 20px" }}>{currentStep.sub}</p>}

              {/* Photo-pick question (Q4) */}
              {currentStep.type === "photo-pick" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {PHOTO_Q_THEMES.map(theme => {
                    const photo = byTheme[theme]?.[0];
                    const isSelected = answers.photoChoice === theme;
                    return (
                      <button key={theme} onClick={() => { pick("photoChoice", theme); }}
                        style={{ borderRadius: 14, border: `3px solid ${isSelected ? "#C47A2E" : "transparent"}`, overflow: "hidden", cursor: "pointer", padding: 0, position: "relative", transform: isSelected ? "scale(1.03)" : "scale(1)", transition: "all 0.18s", boxShadow: isSelected ? "0 6px 20px rgba(196,122,46,0.35)" : "0 2px 8px rgba(0,0,0,0.12)" }}>
                        <img src={photo?.imageUrl || OPT_PHOTOS.elegant} alt={theme}
                          style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.7))", padding: "20px 10px 8px" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{THEME_EMOJI[theme]} {theme}</div>
                        </div>
                        {isSelected && <div style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%", background: "#C47A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>✓</div>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Multi-select (elements) */}
              {currentStep.type === "multiselect" && (
                <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                  {currentStep.options.map(opt => {
                    const sel = (answers.elements || []).includes(opt.value);
                    return (
                      <button key={opt.value} onClick={() => pick("elements", opt.value, true)}
                        style={{ borderRadius: 12, border: `2.5px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.15)"}`, overflow: "hidden", cursor: "pointer", padding: 0, transform: sel ? "scale(1.04)" : "scale(1)", transition: "all 0.15s", boxShadow: sel ? "0 4px 14px rgba(196,122,46,0.3)" : "none" }}>
                        <div style={{ position: "relative" }}>
                          <img src={opt.photo} alt={opt.label} style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }} />
                          {sel && <div style={{ position: "absolute", top: 5, right: 5, width: 20, height: 20, borderRadius: "50%", background: "#C47A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>✓</div>}
                        </div>
                        <div style={{ padding: "6px 8px", background: sel ? "rgba(196,122,46,0.07)" : "#fff" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E", textAlign: "center" }}>{opt.label}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button onClick={advanceMulti}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  {(answers.elements || []).length === 0 ? "Skip →" : `Continue with ${(answers.elements || []).length} selected →`}
                </button>
                </>
              )}

              {/* Standard 2/4 option questions with photo thumbnails */}
              {!currentStep.type && (
                <div style={{ display: "grid", gridTemplateColumns: currentStep.options.length === 2 ? "1fr 1fr" : "1fr 1fr", gap: 12 }}>
                  {currentStep.options.map(opt => {
                    const isSelected = answers[currentStep.id] === opt.value;
                    return (
                      <button key={opt.value} onClick={() => pick(currentStep.id, opt.value)}
                        style={{ borderRadius: 16, border: `3px solid ${isSelected ? "#C47A2E" : "transparent"}`, overflow: "hidden", cursor: "pointer", padding: 0, transition: "all 0.18s", transform: isSelected ? "scale(1.03)" : "scale(1)", boxShadow: isSelected ? "0 6px 20px rgba(196,122,46,0.35)" : "0 2px 10px rgba(0,0,0,0.1)" }}>
                        <div style={{ position: "relative" }}>
                          <img src={opt.photo} alt={opt.label}
                            style={{ width: "100%", height: currentStep.options.length === 2 ? 140 : 110, objectFit: "cover", display: "block" }} />
                          {isSelected && <div style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%", background: "#C47A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>✓</div>}
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.65))", padding: "20px 12px 10px" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{opt.label}</div>
                            {opt.sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{opt.sub}</div>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {qIdx > 0 && (
                <button onClick={() => setQIdx(qIdx - 1)}
                  style={{ marginTop: 14, background: "none", border: "none", color: "#9B7450", fontSize: 13, cursor: "pointer", fontFamily: font }}>
                  ← Back
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── RESULT — Side by side ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 18, padding: "20px 22px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(204,171,74,0.8)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Your 2 Perfect Matches</div>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  {themes.map(t => (
                    <span key={t} style={{ fontSize: 16, fontWeight: 800, color: "#CCAB4A" }}>{THEME_EMOJI[t]} {t}</span>
                  ))}
                </div>
                {decorBudget && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Budget: ₹{Number(decorBudget).toLocaleString("en-IN")} · {BUDGET_LABEL[budgetKey]}</div>}
              </div>
              <button onClick={retakeQuiz}
                style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                ↩ Retake Quiz
              </button>
            </div>

            {/* Side-by-side theme cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="decor-result-grid">
              {themes.map(theme => {
                const items    = COMBOS[theme]?.[budgetKey] || [];
                const vendors  = vendorGroupsFor(theme);
                const curVid   = selVendor[theme] || vendors[0]?.vendorId;
                const curGroup = vendors.find(v => v.vendorId === curVid) || vendors[0];
                const photos   = curGroup?.photos || byTheme[theme] || [];
                const curPhoto = photos[0];

                return (
                  <div key={theme} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.15)", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 14px rgba(196,122,46,0.08)" }}>

                    {/* Theme header */}
                    <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(196,122,46,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#2C1A0E" }}>{THEME_EMOJI[theme]} {theme}</div>
                      <button onClick={() => copyChecklist(theme)}
                        style={{ padding: "5px 12px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.3)", background: copied === theme ? "#22c55e" : "transparent", color: copied === theme ? "#fff" : "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                        {copied === theme ? "✓" : "📋 Copy list"}
                      </button>
                    </div>

                    {/* Main photo */}
                    {curPhoto && (
                      <div style={{ position: "relative", background: "#1a0a00" }}>
                        <img src={curPhoto.imageUrl} alt={theme}
                          style={{ width: "100%", height: 200, objectFit: "cover", display: "block", opacity: 0.92 }} />
                        {/* Download */}
                        <a href={curPhoto.imageUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>⬇</a>
                        {curPhoto.vendorName && (
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.7))", padding: "20px 12px 8px" }}>
                            <span style={{ fontSize: 11, color: "#CCAB4A", fontWeight: 700 }}>by {curPhoto.vendorName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Vendor tabs — scrollable, clickable names */}
                    {vendors.length > 0 && (
                      <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid rgba(196,122,46,0.08)" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
                          {vendors.length} vendor{vendors.length > 1 ? "s" : ""} — tap name to see their work
                        </div>
                        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                          {vendors.map(vg => {
                            const isActive  = vg.vendorId === curVid;
                            const wb        = inBudget(vg.vendorId);
                            return (
                              <div key={vg.vendorId} style={{ flexShrink: 0 }}>
                                <button
                                  onClick={() => setSelVendor(p => ({ ...p, [theme]: vg.vendorId }))}
                                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 100, border: `2px solid ${isActive ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: isActive ? "rgba(196,122,46,0.08)" : "#fff", cursor: "pointer", transform: isActive ? "scale(1.06)" : "scale(1)", transition: "all 0.18s", boxShadow: isActive ? "0 3px 10px rgba(196,122,46,0.25)" : "none", fontFamily: font }}>
                                  <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1.5px solid rgba(196,122,46,0.2)" }}>
                                    {vg.photos[0]?.imageUrl ? <img src={vg.photos[0].imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: "#f3ebe0" }} />}
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: isActive ? 800 : 600, color: isActive ? "#C47A2E" : "#2C1A0E", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vg.vendorName}</span>
                                  {wb !== null && <span style={{ fontSize: 9, color: wb ? "#16a34a" : "#b45309" }}>{wb ? "✓" : "↑"}</span>}
                                </button>
                                {/* Tap vendor name separately to open profile */}
                                {isActive && (
                                  <button onClick={() => setVendorProfile(vg)}
                                    style={{ display: "block", width: "100%", marginTop: 3, fontSize: 10, color: "#C47A2E", background: "none", border: "none", cursor: "pointer", fontFamily: font, textAlign: "center", textDecoration: "underline" }}>
                                    View profile
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* More photos from selected vendor */}
                        {curGroup && curGroup.photos.length > 1 && (
                          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingTop: 8, paddingBottom: 2 }}>
                            {curGroup.photos.slice(0, 5).map((p, pi) => (
                              <div key={pi} style={{ position: "relative", flexShrink: 0 }}>
                                <img src={p.imageUrl} alt="" style={{ width: 58, height: 46, objectFit: "cover", borderRadius: 7, border: `2px solid ${photos[0]?.imageUrl === p.imageUrl ? "#C47A2E" : "transparent"}` }} />
                                <a href={p.imageUrl} target="_blank" rel="noopener noreferrer"
                                  style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>⬇</a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chat button */}
                    {curGroup?.vendorId && (
                      <div style={{ padding: "10px 14px 4px" }}>
                        <button onClick={() => openChatForm({ _id: curGroup.vendorId, name: curGroup.vendorName, serviceType: "Decorator" })}
                          style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 10px rgba(196,122,46,0.28)" }}>
                          Chat with {curGroup.vendorName} →
                        </button>
                      </div>
                    )}

                    {/* Decor checklist */}
                    <div style={{ padding: "10px 14px 14px", flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                        What {BUDGET_LABEL[budgetKey]} gets you
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {items.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1.5px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#16a34a", flexShrink: 0, marginTop: 2 }}>✓</div>
                            <span style={{ fontSize: 12.5, color: "#2C1A0E", lineHeight: 1.4 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => goToVendors(theme)}
                        style={{ marginTop: 10, width: "100%", padding: "7px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                        See all {theme} vendors →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <style>{`@media(max-width:600px){.decor-result-grid{grid-template-columns:1fr!important;}}`}</style>
          </div>
        )}
      </div>
    </div>
  );
}

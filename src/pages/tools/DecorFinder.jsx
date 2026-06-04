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

// ── Scoring — covers all 8 types + 6 venue coverage types ───────────────────
function scoreAll(answers) {
  const scores = { "Floral": 0, "Balloon Art": 0, "Lighting": 0, "Themed Decoration": 0, "Traditional": 0, "Modern": 0, "Rustic": 0, "Minimalist": 0 };
  const coverage = { "Interior": 0, "Exterior": 0, "Full": 0, "Stage Setup": 0, "Entrance focus": 0, "Backdrop": 0 };
  const { occasion, vision, space, style, lighting, entrance, stageBackdrop, hasTheme } = answers;

  // Themed Decoration override (last question)
  if (hasTheme === "yes") { scores["Themed Decoration"] += 8; }

  // Occasion signals
  if (occasion === "birthday" || occasion === "party") { scores["Balloon Art"] += 3; scores["Themed Decoration"] += 3; }
  if (occasion === "wedding")    { scores["Floral"] += 4; scores["Traditional"] += 2; }
  if (occasion === "anniversary"){ scores["Floral"] += 3; scores["Lighting"] += 2; scores["Minimalist"] += 1; }
  if (occasion === "corporate")  { scores["Modern"] += 4; scores["Minimalist"] += 3; }
  if (occasion === "traditional"){ scores["Traditional"] += 5; coverage["Backdrop"] += 1; coverage["Stage Setup"] += 1; }

  // Vision → coverage
  if (vision === "whole")    { coverage["Full"] += 5; coverage["Interior"] += 2; coverage["Exterior"] += 2; }
  if (vision === "stage")    { coverage["Stage Setup"] += 5; scores["Modern"] += 1; scores["Lighting"] += 1; }
  if (vision === "entrance") { coverage["Entrance focus"] += 5; scores["Floral"] += 1; scores["Balloon Art"] += 1; }
  if (vision === "backdrop") { coverage["Backdrop"] += 5; scores["Themed Decoration"] += 1; scores["Modern"] += 1; }

  // Space → coverage + style
  if (space === "indoor")  { coverage["Interior"] += 3; }
  if (space === "outdoor") { coverage["Exterior"] += 3; scores["Rustic"] += 2; scores["Floral"] += 1; }
  if (space === "both")    { coverage["Full"] += 4; coverage["Interior"] += 1; coverage["Exterior"] += 1; }
  if (space === "office")  { coverage["Interior"] += 2; scores["Modern"] += 3; scores["Minimalist"] += 3; }

  // Style (most direct theme signal)
  if (style === "flowers")     { scores["Floral"] += 5; }
  if (style === "balloons")    { scores["Balloon Art"] += 4; scores["Themed Decoration"] += 2; }
  if (style === "traditional") { scores["Traditional"] += 4; scores["Rustic"] += 2; }
  if (style === "clean")       { scores["Minimalist"] += 4; scores["Modern"] += 2; }

  // Lighting (isolates Lighting theme)
  if (lighting === "everything")   { scores["Lighting"] += 6; }
  if (lighting === "fairy")        { scores["Rustic"] += 2; scores["Floral"] += 1; scores["Traditional"] += 1; }
  if (lighting === "somewhat")     { /* neutral */ }
  if (lighting === "notthought")   { /* neutral */ }

  // Entrance coverage
  if (entrance === "dramatic") { coverage["Entrance focus"] += 4; scores["Floral"] += 1; scores["Balloon Art"] += 1; }
  if (entrance === "nice")     { coverage["Entrance focus"] += 2; }
  if (entrance === "simple")   { coverage["Interior"] += 1; }

  // Stage / backdrop coverage
  if (stageBackdrop === "stage")    { coverage["Stage Setup"] += 4; }
  if (stageBackdrop === "backdrop") { coverage["Backdrop"] += 4; scores["Themed Decoration"] += 1; }
  if (stageBackdrop === "maybe")    { coverage["Stage Setup"] += 1; coverage["Backdrop"] += 1; }

  return { scores, coverage };
}

function topThemes(answers) {
  const { scores } = scoreAll(answers);
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([theme]) => theme);
}

function topCoverage(answers) {
  const { coverage } = scoreAll(answers);
  return Object.entries(coverage).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 0).slice(0, 2).map(([c]) => c);
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

// ── Quiz steps — with images specific to each option ──────────────────────────
const QUIZ_STEPS = [
  {
    id: "occasion",
    q: "What's the occasion?",
    sub: "This sets the whole direction",
    options: [
      { value: "birthday",    label: "Birthday",           sub: "Mine or someone I love",         emoji: "🎂", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=75" },
      { value: "wedding",     label: "Wedding",            sub: "The big day",                    emoji: "💍", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=75" },
      { value: "anniversary", label: "Anniversary",        sub: "Worth celebrating properly",     emoji: "💕", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&q=75" },
      { value: "corporate",   label: "Corporate Event",    sub: "Professional but should look good", emoji: "🏢", image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=75" },
      { value: "traditional", label: "Traditional Ceremony", sub: "Puja, haldi, festival, ritual", emoji: "🪔", image: "https://images.unsplash.com/photo-1621116012704-5de74ee8ad8c?w=400&q=75" },
      { value: "party",       label: "Party / Get-together", sub: "Fun, casual, memorable",       emoji: "🎉", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=75" },
    ],
  },
  {
    id: "vision",
    q: "How do you picture the venue?",
    sub: "Go with your gut",
    options: [
      { value: "whole",    label: "Full space transformation", sub: "Every corner decorated",       emoji: "✨", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=75" },
      { value: "stage",    label: "Stunning main stage",       sub: "The centrepiece everyone sees", emoji: "🎭", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=75" },
      { value: "entrance", label: "Wow them at the entrance",  sub: "First impression says it all", emoji: "🚪", image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=75" },
      { value: "backdrop", label: "One beautiful focal wall",  sub: "Perfect for photos & memories", emoji: "📸", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=75" },
    ],
  },
  {
    id: "space",
    q: "Where is it happening?",
    options: [
      { value: "indoor",   label: "Indoors",               sub: "Home, hall, or banquet",         emoji: "🏛", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=75" },
      { value: "outdoor",  label: "Outdoors",              sub: "Garden, terrace, or farmhouse",  emoji: "🌿", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=75" },
      { value: "both",     label: "Both indoor & outdoor", sub: "Large spread, multiple areas",   emoji: "🌐", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=75" },
      { value: "office",   label: "Office / Professional", sub: "Conference hall or workspace",   emoji: "🏢", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=75" },
    ],
  },
  {
    id: "style",
    q: "What's your decoration style?",
    sub: "No wrong answers",
    options: [
      { value: "flowers",     label: "Floral",      sub: "Roses, marigolds, arrangements", emoji: "🌸", image: "https://images.unsplash.com/photo-1490750967868-88df5691cc5a?w=400&q=75" },
      { value: "balloons",    label: "Balloons & Props", sub: "Colourful, playful, festive", emoji: "🎈", image: "https://images.unsplash.com/photo-1559181567-c3190ca9d713?w=400&q=75" },
      { value: "traditional", label: "Traditional", sub: "Familiar, rooted, comfortable",   emoji: "🪔", image: "https://images.unsplash.com/photo-1621116012704-5de74ee8ad8c?w=400&q=75" },
      { value: "clean",       label: "Minimal & Modern", sub: "Sleek, simple, effortless",  emoji: "⬜", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&q=75" },
    ],
  },
  {
    id: "lighting",
    q: "How important is lighting?",
    options: [
      { value: "everything", label: "Lighting IS the décor",   sub: "Fairy lights, uplighting, everything",  emoji: "💡", image: "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=400&q=75" },
      { value: "fairy",      label: "Warm glow as support",    sub: "Décor first, lighting enhances",       emoji: "🕯", image: "https://images.unsplash.com/photo-1544948503-7ad532b0f18c?w=400&q=75" },
      { value: "somewhat",   label: "Nice to have",            sub: "Just not too dark",                    emoji: "🔆", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=75" },
      { value: "notthought", label: "Haven't thought about it", sub: "Guide me",                            emoji: "💭", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=75" },
    ],
  },
  {
    id: "entrance",
    q: "What about the entrance?",
    options: [
      { value: "dramatic", label: "Show-stopping entrance",  sub: "Gate, arch, statement setup",  emoji: "🌟", image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=75" },
      { value: "nice",     label: "A nice arch or gate",     sub: "Sets the tone, not overdone",  emoji: "🌺", image: "https://images.unsplash.com/photo-1490750967868-88df5691cc5a?w=400&q=75" },
      { value: "simple",   label: "Keep it simple",          sub: "Save budget for inside",       emoji: "➡", image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&q=75" },
      { value: "nocare",   label: "Skip it entirely",        sub: "What matters is inside",       emoji: "🏠", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=75" },
    ],
  },
  {
    id: "stageBackdrop",
    q: "Stage or photo backdrop?",
    options: [
      { value: "stage",    label: "Dedicated stage",      sub: "Cake cutting, speeches, key moments", emoji: "🎤", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=75" },
      { value: "backdrop", label: "Photo backdrop wall",  sub: "Everyone poses in front of it",       emoji: "🖼", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=75" },
      { value: "maybe",    label: "Either works",         sub: "Whichever fits better",               emoji: "🔄", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=75" },
      { value: "neither",  label: "Neither needed",       sub: "Not a priority",                      emoji: "✖", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&q=75" },
    ],
  },
  {
    id: "hasTheme",
    q: "Do you have a specific theme?",
    sub: "e.g. Bollywood night, jungle safari, retro 90s, beach vibes...",
    options: [
      { value: "yes", label: "Yes, I have one in mind", sub: "Tell the decorator the concept", emoji: "🎭", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=75" },
      { value: "no",  label: "No — just the right style", sub: "Let the style speak",         emoji: "🎨", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=75" },
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
  const [chatForm, setChatForm]             = useState({ eventType: '', guests: '', date: '', requirements: '' });

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
  const coverage     = useMemo(() => (step === 1 ? topCoverage(answers) : []), [answers, step]);
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => { setVendorProfile(null); openChatForm({ _id: vendorProfile.vendorId, name: vendorProfile.vendorName, serviceType: "Decorator" }); }}
                  style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 12px rgba(196,122,46,0.3)" }}>
                  Request to Chat →
                </button>
                <button onClick={() => { setVendorProfile(null); navigate(`/vendor/${vendorProfile.vendorId}`); }}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                  View Full Profile
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
            <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>What's the event?</label>
                <input type="text" placeholder="e.g. Birthday party, wedding, anniversary..." value={chatForm.eventType} onChange={e => setChatForm(p => ({ ...p, eventType: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>How many guests?</label>
                <input type="number" placeholder="Approximate is fine" value={chatForm.guests} onChange={e => setChatForm(p => ({ ...p, guests: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Event date</label>
                <input type="date" value={chatForm.date} onChange={e => setChatForm(p => ({ ...p, date: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Anything specific? <span style={{ textTransform: "none", fontWeight: 500 }}>(optional)</span></label>
                <textarea placeholder="Colour preferences, must-have elements, reference photos..." value={chatForm.requirements} onChange={e => setChatForm(p => ({ ...p, requirements: e.target.value }))}
                  rows={2} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
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
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 12px 40px rgba(44,26,14,0.1)", border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden", maxWidth: 640, margin: "0 auto" }}>
            {/* Progress bar */}
            <div style={{ height: 5, background: "rgba(196,122,46,0.08)" }}>
              <div style={{ height: "100%", width: `${((qIdx + 1) / QUIZ_STEPS.length) * 100}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", transition: "width 0.35s ease", borderRadius: 4 }} />
            </div>

            <div style={{ padding: "28px 26px 24px" }}>
              {/* Step indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {QUIZ_STEPS.map((_, i) => (
                    <div key={i} style={{ width: i === qIdx ? 20 : 7, height: 7, borderRadius: 100, background: i < qIdx ? "#C47A2E" : i === qIdx ? "#CCAB4A" : "rgba(196,122,46,0.15)", transition: "all 0.3s" }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", marginLeft: 4 }}>{qIdx + 1} of {QUIZ_STEPS.length}</span>
              </div>

              {/* Question */}
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>{currentStep.q}</h2>
              {currentStep.sub && <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 22px", fontStyle: "italic" }}>{currentStep.sub}</p>}
              {!currentStep.sub && <div style={{ marginBottom: 22 }} />}

              {/* Options grid */}
              <div style={{ display: "grid", gridTemplateColumns: currentStep.options?.length === 2 ? "1fr 1fr" : "1fr 1fr", gap: 10 }}>
                {(currentStep.options || []).map(opt => {
                  const isSelected = answers[currentStep.id] === opt.value;
                  return (
                    <button key={opt.value} onClick={() => pick(currentStep.id, opt.value)}
                      style={{
                        borderRadius: 14,
                        border: `2px solid ${isSelected ? "#C47A2E" : "rgba(196,122,46,0.14)"}`,
                        background: isSelected ? "linear-gradient(135deg,rgba(196,122,46,0.08),rgba(204,171,74,0.05))" : "#FFFCF5",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left",
                        transition: "all 0.18s",
                        transform: isSelected ? "scale(1.02)" : "scale(1)",
                        boxShadow: isSelected ? "0 4px 18px rgba(196,122,46,0.25)" : "0 1px 4px rgba(196,122,46,0.06)",
                        fontFamily: font,
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}>
                      {/* Option image */}
                      {opt.image && (
                        <div style={{ height: 80, overflow: "hidden", flexShrink: 0 }}>
                          <img src={opt.image} alt={opt.label}
                            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                          />
                        </div>
                      )}
                      {/* Text content */}
                      <div style={{ padding: "10px 12px 12px", flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: isSelected ? "#C47A2E" : "#2C1A0E", lineHeight: 1.3, marginBottom: 3 }}>{opt.label}</div>
                        {opt.sub && <div style={{ fontSize: 11, color: isSelected ? "rgba(196,122,46,0.75)" : "#9B7450", lineHeight: 1.35 }}>{opt.sub}</div>}
                      </div>
                      {isSelected && (
                        <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "#C47A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800, boxShadow: "0 2px 6px rgba(196,122,46,0.4)" }}>✓</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {qIdx > 0 && (
                <button onClick={() => setQIdx(qIdx - 1)}
                  style={{ marginTop: 16, background: "none", border: "none", color: "#9B7450", fontSize: 13, cursor: "pointer", fontFamily: font, padding: 0 }}>
                  ← Previous question
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
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(204,171,74,0.8)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Your 2 Best Matches</div>
                <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                  {themes.map(t => (
                    <span key={t} style={{ fontSize: 16, fontWeight: 800, color: "#CCAB4A" }}>{THEME_EMOJI[t]} {t}</span>
                  ))}
                </div>
                {coverage.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginRight: 4 }}>Best for:</span>
                    {coverage.map(c => (
                      <span key={c} style={{ fontSize: 11, fontWeight: 700, color: "rgba(204,171,74,0.8)", background: "rgba(204,171,74,0.1)", border: "1px solid rgba(204,171,74,0.25)", borderRadius: 100, padding: "2px 10px" }}>{c}</span>
                    ))}
                  </div>
                )}
                {decorBudget && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Budget: ₹{Number(decorBudget).toLocaleString("en-IN")}</div>}
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

                    {/* Photo + vendor navigation with arrows */}
                    {vendors.length > 0 && (() => {
                      const curIdx  = vendors.findIndex(v => v.vendorId === curVid);
                      const safeIdx = curIdx < 0 ? 0 : curIdx;
                      const goPrev  = () => { const i = (safeIdx - 1 + vendors.length) % vendors.length; setSelVendor(p => ({ ...p, [theme]: vendors[i].vendorId })); };
                      const goNext  = () => { const i = (safeIdx + 1) % vendors.length; setSelVendor(p => ({ ...p, [theme]: vendors[i].vendorId })); };
                      const wb      = inBudget(curVid);
                      const vInfo   = vendorMap[curVid] || {};
                      return (
                        <>
                        {/* Main photo — no arrows on photo */}
                        <div style={{ position: "relative", background: "#1a0a00" }}>
                          {curPhoto && (
                            <img key={curVid} src={curPhoto.imageUrl} alt={theme}
                              style={{ width: "100%", height: 200, objectFit: "cover", display: "block", opacity: 0.92, animation: "photoFadeIn 0.3s ease" }} />
                          )}
                          {curPhoto && <a href={curPhoto.imageUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>⬇</a>}
                        </div>

                        {/* Vendor name row WITH arrows — arrows cycle vendors, name opens profile */}
                        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px 6px", gap: 8, borderBottom: "1px solid rgba(196,122,46,0.08)" }}>
                          {vendors.length > 1 && (
                            <button onClick={goPrev}
                              style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>‹</button>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <button onClick={() => setVendorProfile(curGroup)}
                              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: font, textAlign: "left", width: "100%" }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", textDecoration: "underline", textUnderlineOffset: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {curGroup?.vendorName} ↗
                              </div>
                            </button>
                            <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                              {vInfo.avgReviewScore > 0 && <span style={{ fontSize: 10, color: "#C47A2E" }}>★ {vInfo.avgReviewScore.toFixed(1)}</span>}
                              {vInfo.price > 0 && <span style={{ fontSize: 10, color: "#9B7450" }}>from ₹{Number(vInfo.price).toLocaleString("en-IN")}</span>}
                              {wb !== null && <span style={{ fontSize: 10, fontWeight: 700, color: wb ? "#16a34a" : "#b45309" }}>{wb ? "✓ In budget" : "↑ Above"}</span>}
                            </div>
                          </div>
                          {vendors.length > 1 && (
                            <>
                              <span style={{ fontSize: 10, color: "#9B7450", flexShrink: 0 }}>{safeIdx + 1}/{vendors.length}</span>
                              <button onClick={goNext}
                                style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>›</button>
                            </>
                          )}
                        </div>

                        {/* Dot indicators */}
                        {vendors.length > 1 && (
                          <div style={{ display: "flex", justifyContent: "center", gap: 5, padding: "6px 0 2px" }}>
                            {vendors.map((vg, vi) => (
                              <button key={vg.vendorId} onClick={() => setSelVendor(p => ({ ...p, [theme]: vg.vendorId }))}
                                style={{ width: vi === safeIdx ? 20 : 7, height: 7, borderRadius: 100, border: "none", background: vi === safeIdx ? "#C47A2E" : "rgba(196,122,46,0.25)", cursor: "pointer", padding: 0, transition: "all 0.25s" }} />
                            ))}
                          </div>
                        )}

                        {/* More photos from current vendor */}
                        {curGroup && curGroup.photos.length > 1 && (
                          <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "6px 14px 4px" }}>
                            {curGroup.photos.slice(0, 5).map((p, pi) => (
                              <div key={pi} style={{ position: "relative", flexShrink: 0 }}>
                                <img src={p.imageUrl} alt="" style={{ width: 58, height: 46, objectFit: "cover", borderRadius: 7, border: `2px solid ${photos[0]?.imageUrl === p.imageUrl ? "#C47A2E" : "transparent"}` }} />
                                <a href={p.imageUrl} target="_blank" rel="noopener noreferrer"
                                  style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>⬇</a>
                              </div>
                            ))}
                          </div>
                        )}
                        </>
                      );
                    })()}

                    {/* Show Profile button */}
                    {curGroup?.vendorId && (
                      <div style={{ padding: "10px 14px 4px" }}>
                        <button onClick={() => setVendorProfile(curGroup)}
                          style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                          Show Profile ↗
                        </button>
                      </div>
                    )}

                    {/* Decor checklist */}
                    <div style={{ padding: "10px 14px 14px", flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                        ✦ You Should Have
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {items.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,rgba(196,122,46,0.15),rgba(204,171,74,0.1))", border: "1.5px solid rgba(196,122,46,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#C47A2E", flexShrink: 0, marginTop: 2, fontWeight: 800 }}>✓</div>
                            <span style={{ fontSize: 12.5, color: "#2C1A0E", lineHeight: 1.4, fontWeight: 500 }}>{item}</span>
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

            <style>{`
              @media(max-width:600px){.decor-result-grid{grid-template-columns:1fr!important;}}
              @keyframes photoFadeIn { from{opacity:0;transform:scale(1.02)} to{opacity:0.92;transform:scale(1)} }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}

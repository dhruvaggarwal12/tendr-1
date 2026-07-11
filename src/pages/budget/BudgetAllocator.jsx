import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setFilters } from "../../redux/listingFiltersSlice";
import { setCategoryBudgets } from "../../redux/eventPlanningSlice";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import HamburgerNav from "../../components/HamburgerNav";
import AuthModal from "../../components/AuthModal";
import { useChatOverlay } from "../../context/ChatContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Map budget category names → vendor serviceType
const CATEGORY_TO_SERVICE = {
  "food & catering": "Caterer", "catering": "Caterer", "food": "Caterer",
  "decoration": "Decorator", "decor": "Decorator",
  "photography": "Photographer", "photo": "Photographer", "videography": "Photographer",
  "dj & music": "DJ", "entertainment": "DJ", "dj": "DJ", "music": "DJ",
};

function getServiceType(catName = "") {
  const lower = catName.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_TO_SERVICE)) {
    if (lower.includes(k)) return v;
  }
  return null;
}

const font = "'Outfit', sans-serif";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const EVENT_TYPES = {
  birthday: {
    label: "Birthday Party", icon: "🎂",
    cats: [
      { name: "Venue & Setup",    pct: 28, color: "#C47A2E" },
      { name: "Food & Catering",  pct: 25, color: "#10B981" },
      { name: "Decoration",       pct: 18, color: "#8B5CF6" },
      { name: "Photography",      pct: 12, color: "#3B82F6" },
      { name: "Entertainment",    pct: 10, color: "#F59E0B" },
      { name: "Cake & Desserts",  pct: 4,  color: "#EC4899" },
      { name: "Miscellaneous",    pct: 3,  color: "#6B7280" },
    ],
  },
  prewedding: {
    label: "Pre-Wedding Function", icon: "💍",
    cats: [
      { name: "Venue & Decor",    pct: 35, color: "#C47A2E" },
      { name: "Food & Catering",  pct: 28, color: "#10B981" },
      { name: "Decoration",       pct: 15, color: "#8B5CF6" },
      { name: "Photography",      pct: 10, color: "#3B82F6" },
      { name: "DJ & Music",       pct: 7,  color: "#F59E0B" },
      { name: "Miscellaneous",    pct: 5,  color: "#6B7280" },
    ],
  },
  wedding: {
    label: "Wedding Day", icon: "👰",
    cats: [
      { name: "Venue & Mandap",   pct: 35, color: "#C47A2E" },
      { name: "Food & Catering",  pct: 25, color: "#10B981" },
      { name: "Photography / Video", pct: 15, color: "#3B82F6" },
      { name: "Decoration",       pct: 12, color: "#8B5CF6" },
      { name: "Entertainment",    pct: 8,  color: "#F59E0B" },
      { name: "Miscellaneous",    pct: 5,  color: "#6B7280" },
    ],
  },
  anniversary: {
    label: "Anniversary", icon: "🥂",
    cats: [
      { name: "Venue & Setup",    pct: 32, color: "#C47A2E" },
      { name: "Food & Catering",  pct: 28, color: "#10B981" },
      { name: "Decoration",       pct: 18, color: "#8B5CF6" },
      { name: "Photography",      pct: 12, color: "#3B82F6" },
      { name: "Gifts & Flowers",  pct: 6,  color: "#EC4899" },
      { name: "Miscellaneous",    pct: 4,  color: "#6B7280" },
    ],
  },
  corporate: {
    label: "Corporate Event", icon: "🏢",
    cats: [
      { name: "Venue & AV Setup", pct: 35, color: "#C47A2E" },
      { name: "Food & Catering",  pct: 28, color: "#10B981" },
      { name: "Marketing & Brand",pct: 12, color: "#3B82F6" },
      { name: "Photography",      pct: 10, color: "#8B5CF6" },
      { name: "Transportation",   pct: 8,  color: "#F59E0B" },
      { name: "Miscellaneous",    pct: 7,  color: "#6B7280" },
    ],
  },
  party: {
    label: "Get-together / Party", icon: "🎉",
    cats: [
      { name: "Venue & Setup",    pct: 28, color: "#C47A2E" },
      { name: "Food & Drinks",    pct: 32, color: "#10B981" },
      { name: "Entertainment",    pct: 22, color: "#F59E0B" },
      { name: "Photography",      pct: 10, color: "#3B82F6" },
      { name: "Supplies",         pct: 5,  color: "#8B5CF6" },
      { name: "Miscellaneous",    pct: 3,  color: "#6B7280" },
    ],
  },
};

// ── Guest-count personalisation ──────────────────────────────────────────────
const GUEST_SHIFTS = {
  intimate: [
    { matches: ['food', 'cater', 'drink'], delta: -6 },
    { matches: ['venue', 'mandap'],        delta: -4 },
    { matches: ['decor'],                  delta: +4 },
    { matches: ['photo', 'video'],         delta: +4 },
    { matches: ['entertain', 'music', 'dj'], delta: +2 },
  ],
  small: [
    { matches: ['food', 'cater', 'drink'], delta: -3 },
    { matches: ['venue', 'mandap'],        delta: -2 },
    { matches: ['decor'],                  delta: +2 },
    { matches: ['photo', 'video'],         delta: +2 },
  ],
  medium: [],
  large: [
    { matches: ['food', 'cater', 'drink'], delta: +6 },
    { matches: ['venue', 'mandap'],        delta: +2 },
    { matches: ['decor'],                  delta: -3 },
    { matches: ['photo', 'video'],         delta: -2 },
    { matches: ['misc'],                   delta: -3 },
  ],
  xlarge: [
    { matches: ['food', 'cater', 'drink'], delta: +12 },
    { matches: ['venue', 'mandap'],        delta: +3 },
    { matches: ['decor'],                  delta: -5 },
    { matches: ['photo', 'video'],         delta: -4 },
    { matches: ['entertain', 'music', 'dj'], delta: -2 },
    { matches: ['misc'],                   delta: -4 },
  ],
};

const GUEST_TIER_INFO = {
  intimate: { label: 'Intimate (< 30 guests)',    hint: 'Photography & decoration weighted higher, catering leaner' },
  small:    { label: 'Small (30–75 guests)',       hint: 'Photo & decor boosted slightly' },
  medium:   { label: 'Standard (75–150 guests)',   hint: 'Balanced across all categories' },
  large:    { label: 'Large (150–300 guests)',     hint: 'Catering & venue weighted higher' },
  xlarge:   { label: 'Very large (300+ guests)',   hint: 'Catering heavily weighted for high headcount' },
};

function getGuestTier(guests) {
  const n = parseInt(guests) || 0;
  if (n < 30)  return 'intimate';
  if (n < 75)  return 'small';
  if (n < 150) return 'medium';
  if (n < 300) return 'large';
  return 'xlarge';
}

function applyGuestAdjustment(cats, guests) {
  const n = parseInt(guests) || 0;
  if (n <= 0) return cats;
  const shifts = GUEST_SHIFTS[getGuestTier(n)] || [];
  if (!shifts.length) return cats;
  return cats.map(c => {
    const lower = c.name.toLowerCase();
    const rule = shifts.find(r => r.matches.some(m => lower.includes(m)));
    return rule ? { ...c, pct: Math.max(1, c.pct + rule.delta) } : c;
  });
}

const initCategories = (eventKey, guests) =>
  applyGuestAdjustment(
    EVENT_TYPES[eventKey].cats.map((c, i) => ({
      id: `cat_${i}_${Date.now()}`,
      name: c.name,
      pct: c.pct,
      color: c.color,
      spent: 0,
    })),
    guests
  );

const formatINR = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// Build CSS conic-gradient pie chart from categories + total %
const buildPie = (categories) => {
  const total = categories.reduce((s, c) => s + c.pct, 0) || 100;
  let angle = 0;
  const segs = categories.map(c => {
    const deg = (c.pct / total) * 360;
    const seg = `${c.color} ${angle}deg ${angle + deg}deg`;
    angle += deg;
    return seg;
  });
  return `conic-gradient(${segs.join(", ")})`;
};

// Traffic light colour for a category based on spent vs allocated
function trafficLight(spent, allocated) {
  if (!allocated || spent === 0) return null;
  const ratio = spent / allocated;
  if (ratio > 1)    return { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  label: "Over budget",  dot: "#ef4444" };
  if (ratio >= 0.8) return { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", label: "Nearly full",  dot: "#f59e0b" };
  return              { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  label: "On track",    dot: "#22c55e" };
}

// Map vendor serviceType → budget category name for auto-sync
const VENDOR_TO_BUDGET = {
  Caterer:      "Food & Catering",
  Decorator:    "Decoration",
  Photographer: "Photography",
  DJ:           "DJ & Music",
};

export default function BudgetAllocator() {
  const location = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const routeEventType    = location.state?.eventType;
  const prefillBudget     = location.state?.prefillBudget;
  const prefillServices   = location.state?.prefillServices; // array of vendor serviceType strings
  const finalisedVendors  = useSelector(s => s.listingFilters?.finalisedVendors || {});
  const planFormData      = useSelector(s => s.eventPlanning?.formData || {});
  const { user }          = useSelector(s => s.auth);
  const { token }         = useSelector(s => s.auth);
  const { openTendrTeamChat } = useChatOverlay();
  const [tendrAuthOpen, setTendrAuthOpen]   = useState(false);
  const [pendingTendrChat, setPendingTendrChat] = useState(false);
  const handleTalkToTendr = () => {
    if (!token) { setPendingTendrChat(true); setTendrAuthOpen(true); return; }
    openTendrTeamChat();
  };
  const isCorporate       = planFormData.eventType === "Corporate Event" && user?.isAdmin;
  const headcount         = parseInt(planFormData.guests) || 0;

  // Vendor suggestion panel
  const [vendorPanel, setVendorPanel]       = useState(null); // { catName, serviceType, budget }
  const [panelVendors, setPanelVendors]     = useState([]);
  const [panelLoading, setPanelLoading]     = useState(false);

  // Mini 4-question form (shown before navigating to vendor listing/profile)
  // pendingAction: { type: 'listing', serviceType, budget } | { type: 'profile', vendorId, budget, serviceType }
  const [miniFormOpen, setMiniFormOpen]   = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [miniForm, setMiniForm]           = useState({ eventType: "", date: "", location: "", guests: "" });

  const CITIES = ["Delhi", "Noida", "Greater Noida", "Ghaziabad"];

  const openMiniForm = (action) => { setPendingAction(action); setMiniFormOpen(true); };

  const submitMiniForm = (e) => {
    e.preventDefault();
    if (!pendingAction) return;
    // Dispatch event details + budget to Redux
    dispatch(setFilters({
      serviceType:  pendingAction.serviceType,
      eventType:    miniForm.eventType,
      locationType: miniForm.location,
      date:         miniForm.date,
      guestCount:   parseInt(miniForm.guests) || 0,
    }));
    dispatch(setCategoryBudgets({ [pendingAction.serviceType]: pendingAction.budget }));
    setMiniFormOpen(false);
    setVendorPanel(null);
    if (pendingAction.type === "profile") {
      if (isStandalone()) {
        navigate(`/vendor/${pendingAction.vendorId}`);
      } else {
        window.open(`/vendor/${pendingAction.vendorId}`, "_blank");
      }
    } else {
      navigate("/listings", {
        state: {
          selectedCategories: [pendingAction.serviceType],
          budgetMax: pendingAction.budget,
          fromBudgetAllocator: true,
        }
      });
    }
    setPendingAction(null);
  };

  const openVendorPanel = useCallback(async (catName, allocated) => {
    const st = getServiceType(catName);
    if (!st || allocated <= 0) return;
    setVendorPanel({ catName, serviceType: st, budget: allocated });
    setPanelLoading(true);
    setPanelVendors([]);
    try {
      const res = await fetch(`${BASE_URL}/vendors?serviceTypes[]=${st}&limit=20`);
      const data = await res.json();
      const all = data.vendors || [];
      // Filter by price ≤ budget (show all if no price set, but put priced ones first)
      const priced = all.filter(v => v.price && v.price <= allocated);
      const unpriced = all.filter(v => !v.price || v.price > allocated);
      setPanelVendors([...priced, ...unpriced.slice(0, Math.max(0, 5 - priced.length))]);
    } catch {}
    finally { setPanelLoading(false); }
  }, []);
  const conversations = useSelector(s => s.chat?.conversations || []);

  const [eventKey, setEventKey] = useState("birthday");
  const [totalBudget, setTotalBudget] = useState(100000);
  const [guestCount, setGuestCount] = useState(() => parseInt(planFormData.guests) || 0);
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [budgetSaved, setBudgetSaved] = useState(() => { try { return localStorage.getItem("tendr_budget_saved") === "true"; } catch { return false; } });
  const saveBudget = () => {
    try { localStorage.setItem("tendr_budget_saved", "true"); } catch {}
    setBudgetSaved(true);
    window.dispatchEvent(new CustomEvent("tendr:budget-saved"));
  };

  const TTL_7D = 7 * 24 * 60 * 60 * 1000;
  const loadBudget = () => {
    try {
      const raw = localStorage.getItem("tendr_budget_v2");
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (d.__expiresAt && Date.now() > d.__expiresAt) { localStorage.removeItem("tendr_budget_v2"); return null; }
      return d;
    } catch { return null; }
  };

  // Map BudgetSplitModal service keys → BudgetAllocator category colours
  const SERVICE_COLOR = {
    Caterer: "#10B981", Decorator: "#8B5CF6", Photographer: "#3B82F6",
    DJ: "#F59E0B", Anchor: "#EC4899", Transport: "#6B7280",
    Mehendi: "#22d3ee", Makeup: "#f472b6",
  };
  const SERVICE_LABEL = {
    Caterer: "Food & Catering", Decorator: "Decoration", Photographer: "Photography",
    DJ: "DJ & Music", Anchor: "Anchor / Emcee", Transport: "Transport",
    Mehendi: "Mehendi Artist", Makeup: "Makeup Artist",
  };
  const SERVICE_PCT = { Caterer: 40, Decorator: 25, Photographer: 20, DJ: 15, Anchor: 10, Transport: 8, Mehendi: 8, Makeup: 12 };

  useEffect(() => {
    const guests = parseInt(planFormData.guests) || 0;
    // Pre-fill from BudgetSplitModal / EventPlanning navigate state
    if (prefillServices?.length > 0) {
      const raw   = prefillServices.map(s => ({ s, pct: SERVICE_PCT[s] ?? 10 }));
      const total = raw.reduce((a, b) => a + b.pct, 0);
      const cats  = applyGuestAdjustment(raw.map((r, i) => ({
        id:    `cat_${i}_${Date.now()}`,
        name:  SERVICE_LABEL[r.s] ?? r.s,
        pct:   Math.round((r.pct / total) * 100),
        color: SERVICE_COLOR[r.s] ?? "#C47A2E",
        spent: 0,
      })), guests);
      const key = routeEventType && EVENT_TYPES[routeEventType] ? routeEventType : "birthday";
      setEventKey(key);
      setTotalBudget(prefillBudget > 0 ? prefillBudget : 100000);
      setGuestCount(guests);
      setCategories(cats);
      setLoaded(true);
      return;
    }
    const d = loadBudget();
    if (d && !routeEventType) {
      const savedGuests = d.guestCount ?? guests;
      setEventKey(d.eventKey || "birthday");
      setTotalBudget(d.totalBudget || 50000);
      setGuestCount(savedGuests);
      setCategories(d.categories || initCategories(d.eventKey || "birthday", savedGuests));
    } else {
      const key = routeEventType && EVENT_TYPES[routeEventType] ? routeEventType : "birthday";
      setEventKey(key);
      setTotalBudget(prefillBudget > 0 ? prefillBudget : 100000);
      setGuestCount(guests);
      setCategories(initCategories(key, guests));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("tendr_budget_v2", JSON.stringify({ eventKey, totalBudget, guestCount, categories, __expiresAt: Date.now() + TTL_7D }));
  }, [eventKey, totalBudget, guestCount, categories, loaded]);

  const applyEventType = (key) => {
    setEventKey(key);
    setCategories(initCategories(key, guestCount));
  };

  const handleGuestCountChange = (val) => {
    const n = Math.max(0, parseInt(val) || 0);
    setGuestCount(n);
    setCategories(initCategories(eventKey, n));
  };

  const updatePct = (id, val) => {
    const pct = Math.max(0, Math.min(100, Number(val) || 0));
    setCategories(prev => prev.map(c => c.id === id ? { ...c, pct } : c));
  };

  const updateSpent = (id, val) => {
    const spent = Math.max(0, Number(val) || 0);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, spent } : c));
  };

  const updateName = (id, name) =>
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));

  const addCategory = () =>
    setCategories(prev => [...prev, {
      id: `cat_${Date.now()}`, name: "New Category", pct: 5, color: "#6B7280", spent: 0,
    }]);

  const deleteCategory = (id) =>
    setCategories(prev => prev.filter(c => c.id !== id));

  // Sync actual spent from finalised vendor prices in Redux
  const syncFromVendors = () => {
    let synced = 0;
    const updates = {};

    Object.entries(finalisedVendors).forEach(([serviceType, vendorOrArr]) => {
      const vendors = Array.isArray(vendorOrArr) ? vendorOrArr : [vendorOrArr];
      const budgetCat = VENDOR_TO_BUDGET[serviceType];
      if (!budgetCat) return;
      vendors.forEach(v => {
        if (!v) return;
        // Try to find price from conversations via vendorId
        const price = v.confirmedPrice || v.price || v.startingPrice || null;
        if (price) {
          updates[budgetCat] = (updates[budgetCat] || 0) + Number(price);
          synced++;
        }
      });
    });

    if (Object.keys(updates).length === 0) {
      setSyncMsg("No vendor prices found. Finalise a chat with a price first.");
      setTimeout(() => setSyncMsg(""), 3000);
      return;
    }

    setCategories(prev => prev.map(c => {
      const match = Object.entries(updates).find(([name]) =>
        c.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(c.name.toLowerCase())
      );
      return match ? { ...c, spent: match[1] } : c;
    }));

    setSyncMsg(`Synced prices for ${synced} vendor${synced !== 1 ? "s" : ""}`);
    setTimeout(() => setSyncMsg(""), 3000);
  };

  const totalPct   = categories.reduce((s, c) => s + c.pct, 0);
  const totalAlloc = categories.reduce((s, c) => s + Math.round(totalBudget * c.pct / 100), 0);
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const remaining  = totalBudget - totalSpent;

  const summaryCards = [
    { label: "Total Budget",   value: formatINR(totalBudget),  color: "#2C1A0E", bg: "rgba(196,122,46,0.07)" },
    { label: "Total Allocated",value: formatINR(totalAlloc),   color: "#0369a1", bg: "rgba(59,130,246,0.07)" },
    { label: "Total Spent",    value: formatINR(totalSpent),   color: "#c0392b", bg: "rgba(239,68,68,0.07)"  },
    { label: "Remaining",      value: formatINR(remaining),    color: remaining >= 0 ? "#15803d" : "#c0392b", bg: remaining >= 0 ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)" },
    ...(isCorporate && headcount > 0 ? [{ label: `Cost / Employee (${headcount} people)`, value: formatINR(Math.round(totalBudget / headcount)), color: "#7c3aed", bg: "rgba(124,58,237,0.07)" }] : []),
  ];

  return (
    <>
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, paddingBottom: "calc(60px + env(safe-area-inset-bottom, 0px))" }}>
      <SEO
        title="Event Budget Allocator — Smart Spending Split for Your Event"
        description="See the ideal budget split for your birthday, anniversary, corporate event or party across decoration, catering, photography and entertainment. Free budget planning tool by Tendr for Delhi NCR celebrations."
        path="/budget-allocator"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Budget Planner", path: "/budget-picker" }, { name: "Budget Allocator", path: "/budget-allocator" }]}
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How much should I allocate for decoration in a birthday party?",
              "acceptedAnswer": { "@type": "Answer", "text": "For a birthday party, decoration typically takes 15–20% of your total budget. On a ₹1,00,000 birthday budget, that's ₹15,000–₹20,000. This covers balloon setups, flower arrangements, theme props, and stage backdrop. Premium floral or LED decor setups in Delhi NCR typically start at ₹15,000." }
            },
            {
              "@type": "Question",
              "name": "What is a good catering budget for 100 guests?",
              "acceptedAnswer": { "@type": "Answer", "text": "For 100 guests, a good catering budget is ₹20,000–₹40,000 depending on menu and service style. A North Indian buffet with 10–12 dishes costs roughly ₹200–₹350 per plate in Delhi NCR. Live counters and dessert stations add ₹50–₹150 per person. Our budget allocator suggests 25% of your total for catering." }
            },
            {
              "@type": "Question",
              "name": "How do I split a ₹1,00,000 event budget?",
              "acceptedAnswer": { "@type": "Answer", "text": "A balanced ₹1,00,000 birthday budget in Delhi NCR typically looks like: Venue & Setup ₹28,000 (28%), Food & Catering ₹25,000 (25%), Decoration ₹18,000 (18%), Photography ₹12,000 (12%), Entertainment ₹10,000 (10%), Cake & Desserts ₹4,000 (4%), Miscellaneous ₹3,000 (3%). Our tool lets you adjust each category based on your priorities." }
            },
            {
              "@type": "Question",
              "name": "Does guest count change the budget split?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. For intimate events under 30 guests, photography and decoration get a higher share since per-person catering drops. For large events above 150 guests, catering dominates and takes 30–35% because food costs scale with headcount. Our tool automatically adjusts category weights when you enter your guest count." }
            }
          ]
        }}
      />
      <BasicSpeedDial />
      <HamburgerNav title="Budget Allocator" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "clamp(14px,3vw,22px) clamp(16px,4vw,40px) clamp(12px,2.5vw,20px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: "clamp(8px,2vw,16px)", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/budget-picker")}
            style={{ padding: "7px 14px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0, backdropFilter: "blur(4px)" }}>
            ← Back
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Planning Tool</div>
            <h1 style={{ fontSize: "clamp(17px,3.5vw,24px)", fontWeight: 900, color: "#fff", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Budget Allocator</h1>
            <p style={{ fontSize: "clamp(10px,1.8vw,12px)", color: "rgba(255,255,255,0.75)", margin: 0 }}>
              {EVENT_TYPES[eventKey]?.icon} {EVENT_TYPES[eventKey]?.label} · Plan spend · track actuals
              {isCorporate && planFormData.companyName && <span style={{ marginLeft: 8, background: "rgba(204,171,74,0.2)", border: "1px solid rgba(204,171,74,0.4)", borderRadius: 100, padding: "1px 8px", fontSize: 10, fontWeight: 700, color: "#CCAB4A" }}>🏢 {planFormData.companyName}</span>}
            </p>
          </div>
          <button onClick={saveBudget}
            style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 10, border: budgetSaved ? "1.5px solid #22c55e" : "1.5px solid rgba(255,255,255,0.4)", background: budgetSaved ? "#dcfce7" : "rgba(255,255,255,0.12)", color: budgetSaved ? "#15803d" : "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, backdropFilter: "blur(4px)" }}>
            {budgetSaved ? "✓ Saved" : "💾 Save"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>

        {/* Budget + guests input */}
        <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "16px 24px", marginBottom: 12, boxShadow: "0 2px 12px rgba(139,69,19,0.06)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Budget</div>
            <div style={{ fontSize: 11, color: "#9B7450" }}>Recalculates all category allocations</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 10, padding: "8px 14px" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#9B7450" }}>₹</span>
            <input
              type="number"
              value={totalBudget}
              onChange={e => setTotalBudget(Math.max(1000, Number(e.target.value) || 1000))}
              style={{ width: 110, border: "none", outline: "none", fontSize: 16, fontWeight: 700, fontFamily: font, color: "#2C1A0E" }}
              min="1000" step="5000"
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 10, padding: "8px 14px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#9B7450" }}>Guests</span>
            <input
              type="number"
              value={guestCount || ""}
              onChange={e => handleGuestCountChange(e.target.value)}
              placeholder="e.g. 100"
              style={{ width: 80, border: "none", outline: "none", fontSize: 15, fontWeight: 700, fontFamily: font, color: "#2C1A0E" }}
              min="0" step="10"
            />
          </div>
        </div>

        {/* Personalisation tier label */}
        {guestCount > 0 && (() => {
          const tier = getGuestTier(guestCount);
          const info = GUEST_TIER_INFO[tier];
          const tierColors = { intimate: '#7c3aed', small: '#3B82F6', medium: '#10B981', large: '#C47A2E', xlarge: '#ef4444' };
          const col = tierColors[tier];
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: `${col}0f`, border: `1.5px solid ${col}30`, borderRadius: 12, padding: "10px 16px", marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 12, fontWeight: 800, color: col }}>{info.label}</span>
                <span style={{ fontSize: 12, color: "#9B7450", marginLeft: 8 }}>— {info.hint}</span>
              </div>
            </div>
          );
        })()}

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
          {summaryCards.map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 14, padding: "16px 20px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Main layout: pie chart + categories */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Pie chart */}
          <div className="budget-pie-card" style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "24px", boxShadow: "0 2px 12px rgba(139,69,19,0.06)", minWidth: 240, flex: "0 0 auto" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 16 }}>Allocation</div>
            <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto 20px" }}>
              <div style={{ width: 180, height: 180, borderRadius: "50%", background: buildPie(categories), boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <div style={{ position: "absolute", inset: 30, borderRadius: "50%", background: "#FFFCF5", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <div style={{ fontSize: 11, color: "#9B7450", fontWeight: 600 }}>Total %</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: totalPct > 100 ? "#c0392b" : "#2C1A0E" }}>{totalPct}%</div>
                {totalPct > 100 && <div style={{ fontSize: 9, color: "#c0392b", fontWeight: 700 }}>Over!</div>}
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categories.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#5a3a1a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category rows */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)", overflow: "hidden" }}>
              <div className="budget-table-hdr" style={{ padding: "14px 20px", borderBottom: "1px solid rgba(196,122,46,0.1)", display: "grid", gridTemplateColumns: "1fr 70px 100px 120px 32px", gap: 8, fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <span>Category</span>
                <span>%</span>
                <span>Allocated</span>
                <span>Spent</span>
                <span />
              </div>
              {categories.map(c => {
                const allocated  = Math.round(totalBudget * c.pct / 100);
                const spentPct   = allocated > 0 ? Math.min(100, (c.spent / allocated) * 100) : 0;
                const tl         = trafficLight(c.spent, allocated);
                return (
                  <div key={c.id} className="budget-cat-row" style={{ borderBottom: "1px solid rgba(196,122,46,0.06)", padding: "12px 20px", background: tl ? tl.bg : "transparent", transition: "background 0.2s" }}>
                    <div className="budget-cat-inner" style={{ display: "grid", gridTemplateColumns: "1fr 64px 100px 120px 28px", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      {/* Name + traffic light dot */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                        <input
                          value={c.name}
                          onChange={e => updateName(c.id, e.target.value)}
                          style={{ border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: "#2C1A0E", fontFamily: font, background: "transparent", width: "100%", minWidth: 0 }}
                        />
                        {tl && (
                          <span title={tl.label} style={{ width: 9, height: 9, borderRadius: "50%", background: tl.dot, flexShrink: 0, boxShadow: `0 0 0 2px ${tl.dot}33` }} />
                        )}
                      </div>
                      <input
                        type="number" min="0" max="100" value={c.pct}
                        onChange={e => updatePct(c.id, e.target.value)}
                        style={{ border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 7, padding: "4px 8px", fontSize: 13, fontWeight: 700, fontFamily: font, color: "#2C1A0E", outline: "none", width: "100%", textAlign: "center" }}
                      />
                      <span className="budget-cat-alloc" style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{formatINR(allocated)}</span>
                      <input
                        type="number" min="0" value={c.spent}
                        onChange={e => updateSpent(c.id, e.target.value)}
                        placeholder="0"
                        className="budget-cat-spent"
                        style={{ border: `1.5px solid ${tl?.color ? tl.color + "66" : "rgba(196,122,46,0.2)"}`, borderRadius: 7, padding: "4px 8px", fontSize: 13, fontFamily: font, color: tl ? tl.color : "#2C1A0E", outline: "none", width: "100%", background: tl ? tl.bg : "#fff", fontWeight: tl ? 700 : 400 }}
                      />
                      <button onClick={() => deleteCategory(c.id)}
                        style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
                    </div>
                    {/* % slider for easy adjustment */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingRight: 36 }}>
                      <input type="range" min="0" max="60" step="1" value={c.pct}
                        onChange={e => updatePct(c.id, e.target.value)}
                        style={{ flex: 1, accentColor: c.color, cursor: "pointer", height: 4 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: c.color, minWidth: 42, textAlign: "right" }}>{formatINR(allocated)}</span>
                    </div>
                    {/* Progress bar + status label */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: getServiceType(c.name) && allocated > 0 ? 10 : 0 }}>
                      <div style={{ flex: 1, height: 5, background: "#f3e8d4", borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${spentPct}%`, background: tl ? tl.dot : c.color, borderRadius: 100, transition: "width 0.3s" }} />
                      </div>
                      {tl ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: tl.color, whiteSpace: "nowrap" }}>{tl.label}</span>
                      ) : (
                        <span style={{ fontSize: 11, color: "#9B7450", whiteSpace: "nowrap" }}>No spend logged</span>
                      )}
                    </div>

                    {/* See Perfect Vendors — full-width CTA for supported service categories */}
                    {getServiceType(c.name) && allocated > 0 && (
                      <button
                        onClick={() => openVendorPanel(c.name, allocated)}
                        style={{
                          width: "100%", padding: "10px 16px", borderRadius: 10,
                          background: `linear-gradient(135deg, ${c.color}18, ${c.color}08)`,
                          border: `1.5px solid ${c.color}40`,
                          color: c.color, fontSize: 13, fontWeight: 700,
                          cursor: "pointer", fontFamily: font,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${c.color}22`; e.currentTarget.style.borderColor = `${c.color}70`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${c.color}18, ${c.color}08)`; e.currentTarget.style.borderColor = `${c.color}40`; }}
                      >
                        <span>✦ See {getServiceType(c.name)}s within {formatINR(allocated)}</span>
                        <span style={{ fontSize: 16 }}>→</span>
                      </button>
                    )}
                  </div>
                );
              })}
              <button onClick={addCategory}
                style={{ display: "flex", alignItems: "center", gap: 6, margin: "10px 20px 14px", padding: "7px 14px", borderRadius: 8, border: "1.5px dashed rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                + Add category
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={() => setCategories(initCategories(eventKey, guestCount))}
                style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", color: "#9B7450", fontSize: "clamp(12px,2vw,14px)", fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                Reset to defaults
              </button>
              <button onClick={() => navigate("/budget-picker")}
                style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", color: "#C47A2E", fontSize: "clamp(12px,2vw,14px)", fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                ← Change Event Type
              </button>
            </div>
          </div>
        </div>

        {/* Static content for SEO */}
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="budget-seo-grid">
          <div style={{ background: "#FFFCF5", borderRadius: 16, padding: "22px 20px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>How does the budget split work?</h2>
            <p style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.7, margin: 0 }}>Each category gets a percentage of your total. The percentages are based on typical event spending patterns in Delhi NCR. For example, birthdays put more toward decoration and entertainment; corporate events put more toward venue AV and branding. You can adjust any category to match your priorities.</p>
          </div>
          <div style={{ background: "#FFFCF5", borderRadius: 16, padding: "22px 20px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>Track what you actually spend</h2>
            <p style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.7, margin: 0 }}>The "Spent" column lets you log actual vendor quotes as you collect them. Green means you're on track; amber means nearly at the limit; red means you've gone over for that category. This gives you a live picture of where you stand vs your plan before any money is paid.</p>
          </div>
          <div style={{ background: "#FFFCF5", borderRadius: 16, padding: "22px 20px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>Finding vendors within your category budget</h2>
            <p style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.7, margin: 0 }}>Each category row has a "See vendors within budget" button for service categories like decoration, catering, and photography. Clicking it filters Tendr's vendor listings to show only vendors priced at or below your allocated amount, so you never browse vendors you can't afford.</p>
          </div>
          <div style={{ background: "#FFFCF5", borderRadius: 16, padding: "22px 20px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>Why is venue typically the largest cost?</h2>
            <p style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.7, margin: 0 }}>In Delhi NCR, venue costs include space rental, basic furniture, parking, and in many cases security. Banquet halls in South Delhi and Gurugram typically charge ₹25,000–₹80,000+ for a 4–6 hour slot. Home events reduce venue cost to near zero, freeing up budget for decor and entertainment.</p>
          </div>
        </div>
      </div>
    </div>

    <style>{`
      @media (max-width: 600px) { .budget-seo-grid { grid-template-columns: 1fr !important; } }
      @media (max-width: 639px) {
        .budget-table-hdr { display: none !important; }
        .budget-cat-row { padding: 10px 12px !important; }
        .budget-cat-inner {
          grid-template-columns: 1fr 48px 72px 22px !important;
          gap: 4px !important;
        }
        .budget-cat-alloc { display: none !important; }
        .budget-cat-spent { font-size: 12px !important; padding: 4px 6px !important; }
      }
      @media (max-width: 480px) {
        .budget-cat-inner {
          grid-template-columns: 1fr 42px 60px 20px !important;
          gap: 3px !important;
        }
        .budget-cat-spent { display: flex !important; font-size: 11px !important; padding: 3px 5px !important; }
        .budget-pie-card { padding: 16px !important; min-width: unset !important; width: 100% !important; box-sizing: border-box; }
      }
    `}</style>

    {/* ── Vendor suggestion panel ── */}

    {vendorPanel && (
      <>
        <div onClick={() => setVendorPanel(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(28,10,0,0.45)", backdropFilter: "blur(3px)" }} />
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 401, width: "min(95vw,680px)", maxHeight: "calc(100dvh - 160px - env(safe-area-inset-bottom, 0px))", background: "#FAF7F2", borderRadius: 20, boxShadow: "0 32px 80px rgba(28,10,0,0.22)", border: "1.5px solid rgba(196,122,46,0.2)", display: "flex", flexDirection: "column", fontFamily: font, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFCF7", flexShrink: 0 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>
                {vendorPanel.serviceType}s within your budget
              </h3>
              <p style={{ fontSize: 12, color: "#9B7450", margin: "3px 0 0" }}>
                Budget for {vendorPanel.catName}: <strong style={{ color: "#C47A2E" }}>{formatINR(vendorPanel.budget)}</strong> — showing vendors at or under this range
              </p>
            </div>
            <button onClick={() => setVendorPanel(null)} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(196,122,46,0.1)", border: "none", color: "#9B7450", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {panelLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height: 80, borderRadius: 12, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                ))}
              </div>
            ) : panelVendors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <p style={{ fontSize: 14, color: "#9B7450" }}>No vendors found yet. Add vendors from the admin dashboard first.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {panelVendors.map(v => {
                  const fits = v.price && v.price <= vendorPanel.budget;
                  return (
                    <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: fits ? "rgba(21,128,61,0.04)" : "#FFFCF7", border: `1.5px solid ${fits ? "rgba(21,128,61,0.2)" : "rgba(196,122,46,0.14)"}` }}>
                      <img src={v.image || v.portfolioPhotos?.[0] || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=100&q=60"} alt={v.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E" }}>{v.name}</div>
                        <div style={{ fontSize: 12, color: "#9B7450" }}>{v.serviceType} · {v.address?.city || v.city || ""}</div>
                        {v.price ? (
                          <div style={{ fontSize: 13, fontWeight: 700, color: fits ? "#15803d" : "#C47A2E", marginTop: 2 }}>
                            ₹{Number(v.price).toLocaleString("en-IN")}
                            {fits && <span style={{ fontSize: 10, background: "rgba(21,128,61,0.1)", color: "#15803d", padding: "1px 6px", borderRadius: 20, marginLeft: 6 }}>Within budget</span>}
                            {!fits && <span style={{ fontSize: 10, color: "#9B7450", marginLeft: 6 }}>Over budget</span>}
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>Price on request</div>
                        )}
                      </div>
                      <button onClick={() => openMiniForm({ type: "profile", vendorId: v._id, budget: vendorPanel.budget, serviceType: vendorPanel.serviceType })}
                        style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0 }}>
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ padding: "12px 20px 16px", borderTop: "1px solid rgba(196,122,46,0.1)", background: "#FFFCF7", flexShrink: 0 }}>
            <button onClick={() => openMiniForm({ type: "listing", serviceType: vendorPanel.serviceType, budget: vendorPanel.budget })}
              style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Browse All {vendorPanel.serviceType}s within {formatINR(vendorPanel.budget)} →
            </button>
            <button onClick={handleTalkToTendr}
              style={{ width: "100%", marginTop: 8, padding: "9px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#7A3A0E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              💬 Can't find the right one? Talk to Tendr Team
            </button>
          </div>
        </div>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </>
    )}

    {/* ── Mini 4-question form ── */}
    {miniFormOpen && pendingAction && (
      <>
        <div onClick={() => setMiniFormOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(28,10,0,0.5)", backdropFilter: "blur(3px)" }} />
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 501, width: "min(95vw,460px)", maxHeight: "calc(100dvh - 160px - env(safe-area-inset-bottom, 0px))", background: "#FFFCF5", borderRadius: 20, boxShadow: "0 24px 64px rgba(28,10,0,0.25)", border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: font, overflowY: "auto" }}>
          <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(196,122,46,0.12)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#2C1A0E", margin: "0 0 3px" }}>Quick Event Details</h3>
            <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>
              Budget set: <strong style={{ color: "#C47A2E" }}>{formatINR(pendingAction.budget)}</strong> for {pendingAction.serviceType}
            </p>
          </div>
          <form onSubmit={submitMiniForm} style={{ padding: "18px 22px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Event type */}
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 5 }}>What type of event? *</label>
              <select required value={miniForm.eventType} onChange={e => setMiniForm(p => ({ ...p, eventType: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", background: "#fff" }}>
                <option value="">Select event type</option>
                {["Birthday", "Anniversary", "Pre Wedding", "Get-together", "Office Party", "Festival", "Others"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {/* City */}
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 5 }}>City *</label>
              <select required value={miniForm.location} onChange={e => setMiniForm(p => ({ ...p, location: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", background: "#fff" }}>
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Date */}
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 5 }}>Event Date *</label>
              <input required type="date" value={miniForm.date}
                min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
                onChange={e => { const d = new Date(); const t = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; if (e.target.value && e.target.value < t) return; setMiniForm(p => ({ ...p, date: e.target.value })); }}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
            </div>
            {/* Guests */}
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 5 }}>Number of guests *</label>
              <input required type="number" min="1" placeholder="e.g. 50" value={miniForm.guests}
                onChange={e => setMiniForm(p => ({ ...p, guests: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
            </div>
            <button type="submit"
              style={{ width: "100%", padding: "12px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)", marginTop: 2 }}>
              {pendingAction.type === "profile" ? "View Vendor Profile ↗" : `Browse ${pendingAction.serviceType}s →`}
            </button>
          </form>
        </div>
      </>
    )}
    <AuthModal
      open={tendrAuthOpen}
      onClose={() => { setTendrAuthOpen(false); setPendingTendrChat(false); }}
      onSuccess={() => {
        setTendrAuthOpen(false);
        if (pendingTendrChat) { setPendingTendrChat(false); openTendrTeamChat(); }
      }}
    />
    </>
  );
}

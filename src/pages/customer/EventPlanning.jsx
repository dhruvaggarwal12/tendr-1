import React, { useEffect, useState, useRef } from "react";
import { getRecommendations, SERVICE_LABELS } from "../../utils/recommendationEngine";
import { useRecommendationTracking } from "../../hooks/useRecommendationTracking";
import { EventIdeasPanel } from "../../utils/eventIdeas";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { useChatOverlay } from "../../context/ChatContext";

import {
  ChevronRight,
  ChevronLeft,
  Users,
  IndianRupee,
  MapPin,
  Calendar,
  Music,
  Camera,
  Utensils,
  X,
  Plus,
  Briefcase,
} from "lucide-react";

import EastIcon from "@mui/icons-material/East";

import { useSelector, useDispatch } from "react-redux";

import {
  setFormData,
  goToNextStep,
  goToPreviousStep,
  showVendorScreenAction,
  backToFormAction,
  addSelectedVendor,
  removeSelectedVendor,
  setBookingType,
  setCategoryBudgets,
  toggleExtraRequirement,
} from "../../redux/eventPlanningSlice.js";

import { setFilters } from "../../redux/listingFiltersSlice";

import MakeAGroup_Nav from "../../components/MakeAGroup_Nav.jsx";
import EventFormSummary from "../../components/EventFormSummary.jsx";
import { getVendors, getSmartPlan, confirmSmartPlan } from "../../apis/vendorApi.js";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CAT_PACKAGES = {
  Caterer:      [
    { tier: "Basic",    desc: "Buffet · Up to 40 guests · Veg menu · Basic serving" },
    { tier: "Standard", desc: "Live counters · Up to 80 guests · Veg/Non-Veg · Staff included" },
    { tier: "Premium",  desc: "Custom menu · 80+ guests · Live counters · Fine dining setup" },
  ],
  Photographer: [
    { tier: "Basic",    desc: "2-3 hrs coverage · 1 photographer · 100+ edited photos" },
    { tier: "Standard", desc: "4-6 hrs · 1 photographer · 300+ photos · Highlight reel" },
    { tier: "Premium",  desc: "Full day · 2 photographers · 500+ photos · Teaser video" },
  ],
  Decorator:    [
    { tier: "Basic",    desc: "Balloon & fairy lights · Basic backdrop · Table decor" },
    { tier: "Standard", desc: "Themed backdrop · Floral decor · Custom signage · Lighting" },
    { tier: "Premium",  desc: "Full venue styling · Custom installations · Stage setup" },
  ],
  DJ:           [
    { tier: "Basic",    desc: "3 hrs set · 1 DJ · Standard sound system" },
    { tier: "Standard", desc: "5 hrs · 1 DJ · Pro sound · LED lighting · Wireless mic" },
    { tier: "Premium",  desc: "Full night · DJ + assistant · Premium sound · Fog machine" },
  ],
};
import BasicSpeedDial from "../../components/BasicSpeedDial.jsx";
import SelectedVendorsFloat from "../../components/SelectedVendorsFloat";
import JourneyProgress from "../../components/JourneyProgress";
import HamburgerNav from "../../components/HamburgerNav";

const EventPlanning = () => {
  // openChatWithSocket replaced by openConciergeChat — opens the same VendorChatModal window
  const openChatWithSocket = () => {
    openConciergeChat(); // opens Tendr Concierge in the centered chat modal
  };






  const handleGoToTimeline = () => {
    navigate('/prebuilt-timeline');
  };
  const navigate = useNavigate();
  const location = useLocation();
  const { openConciergeChat, openVendorChat } = useChatOverlay();
  const TRANSITION_MS = 350;
  const [activeModal, setActiveModal] = useState(null);
  const [extraRequirements, setExtraRequirements] = useState(false);
  const [showExtraReq, setShowExtraReq] = useState();
  const [extraRequirementsText, setExtraRequirementsText] = useState("");
  const [animating, setAnimating] = useState(false);
  const [smartPlan, setSmartPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState(false);
  const [planErrorMsg, setPlanErrorMsg] = useState("");
  const [vendorOffset, setVendorOffset] = useState({});
  const [expandedCat, setExpandedCat] = useState(null);
  const [spQuickView, setSpQuickView] = useState(null); // vendor shown in smart plan QuickView panel
  const [spProfileView, setSpProfileView] = useState(null); // vendor shown in centered View Profile modal
  const [vendorFullCache, setVendorFullCache] = useState({}); // _id → full vendor data

  // Fetch full vendor profile (bio, locations, price, etc.) before opening panels
  const openQuickView = async (vendor) => {
    if (!vendor?._id) return;
    if (vendorFullCache[vendor._id]) { setSpQuickView(vendorFullCache[vendor._id]); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/vendors/${vendor._id}`);
      if (res.ok) {
        const data = await res.json();
        const full = { ...vendor, ...(data.vendor || data) };
        setVendorFullCache(p => ({ ...p, [vendor._id]: full }));
        setSpQuickView(full);
      } else { setSpQuickView(vendor); }
    } catch { setSpQuickView(vendor); }
  };
  const openProfile = async (vendor) => {
    if (!vendor?._id) return;
    if (vendorFullCache[vendor._id]) { setSpProfileView(vendorFullCache[vendor._id]); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/vendors/${vendor._id}`);
      if (res.ok) {
        const data = await res.json();
        const full = { ...vendor, ...(data.vendor || data) };
        setVendorFullCache(p => ({ ...p, [vendor._id]: full }));
        setSpProfileView(full);
      } else { setSpProfileView(vendor); }
    } catch { setSpProfileView(vendor); }
  };
  const [showSplitAdjust, setShowSplitAdjust] = useState(false);
  const [customSplit, setCustomSplit] = useState(null);
  const [draftSplit, setDraftSplit] = useState(null);
  const [smartPlanMode, setSmartPlanMode] = useState('perCategory'); // 'perCategory' | 'total'
  const [splitPct, setSplitPct] = useState({ Caterer: 40, Decorator: 25, Photographer: 20, DJ: 15 });
  const [totalPlanBudget, setTotalPlanBudget] = useState(50000);
  const [selectedTier, setSelectedTier] = useState('balanced');

  const TIER_SPLITS = {
    essential: { Caterer: 45, Decorator: 20, Photographer: 20, DJ: 15 },
    balanced:  { Caterer: 40, Decorator: 25, Photographer: 20, DJ: 15 },
    premium:   { Caterer: 35, Decorator: 30, Photographer: 25, DJ: 10 },
  };
  const TIER_META = {
    essential: { label: "Essential",  desc: "Smart basics, great value",    color: "#6b7280" },
    balanced:  { label: "Balanced",   desc: "Most popular split",           color: "#C47A2E", recommended: true },
    premium:   { label: "Premium",    desc: "Elevated decoration & photos", color: "#7c3aed" },
  };

  const applyTier = (tier) => {
    setSelectedTier(tier);
    const splits = TIER_SPLITS[tier];
    const cats = selectedVendors.filter(c => splits[c] !== undefined);
    const total = cats.reduce((s, c) => s + splits[c], 0) || 1;
    const adjusted = Object.fromEntries(cats.map(c => [c, Math.round(totalPlanBudget * splits[c] / total)]));
    setSplitPct(splits);
    dispatch(setCategoryBudgets(adjusted));
    fetch(`${BASE_URL}/smart-plans/tier-choice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, eventType: formData?.eventType, city: formData?.location, guests: formData?.guests }),
    }).catch(() => {});
    fetchSmartPlan();
  };
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState({});
  const [planSubmitted, setPlanSubmitted] = useState(() => !!localStorage.getItem("tendr_smart_plan"));
  const [confirmedPlan, setConfirmedPlan] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tendr_smart_plan") || "null"); } catch { return null; }
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState({});
  const [pkgExpanded, setPkgExpanded] = useState({}); // { "Caterer-Basic": true }
  const [catererMenu, setCatererMenu] = useState([]);
  const [showYouDoItBudget, setShowYouDoItBudget] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [liveSlots, setLiveSlots] = useState(null);

  // Poll live plan status every 30s when waiting for approval
  useEffect(() => {
    if (!planSubmitted || !confirmedPlan?._id) return;
    const poll = async () => {
      try {
        const res = await fetch(`${BASE_URL}/smart-plans/${confirmedPlan._id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.plan?.vendorSlots) setLiveSlots(data.plan.vendorSlots);
        }
      } catch {}
    };
    poll();
    const t = setInterval(poll, 30000);
    return () => clearInterval(t);
  }, [planSubmitted, confirmedPlan?._id]);

  const dispatch = useDispatch();
  const {
    currentStep,
    formData,
    showVendorScreen,
    bookingType,
    selectedVendors,
    categoryBudgets: savedCategoryBudgets,
  } = useSelector((state) => state.eventPlanning);
  const extraRequirements = useSelector((s) => s.eventPlanning.formData.extraRequirements || []);
  const { token, user: authUser } = useSelector((state) => state.auth);
  const { startSession, trackClick, trackSelect, trackDeselect, trackIgnored } = useRecommendationTracking();

  // Scroll to top whenever the smart plan screen opens (must be after showVendorScreen is declared)
  useEffect(() => {
    if (showVendorScreen && smartPlan) window.scrollTo({ top: 0, behavior: "instant" });
  }, [showVendorScreen, smartPlan]);

  // Per-category budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [draftBudgets, setDraftBudgets] = useState({});
  const [budgetModalCallback, setBudgetModalCallback] = useState(null);
  const [totalDraftBudget, setTotalDraftBudget] = useState(50000);
  const SPLIT_PCT = { Caterer: 40, Decorator: 25, Photographer: 20, DJ: 15 };

  const CAT_BUDGET_RANGES = {
    Caterer:      { min: 5000,  max: 500000, step: 5000,  default: 25000,  emoji: "🍽️" },
    Decorator:    { min: 3000,  max: 300000, step: 3000,  default: 15000,  emoji: "🎨" },
    Photographer: { min: 3000,  max: 200000, step: 3000,  default: 15000,  emoji: "📸" },
    DJ:           { min: 2000,  max: 100000, step: 2000,  default: 10000,  emoji: "🎵" },
  };

  const fmtBudget = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  const openBudgetModal = (onConfirm) => {
    const init = {};
    selectedVendors.forEach(cat => {
      init[cat] = savedCategoryBudgets[cat] || CAT_BUDGET_RANGES[cat]?.default || 10000;
    });
    setDraftBudgets(init);
    setBudgetModalCallback(() => onConfirm);
    setShowBudgetModal(true);
  };

  const confirmBudgets = () => {
    dispatch(setCategoryBudgets(draftBudgets));
    setShowBudgetModal(false);
    if (budgetModalCallback) {
      budgetModalCallback(draftBudgets);
      setBudgetModalCallback(null);
    }
  };

  // pick bookingType from URL (?bookingType=you-do-it | let-us-do-it)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("bookingType");
    if (t === "you-do-it" || t === "let-us-do-it") {
      dispatch(setBookingType(t));
    } else {
      dispatch(setBookingType("you-do-it"));
    }
  }, [location.search, dispatch]);

  const questions = [
    {
      id: "eventType",
      title: "What type of event are you planning?",
      subtitle: "This helps us suggest the right vendors",
      type: "select",
      options: [
        "Get-together",
        "Birthday",
        "1st Birthday",
        "Baby Shower",
        "Newborn Welcome",
        "Office Party",
        "Anniversary",
        "Housewarming",
        "Graduation",
        "Festival",
        "Corporate Event",
        "Others",
      ],
      icon: <Calendar className="w-8 h-8" />,
    },
    {
      id: "guests",
      title: formData.eventType === "Corporate Event" ? "How many employees will attend?" : "How many guests will attend?",
      subtitle: "An approximate number is fine",
      type: "number",
      placeholder: "e.g., 50",
      icon: <Users className="w-8 h-8" />,
    },
    ...(authUser?.isAdmin && formData.eventType === "Corporate Event" ? [{
      id: "companyName",
      title: "What is the company name?",
      subtitle: "Used in the event summary and vendor communications",
      type: "text",
      placeholder: "e.g., Acme Technologies Pvt. Ltd.",
      icon: <Briefcase className="w-8 h-8" />,
    }] : []),
    {
      id: "location",
      title: "Where will your event take place?",
      subtitle: "City or venue name",
      type: "select",
      options: ["Delhi", "Noida", "Greater Noida", "Ghaziabad"],
      icon: <MapPin className="w-8 h-8" />,
    },
    {
      id: "date",
      title: "When is your event?",
      subtitle: "Select your preferred date",
      type: "date",
      icon: <Calendar className="w-8 h-8" />,
    },
  ];

  const vendors = [
    {
      id: "Caterer",
      title: "Catering",
      icon: <Utensils className="w-6 h-6" />,
      description: "Authentic flavours for every celebration",
      photo: "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=600&h=340&q=80",
    },
    {
      id: "Photographer",
      title: "Photography",
      icon: <Camera className="w-6 h-6" />,
      description: "Timeless memories, beautifully captured",
      photo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&h=340&q=80",
    },
    {
      id: "DJ",
      title: "DJ & Music",
      icon: <Music className="w-6 h-6" />,
      description: "High-energy beats to keep the party alive",
      photo: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&h=340&q=80",
    },
    {
      id: "Decorator",
      title: "Decoration",
      icon: <span style={{ fontSize: 22 }}>🎀</span>,
      description: "Stunning balloon setups, floral themes and more",
      photo: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&h=340&q=80",
    },
  ];

  const [vendorCounts, setVendorCounts] = useState({});

  useEffect(() => {
    if (!showVendorScreen) return;
    const fetchCounts = async () => {
      try {
        // If a date is selected, fetch per-date availability (2 slots per vendor per day)
        if (formData?.date) {
          const params = new URLSearchParams({ date: formData.date });
          if (formData?.location) params.set('city', formData.location);
          const res = await fetch(`${BASE_URL}/vendors/availability/by-date?${params}`);
          if (res.ok) {
            const data = await res.json();
            setVendorCounts(data.available || {});
            return;
          }
        }
        // Fallback: total vendor count per category
        const results = await Promise.allSettled(
          vendors.map((v) =>
            getVendors({ serviceTypes: [v.id], limit: 1 })
          )
        );
        const counts = {};
        results.forEach((res, i) => {
          const key = vendors[i].id;
          if (res.status === "fulfilled") {
            counts[key] =
              res.value?.pagination?.total ??
              res.value?.vendors?.length ??
              0;
          } else {
            counts[key] = 0;
          }
        });
        setVendorCounts(counts);
      } catch (_) {}
    };
    fetchCounts();
  }, [showVendorScreen, formData?.date, formData?.location]);

  // Safety: reset step if out-of-range (e.g. admin question removed between sessions)
  useEffect(() => {
    if (!showVendorScreen && questions.length > 0 && currentStep >= questions.length) {
      dispatch(setCurrentStep(0));
    }
  }, [currentStep, showVendorScreen, questions.length, dispatch]);

  const handleInputChange = (field, value) => {
    dispatch(setFormData({ field, value, token }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && formData[currentQuestion.id]) {
      e.preventDefault();
      nextStep();
    }
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && formData[currentQuestion.id]) {
      e.preventDefault();
      nextStep();
    }
  };

  const advance = () => {
    if (animating) return;
    setAnimating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        dispatch(goToNextStep());
      } else {
        dispatch(showVendorScreenAction());
      }
      setAnimating(false);
    }, TRANSITION_MS);
  };

  /**
   * On Next:
   * - If not last question → advance step.
   * - On last question → always open vendor screen.
   *   Then we branch UI by bookingType:
   *   - you-do-it  → grid (existing)
   *   - let-us-do-it → checklist screen (new)
   */
  const nextStep = (valueOverride) => {
    if (animating) return;
    if (valueOverride === undefined && !formData[currentQuestion.id]) return;
    advance();
  };

  // Called when user picks a select option or a date — saves value then auto-advances
  const selectAndAdvance = (field, value) => {
    dispatch(setFormData({ field, value, token }));
    setTimeout(advance, 350);
  };

  const prevStep = () => {
    if (animating || currentStep === 0) return;
    setAnimating(true);
    setTimeout(() => {
      dispatch(goToPreviousStep());
      setAnimating(false);
    }, TRANSITION_MS);
  };

  // Modal open/close for vendor type (grid flow)
  const openModal = (vendorType) => setActiveModal(vendorType);
  const closeModal = () => setActiveModal(null);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;



  /** =======================
   *  SERVICE CATEGORY SCREEN (Both Flows — unified design)
   *  ======================= */

  if (showVendorScreen && smartPlan) {
    const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
    const stars = (n) => {
      const r = Math.round(n * 2) / 2;
      return "★".repeat(Math.floor(r)) + (r % 1 ? "½" : "") + "☆".repeat(5 - Math.ceil(r));
    };
    const CAT_EMOJI_MAP = { Caterer: "🍽", Decorator: "🎀", Photographer: "📸", DJ: "🎵" };

    const currentVendors = smartPlan.lineup.map(({ category, vendors: vs, estimatedCost: lineupCost }) => {
      const pool = vs.slice(0, 3); // max 3 suggestions per category
      const offset = vendorOffset[category] || 0;
      const vendor = pool.length > 0 ? pool[offset % pool.length] : null;
      const estimatedCost = savedCategoryBudgets[category] || lineupCost || 0;
      return { category, estimatedCost, vendor, totalVendors: pool.length };
    });

    const wizardCatOrder = ['Caterer', 'Decorator', 'Photographer', 'DJ'];
    const wizardSteps = [
      { id: 'confirm', label: 'Confirm Details' },
      ...wizardCatOrder.filter(c => selectedVendors.includes(c)).map(c => ({
        id: c.toLowerCase(),
        label: c === 'Caterer' ? 'Food & Catering' : c === 'Decorator' ? 'Decoration' : c === 'Photographer' ? 'Photography' : 'DJ & Music',
      })),
    ];
    const isLastStep = wizardStep === wizardSteps.length - 1;

    const updAns = (sec, field, val) => setWizardAnswers(p => ({ ...p, [sec]: { ...(p[sec] || {}), [field]: val } }));
    const togMulti = (sec, field, val) => setWizardAnswers(p => {
      const cur = p[sec]?.[field] || [];
      return { ...p, [sec]: { ...(p[sec] || {}), [field]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] } };
    });

    const submitPlan = async () => {
      setSubmitLoading(true);
      try {
        const result = await confirmSmartPlan({
          customerId: authUser?._id || null,
          customerName: authUser?.name || '',
          customerPhone: authUser?.phoneNumber || '',
          eventDetails: { eventType: formData?.eventType, guests: Number(formData?.guests) || 0, totalBudget: smartPlan.totalBudget, location: formData?.location, date: formData?.date, budget: formData?.budget },
          vendorSlots: currentVendors.map(({ category, estimatedCost, vendor }) => ({
            category,
            percentage: smartPlan?.totalBudget > 0 ? Math.round((estimatedCost / smartPlan.totalBudget) * 100) : 25,
            estimatedCost,
            vendorId: vendor?._id || null, vendorName: vendor?.name || '',
            status: 'Pending',
          })),
          wizardAnswers: { ...wizardAnswers, selectedPackages },
        });
        const planData = { ...result.plan, _savedAt: Date.now() };
        localStorage.setItem("tendr_smart_plan", JSON.stringify(planData));
        setConfirmedPlan(planData);
      } catch (e) {
        console.error('Plan submit failed:', e);
      }
      setPlanSubmitted(true);
      setShowWizard(false);
      setSubmitLoading(false);
    };

    const OptBtn = ({ sec, field, val, multi }) => {
      const sel = multi ? (wizardAnswers[sec]?.[field] || []).includes(val) : wizardAnswers[sec]?.[field] === val;
      return (
        <button onClick={() => multi ? togMulti(sec, field, val) : updAns(sec, field, val)}
          style={{ padding: "10px 12px", borderRadius: 10, border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: sel ? "rgba(196,122,46,0.08)" : "#FFFCF5", color: "#2C1A0E", fontSize: 13, fontWeight: sel ? 700 : 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "center", transition: "all 0.15s" }}>
          {sel && "✓ "}{val}
        </button>
      );
    };

    const renderWizardStep = () => {
      const { id } = wizardSteps[wizardStep] || {};
      if (id === 'confirm') return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ l: "Event", v: formData?.eventType }, { l: "Date", v: formData?.date }, { l: "Location", v: formData?.location }, { l: "Guests", v: formData?.guests }].filter(r => r.v).map(r => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(196,122,46,0.05)", borderRadius: 10, border: "1px solid rgba(196,122,46,0.12)" }}>
              <span style={{ fontSize: 13, color: "#9B7450", fontWeight: 600 }}>{r.l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{r.v}</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "#9B7450", textAlign: "center", marginTop: 4 }}>These details will be sent to all your vendors.</p>
        </div>
      );
      if (id === 'caterer') {
        const catVendorId = currentVendors.find(cv => cv.category === 'Caterer')?.vendor?._id;
        const fetchMenu = async (pkg) => {
          if (!catVendorId) return;
          setMenuLoading(true);
          try {
            const res = await fetch(`${BASE_URL}/vendors/${catVendorId}/menu`);
            if (res.ok) { const d = await res.json(); setCatererMenu(d.menuItems || []); }
          } catch {} finally { setMenuLoading(false); }
        };
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[{ label: "Food Preference", field: "foodPreference", opts: ["Veg only", "Non-veg", "Both"], multi: false },
              { label: "Meal Type", field: "mealType", opts: ["Buffet", "Plated", "Live counters", "High Tea"], multi: false },
              { label: "Cuisine (multi-select)", field: "cuisine", opts: ["North Indian", "South Indian", "Chinese", "Continental", "Mixed"], multi: true }
            ].map(({ label, field, opts, multi }) => (
              <div key={field}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>{label}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                  {opts.map(v => <OptBtn key={v} sec="catering" field={field} val={v} multi={multi} />)}
                </div>
              </div>
            ))}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Dietary Restrictions <span style={{ fontSize: 10, color: "#9B7450", textTransform: "none" }}>(optional)</span></div>
              <input type="text" placeholder="e.g. No onion-garlic, Jain food..." value={wizardAnswers.catering?.dietaryRestrictions || ""} onChange={e => updAns("catering", "dietaryRestrictions", e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#2C1A0E", outline: "none", background: "#FFFCF5", boxSizing: "border-box" }} />
            </div>
            {/* Packages — expandable cards */}
            <div style={{ borderTop: "1px solid rgba(196,122,46,0.15)", paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em" }}>📦 Choose a Package</div>
                <button onClick={() => isLastStep ? submitPlan() : setWizardStep(s => s + 1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#9B7450", padding: 0, fontFamily: "'Outfit',sans-serif" }}>{isLastStep ? "Skip & Confirm →" : "Skip →"}</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CAT_PACKAGES.Caterer.map(p => {
                  const sel = selectedPackages.Caterer === p.tier;
                  const key = `Caterer-${p.tier}`;
                  const open = !!pkgExpanded[key];
                  return (
                    <div key={p.tier} style={{ borderRadius: 12, border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: sel ? "rgba(196,122,46,0.05)" : "#FFFCF5", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", cursor: "pointer" }}
                        onClick={() => { setSelectedPackages(s => ({ ...s, Caterer: p.tier })); fetchMenu(p.tier); }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: sel ? "#C47A2E" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {sel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{p.tier}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setPkgExpanded(x => ({ ...x, [key]: !open })); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 16, padding: "2px 4px", lineHeight: 1, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>⌄</button>
                      </div>
                      {open && (
                        <div style={{ padding: "0 14px 12px", borderTop: "1px solid rgba(196,122,46,0.1)" }}>
                          <p style={{ fontSize: 12.5, color: "#5a3a1a", lineHeight: 1.6, margin: "10px 0 0" }}>{p.desc}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Menu preview */}
            {selectedPackages.Caterer && catererMenu.length > 0 && (
              <div style={{ background: "rgba(196,122,46,0.04)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(196,122,46,0.15)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>🍽 Menu</div>
                {menuLoading ? <div style={{ fontSize: 12, color: "#9B7450" }}>Loading menu…</div> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {catererMenu.slice(0, 8).map((item, i) => (
                      <div key={i} style={{ fontSize: 12, color: "#2C1A0E", display: "flex", justifyContent: "space-between" }}>
                        <span>{item.name || item}</span>
                        {item.price && <span style={{ color: "#C47A2E", fontWeight: 600 }}>₹{item.price}</span>}
                      </div>
                    ))}
                    {catererMenu.length > 8 && <div style={{ fontSize: 11, color: "#9B7450" }}>+{catererMenu.length - 8} more items</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
      if (id === 'decorator') return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[{ label: "Venue Type", field: "venueType", opts: ["Indoor hall", "Outdoor", "Home", "Farmhouse"], multi: false },
            { label: "Theme Preference", field: "theme", opts: ["Floral", "Balloon Art", "Minimalist", "Traditional", "Themed", "Surprise me"], multi: false },
            { label: "Must-have Elements (multi-select)", field: "mustHave", opts: ["Entrance arch", "Stage setup", "Photo booth", "Table décor", "Ceiling work"], multi: true }
          ].map(({ label, field, opts, multi }) => (
            <div key={field}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>{label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {opts.map(v => <OptBtn key={v} sec="decoration" field={field} val={v} multi={multi} />)}
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(196,122,46,0.15)", paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>📦 Choose a Package</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CAT_PACKAGES.Decorator.map(p => { const sel = selectedPackages.Decorator === p.tier; const key = `Decorator-${p.tier}`; const open = !!pkgExpanded[key]; return (
                <div key={p.tier} style={{ borderRadius: 12, border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: sel ? "rgba(196,122,46,0.05)" : "#FFFCF5", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", cursor: "pointer" }} onClick={() => setSelectedPackages(s => ({ ...s, Decorator: p.tier }))}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: sel ? "#C47A2E" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{p.tier}</div>
                    <button onClick={e => { e.stopPropagation(); setPkgExpanded(x => ({ ...x, [key]: !open })); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 16, padding: "2px 4px", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>⌄</button>
                  </div>
                  {open && <div style={{ padding: "0 14px 12px", borderTop: "1px solid rgba(196,122,46,0.1)" }}><p style={{ fontSize: 12.5, color: "#5a3a1a", lineHeight: 1.6, margin: "10px 0 0" }}>{p.desc}</p></div>}
                </div>
              ); })}
            </div>
          </div>
        </div>
      );
      if (id === 'photographer') return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[{ label: "What do you need?", field: "coverage", opts: ["Photos only", "Video only", "Both"], multi: false },
            { label: "Style", field: "style", opts: ["Candid", "Traditional", "Cinematic"], multi: false },
            { label: "Duration", field: "duration", opts: ["Half day (4 hrs)", "Full day (8 hrs)"], multi: false },
            { label: "Deliverables (multi-select)", field: "deliverables", opts: ["Edited photos", "Printed album", "Highlights reel", "Full video"], multi: true }
          ].map(({ label, field, opts, multi }) => (
            <div key={field}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>{label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {opts.map(v => <OptBtn key={v} sec="photography" field={field} val={v} multi={multi} />)}
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(196,122,46,0.15)", paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>📦 Choose a Package</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CAT_PACKAGES.Photographer.map(p => { const sel = selectedPackages.Photographer === p.tier; const key = `Photographer-${p.tier}`; const open = !!pkgExpanded[key]; return (
                <div key={p.tier} style={{ borderRadius: 12, border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: sel ? "rgba(196,122,46,0.05)" : "#FFFCF5", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", cursor: "pointer" }} onClick={() => setSelectedPackages(s => ({ ...s, Photographer: p.tier }))}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: sel ? "#C47A2E" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{p.tier}</div>
                    <button onClick={e => { e.stopPropagation(); setPkgExpanded(x => ({ ...x, [key]: !open })); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 16, padding: "2px 4px", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>⌄</button>
                  </div>
                  {open && <div style={{ padding: "0 14px 12px", borderTop: "1px solid rgba(196,122,46,0.1)" }}><p style={{ fontSize: 12.5, color: "#5a3a1a", lineHeight: 1.6, margin: "10px 0 0" }}>{p.desc}</p></div>}
                </div>
              ); })}
            </div>
          </div>
        </div>
      );
      if (id === 'dj') return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[{ label: "Music Genre", field: "genre", opts: ["Bollywood", "English", "Both", "Regional"], multi: false },
            { label: "Duration", field: "duration", opts: ["2 hrs", "4 hrs", "Full event"], multi: false },
            { label: "MC / Anchor Needed?", field: "mcNeeded", opts: ["Yes", "No"], multi: false }
          ].map(({ label, field, opts, multi }) => (
            <div key={field}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>{label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {opts.map(v => <OptBtn key={v} sec="dj" field={field} val={v} multi={multi} />)}
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(196,122,46,0.15)", paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>📦 Choose a Package</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CAT_PACKAGES.DJ.map(p => { const sel = selectedPackages.DJ === p.tier; const key = `DJ-${p.tier}`; const open = !!pkgExpanded[key]; return (
                <div key={p.tier} style={{ borderRadius: 12, border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: sel ? "rgba(196,122,46,0.05)" : "#FFFCF5", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", cursor: "pointer" }} onClick={() => setSelectedPackages(s => ({ ...s, DJ: p.tier }))}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: sel ? "#C47A2E" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{p.tier}</div>
                    <button onClick={e => { e.stopPropagation(); setPkgExpanded(x => ({ ...x, [key]: !open })); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 16, padding: "2px 4px", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>⌄</button>
                  </div>
                  {open && <div style={{ padding: "0 14px 12px", borderTop: "1px solid rgba(196,122,46,0.1)" }}><p style={{ fontSize: 12.5, color: "#5a3a1a", lineHeight: 1.6, margin: "10px 0 0" }}>{p.desc}</p></div>}
                </div>
              ); })}
            </div>
          </div>
        </div>
      );
      return null;
    };

    // ── Waiting for approval (post-submit) ─────────────────────────────────
    if (planSubmitted) {
      const slots = confirmedPlan?.vendorSlots || currentVendors.map(cv => ({ category: cv.category, vendorName: cv.vendor?.name || cv.category, estimatedCost: cv.estimatedCost }));
      const CAT_EMOJI = { Caterer: '🍽', Decorator: '🎀', Photographer: '📸', DJ: '🎵' };

      return (
        <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: "'Outfit', sans-serif" }}>
          <BasicSpeedDial />
          <HamburgerNav active="Browse" noCompare />
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "56px 20px 80px", textAlign: "center" }}>

            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Your package request is submitted!
            </h2>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 16px", lineHeight: 1.65, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
              Our team is reviewing your package. We'll notify you on WhatsApp once it's ready.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 10, padding: "10px 18px", marginBottom: 16 }}>
              <span style={{ fontSize: 15 }}>💬</span>
              <span style={{ fontSize: 13, color: "#7A5535", fontWeight: 600 }}>
                Once confirmed — check <strong>View Chats</strong> to find your chat with our team
              </span>
            </div>
            {/* Install App highlight */}
            <a href="#install-app" onClick={e => { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,rgba(196,122,46,0.12),rgba(204,171,74,0.1))", border: "1.5px solid rgba(196,122,46,0.3)", borderRadius: 10, padding: "10px 18px", marginBottom: 28, textDecoration: "none", cursor: "pointer" }}>
              <span style={{ fontSize: 18 }}>📲</span>
              <span style={{ fontSize: 13, color: "#C47A2E", fontWeight: 700 }}>
                Install the Tendr App — get instant updates on your phone
              </span>
              <span style={{ fontSize: 11, color: "#9B7450" }}>→</span>
            </a>

            {/* Package summary — clean, no status */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", overflow: "hidden", marginBottom: 24, textAlign: "left", boxShadow: "0 2px 12px rgba(196,122,46,0.07)" }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(196,122,46,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E" }}>Your Package</span>
                <span style={{ fontSize: 11, background: "rgba(196,122,46,0.1)", color: "#C47A2E", padding: "2px 10px", borderRadius: 100, fontWeight: 700 }}>
                  {confirmedPlan?.eventDetails?.eventType || formData?.eventType || "Event"}
                </span>
              </div>
              <div style={{ padding: "10px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                {slots.map((slot, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: "rgba(196,122,46,0.05)", border: "1px solid rgba(196,122,46,0.12)" }}>
                    <span style={{ fontSize: 15 }}>{CAT_EMOJI[slot.category] || "🏷"}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{slot.vendorName || slot.category}</div>
                      <div style={{ fontSize: 10, color: "#9B7450" }}>₹{Number(slot.estimatedCost || 0).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate("/")}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                Back to Home
              </button>
              <button onClick={() => navigate("/dashboard")}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                My Dashboard →
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
      {/* ── Wizard overlay ── */}
      {showWizard && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Outfit', sans-serif" }}>
          <div style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ height: 4, background: "rgba(196,122,46,0.15)", borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((wizardStep + 1) / wizardSteps.length) * 100}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", transition: "width 0.3s ease" }} />
            </div>
            <div style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Step {wizardStep + 1} of {wizardSteps.length}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>{wizardSteps[wizardStep]?.label}</h3>
                </div>
                <button onClick={() => setShowWizard(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
              </div>
              {renderWizardStep()}
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                {wizardStep > 0 && (
                  <button onClick={() => setWizardStep(s => s - 1)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>← Back</button>
                )}
                <button onClick={() => isLastStep ? submitPlan() : setWizardStep(s => s + 1)} disabled={submitLoading}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitLoading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", opacity: submitLoading ? 0.7 : 1 }}>
                  {submitLoading ? "Submitting…" : isLastStep ? "Confirm Plan →" : "Next →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Package view ── */}
      <div className="min-h-screen w-full" style={{ background: "#fff8f2", fontFamily: "'Outfit', sans-serif" }}>
        <BasicSpeedDial />
        <HamburgerNav active="Browse" noCompare />

        <div className="w-full px-4 sm:px-6 lg:px-12 pt-8 pb-24 flex flex-col items-center">

          {/* Package header card */}
          <div style={{ width: "100%", maxWidth: 1100, marginBottom: 20 }}>
            <div style={{ background: "linear-gradient(135deg,#4A2810,#7A4020)", borderRadius: 20, padding: "22px 24px", color: "#fff", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -24, right: -24, width: 110, height: 110, borderRadius: "50%", background: "rgba(204,171,74,0.07)" }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(204,171,74,0.8)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>✨ Your Event Package</div>
              <h2 style={{ fontSize: "clamp(1.1rem,2.5vw,1.5rem)", fontWeight: 900, color: "#CCAB4A", marginBottom: 8, letterSpacing: "-0.01em" }}>
                {formData?.eventType || "Your Event"} — Smart Package
              </h2>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                {formData?.location && <span>📍 {formData.location}</span>}
                {formData?.date && <span>📅 {formData.date}</span>}
                {formData?.guests && <span>👥 {formData.guests} guests</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", gap: 8, paddingBottom: 2, msOverflowStyle: "none", scrollbarWidth: "none" }}>
                {currentVendors.map(({ category, estimatedCost }) => (
                  <div key={category} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "6px 12px", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{CAT_EMOJI_MAP[category]} {category}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#CCAB4A" }}>{fmt(estimatedCost)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Budget split tier selector */}
          {smartPlanMode === 'total' && (
            <div style={{ width: "100%", maxWidth: 1100, marginBottom: 16 }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E" }}>💰 How would you like to split your {fmt(totalPlanBudget)} budget?</div>
                  <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2 }}>Based on past choices of customers with similar events</div>
                </div>
              </div>
              {/* 3 Tier Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {['essential','balanced','premium'].map(tier => {
                  const meta = TIER_META[tier];
                  const splits = TIER_SPLITS[tier];
                  const isActive = selectedTier === tier;
                  const cats = selectedVendors.filter(c => splits[c] !== undefined);
                  const totalPct = cats.reduce((s, c) => s + splits[c], 0) || 1;
                  return (
                    <div key={tier} onClick={() => applyTier(tier)}
                      style={{ background: isActive ? (tier === 'balanced' ? "linear-gradient(145deg,#FFFCF0,#FFF4E0)" : tier === 'premium' ? "linear-gradient(145deg,#F5F0FF,#EDE8FF)" : "#F9F9F9") : "#fff", borderRadius: 16, border: isActive ? `2.5px solid ${meta.color}` : "2px solid rgba(0,0,0,0.06)", padding: "16px 14px 14px", cursor: "pointer", position: "relative", boxShadow: isActive ? `0 4px 20px ${meta.color}28` : "0 2px 8px rgba(0,0,0,0.05)", transition: "all 0.2s" }}>
                      {/* Recommended badge */}
                      {meta.recommended && (
                        <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", borderRadius: 100, padding: "2px 12px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>★ RECOMMENDED</span>
                        </div>
                      )}
                      {/* Tier label */}
                      <div style={{ marginTop: meta.recommended ? 4 : 0, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: meta.color }}>{meta.label}</span>
                        {isActive && <span style={{ marginLeft: 6, fontSize: 11, color: meta.color }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#9B7450", marginBottom: 12 }}>{meta.desc}</div>
                      {/* Per-category split rows */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {cats.map(cat => {
                          const pct = splits[cat];
                          const amt = Math.round(totalPlanBudget * pct / totalPct);
                          return (
                            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 11, color: "#5A3E2B", flex: 1, fontWeight: 600 }}>{CAT_EMOJI_MAP[cat]} {cat}</span>
                              <span style={{ fontSize: 11, color: "#9B7450" }}>{pct}%</span>
                              <span style={{ fontSize: 12, fontWeight: 800, color: meta.color, minWidth: 56, textAlign: "right" }}>{fmt(amt)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* How to book strip — smart planning */}
          <div style={{ width: "100%", maxWidth: 1100, marginBottom: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 12, padding: "11px 16px", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 16px rgba(44,26,14,0.18)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 15 }}>💡</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>How it works:</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 2, msOverflowStyle: "none", scrollbarWidth: "none" }}>
                {["Quick View", "Confirm Package", "Coordinate", "Review & Pay"].map((label, i) => (
                  <span key={i} style={{ background: "rgba(204,171,74,0.22)", color: "#CCAB4A", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 100, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {i + 1}. {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Vendor cards — 4-column compact, normal flow style */}
          <style>{`@media(max-width:900px){.smart-vendor-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:540px){.smart-vendor-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
          <div style={{ width: "100%", maxWidth: 1100, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }} className="smart-vendor-grid">
            {currentVendors.map(({ category, estimatedCost, vendor, totalVendors }) => (
              <div key={category} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)", overflow: "hidden", boxShadow: "0 2px 10px rgba(196,122,46,0.07)", display: "flex", flexDirection: "column" }}>
                {/* Photo */}
                <div style={{ position: "relative", height: 110, background: "#f3ebe0", overflow: "hidden" }}>
                  {vendor?.portfolioPhotos?.[0] ? <img src={vendor.portfolioPhotos[0]} alt={vendor?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{category === "Caterer" ? "🍽" : category === "Decorator" ? "🎀" : category === "Photographer" ? "📸" : "🎵"}</div>}
                  {/* Category + budget badges */}
                  <div style={{ position: "absolute", bottom: 8, left: 8, display: "flex", gap: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(196,122,46,0.92)", color: "#fff", borderRadius: 100, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{category}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 100, padding: "2px 8px" }}>{fmt(estimatedCost)}</span>
                  </div>
                  {/* Swap arrows */}
                  {vendor && totalVendors > 1 && (
                    <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4 }}>
                      <button onClick={() => { setVendorOffset(p => { const cur = p[category] || 0; return { ...p, [category]: (cur - 1 + totalVendors) % totalVendors }; }); }}
                        style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>‹</button>
                      <button onClick={() => { setVendorOffset(p => ({ ...p, [category]: ((p[category] || 0) + 1) % totalVendors })); }}
                        style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>›</button>
                    </div>
                  )}
                </div>
                {vendor ? (
                  <div style={{ padding: "8px 10px 10px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#2C1A0E", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor.name}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
                      {vendor.avgReviewScore > 0 && <span style={{ fontSize: 10, color: "#CCAB4A", fontWeight: 700 }}>⭐ {vendor.avgReviewScore.toFixed(1)}</span>}
                      {vendor.yearsOfExperience > 0 && <span style={{ fontSize: 10, color: "#9B7450" }}>⏱ {vendor.yearsOfExperience}y</span>}
                      {vendor.teamSize > 0 && <span style={{ fontSize: 10, color: "#9B7450" }}>👥 {vendor.teamSize}</span>}
                      {vendor.totalEventsCompleted > 0 && <span style={{ fontSize: 9.5, background: "rgba(196,122,46,0.08)", color: "#7A4A1A", borderRadius: 100, padding: "1px 5px", fontWeight: 700 }}>🎉 {vendor.totalEventsCompleted}+</span>}
                    </div>
                    {vendor.locations?.length > 0 && <div style={{ fontSize: 10, color: "#9B7450", marginBottom: 7 }}>📍 {vendor.locations.slice(0, 2).join(", ")}</div>}
                    <div style={{ marginTop: "auto", display: "flex", gap: 5 }}>
                      <button onClick={() => openQuickView(vendor)}
                        style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", touchAction: "manipulation" }}>
                        Quick View
                      </button>
                      <button onClick={() => openProfile(vendor)}
                        style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", touchAction: "manipulation" }}>
                        Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "14px", textAlign: "center", color: "#C4A882", fontSize: 12, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    No vendors in {formData?.location}
                    <button onClick={openChatWithSocket} style={{ background: "none", border: "none", color: "#C47A2E", fontWeight: 700, cursor: "pointer", fontSize: 11, padding: "4px 0 0", fontFamily: "'Outfit', sans-serif" }}>Chat with our team</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Corporate split screen ── */}
          {formData?.eventType === "Corporate Event" && authUser?.isAdmin && (
            <div style={{ width: "100%", maxWidth: 1100, marginBottom: 20 }}>
              <div style={{ background: "linear-gradient(135deg,#1a0f00,#2C1A0E)", borderRadius: 16, padding: "20px 24px", marginBottom: 14 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(204,171,74,0.15)", border: "1px solid rgba(204,171,74,0.3)", borderRadius: 100, padding: "3px 12px", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.1em" }}>🏢 Corporate Event</span>
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
                  {formData?.companyName && <span style={{ fontWeight: 700, color: "#CCAB4A" }}>{formData.companyName} · </span>}
                  {formData?.guests && <span>{formData.guests} employees · </span>}
                  {formData?.location}
                </div>
                <div style={{ fontSize: 11, color: "rgba(204,171,74,0.6)" }}>How would you like to proceed?</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* You Do It */}
                <div style={{ background: "#FFFCF5", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.2)", padding: "20px 20px 16px", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>Browse Yourself</div>
                  <div style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.5, marginBottom: 14, flex: 1 }}>Compare vendor profiles, chat directly, negotiate your own price.</div>
                  <button
                    onClick={() => { trackIgnored(selectedVendors); dispatch(setFilters({ serviceType: selectedVendors[0], eventType: formData?.eventType, locationType: formData?.location, date: formData?.date, guestCount: Number(formData?.guests) || 0 })); navigate("/listings?fromPlan=1", { state: { selectedCategories: selectedVendors } }); }}
                    style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                    Browse Vendors →
                  </button>
                </div>
                {/* Smart Planning */}
                <div style={{ background: "linear-gradient(135deg,rgba(196,122,46,0.06),rgba(204,171,74,0.04))", borderRadius: 14, border: "2px solid rgba(196,122,46,0.35)", padding: "20px 20px 16px", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>✨</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>Build My Package <span style={{ fontSize: 10, fontWeight: 700, background: "#C47A2E", color: "#fff", borderRadius: 100, padding: "2px 7px", marginLeft: 4 }}>Recommended</span></div>
                  <div style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.5, marginBottom: 14, flex: 1 }}>Tell us your budget once. We'll build a complete vendor package and coordinate everything.</div>
                  <button
                    onClick={() => { trackIgnored(selectedVendors); dispatch(setBookingType("let-us-do-it")); fetchSmartPlan(); }}
                    style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 3px 12px rgba(196,122,46,0.3)" }}>
                    Get Corporate Package →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Browse All Vendors — smart planning exit to normal flow */}
          <div style={{ width: "100%", maxWidth: 1100, marginBottom: 16, padding: "14px 20px", background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", boxShadow: "0 2px 8px rgba(196,122,46,0.06)" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>Didn't find the perfect vendor?</div>
              <div style={{ fontSize: 11.5, color: "#9B7450" }}>Browse all vendors with your budget and preferences already applied.</div>
            </div>
            <button
              onClick={() => {
                dispatch(setFilters({
                  serviceType: selectedVendors[0],
                  eventType: formData?.eventType || "",
                  locationType: formData?.location || "",
                  date: formData?.date || "",
                  guestCount: Number(formData?.guests) || 0,
                }));
                navigate("/listings?fromPlan=1", { state: { selectedCategories: selectedVendors } });
              }}
              style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>
              Browse All Vendors →
            </button>
          </div>

          {/* Decor Finder nudge */}
          {selectedVendors.includes("Decorator") && (
            <div style={{ width: "100%", maxWidth: 1100, marginBottom: 20, background: "linear-gradient(135deg,rgba(196,122,46,0.06),rgba(204,171,74,0.1))", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 14, padding: "13px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 26 }}>🎀</span>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>Want decor inspiration?</div>
                <div style={{ fontSize: 11.5, color: "#7A5535" }}>Browse real photos — Floral, Balloon, Minimalist &amp; more</div>
              </div>
              <button onClick={() => navigate("/decor-finder")} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Decor Finder →</button>
            </div>
          )}

          {/* Primary CTA */}
          <div style={{ width: "100%", maxWidth: 1100, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => { setWizardStep(0); setWizardAnswers({}); setShowWizard(true); }}
              style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 20px rgba(196,122,46,0.38)", letterSpacing: "0.01em" }}>
              Confirm This Package →
            </button>
            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={() => setSmartPlan(null)} style={{ background: "transparent", border: "1.5px solid rgba(196,122,46,0.3)", color: "#C47A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "8px 20px", borderRadius: 10, fontFamily: "'Outfit', sans-serif" }}>← Change Services</button>
              <button onClick={openChatWithSocket} style={{ background: "none", border: "none", color: "#9B7450", fontSize: 13, cursor: "pointer", textDecoration: "underline", fontFamily: "'Outfit', sans-serif" }}>Talk to our team</button>
            </div>
          </div>
        </div>
      </div>
      {/* Smart Plan QuickView side panel */}
      {spQuickView && (
        <>
          <div onClick={() => setSpQuickView(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1100 }} />
          <div style={{ position: "fixed", right: 0, top: 0, height: "100vh", width: 420, maxWidth: "92vw", background: "#FFFCF5", zIndex: 1101, overflowY: "auto", boxShadow: "-8px 0 48px rgba(139,69,19,0.18)", animation: "qv-slide 0.32s cubic-bezier(0.4,0,0.2,1)", fontFamily: "'Outfit',sans-serif" }}>
            {/* Cover */}
            <div style={{ position: "relative", height: 230, flexShrink: 0 }}>
              <img src={spQuickView.portfolioPhotos?.[0] || spQuickView.image || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80"} alt={spQuickView.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => setSpQuickView(null)} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              {spQuickView.avgReviewScore > 0 && (
                <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(196,122,46,0.92)", color: "#fff", borderRadius: 100, padding: "5px 12px", fontSize: 13, fontWeight: 700 }}>
                  ⭐ {Number(spQuickView.avgReviewScore).toFixed(1)}
                </div>
              )}
              <span style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(196,122,46,0.9)", color: "#fff", padding: "3px 9px", borderRadius: 20 }}>
                {spQuickView.serviceType}
              </span>
            </div>
            {/* Content — matches normal booking Quick View style */}
            <div style={{ padding: "18px 20px 80px" }}>
              {/* Name + category badge */}
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{spQuickView.name}</h2>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.12)", borderRadius: 100, padding: "3px 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{spQuickView.serviceType}</span>
                {spQuickView.isVerified && <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d", background: "rgba(21,128,61,0.1)", borderRadius: 100, padding: "3px 10px" }}>✓ Verified</span>}
                {spQuickView.isTopRated && <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309", background: "rgba(245,158,11,0.1)", borderRadius: 100, padding: "3px 10px" }}>⭐ Top Rated</span>}
              </div>

              {/* Location + exp + team chips */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                {(spQuickView.city || spQuickView.locations?.[0]) && <div style={{ fontSize: 12, color: "#5a3a1a", background: "#f5ede0", borderRadius: 20, padding: "5px 12px" }}>📍 {spQuickView.city || spQuickView.locations?.[0]}</div>}
                {spQuickView.yearsOfExperience > 0 && <div style={{ fontSize: 12, color: "#5a3a1a", background: "#f5ede0", borderRadius: 20, padding: "5px 12px" }}>⏱ {spQuickView.yearsOfExperience}y experience</div>}
                {spQuickView.teamSize > 0 && <div style={{ fontSize: 12, color: "#5a3a1a", background: "#f5ede0", borderRadius: 20, padding: "5px 12px" }}>👥 Team of {spQuickView.teamSize}</div>}
              </div>

              {/* ABOUT section — 2×2 grid */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>About</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Events Completed", value: spQuickView.totalEventsCompleted > 0 ? `${spQuickView.totalEventsCompleted}+` : "—" },
                    { label: "Team Size",         value: spQuickView.teamSize > 0 ? `${spQuickView.teamSize}` : "—" },
                    { label: "Experience",        value: spQuickView.yearsOfExperience > 0 ? `${spQuickView.yearsOfExperience} years` : "—" },
                    { label: "Serves",            value: spQuickView.locations?.length > 0 ? spQuickView.locations.slice(0,2).join(", ") : (spQuickView.city || "—") },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "#FFFCF5", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(196,122,46,0.1)" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPECIALTIES — only if data present */}
              {(spQuickView.cuisine?.length > 0 || spQuickView.serviceStyle?.length > 0 || spQuickView.menuType?.length > 0 || spQuickView.avgReviewScore > 0) && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Specialties</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {spQuickView.cuisine?.length > 0 && (
                      <div style={{ background: "#FFFCF5", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(196,122,46,0.1)" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Cuisine</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#2C1A0E", lineHeight: 1.4 }}>{(Array.isArray(spQuickView.cuisine) ? spQuickView.cuisine : [spQuickView.cuisine]).join(", ")}</div>
                      </div>
                    )}
                    {spQuickView.serviceStyle?.length > 0 && (
                      <div style={{ background: "#FFFCF5", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(196,122,46,0.1)" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Service Style</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#2C1A0E", lineHeight: 1.4 }}>{(Array.isArray(spQuickView.serviceStyle) ? spQuickView.serviceStyle : [spQuickView.serviceStyle]).join(", ")}</div>
                      </div>
                    )}
                    {spQuickView.menuType?.length > 0 && (
                      <div style={{ background: "#FFFCF5", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(196,122,46,0.1)" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Menu Type</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#2C1A0E", lineHeight: 1.4 }}>{(Array.isArray(spQuickView.menuType) ? spQuickView.menuType : [spQuickView.menuType]).join(", ")}</div>
                      </div>
                    )}
                    {spQuickView.avgReviewScore > 0 && (
                      <div style={{ background: "#FFFCF5", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(196,122,46,0.1)" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Rating</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#C47A2E" }}>⭐ {Number(spQuickView.avgReviewScore).toFixed(1)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ height: 1, background: "rgba(196,122,46,0.1)", margin: "0 0 16px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => { const v = spQuickView; setSpQuickView(null); openProfile(v); }}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Outfit',sans-serif", cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
                  View Profile →
                </button>
                <button
                  onClick={() => {
                    const v = spQuickView;
                    setSpQuickView(null);
                    dispatch(setBookingType("let-us-do-it"));
                    openVendorChat({ _id: v._id, name: v.name, serviceType: v.serviceType });
                  }}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, fontFamily: "'Outfit',sans-serif", cursor: "pointer" }}>
                  💬 Request to Chat
                </button>
              </div>
            </div>
          </div>
          <style>{`@keyframes qv-slide { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
        </>
      )}

      {/* ── Centered Full Profile modal (smart planner) ── */}
      {spProfileView && (
        <>
          <div onClick={() => setSpProfileView(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1200, backdropFilter: "blur(4px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1201, background: "#FFFCF5", borderRadius: 22, width: "95%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 28px 72px rgba(0,0,0,0.3)", fontFamily: "'Outfit',sans-serif" }}>
            {/* Hero photo */}
            <div style={{ position: "relative", height: 240, flexShrink: 0 }}>
              <img src={spProfileView.portfolioPhotos?.[0] || spProfileView.image || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80"} alt={spProfileView.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
              <button onClick={() => setSpProfileView(null)} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              {spProfileView.avgReviewScore > 0 && <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(196,122,46,0.95)", color: "#fff", borderRadius: 100, padding: "5px 13px", fontSize: 13, fontWeight: 700 }}>⭐ {Number(spProfileView.avgReviewScore).toFixed(1)}</div>}
              {spProfileView.isVerified && <div style={{ position: "absolute", top: 14, left: spProfileView.avgReviewScore > 0 ? 90 : 14, background: "rgba(21,128,61,0.92)", color: "#fff", borderRadius: 100, padding: "5px 13px", fontSize: 12, fontWeight: 700 }}>✓ Verified</div>}
              <div style={{ position: "absolute", bottom: 16, left: 18 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(196,122,46,0.9)", color: "#fff", padding: "3px 10px", borderRadius: 20 }}>{spProfileView.serviceType}</span>
                <h2 style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", fontWeight: 900, color: "#fff", margin: "6px 0 0", letterSpacing: "-0.01em" }}>{spProfileView.name}</h2>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "20px 24px 28px" }}>
              {/* Info chips */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {spProfileView.city && <span style={{ fontSize: 12, color: "#7A5535", background: "rgba(196,122,46,0.07)", borderRadius: 20, padding: "5px 13px", border: "1px solid rgba(196,122,46,0.15)" }}>📍 {spProfileView.city}</span>}
                {spProfileView.yearsOfExperience > 0 && <span style={{ fontSize: 12, color: "#7A5535", background: "rgba(196,122,46,0.07)", borderRadius: 20, padding: "5px 13px", border: "1px solid rgba(196,122,46,0.15)" }}>⏱ {spProfileView.yearsOfExperience}y exp</span>}
                {spProfileView.teamSize > 0 && <span style={{ fontSize: 12, color: "#7A5535", background: "rgba(196,122,46,0.07)", borderRadius: 20, padding: "5px 13px", border: "1px solid rgba(196,122,46,0.15)" }}>👥 Team {spProfileView.teamSize}</span>}
                {spProfileView.totalEventsCompleted > 0 && <span style={{ fontSize: 12, color: "#7A5535", background: "rgba(196,122,46,0.07)", borderRadius: 20, padding: "5px 13px", border: "1px solid rgba(196,122,46,0.15)" }}>🎉 {spProfileView.totalEventsCompleted}+ events</span>}
                {spProfileView.price > 0 && <span style={{ fontSize: 12, color: "#C47A2E", background: "rgba(196,122,46,0.07)", borderRadius: 20, padding: "5px 13px", border: "1px solid rgba(196,122,46,0.15)", fontWeight: 700 }}>₹{Number(spProfileView.price).toLocaleString("en-IN")}+</span>}
              </div>

              {/* Stats grid — like VendorDetails */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                {[
                  { label: "Rating",    value: spProfileView.avgReviewScore > 0 ? `⭐ ${Number(spProfileView.avgReviewScore).toFixed(1)}` : "—" },
                  { label: "Experience", value: spProfileView.yearsOfExperience > 0 ? `${spProfileView.yearsOfExperience} yrs` : "—" },
                  { label: "Team",      value: spProfileView.teamSize > 0 ? spProfileView.teamSize : "—" },
                  { label: "Events",    value: spProfileView.totalEventsCompleted > 0 ? `${spProfileView.totalEventsCompleted}+` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(196,122,46,0.1)", textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#2C1A0E" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Bio */}
              {spProfileView.bio && (
                <p style={{ fontSize: 13.5, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 18px", padding: "14px 16px", background: "rgba(196,122,46,0.04)", borderRadius: 12, border: "1px solid rgba(196,122,46,0.1)" }}>{spProfileView.bio}</p>
              )}

              {/* Portfolio photos */}
              {spProfileView.portfolioPhotos?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Portfolio</p>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                    {spProfileView.portfolioPhotos.slice(0, 8).map((photo, i) => (
                      <img key={i} src={photo} alt="" style={{ width: 100, height: 80, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: "1.5px solid rgba(196,122,46,0.12)" }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Locations */}
              {spProfileView.locations?.length > 0 && (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(196,122,46,0.04)", borderRadius: 10, border: "1px solid rgba(196,122,46,0.1)" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#7A5535" }}>📍 Serves: </span>
                  <span style={{ fontSize: 12, color: "#9B7450" }}>{spProfileView.locations.join(", ")}</span>
                </div>
              )}

              {/* Amenities / highlights if available */}
              {spProfileView.amenities?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Highlights</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {spProfileView.amenities.slice(0, 8).map((a, i) => (
                      <span key={i} style={{ fontSize: 11.5, color: "#5a3a1a", background: "rgba(196,122,46,0.06)", borderRadius: 100, padding: "3px 10px", border: "1px solid rgba(196,122,46,0.12)" }}>✓ {a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Request to Chat CTA */}
              <button
                onClick={() => {
                  setSpProfileView(null);
                  dispatch(setBookingType("let-us-do-it"));
                  openVendorChat({ _id: spProfileView._id, name: spProfileView.name, serviceType: spProfileView.serviceType });
                }}
                style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, fontFamily: "'Outfit',sans-serif", cursor: "pointer" }}>
                💬 Request to Chat
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 900px) { .smart-vendor-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 540px) { .smart-vendor-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      </>
    );
  }

  if (showVendorScreen && planLoading) {
    return (
      <>
      <div style={{ minHeight: "100vh", background: "#fff8f2", fontFamily: "'Outfit', sans-serif" }}>
        <BasicSpeedDial />
        <HamburgerNav active="Browse" noCompare />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 72px)", padding: "40px 20px", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, border: "5px solid rgba(196,122,46,0.15)", borderTopColor: "#C47A2E", borderRadius: "50%", animation: "tendr-spin 0.8s linear infinite", marginBottom: 32 }} />
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#2C1A0E", marginBottom: 10, letterSpacing: "-0.01em" }}>
            Building your plan…
          </h2>
          <p style={{ fontSize: 15, color: "#9B7450", maxWidth: 340 }}>
            Matching top vendors to your budget &amp; event preferences
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
            {selectedVendors.map(cat => (
              <span key={cat} style={{ padding: "5px 14px", borderRadius: 100, background: "rgba(196,122,46,0.1)", color: "#C47A2E", fontSize: 12, fontWeight: 700, border: "1.5px solid rgba(196,122,46,0.2)" }}>
                {cat === "Caterer" ? "🍽" : cat === "Decorator" ? "🎀" : cat === "Photographer" ? "📸" : "🎵"} {cat}
              </span>
            ))}
          </div>
        </div>
        <style>{`@keyframes tendr-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
      </>
    );
  }

  const fetchSmartPlan = async () => {
    if (selectedVendors.length === 0) return;
    setPlanLoading(true);
    setPlanError(false);
    setPlanErrorMsg("");
    try {
      const result = await getSmartPlan({
        eventType: formData?.eventType,
        guests: formData?.guests,
        location: formData?.location,
        categories: selectedVendors,
        categoryBudgets: savedCategoryBudgets,
      });
      setSmartPlan(result);
    } catch (err) {
      console.error('Smart plan fetch failed:', err);
      setPlanError(true);
      setPlanErrorMsg(err?.message || "Unknown error");
    } finally {
      setPlanLoading(false);
    }
  };

  if (showVendorScreen) {
    const isYouDoIt = bookingType === "you-do-it";

    return (
      <>
      <div
        className="min-h-screen w-full"
        style={{ background: "#fff8f2", fontFamily: "'Outfit', sans-serif" }}
      >
        <BasicSpeedDial />
        <HamburgerNav active="Browse" noCompare />


        <div className="w-full px-4 sm:px-8 lg:px-16 pt-10 pb-16 flex flex-col items-center">

          {/* Title */}
          <div className="text-center mb-6">
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, color: "#2C1A0E", letterSpacing: "-0.02em", marginBottom: 10 }}>
              Select Services You Need
            </h2>
            <p style={{ fontSize: 16, color: "#6B4226", fontWeight: 400 }}>
              {isYouDoIt
                ? "Choose one or more — we'll show you the best vendors next"
                : "Choose one or more — we'll instantly build your event lineup"}
            </p>
          </div>

          {/* ── Tendr Smart Suggestions strip ── */}
          {(() => {
            if (!formData.eventType) return null;
            const recs = getRecommendations({
              eventType: formData.eventType,
              guests: formData.guests,
              categoryBudgets: savedCategoryBudgets,
            });
            const guests = parseInt(formData.guests, 10);
            const hasGuests = guests > 0;
            const hasBudget = recs.totalBudget > 0;
            const fmtBudgetShort = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n / 1000)}k`;

            // Fire session tracking on first render of this strip
            startSession({
              eventType: formData.eventType,
              guestCount: guests || 0,
              budgetRange: hasBudget ? fmtBudgetShort(recs.totalBudget) : "",
              city: formData.location || "",
              userId: authUser?._id || null,
              recommendedServices: recs.services,
            });

            return (
              <div style={{ width: "100%", maxWidth: 1100, marginBottom: 28, borderRadius: 18, overflow: "hidden", background: "linear-gradient(135deg, #1a0f06 0%, #2C1A0E 55%, #3a1e0a 100%)", border: "1.5px solid rgba(204,171,74,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>

                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 0", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15 }}>✨</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#CCAB4A", letterSpacing: "0.06em", textTransform: "uppercase" }}>Tendr Suggests</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.02em" }}>
                    For your {formData.eventType}
                    {hasGuests ? ` · ${guests} Guest${guests === 1 ? "" : "s"}` : ""}
                    {hasBudget ? ` · ${fmtBudgetShort(recs.totalBudget)} Budget` : ""}
                  </span>
                </div>

                <div style={{ padding: "12px 20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* Recommended services */}
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                      Most customers planning similar events usually book
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {recs.services.map((svc) => (
                        <span key={svc} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "#fff", background: "rgba(204,171,74,0.14)", border: "1px solid rgba(204,171,74,0.3)", borderRadius: 100, padding: "5px 13px" }}>
                          <span style={{ color: "#CCAB4A", fontSize: 11, fontWeight: 900 }}>✓</span>
                          {SERVICE_LABELS[svc] || svc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Popular themes */}
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                      Popular themes
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {recs.themes.map((theme) => (
                        <span key={theme} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "4px 12px" }}>
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Planning tip */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 10 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>💡 </span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{recs.tip}</span>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* Vendor category cards */}
          {(() => {
            const recs = formData.eventType
              ? getRecommendations({ eventType: formData.eventType, guests: formData.guests, categoryBudgets: savedCategoryBudgets })
              : { services: [] };

            // Recommended cards first, then the rest
            const sortedVendors = [
              ...vendors.filter(v => recs.services.includes(v.id)),
              ...vendors.filter(v => !recs.services.includes(v.id)),
            ];

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full" style={{ maxWidth: 1100, marginBottom: 36 }}>
                {sortedVendors.map((vendor) => {
                  const isSelected = selectedVendors.includes(vendor.id);
                  const isRecommended = recs.services.includes(vendor.id);
                  const count = vendorCounts[vendor.id];
                  return (
                    <div
                      key={vendor.id}
                      onClick={() => {
                        if (isSelected) {
                          dispatch(removeSelectedVendor(vendor.id));
                          if (isRecommended) trackDeselect(vendor.id);
                        } else {
                          dispatch(addSelectedVendor(vendor.id));
                          if (isRecommended) { trackClick(vendor.id); trackSelect(vendor.id); }
                        }
                      }}
                      style={{
                        background: "#fff",
                        border: isSelected
                          ? "2.5px solid #C47A2E"
                          : isRecommended
                          ? "2px solid rgba(196,122,46,0.35)"
                          : "2px solid rgba(0,0,0,0.06)",
                        borderRadius: 20,
                        overflow: "hidden",
                        cursor: "pointer",
                        boxShadow: isSelected
                          ? "0 6px 24px rgba(196,122,46,0.22)"
                          : isRecommended
                          ? "0 4px 18px rgba(196,122,46,0.14)"
                          : "0 2px 12px rgba(0,0,0,0.07)",
                        transition: "all 0.22s ease",
                        position: "relative",
                        transform: isSelected ? "translateY(-3px)" : "translateY(0)",
                      }}
                    >
                      <div className="event-cat-img" style={{ position: "relative", height: 160, overflow: "hidden" }}>
                        <img
                          src={vendor.photo}
                          alt={vendor.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: isSelected ? "brightness(1.05)" : "brightness(0.92)", transition: "filter 0.22s" }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: isSelected ? "linear-gradient(to top, rgba(196,122,46,0.55) 0%, transparent 60%)" : "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)", transition: "background 0.22s" }} />

                        {/* Recommended badge — top left */}
                        {isRecommended && !isSelected && (
                          <div style={{ position: "absolute", top: 9, left: 9, background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", borderRadius: 100, padding: "3px 9px", display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 9, color: "#fff", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>✨ Recommended</span>
                          </div>
                        )}

                        {/* Selected checkmark — top right */}
                        <div style={{ position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: "50%", background: isSelected ? "#C47A2E" : "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: isSelected ? "#fff" : "transparent", fontSize: 13, fontWeight: 800, border: isSelected ? "none" : "2px solid rgba(255,255,255,0.7)", transition: "all 0.2s", backdropFilter: "blur(4px)" }}>
                          ✓
                        </div>
                      </div>

                      <div style={{ padding: "14px 16px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: "#C47A2E" }}>{vendor.icon}</span>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>{vendor.title}</h3>
                        </div>
                        <p style={{ fontSize: 12.5, color: "#7A5535", fontWeight: 400, margin: "0 0 8px", lineHeight: 1.45 }}>{vendor.description}</p>
                        {isYouDoIt && (
                          <span style={{ display: "inline-block", fontSize: 11.5, fontWeight: 600, color: count > 0 ? "#16a34a" : "#C47A2E", background: count > 0 ? "rgba(22,163,74,0.08)" : "rgba(196,122,46,0.1)", padding: "3px 9px", borderRadius: 100 }}>
                            {count !== undefined
                              ? formData?.date
                                ? `✓ ${count} available ${new Date(formData.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                                : `${count} vendors`
                              : "Checking..."}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Extra requirements chips — always visible, same for both flows */}
          {(() => {
            const EXTRA_GROUPS = [
              {
                label: "Infrastructure",
                items: [
                  { id: "Tables", emoji: "🪑" },
                  { id: "Mats / Carpets", emoji: "🏮" },
                  { id: "Generator", emoji: "🔌" },
                  { id: "Air Cooler", emoji: "❄️" },
                  { id: "Heater", emoji: "🔥" },
                  { id: "Fan Arrangement", emoji: "🌀" },
                  { id: "Washroom Setup", emoji: "🚻" },
                ],
              },
              {
                label: "Staff",
                items: [
                  { id: "Security Staff", emoji: "💂" },
                  { id: "Valet Parking", emoji: "🚗" },
                ],
              },
              {
                label: "Display",
                items: [
                  { id: "LED Screen", emoji: "📺" },
                  { id: "Standees", emoji: "🖼️" },
                  { id: "Welcome Board", emoji: "🪧" },
                ],
              },
            ];
            return (
              <div className="w-full mt-2" style={{ maxWidth: 1100, marginBottom: 32, padding: "18px 20px", background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.14)", boxShadow: "0 2px 8px rgba(196,122,46,0.05)" }}>
                <p style={{ fontSize: 13, color: "#2C1A0E", fontWeight: 700, marginBottom: 14, letterSpacing: "0.01em" }}>
                  Anything else needed at the venue?
                  {extraRequirements.length > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "2px 9px" }}>
                      {extraRequirements.length} selected
                    </span>
                  )}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {EXTRA_GROUPS.map(group => (
                    <div key={group.label}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{group.label}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {group.items.map(({ id, emoji }) => {
                          const on = extraRequirements.includes(id);
                          return (
                            <button
                              key={id}
                              onClick={() => dispatch(toggleExtraRequirement(id))}
                              style={{
                                padding: "6px 13px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                                fontFamily: "'Outfit', sans-serif", cursor: "pointer", transition: "all 0.15s",
                                border: on ? "1.5px solid #C47A2E" : "1.5px solid rgba(196,122,46,0.22)",
                                background: on ? "linear-gradient(135deg,rgba(196,122,46,0.14),rgba(204,171,74,0.12))" : "#FAFAF8",
                                color: on ? "#7A3A0E" : "#6B5540",
                                boxShadow: on ? "0 2px 8px rgba(196,122,46,0.15)" : "none",
                              }}
                            >
                              {emoji} {id}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Event form summary */}
          <div className="w-full mb-8" style={{ maxWidth: 1100 }}>
            <EventFormSummary />
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%", maxWidth: 860 }}>

            {/* Error state */}
            {planError && (
              <div style={{ background: "#fff8f2", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 14, padding: "18px 24px", textAlign: "center", maxWidth: 420, fontFamily: "'Outfit', sans-serif" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>😕</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", margin: "0 0 6px" }}>Couldn't build your plan right now</p>
                <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 14px" }}>Our server may be waking up — try again in a moment.</p>
                {planErrorMsg && <p style={{ fontSize: 11, color: "#bbb", margin: "0 0 12px", wordBreak: "break-all" }}>{planErrorMsg}</p>}
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button onClick={() => fetchSmartPlan()}
                    style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                    ↺ Try Again
                  </button>
                  <button onClick={() => { setPlanError(false); openConciergeChat(); }}
                    style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                    Talk to Our Team
                  </button>
                </div>
              </div>
            )}

            {/* Budget Modal — two column: per-category left, total right */}
            {showBudgetModal && (() => {
              const totalWeight = selectedVendors.reduce((s, c) => s + (SPLIT_PCT[c] || 25), 0) || 1;
              const splitAmounts = Object.fromEntries(
                selectedVendors.map(c => [c, Math.round(totalDraftBudget * (SPLIT_PCT[c] || 25) / totalWeight)])
              );
              return (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, paddingLeft: window.innerWidth >= 1024 ? 240 : 20, fontFamily: "'Outfit', sans-serif" }}>
                <div style={{ background: "#F8F4EF", borderRadius: 22, width: "100%", maxWidth: 860, boxShadow: "0 24px 64px rgba(0,0,0,0.35)", overflow: "hidden" }}>

                  {/* Header */}
                  <div style={{ background: "linear-gradient(135deg,#4A2810,#7A4020)", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: "#CCAB4A", margin: "0 0 3px" }}>How would you like to set your budget?</h3>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0 }}>Choose the approach that works best for you</p>
                    </div>
                    <button onClick={() => setShowBudgetModal(false)}
                      style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>

                  {/* Two columns — single column on mobile */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }} className="budget-modal-cols">

                    {/* LEFT — per-category sliders */}
                    <div style={{ padding: "24px 28px", borderRight: "1.5px solid rgba(196,122,46,0.15)" }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 3 }}>Set budget per service</div>
                        <div style={{ fontSize: 12, color: "#9B7450" }}>Set an upper limit for each category</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        {selectedVendors.map(cat => {
                          const range = CAT_BUDGET_RANGES[cat] || { min: 2000, max: 200000, step: 2000, default: 10000, emoji: "🏷️" };
                          const val = draftBudgets[cat] || range.default;
                          return (
                            <div key={cat}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{range.emoji} {cat}</span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: "#C47A2E" }}>Up to {fmtBudget(val)}</span>
                              </div>
                              <input type="range" min={range.min} max={range.max} step={range.step} value={val}
                                onChange={e => setDraftBudgets(p => ({ ...p, [cat]: Number(e.target.value) }))}
                                style={{ width: "100%", accentColor: "#C47A2E", cursor: "pointer" }} />
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb", marginTop: 2 }}>
                                <span>{fmtBudget(range.min)}</span><span>{fmtBudget(range.max)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button onClick={() => { setSmartPlanMode('perCategory'); confirmBudgets(); }}
                        style={{ width: "100%", marginTop: 18, padding: "12px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
                        Get My Plan →
                      </button>
                    </div>

                    {/* RIGHT — total budget with split */}
                    <div style={{ padding: "24px 28px" }}>
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 3 }}>Set your total budget</div>
                        <div style={{ fontSize: 12, color: "#9B7450" }}>We'll show you vendors that fit — you can adjust the split on the next screen</div>
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>💰 Total Budget</span>
                          <span style={{ fontSize: 22, fontWeight: 900, color: "#C47A2E" }}>{fmtBudget(totalDraftBudget)}</span>
                        </div>
                        <input type="range" min={5000} max={1000000} step={5000} value={totalDraftBudget}
                          onChange={e => setTotalDraftBudget(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#C47A2E", cursor: "pointer", height: 6 }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#bbb", marginTop: 4 }}>
                          <span>₹5,000</span><span>₹10,00,000</span>
                        </div>
                      </div>
                      <div style={{ padding: "12px 14px", background: "rgba(196,122,46,0.05)", borderRadius: 10, marginBottom: 20, fontSize: 12, color: "#9B7450", lineHeight: 1.6 }}>
                        After seeing your vendors, you'll be able to adjust how the budget is split across each service and change the % allocation.
                      </div>
                      <button
                        onClick={() => {
                          setSmartPlanMode('total');
                          setTotalPlanBudget(totalDraftBudget);
                          setSplitPct({ Caterer: 40, Decorator: 25, Photographer: 20, DJ: 15 });
                          const tw = selectedVendors.reduce((s, c) => s + (SPLIT_PCT[c] || 25), 0) || 1;
                          const sa = Object.fromEntries(selectedVendors.map(c => [c, Math.round(totalDraftBudget * (SPLIT_PCT[c] || 25) / tw)]));
                          if (budgetModalCallback) {
                            dispatch(setCategoryBudgets(sa));
                            setShowBudgetModal(false);
                            budgetModalCallback(sa);
                            setBudgetModalCallback(null);
                          }
                        }}
                        style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 14px rgba(44,26,14,0.25)" }}>
                        Get My Plan →
                      </button>
                    </div>
                  </div>

                  <style>{`@media(max-width:640px){.budget-modal-grid{grid-template-columns:1fr!important;}}`}</style>
                </div>
              </div>
              );
            })()}

            {/* You Do It — budget range popup (small window) */}
            {showYouDoItBudget && (
              <>
                <div onClick={() => setShowYouDoItBudget(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 9998 }} />
                <div style={{ position: "fixed", top: "50%", left: window.innerWidth >= 1024 ? "calc(50% + 110px)" : "50%", transform: "translate(-50%,-50%)", zIndex: 9999, background: "#FFFCF5", borderRadius: 18, width: "92%", maxWidth: 420, boxShadow: "0 20px 50px rgba(0,0,0,0.22)", overflow: "hidden", fontFamily: "'Outfit', sans-serif" }}>
                  {/* Header */}
                  <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 900, color: "#CCAB4A", margin: 0 }}>Set budget per service</h3>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "2px 0 0" }}>Adjust anytime while browsing</p>
                    </div>
                    <button onClick={() => setShowYouDoItBudget(false)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>
                  {/* Per-category sliders */}
                  <div style={{ padding: "14px 18px 18px", display: "flex", flexDirection: "column", gap: 14, maxHeight: "60vh", overflowY: "auto" }}>
                    {selectedVendors.map(cat => {
                      const range = CAT_BUDGET_RANGES[cat] || { min: 2000, max: 200000, step: 2000, default: 15000 };
                      const val = savedCategoryBudgets[cat] || range.default;
                      return (
                        <div key={cat}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{range.emoji || "🏷"} {cat}</span>
                            <span style={{ fontSize: 13, fontWeight: 900, color: "#C47A2E" }}>Up to {fmtBudget(val)}</span>
                          </div>
                          <input type="range" min={range.min} max={range.max} step={range.step} value={val}
                            onChange={e => dispatch(setCategoryBudgets({ ...savedCategoryBudgets, [cat]: Number(e.target.value) }))}
                            style={{ width: "100%", accentColor: "#C47A2E", cursor: "pointer", height: 5 }} />
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#bbb", marginTop: 1 }}>
                            <span>{fmtBudget(range.min)}</span><span>{fmtBudget(range.max)}</span>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => {
                        setShowYouDoItBudget(false);
                        dispatch(setFilters({ serviceType: selectedVendors[0], eventType: formData?.eventType || "", locationType: formData?.location || "", date: formData?.date || "", guestCount: Number(formData?.guests) || 0 }));
                        navigate("/listings?fromPlan=1", { state: { selectedCategories: selectedVendors } });
                      }}
                      style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 14px rgba(196,122,46,0.3)", marginTop: 2 }}>
                      Browse Vendors →
                    </button>
                  </div>
                </div>
              </>
            )}

            {isYouDoIt ? (
              <button
                disabled={selectedVendors.length === 0}
                onClick={() => { if (selectedVendors.length > 0) { const init = {}; selectedVendors.forEach(c => { init[c] = savedCategoryBudgets[c] || CAT_BUDGET_RANGES[c]?.default || 10000; }); dispatch(setCategoryBudgets(init)); setShowYouDoItBudget(true); } }}
                style={{ background: selectedVendors.length > 0 ? "linear-gradient(135deg, #C47A2E, #CCAB4A)" : "#e5e7eb", color: selectedVendors.length > 0 ? "#fff" : "#9ca3af", fontSize: 16, fontWeight: 700, padding: "14px 52px", borderRadius: 14, border: "none", cursor: selectedVendors.length > 0 ? "pointer" : "not-allowed", boxShadow: selectedVendors.length > 0 ? "0 4px 20px rgba(196,122,46,0.35)" : "none", transition: "all 0.2s", letterSpacing: "0.02em", fontFamily: "'Outfit', sans-serif" }}
                onMouseEnter={(e) => { if (selectedVendors.length > 0) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.45)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = selectedVendors.length > 0 ? "0 4px 20px rgba(196,122,46,0.35)" : "none"; }}
              >
                Set Budget & Browse →
              </button>
            ) : (
              <button
                disabled={selectedVendors.length === 0 || planLoading}
                onClick={() => {
                  if (selectedVendors.length === 0) return;
                  openBudgetModal(() => fetchSmartPlan());
                }}
                style={{ background: selectedVendors.length > 0 ? "linear-gradient(135deg, #C47A2E, #CCAB4A)" : "#e5e7eb", color: selectedVendors.length > 0 ? "#fff" : "#9ca3af", fontSize: 16, fontWeight: 700, padding: "14px 52px", borderRadius: 14, border: "none", cursor: selectedVendors.length > 0 && !planLoading ? "pointer" : "not-allowed", boxShadow: selectedVendors.length > 0 ? "0 4px 20px rgba(196,122,46,0.35)" : "none", transition: "all 0.2s", letterSpacing: "0.02em", fontFamily: "'Outfit', sans-serif" }}
                onMouseEnter={(e) => { if (selectedVendors.length > 0 && !planLoading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.45)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = selectedVendors.length > 0 ? "0 4px 20px rgba(196,122,46,0.35)" : "none"; }}
              >
                {planLoading ? "Building your plan…" : "Get My Plan →"}
              </button>
            )}

            <button
              onClick={() => dispatch(backToFormAction())}
              style={{ background: "transparent", border: "none", color: "#9B7450", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "4px 12px", fontFamily: "'Outfit', sans-serif" }}
            >
              ← Back to form
            </button>
          </div>

        </div>
      </div>

      </>
    );
  }



  // Guard: if step is out of range, render nothing until useEffect resets it
  if (!currentQuestion) return null;

  /** =======================
   *  QUESTION-BY-QUESTION FORM
   *  ======================= */

  return (
    <div className="min-h-screen bg-[#F8F4EF]">
      <HamburgerNav active="Plan" />
      <BasicSpeedDial />
      <SelectedVendorsFloat />
      <div className="flex items-center justify-center pt-4 pb-10 px-4 sm:px-6 md:px-10">
      <div className="w-full max-w-xl sm:max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-gray-600 text-xs sm:text-sm mb-2">
            <span>
              Question {currentStep + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>

          <div className="w-full bg-[#f3e8d4] rounded-full h-3 shadow-inner">
            <div
              className="rounded-full h-3 transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)" }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div
          className="bg-white rounded-3xl p-4 sm:p-8 mb-6 sm:mb-8 border border-white/50 shadow-xl event-question-card"
          style={{
            transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(12px)' : 'translateY(0)',
          }}
        >
          {/* Upper Part */}
          <div className="flex items-center mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mr-4 text-white shadow-lg text-2xl" style={{background:"linear-gradient(135deg,#C47A2E,#CCAB4A)"}}>
              {currentQuestion.icon}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                {currentQuestion.title}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {currentQuestion.subtitle}
              </p>
            </div>
          </div>

          {/* Input Types */}
          <div className="mb-8">
            {currentQuestion.type === "text" && (
              <input
                type="text"
                value={formData[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleInputChange(currentQuestion.id, e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder={currentQuestion.placeholder}
                className="w-full p-4 text-lg sm:text-xl bg-white border-2 border-[#CCAB4A] rounded-2xl text-gray-800 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-[#CCAB4A] focus:border-transparent transition-all duration-200"
                autoFocus
              />
            )}

            {currentQuestion.type === "number" && (
              <input
                type="number"
                value={formData[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleInputChange(currentQuestion.id, e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder={currentQuestion.placeholder}
                className="w-full p-4 text-lg sm:text-xl bg-white border-2 border-[#CCAB4A] rounded-2xl
              text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#CCAB4A] transition-all duration-200"
                autoFocus
              />
            )}

            {currentQuestion.type === "date" && (() => {
              const todayLocal = new Date();
              todayLocal.setHours(0, 0, 0, 0);
              const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;
              return (
                <input
                  type="date"
                  value={formData[currentQuestion.id] || ""}
                  min={todayStr}
                  onChange={(e) => {
                    if (e.target.value && e.target.value < todayStr) return;
                    handleInputChange(currentQuestion.id, e.target.value);
                  }}
                  style={{ width: "100%", boxSizing: "border-box", display: "block", maxWidth: "100%", minWidth: 0 }}
                  className="p-3 sm:p-4 text-base sm:text-lg bg-white border-2 border-[#CCAB4A] rounded-2xl text-gray-800 focus:ring-2 focus:ring-[#CCAB4A] transition-all duration-200"
                />
              );
            })()}

            {currentQuestion.type === "textarea" && (
              <textarea
                value={formData[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleInputChange(currentQuestion.id, e.target.value)
                }
                onKeyDown={handleTextareaKeyDown}
                placeholder={currentQuestion.placeholder}
                rows={4}
                className="w-full p-4 text-lg sm:text-xl bg-white border-2 border-[#CCAB4A] rounded-2xl
              text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#CCAB4A] transition-all duration-200 resize-none"
                autoFocus
              />
            )}

            {currentQuestion.type === "select" && (
              <>
                <div
                  className={currentQuestion.id !== "eventType" ? "space-y-3" : ""}
                  style={currentQuestion.id === "eventType" ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } : undefined}
                >
                  {currentQuestion.options.map((option, index) => (
                    <button
                      type="button"
                      key={index}
                      tabIndex={0}
                      onClick={() => {
                        if (currentQuestion.id === "eventType") {
                          dispatch(setFormData({ field: "eventType", value: option, token }));
                        } else {
                          selectAndAdvance(currentQuestion.id, option);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (currentQuestion.id === "eventType") {
                            dispatch(setFormData({ field: "eventType", value: option, token }));
                          } else {
                            selectAndAdvance(currentQuestion.id, option);
                          }
                        }
                      }}
                      className={`w-full text-left rounded-2xl transition-all duration-200
                      border-2 focus:outline-none focus:ring-2 focus:ring-[#CCAB4A] focus:ring-offset-2
                      ${currentQuestion.id === "eventType" ? "text-base p-3" : "text-lg sm:text-xl p-4"}
                      ${
                        formData[currentQuestion.id] === option
                          ? "border-[#C47A2E] text-gray-800 shadow-md"
                          : "bg-white border-[#e5d4b3] text-gray-700 hover:border-[#CCAB4A]"
                      }`}
                      style={formData[currentQuestion.id] === option ? {background:"rgba(196,122,46,0.1)"} : {}}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {currentQuestion.id === "eventType" && formData.eventType && (
                  <EventIdeasPanel eventType={formData.eventType} style={{ marginTop: 16 }} />
                )}
                {currentQuestion.id === "eventType" && (
                  <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(196,122,46,0.05)", border: "1.5px dashed rgba(196,122,46,0.35)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E" }}>🏠 Planning a home wedding or multi-day rituals?</div>
                      <div style={{ fontSize: 12, color: "#9B7450", marginTop: 3 }}>Haldi · Mehendi · Wedding — plan all days together</div>
                    </div>
                    <button onClick={() => navigate("/home-wedding-planner")} style={{ padding: "8px 16px", borderRadius: 9, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontWeight: 700, border: "none", fontFamily: "'Outfit',sans-serif", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                      Plan Now →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center w-full max-w-xl sm:max-w-2xl" style={{ gap: 12 }}>
          {/* PREVIOUS / BACK TO HOME on first step */}
          {currentStep === 0 ? (
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-base px-4 py-3 rounded-2xl transition-all duration-300 text-gray-600 hover:bg-white hover:text-black"
              style={{ flexShrink: 0 }}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Home
            </button>
          ) : (
            <button
              onClick={prevStep}
              disabled={animating}
              className={`flex items-center text-base px-4 py-3 rounded-2xl transition-all duration-300 flex-shrink-0
              ${animating ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-white hover:text-black"}`}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Prev
            </button>
          )}

          {/* NEXT */}
          <button
            onClick={nextStep}
            disabled={!formData[currentQuestion.id] || animating}
            style={{
              ...(formData[currentQuestion.id] && !animating ? { background: "linear-gradient(135deg,#C47A2E,#CCAB4A)" } : {}),
              flexShrink: 0, maxWidth: "calc(100% - 90px)"
            }}
            className={`flex items-center justify-center text-sm sm:text-base px-5 sm:px-8 py-3 rounded-2xl transition-all duration-300
            ${
              formData[currentQuestion.id] && !animating
                ? "text-white shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span className="hidden sm:inline">
              {currentStep === questions.length - 1 ? "Select Service Category" : "Next"}
            </span>
            <span className="sm:hidden">
              {currentStep === questions.length - 1 ? "Continue" : "Next"}
            </span>
            <ChevronRight className="w-5 h-5 ml-1 flex-shrink-0" />
          </button>
        </div>
      </div>
      </div>{/* closes flex wrapper */}
    </div>
  );


};

export default EventPlanning;
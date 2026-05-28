import React, { useEffect, useState, useRef } from "react";
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
} from "../../redux/eventPlanningSlice.js";

import { setFilters } from "../../redux/listingFiltersSlice";

import MakeAGroup_Nav from "../../components/MakeAGroup_Nav.jsx";
import EventFormSummary from "../../components/EventFormSummary.jsx";
import { getVendors, getSmartPlan, confirmSmartPlan } from "../../apis/vendorApi.js";
import BasicSpeedDial from "../../components/BasicSpeedDial.jsx";
import SelectedVendorsFloat from "../../components/SelectedVendorsFloat";
import JourneyProgress from "../../components/JourneyProgress";
import HamburgerNav from "../../components/HamburgerNav";

const EventPlanning = () => {
  // openChatWithSocket replaced by openConciergeChat — opens the same VendorChatModal window
  const openChatWithSocket = () => {
    openConciergeChat(); // opens Tendr Concierge in the centered chat modal
  };






  // Navigation handlers for checklist and timeline
  const handleGoToChecklist = () => {
    navigate('/prebuilt-checklist');
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
  const [showSplitAdjust, setShowSplitAdjust] = useState(false);
  const [customSplit, setCustomSplit] = useState(null);
  const [draftSplit, setDraftSplit] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState({});
  const [planSubmitted, setPlanSubmitted] = useState(false);
  const [confirmedPlan, setConfirmedPlan] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const dispatch = useDispatch();
  const {
    currentStep,
    formData,
    showVendorScreen,
    bookingType,
    selectedVendors,
  } = useSelector((state) => state.eventPlanning);
  const { token, user: authUser } = useSelector((state) => state.auth);

  // pick bookingType from URL (?bookingType=you-do-it | let-us-do-it)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("bookingType");
    if (t === "you-do-it" || t === "let-us-do-it") {
      dispatch(setBookingType(t));
    } else {
      dispatch(setBookingType("you-do-it"));
    }

    // Pre-fill budget from Budget Allocator context if available
    try {
      const ctx = JSON.parse(sessionStorage.getItem("tendr_budget_ctx") || "null");
      if (ctx?.maxBudget) {
        const budget = Number(ctx.maxBudget);
        // Map to nearest budget option
        let option = "Over ₹50,000";
        if (budget < 1000)         option = "Under ₹1,000";
        else if (budget < 5000)    option = "₹1,000 - ₹5,000";
        else if (budget < 10000)   option = "₹5,000 - ₹10,000";
        else if (budget < 25000)   option = "₹10,000 - ₹25,000";
        else if (budget <= 50000)  option = "₹25,000 - ₹50,000";
        dispatch(setFormData({ field: "budget", value: option }));
      }
    } catch {}
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
        "Office Party",
        "Anniversary",
        "Pre Wedding",
        "Rituals",
        "Festival",
        "Others",
      ],
      icon: <Calendar className="w-8 h-8" />,
    },
    {
      id: "guests",
      title: "How many guests will attend?",
      subtitle: "An approximate number is fine",
      type: "number",
      placeholder: "e.g., 50",
      icon: <Users className="w-8 h-8" />,
    },
    {
      id: "budget",
      title: "What's your total budget?",
      subtitle: "This helps vendors provide appropriate options",
      type: "select",
      options: [
        "Under ₹1,000",
        "₹1,000 - ₹5,000",
        "₹5,000 - ₹10,000",
        "₹10,000 - ₹25,000",
        "₹25,000 - ₹50,000",
        "Over ₹50,000",
      ],
      icon: <IndianRupee className="w-8 h-8" />,
    },
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
  }, [showVendorScreen]);

  const handleInputChange = (field, value) => {
    dispatch(setFormData({ field, value }));
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
    dispatch(setFormData({ field, value }));
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
    const SPLIT_DEFAULTS = { Caterer: 40, Decorator: 25, Photographer: 20, DJ: 15 };
    const split = customSplit || Object.fromEntries(selectedVendors.map(c => [c, SPLIT_DEFAULTS[c] || 25]));
    const splitTotal = selectedVendors.reduce((s, c) => s + (split[c] || 0), 0) || 100;

    const currentVendors = smartPlan.lineup.map(({ category, vendors: vs }) => {
      const offset = vendorOffset[category] || 0;
      const vendor = vs.length > 0 ? vs[offset % vs.length] : null;
      const adjustedCost = Math.round(smartPlan.totalBudget * ((split[category] || 25) / splitTotal));
      return { category, estimatedCost: adjustedCost, vendor, totalVendors: vs.length };
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
          vendorSlots: currentVendors.map(({ category, estimatedCost, vendor }) => ({ category, percentage: split[category] || 25, estimatedCost, vendorId: vendor?._id || null, vendorName: vendor?.name || '', status: 'Pending' })),
          wizardAnswers,
        });
        setConfirmedPlan(result.plan);
      } catch {}
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
          {[{ l: "Event", v: formData?.eventType }, { l: "Date", v: formData?.date }, { l: "Location", v: formData?.location }, { l: "Guests", v: formData?.guests }, { l: "Budget", v: formData?.budget }].filter(r => r.v).map(r => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(196,122,46,0.05)", borderRadius: 10, border: "1px solid rgba(196,122,46,0.12)" }}>
              <span style={{ fontSize: 13, color: "#9B7450", fontWeight: 600 }}>{r.l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{r.v}</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "#9B7450", textAlign: "center", marginTop: 4 }}>These details will be sent to all your vendors.</p>
        </div>
      );
      if (id === 'caterer') return (
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
        </div>
      );
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
        </div>
      );
      return null;
    };

    // ── Progress tracker (post-submit) ─────────────────────────────────────
    if (planSubmitted) {
      return (
        <>
        <div style={{ minHeight: "100vh", background: "#fff8f2", fontFamily: "'Outfit', sans-serif" }}>
          <BasicSpeedDial />
          <HamburgerNav active="Browse" noSidebar />
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 20px 80px", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#2C1A0E", marginBottom: 10 }}>Your plan is confirmed!</h2>
            <p style={{ fontSize: 14, color: "#9B7450", marginBottom: 32, maxWidth: 340, margin: "0 auto 32px" }}>
              Our team will coordinate with all vendors and get back to you within 2 hours.
            </p>
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.18)", overflow: "hidden", marginBottom: 28 }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(196,122,46,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E" }}>Package Progress</span>
                <span style={{ fontSize: 11, background: "rgba(196,122,46,0.1)", color: "#C47A2E", padding: "2px 10px", borderRadius: 100, fontWeight: 700 }}>{formData?.eventType || "Event"}</span>
              </div>
              {currentVendors.map(({ category, estimatedCost, vendor }) => (
                <div key={category} style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1px solid rgba(196,122,46,0.07)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{category === "Caterer" ? "🍽" : category === "Decorator" ? "🎀" : category === "Photographer" ? "📸" : "🎵"}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{vendor?.name || category}</div>
                      <div style={{ fontSize: 11, color: "#9B7450" }}>{fmt(estimatedCost)}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 100, background: "rgba(234,179,8,0.1)", color: "#a16207", border: "1px solid rgba(234,179,8,0.3)" }}>Pending</span>
                </div>
              ))}
            </div>
            {/* Planning tools nudge */}
            <div style={{ marginBottom: 28, textAlign: "left" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, textAlign: "center" }}>Keep your planning on track</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button onClick={() => navigate("/prebuilt-timeline")}
                  style={{ padding: "16px 14px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "left", transition: "all 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.2)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>⏱️</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 3 }}>Event Timeline</div>
                  <div style={{ fontSize: 11, color: "#9B7450", lineHeight: 1.4 }}>Track every milestone leading up to your event</div>
                </button>
                <button onClick={() => navigate("/prebuilt-checklist")}
                  style={{ padding: "16px 14px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "left", transition: "all 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.2)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 3 }}>Planning Checklist</div>
                  <div style={{ fontSize: 11, color: "#9B7450", lineHeight: 1.4 }}>Never miss a detail with a ready-made checklist</div>
                </button>
              </div>
            </div>

            <button onClick={() => navigate("/")} style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Back to Home
            </button>
          </div>
        </div>
        </>
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
        <HamburgerNav active="Browse" noSidebar />

        <div className="w-full px-4 sm:px-6 lg:px-12 pt-8 pb-24 flex flex-col items-center">

          {/* Package header card */}
          <div style={{ width: "100%", maxWidth: 680, marginBottom: 20 }}>
            <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 20, padding: "22px 24px", color: "#fff", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -24, right: -24, width: 110, height: 110, borderRadius: "50%", background: "rgba(204,171,74,0.07)" }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(204,171,74,0.8)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>✨ Your Event Package</div>
              <h2 style={{ fontSize: "clamp(1.1rem,2.5vw,1.5rem)", fontWeight: 900, color: "#CCAB4A", marginBottom: 8, letterSpacing: "-0.01em" }}>
                {formData?.eventType || "Your Event"} — {fmt(smartPlan.totalBudget)} budget
              </h2>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                {formData?.location && <span>📍 {formData.location}</span>}
                {formData?.date && <span>📅 {formData.date}</span>}
                {formData?.guests && <span>👥 {formData.guests} guests</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {currentVendors.filter(cv => cv.vendor).map(cv => (
                  <span key={cv.category} style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 100, background: "rgba(204,171,74,0.15)", color: "#CCAB4A", border: "1px solid rgba(204,171,74,0.25)" }}>
                    {cv.category === "Caterer" ? "🍽" : cv.category === "Decorator" ? "🎀" : cv.category === "Photographer" ? "📸" : "🎵"} {cv.vendor.name}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {currentVendors.map(({ category, estimatedCost }) => (
                  <div key={category} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "7px 14px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600, marginBottom: 2 }}>{category} {split[category]}%</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#CCAB4A" }}>{fmt(estimatedCost)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Split adjust toggle */}
            <button
              onClick={() => {
                if (!showSplitAdjust) setDraftSplit({ ...split });
                setShowSplitAdjust(s => !s);
              }}
              style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              ⚙ {showSplitAdjust ? "Hide Adjust" : "Adjust Budget Split ▼"}
            </button>

            {showSplitAdjust && draftSplit && (
              <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.18)", padding: "16px 18px", marginTop: 6 }}>
                <p style={{ fontSize: 12, color: "#9B7450", marginBottom: 12, textAlign: "center" }}>Total must equal 100% · Min 10% per category</p>
                {selectedVendors.map(cat => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", width: 120 }}>{cat === "Caterer" ? "🍽" : cat === "Decorator" ? "🎀" : cat === "Photographer" ? "📸" : "🎵"} {cat}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => setDraftSplit(s => ({ ...s, [cat]: Math.max(10, (s[cat] || 25) - 5) }))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", minWidth: 36, textAlign: "center" }}>{draftSplit[cat] || 25}%</span>
                      <button onClick={() => setDraftSplit(s => ({ ...s, [cat]: Math.min(70, (s[cat] || 25) + 5) }))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                    <span style={{ fontSize: 12, color: "#9B7450", width: 64, textAlign: "right" }}>{fmt(Math.round(smartPlan.totalBudget * (draftSplit[cat] || 25) / 100))}</span>
                  </div>
                ))}
                {(() => { const tot = selectedVendors.reduce((s, c) => s + (draftSplit[c] || 0), 0); return (
                  <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: tot === 100 ? "#16a34a" : "#dc2626", textAlign: "center", marginBottom: 10 }}>Total: {tot}% {tot === 100 ? "✓" : `(${100 - tot > 0 ? "+" : ""}${100 - tot}% to go)`}</div>
                  <button onClick={() => { setCustomSplit({ ...draftSplit }); setShowSplitAdjust(false); }} disabled={tot !== 100}
                    style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: tot === 100 ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: tot === 100 ? "#fff" : "#9ca3af", fontSize: 13, fontWeight: 700, cursor: tot === 100 ? "pointer" : "not-allowed", fontFamily: "'Outfit', sans-serif" }}>Apply Split →</button>
                  </>
                ); })()}
              </div>
            )}
          </div>

          {/* Vendor cards — one per category */}
          <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
            {currentVendors.map(({ category, estimatedCost, vendor, totalVendors }) => (
              <div key={category} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.15)", overflow: "hidden", boxShadow: "0 2px 12px rgba(196,122,46,0.08)" }}>
                <div style={{ padding: "11px 18px 8px", borderBottom: "1px solid rgba(196,122,46,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{category === "Caterer" ? "🍽" : category === "Decorator" ? "🎀" : category === "Photographer" ? "📸" : "🎵"}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E" }}>{category}</span>
                  <span style={{ fontSize: 12, color: "#9B7450", marginLeft: "auto" }}>Budget: <strong style={{ color: "#C47A2E" }}>{fmt(estimatedCost)}</strong></span>
                </div>
                {vendor ? (
                  <>
                  <div style={{ padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 66, height: 66, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#f3ebe0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {vendor.portfolioPhotos?.[0] ? <img src={vendor.portfolioPhotos[0]} alt={vendor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 28 }}>{category === "Caterer" ? "🍽" : category === "Decorator" ? "🎀" : category === "Photographer" ? "📸" : "🎵"}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>{vendor.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                        {vendor.avgReviewScore > 0 && <span style={{ fontSize: 11, color: "#CCAB4A", fontWeight: 700 }}>{stars(vendor.avgReviewScore)} {vendor.avgReviewScore.toFixed(1)}</span>}
                        {vendor.totalEventsCompleted > 0 && <span style={{ fontSize: 10.5, background: "rgba(196,122,46,0.1)", color: "#7A4A1A", border: "1px solid rgba(196,122,46,0.18)", borderRadius: 100, padding: "2px 8px", fontWeight: 700 }}>🎉 {vendor.totalEventsCompleted}+</span>}
                        {vendor.yearsOfExperience > 0 && <span style={{ fontSize: 10.5, color: "#9B7450" }}>{vendor.yearsOfExperience} yrs</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>✓ Perfect for your event type &amp; location</div>
                    </div>
                  </div>
                  {expandedCat === category && (
                    <div style={{ padding: "0 18px 14px", borderTop: "1px solid rgba(196,122,46,0.08)" }}>
                      {vendor.portfolioPhotos?.length > 1 && (
                        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 8 }}>
                          {vendor.portfolioPhotos.slice(0, 4).map((p, i) => <img key={i} src={p} alt="" style={{ width: 72, height: 58, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />)}
                        </div>
                      )}
                      {vendor.locations?.length > 0 && <div style={{ fontSize: 11.5, color: "#9B7450" }}>📍 Serves: {vendor.locations.join(", ")}</div>}
                    </div>
                  )}
                  <div style={{ padding: "0 18px 14px", display: "flex", gap: 8 }}>
                    <button onClick={() => setExpandedCat(expandedCat === category ? null : category)}
                      style={{ padding: "8px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                      {expandedCat === category ? "▲ Less" : "▼ Profile"}
                    </button>
                    {totalVendors > 1 && (
                      <button onClick={() => { setVendorOffset(p => ({ ...p, [category]: ((p[category] || 0) + 1) % totalVendors })); setExpandedCat(null); }}
                        style={{ padding: "8px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.12)", background: "transparent", color: "#9B7450", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                        ↺ Try another
                      </button>
                    )}
                  </div>
                  </>
                ) : (
                  <div style={{ padding: "18px", textAlign: "center", color: "#C4A882", fontSize: 13 }}>
                    No vendors in {formData?.location} — <button onClick={openChatWithSocket} style={{ background: "none", border: "none", color: "#C47A2E", fontWeight: 700, cursor: "pointer", fontSize: 13, padding: 0, fontFamily: "'Outfit', sans-serif" }}>chat with our team</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Decor Finder nudge */}
          {selectedVendors.includes("Decorator") && (
            <div style={{ width: "100%", maxWidth: 680, marginBottom: 20, background: "linear-gradient(135deg,rgba(196,122,46,0.06),rgba(204,171,74,0.1))", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 14, padding: "13px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 26 }}>🎀</span>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>Want decor inspiration?</div>
                <div style={{ fontSize: 11.5, color: "#7A5535" }}>Browse real photos — Floral, Balloon, Minimalist &amp; more</div>
              </div>
              <button onClick={() => navigate("/decor-finder")} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Decor Finder →</button>
            </div>
          )}

          {/* Primary CTA */}
          <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
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
      </>
    );
  }

  if (showVendorScreen && planLoading) {
    return (
      <>
      <div style={{ minHeight: "100vh", background: "#fff8f2", fontFamily: "'Outfit', sans-serif" }}>
        <BasicSpeedDial />
        <HamburgerNav active="Browse" noSidebar />
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
        budget: formData?.budget,
        location: formData?.location,
        categories: selectedVendors,
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
        <HamburgerNav active="Browse" noSidebar />


        <div className="w-full px-4 sm:px-8 lg:px-16 pt-10 pb-16 flex flex-col items-center">

          {/* Title */}
          <div className="text-center mb-10">
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, color: "#2C1A0E", letterSpacing: "-0.02em", marginBottom: 10 }}>
              Select Services You Need
            </h2>
            <p style={{ fontSize: 16, color: "#6B4226", fontWeight: 400 }}>
              {isYouDoIt
                ? "Choose one or more — we'll show you the best vendors next"
                : "Choose one or more — we'll instantly build your event lineup"}
            </p>
          </div>

          {/* Vendor category cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full" style={{ maxWidth: 1100, marginBottom: 36 }}>
            {vendors.map((vendor) => {
              const isSelected = selectedVendors.includes(vendor.id);
              const count = vendorCounts[vendor.id];
              return (
                <div
                  key={vendor.id}
                  onClick={() =>
                    isSelected
                      ? dispatch(removeSelectedVendor(vendor.id))
                      : dispatch(addSelectedVendor(vendor.id))
                  }
                  style={{
                    background: "#fff",
                    border: isSelected ? "2.5px solid #C47A2E" : "2px solid rgba(0,0,0,0.06)",
                    borderRadius: 20,
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 6px 24px rgba(196,122,46,0.22)" : "0 2px 12px rgba(0,0,0,0.07)",
                    transition: "all 0.22s ease",
                    position: "relative",
                    transform: isSelected ? "translateY(-3px)" : "translateY(0)",
                  }}
                >
                  <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                    <img
                      src={vendor.photo}
                      alt={vendor.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: isSelected ? "brightness(1.05)" : "brightness(0.92)", transition: "filter 0.22s" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: isSelected ? "linear-gradient(to top, rgba(196,122,46,0.55) 0%, transparent 60%)" : "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)", transition: "background 0.22s" }} />
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
                      <span style={{ display: "inline-block", fontSize: 11.5, fontWeight: 600, color: "#C47A2E", background: "rgba(196,122,46,0.1)", padding: "3px 9px", borderRadius: 100 }}>
                        {count !== undefined ? `${count} vendors` : "Loading..."}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Need anything else? — always visible, same for both flows */}
          <div className="w-full mt-2" style={{ maxWidth: 1100, marginBottom: 32 }}>
            <p style={{ fontSize: 14, color: "#9B7450", fontWeight: 600, marginBottom: 10, letterSpacing: "0.01em" }}>
              Need anything else?
            </p>
            <textarea
              value={extraRequirementsText}
              onChange={(e) => setExtraRequirementsText(e.target.value)}
              rows={3}
              placeholder="Tell us about any other requirements (e.g., table tent, mats, bartender, cooler, mic stand, chairs, projector...)"
              style={{ width: "100%", padding: "14px 16px", fontSize: 14, fontFamily: "'Outfit', sans-serif", background: "#fff", border: "2px solid rgba(196,122,46,0.2)", borderRadius: 16, color: "#2C1A0E", outline: "none", resize: "vertical", boxSizing: "border-box", transition: "border-color 0.18s" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(196,122,46,0.55)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(196,122,46,0.2)")}
            />
          </div>

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

            {isYouDoIt ? (
              <button
                disabled={selectedVendors.length === 0}
                onClick={() => {
                  if (selectedVendors.length === 0) return;
                  dispatch(setFilters({ serviceType: selectedVendors[0], eventType: formData?.eventType || "", locationType: formData?.location || "", date: formData?.date || "", guestCount: Number(formData?.guests) || 0 }));
                  navigate("/listings", { state: { selectedCategories: selectedVendors } });
                }}
                style={{ background: selectedVendors.length > 0 ? "linear-gradient(135deg, #C47A2E, #CCAB4A)" : "#e5e7eb", color: selectedVendors.length > 0 ? "#fff" : "#9ca3af", fontSize: 16, fontWeight: 700, padding: "14px 52px", borderRadius: 14, border: "none", cursor: selectedVendors.length > 0 ? "pointer" : "not-allowed", boxShadow: selectedVendors.length > 0 ? "0 4px 20px rgba(196,122,46,0.35)" : "none", transition: "all 0.2s", letterSpacing: "0.02em", fontFamily: "'Outfit', sans-serif" }}
                onMouseEnter={(e) => { if (selectedVendors.length > 0) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.45)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = selectedVendors.length > 0 ? "0 4px 20px rgba(196,122,46,0.35)" : "none"; }}
              >
                Continue Booking →
              </button>
            ) : (
              <button
                disabled={selectedVendors.length === 0 || planLoading}
                onClick={() => fetchSmartPlan()}
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
          className="bg-white rounded-3xl p-6 sm:p-8 mb-8 border border-white/50 shadow-xl"
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

            {currentQuestion.type === "date" && (
              <input
                type="date"
                value={formData[currentQuestion.id] || ""}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                className="w-full p-4 text-lg sm:text-xl bg-white border-2 border-[#CCAB4A]
              rounded-2xl text-gray-800 focus:ring-2 focus:ring-[#CCAB4A] transition-all duration-200"
              />
            )}

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
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    type="button"
                    key={index}
                    tabIndex={0}
                    onClick={() => selectAndAdvance(currentQuestion.id, option)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        selectAndAdvance(currentQuestion.id, option);
                      }
                    }}
                    className={`w-full text-lg sm:text-xl p-4 text-left rounded-2xl transition-all duration-200
                    border-2 focus:outline-none focus:ring-2 focus:ring-[#CCAB4A] focus:ring-offset-2
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
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center w-full max-w-xl sm:max-w-2xl">
          {/* PREVIOUS / BACK TO HOME on first step */}
          {currentStep === 0 ? (
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-base sm:text-lg px-4 sm:px-6 py-3 rounded-2xl transition-all duration-300 text-gray-600 hover:bg-white hover:text-black hover:scale-105 hover:-translate-y-1"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Home
            </button>
          ) : (
            <button
              onClick={prevStep}
              disabled={animating}
              className={`flex items-center text-base sm:text-lg px-4 sm:px-6 py-3 rounded-2xl transition-all duration-300
              ${animating ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-white hover:text-black hover:scale-105 hover:-translate-y-1"}`}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>
          )}

          {/* NEXT */}
          <button
            onClick={nextStep}
            disabled={!formData[currentQuestion.id] || animating}
            style={formData[currentQuestion.id] && !animating ? { background: "linear-gradient(135deg,#C47A2E,#CCAB4A)" } : {}}
            className={`flex items-center text-base sm:text-lg px-6 sm:px-8 py-3 rounded-2xl transition-all duration-300
            ${
              formData[currentQuestion.id] && !animating
                ? "text-white transform hover:scale-105 hover:-translate-y-1 shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {currentStep === questions.length - 1
              ? "Select Service Category"
              : "Next"}
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
      </div>{/* closes flex wrapper */}
    </div>
  );


};

export default EventPlanning;
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
import { getVendors, getSmartPlan } from "../../apis/vendorApi.js";
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

  const dispatch = useDispatch();
  const {
    currentStep,
    formData,
    showVendorScreen,
    bookingType,
    selectedVendors,
  } = useSelector((state) => state.eventPlanning);
  const { token } = useSelector((state) => state.auth);

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
      const rounded = Math.round(n * 2) / 2;
      return "★".repeat(Math.floor(rounded)) + (rounded % 1 ? "½" : "") + "☆".repeat(5 - Math.ceil(rounded));
    };

    return (
      <>
      <div className="min-h-screen w-full" style={{ background: "#fff8f2", fontFamily: "'Outfit', sans-serif" }}>
        <BasicSpeedDial />
        <HamburgerNav active="Browse" noSidebar />

        <div className="w-full px-4 sm:px-8 lg:px-16 pt-10 pb-20 flex flex-col items-center">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36, maxWidth: 700 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "5px 16px", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#C47A2E" }}>✨ Your Personalised Plan</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, color: "#2C1A0E", letterSpacing: "-0.02em", marginBottom: 10 }}>
              Here's Your Event Lineup
            </h2>
            <p style={{ fontSize: 15, color: "#6B4226" }}>
              Based on your {fmt(smartPlan.totalBudget)} budget for {formData?.eventType || "your event"} in {formData?.location || "your city"}.
              Chat directly with any vendor to confirm pricing.
            </p>
          </div>

          {/* Budget breakdown pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: selectedVendors.includes("Decorator") ? 20 : 44 }}>
            {smartPlan.lineup.map(({ category, estimatedCost }) => (
              <span key={category} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 100, padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#2C1A0E", boxShadow: "0 1px 4px rgba(196,122,46,0.08)" }}>
                <span style={{ color: "#C47A2E" }}>
                  {category === "Caterer" ? "🍽" : category === "Decorator" ? "🎀" : category === "Photographer" ? "📸" : "🎵"}
                </span>
                {category}: <span style={{ color: "#C47A2E" }}>{fmt(estimatedCost)}</span>
              </span>
            ))}
          </div>

          {/* Decor Finder nudge card */}
          {selectedVendors.includes("Decorator") && (
            <div style={{ width: "100%", maxWidth: 700, marginBottom: 36, background: "linear-gradient(135deg, rgba(196,122,46,0.06), rgba(204,171,74,0.1))", border: "1.5px solid rgba(196,122,46,0.22)", borderRadius: 16, padding: "16px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 30 }}>🎀</span>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 3 }}>Get decor inspiration first</div>
                <div style={{ fontSize: 12.5, color: "#7A5535" }}>Browse real vendor photos by theme — Floral, Balloon Art, Lighting &amp; more</div>
              </div>
              <button
                onClick={() => navigate("/decor-finder")}
                style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
              >
                Try Decor Finder →
              </button>
            </div>
          )}

          {/* Per-category vendor cards */}
          <div style={{ width: "100%", maxWidth: 1100, display: "flex", flexDirection: "column", gap: 40 }}>
            {smartPlan.lineup.map(({ category, estimatedCost, vendors: catVendors }) => (
              <div key={category}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16, borderBottom: "1.5px solid rgba(196,122,46,0.15)", paddingBottom: 10 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>{category}</h3>
                  <span style={{ fontSize: 13, color: "#9B7450" }}>estimated {fmt(estimatedCost)}</span>
                </div>

                {catVendors.length === 0 ? (
                  <div style={{ padding: "24px 16px", borderRadius: 14, border: "2px dashed rgba(196,122,46,0.2)", textAlign: "center", color: "#C4A882", fontSize: 14 }}>
                    No {category.toLowerCase()} vendors available in {formData?.location} right now —{" "}
                    <button onClick={openChatWithSocket} style={{ background: "none", border: "none", color: "#C47A2E", fontWeight: 700, cursor: "pointer", fontSize: 14, padding: 0, fontFamily: "'Outfit', sans-serif" }}>
                      chat with our team
                    </button>
                    {" "}and we'll help you find one.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {catVendors.map((vendor, vi) => (
                      <div key={vendor._id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: vi === 0 ? "0 4px 20px rgba(196,122,46,0.15)" : "0 2px 10px rgba(196,122,46,0.08)", border: vi === 0 ? "1.5px solid rgba(196,122,46,0.22)" : "1.5px solid rgba(196,122,46,0.1)", display: "flex", flexDirection: "row" }}>
                        {/* Photo */}
                        <div style={{ width: vi === 0 ? 150 : 100, flexShrink: 0, position: "relative", overflow: "hidden", background: "#f3ebe0" }}>
                          {vendor.portfolioPhotos?.[0] ? (
                            <img src={vendor.portfolioPhotos[0]} alt={vendor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: vi === 0 ? 36 : 28 }}>
                              {category === "Caterer" ? "🍽" : category === "Decorator" ? "🎀" : category === "Photographer" ? "📸" : "🎵"}
                            </div>
                          )}
                          {vi === 0 && (
                            <div style={{ position: "absolute", top: 8, left: 8, background: "#CCAB4A", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                              Top Pick
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, padding: vi === 0 ? "16px 18px" : "12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                          <div>
                            <div style={{ fontSize: vi === 0 ? 15 : 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 5 }}>{vendor.name}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                              {vendor.avgReviewScore > 0 && (
                                <span style={{ fontSize: 11, color: "#CCAB4A", fontWeight: 700 }}>{stars(vendor.avgReviewScore)} <span style={{ color: "#9B7450" }}>({vendor.avgReviewScore.toFixed(1)})</span></span>
                              )}
                              {vendor.totalEventsCompleted > 0 && (
                                <span style={{ fontSize: 10.5, fontWeight: 700, background: "rgba(196,122,46,0.1)", color: "#7A4A1A", border: "1px solid rgba(196,122,46,0.18)", borderRadius: 100, padding: "2px 8px" }}>
                                  🎉 {vendor.totalEventsCompleted}+ events
                                </span>
                              )}
                            </div>
                            {vendor.yearsOfExperience > 0 && (
                              <div style={{ fontSize: 11, color: "#9B7450" }}>{vendor.yearsOfExperience} yr{vendor.yearsOfExperience !== 1 ? "s" : ""} exp</div>
                            )}
                          </div>
                          <button
                            onClick={() => openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType })}
                            style={{ marginTop: 10, padding: vi === 0 ? "10px 0" : "7px 0", borderRadius: 9, border: vi === 0 ? "none" : "1.5px solid rgba(196,122,46,0.4)", background: vi === 0 ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "transparent", color: vi === 0 ? "#fff" : "#C47A2E", fontSize: vi === 0 ? 13 : 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: vi === 0 ? "0 3px 12px rgba(196,122,46,0.3)" : "none" }}
                          >
                            {vi === 0 ? "Chat & Confirm Price →" : "Chat →"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSmartPlan(null)}
              style={{ background: "transparent", border: "1.5px solid rgba(196,122,46,0.3)", color: "#C47A2E", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "9px 24px", borderRadius: 10, fontFamily: "'Outfit', sans-serif" }}
            >
              ← Change Services
            </button>
            <button
              onClick={openChatWithSocket}
              style={{ background: "none", border: "none", color: "#9B7450", fontSize: 13, cursor: "pointer", textDecoration: "underline", fontFamily: "'Outfit', sans-serif" }}
            >
              Prefer a human to plan this? Chat with our team
            </button>
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
                onClick={async () => {
                  if (selectedVendors.length === 0) return;
                  setPlanLoading(true);
                  try {
                    const result = await getSmartPlan({
                      eventType: formData?.eventType,
                      guests: formData?.guests,
                      budget: formData?.budget,
                      location: formData?.location,
                      categories: selectedVendors,
                    });
                    setSmartPlan(result);
                  } catch {
                    openChatWithSocket();
                  } finally {
                    setPlanLoading(false);
                  }
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
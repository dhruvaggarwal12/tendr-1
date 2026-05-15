import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

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
import { getVendors } from "../../apis/vendorApi.js";
import BasicSpeedDial from "../../components/BasicSpeedDial.jsx";
import SelectedVendorsFloat from "../../components/SelectedVendorsFloat";
import JourneyProgress from "../../components/JourneyProgress";

const EventPlanning = () => {
  const socketRef = useRef(null);
  const openChatWithSocket = () => {
    // Agar socket already connected nahi hai to connect karo
    if (!socketRef.current) {
      socketRef.current = io("https://tendr-backend-75ag.onrender.com", {
        query: {
          userId: localStorage.getItem("userId") || "guest",
          role: "user",
          chatType: "EVENT",
        }
      });

      // Socket connect hone ke baad event emit karna
      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current.id);

        socketRef.current.emit("open_conversation", {
          requestId: formData.eventName || `req_${Date.now()}`,
          chatType: "EVENT",
          extraRequirements,
          extraRequirementsText,
        });
      });

      // Backend se response suno
      socketRef.current.on("conversation_opened", (conversation) => {
        navigate("/chat", {
          state: {
            chatId: conversation._id,
            chatType: "EVENT",
            extraRequirements,
            extraRequirementsText,
          },
          replace: true,
        });
      });

      // Cleanup on unmount - optional if connection persists
      // useEffect me return kar sakte ho agar chahiye
    } else {
      // Agar socket already connected hai to directly event emit kar do
      socketRef.current.emit("open_conversation", {
        requestId: formData.eventName || `req_${Date.now()}`,
        chatType: "EVENT",
        extraRequirements,
        extraRequirementsText,
      });
    }
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
  const TRANSITION_MS = 350;
  const [activeModal, setActiveModal] = useState(null);
  const [extraRequirements, setExtraRequirements] = useState(false);
  const [showExtraReq, setShowExtraReq] = useState();
  const [extraRequirementsText, setExtraRequirementsText] = useState("");
  const [animating, setAnimating] = useState(false);

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
      photo: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=340&q=80",
    },
    {
      id: "Photographer",
      title: "Photography",
      icon: <Camera className="w-6 h-6" />,
      description: "Timeless memories, beautifully captured",
      photo: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=600&h=340&q=80",
    },
    {
      id: "DJ",
      title: "DJ & Music",
      icon: <Music className="w-6 h-6" />,
      description: "High-energy beats to keep the party alive",
      photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&h=340&q=80",
    },
    {
      id: "Decorator",
      title: "Decoration",
      icon: <Music className="w-6 h-6" />,
      description: "Stunning Indian themes and floral setups",
      photo: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&h=340&q=80",
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

  if (showVendorScreen) {
    const isYouDoIt = bookingType === "you-do-it";

    return (
      <>
      <div
        className="min-h-screen w-full"
        style={{ background: "#fff8f2", fontFamily: "'Outfit', sans-serif" }}
      >
        <BasicSpeedDial />
        <div style={{ background: "#fff", boxShadow: "0 1px 8px rgba(139,69,19,0.08)" }}>
          <MakeAGroup_Nav />
        </div>

        <div className="w-full px-4 sm:px-8 lg:px-16 pt-10 pb-16 flex flex-col items-center">

          {/* Title */}
          <div className="text-center mb-10">
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, color: "#2C1A0E", letterSpacing: "-0.02em", marginBottom: 10 }}>
              Select Services You Need
            </h2>
            <p style={{ fontSize: 16, color: "#6B4226", fontWeight: 400 }}>
              {isYouDoIt
                ? "Choose one or more — we'll show you the best vendors next"
                : "Choose one or more — we'll open a chat with your requirements"}
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
                disabled={selectedVendors.length === 0}
                onClick={() => { if (selectedVendors.length > 0) openChatWithSocket(); }}
                style={{ background: selectedVendors.length > 0 ? "linear-gradient(135deg, #C47A2E, #CCAB4A)" : "#e5e7eb", color: selectedVendors.length > 0 ? "#fff" : "#9ca3af", fontSize: 16, fontWeight: 700, padding: "14px 52px", borderRadius: 14, border: "none", cursor: selectedVendors.length > 0 ? "pointer" : "not-allowed", boxShadow: selectedVendors.length > 0 ? "0 4px 20px rgba(196,122,46,0.35)" : "none", transition: "all 0.2s", letterSpacing: "0.02em", fontFamily: "'Outfit', sans-serif" }}
                onMouseEnter={(e) => { if (selectedVendors.length > 0) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.45)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = selectedVendors.length > 0 ? "0 4px 20px rgba(196,122,46,0.35)" : "none"; }}
              >
                Chat with Us →
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
      <JourneyProgress active="Plan" />
      <BasicSpeedDial />
      <SelectedVendorsFloat />
      <div className="flex items-center justify-center p-4 sm:p-6 md:p-10">
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
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) selectAndAdvance(currentQuestion.id, val);
                }}
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
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../redux/giftHamperCartSlice";
import { selectFunCartItems, selectFunCartTotal, clearFunCart } from "../../redux/funActivitiesCartSlice";
import SEO from "../../components/SEO";
import { generateReferralCode, isValidFormat, parseCode, applyDiscount, DISCOUNT_PERCENT } from "../../utils/referral";
import { generateEventDetailsPDF } from "../../utils/pdfGenerator";

const BASE_URL = import.meta.env.VITE_BASE_URL;
import { clearFinalisedVendor } from "../../redux/listingFiltersSlice";
import { resetEventPlanning } from "../../redux/eventPlanningSlice";
import ListingsNav from "../../components/ListingsNav";
import HamburgerNav from "../../components/HamburgerNav";
import JourneyProgress from "../../components/JourneyProgress";
import BasicSpeedDial from "../../components/BasicSpeedDial";

const PRICE_RANGES = {
  Caterer:      [50000,  300000],
  Decorator:    [30000,  200000],
  Photographer: [20000,  150000],
  DJ:           [15000,   80000],
  Venue:       [100000, 1000000],
  Makeup:       [10000,   75000],
  Mehndi:        [8000,   50000],
  Band:          [25000, 150000],
  Planner:       [50000, 300000],
  Other:         [20000, 100000],
};

const seedRandom = (str = "") => {
  let s = 0;
  for (let i = 0; i < str.length; i++) s += str.charCodeAt(i);
  const x = Math.sin(s + 1) * 10000;
  return x - Math.floor(x);
};

const vendorPrice = (vendor) => {
  const cat = vendor?.serviceType || vendor?.primaryService || "Other";
  const [min, max] = PRICE_RANGES[cat] || PRICE_RANGES.Other;
  const r = seedRandom(vendor?._id || cat);
  return Math.round((min + r * (max - min)) / 1000) * 1000;
};

const formatINR = (n) => "Rs." + Number(n).toLocaleString("en-IN");

const LABEL_MAP = {
  eventName:      "Event Name",
  eventType:      "Event Type",
  guests:         "Guests",
  location:       "Location",
  date:           "Date",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80";

const ChevronIcon = ({ open }) => (
  <svg
    width="18" height="18" viewBox="0 0 18 18" fill="none"
    style={{ transition: "transform 0.22s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
  >
    <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="#9B7450" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Terms & Conditions content ────────────────────────────────────────────────
const TC_CONTENT = {
  General: {
    title: "General Terms",
    icon: "📋",
    points: [
      "The advance you pay locks in your vendors and date. No one else gets your slot after this.",
      "Final balance is due as per the schedule we share after confirmation — usually split into 1–2 parts.",
      "Cancellation refunds: 7+ days before → 50% back · 3–6 days before → 25% back · Under 72 hours → no refund, vendors have already blocked their time · Same-day or next-day bookings → no refund applies at all.",
      "If something changes on your end (guest count, venue, timing) — tell us 5 days before and we'll sort it. Last minute changes may cost extra.",
      "If a vendor cancels on you — that's on us to fix. Full refund of advance or we find you a replacement, your call.",
    ],
  },
  Decorator: {
    title: "Decorator",
    icon: "🎨",
    points: [
      "Whatever design, palette, and theme we've finalised — that's what gets executed. Changes after this point may cost extra.",
      "Please make sure the venue allows the team in 2–3 hours before the event. If they can't get access on time, we can't guarantee the setup will be complete — that's not on them.",
      "Decoration involves tape, pins, and sometimes small fixings on walls. Minor marks or nail holes are a normal part of the process — please check with your venue in advance if this is a concern.",
      "Props, stands, and equipment go back with the decorator after the event. Please make sure nothing is missing or damaged by guests.",
    ],
  },
  Caterer: {
    title: "Caterer",
    icon: "🍽️",
    points: [
      "Final headcount is locked 48 hours before. Food is prepared based on that number — we can't refund for fewer guests after that point.",
      "If you have any allergies or specific dietary needs in your guest list, please tell us now if you haven't already.",
      "We strongly suggest tasting the food before service begins — if anything needs adjusting, that's the right time to flag it. Changes after service has started may not be possible.",
      "Please do a quick plate and utensil count with the team before service starts — this avoids any confusion at the end of the event.",
      "Extra time beyond the agreed service window will be billed separately.",
    ],
  },
  DJ: {
    title: "DJ",
    icon: "🎧",
    points: [
      "Share your must-play and do-not-play songs before the event — the earlier the better.",
      "The booking covers the agreed number of hours. Short breaks of 5–10 minutes are normal. If you want to extend beyond the agreed time, that'll be charged at the hourly rate we agreed on.",
      "Please make sure the venue has a proper, stable power connection ready. Technical issues from bad or unstable power aren't the DJ's fault.",
      "If the venue has a noise curfew or local authorities ask to stop early — that's outside anyone's control and no refund applies for time lost due to that.",
    ],
  },
  Photographer: {
    title: "Photographer / Videographer",
    icon: "📸",
    points: [
      "At the start of the event, please take 2 minutes to introduce the photographer to key people — parents, couple, close family — and share who the important moments are with. This makes a huge difference to the final album.",
      "Edited photos come within 15–21 days. Videos take longer — 30–45 days depending on the package.",
      "If you have a shot list, share it before the event. We'll do our best but can't guarantee every shot, especially in crowded or outdoor settings.",
      "Raw/unedited files are only included if it was part of your package.",
    ],
  },
};

// Map vendor serviceType → T&C key
const TC_KEY_MAP = {
  Decorator:    "Decorator",
  Caterer:      "Caterer",
  DJ:           "DJ",
  Photographer: "Photographer",
  Videographer: "Photographer",
};

function TnCModal({ onClose, vendorTypes }) {
  const font = "'Outfit', sans-serif";
  const relevantKeys = ["General", ...vendorTypes.map(t => TC_KEY_MAP[t]).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i)];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 10200, background: "rgba(10,4,0,0.7)", backdropFilter: "blur(6px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 10201, width: "min(92vw, 560px)", maxHeight: "80vh",
        background: "#FFFCF5", borderRadius: 20, display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(44,26,14,0.25)", fontFamily: font,
        border: "1px solid rgba(196,122,46,0.2)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E" }}>Terms & Conditions</div>
            <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2 }}>Please read before confirming your booking</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(196,122,46,0.2)", background: "transparent", color: "#9B7450", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 24px" }}>
          {relevantKeys.map((key, idx) => {
            const section = TC_CONTENT[key];
            if (!section) return null;
            return (
              <div key={key} style={{ marginBottom: idx < relevantKeys.length - 1 ? 24 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>{section.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", textTransform: "uppercase", letterSpacing: "0.06em" }}>{section.title}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {section.points.map((pt, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C47A2E", flexShrink: 0, marginTop: 7 }} />
                      <span style={{ fontSize: 13, color: "#5a3a1a", lineHeight: 1.6 }}>{pt}</span>
                    </div>
                  ))}
                </div>
                {idx < relevantKeys.length - 1 && <div style={{ height: 1, background: "rgba(196,122,46,0.1)", marginTop: 20 }} />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: "100%", padding: "11px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Got it
          </button>
        </div>
      </div>
    </>
  );
}

const BookingReviewPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const token     = useSelector((s) => s.auth.token);
  const faItems    = useSelector(selectFunCartItems);
  const faTotal    = useSelector(selectFunCartTotal);
  const faBooking  = (() => { try { return JSON.parse(sessionStorage.getItem("fa_booking")  || "null"); } catch { return null; } })();
  const currentUser = useSelector((s) => s.auth.user);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [tcAgreed, setTcAgreed]     = useState(false);
  const [showTcModal, setShowTcModal] = useState(false);

  // Referral code state — persisted to sessionStorage so navigating away and back doesn't lose it
  const [referralInput, setReferralInput] = useState(() => sessionStorage.getItem("wr_referralInput") || "");
  const [referralState, setReferralState] = useState(null);
  const [appliedCode, setAppliedCode] = useState(() => sessionStorage.getItem("wr_appliedCode") || null);

  const validateReferral = () => {
    const raw = parseCode(referralInput);
    if (!isValidFormat(raw)) { setReferralState("invalid"); return; }
    // Prevent using your own code
    const ownCode = currentUser?._id ? parseCode(generateReferralCode(currentUser._id)) : null;
    if (ownCode && raw === ownCode) { setReferralState("own"); return; }
    setAppliedCode(raw);
    setReferralState("valid");
  };

  const removeReferral = () => {
    setAppliedCode(null);
    setReferralState(null);
    setReferralInput("");
  };

  const finalisedVendors = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const compareSelected  = useSelector((s) => s.listingFilters.compareSelected || []);
  const formData         = useSelector((s) => s.eventPlanning.formData || {});
  const categoryBudgets  = useSelector((s) => s.eventPlanning.categoryBudgets || {});
  const bookingType      = useSelector((s) => s.eventPlanning.bookingType);
  const isLetUsDoIt      = bookingType === "let-us-do-it";

  // Smart Plan detection — Concierge entry with _id "concierge" means customer finalised a Smart Plan
  const isSmartPlan = !!(finalisedVendors.Concierge?.[0]?._id === "concierge" || finalisedVendors.Concierge?._id === "concierge");
  const [liveCategoryBudgets, setLiveCategoryBudgets] = useState(null); // admin-set Smart Plan budgets, if any
  const smartPlanData = (() => {
    if (!isSmartPlan) return null;
    try { return JSON.parse(localStorage.getItem("tendr_smart_plan") || "null"); } catch { return null; }
  })();
  // Prefer live admin-set budgets over the original estimate, once admin has set them
  const smartPlanSlots = liveCategoryBudgets
    ? (smartPlanData?.vendorSlots || []).map(slot => {
        const live = liveCategoryBudgets.find(b => b.category === slot.category);
        return live ? { ...slot, estimatedCost: live.amount } : slot;
      })
    : (smartPlanData?.vendorSlots || []);
  const smartPlanTotal = smartPlanSlots.reduce((s, slot) => s + (Number(slot.estimatedCost) || 0), 0);
  const fmtBudget = (n) => n ? `₹${Number(n).toLocaleString("en-IN")}` : null;

  // Corporate features — admin only
  const isCorporate  = formData.eventType === "Corporate Event" && user?.isAdmin;
  const headcount    = parseInt(formData.guests) || 0;
  const [gstReceived, setGstReceived] = useState({}); // { [serviceType]: bool }

  // Redirect to dashboard if booking already submitted or paid (no active items pending)
  useEffect(() => {
    if (!token) return;
    const hasActiveVendors = Object.keys(finalisedVendors).length > 0;
    if (hasActiveVendors || faItems.length > 0) return;
    fetch(`${BASE_URL}/event-plans`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const plans = data.plans || data.eventPlans || (Array.isArray(data) ? data : []);
        const hasAnyBooking = plans.some(p => ["submitted", "draft", "in_progress", "completed"].includes(p.status));
        if (hasAnyBooking) {
          navigate("/dashboard", { replace: true });
        }
      })
      .catch(() => {});
  }, [token]); // eslint-disable-line

  // Normalize finalisedVendors — values are now arrays of vendors per category
  const normEntries = Object.entries(finalisedVendors).map(([cat, val]) => [
    cat, Array.isArray(val) ? val : [val],
  ]);

  // Selected vendor per category (defaults to first in each category)
  const [selectedPerCat, setSelectedPerCat] = useState(() => {
    const init = {};
    Object.entries(finalisedVendors).forEach(([cat, val]) => {
      const arr = Array.isArray(val) ? val : [val];
      if (arr[0]) init[cat] = arr[0]._id;
    });
    return init;
  });
  const selectVendorForCat = (cat, vendorId) =>
    setSelectedPerCat(prev => ({ ...prev, [cat]: vendorId }));

  // vendorEntries for backward-compat: use the SELECTED vendor per category
  const vendorEntries = normEntries.map(([cat, arr]) => {
    const selId = selectedPerCat[cat];
    const selVendor = arr.find(v => v._id === selId) || arr[0];
    return [cat, selVendor];
  });

  const [showContinuePopup, setShowContinuePopup] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPlan = async () => {
    setPdfLoading(true);
    try {
      const confirmedVendors = vendorEntries.map(([cat, v]) => ({
        _id: v?._id,
        name: v?.name || cat,
        serviceType: cat,
      }));
      const vendorPricing = Object.fromEntries(
        Object.values(priceMap)
          .filter(p => p.amount && p.vendorName)
          .map(p => [p.vendorName, p.amount])
      );
      await generateEventDetailsPDF({
        eventSummary: {
          ...formData,
          categoryBudgets,
          bookingType,
        },
        confirmedVendors,
        pinnedMessages: pinnedMap,
        vendorPricing,
        userName: currentUser?.name || currentUser?.fullName || currentUser?.phone || "",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  // Fetch real prices, booking summary and pinned messages from vendor conversations
  const [priceMap, setPriceMap] = useState({});
  const [summaryMap, setSummaryMap] = useState({});
  const [pinnedMap, setPinnedMap] = useState({}); // { vendorId: [pinnedMsg, ...] }
  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : { conversations: [] })
      .then(async data => {
        const pm = {};
        const sm = {};
        const pinned = {};
        const convList = data.conversations || [];

        // Smart Plan conversations have no vendorId — pull admin-set category
        // budgets separately so Review & Pay reflects live admin pricing
        const smartPlanConvo = convList.find(c => c.serviceType === "SmartPlan");
        if (Array.isArray(smartPlanConvo?.eventDetails?.categoryBudgets) && smartPlanConvo.eventDetails.categoryBudgets.length) {
          setLiveCategoryBudgets(smartPlanConvo.eventDetails.categoryBudgets);
        }

        convList.forEach(c => {
          const vid = c.vendorId?._id || c.vendorId;
          if (!vid) return;
          const key = vid.toString();
          if (c.vendorPrice?.amount > 0) {
            pm[key] = { amount: c.vendorPrice.amount, vendorName: c.vendorPrice.vendorName, service: c.vendorPrice.service, confirmed: true };
          }
          if (c.bookingSummary) sm[key] = c.bookingSummary;
          // Try pinned from list response first
          if (c.pinnedMessages?.length) {
            pinned[key] = c.pinnedMessages.map(m => typeof m === "string" ? m : m.content || m.text || "");
          }
        });

        // For conversations where pinned is still empty, fetch individual to get full pinnedMessages
        const toFetch = convList.filter(c => {
          const vid = (c.vendorId?._id || c.vendorId)?.toString();
          return vid && !pinned[vid];
        });

        await Promise.allSettled(toFetch.map(c =>
          fetch(`${BASE_URL}/conversations/${c._id}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          })
            .then(r => r.ok ? r.json() : null)
            .then(full => {
              if (!full) return;
              const vid = (c.vendorId?._id || c.vendorId)?.toString();
              if (!vid) return;
              const msgs = full.pinnedMessages || full.conversation?.pinnedMessages || [];
              if (msgs.length) pinned[vid] = msgs.map(m => typeof m === "string" ? m : m.content || m.text || "");
            })
            .catch(() => {})
        ));

        setPriceMap(pm);
        setSummaryMap(sm);
        setPinnedMap(pinned);
      })
      .catch(() => {});
  }, [token]);

  // Auto-refresh every 20s so admin price/pinned updates appear without reload
  useEffect(() => {
    if (!token) return;
    const refresh = async () => {
      try {
        const r = await fetch(`${BASE_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const data = r.ok ? await r.json() : { conversations: [] };
        const convList = data.conversations || [];

        const pm = {};
        const sm = {};
        const pinned = {};

        // First pass — read list response
        convList.forEach(c => {
          const vid = (c.vendorId?._id || c.vendorId)?.toString();
          if (!vid) return;
          if (c.vendorPrice?.amount > 0) pm[vid] = { amount: c.vendorPrice.amount, vendorName: c.vendorPrice.vendorName, service: c.vendorPrice.service, confirmed: true };
          if (c.bookingSummary) sm[vid] = c.bookingSummary;
          // Always reset pinned — use empty array if list says no pins
          pinned[vid] = (c.pinnedMessages || []).map(m => typeof m === "string" ? m : m.content || m.text || "").filter(Boolean);
        });

        // Second pass — individual fetches to get authoritative pinnedMessages from DB
        await Promise.allSettled(convList.map(async c => {
          const vid = (c.vendorId?._id || c.vendorId)?.toString();
          if (!vid) return;
          try {
            const r2 = await fetch(`${BASE_URL}/conversations/${c._id}`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });
            if (!r2.ok) return;
            const full = await r2.json();
            const msgs = full.pinnedMessages || full.conversation?.pinnedMessages || [];
            // Always overwrite with authoritative DB value (handles unpins too)
            pinned[vid] = msgs.map(m => typeof m === "string" ? m : m.content || m.text || "").filter(Boolean);
          } catch {}
        }));

        setPriceMap(pm);
        setSummaryMap(sm);
        setPinnedMap(pinned);
      } catch {}
    };

    const interval = setInterval(refresh, 20000);
    return () => clearInterval(interval);
  }, [token]);

  const getPrice = (vendor) => {
    const vid = vendor?._id?.toString();
    return priceMap[vid]?.amount ?? null; // null = not yet set by admin
  };
  const isConfirmed = (vendor) => !!priceMap[vendor?._id?.toString()]?.confirmed;

  const prices = vendorEntries.reduce((acc, [key, v]) => {
    acc[key] = getPrice(v);
    return acc;
  }, {});
  // For Smart Plan: use the estimated slot total directly; otherwise use admin-confirmed priceMap
  const confirmedTotal = isSmartPlan
    ? smartPlanTotal
    : Object.values(prices).filter(p => p !== null).reduce((a, b) => a + b, 0);
  const allConfirmed = isSmartPlan ? (smartPlanSlots.length > 0) : vendorEntries.every(([, v]) => isConfirmed(v));
  const anyPriceUnset = isSmartPlan ? false : vendorEntries.some(([, v]) => getPrice(v) === null);

  // Platform fee: ₹200 flat for Smart Plan; tiered for regular bookings
  const topRatedCount = vendorEntries.filter(([, v]) => v?.isTopRated).length;
  const normalCount   = vendorEntries.filter(([, v]) => !v?.isTopRated).length;
  const topRatedFee   = topRatedCount > 0 ? 250 : 0;
  const normalFee     = normalCount === 0 ? 0
    : topRatedCount > 0 ? 100   // any normals alongside top-rated = flat ₹100
    : normalCount === 1 ? 100   // only 1 normal vendor
    : 200;                      // 2+ normals, no top-rated = ₹200
  const platformFee   = isSmartPlan ? 200 : vendorEntries.length > 0 ? topRatedFee + normalFee : 0;
  // Any referral code (customer or vendor) waives the platform fee entirely
  const effectivePlatformFee = appliedCode ? 0 : platformFee;

  // Accordion: first vendor open by default
  const [openKeys, setOpenKeys] = useState(() =>
    vendorEntries.length > 0 ? { [vendorEntries[0][0]]: true } : {}
  );
  const toggleOpen = (key) =>
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("wr_notes") || "{}"); } catch { return {}; }
  });

  // Persist referral + notes so coming back from chat doesn't lose progress
  useEffect(() => {
    if (appliedCode) sessionStorage.setItem("wr_appliedCode", appliedCode);
    else sessionStorage.removeItem("wr_appliedCode");
  }, [appliedCode]);
  useEffect(() => { sessionStorage.setItem("wr_referralInput", referralInput); }, [referralInput]);
  useEffect(() => { sessionStorage.setItem("wr_notes", JSON.stringify(notes)); }, [notes]);
  const [saving, setSaving] = useState(false);
  const selectedVendors = useSelector((s) => s.eventPlanning.selectedVendors || []);
  const handleRemove = (serviceType) => dispatch(clearFinalisedVendor(serviceType));

  const saveEventPlan = async () => {
    if (!token) return null;
    try {
      // Use only the SELECTED vendor per category, not the full array
      const finalisedVendorIds = {};
      vendorEntries.forEach(([serviceType, vendor]) => {
        if (vendor?._id) finalisedVendorIds[serviceType] = vendor._id;
      });
      const res = await fetch(`${BASE_URL}/event-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          bookingType: bookingType || "you-do-it",
          eventName: formData.eventName || "My Event",
          eventType: formData.eventType || "Other",
          guests: formData.guests || "0",
          budget: "See category budgets",
          categoryBudgets,
          location: formData.location || "Delhi",
          date: formData.date || new Date().toISOString().split("T")[0],
          additionalInfo: formData.additionalInfo || "",
          selectedServices: selectedVendors,
          finalisedVendors: finalisedVendorIds,
          platformFee,
          eventTime: formData.eventTime || (() => { try { return localStorage.getItem('tendr_event_time') || ''; } catch { return ''; } })(),
          personName: (() => { try { return localStorage.getItem('tendr_person_name') || ''; } catch { return ''; } })(),
          venueAddress: (() => { try { return localStorage.getItem('tendr_venue_address') || ''; } catch { return ''; } })(),
        }),
      });
      const data = await res.json();
      return res.ok ? data.eventPlan?._id : null;
    } catch {
      return null;
    }
  };

  if (vendorEntries.length === 0 && faItems.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f4ef", fontFamily: "'Outfit', sans-serif", display: "flex", flexDirection: "column" }}>
        <BasicSpeedDial />
        <HamburgerNav title="Review & Pay" active="Pay" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#9B7450" }}>
          <div style={{ fontSize: 48 }}>📋</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>Nothing to review yet</h2>
          <p style={{ fontSize: 15, margin: 0 }}>Finalise a vendor, add gift hampers or fun activities to your cart.</p>
          <button
            onClick={() => navigate(-1)}
            style={{ marginTop: 8, padding: "10px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const hasEventDetails = Object.entries(LABEL_MAP).some(([k]) => formData[k]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f4ef", fontFamily: "'Outfit', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @media (max-width: 768px) {
          .booking-review-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .booking-review-sidebar {
            order: -1;
          }
          .booking-review-main {
            min-width: 0 !important;
          }
          .booking-sidebar-proceed { display: none !important; }
          .booking-mobile-cta {
            display: flex !important;
            position: fixed;
            bottom: calc(60px + env(safe-area-inset-bottom, 0px));
            left: 0; right: 0;
            background: #FFFCF5;
            border-top: 1.5px solid rgba(196,122,46,0.15);
            padding: 10px 16px;
            box-shadow: 0 -4px 16px rgba(44,26,14,0.08);
            z-index: 99995;
            align-items: center;
            gap: 12px;
          }
        }
        .booking-mobile-cta { display: none; }
      `}</style>
      <SEO title="Review & Pay" description="Review your booking details and confirm payment on Tendr." path="/booking/review" noIndex={true} />
      <BasicSpeedDial />
      <HamburgerNav title="Review & Pay" active="Pay" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(14px,3vw,24px) 80px", width: "100%", boxSizing: "border-box" }}>

        {/* Page title */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Review & Book</h1>
            <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Review your event details and finalised vendors before confirming.</p>
          </div>
          {vendorEntries.length > 0 && (
            <button
              onClick={handleDownloadPlan}
              disabled={pdfLoading}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 12,
                border: "1.5px solid rgba(196,122,46,0.35)",
                background: "#fff", color: "#C47A2E",
                fontSize: 13, fontWeight: 700, cursor: pdfLoading ? "wait" : "pointer",
                fontFamily: "'Outfit', sans-serif",
                boxShadow: "0 2px 8px rgba(196,122,46,0.1)",
                transition: "all 0.18s", flexShrink: 0, opacity: pdfLoading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!pdfLoading) { e.currentTarget.style.background = "linear-gradient(135deg,#C47A2E,#CCAB4A)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.border = "1.5px solid transparent"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#C47A2E"; e.currentTarget.style.border = "1.5px solid rgba(196,122,46,0.35)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {pdfLoading ? "Generating…" : "Download Plan"}
            </button>
          )}
        </div>

        {/* Price pending banner */}
        {anyPriceUnset && (
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 14, padding: "14px 20px", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⏳</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#C47A2E", margin: "0 0 3px" }}>Pricing in progress — sit tight!</p>
              <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Our team is confirming prices with your vendors. You'll be notified once all quotes are ready. You can review vendor details in the meantime.</p>
            </div>
          </div>
        )}

        <div className="booking-review-grid booking-review-main" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>

          {/* ── LEFT: Sidebar (sticky wrapper) ── */}
          <div className="booking-review-sidebar" style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Event Details card — shows whenever event planning form is filled */}
            {hasEventDetails && (
              <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(139,69,19,0.1)", boxShadow: "0 4px 18px rgba(139,69,19,0.07)", padding: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", borderRadius: 8, width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📝</span>
                  Event Details
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  {Object.entries(LABEL_MAP).map(([key, label]) => {
                    const val = formData[key];
                    if (!val && val !== 0) return null;
                    return (
                      <div key={key}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 14, color: "#2C1A0E", fontWeight: 500 }}>{val}</div>
                      </div>
                    );
                  })}
                  {Object.keys(categoryBudgets).length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Budgets</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {Object.entries(categoryBudgets).map(([cat, amt]) => (
                          <div key={cat} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#2C1A0E" }}>
                            <span style={{ fontWeight: 500 }}>{cat}</span>
                            <span style={{ fontWeight: 700, color: "#C47A2E" }}>{fmtBudget(amt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fun Activity Details — full form per activity */}
            {faItems.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(139,69,19,0.1)", boxShadow: "0 4px 18px rgba(139,69,19,0.07)", padding: 20 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", borderRadius: 8, width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🎭</span>
                  Fun Activities
                </h2>
                {faItems.map((item, idx) => (
                  <div key={item.id} style={{ marginBottom: idx < faItems.length - 1 ? 14 : 0, paddingBottom: idx < faItems.length - 1 ? 14 : 0, borderBottom: idx < faItems.length - 1 ? "1px solid rgba(196,122,46,0.1)" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{item.emoji} {item.name}</span>
                      {item.totalPrice > 0 && <span style={{ fontSize: 13, fontWeight: 800, color: "#C47A2E", flexShrink: 0, marginLeft: 6 }}>₹{Number(item.totalPrice).toLocaleString("en-IN")}</span>}
                    </div>
                    {item.form ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: "#9B7450", background: "#f8f4ef", borderRadius: 8, padding: "8px 10px", lineHeight: 1.55 }}>
                        {item.form.eventType && <span>🎉 {item.form.eventType}</span>}
                        {item.form.date && <span>📅 {item.form.date}</span>}
                        {item.form.time && <span>⏰ {item.form.time}</span>}
                        {item.form.address && <span>📍 {item.form.address}</span>}
                        {item.form.guests && <span>👥 {item.form.guests} guests</span>}
                        {(item.form.name || item.form.phone) && <span>👤 {[item.form.name, item.form.phone].filter(Boolean).join(" · ")}</span>}
                        {item.form.notes && <span>📝 {item.form.notes}</span>}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "#c0392b" }}>⚠ Event details not filled</div>
                    )}
                  </div>
                ))}
                {faTotal > 0 && faItems.length > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, color: "#C47A2E", borderTop: "1px solid rgba(196,122,46,0.15)", paddingTop: 8, marginTop: 10 }}>
                    <span>Activities Total</span>
                    <span>₹{faTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Fallback if sidebar is completely empty */}
            {vendorEntries.length === 0 && faItems.length === 0 && (
              <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(139,69,19,0.1)", boxShadow: "0 4px 18px rgba(139,69,19,0.07)", padding: 24 }}>
                <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>No order details yet.</p>
              </div>
            )}

          </div>

          {/* ── RIGHT: Vendor cards grouped by service category ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            {/* ── Smart Plan breakdown — replaces per-vendor cards ── */}
            {isSmartPlan && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>✨</span>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: "#2C1A0E", margin: 0, letterSpacing: "-0.01em" }}>Smart Plan Breakdown</h3>
                </div>
                <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(139,69,19,0.1)", boxShadow: "0 3px 14px rgba(139,69,19,0.06)", overflow: "hidden" }}>
                  {smartPlanSlots.length > 0 ? smartPlanSlots.map((slot, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: i < smartPlanSlots.length - 1 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{slot.category}</div>
                        {slot.vendorName && <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>{slot.vendorName}</div>}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#C47A2E" }}>
                        {slot.estimatedCost ? `₹${Number(slot.estimatedCost).toLocaleString("en-IN")}` : "TBC"}
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: "20px 18px", fontSize: 13, color: "#9B7450" }}>
                      Your Smart Plan is being finalized. Vendor costs will appear here.
                    </div>
                  )}
                  {/* Pricing note */}
                  <div style={{ background: "rgba(196,122,46,0.04)", padding: "10px 18px", borderTop: "1px solid rgba(196,122,46,0.08)" }}>
                    <p style={{ fontSize: 11, color: "#9B7450", margin: 0, lineHeight: 1.5 }}>
                      💡 These are estimated costs. Final prices will be confirmed by the Tendr team before payment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Regular vendor cards — hidden for Smart Plan */}
            {!isSmartPlan && normEntries.map(([serviceType, candidateArr], catIdx) => {
              const vendor = vendorEntries.find(([k]) => k === serviceType)?.[1] || candidateArr[0];
              const price = prices[serviceType];
              const isOpen = !!openKeys[serviceType];
              const multipleVendors = candidateArr.length > 1;

              const SERVICE_ICONS = { DJ: "🎵", Caterer: "🍽️", Decorator: "🎨", Photographer: "📸", GiftHamper: "🎁", Cake: "🎂", Makeup: "💄", Venue: "🏛️", Mehndi: "🖐️", Band: "🎶", Planner: "📋" };
              return (
                <div key={serviceType} style={{ marginBottom: 20 }}>

                  {/* Category partition + heading */}
                  {catIdx > 0 && (
                    <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(196,122,46,0.3),transparent)", margin: "0 0 18px" }} />
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>{SERVICE_ICONS[serviceType] || "🛎️"}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: "#2C1A0E", margin: 0, letterSpacing: "-0.01em" }}>{serviceType}</h3>
                    <span style={{ fontSize: 12, color: "#9B7450", fontWeight: 500 }}>
                      {candidateArr.length} vendor{candidateArr.length > 1 ? "s" : ""} finalised
                    </span>
                  </div>

                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1.5px solid rgba(139,69,19,0.1)",
                    boxShadow: "0 3px 14px rgba(139,69,19,0.06)",
                    overflow: "hidden",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Multi-vendor selector — shown when category has more than 1 vendor */}
                  {multipleVendors && (
                    <div style={{ background: "rgba(196,122,46,0.04)", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "10px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Select 1 {serviceType}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#9B7450" }}>
                          1 of {candidateArr.length} selected
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {candidateArr.map((v) => {
                          const vid = v._id;
                          const isSelected = selectedPerCat[serviceType] === vid;
                          const vPrice = priceMap[vid]?.amount;
                          const vPins = pinnedMap[vid] || [];
                          return (
                            <div
                              key={vid}
                              onClick={() => selectVendorForCat(serviceType, vid)}
                              style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${isSelected ? "#C47A2E" : "rgba(196,122,46,0.15)"}`, background: isSelected ? "rgba(196,122,46,0.06)" : "#fff", cursor: "pointer", transition: "all 0.15s" }}
                            >
                              {/* Radio button */}
                              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${isSelected ? "#C47A2E" : "#ddd"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                                {isSelected && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#C47A2E" }} />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{v.name}</span>
                                  {vPrice ? (
                                    <span style={{ fontSize: 13, fontWeight: 800, color: "#15803d" }}>{formatINR(vPrice)}</span>
                                  ) : (
                                    <span style={{ fontSize: 11, color: "#9B7450" }}>Price pending</span>
                                  )}
                                </div>
                                {vPins.length > 0 && (
                                  <div style={{ marginTop: 4 }}>
                                    {vPins.slice(0, 2).map((p, pi) => (
                                      <div key={pi} style={{ fontSize: 11, color: "#9B7450", display: "flex", gap: 4, lineHeight: 1.4 }}>
                                        <span>📌</span><span>{p}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Accordion header — always visible */}
                  <button
                    onClick={() => toggleOpen(serviceType)}
                    className="booking-vendor-card"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "16px 20px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      borderBottom: isOpen ? "1px solid rgba(139,69,19,0.08)" : "none",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {isLetUsDoIt ? (
                      <div style={{ width: 52, height: 52, borderRadius: 12, background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>
                        ✨
                      </div>
                    ) : (
                      <img
                        src={vendor.image || vendor.coverImage || (vendor.images && vendor.images[0]) || FALLBACK_IMG}
                        alt={vendor.name}
                        style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: "2px solid rgba(204,171,74,0.3)", flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#2C1A0E", marginBottom: 3 }}>
                        {isLetUsDoIt ? "Tendr" : (vendor.name || vendor.businessName || "Vendor")}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: pinnedMap[vendor?._id?.toString()]?.length ? 6 : 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "3px 10px" }}>
                          {isLetUsDoIt ? "Concierge Planning" : serviceType}
                        </span>
                        {!isLetUsDoIt && vendor.city && <span style={{ fontSize: 12, color: "#9B7450" }}>{vendor.city}</span>}
                      </div>
                      {/* Pinned messages — always visible */}
                      {pinnedMap[vendor?._id?.toString()]?.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {pinnedMap[vendor._id.toString()].map((msg, i) => (
                            <div key={i} style={{ fontSize: 12, color: "#5a3a1a", background: "#fffaf3", border: "1.5px solid rgba(196,122,46,0.22)", borderRadius: 8, padding: "6px 10px", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5, display: "flex", gap: 5, alignItems: "flex-start" }}>
                              <span style={{ flexShrink: 0 }}>📌</span><span>{msg}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", marginRight: 8, flexShrink: 0 }}>
                      {price !== null ? (
                        <>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#15803d" }}>✓ Price Confirmed</div>
                          <div style={{ fontSize: 17, fontWeight: 800, color: "#15803d" }}>{formatINR(price)}</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#C47A2E" }}>⏳ Awaiting Quote</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#9B7450", fontStyle: "italic" }}>Yet to be updated</div>
                        </>
                      )}
                    </div>
                    <ChevronIcon open={isOpen} />
                    {/* GST Invoice toggle — corporate admin only */}
                    {isCorporate && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setGstReceived(p => ({ ...p, [serviceType]: !p[serviceType] })); }}
                        style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 8, border: `1.5px solid ${gstReceived[serviceType] ? "rgba(21,128,61,0.4)" : "rgba(196,122,46,0.25)"}`, background: gstReceived[serviceType] ? "rgba(21,128,61,0.08)" : "transparent", color: gstReceived[serviceType] ? "#15803d" : "#9B7450", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}
                        title="Toggle GST Invoice received">
                        {gstReceived[serviceType] ? "✓ GST" : "GST?"}
                      </button>
                    )}
                    {/* Remove vendor button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); if (window.confirm(`Remove ${vendor.name || serviceType} from your booking?`)) handleRemove(serviceType); }}
                      style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(192,57,43,0.25)", background: "rgba(192,57,43,0.06)", color: "#c0392b", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 4, fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#c0392b"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(192,57,43,0.06)"; e.currentTarget.style.color = "#c0392b"; }}
                      title="Remove this vendor">
                      ✕
                    </button>
                  </button>

                  {/* Accordion body — collapses */}
                  {isOpen && (
                    <div>
                      {/* Quick stats */}
                      {[
                        vendor.yearsOfExperience != null && ("Exp: " + vendor.yearsOfExperience + " yrs"),
                        (vendor.totalEventsCompleted ?? vendor.eventsCompleted) != null && ("Events: " + (vendor.totalEventsCompleted ?? vendor.eventsCompleted)),
                        vendor.teamSize != null && ("Team: " + vendor.teamSize),
                        vendor.avgReviewScore != null && ("Rating: " + vendor.avgReviewScore),
                      ].filter(Boolean).length > 0 && (
                        <div style={{ display: "flex", gap: 8, padding: "12px 20px 4px", flexWrap: "wrap" }}>
                          {[
                            vendor.yearsOfExperience != null && ("Exp: " + vendor.yearsOfExperience + " yrs"),
                            (vendor.totalEventsCompleted ?? vendor.eventsCompleted) != null && ("Events: " + (vendor.totalEventsCompleted ?? vendor.eventsCompleted)),
                            vendor.teamSize != null && ("Team: " + vendor.teamSize),
                            vendor.avgReviewScore != null && ("Rating: " + vendor.avgReviewScore),
                          ].filter(Boolean).map((fact, i) => (
                            <span key={i} style={{ fontSize: 12, fontWeight: 500, color: "#7A4A1E", background: "rgba(204,171,74,0.1)", border: "1px solid rgba(204,171,74,0.2)", borderRadius: 8, padding: "4px 10px" }}>
                              {fact}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Event details from form — always shown */}
                      {Object.entries(LABEL_MAP).some(([k]) => formData[k]) && (
                        <div style={{ padding: "12px 20px 4px" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#9B7450", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                            <span>📋</span> Your Event Details
                          </div>
                          <div style={{ background: "#f8f4ef", border: "1.5px solid rgba(196,122,46,0.15)", borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
                            {Object.entries(LABEL_MAP).map(([key, label]) => {
                              const val = formData[key];
                              if (!val && val !== 0) return null;
                              return (
                                <div key={key} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#2C1A0E" }}>
                                  <span style={{ fontWeight: 600, color: "#9B7450", minWidth: 64 }}>{label}:</span>
                                  <span>{val}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}


                      {/* Additional requirements textarea */}
                      <div style={{ padding: "10px 20px 16px" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#9B7450", marginBottom: 6 }}>Additional Requirements</div>
                        <textarea
                          placeholder={"Any special requests for " + (vendor.name || "this vendor") + "?"}
                          value={notes[serviceType] || ""}
                          onChange={(e) => setNotes((p) => ({ ...p, [serviceType]: e.target.value }))}
                          rows={2}
                          style={{ width: "100%", border: "1.5px solid rgba(139,69,19,0.15)", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "'Outfit', sans-serif", color: "#2C1A0E", background: "#fffcf7", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>

                      {/* Remove */}
                      <div style={{ padding: "0 20px 14px", display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleRemove(serviceType)}
                          style={{ fontSize: 12, fontWeight: 600, padding: "6px 16px", borderRadius: 8, border: "1.5px solid rgba(192,57,43,0.25)", background: "rgba(192,57,43,0.05)", color: "#C0392B", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                        >
                          Remove Vendor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              );
            })}

            {/* ── Additional requirements from EventPlanning form ── */}
            {formData.additionalInfo && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1.5px solid rgba(139,69,19,0.1)",
                  boxShadow: "0 3px 14px rgba(139,69,19,0.06)",
                  padding: "18px 20px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 8, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ background: "rgba(196,122,46,0.1)", borderRadius: 8, width: 26, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📌</span>
                  Additional Requirements
                </div>
                <p style={{ fontSize: 14, color: "#5a3a1a", margin: 0, lineHeight: 1.6 }}>{formData.additionalInfo}</p>
              </div>
            )}

            {/* Fun Activities — standalone card, visible on mobile too */}
            {faItems.length > 0 && (
              <div style={{ marginBottom: 20, background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.12)", boxShadow: "0 3px 14px rgba(139,69,19,0.06)", padding: "18px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", borderRadius: 8, width: 26, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🎭</span>
                  Fun Activities
                </div>
                {faItems.map((item, idx) => (
                  <div key={item.id} style={{ marginBottom: idx < faItems.length - 1 ? 14 : 0, paddingBottom: idx < faItems.length - 1 ? 14 : 0, borderBottom: idx < faItems.length - 1 ? "1px solid rgba(196,122,46,0.1)" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{item.emoji} {item.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", flexShrink: 0, marginLeft: 8 }}>
                        {item.totalPrice ? `₹${Number(item.totalPrice).toLocaleString("en-IN")}` : "TBC"}
                      </span>
                    </div>
                    {item.form ? (
                      <div style={{ background: "#f8f4ef", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, color: "#5a3a1a", lineHeight: 1.5 }}>
                        {item.form.eventType && <div><span style={{ fontWeight: 600, color: "#9B7450", display: "inline-block", minWidth: 62 }}>Event:</span>{item.form.eventType}</div>}
                        {item.form.date && <div><span style={{ fontWeight: 600, color: "#9B7450", display: "inline-block", minWidth: 62 }}>Date:</span>{item.form.date}</div>}
                        {item.form.time && <div><span style={{ fontWeight: 600, color: "#9B7450", display: "inline-block", minWidth: 62 }}>Time:</span>{item.form.time}</div>}
                        {item.form.address && <div><span style={{ fontWeight: 600, color: "#9B7450", display: "inline-block", minWidth: 62 }}>Venue:</span>{item.form.address}</div>}
                        {item.form.guests && <div><span style={{ fontWeight: 600, color: "#9B7450", display: "inline-block", minWidth: 62 }}>Guests:</span>{item.form.guests}</div>}
                        {item.form.name && <div><span style={{ fontWeight: 600, color: "#9B7450", display: "inline-block", minWidth: 62 }}>Contact:</span>{item.form.name}{item.form.phone ? ` · ${item.form.phone}` : ""}</div>}
                        {item.form.notes && <div><span style={{ fontWeight: 600, color: "#9B7450", display: "inline-block", minWidth: 62 }}>Notes:</span>{item.form.notes}</div>}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#c0392b" }}>⚠ Event details not filled — go back to add details</div>
                    )}
                  </div>
                ))}
                {faTotal > 0 && faItems.length > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#C47A2E", borderTop: "1px solid rgba(196,122,46,0.15)", paddingTop: 10, marginTop: 10 }}>
                    <span>Activities Total</span>
                    <span>₹{faTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Total + Proceed ── */}
            <div className="booking-sidebar-proceed"
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1.5px solid rgba(139,69,19,0.1)",
                boxShadow: "0 3px 14px rgba(139,69,19,0.06)",
                padding: "20px 22px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
                {vendorEntries.map(([serviceType, vendor]) => (
                  <div key={serviceType} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#5a3a1a" }}>
                    <span style={{ fontWeight: 500 }}>{isLetUsDoIt ? "Tendr" : (vendor.name || serviceType)}</span>
                    <span style={{ fontWeight: 600, color: prices[serviceType] !== null ? "#2C1A0E" : "#bbb", fontStyle: prices[serviceType] === null ? "italic" : "normal" }}>
                      {prices[serviceType] !== null ? formatINR(prices[serviceType]) : "Yet to be updated"}
                    </span>
                  </div>
                ))}

                {/* Referral discount line */}
                {appliedCode && (confirmedTotal + faTotal) > 0 && (() => {
                  const { discount } = applyDiscount(confirmedTotal + faTotal);
                  return (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#15803d" }}>
                      <span style={{ fontWeight: 600 }}>🎁 Referral Discount ({DISCOUNT_PERCENT}%)</span>
                      <span style={{ fontWeight: 700 }}>− {formatINR(discount)}</span>
                    </div>
                  );
                })()}

                {/* Vendor subtotal */}
                {confirmedTotal > 0 && faTotal > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9B7450", marginBottom: 4 }}>
                    <span>Vendors subtotal</span>
                    <span style={{ fontWeight: 600 }}>{formatINR(confirmedTotal)}</span>
                  </div>
                )}

                {/* Fun Activities subtotal */}
                {faTotal > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9B7450", marginBottom: 4 }}>
                    <span>Fun Activities subtotal</span>
                    <span style={{ fontWeight: 600 }}>₹{faTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {/* Tax + fee breakdown */}
                {(() => {
                  const rawSum = confirmedTotal + faTotal;
                  if (rawSum <= 0) return null;
                  const discountedSum = appliedCode ? applyDiscount(rawSum).finalTotal : rawSum;
                  const gstAmount = Math.round(discountedSum * 0.18);
                  const grandTotal = discountedSum + gstAmount + effectivePlatformFee;
                  return (
                    <>
                      <div style={{ borderTop: "1px dashed rgba(139,69,19,0.15)", paddingTop: 10, marginTop: 4 }}>
                        {/* Subtotal */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#5a3a1a", marginBottom: 7 }}>
                          <span style={{ fontWeight: 600 }}>Subtotal</span>
                          <span style={{ fontWeight: 600 }}>{formatINR(discountedSum)}</span>
                        </div>
                        {/* GST */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#5a3a1a", marginBottom: 7 }}>
                          <span style={{ fontWeight: 600 }}>GST (18%)</span>
                          <span style={{ fontWeight: 600 }}>+ {formatINR(gstAmount)}</span>
                        </div>
                        {/* Platform fee */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#5a3a1a", marginBottom: 10 }}>
                          <span style={{ fontWeight: 600 }}>Platform Fee</span>
                          {appliedCode
                            ? <span style={{ fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center", gap: 4 }}><s style={{ color: "#9B7450", fontWeight: 400 }}>₹{platformFee}</s> FREE</span>
                            : <span style={{ fontWeight: 600 }}>+ ₹{platformFee}</span>
                          }
                        </div>
                      </div>
                      {/* Grand Total */}
                      <div style={{ borderTop: "1.5px solid rgba(139,69,19,0.1)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 18, fontWeight: 800, color: "#2C1A0E" }}>
                        <span>{anyPriceUnset ? "Confirmed So Far" : "Grand Total"}</span>
                        <span style={{ color: allConfirmed ? "#15803d" : "#C47A2E" }}>
                          {formatINR(grandTotal)}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: "#9B7450", margin: "6px 0 0" }}>
                        {allConfirmed
                          ? "✓ All prices confirmed by Tendr team. Includes 18% GST."
                          : anyPriceUnset
                          ? "⏳ Some vendor quotes are still being confirmed. You'll be notified when all prices are ready."
                          : "Prices confirmed in chat. Includes 18% GST."}
                      </p>
                    </>
                  );
                })()}

                {/* Corporate: cost per head + export button */}
                {isCorporate && headcount > 0 && confirmedTotal > 0 && (
                  <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(124,58,237,0.06)", borderRadius: 10, border: "1px solid rgba(124,58,237,0.18)" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>
                      💼 Cost per Employee: <span style={{ fontSize: 15, fontWeight: 900 }}>{formatINR(Math.round(confirmedTotal / headcount))}</span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: "#9B7450", marginLeft: 6 }}>({headcount} employees)</span>
                    </div>
                    {formData.companyName && <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 2, opacity: 0.8 }}>🏢 {formData.companyName}</div>}
                  </div>
                )}
                {isCorporate && (
                  <button
                    onClick={() => {
                      const total = confirmedTotal;
                      const lines = [
                        "CORPORATE EVENT — APPROVAL SUMMARY",
                        "=".repeat(40),
                        `Company: ${formData.companyName || "—"}`,
                        `Event: ${formData.eventType || "—"}`,
                        `Date: ${formData.date || "—"}`,
                        `Location: ${formData.location || "—"}`,
                        `Employees: ${formData.guests || "—"}`,
                        "",
                        "VENDOR BREAKDOWN",
                        "-".repeat(40),
                        ...vendorEntries.map(([svc, v]) => `${svc}: ${prices[svc] !== null ? formatINR(prices[svc]) : "TBC"} — ${v.name || "Vendor"}`),
                        "-".repeat(40),
                        `TOTAL: ${formatINR(total)}`,
                        headcount > 0 ? `Cost per Employee: ${formatINR(Math.round(total / headcount))}` : "",
                        "",
                        "GST Invoice Status:",
                        ...vendorEntries.map(([svc]) => `  ${svc}: ${gstReceived[svc] ? "✓ Received" : "Pending"}`),
                        "",
                        "Generated by Tendr · tendr.co.in",
                      ].filter(Boolean).join("\n");
                      const blob = new Blob([lines], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a"); a.href = url; a.download = `${formData.companyName || "event"}-approval-summary.txt`; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{ marginTop: 8, width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.06)", color: "#7c3aed", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                    📄 Export for Manager Approval
                  </button>
                )}
              </div>

              {/* People Also Get — upsell block (hide if both fun activities and stationery already in cart) */}
              <div style={{ margin: "14px 0 0", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.18)", background: "#fff8f2", padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>People also get</p>

                {/* Fun Activities row — only show if user hasn't added them */}
                {faItems.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>🎭</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>Fun Activities</div>
                      <div style={{ fontSize: 11, color: "#9B7450" }}>Magic shows, live bands, photo booths & more</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/fun-activities")}
                    style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.4)", background: "transparent", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                    Browse →
                  </button>
                </div>
                )}

                {/* Wedding Stationeries chip */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>💌</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>Wedding Stationeries</div>
                      <div style={{ fontSize: 11, color: "#9B7450" }}>Invites, menus, cards &amp; more</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/stationery")}
                    style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.4)", background: "transparent", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                    Browse →
                  </button>
                </div>
              </div>

              {/* Referral code input */}
              <div style={{ marginBottom: 16 }}>
                {appliedCode ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "10px 14px" }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>✓ Referral code applied — {DISCOUNT_PERCENT}% off!</span>
                      <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2, fontFamily: "'Courier New', monospace" }}>{appliedCode}</div>
                    </div>
                    <button onClick={removeReferral} style={{ border: "none", background: "none", color: "#9B7450", fontSize: 13, cursor: "pointer", padding: "4px 8px" }}>✕ Remove</button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#9B7450", margin: "0 0 6px" }}>Have a referral code?</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={referralInput}
                        onChange={e => { setReferralInput(e.target.value.toUpperCase()); setReferralState(null); }}
                        placeholder="TNDR-XXXXXX"
                        style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${referralState === "invalid" || referralState === "own" ? "#fca5a5" : "rgba(196,122,46,0.25)"}`, fontSize: 14, fontFamily: "'Courier New', monospace", outline: "none", color: "#2C1A0E", textTransform: "uppercase" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "#C47A2E")}
                        onBlur={e => (e.currentTarget.style.borderColor = referralState === "invalid" || referralState === "own" ? "#fca5a5" : "rgba(196,122,46,0.25)")}
                      />
                      <button onClick={validateReferral}
                        style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "rgba(196,122,46,0.1)", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}>
                        Apply
                      </button>
                    </div>
                    {referralState === "invalid" && <p style={{ fontSize: 11, color: "#c0392b", margin: "4px 0 0" }}>Invalid referral code. Check and try again.</p>}
                    {referralState === "own" && <p style={{ fontSize: 11, color: "#c0392b", margin: "4px 0 0" }}>You can't use your own referral code.</p>}
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, justifyContent: "center" }}>
                {[
                  { icon: "🔒", text: "Secure Payment" },
                  { icon: "✅", text: "Verified Vendors" },
                  { icon: "🔄", text: "Easy Cancellation" },
                  { icon: "📞", text: "Support Available" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#9B7450", background: "rgba(196,122,46,0.07)", borderRadius: 100, padding: "5px 12px", border: "1px solid rgba(196,122,46,0.15)" }}>
                    <span style={{ fontSize: 13 }}>{icon}</span> {text}
                  </div>
                ))}
              </div>

              {/* T&C checkbox */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, padding: "12px 14px", background: "rgba(196,122,46,0.05)", borderRadius: 10, border: `1.5px solid ${tcAgreed ? "rgba(196,122,46,0.35)" : "rgba(196,122,46,0.15)"}` }}>
                <input
                  type="checkbox"
                  id="tc-agree"
                  checked={tcAgreed}
                  onChange={e => setTcAgreed(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: "#C47A2E", flexShrink: 0, cursor: "pointer" }}
                />
                <label htmlFor="tc-agree" style={{ fontSize: 13, color: "#5a3a1a", lineHeight: 1.5, cursor: "pointer" }}>
                  I have read and agree to the{" "}
                  <span
                    onClick={e => { e.preventDefault(); setShowTcModal(true); }}
                    style={{ color: "#C47A2E", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}
                  >
                    Terms & Conditions
                  </span>
                </label>
              </div>

              {anyPriceUnset ? (
                <div style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#f3f4f6", color: "#9ca3af", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif", textAlign: "center", border: "1.5px dashed #d1d5db" }}>
                  ⏳ Waiting for all quotes to be confirmed
                </div>
              ) : (
                <button
                  disabled={saving || !tcAgreed}
                  onClick={() => setShowConfirmPopup(true)}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: !tcAgreed ? "#e5e7eb" : "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: !tcAgreed ? "#9ca3af" : "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: !tcAgreed ? "not-allowed" : "pointer", boxShadow: !tcAgreed ? "none" : "0 4px 14px rgba(196,122,46,0.35)", transition: "all 0.2s" }}
                >
                  Proceed to Payment
                </button>
              )}
              {!tcAgreed && !anyPriceUnset && (
                <p style={{ fontSize: 11, color: "#9B7450", textAlign: "center", margin: "6px 0 0" }}>Please agree to the terms to continue</p>
              )}

              {/* Confirmation popup */}
              {showConfirmPopup && (
                <>
                  <div onClick={() => setShowConfirmPopup(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, backdropFilter: "blur(3px)" }} />
                  <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1000, background: "#FFFCF5", borderRadius: 20, padding: "32px 28px", width: "90%", maxWidth: 420, boxShadow: "0 20px 60px rgba(139,69,19,0.2)", fontFamily: "'Outfit', sans-serif", textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 14 }}>🎉</div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: "0 0 10px", letterSpacing: "-0.01em" }}>Ready to confirm?</h2>
                    <p style={{ fontSize: 14, color: "#9B7450", lineHeight: 1.65, margin: "0 0 24px" }}>
                      Do you want to complete this booking, or would you like to add more vendors first?
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <button
                        disabled={saving}
                        onClick={async () => {
                          setSaving(true);
                          const eventPlanId = await saveEventPlan();
                          // Record referral code usage in backend
                          if (appliedCode && token) {
                            fetch(`${BASE_URL}/referrals/apply`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                              credentials: "include",
                              body: JSON.stringify({ code: appliedCode, orderId: eventPlanId }),
                            }).catch(() => {});
                          }
                          // Fetch pinned messages from customer's conversations
                          let pinnedLines = [];
                          try {
                            const pr = await fetch(`${BASE_URL}/conversations`, {
                              headers: { Authorization: `Bearer ${token}` },
                              credentials: "include",
                            });
                            if (pr.ok) {
                              const pd = await pr.json();
                              const convos = (pd.conversations || []).filter(c => c.chatType === "vendor");
                              const allPinned = [];
                              convos.forEach(c => {
                                (c.pinnedMessages || []).forEach(m => {
                                  const text = m.content || (typeof m === "string" ? m : "");
                                  if (text) allPinned.push(`  • ${text}`);
                                });
                              });
                              if (allPinned.length > 0) {
                                pinnedLines = ["", "*Vendor Quotes:*", ...allPinned];
                              }
                            }
                          } catch {}

                          // Mark booking submitted for each finalised vendor (keeps Pay button + locks chat)
                          vendorEntries.forEach(([, v]) => {
                            if (v?._id) localStorage.setItem(`tendr:booking-submitted:${v._id}`, "1");
                          });

                          // Build WhatsApp summary message
                          const vendorFaTotal = confirmedTotal + faTotal;
                          const finalAmount = (appliedCode ? applyDiscount(vendorFaTotal).finalTotal : vendorFaTotal) + effectivePlatformFee;
                          const lines = [
                            `*New Booking — ${formData.eventName || formData.eventType || "Event"}*`,
                            "",
                            `*Event:* ${formData.eventType || "—"}`,
                            formData.date     ? `*Date:* ${formData.date}` : null,
                            formData.location ? `*Location:* ${formData.location}` : null,
                            formData.guests   ? `*Guests:* ${formData.guests}` : null,
                            ...(isSmartPlan && smartPlanSlots.length > 0 ? [
                              "",
                              "*Smart Plan Breakdown:*",
                              ...smartPlanSlots.map(s => `• ${s.category}: Rs.${Number(s.estimatedCost || 0).toLocaleString("en-IN")}${s.vendorName ? ` (${s.vendorName})` : ""}`),
                            ] : vendorEntries.length > 0 ? [
                              "",
                              "*Finalised Vendors:*",
                              ...vendorEntries.map(([cat, v]) =>
                                `• ${cat}: ${v?.name || "Tendr"} — ${prices[cat] !== null ? "Rs." + Number(prices[cat]).toLocaleString("en-IN") : "TBC"}`
                              ),
                            ] : []),
                            ...pinnedLines,
                            ...(faItems.length > 0 ? [
                              "",
                              "*Fun Activities:*",
                              ...faItems.filter(i => i.form).map(i => [
                                `• ${i.name} — Rs.${Number(i.totalPrice || 0).toLocaleString("en-IN")}`,
                                `   Date: ${i.form.date} · Time: ${i.form.time}`,
                                `   Address: ${i.form.address}`,
                                `   Guests: ${i.form.guests} · ${i.form.eventType}`,
                                i.form.name ? `   Contact: ${i.form.name} · ${i.form.phone}` : null,
                                i.form.notes ? `   Notes: ${i.form.notes}` : null,
                              ].filter(Boolean).join("\n")),
                            ] : []),
                            "",
                            effectivePlatformFee > 0 ? `*Platform Fee:* Rs.${Number(effectivePlatformFee).toLocaleString("en-IN")}` : null,
                            appliedCode ? `*Referral Code:* ${appliedCode}` : null,
                            `*Grand Total (incl. 18% GST):* Rs.${Number(finalAmount + Math.round((appliedCode ? applyDiscount(vendorFaTotal).finalTotal : vendorFaTotal) * 0.18)).toLocaleString("en-IN")}`,
                            "",
                            currentUser?.name ? `*Customer:* ${currentUser.name}` : null,
                            currentUser?.phoneNumber || currentUser?.phone ? `*Phone:* ${currentUser.phoneNumber || currentUser.phone}` : null,
                          ].filter(Boolean).join("\n");

                          // Clear session state (but keep finalisedVendors so Pay button stays until payment confirmed)
                          sessionStorage.removeItem("wr_appliedCode");
                          sessionStorage.removeItem("wr_referralInput");
                          sessionStorage.removeItem("wr_notes");
                          sessionStorage.removeItem("fa_booking");
                          dispatch(resetEventPlanning());
                          dispatch(clearFunCart());

                          setSaving(false);
                          setShowConfirmPopup(false);

                          window.open(`https://wa.me/919211668427?text=${encodeURIComponent(lines)}`, "_blank");
                          navigate("/dashboard", { replace: true });
                        }}
                        style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}
                      >
                        {saving ? "Saving…" : "Confirm & Send to Tendr →"}
                      </button>
                      <button
                        onClick={() => { setShowConfirmPopup(false); navigate("/listings"); }}
                        style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                      >
                        Add More Vendors
                      </button>
                      <button
                        onClick={() => { setShowConfirmPopup(false); navigate("/"); }}
                        style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "transparent", color: "#9B7450", fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                      >
                        Return to Home
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only fixed checkout bar — hidden on desktop via CSS */}
      <div className="booking-mobile-cta" style={{ flexDirection: "column", gap: 8, paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
        {/* T&C checkbox — mobile */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          <input
            type="checkbox"
            id="tc-agree-mob"
            checked={tcAgreed}
            onChange={e => setTcAgreed(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: "#C47A2E", flexShrink: 0, cursor: "pointer" }}
          />
          <label htmlFor="tc-agree-mob" style={{ fontSize: 12, color: "#5a3a1a", lineHeight: 1.4, cursor: "pointer" }}>
            I agree to the{" "}
            <span onClick={() => setShowTcModal(true)} style={{ color: "#C47A2E", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>
              Terms & Conditions
            </span>
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", width: "100%" }}>
          {(confirmedTotal + faTotal) > 0 && (() => {
            const raw = confirmedTotal + faTotal;
            const disc = appliedCode ? applyDiscount(raw).finalTotal : raw;
            const total = disc + Math.round(disc * 0.18) + 100;
            return (
              <div style={{ fontSize: 13, lineHeight: 1.3, flexShrink: 0 }}>
                <div style={{ color: "#9B7450", fontSize: 11 }}>Grand Total</div>
                <div style={{ fontWeight: 900, color: "#2C1A0E", fontSize: 16 }}>{formatINR(total)}</div>
              </div>
            );
          })()}
          {anyPriceUnset ? (
            <div style={{ flex: 1, padding: "11px", borderRadius: 12, background: "#f3f4f6", color: "#9ca3af", fontSize: 13, fontWeight: 700, textAlign: "center", border: "1.5px dashed #d1d5db", fontFamily: "'Outfit', sans-serif" }}>
              ⏳ Waiting for quotes
            </div>
          ) : (
            <button
              disabled={saving || !tcAgreed}
              onClick={() => setShowConfirmPopup(true)}
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: !tcAgreed ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: !tcAgreed ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 700, cursor: !tcAgreed || saving ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: !tcAgreed ? "none" : "0 3px 12px rgba(196,122,46,0.35)", transition: "all 0.2s" }}
            >
              Proceed to Payment
            </button>
          )}
        </div>
      </div>

      {/* T&C Modal */}
      {showTcModal && (
        <TnCModal
          onClose={() => setShowTcModal(false)}
          vendorTypes={vendorEntries.map(([cat]) => cat)}
        />
      )}

    </div>
  );
};

export default BookingReviewPage;

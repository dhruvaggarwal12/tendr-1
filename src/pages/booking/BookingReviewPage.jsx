import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import SEO from "../../components/SEO";
import { generateReferralCode, isValidFormat, parseCode, applyDiscount, DISCOUNT_PERCENT } from "../../utils/referral";

const BASE_URL = import.meta.env.VITE_BASE_URL;
import { clearFinalisedVendor } from "../../redux/listingFiltersSlice";
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
  budget:         "Budget",
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

const BookingReviewPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const currentUser = useSelector((s) => s.auth.user);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Referral code state
  const [referralInput, setReferralInput] = useState("");
  const [referralState, setReferralState] = useState(null); // null | "valid" | "invalid" | "own"
  const [appliedCode, setAppliedCode] = useState(null); // the validated code

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
  const compareSelected = useSelector((s) => s.listingFilters.compareSelected || []);
  const formData = useSelector((s) => s.eventPlanning.formData || {});
  const bookingType = useSelector((s) => s.eventPlanning.bookingType);
  const isLetUsDoIt = bookingType === "let-us-do-it";

  const vendorEntries = Object.entries(finalisedVendors);

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
  const confirmedTotal = Object.values(prices).filter(p => p !== null).reduce((a, b) => a + b, 0);
  const allConfirmed = vendorEntries.every(([, v]) => isConfirmed(v));
  const anyPriceUnset = vendorEntries.some(([, v]) => getPrice(v) === null);

  // Accordion: first vendor open by default
  const [openKeys, setOpenKeys] = useState(() =>
    vendorEntries.length > 0 ? { [vendorEntries[0][0]]: true } : {}
  );
  const toggleOpen = (key) =>
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const [notes, setNotes] = useState({});
  const [saving, setSaving] = useState(false);
  const selectedVendors = useSelector((s) => s.eventPlanning.selectedVendors || []);
  const handleRemove = (serviceType) => dispatch(clearFinalisedVendor(serviceType));

  const saveEventPlan = async () => {
    if (!token) return null;
    try {
      const finalisedVendorIds = {};
      Object.entries(finalisedVendors).forEach(([serviceType, vendor]) => {
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
          budget: formData.budget || "Not specified",
          location: formData.location || "Delhi",
          date: formData.date || new Date().toISOString().split("T")[0],
          additionalInfo: formData.additionalInfo || "",
          selectedServices: selectedVendors,
          finalisedVendors: finalisedVendorIds,
        }),
      });
      const data = await res.json();
      return res.ok ? data.eventPlan?._id : null;
    } catch {
      return null;
    }
  };

  if (vendorEntries.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f4ef", fontFamily: "'Outfit', sans-serif", display: "flex", flexDirection: "column" }}>
        <BasicSpeedDial />
        <HamburgerNav title="Review & Pay" active="Pay" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#9B7450" }}>
          <div style={{ fontSize: 48 }}>📋</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>No vendors finalised yet</h2>
          <p style={{ fontSize: 15, margin: 0 }}>Go to a vendor chat and click "Finalise Vendor" to add them here.</p>
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
      <SEO title="Review & Pay" description="Review your booking details and confirm payment on Tendr." path="/booking/review" noIndex={true} />
      <BasicSpeedDial />
      <HamburgerNav title="Review & Pay" active="Pay" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px", width: "100%", boxSizing: "border-box" }}>

        {/* Page title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Review & Book</h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Review your event details and finalised vendors before confirming.</p>
        </div>

        {/* Price pending banner */}
        {anyPriceUnset && (
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 14, padding: "14px 20px", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⏳</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#b45309", margin: "0 0 3px" }}>Pricing in progress — sit tight!</p>
              <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>Our team is confirming prices with your vendors. You'll be notified once all quotes are ready. You can review vendor details in the meantime.</p>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>

          {/* ── LEFT: Event details (sticky) ── */}
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              border: "1.5px solid rgba(139,69,19,0.1)",
              boxShadow: "0 4px 18px rgba(139,69,19,0.07)",
              padding: 24,
              position: "sticky",
              top: 80,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", borderRadius: 8, width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📝</span>
              Event Details
            </h2>

            {hasEventDetails ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {Object.entries(LABEL_MAP).map(([key, label]) => {
                  const val = formData[key];
                  if (!val && val !== 0) return null;
                  return (
                    <div key={key}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 14, color: "#2C1A0E", fontWeight: 500 }}>
                        {val}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#bbb", margin: 0 }}>No event details found. Fill in the planning form first.</p>
            )}
          </div>

          {/* ── RIGHT: Accordion vendor cards ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {vendorEntries.map(([serviceType, vendor]) => {
              const price = prices[serviceType];
              const isOpen = !!openKeys[serviceType];

              return (
                <div
                  key={serviceType}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1.5px solid rgba(139,69,19,0.1)",
                    boxShadow: "0 3px 14px rgba(139,69,19,0.06)",
                    overflow: "hidden",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Accordion header — always visible */}
                  <button
                    onClick={() => toggleOpen(serviceType)}
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
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 3 }}>
                        {isLetUsDoIt ? "Tendr" : (vendor.name || vendor.businessName || "Vendor")}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "3px 10px" }}>
                        {isLetUsDoIt ? "Concierge Planning" : serviceType}
                      </span>
                      {!isLetUsDoIt && vendor.city && <span style={{ fontSize: 12, color: "#9B7450", marginLeft: 8 }}>{vendor.city}</span>}
                    </div>
                    <div style={{ textAlign: "right", marginRight: 8, flexShrink: 0 }}>
                      {price !== null ? (
                        <>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#15803d" }}>✓ Price Confirmed</div>
                          <div style={{ fontSize: 17, fontWeight: 800, color: "#15803d" }}>{formatINR(price)}</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#b45309" }}>⏳ Awaiting Quote</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#9B7450", fontStyle: "italic" }}>Yet to be updated</div>
                        </>
                      )}
                    </div>
                    <ChevronIcon open={isOpen} />
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

                      {/* Pinned messages from chat */}
                      {pinnedMap[vendor?._id?.toString()]?.length > 0 && (
                        <div style={{ padding: "12px 20px 4px" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#9B7450", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            <span>📌</span> Pinned from Chat
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {pinnedMap[vendor._id.toString()].map((msg, i) => (
                              <div key={i} style={{ background: "#fffaf3", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 10, padding: "9px 13px", fontSize: 12.5, color: "#5a3a1a", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.55 }}>
                                {msg}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Chat summary / notes */}
                      <div style={{ padding: "12px 20px 4px" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#9B7450", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                          <span>💬</span> Chat Summary
                        </div>
                        {summaryMap[vendor?._id?.toString()] ? (
                          <div style={{ background: "#fffaf3", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#5a3a1a", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 120, overflowY: "auto", lineHeight: 1.55 }}>
                            {summaryMap[vendor?._id?.toString()]}
                          </div>
                        ) : (
                          <div style={{ background: "#fffaf3", border: "1.5px dashed rgba(196,122,46,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#bbb", fontStyle: "italic" }}>
                            Chat summary will appear here once confirmed by Tendr.
                          </div>
                        )}
                      </div>

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

            {/* ── Total + Proceed ── */}
            <div
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
                {appliedCode && confirmedTotal > 0 && (() => {
                  const { discount } = applyDiscount(confirmedTotal);
                  return (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#15803d" }}>
                      <span style={{ fontWeight: 600 }}>🎁 Referral Discount ({DISCOUNT_PERCENT}%)</span>
                      <span style={{ fontWeight: 700 }}>− {formatINR(discount)}</span>
                    </div>
                  );
                })()}

                <div style={{ borderTop: "1.5px solid rgba(139,69,19,0.1)", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 18, fontWeight: 800, color: "#2C1A0E" }}>
                  <span>{anyPriceUnset ? "Confirmed So Far" : "Total"}</span>
                  <span style={{ color: allConfirmed ? "#15803d" : "#C47A2E" }}>
                    {confirmedTotal > 0
                      ? formatINR(appliedCode ? applyDiscount(confirmedTotal).finalTotal : confirmedTotal)
                      : "—"}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "#9B7450", margin: 0 }}>
                  {allConfirmed
                    ? "✓ All prices confirmed by Tendr team."
                    : anyPriceUnset
                    ? "⏳ Some vendor quotes are still being confirmed. You'll be notified when all prices are ready."
                    : "Prices confirmed in chat."}
                </p>
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
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#7A5535", background: "rgba(196,122,46,0.07)", borderRadius: 100, padding: "5px 12px", border: "1px solid rgba(196,122,46,0.15)" }}>
                    <span style={{ fontSize: 13 }}>{icon}</span> {text}
                  </div>
                ))}
              </div>

              {anyPriceUnset ? (
                <div style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#f3f4f6", color: "#9ca3af", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif", textAlign: "center", border: "1.5px dashed #d1d5db" }}>
                  ⏳ Waiting for all quotes to be confirmed
                </div>
              ) : (
                <button
                  disabled={saving}
                  onClick={() => setShowConfirmPopup(true)}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}
                >
                  Proceed to Payment
                </button>
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
                          setSaving(false);
                          setShowConfirmPopup(false);
                          const finalAmount = appliedCode ? applyDiscount(confirmedTotal).finalTotal : confirmedTotal;
                          navigate("/booking/payment", { state: { finalisedVendors, formData, totalAmount: finalAmount, referralCode: appliedCode || null, eventPlanId } });
                        }}
                        style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}
                      >
                        {saving ? "Saving…" : "Continue to Payment →"}
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
    </div>
  );
};

export default BookingReviewPage;

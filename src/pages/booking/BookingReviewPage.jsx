import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;
import { clearFinalisedVendor } from "../../redux/listingFiltersSlice";
import ListingsNav from "../../components/ListingsNav";
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

  const finalisedVendors = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const compareSelected = useSelector((s) => s.listingFilters.compareSelected || []);
  const formData = useSelector((s) => s.eventPlanning.formData || {});
  const bookingType = useSelector((s) => s.eventPlanning.bookingType);
  const isLetUsDoIt = bookingType === "let-us-do-it";

  const vendorEntries = Object.entries(finalisedVendors);

  // Fetch real prices from the customer's vendor conversations
  const [priceMap, setPriceMap] = useState({}); // { vendorId: { amount, vendorName, service, confirmed } }
  const [summaryMap, setSummaryMap] = useState({}); // { vendorId: bookingSummary }
  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : { conversations: [] })
      .then(data => {
        const pm = {};
        const sm = {};
        (data.conversations || []).forEach(c => {
          const vid = c.vendorId?._id || c.vendorId;
          if (!vid) return;
          const key = vid.toString();
          if (c.vendorPrice?.amount > 0) {
            pm[key] = { amount: c.vendorPrice.amount, vendorName: c.vendorPrice.vendorName, service: c.vendorPrice.service, confirmed: true };
          }
          if (c.bookingSummary) sm[key] = c.bookingSummary;
        });
        setPriceMap(pm);
        setSummaryMap(sm);
      })
      .catch(() => {});
  }, [token]);

  // Use real price if admin confirmed it, otherwise fall back to estimate
  const getPrice = (vendor) => {
    const vid = vendor?._id?.toString();
    return priceMap[vid]?.amount || vendorPrice(vendor);
  };
  const isConfirmed = (vendor) => !!priceMap[vendor?._id?.toString()]?.confirmed;

  const prices = vendorEntries.reduce((acc, [key, v]) => {
    acc[key] = getPrice(v);
    return acc;
  }, {});
  const totalPrice = Object.values(prices).reduce((a, b) => a + b, 0);
  const allConfirmed = vendorEntries.every(([, v]) => isConfirmed(v));

  // Accordion: first vendor open by default
  const [openKeys, setOpenKeys] = useState(() =>
    vendorEntries.length > 0 ? { [vendorEntries[0][0]]: true } : {}
  );
  const toggleOpen = (key) =>
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const [notes, setNotes] = useState({});
  const [saving, setSaving] = useState(false);
  const token = useSelector((s) => s.auth.token);
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
        <ListingsNav showFinalisedBtn={false} hideTitle={true} />
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
      <BasicSpeedDial />
      <ListingsNav showFinalisedBtn={false} hideTitle={true} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px", width: "100%", boxSizing: "border-box" }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Review & Book</h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Review your event details and finalised vendors before confirming.</p>
        </div>

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
                      <div style={{ fontSize: 11, fontWeight: 600, color: isConfirmed(vendor) ? "#15803d" : "#9B7450" }}>
                        {isConfirmed(vendor) ? "✓ Confirmed" : "Estimated"}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: isConfirmed(vendor) ? "#15803d" : "#C47A2E" }}>
                        {formatINR(price)}
                      </div>
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
                    <span style={{ fontWeight: 600 }}>{formatINR(prices[serviceType])}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1.5px solid rgba(139,69,19,0.1)", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 18, fontWeight: 800, color: "#2C1A0E" }}>
                  <span>{allConfirmed ? "Total" : "Total Estimate"}</span>
                  <span style={{ color: allConfirmed ? "#15803d" : "#C47A2E" }}>{formatINR(totalPrice)}</span>
                </div>
                <p style={{ fontSize: 11, color: "#bbb", margin: 0 }}>
                  {allConfirmed
                    ? "✓ All prices confirmed by Tendr team."
                    : "*Prices marked 'Estimated' are indicative — final quote confirmed in chat."}
                </p>
              </div>

              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  const eventPlanId = await saveEventPlan();
                  setSaving(false);
                  navigate("/booking/payment", { state: { finalisedVendors, formData, totalAmount: totalPrice, eventPlanId } });
                }}
                style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: saving ? "#e5e7eb" : "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: saving ? "#9ca3af" : "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 4px 14px rgba(196,122,46,0.35)", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {saving ? "Saving..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewPage;

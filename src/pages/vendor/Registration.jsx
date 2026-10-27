import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  PERFORMER_CATEGORIES, PERFORMER_ART_FORMS, GIG_STYLE_OPTIONS,
  GIG_LANG_OPTIONS, GIG_LANGUAGE_CATEGORIES, CONTENT_RATING_OPTIONS,
  performanceLabel, performanceFieldHints, QUICK_PERFORMANCE_ITEMS,
  HOSTING_RESPONSIBILITY_OPTIONS, AUDIENCE_SIZE_OPTIONS, CAPABILITY_BADGE_OPTIONS,
  AUDIENCE_PARTICIPATION_OPTIONS, AGE_SUITABILITY_OPTIONS, EQUIPMENT_PROVIDED_OPTIONS,
  PARTY_ENERGY_OPTIONS, SCRIPT_SOURCE_OPTIONS, REQUIREMENT_FIELD_CATEGORIES,
  SONG_REQUEST_CATEGORIES, PERFORMANCE_ATMOSPHERE_OPTIONS, CUSTOM_MATERIAL_CATEGORIES,
} from "../../constants/performerCategories";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font  = "'Outfit', sans-serif";
const gold  = "#C47A2E";
const ink   = "#1C0E04";
const muted = "#7A5535";

// ─── Data ─────────────────────────────────────────────────────────────────────

const COORDINATOR_SPECIALIZATIONS = [
  "Wedding Planning", "Corporate Events", "Birthday & Private Parties",
  "Social Events (Baby Shower, Anniversary)", "Award Nights & Galas",
  "Musical Nights / Concerts", "Exhibitions & Product Launches", "Sports Events",
];

// ── Coordinator application questionnaire options ──────────────────────────
const COORD_WHAT_YOU_CAN_DO = [
  "Bring new event orders to Tendr",
  "Coordinate with customers virtually through chat/calls",
  "Conduct home visits when required",
  "Coordinate with Tendr vendors",
  "Conduct venue visits when required",
  "Be present on event day when required",
  "Help resolve customer/vendor issues",
  "Represent Tendr professionally",
];

const COORD_PAYOUT_YOU_BRING = [
  { contribution: "Bring Order Only",                                    payout: "20%" },
  { contribution: "Bring + Virtual/Chat Coordination",                   payout: "30%" },
  { contribution: "Bring + Virtual + Home Visit",                        payout: "30%" },
  { contribution: "Bring + Virtual + Event Day",                         payout: "30%" },
  { contribution: "Bring + Virtual + Home Visit + Event Day",            payout: "35%" },
];
const COORD_PAYOUT_TENDR_GIVES = [
  { contribution: "Virtual/Chat Coordination",            payout: "10%" },
  { contribution: "Virtual + Home Visit",                 payout: "20%" },
  { contribution: "Virtual + Event Day",                  payout: "20%" },
  { contribution: "Virtual + Home Visit + Event Day",      payout: "30%" },
];

const COORD_WHAT_YOU_GET = [
  "Performance-based earning",
  "Flexible work opportunities across Delhi NCR",
  "No need to maintain your own vendor network",
  "Earn by bringing your own event leads",
  "Virtual, home-visit and on-ground opportunities",
  "Work with Tendr's technology and vendor ecosystem",
  "Opportunity to grow with an emerging event-tech startup",
];

const COORD_LANGUAGE_OPTIONS = ["English", "Hindi", "Both", "Other"];
const COORD_HOURS_OPTIONS = ["2–5 hrs/week", "5–10 hrs/week", "10–20 hrs/week", "20+ hrs/week", "Flexible/full-time"];
const COORD_AVAILABLE_FOR_OPTIONS = ["Virtual coordination", "Home visits", "Venue visits", "Event day coordination", "Short notice assignments"];
const COORD_TRAVEL_AREAS = ["Ghaziabad", "Noida", "Greater Noida", "Gurgaon"];
const COORD_APP_COMFORT_OPTIONS = ["Comfortable", "Can try", "Not comfortable"];
const COORD_HOME_VISIT_OPTIONS = ["YES", "Depend on event", "Only in preferred area", "NO"];
const COORD_EVENT_PRESENCE_OPTIONS = ["Yes", "No", "Maybe"];
const COORD_LATE_WORK_OPTIONS = ["Until 8 pm", "Until 10 pm", "Flexible", "Until midnight"];

const CITY_OPTIONS = [
  "Delhi", "Noida", "Gurugram", "Ghaziabad", "Faridabad",
  "Mumbai", "Pune", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Chandigarh",
];

// Per-category genre/specialization chip options shown on the artist profile
// step. DJ/Magician/Stand-up Comedian/Performer reuse GIG_STYLE_OPTIONS (imported
// below) instead of a separate genre list — those categories are about
// performance style, not musical genre.
const ARTIST_GENRES = {
  Singer:        ["Bollywood", "Classical", "Western/Pop", "Ghazal/Sufi", "Folk", "Jazz", "Devotional"],
  Band:          ["Bollywood", "Rock/Jazz", "Fusion", "Devotional", "Retro", "EDM"],
  Musician:      ["Piano", "Guitar", "Tabla", "Violin", "Flute", "Saxophone", "Sitar", "Multiple"],
};

const DURATION_OPTIONS = ["30–45 min", "1 hour", "2 hours", "3 hours", "Full event (4+ hrs)", "Flexible"];
const PRICE_RANGE_OPTIONS = ["Under ₹5,000", "₹5,000–10,000", "₹10,000–25,000", "₹25,000–50,000", "₹50,000+", "Negotiable"];

const VENDOR_SERVICE_TYPES = [
  { value: "Decorator",      label: "Decorator / Event Stylist",   sub: "Floral, balloon, LED, draping" },
  { value: "Caterer",        label: "Caterer / Food Service",      sub: "Buffet, live counters, delivery" },
  { value: "Photographer",   label: "Photographer / Videographer", sub: "Candid, cinematic, drone" },
  { value: "DJ",             label: "DJ",                          sub: "Open format, Bollywood, EDM" },
  { value: "Florist",        label: "Florist",                     sub: "Wedding & event florals" },
  { value: "AV Setup",       label: "AV / Tech Setup",             sub: "Projector, LED wall, sound" },
  { value: "Venue",          label: "Venue / Banquet Hall",        sub: "Indoor, outdoor, rooftop" },
  { value: "Baker",          label: "Baker / Cake Studio",         sub: "Wedding, birthday, custom cakes" },
  { value: "Transportation", label: "Transportation",              sub: "Cars, buses, vintage vehicles" },
  { value: "Makeup Artist",  label: "Makeup Artist / Hair Stylist",sub: "Bridal, party, editorial" },
  { value: "Other",          label: "Other",                       sub: "Something not listed above" },
];

const CATEGORY_QUESTIONS = {
  Decorator: [
    { id: "specializations", label: "Specializations", type: "chips", options: ["Floral", "Balloon", "LED/Lighting", "Draping", "Minimal", "Grand/Royal", "Mehendi"] },
    { id: "inventory",       label: "Own inventory?",  type: "radio", options: ["Own", "Rented", "Mix of both"] },
    { id: "teamSize",        label: "Team size",        type: "radio", options: ["Solo", "2–5", "5–10", "10+"] },
    { id: "minBooking",      label: "Min booking value",type: "radio", options: ["< ₹10K", "₹10–25K", "₹25–50K", "₹50K+"] },
  ],
  Caterer: [
    { id: "cuisines",     label: "Cuisines served",    type: "chips", options: ["North Indian", "South Indian", "Continental", "Chinese", "Mughlai", "Multi-cuisine"] },
    { id: "serviceStyle", label: "Service style",      type: "chips", options: ["Buffet", "Live Counters", "Plated Service", "Home Delivery"] },
    { id: "capacity",     label: "Max guest capacity", type: "radio", options: ["Up to 50", "50–200", "200–500", "500–1000", "1000+"] },
    { id: "foodType",     label: "Food type",          type: "radio", options: ["Pure Veg", "Non-Veg", "Both"] },
  ],
  Photographer: [
    { id: "style",        label: "Photography style",  type: "chips", options: ["Candid", "Traditional", "Cinematic", "Documentary", "Drone/Aerial"] },
    { id: "teamSize",     label: "Team",                type: "radio", options: ["Solo", "Duo", "Full team (3+)"] },
    { id: "portfolioLink",label: "Portfolio link",      type: "text",  placeholder: "https://your-portfolio.com" },
    { id: "delivery",     label: "Delivery timeline",  type: "radio", options: ["Within 1 week", "2–4 weeks", "1–2 months"] },
  ],
  DJ: [
    { id: "genres",      label: "Music genres",  type: "chips", options: ["Bollywood", "EDM", "Hip-Hop", "Commercial", "Retro", "All genres"] },
    { id: "equipment",   label: "Equipment",     type: "radio", options: ["Own setup", "Venue provides", "Both"] },
    { id: "setDuration", label: "Set duration",  type: "radio", options: ["2–4 hrs", "4–6 hrs", "6–8 hrs", "Full day"] },
  ],
  Florist: [
    { id: "specialization", label: "Specialization", type: "chips", options: ["Wedding", "Birthday/Events", "Corporate", "Gifting"] },
    { id: "delivery",       label: "Services",       type: "radio", options: ["Delivery + Setup", "Venue setup only", "Pickup only"] },
  ],
  "AV Setup": [
    { id: "equipment", label: "Equipment offered", type: "chips", options: ["Projector/Screen", "LED Wall", "Sound System", "Stage Lighting", "Complete AV"] },
    { id: "techTeam",  label: "Tech team",         type: "radio", options: ["Own team", "Freelance", "Both"] },
  ],
  Venue: [
    { id: "capacity",  label: "Guest capacity", type: "radio", options: ["Up to 50", "50–200", "200–500", "500–1000", "1000+"] },
    { id: "type",      label: "Venue type",     type: "radio", options: ["Indoor", "Outdoor", "Both"] },
    { id: "ac",        label: "Air conditioned",type: "radio", options: ["Yes", "No", "Partly"] },
    { id: "catering",  label: "Catering policy",type: "radio", options: ["In-house only", "External allowed", "Both"] },
  ],
  Baker: [
    { id: "specialization", label: "Specialization",   type: "chips", options: ["Wedding Cakes", "Birthday Cakes", "Cupcakes", "Custom/Fondant", "Dessert Tables"] },
    { id: "leadTime",       label: "Lead time needed", type: "radio", options: ["Same day", "2–3 days", "1 week", "2+ weeks"] },
    { id: "delivery",       label: "Delivery",         type: "radio", options: ["Delivery available", "Pickup only"] },
  ],
  Transportation: [
    { id: "vehicles", label: "Vehicle types", type: "chips", options: ["Car/SUV", "Bus/Mini-bus", "Vintage Car", "Tempo Traveller", "Luxury Coach"] },
    { id: "fleet",    label: "Fleet",         type: "radio", options: ["Own fleet", "Third-party tie-up", "Both"] },
  ],
  "Makeup Artist": [
    { id: "specialization", label: "Specialization", type: "chips", options: ["Bridal Makeup", "Party Makeup", "Hair Styling", "Mehendi", "Editorial"] },
    { id: "travel",         label: "Travel to client?",type: "radio", options: ["Yes", "Studio only", "Both"] },
  ],
};

const TRUST = [
  { n: "15%", label: "Commission",  sub: "15% platform fee on confirmed bookings only" },
  { n: "Free",  label: "To list",    sub: "No monthly fees, no hidden charges" },
  { n: "24 hrs",label: "Review time",sub: "Our team reviews every application fast" },
];

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ step, steps = ["Category", "Specialty", "Details"] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20 }}>
      {steps.map((label, i) => {
        const s = i + 1;
        const done   = step > s;
        const active = step === s;
        return (
          <React.Fragment key={s}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, fontFamily: font,
                background: done ? gold : active ? "#fff" : "#f3ede6",
                color: done ? "#fff" : active ? gold : "#B8956A",
                border: active ? `2px solid ${gold}` : done ? `2px solid ${gold}` : "2px solid #E5D5C0",
                transition: "all 0.25s",
              }}>
                {done
                  ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : s}
              </div>
              <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500, color: active ? gold : done ? gold : "#B8956A", fontFamily: font, letterSpacing: "0.02em" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1.5, background: step > s ? gold : "#E5D5C0", margin: "0 5px", marginBottom: 14, borderRadius: 2, transition: "background 0.3s" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Shell layout ─────────────────────────────────────────────────────────────

const FREE_FEATS = ["Profile & portfolio", "Discovered by clients", "Receive leads", "15% only on Tendr bookings", "Always free to list"];
const PAID_FEATS = ["Bookings & availability calendar", "Client CRM & reviews", "Quotes, invoices & contracts", "Payments & profit tracking", "Smart reminders & alerts", "Business insights & analytics", "Flyer builder & link hub", "Hindi & English support", "0% commission on outside bookings"];

function Shell({ children, step, steps, narrow = true, sideTitle, sideSub, sideTiers, hideTrustStrip }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F9F6F1", fontFamily: font }}>
      <style>{`
        @media (min-width: 900px) {
          .reg-wrap { display: grid !important; grid-template-columns: 320px 1fr !important; min-height: 100vh !important; }
          .reg-side  { display: flex !important; }
          .reg-main  { padding: 64px 64px !important; }
        }
      `}</style>
      <div className="reg-wrap" style={{ display: "block" }}>

        {/* Left brand panel (desktop only) */}
        <div className="reg-side" style={{ display: "none", flexDirection: "column", justifyContent: "space-between", background: "#1C0E04", padding: "52px 36px" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#F5ECD8", letterSpacing: "-0.01em", marginBottom: 8 }}>tendr</div>
            <div style={{ width: 32, height: 2, background: gold, borderRadius: 2, marginBottom: 32 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem,2.5vw,2.2rem)", fontWeight: 500, color: "#F5ECD8", lineHeight: 1.2, margin: "0 0 16px", fontStyle: "italic" }}>
              {sideTitle || "Get discovered by thousands of event planners in Delhi NCR."}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(245,236,216,0.55)", lineHeight: 1.7, margin: "0 0 28px" }}>
              {sideSub || "Join Tendr's verified network — real clients, real bookings, 15% platform fee."}
            </p>
          </div>

          {sideTiers ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Free tier summary */}
              <div style={{ borderRadius: 12, border: "1px solid rgba(196,122,46,0.22)", padding: "14px 16px" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(196,122,46,0.65)", marginBottom: 5 }}>Free listing</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#F5ECD8", marginBottom: 10 }}>₹0 forever</div>
                {FREE_FEATS.map(f => (
                  <div key={f} style={{ fontSize: 11.5, color: "rgba(245,236,216,0.48)", display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 5 }}>
                    <span style={{ color: gold, flexShrink: 0, lineHeight: 1.5 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              {/* Paid tier summary */}
              <div style={{ borderRadius: 12, border: `1.5px solid ${gold}`, padding: "14px 16px", background: "rgba(196,122,46,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold }}>Dashboard</div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: "#1C0E04", background: gold, padding: "2px 8px", borderRadius: 100 }}>7 days free</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#F5ECD8" }}>₹399 <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(245,236,216,0.45)" }}>+ GST / month</span></div>
                <div style={{ fontSize: 10.5, color: "rgba(245,236,216,0.38)", marginBottom: 10 }}>after free trial · no card needed</div>
                {PAID_FEATS.slice(0, 5).map(f => (
                  <div key={f} style={{ fontSize: 11.5, color: "rgba(245,236,216,0.48)", display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 5 }}>
                    <span style={{ color: gold, flexShrink: 0, lineHeight: 1.5 }}>✓</span>{f}
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "rgba(196,122,46,0.6)", marginTop: 6 }}>+{PAID_FEATS.length - 5} more features</div>
              </div>
            </div>
          ) : hideTrustStrip ? null : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {TRUST.map(t => (
                <div key={t.n} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 400, color: gold, flexShrink: 0, lineHeight: 1 }}>{t.n}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F5ECD8", marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(245,236,216,0.45)", lineHeight: 1.5 }}>{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right content */}
        <div className="reg-main" style={{ padding: "36px 20px 60px", maxWidth: narrow ? 540 : "100%", margin: narrow ? "0 auto" : 0 }}>
          {step && <StepBar step={step} steps={steps} />}
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Shared input helpers ─────────────────────────────────────────────────────

function inputStyle(focused, errors, field, gold, ink) {
  return {
    width: "100%", padding: "13px 16px", borderRadius: 10, fontSize: 15, fontFamily: font,
    color: ink, background: "#fff", outline: "none", boxSizing: "border-box",
    border: `1.5px solid ${errors[field] ? "#c0392b" : focused === field ? gold : "rgba(28,14,4,0.14)"}`,
    transition: "border-color 0.18s",
  };
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: font }}>{msg}</p>;
}

function Label({ children, required, optional }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 6, fontFamily: font }}>
      {children}
      {required && <span style={{ color: gold }}> *</span>}
      {optional && <span style={{ color: "#aaa", fontWeight: 400 }}> (optional)</span>}
    </label>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ name, isCoordinator, navigate }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F9F6F1", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: font }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 36px", maxWidth: 440, width: "100%", textAlign: "center", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 4px 24px rgba(28,14,4,0.07)" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(196,122,46,0.1)", border: `2px solid rgba(196,122,46,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: ink, margin: "0 0 10px" }}>Application Submitted</h2>
        <p style={{ fontSize: 14, color: muted, margin: "0 0 28px", lineHeight: 1.65 }}>
          Thank you, <strong>{name?.split(" ")[0]}</strong>. Our team will review your details and reach you{" "}
          {isCoordinator ? "via phone" : "on WhatsApp"} within 24–48 hours.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {!isCoordinator && (
            <button onClick={() => navigate("/vendor/status")} style={{ background: "#fff", color: gold, border: `1.5px solid rgba(196,122,46,0.4)`, borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
              Check Status
            </button>
          )}
          <button onClick={() => navigate("/")} style={{ background: gold, color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Coordinator Registration Flow ────────────────────────────────────────────

function InfoCard({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1px solid rgba(28,14,4,0.07)", marginBottom: 14 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: ink, margin: "0 0 10px" }}>{title}</h3>
      <div style={{ fontSize: 13, color: muted, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function CoordChipGroup({ options, selected, multi, onToggle, error }) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map(opt => {
          const on = multi ? selected.includes(opt) : selected === opt;
          return (
            <button key={opt} type="button" onClick={() => onToggle(opt)}
              style={{ padding: "8px 14px", borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s" }}>
              {opt}
            </button>
          );
        })}
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function CoordRatingScale({ value, onChange, error }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: muted, letterSpacing: "0.04em" }}>POOR</span>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => onChange(n)}
              style={{
                width: 34, height: 34, borderRadius: "50%", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer",
                border: value === n ? "none" : "1.5px solid rgba(28,14,4,0.14)",
                background: value === n ? gold : "#fff",
                color: value === n ? "#fff" : muted,
                transition: "all 0.15s",
              }}>
              {n}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: muted, letterSpacing: "0.04em" }}>BEST</span>
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function CoordinatorForm({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    name: "", phoneNumber: "", email: "", address: "",
    age: "", preferredLanguage: "", currentOccupation: "",
    hasOrganizedEvents: "", eventsOrganizedCount: "", hasVendorNetwork: "",
    availableHoursPerWeek: "", availableFor: [], travelAreas: [],
    planningExperience: "", qualification: "", canBringLeads: "", instagram: "",
    customerInteractionComfort: 0, callComfort: 0, inPersonMeetingComfort: 0, problemHandlingComfort: 0,
    appComfort: "", homeVisitComfort: "", eventPresenceComfort: "", lateWorkComfort: "",
    password: "", confirmPassword: "",
  });
  const [errors, setErrors]   = useState({});
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPw, setShowPw]   = useState(false);

  const iStyle = (f) => inputStyle(focused, errors, f, gold, ink);
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };
  const toggleMulti = (k, val) => { setForm(p => ({ ...p, [k]: p[k].includes(val) ? p[k].filter(x => x !== val) : [...p[k], val] })); setErrors(p => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                e.name = "Name is required";
    if (!form.phoneNumber.trim())         e.phoneNumber = "Contact no. is required";
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) e.phoneNumber = "Enter a valid 10-digit number";
    if (!form.email.trim())               e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.address.trim())             e.address = "Address is required";
    if (!form.age || Number(form.age) < 16 || Number(form.age) > 80) e.age = "Enter a valid age";
    if (!form.preferredLanguage)          e.preferredLanguage = "Please select one";
    if (!form.currentOccupation.trim())   e.currentOccupation = "Current occupation is required";
    if (!form.hasOrganizedEvents)         e.hasOrganizedEvents = "Please select Yes or No";
    if (!form.hasVendorNetwork)           e.hasVendorNetwork = "Please select Yes or No";
    if (!form.availableHoursPerWeek)      e.availableHoursPerWeek = "Please select one";
    if (form.availableFor.length === 0)   e.availableFor = "Select at least one";
    if (form.travelAreas.length === 0)    e.travelAreas = "Select at least one area";
    if (!form.planningExperience.trim())  e.planningExperience = "This field is required";
    if (!form.qualification.trim())       e.qualification = "Qualification is required";
    if (!form.canBringLeads)              e.canBringLeads = "Please select Yes or No";
    if (!form.customerInteractionComfort) e.customerInteractionComfort = "Please rate this";
    if (!form.callComfort)                e.callComfort = "Please rate this";
    if (!form.inPersonMeetingComfort)     e.inPersonMeetingComfort = "Please rate this";
    if (!form.problemHandlingComfort)     e.problemHandlingComfort = "Please rate this";
    if (!form.appComfort)                 e.appComfort = "Please select one";
    if (!form.homeVisitComfort)           e.homeVisitComfort = "Please select one";
    if (!form.eventPresenceComfort)       e.eventPresenceComfort = "Please select one";
    if (!form.lateWorkComfort)            e.lateWorkComfort = "Please select one";
    if (!form.password)                   e.password = "Password is required";
    else if (form.password.length < 8)    e.password = "Password must be at least 8 characters";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${BASE_URL}/coordinators/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:             form.name.trim(),
          phoneNumber:      form.phoneNumber.trim(),
          email:            form.email.trim(),
          address:          form.address.trim(),
          city:             form.address.trim(), // form only asks for Address, not City separately — mirrored for existing city-based admin search/filters
          age:              Number(form.age),
          preferredLanguage: form.preferredLanguage,
          currentOccupation: form.currentOccupation.trim(),
          hasOrganizedEvents: form.hasOrganizedEvents,
          eventsOrganizedCount: form.eventsOrganizedCount.trim(),
          hasVendorNetwork: form.hasVendorNetwork,
          availableHoursPerWeek: form.availableHoursPerWeek,
          availableFor:     form.availableFor,
          travelAreas:      form.travelAreas,
          planningExperience: form.planningExperience.trim(),
          qualification:    form.qualification.trim(),
          canBringLeads:    form.canBringLeads,
          instagram:        form.instagram.trim(),
          customerInteractionComfort: form.customerInteractionComfort,
          callComfort:       form.callComfort,
          inPersonMeetingComfort: form.inPersonMeetingComfort,
          problemHandlingComfort: form.problemHandlingComfort,
          appComfort:        form.appComfort,
          homeVisitComfort:  form.homeVisitComfort,
          eventPresenceComfort: form.eventPresenceComfort,
          lateWorkComfort:   form.lateWorkComfort,
          password:          form.password,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setApiError(data.error || "Account already exists with this phone number.");
        else setApiError(data.error || "Submission failed. Please try again.");
        return;
      }
      onSuccess(form.name);
    } catch {
      setApiError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell
      step={2}
      steps={["Category", "Application"]}
      narrow={false}
      hideTrustStrip
      sideTitle="Manage real events, earn real income."
      sideSub="Tendr's Event Coordinator program — handle client chats, plan events, earn commissions."
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Event Coordinator</p>
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, color: ink, margin: "0 0 10px", lineHeight: 1.2 }}>Become a Tendr Event Coordinator</h1>
          <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, margin: 0 }}>
            You don't need your own vendor network or an event company. Tendr provides the platform, vendor ecosystem and support — you bring your communication, planning and coordination skills.
          </p>
        </div>

        <InfoCard title="What you can do">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {COORD_WHAT_YOU_CAN_DO.map(i => <li key={i} style={{ marginBottom: 4 }}>{i}</li>)}
          </ul>
        </InfoCard>

        <InfoCard title="💰 Coordinator Earnings">
          <p style={{ margin: "0 0 14px" }}>Your commission is calculated on <strong>Tendr's earnings</strong> from the booking, NOT on the customer's total event value.</p>

          <p style={{ fontWeight: 700, color: ink, margin: "0 0 6px" }}>If you bring the customer</p>
          <div style={{ overflowX: "auto", marginBottom: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <tbody>
                {COORD_PAYOUT_YOU_BRING.map(row => (
                  <tr key={row.contribution} style={{ borderBottom: "1px solid rgba(28,14,4,0.07)" }}>
                    <td style={{ padding: "7px 10px 7px 0", color: muted }}>{row.contribution}</td>
                    <td style={{ padding: "7px 0", textAlign: "right", fontWeight: 700, color: gold, whiteSpace: "nowrap" }}>{row.payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontWeight: 700, color: ink, margin: "0 0 6px" }}>If Tendr gives you the customer</p>
          <div style={{ overflowX: "auto", marginBottom: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <tbody>
                {COORD_PAYOUT_TENDR_GIVES.map(row => (
                  <tr key={row.contribution} style={{ borderBottom: "1px solid rgba(28,14,4,0.07)" }}>
                    <td style={{ padding: "7px 10px 7px 0", color: muted }}>{row.contribution}</td>
                    <td style={{ padding: "7px 0", textAlign: "right", fontWeight: 700, color: gold, whiteSpace: "nowrap" }}>{row.payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ margin: "0 0 8px" }}><strong>No booking = No commission.</strong> Home visits are free for eligible Tendr customers. Approved home visits will receive separate visit/travel compensation, even if the customer does not ultimately book.</p>
          <p style={{ margin: 0 }}>All bookings and customer payments must happen through Tendr.</p>
        </InfoCard>

        <InfoCard title="What you get">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {COORD_WHAT_YOU_GET.map(i => <li key={i} style={{ marginBottom: 4 }}>{i}</li>)}
          </ul>
        </InfoCard>

        <InfoCard title="Social Media Requirement">
          <p style={{ margin: "0 0 8px" }}>As a Tendr Event Coordinator, you will represent the Tendr brand. You are expected to follow, interact with and share Tendr's social media content.</p>
          <p style={{ margin: "0 0 8px" }}>📸 Instagram: <strong>@justtendrit</strong></p>
          <p style={{ margin: "0 0 8px" }}>We'd also appreciate you adding <strong>@justtendr</strong> to your Instagram bio while working with Tendr.</p>
          <p style={{ margin: 0 }}>📍 Location: Delhi NCR</p>
        </InfoCard>

        <p style={{ fontSize: 14, color: ink, fontWeight: 600, margin: "4px 0 20px" }}>
          If you enjoy events, people, planning, coordination and taking ownership, apply below.
        </p>

        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 2px 12px rgba(28,14,4,0.05)" }}>
          {apiError && (
            <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div>
              <Label required>Name</Label>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                placeholder="e.g. Priya Sharma" style={iStyle("name")} />
              <FieldError msg={errors.name} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label required>Contact no.</Label>
                <input value={form.phoneNumber} onChange={e => set("phoneNumber", e.target.value)}
                  onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")}
                  placeholder="10-digit" maxLength={10} type="tel" style={iStyle("phoneNumber")} />
                <FieldError msg={errors.phoneNumber} />
              </div>
              <div>
                <Label required>Email</Label>
                <input value={form.email} onChange={e => set("email", e.target.value)}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  placeholder="you@email.com" type="email" style={iStyle("email")} />
                <FieldError msg={errors.email} />
              </div>
            </div>

            <div>
              <Label required>Address</Label>
              <input value={form.address} onChange={e => set("address", e.target.value)}
                onFocus={() => setFocused("address")} onBlur={() => setFocused("")}
                placeholder="e.g. Sector 62, Noida" style={iStyle("address")} />
              <FieldError msg={errors.address} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label required>Age</Label>
                <input value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, ""))}
                  onFocus={() => setFocused("age")} onBlur={() => setFocused("")}
                  placeholder="e.g. 24" inputMode="numeric" maxLength={2} style={iStyle("age")} />
                <FieldError msg={errors.age} />
              </div>
              <div>
                <Label required>Preferred language</Label>
                <CoordChipGroup options={COORD_LANGUAGE_OPTIONS} selected={form.preferredLanguage} onToggle={v => set("preferredLanguage", v)} error={errors.preferredLanguage} />
              </div>
            </div>

            <div>
              <Label required>Current occupation</Label>
              <input value={form.currentOccupation} onChange={e => set("currentOccupation", e.target.value)}
                onFocus={() => setFocused("currentOccupation")} onBlur={() => setFocused("")}
                placeholder="e.g. Student, Working professional" style={iStyle("currentOccupation")} />
              <FieldError msg={errors.currentOccupation} />
            </div>

            <div>
              <Label required>Have you ever organized or managed any event?</Label>
              <CoordChipGroup options={["Yes", "No"]} selected={form.hasOrganizedEvents} onToggle={v => set("hasOrganizedEvents", v)} error={errors.hasOrganizedEvents} />
            </div>

            {form.hasOrganizedEvents === "Yes" && (
              <div>
                <Label optional>If yes, how many?</Label>
                <input value={form.eventsOrganizedCount} onChange={e => set("eventsOrganizedCount", e.target.value)}
                  onFocus={() => setFocused("eventsOrganizedCount")} onBlur={() => setFocused("")}
                  placeholder="e.g. 5" style={iStyle("eventsOrganizedCount")} />
              </div>
            )}

            <div>
              <Label required>Do you have vendor network?</Label>
              <CoordChipGroup options={["Yes", "No"]} selected={form.hasVendorNetwork} onToggle={v => set("hasVendorNetwork", v)} error={errors.hasVendorNetwork} />
            </div>

            <div>
              <Label required>How much time can you give to Tendr?</Label>
              <CoordChipGroup options={COORD_HOURS_OPTIONS} selected={form.availableHoursPerWeek} onToggle={v => set("availableHoursPerWeek", v)} error={errors.availableHoursPerWeek} />
            </div>

            <div>
              <Label required>Available for?</Label>
              <CoordChipGroup options={COORD_AVAILABLE_FOR_OPTIONS} selected={form.availableFor} multi onToggle={v => toggleMulti("availableFor", v)} error={errors.availableFor} />
            </div>

            <div>
              <Label required>Which all places are you comfortable to travel in case of a home visit?</Label>
              <CoordChipGroup options={COORD_TRAVEL_AREAS} selected={form.travelAreas} multi onToggle={v => toggleMulti("travelAreas", v)} error={errors.travelAreas} />
            </div>

            <div>
              <Label required>Any event planning/managing experience? (Not necessary to have some)</Label>
              <textarea value={form.planningExperience} onChange={e => set("planningExperience", e.target.value)}
                onFocus={() => setFocused("planningExperience")} onBlur={() => setFocused("")}
                rows={3} placeholder="Tell us briefly, or write 'None' if you haven't yet"
                style={{ ...iStyle("planningExperience"), resize: "vertical" }} />
              <FieldError msg={errors.planningExperience} />
            </div>

            <div>
              <Label required>Qualification</Label>
              <input value={form.qualification} onChange={e => set("qualification", e.target.value)}
                onFocus={() => setFocused("qualification")} onBlur={() => setFocused("")}
                placeholder="e.g. B.Com, 12th pass" style={iStyle("qualification")} />
              <FieldError msg={errors.qualification} />
            </div>

            <div>
              <Label required>Can you bring leads to Tendr? (Not for free)</Label>
              <CoordChipGroup options={["Yes", "No"]} selected={form.canBringLeads} onToggle={v => set("canBringLeads", v)} error={errors.canBringLeads} />
            </div>

            <div>
              <Label optional>Instagram handle</Label>
              <input value={form.instagram} onChange={e => set("instagram", e.target.value)}
                onFocus={() => setFocused("instagram")} onBlur={() => setFocused("")}
                placeholder="@yourhandle" style={iStyle("instagram")} />
            </div>

            <div style={{ height: 1, background: "rgba(28,14,4,0.07)" }} />

            <div>
              <Label required>How comfortable are you interacting with customers?</Label>
              <CoordRatingScale value={form.customerInteractionComfort} onChange={v => set("customerInteractionComfort", v)} error={errors.customerInteractionComfort} />
            </div>
            <div>
              <Label required>How comfortable are you with making calls?</Label>
              <CoordRatingScale value={form.callComfort} onChange={v => set("callComfort", v)} error={errors.callComfort} />
            </div>
            <div>
              <Label required>How comfortable are you meeting customers in person?</Label>
              <CoordRatingScale value={form.inPersonMeetingComfort} onChange={v => set("inPersonMeetingComfort", v)} error={errors.inPersonMeetingComfort} />
            </div>
            <div>
              <Label required>How comfortable are you handling unexpected problems?</Label>
              <CoordRatingScale value={form.problemHandlingComfort} onChange={v => set("problemHandlingComfort", v)} error={errors.problemHandlingComfort} />
            </div>

            <div>
              <Label required>Are you comfortable using mobile apps and online platforms?</Label>
              <CoordChipGroup options={COORD_APP_COMFORT_OPTIONS} selected={form.appComfort} onToggle={v => set("appComfort", v)} error={errors.appComfort} />
            </div>
            <div>
              <Label required>Are you comfortable visiting a customer's home when assigned by Tendr?</Label>
              <CoordChipGroup options={COORD_HOME_VISIT_OPTIONS} selected={form.homeVisitComfort} onToggle={v => set("homeVisitComfort", v)} error={errors.homeVisitComfort} />
            </div>
            <div>
              <Label required>Are you comfortable being present at an event when required?</Label>
              <CoordChipGroup options={COORD_EVENT_PRESENCE_OPTIONS} selected={form.eventPresenceComfort} onToggle={v => set("eventPresenceComfort", v)} error={errors.eventPresenceComfort} />
            </div>
            <div>
              <Label required>How late are you comfortable working on event days?</Label>
              <CoordChipGroup options={COORD_LATE_WORK_OPTIONS} selected={form.lateWorkComfort} onToggle={v => set("lateWorkComfort", v)} error={errors.lateWorkComfort} />
            </div>

            <div style={{ height: 1, background: "rgba(28,14,4,0.07)" }} />

            <div>
              <Label required>Create Password</Label>
              <div style={{ position: "relative" }}>
                <input value={form.password}
                  onChange={e => set("password", e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  type={showPw ? "text" : "password"} placeholder="Min 8 characters"
                  style={{ ...iStyle("password"), paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: muted, fontSize: 12, fontFamily: font, fontWeight: 600 }}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <FieldError msg={errors.password} />
            </div>
            <div>
              <Label required>Confirm Password</Label>
              <input value={form.confirmPassword}
                onChange={e => set("confirmPassword", e.target.value)}
                onFocus={() => setFocused("confirmPassword")} onBlur={() => setFocused("")}
                type="password" placeholder="Re-enter password"
                style={iStyle("confirmPassword")} />
              <FieldError msg={errors.confirmPassword} />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "#e5e7eb" : gold, color: loading ? "#9ca3af" : "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(196,122,46,0.3)", transition: "all 0.2s" }}>
              {loading ? "Submitting…" : "Submit Application →"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 16 }}>Free to register · No joining fee</p>
      </div>
    </Shell>
  );
}

// ─── Category-question renderer ───────────────────────────────────────────────

function CategoryQuestions({ serviceType, answers, onChange }) {
  const questions = CATEGORY_QUESTIONS[serviceType] || [];
  if (!questions.length) return null;
  const toggleChip = (id, val) => {
    const cur = answers[id] || [];
    onChange(id, cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 4 }}>
      {questions.map(q => (
        <div key={q.id}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{q.label}</label>
          {q.type === "chips" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {q.options.map(opt => {
                const on = (answers[q.id] || []).includes(opt);
                return (
                  <button key={opt} type="button" onClick={() => toggleChip(q.id, opt)}
                    style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
          {q.type === "radio" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {q.options.map(opt => {
                const on = answers[q.id] === opt;
                return (
                  <button key={opt} type="button" onClick={() => onChange(q.id, opt)}
                    style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
          {q.type === "text" && (
            <input placeholder={q.placeholder || ""} value={answers[q.id] || ""} onChange={e => onChange(q.id, e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(28,14,4,0.14)", background: "#fff", fontFamily: font, fontSize: 13.5, color: ink, outline: "none", boxSizing: "border-box" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Registration component ──────────────────────────────────────────────

export default function VendorRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const flow = searchParams.get("flow"); // "artist" | "vendor" | null
  const token = useSelector(s => s.auth?.token);

  // Listing a service requires a Tendr account first. Bounce straight to login/
  // signup and bring them right back here once they're done — Auth.jsx already
  // honors location.state.returnTo generically — landing on this form's default
  // first step ("what type of service") since no flow= param is added here.
  useEffect(() => {
    if (!token) navigate("/login", { replace: true, state: { returnTo: `${location.pathname}${location.search}` } });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Shared state ──────────────────────────────────────────────────────────

  // Artist flow
  const [performerType, setPerformerType] = useState("");
  const [performerArtForm, setPerformerArtForm] = useState(""); // only for "Performer" (hasArtForm)
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [secondaryCategories, setSecondaryCategories] = useState([]);
  const [artistForm, setArtistForm] = useState({
    name: "", phoneNumber: "", whatsappNumber: "", email: "", city: "",
    password: "", confirmPassword: "",
    bio: "", contentRating: "",
    packages: [{ name: "", price: "", unit: "per event", duration: "", bestFor: "", items: [], performerCount: "", travelCharge: "", overtimeCharge: "", addOns: [], configuration: "" }],
    duration: "", sampleLink: "", instagram: "",
    performanceItems: [{ title: "", note: "" }],
    highlights: [],
    milestones: [],
    notableClients: [],
    awards: [],
    lineup: [],
    hostingResponsibilities: [], audienceSizeExperience: [], capabilityBadges: [],
    audienceParticipation: [], ageSuitability: [], equipmentProvided: [], partyEnergyLevels: [],
    performanceAtmosphere: [],
    songRequestPolicy: { accepted: false, noticeDays: "", extraCharge: "" },
    customMaterialPolicy: { offered: false, infoNeeded: "", prepDays: "" },
    requirements: {
      travel: "", setupTimeMinutes: "", soundSystemProvided: false, stageRequired: false,
      powerRequirement: "", spaceRequirement: "", advanceBookingDays: "", customRequestsNote: "",
      scriptSource: "", rehearsalAvailable: false, outfitArrangement: "",
      micCount: "", lightingRequirement: "", floorRequirement: "", costumeArrangement: "",
    },
  });
  // Photos — first one is the hero/cover photo (same convention as portfolioPhotos[0]
  // everywhere else: VendorDetails.jsx, ArtistListingsPage.jsx, etc.)
  const [artistPhotos, setArtistPhotos] = useState([]); // array of uploaded Cloudinary URLs
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // Vendor flow
  const [plan, setPlan]               = useState("free");
  const [serviceType, setServiceType] = useState("");
  const [vendorForm, setVendorForm]   = useState({
    businessName: "", name: "", phoneNumber: "", whatsappNumber: "", email: "", address: "",
    password: "", confirmPassword: "",
  });
  const [categoryAnswers, setCatAns]  = useState({});

  // Legacy (keeps old coordinator + artist-via-step-1 paths working)
  const [step, setStep]         = useState(flow === "artist" ? "a_type" : flow === "vendor" ? "plan" : 1);
  const [category, setCategory] = useState(flow === "artist" ? "artist" : flow === "vendor" ? "vendor" : "");
  const [artForm, setArtForm]   = useState("");
  const [form, setForm]         = useState({ name: "", phoneNumber: "", whatsappNumber: "", email: "", address: "", serviceType: "" });

  // Scroll to top whenever step changes
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [step]);

  // Shared
  const [loading, setLoading]       = useState(false);
  const [apiError, setApiError]     = useState("");
  const [errors, setErrors]         = useState({});
  const [submitted, setSubmitted]   = useState(false);
  const [successName, setSuccessName] = useState("");
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [focused, setFocused]       = useState("");

  const iStyle = (f) => inputStyle(focused, errors, f, gold, ink);

  // ── Photo upload (artist/performer profile) ────────────────────────────────
  // Uploads straight to Cloudinary via a public endpoint (no account exists yet at
  // application time) and collects the returned URLs — submitted together with the
  // rest of the form, same pattern as the venue-photo gate elsewhere in the app.
  const uploadArtistPhotos = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const remaining = 10 - artistPhotos.length;
    if (remaining <= 0) { setPhotoError("You can upload up to 10 photos."); return; }
    setUploadingPhoto(true); setPhotoError("");
    try {
      const form = new FormData();
      files.slice(0, remaining).forEach(f => form.append("photos", f));
      const res = await fetch(`${BASE_URL}/vendor-applications/upload-photo`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setPhotoError(data.error || "Upload failed — try again."); return; }
      setArtistPhotos(p => [...p, ...(data.urls || [])]);
    } catch {
      setPhotoError("Upload failed — check your connection and try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };
  const removeArtistPhoto = (idx) => setArtistPhotos(p => p.filter((_, i) => i !== idx));
  const makeHeroPhoto = (idx) => setArtistPhotos(p => idx === 0 ? p : [p[idx], ...p.filter((_, i) => i !== idx)]);

  // ── Generic submit helper ──────────────────────────────────────────────────
  const submitApplication = async (payload) => {
    setLoading(true); setApiError("");
    try {
      const res = await fetch(`${BASE_URL}/vendor-applications`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setApiError(data.message || "Application already exists.");
        else if (data.errors) {
          const mapped = {};
          data.errors.forEach(er => { mapped[er.param || er.path] = er.msg; });
          setErrors(mapped);
        } else setApiError(data.message || "Submission failed. Please try again.");
        return false;
      }
      return true;
    } catch {
      setApiError("Network error. Please check your connection and try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (!token) return null; // redirecting to /login, see effect above

  if (submitted) return <SuccessScreen name={successName} isCoordinator={isCoordinator} navigate={navigate} />;

  // ── COORDINATOR FLOW (legacy) ──────────────────────────────────────────────
  if (category === "coordinator") {
    return (
      <CoordinatorForm
        onBack={() => { setCategory(""); setStep(1); }}
        onSuccess={(name) => { setSuccessName(name); setIsCoordinator(true); setSubmitted(true); }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  ARTIST / PERFORMER FLOW
  // ══════════════════════════════════════════════════════════════════

  // Step a_type — Pick performer type
  if (step === "a_type") {
    return (
      <Shell step={1} steps={["Type", "Plan", "Profile"]}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Artist / Performer</p>
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, color: ink, margin: "0 0 8px", lineHeight: 1.2 }}>What type of performer are you?</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>Your profile will be tailored to match your style.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {PERFORMER_CATEGORIES.map(t => (
            <button key={t.value} type="button"
              onClick={() => {
                setPerformerType(t.value); setGenres([]); setLanguages([]); setPerformerArtForm("");
                setStep(t.hasArtForm ? "a_artform" : "a_plan");
              }}
              style={{ padding: "20px 16px", borderRadius: 14, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)", display: "flex", flexDirection: "column", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(196,122,46,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}
            >
              <span style={{ fontSize: 28 }}>{t.emoji}</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{t.label}</div>
              <div style={{ fontSize: 11, color: muted, lineHeight: 1.5 }}>{t.sub}</div>
            </button>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: muted, marginTop: 24 }}>
          Already listed? <span onClick={() => navigate("/vendor/login")} style={{ color: gold, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
        </p>
      </Shell>
    );
  }

  // Step a_artform — Performer's specialty art form (only shown for "Performer")
  if (step === "a_artform") {
    return (
      <Shell step={1} steps={["Type", "Plan", "Profile"]}>
        <button type="button" onClick={() => setStep("a_type")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Solo Performer</p>
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, color: ink, margin: "0 0 8px", lineHeight: 1.2 }}>What's your specialty?</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>This decides what we ask you about next.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {PERFORMER_ART_FORMS.map(t => (
            <button key={t.value} type="button"
              onClick={() => { setPerformerArtForm(t.value); setStep("a_plan"); }}
              style={{ padding: "20px 16px", borderRadius: 14, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)", display: "flex", flexDirection: "column", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(196,122,46,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}
            >
              <span style={{ fontSize: 28 }}>{t.emoji}</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{t.label}</div>
              <div style={{ fontSize: 11, color: muted, lineHeight: 1.5 }}>{t.sub}</div>
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  // Step a_plan — Artist free / paid choice
  if (step === "a_plan") {
    return (
      <Shell step={2} steps={["Type", "Plan", "Profile"]} sideTiers>
        <button type="button" onClick={() => setStep(performerType === "Performer" ? "a_artform" : "a_type")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Choose your plan</p>
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, color: ink, margin: "0 0 8px", lineHeight: 1.2 }}>Start free, upgrade anytime</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>No card needed. Switch plans whenever you are ready.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button type="button" onClick={() => { setPlan("free"); setStep("a_profile"); }}
            style={{ padding: "22px 20px", borderRadius: 16, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(196,122,46,0.65)", marginBottom: 4 }}>Free listing</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>₹0 <span style={{ fontSize: 13, fontWeight: 500, color: muted }}>forever</span></div>
              </div>
            </div>
            {FREE_FEATS.map(f => <div key={f} style={{ fontSize: 12.5, color: muted, display: "flex", gap: 8, marginBottom: 4 }}><span style={{ color: gold, flexShrink: 0 }}>✓</span>{f}</div>)}
            <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(196,122,46,0.07)", fontSize: 12, color: "#7a4d1b", fontWeight: 600 }}>15% commission only on Tendr bookings</div>
          </button>

          <button type="button" onClick={() => { setPlan("paid"); setStep("a_features"); }}
            style={{ padding: "22px 20px", borderRadius: 16, border: `1.5px solid ${gold}`, background: "rgba(196,122,46,0.03)", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)", position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}>
            <div style={{ position: "absolute", top: -1, right: 16, background: gold, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: "0 0 8px 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>7-day free trial</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 4 }}>Listing + Dashboard</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>₹399 <span style={{ fontSize: 13, fontWeight: 500, color: muted }}>+ GST / month</span></div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>after trial · no card needed to start</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Everything in Free, plus:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
              {PAID_FEATS.map(f => <div key={f} style={{ fontSize: 12, color: muted, display: "flex", gap: 6, marginBottom: 2 }}><span style={{ color: gold, flexShrink: 0 }}>✓</span>{f}</div>)}
            </div>
            <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(196,122,46,0.07)", fontSize: 12, color: "#7a4d1b", fontWeight: 600 }}>0% commission on bookings made outside Tendr</div>
            <div style={{ marginTop: 10, color: gold, fontSize: 12, fontWeight: 700 }}>See everything you get →</div>
          </button>
        </div>
      </Shell>
    );
  }

  // Step a_features — Paid plan full feature breakdown (artist)
  if (step === "a_features") {
    const featureSections = [
      { title: "Profile & Discovery", items: ["Full artist profile with photos & videos", "Appear in Tendr search & category pages", "SEO-optimised public listing page", "Verified badge after approval"] },
      { title: "Business Tools", items: ["Bookings & availability calendar", "Client enquiries & lead management", "Custom quotes & invoicing", "Contract templates", "Payment tracking (Tendr + outside)"] },
      { title: "Growth", items: ["Analytics: views, clicks, enquiries", "Review & rating collection", "Flyer builder & shareable link", "Smart reminders for follow-ups", "Referral program access"] },
      { title: "Support", items: ["Priority WhatsApp support", "Onboarding call with Tendr team", "Hindi & English support", "Business insights & monthly report"] },
    ];
    return (
      <Shell step={2} steps={["Type", "Plan", "Profile"]} sideTiers>
        <button type="button" onClick={() => setStep("a_plan")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 20, padding: 0 }}>
          ← Back
        </button>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 6 }}>Dashboard Plan — ₹399/month</p>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 6px" }}>Everything you need to grow</h1>
          <p style={{ fontSize: 13.5, color: muted, margin: 0 }}>7 days free. No card needed. Cancel anytime.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
          {featureSections.map((s, idx) => {
            const icons = ["🔍", "🛠", "📈", "💬"];
            return (
              <div key={s.title} style={{ background: "#fff", borderRadius: 13, padding: "14px 15px", border: "1.5px solid rgba(196,122,46,0.14)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}>
                  <span style={{ fontSize: 14 }}>{icons[idx]}</span>
                  <p style={{ fontSize: 10, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{s.title}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {s.items.map(item => (
                    <div key={item} style={{ fontSize: 11.5, color: muted, display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ color: gold, flexShrink: 0, lineHeight: 1.6 }}>✓</span>
                      <span style={{ lineHeight: 1.45 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={() => setStep("a_profile")}
          style={{ width: "100%", padding: "14px", borderRadius: 12, background: `linear-gradient(135deg,${gold},#CCAB4A)`, color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
          Continue with Dashboard Plan →
        </button>
        <button type="button" onClick={() => { setPlan("free"); setStep("a_profile"); }}
          style={{ width: "100%", marginTop: 10, padding: "12px", borderRadius: 12, background: "none", color: muted, border: "1.5px solid rgba(28,14,4,0.14)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
          No thanks, continue with Free listing
        </button>
      </Shell>
    );
  }

  // Step a_profile — Artist profile form
  if (step === "a_profile") {
    const typeInfo = PERFORMER_CATEGORIES.find(t => t.value === performerType) || {};
    // Singer/Band/Musician get a real musical-genre list and submit as `genres`;
    // every other category (DJ, Anchor, Emcee/Host, Choreographer, Performer,
    // Stand-up Comedian, Magician) uses its GIG_STYLE_OPTIONS "performing style"
    // list instead and submits as `performingStyle` — these used to both get
    // submitted as `genres` regardless, which showed a Magician's "Close-up
    // Magic" chips mislabelled "Music Genres" on the public profile.
    const hasGenreList = (ARTIST_GENRES[performerType]?.length || 0) > 0;
    const genreOptions = hasGenreList ? ARTIST_GENRES[performerType] : (GIG_STYLE_OPTIONS[performerType] || []);
    const genreFieldLabel = hasGenreList ? "Genres / Specializations" : "Performing Style";
    const toggleGenre = (g) => setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
    const toggleLanguage = (l) => setLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
    const toggleSecondaryCategory = (c) => setSecondaryCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : (prev.length >= 2 ? prev : [...prev, c]));
    const showLanguages = GIG_LANGUAGE_CATEGORIES.includes(performerType);
    const showContentRating = performerType === "Stand-up Comedian";

    // Generic helpers for the repeatable-row sections below (highlights,
    // milestones, lineup) — same object-per-row pattern as performanceItems,
    // so what the vendor types always lands in the right structured shape.
    const setArtRow = (field, i, key, val) => setArtistForm(p => ({ ...p, [field]: p[field].map((row, j) => j === i ? { ...row, [key]: val } : row) }));
    const addArtRow = (field, blank, max) => setArtistForm(p => p[field].length >= max ? p : ({ ...p, [field]: [...p[field], blank] }));
    const removeArtRow = (field, i) => setArtistForm(p => ({ ...p, [field]: p[field].filter((_, j) => j !== i) }));
    const setArtStr = (field, i, val) => setArtistForm(p => ({ ...p, [field]: p[field].map((s, j) => j === i ? val : s) }));
    const addArtStr = (field, max) => setArtistForm(p => p[field].length >= max ? p : ({ ...p, [field]: [...p[field], ""] }));
    const removeArtStr = (field, i) => setArtistForm(p => ({ ...p, [field]: p[field].filter((_, j) => j !== i) }));
    // Generic chip toggle for plain [String] fields on artistForm (hostingResponsibilities,
    // audienceSizeExperience, capabilityBadges, audienceParticipation, ageSuitability,
    // equipmentProvided, partyEnergyLevels, performanceAtmosphere).
    const toggleArtChip = (field, val) => setArtistForm(p => ({ ...p, [field]: p[field].includes(val) ? p[field].filter(x => x !== val) : [...p[field], val] }));
    const setArtReq = (key, val) => setArtistForm(p => ({ ...p, requirements: { ...p.requirements, [key]: val } }));

    const perfLabel = performanceLabel(performerType);
    const perfHints = performanceFieldHints(performerType);
    const quickItems = QUICK_PERFORMANCE_ITEMS[performerType] || [];

    const handleArtistSubmit = async (e) => {
      e.preventDefault();
      const er = {};
      if (!artistForm.name.trim())         er.name = "Name is required";
      if (!/^[6-9]\d{9}$/.test(artistForm.phoneNumber))   er.phoneNumber = "Enter a valid 10-digit number";
      if (!/^[6-9]\d{9}$/.test(artistForm.whatsappNumber)) er.whatsappNumber = "Enter a valid 10-digit number";
      if (!artistForm.city)                er.city = "City is required";
      if (artistForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(artistForm.email)) er.email = "Enter a valid email";
      if (artistForm.password.length < 8)  er.password = "Password must be at least 8 characters";
      if (artistForm.confirmPassword !== artistForm.password) er.confirmPassword = "Passwords don't match";
      if (Object.keys(er).length) { setErrors(er); return; }

      const ok = await submitApplication({
        name: artistForm.name.trim(),
        phoneNumber: artistForm.phoneNumber,
        whatsappNumber: artistForm.whatsappNumber,
        email: artistForm.email || "",
        address: artistForm.city,
        password: artistForm.password,
        serviceType: performerType,
        performerArtForm: performerArtForm || "",
        isArtist: true,
        genres: hasGenreList ? genres : [],
        performingStyle: hasGenreList ? [] : genres,
        languages: showLanguages ? languages : [],
        contentRating: showContentRating ? artistForm.contentRating : "",
        secondaryCategories,
        bio: artistForm.bio,
        packages: artistForm.packages
          .filter(p => p.name.trim() || p.price.trim())
          .map(p => ({
            name: p.name.trim(), price: p.price.trim(), unit: p.unit || "per event",
            duration: p.duration || "", bestFor: p.bestFor || "",
            items: (p.items || []).map(s => s.trim()).filter(Boolean),
            performerCount: p.performerCount || undefined,
            travelCharge: p.travelCharge || "", overtimeCharge: p.overtimeCharge || "",
            addOns: (p.addOns || []).map(s => s.trim()).filter(Boolean),
            configuration: p.configuration || "",
          })),
        hostingResponsibilities: artistForm.hostingResponsibilities,
        audienceSizeExperience: artistForm.audienceSizeExperience,
        capabilityBadges: artistForm.capabilityBadges,
        audienceParticipation: artistForm.audienceParticipation,
        ageSuitability: artistForm.ageSuitability,
        equipmentProvided: artistForm.equipmentProvided,
        partyEnergyLevels: artistForm.partyEnergyLevels,
        performanceAtmosphere: artistForm.performanceAtmosphere,
        songRequestPolicy: artistForm.songRequestPolicy,
        customMaterialPolicy: artistForm.customMaterialPolicy,
        requirements: artistForm.requirements,
        duration: artistForm.duration,
        sampleLink: artistForm.sampleLink,
        instagram: artistForm.instagram,
        performanceItems: artistForm.performanceItems
          .filter(it => it.title.trim())
          .map(it => ({ title: it.title.trim(), note: it.note.trim() })),
        highlights: artistForm.highlights
          .filter(h => h.label.trim())
          .map(h => ({ label: h.label.trim(), desc: (h.desc || "").trim() })),
        milestones: artistForm.milestones
          .filter(m => m.year.trim() && m.text.trim())
          .map(m => ({ year: m.year.trim(), text: m.text.trim() })),
        notableClients: artistForm.notableClients.map(s => s.trim()).filter(Boolean),
        awards: artistForm.awards.map(s => s.trim()).filter(Boolean),
        lineup: performerType === "Band"
          ? artistForm.lineup.filter(m => m.name.trim()).map(m => ({ name: m.name.trim(), role: (m.role || "").trim() }))
          : [],
        photos: artistPhotos,
      });
      if (ok) { setSuccessName(artistForm.name); setSubmitted(true); }
    };

    const aInput = (f, label, req, opts = {}) => (
      <div>
        <Label required={req} optional={!req}>{label}</Label>
        <input
          value={artistForm[f]} onChange={e => { setArtistForm(p => ({...p, [f]: e.target.value})); if (errors[f]) setErrors(p => ({...p, [f]: ""})); }}
          onFocus={() => setFocused(f)} onBlur={() => setFocused("")}
          style={inputStyle(focused, errors, f, gold, ink)} {...opts}
        />
        <FieldError msg={errors[f]} />
      </div>
    );

    return (
      <Shell step={3} steps={["Type", "Plan", "Profile"]}>
        <button type="button" onClick={() => setStep("a_plan")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 20, padding: 0 }}>
          ← Back
        </button>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 6 }}>{typeInfo.emoji} {typeInfo.label}</p>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 6px" }}>Build your artist profile</h1>
          <p style={{ fontSize: 13.5, color: muted, margin: 0 }}>This is what customers see when they browse performers. Be specific — it helps you get booked.</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 2px 12px rgba(28,14,4,0.05)" }}>
          {apiError && <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>}

          <form onSubmit={handleArtistSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Contact */}
            <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Contact Details</p>

            {aInput("name", "Artist / Band Name", true, { placeholder: "e.g. Aarav Vocals or The Harmony Band" })}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label required>Phone</Label>
                <input value={artistForm.phoneNumber} onChange={e => setArtistForm(p => ({...p, phoneNumber: e.target.value.replace(/\D/,"").slice(0,10)}))}
                  onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")} inputMode="numeric" placeholder="10-digit number"
                  style={inputStyle(focused, errors, "phoneNumber", gold, ink)} />
                <FieldError msg={errors.phoneNumber} />
              </div>
              <div>
                <Label required>WhatsApp</Label>
                <input value={artistForm.whatsappNumber} onChange={e => setArtistForm(p => ({...p, whatsappNumber: e.target.value.replace(/\D/,"").slice(0,10)}))}
                  onFocus={() => setFocused("whatsappNumber")} onBlur={() => setFocused("")} inputMode="numeric" placeholder="10-digit number"
                  style={inputStyle(focused, errors, "whatsappNumber", gold, ink)} />
                <FieldError msg={errors.whatsappNumber} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {aInput("password", "Password", true, { type: "password", placeholder: "At least 8 characters" })}
              {aInput("confirmPassword", "Confirm Password", true, { type: "password", placeholder: "Re-enter password" })}
            </div>
            <p style={{ fontSize: 11.5, color: muted, margin: "-10px 0 0" }}>You'll use this to sign in to your dashboard once approved.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {aInput("email", "Email", false, { type: "email", placeholder: "you@email.com" })}
              <div>
                <Label required>City</Label>
                <select value={artistForm.city} onChange={e => { setArtistForm(p => ({...p, city: e.target.value})); if (errors.city) setErrors(p => ({...p, city: ""})); }}
                  onFocus={() => setFocused("city")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle(focused, errors, "city", gold, ink), cursor: "pointer" }}>
                  <option value="">Select city</option>
                  {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <FieldError msg={errors.city} />
              </div>
            </div>

            {/* Profile */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0 4px" }}>Your Profile (Shown to customers)</p>
              <p style={{ fontSize: 12, color: muted, margin: 0 }}>Fill in what you can now — everything below is optional, and you can add or edit any of it later by signing into your dashboard.</p>
            </div>

            {/* Also Perform As — secondary categories */}
            <div>
              <Label optional>Also Perform As <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(up to 2 — e.g. a Singer who's also a Musician gets both sections on their profile)</span></Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {PERFORMER_CATEGORIES.filter(c => c.value !== performerType).map(c => {
                  const on = secondaryCategories.includes(c.value);
                  return (
                    <button key={c.value} type="button" onClick={() => toggleSecondaryCategory(c.value)}
                      disabled={!on && secondaryCategories.length >= 2}
                      style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s", opacity: (!on && secondaryCategories.length >= 2) ? 0.4 : 1 }}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photos — first one is the hero/cover photo shown on your listing card */}
            <div>
              <Label optional>Photos <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(first photo is your cover photo — up to 10)</span></Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: 8, marginTop: 4 }}>
                {artistPhotos.map((url, i) => (
                  <div key={url} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 10, overflow: "hidden", border: i === 0 ? `2px solid ${gold}` : "1.5px solid #E5D5C0" }}>
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    {i === 0 ? (
                      <span style={{ position: "absolute", bottom: 4, left: 4, right: 4, background: gold, color: "#fff", fontSize: 9, fontWeight: 800, textAlign: "center", borderRadius: 100, padding: "2px 0", letterSpacing: "0.04em" }}>COVER</span>
                    ) : (
                      <button type="button" onClick={() => makeHeroPhoto(i)}
                        style={{ position: "absolute", bottom: 4, left: 4, right: 4, background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", fontSize: 9, fontWeight: 700, borderRadius: 100, padding: "2px 0", cursor: "pointer", fontFamily: font }}>
                        Make cover
                      </button>
                    )}
                    <button type="button" onClick={() => removeArtistPhoto(i)} aria-label="Remove photo"
                      style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", fontSize: 12, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                ))}
                {artistPhotos.length < 10 && (
                  <label style={{ aspectRatio: "1/1", borderRadius: 10, border: "1.5px dashed rgba(196,122,46,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: uploadingPhoto ? "default" : "pointer", color: gold, fontSize: 11, fontWeight: 600, fontFamily: font, textAlign: "center", padding: 6 }}>
                    <span style={{ fontSize: 20 }}>{uploadingPhoto ? "…" : "+"}</span>
                    {uploadingPhoto ? "Uploading" : "Add photo"}
                    <input type="file" accept="image/*" multiple disabled={uploadingPhoto} style={{ display: "none" }}
                      onChange={e => { uploadArtistPhotos(e.target.files); e.target.value = ""; }} />
                  </label>
                )}
              </div>
              {photoError && <p style={{ fontSize: 11.5, color: "#c0392b", marginTop: 6 }}>{photoError}</p>}
            </div>

            {genreOptions.length > 0 && (
              <div>
                <Label optional>{genreFieldLabel}</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {genreOptions.map(g => {
                    const on = genres.includes(g);
                    return (
                      <button key={g} type="button" onClick={() => toggleGenre(g)}
                        style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s" }}>
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showLanguages && (
              <div>
                <Label optional>Languages</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {GIG_LANG_OPTIONS.map(l => {
                    const on = languages.includes(l);
                    return (
                      <button key={l} type="button" onClick={() => toggleLanguage(l)}
                        style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s" }}>
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showContentRating && (
              <div>
                <Label optional>Content Rating <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(shown prominently so customers know what to expect)</span></Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {CONTENT_RATING_OPTIONS.map(r => {
                    const on = artistForm.contentRating === r;
                    return (
                      <button key={r} type="button" onClick={() => setArtistForm(p => ({ ...p, contentRating: on ? "" : r }))}
                        style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s" }}>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <Label optional>Performance Duration</Label>
              <select value={artistForm.duration} onChange={e => setArtistForm(p => ({...p, duration: e.target.value}))}
                style={{ ...inputStyle(focused, errors, "duration", gold, ink), cursor: "pointer" }}>
                <option value="">Select</option>
                {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Packages — structured fields, not a free-text description, so the public
                profile's Packages tab (price + duration + what's included) renders correctly
                without the vendor having to format anything themselves. */}
            <div>
              <Label optional>Packages <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(up to 3 — add more later from your dashboard)</span></Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {artistForm.packages.map((pkg, i) => (
                  <div key={i} style={{ border: "1.5px solid #E5D5C0", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center" }}>
                      <input
                        value={pkg.name}
                        onChange={e => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, name: e.target.value } : x) }))}
                        placeholder={["Basic", "Standard", "Premium"][i] || "Package name"}
                        style={inputStyle(focused, {}, "", gold, ink)}
                      />
                      <input
                        value={pkg.price}
                        onChange={e => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, price: e.target.value } : x) }))}
                        placeholder="e.g. 15000"
                        style={inputStyle(focused, {}, "", gold, ink)}
                      />
                      {i > 0 ? (
                        <button type="button" onClick={() => setArtistForm(p => ({ ...p, packages: p.packages.filter((_, j) => j !== i) }))}
                          style={{ height: 42, width: 36, background: "none", border: "1.5px solid #fca5a5", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
                      ) : <div style={{ width: 36 }} />}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <select value={pkg.unit} onChange={e => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, unit: e.target.value } : x) }))}
                        style={{ ...inputStyle(focused, {}, "", gold, ink), cursor: "pointer" }}>
                        <option value="per event">per event</option>
                        <option value="per hour">per hour</option>
                        <option value="per day">per day</option>
                      </select>
                      <input
                        value={pkg.duration}
                        onChange={e => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, duration: e.target.value } : x) }))}
                        placeholder="e.g. 60 minutes"
                        style={inputStyle(focused, {}, "", gold, ink)}
                      />
                      <input
                        value={pkg.bestFor}
                        onChange={e => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, bestFor: e.target.value } : x) }))}
                        placeholder="Best for… e.g. birthdays"
                        style={inputStyle(focused, {}, "", gold, ink)}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <Label optional>What's included</Label>
                      {(pkg.items || []).map((item, k) => (
                        <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                          <input
                            value={item} maxLength={60}
                            onChange={e => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, items: x.items.map((it, m) => m === k ? e.target.value : it) } : x) }))}
                            placeholder="e.g. 1 hour live performance"
                            style={inputStyle(focused, {}, "", gold, ink)}
                          />
                          <button type="button" onClick={() => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, items: x.items.filter((_, m) => m !== k) } : x) }))}
                            style={{ height: 42, width: 36, background: "none", border: "1.5px solid #fca5a5", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
                        </div>
                      ))}
                      {(pkg.items || []).length < 6 && (
                        <button type="button" onClick={() => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, items: [...(x.items || []), ""] } : x) }))}
                          style={{ padding: "7px", borderRadius: 8, border: `1.5px dashed rgba(196,122,46,0.45)`, background: "transparent", color: gold, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                          + Add item
                        </button>
                      )}
                    </div>
                    {/* Price-relevant terms — kept as real fields instead of more
                        freeform text in "What's included" */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <input value={pkg.performerCount} type="number" min="1"
                        onChange={e => setArtRow("packages", i, "performerCount", e.target.value)}
                        placeholder="# performers" style={inputStyle(focused, {}, "", gold, ink)} />
                      <input value={pkg.travelCharge}
                        onChange={e => setArtRow("packages", i, "travelCharge", e.target.value)}
                        placeholder="Travel charge" style={inputStyle(focused, {}, "", gold, ink)} />
                      <input value={pkg.overtimeCharge}
                        onChange={e => setArtRow("packages", i, "overtimeCharge", e.target.value)}
                        placeholder="Overtime charge" style={inputStyle(focused, {}, "", gold, ink)} />
                    </div>
                    <input value={pkg.configuration}
                      onChange={e => setArtRow("packages", i, "configuration", e.target.value)}
                      placeholder="Configuration — e.g. Solo, Full Band, Stage Show (optional)"
                      style={{ ...inputStyle(focused, {}, "", gold, ink), marginTop: 8 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                      <Label optional>Optional add-ons <span style={{ fontSize: 10, fontWeight: 400, color: muted }}>(not included by default)</span></Label>
                      {(pkg.addOns || []).map((a, k) => (
                        <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                          <input value={a} maxLength={60}
                            onChange={e => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, addOns: x.addOns.map((it, m) => m === k ? e.target.value : it) } : x) }))}
                            placeholder="e.g. Extra hour of performance — ₹3,000"
                            style={inputStyle(focused, {}, "", gold, ink)} />
                          <button type="button" onClick={() => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, addOns: x.addOns.filter((_, m) => m !== k) } : x) }))}
                            style={{ height: 42, width: 36, background: "none", border: "1.5px solid #fca5a5", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
                        </div>
                      ))}
                      {(pkg.addOns || []).length < 6 && (
                        <button type="button" onClick={() => setArtistForm(p => ({ ...p, packages: p.packages.map((x, j) => j === i ? { ...x, addOns: [...(x.addOns || []), ""] } : x) }))}
                          style={{ padding: "7px", borderRadius: 8, border: `1.5px dashed rgba(196,122,46,0.45)`, background: "transparent", color: gold, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                          + Add add-on
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {artistForm.packages.length < 3 && (
                  <button type="button" onClick={() => setArtistForm(p => ({ ...p, packages: [...p.packages, { name: "", price: "", unit: "per event", duration: "", bestFor: "", items: [], performerCount: "", travelCharge: "", overtimeCharge: "", addOns: [], configuration: "" }] }))}
                    style={{ padding: "9px", borderRadius: 8, border: `1.5px dashed rgba(196,122,46,0.45)`, background: "transparent", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                    + Add Package
                  </button>
                )}
              </div>
            </div>

            {performerType === "Band" && (
              <div>
                <Label optional>Meet the Band <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(shown on your profile's About tab)</span></Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {artistForm.lineup.map((m, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                      <input value={m.name} onChange={e => setArtRow("lineup", i, "name", e.target.value)}
                        placeholder="Member name" style={inputStyle(focused, {}, "", gold, ink)} />
                      <input value={m.role} onChange={e => setArtRow("lineup", i, "role", e.target.value)}
                        placeholder="Role — e.g. Lead Vocalist" style={inputStyle(focused, {}, "", gold, ink)} />
                      <button type="button" onClick={() => removeArtRow("lineup", i)}
                        style={{ height: 42, width: 36, background: "none", border: "1.5px solid #fca5a5", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
                    </div>
                  ))}
                  {artistForm.lineup.length < 12 && (
                    <button type="button" onClick={() => addArtRow("lineup", { name: "", role: "" }, 12)}
                      style={{ padding: "9px", borderRadius: 8, border: `1.5px dashed rgba(196,122,46,0.45)`, background: "transparent", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                      + Add member
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Category-specific chip sections — everything here is optional; skip
                any of it now and fill it in later from your dashboard. */}
            {(() => {
              const chipRow = (label, field, options) => (
                <div key={field}>
                  <Label optional>{label}</Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {options.map(opt => {
                      const on = artistForm[field].includes(opt);
                      return (
                        <button key={opt} type="button" onClick={() => toggleArtChip(field, opt)}
                          style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s" }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
              return (
                <>
                  {['Emcee/Host', 'Anchor'].includes(performerType) && (<>
                    {chipRow("Hosting Responsibilities", "hostingResponsibilities", HOSTING_RESPONSIBILITY_OPTIONS)}
                    {chipRow("Audience Size Experience", "audienceSizeExperience", AUDIENCE_SIZE_OPTIONS)}
                  </>)}
                  {performerType === 'Anchor' && chipRow("Capabilities", "capabilityBadges", CAPABILITY_BADGE_OPTIONS)}
                  {performerType === 'Magician' && (<>
                    {chipRow("Audience Participation", "audienceParticipation", AUDIENCE_PARTICIPATION_OPTIONS)}
                    {chipRow("Age Suitability", "ageSuitability", AGE_SUITABILITY_OPTIONS)}
                  </>)}
                  {performerType === 'DJ' && (<>
                    {chipRow("Equipment Provided", "equipmentProvided", EQUIPMENT_PROVIDED_OPTIONS)}
                    {chipRow("Party Energy Levels", "partyEnergyLevels", PARTY_ENERGY_OPTIONS)}
                  </>)}
                  {performerType === 'Musician' && chipRow("Performance Atmosphere", "performanceAtmosphere", PERFORMANCE_ATMOSPHERE_OPTIONS)}
                </>
              );
            })()}

            {SONG_REQUEST_CATEGORIES.includes(performerType) && (
              <div>
                <Label optional>Song Requests</Label>
                <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 8 }}>
                  {['Yes', 'No'].map(opt => {
                    const val = opt === 'Yes';
                    const on = artistForm.songRequestPolicy.accepted === val;
                    return (
                      <button key={opt} type="button" onClick={() => setArtistForm(p => ({ ...p, songRequestPolicy: { ...p.songRequestPolicy, accepted: val } }))}
                        style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted }}>
                        {opt === 'Yes' ? 'I take requests' : "I don't take requests"}
                      </button>
                    );
                  })}
                </div>
                {artistForm.songRequestPolicy.accepted && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input type="number" min="0" value={artistForm.songRequestPolicy.noticeDays}
                      onChange={e => setArtistForm(p => ({ ...p, songRequestPolicy: { ...p.songRequestPolicy, noticeDays: e.target.value } }))}
                      placeholder="Notice period (days)" style={inputStyle(focused, {}, "", gold, ink)} />
                    <input value={artistForm.songRequestPolicy.extraCharge}
                      onChange={e => setArtistForm(p => ({ ...p, songRequestPolicy: { ...p.songRequestPolicy, extraCharge: e.target.value } }))}
                      placeholder="Extra charge, if any" style={inputStyle(focused, {}, "", gold, ink)} />
                  </div>
                )}
              </div>
            )}

            {CUSTOM_MATERIAL_CATEGORIES.includes(performerType) && (
              <div>
                <Label optional>Custom Material <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(personalised jokes, custom openings, brand-specific bits)</span></Label>
                <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 8 }}>
                  {['Yes', 'No'].map(opt => {
                    const val = opt === 'Yes';
                    const on = artistForm.customMaterialPolicy.offered === val;
                    return (
                      <button key={opt} type="button" onClick={() => setArtistForm(p => ({ ...p, customMaterialPolicy: { ...p.customMaterialPolicy, offered: val } }))}
                        style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted }}>
                        {opt === 'Yes' ? 'I offer custom material' : "I don't offer custom material"}
                      </button>
                    );
                  })}
                </div>
                {artistForm.customMaterialPolicy.offered && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input value={artistForm.customMaterialPolicy.infoNeeded}
                      onChange={e => setArtistForm(p => ({ ...p, customMaterialPolicy: { ...p.customMaterialPolicy, infoNeeded: e.target.value } }))}
                      placeholder="Info needed — e.g. name, event details" style={inputStyle(focused, {}, "", gold, ink)} />
                    <input type="number" min="0" value={artistForm.customMaterialPolicy.prepDays}
                      onChange={e => setArtistForm(p => ({ ...p, customMaterialPolicy: { ...p.customMaterialPolicy, prepDays: e.target.value } }))}
                      placeholder="Prep time needed (days)" style={inputStyle(focused, {}, "", gold, ink)} />
                  </div>
                )}
              </div>
            )}

            {/* Booking Requirements — compact checklist, shown in your profile's
                sidebar. Entirely optional, same as everything else here. */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0 4px" }}>Booking Requirements</p>
              <p style={{ fontSize: 12, color: muted, margin: "0 0 10px" }}>What you need from the venue/customer — optional, you can add or edit this later from your dashboard too.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input value={artistForm.requirements.travel} onChange={e => setArtReq("travel", e.target.value)}
                placeholder="Travel — e.g. Delhi NCR; outstation by arrangement" style={inputStyle(focused, {}, "", gold, ink)} />
              <input type="number" min="0" value={artistForm.requirements.setupTimeMinutes} onChange={e => setArtReq("setupTimeMinutes", e.target.value)}
                placeholder="Setup time needed (minutes)" style={inputStyle(focused, {}, "", gold, ink)} />
              <input value={artistForm.requirements.powerRequirement} onChange={e => setArtReq("powerRequirement", e.target.value)}
                placeholder="Power requirement" style={inputStyle(focused, {}, "", gold, ink)} />
              <input value={artistForm.requirements.spaceRequirement} onChange={e => setArtReq("spaceRequirement", e.target.value)}
                placeholder="Space needed" style={inputStyle(focused, {}, "", gold, ink)} />
              <input type="number" min="0" value={artistForm.requirements.advanceBookingDays} onChange={e => setArtReq("advanceBookingDays", e.target.value)}
                placeholder="Advance booking notice (days)" style={inputStyle(focused, {}, "", gold, ink)} />
              {REQUIREMENT_FIELD_CATEGORIES.micCount.includes(performerType) && (
                <input type="number" min="0" value={artistForm.requirements.micCount} onChange={e => setArtReq("micCount", e.target.value)}
                  placeholder="Microphones needed" style={inputStyle(focused, {}, "", gold, ink)} />
              )}
              {REQUIREMENT_FIELD_CATEGORIES.lightingRequirement.includes(performerType) && (
                <input value={artistForm.requirements.lightingRequirement} onChange={e => setArtReq("lightingRequirement", e.target.value)}
                  placeholder="Lighting requirement" style={inputStyle(focused, {}, "", gold, ink)} />
              )}
              {REQUIREMENT_FIELD_CATEGORIES.floorRequirement.includes(performerType) && (
                <input value={artistForm.requirements.floorRequirement} onChange={e => setArtReq("floorRequirement", e.target.value)}
                  placeholder="Floor requirement" style={inputStyle(focused, {}, "", gold, ink)} />
              )}
              {REQUIREMENT_FIELD_CATEGORIES.costumeArrangement.includes(performerType) && (
                <input value={artistForm.requirements.costumeArrangement} onChange={e => setArtReq("costumeArrangement", e.target.value)}
                  placeholder="Costume arrangement" style={inputStyle(focused, {}, "", gold, ink)} />
              )}
              {REQUIREMENT_FIELD_CATEGORIES.outfitArrangement.includes(performerType) && (
                <input value={artistForm.requirements.outfitArrangement} onChange={e => setArtReq("outfitArrangement", e.target.value)}
                  placeholder="Outfit / dress-code arrangement" style={inputStyle(focused, {}, "", gold, ink)} />
              )}
            </div>
            {REQUIREMENT_FIELD_CATEGORIES.scriptSource.includes(performerType) && (
              <div>
                <Label optional>Script Source</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {SCRIPT_SOURCE_OPTIONS.map(opt => (
                    <button key={opt} type="button" onClick={() => setArtReq("scriptSource", artistForm.requirements.scriptSource === opt ? "" : opt)}
                      style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: artistForm.requirements.scriptSource === opt ? "none" : "1.5px solid #E5D5C0", background: artistForm.requirements.scriptSource === opt ? gold : "#F9F6F1", color: artistForm.requirements.scriptSource === opt ? "#fff" : muted }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: muted, fontWeight: 500 }}>
                <input type="checkbox" checked={artistForm.requirements.soundSystemProvided} onChange={e => setArtReq("soundSystemProvided", e.target.checked)} style={{ width: 16, height: 16 }} />
                I provide my own sound system
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: muted, fontWeight: 500 }}>
                <input type="checkbox" checked={artistForm.requirements.stageRequired} onChange={e => setArtReq("stageRequired", e.target.checked)} style={{ width: 16, height: 16 }} />
                I need a stage / performance area
              </label>
              {REQUIREMENT_FIELD_CATEGORIES.rehearsalAvailable.includes(performerType) && (
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: muted, fontWeight: 500 }}>
                  <input type="checkbox" checked={artistForm.requirements.rehearsalAvailable} onChange={e => setArtReq("rehearsalAvailable", e.target.checked)} style={{ width: 16, height: 16 }} />
                  Rehearsal availability
                </label>
              )}
            </div>
            <div>
              <Label optional>Custom Requests Note</Label>
              <textarea value={artistForm.requirements.customRequestsNote} onChange={e => setArtReq("customRequestsNote", e.target.value)} rows={2}
                placeholder="e.g. Happy to learn a custom song with 2 weeks' notice"
                style={{ ...inputStyle(focused, {}, "", gold, ink), resize: "vertical" }} />
            </div>

            <div>
              <Label optional>About You <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(shown on your profile)</span></Label>
              <textarea value={artistForm.bio} onChange={e => setArtistForm(p => ({...p, bio: e.target.value}))} rows={3} maxLength={300}
                placeholder={`Tell clients about your ${typeInfo.label?.toLowerCase()} style, experience, and what makes your performances special...`}
                style={{ ...inputStyle(focused, errors, "bio", gold, ink), resize: "vertical" }} />
              <p style={{ fontSize: 11, color: muted, marginTop: 4, textAlign: "right" }}>{artistForm.bio.length}/300</p>
            </div>

            {/* Why People Book You — up to 4, optional */}
            <div>
              <Label optional>Why People Book You <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(up to 4 — skip now and add later from your dashboard if you'd rather)</span></Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {artistForm.highlights.map((h, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                    <input value={h.label} onChange={e => setArtRow("highlights", i, "label", e.target.value)}
                      placeholder="e.g. Reads the room instantly" style={inputStyle(focused, {}, "", gold, ink)} />
                    <input value={h.desc} onChange={e => setArtRow("highlights", i, "desc", e.target.value)}
                      placeholder="One line explaining why (optional)" style={inputStyle(focused, {}, "", gold, ink)} />
                    <button type="button" onClick={() => removeArtRow("highlights", i)}
                      style={{ height: 42, width: 36, background: "none", border: "1.5px solid #fca5a5", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
                  </div>
                ))}
                {artistForm.highlights.length < 4 && (
                  <button type="button" onClick={() => addArtRow("highlights", { label: "", desc: "" }, 4)}
                    style={{ padding: "9px", borderRadius: 8, border: `1.5px dashed rgba(196,122,46,0.45)`, background: "transparent", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                    + Add a reason
                  </button>
                )}
              </div>
            </div>

            {/* Experience & Milestones — optional, same as the dashboard version */}
            <div>
              <Label optional>Performance Journey <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(up to 6 — optional, add anytime from your dashboard)</span></Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {artistForm.milestones.map((m, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr auto", gap: 8 }}>
                    <input value={m.year} onChange={e => setArtRow("milestones", i, "year", e.target.value)}
                      placeholder="2024" style={inputStyle(focused, {}, "", gold, ink)} />
                    <input value={m.text} onChange={e => setArtRow("milestones", i, "text", e.target.value)}
                      placeholder="e.g. Performed at 30+ private celebrations" style={inputStyle(focused, {}, "", gold, ink)} />
                    <button type="button" onClick={() => removeArtRow("milestones", i)}
                      style={{ height: 42, width: 36, background: "none", border: "1.5px solid #fca5a5", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
                  </div>
                ))}
                {artistForm.milestones.length < 6 && (
                  <button type="button" onClick={() => addArtRow("milestones", { year: "", text: "" }, 6)}
                    style={{ padding: "9px", borderRadius: 8, border: `1.5px dashed rgba(196,122,46,0.45)`, background: "transparent", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                    + Add a milestone
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <Label optional>Notable Clients / Venues <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(up to 8)</span></Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {artistForm.notableClients.map((c, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                      <input value={c} onChange={e => setArtStr("notableClients", i, e.target.value)}
                        placeholder="e.g. Taj Palace, New Delhi" style={inputStyle(focused, {}, "", gold, ink)} />
                      <button type="button" onClick={() => removeArtStr("notableClients", i)}
                        style={{ height: 42, width: 36, background: "none", border: "1.5px solid #fca5a5", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
                    </div>
                  ))}
                  {artistForm.notableClients.length < 8 && (
                    <button type="button" onClick={() => addArtStr("notableClients", 8)}
                      style={{ padding: "9px", borderRadius: 8, border: `1.5px dashed rgba(196,122,46,0.45)`, background: "transparent", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                      + Add
                    </button>
                  )}
                </div>
              </div>
              <div>
                <Label optional>Awards / Recognition <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(up to 5)</span></Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {artistForm.awards.map((a, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                      <input value={a} onChange={e => setArtStr("awards", i, e.target.value)}
                        placeholder="e.g. Best Wedding Singer 2024" style={inputStyle(focused, {}, "", gold, ink)} />
                      <button type="button" onClick={() => removeArtStr("awards", i)}
                        style={{ height: 42, width: 36, background: "none", border: "1.5px solid #fca5a5", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
                    </div>
                  ))}
                  {artistForm.awards.length < 5 && (
                    <button type="button" onClick={() => addArtStr("awards", 5)}
                      style={{ padding: "9px", borderRadius: 8, border: `1.5px dashed rgba(196,122,46,0.45)`, background: "transparent", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                      + Add
                    </button>
                  )}
                </div>
              </div>
            </div>

            {aInput("sampleLink", "Sample Video / YouTube Link", false, { placeholder: "https://youtube.com/..." })}
            {aInput("instagram", "Instagram Handle", false, { placeholder: "@yourhandle" })}

            {/* Setlist & Performance — two structured fields per row (what + a short
                detail), not a single freeform line the vendor has to format themselves. */}
            <div>
              <Label optional>{perfLabel} <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(up to 8, shown on your profile)</span></Label>
              {quickItems.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {quickItems.map((label, qi) => (
                    <button key={qi} type="button"
                      onClick={() => setArtistForm(p => p.performanceItems.some(it => it.title === label)
                        ? p
                        : { ...p, performanceItems: [...p.performanceItems.filter(it => it.title.trim()), { title: label, note: "" }] })}
                      style={{ padding: "5px 12px", borderRadius: 100, fontSize: 11.5, fontWeight: 600, fontFamily: font, border: "1.5px solid rgba(196,122,46,0.35)", background: "rgba(196,122,46,0.06)", color: gold, cursor: "pointer" }}>
                      + {label}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {artistForm.performanceItems.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr auto", gap: 8, alignItems: "center" }}>
                    <input
                      value={item.title} maxLength={80}
                      onChange={e => setArtistForm(p => ({ ...p, performanceItems: p.performanceItems.map((x, j) => j === i ? { ...x, title: e.target.value } : x) }))}
                      placeholder={perfHints.title}
                      style={inputStyle(focused, {}, "", gold, ink)}
                    />
                    <input
                      value={item.note} maxLength={60}
                      onChange={e => setArtistForm(p => ({ ...p, performanceItems: p.performanceItems.map((x, j) => j === i ? { ...x, note: e.target.value } : x) }))}
                      placeholder={perfHints.note}
                      style={inputStyle(focused, {}, "", gold, ink)}
                    />
                    {artistForm.performanceItems.length > 1 ? (
                      <button type="button" onClick={() => setArtistForm(p => ({ ...p, performanceItems: p.performanceItems.filter((_, j) => j !== i) }))}
                        style={{ height: 42, width: 36, background: "none", border: "1.5px solid #fca5a5", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
                    ) : <div style={{ width: 36 }} />}
                  </div>
                ))}
                {artistForm.performanceItems.length < 8 && (
                  <button type="button" onClick={() => setArtistForm(p => ({ ...p, performanceItems: [...p.performanceItems, { title: "", note: "" }] }))}
                    style={{ padding: "9px", borderRadius: 8, border: `1.5px dashed rgba(196,122,46,0.45)`, background: "transparent", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                    + Add row
                  </button>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ marginTop: 8, padding: "14px", borderRadius: 12, background: loading ? "#D4A060" : `linear-gradient(135deg,${gold},#CCAB4A)`, color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", fontFamily: font }}>
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 16 }}>
          You'll get an SMS confirmation on your phone number. Our team will review and contact you within 24 hours.
        </p>
      </Shell>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  VENDOR FLOW
  // ══════════════════════════════════════════════════════════════════

  // Step 1 (legacy / direct access) — Pick category
  if (step === 1) {
    const OPTIONS = [
      { key: "artist",  title: "Individual Artist / Performer", sub: "Singer · Band · Anchor · Choreographer · Musician · Emcee", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
      { key: "vendor",  title: "Business / Vendor", sub: "Decorator · Caterer · Photographer · DJ · Venue · and more", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
      { key: "coordinator", title: "Event Coordinator", sub: "Manage client chats, leads & events", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg> },
    ];
    return (
      <Shell step={1} steps={["Category", "Plan", "Details"]} sideTiers>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Partner with Tendr</p>
          <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: ink, margin: "0 0 8px", lineHeight: 1.2 }}>How do you earn?</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>Pick the type that best describes what you do.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {OPTIONS.map(c => (
            <button key={c.key} type="button"
              onClick={() => { setCategory(c.key); if (c.key === "artist") setStep("a_type"); else if (c.key === "coordinator") {} else setStep("plan"); }}
              style={{ padding: "18px", borderRadius: 14, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)", display: "flex", alignItems: "center", gap: 16 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: "50%", background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: ink, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: muted, lineHeight: 1.55 }}>{c.sub}</div>
              </div>
              <div style={{ fontSize: 18, color: gold, flexShrink: 0 }}>→</div>
            </button>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: muted, marginTop: 24 }}>
          Already listed? <span onClick={() => navigate("/vendor/login")} style={{ color: gold, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
        </p>
      </Shell>
    );
  }

  // Step plan — Choose Free or Paid
  if (step === "plan") {
    return (
      <Shell step={flow === "vendor" ? 1 : 2} steps={["Plan", "Details", "Submit"]} sideTiers>
        {flow !== "vendor" && (
          <button type="button" onClick={() => setStep(1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
            ← Back
          </button>
        )}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Choose your plan</p>
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, color: ink, margin: "0 0 8px", lineHeight: 1.2 }}>Start free, upgrade anytime</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>No card needed. Switch plans whenever you are ready.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button type="button" onClick={() => { setPlan("free"); setStep("v_form"); }}
            style={{ padding: "22px 20px", borderRadius: 16, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(196,122,46,0.65)", marginBottom: 4 }}>Free listing</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>₹0 <span style={{ fontSize: 13, fontWeight: 500, color: muted }}>forever</span></div>
              </div>
            </div>
            {FREE_FEATS.map(f => <div key={f} style={{ fontSize: 12.5, color: muted, display: "flex", gap: 8, marginBottom: 4 }}><span style={{ color: gold, flexShrink: 0 }}>✓</span>{f}</div>)}
            <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(196,122,46,0.07)", fontSize: 12, color: "#7a4d1b", fontWeight: 600 }}>15% commission only on Tendr bookings</div>
          </button>

          <button type="button" onClick={() => { setPlan("paid"); setStep("v_features"); }}
            style={{ padding: "22px 20px", borderRadius: 16, border: `1.5px solid ${gold}`, background: "rgba(196,122,46,0.03)", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)", position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}>
            <div style={{ position: "absolute", top: -1, right: 16, background: gold, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: "0 0 8px 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>7-day free trial</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 4 }}>Listing + Dashboard</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>₹399 <span style={{ fontSize: 13, fontWeight: 500, color: muted }}>+ GST / month</span></div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>after trial · no card needed to start</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Everything in Free, plus:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
              {PAID_FEATS.map(f => <div key={f} style={{ fontSize: 12, color: muted, display: "flex", gap: 6, marginBottom: 2 }}><span style={{ color: gold, flexShrink: 0 }}>✓</span>{f}</div>)}
            </div>
            <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(196,122,46,0.07)", fontSize: 12, color: "#7a4d1b", fontWeight: 600 }}>0% commission on bookings made outside Tendr</div>
            <div style={{ marginTop: 10, color: gold, fontSize: 12, fontWeight: 700 }}>See everything you get →</div>
          </button>
        </div>
      </Shell>
    );
  }

  // Step v_features — Paid plan full feature breakdown
  if (step === "v_features") {
    const featureSections = [
      { title: "Profile & Discovery", items: ["Full vendor profile with photos & videos", "Appear in Tendr search & category pages", "SEO-optimised public listing page", "Verified badge after approval"] },
      { title: "Business Tools", items: ["Bookings & availability calendar", "Client enquiries & lead management", "Custom quotes & invoicing", "Contract templates", "Payment tracking (Tendr + outside)"] },
      { title: "Growth", items: ["Analytics: views, clicks, enquiries", "Review & rating collection", "Flyer builder & shareable link", "Smart reminders for follow-ups", "Referral program access"] },
      { title: "Support", items: ["Priority WhatsApp support", "Onboarding call with Tendr team", "Hindi & English support", "Business insights & monthly report"] },
    ];
    return (
      <Shell step={2} steps={["Plan", "Details", "Submit"]} sideTiers>
        <button type="button" onClick={() => setStep("plan")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 20, padding: 0 }}>
          ← Back
        </button>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 6 }}>Dashboard Plan — ₹399/month</p>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 6px" }}>Everything you need to grow</h1>
          <p style={{ fontSize: 13.5, color: muted, margin: 0 }}>7 days free. No card needed. Cancel anytime.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
          {featureSections.map((s, idx) => {
            const icons = ["🔍", "🛠", "📈", "💬"];
            return (
              <div key={s.title} style={{ background: "#fff", borderRadius: 13, padding: "14px 15px", border: "1.5px solid rgba(196,122,46,0.14)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}>
                  <span style={{ fontSize: 14 }}>{icons[idx]}</span>
                  <p style={{ fontSize: 10, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{s.title}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {s.items.map(item => (
                    <div key={item} style={{ fontSize: 11.5, color: muted, display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ color: gold, flexShrink: 0, lineHeight: 1.6 }}>✓</span>
                      <span style={{ lineHeight: 1.45 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={() => setStep("v_form")}
          style={{ width: "100%", padding: "14px", borderRadius: 12, background: `linear-gradient(135deg,${gold},#CCAB4A)`, color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
          Continue with Dashboard Plan →
        </button>
        <button type="button" onClick={() => { setPlan("free"); setStep("v_form"); }}
          style={{ width: "100%", marginTop: 10, padding: "12px", borderRadius: 12, background: "none", color: muted, border: "1.5px solid rgba(28,14,4,0.14)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
          No thanks, continue with Free listing
        </button>
      </Shell>
    );
  }

  // Step v_form — Vendor details + category-specific questions
  if (step === "v_form") {
    const handleVendorChange = (e) => {
      const { name, value } = e.target;
      setVendorForm(p => ({ ...p, [name]: value }));
      if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
      if (apiError) setApiError("");
    };

    const handleVendorSubmit = async (e) => {
      e.preventDefault();
      const er = {};
      if (!vendorForm.name.trim())          er.name = "Name is required";
      if (!vendorForm.businessName.trim())  er.businessName = "Business name is required";
      if (!/^[6-9]\d{9}$/.test(vendorForm.phoneNumber))   er.phoneNumber = "Enter a valid 10-digit number";
      if (!/^[6-9]\d{9}$/.test(vendorForm.whatsappNumber)) er.whatsappNumber = "Enter a valid 10-digit number";
      if (!vendorForm.address.trim())       er.address = "City / area is required";
      if (!serviceType)                     er.serviceType = "Please select your service category";
      if (vendorForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorForm.email)) er.email = "Enter a valid email";
      if (vendorForm.password.length < 8)   er.password = "Password must be at least 8 characters";
      if (vendorForm.confirmPassword !== vendorForm.password) er.confirmPassword = "Passwords don't match";
      if (Object.keys(er).length) { setErrors(er); return; }

      const ok = await submitApplication({
        name: vendorForm.name.trim(),
        businessName: vendorForm.businessName.trim(),
        phoneNumber: vendorForm.phoneNumber,
        whatsappNumber: vendorForm.whatsappNumber,
        email: vendorForm.email || "",
        address: vendorForm.address,
        password: vendorForm.password,
        serviceType,
        isArtist: false,
        plan,
        categoryAnswers,
      });
      if (ok) { setSuccessName(vendorForm.name); setSubmitted(true); }
    };

    const vInput = (f, label, req, opts = {}) => (
      <div>
        <Label required={req} optional={!req}>{label}</Label>
        <input name={f} value={vendorForm[f]} onChange={handleVendorChange}
          onFocus={() => setFocused(f)} onBlur={() => setFocused("")}
          style={inputStyle(focused, errors, f, gold, ink)} {...opts} />
        <FieldError msg={errors[f]} />
      </div>
    );

    return (
      <Shell step={3} steps={["Plan", "Details", "Submit"]}>
        <button type="button" onClick={() => setStep(plan === "paid" ? "v_features" : "plan")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 20, padding: 0 }}>
          ← Back
        </button>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 4px" }}>Tell us about your business</h1>
          <p style={{ fontSize: 13.5, color: muted, margin: 0 }}>We'll reach you on WhatsApp to complete your onboarding.</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 2px 12px rgba(28,14,4,0.05)" }}>
          {apiError && <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>}

          <form onSubmit={handleVendorSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Business Info</p>

            {vInput("businessName", "Business / Brand Name", true, { placeholder: "e.g. Royal Decorators or Rahul Photography" })}

            <div>
              <Label required>Service Category</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginTop: 4 }}>
                {VENDOR_SERVICE_TYPES.map(t => {
                  const on = serviceType === t.value;
                  return (
                    <button key={t.value} type="button" onClick={() => { setServiceType(t.value); setCatAns({}); if (errors.serviceType) setErrors(p => ({...p, serviceType: ""})); }}
                      style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${on ? gold : "rgba(28,14,4,0.12)"}`, background: on ? "rgba(196,122,46,0.07)" : "#F9F6F1", color: on ? ink : muted, fontSize: 12, fontWeight: on ? 700 : 600, cursor: "pointer", fontFamily: font, textAlign: "left", transition: "all 0.15s" }}>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{t.label}</div>
                      <div style={{ fontSize: 10.5, color: muted, lineHeight: 1.4 }}>{t.sub}</div>
                    </button>
                  );
                })}
              </div>
              <FieldError msg={errors.serviceType} />
            </div>

            {serviceType && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0 0" }}>Service Details</p>
                <CategoryQuestions serviceType={serviceType} answers={categoryAnswers} onChange={(id, val) => setCatAns(p => ({...p, [id]: val}))} />
              </>
            )}

            <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0 0" }}>Contact Details</p>

            {vInput("name", "Your Full Name", true, { placeholder: "Contact person name" })}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label required>Phone</Label>
                <input name="phoneNumber" value={vendorForm.phoneNumber} onChange={e => { setVendorForm(p => ({...p, phoneNumber: e.target.value.replace(/\D/,"").slice(0,10)})); if (errors.phoneNumber) setErrors(p => ({...p, phoneNumber: ""})); }}
                  onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")} inputMode="numeric" placeholder="10-digit number"
                  style={inputStyle(focused, errors, "phoneNumber", gold, ink)} />
                <FieldError msg={errors.phoneNumber} />
              </div>
              <div>
                <Label required>WhatsApp</Label>
                <input name="whatsappNumber" value={vendorForm.whatsappNumber} onChange={e => { setVendorForm(p => ({...p, whatsappNumber: e.target.value.replace(/\D/,"").slice(0,10)})); if (errors.whatsappNumber) setErrors(p => ({...p, whatsappNumber: ""})); }}
                  onFocus={() => setFocused("whatsappNumber")} onBlur={() => setFocused("")} inputMode="numeric" placeholder="10-digit number"
                  style={inputStyle(focused, errors, "whatsappNumber", gold, ink)} />
                <FieldError msg={errors.whatsappNumber} />
              </div>
            </div>
            {vInput("email", "Email Address", false, { type: "email", placeholder: "business@email.com" })}
            {vInput("address", "City / Area you serve", true, { placeholder: "e.g. South Delhi, Noida, Gurgaon" })}

            <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0 0" }}>Dashboard Login</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {vInput("password", "Password", true, { type: "password", placeholder: "At least 8 characters" })}
              {vInput("confirmPassword", "Confirm Password", true, { type: "password", placeholder: "Re-enter password" })}
            </div>
            <p style={{ fontSize: 11.5, color: muted, margin: "-10px 0 0" }}>You'll use this to sign in to your vendor dashboard once approved.</p>

            {/* Plan summary */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: plan === "paid" ? "rgba(196,122,46,0.06)" : "#F9F6F1", border: plan === "paid" ? `1px solid rgba(196,122,46,0.28)` : "1px solid rgba(28,14,4,0.09)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{plan === "paid" ? "Dashboard Plan — ₹399/month" : "Free listing"}</div>
                <div style={{ fontSize: 11, color: muted }}>{plan === "paid" ? "7-day free trial · upgrade after" : "₹0 forever · 15% on Tendr bookings only"}</div>
              </div>
              <button type="button" onClick={() => setStep("plan")} style={{ fontSize: 12, fontWeight: 600, color: gold, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>Change</button>
            </div>

            <button type="submit" disabled={loading}
              style={{ marginTop: 4, padding: "14px", borderRadius: 12, background: loading ? "#D4A060" : `linear-gradient(135deg,${gold},#CCAB4A)`, color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", fontFamily: font }}>
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 16 }}>
          You'll get an SMS confirmation. Our team will review and reach you on WhatsApp within 24–48 hours.
        </p>
      </Shell>
    );
  }

  // Fallback
  return null;
}

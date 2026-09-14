import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font  = "'Outfit', sans-serif";
const gold  = "#C47A2E";
const ink   = "#1C0E04";
const muted = "#7A5535";

// ─── Data ─────────────────────────────────────────────────────────────────────

const _s = (d) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const ARTIST_TYPES = [
  { value: "DJ",               label: "DJ",               sub: "Open format, commercial, wedding",                        icon: _s(<><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></>) },
  { value: "Anchor",           label: "Anchor / Emcee",   sub: "Weddings, corporate, award nights",                       icon: _s(<><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></>) },
  { value: "Emcee/Host",       label: "Emcee / Host",     sub: "Stage hosting & live shows",                              icon: _s(<><line x1="5" y1="3" x2="5" y2="21"/><line x1="19" y1="3" x2="19" y2="21"/><line x1="2" y1="5" x2="22" y2="5"/><line x1="2" y1="19" x2="22" y2="19"/></>) },
  { value: "Band",             label: "Band",             sub: "Live music — Bollywood, jazz, rock",                      icon: _s(<><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M2 18C2 13 7 8 12 8s10 5 10 10"/><line x1="9" y1="5" x2="12" y2="8"/><line x1="15" y1="5" x2="12" y2="8"/></>) },
  { value: "Singer",           label: "Singer",           sub: "Solo vocalist, all genres",                               icon: _s(<><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></>) },
  { value: "Musician",         label: "Musician",         sub: "Instrumentalist — piano, tabla, violin",                  icon: _s(<><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>) },
  { value: "Performer",        label: "Solo Performer",   sub: "Dancer, acrobat, circus & specialty act", hasArtForm: true, icon: _s(<><circle cx="12" cy="4" r="2"/><path d="M7 22l5-8 5 8"/><path d="M9 14l-2 4"/><path d="M15 14l2 4"/><path d="M9 10l3-4 3 4"/></>) },
  { value: "Stand-up Comedian",label: "Stand-up Comedian",sub: "Corporate & private shows",                               icon: _s(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>) },
  { value: "Magician",         label: "Magician",         sub: "Close-up & stage magic",                                  icon: _s(<><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2L19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2L11 5"/></>) },
  { value: "AV Setup",         label: "AV Setup",         sub: "Projector, LED wall, live streaming",                     icon: _s(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>) },
];

const VENDOR_TYPES = [
  { value: "Decorator",        label: "Decorator",        sub: "Floral, balloon, draping, lighting",  icon: _s(<><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>) },
  { value: "Caterer",          label: "Caterer",          sub: "Food service, live counters, buffet", icon: _s(<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>) },
  { value: "Photographer",     label: "Photographer",     sub: "Candid, traditional, pre-wedding",   icon: _s(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>) },
  { value: "Videographer",     label: "Videographer",     sub: "Cinematic, reels, drone coverage",   icon: _s(<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>) },
  { value: "Makeup Artist",    label: "Makeup Artist",    sub: "Bridal, party, editorial looks",     icon: _s(<><path d="M2 22l10-10"/><path d="M17 17l4-4a3 3 0 0 0-4-4L7 15a5 5 0 0 0 7 7z"/></>) },
  { value: "Tent & Furniture", label: "Tent & Furniture", sub: "Shamiyana, chairs, stage, tables",   icon: _s(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>) },
  { value: "Gift & Favours",   label: "Gift & Favours",   sub: "Return gifts, hampers, packaging",   icon: _s(<><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>) },
  { value: "Transportation",   label: "Transportation",   sub: "Wedding cars, buses, logistics",     icon: _s(<><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>) },
  { value: "Security",         label: "Security",         sub: "Event security & crowd management",  icon: _s(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>) },
  { value: "Other",            label: "Other",            sub: "Describe your service below",        icon: _s(<><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>) },
];

const PERFORMER_ART_FORMS = [
  { value: "Classical Dance",      label: "Classical Dance",      sub: "Bharatnatyam · Kathak · Odissi · Kuchipudi", emoji: "🪷" },
  { value: "Contemporary Dance",   label: "Contemporary Dance",   sub: "Hip-hop · Breaking · Freestyle · Jazz", emoji: "💃" },
  { value: "Folk & Cultural Dance",label: "Folk & Cultural Dance",sub: "Bhangra · Garba · Lavani · Bihu · Ghoomar", emoji: "🎊" },
  { value: "Aerial & Acrobatics",  label: "Aerial & Acrobatics",  sub: "Silk aerials · Hoop · Contortion · Tumbling", emoji: "🎪" },
  { value: "Fire & Circus Arts",   label: "Fire & Circus Arts",   sub: "Fire poi · Juggling · Clowning · Stilt walk", emoji: "🔥" },
  { value: "Belly Dance / Sufi",   label: "Belly Dance / Sufi",   sub: "Sufi whirling · Belly dance · Tribal fusion", emoji: "✨" },
  { value: "Mime & Physical Theater",label: "Mime & Physical Theater",sub: "Street mime · Physical comedy · Living statue", emoji: "🎭" },
  { value: "Other Art Form",       label: "Other / Mixed",        sub: "Combination or a style not listed here", emoji: "🎨" },
];

const COORDINATOR_SPECIALIZATIONS = [
  "Wedding Planning", "Corporate Events", "Birthday & Private Parties",
  "Social Events (Baby Shower, Anniversary)", "Award Nights & Galas",
  "Musical Nights / Concerts", "Exhibitions & Product Launches", "Sports Events",
];

const TRUST = [
  { n: "15%", label: "Commission",  sub: "15% platform fee on confirmed bookings only" },
  { n: "Free",  label: "To list",    sub: "No monthly fees, no hidden charges" },
  { n: "24 hrs",label: "Review time",sub: "Our team reviews every application fast" },
];

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ step, steps = ["Category", "Specialty", "Details"] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36 }}>
      {steps.map((label, i) => {
        const s = i + 1;
        const done   = step > s;
        const active = step === s;
        return (
          <React.Fragment key={s}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, fontFamily: font,
                background: done ? gold : active ? "#fff" : "#f3ede6",
                color: done ? "#fff" : active ? gold : "#B8956A",
                border: active ? `2px solid ${gold}` : done ? `2px solid ${gold}` : "2px solid #E5D5C0",
                transition: "all 0.25s",
              }}>
                {done
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : s}
              </div>
              <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, color: active ? gold : done ? gold : "#B8956A", fontFamily: font, letterSpacing: "0.02em" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > s ? gold : "#E5D5C0", margin: "0 6px", marginBottom: 20, borderRadius: 2, transition: "background 0.3s" }} />
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

function Shell({ children, step, steps, narrow = true, sideTitle, sideSub, sideTiers }) {
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
          ) : (
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

function CoordinatorForm({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    name: "", phoneNumber: "", email: "", city: "",
    experience: "", eventsPerMonth: "", specializations: [],
    bio: "", instagram: "", portfolioLink: "",
    password: "", confirmPassword: "",
  });
  const [errors, setErrors]   = useState({});
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPw, setShowPw]   = useState(false);

  const iStyle = (f) => inputStyle(focused, errors, f, gold, ink);

  const toggle = (spec) => setForm(p => ({
    ...p,
    specializations: p.specializations.includes(spec)
      ? p.specializations.filter(s => s !== spec)
      : [...p.specializations, spec],
  }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())            e.name = "Name is required";
    if (!form.phoneNumber.trim())     e.phoneNumber = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) e.phoneNumber = "Enter a valid 10-digit number";
    if (!form.email.trim())           e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.city.trim())            e.city = "City is required";
    if (!form.password)               e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
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
          city:             form.city.trim(),
          experience:       form.experience,
          eventsPerMonth:   form.eventsPerMonth,
          specializations:  form.specializations,
          bio:              form.bio.trim(),
          instagram:        form.instagram.trim(),
          portfolioLink:    form.portfolioLink.trim(),
          password:         form.password,
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
      steps={["Category", "Your Details"]}
      narrow
      sideTitle="Manage real events, earn real income."
      sideSub="Tendr's Event Coordinator program — handle client chats, plan events, earn commissions."
    >
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
        ← Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Event Coordinator</p>
        <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 4px" }}>Tell us about yourself</h1>
        <p style={{ fontSize: 14, color: muted, margin: 0 }}>Our team will review and reach you within 24–48 hours.</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 2px 12px rgba(28,14,4,0.05)" }}>
        {apiError && (
          <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Name */}
          <div>
            <Label required>Full Name</Label>
            <input value={form.name} onChange={e => { setForm(p => ({...p, name: e.target.value})); setErrors(p => ({...p, name: ""})); }}
              onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
              placeholder="e.g. Priya Sharma" style={iStyle("name")} />
            <FieldError msg={errors.name} />
          </div>

          {/* Phone + Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label required>Phone</Label>
              <input value={form.phoneNumber} onChange={e => { setForm(p => ({...p, phoneNumber: e.target.value})); setErrors(p => ({...p, phoneNumber: ""})); }}
                onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")}
                placeholder="10-digit" maxLength={10} type="tel" style={iStyle("phoneNumber")} />
              <FieldError msg={errors.phoneNumber} />
            </div>
            <div>
              <Label required>Email</Label>
              <input value={form.email} onChange={e => { setForm(p => ({...p, email: e.target.value})); setErrors(p => ({...p, email: ""})); }}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                placeholder="you@email.com" type="email" style={iStyle("email")} />
              <FieldError msg={errors.email} />
            </div>
          </div>

          {/* City */}
          <div>
            <Label required>Primary City</Label>
            <input value={form.city} onChange={e => { setForm(p => ({...p, city: e.target.value})); setErrors(p => ({...p, city: ""})); }}
              onFocus={() => setFocused("city")} onBlur={() => setFocused("")}
              placeholder="e.g. Delhi, Noida, Gurgaon" style={iStyle("city")} />
            <FieldError msg={errors.city} />
          </div>

          {/* Experience + Events/Month */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label optional>Years of Experience</Label>
              <select value={form.experience} onChange={e => setForm(p => ({...p, experience: e.target.value}))}
                onFocus={() => setFocused("experience")} onBlur={() => setFocused("")}
                style={{ ...iStyle("experience"), appearance: "none" }}>
                <option value="">Select</option>
                {["< 1 year", "1–2 years", "3–5 years", "5–10 years", "10+ years"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <Label optional>Events per Month</Label>
              <select value={form.eventsPerMonth} onChange={e => setForm(p => ({...p, eventsPerMonth: e.target.value}))}
                onFocus={() => setFocused("eventsPerMonth")} onBlur={() => setFocused("")}
                style={{ ...iStyle("eventsPerMonth"), appearance: "none" }}>
                <option value="">Select</option>
                {["1–2", "3–5", "6–10", "10+"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Specializations */}
          <div>
            <Label optional>Event Specializations</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {COORDINATOR_SPECIALIZATIONS.map(spec => {
                const sel = form.specializations.includes(spec);
                return (
                  <button
                    key={spec} type="button" onClick={() => toggle(spec)}
                    style={{
                      padding: "7px 12px", borderRadius: 8, fontSize: 12, fontFamily: font, cursor: "pointer",
                      border: `1.5px solid ${sel ? gold : "rgba(28,14,4,0.12)"}`,
                      background: sel ? "rgba(196,122,46,0.08)" : "#fff",
                      color: sel ? gold : muted, fontWeight: sel ? 700 : 500,
                      transition: "all 0.15s",
                    }}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label optional>Short Bio</Label>
            <textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))}
              onFocus={() => setFocused("bio")} onBlur={() => setFocused("")}
              rows={3} placeholder="Tell us about your event planning style and experience…"
              style={{ ...iStyle("bio"), resize: "vertical" }} />
          </div>

          {/* Instagram + Portfolio */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label optional>Instagram Handle</Label>
              <input value={form.instagram} onChange={e => setForm(p => ({...p, instagram: e.target.value}))}
                onFocus={() => setFocused("instagram")} onBlur={() => setFocused("")}
                placeholder="@yourhandle" style={iStyle("instagram")} />
            </div>
            <div>
              <Label optional>Portfolio / Website</Label>
              <input value={form.portfolioLink} onChange={e => setForm(p => ({...p, portfolioLink: e.target.value}))}
                onFocus={() => setFocused("portfolioLink")} onBlur={() => setFocused("")}
                placeholder="https://…" style={iStyle("portfolioLink")} />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label required>Create Password</Label>
            <div style={{ position: "relative" }}>
              <input value={form.password}
                onChange={e => { setForm(p => ({...p, password: e.target.value})); setErrors(p => ({...p, password: ""})); }}
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
              onChange={e => { setForm(p => ({...p, confirmPassword: e.target.value})); setErrors(p => ({...p, confirmPassword: ""})); }}
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
    </Shell>
  );
}

// ─── Main Registration component ──────────────────────────────────────────────

export default function VendorRegistration() {
  const navigate = useNavigate();

  // Navigation state
  const [step, setStep]         = useState(1);       // 1 | "plan" | 2 | 3 | "artform"
  const [category, setCategory] = useState("");      // "artist" | "vendor" | "coordinator"
  const [artForm, setArtForm]   = useState("");      // for Performer sub-step
  const [plan, setPlan]         = useState("free");  // "free" | "paid"

  // Contact form (steps 2→3 for artist/vendor)
  const [form, setForm]   = useState({ name: "", phoneNumber: "", whatsappNumber: "", email: "", address: "", serviceType: "" });
  const [errors, setErrors]     = useState({});
  const [focused, setFocused]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");

  // Success
  const [submitted, setSubmitted]   = useState(false);
  const [successName, setSuccessName] = useState("");
  const [isCoordinator, setIsCoordinator] = useState(false);

  const iStyle = (f) => inputStyle(focused, errors, f, gold, ink);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())            e.name = "Name is required";
    if (!form.phoneNumber.trim())     e.phoneNumber = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) e.phoneNumber = "Enter a valid 10-digit number";
    if (!form.whatsappNumber.trim())  e.whatsappNumber = "WhatsApp number is required";
    else if (!/^[6-9]\d{9}$/.test(form.whatsappNumber)) e.whatsappNumber = "Enter a valid 10-digit number";
    if (!form.address.trim())         e.address = "Area / city is required";
    if (!form.serviceType)            e.serviceType = "Please select your service type";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    setApiError("");
    try {
      const payload = { ...form, plan };
      if (artForm) payload.performerArtForm = artForm;
      const res = await fetch(`${BASE_URL}/vendor-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setApiError(data.message || "Application already exists.");
        else if (data.errors) {
          const mapped = {};
          data.errors.forEach(er => { mapped[er.param || er.path] = er.msg; });
          setErrors(mapped);
        } else setApiError(data.message || "Submission failed. Please try again.");
        return;
      }
      setSuccessName(form.name);
      setIsCoordinator(false);
      setSubmitted(true);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (submitted) {
    return <SuccessScreen name={successName} isCoordinator={isCoordinator} navigate={navigate} />;
  }

  // ── Coordinator flow ───────────────────────────────────────────────────────
  if (category === "coordinator") {
    return (
      <CoordinatorForm
        onBack={() => { setCategory(""); setStep(1); }}
        onSuccess={(name) => { setSuccessName(name); setIsCoordinator(true); setSubmitted(true); }}
      />
    );
  }

  // ── Step 1: Pick category ──────────────────────────────────────────────────
  if (step === 1) {
    const OPTIONS = [
      {
        key: "artist",
        title: "Individual Artist",
        sub: "DJ · Anchor · Singer · Band · Musician · Solo Performer · Comedian · Magician",
        icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
      },
      {
        key: "vendor",
        title: "Business / Vendor",
        sub: "Decorator · Caterer · Photographer · Videographer · Makeup · Tent · Gifts · Transport",
        icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      },
      {
        key: "coordinator",
        title: "Event Coordinator",
        sub: "Manage client chats & leads · Plan weddings, corporate & private events",
        icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
      },
    ];

    return (
      <Shell step={1} steps={["Category", "Specialty", "Plan", "Details"]}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Partner with Tendr</p>
          <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: ink, letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.2 }}>How do you earn?</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>Pick the type that best describes what you do.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {OPTIONS.map(c => (
            <button
              key={c.key}
              onClick={() => { setCategory(c.key); if (c.key !== "coordinator") setStep(2); }}
              style={{ padding: "18px 18px", borderRadius: 14, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)", display: "flex", alignItems: "center", gap: 16 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = `0 6px 24px rgba(196,122,46,0.14)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: "50%", background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {c.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: ink, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: muted, lineHeight: 1.55 }}>{c.sub}</div>
              </div>
              <div style={{ fontSize: 18, color: gold, flexShrink: 0 }}>→</div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: muted, marginTop: 24 }}>
          Already listed?{" "}
          <span onClick={() => navigate("/login")} style={{ color: gold, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
        </p>
      </Shell>
    );
  }

  // ── Step "plan": Choose Free or Paid tier ──────────────────────────────────
  if (step === "plan") {
    return (
      <Shell step={3} steps={["Category", "Specialty", "Plan", "Details"]} sideTiers>
        <button onClick={() => setStep(2)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Choose your plan</p>
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, color: ink, letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.2 }}>Start free, upgrade anytime</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>No card needed to start. Switch plans whenever you're ready.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Free tier card */}
          <button
            onClick={() => { setPlan("free"); setStep(3); }}
            style={{ padding: "22px 20px", borderRadius: 16, border: plan === "free" ? `2px solid ${gold}` : "1.5px solid rgba(28,14,4,0.1)", background: plan === "free" ? "rgba(196,122,46,0.04)" : "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = plan === "free" ? gold : "rgba(28,14,4,0.1)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(196,122,46,0.65)", marginBottom: 4 }}>Free listing</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>₹0 <span style={{ fontSize: 13, fontWeight: 500, color: muted }}>forever</span></div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${plan === "free" ? gold : "rgba(28,14,4,0.2)"}`, background: plan === "free" ? gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                {plan === "free" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {FREE_FEATS.map(f => (
                <div key={f} style={{ fontSize: 12.5, color: muted, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: gold, flexShrink: 0, lineHeight: 1.6 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "8px 14px", borderRadius: 8, background: "rgba(196,122,46,0.07)", fontSize: 12, color: "#7a4d1b", fontWeight: 600 }}>
              15% commission only on bookings made through Tendr
            </div>
          </button>

          {/* Paid Dashboard card */}
          <button
            onClick={() => { setPlan("paid"); setStep(3); }}
            style={{ padding: "22px 20px", borderRadius: 16, border: plan === "paid" ? `2px solid ${gold}` : "1.5px solid rgba(28,14,4,0.1)", background: plan === "paid" ? "rgba(196,122,46,0.04)" : "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)", position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = plan === "paid" ? gold : "rgba(28,14,4,0.1)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}
          >
            <div style={{ position: "absolute", top: -1, right: 16, background: gold, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: "0 0 8px 8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>7-day free trial</div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 4 }}>Listing + Dashboard</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>₹399 <span style={{ fontSize: 13, fontWeight: 500, color: muted }}>+ GST / month</span></div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>after 7-day trial · no card needed to start</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${plan === "paid" ? gold : "rgba(28,14,4,0.2)"}`, background: plan === "paid" ? gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                {plan === "paid" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: muted, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>Everything in Free, plus:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
              {PAID_FEATS.map(f => (
                <div key={f} style={{ fontSize: 12, color: muted, display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ color: gold, flexShrink: 0, lineHeight: 1.65 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "8px 14px", borderRadius: 8, background: "rgba(196,122,46,0.07)", fontSize: 12, color: "#7a4d1b", fontWeight: 600 }}>
              0% commission on bookings made outside Tendr
            </div>
          </button>
        </div>
      </Shell>
    );
  }

  // ── Step 2: Pick specific type ─────────────────────────────────────────────
  if (step === 2) {
    const types = category === "artist" ? ARTIST_TYPES : VENDOR_TYPES;
    return (
      <Shell step={2} steps={["Category", "Specialty", "Plan", "Details"]} narrow={false}>
        <button onClick={() => { setStep(1); setCategory(""); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>
            {category === "artist" ? "Individual Artist" : "Business / Vendor"}
          </p>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, color: ink, margin: "0 0 6px" }}>What's your specialty?</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>Choose your service type — your profile will be tailored for you.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
          {types.map(t => (
            <button
              key={t.value}
              onClick={() => {
                setForm(f => ({ ...f, serviceType: t.value }));
                if (t.hasArtForm) {
                  setStep("artform");
                } else {
                  setArtForm("");
                  setStep("plan");
                }
              }}
              style={{ padding: "18px 16px", borderRadius: 14, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 3px rgba(28,14,4,0.04)", position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.background = "rgba(196,122,46,0.03)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(28,14,4,0.04)"; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.16)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, flexShrink: 0 }}>
                {t.icon}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: ink, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: muted, lineHeight: 1.5 }}>{t.sub}</div>
              {t.hasArtForm && (
                <div style={{ fontSize: 10.5, color: gold, fontWeight: 600, marginTop: 8, letterSpacing: "0.04em" }}>Choose art form →</div>
              )}
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  // ── Step "artform": Performer art form picker ──────────────────────────────
  if (step === "artform") {
    return (
      <Shell step={2} steps={["Category", "Specialty", "Plan", "Details"]} narrow={false}>
        <button onClick={() => { setStep(2); setArtForm(""); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Solo Performer</p>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, color: ink, margin: "0 0 6px" }}>What's your art form?</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>We'll match you with the right events for your style.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {PERFORMER_ART_FORMS.map(af => (
            <button
              key={af.value}
              onClick={() => { setArtForm(af.value); setStep("plan"); }}
              style={{ padding: "18px 16px", borderRadius: 14, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 3px rgba(28,14,4,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.background = "rgba(196,122,46,0.04)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(196,122,46,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(28,14,4,0.04)"; }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{af.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: ink, marginBottom: 4 }}>{af.label}</div>
              <div style={{ fontSize: 11, color: muted, lineHeight: 1.5 }}>{af.sub}</div>
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  // ── Step 3: Contact details form ───────────────────────────────────────────
  const typeLabel = [...ARTIST_TYPES, ...VENDOR_TYPES].find(t => t.value === form.serviceType);
  const artFormLabel = PERFORMER_ART_FORMS.find(a => a.value === artForm);

  return (
    <Shell step={4} steps={["Category", "Specialty", "Plan", "Details"]}>
      <button onClick={() => setStep("plan")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 20, padding: 0 }}>
        ← Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 4px" }}>
          {typeLabel?.label || form.serviceType}
          {artFormLabel ? ` — ${artFormLabel.label}` : ""}
        </h1>
        <p style={{ fontSize: 14, color: muted, margin: 0 }}>Fill in your contact details — we'll reach you on WhatsApp.</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 2px 12px rgba(28,14,4,0.05)" }}>
        {apiError && (
          <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <Label required>Full Name</Label>
            <input name="name" type="text" placeholder="e.g. Rahul Sharma" value={form.name} onChange={handleChange}
              onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
              style={iStyle("name")} />
            <FieldError msg={errors.name} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label required>Phone</Label>
              <input name="phoneNumber" type="tel" placeholder="10-digit number" value={form.phoneNumber} onChange={handleChange}
                onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")} maxLength={10}
                style={iStyle("phoneNumber")} />
              <FieldError msg={errors.phoneNumber} />
            </div>
            <div>
              <Label required>WhatsApp</Label>
              <input name="whatsappNumber" type="tel" placeholder="10-digit number" value={form.whatsappNumber} onChange={handleChange}
                onFocus={() => setFocused("whatsappNumber")} onBlur={() => setFocused("")} maxLength={10}
                style={iStyle("whatsappNumber")} />
              <FieldError msg={errors.whatsappNumber} />
            </div>
          </div>

          <div>
            <Label optional>Email</Label>
            <input name="email" type="email" placeholder="e.g. rahul@example.com" value={form.email} onChange={handleChange}
              onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
              style={iStyle("email")} />
            <FieldError msg={errors.email} />
          </div>

          <div>
            <Label required>City / Area you serve</Label>
            <textarea name="address" placeholder="e.g. South Delhi, Noida, Gurgaon" value={form.address} onChange={handleChange}
              onFocus={() => setFocused("address")} onBlur={() => setFocused("")} rows={2}
              style={{ ...iStyle("address"), resize: "vertical" }} />
            <FieldError msg={errors.address} />
          </div>

          {/* Summary chips */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "#F9F6F1", border: "1px solid rgba(28,14,4,0.09)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>
                  {typeLabel?.label || form.serviceType}
                  {artFormLabel ? ` · ${artFormLabel.label}` : ""}
                </div>
                <div style={{ fontSize: 11, color: muted }}>Your service type</div>
              </div>
              <button type="button" onClick={() => { setStep(artForm ? "artform" : 2); }} style={{ fontSize: 12, fontWeight: 600, color: gold, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>
                Change
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: plan === "paid" ? "rgba(196,122,46,0.06)" : "#F9F6F1", border: plan === "paid" ? `1px solid rgba(196,122,46,0.28)` : "1px solid rgba(28,14,4,0.09)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>
                    {plan === "paid" ? "Listing + Dashboard" : "Free Listing"}
                  </div>
                  {plan === "paid" && (
                    <div style={{ fontSize: 10, fontWeight: 800, background: gold, color: "#fff", padding: "2px 7px", borderRadius: 100, letterSpacing: "0.05em" }}>7-day trial</div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>
                  {plan === "paid" ? "₹399 + GST/month after trial · 0% outside commission" : "₹0 forever · 15% on Tendr bookings"}
                </div>
              </div>
              <button type="button" onClick={() => setStep("plan")} style={{ fontSize: 12, fontWeight: 600, color: gold, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>
                Change
              </button>
            </div>
          </div>

          <FieldError msg={errors.serviceType} />

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "#e5e7eb" : gold, color: loading ? "#9ca3af" : "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(196,122,46,0.3)", transition: "all 0.2s" }}>
            {loading ? "Submitting…" : "Submit Application →"}
          </button>
        </form>
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 16 }}>
        {plan === "paid" ? "7-day free trial · No card needed · Cancel anytime" : "Free to list · 15% only on Tendr bookings · Upgrade anytime"}
      </p>
      <p style={{ textAlign: "center", fontSize: 13, color: muted, marginTop: 6 }}>
        Already a partner?{" "}
        <span onClick={() => navigate("/login")} style={{ color: gold, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
      </p>
    </Shell>
  );
}

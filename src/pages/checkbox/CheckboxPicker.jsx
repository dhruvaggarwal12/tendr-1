import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import SEO from "../../components/SEO";
import ToolNav from "../../components/ToolNav";
import ToolIntroWrapper from "../../components/ToolIntroWrapper";

const font = "'Outfit', sans-serif";

const EVENT_TYPES = [
  { id: "birthday",       label: "Birthday Party",       icon: "🎂" },
  { id: "wedding",        label: "Wedding",              icon: "💒" },
  { id: "anniversary",    label: "Anniversary",          icon: "💕" },
  { id: "prewedding",     label: "Pre-Wedding Function", icon: "💍" },
  { id: "party",          label: "Party / Get-together", icon: "🎉" },
  { id: "houseparty",     label: "House Party",          icon: "🏠" },
  { id: "housewarming",   label: "Housewarming",         icon: "🏡" },
  { id: "babyshower",     label: "Baby Shower",          icon: "🍼" },
  { id: "kittyparty",     label: "Kitty Party",          icon: "🎰" },
  { id: "namingceremony", label: "Naming Ceremony",      icon: "👶" },
  { id: "corporate",      label: "Corporate Event",      icon: "🏢" },
  { id: "custom",         label: "Other / Custom",       icon: "✨" },
];

const VENUE_TYPES = [
  { id: "home",      label: "At Home",          icon: "🏠" },
  { id: "banquet",   label: "Banquet Hall",      icon: "🏛️" },
  { id: "hotel",     label: "Hotel / Resort",   icon: "🏨" },
  { id: "outdoor",   label: "Outdoor / Garden", icon: "🌿" },
  { id: "farmhouse", label: "Farmhouse",        icon: "🌾" },
  { id: "tbd",       label: "Not Decided Yet",  icon: "🤔" },
];

const SERVICES = [
  { id: "Catering",    label: "Catering",       icon: "🍽️" },
  { id: "Decoration",  label: "Decoration",     icon: "🎨" },
  { id: "Photography", label: "Photography",    icon: "📸" },
  { id: "DJ",          label: "DJ & Music",     icon: "🎵" },
  { id: "Anchor",      label: "Anchor / MC",    icon: "🎤" },
  { id: "Mehendi",     label: "Mehendi",        icon: "🌿" },
  { id: "Makeup",      label: "Makeup & Hair",  icon: "💄" },
  { id: "Transport",   label: "Transport",      icon: "🚗" },
];

const GUEST_SIZES = [
  { id: "small",  label: "Small",  sub: "Less than 50 guests",  icon: "👥" },
  { id: "medium", label: "Medium", sub: "50 – 200 guests",       icon: "👨‍👩‍👧‍👦" },
  { id: "large",  label: "Large",  sub: "200+ guests",           icon: "🎪" },
];

const LOADING_MSGS = [
  "Analyzing your event requirements…",
  "Building your personalized task list…",
  "Adding service-specific tasks…",
  "Organizing by urgency and timeline…",
  "Almost ready!",
];

const getToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

export default function CheckboxPicker() {
  const navigate = useNavigate();
  const navType = useNavigationType();

  // Check if existing personalized checklist exists — skip form if yes.
  // Skip auto-redirect when user pressed back (POP) so they can leave the page.
  useEffect(() => {
    if (navType === "POP") return;
    try {
      const raw = localStorage.getItem("tendr_checklist_v2");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.__expiresAt && Date.now() > saved.__expiresAt) {
        localStorage.removeItem("tendr_checklist_v2");
        return;
      }
      if (saved.categories?.length > 0) {
        navigate("/prebuilt-checklist", { replace: true });
      }
    } catch {}
  }, []); // eslint-disable-line

  const [step, setStep]         = useState(1);
  const [eventType, setEventType]   = useState("");
  const [eventDate, setEventDate]   = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [venueType, setVenueType]   = useState("");
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [loadingPct, setLoadingPct] = useState(0);
  const timerRef = useRef(null);

  const TOTAL_STEPS = 5;
  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const toggleService = (id) =>
    setServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const canNext = () => {
    if (step === 1) return !!eventType;
    if (step === 2) return true; // date optional
    if (step === 3) return !!guestCount;
    if (step === 4) return !!venueType;
    if (step === 5) return true;
    return true;
  };

  const startLoading = () => {
    setLoading(true);
    let pct = 0;
    let msgIdx = 0;
    const iv = setInterval(() => {
      pct += 4;
      if (pct > 100) pct = 100;
      setLoadingPct(pct);
      if (pct % 20 === 0 && msgIdx < LOADING_MSGS.length - 1) {
        msgIdx++;
        setLoadingMsgIdx(msgIdx);
      }
      if (pct >= 100) {
        clearInterval(iv);
        const personalizationData = { eventType, eventDate, guestCount, venueType, services };
        try {
          localStorage.setItem("tendr_checklist_form", JSON.stringify({ ...personalizationData, savedAt: Date.now() }));
        } catch {}
        navigate("/prebuilt-checklist", { state: { personalizationData } });
      }
    }, 50);
    timerRef.current = iv;
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) {
    const eventLabel = EVENT_TYPES.find(e => e.id === eventType)?.label || "Your Event";
    return (
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 60%,#6B3A1F 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: font, padding: "0 24px" }}>
        <div style={{ fontSize: 64, marginBottom: 20, animation: "pulse 1.2s ease-in-out infinite" }}>✅</div>
        <h2 style={{ color: "#fff", fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, margin: "0 0 10px", textAlign: "center" }}>Creating your checklist</h2>
        <p style={{ color: "#CCAB4A", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>{eventLabel}</p>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: "0 0 32px", textAlign: "center" }}>{LOADING_MSGS[loadingMsgIdx]}</p>

        {/* Progress bar */}
        <div style={{ width: "min(320px,80vw)", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 100, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ height: "100%", width: `${loadingPct}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, transition: "width 0.25s ease" }} />
        </div>

        {/* Summary chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 420 }}>
          {eventType && <Chip label={EVENT_TYPES.find(e => e.id === eventType)?.label} />}
          {eventDate && <Chip label={`📅 ${new Date(eventDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}`} />}
          {guestCount && <Chip label={GUEST_SIZES.find(g => g.id === guestCount)?.label + " Event"} />}
          {services.map(s => <Chip key={s} label={s} />)}
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
      </div>
    );
  }

  // ── Steps 1–5 ─────────────────────────────────────────────────────────────
  const content = (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Event Checklist — Personalize Your Plan" description="Create a personalized event checklist based on your event type, date, and services." path="/checklist-picker" noIndex />
      <ToolNav title="Event Checklist" />

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(196,122,46,0.1)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", transition: "width 0.35s ease" }} />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "clamp(20px,5vw,44px) clamp(14px,3vw,24px) 80px" }}>
        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <React.Fragment key={i}>
              <div style={{ width: i + 1 === step ? 28 : 22, height: 22, borderRadius: 100, background: i + 1 < step ? "#C47A2E" : i + 1 === step ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: i + 1 <= step ? "#fff" : "#C47A2E", transition: "all 0.25s", flexShrink: 0 }}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              {i < TOTAL_STEPS - 1 && <div style={{ flex: 1, height: 2, maxWidth: 40, background: i + 1 < step ? "#C47A2E" : "rgba(196,122,46,0.12)", borderRadius: 100 }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Event Type */}
        {step === 1 && (
          <StepWrapper label="Step 1 of 5" title="What type of event are you planning?" sub="We'll tailor the checklist to your event.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14 }}>
              {EVENT_TYPES.map(e => (
                <OptionCard key={e.id} icon={e.icon} label={e.label} selected={eventType === e.id} onClick={() => { setEventType(e.id); setTimeout(() => setStep(2), 240); }} />
              ))}
            </div>
          </StepWrapper>
        )}

        {/* Step 2: Event Date */}
        {step === 2 && (
          <StepWrapper label="Step 2 of 5" title="When is your event?" sub="Helps us show urgent tasks and saves your checklist until event day.">
            <div style={{ maxWidth: 340, margin: "0 auto" }}>
              <input type="date" min={getToday()} value={eventDate} onChange={e => { if (e.target.value && e.target.value < getToday()) return; setEventDate(e.target.value); }}
                style={{ width: "100%", padding: "16px 18px", borderRadius: 14, border: "2px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 16, color: "#2C1A0E", background: "#FFFCF5", outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
              {eventDate && (
                <div style={{ background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#C47A2E" }}>
                    {Math.max(0, Math.ceil((new Date(eventDate) - new Date()) / 86400000))} days to go
                  </span>
                </div>
              )}
              <button onClick={() => setStep(3)} style={{ width: "100%", marginTop: 16, padding: "12px", borderRadius: 12, border: "none", background: "transparent", color: "#9B7450", fontSize: 13, cursor: "pointer", fontFamily: font }}>
                {eventDate ? "" : "Skip for now →"}
              </button>
            </div>
          </StepWrapper>
        )}

        {/* Step 3: Guest Count */}
        {step === 3 && (
          <StepWrapper label="Step 3 of 5" title="How many guests are you expecting?" sub="Helps us add the right level of coordination tasks.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="guest-grid">
              {GUEST_SIZES.map(g => (
                <button key={g.id} onClick={() => { setGuestCount(g.id); setTimeout(() => setStep(4), 240); }}
                  style={{ background: guestCount === g.id ? "linear-gradient(135deg,rgba(196,122,46,0.15),rgba(204,171,74,0.15))" : "#FFFCF5", border: guestCount === g.id ? "2px solid #C47A2E" : "1.5px solid rgba(196,122,46,0.15)", borderRadius: 18, padding: "clamp(14px,3.5vw,28px) 16px", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
                  <span style={{ fontSize: "clamp(24px,4.5vw,36px)" }}>{g.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>{g.label}</span>
                  <span style={{ fontSize: 12, color: "#9B7450", textAlign: "center" }}>{g.sub}</span>
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {/* Step 4: Venue Type */}
        {step === 4 && (
          <StepWrapper label="Step 4 of 5" title="What kind of venue?" sub="We'll add venue-specific tasks to your checklist.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14 }}>
              {VENUE_TYPES.map(v => (
                <OptionCard key={v.id} icon={v.icon} label={v.label} selected={venueType === v.id} onClick={() => { setVenueType(v.id); setTimeout(() => setStep(5), 240); }} />
              ))}
            </div>
          </StepWrapper>
        )}

        {/* Step 5: Services */}
        {step === 5 && (
          <StepWrapper label="Step 5 of 5" title="Which services do you need?" sub="Select all that apply — we'll create task categories for each.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 32 }}>
              {SERVICES.filter(s => {
                if (s.id === "Mehendi" || s.id === "Makeup") return eventType === "wedding" || eventType === "prewedding";
                return true;
              }).map(s => {
                const sel = services.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleService(s.id)}
                    style={{ background: sel ? "linear-gradient(135deg,rgba(196,122,46,0.15),rgba(204,171,74,0.12))" : "#FFFCF5", border: sel ? "2px solid #C47A2E" : "1.5px solid rgba(196,122,46,0.15)", borderRadius: 14, padding: "clamp(10px,2.5vw,18px) 12px", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.15s", position: "relative" }}>
                    {sel && <span style={{ position: "absolute", top: 8, right: 10, fontSize: 11, color: "#C47A2E", fontWeight: 800 }}>✓</span>}
                    <span style={{ fontSize: "clamp(20px,4vw,28px)" }}>{s.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{s.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <button onClick={startLoading}
                style={{ width: "100%", maxWidth: 400, padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: font, cursor: "pointer", boxShadow: "0 6px 20px rgba(196,122,46,0.35)", letterSpacing: "0.01em" }}>
                Generate My Checklist ✨
              </button>
              <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>
                {services.length === 0 ? "No service selected — we'll add core tasks only." : `${services.length} service${services.length > 1 ? "s" : ""} selected`}
              </p>
            </div>
          </StepWrapper>
        )}

        {/* Nav buttons */}
        {step >= 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 36 }}>
            <button onClick={() => step === 1 ? navigate(-1) : setStep(s => s - 1)}
              style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              ← Back
            </button>
            {step < 5 && (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: canNext() ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.15)", color: canNext() ? "#fff" : "#C47A2E", fontSize: 13, fontWeight: 700, cursor: canNext() ? "pointer" : "not-allowed", fontFamily: font, opacity: canNext() ? 1 : 0.5 }}>
                {step === 2 && !eventDate ? "Skip →" : "Next →"}
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`@media(max-width:500px){.guest-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
  return (
    <ToolIntroWrapper
      toolId="checklist-picker"
      icon="✅"
      title="Event Checklist"
      tagline="Never miss a detail for your big day"
      description="Personalise your checklist in 5 quick steps — we'll build a task list tailored to your event type, services, and timeline."
      steps={[
        { title: "Pick your event type", desc: "Birthday, wedding, get-together, and more." },
        { title: "Set your event date", desc: "Tracks your countdown automatically." },
        { title: "Choose a venue type", desc: "Tasks adjust based on your venue." },
        { title: "Select your services", desc: "Only relevant tasks appear." },
        { title: "Mark what's booked", desc: "Pre-check completed items." },
      ]}
    >
      {content}
    </ToolIntroWrapper>
  );
}

function StepWrapper({ label, title, sub, children }) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>{label}</p>
        <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.015em", margin: "0 0 8px" }}>{title}</h2>
        <p style={{ fontSize: 14, color: "#9B7450" }}>{sub}</p>
        <div style={{ width: 40, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "14px auto 0" }} />
      </div>
      {children}
    </div>
  );
}

function OptionCard({ icon, label, selected, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: selected ? "linear-gradient(135deg,rgba(196,122,46,0.15),rgba(204,171,74,0.12))" : "#FFFCF5", borderRadius: 18, padding: "clamp(12px,3.5vw,28px) 16px", border: selected ? "2px solid #C47A2E" : "1.5px solid rgba(196,122,46,0.15)", boxShadow: selected ? "0 4px 16px rgba(196,122,46,0.2)" : "0 3px 12px rgba(139,69,19,0.06)", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(6px,1.5vw,10px)", transition: "all 0.2s" }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"; e.currentTarget.style.transform = "translateY(0)"; } }}>
      <span style={{ fontSize: "clamp(26px,5vw,40px)" }}>{icon}</span>
      <span style={{ fontSize: "clamp(12px,2vw,14px)", fontWeight: 800, color: "#2C1A0E", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

function Chip({ label }) {
  return (
    <span style={{ padding: "6px 14px", borderRadius: 100, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: font }}>
      {label}
    </span>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import ToolNav from "../../components/ToolNav";
import ToolIntroWrapper from "../../components/ToolIntroWrapper";

const font = "'Outfit', sans-serif";

const EVENT_TYPES = [
  { id: "birthday",    label: "Birthday Party",       icon: "🎂" },
  { id: "wedding",     label: "Wedding",              icon: "💒" },
  { id: "anniversary", label: "Anniversary",          icon: "💕" },
  { id: "prewedding",  label: "Pre-Wedding Function", icon: "💍" },
  { id: "party",       label: "Party / Get-together", icon: "🎉" },
  { id: "corporate",   label: "Corporate Event",       icon: "🏢" },
  { id: "custom",      label: "Other / Custom",        icon: "✨" },
];

const SERVICES = [
  { id: "Catering",    label: "Catering",      icon: "🍽️" },
  { id: "Decoration",  label: "Decoration",    icon: "🎨" },
  { id: "Photography", label: "Photography",   icon: "📸" },
  { id: "DJ",          label: "DJ & Music",    icon: "🎵" },
  { id: "Anchor",      label: "Anchor / MC",   icon: "🎤" },
  { id: "Mehendi",     label: "Mehendi",       icon: "🌿" },
  { id: "Makeup",      label: "Makeup & Hair", icon: "💄" },
  { id: "Transport",   label: "Transport",     icon: "🚗" },
];

const LOADING_MSGS = [
  "Analyzing your event date…",
  "Calculating your planning window…",
  "Building milestone phases…",
  "Adding service-specific tasks…",
  "Personalizing your timeline…",
];

const today = new Date().toISOString().split("T")[0];

export default function TimelinePicker() {
  const navigate = useNavigate();

  // Skip form if saved timeline exists
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tendr_timeline_v2");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.__expiresAt && Date.now() > saved.__expiresAt) {
        localStorage.removeItem("tendr_timeline_v2");
        return;
      }
      if (saved.phases?.length > 0) {
        navigate("/prebuilt-timeline", { replace: true });
      }
    } catch {}
  }, []); // eslint-disable-line

  const [step, setStep]           = useState(1);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [services, setServices]   = useState([]);
  const [booked, setBooked]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [loadingPct, setLoadingPct] = useState(0);
  const timerRef = useRef(null);

  const TOTAL_STEPS = 4;
  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const toggleService = (id) => setServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleBooked  = (id) => setBooked(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const daysLeft = eventDate
    ? Math.max(0, Math.ceil((new Date(eventDate) - new Date()) / 86400000))
    : null;

  const planLabel = daysLeft === null ? null
    : daysLeft > 60 ? "90-Day Plan"
    : daysLeft > 21 ? "30-Day Plan"
    : daysLeft > 7  ? "7-Day Plan"
    : daysLeft > 0  ? `${daysLeft}-Day Plan`
    : "Event Day";

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
        const personalizationData = { eventType, eventDate, services, booked };
        try {
          localStorage.setItem("tendr_timeline_form", JSON.stringify({ ...personalizationData, savedAt: Date.now() }));
        } catch {}
        navigate("/prebuilt-timeline", { state: { personalizationData } });
      }
    }, 50);
    timerRef.current = iv;
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) {
    const eventLabel = EVENT_TYPES.find(e => e.id === eventType)?.label || "Your Event";
    return (
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg,#2C1A0E 0%,#3D2210 60%,#5C3418 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: font, padding: "0 24px" }}>
        <div style={{ fontSize: 64, marginBottom: 20, animation: "pulse 1.2s ease-in-out infinite" }}>⏱️</div>
        <h2 style={{ color: "#fff", fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, margin: "0 0 10px", textAlign: "center" }}>Creating your timeline</h2>
        <p style={{ color: "#CCAB4A", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>{eventLabel} {planLabel && `· ${planLabel}`}</p>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: "0 0 32px", textAlign: "center" }}>{LOADING_MSGS[loadingMsgIdx]}</p>

        <div style={{ width: "min(320px,80vw)", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 100, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ height: "100%", width: `${loadingPct}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, transition: "width 0.25s ease" }} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 420 }}>
          {eventType && <Chip label={EVENT_TYPES.find(e => e.id === eventType)?.label} />}
          {eventDate && <Chip label={`📅 ${daysLeft} days left`} />}
          {services.map(s => <Chip key={s} label={s} />)}
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
      </div>
    );
  }

  const content = (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Event Timeline — Personalized Planning Schedule" description="Get a personalized event timeline based on your event type, date, and services." path="/timeline-picker" />
      <ToolNav title="Event Timeline" />

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(196,122,46,0.1)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", transition: "width 0.35s ease" }} />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "clamp(20px,5vw,44px) clamp(14px,3vw,24px) calc(80px + env(safe-area-inset-bottom, 0px))" }}>

        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <React.Fragment key={i}>
              <div style={{ width: i + 1 === step ? 28 : 22, height: 22, borderRadius: 100, background: i + 1 < step ? "#C47A2E" : i + 1 === step ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: i + 1 <= step ? "#fff" : "#C47A2E", transition: "all 0.25s", flexShrink: 0 }}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              {i < TOTAL_STEPS - 1 && <div style={{ flex: 1, height: 2, maxWidth: 48, background: i + 1 < step ? "#C47A2E" : "rgba(196,122,46,0.12)", borderRadius: 100 }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Event Type */}
        {step === 1 && (
          <StepWrapper label="Step 1 of 4" title="What type of event?" sub="We'll match the right planning structure for your event.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
              {EVENT_TYPES.map(e => (
                <OptionCard key={e.id} icon={e.icon} label={e.label} selected={eventType === e.id} onClick={() => { setEventType(e.id); setTimeout(() => setStep(2), 240); }} />
              ))}
            </div>
          </StepWrapper>
        )}

        {/* Step 2: Event Date */}
        {step === 2 && (
          <StepWrapper label="Step 2 of 4" title="When is your event?" sub="The event date determines your planning window and milestone schedule.">
            <div style={{ maxWidth: 300, margin: "0 auto" }}>
              <input type="date" min={today} value={eventDate} onChange={e => setEventDate(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "2px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 15, color: "#2C1A0E", background: "#FFFCF5", outline: "none", boxSizing: "border-box", textAlign: "center" }} />

              {eventDate && daysLeft !== null && (
                <div style={{ marginTop: 12, background: "linear-gradient(135deg,rgba(196,122,46,0.08),rgba(204,171,74,0.06))", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#C47A2E" }}>{daysLeft} days</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9B7450" }}>until your event</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#2C1A0E" }}>{planLabel}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 10, color: "#9B7450" }}>recommended for you</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </StepWrapper>
        )}

        {/* Step 3: Services */}
        {step === 3 && (
          <StepWrapper label="Step 3 of 4" title="Which services are you planning?" sub="Only tasks for your selected services will appear in the timeline.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10, marginBottom: 12 }}>
              {SERVICES.map(s => {
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
          </StepWrapper>
        )}

        {/* Step 4: Already booked */}
        {step === 4 && (
          <StepWrapper label="Step 4 of 4" title="What have you already booked?" sub="We'll mark those tasks as done — so your timeline shows only what's left.">
            {services.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9B7450", fontSize: 14, padding: "20px 0" }}>You didn't select any services — your timeline will show core planning tasks.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10, marginBottom: 12 }}>
                {services.map(sid => {
                  const s = SERVICES.find(x => x.id === sid);
                  if (!s) return null;
                  const sel = booked.includes(sid);
                  return (
                    <button key={sid} onClick={() => toggleBooked(sid)}
                      style={{ background: sel ? "rgba(34,197,94,0.1)" : "#FFFCF5", border: sel ? "2px solid #16a34a" : "1.5px solid rgba(196,122,46,0.15)", borderRadius: 14, padding: "clamp(10px,2.5vw,18px) 12px", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.15s", position: "relative" }}>
                      {sel && <span style={{ position: "absolute", top: 8, right: 10, fontSize: 11, color: "#16a34a", fontWeight: 800 }}>✓ Done</span>}
                      <span style={{ fontSize: "clamp(20px,4vw,28px)" }}>{s.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <p style={{ fontSize: 12, color: "#9B7450", textAlign: "center", marginBottom: 20 }}>Skip if nothing is booked yet.</p>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button onClick={startLoading}
                style={{ padding: "16px 48px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: font, cursor: "pointer", boxShadow: "0 6px 20px rgba(196,122,46,0.35)" }}>
                Generate My Timeline ✨
              </button>
            </div>
          </StepWrapper>
        )}

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 36 }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : null}
            style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, visibility: step > 1 ? "visible" : "hidden" }}>
            ← Back
          </button>
          {step < 4 && step !== 1 && (
            <button onClick={() => setStep(s => s + 1)}
              style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              {step === 2 && !eventDate ? "Skip →" : "Next →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
  return (
    <ToolIntroWrapper
      toolId="timeline-picker"
      icon="📅"
      title="Event Timeline"
      tagline="Your personalised countdown to event day"
      description="Answer 4 quick questions and get a day-by-day action plan tailored to your event type, date, and services."
      steps={[
        { title: "Pick your event type", desc: "Birthday, wedding, corporate, and more." },
        { title: "Set your event date", desc: "We calculate your planning window." },
        { title: "Choose your services", desc: "Only relevant tasks will appear." },
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

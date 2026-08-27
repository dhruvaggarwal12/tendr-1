import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const gold = "#C47A2E";
const goldLt = "#CCAB4A";
const ink = "#2C1A0E";

// ── Type catalogue ─────────────────────────────────────────────────────────
const ARTIST_TYPES = [
  { value: "DJ",               emoji: "🎧", label: "DJ",              sub: "Open format, commercial, wedding" },
  { value: "Anchor",           emoji: "🎙️", label: "Anchor / Emcee", sub: "Wedding, corporate, award nights" },
  { value: "Emcee/Host",       emoji: "🎤", label: "Emcee / Host",   sub: "Stage hosting & live shows" },
  { value: "Band",             emoji: "🎸", label: "Band",            sub: "Live music — Bollywood, jazz, rock" },
  { value: "Singer",           emoji: "🎵", label: "Singer",          sub: "Solo vocalist, all genres" },
  { value: "Musician",         emoji: "🎻", label: "Musician",        sub: "Instrumentalist — piano, tabla, violin…" },
  { value: "Performer",        emoji: "🎭", label: "Performer",       sub: "Dance, acrobatics, specialty act" },
  { value: "Stand-up Comedian",emoji: "😄", label: "Stand-up Comedian", sub: "Corporate & private shows" },
  { value: "Magician",         emoji: "🪄", label: "Magician",        sub: "Close-up & stage magic" },
  { value: "AV Setup",         emoji: "📽️", label: "AV Setup",       sub: "Projector, LED wall, live streaming" },
];

const VENDOR_TYPES = [
  { value: "Decorator",        emoji: "🌸", label: "Decorator",       sub: "Floral, balloon, draping, lighting" },
  { value: "Caterer",          emoji: "🍽️", label: "Caterer",         sub: "Food service, live counters, buffet" },
  { value: "Photographer",     emoji: "📷", label: "Photographer",    sub: "Candid, traditional, pre-wedding" },
  { value: "Videographer",     emoji: "🎬", label: "Videographer",    sub: "Cinematic, reels, drone coverage" },
  { value: "Makeup Artist",    emoji: "💄", label: "Makeup Artist",   sub: "Bridal, party, editorial looks" },
  { value: "Tent & Furniture", emoji: "⛺", label: "Tent & Furniture", sub: "Shamiyana, chairs, stage, tables" },
  { value: "Gift & Favours",   emoji: "🎁", label: "Gift & Favours",  sub: "Return gifts, hampers, packaging" },
  { value: "Transportation",   emoji: "🚗", label: "Transportation",  sub: "Wedding cars, buses, logistics" },
  { value: "Security",         emoji: "🛡️", label: "Security",       sub: "Event security & crowd management" },
  { value: "Other",            emoji: "💼", label: "Other",           sub: "Describe your service below" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const inp = (focus, err) => ({
  width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 15, fontFamily: font,
  color: ink, background: "#fff", outline: "none", boxSizing: "border-box",
  border: `1.5px solid ${err ? "#c0392b" : focus ? gold : "rgba(196,122,46,0.3)"}`,
  transition: "border-color 0.18s",
});
const lbl = { display: "block", fontSize: 13, fontWeight: 600, color: "#6B3A1F", marginBottom: 6, fontFamily: font };
const err = { fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: font };

function Field({ label, required, error, children }) {
  return (
    <div>
      <label style={lbl}>{label} {required ? <span style={{ color: gold }}>*</span> : <span style={{ color: "#aaa", fontWeight: 400 }}>(optional)</span>}</label>
      {children}
      {error && <p style={err}>{error}</p>}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function VendorRegistration() {
  const navigate = useNavigate();

  // step 1 = pick category (artist/vendor), step 2 = pick specific type, step 3 = fill form
  const [step, setStep]     = useState(1);
  const [category, setCategory] = useState(""); // "artist" | "vendor"
  const [form, setForm]     = useState({ name: "", phoneNumber: "", whatsappNumber: "", email: "", address: "", serviceType: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError]   = useState("");
  const [focused, setFocused]     = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name = "Name is required";
    if (!form.phoneNumber.trim())  e.phoneNumber = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) e.phoneNumber = "Enter a valid 10-digit number";
    if (!form.whatsappNumber.trim()) e.whatsappNumber = "WhatsApp number is required";
    else if (!/^[6-9]\d{9}$/.test(form.whatsappNumber)) e.whatsappNumber = "Enter a valid 10-digit number";
    if (!form.address.trim())      e.address = "Address is required";
    if (!form.serviceType)         e.serviceType = "Please select your service type";
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
      const res = await fetch(`${BASE_URL}/vendor-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      setSubmitted(true);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    const tc = [...ARTIST_TYPES, ...VENDOR_TYPES].find(t => t.value === form.serviceType);
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#FFF8F2,#F5E6CC)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: font }}>
        <div style={{ background: "#FFFCF5", borderRadius: 24, padding: "52px 36px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(139,69,19,0.1)" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>{tc?.emoji || "✓"}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: ink, margin: "0 0 10px" }}>Application Submitted!</h2>
          <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 100, background: "rgba(196,122,46,0.1)", color: gold, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>{form.serviceType}</div>
          <p style={{ fontSize: 15, color: "#9B7450", margin: "0 0 28px", lineHeight: 1.65 }}>
            Thank you, {form.name.split(" ")[0]}! Our team will review your details and reach you on WhatsApp within 24–48 hours.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/vendor/status")} style={{ background: "transparent", color: gold, border: `1.5px solid rgba(196,122,46,0.4)`, borderRadius: 12, padding: "11px 24px", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>Check Status</button>
            <button onClick={() => navigate("/")} style={{ background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", borderRadius: 12, padding: "11px 24px", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: Artist or Vendor? ─────────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#FFF8F2,#F5E6CC)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: font }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 10 }}>Partner with Tendr</p>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 900, color: ink, letterSpacing: "-0.02em", margin: "0 0 10px", lineHeight: 1.15 }}>How do you earn?</h1>
            <p style={{ fontSize: 15, color: "#9B7450", margin: 0 }}>Pick the type that best describes what you do — your dashboard will be set up for you.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              {
                key: "artist",
                emoji: "🎤",
                title: "Individual Artist",
                sub: "DJ · Anchor · Singer · Band · Emcee · Musician · Performer · Comedian · Magician · AV",
                color: "rgba(124,58,237,0.07)",
                border: "rgba(124,58,237,0.18)",
                accent: "#7C3AED",
              },
              {
                key: "vendor",
                emoji: "🏢",
                title: "Business / Vendor",
                sub: "Decorator · Caterer · Photographer · Videographer · Makeup · Tent · Gifts · Transport",
                color: "rgba(196,122,46,0.07)",
                border: "rgba(196,122,46,0.22)",
                accent: gold,
              },
            ].map(c => (
              <button
                key={c.key}
                onClick={() => { setCategory(c.key); setStep(2); }}
                style={{ padding: "18px 16px", borderRadius: 16, border: `1.5px solid ${c.border}`, background: c.color, cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${c.border}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ fontSize: 26, marginBottom: 8 }}>{c.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: ink, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "#9B7450", lineHeight: 1.55 }}>{c.sub}</div>
                <div style={{ marginTop: 12, fontSize: 11.5, fontWeight: 700, color: c.accent }}>I'm this →</div>
              </button>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 13, color: "#9B7450", marginTop: 24 }}>
            Already listed?{" "}
            <span onClick={() => navigate("/login")} style={{ color: gold, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Step 2: Pick specific type ────────────────────────────────────────────
  if (step === 2) {
    const types = category === "artist" ? ARTIST_TYPES : VENDOR_TYPES;
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#FFF8F2,#F5E6CC)", padding: "40px 24px 60px", fontFamily: font }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {/* Back */}
          <button onClick={() => setStep(1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 28, padding: 0 }}>
            ← Back
          </button>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>
              {category === "artist" ? "Individual Artist" : "Business / Vendor"}
            </p>
            <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 900, color: ink, margin: "0 0 8px" }}>What's your specialty?</h1>
            <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Pick your service type — your profile and dashboard will be tailored for you.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))", gap: 8 }}>
            {types.map(t => (
              <button
                key={t.value}
                onClick={() => { setForm(f => ({ ...f, serviceType: t.value })); setStep(3); }}
                style={{ padding: "12px 12px", borderRadius: 12, border: `1.5px solid rgba(196,122,46,0.18)`, background: "#FFFCF5", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", display: "flex", gap: 10, alignItems: "flex-start" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.background = "rgba(196,122,46,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.18)"; e.currentTarget.style.background = "#FFFCF5"; e.currentTarget.style.transform = ""; }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: ink, marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 10.5, color: "#9B7450", lineHeight: 1.45 }}>{t.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 3: Details form ──────────────────────────────────────────────────
  const tc = [...ARTIST_TYPES, ...VENDOR_TYPES].find(t => t.value === form.serviceType);
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#FFF8F2,#F5E6CC)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: font }}>
      <div style={{ width: "100%", maxWidth: 540 }}>

        {/* Back */}
        <button onClick={() => setStep(2)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ width: s === 3 ? 24 : 8, height: 8, borderRadius: 100, background: s === 3 ? `linear-gradient(90deg,${gold},${goldLt})` : "rgba(196,122,46,0.2)", transition: "all 0.3s" }} />
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {tc && <div style={{ fontSize: 28, marginBottom: 8 }}>{tc.emoji}</div>}
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 900, color: ink, margin: "0 0 6px" }}>
            {form.serviceType || "Your Details"}
          </h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Almost done — fill in your contact details and we'll be in touch soon.</p>
        </div>

        {/* Form card */}
        <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "22px 20px", boxShadow: "0 4px 24px rgba(139,69,19,0.08)", border: "1px solid rgba(196,122,46,0.1)" }}>
          {apiError && (
            <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <Field label="Full Name" required error={errors.name}>
              <input name="name" type="text" placeholder="e.g. Rahul Sharma" value={form.name} onChange={handleChange}
                onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                style={inp(focused === "name", errors.name)} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Phone Number" required error={errors.phoneNumber}>
                <input name="phoneNumber" type="tel" placeholder="10-digit number" value={form.phoneNumber} onChange={handleChange}
                  onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")} maxLength={10}
                  style={inp(focused === "phoneNumber", errors.phoneNumber)} />
              </Field>
              <Field label="WhatsApp Number" required error={errors.whatsappNumber}>
                <input name="whatsappNumber" type="tel" placeholder="10-digit number" value={form.whatsappNumber} onChange={handleChange}
                  onFocus={() => setFocused("whatsappNumber")} onBlur={() => setFocused("")} maxLength={10}
                  style={inp(focused === "whatsappNumber", errors.whatsappNumber)} />
              </Field>
            </div>

            <Field label="Email Address" error={errors.email}>
              <input name="email" type="email" placeholder="e.g. rahul@example.com" value={form.email} onChange={handleChange}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                style={inp(focused === "email", errors.email)} />
            </Field>

            <Field label="City / Area you serve" required error={errors.address}>
              <textarea name="address" placeholder="e.g. South Delhi, Noida, Gurgaon" value={form.address} onChange={handleChange}
                onFocus={() => setFocused("address")} onBlur={() => setFocused("")} rows={2}
                style={{ ...inp(focused === "address", errors.address), resize: "vertical" }} />
            </Field>

            {/* Selected type chip */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.18)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{tc?.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{form.serviceType}</div>
                  <div style={{ fontSize: 11, color: "#9B7450" }}>Your service type</div>
                </div>
              </div>
              <button type="button" onClick={() => setStep(2)} style={{ fontSize: 12, fontWeight: 600, color: gold, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>Change</button>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: loading ? "#e5e7eb" : `linear-gradient(135deg,${gold},${goldLt})`, color: loading ? "#9ca3af" : "#fff", fontSize: 16, fontWeight: 700, fontFamily: font, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(196,122,46,0.35)", transition: "all 0.2s", marginTop: 4 }}>
              {loading ? "Submitting…" : "Submit Application →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#9B7450", marginTop: 16 }}>Free to register · No monthly fee · No commission on bookings</p>
        <p style={{ textAlign: "center", fontSize: 13, color: "#9B7450", marginTop: 8 }}>
          Already a partner?{" "}
          <span onClick={() => navigate("/login")} style={{ color: gold, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font  = "'Outfit', sans-serif";
const gold  = "#C47A2E";
const ink   = "#1C0E04";
const muted = "#7A5535";

const ARTIST_TYPES = [
  { value: "DJ",               label: "DJ",               sub: "Open format, commercial, wedding" },
  { value: "Anchor",           label: "Anchor / Emcee",   sub: "Wedding, corporate, award nights" },
  { value: "Emcee/Host",       label: "Emcee / Host",     sub: "Stage hosting & live shows" },
  { value: "Band",             label: "Band",             sub: "Live music — Bollywood, jazz, rock" },
  { value: "Singer",           label: "Singer",           sub: "Solo vocalist, all genres" },
  { value: "Musician",         label: "Musician",         sub: "Instrumentalist — piano, tabla, violin" },
  { value: "Performer",        label: "Performer",        sub: "Dance, acrobatics, specialty act" },
  { value: "Stand-up Comedian",label: "Stand-up Comedian",sub: "Corporate & private shows" },
  { value: "Magician",         label: "Magician",         sub: "Close-up & stage magic" },
  { value: "AV Setup",         label: "AV Setup",         sub: "Projector, LED wall, live streaming" },
];

const VENDOR_TYPES = [
  { value: "Decorator",        label: "Decorator",        sub: "Floral, balloon, draping, lighting" },
  { value: "Caterer",          label: "Caterer",          sub: "Food service, live counters, buffet" },
  { value: "Photographer",     label: "Photographer",     sub: "Candid, traditional, pre-wedding" },
  { value: "Videographer",     label: "Videographer",     sub: "Cinematic, reels, drone coverage" },
  { value: "Makeup Artist",    label: "Makeup Artist",    sub: "Bridal, party, editorial looks" },
  { value: "Tent & Furniture", label: "Tent & Furniture", sub: "Shamiyana, chairs, stage, tables" },
  { value: "Gift & Favours",   label: "Gift & Favours",   sub: "Return gifts, hampers, packaging" },
  { value: "Transportation",   label: "Transportation",   sub: "Wedding cars, buses, logistics" },
  { value: "Security",         label: "Security",         sub: "Event security & crowd management" },
  { value: "Other",            label: "Other",            sub: "Describe your service below" },
];

const TRUST = [
  { n: "0%", label: "Commission", sub: "We never take a cut from your bookings" },
  { n: "Free", label: "To list", sub: "No monthly fees, no hidden charges" },
  { n: "24 hrs", label: "Review time", sub: "Our team reviews every application fast" },
];

function StepBar({ step }) {
  const steps = ["Category", "Specialty", "Details"];
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
                {done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : s}
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

function Shell({ children, step, narrow = true }) {
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

        {/* ── Left brand panel (desktop only) ── */}
        <div className="reg-side" style={{
          display: "none",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1C0E04",
          padding: "52px 36px",
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#F5ECD8", letterSpacing: "-0.01em", marginBottom: 8 }}>tendr</div>
            <div style={{ width: 32, height: 2, background: gold, borderRadius: 2, marginBottom: 32 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem,2.5vw,2.2rem)", fontWeight: 500, color: "#F5ECD8", lineHeight: 1.2, margin: "0 0 16px", fontStyle: "italic" }}>
              Get discovered by thousands of event planners in Delhi NCR.
            </h2>
            <p style={{ fontSize: 14, color: "rgba(245,236,216,0.55)", lineHeight: 1.7, margin: 0 }}>
              Join Tendr's verified vendor network — real clients, real bookings, zero commission.
            </p>
          </div>

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
        </div>

        {/* ── Right content ── */}
        <div className="reg-main" style={{ padding: "36px 20px 60px", maxWidth: narrow ? 540 : "100%", margin: narrow ? "0 auto" : 0 }}>
          <StepBar step={step} />
          {children}
        </div>
      </div>
    </div>
  );
}

export default function VendorRegistration() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [category, setCategory] = useState("");
  const [form, setForm]       = useState({ name: "", phoneNumber: "", whatsappNumber: "", email: "", address: "", serviceType: "" });
  const [errors, setErrors]   = useState({});
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

  const inputStyle = (field) => ({
    width: "100%", padding: "13px 16px", borderRadius: 10, fontSize: 15, fontFamily: font,
    color: ink, background: "#fff", outline: "none", boxSizing: "border-box",
    border: `1.5px solid ${errors[field] ? "#c0392b" : focused === field ? gold : "rgba(28,14,4,0.14)"}`,
    transition: "border-color 0.18s",
  });

  // ── Success ──────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9F6F1", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: font }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 36px", maxWidth: 440, width: "100%", textAlign: "center", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 4px 24px rgba(28,14,4,0.07)" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(196,122,46,0.1)", border: `2px solid rgba(196,122,46,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: ink, margin: "0 0 10px" }}>Application Submitted</h2>
          <p style={{ fontSize: 14, color: muted, margin: "0 0 28px", lineHeight: 1.65 }}>
            Thank you, <strong>{form.name.split(" ")[0]}</strong>. Our team will review your details and reach you on WhatsApp within 24–48 hours.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/vendor/status")} style={{ background: "#fff", color: gold, border: `1.5px solid rgba(196,122,46,0.4)`, borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>Check Status</button>
            <button onClick={() => navigate("/")} style={{ background: gold, color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: Artist or Vendor ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <Shell step={1}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Partner with Tendr</p>
          <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: ink, letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.2 }}>How do you earn?</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>Pick the type that best describes what you do.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            {
              key: "artist",
              title: "Individual Artist",
              sub: "DJ · Anchor · Singer · Band · Emcee · Musician · Performer · Comedian · Magician · AV",
              icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
            },
            {
              key: "vendor",
              title: "Business / Vendor",
              sub: "Decorator · Caterer · Photographer · Videographer · Makeup · Tent · Gifts · Transport",
              icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
            },
          ].map(c => (
            <button
              key={c.key}
              onClick={() => { setCategory(c.key); setStep(2); }}
              style={{ padding: "22px 18px", borderRadius: 14, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = `0 6px 24px rgba(196,122,46,0.14)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ marginBottom: 14 }}>{c.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: ink, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 11.5, color: muted, lineHeight: 1.55 }}>{c.sub}</div>
              <div style={{ marginTop: 14, fontSize: 12, fontWeight: 600, color: gold }}>I'm this →</div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: muted, marginTop: 24 }}>
          Already listed?{" "}
          <span onClick={() => navigate("/login")} style={{ color: gold, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
        </p>

        {/* Mobile trust signals */}
        <div style={{ marginTop: 36, paddingTop: 24, borderTop: "1px solid rgba(28,14,4,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-around", gap: 8 }}>
            {TRUST.map(t => (
              <div key={t.n} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: gold, marginBottom: 2 }}>{t.n}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: ink }}>{t.label}</div>
                <div style={{ fontSize: 10, color: muted, lineHeight: 1.4 }}>{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  // ── Step 2: Pick specific type ────────────────────────────────────────────────
  if (step === 2) {
    const types = category === "artist" ? ARTIST_TYPES : VENDOR_TYPES;
    return (
      <Shell step={2} narrow={false}>
        <button onClick={() => setStep(1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>
            {category === "artist" ? "Individual Artist" : "Business / Vendor"}
          </p>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, color: ink, margin: "0 0 6px" }}>What's your specialty?</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>Choose your service type — your profile will be tailored for you.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {types.map(t => (
            <button
              key={t.value}
              onClick={() => { setForm(f => ({ ...f, serviceType: t.value })); setStep(3); }}
              style={{ padding: "14px 14px", borderRadius: 12, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 3px rgba(28,14,4,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.background = "rgba(196,122,46,0.03)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(28,14,4,0.04)"; }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: ink, marginBottom: 3 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: muted, lineHeight: 1.45 }}>{t.sub}</div>
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  // ── Step 3: Details form ──────────────────────────────────────────────────────
  const tc = [...ARTIST_TYPES, ...VENDOR_TYPES].find(t => t.value === form.serviceType);
  return (
    <Shell step={3}>
      <button onClick={() => setStep(2)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 20, padding: 0 }}>
        ← Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 4px" }}>
          {form.serviceType}
        </h1>
        <p style={{ fontSize: 14, color: muted, margin: 0 }}>Fill in your contact details — we'll reach you on WhatsApp.</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 2px 12px rgba(28,14,4,0.05)" }}>
        {apiError && (
          <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 6, fontFamily: font }}>
              Full Name <span style={{ color: gold }}>*</span>
            </label>
            <input name="name" type="text" placeholder="e.g. Rahul Sharma" value={form.name} onChange={handleChange}
              onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
              style={inputStyle("name")} />
            {errors.name && <p style={{ fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: font }}>{errors.name}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 6, fontFamily: font }}>
                Phone <span style={{ color: gold }}>*</span>
              </label>
              <input name="phoneNumber" type="tel" placeholder="10-digit number" value={form.phoneNumber} onChange={handleChange}
                onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")} maxLength={10}
                style={inputStyle("phoneNumber")} />
              {errors.phoneNumber && <p style={{ fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: font }}>{errors.phoneNumber}</p>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 6, fontFamily: font }}>
                WhatsApp <span style={{ color: gold }}>*</span>
              </label>
              <input name="whatsappNumber" type="tel" placeholder="10-digit number" value={form.whatsappNumber} onChange={handleChange}
                onFocus={() => setFocused("whatsappNumber")} onBlur={() => setFocused("")} maxLength={10}
                style={inputStyle("whatsappNumber")} />
              {errors.whatsappNumber && <p style={{ fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: font }}>{errors.whatsappNumber}</p>}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 6, fontFamily: font }}>
              Email <span style={{ color: "#aaa", fontWeight: 400 }}>(optional)</span>
            </label>
            <input name="email" type="email" placeholder="e.g. rahul@example.com" value={form.email} onChange={handleChange}
              onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
              style={inputStyle("email")} />
            {errors.email && <p style={{ fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: font }}>{errors.email}</p>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 6, fontFamily: font }}>
              City / Area you serve <span style={{ color: gold }}>*</span>
            </label>
            <textarea name="address" placeholder="e.g. South Delhi, Noida, Gurgaon" value={form.address} onChange={handleChange}
              onFocus={() => setFocused("address")} onBlur={() => setFocused("")} rows={2}
              style={{ ...inputStyle("address"), resize: "vertical" }} />
            {errors.address && <p style={{ fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: font }}>{errors.address}</p>}
          </div>

          {/* Selected type chip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "#F9F6F1", border: "1px solid rgba(28,14,4,0.09)" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{form.serviceType}</div>
              <div style={{ fontSize: 11, color: muted }}>Your service type</div>
            </div>
            <button type="button" onClick={() => setStep(2)} style={{ fontSize: 12, fontWeight: 600, color: gold, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>Change</button>
          </div>

          {errors.serviceType && <p style={{ fontSize: 12, color: "#c0392b", fontFamily: font }}>{errors.serviceType}</p>}

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "#e5e7eb" : gold, color: loading ? "#9ca3af" : "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(196,122,46,0.3)", transition: "all 0.2s" }}>
            {loading ? "Submitting…" : "Submit Application →"}
          </button>
        </form>
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 16 }}>Free to register · No monthly fee · No commission</p>
      <p style={{ textAlign: "center", fontSize: 13, color: muted, marginTop: 6 }}>
        Already a partner?{" "}
        <span onClick={() => navigate("/login")} style={{ color: gold, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
      </p>
    </Shell>
  );
}

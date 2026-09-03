import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logos/tendr-logo-secondary.png";

const BASE = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const gold = "#C47A2E";
const ink = "#2C1A0E";
const cream = "#FFFCF5";
const muted = "#9B7450";

const SPECIALIZATIONS = [
  "Wedding", "Birthday Party", "Corporate Event", "Baby Shower",
  "Anniversary", "Engagement", "Cocktail Party", "Graduation",
  "Festival Event", "Product Launch", "Charity Gala", "Conference",
];

const EVENT_RANGE = ["1–3", "4–8", "9–15", "16–25", "25+"];

function StepDot({ step, current }) {
  const done = current > step;
  const active = current === step;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, fontFamily: font,
      background: done ? gold : active ? "#fff" : "#f3ede6",
      color: done ? "#fff" : active ? gold : "#B8956A",
      border: active ? `2px solid ${gold}` : done ? `2px solid ${gold}` : "2px solid #E5D5C0",
      transition: "all 0.25s",
      flexShrink: 0,
    }}>
      {done ? "✓" : step}
    </div>
  );
}

function StepBar({ step }) {
  const labels = ["About You", "Experience", "Credentials"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36 }}>
      {labels.map((label, i) => {
        const s = i + 1;
        return (
          <React.Fragment key={s}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <StepDot step={s} current={step} />
              <span style={{ fontSize: 10, fontWeight: 600, color: step === s ? gold : muted, fontFamily: font, whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ height: 2, flex: 1, background: step > s ? gold : "#E5D5C0", margin: "0 8px 18px", transition: "background 0.3s" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: ink, fontFamily: font }}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: 11, color: muted, fontFamily: font }}>{hint}</span>}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  border: "1.5px solid #E5D5C0", background: "#FFFEF9",
  fontFamily: font, fontSize: 14, color: ink, outline: "none",
  boxSizing: "border-box",
};

export default function CoordinatorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", city: "",
    experience: "", eventsPerMonth: "", specializations: [],
    bio: "", portfolio: "", instagram: "",
    password: "", confirmPassword: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleSpec = (s) => set("specializations",
    form.specializations.includes(s)
      ? form.specializations.filter(x => x !== s)
      : [...form.specializations, s]
  );

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!form.name.trim()) return setError("Full name is required") || false;
      if (!/^[0-9]{10}$/.test(form.phone)) return setError("Enter a valid 10-digit phone number") || false;
      if (!form.email.includes("@")) return setError("Enter a valid email address") || false;
      if (!form.city.trim()) return setError("City is required") || false;
    }
    if (step === 2) {
      if (!form.experience) return setError("Years of experience is required") || false;
      if (!form.eventsPerMonth) return setError("Please select events handled per month") || false;
      if (!form.specializations.length) return setError("Select at least one specialization") || false;
    }
    if (step === 3) {
      if (!form.bio.trim() || form.bio.trim().length < 40) return setError("Bio must be at least 40 characters") || false;
      if (!form.password || form.password.length < 8) return setError("Password must be at least 8 characters") || false;
      if (form.password !== form.confirmPassword) return setError("Passwords do not match") || false;
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => { setError(""); setStep(s => s - 1); };

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${BASE}/coordinators/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phoneNumber: form.phone,
          email: form.email.trim().toLowerCase(),
          city: form.city.trim(),
          experience: Number(form.experience),
          eventsPerMonth: form.eventsPerMonth,
          specializations: form.specializations,
          bio: form.bio.trim(),
          portfolioLink: form.portfolio.trim(),
          instagram: form.instagram.trim(),
          password: form.password,
        }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      setSubmitted(true);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, padding: "24px" }}>
      <div style={{ background: cream, borderRadius: 20, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(44,26,14,0.10)" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: ink, marginBottom: 12 }}>Application Submitted!</h2>
        <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, marginBottom: 28 }}>
          Thank you, <strong style={{ color: ink }}>{form.name}</strong>! Our team will review your application and get back to you within 24–48 hours. You'll receive a WhatsApp message on <strong>{form.phone}</strong> once approved.
        </p>
        <div style={{ background: "#FFF8EE", borderRadius: 12, padding: "16px 20px", border: "1.5px solid rgba(196,122,46,0.2)", marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: muted, margin: 0 }}>Already approved?</p>
          <button onClick={() => navigate("/coordinator/login")} style={{ marginTop: 6, background: "none", border: "none", color: gold, fontFamily: font, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Log in to your dashboard →</button>
        </div>
        <button onClick={() => navigate("/")} style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 32px", fontFamily: font, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      {/* Header */}
      <div style={{ background: ink, padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <img src={logo} alt="Tendr" style={{ height: 28, cursor: "pointer" }} onClick={() => navigate("/")} />
          <button onClick={() => navigate("/coordinator/login")} style={{ background: "none", border: "1.5px solid rgba(196,122,46,0.5)", borderRadius: 8, padding: "6px 16px", color: "#CCAB4A", fontFamily: font, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Login</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 10 }}>Join Tendr's Network</p>
          <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 900, color: ink, letterSpacing: "-0.02em", margin: "0 0 12px" }}>Register as Event Coordinator</h1>
          <p style={{ fontSize: 15, color: muted, maxWidth: 520, margin: "0 auto" }}>Get exclusive leads from Tendr's admin team, manage bookings through your own dashboard, and earn with every confirmed event.</p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            {[["🎯", "Curated Leads"], ["💰", "Wallet Earnings"], ["📊", "Your Dashboard"], ["🔗", "Referral Code"]].map(([icon, label]) => (
              <div key={label} style={{ fontSize: 13, color: muted, fontWeight: 600 }}>{icon} {label}</div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: cream, borderRadius: 20, padding: "clamp(24px,4vw,44px)", boxShadow: "0 4px 28px rgba(44,26,14,0.08)" }}>
          <StepBar step={step} />

          {/* Step 1: About You */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: ink, margin: "0 0 4px" }}>Tell us about yourself</h2>
              <p style={{ fontSize: 13, color: muted, margin: "0 0 8px" }}>Basic contact information so we can reach you.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Full Name *">
                  <input style={inputStyle} placeholder="e.g. Priya Sharma" value={form.name} onChange={e => set("name", e.target.value)} />
                </Field>
                <Field label="Phone Number *">
                  <input style={inputStyle} placeholder="10-digit mobile" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g,"").slice(0,10))} />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Email Address *">
                  <input style={inputStyle} type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </Field>
                <Field label="City *">
                  <input style={inputStyle} placeholder="e.g. New Delhi, Gurugram" value={form.city} onChange={e => set("city", e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: ink, margin: "0 0 4px" }}>Your experience</h2>
              <p style={{ fontSize: 13, color: muted, margin: "0 0 8px" }}>Help us understand your background and capacity.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Years of Experience *">
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.experience} onChange={e => set("experience", e.target.value)}>
                    <option value="">Select years</option>
                    {["0–1","1–2","2–5","5–10","10+"].map(v => <option key={v} value={v}>{v} years</option>)}
                  </select>
                </Field>
                <Field label="Events Handled per Month *">
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.eventsPerMonth} onChange={e => set("eventsPerMonth", e.target.value)}>
                    <option value="">Select range</option>
                    {EVENT_RANGE.map(v => <option key={v} value={v}>{v} events</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Specializations * — Select all that apply">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {SPECIALIZATIONS.map(s => {
                    const active = form.specializations.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggleSpec(s)}
                        style={{ padding: "7px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer", border: active ? "none" : "1.5px solid #E5D5C0", background: active ? gold : "#fff", color: active ? "#fff" : muted, transition: "all 0.15s" }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          )}

          {/* Step 3: Credentials */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: ink, margin: "0 0 4px" }}>Your profile & credentials</h2>
              <p style={{ fontSize: 13, color: muted, margin: "0 0 8px" }}>Tell clients who you are. Set a password to access your dashboard.</p>
              <Field label="About You *" hint="Minimum 40 characters — describe your style, approach, and what makes you great.">
                <textarea style={{ ...inputStyle, height: 100, resize: "vertical" }} placeholder="I specialize in luxury weddings and corporate events across Delhi NCR with a focus on intricate floral decor and seamless logistics..." value={form.bio} onChange={e => set("bio", e.target.value)} />
                <span style={{ fontSize: 11, color: form.bio.length >= 40 ? "#16a34a" : muted, fontFamily: font }}>{form.bio.length}/40 min characters</span>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Portfolio / Website" hint="Optional">
                  <input style={inputStyle} placeholder="https://yourportfolio.com" value={form.portfolio} onChange={e => set("portfolio", e.target.value)} />
                </Field>
                <Field label="Instagram Handle" hint="Optional">
                  <input style={inputStyle} placeholder="@yourhandle" value={form.instagram} onChange={e => set("instagram", e.target.value)} />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Password *" hint="Minimum 8 characters">
                  <input style={inputStyle} type="password" placeholder="Create a strong password" value={form.password} onChange={e => set("password", e.target.value)} />
                </Field>
                <Field label="Confirm Password *">
                  <input style={inputStyle} type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: "#FFF1F1", border: "1.5px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", marginTop: 16, fontSize: 13, color: "#DC2626", fontFamily: font }}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 12 }}>
            {step > 1
              ? <button onClick={back} style={{ padding: "12px 28px", borderRadius: 12, border: "1.5px solid #E5D5C0", background: "#fff", color: muted, fontFamily: font, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
              : <div />
            }
            {step < 3
              ? <button onClick={next} style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontFamily: font, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Continue →</button>
              : <button onClick={submit} disabled={loading} style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: loading ? "#D4B483" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontFamily: font, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Submitting…" : "Submit Application"}</button>
            }
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: muted }}>
          Already registered?{" "}
          <button onClick={() => navigate("/coordinator/login")} style={{ background: "none", border: "none", color: gold, fontFamily: font, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Log in here →</button>
        </p>
      </div>
    </div>
  );
}

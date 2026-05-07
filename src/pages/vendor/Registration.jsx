import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const inputStyle = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  border: "1.5px solid rgba(196,122,46,0.3)",
  fontSize: 15,
  fontFamily: font,
  color: "#2C1A0E",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.18s",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#6B3A1F",
  marginBottom: 6,
  fontFamily: font,
};

const errorStyle = { fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: font };

const Field = ({ label, required, error, children }) => (
  <div>
    <label style={labelStyle}>
      {label} {required ? <span style={{ color: "#C47A2E" }}>*</span> : <span style={{ color: "#aaa", fontWeight: 400 }}>(optional)</span>}
    </label>
    {children}
    {error && <p style={errorStyle}>{error}</p>}
  </div>
);

export default function VendorRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phoneNumber: "", whatsappNumber: "", email: "", address: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [focused, setFocused] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) e.phoneNumber = "Enter a valid 10-digit number";
    if (!form.whatsappNumber.trim()) e.whatsappNumber = "WhatsApp number is required";
    else if (!/^[6-9]\d{9}$/.test(form.whatsappNumber)) e.whatsappNumber = "Enter a valid 10-digit number";
    if (!form.address.trim()) e.address = "Address is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    return e;
  };

  const borderColor = (field) =>
    errors[field] ? "#c0392b" : focused === field ? "#C47A2E" : "rgba(196,122,46,0.3)";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
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
          data.errors.forEach((err) => { mapped[err.param || err.path] = err.msg; });
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

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: font }}>
        <div style={{ background: "#FFFCF5", borderRadius: 24, padding: "52px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(139,69,19,0.1)" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 32, color: "#fff" }}>✓</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#2C1A0E", margin: "0 0 12px" }}>Application Submitted!</h2>
          <p style={{ fontSize: 15, color: "#9B7450", margin: "0 0 24px", lineHeight: 1.6 }}>
            Thank you! Our team will review your details and get in touch on WhatsApp or email within 24–48 hours.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/vendor/status")} style={{ background: "transparent", color: "#C47A2E", border: "1.5px solid rgba(196,122,46,0.4)", borderRadius: 12, padding: "11px 24px", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
              Check Status
            </button>
            <button onClick={() => navigate("/")} style={{ background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 24px", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: font }}>
      <div style={{ width: "100%", maxWidth: 540 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Partner with Tendr</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 10px", lineHeight: 1.2 }}>List Your Service</h1>
          <p style={{ fontSize: 15, color: "#9B7450", margin: 0 }}>Fill in your details and we'll be in touch soon.</p>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg, #C47A2E, #CCAB4A)", borderRadius: 100, margin: "18px auto 0" }} />
        </div>

        {/* Form card */}
        <div style={{ background: "#FFFCF5", borderRadius: 24, padding: "36px 32px", boxShadow: "0 8px 40px rgba(139,69,19,0.1)", border: "1px solid rgba(196,122,46,0.1)" }}>
          {apiError && (
            <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <Field label="Full Name" required error={errors.name}>
              <input name="name" type="text" placeholder="e.g. Rahul Sharma" value={form.name} onChange={handleChange}
                onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                style={{ ...inputStyle, borderColor: borderColor("name") }} />
            </Field>

            {/* Phone + WhatsApp side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Phone Number" required error={errors.phoneNumber}>
                <input name="phoneNumber" type="tel" placeholder="10-digit number" value={form.phoneNumber} onChange={handleChange}
                  onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")} maxLength={10}
                  style={{ ...inputStyle, borderColor: borderColor("phoneNumber") }} />
              </Field>
              <Field label="WhatsApp Number" required error={errors.whatsappNumber}>
                <input name="whatsappNumber" type="tel" placeholder="10-digit number" value={form.whatsappNumber} onChange={handleChange}
                  onFocus={() => setFocused("whatsappNumber")} onBlur={() => setFocused("")} maxLength={10}
                  style={{ ...inputStyle, borderColor: borderColor("whatsappNumber") }} />
              </Field>
            </div>

            <Field label="Email Address" required={false} error={errors.email}>
              <input name="email" type="email" placeholder="e.g. rahul@example.com" value={form.email} onChange={handleChange}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                style={{ ...inputStyle, borderColor: borderColor("email") }} />
            </Field>

            <Field label="Address" required error={errors.address}>
              <textarea name="address" placeholder="Your business / service address" value={form.address} onChange={handleChange}
                onFocus={() => setFocused("address")} onBlur={() => setFocused("")} rows={3}
                style={{ ...inputStyle, resize: "vertical", borderColor: borderColor("address") }} />
            </Field>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: loading ? "#e5e7eb" : "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: loading ? "#9ca3af" : "#fff", fontSize: 16, fontWeight: 700, fontFamily: font, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(196,122,46,0.35)", transition: "all 0.2s", marginTop: 4 }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#9B7450", marginTop: 20 }}>
          Already a partner?{" "}
          <span onClick={() => navigate("/login")} style={{ color: "#C47A2E", fontWeight: 600, cursor: "pointer" }}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

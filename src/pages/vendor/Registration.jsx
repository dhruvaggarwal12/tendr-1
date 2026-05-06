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

const errorStyle = {
  fontSize: 12,
  color: "#c0392b",
  marginTop: 4,
  fontFamily: font,
};

export default function VendorRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", address: "" });
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
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid 10-digit phone number";
    }
    if (!form.address.trim()) newErrors.address = "Address is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
        if (res.status === 409) {
          setApiError(data.message || "Application already exists with this email or phone.");
        } else if (data.errors) {
          const mapped = {};
          data.errors.forEach((err) => { mapped[err.param] = err.msg; });
          setErrors(mapped);
        } else {
          setApiError(data.message || "Submission failed. Please try again.");
        }
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
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: font,
        }}
      >
        <div
          style={{
            background: "#FFFCF5",
            borderRadius: 24,
            padding: "52px 40px",
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 8px 40px rgba(139,69,19,0.1)",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 32,
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#2C1A0E",
              margin: "0 0 12px",
              letterSpacing: "-0.01em",
            }}
          >
            Application Submitted!
          </h2>
          <p style={{ fontSize: 15, color: "#9B7450", margin: "0 0 32px", lineHeight: 1.6 }}>
            Thank you for your interest in listing your service on Tendr. Our team will review your details and get in touch with you shortly.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "13px 32px",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: font,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(196,122,46,0.35)",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: font,
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#C47A2E",
              marginBottom: 10,
            }}
          >
            Partner with Tendr
          </p>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              fontWeight: 900,
              color: "#2C1A0E",
              letterSpacing: "-0.02em",
              margin: "0 0 10px",
              lineHeight: 1.2,
            }}
          >
            List Your Service
          </h1>
          <p style={{ fontSize: 15, color: "#9B7450", margin: 0 }}>
            Tell us about yourself and we'll be in touch soon.
          </p>
          <div
            style={{
              width: 48,
              height: 3,
              background: "linear-gradient(90deg, #C47A2E, #CCAB4A)",
              borderRadius: 100,
              margin: "18px auto 0",
            }}
          />
        </div>

        {/* Form card */}
        <div
          style={{
            background: "#FFFCF5",
            borderRadius: 24,
            padding: "36px 32px",
            boxShadow: "0 8px 40px rgba(139,69,19,0.1)",
            border: "1px solid rgba(196,122,46,0.1)",
          }}
        >
          {apiError && (
            <div
              style={{
                background: "#fff5f5",
                border: "1px solid #fca5a5",
                borderRadius: 10,
                padding: "11px 16px",
                fontSize: 13,
                color: "#c0392b",
                marginBottom: 20,
                fontFamily: font,
              }}
            >
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                name="name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={handleChange}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused("")}
                style={{
                  ...inputStyle,
                  borderColor: errors.name
                    ? "#c0392b"
                    : focused === "name"
                    ? "#C47A2E"
                    : "rgba(196,122,46,0.3)",
                }}
              />
              {errors.name && <p style={errorStyle}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input
                name="email"
                type="email"
                placeholder="e.g. rahul@example.com"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                style={{
                  ...inputStyle,
                  borderColor: errors.email
                    ? "#c0392b"
                    : focused === "email"
                    ? "#C47A2E"
                    : "rgba(196,122,46,0.3)",
                }}
              />
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input
                name="phoneNumber"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phoneNumber}
                onChange={handleChange}
                onFocus={() => setFocused("phoneNumber")}
                onBlur={() => setFocused("")}
                maxLength={10}
                style={{
                  ...inputStyle,
                  borderColor: errors.phoneNumber
                    ? "#c0392b"
                    : focused === "phoneNumber"
                    ? "#C47A2E"
                    : "rgba(196,122,46,0.3)",
                }}
              />
              {errors.phoneNumber && <p style={errorStyle}>{errors.phoneNumber}</p>}
            </div>

            {/* Address */}
            <div>
              <label style={labelStyle}>Address *</label>
              <textarea
                name="address"
                placeholder="Your business / service address"
                value={form.address}
                onChange={handleChange}
                onFocus={() => setFocused("address")}
                onBlur={() => setFocused("")}
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  borderColor: errors.address
                    ? "#c0392b"
                    : focused === "address"
                    ? "#C47A2E"
                    : "rgba(196,122,46,0.3)",
                }}
              />
              {errors.address && <p style={errorStyle}>{errors.address}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: loading
                  ? "#e5e7eb"
                  : "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                color: loading ? "#9ca3af" : "#fff",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: font,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(196,122,46,0.35)",
                transition: "all 0.2s",
                marginTop: 4,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#9B7450",
            marginTop: 20,
          }}
        >
          Already registered?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#C47A2E", fontWeight: 600, cursor: "pointer" }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

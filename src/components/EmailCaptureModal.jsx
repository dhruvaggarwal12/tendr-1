import React, { useState } from "react";
import logo from "../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const BROWN = "#2C1A0E";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * EmailCaptureModal — lightweight, no-OTP email-only capture for soft
 * conversion points (e.g. "Save my budget plan", "Email me this timeline").
 * Not a full signup — just stores the email as a Lead for follow-up.
 *
 * Props:
 *   open      — boolean
 *   onClose   — called when dismissed without submitting
 *   onSuccess — called with the email after a successful capture
 *   source    — tag identifying which page triggered this (e.g. "budget-allocator")
 *   title     — heading text
 *   subtitle  — supporting text
 */
export default function EmailCaptureModal({ open, onClose, onSuccess, source = "", title, subtitle }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/leads/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source }),
      });
    } catch {}
    try { localStorage.setItem("tendr_lead_email", trimmed); } catch {}
    setLoading(false);
    onSuccess?.(trimmed);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 110000, backdropFilter: "blur(4px)" }}
      />
      <div
        style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          zIndex: 110001, background: "#FFFCF5", borderRadius: 20, width: "90%", maxWidth: 380,
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)", padding: "28px 26px", fontFamily: font,
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 20, color: "#9B7450", cursor: "pointer", lineHeight: 1 }}
        >
          ✕
        </button>

        <img src={logo} alt="Tendr" style={{ height: 28, marginBottom: 16 }} />

        <h3 style={{ fontSize: 18, fontWeight: 900, color: BROWN, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
          {title || "Enter your email to save this"}
        </h3>
        <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 18px", lineHeight: 1.5 }}>
          {subtitle || "We'll keep it safe — no spam, just your plan whenever you need it."}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            placeholder="you@example.com"
            style={{
              width: "100%", padding: "11px 14px", fontSize: 14, fontFamily: font,
              border: `1.5px solid ${error ? "#dc2626" : "rgba(139,69,19,0.22)"}`, borderRadius: 11,
              background: "#fff", color: BROWN, outline: "none", boxSizing: "border-box", marginBottom: 6,
            }}
          />
          {error && <p style={{ fontSize: 12, color: "#dc2626", margin: "0 0 10px" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", marginTop: 12, padding: "12px", borderRadius: 12, border: "none",
              background: loading ? "#e5e7eb" : `linear-gradient(135deg,${GOLD},#CCAB4A)`,
              color: loading ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: font, boxShadow: loading ? "none" : "0 4px 14px rgba(196,122,46,0.35)",
            }}
          >
            {loading ? "Saving…" : "Save →"}
          </button>
        </form>
      </div>
    </>
  );
}

import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import logo from "../../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const REASONS = [
  "Price was too high",
  "Found another vendor",
  "Plans changed / event cancelled",
  "Still deciding, haven't booked yet",
  "Couldn't find the right vendor",
  "Wasn't satisfied with vendor response",
  "Other",
];

export default function FeedbackForm() {
  const [params] = useSearchParams();
  const planId = params.get("planId") || "";

  const [selectedReasons, setSelectedReasons] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [improvement, setImprovement] = useState("");

  // Upcoming events
  const [upcomingEventType, setUpcomingEventType] = useState("");
  const [upcomingDate, setUpcomingDate]           = useState("");
  const [upcomingWhatsApp, setUpcomingWhatsApp]   = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleReason = (r) => {
    setSelectedReasons(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const body = {
        planId,
        type: "cancellation_feedback",
        reasons: selectedReasons,
        feedbackText: feedbackText.trim(),
        improvement: improvement.trim(),
        upcomingEventType,
        upcomingDate,
        upcomingWhatsApp,
      };
      const res = await fetch(`${BASE_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F4EF", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: font }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>🙏</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,5vw,2.4rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 12px" }}>
            Thank you for your feedback!
          </h1>
          <p style={{ fontSize: 14, color: "#9B7450", lineHeight: 1.7, maxWidth: 360, margin: "0 auto 28px" }}>
            We'll use this to improve Tendr for everyone. If you ever need us, we're just a click away.
          </p>
          <img src={logo} alt="Tendr" style={{ height: 32, opacity: 0.6 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "14px 24px", display: "flex", alignItems: "center" }}>
        <img src={logo} alt="Tendr" style={{ height: 30 }} />
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,5vw,2.4rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 10px" }}>
            We'd love to know what happened
          </h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0, lineHeight: 1.6 }}>
            Your feedback helps us do better for every event. Takes under 2 minutes.
          </p>
        </div>

        {/* Reasons */}
        <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 22px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
            Why didn't you complete the booking?
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {REASONS.map(r => (
              <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${selectedReasons.includes(r) ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: selectedReasons.includes(r) ? "#C47A2E" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}
                  onClick={() => toggleReason(r)}>
                  {selectedReasons.includes(r) && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13.5, color: "#2C1A0E" }}>{r}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Open text feedback */}
        <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 22px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            What would have made you choose Tendr?
          </div>
          <textarea
            value={improvement}
            onChange={e => setImprovement(e.target.value)}
            placeholder="Better prices, more vendor options, faster response times…"
            rows={3}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13.5, fontFamily: font, color: "#2C1A0E", background: "#FDFCF8", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.65 }}
          />
        </div>

        {/* Any other feedback */}
        <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 22px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            Anything else you'd like to share?
          </div>
          <textarea
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            placeholder="Any other thoughts, suggestions, or experience…"
            rows={3}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13.5, fontFamily: font, color: "#2C1A0E", background: "#FDFCF8", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.65 }}
          />
        </div>

        {/* Upcoming events */}
        <div style={{ background: "linear-gradient(135deg,rgba(196,122,46,0.06),rgba(204,171,74,0.04))", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: "20px 22px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
            🎉 Got Another Event Coming Up?
          </div>
          <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.6 }}>
            Tell us and we'll help you plan it — on us to make sure it goes perfectly this time.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Occasion", placeholder: "Birthday, Anniversary, Corporate…", value: upcomingEventType, set: setUpcomingEventType, type: "text" },
              { label: "Approximate date or month", placeholder: "August 2026, next Diwali…", value: upcomingDate, set: setUpcomingDate, type: "text" },
              { label: "Your WhatsApp number", placeholder: "+91 98765 43210", value: upcomingWhatsApp, set: setUpcomingWhatsApp, type: "tel" },
            ].map(({ label, placeholder, value, set, type }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#6B3A1F", marginBottom: 4 }}>{label}</label>
                <input type={type} placeholder={placeholder} value={value} onChange={e => set(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, color: "#2C1A0E", background: "#FDFCF8", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#c0392b", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: submitting ? "#ccc" : "linear-gradient(135deg,#2C1A0E,#4A2810)", color: submitting ? "#999" : "#CCAB4A", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: font, letterSpacing: "0.03em" }}
        >
          {submitting ? "Submitting…" : "Send Feedback"}
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "#9B7450", marginTop: 16, lineHeight: 1.6 }}>
          This is completely anonymous and helps us improve for everyone.
        </p>
      </div>
    </div>
  );
}

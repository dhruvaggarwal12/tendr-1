import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { activateProfessionalAccount } from "../../redux/authSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const gold = "#C47A2E";
const ink = "#2C1A0E";
const muted = "#9B7450";
const cream = "#FFFCF5";

const LABELS = {
  vendor: { noun: "vendor", action: "List Your Service" },
  coordinator: { noun: "event coordinator", action: "Complete Coordinator Registration" },
};

// The Professional side of an account that picked "Register as vendor" / "Event
// coordinator" at signup. Always checks status with the saved personal-account
// token (tendr_personal_token), never whatever session happens to be "active" —
// this page can be reached while the active session is already the vendor/
// coordinator one (switching back and forth), so it can't rely on state.auth.token.
export default function ProfessionalAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [personalToken] = useState(() => localStorage.getItem("tendr_personal_token"));
  const [loading, setLoading] = useState(true);
  const [pro, setPro] = useState(null);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!personalToken) { navigate("/login"); return; }
    fetch(`${BASE_URL}/consumers/me/professional`, { headers: { Authorization: `Bearer ${personalToken}` } })
      .then(r => r.json())
      .then(data => setPro(data.professional))
      .catch(() => setError("Couldn't load your professional status — check your connection and try again."))
      .finally(() => setLoading(false));
  }, [personalToken, navigate]);

  const openDashboard = async () => {
    setOpening(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/auth/me/professional-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${personalToken}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Couldn't open your dashboard."); setOpening(false); return; }
      dispatch(activateProfessionalAccount({ token: data.token, user: data.profile }));
      navigate(data.type === "vendor" ? "/vendor/dashboard" : "/coordinator/dashboard");
    } catch {
      setError("Network error — check your connection and try again.");
      setOpening(false);
    }
  };

  // Approved — no extra click needed, just open straight into the real dashboard.
  useEffect(() => {
    if (pro?.status === "approved" && !opening) openDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pro?.status]);

  const wrap = { minHeight: "100vh", background: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: font };
  const card = { width: "100%", maxWidth: 440, background: cream, borderRadius: 20, padding: "32px 28px", border: "1px solid rgba(196,122,46,0.14)", boxShadow: "0 8px 32px rgba(44,26,14,0.08)", textAlign: "center" };

  if (loading || pro?.status === "approved") {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>
            {pro?.status === "approved" ? "Opening your dashboard…" : "Loading…"}
          </p>
        </div>
      </div>
    );
  }

  const info = LABELS[pro?.type] || LABELS.vendor;

  return (
    <div style={wrap}>
      <div style={card}>
        {pro?.status === "pending" ? (
          <>
            <div style={{ fontSize: 36, marginBottom: 14 }}>⏳</div>
            <h1 style={{ fontSize: 19, fontWeight: 800, color: ink, margin: "0 0 8px" }}>Your application is under review</h1>
            <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.6, margin: 0 }}>
              We've got your {info.noun} registration — our team typically reviews
              applications within 24–48 hours. We'll notify you on WhatsApp once it's
              approved, and this will turn into your dashboard automatically.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 36, marginBottom: 14 }}>{pro?.type === "coordinator" ? "🗓️" : "🧾"}</div>
            <h1 style={{ fontSize: 19, fontWeight: 800, color: ink, margin: "0 0 8px" }}>
              You haven't completed your {info.noun} registration yet
            </h1>
            <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.6, margin: "0 0 22px" }}>
              Finish a few details about what you offer, and we'll review it — usually
              within 24–48 hours.
            </p>
            <button
              onClick={() => navigate(
                pro?.type === "coordinator"
                  ? "/coordinator/register?mode=professional"
                  : "/vendor/register?mode=professional"
              )}
              style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${gold},#CCAB4A)`, color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.32)" }}>
              {info.action} →
            </button>
          </>
        )}
        {error && <p style={{ fontSize: 12.5, color: "#c0392b", marginTop: 16 }}>{error}</p>}
        <button onClick={() => navigate("/dashboard")} style={{ marginTop: 18, background: "none", border: "none", color: muted, fontSize: 12.5, cursor: "pointer", fontFamily: font, textDecoration: "underline" }}>
          ← Back to my personal account
        </button>
      </div>
    </div>
  );
}

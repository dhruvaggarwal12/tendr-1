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

// What the real dashboard offers, shown as a locked preview card before
// approval — so "List Your Service" isn't the only thing on screen.
const DASHBOARD_PREVIEW = {
  vendor: {
    title: "Your Vendor Dashboard",
    desc: "Manage leads, bookings, your service packages and payments — all in one place.",
  },
  coordinator: {
    title: "Your Coordinator Dashboard",
    desc: "Manage your assigned events, client requests and schedule — all in one place.",
  },
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

  if (pro?.status === "pending") {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>⏳</div>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: ink, margin: "0 0 8px" }}>Your application is under review</h1>
          <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.6, margin: 0 }}>
            We've got your {info.noun} registration — our team typically reviews
            applications within 24–48 hours. We'll notify you on WhatsApp once it's
            approved, and this will turn into your dashboard automatically.
          </p>
          {error && <p style={{ fontSize: 12.5, color: "#c0392b", marginTop: 16 }}>{error}</p>}
          <button onClick={() => navigate("/dashboard")} style={{ marginTop: 18, background: "none", border: "none", color: muted, fontSize: 12.5, cursor: "pointer", fontFamily: font, textDecoration: "underline" }}>
            ← Back to my personal account
          </button>
        </div>
      </div>
    );
  }

  // Not registered yet — two cards: start the application, and a preview of
  // what the dashboard it unlocks actually offers (and where it'll show up).
  const preview = DASHBOARD_PREVIEW[pro?.type] || DASHBOARD_PREVIEW.vendor;
  const typeIcon = pro?.type === "coordinator" ? "🗓️" : "🧾";

  return (
    <div style={{ ...wrap, flexDirection: "column" }}>
      <div style={{ textAlign: "center", maxWidth: 480, marginBottom: 26 }}>
        <div style={{ fontSize: 36, marginBottom: 14 }}>{typeIcon}</div>
        <h1 style={{ fontSize: 19, fontWeight: 800, color: ink, margin: "0 0 8px" }}>
          You haven't completed your {info.noun} registration yet
        </h1>
        <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.6, margin: 0 }}>
          Here's what's next.
        </p>
      </div>

      <div className="pa-cards">
        <div className="pa-card">
          <div className="pa-card-icon">{typeIcon}</div>
          <h3 className="pa-card-title">{info.action}</h3>
          <p className="pa-card-desc">Tell us what you offer — categories, pricing and profile. Usually reviewed within 24–48 hours.</p>
          <button
            className="pa-card-btn"
            onClick={() => navigate(
              pro?.type === "coordinator"
                ? "/coordinator/register?mode=professional"
                : "/vendor/register?mode=professional"
            )}>
            Get Started →
          </button>
        </div>
        <div className="pa-card pa-card-muted">
          <div className="pa-card-icon">📊</div>
          <h3 className="pa-card-title">{preview.title}</h3>
          <p className="pa-card-desc">{preview.desc}</p>
          <p className="pa-card-note">Opens right here, automatically, once you're approved</p>
        </div>
      </div>

      {error && <p style={{ fontSize: 12.5, color: "#c0392b", marginBottom: 12 }}>{error}</p>}
      <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: muted, fontSize: 12.5, cursor: "pointer", fontFamily: font, textDecoration: "underline" }}>
        ← Back to my personal account
      </button>

      <style>{`
        .pa-cards {
          display: flex;
          gap: 14px;
          width: 100%;
          max-width: 620px;
          margin-bottom: 22px;
        }
        .pa-card {
          background: #fff;
          border: 1px solid rgba(196,122,46,0.16);
          border-radius: 18px;
          padding: 22px 18px;
          text-align: center;
          box-shadow: 0 6px 20px rgba(44,26,14,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
        }
        .pa-card-muted { background: rgba(196,122,46,0.05); border-style: dashed; }
        .pa-card-icon { font-size: 28px; margin-bottom: 10px; }
        .pa-card-title { font-size: 14.5px; font-weight: 800; color: #2C1A0E; margin: 0 0 6px; font-family: 'Outfit', sans-serif; }
        .pa-card-desc { font-size: 12.5px; color: #9B7450; line-height: 1.5; margin: 0 0 16px; font-family: 'Outfit', sans-serif; flex: 1; }
        .pa-card-note { font-size: 11px; color: #C47A2E; font-weight: 700; margin: 0; font-family: 'Outfit', sans-serif; }
        .pa-card-btn {
          width: 100%;
          padding: 11px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg,#C47A2E,#CCAB4A);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
        }
        @media (min-width: 641px) {
          .pa-cards { justify-content: center; }
          .pa-card { flex: 0 1 260px; }
        }
        @media (max-width: 640px) {
          .pa-cards {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding: 0 9%;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .pa-cards::-webkit-scrollbar { display: none; }
          .pa-card { flex: 0 0 82%; scroll-snap-align: center; }
        }
      `}</style>
    </div>
  );
}

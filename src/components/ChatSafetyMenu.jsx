import React, { useState } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const REPORT_REASONS = ["Inappropriate messages", "Spam or scam", "Harassment", "Fraud or fake listing", "Other"];

// Report / Block menu for a direct (unmediated) customer<->vendor chat — the in-app
// mechanism Apple's UGC guideline expects wherever two strangers can message each other
// without Tendr staff already in the thread. Works for either side: the backend infers
// customer vs vendor from the JWT, so this one component serves both DirectChat.jsx
// (customer) and DirectChatPage.jsx (vendor).
export default function ChatSafetyMenu({ conversationId, token, otherPartyName, blocked, onBlockChange, accent = "#C47A2E", dark = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const call = async (path, body) => {
    const res = await fetch(`${BASE_URL}/conversations/${conversationId}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  };

  const toggleBlock = async () => {
    setMenuOpen(false);
    try {
      await call(blocked ? "unblock" : "block");
      onBlockChange?.(!blocked);
    } catch (e) {
      setToast(e.message);
      setTimeout(() => setToast(""), 3000);
    }
  };

  const submitReport = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await call("report", { reason, details });
      setReportDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeReport = () => {
    setReportOpen(false);
    setReason("");
    setDetails("");
    setError("");
    setReportDone(false);
  };

  const textColor = dark ? "rgba(245,240,232,0.75)" : "#2C1A0E";
  const mutedColor = dark ? "rgba(245,240,232,0.5)" : "#7A5535";
  const cardBg = dark ? "#1a140c" : "#FFFCF5";
  const cardBorder = dark ? "rgba(196,155,48,0.2)" : "rgba(196,122,46,0.18)";

  return (
    <div style={{ position: "relative", marginLeft: "auto", flexShrink: 0 }}>
      <button onClick={() => setMenuOpen((o) => !o)} aria-label="Chat options"
        style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "transparent", color: mutedColor, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        ⋮
      </button>

      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 998 }} />
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, minWidth: 190, padding: 6, zIndex: 999, boxShadow: "0 8px 28px rgba(0,0,0,0.25)" }}>
            <button onClick={() => { setMenuOpen(false); setReportOpen(true); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", fontSize: 13.5, fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: font }}>
              Report {otherPartyName}
            </button>
            <button onClick={toggleBlock}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", fontSize: 13.5, fontWeight: 600, color: "#DC2626", cursor: "pointer", fontFamily: font }}>
              {blocked ? `Unblock ${otherPartyName}` : `Block ${otherPartyName}`}
            </button>
          </div>
        </>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 100030, background: "#2C1A0E", color: "#fff", padding: "9px 16px", borderRadius: 100, fontSize: 12.5, fontFamily: font, boxShadow: "0 6px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {reportOpen && (
        <div onClick={closeReport} style={{ position: "fixed", inset: 0, zIndex: 100020, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: cardBg, borderRadius: 18, padding: "22px 20px", fontFamily: font }}>
            {reportDone ? (
              <div style={{ textAlign: "center", padding: "6px 0" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: textColor, marginBottom: 6 }}>Report submitted</div>
                <div style={{ fontSize: 12.5, color: mutedColor, marginBottom: 16 }}>Our team will review this conversation.</div>
                <button onClick={closeReport} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 800, color: textColor, marginBottom: 4 }}>Report {otherPartyName}</div>
                <div style={{ fontSize: 12, color: mutedColor, marginBottom: 14 }}>Tell us what's wrong — our team reviews every report.</div>

                {error && <div style={{ fontSize: 12, color: "#DC2626", marginBottom: 10 }}>{error}</div>}

                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  {REPORT_REASONS.map((r) => (
                    <label key={r} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${reason === r ? accent : cardBorder}`, cursor: "pointer" }}>
                      <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} />
                      <span style={{ fontSize: 13, color: textColor }}>{r}</span>
                    </label>
                  ))}
                </div>

                <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Anything else we should know (optional)"
                  style={{ width: "100%", minHeight: 60, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${cardBorder}`, fontFamily: font, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", marginBottom: 14, background: "transparent", color: textColor }} />

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeReport} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${cardBorder}`, background: "transparent", color: mutedColor, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Cancel</button>
                  <button onClick={submitReport} disabled={!reason || submitting}
                    style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: reason && !submitting ? "#DC2626" : "rgba(220,38,38,0.35)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: reason && !submitting ? "pointer" : "not-allowed", fontFamily: font }}>
                    {submitting ? "Submitting…" : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

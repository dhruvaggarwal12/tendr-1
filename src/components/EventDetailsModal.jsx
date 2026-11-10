import { useState } from "react";
import { useSelector } from "react-redux";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const BROWN = "#2C1A0E";

const inputStyle = {
  width: "100%", padding: "11px 13px", fontSize: 14, fontFamily: font,
  border: "1.5px solid rgba(196,122,46,0.28)", borderRadius: 11,
  background: "#fff", color: BROWN, outline: "none", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#7A5535",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em",
};

/**
 * Centered "a few quick details" form shown after Send on Baat Karo —
 * gathers name/date/time/city/guests before the message actually goes out.
 * Props: open, onClose, onSubmit({name,date,time,city,guests}), messagePreview, submitting
 */
export default function BaatKaroDetailsModal({ open, onClose, onSubmit, messagePreview, submitting }) {
  const user = useSelector((s) => s.auth.user);
  const [name, setName] = useState(user?.name || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [city, setCity] = useState(user?.location || "");
  const [guests, setGuests] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) { setError("Please add your name"); return; }
    if (!date) { setError("Please pick an event date"); return; }
    setError("");
    onSubmit({
      name: name.trim(),
      date,
      time: time || undefined,
      city: city.trim() || undefined,
      guests: guests ? Number(guests) : undefined,
    });
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(20,10,4,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
    >
      <div style={{ width: "100%", maxWidth: 440, background: "#FFFCF5", borderRadius: 22, padding: "26px 24px", maxHeight: "92dvh", overflowY: "auto", fontFamily: font, boxShadow: "0 32px 80px rgba(28,9,0,0.4)", position: "relative" }}>
        <button
          onClick={() => !submitting && onClose()}
          aria-label="Close"
          style={{ position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontSize: 15, color: "#9B7450", display: "flex", alignItems: "center", justifyContent: "center" }}
        >×</button>

        <div style={{ marginBottom: 18, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, marginBottom: 6 }}>Almost there</div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: BROWN, margin: "0 0 6px" }}>A few quick details</h3>
          <p style={{ fontSize: 12.5, color: "#7A5535", margin: 0, lineHeight: 1.5 }}>So the Tendr Team can get back to you with the right vendors.</p>
        </div>

        {messagePreview && (
          <div style={{ background: "rgba(196,122,46,0.06)", border: "1px dashed rgba(196,122,46,0.3)", borderRadius: 12, padding: "10px 12px", marginBottom: 18, fontSize: 12.5, color: "#5A3A1A", lineHeight: 1.5 }}>
            &ldquo;{messagePreview.length > 140 ? messagePreview.slice(0, 140) + "…" : messagePreview}&rdquo;
          </div>
        )}

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={labelStyle}>Your Name *</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Event Date *</label>
              <input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input type="time" style={inputStyle} value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>City / Location</label>
              <input style={inputStyle} value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Delhi" />
            </div>
            <div>
              <label style={labelStyle}>Guests</label>
              <input type="number" min="1" style={inputStyle} value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="e.g. 150" />
            </div>
          </div>
        </div>

        {error && <p style={{ color: "#C0392B", fontSize: 12.5, margin: "12px 0 0" }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: "100%", marginTop: 20, padding: "14px", borderRadius: 13, border: "none", background: submitting ? "rgba(196,122,46,0.35)" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: font, cursor: submitting ? "not-allowed" : "pointer" }}
        >
          {submitting ? "Sending…" : "Send to Tendr Team →"}
        </button>
      </div>
    </div>
  );
}

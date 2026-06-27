import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import router from "../router";
import { FUN_ACTIVITIES } from "../data/funActivitiesData";
import { addActivity, removeActivity, saveActivityForm, clearFunCart, setFunConfirmed, selectFunCartItems } from "../redux/funActivitiesCartSlice";

const F     = "'Outfit', sans-serif";
const GOLD  = "#C47A2E";
const BROWN = "#2C1A0E";

// ── Booking Details Panel ─────────────────────────────────────────────────────
function BookingPanel({ activity, onClose, onReviewPay, fromDrawer = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const today = new Date().toISOString().split("T")[0];
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", date: "", time: "", address: "", notes: "",
    qty: 1, eventType: "", guests: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const totalPrice = activity.perUnit ? activity.price * form.qty : activity.price;
  const valid = form.name && form.phone && form.date && form.time && form.address && form.eventType && form.guests;

  const handleReviewPay = () => {
    if (!valid) return;
    dispatch(saveActivityForm({ id: activity.id, form: { ...form }, totalPrice }));
    setDone(true);
    setTimeout(() => {
      if (onReviewPay) onReviewPay();
      else navigate("/booking/review");
    }, 1200);
  };

  const inp = (label, key, ph, type = "text", req = true, extra = {}) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>
        {label}{req && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
        placeholder={ph} required={req} {...extra}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(44,26,14,0.12)", fontFamily: F, fontSize: 13, color: BROWN, outline: "none", boxSizing: "border-box", background: "#fff" }}
        onFocus={e => (e.target.style.borderColor = GOLD)}
        onBlur={e => (e.target.style.borderColor = "rgba(44,26,14,0.12)")} />
    </div>
  );

  const panelStyle = window.innerWidth < 768
    ? { position: "fixed", inset: 0, background: "#FFFCF5", zIndex: 100001, display: "flex", flexDirection: "column" }
    : { position: "fixed", top: 0, right: 0, bottom: 0, width: "min(96vw,420px)", background: "#FFFCF5", zIndex: 100001, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.18)" };

  if (done) return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100000, backdropFilter: "blur(3px)" }} />
      <div style={{ ...panelStyle, alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#15803d,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(21,128,61,0.35)", animation: "fa-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: BROWN, margin: "0 0 6px", fontFamily: F }}>Details Saved!</h3>
          <p style={{ fontSize: 13, color: "#9B7450", margin: 0, fontFamily: F }}>{fromDrawer ? "Tap 'Confirm Booking' when ready." : "Taking you to Review & Pay…"}</p>
        </div>
        <style>{`@keyframes fa-pop{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
      </div>
    </>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100000, backdropFilter: "blur(3px)" }} />
      <div style={{ ...panelStyle, overflowY: "auto" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 16px", borderBottom: "1.5px solid rgba(44,26,14,0.07)", position: "sticky", top: 0, background: "#FFFCF5", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 3px", fontFamily: F }}>🎭 Fun Activity · {activity.price === 0 ? "Free" : "Fixed Price"}</p>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: BROWN, margin: 0, fontFamily: F }}>{activity.emoji} {activity.name}</h3>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(44,26,14,0.1)", background: "#fff", color: "#9B7450", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          <div style={{ marginTop: 12, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", borderRadius: 12, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 700, letterSpacing: "0.08em", fontFamily: F }}>{totalPrice === 0 ? "FREE — NO SURPRISES" : "FIXED PRICE — NO SURPRISES"}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "2px 0 0", fontFamily: F }}>
                {totalPrice === 0 ? "Free" : `₹${totalPrice.toLocaleString("en-IN")}`}
                {activity.perUnit && <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 6 }}>({activity.unitLabel})</span>}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: 0, fontFamily: F }}>⏱ {activity.duration}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: "2px 0 0", fontFamily: F }}>👥 {activity.guests}</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 20px 28px", flex: 1 }}>
          <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 20px", lineHeight: 1.6, fontFamily: F }}>
            Fill in your event details — you'll review everything before paying.
          </p>

          {activity.perUnit && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>
                Number of {activity.name}s <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => set("qty", n)}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${form.qty === n ? GOLD : "rgba(44,26,14,0.12)"}`, background: form.qty === n ? `${GOLD}15` : "#fff", color: form.qty === n ? GOLD : BROWN, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F }}>
                    {n}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "#9B7450", margin: "5px 0 0", fontFamily: F }}>
                Total: ₹{totalPrice.toLocaleString("en-IN")} ({form.qty} × ₹{activity.price.toLocaleString("en-IN")})
              </p>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>
              Event Type <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <select value={form.eventType} onChange={e => set("eventType", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(44,26,14,0.12)", fontFamily: F, fontSize: 13, color: form.eventType ? BROWN : "#9B7450", outline: "none", boxSizing: "border-box", background: "#fff", appearance: "none", WebkitAppearance: "none" }}
              onFocus={e => (e.target.style.borderColor = GOLD)}
              onBlur={e => (e.target.style.borderColor = "rgba(44,26,14,0.12)")}>
              <option value="">Select event type…</option>
              {["Get-together", "Birthday", "Anniversary", "Wedding", "Office Party", "Others"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {inp("Total Guests", "guests", "e.g. 50", "number")}
          {inp("Your Name", "name", "Full name")}
          {inp("WhatsApp Number", "phone", "10-digit number", "tel")}
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>
                Date <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                required min={today}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: F, fontSize: 13, color: BROWN, outline: "none", boxSizing: "border-box", background: "#fff" }}
                onFocus={e => (e.target.style.borderColor = GOLD)}
                onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.25)")} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>
                Start Time <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input type="time" value={form.time} onChange={e => set("time", e.target.value)}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: F, fontSize: 13, color: BROWN, outline: "none", boxSizing: "border-box", background: "#fff" }}
                onFocus={e => (e.target.style.borderColor = GOLD)}
                onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.25)")} />
            </div>
          </div>
          {inp("Venue / Address", "address", "Event venue or full address")}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>
              Notes <span style={{ fontWeight: 400, color: "#9B7450" }}>(optional)</span>
            </label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              rows={3} placeholder="Any special requirements or theme details…"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(44,26,14,0.12)", fontFamily: F, fontSize: 13, color: BROWN, outline: "none", resize: "vertical", boxSizing: "border-box", background: "#fff" }}
              onFocus={e => (e.target.style.borderColor = GOLD)}
              onBlur={e => (e.target.style.borderColor = "rgba(44,26,14,0.12)")} />
          </div>

          <button onClick={handleReviewPay} disabled={!valid}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: valid ? "linear-gradient(135deg,#15803d,#22c55e)" : "#E5E7EB", color: valid ? "#fff" : "#9CA3AF", fontSize: 15, fontWeight: 800, cursor: valid ? "pointer" : "not-allowed", fontFamily: F, boxShadow: valid ? "0 4px 14px rgba(21,128,61,0.35)" : "none", transition: "all 0.15s" }}>
            {fromDrawer ? `Save Details ✓ — ₹${totalPrice.toLocaleString("en-IN")}` : `Review & Pay — ₹${totalPrice.toLocaleString("en-IN")} →`}
          </button>
          <p style={{ fontSize: 11, color: "#9B7450", textAlign: "center", margin: "10px 0 0", fontFamily: F }}>
            Fixed price · No hidden charges · WhatsApp confirmation within 2 hrs
          </p>
        </div>
      </div>
    </>
  );
}

// ── Quick View Modal (center screen) ─────────────────────────────────────────
function ActivityModal({ activity, onClose, onAddToCart }) {
  const isMob = window.innerWidth < 768;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 100000, backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(94vw,520px)", maxHeight: isMob ? "82vh" : "90vh", overflowY: "auto", background: "#FFFCF5", borderRadius: isMob ? 18 : 22, zIndex: 100001, fontFamily: F, boxShadow: "0 28px 70px rgba(0,0,0,0.22)" }}>

        {/* Hero image header */}
        <div style={{ position: "relative", height: isMob ? 180 : 240, borderRadius: isMob ? "18px 18px 0 0" : "22px 22px 0 0", overflow: "hidden", flexShrink: 0 }}>
          <img src={activity.image} alt={activity.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)", pointerEvents: "none" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>×</button>
          {/* Name + price overlay at bottom */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMob ? "12px 14px" : "16px 20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
            <h2 style={{ fontSize: isMob ? 18 : 22, fontWeight: 900, color: "#fff", margin: 0, fontFamily: F, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{activity.name}</h2>
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "0.08em", fontFamily: F }}>{activity.price === 0 ? "FREE" : "FIXED PRICE"}</span>
              <span style={{ fontSize: isMob ? 18 : 22, fontWeight: 900, color: "#CCAB4A", fontFamily: F, lineHeight: 1 }}>
                {activity.price === 0 ? "Free" : `₹${activity.price.toLocaleString("en-IN")}`}
                {activity.price > 0 && activity.perUnit && <span style={{ fontSize: isMob ? 10 : 12, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}> {activity.unitLabel}</span>}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: isMob ? "14px 16px calc(20px + env(safe-area-inset-bottom, 16px))" : "20px 24px calc(24px + env(safe-area-inset-bottom, 20px))" }}>
          {/* Info pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: isMob ? 10 : 14 }}>
            <span style={{ fontSize: isMob ? 11 : 12, color: "#9B7450", background: "#F9F5F0", padding: isMob ? "4px 10px" : "5px 12px", borderRadius: 100, fontFamily: F }}>⏱ {activity.duration}</span>
            <span style={{ fontSize: isMob ? 11 : 12, color: "#9B7450", background: "#F9F5F0", padding: isMob ? "4px 10px" : "5px 12px", borderRadius: 100, fontFamily: F }}>👥 {activity.guests}</span>
            <span style={{ fontSize: isMob ? 11 : 12, color: GOLD, background: `${GOLD}12`, padding: isMob ? "4px 10px" : "5px 12px", borderRadius: 100, fontWeight: 700, fontFamily: F }}>🎭 Fun Activity</span>
          </div>

          {/* Description */}
          <p style={{ fontSize: isMob ? 12 : 14, color: "#5a3a1a", lineHeight: 1.6, margin: `0 0 ${isMob ? 10 : 16}px`, fontFamily: F }}>{activity.desc}</p>

          {/* What's included */}
          <div style={{ background: "rgba(196,122,46,0.04)", borderRadius: 12, padding: isMob ? "10px 12px" : "14px 16px", marginBottom: isMob ? 10 : 16, border: `1px solid ${GOLD}18` }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${isMob ? 7 : 10}px`, fontFamily: F }}>What's Included</p>
            {activity.includes.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 4 }}>
                <span style={{ color: GOLD, fontSize: 11, marginTop: 2 }}>✓</span>
                <span style={{ fontSize: isMob ? 11 : 13, color: BROWN, fontFamily: F }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Perfect for */}
          <div style={{ marginBottom: isMob ? 10 : 18 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: BROWN, textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${isMob ? 6 : 8}px`, fontFamily: F }}>Perfect For</p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {activity.perfectFor.map(p => (
                <span key={p} style={{ fontSize: isMob ? 11 : 12, color: "#7A5535", background: "rgba(196,122,46,0.08)", padding: isMob ? "4px 10px" : "5px 12px", borderRadius: 100, fontFamily: F }}>✨ {p}</span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: isMob ? 14 : 20 }}>
            {activity.tags.map(t => (
              <span key={t} style={{ fontSize: 10, color: GOLD, background: `${GOLD}12`, padding: "2px 8px", borderRadius: 100, fontWeight: 700, fontFamily: F }}>#{t}</span>
            ))}
          </div>

          {/* CTAs */}
          <button onClick={() => { onAddToCart(activity); onClose(); }}
            style={{ width: "100%", padding: isMob ? "12px" : "13px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: isMob ? 14 : 15, fontWeight: 800, cursor: "pointer", fontFamily: F, boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>
            🛒 Save to Cart
          </button>
          <p style={{ fontSize: 10, color: "#9B7450", textAlign: "center", margin: "7px 0 0", fontFamily: F }}>
            Fixed price · Confirmed within 2 hrs · WhatsApp updates
          </p>
        </div>
      </div>
    </>
  );
}

// ── Single Card ───────────────────────────────────────────────────────────────
export function FunActivityCard({ activity, onQuickView, onBook, onAddToCart }) {
  const isMobile = window.innerWidth < 768;
  return (
    <div onClick={() => onQuickView(activity)}
      style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(44,26,14,0.07)", overflow: "hidden", boxShadow: "0 2px 12px rgba(44,26,14,0.06)", transition: "all 0.2s", display: "flex", flexDirection: "column", minWidth: isMobile ? 150 : 210, flex: "0 0 auto", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.16)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(44,26,14,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>

      {/* Image header */}
      <div style={{ position: "relative", height: isMobile ? 120 : 160, overflow: "hidden", flexShrink: 0 }}>
        <img
          src={activity.image}
          alt={activity.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: isMobile ? 10 : 12, fontWeight: 900, padding: isMobile ? "3px 8px" : "4px 10px", borderRadius: "100px 100px 100px 4px", fontFamily: F }}>
            ₹{activity.price.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 8, color: GOLD, fontWeight: 800, letterSpacing: "0.1em", textAlign: "center", marginTop: 2, fontFamily: F }}>
            {activity.perUnit ? activity.unitLabel.toUpperCase() : "FIXED"}
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? "8px 10px 10px" : "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: isMobile ? 11 : 14, fontWeight: 800, color: BROWN, margin: `0 0 ${isMobile ? 3 : 5}px`, fontFamily: F }}>{activity.name}</h3>

        <div style={{ display: "flex", gap: 4, marginBottom: isMobile ? 5 : 7, flexWrap: "wrap" }}>
          {activity.tags?.[0] && (
            <span style={{ fontSize: 9, color: GOLD, background: "rgba(196,122,46,0.1)", padding: "2px 7px", borderRadius: 100, fontFamily: F, fontWeight: 700, textTransform: "capitalize" }}>{activity.tags[0]}</span>
          )}
          <span style={{ fontSize: 9, color: "#9B7450", background: "#F9F5F0", padding: "2px 6px", borderRadius: 100, fontFamily: F }}>⏱ {activity.duration}</span>
          <span style={{ fontSize: 9, color: "#9B7450", background: "#F9F5F0", padding: "2px 6px", borderRadius: 100, fontFamily: F }}>👥 {activity.guests}</span>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
          <button
            onClick={e => { e.stopPropagation(); onQuickView(activity); }}
            style={{ flex: 1, padding: isMobile ? "7px 0" : "9px 0", borderRadius: 9, border: `1.5px solid ${GOLD}40`, background: "#fff", color: GOLD, fontSize: isMobile ? 10 : 11, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
            View Details
          </button>
          <button
            onClick={e => { e.stopPropagation(); onAddToCart(activity); }}
            style={{ flex: 1, padding: isMobile ? "7px 0" : "9px 0", borderRadius: 9, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontSize: isMobile ? 10 : 11, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
            + Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fun Cart Drawer ───────────────────────────────────────────────────────────
export function FunCartDrawer({ onClose }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectFunCartItems);
  const today = new Date().toISOString().split("T")[0];

  const [step, setStep] = useState(0); // 0=cart 1=form 2=done
  // per-perUnit item quantity map
  const [qtyMap, setQtyMap] = useState(() =>
    Object.fromEntries(cartItems.filter(i => i.perUnit).map(i => [i.id, 1]))
  );
  const [form, setForm] = useState({
    eventType: "", guests: "", name: "", phone: "", date: "", time: "", address: "", notes: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.eventType && form.guests && form.name && form.phone && form.date && form.time && form.address;

  const cartTotal = cartItems.reduce((sum, item) => {
    const qty = item.perUnit ? (qtyMap[item.id] || 1) : 1;
    return sum + item.price * qty;
  }, 0);

  const handleSubmit = () => {
    if (!valid) return;
    cartItems.forEach(item => {
      const qty = item.perUnit ? (qtyMap[item.id] || 1) : 1;
      const totalPrice = item.price * qty;
      dispatch(saveActivityForm({ id: item.id, form: { ...form, qty }, totalPrice }));
    });
    dispatch(setFunConfirmed(true));
    setStep(2);
  };

  const focusGold = e => (e.target.style.borderColor = GOLD);
  const blurGrey  = e => (e.target.style.borderColor = "rgba(44,26,14,0.12)");
  const inp = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(44,26,14,0.12)", fontFamily: F, fontSize: 13, color: BROWN, outline: "none", boxSizing: "border-box", background: "#fff" };

  /* ── Step 2: success ── */
  if (step === 2) return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100000, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(82vw,400px)", background: "#FFFCF5", zIndex: 100001, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, boxShadow: "-8px 0 40px rgba(0,0,0,0.18)", fontFamily: F, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(196,122,46,0.4)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <h3 data-ui-heading style={{ fontSize: 20, fontWeight: 900, color: BROWN, margin: "0 0 8px", fontFamily: F }}>Booking Details Saved!</h3>
          <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 4px", lineHeight: 1.6 }}>Your activities are ready.</p>
          <p style={{ fontSize: 13, color: BROWN, fontWeight: 700, margin: 0, lineHeight: 1.6 }}>Tap the 🎁 gift icon to the left of the chat button to send your booking.</p>
        </div>
        <div style={{ width: "100%", background: "rgba(196,122,46,0.08)", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
            🎁
          </div>
          <p style={{ fontSize: 12, color: "#7A5535", margin: 0, lineHeight: 1.5, textAlign: "left" }}>Close this window and tap the <strong>🎁 gift icon</strong> to the left of the chat button at the bottom of the screen.</p>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid rgba(44,26,14,0.15)", background: "#fff", color: BROWN, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
          Close
        </button>
      </div>
    </>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100000, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(82vw,400px)", background: "#FFFCF5", zIndex: 100001, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.18)", fontFamily: F }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1.5px solid rgba(44,26,14,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => step === 0 ? onClose() : setStep(0)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(44,26,14,0.1)", background: "#fff", color: "#9B7450", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>←</button>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>🎭 Fun Activities</p>
              <h3 data-ui-heading style={{ fontSize: 17, fontWeight: 900, color: BROWN, margin: 0 }}>
                {step === 0 ? `Your Cart (${cartItems.length})` : "Event Details"}
              </h3>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(44,26,14,0.1)", background: "#fff", color: "#9B7450", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* ── Step 0: Cart ── */}
        {step === 0 && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#9B7450" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎭</div>
                  <p style={{ fontSize: 14, margin: 0 }}>No activities added yet.</p>
                </div>
              ) : cartItems.map(item => {
                const qty = qtyMap[item.id] || 1;
                return (
                  <div key={item.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.12)", padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: item.perUnit ? 10 : 0 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 800, color: BROWN, margin: "0 0 3px" }}>{item.emoji} {item.name}</p>
                        <p style={{ fontSize: 13, color: GOLD, fontWeight: 700, margin: 0 }}>
                          ₹{item.price.toLocaleString("en-IN")}{item.perUnit ? ` ${item.unitLabel}` : " fixed"}
                        </p>
                      </div>
                      <button onClick={() => dispatch(removeActivity(item.id))}
                        style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(192,57,43,0.2)", background: "rgba(192,57,43,0.06)", color: "#c0392b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
                    </div>
                    {item.perUnit && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                        <span style={{ fontSize: 11, color: "#9B7450", flex: 1 }}>Quantity</span>
                        <button onClick={() => setQtyMap(m => ({ ...m, [item.id]: Math.max(1, (m[item.id] || 1) - 1) }))}
                          style={{ width: 28, height: 28, borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: BROWN, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                        <span style={{ fontSize: 14, fontWeight: 800, color: BROWN, minWidth: 20, textAlign: "center" }}>{qty}</span>
                        <button onClick={() => setQtyMap(m => ({ ...m, [item.id]: (m[item.id] || 1) + 1 }))}
                          style={{ width: 28, height: 28, borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: BROWN, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        <span style={{ fontSize: 12, color: "#9B7450", marginLeft: "auto", fontWeight: 700 }}>
                          ₹{(item.price * qty).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {cartItems.length > 0 && (
              <div style={{ padding: "14px 20px", paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))", borderTop: "1.5px solid rgba(44,26,14,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#9B7450" }}>Estimated Total</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: BROWN }}>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <button onClick={() => setStep(1)}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: F, boxShadow: "0 4px 14px rgba(44,26,14,0.3)", letterSpacing: "0.01em" }}>
                  Proceed to Booking →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Step 1: Shared event form ── */}
        {step === 1 && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 28px" }}>
            <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 20px", lineHeight: 1.6 }}>
              These details apply to all {cartItems.length} activit{cartItems.length === 1 ? "y" : "ies"} in your cart.
            </p>

            {/* Event type */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>Event Type <span style={{ color: "#DC2626" }}>*</span></label>
              <select value={form.eventType} onChange={e => set("eventType", e.target.value)}
                style={{ ...inp, appearance: "none", WebkitAppearance: "none", color: form.eventType ? BROWN : "#9B7450" }}
                onFocus={focusGold} onBlur={blurGrey}>
                <option value="">Select event type…</option>
                {["Get-together", "Birthday", "Anniversary", "Wedding", "Office Party", "Others"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Guests */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>Total Guests <span style={{ color: "#DC2626" }}>*</span></label>
              <input type="number" value={form.guests} onChange={e => set("guests", e.target.value)}
                placeholder="e.g. 50" style={inp} onFocus={focusGold} onBlur={blurGrey} />
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>Your Name <span style={{ color: "#DC2626" }}>*</span></label>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Full name" style={inp} onFocus={focusGold} onBlur={blurGrey} />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>WhatsApp Number <span style={{ color: "#DC2626" }}>*</span></label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="10-digit number" style={inp} onFocus={focusGold} onBlur={blurGrey} />
            </div>

            {/* Date + Time */}
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>Date <span style={{ color: "#DC2626" }}>*</span></label>
                <input type="date" value={form.date} min={today} onChange={e => set("date", e.target.value)}
                  style={{ ...inp, borderColor: "rgba(196,122,46,0.25)" }} onFocus={focusGold} onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.25)")} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>Start Time <span style={{ color: "#DC2626" }}>*</span></label>
                <input type="time" value={form.time} onChange={e => set("time", e.target.value)}
                  style={{ ...inp, borderColor: "rgba(196,122,46,0.25)" }} onFocus={focusGold} onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.25)")} />
              </div>
            </div>

            {/* Venue */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>Venue / Address <span style={{ color: "#DC2626" }}>*</span></label>
              <input type="text" value={form.address} onChange={e => set("address", e.target.value)}
                placeholder="Event venue or full address" style={inp} onFocus={focusGold} onBlur={blurGrey} />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>Notes <span style={{ fontWeight: 400, color: "#9B7450" }}>(optional)</span></label>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                rows={2} placeholder="Any special requirements or theme details…"
                style={{ ...inp, resize: "vertical" }} onFocus={focusGold} onBlur={blurGrey} />
            </div>

            {/* Total summary */}
            <div style={{ background: "rgba(196,122,46,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: BROWN, fontWeight: 700 }}>
                <span>Estimated Total</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ fontSize: 11, color: "#9B7450", marginTop: 3 }}>{cartItems.length} activit{cartItems.length === 1 ? "y" : "ies"}</div>
            </div>

            <button onClick={handleSubmit} disabled={!valid}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: valid ? "linear-gradient(135deg,#2C1A0E,#4A2810)" : "#E5E7EB", color: valid ? "#CCAB4A" : "#9CA3AF", fontSize: 15, fontWeight: 800, cursor: valid ? "pointer" : "not-allowed", fontFamily: F, boxShadow: valid ? "0 4px 14px rgba(44,26,14,0.3)" : "none", letterSpacing: "0.01em" }}>
              Review & Pay — ₹{cartTotal.toLocaleString("en-IN")} →
            </button>
            <p style={{ fontSize: 11, color: "#9B7450", textAlign: "center", margin: "10px 0 0" }}>
              Fixed price · WhatsApp confirmation within 2 hrs
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Section Component ────────────────────────────────────────────────────
export default function FunActivitiesSection({ heading, subheading, activities = FUN_ACTIVITIES, grid = false }) {
  const dispatch = useDispatch();
  const [quickView, setQuickView] = useState(null);
  const [booking,   setBooking]   = useState(null);
  const scrollRef = useRef(null);

  const handleAddToCart = (activity) => {
    dispatch(addActivity({ id: activity.id, name: activity.name, emoji: activity.emoji, price: activity.price, perUnit: activity.perUnit, unitLabel: activity.unitLabel }));
  };

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <>
      <div style={{ fontFamily: F }}>
        {(heading || subheading) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div>
              {heading    && <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 900, color: BROWN, margin: "0 0 5px", letterSpacing: "-0.01em", fontFamily: F }}>{heading}</h2>}
              {subheading && <p style={{ fontSize: 14, color: "#9B7450", margin: 0, fontFamily: F }}>{subheading}</p>}
            </div>
          </div>
        )}

        {grid ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
            {activities.map(a => (
              <FunActivityCard key={a.id} activity={a} onQuickView={setQuickView} onBook={setBooking} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <div ref={scrollRef} style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
              {activities.map(a => (
                <FunActivityCard key={a.id} activity={a} onQuickView={setQuickView} onBook={setBooking} onAddToCart={handleAddToCart} />
              ))}
            </div>
            {activities.length > 3 && (
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                {["←", "→"].map((dir, i) => (
                  <button key={dir} onClick={() => scroll(i === 0 ? -1 : 1)}
                    style={{ width: 34, height: 34, borderRadius: "50%", border: `1.5px solid ${GOLD}30`, background: "#fff", color: GOLD, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>
                    {dir}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {quickView && <ActivityModal activity={quickView} onClose={() => setQuickView(null)} onAddToCart={a => { handleAddToCart(a); setQuickView(null); }} />}
      {booking   && <BookingPanel  activity={booking}   onClose={() => setBooking(null)} onReviewPay={() => { setBooking(null); }} />}
    </>
  );
}

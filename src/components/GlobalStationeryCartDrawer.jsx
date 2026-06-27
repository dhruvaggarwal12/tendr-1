import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useStationeryCart } from "../context/StationeryCartContext";
import { setStBooking } from "../redux/stationeryBookingSlice";

const font = "'Outfit', sans-serif";
const WA_NUMBER = "919211668427";
const GOLD = "#C47A2E";
const BROWN = "#2C1A0E";

const CAT_META = {
  "Branding & Identity":  { icon: "✦",  light: "rgba(196,122,46,0.08)",  color: "#C47A2E" },
  "Event Signage":        { icon: "🪧", light: "rgba(141,96,57,0.08)",   color: "#8D6039" },
  "Itinerary":            { icon: "📋", light: "rgba(57,73,171,0.08)",   color: "#3949AB" },
  "Guest Accessories":    { icon: "🎀", light: "rgba(156,59,85,0.08)",   color: "#9C3B55" },
  "Hashtag Services":     { icon: "#",  light: "rgba(46,125,85,0.08)",   color: "#2E7D55" },
  "Invitations":          { icon: "💌", light: "rgba(122,58,30,0.08)",   color: "#7A3A1E" },
  "Envelopes":            { icon: "✉",  light: "rgba(93,64,55,0.08)",    color: "#5D4037" },
  "Coffee Table Booklet": { icon: "📖", light: "rgba(62,39,35,0.08)",    color: "#3E2723" },
  "Cards":                { icon: "🃏", light: "rgba(106,27,77,0.08)",   color: "#6A1B4D" },
  "Other":                { icon: "✨", light: "rgba(122,85,53,0.08)",   color: "#7A5535" },
};

function getPriceDisplay(item) {
  if (item.priceOnRequest) return { main: "Price on request", note: null };
  if (item.priceRange)     return { main: item.priceRange,   note: "+ printing & delivery" };
  if (item.startingPrice)  return { main: `₹${Number(item.startingPrice).toLocaleString("en-IN")}`, note: "+ printing & delivery" };
  return { main: "—", note: null };
}

function buildWhatsAppMessage(cart, form) {
  const lines = [];
  lines.push("🌸 *Wedding Stationery Booking — Tendr*");
  lines.push("");
  lines.push(`👤 *Name:* ${form.name}`);
  lines.push(`📞 *Phone:* ${form.phone}`);
  lines.push(`📍 *Address:* ${form.address}`);
  lines.push(`📅 *Event Date:* ${form.date}`);
  lines.push("");
  lines.push("*🛒 Items Selected:*");
  cart.forEach(({ item, quantity }, i) => {
    const price = item.priceOnRequest
      ? "Price on request"
      : item.priceRange
      ? item.priceRange
      : item.startingPrice
      ? `₹${Number(item.startingPrice).toLocaleString("en-IN")} per ${item.unit || "piece"}`
      : "—";
    lines.push(`${i + 1}. ${item.name} × ${quantity} ${item.unit || "pcs"} — ${price}`);
  });
  lines.push("");
  lines.push("📌 *Note:* Design prices shown. Printing & delivery will be quoted separately.");
  lines.push("");
  lines.push("_Sent via tendr.co.in_");
  return lines.join("\n");
}

export default function GlobalStationeryCartDrawer() {
  const dispatch = useDispatch();
  const { cart, cartCount, isCartOpen, closeCart, removeFromCart, updateQty, clearCart } = useStationeryCart();
  const [step, setStep] = useState(0); // 0=cart 1=form 2=done
  const [form, setForm] = useState({ name: "", phone: "", address: "", date: "" });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isCartOpen && step !== 2) setStep(0);
  }, [isCartOpen]);

  useEffect(() => {
    document.body.style.overflow = (isCartOpen || step === 2) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen, step]);

  const pricedTotal = cart.reduce((sum, { item, quantity }) => {
    if (item.priceOnRequest || !item.startingPrice) return sum;
    return sum + item.startingPrice * Number(quantity);
  }, 0);
  const hasUnpriced = cart.some((c) => c.item.priceOnRequest);

  const handleSubmit = () => {
    setErr("");
    if (!form.name.trim())    { setErr("Name is required"); return; }
    if (!form.phone.trim())   { setErr("Phone number is required"); return; }
    if (!form.address.trim()) { setErr("Address is required"); return; }
    if (!form.date.trim())    { setErr("Event date is required"); return; }

    const cartSnapshot = cart.map(({ item, quantity }) => ({ item, quantity }));
    dispatch(setStBooking({ form: { ...form }, cartSnapshot }));
    clearCart();
    closeCart();
    setStep(2);
  };

  const handleClose = () => {
    setStep(0);
    closeCart();
  };

  if (!isCartOpen && step !== 2) return null;

  /* ── Step 2: success screen ── */
  if (step === 2) return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100000, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(96vw,400px)", background: "#FFFCF5", zIndex: 100001, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, boxShadow: "-8px 0 40px rgba(0,0,0,0.18)", fontFamily: font, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(196,122,46,0.4)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: BROWN, margin: "0 0 8px" }}>Order Saved!</h3>
          <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 4px", lineHeight: 1.6 }}>Your stationery selection has been saved.</p>
          <p style={{ fontSize: 13, color: BROWN, fontWeight: 700, margin: 0, lineHeight: 1.6 }}>Tap the <strong>🎁 gift icon</strong> to the left of the chat button to review and send your order on WhatsApp.</p>
        </div>
        <div style={{ width: "100%", background: "rgba(196,122,46,0.08)", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
            🎁
          </div>
          <p style={{ fontSize: 12, color: "#7A5535", margin: 0, lineHeight: 1.5, textAlign: "left" }}>Close this window and tap the <strong>gift icon</strong> to the left of the chat button at the bottom of the screen.</p>
        </div>
        <button onClick={handleClose} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid rgba(44,26,14,0.15)", background: "#fff", color: BROWN, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
          Close
        </button>
      </div>
    </>
  );

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1.5px solid rgba(44,26,14,0.12)", fontFamily: font,
    fontSize: 13, color: BROWN, outline: "none",
    boxSizing: "border-box", background: "#fff",
  };

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99995, fontFamily: font }}>
          <div
            onClick={() => { if (step === 0) closeCart(); }}
            style={{ position: "absolute", inset: 0, background: "rgba(28,10,0,0.55)", backdropFilter: "blur(3px)", animation: "gsc-fadeIn 0.25s ease" }}
          />
          <div
            className="gsc-panel"
            style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "min(50vw,500px)", background: "#FFFCF7", overflowY: "auto", boxShadow: "-20px 0 80px rgba(44,26,14,0.3)", animation: "gsc-slideRight 0.3s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column" }}
          >
            {/* ── STEP 0: Cart ── */}
            {step === 0 && (
              <>
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(44,26,14,0.07)", border: "none", cursor: "pointer", fontSize: 16, color: "#5a3a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>←</button>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1C1208", margin: "0 0 2px" }}>🛒 Your Cart</h2>
                      <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>{cart.length} item{cart.length !== 1 ? "s" : ""} selected</p>
                    </div>
                  </div>
                  <button onClick={closeCart} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(44,26,14,0.08)", border: "none", cursor: "pointer", fontSize: 18, color: "#5a3a1a" }}>×</button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#9B7450" }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#5a3a1a" }}>Cart is empty</div>
                      <div style={{ fontSize: 12, marginTop: 6 }}>Add items from the stationery catalogue</div>
                    </div>
                  ) : cart.map(({ item, quantity }) => {
                    const m = CAT_META[item.category] || CAT_META["Other"];
                    const pr = getPriceDisplay(item);
                    const lineTotal = !item.priceOnRequest && item.startingPrice
                      ? `₹${(item.startingPrice * Number(quantity)).toLocaleString("en-IN")}`
                      : null;
                    return (
                      <div key={item._id || item.id} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(196,122,46,0.08)" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: m.light, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, overflow: "hidden" }}>
                          {item.images?.[0]?.url
                            ? <img src={item.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : m.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#1C1208", marginBottom: 2, lineHeight: 1.3 }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "#9B7450", marginBottom: 6 }}>{item.unit || "pcs"}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 900, color: "#C9A84C" }}>{lineTotal || pr.main}</span>
                            {lineTotal && <span style={{ fontSize: 9, color: "#9B7450", fontStyle: "italic" }}>+ printing & delivery</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <button onClick={() => updateQty(item, quantity - 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>−</button>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#1C1208", minWidth: 24, textAlign: "center" }}>{quantity}</span>
                            <button onClick={() => updateQty(item, quantity + 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>+</button>
                          </div>
                          <button onClick={() => removeFromCart(item)} style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fff5f5", color: "#c0392b", cursor: "pointer", fontFamily: font }}>Remove</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {cart.length > 0 && (
                  <div className="gsc-footer" style={{ padding: "16px 24px calc(80px + env(safe-area-inset-bottom, 0px))", borderTop: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
                    <div style={{ marginBottom: 14 }}>
                      {pricedTotal > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#1C1208", marginBottom: 4 }}>
                          <span>Design Total</span>
                          <span style={{ color: "#C9A84C" }}>₹{pricedTotal.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {hasUnpriced && <div style={{ fontSize: 11, color: "#9B7450", fontStyle: "italic" }}>+ some items are price on request</div>}
                      <div style={{ fontSize: 10, color: "#B89060", marginTop: 4 }}>Printing & delivery charged separately</div>
                    </div>
                    <button
                      onClick={() => { setErr(""); setStep(1); }}
                      style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 6px 24px rgba(196,122,46,0.4)" }}
                    >
                      Proceed to Booking →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── STEP 1: Booking Form ── */}
            {step === 1 && (
              <>
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <button onClick={() => setStep(0)} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(44,26,14,0.07)", border: "none", cursor: "pointer", fontSize: 16, color: "#5a3a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1C1208", margin: 0 }}>Booking Details</h2>
                    <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                  <div style={{ background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.18)", borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{cart.length} item{cart.length !== 1 ? "s" : ""} in cart</div>
                    {cart.map(({ item, quantity }) => (
                      <div key={item._id || item.id} style={{ fontSize: 12, color: "#1C1208", marginBottom: 2 }}>✦ {item.name} × {quantity} {item.unit || "pcs"}</div>
                    ))}
                  </div>

                  {[
                    { key: "name",    label: "Your Name",            placeholder: "Rahul Sharma",           type: "text", req: true },
                    { key: "phone",   label: "Phone Number",         placeholder: "+91 98765 43210",        type: "tel",  req: true },
                    { key: "address", label: "Delivery Address",     placeholder: "New Delhi, India",       type: "text", req: true },
                    { key: "date",    label: "Event / Required Date", placeholder: "e.g. 15 December 2025", type: "text", req: true },
                  ].map(({ key, label, placeholder, type, req }) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: font }}>
                        {label}{req && <span style={{ color: "#DC2626" }}> *</span>}
                      </label>
                      <input
                        type={type}
                        value={form[key]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = GOLD)}
                        onBlur={e => (e.target.style.borderColor = "rgba(44,26,14,0.12)")}
                      />
                    </div>
                  ))}

                  {err && <div style={{ padding: "10px 14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, color: "#c0392b", fontSize: 12, marginBottom: 14 }}>{err}</div>}
                </div>

                <div className="gsc-footer" style={{ padding: "16px 24px 24px", borderTop: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
                  <button
                    onClick={handleSubmit}
                    style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 6px 24px rgba(196,122,46,0.4)" }}
                  >
                    Confirm Booking →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes gsc-fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gsc-slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (max-width: 767px) {
          .gsc-panel { width: min(82vw, 420px) !important; }
          .gsc-footer { padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px)) !important; }
        }
      `}</style>
    </>
  );
}

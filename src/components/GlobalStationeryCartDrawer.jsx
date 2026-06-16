import React, { useState, useEffect } from "react";
import { useStationeryCart } from "../context/StationeryCartContext";

const font = "'Outfit', sans-serif";
const WA_NUMBER = "919211668427";

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
  lines.push("🌸 *Wedding Stationery Order — Tendr*");
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
  const { cart, cartCount, isCartOpen, closeCart, removeFromCart, updateQty, clearCart } = useStationeryCart();
  const [showWaForm, setShowWaForm] = useState(false);
  const [waForm, setWaForm] = useState({ name: "", phone: "", address: "", date: "" });
  const [waErr, setWaErr] = useState("");

  useEffect(() => {
    if (!isCartOpen) setShowWaForm(false);
  }, [isCartOpen]);

  useEffect(() => {
    document.body.style.overflow = (isCartOpen || showWaForm) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen, showWaForm]);

  const pricedTotal = cart.reduce((sum, { item, quantity }) => {
    if (item.priceOnRequest || !item.startingPrice) return sum;
    return sum + item.startingPrice * Number(quantity);
  }, 0);
  const hasUnpriced = cart.some((c) => c.item.priceOnRequest);

  const handleWaSend = () => {
    setWaErr("");
    if (!waForm.name.trim())    { setWaErr("Name is required"); return; }
    if (!waForm.phone.trim())   { setWaErr("Phone number is required"); return; }
    if (!waForm.address.trim()) { setWaErr("Address is required"); return; }
    if (!waForm.date.trim())    { setWaErr("Event date is required"); return; }
    const msg = buildWhatsAppMessage(cart, waForm);
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setShowWaForm(false);
    closeCart();
    clearCart();
  };

  if (!isCartOpen && !showWaForm) return null;

  return (
    <>
      {/* Cart Drawer */}
      {isCartOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, fontFamily: font }}>
          <div
            onClick={closeCart}
            style={{ position: "absolute", inset: 0, background: "rgba(28,10,0,0.55)", backdropFilter: "blur(3px)", animation: "gsc-fadeIn 0.25s ease" }}
          />
          <div
            className="gsc-panel"
            style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "min(50vw,500px)", background: "#FFFCF7", overflowY: "auto", boxShadow: "-20px 0 80px rgba(44,26,14,0.3)", animation: "gsc-slideRight 0.3s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1C1208", margin: "0 0 2px" }}>🛒 Your Cart</h2>
                <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>{cart.length} item{cart.length !== 1 ? "s" : ""} selected</p>
              </div>
              <button onClick={closeCart} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(44,26,14,0.08)", border: "none", cursor: "pointer", fontSize: 18, color: "#5a3a1a" }}>×</button>
            </div>

            {/* Items */}
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
                      {/* Inline qty controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button
                          onClick={() => updateQty(item, quantity - 1)}
                          style={{ width: 24, height: 24, borderRadius: 6, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                        >−</button>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#1C1208", minWidth: 24, textAlign: "center" }}>{quantity}</span>
                        <button
                          onClick={() => updateQty(item, quantity + 1)}
                          style={{ width: 24, height: 24, borderRadius: 6, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                        >+</button>
                      </div>
                      <button onClick={() => removeFromCart(item)} style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fff5f5", color: "#c0392b", cursor: "pointer", fontFamily: font }}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="gsc-footer" style={{ padding: "16px 24px 24px", borderTop: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
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
                  onClick={() => { setShowWaForm(true); setWaErr(""); }}
                  style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 24px rgba(37,211,102,0.35)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.557 4.12 1.527 5.849L0 24l6.335-1.611A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.376l-.36-.214-3.727.948.989-3.614-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
                  Chat on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp Form Modal */}
      {showWaForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={() => setShowWaForm(false)} style={{ position: "absolute", inset: 0, background: "rgba(28,10,0,0.65)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", background: "#FFFCF7", borderRadius: 24, padding: "32px 28px 28px", width: "100%", maxWidth: 440, boxShadow: "0 24px 80px rgba(44,26,14,0.4)", animation: "gsc-fadeIn 0.2s ease", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowWaForm(false)} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", background: "rgba(44,26,14,0.07)", border: "none", cursor: "pointer", fontSize: 16, color: "#5a3a1a" }}>×</button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.557 4.12 1.527 5.849L0 24l6.335-1.611A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.376l-.36-.214-3.727.948.989-3.614-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1C1208", margin: 0 }}>Almost there!</h3>
                <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>Fill in your details to send the order</p>
              </div>
            </div>

            <div style={{ background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.18)", borderRadius: 12, padding: "10px 14px", marginBottom: 20, marginTop: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#128C7E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{cart.length} item{cart.length !== 1 ? "s" : ""} in cart</div>
              {cart.map(({ item, quantity }) => (
                <div key={item._id || item.id} style={{ fontSize: 12, color: "#1C1208", marginBottom: 2 }}>✦ {item.name} × {quantity} {item.unit || "pcs"}</div>
              ))}
            </div>

            {[
              { key: "name",    label: "Your Name *",            placeholder: "Rahul Sharma",            type: "text" },
              { key: "phone",   label: "Phone Number *",         placeholder: "+91 98765 43210",         type: "tel"  },
              { key: "address", label: "Delivery Address *",     placeholder: "New Delhi, India",        type: "text" },
              { key: "date",    label: "Event / Required Date *",placeholder: "e.g. 15 December 2025",  type: "text" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#5a3a1a", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
                <input
                  type={type}
                  value={waForm[key]}
                  onChange={(e) => setWaForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontSize: 14, fontFamily: font, color: "#1C1208", background: "#fff", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            {waErr && <div style={{ padding: "10px 14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, color: "#c0392b", fontSize: 12, marginBottom: 14 }}>{waErr}</div>}

            <button
              onClick={handleWaSend}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 24px rgba(37,211,102,0.35)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.557 4.12 1.527 5.849L0 24l6.335-1.611A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.376l-.36-.214-3.727.948.989-3.614-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
              Send on WhatsApp
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#9B7450", margin: "10px 0 0" }}>
              Opens WhatsApp with your order details pre-filled. Message goes to +91 92116 68427.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes gsc-fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gsc-slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (max-width: 767px) {
          .gsc-panel { width: 100% !important; }
          .gsc-footer { padding-bottom: 84px !important; }
        }
      `}</style>
    </>
  );
}

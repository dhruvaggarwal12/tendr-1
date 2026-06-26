import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import router from "../router";
import { selectCartItems, selectCartTotal, removeFromCart, updateQuantity, setGhConfirmed } from "../redux/giftHamperCartSlice";

const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const BROWN = "#2C1A0E";

function Field({ label, children, req }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5, fontFamily: F }}>
        {label}{req && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 10,
  border: "1.5px solid rgba(44,26,14,0.12)", fontFamily: F,
  fontSize: 13, color: BROWN, outline: "none",
  boxSizing: "border-box", background: "#fff",
};

export function GiftCartDrawer({ onClose }) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  const [step, setStep] = useState(0); // 0=cart 1=form 2=done
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    name: "", phone: "", deliveryDate: "", address: "", city: "", pincode: "", instructions: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.name && form.phone && form.deliveryDate && form.address && form.city;

  const handleSubmit = () => {
    if (!valid) return;
    try { sessionStorage.setItem("gh_delivery", JSON.stringify(form)); } catch {}
    dispatch(setGhConfirmed(true));
    setStep(2);
  };

  const focusGold = e => (e.target.style.borderColor = GOLD);
  const blurGrey  = e => (e.target.style.borderColor = "rgba(44,26,14,0.12)");

  /* ── Step 2: success screen ── */
  if (step === 2) return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100000, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(96vw,400px)", background: "#FFFCF5", zIndex: 100001, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, boxShadow: "-8px 0 40px rgba(0,0,0,0.18)", fontFamily: F, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(196,122,46,0.4)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: BROWN, margin: "0 0 8px" }}>Delivery Details Saved!</h3>
          <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 4px", lineHeight: 1.6 }}>Your hamper order is ready.</p>
          <p style={{ fontSize: 13, color: BROWN, fontWeight: 700, margin: 0, lineHeight: 1.6 }}>Tap the pay icon at the bottom right to confirm your booking.</p>
        </div>
        <div style={{ width: "100%", background: "rgba(196,122,46,0.08)", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <p style={{ fontSize: 12, color: "#7A5535", margin: 0, lineHeight: 1.5, textAlign: "left" }}>Close this window and tap the <strong>gold pay button</strong> at the bottom right of the screen.</p>
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
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(96vw,400px)", background: "#FFFCF5", zIndex: 100001, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.18)", fontFamily: F }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1.5px solid rgba(44,26,14,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {step === 1 && (
              <button onClick={() => setStep(0)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(44,26,14,0.1)", background: "#fff", color: "#9B7450", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
            )}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>🎁 Gift Hampers</p>
              <h3 data-ui-heading style={{ fontSize: 17, fontWeight: 900, color: BROWN, margin: 0 }}>
                {step === 0 ? `Your Cart (${items.reduce((s, i) => s + i.quantity, 0)})` : "Delivery Details"}
              </h3>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(44,26,14,0.1)", background: "#fff", color: "#9B7450", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* ── Step 0: Cart ── */}
        {step === 0 && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#9B7450" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎁</div>
                  <p style={{ fontSize: 14, margin: 0 }}>No items added yet.</p>
                </div>
              ) : items.map(item => (
                <div key={item.productId} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.12)", padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: BROWN, margin: "0 0 3px", lineHeight: 1.3 }}>{item.name}</p>
                        <button onClick={() => dispatch(removeFromCart(item.productId))}
                          style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(192,57,43,0.2)", background: "rgba(192,57,43,0.06)", color: "#c0392b", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>✕</button>
                      </div>
                      <p style={{ fontSize: 12, color: GOLD, fontWeight: 700, margin: "0 0 8px" }}>₹{item.pricePerUnit.toLocaleString("en-IN")} / unit</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                          style={{ width: 28, height: 28, borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: BROWN, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                        <span style={{ fontSize: 14, fontWeight: 800, color: BROWN, minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                        <button onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                          style={{ width: 28, height: 28, borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: BROWN, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        <span style={{ fontSize: 13, color: "#9B7450", marginLeft: "auto", fontWeight: 700 }}>₹{item.subtotal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div style={{ padding: "14px 20px", borderTop: "1.5px solid rgba(44,26,14,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#9B7450" }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: BROWN }}>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <button onClick={() => setStep(1)}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: F, boxShadow: "0 4px 14px rgba(44,26,14,0.3)", letterSpacing: "0.01em" }}>
                  Proceed to Booking →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Step 1: Delivery form ── */}
        {step === 1 && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 28px" }}>
            <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 20px", lineHeight: 1.6 }}>
              Fill in where to send the hampers — you'll review and pay next.
            </p>

            <Field label="Recipient Name" req>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Who should we deliver to?" style={inputStyle} onFocus={focusGold} onBlur={blurGrey} />
            </Field>

            <Field label="WhatsApp Number" req>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="10-digit number" style={inputStyle} onFocus={focusGold} onBlur={blurGrey} />
            </Field>

            <Field label="Delivery Date" req>
              <input type="date" value={form.deliveryDate} min={today} onChange={e => set("deliveryDate", e.target.value)}
                style={inputStyle} onFocus={focusGold} onBlur={blurGrey} />
            </Field>

            <Field label="Delivery Address" req>
              <input type="text" value={form.address} onChange={e => set("address", e.target.value)}
                placeholder="Flat / House / Street" style={inputStyle} onFocus={focusGold} onBlur={blurGrey} />
            </Field>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 2 }}>
                <Field label="City" req>
                  <input type="text" value={form.city} onChange={e => set("city", e.target.value)}
                    placeholder="e.g. New Delhi" style={inputStyle} onFocus={focusGold} onBlur={blurGrey} />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Pincode">
                  <input type="text" value={form.pincode} onChange={e => set("pincode", e.target.value)}
                    placeholder="110001" style={inputStyle} onFocus={focusGold} onBlur={blurGrey} />
                </Field>
              </div>
            </div>

            <Field label="Special Instructions">
              <textarea value={form.instructions} onChange={e => set("instructions", e.target.value)}
                rows={2} placeholder="Any message for the recipient or delivery notes…"
                style={{ ...inputStyle, resize: "vertical" }} onFocus={focusGold} onBlur={blurGrey} />
            </Field>

            <div style={{ marginTop: 24, background: "rgba(196,122,46,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: BROWN, fontWeight: 700 }}>
                <span>Order Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ fontSize: 11, color: "#9B7450", marginTop: 3 }}>{items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}</div>
            </div>

            <button onClick={handleSubmit} disabled={!valid}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: valid ? "linear-gradient(135deg,#2C1A0E,#4A2810)" : "#E5E7EB", color: valid ? "#CCAB4A" : "#9CA3AF", fontSize: 15, fontWeight: 800, cursor: valid ? "pointer" : "not-allowed", fontFamily: F, boxShadow: valid ? "0 4px 14px rgba(44,26,14,0.3)" : "none", letterSpacing: "0.01em" }}>
              Review & Pay — ₹{total.toLocaleString("en-IN")} →
            </button>
            <p style={{ fontSize: 11, color: "#9B7450", textAlign: "center", margin: "10px 0 0" }}>
              WhatsApp confirmation within 2 hrs · Secure payment
            </p>
          </div>
        )}
      </div>
    </>
  );
}

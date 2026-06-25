import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, selectCartTotal, removeFromCart, updateQuantity, clearCart, setGhConfirmed } from "../redux/giftHamperCartSlice";

const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const BROWN = "#2C1A0E";

export function GiftCartDrawer({ onClose }) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1200, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(96vw,400px)", background: "#FFFCF5", zIndex: 1201, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.18)", fontFamily: F }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1.5px solid rgba(44,26,14,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>🎁 Gift Hampers</p>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: BROWN, margin: 0 }}>Your Cart ({items.reduce((s, i) => s + i.quantity, 0)})</h3>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(44,26,14,0.1)", background: "#fff", color: "#9B7450", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Items */}
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

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "14px 20px", borderTop: "1.5px solid rgba(44,26,14,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#9B7450" }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: BROWN }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <button onClick={() => { dispatch(setGhConfirmed(true)); onClose(); }}
              style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: F, boxShadow: "0 4px 14px rgba(44,26,14,0.3)", letterSpacing: "0.01em" }}>
              Confirm Booking ✓
            </button>
          </div>
        )}
      </div>
    </>
  );
}

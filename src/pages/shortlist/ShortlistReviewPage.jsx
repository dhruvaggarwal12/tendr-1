import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectFunCartItems, removeActivity, setFunConfirmed } from "../../redux/funActivitiesCartSlice";
import { selectCartItems as selectGhCartItems, removeFromCart as removeFromGhCart, setGhConfirmed } from "../../redux/giftHamperCartSlice";
import { useStationeryCart } from "../../context/StationeryCartContext";
import { useChatOverlay } from "../../context/ChatContext";
import { CAT_META } from "../../components/TripleShortlistFloat";
import AuthModal from "../../components/AuthModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const F = "'Outfit', sans-serif";
const GOLD = "#0EA5E9";
const INK = "#0C2A3A";

// Fixed category order — matches the fixed hierarchy the icon itself uses.
const CATEGORY_ORDER = ["fun-activity", "gift-hamper", "stationery"];

export default function ShortlistReviewPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth || {});
  const { openAllBookingsChat } = useChatOverlay();

  const funItems = useSelector(selectFunCartItems);
  const ghItems = useSelector(selectGhCartItems);
  const { cart: stCart, clearCart: clearStCart, removeFromCart: removeFromStCart } = useStationeryCart();

  const itemsByCategory = {
    "fun-activity": funItems,
    "gift-hamper":  ghItems,
    "stationery":   stCart,
  };
  const steps = CATEGORY_ORDER.filter(cat => itemsByCategory[cat].length > 0);

  const [stepIdx, setStepIdx] = useState(0);
  const [forms, setForms] = useState({});
  const [sending, setSending] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [done, setDone] = useState(false);

  if (steps.length === 0) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, textAlign: "center", padding: 24 }}>
        <div>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 6 }}>Nothing shortlisted yet</div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>Browse Fun Activities, Gift Hampers, or Wedding Stationery and shortlist something first.</div>
          <button onClick={() => navigate("/")} style={{ padding: "11px 22px", borderRadius: 10, border: "none", background: GOLD, color: "#fff", fontFamily: F, fontWeight: 700, cursor: "pointer" }}>Back home</button>
        </div>
      </div>
    );
  }

  const cat = steps[stepIdx];
  const meta = CAT_META[cat];
  const items = itemsByCategory[cat];
  const form = forms[cat] || { date: "", location: "", notes: "" };
  const isLast = stepIdx === steps.length - 1;
  const canCopy = stepIdx > 0;

  const setField = (k, v) => setForms(prev => ({ ...prev, [cat]: { ...form, [k]: v } }));
  const copyFromPrevious = () => {
    const prevCat = steps[stepIdx - 1];
    setForms(prev => ({ ...prev, [cat]: { ...(prev[prevCat] || { date: "", location: "", notes: "" }) } }));
  };

  const itemLabel = (category, item) => {
    if (category === "fun-activity") return `${item.emoji || "🎉"} ${item.name}`;
    if (category === "gift-hamper")  return `🎁 ${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`;
    return `💌 ${item.item?.name || "Item"}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`;
  };
  const itemPrice = (category, item) => {
    if (category === "fun-activity") return item.totalPrice || item.price || 0;
    if (category === "gift-hamper")  return item.subtotal || 0;
    return null; // stationery pricing varies too much per item to total simply here
  };
  const removeItem = (category, item) => {
    if (category === "fun-activity") dispatch(removeActivity(item.id));
    else if (category === "gift-hamper") dispatch(removeFromGhCart(item.productId));
    else removeFromStCart(item.item);
  };

  const sendToChat = async () => {
    if (!token) { setAuthModalOpen(true); return; }
    setSending(true);
    try {
      for (const c of steps) {
        const f = forms[c] || {};
        const its = itemsByCategory[c];
        const message = `${CAT_META[c].emoji} ${CAT_META[c].label}: ${its.map(it => itemLabel(c, it)).join(", ")}`;
        await fetch(`${BASE_URL}/conversations/baat-karo`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          credentials: "include",
          body: JSON.stringify({
            message,
            bookingCategory: c,
            eventDetails: { date: f.date || "", city: f.location || "", notes: f.notes || "" },
          }),
        });
      }
      if (funItems.length > 0) dispatch(setFunConfirmed(true));
      if (ghItems.length > 0) dispatch(setGhConfirmed(true));
      if (stCart.length > 0) clearStCart();
      openAllBookingsChat();
      setDone(true);
    } catch (e) {
      console.error("Send to chat failed:", e);
    } finally {
      setSending(false);
    }
  };

  const inp = { width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid rgba(14,165,233,0.25)", fontFamily: F, fontSize: 14, color: INK, outline: "none", background: "#F0F9FF", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 12, fontWeight: 700, color: "#0369A1", marginBottom: 5 };

  if (done) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, textAlign: "center", padding: 24 }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: INK, marginBottom: 8 }}>Sent to chat!</div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 24, maxWidth: 320 }}>Tendr will confirm pricing with you in the chat you just opened.</div>
          <button onClick={() => navigate("/")} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: GOLD, color: "#fff", fontFamily: F, fontWeight: 800, cursor: "pointer" }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#F8FAFC", fontFamily: F, paddingBottom: 40 }}>
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(14,165,233,0.15)", padding: "16px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer", padding: 4 }}>←</button>
            <div style={{ fontSize: 15, fontWeight: 800, color: INK }}>Review Your Shortlist</div>
            <div style={{ width: 28 }} />
          </div>
          <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
            {steps.map((s, i) => (
              <div key={s} style={{ width: i === stepIdx ? 22 : 7, height: 7, borderRadius: 100, background: i <= stepIdx ? GOLD : "rgba(14,165,233,0.2)", transition: "all 0.2s" }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>{meta.emoji}</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>{meta.label}</div>
            <div style={{ fontSize: 11.5, color: "#64748B" }}>Step {stepIdx + 1} of {steps.length}</div>
          </div>
        </div>

        {/* Items in this category */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(14,165,233,0.15)", padding: "6px 16px", margin: "16px 0" }}>
          {items.map((it, i) => {
            const price = itemPrice(cat, it);
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "12px 0", borderBottom: i < items.length - 1 ? "1px solid rgba(14,165,233,0.1)" : "none" }}>
                <span style={{ fontSize: 14, color: INK, fontWeight: 600, flex: 1 }}>{itemLabel(cat, it)}</span>
                {price != null && <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>₹{Number(price).toLocaleString("en-IN")}</span>}
                <button onClick={() => removeItem(cat, it)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: 13, cursor: "pointer", flexShrink: 0 }}>✕</button>
              </div>
            );
          })}
        </div>

        {canCopy && (
          <button onClick={copyFromPrevious} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px dashed rgba(14,165,233,0.35)", background: "rgba(14,165,233,0.05)", color: "#0369A1", fontFamily: F, fontSize: 12.5, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>
            ✓ Use same info as {CAT_META[steps[stepIdx - 1]].label}
          </button>
        )}

        {/* Details form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lbl}>Event date</label>
            <input type="date" style={inp} value={form.date} onChange={e => setField("date", e.target.value)} />
          </div>
          <div>
            <label style={lbl}>City / Delivery location</label>
            <input style={inp} value={form.location} onChange={e => setField("location", e.target.value)} placeholder="e.g. Delhi NCR" />
          </div>
          <div>
            <label style={lbl}>Notes (optional)</label>
            <textarea style={{ ...inp, height: 70, resize: "vertical" }} value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Anything else Tendr should know…" />
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {stepIdx > 0 && (
            <button onClick={() => setStepIdx(s => s - 1)} style={{ padding: "13px 18px", borderRadius: 11, border: "1.5px solid rgba(14,165,233,0.25)", background: "#fff", color: "#0369A1", fontFamily: F, fontWeight: 700, cursor: "pointer" }}>← Back</button>
          )}
          {isLast ? (
            <button onClick={sendToChat} disabled={sending} style={{ flex: 1, padding: "14px", borderRadius: 11, border: "none", background: sending ? "rgba(14,165,233,0.4)" : `linear-gradient(135deg,${GOLD},#0284C7)`, color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 15, cursor: sending ? "default" : "pointer" }}>
              {sending ? "Sending…" : "Send to Chat →"}
            </button>
          ) : (
            <button onClick={() => setStepIdx(s => s + 1)} style={{ flex: 1, padding: "14px", borderRadius: 11, border: "none", background: `linear-gradient(135deg,${GOLD},#0284C7)`, color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Next: {CAT_META[steps[stepIdx + 1]].label} →
            </button>
          )}
        </div>
      </div>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => { setAuthModalOpen(false); sendToChat(); }} defaultMode="login" />
    </div>
  );
}

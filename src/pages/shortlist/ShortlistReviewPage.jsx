import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectFunCartItems, removeActivity, setFunConfirmed, clearFunCart } from "../../redux/funActivitiesCartSlice";
import { selectCartItems as selectGhCartItems, removeFromCart as removeFromGhCart, setGhConfirmed, clearCart as clearGhCart, selectGhPhotoItems, removePhoto as removeGhPhoto, clearPhotos as clearGhPhotos } from "../../redux/giftHamperCartSlice";
import { useStationeryCart } from "../../context/StationeryCartContext";
import { setStBooking } from "../../redux/stationeryBookingSlice";
import { useChatOverlay } from "../../context/ChatContext";
import { CAT_META } from "./categoryMeta";
import AuthModal from "../../components/AuthModal";
import { SERVICED_CITIES } from "../../data/indianCities";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const F = "'Outfit', sans-serif";
const GOLD = "#0EA5E9";
const INK = "#0C2A3A";

// Fixed category order — matches the fixed hierarchy the icon itself uses.
const CATEGORY_ORDER = ["fun-activity", "gift-hamper", "gift-inspiration", "stationery"];

// The backend's SERVICE_BOOKING_TYPES list (routes/conversation.js) expects
// 'fun-activities'/'gift-hampers' (plural) — sending the singular local keys above
// meant its `SERVICE_BOOKING_TYPES.includes(bookingCategory)` check silently failed
// and no EventPlan tracking record ever got created for these two categories.
// "gift-inspiration" intentionally has no mapping — those go in as image messages,
// not a priced EventPlan.
const BOOKING_CATEGORY_MAP = { "fun-activity": "fun-activities", "gift-hamper": "gift-hampers", stationery: "stationery" };

export default function ShortlistReviewPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth || {});
  const { openAllBookingsChat } = useChatOverlay();

  const funItems = useSelector(selectFunCartItems);
  const ghItems = useSelector(selectGhCartItems);
  const ghPhotoItems = useSelector(selectGhPhotoItems);
  const { cart: stCart, clearCart: clearStCart, removeFromCart: removeFromStCart } = useStationeryCart();

  const itemsByCategory = {
    "fun-activity":     funItems,
    "gift-hamper":      ghItems,
    "gift-inspiration": ghPhotoItems,
    "stationery":       stCart,
  };
  const steps = CATEGORY_ORDER.filter(cat => itemsByCategory[cat].length > 0);

  const [stepIdx, setStepIdx] = useState(0);
  const [forms, setForms] = useState({});
  const [sending, setSending] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [sendError, setSendError] = useState("");

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
    if (category === "fun-activity")     return `${item.emoji || "🎉"} ${item.name}`;
    if (category === "gift-hamper")      return `🎁 ${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`;
    if (category === "gift-inspiration") return `🖼️ ${item.name || "Gift Hamper Idea"}`;
    return `💌 ${item.item?.name || "Item"}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`;
  };
  const itemPrice = (category, item) => {
    if (category === "fun-activity") return item.totalPrice || item.price || 0;
    if (category === "gift-hamper")  return item.subtotal || 0;
    return null; // stationery pricing varies too much per item to total simply here; inspiration photos have no price
  };
  const removeItem = (category, item) => {
    if (category === "fun-activity") dispatch(removeActivity(item.id));
    else if (category === "gift-hamper") dispatch(removeFromGhCart(item.productId));
    else if (category === "gift-inspiration") dispatch(removeGhPhoto(item._id));
    else removeFromStCart(item.item);
  };

  const buildItems = (c, its) => its.map(it => ({
    name: c === "stationery" ? (it.item?.name || "Item") : (c === "gift-inspiration" ? (it.name || "Gift Hamper Idea") : it.name),
    qty: c === "gift-hamper" || c === "stationery" ? (it.quantity || 1) : 1,
    price: itemPrice(c, it) || 0,
  }));

  const sendToChat = async () => {
    if (!token) { setAuthModalOpen(true); return; }
    setSending(true);
    setSendError("");
    const succeeded = [];
    const failed = [];
    for (const c of steps) {
      const f = forms[c] || {};
      const its = itemsByCategory[c];
      const message = `${CAT_META[c].emoji} ${CAT_META[c].label}: ${its.map(it => itemLabel(c, it)).join(", ")}`;
      try {
        const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
        const res = await fetch(`${BASE_URL}/conversations/baat-karo`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            message,
            serviceType: "My Order",
            bookingCategory: BOOKING_CATEGORY_MAP[c],
            eventDetails: { date: f.date || "", city: f.location || "", notes: f.notes || "" },
            items: buildItems(c, its),
          }),
        });
        if (res.ok) {
          succeeded.push(c);
          // Gift inspiration photos have no price/qty to carry in `items` above — send
          // each shortlisted photo as its own image message in the same conversation,
          // same as the old direct-from-page "Talk to Team" flow used to.
          if (c === "gift-inspiration") {
            const data = await res.json().catch(() => ({}));
            const cid = data.conversationId;
            if (cid) {
              for (const photo of its) {
                try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers, body: JSON.stringify({ sender: "user", content: `[img:${photo.url}]` }) }); } catch {}
              }
            }
          }
        } else failed.push(c);
      } catch (e) {
        console.error(`Send to chat failed for ${c}:`, e);
        failed.push(c);
      }
    }

    // Only clear/confirm what actually went through — a failed category stays in the
    // cart so nothing silently disappears, and so it can be resent instead of resurfacing
    // as a stale duplicate of something that already succeeded.
    if (succeeded.includes("fun-activity")) { dispatch(setFunConfirmed(true)); dispatch(clearFunCart()); }
    if (succeeded.includes("gift-hamper")) { dispatch(setGhConfirmed(true)); dispatch(clearGhCart()); }
    if (succeeded.includes("gift-inspiration")) dispatch(clearGhPhotos());
    if (succeeded.includes("stationery")) {
      dispatch(setStBooking({ form: { ...(forms.stationery || {}) }, cartSnapshot: stCart }));
      clearStCart();
    }

    setSending(false);
    if (failed.length === steps.length) {
      setSendError("Couldn't send any of this — check your connection and try again.");
      return;
    }
    if (failed.length > 0) {
      setSendError(`${failed.map(c => CAT_META[c].label).join(", ")} couldn't be sent — it's still in your shortlist so you can try again. The rest went through.`);
    }
    if (succeeded.length > 0) openAllBookingsChat();
    setDone(true);
  };

  const inp = { width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid rgba(14,165,233,0.25)", fontFamily: F, fontSize: 14, color: INK, outline: "none", background: "#F0F9FF", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 12, fontWeight: 700, color: "#0369A1", marginBottom: 5 };

  if (done) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, textAlign: "center", padding: 24 }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{sendError ? "⚠️" : "🎉"}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: INK, marginBottom: 8 }}>{sendError ? "Partly sent" : "Sent to chat!"}</div>
          <div style={{ fontSize: 13, color: sendError ? "#B45309" : "#64748B", marginBottom: 24, maxWidth: 320 }}>
            {sendError || "Tendr will confirm pricing with you in the chat you just opened."}
          </div>
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
            <input type="date" style={inp} value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={e => setField("date", e.target.value)} />
          </div>
          <div>
            <label style={lbl}>City / Delivery location</label>
            <select style={{ ...inp, color: form.location ? INK : "#64748B", cursor: "pointer" }} value={form.location} onChange={e => setField("location", e.target.value)}>
              <option value="">Select a city</option>
              {SERVICED_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Notes (optional)</label>
            <textarea style={{ ...inp, height: 70, resize: "vertical" }} value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Anything else Tendr should know…" />
          </div>
        </div>

        {sendError && (
          <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, background: "#FEF3C7", border: "1px solid #FCD34D", color: "#92400E", fontSize: 12.5, lineHeight: 1.5 }}>
            ⚠️ {sendError}
          </div>
        )}

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

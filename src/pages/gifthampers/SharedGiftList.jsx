import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import AuthModal from "../../components/AuthModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const INK = "#2C1A0E";
const REFRESH_MS = 20000; // refresh-based sync, not live sockets — simple and good enough

const ACTION_COPY = {
  added: (a) => `${a.consumerName} added ${a.itemName}${a.quantity > 1 ? ` ×${a.quantity}` : ""}`,
  removed: (a) => `${a.consumerName} removed ${a.itemName}`,
  updated_quantity: (a) => `${a.consumerName} changed ${a.itemName} to ×${a.quantity}`,
  finalized: (a) => `${a.consumerName} finalized the order`,
};

export default function SharedGiftList() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(s => s.auth || {});

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    fetch(`${BASE_URL}/gift-lists/${shareToken}`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then(async r => { if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error || "Couldn't load this list"); } return r.json(); })
      .then(d => { setList(d.list); setError(""); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, shareToken]);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [token, load]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const page = { minHeight: "100dvh", background: "#F8FAFC", fontFamily: F };
  const card = { maxWidth: 620, margin: "0 auto", padding: "24px 20px 60px" };

  if (!token) {
    return (
      <div style={page}>
        <HamburgerNav active="" />
        <div style={{ ...card, textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🎁</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: INK, marginBottom: 8 }}>Sign in to view this gift list</div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>Editing a shared list requires an account, so everyone's changes are attributed to them.</div>
          <button onClick={() => setAuthModalOpen(true)} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: GOLD, color: "#fff", fontFamily: F, fontWeight: 700, cursor: "pointer" }}>Sign In</button>
        </div>
        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => { setAuthModalOpen(false); load(); }} defaultMode="login" />
      </div>
    );
  }

  if (loading) {
    return <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(196,122,46,0.2)", borderTopColor: GOLD, borderRadius: "50%", animation: "sgl-spin 0.7s linear infinite" }} />
      <style>{`@keyframes sgl-spin{to{transform:rotate(360deg)}}`}</style>
    </div>;
  }

  if (error || !list) {
    return (
      <div style={page}>
        <HamburgerNav active="" />
        <div style={{ ...card, textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>😕</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 8 }}>{error || "Couldn't load this list"}</div>
          <button onClick={() => navigate("/gifting")} style={{ marginTop: 10, padding: "11px 22px", borderRadius: 10, border: "none", background: GOLD, color: "#fff", fontFamily: F, fontWeight: 700, cursor: "pointer" }}>Browse Gift Hampers</button>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <HamburgerNav active="" />
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.12)", padding: "18px 20px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            {list.status === "finalized" ? "Order placed" : "Shared Gift List"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 19, fontWeight: 900, color: INK }}>{list.name}</div>
            {list.status === "open" && (
              <button onClick={copyLink} style={{ padding: "7px 14px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
                {linkCopied ? "✓ Copied!" : "🔗 Copy Link"}
              </button>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#9B7450", marginTop: 4 }}>
            Started by {list.creatorName}{list.isCreator ? " (you)" : ""} · anyone with the link can add or remove items
          </div>
        </div>
      </div>

      <div style={card}>
        {list.status === "finalized" && (
          <div style={{ background: "rgba(21,128,61,0.08)", border: "1.5px solid rgba(21,128,61,0.25)", borderRadius: 14, padding: "14px 18px", marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#15803d" }}>✅ Order placed by {list.creatorName}</div>
            <div style={{ fontSize: 12, color: "#166534", marginTop: 3 }}>This list is locked — no more changes can be made.</div>
          </div>
        )}

        {/* Items */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(196,122,46,0.15)", marginBottom: 16, overflow: "hidden" }}>
          {list.items.length === 0 ? (
            <div style={{ padding: "30px 20px", textAlign: "center", color: "#64748B", fontSize: 13 }}>Nothing added yet — be the first.</div>
          ) : list.items.map((item) => (
            <ItemRow key={item._id} item={item} list={list} token={token} shareToken={shareToken} onChanged={load} />
          ))}
        </div>

        {list.items.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", marginBottom: 20, fontSize: 15, fontWeight: 800, color: INK }}>
            <span>Total</span><span>₹{list.total.toLocaleString("en-IN")}</span>
          </div>
        )}

        {list.status === "open" && <AddItemPicker token={token} shareToken={shareToken} onAdded={load} />}

        {list.status === "open" && (
          <div style={{ marginTop: 24 }}>
            {list.isCreator ? (
              <FinalizeBlock token={token} shareToken={shareToken} disabled={list.items.length === 0} onFinalized={load} />
            ) : (
              <div style={{ textAlign: "center", fontSize: 12.5, color: "#9B7450", padding: "12px", background: "#fff", borderRadius: 12, border: "1px dashed rgba(196,122,46,0.25)" }}>
                Only <strong>{list.creatorName}</strong> can finalize and pay for this order.
              </div>
            )}
          </div>
        )}

        {/* Activity log */}
        <div style={{ marginTop: 28 }}>
          <button onClick={() => setShowActivity(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 12, fontWeight: 700, fontFamily: F, padding: 0 }}>
            {showActivity ? "▲" : "▼"} Activity ({list.activityLog.length})
          </button>
          {showActivity && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {list.activityLog.map((a, i) => (
                <div key={i} style={{ fontSize: 12, color: "#5a3a1a", display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#fff", borderRadius: 8, border: "1px solid rgba(196,122,46,0.1)" }}>
                  <span>{(ACTION_COPY[a.action] || (() => a.action))(a)}</span>
                  <span style={{ color: "#9B7450", flexShrink: 0, marginLeft: 10 }}>{new Date(a.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, list, token, shareToken, onChanged }) {
  const [busy, setBusy] = useState(false);
  const canEdit = list.status === "open";

  const call = async (method, path, body) => {
    setBusy(true);
    try {
      await fetch(`${BASE_URL}/gift-lists/${shareToken}/items${path}`, {
        method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include", body: body ? JSON.stringify(body) : undefined,
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid rgba(196,122,46,0.08)" }}>
      {item.imageUrl && <img src={item.imageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{item.productName}</div>
        <div style={{ fontSize: 11, color: "#9B7450" }}>Added by {item.addedByName} · ₹{item.pricePerUnit.toLocaleString("en-IN")} each</div>
      </div>
      {canEdit ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button disabled={busy} onClick={() => call("PATCH", `/${item._id}`, { quantity: Math.max(1, item.quantity - 1) })}
            style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(196,122,46,0.25)", background: "#fff", color: GOLD, cursor: "pointer", fontSize: 14 }}>−</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: INK, minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
          <button disabled={busy} onClick={() => call("PATCH", `/${item._id}`, { quantity: item.quantity + 1 })}
            style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(196,122,46,0.25)", background: "#fff", color: GOLD, cursor: "pointer", fontSize: 14 }}>+</button>
        </div>
      ) : (
        <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>×{item.quantity}</span>
      )}
      <span style={{ fontSize: 13, fontWeight: 800, color: GOLD, width: 70, textAlign: "right" }}>₹{item.subtotal.toLocaleString("en-IN")}</span>
      {canEdit && (
        <button disabled={busy} onClick={() => call("DELETE", `/${item._id}`)}
          style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: 13, cursor: "pointer", flexShrink: 0 }}>✕</button>
      )}
    </div>
  );
}

function AddItemPicker({ token, shareToken, onAdded }) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    if (!open || products.length) return;
    fetch(`${BASE_URL}/gift-hampers/products`).then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
  }, [open]); // eslint-disable-line

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 30);

  const add = async (productId) => {
    setAdding(productId);
    try {
      await fetch(`${BASE_URL}/gift-lists/${shareToken}/items`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include", body: JSON.stringify({ productId, quantity: 1 }),
      });
      onAdded();
    } finally {
      setAdding(null);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ width: "100%", padding: "13px", borderRadius: 12, border: `1.5px dashed ${GOLD}`, background: "rgba(196,122,46,0.04)", color: GOLD, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
        + Add an item
      </button>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(196,122,46,0.18)", padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hampers, cakes, gifts…"
          style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: F, fontSize: 13, outline: "none" }} />
        <button onClick={() => setOpen(false)} style={{ marginLeft: 8, background: "none", border: "none", color: "#9B7450", fontSize: 18, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map(p => (
          <button key={p._id} disabled={adding === p._id} onClick={() => add(p._id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, border: "1px solid rgba(196,122,46,0.12)", background: "#FDFAF0", cursor: "pointer", textAlign: "left", fontFamily: F }}>
            {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "#9B7450" }}>₹{p.pricePerUnit.toLocaleString("en-IN")}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, flexShrink: 0 }}>{adding === p._id ? "Adding…" : "+ Add"}</span>
          </button>
        ))}
        {filtered.length === 0 && <div style={{ fontSize: 12.5, color: "#9B7450", textAlign: "center", padding: "16px 0" }}>No matches.</div>}
      </div>
    </div>
  );
}

function FinalizeBlock({ token, shareToken, disabled, onFinalized }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", deliveryAddress: "", city: "", pincode: "", specialInstructions: "" });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: F, fontSize: 13, outline: "none", boxSizing: "border-box" };

  const submit = async () => {
    setErr("");
    if (!form.customerName || !form.customerPhone || !form.deliveryAddress || !form.city) { setErr("Please fill in all required fields."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/gift-lists/${shareToken}/finalize`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include", body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Couldn't finalize — try again."); return; }
      onFinalized();
    } catch {
      setErr("Couldn't finalize — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button disabled={disabled} onClick={() => setOpen(true)}
        style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: disabled ? "rgba(196,122,46,0.3)" : `linear-gradient(135deg,${GOLD},#D4A848)`, color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 15, cursor: disabled ? "default" : "pointer" }}>
        {disabled ? "Add items to finalize" : "Finalize & Checkout →"}
      </button>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(196,122,46,0.18)", padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: INK, marginBottom: 10 }}>Delivery details</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <input style={inp} placeholder="Your name *" value={form.customerName} onChange={e => set("customerName", e.target.value)} />
        <input style={inp} placeholder="Phone number *" value={form.customerPhone} onChange={e => set("customerPhone", e.target.value)} />
        <input style={inp} placeholder="Delivery address *" value={form.deliveryAddress} onChange={e => set("deliveryAddress", e.target.value)} />
        <div style={{ display: "flex", gap: 9 }}>
          <input style={inp} placeholder="City *" value={form.city} onChange={e => set("city", e.target.value)} />
          <input style={inp} placeholder="Pincode" value={form.pincode} onChange={e => set("pincode", e.target.value)} />
        </div>
        <textarea style={{ ...inp, height: 56, resize: "vertical" }} placeholder="Notes (optional)" value={form.specialInstructions} onChange={e => set("specialInstructions", e.target.value)} />
      </div>
      {err && <div style={{ fontSize: 12, color: "#DC2626", marginTop: 10 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={() => setOpen(false)} style={{ padding: "11px 16px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#6B3A1F", fontFamily: F, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
        <button disabled={submitting} onClick={submit} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: submitting ? "rgba(196,122,46,0.4)" : GOLD, color: "#fff", fontFamily: F, fontWeight: 800, cursor: submitting ? "default" : "pointer" }}>
          {submitting ? "Placing order…" : "Confirm & Place Order"}
        </button>
      </div>
    </div>
  );
}

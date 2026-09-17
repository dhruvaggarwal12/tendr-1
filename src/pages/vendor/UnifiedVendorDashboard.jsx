import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";

// ── Tokens ─────────────────────────────────────────────────────────────────────
const gold  = "#C47A2E";
const goldLt= "#CCAB4A";
const ink   = "#1C0A04";
const cream = "#FAF7F2";
const muted = "#9B7450";
const font  = "'Outfit', sans-serif";
const BASE  = import.meta.env.VITE_BASE_URL;

const aH = (t) => ({ Authorization: `Bearer ${t}`, "Content-Type": "application/json" });
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const todayStr = () => new Date().toISOString().slice(0, 10);
const parseJwt = (t) => { try { return JSON.parse(atob(t.split(".")[1])); } catch { return {}; } };

// ── Type-specific spec options ─────────────────────────────────────────────────
const SPEC_OPTS = {
  DJ:              { "Setup Type": ["Basic","Full Production","LED Wall","Full Production + LED"], "Event Types": ["House Party","Corporate","Venue","Wedding","College"] },
  Anchor:          { Speciality: ["Corporate Events","Wedding","Birthday","Comedy","Bilingual"] },
  "Emcee/Host":    { Speciality: ["Corporate","Social","Award Show","Product Launch"] },
  Band:            { Genre: ["Bollywood","Rock","Jazz","Sufi","Classical","Fusion"], "Band Size": ["Duo","Trio","4-piece","6-piece","10+"] },
  Singer:          { Genre: ["Bollywood","Ghazal","Sufi","Classical","Indie","Folk"] },
  Choreographer:   { Style: ["Bollywood","Contemporary","Hip-hop","Kathak","Wedding Sangeet"] },
  Caterer:         { Cuisine: ["North Indian","South Indian","Punjabi","Chinese","Snacks","Desserts","Italian"], "Service Style": ["Buffet","Live Counter","Food Station","Family Style"] },
  Decorator:       { "Decoration Type": ["Floral","Balloon","Lighting","Fabric","Backdrop","Minimalist"], Theme: ["Floral","Balloon","Rustic","Modern","Luxe","Boho"] },
  Photographer:    { Services: ["Photography","Videography","Both","Drone"], Style: ["Candid","Traditional","Cinematic","Editorial"] },
  Videographer:    { Services: ["Highlights Reel","Cinematic Film","Documentary","Live Stream","Social Reels"], Style: ["Cinematic","Traditional","Short Film"] },
  "Makeup Artist": { Specialisation: ["Bridal","Party","Editorial","Airbrush","HD","Engagement"], Products: ["MAC","Huda Beauty","Kryolan","Fenty","Mixed Professional"] },
  "Mehendi Artist":{ Style: ["Rajasthani","Arabic","Indo-Arabic","Bridal Full Arm","Minimalist"], Occasions: ["Bridal","Pre-Wedding","Karva Chauth","Teej","Corporate"] },
  Florist:         { "Arrangement Types": ["Centrepieces","Bouquets","Mandap Décor","Entrance Arch","Garlands"], "Flower Preference": ["Roses","Orchids","Lilies","Seasonal Mix","Marigolds"] },
  "Wedding Planner":{ "Planning Type": ["Full Planning","Partial","Day-of Coordination","Virtual"], "Event Size": ["Intimate (<50)","Mid-size (50–200)","Grand (200+)","Destination"] },
  Bartender:       { "Bar Type": ["Open Bar","Mocktail Bar","Craft Cocktail","Flair","Beer & Wine"], Beverages: ["Spirits","Wines","Craft Beer","Mocktails","Signature Cocktails"] },
  "Tent House":    { "Tent Type": ["Shamiyana","Pagoda","German Shed","Clear Span","Stretch"], Furniture: ["Banquet Chairs","Chiavari","Round Tables","Rectangle Tables","Loungers"] },
};

// ── Micro components ───────────────────────────────────────────────────────────
const Ico = ({ d, sz = 18, c = "currentColor", fill = "none" }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Stars = ({ r = 0, sz = 13 }) => (
  <span style={{ display: "inline-flex", gap: 1 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={sz} height={sz} viewBox="0 0 24 24" fill={i <= Math.round(r) ? goldLt : "none"} stroke={goldLt} strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </span>
);

const Pill = ({ s }) => {
  const m = { CONFIRMED:["#DCFCE7","#16A34A"], Confirmed:["#DCFCE7","#16A34A"], PENDING:["#FEF9C3","#CA8A04"], Pending:["#FEF9C3","#CA8A04"], CANCELLED:["#FEE2E2","#DC2626"], Cancelled:["#FEE2E2","#DC2626"], COMPLETED:["#DBEAFE","#2563EB"], Completed:["#DBEAFE","#2563EB"], Lead:["#F3F4F6","#6B7280"], Prospect:["#EDE9FE","#7C3AED"], Draft:["#F3F4F6","#6B7280"], Sent:["#DBEAFE","#2563EB"], Accepted:["#DCFCE7","#16A34A"], Paid:["#D1FAE5","#059669"] };
  const [bg, tc] = m[s] || ["#F3F4F6","#6B7280"];
  return <span style={{ background: bg, color: tc, borderRadius: 100, padding: "2px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{s}</span>;
};

const Card = ({ children, style }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)", ...style }}>
    {children}
  </div>
);

const SL = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{children}</div>
);

const Inp = ({ label, value, onChange, type = "text", placeholder = "", style }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>{label}</label>}
    <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box", ...style }} />
  </div>
);

const Sel = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>{label}</label>}
    <select value={value || ""} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }}>
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Chips = ({ options, selected = [], onChange }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {options.map(o => (
      <button key={o} onClick={() => onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o])}
        style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: font,
          border: selected.includes(o) ? `1.5px solid ${gold}` : "1px solid rgba(196,122,46,0.2)",
          background: selected.includes(o) ? "rgba(196,122,46,0.1)" : "#fff",
          color: selected.includes(o) ? gold : muted }}>
        {o}
      </button>
    ))}
  </div>
);

// Toast
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "success") => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  const ToastUI = (
    <div style={{ position: "fixed", bottom: 80, right: 16, zIndex: 99999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type === "error" ? "#FEE2E2" : "#DCFCE7", color: t.type === "error" ? "#991B1B" : "#166534", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 600, fontFamily: font, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", maxWidth: 280 }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { show, ToastUI };
}

// Stat tile
const StatTile = ({ label, value, sub, icon }) => (
  <Card style={{ flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color: ink, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{sub}</div>}
  </Card>
);

// Modal wrapper
const Modal = ({ onClose, children, title, width = 480 }) => (
  <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000, backdropFilter: "blur(3px)" }} />
    <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: `min(${width}px, 95vw)`, background: "#fff", borderRadius: 20, zIndex: 10001, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflow: "auto" }}>
      <div style={{ padding: "18px 20px 12px", borderBottom: "1px solid rgba(196,122,46,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: ink, fontFamily: font }}>{title}</div>
        <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(196,122,46,0.2)", background: cream, cursor: "pointer", fontSize: 16, color: muted, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  </>
);

const Btn = ({ children, onClick, variant = "primary", disabled, style }) => {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${gold}, ${goldLt})`, color: "#fff", border: "none" },
    secondary: { background: "#fff", color: gold, border: `1.5px solid ${gold}` },
    danger: { background: "#FEE2E2", color: "#DC2626", border: "1px solid #FCA5A5" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: "9px 20px", borderRadius: 10, fontFamily: font, fontSize: 13, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1, ...styles[variant], ...style }}>
      {children}
    </button>
  );
};

// ── Outside Order Modal (Details + Payments + Expenses + Crew) ─────────────────
const EVENT_TYPES = ["Birthday Party","Wedding","Corporate Event","Baby Shower","Anniversary","House Party","Festival","Other"];
const SOURCES = ["WhatsApp","Instagram","Facebook","Referral","Walk-in","Phone","Tendr Profile","Other"];
const PAY_METHODS = ["Cash","UPI","Bank Transfer","Cheque","Online"];
const EXP_CATS = ["Travel","Materials","Crew","Equipment","Food","Misc"];
const CREW_ROLES = ["Assistant","Co-anchor","Technician","Makeup","Photographer","Driver","Other"];

function OutsideOrderModal({ order, onClose, onSave, token }) {
  const isEdit = !!order?._id;
  const [tab, setTab] = useState("details");
  const [form, setForm] = useState({
    clientName: "", clientPhone: "", eventType: "", eventDate: "", venue: "", city: "",
    amount: "", paymentStatus: "Pending", status: "Pending", source: "WhatsApp",
    notes: "", contractTerms: "",
    payments: [], expenses: [], crew: [],
    ...order,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addPayment = () => set("payments", [...(form.payments || []), { id: uid(), date: todayStr(), amount: "", method: "Cash", note: "" }]);
  const addExpense = () => set("expenses", [...(form.expenses || []), { id: uid(), date: todayStr(), description: "", amount: "", category: "Misc" }]);
  const addCrew    = () => set("crew", [...(form.crew || []), { id: uid(), name: "", role: "Assistant", fee: "" }]);

  const paid = (form.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalExp = (form.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const profit = Number(form.amount || 0) - totalExp;

  const handleSave = async () => {
    if (!form.clientName) return;
    setSaving(true);
    await onSave(form, isEdit);
    setSaving(false);
  };

  const TABS = [
    { id: "details", label: "Details" },
    { id: "payments", label: `Payments (${fmt(paid)})` },
    { id: "expenses", label: `Expenses (${fmt(totalExp)})` },
    { id: "crew", label: `Crew (${(form.crew || []).length})` },
  ];

  return (
    <Modal onClose={onClose} title={isEdit ? "Edit Order" : "Add Outside Order"} width={560}>
      <div style={{ display: "flex", gap: 4, marginBottom: 18, overflowX: "auto", borderBottom: "1px solid rgba(196,122,46,0.1)", paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "7px 14px", border: "none", background: "none", fontFamily: font, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? gold : muted, cursor: "pointer", borderBottom: tab === t.id ? `2.5px solid ${gold}` : "2.5px solid transparent", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "details" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Inp label="Client Name *" value={form.clientName} onChange={v => set("clientName", v)} />
            <Inp label="Client Phone" value={form.clientPhone} onChange={v => set("clientPhone", v)} type="tel" />
            <Sel label="Event Type" value={form.eventType} onChange={v => set("eventType", v)} options={EVENT_TYPES} />
            <Inp label="Event Date" value={form.eventDate} onChange={v => set("eventDate", v)} type="date" />
            <Inp label="Venue" value={form.venue} onChange={v => set("venue", v)} />
            <Inp label="City" value={form.city} onChange={v => set("city", v)} />
            <Inp label="Total Amount (₹)" value={form.amount} onChange={v => set("amount", v)} type="number" />
            <Sel label="Source" value={form.source} onChange={v => set("source", v)} options={SOURCES} />
            <Sel label="Payment Status" value={form.paymentStatus} onChange={v => set("paymentStatus", v)} options={["Pending","Partial","Paid"]} />
            <Sel label="Status" value={form.status} onChange={v => set("status", v)} options={["Pending","Confirmed","Completed","Cancelled"]} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Notes</label>
            <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box", resize: "vertical" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Contract Terms</label>
            <textarea value={form.contractTerms || ""} onChange={e => set("contractTerms", e.target.value)} rows={4} placeholder="Write contract terms here…"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, boxSizing: "border-box", resize: "vertical" }} />
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: muted }}>Total: {fmt(form.amount)} · Paid: {fmt(paid)} · Due: {fmt(Math.max(0, Number(form.amount || 0) - paid))}</div>
            <Btn onClick={addPayment} variant="secondary" style={{ padding: "6px 14px", fontSize: 12 }}>+ Add</Btn>
          </div>
          {(form.payments || []).map((p, i) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input type="date" value={p.date} onChange={e => set("payments", form.payments.map((x, j) => j === i ? { ...x, date: e.target.value } : x))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
              <input type="number" placeholder="₹ Amount" value={p.amount} onChange={e => set("payments", form.payments.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
              <select value={p.method} onChange={e => set("payments", form.payments.map((x, j) => j === i ? { ...x, method: e.target.value } : x))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }}>
                {PAY_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
              <button onClick={() => set("payments", form.payments.filter((_, j) => j !== i))} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          ))}
          {!(form.payments || []).length && <div style={{ color: muted, fontSize: 13, textAlign: "center", padding: 20 }}>No payments logged yet</div>}
        </div>
      )}

      {tab === "expenses" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: muted }}>Total expenses: {fmt(totalExp)} · Profit: {fmt(profit)}</div>
            <Btn onClick={addExpense} variant="secondary" style={{ padding: "6px 14px", fontSize: 12 }}>+ Add</Btn>
          </div>
          {(form.expenses || []).map((e, i) => (
            <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input placeholder="Description" value={e.description} onChange={ev => set("expenses", form.expenses.map((x, j) => j === i ? { ...x, description: ev.target.value } : x))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
              <input type="number" placeholder="₹" value={e.amount} onChange={ev => set("expenses", form.expenses.map((x, j) => j === i ? { ...x, amount: ev.target.value } : x))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
              <select value={e.category} onChange={ev => set("expenses", form.expenses.map((x, j) => j === i ? { ...x, category: ev.target.value } : x))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }}>
                {EXP_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={() => set("expenses", form.expenses.filter((_, j) => j !== i))} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          ))}
          {!(form.expenses || []).length && <div style={{ color: muted, fontSize: 13, textAlign: "center", padding: 20 }}>No expenses logged yet</div>}
        </div>
      )}

      {tab === "crew" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: muted }}>Crew fee total: {fmt((form.crew || []).reduce((s, c) => s + Number(c.fee || 0), 0))}</div>
            <Btn onClick={addCrew} variant="secondary" style={{ padding: "6px 14px", fontSize: 12 }}>+ Add</Btn>
          </div>
          {(form.crew || []).map((c, i) => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input placeholder="Name" value={c.name} onChange={e => set("crew", form.crew.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
              <select value={c.role} onChange={e => set("crew", form.crew.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }}>
                {CREW_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <input type="number" placeholder="Fee ₹" value={c.fee} onChange={e => set("crew", form.crew.map((x, j) => j === i ? { ...x, fee: e.target.value } : x))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
              <button onClick={() => set("crew", form.crew.filter((_, j) => j !== i))} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          ))}
          {!(form.crew || []).length && <div style={{ color: muted, fontSize: 13, textAlign: "center", padding: 20 }}>No crew added yet</div>}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(196,122,46,0.1)" }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Add Order"}</Btn>
      </div>
    </Modal>
  );
}

// ── Quote Modal ────────────────────────────────────────────────────────────────
function QuoteModal({ quote, onClose, onSave }) {
  const isEdit = !!quote?.id;
  const [form, setForm] = useState({
    clientName: "", clientPhone: "", eventType: "", eventDate: "", discount: "", notes: "", status: "Draft",
    items: [{ id: uid(), desc: "", qty: 1, rate: "" }],
    ...quote,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => set("items", form.items.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const addItem = () => set("items", [...form.items, { id: uid(), desc: "", qty: 1, rate: "" }]);
  const removeItem = (i) => set("items", form.items.filter((_, j) => j !== i));

  const subtotal = form.items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.rate || 0), 0);
  const disc = Number(form.discount || 0);
  const total = Math.max(0, subtotal - disc);

  const handleSave = async () => {
    if (!form.clientName) return;
    setSaving(true);
    await onSave({ ...form, total });
    setSaving(false);
  };

  return (
    <Modal onClose={onClose} title={isEdit ? "Edit Quote" : "New Quote"} width={540}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Inp label="Client Name *" value={form.clientName} onChange={v => set("clientName", v)} />
        <Inp label="Client Phone" value={form.clientPhone} onChange={v => set("clientPhone", v)} type="tel" />
        <Sel label="Event Type" value={form.eventType} onChange={v => set("eventType", v)} options={EVENT_TYPES} />
        <Inp label="Event Date" value={form.eventDate} onChange={v => set("eventDate", v)} type="date" />
      </div>
      <SL>Line Items</SL>
      <div style={{ marginBottom: 12 }}>
        {form.items.map((it, i) => (
          <div key={it.id} style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px auto", gap: 6, marginBottom: 6, alignItems: "center" }}>
            <input placeholder="Description" value={it.desc} onChange={e => setItem(i, "desc", e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
            <input type="number" placeholder="Qty" value={it.qty} onChange={e => setItem(i, "qty", e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, textAlign: "center" }} />
            <input type="number" placeholder="Rate ₹" value={it.rate} onChange={e => setItem(i, "rate", e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
            <button onClick={() => removeItem(i)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", fontSize: 14 }}>×</button>
          </div>
        ))}
        <button onClick={addItem} style={{ fontSize: 13, color: gold, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: font }}>+ Add item</button>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 14 }}>
        <Inp label="Discount (₹)" value={form.discount} onChange={v => set("discount", v)} type="number" style={{ marginBottom: 0 }} />
        <div style={{ textAlign: "right", flex: 1 }}>
          <div style={{ fontSize: 12, color: muted }}>Subtotal: {fmt(subtotal)}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: gold }}>Total: {fmt(total)}</div>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Notes</label>
        <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box", resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 14, borderTop: "1px solid rgba(196,122,46,0.1)" }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : isEdit ? "Save" : "Create Quote"}</Btn>
      </div>
    </Modal>
  );
}

// ── Bar Chart (SVG) ────────────────────────────────────────────────────────────
function BarChart({ data, color = gold }) {
  if (!data?.length) return <div style={{ color: muted, fontSize: 13, padding: 20, textAlign: "center" }}>No data yet</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 500, H = 160, padL = 40, padB = 30, padT = 20;
  const barW = Math.min(40, (W - padL) / data.length - 8);
  const gap = (W - padL) / data.length;
  const y = v => padT + (H - padB - padT) * (1 - v / max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {data.map((d, i) => {
        const x = padL + i * gap + (gap - barW) / 2;
        const barH = H - padB - y(d.value);
        return (
          <g key={i}>
            <rect x={x} y={y(d.value)} width={barW} height={Math.max(2, barH)} rx={4} fill={color} opacity={0.85} />
            {d.value > 0 && <text x={x + barW / 2} y={y(d.value) - 4} textAnchor="middle" fontSize={10} fill={ink} fontFamily={font} fontWeight={700}>{d.value > 999 ? fmt(d.value) : d.value}</text>}
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={10} fill={muted} fontFamily={font}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "home",     label: "Home",       icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: "work",     label: "Work",       icon: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" },
  { id: "calendar", label: "Calendar",   icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" },
  { id: "clients",  label: "Clients",    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { id: "quotes",   label: "Quotes",     icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" },
  { id: "money",    label: "Money",      icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { id: "packages", label: "Packages",   icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
  { id: "reviews",  label: "Reviews",    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { id: "insights", label: "Insights",   icon: "M18 20V10M12 20V4M6 20v-6" },
  { id: "flyer",    label: "Flyer",      icon: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" },
  { id: "profile",  label: "Profile",    icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { id: "grow",     label: "Grow",       icon: "M12 22V12M12 12C12 12 8 7 8 4a4 4 0 0 1 8 0c0 3-4 8-4 8z" },
];

export default function UnifiedVendorDashboard() {
  const navigate    = useNavigate();
  const dispatch    = useDispatch();
  const token       = useSelector(s => s.auth?.token);
  const { show: toast, ToastUI } = useToast();

  const [tab, setTab]       = useState("home");
  const [vendor, setVendor] = useState(null);

  // data states
  const [tendrBookings, setTendrBookings] = useState([]);
  const [outside, setOutside]             = useState([]);
  const [blockedDates, setBlockedDates]   = useState([]);
  const [crmClients, setCrmClients]       = useState([]);
  const [quotes, setQuotes]               = useState([]);
  const [expenses, setExpenses]           = useState([]);
  const [packages, setPackages]           = useState([]);
  const [reviews, setReviews]             = useState([]);
  const [reminders, setReminders]         = useState([]);
  const [linktree, setLinktree]           = useState({ title: "", bio: "", links: [] });

  const [loading, setLoading]     = useState(true);
  const [calMonth, setCalMonth]   = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });

  // modals
  const [orderModal, setOrderModal]     = useState(null); // null | 'add' | order object
  const [quoteModal, setQuoteModal]     = useState(null);
  const [clientModal, setClientModal]   = useState(null);
  const [pkgModal, setPkgModal]         = useState(null);
  const [expModal, setExpModal]         = useState(null);
  const [remModal, setRemModal]         = useState(null);

  const [workView, setWorkView]     = useState("tendr"); // "tendr" | "outside"
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [specEdit, setSpecEdit]     = useState(false);
  const [specForm, setSpecForm]     = useState({});

  // flyer
  const [flyerBg, setFlyerBg]         = useState("#C47A2E");
  const [flyerTagline, setFlyerTagline] = useState("");
  const [ltEdit, setLtEdit]           = useState(false);
  const [ltForm, setLtForm]           = useState({ title: "", bio: "", links: [] });

  const vendorId  = vendor?._id;
  const svcType   = vendor?.serviceType || "";
  const specOpts  = SPEC_OPTS[svcType] || {};

  // ── Fetch all data on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate("/vendor/login"); return; }
    const h = aH(token);

    Promise.all([
      fetch(`${BASE}/vendor/bookings`, { headers: h }).then(r => r.json()),
      fetch(`${BASE}/vendors/outside-orders`, { headers: h }).then(r => r.json()),
      fetch(`${BASE}/vendors/me/blocked-dates`, { headers: h }).then(r => r.json()),
      fetch(`${BASE}/vendors/me/crm-clients`, { headers: h }).then(r => r.json()),
      fetch(`${BASE}/vendors/me/quotes`, { headers: h }).then(r => r.json()),
      fetch(`${BASE}/vendors/me/expenses`, { headers: h }).then(r => r.json()),
      fetch(`${BASE}/vendors/me/packages`, { headers: h }).then(r => r.json()),
      fetch(`${BASE}/vendors/me/reminders`, { headers: h }).then(r => r.json()),
    ]).then(([bk, ot, bl, cr, qt, ex, pk, rm]) => {
      const v = bk.vendor || bk.bookings?.[0]?.vendor || null;
      if (v) { setVendor(v); setProfileForm(v); setSpecForm(v.spec || {}); setFlyerTagline(v.tagline || ""); setLinktree(v.linktree || { title: "", bio: "", links: [] }); setLtForm(v.linktree || { title: "", bio: "", links: [] }); }
      setTendrBookings(bk.bookings || []);
      setOutside(ot.orders || []);
      setBlockedDates(bl.blockedDates || []);
      setCrmClients(cr.clients || []);
      setQuotes(qt.quotes || []);
      setExpenses(ex.expenses || []);
      setPackages(pk.packages || []);
      setReminders(rm.reminders || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token, navigate]);

  // Fetch vendor profile separately if not got from bookings
  useEffect(() => {
    if (!token || vendor) return;
    const jwt = parseJwt(token);
    if (!jwt.id) return;
    fetch(`${BASE}/vendors/${jwt.id}`, { headers: aH(token) })
      .then(r => r.json())
      .then(d => { if (d._id) { setVendor(d); setProfileForm(d); setSpecForm(d.spec || {}); setFlyerTagline(d.tagline || ""); setLinktree(d.linktree || { title: "", bio: "", links: [] }); setLtForm(d.linktree || { title: "", bio: "", links: [] }); } })
      .catch(() => {});
  }, [token, vendor]);

  // Fetch reviews when that tab opens
  useEffect(() => {
    if (tab !== "reviews" || !vendorId || reviews.length) return;
    fetch(`${BASE}/vendors/${vendorId}/reviews`, { headers: aH(token) })
      .then(r => r.json()).then(d => setReviews(d.reviews || [])).catch(() => {});
  }, [tab, vendorId]);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: font, color: muted }}>Loading…</div>;

  // ── Computed stats ───────────────────────────────────────────────────────────
  const confirmed  = tendrBookings.filter(b => b.status === "CONFIRMED" || b.status === "Confirmed");
  const pending    = tendrBookings.filter(b => b.status === "PENDING"   || b.status === "Pending");
  const totalEarned = outside.filter(o => o.paymentStatus === "Paid").reduce((s, o) => s + Number(o.amount || 0), 0);
  const avgRating  = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "—";

  // ── Calendar helpers ─────────────────────────────────────────────────────────
  const bookedDates = new Set(tendrBookings.filter(b => b.date).map(b => b.date));
  const calDays = (() => {
    const { y, m } = calMonth;
    const first = new Date(y, m, 1).getDay();
    const days  = new Date(y, m + 1, 0).getDate();
    return { first, days };
  })();
  const calStr = (d) => `${calMonth.y}-${String(calMonth.m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const toggleBlock = async (dateStr) => {
    const res = await fetch(`${BASE}/vendors/me/blocked-dates/toggle`, { method: "POST", headers: aH(token), body: JSON.stringify({ date: dateStr }) });
    const d = await res.json();
    setBlockedDates(d.blockedDates || []);
    toast(d.action === "blocked" ? "Date blocked" : "Date unblocked");
  };

  // ── Outside orders ───────────────────────────────────────────────────────────
  const saveOutsideOrder = async (form, isEdit) => {
    const url  = isEdit ? `${BASE}/vendors/outside-orders/${form._id}` : `${BASE}/vendors/outside-orders`;
    const meth = isEdit ? "PATCH" : "POST";
    const res  = await fetch(url, { method: meth, headers: aH(token), body: JSON.stringify(form) });
    const d    = await res.json();
    if (isEdit) setOutside(os => os.map(o => o._id === form._id ? (d.order || form) : o));
    else setOutside(os => [d.order || form, ...os]);
    setOrderModal(null);
    toast(isEdit ? "Order updated" : "Order added");
  };

  const deleteOrder = async (id) => {
    await fetch(`${BASE}/vendors/outside-orders/${id}`, { method: "DELETE", headers: aH(token) });
    setOutside(os => os.filter(o => o._id !== id));
    toast("Order deleted");
  };

  // ── Quotes ───────────────────────────────────────────────────────────────────
  const saveQuote = async (form) => {
    const isEdit = !!form.id;
    const url  = isEdit ? `${BASE}/vendors/me/quotes/${form.id}` : `${BASE}/vendors/me/quotes`;
    const meth = isEdit ? "PATCH" : "POST";
    const res  = await fetch(url, { method: meth, headers: aH(token), body: JSON.stringify(form) });
    const d    = await res.json();
    if (isEdit) setQuotes(qs => qs.map(q => q.id === form.id ? (d.quote || form) : q));
    else setQuotes(qs => [d.quote || form, ...qs]);
    setQuoteModal(null);
    toast("Quote saved");
  };

  const updateQuoteStatus = async (id, status) => {
    await fetch(`${BASE}/vendors/me/quotes/${id}`, { method: "PATCH", headers: aH(token), body: JSON.stringify({ status }) });
    setQuotes(qs => qs.map(q => q.id === id ? { ...q, status } : q));
  };

  const deleteQuote = async (id) => {
    await fetch(`${BASE}/vendors/me/quotes/${id}`, { method: "DELETE", headers: aH(token) });
    setQuotes(qs => qs.filter(q => q.id !== id));
    toast("Quote deleted");
  };

  // ── CRM Clients ──────────────────────────────────────────────────────────────
  const saveClient = async (form) => {
    const isEdit = !!form.id;
    const url  = isEdit ? `${BASE}/vendors/me/crm-clients/${form.id}` : `${BASE}/vendors/me/crm-clients`;
    const meth = isEdit ? "PATCH" : "POST";
    const res  = await fetch(url, { method: meth, headers: aH(token), body: JSON.stringify(form) });
    const d    = await res.json();
    setCrmClients(d.clients || crmClients);
    setClientModal(null);
    toast("Client saved");
  };

  const deleteClient = async (id) => {
    await fetch(`${BASE}/vendors/me/crm-clients/${id}`, { method: "DELETE", headers: aH(token) });
    setCrmClients(cs => cs.filter(c => c.id !== id));
    toast("Client removed");
  };

  // ── Packages ─────────────────────────────────────────────────────────────────
  const savePackage = async (form) => {
    const isEdit = !!form.id && packages.some(p => p.id === form.id);
    const url  = isEdit ? `${BASE}/vendors/me/packages/${form.id}` : `${BASE}/vendors/me/packages`;
    const meth = isEdit ? "PATCH" : "POST";
    const res  = await fetch(url, { method: meth, headers: aH(token), body: JSON.stringify(form) });
    const d    = await res.json();
    setPackages(d.packages || packages);
    setPkgModal(null);
    toast("Package saved");
  };

  const deletePackage = async (id) => {
    await fetch(`${BASE}/vendors/me/packages/${id}`, { method: "DELETE", headers: aH(token) });
    setPackages(ps => ps.filter(p => p.id !== id));
    toast("Package deleted");
  };

  // ── Expenses ─────────────────────────────────────────────────────────────────
  const addExpense = async (form) => {
    const res = await fetch(`${BASE}/vendors/me/expenses`, { method: "POST", headers: aH(token), body: JSON.stringify(form) });
    const d   = await res.json();
    setExpenses(d.expenses || expenses);
    setExpModal(null);
    toast("Expense logged");
  };

  const deleteExpense = async (id) => {
    await fetch(`${BASE}/vendors/me/expenses/${id}`, { method: "DELETE", headers: aH(token) });
    setExpenses(es => es.filter(e => e.id !== id));
    toast("Expense deleted");
  };

  // ── Reminders ────────────────────────────────────────────────────────────────
  const addReminder = async (form) => {
    const res = await fetch(`${BASE}/vendors/me/reminders`, { method: "POST", headers: aH(token), body: JSON.stringify(form) });
    const d   = await res.json();
    setReminders(d.reminders || reminders);
    setRemModal(null);
    toast("Reminder added");
  };

  const toggleReminder = async (id, done) => {
    await fetch(`${BASE}/vendors/me/reminders/${id}`, { method: "PATCH", headers: aH(token), body: JSON.stringify({ done }) });
    setReminders(rs => rs.map(r => r.id === id ? { ...r, done } : r));
  };

  const deleteReminder = async (id) => {
    await fetch(`${BASE}/vendors/me/reminders/${id}`, { method: "DELETE", headers: aH(token) });
    setReminders(rs => rs.filter(r => r.id !== id));
  };

  // ── Profile save ──────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!vendorId) return;
    const res = await fetch(`${BASE}/vendors/${vendorId}`, { method: "PATCH", headers: aH(token), body: JSON.stringify({ ...profileForm, tagline: flyerTagline }) });
    const d   = await res.json();
    if (d._id || d.vendor) { setVendor(d._id ? d : d.vendor); toast("Profile saved"); }
    setProfileEdit(false);
  };

  const saveSpec = async () => {
    if (!vendorId) return;
    await fetch(`${BASE}/vendors/${vendorId}`, { method: "PATCH", headers: aH(token), body: JSON.stringify({ spec: specForm }) });
    setSpecEdit(false);
    toast("Saved");
  };

  // ── Linktree save ─────────────────────────────────────────────────────────────
  const saveLinktree = async () => {
    const res = await fetch(`${BASE}/vendors/me/linktree`, { method: "PATCH", headers: aH(token), body: JSON.stringify(ltForm) });
    const d   = await res.json();
    setLinktree(d.linktree || ltForm);
    setLtEdit(false);
    toast("Links saved");
  };

  // ── Insights data ─────────────────────────────────────────────────────────────
  const monthlyBookings = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-IN", { month: "short" });
      const value = outside.filter(o => (o.eventDate || "").startsWith(key)).length
                  + tendrBookings.filter(b => (b.date || "").startsWith(key)).length;
      return { label, value };
    });
  })();

  const monthlyRevenue = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-IN", { month: "short" });
      const value = outside.filter(o => (o.eventDate || "").startsWith(key) && o.paymentStatus === "Paid").reduce((s, o) => s + Number(o.amount || 0), 0);
      return { label, value };
    });
  })();

  // ── Render ────────────────────────────────────────────────────────────────────
  const isMob = window.innerWidth < 640;

  return (
    <div style={{ minHeight: "100vh", background: cream, fontFamily: font }}>
      {ToastUI}

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>
            {(vendor?.name || "V")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: ink }}>{vendor?.name || "Vendor"}</div>
            <div style={{ fontSize: 11, color: muted }}>{vendor?.serviceType || ""}</div>
          </div>
        </div>
        <button onClick={() => { dispatch(logout()); navigate("/vendor/login"); }}
          style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", background: "#fff", color: muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
          Sign out
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", overflowX: "auto", display: "flex", gap: 0, WebkitOverflowScrolling: "touch" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? gold : muted, borderBottom: tab === t.id ? `2.5px solid ${gold}` : "2.5px solid transparent", whiteSpace: "nowrap", flexShrink: 0 }}>
            <Ico d={t.icon} sz={15} c={tab === t.id ? gold : muted} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 100px" }}>

        {/* ── HOME ── */}
        {tab === "home" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: ink, marginBottom: 20 }}>
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {vendor?.name?.split(" ")[0] || "there"}!
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <StatTile label="Confirmed" value={confirmed.length} sub="Tendr bookings" />
              <StatTile label="Pending" value={pending.length} sub="Awaiting confirmation" />
              <StatTile label="Total Earned" value={fmt(totalEarned)} sub="From outside orders" />
              <StatTile label="Rating" value={avgRating} sub={`${reviews.length} reviews`} />
            </div>

            {confirmed.length > 0 && (
              <Card style={{ marginBottom: 16 }}>
                <SL>Upcoming Tendr Bookings</SL>
                {confirmed.slice(0, 4).map(b => (
                  <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(196,122,46,0.07)" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{b.customerName || "Customer"}</div>
                      <div style={{ fontSize: 12, color: muted }}>{b.date} · {b.city || b.location || ""}</div>
                    </div>
                    <Pill s="Confirmed" />
                  </div>
                ))}
              </Card>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[["Add Outside Order", () => { setOrderModal("add"); setTab("work"); setWorkView("outside"); }], ["New Quote", () => { setQuoteModal({}); setTab("quotes"); }], ["Add Client", () => { setClientModal({}); setTab("clients"); }], ["Add Reminder", () => { setRemModal({}); setTab("grow"); }]].map(([label, action]) => (
                <button key={label} onClick={action}
                  style={{ padding: "10px 18px", borderRadius: 12, border: `1.5px solid ${gold}`, background: "#fff", color: gold, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: font }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── WORK ── */}
        {tab === "work" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["tendr","outside"].map(v => (
                <button key={v} onClick={() => setWorkView(v)}
                  style={{ padding: "8px 20px", borderRadius: 10, fontFamily: font, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", background: workView === v ? `linear-gradient(135deg,${gold},${goldLt})` : "rgba(196,122,46,0.08)", color: workView === v ? "#fff" : gold }}>
                  {v === "tendr" ? "Tendr Bookings" : "Outside Orders"}
                </button>
              ))}
              {workView === "outside" && <Btn onClick={() => setOrderModal("add")} style={{ marginLeft: "auto" }}>+ Add Order</Btn>}
            </div>

            {workView === "tendr" && (
              <div>
                {tendrBookings.length === 0 && <div style={{ color: muted, fontSize: 14, textAlign: "center", padding: 40 }}>No Tendr bookings yet</div>}
                {["Confirmed","Pending","Completed","Cancelled"].map(status => {
                  const bks = tendrBookings.filter(b => (b.status || "").toLowerCase() === status.toLowerCase());
                  if (!bks.length) return null;
                  return (
                    <div key={status} style={{ marginBottom: 20 }}>
                      <SL>{status}</SL>
                      {bks.map(b => (
                        <Card key={b._id} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{b.customerName || "Customer"}</div>
                              <div style={{ fontSize: 12, color: muted, marginTop: 3 }}>{b.date} · {b.serviceType || svcType} · {b.city || b.location || ""}</div>
                              {b.amount && <div style={{ fontSize: 14, fontWeight: 700, color: gold, marginTop: 4 }}>{fmt(b.amount)}</div>}
                            </div>
                            <Pill s={status} />
                          </div>
                        </Card>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {workView === "outside" && (
              <div>
                {outside.length === 0 && <div style={{ color: muted, fontSize: 14, textAlign: "center", padding: 40 }}>No outside orders yet. Add your first one!</div>}
                {outside.map(o => (
                  <Card key={o._id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{o.clientName}</div>
                          <Pill s={o.status} />
                          <span style={{ fontSize: 11, background: o.paymentStatus === "Paid" ? "#D1FAE5" : "#FEF9C3", color: o.paymentStatus === "Paid" ? "#059669" : "#CA8A04", borderRadius: 100, padding: "2px 8px", fontWeight: 700 }}>{o.paymentStatus}</span>
                        </div>
                        <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{o.eventType} · {o.eventDate} · {o.city || ""}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: gold, marginTop: 4 }}>{fmt(o.amount)}</div>
                        {o.contractTerms && <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>📋 Contract on file</div>}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setOrderModal(o)} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${gold}`, background: "#fff", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit</button>
                        <button onClick={() => { if (confirm("Delete this order?")) deleteOrder(o._id); }} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Delete</button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CALENDAR ── */}
        {tab === "calendar" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: ink }}>
                {new Date(calMonth.y, calMonth.m).toLocaleString("en-IN", { month: "long", year: "numeric" })}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setCalMonth(c => { const d = new Date(c.y, c.m - 1); return { y: d.getFullYear(), m: d.getMonth() }; })} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", background: "#fff", cursor: "pointer", fontSize: 16, color: gold }}>‹</button>
                <button onClick={() => setCalMonth(c => { const d = new Date(c.y, c.m + 1); return { y: d.getFullYear(), m: d.getMonth() }; })} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", background: "#fff", cursor: "pointer", fontSize: 16, color: gold }}>›</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              {[["rgba(196,122,46,0.25)","Booked (Tendr)"],["#FEE2E2","Blocked by you"],["rgba(196,122,46,0.08)","Available"]].map(([bg, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: muted }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: bg, border: "1px solid rgba(196,122,46,0.2)" }} />
                  {label}
                </div>
              ))}
            </div>

            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: muted, padding: "4px 0" }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                {Array.from({ length: calDays.first }, (_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: calDays.days }, (_, i) => {
                  const d = i + 1;
                  const str = calStr(d);
                  const isToday = str === todayStr();
                  const isBooked = bookedDates.has(str);
                  const isBlocked = blockedDates.includes(str);
                  return (
                    <button key={d} onClick={() => !isBooked && toggleBlock(str)}
                      title={isBooked ? "Tendr booking" : isBlocked ? "Click to unblock" : "Click to block"}
                      style={{
                        padding: "8px 4px", borderRadius: 8, border: isToday ? `2px solid ${gold}` : "1px solid rgba(196,122,46,0.15)",
                        background: isBooked ? "rgba(196,122,46,0.25)" : isBlocked ? "#FEE2E2" : "rgba(196,122,46,0.04)",
                        cursor: isBooked ? "default" : "pointer", fontSize: 13, fontWeight: isToday ? 800 : 500,
                        color: isBooked ? gold : isBlocked ? "#DC2626" : ink, fontFamily: font, textAlign: "center",
                      }}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </Card>
            <div style={{ fontSize: 12, color: muted, marginTop: 12 }}>Tap any date to block/unblock. Tendr booked dates cannot be changed here.</div>
          </div>
        )}

        {/* ── CLIENTS ── */}
        {tab === "clients" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: ink }}>Clients</div>
              <Btn onClick={() => setClientModal({})}>+ Add Client</Btn>
            </div>
            {["Lead","Prospect","Confirmed","Completed"].map(status => {
              const list = crmClients.filter(c => c.status === status);
              if (!list.length) return null;
              return (
                <div key={status} style={{ marginBottom: 20 }}>
                  <SL>{status} ({list.length})</SL>
                  {list.map(c => (
                    <Card key={c.id} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: muted, marginTop: 3 }}>{c.phone}{c.eventType ? ` · ${c.eventType}` : ""}{c.eventDate ? ` · ${c.eventDate}` : ""}</div>
                          {c.budget > 0 && <div style={{ fontSize: 13, color: gold, fontWeight: 700, marginTop: 2 }}>Budget: {fmt(c.budget)}</div>}
                          {c.notes && <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{c.notes}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setClientModal(c)} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${gold}`, background: "#fff", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit</button>
                          <button onClick={() => { if (confirm("Remove client?")) deleteClient(c.id); }} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>×</button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            })}
            {crmClients.length === 0 && <div style={{ color: muted, fontSize: 14, textAlign: "center", padding: 40 }}>No clients yet. Add your first!</div>}
          </div>
        )}

        {/* ── QUOTES ── */}
        {tab === "quotes" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: ink }}>Quotes</div>
              <Btn onClick={() => setQuoteModal({})}>+ New Quote</Btn>
            </div>
            {quotes.length === 0 && <div style={{ color: muted, fontSize: 14, textAlign: "center", padding: 40 }}>No quotes yet</div>}
            {quotes.map(q => (
              <Card key={q.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{q.clientName}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 3 }}>{q.eventType}{q.eventDate ? ` · ${q.eventDate}` : ""}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: gold, marginTop: 6 }}>{fmt(q.total || 0)}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <Pill s={q.status} />
                    <div style={{ display: "flex", gap: 4 }}>
                      {["Draft","Sent","Accepted","Paid"].filter(s => s !== q.status).map(s => (
                        <button key={s} onClick={() => updateQuoteStatus(q.id, s)} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(196,122,46,0.2)", background: "#fff", color: muted, fontSize: 11, cursor: "pointer", fontFamily: font }}>{s}</button>
                      ))}
                      <button onClick={() => setQuoteModal(q)} style={{ padding: "3px 8px", borderRadius: 6, border: `1px solid ${gold}`, background: "#fff", color: gold, fontSize: 11, cursor: "pointer", fontFamily: font }}>Edit</button>
                      <button onClick={() => { if (confirm("Delete?")) deleteQuote(q.id); }} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", fontSize: 11, cursor: "pointer", fontFamily: font }}>×</button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── MONEY ── */}
        {tab === "money" && (
          <div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <StatTile label="Total Income" value={fmt(outside.reduce((s,o) => s + Number(o.amount||0), 0))} sub="All outside orders" />
              <StatTile label="Collected" value={fmt(outside.filter(o=>o.paymentStatus==="Paid").reduce((s,o) => s + Number(o.amount||0), 0))} sub="Paid orders" />
              <StatTile label="Expenses" value={fmt(expenses.reduce((s,e) => s + Number(e.amount||0), 0))} sub="All logged expenses" />
              <StatTile label="Net Profit" value={fmt(outside.filter(o=>o.paymentStatus==="Paid").reduce((s,o)=>s+Number(o.amount||0),0) - expenses.reduce((s,e)=>s+Number(e.amount||0),0))} sub="Collected − expenses" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: ink }}>Expenses</div>
              <Btn onClick={() => setExpModal({})}>+ Log Expense</Btn>
            </div>
            {expenses.length === 0 && <div style={{ color: muted, fontSize: 14, textAlign: "center", padding: 30 }}>No expenses logged yet</div>}
            {expenses.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(196,122,46,0.07)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: ink }}>{e.description}</div>
                  <div style={{ fontSize: 12, color: muted }}>{e.category}{e.date ? ` · ${e.date}` : ""}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#DC2626" }}>−{fmt(e.amount)}</div>
                  <button onClick={() => deleteExpense(e.id)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", fontSize: 14 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PACKAGES ── */}
        {tab === "packages" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: ink }}>Packages</div>
              <Btn onClick={() => setPkgModal({})}>+ Add Package</Btn>
            </div>
            {packages.length === 0 && <div style={{ color: muted, fontSize: 14, textAlign: "center", padding: 40 }}>No packages yet. Create one to show on your profile!</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
              {packages.map(p => (
                <Card key={p.id || p._id}>
                  {p.badge && <div style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{p.badge}</div>}
                  <div style={{ fontSize: 16, fontWeight: 800, color: ink }}>{p.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: gold, margin: "8px 0" }}>{fmt(p.price)}<span style={{ fontSize: 12, fontWeight: 500, color: muted }}>/{p.unit}</span></div>
                  {p.bestFor && <div style={{ fontSize: 12, color: muted, marginBottom: 8 }}>Best for: {p.bestFor}</div>}
                  {(p.items || []).length > 0 && (
                    <ul style={{ margin: "0 0 10px", padding: "0 0 0 16px" }}>
                      {p.items.map((it, i) => <li key={i} style={{ fontSize: 12, color: ink, marginBottom: 3 }}>{it}</li>)}
                    </ul>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setPkgModal(p)} style={{ flex: 1, padding: "6px", borderRadius: 8, border: `1px solid ${gold}`, background: "#fff", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit</button>
                    <button onClick={() => { if (confirm("Delete package?")) deletePackage(p.id || p._id); }} style={{ flex: 1, padding: "6px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Delete</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "reviews" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: gold }}>{avgRating}</div>
              <div><Stars r={Number(avgRating)} sz={18} /><div style={{ fontSize: 13, color: muted, marginTop: 4 }}>{reviews.length} reviews</div></div>
            </div>
            {reviews.length === 0 && <div style={{ color: muted, fontSize: 14, textAlign: "center", padding: 40 }}>No reviews yet</div>}
            {reviews.map((r, i) => (
              <Card key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{r.customerName || "Customer"}</div>
                    <Stars r={r.rating} sz={14} />
                    {r.comment && <div style={{ fontSize: 13, color: ink, marginTop: 8, lineHeight: 1.6 }}>{r.comment}</div>}
                  </div>
                  <div style={{ fontSize: 11, color: muted, whiteSpace: "nowrap", marginLeft: 12 }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : ""}</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── INSIGHTS ── */}
        {tab === "insights" && (
          <div>
            <Card style={{ marginBottom: 20 }}>
              <SL>Monthly Bookings (last 6 months)</SL>
              <BarChart data={monthlyBookings} color={gold} />
            </Card>
            <Card style={{ marginBottom: 20 }}>
              <SL>Monthly Revenue — Collected (last 6 months)</SL>
              <BarChart data={monthlyRevenue} color="#22C55E" />
            </Card>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Card style={{ flex: 1, minWidth: 0 }}>
                <SL>Booking Sources</SL>
                {(() => {
                  const srcs = {};
                  outside.forEach(o => { srcs[o.source || "Other"] = (srcs[o.source || "Other"] || 0) + 1; });
                  const total = Object.values(srcs).reduce((s, v) => s + v, 1);
                  return Object.entries(srcs).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                    <div key={k} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: ink }}>{k}</span><span style={{ color: muted, fontWeight: 700 }}>{Math.round(v / total * 100)}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: "rgba(196,122,46,0.1)" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: gold, width: `${Math.round(v / total * 100)}%` }} />
                      </div>
                    </div>
                  ));
                })()}
              </Card>
              <Card style={{ flex: 1, minWidth: 0 }}>
                <SL>Client Pipeline</SL>
                {["Lead","Prospect","Confirmed","Completed"].map(s => {
                  const count = crmClients.filter(c => c.status === s).length;
                  return (
                    <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(196,122,46,0.07)", fontSize: 14 }}>
                      <span style={{ color: ink }}>{s}</span>
                      <span style={{ fontWeight: 800, color: gold }}>{count}</span>
                    </div>
                  );
                })}
              </Card>
            </div>
          </div>
        )}

        {/* ── FLYER ── */}
        {tab === "flyer" && (
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 24 }}>
            <div>
              <SL>Your Flyer</SL>
              {/* Preview */}
              <div id="vendor-flyer" style={{ background: flyerBg, borderRadius: 20, padding: 32, color: "#fff", textAlign: "center", marginBottom: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 6 }}>{vendor?.name || "Your Name"}</div>
                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 12 }}>{vendor?.serviceType || ""}</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 20, lineHeight: 1.5 }}>{flyerTagline || "Your tagline here"}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>📞 {vendor?.phoneNumber || ""}</div>
              </div>
              {/* Colour picker */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["#C47A2E","#1C0A04","#2563EB","#059669","#DC2626","#7C3AED"].map(c => (
                  <button key={c} onClick={() => setFlyerBg(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: flyerBg === c ? "3px solid #fff" : "2px solid rgba(0,0,0,0.1)", outline: flyerBg === c ? `2px solid ${c}` : "none", cursor: "pointer" }} />
                ))}
              </div>
              <Inp label="Tagline" value={flyerTagline} onChange={setFlyerTagline} placeholder="e.g. Delhi's top DJ for 8+ years" />
              <Btn onClick={saveProfile}>Save Tagline</Btn>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <SL>Link Hub</SL>
                {!ltEdit ? <Btn onClick={() => { setLtForm(linktree); setLtEdit(true); }} variant="secondary" style={{ padding: "6px 14px", fontSize: 12 }}>Edit Links</Btn>
                         : <div style={{ display: "flex", gap: 6 }}><Btn onClick={saveLinktree} style={{ padding: "6px 14px", fontSize: 12 }}>Save</Btn><Btn variant="secondary" onClick={() => setLtEdit(false)} style={{ padding: "6px 14px", fontSize: 12 }}>Cancel</Btn></div>}
              </div>
              {/* Tendr profile link */}
              <Card style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: ink, marginBottom: 4 }}>🔗 Your Tendr Profile</div>
                <div style={{ fontSize: 12, color: gold, wordBreak: "break-all" }}>{window.location.origin}/vendor/{vendorId}</div>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/vendor/${vendorId}`); toast("Link copied!"); }}
                  style={{ marginTop: 8, padding: "5px 12px", borderRadius: 8, border: `1px solid ${gold}`, background: "#fff", color: gold, fontSize: 12, cursor: "pointer", fontFamily: font, fontWeight: 600 }}>Copy Link</button>
              </Card>
              {/* Custom links */}
              {ltEdit ? (
                <div>
                  {(ltForm.links || []).map((lk, i) => (
                    <div key={lk.id} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
                      <input value={lk.emoji || "🔗"} onChange={e => setLtForm(f => ({ ...f, links: f.links.map((x, j) => j === i ? { ...x, emoji: e.target.value } : x) }))} style={{ width: 36, textAlign: "center", padding: "8px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 16 }} />
                      <input placeholder="Label" value={lk.label} onChange={e => setLtForm(f => ({ ...f, links: f.links.map((x, j) => j === i ? { ...x, label: e.target.value } : x) }))} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
                      <input placeholder="URL" value={lk.url} onChange={e => setLtForm(f => ({ ...f, links: f.links.map((x, j) => j === i ? { ...x, url: e.target.value } : x) }))} style={{ flex: 2, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
                      <button onClick={() => setLtForm(f => ({ ...f, links: f.links.filter((_, j) => j !== i) }))} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", fontSize: 14 }}>×</button>
                    </div>
                  ))}
                  <button onClick={() => setLtForm(f => ({ ...f, links: [...(f.links || []), { id: uid(), emoji: "🔗", label: "", url: "" }] }))}
                    style={{ fontSize: 13, color: gold, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: font }}>+ Add link</button>
                </div>
              ) : (
                (linktree.links || []).map(lk => (
                  <Card key={lk.id} style={{ marginBottom: 8, padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{lk.emoji}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{lk.label}</div>
                        <div style={{ fontSize: 11, color: gold }}>{lk.url}</div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: ink }}>Profile</div>
              {!profileEdit ? <Btn onClick={() => setProfileEdit(true)} variant="secondary">Edit</Btn>
                            : <div style={{ display: "flex", gap: 8 }}><Btn onClick={saveProfile}>Save</Btn><Btn variant="secondary" onClick={() => setProfileEdit(false)}>Cancel</Btn></div>}
            </div>
            <Card style={{ marginBottom: 20 }}>
              <SL>Basic Info</SL>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Inp label="Name" value={profileForm.name} onChange={v => setProfileForm(f => ({ ...f, name: v }))} style={!profileEdit ? { background: "#f9f9f9", pointerEvents: "none" } : {}} />
                <Inp label="Phone" value={profileForm.phoneNumber} onChange={v => setProfileForm(f => ({ ...f, phoneNumber: v }))} type="tel" style={!profileEdit ? { background: "#f9f9f9", pointerEvents: "none" } : {}} />
                <Inp label="City" value={profileForm.city || (profileForm.locations?.[0] || "")} onChange={v => setProfileForm(f => ({ ...f, city: v }))} style={!profileEdit ? { background: "#f9f9f9", pointerEvents: "none" } : {}} />
                <Inp label="Years Experience" value={profileForm.yearsOfExperience} onChange={v => setProfileForm(f => ({ ...f, yearsOfExperience: v }))} type="number" style={!profileEdit ? { background: "#f9f9f9", pointerEvents: "none" } : {}} />
                <Inp label="Team Size" value={profileForm.teamSize} onChange={v => setProfileForm(f => ({ ...f, teamSize: v }))} type="number" style={!profileEdit ? { background: "#f9f9f9", pointerEvents: "none" } : {}} />
                <Inp label="GST Number" value={profileForm.gstNumber} onChange={v => setProfileForm(f => ({ ...f, gstNumber: v }))} style={!profileEdit ? { background: "#f9f9f9", pointerEvents: "none" } : {}} />
              </div>
              {profileEdit && (
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Bio</label>
                  <textarea value={profileForm.bio || ""} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box", resize: "vertical" }} />
                </div>
              )}
            </Card>

            {/* Type-specific spec */}
            {Object.keys(specOpts).length > 0 && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <SL style={{ marginBottom: 0 }}>{svcType} Details</SL>
                  {!specEdit ? <Btn onClick={() => setSpecEdit(true)} variant="secondary" style={{ padding: "5px 14px", fontSize: 12 }}>Edit</Btn>
                              : <div style={{ display: "flex", gap: 6 }}><Btn onClick={saveSpec} style={{ padding: "5px 14px", fontSize: 12 }}>Save</Btn><Btn variant="secondary" onClick={() => setSpecEdit(false)} style={{ padding: "5px 14px", fontSize: 12 }}>Cancel</Btn></div>}
                </div>
                {Object.entries(specOpts).map(([label, opts]) => (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 8 }}>{label}</div>
                    <Chips options={opts} selected={specForm[label] || []} onChange={v => specEdit && setSpecForm(f => ({ ...f, [label]: v }))} />
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* ── GROW ── */}
        {tab === "grow" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: ink }}>Grow</div>
              <Btn onClick={() => setRemModal({})}>+ Add Reminder</Btn>
            </div>
            <Card style={{ marginBottom: 24 }}>
              <SL>Reminders</SL>
              {reminders.length === 0 && <div style={{ color: muted, fontSize: 13, textAlign: "center", padding: 20 }}>No reminders set</div>}
              {reminders.sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0)).map(r => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(196,122,46,0.07)" }}>
                  <input type="checkbox" checked={r.done} onChange={e => toggleReminder(r.id, e.target.checked)} style={{ width: 16, height: 16, accentColor: gold, cursor: "pointer" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: ink, textDecoration: r.done ? "line-through" : "none", opacity: r.done ? 0.5 : 1 }}>{r.text}</div>
                    {r.date && <div style={{ fontSize: 11, color: muted }}>{r.date}</div>}
                  </div>
                  <button onClick={() => deleteReminder(r.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", fontSize: 12 }}>×</button>
                </div>
              ))}
            </Card>

            <Card>
              <SL>Tips to Grow on Tendr</SL>
              {["Complete your profile — vendors with photos get 3× more views","Add at least 3 packages so customers know your pricing","Ask every client to leave a review after the event","Share your Tendr profile link on your Instagram bio","Respond to chat requests within 1 hour for best conversion","Block dates you are unavailable to avoid conflicts"].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 5 ? "1px solid rgba(196,122,46,0.07)" : "none" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: ink, lineHeight: 1.5 }}>{tip}</div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {orderModal && (
        <OutsideOrderModal order={orderModal === "add" ? null : orderModal} onClose={() => setOrderModal(null)} onSave={saveOutsideOrder} token={token} />
      )}
      {quoteModal !== null && (
        <QuoteModal quote={quoteModal} onClose={() => setQuoteModal(null)} onSave={saveQuote} />
      )}
      {clientModal !== null && (
        <Modal title={clientModal.id ? "Edit Client" : "Add Client"} onClose={() => setClientModal(null)} width={440}>
          {(() => {
            const [f, setF] = useState({ name: "", phone: "", email: "", eventType: "", eventDate: "", budget: "", status: "Lead", notes: "", ...clientModal });
            return (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <Inp label="Name *" value={f.name} onChange={v => setF(x => ({ ...x, name: v }))} />
                  <Inp label="Phone" value={f.phone} onChange={v => setF(x => ({ ...x, phone: v }))} type="tel" />
                  <Inp label="Email" value={f.email} onChange={v => setF(x => ({ ...x, email: v }))} type="email" />
                  <Sel label="Event Type" value={f.eventType} onChange={v => setF(x => ({ ...x, eventType: v }))} options={EVENT_TYPES} />
                  <Inp label="Event Date" value={f.eventDate} onChange={v => setF(x => ({ ...x, eventDate: v }))} type="date" />
                  <Inp label="Budget (₹)" value={f.budget} onChange={v => setF(x => ({ ...x, budget: v }))} type="number" />
                  <Sel label="Status" value={f.status} onChange={v => setF(x => ({ ...x, status: v }))} options={["Lead","Prospect","Confirmed","Completed"]} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Notes</label>
                  <textarea value={f.notes || ""} onChange={e => setF(x => ({ ...x, notes: e.target.value }))} rows={2} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box", resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <Btn variant="secondary" onClick={() => setClientModal(null)}>Cancel</Btn>
                  <Btn onClick={() => saveClient(f)}>Save</Btn>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
      {pkgModal !== null && (
        <Modal title={pkgModal.id ? "Edit Package" : "Add Package"} onClose={() => setPkgModal(null)} width={440}>
          {(() => {
            const [f, setF] = useState({ name: "", price: "", unit: "per event", badge: "", bestFor: "", items: [], ...pkgModal });
            const [itemInput, setItemInput] = useState("");
            return (
              <div>
                <Inp label="Package Name *" value={f.name} onChange={v => setF(x => ({ ...x, name: v }))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <Inp label="Price (₹)" value={f.price} onChange={v => setF(x => ({ ...x, price: v }))} type="number" />
                  <Inp label="Unit" value={f.unit} onChange={v => setF(x => ({ ...x, unit: v }))} placeholder="per event" />
                  <Inp label="Badge" value={f.badge} onChange={v => setF(x => ({ ...x, badge: v }))} placeholder="Most Popular" />
                  <Inp label="Best For" value={f.bestFor} onChange={v => setF(x => ({ ...x, bestFor: v }))} placeholder="Weddings" />
                </div>
                <SL>Inclusions</SL>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <input value={itemInput} onChange={e => setItemInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && itemInput.trim()) { setF(x => ({ ...x, items: [...x.items, itemInput.trim()] })); setItemInput(""); } }} placeholder="Add item, press Enter" style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font }} />
                  <Btn onClick={() => { if (itemInput.trim()) { setF(x => ({ ...x, items: [...x.items, itemInput.trim()] })); setItemInput(""); } }} style={{ padding: "8px 14px", fontSize: 13 }}>Add</Btn>
                </div>
                {(f.items || []).map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: 13, color: ink }}>
                    <span>• {it}</span>
                    <button onClick={() => setF(x => ({ ...x, items: x.items.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 14 }}>×</button>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                  <Btn variant="secondary" onClick={() => setPkgModal(null)}>Cancel</Btn>
                  <Btn onClick={() => savePackage(f)}>Save</Btn>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
      {expModal !== null && (
        <Modal title="Log Expense" onClose={() => setExpModal(null)} width={400}>
          {(() => {
            const [f, setF] = useState({ description: "", amount: "", date: todayStr(), category: "Misc" });
            return (
              <div>
                <Inp label="Description *" value={f.description} onChange={v => setF(x => ({ ...x, description: v }))} />
                <Inp label="Amount (₹)" value={f.amount} onChange={v => setF(x => ({ ...x, amount: v }))} type="number" />
                <Inp label="Date" value={f.date} onChange={v => setF(x => ({ ...x, date: v }))} type="date" />
                <Sel label="Category" value={f.category} onChange={v => setF(x => ({ ...x, category: v }))} options={EXP_CATS} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <Btn variant="secondary" onClick={() => setExpModal(null)}>Cancel</Btn>
                  <Btn onClick={() => addExpense(f)}>Log</Btn>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
      {remModal !== null && (
        <Modal title="Add Reminder" onClose={() => setRemModal(null)} width={380}>
          {(() => {
            const [f, setF] = useState({ text: "", date: "" });
            return (
              <div>
                <Inp label="Reminder *" value={f.text} onChange={v => setF(x => ({ ...x, text: v }))} placeholder="e.g. Call Sharma ji about Dec 15 event" />
                <Inp label="Date (optional)" value={f.date} onChange={v => setF(x => ({ ...x, date: v }))} type="date" />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <Btn variant="secondary" onClick={() => setRemModal(null)}>Cancel</Btn>
                  <Btn onClick={() => addReminder(f)}>Add</Btn>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Mobile bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid rgba(196,122,46,0.1)", display: "flex", zIndex: 200 }}>
        {[TABS[0], TABS[1], TABS[2], TABS[3], TABS[10]].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 0", border: "none", background: "none", cursor: "pointer", color: tab === t.id ? gold : muted, fontFamily: font }}>
            <Ico d={t.icon} sz={20} c={tab === t.id ? gold : muted} />
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

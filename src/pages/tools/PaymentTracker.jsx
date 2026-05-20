import React, { useState, useEffect } from "react";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";

const font = "'Outfit', sans-serif";
const STORAGE_KEY = "tendr_payment_tracker";

const STATUS_COLORS = {
  pending:  { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  partial:  { bg: "#DBEAFE", text: "#1E40AF", label: "Partial" },
  paid:     { bg: "#D1FAE5", text: "#065F46", label: "Paid" },
};

const BLANK = { id: "", vendorName: "", serviceType: "", totalAmount: "", paidAmount: "", dueDate: "", notes: "", status: "pending" };
const TYPES = ["Photographer", "Decorator", "DJ", "Caterer", "Venue", "Other"];

function computeStatus(total, paid) {
  const t = Number(total) || 0;
  const p = Number(paid) || 0;
  if (p <= 0) return "pending";
  if (p >= t) return "paid";
  return "partial";
}

function fmtINR(n) {
  const num = Number(n) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
}

function ProgressBar({ paid, total }) {
  const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;
  return (
    <div style={{ height: 6, background: "#E5E7EB", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#22c55e" : pct > 0 ? "#3B82F6" : "#E5E7EB", borderRadius: 10, transition: "width 0.4s" }} />
    </div>
  );
}

const EXAMPLE_ENTRIES = [
  { id: "ex1", vendorName: "Shutter Story Photography", serviceType: "Photographer", totalAmount: "45000", paidAmount: "15000", dueDate: "2025-12-01", notes: "Remaining due 3 days before event", status: "partial" },
  { id: "ex2", vendorName: "DJ Arjun Events",           serviceType: "DJ",           totalAmount: "22000", paidAmount: "22000", dueDate: "",            notes: "Fully paid via UPI",             status: "paid"    },
  { id: "ex3", vendorName: "Floral Dreams Decor",       serviceType: "Decorator",    totalAmount: "60000", paidAmount: "0",     dueDate: "2025-12-05", notes: "Advance pending",                status: "pending" },
];

function IntroScreen({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: "'Outfit', sans-serif", display: "flex", flexDirection: "column" }}>
      <HamburgerNav title="Payment Tracker" />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>💳</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 14px" }}>
            Payment Tracker
          </h1>
          <p style={{ fontSize: 16, color: "#9B7450", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.65 }}>
            Track every advance you pay to vendors — know exactly how much is due, to whom, and by when. Never get surprised at the last minute.
          </p>
          <button onClick={onStart} style={{ padding: "14px 36px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 18px rgba(196,122,46,0.35)" }}>
            Start Tracking →
          </button>
        </div>

        {/* How it works */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 44 }} className="pt-intro-grid">
          {[
            { icon: "➕", title: "Add a vendor", desc: "Enter their name, service type, and the total agreed amount." },
            { icon: "💸", title: "Log payments", desc: "Enter how much you've paid as an advance. We track the balance automatically." },
            { icon: "🔔", title: "See what's due", desc: "Red = over budget, Amber = nearly due, Green = on track. Always know your status." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ background: "#FFFCF7", borderRadius: 14, padding: "20px 18px", border: "1.5px solid rgba(196,122,46,0.14)", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12.5, color: "#9B7450", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Example preview */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>What it looks like</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: 0.85, pointerEvents: "none" }}>
            {EXAMPLE_ENTRIES.map(e => {
              const total = Number(e.totalAmount), paid = Number(e.paidAmount);
              const sc = STATUS_COLORS[e.status];
              return (
                <div key={e.id} style={{ background: "#FFFCF7", borderRadius: 14, padding: "16px 20px", border: "1.5px solid rgba(196,122,46,0.14)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>{e.vendorName}</span>
                      <span style={{ fontSize: 10, background: "rgba(196,122,46,0.1)", color: "#C47A2E", padding: "2px 8px", borderRadius: 20, marginLeft: 8, fontWeight: 700, textTransform: "uppercase" }}>{e.serviceType}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text, padding: "3px 10px", borderRadius: 20 }}>{sc.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
                    <div><div style={{ fontSize: 10, color: "#9B7450", textTransform: "uppercase" }}>Total</div><div style={{ fontSize: 16, fontWeight: 900, color: "#2C1A0E" }}>{fmtINR(total)}</div></div>
                    <div><div style={{ fontSize: 10, color: "#9B7450", textTransform: "uppercase" }}>Paid</div><div style={{ fontSize: 16, fontWeight: 900, color: "#15803d" }}>{fmtINR(paid)}</div></div>
                    <div><div style={{ fontSize: 10, color: "#9B7450", textTransform: "uppercase" }}>Due</div><div style={{ fontSize: 16, fontWeight: 900, color: total - paid > 0 ? "#b45309" : "#15803d" }}>{fmtINR(total - paid)}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <button onClick={onStart} style={{ padding: "13px 36px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 18px rgba(196,122,46,0.35)" }}>
            Start Tracking →
          </button>
        </div>
      </div>
      <style>{`@media(max-width:560px){.pt-intro-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

export default function PaymentTracker() {
  const [seen, setSeen] = useState(() => !!localStorage.getItem("pt_intro_seen"));
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);

  if (!seen) return <IntroScreen onStart={() => { localStorage.setItem("pt_intro_seen","1"); setSeen(true); }} />;
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const openAdd = () => {
    setForm({ ...BLANK, id: Date.now().toString() });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (entry) => {
    setForm({ ...entry });
    setEditing(entry.id);
    setShowForm(true);
  };

  const handleChange = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      next.status = computeStatus(next.totalAmount, next.paidAmount);
      return next;
    });
  };

  const handleSave = () => {
    if (!form.vendorName.trim()) return;
    if (editing) {
      setEntries(prev => prev.map(e => e.id === editing ? form : e));
    } else {
      setEntries(prev => [...prev, form]);
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setDeleteConfirm(null);
  };

  // Summary
  const totalBudget   = entries.reduce((s, e) => s + (Number(e.totalAmount) || 0), 0);
  const totalPaid     = entries.reduce((s, e) => s + (Number(e.paidAmount) || 0), 0);
  const totalPending  = totalBudget - totalPaid;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Payment Tracker — Tendr" description="Track vendor advance payments and dues for your event." path="/payment-tracker" />
      <BasicSpeedDial />
      <HamburgerNav title="Payment Tracker" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 20px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 6px" }}>Payment Tracker</h1>
            <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Track advances paid and amounts still due to each vendor.</p>
          </div>
          <button
            onClick={openAdd}
            style={{ padding: "11px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.35)", whiteSpace: "nowrap" }}
          >
            + Add Vendor
          </button>
        </div>

        {/* Summary cards */}
        {entries.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }} className="summary-grid">
            {[
              { label: "Total Budget",  amount: totalBudget,  color: "#C47A2E", bg: "#FEF9EC" },
              { label: "Total Paid",    amount: totalPaid,    color: "#15803d", bg: "#F0FDF4" },
              { label: "Still Due",     amount: totalPending, color: "#b45309", bg: "#FFF7ED" },
            ].map(({ label, amount, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: 14, padding: "16px 18px", border: `1px solid ${color}20` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color }}>{fmtINR(amount)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Entries */}
        {entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 24px", background: "#FFFCF7", borderRadius: 20, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>💳</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>No payments tracked yet</h3>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 20px", maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
              Add your vendors here to track advances paid and balances due before the event.
            </p>
            <button onClick={openAdd} style={{ padding: "11px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
              + Add Your First Vendor
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {entries.map(entry => {
              const total  = Number(entry.totalAmount) || 0;
              const paid   = Number(entry.paidAmount) || 0;
              const due    = total - paid;
              const sc     = STATUS_COLORS[entry.status] || STATUS_COLORS.pending;
              return (
                <div key={entry.id} style={{ background: "#FFFCF7", borderRadius: 16, padding: "18px 20px", border: "1.5px solid rgba(196,122,46,0.14)", boxShadow: "0 3px 12px rgba(139,69,19,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>{entry.vendorName}</h3>
                        {entry.serviceType && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(196,122,46,0.1)", color: "#C47A2E", padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>{entry.serviceType}</span>
                        )}
                        <span style={{ fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text, padding: "2px 9px", borderRadius: 20 }}>{sc.label}</span>
                      </div>
                      {entry.dueDate && (
                        <div style={{ fontSize: 12, color: "#9B7450" }}>📅 Due: {entry.dueDate}</div>
                      )}
                      {entry.notes && (
                        <div style={{ fontSize: 12, color: "#9B7450", marginTop: 3 }}>📝 {entry.notes}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => openEdit(entry)} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit</button>
                      <button onClick={() => setDeleteConfirm(entry.id)} style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid rgba(239,68,68,0.25)", background: "transparent", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>✕</button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                    {[["Total Agreed", fmtINR(total), "#2C1A0E"], ["Paid", fmtINR(paid), "#15803d"], ["Balance Due", fmtINR(due), due > 0 ? "#b45309" : "#15803d"]].map(([lbl, val, color]) => (
                      <div key={lbl} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{lbl}</div>
                        <div style={{ fontSize: 17, fontWeight: 900, color }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <ProgressBar paid={paid} total={total} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit form overlay */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(28,10,0,0.45)", backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 301, width: "min(94vw,480px)", background: "#FFFCF5", borderRadius: 20, boxShadow: "0 24px 60px rgba(28,10,0,0.2)", border: "1.5px solid rgba(196,122,46,0.18)", padding: "24px", fontFamily: font }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 20px" }}>{editing ? "Edit Payment" : "Add Vendor Payment"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["Vendor Name *", "vendorName", "text", "e.g. DJ Arjun"], ["Total Agreed Amount (₹)", "totalAmount", "number", "e.g. 40000"], ["Amount Paid So Far (₹)", "paidAmount", "number", "e.g. 15000"], ["Balance Due Date", "dueDate", "date", ""], ["Notes", "notes", "text", "e.g. 2nd payment before event"]].map(([lbl, key, type, ph]) => (
                <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</span>
                  <input type={type} value={form[key]} onChange={e => handleChange(key, e.target.value)} placeholder={ph}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13.5, color: "#1C1208", background: "#FDFCF8", outline: "none" }}
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.25)")}
                  />
                </label>
              ))}
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em" }}>Service Type</span>
                <select value={form.serviceType} onChange={e => handleChange("serviceType", e.target.value)}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13.5, color: "#1C1208", background: "#FDFCF8", outline: "none" }}>
                  <option value="">Select type</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
            </div>
            {/* Status auto-computed */}
            <div style={{ marginTop: 14, padding: "10px 12px", background: STATUS_COLORS[form.status]?.bg, borderRadius: 8, fontSize: 13, fontWeight: 600, color: STATUS_COLORS[form.status]?.text }}>
              Status: {STATUS_COLORS[form.status]?.label} — {fmtINR(Number(form.paidAmount)||0)} of {fmtINR(Number(form.totalAmount)||0)} paid
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={handleSave} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
                {editing ? "Save Changes" : "Add Payment"}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: "12px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <>
          <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(28,10,0,0.45)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 401, width: "min(90vw,340px)", background: "#FFFCF5", borderRadius: 16, padding: "24px", fontFamily: font, boxShadow: "0 16px 48px rgba(28,10,0,0.18)", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>Remove this entry?</h3>
            <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 20px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Delete</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Cancel</button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&family=Outfit:wght@400;600;700;800;900&display=swap');
        @media(max-width:600px){ .summary-grid{ grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

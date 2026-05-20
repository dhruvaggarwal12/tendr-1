import React, { useState, useEffect } from "react";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";

const font = "'Outfit', sans-serif";
const STORAGE_KEY = "tendr_guest_list";

const RSVP_COLORS = {
  yes:     { bg: "#D1FAE5", text: "#065F46", label: "Attending" },
  no:      { bg: "#FEE2E2", text: "#991B1B", label: "Not Coming" },
  pending: { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
};
const MEALS = ["Veg", "Non-Veg", "Jain", "Vegan", "No Preference"];
const BLANK = { id: "", name: "", phone: "", rsvp: "pending", table: "", meal: "No Preference", gift: false, notes: "" };

export default function GuestList() {
  const [guests, setGuests] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [search, setSearch] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(guests)); }, [guests]);

  const openAdd = () => { setForm({ ...BLANK, id: Date.now().toString() }); setEditing(null); setShowForm(true); };
  const openEdit = (g) => { setForm({ ...g }); setEditing(g.id); setShowForm(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) setGuests(prev => prev.map(g => g.id === editing ? form : g));
    else setGuests(prev => [...prev, form]);
    setShowForm(false);
  };

  const cycleRsvp = (id) => {
    const order = ["pending", "yes", "no"];
    setGuests(prev => prev.map(g => g.id === id ? { ...g, rsvp: order[(order.indexOf(g.rsvp) + 1) % order.length] } : g));
  };

  const toggleGift = (id) => setGuests(prev => prev.map(g => g.id === id ? { ...g, gift: !g.gift } : g));

  const exportCSV = () => {
    const rows = [["Name", "Phone", "RSVP", "Table", "Meal", "Gift Received", "Notes"]];
    guests.forEach(g => rows.push([g.name, g.phone, g.rsvp, g.table, g.meal, g.gift ? "Yes" : "No", g.notes]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = "guest-list.csv";
    link.click();
  };

  const filtered = guests.filter(g =>
    (filterRsvp === "all" || g.rsvp === filterRsvp) &&
    (g.name.toLowerCase().includes(search.toLowerCase()) || g.phone.includes(search))
  );

  const attending  = guests.filter(g => g.rsvp === "yes").length;
  const notComing  = guests.filter(g => g.rsvp === "no").length;
  const pending    = guests.filter(g => g.rsvp === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Guest List Manager — Tendr" description="Manage your event guest list, RSVPs and seating." path="/guest-list" />
      <BasicSpeedDial />
      <HamburgerNav title="Guest List" />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 20px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 6px" }}>Guest List</h1>
            <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Track RSVPs, meal preferences and gifts — all in one place.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {guests.length > 0 && (
              <button onClick={exportCSV} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
                Export CSV
              </button>
            )}
            <button onClick={openAdd} style={{ padding: "11px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.35)", whiteSpace: "nowrap" }}>
              + Add Guest
            </button>
          </div>
        </div>

        {/* Stats row */}
        {guests.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }} className="stat-grid">
            {[
              ["Total Invited", guests.length, "#2C1A0E", "#FEF9EC"],
              ["Attending",     attending,      "#065F46", "#F0FDF4"],
              ["Not Coming",    notComing,      "#991B1B", "#FEF2F2"],
              ["Pending",       pending,        "#92400E", "#FFFBEB"],
            ].map(([lbl, val, color, bg]) => (
              <div key={lbl} style={{ background: bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${color}18` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color, marginBottom: 4 }}>{lbl}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {guests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 24px", background: "#FFFCF7", borderRadius: 20, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>👥</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>No guests added yet</h3>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 20px", maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
              Add guests to track who's attending, their seating, meal preference and whether they brought a gift.
            </p>
            <button onClick={openAdd} style={{ padding: "11px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
              + Add First Guest
            </button>
          </div>
        ) : (
          <>
            {/* Search + filter */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone…"
                style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontFamily: font, fontSize: 13, color: "#2C1A0E", background: "#FFFCF8", outline: "none" }}
                onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.22)")}
              />
              {["all", "yes", "pending", "no"].map(f => (
                <button key={f} onClick={() => setFilterRsvp(f)}
                  style={{ padding: "9px 16px", borderRadius: 100, border: "1.5px solid", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "all 0.15s",
                    borderColor: filterRsvp === f ? "#C9A84C" : "rgba(196,122,46,0.22)",
                    background: filterRsvp === f ? "#C9A84C" : "transparent",
                    color: filterRsvp === f ? "#fff" : "#9B7450",
                  }}>
                  {f === "all" ? "All" : RSVP_COLORS[f]?.label}
                </button>
              ))}
            </div>

            {/* Guest table */}
            <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font }} className="guest-table">
                <thead>
                  <tr style={{ background: "rgba(196,122,46,0.05)", borderBottom: "1px solid rgba(196,122,46,0.12)" }}>
                    {["Name", "Phone", "RSVP", "Table", "Meal", "Gift", ""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g, i) => {
                    const sc = RSVP_COLORS[g.rsvp];
                    return (
                      <tr key={g.id} style={{ borderBottom: "1px solid rgba(196,122,46,0.07)", background: i % 2 === 0 ? "#FFFCF7" : "#FDFAF5" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#2C1A0E", fontSize: 14 }}>
                          {g.name}
                          {g.notes && <div style={{ fontSize: 11, color: "#9B7450", fontWeight: 400, marginTop: 2 }}>{g.notes}</div>}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#9B7450", fontSize: 13 }}>{g.phone || "—"}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <button onClick={() => cycleRsvp(g.id)} title="Click to cycle status"
                            style={{ fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: font }}>
                            {sc.label}
                          </button>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#9B7450", fontSize: 13 }}>{g.table ? `Table ${g.table}` : "—"}</td>
                        <td style={{ padding: "12px 14px", color: "#9B7450", fontSize: 13 }}>{g.meal}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <button onClick={() => toggleGift(g.id)} title="Toggle gift received"
                            style={{ fontSize: 18, background: "none", border: "none", cursor: "pointer", opacity: g.gift ? 1 : 0.3 }}>
                            🎁
                          </button>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => openEdit(g)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#C47A2E", fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit</button>
                            <button onClick={() => setDeleteConfirm(g.id)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 7, border: "1.5px solid rgba(239,68,68,0.2)", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: font }}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "#9B7450", fontSize: 14 }}>No guests match your filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit form overlay */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(28,10,0,0.45)", backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 301, width: "min(94vw,440px)", background: "#FFFCF5", borderRadius: 20, boxShadow: "0 24px 60px rgba(28,10,0,0.2)", border: "1.5px solid rgba(196,122,46,0.18)", padding: "24px", fontFamily: font, maxHeight: "88vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 20px" }}>{editing ? "Edit Guest" : "Add Guest"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["Guest Name *", "name", "text", "e.g. Rahul Sharma"], ["Phone", "phone", "tel", "+91 9XXXXXXXXX"], ["Table Number", "table", "text", "e.g. 5"], ["Notes", "notes", "text", "Any special note"]].map(([lbl, key, type, ph]) => (
                <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</span>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13.5, color: "#1C1208", background: "#FDFCF8", outline: "none" }}
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")} onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.25)")} />
                </label>
              ))}
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em" }}>RSVP Status</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {["yes", "pending", "no"].map(r => (
                    <button key={r} onClick={() => setForm(p => ({ ...p, rsvp: r }))}
                      style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1.5px solid", fontFamily: font, fontSize: 12, fontWeight: 700, cursor: "pointer",
                        borderColor: form.rsvp === r ? RSVP_COLORS[r].text : "rgba(196,122,46,0.2)",
                        background: form.rsvp === r ? RSVP_COLORS[r].bg : "transparent",
                        color: form.rsvp === r ? RSVP_COLORS[r].text : "#9B7450",
                      }}>
                      {RSVP_COLORS[r].label}
                    </button>
                  ))}
                </div>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em" }}>Meal Preference</span>
                <select value={form.meal} onChange={e => setForm(p => ({ ...p, meal: e.target.value }))}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13.5, color: "#1C1208", background: "#FDFCF8", outline: "none" }}>
                  {MEALS.map(m => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={form.gift} onChange={e => setForm(p => ({ ...p, gift: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "#C9A84C" }} />
                <span style={{ fontSize: 13.5, color: "#2C1A0E" }}>Gift received 🎁</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={handleSave} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
                {editing ? "Save Changes" : "Add Guest"}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: "12px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </>
      )}

      {deleteConfirm && (
        <>
          <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(28,10,0,0.45)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 401, width: "min(90vw,320px)", background: "#FFFCF5", borderRadius: 16, padding: "24px", fontFamily: font, boxShadow: "0 16px 48px rgba(28,10,0,0.18)", textAlign: "center" }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🗑️</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", margin: "0 0 6px" }}>Remove this guest?</p>
            <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 20px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setGuests(prev => prev.filter(g => g.id !== deleteConfirm)); setDeleteConfirm(null); }} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Remove</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Cancel</button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&family=Outfit:wght@400;600;700;800;900&display=swap');
        @media(max-width:600px){ .stat-grid{ grid-template-columns: repeat(2,1fr) !important; } .guest-table th:nth-child(4), .guest-table td:nth-child(4), .guest-table th:nth-child(5), .guest-table td:nth-child(5){ display: none; } }
      `}</style>
    </div>
  );
}

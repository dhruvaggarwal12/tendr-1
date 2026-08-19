import React, { useState, useEffect, useRef } from "react";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";

const font = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";
const gold = "#C47A2E";
const goldLt = "#CCAB4A";
const ink = "#2C1A0E";
const STORAGE_KEY = "tendr_guest_list";

const RSVP_COLORS = {
  yes:     { bg: "#D1FAE5", text: "#065F46", label: "Attending" },
  no:      { bg: "#FEE2E2", text: "#991B1B", label: "Not Coming" },
  pending: { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
};
const MEALS = ["Veg", "Non-Veg", "Jain", "Vegan", "No Preference"];
const BLANK = { id: "", name: "", phone: "", rsvp: "pending", table: "", meal: "No Preference", gift: false, notes: "" };

const DEFAULT_MSG = `🎉 You're Invited!

We'd love to have you join us to celebrate. Your presence means the world to us.

Kindly reply to this message to confirm your attendance.

See you there! 🥂`;

const EXAMPLE_GUESTS = [
  { id: "e1", name: "Rahul Sharma",   phone: "9876543210", rsvp: "yes",     table: "2", meal: "Veg",     gift: true,  notes: "Bringing family of 3" },
  { id: "e2", name: "Priya Kapoor",   phone: "9123456789", rsvp: "pending", table: "",  meal: "Veg",     gift: false, notes: "" },
  { id: "e3", name: "Amit Verma",     phone: "9988776655", rsvp: "no",      table: "",  meal: "Non-Veg", gift: false, notes: "Can't make it — out of town" },
  { id: "e4", name: "Neha Gupta",     phone: "9765432109", rsvp: "yes",     table: "1", meal: "Jain",    gift: true,  notes: "" },
];

function waPhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return "91" + digits;
  return digits;
}

function IntroScreen({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <HamburgerNav title="Guest List" />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>👥</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 400, color: ink, margin: "0 0 14px" }}>
            Guest List Manager
          </h1>
          <p style={{ fontSize: 16, color: "#9B7450", maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.65 }}>
            Add guests, track RSVPs, assign seats — then send invitations to everyone on WhatsApp in one smooth flow.
          </p>
          <button onClick={onStart} style={{ padding: "14px 36px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 18px rgba(196,122,46,0.35)" }}>
            Start Guest List →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 44 }} className="gl-intro-grid">
          {[
            { icon: "➕", title: "Add guests by name & phone",   desc: "Enter each guest. Phone number is used to send WhatsApp invitations." },
            { icon: "✅", title: "Track RSVPs with one tap",     desc: "Click the RSVP badge to cycle between Attending, Pending, Not Coming." },
            { icon: "📩", title: "Send invitations on WhatsApp", desc: "Draft your message, attach a photo, and send to all guests in one flow." },
            { icon: "📊", title: "Export to CSV",               desc: "Download your full guest list as a spreadsheet any time." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ background: "#FFFCF7", borderRadius: 14, padding: "18px", border: "1.5px solid rgba(196,122,46,0.14)", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{icon}</div>
              <div><div style={{ fontSize: 14, fontWeight: 800, color: ink, marginBottom: 4 }}>{title}</div><div style={{ fontSize: 12.5, color: "#9B7450", lineHeight: 1.5 }}>{desc}</div></div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>What it looks like</p>
        <div style={{ background: "#FFFCF7", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.14)", overflow: "hidden", opacity: 0.88, pointerEvents: "none" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(196,122,46,0.05)", borderBottom: "1px solid rgba(196,122,46,0.12)" }}>
                {["Name", "RSVP", "Table", "Meal", "Gift"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXAMPLE_GUESTS.map((g, i) => {
                const sc = RSVP_COLORS[g.rsvp];
                return (
                  <tr key={g.id} style={{ borderBottom: "1px solid rgba(196,122,46,0.07)", background: i % 2 === 0 ? "#FFFCF7" : "#FDFAF5" }}>
                    <td style={{ padding: "11px 14px", fontWeight: 700, color: ink }}>{g.name}</td>
                    <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text, padding: "3px 9px", borderRadius: 20 }}>{sc.label}</span></td>
                    <td style={{ padding: "11px 14px", color: "#9B7450" }}>{g.table ? `Table ${g.table}` : "—"}</td>
                    <td style={{ padding: "11px 14px", color: "#9B7450" }}>{g.meal}</td>
                    <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 16, opacity: g.gift ? 1 : 0.2 }}>🎁</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <button onClick={onStart} style={{ padding: "13px 36px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 18px rgba(196,122,46,0.35)" }}>
            Start Guest List →
          </button>
        </div>
      </div>
      <style>{`@media(max-width:520px){.gl-intro-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

export default function GuestList() {
  // ── All hooks before any conditional return ──────────────────────────────
  const [seen, setSeen]           = useState(() => !!localStorage.getItem("gl_intro_seen"));
  const [guests, setGuests]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  });
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(BLANK);
  const [search, setSearch]       = useState("");
  const [filterRsvp, setFilterRsvp] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Invitation state ─────────────────────────────────────────────────────
  const [showInvite, setShowInvite]               = useState(false);
  const [inviteMsg, setInviteMsg]                 = useState(DEFAULT_MSG);
  const [invitePhoto, setInvitePhoto]             = useState(null);   // data URL for preview
  const [invitePhotoFile, setInvitePhotoFile]     = useState(null);   // File for Web Share
  const [inviteStep, setInviteStep]               = useState("compose"); // "compose" | "send"
  const [inviteQueue, setInviteQueue]             = useState([]);
  const [inviteCurrent, setInviteCurrent]         = useState(0);
  const [inviteSent, setInviteSent]               = useState(0);
  const [inviteFilter, setInviteFilter]           = useState("all");  // "all"|"yes"|"pending"
  const photoInputRef = useRef(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(guests)); }, [guests]);

  if (!seen) return <IntroScreen onStart={() => { localStorage.setItem("gl_intro_seen", "1"); setSeen(true); }} />;

  // ── Guest helpers ────────────────────────────────────────────────────────
  const openAdd  = () => { setForm({ ...BLANK, id: Date.now().toString() }); setEditing(null); setShowForm(true); };
  const openEdit = (g) => { setForm({ ...g }); setEditing(g.id); setShowForm(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) setGuests(prev => prev.map(g => g.id === editing ? form : g));
    else setGuests(prev => [...prev, form]);
    setShowForm(false);
  };

  const cycleRsvp  = (id) => {
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

  const filtered   = guests.filter(g =>
    (filterRsvp === "all" || g.rsvp === filterRsvp) &&
    (g.name.toLowerCase().includes(search.toLowerCase()) || g.phone.includes(search))
  );

  const attending  = guests.filter(g => g.rsvp === "yes").length;
  const notComing  = guests.filter(g => g.rsvp === "no").length;
  const pending    = guests.filter(g => g.rsvp === "pending").length;

  // ── Invitation helpers ───────────────────────────────────────────────────
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setInvitePhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setInvitePhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const inviteGuestsPool = guests.filter(g => {
    if (inviteFilter === "yes")     return g.rsvp === "yes"     && g.phone;
    if (inviteFilter === "pending") return g.rsvp === "pending" && g.phone;
    return !!g.phone;
  });

  const startSending = () => {
    if (!inviteMsg.trim() || inviteGuestsPool.length === 0) return;
    setInviteQueue(inviteGuestsPool);
    setInviteCurrent(0);
    setInviteSent(0);
    setInviteStep("send");
  };

  const currentGuest = inviteQueue[inviteCurrent] || null;

  const sendToGuest = async () => {
    if (!currentGuest) return;
    const phone = waPhone(currentGuest.phone);
    const msgWithName = inviteMsg.replace("{name}", currentGuest.name);

    // Try Web Share API with photo (best on mobile)
    if (invitePhotoFile && navigator.canShare && navigator.canShare({ files: [invitePhotoFile], text: msgWithName })) {
      try {
        await navigator.share({ text: msgWithName, files: [invitePhotoFile] });
      } catch {
        // user cancelled or not supported — fall back to wa.me
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msgWithName)}`, "_blank");
      }
    } else {
      // Desktop / no Web Share — open WhatsApp with pre-filled text
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msgWithName)}`, "_blank");
    }

    setInviteSent(s => s + 1);
    if (inviteCurrent + 1 < inviteQueue.length) {
      setInviteCurrent(c => c + 1);
    } else {
      setInviteStep("done");
    }
  };

  const skipGuest = () => {
    if (inviteCurrent + 1 < inviteQueue.length) setInviteCurrent(c => c + 1);
    else setInviteStep("done");
  };

  const closeInvite = () => {
    setShowInvite(false);
    setInviteStep("compose");
    setInviteQueue([]);
    setInviteCurrent(0);
    setInviteSent(0);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Guest List Manager — Tendr" description="Manage your event guest list, RSVPs and seating." path="/guest-list" />
      <BasicSpeedDial />
      <HamburgerNav title="Guest List" />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 20px calc(80px + env(safe-area-inset-bottom, 0px))" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: serif, fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 400, color: ink, margin: "0 0 6px" }}>Guest List</h1>
            <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Track RSVPs, seat assignments and gifts — then send invitations via WhatsApp.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {guests.length > 0 && (
              <>
                <button onClick={exportCSV}
                  style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: gold, fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
                  Export CSV
                </button>
                <button onClick={() => { setShowInvite(true); setInviteStep("compose"); }}
                  style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 3px 12px rgba(18,140,126,0.35)", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Send Invitations
                </button>
              </>
            )}
            <button onClick={openAdd}
              style={{ padding: "11px 22px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.35)", whiteSpace: "nowrap" }}>
              + Add Guest
            </button>
          </div>
        </div>

        {/* Stats */}
        {guests.length > 0 && (() => {
          const attending_guests = guests.filter(g => g.rsvp === "yes");
          const mealCounts = MEALS.reduce((acc, m) => {
            const n = attending_guests.filter(g => g.meal === m).length;
            if (n > 0) acc[m] = n;
            return acc;
          }, {});
          return (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }} className="stat-grid">
                {[
                  ["Total Invited", guests.length, ink,      "#FEF9EC"],
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

              {attending > 0 && Object.keys(mealCounts).length > 0 && (
                <div style={{ background: "#FFFCF7", borderRadius: 12, padding: "14px 18px", marginBottom: 20, border: "1.5px solid rgba(196,122,46,0.14)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: gold, flexShrink: 0 }}>🍽️ Meal Summary (attending only)</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {Object.entries(mealCounts).map(([meal, count]) => (
                      <span key={meal} style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "rgba(196,122,46,0.08)", color: ink, border: "1px solid rgba(196,122,46,0.18)" }}>
                        {meal}: <strong style={{ color: gold }}>{count}</strong>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => { const txt = Object.entries(mealCounts).map(([m, c]) => `${m}: ${c}`).join(", "); navigator.clipboard.writeText(`Meal counts (${attending} attending) — ${txt}`); }}
                    style={{ marginLeft: "auto", padding: "5px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: gold, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0 }}>
                    Copy for Caterer
                  </button>
                </div>
              )}
            </>
          );
        })()}

        {/* Empty state */}
        {guests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 24px", background: "#FFFCF7", borderRadius: 20, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>👥</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: ink, margin: "0 0 8px" }}>No guests added yet</h3>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 20px", maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
              Add guests with their phone numbers and send WhatsApp invitations to all of them in one go.
            </p>
            <button onClick={openAdd} style={{ padding: "11px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
              + Add First Guest
            </button>
          </div>
        ) : (
          <>
            {/* Search + filter */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone…"
                style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontFamily: font, fontSize: 13, color: ink, background: "#FFFCF8", outline: "none" }}
                onFocus={e => (e.target.style.borderColor = goldLt)} onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.22)")} />
              {["all", "yes", "pending", "no"].map(f => (
                <button key={f} onClick={() => setFilterRsvp(f)}
                  style={{ padding: "9px 16px", borderRadius: 100, border: "1.5px solid", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "all 0.15s",
                    borderColor: filterRsvp === f ? goldLt : "rgba(196,122,46,0.22)",
                    background: filterRsvp === f ? goldLt : "transparent",
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
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: ink, fontSize: 14 }}>
                          {g.name}
                          {g.notes && <div style={{ fontSize: 11, color: "#9B7450", fontWeight: 400, marginTop: 2 }}>{g.notes}</div>}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#9B7450", fontSize: 13 }}>
                          {g.phone
                            ? <a href={`https://wa.me/${waPhone(g.phone)}`} target="_blank" rel="noreferrer"
                                style={{ color: "#128C7E", fontWeight: 600, textDecoration: "none", fontSize: 13 }}>{g.phone}</a>
                            : "—"}
                        </td>
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
                            <button onClick={() => openEdit(g)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: gold, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit</button>
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

      {/* ── Add/Edit guest modal ──────────────────────────────────────────────── */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(28,10,0,0.45)", backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 301, width: "min(94vw,440px)", background: "#FFFCF5", borderRadius: 20, boxShadow: "0 24px 60px rgba(28,10,0,0.2)", border: "1.5px solid rgba(196,122,46,0.18)", padding: "24px", fontFamily: font, maxHeight: "88vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: ink, margin: "0 0 20px" }}>{editing ? "Edit Guest" : "Add Guest"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["Guest Name *", "name", "text", "e.g. Rahul Sharma"], ["Phone (for WhatsApp)", "phone", "tel", "+91 9XXXXXXXXX"], ["Table Number", "table", "text", "e.g. 5"], ["Notes", "notes", "text", "Any special note"]].map(([lbl, key, type, ph]) => (
                <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</span>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13.5, color: "#1C1208", background: "#FDFCF8", outline: "none" }}
                    onFocus={e => (e.target.style.borderColor = goldLt)} onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.25)")} />
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
                <input type="checkbox" checked={form.gift} onChange={e => setForm(p => ({ ...p, gift: e.target.checked }))} style={{ width: 18, height: 18, accentColor: goldLt }} />
                <span style={{ fontSize: 13.5, color: ink }}>Gift received 🎁</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={handleSave} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
                {editing ? "Save Changes" : "Add Guest"}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: "12px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirm ────────────────────────────────────────────────────── */}
      {deleteConfirm && (
        <>
          <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(28,10,0,0.45)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 401, width: "min(90vw,320px)", background: "#FFFCF5", borderRadius: 16, padding: "24px", fontFamily: font, boxShadow: "0 16px 48px rgba(28,10,0,0.18)", textAlign: "center" }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🗑️</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: ink, margin: "0 0 6px" }}>Remove this guest?</p>
            <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 20px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setGuests(prev => prev.filter(g => g.id !== deleteConfirm)); setDeleteConfirm(null); }} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Remove</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Cancel</button>
            </div>
          </div>
        </>
      )}

      {/* ── Send Invitations modal ────────────────────────────────────────────── */}
      {showInvite && (
        <>
          <div onClick={closeInvite} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,5,0,0.6)", backdropFilter: "blur(4px)" }} />
          <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 501, width: "min(96vw,520px)", background: "#FFFCF5", borderRadius: 22, boxShadow: "0 32px 80px rgba(10,5,0,0.28)", border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: font, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Modal header */}
            <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid rgba(196,122,46,0.12)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#128C7E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>
                  {inviteStep === "compose" ? "Compose" : inviteStep === "done" ? "All Done!" : `Sending ${inviteCurrent + 1} of ${inviteQueue.length}`}
                </div>
                <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 400, color: ink }}>
                  {inviteStep === "compose" ? "Send Invitations" : inviteStep === "done" ? "Invitations Sent" : "Send via WhatsApp"}
                </div>
              </div>
              <button onClick={closeInvite} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.2)", background: "transparent", color: "#9B7450", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
            </div>

            {/* ── STEP 1: Compose ── */}
            {inviteStep === "compose" && (
              <div style={{ overflowY: "auto", flex: 1, padding: "18px 22px" }}>

                {/* Message */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
                    Invitation Message
                  </label>
                  <p style={{ fontSize: 11, color: "#B08A6A", margin: "0 0 8px", lineHeight: 1.5 }}>
                    Use <code style={{ background: "rgba(196,122,46,0.1)", padding: "1px 5px", borderRadius: 4 }}>{"{name}"}</code> to personalise with each guest's name.
                  </p>
                  <textarea
                    value={inviteMsg}
                    onChange={e => setInviteMsg(e.target.value)}
                    rows={8}
                    style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontFamily: font, fontSize: 13.5, color: ink, background: "#FDFAF5", outline: "none", resize: "vertical", lineHeight: 1.6 }}
                    onFocus={e => (e.target.style.borderColor = goldLt)}
                    onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.22)")}
                  />
                </div>

                {/* Photo attachment */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
                    Invitation Card / Photo (optional)
                  </label>
                  <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />

                  {invitePhoto ? (
                    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1.5px solid rgba(196,122,46,0.2)", marginBottom: 8 }}>
                      <img src={invitePhoto} alt="Invitation card" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
                      <button
                        onClick={() => { setInvitePhoto(null); setInvitePhotoFile(null); if (photoInputRef.current) photoInputRef.current.value = ""; }}
                        style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  ) : (
                    <button onClick={() => photoInputRef.current?.click()}
                      style={{ width: "100%", padding: "20px", borderRadius: 12, border: "2px dashed rgba(196,122,46,0.25)", background: "rgba(196,122,46,0.03)", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 28 }}>📎</span>
                      Tap to attach invitation card
                      <span style={{ fontSize: 11, fontWeight: 400, color: "#B08A6A" }}>On mobile, sends with WhatsApp via share sheet</span>
                    </button>
                  )}
                </div>

                {/* Recipient filter */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                    Send To
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { val: "all",     label: `All with phones (${guests.filter(g=>g.phone).length})` },
                      { val: "pending", label: `Pending only (${guests.filter(g=>g.phone&&g.rsvp==="pending").length})` },
                      { val: "yes",     label: `Attending only (${guests.filter(g=>g.phone&&g.rsvp==="yes").length})` },
                    ].map(({ val, label }) => (
                      <button key={val} onClick={() => setInviteFilter(val)}
                        style={{ padding: "8px 16px", borderRadius: 100, border: "1.5px solid", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font,
                          borderColor: inviteFilter === val ? "#128C7E" : "rgba(196,122,46,0.2)",
                          background: inviteFilter === val ? "#128C7E" : "transparent",
                          color: inviteFilter === val ? "#fff" : "#9B7450",
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {inviteGuestsPool.length === 0 && (
                    <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8, fontWeight: 600 }}>
                      No guests with phone numbers in this group.
                    </p>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={startSending}
                  disabled={!inviteMsg.trim() || inviteGuestsPool.length === 0}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    background: inviteMsg.trim() && inviteGuestsPool.length > 0 ? "linear-gradient(135deg,#25D366,#128C7E)" : "rgba(0,0,0,0.1)",
                    color: inviteMsg.trim() && inviteGuestsPool.length > 0 ? "#fff" : "#aaa",
                    fontSize: 15, fontWeight: 700, fontFamily: font, cursor: inviteGuestsPool.length > 0 ? "pointer" : "default",
                    boxShadow: inviteGuestsPool.length > 0 ? "0 4px 16px rgba(18,140,126,0.4)" : "none",
                  }}>
                  Start Sending to {inviteGuestsPool.length} Guest{inviteGuestsPool.length !== 1 ? "s" : ""} →
                </button>
              </div>
            )}

            {/* ── STEP 2: Send ── */}
            {inviteStep === "send" && currentGuest && (
              <div style={{ overflowY: "auto", flex: 1, padding: "18px 22px", display: "flex", flexDirection: "column" }}>

                {/* Progress bar */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450" }}>Progress</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#128C7E" }}>{inviteSent} sent · {inviteCurrent} of {inviteQueue.length}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(inviteCurrent / inviteQueue.length) * 100}%`, background: "linear-gradient(90deg,#25D366,#128C7E)", borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                </div>

                {/* Current guest card */}
                <div style={{ background: "linear-gradient(135deg,rgba(37,211,102,0.06),rgba(18,140,126,0.04))", border: "1.5px solid rgba(18,140,126,0.2)", borderRadius: 16, padding: "20px", marginBottom: 16, textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#25D366,#128C7E)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 800 }}>
                    {currentGuest.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: ink, marginBottom: 4 }}>{currentGuest.name}</div>
                  <div style={{ fontSize: 13, color: "#128C7E", fontWeight: 600 }}>{currentGuest.phone}</div>
                  {currentGuest.rsvp && (
                    <span style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 700, background: RSVP_COLORS[currentGuest.rsvp].bg, color: RSVP_COLORS[currentGuest.rsvp].text, padding: "3px 10px", borderRadius: 20 }}>
                      {RSVP_COLORS[currentGuest.rsvp].label}
                    </span>
                  )}
                </div>

                {/* Message preview */}
                <div style={{ background: "#F0FFF8", border: "1px solid rgba(18,140,126,0.18)", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 12.5, color: "#2C4A3E", lineHeight: 1.65, whiteSpace: "pre-wrap", maxHeight: 120, overflowY: "auto" }}>
                  {inviteMsg.replace("{name}", currentGuest.name)}
                </div>

                {/* Photo reminder */}
                {invitePhoto && (
                  <div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.14)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                    <img src={invitePhoto} alt="invitation" style={{ width: 42, height: 42, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#7A5535", lineHeight: 1.5 }}>
                      {navigator.share ? "Photo will be shared via share sheet →" : "After WhatsApp opens, forward this photo too →"}
                    </span>
                  </div>
                )}

                {/* Send / Skip buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
                  <button onClick={sendToGuest}
                    style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 16px rgba(18,140,126,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Send to {currentGuest.name.split(" ")[0]} via WhatsApp
                  </button>
                  <button onClick={skipGuest}
                    style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.22)", background: "transparent", color: "#9B7450", fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
                    Skip →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Done ── */}
            {inviteStep === "done" && (
              <div style={{ flex: 1, padding: "32px 22px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: ink, margin: "0 0 10px" }}>Invitations sent!</h3>
                <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 28px", lineHeight: 1.65 }}>
                  You sent <strong style={{ color: "#128C7E" }}>{inviteSent} invitation{inviteSent !== 1 ? "s" : ""}</strong> via WhatsApp.
                  <br />Track RSVPs as guests reply and update their status here.
                </p>
                <button onClick={closeInvite}
                  style={{ padding: "13px 36px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 16px rgba(196,122,46,0.35)" }}>
                  Back to Guest List
                </button>
              </div>
            )}

          </div>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&family=Outfit:wght@400;600;700;800;900&display=swap');
        @media(max-width:600px){
          .stat-grid{ grid-template-columns: repeat(2,1fr) !important; }
          .guest-table th:nth-child(4), .guest-table td:nth-child(4),
          .guest-table th:nth-child(5), .guest-table td:nth-child(5){ display: none; }
        }
      `}</style>
    </div>
  );
}

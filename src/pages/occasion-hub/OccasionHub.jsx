import { useState, useEffect, useRef, useCallback } from "react";
import { usePartyRoom } from "../../hooks/usePartyRoom";
import { useNavigate } from "react-router-dom";
import { TRUTHS, DARES, NEVER_HAVE_I, WOULD_YOU_RATHER, CHARADES, HOT_TAKES, BINGO_SQUARES } from "../../data/housePartyData";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Manrope', 'Inter', sans-serif";

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function copyLink(text) { navigator.clipboard?.writeText(text).catch(() => {}); }

const occic = (d, sz = 20) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;

const TOOL_ICONS = {
  invite:         occic(<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>),
  checklist:      occic(<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>),
  bills:          occic(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>),
  gifttracker:    occic(<><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>),
  giftregistry:   occic(<><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>),
  theme:          occic(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3"/></>),
  wishwall:       occic(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>),
  countdown:      occic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>),
  playlist:       occic(<><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>),
  photowall:      occic(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>),
  secretmessage:  occic(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>),
  moodmeter:      occic(<><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>),
  lovenotes:      occic(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>),
  birthdayquiz:   occic(<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>),
  mostlikelyto:   occic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  t2l:            occic(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>),
  rapidfire:      occic(<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>),
  truthordare:    occic(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="22" y1="12" x2="19" y2="12"/><line x1="5" y1="12" x2="2" y2="12"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/></>),
  neverhavei:     occic(<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>),
  wouldyou:       occic(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>),
  hottakes:       occic(<><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></>),
  spin:           occic(<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></>),
  charades:       occic(<><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/><line x1="9" y1="2" x2="9" y2="22"/><line x1="15" y1="2" x2="15" y2="22"/></>),
  bingo:          occic(<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></>),
  couplequiz:     occic(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>),
  blessingswall:  occic(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>),
  blessings:      occic(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>),
  reportcard:     occic(<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>),
  potluck:        occic(<><path d="M3 11l19-9-9 19-2-8-8-2z"/></>),
  babynamevote:   occic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></>),
  genderpoll:     occic(<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>),
  advicecards:    occic(<><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></>),
  luckydraw:      occic(<><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></>),
  kittyfund:      occic(<><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>),
  namesuggestions: occic(<><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>),
  awardsceremony: occic(<><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></>),
  runofshow:      occic(<><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>),
  appreciationwall: occic(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>),
};

const SECTION_ICONS = {
  manage:    occic(<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></>, 16),
  fun:       occic(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>, 16),
  games:     occic(<><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="12" y1="12" x2="12.01" y2="12"/><line x1="7" y1="12" x2="7.01" y2="12"/><line x1="17" y1="12" x2="17.01" y2="12"/></>, 16),
  other:     occic(<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>, 16),
  votes:     occic(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>, 16),
  ceremony:  occic(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>, 16),
  love:      occic(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>, 16),
  celebrate: occic(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>, 16),
  baby:      occic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></>, 16),
};
const defaultSecIcon = occic(<><circle cx="12" cy="12" r="10"/></>, 16);

// ── Modal ──────────────────────────────────────────────────────────────────────
function Modal({ onClose, title, emoji, children, wide }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#130f08", borderRadius: 24, width: "100%", maxWidth: wide ? 680 : 460, maxHeight: "90dvh", overflowY: "auto", padding: "24px 20px 28px", fontFamily: font, boxShadow: "0 24px 80px rgba(0,0,0,0.8)", animation: "modal-in 0.24s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>{emoji}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{title}</span>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 14, fontFamily: font, boxSizing: "border-box", outline: "none", minWidth: 0 };
const mkBtn = (color = "#7C3AED") => ({ padding: "12px 20px", borderRadius: 12, border: "none", background: color, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, width: "100%" });
const lbl = { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" };
const crd = { background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, color: "#fff", fontSize: 14 };

// ════════════════════════════════════════════════════════════════════════════
// SHARED TOOLS
// ════════════════════════════════════════════════════════════════════════════

function BillSplitter({ onClose, accent }) {
  const [people, setPeople] = useState([]);
  const [newName, setNewName] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [paidBy, setPaidBy] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [view, setView] = useState("add");
  const addPerson = () => { if (newName.trim()) { setPeople(p => [...p, newName.trim()]); setNewName(""); } };
  const addExpense = () => {
    if (!paidBy || !amount || isNaN(Number(amount))) return;
    setExpenses(e => [...e, { paidBy, amount: Number(amount), desc: desc || "Expense" }]);
    setAmount(""); setDesc("");
  };
  const calcSettlement = () => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const share = total / people.length;
    const bal = {}; people.forEach(p => { bal[p] = 0; });
    expenses.forEach(e => { bal[e.paidBy] = (bal[e.paidBy] || 0) + e.amount; });
    people.forEach(p => { bal[p] = (bal[p] || 0) - share; });
    const txns = [];
    const debtors = Object.entries(bal).filter(([, v]) => v < -0.01).sort(([, a], [, b]) => a - b);
    const creditors = Object.entries(bal).filter(([, v]) => v > 0.01).sort(([, a], [, b]) => b - a);
    let di = 0, ci = 0;
    const dA = debtors.map(([, v]) => -v), cA = creditors.map(([, v]) => v);
    while (di < debtors.length && ci < creditors.length) {
      const pay = Math.min(dA[di], cA[ci]);
      txns.push({ from: debtors[di][0], to: creditors[ci][0], amount: Math.round(pay) });
      dA[di] -= pay; cA[ci] -= pay;
      if (dA[di] < 0.01) di++; if (cA[ci] < 0.01) ci++;
    }
    return { total, share, txns };
  };
  return (
    <Modal onClose={onClose} emoji="💸" title="Bill Splitter" wide>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["add", "result"].map(v => <button key={v} onClick={() => setView(v)} style={{ ...mkBtn(view === v ? accent : "rgba(255,255,255,0.08)"), flex: 1, padding: "10px" }}>{v === "add" ? "Add Expenses" : "Settle Up"}</button>)}
      </div>
      {view === "add" && <>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>People</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addPerson()} placeholder="Name" style={{ ...inp, flex: 1 }} />
            <button onClick={addPerson} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>+</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{people.map(p => <span key={p} style={{ background: accent + "33", color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>{p}</span>)}</div>
        </div>
        {people.length >= 2 && <div>
          <label style={lbl}>Add Expense</label>
          <select value={paidBy} onChange={e => setPaidBy(e.target.value)} style={{ ...inp, marginBottom: 8 }}><option value="">Who paid?</option>{people.map(p => <option key={p} value={p}>{p}</option>)}</select>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₹)" type="number" style={{ ...inp, marginBottom: 8 }} />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" style={{ ...inp, marginBottom: 10 }} />
          <button onClick={addExpense} style={mkBtn(accent)}>Add</button>
        </div>}
        {expenses.map((e, i) => <div key={i} style={{ ...crd, display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.8)" }}>{e.paidBy} — {e.desc}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, color: accent }}>₹{e.amount}</span>
            <span onClick={() => setExpenses(ex => ex.filter((_, j) => j !== i))} style={{ cursor: "pointer", opacity: 0.4, fontSize: 13 }}>✕</span>
          </div>
        </div>)}
      </>}
      {view === "result" && people.length >= 2 && expenses.length > 0 && (() => {
        const { total, share, txns } = calcSettlement();
        return <>
          <div style={{ textAlign: "center", marginBottom: 16, background: accent + "18", borderRadius: 16, padding: "16px 20px" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>₹{total}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>₹{Math.round(share)} per person · {people.length} people</div>
          </div>
          {txns.length === 0 ? <div style={{ textAlign: "center", color: "#34D399", padding: 20, fontSize: 18 }}>✅ All settled!</div> : txns.map((t, i) => (
            <div key={i} style={{ ...crd, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 700, color: "#F87171" }}>{t.from}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 8px" }}>→</span>
                <span style={{ fontWeight: 700, color: "#34D399" }}>{t.to}</span>
              </div>
              <span style={{ fontWeight: 800, color: "#FBBF24", fontSize: 16 }}>₹{t.amount}</span>
            </div>
          ))}
          {txns.length > 0 && (
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`💸 *Split Summary*\nTotal: ₹${total}\n\n` + txns.map(t => `• ${t.from} → ${t.to}: ₹${t.amount}`).join("\n"))}`, "_blank")} style={{ ...mkBtn("#25D366"), marginTop: 12 }}>
              📤 Share on WhatsApp
            </button>
          )}
        </>;
      })()}
      {view === "result" && (people.length < 2 || expenses.length === 0) && <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>Add at least 2 people and 1 expense first.</p>}
    </Modal>
  );
}

function PlaylistBuilder({ onClose, accent }) {
  const [songs, setSongs] = useState([]);
  const [newSong, setNewSong] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const add = () => {
    if (!newSong.trim()) return;
    setSongs(s => [...s, { song: newSong.trim(), artist: newArtist.trim(), by: addedBy.trim() || "Anonymous", votes: 0 }]);
    setNewSong(""); setNewArtist("");
  };
  const upvote = (i) => setSongs(s => [...s.map((x, j) => j === i ? { ...x, votes: x.votes + 1 } : x)].sort((a, b) => b.votes - a.votes));
  const playlistText = songs.map((s, i) => `${i + 1}. ${s.song}${s.artist ? ` — ${s.artist}` : ""}`).join("\n");
  return (
    <Modal onClose={onClose} emoji="🎵" title="Playlist Builder" wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Everyone adds their song · upvote your favourites!</p>
      <input value={addedBy} onChange={e => setAddedBy(e.target.value)} placeholder="Your name" style={{ ...inp, marginBottom: 8 }} />
      <input value={newSong} onChange={e => setNewSong(e.target.value)} placeholder="Song name" style={{ ...inp, marginBottom: 8 }} />
      <input value={newArtist} onChange={e => setNewArtist(e.target.value)} placeholder="Artist (optional)" style={{ ...inp, marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && add()} />
      <button onClick={add} style={{ ...mkBtn(accent), marginBottom: 16 }}>+ Add Song</button>
      {songs.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No songs yet — be the first!</p>}
      {songs.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 12, marginBottom: 8, border: "1.5px solid rgba(255,255,255,0.07)" }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: accent + "25", color: accent, fontWeight: 900, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.song}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.artist ? `${s.artist} · ` : ""}by {s.by}</div>
          </div>
          <button onClick={() => upvote(i)} style={{ background: s.votes > 0 ? accent + "30" : "rgba(255,255,255,0.07)", border: `1.5px solid ${s.votes > 0 ? accent + "55" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "6px 10px", cursor: "pointer", color: s.votes > 0 ? accent : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 800, flexShrink: 0, fontFamily: font, transition: "all 0.15s" }}>▲ {s.votes}</button>
          <span onClick={() => setSongs(ss => ss.filter((_, j) => j !== i))} style={{ cursor: "pointer", opacity: 0.35, fontSize: 14, padding: 4 }}>✕</span>
        </div>
      ))}
      {songs.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button onClick={() => { copyLink(playlistText); }} style={{ ...mkBtn("rgba(255,255,255,0.08)"), flex: 1 }}>📋 Copy List</button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("🎵 *Tonight's Playlist*\n\n" + playlistText)}`, "_blank")} style={{ ...mkBtn("#25D366"), flex: 1 }}>📤 WhatsApp</button>
        </div>
      )}
    </Modal>
  );
}

function Countdown({ onClose, accent }) {
  const [target, setTarget] = useState("");
  const [eventName, setEventName] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const pad = n => String(n).padStart(2, "0");
  const start = () => {
    if (!target) return;
    setStarted(true);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      const diff = new Date(target) - Date.now();
      if (diff <= 0) { setTimeLeft(null); clearInterval(ref.current); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    }, 1000);
  };
  useEffect(() => () => clearInterval(ref.current), []);
  const units = timeLeft ? (timeLeft.d > 0
    ? [{ v: timeLeft.d, l: "days" }, { v: timeLeft.h, l: "hrs" }, { v: timeLeft.m, l: "min" }, { v: timeLeft.s, l: "sec" }]
    : [{ v: timeLeft.h, l: "hrs" }, { v: timeLeft.m, l: "min" }, { v: timeLeft.s, l: "sec" }]) : [];
  return (
    <Modal onClose={onClose} emoji="⏱️" title="Countdown Timer">
      {!started ? <>
        <label style={lbl}>What are you counting down to?</label>
        <input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. Cake cutting! 🎂" style={{ ...inp, marginBottom: 12 }} />
        <label style={lbl}>Date & Time</label>
        <input type="datetime-local" value={target} onChange={e => setTarget(e.target.value)} style={{ ...inp, marginBottom: 16 }} />
        <button onClick={start} disabled={!target} style={{ ...mkBtn(accent), opacity: target ? 1 : 0.5 }}>Start Countdown</button>
      </> : (
        <div style={{ textAlign: "center" }}>
          {eventName && <div style={{ fontSize: 16, fontWeight: 800, color: accent, marginBottom: 20, letterSpacing: "-0.01em" }}>{eventName}</div>}
          {timeLeft ? (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
              {units.map(({ v, l }) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 44, fontWeight: 900, color: l === "sec" ? accent : "#fff", lineHeight: 1, background: "rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", minWidth: 60, fontVariantNumeric: "tabular-nums", boxShadow: l === "sec" ? `0 0 20px ${accent}30` : "none" }}>{pad(v)}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#FBBF24" }}>It's time!</div>
            </div>
          )}
          <button onClick={() => { setStarted(false); setTimeLeft(null); clearInterval(ref.current); }} style={{ ...mkBtn("rgba(255,255,255,0.1)") }}>Reset</button>
        </div>
      )}
    </Modal>
  );
}

function ThemePicker({ onClose, accent, themes }) {
  const [votes, setVotes] = useState({});
  const [myVote, setMyVote] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const vote = (t) => {
    if (myVote) setVotes(v => ({ ...v, [myVote]: Math.max(0, (v[myVote] || 0) - 1) }));
    setMyVote(t);
    setVotes(v => ({ ...v, [t]: (v[t] || 0) + 1 }));
  };
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const sorted = [...themes].sort((a, b) => (votes[b] || 0) - (votes[a] || 0));
  const winner = totalVotes > 0 ? sorted[0] : null;
  const max = Math.max(...Object.values(votes), 0);
  if (showWinner && winner) return (
    <Modal onClose={onClose} emoji="🎨" title="Theme Picker">
      <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Tonight's Theme</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 6 }}>{winner}</div>
        <div style={{ fontSize: 14, color: accent }}>{votes[winner] || 0} vote{(votes[winner] || 0) !== 1 ? "s" : ""} · {totalVotes} total</div>
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button onClick={() => setShowWinner(false)} style={{ ...mkBtn("rgba(255,255,255,0.08)"), flex: 1 }}>← Back</button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🎨 Tonight's party theme: *${winner}*! 🎉`)}`, "_blank")} style={{ ...mkBtn("#25D366"), flex: 1 }}>📤 Share</button>
        </div>
      </div>
    </Modal>
  );
  return (
    <Modal onClose={onClose} emoji="🎨" title="Theme Picker">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Pass the phone — everyone votes once!</p>
      {themes.map(t => {
        const pct = max ? Math.round(((votes[t] || 0) / max) * 100) : 0;
        const isLeading = winner === t && totalVotes > 0;
        return (
          <div key={t} onClick={() => vote(t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${myVote === t ? accent : isLeading ? accent + "44" : "rgba(255,255,255,0.1)"}`, background: myVote === t ? accent + "22" : isLeading ? accent + "0a" : "rgba(255,255,255,0.04)", marginBottom: 8, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 14, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                {t}
                {isLeading && totalVotes >= 2 && <span style={{ fontSize: 10, fontWeight: 800, color: accent, background: accent + "25", padding: "2px 7px", borderRadius: 8, letterSpacing: "0.06em" }}>LEADING</span>}
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: myVote === t ? accent : isLeading ? accent + "aa" : "rgba(255,255,255,0.2)", borderRadius: 4, transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: myVote === t ? accent : isLeading ? accent + "cc" : "rgba(255,255,255,0.35)", minWidth: 24, textAlign: "right" }}>{votes[t] || 0}</span>
          </div>
        );
      })}
      {totalVotes >= 2 && (
        <button onClick={() => setShowWinner(true)} style={{ ...mkBtn(accent), marginTop: 8 }}>🏆 Reveal Tonight's Theme</button>
      )}
    </Modal>
  );
}

function Checklist({ onClose, accent, checklistItems, initialGuests }) {
  const [guests, setGuests] = useState(initialGuests || 10);
  const [checked, setChecked] = useState({});
  const [custom, setCustom] = useState([]);
  const [newCustom, setNewCustom] = useState("");
  const calc = (base, per) => Math.ceil(base + per * guests);
  const items = checklistItems || [
    { cat: "Food & Drinks", things: [{ name: "Snacks / Namkeen", qty: calc(0, 0.5) + " packs" }, { name: "Cold drinks (500ml)", qty: calc(0, 0.8) + " bottles" }, { name: "Water bottles (1L)", qty: calc(0, 0.5) + " bottles" }, { name: "Food portions", qty: calc(0, 0.7) + " portions" }] },
    { cat: "Tableware", things: [{ name: "Disposable plates", qty: calc(5, 1.5) + " pieces" }, { name: "Cups / Glasses", qty: calc(5, 2) + " pieces" }, { name: "Napkins", qty: calc(10, 3) + " pieces" }] },
    { cat: "Decor", things: [{ name: "Balloons", qty: Math.ceil(guests * 3) + " balloons" }, { name: "Fairy lights", qty: "2 sets" }, { name: "Streamers", qty: "3–4 rolls" }] },
    { cat: "Misc", things: [{ name: "Garbage bags", qty: "3–4" }, { name: "Bluetooth speaker", qty: "1–2" }, { name: "Extension cord", qty: "1" }] },
  ];
  const allKeys = [...items.flatMap(c => c.things.map(t => t.name)), ...custom.map(c => c.name)];
  const doneCount = allKeys.filter(k => checked[k]).length;
  const addCustom = () => { if (newCustom.trim()) { setCustom(c => [...c, { name: newCustom.trim(), qty: "1" }]); setNewCustom(""); } };
  const toggle = (name) => setChecked(c => ({ ...c, [name]: !c[name] }));
  return (
    <Modal onClose={onClose} emoji="📋" title="Checklist" wide>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <label style={{ ...lbl, marginBottom: 4 }}>Guests</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setGuests(g => Math.max(2, g - 1))} style={{ ...mkBtn("rgba(255,255,255,0.1)"), width: 34, padding: 0, height: 34, fontSize: 18 }}>−</button>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", minWidth: 34, textAlign: "center" }}>{guests}</span>
            <button onClick={() => setGuests(g => g + 1)} style={{ ...mkBtn(accent), width: 34, padding: 0, height: 34, fontSize: 18 }}>+</button>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: doneCount === allKeys.length && allKeys.length > 0 ? "#34D399" : accent }}>{doneCount}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/{allKeys.length}</span></div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>bought</div>
        </div>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 4, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${allKeys.length ? (doneCount / allKeys.length) * 100 : 0}%`, background: doneCount === allKeys.length && allKeys.length > 0 ? "#34D399" : accent, borderRadius: 4, transition: "width 0.35s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
      {items.map(({ cat, things }) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{cat}</div>
          {things.map(({ name, qty }) => (
            <div key={name} onClick={() => toggle(name)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: checked[name] ? "rgba(52,211,153,0.07)" : "rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 6, cursor: "pointer", border: `1.5px solid ${checked[name] ? "#34D39940" : "transparent"}`, transition: "all 0.18s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked[name] ? "#34D399" : "rgba(255,255,255,0.2)"}`, background: checked[name] ? "#34D399" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                  {checked[name] && <span style={{ color: "#000", fontSize: 10, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ color: checked[name] ? "rgba(255,255,255,0.35)" : "#fff", fontSize: 13, textDecoration: checked[name] ? "line-through" : "none" }}>{name}</span>
              </div>
              <span style={{ color: checked[name] ? "rgba(255,255,255,0.25)" : accent, fontSize: 13, fontWeight: 700 }}>{qty}</span>
            </div>
          ))}
        </div>
      ))}
      {custom.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Custom</div>
          {custom.map(({ name, qty }) => (
            <div key={name} onClick={() => toggle(name)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: checked[name] ? "rgba(52,211,153,0.07)" : "rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 6, cursor: "pointer", border: `1.5px solid ${checked[name] ? "#34D39940" : "transparent"}`, transition: "all 0.18s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked[name] ? "#34D399" : "rgba(255,255,255,0.2)"}`, background: checked[name] ? "#34D399" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {checked[name] && <span style={{ color: "#000", fontSize: 10, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ color: checked[name] ? "rgba(255,255,255,0.35)" : "#fff", fontSize: 13, textDecoration: checked[name] ? "line-through" : "none" }}>{name}</span>
              </div>
              <span style={{ color: accent, fontSize: 13, fontWeight: 700 }}>{qty}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <input value={newCustom} onChange={e => setNewCustom(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustom()} placeholder="Add custom item…" style={{ ...inp, flex: 1 }} />
        <button onClick={addCustom} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>+</button>
      </div>
    </Modal>
  );
}

function PartyReportCard({ onClose, accent, categories }) {
  const cats = categories || [
    { key: "vibe", label: "Overall Vibe", emoji: "✨" },
    { key: "music", label: "Music", emoji: "🎵" },
    { key: "food", label: "Food & Drinks", emoji: "🍕" },
    { key: "host", label: "Host", emoji: "👑" },
    { key: "fun", label: "Fun Factor", emoji: "🎉" },
  ];
  const init = Object.fromEntries(cats.map(c => [c.key, 0]));
  const [ratings, setRatings] = useState(init);
  const [done, setDone] = useState(false);
  const avg = (Object.values(ratings).reduce((a, b) => a + b, 0) / cats.length).toFixed(1);
  const grade = avg >= 4.5 ? "S+" : avg >= 4 ? "A" : avg >= 3 ? "B" : avg >= 2 ? "C" : "D";
  const verdict = avg >= 4.5 ? "Absolutely legendary!" : avg >= 4 ? "That was a banger!" : avg >= 3 ? "Decent time" : avg >= 2 ? "Could've been better" : "Never again";
  return (
    <Modal onClose={onClose} emoji="🏆" title="Report Card">
      {!done ? <>
        {cats.map(({ key, label, emoji }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "#fff", marginBottom: 8 }}>{emoji} {label}</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRatings(r => ({ ...r, [key]: n }))} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${ratings[key] >= n ? accent : "rgba(255,255,255,0.15)"}`, background: ratings[key] >= n ? accent + "44" : "rgba(255,255,255,0.05)", color: "#fff", fontSize: 16, cursor: "pointer" }}>
                  {n <= ratings[key] ? "⭐" : "☆"}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => setDone(true)} disabled={Object.values(ratings).some(r => r === 0)} style={{ ...mkBtn(accent), opacity: Object.values(ratings).some(r => r === 0) ? 0.5 : 1 }}>Generate Report Card</button>
      </> : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 80, fontWeight: 900, color: grade === "S+" ? "#FBBF24" : grade === "A" ? "#34D399" : accent }}>{grade}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{verdict}</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>{avg} / 5.0</div>
          {cats.map(({ key, label, emoji }) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", marginBottom: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
              <span style={{ color: "#fff", fontSize: 13 }}>{emoji} {label}</span>
              <span style={{ color: "#FBBF24" }}>{"⭐".repeat(ratings[key])}</span>
            </div>
          ))}
          <button onClick={() => { setDone(false); setRatings(init); }} style={{ ...mkBtn("rgba(255,255,255,0.1)"), marginTop: 14 }}>Rate Again</button>
        </div>
      )}
    </Modal>
  );
}

function ShareableTool({ onClose, emoji, title, description, path, fields, accent }) {
  const [data, setData] = useState({});
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const create = async () => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (payload.items && typeof payload.items === "string") payload.items = payload.items.split(",").map(s => s.trim()).filter(Boolean);
      const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      const id = json.roomId || json.inviteId || json.wallId;
      setLink(`${window.location.origin}${path}/${id}`);
    } catch { alert("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };
  return (
    <Modal onClose={onClose} emoji={emoji} title={title}>
      {!link ? <>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>{description}</p>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <label style={lbl}>{f.label}</label>
            <input value={data[f.key] || ""} onChange={e => setData(d => ({ ...d, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inp} />
          </div>
        ))}
        <button onClick={create} disabled={loading || !fields.every(f => !f.required || data[f.key]?.trim())} style={{ ...mkBtn(accent), marginTop: 8, opacity: loading ? 0.7 : 1 }}>{loading ? "Creating…" : `Create ${title}`}</button>
      </> : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ color: "#34D399", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Link created!</div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px", wordBreak: "break-all", fontSize: 13, color: "#A78BFA", marginBottom: 16 }}>{link}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => copyLink(link)} style={{ ...mkBtn("rgba(255,255,255,0.1)"), flex: 1 }}>📋 Copy</button>
            <button onClick={() => navigate(link.replace(window.location.origin, ""))} style={{ ...mkBtn(accent), flex: 1 }}>Open →</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GAMES
// ════════════════════════════════════════════════════════════════════════════

function TruthOrDare({ onClose, accent }) {
  const [players, setPlayers] = useState([]);
  const [newP, setNewP] = useState("");
  const [phase, setPhase] = useState("setup"); // setup | spinning | mode | card
  const [current, setCurrent] = useState(null);
  const [mode, setMode] = useState(null);
  const [card, setCard] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [completedBy, setCompletedBy] = useState({});
  const [spinIdx, setSpinIdx] = useState(0);
  const spinRef = useRef(null);

  const addP = () => { if (newP.trim() && !players.includes(newP.trim())) { setPlayers(p => [...p, newP.trim()]); setNewP(""); } };
  const pickPlayer = () => {
    if (players.length === 0) { setCurrent("You"); setPhase("mode"); return; }
    setPhase("spinning");
    let count = 0, speed = 80;
    const total = 16 + Math.floor(Math.random() * 8);
    const tick = () => {
      setSpinIdx(i => (i + 1) % players.length);
      count++;
      speed = 80 + (count / total) * 300;
      if (count < total) spinRef.current = setTimeout(tick, speed);
      else {
        const winner = players[Math.floor(Math.random() * players.length)];
        setCurrent(winner);
        setTimeout(() => setPhase("mode"), 600);
      }
    };
    spinRef.current = setTimeout(tick, speed);
  };
  useEffect(() => () => clearTimeout(spinRef.current), []);
  const pickMode = (m) => {
    setMode(m);
    setCard(rand(m === "truth" ? TRUTHS : DARES));
    setFlipping(true);
    setTimeout(() => setFlipping(false), 400);
    setPhase("card");
  };
  const done = () => { if (current) setCompletedBy(c => ({ ...c, [current]: (c[current] || 0) + 1 })); goNext(); };
  const skip = () => goNext();
  const goNext = () => {
    if (players.length > 0) pickPlayer();
    else { setCard(rand(mode === "truth" ? TRUTHS : DARES)); setFlipping(true); setTimeout(() => setFlipping(false), 400); }
  };
  const totalDone = Object.values(completedBy).reduce((a, b) => a + b, 0);

  if (phase === "setup") return (
    <Modal onClose={onClose} emoji="🎯" title="Truth or Dare">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Add players for turn-based, or skip straight to cards.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={newP} onChange={e => setNewP(e.target.value)} onKeyDown={e => e.key === "Enter" && addP()} placeholder="Player name" style={{ ...inp, flex: 1 }} />
        <button onClick={addP} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>+</button>
      </div>
      {players.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {players.map(p => <span key={p} style={{ background: accent + "22", color: "#fff", padding: "5px 12px", borderRadius: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{p}<span onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ cursor: "pointer", opacity: 0.5 }}>✕</span></span>)}
      </div>}
      <button onClick={pickPlayer} style={{ ...mkBtn(accent), marginBottom: 10 }}>
        {players.length > 1 ? "🎲 Start with Turn Order →" : "🎯 Play →"}
      </button>
      {players.length > 1 && <button onClick={() => { setCurrent("You"); setPhase("mode"); }} style={{ ...mkBtn("rgba(255,255,255,0.07)") }}>Skip tracking →</button>}
    </Modal>
  );
  if (phase === "spinning") return (
    <Modal onClose={onClose} emoji="🎯" title="Truth or Dare">
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Picking who goes next…</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {players.map((p, i) => (
            <div key={p} style={{ padding: "10px 18px", borderRadius: 12, background: i === spinIdx ? accent + "35" : "rgba(255,255,255,0.05)", border: `2px solid ${i === spinIdx ? accent : "transparent"}`, color: i === spinIdx ? "#fff" : "rgba(255,255,255,0.3)", fontSize: 15, fontWeight: i === spinIdx ? 900 : 400, transition: "all 0.06s", transform: i === spinIdx ? "scale(1.12)" : "scale(1)" }}>{p}</div>
          ))}
        </div>
      </div>
    </Modal>
  );
  if (phase === "mode") return (
    <Modal onClose={onClose} emoji="🎯" title="Truth or Dare">
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{current}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>it's your turn · round {totalDone + 1}</div>
        {completedBy[current] > 0 && <div style={{ fontSize: 12, color: accent, marginTop: 6, fontWeight: 700 }}>✓ {completedBy[current]} completed</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => pickMode("truth")} style={{ ...mkBtn("#1D4ED8"), padding: "22px 20px", fontSize: 20, borderRadius: 16, letterSpacing: "0.01em" }}>🤔 Truth</button>
        <button onClick={() => pickMode("dare")} style={{ ...mkBtn("#DC2626"), padding: "22px 20px", fontSize: 20, borderRadius: 16, letterSpacing: "0.01em" }}>🔥 Dare</button>
      </div>
    </Modal>
  );
  return (
    <Modal onClose={onClose} emoji="🎯" title="Truth or Dare">
      {current && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{current}'s turn</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Round {totalDone + 1}</div>
      </div>}
      <div style={{ background: mode === "truth" ? "rgba(29,78,216,0.2)" : "rgba(220,38,38,0.2)", borderRadius: 20, padding: "28px 20px", textAlign: "center", marginBottom: 18, border: `2px solid ${mode === "truth" ? "rgba(29,78,216,0.4)" : "rgba(220,38,38,0.4)"}`, animation: flipping ? "card-flip 0.35s ease-out" : "none" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: mode === "truth" ? "#60A5FA" : "#F87171", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.12em" }}>{mode === "truth" ? "🤔 TRUTH" : "🔥 DARE"}</div>
        <div style={{ fontSize: 17, color: "#fff", lineHeight: 1.65 }}>{card}</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={done} style={{ ...mkBtn("#059669"), flex: 2, fontSize: 14 }}>✓ Done</button>
        <button onClick={skip} style={{ ...mkBtn("rgba(255,255,255,0.08)"), flex: 1, fontSize: 13 }}>Skip</button>
        <button onClick={() => pickMode(mode === "truth" ? "dare" : "truth")} style={{ ...mkBtn(mode === "truth" ? "#DC2626aa" : "#1D4ED8aa"), flex: 1, fontSize: 13 }}>{mode === "truth" ? "🔥" : "🤔"}</button>
      </div>
      {Object.keys(completedBy).length > 0 && (
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(completedBy).sort(([, a], [, b]) => b - a).map(([p, c]) => (
            <span key={p} style={{ background: "#059669" + "22", color: "#34D399", padding: "4px 10px", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>✓ {p} {c > 1 ? `×${c}` : ""}</span>
          ))}
        </div>
      )}
    </Modal>
  );
}

function NeverHaveI({ onClose, accent }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * NEVER_HAVE_I.length));
  const [scores, setScores] = useState({});
  const [players, setPlayers] = useState([]);
  const [newP, setNewP] = useState("");
  const [justMarked, setJustMarked] = useState(null);
  const [round, setRound] = useState(1);
  const add = () => { if (newP.trim() && !players.includes(newP.trim())) { setPlayers(p => [...p, newP.trim()]); setNewP(""); } };
  const mark = (n) => { setScores(s => ({ ...s, [n]: (s[n] || 0) + 1 })); setJustMarked(n); setTimeout(() => setJustMarked(null), 1000); };
  const next = () => { setIdx(i => (i + 1) % NEVER_HAVE_I.length); setRound(r => r + 1); };
  const maxScore = Math.max(...Object.values(scores), 0);
  return (
    <Modal onClose={onClose} emoji="🙅" title="Never Have I Ever">
      {players.length < 2 ? (
        <div>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 14, fontSize: 13 }}>Add 2+ players to track scores, or dive right in.</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input value={newP} onChange={e => setNewP(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Player name" style={{ ...inp, flex: 1 }} />
            <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
          </div>
          {players.map(p => <div key={p} style={{ ...crd, display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>{p}</span><span onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ cursor: "pointer", opacity: 0.45 }}>✕</span></div>)}
          <button onClick={next} style={{ ...mkBtn(accent), marginTop: 8 }}>Play {players.length >= 2 ? "with scoring →" : "without scores →"}</button>
          {players.length >= 2 && <button onClick={() => { setPlayers([]); next(); }} style={{ ...mkBtn("rgba(255,255,255,0.07)"), marginTop: 8 }}>Skip to game →</button>}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Statement {round}</div>
            {maxScore > 0 && <div style={{ fontSize: 12, color: accent, fontWeight: 700 }}>🍺 Leader: {Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0]}</div>}
          </div>
          <div style={{ background: "rgba(5,150,105,0.14)", border: "1.5px solid rgba(5,150,105,0.3)", borderRadius: 18, padding: "26px 18px", textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Never Have I Ever…</div>
            <div style={{ fontSize: 17, color: "#fff", lineHeight: 1.6 }}>{NEVER_HAVE_I[idx]}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>Tap if you HAVE done it 🍺</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {players.map(p => {
                const count = scores[p] || 0;
                const isJust = justMarked === p;
                return (
                  <button key={p} onClick={() => mark(p)} style={{ padding: "10px 16px", borderRadius: 14, border: `1.5px solid ${count > 0 ? accent + "60" : "rgba(255,255,255,0.15)"}`, background: isJust ? accent + "40" : count > 0 ? accent + "18" : "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: count > 0 ? 700 : 400, transition: "all 0.15s", transform: isJust ? "scale(1.08)" : "scale(1)" }}>
                    {p} {"🍺".repeat(count) || "—"}
                  </button>
                );
              })}
            </div>
          </div>
          {maxScore > 0 && (
            <div style={{ marginBottom: 14 }}>
              {players.sort((a, b) => (scores[b] || 0) - (scores[a] || 0)).slice(0, 3).map((p, i) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, minWidth: 20, color: "rgba(255,255,255,0.3)" }}>{["🥇","🥈","🥉"][i]}</span>
                  <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${maxScore ? ((scores[p] || 0) / maxScore) * 100 : 0}%`, background: [accent, accent + "88", accent + "55"][i], borderRadius: 4, transition: "width 0.4s" }} />
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", minWidth: 60, textAlign: "right" }}>{p} ({scores[p] || 0})</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={next} style={mkBtn(accent)}>Next Statement →</button>
        </div>
      )}
    </Modal>
  );
}

function WouldYouRather({ onClose, accent }) {
  const [pair, setPair] = useState(() => rand(WOULD_YOU_RATHER));
  const [votes, setVotes] = useState({ a: 0, b: 0 });
  const [myPick, setMyPick] = useState(null);
  const [round, setRound] = useState(1);
  const totalVotes = votes.a + votes.b;
  const pctA = totalVotes ? Math.round((votes.a / totalVotes) * 100) : 50;
  const pctB = 100 - pctA;
  const pick = (side) => {
    if (myPick) return;
    setMyPick(side);
    setVotes(v => ({ ...v, [side]: v[side] + 1 }));
  };
  const next = () => { setPair(rand(WOULD_YOU_RATHER)); setMyPick(null); setVotes({ a: 0, b: 0 }); setRound(r => r + 1); };
  const debatePrompts = ["Defend your choice!", "Convince the other side!", "Why would anyone pick the other?!", "No backtracking now!", "Explain yourself!"];
  return (
    <Modal onClose={onClose} emoji="🤷" title="Would You Rather">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>Round {round}</div>
        {totalVotes > 0 && <div style={{ fontSize: 12, color: accent }}>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</div>}
      </div>
      <div style={{ marginBottom: myPick ? 12 : 16 }}>
        {["a", "b"].map((side, si) => {
          const pct = side === "a" ? pctA : pctB;
          const isChosen = myPick === side;
          const isOther = myPick && myPick !== side;
          return (
            <div key={side} onClick={() => pick(side)} style={{ display: "block", width: "100%", marginBottom: 10, padding: "18px 16px", borderRadius: 16, border: `2px solid ${isChosen ? accent : isOther ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.14)"}`, background: isChosen ? accent + "28" : isOther ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)", color: isOther ? "rgba(255,255,255,0.4)" : "#fff", fontSize: 15, fontFamily: font, cursor: myPick ? "default" : "pointer", textAlign: "left", lineHeight: 1.45, position: "relative", overflow: "hidden", transition: "all 0.2s", boxSizing: "border-box" }}>
              {myPick && <div style={{ position: "absolute", inset: 0, left: 0, width: `${pct}%`, background: isChosen ? accent + "15" : "rgba(255,255,255,0.03)", borderRadius: 14, transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)", pointerEvents: "none" }} />}
              <div style={{ position: "relative" }}>
                <span style={{ fontWeight: 700, color: isChosen ? accent : "rgba(255,255,255,0.4)", marginRight: 8, fontSize: 13 }}>{si === 0 ? "A" : "B"}</span>
                {pair[side]}
              </div>
              {myPick && (
                <div style={{ position: "relative", marginTop: 8, fontSize: 13, fontWeight: 800, color: isChosen ? accent : "rgba(255,255,255,0.3)" }}>{pct}%</div>
              )}
            </div>
          );
        })}
      </div>
      {myPick && (
        <div style={{ textAlign: "center", background: accent + "15", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 14, color: accent, fontWeight: 700 }}>
          {rand(debatePrompts)}
        </div>
      )}
      <button onClick={next} style={mkBtn(myPick ? accent : "rgba(255,255,255,0.12)")}>{myPick ? "Next Question →" : "Skip"}</button>
    </Modal>
  );
}

function HotTakes({ onClose, accent }) {
  const [take, setTake] = useState(() => rand(HOT_TAKES));
  const [votes, setVotes] = useState({ agree: 0, disagree: 0 });
  const [myVote, setMyVote] = useState(null);
  const [round, setRound] = useState(1);
  const total = votes.agree + votes.disagree;
  const agPct = total ? Math.round((votes.agree / total) * 100) : 0;
  const disPct = total ? 100 - agPct : 0;
  const controversy = total >= 2 ? Math.round((1 - Math.abs(agPct - disPct) / 100) * 100) : 0;
  const vote = (side) => {
    if (myVote) return;
    setMyVote(side);
    setVotes(v => ({ ...v, [side]: v[side] + 1 }));
  };
  const next = () => { setTake(rand(HOT_TAKES)); setMyVote(null); setVotes({ agree: 0, disagree: 0 }); setRound(r => r + 1); };
  return (
    <Modal onClose={onClose} emoji="🌶️" title="Hot Takes">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Take {round}</div>
        {total > 0 && <div style={{ fontSize: 12, color: total >= 2 && controversy >= 60 ? "#F87171" : "rgba(255,255,255,0.35)" }}>
          {controversy >= 60 ? `🔥 ${controversy}% controversial` : `${total} votes`}
        </div>}
      </div>
      <div style={{ background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.28)", borderRadius: 18, padding: "26px 18px", textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#F87171", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>🌶️ Hot Take</div>
        <div style={{ fontSize: 17, color: "#fff", lineHeight: 1.6 }}>{take}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {[["agree", "✅ Agree", "#059669"], ["disagree", "❌ Disagree", "#DC2626"]].map(([side, label, clr]) => (
          <button key={side} onClick={() => vote(side)} style={{ ...mkBtn(myVote === side ? clr : myVote ? clr + "30" : "rgba(255,255,255,0.08)"), flex: 1, fontSize: 14, opacity: myVote && myVote !== side ? 0.55 : 1, transition: "all 0.2s" }}>{label}</button>
        ))}
      </div>
      {myVote && total >= 1 && (
        <>
          <div style={{ marginBottom: 14 }}>
            {[{ label: "✅ Agree", pct: agPct, clr: "#059669" }, { label: "❌ Disagree", pct: disPct, clr: "#DC2626" }].map(({ label, pct, clr }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, minWidth: 70, color: "rgba(255,255,255,0.5)" }}>{label}</span>
                <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: clr, borderRadius: 4, transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: clr, minWidth: 36, textAlign: "right" }}>{pct}%</span>
              </div>
            ))}
          </div>
          {controversy >= 60 && (
            <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "center", fontSize: 13, color: "#F87171", fontWeight: 700 }}>
              🌶️ The crowd is divided — debate time!
            </div>
          )}
        </>
      )}
      <button onClick={next} style={mkBtn(accent)}>Next Take →</button>
    </Modal>
  );
}

function SpinBottle({ onClose, accent }) {
  const [players, setPlayers] = useState([]);
  const [newP, setNewP] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [angle, setAngle] = useState(0);
  const [revealing, setRevealing] = useState(false);
  const addP = () => { if (newP.trim() && !players.includes(newP.trim())) { setPlayers(p => [...p, newP.trim()]); setNewP(""); } };
  const spin = () => {
    if (players.length < 2) return;
    setSpinning(true); setResult(null); setRevealing(false);
    const extra = 1440 + Math.random() * 1080;
    setAngle(a => a + extra);
    setTimeout(() => {
      setSpinning(false);
      setRevealing(true);
      setTimeout(() => { setResult(rand(players)); setRevealing(false); }, 600);
    }, 3200);
  };
  return (
    <Modal onClose={onClose} emoji="🍾" title="Random Picker">
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={newP} onChange={e => setNewP(e.target.value)} onKeyDown={e => e.key === "Enter" && addP()} placeholder="Add a name" style={{ ...inp, flex: 1 }} />
        <button onClick={addP} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>+</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {players.map(p => <span key={p} style={{ background: accent + "25", color: "#fff", padding: "5px 12px", borderRadius: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{p}<span onClick={() => { setPlayers(pl => pl.filter(x => x !== p)); setResult(null); }} style={{ cursor: "pointer", opacity: 0.5 }}>✕</span></span>)}
      </div>
      {players.length >= 2 && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, position: "relative" }}>
          <div style={{ position: "relative", width: 180, height: 180, borderRadius: "50%", border: `4px solid ${accent}44`, background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 4, height: 82, background: `linear-gradient(to top, ${accent}cc, #fff)`, borderRadius: "2px 2px 0 0", transformOrigin: "50% 100%", transform: `rotate(${angle}deg)`, transition: spinning ? "transform 3.2s cubic-bezier(0.17,0.67,0.08,0.99)" : "none", position: "absolute", bottom: "50%", left: "calc(50% - 2px)", boxShadow: `0 -4px 12px ${accent}80` }} />
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: accent, zIndex: 2, position: "relative", boxShadow: `0 0 16px ${accent}aa` }} />
          </div>
        </div>
      )}
      {(result && !spinning && !revealing) ? (
        <div style={{ textAlign: "center", padding: "16px", background: accent + "18", borderRadius: 14, marginBottom: 14, border: `1.5px solid ${accent}44`, animation: "card-flip 0.3s ease-out" }}>
          <div style={{ fontSize: 11, color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Selected!</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>🎯 {result}</div>
        </div>
      ) : revealing ? (
        <div style={{ textAlign: "center", padding: "16px", marginBottom: 14 }}>
          <div style={{ fontSize: 32, animation: "splash-pulse 0.6s ease-in-out" }}>🎯</div>
        </div>
      ) : null}
      <button onClick={spin} disabled={players.length < 2 || spinning} style={{ ...mkBtn(accent), opacity: players.length < 2 ? 0.5 : 1 }}>
        {spinning ? "Spinning…" : players.length < 2 ? "Add at least 2 names" : result ? "Spin Again!" : "SPIN! 🎯"}
      </button>
    </Modal>
  );
}

function Charades({ onClose, accent }) {
  const cats = { bollywood: "🎬 Bollywood", webshows: "📺 Web Shows", celebs: "🌟 Celebs", memesphrases: "😂 Memes & Phrases" };
  const [cat, setCat] = useState(null);
  const [word, setWord] = useState(null);
  const [timer, setTimer] = useState(60);
  const [timerKey, setTimerKey] = useState(0);
  const [teamScores, setTeamScores] = useState({ A: 0, B: 0 });
  const [currentTeam, setCurrentTeam] = useState("A");
  const [round, setRound] = useState(1);
  const ref = useRef(null);
  const pick = (c) => { setCat(c); setWord(rand(CHARADES[c])); setTimer(60); setTimerKey(k => k + 1); };
  const nextWord = () => { setWord(rand(CHARADES[cat])); setTimer(60); setTimerKey(k => k + 1); };
  const correct = () => {
    setTeamScores(s => ({ ...s, [currentTeam]: s[currentTeam] + 1 }));
    nextWord();
    setCurrentTeam(t => t === "A" ? "B" : "A");
    setRound(r => r + 1);
  };
  const skip = () => { nextWord(); setCurrentTeam(t => t === "A" ? "B" : "A"); setRound(r => r + 1); };
  useEffect(() => {
    if (timer === null || timer <= 0) { clearInterval(ref.current); return; }
    ref.current = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(ref.current);
  }, [timerKey]);
  if (!cat) return (
    <Modal onClose={onClose} emoji="🎭" title="Dumb Charades">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Team A vs Team B · 60s per word · most points wins!</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Object.entries(cats).map(([k, v]) => <button key={k} onClick={() => pick(k)} style={{ ...mkBtn("rgba(255,255,255,0.06)"), border: `1.5px solid ${accent}44`, textAlign: "left", padding: "16px 18px", fontSize: 16 }}>{v}</button>)}
      </div>
    </Modal>
  );
  return (
    <Modal onClose={onClose} emoji="🎭" title="Dumb Charades">
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {["A", "B"].map(t => (
          <div key={t} style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: 12, background: currentTeam === t ? accent + "22" : "rgba(255,255,255,0.04)", border: `1.5px solid ${currentTeam === t ? accent : "rgba(255,255,255,0.1)"}`, transition: "all 0.2s" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Team {t}{currentTeam === t ? " 🎯" : ""}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: currentTeam === t ? accent : "#fff" }}>{teamScores[t]}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 11, color: accent, fontWeight: 700, marginBottom: 12 }}>{cats[cat]} · Round {round}</div>
        <div style={{ background: accent + "18", border: `2px solid ${accent}40`, borderRadius: 20, padding: "28px 20px", marginBottom: 14 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.01em" }}>{word}</div>
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: timer > 15 ? "#34D399" : timer > 5 ? "#FBBF24" : "#F87171", marginBottom: 6, fontVariantNumeric: "tabular-nums", lineHeight: 1, transition: "color 0.3s" }}>{timer}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>seconds</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={correct} style={{ ...mkBtn("#059669"), flex: 2, fontSize: 15 }}>✓ Correct +1</button>
          <button onClick={skip} style={{ ...mkBtn("rgba(255,255,255,0.08)"), flex: 1, fontSize: 13 }}>Skip</button>
          <button onClick={() => { setCat(null); setWord(null); clearInterval(ref.current); }} style={{ ...mkBtn("rgba(255,255,255,0.06)"), flex: 1, fontSize: 12 }}>◀</button>
        </div>
      </div>
    </Modal>
  );
}

function Bingo({ onClose, accent, squares }) {
  const src = squares || BINGO_SQUARES;
  const [card] = useState(() => shuffle(src).slice(0, 25));
  const [marked, setMarked] = useState({ 12: true });
  const [bingo, setBingo] = useState(false);
  const [winLines, setWinLines] = useState([]);
  const [justMarked, setJustMarked] = useState(null);
  const LINES = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],[0,6,12,18,24],[4,8,12,16,20]];
  const toggle = (i) => {
    if (i === 12) return;
    const next = { ...marked, [i]: !marked[i] };
    setMarked(next);
    setJustMarked(next[i] ? i : null);
    setTimeout(() => setJustMarked(null), 500);
    const wins = LINES.filter(line => line.every(j => next[j]));
    setBingo(wins.length > 0);
    setWinLines(wins);
  };
  const inWinLine = (i) => winLines.some(line => line.includes(i));
  const markedCount = Object.values(marked).filter(Boolean).length;
  return (
    <Modal onClose={onClose} emoji="🎱" title="Bingo" wide>
      {bingo && (
        <div style={{ textAlign: "center", marginBottom: 16, background: "rgba(251,191,36,0.12)", borderRadius: 14, padding: "14px", border: "1.5px solid rgba(251,191,36,0.3)" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#FBBF24", letterSpacing: "-0.02em" }}>🎉 BINGO!</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Shout it out!</div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Tap when it happens</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>{markedCount}/25</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 12 }}>
        {card.map((sq, i) => {
          const isMarked = !!marked[i];
          const isCenter = i === 12;
          const isWin = inWinLine(i);
          const isJust = justMarked === i;
          return (
            <div key={i} onClick={() => toggle(i)} style={{
              aspectRatio: "1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: 4,
              cursor: isCenter ? "default" : "pointer", transition: "all 0.15s",
              background: isCenter ? accent + "40" : isWin ? "#FBBF2440" : isMarked ? accent + "40" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${isCenter ? accent : isWin ? "#FBBF24" : isMarked ? accent + "80" : "rgba(255,255,255,0.1)"}`,
              transform: isJust ? "scale(1.2)" : "scale(1)",
              boxShadow: isWin ? `0 0 10px ${accent}40` : "none",
            }}>
              <span style={{ fontSize: 8, color: isMarked || isCenter ? "#fff" : "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 1.2, fontWeight: isMarked ? 700 : 400 }}>
                {isCenter ? "⭐" : isMarked ? "✓ " + sq : sq}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>Get 5 in a row — horizontal, vertical, or diagonal!</p>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OCCASION-SPECIFIC TOOLS
// ════════════════════════════════════════════════════════════════════════════

function WallPost({ post, accent, onReact }) {
  return (
    <div style={{ ...crd, borderLeft: `3px solid ${accent}`, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 20 }}>{post.emoji}</span>
        <div>
          <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginBottom: 4 }}>{post.name}</div>
          <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.55 }}>{post.text}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["❤️", "🎉", "✨", "😍"].map(r => (
          <button key={r} onClick={() => onReact(post.id, r)} style={{ background: (post.reactions?.[r] || 0) > 0 ? accent + "22" : "rgba(255,255,255,0.05)", border: `1px solid ${(post.reactions?.[r] || 0) > 0 ? accent + "55" : "rgba(255,255,255,0.1)"}`, borderRadius: 20, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: (post.reactions?.[r] || 0) > 0 ? "#fff" : "rgba(255,255,255,0.45)", fontFamily: font, transition: "all 0.15s" }}>
            {r} {(post.reactions?.[r] || 0) > 0 ? post.reactions[r] : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

// Birthday: Wish Wall
function WishWall({ onClose, accent, celebrant }) {
  const [wishes, setWishes] = useState([]);
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const post = () => {
    if (!wish.trim()) return;
    setWishes(w => [{ id: Date.now(), name: name.trim() || "Anonymous", text: wish.trim(), emoji: rand(["🎂", "🎉", "🥳", "🎁", "❤️", "✨", "🌟", "🎈"]), reactions: {} }, ...w]);
    setName(""); setWish("");
  };
  const react = (id, emoji) => setWishes(ws => ws.map(w => w.id === id ? { ...w, reactions: { ...w.reactions, [emoji]: (w.reactions[emoji] || 0) + 1 } } : w));
  return (
    <Modal onClose={onClose} emoji="🎂" title={`Wish Wall for ${celebrant || "the Birthday Star"}`} wide>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)" style={{ ...inp, marginBottom: 8 }} />
      <textarea value={wish} onChange={e => setWish(e.target.value)} placeholder={`Write a wish for ${celebrant || "them"}…`} style={{ ...inp, minHeight: 80, resize: "vertical", marginBottom: 10 }} />
      <button onClick={post} style={{ ...mkBtn(accent), marginBottom: 20 }}>Post Wish 🎉</button>
      {wishes.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No wishes yet — be the first!</p>}
      {wishes.map(w => <WallPost key={w.id} post={w} accent={accent} onReact={react} />)}
    </Modal>
  );
}

// Birthday: Birthday Quiz
function BirthdayQuiz({ onClose, accent, celebrant }) {
  const questions = [
    { q: `What is ${celebrant || "the birthday person"}'s favourite food?`, opts: ["Biryani", "Pizza", "Chinese", "Anything I cook"] },
    { q: `What would ${celebrant || "they"} most likely spend a windfall on?`, opts: ["Travel", "Gadgets", "Clothes", "Saving it"] },
    { q: `What's ${celebrant || "their"} go-to excuse to skip plans?`, opts: ["Sick", "Work", "No mood", "Already have plans"] },
    { q: `${celebrant || "They"} get 1 free day — what do they do?`, opts: ["Sleep all day", "Binge Netflix", "Go out", "Cook something new"] },
    { q: `What's ${celebrant || "their"} spirit animal?`, opts: ["Dog 🐶", "Cat 🐱", "Panda 🐼", "Peacock 🦚"] },
  ];
  const [phase, setPhase] = useState("setup"); // setup | playing | results
  const [playerName, setPlayerName] = useState("");
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [revealMode, setRevealMode] = useState(false);

  const submit = () => {
    if (Object.keys(answers).length < questions.length) return;
    setAllSubmissions(s => [...s, { name: playerName.trim() || "Player " + (s.length + 1), answers: { ...answers } }]);
    setAnswers({});
    setPlayerName("");
    setPhase("setup");
  };
  const setCorrect = (qIdx, opt) => setCorrectAnswers(c => ({ ...c, [qIdx]: opt }));
  const calcScore = (sub) => questions.filter((_, i) => correctAnswers[i] && sub.answers[i] === correctAnswers[i]).length;
  const revealDone = Object.keys(correctAnswers).length === questions.length;

  if (phase === "setup") return (
    <Modal onClose={onClose} emoji="🎯" title={`How well do you know ${celebrant || "them"}?`} wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Pass the phone · each person answers · highest score wins!</p>
      {allSubmissions.length > 0 && (
        <div style={{ marginBottom: 14, background: accent + "10", borderRadius: 12, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Answered ({allSubmissions.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allSubmissions.map((s, i) => <span key={i} style={{ background: "rgba(255,255,255,0.07)", color: "#fff", padding: "4px 10px", borderRadius: 10, fontSize: 12 }}>✓ {s.name}</span>)}
          </div>
        </div>
      )}
      <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Your name (e.g. Rahul)" style={{ ...inp, marginBottom: 10 }} />
      <button onClick={() => setPhase("playing")} style={{ ...mkBtn(accent), marginBottom: 10 }}>Take the Quiz →</button>
      {allSubmissions.length >= 1 && (
        <button onClick={() => setRevealMode(true)} style={{ ...mkBtn("rgba(255,255,255,0.08)") }}>🏆 Reveal Results</button>
      )}
      {revealMode && allSubmissions.length >= 1 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            {revealDone ? "Results:" : `Set correct answers (${Object.keys(correctAnswers).length}/${questions.length})`}
          </div>
          {!revealDone && questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: accent, marginBottom: 6 }}>Q{i + 1}. {q.q}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {q.opts.map(opt => <button key={opt} onClick={() => setCorrect(i, opt)} style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${correctAnswers[i] === opt ? "#34D399" : "rgba(255,255,255,0.1)"}`, background: correctAnswers[i] === opt ? "#34D39922" : "rgba(255,255,255,0.04)", color: correctAnswers[i] === opt ? "#34D399" : "#fff", fontFamily: font, fontSize: 12, cursor: "pointer" }}>{opt}</button>)}
              </div>
            </div>
          ))}
          {revealDone && (
            <div>
              {[...allSubmissions].sort((a, b) => calcScore(b) - calcScore(a)).map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: i === 0 ? "#FBBF2415" : "rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 6, border: `1.5px solid ${i === 0 ? "#FBBF2444" : "transparent"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i] || (i + 1)}</span>
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: i === 0 ? 700 : 400 }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? "#FBBF24" : accent }}>{calcScore(s)}/{questions.length}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
  return (
    <Modal onClose={onClose} emoji="🎯" title={`${playerName ? `${playerName}'s turn` : "Your turn"}`} wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Answer all 5 questions — no peeking!</p>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, color: "#fff", marginBottom: 10, lineHeight: 1.4 }}><span style={{ color: accent, fontWeight: 700 }}>Q{i + 1}.</span> {q.q}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {q.opts.map(opt => <button key={opt} onClick={() => setAnswers(a => ({ ...a, [i]: opt }))} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${answers[i] === opt ? accent : "rgba(255,255,255,0.1)"}`, background: answers[i] === opt ? accent + "30" : "rgba(255,255,255,0.04)", color: "#fff", fontFamily: font, fontSize: 13, textAlign: "left", cursor: "pointer", transition: "all 0.15s" }}>{opt}</button>)}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} disabled={Object.keys(answers).length < questions.length} style={{ ...mkBtn(accent), flex: 2, opacity: Object.keys(answers).length < questions.length ? 0.5 : 1 }}>Submit Answers</button>
        <button onClick={() => { setAnswers({}); setPhase("setup"); }} style={{ ...mkBtn("rgba(255,255,255,0.07)"), flex: 1 }}>Cancel</button>
      </div>
    </Modal>
  );
}

// Anniversary: Love Notes Wall
function LoveNotes({ onClose, accent }) {
  const [notes, setNotes] = useState([]);
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");
  const post = () => {
    if (!note.trim()) return;
    setNotes(n => [{ id: Date.now(), name: `From ${from.trim() || "Anonymous"}`, text: note.trim(), emoji: rand(["💍", "❤️", "🌹", "💫", "✨", "💌", "🥂", "💎"]), reactions: {} }, ...n]);
    setFrom(""); setNote("");
  };
  const react = (id, emoji) => setNotes(ns => ns.map(n => n.id === id ? { ...n, reactions: { ...n.reactions, [emoji]: (n.reactions[emoji] || 0) + 1 } } : n));
  return (
    <Modal onClose={onClose} emoji="💌" title="Love Notes Wall" wide>
      <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Your name" style={{ ...inp, marginBottom: 8 }} />
      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Write a note for the couple…" style={{ ...inp, minHeight: 80, resize: "vertical", marginBottom: 10 }} />
      <button onClick={post} style={{ ...mkBtn(accent), marginBottom: 20 }}>Post Note 💌</button>
      {notes.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Be the first to leave a note for the couple!</p>}
      {notes.map(n => <WallPost key={n.id} post={n} accent={accent} onReact={react} />)}
    </Modal>
  );
}

// Anniversary: Couple Quiz
function CoupleQuiz({ onClose, accent }) {
  const questions = [
    { q: "Where did they first meet?", opts: ["College", "Work", "Common friends", "Online"] },
    { q: "Who said 'I love you' first?", opts: ["Person 1", "Person 2", "Both at once", "Still waiting 😅"] },
    { q: "What's their song?", opts: ["They have one ❤️", "Still arguing about it", "Whatever's on Spotify", "No idea"] },
    { q: "Who's the better cook?", opts: ["Person 1", "Person 2", "Both bad", "Zomato is their chef 😂"] },
    { q: "Who controls the TV remote?", opts: ["Person 1 always", "Person 2 always", "They fight for it", "They have 2 TVs 😂"] },
  ];
  const [phase, setPhase] = useState("setup");
  const [playerName, setPlayerName] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const submit = () => {
    if (Object.keys(answers).length < questions.length) return;
    setSubmissions(s => [...s, { name: playerName.trim() || "Player " + (s.length + 1), answers: { ...answers } }]);
    setAnswers({}); setPlayerName(""); setPhase("setup");
  };
  const calcScore = (sub) => questions.filter((_, i) => correctAnswers[i] && sub.answers[i] === correctAnswers[i]).length;
  const revealDone = Object.keys(correctAnswers).length === questions.length;
  if (phase === "setup") return (
    <Modal onClose={onClose} emoji="💑" title="Couple Quiz" wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Pass the phone · everyone guesses · couple reveals answers!</p>
      {submissions.length > 0 && (
        <div style={{ marginBottom: 14, background: accent + "10", borderRadius: 12, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Played ({submissions.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{submissions.map((s, i) => <span key={i} style={{ background: "rgba(255,255,255,0.07)", color: "#fff", padding: "4px 10px", borderRadius: 10, fontSize: 12 }}>✓ {s.name}</span>)}</div>
        </div>
      )}
      <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Your name" style={{ ...inp, marginBottom: 10 }} />
      <button onClick={() => setPhase("playing")} style={{ ...mkBtn(accent), marginBottom: 10 }}>Take the Quiz →</button>
      {submissions.length >= 1 && <button onClick={() => setShowResults(r => !r)} style={{ ...mkBtn("rgba(255,255,255,0.08)") }}>🏆 {showResults ? "Hide" : "Reveal"} Results</button>}
      {showResults && submissions.length >= 1 && (
        <div style={{ marginTop: 16 }}>
          {!revealDone ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Couple: set the correct answers!</div>
              {questions.map((q, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: accent, marginBottom: 6 }}>Q{i + 1}. {q.q}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {q.opts.map(opt => <button key={opt} onClick={() => setCorrectAnswers(c => ({ ...c, [i]: opt }))} style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${correctAnswers[i] === opt ? "#34D399" : "rgba(255,255,255,0.1)"}`, background: correctAnswers[i] === opt ? "#34D39922" : "rgba(255,255,255,0.04)", color: correctAnswers[i] === opt ? "#34D399" : "#fff", fontFamily: font, fontSize: 12, cursor: "pointer" }}>{opt}</button>)}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Leaderboard 🏆</div>
              {[...submissions].sort((a, b) => calcScore(b) - calcScore(a)).map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: i === 0 ? "#FBBF2415" : "rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 6, border: `1.5px solid ${i === 0 ? "#FBBF2444" : "transparent"}` }}>
                  <span style={{ color: "#fff", fontSize: 14 }}>{["🥇","🥈","🥉"][i] || (i + 1)} {s.name}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? "#FBBF24" : accent }}>{calcScore(s)}/{questions.length}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
  return (
    <Modal onClose={onClose} emoji="💑" title={`${playerName ? `${playerName}'s turn` : "Your turn"}`} wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>How well do you know the couple?</p>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, color: "#fff", marginBottom: 10, lineHeight: 1.4 }}><span style={{ color: accent, fontWeight: 700 }}>Q{i + 1}.</span> {q.q}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {q.opts.map(opt => <button key={opt} onClick={() => setAnswers(a => ({ ...a, [i]: opt }))} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${answers[i] === opt ? accent : "rgba(255,255,255,0.1)"}`, background: answers[i] === opt ? accent + "30" : "rgba(255,255,255,0.04)", color: "#fff", fontFamily: font, fontSize: 13, textAlign: "left", cursor: "pointer", transition: "all 0.15s" }}>{opt}</button>)}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} disabled={Object.keys(answers).length < questions.length} style={{ ...mkBtn(accent), flex: 2, opacity: Object.keys(answers).length < questions.length ? 0.5 : 1 }}>Submit</button>
        <button onClick={() => { setAnswers({}); setPhase("setup"); }} style={{ ...mkBtn("rgba(255,255,255,0.07)"), flex: 1 }}>Cancel</button>
      </div>
    </Modal>
  );
}

// Baby Shower: Baby Name Vote
function BabyNameVote({ onClose, accent }) {
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState("");
  const [votes, setVotes] = useState({});
  const [voted, setVoted] = useState(null);
  const add = () => { if (newName.trim() && !names.includes(newName.trim())) { setNames(n => [...n, newName.trim()]); setNewName(""); } };
  const vote = (n) => {
    if (voted) setVotes(v => ({ ...v, [voted]: Math.max(0, (v[voted] || 0) - 1) }));
    setVoted(n);
    setVotes(v => ({ ...v, [n]: (v[n] || 0) + 1 }));
  };
  const max = Math.max(...Object.values(votes), 0);
  return (
    <Modal onClose={onClose} emoji="👶" title="Baby Name Vote">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Suggest a name" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      {names.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Add baby name suggestions above!</p>}
      {names.map(n => (
        <div key={n} onClick={() => vote(n)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${voted === n ? accent : "rgba(255,255,255,0.1)"}`, background: voted === n ? accent + "22" : "rgba(255,255,255,0.04)", marginBottom: 8, cursor: "pointer" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{n}</div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${max ? ((votes[n] || 0) / max) * 100 : 0}%`, background: accent, borderRadius: 4, transition: "width 0.3s" }} />
            </div>
          </div>
          <span style={{ fontWeight: 800, color: accent, fontSize: 18 }}>{votes[n] || 0}</span>
        </div>
      ))}
      {max > 0 && <div style={{ textAlign: "center", marginTop: 12, color: "#FBBF24", fontSize: 14 }}>🏆 Leading: {Object.entries(votes).sort(([, a], [, b]) => b - a)[0]?.[0]}</div>}
    </Modal>
  );
}

// Baby Shower: Gender Prediction Poll
function GenderPoll({ onClose, accent }) {
  const [votes, setVotes] = useState({ boy: 0, girl: 0 });
  const [myVote, setMyVote] = useState(null);
  const [showReveal, setShowReveal] = useState(false);
  const total = votes.boy + votes.girl;
  const boyPct = total ? Math.round((votes.boy / total) * 100) : 50;
  const girlPct = 100 - boyPct;
  const winner = total > 0 ? (votes.boy > votes.girl ? "boy" : votes.girl > votes.boy ? "girl" : "tie") : null;
  const cast = (v) => {
    if (myVote) return;
    setMyVote(v);
    setVotes(s => ({ ...s, [v]: s[v] + 1 }));
  };
  return (
    <Modal onClose={onClose} emoji="🍼" title="Gender Prediction Poll">
      {showReveal && total > 0 ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{winner === "boy" ? "👦" : winner === "girl" ? "👧" : "🤝"}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>The crowd says…</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: winner === "boy" ? "#60A5FA" : winner === "girl" ? "#F472B6" : "#fff", marginBottom: 16 }}>{winner === "boy" ? "It's a Boy!" : winner === "girl" ? "It's a Girl!" : "Too close to call!"}</div>
          <div style={{ display: "flex", gap: 0, borderRadius: 14, overflow: "hidden", height: 40, marginBottom: 12 }}>
            <div style={{ width: `${boyPct}%`, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }}>{boyPct > 15 ? `👦 ${boyPct}%` : ""}</div>
            <div style={{ flex: 1, background: "#DB2777", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>{girlPct > 15 ? `${girlPct}% 👧` : ""}</div>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>{votes.boy} boy · {votes.girl} girl · {total} votes total</div>
          <button onClick={() => setShowReveal(false)} style={{ ...mkBtn("rgba(255,255,255,0.08)") }}>← Back to voting</button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20, textAlign: "center" }}>Pass the phone — everyone votes once!</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <button onClick={() => cast("boy")} style={{ ...mkBtn(myVote === "boy" ? "#2563EB" : "#2563EB55"), flex: 1, padding: "28px 16px", fontSize: 28, borderRadius: 18, border: `2px solid ${myVote === "boy" ? "#60A5FA" : "rgba(96,165,250,0.2)"}`, opacity: myVote && myVote !== "boy" ? 0.5 : 1, transition: "all 0.2s" }}>
              👦<div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>Boy</div>
            </button>
            <button onClick={() => cast("girl")} style={{ ...mkBtn(myVote === "girl" ? "#DB2777" : "#DB277755"), flex: 1, padding: "28px 16px", fontSize: 28, borderRadius: 18, border: `2px solid ${myVote === "girl" ? "#F472B6" : "rgba(244,114,182,0.2)"}`, opacity: myVote && myVote !== "girl" ? 0.5 : 1, transition: "all 0.2s" }}>
              👧<div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>Girl</div>
            </button>
          </div>
          {total > 0 && <>
            <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", height: 28, marginBottom: 8, transition: "all 0.4s" }}>
              <div style={{ width: `${boyPct}%`, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800, transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)", minWidth: boyPct > 20 ? 40 : 0 }}>{boyPct > 20 ? `${boyPct}%` : ""}</div>
              <div style={{ flex: 1, background: "#DB2777", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>{girlPct > 20 ? `${girlPct}%` : ""}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
              <span>👦 {votes.boy} votes</span>
              <span>{total} total</span>
              <span>{votes.girl} votes 👧</span>
            </div>
            <button onClick={() => setShowReveal(true)} style={mkBtn(accent)}>🎉 Reveal the Verdict!</button>
          </>}
        </>
      )}
    </Modal>
  );
}

// Baby Shower: Advice Cards for parents
function AdviceCards({ onClose, accent }) {
  const [cards, setCards] = useState([]);
  const [from, setFrom] = useState("");
  const [advice, setAdvice] = useState("");
  const [type, setType] = useState("advice");
  const [filter, setFilter] = useState("all");
  const prompts = { advice: "Your parenting advice…", memory: "A childhood memory to inspire…", prediction: "Your prediction for the baby…" };
  const icons = { advice: "💡", memory: "🌟", prediction: "🔮" };
  const typeLabels = { advice: "Advice", memory: "Memory", prediction: "Prediction" };
  const post = () => {
    if (!advice.trim()) return;
    setCards(c => [{ id: Date.now(), name: from.trim() || "Anonymous", text: advice.trim(), type, emoji: icons[type], reactions: {} }, ...c]);
    setFrom(""); setAdvice("");
  };
  const react = (id, emoji) => setCards(cs => cs.map(c => c.id === id ? { ...c, reactions: { ...c.reactions, [emoji]: (c.reactions[emoji] || 0) + 1 } } : c));
  const filtered = filter === "all" ? cards : cards.filter(c => c.type === filter);
  return (
    <Modal onClose={onClose} emoji="💌" title="Advice for the Parents" wide>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {Object.entries(prompts).map(([k]) => <button key={k} onClick={() => setType(k)} style={{ ...mkBtn(type === k ? accent : "rgba(255,255,255,0.07)"), flex: 1, padding: "8px 4px", fontSize: 12, border: type === k ? "none" : "1.5px solid rgba(255,255,255,0.1)" }}>{icons[k]} {typeLabels[k]}</button>)}
      </div>
      <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Your name" style={{ ...inp, marginBottom: 8 }} />
      <textarea value={advice} onChange={e => setAdvice(e.target.value)} placeholder={prompts[type]} style={{ ...inp, minHeight: 80, resize: "vertical", marginBottom: 10 }} />
      <button onClick={post} style={{ ...mkBtn(accent), marginBottom: 16 }}>Post Card</button>
      {cards.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {["all", "advice", "memory", "prediction"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ ...mkBtn(filter === f ? "rgba(255,255,255,0.12)" : "transparent"), padding: "5px 10px", fontSize: 11, border: `1px solid ${filter === f ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`, width: "auto", color: filter === f ? "#fff" : "rgba(255,255,255,0.4)" }}>
              {f === "all" ? `All (${cards.length})` : `${icons[f]} ${typeLabels[f]} (${cards.filter(c => c.type === f).length})`}
            </button>
          ))}
        </div>
      )}
      {filtered.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No cards yet — share your wisdom!</p>}
      {filtered.map(c => <WallPost key={c.id} post={{ ...c, name: `${c.emoji} ${c.name} · ${typeLabels[c.type]}` }} accent={accent} onReact={react} />)}
    </Modal>
  );
}

// Housewarming: Gift Registry
function GiftRegistry({ onClose, accent }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [category, setCategory] = useState("Kitchen");
  const cats = ["Kitchen", "Living Room", "Bedroom", "Garden", "Tech", "Decor", "Other"];
  const add = () => { if (newItem.trim()) { setItems(i => [...i, { item: newItem.trim(), category, claimed: false }]); setNewItem(""); } };
  const claim = (idx) => setItems(it => it.map((item, i) => i === idx ? { ...item, claimed: !item.claimed } : item));
  return (
    <Modal onClose={onClose} emoji="🎁" title="Gift Registry" wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Add what you'd love for the new home. Guests tap to claim!</p>
      <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inp, marginBottom: 8 }}>
        {cats.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="What do you need?" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      {cats.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        if (!catItems.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{cat}</div>
            {catItems.map((item, gi) => {
              const idx = items.indexOf(item);
              return (
                <div key={gi} onClick={() => claim(idx)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: item.claimed ? accent + "22" : "rgba(255,255,255,0.05)", borderRadius: 10, marginBottom: 6, cursor: "pointer", border: `1.5px solid ${item.claimed ? accent : "transparent"}`, textDecoration: item.claimed ? "line-through" : "none" }}>
                  <span style={{ color: item.claimed ? "rgba(255,255,255,0.4)" : "#fff", fontSize: 13 }}>{item.item}</span>
                  <span style={{ fontSize: 13, color: item.claimed ? "#34D399" : "rgba(255,255,255,0.3)", fontWeight: 700 }}>{item.claimed ? "✅ Claimed" : "Tap to claim"}</span>
                </div>
              );
            })}
          </div>
        );
      })}
      {items.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Add things you'd love for your new home!</p>}
    </Modal>
  );
}

// Kitty Party: Lucky Draw
function LuckyDraw({ onClose, accent }) {
  const [members, setMembers] = useState([]);
  const [newM, setNewM] = useState("");
  const [winner, setWinner] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [spinDisplay, setSpinDisplay] = useState(null);
  const [past, setPast] = useState([]);
  const add = () => { if (newM.trim() && !members.includes(newM.trim())) { setMembers(m => [...m, newM.trim()]); setNewM(""); } };
  const spinRef = useRef(null);
  const draw = () => {
    if (members.length < 2) return;
    setSpinning(true); setWinner(null);
    let count = 0, speed = 80;
    const total = 20 + Math.floor(Math.random() * 10);
    const tick = () => {
      setSpinDisplay(members[Math.floor(Math.random() * members.length)]);
      count++;
      speed = speed * 1.06;
      if (count < total) spinRef.current = setTimeout(tick, speed);
      else {
        const w = rand(members);
        setWinner(w);
        setPast(p => [...p, { name: w, date: new Date().toLocaleDateString("en-IN") }]);
        setSpinning(false);
        setSpinDisplay(null);
      }
    };
    spinRef.current = setTimeout(tick, speed);
  };
  useEffect(() => () => clearTimeout(spinRef.current), []);
  return (
    <Modal onClose={onClose} emoji="🎀" title="Lucky Draw">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={newM} onChange={e => setNewM(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Member name" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {members.map(m => <span key={m} style={{ background: accent + "33", color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{m} <span onClick={() => setMembers(ms => ms.filter(x => x !== m))} style={{ cursor: "pointer", opacity: 0.6 }}>✕</span></span>)}
      </div>
      {spinning && spinDisplay && (
        <div style={{ textAlign: "center", padding: "24px", marginBottom: 16, background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1.5px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Drawing…</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", minHeight: 38, animation: "card-flip 0.12s ease-out" }}>{spinDisplay}</div>
        </div>
      )}
      {winner && !spinning && (
        <div style={{ textAlign: "center", padding: "24px", background: `linear-gradient(135deg, ${accent}28, ${accent}10)`, borderRadius: 18, marginBottom: 16, border: `2px solid ${accent}60` }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎀</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>This Month's Winner</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{winner}</div>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🎀 Lucky Draw Result!\n\nThis month's winner is *${winner}*! 🎉`)}`, "_blank")} style={{ ...mkBtn("#25D366"), marginTop: 14, padding: "10px 20px", width: "auto" }}>📤 Announce</button>
        </div>
      )}
      <button onClick={draw} disabled={members.length < 2 || spinning} style={{ ...mkBtn(accent), opacity: members.length < 2 ? 0.5 : 1, marginBottom: 16 }}>{spinning ? "Drawing…" : winner ? "Draw Again 🎀" : "Draw Winner 🎀"}</button>
      {past.length > 0 && <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Past Winners</div>
        {past.map((p, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 10, marginBottom: 6 }}>
          <span style={{ color: "#fff", fontSize: 13 }}>{p.name}</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{p.date}</span>
        </div>)}
      </div>}
    </Modal>
  );
}

// Kitty Party: Kitty Fund Tracker
function KittyFund({ onClose, accent }) {
  const [members, setMembers] = useState([]);
  const [newM, setNewM] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState({});
  const add = () => { if (newM.trim()) { setMembers(m => [...m, newM.trim()]); setNewM(""); } };
  const toggle = (m) => setPaid(p => ({ ...p, [m]: !p[m] }));
  const collected = members.filter(m => paid[m]).length * (Number(amount) || 0);
  const total = members.length * (Number(amount) || 0);
  return (
    <Modal onClose={onClose} emoji="💰" title="Kitty Fund Tracker">
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={newM} onChange={e => setNewM(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Member name" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>+</button>
      </div>
      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount per member (₹)" type="number" style={{ ...inp, marginBottom: 16 }} />
      {amount && members.length > 0 && <div style={{ background: accent + "22", borderRadius: 14, padding: "16px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>₹{collected}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>collected of ₹{total} total</div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginTop: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${total ? (collected / total) * 100 : 0}%`, background: accent, transition: "width 0.3s" }} />
        </div>
      </div>}
      {members.map(m => (
        <div key={m} onClick={() => toggle(m)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: paid[m] ? accent + "22" : "rgba(255,255,255,0.05)", borderRadius: 10, marginBottom: 8, cursor: "pointer", border: `1.5px solid ${paid[m] ? accent : "transparent"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>{paid[m] ? "✅" : "⬜"}</span>
            <span style={{ color: "#fff", fontSize: 14 }}>{m}</span>
          </div>
          {amount && <span style={{ color: paid[m] ? "#34D399" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 13 }}>{paid[m] ? `Paid ₹${amount}` : `₹${amount} pending`}</span>}
        </div>
      ))}
    </Modal>
  );
}

// Naming Ceremony: Name Suggestions Wall
function NameSuggestions({ onClose, accent }) {
  const [suggestions, setSuggestions] = useState([]);
  const [from, setFrom] = useState("");
  const [name, setName] = useState("");
  const [meaning, setMeaning] = useState("");
  const post = () => {
    if (!name.trim()) return;
    setSuggestions(s => [{ from: from.trim() || "Anonymous", name: name.trim(), meaning: meaning.trim(), emoji: rand(["🌸", "✨", "🌺", "💫", "🌟", "🙏", "🌼", "🎋"]) }, ...s]);
    setFrom(""); setName(""); setMeaning("");
  };
  return (
    <Modal onClose={onClose} emoji="🌸" title="Name Suggestions" wide>
      <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Suggested by (your name)" style={{ ...inp, marginBottom: 8 }} />
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name suggestion" style={{ ...inp, marginBottom: 8 }} />
      <input value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="Meaning / significance (optional)" style={{ ...inp, marginBottom: 10 }} />
      <button onClick={post} style={{ ...mkBtn(accent), marginBottom: 20 }}>Suggest Name 🌸</button>
      {suggestions.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Be the first to suggest a name!</p>}
      {suggestions.map((s, i) => (
        <div key={i} style={{ ...crd, borderLeft: `3px solid ${accent}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{s.name}</div>
              {s.meaning && <div style={{ fontSize: 13, color: accent, marginTop: 2 }}>{s.meaning}</div>}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>by {s.from}</div>
            </div>
          </div>
        </div>
      ))}
    </Modal>
  );
}

// Naming Ceremony / Anniversary: Blessings Wall
function BlessingsWall({ onClose, accent, placeholder }) {
  const [blessings, setBlessings] = useState([]);
  const [from, setFrom] = useState("");
  const [blessing, setBlessing] = useState("");
  const post = () => {
    if (!blessing.trim()) return;
    setBlessings(b => [{ id: Date.now(), name: from.trim() || "Anonymous", text: blessing.trim(), emoji: rand(["🙏", "🌸", "✨", "💫", "🌺", "🙌", "❤️", "🌼"]), reactions: {} }, ...b]);
    setFrom(""); setBlessing("");
  };
  const react = (id, emoji) => setBlessings(bs => bs.map(b => b.id === id ? { ...b, reactions: { ...b.reactions, [emoji]: (b.reactions[emoji] || 0) + 1 } } : b));
  return (
    <Modal onClose={onClose} emoji="🙏" title="Blessings Wall" wide>
      <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Your name" style={{ ...inp, marginBottom: 8 }} />
      <textarea value={blessing} onChange={e => setBlessing(e.target.value)} placeholder={placeholder || "Share your blessings…"} style={{ ...inp, minHeight: 80, resize: "vertical", marginBottom: 10 }} />
      <button onClick={post} style={{ ...mkBtn(accent), marginBottom: 20 }}>Share Blessing 🙏</button>
      {blessings.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Be the first to share a blessing!</p>}
      {blessings.map(b => <WallPost key={b.id} post={b} accent={accent} onReact={react} />)}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// NEW EXCLUSIVE TOOLS
// ════════════════════════════════════════════════════════════════════════════

// ── Most Likely To ────────────────────────────────────────────────────────────
const MLT_PROMPTS = shuffle([
  "Most likely to arrive 2 hours late 🕐","Most likely to cry at a movie 🎬","Most likely to become famous 🌟",
  "Most likely to forget everyone's birthday 😅","Most likely to travel the world solo ✈️","Most likely to start a business 💼",
  "Most likely to stay up until 4AM 🌙","Most likely to eat the last piece of cake 🎂","Most likely to get lost in their own city 🗺️",
  "Most likely to become a millionaire 💰","Most likely to adopt 5 pets 🐾","Most likely to go viral on Instagram 📸",
  "Most likely to be the loudest at the party 🎉","Most likely to fall asleep first 😴","Most likely to start a diet on Monday 🥗",
  "Most likely to get roasted on the group chat 😂","Most likely to quit their job and travel 🏝️","Most likely to turn up uninvited 🚪",
  "Most likely to propose on the first date 💍","Most likely to cry at the wedding 👰","Most likely to forget where they parked 🚗",
  "Most likely to become a chef 🍳","Most likely to move abroad 🌍","Most likely to still be using the same phone in 5 years 📱",
]);

function MostLikelyTo({ onClose, accent }) {
  const [players, setPlayers]   = useState([]);
  const [input, setInput]       = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [votes, setVotes]       = useState({});
  const [phase, setPhase]       = useState("setup");
  const [history, setHistory]   = useState([]);

  const prompt = MLT_PROMPTS[promptIdx % MLT_PROMPTS.length];
  const addPlayer = () => { const n = input.trim(); if (n && !players.includes(n)) { setPlayers(p => [...p, n]); setInput(""); } };
  const vote = (name) => setVotes(v => ({ ...v, [prompt]: name }));
  const reveal = () => { setHistory(h => [...h, { prompt, winner: votes[prompt] }]); setPhase("result"); };
  const next   = () => { setPromptIdx(i => i + 1); setPhase("voting"); };

  return (
    <Modal onClose={onClose} emoji="🏆" title="Most Likely To" wide>
      {phase === "setup" && (<>
        <div style={{ ...crd, textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Add everyone playing, then vote on each prompt together.</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()} placeholder="Add player name…" style={{ ...inp, flex: 1 }} />
          <button onClick={addPlayer} style={{ ...mkBtn(accent), width: "auto", padding: "10px 18px" }}>+</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {players.map(p => (
            <span key={p} style={{ background: accent + "22", border: `1px solid ${accent}44`, color: "#fff", padding: "5px 14px", borderRadius: 100, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              {p}
              <button onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", padding: 0, fontSize: 15, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
        {players.length >= 2
          ? <button onClick={() => setPhase("voting")} style={mkBtn(accent)}>Start Voting →</button>
          : <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>Add at least 2 players to begin</div>
        }
      </>)}

      {phase === "voting" && (<>
        <div style={{ ...crd, textAlign: "center", marginBottom: 20, padding: "22px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Who is most likely to…</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>{prompt}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {players.map(p => { const voted = votes[prompt] === p; return (
            <button key={p} onClick={() => vote(p)} style={{ padding: "13px 18px", borderRadius: 12, border: `2px solid ${voted ? accent : "rgba(255,255,255,0.1)"}`, background: voted ? accent + "22" : "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, fontWeight: voted ? 800 : 500, cursor: "pointer", textAlign: "left", fontFamily: font, display: "flex", alignItems: "center", gap: 10, transition: "all 0.18s" }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: voted ? accent : "rgba(255,255,255,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{voted ? "✓" : p.charAt(0).toUpperCase()}</span>
              {p}
            </button>
          );})}
        </div>
        {votes[prompt] && <button onClick={reveal} style={mkBtn(accent)}>Reveal 🎉</button>}
      </>)}

      {phase === "result" && (() => { const last = history[history.length - 1]; return (<>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Most likely to…</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 18 }}>{last.prompt}</div>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: accent }}>{last.winner}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Everyone agrees!</div>
        </div>
        {history.length > 1 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Previous rounds</div>
            {history.slice(0,-1).map((h, i) => (
              <div key={i} style={{ ...crd, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", flex: 1 }}>{h.prompt.split(" ").slice(0,7).join(" ")}…</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: accent, marginLeft: 10 }}>{h.winner}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={next} style={mkBtn(accent)}>Next Prompt →</button>
        <button onClick={() => setPhase("setup")} style={{ ...mkBtn("rgba(255,255,255,0.06)"), marginTop: 10 }}>Change Players</button>
      </>);})()}
    </Modal>
  );
}

// ── Two Truths One Lie ────────────────────────────────────────────────────────
function TwoTruthsOneLie({ onClose, accent }) {
  const [players, setPlayers] = useState([]);
  const [input, setInput]     = useState("");
  const [hotseat, setHotseat] = useState(null);
  const [form, setForm]       = useState({ t1: "", t2: "", lie: "" });
  const [shuffled, setShuffled] = useState([]);
  const [guessResult, setGuessResult] = useState(null);
  const [scores, setScores]   = useState({});
  const [phase, setPhase]     = useState("setup");

  const addPlayer = () => { const n = input.trim(); if (n && !players.includes(n)) { setPlayers(p => [...p, n]); setInput(""); } };
  const pickHotseat = () => { setHotseat(rand(players)); setForm({ t1:"", t2:"", lie:"" }); setPhase("write"); };
  const submitStatements = () => {
    const items = shuffle([{ text: form.t1, isLie: false }, { text: form.t2, isLie: false }, { text: form.lie, isLie: true }]);
    setShuffled(items); setGuessResult(null); setPhase("guess");
  };
  const guess = (item) => {
    if (item.isLie) { setGuessResult("correct"); setScores(s => { const u = {...s}; players.filter(p=>p!==hotseat).forEach(p=>{u[p]=(u[p]||0)+1;}); return u; }); }
    else { setGuessResult("wrong"); setScores(s => ({ ...s, [hotseat]: (s[hotseat]||0)+1 })); }
    setPhase("reveal");
  };

  return (
    <Modal onClose={onClose} emoji="🤥" title="Two Truths One Lie" wide>
      {phase === "setup" && (<>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()} placeholder="Player name…" style={{ ...inp, flex: 1 }} />
          <button onClick={addPlayer} style={{ ...mkBtn(accent), width: "auto", padding: "10px 18px" }}>+</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {players.map(p => (
            <span key={p} style={{ background: accent + "22", border: `1px solid ${accent}44`, color: "#fff", padding: "5px 14px", borderRadius: 100, fontSize: 13, display:"flex", alignItems:"center", gap:6 }}>
              {p} <button onClick={() => setPlayers(pl=>pl.filter(x=>x!==p))} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",padding:0,fontSize:15 }}>×</button>
            </span>
          ))}
        </div>
        {players.length >= 2 ? <button onClick={pickHotseat} style={mkBtn(accent)}>🎲 Pick Hot Seat</button>
          : <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>Add at least 2 players</div>}
        {Object.keys(scores).length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Scoreboard</div>
            {Object.entries(scores).sort(([,a],[,b])=>b-a).map(([p,s]) => (
              <div key={p} style={{ display:"flex", justifyContent:"space-between", padding:"9px 14px", background:"rgba(255,255,255,0.04)", borderRadius:10, marginBottom:6 }}>
                <span style={{ color:"#fff",fontSize:13 }}>{p}</span><span style={{ color:accent,fontWeight:700 }}>{s} pts</span>
              </div>
            ))}
          </div>
        )}
      </>)}
      {phase === "write" && (<>
        <div style={{ ...crd, textAlign:"center", marginBottom:20, padding:"20px 16px" }}>
          <div style={{ fontSize:32, marginBottom:6 }}>🔥</div>
          <div style={{ fontSize:20, fontWeight:800, color:accent }}>{hotseat}</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:4 }}>is in the Hot Seat — write privately!</div>
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:14 }}>Write 2 true things and 1 convincing lie. Others will try to find the lie.</div>
        {[["t1","Truth 1","Something true about you…"],["t2","Truth 2","Another truth…"],["lie","The Lie 🤥","Make it believable…"]].map(([k,lbl,ph]) => (
          <div key={k} style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:k==="lie"?"#EF4444":accent, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{lbl}</div>
            <input value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={{ ...inp, borderColor:k==="lie"?"#EF444440":undefined }} />
          </div>
        ))}
        {form.t1.trim()&&form.t2.trim()&&form.lie.trim() && <button onClick={submitStatements} style={mkBtn(accent)}>Done — Show the Group 🎭</button>}
      </>)}
      {phase === "guess" && (<>
        <div style={{ ...crd, textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>Everyone — which one is the lie?</div>
          <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>{hotseat}'s statements:</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
          {shuffled.map((item,i) => (
            <button key={i} onClick={() => guess(item)} style={{ padding:"16px 18px", borderRadius:12, border:"1.5px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:"#fff", fontSize:14, cursor:"pointer", textAlign:"left", fontFamily:font, lineHeight:1.4 }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=accent;e.currentTarget.style.background=accent+"15";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.background="rgba(255,255,255,0.04)";}}>
              {String.fromCharCode(65+i)}. {item.text}
            </button>
          ))}
        </div>
      </>)}
      {phase === "reveal" && (<>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:48, marginBottom:10 }}>{guessResult==="correct"?"🎉":"😈"}</div>
          <div style={{ fontSize:20, fontWeight:800, color:guessResult==="correct"?"#4ADE80":"#F87171" }}>
            {guessResult==="correct"?"The group got it!":hotseat+" fooled everyone!"}
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginTop:10 }}>
            The lie was: <strong style={{color:"#fff"}}>{shuffled.find(s=>s.isLie)?.text}</strong>
          </div>
        </div>
        <button onClick={pickHotseat} style={mkBtn(accent)}>Next Hot Seat 🎲</button>
        <button onClick={() => setPhase("setup")} style={{ ...mkBtn("rgba(255,255,255,0.06)"), marginTop:10 }}>Scoreboard</button>
      </>)}
    </Modal>
  );
}

// ── Rapid Fire ────────────────────────────────────────────────────────────────
const RF_DECKS = {
  "🍕 Food & Vibes": ["Pizza ya Biryani?","Tea ya Coffee?","Dosa ya Idli?","Butter Chicken ya Paneer?","Maggi ya Ramen?","Rajma Chawal ya Chole Bhature?","Kulfi ya Ice Cream?","Pani Puri ya Bhel Puri?","Gol Gappe ya Samosa?","Litti Chokha ya Dal Baati?"],
  "🧠 Personality":  ["Introvert ya Extrovert?","Planner ya Spontaneous?","Morning ya Night person?","Leader ya Follower?","Heart ya Head?","Spender ya Saver?","Risk-taker ya Safe player?","Talker ya Listener?","Perfectionist ya Chill?","Clean room ya Organized chaos?"],
  "✈️ Travel & Life": ["Mountains ya Beach?","Solo trip ya Group trip?","Hotel ya Homestay?","Road trip ya Flight?","City ya Village?","Summer ya Winter?","Budget trip ya Luxury?","Local food ya Safe food?","Early bird ya Last minute?","Planned itinerary ya Wing it?"],
  "🎬 Entertainment": ["Movies ya Web series?","Bollywood ya Hollywood?","Comedy ya Thriller?","Netflix ya YouTube?","Music ya Podcasts?","Reading ya Watching?","Classic ya New release?","Concert ya House party?","OTT ya Theatre?","Gaming ya Sports?"],
};

function RapidFire({ onClose, accent }) {
  const [deck, setDeck]       = useState(null);
  const [idx, setIdx]         = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [active, setActive]   = useState(false);
  const [answers, setAnswers] = useState([]);
  const [done, setDone]       = useState(false);
  const timerRef              = useRef(null);

  const questions = deck ? RF_DECKS[deck] : [];

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setActive(false); setDone(true); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active]);

  const start = (d) => { setDeck(d); setIdx(0); setTimeLeft(30); setAnswers([]); setDone(false); setActive(true); };
  const answer = (opt) => {
    clearInterval(timerRef.current);
    const updated = [...answers, { q: questions[idx], a: opt }];
    setAnswers(updated);
    if (idx + 1 >= questions.length) { setDone(true); setActive(false); }
    else { setIdx(i => i + 1); setTimeLeft(30); setActive(true); }
  };

  const timerColor = timeLeft > 15 ? "#4ADE80" : timeLeft > 7 ? "#FBBF24" : "#F87171";

  if (!deck) return (
    <Modal onClose={onClose} emoji="⚡" title="Rapid Fire" wide>
      <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:20, textAlign:"center" }}>Pick a category — 30 seconds per question!</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {Object.keys(RF_DECKS).map(d => (
          <button key={d} onClick={() => start(d)} style={{ padding:"18px 12px", borderRadius:14, border:`1.5px solid ${accent}33`, background:accent+"11", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:font, textAlign:"center", lineHeight:1.4 }}>{d}</button>
        ))}
      </div>
    </Modal>
  );

  if (done) return (
    <Modal onClose={onClose} emoji="⚡" title="Rapid Fire" wide>
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🔥</div>
        <div style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:4 }}>Round over!</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>{answers.filter(a=>a.a!=="–").length} / {answers.length} answered</div>
      </div>
      <div style={{ maxHeight:240, overflowY:"auto", marginBottom:14 }}>
        {answers.map((a,i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 14px", background:"rgba(255,255,255,0.04)", borderRadius:10, marginBottom:6 }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{a.q}</span>
            <span style={{ fontSize:13, fontWeight:700, color:a.a==="–"?"rgba(255,255,255,0.25)":accent, marginLeft:10 }}>{a.a}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setDeck(null)} style={mkBtn(accent)}>Play Again ⚡</button>
    </Modal>
  );

  const parts = questions[idx].replace("?","").split(" ya ");
  return (
    <Modal onClose={onClose} emoji="⚡" title="Rapid Fire" wide>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>Question {idx+1} / {questions.length}</div>
        <div style={{ fontSize:30, fontWeight:900, color:timerColor, fontVariantNumeric:"tabular-nums", minWidth:40, textAlign:"center", transition:"color 0.3s" }}>{timeLeft}</div>
      </div>
      <div style={{ ...crd, textAlign:"center", marginBottom:22, padding:"22px 16px" }}>
        <div style={{ fontSize:19, fontWeight:700, color:"#fff", lineHeight:1.3 }}>{questions[idx]}</div>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <button onClick={() => answer(parts[0])} style={{ ...mkBtn(accent), flex:1, fontSize:15 }}>👈 {parts[0]}</button>
        <button onClick={() => answer(parts[1]||"B")} style={{ ...mkBtn("#7C3AED"), flex:1, fontSize:15 }}>{parts[1]||"B"} 👉</button>
      </div>
      <button onClick={() => answer("–")} style={{ ...mkBtn("rgba(255,255,255,0.06)"), fontSize:12 }}>Skip</button>
    </Modal>
  );
}

// ── Mood Meter ────────────────────────────────────────────────────────────────
const MOOD_LABELS = ["😴 Dead","😐 Meh","🙂 Good","😄 Lit","🔥 On Fire"];

function MoodMeter({ onClose, accent }) {
  const [myMood, setMyMood]   = useState(null);
  const [name, setName]       = useState("");
  const [allMoods, setAllMoods] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => { if (myMood===null||!name.trim()) return; setAllMoods(m=>[...m,{name:name.trim(),mood:myMood}]); setSubmitted(true); };
  const avg    = allMoods.length ? (allMoods.reduce((s,m)=>s+m.mood,0)/allMoods.length) : 0;
  const pct    = (avg/4)*100;

  return (
    <Modal onClose={onClose} emoji="🌡️" title="Mood Meter" wide>
      {allMoods.length > 0 && (
        <div style={{ textAlign:"center", marginBottom:22, padding:"16px", background:"rgba(255,255,255,0.04)", borderRadius:14 }}>
          <div style={{ fontSize:40, marginBottom:6 }}>{MOOD_LABELS[Math.round(avg)].split(" ")[0]}</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:10 }}>Party Vibe — {allMoods.length} votes</div>
          <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:100, height:10, overflow:"hidden", marginBottom:8 }}>
            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${accent},#fff)`, borderRadius:100, transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
          <div style={{ fontSize:22, fontWeight:900, color:accent }}>{avg.toFixed(1)} / 4.0</div>
        </div>
      )}

      {!submitted ? (<>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name…" style={{ ...inp, marginBottom:14 }} />
        <div style={{ display:"flex", gap:8, marginBottom:22 }}>
          {MOOD_LABELS.map((e,i) => (
            <button key={i} onClick={()=>setMyMood(i)} style={{ flex:1, padding:"14px 4px", borderRadius:12, border:`2px solid ${myMood===i?accent:"rgba(255,255,255,0.1)"}`, background:myMood===i?accent+"22":"rgba(255,255,255,0.04)", cursor:"pointer", transition:"all 0.18s", transform:myMood===i?"scale(1.1)":"scale(1)" }}>
              <div style={{ fontSize:24 }}>{e.split(" ")[0]}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", marginTop:4 }}>{e.split(" ")[1]}</div>
            </button>
          ))}
        </div>
        {myMood!==null&&name.trim() && <button onClick={submit} style={mkBtn(accent)}>Submit Vibe</button>}
      </>) : (<>
        <div style={{ textAlign:"center", padding:"16px 0 8px" }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#4ADE80", marginBottom:16 }}>✓ Vibe submitted!</div>
          {allMoods.map((m,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", background:"rgba(255,255,255,0.04)", borderRadius:10, marginBottom:6 }}>
              <span style={{ fontSize:13, color:"#fff" }}>{m.name}</span>
              <span style={{ fontSize:20 }}>{MOOD_LABELS[m.mood].split(" ")[0]}</span>
            </div>
          ))}
          <button onClick={()=>{setSubmitted(false);setMyMood(null);setName("");}} style={{ ...mkBtn(accent), marginTop:14 }}>Add Another</button>
        </div>
      </>)}
    </Modal>
  );
}

// ── Secret Messages ───────────────────────────────────────────────────────────
function SecretMessage({ onClose, accent }) {
  const [msg, setMsg]           = useState("");
  const [name, setName]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [mode, setMode]         = useState("send");
  const [revealed, setRevealed] = useState([]);

  const send = () => {
    if (!msg.trim()) return;
    setMessages(m => [...m,{from:name.trim()||"Anonymous 🎭",text:msg.trim()}]);
    setMsg(""); setName(""); setSubmitted(true); setTimeout(()=>setSubmitted(false),2500);
  };

  return (
    <Modal onClose={onClose} emoji="💌" title="Secret Messages" wide>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["send","reveal"].map(v => (
          <button key={v} onClick={()=>setMode(v)} style={{ ...mkBtn(mode===v?accent:"rgba(255,255,255,0.08)"), flex:1, padding:"10px", fontSize:13 }}>
            {v==="send" ? "Write a Message" : `Open Envelopes${messages.length>0?` (${messages.length})`:""}` }
          </button>
        ))}
      </div>

      {mode==="send" && (<>
        <div style={{ ...crd, fontSize:12, color:"rgba(255,255,255,0.5)", textAlign:"center", marginBottom:14 }}>Write a secret message for the birthday star. They'll open it later 🎭</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (leave blank for Anonymous 🎭)" style={{ ...inp, marginBottom:10 }} />
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Write your secret message…" style={{ ...inp, minHeight:88, resize:"vertical", marginBottom:14 }} />
        {submitted
          ? <div style={{ textAlign:"center", padding:"12px", background:accent+"22", borderRadius:12, color:"#fff", fontWeight:700 }}>✓ Message sealed and hidden! 💌</div>
          : <button onClick={send} disabled={!msg.trim()} style={{ ...mkBtn(accent), opacity:msg.trim()?1:0.4 }}>Seal Message 💌</button>
        }
      </>)}

      {mode==="reveal" && (<>
        {messages.length===0
          ? <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(255,255,255,0.3)", fontSize:13 }}>No messages yet — ask friends to write some!</div>
          : <>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:14, textAlign:"center" }}>Tap each sealed envelope to reveal</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {messages.map((m,i) => { const isOpen=revealed.includes(i); return (
                <div key={i} onClick={()=>!isOpen&&setRevealed(r=>[...r,i])} style={{ padding:"16px 18px", borderRadius:14, border:`1.5px solid ${isOpen?accent+"44":"rgba(255,255,255,0.1)"}`, background:isOpen?accent+"09":"rgba(255,255,255,0.04)", cursor:isOpen?"default":"pointer", transition:"all 0.3s" }}>
                  {!isOpen
                    ? <div style={{ textAlign:"center", color:"rgba(255,255,255,0.35)", fontSize:26 }}>💌 Tap to open</div>
                    : <>
                      <div style={{ fontSize:10, fontWeight:700, color:accent, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>from {m.from}</div>
                      <div style={{ fontSize:14, color:"#fff", lineHeight:1.6 }}>{m.text}</div>
                    </>
                  }
                </div>
              );})}
            </div>
          </>
        }
      </>)}
    </Modal>
  );
}

// ── Gift Tracker ──────────────────────────────────────────────────────────────
function GiftTracker({ onClose, accent }) {
  const [gifts, setGifts]   = useState([]);
  const [form, setForm]     = useState({ from:"", gift:"", value:"" });
  const [view, setView]     = useState("add");

  const add = () => {
    if (!form.from.trim()||!form.gift.trim()) return;
    setGifts(g=>[...g,{...form,id:Date.now(),thanked:false}]);
    setForm({from:"",gift:"",value:""});
  };
  const toggleThanked = (id) => setGifts(g=>g.map(x=>x.id===id?{...x,thanked:!x.thanked}:x));
  const remove = (id) => setGifts(g=>g.filter(x=>x.id!==id));

  const total     = gifts.reduce((s,g)=>s+(Number(g.value)||0),0);
  const unthanked = gifts.filter(g=>!g.thanked).length;

  return (
    <Modal onClose={onClose} emoji="🎁" title="Gift Tracker" wide>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["add","list"].map(v => <button key={v} onClick={()=>setView(v)} style={{ ...mkBtn(view===v?accent:"rgba(255,255,255,0.08)"), flex:1, padding:"10px", fontSize:13 }}>
          {v==="add"?"Log Gift":"All Gifts"+(gifts.length?` (${gifts.length})`:"")}</button>)}
      </div>

      {view==="add" && (<>
        {[["from","Gifted by","e.g. Priya Aunty"],["gift","What was the gift?","e.g. Amazon voucher"],["value","Value ₹ (optional)","e.g. 500"]].map(([k,lbl,ph]) => (
          <div key={k} style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:accent, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{lbl}</div>
            <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={inp} />
          </div>
        ))}
        <button onClick={add} disabled={!form.from.trim()||!form.gift.trim()} style={{ ...mkBtn(accent), marginTop:8, opacity:form.from.trim()&&form.gift.trim()?1:0.4 }}>+ Add Gift</button>
      </>)}

      {view==="list" && (<>
        {gifts.length===0
          ? <div style={{ textAlign:"center", padding:"30px 0", color:"rgba(255,255,255,0.3)",fontSize:13 }}>No gifts logged yet</div>
          : (<>
            <div style={{ display:"flex", gap:10, marginBottom:16 }}>
              <div style={{ flex:1, background:"rgba(255,255,255,0.05)", borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:accent }}>₹{total.toLocaleString("en-IN")}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>Estimated total</div>
              </div>
              <div style={{ flex:1, background:"rgba(255,255,255,0.05)", borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:unthanked?"#F87171":"#4ADE80" }}>{unthanked}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>Thank-yous left</div>
              </div>
            </div>
            {gifts.map(g => (
              <div key={g.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"rgba(255,255,255,0.04)", borderRadius:12, marginBottom:8 }}>
                <button onClick={()=>toggleThanked(g.id)} style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${g.thanked?"#4ADE80":"rgba(255,255,255,0.2)"}`, background:g.thanked?"#4ADE8022":"transparent", color:g.thanked?"#4ADE80":"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {g.thanked?"✓":"○"}
                </button>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:g.thanked?"rgba(255,255,255,0.4)":"#fff", textDecoration:g.thanked?"line-through":"none" }}>{g.gift}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>from {g.from}{g.value?` · ₹${g.value}`:""}</div>
                </div>
                <button onClick={()=>remove(g.id)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.25)", cursor:"pointer", fontSize:16 }}>×</button>
              </div>
            ))}
          </>)
        }
      </>)}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MANAGE TOOL MODALS (shared across all occasions)
// ════════════════════════════════════════════════════════════════════════════

function OccGuestListModal({ onClose, occasion, accent }) {
  const SK = `tendr-occ-${occasion}-guestlist`;
  const [guests, setGuests] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } });
  const [form, setForm] = useState({ name:'', phone:'', plusOne:false, meal:'veg', rsvp:'pending' });
  const [showAdd, setShowAdd] = useState(false);
  const save = (g) => { setGuests(g); try { localStorage.setItem(SK, JSON.stringify(g)); } catch {} };
  const add = () => {
    if (!form.name.trim()) return;
    save([...guests, { id: Date.now(), ...form, name: form.name.trim() }]);
    setForm({ name:'', phone:'', plusOne:false, meal:'veg', rsvp:'pending' }); setShowAdd(false);
  };
  const setRsvp = (id, rsvp) => save(guests.map(g => g.id === id ? { ...g, rsvp } : g));
  const counts = { yes: guests.filter(g=>g.rsvp==='yes').length, maybe: guests.filter(g=>g.rsvp==='maybe').length, no: guests.filter(g=>g.rsvp==='no').length, pending: guests.filter(g=>g.rsvp==='pending').length };
  const totalAttending = guests.filter(g=>g.rsvp==='yes').reduce((s,g)=>s+(g.plusOne?2:1), 0);
  const plusOneCount = guests.filter(g=>g.rsvp==='yes'&&g.plusOne).length;
  const pendingWithPhone = guests.filter(g=>g.rsvp==='pending'&&g.phone);
  const sendReminder = () => {
    if (!pendingWithPhone.length) return;
    const msg = encodeURIComponent("Hey! Just checking — are you coming? Let us know! 🎉");
    const ph = pendingWithPhone[0].phone.replace(/\D/g,'');
    window.open(`https://wa.me/${ph.startsWith('91')&&ph.length===12?ph:'91'+ph}?text=${msg}`, '_blank');
  };
  return (
    <Modal onClose={onClose} title="Guest List" emoji="👥">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
        {[['Coming',counts.yes,'#22c55e'],['Maybe',counts.maybe,'#f59e0b'],['Not Coming',counts.no,'#ef4444'],['Pending',counts.pending,'#6b7280']].map(([lbl,count,color]) => (
          <div key={lbl} style={{ textAlign:'center', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'8px 4px', border:`1px solid ${color}30` }}>
            <div style={{ fontSize:20, fontWeight:800, color }}>{count}</div>
            <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{lbl}</div>
          </div>
        ))}
      </div>
      {totalAttending > 0 && <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:10, padding:'8px 14px', marginBottom:12, fontSize:13, color:'#22c55e', fontWeight:700 }}>🎉 {totalAttending} attending{plusOneCount>0?` (incl. ${plusOneCount} +1${plusOneCount!==1?'s':''})`:''}
      </div>}
      {showAdd ? (
        <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:14, marginBottom:12, border:'1px solid rgba(255,255,255,0.1)' }}>
          <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Name *" style={{ ...inp, marginBottom:8 }} />
          <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="Phone (for WhatsApp)" type="tel" style={{ ...inp, marginBottom:10 }} />
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
            {[['🟢 Veg','veg'],['🔴 Non-Veg','nonveg'],['🟡 Jain','jain']].map(([lbl,val]) => (
              <button key={val} onClick={()=>setForm(p=>({...p,meal:val}))} style={{ fontSize:11, padding:'5px 10px', borderRadius:100, border:`1.5px solid ${form.meal===val?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.12)'}`, background:form.meal===val?'rgba(255,255,255,0.12)':'transparent', color:form.meal===val?'#fff':'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>{lbl}</button>
            ))}
            <button onClick={()=>setForm(p=>({...p,plusOne:!p.plusOne}))} style={{ fontSize:11, padding:'5px 10px', borderRadius:100, border:`1.5px solid ${form.plusOne?accent:'rgba(255,255,255,0.12)'}`, background:form.plusOne?accent+'22':'transparent', color:form.plusOne?accent:'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>+1 Guest</button>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={add} style={{ flex:1, background:accent, border:'none', borderRadius:9, padding:'10px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>Add Guest</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'10px 16px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:font, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowAdd(true)} style={{ width:'100%', background:`${accent}20`, border:`1.5px dashed ${accent}55`, borderRadius:10, padding:'11px', color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, marginBottom:12 }}>+ Add Guest</button>
      )}
      {guests.length === 0 ? (
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:13, padding:'28px 0' }}>No guests yet. Add names above!</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {guests.map(g => {
            const rsvpColor = g.rsvp==='yes'?'#22c55e':g.rsvp==='maybe'?'#f59e0b':g.rsvp==='no'?'#ef4444':'#6b7280';
            const ph = g.phone?.replace(/\D/g,'');
            const waPhone = ph ? (ph.startsWith('91')&&ph.length===12?ph:'91'+ph) : null;
            return (
              <div key={g.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'10px 12px', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:`${rsvpColor}22`, border:`2px solid ${rsvpColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:rsvpColor, flexShrink:0 }}>{g.name[0]?.toUpperCase()}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ fontSize:14, color:'#fff', fontFamily:font, fontWeight:600 }}>{g.name}</span>
                    {g.plusOne && <span style={{ marginLeft:6, fontSize:10, fontWeight:700, color:accent, background:accent+'22', padding:'2px 6px', borderRadius:100 }}>+1</span>}
                    {waPhone && <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" style={{ display:'block', fontSize:10.5, color:'#25D366', fontWeight:700, textDecoration:'none', marginTop:2 }}>📱 {g.phone}</a>}
                  </div>
                  {[['✓','yes','#22c55e'],['?','maybe','#f59e0b'],['✗','no','#ef4444']].map(([lbl,val,color]) => (
                    <button key={val} onClick={()=>setRsvp(g.id,g.rsvp===val?'pending':val)} style={{ padding:'4px 9px', borderRadius:100, border:`1.5px solid ${g.rsvp===val?color:'rgba(255,255,255,0.1)'}`, background:g.rsvp===val?color+'22':'transparent', color:g.rsvp===val?color:'rgba(255,255,255,0.35)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:font }}>{lbl}</button>
                  ))}
                  <button onClick={()=>save(guests.filter(x=>x.id!==g.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 2px' }}>×</button>
                </div>
                {g.meal && g.meal!=='veg' && <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.35)', fontWeight:600, paddingLeft:40, marginTop:3 }}>{g.meal==='nonveg'?'🔴 Non-Veg':'🟡 Jain'}</div>}
              </div>
            );
          })}
        </div>
      )}
      {pendingWithPhone.length > 0 && (
        <button onClick={sendReminder} style={{ marginTop:14, width:'100%', padding:'11px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>
          📩 Remind {pendingWithPhone.length} Pending Guest{pendingWithPhone.length!==1?'s':''}
        </button>
      )}
    </Modal>
  );
}

function OccMenuPlannerModal({ onClose, occasion, accent }) {
  const SK = `tendr-occ-${occasion}-menu`;
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } });
  const [name, setName] = useState('');
  const [cat, setCat] = useState('food');
  const [diet, setDiet] = useState('veg');
  const [person, setPerson] = useState('');
  const save = (it) => { setItems(it); try { localStorage.setItem(SK, JSON.stringify(it)); } catch {} };
  const add = () => { if (!name.trim()) return; save([...items, { id: Date.now(), name: name.trim(), cat, diet, person: person.trim(), status: 'pending' }]); setName(''); setPerson(''); };
  const setStatus = (id, status) => save(items.map(it => it.id === id ? { ...it, status } : it));
  const cats = [{ id:'food', label:'🍲 Food', color:'#f97316' },{ id:'drinks', label:'🥂 Drinks', color:'#06b6d4' },{ id:'dessert', label:'🍰 Dessert', color:'#ec4899' },{ id:'other', label:'📦 Other', color:'#8b5cf6' }];
  const STATUS_LABELS = { pending:'Pending', ordered:'Ordered', confirmed:'Confirmed', done:'Done' };
  const STATUS_COLORS = { pending:'#6b7280', ordered:'#f59e0b', confirmed:'#3b82f6', done:'#22c55e' };
  const arranged = items.filter(it=>it.status!=='pending').length;
  const shareMenu = () => {
    const lines = cats.map(c => { const ci = items.filter(it=>it.cat===c.id); if (!ci.length) return ''; return `${c.label}:\n${ci.map(it=>`  • ${it.name}${it.person?' ('+it.person+')':''}${it.diet==='nonveg'?' 🔴':it.diet==='jain'?' 🟡':''}`).join('\n')}`; }).filter(Boolean).join('\n\n');
    window.open(`https://wa.me/?text=${encodeURIComponent('🍽️ Menu Plan\n\n'+lines)}`, '_blank');
  };
  return (
    <Modal onClose={onClose} title="Menu Planner" emoji="🍽️" wide>
      <div style={{ display:'flex', gap:10, marginBottom:12, alignItems:'center', flexWrap:'wrap' }}>
        {items.length>0 && <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{arranged}/{items.length} arranged</span>}
        {items.length>0 && <button onClick={shareMenu} style={{ marginLeft:'auto', padding:'6px 12px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:font }}>📤 Share Menu</button>}
      </div>
      <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'12px', marginBottom:16, border:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
          {cats.map(c => (<button key={c.id} onClick={()=>setCat(c.id)} style={{ fontSize:11, padding:'4px 10px', borderRadius:100, border:`1.5px solid ${cat===c.id?c.color:'rgba(255,255,255,0.1)'}`, background:cat===c.id?c.color+'22':'transparent', color:cat===c.id?c.color:'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>{c.label}</button>))}
          <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
            {[['🟢','veg'],['🔴','nonveg'],['🟡','jain']].map(([emoji,val]) => (<button key={val} onClick={()=>setDiet(val)} style={{ fontSize:14, padding:'2px 6px', borderRadius:100, border:`1.5px solid ${diet===val?'rgba(255,255,255,0.45)':'rgba(255,255,255,0.1)'}`, background:diet===val?'rgba(255,255,255,0.1)':'transparent', cursor:'pointer' }}>{emoji}</button>))}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Menu item…" style={{ flex:2, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 12px', color:'#fff', fontSize:13, fontFamily:font, outline:'none' }} />
          <input value={person} onChange={e=>setPerson(e.target.value)} placeholder="Who brings?" style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 10px', color:'#fff', fontSize:12, fontFamily:font, outline:'none' }} />
          <button onClick={add} style={{ background:accent, border:'none', borderRadius:9, padding:'9px 14px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font }}>+</button>
        </div>
      </div>
      {cats.map(c => { const catItems = items.filter(it=>it.cat===c.id); if (!catItems.length) return null; return (
        <div key={c.id} style={{ marginBottom:16 }}>
          <div style={{ fontSize:10.5, fontWeight:800, color:c.color, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:7 }}>{c.label} ({catItems.length})</div>
          {catItems.map(it => (
            <div key={it.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', background:'rgba(255,255,255,0.03)', borderRadius:10, marginBottom:5, border:'1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ flex:1, fontSize:13.5, color:'#fff', fontFamily:font }}>{it.name}</span>
              {it.diet==='nonveg' && <span style={{ fontSize:11 }}>🔴</span>}
              {it.diet==='jain' && <span style={{ fontSize:11 }}>🟡</span>}
              {it.person && <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)', background:'rgba(255,255,255,0.06)', padding:'2px 8px', borderRadius:100, whiteSpace:'nowrap' }}>{it.person}</span>}
              <select value={it.status} onChange={e=>setStatus(it.id,e.target.value)} style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${STATUS_COLORS[it.status]}55`, borderRadius:6, color:STATUS_COLORS[it.status], fontSize:10.5, padding:'3px 6px', fontFamily:font, outline:'none', colorScheme:'dark', cursor:'pointer' }}>
                {Object.entries(STATUS_LABELS).map(([val,lbl])=><option key={val} value={val}>{lbl}</option>)}
              </select>
              <button onClick={()=>save(items.filter(x=>x.id!==it.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 2px' }}>×</button>
            </div>
          ))}
        </div>
      ); })}
      {items.length===0 && <div style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:13, padding:'28px 0' }}>Pick a category and add menu items!</div>}
    </Modal>
  );
}

function OccDayTimelineModal({ onClose, occasion, accent }) {
  const SK = `tendr-occ-${occasion}-timeline`;
  const [entries, setEntries] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } });
  const [time, setTime] = useState('');
  const [event, setEvent] = useState('');
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const saveEntries = (e) => { setEntries(e); try { localStorage.setItem(SK, JSON.stringify(e)); } catch {} };
  const add = () => { if (!time||!event.trim()) return; saveEntries([...entries,{id:Date.now(),time,event:event.trim(),done:false}].sort((a,b)=>a.time.localeCompare(b.time))); setTime(''); setEvent(''); };
  const toggle = (id) => saveEntries(entries.map(e=>e.id===id?{...e,done:!e.done}:e));
  const nowStr = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  const currentIdx = entries.reduce((found,e,i)=>e.time<=nowStr?i:found, -1);
  const nextEntry = entries.find(e=>e.time>nowStr);
  let countdown = '';
  if (nextEntry) { const [nh,nm]=nextEntry.time.split(':').map(Number); const diff=nh*60+nm-now.getHours()*60-now.getMinutes(); if (diff>0) countdown=diff>=60?`${Math.floor(diff/60)}h ${diff%60}m`:`${diff}m`; }
  const shareTimeline = () => { const txt = entries.map(e=>`${e.time} — ${e.event}`).join('\n'); window.open(`https://wa.me/?text=${encodeURIComponent('📅 Day Plan:\n\n'+txt)}`, '_blank'); };
  return (
    <Modal onClose={onClose} title="Day Timeline" emoji="🗓️">
      {entries.length>0 && countdown && (
        <div style={{ background:`${accent}18`, border:`1px solid ${accent}40`, borderRadius:10, padding:'10px 14px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div><div style={{ fontSize:9.5, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Next Up</div><div style={{ fontSize:14, fontWeight:700, color:accent }}>{nextEntry.event}</div></div>
          <div style={{ textAlign:'right' }}><div style={{ fontSize:9.5, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' }}>In</div><div style={{ fontSize:20, fontWeight:900, color:accent }}>{countdown}</div></div>
        </div>
      )}
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 10px', color:'#fff', fontSize:13.5, fontFamily:font, outline:'none', width:100, colorScheme:'dark', flexShrink:0 }} />
        <input value={event} onChange={e=>setEvent(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="What happens?" style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 12px', color:'#fff', fontSize:13.5, fontFamily:font, outline:'none' }} />
        <button onClick={add} disabled={!time||!event.trim()} style={{ background:time&&event.trim()?accent:'rgba(255,255,255,0.06)', border:'none', borderRadius:9, padding:'9px 14px', color:'#fff', fontSize:18, fontWeight:700, cursor:'pointer', opacity:time&&event.trim()?1:0.4 }}>+</button>
      </div>
      {entries.length>0 && <button onClick={shareTimeline} style={{ width:'100%', marginBottom:14, padding:'9px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:font }}>Share Timeline on WhatsApp</button>}
      {entries.length===0 ? (
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:13, padding:'28px 0' }}>Add time slots to build the day's schedule!</div>
      ) : (
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left:44, top:0, bottom:0, width:2, background:'rgba(255,255,255,0.06)', zIndex:0 }} />
          {entries.map((e,i) => {
            const isNow = i===currentIdx && e.time<=nowStr;
            return (
              <div key={e.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'9px 0', position:'relative', zIndex:1 }}>
                <div style={{ minWidth:44, fontSize:11, fontWeight:800, color:isNow?accent:e.done?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.5)', textAlign:'right', paddingTop:3, flexShrink:0 }}>{e.time}</div>
                <button onClick={()=>toggle(e.id)} style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${e.done?'#22c55e':isNow?accent:'rgba(255,255,255,0.2)'}`, background:isNow?accent+'28':e.done?'#22c55e28':'#140e08', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', marginTop:2 }}>
                  {e.done && <span style={{ color:'#22c55e', fontSize:9, fontWeight:900 }}>✓</span>}
                </button>
                <div style={{ flex:1, paddingTop:1, display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:14, color:e.done?'rgba(255,255,255,0.3)':'#fff', textDecoration:e.done?'line-through':'none', fontFamily:font, lineHeight:1.4 }}>{e.event}</span>
                  {isNow && <span style={{ fontSize:9, fontWeight:800, color:accent, background:`${accent}28`, padding:'2px 7px', borderRadius:100, textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>NOW</span>}
                </div>
                <button onClick={()=>saveEntries(entries.filter(x=>x.id!==e.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.15)', cursor:'pointer', fontSize:18, lineHeight:1, paddingTop:2 }}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

function OccVenueNotesModal({ onClose, occasion }) {
  const SK = `tendr-occ-${occasion}-venue`;
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '{}'); } catch { return {}; } });
  const update = (key, val) => { const d = { ...data, [key]: val }; setData(d); try { localStorage.setItem(SK, JSON.stringify(d)); } catch {} };
  const fields = [
    { key:'address', label:'📍 Address', placeholder:'42, Sector 18, Noida', rows:2 },
    { key:'parking', label:'🅿️ Parking', placeholder:'Free parking in basement, Gate B', rows:2 },
    { key:'contact', label:'📞 Venue Contact', placeholder:'+91 98765 43210', rows:1 },
    { key:'entry', label:'🚪 Entry Instructions', placeholder:'Take lift to 5th floor, Suite 502', rows:2 },
    { key:'notes', label:'📝 Notes', placeholder:'Setup from 5 PM · No outside food', rows:3 },
  ];
  const filled = fields.filter(f=>data[f.key]).length;
  const openMaps = () => { if (data.address) window.open(`https://maps.google.com/?q=${encodeURIComponent(data.address)}`, '_blank'); };
  const shareWA = () => {
    const parts = [];
    if (data.address) parts.push(`📍 *Address:* ${data.address}`);
    if (data.parking) parts.push(`🅿️ *Parking:* ${data.parking}`);
    if (data.contact) parts.push(`📞 *Contact:* ${data.contact}`);
    if (data.entry)   parts.push(`🚪 *Entry:* ${data.entry}`);
    if (data.notes)   parts.push(`📝 *Note:* ${data.notes}`);
    if (!parts.length) return;
    window.open(`https://wa.me/?text=${encodeURIComponent('🎉 Venue Info\n\n'+parts.join('\n\n'))}`, '_blank');
  };
  return (
    <Modal onClose={onClose} title="Venue Notes" emoji="📍">
      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
        {fields.map(f => (
          <div key={f.key}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>{f.label}</div>
            <textarea value={data[f.key]||''} onChange={e=>update(f.key,e.target.value)} placeholder={f.placeholder} rows={f.rows}
              style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', color:'#fff', fontSize:13, fontFamily:font, outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.5, colorScheme:'dark' }} />
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {data.address && <button onClick={openMaps} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid rgba(37,99,235,0.35)', background:'rgba(37,99,235,0.15)', color:'#60a5fa', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>🗺️ Open in Maps</button>}
        <button onClick={shareWA} disabled={!filled} style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background:filled?'linear-gradient(135deg,#25D366,#128C7E)':'rgba(255,255,255,0.05)', color:filled?'#fff':'rgba(255,255,255,0.25)', fontSize:13, fontWeight:700, cursor:filled?'pointer':'default', fontFamily:font }}>📤 Share on WhatsApp</button>
      </div>
    </Modal>
  );
}

function OccSeatingChartModal({ onClose, occasion, accent }) {
  const TSK = `tendr-occ-${occasion}-seating-tables`;
  const GSK = `tendr-occ-${occasion}-seating-guests`;
  const [tables, setTables] = useState(() => { try { return JSON.parse(localStorage.getItem(TSK) || '[]'); } catch { return []; } });
  const [guests, setGuests] = useState(() => { try { return JSON.parse(localStorage.getItem(GSK) || '[]'); } catch { return []; } });
  const [tName, setTName] = useState('');
  const [tCap, setTCap] = useState(8);
  const [gName, setGName] = useState('');
  const [selected, setSelected] = useState(null);
  const saveT = (t) => { setTables(t); try { localStorage.setItem(TSK, JSON.stringify(t)); } catch {} };
  const saveG = (g) => { setGuests(g); try { localStorage.setItem(GSK, JSON.stringify(g)); } catch {} };
  const addTable = () => { if (!tName.trim()) return; saveT([...tables, { id: Date.now(), name: tName.trim(), cap: tCap }]); setTName(''); };
  const addGuest = () => { if (!gName.trim()) return; saveG([...guests, { id: Date.now(), name: gName.trim(), table: null }]); setGName(''); };
  const assignToTable = (tId) => { if (!selected) return; saveG(guests.map(g=>g.id===selected?{...g,table:tId}:g)); setSelected(null); };
  const removeFromTable = (gId) => saveG(guests.map(g=>g.id===gId?{...g,table:null}:g));
  const unassigned = guests.filter(g=>!g.table);
  const totalSeated = guests.filter(g=>g.table).length;
  const shareChart = () => {
    const lines = tables.map(t => { const s = guests.filter(g=>g.table===t.id).map(g=>g.name); return `${t.name} (${s.length}/${t.cap}):\n${s.map(n=>'  • '+n).join('\n')||'  (empty)'}`; });
    window.open(`https://wa.me/?text=${encodeURIComponent('🪑 Seating Chart\n\n'+lines.join('\n\n'))}`, '_blank');
  };
  return (
    <Modal onClose={onClose} title="Seating Chart" emoji="🪑" wide>
      {(tables.length>0||guests.length>0) && (
        <div style={{ display:'flex', gap:10, marginBottom:12, alignItems:'center' }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{totalSeated}/{guests.length} guests seated</span>
          {guests.length>0 && <button onClick={shareChart} style={{ marginLeft:'auto', padding:'6px 12px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:font }}>Share Chart</button>}
        </div>
      )}
      {selected && (
        <div style={{ background:`${accent}20`, border:`1px solid ${accent}50`, borderRadius:10, padding:'10px 14px', marginBottom:12, fontSize:13, color:accent, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
          <span>Assigning: <strong>{guests.find(g=>g.id===selected)?.name}</strong> → tap a table</span>
          <button onClick={()=>setSelected(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontSize:13, fontFamily:font }}>Cancel</button>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div>
          <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Tables</div>
          <div style={{ display:'flex', gap:5, marginBottom:10 }}>
            <input value={tName} onChange={e=>setTName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTable()} placeholder="Table name" style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'7px 9px', color:'#fff', fontSize:12, fontFamily:font, outline:'none' }} />
            <input type="number" value={tCap} onChange={e=>setTCap(Math.max(1,Number(e.target.value)))} min={1} max={30} style={{ width:38, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'7px 5px', color:'#fff', fontSize:12, fontFamily:font, outline:'none', textAlign:'center' }} />
            <button onClick={addTable} style={{ background:accent, border:'none', borderRadius:8, padding:'7px 11px', color:'#fff', fontWeight:700, cursor:'pointer', fontFamily:font }}>+</button>
          </div>
          {tables.length===0 ? <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', textAlign:'center', padding:16 }}>Add tables above</div> : tables.map(t => {
            const seated = guests.filter(g=>g.table===t.id);
            const pct = t.cap ? seated.length/t.cap : 0;
            const full = seated.length>=t.cap;
            return (
              <div key={t.id} onClick={()=>selected&&!full&&assignToTable(t.id)}
                style={{ background:selected&&!full?`${accent}18`:'rgba(255,255,255,0.04)', borderRadius:12, padding:'10px 12px', marginBottom:8, border:`1.5px solid ${selected&&!full?accent+'55':full?'rgba(34,197,94,0.2)':'rgba(255,255,255,0.08)'}`, cursor:selected&&!full?'pointer':'default', transition:'all 0.15s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:full?'#22c55e':accent }}>{t.name}</span>
                  <span style={{ fontSize:10.5, color:full?'#22c55e':'rgba(255,255,255,0.4)', fontWeight:700 }}>{seated.length}/{t.cap}</span>
                </div>
                <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.08)', overflow:'hidden', marginBottom:6 }}>
                  <div style={{ height:'100%', width:`${Math.min(pct*100,100)}%`, background:full?'#22c55e':accent, borderRadius:2 }} />
                </div>
                {seated.length>0 ? <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>{seated.map(g=><span key={g.id} onClick={e=>{e.stopPropagation();removeFromTable(g.id);}} style={{ fontSize:10.5, color:'rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.08)', padding:'2px 7px', borderRadius:100, cursor:'pointer' }}>{g.name} ×</span>)}</div>
                : <div style={{ fontSize:11, color:'rgba(255,255,255,0.18)', fontStyle:'italic' }}>Empty</div>}
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Guests</div>
          <div style={{ display:'flex', gap:5, marginBottom:10 }}>
            <input value={gName} onChange={e=>setGName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addGuest()} placeholder="Guest name" style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'7px 9px', color:'#fff', fontSize:12, fontFamily:font, outline:'none' }} />
            <button onClick={addGuest} style={{ background:accent, border:'none', borderRadius:8, padding:'7px 11px', color:'#fff', fontWeight:700, cursor:'pointer', fontFamily:font }}>+</button>
          </div>
          {unassigned.length>0 && <>
            <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Unassigned ({unassigned.length})</div>
            {unassigned.map(g => (
              <div key={g.id} onClick={()=>setSelected(g.id===selected?null:g.id)} style={{ display:'flex', alignItems:'center', gap:7, background:selected===g.id?`${accent}20`:'rgba(255,255,255,0.04)', borderRadius:10, padding:'8px 10px', marginBottom:5, border:`1.5px solid ${selected===g.id?accent+'60':'rgba(255,255,255,0.06)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                <span style={{ flex:1, fontSize:12.5, color:selected===g.id?accent:'#fff', fontFamily:font }}>{g.name}</span>
                <span style={{ fontSize:9.5, color:selected===g.id?accent:'rgba(255,255,255,0.2)', fontWeight:700 }}>{selected===g.id?'→ TAP TABLE':'seat'}</span>
                <button onClick={e=>{e.stopPropagation();saveG(guests.filter(x=>x.id!==g.id));}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:16, lineHeight:1, padding:'0 2px' }}>×</button>
              </div>
            ))}
          </>}
          {guests.filter(g=>g.table).length>0 && <>
            <div style={{ fontSize:10, fontWeight:700, color:'rgba(34,197,94,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'10px 0 6px' }}>Seated ({guests.filter(g=>g.table).length})</div>
            {guests.filter(g=>g.table).map(g => { const t = tables.find(t=>t.id===g.table); return (
              <div key={g.id} style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(34,197,94,0.04)', borderRadius:10, padding:'7px 10px', marginBottom:4, border:'1px solid rgba(34,197,94,0.1)' }}>
                <span style={{ flex:1, fontSize:12, color:'rgba(255,255,255,0.5)', fontFamily:font }}>{g.name}</span>
                <span style={{ fontSize:10.5, color:'rgba(34,197,94,0.7)', fontWeight:700 }}>{t?.name}</span>
                <button onClick={()=>removeFromTable(g.id)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.15)', cursor:'pointer', fontSize:14, lineHeight:1 }}>↩</button>
              </div>
            ); })}
          </>}
          {guests.length===0 && <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', textAlign:'center', padding:16 }}>Add guests above</div>}
        </div>
      </div>
    </Modal>
  );
}

function OccBudgetPlannerModal({ onClose, occasion, accent }) {
  const SK = `tendr-occ-${occasion}-budget`;
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '{}'); } catch { return {}; } });
  const upd = (k, v) => { const d = { ...data, [k]: v }; setData(d); try { localStorage.setItem(SK, JSON.stringify(d)); } catch {} };
  const CATS = [
    { id:'venue',         label:'🏠 Venue',          color:'#3b82f6' },
    { id:'food',          label:'🍽️ Food & Drinks',  color:'#f97316' },
    { id:'decor',         label:'🎨 Decor',           color:'#8b5cf6' },
    { id:'entertainment', label:'🎵 Entertainment',   color:'#ec4899' },
    { id:'other',         label:'📦 Other',           color:'#6b7280' },
  ];
  const total   = Number(data.total || 0);
  const spent   = CATS.reduce((s,c) => s + Number(data[`spent_${c.id}`] || 0), 0);
  const allocated = CATS.reduce((s,c) => s + Number(data[`alloc_${c.id}`] || 0), 0);
  const remaining = total - spent;
  const overBudget = total > 0 && spent > total;
  return (
    <Modal onClose={onClose} title="Budget Planner" emoji="💰" wide>
      <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:14, marginBottom:16, border:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Total Budget</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20, color:'rgba(255,255,255,0.35)', fontWeight:700 }}>₹</span>
          <input type="number" value={data.total||''} onChange={e=>upd('total',e.target.value)} placeholder="0" style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:30, fontWeight:900, color:accent, fontFamily:font }} />
        </div>
        {total > 0 && <>
          <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden', margin:'12px 0 8px' }}>
            <div style={{ height:'100%', width:`${Math.min(spent/total*100,100)}%`, background:overBudget?'#ef4444':accent, borderRadius:3, transition:'width 0.3s' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:700 }}>
            <span style={{ color:'rgba(255,255,255,0.45)' }}>Spent ₹{spent.toLocaleString('en-IN')}</span>
            <span style={{ color:overBudget?'#ef4444':'#22c55e' }}>{overBudget?`⚠️ Over ₹${(spent-total).toLocaleString('en-IN')}`:`₹${remaining.toLocaleString('en-IN')} left`}</span>
          </div>
        </>}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {CATS.map(c => {
          const alloc = Number(data[`alloc_${c.id}`]||0);
          const act   = Number(data[`spent_${c.id}`]||0);
          const pct   = alloc > 0 ? Math.min(act/alloc*100, 100) : 0;
          const over  = alloc > 0 && act > alloc;
          return (
            <div key={c.id} style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'12px 14px', border:`1px solid ${c.color}22` }}>
              <div style={{ fontSize:12, fontWeight:700, color:c.color, marginBottom:8 }}>{c.label}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['Budget',`alloc_${c.id}`,'rgba(255,255,255,0.5)'],['Spent',`spent_${c.id}`,over?'#ef4444':'#fff']].map(([lbl,key,color]) => (
                  <div key={key}>
                    <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{lbl}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,0.06)', borderRadius:8, padding:'7px 10px', border:over&&key.startsWith('spent')?'1px solid rgba(239,68,68,0.3)':'1px solid transparent' }}>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>₹</span>
                      <input type="number" value={data[key]||''} onChange={e=>upd(key,e.target.value)} placeholder="0" style={{ background:'transparent', border:'none', outline:'none', fontSize:15, fontWeight:700, color, fontFamily:font, width:'100%' }} />
                    </div>
                  </div>
                ))}
              </div>
              {alloc > 0 && <>
                <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden', marginTop:8 }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:over?'#ef4444':c.color, borderRadius:2 }} />
                </div>
                <div style={{ fontSize:10, color:over?'#ef4444':'rgba(255,255,255,0.3)', marginTop:3, textAlign:'right', fontWeight:700 }}>{over?`Over ₹${(act-alloc).toLocaleString('en-IN')}`:`₹${(alloc-act).toLocaleString('en-IN')} free`}</div>
              </>}
            </div>
          );
        })}
      </div>
      {allocated > 0 && total > 0 && Math.abs(allocated-total) > 1 && (
        <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:allocated>total?'rgba(239,68,68,0.08)':'rgba(245,158,11,0.08)', border:`1px solid ${allocated>total?'rgba(239,68,68,0.2)':'rgba(245,158,11,0.2)'}`, fontSize:12, color:allocated>total?'#ef4444':'#f59e0b', fontWeight:700 }}>
          {allocated>total?`⚠️ Allocations exceed budget by ₹${(allocated-total).toLocaleString('en-IN')}`:`ℹ️ ₹${(total-allocated).toLocaleString('en-IN')} unallocated`}
        </div>
      )}
    </Modal>
  );
}

function OccVendorTrackerModal({ onClose, occasion, accent }) {
  const SK = `tendr-occ-${occasion}-vendors`;
  const [vendors, setVendors] = useState(() => { try { return JSON.parse(localStorage.getItem(SK)||'[]'); } catch { return []; } });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:'', cat:'Caterer', contact:'', total:'', deposit:'', status:'enquired', notes:'' });
  const CATS = ['Caterer','Decorator','Venue','DJ / Music','Photographer','Transport','Florist','Baker','MC / Host','Other'];
  const STATUS = { enquired:{label:'Enquired',color:'#6b7280'}, quoted:{label:'Quote Received',color:'#f59e0b'}, booked:{label:'Booked',color:'#3b82f6'}, confirmed:{label:'Confirmed',color:'#22c55e'}, cancelled:{label:'Cancelled',color:'#ef4444'} };
  const save = (v) => { setVendors(v); try { localStorage.setItem(SK,JSON.stringify(v)); } catch {} };
  const add = () => { if (!form.name.trim()) return; save([...vendors,{id:Date.now(),...form,name:form.name.trim()}]); setForm({name:'',cat:'Caterer',contact:'',total:'',deposit:'',status:'enquired',notes:''}); setShowAdd(false); };
  const totalCost = vendors.reduce((s,v)=>s+Number(v.total||0),0);
  const totalPaid = vendors.reduce((s,v)=>s+Number(v.deposit||0),0);
  const totalBal  = totalCost - totalPaid;
  return (
    <Modal onClose={onClose} title="Vendor Tracker" emoji="🗂️" wide>
      {vendors.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
          {[['Total Cost',`₹${totalCost.toLocaleString('en-IN')}`,accent],['Paid',`₹${totalPaid.toLocaleString('en-IN')}`,'#22c55e'],['Balance Due',`₹${totalBal.toLocaleString('en-IN')}`,totalBal>0?'#f59e0b':'#22c55e']].map(([lbl,val,color])=>(
            <div key={lbl} style={{ textAlign:'center', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 6px', border:`1px solid ${color}30` }}>
              <div style={{ fontSize:15, fontWeight:800, color }}>{val}</div>
              <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      )}
      {showAdd ? (
        <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:14, marginBottom:14, border:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Vendor name *" style={inp} />
            <select value={form.cat} onChange={e=>setForm(p=>({...p,cat:e.target.value}))} style={{ ...inp, colorScheme:'dark' }}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select>
          </div>
          <input value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} placeholder="Phone / Instagram / Email" style={{ ...inp, marginBottom:8 }} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            {[['total','Total amount'],['deposit','Deposit paid']].map(([key,ph])=>(
              <div key={key} style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)', fontSize:13, pointerEvents:'none' }}>₹</span>
                <input type="number" value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={{ ...inp, paddingLeft:26 }} />
              </div>
            ))}
          </div>
          <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Notes (optional)" style={{ ...inp, marginBottom:10 }} />
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={add} style={{ flex:1, background:accent, border:'none', borderRadius:9, padding:'10px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>Add Vendor</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'10px 16px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:font, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowAdd(true)} style={{ width:'100%', background:`${accent}20`, border:`1.5px dashed ${accent}55`, borderRadius:10, padding:'11px', color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, marginBottom:14 }}>+ Add Vendor</button>
      )}
      {vendors.length === 0 ? (
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:13, padding:'28px 0' }}>No vendors yet — add caterers, decorators, photographers…</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {vendors.map(v => {
            const balance = Number(v.total||0) - Number(v.deposit||0);
            const st = STATUS[v.status] || STATUS.enquired;
            const ph = v.contact?.replace(/\D/g,'');
            const isPhone = ph && ph.length >= 10;
            return (
              <div key={v.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'12px 14px', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:15, fontWeight:700, color:'#fff', fontFamily:font }}>{v.name}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:accent, background:`${accent}22`, padding:'2px 8px', borderRadius:100 }}>{v.cat}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:st.color, background:`${st.color}22`, padding:'2px 8px', borderRadius:100 }}>{st.label}</span>
                    </div>
                    {v.contact && (isPhone
                      ? <a href={`https://wa.me/${ph.startsWith('91')&&ph.length===12?ph:'91'+ph}`} target="_blank" rel="noreferrer" style={{ fontSize:11.5, color:'#25D366', textDecoration:'none', fontWeight:700, display:'block', marginTop:3 }}>📱 {v.contact}</a>
                      : <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.4)', marginTop:3 }}>{v.contact}</div>
                    )}
                    {v.notes && <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:4, fontStyle:'italic' }}>{v.notes}</div>}
                  </div>
                  <button onClick={()=>save(vendors.filter(x=>x.id!==v.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:18, lineHeight:1 }}>×</button>
                </div>
                {(v.total||v.deposit) && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginTop:10 }}>
                    {[['Total',v.total,'rgba(255,255,255,0.6)'],['Paid',v.deposit,'#22c55e'],['Balance',balance,balance>0?'#f59e0b':'#22c55e']].map(([lbl,val,color])=>(
                      <div key={lbl} style={{ textAlign:'center', background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'6px 4px' }}>
                        <div style={{ fontSize:13, fontWeight:800, color }}>₹{Number(val||0).toLocaleString('en-IN')}</div>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop:10, display:'flex', gap:5, flexWrap:'wrap' }}>
                  {Object.entries(STATUS).map(([key,s])=>(
                    <button key={key} onClick={()=>save(vendors.map(x=>x.id===v.id?{...x,status:key}:x))} style={{ fontSize:10.5, padding:'4px 10px', borderRadius:100, border:`1.5px solid ${v.status===key?s.color:'rgba(255,255,255,0.1)'}`, background:v.status===key?s.color+'22':'transparent', color:v.status===key?s.color:'rgba(255,255,255,0.35)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>{s.label}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

function OccWABroadcastModal({ onClose, occasion, accent }) {
  const occLabels = { birthday:'Birthday', anniversary:'Anniversary', 'baby-shower':'Baby Shower', housewarming:'Housewarming', 'get-together':'Get Together', 'kitty-party':'Kitty Party', 'naming-ceremony':'Naming Ceremony' };
  const occLabel = occLabels[occasion] || 'Celebration';
  const venueData = (() => { try { return JSON.parse(localStorage.getItem(`tendr-occ-${occasion}-venue`)||'{}'); } catch { return {}; } })();
  const addr = venueData.address || '[ADD VENUE]';
  const parking = venueData.parking ? `\n🅿️ *Parking:* ${venueData.parking}` : '';
  const entry   = venueData.entry   ? `\n🚪 *Entry:* ${venueData.entry}`    : '';
  const contact = venueData.contact ? `\n📞 *Contact:* ${venueData.contact}` : '';
  const hasVenue = !!venueData.address;
  const PHASES = [
    { id:'savedate', label:'Save the Date', emoji:'📅',
      template:`🎉 *Save the Date!*\n\nWe're celebrating our ${occLabel} and we'd love for you to join us!\n\n📅 *Date:* [ADD DATE]\n⏰ *Time:* [ADD TIME]\n📍 *Venue:* ${addr}\n\nMore details coming soon! 🥳` },
    { id:'reminder', label:'1-Week Reminder', emoji:'⏰',
      template:`Hey! 👋 Just a reminder — our ${occLabel} is *one week away*!\n\n📅 *Date:* [ADD DATE]\n⏰ *Time:* [ADD TIME]\n📍 *Venue:* ${addr}${parking}${entry}\n\nSee you there! 🎊` },
    { id:'dayof', label:'Day-Of Directions', emoji:'📍',
      template:`Today's the day! 🎉\n\n*${occLabel} — Here's how to get there:*\n\n📍 *Address:* ${addr}${parking}${contact}${entry}\n\nCan't wait to see you! 🥂` },
    { id:'thankyou', label:'Thank You', emoji:'🙏',
      template:`🙏 *Thank you so much!*\n\nWe're so grateful you were part of our ${occLabel} celebration.\n\nYour presence and wishes made it truly special.\n\nWith love ❤️` },
  ];
  const [phase, setPhase] = useState('savedate');
  const [msgs, setMsgs] = useState(() => Object.fromEntries(PHASES.map(p=>[p.id, p.template])));
  const [copied, setCopied] = useState(false);
  const msg = msgs[phase];
  const copyText = () => { navigator.clipboard.writeText(msg).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),1800); }).catch(()=>{}); };
  return (
    <Modal onClose={onClose} title="WA Broadcasts" emoji="📣" wide>
      <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
        {PHASES.map(p=>(
          <button key={p.id} onClick={()=>setPhase(p.id)} style={{ fontSize:11.5, padding:'6px 12px', borderRadius:100, border:`1.5px solid ${phase===p.id?accent:'rgba(255,255,255,0.12)'}`, background:phase===p.id?`${accent}22`:'transparent', color:phase===p.id?accent:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>{p.emoji} {p.label}</button>
        ))}
      </div>
      {hasVenue && <div style={{ fontSize:11, color:'#22c55e', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:8, padding:'6px 12px', marginBottom:12, fontWeight:600 }}>✓ Venue address auto-filled from Venue Notes</div>}
      <textarea value={msg} onChange={e=>setMsgs(m=>({...m,[phase]:e.target.value}))} rows={10}
        style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:14, color:'#fff', fontSize:13.5, fontFamily:font, outline:'none', resize:'vertical', boxSizing:'border-box', lineHeight:1.6, colorScheme:'dark', marginBottom:12 }} />
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={copyText} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.15)', background:copied?'rgba(34,197,94,0.12)':'transparent', color:copied?'#22c55e':'rgba(255,255,255,0.7)', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, transition:'all 0.2s' }}>{copied?'✓ Copied!':'📋 Copy'}</button>
        <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank')} style={{ flex:2, padding:'11px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>📤 Open in WhatsApp</button>
      </div>
      <div style={{ marginTop:10, fontSize:11, color:'rgba(255,255,255,0.25)', textAlign:'center' }}>Edit the message above then send — changes are not saved between sessions</div>
    </Modal>
  );
}

// ── Awards Ceremony (office-party specific) ───────────────────────────────
function AwardsCeremony({ onClose, accent }) {
  const [awards, setAwards] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [newWinner, setNewWinner] = useState("");
  const [phase, setPhase] = useState("setup");
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const add = () => {
    if (!newCat.trim() || !newWinner.trim()) return;
    setAwards(a => [...a, { cat: newCat.trim(), winner: newWinner.trim() }]);
    setNewCat(""); setNewWinner("");
  };
  const next = () => {
    if (!revealed) { setRevealed(true); return; }
    if (current < awards.length - 1) { setCurrent(c => c + 1); setRevealed(false); }
    else setDone(true);
  };

  if (phase === "setup") return (
    <Modal onClose={onClose} emoji="🏆" title="Awards Ceremony" wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Add award categories and winners. Reveal them live one by one.</p>
      <label style={lbl}>Award Name</label>
      <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="e.g. Best Team Player" style={{ ...inp, marginBottom: 8 }} />
      <label style={lbl}>Winner</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={newWinner} onChange={e => setNewWinner(e.target.value)} placeholder="Winner's name" style={{ ...inp, flex: 1 }} onKeyDown={e => e.key === "Enter" && add()} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>+</button>
      </div>
      {awards.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13, marginBottom: 8 }}>No awards yet — add some above!</p>}
      {awards.map((a, i) => (
        <div key={i} style={{ ...crd, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>🏆 {a.cat}</div>
            <div style={{ fontSize: 12, color: accent, marginTop: 2 }}>{a.winner}</div>
          </div>
          <span onClick={() => setAwards(aa => aa.filter((_, j) => j !== i))} style={{ cursor: "pointer", opacity: 0.4, fontSize: 16, padding: 4 }}>✕</span>
        </div>
      ))}
      {awards.length >= 1 && (
        <button onClick={() => setPhase("ceremony")} style={{ ...mkBtn(accent), marginTop: 12 }}>
          🎬 Start Ceremony — {awards.length} award{awards.length > 1 ? "s" : ""}
        </button>
      )}
    </Modal>
  );

  if (done) return (
    <Modal onClose={onClose} emoji="🎉" title="All Awards Presented!">
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 6 }}>Congratulations to all winners!</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.6 }}>
          {awards.map(a => `${a.cat}: ${a.winner}`).join("  ·  ")}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setPhase("setup"); setDone(false); setCurrent(0); setRevealed(false); }} style={{ ...mkBtn("rgba(255,255,255,0.08)"), flex: 1 }}>Edit & Rerun</button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("🏆 *Tonight's Award Winners*\n\n" + awards.map(a => `• ${a.cat}: *${a.winner}*`).join("\n") + "\n\nCongratulations to everyone! 🎉")}`, "_blank")} style={{ ...mkBtn("#25D366"), flex: 1 }}>📤 Share on WhatsApp</button>
        </div>
      </div>
    </Modal>
  );

  const award = awards[current];
  return (
    <Modal onClose={onClose} emoji="🏆" title={`Award ${current + 1} of ${awards.length}`}>
      <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 18 }}>
          {award.cat}
        </div>
        {!revealed ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 16, animation: "dot-pulse 1.2s ease-in-out infinite" }}>🥁</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>And the award goes to…</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 8, animation: "rm-in 0.38s cubic-bezier(0.22,1,0.36,1)", letterSpacing: "-0.02em" }}>
              {award.winner}
            </div>
            <div style={{ fontSize: 13, color: accent, marginBottom: 6, fontWeight: 700 }}>🏆 {award.cat}</div>
            <div style={{ fontSize: 22, marginBottom: 24 }}>🎊</div>
          </>
        )}
        <button onClick={next} style={mkBtn(accent)}>
          {!revealed ? "✨ Reveal Winner" : current < awards.length - 1 ? "Next Award →" : "🎉 Finish Ceremony"}
        </button>
      </div>
    </Modal>
  );
}

// ── Run of Show (office-party specific) ──────────────────────────────────
function RunOfShow({ onClose, accent }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [newTime, setNewTime] = useState("");
  const [done, setDone] = useState({});
  const add = () => {
    if (!newItem.trim()) return;
    setItems(i => [...i, { label: newItem.trim(), time: newTime.trim() }]);
    setNewItem(""); setNewTime("");
  };
  const toggle = (i) => setDone(d => ({ ...d, [i]: !d[i] }));
  const doneCount = Object.values(done).filter(Boolean).length;
  return (
    <Modal onClose={onClose} emoji="📋" title="Run of Show" wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Add event segments with times. Tick them off live during the event.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="7:30 PM" style={{ ...inp, width: 90, flexShrink: 0 }} />
        <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Segment (e.g. Welcome speech)" style={{ ...inp, flex: 1 }} onKeyDown={e => e.key === "Enter" && add()} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 14px" }}>+</button>
      </div>
      {items.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No segments yet. Add your event flow above.</p>}
      {items.length > 0 && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "right", marginBottom: 8 }}>{doneCount}/{items.length} done</div>
      )}
      {items.map((it, i) => (
        <div key={i} onClick={() => toggle(i)} style={{ ...crd, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", opacity: done[i] ? 0.5 : 1, transition: "opacity 0.2s" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${done[i] ? "#22c55e" : "rgba(255,255,255,0.3)"}`, background: done[i] ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {done[i] && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          {it.time && <span style={{ fontSize: 12, fontWeight: 700, color: accent, minWidth: 48, flexShrink: 0 }}>{it.time}</span>}
          <span style={{ flex: 1, fontSize: 14, color: "#fff", textDecoration: done[i] ? "line-through" : "none" }}>{it.label}</span>
          <span onClick={e => { e.stopPropagation(); setItems(ii => ii.filter((_, j) => j !== i)); }} style={{ opacity: 0.3, cursor: "pointer", fontSize: 14, padding: "0 4px" }}>✕</span>
        </div>
      ))}
      {items.length > 0 && (
        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("📋 *Event Run of Show*\n\n" + items.map(it => `${it.time ? it.time + "  " : ""}${it.label}`).join("\n"))}`, "_blank")} style={{ ...mkBtn("#25D366"), marginTop: 8 }}>📤 Share with Team</button>
      )}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OCCASIONS CONFIG
// ════════════════════════════════════════════════════════════════════════════

const OCCASIONS = {
  birthday: {
    name: "Birthday Hub",
    emoji: "🎂",
    accent: "#EC4899",
    bg: "linear-gradient(125deg, #150608, #1a080c, #0f0508, #150608)",
    eyebrow: "Birthday Toolkit",
    tagline: "Make it a birthday they never forget",
    themes: ["Bollywood Night", "Neon Glow", "Retro 70s", "All White", "Fairy Lights", "Masquerade", "Beach Vibes", "Royale Night"],
    sections: [
      { id: "manage", label: "⚙️ Manage", subtitle: "Plan the perfect celebration", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP instantly", color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Party Checklist",        desc: "Guest count → auto buy list",       color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",           desc: "Split party expenses fairly",        color: "#DC2626" },
        { id: "gifttracker", emoji: "🎁", title: "Gift Tracker",            desc: "Log gifts · track thank-yous",      color: "#16A34A" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · +1 · WhatsApp", color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · who brings · status",     color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the day · live NOW tracker", color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",    color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign",       color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track spend by category", color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Caterer · DJ · deposit · balance",     color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · reminder · thank you", color: "#25D366" },
      ]},
      { id: "fun", label: "✨ Fun", subtitle: "Make it memorable", tools: [
        { id: "wishwall",      emoji: "🎂", title: "Wish Wall",          desc: "Everyone writes a wish for the birthday star", color: "#EC4899" },
        { id: "theme",         emoji: "🎨", title: "Theme Picker",       desc: "Vote on the party theme",                     color: "#7C3AED" },
        { id: "countdown",     emoji: "⏱️", title: "Countdown Timer",    desc: "Count down to the big day",                   color: "#0891B2" },
        { id: "playlist",      emoji: "🎵", title: "Playlist Builder",   desc: "Everyone adds their song",                    color: "#059669" },
        { id: "photowall",     emoji: "📸", title: "Shared Photo Wall",  desc: "Everyone uploads memories",                   color: "#DB2777" },
        { id: "secretmessage", emoji: "💌", title: "Secret Messages",    desc: "Anonymous wishes for the birthday star",       color: "#F59E0B" },
        { id: "moodmeter",     emoji: "🌡️", title: "Mood Meter",         desc: "Live party vibe tracker",                     color: "#10B981" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "Keep the energy going", tools: [
        { id: "birthdayquiz",  emoji: "🎯", title: "Birthday Quiz",       desc: "How well do you know the birthday person?", color: "#EC4899" },
        { id: "mostlikelyto",  emoji: "🏆", title: "Most Likely To",      desc: "Vote who's most likely to…",                color: "#F59E0B" },
        { id: "t2l",           emoji: "🤥", title: "Two Truths One Lie",  desc: "Find the lie · earn points",                color: "#8B5CF6" },
        { id: "rapidfire",     emoji: "⚡", title: "Rapid Fire",          desc: "Ya/Ya choices · 30 seconds",                color: "#EF4444" },
        { id: "truthordare",   emoji: "🎯", title: "Truth or Dare",       desc: "Indian youth decks · 25 + 25",              color: "#DC2626" },
        { id: "neverhavei",    emoji: "🙅", title: "Never Have I Ever",   desc: "30 statements · score tracker",             color: "#059669" },
        { id: "wouldyou",      emoji: "🤷", title: "Would You Rather",    desc: "Spicy choices · defend your answer",        color: "#7C3AED" },
        { id: "spin",          emoji: "🍾", title: "Spin the Bottle",     desc: "Random picker with spinner",                color: "#2563EB" },
        { id: "charades",      emoji: "🎭", title: "Dumb Charades",       desc: "Bollywood · Celebs · Memes",               color: "#D97706" },
        { id: "bingo",         emoji: "🎱", title: "Party Bingo",         desc: "5×5 birthday scenario bingo",              color: "#0891B2" },
      ]},
      { id: "other", label: "🏆 Other", subtitle: "After the party", tools: [
        { id: "reportcard", emoji: "🏆", title: "Party Report Card", desc: "Rate the night · get a grade", color: "#FBBF24" },
      ]},
    ],
  },
  anniversary: {
    name: "Anniversary Hub",
    emoji: "💍",
    accent: "#F59E0B",
    bg: "linear-gradient(125deg, #1a1000, #201500, #1a0a00, #1a1000)",
    eyebrow: "Anniversary Toolkit",
    tagline: "Celebrate love, beautifully",
    themes: ["Candlelight Dinner", "Golden Glow", "Rustic Romance", "Black & Gold", "Garden Party", "Vintage Bollywood", "Starry Night", "Minimalist Chic"],
    sections: [
      { id: "manage", label: "💛 Celebrate", subtitle: "Plan the perfect evening", tools: [
        { id: "invite", emoji: "📨", title: "Digital Invite", desc: "Share the celebration details", color: "#2563EB" },
        { id: "bills", emoji: "💸", title: "Bill Splitter", desc: "Split the celebration costs", color: "#DC2626" },
        { id: "countdown",   emoji: "⏱️", title: "Countdown Timer",         desc: "Count down to the special day",       color: "#0891B2" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · +1 · WhatsApp", color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · who brings · status",     color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the day · live NOW tracker", color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",    color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign",       color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track spend by category", color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Caterer · DJ · deposit · balance",     color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · reminder · thank you", color: "#25D366" },
      ]},
      { id: "fun", label: "❤️ Love", subtitle: "Make it unforgettable", tools: [
        { id: "lovenotes", emoji: "💌", title: "Love Notes Wall", desc: "Everyone writes a note for the couple", color: "#F59E0B" },
        { id: "theme", emoji: "🎨", title: "Theme Picker", desc: "Vote on the celebration theme", color: "#7C3AED" },
        { id: "playlist", emoji: "🎵", title: "Playlist Builder", desc: "Build their love songs playlist", color: "#059669" },
        { id: "photowall", emoji: "📸", title: "Shared Photo Wall", desc: "Upload your favourite memories of them", color: "#DB2777" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "Fun for everyone", tools: [
        { id: "couplequiz", emoji: "💑", title: "Couple Quiz", desc: "How well do you know the couple?", color: "#F59E0B" },
        { id: "wouldyou", emoji: "🤷", title: "Would You Rather", desc: "Spicy couple edition choices", color: "#7C3AED" },
        { id: "blessingswall", emoji: "🙏", title: "Blessings Wall", desc: "Share wishes for the couple", color: "#059669" },
      ]},
      { id: "other", label: "🏆 Other", subtitle: "After the celebration", tools: [
        { id: "reportcard", emoji: "🏆", title: "Evening Report Card", desc: "Rate the celebration · get a grade", color: "#FBBF24" },
      ]},
    ],
  },
  "baby-shower": {
    name: "Baby Shower Hub",
    emoji: "👶",
    accent: "#38BDF8",
    bg: "linear-gradient(125deg, #001020, #001830, #000820, #001020)",
    eyebrow: "Baby Shower Toolkit",
    tagline: "Celebrate the little one arriving soon",
    themes: ["Pastel Dreams", "Twinkle Stars", "Safari Animals", "Under the Sea", "Rainbow Love", "Woodland Creatures", "Floral Garden", "Oh Baby!"],
    sections: [
      { id: "manage", label: "🍼 Manage", subtitle: "Plan a beautiful shower", tools: [
        { id: "invite", emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP", color: "#2563EB" },
        { id: "checklist", emoji: "📋", title: "Shower Checklist", desc: "Guest count → what to arrange", color: "#D97706" },
        { id: "potluck",     emoji: "🥘", title: "Potluck Planner",          desc: "Everyone brings something",           color: "#059669" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · +1 · WhatsApp", color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · who brings · status",     color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the day · live NOW tracker", color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",    color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign",       color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track spend by category", color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Caterer · DJ · deposit · balance",     color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · reminder · thank you", color: "#25D366" },
      ]},
      { id: "votes", label: "👶 Baby Votes", subtitle: "Fun predictions & guesses", tools: [
        { id: "babynamevote", emoji: "👶", title: "Baby Name Vote", desc: "Suggest & vote on baby names", color: "#38BDF8" },
        { id: "genderpoll", emoji: "🍼", title: "Gender Prediction", desc: "Girl or Boy? Everyone guesses", color: "#F472B6" },
        { id: "advicecards", emoji: "💌", title: "Advice for Parents", desc: "Wisdom, memories & predictions", color: "#A78BFA" },
      ]},
      { id: "fun", label: "✨ Fun", subtitle: "Make memories", tools: [
        { id: "theme", emoji: "🎨", title: "Theme Picker", desc: "Vote on the shower theme", color: "#7C3AED" },
        { id: "countdown", emoji: "⏱️", title: "Countdown Timer", desc: "Count down to the due date", color: "#0891B2" },
        { id: "photowall", emoji: "📸", title: "Shared Photo Wall", desc: "Everyone uploads shower photos", color: "#DB2777" },
        { id: "playlist", emoji: "🎵", title: "Playlist Builder", desc: "Baby's first playlist", color: "#059669" },
      ]},
      { id: "other", label: "🏆 Other", subtitle: "After the shower", tools: [
        { id: "reportcard", emoji: "🏆", title: "Shower Report Card", desc: "Rate the celebration", color: "#FBBF24" },
      ]},
    ],
  },
  housewarming: {
    name: "Housewarming Hub",
    emoji: "🏡",
    accent: "#F97316",
    bg: "linear-gradient(125deg, #1a0a00, #201200, #150800, #1a0a00)",
    eyebrow: "Housewarming Toolkit",
    tagline: "Welcome home in style",
    themes: ["Cozy Bohemian", "Modern Minimal", "Tropical Vibes", "Scandinavian", "Rustic Warm", "Industrial Chic", "Garden Party", "Retro Vintage"],
    sections: [
      { id: "manage", label: "🏡 Manage", subtitle: "Settle in together", tools: [
        { id: "invite", emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP", color: "#2563EB" },
        { id: "giftregistry", emoji: "🎁", title: "Gift Registry", desc: "What you need for the new home", color: "#F97316" },
        { id: "checklist", emoji: "📋", title: "Party Checklist", desc: "Guest count → what to arrange", color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",            desc: "Split the celebration expenses",      color: "#DC2626" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · +1 · WhatsApp", color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · who brings · status",     color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the day · live NOW tracker", color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",    color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign",       color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track spend by category", color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Caterer · DJ · deposit · balance",     color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · reminder · thank you", color: "#25D366" },
      ]},
      { id: "fun", label: "✨ Fun", subtitle: "Show them around", tools: [
        { id: "theme", emoji: "🎨", title: "Theme Picker", desc: "Vote on the decor theme", color: "#7C3AED" },
        { id: "countdown", emoji: "⏱️", title: "Countdown Timer", desc: "Count down to the move-in", color: "#0891B2" },
        { id: "playlist", emoji: "🎵", title: "Playlist Builder", desc: "Soundtrack for the new home", color: "#059669" },
        { id: "photowall", emoji: "📸", title: "Shared Photo Wall", desc: "Everyone captures the new space", color: "#DB2777" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "Get comfortable together", tools: [
        { id: "truthordare", emoji: "🎯", title: "Truth or Dare", desc: "Icebreaker for the new home", color: "#DC2626" },
        { id: "hottakes", emoji: "🌶️", title: "Hot Takes", desc: "Debate over home decor opinions", color: "#F97316" },
        { id: "spin", emoji: "🍾", title: "Random Picker", desc: "Who does the first chore?", color: "#2563EB" },
      ]},
      { id: "other", label: "🏆 Other", subtitle: "After the celebration", tools: [
        { id: "reportcard", emoji: "🏆", title: "Housewarming Report Card", desc: "Rate the celebration", color: "#FBBF24" },
      ]},
    ],
  },
  "get-together": {
    name: "Get Together Hub",
    emoji: "🎉",
    accent: "#10B981",
    bg: "linear-gradient(125deg, #001a10, #002010, #001508, #001a10)",
    eyebrow: "Get Together Toolkit",
    tagline: "The app everyone opens when the gang reunites",
    themes: ["Retro 70s", "Bollywood Night", "Neon Glow", "Black & White", "Beach Vibes", "Royale / OTT", "Masquerade", "Fairy Lights"],
    sections: [
      { id: "manage", label: "⚙️ Manage", subtitle: "Plan · track · split", tools: [
        { id: "potluck", emoji: "🥘", title: "Potluck Planner", desc: "Shareable link · claim items", color: "#059669" },
        { id: "invite", emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP", color: "#2563EB" },
        { id: "checklist", emoji: "📋", title: "Checklist", desc: "Guest count → auto buy list", color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",            desc: "Enter spends → who owes whom",        color: "#DC2626" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · +1 · WhatsApp", color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · who brings · status",     color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the day · live NOW tracker", color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",    color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign",       color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track spend by category", color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Caterer · DJ · deposit · balance",     color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · reminder · thank you", color: "#25D366" },
      ]},
      { id: "fun", label: "✨ Fun", subtitle: "Theme · music · photos", tools: [
        { id: "theme", emoji: "🎨", title: "Theme Picker", desc: "Vote on tonight's vibe", color: "#7C3AED" },
        { id: "countdown", emoji: "⏱️", title: "Countdown Timer", desc: "Visual countdown to meet-up", color: "#0891B2" },
        { id: "playlist", emoji: "🎵", title: "Playlist Builder", desc: "Everyone adds 2 songs", color: "#059669" },
        { id: "photowall", emoji: "📸", title: "Photo Wall", desc: "Shared album · everyone uploads", color: "#DB2777" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "The real reason you're here", tools: [
        { id: "truthordare", emoji: "🎯", title: "Truth or Dare", desc: "Indian youth decks · 25+25", color: "#DC2626" },
        { id: "neverhavei", emoji: "🙅", title: "Never Have I Ever", desc: "30 statements · score tracker", color: "#059669" },
        { id: "wouldyou", emoji: "🤷", title: "Would You Rather", desc: "Spicy choices — defend yourself", color: "#7C3AED" },
        { id: "hottakes", emoji: "🌶️", title: "Hot Takes", desc: "25 takes · agree or disagree", color: "#DC2626" },
        { id: "spin", emoji: "🍾", title: "Spin the Bottle", desc: "Random picker with spinner", color: "#2563EB" },
        { id: "charades", emoji: "🎭", title: "Dumb Charades", desc: "Bollywood · Web Shows · Memes", color: "#D97706" },
        { id: "bingo", emoji: "🎱", title: "Party Bingo", desc: "5×5 scenario bingo cards", color: "#0891B2" },
      ]},
      { id: "other", label: "🏆 Other", subtitle: "End of the night", tools: [
        { id: "reportcard", emoji: "🏆", title: "Evening Report Card", desc: "Rate the night · get a grade", color: "#FBBF24" },
      ]},
    ],
  },
  "kitty-party": {
    name: "Kitty Party Hub",
    emoji: "🎀",
    accent: "#E879F9",
    bg: "linear-gradient(125deg, #1a0518, #1e0a1c, #160416, #1a0518)",
    eyebrow: "Kitty Party Toolkit",
    tagline: "The OG girls' get-together, elevated",
    themes: ["All Pink", "Bollywood Glam", "Saree Night", "Floral Fiesta", "Retro Kitty", "Peacock Blue", "Black & Gold", "Garden Party"],
    sections: [
      { id: "manage", label: "💰 Manage", subtitle: "Keep the kitty running", tools: [
        { id: "luckydraw", emoji: "🎀", title: "Lucky Draw", desc: "Pick this month's winner", color: "#E879F9" },
        { id: "kittyfund", emoji: "💰", title: "Kitty Fund Tracker", desc: "Track who's paid this month", color: "#F59E0B" },
        { id: "bills", emoji: "💸", title: "Bill Splitter", desc: "Split the party expenses", color: "#DC2626" },
        { id: "checklist",   emoji: "📋", title: "Party Checklist",          desc: "Guest count → what to arrange",       color: "#D97706" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · +1 · WhatsApp", color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · who brings · status",     color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the day · live NOW tracker", color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",    color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign",       color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track spend by category", color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Caterer · DJ · deposit · balance",     color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · reminder · thank you", color: "#25D366" },
      ]},
      { id: "fun", label: "✨ Fun", subtitle: "Kitty vibes only", tools: [
        { id: "theme", emoji: "🎨", title: "Theme Picker", desc: "Vote on this month's theme", color: "#7C3AED" },
        { id: "countdown", emoji: "⏱️", title: "Countdown Timer", desc: "Count down to the next kitty", color: "#0891B2" },
        { id: "playlist", emoji: "🎵", title: "Playlist Builder", desc: "Everyone adds their jam", color: "#059669" },
        { id: "photowall", emoji: "📸", title: "Photo Wall", desc: "Shared album for the squad", color: "#DB2777" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "Ladies night fun", tools: [
        { id: "truthordare", emoji: "🎯", title: "Truth or Dare", desc: "Kitty party edition", color: "#DC2626" },
        { id: "neverhavei", emoji: "🙅", title: "Never Have I Ever", desc: "30 statements · score tracker", color: "#059669" },
        { id: "wouldyou", emoji: "🤷", title: "Would You Rather", desc: "Spicy choices for the ladies", color: "#7C3AED" },
        { id: "hottakes", emoji: "🌶️", title: "Hot Takes", desc: "Debate the spiciest opinions", color: "#DC2626" },
        { id: "bingo", emoji: "🎱", title: "Kitty Bingo", desc: "5×5 kitty party bingo", color: "#0891B2" },
      ]},
      { id: "other", label: "🏆 Other", subtitle: "After the kitty", tools: [
        { id: "reportcard", emoji: "🏆", title: "Kitty Report Card", desc: "Rate this month's kitty", color: "#FBBF24" },
      ]},
    ],
  },
  "office-party": {
    name: "Office Party Hub",
    emoji: "🏢",
    accent: "#3B82F6",
    bg: "linear-gradient(125deg, #030c1a, #04102a, #020810, #030c1a)",
    eyebrow: "Corporate Party Toolkit",
    tagline: "Make your team night one they'll actually talk about on Monday",
    themes: ["Corporate Glam", "Bollywood Night", "Garden Soirée", "Neon Disco Nights", "Understated Modern", "Retro 90s", "Black & Gold", "Tropical Vibes"],
    sections: [
      { id: "manage", label: "⚙️ Plan", subtitle: "Organise every detail", tools: [
        { id: "invite",       emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · employees RSVP instantly",     color: "#2563EB" },
        { id: "checklist",    emoji: "📋", title: "Party Checklist",        desc: "Guest count → auto buy list",            color: "#D97706" },
        { id: "bills",        emoji: "💸", title: "Bill Splitter",          desc: "Split party expenses by department",     color: "#DC2626" },
        { id: "guestlist",    emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · department",       color: "#7C3AED" },
        { id: "menu",         emoji: "🍽️", title: "Menu Planner",          desc: "Plan food · dietary prefs · status",     color: "#059669" },
        { id: "daytimeline",  emoji: "🗓️", title: "Day Timeline",          desc: "Schedule the evening · live tracker",    color: "#D97706" },
        { id: "venue",        emoji: "📍", title: "Venue Notes",           desc: "Address · parking · Maps · share",       color: "#DC2626" },
        { id: "seating",      emoji: "🪑", title: "Seating Chart",         desc: "Visual tables · tap to assign seats",    color: "#0891B2" },
        { id: "budget",       emoji: "💰", title: "Budget Planner",        desc: "Set budget · track by category",         color: "#16A34A" },
        { id: "vendors",      emoji: "🗂️", title: "Vendor Tracker",        desc: "Caterer · AV · DJ · deposit · balance", color: "#F59E0B" },
        { id: "wabroadcast",  emoji: "📣", title: "WA Broadcasts",         desc: "Save the date · reminder · thank you",  color: "#25D366" },
      ]},
      { id: "ceremony", label: "🏆 Awards", subtitle: "Recognition & ceremony", tools: [
        { id: "awardsceremony", emoji: "🏆", title: "Awards Ceremony",    desc: "Add winners · reveal live one by one",   color: "#F59E0B" },
        { id: "runofshow",      emoji: "📋", title: "Run of Show",        desc: "Live event flow — tick off segments",    color: "#3B82F6" },
        { id: "appreciationwall", emoji: "💌", title: "Appreciation Wall", desc: "Colleagues share shoutouts & kudos",    color: "#EC4899" },
        { id: "countdown",      emoji: "⏱️", title: "Countdown Timer",    desc: "Count down to the party or award time", color: "#0891B2" },
      ]},
      { id: "fun", label: "✨ Fun", subtitle: "Theme · music · memories", tools: [
        { id: "theme",         emoji: "🎨", title: "Theme Picker",        desc: "Vote on tonight's party theme",          color: "#7C3AED" },
        { id: "playlist",      emoji: "🎵", title: "Playlist Builder",    desc: "Everyone adds their song · upvote",      color: "#059669" },
        { id: "photowall",     emoji: "📸", title: "Shared Photo Wall",   desc: "Everyone uploads their photos",          color: "#DB2777" },
        { id: "moodmeter",     emoji: "🌡️", title: "Mood Meter",         desc: "Live party vibe tracker",                color: "#10B981" },
        { id: "secretmessage", emoji: "💌", title: "Secret Messages",    desc: "Anonymous appreciation notes for anyone", color: "#F59E0B" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "Team games that actually work", tools: [
        { id: "mostlikelyto",  emoji: "🏆", title: "Most Likely To",      desc: "Office edition — who's most likely to…", color: "#F59E0B" },
        { id: "t2l",           emoji: "🤥", title: "Two Truths One Lie",  desc: "Find the lie — great icebreaker",        color: "#8B5CF6" },
        { id: "rapidfire",     emoji: "⚡", title: "Rapid Fire",          desc: "Quick choices — 30 seconds on the clock", color: "#EF4444" },
        { id: "wouldyou",      emoji: "🤷", title: "Would You Rather",    desc: "Team-friendly dilemmas — defend it",     color: "#7C3AED" },
        { id: "hottakes",      emoji: "🌶️", title: "Hot Takes",          desc: "Office opinions — agree or disagree",    color: "#DC2626" },
        { id: "bingo",         emoji: "🎱", title: "Office Party Bingo",  desc: "5×5 corporate party scenario bingo",     color: "#0891B2" },
        { id: "charades",      emoji: "🎭", title: "Dumb Charades",       desc: "Bollywood · Web Shows · Office Memes",   color: "#D97706" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "Wrap up the night", tools: [
        { id: "reportcard", emoji: "🏆", title: "Party Report Card", desc: "Rate the night · get a grade", color: "#FBBF24" },
      ]},
    ],
  },

  "naming-ceremony": {
    name: "Naming Ceremony Hub",
    emoji: "🌸",
    accent: "#A78BFA",
    bg: "linear-gradient(125deg, #0c0808, #140a08, #0a0606, #0c0808)",
    eyebrow: "Naming Ceremony Toolkit",
    tagline: "Celebrate the name that will define a lifetime",
    themes: ["Floral Garden", "Saffron & Gold", "Pastel Dreams", "Traditional Hindu", "White & Gold", "Marigold Festival", "Starry Night", "Peacock Royal"],
    sections: [
      { id: "manage", label: "🌸 Manage", subtitle: "Plan the ceremony", tools: [
        { id: "invite", emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP", color: "#2563EB" },
        { id: "checklist", emoji: "📋", title: "Ceremony Checklist", desc: "Guest count → what to arrange", color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",            desc: "Split the ceremony expenses",         color: "#DC2626" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · +1 · WhatsApp", color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · who brings · status",     color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the day · live NOW tracker", color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",    color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign",       color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track spend by category", color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Caterer · DJ · deposit · balance",     color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · reminder · thank you", color: "#25D366" },
      ]},
      { id: "ceremony", label: "✨ Ceremony", subtitle: "Meaningful moments", tools: [
        { id: "namesuggestions", emoji: "🌸", title: "Name Suggestions", desc: "Family suggests names with meanings", color: "#A78BFA" },
        { id: "blessingswall", emoji: "🙏", title: "Blessings Wall", desc: "Everyone shares a blessing for the child", color: "#F59E0B" },
        { id: "countdown", emoji: "⏱️", title: "Countdown Timer", desc: "Count down to the ceremony", color: "#0891B2" },
        { id: "photowall", emoji: "📸", title: "Shared Photo Wall", desc: "Everyone captures the moment", color: "#DB2777" },
      ]},
      { id: "fun", label: "🎉 Celebration", subtitle: "After the ceremony", tools: [
        { id: "theme", emoji: "🎨", title: "Theme Picker", desc: "Vote on the decoration theme", color: "#7C3AED" },
        { id: "playlist", emoji: "🎵", title: "Playlist Builder", desc: "Music for the celebration", color: "#059669" },
        { id: "potluck", emoji: "🥘", title: "Potluck Planner", desc: "Everyone brings a dish", color: "#059669" },
      ]},
      { id: "other", label: "🏆 Other", subtitle: "Remember this day", tools: [
        { id: "reportcard", emoji: "🏆", title: "Ceremony Report Card", desc: "Rate the beautiful day", color: "#FBBF24" },
      ]},
    ],
  },
};

const OFFICE_BINGO = [
  "CEO gives a speech", "Someone leaves early", "Team wins award", "Free food runs out", "DJ plays Bollywood",
  "Group selfie chaos", "HR makes announcement", "Someone tears up", "Tech setup fails", "Award winner absent",
  "Mic drops mid-speech", "Everyone checks phone", "Epic dance floor moment", "Office crush dances", "Dessert table mobbed",
  "Lucky draw winner absent", "Manager does karaoke", "Best dressed drama", "Toast to the company", "New joiner steals show",
  "Last-minute venue issue", "Playlist gets hijacked", "Two depts argue (friendly)", "After-party plans made", "Someone mentions Q3",
];

const BIRTHDAY_BINGO = [
  "Someone cries", "Late gift", "Phone dies", "Cake drama", "Extra guests", "Too many photos", "Forgot candles", "DJ request denied",
  "Someone ghosts", "Rain surprise", "Food runs out", "Uncle speech", "Uninvited friend", "Dress drama", "Lost balloons", "Cake smash",
  "Venue too small", "Playlist argument", "Surprise guest", "Forgot lighter", "Bad backdrop", "Flight delay", "Unexpected song", "Candles won't light",
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

// ── polygon clip-path per section tool count ──────────────────────────────
const POLY_CLIP = {
  1: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",                                                                    // diamond
  2: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",                                                                    // diamond
  3: "polygon(50% 0%, 100% 100%, 0% 100%)",                                                                             // triangle
  4: "polygon(50% 0%, 100% 35%, 80% 100%, 20% 100%, 0% 35%)",                                                          // pentagon
  5: "polygon(50% 0%, 100% 35%, 80% 100%, 20% 100%, 0% 35%)",                                                          // pentagon
  6: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",                                                  // hexagon
  7: "polygon(50% 0%, 90% 15%, 100% 55%, 75% 93%, 25% 93%, 0% 55%, 10% 15%)",                                          // heptagon
};
const DEFAULT_POLY = "polygon(29% 0%, 71% 0%, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0% 71%, 0% 29%)";               // octagon
const getPolyClip = (n) => POLY_CLIP[Math.min(n, 7)] ?? DEFAULT_POLY;

// ── padding offset per polygon type so content clears clipped corners ──────
const POLY_PAD = { 3: "36% 20% 12%", 4: "14% 14% 14%", 5: "14% 14% 14%", 6: "18% 12% 18%", 7: "16% 12% 16%" };
const getPolyPad = (n) => POLY_PAD[Math.min(n, 7)] || "14% 10% 14%";

// ── Polygon vertex grid for OccasionHub ───────────────────────────────────
function OccPolygonGrid({ tools, onOpen, accent }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState(300);
  const [hovId, setHovId] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize(Math.min(entry.contentRect.width, 480));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const n = tools.length;
  const cx = size / 2;
  const cy = size / 2;
  const R  = size * 0.42;

  // n=4 → square corners (-45° start); others → top vertex (-90°)
  const startDeg = n === 4 ? -45 : -90;

  const pts = tools.map((_, i) => {
    const a = ((i * 360) / n + startDeg) * (Math.PI / 180);
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });

  // Even n → cross diameters; odd n → spokes from center
  const innerLines = n % 2 === 0
    ? Array.from({ length: n / 2 }, (_, i) => [pts[i], pts[i + n / 2]])
    : pts.map(p => [{ x: cx, y: cy }, p]);

  // Node size — smaller on mobile (container capped at 420)
  const nW = Math.min(Math.max(64, size * 0.21), 96);
  const nH = nW * 1.22;
  const iconSz = Math.max(16, nW * 0.26);
  const lblSz  = Math.max(10, nW * 0.12);

  const hovTool = tools.find(t => t.id === hovId);

  return (
    <div ref={containerRef} style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
        {/* Web SVG */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}
          viewBox={`0 0 ${size} ${size}`}>
            {/* Inner lines */}
          {innerLines.map(([a, b], i) => (
            <line key={`il${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.75" />
          ))}
          {/* Outer polygon edges */}
          {Array.from({ length: n }, (_, i) => (
            <line key={`e${i}`}
              x1={pts[i].x} y1={pts[i].y}
              x2={pts[(i + 1) % n].x} y2={pts[(i + 1) % n].y}
              stroke={`${accent}45`} strokeWidth="1" />
          ))}
          {/* Vertex dots */}
          {pts.map((p, i) => (
            <circle key={`v${i}`} cx={p.x} cy={p.y} r={2.5}
              fill={accent} opacity="0.55" />
          ))}
          {/* Center ring */}
          <circle cx={cx} cy={cy} r={5}
            fill="none" stroke={accent} strokeWidth="1.5" opacity="0.40" />
        </svg>

        {/* Tool nodes */}
        {tools.map((t, i) => {
          const p = pts[i];
          return (
            <button key={t.id} onClick={() => onOpen(t.id)}
              style={{
                position: "absolute",
                width: nW, height: nH,
                left: p.x - nW / 2, top: p.y - nH / 2,
                background: "rgba(14,11,6,0.93)",
                border: i === 0 ? `1px solid ${accent}55` : `1px solid rgba(255,255,255,0.10)`,
                borderRadius: 14,
                cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 4,
                padding: "6px 4px",
                fontFamily: font,
                transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
                boxSizing: "border-box",
                WebkitTapHighlightColor: "transparent",
                animation: `card-pop 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.06)";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = i === 0 ? `${accent}88` : "rgba(255,255,255,0.22)";
                setHovId(t.id);
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.background = "rgba(14,11,6,0.93)";
                e.currentTarget.style.borderColor = i === 0 ? `${accent}55` : "rgba(255,255,255,0.10)";
                setHovId(null);
              }}
            >
              <div style={{ color: accent, flexShrink: 0, opacity: 0.88 }}>
                {TOOL_ICONS[t.id] || occic(<><circle cx="12" cy="12" r="10"/></>, iconSz)}
              </div>
              <span style={{
                fontSize: lblSz,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.25,
                textAlign: "center",
                padding: "0 4px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                letterSpacing: "-0.01em",
              }}>{t.title}</span>
              {i === 0 && (
                <div style={{
                  position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                  fontSize: 7.5, fontWeight: 800, color: accent,
                  background: `${accent}25`, border: `1px solid ${accent}70`,
                  borderRadius: 100, padding: "2px 6px",
                  letterSpacing: "0.05em", whiteSpace: "nowrap", zIndex: 2,
                  pointerEvents: "none",
                }}>★ Start here</div>
              )}
            </button>
          );
        })}
      </div>
      {/* Hover description strip */}
      <div style={{ minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 6, transition: "opacity 0.16s", opacity: hovTool ? 1 : 0, pointerEvents: "none" }}>
        {hovTool && (
          <span style={{ background: `${accent}16`, border: `1px solid ${accent}28`, borderRadius: 100, padding: "5px 16px", fontSize: 11.5, color: "rgba(255,255,255,0.65)", fontFamily: font, fontWeight: 500, textAlign: "center" }}>
            {hovTool.desc}
          </span>
        )}
      </div>
    </div>
  );
}

// ── occasion → plan slug ──────────────────────────────────────────────────
const SLUG_FOR_OCC = {
  birthday:"birthday-party", anniversary:"anniversary", "baby-shower":"baby-shower",
  housewarming:"housewarming", "get-together":"get-together", "naming-ceremony":"naming-ceremony",
  "kitty-party":"get-together",
};

export default function OccasionHub({ occasion }) {
  const [open, setOpen]         = useState(null);
  const [hovered, setHovered]   = useState(null);
  const [glare, setGlare]       = useState({});
  const [showSplash, setShowSplash] = useState(() => {
    try { return !localStorage.getItem(`tendr-splash-${occasion}`); } catch { return true; }
  });
  const [showTour, setShowTour] = useState(() => {
    try { return !localStorage.getItem("tendr-occ-tour-v1"); } catch { return false; }
  });
  const [tourStep, setTourStep] = useState(0);
  const [splashOut, setSplashOut]   = useState(false);
  const [activeTab, setActiveTab]   = useState(0);
  const [planData, setPlanData]     = useState(null);

  // Room modal flow states
  const [roomModal, setRoomModal]   = useState(null); // "host" | "join" | "players"
  const [hostName,  setHostName]    = useState("");
  const [partyName, setPartyName]   = useState("");
  const [joinCode,  setJoinCode]    = useState("");
  const [joinName,  setJoinName]    = useState("");
  const [roomLoading, setRoomLoading] = useState(false);
  const [copied, setCopied]         = useState(false);

  const { room, connected, error: roomError, myName, createRoom, joinRoom, leaveRoom } = usePartyRoom();
  const navigate = useNavigate();

  // Load plan from localStorage
  useEffect(() => {
    const slug = SLUG_FOR_OCC[occasion] || occasion;
    try { const raw = localStorage.getItem(`tendr-plan-${slug}`); if (raw) setPlanData(JSON.parse(raw)); } catch {}
  }, [occasion]);

  // Auto-detect ?room=CODE in URL and pre-fill join modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("room");
    if (code && !room) {
      setJoinCode(code.toUpperCase());
      setRoomModal("join");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Splash fade
  useEffect(() => {
    if (!showSplash) return;
    const key = `tendr-splash-${occasion}`;
    const t1 = setTimeout(() => setSplashOut(true), 2000);
    const t2 = setTimeout(() => {
      setShowSplash(false);
      try { localStorage.setItem(key, '1'); } catch {}
    }, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const occ = OCCASIONS[occasion];
  if (!occ) return <div style={{ color: "#fff", padding: 40, textAlign: "center", fontFamily: font }}>Unknown occasion: {occasion}</div>;

  const { accent, sections } = occ;

  const handleMove = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlare(prev => ({ ...prev, [id]: { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 } }));
  };
  const handleLeave = (id) => { setHovered(null); setGlare(prev => { const n = { ...prev }; delete n[id]; return n; }); };

  const handleHostCreate = async () => {
    if (!hostName.trim()) return;
    setRoomLoading(true);
    const res = await createRoom({ occasionType: occasion, partyName: partyName.trim() || `${occ.name}`, hostName: hostName.trim() });
    setRoomLoading(false);
    if (!res.ok) alert(res.error || "Failed to create room");
    else setRoomModal("players");
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || !joinName.trim()) return;
    setRoomLoading(true);
    const res = await joinRoom({ code: joinCode.trim(), name: joinName.trim() });
    setRoomLoading(false);
    if (!res.ok) alert(res.error || "Room not found — check the code and try again.");
    else {
      setRoomModal(null);
      // Clear ?room= param from URL so refreshing doesn't re-prompt join
      const url = new URL(window.location.href);
      url.searchParams.delete("room");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const copyRoomLink = async (code) => {
    const url = `${window.location.origin}${window.location.pathname}?room=${code}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };

  const renderModal = () => {
    const close = () => setOpen(null);
    const planGuests = planData?.guests || 10;
    switch (open) {
      case "bills":          return <BillSplitter onClose={close} accent={accent} />;
      case "playlist":       return <PlaylistBuilder onClose={close} accent={accent} />;
      case "countdown":      return <Countdown onClose={close} accent={accent} />;
      case "theme":          return <ThemePicker onClose={close} accent={accent} themes={occ.themes} />;
      case "checklist":      return <Checklist onClose={close} accent={accent} initialGuests={planGuests} />;
      case "reportcard":     return <PartyReportCard onClose={close} accent={accent} />;
      case "potluck":        return <ShareableTool onClose={close} accent={accent} emoji="🥘" title="Potluck Planner" description="Create a potluck room. Share the link — friends claim what they'll bring." path="/house-party/potluck" fields={[{ key: "partyName", label: "Event Name", placeholder: "Our Get Together", required: true }, { key: "hostName", label: "Your Name", placeholder: "Priya", required: true }, { key: "items", label: "Items (comma-separated)", placeholder: "Chips, Coke, Cake, Plates", required: true }]} />;
      case "invite":         return <ShareableTool onClose={close} accent={accent} emoji="📨" title="Digital Invite & RSVP" description="Create an invite. Share the link — guests RSVP instantly." path="/house-party/invite" fields={[{ key: "partyName", label: "Event Name", placeholder: "Meera's Birthday Bash", required: true }, { key: "hostName", label: "Host Name", placeholder: "Meera", required: true }, { key: "date", label: "Date", placeholder: "19 July 2026" }, { key: "time", label: "Time", placeholder: "7:00 PM" }, { key: "location", label: "Location", placeholder: "Aman's place, Noida" }, { key: "note", label: "Note (optional)", placeholder: "Dress code: yellow!" }]} />;
      case "photowall":      return <ShareableTool onClose={close} accent={accent} emoji="📸" title="Shared Photo Wall" description="Create a photo wall. Share the link — everyone uploads their photos." path="/house-party/photo-wall" fields={[{ key: "partyName", label: "Event Name", placeholder: "Priya's Baby Shower 🎀", required: true }]} />;
      case "truthordare":    return <TruthOrDare onClose={close} accent={accent} />;
      case "neverhavei":     return <NeverHaveI onClose={close} accent={accent} />;
      case "wouldyou":       return <WouldYouRather onClose={close} accent={accent} />;
      case "hottakes":       return <HotTakes onClose={close} accent={accent} />;
      case "spin":           return <SpinBottle onClose={close} accent={accent} />;
      case "charades":       return <Charades onClose={close} accent={accent} />;
      case "bingo":          return <Bingo onClose={close} accent={accent} squares={occasion === "birthday" ? BIRTHDAY_BINGO : occasion === "office-party" ? OFFICE_BINGO : undefined} />;
      case "awardsceremony": return <AwardsCeremony onClose={close} accent={accent} />;
      case "runofshow":      return <RunOfShow onClose={close} accent={accent} />;
      case "appreciationwall": return <WishWall onClose={close} accent={accent} placeholder="Share a shoutout or appreciation for a colleague…" />;
      case "wishwall":       return <WishWall onClose={close} accent={accent} />;
      case "birthdayquiz":   return <BirthdayQuiz onClose={close} accent={accent} />;
      case "lovenotes":      return <LoveNotes onClose={close} accent={accent} />;
      case "couplequiz":     return <CoupleQuiz onClose={close} accent={accent} />;
      case "blessingswall":  return <BlessingsWall onClose={close} accent={accent} placeholder="Share your blessings and wishes for the couple…" />;
      case "babynamevote":   return <BabyNameVote onClose={close} accent={accent} />;
      case "genderpoll":     return <GenderPoll onClose={close} accent={accent} />;
      case "advicecards":    return <AdviceCards onClose={close} accent={accent} />;
      case "giftregistry":   return <GiftRegistry onClose={close} accent={accent} />;
      case "luckydraw":      return <LuckyDraw onClose={close} accent={accent} />;
      case "kittyfund":      return <KittyFund onClose={close} accent={accent} />;
      case "namesuggestions":return <NameSuggestions onClose={close} accent={accent} />;
      case "blessings":      return <BlessingsWall onClose={close} accent={accent} placeholder="Share a blessing for the child's journey ahead…" />;
      case "mostlikelyto":   return <MostLikelyTo onClose={close} accent={accent} />;
      case "t2l":            return <TwoTruthsOneLie onClose={close} accent={accent} />;
      case "rapidfire":      return <RapidFire onClose={close} accent={accent} />;
      case "moodmeter":      return <MoodMeter onClose={close} accent={accent} />;
      case "secretmessage":  return <SecretMessage onClose={close} accent={accent} />;
      case "gifttracker":    return <GiftTracker onClose={close} accent={accent} />;
      case "guestlist":      return <OccGuestListModal onClose={close} occasion={occasion} accent={accent} />;
      case "menu":           return <OccMenuPlannerModal onClose={close} occasion={occasion} accent={accent} />;
      case "daytimeline":    return <OccDayTimelineModal onClose={close} occasion={occasion} accent={accent} />;
      case "venue":          return <OccVenueNotesModal onClose={close} occasion={occasion} />;
      case "seating":        return <OccSeatingChartModal  onClose={close} occasion={occasion} accent={accent} />;
      case "budget":         return <OccBudgetPlannerModal onClose={close} occasion={occasion} accent={accent} />;
      case "vendors":        return <OccVendorTrackerModal onClose={close} occasion={occasion} accent={accent} />;
      case "wabroadcast":    return <OccWABroadcastModal   onClose={close} occasion={occasion} accent={accent} />;
      default: return null;
    }
  };

  const GAME_IDS = new Set(["truthordare","neverhavei","wouldyou","hottakes","spin","charades","bingo","luckydraw","birthdayquiz","couplequiz","genderpoll","mostlikelyto","t2l","rapidfire"]);
  const currentSection = sections[Math.min(activeTab, sections.length - 1)];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", fontFamily: font, background: "#0C0904", position: "relative", overflow: "hidden" }}>
      {/* Subtle per-occasion glow in top-right corner — not animated, not centered */}
      <div style={{ position: "fixed", top: -80, right: -60, width: 420, height: 320, borderRadius: "50%", background: `radial-gradient(ellipse at 60% 30%, ${accent}1a 0%, transparent 68%)`, pointerEvents: "none", zIndex: 0 }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');
        @keyframes splash-pulse { 0%,100% { opacity:0.8;transform:scale(1);} 50%{opacity:1;transform:scale(1.04);} }
        @keyframes splash-line { from{width:0} to{width:100%} }
        @keyframes card-pop { 0%{transform:scale(0.92) translateY(12px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
        @keyframes modal-in { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes tab-slide { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rm-in { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes dot-pulse { 0%,100%{opacity:0.4;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes card-flip { 0%{transform:rotateY(90deg) scale(0.95);opacity:0.4} 100%{transform:rotateY(0deg) scale(1);opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .occ-tool-card:active { transform: scale(0.96) !important; transition: transform 0.08s !important; }
        .occ-tab-btn { transition: background 0.16s, color 0.16s, box-shadow 0.16s; }
        textarea,input { font-family: ${font}; }
        select option { background: #110d07; color: #fff; }
        ::-webkit-scrollbar { display: none; }
        @media (max-width: 600px) {
          .occ-h1 { font-size: 1.5rem !important; }
          .occ-tab-label { font-size: 9px !important; }
          .occ-scroll-area { padding: 4px 8px calc(80px + env(safe-area-inset-bottom, 0px)) !important; }
          .occ-tab-btn { padding: 7px 4px 5px !important; min-width: 56px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .occ-tab-btn { transition: none !important; }
        }
      `}</style>

      {/* Splash */}
      {showSplash && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: `radial-gradient(ellipse at 30% 40%, ${accent}28 0%, #0C0904 60%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: splashOut ? 0 : 1, transition: "opacity 0.55s cubic-bezier(0.4,0,0.2,1)", pointerEvents: splashOut ? "none" : "all" }}>
          <div style={{ textAlign: "center", padding: "0 32px" }}>
            <div style={{ fontSize: 72, marginBottom: 18, animation: "splash-pulse 1.8s ease-in-out infinite", filter: `drop-shadow(0 0 28px ${accent}90)` }}>{occ.emoji}</div>
            <div style={{ fontSize: "clamp(1.7rem,5vw,2.5rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 10 }}>
              Let's make it<br/><span style={{ color: accent }}>a party.</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>{occ.tagline}</div>
            <div style={{ width: 180, height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", margin: "0 auto" }}>
              <div style={{ height: "100%", background: accent, animation: "splash-line 2s ease-out both" }} />
            </div>
          </div>
        </div>
      )}

      {/* First-time tour — shown once after splash clears */}
      {showTour && !showSplash && (() => {
        const steps = [
          { icon: "👆", title: "Tap any tool", body: "Each node opens a planner — guest list, budget, timeline and more." },
          { icon: "📑", title: "Switch sections", body: "Use the tabs above to move between Manage, Fun and Games." },
          { icon: "🎮", title: "Play together", body: "Hit Host or Join to start a live room and play games with your group." },
        ];
        const step = steps[tourStep];
        const dismissTour = () => {
          setShowTour(false);
          try { localStorage.setItem("tendr-occ-tour-v1", "1"); } catch {}
        };
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 4000, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 40px" }}>
            <div style={{ background: "#130f08", border: `1.5px solid ${accent}35`, borderRadius: 24, padding: "28px 24px 24px", maxWidth: 360, width: "calc(100% - 32px)", animation: "rm-in 0.28s cubic-bezier(0.22,1,0.36,1)" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>{step.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8, fontFamily: font }}>{step.title}</div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontFamily: font }}>{step.body}</div>
              </div>
              {/* Step dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
                {steps.map((_, i) => (
                  <div key={i} style={{ width: i === tourStep ? 18 : 6, height: 6, borderRadius: 3, background: i === tourStep ? accent : `${accent}35`, transition: "width 0.2s, background 0.2s" }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {tourStep < steps.length - 1 ? (
                  <>
                    <button onClick={dismissTour} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Skip</button>
                    <button onClick={() => setTourStep(s => s + 1)} style={{ flex: 2, padding: "11px 0", borderRadius: 12, border: "none", background: accent, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>Next →</button>
                  </>
                ) : (
                  <button onClick={dismissTour} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: accent, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font }}>Got it 🎉</button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Room setup modals */}
      {roomModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 5000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => { setRoomModal(null); setRoomLoading(false); }}>
          <div style={{ background: "#110d07", border: `1.5px solid ${accent}44`, borderRadius: 24, padding: "28px 24px", maxWidth: 360, width: "100%", boxShadow: `0 36px 80px rgba(0,0,0,0.6)`, animation: "rm-in 0.25s cubic-bezier(0.22,1,0.36,1)" }} onClick={e => e.stopPropagation()}>

            {roomModal === "host-setup" && (<>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🏠</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Host a Room</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Your guests join with the room code</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Your Name</div>
                <input value={hostName} onChange={e => setHostName(e.target.value)} placeholder="e.g. Priya" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${accent}33`, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Party Name <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, textTransform: "none" }}>(optional)</span></div>
                <input value={partyName} onChange={e => setPartyName(e.target.value)} placeholder={`e.g. ${occ.name}`} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${accent}33`, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={handleHostCreate} disabled={!hostName.trim() || roomLoading} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: hostName.trim() ? accent : "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: hostName.trim() ? "pointer" : "not-allowed", opacity: hostName.trim() ? 1 : 0.5, marginBottom: 10 }}>
                {roomLoading ? "Creating…" : "Create Room →"}
              </button>
              <button onClick={() => setRoomModal(null)} style={{ width: "100%", padding: "10px 0", border: "none", background: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </>)}

            {roomModal === "players" && room && (<>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 30, marginBottom: 6 }}>🎉</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Room Created!</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Share the code with your guests</div>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: accent + "1a", border: `1px solid ${accent}55`, borderRadius: 14, padding: "12px 24px", marginBottom: 14 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: accent, letterSpacing: "0.2em", fontFamily: "monospace" }}>{room.code}</span>
                </div>
              </div>
              <button onClick={() => copyRoomLink(room.code)} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: `1.5px solid ${copied ? accent : "rgba(255,255,255,0.14)"}`, background: copied ? accent + "20" : "rgba(255,255,255,0.05)", color: copied ? accent : "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12, transition: "all 0.18s" }}>
                {copied ? "✓ Link Copied!" : "📋 Copy Room Link"}
              </button>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Players ({room.players?.length || 1})</div>
                {(room.players || [myName]).map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8, marginBottom: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "dot-pulse 2s ease-in-out infinite", animationDelay: `${i * 0.3}s` }} />
                    <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{p}{p === myName ? " (you)" : ""}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setRoomModal(null)} style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: accent, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Let's Play →</button>
            </>)}

            {roomModal === "join" && (<>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔗</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Join a Room</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                  {joinCode ? "You were invited — just enter your name!" : "Enter the code your host shared"}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Room Code</div>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))} placeholder="ABC123" maxLength={6} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${accent}44`, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 24, fontWeight: 900, textAlign: "center", letterSpacing: "0.22em", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: 0 }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Your Name</div>
                <input value={joinName} onChange={e => setJoinName(e.target.value)} placeholder="e.g. Rahul" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${accent}33`, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={handleJoin} disabled={joinCode.length < 6 || !joinName.trim() || roomLoading} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: (joinCode.length >= 6 && joinName.trim()) ? accent : "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: (joinCode.length >= 6 && joinName.trim()) ? "pointer" : "not-allowed", opacity: (joinCode.length >= 6 && joinName.trim()) ? 1 : 0.5, marginBottom: 10 }}>
                {roomLoading ? "Joining…" : "Join Room →"}
              </button>
              <button onClick={() => setRoomModal(null)} style={{ width: "100%", padding: "10px 0", border: "none", background: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </>)}
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div style={{ flexShrink: 0, padding: "14px 16px 0", display: "flex", alignItems: "center", gap: 10, maxWidth: 800, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)", padding: "7px 14px", borderRadius: 100, cursor: "pointer", fontSize: 12, fontFamily: font, fontWeight: 600, flexShrink: 0 }}>← Back</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{occ.emoji} {occ.name}</div>
          {room && <div style={{ fontSize: 11, color: accent, fontWeight: 700, marginTop: 1 }}>Room: <span style={{ fontFamily: "monospace", letterSpacing: "0.1em" }}>{room.code}</span> · {room.players?.length || 1} player{(room.players?.length || 1) !== 1 ? "s" : ""}</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {room ? (
              <>
                <button onClick={() => setRoomModal("players")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 100, border: `1.5px solid ${accent}55`, background: accent + "1a", color: accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />{room.code}
                </button>
                <button onClick={leaveRoom} style={{ padding: "7px 12px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Leave</button>
              </>
            ) : (
              <>
                <button onClick={() => setRoomModal("host-setup")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, border: `1.5px solid ${accent}55`, background: accent + "18", color: accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Host
                </button>
                <button onClick={() => setRoomModal("join")} style={{ padding: "7px 14px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Join</button>
              </>
            )}
          </div>
          {!room && <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", fontFamily: font, letterSpacing: "0.02em" }}>Play games with your group</div>}
        </div>
      </div>

      {/* Plan banner + Live room — merged into one compact strip */}
      {(planData || room) && (
        <div style={{ flexShrink: 0, maxWidth: 800, margin: "8px auto 0", padding: "0 16px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: room ? `linear-gradient(90deg, ${accent}14, rgba(255,255,255,0.03))` : "rgba(255,255,255,0.04)", border: `1px solid ${room ? accent + "35" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "7px 12px", flexWrap: "wrap" }}>
            {room && <>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 6px #4ADE80", flexShrink: 0, animation: "dot-pulse 2s ease infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: accent, fontFamily: "monospace", letterSpacing: "0.15em" }}>{room.code}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>· {room.players?.length || 1} online</span>
              <button onClick={() => copyRoomLink(room.code)} style={{ padding: "3px 10px", borderRadius: 100, border: `1px solid ${accent}45`, background: accent + "18", color: accent, fontSize: 10.5, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", marginLeft: "auto" }}>
                {copied ? "✓ Copied" : "Share"}
              </button>
            </>}
            {planData && !room && <>
              <span style={{ fontSize: 13 }}>📋</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", flex: 1 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{planData.guests} guests</strong>
                {planData.date ? ` · ${new Date(planData.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                {planData.city ? ` · ${planData.city}` : ""}
              </span>
            </>}
          </div>
        </div>
      )}

      {/* ── Section Tabs ── */}
      <div style={{ flexShrink: 0, maxWidth: 800, margin: "10px auto 0", padding: "0 16px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 4 }}>
          {sections.map((sec, i) => {
            const active = activeTab === i;
            const label = sec.label.replace(/^\S+\s*/, "").trim() || sec.label;
            return (
              <button key={sec.id} className="occ-tab-btn" onClick={() => setActiveTab(i)} style={{
                flex: 1, padding: "8px 4px", border: "none",
                background: active ? accent : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.38)",
                fontSize: 10, fontWeight: active ? 800 : 600, cursor: "pointer", fontFamily: font,
                textTransform: "uppercase", letterSpacing: "0.04em",
                borderRadius: 10,
                boxShadow: "none",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              }}>
                <div style={{ color: active ? "#fff" : "rgba(255,255,255,0.4)" }}>{SECTION_ICONS[sec.id] || defaultSecIcon}</div>
                <div className="occ-tab-label" style={{ letterSpacing: "0.05em" }}>{label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tool grid — polygon vertex layout ── */}
      <div className="occ-scroll-area" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 12px 32px", maxWidth: 800, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* Section subtitle */}
        <div style={{ width: "100%", marginBottom: 8, animation: "tab-slide 0.28s cubic-bezier(0.22,1,0.36,1)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.42)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{currentSection?.subtitle}</div>
        </div>

        {currentSection?.tools.length >= 3 ? (
          <OccPolygonGrid
            key={activeTab}
            tools={currentSection.tools}
            onOpen={setOpen}
            accent={accent}
          />
        ) : (
          /* 1–2 tools: simple centered row */
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", width: "100%", animation: "tab-slide 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
            {currentSection?.tools.map((t) => {
              const isH = hovered === t.id;
              return (
                <div key={t.id}
                  onClick={() => setOpen(t.id)}
                  onMouseEnter={() => setHovered(t.id)}
                  onMouseLeave={() => handleLeave(t.id)}
                  style={{
                    width: 140, background: isH ? `${accent}18` : "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${isH ? accent + "66" : accent + "25"}`,
                    borderRadius: 18, padding: "22px 14px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                    transition: "all 0.18s", transform: isH ? "translateY(-3px)" : "none",
                  }}>
                  <div style={{ color: accent }}>{TOOL_ICONS[t.id] || occic(<><circle cx="12" cy="12" r="10"/></>)}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", textAlign: "center" }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>{t.desc}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {renderModal()}
    </div>
  );
}

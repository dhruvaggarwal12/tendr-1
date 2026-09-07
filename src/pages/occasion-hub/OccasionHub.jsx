import { useState, useEffect, useRef, useCallback } from "react";
import { usePartyRoom } from "../../hooks/usePartyRoom";
import { useNavigate } from "react-router-dom";
import { TRUTHS, DARES, NEVER_HAVE_I, WOULD_YOU_RATHER, CHARADES, HOT_TAKES, BINGO_SQUARES } from "../../data/housePartyData";
import DesignerWall from "../../components/DesignerWall";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function copyLink(text) { navigator.clipboard?.writeText(text).catch(() => {}); }

// Canvas helpers for polaroid download
function _wrapCanvasText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, curY); line = word; curY += lh; }
    else { line = test; }
  }
  if (line) ctx.fillText(line, x, curY);
}
function downloadPolaroid(wish) {
  const W = 300, H = 370, S = 2;
  const cv = document.createElement('canvas');
  cv.width = W * S; cv.height = H * S;
  const ctx = cv.getContext('2d');
  ctx.scale(S, S);
  ctx.fillStyle = '#FFFEF9'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#ececec'; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  const g = ctx.createLinearGradient(14, 14, W - 14, 195);
  g.addColorStop(0, (wish.color || '#8B5CF6') + 'ee'); g.addColorStop(1, wish.color || '#8B5CF6');
  ctx.fillStyle = g; ctx.fillRect(14, 14, W - 28, 190);
  ctx.font = '70px serif'; ctx.textAlign = 'center'; ctx.fillText(wish.emoji || '🎉', W / 2, 125);
  ctx.fillStyle = '#1a1a1a'; ctx.font = 'italic 13px Georgia, serif';
  _wrapCanvasText(ctx, '“' + wish.text + '”', W / 2, 228, W - 50, 18);
  ctx.fillStyle = '#999'; ctx.font = '11px Arial, sans-serif';
  ctx.fillText('— ' + wish.name, W / 2, H - 22);
  cv.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'wish-' + (wish.name || 'anon').replace(/\s+/g, '-').toLowerCase() + '.png';
    a.click();
  }, 'image/png');
}

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
          {/* Receipt visual */}
          <div style={{background:"#FFFBEB",borderRadius:12,padding:"20px 18px",marginBottom:14,boxShadow:"0 4px 20px rgba(0,0,0,0.3)",fontFamily:"'Courier New',monospace"}}>
            <div style={{textAlign:"center",paddingBottom:12,marginBottom:12,borderBottom:"1px dashed rgba(0,0,0,0.15)"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.2em",marginBottom:2}}>Bill Split Receipt</div>
              <div style={{fontSize:18,fontWeight:900,color:"#111827"}}>🎉 Party Night</div>
              <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>{people.join(" · ")}</div>
            </div>
            {expenses.map((e,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#374151",marginBottom:5}}>
                <span>{e.paidBy} — {e.desc}</span>
                <span style={{fontWeight:700}}>₹{e.amount}</span>
              </div>
            ))}
            <div style={{borderTop:"1px dashed rgba(0,0,0,0.15)",marginTop:12,paddingTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6B7280",marginBottom:4}}>
                <span>÷ {people.length} people</span>
                <span>₹{Math.round(share)} each</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:17,fontWeight:900,color:"#111827",borderTop:"2px solid #111827",paddingTop:8,marginTop:4}}>
                <span>TOTAL</span><span>₹{total}</span>
              </div>
            </div>
          </div>
          {txns.length===0?<div style={{textAlign:"center",color:"#34D399",padding:20,fontSize:18}}>✅ All settled!</div>:txns.map((t,i)=>(
            <div key={i} style={{background:"#FFFBEB",borderRadius:10,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)",fontFamily:"'Courier New',monospace"}}>
              <div style={{fontSize:13,color:"#374151"}}>
                <span style={{fontWeight:700,color:"#DC2626"}}>{t.from}</span>
                <span style={{color:"#9CA3AF",margin:"0 8px"}}>pays</span>
                <span style={{fontWeight:700,color:"#16A34A"}}>{t.to}</span>
              </div>
              <span style={{fontWeight:900,color:"#111827",fontSize:15}}>₹{t.amount}</span>
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
    setSongs(s=>[...s,{song:newSong.trim(),artist:newArtist.trim(),by:addedBy.trim()||"Anonymous",votes:0,id:Date.now()}]);
    setNewSong("");setNewArtist("");
  };
  const upvote = (id)=>setSongs(s=>[...s.map(x=>x.id===id?{...x,votes:x.votes+1}:x)].sort((a,b)=>b.votes-a.votes));
  const playlistText = songs.map((s,i)=>`${i+1}. ${s.song}${s.artist?` — ${s.artist}`:""}`).join("\n");
  // Cassette tape label themes
  const THEMES = [
    {case:'#1a1a2e',label:'#E94560',text:'#fff'},
    {case:'#16213e',label:'#0F3460',text:'#D0E8FF'},
    {case:'#1b1b2f',label:'#EA1179',text:'#fff'},
    {case:'#162032',label:'#1B6CA8',text:'#fff'},
    {case:'#1e1e30',label:'#7B2FBE',text:'#EDE0FF'},
    {case:'#1f1a10',label:'#B7791F',text:'#FFF8E1'},
  ];
  return (
    <Modal onClose={onClose} emoji="🎵" title="Playlist Builder" wide>
      <p style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:14}}>Everyone adds their song · upvote your favourites!</p>
      <input value={addedBy} onChange={e=>setAddedBy(e.target.value)} placeholder="Your name" style={{...inp,marginBottom:8}}/>
      <input value={newSong} onChange={e=>setNewSong(e.target.value)} placeholder="Song name" style={{...inp,marginBottom:8}}/>
      <input value={newArtist} onChange={e=>setNewArtist(e.target.value)} placeholder="Artist (optional)" style={{...inp,marginBottom:10}} onKeyDown={e=>e.key==="Enter"&&add()}/>
      <button onClick={add} style={{...mkBtn(accent),marginBottom:16}}>+ Add Track</button>
      {songs.length===0&&<p style={{textAlign:'center',color:'rgba(255,255,255,0.25)',fontSize:13}}>No tracks yet — drop the first one!</p>}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {songs.map((s,i)=>{
          const T=THEMES[i%THEMES.length];
          return (
            <div key={s.id} style={{background:T.case,borderRadius:10,padding:'10px 12px',border:'1.5px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:10,position:'relative',overflow:'hidden'}}>
              {/* Cassette reels */}
              <div style={{display:'flex',gap:5,flexShrink:0}}>
                {[0,1].map(j=>(
                  <div key={j} style={{width:24,height:24,borderRadius:'50%',border:'2.5px solid rgba(255,255,255,0.14)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',background:T.case}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:'rgba(255,255,255,0.18)'}}/>
                    {[0,60,120].map(deg=>(
                      <div key={deg} aria-hidden style={{position:'absolute',width:'1px',height:'8px',background:'rgba(255,255,255,0.1)',top:'50%',left:'50%',transformOrigin:'0 0',transform:`rotate(${deg}deg) translate(-50%,-50%)`}}/>
                    ))}
                  </div>
                ))}
              </div>
              {/* Cassette label */}
              <div style={{flex:1,background:T.label,borderRadius:5,padding:'6px 10px',minWidth:0}}>
                <div style={{fontWeight:800,color:T.text,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.song}</div>
                <div style={{fontSize:10,color:T.text,opacity:0.6,marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.artist||'Unknown Artist'} · by {s.by}</div>
              </div>
              {/* Rank */}
              <div style={{width:22,height:22,borderRadius:5,background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.38)',fontWeight:900,fontSize:9.5,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>#{i+1}</div>
              {/* Upvote */}
              <button onClick={()=>upvote(s.id)} style={{background:s.votes>0?accent+'30':'rgba(255,255,255,0.07)',border:`1.5px solid ${s.votes>0?accent+'55':'rgba(255,255,255,0.1)'}`,borderRadius:8,padding:'6px 10px',cursor:'pointer',color:s.votes>0?accent:'rgba(255,255,255,0.4)',fontSize:12,fontWeight:800,flexShrink:0,fontFamily:font,transition:'all 0.15s'}}>▲ {s.votes}</button>
              <span onClick={()=>setSongs(ss=>ss.filter(x=>x.id!==s.id))} style={{cursor:'pointer',opacity:0.3,fontSize:13,padding:4,flexShrink:0}}>✕</span>
            </div>
          );
        })}
      </div>
      {songs.length>0&&(
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <button onClick={()=>copyLink(playlistText)} style={{...mkBtn("rgba(255,255,255,0.08)"),flex:1}}>📋 Copy List</button>
          <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent("🎵 *Tonight's Playlist*\n\n"+playlistText)}`,"_blank")} style={{...mkBtn("#25D366"),flex:1}}>📤 WhatsApp</button>
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
  // Flip-clock digit pair
  const FlipDigit = ({ val }) => (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", gap: 2 }}>
      {/* Top half */}
      <div style={{ background: "#1a1a2e", borderRadius: "8px 8px 0 0", padding: "12px 18px 6px", fontSize: 40, fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1, fontFamily: "monospace", borderBottom: "1px solid rgba(0,0,0,0.4)" }}>
        {val}
      </div>
      {/* Bottom half */}
      <div style={{ background: "#15152a", borderRadius: "0 0 8px 8px", padding: "6px 18px 12px", fontSize: 40, fontWeight: 900, color: "rgba(255,255,255,0.7)", fontVariantNumeric: "tabular-nums", lineHeight: 1, fontFamily: "monospace" }}>
        {val}
      </div>
      {/* Hinge line */}
      <div aria-hidden style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "2px", background: "rgba(0,0,0,0.6)", zIndex: 2 }} />
    </div>
  );
  return (
    <Modal onClose={onClose} emoji="⏱️" title="Countdown Timer">
      {!started ? <>
        <label style={lbl}>What are you counting down to?</label>
        <input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. Cake cutting! 🎂" style={{ ...inp, marginBottom: 12 }} />
        <label style={lbl}>Date & Time</label>
        <input type="datetime-local" value={target} onChange={e => setTarget(e.target.value)} style={{ ...inp, marginBottom: 16 }} />
        <button onClick={start} disabled={!target} style={{ ...mkBtn(accent), opacity: target ? 1 : 0.5 }}>Start Countdown ⏱️</button>
      </> : (
        <div style={{ textAlign: "center" }}>
          {eventName && <div style={{ fontSize: 15, fontWeight: 800, color: accent, marginBottom: 20, letterSpacing: "0.01em" }}>{eventName}</div>}
          {timeLeft ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 24, alignItems: "flex-end" }}>
              {units.map(({ v, l },i) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <FlipDigit val={pad(v)} />
                  <div style={{ fontSize: 10, color: l === "sec" ? accent : "rgba(255,255,255,0.4)", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{l}</div>
                  {i < units.length - 1 && <span style={{ fontSize: 28, fontWeight: 900, color: "rgba(255,255,255,0.25)", position: "relative", top: -30, margin: "0 -2px" }}>:</span>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 72, marginBottom: 14, animation: "splash-pulse 1s ease-in-out infinite" }}>🎉</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#FBBF24" }}>It's time!</div>
            </div>
          )}
          <button onClick={() => { setStarted(false); setTimeLeft(null); clearInterval(ref.current); }} style={{ ...mkBtn("rgba(255,255,255,0.1)") }}>↺ Reset</button>
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
  const TMOOD_PALETTES = [
    ["#FF6B6B","#FFE66D"],["#4ECDC4","#44CF6C"],["#A855F7","#EC4899"],
    ["#F97316","#EF4444"],["#3B82F6","#06B6D4"],["#10B981","#84CC16"],
    ["#8B5CF6","#3B82F6"],["#F59E0B","#DC2626"],
  ];
  const TMOOD_EMOJI = [
    ["✨","🌙","💃"],["🌊","🎭","🌿"],["💜","🌸","⚡"],["🔥","🎸","🎤"],
    ["🌌","🎆","🔮"],["🌿","🍃","🌙"],["💫","🎠","🌈"],["🎯","🎲","👑"],
  ];
  if (showWinner && winner) {
    const wi = Math.max(0, themes.indexOf(winner));
    const [wc1, wc2] = TMOOD_PALETTES[wi % TMOOD_PALETTES.length];
    const wEmojis = TMOOD_EMOJI[wi % TMOOD_EMOJI.length];
    return (
      <Modal onClose={onClose} emoji="🎨" title="Theme Picked!">
        <div style={{textAlign:"center",padding:"8px 0 12px"}}>
          <div style={{background:`linear-gradient(145deg,${wc1},${wc2})`,borderRadius:20,padding:"36px 24px",marginBottom:20,boxShadow:`0 16px 48px ${wc1}55`,position:"relative",overflow:"hidden"}}>
            <div aria-hidden style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.1)",borderRadius:20,pointerEvents:"none"}}/>
            <div style={{fontSize:36,marginBottom:14,letterSpacing:"6px",position:"relative"}}>{wEmojis.join("")}</div>
            <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.75)",textTransform:"uppercase",letterSpacing:"0.18em",marginBottom:10,position:"relative"}}>Tonight's Theme</div>
            <div style={{fontSize:28,fontWeight:900,color:"#fff",lineHeight:1.2,textShadow:"0 2px 12px rgba(0,0,0,0.3)",position:"relative"}}>{winner}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:10,position:"relative"}}>{votes[winner]||0} vote{(votes[winner]||0)!==1?"s":""} · {totalVotes} total</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowWinner(false)} style={{...mkBtn("rgba(255,255,255,0.08)"),flex:1}}>← Back</button>
            <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(`🎨 Tonight's party theme: *${winner}*! 🎉`)}`,"_blank")} style={{...mkBtn("#25D366"),flex:1}}>📤 Share</button>
          </div>
        </div>
      </Modal>
    );
  }
  return (
    <Modal onClose={onClose} emoji="🎨" title="Theme Picker">
      <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:16}}>Pass the phone — everyone votes once!</p>
      {/* Mood board grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {themes.map((t,i)=>{
          const [c1,c2]=TMOOD_PALETTES[i%TMOOD_PALETTES.length];
          const emojis=TMOOD_EMOJI[i%TMOOD_EMOJI.length];
          const isVoted=myVote===t, isLeading=winner===t&&totalVotes>0;
          const voteCount=votes[t]||0;
          return (
            <div key={t} onClick={()=>vote(t)} style={{
              borderRadius:16,padding:"20px 14px 14px",textAlign:"center",
              background:isVoted?`linear-gradient(145deg,${c1},${c2})`:`linear-gradient(145deg,${c1}22,${c2}0f)`,
              border:`2px solid ${isVoted?c1+"aa":isLeading?c1+"55":"rgba(255,255,255,0.1)"}`,
              cursor:"pointer",transition:"all 0.3s",
              transform:isVoted?"scale(1.04)":"scale(1)",
              boxShadow:isVoted?`0 10px 36px ${c1}55`:undefined,
              position:"relative",overflow:"hidden",
            }}>
              <div style={{fontSize:26,marginBottom:6,letterSpacing:"4px"}}>{emojis.join("")}</div>
              <div style={{fontSize:12,fontWeight:isVoted?800:600,color:"#fff",lineHeight:1.35,marginBottom:voteCount>0?6:0}}>{t}</div>
              {voteCount>0&&<div style={{display:"inline-block",background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#fff"}}>{voteCount} ✓</div>}
              {isLeading&&totalVotes>=2&&!isVoted&&<span style={{position:"absolute",top:8,left:8,fontSize:8,fontWeight:800,color:c1,background:c1+"28",borderRadius:5,padding:"2px 6px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Leading</span>}
              {isVoted&&<div style={{position:"absolute",top:8,right:8,width:20,height:20,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff"}}>✓</div>}
            </div>
          );
        })}
      </div>
      {totalVotes>=2&&<button onClick={()=>setShowWinner(true)} style={{...mkBtn(accent),marginTop:4}}>🏆 Reveal Tonight's Theme</button>}
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
      {/* Ruled notebook paper items */}
      {[...items, ...(custom.length>0?[{cat:"Custom",things:custom}]:[])].map(({cat,things})=>(
        <div key={cat} style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
            <div style={{height:1.5,width:10,background:accent+"66",borderRadius:2}}/>
            <span style={{fontSize:10,fontWeight:800,color:accent,textTransform:"uppercase",letterSpacing:"0.1em"}}>{cat}</span>
            <div style={{height:1.5,flex:1,background:accent+"22",borderRadius:2}}/>
          </div>
          <div style={{background:"#FFFBEB",borderRadius:10,overflow:"hidden",boxShadow:"0 3px 10px rgba(0,0,0,0.22)",position:"relative"}}>
            <div style={{position:"absolute",left:38,top:0,bottom:0,width:1.5,background:"rgba(239,68,68,0.3)",pointerEvents:"none",zIndex:0}}/>
            {things.map(({name,qty},idx)=>(
              <div key={name} onClick={()=>toggle(name)} style={{
                display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"9px 14px 9px 52px",cursor:"pointer",
                borderBottom:idx<things.length-1?"1px solid rgba(0,0,0,0.07)":undefined,
                background:checked[name]?"rgba(22,163,74,0.07)":"transparent",
                transition:"background 0.15s",position:"relative",zIndex:1,
              }}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:16,height:16,borderRadius:3,border:`2px solid ${checked[name]?"#16A34A":"rgba(0,0,0,0.22)"}`,background:checked[name]?"#16A34A":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                    {checked[name]&&<span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>}
                  </div>
                  <span style={{color:checked[name]?"rgba(0,0,0,0.28)":"#1a1a1a",fontSize:13,textDecoration:checked[name]?"line-through":"none",fontFamily:"Georgia,serif"}}>{name}</span>
                </div>
                <span style={{color:checked[name]?"rgba(0,0,0,0.2)":"#374151",fontSize:12,fontWeight:700,fontFamily:"'Courier New',monospace"}}>{qty}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
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
      </> : (() => {
        const gFromStars = n => n>=5?"A+":n>=4?"A":n>=3?"B":n>=2?"C":"D";
        const gClr = g => g==="A+"||g==="A"?"#16A34A":g==="B"?"#2563EB":g==="C"?"#D97706":"#DC2626";
        return (<>
          {/* Printed school report card */}
          <div style={{background:"#FFFBEB",borderRadius:16,padding:"24px 20px 20px",border:"1px solid #E5E7EB",boxShadow:"0 6px 28px rgba(0,0,0,0.35)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",left:44,top:0,bottom:0,width:1.5,background:"#EF4444",opacity:0.35}}/>
            <div style={{textAlign:"center",marginBottom:14,paddingBottom:12,borderBottom:"1.5px solid #E5E7EB"}}>
              <div style={{fontSize:9,fontWeight:800,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:2}}>Official Party Report Card</div>
              <div style={{fontSize:22,fontWeight:900,color:"#111827",letterSpacing:"-0.03em",fontFamily:"Georgia,serif"}}>Party Night</div>
              <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <div style={{textAlign:"center",border:`2.5px solid ${gClr(grade)}`,borderRadius:8,padding:"6px 16px",background:gClr(grade)+"14"}}>
                <div style={{fontSize:8,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.1em"}}>Overall</div>
                <div style={{fontSize:34,fontWeight:900,color:gClr(grade),lineHeight:1,fontFamily:"Georgia,serif"}}>{grade}</div>
              </div>
            </div>
            {cats.map(({key,label,emoji})=>{
              const cg=gFromStars(ratings[key]),cc=gClr(cg);
              return (
                <div key={key} style={{display:"flex",alignItems:"center",paddingLeft:54,paddingRight:4,paddingTop:8,paddingBottom:8,borderBottom:"1px dashed #E5E7EB"}}>
                  <span style={{fontSize:13,flex:1,color:"#374151",fontWeight:500}}>{emoji} {label}</span>
                  <div style={{display:"flex",gap:3,marginRight:10}}>
                    {[1,2,3,4,5].map(n=>(
                      <div key={n} style={{width:7,height:7,borderRadius:"50%",background:ratings[key]>=n?cc:"#E5E7EB"}}/>
                    ))}
                  </div>
                  <span style={{fontSize:15,fontWeight:900,color:cc,minWidth:22,textAlign:"right",fontFamily:"Georgia,serif"}}>{cg}</span>
                </div>
              );
            })}
            <div style={{marginTop:14,paddingTop:12,borderTop:"1.5px solid #E5E7EB"}}>
              <div style={{fontSize:12,color:"#374151",fontStyle:"italic",marginBottom:14}}>Remarks: "{verdict}" — Avg {avg}/5.0</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div style={{width:110,borderTop:"1px solid #D1D5DB",paddingTop:4,textAlign:"center",fontSize:10,color:"#9CA3AF"}}>Host's Signature</div>
                <div style={{width:80,borderTop:"1px solid #D1D5DB",paddingTop:4,textAlign:"center",fontSize:10,color:"#9CA3AF"}}>Stamped ✓</div>
              </div>
            </div>
          </div>
          <button onClick={()=>{setDone(false);setRatings(init);}} style={{...mkBtn("rgba(255,255,255,0.1)"),marginTop:14}}>Rate Again</button>
        </>
        );
      })()}
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
      {current&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:accent}}>{current}'s turn</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Round {totalDone+1}</div>
      </div>}
      {/* Physical playing card */}
      <div style={{
        background:mode==="truth"?"linear-gradient(145deg,#1E3A8A,#1D4ED8)":"linear-gradient(145deg,#7F1D1D,#DC2626)",
        borderRadius:24,padding:"38px 24px 32px",textAlign:"center",marginBottom:18,
        border:`1.5px solid ${mode==="truth"?"rgba(96,165,250,0.3)":"rgba(248,113,113,0.3)"}`,
        boxShadow:`0 14px 50px ${mode==="truth"?"rgba(29,78,216,0.5)":"rgba(220,38,38,0.5)"},inset 0 1px 0 rgba(255,255,255,0.1)`,
        animation:flipping?"card-flip 0.35s ease-out":"none",
        position:"relative",overflow:"hidden",
      }}>
        <div aria-hidden style={{position:"absolute",top:12,left:14,fontSize:24,opacity:0.18,pointerEvents:"none"}}>{mode==="truth"?"🤔":"🔥"}</div>
        <div aria-hidden style={{position:"absolute",top:12,right:14,fontSize:24,opacity:0.18,pointerEvents:"none"}}>{mode==="truth"?"🤔":"🔥"}</div>
        <div aria-hidden style={{position:"absolute",bottom:12,left:14,fontSize:24,opacity:0.18,transform:"rotate(180deg)",pointerEvents:"none"}}>{mode==="truth"?"🤔":"🔥"}</div>
        <div aria-hidden style={{position:"absolute",bottom:12,right:14,fontSize:24,opacity:0.18,transform:"rotate(180deg)",pointerEvents:"none"}}>{mode==="truth"?"🤔":"🔥"}</div>
        <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.5)",marginBottom:18,textTransform:"uppercase",letterSpacing:"0.2em",position:"relative"}}>
          {mode==="truth"?"— T R U T H —":"— D A R E —"}
        </div>
        <div style={{fontSize:17,color:"#fff",lineHeight:1.78,fontWeight:500,position:"relative"}}>{card}</div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={done} style={{...mkBtn("#059669"),flex:2,fontSize:14}}>✓ Done</button>
        <button onClick={skip} style={{...mkBtn("rgba(255,255,255,0.08)"),flex:1,fontSize:13}}>Skip</button>
        <button onClick={()=>pickMode(mode==="truth"?"dare":"truth")} style={{...mkBtn(mode==="truth"?"#DC2626aa":"#1D4ED8aa"),flex:1,fontSize:13}}>{mode==="truth"?"🔥":"🤔"}</button>
      </div>
      {Object.keys(completedBy).length>0&&(
        <div style={{marginTop:14,display:"flex",flexWrap:"wrap",gap:6}}>
          {Object.entries(completedBy).sort(([,a],[,b])=>b-a).map(([p,c])=>(
            <span key={p} style={{background:"#059669"+"22",color:"#34D399",padding:"4px 10px",borderRadius:10,fontSize:12,fontWeight:700}}>✓ {p} {c>1?`×${c}`:""}</span>
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
  const [roundHave, setRoundHave] = useState({});
  const [revealed, setRevealed] = useState(false);

  const add = () => { if (newP.trim() && !players.includes(newP.trim())) { setPlayers(p => [...p, newP.trim()]); setNewP(""); } };
  const toggleHave = (name) => { if (!revealed) setRoundHave(r => ({ ...r, [name]: !r[name] })); };
  const reveal = () => {
    setRevealed(true);
    Object.entries(roundHave).forEach(([name, has]) => { if (has) setScores(s => ({ ...s, [name]: (s[name] || 0) + 1 })); });
  };
  const next = () => { setIdx(i => (i + 1) % NEVER_HAVE_I.length); setRoundHave({}); setRevealed(false); };

  const tablePositions = (count) => {
    const r = 88;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * 2 * Math.PI - Math.PI / 2;
      return { x: 50 + Math.cos(a) * (r * 0.9), y: 50 + Math.sin(a) * r * 0.72 };
    });
  };

  if (players.length < 2) return (
    <Modal onClose={onClose} emoji="🙅" title="Never Have I Ever">
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 14, fontSize: 13, textAlign: "center" }}>Sit in a circle — add everyone playing</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={newP} onChange={e => setNewP(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Player name" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {players.map(p => <span key={p} style={{ background: `${accent}22`, border: `1px solid ${accent}55`, color: accent, padding: "5px 12px", borderRadius: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{p} <span onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ cursor: "pointer", opacity: 0.5 }}>✕</span></span>)}
      </div>
      {players.length >= 2 && <button onClick={() => { setIdx(Math.floor(Math.random() * NEVER_HAVE_I.length)); setRoundHave({}); setRevealed(false); }} style={mkBtn(accent)}>Start →</button>}
    </Modal>
  );

  const positions = tablePositions(players.length);
  const haveCount = Object.values(roundHave).filter(Boolean).length;

  return (
    <Modal onClose={onClose} emoji="🙅" title="Never Have I Ever">
      {/* Statement card */}
      <div style={{ background: "linear-gradient(145deg,#0A0010,#12001C)", border: `1.5px solid ${accent}44`, borderRadius: 18, padding: "20px 18px", textAlign: "center", marginBottom: 6, boxShadow: `0 10px 36px ${accent}18` }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>Never Have I Ever…</div>
        <div style={{ fontSize: 17, color: "#fff", lineHeight: 1.5, fontWeight: 600 }}>{NEVER_HAVE_I[idx]}</div>
      </div>

      {/* Virtual round table */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "70%", marginBottom: 10, overflow: "visible" }}>
        {/* Table surface */}
        <div style={{ position: "absolute", left: "15%", top: "10%", width: "70%", height: "80%", borderRadius: "50%", background: `radial-gradient(ellipse,${accent}12,${accent}04)`, border: `2px solid ${accent}22` }} />
        {/* Player tokens around table */}
        {players.map((p, i) => {
          const pos = positions[i];
          const has = roundHave[p];
          const raised = revealed && has;
          const notHave = revealed && !has;
          return (
            <div key={p} onClick={() => toggleHave(p)}
              style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: revealed ? "default" : "pointer", userSelect: "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: has ? `${accent}60` : "rgba(255,255,255,0.1)", border: `2.5px solid ${has ? accent : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", transition: "all 0.2s", transform: raised ? "translateY(-8px) scale(1.15)" : notHave ? "scale(0.9)" : "scale(1)", boxShadow: raised ? `0 8px 20px ${accent}55` : "none" }}>
                {has && !revealed ? "✋" : p[0].toUpperCase()}
              </div>
              {raised && <div style={{ fontSize: 14 }}>✋</div>}
              <div style={{ fontSize: 9, fontWeight: 700, color: has ? accent : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.04em", maxWidth: 52, textAlign: "center", lineHeight: 1.1 }}>{p}</div>
              {revealed && <div style={{ fontSize: 10, fontWeight: 800, color: has ? accent : "rgba(255,255,255,0.3)" }}>{scores[p] || 0} pts</div>}
            </div>
          );
        })}
        {/* Centre label */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          {!revealed ? (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{haveCount > 0 ? `${haveCount} tapped` : "Tap if you HAVE"}</div>
          ) : (
            <div style={{ fontSize: 13, fontWeight: 800, color: accent }}>+{haveCount} pts!</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!revealed ? (
          <button onClick={reveal} style={{ flex: 1, ...mkBtn(accent), fontSize: 15 }}>Reveal! 👀</button>
        ) : (
          <button onClick={next} style={{ flex: 1, ...mkBtn(accent), fontSize: 15 }}>Next →</button>
        )}
      </div>
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
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.4)"}}>Round {round}</div>
        {totalVotes>0&&<div style={{fontSize:12,color:accent}}>{totalVotes} vote{totalVotes!==1?"s":""}</div>}
      </div>
      {/* VS Battle layout */}
      <div style={{display:"flex",gap:0,marginBottom:myPick?12:16,alignItems:"stretch"}}>
        {["a","b"].map((side,si)=>{
          const pct=side==="a"?pctA:pctB;
          const isChosen=myPick===side,isOther=myPick&&myPick!==side;
          const GRADS=["linear-gradient(145deg,#1E40AF,#3B82F6)","linear-gradient(145deg,#6D28D9,#A855F7)"];
          const GLOWS=["rgba(59,130,246,0.4)","rgba(168,85,247,0.4)"];
          const PCTS=["#60A5FA","#C084FC"];
          return (
            <div key={side} onClick={()=>pick(side)} style={{
              flex:1,padding:"22px 14px 18px",
              borderRadius:si===0?"16px 0 0 16px":"0 16px 16px 0",
              background:isChosen?GRADS[si]:isOther?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.06)",
              border:`2px solid ${isChosen?PCTS[si]+"66":isOther?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.1)"}`,
              borderRight:si===0?"none":undefined,
              borderLeft:si===1?"none":undefined,
              cursor:myPick?"default":"pointer",textAlign:"center",
              opacity:isOther?0.42:1,transition:"all 0.3s",
              position:"relative",overflow:"hidden",
              boxShadow:isChosen?`0 8px 32px ${GLOWS[si]}`:undefined,
            }}>
              {myPick&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:`${pct}%`,background:isChosen?PCTS[si]+"18":"rgba(255,255,255,0.04)",transition:"height 0.6s cubic-bezier(0.22,1,0.36,1)"}}/>}
              <div style={{position:"relative",zIndex:1}}>
                <div style={{fontSize:9,fontWeight:800,color:isChosen?PCTS[si]:"rgba(255,255,255,0.3)",marginBottom:8,letterSpacing:"0.1em",textTransform:"uppercase"}}>
                  {si===0?"OPTION A":"OPTION B"}
                </div>
                <div style={{fontSize:13.5,color:"#fff",lineHeight:1.6,fontWeight:isChosen?700:400}}>{pair[side]}</div>
                {myPick&&<div style={{fontSize:20,fontWeight:900,color:isChosen?PCTS[si]:"rgba(255,255,255,0.25)",marginTop:10}}>{pct}%</div>}
              </div>
            </div>
          );
        })}
        {/* VS badge */}
        <div style={{width:40,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.05)",borderTop:"2px solid rgba(255,255,255,0.08)",borderBottom:"2px solid rgba(255,255,255,0.08)"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1.5px solid rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"rgba(255,255,255,0.5)",letterSpacing:"0.01em"}}>VS</div>
        </div>
      </div>
      {myPick&&<div style={{textAlign:"center",background:accent+"15",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:14,color:accent,fontWeight:700}}>{rand(debatePrompts)}</div>}
      <button onClick={next} style={mkBtn(myPick?accent:"rgba(255,255,255,0.12)")}>{myPick?"Next Question →":"Skip"}</button>
    </Modal>
  );
}

function HotTakes({ onClose, accent }) {
  const [takes, setTakes] = useState([{ id: Date.now(), text: rand(HOT_TAKES), reactions: {} }]);
  const [agreed, setAgreed] = useState({});
  const [temp, setTemp] = useState(0);

  const addTake = () => {
    const t = rand(HOT_TAKES);
    setTakes(ts => [{ id: Date.now(), text: t, reactions: {} }, ...ts]);
  };
  const react = (id, emoji) => {
    const key = `${id}-${emoji}`;
    if (agreed[key]) return;
    setTakes(ts => ts.map(t => t.id === id ? { ...t, reactions: { ...t.reactions, [emoji]: (t.reactions[emoji] || 0) + 1 } } : t));
    setAgreed(a => ({ ...a, [key]: true }));
    setTemp(v => Math.max(-100, Math.min(100, v + (emoji === "🔥" ? 12 : emoji === "💀" ? 8 : -10))));
  };

  const tempColor = temp > 40 ? "#EF4444" : temp > 0 ? "#F97316" : temp < -40 ? "#3B82F6" : "#A3A3A3";
  const tempLabel = temp > 60 ? "🔥 CHAOS" : temp > 20 ? "🌶️ Spicy" : temp < -60 ? "🧊 Dead Crowd" : temp < -20 ? "😐 Lukewarm" : "🌡️ Warming Up";

  return (
    <Modal onClose={onClose} emoji="🌶️" title="Hot Takes" wide>
      {/* Room temperature meter */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: `${Math.abs(temp) / 2}%`, background: tempColor, borderRadius: 4, transition: "all 0.4s", transform: temp >= 0 ? "none" : "translateX(-100%)", transformOrigin: temp >= 0 ? "left" : "right" }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: tempColor, minWidth: 110, textAlign: "right" }}>{tempLabel}</div>
      </div>

      {/* Takes as speech bubbles stacked like a debate stage */}
      {takes.slice(0, 3).map((take, idx) => (
        <div key={take.id} style={{ background: idx === 0 ? `linear-gradient(135deg,${accent}28,${accent}0e)` : "rgba(255,255,255,0.04)", border: `1.5px solid ${idx === 0 ? accent + "60" : "rgba(255,255,255,0.08)"}`, borderRadius: 18, padding: "18px 16px", marginBottom: 10, position: "relative" }}>
          {idx === 0 && <div style={{ position: "absolute", bottom: -8, left: 20, width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: `8px solid ${accent}60` }} />}
          <div style={{ fontSize: idx === 0 ? 16 : 13, color: idx === 0 ? "#fff" : "rgba(255,255,255,0.5)", lineHeight: 1.45, marginBottom: 12, fontWeight: idx === 0 ? 600 : 400 }}>{take.text}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["🔥", "#EF4444"], ["💀", "#8B5CF6"], ["👎", "#3B82F6"]].map(([emoji, col]) => (
              <button key={emoji} onClick={() => react(take.id, emoji)} style={{ padding: "5px 12px", borderRadius: 100, border: `1.5px solid ${agreed[`${take.id}-${emoji}`] ? col : "rgba(255,255,255,0.12)"}`, background: agreed[`${take.id}-${emoji}`] ? col + "30" : "transparent", color: agreed[`${take.id}-${emoji}`] ? col : "rgba(255,255,255,0.4)", fontSize: 13, cursor: agreed[`${take.id}-${emoji}`] ? "default" : "pointer", fontFamily: font, fontWeight: 700 }}>
                {emoji} {take.reactions[emoji] || 0}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button onClick={addTake} style={mkBtn(accent)}>🌶️ Next Hot Take</button>
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
  const addP = () => { if (newP.trim() && !players.includes(newP.trim())) { setPlayers(p=>[...p,newP.trim()]); setNewP(""); } };
  const spin = () => {
    if (players.length < 2) return;
    setSpinning(true); setResult(null); setRevealing(false);
    const extra = 1440 + Math.random() * 1080;
    setAngle(a=>a+extra);
    setTimeout(()=>{ setSpinning(false); setRevealing(true); setTimeout(()=>{ setResult(rand(players)); setRevealing(false); },600); },3200);
  };
  return (
    <Modal onClose={onClose} emoji="🍾" title="Spin & Pick">
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input value={newP} onChange={e=>setNewP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addP()} placeholder="Add a name" style={{...inp,flex:1}}/>
        <button onClick={addP} style={{...mkBtn(accent),width:"auto",padding:"10px 16px"}}>+</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
        {players.map(p=><span key={p} style={{background:accent+"25",color:"#fff",padding:"5px 12px",borderRadius:20,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
          {p}<span onClick={()=>{setPlayers(pl=>pl.filter(x=>x!==p));setResult(null);}} style={{cursor:"pointer",opacity:0.5}}>✕</span>
        </span>)}
      </div>
      {players.length>=2&&(
        <div style={{display:"flex",justifyContent:"center",marginBottom:20,position:"relative"}}>
          {/* Player name ring */}
          <div style={{position:"relative",width:220,height:220}}>
            {/* Outer glow ring */}
            <div style={{position:"absolute",inset:0,borderRadius:"50%",border:`3px solid ${accent}30`,boxShadow:`0 0 40px ${accent}18,inset 0 0 40px ${accent}08`,background:`radial-gradient(circle,${accent}0a 0%,transparent 70%)`}}/>
            {/* Player name chips around the ring */}
            {players.slice(0,8).map((p,i,arr)=>{
              const deg=(i/arr.length)*360;
              const rad=deg*(Math.PI/180);
              const r=88;
              const x=110+r*Math.sin(rad);
              const y=110-r*Math.cos(rad);
              return <div key={p} style={{position:"absolute",left:x,top:y,transform:"translate(-50%,-50%)",background:accent+"25",border:`1px solid ${accent}44`,borderRadius:14,padding:"3px 8px",fontSize:9.5,fontWeight:700,color:"#fff",whiteSpace:"nowrap",maxWidth:60,overflow:"hidden",textOverflow:"ellipsis"}}>{p}</div>;
            })}
            {/* Bottle SVG — spins around its base */}
            <div style={{position:"absolute",bottom:"50%",left:"calc(50% - 5px)",transformOrigin:"50% 100%",transform:`rotate(${angle}deg)`,transition:spinning?"transform 3.2s cubic-bezier(0.17,0.67,0.08,0.99)":"none",width:10,height:100}}>
              <svg width="10" height="100" viewBox="0 0 10 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bottle neck */}
                <rect x="3" y="0" width="4" height="20" rx="2" fill={accent}/>
                {/* Bottle shoulder */}
                <path d="M1 20 Q0 35 0 50 L10 50 Q10 35 9 20Z" fill={accent}/>
                {/* Bottle body */}
                <rect x="0" y="50" width="10" height="46" rx="2" fill={accent}/>
                {/* Glass shine */}
                <rect x="1.5" y="25" width="2" height="60" rx="1" fill="rgba(255,255,255,0.25)"/>
                {/* Cap */}
                <rect x="2.5" y="0" width="5" height="6" rx="1" fill="#fff" opacity="0.6"/>
              </svg>
            </div>
            {/* Center pivot */}
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:14,height:14,borderRadius:"50%",background:accent,boxShadow:`0 0 20px ${accent}cc`,zIndex:2}}/>
          </div>
        </div>
      )}
      {(result&&!spinning&&!revealing)?(
        <div style={{textAlign:"center",padding:"18px",background:accent+"18",borderRadius:14,marginBottom:14,border:`1.5px solid ${accent}44`,animation:"card-flip 0.3s ease-out"}}>
          <div style={{fontSize:11,color:accent,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>🎯 Picked!</div>
          <div style={{fontSize:28,fontWeight:900,color:"#fff"}}>{result}</div>
        </div>
      ):revealing?(
        <div style={{textAlign:"center",padding:"18px",marginBottom:14}}>
          <div style={{fontSize:32,animation:"splash-pulse 0.6s ease-in-out"}}>🎯</div>
        </div>
      ):null}
      <button onClick={spin} disabled={players.length<2||spinning} style={{...mkBtn(accent),opacity:players.length<2?0.5:1}}>
        {spinning?"Spinning…":players.length<2?"Add at least 2 names":result?"Spin Again! 🍾":"SPIN! 🍾"}
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
      {/* Theater marquee header */}
      <div style={{ position:"relative", borderRadius:14, overflow:"hidden", marginBottom:16, background:"linear-gradient(180deg,#1A0808,#0F0505)", border:"1px solid rgba(220,38,38,0.2)", padding:"18px 20px 14px" }}>
        {/* Marquee light bulbs */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          {[...Array(9)].map((_,i) => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:i%2===0?"#FBBF24":"#FDE68A", boxShadow:i%2===0?"0 0 6px #FBBF24":"none", opacity:0.9 }} />)}
        </div>
        <div style={{ textAlign:"center", marginBottom:10 }}>
          <div style={{ fontSize:11, color:"rgba(251,191,36,0.6)", fontWeight:800, letterSpacing:"0.3em", textTransform:"uppercase" }}>NOW PLAYING</div>
          <div style={{ fontSize:18, fontWeight:900, color:"#FDE68A", letterSpacing:"0.08em", fontFamily:"Georgia,serif" }}>DUMB CHARADES</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:4 }}>Team A vs Team B · 60s per word</div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          {[...Array(9)].map((_,i) => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:i%2===1?"#FBBF24":"#FDE68A", boxShadow:i%2===1?"0 0 6px #FBBF24":"none", opacity:0.9 }} />)}
        </div>
      </div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:10, textAlign:"center", letterSpacing:"0.05em" }}>CHOOSE YOUR CATEGORY</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(cats).map(([k, v]) => (
          <button key={k} onClick={() => pick(k)} style={{ ...mkBtn("rgba(255,255,255,0.04)"), border:"1.5px solid rgba(220,38,38,0.25)", textAlign:"left", padding:"14px 16px", fontSize:15, borderLeft:`4px solid #DC2626`, borderRadius:10 }}>
            <span style={{ marginRight:8 }}>{v.split(" ")[0]}</span>
            <span style={{ color:"rgba(255,255,255,0.85)" }}>{v.split(" ").slice(1).join(" ")}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
  const timerColor = timer > 15 ? "#34D399" : timer > 5 ? "#FBBF24" : "#F87171";
  return (
    <Modal onClose={onClose} emoji="🎭" title="Dumb Charades">
      {/* Scoreboard */}
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        {["A","B"].map(t => (
          <div key={t} style={{ flex:1, textAlign:"center", padding:"10px 8px", borderRadius:12, background:currentTeam===t?"rgba(220,38,38,0.15)":"rgba(255,255,255,0.04)", border:`1.5px solid ${currentTeam===t?"#DC2626":"rgba(255,255,255,0.08)"}`, transition:"all 0.2s" }}>
            <div style={{ fontSize:10, color:currentTeam===t?"#FCA5A5":"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:3 }}>Team {t}{currentTeam===t?" ★":""}</div>
            <div style={{ fontSize:26, fontWeight:900, color:currentTeam===t?"#F87171":"rgba(255,255,255,0.7)", fontVariantNumeric:"tabular-nums" }}>{teamScores[t]}</div>
          </div>
        ))}
      </div>
      {/* Stage */}
      <div style={{ position:"relative", borderRadius:14, overflow:"hidden", marginBottom:12, background:"linear-gradient(180deg,#0A0505 0%,#120808 40%,#1A0F0A 100%)" }}>
        {/* Stage floor boards */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.03) 39px,rgba(255,255,255,0.03) 40px)", pointerEvents:"none" }} />
        {/* Spotlight cone from top */}
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"70%", height:"100%", background:"radial-gradient(ellipse 55% 70% at 50% 0%,rgba(251,191,36,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />
        {/* Left curtain */}
        <div style={{ position:"absolute", top:0, left:0, width:18, height:"100%", background:"linear-gradient(90deg,#7F1D1D,#991B1B,rgba(153,27,27,0))", pointerEvents:"none", borderRadius:"14px 0 0 14px" }} />
        {/* Right curtain */}
        <div style={{ position:"absolute", top:0, right:0, width:18, height:"100%", background:"linear-gradient(270deg,#7F1D1D,#991B1B,rgba(153,27,27,0))", pointerEvents:"none", borderRadius:"0 14px 14px 0" }} />
        <div style={{ padding:"20px 24px 16px", position:"relative", zIndex:1 }}>
          <div style={{ fontSize:11, color:"rgba(251,191,36,0.7)", fontWeight:700, textAlign:"center", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>{cats[cat]} · Round {round}</div>
          {/* Cue card */}
          <div style={{ background:"linear-gradient(135deg,#FFFBF0,#FFF8E7)", borderRadius:8, padding:"22px 16px", marginBottom:14, boxShadow:"0 8px 24px rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.1)", position:"relative" }}>
            {/* Punched hole */}
            <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", width:12, height:12, borderRadius:"50%", background:"rgba(0,0,0,0.15)", border:"1px solid rgba(0,0,0,0.1)" }} />
            <div style={{ fontSize:22, fontWeight:900, color:"#1A0A05", textAlign:"center", letterSpacing:"-0.01em", fontFamily:"Georgia,serif", marginTop:4 }}>{word}</div>
          </div>
          {/* Timer ring */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:4 }}>
            <div style={{ width:1, flex:1, background:`linear-gradient(90deg,transparent,${timerColor}40)` }} />
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:42, fontWeight:900, color:timerColor, fontVariantNumeric:"tabular-nums", lineHeight:1, transition:"color 0.3s", textShadow:`0 0 20px ${timerColor}60` }}>{timer}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase" }}>seconds</div>
            </div>
            <div style={{ width:1, flex:1, background:`linear-gradient(270deg,transparent,${timerColor}40)` }} />
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={correct} style={{ ...mkBtn("#059669"), flex:2, fontSize:14 }}>✓ Correct +1</button>
        <button onClick={skip} style={{ ...mkBtn("rgba(255,255,255,0.07)"), flex:1, fontSize:13 }}>Skip</button>
        <button onClick={() => { setCat(null); setWord(null); clearInterval(ref.current); }} style={{ ...mkBtn("rgba(255,255,255,0.06)"), flex:1, fontSize:12 }}>◀</button>
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
      {bingo&&(
        <div style={{textAlign:"center",marginBottom:16,background:"linear-gradient(135deg,rgba(251,191,36,0.15),rgba(251,191,36,0.08))",borderRadius:16,padding:"16px",border:"2px solid rgba(251,191,36,0.4)",animation:"splash-pulse 0.6s ease-out"}}>
          <div style={{fontSize:30,fontWeight:900,color:"#FBBF24",letterSpacing:"0.06em"}}>🎉 B I N G O !</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginTop:6}}>Shout it out loud!</div>
        </div>
      )}
      {/* B-I-N-G-O column headers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginBottom:4}}>
        {["B","I","N","G","O"].map(l=>(
          <div key={l} style={{textAlign:"center",fontSize:13,fontWeight:900,color:accent,padding:"4px 0",letterSpacing:"0.06em"}}>{l}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginBottom:14}}>
        {card.map((sq,i)=>{
          const isMarked=!!marked[i],isCenter=i===12,isWin=inWinLine(i),isJust=justMarked===i;
          const DAUBERS=["#F472B6","#60A5FA","#34D399","#FBBF24","#A78BFA","#F87171","#38BDF8"];
          const dauberClr=DAUBERS[i%DAUBERS.length];
          return (
            <div key={i} onClick={()=>toggle(i)} style={{
              aspectRatio:"1",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",
              padding:4,cursor:isCenter?"default":"pointer",transition:"transform 0.15s",
              background:isCenter?"#B45309":isWin?"rgba(251,191,36,0.12)":"rgba(255,255,255,0.05)",
              border:`1.5px solid ${isCenter?"#D97706":isWin?"#FBBF24":isMarked?dauberClr+"80":"rgba(255,255,255,0.08)"}`,
              transform:isJust?"scale(1.18)":"scale(1)",
              boxShadow:isWin?`0 0 12px ${accent}40`:isJust?`0 4px 16px ${dauberClr}60`:undefined,
              position:"relative",overflow:"hidden",
            }}>
              {isMarked&&!isCenter&&(
                <div style={{position:"absolute",inset:2,borderRadius:6,background:dauberClr+"ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,animation:isJust?"splash-pulse 0.4s ease-out":undefined}}>
                  {isWin?"⭐":"✓"}
                </div>
              )}
              {isCenter&&<span style={{fontSize:18,position:"relative",zIndex:1}}>⭐</span>}
              {!isMarked&&!isCenter&&<span style={{fontSize:7,color:"rgba(255,255,255,0.6)",textAlign:"center",lineHeight:1.2,wordBreak:"break-word"}}>{sq}</span>}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",margin:0}}>5 in a row — horizontal, vertical, diagonal</p>
        <div style={{fontSize:12,fontWeight:700,color:accent}}>{markedCount}/25</div>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OCCASION-SPECIFIC TOOLS
// ════════════════════════════════════════════════════════════════════════════

function PolaroidCard({ post, accent, onReact, onDownload }) {
  const COLORS = ["#FF6B6B","#FF9F43","#FECA57","#54A0FF","#8B5CF6","#F472B6","#2ED573","#1E90FF"];
  const color = COLORS[Math.abs(post.id % 8)];
  const rot = (post.id % 13) - 6;
  return (
    <div
      style={{ background:'#FFFEF9', borderRadius:2, padding:'11px 11px 14px', boxShadow:'0 6px 28px rgba(0,0,0,0.38),0 2px 6px rgba(0,0,0,0.22)', transform:`rotate(${rot}deg)`, width:160, flexShrink:0, position:'relative', transition:'transform 0.2s ease,box-shadow 0.2s ease', cursor:'default' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='rotate(0deg) scale(1.06)';e.currentTarget.style.boxShadow='0 16px 48px rgba(0,0,0,0.5),0 4px 8px rgba(0,0,0,0.2)';e.currentTarget.style.zIndex='10';}}
      onMouseLeave={e=>{e.currentTarget.style.transform=`rotate(${rot}deg)`;e.currentTarget.style.boxShadow='0 6px 28px rgba(0,0,0,0.38),0 2px 6px rgba(0,0,0,0.22)';e.currentTarget.style.zIndex='';}}
    >
      <div style={{position:'absolute',top:-9,left:'50%',transform:'translateX(-50%)',width:16,height:16,borderRadius:'50%',background:'radial-gradient(circle at 38% 38%,#ff6b6b 0%,#8B0000 100%)',boxShadow:'0 3px 8px rgba(0,0,0,0.45)',zIndex:3}}/>
      <div style={{background:`linear-gradient(145deg,${color}bb,${color})`,height:118,display:'flex',alignItems:'center',justifyContent:'center',fontSize:46,marginBottom:10,borderRadius:1,overflow:'hidden'}}>
        {post.emoji}
      </div>
      <div style={{color:'#1c1c1c',fontSize:11,lineHeight:1.55,fontStyle:'italic',fontFamily:"'Georgia',serif",marginBottom:5,wordBreak:'break-word',minHeight:38}}>
        "{post.text.length>80?post.text.slice(0,80)+'…':post.text}"
      </div>
      <div style={{color:'#b0a090',fontSize:9.5,fontWeight:600,marginBottom:7,letterSpacing:'0.03em'}}>— {post.name}</div>
      <div style={{display:'flex',gap:3,flexWrap:'wrap',marginBottom:6}}>
        {["❤️","🎉","✨","😍"].map(r=>(
          <button key={r} onClick={()=>onReact(post.id,r)} style={{background:(post.reactions?.[r]||0)>0?'#f0ece6':'transparent',border:'none',borderRadius:8,padding:'1px 4px',cursor:'pointer',fontSize:10,color:'#555',transition:'background 0.15s'}}>
            {r}{(post.reactions?.[r]||0)>0?' '+post.reactions[r]:''}
          </button>
        ))}
      </div>
      {onDownload&&(
        <button onClick={()=>onDownload({...post,color})} style={{width:'100%',background:'none',border:'1px solid #ddd',borderRadius:2,padding:'3px 0',fontSize:9,color:'#bbb',cursor:'pointer',fontFamily:'sans-serif',letterSpacing:'0.05em'}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#aaa';e.currentTarget.style.color='#777';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#ddd';e.currentTarget.style.color='#bbb';}}>
          ⬇ save polaroid
        </button>
      )}
    </div>
  );
}
// Legacy alias so any remaining WallPost references still compile
const WallPost = PolaroidCard;

// Wish Wall
const OCC_STICKY_COLORS = ["#FEF08A","#86EFAC","#FDA4AF","#93C5FD","#FCA5A5","#C4B5FD","#FCD34D","#6EE7B7"];
const OCC_STICKY_ROTATES = ["-2deg","1.5deg","-1deg","2.5deg","-3deg","1deg","-1.8deg","2deg"];

function WishWall({ onClose, accent, celebrant, placeholder }) {
  const [wishes, setWishes] = useState([]);
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [showWall, setShowWall] = useState(false);
  const post = () => {
    if (!wish.trim()) return;
    setWishes(w=>[...w,{id:Date.now(),name:name.trim()||"Anonymous",text:wish.trim()}]);
    setName("");setWish("");
  };
  if (showWall) return <DesignerWall onClose={()=>setShowWall(false)} items={wishes} title={`Wish Wall${celebrant?` for ${celebrant}`:""}`} wallEmoji="⭐" />;

  const recent = wishes.slice(-6);

  return (
    <Modal onClose={onClose} emoji="⭐" title={`Wish Wall${celebrant?` for ${celebrant}`:""}`} wide>
      {/* Corkboard mini preview */}
      <div style={{ background: "linear-gradient(135deg,#8B6914,#A0782A,#7A5C0E)", borderRadius: 18, padding: "20px 14px 16px", marginBottom: 16, minHeight: 140, position: "relative", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.5)", border: "4px solid #5C4308" }}>
        <div style={{ position: "absolute", top: 14, left: 10, right: 10, height: 2, background: "rgba(0,0,0,0.25)", borderRadius: 1 }} />
        {wishes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0 4px", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Be the first to pin a wish ⭐</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, paddingTop: 8 }}>
            {recent.map((w, i) => {
              const col = OCC_STICKY_COLORS[i % OCC_STICKY_COLORS.length];
              const rot = OCC_STICKY_ROTATES[i % OCC_STICKY_ROTATES.length];
              return (
                <div key={w.id} style={{ background: col, borderRadius: 4, padding: "8px 8px 10px", transform: `rotate(${rot})`, boxShadow: "0 3px 12px rgba(0,0,0,0.4)", position: "relative" }}>
                  <div style={{ position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: "#DC2626", boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }} />
                  <div style={{ fontSize: 9, lineHeight: 1.5, color: "#1C1917", fontFamily: "Georgia, serif", wordBreak: "break-word", maxHeight: 52, overflow: "hidden" }}>{w.text}</div>
                  <div style={{ fontSize: 8, color: "#57534e", marginTop: 4, fontWeight: 700 }}>— {w.name}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {wishes.length > 0 && (
        <button onClick={()=>setShowWall(true)} style={{ width:"100%", padding:"10px", borderRadius:10, border:`1.5px solid ${accent}50`, background:`${accent}12`, color:accent, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span>🖼️ View Full Wall</span><span style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"1px 9px",fontSize:12}}>{wishes.length} wishes</span>
        </button>
      )}

      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (optional)" style={{...inp,marginBottom:8}}/>
      <textarea value={wish} onChange={e=>setWish(e.target.value)} placeholder={placeholder||`Write a wish for ${celebrant||"them"}…`} style={{...inp,minHeight:72,resize:"vertical",marginBottom:10}}/>
      <button onClick={post} style={{...mkBtn(accent)}}>📌 Pin Wish</button>
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
  const [phase, setPhase] = useState("setup");
  const [playerName, setPlayerName] = useState("");
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [revealMode, setRevealMode] = useState(false);

  const pickAnswer = (opt) => {
    const newAnswers = { ...answers, [currentQ]: opt };
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setTimeout(() => { setCurrentQ(q => q + 1); setAnimKey(k => k + 1); }, 350);
    } else {
      setTimeout(() => {
        setAllSubmissions(s => [...s, { name: playerName.trim() || "Player " + (s.length + 1), answers: newAnswers }]);
        setAnswers({}); setCurrentQ(0); setAnimKey(0); setPlayerName(""); setPhase("setup");
      }, 450);
    }
  };
  const setCorrect = (qIdx, opt) => setCorrectAnswers(c => ({ ...c, [qIdx]: opt }));
  const calcScore = (sub) => questions.filter((_, i) => correctAnswers[i] && sub.answers[i] === correctAnswers[i]).length;
  const revealDone = Object.keys(correctAnswers).length === questions.length;

  if (phase === "setup") return (
    <Modal onClose={onClose} emoji="🎯" title={`How well do you know ${celebrant || "them"}?`} wide>
      <style>{`
        @keyframes bq-glow{0%,100%{box-shadow:0 0 20px ${accent}44,0 0 0 2px ${accent}22}50%{box-shadow:0 0 40px ${accent}66,0 0 0 2px ${accent}44}}
        @keyframes bq-slide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* TV show stage */}
      <div style={{ position:"relative", marginBottom:18, borderRadius:16, overflow:"hidden", background:"linear-gradient(180deg,#060612 0%,#0E0E26 100%)", border:"1.5px solid rgba(255,255,255,0.08)", padding:"22px 16px 18px", textAlign:"center" }}>
        <div style={{ position:"absolute", top:0, left:"20%", width:60, height:"100%", background:`linear-gradient(180deg,${accent}18,transparent)`, transform:"rotate(12deg)", transformOrigin:"top", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:0, right:"20%", width:60, height:"100%", background:`linear-gradient(180deg,${accent}18,transparent)`, transform:"rotate(-12deg)", transformOrigin:"top", pointerEvents:"none" }} />
        <div style={{ fontSize:10, fontWeight:900, letterSpacing:"0.25em", color:accent, textTransform:"uppercase", marginBottom:5 }}>THE BIG BIRTHDAY QUIZ</div>
        <div style={{ fontSize:16, fontWeight:900, color:"rgba(255,255,255,0.8)", lineHeight:1.2, marginBottom:3 }}>WHO KNOWS</div>
        <div style={{ fontSize:24, fontWeight:900, color:accent, lineHeight:1.1, animation:"bq-glow 2.5s ease-in-out infinite" }}>{(celebrant || "THEM").toUpperCase()}?</div>
      </div>

      {allSubmissions.length > 0 && (
        <div style={{ marginBottom:14, background:accent+"12", borderRadius:12, padding:"10px 14px", border:`1px solid ${accent}25` }}>
          <div style={{ fontSize:10, fontWeight:800, color:accent, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:7 }}>On the board ({allSubmissions.length})</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {allSubmissions.map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.06)", borderRadius:20, padding:"4px 10px 4px 6px", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:`linear-gradient(135deg,${accent},${accent}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#fff" }}>{s.name[0]?.toUpperCase()}</div>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <input value={playerName} onChange={e => setPlayerName(e.target.value)} onKeyDown={e => e.key === "Enter" && (setCurrentQ(0), setAnimKey(0), setPhase("playing"))}
        placeholder="Your name…" style={{ ...inp, marginBottom:10, textAlign:"center", fontSize:15, fontWeight:700 }} autoFocus />
      <button onClick={() => { setCurrentQ(0); setAnimKey(0); setPhase("playing"); }}
        style={{ ...mkBtn(accent), marginBottom:10, fontSize:15, fontWeight:900, letterSpacing:"0.03em", animation:"bq-glow 2.5s ease-in-out infinite" }}>
        🎬 Take the Quiz
      </button>
      {allSubmissions.length >= 1 && (
        <button onClick={() => setRevealMode(r => !r)} style={{ ...mkBtn("rgba(255,255,255,0.07)") }}>
          {revealMode ? "Hide Results" : "🏆 Reveal Results"}
        </button>
      )}
      {revealMode && allSubmissions.length >= 1 && (
        <div style={{ marginTop:14, animation:"bq-slide 0.3s ease-out" }}>
          {!revealDone ? (
            <div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", textAlign:"center", marginBottom:12 }}>{celebrant || "Birthday person"}: tap the correct answers — {Object.keys(correctAnswers).length}/{questions.length} set</div>
              {questions.map((q, i) => (
                <div key={i} style={{ marginBottom:10, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"10px 12px", border:`1.5px solid ${correctAnswers[i]?"#34D39940":"rgba(255,255,255,0.07)"}` }}>
                  <div style={{ fontSize:11, color:accent, marginBottom:6, fontWeight:700 }}>Q{i+1}. {q.q}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {q.opts.map(opt => (
                      <button key={opt} onClick={() => setCorrect(i, opt)}
                        style={{ padding:"5px 10px", borderRadius:8, border:`1.5px solid ${correctAnswers[i]===opt?"#34D399":"rgba(255,255,255,0.1)"}`, background:correctAnswers[i]===opt?"#34D39922":"rgba(255,255,255,0.04)", color:correctAnswers[i]===opt?"#34D399":"rgba(255,255,255,0.7)", fontFamily:font, fontSize:11, cursor:"pointer" }}>
                        {correctAnswers[i]===opt?"✓ ":""}{opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ textAlign:"center", marginBottom:14, padding:"10px", background:`linear-gradient(135deg,${accent}15,transparent)`, borderRadius:12, border:`1.5px solid ${accent}30` }}>
                <div style={{ fontSize:11, fontWeight:900, letterSpacing:"0.18em", textTransform:"uppercase", color:accent }}>WHO KNOWS {(celebrant||"THEM").toUpperCase()} BEST?</div>
              </div>
              {[...allSubmissions].sort((a, b) => calcScore(b) - calcScore(a)).map((s, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:i===0?`${accent}15`:"rgba(255,255,255,0.04)", borderRadius:10, marginBottom:6, border:`1.5px solid ${i===0?accent+"44":"transparent"}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i] || `${i+1}.`}</span>
                    <span style={{ color:"#fff", fontSize:13, fontWeight:i===0?800:400 }}>{s.name}</span>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:18, fontWeight:900, color:i===0?accent:"rgba(255,255,255,0.7)", fontVariantNumeric:"tabular-nums" }}>{calcScore(s)}/{questions.length}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{Math.round((calcScore(s)/questions.length)*100)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );

  const q = questions[currentQ];
  return (
    <Modal onClose={onClose} emoji="🎯" title={playerName ? `${playerName}'s turn` : "Your turn"} wide>
      <style>{`
        @keyframes bq-qin{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes bq-optin{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
      `}</style>

      {/* Progress dots */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:600, letterSpacing:"0.05em" }}>QUESTION</div>
        <div style={{ display:"flex", gap:6 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ width:9, height:9, borderRadius:"50%", background:i===currentQ?accent:answers[i]?"#34D399":"rgba(255,255,255,0.13)", transition:"background 0.25s" }} />
          ))}
        </div>
        <div style={{ fontSize:11, color:accent, fontWeight:800 }}>{currentQ+1}/{questions.length}</div>
      </div>

      {/* Spotlight question card */}
      <div key={animKey} style={{
        background:"linear-gradient(180deg,#0A0A1E 0%,#14142E 100%)",
        borderRadius:18, padding:"28px 18px 22px", marginBottom:16,
        border:`2px solid ${accent}35`, boxShadow:`0 0 50px ${accent}15, 0 10px 40px rgba(0,0,0,0.6)`,
        animation:"bq-qin 0.3s cubic-bezier(0.22,1,0.36,1)", textAlign:"center", position:"relative", overflow:"hidden"
      }}>
        <div style={{ position:"absolute", top:10, left:14, width:28, height:28, borderRadius:"50%", background:accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff" }}>Q{currentQ+1}</div>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:140, height:100, borderRadius:"50%", background:`radial-gradient(ellipse, ${accent}12 0%, transparent 70%)`, pointerEvents:"none" }} />
        <div style={{ fontSize:17, fontWeight:800, color:"#fff", lineHeight:1.45, paddingTop:6 }}>{q.q}</div>
      </div>

      {/* 2×2 answer grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {q.opts.map((opt, oi) => (
          <button key={opt} onClick={() => pickAnswer(opt)}
            style={{
              padding:"16px 10px", borderRadius:14,
              border:`2px solid ${answers[currentQ]===opt?accent:"rgba(255,255,255,0.1)"}`,
              background:answers[currentQ]===opt?`linear-gradient(135deg,${accent}35,${accent}18)`:"rgba(255,255,255,0.04)",
              color:answers[currentQ]===opt?"#fff":"rgba(255,255,255,0.78)",
              fontFamily:font, fontSize:13, fontWeight:answers[currentQ]===opt?700:500,
              cursor:"pointer", textAlign:"center", lineHeight:1.3,
              transition:"all 0.15s",
              animation:`bq-optin 0.25s ${oi*0.06}s both`,
              boxShadow:answers[currentQ]===opt?`0 0 18px ${accent}44`:"none"
            }}>
            <span style={{ fontSize:10, display:"block", color:answers[currentQ]===opt?accent:"rgba(255,255,255,0.3)", fontWeight:900, marginBottom:4, letterSpacing:"0.05em" }}>{"ABCD"[oi]}</span>
            {opt}
          </button>
        ))}
      </div>

      <button onClick={() => { setAnswers({}); setCurrentQ(0); setPhase("setup"); }}
        style={{ marginTop:14, width:"100%", background:"transparent", border:"none", color:"rgba(255,255,255,0.25)", fontSize:12, cursor:"pointer", fontFamily:font }}>
        ← Back to lobby
      </button>
    </Modal>
  );
}

// Anniversary: Love Notes Wall
const OCC_ENVELOPE_COLORS = ["#F43F5E","#EC4899","#8B5CF6","#F97316","#EF4444","#D946EF","#FB7185","#E879F9"];

function LoveNotes({ onClose, accent }) {
  const [notes, setNotes] = useState([]);
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");
  const [showWall, setShowWall] = useState(false);
  const [openedIds, setOpenedIds] = useState(new Set());
  const post = () => {
    if (!note.trim()) return;
    setNotes(n=>[...n,{id:Date.now(),name:from.trim()||"Anonymous",text:note.trim()}]);
    setFrom("");setNote("");
  };
  const toggleOpen = (id) => setOpenedIds(s => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });
  if (showWall) return <DesignerWall onClose={()=>setShowWall(false)} items={notes} title="Love Notes Wall" wallEmoji="💌" />;

  const recent = notes.slice(-6);

  return (
    <Modal onClose={onClose} emoji="💌" title="Love Notes Wall" wide>
      <style>{`@keyframes occ-swing{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}} @keyframes occ-sway{0%,100%{transform:rotate(1.5deg)}50%{transform:rotate(-1.5deg)}}`}</style>

      {/* Hanging string display */}
      <div style={{ background: "linear-gradient(180deg,#110308,#080204)", borderRadius: 18, padding: "0 0 16px", marginBottom: 16, overflow: "hidden", border: "1px solid rgba(244,63,94,0.2)", minHeight: 180 }}>
        {/* String line */}
        <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${accent}60,${accent}90,${accent}60,transparent)`, margin: "0 -1px 8px" }} />
        {notes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💌</div>Be the first to hang a love note!
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, padding: "4px 16px 0", overflowX: "auto" }}>
            {recent.map((item, i) => {
              const col = OCC_ENVELOPE_COLORS[i % OCC_ENVELOPE_COLORS.length];
              const isOpen = openedIds.has(item.id);
              const anim = i % 2 === 0 ? "occ-swing 4s ease-in-out infinite" : "occ-sway 3.5s ease-in-out infinite";
              return (
                <div key={item.id} onClick={() => toggleOpen(item.id)} style={{ flexShrink: 0, width: 90, cursor: "pointer", animation: anim, transformOrigin: "50% 0%" }}>
                  <div style={{ width: 12, height: 18, background: "#D4B896", borderRadius: 2, margin: "0 auto -2px", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }} />
                  <div style={{ background: isOpen ? `${col}20` : col, borderRadius: 8, padding: isOpen ? "10px 8px" : "12px 8px", border: `2px solid ${col}`, boxShadow: `0 4px 16px ${col}40`, transition: "all 0.3s" }}>
                    {!isOpen ? (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22 }}>💌</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", marginTop: 4, fontWeight: 700 }}>TAP TO OPEN</div>
                        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>from {item.name}</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 7, lineHeight: 1.5, color: col, fontFamily: "Georgia, serif", fontStyle: "italic", wordBreak: "break-word" }}>{item.text?.slice(0, 80)}</div>
                        <div style={{ fontSize: 6, color: "rgba(255,255,255,0.4)", marginTop: 4, fontWeight: 700 }}>— {item.name}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {notes.length > 0 && (
        <button onClick={()=>setShowWall(true)} style={{ width:"100%", padding:"10px", borderRadius:10, border:`1.5px solid ${accent}50`, background:`${accent}12`, color:accent, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span>💌 View All Notes</span><span style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"1px 9px",fontSize:12}}>{notes.length}</span>
        </button>
      )}

      <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="Your name" style={{...inp,marginBottom:8}}/>
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Write a note for the couple…" style={{...inp,minHeight:72,resize:"vertical",marginBottom:10}}/>
      <button onClick={post} style={{...mkBtn(accent)}}>Post Note 💌</button>
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
  const [currentQ, setCurrentQ] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const pickAnswer = (opt) => {
    const newAnswers = { ...answers, [currentQ]: opt };
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setTimeout(() => { setCurrentQ(q => q + 1); setAnimKey(k => k + 1); }, 350);
    } else {
      setTimeout(() => {
        setSubmissions(s => [...s, { name: playerName.trim() || "Player " + (s.length + 1), answers: newAnswers }]);
        setAnswers({}); setCurrentQ(0); setAnimKey(0); setPlayerName(""); setPhase("setup");
      }, 450);
    }
  };
  const calcScore = (sub) => questions.filter((_, i) => correctAnswers[i] && sub.answers[i] === correctAnswers[i]).length;
  const revealDone = Object.keys(correctAnswers).length === questions.length;

  if (phase === "setup") return (
    <Modal onClose={onClose} emoji="💑" title="Couple Quiz" wide>
      <style>{`
        @keyframes cq-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes cq-slide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cq-exposed{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
      `}</style>

      {/* Compatibility meter header */}
      <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:18, borderRadius:16, overflow:"hidden", border:"1.5px solid rgba(244,63,94,0.25)" }}>
        <div style={{ flex:1, background:"linear-gradient(135deg,#be123c,#f43f5e)", padding:"18px 12px", textAlign:"center" }}>
          <div style={{ fontSize:28 }}>💁‍♀️</div>
          <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.8)", marginTop:4, letterSpacing:"0.08em" }}>PERSON 1</div>
        </div>
        <div style={{ width:52, background:"#0F0010", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"18px 0", flexShrink:0, border:"0 solid rgba(244,63,94,0.15)", borderLeft:"1.5px solid rgba(244,63,94,0.2)", borderRight:"1.5px solid rgba(244,63,94,0.2)" }}>
          <div style={{ fontSize:20, animation:"cq-pulse 1.8s ease-in-out infinite" }}>❤️</div>
          <div style={{ fontSize:8, fontWeight:900, color:"rgba(244,63,94,0.7)", marginTop:4, letterSpacing:"0.15em" }}>vs</div>
        </div>
        <div style={{ flex:1, background:"linear-gradient(135deg,#7e22ce,#a855f7)", padding:"18px 12px", textAlign:"center" }}>
          <div style={{ fontSize:28 }}>🕺</div>
          <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.8)", marginTop:4, letterSpacing:"0.08em" }}>PERSON 2</div>
        </div>
      </div>

      <div style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:14 }}>Pass the phone · everyone guesses · couple reveals at the end</div>

      {submissions.length > 0 && (
        <div style={{ marginBottom:12, background:"rgba(244,63,94,0.06)", borderRadius:12, padding:"10px 14px", border:"1px solid rgba(244,63,94,0.15)" }}>
          <div style={{ fontSize:10, fontWeight:800, color:"rgba(244,63,94,0.7)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Played ({submissions.length})</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{submissions.map((s, i) => <span key={i} style={{ background:"rgba(244,63,94,0.1)", color:"#f43f5e", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, border:"1px solid rgba(244,63,94,0.2)" }}>✓ {s.name}</span>)}</div>
        </div>
      )}

      <input value={playerName} onChange={e => setPlayerName(e.target.value)} onKeyDown={e => e.key === "Enter" && (setCurrentQ(0), setAnimKey(0), setPhase("playing"))}
        placeholder="Your name…" style={{ ...inp, marginBottom:8, textAlign:"center" }} autoFocus />
      <button onClick={() => { setCurrentQ(0); setAnimKey(0); setPhase("playing"); }}
        style={{ ...mkBtn("#f43f5e"), marginBottom:8, fontWeight:800 }}>Take the Quiz →</button>
      {submissions.length >= 1 && <button onClick={() => setShowResults(r => !r)} style={{ ...mkBtn("rgba(255,255,255,0.07)") }}>❤️ {showResults ? "Hide" : "Reveal"} Results</button>}
      {showResults && submissions.length >= 1 && (
        <div style={{ marginTop:14, animation:"cq-slide 0.3s ease-out" }}>
          {!revealDone ? (
            <div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", textAlign:"center", marginBottom:12 }}>Couple: tap your actual answers — {Object.keys(correctAnswers).length}/{questions.length} set</div>
              {questions.map((q, i) => (
                <div key={i} style={{ marginBottom:10, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"10px 12px", border:`1.5px solid ${correctAnswers[i]?"rgba(244,63,94,0.35)":"rgba(255,255,255,0.07)"}` }}>
                  <div style={{ fontSize:11, color:"#f43f5e", marginBottom:6, fontWeight:700 }}>Q{i+1}. {q.q}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {q.opts.map(opt => (
                      <button key={opt} onClick={() => setCorrectAnswers(c => ({ ...c, [i]: opt }))}
                        style={{ padding:"5px 10px", borderRadius:8, border:`1.5px solid ${correctAnswers[i]===opt?"#34D399":"rgba(255,255,255,0.1)"}`, background:correctAnswers[i]===opt?"#34D39922":"rgba(255,255,255,0.04)", color:correctAnswers[i]===opt?"#34D399":"rgba(255,255,255,0.7)", fontFamily:font, fontSize:11, cursor:"pointer" }}>
                        {correctAnswers[i]===opt?"✓ ":""}{opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {/* Compatibility score */}
              {(() => {
                const avgScore = submissions.length ? submissions.reduce((s, sub) => s + calcScore(sub), 0) / submissions.length : 0;
                const compat = Math.round((avgScore / questions.length) * 100);
                return (
                  <div style={{ textAlign:"center", marginBottom:14, padding:"14px", background:"linear-gradient(135deg,rgba(244,63,94,0.1),rgba(168,85,247,0.1))", borderRadius:14, border:"1.5px solid rgba(244,63,94,0.2)" }}>
                    <div style={{ fontSize:10, letterSpacing:"0.2em", fontWeight:900, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", marginBottom:6 }}>COUPLE COMPATIBILITY</div>
                    <div style={{ fontSize:42, fontWeight:900, color: compat>=60?"#34D399":compat>=40?"#FBBF24":"#F87171", fontVariantNumeric:"tabular-nums" }}>{compat}%</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:4 }}>{compat>=80?"💘 Goals!":compat>=60?"❤️ Pretty solid!":compat>=40?"😅 Interesting...":"🙈 Nobody knows them!"}</div>
                  </div>
                );
              })()}
              {[...submissions].sort((a, b) => calcScore(b) - calcScore(a)).map((s, i) => {
                const sc = calcScore(s); const isExposed = sc <= 1;
                return (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:isExposed?"rgba(239,68,68,0.08)":i===0?"rgba(52,211,153,0.08)":"rgba(255,255,255,0.04)", borderRadius:10, marginBottom:6, border:`1.5px solid ${isExposed?"rgba(239,68,68,0.3)":i===0?"rgba(52,211,153,0.3)":"transparent"}`, animation:isExposed?"cq-exposed 0.4s ease-in-out":undefined }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:16 }}>{isExposed?"🙈":["🥇","🥈","🥉"][i]||`#${i+1}`}</span>
                      <span style={{ color:"#fff", fontSize:13, fontWeight:i===0?700:400 }}>{s.name}</span>
                      {isExposed && <span style={{ fontSize:10, fontWeight:900, color:"#ef4444", background:"rgba(239,68,68,0.15)", borderRadius:6, padding:"2px 6px", letterSpacing:"0.08em" }}>EXPOSED</span>}
                    </div>
                    <span style={{ fontSize:16, fontWeight:900, color:isExposed?"#ef4444":i===0?"#34D399":"rgba(255,255,255,0.7)", fontVariantNumeric:"tabular-nums" }}>{sc}/{questions.length}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Modal>
  );

  const q = questions[currentQ];
  return (
    <Modal onClose={onClose} emoji="💑" title={playerName ? `${playerName}'s turn` : "Your turn"} wide>
      <style>{`@keyframes cq-qin{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Progress */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:600, letterSpacing:"0.05em" }}>QUESTION</div>
        <div style={{ display:"flex", gap:6 }}>
          {questions.map((_, i) => <div key={i} style={{ width:9, height:9, borderRadius:"50%", background:i===currentQ?"#f43f5e":answers[i]?"#34D399":"rgba(255,255,255,0.13)", transition:"background 0.25s" }} />)}
        </div>
        <div style={{ fontSize:11, color:"#f43f5e", fontWeight:800 }}>{currentQ+1}/{questions.length}</div>
      </div>

      {/* Couple frame + question */}
      <div key={animKey} style={{ display:"flex", gap:0, marginBottom:14, borderRadius:16, overflow:"hidden", border:"1.5px solid rgba(244,63,94,0.2)", animation:"cq-qin 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ width:44, background:"linear-gradient(180deg,#be123c,#f43f5e22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>💁‍♀️</div>
        <div style={{ flex:1, background:"linear-gradient(180deg,#0D0D1E,#161628)", padding:"20px 16px", textAlign:"center" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#fff", lineHeight:1.45 }}>{q.q}</div>
        </div>
        <div style={{ width:44, background:"linear-gradient(180deg,#7e22ce,#a855f722)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🕺</div>
      </div>

      {/* Answer options */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
        {q.opts.map((opt, oi) => (
          <button key={opt} onClick={() => pickAnswer(opt)}
            style={{
              padding:"15px 10px", borderRadius:12,
              border:`2px solid ${answers[currentQ]===opt?"#f43f5e":"rgba(255,255,255,0.1)"}`,
              background:answers[currentQ]===opt?"linear-gradient(135deg,rgba(244,63,94,0.3),rgba(244,63,94,0.15))":`rgba(255,255,255,0.03)`,
              color:answers[currentQ]===opt?"#fff":"rgba(255,255,255,0.75)",
              fontFamily:font, fontSize:13, fontWeight:answers[currentQ]===opt?700:500,
              cursor:"pointer", textAlign:"center", lineHeight:1.3, transition:"all 0.15s",
              boxShadow:answers[currentQ]===opt?"0 0 16px rgba(244,63,94,0.35)":"none"
            }}>
            {opt}
          </button>
        ))}
      </div>

      <button onClick={() => { setAnswers({}); setCurrentQ(0); setPhase("setup"); }}
        style={{ marginTop:14, width:"100%", background:"transparent", border:"none", color:"rgba(255,255,255,0.25)", fontSize:12, cursor:"pointer", fontFamily:font }}>
        ← Back to lobby
      </button>
    </Modal>
  );
}

// Baby Shower: Baby Name Vote
const NAME_CATS = [
  { id: "boy",     label: "👦 Boy",    color: "#60A5FA" },
  { id: "girl",    label: "👧 Girl",   color: "#F472B6" },
  { id: "neutral", label: "💫 Either", color: "#A78BFA" },
];
function BabyNameVote({ onClose, accent }) {
  const [voterName, setVoterName]   = useState("");
  const [nameInput, setNameInput]   = useState("");
  const [category,  setCategory]    = useState("neutral");
  const [entries, setEntries]       = useState([]); // [{id, name, cat, addedBy, votes:[{voter,ts}]}]
  const [myVote,   setMyVote]       = useState(null);
  const [pulsing,  setPulsing]      = useState(null);
  const [copied,   setCopied]       = useState(false);
  const [phase,    setPhase]        = useState("name"); // "name" | "vote"

  const totalVotes = entries.reduce((s, e) => s + e.votes.length, 0);
  const maxVotes   = Math.max(...entries.map(e => e.votes.length), 0);

  const addName = () => {
    const t = nameInput.trim();
    if (!t || entries.find(e => e.name.toLowerCase() === t.toLowerCase())) return;
    setEntries(prev => [...prev, { id: Date.now(), name: t, cat: category, addedBy: voterName || "Guest", votes: [] }]);
    setNameInput("");
  };

  const vote = (id) => {
    if (!voterName.trim()) return;
    setPulsing(id);
    setTimeout(() => setPulsing(null), 500);
    setEntries(prev => prev.map(e => {
      // remove my previous vote from wherever it was
      const filtered = e.votes.filter(v => v.voter !== voterName);
      if (e.id === id) return { ...e, votes: [...filtered, { voter: voterName, ts: Date.now() }] };
      return { ...e, votes: filtered };
    }));
    setMyVote(id);
  };

  const removeEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    if (myVote === id) setMyVote(null);
  };

  const sorted = [...entries].sort((a, b) => b.votes.length - a.votes.length);
  const leader = sorted[0];

  const copyResults = () => {
    const lines = ["👶 Baby Name Vote Results\n"];
    sorted.forEach((e, i) => {
      const cat = NAME_CATS.find(c => c.id === e.cat);
      lines.push(`${i === 0 && e.votes.length > 0 ? "🏆" : `${i + 1}.`} ${e.name} ${cat?.label || ""} — ${e.votes.length} vote${e.votes.length !== 1 ? "s" : ""}`);
    });
    lines.push(`\nTotal votes: ${totalVotes}`);
    navigator.clipboard?.writeText(lines.join("\n")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (phase === "name") {
    return (
      <Modal onClose={onClose} emoji="👶" title="Baby Name Vote">
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 20 }}>What's your name? You'll vote with this identity.</p>
        <input
          value={voterName}
          onChange={e => setVoterName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && voterName.trim() && setPhase("vote")}
          placeholder="Your name or nickname…"
          style={{ ...inp, width: "100%", boxSizing: "border-box", marginBottom: 12, fontSize: 16, textAlign: "center" }}
          autoFocus
        />
        <button onClick={() => setPhase("vote")} disabled={!voterName.trim()}
          style={{ ...mkBtn(accent), width: "100%", opacity: voterName.trim() ? 1 : 0.4, cursor: voterName.trim() ? "pointer" : "default" }}>
          Enter →
        </button>
        <button onClick={() => { setVoterName("Guest"); setPhase("vote"); }}
          style={{ width: "100%", marginTop: 8, background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
          Continue as Guest
        </button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} emoji="👶" title="Baby Name Vote">
      <style>{`
        @keyframes bnv-pulse { 0%{transform:scale(1)} 30%{transform:scale(1.08)} 100%{transform:scale(1)} }
        .bnv-pulse { animation: bnv-pulse 0.45s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      {/* Voter banner */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Voting as <span style={{ color: accent, fontWeight: 700 }}>{voterName}</span></div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{totalVotes} vote{totalVotes !== 1 ? "s" : ""} cast</div>
      </div>

      {/* Add name section */}
      <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"12px 14px", marginBottom:14, border:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", gap:6, marginBottom:9 }}>
          {NAME_CATS.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              style={{ flex:1, padding:"5px 4px", borderRadius:8, border:`1.5px solid ${category===c.id?c.color:"rgba(255,255,255,0.08)"}`, background:category===c.id?c.color+"20":"transparent", color:category===c.id?c.color:"rgba(255,255,255,0.35)", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:7 }}>
          <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addName()}
            placeholder="Suggest a baby name…" style={{ ...inp, flex:1, fontSize:14 }} />
          <button onClick={addName} style={{ ...mkBtn(accent), width:"auto", padding:"10px 14px", fontSize:13 }}>+ Add</button>
        </div>
      </div>

      {/* Name tag grid */}
      {entries.length === 0 && (
        <p style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13, padding:"20px 0" }}>No names yet — suggest the first one above!</p>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:4 }}>
      {sorted.map((entry, idx) => {
        const pct   = maxVotes ? Math.round((entry.votes.length / maxVotes) * 100) : 0;
        const totalPct = totalVotes ? Math.round((entry.votes.length / totalVotes) * 100) : 0;
        const isLeader = idx === 0 && entry.votes.length > 0;
        const isMine   = myVote === entry.id;
        const catColor = NAME_CATS.find(c => c.id === entry.cat)?.color || accent;
        const voters   = entry.votes.map(v => v.voter);

        return (
          <div key={entry.id}
            className={pulsing === entry.id ? "bnv-pulse" : ""}
            onClick={() => vote(entry.id)}
            style={{ borderRadius:10, overflow:"hidden", cursor:"pointer", border:`2px solid ${isMine?catColor:"rgba(255,255,255,0.08)"}`, transition:"border-color 0.15s", position:"relative", background:"#fff", boxShadow:"0 4px 14px rgba(0,0,0,0.35)" }}>
            {/* Name tag header strip */}
            <div style={{ background:`linear-gradient(135deg,${catColor},${catColor}CC)`, padding:"5px 8px 4px", textAlign:"center" }}>
              <div style={{ fontSize:8, fontWeight:900, color:"rgba(255,255,255,0.9)", letterSpacing:"0.15em", textTransform:"uppercase" }}>HELLO</div>
              <div style={{ fontSize:7, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>my name is</div>
            </div>
            {/* Name */}
            <div style={{ padding:"8px 10px 6px", textAlign:"center", background:"#fff", position:"relative" }}>
              {isLeader && <div style={{ position:"absolute", top:4, right:5, fontSize:12 }}>🏆</div>}
              <div style={{ fontSize:16, fontWeight:900, color:"#1A0505", fontFamily:"Georgia,serif", lineHeight:1.1, wordBreak:"break-word" }}>{entry.name}</div>
              <div style={{ fontSize:9, color:catColor, fontWeight:700, marginTop:3 }}>{NAME_CATS.find(c=>c.id===entry.cat)?.label}</div>
              {/* Progress bar */}
              <div style={{ height:3, background:"rgba(0,0,0,0.08)", borderRadius:2, overflow:"hidden", margin:"6px 0 4px" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:catColor, borderRadius:2, transition:"width 0.4s cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:9, color:"rgba(0,0,0,0.4)", fontWeight:600 }}>{entry.votes.length} vote{entry.votes.length!==1?"s":""}{totalVotes>0?` · ${totalPct}%`:""}</div>
                {isMine && <span style={{ fontSize:8, color:catColor, fontWeight:800, background:catColor+"20", borderRadius:4, padding:"1px 4px" }}>✓ Mine</span>}
              </div>
              {/* Voter initials */}
              {voters.length > 0 && (
                <div style={{ display:"flex", gap:2, flexWrap:"wrap", marginTop:4 }}>
                  {voters.slice(0,5).map((v,i)=>(
                    <div key={i} title={v} style={{ width:14, height:14, borderRadius:"50%", background:catColor+"40", border:`1px solid ${catColor}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, fontWeight:800, color:catColor }}>
                      {v[0]?.toUpperCase()}
                    </div>
                  ))}
                  {voters.length>5&&<span style={{ fontSize:8, color:"rgba(0,0,0,0.3)", alignSelf:"center" }}>+{voters.length-5}</span>}
                </div>
              )}
            </div>
            {/* Delete */}
            <button onClick={e=>{e.stopPropagation();removeEntry(entry.id);}}
              style={{ position:"absolute", top:4, left:5, width:14, height:14, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.35)", color:"rgba(0,0,0,0.5)", fontSize:8, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1, padding:0 }}>
              ✕
            </button>
          </div>
        );
      })}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button onClick={copyResults}
            style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.12)", background: "transparent", color: copied ? "#4ade80" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s" }}>
            {copied ? "✓ Copied!" : "📋 Copy Results"}
          </button>
          <button onClick={() => { setPhase("name"); setVoterName(""); }}
            style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            Switch Voter
          </button>
        </div>
      )}
    </Modal>
  );
}

// Baby Shower: Gender Prediction Poll
function GenderPoll({ onClose, accent }) {
  const [votes, setVotes] = useState({ boy: 0, girl: 0 });
  const [voters, setVoters] = useState({ boy: [], girl: [] }); // voter initials
  const [myVote, setMyVote] = useState(null);
  const [voterName, setVoterName] = useState("");
  const [phase, setPhase] = useState("name"); // "name" | "vote" | "reveal"
  const [locked, setLocked] = useState(false);

  const total = votes.boy + votes.girl;
  const boyPct = total ? Math.round((votes.boy / total) * 100) : 50;
  const girlPct = 100 - boyPct;
  const winner = total > 0 ? (votes.boy > votes.girl ? "boy" : votes.girl > votes.boy ? "girl" : "tie") : null;

  const cast = (v) => {
    if (myVote || locked) return;
    setMyVote(v);
    setVotes(s => ({ ...s, [v]: s[v] + 1 }));
    const initials = voterName.trim() ? voterName.trim().slice(0, 2).toUpperCase() : "?";
    setVoters(vt => ({ ...vt, [v]: [...vt[v], initials] }));
  };

  if (phase === "name") return (
    <Modal onClose={onClose} emoji="🍼" title="Gender Prediction">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14, textAlign: "center" }}>Pass the phone — each person enters their name and votes</p>
      <input value={voterName} onChange={e => setVoterName(e.target.value)} onKeyDown={e => e.key === "Enter" && voterName.trim() && setPhase("vote")} placeholder="Your name" style={{ ...inp, marginBottom: 12 }} />
      <button onClick={() => voterName.trim() && setPhase("vote")} style={mkBtn(accent)} disabled={!voterName.trim()}>Enter Voting Booth →</button>
      {total > 0 && <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{votes.boy + votes.girl} predictions so far · <span style={{ color: accent, cursor: "pointer", fontWeight: 700 }} onClick={() => setPhase("reveal")}>See Results</span></div>}
    </Modal>
  );

  if (phase === "reveal") return (
    <Modal onClose={onClose} emoji="🎉" title="Gender Prediction — Results">
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{winner === "boy" ? "👦" : winner === "girl" ? "👧" : "🤝"}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>The crowd says…</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: winner === "boy" ? "#60A5FA" : winner === "girl" ? "#F472B6" : "#fff", marginBottom: 20 }}>{winner === "boy" ? "It's a Boy! 🔵" : winner === "girl" ? "It's a Girl! 🩷" : "Too close to call!"}</div>
        {/* Final split bar */}
        <div style={{ display: "flex", borderRadius: 14, overflow: "hidden", height: 48, marginBottom: 12 }}>
          <div style={{ width: `${boyPct}%`, background: "linear-gradient(135deg,#1D4ED8,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)", gap: 4 }}>{boyPct > 18 ? <><span>👦</span><span>{boyPct}%</span></> : ""}</div>
          <div style={{ flex: 1, background: "linear-gradient(135deg,#BE185D,#DB2777)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800, gap: 4 }}>{girlPct > 18 ? <><span>{girlPct}%</span><span>👧</span></> : ""}</div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>👦 {votes.boy} · 👧 {votes.girl} · {total} total predictions</div>
        <button onClick={() => { setPhase("name"); setMyVote(null); setVoterName(""); }} style={mkBtn("rgba(255,255,255,0.08)")}>← Vote Again</button>
      </div>
    </Modal>
  );

  // Voting phase — two massive zones
  return (
    <Modal onClose={onClose} emoji="🍼" title={`${voterName}'s Prediction`}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 12 }}>Place yourself in your team!</div>

      {/* Two giant team zones */}
      <div style={{ display: "flex", gap: 0, borderRadius: 20, overflow: "hidden", height: 200, marginBottom: 14 }}>
        {/* TEAM BLUE */}
        <button onClick={() => cast("boy")} style={{ flex: 1, background: myVote === "boy" ? "linear-gradient(160deg,#1E3A8A,#2563EB)" : myVote === "girl" ? "rgba(30,58,138,0.2)" : "linear-gradient(160deg,rgba(30,58,138,0.6),rgba(37,99,235,0.4))", border: "none", cursor: myVote ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.3s", fontFamily: "inherit", position: "relative", overflow: "hidden" }}>
          <span style={{ fontSize: 48, filter: myVote && myVote !== "boy" ? "grayscale(1)" : "none" }}>👦</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#93C5FD", letterSpacing: "0.06em" }}>TEAM BLUE</span>
          <span style={{ fontSize: 11, color: "rgba(147,197,253,0.7)", fontWeight: 600 }}>{votes.boy} predictions</span>
          {/* Avatar tokens for voters */}
          <div style={{ position: "absolute", bottom: 8, display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center", padding: "0 8px" }}>
            {voters.boy.slice(-6).map((v, i) => <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: "#1D4ED8", border: "1.5px solid #60A5FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>{v}</div>)}
          </div>
        </button>

        {/* VS divider */}
        <div style={{ width: 3, background: "linear-gradient(180deg,#EC4899,#8B5CF6,#3B82F6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", background: "#1a0a05", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff", border: "2px solid rgba(255,255,255,0.2)" }}>VS</div>
        </div>

        {/* TEAM PINK */}
        <button onClick={() => cast("girl")} style={{ flex: 1, background: myVote === "girl" ? "linear-gradient(160deg,#831843,#DB2777)" : myVote === "boy" ? "rgba(131,24,67,0.2)" : "linear-gradient(160deg,rgba(131,24,67,0.6),rgba(219,39,119,0.4))", border: "none", cursor: myVote ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.3s", fontFamily: "inherit", position: "relative", overflow: "hidden" }}>
          <span style={{ fontSize: 48, filter: myVote && myVote !== "girl" ? "grayscale(1)" : "none" }}>👧</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#F9A8D4", letterSpacing: "0.06em" }}>TEAM PINK</span>
          <span style={{ fontSize: 11, color: "rgba(249,168,212,0.7)", fontWeight: 600 }}>{votes.girl} predictions</span>
          <div style={{ position: "absolute", bottom: 8, display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center", padding: "0 8px" }}>
            {voters.girl.slice(-6).map((v, i) => <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: "#BE185D", border: "1.5px solid #F9A8D4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>{v}</div>)}
          </div>
        </button>
      </div>

      {myVote ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setPhase("name"); setMyVote(null); setVoterName(""); }} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Next Person</button>
          <button onClick={() => setPhase("reveal")} style={{ flex: 1, ...mkBtn(accent) }}>See Results 🎉</button>
        </div>
      ) : (
        <div style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Tap your team above to cast your prediction</div>
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
      {filtered.length===0&&<p style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:13}}>No cards yet — share your wisdom!</p>}
      {/* Paper advice cards */}
      {filtered.map(c=>{
        const TYPE_BG={advice:"#FFFBEB",memory:"#EFF6FF",prediction:"#F5F3FF"};
        const TYPE_STRIPE={advice:"#F59E0B",memory:"#3B82F6",prediction:"#8B5CF6"};
        const TYPE_TEXT={advice:"#78350F",memory:"#1E3A8A",prediction:"#4C1D95"};
        const bg=TYPE_BG[c.type]||"#FFFBEB",stripe=TYPE_STRIPE[c.type]||accent,textClr=TYPE_TEXT[c.type]||"#1a1a1a";
        return (
          <div key={c.id} style={{background:bg,borderRadius:12,marginBottom:14,overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>
            <div style={{background:stripe,padding:"8px 16px",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>{c.emoji}</span>
              <span style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.9)",textTransform:"uppercase",letterSpacing:"0.14em"}}>{typeLabels[c.type]}</span>
            </div>
            <div style={{padding:"16px 18px",background:`repeating-linear-gradient(transparent,transparent 27px,rgba(0,0,0,0.055) 27px,rgba(0,0,0,0.055) 28px)`,backgroundSize:"100% 28px",position:"relative"}}>
              <div style={{position:"absolute",left:36,top:0,bottom:0,width:1.5,background:"rgba(239,68,68,0.22)",pointerEvents:"none"}}/>
              <p style={{fontFamily:"Georgia,serif",fontSize:14,color:textClr,lineHeight:2,fontStyle:"italic",paddingLeft:22,margin:"0 0 12px"}}>"{c.text}"</p>
              <div style={{paddingLeft:22,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"rgba(0,0,0,0.4)",fontFamily:"Georgia,serif"}}>— {c.name}</span>
                <div style={{display:"flex",gap:6}}>
                  {["❤️","🙏","✨"].map(e=>(
                    <button key={e} onClick={()=>react(c.id,e)} style={{background:"rgba(0,0,0,0.07)",border:"none",borderRadius:6,padding:"3px 7px",cursor:"pointer",fontSize:12,fontFamily:font}}>
                      {e}{c.reactions[e]?` ${c.reactions[e]}`:""}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </Modal>
  );
}

// Housewarming: Gift Registry
function GiftRegistry({ onClose, accent }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [category, setCategory] = useState("Kitchen");
  const [claimingIdx, setClaimingIdx] = useState(null);
  const [claimerName, setClaimerName] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const cats = ["Kitchen", "Living Room", "Bedroom", "Garden", "Tech", "Decor", "Other"];
  const CAT_COLORS = { Kitchen:"#F97316", "Living Room":"#3B82F6", Bedroom:"#8B5CF6", Garden:"#22C55E", Tech:"#06B6D4", Decor:"#EC4899", Other:"#6B7280" };

  const add = () => { if (newItem.trim()) { setItems(i => [...i, { item: newItem.trim(), category, claimed: false, claimedBy: "", topPick: false }]); setNewItem(""); } };
  const startClaim = (idx) => { setClaimingIdx(idx); setClaimerName(""); };
  const confirmClaim = () => {
    if (claimingIdx === null) return;
    setItems(it => it.map((item, i) => i === claimingIdx ? { ...item, claimed: true, claimedBy: claimerName.trim() || "Someone" } : item));
    setClaimingIdx(null); setClaimerName("");
  };
  const unclaim = (idx) => setItems(it => it.map((item, i) => i === idx ? { ...item, claimed: false, claimedBy: "" } : item));
  const toggleTopPick = (idx) => setItems(it => it.map((item, i) => i === idx ? { ...item, topPick: !item.topPick } : item));
  const claimedCount = items.filter(i => i.claimed).length;
  const usedCats = [...new Set(items.map(i => i.category))];
  const displayItems = activeFilter === "All" ? items : items.filter(i => i.category === activeFilter);

  return (
    <Modal onClose={onClose} emoji="🎁" title="Gift Registry" wide>
      {/* Claim prompt overlay */}
      {claimingIdx !== null && (
        <div style={{ background: "rgba(10,5,20,0.97)", borderRadius: 16, padding: "20px 16px", marginBottom: 16, border: `1.5px solid ${accent}55`, textAlign: "center", boxShadow: `0 8px 32px ${accent}22` }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🎁</div>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 700, marginBottom: 4 }}>You're getting: <span style={{ color: accent }}>{items[claimingIdx]?.item}</span></div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Leave your name so the host knows who's bringing what!</div>
          <input value={claimerName} onChange={e => setClaimerName(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmClaim()} placeholder="Your name…" style={{ ...inp, marginBottom: 12, textAlign: "center" }} autoFocus />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={confirmClaim} style={{ ...mkBtn(accent), flex: 2 }}>🎀 Wrap It!</button>
            <button onClick={() => setClaimingIdx(null)} style={{ ...mkBtn("rgba(255,255,255,0.07)"), flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Add form */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inp, flex: "0 0 120px" }}>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Add a wish…" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>

      {/* Progress + category filter */}
      {items.length > 0 && (
        <>
          {claimedCount > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                <span>{claimedCount} of {items.length} wrapped</span>
                <span style={{ color: "#34D399", fontWeight: 700 }}>{Math.round(claimedCount / items.length * 100)}%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${claimedCount / items.length * 100}%`, background: "#34D399", borderRadius: 4, transition: "width 0.4s" }} />
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {["All", ...usedCats].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${activeFilter === f ? accent : "rgba(255,255,255,0.15)"}`, background: activeFilter === f ? `${accent}22` : "transparent", color: activeFilter === f ? accent : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                {f}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Gift card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(138px, 1fr))", gap: 10 }}>
        {displayItems.map((item) => {
          const idx = items.indexOf(item);
          const catColor = CAT_COLORS[item.category] || accent;
          return item.claimed ? (
            /* Wrapped gift card */
            <div key={idx} onClick={() => unclaim(idx)} title="Click to unwrap"
              style={{ background: `repeating-linear-gradient(45deg, ${catColor}18 0px, ${catColor}18 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 12px)`, border: `1.5px solid ${catColor}44`, borderRadius: 14, overflow: "hidden", cursor: "pointer", opacity: 0.82 }}>
              <div style={{ height: 6, background: catColor, position: "relative" }}>
                <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 6, height: "100%", background: "rgba(255,255,255,0.35)" }} />
              </div>
              <div style={{ padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>🎀</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "line-through", marginBottom: 4, lineHeight: 1.3 }}>{item.item}</div>
                <div style={{ fontSize: 10, color: "#34D399", fontWeight: 700 }}>✓ {item.claimedBy}</div>
              </div>
            </div>
          ) : (
            /* Unwrapped gift card */
            <div key={idx} style={{ background: "rgba(255,255,255,0.04)", border: `1.5px solid ${catColor}55`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ height: 6, background: catColor, position: "relative" }}>
                <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 6, height: "100%", background: "rgba(255,255,255,0.35)" }} />
              </div>
              <div style={{ padding: "12px 10px" }}>
                {item.topPick && <div style={{ fontSize: 9, fontWeight: 900, color: "#F59E0B", letterSpacing: "0.08em", marginBottom: 4 }}>⭐ TOP PICK</div>}
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{item.item}</div>
                <div style={{ fontSize: 9, color: catColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{item.category}</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => startClaim(idx)} style={{ flex: 1, background: catColor, border: "none", borderRadius: 8, padding: "7px 4px", color: "#fff", fontSize: 9, fontWeight: 800, cursor: "pointer", fontFamily: font, lineHeight: 1.2 }}>🎁 I'M GETTING THIS</button>
                  <button onClick={() => toggleTopPick(idx)} title="Mark as top pick" style={{ width: 28, background: item.topPick ? "#F59E0B22" : "rgba(255,255,255,0.06)", border: `1px solid ${item.topPick ? "#F59E0B44" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, color: item.topPick ? "#F59E0B" : "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer", padding: 0, fontFamily: font }}>⭐</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.3)" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎁</div>
          <div style={{ fontSize: 13 }}>Add items to your wish list above!</div>
        </div>
      )}
    </Modal>
  );
}

// Kitty Party: Lucky Draw
function LuckyDraw({ onClose, accent }) {
  const [members, setMembers] = useState([]);
  const [newM, setNewM] = useState("");
  const [winner, setWinner] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [drumAngle, setDrumAngle] = useState(0);
  const [ballOut, setBallOut] = useState(null);
  const [past, setPast] = useState([]);
  const spinRef = useRef(null);
  const drumRef = useRef(null);

  const BALL_COLORS = ["#EF4444","#F59E0B","#10B981","#3B82F6","#8B5CF6","#EC4899","#06B6D4","#F97316"];

  const add = () => {
    if (newM.trim() && !members.includes(newM.trim())) {
      setMembers(m => [...m, newM.trim()]);
      setNewM("");
    }
  };

  const draw = () => {
    if (members.length < 2) return;
    setSpinning(true); setWinner(null); setBallOut(null);
    let angle = drumAngle;
    let speed = 12, count = 0, maxCount = 28 + Math.floor(Math.random() * 10);
    const tick = () => {
      angle += speed;
      setDrumAngle(angle);
      count++;
      if (count > maxCount * 0.7) speed = Math.max(speed * 0.93, 1.5);
      if (count < maxCount) {
        spinRef.current = setTimeout(tick, 16);
      } else {
        const w = rand(members);
        const wIdx = members.indexOf(w);
        setWinner(w);
        setBallOut({ name: w, color: BALL_COLORS[wIdx % BALL_COLORS.length] });
        setPast(p => [...p, { name: w, date: new Date().toLocaleDateString("en-IN") }]);
        setSpinning(false);
      }
    };
    spinRef.current = setTimeout(tick, 16);
  };

  useEffect(() => () => clearTimeout(spinRef.current), []);

  const drumSlots = Math.min(members.length, 8);

  return (
    <Modal onClose={onClose} emoji="🎰" title="Lucky Draw">
      {/* Add members */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={newM} onChange={e => setNewM(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Add participant name…" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {members.map((m, i) => (
          <span key={m} style={{ background: BALL_COLORS[i % BALL_COLORS.length] + "33", border: `1px solid ${BALL_COLORS[i % BALL_COLORS.length]}55`, color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: BALL_COLORS[i % BALL_COLORS.length], display: "inline-block", flexShrink: 0 }} />
            {m}
            <span onClick={() => setMembers(ms => ms.filter(x => x !== m))} style={{ cursor: "pointer", opacity: 0.5, fontSize: 11 }}>✕</span>
          </span>
        ))}
      </div>

      {/* Lottery Drum Visual */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
        {/* Drum machine */}
        <div style={{ position: "relative", width: 200, height: 160, marginBottom: 8 }}>
          {/* Drum barrel */}
          <svg width="200" height="140" viewBox="0 0 200 140" style={{ position: "absolute", top: 0, left: 0 }}>
            {/* Barrel body */}
            <ellipse cx="100" cy="70" rx="85" ry="55" fill="rgba(30,20,10,0.9)" stroke={accent} strokeWidth="2.5" />
            {/* Barrel shine */}
            <ellipse cx="100" cy="45" rx="60" ry="20" fill="rgba(255,255,255,0.04)" />
            {/* Barrel ribs - rotating */}
            {[0, 1, 2, 3, 4].map(i => {
              const a = ((drumAngle + i * 36) % 180) * Math.PI / 180;
              const x1 = 100 + Math.sin(a) * 78;
              const y1 = 70 - Math.cos(a) * 8;
              const x2 = 100 - Math.sin(a) * 78;
              const y2 = 70 + Math.cos(a) * 8;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent + "40"} strokeWidth="1.5" />;
            })}
            {/* Balls inside drum (glimpse) */}
            {members.slice(0, drumSlots).map((m, i) => {
              const a = ((drumAngle * 1.2 + i * (360 / drumSlots)) % 360) * Math.PI / 180;
              const r = 42 + Math.sin(a * 2) * 8;
              const bx = 100 + Math.sin(a) * r;
              const by = 70 + Math.cos(a) * (r * 0.55);
              const visible = Math.abs(Math.sin(a)) > 0.1;
              return visible ? (
                <circle key={m} cx={bx} cy={by} r={11} fill={BALL_COLORS[i % BALL_COLORS.length]} opacity={0.85}>
                  <title>{m}</title>
                </circle>
              ) : null;
            })}
            {/* Drum frame overlay */}
            <ellipse cx="100" cy="70" rx="85" ry="55" fill="none" stroke={accent} strokeWidth="2.5" />
            {/* Chute opening at bottom */}
            <path d="M 85 120 Q 100 130 115 120" fill="none" stroke={accent} strokeWidth="2" />
            <line x1="85" y1="120" x2="75" y2="138" stroke={accent} strokeWidth="2" />
            <line x1="115" y1="120" x2="125" y2="138" stroke={accent} strokeWidth="2" />
            {/* Stand legs */}
            <line x1="55" y1="118" x2="40" y2="138" stroke={accent + "80"} strokeWidth="3" strokeLinecap="round" />
            <line x1="145" y1="118" x2="160" y2="138" stroke={accent + "80"} strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="138" x2="160" y2="138" stroke={accent + "80"} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Ball output chute */}
        <div style={{ width: 140, height: 52, background: "rgba(0,0,0,0.4)", border: `2px solid ${accent}50`, borderRadius: "0 0 24px 24px", borderTop: "none", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -12, position: "relative", overflow: "hidden" }}>
          {ballOut ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, animation: "slideDown 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: ballOut.color, boxShadow: `0 0 18px ${ballOut.color}80, inset 0 -4px 8px rgba(0,0,0,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                {ballOut.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          ) : spinning ? (
            <div style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Spinning…</div>
          ) : (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Chute</div>
          )}
        </div>
      </div>

      {/* Winner reveal */}
      {winner && !spinning && (
        <div style={{ textAlign: "center", padding: "18px 16px", background: `linear-gradient(135deg, ${accent}22, ${accent}08)`, borderRadius: 16, marginBottom: 14, border: `2px solid ${accent}50` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>🎉 Winner!</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 10 }}>{winner}</div>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🎰 Lucky Draw Result!\n\n🎉 The winner is *${winner}*!`)}`, "_blank")} style={{ ...mkBtn("#25D366"), padding: "8px 18px", width: "auto", fontSize: 13 }}>📤 Announce Winner</button>
        </div>
      )}

      <button onClick={draw} disabled={members.length < 2 || spinning} style={{ ...mkBtn(accent), opacity: members.length < 2 ? 0.5 : 1, marginBottom: 14 }}>
        {spinning ? "Drum spinning…" : winner ? "🎰 Draw Again" : "🎰 Start Draw"}
      </button>

      {past.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Past Winners</div>
          {past.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 5 }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>🏆 {p.name}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{p.date}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// Kitty Party: Kitty Fund Tracker
function KittyFund({ onClose, accent }) {
  const [members, setMembers] = useState([]);
  const [newM, setNewM] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState({});
  const [coinAnim, setCoinAnim] = useState(null);

  const add = () => { if (newM.trim() && !members.includes(newM.trim())) { setMembers(m => [...m, newM.trim()]); setNewM(""); } };
  const toggle = (m) => {
    if (!paid[m]) { setCoinAnim(m); setTimeout(() => setCoinAnim(null), 700); }
    setPaid(p => ({ ...p, [m]: !p[m] }));
  };
  const collected = members.filter(m => paid[m]).length * (Number(amount) || 0);
  const total = members.length * (Number(amount) || 0);
  const paidCount = members.filter(m => paid[m]).length;
  const pct = total > 0 ? collected / total : 0;
  const potFill = Math.max(0.04, pct); // fill level 0–1

  return (
    <Modal onClose={onClose} emoji="💰" title="Kitty Fund Tracker">
      <style>{`@keyframes coin-drop{0%{transform:translateY(-60px) scale(0.5);opacity:1}80%{transform:translateY(10px) scale(1.1);opacity:1}100%{transform:translateY(0) scale(1);opacity:0}}`}</style>

      {/* Setup inputs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={newM} onChange={e => setNewM(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Member name" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>+</button>
      </div>
      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount per member (₹)" type="number" style={{ ...inp, marginBottom: 14 }} />

      {/* Physical Pot SVG */}
      {members.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16, position: "relative" }}>
          {/* Coin drop animation */}
          {coinAnim && (
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", fontSize: 24, animation: "coin-drop 0.7s ease-in forwards", zIndex: 10, pointerEvents: "none" }}>🪙</div>
          )}
          {/* Pot SVG */}
          <svg width={160} height={130} viewBox="0 0 160 130" style={{ overflow: "visible" }}>
            {/* Pot shadow */}
            <ellipse cx={80} cy={125} rx={50} ry={6} fill="rgba(0,0,0,0.4)" />
            {/* Pot body */}
            <path d="M30 50 Q28 110 50 118 Q80 128 110 118 Q132 110 130 50 Z" fill="#6B2E0E" />
            {/* Money fill level */}
            <clipPath id="potClip">
              <path d="M30 50 Q28 110 50 118 Q80 128 110 118 Q132 110 130 50 Z" />
            </clipPath>
            <rect x={0} y={50 + (1 - potFill) * 68} width={160} height={80} fill={accent} opacity={0.7} clipPath="url(#potClip)" style={{ transition: "y 0.6s ease" }} />
            {/* Pot rim */}
            <ellipse cx={80} cy={50} rx={50} ry={10} fill="#8B3E12" />
            <ellipse cx={80} cy={50} rx={42} ry={7} fill="#A04818" />
            {/* Pot opening slot */}
            <rect x={68} y={40} width={24} height={5} rx={2.5} fill="#3D1400" />
            {/* Pot handles */}
            <path d="M30 70 Q14 70 14 85 Q14 100 30 100" fill="none" stroke="#6B2E0E" strokeWidth={10} strokeLinecap="round" />
            <path d="M130 70 Q146 70 146 85 Q146 100 130 100" fill="none" stroke="#6B2E0E" strokeWidth={10} strokeLinecap="round" />
            {/* Amount text inside pot */}
            {amount && paidCount > 0 && (
              <text x={80} y={95} textAnchor="middle" fontSize={14} fontWeight={900} fill="rgba(255,255,255,0.9)" fontFamily="inherit">₹{collected.toLocaleString("en-IN")}</text>
            )}
          </svg>

          {/* Stats */}
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
              {amount ? `₹${collected.toLocaleString("en-IN")}` : `${paidCount}/${members.length}`} {amount ? <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>of ₹{total.toLocaleString("en-IN")}</span> : "paid"}
            </div>
            {pct >= 1 && amount && <div style={{ fontSize: 13, fontWeight: 800, color: "#34D399", marginTop: 4 }}>🎉 Kitty complete!</div>}
          </div>
        </div>
      )}

      {/* Member tiles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {members.map(m => (
          <div key={m} onClick={() => toggle(m)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", cursor: "pointer", background: paid[m] ? accent + "22" : "rgba(255,255,255,0.05)", borderRadius: 12, border: `1.5px solid ${paid[m] ? accent : "rgba(255,255,255,0.08)"}`, transition: "all 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: paid[m] ? accent : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all 0.2s" }}>
                {paid[m] ? "🪙" : "💸"}
              </div>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: paid[m] ? 700 : 400 }}>{m}</span>
            </div>
            <span style={{ color: paid[m] ? "#34D399" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 13 }}>
              {amount ? (paid[m] ? `Paid ₹${Number(amount).toLocaleString("en-IN")}` : `₹${Number(amount).toLocaleString("en-IN")} due`) : (paid[m] ? "Paid ✓" : "Tap to mark paid")}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// Naming Ceremony: Name Suggestions Wall
const NS_CARD_COLORS = [
  { bg: "linear-gradient(135deg,#1e1b4b,#312e81)", border: "#6366f1", text: "#e0e7ff" },
  { bg: "linear-gradient(135deg,#831843,#9d174d)", border: "#f472b6", text: "#fce7f3" },
  { bg: "linear-gradient(135deg,#14532d,#166534)", border: "#4ade80", text: "#dcfce7" },
  { bg: "linear-gradient(135deg,#7c2d12,#9a3412)", border: "#fb923c", text: "#ffedd5" },
  { bg: "linear-gradient(135deg,#1e3a5f,#1d4ed8)", border: "#60a5fa", text: "#dbeafe" },
  { bg: "linear-gradient(135deg,#4a1d96,#6d28d9)", border: "#c084fc", text: "#f3e8ff" },
];

function NameSuggestions({ onClose, accent }) {
  const [voterName, setVoterName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [meaning, setMeaning] = useState("");
  const [entries, setEntries] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [pulsing, setPulsing] = useState(null);
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState("name");

  const totalVotes = entries.reduce((s, e) => s + e.votes.length, 0);

  const addSuggestion = () => {
    const t = nameInput.trim();
    if (!t || entries.find(e => e.name.toLowerCase() === t.toLowerCase())) return;
    setEntries(prev => [...prev, { id: Date.now(), name: t, meaning: meaning.trim(), suggestedBy: voterName || "Guest", votes: [] }]);
    setNameInput(""); setMeaning("");
  };

  const vote = (id) => {
    if (!voterName.trim()) return;
    setPulsing(id); setTimeout(() => setPulsing(null), 600);
    setEntries(prev => prev.map(e => {
      const filtered = e.votes.filter(v => v.voter !== voterName);
      if (e.id === id) return { ...e, votes: [...filtered, { voter: voterName, ts: Date.now() }] };
      return { ...e, votes: filtered };
    }));
    setMyVote(id);
  };

  const removeEntry = (id) => { setEntries(prev => prev.filter(e => e.id !== id)); if (myVote === id) setMyVote(null); };
  const sorted = [...entries].sort((a, b) => b.votes.length - a.votes.length);

  const copyResults = () => {
    const lines = ["🌸 Name Suggestions\n"];
    sorted.forEach((e, i) => {
      lines.push(`${i === 0 && e.votes.length > 0 ? "🏆" : `${i + 1}.`} ${e.name}${e.meaning ? ` — ${e.meaning}` : ""} (${e.votes.length} vote${e.votes.length !== 1 ? "s" : ""})`);
    });
    navigator.clipboard?.writeText(lines.join("\n")).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (phase === "name") return (
    <Modal onClose={onClose} emoji="🌸" title="Name Suggestions">
      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 20 }}>What's your name? You'll suggest and vote with this identity.</p>
      <input value={voterName} onChange={e => setVoterName(e.target.value)} onKeyDown={e => e.key === "Enter" && voterName.trim() && setPhase("main")} placeholder="Your name or nickname…" style={{ ...inp, fontSize: 16, textAlign: "center", marginBottom: 12 }} autoFocus />
      <button onClick={() => setPhase("main")} disabled={!voterName.trim()} style={{ ...mkBtn(accent), opacity: voterName.trim() ? 1 : 0.4, cursor: voterName.trim() ? "pointer" : "default" }}>Enter →</button>
      <button onClick={() => { setVoterName("Guest"); setPhase("main"); }} style={{ width: "100%", marginTop: 8, background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Continue as Guest</button>
    </Modal>
  );

  return (
    <Modal onClose={onClose} emoji="🌸" title="Name Suggestions" wide>
      <style>{`
        @keyframes ns-heartbeat{0%{transform:scale(1)}25%{transform:scale(1.4)}50%{transform:scale(1.2)}75%{transform:scale(1.35)}100%{transform:scale(1)}}
        @keyframes ns-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .ns-pulse{animation:ns-heartbeat 0.5s cubic-bezier(0.34,1.56,0.64,1);}
        .ns-leader{animation:ns-float 3s ease-in-out infinite;}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Voting as <span style={{ color: accent, fontWeight: 700 }}>{voterName}</span></div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{totalVotes} heart{totalVotes !== 1 ? "s" : ""} cast</div>
      </div>

      {/* Add suggestion */}
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "12px 14px", marginBottom: 18, border: "1px dashed rgba(255,255,255,0.12)" }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>✨ Suggest a Name</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSuggestion()} placeholder="Beautiful name…" style={{ ...inp, flex: 1, fontSize: 15, fontWeight: 700 }} />
          <button onClick={addSuggestion} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>+ Add</button>
        </div>
        <input value={meaning} onChange={e => setMeaning(e.target.value)} onKeyDown={e => e.key === "Enter" && addSuggestion()} placeholder="Meaning or significance (optional)…" style={{ ...inp, fontSize: 12 }} />
      </div>

      {/* Name Cards Grid */}
      {entries.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌸</div>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Be the first to suggest a beautiful name!</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {sorted.map((entry, idx) => {
          const colorScheme = NS_CARD_COLORS[idx % NS_CARD_COLORS.length];
          const isLeader = idx === 0 && entry.votes.length > 0;
          const isMine = myVote === entry.id;
          const voters = entry.votes.map(v => v.voter);
          return (
            <div key={entry.id} className={`${pulsing === entry.id ? "ns-pulse" : ""} ${isLeader ? "ns-leader" : ""}`}
              style={{ position: "relative", borderRadius: 18, overflow: "hidden", boxShadow: isLeader ? `0 0 28px ${colorScheme.border}60, 0 8px 32px rgba(0,0,0,0.5)` : "0 4px 20px rgba(0,0,0,0.4)" }}>
              {/* Card background */}
              <div style={{ background: colorScheme.bg, padding: "20px 16px 60px", border: `1.5px solid ${isMine ? colorScheme.border : colorScheme.border + "50"}`, borderRadius: 18 }}>
                {/* Leader crown */}
                {isLeader && (
                  <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", fontSize: 20, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>👑</div>
                )}
                {/* Rank */}
                <div style={{ position: "absolute", top: 10, left: 12, fontSize: 10, fontWeight: 800, color: colorScheme.text + "80", letterSpacing: "0.08em" }}>#{idx + 1}</div>
                {/* Delete */}
                <button onClick={e => { e.stopPropagation(); removeEntry(entry.id); }} style={{ position: "absolute", top: 8, right: 10, background: "rgba(0,0,0,0.3)", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

                {/* Name — decorative script-style */}
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "0.02em", lineHeight: 1.2, textShadow: `0 2px 12px ${colorScheme.border}80`, marginBottom: 6, fontFamily: "Georgia, serif" }}>{entry.name}</div>
                  {entry.meaning && <div style={{ fontSize: 10, color: colorScheme.text + "bb", fontStyle: "italic", lineHeight: 1.4, marginBottom: 4 }}>"{entry.meaning}"</div>}
                  <div style={{ fontSize: 9, color: colorScheme.text + "60" }}>by {entry.suggestedBy}</div>
                </div>
              </div>

              {/* Vote bar at bottom */}
              <div onClick={() => vote(entry.id)} style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: isMine ? colorScheme.border + "33" : "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderTop: `1px solid ${colorScheme.border}30`, transition: "all 0.2s" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {voters.slice(0, 4).map((v, i) => (
                    <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: colorScheme.border + "50", border: `1px solid ${colorScheme.border}`, fontSize: 7, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{v[0]?.toUpperCase()}</div>
                  ))}
                  {voters.length > 4 && <span style={{ fontSize: 9, color: colorScheme.text + "80", alignSelf: "center" }}>+{voters.length - 4}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 16, filter: isMine ? "none" : "grayscale(0.4)" }}>{isMine ? "❤️" : "🤍"}</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: isMine ? "#f472b6" : colorScheme.text, lineHeight: 1 }}>{entry.votes.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length > 0 && (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copyResults} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.12)", background: "transparent", color: copied ? "#4ade80" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {copied ? "✓ Copied!" : "📋 Copy Results"}
          </button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("🌸 Name Suggestions\n\n" + sorted.map((e, i) => `${i === 0 && e.votes.length > 0 ? "🏆" : `${i + 1}.`} ${e.name}${e.meaning ? ` — ${e.meaning}` : ""} (${e.votes.length} ❤️)`).join("\n"))}`, "_blank")} style={{ ...mkBtn("#25D366"), width: "auto", padding: "9px 14px" }}>📤 Share</button>
          <button onClick={() => { setPhase("name"); setVoterName(""); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Switch</button>
        </div>
      )}
    </Modal>
  );
}

// Blessings Wall
function BlessingsWall({ onClose, accent, placeholder }) {
  const [blessings, setBlessings] = useState([]);
  const [from, setFrom] = useState("");
  const [blessing, setBlessing] = useState("");
  const [showWall, setShowWall] = useState(false);
  const post = () => {
    if (!blessing.trim()) return;
    setBlessings(b=>[...b,{id:Date.now(),name:from.trim()||"Anonymous",text:blessing.trim()}]);
    setFrom("");setBlessing("");
  };
  if (showWall) return <DesignerWall onClose={()=>setShowWall(false)} items={blessings} title="Blessings Wall" wallEmoji="🙏" />;
  return (
    <Modal onClose={onClose} emoji="🙏" title="Blessings Wall" wide>
      {/* View wall button */}
      <button onClick={()=>setShowWall(true)} style={{...mkBtn(blessings.length?accent:"rgba(255,255,255,0.06)"),marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:`1px solid ${blessings.length?accent+"44":"rgba(255,255,255,0.08)"}`}}>
        <span>✨ View Wall</span>
        {blessings.length>0&&<span style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"1px 9px",fontSize:12,fontWeight:700}}>{blessings.length}</span>}
      </button>
      {/* Blessing card — cream paper with decorative border */}
      <div style={{position:"relative",background:"linear-gradient(135deg,#FFFBF2,#FFF7E6)",borderRadius:14,padding:"3px",marginBottom:10,boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
        {/* Decorative double border */}
        <div style={{borderRadius:12,border:"1.5px solid rgba(196,122,46,0.35)",padding:"16px 16px 14px",position:"relative"}}>
          {/* Corner ornaments */}
          {[{t:4,l:4},{t:4,r:4},{b:4,l:4},{b:4,r:4}].map((pos,i)=>(
            <div key={i} style={{position:"absolute",...(pos.t!==undefined?{top:pos.t}:{bottom:pos.b}),...(pos.l!==undefined?{left:pos.l}:{right:pos.r}),width:8,height:8,border:"1.5px solid rgba(196,122,46,0.4)",borderRadius:1}} />
          ))}
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:10,color:"rgba(120,80,20,0.6)",fontWeight:800,letterSpacing:"0.25em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>— A Blessing —</div>
          </div>
          <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="Your name" style={{width:"100%",background:"transparent",border:"none",borderBottom:"1px solid rgba(120,80,20,0.2)",padding:"6px 2px",color:"#3D2008",fontSize:13,fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box",marginBottom:10,fontStyle:"italic"}}/>
          <textarea value={blessing} onChange={e=>setBlessing(e.target.value)} placeholder={placeholder||"Write your blessing or wish…"} style={{width:"100%",background:"transparent",border:"none",padding:"4px 2px",color:"#3D2008",fontSize:13,fontFamily:"Georgia,serif",outline:"none",resize:"none",minHeight:72,lineHeight:1.8,boxSizing:"border-box",fontStyle:"italic",backgroundImage:"repeating-linear-gradient(transparent,transparent 27px,rgba(120,80,20,0.08) 27px,rgba(120,80,20,0.08) 28px)"}}/>
          <div style={{textAlign:"right",marginTop:4}}>
            <div style={{display:"inline-block",width:40,height:1,background:"rgba(120,80,20,0.2)"}} />
          </div>
        </div>
      </div>
      <button onClick={post} disabled={!blessing.trim()} style={{...mkBtn(accent),opacity:blessing.trim()?1:0.45}}>Share Blessing 🙏</button>
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
  const [players, setPlayers] = useState([]);
  const [input, setInput] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [votes, setVotes] = useState({}); // { playerName: voteCount }
  const [phase, setPhase] = useState("setup");
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState([]);

  const prompt = MLT_PROMPTS[promptIdx % MLT_PROMPTS.length];
  const addPlayer = () => { const n = input.trim(); if (n && !players.includes(n)) { setPlayers(p => [...p, n]); setInput(""); } };
  const castVote = (name) => { if (!revealed) setVotes(v => ({ ...v, [name]: (v[name] || 0) + 1 })); };
  const totalVotes = Object.values(votes).reduce((s, n) => s + n, 0);
  const maxVotes = Math.max(...Object.values(votes), 0);
  const winner = maxVotes > 0 ? players.find(p => (votes[p] || 0) === maxVotes) : null;
  const reveal = () => { setRevealed(true); if (winner) setHistory(h => [...h, { prompt, winner }]); };
  const next = () => { setPromptIdx(i => i + 1); setVotes({}); setRevealed(false); };

  return (
    <Modal onClose={onClose} emoji="🏆" title="Most Likely To" wide>
      {phase === "setup" && (<>
        <div style={{ ...crd, textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Add everyone playing. Everyone taps the person they think fits — votes pile up!</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()} placeholder="Add player name…" style={{ ...inp, flex: 1 }} />
          <button onClick={addPlayer} style={{ ...mkBtn(accent), width: "auto", padding: "10px 18px" }}>+</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {players.map(p => (
            <span key={p} style={{ background: `${accent}22`, border: `1px solid ${accent}44`, color: "#fff", padding: "5px 14px", borderRadius: 100, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
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
        {/* Central stage prompt */}
        <div style={{ background: "linear-gradient(145deg,#0a0018,#140024)", borderRadius: 20, padding: "24px 20px", textAlign: "center", marginBottom: 18, border: `2px solid ${accent}40`, boxShadow: `0 0 60px ${accent}18, inset 0 1px 0 ${accent}20`, position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 200, height: 160, background: `radial-gradient(ellipse, ${accent}22 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ fontSize: 10, fontWeight: 900, color: accent, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10, position: "relative" }}>Who is most likely to…</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.35, position: "relative" }}>{prompt}</div>
          {totalVotes > 0 && !revealed && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>{totalVotes} vote{totalVotes !== 1 ? "s" : ""} cast · keep tapping!</div>}
        </div>

        {/* Player avatars with vote piles */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 18 }}>
          {players.map(p => {
            const pVotes = votes[p] || 0;
            const isWinner = revealed && p === winner;
            const isLoser = revealed && !isWinner;
            return (
              <div key={p} onClick={() => castVote(p)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: revealed ? "default" : "pointer", userSelect: "none", transition: "all 0.3s", opacity: isLoser ? 0.28 : 1, transform: isWinner ? "scale(1.14)" : "scale(1)" }}>
                {/* Vote chips stacked above avatar */}
                <div style={{ height: 24, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, minWidth: 56 }}>
                  {Array.from({ length: Math.min(pVotes, 7) }).map((_, ci) => (
                    <div key={ci} style={{ width: 8, height: 8, borderRadius: "50%", background: accent, opacity: 1 - ci * 0.08, boxShadow: `0 0 4px ${accent}` }} />
                  ))}
                  {pVotes > 7 && <div style={{ fontSize: 9, color: accent, fontWeight: 900, lineHeight: "8px" }}>+{pVotes - 7}</div>}
                </div>
                {/* Avatar with spotlight on winner */}
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: pVotes > 0 ? `${accent}55` : "rgba(255,255,255,0.1)", border: `2.5px solid ${isWinner ? accent : pVotes > 0 ? accent + "88" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", transition: "all 0.25s", boxShadow: isWinner ? `0 0 40px ${accent}99, 0 0 10px ${accent}` : pVotes > 0 ? `0 4px 12px ${accent}44` : "none", position: "relative" }}>
                  {isWinner ? "👑" : p[0].toUpperCase()}
                  {isWinner && <div style={{ position: "absolute", inset: -10, borderRadius: "50%", background: `radial-gradient(ellipse, ${accent}35 0%, transparent 65%)`, pointerEvents: "none" }} />}
                </div>
                <div style={{ fontSize: 11, color: isWinner ? accent : pVotes > 0 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)", fontWeight: isWinner ? 800 : 500, textAlign: "center", maxWidth: 64, lineHeight: 1.2 }}>{p}</div>
                {pVotes > 0 && <div style={{ fontSize: 10, fontWeight: 800, color: accent }}>{pVotes}v</div>}
              </div>
            );
          })}
        </div>

        {!revealed ? (
          <button onClick={reveal} disabled={totalVotes === 0} style={{ ...mkBtn(accent), opacity: totalVotes === 0 ? 0.4 : 1 }}>Reveal 🎉</button>
        ) : (<>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: accent, marginBottom: 3 }}>{winner} takes the crown! 👑</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{maxVotes} of {totalVotes} vote{totalVotes !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={next} style={mkBtn(accent)}>Next Prompt →</button>
          {history.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Previous rounds</div>
              {history.slice(0, -1).map((h, i) => (
                <div key={i} style={{ ...crd, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", flex: 1 }}>{h.prompt.split(" ").slice(0, 7).join(" ")}…</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: accent, marginLeft: 10 }}>{h.winner}</span>
                </div>
              ))}
            </div>
          )}
        </>)}
      </>)}
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
  const [revealedIdx, setRevealedIdx] = useState(null);
  const [scores, setScores]   = useState({});
  const [phase, setPhase]     = useState("setup");

  const addPlayer = () => { const n = input.trim(); if (n && !players.includes(n)) { setPlayers(p => [...p, n]); setInput(""); } };
  const pickHotseat = () => { setHotseat(rand(players)); setForm({ t1:"", t2:"", lie:"" }); setPhase("write"); };
  const submitStatements = () => {
    const items = shuffle([{ text: form.t1, isLie: false }, { text: form.t2, isLie: false }, { text: form.lie, isLie: true }]);
    setShuffled(items); setGuessResult(null); setRevealedIdx(null); setPhase("guess");
  };
  const guess = (item, i) => {
    setRevealedIdx(i);
    if (item.isLie) { setGuessResult("correct"); setScores(s => { const u = {...s}; players.filter(p=>p!==hotseat).forEach(p=>{u[p]=(u[p]||0)+1;}); return u; }); }
    else { setGuessResult("wrong"); setScores(s => ({ ...s, [hotseat]: (s[hotseat]||0)+1 })); }
    setTimeout(() => setPhase("reveal"), 1200);
  };

  const CARD_LABELS = ["A", "B", "C"];
  const CARD_COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

  return (
    <Modal onClose={onClose} emoji="🤥" title="Two Truths One Lie" wide>
      <style>{`@keyframes ttl-flip{0%{transform:rotateY(90deg);opacity:0}100%{transform:rotateY(0deg);opacity:1}} @keyframes ttl-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>

      {phase === "setup" && (<>
        {/* Detective board header */}
        <div style={{ textAlign: "center", marginBottom: 20, padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>🔍 DETECTIVE BOARD</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Each player writes 2 truths & 1 lie. Group finds the lie.</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()} placeholder="Add suspect…" style={{ ...inp, flex: 1 }} />
          <button onClick={addPlayer} style={{ ...mkBtn(accent), width: "auto", padding: "10px 18px" }}>+</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {players.map((p, i) => (
            <span key={p} style={{ background: `${CARD_COLORS[i % 3]}22`, border: `1px solid ${CARD_COLORS[i % 3]}44`, color: "#fff", padding: "5px 14px", borderRadius: 100, fontSize: 13, display:"flex", alignItems:"center", gap:6 }}>
              🕵️ {p} <button onClick={() => setPlayers(pl=>pl.filter(x=>x!==p))} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",padding:0,fontSize:15 }}>×</button>
            </span>
          ))}
        </div>
        {players.length >= 2 ? <button onClick={pickHotseat} style={mkBtn(accent)}>🎲 Pick Suspect</button>
          : <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>Add at least 2 suspects to begin</div>}
        {Object.keys(scores).length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>📊 Scoreboard</div>
            {Object.entries(scores).sort(([,a],[,b])=>b-a).map(([p,s], i) => (
              <div key={p} style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:"rgba(255,255,255,0.04)", borderRadius:10, marginBottom:6, borderLeft: `3px solid ${CARD_COLORS[i % 3]}` }}>
                <span style={{ color:"#fff",fontSize:13 }}>{i === 0 ? "🏆 " : ""}{p}</span><span style={{ color:CARD_COLORS[i % 3],fontWeight:700 }}>{s} pts</span>
              </div>
            ))}
          </div>
        )}
      </>)}

      {phase === "write" && (<>
        {/* Private notepad */}
        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", border: `2px solid ${accent}40`, borderRadius: 20, padding: "20px 18px", marginBottom: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: accent }}>{hotseat}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>You're in the hot seat — write your statements privately.</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>Others should look away!</div>
        </div>

        {/* Lined notebook inputs */}
        <div style={{ background: "#FFFBEB", borderRadius: 16, padding: "16px 18px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#8B5E2A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, textAlign: "center" }}>📝 Your Statements</div>
          {[["t1","Truth 1 ✓","Something true about you…","#166534"],["t2","Truth 2 ✓","Another truth…","#166534"],["lie","The Lie 🤥","Make it convincing…","#DC2626"]].map(([k,lbl,ph,col]) => (
            <div key={k} style={{ marginBottom: 14, borderBottom: `1.5px solid #e5d8c0`, paddingBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: col, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{lbl}</div>
              <input value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={{ width: "100%", background: "transparent", border: "none", borderBottom: `2px solid ${col}30`, outline: "none", fontSize: 14, color: "#2D1E0A", fontFamily: "Georgia, serif", padding: "4px 0", boxSizing: "border-box" }} />
            </div>
          ))}
        </div>
        {form.t1.trim() && form.t2.trim() && form.lie.trim() && (
          <button onClick={submitStatements} style={mkBtn(accent)}>Show Cards to Group 🎭</button>
        )}
      </>)}

      {phase === "guess" && (<>
        {/* Detective board */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>🔍 GROUP DETECTIVES</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Which is {hotseat}'s LIE?</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Tap the card you think is the lie</div>
        </div>

        {/* Large A/B/C detective cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {shuffled.map((item, i) => {
            const col = CARD_COLORS[i];
            const isRevealed = revealedIdx !== null;
            const thisRevealed = revealedIdx === i;
            const isLieCard = item.isLie && isRevealed;
            return (
              <button key={i} onClick={() => !isRevealed && guess(item, i)} disabled={isRevealed} style={{
                padding: "0", borderRadius: 18, border: `2.5px solid ${thisRevealed ? (item.isLie ? "#EF4444" : "#22C55E") : isRevealed && item.isLie ? "#EF4444" : `${col}60`}`,
                background: thisRevealed ? (item.isLie ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.1)") : isRevealed && item.isLie ? "rgba(239,68,68,0.08)" : `${col}12`,
                cursor: isRevealed ? "default" : "pointer", fontFamily: font, overflow: "hidden",
                transform: thisRevealed ? "scale(1.02)" : "scale(1)", transition: "all 0.3s",
                animation: thisRevealed && item.isLie ? "ttl-shake 0.4s" : undefined,
                boxShadow: thisRevealed ? `0 8px 32px ${item.isLie ? "#EF444440" : "#22C55E30"}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "18px 18px" }}>
                  {/* Card label badge */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: thisRevealed ? (item.isLie ? "#EF4444" : "#22C55E") : col, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", boxShadow: `0 4px 12px ${col}60`, transition: "all 0.3s" }}>
                    {isRevealed ? (item.isLie ? "🤥" : "✓") : CARD_LABELS[i]}
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: isRevealed ? (item.isLie ? "#F87171" : "#4ADE80") : "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                      {isRevealed ? (item.isLie ? "🔴 THE LIE" : "🟢 TRUTH") : `Statement ${CARD_LABELS[i]}`}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.5 }}>{item.text}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </>)}

      {phase === "reveal" && (<>
        <div style={{ textAlign:"center", marginBottom: 24 }}>
          <div style={{ fontSize: 56, marginBottom: 12, animation: "ttl-flip 0.5s ease" }}>{guessResult==="correct" ? "🎉" : "😈"}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: guessResult==="correct" ? "#4ADE80" : "#F87171", marginBottom: 8 }}>
            {guessResult==="correct" ? "Group got it right!" : `${hotseat} fooled everyone!`}
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 18px", marginTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>The Lie Was</div>
            <div style={{ fontSize: 14, color: "#F87171", fontStyle: "italic", fontFamily: "Georgia, serif" }}>"{shuffled.find(s=>s.isLie)?.text}"</div>
          </div>
        </div>
        <button onClick={pickHotseat} style={mkBtn(accent)}>Next Suspect 🎲</button>
        <button onClick={() => setPhase("setup")} style={{ ...mkBtn("rgba(255,255,255,0.06)"), marginTop: 10 }}>View Scoreboard</button>
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
      <style>{`
        @keyframes rf-flicker{0%,100%{opacity:1}45%{opacity:0.85}50%{opacity:1}}
        @keyframes rf-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
      `}</style>
      {/* Pressure-chamber header */}
      <div style={{ position:"relative", marginBottom:20, borderRadius:16, background:"linear-gradient(180deg,#1A0A00,#2D1000)", border:"2px solid rgba(251,146,60,0.3)", padding:"18px 16px 16px", textAlign:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 0%,rgba(251,146,60,0.12),transparent 65%)", pointerEvents:"none" }} />
        <div style={{ fontSize:36, marginBottom:6, animation:"rf-pulse 1.5s ease-in-out infinite" }}>⚡</div>
        <div style={{ fontSize:11, fontWeight:900, letterSpacing:"0.2em", color:"rgba(251,146,60,0.9)", textTransform:"uppercase", animation:"rf-flicker 3s ease-in-out infinite" }}>RAPID FIRE ROUND</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:4 }}>30 seconds · answer fast · no thinking!</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {Object.keys(RF_DECKS).map((d, i) => {
          const cols=[["#EA580C","#FB923C"],["#7C3AED","#A78BFA"],["#0369A1","#38BDF8"],["#B45309","#FCD34D"]];
          const [c1,c2]=cols[i%cols.length];
          return (
            <button key={d} onClick={() => start(d)} style={{ padding:"20px 12px", borderRadius:16, background:`linear-gradient(145deg,${c1}22,${c2}11)`, border:`2px solid ${c1}44`, color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:font, textAlign:"center", lineHeight:1.5, transition:"all 0.15s", boxShadow:`0 4px 20px ${c1}22` }}
              onMouseEnter={e=>{e.currentTarget.style.background=`linear-gradient(145deg,${c1}44,${c2}22)`;e.currentTarget.style.transform="scale(1.03)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=`linear-gradient(145deg,${c1}22,${c2}11)`;e.currentTarget.style.transform="scale(1)";}}>
              {d}
            </button>
          );
        })}
      </div>
    </Modal>
  );

  if (done) {
    const answered = answers.filter(a => a.a !== "–").length;
    const speed = answered >= 8 ? "🚀 Lightning fast!" : answered >= 5 ? "⚡ Pretty quick!" : "🐢 Take your time…";
    return (
      <Modal onClose={onClose} emoji="⚡" title="Rapid Fire" wide>
        <div style={{ marginBottom:16, borderRadius:16, background:"linear-gradient(180deg,#1A0A00,#2D1000)", border:"2px solid rgba(251,146,60,0.35)", padding:"22px 16px", textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:900, letterSpacing:"0.2em", color:"rgba(251,146,60,0.8)", textTransform:"uppercase", marginBottom:10 }}>ROUND COMPLETE</div>
          <div style={{ fontSize:56, fontWeight:900, color:"#FB923C", fontVariantNumeric:"tabular-nums", lineHeight:1 }}>{answered}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginTop:4 }}>out of {answers.length} answered</div>
          <div style={{ fontSize:14, marginTop:10, color:"rgba(255,255,255,0.8)", fontWeight:700 }}>{speed}</div>
          <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden", margin:"14px 0 0" }}>
            <div style={{ height:"100%", width:`${(answered/answers.length)*100}%`, background:"linear-gradient(90deg,#EA580C,#FB923C)", borderRadius:3 }} />
          </div>
        </div>
        <div style={{ maxHeight:220, overflowY:"auto", marginBottom:14 }}>
          {answers.map((a, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:10, marginBottom:5 }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)", flex:1, marginRight:8 }}>{a.q}</span>
              <span style={{ fontSize:12, fontWeight:700, color:a.a==="–"?"rgba(255,255,255,0.2)":"#FB923C", flexShrink:0 }}>{a.a}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setDeck(null)} style={{ ...mkBtn("#EA580C"), fontWeight:900 }}>⚡ Play Again</button>
      </Modal>
    );
  }

  const parts = questions[idx].replace("?","").split(" ya ");
  const [optA,optB]=[parts[0],parts[1]||"B"];
  const isUrgent = timeLeft <= 7;
  const isCritical = timeLeft <= 3;
  return (
    <Modal onClose={onClose} emoji="⚡" title="Rapid Fire" wide>
      <style>{`
        @keyframes rf-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
        @keyframes rf-urgent{0%,100%{background:rgba(239,68,68,0.07)}50%{background:rgba(239,68,68,0.18)}}
      `}</style>
      {/* Timer row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, padding:"8px 12px", borderRadius:12, background:isUrgent?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.03)", animation:isCritical?"rf-urgent 0.6s ease-in-out infinite":undefined, transition:"background 0.3s" }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600 }}>{idx+1} / {questions.length}</div>
        <div style={{ position:"relative", width:52, height:52 }}>
          <svg width="52" height="52" style={{ transform:"rotate(-90deg)", display:"block" }}>
            <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
            <circle cx="26" cy="26" r="21" fill="none" stroke={timerColor} strokeWidth={isUrgent?5:4}
              strokeDasharray={String(2*Math.PI*21)} strokeDashoffset={String(2*Math.PI*21*(1-timeLeft/30))}
              style={{ transition:"stroke-dashoffset 1s linear,stroke 0.3s" }} strokeLinecap="round"/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:900, color:timerColor, fontVariantNumeric:"tabular-nums", transition:"color 0.3s", animation:isCritical?"rf-shake 0.3s ease-in-out infinite":undefined }}>{timeLeft}</div>
        </div>
        <div style={{ fontSize:11, color:timerColor, fontWeight:700 }}>{deck.split(" ")[0]}</div>
      </div>
      {/* Question */}
      <div style={{ background:"linear-gradient(180deg,#0A0A1A,#141428)", borderRadius:14, padding:"18px 16px", marginBottom:14, border:`2px solid ${isUrgent?"rgba(239,68,68,0.35)":"rgba(255,255,255,0.08)"}`, textAlign:"center", transition:"border-color 0.3s", boxShadow:isUrgent?"0 0 30px rgba(239,68,68,0.15)":"none" }}>
        <div style={{ fontSize:11, fontWeight:900, color:"rgba(255,165,0,0.6)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>CHOOSE ONE</div>
        <div style={{ fontSize:16, fontWeight:800, color:"#fff", lineHeight:1.4 }}>{optA} <span style={{ color:"rgba(255,255,255,0.3)", fontWeight:400 }}>ya</span> {optB}?</div>
      </div>
      {/* VS buttons */}
      <div style={{ display:"flex", gap:0, marginBottom:10, alignItems:"stretch", borderRadius:16, overflow:"hidden" }}>
        <button onClick={() => answer(optA)} style={{ flex:1, padding:"22px 14px", background:`linear-gradient(145deg,${isUrgent?"#7F1D1D":"#1E40AF"},${isUrgent?"#B91C1C":"#3B82F6"})`, border:"none", color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", textAlign:"center", fontFamily:font, lineHeight:1.3, transition:"all 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.filter="brightness(1)"}>
          {optA}
        </button>
        <div style={{ width:38, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.5)", borderLeft:"1px solid rgba(255,255,255,0.06)", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize:9, fontWeight:900, color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em", textTransform:"uppercase", writingMode:"vertical-rl" }}>ya</span>
        </div>
        <button onClick={() => answer(optB)} style={{ flex:1, padding:"22px 14px", background:`linear-gradient(145deg,${isUrgent?"#4A1D96":"#5B21B6"},${isUrgent?"#7C3AED":"#A855F7"})`, border:"none", color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", textAlign:"center", fontFamily:font, lineHeight:1.3, transition:"all 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.filter="brightness(1)"}>
          {optB}
        </button>
      </div>
      <button onClick={() => answer("–")} style={{ ...mkBtn("rgba(255,255,255,0.05)"), fontSize:12, color:"rgba(255,255,255,0.35)" }}>Skip</button>
    </Modal>
  );
}

// ── Mood Meter ────────────────────────────────────────────────────────────────
const MOOD_OPTIONS_OCC = [
  { emoji: "🔥", label: "On Fire",  color: "#EF4444", temp: 100 },
  { emoji: "😄", label: "Happy",    color: "#22C55E", temp: 70  },
  { emoji: "😎", label: "Chill",    color: "#3B82F6", temp: 40  },
  { emoji: "🤔", label: "Unsure",   color: "#F59E0B", temp: 20  },
  { emoji: "😴", label: "Sleepy",   color: "#8B5CF6", temp: 5   },
];

function MoodMeter({ onClose, accent }) {
  const [myMood, setMyMood] = useState(null);
  const [name, setName] = useState("");
  const [allMoods, setAllMoods] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const submit = () => {
    if (myMood === null || !name.trim()) return;
    setAllMoods(m => [...m, { name: name.trim(), emoji: myMood.emoji, label: myMood.label, color: myMood.color, temp: myMood.temp }]);
    setSubmitted(true);
  };

  const total = allMoods.length;
  const avgTemp = total ? allMoods.reduce((s, m) => s + m.temp, 0) / total : 30;
  const dominantMood = allMoods.length > 0
    ? allMoods.reduce((acc, m) => { acc[m.emoji] = (acc[m.emoji] || 0) + 1; return acc; }, {})
    : {};
  const topEmoji = Object.entries(dominantMood).sort((a, b) => b[1] - a[1])[0]?.[0] || "🌡️";
  const topColor = allMoods.find(m => m.emoji === topEmoji)?.color || accent;
  const vibeLabel = avgTemp > 70 ? "🔥 CHAOS MODE" : avgTemp > 40 ? "😄 Party Vibes" : avgTemp > 20 ? "😎 Chill Zone" : "😴 Need Energy";

  return (
    <Modal onClose={onClose} emoji="🌡️" title="Mood Meter" wide>
      {/* Giant Mood Orb */}
      {total > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ position: "relative", width: 160, height: 160 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(ellipse, ${topColor}30 0%, transparent 70%)` }} />
            <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: `radial-gradient(ellipse at 35% 35%, ${topColor}80, ${topColor}20)`, border: `3px solid ${topColor}60`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <span style={{ fontSize: 36 }}>{topEmoji}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", textAlign: "center", letterSpacing: "0.04em", lineHeight: 1.3 }}>{vibeLabel}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{total} vibing</span>
            </div>
            {/* Emoji particles */}
            {allMoods.slice(0, 8).map((m, i) => {
              const a = (i / Math.min(allMoods.length, 8)) * 2 * Math.PI;
              return <div key={i} style={{ position: "absolute", left: 80 + Math.cos(a) * 68 - 10, top: 80 + Math.sin(a) * 68 - 10, fontSize: 18 }}>{m.emoji}</div>;
            })}
          </div>
        </div>
      )}

      {/* Mood selector */}
      {!submitted ? (
        <>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name…" style={{ ...inp, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {MOOD_OPTIONS_OCC.map(opt => (
              <button key={opt.emoji} onClick={() => setMyMood(opt)} style={{ flex: 1, padding: "12px 4px", borderRadius: 14, border: `2px solid ${myMood?.emoji === opt.emoji ? opt.color : "rgba(255,255,255,0.1)"}`, background: myMood?.emoji === opt.emoji ? opt.color + "30" : "rgba(255,255,255,0.04)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transform: myMood?.emoji === opt.emoji ? "scale(1.1)" : "scale(1)", transition: "all 0.18s", fontFamily: font }}>
                <span style={{ fontSize: 22 }}>{opt.emoji}</span>
                <span style={{ fontSize: 9, color: myMood?.emoji === opt.emoji ? opt.color : "rgba(255,255,255,0.35)", fontWeight: 700 }}>{opt.label}</span>
              </button>
            ))}
          </div>
          {myMood && name.trim() && <button onClick={submit} style={mkBtn(accent)}>Submit Vibe 🌡️</button>}
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#4ADE80", marginBottom: 12 }}>✓ Your vibe is live!</div>
          <button onClick={() => { setSubmitted(false); setMyMood(null); setName(""); }} style={mkBtn(accent)}>Add Another</button>
        </div>
      )}

      {/* Who's what */}
      {total > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 14 }}>
          {allMoods.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 100, padding: "4px 10px", fontSize: 12 }}>
              <span>{m.emoji}</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{m.name}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ── Secret Messages — real envelope cards with seal ───────────────────────────
function SecretMessage({ onClose, accent }) {
  const [msg, setMsg] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("send");
  const [revealed, setRevealed] = useState([]);
  const send = () => {
    if (!msg.trim()) return;
    setMessages(m=>[...m,{from:name.trim()||"Anonymous 🎭",text:msg.trim()}]);
    setMsg("");setName("");setSubmitted(true);setTimeout(()=>setSubmitted(false),2500);
  };
  return (
    <Modal onClose={onClose} emoji="💌" title="Secret Messages" wide>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["send","reveal"].map(v=>(
          <button key={v} onClick={()=>setMode(v)} style={{...mkBtn(mode===v?accent:"rgba(255,255,255,0.08)"),flex:1,padding:"10px",fontSize:13}}>
            {v==="send"?"✍️ Write a Message":"📬 Open Envelopes"+(messages.length>0?` (${messages.length})`:"")}
          </button>
        ))}
      </div>

      {mode==="send"&&(<>
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'12px 16px',fontSize:12,color:'rgba(255,255,255,0.45)',textAlign:'center',marginBottom:14}}>Your message is sealed 🕵️ — only the guest of honour opens it</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (blank = Anonymous 🎭)" style={{...inp,marginBottom:10}}/>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Write your secret message…" style={{...inp,minHeight:88,resize:"vertical",marginBottom:14}}/>
        {submitted
          ?<div style={{textAlign:"center",padding:"14px",background:accent+"22",borderRadius:12,color:"#fff",fontWeight:700}}>✓ Sealed! Your envelope is hidden 💌</div>
          :<button onClick={send} disabled={!msg.trim()} style={{...mkBtn(accent),opacity:msg.trim()?1:0.4}}>Seal & Send 💌</button>
        }
      </>)}

      {mode==="reveal"&&(<>
        {messages.length===0
          ?<div style={{textAlign:"center",padding:"40px 0",color:"rgba(255,255,255,0.3)",fontSize:13}}>No messages sealed yet — ask friends to write!</div>
          :<>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:14,textAlign:"center"}}>Tap each envelope to reveal what's inside</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {messages.map((m,i)=>{
                const isOpen=revealed.includes(i);
                return isOpen?(
                  <div key={i} style={{borderRadius:12,border:`1.5px solid ${accent}44`,background:accent+"09",padding:'18px 22px',animation:'card-flip 0.35s ease-out'}}>
                    <div style={{fontSize:10,fontWeight:700,color:accent,textTransform:'uppercase',letterSpacing:'0.09em',marginBottom:8}}>From {m.from}</div>
                    <div style={{fontSize:14,color:'#fff',lineHeight:1.7,fontStyle:'italic',fontFamily:"'Georgia',serif"}}>{m.text}</div>
                  </div>
                ):(
                  <div key={i} onClick={()=>setRevealed(r=>[...r,i])} style={{cursor:'pointer',borderRadius:12,overflow:'hidden',background:'#1c1c2e',border:'1.5px solid rgba(255,255,255,0.1)',transition:'transform 0.18s,box-shadow 0.18s'}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.boxShadow=`0 8px 32px ${accent}35`;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='none';}}>
                    {/* Envelope flap triangle */}
                    <div aria-hidden style={{height:52,background:'#26263e',clipPath:'polygon(0 0,100% 0,50% 100%)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}/>
                    <div style={{padding:'58px 24px 22px',textAlign:'center'}}>
                      {/* Wax seal */}
                      <div style={{width:50,height:50,borderRadius:'50%',background:`radial-gradient(circle at 38% 35%,${accent}cc,${accent})`,margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:`0 4px 18px ${accent}55`}}>💌</div>
                      <div style={{fontSize:13,color:'rgba(255,255,255,0.55)',fontStyle:'italic',marginBottom:4}}>Tap to reveal</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.25)'}}>From: {m.from}</div>
                    </div>
                    {/* Bottom envelope fold pattern */}
                    <div aria-hidden style={{height:40,backgroundImage:`linear-gradient(135deg,rgba(255,255,255,0.03) 25%,transparent 25%) -10px 0,linear-gradient(225deg,rgba(255,255,255,0.03) 25%,transparent 25%) -10px 0`,backgroundSize:'20px 20px'}}/>
                  </div>
                );
              })}
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

  const BOX_COLORS = ["#EF4444","#F59E0B","#10B981","#3B82F6","#8B5CF6","#EC4899","#F97316","#06B6D4"];
  const BOX_PATTERNS = ["🎀","🎗️","✨","🌟","💫","🎊","🎈","🎁"];

  return (
    <Modal onClose={onClose} emoji="🎁" title="Gift Tracker" wide>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["add","list"].map(v => <button key={v} onClick={()=>setView(v)} style={{ ...mkBtn(view===v?accent:"rgba(255,255,255,0.08)"), flex:1, padding:"10px", fontSize:13 }}>
          {v==="add"?"Log Gift":"Gift Table"+(gifts.length?` (${gifts.length})`:"")}</button>)}
      </div>

      {view==="add" && (<>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "16px", marginBottom: 14, border: "1px dashed rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>🎁 Log a New Gift</div>
          {[["from","Gifted by","e.g. Priya Aunty"],["gift","What was the gift?","e.g. Amazon voucher"],["value","Value ₹ (optional)","e.g. 500"]].map(([k,lbl,ph]) => (
            <div key={k} style={{ marginBottom:10 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{lbl}</div>
              <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={inp} />
            </div>
          ))}
          <button onClick={add} disabled={!form.from.trim()||!form.gift.trim()} style={{ ...mkBtn(accent), marginTop:4, opacity:form.from.trim()&&form.gift.trim()?1:0.4 }}>+ Add to Gift Table</button>
        </div>
      </>)}

      {view==="list" && (<>
        {gifts.length===0 ? (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
            <div style={{ color:"rgba(255,255,255,0.3)",fontSize:13 }}>No gifts logged yet — add your first!</div>
          </div>
        ) : (<>
          {/* Gift table stats */}
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            <div style={{ flex:1, background:`${accent}15`, borderRadius:12, padding:"12px 14px", textAlign:"center", border:`1px solid ${accent}30` }}>
              <div style={{ fontSize:20, fontWeight:900, color:accent }}>₹{total.toLocaleString("en-IN")}</div>
              <div style={{ fontSize:10, color:`${accent}aa`, marginTop:2, fontWeight:700 }}>TOTAL VALUE</div>
            </div>
            <div style={{ flex:1, background:unthanked?"rgba(248,113,113,0.15)":"rgba(74,222,128,0.15)", borderRadius:12, padding:"12px 14px", textAlign:"center", border:`1px solid ${unthanked?"#F87171":"#4ADE80"}30` }}>
              <div style={{ fontSize:20, fontWeight:900, color:unthanked?"#F87171":"#4ADE80" }}>{unthanked}</div>
              <div style={{ fontSize:10, color:unthanked?"rgba(248,113,113,0.7)":"rgba(74,222,128,0.7)", marginTop:2, fontWeight:700 }}>THANK-YOUS LEFT</div>
            </div>
          </div>

          {/* Physical gift boxes row */}
          <div style={{ background: "linear-gradient(180deg,#1a0f04,#120a02)", borderRadius: 16, padding: "16px 12px", marginBottom: 16, border: "1px solid rgba(196,122,46,0.15)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>🎁 GIFT TABLE</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {gifts.map((g, i) => {
                const col = BOX_COLORS[i % BOX_COLORS.length];
                const rib = BOX_PATTERNS[i % BOX_PATTERNS.length];
                return (
                  <div key={g.id} onClick={() => toggleThanked(g.id)} style={{ width: 56, cursor: "pointer", textAlign: "center" }}>
                    {/* Gift box SVG */}
                    <div style={{ position: "relative", width: 56, height: 52 }}>
                      {/* Box lid */}
                      <div style={{ height: 14, background: g.thanked ? "#374151" : col, borderRadius: "6px 6px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, opacity: g.thanked ? 0.5 : 1 }}>
                        {rib}
                      </div>
                      {/* Box body */}
                      <div style={{ height: 38, background: g.thanked ? "#1F2937" : `${col}dd`, borderRadius: "0 0 6px 6px", border: `2px solid ${col}80`, display: "flex", alignItems: "center", justifyContent: "center", opacity: g.thanked ? 0.5 : 1 }}>
                        {/* Ribbon vertical */}
                        <div style={{ width: 2, height: "100%", background: "rgba(255,255,255,0.3)", position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)" }} />
                      </div>
                      {/* Thanked checkmark */}
                      {g.thanked && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 20 }}>✅</div>}
                    </div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", marginTop: 4, lineHeight: 1.3, wordBreak: "break-word" }}>{g.from.slice(0, 10)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail list */}
          {gifts.map(g => (
            <div key={g.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", background:g.thanked?"rgba(74,222,128,0.06)":"rgba(255,255,255,0.04)", borderRadius:12, marginBottom:7, borderLeft:`3px solid ${g.thanked?"#4ADE80":"rgba(255,255,255,0.1)"}` }}>
              <span style={{ fontSize: 20 }}>🎁</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:g.thanked?"rgba(255,255,255,0.45)":"#fff", textDecoration:g.thanked?"line-through":"none" }}>{g.gift}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>from <span style={{ color:"rgba(255,255,255,0.6)", fontWeight:600 }}>{g.from}</span>{g.value?<span style={{ color:accent }}> · ₹{g.value}</span>:""}</div>
              </div>
              <button onClick={()=>toggleThanked(g.id)} style={{ fontSize:10, padding:"4px 10px", borderRadius:100, border:`1.5px solid ${g.thanked?"#4ADE80":"rgba(255,255,255,0.15)"}`, background:g.thanked?"rgba(74,222,128,0.15)":"transparent", color:g.thanked?"#4ADE80":"rgba(255,255,255,0.4)", cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>{g.thanked?"✓ Thanked":"Say Thanks"}</button>
              <button onClick={()=>remove(g.id)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.2)", cursor:"pointer", fontSize:16 }}>×</button>
            </div>
          ))}
        </>)}
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
  const RSVP_META = [
    { key:'yes',   label:'CONFIRMED', badge:'✓ IN',    color:'#22c55e' },
    { key:'maybe', label:'MAYBE',     badge:'? MAYBE', color:'#f59e0b' },
    { key:'no',    label:'DECLINED',  badge:'✗ OUT',   color:'#ef4444' },
    { key:'pending',label:'PENDING',  badge:'PENDING', color:'#6b7280' },
  ];
  return (
    <Modal onClose={onClose} title="Guest List" emoji="🎟️">
      {/* Check-in board header */}
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", borderRadius:14, padding:"14px 16px", marginBottom:14, border:"1px solid rgba(99,102,241,0.2)" }}>
        <div style={{ fontSize:9, fontWeight:800, color:"rgba(165,180,252,0.6)", textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:10 }}>🎟️ GUEST CHECK-IN BOARD</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {RSVP_META.map(({ key, label, color }) => (
            <div key={key} style={{ textAlign:'center', background:`${color}12`, borderRadius:10, padding:'10px 4px', border:`1px solid ${color}30` }}>
              <div style={{ fontSize:22, fontWeight:900, color, fontVariantNumeric:"tabular-nums" }}>{counts[key]}</div>
              <div style={{ fontSize:8.5, color:`${color}99`, marginTop:3, fontWeight:800, letterSpacing:"0.08em" }}>{label}</div>
            </div>
          ))}
        </div>
        {totalAttending > 0 && (
          <div style={{ marginTop:10, background:'rgba(34,197,94,0.1)', borderRadius:8, padding:'7px 12px', fontSize:12, color:'#4ade80', fontWeight:700 }}>
            🎉 {totalAttending} attending{plusOneCount>0?` · ${plusOneCount} +1${plusOneCount!==1?'s':''}`:''} confirmed
          </div>
        )}
      </div>

      {/* Add guest form */}
      {showAdd ? (
        <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:14, marginBottom:12, border:'1.5px dashed rgba(255,255,255,0.12)' }}>
          <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>🎟️ Add Guest to List</div>
          <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Name *" style={{ ...inp, marginBottom:8 }} />
          <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="Phone (for WhatsApp)" type="tel" style={{ ...inp, marginBottom:10 }} />
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
            {[['🟢 Veg','veg'],['🔴 Non-Veg','nonveg'],['🟡 Jain','jain']].map(([lbl,val]) => (
              <button key={val} onClick={()=>setForm(p=>({...p,meal:val}))} style={{ fontSize:11, padding:'5px 10px', borderRadius:100, border:`1.5px solid ${form.meal===val?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.12)'}`, background:form.meal===val?'rgba(255,255,255,0.12)':'transparent', color:form.meal===val?'#fff':'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>{lbl}</button>
            ))}
            <button onClick={()=>setForm(p=>({...p,plusOne:!p.plusOne}))} style={{ fontSize:11, padding:'5px 10px', borderRadius:100, border:`1.5px solid ${form.plusOne?accent:'rgba(255,255,255,0.12)'}`, background:form.plusOne?accent+'22':'transparent', color:form.plusOne?accent:'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>+1 Guest</button>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={add} style={{ flex:1, background:accent, border:'none', borderRadius:9, padding:'10px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>Add to List</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'10px 16px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:font, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowAdd(true)} style={{ width:'100%', background:`${accent}15`, border:`1.5px dashed ${accent}40`, borderRadius:10, padding:'11px', color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, marginBottom:12 }}>🎟️ Add Guest to List</button>
      )}

      {/* Guest rows — wristband style */}
      {guests.length === 0 ? (
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13, padding:'28px 0' }}>No guests yet — add names above!</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {guests.map(g => {
            const rm = RSVP_META.find(r=>r.key===g.rsvp) || RSVP_META[3];
            const ph = g.phone?.replace(/\D/g,'');
            const waPhone = ph ? (ph.startsWith('91')&&ph.length===12?ph:'91'+ph) : null;
            return (
              <div key={g.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 12px', borderLeft:`4px solid ${rm.color}`, display:'flex', alignItems:'center', gap:10 }}>
                {/* Avatar */}
                <div style={{ width:34, height:34, borderRadius:'50%', background:`${rm.color}20`, border:`2px solid ${rm.color}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:rm.color, flexShrink:0 }}>{g.name[0]?.toUpperCase()}</div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:13, color:'#fff', fontWeight:700 }}>{g.name}</span>
                    {g.plusOne && <span style={{ fontSize:9, fontWeight:800, color:accent, background:accent+'22', padding:'2px 6px', borderRadius:100 }}>+1</span>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
                    {g.meal && g.meal!=='veg' && <span style={{ fontSize:9.5, color:'rgba(255,255,255,0.35)', fontWeight:600 }}>{g.meal==='nonveg'?'🔴 Non-Veg':'🟡 Jain'}</span>}
                    {waPhone && <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" style={{ fontSize:9.5, color:'#25D366', fontWeight:700, textDecoration:'none' }}>📱 {g.phone}</a>}
                  </div>
                </div>
                {/* RSVP badge */}
                <span style={{ fontSize:9, fontWeight:800, color:rm.color, background:`${rm.color}18`, padding:'3px 9px', borderRadius:100, border:`1px solid ${rm.color}30`, letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{rm.badge}</span>
                {/* Compact RSVP toggles */}
                <div style={{ display:'flex', gap:4 }}>
                  {[['✓','yes','#22c55e'],['?','maybe','#f59e0b'],['✗','no','#ef4444']].map(([lbl,val,color]) => (
                    <button key={val} onClick={()=>setRsvp(g.id,g.rsvp===val?'pending':val)} style={{ width:26, height:26, borderRadius:6, border:`1.5px solid ${g.rsvp===val?color:'rgba(255,255,255,0.1)'}`, background:g.rsvp===val?color+'22':'transparent', color:g.rsvp===val?color:'rgba(255,255,255,0.3)', fontSize:11, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{lbl}</button>
                  ))}
                </div>
                <button onClick={()=>save(guests.filter(x=>x.id!==g.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.15)', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 2px' }}>×</button>
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
        <div key={c.id} style={{marginBottom:18}}>
          {/* Restaurant menu section divider */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <div style={{flex:1,height:1,background:`linear-gradient(to right,transparent,${c.color}44)`}}/>
            <span style={{fontSize:11,fontWeight:900,color:c.color,letterSpacing:'0.14em',textTransform:'uppercase',fontFamily:'Georgia,serif'}}>{c.label}</span>
            <div style={{flex:1,height:1,background:`linear-gradient(to left,transparent,${c.color}44)`}}/>
          </div>
          {catItems.map(it => (
            <div key={it.id} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 4px',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
              <span style={{color:c.color,fontSize:18,flexShrink:0,lineHeight:1,fontWeight:900}}>•</span>
              <span style={{flex:1,fontSize:13.5,color:it.status==='done'?'rgba(255,255,255,0.3)':'#fff',fontFamily:'Georgia,serif',textDecoration:it.status==='done'?'line-through':undefined}}>{it.name}</span>
              {it.diet==='nonveg'&&<span style={{fontSize:11}}>🔴</span>}
              {it.diet==='jain'&&<span style={{fontSize:11}}>🟡</span>}
              {it.person&&<span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontStyle:'italic',fontFamily:'Georgia,serif'}}>{it.person}</span>}
              <select value={it.status} onChange={e=>setStatus(it.id,e.target.value)} style={{background:'rgba(255,255,255,0.06)',border:`1px solid ${STATUS_COLORS[it.status]}55`,borderRadius:6,color:STATUS_COLORS[it.status],fontSize:10.5,padding:'3px 6px',fontFamily:font,outline:'none',colorScheme:'dark',cursor:'pointer'}}>
                {Object.entries(STATUS_LABELS).map(([val,lbl])=><option key={val} value={val}>{lbl}</option>)}
              </select>
              <button onClick={()=>save(items.filter(x=>x.id!==it.id))} style={{background:'none',border:'none',color:'rgba(255,255,255,0.2)',cursor:'pointer',fontSize:18,lineHeight:1,padding:'0 2px'}}>×</button>
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
      {/* Blueprint header */}
      <div style={{ background:"linear-gradient(135deg,#0D1B2A,#0A1520)", borderRadius:12, padding:"12px 14px", marginBottom:14, border:"1px solid rgba(59,130,246,0.25)", backgroundImage:"radial-gradient(rgba(59,130,246,0.08) 1px, transparent 1px)", backgroundSize:"16px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"rgba(59,130,246,0.2)", border:"1.5px solid rgba(59,130,246,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🏛️</div>
          <div>
            <div style={{ fontSize:10, fontWeight:800, color:"rgba(59,130,246,0.7)", textTransform:"uppercase", letterSpacing:"0.18em" }}>VENUE BLUEPRINT</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{filled} of {fields.length} fields filled</div>
          </div>
          <div style={{ marginLeft:"auto", width:40, height:40, position:"relative" }}>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="3" />
              <circle cx="20" cy="20" r="18" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray={`${113 * filled/fields.length} 113`} strokeLinecap="round" transform="rotate(-90 20 20)" />
              <text x="20" y="24" textAnchor="middle" fontSize="10" fontWeight="800" fill="#60A5FA">{Math.round(filled/fields.length*100)}%</text>
            </svg>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
        {fields.map(f => (
          <div key={f.key} style={{ position:"relative", borderRadius:10, overflow:"hidden" }}>
            {/* Field accent strip */}
            <div style={{ height:3, background:"linear-gradient(90deg,rgba(59,130,246,0.6),rgba(59,130,246,0.2))" }} />
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderTop:"none", borderRadius:"0 0 10px 10px", padding:"10px 12px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{f.label}</div>
              <textarea value={data[f.key]||''} onChange={e=>update(f.key,e.target.value)} placeholder={f.placeholder} rows={f.rows}
                style={{ width:'100%', background:'transparent', border:'none', outline:'none', resize:'none', boxSizing:'border-box', color:'#fff', fontSize:13, fontFamily:font, lineHeight:1.55, colorScheme:'dark' }} />
            </div>
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
      {/* Add controls */}
      <div style={{ display:'flex', gap:8, marginBottom:8 }}>
        <input value={tName} onChange={e=>setTName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTable()} placeholder="Table name" style={{ flex:2, ...inp }} />
        <input type="number" value={tCap} onChange={e=>setTCap(Math.max(1,Number(e.target.value)))} min={1} max={30} style={{ width:60, ...inp, textAlign:'center' }} />
        <button onClick={addTable} style={{ ...mkBtn(accent), width:'auto', padding:'10px 14px' }}>+ Table</button>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input value={gName} onChange={e=>setGName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addGuest()} placeholder="Guest name" style={{ flex:1, ...inp }} />
        <button onClick={addGuest} style={{ ...mkBtn(accent), width:'auto', padding:'10px 14px' }}>+ Guest</button>
        {guests.length>0 && <button onClick={shareChart} style={{ ...mkBtn('#25D366'), width:'auto', padding:'10px 14px' }}>Share</button>}
      </div>

      {/* Assignment banner */}
      {selected && (
        <div style={{ background:`${accent}18`, border:`1px solid ${accent}44`, borderRadius:10, padding:'10px 14px', marginBottom:12, fontSize:13, color:accent, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
          <span>Placing <strong>{guests.find(g=>g.id===selected)?.name}</strong> — tap a table below</span>
          <button onClick={()=>setSelected(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontSize:13, fontFamily:font }}>Cancel</button>
        </div>
      )}

      {/* Floor plan */}
      {tables.length > 0 && (
        <div style={{ background:"linear-gradient(135deg,#0D1B2A,#0A1520)", borderRadius:14, padding:16, marginBottom:12, border:"1px solid rgba(59,130,246,0.2)", backgroundImage:"radial-gradient(rgba(59,130,246,0.06) 1px, transparent 1px)", backgroundSize:"20px 20px" }}>
          <div style={{ fontSize:9, fontWeight:800, color:"rgba(59,130,246,0.5)", textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:12 }}>🏛️ FLOOR PLAN · {totalSeated}/{guests.length} seated</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:12 }}>
            {tables.map(t => {
              const seated = guests.filter(g=>g.table===t.id);
              const full = seated.length >= t.cap;
              const canDrop = selected && !full;
              return (
                <div key={t.id} onClick={()=>canDrop&&assignToTable(t.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", cursor:canDrop?"pointer":"default" }}>
                  <div style={{ position:"relative", width:90, height:90, marginBottom:6 }}>
                    <div style={{ position:"absolute", inset:8, borderRadius:"50%", background:canDrop?`${accent}30`:full?"rgba(34,197,94,0.12)":"rgba(255,255,255,0.06)", border:`2px solid ${canDrop?accent:full?"#22c55e":"rgba(255,255,255,0.15)"}`, transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:10, fontWeight:700, color:full?"#22c55e":"rgba(255,255,255,0.5)", textAlign:"center" }}>{seated.length}/{t.cap}</span>
                    </div>
                    {Array.from({length: Math.min(t.cap, 8)}).map((_, si) => {
                      const angle = (si / Math.min(t.cap, 8)) * 2 * Math.PI - Math.PI/2;
                      const r = 40; const x = 45+Math.cos(angle)*r-5; const y = 45+Math.sin(angle)*r-5;
                      const hasGuest = seated[si];
                      return <div key={si} style={{ position:"absolute", left:x, top:y, width:10, height:10, borderRadius:"50%", background:hasGuest?(full?"#22c55e":accent):"rgba(255,255,255,0.1)", border:`1.5px solid ${hasGuest?(full?"#22c55e":accent+"60"):"rgba(255,255,255,0.15)"}`, transition:"background 0.2s" }} title={hasGuest?.name} />;
                    })}
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:full?"#22c55e":accent, textAlign:"center", marginBottom:4 }}>{t.name}</div>
                  {seated.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:3, justifyContent:"center", maxWidth:130 }}>
                      {seated.map(g => (
                        <span key={g.id} onClick={e=>{e.stopPropagation();removeFromTable(g.id);}} style={{ fontSize:9, padding:"1px 6px", borderRadius:100, background:`${accent}22`, color:accent, cursor:"pointer", border:`1px solid ${accent}44` }}>{g.name} ×</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unassigned guests */}
      {unassigned.length > 0 && (
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Unassigned ({unassigned.length})</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {unassigned.map(g => (
              <div key={g.id} onClick={()=>setSelected(g.id===selected?null:g.id)} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:100, background:selected===g.id?`${accent}25`:'rgba(255,255,255,0.06)', border:`1.5px solid ${selected===g.id?accent:'rgba(255,255,255,0.1)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                <span style={{ fontSize:12, color:selected===g.id?'#fff':'rgba(255,255,255,0.7)', fontWeight:selected===g.id?700:400 }}>{g.name}</span>
                {selected===g.id && <span style={{ fontSize:10, color:accent, fontWeight:800 }}>→ seat</span>}
                <button onClick={e=>{e.stopPropagation();saveG(guests.filter(x=>x.id!==g.id));}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:14, lineHeight:1 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tables.length===0 && guests.length===0 && (
        <div style={{ textAlign:'center', padding:'24px 0', color:'rgba(255,255,255,0.25)', fontSize:13, fontStyle:'italic' }}>Add tables and guests above to build your floor plan</div>
      )}
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
      {/* Money envelope — total budget */}
      <div style={{ background:"linear-gradient(135deg,#1a1207,#120d04)", borderRadius:14, padding:"14px 16px", marginBottom:16, border:"1.5px solid rgba(196,122,46,0.25)", position:"relative", overflow:"hidden" }}>
        {/* Envelope flap decoration */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:16, background:"rgba(196,122,46,0.08)", borderBottom:"1px dashed rgba(196,122,46,0.15)" }} />
        <div style={{ marginTop:12 }}>
          <div style={{ fontSize:9, fontWeight:800, color:"rgba(196,122,46,0.5)", textTransform:"uppercase", letterSpacing:"0.16em", marginBottom:6 }}>💰 TOTAL BUDGET ENVELOPE</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:22, color:'rgba(196,122,46,0.5)', fontWeight:700 }}>₹</span>
            <input type="number" value={data.total||''} onChange={e=>upd('total',e.target.value)} placeholder="0" style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:32, fontWeight:900, color:accent, fontFamily:font }} />
          </div>
          {total > 0 && <>
            <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden', margin:'12px 0 8px' }}>
              <div style={{ height:'100%', width:`${Math.min(spent/total*100,100)}%`, background:overBudget?'#ef4444':accent, borderRadius:3, transition:'width 0.3s' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:700 }}>
              <span style={{ color:'rgba(255,255,255,0.4)' }}>Spent ₹{spent.toLocaleString('en-IN')}</span>
              <span style={{ color:overBudget?'#ef4444':'#22c55e' }}>{overBudget?`⚠️ Over ₹${(spent-total).toLocaleString('en-IN')}`:`₹${remaining.toLocaleString('en-IN')} left`}</span>
            </div>
          </>}
        </div>
      </div>
      {/* Category envelopes */}
      <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.2)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:8 }}>📬 Category Envelopes</div>
      <div style={{background:'rgba(0,0,0,0.18)',borderRadius:12,overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 90px 90px',padding:'8px 14px 6px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <span style={{fontSize:9,fontWeight:800,color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'0.1em'}}>Envelope</span>
          <span style={{fontSize:9,fontWeight:800,color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'center'}}>Allotted</span>
          <span style={{fontSize:9,fontWeight:800,color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'center'}}>Spent</span>
        </div>
        {CATS.map((c,ci) => {
          const alloc = Number(data[`alloc_${c.id}`]||0);
          const act   = Number(data[`spent_${c.id}`]||0);
          const pct   = alloc > 0 ? Math.min(act/alloc*100, 100) : 0;
          const over  = alloc > 0 && act > alloc;
          return (
            <div key={c.id} style={{borderBottom:ci<CATS.length-1?'1px solid rgba(255,255,255,0.05)':undefined,padding:'10px 14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 90px 90px',gap:6,alignItems:'center',marginBottom:alloc>0?6:0}}>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <div style={{width:7,height:7,borderRadius:1,background:c.color,flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:700,color:c.color}}>{c.label}</span>
                </div>
                {[['Budget',`alloc_${c.id}`,'rgba(255,255,255,0.5)'],['Spent',`spent_${c.id}`,over?'#ef4444':'#fff']].map(([lbl,key,color]) => (
                  <div key={key} style={{display:'flex',alignItems:'center',gap:3,background:'rgba(255,255,255,0.06)',borderRadius:7,padding:'5px 8px',border:over&&key.startsWith('spent')?'1px solid rgba(239,68,68,0.25)':'1px solid transparent'}}>
                    <span style={{fontSize:10,color:'rgba(255,255,255,0.25)'}}>₹</span>
                    <input type="number" value={data[key]||''} onChange={e=>upd(key,e.target.value)} placeholder="0" style={{background:'transparent',border:'none',outline:'none',fontSize:13,fontWeight:700,color,fontFamily:"'Courier New',monospace",width:'100%',textAlign:'right'}}/>
                  </div>
                ))}
              </div>
              {alloc > 0 && <>
                <div style={{height:2,borderRadius:2,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:over?'#ef4444':c.color,borderRadius:2,transition:'width 0.3s'}}/>
                </div>
                <div style={{fontSize:9.5,color:over?'#ef4444':'rgba(255,255,255,0.28)',marginTop:3,textAlign:'right',fontWeight:700}}>{over?`Over ₹${(act-alloc).toLocaleString('en-IN')}`:`₹${(alloc-act).toLocaleString('en-IN')} free`}</div>
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
    <Modal onClose={onClose} title="Vendor Tracker" emoji="🎬" wide>
      {/* Backstage board header */}
      <div style={{ background:"linear-gradient(135deg,#1a1207,#0f0a04)", borderRadius:14, padding:"12px 14px", marginBottom:14, border:"1px solid rgba(196,122,46,0.2)" }}>
        <div style={{ fontSize:9, fontWeight:800, color:"rgba(196,122,46,0.6)", textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:8 }}>🎬 PRODUCTION BOARD</div>
        {vendors.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[['TOTAL COST',`₹${totalCost.toLocaleString('en-IN')}`,accent],['PAID',`₹${totalPaid.toLocaleString('en-IN')}`,'#22c55e'],['BALANCE',`₹${totalBal.toLocaleString('en-IN')}`,totalBal>0?'#f59e0b':'#22c55e']].map(([lbl,val,color])=>(
              <div key={lbl} style={{ textAlign:'center', background:`${color}10`, borderRadius:10, padding:'10px 6px', border:`1px solid ${color}25` }}>
                <div style={{ fontSize:16, fontWeight:900, color, fontVariantNumeric:"tabular-nums" }}>{val}</div>
                <div style={{ fontSize:8.5, color:`${color}80`, marginTop:3, fontWeight:800, letterSpacing:"0.08em" }}>{lbl}</div>
              </div>
            ))}
          </div>
        )}
        {!vendors.length && <div style={{ fontSize:12, color:"rgba(196,122,46,0.4)", fontStyle:"italic" }}>No vendors added yet. Build your backstage crew below.</div>}
      </div>

      {showAdd ? (
        <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:14, marginBottom:14, border:'1.5px dashed rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>🎬 Add to Production Board</div>
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
            <button onClick={add} style={{ flex:1, background:accent, border:'none', borderRadius:9, padding:'10px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>Add to Board</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'10px 16px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:font, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowAdd(true)} style={{ width:'100%', background:`${accent}15`, border:`1.5px dashed ${accent}40`, borderRadius:10, padding:'11px', color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, marginBottom:14 }}>🎬 Add Vendor to Board</button>
      )}

      {vendors.length === 0 ? (
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13, padding:'28px 0' }}>Add caterers, decorators, photographers…</div>
      ) : (
        /* Backstage board: group by status */
        <div>
          {Object.entries(STATUS).map(([statusKey, s]) => {
            const group = vendors.filter(v => v.status === statusKey);
            if (!group.length) return null;
            return (
              <div key={statusKey} style={{ marginBottom:16 }}>
                {/* Status lane header */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:s.color }} />
                  <span style={{ fontSize:10, fontWeight:800, color:s.color, textTransform:"uppercase", letterSpacing:"0.12em" }}>{s.label}</span>
                  <span style={{ fontSize:9, fontWeight:700, color:`${s.color}60`, background:`${s.color}12`, padding:"2px 8px", borderRadius:100 }}>{group.length}</span>
                  <div style={{ flex:1, height:1, background:`${s.color}20` }} />
                </div>
                {group.map(v => {
                  const balance = Number(v.total||0) - Number(v.deposit||0);
                  const ph = v.contact?.replace(/\D/g,'');
                  const isPhone = ph && ph.length >= 10;
                  return (
                    <div key={v.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'11px 13px', marginBottom:7, borderLeft:`3px solid ${s.color}`, display:'flex', flexDirection:'column', gap:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                            <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{v.name}</span>
                            <span style={{ fontSize:9, fontWeight:700, color:accent, background:`${accent}18`, padding:'2px 7px', borderRadius:100 }}>{v.cat}</span>
                          </div>
                          {v.contact && (isPhone
                            ? <a href={`https://wa.me/${ph.startsWith('91')&&ph.length===12?ph:'91'+ph}`} target="_blank" rel="noreferrer" style={{ fontSize:10.5, color:'#25D366', textDecoration:'none', fontWeight:700, display:'block', marginTop:2 }}>📱 {v.contact}</a>
                            : <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{v.contact}</div>
                          )}
                          {v.notes && <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.28)', fontStyle:'italic', marginTop:2 }}>{v.notes}</div>}
                        </div>
                        <button onClick={()=>save(vendors.filter(x=>x.id!==v.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.15)', cursor:'pointer', fontSize:18, lineHeight:1 }}>×</button>
                      </div>
                      {(v.total||v.deposit) && (
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5 }}>
                          {[['Total',v.total,'rgba(255,255,255,0.55)'],['Paid',v.deposit,'#22c55e'],['Bal',balance,balance>0?'#f59e0b':'#22c55e']].map(([lbl,val,color])=>(
                            <div key={lbl} style={{ textAlign:'center', background:'rgba(0,0,0,0.2)', borderRadius:7, padding:'5px 4px' }}>
                              <div style={{ fontSize:12, fontWeight:800, color, fontVariantNumeric:"tabular-nums" }}>₹{Number(val||0).toLocaleString('en-IN')}</div>
                              <div style={{ fontSize:8.5, color:'rgba(255,255,255,0.25)', marginTop:1 }}>{lbl}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Move to status */}
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {Object.entries(STATUS).filter(([key])=>key!==statusKey).map(([key,st])=>(
                          <button key={key} onClick={()=>save(vendors.map(x=>x.id===v.id?{...x,status:key}:x))} style={{ fontSize:9.5, padding:'3px 9px', borderRadius:100, border:`1px solid ${st.color}40`, background:`${st.color}10`, color:st.color, cursor:'pointer', fontFamily:font, fontWeight:700 }}>→ {st.label}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
      {/* WhatsApp-style phone shell */}
      <div style={{ background:"#111b21", borderRadius:16, overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)", marginBottom:12 }}>
        {/* WA header bar */}
        <div style={{ background:"#202c33", padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#25D366,#128C7E)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎉</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#e9edef" }}>Event Broadcast</div>
            <div style={{ fontSize:10.5, color:"#8696a0" }}>{PHASES.find(p=>p.id===phase)?.label}</div>
          </div>
          {hasVenue && <div style={{ marginLeft:"auto", fontSize:9, fontWeight:700, color:"#25D366", background:"rgba(37,211,102,0.12)", padding:"3px 8px", borderRadius:100, border:"1px solid rgba(37,211,102,0.25)" }}>✓ Venue linked</div>}
        </div>
        {/* Phase tabs */}
        <div style={{ display:"flex", gap:0, borderBottom:"1px solid rgba(255,255,255,0.05)", background:"#1a2229" }}>
          {PHASES.map(p=>(
            <button key={p.id} onClick={()=>setPhase(p.id)} style={{ flex:1, padding:"8px 4px", background:"transparent", border:"none", borderBottom:`2px solid ${phase===p.id?"#25D366":"transparent"}`, color:phase===p.id?"#25D366":"#8696a0", fontSize:9.5, fontWeight:700, cursor:"pointer", fontFamily:font, textTransform:"uppercase", letterSpacing:"0.06em" }}>{p.emoji}</button>
          ))}
        </div>
        {/* Chat bubble area */}
        <div style={{ background:"#0b141a", backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", padding:"16px 12px", minHeight:160 }}>
          {/* Outgoing chat bubble */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
            <div style={{ maxWidth:"80%", background:"#005c4b", borderRadius:"12px 0 12px 12px", padding:"10px 12px", position:"relative" }}>
              <div style={{ fontSize:12, color:"#e9edef", lineHeight:1.6, whiteSpace:"pre-wrap", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>{msg}</div>
              <div style={{ fontSize:9, color:"rgba(134,150,160,0.8)", textAlign:"right", marginTop:4 }}>12:00 PM ✓✓</div>
              {/* Bubble tail */}
              <div style={{ position:"absolute", top:0, right:-8, width:0, height:0, borderStyle:"solid", borderWidth:"0 0 10px 10px", borderColor:"transparent transparent transparent #005c4b" }} />
            </div>
          </div>
        </div>
        {/* Editable message area styled like WA input */}
        <div style={{ background:"#1f2c34", padding:"8px 12px", display:"flex", gap:8, alignItems:"flex-end" }}>
          <textarea value={msg} onChange={e=>setMsgs(m=>({...m,[phase]:e.target.value}))} rows={3}
            style={{ flex:1, background:"#2a3942", border:"none", borderRadius:10, padding:"10px 12px", color:"#e9edef", fontSize:12.5, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", outline:"none", resize:"none", lineHeight:1.6, colorScheme:"dark" }} />
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={copyText} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.12)', background:copied?'rgba(34,197,94,0.12)':'rgba(255,255,255,0.04)', color:copied?'#22c55e':'rgba(255,255,255,0.6)', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>{copied?'✓ Copied!':'📋 Copy'}</button>
        <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank')} style={{ flex:2, padding:'11px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>📤 Send via WhatsApp</button>
      </div>
    </Modal>
  );
}

// ── Appreciation Wall ─────────────────────────────────────────────────────
const STICKY_PALETTES = [
  { bg: "#FFFBEB", stripe: "#F59E0B", ink: "#78350F", rot: "-2deg" },
  { bg: "#FFF1F2", stripe: "#F43F5E", ink: "#881337", rot: "1.5deg" },
  { bg: "#F0FDF4", stripe: "#22C55E", ink: "#14532D", rot: "-1deg" },
  { bg: "#EFF6FF", stripe: "#3B82F6", ink: "#1E3A8A", rot: "2deg" },
  { bg: "#F5F3FF", stripe: "#8B5CF6", ink: "#4C1D95", rot: "-1.5deg" },
  { bg: "#FFF8ED", stripe: "#FB923C", ink: "#7C2D12", rot: "1deg" },
];

function AppreciationWall({ onClose, accent }) {
  const [honoree, setHonoree] = useState("");
  const [honoreeLocked, setHonoreeLocked] = useState(false);
  const [from, setFrom] = useState("");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);
  const [showWall, setShowWall] = useState(false);

  const post = () => {
    if (!text.trim()) return;
    setNotes(n => [...n, { id: Date.now(), name: from.trim() || "A Colleague", text: text.trim() }]);
    setFrom(""); setText("");
  };

  if (showWall) return <DesignerWall onClose={() => setShowWall(false)} items={notes} title={`${honoree || "Appreciation"} Wall`} wallEmoji="💛" />;

  if (!honoreeLocked) return (
    <Modal onClose={onClose} emoji="💛" title="Appreciation Wall" wide>
      <div style={{ textAlign: "center", padding: "12px 0 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>🌟</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Who are we celebrating?</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>Everyone will post appreciation notes for them.</div>
        <input value={honoree} onChange={e => setHonoree(e.target.value)} onKeyDown={e => e.key === "Enter" && honoree.trim() && setHonoreeLocked(true)} placeholder="Person's name…" style={{ ...inp, textAlign: "center", fontSize: 16, marginBottom: 14 }} autoFocus />
        <button onClick={() => setHonoreeLocked(true)} disabled={!honoree.trim()} style={{ ...mkBtn(accent), opacity: honoree.trim() ? 1 : 0.4 }}>Create Wall for {honoree || "…"} →</button>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} emoji="💛" title="Appreciation Wall" wide>
      {/* Central portrait */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8, background: `linear-gradient(145deg,${accent}25,${accent}10)`, border: `2px solid ${accent}44`, borderRadius: 20, padding: "18px 28px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", boxShadow: `0 8px 24px ${accent}55` }}>
            {honoree.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{honoree}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>surrounded by {notes.length} appreciation{notes.length !== 1 ? "s" : ""} 💛</div>
        </div>
      </div>

      {/* View wall button */}
      {notes.length > 0 && (
        <button onClick={() => setShowWall(true)} style={{ ...mkBtn(accent), marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span>✨ View Appreciation Wall</span>
          <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "1px 9px", fontSize: 12, fontWeight: 700 }}>{notes.length}</span>
        </button>
      )}

      {/* Post note */}
      <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Your name" style={{ ...inp, marginBottom: 8 }} />
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={`Write something kind about ${honoree}…`} style={{ ...inp, minHeight: 80, resize: "vertical", marginBottom: 10 }} />
      <button onClick={post} disabled={!text.trim()} style={{ ...mkBtn(accent), opacity: text.trim() ? 1 : 0.4, marginBottom: 20 }}>Post Appreciation 💛</button>

      {/* Sticky note preview */}
      {notes.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {notes.slice(-6).map((n, i) => {
            const p = STICKY_PALETTES[i % STICKY_PALETTES.length];
            return (
              <div key={n.id} style={{ background: p.bg, borderRadius: 3, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.35)", transform: `rotate(${p.rot})`, position: "relative" }}>
                <div style={{ background: p.stripe, height: 4 }} />
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 11.5, color: p.ink, lineHeight: 1.6, fontStyle: "italic", marginBottom: 6 }}>"{n.text}"</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: p.stripe, textTransform: "uppercase", letterSpacing: "0.08em" }}>— {n.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {notes.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13, padding: "20px 0" }}>No notes yet — be the first to appreciate!</div>}
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

  const TROPHY_COLORS = ["#FBBF24","#C0C0C0","#CD7F32","#A78BFA","#F87171","#34D399","#60A5FA","#F472B6"];

  if (phase === "setup") return (
    <Modal onClose={onClose} emoji="🏆" title="Awards Ceremony" wide>
      <div style={{ background:"linear-gradient(135deg,#1A1207,#0F0A04)", borderRadius:14, padding:"14px 16px", marginBottom:14, border:"1px solid rgba(251,191,36,0.2)" }}>
        <div style={{ fontSize:9, fontWeight:800, color:"rgba(251,191,36,0.5)", textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:10 }}>🏆 TROPHY SHELF</div>
        {awards.length === 0 ? (
          <div style={{ textAlign:"center", padding:"16px 0", color:"rgba(255,255,255,0.25)", fontSize:12, fontStyle:"italic" }}>No awards yet — add below to fill the shelf</div>
        ) : (
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {awards.map((a, i) => {
              const col = TROPHY_COLORS[i % TROPHY_COLORS.length];
              return (
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", width:72, position:"relative" }}>
                  {/* Trophy visual */}
                  <div style={{ width:36, height:40, position:"relative", marginBottom:4 }}>
                    {/* Cup */}
                    <div style={{ width:24, height:24, borderRadius:"50% 50% 0 0", background:`linear-gradient(135deg,${col}dd,${col})`, margin:"0 auto", boxShadow:`0 0 12px ${col}60` }} />
                    {/* Stem */}
                    <div style={{ width:6, height:10, background:col, margin:"0 auto", borderRadius:"0 0 2px 2px" }} />
                    {/* Base */}
                    <div style={{ height:6, background:`linear-gradient(90deg,${col}aa,${col},${col}aa)`, borderRadius:3, width:"100%", boxShadow:`0 0 8px ${col}40` }} />
                    {/* Handles */}
                    <div style={{ position:"absolute", top:4, left:-6, width:8, height:14, border:`3px solid ${col}`, borderRadius:"50%", borderRight:"none" }} />
                    <div style={{ position:"absolute", top:4, right:-6, width:8, height:14, border:`3px solid ${col}`, borderRadius:"50%", borderLeft:"none" }} />
                  </div>
                  <div style={{ fontSize:8, fontWeight:800, color:"rgba(255,255,255,0.6)", textAlign:"center", lineHeight:1.3, maxWidth:72, wordBreak:"break-word" }}>{a.cat}</div>
                  <div style={{ fontSize:8, color:col, fontWeight:700, textAlign:"center", marginTop:1 }}>{a.winner}</div>
                  <button onClick={() => setAwards(aa => aa.filter((_, j) => j !== i))} style={{ position:"absolute", top:-8, right:-6, background:"rgba(0,0,0,0.6)", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:10, lineHeight:1, width:16, height:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
        <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Award name (e.g. Best DJ)" style={inp} />
        <input value={newWinner} onChange={e => setNewWinner(e.target.value)} placeholder="Winner's name" style={inp} onKeyDown={e => e.key === "Enter" && add()} />
      </div>
      <button onClick={add} disabled={!newCat.trim()||!newWinner.trim()} style={{ ...mkBtn(accent), opacity:newCat.trim()&&newWinner.trim()?1:0.4, marginBottom:12 }}>+ Add Award</button>
      {awards.length >= 1 && (
        <button onClick={() => setPhase("ceremony")} style={{ ...mkBtn(accent) }}>
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
    <Modal onClose={onClose} emoji="🏆" title={`Award ${current+1} of ${awards.length}`}>
      <style>{`
        @keyframes award-fall{0%{transform:translateY(-8px) rotate(0deg);opacity:1}100%{transform:translateY(190px) rotate(540deg);opacity:0}}
        @keyframes award-glow{0%,100%{text-shadow:0 0 20px rgba(251,191,36,0.5)}50%{text-shadow:0 0 48px rgba(251,191,36,0.9),0 0 96px rgba(251,191,36,0.4)}}
      `}</style>
      <div style={{textAlign:"center",padding:"10px 0 20px",position:"relative",overflow:"hidden"}}>
        {/* Confetti burst on reveal */}
        {revealed&&[...Array(14)].map((_,i)=>(
          <div key={i} aria-hidden style={{position:"absolute",top:0,left:`${2+i*6.8}%`,fontSize:14+(i%3)*4,animation:`award-fall ${0.7+i*0.1}s ease-in ${i*0.05}s both`,pointerEvents:"none"}}>
            {["🎊","🎉","✨","⭐","🥳","🎈","🌟"][i%7]}
          </div>
        ))}
        {/* Award category label */}
        <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.18em",marginBottom:22,position:"relative",zIndex:1}}>{award.cat}</div>
        {!revealed ? (
          /* Spotlight drumroll */
          <div style={{position:"relative",zIndex:1}}>
            <div style={{width:96,height:96,borderRadius:"50%",background:"radial-gradient(circle,rgba(251,191,36,0.15) 0%,transparent 70%)",border:"2px solid rgba(251,191,36,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",animation:"dot-pulse 1.5s ease-in-out infinite"}}>
              <span style={{fontSize:48}}>🥁</span>
            </div>
            <div style={{fontSize:16,color:"rgba(255,255,255,0.5)",marginBottom:28,fontStyle:"italic"}}>And the award goes to…</div>
          </div>
        ) : (
          /* Winner reveal */
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontSize:54,marginBottom:12,animation:"award-glow 1.6s ease-in-out infinite"}}>🏆</div>
            <div style={{fontSize:32,fontWeight:900,color:"#FBBF24",marginBottom:8,animation:"rm-in 0.38s cubic-bezier(0.22,1,0.36,1)",letterSpacing:"-0.02em",textShadow:"0 2px 12px rgba(251,191,36,0.4)"}}>
              {award.winner}
            </div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:24,fontWeight:700}}>🏆 {award.cat}</div>
          </div>
        )}
        <button onClick={next} style={{
          ...mkBtn(!revealed?"rgba(255,255,255,0.12)":accent),
          fontSize:15,fontWeight:800,position:"relative",zIndex:1,
          boxShadow:revealed?`0 8px 24px ${accent}55`:undefined,
        }}>
          {!revealed?"✨ Reveal Winner":current<awards.length-1?"Next Award →":"🎉 Finish Ceremony"}
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
  const [newOwner, setNewOwner] = useState("");
  const [done, setDone] = useState({});
  const [showAdd, setShowAdd] = useState(false);

  const add = () => {
    if (!newItem.trim()) return;
    setItems(i => [...i, { id: Date.now(), label: newItem.trim(), time: newTime.trim(), owner: newOwner.trim() }]);
    setNewItem(""); setNewTime(""); setNewOwner("");
    setShowAdd(false);
  };

  const markDone = (id) => setDone(d => ({ ...d, [id]: !d[id] }));
  const removeItem = (id) => { setItems(ii => ii.filter(x => x.id !== id)); setDone(d => { const nd = { ...d }; delete nd[id]; return nd; }); };

  const pending = items.filter(it => !done[it.id]);
  const completed = items.filter(it => done[it.id]);
  const nextUp = pending[0] || null;
  const doneCount = completed.length;

  return (
    <Modal onClose={onClose} emoji="🎬" title="Run of Show" wide>

      {/* Stage progress bar */}
      {items.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <span>Progress</span><span>{doneCount}/{items.length} done</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${items.length ? (doneCount / items.length) * 100 : 0}%`, background: `linear-gradient(90deg, ${accent}, ${accent}cc)`, borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
        </div>
      )}

      {/* NEXT UP card */}
      {nextUp && (
        <div style={{ background: `linear-gradient(135deg, ${accent}28, ${accent}10)`, border: `2px solid ${accent}60`, borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent, display: "inline-block", boxShadow: `0 0 8px ${accent}` }} />
            NEXT UP
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {nextUp.time && <div style={{ background: accent + "33", border: `1px solid ${accent}50`, color: accent, padding: "4px 10px", borderRadius: 20, fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{nextUp.time}</div>}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{nextUp.label}</div>
              {nextUp.owner && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>👤 {nextUp.owner}</div>}
            </div>
            <button onClick={() => markDone(nextUp.id)} style={{ background: accent, border: "none", color: "#fff", padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>✓ Done</button>
          </div>
        </div>
      )}

      {/* Upcoming segments timeline */}
      {pending.slice(1).length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Up Next</div>
          <div style={{ position: "relative", paddingLeft: 24 }}>
            {/* Vertical timeline line */}
            <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, ${accent}60, transparent)`, borderRadius: 2 }} />
            {pending.slice(1).map((it, idx) => (
              <div key={it.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, position: "relative" }}>
                {/* Timeline dot */}
                <div style={{ position: "absolute", left: -20, top: 4, width: 10, height: 10, borderRadius: "50%", border: `2px solid ${accent}50`, background: "rgba(10,5,0,1)", flexShrink: 0 }} />
                <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  {it.time && <span style={{ fontSize: 11, fontWeight: 700, color: accent, minWidth: 44, flexShrink: 0 }}>{it.time}</span>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{it.label}</div>
                    {it.owner && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>👤 {it.owner}</div>}
                  </div>
                  <button onClick={() => markDone(it.id)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", padding: "4px 8px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>✓</button>
                  <button onClick={() => removeItem(it.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer", padding: "0 4px" }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DONE section */}
      {completed.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e80", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>✓ Done ({completed.length})</div>
          {completed.map(it => (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: 10, marginBottom: 5, opacity: 0.65 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {it.time && <span style={{ fontSize: 11, color: "#22c55e80", fontWeight: 700 }}>{it.time}</span>}
              <span style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>{it.label}</span>
              {it.owner && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>👤 {it.owner}</span>}
              <button onClick={() => markDone(it.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Undo</button>
            </div>
          ))}
        </div>
      )}

      {/* Add segment form */}
      {showAdd ? (
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>Add Segment</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="7:30 PM" style={{ ...inp, width: 90, flexShrink: 0 }} />
            <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Segment name…" style={{ ...inp, flex: 1 }} onKeyDown={e => e.key === "Enter" && add()} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newOwner} onChange={e => setNewOwner(e.target.value)} placeholder="Owner / team (optional)" style={{ ...inp, flex: 1 }} onKeyDown={e => e.key === "Enter" && add()} />
            <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} style={{ width: "100%", padding: "11px", borderRadius: 12, border: `1.5px dashed ${accent}50`, background: "transparent", color: accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>+ Add Segment</button>
      )}

      {items.length === 0 && !showAdd && (
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13, padding: "12px 0" }}>No segments yet. Build your show flow above.</p>
      )}

      {items.length > 0 && (
        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("🎬 *Run of Show*\n\n" + items.map(it => `${it.time ? it.time + "  " : ""}${it.label}${it.owner ? ` (${it.owner})` : ""}`).join("\n"))}`, "_blank")} style={{ ...mkBtn("#25D366"), marginTop: 4 }}>📤 Share with Team</button>
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

  "first-birthday": {
    name: "First Birthday Hub",
    emoji: "🎂",
    accent: "#F472B6",
    bg: "linear-gradient(125deg, #1a0010, #220018, #120008, #1a0010)",
    eyebrow: "1st Birthday Toolkit",
    tagline: "One year of love — make it magical",
    themes: ["Jungle Safari", "Twinkle Twinkle", "Rainbow & Clouds", "ONE Gold & White", "Unicorn Magic", "Ocean Adventure", "Princess Royal", "Lego & Blocks"],
    sections: [
      { id: "manage", label: "🎂 Manage", subtitle: "Plan the milestone celebration", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · parents RSVP instantly",     color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Party Checklist",        desc: "Guest count → auto buy list",          color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",           desc: "Split expenses with family",           color: "#DC2626" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · WhatsApp",       color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · dietary needs · status",   color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the day · live NOW tracker",  color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",     color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign",        color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",       color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Decorator · photographer · cake",      color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · reminder · thank you", color: "#25D366" },
      ]},
      { id: "fun", label: "✨ Memories", subtitle: "Capture the milestone", tools: [
        { id: "wishwall",    emoji: "🎂", title: "Wish Wall",          desc: "Everyone writes a wish for the baby",     color: "#F472B6" },
        { id: "theme",       emoji: "🎨", title: "Theme Picker",       desc: "Vote on the party theme",                 color: "#7C3AED" },
        { id: "countdown",   emoji: "⏱️", title: "Countdown Timer",    desc: "Count down to the big day",               color: "#0891B2" },
        { id: "photowall",   emoji: "📸", title: "Shared Photo Wall",  desc: "Everyone uploads their photos",           color: "#DB2777" },
        { id: "playlist",    emoji: "🎵", title: "Playlist Builder",   desc: "Baby's party playlist",                   color: "#059669" },
        { id: "moodmeter",   emoji: "🌡️", title: "Mood Meter",         desc: "Live party vibe tracker",                 color: "#10B981" },
      ]},
      { id: "games", label: "🎮 Fun", subtitle: "Games for the little one's day", tools: [
        { id: "luckydraw",   emoji: "🍀", title: "Lucky Draw",         desc: "Gift hamper lucky draw for guests",        color: "#10B981" },
        { id: "spin",        emoji: "🎪", title: "Random Picker",      desc: "Who wins the best gift?",                  color: "#2563EB" },
        { id: "mostlikelyto",emoji: "🏆", title: "Most Likely To",     desc: "Vote who the baby will grow up to be",     color: "#F59E0B" },
        { id: "rapidfire",   emoji: "⚡", title: "Rapid Fire",          desc: "Fun baby predictions · 30 seconds",        color: "#EF4444" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "End of the celebration", tools: [
        { id: "reportcard", emoji: "🏆", title: "Party Report Card", desc: "Rate the 1st birthday celebration", color: "#FBBF24" },
      ]},
    ],
  },

  "newborn-welcome": {
    name: "Newborn Welcome Hub",
    emoji: "👶",
    accent: "#34D399",
    bg: "linear-gradient(125deg, #001810, #002018, #001008, #001810)",
    eyebrow: "Newborn Welcome Toolkit",
    tagline: "Welcome the newest member home",
    themes: ["Soft Pastels", "Stork & Stars", "Nature Welcome", "Golden Welcome", "Baby Bloom", "Moon & Stars", "Royal Welcome", "Earthy Calm"],
    sections: [
      { id: "manage", label: "👶 Manage", subtitle: "Plan the homecoming", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · family RSVP instantly",      color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Welcome Checklist",      desc: "What to arrange for homecoming day",    color: "#D97706" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · WhatsApp",        color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · dietary prefs · status",    color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule homecoming day · live tracker",color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · setup area · Maps · share",   color: "#DC2626" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",        color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Decorator · caterer · deposit",         color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Announce the arrival · share photos",   color: "#25D366" },
      ]},
      { id: "ceremony", label: "🌸 Blessings", subtitle: "Meaningful moments", tools: [
        { id: "blessingswall",  emoji: "🙏", title: "Blessings Wall",    desc: "Everyone shares a blessing for the baby", color: "#34D399" },
        { id: "babynamevote",   emoji: "👶", title: "Name Vote",         desc: "Family votes on baby names",              color: "#38BDF8" },
        { id: "wishwall",       emoji: "💌", title: "Wish Wall",         desc: "Write wishes for the new arrival",        color: "#F472B6" },
        { id: "countdown",      emoji: "⏱️", title: "Countdown Timer",   desc: "Count down to homecoming",                color: "#0891B2" },
        { id: "photowall",      emoji: "📸", title: "Shared Photo Wall", desc: "First photos from the hospital & home",   color: "#DB2777" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "Wrap up the welcome", tools: [
        { id: "reportcard", emoji: "🏆", title: "Welcome Report Card", desc: "Rate the homecoming celebration", color: "#FBBF24" },
      ]},
    ],
  },

  "gender-reveal": {
    name: "Gender Reveal Hub",
    emoji: "🎀",
    accent: "#F472B6",
    bg: "linear-gradient(125deg, #0a001a, #120020, #080010, #0a001a)",
    eyebrow: "Gender Reveal Toolkit",
    tagline: "Pink or Blue — the moment everyone is waiting for",
    themes: ["Pink vs Blue Battle", "What Will It Bee?", "Twinkle Twinkle Reveal", "Balloon Drop", "Cake Cut Reveal", "Sweet or Spicy", "Team Pink Team Blue", "Smoke Bomb Reveal"],
    sections: [
      { id: "manage", label: "🎀 Manage", subtitle: "Plan the big reveal", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP instantly",      color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Reveal Checklist",       desc: "Everything needed for the moment",      color: "#D97706" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · WhatsApp",        color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Pink & blue themed refreshments",       color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the day · reveal moment",      color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · reveal zone · Maps · share",  color: "#DC2626" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",        color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Decorator · photographer · baker",      color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Invite · reminder · reveal announcement",color: "#25D366" },
      ]},
      { id: "votes", label: "🗳️ Predict", subtitle: "Pink or Blue guesses", tools: [
        { id: "genderpoll",  emoji: "🍼", title: "Gender Prediction Poll", desc: "Girl or Boy? Everyone votes",           color: "#F472B6" },
        { id: "babynamevote",emoji: "👶", title: "Baby Name Vote",         desc: "Suggest & vote on names for each gender",color: "#38BDF8" },
        { id: "theme",       emoji: "🎨", title: "Theme Picker",           desc: "Vote on the reveal setup theme",         color: "#7C3AED" },
        { id: "countdown",   emoji: "⏱️", title: "Countdown to Reveal",    desc: "Build the anticipation",                color: "#0891B2" },
        { id: "photowall",   emoji: "📸", title: "Shared Photo Wall",      desc: "Capture the reveal moment",             color: "#DB2777" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "Fun before the big reveal", tools: [
        { id: "wouldyou",    emoji: "🤷", title: "Would You Rather",   desc: "Pink or blue themed dilemmas",             color: "#7C3AED" },
        { id: "t2l",         emoji: "🤥", title: "Two Truths One Lie", desc: "Baby predictions edition",                 color: "#8B5CF6" },
        { id: "rapidfire",   emoji: "⚡", title: "Rapid Fire",          desc: "Baby predictions · 30 seconds on clock",   color: "#EF4444" },
        { id: "spin",        emoji: "🍾", title: "Random Picker",       desc: "Who wins the gender guess prize?",         color: "#2563EB" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "After the big moment", tools: [
        { id: "reportcard", emoji: "🏆", title: "Reveal Report Card", desc: "Rate the gender reveal party", color: "#FBBF24" },
      ]},
    ],
  },

  graduation: {
    name: "Graduation Hub",
    emoji: "🎓",
    accent: "#FBBF24",
    bg: "linear-gradient(125deg, #0a0800, #141000, #080600, #0a0800)",
    eyebrow: "Graduation Toolkit",
    tagline: "Years of hard work — one perfect celebration",
    themes: ["Gold & Black Classic", "College Colours", "Future is Bright", "Photo Timeline Journey", "Cap & Gown Glam", "Travel & Adventure", "Neon Grad Night", "Alumni Gala"],
    sections: [
      { id: "manage", label: "🎓 Manage", subtitle: "Plan the milestone party", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP instantly",     color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Grad Party Checklist",   desc: "Guest count → auto buy list",         color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",           desc: "Split expenses with family & friends", color: "#DC2626" },
        { id: "gifttracker", emoji: "🎁", title: "Gift Tracker",            desc: "Log gifts · track thank-yous",        color: "#16A34A" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · WhatsApp",       color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · who brings · status",      color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the day · live NOW tracker",  color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",     color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign",        color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",       color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Decorator · caterer · DJ · deposit",   color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · reminder · thank you", color: "#25D366" },
      ]},
      { id: "celebrate", label: "✨ Celebrate", subtitle: "Mark the achievement", tools: [
        { id: "wishwall",      emoji: "🎓", title: "Grad Wish Wall",     desc: "Everyone writes a message for the grad", color: "#FBBF24" },
        { id: "theme",         emoji: "🎨", title: "Theme Picker",       desc: "Vote on the party theme",                color: "#7C3AED" },
        { id: "countdown",     emoji: "⏱️", title: "Countdown Timer",    desc: "Count down to graduation day",           color: "#0891B2" },
        { id: "playlist",      emoji: "🎵", title: "Playlist Builder",   desc: "Everyone adds their graduation anthem",  color: "#059669" },
        { id: "photowall",     emoji: "📸", title: "Shared Photo Wall",  desc: "Share memories from school to today",    color: "#DB2777" },
        { id: "secretmessage", emoji: "💌", title: "Secret Messages",    desc: "Anonymous advice for the graduate",      color: "#F59E0B" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "Celebrate in style", tools: [
        { id: "truthordare",  emoji: "🎯", title: "Truth or Dare",      desc: "Graduation edition · memories & dares",  color: "#DC2626" },
        { id: "neverhavei",   emoji: "🙅", title: "Never Have I Ever",  desc: "Grad school edition · 30 rounds",        color: "#059669" },
        { id: "mostlikelyto", emoji: "🏆", title: "Most Likely To",     desc: "Who's most likely to be famous in 10yr?",color: "#F59E0B" },
        { id: "t2l",          emoji: "🤥", title: "Two Truths One Lie", desc: "College memories edition",               color: "#8B5CF6" },
        { id: "wouldyou",     emoji: "🤷", title: "Would You Rather",   desc: "Career & life choices edition",          color: "#7C3AED" },
        { id: "rapidfire",    emoji: "⚡", title: "Rapid Fire",          desc: "Ya/Na choices · 30 seconds",             color: "#EF4444" },
        { id: "hottakes",     emoji: "🌶️", title: "Hot Takes",          desc: "Grad opinions — agree or disagree",      color: "#F97316" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "End of the celebration", tools: [
        { id: "reportcard", emoji: "🏆", title: "Grad Party Report Card", desc: "Rate the graduation celebration", color: "#FBBF24" },
      ]},
    ],
  },

  wedding: {
    name: "Wedding Hub",
    emoji: "💍",
    accent: "#F9A8D4",
    bg: "linear-gradient(125deg, #0d0008, #180010, #0a0006, #0d0008)",
    eyebrow: "Wedding Toolkit",
    tagline: "The day you've always dreamed of — perfectly planned",
    themes: ["Garden Romance", "Royal Ballroom", "Fairytale Lights", "Mughal Grandeur", "Minimalist Luxe", "Bohemian Outdoor", "Golden Gala", "Floral Fantasy"],
    sections: [
      { id: "manage", label: "💍 Manage", subtitle: "Plan every detail", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP instantly",      color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Wedding Checklist",      desc: "Guest count → complete vendor list",    color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",           desc: "Split wedding expenses by family",      color: "#DC2626" },
        { id: "gifttracker", emoji: "🎁", title: "Gift Tracker",            desc: "Log gifts · track thank-you notes",     color: "#16A34A" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · dietary needs · WhatsApp",color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan courses · dietary notes · status", color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Wedding Day Timeline",   desc: "Hour-by-hour schedule · live tracker",  color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",      color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign seats",   color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",        color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Caterer · DJ · decor · deposit",        color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · invite · reminder",     color: "#25D366" },
      ]},
      { id: "fun", label: "💒 Celebration", subtitle: "Make it unforgettable", tools: [
        { id: "wishwall",      emoji: "💍", title: "Wish Wall",          desc: "Everyone writes a wish for the couple",   color: "#F9A8D4" },
        { id: "theme",         emoji: "🎨", title: "Theme Picker",       desc: "Vote on the wedding theme",               color: "#7C3AED" },
        { id: "countdown",     emoji: "⏱️", title: "Countdown Timer",    desc: "Count down to the big day",               color: "#0891B2" },
        { id: "playlist",      emoji: "🎵", title: "Playlist Builder",   desc: "Wedding day song requests",               color: "#059669" },
        { id: "photowall",     emoji: "📸", title: "Shared Photo Wall",  desc: "Everyone uploads wedding memories",       color: "#DB2777" },
        { id: "secretmessage", emoji: "💌", title: "Secret Blessings",   desc: "Anonymous wishes for the couple",         color: "#F59E0B" },
        { id: "moodmeter",     emoji: "🌡️", title: "Mood Meter",         desc: "Live wedding vibe tracker",               color: "#10B981" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "Keep the energy going", tools: [
        { id: "couplequiz",   emoji: "💑", title: "Couple Quiz",         desc: "How well do guests know the couple?",     color: "#F9A8D4" },
        { id: "truthordare",  emoji: "🎯", title: "Truth or Dare",       desc: "Wedding edition · fun for all ages",      color: "#DC2626" },
        { id: "mostlikelyto", emoji: "🏆", title: "Most Likely To",      desc: "Who's most likely to cry at the wedding?",color: "#F59E0B" },
        { id: "t2l",          emoji: "🤥", title: "Two Truths One Lie",  desc: "Love story edition — find the lie",       color: "#8B5CF6" },
        { id: "spin",         emoji: "🍾", title: "Random Picker",       desc: "Who gives the best toast?",               color: "#2563EB" },
        { id: "luckydraw",    emoji: "🍀", title: "Lucky Draw",          desc: "Guests win wedding favours",              color: "#10B981" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "Wrap up the celebration", tools: [
        { id: "reportcard", emoji: "🏆", title: "Wedding Report Card", desc: "Rate the magical day", color: "#FBBF24" },
      ]},
    ],
  },

  bachelorette: {
    name: "Bachelorette Hub",
    emoji: "🥂",
    accent: "#F472B6",
    bg: "linear-gradient(125deg, #1a0010, #220018, #120008, #1a0010)",
    eyebrow: "Bachelorette Toolkit",
    tagline: "Last night of freedom — make it legendary",
    themes: ["Glam Pink & Gold", "Garden Brunch Vibes", "Retro Disco Night", "Spa Party", "Dark & Glam", "Rooftop Night Out", "Masquerade Mystery", "Tropical Bachelorette"],
    sections: [
      { id: "manage", label: "🥂 Manage", subtitle: "Plan the perfect send-off", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · squad RSVP instantly",       color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Party Checklist",        desc: "Squad size → auto buy list",            color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",           desc: "Split the night's expenses fairly",     color: "#DC2626" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · WhatsApp",        color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food & drinks · dietary prefs",    color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Night Timeline",         desc: "Schedule the evening · live tracker",   color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",      color: "#DC2626" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",        color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Decorator · photographer · DJ",         color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Invite · reminder · dress code",        color: "#25D366" },
      ]},
      { id: "fun", label: "✨ Fun", subtitle: "Squad goals — only the best memories", tools: [
        { id: "theme",         emoji: "🎨", title: "Theme Picker",       desc: "Vote on tonight's vibe",                  color: "#7C3AED" },
        { id: "playlist",      emoji: "🎵", title: "Playlist Builder",   desc: "Everyone adds their anthem",              color: "#059669" },
        { id: "photowall",     emoji: "📸", title: "Photo Wall",         desc: "Shared album of the wild night",          color: "#DB2777" },
        { id: "secretmessage", emoji: "💌", title: "Secret Messages",    desc: "Anonymous advice for the bride/groom",    color: "#F59E0B" },
        { id: "moodmeter",     emoji: "🌡️", title: "Mood Meter",         desc: "Live party vibe tracker",                 color: "#10B981" },
        { id: "countdown",     emoji: "⏱️", title: "Countdown Timer",    desc: "Count down to the wedding day",           color: "#0891B2" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "The real reason you're here", tools: [
        { id: "truthordare",  emoji: "🎯", title: "Truth or Dare",      desc: "Bachelorette edition · things get spicy", color: "#DC2626" },
        { id: "neverhavei",   emoji: "🙅", title: "Never Have I Ever",  desc: "30 rounds · who knows the bride best?",  color: "#059669" },
        { id: "wouldyou",     emoji: "🤷", title: "Would You Rather",   desc: "Marriage dilemmas · defend your answer",  color: "#7C3AED" },
        { id: "hottakes",     emoji: "🌶️", title: "Hot Takes",          desc: "Wedding opinions — agree or disagree",    color: "#F97316" },
        { id: "t2l",          emoji: "🤥", title: "Two Truths One Lie", desc: "How well does the squad know the couple?",color: "#8B5CF6" },
        { id: "rapidfire",    emoji: "⚡", title: "Rapid Fire",          desc: "Would you? 30 seconds · no thinking",     color: "#EF4444" },
        { id: "spin",         emoji: "🍾", title: "Random Picker",       desc: "Spin to pick tonight's dare",             color: "#2563EB" },
        { id: "mostlikelyto", emoji: "🏆", title: "Most Likely To",      desc: "Who's most likely to embarrass the bride?",color: "#F59E0B" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "End of the legendary night", tools: [
        { id: "reportcard", emoji: "🏆", title: "Night Report Card", desc: "Rate the bachelorette party", color: "#FBBF24" },
      ]},
    ],
  },

  farewell: {
    name: "Farewell Hub",
    emoji: "✈️",
    accent: "#60A5FA",
    bg: "linear-gradient(125deg, #000a1a, #000e28, #000618, #000a1a)",
    eyebrow: "Farewell Toolkit",
    tagline: "Not goodbye — just see you later",
    themes: ["World Map Theme", "Memory Lane", "Gold & Confetti", "Destination Theme", "Sentimental Simple", "Travel Adventure", "Night Sky Bon Voyage", "Passport & Suitcase"],
    sections: [
      { id: "manage", label: "✈️ Manage", subtitle: "Plan the perfect send-off", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · friends RSVP instantly",     color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Farewell Checklist",     desc: "Guest count → what to arrange",         color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",           desc: "Split expenses with the group",         color: "#DC2626" },
        { id: "potluck",     emoji: "🥘", title: "Potluck Planner",        desc: "Everyone brings their signature dish",  color: "#059669" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · WhatsApp",        color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan food · dietary prefs · status",    color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the farewell · live tracker",  color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",      color: "#DC2626" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",        color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Decorator · caterer · photographer",    color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Invite · reminder · thank you",         color: "#25D366" },
      ]},
      { id: "memories", label: "💌 Memories", subtitle: "Memories they'll carry with them", tools: [
        { id: "wishwall",      emoji: "✈️", title: "Farewell Wish Wall", desc: "Everyone writes a message to take along", color: "#60A5FA" },
        { id: "secretmessage", emoji: "💌", title: "Secret Notes",       desc: "Notes to open when they miss you",        color: "#F59E0B" },
        { id: "photowall",     emoji: "📸", title: "Shared Photo Wall",  desc: "Upload your favourite shared memories",   color: "#DB2777" },
        { id: "playlist",      emoji: "🎵", title: "Playlist Builder",   desc: "Their soundtrack for the journey ahead",  color: "#059669" },
        { id: "countdown",     emoji: "⏱️", title: "Countdown Timer",    desc: "Count down to departure day",             color: "#0891B2" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "One last game together", tools: [
        { id: "truthordare",  emoji: "🎯", title: "Truth or Dare",       desc: "Farewell edition · memories & dares",    color: "#DC2626" },
        { id: "neverhavei",   emoji: "🙅", title: "Never Have I Ever",   desc: "All the things you did together",        color: "#059669" },
        { id: "wouldyou",     emoji: "🤷", title: "Would You Rather",    desc: "Life abroad dilemmas · group debates",   color: "#7C3AED" },
        { id: "mostlikelyto", emoji: "🏆", title: "Most Likely To",      desc: "Predictions for the person leaving",     color: "#F59E0B" },
        { id: "t2l",          emoji: "🤥", title: "Two Truths One Lie",  desc: "Shared memories edition",                color: "#8B5CF6" },
        { id: "rapidfire",    emoji: "⚡", title: "Rapid Fire",           desc: "Ya/Na choices · 30 seconds",             color: "#EF4444" },
        { id: "hottakes",     emoji: "🌶️", title: "Hot Takes",           desc: "Opinions on life, leaving & adventure",  color: "#F97316" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "End of the send-off", tools: [
        { id: "reportcard", emoji: "🏆", title: "Farewell Report Card", desc: "Rate the send-off party", color: "#FBBF24" },
      ]},
    ],
  },

  retirement: {
    name: "Retirement Hub",
    emoji: "🌅",
    accent: "#FCD34D",
    bg: "linear-gradient(125deg, #1a1000, #201400, #140c00, #1a1000)",
    eyebrow: "Retirement Toolkit",
    tagline: "A career well lived — now the real adventure begins",
    themes: ["Golden Years", "Out of Office Forever", "Career Journey Wall", "Travel & Freedom", "Classic Elegant", "Sunset Celebration", "Garden Soirée", "Black & Gold Gala"],
    sections: [
      { id: "manage", label: "🌅 Manage", subtitle: "Plan the milestone celebration", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · colleagues & family RSVP",   color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Party Checklist",        desc: "Guest count → auto buy list",           color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",           desc: "Split expenses by department or family",color: "#DC2626" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · WhatsApp",        color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan the celebratory dinner · status",  color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule the evening · live tracker",   color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",      color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign seats",   color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",        color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Caterer · decorator · photographer",    color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Save the date · invite · reminder",     color: "#25D366" },
      ]},
      { id: "tribute", label: "🏆 Tribute", subtitle: "Celebrate the career", tools: [
        { id: "wishwall",        emoji: "🌅", title: "Tribute Wall",       desc: "Colleagues & family write tributes",      color: "#FCD34D" },
        { id: "awardsceremony",  emoji: "🏆", title: "Awards Ceremony",    desc: "Career achievement awards · reveal live", color: "#F59E0B" },
        { id: "appreciationwall",emoji: "💌", title: "Appreciation Wall",  desc: "Heartfelt shoutouts from the team",      color: "#EC4899" },
        { id: "photowall",       emoji: "📸", title: "Photo Wall",         desc: "Career photos from first day to last",    color: "#DB2777" },
        { id: "countdown",       emoji: "⏱️", title: "Countdown Timer",    desc: "Count down to the last working day",      color: "#0891B2" },
      ]},
      { id: "games", label: "🎮 Fun", subtitle: "Lighthearted celebration", tools: [
        { id: "mostlikelyto", emoji: "🏆", title: "Most Likely To",     desc: "Career edition · who will miss the office?",color: "#F59E0B" },
        { id: "t2l",          emoji: "🤥", title: "Two Truths One Lie", desc: "Career memories — find the lie",            color: "#8B5CF6" },
        { id: "rapidfire",    emoji: "⚡", title: "Rapid Fire",          desc: "Retirement plans · quick fire round",       color: "#EF4444" },
        { id: "wouldyou",     emoji: "🤷", title: "Would You Rather",   desc: "Retirement dilemmas · group laughs",        color: "#7C3AED" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "End of a legendary career", tools: [
        { id: "reportcard", emoji: "🏆", title: "Party Report Card", desc: "Rate the retirement celebration", color: "#FBBF24" },
      ]},
    ],
  },

  "diwali-party": {
    name: "Diwali Party Hub",
    emoji: "🪔",
    accent: "#F59E0B",
    bg: "linear-gradient(125deg, #1a0800, #221000, #140600, #1a0800)",
    eyebrow: "Diwali Toolkit",
    tagline: "Lights, laughter, and lots of mithai",
    themes: ["Diyas & Rangoli", "Gold & Deep Maroon", "Lantern Garden", "Modern Festive", "Royal Mughal", "Marigold Magic", "Crystal Lights", "Traditional Puja Setup"],
    sections: [
      { id: "manage", label: "🪔 Manage", subtitle: "Plan the Diwali celebration", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP instantly",      color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Diwali Checklist",       desc: "Guest count → what to arrange",         color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",           desc: "Split expenses with family & friends",  color: "#DC2626" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · WhatsApp",        color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan mithai · snacks · dinner · status",color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Schedule aarti · sparklers · dinner",   color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",      color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Visual tables · tap to assign seats",   color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",        color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "Decorator · caterer · deposit",         color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Shubh Diwali invites · reminders",      color: "#25D366" },
      ]},
      { id: "fun", label: "✨ Festive", subtitle: "Music · theme · photos", tools: [
        { id: "theme",     emoji: "🎨", title: "Theme Picker",       desc: "Vote on the Diwali decor theme",              color: "#7C3AED" },
        { id: "playlist",  emoji: "🎵", title: "Playlist Builder",   desc: "Festive songs · ghazals · Bollywood",         color: "#059669" },
        { id: "photowall", emoji: "📸", title: "Shared Photo Wall",  desc: "Everyone uploads Diwali memories",            color: "#DB2777" },
        { id: "moodmeter", emoji: "🌡️", title: "Mood Meter",         desc: "Live party vibe tracker",                     color: "#10B981" },
        { id: "countdown", emoji: "⏱️", title: "Countdown Timer",    desc: "Count down to sparkler time",                 color: "#0891B2" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "The Diwali classics", tools: [
        { id: "luckydraw",   emoji: "🍀", title: "Lucky Draw / Tambola", desc: "Print tickets · prizes · full house",   color: "#10B981" },
        { id: "bingo",       emoji: "🎱", title: "Diwali Party Bingo",   desc: "5×5 festive scenario bingo",             color: "#0891B2" },
        { id: "wouldyou",    emoji: "🤷", title: "Would You Rather",     desc: "Diwali dilemmas · group laughs",         color: "#7C3AED" },
        { id: "spin",        emoji: "🍾", title: "Random Picker",        desc: "Who wins the lucky draw?",               color: "#2563EB" },
        { id: "hottakes",    emoji: "🌶️", title: "Hot Takes",            desc: "Festive opinions — agree or disagree",   color: "#F97316" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "End of the celebration", tools: [
        { id: "reportcard", emoji: "🏆", title: "Diwali Report Card", desc: "Rate the Diwali celebration", color: "#FBBF24" },
      ]},
    ],
  },

  "holi-party": {
    name: "Holi Party Hub",
    emoji: "🎨",
    accent: "#E879F9",
    bg: "linear-gradient(125deg, #120018, #1a0022, #0e0014, #120018)",
    eyebrow: "Holi Party Toolkit",
    tagline: "Colours, chaos, and pure happiness",
    themes: ["Classic All-White", "Thandai Bar Setup", "Pastel Watercolour", "Pool Holi", "Rooftop Rang", "Organic Colour Party", "Bollywood Holi", "Gulal & Music"],
    sections: [
      { id: "manage", label: "🎨 Manage", subtitle: "Plan the colour chaos", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP instantly",      color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Holi Checklist",         desc: "Guest count → colours · food · setup",  color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",           desc: "Split the colour chaos expenses",       color: "#DC2626" },
        { id: "potluck",     emoji: "🥘", title: "Potluck Planner",        desc: "Everyone brings a Holi dish",           color: "#059669" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · WhatsApp",        color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan gujiya · thandai · snacks",        color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Day Timeline",           desc: "Colour play · thandai · music schedule",color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",      color: "#DC2626" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",        color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "DJ · caterer · gulal supplier",         color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Happy Holi invite · dress code · tips", color: "#25D366" },
      ]},
      { id: "fun", label: "🌈 Fun", subtitle: "Music · vibes · memories", tools: [
        { id: "theme",     emoji: "🎨", title: "Theme Picker",       desc: "Vote on the Holi party theme",                color: "#7C3AED" },
        { id: "playlist",  emoji: "🎵", title: "Playlist Builder",   desc: "Holi classics · Bhangra · Bollywood",         color: "#059669" },
        { id: "photowall", emoji: "📸", title: "Shared Photo Wall",  desc: "Capture the colour chaos",                    color: "#DB2777" },
        { id: "moodmeter", emoji: "🌡️", title: "Mood Meter",         desc: "Live party vibe tracker",                     color: "#10B981" },
        { id: "countdown", emoji: "⏱️", title: "Countdown Timer",    desc: "Count down to colour throw time",             color: "#0891B2" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "After the gulal settles", tools: [
        { id: "truthordare", emoji: "🎯", title: "Truth or Dare",     desc: "Holi edition · messy dares guaranteed",      color: "#DC2626" },
        { id: "neverhavei",  emoji: "🙅", title: "Never Have I Ever", desc: "Holi memories edition · score tracker",      color: "#059669" },
        { id: "wouldyou",    emoji: "🤷", title: "Would You Rather",  desc: "Colour challenges · group laughs",           color: "#7C3AED" },
        { id: "spin",        emoji: "🍾", title: "Random Picker",     desc: "Who gets the first bucket of water?",        color: "#2563EB" },
        { id: "hottakes",    emoji: "🌶️", title: "Hot Takes",         desc: "Holi opinions — organic only? Agree?",       color: "#F97316" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "End of the colour party", tools: [
        { id: "reportcard", emoji: "🏆", title: "Holi Report Card", desc: "Rate the colour celebration", color: "#FBBF24" },
      ]},
    ],
  },

  "navratri-garba": {
    name: "Navratri Garba Hub",
    emoji: "🪷",
    accent: "#C084FC",
    bg: "linear-gradient(125deg, #0d0018, #150022, #0a0012, #0d0018)",
    eyebrow: "Navratri Toolkit",
    tagline: "Nine nights of dance, devotion, and colour",
    themes: ["Traditional Garba Circle", "Chaniya Choli Glamour", "Royal Palace Pandal", "Rooftop Garba Under Stars", "Flower & Light Garden", "Mirror Work Spectacular", "Dandiya Night", "Garba Mela"],
    sections: [
      { id: "manage", label: "🪷 Manage", subtitle: "Plan the Navratri night", tools: [
        { id: "invite",      emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP instantly",      color: "#2563EB" },
        { id: "checklist",   emoji: "📋", title: "Navratri Checklist",     desc: "Guest count → dandiya · food · setup",  color: "#D97706" },
        { id: "bills",       emoji: "💸", title: "Bill Splitter",           desc: "Split the Garba night expenses",        color: "#DC2626" },
        { id: "guestlist",   emoji: "👥", title: "Guest List",             desc: "Track RSVPs · phone · WhatsApp",        color: "#7C3AED" },
        { id: "menu",        emoji: "🍽️", title: "Menu Planner",           desc: "Plan fafda · jalebi · chaat · thandai",  color: "#059669" },
        { id: "daytimeline", emoji: "🗓️", title: "Night Timeline",         desc: "Aarti · garba · dandiya schedule",      color: "#D97706" },
        { id: "venue",       emoji: "📍", title: "Venue Notes",            desc: "Address · parking · Maps · share",      color: "#DC2626" },
        { id: "seating",     emoji: "🪑", title: "Seating Chart",          desc: "Rest area · judges · VIP tables",       color: "#0891B2" },
        { id: "budget",      emoji: "💰", title: "Budget Planner",         desc: "Set budget · track by category",        color: "#16A34A" },
        { id: "vendors",     emoji: "🗂️", title: "Vendor Tracker",         desc: "DJ · decorator · caterer · deposit",    color: "#F59E0B" },
        { id: "wabroadcast", emoji: "📣", title: "WA Broadcasts",          desc: "Invite · dress code · Jai Mataji",      color: "#25D366" },
      ]},
      { id: "ceremony", label: "🙏 Ceremony", subtitle: "Devotion before the dance", tools: [
        { id: "awardsceremony", emoji: "🏆", title: "Best Dressed Awards",  desc: "Chaniya choli competition · live reveal",color: "#F59E0B" },
        { id: "theme",          emoji: "🎨", title: "Theme Picker",         desc: "Vote on tonight's Navratri theme",       color: "#7C3AED" },
        { id: "playlist",       emoji: "🎵", title: "Playlist Builder",     desc: "Garba & Dandiya classics playlist",       color: "#059669" },
        { id: "photowall",      emoji: "📸", title: "Shared Photo Wall",    desc: "Everyone captures the garba magic",       color: "#DB2777" },
        { id: "moodmeter",      emoji: "🌡️", title: "Mood Meter",           desc: "Live garba energy tracker",               color: "#10B981" },
        { id: "countdown",      emoji: "⏱️", title: "Countdown Timer",      desc: "Count down to aarti time",                color: "#0891B2" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "Between the garba rounds", tools: [
        { id: "luckydraw",   emoji: "🍀", title: "Lucky Draw",        desc: "Dandiya prizes · best dancer award",          color: "#10B981" },
        { id: "bingo",       emoji: "🎱", title: "Navratri Bingo",    desc: "5×5 garba night scenario bingo",              color: "#0891B2" },
        { id: "spin",        emoji: "🍾", title: "Random Picker",     desc: "Who dances the next solo round?",             color: "#2563EB" },
        { id: "rapidfire",   emoji: "⚡", title: "Rapid Fire",         desc: "Garba trivia · 30 seconds on clock",          color: "#EF4444" },
        { id: "wouldyou",    emoji: "🤷", title: "Would You Rather",  desc: "Navratri dilemmas · group debates",           color: "#7C3AED" },
      ]},
      { id: "other", label: "🏆 After", subtitle: "End of the garba night", tools: [
        { id: "reportcard", emoji: "🏆", title: "Garba Night Report Card", desc: "Rate the Navratri celebration", color: "#FBBF24" },
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

// ════════════════════════════════════════════════════════════════════════════
// PARTY HUB — Immersive canvas background (grid + particles + circuit pulses)
// ════════════════════════════════════════════════════════════════════════════

function PartyHubBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = 0, H = 0;
    const circuits = [];
    const particles = [];

    /* ── circuit path generator ── */
    const genCircuit = () => {
      const pts = [];
      let x = Math.random() * W;
      let y = Math.random() * H;
      pts.push({ x, y });
      let dir = Math.random() > 0.5 ? "h" : "v";
      const segs = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < segs; i++) {
        const len = 80 + Math.random() * 200;
        if (dir === "h") x = Math.max(20, Math.min(W - 20, x + (Math.random() > 0.5 ? 1 : -1) * len));
        else             y = Math.max(20, Math.min(H - 20, y + (Math.random() > 0.5 ? 1 : -1) * len));
        pts.push({ x, y });
        dir = dir === "h" ? "v" : "h";
      }
      return { pts, t: Math.random(), speed: 0.00025 + Math.random() * 0.0003 };
    };

    const init = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      circuits.length = 0;
      particles.length = 0;
      for (let i = 0; i < 7; i++) circuits.push(genCircuit());
      for (let i = 0; i < 28; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 0.3 + Math.random() * 0.9,
          base: 0.03 + Math.random() * 0.10,
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.06,
          ph: Math.random() * Math.PI * 2,
          ps: 0.004 + Math.random() * 0.008,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      /* ── faint grid ── */
      const GRID = 56;
      ctx.strokeStyle = "rgba(139,92,246,0.018)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= W; x += GRID) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 0; y <= H; y += GRID) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();

      /* ── circuit lines + junction dots + data pulses ── */
      circuits.forEach(c => {
        if (c.pts.length < 2) return;

        /* line */
        ctx.beginPath();
        ctx.moveTo(c.pts[0].x, c.pts[0].y);
        for (let i = 1; i < c.pts.length; i++) ctx.lineTo(c.pts[i].x, c.pts[i].y);
        ctx.strokeStyle = "rgba(139,92,246,0.065)";
        ctx.lineWidth = 1;
        ctx.stroke();

        /* junction nodes */
        c.pts.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(167,139,250,0.10)";
          ctx.fill();
        });

        /* animated pulse */
        c.t += c.speed;
        if (c.t > 1) c.t = 0;
        const total = c.pts.length - 1;
        const si = Math.min(Math.floor(c.t * total), total - 1);
        const st = c.t * total - si;
        const p1 = c.pts[si], p2 = c.pts[si + 1];
        const px = p1.x + (p2.x - p1.x) * st;
        const py = p1.y + (p2.y - p1.y) * st;

        const g = ctx.createRadialGradient(px, py, 0, px, py, 5);
        g.addColorStop(0, "rgba(196,166,255,0.55)");
        g.addColorStop(0.4, "rgba(139,92,246,0.22)");
        g.addColorStop(1, "rgba(139,92,246,0)");
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      /* ── drifting particles ── */
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.ph += p.ps;
        if (p.x < -4) p.x = W + 4; if (p.x > W + 4) p.x = -4;
        if (p.y < -4) p.y = H + 4; if (p.y > H + 4) p.y = -4;
        const alpha = p.base * (0.55 + 0.45 * Math.sin(p.ph));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${alpha.toFixed(3)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    init();
    const ro = new ResizeObserver(init);
    ro.observe(canvas);
    animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PARTY HUB — Tool category sets for the 5-section layout
// ════════════════════════════════════════════════════════════════════════════

const PLAY_IDS = new Set([
  "truthordare","neverhavei","wouldyou","hottakes","spin","charades","bingo",
  "birthdayquiz","couplequiz","t2l","rapidfire","mostlikelyto","luckydraw",
  "moodmeter","genderpoll","babynamevote","theme","blessings","blessingswall",
  "lovenotes","wishwall","secretmessage","moodmeter","awardsceremony",
]);
const MOMENTS_IDS = new Set([
  "photowall","wishwall","lovenotes","blessingswall","blessings","appreciationwall",
  "secretmessage","reportcard","awardsceremony","playlist","moodmeter",
]);
const PLAN_IDS = new Set([
  "invite","checklist","bills","gifttracker","guestlist","menu","daytimeline",
  "venue","seating","budget","vendors","wabroadcast","potluck","giftregistry",
  "advicecards","namesuggestions","kittyfund","countdown","runofshow",
]);

const GAME_IDS = new Set([
  "truthordare","neverhavei","wouldyou","hottakes","spin","charades","bingo",
  "birthdayquiz","couplequiz","t2l","rapidfire","mostlikelyto","luckydraw","genderpoll","babynamevote","moodmeter",
]);

const TOOL_STATUS_MAP = {
  invite:["INVITE","READY"], checklist:["PLAN","READY"], giftregistry:["REGISTRY","OPEN"],
  potluck:["LIST","OPEN"], guestlist:["GUESTS","OPEN"], budget:["BUDGET","READY"],
  daytimeline:["SCHEDULE","READY"], venue:["VENUE","READY"], countdown:["TIMER","LIVE"],
  wabroadcast:["BROADCAST","READY"], menu:["MENU","READY"], seating:["SEATING","OPEN"],
  vendors:["VENDORS","OPEN"], bills:["SPLIT","READY"], gifttracker:["GIFTS","OPEN"],
  kittyfund:["FUND","OPEN"], advicecards:["ADVICE","OPEN"], namesuggestions:["NAMES","OPEN"],
  runofshow:["SHOW","READY"], theme:["VOTE","OPEN"],
  truthordare:["GAME","READY"], neverhavei:["GAME","READY"], wouldyou:["GAME","READY"],
  hottakes:["GAME","READY"], spin:["SPIN","READY"], charades:["GAME","READY"],
  bingo:["BINGO","READY"], birthdayquiz:["QUIZ","READY"], couplequiz:["QUIZ","READY"],
  t2l:["GAME","READY"], rapidfire:["RAPID","READY"], mostlikelyto:["GAME","READY"],
  luckydraw:["DRAW","READY"], genderpoll:["POLL","LIVE"], babynamevote:["VOTE","OPEN"],
  wishwall:["WALL","OPEN"], photowall:["WALL","OPEN"], lovenotes:["NOTES","OPEN"],
  blessingswall:["BLESS","OPEN"], blessings:["BLESS","OPEN"], appreciationwall:["WALL","OPEN"],
  secretmessage:["MSG","OPEN"], reportcard:["RECAP","READY"], playlist:["MUSIC","READY"],
  moodmeter:["MOOD","LIVE"], awardsceremony:["AWARDS","READY"],
};

function getOccHubIcon(occasion, color, size = 38) {
  const sw = { fill:"none", stroke:color, strokeWidth:1.3, strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    birthday: <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 1.5 1 1.5 1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/><path d="M7 4 8.5 6"/><path d="M12 4v2"/><path d="M17 4 15.5 6"/></svg>,
    housewarming: <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    wedding: <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    anniversary: <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><path d="M12 17V7m-5 5h10"/></svg>,
    "baby-shower": <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
    bachelorette: <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20M6 3 2 9l10 13M18 3l4 6-10 13"/></svg>,
    farewell: <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><circle cx="12" cy="12" r="10"/><path d="M8 12h8m-4-4 4 4-4 4"/></svg>,
    "office-party": <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    "kitty-party": <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>,
    "first-birthday": <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 1.5 1 1.5 1"/><path d="M2 21h20"/><circle cx="12" cy="6" r="2"/></svg>,
    "newborn-welcome": <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>,
    "gender-reveal": <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
    graduation: <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    retirement: <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>,
    "diwali-party": <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v4l3 3"/></svg>,
    "holi-party": <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>,
    "navratri-garba": <svg width={size} height={size} viewBox="0 0 24 24" {...sw}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  };
  return icons[occasion] || (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

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

  // On narrow screens swap the polygon for a clean 3-col grid
  if (size < 440) {
    return (
      <div ref={containerRef} style={{ width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%", animation: "tab-slide 0.28s cubic-bezier(0.22,1,0.36,1)" }}>
          {tools.map((t, i) => (
            <button key={t.id} onClick={() => onOpen(t.id)}
              style={{
                background: "rgba(14,11,6,0.93)",
                border: i === 0 ? `1px solid ${accent}55` : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 14, padding: "14px 8px 12px",
                cursor: "pointer", fontFamily: font,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                position: "relative", WebkitTapHighlightColor: "transparent",
                animation: `card-pop 0.38s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s both`,
              }}>
              {i === 0 && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", fontSize: 7, fontWeight: 800, color: accent, background: `${accent}25`, border: `1px solid ${accent}70`, borderRadius: 100, padding: "2px 6px", letterSpacing: "0.05em", whiteSpace: "nowrap", zIndex: 2 }}>★ Start here</div>
              )}
              <div style={{ color: accent, opacity: 0.88 }}>{TOOL_ICONS[t.id] || occic(<><circle cx="12" cy="12" r="10"/></>)}</div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.3, letterSpacing: "-0.01em", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

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
  birthday:"birthday-party", "first-birthday":"first-birthday", anniversary:"anniversary",
  "baby-shower":"baby-shower", "newborn-welcome":"newborn-welcome", "gender-reveal":"gender-reveal",
  housewarming:"housewarming", "get-together":"get-together", "naming-ceremony":"naming-ceremony",
  "kitty-party":"kitty-party", "office-party":"office-party", graduation:"graduation",
  wedding:"wedding", bachelorette:"bachelorette", farewell:"farewell", retirement:"retirement",
  "diwali-party":"diwali-party", "holi-party":"holi-party", "navratri-garba":"navratri-garba",
};

export default function OccasionHub({ occasion }) {
  const [open, setOpen]         = useState(null);
  const [activeTab, setActiveTab] = useState("lobby");
  const [showSplash, setShowSplash] = useState(() => {
    try { return !localStorage.getItem(`tendr-splash-${occasion}`); } catch { return true; }
  });
  const [showTour, setShowTour] = useState(() => {
    try { return !localStorage.getItem("tendr-occ-tour-v1"); } catch { return false; }
  });
  const [tourStep, setTourStep] = useState(0);
  const [splashOut, setSplashOut]   = useState(false);
  const [planData, setPlanData]     = useState(null);

  // Room modal flow states
  const [roomModal, setRoomModal]   = useState(null); // "host" | "join" | "players"
  const [hostName,  setHostName]    = useState("");
  const [partyName, setPartyName]   = useState("");
  const [joinCode,  setJoinCode]    = useState("");
  const [joinName,  setJoinName]    = useState("");
  const [roomLoading, setRoomLoading] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [showHostControls, setShowHostControls] = useState(false);

  // Entry gate: null = gate showing; 'exploring' | 'hosting' | 'joined' = hub visible
  const [entryMode, setEntryMode]   = useState(null);
  const [entryView, setEntryView]   = useState("pick"); // "pick" | "host" | "join"

  const { room, connected, error: roomError, myName, createRoom, joinRoom, leaveRoom } = usePartyRoom();
  const navigate = useNavigate();

  // Load plan from localStorage
  useEffect(() => {
    const slug = SLUG_FOR_OCC[occasion] || occasion;
    try { const raw = localStorage.getItem(`tendr-plan-${slug}`); if (raw) setPlanData(JSON.parse(raw)); } catch {}
  }, [occasion]);

  // Auto-detect ?room=CODE in URL and open join view in entry gate
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("room");
    if (code && !room) {
      setJoinCode(code.toUpperCase());
      setEntryView("join");
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

  // If room closes while hosting/joined, fall back to exploring
  useEffect(() => {
    if (!room && (entryMode === "hosting" || entryMode === "joined")) {
      setEntryMode("exploring");
    }
  }, [room]);

  const occ = OCCASIONS[occasion];
  if (!occ) return <div style={{ color: "#fff", padding: 40, textAlign: "center", fontFamily: font }}>Unknown occasion: {occasion}</div>;

  const { accent, sections } = occ;

  const handleHostCreate = async () => {
    if (!hostName.trim()) return;
    setRoomLoading(true);
    const res = await createRoom({ occasionType: occasion, partyName: partyName.trim() || `${occ.name}`, hostName: hostName.trim() });
    setRoomLoading(false);
    if (!res.ok) alert(res.error || "Failed to create room");
    else { setEntryMode("hosting"); setRoomModal("players"); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || !joinName.trim()) return;
    setRoomLoading(true);
    const res = await joinRoom({ code: joinCode.trim(), name: joinName.trim() });
    setRoomLoading(false);
    if (!res.ok) alert(res.error || "Room not found — check the code and try again.");
    else {
      setEntryMode("joined");
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
      case "appreciationwall": return <AppreciationWall onClose={close} accent={accent} />;
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

  // Party Hub section classification
  const allTools   = (occ.sections || []).flatMap(s => s.tools || []);
  const playTools  = allTools.filter(t => PLAY_IDS.has(t.id));
  const momentTools = allTools.filter(t => MOMENTS_IDS.has(t.id));
  const planTools  = allTools.filter(t => PLAN_IDS.has(t.id));
  const lobbyQuick = [...planTools.slice(0, 2), ...playTools.slice(0, 2)].slice(0, 4);

  const PH = { violet: "#C4973A", blue: "#A0714A", gold: "#C4973A", pink: "#C4973A", bg: "#100906", surface: "#1A0F08" };
  const tabAccentMap = { lobby: "#C4973A", play: "#A0714A", people: "#C4973A", plan: "#C4973A", moments: "#C4973A" };
  const ta = tabAccentMap[activeTab] || accent;

  const TAB_CFG = [
    { id: "lobby",   label: "LOBBY",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: "play",    label: "PLAY",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
    { id: "people",  label: "PEOPLE",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: "plan",    label: "PLAN",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
    { id: "moments", label: "MOMENTS",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  ];

  // ── ENTRY GATE ────────────────────────────────────────────────────────────
  if (!entryMode) {
    return (
      <div style={{ height:"100dvh", display:"flex", flexDirection:"column", fontFamily:font, background:PH.bg, position:"relative", overflow:"hidden", alignItems:"center", justifyContent:"center" }}>
        <style>{`@keyframes eg-glow{0%,100%{opacity:0.15;transform:translateX(-50%) scale(1)}50%{opacity:0.28;transform:translateX(-50%) scale(1.06)}} @keyframes eg-in{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{ position:"fixed", top:-60, right:-80, width:400, height:300, borderRadius:"50%", background:`radial-gradient(ellipse, ${accent}18 0%, transparent 65%)`, pointerEvents:"none", zIndex:0 }} />

        {/* Header */}
        <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 24px 28px" }}>
          <div style={{ fontSize:52, marginBottom:10, filter:`drop-shadow(0 0 24px ${accent}80)` }}>{occ.emoji}</div>
          <div style={{ fontSize:"clamp(1.4rem,4vw,1.9rem)", fontWeight:700, color:"#fff", letterSpacing:"-0.02em", marginBottom:6 }}>{occ.name}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.38)" }}>{occ.tagline}</div>
        </div>

        {entryView === "pick" ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12, padding:"0 20px", width:"100%", maxWidth:400, position:"relative", zIndex:2, animation:"eg-in 0.28s cubic-bezier(0.22,1,0.36,1)" }}>
            <button onClick={()=>setEntryView("host")} style={{ padding:"18px 22px", borderRadius:18, border:`1.5px solid ${PH.violet}40`, background:`${PH.violet}14`, color:"#fff", textAlign:"left", cursor:"pointer", transition:"border-color 0.2s,background 0.2s" }}>
              <div style={{ fontSize:28 }}>👑</div>
              <div style={{ fontSize:16, fontWeight:700, marginTop:6 }}>I'm Hosting</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.42)", marginTop:3 }}>Create a room · control the vibe</div>
            </button>
            <button onClick={()=>setEntryView("join")} style={{ padding:"18px 22px", borderRadius:18, border:`1.5px solid ${PH.blue}40`, background:`${PH.blue}0e`, color:"#fff", textAlign:"left", cursor:"pointer", transition:"border-color 0.2s,background 0.2s" }}>
              <div style={{ fontSize:28 }}>🚀</div>
              <div style={{ fontSize:16, fontWeight:700, marginTop:6 }}>Join a Party</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.42)", marginTop:3 }}>Enter a room code to join your crew</div>
            </button>
            <button onClick={()=>setEntryMode("exploring")} style={{ padding:"18px 22px", borderRadius:18, border:"1.5px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#fff", textAlign:"left", cursor:"pointer", transition:"border-color 0.2s,background 0.2s" }}>
              <div style={{ fontSize:28 }}>👀</div>
              <div style={{ fontSize:16, fontWeight:700, marginTop:6 }}>Just Exploring</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.42)", marginTop:3 }}>Browse tools · no commitment</div>
            </button>
          </div>
        ) : entryView === "host" ? (
          <div style={{ padding:"0 20px", width:"100%", maxWidth:400, position:"relative", zIndex:2, animation:"eg-in 0.22s cubic-bezier(0.22,1,0.36,1)" }}>
            <button onClick={()=>setEntryView("pick")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.45)", fontSize:13, cursor:"pointer", marginBottom:18, display:"flex", alignItems:"center", gap:4, padding:0 }}>← Back</button>
            <div style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 }}>Host a Room</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginBottom:22 }}>Start a live party room for your crew</div>
            <input value={hostName} onChange={e=>setHostName(e.target.value)} placeholder="Your name" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${PH.violet}33`, background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:10 }} />
            <input value={partyName} onChange={e=>setPartyName(e.target.value)} placeholder={`Party name (e.g. ${occ.name} Bash)`} style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${PH.violet}33`, background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:14 }} />
            <button onClick={handleHostCreate} disabled={!hostName.trim()||roomLoading} style={{ width:"100%", padding:"14px 0", borderRadius:12, border:"none", background:hostName.trim()?PH.violet:"rgba(255,255,255,0.08)", color:"#fff", fontSize:14, fontWeight:700, cursor:hostName.trim()?"pointer":"not-allowed", opacity:hostName.trim()?1:0.5 }}>
              {roomLoading ? "Creating…" : "Create Room →"}
            </button>
          </div>
        ) : (
          <div style={{ padding:"0 20px", width:"100%", maxWidth:400, position:"relative", zIndex:2, animation:"eg-in 0.22s cubic-bezier(0.22,1,0.36,1)" }}>
            <button onClick={()=>setEntryView("pick")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.45)", fontSize:13, cursor:"pointer", marginBottom:18, display:"flex", alignItems:"center", gap:4, padding:0 }}>← Back</button>
            <div style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 }}>Join a Party</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginBottom:22 }}>{joinCode ? "You were invited — just enter your name!" : "Enter the code your host shared"}</div>
            <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase().slice(0,6))} placeholder="ABC123" maxLength={6} style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:`1.5px solid ${PH.blue}44`, background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:24, fontWeight:700, textAlign:"center", letterSpacing:"0.22em", outline:"none", boxSizing:"border-box", marginBottom:10 }} />
            <input value={joinName} onChange={e=>setJoinName(e.target.value)} placeholder="Your name" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${PH.blue}33`, background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:14 }} />
            <button onClick={handleJoin} disabled={joinCode.length<6||!joinName.trim()||roomLoading} style={{ width:"100%", padding:"14px 0", borderRadius:12, border:"none", background:(joinCode.length>=6&&joinName.trim())?PH.violet:"rgba(255,255,255,0.08)", color:"#fff", fontSize:14, fontWeight:700, cursor:(joinCode.length>=6&&joinName.trim())?"pointer":"not-allowed", opacity:(joinCode.length>=6&&joinName.trim())?1:0.5 }}>
              {roomLoading ? "Joining…" : "Join Room →"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", fontFamily: font, background: PH.bg, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes splash-pulse { 0%,100%{opacity:0.8;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes splash-line  { from{width:0} to{width:100%} }
        @keyframes ph-glow      { 0%,100%{opacity:0.15;transform:translateX(-50%) scale(1)} 50%{opacity:0.28;transform:translateX(-50%) scale(1.06)} }
        @keyframes rm-in        { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes dot-pulse    { 0%,100%{opacity:0.4;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes tab-slide    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modal-in     { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .occ-tool-card          { transition:background 0.15s, border-color 0.15s, transform 0.08s; }
        .occ-tool-card:hover    { background:rgba(255,255,255,0.06) !important; border-color:rgba(196,151,58,0.30) !important; }
        .occ-tool-card:active   { transform:scale(0.96) !important; transition:transform 0.08s !important; }
        ::-webkit-scrollbar     { display:none; }
        textarea, input         { font-family:${font}; }
        select option           { background:#1A0F08; color:#fff; }
        @media (prefers-reduced-motion:reduce) { * { animation:none !important; transition:none !important; } }
      `}</style>

      {/* Accent glow — occasion colour */}
      <div style={{ position:"fixed", top:-60, right:-80, width:400, height:300, borderRadius:"50%", background:`radial-gradient(ellipse, ${accent}18 0%, transparent 65%)`, pointerEvents:"none", zIndex:0 }} />

      {/* ── Splash ── */}
      {showSplash && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:`radial-gradient(ellipse at 30% 40%, ${accent}28 0%, ${PH.bg} 60%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", opacity:splashOut?0:1, transition:"opacity 0.55s cubic-bezier(0.4,0,0.2,1)", pointerEvents:splashOut?"none":"all" }}>
          <div style={{ textAlign:"center", padding:"0 32px" }}>
            <div style={{ fontSize:72, marginBottom:18, animation:"splash-pulse 1.8s ease-in-out infinite", filter:`drop-shadow(0 0 28px ${accent}90)` }}>{occ.emoji}</div>
            <div style={{ fontSize:"clamp(1.7rem,5vw,2.5rem)", fontWeight:700, color:"#fff", letterSpacing:"-0.02em", lineHeight:1.15, marginBottom:10 }}>
              Let's make it<br/><span style={{ color:accent }}>a party.</span>
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:32 }}>{occ.tagline}</div>
            <div style={{ width:180, height:2, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden", margin:"0 auto" }}>
              <div style={{ height:"100%", background:accent, animation:"splash-line 2s ease-out both" }} />
            </div>
          </div>
        </div>
      )}

      {/* ── First-time tour ── */}
      {showTour && !showSplash && (() => {
        const steps = [
          { icon:"👆", title:"Tap any tool",    body:"Each card opens a party tool — planner, game, or memory maker." },
          { icon:"◈",  title:"Browse by tab",   body:"PLAY for games, PLAN for logistics, MOMENTS to capture memories." },
          { icon:"🎮", title:"Play together",   body:"Hit HOST to start a live room and play with your whole group." },
        ];
        const step = steps[tourStep];
        const dismissTour = () => { setShowTour(false); try { localStorage.setItem("tendr-occ-tour-v1","1"); } catch {} };
        return (
          <div style={{ position:"fixed", inset:0, zIndex:4000, background:"rgba(0,0,0,0.72)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:"0 0 40px" }}>
            <div style={{ background:PH.surface, border:"1px solid rgba(255,255,255,0.10)", borderRadius:24, padding:"28px 24px 24px", maxWidth:360, width:"calc(100% - 32px)", animation:"rm-in 0.28s cubic-bezier(0.22,1,0.36,1)" }}>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ fontSize:42, marginBottom:12 }}>{step.icon}</div>
                <div style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:8 }}>{step.title}</div>
                <div style={{ fontSize:13.5, color:"rgba(255,255,255,0.62)", lineHeight:1.6 }}>{step.body}</div>
              </div>
              <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:20 }}>
                {steps.map((_,i) => <div key={i} style={{ width:i===tourStep?18:6, height:6, borderRadius:3, background:i===tourStep?PH.violet:"rgba(255,255,255,0.18)", transition:"width 0.2s,background 0.2s" }} />)}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {tourStep < steps.length - 1 ? (
                  <>
                    <button onClick={dismissTour} style={{ flex:1, padding:"11px 0", borderRadius:12, border:"1px solid rgba(255,255,255,0.10)", background:"transparent", color:"rgba(255,255,255,0.72)", fontSize:13, fontWeight:500, cursor:"pointer" }}>Skip</button>
                    <button onClick={() => setTourStep(s=>s+1)} style={{ flex:2, padding:"11px 0", borderRadius:12, border:"none", background:PH.violet, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>Next →</button>
                  </>
                ) : (
                  <button onClick={dismissTour} style={{ flex:1, padding:"13px 0", borderRadius:12, border:"none", background:PH.violet, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>Got it</button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Room modals ── */}
      {roomModal && (
        <div style={{ position:"fixed", inset:0, zIndex:5000, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={() => { setRoomModal(null); setRoomLoading(false); }}>
          <div style={{ background:PH.surface, border:"1px solid rgba(255,255,255,0.10)", borderRadius:24, padding:"28px 24px", maxWidth:360, width:"100%", boxShadow:"0 36px 80px rgba(0,0,0,0.6)", animation:"rm-in 0.25s cubic-bezier(0.22,1,0.36,1)" }} onClick={e=>e.stopPropagation()}>

            {roomModal === "host-setup" && (<>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🏠</div>
                <div style={{ fontSize:17, fontWeight:700, color:"#fff", marginBottom:4 }}>Host a Room</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.58)", lineHeight:1.5 }}>Your guests join with the room code</div>
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:PH.violet, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Your Name</div>
                <input value={hostName} onChange={e=>setHostName(e.target.value)} placeholder="e.g. Priya" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${PH.violet}33`, background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box" }} />
              </div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:PH.violet, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Party Name <span style={{ color:"rgba(255,255,255,0.3)", fontWeight:400, textTransform:"none" }}>(optional)</span></div>
                <input value={partyName} onChange={e=>setPartyName(e.target.value)} placeholder={`e.g. ${occ.name}`} style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${PH.violet}33`, background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box" }} />
              </div>
              <button onClick={handleHostCreate} disabled={!hostName.trim()||roomLoading} style={{ width:"100%", padding:"14px 0", borderRadius:12, border:"none", background:hostName.trim()?PH.violet:"rgba(255,255,255,0.08)", color:"#fff", fontSize:14, fontWeight:700, cursor:hostName.trim()?"pointer":"not-allowed", opacity:hostName.trim()?1:0.5, marginBottom:10 }}>
                {roomLoading ? "Creating…" : "Create Room →"}
              </button>
              <button onClick={()=>setRoomModal(null)} style={{ width:"100%", padding:"10px 0", border:"none", background:"none", color:"rgba(255,255,255,0.3)", fontSize:13, cursor:"pointer" }}>Cancel</button>
            </>)}

            {roomModal === "players" && room && (<>
              <div style={{ textAlign:"center", marginBottom:16 }}>
                <div style={{ fontSize:30, marginBottom:6 }}>🎉</div>
                <div style={{ fontSize:17, fontWeight:700, color:"#fff", marginBottom:2 }}>Room Created!</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.58)", marginBottom:16, lineHeight:1.5 }}>Share the code with your guests</div>
                <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:`${PH.violet}1a`, border:`1px solid ${PH.violet}55`, borderRadius:14, padding:"12px 24px", marginBottom:14 }}>
                  <span style={{ fontSize:32, fontWeight:700, color:PH.violet, letterSpacing:"0.18em" }}>{room.code}</span>
                </div>
              </div>
              <button onClick={()=>copyRoomLink(room.code)} style={{ width:"100%", padding:"12px 0", borderRadius:12, border:`1.5px solid ${copied?PH.violet:"rgba(255,255,255,0.14)"}`, background:copied?`${PH.violet}20`:"rgba(255,255,255,0.05)", color:copied?PH.violet:"rgba(255,255,255,0.75)", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:12, transition:"all 0.18s" }}>
                {copied ? "✓ Link Copied!" : "📋 Copy Room Link"}
              </button>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.55)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Players ({room.players?.length||1})</div>
                {(room.players||[myName]).map((p,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:"rgba(255,255,255,0.04)", borderRadius:8, marginBottom:4 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", animation:`dot-pulse 2s ease-in-out infinite`, animationDelay:`${i*0.3}s` }} />
                    <span style={{ fontSize:13, color:"#fff", fontWeight:500 }}>{p}{p===myName?" (you)":""}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>setRoomModal(null)} style={{ width:"100%", padding:"11px 0", borderRadius:12, border:"none", background:PH.violet, color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer" }}>Let's Play →</button>
            </>)}

            {roomModal === "join" && (<>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🔗</div>
                <div style={{ fontSize:17, fontWeight:800, color:"#fff", marginBottom:4 }}>Join a Room</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>{joinCode?"You were invited — just enter your name!":"Enter the code your host shared"}</div>
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:PH.violet, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Room Code</div>
                <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase().slice(0,6))} placeholder="ABC123" maxLength={6} style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:`1.5px solid ${PH.violet}44`, background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:24, fontWeight:700, textAlign:"center", letterSpacing:"0.22em", outline:"none", boxSizing:"border-box" }} />
              </div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:PH.violet, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Your Name</div>
                <input value={joinName} onChange={e=>setJoinName(e.target.value)} placeholder="e.g. Rahul" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${PH.violet}33`, background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box" }} />
              </div>
              <button onClick={handleJoin} disabled={joinCode.length<6||!joinName.trim()||roomLoading} style={{ width:"100%", padding:"14px 0", borderRadius:12, border:"none", background:(joinCode.length>=6&&joinName.trim())?PH.violet:"rgba(255,255,255,0.08)", color:"#fff", fontSize:14, fontWeight:700, cursor:(joinCode.length>=6&&joinName.trim())?"pointer":"not-allowed", opacity:(joinCode.length>=6&&joinName.trim())?1:0.5, marginBottom:10 }}>
                {roomLoading ? "Joining…" : "Join Room →"}
              </button>
              <button onClick={()=>setRoomModal(null)} style={{ width:"100%", padding:"10px 0", border:"none", background:"none", color:"rgba(255,255,255,0.3)", fontSize:13, cursor:"pointer" }}>Cancel</button>
            </>)}
          </div>
        </div>
      )}

      {/* ── HOST controls bottom sheet ── */}
      {showHostControls && (
        <div style={{ position:"fixed", inset:0, zIndex:4500, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end" }} onClick={()=>setShowHostControls(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ width:"100%", background:PH.surface, borderRadius:"24px 24px 0 0", padding:"24px 20px calc(32px + env(safe-area-inset-bottom,0px))", border:"1px solid rgba(255,255,255,0.08)", borderBottom:"none", animation:"tab-slide 0.25s cubic-bezier(0.22,1,0.36,1)" }}>
            <div style={{ width:36, height:4, background:"rgba(255,255,255,0.15)", borderRadius:2, margin:"0 auto 20px" }} />
            <div style={{ fontSize:12, fontWeight:600, color:"rgba(196,151,58,0.80)", textTransform:"uppercase", letterSpacing:"0.10em", marginBottom:16 }}>Host Controls</div>
            {room ? (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:12, padding:"12px 16px", marginBottom:14 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", animation:"dot-pulse 2s ease infinite" }} />
                  <span style={{ fontSize:22, fontWeight:700, color:"rgba(255,255,255,0.92)", letterSpacing:"0.18em", flex:1 }}>{room.code}</span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.50)" }}>{room.players?.length||1} online</span>
                </div>
                <button onClick={()=>copyRoomLink(room.code)} style={{ width:"100%", padding:"13px", borderRadius:12, border:`1px solid ${PH.violet}44`, background:`${PH.violet}12`, color:PH.violet, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:10 }}>
                  {copied ? "✓ Copied!" : "Copy Room Link"}
                </button>
                <button onClick={()=>{setRoomModal("players");setShowHostControls(false);}} style={{ width:"100%", padding:"13px", borderRadius:12, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.7)", fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:10 }}>
                  View Players →
                </button>
                <button onClick={leaveRoom} style={{ width:"100%", padding:"12px", border:"none", background:"none", color:"rgba(255,82,82,0.7)", fontSize:13, fontWeight:600, cursor:"pointer" }}>Leave Room</button>
              </>
            ) : (
              <>
                <button onClick={()=>{setRoomModal("host-setup");setShowHostControls(false);}} style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:PH.violet, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:10 }}>
                  Host a Room
                </button>
                <button onClick={()=>{setRoomModal("join");setShowHostControls(false);}} style={{ width:"100%", padding:"13px", borderRadius:12, border:"1px solid rgba(255,255,255,0.10)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.78)", fontSize:14, fontWeight:500, cursor:"pointer" }}>
                  Join a Room
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Top Bar ── */}
      <div style={{ flexShrink:0, padding:"max(14px, env(safe-area-inset-top)) 16px 0", position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", maxWidth:800, margin:"0 auto", position:"relative" }}>
          <button onClick={()=>navigate(-1)} style={{ width:36, height:36, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.6)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, zIndex:1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ position:"absolute", left:0, right:0, textAlign:"center", pointerEvents:"none" }}>
            <div style={{ fontSize:9.5, fontWeight:600, color:"rgba(196,151,58,0.65)", letterSpacing:"0.14em", textTransform:"uppercase" }}>Party Hub</div>
            <div style={{ fontSize:14, fontWeight:700, color:"#fff", letterSpacing:"-0.01em" }}>
              {occ.emoji} {occ.name}
              {room && <><span style={{ color:"rgba(255,255,255,0.2)", fontWeight:400, margin:"0 4px" }}>·</span><span style={{ color:PH.violet, fontSize:12, fontWeight:600, letterSpacing:"0.1em" }}>{room.code}</span></>}
            </div>
          </div>
          <div style={{ flex:1 }} />
          <button onClick={()=>setShowHostControls(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:100, border:`1.5px solid ${room?"rgba(74,222,128,0.45)":`${PH.violet}45`}`, background:room?"rgba(74,222,128,0.09)":`${PH.violet}12`, color:room?"#4ade80":PH.violet, fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0, letterSpacing:"0.01em", zIndex:1 }}>
            {room && <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", animation:"dot-pulse 2s ease infinite" }} />}
            {room ? "Live" : "Host"}
          </button>
        </div>
      </div>

      {/* ── Section content ── */}
      <div className="occ-scroll-area" style={{ flex:1, overflowY:"auto", padding:"14px 16px 20px", maxWidth:800, margin:"0 auto", width:"100%", boxSizing:"border-box", position:"relative", zIndex:1 }}>


        {/* LOBBY */}
        {activeTab === "lobby" && (
          <div style={{ animation:"tab-slide 0.28s cubic-bezier(0.22,1,0.36,1)" }}>

            {/* Host / Join strip */}
            {!room ? (
              <div style={{ display:"flex", gap:10, marginBottom:20 }}>
                <button onClick={()=>setRoomModal("host-setup")} style={{ flex:1, padding:"13px 0", borderRadius:12, border:"none", background:PH.violet, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Host a Room</button>
                <button onClick={()=>setRoomModal("join")} style={{ flex:1, padding:"13px 0", borderRadius:12, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.80)", fontSize:13, fontWeight:500, cursor:"pointer" }}>Join Room</button>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(74,222,128,0.06)", border:"1px solid rgba(74,222,128,0.20)", borderRadius:12, padding:"12px 16px", marginBottom:20 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", animation:"dot-pulse 2s ease infinite", flexShrink:0 }} />
                <span style={{ fontSize:13, fontWeight:600, color:"#4ade80", flex:1 }}>Live · {room.code}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>{room.players?.length||1} online</span>
                <button onClick={()=>copyRoomLink(room.code)} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${PH.violet}40`, background:`${PH.violet}12`, color:PH.violet, fontSize:12, fontWeight:600, cursor:"pointer" }}>{copied?"✓":"Share"}</button>
              </div>
            )}

            {/* All sections directory */}
            {(occ.sections || []).map(section => {
              const sectionTools = section.tools || [];
              const isGameSection = sectionTools.some(t => GAME_IDS.has(t.id));
              return (
                <div key={section.id} style={{ marginBottom:24 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.80)", textTransform:"uppercase", letterSpacing:"0.12em" }}>{section.label.replace(/^[\s\S]{1,3}?\s/, '')}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", fontWeight:500 }}>{sectionTools.length}</div>
                  </div>
                  {isGameSection ? (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                      {sectionTools.map(t => (
                        <div key={t.id} onClick={()=>setOpen(t.id)} className="occ-tool-card" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"12px 8px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8, textAlign:"center" }}>
                          <div style={{ color:PH.violet }}>{TOOL_ICONS[t.id]||occic(<polygon points="5 3 19 12 5 21 5 3"/>)}</div>
                          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.85)", lineHeight:1.3 }}>{t.title}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {sectionTools.map(t => (
                        <div key={t.id} onClick={()=>setOpen(t.id)} className="occ-tool-card" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
                          <div style={{ color:PH.violet, flexShrink:0 }}>{TOOL_ICONS[t.id]||occic(<circle cx="12" cy="12" r="10"/>)}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.92)" }}>{t.title}</div>
                            <div style={{ fontSize:12, color:"rgba(255,255,255,0.50)", marginTop:2, lineHeight:1.4 }}>{t.desc}</div>
                          </div>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PLAY */}
        {activeTab === "play" && (
          <div style={{ animation:"tab-slide 0.28s cubic-bezier(0.22,1,0.36,1)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.80)", textTransform:"uppercase", letterSpacing:"0.12em" }}>Games & Activities</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)" }}>{playTools.length}</div>
            </div>
            {playTools.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px 20px", color:"rgba(255,255,255,0.3)", fontSize:14 }}>No games available for this occasion.</div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {playTools.map(t => (
                  <div key={t.id} onClick={()=>setOpen(t.id)} className="occ-tool-card" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"12px 8px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8, textAlign:"center" }}>
                    <div style={{ color:PH.blue }}>{TOOL_ICONS[t.id]||occic(<polygon points="5 3 19 12 5 21 5 3"/>)}</div>
                    <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.85)", lineHeight:1.3 }}>{t.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PEOPLE */}
        {activeTab === "people" && (
          <div style={{ animation:"tab-slide 0.28s cubic-bezier(0.22,1,0.36,1)" }}>
            {room ? (
              <>
                <div style={{ fontSize:12, fontWeight:600, color:"rgba(196,151,58,0.80)", textTransform:"uppercase", letterSpacing:"0.10em", marginBottom:14 }}>{room.players?.length||1} Online</div>
                {(room.players||[myName]).map((p,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, marginBottom:8 }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", background:`${PH.violet}22`, border:`1px solid ${PH.violet}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.88)", flexShrink:0 }}>{p.charAt(0).toUpperCase()}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.92)" }}>{p}{p===myName&&<span style={{ fontSize:11, color:PH.violet, fontWeight:500, marginLeft:6 }}>you</span>}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", animation:`dot-pulse 2s ease infinite`, animationDelay:`${i*0.3}s` }} />
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>online</span>
                    </div>
                  </div>
                ))}
                <button onClick={()=>copyRoomLink(room.code)} style={{ width:"100%", padding:"13px", borderRadius:12, border:`1px solid ${PH.violet}44`, background:`${PH.violet}10`, color:PH.violet, fontSize:14, fontWeight:600, cursor:"pointer", marginTop:10 }}>
                  {copied?"✓ Link Copied!":"📋 Invite More Friends"}
                </button>
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"48px 20px" }}>
                <div style={{ fontSize:52, marginBottom:16 }}>👥</div>
                <div style={{ fontSize:17, fontWeight:700, color:"#fff", marginBottom:8 }}>Start a Party Room</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:24, lineHeight:1.6 }}>Host a live room so your guests can join, see who's online, and play games together in real time.</div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setRoomModal("host-setup")} style={{ flex:1, padding:"13px", borderRadius:12, border:"none", background:PH.violet, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Host a Room</button>
                  <button onClick={()=>setRoomModal("join")} style={{ flex:1, padding:"13px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.7)", fontSize:14, fontWeight:600, cursor:"pointer" }}>Join Room</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLAN */}
        {activeTab === "plan" && (
          <div style={{ animation:"tab-slide 0.28s cubic-bezier(0.22,1,0.36,1)" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"rgba(196,151,58,0.80)", textTransform:"uppercase", letterSpacing:"0.10em", marginBottom:14 }}>Planning Tools</div>
            {planTools.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px 20px", color:"rgba(255,255,255,0.3)", fontSize:14 }}>No planning tools for this occasion.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {planTools.map(t => (
                  <div key={t.id} onClick={()=>setOpen(t.id)} className="occ-tool-card" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"16px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ color:PH.gold, flexShrink:0 }}>{TOOL_ICONS[t.id]||occic(<rect x="3" y="3" width="18" height="18" rx="2"/>)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.92)" }}>{t.title}</div>
                      <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", marginTop:3, lineHeight:1.4 }}>{t.desc}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MOMENTS */}
        {activeTab === "moments" && (
          <div style={{ animation:"tab-slide 0.28s cubic-bezier(0.22,1,0.36,1)" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"rgba(196,151,58,0.80)", textTransform:"uppercase", letterSpacing:"0.10em", marginBottom:14 }}>Capture &amp; Celebrate</div>
            {momentTools.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:"rgba(255,255,255,0.3)", fontSize:14 }}>No moments tools for this occasion.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {momentTools.map(t => (
                  <div key={t.id} onClick={()=>setOpen(t.id)} className="occ-tool-card" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"16px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ color:PH.pink, flexShrink:0 }}>{TOOL_ICONS[t.id]||occic(<circle cx="12" cy="12" r="10"/>)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.92)" }}>{t.title}</div>
                      <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", marginTop:3, lineHeight:1.4 }}>{t.desc}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            )}
            {/* Party Recap card */}
            <div style={{ marginTop:16, background:"rgba(196,151,58,0.06)", border:"1px solid rgba(196,151,58,0.18)", borderRadius:16, padding:"20px", textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:4 }}>Party Recap</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:14, lineHeight:1.5 }}>Capture the highlights and create a shareable summary of your event.</div>
              <button onClick={()=>setOpen("reportcard")} style={{ padding:"10px 22px", borderRadius:10, border:`1px solid ${PH.violet}44`, background:`${PH.violet}12`, color:PH.violet, fontSize:13, fontWeight:600, cursor:"pointer" }}>Create Recap →</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <div style={{ flexShrink:0, background:"rgba(16,9,6,0.96)", backdropFilter:"blur(24px)", borderTop:"1px solid rgba(255,255,255,0.07)", padding:"10px 0", paddingBottom:"calc(10px + env(safe-area-inset-bottom,0px))", position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", maxWidth:800, margin:"0 auto" }}>
          {TAB_CFG.map(t => {
            const isActive = activeTab === t.id;
            const tColor = tabAccentMap[t.id] || accent;
            return (
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"4px 0 2px", border:"none", background:"transparent", cursor:"pointer" }}>
                <div style={{ color:isActive?tColor:"rgba(255,255,255,0.48)", transition:"color 0.18s" }}>{t.icon}</div>
                <div style={{ fontSize:9, fontWeight:isActive?700:500, color:isActive?tColor:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", textTransform:"uppercase", transition:"color 0.18s" }}>{t.label}</div>
                <div style={{ width:isActive?16:0, height:2, borderRadius:1, background:tColor, transition:"width 0.22s cubic-bezier(0.22,1,0.36,1)" }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CHAT floating button ── */}
      <button onClick={()=>setOpen("wabroadcast")} style={{ position:"fixed", bottom:"calc(76px + env(safe-area-inset-bottom,0px))", right:16, zIndex:3000, display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:100, border:`1.5px solid ${PH.violet}55`, background:PH.violet, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:`0 4px 24px ${PH.violet}50`, letterSpacing:"0.01em" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Chat
      </button>

      {renderModal()}
    </div>
  );
}

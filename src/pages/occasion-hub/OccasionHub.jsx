import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TRUTHS, DARES, NEVER_HAVE_I, WOULD_YOU_RATHER, CHARADES, HOT_TAKES, BINGO_SQUARES } from "../../data/housePartyData";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', 'Inter', sans-serif";

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function copyLink(text) { navigator.clipboard?.writeText(text).catch(() => {}); }

// ── Modal ──────────────────────────────────────────────────────────────────────
function Modal({ onClose, title, emoji, children, wide }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#12111e", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: wide ? 700 : 480, maxHeight: "92dvh", overflowY: "auto", padding: "24px 20px calc(32px + env(safe-area-inset-bottom,0px))", fontFamily: font, boxShadow: "0 -8px 40px rgba(0,0,0,0.6)" }}>
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
        {expenses.map((e, i) => <div key={i} style={{ ...crd, display: "flex", justifyContent: "space-between", marginTop: 8 }}><span>{e.paidBy} — {e.desc}</span><span style={{ fontWeight: 700, color: accent }}>₹{e.amount}</span></div>)}
      </>}
      {view === "result" && people.length >= 2 && expenses.length > 0 && (() => {
        const { total, share, txns } = calcSettlement();
        return <>
          <div style={{ textAlign: "center", marginBottom: 16 }}><div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>₹{total}</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>₹{Math.round(share)} per person</div></div>
          {txns.length === 0 ? <div style={{ textAlign: "center", color: "#34D399" }}>✅ All settled!</div> : txns.map((t, i) => <div key={i} style={{ ...crd, display: "flex", justifyContent: "space-between" }}><span><b style={{ color: "#F87171" }}>{t.from}</b> → <b style={{ color: "#34D399" }}>{t.to}</b></span><span style={{ fontWeight: 700, color: "#FBBF24" }}>₹{t.amount}</span></div>)}
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
  const add = () => { if (!newSong.trim()) return; setSongs(s => [...s, { song: newSong.trim(), artist: newArtist.trim() }]); setNewSong(""); setNewArtist(""); };
  const copy = () => { copyLink(songs.map((s, i) => `${i + 1}. ${s.song}${s.artist ? ` — ${s.artist}` : ""}`).join("\n")); alert("Playlist copied!"); };
  return (
    <Modal onClose={onClose} emoji="🎵" title="Playlist Builder">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Everyone adds 2 songs. Build tonight's vibe together.</p>
      <input value={newSong} onChange={e => setNewSong(e.target.value)} placeholder="Song name" style={{ ...inp, marginBottom: 8 }} />
      <input value={newArtist} onChange={e => setNewArtist(e.target.value)} placeholder="Artist (optional)" style={{ ...inp, marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && add()} />
      <button onClick={add} style={{ ...mkBtn(accent), marginBottom: 16 }}>Add Song</button>
      {songs.map((s, i) => <div key={i} style={{ ...crd, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ fontWeight: 600 }}>{i + 1}. {s.song}</div>{s.artist && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{s.artist}</div>}</div>
        <span onClick={() => setSongs(ss => ss.filter((_, j) => j !== i))} style={{ cursor: "pointer", opacity: 0.5 }}>✕</span>
      </div>)}
      {songs.length > 0 && <button onClick={copy} style={{ ...mkBtn("rgba(255,255,255,0.1)"), marginTop: 10 }}>📋 Copy Playlist</button>}
    </Modal>
  );
}

function Countdown({ onClose, accent }) {
  const [target, setTarget] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const ref = useRef(null);
  const start = () => {
    if (!target) return;
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      const diff = new Date(target) - Date.now();
      if (diff <= 0) { setTimeLeft("🎉 It's time!"); clearInterval(ref.current); return; }
      const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
  };
  useEffect(() => () => clearInterval(ref.current), []);
  return (
    <Modal onClose={onClose} emoji="⏱️" title="Countdown Timer">
      <label style={lbl}>Date & Time</label>
      <input type="datetime-local" value={target} onChange={e => setTarget(e.target.value)} style={{ ...inp, marginBottom: 12 }} />
      <button onClick={start} style={{ ...mkBtn(accent), marginBottom: 20 }}>Start Countdown</button>
      {timeLeft && <div style={{ textAlign: "center", fontSize: 40, fontWeight: 800, color: "#FBBF24" }}>{timeLeft}</div>}
    </Modal>
  );
}

function ThemePicker({ onClose, accent, themes }) {
  const [votes, setVotes] = useState({});
  const [myVote, setMyVote] = useState(null);
  const vote = (t) => {
    if (myVote) setVotes(v => ({ ...v, [myVote]: Math.max(0, (v[myVote] || 0) - 1) }));
    setMyVote(t);
    setVotes(v => ({ ...v, [t]: (v[t] || 0) + 1 }));
  };
  const max = Math.max(...Object.values(votes), 0);
  return (
    <Modal onClose={onClose} emoji="🎨" title="Theme Picker">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Pass the phone around — everyone votes!</p>
      {themes.map(t => (
        <div key={t} onClick={() => vote(t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${myVote === t ? accent : "rgba(255,255,255,0.1)"}`, background: myVote === t ? accent + "22" : "rgba(255,255,255,0.04)", marginBottom: 8, cursor: "pointer" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontSize: 14 }}>{t}</div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${max ? ((votes[t] || 0) / max) * 100 : 0}%`, background: accent, borderRadius: 4, transition: "width 0.3s" }} />
            </div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: accent, minWidth: 28, textAlign: "right" }}>{votes[t] || 0}</span>
        </div>
      ))}
      {max > 0 && <div style={{ textAlign: "center", marginTop: 12, fontSize: 14, color: "#FBBF24" }}>🏆 Leading: {Object.entries(votes).sort(([, a], [, b]) => b - a)[0]?.[0]}</div>}
    </Modal>
  );
}

function Checklist({ onClose, accent, checklistItems }) {
  const [guests, setGuests] = useState(10);
  const calc = (base, per) => Math.ceil(base + per * guests);
  const items = checklistItems || [
    { cat: "Food & Drinks", things: [{ name: "Snacks / Namkeen", qty: calc(0, 0.5) + " packs" }, { name: "Cold drinks (500ml)", qty: calc(0, 0.8) + " bottles" }, { name: "Water bottles (1L)", qty: calc(0, 0.5) + " bottles" }, { name: "Food portions", qty: calc(0, 0.7) + " portions" }] },
    { cat: "Tableware", things: [{ name: "Disposable plates", qty: calc(5, 1.5) + " pieces" }, { name: "Cups / Glasses", qty: calc(5, 2) + " pieces" }, { name: "Napkins", qty: calc(10, 3) + " pieces" }] },
    { cat: "Decor", things: [{ name: "Balloons", qty: Math.ceil(guests * 3) + " balloons" }, { name: "Fairy lights", qty: "2 sets" }, { name: "Streamers", qty: "3–4 rolls" }] },
    { cat: "Misc", things: [{ name: "Garbage bags", qty: "3–4" }, { name: "Bluetooth speaker", qty: "1–2" }, { name: "Extension cord", qty: "1" }] },
  ];
  return (
    <Modal onClose={onClose} emoji="📋" title="Checklist" wide>
      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Guest Count</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setGuests(g => Math.max(2, g - 1))} style={{ ...mkBtn("rgba(255,255,255,0.1)"), width: 40, padding: 0, height: 40 }}>−</button>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", minWidth: 40, textAlign: "center" }}>{guests}</span>
          <button onClick={() => setGuests(g => g + 1)} style={{ ...mkBtn(accent), width: 40, padding: 0, height: 40 }}>+</button>
        </div>
      </div>
      {items.map(({ cat, things }) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{cat}</div>
          {things.map(({ name, qty }) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 10, marginBottom: 6 }}>
              <span style={{ color: "#fff", fontSize: 13 }}>{name}</span>
              <span style={{ color: accent, fontSize: 13, fontWeight: 700 }}>{qty}</span>
            </div>
          ))}
        </div>
      ))}
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
  const [mode, setMode] = useState(null);
  const [card, setCard] = useState(null);
  const pick = (m) => { setMode(m); setCard(rand(m === "truth" ? TRUTHS : DARES)); };
  const next = () => setCard(rand(mode === "truth" ? TRUTHS : DARES));
  return (
    <Modal onClose={onClose} emoji="🎯" title="Truth or Dare">
      {!card ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => pick("truth")} style={{ ...mkBtn("#1D4ED8"), padding: "18px 20px", fontSize: 18 }}>🤔 Truth</button>
          <button onClick={() => pick("dare")} style={{ ...mkBtn("#DC2626"), padding: "18px 20px", fontSize: 18 }}>🔥 Dare</button>
        </div>
      ) : (
        <div>
          <div style={{ background: mode === "truth" ? "rgba(29,78,216,0.2)" : "rgba(220,38,38,0.2)", borderRadius: 16, padding: "28px 20px", textAlign: "center", marginBottom: 20, border: `1.5px solid ${mode === "truth" ? "rgba(29,78,216,0.4)" : "rgba(220,38,38,0.4)"}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: mode === "truth" ? "#60A5FA" : "#F87171", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>{mode === "truth" ? "🤔 TRUTH" : "🔥 DARE"}</div>
            <div style={{ fontSize: 17, color: "#fff", lineHeight: 1.5 }}>{card}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={next} style={{ ...mkBtn(accent), flex: 1 }}>Next</button>
            <button onClick={() => { setMode(null); setCard(null); }} style={{ ...mkBtn("rgba(255,255,255,0.1)"), flex: 1 }}>Switch</button>
          </div>
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
  const add = () => { if (newP.trim()) { setPlayers(p => [...p, newP.trim()]); setNewP(""); } };
  const mark = (n) => setScores(s => ({ ...s, [n]: (s[n] || 0) + 1 }));
  const next = () => setIdx(i => (i + 1) % NEVER_HAVE_I.length);
  return (
    <Modal onClose={onClose} emoji="🙅" title="Never Have I Ever">
      {players.length < 2 ? (
        <div>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 16, fontSize: 14 }}>Add 2+ players or just play without tracking.</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={newP} onChange={e => setNewP(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Player name" style={{ ...inp, flex: 1 }} />
            <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
          </div>
          {players.map(p => <div key={p} style={{ ...crd, display: "flex", justifyContent: "space-between" }}>{p} <span onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ cursor: "pointer", opacity: 0.5 }}>✕</span></div>)}
          <button onClick={next} style={{ ...mkBtn("#059669"), marginTop: 8 }}>Play without scores →</button>
        </div>
      ) : (
        <div>
          <div style={{ background: "rgba(5,150,105,0.15)", border: "1.5px solid rgba(5,150,105,0.35)", borderRadius: 16, padding: "24px 18px", textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Never Have I Ever…</div>
            <div style={{ fontSize: 16, color: "#fff", lineHeight: 1.5 }}>{NEVER_HAVE_I[idx]}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Who HAS done it?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {players.map(p => <button key={p} onClick={() => mark(p)} style={{ padding: "8px 14px", borderRadius: 20, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontFamily: font, fontSize: 13 }}>{p} · {scores[p] || 0}</button>)}
            </div>
          </div>
          <button onClick={next} style={mkBtn(accent)}>Next Statement</button>
        </div>
      )}
    </Modal>
  );
}

function WouldYouRather({ onClose, accent }) {
  const [pair, setPair] = useState(() => rand(WOULD_YOU_RATHER));
  const [pick, setPick] = useState(null);
  const next = () => { setPair(rand(WOULD_YOU_RATHER)); setPick(null); };
  return (
    <Modal onClose={onClose} emoji="🤷" title="Would You Rather">
      <div style={{ marginBottom: 16 }}>
        {["a", "b"].map(side => (
          <button key={side} onClick={() => setPick(side)} style={{ display: "block", width: "100%", marginBottom: 10, padding: "20px 16px", borderRadius: 14, border: `2px solid ${pick === side ? accent : "rgba(255,255,255,0.15)"}`, background: pick === side ? accent + "33" : "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, fontFamily: font, cursor: "pointer", textAlign: "left", lineHeight: 1.4 }}>
            {side === "a" ? "👈 " : "👉 "}{pair[side]}
          </button>
        ))}
      </div>
      {pick && <div style={{ textAlign: "center", color: accent, fontSize: 14, marginBottom: 14 }}>You chose — defend your answer!</div>}
      <button onClick={next} style={mkBtn(accent)}>Next Question</button>
    </Modal>
  );
}

function HotTakes({ onClose, accent }) {
  const [take, setTake] = useState(() => rand(HOT_TAKES));
  const [agreed, setAgreed] = useState(null);
  const next = () => { setTake(rand(HOT_TAKES)); setAgreed(null); };
  return (
    <Modal onClose={onClose} emoji="🌶️" title="Hot Takes">
      <div style={{ background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: "28px 18px", textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#F87171", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>🌶️ Hot Take</div>
        <div style={{ fontSize: 16, color: "#fff", lineHeight: 1.5 }}>{take}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => setAgreed(true)} style={{ ...mkBtn(agreed === true ? "#059669" : "rgba(255,255,255,0.08)"), flex: 1 }}>✅ Agree</button>
        <button onClick={() => setAgreed(false)} style={{ ...mkBtn(agreed === false ? "#DC2626" : "rgba(255,255,255,0.08)"), flex: 1 }}>❌ Disagree</button>
      </div>
      {agreed !== null && <div style={{ textAlign: "center", color: agreed ? "#34D399" : "#F87171", fontSize: 14, marginBottom: 12 }}>Debate time! Go.</div>}
      <button onClick={next} style={mkBtn(accent)}>Next Take</button>
    </Modal>
  );
}

function SpinBottle({ onClose, accent }) {
  const [players, setPlayers] = useState([]);
  const [newP, setNewP] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [angle, setAngle] = useState(0);
  const addP = () => { if (newP.trim()) { setPlayers(p => [...p, newP.trim()]); setNewP(""); } };
  const spin = () => {
    if (players.length < 2) return;
    setSpinning(true); setResult(null);
    const extra = 1440 + Math.random() * 720;
    setAngle(a => a + extra);
    setTimeout(() => { setSpinning(false); setResult(rand(players)); }, 3000);
  };
  return (
    <Modal onClose={onClose} emoji="🍾" title="Random Picker">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={newP} onChange={e => setNewP(e.target.value)} onKeyDown={e => e.key === "Enter" && addP()} placeholder="Add a name" style={{ ...inp, flex: 1 }} />
        <button onClick={addP} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {players.map(p => <span key={p} style={{ background: accent + "33", color: "#fff", padding: "5px 12px", borderRadius: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{p} <span onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ cursor: "pointer", opacity: 0.6 }}>✕</span></span>)}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", width: 180, height: 180, borderRadius: "50%", border: `4px solid ${accent}55`, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 4, height: 80, background: `linear-gradient(to top, ${accent}, #fff)`, borderRadius: 4, transformOrigin: "50% 100%", transform: `rotate(${angle}deg)`, transition: spinning ? "transform 3s cubic-bezier(0.17,0.67,0.12,0.99)" : "none", position: "absolute", bottom: "50%", left: "calc(50% - 2px)" }} />
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: accent, zIndex: 2, position: "relative" }} />
        </div>
      </div>
      {result && !spinning && <div style={{ textAlign: "center", fontSize: 22, fontWeight: 800, color: accent, marginBottom: 16 }}>🎯 {result}!</div>}
      <button onClick={spin} disabled={players.length < 2 || spinning} style={{ ...mkBtn(accent), opacity: players.length < 2 ? 0.5 : 1 }}>{spinning ? "Spinning…" : players.length < 2 ? "Add at least 2 names" : "SPIN!"}</button>
    </Modal>
  );
}

function Charades({ onClose, accent }) {
  const cats = { bollywood: "🎬 Bollywood", webshows: "📺 Web Shows", celebs: "🌟 Celebs", memesphrases: "😂 Memes & Phrases" };
  const [cat, setCat] = useState(null);
  const [word, setWord] = useState(null);
  const [timer, setTimer] = useState(null);
  const ref = useRef(null);
  const pick = (c) => { setCat(c); setWord(rand(CHARADES[c])); setTimer(60); };
  const next = () => setWord(rand(CHARADES[cat]));
  useEffect(() => {
    if (timer === null || timer === 0) { clearInterval(ref.current); return; }
    ref.current = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(ref.current);
  }, [cat]);
  if (!cat) return (
    <Modal onClose={onClose} emoji="🎭" title="Dumb Charades">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Object.entries(cats).map(([k, v]) => <button key={k} onClick={() => pick(k)} style={{ ...mkBtn(accent + "55"), border: `1.5px solid ${accent}88`, textAlign: "left", padding: "14px 16px", fontSize: 15 }}>{v}</button>)}
      </div>
    </Modal>
  );
  return (
    <Modal onClose={onClose} emoji="🎭" title="Dumb Charades">
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, color: accent, marginBottom: 16 }}>{cats[cat]}</div>
        <div style={{ background: accent + "22", border: `2px solid ${accent}55`, borderRadius: 20, padding: "32px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{word}</div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: timer > 10 ? "#34D399" : "#F87171", marginBottom: 16 }}>{timer}s</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={next} style={{ ...mkBtn(accent), flex: 1 }}>Next Word</button>
          <button onClick={() => { setCat(null); setWord(null); setTimer(null); }} style={{ ...mkBtn("rgba(255,255,255,0.1)"), flex: 1 }}>Change Category</button>
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
  const toggle = (i) => {
    if (i === 12) return;
    const next = { ...marked, [i]: !marked[i] };
    setMarked(next);
    const lines = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],[0,6,12,18,24],[4,8,12,16,20]];
    setBingo(lines.some(line => line.every(j => next[j])));
  };
  return (
    <Modal onClose={onClose} emoji="🎱" title="Bingo" wide>
      {bingo && <div style={{ textAlign: "center", fontSize: 22, fontWeight: 800, color: "#FBBF24", marginBottom: 16 }}>🎉 BINGO!</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 16 }}>
        {card.map((sq, i) => (
          <div key={i} onClick={() => toggle(i)} style={{ aspectRatio: "1", background: marked[i] ? accent + "55" : "rgba(255,255,255,0.06)", border: `1.5px solid ${marked[i] ? accent : "rgba(255,255,255,0.12)"}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: 4, cursor: i === 12 ? "default" : "pointer", transition: "all 0.15s" }}>
            <span style={{ fontSize: 9, color: marked[i] ? "#fff" : "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.2 }}>{sq}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>Tap squares you've seen happen. Get 5 in a row!</p>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OCCASION-SPECIFIC TOOLS
// ════════════════════════════════════════════════════════════════════════════

// Birthday: Wish Wall
function WishWall({ onClose, accent, celebrant }) {
  const [wishes, setWishes] = useState([]);
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const post = () => {
    if (!wish.trim()) return;
    setWishes(w => [{ name: name.trim() || "Anonymous", wish: wish.trim(), emoji: rand(["🎂", "🎉", "🥳", "🎁", "❤️", "✨", "🌟", "🎈"]) }, ...w]);
    setName(""); setWish("");
  };
  return (
    <Modal onClose={onClose} emoji="🎂" title={`Wish Wall for ${celebrant || "the Birthday Star"}`} wide>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)" style={{ ...inp, marginBottom: 8 }} />
      <textarea value={wish} onChange={e => setWish(e.target.value)} placeholder={`Write a wish for ${celebrant || "them"}…`} style={{ ...inp, minHeight: 80, resize: "vertical", marginBottom: 10 }} />
      <button onClick={post} style={{ ...mkBtn(accent), marginBottom: 20 }}>Post Wish 🎉</button>
      {wishes.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No wishes yet — be the first!</p>}
      {wishes.map((w, i) => (
        <div key={i} style={{ ...crd, borderLeft: `3px solid ${accent}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}>{w.emoji}</span>
            <div>
              <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginBottom: 4 }}>{w.name}</div>
              <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>{w.wish}</div>
            </div>
          </div>
        </div>
      ))}
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
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <Modal onClose={onClose} emoji="🎯" title="Quiz Results">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 60 }}>🎂</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Now let {celebrant || "them"} reveal the answers!</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>See who knows {celebrant || "them"} best</div>
      </div>
      {questions.map((q, i) => <div key={i} style={{ ...crd, marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: accent, marginBottom: 4 }}>Q{i + 1}</div>
        <div style={{ fontSize: 13, color: "#fff", marginBottom: 4 }}>{q.q}</div>
        <div style={{ fontSize: 13, color: "#FBBF24", fontWeight: 700 }}>Your answer: {answers[i] || "—"}</div>
      </div>)}
      <button onClick={() => { setAnswers({}); setSubmitted(false); }} style={{ ...mkBtn("rgba(255,255,255,0.1)"), marginTop: 8 }}>Play Again</button>
    </Modal>
  );
  return (
    <Modal onClose={onClose} emoji="🎯" title={`How well do you know ${celebrant || "them"}?`} wide>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, color: "#fff", marginBottom: 10, lineHeight: 1.4 }}><span style={{ color: accent, fontWeight: 700 }}>Q{i + 1}.</span> {q.q}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {q.opts.map(opt => <button key={opt} onClick={() => setAnswers(a => ({ ...a, [i]: opt }))} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${answers[i] === opt ? accent : "rgba(255,255,255,0.1)"}`, background: answers[i] === opt ? accent + "33" : "rgba(255,255,255,0.04)", color: "#fff", fontFamily: font, fontSize: 13, textAlign: "left", cursor: "pointer" }}>{opt}</button>)}
          </div>
        </div>
      ))}
      <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length} style={{ ...mkBtn(accent), opacity: Object.keys(answers).length < questions.length ? 0.5 : 1 }}>Submit Answers</button>
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
    setNotes(n => [{ from: from.trim() || "Anonymous", note: note.trim(), emoji: rand(["💍", "❤️", "🌹", "💫", "✨", "💌", "🥂", "💎"]) }, ...n]);
    setFrom(""); setNote("");
  };
  return (
    <Modal onClose={onClose} emoji="💌" title="Love Notes Wall" wide>
      <input value={from} onChange={e => setFrom(e.target.value)} placeholder="From (your name)" style={{ ...inp, marginBottom: 8 }} />
      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Write a note for the couple…" style={{ ...inp, minHeight: 80, resize: "vertical", marginBottom: 10 }} />
      <button onClick={post} style={{ ...mkBtn(accent), marginBottom: 20 }}>Post Note 💌</button>
      {notes.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Be the first to leave a note for the couple!</p>}
      {notes.map((n, i) => (
        <div key={i} style={{ ...crd, borderLeft: `3px solid ${accent}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}>{n.emoji}</span>
            <div>
              <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginBottom: 4 }}>From {n.from}</div>
              <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>{n.note}</div>
            </div>
          </div>
        </div>
      ))}
    </Modal>
  );
}

// Anniversary: Couple Quiz
function CoupleQuiz({ onClose, accent }) {
  const questions = [
    { q: "Where did they first meet?", opts: ["College", "Work", "Common friends", "Online"] },
    { q: "Who said 'I love you' first?", opts: ["Him/Her 1", "Him/Her 2", "Both at once", "Still waiting 😅"] },
    { q: "What's their song?", opts: ["They have one", "Still arguing about it", "Whatever's on Spotify", "No idea"] },
    { q: "Who's the better cook?", opts: ["Person 1", "Person 2", "Both bad", "Zomato is their chef"] },
    { q: "Who controls the TV remote?", opts: ["Person 1 always", "Person 2 always", "They fight for it", "They have 2 TVs"] },
  ];
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  if (done) return (
    <Modal onClose={onClose} emoji="💑" title="Quiz Complete!">
      <div style={{ textAlign: "center", marginBottom: 20 }}><div style={{ fontSize: 60 }}>💍</div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Now ask the couple for the real answers!</div></div>
      {questions.map((q, i) => <div key={i} style={crd}><div style={{ fontSize: 12, color: accent, marginBottom: 2 }}>Q{i + 1}</div><div style={{ fontSize: 13, color: "#fff" }}>{q.q}</div><div style={{ color: "#FBBF24", fontWeight: 700, marginTop: 4 }}>Your guess: {answers[i] || "—"}</div></div>)}
      <button onClick={() => { setAnswers({}); setDone(false); }} style={{ ...mkBtn("rgba(255,255,255,0.1)"), marginTop: 8 }}>Play Again</button>
    </Modal>
  );
  return (
    <Modal onClose={onClose} emoji="💑" title="Couple Quiz" wide>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, color: "#fff", marginBottom: 10 }}><span style={{ color: accent, fontWeight: 700 }}>Q{i + 1}.</span> {q.q}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {q.opts.map(opt => <button key={opt} onClick={() => setAnswers(a => ({ ...a, [i]: opt }))} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${answers[i] === opt ? accent : "rgba(255,255,255,0.1)"}`, background: answers[i] === opt ? accent + "33" : "rgba(255,255,255,0.04)", color: "#fff", fontFamily: font, fontSize: 13, textAlign: "left", cursor: "pointer" }}>{opt}</button>)}
          </div>
        </div>
      ))}
      <button onClick={() => setDone(true)} disabled={Object.keys(answers).length < questions.length} style={{ ...mkBtn(accent), opacity: Object.keys(answers).length < questions.length ? 0.5 : 1 }}>Submit</button>
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
  const [vote, setVote] = useState(null);
  const [boyVotes, setBoyVotes] = useState(0);
  const [girlVotes, setGirlVotes] = useState(0);
  const [voted, setVoted] = useState(false);
  const cast = (v) => {
    if (voted) return;
    setVote(v);
    if (v === "boy") setBoyVotes(b => b + 1);
    else setGirlVotes(g => g + 1);
    setVoted(true);
  };
  const total = boyVotes + girlVotes;
  return (
    <Modal onClose={onClose} emoji="🍼" title="Gender Prediction Poll">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20, textAlign: "center" }}>Pass the phone around — everyone votes!</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button onClick={() => cast("boy")} style={{ ...mkBtn("#2563EB"), flex: 1, padding: "24px 16px", fontSize: 20, opacity: voted && vote !== "boy" ? 0.5 : 1 }}>👦 Boy</button>
        <button onClick={() => cast("girl")} style={{ ...mkBtn("#DB2777"), flex: 1, padding: "24px 16px", fontSize: 20, opacity: voted && vote !== "girl" ? 0.5 : 1 }}>👧 Girl</button>
      </div>
      {total > 0 && <div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "#60A5FA", fontWeight: 700 }}>👦 Boy — {boyVotes}</span>
            <span style={{ color: "#F472B6", fontWeight: 700 }}>{girlVotes} — Girl 👧</span>
          </div>
          <div style={{ height: 20, background: "#F472B633", borderRadius: 10, overflow: "hidden", display: "flex" }}>
            <div style={{ height: "100%", width: `${(boyVotes / total) * 100}%`, background: "#2563EB", transition: "width 0.4s", borderRadius: "10px 0 0 10px" }} />
            <div style={{ height: "100%", flex: 1, background: "#DB2777", borderRadius: "0 10px 10px 0" }} />
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{total} vote{total !== 1 ? "s" : ""} so far</div>
      </div>}
    </Modal>
  );
}

// Baby Shower: Advice Cards for parents
function AdviceCards({ onClose, accent }) {
  const [cards, setCards] = useState([]);
  const [from, setFrom] = useState("");
  const [advice, setAdvice] = useState("");
  const [type, setType] = useState("advice");
  const prompts = { advice: "Write parenting advice…", memory: "Share a childhood memory…", prediction: "Predict something about the baby…" };
  const icons = { advice: "💡", memory: "🌟", prediction: "🔮" };
  const post = () => {
    if (!advice.trim()) return;
    setCards(c => [{ from: from.trim() || "Anonymous", advice: advice.trim(), type, emoji: icons[type] }, ...c]);
    setFrom(""); setAdvice("");
  };
  return (
    <Modal onClose={onClose} emoji="💌" title="Advice for the Parents" wide>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {Object.entries(prompts).map(([k]) => <button key={k} onClick={() => setType(k)} style={{ ...mkBtn(type === k ? accent : "rgba(255,255,255,0.08)"), flex: 1, padding: "8px 4px", fontSize: 12 }}>{icons[k]} {k.charAt(0).toUpperCase() + k.slice(1)}</button>)}
      </div>
      <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Your name" style={{ ...inp, marginBottom: 8 }} />
      <textarea value={advice} onChange={e => setAdvice(e.target.value)} placeholder={prompts[type]} style={{ ...inp, minHeight: 80, resize: "vertical", marginBottom: 10 }} />
      <button onClick={post} style={{ ...mkBtn(accent), marginBottom: 20 }}>Post Card</button>
      {cards.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Be the first to share wisdom for the new parents!</p>}
      {cards.map((c, i) => (
        <div key={i} style={{ ...crd, borderLeft: `3px solid ${accent}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}>{c.emoji}</span>
            <div>
              <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginBottom: 4 }}>{c.from} · {c.type}</div>
              <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>{c.advice}</div>
            </div>
          </div>
        </div>
      ))}
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
  const [past, setPast] = useState([]);
  const add = () => { if (newM.trim()) { setMembers(m => [...m, newM.trim()]); setNewM(""); } };
  const draw = () => {
    if (members.length < 2) return;
    setSpinning(true); setWinner(null);
    setTimeout(() => {
      const w = rand(members);
      setWinner(w);
      setPast(p => [...p, { name: w, date: new Date().toLocaleDateString("en-IN") }]);
      setSpinning(false);
    }, 2000);
  };
  return (
    <Modal onClose={onClose} emoji="🎀" title="Lucky Draw">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={newM} onChange={e => setNewM(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Member name" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...mkBtn(accent), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {members.map(m => <span key={m} style={{ background: accent + "33", color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{m} <span onClick={() => setMembers(ms => ms.filter(x => x !== m))} style={{ cursor: "pointer", opacity: 0.6 }}>✕</span></span>)}
      </div>
      {winner && !spinning && <div style={{ textAlign: "center", padding: "20px", background: accent + "22", borderRadius: 16, marginBottom: 16, border: `2px solid ${accent}55` }}>
        <div style={{ fontSize: 40 }}>🎀</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 8 }}>{winner}</div>
        <div style={{ fontSize: 13, color: accent, marginTop: 4 }}>This month's winner!</div>
      </div>}
      {spinning && <div style={{ textAlign: "center", padding: "20px", marginBottom: 16 }}>
        <div style={{ fontSize: 40, animation: "spin 0.5s linear infinite" }}>🎰</div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>Drawing…</div>
      </div>}
      <button onClick={draw} disabled={members.length < 2 || spinning} style={{ ...mkBtn(accent), opacity: members.length < 2 ? 0.5 : 1, marginBottom: 16 }}>{spinning ? "Drawing…" : "Draw Winner 🎀"}</button>
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
    setBlessings(b => [{ from: from.trim() || "Anonymous", blessing: blessing.trim(), emoji: rand(["🙏", "🌸", "✨", "💫", "🌺", "🙌", "❤️", "🌼"]) }, ...b]);
    setFrom(""); setBlessing("");
  };
  return (
    <Modal onClose={onClose} emoji="🙏" title="Blessings Wall" wide>
      <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Your name" style={{ ...inp, marginBottom: 8 }} />
      <textarea value={blessing} onChange={e => setBlessing(e.target.value)} placeholder={placeholder || "Share your blessings…"} style={{ ...inp, minHeight: 80, resize: "vertical", marginBottom: 10 }} />
      <button onClick={post} style={{ ...mkBtn(accent), marginBottom: 20 }}>Share Blessing 🙏</button>
      {blessings.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Be the first to share a blessing!</p>}
      {blessings.map((b, i) => (
        <div key={i} style={{ ...crd, borderLeft: `3px solid ${accent}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}>{b.emoji}</span>
            <div>
              <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginBottom: 4 }}>{b.from}</div>
              <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>{b.blessing}</div>
            </div>
          </div>
        </div>
      ))}
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
    bg: "linear-gradient(125deg, #1a0620, #200d30, #0f1830, #1a0620)",
    eyebrow: "Birthday Toolkit",
    tagline: "Make it a birthday they never forget",
    themes: ["Bollywood Night", "Neon Glow", "Retro 70s", "All White", "Fairy Lights", "Masquerade", "Beach Vibes", "Royale Night"],
    sections: [
      { id: "manage", label: "⚙️ Manage", subtitle: "Plan the perfect celebration", tools: [
        { id: "invite", emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP instantly", color: "#2563EB" },
        { id: "checklist", emoji: "📋", title: "Party Checklist", desc: "Guest count → auto buy list", color: "#D97706" },
        { id: "bills", emoji: "💸", title: "Bill Splitter", desc: "Split party expenses fairly", color: "#DC2626" },
      ]},
      { id: "fun", label: "✨ Fun", subtitle: "Make it memorable", tools: [
        { id: "wishwall", emoji: "🎂", title: "Wish Wall", desc: "Everyone writes a wish for the birthday star", color: "#EC4899" },
        { id: "theme", emoji: "🎨", title: "Theme Picker", desc: "Vote on the party theme", color: "#7C3AED" },
        { id: "countdown", emoji: "⏱️", title: "Countdown Timer", desc: "Count down to the big day", color: "#0891B2" },
        { id: "playlist", emoji: "🎵", title: "Playlist Builder", desc: "Everyone adds their song", color: "#059669" },
        { id: "photowall", emoji: "📸", title: "Shared Photo Wall", desc: "Everyone uploads memories", color: "#DB2777" },
      ]},
      { id: "games", label: "🎮 Games", subtitle: "Keep the energy going", tools: [
        { id: "birthdayquiz", emoji: "🎯", title: "Birthday Quiz", desc: "How well do you know the birthday person?", color: "#EC4899" },
        { id: "truthordare", emoji: "🎯", title: "Truth or Dare", desc: "Indian youth decks · 25 truths + 25 dares", color: "#DC2626" },
        { id: "neverhavei", emoji: "🙅", title: "Never Have I Ever", desc: "30 statements · score tracker", color: "#059669" },
        { id: "wouldyou", emoji: "🤷", title: "Would You Rather", desc: "Spicy choices · defend your answer", color: "#7C3AED" },
        { id: "spin", emoji: "🍾", title: "Spin the Bottle", desc: "Random picker with spinner", color: "#2563EB" },
        { id: "charades", emoji: "🎭", title: "Dumb Charades", desc: "Bollywood · Celebs · Memes", color: "#D97706" },
        { id: "bingo", emoji: "🎱", title: "Party Bingo", desc: "5×5 birthday scenario bingo", color: "#0891B2" },
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
        { id: "countdown", emoji: "⏱️", title: "Countdown Timer", desc: "Count down to the special day", color: "#0891B2" },
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
        { id: "potluck", emoji: "🥘", title: "Potluck Planner", desc: "Everyone brings something", color: "#059669" },
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
        { id: "bills", emoji: "💸", title: "Bill Splitter", desc: "Split the celebration expenses", color: "#DC2626" },
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
        { id: "bills", emoji: "💸", title: "Bill Splitter", desc: "Enter spends → who owes whom", color: "#DC2626" },
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
    bg: "linear-gradient(125deg, #1a0020, #200030, #100020, #1a0020)",
    eyebrow: "Kitty Party Toolkit",
    tagline: "The OG girls' get-together, elevated",
    themes: ["All Pink", "Bollywood Glam", "Saree Night", "Floral Fiesta", "Retro Kitty", "Peacock Blue", "Black & Gold", "Garden Party"],
    sections: [
      { id: "manage", label: "💰 Manage", subtitle: "Keep the kitty running", tools: [
        { id: "luckydraw", emoji: "🎀", title: "Lucky Draw", desc: "Pick this month's winner", color: "#E879F9" },
        { id: "kittyfund", emoji: "💰", title: "Kitty Fund Tracker", desc: "Track who's paid this month", color: "#F59E0B" },
        { id: "bills", emoji: "💸", title: "Bill Splitter", desc: "Split the party expenses", color: "#DC2626" },
        { id: "checklist", emoji: "📋", title: "Party Checklist", desc: "Guest count → what to arrange", color: "#D97706" },
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
  "naming-ceremony": {
    name: "Naming Ceremony Hub",
    emoji: "🌸",
    accent: "#A78BFA",
    bg: "linear-gradient(125deg, #0f0820, #150e30, #0a0818, #0f0820)",
    eyebrow: "Naming Ceremony Toolkit",
    tagline: "Celebrate the name that will define a lifetime",
    themes: ["Floral Garden", "Saffron & Gold", "Pastel Dreams", "Traditional Hindu", "White & Gold", "Marigold Festival", "Starry Night", "Peacock Royal"],
    sections: [
      { id: "manage", label: "🌸 Manage", subtitle: "Plan the ceremony", tools: [
        { id: "invite", emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP", color: "#2563EB" },
        { id: "checklist", emoji: "📋", title: "Ceremony Checklist", desc: "Guest count → what to arrange", color: "#D97706" },
        { id: "bills", emoji: "💸", title: "Bill Splitter", desc: "Split the ceremony expenses", color: "#DC2626" },
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

const BIRTHDAY_BINGO = [
  "Someone cries", "Late gift", "Phone dies", "Cake drama", "Extra guests", "Too many photos", "Forgot candles", "DJ request denied",
  "Someone ghosts", "Rain surprise", "Food runs out", "Uncle speech", "Uninvited friend", "Dress drama", "Lost balloons", "Cake smash",
  "Venue too small", "Playlist argument", "Surprise guest", "Forgot lighter", "Bad backdrop", "Flight delay", "Unexpected song", "Candles won't light",
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function OccasionHub({ occasion }) {
  const [open, setOpen] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [glare, setGlare] = useState({});
  const navigate = useNavigate();

  const occ = OCCASIONS[occasion];
  if (!occ) return <div style={{ color: "#fff", padding: 40, textAlign: "center", fontFamily: font }}>Unknown occasion: {occasion}</div>;

  const { accent, sections } = occ;

  const handleMove = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlare(prev => ({ ...prev, [id]: { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 } }));
  };
  const handleLeave = (id) => { setHovered(null); setGlare(prev => { const n = { ...prev }; delete n[id]; return n; }); };

  const renderModal = () => {
    const close = () => setOpen(null);
    switch (open) {
      // Shared tools
      case "bills": return <BillSplitter onClose={close} accent={accent} />;
      case "playlist": return <PlaylistBuilder onClose={close} accent={accent} />;
      case "countdown": return <Countdown onClose={close} accent={accent} />;
      case "theme": return <ThemePicker onClose={close} accent={accent} themes={occ.themes} />;
      case "checklist": return <Checklist onClose={close} accent={accent} />;
      case "reportcard": return <PartyReportCard onClose={close} accent={accent} />;
      case "potluck": return <ShareableTool onClose={close} accent={accent} emoji="🥘" title="Potluck Planner" description="Create a potluck room. Share the link — friends claim what they'll bring." path="/house-party/potluck" fields={[{ key: "partyName", label: "Event Name", placeholder: "Our Get Together", required: true }, { key: "hostName", label: "Your Name", placeholder: "Priya", required: true }, { key: "items", label: "Items (comma-separated)", placeholder: "Chips, Coke, Cake, Plates", required: true }]} />;
      case "invite": return <ShareableTool onClose={close} accent={accent} emoji="📨" title="Digital Invite & RSVP" description="Create an invite. Share the link — guests RSVP instantly." path="/house-party/invite" fields={[{ key: "partyName", label: "Event Name", placeholder: "Meera's Birthday Bash", required: true }, { key: "hostName", label: "Host Name", placeholder: "Meera", required: true }, { key: "date", label: "Date", placeholder: "19 July 2026" }, { key: "time", label: "Time", placeholder: "7:00 PM" }, { key: "location", label: "Location", placeholder: "Aman's place, Noida" }, { key: "note", label: "Note (optional)", placeholder: "Dress code: yellow!" }]} />;
      case "photowall": return <ShareableTool onClose={close} accent={accent} emoji="📸" title="Shared Photo Wall" description="Create a photo wall. Share the link — everyone uploads their photos." path="/house-party/photo-wall" fields={[{ key: "partyName", label: "Event Name", placeholder: "Priya's Baby Shower 🎀", required: true }]} />;
      // Games
      case "truthordare": return <TruthOrDare onClose={close} accent={accent} />;
      case "neverhavei": return <NeverHaveI onClose={close} accent={accent} />;
      case "wouldyou": return <WouldYouRather onClose={close} accent={accent} />;
      case "hottakes": return <HotTakes onClose={close} accent={accent} />;
      case "spin": return <SpinBottle onClose={close} accent={accent} />;
      case "charades": return <Charades onClose={close} accent={accent} />;
      case "bingo": return <Bingo onClose={close} accent={accent} squares={occasion === "birthday" ? BIRTHDAY_BINGO : undefined} />;
      // Occasion-specific
      case "wishwall": return <WishWall onClose={close} accent={accent} />;
      case "birthdayquiz": return <BirthdayQuiz onClose={close} accent={accent} />;
      case "lovenotes": return <LoveNotes onClose={close} accent={accent} />;
      case "couplequiz": return <CoupleQuiz onClose={close} accent={accent} />;
      case "blessingswall": return <BlessingsWall onClose={close} accent={accent} placeholder="Share your blessings and wishes for the couple…" />;
      case "babynamevote": return <BabyNameVote onClose={close} accent={accent} />;
      case "genderpoll": return <GenderPoll onClose={close} accent={accent} />;
      case "advicecards": return <AdviceCards onClose={close} accent={accent} />;
      case "giftregistry": return <GiftRegistry onClose={close} accent={accent} />;
      case "luckydraw": return <LuckyDraw onClose={close} accent={accent} />;
      case "kittyfund": return <KittyFund onClose={close} accent={accent} />;
      case "namesuggestions": return <NameSuggestions onClose={close} accent={accent} />;
      case "blessings": return <BlessingsWall onClose={close} accent={accent} placeholder="Share a blessing for the child's journey ahead…" />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100dvh", fontFamily: font, background: occ.bg, backgroundSize: "300% 300%", animation: "occ-aurora 18s ease infinite" }}>
      <style>{`
        @keyframes occ-aurora { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes occ-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 480px) { .occ-h1 { font-size: 2rem !important; } .occ-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (prefers-reduced-motion: reduce) { [data-occ-card] { transition: none !important; } }
        textarea { font-family: ${font}; }
        select option { background: #1a1a2e; color: #fff; }
      `}</style>

      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "28px 20px 0", textAlign: "center" }}>
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 700, height: 340, borderRadius: "50%", background: `radial-gradient(ellipse at 40% 60%, ${accent}30 0%, ${accent}15 40%, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />

        <button onClick={() => navigate(-1)} style={{ position: "relative", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", padding: "7px 16px", borderRadius: 100, cursor: "pointer", fontSize: 12, fontFamily: font, fontWeight: 600, marginBottom: 28 }}>← Back</button>

        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: accent + "22", border: `1px solid ${accent}55`, borderRadius: 100, padding: "5px 14px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, boxShadow: `0 0 6px ${accent}cc` }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>{occ.eyebrow}</span>
          </span>
        </div>

        <h1 className="occ-h1" style={{ position: "relative", fontSize: "clamp(2.2rem,5vw,3rem)", fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
          {occ.emoji} {occ.name}
        </h1>
        <p style={{ position: "relative", fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 36px", lineHeight: 1.55 }}>{occ.tagline}</p>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px 56px" }}>
        {sections.map((sec, si) => (
          <div key={sec.id} style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 18 }}>{sec.label.split(" ")[0]}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>{sec.label.split(" ").slice(1).join(" ")}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{sec.subtitle}</div>
              </div>
            </div>
            <div className="occ-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {sec.tools.map((t, ti) => {
                const isH = hovered === t.id;
                const g = glare[t.id];
                const bg = g ? `radial-gradient(circle at ${g.x}% ${g.y}%, ${t.color}33 0%, rgba(255,255,255,0.06) 55%), rgba(255,255,255,0.04)` : "rgba(255,255,255,0.04)";
                return (
                  <div key={t.id} data-occ-card onClick={() => setOpen(t.id)} onMouseEnter={() => setHovered(t.id)} onMouseMove={e => handleMove(e, t.id)} onMouseLeave={() => handleLeave(t.id)} style={{ background: bg, border: `1.5px solid ${isH ? t.color + "55" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: "18px 15px 15px", cursor: "pointer", transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s", transform: isH ? "translateY(-3px) scale(1.01)" : "none", boxShadow: isH ? `0 10px 32px ${t.color}28` : "none", animation: "occ-in 0.4s ease both", animationDelay: `${(si * 6 + ti) * 0.04}s`, willChange: "background" }}>
                    <div style={{ fontSize: 26, marginBottom: 10, lineHeight: 1 }}>{t.emoji}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", marginBottom: 5, lineHeight: 1.3 }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.4 }}>{t.desc}</div>
                    <div style={{ width: 20, height: 2.5, background: t.color, borderRadius: 4, marginTop: 12, opacity: isH ? 1 : 0.55, transition: "opacity 0.18s" }} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {renderModal()}
    </div>
  );
}

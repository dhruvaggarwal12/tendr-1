import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TRUTHS, DARES, NEVER_HAVE_I, WOULD_YOU_RATHER,
  CHARADES, HOT_TAKES, BINGO_SQUARES, PARTY_THEMES, CHECKLIST_TEMPLATE
} from "../../data/housePartyData";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', 'Inter', sans-serif";

const THEMES = ["Retro 70s", "Bollywood Night", "Neon Glow", "Black & White", "Beach Vibes", "Royale / OTT", "Masquerade", "Fairy Lights"];

// ── helpers ──────────────────────────────────────────────────────────────────
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function copyLink(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

// ── shared modal shell ────────────────────────────────────────────────────────
function Modal({ onClose, title, emoji, children, wide }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a2e", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: wide ? 700 : 480, maxHeight: "92dvh", overflowY: "auto", padding: "24px 20px calc(32px + env(safe-area-inset-bottom, 0px))", fontFamily: font, boxShadow: "0 -8px 40px rgba(0,0,0,0.5)" }}>
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

// ── styled inputs ─────────────────────────────────────────────────────────────
const inp = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 14, fontFamily: font, boxSizing: "border-box", outline: "none", minWidth: 0 };
const btn = (color = "#7C3AED") => ({ padding: "12px 20px", borderRadius: 12, border: "none", background: color, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, width: "100%" });
const label = { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" };
const card = { background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, color: "#fff", fontSize: 14 };

// ════════════════════════════════════════════════════════════════════════════
// GAME MODALS
// ════════════════════════════════════════════════════════════════════════════

function TruthOrDare({ onClose }) {
  const [mode, setMode] = useState(null); // 'truth' | 'dare'
  const [card, setCardState] = useState(null);

  const pick = (m) => { setMode(m); setCardState(rand(m === "truth" ? TRUTHS : DARES)); };
  const next = () => setCardState(rand(mode === "truth" ? TRUTHS : DARES));

  return (
    <Modal onClose={onClose} emoji="🎯" title="Truth or Dare">
      {!card ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => pick("truth")} style={{ ...btn("#1D4ED8"), padding: "18px 20px", fontSize: 18 }}>🤔 Truth</button>
          <button onClick={() => pick("dare")} style={{ ...btn("#DC2626"), padding: "18px 20px", fontSize: 18 }}>🔥 Dare</button>
        </div>
      ) : (
        <div>
          <div style={{ background: mode === "truth" ? "rgba(29,78,216,0.2)" : "rgba(220,38,38,0.2)", borderRadius: 16, padding: "28px 20px", textAlign: "center", marginBottom: 20, border: `1.5px solid ${mode === "truth" ? "rgba(29,78,216,0.4)" : "rgba(220,38,38,0.4)"}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: mode === "truth" ? "#60A5FA" : "#F87171", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>{mode === "truth" ? "🤔 TRUTH" : "🔥 DARE"}</div>
            <div style={{ fontSize: 17, color: "#fff", lineHeight: 1.5 }}>{card}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={next} style={{ ...btn("#7C3AED"), flex: 1 }}>Next Card</button>
            <button onClick={() => { setMode(null); setCardState(null); }} style={{ ...btn("rgba(255,255,255,0.1)"), flex: 1 }}>Switch</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function NeverHaveI({ onClose }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * NEVER_HAVE_I.length));
  const [scores, setScores] = useState({});
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState("");

  const addPlayer = () => { if (newPlayer.trim()) { setPlayers(p => [...p, newPlayer.trim()]); setNewPlayer(""); } };
  const mark = (name) => setScores(s => ({ ...s, [name]: (s[name] || 0) + 1 }));
  const next = () => setIdx(i => (i + 1) % NEVER_HAVE_I.length);

  return (
    <Modal onClose={onClose} emoji="🙅" title="Never Have I Ever">
      {players.length < 2 ? (
        <div>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 16, fontSize: 14 }}>Add at least 2 players to track scores, or just play without tracking.</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={newPlayer} onChange={e => setNewPlayer(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()} placeholder="Player name" style={{ ...inp, flex: 1 }} />
            <button onClick={addPlayer} style={{ ...btn("#7C3AED"), width: "auto", padding: "10px 16px" }}>Add</button>
          </div>
          {players.map(p => <div key={p} style={{ ...card, display: "flex", justifyContent: "space-between" }}>{p} <span onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ cursor: "pointer", opacity: 0.5 }}>✕</span></div>)}
          <button onClick={next} style={{ ...btn("#059669"), marginTop: 8 }}>Play without scores →</button>
        </div>
      ) : (
        <div>
          <div style={{ background: "rgba(5,150,105,0.15)", border: "1.5px solid rgba(5,150,105,0.35)", borderRadius: 16, padding: "24px 18px", textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Never Have I Ever…</div>
            <div style={{ fontSize: 16, color: "#fff", lineHeight: 1.5 }}>{NEVER_HAVE_I[idx]}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Who HAS done it? (tap to add a point)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {players.map(p => (
                <button key={p} onClick={() => mark(p)} style={{ padding: "8px 14px", borderRadius: 20, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontFamily: font, fontSize: 13 }}>
                  {p} · {scores[p] || 0}
                </button>
              ))}
            </div>
          </div>
          <button onClick={next} style={btn("#059669")}>Next Statement</button>
        </div>
      )}
    </Modal>
  );
}

function WouldYouRather({ onClose }) {
  const [pair, setPair] = useState(() => rand(WOULD_YOU_RATHER));
  const [pick, setPick] = useState(null);

  const next = () => { setPair(rand(WOULD_YOU_RATHER)); setPick(null); };

  return (
    <Modal onClose={onClose} emoji="🤷" title="Would You Rather">
      <div style={{ marginBottom: 16 }}>
        {["a", "b"].map(side => (
          <button key={side} onClick={() => setPick(side)} style={{ display: "block", width: "100%", marginBottom: 10, padding: "20px 16px", borderRadius: 14, border: `2px solid ${pick === side ? "#7C3AED" : "rgba(255,255,255,0.15)"}`, background: pick === side ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, fontFamily: font, cursor: "pointer", textAlign: "left", lineHeight: 1.4 }}>
            {side === "a" ? "👈 " : "👉 "}{pair[side]}
          </button>
        ))}
      </div>
      {pick && <div style={{ textAlign: "center", color: "#A78BFA", fontSize: 14, marginBottom: 14 }}>You chose {pick === "a" ? `"${pair.a}"` : `"${pair.b}"`} — defend your answer!</div>}
      <button onClick={next} style={btn("#7C3AED")}>Next Question</button>
    </Modal>
  );
}

function HotTakes({ onClose }) {
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
        <button onClick={() => setAgreed(true)} style={{ ...btn(agreed === true ? "#059669" : "rgba(255,255,255,0.08)"), flex: 1 }}>✅ Agree</button>
        <button onClick={() => setAgreed(false)} style={{ ...btn(agreed === false ? "#DC2626" : "rgba(255,255,255,0.08)"), flex: 1 }}>❌ Disagree</button>
      </div>
      {agreed !== null && <div style={{ textAlign: "center", color: agreed ? "#34D399" : "#F87171", fontSize: 14, marginBottom: 12 }}>Debate time! Go.</div>}
      <button onClick={next} style={btn("#7C3AED")}>Next Take</button>
    </Modal>
  );
}

function SpinBottle({ onClose }) {
  const [players, setPlayers] = useState([]);
  const [newP, setNewP] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [angle, setAngle] = useState(0);

  const addP = () => { if (newP.trim()) { setPlayers(p => [...p, newP.trim()]); setNewP(""); } };
  const spin = () => {
    if (players.length < 2) return;
    setSpinning(true);
    setResult(null);
    const extra = 1440 + Math.random() * 720;
    setAngle(a => a + extra);
    setTimeout(() => {
      setSpinning(false);
      setResult(rand(players));
    }, 3000);
  };

  return (
    <Modal onClose={onClose} emoji="🍾" title="Spin the Bottle / Random Picker">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={newP} onChange={e => setNewP(e.target.value)} onKeyDown={e => e.key === "Enter" && addP()} placeholder="Add a name" style={{ ...inp, flex: 1 }} />
        <button onClick={addP} style={{ ...btn("#7C3AED"), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {players.map(p => (
          <span key={p} style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", color: "#C4B5FD", padding: "5px 12px", borderRadius: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            {p} <span onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ cursor: "pointer", opacity: 0.6 }}>✕</span>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", width: 180, height: 180 }}>
          <div style={{ width: 180, height: 180, borderRadius: "50%", border: "4px solid rgba(124,58,237,0.5)", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 4, height: 80, background: "linear-gradient(to top, #7C3AED, #C4B5FD)", borderRadius: 4, transformOrigin: "50% 100%", transform: `rotate(${angle}deg)`, transition: spinning ? "transform 3s cubic-bezier(0.17,0.67,0.12,0.99)" : "none", position: "absolute", bottom: "50%", left: "calc(50% - 2px)" }} />
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#7C3AED", zIndex: 2, position: "relative" }} />
          </div>
        </div>
      </div>
      {result && !spinning && <div style={{ textAlign: "center", fontSize: 22, fontWeight: 800, color: "#C4B5FD", marginBottom: 16 }}>🎯 {result}!</div>}
      <button onClick={spin} disabled={players.length < 2 || spinning} style={{ ...btn("#7C3AED"), opacity: players.length < 2 ? 0.5 : 1 }}>
        {spinning ? "Spinning…" : players.length < 2 ? "Add at least 2 names" : "SPIN!"}
      </button>
    </Modal>
  );
}

function Charades({ onClose }) {
  const cats = { bollywood: "🎬 Bollywood", webshows: "📺 Web Shows", celebs: "🌟 Celebs", memesphrases: "😂 Memes & Phrases" };
  const [cat, setCat] = useState(null);
  const [word, setWord] = useState(null);
  const [timer, setTimer] = useState(null);
  const timerRef = useRef(null);

  const pick = (c) => { setCat(c); setWord(rand(CHARADES[c])); setTimer(60); };
  const next = () => setWord(rand(CHARADES[cat]));

  useEffect(() => {
    if (timer === null) return;
    if (timer === 0) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [cat]);

  if (!cat) return (
    <Modal onClose={onClose} emoji="🎭" title="Dumb Charades">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Object.entries(cats).map(([k, v]) => (
          <button key={k} onClick={() => pick(k)} style={{ ...btn("rgba(124,58,237,0.3)"), border: "1.5px solid rgba(124,58,237,0.5)", textAlign: "left", padding: "14px 16px", fontSize: 15 }}>{v}</button>
        ))}
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} emoji="🎭" title="Dumb Charades">
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#A78BFA", marginBottom: 16 }}>{cats[cat]}</div>
        <div style={{ background: "rgba(124,58,237,0.15)", border: "2px solid rgba(124,58,237,0.4)", borderRadius: 20, padding: "32px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{word}</div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: timer > 10 ? "#34D399" : "#F87171", marginBottom: 16 }}>{timer}s</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={next} style={{ ...btn("#7C3AED"), flex: 1 }}>Next Word</button>
          <button onClick={() => { setCat(null); setWord(null); setTimer(null); }} style={{ ...btn("rgba(255,255,255,0.1)"), flex: 1 }}>Change Category</button>
        </div>
      </div>
    </Modal>
  );
}

function Bingo({ onClose }) {
  const [card] = useState(() => shuffle(BINGO_SQUARES).slice(0, 25).map((t, i) => ({ text: t, marked: i === 12 })));
  const [marked, setMarked] = useState(() => {
    const m = {}; m[12] = true; return m;
  });
  const [bingo, setBingo] = useState(false);

  const toggle = (i) => {
    if (i === 12) return;
    const next = { ...marked, [i]: !marked[i] };
    setMarked(next);

    const rows = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]];
    const cols = [[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24]];
    const diags = [[0,6,12,18,24],[4,8,12,16,20]];
    const lines = [...rows, ...cols, ...diags];
    setBingo(lines.some(line => line.every(j => next[j])));
  };

  return (
    <Modal onClose={onClose} emoji="🎱" title="Party Bingo" wide>
      {bingo && <div style={{ textAlign: "center", fontSize: 22, fontWeight: 800, color: "#FBBF24", marginBottom: 16, animation: "pulse 0.5s ease" }}>🎉 BINGO! You got it!</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 16 }}>
        {card.map((sq, i) => (
          <div key={i} onClick={() => toggle(i)} style={{ aspectRatio: "1", background: marked[i] ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${marked[i] ? "#7C3AED" : "rgba(255,255,255,0.12)"}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: 4, cursor: i === 12 ? "default" : "pointer", transition: "all 0.15s" }}>
            <span style={{ fontSize: 9, color: marked[i] ? "#fff" : "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.2 }}>{sq.text}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>Tap squares you've seen happen at the party. Get 5 in a row to win!</p>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MANAGE / FUN MODALS
// ════════════════════════════════════════════════════════════════════════════

function Checklist({ onClose }) {
  const [guests, setGuests] = useState(10);

  const calc = (base, perPerson) => Math.ceil(base + perPerson * guests);

  const items = [
    { cat: "Food & Drinks", things: [
      { name: "Chips / Namkeen packs", qty: calc(0, 0.5) + " packs" },
      { name: "Cold drinks / Soft drinks (500ml)", qty: calc(0, 0.8) + " bottles" },
      { name: "Water bottles (1L)", qty: calc(0, 0.5) + " bottles" },
      { name: "Beer / Hard drinks (if applicable)", qty: "Per preference" },
      { name: "Pizza / Party food portions", qty: calc(0, 0.7) + " portions" },
    ]},
    { cat: "Tableware", things: [
      { name: "Disposable plates", qty: calc(5, 1.5) + " pieces" },
      { name: "Cups / Glasses", qty: calc(5, 2) + " pieces" },
      { name: "Napkins", qty: calc(10, 3) + " pieces" },
      { name: "Forks / Spoons", qty: calc(5, 1.5) + " pieces" },
    ]},
    { cat: "Decoration", things: [
      { name: "Balloons", qty: Math.ceil(guests * 3) + " balloons" },
      { name: "Fairy lights / LED strips", qty: "2 sets" },
      { name: "Streamers", qty: "3–4 rolls" },
    ]},
    { cat: "Misc", things: [
      { name: "Garbage bags", qty: "3–4 bags" },
      { name: "Extra phone chargers / power bank", qty: "2–3 units" },
      { name: "Bluetooth speaker", qty: "1–2 speakers" },
    ]},
  ];

  return (
    <Modal onClose={onClose} emoji="📋" title="Party Checklist" wide>
      <div style={{ marginBottom: 16 }}>
        <label style={label}>Guest Count</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setGuests(g => Math.max(2, g - 1))} style={{ ...btn("rgba(255,255,255,0.1)"), width: 40, padding: 0, height: 40 }}>−</button>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", minWidth: 40, textAlign: "center" }}>{guests}</span>
          <button onClick={() => setGuests(g => g + 1)} style={{ ...btn("#7C3AED"), width: 40, padding: 0, height: 40 }}>+</button>
        </div>
      </div>
      {items.map(({ cat, things }) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{cat}</div>
          {things.map(({ name, qty }) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 10, marginBottom: 6 }}>
              <span style={{ color: "#fff", fontSize: 13 }}>{name}</span>
              <span style={{ color: "#A78BFA", fontSize: 13, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{qty}</span>
            </div>
          ))}
        </div>
      ))}
    </Modal>
  );
}

function BillSplitter({ onClose }) {
  const [people, setPeople] = useState([]);
  const [newName, setNewName] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [paidBy, setPaidBy] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [view, setView] = useState("add"); // add | result

  const addPerson = () => { if (newName.trim()) { setPeople(p => [...p, newName.trim()]); setNewName(""); } };
  const addExpense = () => {
    if (!paidBy || !amount || isNaN(Number(amount))) return;
    setExpenses(e => [...e, { paidBy, amount: Number(amount), desc: desc || "Expense" }]);
    setAmount(""); setDesc("");
  };

  const calcSettlement = () => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const share = total / people.length;
    const balances = {};
    people.forEach(p => { balances[p] = 0; });
    expenses.forEach(e => { balances[e.paidBy] = (balances[e.paidBy] || 0) + e.amount; });
    people.forEach(p => { balances[p] = (balances[p] || 0) - share; });

    const txns = [];
    const debtors = Object.entries(balances).filter(([, v]) => v < -0.01).sort(([, a], [, b]) => a - b);
    const creditors = Object.entries(balances).filter(([, v]) => v > 0.01).sort(([, a], [, b]) => b - a);
    let di = 0, ci = 0;
    const dAmt = debtors.map(([, v]) => -v);
    const cAmt = creditors.map(([, v]) => v);
    while (di < debtors.length && ci < creditors.length) {
      const pay = Math.min(dAmt[di], cAmt[ci]);
      txns.push({ from: debtors[di][0], to: creditors[ci][0], amount: Math.round(pay) });
      dAmt[di] -= pay; cAmt[ci] -= pay;
      if (dAmt[di] < 0.01) di++;
      if (cAmt[ci] < 0.01) ci++;
    }
    return { total, share, txns };
  };

  return (
    <Modal onClose={onClose} emoji="💸" title="Bill Splitter" wide>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setView("add")} style={{ ...btn(view === "add" ? "#7C3AED" : "rgba(255,255,255,0.08)"), flex: 1, padding: "10px" }}>Add Expenses</button>
        <button onClick={() => setView("result")} style={{ ...btn(view === "result" ? "#7C3AED" : "rgba(255,255,255,0.08)"), flex: 1, padding: "10px" }}>See Settlement</button>
      </div>

      {view === "add" && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={label}>Add People</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addPerson()} placeholder="Name" style={{ ...inp, flex: 1 }} />
              <button onClick={addPerson} style={{ ...btn("#7C3AED"), width: "auto", padding: "10px 16px" }}>+</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {people.map(p => <span key={p} style={{ background: "rgba(124,58,237,0.2)", color: "#C4B5FD", padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>{p}</span>)}
            </div>
          </div>
          {people.length >= 2 && (
            <div>
              <label style={label}>Add an Expense</label>
              <select value={paidBy} onChange={e => setPaidBy(e.target.value)} style={{ ...inp, marginBottom: 8 }}>
                <option value="">Who paid?</option>
                {people.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₹)" type="number" style={{ ...inp, marginBottom: 8 }} />
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" style={{ ...inp, marginBottom: 10 }} />
              <button onClick={addExpense} style={btn("#7C3AED")}>Add Expense</button>
            </div>
          )}
          {expenses.map((e, i) => (
            <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span>{e.paidBy} — {e.desc}</span>
              <span style={{ fontWeight: 700, color: "#A78BFA" }}>₹{e.amount}</span>
            </div>
          ))}
        </>
      )}

      {view === "result" && people.length >= 2 && expenses.length > 0 && (() => {
        const { total, share, txns } = calcSettlement();
        return (
          <>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>₹{total}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>total · ₹{Math.round(share)} per person</div>
            </div>
            {txns.length === 0
              ? <div style={{ textAlign: "center", color: "#34D399", fontSize: 15 }}>✅ All settled!</div>
              : txns.map((t, i) => (
                <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between" }}>
                  <span><b style={{ color: "#F87171" }}>{t.from}</b> pays <b style={{ color: "#34D399" }}>{t.to}</b></span>
                  <span style={{ fontWeight: 700, color: "#FBBF24" }}>₹{t.amount}</span>
                </div>
              ))
            }
          </>
        );
      })()}
      {view === "result" && (people.length < 2 || expenses.length === 0) && (
        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14 }}>Add at least 2 people and 1 expense first.</p>
      )}
    </Modal>
  );
}

function ThemePicker({ onClose }) {
  const [votes, setVotes] = useState({});
  const [myVote, setMyVote] = useState(null);

  const vote = (t) => {
    if (myVote) setVotes(v => ({ ...v, [myVote]: Math.max(0, (v[myVote] || 0) - 1) }));
    setMyVote(t);
    setVotes(v => ({ ...v, [t]: (v[t] || 0) + 1 }));
  };
  const maxVotes = Math.max(...Object.values(votes), 0);

  return (
    <Modal onClose={onClose} emoji="🎨" title="Theme Picker">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Everyone votes. Pass the phone around!</p>
      {THEMES.map(t => (
        <div key={t} onClick={() => vote(t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${myVote === t ? "#7C3AED" : "rgba(255,255,255,0.1)"}`, background: myVote === t ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)", marginBottom: 8, cursor: "pointer" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontSize: 14 }}>{t}</div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${maxVotes ? ((votes[t] || 0) / maxVotes) * 100 : 0}%`, background: "#7C3AED", borderRadius: 4, transition: "width 0.3s" }} />
            </div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#A78BFA", minWidth: 28, textAlign: "right" }}>{votes[t] || 0}</span>
        </div>
      ))}
      {maxVotes > 0 && <div style={{ textAlign: "center", marginTop: 12, fontSize: 14, color: "#FBBF24" }}>🏆 Leading: {Object.entries(votes).sort(([,a],[,b]) => b-a)[0]?.[0]}</div>}
    </Modal>
  );
}

function Countdown({ onClose }) {
  const [target, setTarget] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  const start = () => {
    if (!target) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const diff = new Date(target) - Date.now();
      if (diff <= 0) { setTimeLeft("🎉 Party time!"); clearInterval(intervalRef.current); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <Modal onClose={onClose} emoji="⏱️" title="Countdown Timer">
      <label style={label}>Party Start Date & Time</label>
      <input type="datetime-local" value={target} onChange={e => setTarget(e.target.value)} style={{ ...inp, marginBottom: 12 }} />
      <button onClick={start} style={{ ...btn("#7C3AED"), marginBottom: 20 }}>Start Countdown</button>
      {timeLeft && (
        <div style={{ textAlign: "center", fontSize: typeof timeLeft === "string" && timeLeft.includes("🎉") ? 26 : 40, fontWeight: 800, color: "#FBBF24" }}>
          {timeLeft}
        </div>
      )}
    </Modal>
  );
}

function PlaylistBuilder({ onClose }) {
  const [songs, setSongs] = useState([]);
  const [newSong, setNewSong] = useState("");
  const [newArtist, setNewArtist] = useState("");

  const add = () => {
    if (!newSong.trim()) return;
    setSongs(s => [...s, { song: newSong.trim(), artist: newArtist.trim() }]);
    setNewSong(""); setNewArtist("");
  };

  const copy = () => {
    const text = songs.map((s, i) => `${i + 1}. ${s.song}${s.artist ? ` — ${s.artist}` : ""}`).join("\n");
    copyLink(text);
    alert("Playlist copied to clipboard!");
  };

  return (
    <Modal onClose={onClose} emoji="🎵" title="Playlist Builder">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Everyone adds 2 songs. Build tonight's playlist together.</p>
      <input value={newSong} onChange={e => setNewSong(e.target.value)} placeholder="Song name" style={{ ...inp, marginBottom: 8 }} />
      <input value={newArtist} onChange={e => setNewArtist(e.target.value)} placeholder="Artist (optional)" style={{ ...inp, marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && add()} />
      <button onClick={add} style={{ ...btn("#7C3AED"), marginBottom: 16 }}>Add Song</button>
      {songs.map((s, i) => (
        <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600 }}>{i + 1}. {s.song}</div>
            {s.artist && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{s.artist}</div>}
          </div>
          <span onClick={() => setSongs(ss => ss.filter((_, j) => j !== i))} style={{ cursor: "pointer", opacity: 0.5 }}>✕</span>
        </div>
      ))}
      {songs.length > 0 && <button onClick={copy} style={{ ...btn("rgba(255,255,255,0.1)"), marginTop: 10 }}>📋 Copy Playlist</button>}
    </Modal>
  );
}

function PartyReportCard({ onClose }) {
  const [ratings, setRatings] = useState({ vibe: 0, music: 0, food: 0, host: 0, drama: 0 });
  const [done, setDone] = useState(false);

  const cats = [
    { key: "vibe", label: "Overall Vibe", emoji: "✨" },
    { key: "music", label: "Music", emoji: "🎵" },
    { key: "food", label: "Food & Drinks", emoji: "🍕" },
    { key: "host", label: "Host", emoji: "👑" },
    { key: "drama", label: "Drama Level", emoji: "💀" },
  ];

  const avg = (Object.values(ratings).reduce((a, b) => a + b, 0) / 5).toFixed(1);
  const grade = avg >= 4.5 ? "S+" : avg >= 4 ? "A" : avg >= 3 ? "B" : avg >= 2 ? "C" : "D";
  const verdict = avg >= 4.5 ? "Legendary party!" : avg >= 4 ? "That was a banger!" : avg >= 3 ? "Decent night out" : avg >= 2 ? "Could've been better" : "Never again";

  return (
    <Modal onClose={onClose} emoji="🏆" title="Party Report Card">
      {!done ? (
        <>
          {cats.map(({ key, label, emoji }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#fff", marginBottom: 8 }}>{emoji} {label}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRatings(r => ({ ...r, [key]: n }))} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${ratings[key] >= n ? "#7C3AED" : "rgba(255,255,255,0.15)"}`, background: ratings[key] >= n ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.05)", color: "#fff", fontSize: 16, cursor: "pointer" }}>
                    {n <= ratings[key] ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setDone(true)} disabled={Object.values(ratings).some(r => r === 0)} style={{ ...btn("#7C3AED"), opacity: Object.values(ratings).some(r => r === 0) ? 0.5 : 1 }}>Generate Report Card</button>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 80, fontWeight: 900, color: grade === "S+" ? "#FBBF24" : grade === "A" ? "#34D399" : "#A78BFA" }}>{grade}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{verdict}</div>
          <div style={{ fontSize: 15, color: "#A78BFA", marginBottom: 20 }}>{avg} / 5.0</div>
          {cats.map(({ key, label, emoji }) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", marginBottom: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
              <span style={{ color: "#fff", fontSize: 13 }}>{emoji} {label}</span>
              <span style={{ color: "#FBBF24" }}>{"⭐".repeat(ratings[key])}</span>
            </div>
          ))}
          <button onClick={() => { setDone(false); setRatings({ vibe: 0, music: 0, food: 0, host: 0, drama: 0 }); }} style={{ ...btn("rgba(255,255,255,0.1)"), marginTop: 14 }}>Rate Again</button>
        </div>
      )}
    </Modal>
  );
}

// Potluck / Invite / PhotoWall — link-based, navigate to dedicated pages
function ShareableTool({ onClose, emoji, title, description, path, fields }) {
  const [data, setData] = useState({});
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const create = async () => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (payload.items && typeof payload.items === "string") {
        payload.items = payload.items.split(",").map(s => s.trim()).filter(Boolean);
      }
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      const id = json.roomId || json.inviteId || json.wallId;
      const url = `${window.location.origin}${path}/${id}`;
      setLink(url);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} emoji={emoji} title={title}>
      {!link ? (
        <>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>{description}</p>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={label}>{f.label}</label>
              <input value={data[f.key] || ""} onChange={e => setData(d => ({ ...d, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inp} />
            </div>
          ))}
          <button onClick={create} disabled={loading || !fields.every(f => !f.required || data[f.key]?.trim())} style={{ ...btn("#7C3AED"), marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating…" : `Create ${title}`}
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ color: "#34D399", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Link created!</div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px", wordBreak: "break-all", fontSize: 13, color: "#A78BFA", marginBottom: 16 }}>{link}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => copyLink(link)} style={{ ...btn("rgba(255,255,255,0.1)"), flex: 1 }}>📋 Copy Link</button>
            <button onClick={() => navigate(link.replace(window.location.origin, ""))} style={{ ...btn("#7C3AED"), flex: 1 }}>Open →</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN HUB
// ════════════════════════════════════════════════════════════════════════════

const TOOLS = [
  // Manage
  { id: "potluck", section: "manage", emoji: "🥘", title: "Potluck Planner", desc: "Shareable link · claim items · no duplicates", color: "#059669" },
  { id: "invite", section: "manage", emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP · live count", color: "#2563EB" },
  { id: "checklist", section: "manage", emoji: "📋", title: "Party Checklist", desc: "Enter guest count → auto buy list", color: "#D97706" },
  { id: "bills", section: "manage", emoji: "💸", title: "Bill Splitter", desc: "Enter spends → who owes whom", color: "#DC2626" },
  // Fun
  { id: "theme", section: "fun", emoji: "🎨", title: "Theme Picker", desc: "Vote as a group on party theme", color: "#7C3AED" },
  { id: "photowall", section: "fun", emoji: "📸", title: "Photo Wall", desc: "Shared album · everyone uploads", color: "#DB2777" },
  { id: "countdown", section: "fun", emoji: "⏱️", title: "Countdown Timer", desc: "Visual countdown to party time", color: "#0891B2" },
  { id: "playlist", section: "fun", emoji: "🎵", title: "Playlist Builder", desc: "Everyone adds 2 songs", color: "#059669" },
  // Games
  { id: "truthordare", section: "games", emoji: "🎯", title: "Truth or Dare", desc: "Indian youth decks — 25 truths + 25 dares", color: "#DC2626" },
  { id: "neverhavei", section: "games", emoji: "🙅", title: "Never Have I Ever", desc: "30 statements · score tracker", color: "#059669" },
  { id: "wouldyou", section: "games", emoji: "🤷", title: "Would You Rather", desc: "20 spicy choices — defend your answer", color: "#7C3AED" },
  { id: "hottakes", section: "games", emoji: "🌶️", title: "Hot Takes", desc: "25 hot takes · agree or disagree", color: "#DC2626" },
  { id: "spin", section: "games", emoji: "🍾", title: "Spin the Bottle", desc: "Add names → random picker with spinner", color: "#2563EB" },
  { id: "charades", section: "games", emoji: "🎭", title: "Dumb Charades", desc: "Bollywood · Web Shows · Celebs · Memes", color: "#D97706" },
  { id: "bingo", section: "games", emoji: "🎱", title: "Party Bingo", desc: "5×5 party scenario bingo cards", color: "#0891B2" },
  // Other
  { id: "reportcard", section: "other", emoji: "🏆", title: "Party Report Card", desc: "Rate the night · get a grade + verdict", color: "#FBBF24" },
];

const SECTIONS = [
  { id: "manage", label: "⚙️ Manage", subtitle: "Plan · track · split" },
  { id: "games", label: "🎮 Games", subtitle: "Biggest reason to come back" },
  { id: "fun", label: "✨ Fun", subtitle: "Theme · music · photos · countdown" },
  { id: "other", label: "🏆 Other", subtitle: "Post-party vibes" },
];

export default function HousePartyHub() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  const renderModal = () => {
    switch (open) {
      case "truthordare": return <TruthOrDare onClose={() => setOpen(null)} />;
      case "neverhavei": return <NeverHaveI onClose={() => setOpen(null)} />;
      case "wouldyou": return <WouldYouRather onClose={() => setOpen(null)} />;
      case "hottakes": return <HotTakes onClose={() => setOpen(null)} />;
      case "spin": return <SpinBottle onClose={() => setOpen(null)} />;
      case "charades": return <Charades onClose={() => setOpen(null)} />;
      case "bingo": return <Bingo onClose={() => setOpen(null)} />;
      case "checklist": return <Checklist onClose={() => setOpen(null)} />;
      case "bills": return <BillSplitter onClose={() => setOpen(null)} />;
      case "theme": return <ThemePicker onClose={() => setOpen(null)} />;
      case "countdown": return <Countdown onClose={() => setOpen(null)} />;
      case "playlist": return <PlaylistBuilder onClose={() => setOpen(null)} />;
      case "reportcard": return <PartyReportCard onClose={() => setOpen(null)} />;
      case "potluck": return (
        <ShareableTool onClose={() => setOpen(null)} emoji="🥘" title="Potluck Planner" description="Create a potluck room. Share the link — friends claim what they'll bring."
          path="/house-party/potluck"
          fields={[
            { key: "partyName", label: "Party Name", placeholder: "Aman's Birthday Bash", required: true },
            { key: "hostName", label: "Your Name", placeholder: "Aman", required: true },
            { key: "items", label: "Items (comma-separated)", placeholder: "Chips, Coke, Beer, Cake, Plates", required: true },
          ]}
        />
      );
      case "invite": return (
        <ShareableTool onClose={() => setOpen(null)} emoji="📨" title="Digital Invite & RSVP" description="Create an invite. Share the link — guests RSVP instantly."
          path="/house-party/invite"
          fields={[
            { key: "partyName", label: "Party Name", placeholder: "Saturday Night Out", required: true },
            { key: "hostName", label: "Host Name", placeholder: "Rohit", required: true },
            { key: "date", label: "Date", placeholder: "19 July 2026" },
            { key: "time", label: "Time", placeholder: "8:00 PM" },
            { key: "location", label: "Location", placeholder: "Aman's place, Sector 18, Noida" },
            { key: "note", label: "Note (optional)", placeholder: "Dress code: neon!" },
          ]}
        />
      );
      case "photowall": return (
        <ShareableTool onClose={() => setOpen(null)} emoji="📸" title="Shared Photo Wall" description="Create a photo wall. Share the link — everyone uploads their photos."
          path="/house-party/photo-wall"
          fields={[
            { key: "partyName", label: "Party Name", placeholder: "Saturday Night 🎉", required: true },
          ]}
        />
      );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)", fontFamily: font, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ padding: "20px 18px 0" }}>
        <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: font, marginBottom: 20 }}>← Back</button>
        <div style={{ textAlign: "center", paddingBottom: 24 }}>
          <div style={{ fontSize: 52 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "8px 0 4px", letterSpacing: "-0.02em" }}>House Party Hub</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>The app everyone opens during the party</p>
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map(sec => {
        const tools = TOOLS.filter(t => t.section === sec.id);
        return (
          <div key={sec.id} style={{ padding: "0 16px", marginBottom: 28 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{sec.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{sec.subtitle}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
              {tools.map(t => (
                <div key={t.id} onClick={() => setOpen(t.id)} style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 14px", cursor: "pointer", transition: "all 0.15s", active: { transform: "scale(0.97)" } }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{t.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{t.desc}</div>
                  <div style={{ width: 24, height: 3, background: t.color, borderRadius: 4, marginTop: 10 }} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {renderModal()}
    </div>
  );
}

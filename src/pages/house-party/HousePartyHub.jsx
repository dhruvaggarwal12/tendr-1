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
function copyLink(text) { navigator.clipboard?.writeText(text).catch(() => {}); }

const hpic = (d, sz = 20) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;

const TOOL_ICONS = {
  potluck:        hpic(<><path d="M3 11l19-9-9 19-2-8-8-2z"/></>),
  invite:         hpic(<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>),
  checklist:      hpic(<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>),
  bills:          hpic(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>),
  theme:          hpic(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>),
  photowall:      hpic(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>),
  countdown:      hpic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>),
  playlist:       hpic(<><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>),
  truthordare:    hpic(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="22" y1="12" x2="19" y2="12"/><line x1="5" y1="12" x2="2" y2="12"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/></>),
  neverhavei:     hpic(<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>),
  wouldyou:       hpic(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>),
  hottakes:       hpic(<><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></>),
  spin:           hpic(<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></>),
  charades:       hpic(<><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/><line x1="9" y1="2" x2="9" y2="22"/><line x1="15" y1="2" x2="15" y2="22"/></>),
  bingo:          hpic(<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></>),
  mostlikelyto:   hpic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  reportcard:     hpic(<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>),
  guestlist:      hpic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  menu:           hpic(<><path d="M3 11l19-9-9 19-2-8-8-2z"/></>),
  seating:        hpic(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>),
  daytimeline:    hpic(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>),
  venue:          hpic(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>),
};
const SECTION_SVGS = {
  manage: hpic(<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></>, 16),
  games:  hpic(<><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M7 12h.01"/><path d="M17 12h.01"/><path d="M12 8v8"/></>, 16),
  fun:    hpic(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>, 16),
  other:  hpic(<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>, 16),
};

// ── shared modal shell ────────────────────────────────────────────────────────
function Modal({ onClose, title, emoji, children, wide }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#140e08", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: wide ? 700 : 480, maxHeight: "92dvh", overflowY: "auto", padding: "24px 20px calc(32px + env(safe-area-inset-bottom, 0px))", fontFamily: font, boxShadow: "0 -8px 40px rgba(0,0,0,0.5)" }}>
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
            <span style={{ fontSize: 11, color: marked[i] ? "#fff" : "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.2 }}>{sq.text}</span>
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

// ── Most Likely To ───────────────────────────────────────────────────────────
const MOST_LIKELY_TO = [
  "Most likely to still be awake at 5 AM",
  "Most likely to accidentally text the wrong person something embarrassing",
  "Most likely to become famous one day",
  "Most likely to forget someone's name 2 minutes after meeting them",
  "Most likely to cry at a movie",
  "Most likely to be late to their own wedding",
  "Most likely to end up on a reality show",
  "Most likely to ghost someone they like",
  "Most likely to order food at 2 AM",
  "Most likely to have a secret talent no one knows about",
  "Most likely to accidentally like an old Instagram photo while stalking someone",
  "Most likely to move to another city on impulse",
  "Most likely to start a business that fails spectacularly",
  "Most likely to be the reason the party gets shut down",
  "Most likely to fall asleep before midnight on New Year's Eve",
  "Most likely to become a travel blogger",
  "Most likely to marry someone they met online",
  "Most likely to still be using Snapchat in 2030",
  "Most likely to get kicked off a flight",
  "Most likely to run into their ex at the worst possible moment",
];

function MostLikelyTo({ onClose }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * MOST_LIKELY_TO.length));
  const [voted, setVoted] = useState(null);

  const next = () => { setIdx(i => (i + 1) % MOST_LIKELY_TO.length); setVoted(null); };

  return (
    <Modal onClose={onClose} emoji="🎲" title="Most Likely To">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>
        Everyone points at the person they think fits — most fingers = winner.
      </p>
      <div style={{ background: "rgba(124,58,237,0.15)", border: "1.5px solid rgba(124,58,237,0.35)", borderRadius: 16, padding: "28px 20px", textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#A78BFA", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>🎲 MOST LIKELY TO…</div>
        <div style={{ fontSize: 17, color: "#fff", lineHeight: 1.55 }}>{MOST_LIKELY_TO[idx]}</div>
      </div>
      {voted && (
        <div style={{ textAlign: "center", fontSize: 26, marginBottom: 14, color: "#FBBF24", fontWeight: 800 }}>
          👆 Everyone point now!
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setVoted(true)} style={{ ...btn("rgba(124,58,237,0.4)"), flex: 1 }}>👆 Point!</button>
        <button onClick={next} style={{ ...btn("rgba(255,255,255,0.1)"), flex: 1 }}>Next →</button>
      </div>
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

// ── Polygon Layout (triangle for 3, square for 4, pentagon for 5 … octagon for 8) ──
function PolygonGrid({ tools, onOpen }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState(340);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => setSize(entry.contentRect.width));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const n = tools.length;
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.355;
  // Larger nodes for fewer items, smaller for more
  const nW = Math.max(64, Math.min(size * 0.26, 64 + (8 - n) * 4));
  const nH = nW * 1.12;

  const pts = tools.map((_, i) => {
    const a = ((i * 360) / n - 90) * (Math.PI / 180);
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });

  // Even N → diameters (opposite vertices); Odd N → spokes from center
  const innerLines = n % 2 === 0
    ? Array.from({ length: n / 2 }, (_, i) => [pts[i], pts[i + n / 2]])
    : pts.map(p => [{ x: cx, y: cy }, p]);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative', paddingBottom: '100%', maxWidth: 460, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <filter id="pg-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="pg-glow-sm" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Inner lines — diameters (even) or spokes (odd) */}
          {innerLines.map(([a, b], i) => (
            <line key={`il${i}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="rgba(167,139,250,0.14)" strokeWidth="1"
            />
          ))}

          {/* Outer polygon edges */}
          {Array.from({ length: n }, (_, i) => (
            <line key={`e${i}`}
              x1={pts[i].x} y1={pts[i].y}
              x2={pts[(i + 1) % n].x} y2={pts[(i + 1) % n].y}
              stroke="rgba(196,122,46,0.35)" strokeWidth="1.6"
              filter="url(#pg-glow-sm)"
            />
          ))}

          {/* Vertex dots */}
          {pts.map((p, i) => (
            <circle key={`v${i}`} cx={p.x} cy={p.y} r={3.5}
              fill="rgba(196,122,46,0.7)" filter="url(#pg-glow-sm)" />
          ))}

          {/* Center dot */}
          <circle cx={cx} cy={cy} r={5}
            fill="rgba(196,122,46,0.55)" filter="url(#pg-glow)" />
        </svg>

        {/* Tool nodes */}
        {tools.map((t, i) => {
          const p = pts[i];
          return (
            <button
              key={t.id}
              onClick={() => onOpen(t.id)}
              style={{
                position: 'absolute',
                width: nW,
                height: nH,
                left: p.x - nW / 2,
                top: p.y - nH / 2,
                background: `radial-gradient(circle at 50% 30%, ${t.color}2a, rgba(14,10,4,0.92))`,
                border: `1.5px solid ${t.color}55`,
                borderRadius: 14,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '6px 4px',
                fontFamily: font,
                transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                boxSizing: 'border-box',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = `0 0 24px ${t.color}55`;
                e.currentTarget.style.borderColor = `${t.color}bb`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = `${t.color}55`;
              }}
            >
              <span style={{ color: t.color, display: "flex", lineHeight: 1 }}>{TOOL_ICONS[t.id] || hpic(<circle cx="12" cy="12" r="9"/>, Math.max(18, nW * 0.27))}</span>
              <span style={{
                fontSize: Math.max(11, nW * 0.12),
                fontWeight: 700,
                color: '#fff',
                textAlign: 'center',
                lineHeight: 1.2,
                padding: '0 3px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>{t.title}</span>
              <div style={{ width: '44%', height: 2, background: t.color, borderRadius: 4, opacity: 0.72 }} />
            </button>
          );
        })}
      </div>
    </div>
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
  { id: "bills",        section: "manage", emoji: "💸", title: "Bill Splitter",    desc: "Enter spends → who owes whom",              color: "#DC2626" },
  { id: "guestlist",   section: "manage", emoji: "👥", title: "Guest List",      desc: "Track RSVPs · who's confirmed",              color: "#7C3AED" },
  { id: "menu",        section: "manage", emoji: "🍽️", title: "Menu Planner",    desc: "Plan food · drinks · who brings what",        color: "#059669" },
  { id: "seating",     section: "manage", emoji: "🪑", title: "Seating Chart",   desc: "Assign seats · manage tables",                color: "#0891B2" },
  { id: "daytimeline", section: "manage", emoji: "🗓️", title: "Party Timeline",  desc: "Schedule the day · minute by minute",         color: "#D97706" },
  { id: "venue",       section: "manage", emoji: "📍", title: "Venue Notes",     desc: "Address · parking · contacts · notes",        color: "#DC2626" },
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
  { id: "mostlikelyto", section: "games", emoji: "🎲", title: "Most Likely To", desc: "Point at whoever fits — most fingers wins", color: "#A855F7" },
  // Other
  { id: "reportcard", section: "fun", emoji: "🏆", title: "Party Report Card", desc: "Rate the night · get a grade + verdict", color: "#FBBF24" },
];

const SECTIONS = [
  { id: "manage", label: "Manage", subtitle: "Plan · track · coordinate" },
  { id: "games",  label: "Games",  subtitle: "Biggest reason to come back" },
  { id: "fun",    label: "Fun",    subtitle: "Theme · music · photos · countdown" },
];

// ── Coordination tool modals ──────────────────────────────────────────────────

function GuestListModal({ onClose }) {
  const SK = 'tendr-hp-guestlist';
  const [guests, setGuests] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } });
  const [input, setInput] = useState('');
  const save = (g) => { setGuests(g); try { localStorage.setItem(SK, JSON.stringify(g)); } catch {} };
  const add = () => { if (!input.trim()) return; save([...guests, { id: Date.now(), name: input.trim(), rsvp: 'pending' }]); setInput(''); };
  const setRsvp = (id, rsvp) => save(guests.map(g => g.id === id ? { ...g, rsvp } : g));
  const counts = { yes: guests.filter(g => g.rsvp === 'yes').length, no: guests.filter(g => g.rsvp === 'no').length, maybe: guests.filter(g => g.rsvp === 'maybe').length, pending: guests.filter(g => g.rsvp === 'pending').length };
  return (
    <Modal onClose={onClose} title="Guest List" emoji="👥">
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[['Coming', counts.yes, '#22c55e'], ['Maybe', counts.maybe, '#f59e0b'], ['Not Coming', counts.no, '#ef4444'], ['Pending', counts.pending, '#6b7280']].map(([label, count, color]) => (
          <div key={label} style={{ flex: 1, minWidth: 64, textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 4px', border: `1px solid ${color}30` }}>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>{count}</div>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Guest name…" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: font, outline: 'none' }} />
        <button onClick={add} style={{ background: '#C47A2E', border: 'none', borderRadius: 10, padding: '10px 18px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>Add</button>
      </div>
      {guests.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, padding: '32px 0' }}>No guests yet. Add names above!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {guests.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '9px 12px' }}>
              <span style={{ flex: 1, fontSize: 14, color: '#fff', fontFamily: font }}>{g.name}</span>
              {[['✓', 'yes', '#22c55e'], ['?', 'maybe', '#f59e0b'], ['✗', 'no', '#ef4444']].map(([label, val, color]) => (
                <button key={val} onClick={() => setRsvp(g.id, g.rsvp === val ? 'pending' : val)} style={{ padding: '4px 9px', borderRadius: 100, border: `1.5px solid ${g.rsvp === val ? color : 'rgba(255,255,255,0.1)'}`, background: g.rsvp === val ? color + '22' : 'transparent', color: g.rsvp === val ? color : 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>{label}</button>
              ))}
              <button onClick={() => save(guests.filter(x => x.id !== g.id))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px' }}>×</button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function MenuPlannerModal({ onClose }) {
  const SK = 'tendr-hp-menu';
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } });
  const [name, setName] = useState('');
  const [cat, setCat] = useState('food');
  const save = (it) => { setItems(it); try { localStorage.setItem(SK, JSON.stringify(it)); } catch {} };
  const add = () => { if (!name.trim()) return; save([...items, { id: Date.now(), name: name.trim(), cat, done: false }]); setName(''); };
  const toggle = (id) => save(items.map(it => it.id === id ? { ...it, done: !it.done } : it));
  const cats = [
    { id: 'food', label: '🍲 Food', color: '#f97316' },
    { id: 'drinks', label: '🥂 Drinks', color: '#06b6d4' },
    { id: 'dessert', label: '🍰 Dessert', color: '#ec4899' },
    { id: 'other', label: '📦 Other', color: '#8b5cf6' },
  ];
  return (
    <Modal onClose={onClose} title="Menu Planner" emoji="🍽️">
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{ fontSize: 12, padding: '5px 11px', borderRadius: 100, border: `1.5px solid ${cat === c.id ? c.color : 'rgba(255,255,255,0.1)'}`, background: cat === c.id ? c.color + '22' : 'transparent', color: cat === c.id ? c.color : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: font, fontWeight: 700 }}>{c.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Add menu item…" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: font, outline: 'none' }} />
        <button onClick={add} style={{ background: '#C47A2E', border: 'none', borderRadius: 10, padding: '10px 18px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>Add</button>
      </div>
      {cats.map(c => {
        const catItems = items.filter(it => it.cat === c.id);
        if (!catItems.length) return null;
        return (
          <div key={c.id} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: c.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>{c.label} ({catItems.length})</div>
            {catItems.map(it => (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 5 }}>
                <button onClick={() => toggle(it.id)} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${it.done ? c.color : 'rgba(255,255,255,0.2)'}`, background: it.done ? c.color + '28' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {it.done && <span style={{ color: c.color, fontSize: 11, fontWeight: 900 }}>✓</span>}
                </button>
                <span style={{ flex: 1, fontSize: 14, color: it.done ? 'rgba(255,255,255,0.3)' : '#fff', textDecoration: it.done ? 'line-through' : 'none', fontFamily: font }}>{it.name}</span>
                <button onClick={() => save(items.filter(x => x.id !== it.id))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px' }}>×</button>
              </div>
            ))}
          </div>
        );
      })}
      {items.length === 0 && <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, padding: '28px 0' }}>Pick a category and add menu items!</div>}
    </Modal>
  );
}

function DayTimelineModal({ onClose }) {
  const SK = 'tendr-hp-daytimeline';
  const [entries, setEntries] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } });
  const [time, setTime] = useState('');
  const [event, setEvent] = useState('');
  const save = (e) => { setEntries(e); try { localStorage.setItem(SK, JSON.stringify(e)); } catch {} };
  const add = () => { if (!time || !event.trim()) return; save([...entries, { id: Date.now(), time, event: event.trim(), done: false }].sort((a, b) => a.time.localeCompare(b.time))); setTime(''); setEvent(''); };
  const toggle = (id) => save(entries.map(e => e.id === id ? { ...e, done: !e.done } : e));
  return (
    <Modal onClose={onClose} title="Party Timeline" emoji="🗓️">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 10px', color: '#fff', fontSize: 14, fontFamily: font, outline: 'none', width: 100, colorScheme: 'dark' }} />
        <input value={event} onChange={e => setEvent(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="What happens?" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: font, outline: 'none' }} />
        <button onClick={add} disabled={!time || !event.trim()} style={{ background: time && event.trim() ? '#C47A2E' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer', opacity: time && event.trim() ? 1 : 0.4 }}>+</button>
      </div>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, padding: '28px 0' }}>Add time slots to build the day's schedule!</div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 44, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.06)', zIndex: 0 }} />
          {entries.map(e => (
            <div key={e.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 0', position: 'relative', zIndex: 1 }}>
              <div style={{ minWidth: 44, fontSize: 11, fontWeight: 800, color: e.done ? 'rgba(255,255,255,0.2)' : '#CCAB4A', textAlign: 'right', paddingTop: 3, flexShrink: 0 }}>{e.time}</div>
              <button onClick={() => toggle(e.id)} style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${e.done ? '#22c55e' : 'rgba(255,255,255,0.2)'}`, background: e.done ? '#22c55e28' : '#140e08', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                {e.done && <span style={{ color: '#22c55e', fontSize: 9, fontWeight: 900 }}>✓</span>}
              </button>
              <div style={{ flex: 1, fontSize: 14, color: e.done ? 'rgba(255,255,255,0.3)' : '#fff', textDecoration: e.done ? 'line-through' : 'none', fontFamily: font, paddingTop: 1, lineHeight: 1.4 }}>{e.event}</div>
              <button onClick={() => save(entries.filter(x => x.id !== e.id))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: 18, lineHeight: 1, paddingTop: 2 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function VenueNotesModal({ onClose }) {
  const SK = 'tendr-hp-venue';
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '{}'); } catch { return {}; } });
  const update = (key, val) => { const d = { ...data, [key]: val }; setData(d); try { localStorage.setItem(SK, JSON.stringify(d)); } catch {} };
  const fields = [
    { key: 'address', label: '📍 Address', placeholder: '42, Sector 18, Noida, UP 201301', rows: 2 },
    { key: 'parking', label: '🅿️ Parking', placeholder: 'Free parking in basement, enter from Gate B', rows: 2 },
    { key: 'contact', label: '📞 Venue Contact', placeholder: '+91 98765 43210', rows: 1 },
    { key: 'entry', label: '🚪 Entry Instructions', placeholder: 'Take lift to 5th floor, Suite 502', rows: 2 },
    { key: 'notes', label: '📝 Notes', placeholder: 'Decor setup from 5 PM · No outside food · Parking free till 11 PM', rows: 3 },
  ];
  return (
    <Modal onClose={onClose} title="Venue Notes" emoji="📍">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {fields.map(f => (
          <div key={f.key}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{f.label}</div>
            <textarea value={data[f.key] || ''} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} rows={f.rows}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, fontFamily: font, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5, colorScheme: 'dark' }}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
}

function SeatingChartModal({ onClose }) {
  const TSK = 'tendr-hp-seating-tables';
  const GSK = 'tendr-hp-seating-guests';
  const [tables, setTables] = useState(() => { try { return JSON.parse(localStorage.getItem(TSK) || '[]'); } catch { return []; } });
  const [guests, setGuests] = useState(() => { try { return JSON.parse(localStorage.getItem(GSK) || '[]'); } catch { return []; } });
  const [tName, setTName] = useState('');
  const [gName, setGName] = useState('');
  const saveT = (t) => { setTables(t); try { localStorage.setItem(TSK, JSON.stringify(t)); } catch {} };
  const saveG = (g) => { setGuests(g); try { localStorage.setItem(GSK, JSON.stringify(g)); } catch {} };
  const addTable = () => { if (!tName.trim()) return; saveT([...tables, { id: Date.now(), name: tName.trim() }]); setTName(''); };
  const addGuest = () => { if (!gName.trim()) return; saveG([...guests, { id: Date.now(), name: gName.trim(), table: null }]); setGName(''); };
  const assign = (gId, tId) => saveG(guests.map(g => g.id === gId ? { ...g, table: tId ? Number(tId) : null } : g));
  return (
    <Modal onClose={onClose} title="Seating Chart" emoji="🪑" wide>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Tables</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <input value={tName} onChange={e => setTName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTable()} placeholder="Table name" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, fontFamily: font, outline: 'none' }} />
            <button onClick={addTable} style={{ background: '#C47A2E', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>+</button>
          </div>
          {tables.length === 0 ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: 16 }}>Add tables above</div> : tables.map(t => {
            const seated = guests.filter(g => g.table === t.id);
            return (
              <div key={t.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#CCAB4A', marginBottom: seated.length ? 6 : 0 }}>{t.name} · {seated.length} seated</div>
                {seated.map(g => <div key={g.id} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', padding: '2px 0' }}>{g.name}</div>)}
                {!seated.length && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>Empty</div>}
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Guests</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <input value={gName} onChange={e => setGName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGuest()} placeholder="Guest name" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, fontFamily: font, outline: 'none' }} />
            <button onClick={addGuest} style={{ background: '#C47A2E', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>+</button>
          </div>
          {guests.length === 0 ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: 16 }}>Add guests above</div> : guests.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 10px', marginBottom: 6 }}>
              <span style={{ flex: 1, fontSize: 13, color: '#fff', fontFamily: font, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
              <select value={g.table || ''} onChange={e => assign(g.id, e.target.value)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#fff', fontSize: 11, padding: '4px 5px', fontFamily: font, outline: 'none', colorScheme: 'dark', maxWidth: 90 }}>
                <option value="">No seat</option>
                {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function HousePartyHub() {
  const [open, setOpen] = useState(null);
  const [hoveredTool, setHoveredTool] = useState(null);
  const [glare, setGlare] = useState({});
  const navigate = useNavigate();

  const handleCardMouseMove = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlare(prev => ({
      ...prev,
      [id]: {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      },
    }));
  };

  const handleCardMouseLeave = (id) => {
    setHoveredTool(null);
    setGlare(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const renderModal = () => {
    switch (open) {
      case "truthordare": return <TruthOrDare onClose={() => setOpen(null)} />;
      case "neverhavei": return <NeverHaveI onClose={() => setOpen(null)} />;
      case "wouldyou": return <WouldYouRather onClose={() => setOpen(null)} />;
      case "hottakes": return <HotTakes onClose={() => setOpen(null)} />;
      case "spin": return <SpinBottle onClose={() => setOpen(null)} />;
      case "charades": return <Charades onClose={() => setOpen(null)} />;
      case "bingo": return <Bingo onClose={() => setOpen(null)} />;
      case "mostlikelyto": return <MostLikelyTo onClose={() => setOpen(null)} />;
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
      case "guestlist":   return <GuestListModal onClose={() => setOpen(null)} />;
      case "menu":        return <MenuPlannerModal onClose={() => setOpen(null)} />;
      case "seating":     return <SeatingChartModal onClose={() => setOpen(null)} />;
      case "daytimeline": return <DayTimelineModal onClose={() => setOpen(null)} />;
      case "venue":       return <VenueNotesModal onClose={() => setOpen(null)} />;
      default: return null;
    }
  };

  return (
    <div className="hp-aurora-bg" style={{ minHeight: "100dvh", fontFamily: font }}>
      <style>{`
        @keyframes hp-aurora {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes hp-tool-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hp-aurora-bg {
          background: linear-gradient(125deg, #0e0a04, #160d06, #0c0903, #160d06, #0e0a04);
          background-size: 300% 300%;
          animation: hp-aurora 18s ease infinite;
        }
        @media (max-width: 480px) {
          .hp-hero-h1 { font-size: 2rem !important; }
          .hp-grid    { grid-template-columns: 1fr 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hp-aurora-bg { animation: none; }
          [data-hp-card] { transition: none !important; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ position: "relative", overflow: "hidden", padding: "28px 20px 0", textAlign: "center" }}>
        {/* Aurora accent layer */}
        <div style={{
          position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)",
          width: 700, height: 340, borderRadius: "50%",
          background: "radial-gradient(ellipse at 40% 60%, rgba(124,58,237,0.18) 0%, rgba(37,99,235,0.1) 40%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />

        {/* back */}
        <button onClick={() => navigate(-1)} style={{
          position: "relative",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.7)", padding: "7px 16px",
          borderRadius: 100, cursor: "pointer", fontSize: 12,
          fontFamily: font, fontWeight: 600, marginBottom: 28,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
        >← Back</button>

        {/* eyebrow pill */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.35)",
            borderRadius: 100, padding: "5px 14px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#A78BFA", boxShadow: "0 0 6px rgba(167,139,250,0.8)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", letterSpacing: "0.1em", textTransform: "uppercase" }}>Party Toolkit</span>
          </span>
        </div>

        <h1 className="hp-hero-h1" style={{
          position: "relative",
          fontSize: "clamp(2.2rem,5vw,3rem)", fontWeight: 900,
          color: "#fff", margin: "0 0 8px", letterSpacing: "-0.025em", lineHeight: 1.1,
        }}>House Party Hub</h1>
        <p style={{
          position: "relative",
          fontSize: 14, color: "rgba(255,255,255,0.45)",
          margin: "0 0 36px", lineHeight: 1.55,
        }}>The app everyone opens during the party</p>
      </div>

      {/* ── Sections ── */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
        {SECTIONS.map((sec, si) => {
          const tools = TOOLS.filter(t => t.section === sec.id);
          return (
            <div key={sec.id} style={{ marginBottom: 36 }}>
              {/* Section header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <span style={{ color: "rgba(196,122,46,0.8)", display: "flex" }}>{SECTION_SVGS[sec.id] || SECTION_SVGS.other}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>{sec.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{sec.subtitle}</div>
                </div>
              </div>

              {/* Polygon web (triangle/square/pentagon/…/octagon) or plain grid for 1-2 */}
              {tools.length >= 3 ? (
                <PolygonGrid tools={tools} onOpen={setOpen} />
              ) : (
                <div className="hp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                  {tools.map((t, ti) => {
                    const isHovered = hoveredTool === t.id;
                    const g = glare[t.id];
                    const cardBg = g
                      ? `radial-gradient(circle at ${g.x}% ${g.y}%, ${t.color}33 0%, rgba(255,255,255,0.06) 55%), rgba(255,255,255,0.04)`
                      : "rgba(255,255,255,0.04)";
                    return (
                      <div
                        key={t.id}
                        data-hp-card
                        onClick={() => setOpen(t.id)}
                        onMouseEnter={() => setHoveredTool(t.id)}
                        onMouseMove={(e) => handleCardMouseMove(e, t.id)}
                        onMouseLeave={() => handleCardMouseLeave(t.id)}
                        style={{
                          background: cardBg,
                          border: `1.5px solid ${isHovered ? t.color + "55" : "rgba(255,255,255,0.07)"}`,
                          borderRadius: 16,
                          padding: "18px 15px 15px",
                          cursor: "pointer",
                          transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",
                          transform: isHovered ? "translateY(-3px) scale(1.01)" : "none",
                          boxShadow: isHovered ? `0 10px 32px ${t.color}28` : "none",
                          animation: `hp-tool-in 0.4s ease both`,
                          animationDelay: `${(si * tools.length + ti) * 0.04}s`,
                          willChange: "background",
                        }}
                      >
                        <div style={{ color: t.color, marginBottom: 10, lineHeight: 1 }}>{TOOL_ICONS[t.id] || hpic(<circle cx="12" cy="12" r="9"/>)}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", marginBottom: 5, lineHeight: 1.3 }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.4 }}>{t.desc}</div>
                        <div style={{ width: 20, height: 2.5, background: t.color, borderRadius: 4, marginTop: 12, opacity: isHovered ? 1 : 0.55, transition: "opacity 0.18s" }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Play Together CTA */}
      <div style={{ padding: "32px 20px 48px", display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/play")}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "16px 32px", borderRadius: 100,
            background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
            border: "none", cursor: "pointer",
            fontFamily: font, fontSize: 16, fontWeight: 800, color: "#fff",
            boxShadow: "0 8px 32px rgba(196,122,46,0.45)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(196,122,46,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 32px rgba(196,122,46,0.45)"; }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Play Together
        </button>
      </div>

      {renderModal()}
    </div>
  );
}

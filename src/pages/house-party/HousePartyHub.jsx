import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TRUTHS, DARES, NEVER_HAVE_I, WOULD_YOU_RATHER,
  CHARADES, HOT_TAKES, BINGO_SQUARES, PARTY_THEMES, CHECKLIST_TEMPLATE,
  HOT_SEAT_QUESTIONS, WORD_WOLF_PAIRS, CATEGORY_BLITZ, ROAST_PROMPTS,
} from "../../data/housePartyData";
import { usePartyRoom } from "../../hooks/usePartyRoom";
import DesignerWall from "../../components/DesignerWall";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Syne', sans-serif";

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
  twotruthslie:   hpic(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></>),
  hotseat:        hpic(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>),
  darewheel:      hpic(<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></>),
  wordwolf:       hpic(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>),
  categoryblitz:  hpic(<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>),
  roastbattle:    hpic(<><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></>),
  wishwall:       hpic(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>),
  moodmeter:      hpic(<><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>),
  secretmsg:      hpic(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>),
  lovenotes:      hpic(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>),
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
const btn = (color = "#C47A2E") => ({ padding: "12px 20px", borderRadius: 9, border: "none", background: color, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, width: "100%" });
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
            <button onClick={next} style={{ ...btn("#C47A2E"), flex: 1 }}>Next Card</button>
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
            <button onClick={addPlayer} style={{ ...btn("#C47A2E"), width: "auto", padding: "10px 16px" }}>Add</button>
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
          <button key={side} onClick={() => setPick(side)} style={{ display: "block", width: "100%", marginBottom: 10, padding: "20px 16px", borderRadius: 14, border: `2px solid ${pick === side ? "#C47A2E" : "rgba(255,255,255,0.15)"}`, background: pick === side ? "rgba(196,122,46,0.25)" : "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, fontFamily: font, cursor: "pointer", textAlign: "left", lineHeight: 1.4 }}>
            {side === "a" ? "👈 " : "👉 "}{pair[side]}
          </button>
        ))}
      </div>
      {pick && <div style={{ textAlign: "center", color: "#CCAB4A", fontSize: 14, marginBottom: 14 }}>You chose {pick === "a" ? `"${pair.a}"` : `"${pair.b}"`} — defend your answer!</div>}
      <button onClick={next} style={btn("#C47A2E")}>Next Question</button>
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
      <button onClick={next} style={btn("#C47A2E")}>Next Take</button>
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
        <button onClick={addP} style={{ ...btn("#C47A2E"), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {players.map(p => (
          <span key={p} style={{ background: "rgba(196,122,46,0.2)", border: "1px solid rgba(196,122,46,0.4)", color: "#E5C97A", padding: "5px 12px", borderRadius: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            {p} <span onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ cursor: "pointer", opacity: 0.6 }}>✕</span>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", width: 180, height: 180 }}>
          <div style={{ width: 180, height: 180, borderRadius: "50%", border: "4px solid rgba(196,122,46,0.5)", background: "rgba(196,122,46,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 4, height: 80, background: "linear-gradient(to top, #C47A2E, #E5C97A)", borderRadius: 4, transformOrigin: "50% 100%", transform: `rotate(${angle}deg)`, transition: spinning ? "transform 3s cubic-bezier(0.17,0.67,0.12,0.99)" : "none", position: "absolute", bottom: "50%", left: "calc(50% - 2px)" }} />
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#C47A2E", zIndex: 2, position: "relative" }} />
          </div>
        </div>
      </div>
      {result && !spinning && <div style={{ textAlign: "center", fontSize: 22, fontWeight: 800, color: "#E5C97A", marginBottom: 16 }}>🎯 {result}!</div>}
      <button onClick={spin} disabled={players.length < 2 || spinning} style={{ ...btn("#C47A2E"), opacity: players.length < 2 ? 0.5 : 1 }}>
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
          <button key={k} onClick={() => pick(k)} style={{ ...btn("rgba(196,122,46,0.3)"), border: "1.5px solid rgba(196,122,46,0.5)", textAlign: "left", padding: "14px 16px", fontSize: 15 }}>{v}</button>
        ))}
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} emoji="🎭" title="Dumb Charades">
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#CCAB4A", marginBottom: 16 }}>{cats[cat]}</div>
        <div style={{ background: "rgba(196,122,46,0.15)", border: "2px solid rgba(196,122,46,0.4)", borderRadius: 20, padding: "32px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{word}</div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: timer > 10 ? "#34D399" : "#F87171", marginBottom: 16 }}>{timer}s</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={next} style={{ ...btn("#C47A2E"), flex: 1 }}>Next Word</button>
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
          <div key={i} onClick={() => toggle(i)} style={{ aspectRatio: "1", background: marked[i] ? "rgba(196,122,46,0.5)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${marked[i] ? "#C47A2E" : "rgba(255,255,255,0.12)"}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: 4, cursor: i === 12 ? "default" : "pointer", transition: "all 0.15s" }}>
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
  const SK = 'tendr-hp-checklist-v2';
  const [savedItems, setSavedItems] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || 'null'); } catch { return null; } });
  const [newItem, setNewItem] = useState({ name: '', cat: 'decor', person: '' });

  const TEMPLATES = {
    houseparty: { label: '🏠 House Party', items: [
      { cat:'decor', name:'Balloons' }, { cat:'decor', name:'Fairy lights / LED strips' }, { cat:'decor', name:'Streamers & banners' },
      { cat:'food', name:'Chips & namkeen' }, { cat:'food', name:'Pizza / party food' }, { cat:'food', name:'Cake or dessert' },
      { cat:'drinks', name:'Cold drinks & soft drinks' }, { cat:'drinks', name:'Water bottles' }, { cat:'drinks', name:'Juices' },
      { cat:'entertainment', name:'Bluetooth speaker' }, { cat:'entertainment', name:'Party playlist ready' },
      { cat:'logistics', name:'Disposable plates & cups' }, { cat:'logistics', name:'Napkins & cutlery' }, { cat:'logistics', name:'Garbage bags' }, { cat:'logistics', name:'Extra phone chargers' },
    ]},
    birthday: { label: '🎂 Birthday Party', items: [
      { cat:'decor', name:'Birthday banner' }, { cat:'decor', name:'Number balloons' }, { cat:'decor', name:'Table centrepieces' },
      { cat:'food', name:'Birthday cake' }, { cat:'food', name:'Finger food & snacks' },
      { cat:'drinks', name:'Birthday-themed drinks' },
      { cat:'entertainment', name:'Party games planned' }, { cat:'entertainment', name:'Music playlist' },
      { cat:'logistics', name:'Candles & lighter' }, { cat:'logistics', name:'Plates, cups & napkins' }, { cat:'logistics', name:'Return gifts' },
    ]},
    dinner: { label: '🍽️ Dinner Party', items: [
      { cat:'decor', name:'Table setting & centrepiece' }, { cat:'decor', name:'Candles' },
      { cat:'food', name:'Starters / appetisers' }, { cat:'food', name:'Main course' }, { cat:'food', name:'Dessert' },
      { cat:'drinks', name:'Wine / drinks' }, { cat:'drinks', name:'Water & juices' },
      { cat:'logistics', name:'Proper crockery & cutlery' }, { cat:'logistics', name:'Serving dishes' }, { cat:'logistics', name:'Napkins' },
    ]},
    kitty: { label: '🌸 Kitty Party', items: [
      { cat:'decor', name:'Theme decorations' }, { cat:'decor', name:'Photo booth corner' },
      { cat:'food', name:'Snacks & chaats' }, { cat:'food', name:'Mithai / sweets' },
      { cat:'drinks', name:'Mocktails / drinks station' },
      { cat:'entertainment', name:'Tambola (Housie) set' }, { cat:'entertainment', name:'Return gifts' },
      { cat:'logistics', name:'Kitty money collection' }, { cat:'logistics', name:'Prize bags' },
    ]},
  };

  const CATS = [
    { id:'decor', label:'🎀 Decor', color:'#DB2777' },
    { id:'food', label:'🍲 Food', color:'#f97316' },
    { id:'drinks', label:'🥂 Drinks', color:'#06b6d4' },
    { id:'entertainment', label:'🎮 Entertainment', color:'#C47A2E' },
    { id:'logistics', label:'📦 Logistics', color:'#6b7280' },
  ];

  const loadTemplate = (key) => {
    const items = TEMPLATES[key].items.map((it, i) => ({ id: Date.now()+i, ...it, person: '', done: false }));
    setSavedItems(items);
    try { localStorage.setItem(SK, JSON.stringify(items)); } catch {}
  };

  const persist = (items) => { setSavedItems(items); try { localStorage.setItem(SK, JSON.stringify(items)); } catch {} };
  const toggleDone = (id) => persist(savedItems.map(it => it.id === id ? { ...it, done: !it.done } : it));
  const updatePerson = (id, person) => persist(savedItems.map(it => it.id === id ? { ...it, person } : it));
  const addItem = () => {
    if (!newItem.name.trim()) return;
    persist([...(savedItems||[]), { id: Date.now(), name: newItem.name.trim(), cat: newItem.cat, person: newItem.person, done: false }]);
    setNewItem(p => ({ ...p, name: '', person: '' }));
  };

  const done = savedItems?.filter(it=>it.done).length || 0;
  const total = savedItems?.length || 0;

  if (!savedItems) return (
    <Modal onClose={onClose} emoji="📋" title="Party Checklist">
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:18, textAlign:'center' }}>Pick a template to get started instantly</div>
      {Object.entries(TEMPLATES).map(([key, tpl]) => (
        <button key={key} onClick={() => loadTemplate(key)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'14px 18px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font, marginBottom:10 }}>
          <span>{tpl.label}</span><span style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{tpl.items.length} items →</span>
        </button>
      ))}
      <button onClick={() => persist([])} style={{ width:'100%', background:'transparent', border:'1px dashed rgba(255,255,255,0.15)', borderRadius:10, padding:'11px', color:'rgba(255,255,255,0.35)', fontSize:13, cursor:'pointer', fontFamily:font, marginTop:4 }}>Start blank →</button>
    </Modal>
  );

  return (
    <Modal onClose={onClose} emoji="📋" title="Party Checklist" wide>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.45)' }}>Progress</span>
          <span style={{ fontSize:12, fontWeight:700, color:'#22c55e' }}>{done} / {total} done</span>
        </div>
        <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${total?done/total*100:0}%`, background:'linear-gradient(90deg,#22c55e,#16a34a)', borderRadius:3, transition:'width 0.3s' }} />
        </div>
      </div>

      {CATS.map(cat => {
        const catItems = savedItems.filter(it => it.cat === cat.id);
        if (!catItems.length) return null;
        return (
          <div key={cat.id} style={{ marginBottom:16 }}>
            <div style={{ fontSize:10.5, fontWeight:800, color:cat.color, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>{cat.label} ({catItems.length})</div>
            {catItems.map(it => (
              <div key={it.id} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px', background: it.done?'rgba(34,197,94,0.06)':'rgba(255,255,255,0.04)', borderRadius:10, marginBottom:5, border:`1px solid ${it.done?'rgba(34,197,94,0.15)':'rgba(255,255,255,0.05)'}` }}>
                <button onClick={() => toggleDone(it.id)} style={{ width:20, height:20, borderRadius:6, border:`2px solid ${it.done?cat.color:'rgba(255,255,255,0.2)'}`, background:it.done?cat.color+'28':'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {it.done && <span style={{ color:cat.color, fontSize:11, fontWeight:900 }}>✓</span>}
                </button>
                <span style={{ flex:1, fontSize:13.5, color:it.done?'rgba(255,255,255,0.3)':'#fff', textDecoration:it.done?'line-through':'none', fontFamily:font }}>{it.name}</span>
                <input value={it.person} onChange={e => updatePerson(it.id, e.target.value)} placeholder="Who?" style={{ width:72, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'4px 8px', color:'rgba(255,255,255,0.6)', fontSize:11, fontFamily:font, outline:'none', textAlign:'center' }} />
                <button onClick={() => persist(savedItems.filter(x=>x.id!==it.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.15)', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 2px' }}>×</button>
              </div>
            ))}
          </div>
        );
      })}
      {savedItems.length === 0 && <div style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:13, padding:'20px 0' }}>Your checklist is empty — add items below!</div>}

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:14, marginTop:4 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setNewItem(p=>({...p,cat:c.id}))} style={{ fontSize:10.5, padding:'4px 9px', borderRadius:100, border:`1.5px solid ${newItem.cat===c.id?c.color:'rgba(255,255,255,0.1)'}`, background:newItem.cat===c.id?c.color+'22':'transparent', color:newItem.cat===c.id?c.color:'rgba(255,255,255,0.35)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>{c.label}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input value={newItem.name} onChange={e => setNewItem(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addItem()} placeholder="Add item…" style={{ flex:2, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 12px', color:'#fff', fontSize:13, fontFamily:font, outline:'none' }} />
          <input value={newItem.person} onChange={e => setNewItem(p=>({...p,person:e.target.value}))} placeholder="Who?" style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 10px', color:'#fff', fontSize:12, fontFamily:font, outline:'none' }} />
          <button onClick={addItem} style={{ background:'#C47A2E', border:'none', borderRadius:9, padding:'9px 14px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font }}>+</button>
        </div>
      </div>
      <button onClick={() => { setSavedItems(null); try { localStorage.removeItem(SK); } catch {} }} style={{ marginTop:12, width:'100%', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9, padding:'9px', color:'rgba(255,255,255,0.25)', fontSize:12, cursor:'pointer', fontFamily:font }}>Change template</button>
    </Modal>
  );
}

const BS_COLORS = ["#C47A2E","#DC2626","#059669","#D97706","#2563EB","#DB2777","#0891B2","#65A30D","#9333EA","#B45309"];
const BS_CATS = [
  { id:"food",     emoji:"🍕", label:"Food"      },
  { id:"drinks",   emoji:"🍺", label:"Drinks"    },
  { id:"transport",emoji:"🚗", label:"Transport" },
  { id:"fun",      emoji:"🎮", label:"Fun"       },
  { id:"shop",     emoji:"🛒", label:"Shopping"  },
  { id:"stay",     emoji:"🏠", label:"Stay"      },
  { id:"other",    emoji:"📦", label:"Other"     },
];

function BillSplitter({ onClose }) {
  const [people, setPeople]     = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settled, setSettled]   = useState(new Set());
  const [tab, setTab]           = useState("expenses");
  const [newName, setNewName]   = useState("");
  const [showForm, setShowForm] = useState(false);

  // expense form
  const [fDesc, setFDesc]               = useState("");
  const [fAmount, setFAmount]           = useState("");
  const [fCat, setFCat]                 = useState("food");
  const [fPaidBy, setFPaidBy]           = useState("");
  const [fSplitAmong, setFSplitAmong]   = useState([]);
  const [fSplitType, setFSplitType]     = useState("equal");
  const [fCustom, setFCustom]           = useState({});

  const addPerson = () => {
    const name = newName.trim();
    if (!name || people.find(p => p.name === name)) return;
    const color = BS_COLORS[people.length % BS_COLORS.length];
    setPeople(prev => [...prev, { name, color }]);
    setNewName("");
  };

  const openForm = () => {
    setFDesc(""); setFAmount(""); setFCat("food");
    const first = people[0]?.name || "";
    setFPaidBy(first);
    setFSplitAmong(people.map(p => p.name));
    setFSplitType("equal"); setFCustom({});
    setShowForm(true);
  };

  const toggleSplit = (name) =>
    setFSplitAmong(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const addExpense = () => {
    if (!fPaidBy || !fAmount || isNaN(Number(fAmount)) || fSplitAmong.length === 0) return;
    const total = Number(fAmount);
    const splits = {};
    if (fSplitType === "equal") {
      const share = total / fSplitAmong.length;
      fSplitAmong.forEach(n => { splits[n] = share; });
    } else if (fSplitType === "amount") {
      fSplitAmong.forEach(n => { splits[n] = Number(fCustom[n] || 0); });
    } else {
      fSplitAmong.forEach(n => { splits[n] = total * Number(fCustom[n] || 0) / 100; });
    }
    setExpenses(prev => [...prev, { id: Date.now(), desc: fDesc || "Expense", cat: fCat, paidBy: fPaidBy, amount: total, splits }]);
    setShowForm(false);
  };

  const deleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  const colorOf = (name) => people.find(p => p.name === name)?.color || "#C47A2E";
  const catOf   = (id)   => BS_CATS.find(c => c.id === id) || BS_CATS[BS_CATS.length - 1];

  const calcBalances = () => {
    const bal = {};
    people.forEach(p => { bal[p.name] = 0; });
    expenses.forEach(exp => {
      bal[exp.paidBy] = (bal[exp.paidBy] || 0) + exp.amount;
      Object.entries(exp.splits).forEach(([n, amt]) => { bal[n] = (bal[n] || 0) - amt; });
    });
    return bal;
  };

  const calcSettlements = () => {
    const bal = calcBalances();
    const debtors   = Object.entries(bal).filter(([,v]) => v < -0.01).sort(([,a],[,b]) => a - b);
    const creditors = Object.entries(bal).filter(([,v]) => v > 0.01).sort(([,a],[,b]) => b - a);
    const dAmt = debtors.map(([,v])   => -v);
    const cAmt = creditors.map(([,v]) =>  v);
    const txns = [];
    let di = 0, ci = 0;
    while (di < debtors.length && ci < creditors.length) {
      const pay = Math.min(dAmt[di], cAmt[ci]);
      txns.push({ key: `${debtors[di][0]}-${creditors[ci][0]}-${pay}`, from: debtors[di][0], to: creditors[ci][0], amount: Math.round(pay) });
      dAmt[di] -= pay; cAmt[ci] -= pay;
      if (dAmt[di] < 0.01) di++;
      if (cAmt[ci] < 0.01) ci++;
    }
    return txns;
  };

  const balances    = calcBalances();
  const settlements = calcSettlements();
  const grandTotal  = expenses.reduce((s, e) => s + e.amount, 0);

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", background: tab === id ? "#C47A2E" : "rgba(255,255,255,0.07)", color: tab === id ? "#fff" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, letterSpacing: "0.03em" }}>{label}</button>
  );

  const Avatar = ({ name, size = 30 }) => (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colorOf(name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
      {name[0].toUpperCase()}
    </div>
  );

  return (
    <Modal onClose={onClose} emoji="💸" title="Bill Splitter" wide>

      {/* ── People row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {people.map(p => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.07)", borderRadius: 100, padding: "4px 12px 4px 4px" }}>
            <Avatar name={p.name} size={26} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{p.name}</span>
            <button onClick={() => setPeople(prev => prev.filter(x => x.name !== p.name))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addPerson()}
            placeholder="+ Add person"
            style={{ ...inp, width: 120, padding: "6px 10px", fontSize: 13 }}
          />
          {newName.trim() && (
            <button onClick={addPerson} style={{ ...btn("#C47A2E"), width: "auto", padding: "7px 14px", fontSize: 13 }}>Add</button>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      {expenses.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Total", value: `₹${grandTotal.toLocaleString()}` },
            { label: "Expenses", value: expenses.length },
            { label: "To settle", value: settlements.filter(t => !settled.has(t.key)).length },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {tabBtn("expenses", "Expenses")}
        {tabBtn("balances", "Balances")}
        {tabBtn("settle",   "Settle Up")}
      </div>

      {/* ── Expenses tab ── */}
      {tab === "expenses" && (
        <>
          {expenses.length === 0
            ? <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.35)", fontSize: 14 }}>No expenses yet — add one below</div>
            : expenses.map(exp => (
              <div key={exp.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{catOf(exp.cat).emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.desc}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: colorOf(exp.paidBy), display: "inline-block", flexShrink: 0 }} />
                    {exp.paidBy} paid · split {Object.keys(exp.splits).length > 1 ? `${Object.keys(exp.splits).length} ways` : "1 way"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, color: "#CCAB4A", fontSize: 15 }}>₹{exp.amount.toLocaleString()}</div>
                  <button onClick={() => deleteExpense(exp.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 12, padding: 0, marginTop: 2 }}>Delete</button>
                </div>
              </div>
            ))
          }

          {/* ── Add Expense Form ── */}
          {showForm && people.length >= 2 ? (
            <div style={{ background: "rgba(196,122,46,0.1)", border: "1.5px solid rgba(196,122,46,0.3)", borderRadius: 16, padding: "16px", marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#E5C97A", marginBottom: 12 }}>New Expense</div>

              {/* Category */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {BS_CATS.map(c => (
                  <button key={c.id} onClick={() => setFCat(c.id)} style={{ padding: "5px 10px", borderRadius: 20, border: `1.5px solid ${fCat === c.id ? "#C47A2E" : "rgba(255,255,255,0.12)"}`, background: fCat === c.id ? "rgba(196,122,46,0.3)" : "transparent", color: fCat === c.id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: font }}>
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>

              <input value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Description" style={{ ...inp, marginBottom: 8 }} />
              <input value={fAmount} onChange={e => setFAmount(e.target.value)} placeholder="Amount (₹)" type="number" style={{ ...inp, marginBottom: 8 }} />

              {/* Paid by */}
              <div style={{ marginBottom: 8 }}>
                <label style={label}>Paid by</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {people.map(p => (
                    <button key={p.name} onClick={() => setFPaidBy(p.name)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 5px", borderRadius: 100, border: `1.5px solid ${fPaidBy === p.name ? p.color : "rgba(255,255,255,0.15)"}`, background: fPaidBy === p.name ? `${p.color}30` : "transparent", cursor: "pointer", fontFamily: font }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>{p.name[0].toUpperCase()}</div>
                      <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Split among */}
              <div style={{ marginBottom: 8 }}>
                <label style={label}>Split among</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {people.map(p => (
                    <button key={p.name} onClick={() => toggleSplit(p.name)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px 5px 5px", borderRadius: 100, border: `1.5px solid ${fSplitAmong.includes(p.name) ? p.color : "rgba(255,255,255,0.12)"}`, background: fSplitAmong.includes(p.name) ? `${p.color}25` : "transparent", cursor: "pointer", fontFamily: font }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: fSplitAmong.includes(p.name) ? p.color : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>{fSplitAmong.includes(p.name) ? "✓" : p.name[0].toUpperCase()}</div>
                      <span style={{ fontSize: 12, color: "#fff" }}>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Split type */}
              <div style={{ marginBottom: 12 }}>
                <label style={label}>Split type</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["equal","Equally"],["amount","By amount"],["percent","By %"]].map(([id, lbl]) => (
                    <button key={id} onClick={() => setFSplitType(id)} style={{ flex: 1, padding: "7px 4px", borderRadius: 9, border: "none", background: fSplitType === id ? "#C47A2E" : "rgba(255,255,255,0.08)", color: fSplitType === id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>{lbl}</button>
                  ))}
                </div>
                {fSplitType !== "equal" && fSplitAmong.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                    {fSplitAmong.map(n => (
                      <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: colorOf(n), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{n[0].toUpperCase()}</div>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", flex: 1 }}>{n}</span>
                        <input value={fCustom[n] || ""} onChange={e => setFCustom(prev => ({ ...prev, [n]: e.target.value }))} placeholder={fSplitType === "percent" ? "%" : "₹"} type="number" style={{ ...inp, width: 80, padding: "6px 8px", fontSize: 13 }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowForm(false)} style={{ ...btn("rgba(255,255,255,0.08)"), flex: 0.5 }}>Cancel</button>
                <button onClick={addExpense} style={{ ...btn("#C47A2E"), flex: 1 }}>Add Expense</button>
              </div>
            </div>
          ) : (
            <button
              onClick={people.length < 2 ? undefined : openForm}
              style={{ ...btn(people.length < 2 ? "rgba(255,255,255,0.05)" : "#C47A2E"), marginTop: 8, opacity: people.length < 2 ? 0.5 : 1 }}
            >
              {people.length < 2 ? "Add at least 2 people first" : "+ Add Expense"}
            </button>
          )}
        </>
      )}

      {/* ── Balances tab ── */}
      {tab === "balances" && (
        <>
          {people.length === 0
            ? <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Add people to see balances</div>
            : people.map(p => {
              const bal = balances[p.name] || 0;
              const isPos = bal > 0.01;
              const isNeg = bal < -0.01;
              return (
                <div key={p.name} style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={p.name} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: isPos ? "#34D399" : isNeg ? "#F87171" : "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {isPos ? `gets back ₹${Math.round(bal).toLocaleString()}` : isNeg ? `owes ₹${Math.round(-bal).toLocaleString()}` : "settled up ✓"}
                    </div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: isPos ? "#34D399" : isNeg ? "#F87171" : "rgba(255,255,255,0.3)" }}>
                    {isPos ? "+" : ""}{Math.round(bal) === 0 ? "₹0" : `₹${Math.abs(Math.round(bal)).toLocaleString()}`}
                  </div>
                </div>
              );
            })
          }
        </>
      )}

      {/* ── Settle Up tab ── */}
      {tab === "settle" && (
        <>
          {settlements.length === 0
            ? <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div style={{ color: "#34D399", fontWeight: 700, fontSize: 15 }}>All settled up!</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>No payments needed</div>
              </div>
            : settlements.map(t => {
              const done = settled.has(t.key);
              return (
                <div key={t.key} style={{ ...card, display: "flex", alignItems: "center", gap: 10, opacity: done ? 0.45 : 1 }}>
                  <Avatar name={t.from} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "#fff" }}>
                      <b style={{ color: colorOf(t.from) }}>{t.from}</b>
                      <span style={{ color: "rgba(255,255,255,0.45)", margin: "0 6px" }}>pays</span>
                      <b style={{ color: colorOf(t.to) }}>{t.to}</b>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#FBBF24", marginTop: 2 }}>₹{t.amount.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => setSettled(prev => {
                      const s = new Set(prev);
                      done ? s.delete(t.key) : s.add(t.key);
                      return s;
                    })}
                    style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${done ? "#34D399" : "rgba(255,255,255,0.2)"}`, background: done ? "rgba(52,211,153,0.15)" : "transparent", color: done ? "#34D399" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0 }}
                  >
                    {done ? "✓ Done" : "Mark done"}
                  </button>
                </div>
              );
            })
          }
        </>
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
        <div key={t} onClick={() => vote(t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${myVote === t ? "#C47A2E" : "rgba(255,255,255,0.1)"}`, background: myVote === t ? "rgba(196,122,46,0.2)" : "rgba(255,255,255,0.04)", marginBottom: 8, cursor: "pointer" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontSize: 14 }}>{t}</div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${maxVotes ? ((votes[t] || 0) / maxVotes) * 100 : 0}%`, background: "#C47A2E", borderRadius: 4, transition: "width 0.3s" }} />
            </div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#CCAB4A", minWidth: 28, textAlign: "right" }}>{votes[t] || 0}</span>
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
      <button onClick={start} style={{ ...btn("#C47A2E"), marginBottom: 20 }}>Start Countdown</button>
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
      <button onClick={add} style={{ ...btn("#C47A2E"), marginBottom: 16 }}>Add Song</button>
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
                  <button key={n} onClick={() => setRatings(r => ({ ...r, [key]: n }))} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${ratings[key] >= n ? "#C47A2E" : "rgba(255,255,255,0.15)"}`, background: ratings[key] >= n ? "rgba(196,122,46,0.35)" : "rgba(255,255,255,0.05)", color: "#fff", fontSize: 16, cursor: "pointer" }}>
                    {n <= ratings[key] ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setDone(true)} disabled={Object.values(ratings).some(r => r === 0)} style={{ ...btn("#C47A2E"), opacity: Object.values(ratings).some(r => r === 0) ? 0.5 : 1 }}>Generate Report Card</button>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 80, fontWeight: 900, color: grade === "S+" ? "#FBBF24" : grade === "A" ? "#34D399" : "#CCAB4A" }}>{grade}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{verdict}</div>
          <div style={{ fontSize: 15, color: "#CCAB4A", marginBottom: 20 }}>{avg} / 5.0</div>
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
      <div style={{ background: "rgba(196,122,46,0.15)", border: "1.5px solid rgba(196,122,46,0.35)", borderRadius: 16, padding: "28px 20px", textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#CCAB4A", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>🎲 MOST LIKELY TO…</div>
        <div style={{ fontSize: 17, color: "#fff", lineHeight: 1.55 }}>{MOST_LIKELY_TO[idx]}</div>
      </div>
      {voted && (
        <div style={{ textAlign: "center", fontSize: 26, marginBottom: 14, color: "#FBBF24", fontWeight: 800 }}>
          👆 Everyone point now!
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setVoted(true)} style={{ ...btn("rgba(196,122,46,0.4)"), flex: 1 }}>👆 Point!</button>
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
          <button onClick={create} disabled={loading || !fields.every(f => !f.required || data[f.key]?.trim())} style={{ ...btn("#C47A2E"), marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating…" : `Create ${title}`}
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ color: "#34D399", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Link created!</div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px", wordBreak: "break-all", fontSize: 13, color: "#CCAB4A", marginBottom: 16 }}>{link}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => copyLink(link)} style={{ ...btn("rgba(255,255,255,0.1)"), flex: 1 }}>📋 Copy Link</button>
            <button onClick={() => navigate(link.replace(window.location.origin, ""))} style={{ ...btn("#C47A2E"), flex: 1 }}>Open →</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Polygon Layout (triangle for 3, square for 4, pentagon for 5 … octagon for 8) ──
function ToolGrid({ tools, onOpen }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
      {tools.map(t => (
        <button
          key={t.id}
          onClick={() => onOpen(t.id)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '14px 14px 13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 11, cursor: 'pointer', fontFamily: font, textAlign: 'left', WebkitTapHighlightColor: 'transparent', transition: 'background 0.15s, border-color 0.15s', boxSizing: 'border-box', width: '100%' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = `${t.color}44`; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
          onTouchEnd={e => { setTimeout(() => { if (e.currentTarget) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }, 150); }}
        >
          <div style={{ color: t.color, marginBottom: 9, lineHeight: 1 }}>{TOOL_ICONS[t.id] || hpic(<circle cx="12" cy="12" r="9"/>)}</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: 4 }}>{t.title}</div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{t.desc}</div>
        </button>
      ))}
    </div>
  );
}

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
  const R = size * 0.41;
  const nW = Math.max(60, Math.min(size * 0.24, 60 + (8 - n) * 4));
  const nH = nW * 1.12;

  const pts = tools.map((_, i) => {
    const a = ((i * 360) / n - 90) * (Math.PI / 180);
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });

  const innerLines = n % 2 === 0
    ? Array.from({ length: n / 2 }, (_, i) => [pts[i], pts[i + n / 2]])
    : pts.map(p => [{ x: cx, y: cy }, p]);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative', paddingBottom: '115%', maxWidth: 500, margin: '0 auto' }}>
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
          {innerLines.map(([a, b], i) => (
            <line key={`il${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(196,122,46,0.14)" strokeWidth="1" />
          ))}
          {Array.from({ length: n }, (_, i) => (
            <line key={`e${i}`} x1={pts[i].x} y1={pts[i].y} x2={pts[(i + 1) % n].x} y2={pts[(i + 1) % n].y} stroke="rgba(196,122,46,0.35)" strokeWidth="1.6" filter="url(#pg-glow-sm)" />
          ))}
          {pts.map((p, i) => (
            <circle key={`v${i}`} cx={p.x} cy={p.y} r={3.5} fill="rgba(196,122,46,0.7)" filter="url(#pg-glow-sm)" />
          ))}
          <circle cx={cx} cy={cy} r={5} fill="rgba(196,122,46,0.55)" filter="url(#pg-glow)" />
        </svg>

        {tools.map((t, i) => {
          const p = pts[i];
          return (
            <button
              key={t.id}
              onClick={() => onOpen(t.id)}
              style={{
                position: 'absolute',
                width: nW, height: nH,
                left: p.x - nW / 2, top: p.y - nH / 2,
                background: `radial-gradient(circle at 50% 30%, ${t.color}2a, rgba(14,10,4,0.92))`,
                border: `1.5px solid ${t.color}55`,
                borderRadius: 14, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '6px 4px', fontFamily: font,
                transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                boxSizing: 'border-box', WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 0 24px ${t.color}55`; e.currentTarget.style.borderColor = `${t.color}bb`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${t.color}55`; }}
            >
              <span style={{ color: t.color, display: 'flex', lineHeight: 1 }}>{TOOL_ICONS[t.id] || hpic(<circle cx="12" cy="12" r="9"/>, Math.max(18, nW * 0.27))}</span>
              <span style={{ fontSize: Math.max(10, nW * 0.12), fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2, padding: '0 3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.title}</span>
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
  // Plan Together (live collaborative)
  { id: "venuevote",  section: "together", emoji: "📍", title: "Venue Vote",       desc: "Host adds options · everyone votes live",           color: "#7C3AED", live: true },
  { id: "groupcheck", section: "together", emoji: "✅", title: "Group Checklist",  desc: "Add tasks · anyone ticks them off in real-time",    color: "#059669", live: true },
  { id: "kittyfund",  section: "together", emoji: "🐷", title: "Kitty Fund",       desc: "Everyone chips in · track who paid what",           color: "#C47A2E", live: true },
  // Manage
  { id: "potluck", section: "manage", emoji: "🥘", title: "Potluck Planner", desc: "Shareable link · claim items · no duplicates", color: "#059669" },
  { id: "invite", section: "manage", emoji: "📨", title: "Digital Invite & RSVP", desc: "One link · guests RSVP · live count", color: "#2563EB" },
  { id: "checklist", section: "manage", emoji: "📋", title: "Party Checklist", desc: "Enter guest count → auto buy list", color: "#D97706" },
  { id: "bills",        section: "manage", emoji: "💸", title: "Bill Splitter",    desc: "Enter spends → who owes whom",              color: "#DC2626" },
  { id: "guestlist",   section: "manage", emoji: "👥", title: "Guest List",      desc: "Track RSVPs · who's confirmed",              color: "#C47A2E" },
  { id: "menu",        section: "manage", emoji: "🍽️", title: "Menu Planner",    desc: "Plan food · drinks · who brings what",        color: "#059669" },
  { id: "seating",     section: "manage", emoji: "🪑", title: "Seating Chart",   desc: "Assign seats · manage tables",                color: "#0891B2" },
  { id: "daytimeline", section: "manage", emoji: "🗓️", title: "Party Timeline",  desc: "Schedule the day · minute by minute",         color: "#D97706" },
  { id: "venue",       section: "manage", emoji: "📍", title: "Venue Notes",     desc: "Address · parking · contacts · notes",        color: "#DC2626" },
  { id: "budget",      section: "manage", emoji: "💰", title: "Budget Planner",  desc: "Set budget · track spend by category",        color: "#16A34A" },
  { id: "vendors",     section: "manage", emoji: "🗂️", title: "Vendor Tracker",  desc: "Caterer · DJ · deposit · balance due",        color: "#F59E0B" },
  { id: "wabroadcast", section: "manage", emoji: "📣", title: "WA Broadcasts",   desc: "Save the date · reminder · thank you",        color: "#25D366" },
  // Fun
  { id: "theme", section: "fun", emoji: "🎨", title: "Theme Picker", desc: "Vote as a group on party theme", color: "#C47A2E" },
  { id: "photowall", section: "fun", emoji: "📸", title: "Photo Wall", desc: "Shared album · everyone uploads", color: "#DB2777" },
  { id: "countdown", section: "fun", emoji: "⏱️", title: "Countdown Timer", desc: "Visual countdown to party time", color: "#0891B2" },
  { id: "playlist", section: "fun", emoji: "🎵", title: "Playlist Builder", desc: "Everyone adds 2 songs", color: "#059669" },
  { id: "wishwall", section: "fun", emoji: "⭐", title: "Wish Wall", desc: "Everyone adds wishes · react together", color: "#F59E0B", live: true },
  { id: "moodmeter", section: "fun", emoji: "💫", title: "Mood Meter", desc: "Check the room's collective vibe", color: "#EC4899", live: true },
  { id: "secretmsg", section: "fun", emoji: "🤫", title: "Secret Messages", desc: "Anonymous notes for anyone in the room", color: "#1A7A8A", live: true },
  { id: "lovenotes", section: "fun", emoji: "💌", title: "Love Notes Wall", desc: "Leave sweet notes for your crew", color: "#F43F5E", live: true },
  // Games
  { id: "truthordare", section: "games", emoji: "🎯", title: "Truth or Dare", desc: "Indian youth decks — 25 truths + 25 dares", color: "#DC2626" },
  { id: "neverhavei", section: "games", emoji: "🙅", title: "Never Have I Ever", desc: "30 statements · score tracker", color: "#059669" },
  { id: "wouldyou", section: "games", emoji: "🤷", title: "Would You Rather", desc: "20 spicy choices — defend your answer", color: "#C47A2E" },
  { id: "hottakes", section: "games", emoji: "🌶️", title: "Hot Takes", desc: "25 hot takes · agree or disagree", color: "#DC2626" },
  { id: "spin", section: "games", emoji: "🍾", title: "Spin the Bottle", desc: "Add names → random picker with spinner", color: "#2563EB" },
  { id: "charades", section: "games", emoji: "🎭", title: "Dumb Charades", desc: "Bollywood · Web Shows · Celebs · Memes", color: "#D97706" },
  { id: "bingo", section: "games", emoji: "🎱", title: "Party Bingo", desc: "5×5 party scenario bingo cards", color: "#0891B2" },
  { id: "mostlikelyto",  section: "games", emoji: "🎲", title: "Most Likely To",      desc: "Point at whoever fits — most fingers wins",      color: "#D4631A" },
  { id: "twotruthslie", section: "games", emoji: "🤥", title: "Two Truths One Lie",  desc: "Spot the lie · everyone submits · vote as a group", color: "#1A7A8A" },
  { id: "hotseat",      section: "games", emoji: "🔥", title: "Hot Seat",            desc: "One player · rapid-fire questions · 60 seconds",    color: "#F43F5E" },
  { id: "darewheel",    section: "games", emoji: "🎡", title: "Dare Wheel",          desc: "Spin the wheel · land on someone · get a dare",     color: "#C85A2A" },
  { id: "wordwolf",     section: "games", emoji: "🐺", title: "Word Wolf",           desc: "One imposter gets a different word · find them",    color: "#10B981" },
  { id: "categoryblitz",section: "games", emoji: "⚡", title: "Category Blitz",      desc: "Name items in a category · go around · fail = out", color: "#F59E0B" },
  { id: "roastbattle",  section: "games", emoji: "🎤", title: "Roast Battle",        desc: "Two players · 30 sec each · audience votes",        color: "#EF4444" },
  // Other
  { id: "reportcard", section: "fun", emoji: "🏆", title: "Party Report Card", desc: "Rate the night · get a grade + verdict", color: "#FBBF24" },
];

const SECTIONS = [
  { id: "together", label: "Plan Together", subtitle: "Vote · track · chip in — all live" },
  { id: "manage",   label: "Manage",        subtitle: "Plan · track · coordinate" },
  { id: "games",    label: "Games",         subtitle: "Biggest reason to come back" },
  { id: "fun",      label: "Fun",           subtitle: "Theme · music · photos · countdown" },
];

// Manage tools guests can access (shareable/interactive ones); the rest are host-private
const GUEST_MANAGE_TOOLS = new Set(['potluck', 'invite', 'photowall', 'bills', 'menu', 'venuevote', 'groupcheck', 'kittyfund']);

// ── New game modals ───────────────────────────────────────────────────────────

function TwoTruthsLieGame({ onClose }) {
  const [phase, setPhase] = useState('setup'); // setup | collect | vote | reveal | scores
  const [players, setPlayers] = useState([]); // [{name, s:[str,str,str], lieIdx:0|1|2, shuffled:[0,1,2]}]
  const [nameInput, setNameInput] = useState('');
  const [stmts, setStmts] = useState(['', '', '']);
  const [lieIdx, setLieIdx] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0); // which player is being guessed
  const [votes, setVotes] = useState({}); // voterName->stmtIdx
  const [voterInput, setVoterInput] = useState('');
  const [scores, setScores] = useState({});
  const [votingFor, setVotingFor] = useState(null); // stmtIdx chosen by current voter

  const addPlayer = () => {
    if (!nameInput.trim() || stmts.some(s => !s.trim()) || lieIdx === null) return;
    const shuffled = [0, 1, 2].sort(() => Math.random() - 0.5);
    setPlayers(p => [...p, { name: nameInput.trim(), s: stmts, lieIdx, shuffled }]);
    setNameInput(''); setStmts(['', '', '']); setLieIdx(null);
  };

  const startVoting = () => { setPhase('vote'); setCurrentIdx(0); setVotes({}); };

  const submitVote = () => {
    if (votingFor === null || !voterInput.trim()) return;
    setVotes(v => ({ ...v, [voterInput.trim()]: votingFor }));
    setVoterInput(''); setVotingFor(null);
  };

  const reveal = () => {
    const cur = players[currentIdx];
    const newScores = { ...scores };
    Object.entries(votes).forEach(([voter, guessShuffledIdx]) => {
      const guessedOriginalIdx = cur.shuffled[guessShuffledIdx];
      if (guessedOriginalIdx === cur.lieIdx) {
        newScores[voter] = (newScores[voter] || 0) + 1;
      }
    });
    setScores(newScores);
    setPhase('reveal');
  };

  const next = () => {
    if (currentIdx + 1 >= players.length) { setPhase('scores'); return; }
    setCurrentIdx(i => i + 1); setVotes({}); setVoterInput(''); setVotingFor(null); setPhase('vote');
  };

  const cur = players[currentIdx];

  return (
    <Modal onClose={onClose} title="Two Truths One Lie" emoji="🤥" wide>
      {phase === 'setup' && (
        <>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.6 }}>
            Each player adds their name + 3 statements (2 truths, 1 lie). Others guess which is the lie.
          </div>
          {players.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {players.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>🤥</span>
                  <span style={{ fontSize: 14, color: '#fff', fontFamily: font, fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>ready</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '16px 14px', marginBottom: 16 }}>
            <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your name" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: font, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <button onClick={() => setLieIdx(i)} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${lieIdx === i ? '#EF4444' : 'rgba(255,255,255,0.2)'}`, background: lieIdx === i ? '#EF444422' : 'transparent', color: lieIdx === i ? '#EF4444' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>LIE</button>
                <input value={stmts[i]} onChange={e => setStmts(s => { const n = [...s]; n[i] = e.target.value; return n; })} placeholder={`Statement ${i + 1}`} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${lieIdx === i ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: font, outline: 'none' }} />
              </div>
            ))}
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>Mark which statement is the LIE before adding ↑</div>
            <button onClick={addPlayer} disabled={!nameInput.trim() || stmts.some(s => !s.trim()) || lieIdx === null} style={{ width: '100%', background: nameInput.trim() && stmts.every(s => s.trim()) && lieIdx !== null ? '#1A7A8A' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '11px 0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>+ Add Player</button>
          </div>
          <button onClick={startVoting} disabled={players.length < 2} style={{ width: '100%', background: players.length >= 2 ? 'linear-gradient(135deg,#1A7A8A,#C85A2A)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: players.length >= 2 ? 'pointer' : 'not-allowed', fontFamily: font }}>
            {players.length < 2 ? `Add ${2 - players.length} more player${players.length === 1 ? '' : 's'} to start` : `Start Game (${players.length} players) →`}
          </button>
        </>
      )}

      {phase === 'vote' && cur && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1A7A8A', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Player {currentIdx + 1} of {players.length}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: font }}>{cur.name}'s statements</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Which one is the LIE?</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {cur.shuffled.map((origIdx, si) => (
              <div key={si} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, color: '#fff', fontFamily: font, lineHeight: 1.5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginRight: 8 }}>{si + 1}.</span>
                {cur.s[origIdx]}
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Cast your vote</div>
            <input value={voterInput} onChange={e => setVoterInput(e.target.value)} placeholder="Your name" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 14, fontFamily: font, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => setVotingFor(n - 1)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `2px solid ${votingFor === n - 1 ? '#EF4444' : 'rgba(255,255,255,0.12)'}`, background: votingFor === n - 1 ? '#EF444422' : 'rgba(255,255,255,0.04)', color: votingFor === n - 1 ? '#EF4444' : 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>#{n}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submitVote} disabled={!voterInput.trim() || votingFor === null} style={{ flex: 1, background: voterInput.trim() && votingFor !== null ? '#1A7A8A' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '11px 0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>Submit Vote</button>
              <button onClick={reveal} disabled={Object.keys(votes).length === 0} style={{ flex: 1, background: Object.keys(votes).length > 0 ? '#F43F5E' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '11px 0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>Reveal ({Object.keys(votes).length} voted)</button>
            </div>
          </div>
        </>
      )}

      {phase === 'reveal' && cur && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🤥</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: font }}>{cur.name}'s LIE was:</div>
          </div>
          <div style={{ padding: '16px', background: '#EF444418', borderRadius: 14, border: '1.5px solid #EF444455', marginBottom: 20, fontSize: 15, color: '#fff', fontFamily: font, lineHeight: 1.5, textAlign: 'center' }}>
            "{cur.s[cur.lieIdx]}"
          </div>
          <div style={{ marginBottom: 20 }}>
            {Object.entries(votes).map(([voter, guessIdx]) => {
              const guessedOrigIdx = cur.shuffled[guessIdx];
              const correct = guessedOrigIdx === cur.lieIdx;
              return (
                <div key={voter} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: correct ? '#22c55e14' : '#EF444414', borderRadius: 10, marginBottom: 6, border: `1px solid ${correct ? '#22c55e30' : '#EF444430'}` }}>
                  <span style={{ fontSize: 16 }}>{correct ? '✅' : '❌'}</span>
                  <span style={{ flex: 1, fontSize: 14, color: '#fff', fontFamily: font, fontWeight: 600 }}>{voter}</span>
                  <span style={{ fontSize: 12, color: correct ? '#22c55e' : '#EF4444', fontWeight: 700 }}>{correct ? '+1 point' : 'fooled!'}</span>
                </div>
              );
            })}
          </div>
          <button onClick={next} style={{ width: '100%', background: 'linear-gradient(135deg,#1A7A8A,#C85A2A)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>
            {currentIdx + 1 >= players.length ? 'See Final Scores →' : `Next Player: ${players[currentIdx + 1]?.name} →`}
          </button>
        </>
      )}

      {phase === 'scores' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40 }}>🏆</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: font, marginTop: 8 }}>Final Scores</div>
          </div>
          {Object.entries(scores).sort(([, a], [, b]) => b - a).map(([name, score], i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: i === 0 ? 'linear-gradient(90deg,#1A7A8A20,rgba(255,255,255,0.03))' : 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 8, border: i === 0 ? '1px solid #1A7A8A40' : '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: 18, minWidth: 28 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <span style={{ flex: 1, fontSize: 15, color: '#fff', fontFamily: font, fontWeight: 700 }}>{name}</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? '#1A7A8A' : '#fff', fontFamily: font }}>{score}</span>
            </div>
          ))}
          {Object.keys(scores).length === 0 && <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, padding: 20 }}>No one guessed correctly. You're all expert liars! 🤥</div>}
          <button onClick={() => { setPhase('setup'); setPlayers([]); setScores({}); setCurrentIdx(0); }} style={{ width: '100%', marginTop: 16, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 12, padding: '12px 0', color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer', fontFamily: font }}>Play Again</button>
        </>
      )}
    </Modal>
  );
}

function HotSeatGame({ onClose }) {
  const [phase, setPhase] = useState('setup'); // setup | playing | done
  const [player, setPlayer] = useState('');
  const [qIdx, setQIdx] = useState(0);
  const [shuffled, setShuffled] = useState([]);
  const [timer, setTimer] = useState(60);
  const [answered, setAnswered] = useState(0);
  const [passed, setPassed] = useState(0);
  const timerRef = useRef(null);

  const start = () => {
    const qs = [...HOT_SEAT_QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffled(qs); setQIdx(0); setAnswered(0); setPassed(0); setTimer(60);
    setPhase('playing');
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); setPhase('done'); return 0; } return t - 1; });
    }, 1000);
  };

  const next = (answered_) => {
    if (answered_) setAnswered(a => a + 1); else setPassed(p => p + 1);
    setQIdx(i => i + 1);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const pct = timer / 60;
  const timerColor = timer > 30 ? '#22c55e' : timer > 10 ? '#f59e0b' : '#ef4444';

  return (
    <Modal onClose={onClose} title="Hot Seat" emoji="🔥">
      {phase === 'setup' && (
        <>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 1.7 }}>
            One player sits in the <strong style={{ color: '#F43F5E' }}>Hot Seat</strong>. The group fires rapid questions at them. 60 seconds. Answer or pass — no hiding.
          </div>
          <input value={player} onChange={e => setPlayer(e.target.value)} placeholder="Who's in the hot seat?" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 16, fontFamily: font, outline: 'none', boxSizing: 'border-box', marginBottom: 16, textAlign: 'center', fontWeight: 700 }} />
          <button onClick={start} disabled={!player.trim()} style={{ width: '100%', background: player.trim() ? 'linear-gradient(135deg,#F43F5E,#F97316)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, padding: '16px 0', color: '#fff', fontSize: 16, fontWeight: 800, cursor: player.trim() ? 'pointer' : 'not-allowed', fontFamily: font }}>
            Start the Clock 🔥
          </button>
        </>
      )}
      {phase === 'playing' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 12px' }}>
              <svg viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={timerColor} strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34 * pct} ${2 * Math.PI * 34 * (1 - pct)}`}
                  style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: timerColor, fontFamily: "'Outfit',sans-serif" }}>{timer}</div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{player} is in the hot seat</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px 18px', marginBottom: 20, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: font, textAlign: 'center', lineHeight: 1.5 }}>
              {shuffled[qIdx] || "That's all the questions!"}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => next(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 0', color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>Pass</button>
            <button onClick={() => next(true)} style={{ flex: 2, background: 'linear-gradient(135deg,#F43F5E,#F97316)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>Answered ✓</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>{answered}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>ANSWERED</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>{passed}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>PASSED</div></div>
          </div>
        </>
      )}
      {phase === 'done' && (
        <>
          <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: font }}>{player} survived!</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>60 seconds of pure pressure</div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ textAlign: 'center', background: '#22c55e18', border: '1px solid #22c55e30', borderRadius: 14, padding: '16px 24px' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#22c55e' }}>{answered}</div>
              <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Answered</div>
            </div>
            <div style={{ textAlign: 'center', background: '#f59e0b18', border: '1px solid #f59e0b30', borderRadius: 14, padding: '16px 24px' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b' }}>{passed}</div>
              <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Passed</div>
            </div>
          </div>
          <button onClick={() => { setPhase('setup'); setPlayer(''); }} style={{ width: '100%', background: 'linear-gradient(135deg,#F43F5E,#F97316)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>Next Player →</button>
        </>
      )}
    </Modal>
  );
}

function DareWheelGame({ onClose }) {
  const [players, setPlayers] = useState([]);
  const [input, setInput] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [landed, setLanded] = useState(null); // player name
  const [dare, setDare] = useState(null);
  const canvasRef = useRef(null);

  const addPlayer = () => { if (!input.trim() || players.includes(input.trim())) return; setPlayers(p => [...p, input.trim()]); setInput(''); setLanded(null); setDare(null); };
  const removePlayer = (p) => setPlayers(ps => ps.filter(x => x !== p));

  const spin = () => {
    if (players.length < 2 || spinning) return;
    setSpinning(true); setLanded(null); setDare(null);
    const extra = 360 * (5 + Math.floor(Math.random() * 5));
    const sliceAngle = 360 / players.length;
    const targetIdx = Math.floor(Math.random() * players.length);
    const targetAngle = extra + 360 - (targetIdx * sliceAngle + sliceAngle / 2);
    const newRotation = rotation + targetAngle;
    setRotation(newRotation);
    setTimeout(() => {
      setSpinning(false);
      setLanded(players[targetIdx]);
      setDare(DARES[Math.floor(Math.random() * DARES.length)]);
    }, 3500);
  };

  const n = players.length;
  const colors = ['#F43F5E', '#F97316', '#EAB308', '#22c55e', '#06b6d4', '#C85A2A', '#EC4899', '#14b8a6'];
  const size = 220;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;

  return (
    <Modal onClose={onClose} title="Dare Wheel" emoji="🎡">
      {n < 2 ? (
        <>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.6 }}>Add at least 2 players. Spin the wheel — whoever it lands on gets a dare.</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} placeholder="Player name" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: font, outline: 'none' }} />
            <button onClick={addPlayer} style={{ background: '#C85A2A', border: 'none', borderRadius: 10, padding: '10px 18px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>Add</button>
          </div>
          {players.map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 6 }}>
              <span style={{ flex: 1, fontSize: 14, color: '#fff', fontFamily: font }}>{p}</span>
              <button onClick={() => removePlayer(p)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
          ))}
          {players.length > 0 && <button onClick={() => setPlayers([])} style={{ width: '100%', marginTop: 8, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '10px', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: font }}>Clear all</button>}
        </>
      ) : (
        <>
          <div style={{ position: 'relative', width: size, height: size, margin: '0 auto 20px', userSelect: 'none' }}>
            <svg width={size} height={size} style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3.5s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none', display: 'block' }}>
              {players.map((p, i) => {
                const startAngle = (i * 360 / n - 90) * Math.PI / 180;
                const endAngle = ((i + 1) * 360 / n - 90) * Math.PI / 180;
                const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
                const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
                const midAngle = (startAngle + endAngle) / 2;
                const tx = cx + (r * 0.62) * Math.cos(midAngle), ty = cy + (r * 0.62) * Math.sin(midAngle);
                const largeArc = n === 1 ? 1 : 0;
                return (
                  <g key={p}>
                    <path d={`M${cx},${cy} L${x1},${y1} A${r},${r},0,${largeArc},1,${x2},${y2} Z`} fill={colors[i % colors.length]} opacity={0.85} />
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize={Math.max(9, Math.min(13, 100 / n))} fontWeight="800" fill="#fff" fontFamily="Outfit,sans-serif" transform={`rotate(${(i + 0.5) * 360 / n},${tx},${ty})`}>{p.length > 8 ? p.slice(0, 7) + '…' : p}</text>
                  </g>
                );
              })}
              <circle cx={cx} cy={cy} r={14} fill="#140e08" />
              <circle cx={cx} cy={cy} r={9} fill="#CCAB4A" />
            </svg>
            <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '18px solid #fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          </div>
          <button onClick={spin} disabled={spinning} style={{ width: '100%', marginBottom: 16, background: spinning ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#C85A2A,#1A7A8A)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: spinning ? 'not-allowed' : 'pointer', fontFamily: font }}>{spinning ? 'Spinning…' : '🎡 Spin the Wheel'}</button>
          {landed && dare && (
            <div style={{ background: '#C85A2A18', border: '1.5px solid #C85A2A55', borderRadius: 14, padding: '16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#C85A2A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>🎯 {landed} gets a dare</div>
              <div style={{ fontSize: 14, color: '#fff', fontFamily: font, lineHeight: 1.6 }}>{dare}</div>
            </div>
          )}
          <button onClick={() => { setPlayers([]); setLanded(null); setDare(null); setRotation(0); }} style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '10px', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: font }}>Change Players</button>
        </>
      )}
    </Modal>
  );
}

function WordWolfGame({ onClose }) {
  const [phase, setPhase] = useState('setup'); // setup | deal | discuss | vote | reveal
  const [players, setPlayers] = useState([]);
  const [input, setInput] = useState('');
  const [pair, setPair] = useState(null);
  const [wolves, setWolves] = useState([]); // indices who got minority word
  const [dealIdx, setDealIdx] = useState(0); // current player seeing their card
  const [showing, setShowing] = useState(false);
  const [votes, setVotes] = useState({});
  const [voterName, setVoterName] = useState('');
  const [votingFor, setVotingFor] = useState('');

  const addPlayer = () => { if (!input.trim() || players.includes(input.trim())) return; setPlayers(p => [...p, input.trim()]); setInput(''); };

  const startGame = () => {
    const p = WORD_WOLF_PAIRS[Math.floor(Math.random() * WORD_WOLF_PAIRS.length)];
    setPair(p);
    const wolfCount = players.length >= 6 ? 2 : 1;
    const shuffledIdxs = [...players.keys()].sort(() => Math.random() - 0.5);
    setWolves(shuffledIdxs.slice(0, wolfCount));
    setDealIdx(0); setShowing(false); setPhase('deal'); setVotes({});
  };

  const submitVote = () => {
    if (!voterName.trim() || !votingFor) return;
    setVotes(v => ({ ...v, [voterName.trim()]: votingFor }));
    setVoterName(''); setVotingFor('');
  };

  const wolfNames = wolves.map(i => players[i]);
  const voteResult = Object.values(votes).reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {});
  const mostVoted = Object.entries(voteResult).sort(([, a], [, b]) => b - a)[0]?.[0];
  const caught = mostVoted && wolfNames.includes(mostVoted);

  return (
    <Modal onClose={onClose} title="Word Wolf" emoji="🐺">
      {phase === 'setup' && (
        <>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.7 }}>
            Everyone gets a <strong style={{ color: '#10B981' }}>secret word</strong>. One person (the Wolf 🐺) gets a <em>similar but different</em> word. Describe your word naturally. Find the Wolf before they find out they're different.
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} placeholder="Add player" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: font, outline: 'none' }} />
            <button onClick={addPlayer} style={{ background: '#10B981', border: 'none', borderRadius: 10, padding: '10px 18px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>Add</button>
          </div>
          {players.map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 6 }}>
              <span style={{ flex: 1, fontSize: 14, color: '#fff', fontFamily: font }}>{p}</span>
              <button onClick={() => setPlayers(ps => ps.filter(x => x !== p))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
          ))}
          <button onClick={startGame} disabled={players.length < 3} style={{ width: '100%', marginTop: 16, background: players.length >= 3 ? 'linear-gradient(135deg,#10B981,#06b6d4)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: players.length >= 3 ? 'pointer' : 'not-allowed', fontFamily: font }}>
            {players.length < 3 ? `Need ${3 - players.length} more player${players.length === 2 ? '' : 's'}` : `Deal Cards (${players.length} players) →`}
          </button>
        </>
      )}
      {phase === 'deal' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Pass phone to each player</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: font }}>{players[dealIdx]}, look at your word</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Don't show anyone else</div>
          </div>
          {!showing ? (
            <button onClick={() => setShowing(true)} style={{ width: '100%', background: 'linear-gradient(135deg,#10B981,#06b6d4)', border: 'none', borderRadius: 12, padding: '18px 0', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>Tap to see your word</button>
          ) : (
            <>
              <div style={{ background: '#10B98118', border: '2px solid #10B98155', borderRadius: 16, padding: '28px 20px', textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Your word is</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: font }}>
                  {wolves.includes(dealIdx) ? pair.minority : pair.majority}
                </div>
              </div>
              <button onClick={() => { setShowing(false); if (dealIdx + 1 >= players.length) { setPhase('discuss'); } else { setDealIdx(i => i + 1); } }} style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                {dealIdx + 1 >= players.length ? 'Start Discussion →' : `Done — pass to ${players[dealIdx + 1]}`}
              </button>
            </>
          )}
        </>
      )}
      {phase === 'discuss' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 40 }}>🐺</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: font, marginTop: 8 }}>Describe your word!</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.6 }}>Each player gives 1–2 clues. Don't say the word. Wolves — blend in!</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px', marginBottom: 20 }}>
            {players.map(p => <div key={p} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>👤 {p}</div>)}
          </div>
          <button onClick={() => setPhase('vote')} style={{ width: '100%', background: 'linear-gradient(135deg,#F43F5E,#C85A2A)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>Vote for the Wolf →</button>
        </>
      )}
      {phase === 'vote' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: font }}>Who is the Wolf? 🐺</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{Object.keys(votes).length} of {players.length} voted</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px', marginBottom: 16 }}>
            <input value={voterName} onChange={e => setVoterName(e.target.value)} placeholder="Your name" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 14, fontFamily: font, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {players.map(p => (
                <button key={p} onClick={() => setVotingFor(p)} style={{ padding: '8px 14px', borderRadius: 100, border: `1.5px solid ${votingFor === p ? '#F43F5E' : 'rgba(255,255,255,0.12)'}`, background: votingFor === p ? '#F43F5E22' : 'rgba(255,255,255,0.04)', color: votingFor === p ? '#F43F5E' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>{p}</button>
              ))}
            </div>
            <button onClick={submitVote} disabled={!voterName.trim() || !votingFor} style={{ width: '100%', background: voterName.trim() && votingFor ? '#F43F5E' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '11px 0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>Submit Vote</button>
          </div>
          <button onClick={() => setPhase('reveal')} style={{ width: '100%', background: 'linear-gradient(135deg,#F43F5E,#C85A2A)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>Reveal the Wolf →</button>
        </>
      )}
      {phase === 'reveal' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🐺</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: caught ? '#22c55e' : '#EF4444', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{caught ? 'Wolf caught!' : 'Wolf escaped!'}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: font, marginTop: 4 }}>{wolfNames.join(' & ')} was the Wolf</div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Majority word</div><div style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>{pair.majority}</div></div>
              <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.2)', alignSelf: 'center' }}>vs</div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Wolf's word</div><div style={{ fontSize: 18, fontWeight: 800, color: '#F43F5E' }}>{pair.minority}</div></div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '12px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Votes</div>
            {Object.entries(voteResult).sort(([, a], [, b]) => b - a).map(([name, count]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 14, color: wolfNames.includes(name) ? '#F43F5E' : '#fff', fontFamily: font, flex: 1, fontWeight: wolfNames.includes(name) ? 800 : 400 }}>{name} {wolfNames.includes(name) ? '🐺' : ''}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{count} vote{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setPhase('setup'); setPlayers([]); setPair(null); setWolves([]); setDealIdx(0); setVotes({}); }} style={{ width: '100%', background: 'linear-gradient(135deg,#10B981,#06b6d4)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>Play Again 🐺</button>
        </>
      )}
    </Modal>
  );
}

function CategoryBlitzGame({ onClose }) {
  const [phase, setPhase] = useState('pick'); // pick | playing | done
  const [cat, setCat] = useState(null);
  const [timer, setTimer] = useState(60);
  const [answers, setAnswers] = useState([]);
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const start = (c) => {
    setCat(c); setTimer(60); setAnswers([]); setInput(''); setOut('');
    setPhase('playing');
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); setPhase('done'); return 0; } return t - 1; });
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submit = () => {
    const val = input.trim();
    if (!val) return;
    setAnswers(a => [...a, val]);
    setInput('');
  };

  useEffect(() => () => clearInterval(timerRef.current), []);
  const timerColor = timer > 30 ? '#22c55e' : timer > 10 ? '#f59e0b' : '#ef4444';

  return (
    <Modal onClose={onClose} title="Category Blitz" emoji="⚡">
      {phase === 'pick' && (
        <>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.6 }}>
            Pick a category. Go around the group naming items. Can't think of one in time → you're out! Or just list everything you can in 60 seconds.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {CATEGORY_BLITZ.sort(() => Math.random() - 0.5).slice(0, 12).map(c => (
              <button key={c.name} onClick={() => start(c)} style={{ padding: '12px 10px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font, textAlign: 'left', lineHeight: 1.4 }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{c.emoji}</div>
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}
      {phase === 'playing' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.emoji}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: font, lineHeight: 1.4 }}>{cat.name}</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: timerColor, fontFamily: font, marginTop: 8 }}>{timer}s</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Type an answer…" style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: `1.5px solid ${timerColor}44`, borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 15, fontFamily: font, outline: 'none' }} />
            <button onClick={submit} style={{ background: timerColor, border: 'none', borderRadius: 10, padding: '12px 16px', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 18 }}>✓</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 60 }}>
            {answers.map((a, i) => (
              <span key={i} style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', background: '#22c55e14', border: '1px solid #22c55e30', borderRadius: 100, padding: '4px 12px' }}>{a}</span>
            ))}
          </div>
        </>
      )}
      {phase === 'done' && (
        <>
          <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⏱️</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: font }}>{answers.length} answers!</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Category: {cat.name}</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {answers.map((a, i) => <span key={i} style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', background: '#F59E0B14', border: '1px solid #F59E0B30', borderRadius: 100, padding: '6px 14px' }}>{a}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => start(cat)} style={{ flex: 1, background: 'linear-gradient(135deg,#F59E0B,#F97316)', border: 'none', borderRadius: 12, padding: '13px 0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>Same category</button>
            <button onClick={() => setPhase('pick')} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 12, padding: '13px 0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>New category</button>
          </div>
        </>
      )}
    </Modal>
  );
}

function RoastBattleGame({ onClose }) {
  const [players, setPlayers] = useState(['', '']);
  const [phase, setPhase] = useState('setup'); // setup | roast | vote | scores
  const [promptIdx, setPromptIdx] = useState(0);
  const [roasterIdx, setRoasterIdx] = useState(0); // 0 or 1
  const [timer, setTimer] = useState(30);
  const [scores, setScores] = useState([0, 0]);
  const [round, setRound] = useState(1);
  const [prompts, setPrompts] = useState([]);
  const timerRef = useRef(null);

  const start = () => {
    const shuffled = [...ROAST_PROMPTS].sort(() => Math.random() - 0.5);
    setPrompts(shuffled); setPromptIdx(0); setRoasterIdx(0); setTimer(30); setScores([0, 0]); setRound(1);
    setPhase('roast');
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); setPhase('vote'); return 0; } return t - 1; });
    }, 1000);
  };

  const startNextRoast = () => {
    setTimer(30); setPhase('roast');
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); setPhase('vote'); return 0; } return t - 1; });
    }, 1000);
  };

  const vote = (winnerIdx) => {
    const ns = [...scores]; ns[winnerIdx]++; setScores(ns);
    const nextRoaster = 1 - roasterIdx;
    const nextRound = round + 1;
    if (nextRound > 3) { setPhase('scores'); return; }
    setRound(nextRound); setPromptIdx(i => i + 1); setRoasterIdx(nextRoaster);
    startNextRoast();
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const currentPrompt = prompts[promptIdx]?.replace(/{A}/g, players[roasterIdx])?.replace(/{B}/g, players[1 - roasterIdx]);
  const timerColor = timer > 15 ? '#22c55e' : timer > 5 ? '#f59e0b' : '#ef4444';

  return (
    <Modal onClose={onClose} title="Roast Battle" emoji="🎤">
      {phase === 'setup' && (
        <>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 1.7 }}>
            Two players. A random roast prompt. 30 seconds each. The audience votes who roasted better. Best of 3 wins. Keep it playful — roast with love!
          </div>
          {[0, 1].map(i => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? '#F43F5E' : '#C85A2A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Player {i + 1}</div>
              <input value={players[i]} onChange={e => { const p = [...players]; p[i] = e.target.value; setPlayers(p); }} placeholder={`Player ${i + 1} name`} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${i === 0 ? 'rgba(244,63,94,0.3)' : 'rgba(139,92,246,0.3)'}`, borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 15, fontFamily: font, outline: 'none', boxSizing: 'border-box', fontWeight: 700 }} />
            </div>
          ))}
          <button onClick={start} disabled={!players[0].trim() || !players[1].trim()} style={{ width: '100%', marginTop: 8, background: players.every(p => p.trim()) ? 'linear-gradient(135deg,#F43F5E,#C85A2A)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, padding: '15px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>
            Let the Roast Begin 🎤
          </button>
        </>
      )}
      {phase === 'roast' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Round {round} of 3</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: roasterIdx === 0 ? '#F43F5E' : '#C85A2A', fontFamily: font }}>{players[roasterIdx]}'s turn to roast</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: timerColor, fontFamily: font, marginTop: 6 }}>{timer}s</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px 18px', marginBottom: 20, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: font, textAlign: 'center', lineHeight: 1.6 }}>{currentPrompt}</div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Audience vote happens when the timer ends</div>
        </>
      )}
      {phase === 'vote' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: font }}>Who roasted better?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Round {round} · Audience votes</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[0, 1].map(i => (
              <button key={i} onClick={() => vote(i)} style={{ flex: 1, padding: '20px 0', background: i === 0 ? '#F43F5E22' : '#C85A2A22', border: `2px solid ${i === 0 ? '#F43F5E66' : '#C85A2A66'}`, borderRadius: 16, cursor: 'pointer', fontFamily: font }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: i === 0 ? '#F43F5E' : '#C85A2A' }}>{players[i]}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{scores[i]} point{scores[i] !== 1 ? 's' : ''}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {phase === 'scores' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40 }}>🎤</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: font, marginTop: 8 }}>
              {scores[0] === scores[1] ? "It's a tie!" : `${players[scores[0] > scores[1] ? 0 : 1]} wins!`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {[0, 1].map(i => (
              <div key={i} style={{ flex: 1, textAlign: 'center', background: i === 0 ? '#F43F5E18' : '#C85A2A18', border: `1.5px solid ${i === 0 ? '#F43F5E40' : '#C85A2A40'}`, borderRadius: 14, padding: '20px 0' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: i === 0 ? '#F43F5E' : '#C85A2A' }}>{scores[i]}</div>
                <div style={{ fontSize: 14, color: '#fff', fontFamily: font, fontWeight: 700, marginTop: 4 }}>{players[i]}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { setPhase('setup'); setPlayers(['', '']); }} style={{ width: '100%', background: 'linear-gradient(135deg,#F43F5E,#C85A2A)', border: 'none', borderRadius: 12, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>New Battle 🎤</button>
        </>
      )}
    </Modal>
  );
}

// ── Coordination tool modals ──────────────────────────────────────────────────

function GuestListModal({ onClose }) {
  const SK = 'tendr-hp-guestlist';
  const [guests, setGuests] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } });
  const [form, setForm] = useState({ name:'', phone:'', plusOne:false, meal:'veg', rsvp:'pending' });
  const [showAdd, setShowAdd] = useState(false);
  const save = (g) => { setGuests(g); try { localStorage.setItem(SK, JSON.stringify(g)); } catch {} };

  const add = () => {
    if (!form.name.trim()) return;
    save([...guests, { id: Date.now(), ...form, name: form.name.trim() }]);
    setForm({ name:'', phone:'', plusOne:false, meal:'veg', rsvp:'pending' });
    setShowAdd(false);
  };
  const setRsvp = (id, rsvp) => save(guests.map(g => g.id === id ? { ...g, rsvp } : g));
  const counts = { yes: guests.filter(g=>g.rsvp==='yes').length, maybe: guests.filter(g=>g.rsvp==='maybe').length, no: guests.filter(g=>g.rsvp==='no').length, pending: guests.filter(g=>g.rsvp==='pending').length };
  const totalAttending = guests.filter(g=>g.rsvp==='yes').reduce((s,g)=>s+(g.plusOne?2:1), 0);
  const plusOneCount = guests.filter(g=>g.rsvp==='yes'&&g.plusOne).length;
  const pendingWithPhone = guests.filter(g=>g.rsvp==='pending'&&g.phone);

  const sendReminder = () => {
    if (!pendingWithPhone.length) return;
    const msg = encodeURIComponent("Hey! Just checking — are you coming to the party? Let us know! 🎉");
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

      {totalAttending > 0 && (
        <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:10, padding:'8px 14px', marginBottom:12, fontSize:13, color:'#22c55e', fontWeight:700 }}>
          🎉 {totalAttending} attending{plusOneCount>0?` (incl. ${plusOneCount} +1${plusOneCount!==1?'s':''})`:''}
        </div>
      )}

      {showAdd ? (
        <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:14, marginBottom:12, border:'1px solid rgba(255,255,255,0.1)' }}>
          <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Name *" style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:13.5, fontFamily:font, outline:'none', marginBottom:8 }} />
          <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="Phone (for WhatsApp)" type="tel" style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:13.5, fontFamily:font, outline:'none', marginBottom:10 }} />
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
            {[['🟢 Veg','veg'],['🔴 Non-Veg','nonveg'],['🟡 Jain','jain']].map(([lbl,val]) => (
              <button key={val} onClick={()=>setForm(p=>({...p,meal:val}))} style={{ fontSize:11, padding:'5px 10px', borderRadius:100, border:`1.5px solid ${form.meal===val?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.12)'}`, background:form.meal===val?'rgba(255,255,255,0.12)':'transparent', color:form.meal===val?'#fff':'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>{lbl}</button>
            ))}
            <button onClick={()=>setForm(p=>({...p,plusOne:!p.plusOne}))} style={{ fontSize:11, padding:'5px 10px', borderRadius:100, border:`1.5px solid ${form.plusOne?'#f59e0b':'rgba(255,255,255,0.12)'}`, background:form.plusOne?'rgba(245,158,11,0.15)':'transparent', color:form.plusOne?'#f59e0b':'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>+1 Guest</button>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={add} style={{ flex:1, background:'#C47A2E', border:'none', borderRadius:9, padding:'10px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>Add Guest</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'10px 16px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:font, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowAdd(true)} style={{ width:'100%', background:'rgba(196,122,46,0.12)', border:'1.5px dashed rgba(196,122,46,0.3)', borderRadius:10, padding:'11px', color:'#C47A2E', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, marginBottom:12 }}>+ Add Guest</button>
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
                    {g.plusOne && <span style={{ marginLeft:6, fontSize:10, fontWeight:700, color:'#f59e0b', background:'rgba(245,158,11,0.15)', padding:'2px 6px', borderRadius:100 }}>+1</span>}
                    {g.phone && waPhone && <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" style={{ display:'block', fontSize:10.5, color:'#25D366', fontWeight:700, textDecoration:'none', marginTop:2 }}>📱 {g.phone}</a>}
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
          📩 Send Reminder to {pendingWithPhone.length} Pending Guest{pendingWithPhone.length!==1?'s':''}
        </button>
      )}
    </Modal>
  );
}

function MenuPlannerModal({ onClose }) {
  const SK = 'tendr-hp-menu';
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } });
  const [name, setName] = useState('');
  const [cat, setCat] = useState('food');
  const [diet, setDiet] = useState('veg');
  const [person, setPerson] = useState('');
  const save = (it) => { setItems(it); try { localStorage.setItem(SK, JSON.stringify(it)); } catch {} };
  const add = () => {
    if (!name.trim()) return;
    save([...items, { id: Date.now(), name: name.trim(), cat, diet, person: person.trim(), status: 'pending', done: false }]);
    setName(''); setPerson('');
  };
  const toggle = (id) => save(items.map(it => it.id === id ? { ...it, done: !it.done } : it));
  const setStatus = (id, status) => save(items.map(it => it.id === id ? { ...it, status } : it));
  const cats = [
    { id:'food', label:'🍲 Food', color:'#f97316' },
    { id:'drinks', label:'🥂 Drinks', color:'#06b6d4' },
    { id:'dessert', label:'🍰 Dessert', color:'#ec4899' },
    { id:'other', label:'📦 Other', color:'#8b5cf6' },
  ];
  const STATUS_LABELS = { pending:'Pending', ordered:'Ordered', confirmed:'Confirmed', done:'Done' };
  const STATUS_COLORS = { pending:'#6b7280', ordered:'#f59e0b', confirmed:'#3b82f6', done:'#22c55e' };
  const arranged = items.filter(it=>it.status!=='pending').length;

  const shareMenu = () => {
    const lines = cats.map(c => {
      const ci = items.filter(it=>it.cat===c.id);
      if (!ci.length) return '';
      return `${c.label}:\n${ci.map(it=>`  • ${it.name}${it.person?' ('+it.person+')':''}${it.diet==='nonveg'?' 🔴':it.diet==='jain'?' 🟡':''}`).join('\n')}`;
    }).filter(Boolean).join('\n\n');
    window.open(`https://wa.me/?text=${encodeURIComponent('🍽️ Party Menu\n\n'+lines)}`, '_blank');
  };

  return (
    <Modal onClose={onClose} title="Menu Planner" emoji="🍽️" wide>
      <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center', flexWrap:'wrap' }}>
        {items.length>0 && <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{arranged}/{items.length} arranged</span>}
        {items.length>0 && <button onClick={shareMenu} style={{ marginLeft:'auto', padding:'6px 12px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:font }}>📤 Share Menu</button>}
      </div>

      <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'12px', marginBottom:16, border:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
          {cats.map(c => (
            <button key={c.id} onClick={()=>setCat(c.id)} style={{ fontSize:11, padding:'4px 10px', borderRadius:100, border:`1.5px solid ${cat===c.id?c.color:'rgba(255,255,255,0.1)'}`, background:cat===c.id?c.color+'22':'transparent', color:cat===c.id?c.color:'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>{c.label}</button>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
            {[['🟢','veg'],['🔴','nonveg'],['🟡','jain']].map(([emoji,val]) => (
              <button key={val} onClick={()=>setDiet(val)} style={{ fontSize:14, padding:'2px 6px', borderRadius:100, border:`1.5px solid ${diet===val?'rgba(255,255,255,0.45)':'rgba(255,255,255,0.1)'}`, background:diet===val?'rgba(255,255,255,0.1)':'transparent', cursor:'pointer' }}>{emoji}</button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Menu item name…" style={{ flex:2, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 12px', color:'#fff', fontSize:13, fontFamily:font, outline:'none' }} />
          <input value={person} onChange={e=>setPerson(e.target.value)} placeholder="Who brings?" style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 10px', color:'#fff', fontSize:12, fontFamily:font, outline:'none' }} />
          <button onClick={add} style={{ background:'#C47A2E', border:'none', borderRadius:9, padding:'9px 14px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font }}>+</button>
        </div>
      </div>

      {cats.map(c => {
        const catItems = items.filter(it=>it.cat===c.id);
        if (!catItems.length) return null;
        return (
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
        );
      })}
      {items.length===0 && <div style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:13, padding:'28px 0' }}>Pick a category and start adding menu items!</div>}
    </Modal>
  );
}

function DayTimelineModal({ onClose }) {
  const SK = 'tendr-hp-daytimeline';
  const [entries, setEntries] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } });
  const [time, setTime] = useState('');
  const [event, setEvent] = useState('');
  const [now, setNow] = useState(new Date());
  const [showTpl, setShowTpl] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const TEMPLATES = {
    houseparty: [
      { time:'18:00', event:'Setup & decoration', note:'Balloons, lights, music' },
      { time:'19:00', event:'First guests arrive', note:'Welcome drinks ready' },
      { time:'19:30', event:'Drinks & mingling', note:'' },
      { time:'20:30', event:'Dinner / food served', note:'' },
      { time:'21:30', event:'Games & activities', note:'' },
      { time:'22:30', event:'Cake cutting', note:'Candles & lighter!' },
      { time:'23:30', event:'Dancing / free time', note:'' },
      { time:'01:00', event:'Wrap up', note:'Arrange cabs for guests' },
    ],
    birthday: [
      { time:'17:30', event:'Venue setup', note:'Decor, balloons, photo corner' },
      { time:'18:00', event:'Guests arrive', note:'' },
      { time:'19:00', event:'Games & entertainment', note:'' },
      { time:'20:00', event:'Dinner', note:'' },
      { time:'21:00', event:'Cake ceremony', note:'Candles, song, photos' },
      { time:'21:30', event:'Return gifts', note:'Hand out to all guests' },
      { time:'22:30', event:'Wind down', note:'' },
    ],
    kitty: [
      { time:'11:00', event:'Guests arrive', note:'Tea & light snacks' },
      { time:'11:30', event:'Tambola / Housie round 1', note:'Prizes ready' },
      { time:'12:30', event:'Lunch served', note:'' },
      { time:'13:30', event:'Tambola / Housie round 2', note:'' },
      { time:'14:30', event:'Kitty collection & winner', note:'' },
      { time:'15:00', event:'Chai & dessert', note:'' },
      { time:'15:30', event:'Wind down', note:'' },
    ],
  };

  const saveEntries = (e) => { setEntries(e); try { localStorage.setItem(SK, JSON.stringify(e)); } catch {} };
  const loadTemplate = (key) => { saveEntries(TEMPLATES[key].map((it,i)=>({id:Date.now()+i,...it,done:false}))); setShowTpl(false); };
  const add = () => { if (!time||!event.trim()) return; saveEntries([...entries,{id:Date.now(),time,event:event.trim(),note:'',done:false}].sort((a,b)=>a.time.localeCompare(b.time))); setTime(''); setEvent(''); };
  const toggle = (id) => saveEntries(entries.map(e=>e.id===id?{...e,done:!e.done}:e));

  const nowStr = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  const currentIdx = entries.reduce((found,e,i)=>e.time<=nowStr?i:found, -1);
  const nextEntry = entries.find(e=>e.time>nowStr);
  let countdown = '';
  if (nextEntry) {
    const [nh,nm]=nextEntry.time.split(':').map(Number);
    const diff=nh*60+nm-now.getHours()*60-now.getMinutes();
    if (diff>0) countdown=diff>=60?`${Math.floor(diff/60)}h ${diff%60}m`:`${diff}m`;
  }

  const shareTimeline = () => {
    const txt = entries.map(e=>`${e.time} — ${e.event}${e.note?' ('+e.note+')':''}`).join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent('📅 Party Timeline:\n\n'+txt)}`, '_blank');
  };

  return (
    <Modal onClose={onClose} title="Party Timeline" emoji="🗓️">
      {entries.length>0 && countdown && (
        <div style={{ background:'rgba(196,122,46,0.1)', border:'1px solid rgba(196,122,46,0.25)', borderRadius:10, padding:'10px 14px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Next Up</div>
            <div style={{ fontSize:14, fontWeight:700, color:'#CCAB4A' }}>{nextEntry.event}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' }}>In</div>
            <div style={{ fontSize:20, fontWeight:900, color:'#CCAB4A' }}>{countdown}</div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginBottom:showTpl?0:14 }}>
        <button onClick={()=>setShowTpl(!showTpl)} style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:font }}>
          {showTpl?'↑ Hide':'📋 Templates'}
        </button>
        {entries.length>0 && <button onClick={shareTimeline} style={{ marginLeft:'auto', padding:'8px 14px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:font }}>Share Timeline</button>}
      </div>

      {showTpl && (
        <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'12px', marginBottom:14, border:'1px solid rgba(255,255,255,0.08)' }}>
          {[['houseparty','🏠 House Party',TEMPLATES.houseparty.length],['birthday','🎂 Birthday Party',TEMPLATES.birthday.length],['kitty','🌸 Kitty Party',TEMPLATES.kitty.length]].map(([key,lbl,count]) => (
            <button key={key} onClick={()=>loadTemplate(key)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'11px 14px', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:font, marginBottom:7 }}>
              <span>{lbl}</span><span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{count} slots →</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 10px', color:'#fff', fontSize:13.5, fontFamily:font, outline:'none', width:100, colorScheme:'dark', flexShrink:0 }} />
        <input value={event} onChange={e=>setEvent(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="What happens?" style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 12px', color:'#fff', fontSize:13.5, fontFamily:font, outline:'none' }} />
        <button onClick={add} disabled={!time||!event.trim()} style={{ background:time&&event.trim()?'#C47A2E':'rgba(255,255,255,0.06)', border:'none', borderRadius:9, padding:'9px 14px', color:'#fff', fontSize:18, fontWeight:700, cursor:'pointer', opacity:time&&event.trim()?1:0.4 }}>+</button>
      </div>

      {entries.length===0 ? (
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:13, padding:'28px 0' }}>Add time slots above or load a template!</div>
      ) : (
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left:44, top:0, bottom:0, width:2, background:'rgba(255,255,255,0.06)', zIndex:0 }} />
          {entries.map((e,i) => {
            const isNow = i===currentIdx && e.time<=nowStr;
            return (
              <div key={e.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'9px 0', position:'relative', zIndex:1 }}>
                <div style={{ minWidth:44, fontSize:11, fontWeight:800, color:isNow?'#CCAB4A':e.done?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.5)', textAlign:'right', paddingTop:3, flexShrink:0 }}>{e.time}</div>
                <button onClick={()=>toggle(e.id)} style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${e.done?'#22c55e':isNow?'#CCAB4A':'rgba(255,255,255,0.2)'}`, background:isNow?'#CCAB4A28':e.done?'#22c55e28':'#140e08', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', marginTop:2 }}>
                  {e.done && <span style={{ color:'#22c55e', fontSize:9, fontWeight:900 }}>✓</span>}
                </button>
                <div style={{ flex:1, paddingTop:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:14, color:e.done?'rgba(255,255,255,0.3)':'#fff', textDecoration:e.done?'line-through':'none', fontFamily:font, lineHeight:1.4 }}>{e.event}</span>
                    {isNow && <span style={{ fontSize:9, fontWeight:800, color:'#CCAB4A', background:'rgba(196,122,46,0.18)', padding:'2px 7px', borderRadius:100, textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>NOW</span>}
                  </div>
                  {e.note && <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{e.note}</div>}
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

function VenueNotesModal({ onClose }) {
  const SK = 'tendr-hp-venue';
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem(SK) || '{}'); } catch { return {}; } });
  const update = (key, val) => { const d = { ...data, [key]: val }; setData(d); try { localStorage.setItem(SK, JSON.stringify(d)); } catch {} };
  const fields = [
    { key:'address', label:'📍 Address', placeholder:'42, Sector 18, Noida, UP 201301', rows:2 },
    { key:'parking', label:'🅿️ Parking', placeholder:'Free parking in basement, enter from Gate B', rows:2 },
    { key:'contact', label:'📞 Venue Contact', placeholder:'+91 98765 43210', rows:1 },
    { key:'entry', label:'🚪 Entry Instructions', placeholder:'Take lift to 5th floor, Suite 502', rows:2 },
    { key:'notes', label:'📝 Notes', placeholder:'Decor setup from 5 PM · No outside food · Parking free till 11 PM', rows:3 },
  ];
  const filled = fields.filter(f=>data[f.key]).length;

  const openMaps = () => {
    if (!data.address) return;
    window.open(`https://maps.google.com/?q=${encodeURIComponent(data.address)}`, '_blank');
  };
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
              style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', color:'#fff', fontSize:13, fontFamily:font, outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.5, colorScheme:'dark' }}
            />
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {data.address && (
          <button onClick={openMaps} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid rgba(37,99,235,0.35)', background:'rgba(37,99,235,0.15)', color:'#60a5fa', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>
            🗺️ Open in Maps
          </button>
        )}
        <button onClick={shareWA} disabled={!filled} style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background:filled?'linear-gradient(135deg,#25D366,#128C7E)':'rgba(255,255,255,0.05)', color:filled?'#fff':'rgba(255,255,255,0.25)', fontSize:13, fontWeight:700, cursor:filled?'pointer':'default', fontFamily:font }}>
          📤 Share on WhatsApp
        </button>
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
    const lines = tables.map(t => {
      const seated = guests.filter(g=>g.table===t.id).map(g=>g.name);
      return `${t.name} (${seated.length}/${t.cap}):\n${seated.map(n=>'  • '+n).join('\n')||'  (empty)'}`;
    });
    if (unassigned.length) lines.push(`\nUnassigned (${unassigned.length}):\n${unassigned.map(g=>'  • '+g.name).join('\n')}`);
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
        <div style={{ background:'rgba(196,122,46,0.12)', border:'1px solid rgba(196,122,46,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:12, fontSize:13, color:'#CCAB4A', fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
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
            <button onClick={addTable} style={{ background:'#C47A2E', border:'none', borderRadius:8, padding:'7px 11px', color:'#fff', fontWeight:700, cursor:'pointer', fontFamily:font }}>+</button>
          </div>
          {tables.length===0 ? <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', textAlign:'center', padding:16 }}>Add tables above</div> : tables.map(t => {
            const seated = guests.filter(g=>g.table===t.id);
            const pct = t.cap ? seated.length/t.cap : 0;
            const full = seated.length>=t.cap;
            return (
              <div key={t.id} onClick={()=>selected&&!full&&assignToTable(t.id)}
                style={{ background:selected&&!full?'rgba(196,122,46,0.1)':'rgba(255,255,255,0.04)', borderRadius:12, padding:'10px 12px', marginBottom:8, border:`1.5px solid ${selected&&!full?'rgba(196,122,46,0.35)':full?'rgba(34,197,94,0.2)':'rgba(255,255,255,0.08)'}`, cursor:selected&&!full?'pointer':'default', transition:'all 0.15s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:full?'#22c55e':'#CCAB4A' }}>{t.name}</span>
                  <span style={{ fontSize:10.5, color:full?'#22c55e':'rgba(255,255,255,0.4)', fontWeight:700 }}>{seated.length}/{t.cap}</span>
                </div>
                <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.08)', overflow:'hidden', marginBottom:6 }}>
                  <div style={{ height:'100%', width:`${Math.min(pct*100,100)}%`, background:full?'#22c55e':'#C47A2E', borderRadius:2 }} />
                </div>
                {seated.length>0 ? (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {seated.map(g => (
                      <span key={g.id} onClick={e=>{e.stopPropagation();removeFromTable(g.id);}} title="Click to unassign" style={{ fontSize:10.5, color:'rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.08)', padding:'2px 7px', borderRadius:100, cursor:'pointer' }}>{g.name} ×</span>
                    ))}
                  </div>
                ) : <div style={{ fontSize:11, color:'rgba(255,255,255,0.18)', fontStyle:'italic' }}>Empty</div>}
              </div>
            );
          })}
        </div>

        <div>
          <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Guests</div>
          <div style={{ display:'flex', gap:5, marginBottom:10 }}>
            <input value={gName} onChange={e=>setGName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addGuest()} placeholder="Guest name" style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'7px 9px', color:'#fff', fontSize:12, fontFamily:font, outline:'none' }} />
            <button onClick={addGuest} style={{ background:'#C47A2E', border:'none', borderRadius:8, padding:'7px 11px', color:'#fff', fontWeight:700, cursor:'pointer', fontFamily:font }}>+</button>
          </div>
          {unassigned.length>0 && (
            <>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Unassigned ({unassigned.length})</div>
              {unassigned.map(g => (
                <div key={g.id} onClick={()=>setSelected(g.id===selected?null:g.id)} style={{ display:'flex', alignItems:'center', gap:7, background:selected===g.id?'rgba(196,122,46,0.15)':'rgba(255,255,255,0.04)', borderRadius:10, padding:'8px 10px', marginBottom:5, border:`1.5px solid ${selected===g.id?'rgba(196,122,46,0.4)':'rgba(255,255,255,0.06)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                  <span style={{ flex:1, fontSize:12.5, color:selected===g.id?'#CCAB4A':'#fff', fontFamily:font }}>{g.name}</span>
                  <span style={{ fontSize:9.5, color:selected===g.id?'#CCAB4A':'rgba(255,255,255,0.2)', fontWeight:700 }}>{selected===g.id?'→ TAP TABLE':'seat'}</span>
                  <button onClick={e=>{e.stopPropagation();saveG(guests.filter(x=>x.id!==g.id));}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:16, lineHeight:1, padding:'0 2px' }}>×</button>
                </div>
              ))}
            </>
          )}
          {guests.filter(g=>g.table).length>0 && (
            <>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(34,197,94,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'10px 0 6px' }}>Seated ({guests.filter(g=>g.table).length})</div>
              {guests.filter(g=>g.table).map(g => {
                const t = tables.find(t=>t.id===g.table);
                return (
                  <div key={g.id} style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(34,197,94,0.04)', borderRadius:10, padding:'7px 10px', marginBottom:4, border:'1px solid rgba(34,197,94,0.1)' }}>
                    <span style={{ flex:1, fontSize:12, color:'rgba(255,255,255,0.5)', fontFamily:font }}>{g.name}</span>
                    <span style={{ fontSize:10.5, color:'rgba(34,197,94,0.7)', fontWeight:700 }}>{t?.name}</span>
                    <button onClick={()=>removeFromTable(g.id)} title="Unassign" style={{ background:'none', border:'none', color:'rgba(255,255,255,0.15)', cursor:'pointer', fontSize:14, lineHeight:1 }}>↩</button>
                  </div>
                );
              })}
            </>
          )}
          {guests.length===0 && <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', textAlign:'center', padding:16 }}>Add guests above</div>}
        </div>
      </div>
    </Modal>
  );
}

// ── Budget Planner / Vendor Tracker / WA Broadcasts ─────────────────────────

function BudgetPlannerModal({ onClose }) {
  const SK = 'tendr-hp-budget';
  const gold = '#C47A2E', goldLt = '#CCAB4A';
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem(SK)||'{}'); } catch { return {}; } });
  const upd = (k,v) => { const d={...data,[k]:v}; setData(d); try { localStorage.setItem(SK,JSON.stringify(d)); } catch {} };
  const CATS = [
    {id:'venue',label:'🏠 Venue',color:'#3b82f6'},{id:'food',label:'🍽️ Food & Drinks',color:'#f97316'},
    {id:'decor',label:'🎨 Decor',color:'#8b5cf6'},{id:'entertainment',label:'🎵 Entertainment',color:'#ec4899'},{id:'other',label:'📦 Other',color:'#6b7280'},
  ];
  const total   = Number(data.total||0);
  const spent   = CATS.reduce((s,c)=>s+Number(data[`spent_${c.id}`]||0),0);
  const allocated = CATS.reduce((s,c)=>s+Number(data[`alloc_${c.id}`]||0),0);
  const overBudget = total>0&&spent>total;
  return (
    <Modal onClose={onClose} title="Budget Planner" emoji="💰" wide>
      <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:14, marginBottom:16, border:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Total Budget</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20, color:'rgba(255,255,255,0.35)', fontWeight:700 }}>₹</span>
          <input type="number" value={data.total||''} onChange={e=>upd('total',e.target.value)} placeholder="0" style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:30, fontWeight:900, color:goldLt, fontFamily:font }} />
        </div>
        {total>0&&<>
          <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden', margin:'12px 0 8px' }}>
            <div style={{ height:'100%', width:`${Math.min(spent/total*100,100)}%`, background:overBudget?'#ef4444':gold, borderRadius:3, transition:'width 0.3s' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:700 }}>
            <span style={{ color:'rgba(255,255,255,0.45)' }}>Spent ₹{spent.toLocaleString('en-IN')}</span>
            <span style={{ color:overBudget?'#ef4444':'#22c55e' }}>{overBudget?`⚠️ Over ₹${(spent-total).toLocaleString('en-IN')}`:`₹${(total-spent).toLocaleString('en-IN')} left`}</span>
          </div>
        </>}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {CATS.map(c=>{
          const alloc=Number(data[`alloc_${c.id}`]||0), act=Number(data[`spent_${c.id}`]||0);
          const pct=alloc>0?Math.min(act/alloc*100,100):0, over=alloc>0&&act>alloc;
          return (
            <div key={c.id} style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'12px 14px', border:`1px solid ${c.color}22` }}>
              <div style={{ fontSize:12, fontWeight:700, color:c.color, marginBottom:8 }}>{c.label}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['Budget',`alloc_${c.id}`,'rgba(255,255,255,0.5)'],['Spent',`spent_${c.id}`,over?'#ef4444':'#fff']].map(([lbl,key,color])=>(
                  <div key={key}>
                    <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{lbl}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,0.06)', borderRadius:8, padding:'7px 10px', border:over&&key.startsWith('spent')?'1px solid rgba(239,68,68,0.3)':'1px solid transparent' }}>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>₹</span>
                      <input type="number" value={data[key]||''} onChange={e=>upd(key,e.target.value)} placeholder="0" style={{ background:'transparent', border:'none', outline:'none', fontSize:15, fontWeight:700, color, fontFamily:font, width:'100%' }} />
                    </div>
                  </div>
                ))}
              </div>
              {alloc>0&&<>
                <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden', marginTop:8 }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:over?'#ef4444':c.color, borderRadius:2 }} />
                </div>
                <div style={{ fontSize:10, color:over?'#ef4444':'rgba(255,255,255,0.3)', marginTop:3, textAlign:'right', fontWeight:700 }}>{over?`Over ₹${(act-alloc).toLocaleString('en-IN')}`:`₹${(alloc-act).toLocaleString('en-IN')} free`}</div>
              </>}
            </div>
          );
        })}
      </div>
      {allocated>0&&total>0&&Math.abs(allocated-total)>1&&(
        <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:allocated>total?'rgba(239,68,68,0.08)':'rgba(245,158,11,0.08)', border:`1px solid ${allocated>total?'rgba(239,68,68,0.2)':'rgba(245,158,11,0.2)'}`, fontSize:12, color:allocated>total?'#ef4444':'#f59e0b', fontWeight:700 }}>
          {allocated>total?`⚠️ Allocations exceed budget by ₹${(allocated-total).toLocaleString('en-IN')}`:`ℹ️ ₹${(total-allocated).toLocaleString('en-IN')} unallocated`}
        </div>
      )}
    </Modal>
  );
}

function VendorTrackerModal({ onClose }) {
  const SK = 'tendr-hp-vendors';
  const gold = '#C47A2E';
  const [vendors, setVendors] = useState(() => { try { return JSON.parse(localStorage.getItem(SK)||'[]'); } catch { return []; } });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:'', cat:'Caterer', contact:'', total:'', deposit:'', status:'enquired', notes:'' });
  const CATS = ['Caterer','Decorator','Venue','DJ / Music','Photographer','Transport','Florist','Baker','MC / Host','Other'];
  const STATUS = { enquired:{label:'Enquired',color:'#6b7280'}, quoted:{label:'Quote Received',color:'#f59e0b'}, booked:{label:'Booked',color:'#3b82f6'}, confirmed:{label:'Confirmed',color:'#22c55e'}, cancelled:{label:'Cancelled',color:'#ef4444'} };
  const save = (v)=>{ setVendors(v); try { localStorage.setItem(SK,JSON.stringify(v)); } catch {} };
  const add = ()=>{ if(!form.name.trim()) return; save([...vendors,{id:Date.now(),...form,name:form.name.trim()}]); setForm({name:'',cat:'Caterer',contact:'',total:'',deposit:'',status:'enquired',notes:''}); setShowAdd(false); };
  const totalCost=vendors.reduce((s,v)=>s+Number(v.total||0),0);
  const totalPaid=vendors.reduce((s,v)=>s+Number(v.deposit||0),0);
  const totalBal=totalCost-totalPaid;
  return (
    <Modal onClose={onClose} title="Vendor Tracker" emoji="🗂️" wide>
      {vendors.length>0&&(
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
          {[['Total Cost',`₹${totalCost.toLocaleString('en-IN')}`,gold],['Paid',`₹${totalPaid.toLocaleString('en-IN')}`,'#22c55e'],['Balance Due',`₹${totalBal.toLocaleString('en-IN')}`,totalBal>0?'#f59e0b':'#22c55e']].map(([lbl,val,color])=>(
            <div key={lbl} style={{ textAlign:'center', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 6px', border:`1px solid ${color}30` }}>
              <div style={{ fontSize:15, fontWeight:800, color }}>{val}</div>
              <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      )}
      {showAdd?(
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
            <button onClick={add} style={{ flex:1, background:gold, border:'none', borderRadius:9, padding:'10px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>Add Vendor</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'10px 16px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:font, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      ):(
        <button onClick={()=>setShowAdd(true)} style={{ width:'100%', background:'rgba(196,122,46,0.12)', border:'1.5px dashed rgba(196,122,46,0.4)', borderRadius:10, padding:'11px', color:gold, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, marginBottom:14 }}>+ Add Vendor</button>
      )}
      {vendors.length===0?(
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:13, padding:'28px 0' }}>No vendors yet — add caterers, decorators, photographers…</div>
      ):(
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {vendors.map(v=>{
            const balance=Number(v.total||0)-Number(v.deposit||0);
            const st=STATUS[v.status]||STATUS.enquired;
            const ph=v.contact?.replace(/\D/g,'');
            const isPhone=ph&&ph.length>=10;
            return (
              <div key={v.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'12px 14px', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:15, fontWeight:700, color:'#fff', fontFamily:font }}>{v.name}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:gold, background:'rgba(196,122,46,0.15)', padding:'2px 8px', borderRadius:100 }}>{v.cat}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:st.color, background:`${st.color}22`, padding:'2px 8px', borderRadius:100 }}>{st.label}</span>
                    </div>
                    {v.contact&&(isPhone?<a href={`https://wa.me/${ph.startsWith('91')&&ph.length===12?ph:'91'+ph}`} target="_blank" rel="noreferrer" style={{ fontSize:11.5, color:'#25D366', textDecoration:'none', fontWeight:700, display:'block', marginTop:3 }}>📱 {v.contact}</a>:<div style={{ fontSize:11.5, color:'rgba(255,255,255,0.4)', marginTop:3 }}>{v.contact}</div>)}
                    {v.notes&&<div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:4, fontStyle:'italic' }}>{v.notes}</div>}
                  </div>
                  <button onClick={()=>save(vendors.filter(x=>x.id!==v.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:18, lineHeight:1 }}>×</button>
                </div>
                {(v.total||v.deposit)&&(
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

function WABroadcastModal({ onClose }) {
  const venueData = (() => { try { return JSON.parse(localStorage.getItem('tendr-hp-venue')||'{}'); } catch { return {}; } })();
  const addr    = venueData.address || '[ADD VENUE]';
  const parking = venueData.parking ? `\n🅿️ *Parking:* ${venueData.parking}` : '';
  const entry   = venueData.entry   ? `\n🚪 *Entry:* ${venueData.entry}`    : '';
  const contact = venueData.contact ? `\n📞 *Contact:* ${venueData.contact}` : '';
  const hasVenue = !!venueData.address;
  const PHASES = [
    { id:'savedate', label:'Save the Date', emoji:'📅',
      template:`🎉 *Save the Date!*\n\nWe're throwing a House Party and we'd love for you to join us!\n\n📅 *Date:* [ADD DATE]\n⏰ *Time:* [ADD TIME]\n📍 *Venue:* ${addr}\n\nMore details coming soon! 🥳` },
    { id:'reminder', label:'1-Week Reminder', emoji:'⏰',
      template:`Hey! 👋 Just a reminder — the party is *one week away*!\n\n📅 *Date:* [ADD DATE]\n⏰ *Time:* [ADD TIME]\n📍 *Venue:* ${addr}${parking}${entry}\n\nSee you there! 🎊` },
    { id:'dayof', label:'Day-Of Directions', emoji:'📍',
      template:`Today's the day! 🎉\n\n*Party — Here's how to get there:*\n\n📍 *Address:* ${addr}${parking}${contact}${entry}\n\nCan't wait to see you! 🥂` },
    { id:'thankyou', label:'Thank You', emoji:'🙏',
      template:`🙏 *Thank you so much!*\n\nWe're so grateful you came to the party.\n\nYour presence made it truly special — looking forward to the next one!\n\nWith love ❤️` },
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
          <button key={p.id} onClick={()=>setPhase(p.id)} style={{ fontSize:11.5, padding:'6px 12px', borderRadius:100, border:`1.5px solid ${phase===p.id?'#C47A2E':'rgba(255,255,255,0.12)'}`, background:phase===p.id?'rgba(196,122,46,0.15)':'transparent', color:phase===p.id?'#CCAB4A':'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>{p.emoji} {p.label}</button>
        ))}
      </div>
      {hasVenue&&<div style={{ fontSize:11, color:'#22c55e', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:8, padding:'6px 12px', marginBottom:12, fontWeight:600 }}>✓ Venue address auto-filled from Venue Notes</div>}
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

// ── Collaborative planning tools (live, Plan Together section) ───────────────

function VenueVote({ onClose, room, myName, isHost, gameState, sendAction }) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const venues = gameState?.venues || [];
  const totalVotes = venues.reduce((s, v) => s + Object.keys(v.votes || {}).length, 0);

  const addVenue = () => {
    if (!name.trim()) return;
    sendAction?.('add-venue', { name: name.trim(), cost: cost.trim() });
    setName(''); setCost('');
  };

  const vote = (id) => sendAction?.('vote', { id });

  return (
    <Modal onClose={onClose} emoji="📍" title="Venue Vote">
      {!room && <div style={{ background: "rgba(124,58,237,0.1)", border: "1.5px solid rgba(124,58,237,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#C4B5FD", marginBottom: 14 }}>Join a room for live voting</div>}
      {isHost && (
        <>
          <span style={label}>Add a venue option</span>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && addVenue()} placeholder="Venue name…" style={{ ...inp, flex: 2 }} />
            <input value={cost} onChange={e => setCost(e.target.value)} placeholder="~₹ cost" style={{ ...inp, flex: 1 }} />
          </div>
          <button onClick={addVenue} style={{ ...btn("#7C3AED"), marginBottom: 20 }}>+ Add Option</button>
        </>
      )}
      {venues.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
          {isHost ? "Add venue options above" : "Waiting for host to add venues…"}
        </div>
      ) : venues.map(v => {
        const voteCount = Object.keys(v.votes || {}).length;
        const pct = totalVotes > 0 ? Math.round(voteCount / totalVotes * 100) : 0;
        const myVote = v.votes?.[myName];
        return (
          <div key={v.id} style={{ ...card, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: font }}>{v.name}</div>
                {v.cost && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{v.cost}</div>}
              </div>
              <button onClick={() => vote(v.id)} style={{ padding: "6px 14px", borderRadius: 100, border: `1.5px solid ${myVote ? "#7C3AED" : "rgba(255,255,255,0.15)"}`, background: myVote ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)", color: myVote ? "#C4B5FD" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0 }}>
                {myVote ? "✓ Voted" : "Vote"}
              </button>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                <span>{voteCount} {voteCount === 1 ? "vote" : "votes"}</span>
                <span>{pct}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "#7C3AED", borderRadius: 3, transition: "width 0.4s ease" }} />
              </div>
            </div>
          </div>
        );
      })}
    </Modal>
  );
}

function GroupChecklist({ onClose, room, myName, gameState, sendAction }) {
  const [text, setText] = useState('');
  const items = gameState?.items || [];
  const done = items.filter(i => i.done).length;

  const add = () => {
    if (!text.trim()) return;
    sendAction?.('add', { text: text.trim() });
    setText('');
  };

  const toggle = (id) => sendAction?.('toggle', { id });
  const remove = (id) => sendAction?.('remove', { id });

  return (
    <Modal onClose={onClose} emoji="✅" title="Group Checklist">
      {!room && <div style={{ background: "rgba(5,150,105,0.1)", border: "1.5px solid rgba(5,150,105,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#6EE7B7", marginBottom: 14 }}>Join a room to sync the checklist live</div>}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Add a task…" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...btn("#059669"), width: "auto", padding: "10px 16px" }}>+</button>
      </div>
      {items.length > 0 && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>{done}/{items.length} done</div>
      )}
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No tasks yet — add one!</div>
      ) : items.map(it => (
        <div key={it.id} style={{ ...card, display: "flex", alignItems: "center", gap: 10, marginBottom: 8, opacity: it.done ? 0.55 : 1 }}>
          <button onClick={() => toggle(it.id)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${it.done ? "#059669" : "rgba(255,255,255,0.25)"}`, background: it.done ? "#059669" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {it.done && <span style={{ fontSize: 12, color: "#fff" }}>✓</span>}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: "#fff", textDecoration: it.done ? "line-through" : "none", fontFamily: font }}>{it.text}</div>
            {it.doneBy && <div style={{ fontSize: 11, color: "#6EE7B7", marginTop: 2 }}>✓ {it.doneBy}</div>}
          </div>
          <button onClick={() => remove(it.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
      ))}
    </Modal>
  );
}

function KittyFund({ onClose, room, myName, isHost, gameState, sendAction }) {
  const [name, setName] = useState(myName || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [targetInput, setTargetInput] = useState('');

  const target = gameState?.target || 0;
  const contributions = gameState?.contributions || [];
  const total = contributions.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const pct = target > 0 ? Math.min(100, Math.round(total / target * 100)) : 0;

  const addContribution = () => {
    if (!name.trim() || !amount || isNaN(Number(amount))) return;
    sendAction?.('add-contribution', { name: name.trim(), amount: Number(amount), note: note.trim() });
    setAmount(''); setNote('');
  };

  const setTarget = () => {
    if (!targetInput || isNaN(Number(targetInput))) return;
    sendAction?.('set-target', { target: Number(targetInput) });
    setTargetInput('');
  };

  const remove = (id) => sendAction?.('remove-contribution', { id });

  return (
    <Modal onClose={onClose} emoji="🐷" title="Kitty Fund">
      {!room && <div style={{ background: "rgba(196,122,46,0.1)", border: "1.5px solid rgba(196,122,46,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#FCD34D", marginBottom: 14 }}>Join a room to pool contributions live</div>}

      {isHost && !target && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input value={targetInput} onChange={e => setTargetInput(e.target.value)} placeholder="Set target amount (₹)" type="number" style={{ ...inp, flex: 1 }} />
          <button onClick={setTarget} style={{ ...btn("#C47A2E"), width: "auto", padding: "10px 14px" }}>Set</button>
        </div>
      )}

      {target > 0 ? (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: "#FCD34D", fontWeight: 700, fontFamily: font }}>₹{total.toLocaleString()} raised</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>of ₹{target.toLocaleString()}</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#C47A2E,#F59E0B)", borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{pct}% of goal</div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 16 }}>
          Total: <strong style={{ color: "#FCD34D" }}>₹{total.toLocaleString()}</strong>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ ...inp, flex: 1 }} />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ Amount" type="number" style={{ ...inp, flex: 1 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" style={{ ...inp, flex: 1 }} onKeyDown={e => e.key === "Enter" && addContribution()} />
        <button onClick={addContribution} style={{ ...btn("#C47A2E"), width: "auto", padding: "10px 16px" }}>+ Add</button>
      </div>

      {contributions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No contributions yet — be the first! 🐷</div>
      ) : contributions.map(c => (
        <div key={c.id} style={{ ...card, display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#FCD34D", fontFamily: font }}>₹{Number(c.amount).toLocaleString()}</span>
              <span style={{ fontSize: 14, color: "#fff", fontFamily: font }}>— {c.name}</span>
            </div>
            {c.note && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{c.note}</div>}
          </div>
          {(c.name === myName || isHost) && (
            <button onClick={() => remove(c.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
          )}
        </div>
      ))}
    </Modal>
  );
}

// ── Room-based new tools ──────────────────────────────────────────────────────

function WishWall({ onClose, room, myName, gameState, sendAction, sendEffect }) {
  const [text, setText] = useState('');
  const [showWall, setShowWall] = useState(false);
  const items = gameState?.items || [];

  const add = () => {
    if (!text.trim()) return;
    sendAction?.('add', { text: text.trim(), emoji: '⭐' });
    sendEffect?.('wish', { text: text.trim() });
    setText('');
  };

  if (showWall) return <DesignerWall onClose={()=>setShowWall(false)} items={items} title="Wish Wall" wallEmoji="⭐" />;
  return (
    <Modal onClose={onClose} emoji="⭐" title="Wish Wall">
      {!room && <div style={{ background: "rgba(245,158,11,0.1)", border: "1.5px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#FCD34D", marginBottom: 14 }}>Join or host a room for live sharing</div>}
      <button onClick={()=>setShowWall(true)} style={{ width:"100%", padding:"11px", borderRadius:12, border:`1.5px solid ${items.length?"#F59E0B":"rgba(255,255,255,0.12)"}`, background:items.length?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.04)", color:items.length?"#FCD34D":"rgba(255,255,255,0.45)", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font, marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        <span>✨ View Wall</span>
        {items.length>0&&<span style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"1px 9px",fontSize:12}}>{items.length}</span>}
      </button>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Add your wish…" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...btn("#F59E0B"), width: "auto", padding: "10px 16px" }}>⭐</button>
      </div>
      {items.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No wishes yet — add one!</div>
      )}
    </Modal>
  );
}

function MoodMeter({ onClose, room, myName, gameState, sendAction }) {
  const moods = gameState?.moods || {};
  const MOOD_OPTIONS = [
    { mood: "🔥", label: "On Fire", color: "#EF4444" },
    { mood: "😄", label: "Happy",   color: "#22C55E" },
    { mood: "😎", label: "Chill",   color: "#3B82F6" },
    { mood: "🤔", label: "Unsure",  color: "#F59E0B" },
    { mood: "😴", label: "Sleepy",  color: "#C85A2A" },
  ];
  const myMood = moods[myName];
  const set = (mood, lbl) => sendAction?.('set-mood', { mood, label: lbl });

  return (
    <Modal onClose={onClose} emoji="💫" title="Mood Meter">
      {!room && <div style={{ background: "rgba(236,72,153,0.1)", border: "1.5px solid rgba(236,72,153,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#F9A8D4", marginBottom: 14 }}>Join a room to share your mood live</div>}
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>How are you feeling right now?</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
        {MOOD_OPTIONS.map(({ mood, label, color }) => (
          <button key={mood} onClick={() => set(mood, label)} style={{ flex: 1, padding: "16px 4px", borderRadius: 14, border: `2px solid ${myMood?.mood === mood ? color : "rgba(255,255,255,0.1)"}`, background: myMood?.mood === mood ? `${color}22` : "rgba(255,255,255,0.04)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 24 }}>{mood}</span>
            <span style={{ fontSize: 10, color: myMood?.mood === mood ? color : "rgba(255,255,255,0.4)", fontWeight: 700, fontFamily: font }}>{label}</span>
          </button>
        ))}
      </div>
      {Object.keys(moods).length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Room Vibes</div>
          {Object.entries(moods).map(([name, m]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>{m.mood}</span>
              <span style={{ flex: 1, fontSize: 14, color: "#fff", fontWeight: name === myName ? 700 : 400, fontFamily: font }}>{name}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: font }}>{m.label}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function SecretMessages({ onClose, room, myName, players, gameState, sendAction }) {
  const [text, setText] = useState('');
  const [to, setTo] = useState('everyone');
  const msgs = gameState?.messages || [];

  const send = () => {
    if (!text.trim()) return;
    sendAction?.('send', { text: text.trim(), to });
    setText('');
  };

  return (
    <Modal onClose={onClose} emoji="🤫" title="Secret Messages">
      {!room && <div style={{ background: "rgba(99,102,241,0.1)", border: "1.5px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#A5B4FC", marginBottom: 14 }}>Join a room to send live secret messages</div>}
      <div style={{ marginBottom: 12 }}>
        <label style={label}>Send to</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["everyone", ...(players || [])].map(p => (
            <button key={p} onClick={() => setTo(p)} style={{ padding: "5px 12px", borderRadius: 100, border: `1.5px solid ${to === p ? "#1A7A8A" : "rgba(255,255,255,0.12)"}`, background: to === p ? "rgba(99,102,241,0.25)" : "transparent", color: to === p ? "#fff" : "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              {p === "everyone" ? "🌐 Everyone" : p}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Your secret message…" style={{ ...inp, flex: 1 }} />
        <button onClick={send} style={{ ...btn("#1A7A8A"), width: "auto", padding: "10px 16px" }}>Send</button>
      </div>
      {msgs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No messages yet 🤫</div>
      ) : msgs.map(m => (
        <div key={m.id} style={{ ...card }}>
          <div style={{ fontSize: 11, color: "#A5B4FC", fontWeight: 700, marginBottom: 4 }}>→ {m.to}</div>
          <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5, fontStyle: "italic" }}>"{m.text}"</div>
        </div>
      ))}
    </Modal>
  );
}

function LoveNotes({ onClose, room, myName, gameState, sendAction, sendEffect }) {
  const [text, setText] = useState('');
  const [showWall, setShowWall] = useState(false);
  const items = gameState?.items || [];

  const add = () => {
    if (!text.trim()) return;
    sendAction?.('add', { text: text.trim(), emoji: '💌' });
    sendEffect?.('love', { text: text.trim() });
    setText('');
  };

  if (showWall) return <DesignerWall onClose={()=>setShowWall(false)} items={items} title="Love Notes Wall" wallEmoji="💌" />;
  return (
    <Modal onClose={onClose} emoji="💌" title="Love Notes Wall">
      {!room && <div style={{ background: "rgba(244,63,94,0.1)", border: "1.5px solid rgba(244,63,94,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#FDA4AF", marginBottom: 14 }}>Join a room to share live love notes</div>}
      <button onClick={()=>setShowWall(true)} style={{ width:"100%", padding:"11px", borderRadius:12, border:`1.5px solid ${items.length?"#F43F5E":"rgba(255,255,255,0.12)"}`, background:items.length?"rgba(244,63,94,0.1)":"rgba(255,255,255,0.04)", color:items.length?"#FDA4AF":"rgba(255,255,255,0.45)", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font, marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        <span>✨ View Wall</span>
        {items.length>0&&<span style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"1px 9px",fontSize:12}}>{items.length}</span>}
      </button>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Write a sweet note…" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...btn("#F43F5E"), width: "auto", padding: "10px 16px" }}>💌</button>
      </div>
      {items.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No notes yet — be the first!</div>
      )}
    </Modal>
  );
}

// ── Room lobby modal ──────────────────────────────────────────────────────────
// ── Entry Gate — shown before the hub on first open ──────────────────────────
function EntryGate({ onExplore, onCreate, onJoin, error, clearError }) {
  const [view, setView]           = useState('pick'); // 'pick' | 'host' | 'join'
  const [name, setName]           = useState('');
  const [partyName, setPartyName] = useState('');
  const [code, setCode]           = useState('');
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onCreate({ partyName: partyName.trim() || `${name.trim()}'s Party`, hostName: name.trim(), occasionType: 'house-party' });
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!name.trim() || code.length < 4) return;
    setLoading(true);
    await onJoin({ code: code.trim().toUpperCase(), name: name.trim() });
    setLoading(false);
  };

  const iStyle = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, padding: "13px 16px", color: "#fff", fontSize: 15, fontFamily: font, outline: "none", boxSizing: "border-box" };
  const lStyle = { fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100dvh", background: "#0C0904", display: "flex", flexDirection: "column", fontFamily: font }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');`}</style>

      <div style={{ padding: "24px 20px 0" }}>
        <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "7px 16px", borderRadius: 100, cursor: "pointer", fontSize: 12, fontFamily: font, fontWeight: 600 }}>← Back</button>
      </div>

      <div style={{ textAlign: "center", padding: "32px 24px 28px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 12px" }}>Party Toolkit</p>
        <h1 style={{ fontSize: "clamp(1.9rem,5vw,2.6rem)", fontWeight: 700, color: "#fff", margin: "0 0 8px", lineHeight: 1.1 }}>House Party Hub</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.5 }}>The app everyone opens during the party</p>
      </div>

      <div style={{ flex: 1, padding: "0 20px 52px", maxWidth: 480, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {view === 'pick' && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => { clearError?.(); setView('host'); }}
              style={{ background: "linear-gradient(135deg,rgba(196,122,46,0.2),rgba(196,122,46,0.08))", border: "1.5px solid rgba(196,122,46,0.5)", borderRadius: 20, padding: "24px 22px", cursor: "pointer", textAlign: "left", fontFamily: font }}
            >
              <div style={{ fontSize: 30, marginBottom: 10 }}>👑</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#FFF8EC", marginBottom: 5, letterSpacing: "-0.01em" }}>I'm Hosting</div>
              <div style={{ fontSize: 13, color: "rgba(255,248,236,0.48)", lineHeight: 1.5 }}>Create a room · get a code · manage everything · guests see results</div>
            </button>

            <button
              onClick={() => { clearError?.(); setView('join'); }}
              style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.13)", borderRadius: 20, padding: "24px 22px", cursor: "pointer", textAlign: "left", fontFamily: font }}
            >
              <div style={{ fontSize: 30, marginBottom: 10 }}>🚀</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#FFF8EC", marginBottom: 5, letterSpacing: "-0.01em" }}>Join a Party</div>
              <div style={{ fontSize: 13, color: "rgba(255,248,236,0.48)", lineHeight: 1.5 }}>Enter the code your host shared · games and fun await</div>
            </button>

            <button
              onClick={onExplore}
              style={{ background: "transparent", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 16, padding: "16px 20px", cursor: "pointer", textAlign: "left", fontFamily: font }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>👀</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,248,236,0.68)", marginBottom: 3 }}>Just Exploring</div>
                  <div style={{ fontSize: 12, color: "rgba(255,248,236,0.32)", lineHeight: 1.4 }}>Browse all tools · play freely · no code needed</div>
                </div>
              </div>
            </button>
          </div>
        )}

        {view === 'host' && (
          <div>
            <button onClick={() => { clearError?.(); setView('pick'); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: font, marginBottom: 22, padding: 0 }}>← Back</button>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👑</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#FFF8EC", marginBottom: 4 }}>Set Up Your Room</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 24, lineHeight: 1.5 }}>Share the room code with guests — they join and see tools you've set up.</div>
            {error && <div style={{ background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FCA5A5", marginBottom: 14 }}>{error}</div>}
            <div style={{ marginBottom: 12 }}><label style={lStyle}>Your Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?" style={iStyle} /></div>
            <div style={{ marginBottom: 24 }}><label style={lStyle}>Party Name <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span></label><input value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="Saturday Night Out" style={iStyle} /></div>
            <button onClick={handleCreate} disabled={!name.trim() || loading} style={{ width: "100%", background: name.trim() && !loading ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, padding: "15px", color: "#fff", fontSize: 16, fontWeight: 800, cursor: name.trim() && !loading ? "pointer" : "not-allowed", fontFamily: font, boxShadow: name.trim() ? "0 4px 18px rgba(196,122,46,0.35)" : "none" }}>
              {loading ? "Creating Room…" : "🎉 Create My Room"}
            </button>
          </div>
        )}

        {view === 'join' && (
          <div>
            <button onClick={() => { clearError?.(); setView('pick'); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: font, marginBottom: 22, padding: 0 }}>← Back</button>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#FFF8EC", marginBottom: 4 }}>Join the Party</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 24, lineHeight: 1.5 }}>Enter the code your host shared with you.</div>
            {error && <div style={{ background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FCA5A5", marginBottom: 14 }}>{error}</div>}
            <div style={{ marginBottom: 12 }}><label style={lStyle}>Your Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={iStyle} /></div>
            <div style={{ marginBottom: 24 }}>
              <label style={lStyle}>Room Code</label>
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} style={{ ...iStyle, fontSize: 22, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", textAlign: "center" }} />
            </div>
            <button onClick={handleJoin} disabled={!name.trim() || code.length < 4 || loading} style={{ width: "100%", background: name.trim() && code.length >= 4 && !loading ? "linear-gradient(135deg,#059669,#10B981)" : "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, padding: "15px", color: "#fff", fontSize: 16, fontWeight: 800, cursor: name.trim() && code.length >= 4 && !loading ? "pointer" : "not-allowed", fontFamily: font }}>
              {loading ? "Joining…" : "🚀 Join Room"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function RoomLobbyModal({ onClose, onCreate, onJoin, error }) {
  const [tab, setTab] = useState('join'); // 'host' | 'join'
  const [name, setName] = useState('');
  const [partyName, setPartyName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const tabBtn = (id, lbl) => (
    <button onClick={() => setTab(id)} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", background: tab === id ? "#C47A2E" : "rgba(255,255,255,0.07)", color: tab === id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>{lbl}</button>
  );
  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const res = await onCreate({ partyName: partyName.trim() || `${name}'s Party`, hostName: name.trim(), occasionType: "house-party" });
    setLoading(false);
    if (res?.ok) onClose();
  };
  const handleJoin = async () => {
    if (!name.trim() || code.length < 4) return;
    setLoading(true);
    const res = await onJoin({ code: code.trim().toUpperCase(), name: name.trim() });
    setLoading(false);
    if (res?.ok) onClose();
  };
  return (
    <Modal onClose={onClose} emoji="🎉" title="Party Room">
      {error && <div style={{ background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FCA5A5", marginBottom: 14 }}>{error}</div>}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>{tabBtn("join", "Join a Room")}{tabBtn("host", "Host a Room")}</div>

      {tab === "host" ? (
        <>
          <div style={{ marginBottom: 10 }}><label style={label}>Your Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?" style={inp} /></div>
          <div style={{ marginBottom: 16 }}><label style={label}>Party Name (optional)</label><input value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="Saturday Night Out" style={inp} /></div>
          <button onClick={handleCreate} disabled={!name.trim() || loading} style={{ ...btn("#C47A2E"), opacity: !name.trim() || loading ? 0.5 : 1 }}>{loading ? "Creating…" : "🎉 Create Room"}</button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 10, textAlign: "center" }}>You can host up to 5 rooms per day. Share the code with friends to join.</p>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 10 }}><label style={label}>Your Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp} /></div>
          <div style={{ marginBottom: 16 }}><label style={label}>Room Code</label><input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} style={{ ...inp, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 18, fontWeight: 800 }} /></div>
          <button onClick={handleJoin} disabled={!name.trim() || code.length < 4 || loading} style={{ ...btn("#059669"), opacity: !name.trim() || code.length < 4 || loading ? 0.5 : 1 }}>{loading ? "Joining…" : "🚀 Join Room"}</button>
        </>
      )}
    </Modal>
  );
}

// ── Room banner ───────────────────────────────────────────────────────────────
function RoomBanner({ room, players, isHost, myName, onClose, onLeave }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard?.writeText(room.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ margin: "0 16px 16px", background: "rgba(196,122,46,0.12)", border: "1.5px solid rgba(196,122,46,0.35)", borderRadius: 16, padding: "14px 16px", fontFamily: font }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Live Room · {room.partyName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "0.12em" }}>{room.code}</span>
            <button onClick={copyCode} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, padding: "4px 10px", color: copied ? "#34D399" : "#CCAB4A", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
        {isHost ? (
          <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 100, border: "1.5px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)", color: "#FCA5A5", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0 }}>Close Room</button>
        ) : (
          <button onClick={onLeave} style={{ padding: "6px 14px", borderRadius: 100, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0 }}>Leave</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {players.map(p => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 5, background: p === myName ? "rgba(196,122,46,0.35)" : "rgba(255,255,255,0.08)", borderRadius: 100, padding: "3px 10px 3px 4px" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: p === room.hostName ? "#FBBF24" : "#C47A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>{p[0]?.toUpperCase()}</div>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: p === myName ? 700 : 400 }}>{p}{p === room.hostName ? " 👑" : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Effect flash overlay ──────────────────────────────────────────────────────
const EFFECT_CONFIGS = {
  "truth-done":  { emoji: "🎤", text: "Truth Told!", color: "#60A5FA" },
  "dare-done":   { emoji: "🔥", text: "Dare Done!", color: "#F87171" },
  "bingo":       { emoji: "🎱", text: "BINGO!", color: "#FBBF24" },
  "wish":        { emoji: "⭐", text: "Wish Added!", color: "#FCD34D" },
  "love":        { emoji: "💌", text: "Love Sent!", color: "#FDA4AF" },
  "done":        { emoji: "✅", text: "Done!", color: "#34D399" },
  "spin":        { emoji: "🍾", text: "Spin!", color: "#CCAB4A" },
  default:       { emoji: "🎉", text: "Let's go!", color: "#FBBF24" },
};

function EffectFlash({ effect }) {
  if (!effect) return null;
  const cfg = EFFECT_CONFIGS[effect.type] || EFFECT_CONFIGS.default;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", background: `${cfg.color}18` }}>
      <div style={{ textAlign: "center", animation: "ef-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <div style={{ fontSize: 72 }}>{cfg.emoji}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: cfg.color, fontFamily: font, marginTop: 8, textShadow: `0 0 40px ${cfg.color}` }}>{cfg.text}</div>
        {effect.by && <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6, fontFamily: font }}>{effect.by}</div>}
      </div>
      <style>{`@keyframes ef-pop { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

export default function HousePartyHub() {
  const [open, setOpen]           = useState(null);
  const [entryMode, setEntryMode] = useState(null); // null | 'exploring' | 'hosting' | 'joined'
  const navigate = useNavigate();

  const {
    room, players, gameState, currentGame, myName, isHost, effect, error,
    createRoom, joinRoom, closeRoom, leaveRoom, sendAction, sendEffect, clearError,
  } = usePartyRoom();

  // When room disappears (host closed it for guests, or we closed it), fall back to explore
  useEffect(() => {
    if (!room && (entryMode === 'hosting' || entryMode === 'joined')) {
      setEntryMode('exploring');
    }
  }, [room]);

  const handleHostCreate = useCallback(async (args) => {
    const res = await createRoom(args);
    if (res?.ok) setEntryMode('hosting');
    return res;
  }, [createRoom]);

  const handleGuestJoin = useCallback(async (args) => {
    const res = await joinRoom(args);
    if (res?.ok) setEntryMode('joined');
    return res;
  }, [joinRoom]);

  // When a live game tool is opened in a room, push game state to room
  const openTool = (id) => {
    const tool = TOOLS.find(t => t.id === id);
    if (tool?.live && room) {
      if (isHost) sendAction('next', {}).catch?.(() => {});
    }
    setOpen(id);
  };

  const close = () => setOpen(null);

  // Shared room props for live tools
  const liveProps = { room, myName, players, gameState, sendAction, sendEffect, isHost };

  const renderModal = () => {
    switch (open) {
      case "truthordare": return <TruthOrDare onClose={close} />;
      case "neverhavei": return <NeverHaveI onClose={close} />;
      case "wouldyou": return <WouldYouRather onClose={close} />;
      case "hottakes": return <HotTakes onClose={close} />;
      case "spin": return <SpinBottle onClose={close} />;
      case "charades": return <Charades onClose={close} />;
      case "bingo": return <Bingo onClose={close} />;
      case "mostlikelyto": return <MostLikelyTo onClose={close} />;
      case "checklist": return <Checklist onClose={close} />;
      case "bills": return <BillSplitter onClose={close} />;
      case "theme": return <ThemePicker onClose={close} />;
      case "countdown": return <Countdown onClose={close} />;
      case "playlist": return <PlaylistBuilder onClose={close} />;
      case "reportcard": return <PartyReportCard onClose={close} />;
      case "venuevote":  return <VenueVote      onClose={close} {...liveProps} />;
      case "groupcheck": return <GroupChecklist onClose={close} {...liveProps} />;
      case "kittyfund":  return <KittyFund      onClose={close} {...liveProps} />;
      case "wishwall":   return <WishWall   onClose={close} {...liveProps} />;
      case "moodmeter":  return <MoodMeter  onClose={close} {...liveProps} />;
      case "secretmsg":  return <SecretMessages onClose={close} {...liveProps} />;
      case "lovenotes":  return <LoveNotes  onClose={close} {...liveProps} />;
      case "potluck": return (
        <ShareableTool onClose={close} emoji="🥘" title="Potluck Planner" description="Create a potluck room. Share the link — friends claim what they'll bring."
          path="/house-party/potluck"
          fields={[
            { key: "partyName", label: "Party Name", placeholder: "Aman's Birthday Bash", required: true },
            { key: "hostName", label: "Your Name", placeholder: "Aman", required: true },
            { key: "items", label: "Items (comma-separated)", placeholder: "Chips, Coke, Beer, Cake, Plates", required: true },
          ]}
        />
      );
      case "invite": return (
        <ShareableTool onClose={close} emoji="📨" title="Digital Invite & RSVP" description="Create an invite. Share the link — guests RSVP instantly."
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
        <ShareableTool onClose={close} emoji="📸" title="Shared Photo Wall" description="Create a photo wall. Share the link — everyone uploads their photos."
          path="/house-party/photo-wall"
          fields={[
            { key: "partyName", label: "Party Name", placeholder: "Saturday Night 🎉", required: true },
          ]}
        />
      );
      case "guestlist":   return <GuestListModal onClose={close} />;
      case "menu":        return <MenuPlannerModal onClose={close} />;
      case "seating":     return <SeatingChartModal onClose={close} />;
      case "daytimeline": return <DayTimelineModal onClose={close} />;
      case "venue":        return <VenueNotesModal    onClose={close} />;
      case "budget":       return <BudgetPlannerModal onClose={close} />;
      case "vendors":      return <VendorTrackerModal onClose={close} />;
      case "wabroadcast":  return <WABroadcastModal   onClose={close} />;
      case "twotruthslie": return <TwoTruthsLieGame onClose={close} />;
      case "hotseat":      return <HotSeatGame onClose={close} />;
      case "darewheel":    return <DareWheelGame onClose={close} />;
      case "wordwolf":     return <WordWolfGame onClose={close} />;
      case "categoryblitz": return <CategoryBlitzGame onClose={close} />;
      case "roastbattle":  return <RoastBattleGame onClose={close} />;
      default: return null;
    }
  };

  // Show entry gate until a mode is chosen
  if (!entryMode) {
    return (
      <EntryGate
        onExplore={() => setEntryMode('exploring')}
        onCreate={handleHostCreate}
        onJoin={handleGuestJoin}
        error={error}
        clearError={clearError}
      />
    );
  }

  return (
    <div style={{ minHeight: "100dvh", fontFamily: font, background: "#0C0904" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        @media (max-width: 480px) {
          .hp-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ padding: "28px 20px 0", textAlign: "center" }}>
        <button onClick={() => navigate(-1)} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.6)", padding: "7px 16px",
          borderRadius: 100, cursor: "pointer", fontSize: 12,
          fontFamily: font, fontWeight: 600, marginBottom: 28,
        }}>← Back</button>

        <p style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 14px" }}>Party Toolkit</p>

        <h1 style={{
          fontSize: "clamp(2rem,5vw,2.7rem)", fontWeight: 700,
          color: "#fff", margin: "0 0 10px", lineHeight: 1.1,
        }}>House Party Hub</h1>
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.4)",
          margin: "0 0 22px", lineHeight: 1.5, maxWidth: 320, marginLeft: "auto", marginRight: "auto",
        }}>The app everyone opens during the party</p>

        <div style={{ marginBottom: 20 }} />
      </div>

      {/* ── Room banner (hosting / joined) ── */}
      {room && (
        <RoomBanner
          room={room} players={players} isHost={isHost} myName={myName}
          onClose={async () => { await closeRoom(); }}
          onLeave={async () => { await leaveRoom(); }}
        />
      )}

      {/* ── Explore-mode banner ── */}
      {entryMode === 'exploring' && !room && (
        <div style={{ margin: "0 16px 12px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.13)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>👀</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,248,236,0.65)" }}>Exploring — tools run locally</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>Start or join a room to sync with others</div>
          </div>
          <button
            onClick={() => setEntryMode(null)}
            style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", border: "none", borderRadius: 8, padding: "7px 13px", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Host / Join
          </button>
        </div>
      )}

      {/* ── Joined-mode banner (no room yet — shouldn't happen but guard) ── */}
      {entryMode === 'joined' && !room && (
        <div style={{ margin: "0 16px 12px", background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.25)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🚀</span>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: font }}>Joining room…</div>
        </div>
      )}

      {/* ── Sections ── */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
        {SECTIONS.map((sec) => {
          let sectionTools = TOOLS.filter(t => t.section === sec.id);
          // Guests only see the shareable manage tools; host-private ones are hidden
          if (entryMode === 'joined' && sec.id === 'manage') {
            sectionTools = sectionTools.filter(t => GUEST_MANAGE_TOOLS.has(t.id));
            if (!sectionTools.length) return null;
          }
          const secLabel = entryMode === 'joined' && sec.id === 'manage' ? 'Shared Tools' : sec.label;
          const secSub   = entryMode === 'joined' && sec.id === 'manage' ? 'Potluck · RSVP · bills · photos' : sec.subtitle;
          return (
            <div key={sec.id} style={{ marginBottom: 36 }}>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 2px" }}>{secLabel}</p>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.28)", margin: 0 }}>{secSub}</p>
              </div>
              {sectionTools.length >= 3
                ? <PolygonGrid tools={sectionTools} onOpen={openTool} />
                : <ToolGrid tools={sectionTools} onOpen={openTool} />
              }
            </div>
          );
        })}
      </div>

      {/* Play Together CTA */}
      <div style={{ padding: "20px 20px 52px", display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/play")}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 28px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "border-color 0.15s, color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.4)"; e.currentTarget.style.color = "#CCAB4A"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
        >
          {hpic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>, 16)}
          Play Together
        </button>
      </div>

      {renderModal()}

      <EffectFlash effect={effect} />
    </div>
  );
}

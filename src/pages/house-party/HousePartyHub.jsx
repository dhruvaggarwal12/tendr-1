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

const THEME_DATA = [
  { name: "Retro 70s",       emoji: "🕺", color: "#F59E0B", bg: "linear-gradient(135deg,#78350F,#92400E)",  mood: "Groovy • Disco • Funky",       dress: "Bell-bottoms, platform shoes",      music: "Donna Summer, Bee Gees" },
  { name: "Bollywood Night", emoji: "🌟", color: "#EC4899", bg: "linear-gradient(135deg,#831843,#9D174D)",  mood: "Glam • Filmi • Drama",          dress: "Lehenga, sherwani, jewellery",      music: "Shah Rukh classics, item songs" },
  { name: "Neon Glow",       emoji: "⚡", color: "#A855F7", bg: "linear-gradient(135deg,#4C1D95,#5B21B6)",  mood: "Electric • Cyberpunk • UV",     dress: "Neon, glow-in-dark, white",         music: "EDM, house, techno" },
  { name: "Black & White",   emoji: "🎭", color: "#E5E7EB", bg: "linear-gradient(135deg,#111827,#1F2937)",  mood: "Elegant • Classic • Classy",    dress: "Monochrome only!",                  music: "Frank Sinatra, jazz classics" },
  { name: "Beach Vibes",     emoji: "🏄", color: "#06B6D4", bg: "linear-gradient(135deg,#0E7490,#0891B2)",  mood: "Chill • Sunny • Tropical",      dress: "Shorts, sundresses, flip-flops",    music: "Reggae, tropical house" },
  { name: "Royale / OTT",    emoji: "👑", color: "#FBBF24", bg: "linear-gradient(135deg,#78350F,#92400E)",  mood: "Lavish • Regal • Extra",        dress: "Formal, gowns, suits",              music: "Classical, cinematic" },
  { name: "Masquerade",      emoji: "🎭", color: "#8B5CF6", bg: "linear-gradient(135deg,#312E81,#4338CA)",  mood: "Mysterious • Dark • Secret",    dress: "Masks required, black/red",         music: "Dramatic classical, opera" },
  { name: "Fairy Lights",    emoji: "✨", color: "#FDE68A", bg: "linear-gradient(135deg,#1F2937,#374151)",  mood: "Dreamy • Cozy • Warm",          dress: "Pastel, flowy, white",              music: "Indie, acoustic, soft pop" },
];

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
  const [mode, setMode] = useState(null);
  const [card, setCardState] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [discarded, setDiscarded] = useState([]);
  const [passed, setPassed] = useState(0);

  const pick = (m) => {
    setFlipping(true);
    setTimeout(() => { setMode(m); setCardState(rand(m === "truth" ? TRUTHS : DARES)); setFlipping(false); }, 300);
  };
  const next = () => {
    setDiscarded(d => [...d, card]);
    setFlipping(true);
    setTimeout(() => { setCardState(rand(mode === "truth" ? TRUTHS : DARES)); setFlipping(false); }, 300);
  };
  const pass = () => { setPassed(p => p + 1); next(); };

  if (!card) return (
    <Modal onClose={onClose} emoji="🎯" title="Truth or Dare">
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Choose your fate</div>
        {/* Giant card split */}
        <div style={{ display: "flex", gap: 10, height: 200 }}>
          <button onClick={() => pick("truth")} style={{ flex: 1, background: "linear-gradient(160deg,#1E3A8A,#1D4ED8)", border: "2.5px solid #3B82F6", borderRadius: 20, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, transition: "transform 0.15s", fontFamily: font }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
            <span style={{ fontSize: 48 }}>🤔</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "0.06em" }}>TRUTH</span>
            <span style={{ fontSize: 11, color: "#93C5FD", fontWeight: 600 }}>{TRUTHS.length} questions</span>
          </button>
          <button onClick={() => pick("dare")} style={{ flex: 1, background: "linear-gradient(160deg,#7F1D1D,#DC2626)", border: "2.5px solid #F87171", borderRadius: 20, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, transition: "transform 0.15s", fontFamily: font }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
            <span style={{ fontSize: 48 }}>🔥</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "0.06em" }}>DARE</span>
            <span style={{ fontSize: 11, color: "#FCA5A5", fontWeight: 600 }}>{DARES.length} dares</span>
          </button>
        </div>
      </div>
      {/* Discarded pile indicator */}
      {discarded.length > 0 && <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>🃏 {discarded.length} used · {passed} passed</div>}
    </Modal>
  );

  const isTruth = mode === "truth";
  const accent = isTruth ? "#3B82F6" : "#F87171";
  const bgGrad = isTruth ? "linear-gradient(160deg,#1E3A8A,#1D4ED8 60%,#1E40AF)" : "linear-gradient(160deg,#7F1D1D,#DC2626 60%,#B91C1C)";

  return (
    <Modal onClose={onClose} emoji="🎯" title="Truth or Dare">
      {/* Discard pile (stacked look) */}
      {discarded.length > 0 && (
        <div style={{ position: "relative", height: 18, marginBottom: -10 }}>
          {[...Array(Math.min(discarded.length, 3))].map((_, i) => (
            <div key={i} style={{ position: "absolute", width: "100%", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, top: i * 3, transform: `rotate(${(i - 1) * 1.5}deg)` }} />
          ))}
        </div>
      )}
      {/* Main card */}
      <div style={{ background: bgGrad, borderRadius: 24, padding: "36px 24px 28px", textAlign: "center", marginBottom: 14, border: `3px solid ${accent}80`, boxShadow: `0 20px 60px ${accent}30, 0 4px 12px rgba(0,0,0,0.5)`, opacity: flipping ? 0.3 : 1, transform: flipping ? "rotateY(90deg)" : "rotateY(0)", transition: "opacity 0.2s, transform 0.2s", minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 16 }}>{isTruth ? "🤔 TRUTH" : "🔥 DARE"} · #{discarded.length + 1}</div>
        <div style={{ fontSize: 19, color: "#fff", lineHeight: 1.55, fontWeight: 600 }}>{card}</div>
      </div>
      {/* Action row */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={pass} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>😭 Pass</button>
        <button onClick={next} style={{ flex: 2, ...btn(isTruth ? "#1D4ED8" : "#DC2626"), fontSize: 15, fontWeight: 800 }}>Next Card →</button>
        <button onClick={() => { setMode(null); setCardState(null); }} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", fontFamily: font }}>Switch</button>
      </div>
      <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>🃏 {discarded.length} used · {passed} passed</div>
    </Modal>
  );
}

function NeverHaveI({ onClose }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * NEVER_HAVE_I.length));
  const [scores, setScores] = useState({});
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [roundHave, setRoundHave] = useState({}); // who tapped "I HAVE" this round
  const [revealed, setRevealed] = useState(false);

  const addPlayer = () => { if (newPlayer.trim() && !players.includes(newPlayer.trim())) { setPlayers(p => [...p, newPlayer.trim()]); setNewPlayer(""); } };
  const toggleHave = (name) => setRoundHave(r => ({ ...r, [name]: !r[name] }));
  const reveal = () => {
    setRevealed(true);
    Object.entries(roundHave).forEach(([name, has]) => { if (has) setScores(s => ({ ...s, [name]: (s[name] || 0) + 1 })); });
  };
  const next = () => { setIdx(i => (i + 1) % NEVER_HAVE_I.length); setRoundHave({}); setRevealed(false); };

  // Table layout: place avatars in a circle around the statement card
  const tablePositions = (count) => {
    const r = 88; // radius
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * 2 * Math.PI - Math.PI / 2;
      return { x: 50 + Math.cos(a) * (r * 0.9), y: 50 + Math.sin(a) * r * 0.72 };
    });
  };

  if (players.length < 2) return (
    <Modal onClose={onClose} emoji="🙅" title="Never Have I Ever">
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 14, fontSize: 13, textAlign: "center" }}>Sit in a circle — add everyone playing</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={newPlayer} onChange={e => setNewPlayer(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()} placeholder="Player name" style={{ ...inp, flex: 1 }} />
        <button onClick={addPlayer} style={{ ...btn("#059669"), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {players.map(p => <span key={p} style={{ background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.4)", color: "#34D399", padding: "5px 12px", borderRadius: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{p} <span onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ cursor: "pointer", opacity: 0.5 }}>✕</span></span>)}
      </div>
      {players.length >= 2 && <button onClick={next} style={btn("#059669")}>Start →</button>}
    </Modal>
  );

  const positions = tablePositions(players.length);
  const haveCount = Object.values(roundHave).filter(Boolean).length;

  return (
    <Modal onClose={onClose} emoji="🙅" title="Never Have I Ever">
      {/* Statement */}
      <div style={{ background: "rgba(5,150,105,0.15)", border: "2px solid rgba(5,150,105,0.4)", borderRadius: 18, padding: "20px 18px", textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>Never Have I Ever…</div>
        <div style={{ fontSize: 17, color: "#fff", lineHeight: 1.5, fontWeight: 600 }}>{NEVER_HAVE_I[idx]}</div>
      </div>

      {/* Virtual round table */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "70%", marginBottom: 10, overflow: "visible" }}>
        {/* Table surface */}
        <div style={{ position: "absolute", left: "15%", top: "10%", width: "70%", height: "80%", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(5,150,105,0.12),rgba(5,150,105,0.04))", border: "2px solid rgba(5,150,105,0.2)" }} />
        {/* Player tokens around table */}
        {players.map((p, i) => {
          const pos = positions[i];
          const has = roundHave[p];
          const raised = revealed && has;
          const notHave = revealed && !has;
          return (
            <div key={p} onClick={() => !revealed && toggleHave(p)}
              style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: revealed ? "default" : "pointer", userSelect: "none" }}>
              {/* Avatar circle */}
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: has ? "rgba(5,150,105,0.6)" : "rgba(255,255,255,0.1)", border: `2.5px solid ${has ? "#34D399" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", transition: "all 0.2s", transform: raised ? "translateY(-8px) scale(1.15)" : notHave ? "scale(0.9)" : "scale(1)", boxShadow: raised ? "0 8px 20px rgba(5,150,105,0.5)" : "none" }}>
                {has && !revealed ? "✋" : p[0].toUpperCase()}
              </div>
              {/* Hand raised */}
              {raised && <div style={{ fontSize: 14, animation: "none" }}>✋</div>}
              <div style={{ fontSize: 9, fontWeight: 700, color: has ? "#34D399" : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.04em", maxWidth: 52, textAlign: "center", lineHeight: 1.1 }}>{p}</div>
              {revealed && <div style={{ fontSize: 10, fontWeight: 800, color: has ? "#34D399" : "rgba(255,255,255,0.3)" }}>{scores[p] || 0} pts</div>}
            </div>
          );
        })}
        {/* Centre label */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          {!revealed ? (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{haveCount > 0 ? `${haveCount} tapped` : "Tap if you HAVE"}</div>
          ) : (
            <div style={{ fontSize: 13, fontWeight: 800, color: "#34D399" }}>+{haveCount} pts each</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!revealed ? (
          <button onClick={reveal} style={{ flex: 1, ...btn("#059669"), fontSize: 15 }}>Reveal! 👀</button>
        ) : (
          <button onClick={next} style={{ flex: 1, ...btn("#059669"), fontSize: 15 }}>Next →</button>
        )}
      </div>
    </Modal>
  );
}

function WouldYouRather({ onClose }) {
  const [pair, setPair] = useState(() => rand(WOULD_YOU_RATHER));
  const [pick, setPick] = useState(null);
  const [votes, setVotes] = useState({ a: 0, b: 0 });
  const [revealed, setRevealed] = useState(false);

  const vote = (side) => {
    if (pick) return;
    setPick(side);
    setVotes(v => ({ ...v, [side]: v[side] + 1 }));
  };
  const next = () => { setPair(rand(WOULD_YOU_RATHER)); setPick(null); setVotes({ a: 0, b: 0 }); setRevealed(false); };
  const total = votes.a + votes.b;
  const aPct = total ? Math.round((votes.a / total) * 100) : 50;
  const bPct = 100 - aPct;

  return (
    <Modal onClose={onClose} emoji="🤷" title="Would You Rather">
      {/* OR divider */}
      <div style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginBottom: 10 }}>— WOULD YOU RATHER —</div>

      {/* Two giant cards side by side */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, height: 170 }}>
        {[["a","#2563EB","#1E3A8A","👈"], ["b","#7C3AED","#4C1D95","👉"]].map(([side, acc, dark, ico]) => (
          <button key={side} onClick={() => vote(side)} style={{ flex: 1, background: pick === side ? `linear-gradient(160deg,${dark},${acc})` : pick && pick !== side ? "rgba(255,255,255,0.03)" : `linear-gradient(160deg,rgba(15,10,5,0.9),${dark}80)`, border: `2.5px solid ${pick === side ? acc : pick && pick !== side ? "rgba(255,255,255,0.06)" : acc + "50"}`, borderRadius: 20, cursor: pick ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 14, gap: 8, opacity: pick && pick !== side ? 0.45 : 1, transition: "all 0.25s", fontFamily: font }}>
            <span style={{ fontSize: 28 }}>{ico}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: pick === side ? "#fff" : "rgba(255,255,255,0.8)", lineHeight: 1.3, textAlign: "center" }}>{pair[side]}</span>
            {pick === side && <span style={{ fontSize: 10, fontWeight: 800, color: acc, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your pick ✓</span>}
          </button>
        ))}
      </div>

      {/* Vote crowd bar */}
      {pick && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", height: 32 }}>
            <div style={{ width: `${aPct}%`, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800, transition: "width 0.5s" }}>{aPct > 20 ? `${aPct}%` : ""}</div>
            <div style={{ flex: 1, background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800 }}>{bPct > 20 ? `${bPct}%` : ""}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 13, color: "#CCAB4A", marginTop: 8, fontWeight: 700 }}>Now defend your answer! 🗣️</div>
        </div>
      )}

      <button onClick={next} style={btn("#C47A2E")}>Next →</button>
    </Modal>
  );
}

function HotTakes({ onClose }) {
  const [takes, setTakes] = useState([{ id: Date.now(), text: rand(HOT_TAKES), reactions: {} }]);
  const [agreed, setAgreed] = useState({});
  const [temp, setTemp] = useState(0); // -100 to 100

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
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: `${Math.abs(temp) / 2}%`, background: tempColor, borderRadius: 4, transition: "all 0.4s", transform: temp >= 0 ? "none" : "translateX(-100%)", transformOrigin: temp >= 0 ? "left" : "right" }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: tempColor, minWidth: 100, textAlign: "right" }}>{tempLabel}</div>
      </div>

      {/* Takes as speech bubbles */}
      {takes.slice(0, 3).map((take, idx) => (
        <div key={take.id} style={{ background: idx === 0 ? "linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.08))" : "rgba(255,255,255,0.04)", border: `1.5px solid ${idx === 0 ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 18, padding: "18px 16px", marginBottom: 10, position: "relative" }}>
          {/* Speech bubble tail */}
          {idx === 0 && <div style={{ position: "absolute", bottom: -8, left: 20, width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid rgba(239,68,68,0.5)" }} />}
          <div style={{ fontSize: idx === 0 ? 16 : 13, color: idx === 0 ? "#fff" : "rgba(255,255,255,0.55)", lineHeight: 1.45, marginBottom: 12, fontWeight: idx === 0 ? 600 : 400 }}>{take.text}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["🔥", "#EF4444"], ["💀", "#8B5CF6"], ["👎", "#3B82F6"]].map(([emoji, col]) => (
              <button key={emoji} onClick={() => react(take.id, emoji)} style={{ padding: "5px 12px", borderRadius: 100, border: `1.5px solid ${agreed[`${take.id}-${emoji}`] ? col : "rgba(255,255,255,0.12)"}`, background: agreed[`${take.id}-${emoji}`] ? col + "30" : "transparent", color: agreed[`${take.id}-${emoji}`] ? col : "rgba(255,255,255,0.4)", fontSize: 13, cursor: agreed[`${take.id}-${emoji}`] ? "default" : "pointer", fontFamily: font, fontWeight: 700 }}>
                {emoji} {take.reactions[emoji] || 0}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button onClick={addTake} style={btn("#EF4444")}>🌶️ Next Hot Take</button>
    </Modal>
  );
}

function SpinBottle({ onClose }) {
  const [players, setPlayers] = useState([]);
  const [newP, setNewP] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [angle, setAngle] = useState(0);
  const [spotlightIdx, setSpotlightIdx] = useState(null);

  const addP = () => { if (newP.trim() && !players.includes(newP.trim())) { setPlayers(p => [...p, newP.trim()]); setNewP(""); } };
  const spin = () => {
    if (players.length < 2) return;
    setSpinning(true); setResult(null); setSpotlightIdx(null);
    const extra = 1440 + Math.random() * 720;
    const targetIdx = Math.floor(Math.random() * players.length);
    // Spin so bottle points at targetIdx
    const sliceDeg = 360 / players.length;
    const targetAngle = extra + targetIdx * sliceDeg;
    setAngle(a => a + extra);
    setTimeout(() => {
      setSpinning(false);
      setResult(players[targetIdx]);
      setSpotlightIdx(targetIdx);
    }, 3000);
  };

  // Position players around a circle
  const radius = 110;
  const cx = 140, cy = 140;
  const playerPositions = players.map((_, i) => {
    const a = (i / players.length) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
  });

  if (players.length < 2) return (
    <Modal onClose={onClose} emoji="🍾" title="Spin the Bottle">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14, textAlign: "center" }}>Add players — they'll sit in a circle around the bottle</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={newP} onChange={e => setNewP(e.target.value)} onKeyDown={e => e.key === "Enter" && addP()} placeholder="Add a name" style={{ ...inp, flex: 1 }} />
        <button onClick={addP} style={{ ...btn("#C47A2E"), width: "auto", padding: "10px 16px" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {players.map(p => <span key={p} style={{ background: "rgba(196,122,46,0.2)", border: "1px solid rgba(196,122,46,0.4)", color: "#E5C97A", padding: "5px 12px", borderRadius: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{p}<span onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ cursor: "pointer", opacity: 0.6 }}>✕</span></span>)}
      </div>
      {players.length >= 2 && <button onClick={spin} style={btn("#C47A2E")}>Start →</button>}
    </Modal>
  );

  return (
    <Modal onClose={onClose} emoji="🍾" title="Spin the Bottle">
      {/* Player circle + bottle SVG */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <svg width={280} height={280} style={{ overflow: "visible" }}>
          {/* Floor circle */}
          <ellipse cx={cx} cy={cy} rx={116} ry={116} fill="rgba(196,122,46,0.07)" stroke="rgba(196,122,46,0.2)" strokeWidth={1.5} />

          {/* Player avatars */}
          {players.map((p, i) => {
            const pos = playerPositions[i];
            const isSpotlit = spotlightIdx === i;
            return (
              <g key={p} transform={`translate(${pos.x},${pos.y})`}>
                {/* Spotlight glow */}
                {isSpotlit && <circle r={26} fill="rgba(251,191,36,0.25)" />}
                <circle r={18} fill={isSpotlit ? "#FBBF24" : "rgba(255,255,255,0.12)"} stroke={isSpotlit ? "#FBBF24" : "rgba(255,255,255,0.2)"} strokeWidth={2} />
                <text x={0} y={6} textAnchor="middle" fontSize={13} fontWeight={900} fill={isSpotlit ? "#1a0a00" : "#fff"}>{p[0].toUpperCase()}</text>
                <text x={0} y={36} textAnchor="middle" fontSize={8} fontWeight={700} fill={isSpotlit ? "#FBBF24" : "rgba(255,255,255,0.45)"}>{p.slice(0,8)}</text>
              </g>
            );
          })}

          {/* Bottle */}
          <g transform={`translate(${cx},${cy})`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
            {/* Bottle body */}
            <g transform={`rotate(${angle})`} style={{ transition: spinning ? "transform 3s cubic-bezier(0.15,0.6,0.1,1)" : "none" }}>
              {/* Neck */}
              <rect x={-4} y={-90} width={8} height={40} rx={4} fill="url(#bottleGrad)" />
              {/* Body */}
              <ellipse cx={0} cy={-32} rx={14} ry={22} fill="url(#bottleGrad)" />
              {/* Bottom */}
              <ellipse cx={0} cy={10} rx={14} ry={8} fill="url(#bottleGrad2)" />
              {/* Cap */}
              <rect x={-5} y={-95} width={10} height={8} rx={2} fill="#8B4513" />
            </g>
            {/* Centre pivot */}
            <circle r={6} fill="#C47A2E" />
          </g>

          <defs>
            <linearGradient id="bottleGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2D6A2D" />
              <stop offset="40%" stopColor="#4CAF50" />
              <stop offset="100%" stopColor="#1B4B1B" />
            </linearGradient>
            <linearGradient id="bottleGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3A7A3A" />
              <stop offset="100%" stopColor="#1B4B1B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Result banner */}
      {result && !spinning && (
        <div style={{ textAlign: "center", padding: "14px", background: "rgba(251,191,36,0.15)", border: "2px solid rgba(251,191,36,0.4)", borderRadius: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#FBBF24", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>🎯 The bottle chose…</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{result}!</div>
        </div>
      )}

      <button onClick={spin} disabled={spinning} style={{ ...btn("#C47A2E"), fontSize: 17, fontWeight: 900 }}>
        {spinning ? "Spinning…" : result ? "Spin Again 🍾" : "SPIN! 🍾"}
      </button>
      {/* Add more players */}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input value={newP} onChange={e => setNewP(e.target.value)} onKeyDown={e => e.key === "Enter" && addP()} placeholder="Add player…" style={{ ...inp, flex: 1, fontSize: 13 }} />
        <button onClick={addP} style={{ ...btn("#C47A2E"), width: "auto", padding: "8px 12px", fontSize: 13 }}>+</button>
      </div>
    </Modal>
  );
}

function Charades({ onClose }) {
  const cats = { bollywood: "🎬 Bollywood", webshows: "📺 Web Shows", celebs: "🌟 Celebs", memesphrases: "😂 Memes & Phrases" };
  const [cat, setCat] = useState(null);
  const [word, setWord] = useState(null);
  const [timer, setTimer] = useState(60);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]); // film strip
  const [score, setScore] = useState({ correct: 0, skip: 0 });
  const timerRef = useRef(null);

  const startRound = (c, w) => {
    setRunning(true); setTimer(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); setRunning(false); return 0; } return t - 1; }), 1000);
  };
  const pick = (c) => { const w = rand(CHARADES[c]); setCat(c); setWord(w); startRound(c, w); };
  const correct = () => {
    setScore(s => ({ ...s, correct: s.correct + 1 }));
    setHistory(h => [{ word, result: "correct" }, ...h.slice(0, 5)]);
    const w = rand(CHARADES[cat]); setWord(w); startRound(cat, w);
  };
  const skip = () => {
    setScore(s => ({ ...s, skip: s.skip + 1 }));
    setHistory(h => [{ word, result: "skip" }, ...h.slice(0, 5)]);
    const w = rand(CHARADES[cat]); setWord(w); startRound(cat, w);
  };
  useEffect(() => () => clearInterval(timerRef.current), []);

  if (!cat) return (
    <Modal onClose={onClose} emoji="🎭" title="Dumb Charades">
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16, textAlign: "center" }}>Pick a category — actor takes centre stage</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Object.entries(cats).map(([k, v]) => (
          <button key={k} onClick={() => pick(k)} style={{ background: "rgba(196,122,46,0.12)", border: "1.5px solid rgba(196,122,46,0.4)", borderRadius: 14, padding: "16px 18px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
            <span style={{ fontSize: 24 }}>{v.split(" ")[0]}</span>
            <span>{v.split(" ").slice(1).join(" ")}</span>
          </button>
        ))}
      </div>
    </Modal>
  );

  const timerPct = (timer / 60) * 100;
  const timerColor = timer > 20 ? "#34D399" : timer > 8 ? "#F59E0B" : "#EF4444";

  return (
    <Modal onClose={onClose} emoji="🎭" title="Dumb Charades" wide>
      {/* Stage */}
      <div style={{ background: "linear-gradient(180deg,#0a0505 0%,#1a0a05 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "0 0 16px", marginBottom: 12, overflow: "hidden" }}>
        {/* Stage lights */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "0 20px", marginBottom: -8 }}>
          {[0,1,2,3,4].map(i => <div key={i} style={{ width: 8, height: 28, background: `linear-gradient(180deg,#FBBF24,transparent)`, borderRadius: "0 0 4px 4px", opacity: 0.6 + (i % 2) * 0.3 }} />)}
        </div>
        {/* Stage floor strip */}
        <div style={{ height: 4, background: "linear-gradient(90deg,transparent,#FBBF2460,#FBBF24,#FBBF2460,transparent)", marginBottom: 16 }} />

        {/* Category + timer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "#CCAB4A", fontWeight: 700 }}>{cats[cat]}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: 3, transition: "width 1s linear, background 0.3s" }} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: timerColor, minWidth: 36, textAlign: "right" }}>{timer}s</span>
          </div>
        </div>

        {/* Word — hidden from actor but visible to audience */}
        <div style={{ margin: "0 16px", background: "rgba(255,255,255,0.06)", border: "2px solid rgba(196,122,46,0.4)", borderRadius: 16, padding: "28px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, letterSpacing: "0.1em" }}>🎭 ACTOR ACTS THIS OUT</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "0.02em" }}>{word}</div>
        </div>

        {/* Score */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12, fontSize: 12 }}>
          <span style={{ color: "#34D399", fontWeight: 700 }}>✓ {score.correct} correct</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>↩ {score.skip} skipped</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={skip} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>↩ Skip</button>
        <button onClick={correct} style={{ flex: 2, ...btn("#22C55E"), fontSize: 16, fontWeight: 900 }}>✓ Correct!</button>
        <button onClick={() => { setCat(null); setWord(null); clearInterval(timerRef.current); setRunning(false); setScore({ correct: 0, skip: 0 }); setHistory([]); }} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer", fontFamily: font }}>Change</button>
      </div>

      {/* Film strip history */}
      {history.length > 0 && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {history.map((h, i) => (
            <div key={i} style={{ flexShrink: 0, background: h.result === "correct" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${h.result === "correct" ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "6px 10px", textAlign: "center", minWidth: 70 }}>
              <div style={{ fontSize: 14 }}>{h.result === "correct" ? "✓" : "↩"}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 2, lineHeight: 1.2 }}>{h.word.slice(0, 12)}</div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function Bingo({ onClose }) {
  const [card] = useState(() => shuffle(BINGO_SQUARES).slice(0, 25));
  const [marked, setMarked] = useState({ 12: true });
  const [bingo, setBingo] = useState(false);
  const [bingoLine, setBingoLine] = useState([]);
  const [justStamped, setJustStamped] = useState(null);

  const ROWS = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]];
  const COLS = [[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24]];
  const DIAGS = [[0,6,12,18,24],[4,8,12,16,20]];
  const LINES = [...ROWS, ...COLS, ...DIAGS];

  const toggle = (i) => {
    if (i === 12) return;
    const next = { ...marked, [i]: !marked[i] };
    setMarked(next);
    setJustStamped(i);
    setTimeout(() => setJustStamped(null), 500);
    const wonLine = LINES.find(line => line.every(j => next[j]));
    if (wonLine) { setBingo(true); setBingoLine(wonLine); }
    else { setBingo(false); setBingoLine([]); }
  };

  const markedCount = Object.values(marked).filter(Boolean).length;

  return (
    <Modal onClose={onClose} emoji="🎱" title="Party Bingo" wide>
      {/* Physical card */}
      <div style={{ background: "#FFFBEB", borderRadius: 16, padding: 12, marginBottom: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
        {/* Card header */}
        <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
          {["B","I","N","G","O"].map((l, i) => (
            <div key={l} style={{ flex: 1, textAlign: "center", fontWeight: 900, fontSize: 18, color: ["#EF4444","#F97316","#3B82F6","#22C55E","#8B5CF6"][i], letterSpacing: "0.05em", fontFamily: "'Syne', sans-serif" }}>{l}</div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 3 }}>
          {card.map((sq, i) => {
            const isMarked = marked[i];
            const isCenter = i === 12;
            const inWinLine = bingoLine.includes(i);
            const isStamping = justStamped === i;
            return (
              <div key={i} onClick={() => toggle(i)} style={{ aspectRatio: "1", background: isCenter ? "#C47A2E" : inWinLine ? "#FEF08A" : "#FFFBEB", border: `1.5px solid ${inWinLine ? "#CA8A04" : "#E5D5A0"}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", padding: 3, cursor: isCenter ? "default" : "pointer", position: "relative", overflow: "hidden", transform: isStamping ? "scale(0.92)" : "scale(1)", transition: "transform 0.15s" }}>
                {/* Ink stamp overlay */}
                {isMarked && !isCenter && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                    <div style={{ width: "78%", height: "78%", borderRadius: "50%", background: "rgba(220,38,38,0.85)", border: "2.5px solid rgba(180,20,20,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 14, color: "#fff", fontWeight: 900 }}>✓</span>
                    </div>
                  </div>
                )}
                {isCenter && <span style={{ fontSize: 16, color: "#fff", fontWeight: 900, position: "relative", zIndex: 1 }}>★</span>}
                <span style={{ fontSize: 8, color: isMarked || isCenter ? "transparent" : "#5C4A1E", textAlign: "center", lineHeight: 1.15, fontWeight: 600 }}>{sq}</span>
              </div>
            );
          })}
        </div>
        {/* Progress */}
        <div style={{ textAlign: "center", fontSize: 11, color: "#7C5B2A", marginTop: 8, fontWeight: 600 }}>{markedCount - 1} / 24 stamped</div>
      </div>

      {/* BINGO banner */}
      {bingo && (
        <div style={{ textAlign: "center", background: "linear-gradient(135deg,#FBBF24,#F59E0B)", borderRadius: 14, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "0.1em", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>🎉 BINGO!</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>You got it! Show your card!</div>
        </div>
      )}

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>Tap squares you've seen happen at the party · 5 in a row wins!</p>
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
      {/* Clipboard visual */}
      <div style={{ position:"relative", marginBottom:4 }}>
        {/* Metal clip */}
        <div style={{ width:68, height:24, background:"linear-gradient(180deg,#9CA3AF,#6B7280)", borderRadius:"6px 6px 0 0", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.5)", position:"relative", zIndex:2 }}>
          <div style={{ width:32, height:14, background:"linear-gradient(180deg,#E5E7EB,#D1D5DB)", borderRadius:4, border:"2px solid #9CA3AF", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:20, height:4, background:"rgba(0,0,0,0.15)", borderRadius:2 }} />
          </div>
        </div>
        {/* Clipboard board edge */}
        <div style={{ height:10, background:"linear-gradient(180deg,#8B6914,#A0782A)", borderRadius:"2px 2px 0 0", margin:"0 2px", position:"relative", zIndex:1 }} />
        {/* Paper area */}
        <div style={{ background:"linear-gradient(180deg,#FFFBEB 0%,#FFF9E0 100%)", borderRadius:"0 0 10px 10px", padding:"18px 16px 16px", boxShadow:"0 6px 20px rgba(0,0,0,0.35)", position:"relative", overflow:"hidden" }}>
          {/* Red margin line */}
          <div style={{ position:"absolute", left:38, top:0, bottom:0, width:1.5, background:"rgba(239,68,68,0.28)", pointerEvents:"none", zIndex:0 }} />
          <div style={{ fontSize:12, color:"#78716C", marginBottom:14, textAlign:"center", fontStyle:"italic", fontFamily:"Georgia,serif", position:"relative", zIndex:1 }}>Pick a template to get started</div>
          {Object.entries(TEMPLATES).map(([key, tpl]) => (
            <button key={key} onClick={() => loadTemplate(key)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background:'rgba(0,0,0,0.04)', border:'1px solid rgba(0,0,0,0.1)', borderRadius:8, padding:'11px 14px 11px 52px', color:'#1C1917', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif', marginBottom:8, position:'relative', zIndex:1, boxSizing:'border-box', textAlign:'left' }}>
              <span>{tpl.label}</span><span style={{ fontSize:11, color:'rgba(0,0,0,0.38)', fontWeight:400 }}>{tpl.items.length} items →</span>
            </button>
          ))}
          <button onClick={() => persist([])} style={{ width:'100%', background:'transparent', border:'1px dashed rgba(0,0,0,0.18)', borderRadius:8, padding:'10px', color:'rgba(0,0,0,0.38)', fontSize:12, cursor:'pointer', fontFamily:'Georgia,serif', marginTop:4, boxSizing:'border-box', position:'relative', zIndex:1 }}>Start blank →</button>
        </div>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} emoji="📋" title="Party Checklist" wide>
      {/* Progress bar */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.45)' }}>Progress</span>
          <span style={{ fontSize:12, fontWeight:700, color: done===total&&total>0?'#22c55e':'rgba(255,255,255,0.6)' }}>{done} / {total} done</span>
        </div>
        <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${total?done/total*100:0}%`, background: done===total&&total>0?'linear-gradient(90deg,#22c55e,#16a34a)':'linear-gradient(90deg,#C47A2E,#E5A84A)', borderRadius:3, transition:'width 0.3s' }} />
        </div>
      </div>

      {/* Clipboard paper */}
      {CATS.map(cat => {
        const catItems = savedItems.filter(it => it.cat === cat.id);
        if (!catItems.length) return null;
        return (
          <div key={cat.id} style={{ marginBottom:14 }}>
            {/* Section header */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
              <div style={{ height:1.5, width:10, background:cat.color+'66', borderRadius:2 }} />
              <span style={{ fontSize:10, fontWeight:800, color:cat.color, textTransform:'uppercase', letterSpacing:'0.1em' }}>{cat.label} ({catItems.length})</span>
              <div style={{ height:1.5, flex:1, background:cat.color+'22', borderRadius:2 }} />
            </div>
            {/* Cream notebook paper */}
            <div style={{ background:'linear-gradient(180deg,#FFFBEB,#FFF9E0)', borderRadius:10, overflow:'hidden', boxShadow:'0 3px 12px rgba(0,0,0,0.25)', position:'relative' }}>
              <div style={{ position:'absolute', left:40, top:0, bottom:0, width:1.5, background:'rgba(239,68,68,0.28)', pointerEvents:'none', zIndex:0 }} />
              {catItems.map((it, idx) => (
                <div key={it.id} onClick={() => toggleDone(it.id)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px 9px 56px', cursor:'pointer', borderBottom:idx<catItems.length-1?'1px solid rgba(0,0,0,0.07)':undefined, background:it.done?'rgba(34,197,94,0.06)':'transparent', transition:'background 0.15s', position:'relative', zIndex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:16, height:16, borderRadius:3, border:`2px solid ${it.done?cat.color:'rgba(0,0,0,0.22)'}`, background:it.done?cat.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                      {it.done && <span style={{ color:'#fff', fontSize:9, fontWeight:900, lineHeight:1 }}>✓</span>}
                    </div>
                    <span style={{ color:it.done?'rgba(0,0,0,0.28)':'#1C1917', fontSize:13, textDecoration:it.done?'line-through':'none', fontFamily:'Georgia,serif' }}>{it.name}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <input value={it.person} onClick={e=>e.stopPropagation()} onChange={e => { e.stopPropagation(); updatePerson(it.id, e.target.value); }} placeholder="Who?" style={{ width:64, background:'rgba(0,0,0,0.05)', border:'1px solid rgba(0,0,0,0.12)', borderRadius:5, padding:'3px 7px', color:'#6B7280', fontSize:11, fontFamily:font, outline:'none', textAlign:'center' }} />
                    <button onClick={e => { e.stopPropagation(); persist(savedItems.filter(x=>x.id!==it.id)); }} style={{ background:'none', border:'none', color:'rgba(0,0,0,0.2)', cursor:'pointer', fontSize:16, lineHeight:1, padding:'0 2px' }}>×</button>
                  </div>
                </div>
              ))}
            </div>
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
          {settlements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ color: "#34D399", fontWeight: 700, fontSize: 15 }}>All settled up!</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>No payments needed</div>
            </div>
          ) : (
            <div style={{ background:"#FFFBEB", borderRadius:14, padding:"18px 16px 14px", boxShadow:"0 4px 20px rgba(0,0,0,0.3)", fontFamily:"'Courier New',monospace", position:"relative" }}>
              {/* Receipt notch */}
              <div style={{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", width:40, height:8, background:"#0F0A05", borderRadius:"0 0 8px 8px" }} />
              <div style={{ textAlign:"center", paddingTop:8, borderBottom:"1px dashed rgba(0,0,0,0.18)", paddingBottom:12, marginBottom:12 }}>
                <div style={{ fontSize:8, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:2 }}>Settlement Receipt</div>
                <div style={{ fontSize:18, fontWeight:900, color:"#111827" }}>💸 Who Pays Who</div>
                <div style={{ fontSize:10, color:"#9CA3AF", marginTop:3 }}>Total: ₹{grandTotal.toLocaleString()} · {settlements.length} payment{settlements.length !== 1 ? "s" : ""}</div>
              </div>
              {settlements.map(t => {
                const done = settled.has(t.key);
                return (
                  <div key={t.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid rgba(0,0,0,0.08)", opacity:done?0.45:1 }}>
                    <div>
                      <span style={{ fontSize:13, fontWeight:700, color:"#DC2626" }}>{t.from}</span>
                      <span style={{ color:"#9CA3AF", margin:"0 7px", fontSize:12 }}>→</span>
                      <span style={{ fontSize:13, fontWeight:700, color:"#16A34A" }}>{t.to}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontWeight:900, color:"#111827", fontSize:16 }}>₹{t.amount.toLocaleString()}</span>
                      <button
                        onClick={() => setSettled(prev => { const s = new Set(prev); done ? s.delete(t.key) : s.add(t.key); return s; })}
                        style={{ fontSize:10, padding:"3px 10px", borderRadius:20, border:`1.5px solid ${done?"#16A34A":"rgba(0,0,0,0.2)"}`, background:done?"rgba(22,163,74,0.12)":"transparent", color:done?"#16A34A":"rgba(0,0,0,0.45)", cursor:"pointer", fontFamily:"'Courier New',monospace", fontWeight:700 }}
                      >
                        {done ? "✓ Paid" : "Pay"}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div style={{ textAlign:"center", marginTop:12, fontSize:9, color:"rgba(0,0,0,0.25)", letterSpacing:"0.18em" }}>TENDR · BILL SPLITTER</div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

function ThemePicker({ onClose }) {
  const [votes, setVotes] = useState({});
  const [myVote, setMyVote] = useState(null);
  const [winner, setWinner] = useState(null);

  const castVote = (name) => {
    if (myVote) setVotes(v => ({ ...v, [myVote]: Math.max(0, (v[myVote] || 0) - 1) }));
    setMyVote(name);
    setVotes(v => ({ ...v, [name]: (v[name] || 0) + 1 }));
  };
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...Object.values(votes), 1);
  const leadTheme = totalVotes > 0 ? Object.entries(votes).sort(([,a],[,b]) => b-a)[0]?.[0] : null;

  if (winner) {
    const t = THEME_DATA.find(x => x.name === winner) || THEME_DATA[0];
    return (
      <Modal onClose={onClose} emoji="🎨" title="Tonight's Theme!">
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{t.emoji}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: t.color }}>{t.name}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{t.mood}</div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px", marginTop: 20, textAlign: "left" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Dress Code</div>
            <div style={{ fontSize: 14, color: "#fff", marginBottom: 12 }}>{t.dress}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Music</div>
            <div style={{ fontSize: 14, color: "#fff" }}>{t.music}</div>
          </div>
          <button onClick={() => setWinner(null)} style={{ ...btn("rgba(255,255,255,0.1)"), marginTop: 16 }}>← Back to voting</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} emoji="🎨" title="Theme Picker" wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Pass the phone — vote for tonight's vibe!</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {THEME_DATA.map(t => {
          const v = votes[t.name] || 0;
          const pct = maxVotes > 0 ? v / maxVotes : 0;
          const isVoted = myVote === t.name;
          return (
            <button key={t.name} onClick={() => castVote(t.name)} style={{
              background: t.bg, borderRadius: 16, padding: "16px 12px",
              border: `2px solid ${isVoted ? t.color : "transparent"}`,
              cursor: "pointer", textAlign: "left", fontFamily: font,
              transform: `scale(${1 + pct * 0.06})`,
              transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.2s",
              boxShadow: isVoted ? `0 8px 24px ${t.color}44` : "0 4px 12px rgba(0,0,0,0.3)",
              position: "relative",
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{t.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{t.mood}</div>
              {v > 0 && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct * 100}%`, background: t.color, borderRadius: 2, transition: "width 0.4s" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>{v}</span>
                </div>
              )}
              {isVoted && <div style={{ position: "absolute", top: 8, right: 8, fontSize: 14 }}>✓</div>}
            </button>
          );
        })}
      </div>
      {leadTheme && totalVotes > 0 && (
        <button onClick={() => setWinner(leadTheme)} style={btn("#C47A2E")}>
          🏆 Reveal Winner: {leadTheme}
        </button>
      )}
    </Modal>
  );
}

function Countdown({ onClose }) {
  const [target, setTarget] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const intervalRef = useRef(null);

  const start = () => {
    if (!target) return;
    clearInterval(intervalRef.current);
    const tick = () => {
      const diff = new Date(target) - Date.now();
      if (diff <= 0) { setTimeLeft({ d:0, h:0, m:0, s:0 }); setCelebrating(true); clearInterval(intervalRef.current); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
  };
  useEffect(() => () => clearInterval(intervalRef.current), []);

  const FlipCard = ({ value, lbl }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "linear-gradient(180deg,#1a1208 50%,#0f0a05 50%)", borderRadius: 10, width: 64, height: 76, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 900, color: "#FBBF24", border: "2px solid rgba(196,122,46,0.4)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden", fontFamily: font, letterSpacing: "-0.03em" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1.5, background: "rgba(0,0,0,0.6)", zIndex: 2 }} />
        <span style={{ position: "relative", zIndex: 1 }}>{String(value).padStart(2, "0")}</span>
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</div>
    </div>
  );

  if (celebrating) return (
    <Modal onClose={onClose} emoji="⏱️" title="Countdown Timer">
      <div style={{ textAlign: "center", padding: "28px 0" }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#FBBF24" }}>Party Time!</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>The moment is here!</div>
        <button onClick={() => { setCelebrating(false); setTimeLeft(null); setTarget(""); }} style={{ ...btn("rgba(255,255,255,0.1)"), marginTop: 20 }}>Reset</button>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} emoji="⏱️" title="Countdown Timer">
      {!timeLeft ? (
        <>
          <label style={label}>Party Start Date & Time</label>
          <input type="datetime-local" value={target} onChange={e => setTarget(e.target.value)} style={{ ...inp, marginBottom: 12 }} />
          <button onClick={start} style={btn("#C47A2E")}>Start Countdown</button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "28px 0 16px" }}>
            {timeLeft.d > 0 && <FlipCard value={timeLeft.d} lbl="Days" />}
            <FlipCard value={timeLeft.h} lbl="Hours" />
            <FlipCard value={timeLeft.m} lbl="Min" />
            <FlipCard value={timeLeft.s} lbl="Sec" />
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>Party is coming… 🎊</div>
          <button onClick={() => { clearInterval(intervalRef.current); setTimeLeft(null); setTarget(""); }} style={btn("rgba(255,255,255,0.1)")}>Reset</button>
        </>
      )}
    </Modal>
  );
}

function PlaylistBuilder({ onClose }) {
  const [songs, setSongs] = useState([]);
  const [newSong, setNewSong] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [nowPlaying, setNowPlaying] = useState(null);
  const [reelAngle, setReelAngle] = useState(0);

  useEffect(() => {
    if (!nowPlaying) return;
    const id = setInterval(() => setReelAngle(a => a + 3), 50);
    return () => clearInterval(id);
  }, [nowPlaying]);

  const add = () => {
    if (!newSong.trim()) return;
    setSongs(s => [...s, { id: Date.now(), song: newSong.trim(), artist: newArtist.trim(), votes: 0 }].sort((a, b) => b.votes - a.votes));
    setNewSong(""); setNewArtist("");
  };
  const upvote = (id) => setSongs(s => s.map(x => x.id === id ? { ...x, votes: x.votes + 1 } : x).sort((a, b) => b.votes - a.votes));
  const remove = (id) => { setSongs(s => s.filter(x => x.id !== id)); if (nowPlaying === id) setNowPlaying(null); };
  const displaySong = songs.find(s => s.id === nowPlaying) || songs[0];

  return (
    <Modal onClose={onClose} emoji="🎵" title="Playlist Builder" wide>
      {/* Cassette deck */}
      <div style={{ background: "linear-gradient(145deg,#1a0f05,#0f0a03)", borderRadius: 20, padding: "18px 16px", marginBottom: 16, border: "2px solid rgba(196,122,46,0.25)" }}>
        <div style={{ background: "linear-gradient(135deg,#C47A2E,#9A621E)", borderRadius: 10, padding: "12px 14px", marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 2 }}>NOW PLAYING</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displaySong?.song || "Add your first song!"}</div>
          {displaySong?.artist && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{displaySong.artist}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {[0, 1].map(i => (
            <svg key={i} width="54" height="54" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="26" fill="#0a0602" stroke="rgba(196,122,46,0.3)" strokeWidth="2"/>
              <g transform={`rotate(${reelAngle + i * 60}, 28, 28)`}>
                {[0, 120, 240].map(a => <rect key={a} x="26" y="6" width="4" height="16" rx="2" fill="#C47A2E" transform={`rotate(${a} 28 28)`} opacity="0.8"/>)}
              </g>
              <circle cx="28" cy="28" r="7" fill="#1a0f05" stroke="rgba(196,122,46,0.4)" strokeWidth="1.5"/>
              <circle cx="28" cy="28" r="3" fill="#C47A2E" opacity="0.6"/>
            </svg>
          ))}
        </div>
      </div>
      <input value={newSong} onChange={e => setNewSong(e.target.value)} placeholder="Song name" style={{ ...inp, marginBottom: 8 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={newArtist} onChange={e => setNewArtist(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Artist (optional)" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...btn("#C47A2E"), width: "auto", padding: "10px 16px" }}>+ Add</button>
      </div>
      {songs.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13, padding: "20px 0" }}>No songs yet — start the queue!</div>}
      {songs.map((s, i) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: nowPlaying === s.id ? "rgba(196,122,46,0.15)" : "rgba(255,255,255,0.04)", borderRadius: 12, marginBottom: 7, border: `1.5px solid ${nowPlaying === s.id ? "rgba(196,122,46,0.4)" : "rgba(255,255,255,0.07)"}` }}>
          <div style={{ width: 22, textAlign: "center", fontSize: 11, color: i === 0 ? "#FBBF24" : "rgba(255,255,255,0.3)", fontWeight: 800 }}>{i === 0 ? "🔊" : `${i + 1}`}</div>
          <div onClick={() => setNowPlaying(np => np === s.id ? null : s.id)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.song}</div>
            {s.artist && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{s.artist}</div>}
          </div>
          <button onClick={() => upvote(s.id)} style={{ background: "rgba(196,122,46,0.15)", border: "none", borderRadius: 8, padding: "4px 9px", color: "#FBBF24", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>↑ {s.votes}</button>
          <button onClick={() => remove(s.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 15, padding: "0 2px" }}>✕</button>
        </div>
      ))}
      {songs.length > 0 && (
        <button onClick={() => copyLink(songs.map((s, i) => `${i + 1}. ${s.song}${s.artist ? ` — ${s.artist}` : ""}`).join("\n"))} style={{ ...btn("rgba(255,255,255,0.07)"), marginTop: 10 }}>📋 Copy Playlist</button>
      )}
    </Modal>
  );
}

function PartyReportCard({ onClose }) {
  const subjects = [
    { key: "dancefloor", label: "Dance Floor",      emoji: "💃", note: "Did they move or did the floor move?" },
    { key: "vibes",      label: "Overall Vibes",    emoji: "✨", note: "Atmosphere assessment" },
    { key: "music",      label: "Music Selection",  emoji: "🎵", note: "DJ skills evaluation" },
    { key: "food",       label: "Food & Drinks",    emoji: "🍕", note: "Caloric performance" },
    { key: "host",       label: "Host Behaviour",   emoji: "👑", note: "Leadership under pressure" },
    { key: "drama",      label: "Drama Generated",  emoji: "💀", note: "Entertainment value" },
    { key: "timeliness", label: "Leaving on Time",  emoji: "⏰", note: "Exit punctuality" },
  ];
  const gradeMap = { 5: "A+", 4: "A", 3: "B", 2: "C", 1: "D", 0: "—" };
  const gradeColor = { "A+": "#22C55E", A: "#34D399", B: "#FBBF24", C: "#F97316", D: "#EF4444", "—": "#6B7280" };
  const teacherLines = { "A+": "Outstanding! Exceeds all expectations.", A: "Excellent performance. Well done.", B: "Satisfactory. Room for improvement.", C: "Below average. Must try harder.", D: "Disappointing. See me after class.", "—": "Not yet assessed." };

  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [comment, setComment] = useState("");

  const allRated = subjects.every(s => ratings[s.key]);
  const overallGrade = allRated ? (() => {
    const avg = subjects.reduce((a, s) => a + ratings[s.key], 0) / subjects.length;
    return avg >= 4.5 ? "A+" : avg >= 4 ? "A" : avg >= 3 ? "B" : avg >= 2 ? "C" : "D";
  })() : null;

  if (submitted && overallGrade) return (
    <Modal onClose={onClose} emoji="📝" title="Party Report Card" wide>
      <div style={{ background: "#FFFBEB", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
        <div style={{ background: "#DC2626", padding: "14px 18px", textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Official Party Report Card</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 4 }}>ANNUAL ASSESSMENT</div>
        </div>
        <div style={{ padding: "16px 18px", background: "repeating-linear-gradient(transparent,transparent 27px,rgba(0,0,0,0.04) 27px,rgba(0,0,0,0.04) 28px)", position: "relative" }}>
          <div style={{ position: "absolute", left: 40, top: 0, bottom: 0, width: 1.5, background: "rgba(220,38,38,0.18)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingLeft: 22 }}>
            <div>
              <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Final Grade</div>
              <div style={{ fontSize: 38, fontWeight: 900, color: gradeColor[overallGrade], lineHeight: 1 }}>{overallGrade}</div>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${gradeColor[overallGrade]}`, display: "flex", alignItems: "center", justifyContent: "center", background: gradeColor[overallGrade] + "22" }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: gradeColor[overallGrade] }}>{overallGrade}</span>
            </div>
          </div>
          {subjects.map(s => {
            const g = gradeMap[ratings[s.key] || 0];
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0 6px 22px", borderBottom: "1px dashed rgba(0,0,0,0.07)" }}>
                <span style={{ fontSize: 13, minWidth: 20 }}>{s.emoji}</span>
                <span style={{ flex: 1, fontSize: 12, color: "#374151", fontFamily: "Georgia, serif" }}>{s.label}</span>
                <span style={{ fontSize: 9, color: "#9CA3AF", fontStyle: "italic", flexShrink: 0, maxWidth: 90, textAlign: "right" }}>{s.note}</span>
                <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: gradeColor[g], borderRadius: 6, fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0, marginLeft: 6 }}>{g}</span>
              </div>
            );
          })}
          <div style={{ padding: "12px 0 0 22px", marginTop: 6 }}>
            <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Teacher's Comment</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#1F2937", fontStyle: "italic", lineHeight: 1.7 }}>{comment || teacherLines[overallGrade]}</div>
            <div style={{ marginTop: 14, borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 9, color: "#9CA3AF" }}>Signed: The Host</div>
              <div style={{ fontSize: 9, color: "#9CA3AF", fontStyle: "italic" }}>{new Date().toLocaleDateString("en-IN")}</div>
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => { setSubmitted(false); setRatings({}); setComment(""); }} style={{ ...btn("rgba(255,255,255,0.08)"), marginTop: 16 }}>Fill Again</button>
    </Modal>
  );

  return (
    <Modal onClose={onClose} emoji="📝" title="Party Report Card" wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Rate the party honestly — it's for science.</p>
      {subjects.map(s => (
        <div key={s.key} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 13, color: "#fff" }}>{s.emoji} {s.label}</div>
            {ratings[s.key] && <span style={{ fontSize: 16, fontWeight: 900, color: gradeColor[gradeMap[ratings[s.key]]] }}>{gradeMap[ratings[s.key]]}</span>}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRatings(r => ({ ...r, [s.key]: n }))} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${ratings[s.key] >= n ? "#C47A2E" : "rgba(255,255,255,0.12)"}`, background: ratings[s.key] >= n ? "rgba(196,122,46,0.3)" : "rgba(255,255,255,0.04)", color: ratings[s.key] >= n ? "#FBBF24" : "rgba(255,255,255,0.3)", fontSize: 14, cursor: "pointer" }}>★</button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Teacher's Special Comment (optional)</div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="What would Mrs Sharma say about this night..." style={{ ...inp, minHeight: 56, resize: "vertical" }} />
      </div>
      <button onClick={() => setSubmitted(true)} disabled={!allRated} style={{ ...btn("#C47A2E"), opacity: allRated ? 1 : 0.45 }}>Generate Report Card 📝</button>
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
  const [players, setPlayers] = useState([]);
  const [input, setInput]     = useState("");
  const [promptIdx, setPromptIdx] = useState(() => Math.floor(Math.random() * MOST_LIKELY_TO.length));
  const [votes, setVotes]     = useState({});
  const [phase, setPhase]     = useState("setup");
  const [history, setHistory] = useState([]);

  const prompt = MOST_LIKELY_TO[promptIdx % MOST_LIKELY_TO.length];
  const addPlayer = () => { const n = input.trim(); if (n && !players.includes(n)) { setPlayers(p => [...p, n]); setInput(""); } };
  const vote = (name) => setVotes(v => ({ ...v, [prompt]: name }));
  const reveal = () => { setHistory(h => [...h, { prompt, winner: votes[prompt] }]); setPhase("result"); };
  const next = () => { setPromptIdx(i => i + 1); setPhase("voting"); };

  if (phase === "setup") return (
    <Modal onClose={onClose} emoji="🎲" title="Most Likely To" wide>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Add everyone playing, then vote on each prompt together.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()} placeholder="Add player name…" style={{ ...inp, flex: 1 }} />
        <button onClick={addPlayer} style={{ ...btn("#C47A2E"), width: "auto", padding: "10px 18px" }}>+</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {players.map(p => (
          <span key={p} style={{ background: "rgba(196,122,46,0.15)", border: "1px solid rgba(196,122,46,0.3)", color: "#fff", padding: "5px 14px", borderRadius: 100, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            {p}<button onClick={() => setPlayers(pl => pl.filter(x => x !== p))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0, fontSize: 15 }}>×</button>
          </span>
        ))}
      </div>
      {players.length >= 2
        ? <button onClick={() => setPhase("voting")} style={btn("#C47A2E")}>Start Voting →</button>
        : <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>Add at least 2 players to begin</div>
      }
    </Modal>
  );

  if (phase === "voting") return (
    <Modal onClose={onClose} emoji="🎲" title="Most Likely To" wide>
      <div style={{ background: "rgba(196,122,46,0.1)", border: "2px solid rgba(196,122,46,0.25)", borderRadius: 20, padding: "26px 20px", textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Who is most likely to…</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.4 }}>{prompt}</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 20 }}>
        {players.map(p => {
          const voted = votes[prompt] === p;
          return (
            <button key={p} onClick={() => vote(p)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 14px", borderRadius: 14, border: `2px solid ${voted ? "#C47A2E" : "rgba(255,255,255,0.12)"}`, background: voted ? "rgba(196,122,46,0.2)" : "rgba(255,255,255,0.04)", cursor: "pointer", fontFamily: font, transition: "all 0.2s", transform: voted ? "scale(1.08)" : "scale(1)", minWidth: 70 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: voted ? "#C47A2E" : "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", transition: "all 0.2s" }}>
                {voted ? "✓" : p.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 12, color: voted ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: voted ? 700 : 400 }}>{p}</span>
            </button>
          );
        })}
      </div>
      {votes[prompt] && <button onClick={reveal} style={btn("#C47A2E")}>Reveal 🎉</button>}
    </Modal>
  );

  const last = history[history.length - 1];
  return (
    <Modal onClose={onClose} emoji="🎲" title="Most Likely To" wide>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Most likely to…</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 18, lineHeight: 1.4 }}>{last.prompt}</div>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#C47A2E" }}>{last.winner}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Everyone agrees!</div>
      </div>
      {history.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Previous</div>
          {history.slice(0, -1).map((h, i) => (
            <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", flex: 1 }}>{h.prompt.substring(0, 42)}…</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#CCAB4A", marginLeft: 10 }}>{h.winner}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={next} style={btn("#C47A2E")}>Next Prompt →</button>
      <button onClick={() => setPhase("setup")} style={{ ...btn("rgba(255,255,255,0.06)"), marginTop: 10 }}>Change Players</button>
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

  const STMT_COLORS = ['#3B82F6', '#10B981', '#F59E0B'];
  const STMT_LABELS = ['A', 'B', 'C'];

  return (
    <Modal onClose={onClose} title="Two Truths One Lie" emoji="🕵️" wide>
      {phase === 'setup' && (
        <>
          {/* Detective dossier board */}
          {players.length > 0 && (
            <div style={{ background:"linear-gradient(135deg,#0f1116,#1a1d27)", borderRadius:14, padding:"12px 14px", marginBottom:14, border:"1px solid rgba(59,130,246,0.15)" }}>
              <div style={{ fontSize:9, fontWeight:800, color:"rgba(59,130,246,0.5)", textTransform:"uppercase", letterSpacing:"0.16em", marginBottom:10 }}>🕵️ DOSSIER BOARD · {players.length} SUSPECT{players.length!==1?"S":""}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {players.map((p, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(59,130,246,0.1)", borderRadius:8, padding:"6px 10px", border:"1px solid rgba(59,130,246,0.2)" }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(59,130,246,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#60a5fa" }}>{p.name[0].toUpperCase()}</div>
                    <span style={{ fontSize:12, color:"#93c5fd", fontWeight:700 }}>{p.name}</span>
                    <span style={{ fontSize:9, color:"rgba(59,130,246,0.5)" }}>FILED</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Case file form */}
          <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"16px 14px", marginBottom:14, border:"1px dashed rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:12 }}>📋 FILE A CASE · Add your 3 statements</div>
            <input value={nameInput} onChange={e=>setNameInput(e.target.value)} placeholder="Your name" style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 14px', color:'#fff', fontSize:14, fontFamily:font, outline:'none', boxSizing:'border-box', marginBottom:12 }} />
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                <div style={{ width:28, height:28, borderRadius:6, background:lieIdx===i?'#EF444422':'rgba(255,255,255,0.06)', border:`2px solid ${lieIdx===i?'#EF4444':'rgba(255,255,255,0.12)'}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:900, color:STMT_COLORS[i] }}>{STMT_LABELS[i]}</span>
                </div>
                <input value={stmts[i]} onChange={e=>setStmts(s=>{const n=[...s];n[i]=e.target.value;return n;})} placeholder={`Statement ${STMT_LABELS[i]}`} style={{ flex:1, background:'rgba(255,255,255,0.06)', border:`1px solid ${lieIdx===i?'rgba(239,68,68,0.35)':'rgba(255,255,255,0.1)'}`, borderRadius:10, padding:'9px 12px', color:'#fff', fontSize:13, fontFamily:font, outline:'none' }} />
                <button onClick={()=>setLieIdx(i===lieIdx?null:i)} style={{ padding:"6px 9px", borderRadius:8, border:`1.5px solid ${lieIdx===i?'#EF4444':'rgba(255,255,255,0.1)'}`, background:lieIdx===i?'#EF444420':'transparent', color:lieIdx===i?'#EF4444':'rgba(255,255,255,0.3)', fontSize:9, fontWeight:800, cursor:'pointer', fontFamily:font, textTransform:"uppercase", letterSpacing:"0.06em" }}>LIE</button>
              </div>
            ))}
            {lieIdx===null && <div style={{ fontSize:10, color:'rgba(255,100,100,0.6)', marginBottom:8 }}>↑ Mark which statement is the lie</div>}
            <button onClick={addPlayer} disabled={!nameInput.trim()||stmts.some(s=>!s.trim())||lieIdx===null} style={{ width:'100%', background:nameInput.trim()&&stmts.every(s=>s.trim())&&lieIdx!==null?'#1A7A8A':'rgba(255,255,255,0.05)', border:'none', borderRadius:10, padding:'11px 0', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font, marginTop:4 }}>+ File This Case</button>
          </div>
          <button onClick={startVoting} disabled={players.length<2} style={{ width:'100%', background:players.length>=2?'linear-gradient(135deg,#1A7A8A,#C85A2A)':'rgba(255,255,255,0.05)', border:'none', borderRadius:12, padding:'14px 0', color:'#fff', fontSize:15, fontWeight:800, cursor:players.length>=2?'pointer':'not-allowed', fontFamily:font }}>
            {players.length<2?`Add ${2-players.length} more player${players.length===1?'':'s'} to start`:`🕵️ Start Investigation (${players.length} players) →`}
          </button>
        </>
      )}

      {phase === 'vote' && cur && (
        <>
          <div style={{ textAlign:'center', marginBottom:18 }}>
            <div style={{ fontSize:10, fontWeight:800, color:'#60a5fa', textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:4 }}>SUSPECT {currentIdx+1} of {players.length}</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#fff', fontFamily:font }}>{cur.name}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 }}>🔍 Spot the lie. One of these is false.</div>
          </div>
          {/* Evidence cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {cur.shuffled.map((origIdx, si) => {
              const col = STMT_COLORS[si];
              const isVoted = votingFor === si;
              return (
                <div key={si} onClick={()=>setVotingFor(si===votingFor?null:si)}
                  style={{ padding:'16px', background:isVoted?`${col}18`:'rgba(255,255,255,0.05)', borderRadius:12, border:`2px solid ${isVoted?col:'rgba(255,255,255,0.1)'}`, cursor:'pointer', display:'flex', gap:12, alignItems:'flex-start', transition:'all 0.15s' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:`${col}25`, border:`2px solid ${col}60`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:col, flexShrink:0 }}>{STMT_LABELS[si]}</div>
                  <div style={{ flex:1, fontSize:14, color:'#fff', fontFamily:font, lineHeight:1.6 }}>{cur.s[origIdx]}</div>
                  {isVoted && <div style={{ fontSize:10, fontWeight:800, color:'#EF4444', background:'rgba(239,68,68,0.15)', padding:'3px 8px', borderRadius:100, alignSelf:'center', flexShrink:0 }}>THE LIE?</div>}
                </div>
              );
            })}
          </div>
          <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:14 }}>
            <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>📝 Register Vote</div>
            <input value={voterInput} onChange={e=>setVoterInput(e.target.value)} placeholder="Your name" style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'9px 12px', color:'#fff', fontSize:14, fontFamily:font, outline:'none', boxSizing:'border-box', marginBottom:10 }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={submitVote} disabled={!voterInput.trim()||votingFor===null} style={{ flex:1, background:voterInput.trim()&&votingFor!==null?'#1A7A8A':'rgba(255,255,255,0.05)', border:'none', borderRadius:10, padding:'11px 0', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font }}>Submit Vote</button>
              <button onClick={reveal} disabled={Object.keys(votes).length===0} style={{ flex:1, background:Object.keys(votes).length>0?'#EF4444':'rgba(255,255,255,0.05)', border:'none', borderRadius:10, padding:'11px 0', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font }}>🔓 Reveal ({Object.keys(votes).length})</button>
            </div>
          </div>
          {Object.keys(votes).length>0 && <div style={{ marginTop:10, fontSize:10, color:'rgba(255,255,255,0.3)', textAlign:'center' }}>{Object.keys(votes).join(', ')} voted</div>}
        </>
      )}

      {phase === 'reveal' && cur && (
        <>
          <div style={{ textAlign:'center', marginBottom:18 }}>
            <div style={{ fontSize:48, marginBottom:8 }}>🤥</div>
            <div style={{ fontSize:10, fontWeight:800, color:'#EF4444', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:6 }}>CASE CLOSED · THE LIE WAS</div>
            <div style={{ fontSize:18, fontWeight:900, color:'#fff', fontFamily:font }}>"{cur.s[cur.lieIdx]}"</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
            {Object.entries(votes).map(([voter, guessIdx]) => {
              const guessedOrigIdx = cur.shuffled[guessIdx];
              const correct = guessedOrigIdx === cur.lieIdx;
              return (
                <div key={voter} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:correct?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.08)', borderRadius:10, border:`1px solid ${correct?'rgba(34,197,94,0.25)':'rgba(239,68,68,0.2)'}` }}>
                  <span style={{ fontSize:16 }}>{correct?'✅':'❌'}</span>
                  <span style={{ flex:1, fontSize:14, color:'#fff', fontFamily:font, fontWeight:600 }}>{voter}</span>
                  <span style={{ fontSize:11, color:correct?'#22c55e':'#EF4444', fontWeight:700 }}>{correct?'+1 point':'fooled!'}</span>
                </div>
              );
            })}
          </div>
          <button onClick={next} style={{ width:'100%', background:'linear-gradient(135deg,#1A7A8A,#C85A2A)', border:'none', borderRadius:12, padding:'14px 0', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:font }}>
            {currentIdx+1>=players.length?'See Final Scores →':`Next: ${players[currentIdx+1]?.name} →`}
          </button>
        </>
      )}

      {phase === 'scores' && (
        <>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:44 }}>🏆</div>
            <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.18em', marginTop:8 }}>FINAL DEDUCTIONS</div>
          </div>
          {Object.entries(scores).sort(([,a],[,b])=>b-a).map(([name, score], i) => (
            <div key={name} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:i===0?'linear-gradient(90deg,rgba(26,122,138,0.2),rgba(255,255,255,0.03))':'rgba(255,255,255,0.04)', borderRadius:12, marginBottom:8, border:i===0?'1px solid rgba(26,122,138,0.3)':'1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize:18, minWidth:28 }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</span>
              <span style={{ flex:1, fontSize:15, color:'#fff', fontFamily:font, fontWeight:700 }}>{name}</span>
              <span style={{ fontSize:22, fontWeight:900, color:i===0?'#1A7A8A':'#fff', fontFamily:font }}>{score}</span>
            </div>
          ))}
          {Object.keys(scores).length===0 && <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:14, padding:20 }}>No one cracked the case. Expert liars! 🤥</div>}
          <button onClick={()=>{setPhase('setup');setPlayers([]);setScores({});setCurrentIdx(0);}} style={{ width:'100%', marginTop:16, background:'rgba(255,255,255,0.07)', border:'none', borderRadius:12, padding:'12px 0', color:'rgba(255,255,255,0.6)', fontSize:14, cursor:'pointer', fontFamily:font }}>Play Again</button>
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
          {/* Hot seat chair visual */}
          <div style={{ position:'relative', background:'linear-gradient(180deg,#1A0505,#0F0303)', borderRadius:16, padding:'24px 16px 16px', marginBottom:16, overflow:'hidden' }}>
            {/* Spotlight from above */}
            <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'60%', height:'100%', background:'radial-gradient(ellipse 60% 80% at 50% 0%,rgba(249,115,22,0.18) 0%,transparent 70%)', pointerEvents:'none' }} />
            {/* Chair */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0, position:'relative', zIndex:1 }}>
              {/* Chair back */}
              <div style={{ width:56, height:44, background:'linear-gradient(180deg,#7C1D1D,#991B1B)', borderRadius:'6px 6px 0 0', border:'2px solid #B91C1C', boxShadow:'0 4px 16px rgba(239,68,68,0.3)', position:'relative' }}>
                {/* Back slats */}
                {[0,1,2].map(i => <div key={i} style={{ position:'absolute', left:10+i*14, top:6, width:6, height:32, background:'rgba(0,0,0,0.25)', borderRadius:3 }} />)}
              </div>
              {/* Seat */}
              <div style={{ width:68, height:12, background:'linear-gradient(180deg,#B91C1C,#991B1B)', borderRadius:'2px 2px 4px 4px', border:'2px solid #DC2626', marginTop:-1 }} />
              {/* Legs */}
              <div style={{ display:'flex', gap:36 }}>
                {[0,1].map(i => <div key={i} style={{ width:5, height:28, background:'#7C1D1D', borderRadius:'0 0 3px 3px', border:'1px solid #B91C1C' }} />)}
              </div>
            </div>
            <div style={{ textAlign:'center', marginTop:10, position:'relative', zIndex:1 }}>
              <div style={{ fontSize:10, color:'rgba(249,115,22,0.7)', fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase' }}>THE HOT SEAT</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:3 }}>60s · answer or pass · no hiding</div>
            </div>
          </div>
          <input value={player} onChange={e => setPlayer(e.target.value)} placeholder="Who's in the hot seat?" style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'14px 16px', color:'#fff', fontSize:16, fontFamily:font, outline:'none', boxSizing:'border-box', marginBottom:12, textAlign:'center', fontWeight:700 }} />
          <button onClick={start} disabled={!player.trim()} style={{ width:'100%', background:player.trim()?'linear-gradient(135deg,#F43F5E,#F97316)':'rgba(255,255,255,0.05)', border:'none', borderRadius:12, padding:'15px 0', color:'#fff', fontSize:16, fontWeight:800, cursor:player.trim()?'pointer':'not-allowed', fontFamily:font }}>
            Start the Clock 🔥
          </button>
        </>
      )}
      {phase === 'playing' && (
        <>
          {/* Player name badge */}
          <div style={{ background:'linear-gradient(135deg,rgba(244,63,94,0.15),rgba(249,115,22,0.1))', border:'1.5px solid rgba(244,63,94,0.3)', borderRadius:12, padding:'10px 14px', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>On the seat:</span>
            <span style={{ fontSize:15, fontWeight:800, color:'#F87171' }}>{player} 🔥</span>
          </div>
          {/* Timer ring */}
          <div style={{ textAlign:'center', marginBottom:14 }}>
            <div style={{ position:'relative', width:80, height:80, margin:'0 auto' }}>
              <svg viewBox="0 0 80 80" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={timerColor} strokeWidth="7"
                  strokeDasharray={`${2*Math.PI*34*pct} ${2*Math.PI*34*(1-pct)}`}
                  style={{ transition:'stroke-dasharray 0.9s linear, stroke 0.3s' }} />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:900, color:timerColor, fontVariantNumeric:'tabular-nums' }}>{timer}</div>
            </div>
          </div>
          {/* Question card */}
          <div style={{ background:'linear-gradient(135deg,#FFFBF0,#FFF8E7)', borderRadius:12, padding:'20px 16px', marginBottom:14, minHeight:72, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(0,0,0,0.4)', position:'relative' }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#1A0A05', fontFamily:'Georgia,serif', textAlign:'center', lineHeight:1.5 }}>
              {shuffled[qIdx] || "That's all the questions!"}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            <button onClick={() => next(false)} style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'13px 0', color:'rgba(255,255,255,0.55)', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font }}>Pass</button>
            <button onClick={() => next(true)} style={{ flex:2, background:'linear-gradient(135deg,#F43F5E,#F97316)', border:'none', borderRadius:12, padding:'13px 0', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:font }}>Answered ✓</button>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:28 }}>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:22, fontWeight:900, color:'#22c55e', fontVariantNumeric:'tabular-nums' }}>{answered}</div><div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em' }}>ANSWERED</div></div>
            <div style={{ width:1, background:'rgba(255,255,255,0.08)' }} />
            <div style={{ textAlign:'center' }}><div style={{ fontSize:22, fontWeight:900, color:'#f59e0b', fontVariantNumeric:'tabular-nums' }}>{passed}</div><div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em' }}>PASSED</div></div>
          </div>
        </>
      )}
      {phase === 'done' && (
        <>
          <div style={{ textAlign:'center', padding:'16px 0 20px' }}>
            <div style={{ fontSize:11, color:'rgba(249,115,22,0.7)', fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>TIME'S UP</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#fff', fontFamily:font }}>{player} survived! 🔥</div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:20 }}>
            <div style={{ flex:1, textAlign:'center', background:'#22c55e18', border:'1px solid #22c55e30', borderRadius:14, padding:'16px 12px' }}>
              <div style={{ fontSize:36, fontWeight:900, color:'#22c55e', fontVariantNumeric:'tabular-nums' }}>{answered}</div>
              <div style={{ fontSize:10, color:'#22c55e', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:2 }}>Answered</div>
            </div>
            <div style={{ flex:1, textAlign:'center', background:'#f59e0b18', border:'1px solid #f59e0b30', borderRadius:14, padding:'16px 12px' }}>
              <div style={{ fontSize:36, fontWeight:900, color:'#f59e0b', fontVariantNumeric:'tabular-nums' }}>{passed}</div>
              <div style={{ fontSize:10, color:'#f59e0b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:2 }}>Passed</div>
            </div>
          </div>
          <button onClick={() => { setPhase('setup'); setPlayer(''); }} style={{ width:'100%', background:'linear-gradient(135deg,#F43F5E,#F97316)', border:'none', borderRadius:12, padding:'14px 0', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:font }}>Next Player →</button>
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
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:800, color:'#10B981', textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:6 }}>DEALING CARDS · {dealIdx+1} of {players.length}</div>
            <div style={{ fontSize:20, fontWeight:900, color:'#fff', fontFamily:font }}>{players[dealIdx]}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:4 }}>Your card is face-down. Only you may see it.</div>
          </div>
          {!showing ? (
            /* Card back — physical playing card */
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
              <div style={{ width:160, height:220, borderRadius:16, background:"linear-gradient(135deg,#065f46,#047857)", border:"3px solid rgba(255,255,255,0.15)", boxShadow:"0 20px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", cursor:"pointer" }} onClick={()=>setShowing(true)}>
                {/* Card pattern */}
                <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,0.04) 0,rgba(255,255,255,0.04) 2px,transparent 0,transparent 50%)", backgroundSize:"12px 12px" }} />
                <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>🐺</div>
                  <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.14em" }}>WORD WOLF</div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:4 }}>Tap to reveal</div>
                </div>
                {/* Corner pips */}
                {["top:8px,left:10px","bottom:8px,right:10px"].map((pos,i)=>(
                  <div key={i} style={{ position:"absolute", [pos.split(",")[0].split(":")[0]]:pos.split(",")[0].split(":")[1], [pos.split(",")[1].split(":")[0]]:pos.split(",")[1].split(":")[1], fontSize:10, color:"rgba(255,255,255,0.3)", transform:i===1?"rotate(180deg)":"none" }}>🐺</div>
                ))}
              </div>
              <button onClick={()=>setShowing(true)} style={{ background:'linear-gradient(135deg,#10B981,#06b6d4)', border:'none', borderRadius:12, padding:'14px 40px', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:font }}>Tap to Reveal Your Word</button>
            </div>
          ) : (
            /* Card face — word revealed */
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
              <div style={{ width:160, height:220, borderRadius:16, background:"linear-gradient(135deg,#FFFBF5,#FFF5E0)", border:"3px solid rgba(0,0,0,0.1)", boxShadow:"0 20px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative" }}>
                {/* Top-left pip */}
                <div style={{ position:"absolute", top:10, left:12, textAlign:"center" }}>
                  <div style={{ fontSize:11, fontWeight:900, color:"#10B981" }}>W</div>
                </div>
                {/* Word */}
                <div style={{ textAlign:"center", padding:"0 16px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#10B981", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>YOUR WORD</div>
                  <div style={{ fontSize:wolves.includes(dealIdx)?28:32, fontWeight:900, color:"#1a1a1a", fontFamily:"Georgia,serif", lineHeight:1.2 }}>{wolves.includes(dealIdx)?pair.minority:pair.majority}</div>
                </div>
                {/* Bottom-right pip */}
                <div style={{ position:"absolute", bottom:10, right:12, transform:"rotate(180deg)" }}>
                  <div style={{ fontSize:11, fontWeight:900, color:"#10B981" }}>W</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textAlign:"center" }}>Remember it. Don't show anyone.</div>
              <button onClick={()=>{setShowing(false);if(dealIdx+1>=players.length){setPhase('discuss');}else{setDealIdx(i=>i+1);}}} style={{ width:'100%', maxWidth:240, background:'rgba(255,255,255,0.08)', border:'none', borderRadius:12, padding:'14px 0', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font }}>
                {dealIdx+1>=players.length?'Start Discussion →':`Done — pass to ${players[dealIdx+1]}`}
              </button>
            </div>
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
          <div style={{ background:"linear-gradient(135deg,#1a0f04,#120a02)", borderRadius:14, padding:"12px 14px", marginBottom:14, border:"1px solid rgba(245,158,11,0.2)" }}>
            <div style={{ fontSize:9, fontWeight:800, color:"rgba(245,158,11,0.6)", textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:4 }}>⚡ CATEGORY BLITZ</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>Pick a category. Name items one by one. 60 seconds on the clock.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {CATEGORY_BLITZ.sort(() => Math.random() - 0.5).slice(0, 12).map(c => (
              <button key={c.name} onClick={() => start(c)} style={{ padding: '12px 10px', background: 'rgba(245,158,11,0.06)', border: '1.5px solid rgba(245,158,11,0.15)', borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font, textAlign: 'left', lineHeight: 1.4 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{c.emoji}</div>
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}
      {phase === 'playing' && (
        <>
          {/* Blitz header with giant timer */}
          <div style={{ background:"linear-gradient(135deg,#0a0500,#150c02)", borderRadius:16, padding:"16px", marginBottom:14, border:`2px solid ${timerColor}40`, boxShadow:`0 0 24px ${timerColor}20`, textAlign:"center" }}>
            <div style={{ fontSize:13, fontWeight:900, color:"rgba(255,255,255,0.5)", letterSpacing:"0.1em", marginBottom:6 }}>{cat.emoji} {cat.name}</div>
            {/* Timer ring */}
            <div style={{ display:"inline-flex", position:"relative", marginBottom:8 }}>
              <svg width={80} height={80} style={{ transform:"rotate(-90deg)" }}>
                <circle cx={40} cy={40} r={34} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
                <circle cx={40} cy={40} r={34} fill="none" stroke={timerColor} strokeWidth={6}
                  strokeDasharray={`${2*Math.PI*34}`}
                  strokeDashoffset={`${2*Math.PI*34*(1-timer/60)}`}
                  strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.8s linear,stroke 0.3s" }} />
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:22, fontWeight:900, color:timerColor, fontVariantNumeric:"tabular-nums" }}>{timer}</span>
              </div>
            </div>
            {/* Timer bar */}
            <div style={{ height:4, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${timer/60*100}%`, background:`linear-gradient(90deg,${timerColor}80,${timerColor})`, borderRadius:2, transition:"width 0.8s linear" }} />
            </div>
          </div>
          {/* Neon input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Name something…" style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: `2px solid ${timerColor}60`, borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 16, fontFamily: font, outline: 'none', boxShadow:`0 0 12px ${timerColor}20` }} />
            <button onClick={submit} style={{ background: timerColor, border: 'none', borderRadius: 12, padding: '14px 20px', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: 20, boxShadow:`0 4px 16px ${timerColor}40` }}>✓</button>
          </div>
          {/* Answers */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 50 }}>
            {answers.map((a, i) => (
              <span key={i} style={{ fontSize: 12, fontWeight: 800, color: '#22c55e', background: '#22c55e12', border: '1px solid #22c55e30', borderRadius: 100, padding: '4px 12px' }}>✓ {a}</span>
            ))}
          </div>
          {answers.length > 0 && <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:8, textAlign:"center" }}>{answers.length} answer{answers.length!==1?"s":""} so far</div>}
        </>
      )}
      {phase === 'done' && (
        <>
          <div style={{ background:"linear-gradient(135deg,#0a0500,#150c02)", borderRadius:16, padding:"24px 20px", marginBottom:16, textAlign:"center", border:"2px solid rgba(245,158,11,0.3)" }}>
            <div style={{ fontSize:48, marginBottom:8 }}>⚡</div>
            <div style={{ fontSize:10, fontWeight:800, color:"rgba(245,158,11,0.6)", textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:6 }}>TIME'S UP!</div>
            <div style={{ fontSize:32, fontWeight:900, color:"#F59E0B" }}>{answers.length}</div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.5)", marginTop:4 }}>answers in {cat.name}</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 20 }}>
            {answers.map((a, i) => <span key={i} style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', background: '#F59E0B12', border: '1px solid #F59E0B25', borderRadius: 100, padding: '5px 13px' }}>{a}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => start(cat)} style={{ flex: 1, background: 'linear-gradient(135deg,#F59E0B,#F97316)', border: 'none', borderRadius: 12, padding: '13px 0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>⚡ Same Category</button>
            <button onClick={() => setPhase('pick')} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 12, padding: '13px 0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>New Category</button>
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
          {/* Comedy club stage banner */}
          <div style={{ background:"linear-gradient(135deg,#1a0508,#0f0205)", borderRadius:14, padding:"14px 16px", marginBottom:16, border:"1px solid rgba(244,63,94,0.2)", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:6 }}>🎤</div>
            <div style={{ fontSize:9, fontWeight:800, color:"rgba(244,63,94,0.6)", textTransform:"uppercase", letterSpacing:"0.2em" }}>ROAST BATTLE STAGE</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:4 }}>Two players. Three rounds. Best of 3 wins. Keep it playful.</div>
          </div>
          {[0, 1].map(i => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize:10, fontWeight:800, color:i===0?'#F43F5E':'#F97316', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:6 }}>🎤 ROASTER {i+1}</div>
              <input value={players[i]} onChange={e=>{const p=[...players];p[i]=e.target.value;setPlayers(p);}} placeholder={`Player ${i+1} name`} style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:`1.5px solid ${i===0?'rgba(244,63,94,0.3)':'rgba(249,115,22,0.3)'}`, borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:15, fontFamily:font, outline:'none', boxSizing:'border-box', fontWeight:700 }} />
            </div>
          ))}
          <button onClick={start} disabled={!players[0].trim()||!players[1].trim()} style={{ width:'100%', marginTop:8, background:players.every(p=>p.trim())?'linear-gradient(135deg,#F43F5E,#F97316)':'rgba(255,255,255,0.05)', border:'none', borderRadius:12, padding:'15px 0', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:font }}>
            🎤 Let the Roast Begin
          </button>
        </>
      )}
      {phase === 'roast' && (
        <>
          {/* Stage spotlight */}
          <div style={{ background:"linear-gradient(180deg,#1a0204 0%,#0a0102 100%)", borderRadius:16, padding:"20px 16px", marginBottom:14, border:`1.5px solid ${roasterIdx===0?'rgba(244,63,94,0.3)':'rgba(249,115,22,0.3)'}`, position:"relative", overflow:"hidden", textAlign:"center" }}>
            {/* Spotlight gradient */}
            <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:160, height:100, background:`radial-gradient(ellipse at top,${roasterIdx===0?'rgba(244,63,94,0.25)':'rgba(249,115,22,0.25)'} 0%,transparent 70%)`, pointerEvents:"none" }} />
            <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:8 }}>ROUND {round} OF 3 · ON STAGE</div>
            <div style={{ fontSize:22, fontWeight:900, color:roasterIdx===0?'#F43F5E':'#F97316', fontFamily:font, marginBottom:4 }}>🎤 {players[roasterIdx]}</div>
            {/* Timer */}
            <div style={{ fontSize:40, fontWeight:900, color:timerColor, fontVariantNumeric:"tabular-nums" }}>{timer}s</div>
            <div style={{ height:4, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden", marginTop:8 }}>
              <div style={{ height:"100%", width:`${timer/30*100}%`, background:`linear-gradient(90deg,${timerColor}80,${timerColor})`, borderRadius:2, transition:"width 0.8s linear" }} />
            </div>
          </div>
          {/* Roast prompt card */}
          <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:16, padding:'20px 18px', marginBottom:14, border:'1px solid rgba(255,255,255,0.08)', minHeight:80, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#fff', fontFamily:'Georgia,serif', textAlign:'center', lineHeight:1.7, fontStyle:"italic" }}>"{currentPrompt}"</div>
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', textAlign:'center' }}>Audience votes when the timer ends</div>
        </>
      )}
      {phase === 'vote' && (
        <>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:6 }}>AUDIENCE VERDICT · Round {round}</div>
            <div style={{ fontSize:20, fontWeight:900, color:'#fff', fontFamily:font }}>Who got the bigger laugh?</div>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            {[0,1].map(i=>(
              <button key={i} onClick={()=>vote(i)} style={{ flex:1, padding:'24px 0', background:i===0?'rgba(244,63,94,0.12)':'rgba(249,115,22,0.12)', border:`2px solid ${i===0?'rgba(244,63,94,0.5)':'rgba(249,115,22,0.5)'}`, borderRadius:16, cursor:'pointer', fontFamily:font, textAlign:"center" }}>
                <div style={{ fontSize:20 }}>🎤</div>
                <div style={{ fontSize:18, fontWeight:900, color:i===0?'#F43F5E':'#F97316', marginTop:6 }}>{players[i]}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:4 }}>{scores[i]} pt{scores[i]!==1?'s':''}</div>
                <div style={{ marginTop:8, fontSize:10, fontWeight:800, color:i===0?'#F43F5E':'#F97316', textTransform:"uppercase", letterSpacing:"0.08em" }}>Tap to Vote</div>
              </button>
            ))}
          </div>
        </>
      )}
      {phase === 'scores' && (
        <>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:48 }}>🏆</div>
            <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.18em', marginTop:8 }}>FINAL VERDICT</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#fff', fontFamily:font, marginTop:6 }}>
              {scores[0]===scores[1]?"It's a tie! 🤝":`${players[scores[0]>scores[1]?0:1]} wins the roast! 🎤`}
            </div>
          </div>
          <div style={{ display:'flex', gap:12, marginBottom:20 }}>
            {[0,1].map(i=>(
              <div key={i} style={{ flex:1, textAlign:'center', background:i===0?'rgba(244,63,94,0.1)':'rgba(249,115,22,0.1)', border:`1.5px solid ${i===0?'rgba(244,63,94,0.3)':'rgba(249,115,22,0.3)'}`, borderRadius:14, padding:'20px 0' }}>
                <div style={{ fontSize:38, fontWeight:900, color:i===0?'#F43F5E':'#F97316' }}>{scores[i]}</div>
                <div style={{ fontSize:14, color:'#fff', fontFamily:font, fontWeight:700, marginTop:4 }}>{players[i]}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>{setPhase('setup');setPlayers(['','']);}} style={{ width:'100%', background:'linear-gradient(135deg,#F43F5E,#F97316)', border:'none', borderRadius:12, padding:'14px 0', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:font }}>New Battle 🎤</button>
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
    <Modal onClose={onClose} title="Guest List" emoji="👥" wide>
      {/* Entrance board header */}
      <div style={{ background: "linear-gradient(135deg,#0f0a04,#1a1206)", border: "2px solid rgba(196,122,46,0.4)", borderRadius: 18, padding: "16px 18px", marginBottom: 14, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: "#C47A2E", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>🎟️ GUEST CHECK-IN BOARD</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
          {[["CONFIRMED", counts.yes, "#22C55E"], ["MAYBE", counts.maybe, "#F59E0B"], ["DECLINED", counts.no, "#EF4444"], ["PENDING", counts.pending, "#6B7280"]].map(([lbl, count, color]) => (
            <div key={lbl} style={{ textAlign: "center", background: `${color}12`, border: `1px solid ${color}40`, borderRadius: 10, padding: "10px 4px" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color, fontFamily: "Georgia, serif" }}>{count}</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: `${color}aa`, letterSpacing: "0.1em", marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>
        {totalAttending > 0 && (
          <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: "#22C55E" }}>🎉 {totalAttending} attending{plusOneCount > 0 ? ` (incl. ${plusOneCount} +1${plusOneCount !== 1 ? "s" : ""})` : ""}</div>
        )}
      </div>

      {/* Add guest form */}
      {showAdd ? (
        <div style={{ background: "rgba(196,122,46,0.06)", borderRadius: 14, padding: 14, marginBottom: 12, border: "1.5px dashed rgba(196,122,46,0.3)" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>🎟️ Add Guest to List</div>
          <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Guest name *" style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:13.5, fontFamily:font, outline:'none', marginBottom:8 }} />
          <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="Phone (for WhatsApp)" type="tel" style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:13.5, fontFamily:font, outline:'none', marginBottom:10 }} />
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
            {[['🟢 Veg','veg'],['🔴 Non-Veg','nonveg'],['🟡 Jain','jain']].map(([lbl,val]) => (
              <button key={val} onClick={()=>setForm(p=>({...p,meal:val}))} style={{ fontSize:11, padding:'5px 10px', borderRadius:100, border:`1.5px solid ${form.meal===val?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.12)'}`, background:form.meal===val?'rgba(255,255,255,0.12)':'transparent', color:form.meal===val?'#fff':'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>{lbl}</button>
            ))}
            <button onClick={()=>setForm(p=>({...p,plusOne:!p.plusOne}))} style={{ fontSize:11, padding:'5px 10px', borderRadius:100, border:`1.5px solid ${form.plusOne?'#f59e0b':'rgba(255,255,255,0.12)'}`, background:form.plusOne?'rgba(245,158,11,0.15)':'transparent', color:form.plusOne?'#f59e0b':'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:font, fontWeight:700 }}>+1 Guest</button>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={add} style={{ flex:1, background:'#C47A2E', border:'none', borderRadius:9, padding:'10px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>✓ Add to List</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'10px 16px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:font, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowAdd(true)} style={{ width:'100%', background:'rgba(196,122,46,0.08)', border:'1.5px dashed rgba(196,122,46,0.35)', borderRadius:10, padding:'11px', color:'#C47A2E', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, marginBottom:12 }}>+ Add Guest</button>
      )}

      {/* Guest wristband list */}
      {guests.length === 0 ? (
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:13, padding:'28px 0' }}>No guests yet. Add names above!</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {guests.map(g => {
            const rsvpColor = g.rsvp==='yes'?'#22c55e':g.rsvp==='maybe'?'#f59e0b':g.rsvp==='no'?'#ef4444':'#6b7280';
            const ph = g.phone?.replace(/\D/g,'');
            const waPhone = ph ? (ph.startsWith('91')&&ph.length===12?ph:'91'+ph) : null;
            const rsvpLabel = g.rsvp==='yes'?'✓ IN':g.rsvp==='maybe'?'? MAYBE':g.rsvp==='no'?'✗ OUT':'PENDING';
            return (
              <div key={g.id} style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, border:`1.5px solid ${rsvpColor}30`, borderLeft:`4px solid ${rsvpColor}`, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px' }}>
                  {/* Avatar */}
                  <div style={{ width:36, height:36, borderRadius:'50%', background:`${rsvpColor}20`, border:`2px solid ${rsvpColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:rsvpColor, flexShrink:0 }}>{g.name[0]?.toUpperCase()}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14, color:'#fff', fontFamily:font, fontWeight:700 }}>{g.name}</span>
                      {g.plusOne && <span style={{ fontSize:9, fontWeight:800, color:'#f59e0b', background:'rgba(245,158,11,0.15)', padding:'2px 7px', borderRadius:100 }}>+1</span>}
                      {g.meal && g.meal!=='veg' && <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.4)' }}>{g.meal==='nonveg'?'🔴':'🟡'}</span>}
                    </div>
                    {g.phone && waPhone && <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" style={{ display:'block', fontSize:10, color:'#25D366', fontWeight:700, textDecoration:'none', marginTop:1 }}>📱 {g.phone}</a>}
                  </div>
                  {/* RSVP badge */}
                  <div style={{ fontSize:10, fontWeight:800, color:rsvpColor, background:`${rsvpColor}15`, border:`1px solid ${rsvpColor}40`, padding:'3px 8px', borderRadius:100, flexShrink:0 }}>{rsvpLabel}</div>
                  {/* RSVP toggles */}
                  <div style={{ display:'flex', gap:4 }}>
                    {[['✓','yes','#22c55e'],['?','maybe','#f59e0b'],['✗','no','#ef4444']].map(([lbl,val,color]) => (
                      <button key={val} onClick={()=>setRsvp(g.id,g.rsvp===val?'pending':val)} style={{ width:26, height:26, borderRadius:8, border:`1.5px solid ${g.rsvp===val?color:'rgba(255,255,255,0.1)'}`, background:g.rsvp===val?color+'22':'transparent', color:g.rsvp===val?color:'rgba(255,255,255,0.3)', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:font, padding:0, display:'flex', alignItems:'center', justifyContent:'center' }}>{lbl}</button>
                    ))}
                  </div>
                  <button onClick={()=>save(guests.filter(x=>x.id!==g.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.15)', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 2px', marginLeft:2 }}>×</button>
                </div>
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
          <div key={c.id} style={{ marginBottom:18 }}>
            {/* Restaurant menu section divider */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ flex:1, height:1, background:`linear-gradient(to right,transparent,${c.color}44)` }} />
              <span style={{ fontSize:11, fontWeight:900, color:c.color, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Georgia,serif' }}>{c.label}</span>
              <div style={{ flex:1, height:1, background:`linear-gradient(to left,transparent,${c.color}44)` }} />
            </div>
            {catItems.map(it => (
              <div key={it.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 4px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color:c.color, fontSize:18, flexShrink:0, lineHeight:1, fontWeight:900 }}>•</span>
                <span style={{ flex:1, fontSize:13.5, color:it.done?'rgba(255,255,255,0.3)':'#fff', fontFamily:'Georgia,serif', textDecoration:it.done?'line-through':undefined }}>{it.name}</span>
                {it.diet==='nonveg' && <span style={{ fontSize:11 }}>🔴</span>}
                {it.diet==='jain' && <span style={{ fontSize:11 }}>🟡</span>}
                {it.person && <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontStyle:'italic', fontFamily:'Georgia,serif' }}>{it.person}</span>}
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
      {/* Blueprint container */}
      <div style={{ background:"#0D1B2D", borderRadius:12, padding:14, marginBottom:14, border:"1px solid rgba(96,165,250,0.2)", backgroundImage:"linear-gradient(rgba(96,165,250,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,0.04) 1px,transparent 1px)", backgroundSize:"22px 22px", position:"relative", overflow:"hidden" }}>
        {/* Blueprint title bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:8, marginBottom:12, borderBottom:"1px solid rgba(96,165,250,0.18)" }}>
          <span style={{ fontSize:8.5, fontWeight:800, color:"rgba(96,165,250,0.55)", textTransform:"uppercase", letterSpacing:"0.2em", fontFamily:"'Courier New',monospace" }}>VENUE BLUEPRINT · REF: HP-VENUE-001</span>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"rgba(96,165,250,0.3)", display:"inline-block" }} />
            <span style={{ fontSize:8, color:"rgba(96,165,250,0.4)", fontFamily:"'Courier New',monospace" }}>TENDR</span>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {fields.map(f => (
            <div key={f.key} style={{ borderLeft:"2px solid rgba(96,165,250,0.35)", paddingLeft:10 }}>
              <div style={{ fontSize:8.5, fontWeight:800, color:"rgba(96,165,250,0.65)", textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:4, fontFamily:"'Courier New',monospace" }}>
                {f.label.replace(/[^\w\s]/g, '').trim()}
              </div>
              <textarea value={data[f.key]||''} onChange={e=>update(f.key,e.target.value)} placeholder={f.placeholder} rows={f.rows}
                style={{ width:'100%', background:'rgba(96,165,250,0.07)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:6, padding:'8px 10px', color:'#BFD7FF', fontSize:13, fontFamily:"'Courier New',monospace", outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.55, colorScheme:'dark' }}
              />
            </div>
          ))}
        </div>
        {/* Blueprint corner marks */}
        {[[0,0],[0,'auto'],['auto',0],['auto','auto']].map(([t,b],i)=>(<div key={i} aria-hidden style={{ position:"absolute", top:t, bottom:b, left:i<2?4:undefined, right:i>=2?4:undefined, width:8, height:8, border:`1px solid rgba(96,165,250,0.4)`, borderRadius:0, pointerEvents:"none" }} />))}
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
      {/* Add controls */}
      <div style={{ display:'flex', gap:8, marginBottom:8 }}>
        <input value={tName} onChange={e=>setTName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTable()} placeholder="Table name" style={{ flex:2, ...inp }} />
        <input type="number" value={tCap} onChange={e=>setTCap(Math.max(1,Number(e.target.value)))} min={1} max={30} style={{ width:60, ...inp, textAlign:'center' }} />
        <button onClick={addTable} style={{ ...btn(gold), width:'auto', padding:'10px 14px' }}>+ Table</button>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input value={gName} onChange={e=>setGName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addGuest()} placeholder="Guest name" style={{ flex:1, ...inp }} />
        <button onClick={addGuest} style={{ ...btn(gold), width:'auto', padding:'10px 14px' }}>+ Guest</button>
        {guests.length>0 && <button onClick={shareChart} style={{ ...btn('#25D366'), width:'auto', padding:'10px 14px' }}>Share</button>}
      </div>

      {/* Assignment banner */}
      {selected && (
        <div style={{ background:'rgba(196,122,46,0.12)', border:'1px solid rgba(196,122,46,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:12, fontSize:13, color:'#CCAB4A', fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
          <span>Placing <strong>{guests.find(g=>g.id===selected)?.name}</strong> — tap a table below</span>
          <button onClick={()=>setSelected(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontSize:13, fontFamily:font }}>Cancel</button>
        </div>
      )}

      {/* Floor plan */}
      {tables.length > 0 && (
        <div style={{ background:"linear-gradient(135deg,#0D1B2A,#0A1520)", borderRadius:14, padding:16, marginBottom:12, border:"1px solid rgba(59,130,246,0.2)", backgroundImage:"radial-gradient(rgba(59,130,246,0.06) 1px, transparent 1px)", backgroundSize:"20px 20px", position:"relative" }}>
          <div style={{ fontSize:9, fontWeight:800, color:"rgba(59,130,246,0.5)", textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:12 }}>🏛️ FLOOR PLAN · {totalSeated}/{guests.length} seated</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:12 }}>
            {tables.map(t => {
              const seated = guests.filter(g=>g.table===t.id);
              const full = seated.length >= t.cap;
              const canDrop = selected && !full;
              return (
                <div key={t.id} onClick={()=>canDrop&&assignToTable(t.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", cursor:canDrop?"pointer":"default" }}>
                  {/* Round table top view */}
                  <div style={{ position:"relative", width:90, height:90, marginBottom:6 }}>
                    {/* Table surface */}
                    <div style={{ position:"absolute", inset:8, borderRadius:"50%", background:canDrop?"rgba(196,122,46,0.2)":full?"rgba(34,197,94,0.12)":"rgba(255,255,255,0.06)", border:`2px solid ${canDrop?"#C47A2E":full?"#22c55e":"rgba(255,255,255,0.15)"}`, transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:10, fontWeight:700, color:full?"#22c55e":"rgba(255,255,255,0.5)", textAlign:"center", lineHeight:1.2 }}>{seated.length}/{t.cap}</span>
                    </div>
                    {/* Seats around perimeter */}
                    {Array.from({length: Math.min(t.cap, 8)}).map((_, si) => {
                      const angle = (si / Math.min(t.cap, 8)) * 2 * Math.PI - Math.PI/2;
                      const r = 40;
                      const x = 45 + Math.cos(angle) * r - 5;
                      const y = 45 + Math.sin(angle) * r - 5;
                      const hasGuest = seated[si];
                      return (
                        <div key={si} style={{ position:"absolute", left:x, top:y, width:10, height:10, borderRadius:"50%", background:hasGuest?(full?"#22c55e":"#C47A2E"):"rgba(255,255,255,0.1)", border:`1.5px solid ${hasGuest?(full?"#22c55e":"#C47A2E60"):"rgba(255,255,255,0.15)"}`, transition:"background 0.2s" }} title={hasGuest?.name} />
                      );
                    })}
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:full?"#22c55e":"#CCAB4A", textAlign:"center", marginBottom:4 }}>{t.name}</div>
                  {/* Guest name chips on table */}
                  {seated.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:3, justifyContent:"center", maxWidth:130 }}>
                      {seated.map(g => (
                        <span key={g.id} onClick={e=>{e.stopPropagation();removeFromTable(g.id);}} style={{ fontSize:9, padding:"1px 6px", borderRadius:100, background:"rgba(196,122,46,0.2)", color:"#CCAB4A", cursor:"pointer", border:"1px solid rgba(196,122,46,0.3)" }}>{g.name} ×</span>
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
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Unassigned guests ({unassigned.length})</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {unassigned.map(g => (
              <div key={g.id} onClick={()=>setSelected(g.id===selected?null:g.id)} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:100, background:selected===g.id?'rgba(196,122,46,0.2)':'rgba(255,255,255,0.06)', border:`1.5px solid ${selected===g.id?'#C47A2E':'rgba(255,255,255,0.1)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                <span style={{ fontSize:12, color:selected===g.id?'#CCAB4A':'rgba(255,255,255,0.7)', fontWeight:selected===g.id?700:400 }}>{g.name}</span>
                {selected===g.id && <span style={{ fontSize:10, color:'#C47A2E', fontWeight:800 }}>→ seat</span>}
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
      {/* Master envelope */}
      <div style={{ position:"relative", borderRadius:12, overflow:"hidden", marginBottom:16, boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
        {/* Envelope flap strip */}
        <div style={{ height:8, background:`linear-gradient(90deg,${gold},#F59E0B,${gold})`, opacity:0.85 }} />
        <div style={{ background:"linear-gradient(135deg,#1C1207,#120D05)", padding:"14px 16px", border:`1px solid ${gold}33`, borderTop:"none", borderRadius:"0 0 12px 12px" }}>
          <div style={{ fontSize:9, fontWeight:800, color:`${gold}80`, textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:6 }}>💰 TOTAL BUDGET ENVELOPE</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:total>0?12:0 }}>
            <span style={{ fontSize:22, color:'rgba(255,255,255,0.35)', fontWeight:700 }}>₹</span>
            <input type="number" value={data.total||''} onChange={e=>upd('total',e.target.value)} placeholder="0" style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:30, fontWeight:900, color:goldLt, fontFamily:font }} />
          </div>
          {total>0&&<>
            <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden', marginBottom:8 }}>
              <div style={{ height:'100%', width:`${Math.min(spent/total*100,100)}%`, background:overBudget?'#ef4444':gold, borderRadius:3, transition:'width 0.3s' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:700 }}>
              <span style={{ color:'rgba(255,255,255,0.45)' }}>Spent ₹{spent.toLocaleString('en-IN')}</span>
              <span style={{ color:overBudget?'#ef4444':'#22c55e' }}>{overBudget?`⚠️ Over ₹${(spent-total).toLocaleString('en-IN')}`:`₹${(total-spent).toLocaleString('en-IN')} left`}</span>
            </div>
          </>}
        </div>
      </div>

      {/* Category envelopes */}
      <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:10 }}>📬 Category Envelopes</div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {CATS.map(c=>{
          const alloc=Number(data[`alloc_${c.id}`]||0), act=Number(data[`spent_${c.id}`]||0);
          const pct=alloc>0?Math.min(act/alloc*100,100):0, over=alloc>0&&act>alloc;
          return (
            <div key={c.id} style={{ position:"relative", borderRadius:10, overflow:"hidden" }}>
              {/* Envelope top flap */}
              <div style={{ height:4, background:`linear-gradient(90deg,${c.color}99,${c.color},${c.color}99)` }} />
              <div style={{ background:'rgba(255,255,255,0.03)', padding:'10px 14px', border:`1px solid ${c.color}22`, borderTop:"none", borderRadius:"0 0 10px 10px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:c.color, marginBottom:8 }}>{c.label}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[['Allotted',`alloc_${c.id}`,'rgba(255,255,255,0.5)'],['Spent',`spent_${c.id}`,over?'#ef4444':'#fff']].map(([lbl,key,color])=>(
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
    <Modal onClose={onClose} title="Vendor Tracker" emoji="🎬" wide>
      {/* Backstage production board header */}
      <div style={{ background:"linear-gradient(135deg,#1a1207,#0f0a04)", borderRadius:14, padding:"12px 14px", marginBottom:14, border:"1px solid rgba(196,122,46,0.2)" }}>
        <div style={{ fontSize:9, fontWeight:800, color:"rgba(196,122,46,0.6)", textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:8 }}>🎬 PRODUCTION BOARD</div>
        {vendors.length>0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[['TOTAL COST',`₹${totalCost.toLocaleString('en-IN')}`,gold],['PAID',`₹${totalPaid.toLocaleString('en-IN')}`,'#22c55e'],['BALANCE',`₹${totalBal.toLocaleString('en-IN')}`,totalBal>0?'#f59e0b':'#22c55e']].map(([lbl,val,color])=>(
              <div key={lbl} style={{ textAlign:'center', background:`${color}10`, borderRadius:10, padding:'10px 6px', border:`1px solid ${color}25` }}>
                <div style={{ fontSize:16, fontWeight:900, color, fontVariantNumeric:"tabular-nums" }}>{val}</div>
                <div style={{ fontSize:8.5, color:`${color}80`, marginTop:3, fontWeight:800, letterSpacing:"0.08em" }}>{lbl}</div>
              </div>
            ))}
          </div>
        ) : <div style={{ fontSize:12, color:"rgba(196,122,46,0.4)", fontStyle:"italic" }}>No vendors yet. Build your backstage crew below.</div>}
      </div>

      {showAdd?(
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
            <button onClick={add} style={{ flex:1, background:gold, border:'none', borderRadius:9, padding:'10px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>Add to Board</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'10px 16px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:font, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      ):(
        <button onClick={()=>setShowAdd(true)} style={{ width:'100%', background:'rgba(196,122,46,0.1)', border:'1.5px dashed rgba(196,122,46,0.35)', borderRadius:10, padding:'11px', color:gold, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, marginBottom:14 }}>🎬 Add Vendor to Board</button>
      )}
      {vendors.length===0?(
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13, padding:'28px 0' }}>Add caterers, decorators, photographers…</div>
      ):(
        /* Group by status */
        <div>
          {Object.entries(STATUS).map(([statusKey, s]) => {
            const group = vendors.filter(v=>v.status===statusKey);
            if (!group.length) return null;
            return (
              <div key={statusKey} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:s.color }} />
                  <span style={{ fontSize:10, fontWeight:800, color:s.color, textTransform:"uppercase", letterSpacing:"0.12em" }}>{s.label}</span>
                  <span style={{ fontSize:9, fontWeight:700, color:`${s.color}60`, background:`${s.color}12`, padding:"2px 8px", borderRadius:100 }}>{group.length}</span>
                  <div style={{ flex:1, height:1, background:`${s.color}20` }} />
                </div>
                {group.map(v=>{
                  const balance=Number(v.total||0)-Number(v.deposit||0);
                  const ph=v.contact?.replace(/\D/g,'');
                  const isPhone=ph&&ph.length>=10;
                  return (
                    <div key={v.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'11px 13px', marginBottom:7, borderLeft:`3px solid ${s.color}`, display:'flex', flexDirection:'column', gap:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                            <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{v.name}</span>
                            <span style={{ fontSize:9, fontWeight:700, color:gold, background:'rgba(196,122,46,0.15)', padding:'2px 7px', borderRadius:100 }}>{v.cat}</span>
                          </div>
                          {v.contact&&(isPhone?<a href={`https://wa.me/${ph.startsWith('91')&&ph.length===12?ph:'91'+ph}`} target="_blank" rel="noreferrer" style={{ fontSize:10.5, color:'#25D366', textDecoration:'none', fontWeight:700, display:'block', marginTop:2 }}>📱 {v.contact}</a>:<div style={{ fontSize:10.5, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{v.contact}</div>)}
                          {v.notes&&<div style={{ fontSize:10.5, color:'rgba(255,255,255,0.28)', fontStyle:'italic', marginTop:2 }}>{v.notes}</div>}
                        </div>
                        <button onClick={()=>save(vendors.filter(x=>x.id!==v.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.15)', cursor:'pointer', fontSize:18, lineHeight:1 }}>×</button>
                      </div>
                      {(v.total||v.deposit)&&(
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5 }}>
                          {[['Total',v.total,'rgba(255,255,255,0.55)'],['Paid',v.deposit,'#22c55e'],['Bal',balance,balance>0?'#f59e0b':'#22c55e']].map(([lbl,val,color])=>(
                            <div key={lbl} style={{ textAlign:'center', background:'rgba(0,0,0,0.2)', borderRadius:7, padding:'5px 4px' }}>
                              <div style={{ fontSize:12, fontWeight:800, color, fontVariantNumeric:"tabular-nums" }}>₹{Number(val||0).toLocaleString('en-IN')}</div>
                              <div style={{ fontSize:8.5, color:'rgba(255,255,255,0.25)', marginTop:1 }}>{lbl}</div>
                            </div>
                          ))}
                        </div>
                      )}
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
      {/* WhatsApp phone shell */}
      <div style={{ background:"#111b21", borderRadius:16, overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)", marginBottom:12 }}>
        {/* WA header bar */}
        <div style={{ background:"#202c33", padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#25D366,#128C7E)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🏠</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#e9edef" }}>House Party Broadcast</div>
            <div style={{ fontSize:10.5, color:"#8696a0" }}>{PHASES.find(p=>p.id===phase)?.label}</div>
          </div>
          {hasVenue&&<div style={{ marginLeft:"auto", fontSize:9, fontWeight:700, color:"#25D366", background:"rgba(37,211,102,0.12)", padding:"3px 8px", borderRadius:100, border:"1px solid rgba(37,211,102,0.2)" }}>✓ Venue linked</div>}
        </div>
        {/* Phase tabs */}
        <div style={{ display:"flex", gap:0, borderBottom:"1px solid rgba(255,255,255,0.05)", background:"#1a2229" }}>
          {PHASES.map(p=>(
            <button key={p.id} onClick={()=>setPhase(p.id)} style={{ flex:1, padding:"8px 4px", background:"transparent", border:"none", borderBottom:`2px solid ${phase===p.id?"#25D366":"transparent"}`, color:phase===p.id?"#25D366":"#8696a0", fontSize:9.5, fontWeight:700, cursor:"pointer", fontFamily:font, textTransform:"uppercase", letterSpacing:"0.06em" }}>{p.emoji}</button>
          ))}
        </div>
        {/* Chat bubble */}
        <div style={{ background:"#0b141a", backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", padding:"16px 12px", minHeight:140 }}>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div style={{ maxWidth:"80%", background:"#005c4b", borderRadius:"12px 0 12px 12px", padding:"10px 12px", position:"relative" }}>
              <div style={{ fontSize:12, color:"#e9edef", lineHeight:1.6, whiteSpace:"pre-wrap", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>{msg}</div>
              <div style={{ fontSize:9, color:"rgba(134,150,160,0.8)", textAlign:"right", marginTop:4 }}>12:00 PM ✓✓</div>
              <div style={{ position:"absolute", top:0, right:-8, width:0, height:0, borderStyle:"solid", borderWidth:"0 0 10px 10px", borderColor:"transparent transparent transparent #005c4b" }} />
            </div>
          </div>
        </div>
        {/* Editable input area */}
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

  const BALLOT_COLORS = ["#7C3AED","#2563EB","#059669","#D97706","#DC2626","#DB2777"];

  return (
    <Modal onClose={onClose} emoji="🗳️" title="Venue Vote">
      {!room && <div style={{ background:"rgba(124,58,237,0.1)", border:"1.5px solid rgba(124,58,237,0.3)", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#C4B5FD", marginBottom:14 }}>Join a room for live voting</div>}
      {isHost && (
        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"12px 14px", marginBottom:14, border:"1px dashed rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:10 }}>🗳️ Add Ballot Option</div>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addVenue()} placeholder="Venue name…" style={{ ...inp, flex:2 }} />
            <input value={cost} onChange={e=>setCost(e.target.value)} placeholder="~₹ cost" style={{ ...inp, flex:1 }} />
          </div>
          <button onClick={addVenue} style={{ ...btn("#7C3AED") }}>+ Add to Ballot</button>
        </div>
      )}
      {venues.length === 0 ? (
        <div style={{ textAlign:"center", padding:"32px 0", color:"rgba(255,255,255,0.3)", fontSize:14 }}>
          {isHost?"Add venue options above":"Waiting for host to add venues…"}
        </div>
      ) : venues.map((v, vi) => {
        const voteCount = Object.keys(v.votes || {}).length;
        const pct = totalVotes > 0 ? Math.round(voteCount / totalVotes * 100) : 0;
        const myVote = v.votes?.[myName];
        const col = BALLOT_COLORS[vi % BALLOT_COLORS.length];
        const isLeading = voteCount > 0 && voteCount === Math.max(...venues.map(x=>Object.keys(x.votes||{}).length));
        return (
          <div key={v.id} style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px", marginBottom:10, border:`1.5px solid ${myVote?col+'55':'rgba(255,255,255,0.07)'}`, borderLeft:`4px solid ${col}`, position:"relative" }}>
            {isLeading && voteCount > 0 && <div style={{ position:"absolute", top:10, right:12, fontSize:9, fontWeight:800, color:"#F59E0B", background:"rgba(245,158,11,0.15)", padding:"2px 8px", borderRadius:100 }}>LEADING</div>}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:800, color:"#fff", fontFamily:font }}>{v.name}</div>
                {v.cost && <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{v.cost}</div>}
              </div>
              <button onClick={()=>vote(v.id)} style={{ padding:"8px 16px", borderRadius:100, border:`2px solid ${myVote?col:'rgba(255,255,255,0.15)'}`, background:myVote?`${col}30`:"transparent", color:myVote?col:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:font, flexShrink:0, transition:"all 0.15s" }}>
                {myVote?"✓ Voted":"Vote"}
              </button>
            </div>
            {/* Tally bar */}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"rgba(255,255,255,0.35)", marginBottom:5 }}>
              <span style={{ fontWeight:700 }}>{voteCount} vote{voteCount!==1?"s":""}</span>
              <span style={{ fontWeight:800, color:col }}>{pct}%</span>
            </div>
            <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${col}80,${col})`, borderRadius:4, transition:"width 0.4s ease" }} />
            </div>
            {/* Tally marks */}
            {voteCount > 0 && (
              <div style={{ marginTop:8, display:"flex", gap:3 }}>
                {Array.from({length:Math.min(voteCount,10)}).map((_,i)=>(
                  <div key={i} style={{ width:3, height:14, background:col, borderRadius:2, opacity:0.7 }} />
                ))}
                {voteCount>10 && <span style={{ fontSize:9, color:`${col}80`, fontWeight:700, alignSelf:"center" }}>+{voteCount-10}</span>}
              </div>
            )}
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
    <Modal onClose={onClose} emoji="📋" title="Group Checklist">
      {!room && <div style={{ background:"rgba(5,150,105,0.1)", border:"1.5px solid rgba(5,150,105,0.3)", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#6EE7B7", marginBottom:14 }}>Join a room to sync live</div>}
      {/* Physical clipboard */}
      <div style={{ background:"linear-gradient(180deg,#FFFBF0,#FFF8E7)", borderRadius:4, boxShadow:"0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)", position:"relative", marginBottom:14 }}>
        {/* Clipboard metal clip */}
        <div style={{ background:"linear-gradient(90deg,#9CA3AF,#6B7280,#9CA3AF)", height:20, borderRadius:"4px 4px 0 0", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:48, height:14, background:"linear-gradient(90deg,#4B5563,#6B7280,#4B5563)", borderRadius:4, border:"2px solid #374151", boxShadow:"0 2px 4px rgba(0,0,0,0.3)" }} />
        </div>
        {/* Paper */}
        <div style={{ padding:"14px 16px", backgroundImage:"repeating-linear-gradient(transparent, transparent 27px, rgba(59,130,246,0.12) 27px, rgba(59,130,246,0.12) 28px)", backgroundColor:"#FFFBF0" }}>
          {/* Red margin line */}
          <div style={{ position:"absolute", left:36, top:20, bottom:0, width:1, background:"rgba(239,68,68,0.2)", pointerEvents:"none" }} />
          {/* Progress */}
          {items.length > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <span style={{ fontSize:10, fontWeight:800, color:"rgba(0,0,0,0.4)", textTransform:"uppercase", letterSpacing:"0.1em" }}>Party Checklist</span>
              <span style={{ fontSize:10, fontWeight:800, color:done===items.length?"#059669":"rgba(0,0,0,0.35)" }}>{done}/{items.length} ✓</span>
            </div>
          )}
          {items.length === 0 ? (
            <div style={{ textAlign:"center", padding:"20px 0", color:"rgba(0,0,0,0.3)", fontSize:13, fontFamily:"Georgia,serif", fontStyle:"italic" }}>Add tasks below…</div>
          ) : items.map(it => (
            <div key={it.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, minHeight:28 }}>
              <button onClick={()=>toggle(it.id)} style={{ width:18, height:18, borderRadius:3, border:`2px solid ${it.done?"#059669":"rgba(0,0,0,0.3)"}`, background:it.done?"#059669":"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {it.done && <span style={{ fontSize:11, color:"#fff", lineHeight:1 }}>✓</span>}
              </button>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:13, color:it.done?"rgba(0,0,0,0.3)":"#1a1a1a", fontFamily:"Georgia,serif", textDecoration:it.done?"line-through":"none" }}>{it.text}</span>
                {it.doneBy && <span style={{ fontSize:10, color:"#059669", marginLeft:6, fontWeight:700 }}>— {it.doneBy}</span>}
              </div>
              <button onClick={()=>remove(it.id)} style={{ background:"none", border:"none", color:"rgba(0,0,0,0.2)", fontSize:16, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add a task to the checklist…" style={{ ...inp, flex:1 }} />
        <button onClick={add} style={{ ...btn("#059669"), width:"auto", padding:"10px 18px" }}>+</button>
      </div>
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

  const BILL_COLORS = ["#16A34A","#15803D","#166534","#14532D","#4ADE80","#22C55E"];

  return (
    <Modal onClose={onClose} emoji="🐷" title="Kitty Fund">
      {!room && <div style={{ background:"rgba(196,122,46,0.1)", border:"1.5px solid rgba(196,122,46,0.3)", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#FCD34D", marginBottom:14 }}>Join a room to pool contributions live</div>}

      {/* Physical collection jar */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
        <div style={{ position:"relative", width:120 }}>
          {/* Jar neck */}
          <div style={{ width:48, height:12, background:"linear-gradient(90deg,#6B7280,#9CA3AF,#6B7280)", borderRadius:"8px 8px 0 0", margin:"0 auto", border:"2px solid #4B5563" }} />
          {/* Jar lid slot */}
          <div style={{ width:60, height:6, background:"linear-gradient(90deg,#4B5563,#6B7280,#4B5563)", borderRadius:4, margin:"0 auto", marginTop:-2, position:"relative" }}>
            <div style={{ width:20, height:2, background:"#374151", borderRadius:2, position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)" }} />
          </div>
          {/* Jar body */}
          <div style={{ width:120, height:100, background:"linear-gradient(180deg,rgba(167,243,208,0.15),rgba(52,211,153,0.08))", border:"3px solid rgba(167,243,208,0.3)", borderRadius:"8px 8px 16px 16px", position:"relative", overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
            {/* Fill level */}
            {(target > 0 || total > 0) && (
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:`${target > 0 ? pct : Math.min(100, contributions.length * 10)}%`, background:"linear-gradient(180deg,rgba(74,222,128,0.25),rgba(22,163,74,0.35))", transition:"height 0.8s ease", borderTop:"1px solid rgba(74,222,128,0.4)" }} />
            )}
            {/* Stacked bills inside */}
            <div style={{ position:"absolute", bottom:8, left:8, right:8, display:"flex", flexDirection:"column-reverse", gap:3 }}>
              {contributions.slice(-4).map((c, i) => (
                <div key={c.id} style={{ height:8, background:`linear-gradient(90deg,${BILL_COLORS[i % BILL_COLORS.length]},${BILL_COLORS[(i+1) % BILL_COLORS.length]})`, borderRadius:2, opacity:0.7+i*0.08, boxShadow:"0 1px 3px rgba(0,0,0,0.3)" }} />
              ))}
            </div>
            {/* Shine */}
            <div style={{ position:"absolute", top:4, left:8, width:12, bottom:4, background:"rgba(255,255,255,0.06)", borderRadius:4 }} />
            {/* Amount label inside */}
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#4ADE80", textShadow:"0 1px 4px rgba(0,0,0,0.8)", fontFamily:font }}>₹{total.toLocaleString()}</div>
              {target > 0 && <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", marginTop:1, fontWeight:700 }}>{pct}%</div>}
            </div>
          </div>
          {/* Jar base */}
          <div style={{ width:110, height:8, background:"linear-gradient(90deg,#6B7280,#9CA3AF,#6B7280)", borderRadius:"0 0 8px 8px", margin:"0 auto", border:"2px solid #4B5563", borderTop:"none" }} />
        </div>
      </div>

      {/* Target progress */}
      {target > 0 ? (
        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
            <span style={{ color:"#4ADE80", fontWeight:700, fontFamily:font }}>₹{total.toLocaleString()} collected</span>
            <span style={{ color:"rgba(255,255,255,0.4)" }}>Goal: ₹{target.toLocaleString()}</span>
          </div>
          <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#16A34A,#4ADE80)", borderRadius:3, transition:"width 0.5s ease" }} />
          </div>
        </div>
      ) : (
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", textAlign:"center", marginBottom:12 }}>
          Total pooled: <strong style={{ color:"#4ADE80" }}>₹{total.toLocaleString()}</strong>
        </div>
      )}

      {isHost && !target && (
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          <input value={targetInput} onChange={e=>setTargetInput(e.target.value)} placeholder="Set collection target (₹)" type="number" style={{ ...inp, flex:1 }} />
          <button onClick={setTarget} style={{ ...btn("#16A34A"), width:"auto", padding:"10px 14px" }}>Set Goal</button>
        </div>
      )}

      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{ ...inp, flex:1 }} />
        <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="₹ Amount" type="number" style={{ ...inp, flex:1 }} />
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (optional)" style={{ ...inp, flex:1 }} onKeyDown={e=>e.key==="Enter"&&addContribution()} />
        <button onClick={addContribution} style={{ ...btn("#16A34A"), width:"auto", padding:"10px 16px" }}>+ Contribute</button>
      </div>

      {contributions.length === 0 ? (
        <div style={{ textAlign:"center", padding:"16px 0", color:"rgba(255,255,255,0.3)", fontSize:13 }}>No contributions yet — drop in the first! 🐷</div>
      ) : contributions.map((c, i) => (
        <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.04)", borderLeft:`3px solid ${BILL_COLORS[i % BILL_COLORS.length]}` }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:BILL_COLORS[i % BILL_COLORS.length], display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>₹</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:14, fontWeight:700, color:"#4ADE80", fontFamily:font }}>₹{Number(c.amount).toLocaleString()}</span>
              <span style={{ fontSize:13, color:"#fff" }}>— {c.name}</span>
            </div>
            {c.note && <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{c.note}</div>}
          </div>
          {(c.name === myName || isHost) && (
            <button onClick={()=>remove(c.id)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.2)", fontSize:18, cursor:"pointer", lineHeight:1, padding:"0 4px" }}>×</button>
          )}
        </div>
      ))}
    </Modal>
  );
}

// ── Room-based new tools ──────────────────────────────────────────────────────

const STICKY_COLORS = ["#FEF08A","#86EFAC","#FDA4AF","#93C5FD","#FCA5A5","#C4B5FD","#FCD34D","#6EE7B7"];
const STICKY_ROTATES = ["-2deg","1.5deg","-1deg","2.5deg","-3deg","1deg","-1.8deg","2deg"];

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

  const recent = items.slice(-6);

  return (
    <Modal onClose={onClose} emoji="⭐" title="Wish Wall" wide>
      {!room && <div style={{ background: "rgba(245,158,11,0.1)", border: "1.5px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#FCD34D", marginBottom: 14 }}>Join or host a room for live sharing</div>}

      {/* Corkboard wall */}
      <div style={{ background: "linear-gradient(135deg,#8B6914,#A0782A,#7A5C0E)", borderRadius: 18, padding: "20px 14px 16px", marginBottom: 16, minHeight: 160, position: "relative", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.5)", border: "4px solid #5C4308" }}>
        {/* Cork texture dots */}
        <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 14, backgroundImage: "radial-gradient(ellipse at 20% 30%, rgba(255,200,80,0.08) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.1) 0%, transparent 50%)", pointerEvents: "none" }} />

        {/* String across top */}
        <div style={{ position: "absolute", top: 14, left: 10, right: 10, height: 2, background: "rgba(0,0,0,0.3)", borderRadius: 1 }} />

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0 8px", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Be the first to pin a wish ⭐</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, paddingTop: 8 }}>
            {recent.map((item, i) => {
              const col = STICKY_COLORS[i % STICKY_COLORS.length];
              const rot = STICKY_ROTATES[i % STICKY_ROTATES.length];
              return (
                <div key={item.id || i} style={{ background: col, borderRadius: 4, padding: "8px 8px 10px", transform: `rotate(${rot})`, boxShadow: "0 3px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)", position: "relative" }}>
                  {/* Push pin */}
                  <div style={{ position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: "#DC2626", boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }} />
                  <div style={{ fontSize: 9, lineHeight: 1.5, color: "#1C1917", fontFamily: "Georgia, serif", fontWeight: 500, wordBreak: "break-word", maxHeight: 52, overflow: "hidden" }}>{item.text}</div>
                  {(item.name || item.by) && <div style={{ fontSize: 8, color: "#57534e", marginTop: 4, fontWeight: 700 }}>— {item.name || item.by}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full wall button */}
      {items.length > 0 && (
        <button onClick={()=>setShowWall(true)} style={{ width:"100%", padding:"10px", borderRadius:10, border:"1.5px solid rgba(245,158,11,0.35)", background:"rgba(245,158,11,0.1)", color:"#FCD34D", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:font, marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span>🖼️ View Full Wall</span>
          <span style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"1px 9px",fontSize:12}}>{items.length} wishes</span>
        </button>
      )}

      {/* Add input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Make a wish…" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...btn("#F59E0B"), width: "auto", padding: "10px 16px" }}>⭐ Pin</button>
      </div>
    </Modal>
  );
}

function MoodMeter({ onClose, room, myName, gameState, sendAction }) {
  const moods = gameState?.moods || {};
  const MOOD_OPTIONS = [
    { mood: "🔥", label: "On Fire",  color: "#EF4444", temp: 100 },
    { mood: "😄", label: "Happy",    color: "#22C55E", temp: 70  },
    { mood: "😎", label: "Chill",    color: "#3B82F6", temp: 40  },
    { mood: "🤔", label: "Unsure",   color: "#F59E0B", temp: 20  },
    { mood: "😴", label: "Sleepy",   color: "#C85A2A", temp: 5   },
  ];
  const myMood = moods[myName];
  const set = (mood, lbl) => sendAction?.('set-mood', { mood, label: lbl });

  // Compute dominant mood
  const moodCounts = {};
  Object.values(moods).forEach(m => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
  const dominantEmoji = Object.entries(moodCounts).sort((a,b) => b[1]-a[1])[0]?.[0];
  const dominantOption = MOOD_OPTIONS.find(o => o.mood === dominantEmoji);
  const avgTemp = Object.values(moods).length
    ? MOOD_OPTIONS.reduce((sum, o) => sum + (moodCounts[o.mood] || 0) * o.temp, 0) / Object.values(moods).length
    : 30;
  const thermColor = avgTemp > 70 ? "#EF4444" : avgTemp > 40 ? "#F97316" : avgTemp > 20 ? "#3B82F6" : "#8B5CF6";
  const vibeLabel = avgTemp > 70 ? "🔥 CHAOS MODE" : avgTemp > 40 ? "😄 Party Vibes" : avgTemp > 20 ? "😎 Chill Zone" : "😴 Need Energy";
  const totalPeople = Object.keys(moods).length;

  return (
    <Modal onClose={onClose} emoji="💫" title="Mood Meter">
      {!room && <div style={{ background: "rgba(236,72,153,0.1)", border: "1.5px solid rgba(236,72,153,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#F9A8D4", marginBottom: 14 }}>Join a room to share your mood live</div>}

      {/* Giant circular orb */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <div style={{ position: "relative", width: 160, height: 160 }}>
          {/* Outer glow ring */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(ellipse, ${thermColor}30 0%, transparent 70%)`, animation: "pulse 2s infinite" }} />
          {/* Orb */}
          <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: `radial-gradient(ellipse at 35% 35%, ${thermColor}80, ${thermColor}20)`, border: `3px solid ${thermColor}60`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <span style={{ fontSize: 36 }}>{dominantEmoji || "🌡️"}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.2, letterSpacing: "0.04em" }}>{vibeLabel}</span>
            {totalPeople > 0 && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{totalPeople} vibing</span>}
          </div>
          {/* Emoji particles around orb */}
          {Object.values(moods).slice(0, 8).map((m, i) => {
            const a = (i / Math.min(Object.values(moods).length, 8)) * 2 * Math.PI;
            const r = 68;
            return (
              <div key={i} style={{ position: "absolute", left: 80 + Math.cos(a) * r - 10, top: 80 + Math.sin(a) * r - 10, fontSize: 18, userSelect: "none" }}>{m.mood}</div>
            );
          })}
        </div>
      </div>

      {/* Mood selector row */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {MOOD_OPTIONS.map(({ mood, label, color }) => (
          <button key={mood} onClick={() => set(mood, label)} style={{ flex: 1, padding: "12px 4px", borderRadius: 14, border: `2px solid ${myMood?.mood === mood ? color : "rgba(255,255,255,0.1)"}`, background: myMood?.mood === mood ? `${color}30` : "rgba(255,255,255,0.04)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all 0.15s", fontFamily: font, transform: myMood?.mood === mood ? "scale(1.08)" : "scale(1)" }}>
            <span style={{ fontSize: 22 }}>{mood}</span>
            <span style={{ fontSize: 9, color: myMood?.mood === mood ? color : "rgba(255,255,255,0.35)", fontWeight: 700 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Who's what mood */}
      {totalPeople > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(moods).map(([name, m]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 100, padding: "4px 10px", fontSize: 12 }}>
              <span>{m.mood}</span>
              <span style={{ color: name === myName ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: name === myName ? 700 : 400 }}>{name}</span>
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
  const [openedIds, setOpenedIds] = useState(new Set());
  const msgs = gameState?.messages || [];

  const send = () => {
    if (!text.trim()) return;
    sendAction?.('send', { text: text.trim(), to });
    setText('');
  };
  const openEnvelope = (id) => setOpenedIds(s => new Set([...s, id]));

  return (
    <Modal onClose={onClose} emoji="🤫" title="Secret Messages">
      {!room && <div style={{ background: "rgba(99,102,241,0.1)", border: "1.5px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#A5B4FC", marginBottom: 14 }}>Join a room to send live secret messages</div>}

      {/* To selector */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Send to</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["everyone", ...(players || [])].map(p => (
            <button key={p} onClick={() => setTo(p)} style={{ padding: "5px 12px", borderRadius: 100, border: `1.5px solid ${to === p ? "#6366F1" : "rgba(255,255,255,0.1)"}`, background: to === p ? "rgba(99,102,241,0.25)" : "transparent", color: to === p ? "#A5B4FC" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              {p === "everyone" ? "🌐 Everyone" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Your secret message…" style={{ ...inp, flex: 1 }} />
        <button onClick={send} style={{ ...btn("#6366F1"), width: "auto", padding: "10px 16px" }}>Send 🔒</button>
      </div>

      {/* Envelope pile */}
      {msgs.length === 0 ? (
        <div style={{ textAlign:"center", padding:"28px 0" }}>
          <div style={{ fontSize:40, marginBottom:8 }}>📬</div>
          <div style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>No messages yet — send the first secret</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>
            {msgs.filter(m=>!openedIds.has(m.id)).length} sealed · {openedIds.size} opened
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {msgs.map((m, i) => {
              const opened = openedIds.has(m.id);
              const envColor = ["#7C3AED","#2563EB","#DC2626","#D97706","#059669","#DB2777"][i % 6];
              return (
                <div key={m.id}>
                  {!opened ? (
                    /* Physical sealed envelope */
                    <div onClick={()=>openEnvelope(m.id)} style={{ cursor:"pointer", position:"relative", borderRadius:8, overflow:"hidden" }} onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                      {/* Envelope body */}
                      <div style={{ background:`linear-gradient(135deg,${envColor}22,${envColor}11)`, border:`2px solid ${envColor}55`, borderRadius:8, padding:"12px 14px 14px" }}>
                        {/* Envelope flap triangle */}
                        <div style={{ position:"absolute", top:0, left:0, right:0, height:0, borderLeft:"100% solid transparent", borderTop:`40px solid ${envColor}40` }} />
                        {/* Wax seal */}
                        <div style={{ position:"absolute", top:16, left:"50%", transform:"translateX(-50%)", width:28, height:28, borderRadius:"50%", background:`radial-gradient(circle at 35% 35%, ${envColor}, ${envColor}AA)`, boxShadow:`0 2px 8px ${envColor}66`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, border:`2px solid ${envColor}` }}>🔒</div>
                        <div style={{ marginTop:36, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:`${envColor}CC`, textTransform:"uppercase", letterSpacing:"0.08em" }}>To: {m.to || "everyone"}</div>
                            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:2 }}>Tap to break seal</div>
                          </div>
                          <div style={{ background:envColor, borderRadius:6, padding:"3px 10px", fontSize:10, fontWeight:800, color:"#fff", letterSpacing:"0.06em" }}>SEALED</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Opened — letter inside */
                    <div style={{ background:"linear-gradient(135deg,#FFFBF5,#FFF8E7)", borderRadius:8, padding:"14px 16px", boxShadow:`0 0 0 2px ${envColor}55, 0 4px 16px rgba(0,0,0,0.4)`, position:"relative" }}>
                      {/* Torn top edge */}
                      <div style={{ position:"absolute", top:-2, left:0, right:0, height:6, background:"linear-gradient(90deg,#FFFBF5 0%,#FFF0D0 50%,#FFFBF5 100%)", borderRadius:"0 0 4px 4px" }} />
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:envColor, flexShrink:0 }} />
                        <span style={{ fontSize:10, fontWeight:800, color:"rgba(0,0,0,0.4)", textTransform:"uppercase", letterSpacing:"0.08em" }}>To: {m.to || "everyone"}</span>
                      </div>
                      <div style={{ fontSize:14, color:"#1a1a1a", lineHeight:1.65, fontStyle:"italic", fontFamily:"Georgia,serif" }}>"{m.text}"</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

const ENVELOPE_COLORS = ["#F43F5E","#EC4899","#8B5CF6","#F97316","#EF4444","#D946EF","#FB7185","#E879F9"];

function LoveNotes({ onClose, room, myName, gameState, sendAction, sendEffect }) {
  const [text, setText] = useState('');
  const [showWall, setShowWall] = useState(false);
  const [openedIds, setOpenedIds] = useState(new Set());
  const items = gameState?.items || [];

  const add = () => {
    if (!text.trim()) return;
    sendAction?.('add', { text: text.trim(), emoji: '💌' });
    sendEffect?.('love', { text: text.trim() });
    setText('');
  };

  const toggleOpen = (id) => setOpenedIds(s => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });

  if (showWall) return <DesignerWall onClose={()=>setShowWall(false)} items={items} title="Love Notes Wall" wallEmoji="💌" />;

  const recent = items.slice(-6);

  return (
    <Modal onClose={onClose} emoji="💌" title="Love Notes Wall" wide>
      <style>{`@keyframes ln-swing{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}} @keyframes ln-sway{0%,100%{transform:rotate(1.5deg)}50%{transform:rotate(-1.5deg)}}`}</style>
      {!room && <div style={{ background: "rgba(244,63,94,0.1)", border: "1.5px solid rgba(244,63,94,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#FDA4AF", marginBottom: 14 }}>Join a room to share live love notes</div>}

      {/* Hanging string display */}
      <div style={{ background: "linear-gradient(180deg,#1a0a12,#0f0508)", borderRadius: 18, padding: "0 0 16px", marginBottom: 16, overflow: "hidden", border: "1px solid rgba(244,63,94,0.2)", minHeight: 180 }}>
        {/* String line */}
        <div style={{ height: 3, background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.6),rgba(244,63,94,0.8),rgba(244,63,94,0.6),transparent)", margin: "0 -1px 8px" }} />

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💌</div>
            Be the first to hang a love note!
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, padding: "4px 16px 0", overflowX: "auto" }}>
            {recent.map((item, i) => {
              const col = ENVELOPE_COLORS[i % ENVELOPE_COLORS.length];
              const isOpen = openedIds.has(item.id || i);
              const anim = i % 2 === 0 ? "ln-swing 4s ease-in-out infinite" : "ln-sway 3.5s ease-in-out infinite";
              return (
                <div key={item.id || i} onClick={() => toggleOpen(item.id || i)} style={{ flexShrink: 0, width: 90, cursor: "pointer", animation: anim, transformOrigin: "50% 0%" }}>
                  {/* Clip/peg */}
                  <div style={{ width: 12, height: 18, background: "#D4B896", borderRadius: 2, margin: "0 auto -2px", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }} />

                  {/* Envelope */}
                  <div style={{ background: isOpen ? `${col}20` : col, borderRadius: 8, padding: isOpen ? "10px 8px" : "12px 8px", border: `2px solid ${col}`, boxShadow: `0 4px 16px ${col}40`, transition: "all 0.3s" }}>
                    {!isOpen ? (
                      /* Sealed envelope */
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22 }}>💌</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", marginTop: 4, fontWeight: 700 }}>TAP TO OPEN</div>
                        {(item.name || item.by) && <div style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>from {item.name || item.by}</div>}
                      </div>
                    ) : (
                      /* Opened */
                      <div>
                        <div style={{ fontSize: 7, lineHeight: 1.5, color: col, fontFamily: "Georgia, serif", fontStyle: "italic", wordBreak: "break-word" }}>{item.text?.slice(0, 80)}</div>
                        {(item.name || item.by) && <div style={{ fontSize: 6, color: "rgba(255,255,255,0.4)", marginTop: 4, fontWeight: 700 }}>— {item.name || item.by}</div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {items.length > 6 && (
              <div style={{ flexShrink: 0, width: 70, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>+{items.length - 6} more</div>
            )}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <button onClick={()=>setShowWall(true)} style={{ width:"100%", padding:"10px", borderRadius:10, border:"1.5px solid rgba(244,63,94,0.35)", background:"rgba(244,63,94,0.1)", color:"#FDA4AF", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:font, marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span>💌 View All Notes</span>
          <span style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"1px 9px",fontSize:12}}>{items.length}</span>
        </button>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Write a sweet note…" style={{ ...inp, flex: 1 }} />
        <button onClick={add} style={{ ...btn("#F43F5E"), width: "auto", padding: "10px 16px" }}>💌 Send</button>
      </div>
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

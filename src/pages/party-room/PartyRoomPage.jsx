import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePartyRoom } from "../../hooks/usePartyRoom";
import {
  TRUTHS, DARES, NEVER_HAVE_I, WOULD_YOU_RATHER, HOT_TAKES,
} from "../../data/housePartyData";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:    "#0c0903",
  card:  "rgba(255,248,236,0.04)",
  gold:  "#C47A2E",
  goldL: "#CCAB4A",
  text:  "#FFF8EC",
  muted: "rgba(255,248,236,0.4)",
  dim:   "rgba(255,248,236,0.12)",
  err:   "#e55",
  green: "#4ade80",
};
const font  = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";

// ── SVG helper ────────────────────────────────────────────────────────────
const ic = (d, sz = 18) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

// ── Game content ──────────────────────────────────────────────────────────
const MOST_LIKELY = [
  "Most likely to accidentally DM someone they're talking about",
  "Most likely to eat the last piece without asking",
  "Most likely to cry at a movie alone",
  "Most likely to be late to their own birthday",
  "Most likely to go viral for something embarrassing",
  "Most likely to fall asleep at the party",
  "Most likely to marry a celebrity",
  "Most likely to become a meme",
  "Most likely to forget where they put their phone",
  "Most likely to still be texting at 2am",
  "Most likely to start a business and quit in a week",
  "Most likely to order food for themselves at someone else's party",
  "Most likely to overshare on Instagram",
  "Most likely to accidentally like a 4-year-old post",
  "Most likely to end up on a reality show",
  "Most likely to give unsolicited life advice",
  "Most likely to screenshot this and share it",
];

const RAPID_FIRE = [
  { q: "What's the capital of Australia?", a: "Canberra" },
  { q: "How many sides does a hexagon have?", a: "6" },
  { q: "What year did India gain independence?", a: "1947" },
  { q: "Name the largest ocean on Earth.", a: "Pacific" },
  { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci" },
  { q: "What currency does Japan use?", a: "Yen" },
  { q: "How many planets are in our solar system?", a: "8" },
  { q: "What language has the most native speakers worldwide?", a: "Mandarin" },
  { q: "Name the fastest land animal.", a: "Cheetah" },
  { q: "What element has the symbol Au?", a: "Gold" },
  { q: "How many minutes in a day?", a: "1440" },
  { q: "Who wrote Harry Potter?", a: "J.K. Rowling" },
  { q: "What is the square root of 144?", a: "12" },
  { q: "Name India's national animal.", a: "Tiger" },
  { q: "In which country is the Great Wall?", a: "China" },
];

const GAMES = [
  { id: "most-likely",  label: "Most Likely To",  desc: "Vote for who'd do it",       color: "#C47A2E", icon: ic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>) },
  { id: "would-you",   label: "Would You Rather", desc: "A or B — everyone picks",    color: "#7C3AED", icon: ic(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>) },
  { id: "hot-takes",   label: "Hot Takes",        desc: "Agree or disagree",          color: "#EF4444", icon: ic(<><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></>) },
  { id: "never-have-i",label: "Never Have I Ever",desc: "Who's done the most?",       color: "#059669", icon: ic(<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>) },
  { id: "truth-dare",  label: "Truth or Dare",    desc: "Pick truth or face the dare", color: "#2563EB", icon: ic(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></>) },
  { id: "rapid-fire",  label: "Rapid Fire",       desc: "Race to answer first",        color: "#D97706", icon: ic(<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>) },
];

// ── Shared UI pieces ──────────────────────────────────────────────────────

function Pill({ label, score, isMe, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 52 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: isMe ? `linear-gradient(135deg, ${accent}, ${accent}99)` : "rgba(255,248,236,0.08)",
        border: `2px solid ${isMe ? accent : "rgba(255,248,236,0.12)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 800, color: isMe ? "#fff" : C.text,
      }}>
        {label[0]?.toUpperCase()}
      </div>
      <div style={{ fontSize: 10, color: isMe ? accent : C.muted, fontWeight: 600, letterSpacing: "0.02em", maxWidth: 52, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
      {score > 0 && (
        <div style={{ fontSize: 10, fontWeight: 800, color: C.goldL, background: "rgba(196,122,46,0.18)", borderRadius: 100, padding: "1px 7px" }}>{score}</div>
      )}
    </div>
  );
}

function Scores({ players, scores, myName, accent }) {
  const sorted = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  return (
    <div style={{ padding: "16px", background: C.card, border: `1px solid ${C.dim}`, borderRadius: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>Leaderboard</div>
      {sorted.map((p, i) => (
        <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < sorted.length - 1 ? `1px solid ${C.dim}` : "none" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: i === 0 ? C.goldL : C.muted, minWidth: 18, textAlign: "center" }}>
            {i === 0 ? "👑" : `${i + 1}`}
          </div>
          <div style={{ flex: 1, fontSize: 14, fontWeight: p === myName ? 700 : 500, color: p === myName ? C.text : C.muted }}>{p}{p === myName ? " (you)" : ""}</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: (scores[p] || 0) > 0 ? C.goldL : C.muted }}>{scores[p] || 0}</div>
        </div>
      ))}
    </div>
  );
}

// ── Game components ────────────────────────────────────────────────────────

function MostLikelyGame({ room, myName, isHost, dispatch, accent, onScore }) {
  const gs     = room.gameState || {};
  const idx    = gs.idx || 0;
  const prompt = MOST_LIKELY[idx % MOST_LIKELY.length];
  const votes  = gs.votes || {};
  const myVote = votes[myName];
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setRevealed(false); }, [idx]);

  // Tally votes
  const tally = {};
  Object.values(votes).forEach(name => { tally[name] = (tally[name] || 0) + 1; });
  const sortedTally = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const winner = sortedTally[0]?.[0];
  const voteCount = Object.keys(votes).length;
  const playerCount = room.players?.length || 1;

  const handleVote = (name) => {
    if (myVote) return;
    dispatch("vote", { name });
  };

  const handleReveal = () => {
    setRevealed(true);
    if (winner) onScore(winner, 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center", padding: "24px 8px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>
          Most Likely To…
        </div>
        <div style={{ fontFamily: serif, fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 600, color: C.text, lineHeight: 1.25, marginBottom: 8 }}>
          {prompt}
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>{voteCount} / {playerCount} voted</div>
      </div>

      {!revealed ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {(room.players || []).map(p => (
              <button key={p} onClick={() => handleVote(p)} disabled={!!myVote}
                style={{
                  padding: "10px 20px", borderRadius: 100, fontSize: 14, fontWeight: 700,
                  fontFamily: font, cursor: myVote ? "default" : "pointer",
                  border: `2px solid ${myVote === p ? accent : C.dim}`,
                  background: myVote === p ? `${accent}22` : C.card,
                  color: myVote === p ? accent : C.text,
                  transition: "all 0.15s",
                }}>
                {p}{myVote === p ? " ✓" : ""}
              </button>
            ))}
          </div>
          {myVote && !isHost && (
            <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>Waiting for host to reveal…</div>
          )}
          {isHost && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleReveal}
                style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: accent, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                Reveal →
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>The room voted…</div>
          {sortedTally.map(([name, count]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", marginBottom: 8, borderRadius: 12, background: name === winner ? `${accent}22` : C.card, border: `1.5px solid ${name === winner ? accent + "66" : C.dim}` }}>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: name === winner ? accent : C.text }}>{name}{name === winner ? " 👑" : ""}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.goldL }}>{count} vote{count !== 1 ? "s" : ""}</div>
            </div>
          ))}
          {isHost && (
            <button onClick={() => dispatch("next", {})}
              style={{ marginTop: 16, width: "100%", padding: "13px", borderRadius: 14, border: "none", background: C.card, border: `1.5px solid ${C.dim}`, color: C.text, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Next Round →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function WouldYouGame({ room, myName, isHost, dispatch, accent }) {
  const gs    = room.gameState || {};
  const idx   = gs.pairIdx || 0;
  const pair  = WOULD_YOU_RATHER[idx % WOULD_YOU_RATHER.length] || {};
  const votes = gs.votes || {};
  const myChoice = votes[myName];
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setRevealed(false); }, [idx]);

  const aCount = Object.values(votes).filter(v => v === "A").length;
  const bCount = Object.values(votes).filter(v => v === "B").length;
  const total  = aCount + bCount;

  // Handle both {a, b} and string array formats
  const optA = pair.a || (Array.isArray(pair) ? pair[0] : "Option A");
  const optB = pair.b || (Array.isArray(pair) ? pair[1] : "Option B");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", padding: "24px 8px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>
          Would You Rather…
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[{ key: "A", label: optA, count: aCount }, { key: "B", label: optB, count: bCount }].map(({ key, label, count }) => {
          const pct = total ? Math.round((count / total) * 100) : 0;
          const chosen = myChoice === key;
          return (
            <button key={key} onClick={() => !myChoice && dispatch("vote", { choice: key })}
              disabled={!!myChoice} style={{
                display: "flex", alignItems: "center", gap: 14, width: "100%",
                padding: "16px 18px", borderRadius: 16, border: `2px solid ${chosen ? accent : C.dim}`,
                background: chosen ? `${accent}18` : C.card, cursor: myChoice ? "default" : "pointer",
                fontFamily: font, textAlign: "left", position: "relative", overflow: "hidden",
                transition: "all 0.18s",
              }}>
              {revealed && (
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `${accent}18`, pointerEvents: "none", transition: "width 0.6s ease" }} />
              )}
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${chosen ? accent : C.dim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: chosen ? accent : C.muted, flexShrink: 0, position: "relative" }}>
                {key}
              </div>
              <div style={{ flex: 1, fontSize: 15, fontWeight: chosen ? 700 : 500, color: C.text, lineHeight: 1.35, position: "relative" }}>
                {label}
              </div>
              {revealed && (
                <div style={{ fontSize: 13, fontWeight: 800, color: C.goldL, position: "relative" }}>{pct}%</div>
              )}
            </button>
          );
        })}
      </div>
      {myChoice && !revealed && !isHost && (
        <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>Waiting for host to reveal…</div>
      )}
      {isHost && (
        <div style={{ display: "flex", gap: 10 }}>
          {!revealed && (
            <button onClick={() => setRevealed(true)}
              style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: accent, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
              Reveal Split
            </button>
          )}
          <button onClick={() => { setRevealed(false); dispatch("next", {}); }}
            style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1.5px solid ${C.dim}`, background: C.card, color: C.text, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function HotTakesGame({ room, myName, isHost, dispatch, accent }) {
  const gs    = room.gameState || {};
  const idx   = gs.idx || 0;
  const take  = HOT_TAKES[idx % HOT_TAKES.length] || "Hot take…";
  const votes = gs.votes || {};
  const myVote = votes[myName];
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setRevealed(false); }, [idx]);

  const agreeCount    = Object.values(votes).filter(v => v === "agree").length;
  const disagreeCount = Object.values(votes).filter(v => v === "disagree").length;
  const total = agreeCount + disagreeCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", padding: "24px 8px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>Hot Take</div>
        <div style={{ fontFamily: serif, fontSize: "clamp(1.25rem,3.5vw,1.75rem)", fontWeight: 600, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>
          "{take}"
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>{total} / {room.players?.length || 1} voted</div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { key: "agree",    label: "Agree",    bg: "#05966922", border: "#05966966", color: "#4ade80" },
          { key: "disagree", label: "Disagree", bg: "#EF444422", border: "#EF444466", color: "#f87171" },
        ].map(({ key, label, bg, border, color }) => {
          const count = key === "agree" ? agreeCount : disagreeCount;
          const pct   = total ? Math.round((count / total) * 100) : 0;
          const chosen = myVote === key;
          return (
            <button key={key} onClick={() => !myVote && dispatch("vote", { choice: key })}
              disabled={!!myVote}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "18px 12px", borderRadius: 18,
                border: `2px solid ${chosen ? border : C.dim}`,
                background: chosen ? bg : C.card,
                cursor: myVote ? "default" : "pointer", fontFamily: font, transition: "all 0.18s",
              }}>
              <span style={{ fontSize: 22, color }}>{key === "agree" ? "👍" : "👎"}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: chosen ? color : C.text }}>{label}</span>
              {revealed && <span style={{ fontSize: 13, fontWeight: 800, color: C.goldL }}>{pct}%</span>}
            </button>
          );
        })}
      </div>
      {myVote && !revealed && !isHost && (
        <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>Waiting for host to reveal…</div>
      )}
      {isHost && (
        <div style={{ display: "flex", gap: 10 }}>
          {!revealed && (
            <button onClick={() => setRevealed(true)}
              style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "#EF4444", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
              Reveal
            </button>
          )}
          <button onClick={() => { setRevealed(false); dispatch("next", {}); }}
            style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1.5px solid ${C.dim}`, background: C.card, color: C.text, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function NeverHaveIGame({ room, myName, isHost, dispatch, accent }) {
  const gs  = room.gameState || {};
  const idx = gs.idx || 0;
  const stmt = NEVER_HAVE_I[idx % NEVER_HAVE_I.length] || "Never have I ever…";
  const scores = gs.scores || {};
  const myScore = scores[myName] || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center", padding: "24px 8px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>
          Never Have I Ever…
        </div>
        <div style={{ fontFamily: serif, fontSize: "clamp(1.25rem,3.5vw,1.75rem)", fontWeight: 600, color: C.text, lineHeight: 1.3 }}>
          {stmt}
        </div>
      </div>
      <div style={{ padding: "0 8px" }}>
        <button onClick={() => dispatch("mark", {})}
          style={{
            width: "100%", padding: "18px", borderRadius: 18, border: `2px solid #05966966`,
            background: "#05966914", color: "#4ade80",
            fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: font,
          }}>
          I've done it 🤚
        </button>
        {myScore > 0 && (
          <div style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 8 }}>
            You've done {myScore} thing{myScore !== 1 ? "s" : ""} tonight
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {(room.players || []).map(p => {
          const s = scores[p] || 0;
          return s > 0 ? (
            <div key={p} style={{ padding: "5px 12px", borderRadius: 100, background: "#05966918", border: "1px solid #05966955", fontSize: 12, fontWeight: 700, color: "#4ade80" }}>
              {p}: {s}
            </div>
          ) : null;
        })}
      </div>
      {isHost && (
        <button onClick={() => dispatch("next", {})}
          style={{ padding: "13px", borderRadius: 14, border: `1.5px solid ${C.dim}`, background: C.card, color: C.text, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
          Next Statement →
        </button>
      )}
    </div>
  );
}

function TruthDareGame({ room, myName, isHost, dispatch, accent }) {
  const gs      = room.gameState || {};
  const cardIdx = gs.cardIdx || 0;
  const mode    = gs.mode;
  const cards   = mode === "truth" ? TRUTHS : DARES;
  const card    = cards[cardIdx % cards.length];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center", padding: "24px 8px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>
          Truth or Dare
        </div>
      </div>
      {!mode ? (
        <>
          <div style={{ textAlign: "center", fontSize: 15, color: C.muted, marginBottom: 8 }}>
            {isHost ? "Pick a card type to deal" : "Waiting for host…"}
          </div>
          {isHost && (
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => dispatch("pick", { mode: "truth" })}
                style={{ flex: 1, padding: "18px", borderRadius: 18, border: "2px solid #2563EB66", background: "#2563EB18", color: "#60a5fa", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                Truth
              </button>
              <button onClick={() => dispatch("pick", { mode: "dare" })}
                style={{ flex: 1, padding: "18px", borderRadius: 18, border: "2px solid #EF444466", background: "#EF444418", color: "#f87171", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                Dare
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{
            padding: "28px 20px", borderRadius: 20,
            background: mode === "truth" ? "#2563EB14" : "#EF444414",
            border: `2px solid ${mode === "truth" ? "#2563EB55" : "#EF444455"}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: mode === "truth" ? "#60a5fa" : "#f87171", marginBottom: 14 }}>
              {mode === "truth" ? "Truth" : "Dare"}
            </div>
            <div style={{ fontFamily: serif, fontSize: "clamp(1.15rem,3vw,1.5rem)", fontWeight: 600, color: C.text, lineHeight: 1.45 }}>
              {card}
            </div>
          </div>
          {isHost && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => dispatch("pick", { mode: null })}
                style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1.5px solid ${C.dim}`, background: C.card, color: C.muted, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                ← Back
              </button>
              <button onClick={() => dispatch("next", {})}
                style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: accent, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                Next Card →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RapidFireGame({ room, myName, isHost, dispatch, accent, onScore }) {
  const gs    = room.gameState || {};
  const idx   = gs.idx || 0;
  const item  = RAPID_FIRE[idx % RAPID_FIRE.length];
  const [showAnswer, setShowAnswer] = useState(false);
  const [buzzing, setBuzzing]       = useState(null); // player who raised hand

  const buzzes = gs.votes || {};
  const myBuzz = buzzes[myName];

  useEffect(() => { setShowAnswer(false); setBuzzing(null); }, [idx]);

  const firstBuzz = Object.entries(buzzes).sort((a, b) => (a[1] < b[1] ? -1 : 1))[0]?.[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center", padding: "24px 8px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>
          Rapid Fire — Q{(idx % RAPID_FIRE.length) + 1} of {RAPID_FIRE.length}
        </div>
        <div style={{ fontFamily: serif, fontSize: "clamp(1.3rem,3.5vw,1.8rem)", fontWeight: 600, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>
          {item.q}
        </div>
      </div>

      {showAnswer && (
        <div style={{ padding: "16px", borderRadius: 14, background: "#D9770618", border: "1.5px solid #D9770666", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700, marginBottom: 4 }}>Answer</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{item.a}</div>
        </div>
      )}

      {!isHost ? (
        <button
          onClick={() => !myBuzz && dispatch("vote", { choice: Date.now().toString() })}
          disabled={!!myBuzz}
          style={{
            padding: "22px", borderRadius: 20, border: `2px solid ${myBuzz ? "#D9770666" : "#D97706"}`,
            background: myBuzz ? "#D9770618" : "#D97706", color: "#fff",
            fontSize: 18, fontWeight: 900, cursor: myBuzz ? "default" : "pointer", fontFamily: font,
            transition: "all 0.15s",
          }}>
          {myBuzz ? "✓ Hand raised!" : "🙋 I know the answer!"}
        </button>
      ) : (
        <>
          {firstBuzz && !showAnswer && (
            <div style={{ padding: "14px 18px", borderRadius: 14, background: "#D9770618", border: "1.5px solid #D9770655", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🙋</span>
              <div>
                <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>First to buzz in</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{firstBuzz}</div>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            {!showAnswer && (
              <button onClick={() => setShowAnswer(true)}
                style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "#D97706", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                Show Answer
              </button>
            )}
            {showAnswer && firstBuzz && (
              <button onClick={() => { onScore(firstBuzz, 1); dispatch("next", {}); }}
                style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "#059669", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                ✓ {firstBuzz} got it
              </button>
            )}
            <button onClick={() => dispatch("next", {})}
              style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1.5px solid ${C.dim}`, background: C.card, color: C.text, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── GameView router ────────────────────────────────────────────────────────
function GameView({ room, myName, isHost, dispatch, accent, onScore }) {
  const props = { room, myName, isHost, dispatch, accent, onScore };
  switch (room.currentGame) {
    case "most-likely":  return <MostLikelyGame  {...props} />;
    case "would-you":    return <WouldYouGame    {...props} />;
    case "hot-takes":    return <HotTakesGame    {...props} />;
    case "never-have-i": return <NeverHaveIGame  {...props} />;
    case "truth-dare":   return <TruthDareGame   {...props} />;
    case "rapid-fire":   return <RapidFireGame   {...props} />;
    default: return (
      <div style={{ textAlign: "center", padding: "48px 24px", color: C.muted, fontFamily: font }}>
        Game not found. Host, please pick a game.
      </div>
    );
  }
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PartyRoomPage() {
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const { room, connected, error: sockError, myName, createRoom, joinRoom, dispatch, setGame, leaveRoom } = usePartyRoom();

  // Local UI state
  const [phase, setPhase]       = useState("lobby"); // lobby | creating | joining | room
  const [hostName, setHostName] = useState("");
  const [partyName, setPartyName] = useState("");
  const [joinCode, setJoinCode] = useState(params.get("code") || "");
  const [joinName, setJoinName] = useState("");
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");
  const [tab, setTab]           = useState("game"); // game | scores
  const [showPicker, setShowPicker] = useState(false);
  const [copied, setCopied]     = useState(false);

  const isHost   = room?.hostName === myName;
  const accent   = C.gold;
  const scores   = room?.gameState?._scores || {};

  // Auto-join if ?code= in URL
  useEffect(() => {
    const code = params.get("code");
    if (code && !room) { setJoinCode(code.toUpperCase()); setPhase("joining"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move to room phase when room is set
  useEffect(() => {
    if (room) setPhase("room");
  }, [room]);

  const handleCreate = async () => {
    if (!hostName.trim()) return;
    setLoading(true); setErr("");
    const res = await createRoom({ occasionType: "house-party", partyName: partyName.trim() || "Party Night", hostName: hostName.trim() });
    setLoading(false);
    if (!res.ok) setErr(res.error || "Failed to create room");
  };

  const handleJoin = async () => {
    if (joinCode.length < 6 || !joinName.trim()) return;
    setLoading(true); setErr("");
    const res = await joinRoom({ code: joinCode, name: joinName.trim() });
    setLoading(false);
    if (!res.ok) setErr(res.error || "Room not found — check the code and try again.");
  };

  const handlePickGame = (gameId) => {
    const existing = room?.gameState?._scores || {};
    setGame(gameId, { _scores: existing });
    setShowPicker(false);
    setTab("game");
  };

  const handleEndGame = () => {
    const existing = room?.gameState?._scores || {};
    setGame(null, { _scores: existing });
    setShowPicker(true);
    setTab("game");
  };

  const handleScore = async (player, points) => {
    await dispatch("score-add", { player, points });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/play?code=${room.code}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleLeave = () => { leaveRoom(); navigate(-1); };

  // ── Lobby ─────────────────────────────────────────────────────────────
  if (phase === "lobby") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: font, padding: "24px 20px" }}>
        <style>{`@keyframes glow-pulse{0%,100%{opacity:0.6}50%{opacity:1}} input,textarea{font-family:${font}}`}</style>

        <button onClick={() => navigate(-1)} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: font, display: "flex", alignItems: "center", gap: 5 }}>
          ← Back
        </button>

        <div style={{ maxWidth: 400, width: "100%" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 8px 28px ${C.gold}40` }}>
              {ic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>, 26)}
            </div>
            <h1 style={{ fontFamily: serif, fontSize: "clamp(1.8rem,5vw,2.4rem)", fontWeight: 400, color: C.text, margin: "0 0 6px", letterSpacing: "-0.01em" }}>Party Room</h1>
            <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Everyone on their own phone. Games for the whole group.</p>
          </div>

          {/* Action cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button onClick={() => setPhase("creating")}
              style={{ width: "100%", padding: "20px 24px", borderRadius: 20, border: "none", background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: "#fff", cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 16, boxShadow: `0 8px 28px ${C.gold}40`, textAlign: "left" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {ic(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>, 22)}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>Host a Game Night</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Create a room, share the code</div>
              </div>
            </button>

            <button onClick={() => setPhase("joining")}
              style={{ width: "100%", padding: "20px 24px", borderRadius: 20, border: `2px solid ${C.dim}`, background: C.card, color: C.text, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 16, textAlign: "left", transition: "border-color 0.18s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.dim}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: `1.5px solid ${C.dim}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {ic(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>, 22)}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>Join with Code</div>
                <div style={{ fontSize: 12, color: C.muted }}>Enter the 6-letter code from your host</div>
              </div>
            </button>
          </div>

          {sockError && <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: C.err }}>{sockError}</div>}
        </div>
      </div>
    );
  }

  // ── Create form ───────────────────────────────────────────────────────
  if (phase === "creating") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: font, padding: "24px 20px" }}>
        <div style={{ maxWidth: 400, width: "100%" }}>
          <button onClick={() => { setPhase("lobby"); setErr(""); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: font, marginBottom: 28, display: "flex", alignItems: "center", gap: 5 }}>← Back</button>
          <h2 style={{ fontFamily: serif, fontSize: "1.9rem", fontWeight: 400, color: C.text, margin: "0 0 6px" }}>Host a Room</h2>
          <p style={{ fontSize: 14, color: C.muted, margin: "0 0 28px" }}>Your guests join with the code you'll share.</p>

          <label style={{ fontSize: 11, fontWeight: 700, color: C.goldL, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>Your name</label>
          <input value={hostName} onChange={e => setHostName(e.target.value)} placeholder="e.g. Priya" onKeyDown={e => e.key === "Enter" && handleCreate()}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${C.dim}`, background: C.card, color: C.text, fontSize: 16, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

          <label style={{ fontSize: 11, fontWeight: 700, color: C.goldL, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>Party name <span style={{ color: C.muted, textTransform: "none", fontWeight: 400 }}>(optional)</span></label>
          <input value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="e.g. Aman's Birthday Bash" onKeyDown={e => e.key === "Enter" && handleCreate()}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${C.dim}`, background: C.card, color: C.text, fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 24 }} />

          {err && <div style={{ fontSize: 13, color: C.err, marginBottom: 14 }}>{err}</div>}

          <button onClick={handleCreate} disabled={!hostName.trim() || loading}
            style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", background: hostName.trim() ? `linear-gradient(135deg, ${C.gold}, ${C.goldL})` : "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: hostName.trim() ? "pointer" : "not-allowed", fontFamily: font }}>
            {loading ? "Creating room…" : "Create Room →"}
          </button>
        </div>
      </div>
    );
  }

  // ── Join form ─────────────────────────────────────────────────────────
  if (phase === "joining") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: font, padding: "24px 20px" }}>
        <div style={{ maxWidth: 400, width: "100%" }}>
          <button onClick={() => { setPhase("lobby"); setErr(""); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: font, marginBottom: 28, display: "flex", alignItems: "center", gap: 5 }}>← Back</button>
          <h2 style={{ fontFamily: serif, fontSize: "1.9rem", fontWeight: 400, color: C.text, margin: "0 0 6px" }}>Join a Room</h2>
          <p style={{ fontSize: 14, color: C.muted, margin: "0 0 28px" }}>Enter the code your host shared with you.</p>

          <label style={{ fontSize: 11, fontWeight: 700, color: C.goldL, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>Room code</label>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))} placeholder="ABC123" maxLength={6} onKeyDown={e => e.key === "Enter" && handleJoin()}
            style={{ width: "100%", padding: "16px", borderRadius: 14, border: `1.5px solid ${joinCode.length === 6 ? C.gold : C.dim}`, background: C.card, color: C.text, fontSize: 28, fontWeight: 900, textAlign: "center", letterSpacing: "0.3em", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

          <label style={{ fontSize: 11, fontWeight: 700, color: C.goldL, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>Your name</label>
          <input value={joinName} onChange={e => setJoinName(e.target.value)} placeholder="e.g. Rahul" onKeyDown={e => e.key === "Enter" && handleJoin()}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${C.dim}`, background: C.card, color: C.text, fontSize: 16, outline: "none", boxSizing: "border-box", marginBottom: 24 }} />

          {err && <div style={{ fontSize: 13, color: C.err, marginBottom: 14 }}>{err}</div>}

          <button onClick={handleJoin} disabled={joinCode.length < 6 || !joinName.trim() || loading}
            style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", background: (joinCode.length === 6 && joinName.trim()) ? `linear-gradient(135deg, ${C.gold}, ${C.goldL})` : "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: (joinCode.length === 6 && joinName.trim()) ? "pointer" : "not-allowed", fontFamily: font }}>
            {loading ? "Joining…" : "Join Room →"}
          </button>
        </div>
      </div>
    );
  }

  // ── Room ──────────────────────────────────────────────────────────────
  if (phase === "room" && room) {
    const game     = GAMES.find(g => g.id === room.currentGame);
    const noGame   = !room.currentGame;

    return (
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: font, overflow: "hidden" }}>
        <style>{`
          input,textarea{font-family:${font};background:transparent;}
          button:active{transform:scale(0.97)}
          @keyframes bounce-in{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
          @keyframes fade-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          ::-webkit-scrollbar{display:none}
        `}</style>

        {/* ── Top bar ── */}
        <div style={{ flexShrink: 0, padding: "14px 16px", borderBottom: `1px solid ${C.dim}`, display: "flex", alignItems: "center", gap: 10 }}>
          {/* Room code pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${accent}18`, border: `1px solid ${accent}44`, borderRadius: 100, padding: "5px 12px" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: "0.14em", fontFamily: "monospace" }}>{room.code}</span>
          </div>

          {/* Players */}
          <div style={{ flex: 1, display: "flex", gap: 6, overflow: "hidden" }}>
            {(room.players || []).slice(0, 5).map(p => (
              <div key={p} title={p} style={{ width: 28, height: 28, borderRadius: "50%", background: p === myName ? `linear-gradient(135deg, ${accent}, ${accent}88)` : "rgba(255,248,236,0.1)", border: `1.5px solid ${p === myName ? accent : C.dim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.text, flexShrink: 0 }}>
                {p[0]?.toUpperCase()}
              </div>
            ))}
            {(room.players?.length || 0) > 5 && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.card, border: `1.5px solid ${C.dim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.muted, flexShrink: 0 }}>
                +{room.players.length - 5}
              </div>
            )}
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 100, padding: 3 }}>
            {["game", "scores"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "5px 12px", borderRadius: 100, border: "none", background: tab === t ? accent : "transparent", color: tab === t ? "#fff" : C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                {t === "game" ? "Game" : "Scores"}
              </button>
            ))}
          </div>

          {/* Leave */}
          <button onClick={handleLeave}
            style={{ background: "none", border: `1px solid ${C.dim}`, borderRadius: 100, padding: "5px 10px", color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: font, flexShrink: 0 }}>
            Leave
          </button>
        </div>

        {/* ── Copy link bar (host only, when no game) ── */}
        {isHost && noGame && (
          <div style={{ flexShrink: 0, padding: "10px 16px", background: `${accent}10`, borderBottom: `1px solid ${accent}22`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, fontSize: 12, color: C.muted }}>
              Share code <span style={{ fontFamily: "monospace", fontWeight: 800, color: accent }}>{room.code}</span> with your group
            </div>
            <button onClick={copyLink}
              style={{ padding: "7px 14px", borderRadius: 100, border: `1.5px solid ${copied ? accent : C.dim}`, background: copied ? `${accent}22` : "transparent", color: copied ? accent : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "all 0.18s" }}>
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        )}

        {/* ── Main content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

          {tab === "scores" ? (
            <Scores players={room.players || []} scores={scores} myName={myName} accent={accent} />
          ) : showPicker || noGame ? (
            // ── Game picker ──
            <div style={{ animation: "fade-up 0.25s ease both" }}>
              <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 4 }}>{noGame ? "Pick a game to start" : "Choose next game"}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{room.players?.length || 1} player{(room.players?.length || 1) !== 1 ? "s" : ""} in the room</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {GAMES.map(g => (
                  <button key={g.id} onClick={() => isHost ? handlePickGame(g.id) : null}
                    style={{ padding: "18px 14px", borderRadius: 20, border: `1.5px solid ${isHost ? g.color + "55" : C.dim}`, background: C.card, cursor: isHost ? "pointer" : "default", fontFamily: font, textAlign: "left", display: "flex", flexDirection: "column", gap: 10, transition: "all 0.18s", opacity: isHost ? 1 : 0.6 }}
                    onMouseEnter={e => isHost && (e.currentTarget.style.background = `${g.color}14`)}
                    onMouseLeave={e => e.currentTarget.style.background = C.card}>
                    <div style={{ color: g.color }}>{g.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 3 }}>{g.label}</div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{g.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              {!isHost && (
                <div style={{ textAlign: "center", padding: "24px 0 8px", fontSize: 13, color: C.muted }}>
                  Waiting for host to pick a game…
                </div>
              )}
            </div>
          ) : (
            // ── Active game ──
            <div style={{ animation: "fade-up 0.22s ease both" }}>
              {/* Game header strip */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", borderRadius: 14, background: `${game?.color || accent}14`, border: `1px solid ${game?.color || accent}33` }}>
                <span style={{ color: game?.color || accent }}>{game?.icon}</span>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 800, color: C.text }}>{game?.label || room.currentGame}</div>
                {isHost && (
                  <button onClick={handleEndGame}
                    style={{ padding: "5px 12px", borderRadius: 100, border: `1px solid ${C.dim}`, background: "none", color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: font }}>
                    Change game
                  </button>
                )}
              </div>

              <GameView
                room={room} myName={myName} isHost={isHost}
                dispatch={dispatch} accent={game?.color || accent}
                onScore={handleScore}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback loading
  return (
    <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: font }}>
      <div style={{ textAlign: "center", color: C.muted }}>
        <div style={{ marginBottom: 12, color: C.gold }}>
          {ic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></>, 36)}
        </div>
        <div style={{ fontSize: 14 }}>Connecting…</div>
      </div>
    </div>
  );
}

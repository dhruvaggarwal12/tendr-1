import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

const font = "'Outfit', sans-serif";

// ── Web Audio helpers ──────────────────────────────────────────────────────────
function getCtx(ref) {
  if (!ref.current) ref.current = new (window.AudioContext || window.webkitAudioContext)();
  return ref.current;
}

function playThud(ctx, freq = 80, t = 0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq * 2, ctx.currentTime + t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + t + 0.15);
  gain.gain.setValueAtTime(0.6, ctx.currentTime + t);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.35);
  osc.start(ctx.currentTime + t);
  osc.stop(ctx.currentTime + t + 0.4);
}

function playFinalBeep(ctx) {
  [0, 0.18, 0.36].forEach((t, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.value = [523, 659, 784][i];
    gain.gain.setValueAtTime(0.35, ctx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.45);
    osc.start(ctx.currentTime + t);
    osc.stop(ctx.currentTime + t + 0.5);
  });
}

function playFanfare(ctx) {
  // Rising arpeggio + sustained chord
  const freqs = [261.6, 329.6, 392, 523.3, 659.3, 783.9];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.value = freq;
    const st = ctx.currentTime + i * 0.09;
    gain.gain.setValueAtTime(0, st);
    gain.gain.linearRampToValueAtTime(0.3, st + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, st + 1.1);
    osc.start(st); osc.stop(st + 1.2);
  });
}

function playPop(ctx, t = 0) {
  const bufSize = ctx.sampleRate * 0.08;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass"; filter.frequency.value = 800; filter.Q.value = 0.5;
  src.buffer = buf;
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.5, ctx.currentTime + t);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.1);
  src.start(ctx.currentTime + t); src.stop(ctx.currentTime + t + 0.15);
}

// ── Confetti bursts ────────────────────────────────────────────────────────────
const COLORS = ["#C47A2E", "#CCAB4A", "#fff", "#f59e0b", "#fbbf24", "#ff6b6b", "#a855f7", "#FFF8F2"];

function fireConfetti(audioCtx) {
  const burst = (origin, angle, count = 130) =>
    confetti({ particleCount: count, spread: 85, angle, origin, colors: COLORS, startVelocity: 60, gravity: 0.85, scalar: 1.15, ticks: 200 });

  // Left & right poppers
  burst({ x: 0.05, y: 0.7 }, 55);
  burst({ x: 0.95, y: 0.7 }, 125);
  if (audioCtx) { playPop(audioCtx, 0); playPop(audioCtx, 0.05); }

  setTimeout(() => {
    burst({ x: 0.15, y: 0.5 }, 65);
    burst({ x: 0.85, y: 0.5 }, 115);
    if (audioCtx) { playPop(audioCtx, 0); playPop(audioCtx, 0.04); }
  }, 250);

  setTimeout(() => {
    burst({ x: 0.35, y: 0.4 }, 75, 100);
    burst({ x: 0.65, y: 0.4 }, 105, 100);
    if (audioCtx) playPop(audioCtx, 0);
  }, 500);

  setTimeout(() => {
    confetti({ particleCount: 250, spread: 180, origin: { x: 0.5, y: 0.2 }, colors: COLORS, startVelocity: 50, scalar: 0.95, ticks: 250 });
    if (audioCtx) { playPop(audioCtx, 0); playPop(audioCtx, 0.06); playPop(audioCtx, 0.12); }
  }, 800);

  setTimeout(() => {
    burst({ x: 0.1, y: 0.8 }, 50, 80);
    burst({ x: 0.9, y: 0.8 }, 130, 80);
    burst({ x: 0.5, y: 0.6 }, 90, 120);
  }, 1300);
}

// ── Popper emoji that flies in ─────────────────────────────────────────────────
function Popper({ side, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      position: "fixed",
      top: "35%",
      [side]: visible ? "5vw" : "-20vw",
      fontSize: "clamp(40px, 10vw, 80px)",
      transition: `${side} 0.5s cubic-bezier(0.34,1.56,0.64,1)`,
      zIndex: 1000001,
      filter: "drop-shadow(0 0 20px rgba(196,122,46,0.8))",
      transform: side === "left" ? "scaleX(-1) rotate(-15deg)" : "rotate(15deg)",
      pointerEvents: "none",
    }}>
      🎉
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function LaunchSequence({ onComplete, autoFullscreen = false }) {
  const [phase, setPhase] = useState("countdown");
  const [count, setCount] = useState(5);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [liveVisible, setLiveVisible] = useState(false);
  const [showPoppers, setShowPoppers] = useState(false);
  const fired = useRef(false);
  const audioRef = useRef(null);

  // Auto fullscreen + landscape on mobile
  useEffect(() => {
    if (!autoFullscreen) return;
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    if (screen.orientation?.lock) screen.orientation.lock("landscape").catch(() => {});
    return () => { document.exitFullscreen?.().catch?.(() => {}); };
  }, [autoFullscreen]);

  // Countdown 5 → 1 with thud
  useEffect(() => {
    if (phase !== "countdown") return;
    // Play thud on each count
    try {
      const ctx = getCtx(audioRef);
      if (count === 1) playFinalBeep(ctx);
      else playThud(ctx, 100 - count * 8);
    } catch {}

    if (count > 1) {
      const t = setTimeout(() => setCount(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setPhase("tagline");
      setTimeout(() => setTaglineVisible(true), 80);
    }, 1100);
    return () => clearTimeout(t);
  }, [count, phase]);

  // Tagline → confetti → live
  useEffect(() => {
    if (phase !== "tagline") return;
    const t = setTimeout(() => {
      setPhase("confetti");
      setShowPoppers(true);
      try { playFanfare(getCtx(audioRef)); } catch {}
      fireConfetti((() => { try { return getCtx(audioRef); } catch { return null; } })());
      setTimeout(() => {
        setPhase("live");
        setLiveVisible(true);
        setTimeout(() => onComplete?.(), 4000);
      }, 2000);
    }, 2200);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999999,
      background: "#0d0d0d",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: font, overflow: "hidden",
    }}>

      {/* Party poppers */}
      {showPoppers && <Popper side="left" delay={0} />}
      {showPoppers && <Popper side="right" delay={120} />}

      {/* Countdown */}
      {phase === "countdown" && (
        <div key={count} style={{
          fontSize: "clamp(100px, 30vw, 220px)",
          fontWeight: 900,
          color: "#C47A2E",
          lineHeight: 1,
          animation: "launch-pop 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          textShadow: "0 0 80px rgba(196,122,46,0.7), 0 0 180px rgba(196,122,46,0.3)",
          letterSpacing: "-0.04em",
        }}>
          {count}
        </div>
      )}

      {/* Tagline */}
      {(phase === "tagline" || phase === "confetti") && (
        <div style={{
          textAlign: "center", padding: "0 32px",
          opacity: taglineVisible ? 1 : 0,
          transform: taglineVisible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.94)",
          transition: "opacity 0.75s ease, transform 0.75s ease",
        }}>
          <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 20 }}>
            ✦ tendr ✦
          </div>
          <div style={{ fontSize: "clamp(22px, 5vw, 52px)", fontWeight: 900, color: "#fff", lineHeight: 1.25, letterSpacing: "-0.02em", maxWidth: 760 }}>
            Now you know where to
            <br />
            <span style={{ color: "#CCAB4A" }}>book and plan</span> your next event.
          </div>
        </div>
      )}

      {/* Live */}
      {phase === "live" && (
        <div style={{
          textAlign: "center", padding: "0 32px",
          opacity: liveVisible ? 1 : 0,
          transform: liveVisible ? "scale(1)" : "scale(0.8)",
          transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{ fontSize: "clamp(52px, 13vw, 100px)", marginBottom: 12, animation: "launch-bounce 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>🎉</div>
          <div style={{ fontSize: "clamp(30px, 8vw, 72px)", fontWeight: 900, color: "#CCAB4A", letterSpacing: "-0.02em", lineHeight: 1.1, textShadow: "0 0 60px rgba(204,171,74,0.6)" }}>
            tendr.co.in
          </div>
          <div style={{ fontSize: "clamp(16px, 4vw, 30px)", fontWeight: 700, color: "#fff", marginTop: 12, letterSpacing: "0.02em" }}>
            is live now 🚀
          </div>
        </div>
      )}

      <style>{`
        @keyframes launch-pop {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes launch-bounce {
          0%   { transform: scale(0.5) rotate(-10deg); }
          60%  { transform: scale(1.15) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

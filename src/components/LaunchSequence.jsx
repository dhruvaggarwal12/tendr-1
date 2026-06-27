import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

const font = "'Outfit', sans-serif";

export default function LaunchSequence({ onComplete }) {
  const [phase, setPhase] = useState("countdown"); // countdown → tagline → confetti → live
  const [count, setCount] = useState(5);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [liveVisible, setLiveVisible] = useState(false);
  const fired = useRef(false);

  // Countdown 5 → 1
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count > 1) {
      const t = setTimeout(() => setCount(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    // count === 1 → advance to tagline after 1s
    const t = setTimeout(() => {
      setPhase("tagline");
      setTimeout(() => setTaglineVisible(true), 80);
    }, 1000);
    return () => clearTimeout(t);
  }, [count, phase]);

  // Tagline shown → fire confetti then show LIVE
  useEffect(() => {
    if (phase !== "tagline") return;
    const t = setTimeout(() => {
      setPhase("confetti");
      fireConfetti();
      setTimeout(() => {
        setPhase("live");
        setLiveVisible(true);
        setTimeout(() => onComplete?.(), 3000);
      }, 1800);
    }, 2200);
    return () => clearTimeout(t);
  }, [phase]);

  const fireConfetti = () => {
    if (fired.current) return;
    fired.current = true;
    const colors = ["#C47A2E", "#CCAB4A", "#fff", "#f59e0b", "#fbbf24", "#FFF8F2"];
    const burst = (origin, angle) =>
      confetti({ particleCount: 120, spread: 80, angle, origin, colors, startVelocity: 55, gravity: 0.9, scalar: 1.1 });
    burst({ x: 0.1, y: 0.6 }, 60);
    burst({ x: 0.9, y: 0.6 }, 120);
    setTimeout(() => { burst({ x: 0.3, y: 0.5 }, 70); burst({ x: 0.7, y: 0.5 }, 110); }, 300);
    setTimeout(() => { burst({ x: 0.5, y: 0.4 }, 90); }, 600);
    setTimeout(() => {
      confetti({ particleCount: 200, spread: 160, origin: { x: 0.5, y: 0.3 }, colors, startVelocity: 45, scalar: 0.9 });
    }, 900);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999999,
      background: "#0d0d0d",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: font,
    }}>

      {/* Countdown phase */}
      {phase === "countdown" && (
        <div key={count} style={{
          fontSize: "clamp(100px, 28vw, 200px)",
          fontWeight: 900,
          color: "#C47A2E",
          lineHeight: 1,
          animation: "launch-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          textShadow: "0 0 80px rgba(196,122,46,0.6), 0 0 160px rgba(196,122,46,0.3)",
          letterSpacing: "-0.04em",
        }}>
          {count}
        </div>
      )}

      {/* Tagline phase */}
      {(phase === "tagline" || phase === "confetti") && (
        <div style={{
          textAlign: "center",
          padding: "0 32px",
          opacity: taglineVisible ? 1 : 0,
          transform: taglineVisible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 20 }}>
            ✦ tendr ✦
          </div>
          <div style={{
            fontSize: "clamp(22px, 5vw, 48px)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            maxWidth: 700,
          }}>
            Now you know where to
            <br />
            <span style={{ color: "#CCAB4A" }}>book and plan</span> your next event.
          </div>
        </div>
      )}

      {/* LIVE phase */}
      {phase === "live" && (
        <div style={{
          textAlign: "center",
          padding: "0 32px",
          opacity: liveVisible ? 1 : 0,
          transform: liveVisible ? "scale(1)" : "scale(0.85)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{ fontSize: "clamp(48px, 12vw, 96px)", marginBottom: 16 }}>🎉</div>
          <div style={{
            fontSize: "clamp(28px, 7vw, 64px)",
            fontWeight: 900,
            color: "#CCAB4A",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            textShadow: "0 0 60px rgba(204,171,74,0.5)",
          }}>
            tendr.co.in
          </div>
          <div style={{
            fontSize: "clamp(16px, 4vw, 28px)",
            fontWeight: 700,
            color: "#fff",
            marginTop: 10,
            letterSpacing: "0.02em",
          }}>
            is live now 🚀
          </div>
        </div>
      )}

      <style>{`
        @keyframes launch-pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

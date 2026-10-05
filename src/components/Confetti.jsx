import { useEffect, useRef } from "react";

const COLORS = ["#C4973A","#FFD700","#FF6B6B","#4ade80","#60a5fa","#f472b6","#fff"];

export default function Confetti({ active, onDone }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const startRef  = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const DURATION = 2500;
    const particles = Array.from({ length: 120 }, () => ({
      x:    Math.random() * canvas.width,
      y:    -10 - Math.random() * 80,
      vx:   (Math.random() - 0.5) * 4,
      vy:   2 + Math.random() * 4,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle:    Math.random() * Math.PI * 2,
      spin:     (Math.random() - 0.5) * 0.2,
      wobble:   Math.random() * Math.PI * 2,
    }));

    startRef.current = performance.now();

    const draw = (now) => {
      const elapsed = now - startRef.current;
      if (elapsed >= DURATION) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone?.();
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fade = elapsed > DURATION - 600 ? 1 - (elapsed - (DURATION - 600)) / 600 : 1;
      particles.forEach(p => {
        p.x  += p.vx + Math.sin(p.wobble) * 0.5;
        p.y  += p.vy;
        p.vy += 0.06; // gravity
        p.angle  += p.spin;
        p.wobble += 0.05;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]); // eslint-disable-line

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10000,
      }}
    />
  );
}

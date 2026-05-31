import React, { useEffect, useRef, useState } from "react";

const THRESHOLD = 64; // px to pull before triggering

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const distRef = useRef(0);

  useEffect(() => {
    const onStart = (e) => {
      if (window.scrollY === 0 && e.touches.length === 1) {
        startY.current = e.touches[0].clientY;
      }
    };
    const onMove = (e) => {
      if (window.scrollY > 4 || refreshing) return;
      const d = Math.max(0, e.touches[0].clientY - startY.current);
      if (d > 8) {
        setPulling(true);
        const capped = Math.min(d * 0.5, THRESHOLD + 16);
        distRef.current = capped;
        setDistance(capped);
      }
    };
    const onEnd = async () => {
      if (distRef.current >= THRESHOLD / 2 && !refreshing) {
        setRefreshing(true);
        setDistance(THRESHOLD / 2);
        try { await onRefresh(); } catch {}
        setRefreshing(false);
      }
      setPulling(false);
      setDistance(0);
      distRef.current = 0;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove",  onMove,  { passive: true });
    window.addEventListener("touchend",   onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove",  onMove);
      window.removeEventListener("touchend",   onEnd);
    };
  }, [onRefresh, refreshing]);

  const showIndicator = pulling || refreshing;
  const progress = Math.min(distance / (THRESHOLD / 2), 1);

  return (
    <div style={{ position: "relative" }}>
      {/* Pull indicator */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "center",
        transform: `translateY(${showIndicator ? Math.max(distance - 16, 0) : -40}px)`,
        transition: pulling ? "none" : "transform 0.3s ease",
        pointerEvents: "none",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(139,69,19,0.2)",
          border: "1.5px solid rgba(196,122,46,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {refreshing ? (
            <div style={{ width: 16, height: 16, border: "2.5px solid rgba(196,122,46,0.25)", borderTopColor: "#C47A2E", borderRadius: "50%", animation: "ptr-spin 0.65s linear infinite" }} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth="2.5" strokeLinecap="round"
              style={{ transform: `rotate(${progress * 180}deg)`, transition: "transform 0.1s", opacity: progress }}>
              <path d="M12 5v14m0 0l-5-5m5 5l5-5"/>
            </svg>
          )}
        </div>
      </div>
      {/* Only apply transform when actively pulling — translateY(0) still creates a
          Chrome containing block for position:fixed elements (breaks sidebars) */}
      <div style={pulling || refreshing ? { transform: `translateY(${distance * 0.4}px)` } : {}}>
        {children}
      </div>
      <style>{`@keyframes ptr-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

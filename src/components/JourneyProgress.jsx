import React from "react";

const STEPS = ["Plan", "Browse", "Chat", "Pay"];

// active: one of "Plan" | "Browse" | "Chat" | "Pay"
export default function JourneyProgress({ active }) {
  const activeIdx = STEPS.indexOf(active);

  return (
    <div style={{
      background: "rgba(255,252,245,0.97)",
      borderBottom: "1px solid rgba(196,122,46,0.12)",
      padding: "9px 24px",
      fontFamily: "'Outfit', sans-serif",
      position: "sticky",
      top: 64, // below navbar
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: 860,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
      }}>
        {STEPS.map((step, i) => {
          const isDone   = i < activeIdx;
          const isActive = i === activeIdx;
          return (
            <React.Fragment key={step}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: isDone ? "#C47A2E" : isActive ? "rgba(196,122,46,0.12)" : "#f0ebe3",
                  border: isActive ? "2px solid #C47A2E" : isDone ? "2px solid #C47A2E" : "2px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                  color: isDone ? "#fff" : isActive ? "#C47A2E" : "#bbb",
                  transition: "all 0.2s",
                }}>
                  {isDone ? "✓" : i + 1}
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#2C1A0E" : isDone ? "#C47A2E" : "#bbb",
                  transition: "color 0.2s",
                }}>
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: 1.5,
                  background: isDone ? "#C47A2E" : "rgba(196,122,46,0.15)",
                  margin: "0 10px",
                  borderRadius: 2,
                  transition: "background 0.3s",
                  opacity: isDone ? 0.7 : 1,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

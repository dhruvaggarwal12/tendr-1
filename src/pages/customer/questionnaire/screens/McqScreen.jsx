import React from "react";

const GOLD = "#C47A2E";

export default function McqScreen({ question, selectedOptionId, onSelect }) {
  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", marginBottom: 18, lineHeight: 1.4 }}>
        {question.questionText}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options.map((opt) => {
          const checked = selectedOptionId === opt.optionId;
          return (
            <button
              key={opt.optionId}
              onClick={() => onSelect(opt.optionId)}
              style={{
                textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", borderRadius: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                border: checked ? `2px solid ${GOLD}` : "1.5px solid rgba(196,122,46,0.2)",
                background: checked ? "rgba(196,122,46,0.08)" : "#fff",
              }}
            >
              <span
                style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  border: checked ? `5px solid ${GOLD}` : "1.5px solid rgba(196,122,46,0.35)",
                  background: "#fff",
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0E" }}>{opt.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

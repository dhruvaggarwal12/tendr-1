import React from "react";

const GOLD = "#C47A2E";

export default function OpinionScreen({ question, value, onChange }) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", marginBottom: 8, lineHeight: 1.4 }}>
        {question.questionText}
      </div>
      {question.opinionPrompt && (
        <div style={{ fontSize: 12.5, color: "#9B7450", marginBottom: 14 }}>{question.opinionPrompt}</div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here… a sentence or two is fine."
        rows={7}
        style={{
          width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 12,
          border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: "'Outfit', sans-serif",
          fontSize: 14, color: "#2C1A0E", resize: "vertical", lineHeight: 1.6,
        }}
      />
      <div style={{ fontSize: 11.5, color: "#9B7450", marginTop: 6, textAlign: "right" }}>
        {wordCount} word{wordCount === 1 ? "" : "s"} · recommended 30–150
      </div>
    </div>
  );
}

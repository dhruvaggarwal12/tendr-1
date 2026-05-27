import React from "react";
import Button from "./Button";

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "56px 24px",
        background: "#FFFCF5",
        borderRadius: 16,
        border: "1.5px dashed rgba(196,122,46,0.25)",
      }}
    >
      {icon && (
        <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
      )}
      {title && (
        <h4
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#2C1A0E",
            margin: "0 0 8px",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {title}
        </h4>
      )}
      {description && (
        <p
          style={{
            fontSize: 14,
            color: "#9B7450",
            margin: "0 0 16px",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

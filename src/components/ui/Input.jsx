import React from "react";

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  rows,
  required,
  style: extraStyle,
}) {
  const isTextarea = rows && rows > 1;

  const inputStyle = {
    padding: "10px 12px",
    borderRadius: 10,
    border: `1.5px solid ${error ? "#fca5a5" : "rgba(196,122,46,0.25)"}`,
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
    color: "#2C1A0E",
    resize: isTextarea ? "vertical" : undefined,
    ...extraStyle,
  };

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#9B7450",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            display: "block",
            marginBottom: 5,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {label}{required && " *"}
        </label>
      )}
      {isTextarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="tendr-input"
          style={inputStyle}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="tendr-input"
          style={inputStyle}
        />
      )}
      {error && (
        <p
          style={{
            fontSize: 12,
            color: "#c0392b",
            marginTop: 4,
            marginBottom: 0,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

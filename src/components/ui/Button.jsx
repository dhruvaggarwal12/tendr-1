import React from "react";

const VARIANTS = {
  primary: {
    background: "linear-gradient(135deg,#C47A2E,#CCAB4A)",
    color: "#fff",
    border: "none",
  },
  danger: {
    background: "#fff5f5",
    color: "#c0392b",
    border: "1.5px solid #fca5a5",
  },
  outline: {
    background: "#fff",
    color: "#C47A2E",
    border: "1.5px solid rgba(196,122,46,0.3)",
  },
  ghost: {
    background: "transparent",
    color: "#9B7450",
    border: "none",
  },
  success: {
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
  },
};

const SIZES = {
  sm: { padding: "7px 14px", fontSize: 12 },
  md: { padding: "10px 20px", fontSize: 14 },
  lg: { padding: "13px 28px", fontSize: 15 },
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  type = "button",
  style: extraStyle,
}) {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyle = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className="tendr-btn"
      style={{
        ...variantStyle,
        ...sizeStyle,
        borderRadius: 10,
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.65 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        width: fullWidth ? "100%" : undefined,
        boxSizing: "border-box",
        lineHeight: 1.4,
        ...extraStyle,
      }}
    >
      {loading && (
        <span
          className={`tendr-spinner${variant === "primary" ? "" : " tendr-spinner-dark"}`}
        />
      )}
      {children}
    </button>
  );
}

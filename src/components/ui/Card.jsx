import React from "react";

const VARIANTS = {
  default: {
    background: "#fff",
    border: "1.5px solid rgba(196,122,46,0.18)",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(196,122,46,0.07)",
  },
  highlighted: {
    background: "#FFFCF5",
    border: "2px solid #CCAB4A",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(196,122,46,0.07)",
  },
  dashed: {
    background: "transparent",
    border: "1.5px dashed rgba(196,122,46,0.25)",
    borderRadius: 16,
    boxShadow: "none",
  },
};

const PADDINGS = {
  sm: "14px 16px",
  md: "18px 20px",
  lg: "24px 28px",
};

export default function Card({
  children,
  variant = "default",
  padding = "md",
  style: extraStyle,
  onClick,
}) {
  const variantStyle = VARIANTS[variant] || VARIANTS.default;
  const paddingValue = PADDINGS[padding] || PADDINGS.md;

  return (
    <div
      onClick={onClick}
      style={{
        ...variantStyle,
        padding: paddingValue,
        cursor: onClick ? "pointer" : undefined,
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

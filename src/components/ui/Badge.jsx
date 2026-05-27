import React from "react";

const STATUS_MAP = {
  approved:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  confirmed:  { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  completed:  { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  active:     { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  delivered:  { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  pending:    { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  planning:   { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  submitted:  { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  draft:      { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  rejected:   { bg: "#fff5f5", color: "#c0392b", border: "#fca5a5" },
  cancelled:  { bg: "#fff5f5", color: "#c0392b", border: "#fca5a5" },
  failed:     { bg: "#fff5f5", color: "#c0392b", border: "#fca5a5" },
  in_progress: { bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe" },
  upcoming:   { bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe" },
  processing: { bg: "#faf5ff", color: "#7c3aed", border: "#ddd6fe" },
};

export default function Badge({
  status,
  color,
  bg,
  border,
  children,
}) {
  let resolvedStyle;
  if (status) {
    resolvedStyle = STATUS_MAP[status?.toLowerCase()] || STATUS_MAP.pending;
  } else {
    resolvedStyle = { bg: bg || "#fffbeb", color: color || "#b45309", border: border || "#fde68a" };
  }

  const label = children || (status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ") : "");

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 100,
        display: "inline-block",
        background: resolvedStyle.bg,
        color: resolvedStyle.color,
        border: `1px solid ${resolvedStyle.border}`,
        fontFamily: "'Outfit', sans-serif",
        lineHeight: 1.6,
      }}
    >
      {label}
    </span>
  );
}

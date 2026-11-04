import React from "react";

/* Editable inline span — used by every flyer template. When `editable` is
   false (guest RSVP view, admin-auto-created flyers) it renders plain text
   instead of an input, with the same layout so templates don't need two
   code paths. */
export default function Editable({ value, onChange, placeholder, style = {}, width = "100%", editable = true }) {
  if (!editable) {
    return (
      <span style={{ display: "inline-block", width, textAlign: "center", color: "inherit", fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", lineHeight: "inherit", ...style }}>
        {value || placeholder}
      </span>
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: "transparent", border: "none",
        borderBottom: value ? "none" : "1px dashed rgba(150,120,60,0.45)",
        outline: "none", width, textAlign: "center",
        cursor: "text", color: "inherit", fontFamily: "inherit",
        fontSize: "inherit", fontWeight: "inherit",
        letterSpacing: "inherit", lineHeight: "inherit",
        ...style,
      }}
    />
  );
}

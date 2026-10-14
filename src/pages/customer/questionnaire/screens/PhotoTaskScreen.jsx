import React, { useRef, useState } from "react";

const GOLD = "#C47A2E";

export default function PhotoTaskScreen({ question, uploadedUrl, uploading, error, onUpload }) {
  const fileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);

  const handlePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const confirmUpload = () => {
    if (pendingFile) onUpload(pendingFile);
  };

  const shownUrl = previewUrl || uploadedUrl;

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", marginBottom: 8, lineHeight: 1.4 }}>
        {question.questionText}
      </div>
      {question.photoInstructions && (
        <div style={{ fontSize: 12.5, color: "#9B7450", marginBottom: 14, lineHeight: 1.5 }}>{question.photoInstructions}</div>
      )}

      {shownUrl ? (
        <div style={{ marginBottom: 14 }}>
          <img src={shownUrl} alt="Selected" style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.2)" }} />
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: "2px dashed rgba(196,122,46,0.35)", borderRadius: 14, padding: "40px 16px",
            textAlign: "center", cursor: "pointer", color: "#9B7450", fontSize: 13.5, marginBottom: 14, background: "#fff",
          }}
        >
          📷 Tap to choose a photo<br />JPG, PNG or WebP, up to 10MB
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePick} style={{ display: "none" }} />

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            flex: 1, padding: "11px 16px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)",
            background: "rgba(196,122,46,0.06)", color: GOLD, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
          }}
        >
          {shownUrl ? "Replace photo" : "Choose photo"}
        </button>
        {pendingFile && (
          <button
            onClick={confirmUpload}
            disabled={uploading}
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 12, border: "none",
              background: GOLD, color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: uploading ? "default" : "pointer",
              opacity: uploading ? 0.7 : 1, fontFamily: "'Outfit', sans-serif",
            }}
          >
            {uploading ? "Uploading…" : "Use this photo"}
          </button>
        )}
      </div>

      {error && <div style={{ color: "#BE123C", fontSize: 12.5, marginTop: 10 }}>{error}</div>}
    </div>
  );
}

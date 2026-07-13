import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', 'Inter', sans-serif";

export default function PhotoWallPage() {
  const { wallId } = useParams();
  const [wall, setWall] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(localStorage.getItem("hp_name") || "Guest");
  const fileRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);

  const load = async () => {
    try {
      const res = await fetch(`${BASE_URL}/house-party/photo-wall/${wallId}`);
      if (!res.ok) throw new Error("Photo wall not found");
      setWall(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [wallId]);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("photo", file);
    form.append("uploadedBy", name);
    try {
      const res = await fetch(`${BASE_URL}/house-party/photo-wall/${wallId}/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      setWall(await res.json());
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Screen><p style={{ color: "#fff", textAlign: "center", padding: 40 }}>Loading…</p></Screen>;
  if (error) return <Screen><p style={{ color: "#F87171", textAlign: "center", padding: 40 }}>{error}</p></Screen>;

  return (
    <Screen>
      <div style={{ padding: "24px 16px", maxWidth: 600, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>📸</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "8px 0 4px" }}>{wall.partyName}</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{wall.photos.length} photo{wall.photos.length !== 1 ? "s" : ""}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <input value={name} onChange={e => { setName(e.target.value); localStorage.setItem("hp_name", e.target.value); }} placeholder="Your name" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 14, fontFamily: font, boxSizing: "border-box", marginBottom: 10 }} />
          <input ref={fileRef} type="file" accept="image/*" onChange={e => upload(e.target.files[0])} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: "#DB2777", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, opacity: uploading ? 0.7 : 1 }}>
            {uploading ? "Uploading…" : "📸 Upload a Photo"}
          </button>
        </div>

        {wall.photos.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "40px 0", fontSize: 15 }}>
            No photos yet. Be the first to upload! 🎉
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
            {wall.photos.map((p, i) => (
              <div key={i} onClick={() => setLightbox(p)} style={{ position: "relative", aspectRatio: "1", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}>
                <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 8px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                  {p.uploadedBy}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <img src={lightbox.url} alt="" style={{ maxWidth: "100%", maxHeight: "90dvh", borderRadius: 12, objectFit: "contain" }} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", fontSize: 16, cursor: "pointer" }}>✕</button>
          <div style={{ position: "absolute", bottom: 24, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>By {lightbox.uploadedBy}</div>
        </div>
      )}
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)", fontFamily: "'Outfit','Inter',sans-serif" }}>
      {children}
    </div>
  );
}

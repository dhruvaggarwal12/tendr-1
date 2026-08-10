import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";
import { useChatOverlay } from "../../context/ChatContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const RakhiGiftHub = () => {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.auth);
  const { openExistingChat } = useChatOverlay();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [existingChat, setExistingChat] = useState(null);
  const [previewIdx, setPreviewIdx] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/conversations`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then(r => r.ok ? r.json() : { conversations: [] })
      .then(data => {
        const found = (data.conversations || []).find(c => c.serviceType === "Rakhi Hampers" && !c.vendorId);
        if (found) setExistingChat(found);
      }).catch(() => {});
  }, [token]);

  useEffect(() => {
    fetch(`${BASE_URL}/admin/gift-hamper-samples?type=rakhi`)
      .then(r => r.json())
      .then(d => { setSamples(d.samples || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const preview = previewIdx !== null ? samples[previewIdx] : null;
  const closePreview = useCallback(() => setPreviewIdx(null), []);
  const prevPreview = useCallback(() => setPreviewIdx(i => (i > 0 ? i - 1 : samples.length - 1)), [samples.length]);
  const nextPreview = useCallback(() => setPreviewIdx(i => (i < samples.length - 1 ? i + 1 : 0)), [samples.length]);

  useEffect(() => {
    if (previewIdx === null) return;
    const handler = e => {
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowLeft") prevPreview();
      if (e.key === "ArrowRight") nextPreview();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewIdx, closePreview, prevPreview, nextPreview]);

  const handleDownload = async (url, name) => {
    setDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = (name || "rakhi-hamper").replace(/[^a-zA-Z0-9 _-]/g, "") + ".jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch {
      window.open(url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const toggleSelect = (sample) => {
    setSelectedPhotos(prev =>
      prev.some(p => p._id === sample._id)
        ? prev.filter(p => p._id !== sample._id)
        : [...prev, sample]
    );
  };

  const goToChat = async () => {
    const photos = selectedPhotos.map(({ url, name, priceRange }) => ({ url, name, priceRange }));
    const msg = photos.length > 0
      ? `Hi! I'm interested in ordering a Rakhi hamper from Tendr. I've shortlisted ${photos.length === 1 ? "this option" : "these options"}:\n\n${photos.map((p, i) => `${i + 1}. ${p.name || "Rakhi Hamper"}${p.priceRange ? ` (${p.priceRange})` : ""}`).join("\n")}\n\nCan you help me with customisation, availability and delivery across Delhi NCR?`
      : `Hi! I'd like to order a Rakhi hamper from Tendr.\n\nCould you share options based on my budget and preferences? Looking forward to your suggestions!`;

    if (!token) {
      try { sessionStorage.setItem("baat_karo_draft", msg); } catch {}
      if (photos.length > 0) try { sessionStorage.setItem("gh_chat_photos", JSON.stringify(photos)); } catch {}
      navigate("/rakhi-hampers/chat");
      return;
    }

    const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    try {
      const res = await fetch(`${BASE_URL}/conversations/baat-karo`, {
        method: "POST", headers: hdrs, credentials: "include",
        body: JSON.stringify({ message: msg, serviceType: "Rakhi Hampers" }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        const cid = data.conversationId;
        window.dispatchEvent(new CustomEvent("tendr:chat-started"));
        for (const photo of photos) {
          if (photo.name) try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers: hdrs, body: JSON.stringify({ sender: "user", content: `📎 ${photo.name}${photo.priceRange ? ` — ${photo.priceRange}` : ""}` }) }); } catch {}
          try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers: hdrs, body: JSON.stringify({ sender: "user", content: `[img:${photo.url}]` }) }); } catch {}
        }
        openExistingChat(cid, { _id: null, name: "Tendr Team", serviceType: "Rakhi Hampers", approved: false });
      }
    } catch (e) { console.error("RakhiGiftHub chat failed:", e); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title="Rakhi Hampers — Tendr"
        description="Curated Rakhi hampers for your loved ones. Personalised, beautifully packaged and delivered across Delhi NCR."
        path="/rakhi-hampers"
      />
      <HamburgerNav title="Rakhi Hampers" showBack />

      {existingChat && (
        <div style={{ background: "linear-gradient(90deg,#2C1A0E,#4A2810)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>🪢 You have an active Rakhi Hampers chat</div>
          <button
            onClick={() => openExistingChat(existingChat._id, { _id: null, name: "Tendr Team", serviceType: "Rakhi Hampers", approved: true })}
            style={{ background: "#C47A2E", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}
          >
            Resume Chat →
          </button>
        </div>
      )}

      <style>{`
        @media(max-width:640px){
          .rh-hero{padding:36px 18px 32px!important}
          .rh-hero h1{font-size:clamp(1.6rem,6vw,2rem)!important}
          .rh-cta-btn{width:100%!important}
        }
        .rh-card:hover .rh-overlay{opacity:1!important}
        .rh-card:hover img{transform:scale(1.04)}
        @keyframes rhShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      {/* ── Hero ── */}
      <div className="rh-hero" style={{
        background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 55%,#3A200C 100%)",
        padding: "56px 24px 52px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -10, left: "4%", fontSize: 110, opacity: 0.07, transform: "rotate(-15deg)", userSelect: "none", pointerEvents: "none" }}>🪢</div>
        <div style={{ position: "absolute", bottom: -8, right: "5%", fontSize: 90, opacity: 0.07, transform: "rotate(10deg)", userSelect: "none", pointerEvents: "none" }}>🎁</div>

        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#CCAB4A", display: "block", marginBottom: 14 }}>
            Raksha Bandhan Special
          </span>
          <h1 className="rh-hero" style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: "#fff", margin: "0 0 14px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Rakhi Hampers
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", margin: "0 0 32px", lineHeight: 1.7, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Tell us your budget and preferences — our team will curate the perfect Rakhi hamper and handle delivery across Delhi NCR.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="rh-cta-btn"
              onClick={goToChat}
              style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, padding: "13px 32px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: font, boxShadow: "0 6px 24px rgba(196,122,46,0.45)", letterSpacing: "0.01em" }}
            >
              💬 Talk to Our Team{selectedPhotos.length > 0 ? ` · ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? "s" : ""} added` : ""}
            </button>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>Replies within 2 hours · Custom orders welcome</p>
        </div>
      </div>

      {/* ── Sample Photos ── */}
      <div style={{ background: "#FFFCF5", padding: "52px 24px calc(60px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px" }}>For reference</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 6px" }}>Sample Rakhi Hamper Photos</h2>
            <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Tap any photo to preview · add to chat as reference</p>
            <div style={{ width: 40, height: 2, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "14px auto 0" }} />
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ borderRadius: 14, aspectRatio: "4/3", background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "rhShimmer 1.4s infinite" }} />
              ))}
            </div>
          ) : samples.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "#9B7450" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🪢</div>
              <p style={{ fontSize: 14, margin: 0 }}>Sample photos coming soon. Talk to our team for options.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
              {samples.map((s, idx) => {
                const isSelected = selectedPhotos.some(p => p._id === s._id);
                return (
                  <div
                    key={s._id}
                    className="rh-card"
                    onClick={() => setPreviewIdx(idx)}
                    style={{ borderRadius: 14, overflow: "hidden", background: "#fff", border: `1.5px solid ${isSelected ? "#C47A2E" : "rgba(196,122,46,0.15)"}`, boxShadow: isSelected ? "0 0 0 2px rgba(196,122,46,0.35), 0 3px 14px rgba(44,26,14,0.07)" : "0 3px 14px rgba(44,26,14,0.07)", cursor: "pointer", position: "relative" }}
                  >
                    {isSelected && (
                      <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2, background: "#C47A2E", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 20, padding: "3px 8px", letterSpacing: "0.02em" }}>Added to Chat</div>
                    )}
                    <div style={{ overflow: "hidden" }}>
                      <img src={s.url} alt={s.name || "Rakhi Hamper"} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block", transition: "transform 0.3s" }} />
                    </div>
                    <div className="rh-overlay" style={{ position: "absolute", inset: 0, background: "rgba(44,26,14,0.42)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", borderRadius: 14 }}>
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, background: "rgba(0,0,0,0.45)", borderRadius: 100, padding: "7px 18px" }}>👁 Preview</span>
                    </div>
                    {(s.name || s.priceRange) && (
                      <div style={{ padding: "10px 12px 12px" }}>
                        {s.name && <div style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>{s.name}</div>}
                        {s.priceRange && <div style={{ fontSize: 12, color: "#C47A2E", fontWeight: 700 }}>{s.priceRange}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {preview && (
        <div
          onClick={closePreview}
          style={{ position: "fixed", inset: 0, background: "rgba(20,10,4,0.88)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
        >
          {samples.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prevPreview(); }}
              style={{ position: "fixed", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 10000, width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
            >‹</button>
          )}
          {samples.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); nextPreview(); }}
              style={{ position: "fixed", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 10000, width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
            >›</button>
          )}

          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 20, overflow: "hidden", maxWidth: 560, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.55)", position: "relative" }}
          >
            <button
              onClick={closePreview}
              style={{ position: "absolute", top: 12, right: 12, zIndex: 2, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >✕</button>

            {samples.length > 1 && (
              <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, fontSize: 11, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.45)", borderRadius: 100, padding: "3px 10px" }}>
                {previewIdx + 1} / {samples.length}
              </div>
            )}

            <img src={preview.url} alt={preview.name || "Rakhi Hamper"} style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", background: "#faf5ee", display: "block" }} />

            <div style={{ padding: "14px 22px 20px" }}>
              {(preview.name || preview.priceRange) && (
                <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  {preview.name && <span style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E" }}>{preview.name}</span>}
                  {preview.priceRange && <span style={{ fontSize: 13, fontWeight: 700, color: "#C47A2E" }}>{preview.priceRange}</span>}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleDownload(preview.url, preview.name)}
                  disabled={downloading}
                  style={{ flex: "1 1 120px", padding: "11px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: downloading ? "wait" : "pointer", fontFamily: font }}
                >
                  {downloading ? "Downloading…" : "⬇ Download"}
                </button>
                <button
                  onClick={() => { toggleSelect(preview); closePreview(); }}
                  style={{ flex: "1 1 120px", padding: "11px 20px", borderRadius: 10, border: `1.5px solid ${selectedPhotos.some(p => p._id === preview._id) ? "#C47A2E" : "rgba(196,122,46,0.4)"}`, background: selectedPhotos.some(p => p._id === preview._id) ? "rgba(196,122,46,0.1)" : "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}
                >
                  {selectedPhotos.some(p => p._id === preview._id) ? "✓ Added" : "➕ Add to Chat"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RakhiGiftHub;

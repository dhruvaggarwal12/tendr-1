import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";
import { useChatOverlay } from "../../context/ChatContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const GiftHampersCakes = () => {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.auth);
  const { openExistingChat } = useChatOverlay();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [existingChat, setExistingChat] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/conversations`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then(r => r.ok ? r.json() : { conversations: [] })
      .then(data => {
        const found = (data.conversations || []).find(c => c.serviceType === "Gift Hampers" && !c.vendorId);
        if (found) setExistingChat(found);
      }).catch(() => {});
  }, [token]);
  const [previewIdx, setPreviewIdx] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [occasionFilter, setOccasionFilter] = useState([]);
  const [showEventTypeFilter, setShowEventTypeFilter] = useState(false);
  const [showGiftTypeFilter, setShowGiftTypeFilter] = useState(false);
  const [similarTo, setSimilarTo] = useState(null);
  const [similarSheetOpen, setSimilarSheetOpen] = useState(false);

  const filteredSamples = samples.filter(s => {
    if (selectedCategories.length > 0) {
      const cats = Array.isArray(s.category) ? s.category : (s.category ? [s.category] : []);
      if (!selectedCategories.some(c => cats.includes(c))) return false;
    }
    if (occasionFilter.length > 0 && !occasionFilter.some(o => (s.occasion || []).includes(o))) return false;
    return true;
  });

  const availableEventTypes = [...new Set(samples.flatMap(s => s.occasion || []).filter(Boolean))].sort();
  const availableGiftTypes  = [...new Set(samples.flatMap(s => Array.isArray(s.category) ? s.category : (s.category ? [s.category] : [])).filter(Boolean))].sort();

  const hammingDist = (h1, h2) => {
    if (!h1 || !h2 || h1.length !== h2.length) return Infinity;
    let d = 0;
    for (let i = 0; i < h1.length; i++) if (h1[i] !== h2[i]) d++;
    return d;
  };

  const similarPhotos = similarTo?.ahash
    ? samples
        .filter(s => s._id !== similarTo._id && s.ahash)
        .map(s => ({ ...s, dist: hammingDist(similarTo.ahash, s.ahash) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 6)
    : [];

  const toggleCategory = (cat) =>
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  const toggleOccasion = (o) => setOccasionFilter(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);

  const activeFilterCount = selectedCategories.length + occasionFilter.length;
  const clearAll = () => { setSelectedCategories([]); setOccasionFilter([]); };

  const openSimilar = (sample) => { setSimilarTo(sample); setSimilarSheetOpen(true); setPreviewIdx(null); };

  useEffect(() => {
    fetch(`${BASE_URL}/admin/gift-hamper-samples`)
      .then(r => r.json())
      .then(d => { setSamples(d.samples || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const preview = previewIdx !== null ? filteredSamples[previewIdx] : null;
  const closePreview = useCallback(() => setPreviewIdx(null), []);
  const prevPreview = useCallback(() => setPreviewIdx(i => (i > 0 ? i - 1 : filteredSamples.length - 1)), [filteredSamples.length]);
  const nextPreview = useCallback(() => setPreviewIdx(i => (i < filteredSamples.length - 1 ? i + 1 : 0)), [filteredSamples.length]);

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
      link.download = (name || "gift-hamper").replace(/[^a-zA-Z0-9 _-]/g, "") + ".jpg";
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
    const photos = selectedPhotos.map(({ url, name, priceRange, vendorName }) => ({ url, name, priceRange, vendorName }));
    const msg = photos.length > 0
      ? `Hi! I'm interested in ordering a gift hamper from Tendr. I've shortlisted ${photos.length === 1 ? "this option" : "these options"}:\n\n${photos.map((p, i) => `${i + 1}. ${p.name || "Gift Hamper"}${p.priceRange ? ` (${p.priceRange})` : ""}`).join("\n")}\n\nCan you help me with customisation, availability and delivery across Delhi NCR?`
      : `Hi! I'd like to order a custom gift hamper from Tendr.\n\nCould you share options based on my occasion and budget? I'm open to personalised packaging and hamper curation. Looking forward to your suggestions!`;

    if (!token) {
      try { sessionStorage.setItem("baat_karo_draft", msg); } catch {}
      if (photos.length > 0) try { sessionStorage.setItem("gh_chat_photos", JSON.stringify(photos)); } catch {}
      navigate("/gift-hampers/chat");
      return;
    }

    const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    try {
      const res = await fetch(`${BASE_URL}/conversations/baat-karo`, {
        method: "POST", headers: hdrs, credentials: "include",
        body: JSON.stringify({ message: msg, serviceType: "Gift Hampers" }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        const cid = data.conversationId;
        for (const photo of photos) {
          if (photo.name) try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers: hdrs, body: JSON.stringify({ sender: "user", content: `📎 ${photo.name}${photo.priceRange ? ` — ${photo.priceRange}` : ""}` }) }); } catch {}
          try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers: hdrs, body: JSON.stringify({ sender: "user", content: `[img:${photo.url}]` }) }); } catch {}
        }
        openExistingChat(cid, { _id: null, name: "Tendr Team", serviceType: "Gift Hampers", approved: false });
      }
    } catch (e) { console.error("GiftHampersCakes chat failed:", e); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: font }}>
      <SEO
        title="Gift Hampers — Tendr"
        description="Curated gift hampers for every celebration. Browse samples and talk to our team for custom orders."
        path="/gift-hampers-cakes"
      />
      <HamburgerNav title="Gift Hampers" showBack />

      {existingChat && (
        <div style={{ background: "linear-gradient(90deg,#1C0A04,#2C1810)", padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid rgba(196,122,46,0.18)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 0 2px rgba(74,222,128,0.22)", flexShrink: 0, animation: "ghPulse 2s infinite" }} />
            <span style={{ color: "#FFF8EC", fontSize: 13, fontWeight: 600, fontFamily: font }}>Active Gift Hampers chat</span>
          </div>
          <button
            onClick={() => openExistingChat(existingChat._id, { _id: null, name: "Tendr Team", serviceType: "Gift Hampers", approved: true })}
            style={{ background: "none", color: "#CCAB4A", border: "1px solid rgba(204,171,74,0.35)", borderRadius: 100, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", letterSpacing: "0.03em" }}
          >
            Resume →
          </button>
        </div>
      )}

      <style>{`
        @keyframes ghShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes ghPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes ghOrbBreath { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:0.78} }
        @keyframes ghCardIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ghIslandIn { from{opacity:0;transform:translateX(-50%) translateY(20px) scale(0.92)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        .gh-card { opacity: 0; animation: ghCardIn 0.38s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .gh-card:hover .gh-overlay { opacity: 1 !important; }
        .gh-card:hover img { transform: scale(1.05) !important; }
        .gh-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 36px rgba(44,26,14,0.14) !important; }
        .gh-card:active { transform: scale(0.98) !important; }
        .gh-filter-btn:hover { background: rgba(196,122,46,0.07) !important; }
        .gh-cta-btn:hover { box-shadow: 0 10px 36px rgba(196,122,46,0.55) !important; transform: translateY(-1px); }
        .gh-cta-btn:active { transform: scale(0.97) !important; }
        @media(max-width:640px){
          .gh-hero-inner { padding: 44px 20px 40px !important; }
          .gh-h1 { font-size: clamp(1.9rem,7vw,2.5rem) !important; }
          .gh-cta-btn { width: 100% !important; justify-content: center; }
          .gh-island { min-width: unset !important; left: 16px !important; right: 16px !important; transform: none !important; border-radius: 20px !important; }
          @keyframes ghIslandIn { from{opacity:0;transform:translateY(20px) scale(0.92)} to{opacity:1;transform:none} }
        }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ background: "#1C0A04", position: "relative", overflow: "hidden" }}>
        {/* Ambient orbs */}
        <div aria-hidden style={{ position:"absolute", top:"-28%", right:"-10%", width:520, height:520, borderRadius:"50%", background:"radial-gradient(circle, rgba(196,122,46,0.22) 0%, rgba(196,122,46,0.07) 42%, transparent 70%)", pointerEvents:"none", animation:"ghOrbBreath 7s ease-in-out infinite" }} />
        <div aria-hidden style={{ position:"absolute", bottom:"-22%", left:"-8%", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle, rgba(204,171,74,0.14) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div aria-hidden style={{ position:"absolute", top:"55%", left:"48%", transform:"translate(-50%,-50%)", width:560, height:280, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(196,122,46,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />
        {/* Crosshatch grid */}
        <div aria-hidden style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(204,171,74,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(204,171,74,0.04) 1px, transparent 1px)", backgroundSize:"44px 44px", pointerEvents:"none" }} />
        {/* Top hairline */}
        <div aria-hidden style={{ position:"absolute", top:0, left:"12%", right:"12%", height:1, background:"linear-gradient(90deg, transparent, rgba(196,122,46,0.38), transparent)", pointerEvents:"none" }} />
        {/* Lettermark watermark */}
        <div aria-hidden style={{ position:"absolute", top:"-6%", right:"-7%", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"min(58vw,500px)", fontWeight:700, fontStyle:"italic", color:"rgba(196,122,46,0.036)", lineHeight:1, pointerEvents:"none", userSelect:"none", WebkitUserSelect:"none", zIndex:0 }}>H</div>

        <div className="gh-hero-inner" style={{ padding:"64px 24px 56px", maxWidth:680, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
          {/* Live badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(196,122,46,0.1)", border:"1px solid rgba(196,122,46,0.22)", borderRadius:100, padding:"5px 14px 5px 10px", marginBottom:20 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ADE80", boxShadow:"0 0 0 2px rgba(74,222,128,0.22)", animation:"ghPulse 2s infinite", flexShrink:0 }} />
            <span style={{ fontSize:10, fontWeight:700, color:"#CCAB4A", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:font }}>Available now · Delhi NCR</span>
          </div>

          <h1 className="gh-h1" style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(2.2rem,5.5vw,3.4rem)", fontWeight:300, fontStyle:"italic", color:"#FFF8EC", margin:"0 0 8px", lineHeight:1.2, letterSpacing:"-0.01em" }}>
            Gift Hampers
          </h1>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(1rem,2.2vw,1.35rem)", fontWeight:300, color:"rgba(255,248,236,0.45)", margin:"0 0 22px", letterSpacing:"0.03em" }}>
            Curated for every occasion
          </div>
          <p style={{ fontSize:15, color:"rgba(255,248,236,0.62)", margin:"0 0 34px", lineHeight:1.78, maxWidth:460, marginLeft:"auto", marginRight:"auto", fontFamily:font }}>
            Browse our sample collection, pick your favourites, and our team will curate the perfect hamper — custom packaging, personalised notes, delivery across Delhi NCR.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button
              className="gh-cta-btn"
              onClick={goToChat}
              style={{ display:"inline-flex", alignItems:"center", gap:9, background:"linear-gradient(135deg,#C47A2E,#CCAB4A)", color:"#fff", fontSize:15, fontWeight:700, padding:"14px 30px", borderRadius:100, border:"none", cursor:"pointer", fontFamily:font, boxShadow:"0 8px 28px rgba(196,122,46,0.42)", letterSpacing:"0.02em", transition:"box-shadow 0.2s, transform 0.2s" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Talk to Our Team{selectedPhotos.length > 0 ? ` · ${selectedPhotos.length} selected` : ""}
            </button>
          </div>
          <p style={{ fontSize:11, color:"rgba(255,248,236,0.28)", marginTop:14, fontFamily:font, letterSpacing:"0.04em" }}>Replies within 2 hours · Custom orders welcome</p>
        </div>
      </div>

      {/* ── Sample Photos ── */}
      <div style={{ background: "#FAF7F2", padding: "52px 24px", paddingBottom: selectedPhotos.length > 0 ? "120px" : "52px", transition: "padding-bottom 0.3s" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:12 }}>
              <div style={{ height:1, width:36, background:"linear-gradient(90deg, transparent, rgba(196,122,46,0.5))" }} />
              <span style={{ fontSize:10, fontWeight:700, color:"#C47A2E", textTransform:"uppercase", letterSpacing:"0.18em", fontFamily:font }}>For reference</span>
              <div style={{ height:1, width:36, background:"linear-gradient(90deg, rgba(196,122,46,0.5), transparent)" }} />
            </div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(1.6rem,3.5vw,2.2rem)", fontWeight:400, color:"#2C1A0E", margin:"0 0 8px", letterSpacing:"-0.01em" }}>Sample Gift Hamper Photos</h2>
            <p style={{ fontSize:13, color:"#9B7450", margin:0, fontFamily:font }}>Tap any photo to preview · select favourites · share with our team</p>
          </div>

          {/* ── Filters ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.14em", flexShrink: 0, fontFamily: font }}>Filter</span>
              <button
                className="gh-filter-btn"
                onClick={() => { setShowEventTypeFilter(v => !v); setShowGiftTypeFilter(false); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 100, border: `1.5px solid ${showEventTypeFilter || occasionFilter.length > 0 ? "#C47A2E" : "rgba(196,122,46,0.28)"}`, background: showEventTypeFilter || occasionFilter.length > 0 ? "rgba(196,122,46,0.08)" : "transparent", color: occasionFilter.length > 0 ? "#C47A2E" : "#5A3A1A", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", transition: "all 0.18s" }}
              >
                Event Type
                {occasionFilter.length > 0 && <span style={{ background: "#C47A2E", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: 100, padding: "1px 6px", marginLeft: 2 }}>{occasionFilter.length}</span>}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ transform: showEventTypeFilter ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}><path d="M1.5 3.5l3.5 3 3.5-3"/></svg>
              </button>
              <button
                className="gh-filter-btn"
                onClick={() => { setShowGiftTypeFilter(v => !v); setShowEventTypeFilter(false); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 100, border: `1.5px solid ${showGiftTypeFilter || selectedCategories.length > 0 ? "#C47A2E" : "rgba(196,122,46,0.28)"}`, background: showGiftTypeFilter || selectedCategories.length > 0 ? "rgba(196,122,46,0.08)" : "transparent", color: selectedCategories.length > 0 ? "#C47A2E" : "#5A3A1A", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", transition: "all 0.18s" }}
              >
                Gift Type
                {selectedCategories.length > 0 && <span style={{ background: "#C47A2E", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: 100, padding: "1px 6px", marginLeft: 2 }}>{selectedCategories.length}</span>}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ transform: showGiftTypeFilter ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}><path d="M1.5 3.5l3.5 3 3.5-3"/></svg>
              </button>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} style={{ fontSize: 12, color: "#9B7450", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: font, padding: "7px 4px" }}>
                  Clear all
                </button>
              )}
            </div>

            {showEventTypeFilter && (
              <div style={{ marginTop: 10, padding: "14px 16px", background: "#fff", borderRadius: 14, border: "1px solid rgba(196,122,46,0.16)", boxShadow: "0 4px 20px rgba(44,26,14,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: font }}>Event Type</span>
                  <button onClick={() => setShowEventTypeFilter(false)} style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(44,26,14,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#7A5535" strokeWidth="2" strokeLinecap="round"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9"/></svg>
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {availableEventTypes.length === 0
                    ? <span style={{ fontSize: 12, color: "#9B7450", fontFamily: font }}>No event types tagged yet</span>
                    : availableEventTypes.map(o => {
                        const active = occasionFilter.includes(o);
                        return (
                          <button key={o} onClick={() => toggleOccasion(o)}
                            style={{ padding: "7px 15px", borderRadius: 100, border: `1.5px solid ${active ? "#C47A2E" : "rgba(196,122,46,0.25)"}`, background: active ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "transparent", color: active ? "#fff" : "#5A3A1A", fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.18s" }}
                          >{o}</button>
                        );
                      })
                  }
                </div>
              </div>
            )}

            {showGiftTypeFilter && (
              <div style={{ marginTop: 10, padding: "14px 16px", background: "#fff", borderRadius: 14, border: "1px solid rgba(196,122,46,0.16)", boxShadow: "0 4px 20px rgba(44,26,14,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: font }}>Gift Type</span>
                  <button onClick={() => setShowGiftTypeFilter(false)} style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(44,26,14,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#7A5535" strokeWidth="2" strokeLinecap="round"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9"/></svg>
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {availableGiftTypes.length === 0
                    ? <span style={{ fontSize: 12, color: "#9B7450", fontFamily: font }}>No gift types tagged yet</span>
                    : availableGiftTypes.map(cat => {
                        const active = selectedCategories.includes(cat);
                        return (
                          <button key={cat} onClick={() => toggleCategory(cat)}
                            style={{ padding: "7px 15px", borderRadius: 100, border: `1.5px solid ${active ? "#C47A2E" : "rgba(196,122,46,0.25)"}`, background: active ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "transparent", color: active ? "#fff" : "#5A3A1A", fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.18s" }}
                          >{cat}</button>
                        );
                      })
                  }
                </div>
              </div>
            )}
          </div>

          {/* ── Grid ── */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid rgba(196,122,46,0.1)" }}>
                  <div style={{ aspectRatio: "4/3", background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "ghShimmer 1.4s infinite" }} />
                  <div style={{ padding: "10px 12px 14px" }}>
                    <div style={{ height: 11, width: "62%", background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "ghShimmer 1.4s infinite", borderRadius: 6, marginBottom: 8 }} />
                    <div style={{ height: 10, width: "38%", background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "ghShimmer 1.4s infinite", borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSamples.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: 16, display: "block", margin: "0 auto 16px" }}>
                <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
              <p style={{ fontSize: 14, color: "#9B7450", margin: 0, fontFamily: font }}>
                {activeFilterCount === 0 ? "Sample photos coming soon. Talk to our team for options." : "No hampers match these filters. Try adjusting your selection."}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
              {filteredSamples.map((s, idx) => {
                const isSelected = selectedPhotos.some(p => p._id === s._id);
                return (
                  <div
                    key={s._id}
                    className="gh-card"
                    onClick={() => setPreviewIdx(idx)}
                    style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: `1.5px solid ${isSelected ? "#C47A2E" : "rgba(196,122,46,0.1)"}`, boxShadow: isSelected ? "0 0 0 2.5px rgba(196,122,46,0.26), 0 6px 24px rgba(44,26,14,0.09)" : "0 2px 12px rgba(44,26,14,0.06)", cursor: "pointer", position: "relative", transition: "box-shadow 0.22s, border-color 0.22s, transform 0.22s", animationDelay: `${Math.min(idx * 48, 480)}ms` }}
                  >
                    {isSelected && (
                      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", display: "flex", alignItems: "center", gap: 4, borderRadius: 100, padding: "4px 9px", boxShadow: "0 2px 8px rgba(196,122,46,0.42)" }}>
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", fontFamily: font }}>Added</span>
                      </div>
                    )}
                    <div style={{ overflow: "hidden", position: "relative" }}>
                      <img src={s.url} alt={s.name || "Gift Hamper"} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block", transition: "transform 0.38s" }} />
                      <div className="gh-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(44,26,14,0.68) 0%, rgba(44,26,14,0.08) 55%, transparent 100%)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.22s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 12, fontWeight: 700, background: "rgba(0,0,0,0.32)", borderRadius: 100, padding: "6px 16px", backdropFilter: "blur(4px)", fontFamily: font }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                          View details
                        </div>
                      </div>
                    </div>
                    {(s.name || s.priceRange) && (
                      <div style={{ padding: "10px 12px 13px" }}>
                        {s.name && <div style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E", marginBottom: 3, fontFamily: font, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>}
                        {s.priceRange && <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", fontFamily: font }}>{s.priceRange}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Floating Island (Dynamic Action — ln-dev7 pattern) ── */}
      {selectedPhotos.length > 0 && (
        <div
          className="gh-island"
          style={{ position: "fixed", bottom: "calc(28px + env(safe-area-inset-bottom, 0px))", left: "50%", transform: "translateX(-50%)", zIndex: 1000, minWidth: 320, maxWidth: "calc(100vw - 32px)", background: "linear-gradient(135deg,rgba(28,10,4,0.96),rgba(44,26,14,0.94))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(196,122,46,0.22)", borderRadius: 100, padding: "10px 10px 10px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,122,46,0.08), inset 0 1px 0 rgba(255,248,236,0.06)", animation: "ghIslandIn 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FFF8EC", fontFamily: font, whiteSpace: "nowrap" }}>
              {selectedPhotos.length} photo{selectedPhotos.length > 1 ? "s" : ""} selected
            </div>
            <button onClick={() => setSelectedPhotos([])} style={{ background: "none", border: "none", color: "rgba(255,248,236,0.4)", fontSize: 11, cursor: "pointer", fontFamily: font, padding: 0, marginTop: 1, letterSpacing: "0.02em" }}>
              Clear
            </button>
          </div>
          <button
            onClick={goToChat}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, padding: "11px 18px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: font, boxShadow: "0 4px 18px rgba(196,122,46,0.48)", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.02em" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Talk to Team
          </button>
        </div>
      )}

      {/* ── Lightbox ── */}
      {preview && (
        <div
          onClick={closePreview}
          style={{ position: "fixed", inset: 0, background: "rgba(10,4,2,0.82)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
        >
          {filteredSamples.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prevPreview(); }}
              style={{ position: "fixed", left: 14, top: "50%", transform: "translateY(-50%)", zIndex: 10000, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.16)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          {filteredSamples.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); nextPreview(); }}
              style={{ position: "fixed", right: 14, top: "50%", transform: "translateY(-50%)", zIndex: 10000, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.16)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}

          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#1C0A04", borderRadius: 22, overflow: "hidden", maxWidth: 520, width: "100%", boxShadow: "0 32px 96px rgba(0,0,0,0.72)", position: "relative", border: "1px solid rgba(196,122,46,0.14)" }}
          >
            {/* Top hairline */}
            <div aria-hidden style={{ position: "absolute", top: 0, left: "18%", right: "18%", height: 1, background: "linear-gradient(90deg, transparent, rgba(196,122,46,0.5), transparent)", zIndex: 3 }} />

            {/* Close */}
            <button
              onClick={closePreview}
              style={{ position: "absolute", top: 12, right: 12, zIndex: 4, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,248,236,0.1)", border: "1px solid rgba(255,248,236,0.1)", color: "#FFF8EC", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9"/></svg>
            </button>

            {filteredSamples.length > 1 && (
              <div style={{ position: "absolute", top: 12, left: 12, zIndex: 4, fontSize: 10, fontWeight: 700, color: "rgba(255,248,236,0.65)", background: "rgba(28,10,4,0.7)", borderRadius: 100, padding: "4px 11px", fontFamily: font, letterSpacing: "0.06em" }}>
                {previewIdx + 1} / {filteredSamples.length}
              </div>
            )}

            <img src={preview.url} alt={preview.name || "Gift Hamper"} style={{ width: "100%", maxHeight: "58vh", objectFit: "contain", background: "#140805", display: "block" }} />

            {/* Chips */}
            {((Array.isArray(preview.category) ? preview.category : (preview.category ? [preview.category] : [])).length > 0 || (preview.occasion || []).length > 0) && (
              <div style={{ padding: "12px 18px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(Array.isArray(preview.category) ? preview.category : (preview.category ? [preview.category] : [])).map(c => (
                  <span key={c} style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "rgba(196,122,46,0.14)", color: "#CCAB4A", border: "1px solid rgba(196,122,46,0.24)", fontFamily: font, letterSpacing: "0.04em" }}>
                    {c}
                  </span>
                ))}
                {(preview.occasion || []).map(o => (
                  <span key={o} style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: "rgba(255,248,236,0.06)", color: "rgba(255,248,236,0.5)", border: "1px solid rgba(255,248,236,0.1)", fontFamily: font }}>
                    {o}
                  </span>
                ))}
              </div>
            )}

            <div style={{ padding: "14px 18px 20px" }}>
              {(preview.name || preview.priceRange || preview.minQty) && (
                <div style={{ marginBottom: 16, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  {preview.name && <span style={{ fontSize: 16, fontWeight: 600, color: "#FFF8EC", fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.01em" }}>{preview.name}</span>}
                  {preview.priceRange && <span style={{ fontSize: 13, fontWeight: 700, color: "#CCAB4A", fontFamily: font }}>{preview.priceRange}</span>}
                  {preview.minQty && <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,248,236,0.45)", background: "rgba(255,248,236,0.06)", border: "1px solid rgba(255,248,236,0.1)", borderRadius: 6, padding: "2px 8px", fontFamily: font }}>Min. {preview.minQty} pcs</span>}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {/* Primary: Add to Chat */}
                {(() => {
                  const isAdded = selectedPhotos.some(p => p._id === preview._id);
                  return (
                    <button
                      onClick={() => { toggleSelect(preview); closePreview(); }}
                      style={{ flex: "1 1 140px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px 18px", borderRadius: 100, border: isAdded ? "1.5px solid rgba(196,122,46,0.4)" : "none", background: isAdded ? "rgba(196,122,46,0.14)" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: isAdded ? "#CCAB4A" : "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: isAdded ? "none" : "0 4px 18px rgba(196,122,46,0.4)", transition: "all 0.18s" }}
                    >
                      {isAdded ? (
                        <><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>Added to Chat</>
                      ) : (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Add to Chat</>
                      )}
                    </button>
                  );
                })()}
                {/* Secondary: Save */}
                <button
                  onClick={() => handleDownload(preview.url, preview.name)}
                  disabled={downloading}
                  style={{ flex: "1 1 90px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 16px", borderRadius: 100, border: "1.5px solid rgba(255,248,236,0.12)", background: "transparent", color: "rgba(255,248,236,0.6)", fontSize: 13, fontWeight: 600, cursor: downloading ? "wait" : "pointer", fontFamily: font }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  {downloading ? "…" : "Save"}
                </button>
                {/* Secondary: Find Similar */}
                {preview.ahash && (
                  <button
                    onClick={() => openSimilar(preview)}
                    style={{ flex: "1 1 90px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 16px", borderRadius: 100, border: "1.5px solid rgba(255,248,236,0.12)", background: "transparent", color: "rgba(255,248,236,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    Similar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Similar Photos Sheet ── */}
      {similarSheetOpen && similarTo && (
        <div onClick={() => setSimilarSheetOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(10,4,2,0.62)", zIndex:9999, display:"flex", alignItems:"flex-end", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", background:"#FAF7F2", borderRadius:"22px 22px 0 0", fontFamily:font, boxShadow:"0 -12px 60px rgba(44,26,14,0.28)", maxHeight:"78dvh", display:"flex", flexDirection:"column", paddingBottom:"env(safe-area-inset-bottom, 0px)" }}>
            {/* Handle bar */}
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px", flexShrink:0 }}>
              <div style={{ width:40, height:4, borderRadius:2, background:"rgba(44,26,14,0.14)" }} />
            </div>
            <div style={{ padding:"8px 20px 0", flexShrink:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:17, fontWeight:700, color:"#2C1A0E", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.01em" }}>Similar Hampers</div>
                  <div style={{ fontSize:12, color:"#9B7450", marginTop:3, fontFamily:font }}>Visually matched from our collection</div>
                </div>
                <button onClick={() => setSimilarSheetOpen(false)} style={{ width:30, height:30, borderRadius:"50%", background:"rgba(44,26,14,0.07)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#7A5535" strokeWidth="2.2" strokeLinecap="round"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9"/></svg>
                </button>
              </div>

              {/* Reference photo */}
              <div style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", background:"rgba(196,122,46,0.06)", borderRadius:14, border:"1px solid rgba(196,122,46,0.14)", marginBottom:16 }}>
                <img src={similarTo.url} alt={similarTo.name || "Reference"} style={{ width:56, height:56, borderRadius:10, objectFit:"cover", flexShrink:0, border:"2px solid rgba(196,122,46,0.28)" }} />
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#C47A2E", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.12em", fontFamily:font }}>Reference photo</div>
                  {similarTo.name && <div style={{ fontSize:13, fontWeight:700, color:"#2C1A0E", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{similarTo.name}</div>}
                  {similarTo.priceRange && <div style={{ fontSize:12, color:"#9B7450", fontFamily:font }}>{similarTo.priceRange}</div>}
                </div>
              </div>
            </div>

            {similarPhotos.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 24px", color:"#9B7450", flex:1 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.38, marginBottom:14, display:"block", margin:"0 auto 14px" }}>
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <div style={{ fontSize:13, fontFamily:font }}>No visually similar photos found yet. More coming soon!</div>
              </div>
            ) : (
              <div style={{ overflowY:"auto", flex:1, padding:"0 20px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:12, paddingBottom:20 }}>
                  {similarPhotos.map(s => {
                    const isSelected = selectedPhotos.some(p => p._id === s._id);
                    return (
                      <div key={s._id} style={{ borderRadius:14, overflow:"hidden", background:"#fff", border:`1.5px solid ${isSelected?"#C47A2E":"rgba(196,122,46,0.12)"}`, boxShadow: isSelected ? "0 0 0 2px rgba(196,122,46,0.2)" : "0 2px 10px rgba(44,26,14,0.06)" }}>
                        <img src={s.url} alt={s.name || "Similar"} style={{ width:"100%", aspectRatio:"4/3", objectFit:"cover", display:"block" }} />
                        <div style={{ padding:"8px 10px 11px" }}>
                          {s.name && <div style={{ fontSize:11, fontWeight:700, color:"#2C1A0E", marginBottom:3, fontFamily:font, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.name}</div>}
                          {s.priceRange && <div style={{ fontSize:11, color:"#C47A2E", fontWeight:700, fontFamily:font, marginBottom:6 }}>{s.priceRange}</div>}
                          <button
                            onClick={() => toggleSelect(s)}
                            style={{ width:"100%", padding:"7px", borderRadius:100, border:`1.5px solid ${isSelected?"#C47A2E":"rgba(196,122,46,0.3)"}`, background:isSelected?"linear-gradient(135deg,#C47A2E,#CCAB4A)":"transparent", color:isSelected?"#fff":"#C47A2E", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:font, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}
                          >
                            {isSelected ? (
                              <><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>Added</>
                            ) : "+ Add"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(44,26,14,0.08)", flexShrink:0 }}>
              <button onClick={goToChat} style={{ width:"100%", padding:"14px", borderRadius:100, border:"none", background:"linear-gradient(135deg,#C47A2E,#CCAB4A)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 20px rgba(196,122,46,0.38)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Talk to Our Team{selectedPhotos.length > 0 ? ` · ${selectedPhotos.length} selected` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GiftHampersCakes;

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";
import { useChatOverlay } from "../../context/ChatContext";
import GiftQuiz from "../../components/GiftQuiz";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const GH_HERO_FALLBACK = [
  { url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80", name: "Gift Box" },
  { url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=80", name: "Hamper" },
  { url: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=900&q=80", name: "Corporate Gift" },
  { url: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=900&q=80", name: "Premium Hamper" },
  { url: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=900&q=80", name: "Sweet Box" },
];

const GiftHampersCakes = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [heroIdx, setHeroIdx] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  // Auto-open quiz when navigated with ?quiz=true
  useEffect(() => {
    if (new URLSearchParams(location.search).get("quiz") === "true") {
      setQuizOpen(true);
    }
  }, [location.search]);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({}); // productId → qty
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name:'', phone:'', address:'', city:'Delhi', pincode:'' });
  const [placing, setPlacing] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [productCatFilter, setProductCatFilter] = useState('All');

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
    fetch(`${BASE_URL}/admin/gift-hamper-samples?type=gift`)
      .then(r => r.json())
      .then(d => { setSamples(d.samples || []); setLoading(false); })
      .catch(() => setLoading(false));
    fetch(`${BASE_URL}/gift-hampers/products`)
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  const heroPhotos = samples.length > 0 ? samples : GH_HERO_FALLBACK;

  useEffect(() => {
    if (heroPhotos.length <= 1) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroPhotos.length), 4000);
    return () => clearInterval(t);
  }, [heroPhotos.length]);

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
        window.dispatchEvent(new CustomEvent("tendr:chat-started"));
        for (const photo of photos) {
          if (photo.name) try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers: hdrs, body: JSON.stringify({ sender: "user", content: `📎 ${photo.name}${photo.priceRange ? ` — ${photo.priceRange}` : ""}` }) }); } catch {}
          try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers: hdrs, body: JSON.stringify({ sender: "user", content: `[img:${photo.url}]` }) }); } catch {}
        }
        openExistingChat(cid, { _id: null, name: "Tendr Team", serviceType: "Gift Hampers", approved: false });
      }
    } catch (e) { console.error("GiftHampersCakes chat failed:", e); }
  };

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const cartCount = Object.values(cartItems).reduce((s, q) => s + q, 0);
  const cartTotal = Object.entries(cartItems).reduce((s, [id, qty]) => {
    const p = products.find(p => p._id === id);
    return s + (p ? p.pricePerUnit * qty : 0);
  }, 0);

  const setQty = (id, delta) => setCartItems(prev => {
    const next = { ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) };
    if (next[id] === 0) delete next[id];
    return next;
  });

  const placeOrder = async () => {
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) return;
    setPlacing(true);
    try {
      const items = Object.entries(cartItems).map(([productId, quantity]) => ({ productId, quantity }));
      const r = await fetch(`${BASE_URL}/gift-hampers/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ items, customerName: checkoutForm.name, customerPhone: checkoutForm.phone, deliveryAddress: checkoutForm.address, city: checkoutForm.city, pincode: checkoutForm.pincode }),
      });
      if (r.ok) { setOrderDone(true); setCartItems({}); }
    } catch {}
    setPlacing(false);
  };

  const productCategories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const visibleProducts = productCatFilter === 'All' ? products : products.filter(p => p.category === productCatFilter);

  const serif = "'Cormorant Garamond', Georgia, serif";

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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@400;500;600;700&family=Dancing+Script:wght@600&display=swap');
        @keyframes ghShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes ghPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes ghCardIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ghIslandIn { from{opacity:0;transform:translateX(-50%) translateY(20px) scale(0.92)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        @keyframes ghIslandInMobile { from{opacity:0;transform:translateY(20px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes ghFade { from{opacity:0} to{opacity:1} }
        .gh-card { opacity:0; animation:ghCardIn 0.36s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .gh-card:hover .gh-overlay { opacity:1 !important; }
        .gh-card:hover img { transform:scale(1.05) !important; }
        .gh-card:hover { transform:translateY(-3px) !important; box-shadow:0 12px 36px rgba(44,26,14,0.15) !important; }
        .gh-card:active { transform:scale(0.98) !important; }
        .gh-chip:hover { border-color:#C47A2E !important; color:#C47A2E !important; }
        .gh-chip.active { background:#1C0A04 !important; border-color:#1C0A04 !important; color:#CCAB4A !important; }
        .gh-btn-gold:hover { box-shadow:0 10px 36px rgba(196,122,46,0.55) !important; transform:translateY(-1px); }
        .gh-btn-gold:active { transform:scale(0.97) !important; }
        .gh-hero-3col { display:grid; grid-template-columns:2fr 2.6fr 1.4fr; background:#1C0A04; min-height:530px; }
        .gh-hero-left { padding:clamp(36px,5vw,64px) clamp(20px,3.5vw,52px); display:flex; flex-direction:column; justify-content:center; position:relative; overflow:hidden; }
        .gh-hero-left::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 80% 60% at -10% 50%, rgba(196,122,46,0.1) 0%, transparent 65%); pointer-events:none; }
        .gh-hero-center { overflow:hidden; position:relative; }
        .gh-hero-center img { width:100%; height:100%; object-fit:cover; display:block; animation:ghFade 0.8s ease forwards; }
        .gh-hero-right { display:flex; flex-direction:column; gap:2px; }
        .gh-hero-right-card { flex:1; position:relative; overflow:hidden; cursor:pointer; }
        .gh-hero-right-card img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.4s; }
        .gh-hero-right-card:hover img { transform:scale(1.06); }
        .gh-hero-right-card-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(28,10,4,0.82) 0%, rgba(28,10,4,0.2) 55%, transparent 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:16px 14px; }
        .gh-value-strip { background:#F0E8DC; border-top:1px solid rgba(196,122,46,0.12); border-bottom:1px solid rgba(196,122,46,0.12); padding:14px clamp(16px,4vw,52px); display:flex; overflow-x:auto; gap:0; scrollbar-width:none; }
        .gh-value-strip::-webkit-scrollbar { display:none; }
        .gh-value-item { flex:1; min-width:148px; display:flex; align-items:center; gap:11px; padding:5px 18px 5px 0; }
        .gh-value-item+.gh-value-item { border-left:1px solid rgba(196,122,46,0.18); padding-left:18px; }
        .gh-quiz-band { position:relative; overflow:hidden; min-height:360px; display:flex; align-items:stretch; }
        .gh-quiz-bg { position:absolute; inset:0; z-index:0; }
        .gh-quiz-bg img { width:100%; height:100%; object-fit:cover; display:block; }
        .gh-quiz-bg::after { content:''; position:absolute; inset:0; background:linear-gradient(100deg, rgba(20,8,2,0.94) 0%, rgba(20,8,2,0.82) 42%, rgba(20,8,2,0.65) 65%, rgba(20,8,2,0.5) 100%); }
        .gh-quiz-inner { position:relative; z-index:1; width:100%; display:flex; gap:clamp(24px,5vw,72px); align-items:center; flex-wrap:wrap; padding:clamp(44px,6vw,72px) clamp(24px,5vw,56px); }
        .gh-quiz-step { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; background:rgba(255,248,236,0.06); border:1px solid rgba(196,122,46,0.22); border-radius:14px; backdrop-filter:blur(6px); cursor:pointer; transition:background 0.18s,border-color 0.18s; }
        .gh-quiz-step:hover { background:rgba(196,122,46,0.12) !important; border-color:rgba(196,122,46,0.4) !important; }
        .gh-masonry { columns:3 200px; column-gap:12px; }
        .gh-masonry-card { break-inside:avoid; margin-bottom:12px; }
        .gh-cat-scroll { display:flex; gap:10px; overflow-x:auto; scrollbar-width:none; padding-bottom:4px; }
        .gh-cat-scroll::-webkit-scrollbar { display:none; }
        .gh-cat-card { flex:0 0 160px; height:200px; border-radius:14px; overflow:hidden; position:relative; cursor:pointer; flex-shrink:0; }
        .gh-cat-card img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.38s; }
        .gh-cat-card:hover img { transform:scale(1.07); }
        .gh-process { display:grid; grid-template-columns:repeat(3,1fr); position:relative; gap:0; }
        .gh-process::before { content:''; position:absolute; top:21px; left:calc(100%/6); right:calc(100%/6); height:1px; background:rgba(196,122,46,0.18); z-index:0; }
        @media(max-width:960px) {
          .gh-hero-3col { grid-template-columns:1fr; min-height:unset; }
          .gh-hero-center { height:260px; }
          .gh-hero-right { flex-direction:row; height:160px; }
          .gh-quiz-inner { flex-direction:column; }
          .gh-process { grid-template-columns:1fr; gap:28px; }
          .gh-process::before { display:none; }
          .gh-process-step { display:flex; align-items:flex-start; gap:16px; text-align:left; }
          .gh-process-num { margin:0 !important; flex-shrink:0; }
        }
        @media(max-width:560px) {
          .gh-hero-center { height:220px; }
          .gh-hero-right { height:130px; }
          .gh-masonry { columns:2 140px; column-gap:8px; }
          .gh-masonry-card { margin-bottom:8px; }
          .gh-island { left:16px !important; right:16px !important; transform:none !important; border-radius:20px !important; animation-name:ghIslandInMobile !important; bottom:calc(72px + env(safe-area-inset-bottom,0px)) !important; }
          .gh-cat-card { flex:0 0 130px; height:165px; }
        }
      `}</style>

      {/* ── GIFT HAMPERS HEADER BAR ── */}
      <div style={{ background:"#F5F0E8", display:"flex", alignItems:"center", justifyContent:"center", gap:14, padding:"11px clamp(20px,5vw,48px)" }}>
        <div style={{ flex:1, height:1, background:"rgba(28,10,4,0.12)" }} />
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:"#2C1A0E", fontFamily:font, whiteSpace:"nowrap" }}>Gift Hampers</span>
        <div style={{ flex:1, height:1, background:"rgba(28,10,4,0.12)" }} />
      </div>

      {/* ── HERO (3-col: text | main photo | 2 stacked cards) ── */}
      <section className="gh-hero-3col">
        {/* Left: text panel */}
        <div className="gh-hero-left">
          {/* Live badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:20, position:"relative", zIndex:1 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ADE80", boxShadow:"0 0 0 3px rgba(74,222,128,0.18)", display:"inline-block", animation:"ghPulse 2s infinite", flexShrink:0 }} />
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(196,164,130,0.8)", fontFamily:font }}>Available Now · Delhi NCR</span>
          </div>
          {/* Headline */}
          <h1 style={{ fontFamily:serif, fontSize:"clamp(2.1rem,3.8vw,3.2rem)", fontWeight:400, lineHeight:1.12, color:"#FFF8EC", margin:"0 0 14px", position:"relative", zIndex:1, textWrap:"balance" }}>
            Gifts that say exactly <em style={{ fontStyle:"italic", color:"#CCAB4A" }}>what you mean.</em>
          </h1>
          <p style={{ fontSize:14, color:"rgba(255,248,236,0.55)", lineHeight:1.72, margin:"0 0 24px", position:"relative", zIndex:1 }}>
            Curated hampers for every celebration — fully customised, beautifully packed, delivered across Delhi NCR.
          </p>
          {/* 2×2 value mini-grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px", marginBottom:26, position:"relative", zIndex:1 }}>
            {[
              { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>, label:"Fully Customised", sub:"Your base, fillings & finish" },
              { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, label:"Same-Week Delivery", sub:"Across Delhi NCR" },
              { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, label:"Perfect for Every Occasion", sub:"Diwali · Corporate · Birthdays" },
              { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, label:"Curated by Experts", sub:"Our team builds it with you" },
            ].map((v, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:9 }}>
                <span style={{ color:"#CCAB4A", marginTop:1, flexShrink:0 }}>{v.icon}</span>
                <div>
                  <div style={{ fontSize:11.5, fontWeight:700, color:"rgba(255,248,236,0.85)", lineHeight:1.3 }}>{v.label}</div>
                  <div style={{ fontSize:10.5, color:"rgba(196,164,130,0.55)", marginTop:1 }}>{v.sub}</div>
                </div>
              </div>
            ))}
          </div>
          {/* CTAs */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", position:"relative", zIndex:1 }}>
            <button
              className="gh-btn-gold"
              onClick={() => setQuizOpen(true)}
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#C47A2E,#CCAB4A)", color:"#fff", fontSize:13.5, fontWeight:700, padding:"12px 26px", borderRadius:100, border:"none", cursor:"pointer", fontFamily:font, boxShadow:"0 6px 22px rgba(196,122,46,0.42)", letterSpacing:"0.02em", transition:"box-shadow 0.18s,transform 0.12s" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              Find Your Gift →
            </button>
            <button
              onClick={() => document.getElementById("gh-grid")?.scrollIntoView({ behavior:"smooth" })}
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,248,236,0.07)", color:"rgba(255,248,236,0.78)", fontSize:13.5, fontWeight:600, padding:"12px 22px", borderRadius:100, border:"1px solid rgba(255,248,236,0.14)", cursor:"pointer", fontFamily:font, transition:"background 0.15s" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Browse Collection
            </button>
          </div>
          {/* Meta */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:16, position:"relative", zIndex:1 }}>
            <span style={{ fontSize:11, color:"rgba(255,248,236,0.28)", fontFamily:font, display:"flex", alignItems:"center", gap:5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Replies within 2 hours
            </span>
            <span style={{ width:3, height:3, borderRadius:"50%", background:"rgba(255,248,236,0.15)", flexShrink:0 }} />
            <span style={{ fontSize:11, color:"rgba(255,248,236,0.28)", fontFamily:font, display:"flex", alignItems:"center", gap:5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Custom orders welcome
            </span>
          </div>
          {/* Script text */}
          <div style={{ fontFamily:"'Dancing Script', cursive", fontSize:"clamp(1.1rem,2vw,1.5rem)", color:"rgba(196,164,130,0.38)", marginTop:"auto", paddingTop:28, position:"relative", zIndex:1, lineHeight:1.3 }}>
            Thoughtful Gifts. Happier People.
          </div>
        </div>

        {/* Center: main photo */}
        <div className="gh-hero-center">
          <img src={heroPhotos[0]?.url} alt={heroPhotos[0]?.name || "Gift hamper"} />
        </div>

        {/* Right: 2 stacked photo cards */}
        <div className="gh-hero-right">
          {[
            { photo: heroPhotos[1] || heroPhotos[0], title:"Timeless Traditions", sub:"For your loved ones" },
            { photo: heroPhotos[2] || heroPhotos[0], title:"Personalised Just for You", sub:"Make it truly theirs" },
          ].map((card, i) => (
            <div
              key={i}
              className="gh-hero-right-card"
              onClick={() => document.getElementById("gh-grid")?.scrollIntoView({ behavior:"smooth" })}
            >
              <img src={card.photo?.url} alt={card.title} />
              <div className="gh-hero-right-card-overlay">
                <div style={{ fontSize:13, fontWeight:700, color:"#FFF8EC", fontFamily:serif, lineHeight:1.25, marginBottom:4 }}>{card.title}</div>
                <div style={{ fontSize:11, color:"rgba(255,248,236,0.58)", fontFamily:font, marginBottom:10 }}>{card.sub}</div>
                <div style={{ width:28, height:28, borderRadius:"50%", border:"1px solid rgba(255,248,236,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,248,236,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUE STRIP ── */}
      <div className="gh-value-strip">
        {[
          { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>, title:"Fully Customised", sub:"Base, fillings & garnish your way" },
          { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title:"Same-Week Delivery", sub:"Across Delhi NCR" },
          { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>, title:"Every Occasion", sub:"Diwali · Corporate · Birthdays & more" },
          { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, title:"Personal Curation", sub:"Our team builds it with you" },
        ].map((v, i) => (
          <div key={i} className="gh-value-item">
            <span style={{ flexShrink:0, lineHeight:0 }}>{v.icon}</span>
            <div>
              <div style={{ fontSize:12.5, fontWeight:700, color:"#2C1A0E", letterSpacing:"0.01em" }}>{v.title}</div>
              <div style={{ fontSize:11, color:"#9B7450", lineHeight:1.4 }}>{v.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUIZ BAND (with background photo) ── */}
      <section className="gh-quiz-band">
        {/* Background photo with overlay */}
        <div className="gh-quiz-bg">
          {heroPhotos[1]?.url && <img src={heroPhotos[1].url} alt="" aria-hidden />}
        </div>
        <div className="gh-quiz-inner">
          {/* Left: text + CTA */}
          <div style={{ flex:"1 1 260px", minWidth:0 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#CCAB4A", marginBottom:14, fontFamily:font }}>Gift Finder — 3 Steps</div>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(2.2rem,4.5vw,3.2rem)", fontWeight:400, color:"#FFF8EC", lineHeight:1.12, textWrap:"balance", margin:"0 0 14px" }}>
              Not sure what to get? <em style={{ fontStyle:"italic", color:"#CCAB4A" }}>We'll help.</em>
            </h2>
            <p style={{ fontSize:14, color:"rgba(196,164,130,0.72)", lineHeight:1.72, maxWidth:360, margin:"0 0 28px", fontFamily:font }}>
              Tell us the base, what goes inside, and the finishing touches — we'll show you hampers that match.
            </p>
            <div style={{ display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
              <button
                className="gh-btn-gold"
                onClick={() => setQuizOpen(true)}
                style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#C47A2E,#CCAB4A)", color:"#fff", fontSize:14, fontWeight:700, padding:"13px 28px", borderRadius:100, border:"none", cursor:"pointer", fontFamily:font, boxShadow:"0 6px 24px rgba(196,122,46,0.45)", letterSpacing:"0.02em", transition:"box-shadow 0.18s,transform 0.12s" }}
              >
                Start Finding →
              </button>
              <button
                onClick={() => document.getElementById("gh-grid")?.scrollIntoView({ behavior:"smooth" })}
                style={{ display:"inline-flex", alignItems:"center", gap:7, background:"none", border:"none", color:"rgba(255,248,236,0.5)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:font }}
              >
                <span style={{ width:24, height:24, borderRadius:"50%", border:"1px solid rgba(255,248,236,0.22)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                </span>
                Watch how it works
              </button>
            </div>
            <div style={{ fontFamily:"'Dancing Script', cursive", fontSize:"1.3rem", color:"rgba(196,164,130,0.32)", marginTop:32, lineHeight:1.3 }}>
              Thoughtful gifts for every occasion
            </div>
          </div>
          {/* Right: step cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, flex:"0 0 auto", minWidth:220, width:"min(100%,340px)" }}>
            {[
              { n:"1", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>, label:"Choose a base", sub:"Tokri, Gift Box, Wooden Tray, Pooja Thali…" },
              { n:"2", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>, label:"What goes inside?", sub:"Chocolates, Dry Fruits, Drinkware, Spiritual…" },
              { n:"3", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, label:"Finishing touches", sub:"Ribbons, Dried Flowers, Wax Seal, Gift Card…" },
            ].map(s => (
              <div key={s.n} className="gh-quiz-step" onClick={() => setQuizOpen(true)}>
                <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(196,122,46,0.2)", border:"1px solid rgba(204,171,74,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {s.icon}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#FFF8EC", fontFamily:font }}>{s.label}</div>
                    <div style={{ fontSize:11, color:"rgba(196,164,130,0.6)", marginTop:2, fontFamily:font, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.sub}</div>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(196,164,130,0.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><path d="M9 18l6-6-6-6"/></svg>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Checkout modal ── */}
      {checkoutOpen && (
        <div onClick={() => { if (!placing) setCheckoutOpen(false); }} style={{ position:"fixed", inset:0, background:"rgba(44,26,14,0.55)", zIndex:9200, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(3px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#FFFCF5", borderRadius:24, width:"100%", maxWidth:440, maxHeight:"90vh", overflowY:"auto", padding:"24px 22px", fontFamily:font, boxShadow:"0 24px 80px rgba(44,26,14,0.22)" }}>
            {orderDone ? (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <div style={{ fontSize:52, marginBottom:12 }}>🎁</div>
                <div style={{ fontSize:20, fontWeight:800, color:"#2C1A0E", marginBottom:8 }}>Order Placed!</div>
                <div style={{ fontSize:13, color:"#9B7450", lineHeight:1.7 }}>We'll confirm your order on WhatsApp and coordinate delivery across Delhi NCR.</div>
                <button onClick={() => { setCheckoutOpen(false); setOrderDone(false); }} style={{ marginTop:20, padding:"12px 32px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#C47A2E,#CCAB4A)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize:17, fontWeight:800, color:"#2C1A0E", marginBottom:4 }}>Checkout</div>
                <div style={{ fontSize:12, color:"#9B7450", marginBottom:20 }}>₹{cartTotal.toLocaleString('en-IN')} · {cartCount} item{cartCount>1?'s':''}</div>

                {/* Order summary */}
                <div style={{ background:"rgba(196,122,46,0.05)", borderRadius:12, padding:"12px 14px", marginBottom:20 }}>
                  {Object.entries(cartItems).map(([id, qty]) => {
                    const p = products.find(p => p._id === id);
                    if (!p) return null;
                    return (
                      <div key={id} style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, color:"#2C1A0E", fontWeight:600, marginBottom:5 }}>
                        <span>{p.name} ×{qty}</span>
                        <span style={{ color:"#C47A2E" }}>₹{(p.pricePerUnit*qty).toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                </div>

                {[['name','Your Name *','text'],['phone','WhatsApp Number *','tel'],['address','Delivery Address *','text'],['city','City *','text'],['pincode','Pincode','text']].map(([field, label, type]) => (
                  <div key={field} style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#9B7450", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>{label}</div>
                    <input type={type} value={checkoutForm[field]} onChange={e => setCheckoutForm(f => ({ ...f, [field]: e.target.value }))}
                      style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid rgba(196,122,46,0.2)", fontFamily:font, fontSize:13.5, color:"#2C1A0E", outline:"none", background:"#fff", boxSizing:"border-box" }} />
                  </div>
                ))}

                <button onClick={placeOrder} disabled={placing || !checkoutForm.name || !checkoutForm.phone || !checkoutForm.address}
                  style={{ width:"100%", marginTop:8, padding:"14px", borderRadius:12, border:"none", background:(!checkoutForm.name||!checkoutForm.phone||!checkoutForm.address||placing)?"rgba(196,122,46,0.4)":"linear-gradient(135deg,#C47A2E,#CCAB4A)", color:"#fff", fontSize:15, fontWeight:800, cursor:(!checkoutForm.name||!checkoutForm.phone||!checkoutForm.address||placing)?"default":"pointer", fontFamily:font }}>
                  {placing ? "Placing Order…" : `Place Order · ₹${cartTotal.toLocaleString('en-IN')}`}
                </button>
                <div style={{ fontSize:11, color:"#9B7450", textAlign:"center", marginTop:10 }}>We'll confirm on WhatsApp before dispatching</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── GALLERY ── */}
      <section id="gh-grid" style={{ background:"#FAF7F2", padding:"clamp(48px,6vw,80px) clamp(20px,5vw,56px)", paddingBottom: selectedPhotos.length > 0 ? "clamp(140px,18vw,160px)" : undefined, transition:"padding-bottom 0.3s" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          {/* Header: left text + right category scroll */}
          <div style={{ display:"flex", gap:"clamp(24px,4vw,56px)", alignItems:"flex-start", marginBottom:36, flexWrap:"wrap" }}>
            <div style={{ flex:"0 0 auto", maxWidth:360 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#C47A2E", textTransform:"uppercase", letterSpacing:"0.24em", margin:"0 0 10px", fontFamily:font }}>Browse Samples</p>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(1.7rem,3.5vw,2.4rem)", fontWeight:400, color:"#2C1A0E", margin:"0 0 6px", lineHeight:1.2 }}>
                Real hampers, <em style={{ fontStyle:"italic", color:"#C47A2E" }}>real occasions.</em>
              </h2>
              <p style={{ fontSize:13, color:"#9B7450", margin:0, fontFamily:font }}>Click any photo to preview · select favourites · share with our team</p>
            </div>
            {/* Category scroll cards */}
            <div style={{ flex:"1 1 0", minWidth:0 }}>
              <div className="gh-cat-scroll">
                {[
                  { label:"Diwali",     cat:"Festive & Diwali" },
                  { label:"Corporate",  cat:"Corporate" },
                  { label:"Birthdays",  cat:"Birthday" },
                  { label:"Weddings",   cat:"Wedding" },
                  { label:"Festive",    cat:"Festive" },
                  { label:"Spiritual",  cat:"Spiritual & Pooja" },
                ].map(({ label, cat }) => {
                  const photo = samples.find(s => {
                    const cats = Array.isArray(s.category) ? s.category : [s.category || ""];
                    return cats.some(c => (c||"").toLowerCase().includes(cat.split(" ")[0].toLowerCase()));
                  }) || samples[0];
                  const isActive = selectedCategories.some(c => c.toLowerCase().includes(cat.split(" ")[0].toLowerCase()));
                  return (
                    <div
                      key={label}
                      className="gh-cat-card"
                      onClick={() => toggleCategory(availableGiftTypes.find(g => g.toLowerCase().includes(cat.split(" ")[0].toLowerCase())) || cat)}
                      style={{ outline: isActive ? "2.5px solid #C47A2E" : "none", outlineOffset:2 }}
                    >
                      {photo?.url
                        ? <img src={photo.url} alt={label} />
                        : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#2C1A0E,#1C0A04)" }} />}
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(28,10,4,0.78) 0%, rgba(28,10,4,0.1) 55%, transparent 100%)" }} />
                      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span style={{ fontSize:13, fontWeight:700, color:"#FFF8EC", fontFamily:font }}>{label}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,248,236,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter chips */}
          <div style={{ marginBottom:8, display:"flex", gap:7, flexWrap:"wrap" }}>
            <button
              className={`gh-chip${activeFilterCount === 0 ? " active" : ""}`}
              onClick={clearAll}
              style={{ fontFamily:font, fontSize:12.5, fontWeight:600, padding:"7px 16px", borderRadius:100, border:"1.5px solid rgba(196,122,46,0.25)", background:"#fff", color:"#9B7450", cursor:"pointer", transition:"all 0.15s" }}
            >All</button>
            {availableGiftTypes.map(cat => (
              <button
                key={cat}
                className={`gh-chip${selectedCategories.includes(cat) ? " active" : ""}`}
                onClick={() => toggleCategory(cat)}
                style={{ fontFamily:font, fontSize:12.5, fontWeight:600, padding:"7px 16px", borderRadius:100, border:"1.5px solid rgba(196,122,46,0.25)", background:"#fff", color:"#9B7450", cursor:"pointer", transition:"all 0.15s" }}
              >{cat}</button>
            ))}
          </div>
          {availableEventTypes.length > 0 && (
            <div style={{ marginBottom:28, display:"flex", gap:7, flexWrap:"wrap" }}>
              {availableEventTypes.map(o => (
                <button
                  key={o}
                  className={`gh-chip${occasionFilter.includes(o) ? " active" : ""}`}
                  onClick={() => toggleOccasion(o)}
                  style={{ fontFamily:font, fontSize:11.5, fontWeight:600, padding:"5px 13px", borderRadius:100, border:"1.5px solid rgba(196,122,46,0.2)", background:"#fff", color:"#9B7450", cursor:"pointer", transition:"all 0.15s" }}
                >{o}</button>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="gh-masonry">
              {[0,1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="gh-masonry-card" style={{ borderRadius:14, overflow:"hidden", background:"#fff" }}>
                  <div style={{ aspectRatio: i%3===0 ? "3/4" : "4/3", background:"linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize:"200% 100%", animation:"ghShimmer 1.4s infinite" }} />
                </div>
              ))}
            </div>
          ) : filteredSamples.length === 0 ? (
            <div style={{ textAlign:"center", padding:"64px 24px" }}>
              <p style={{ fontSize:14, color:"#9B7450", margin:0, fontFamily:font }}>
                {activeFilterCount === 0 ? "Sample photos coming soon. Talk to our team for options." : "No hampers match these filters. Try adjusting your selection."}
              </p>
              {activeFilterCount > 0 && <button onClick={clearAll} style={{ marginTop:12, fontFamily:font, fontSize:13, fontWeight:600, color:"#C47A2E", background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3 }}>Clear filters</button>}
            </div>
          ) : (
            <div className="gh-masonry">
              {filteredSamples.map((s, idx) => {
                const isSelected = selectedPhotos.some(p => p._id === s._id);
                return (
                  <div
                    key={s._id}
                    className="gh-masonry-card gh-card"
                    onClick={() => setPreviewIdx(idx)}
                    style={{ borderRadius:14, overflow:"hidden", background:"#fff", border:`1.5px solid ${isSelected ? "#C47A2E" : "rgba(196,122,46,0.12)"}`, boxShadow: isSelected ? "0 0 0 2.5px rgba(196,122,46,0.24), 0 6px 24px rgba(44,26,14,0.09)" : "0 1px 8px rgba(44,26,14,0.06)", cursor:"pointer", position:"relative", transition:"box-shadow 0.22s,border-color 0.22s,transform 0.22s", animationDelay:`${Math.min(idx*40,400)}ms` }}
                  >
                    {isSelected && (
                      <div style={{ position:"absolute", top:10, right:10, zIndex:2, background:"linear-gradient(135deg,#C47A2E,#CCAB4A)", color:"#fff", display:"flex", alignItems:"center", gap:4, borderRadius:100, padding:"4px 9px", boxShadow:"0 2px 8px rgba(196,122,46,0.42)" }}>
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
                        <span style={{ fontSize:9, fontWeight:800, letterSpacing:"0.06em", fontFamily:font }}>Added</span>
                      </div>
                    )}
                    <div style={{ overflow:"hidden", position:"relative" }}>
                      <img src={s.url} alt={s.name || "Gift Hamper"} style={{ width:"100%", aspectRatio: idx%5===0?"3/4":"4/3", objectFit:"cover", display:"block", transition:"transform 0.38s" }} loading="lazy" />
                      <div className="gh-overlay" style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(44,26,14,0.68) 0%, rgba(44,26,14,0.06) 55%, transparent 100%)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.22s" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, color:"#fff", fontSize:12, fontWeight:700, background:"rgba(0,0,0,0.28)", borderRadius:100, padding:"6px 16px", backdropFilter:"blur(4px)", fontFamily:font }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                          View
                        </div>
                      </div>
                    </div>
                    {(s.name || s.priceRange || (Array.isArray(s.category)?s.category:[s.category||""]).filter(Boolean).length>0) && (
                      <div style={{ padding:"10px 12px 12px" }}>
                        {(Array.isArray(s.category)?s.category:[s.category||""]).filter(Boolean).map(c=>(
                          <span key={c} style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"#C47A2E", marginRight:6, fontFamily:font }}>{c}</span>
                        ))}
                        {s.name && <div style={{ fontSize:12, fontWeight:700, color:"#2C1A0E", marginTop:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:font }}>{s.name}</div>}
                        {s.priceRange && <div style={{ fontSize:11, fontWeight:700, color:"#C47A2E", marginTop:2, fontFamily:font }}>{s.priceRange}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background:"#F0E8DC", padding:"clamp(52px,7vw,88px) clamp(20px,5vw,56px)" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#C47A2E", textTransform:"uppercase", letterSpacing:"0.24em", margin:"0 0 10px", fontFamily:font }}>How It Works</p>
          <h2 style={{ fontFamily:serif, fontSize:"clamp(1.7rem,3.5vw,2.4rem)", fontWeight:400, color:"#2C1A0E", margin:"0 0 44px", lineHeight:1.2 }}>
            From idea to <em style={{ fontStyle:"italic", color:"#C47A2E" }}>your door.</em>
          </h2>
          <div className="gh-process">
            {[
              { n:"1", title:"Browse & Quiz", body:"Use the gift finder or scroll the gallery. Shortlist the photos that feel right." },
              { n:"2", title:"Baat Karo", body:"Chat with our team. We'll confirm your budget, occasion, and personalisation." },
              { n:"3", title:"We Curate & Deliver", body:"Your hamper is hand-packed and delivered across Delhi NCR — often within the week." },
            ].map(step => (
              <div key={step.n} className="gh-process-step" style={{ textAlign:"center", padding:"0 clamp(12px,3vw,32px)" }}>
                <div className="gh-process-num" style={{ width:44, height:44, borderRadius:"50%", background:"#FAF7F2", border:"1.5px solid rgba(196,122,46,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", fontFamily:serif, fontSize:17, fontWeight:500, color:"#C47A2E", position:"relative", zIndex:1 }}>{step.n}</div>
                <h4 style={{ fontFamily:serif, fontSize:"1.2rem", fontWeight:500, color:"#2C1A0E", margin:"0 0 8px" }}>{step.title}</h4>
                <p style={{ fontSize:13.5, color:"#9B7450", lineHeight:1.65, margin:0, fontFamily:font }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ background:"#1C0A04", padding:"clamp(56px,8vw,96px) clamp(20px,5vw,56px)", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div aria-hidden style={{ position:"absolute", top:"-40%", left:"50%", transform:"translateX(-50%)", width:600, height:400, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(196,122,46,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#CCAB4A", margin:"0 0 16px", fontFamily:font }}>Ready to Order?</p>
        <h2 style={{ fontFamily:serif, fontSize:"clamp(2.2rem,5vw,3.4rem)", fontWeight:400, color:"#FFF8EC", lineHeight:1.2, margin:"0 0 14px" }}>
          Let's build something <em style={{ fontStyle:"italic", color:"#CCAB4A" }}>they'll remember.</em>
        </h2>
        <p style={{ fontSize:14.5, color:"rgba(196,164,130,0.72)", maxWidth:420, margin:"0 auto 36px", lineHeight:1.7, fontFamily:font }}>
          Tell us your occasion, budget, and the person you're gifting — our team takes it from there.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button
            className="gh-btn-gold"
            onClick={goToChat}
            style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#C47A2E,#CCAB4A)", color:"#fff", fontSize:14.5, fontWeight:700, padding:"15px 36px", borderRadius:100, border:"none", cursor:"pointer", fontFamily:font, boxShadow:"0 6px 24px rgba(196,122,46,0.42)", letterSpacing:"0.02em", transition:"box-shadow 0.18s,transform 0.12s" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Baat Karo →
          </button>
          <button
            onClick={() => document.getElementById("gh-grid")?.scrollIntoView({ behavior:"smooth" })}
            style={{ display:"inline-flex", alignItems:"center", gap:6, background:"transparent", color:"rgba(255,248,236,0.7)", fontSize:14, fontWeight:600, padding:"15px 28px", borderRadius:100, border:"1.5px solid rgba(196,122,46,0.35)", cursor:"pointer", fontFamily:font, transition:"border-color 0.15s,color 0.15s" }}
          >Browse Gallery</button>
        </div>
      </section>

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

      {/* Gift Finder Quiz */}
      {quizOpen && (
        <GiftQuiz
          samples={samples}
          occasions={availableEventTypes}
          categories={availableGiftTypes}
          products={[]}
          cartItems={{}}
          setQty={null}
          onSelect={(sample) => {
            setSelectedPhotos(prev => prev.some(p => p._id === sample._id) ? prev : [...prev, sample]);
            document.getElementById('gh-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          onClose={() => { setQuizOpen(false); if (Object.keys(cartItems).length > 0) setCheckoutOpen(true); }}
        />
      )}
    </div>
  );
};

export default GiftHampersCakes;

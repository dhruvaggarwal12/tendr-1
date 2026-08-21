import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPlaceById, PLACE_TYPES } from "../../data/partyPlaces";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font   = "'Outfit', sans-serif";
const gold   = "#C47A2E";
const goldLt = "#CCAB4A";
const ink    = "#1C0900";
const cream  = "#FFFCF5";
const bg     = "#F7F3ED";

const fmt    = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const TENDR_WA = "919211668427";

const SVC_CONFIG = {
  Decoration:  { icon: "🎀", color: "#D946A0", bg: "rgba(217,70,160,0.07)", desc: "Balloons, flowers, draping — themed & set up" },
  Catering:    { icon: "🍽️", color: "#D97706", bg: "rgba(217,119,6,0.07)",   desc: "Fresh food prepared on-site by verified chefs" },
  Photography: { icon: "📸", color: "#2563EB", bg: "rgba(37,99,235,0.07)",   desc: "Pro coverage — edited photos in 48 hrs" },
  DJ:          { icon: "🎵", color: "#7C3AED", bg: "rgba(124,58,237,0.07)",  desc: "DJ + sound system, setup & takedown included" },
};

const DEFAULT_REVIEWS = [
  { name: "Priya Sharma",  rating: 5, date: "March 2025",    text: "Absolutely stunning! The decoration team was professional and the catering was top-notch. Our anniversary party was a huge hit — highly recommend Tendr." },
  { name: "Rohan Mehta",   rating: 5, date: "February 2025", text: "Booked the villa for my birthday and it was beyond expectations. Beautiful setup, great food, everything handled by the team. Will definitely book again!" },
  { name: "Simran Kaur",   rating: 4, date: "January 2025",  text: "Great experience overall. The place looked amazing with the decor package. Only minor thing was parking, but the team sorted it quickly." },
];

function Stars({ rating, size = 14, showNum = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= Math.round(rating) ? gold : "#e5e7eb"} aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      {showNum && <span style={{ fontSize: size, fontWeight: 700, color: ink, marginLeft: 2 }}>{rating}</span>}
    </span>
  );
}

export default function PartyPlaceProfile() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const place    = getPlaceById(id);

  const [activePhoto,    setActivePhoto]    = useState(0);
  const [lightboxOpen,   setLightboxOpen]   = useState(false);
  const [lightboxIdx,    setLightboxIdx]    = useState(0);
  const [openCats,       setOpenCats]       = useState({});
  const [selectedPkgs,   setSelectedPkgs]   = useState({});
  const [showBookForm,   setShowBookForm]   = useState(false);
  const [bookForm,       setBookForm]       = useState({ name: "", phone: "", date: "", guests: "", occasion: "" });
  const [reviews,        setReviews]        = useState(DEFAULT_REVIEWS);
  const [reviewForm,     setReviewForm]     = useState({ name: "", rating: 5, text: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const onKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowRight") setLightboxIdx(i => (i + 1) % place.photos.length);
      if (e.key === "ArrowLeft")  setLightboxIdx(i => (i - 1 + place.photos.length) % place.photos.length);
      if (e.key === "Escape")     setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, place?.photos?.length]);

  if (!place) { navigate("/party-places"); return null; }

  const typeLabel = PLACE_TYPES.find(t => t.id === place.type);
  const toggleCat = (cat) => setOpenCats(p => ({ ...p, [cat]: !p[cat] }));
  const togglePkg = (cat, pkgId) => setSelectedPkgs(p => ({ ...p, [cat]: p[cat] === pkgId ? null : pkgId }));

  const totalPackagePrice = Object.entries(selectedPkgs).reduce((sum, [cat, pkgId]) => {
    if (!pkgId) return sum;
    return sum + (place.packages[cat]?.find(p => p.id === pkgId)?.price || 0);
  }, 0);
  const grandTotal = place.roomPrice + place.serviceCharge + totalPackagePrice;
  const selectedCount = Object.values(selectedPkgs).filter(Boolean).length;

  const pkgLines = () => Object.entries(selectedPkgs)
    .filter(([, v]) => v)
    .map(([cat, pkgId]) => {
      const pkg = place.packages[cat]?.find(p => p.id === pkgId);
      return pkg ? `  • ${cat}: ${pkg.name} — ${fmt(pkg.price)}` : null;
    }).filter(Boolean);

  const sendToWA = (msg) => window.open(`https://wa.me/${TENDR_WA}?text=${encodeURIComponent(msg)}`, "_blank");

  const openBookWA = (e) => {
    e.preventDefault();
    const lines = pkgLines();
    sendToWA([
      `🎉 Party Place Booking Request`,
      ``,
      `📍 ${place.name}`,
      `🗺 ${place.location}`,
      ``,
      `👤 Name: ${bookForm.name}`,
      `📞 Phone: ${bookForm.phone}`,
      `📅 Date: ${bookForm.date}`,
      `👥 Guests: ${bookForm.guests}`,
      `🎊 Occasion: ${bookForm.occasion || "Not specified"}`,
      ``,
      `💰 Pricing:`,
      `  Venue: ${fmt(place.roomPrice)}`,
      `  Service charge: ${fmt(place.serviceCharge)}`,
      lines.length ? lines.join("\n") : `  Packages: None selected`,
      `  ─────────────`,
      `  Total: ${fmt(grandTotal)}`,
      ``,
      `Please confirm my booking. Thank you!`,
    ].join("\n"));
    setShowBookForm(false);
  };

  const openChatWA = () => {
    const lines = pkgLines();
    sendToWA([
      `Hi Tendr! I'm interested in ${place.name} and have some questions.`,
      `📍 ${place.name} · ${place.location}`,
      lines.length ? `\nPackages I'm considering:\n${lines.join("\n")}` : ``,
      `\n💰 Estimated total: ${fmt(grandTotal)}`,
      `\nCould we discuss the details?`,
    ].filter(x => x !== undefined).join("\n"));
  };

  const photos = place.photos || [];

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: font }}>
      <SEO title={`${place.name} — Tendr Party Places`} description={place.tagline} path={`/party-places/${id}`} />
      <HamburgerNav />

      <style>{`
        @media(max-width:767px){
          .ppp-grid{grid-template-columns:1fr!important}
          .ppp-sticky{position:relative!important;top:auto!important}
          .ppp-photo-grid{height:260px!important;grid-template-columns:1fr!important;grid-template-rows:1fr!important}
          .ppp-photo-grid .side-photos{display:none!important}
          .ppp-mob-book{display:flex!important}
        }
        @media(min-width:768px){.ppp-mob-book{display:none!important}}
      `}</style>

      {/* ── Photo Grid ── */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "20px 20px 0", position: "relative" }}>
        {/* Back link */}
        <button onClick={() => navigate("/party-places")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: ink, background: "none", border: "none", cursor: "pointer", fontFamily: font, marginBottom: 14, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
          Party Places
        </button>

        {/* 5-photo Airbnb-style grid */}
        <div className="ppp-photo-grid" style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gridTemplateRows: "1fr 1fr", gap: 6, height: 440, borderRadius: 20, overflow: "hidden", position: "relative" }}>
          {/* Main photo */}
          <div style={{ gridRow: "1 / 3", overflow: "hidden", cursor: "pointer", position: "relative" }} onClick={() => { setLightboxIdx(0); setLightboxOpen(true); }}>
            <img src={photos[0]} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
          </div>
          {/* 4 smaller photos */}
          <div className="side-photos" style={{ display: "contents" }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ overflow: "hidden", cursor: photos[i] ? "pointer" : "default", background: "#e0d5c8", position: "relative" }}
                onClick={() => photos[i] && (setLightboxIdx(i), setLightboxOpen(true))}>
                {photos[i] && <img src={photos[i]} alt={`${place.name} ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />}
              </div>
            ))}
          </div>
          {/* Show all photos button */}
          <button onClick={() => { setLightboxIdx(0); setLightboxOpen(true); }}
            style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(255,255,255,0.95)", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 6, backdropFilter: "blur(4px)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Show all {photos.length} photos
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 20px 100px" }}>
        <div className="ppp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 36, alignItems: "start" }}>

          {/* ── LEFT ── */}
          <div>
            {/* Title + meta */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: gold, background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "4px 12px" }}>
                  {typeLabel?.icon} {typeLabel?.label}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Stars rating={place.rating || 4.8} showNum />
                  <span style={{ fontSize: 12, color: "#9B7450" }}>· {place.reviewCount || reviews.length} reviews</span>
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 900, color: ink, margin: "0 0 6px", lineHeight: 1.1, letterSpacing: "-0.01em" }}>{place.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "#7A5535" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {place.location}
              </div>
            </div>

            {/* Quick facts strip */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid rgba(196,122,46,0.12)" }}>
              {[
                { icon: "👥", v: `${place.minGuests}–${place.maxGuests} guests` },
                { icon: "📐", v: place.area },
                place.checkIn  && { icon: "🕐", v: `Check-in ${place.checkIn}` },
                place.checkOut && { icon: "🕙", v: `Check-out ${place.checkOut}` },
                place.parking?.available && { icon: "🚗", v: `Parking (${place.parking.spots} spots)` },
              ].filter(Boolean).map(({ icon, v }) => (
                <div key={v} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#5a3a1a", background: "#fff", borderRadius: 100, padding: "7px 14px", border: "1.5px solid rgba(196,122,46,0.12)", fontWeight: 600 }}>
                  <span>{icon}</span> {v}
                </div>
              ))}
            </div>

            {/* ── What comes with this venue — USP ── */}
            <div style={{ background: `linear-gradient(135deg, ${ink}, #3D1C08)`, borderRadius: 20, padding: "22px 24px", marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: goldLt, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
                Not just a venue — a complete event
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
                Everything arranged. You just show up.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {Object.keys(place.packages || {}).map(svc => {
                  const cfg = SVC_CONFIG[svc] || { icon: "✓", color: gold, bg: "rgba(196,122,46,0.08)", desc: "" };
                  return (
                    <div key={svc} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{cfg.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{svc}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>{cfg.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* About */}
            <div style={{ background: "#fff", borderRadius: 18, padding: "20px 22px", border: "1.5px solid rgba(196,122,46,0.1)", marginBottom: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>About this place</h2>
              <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.75, margin: "0 0 16px" }}>{place.tagline}. A perfect setting for birthdays, anniversaries, corporate gatherings, and intimate celebrations across Delhi NCR.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {place.amenities?.map(a => (
                  <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#5a3a1a" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Property details */}
            {(place.checkIn || place.caretaker != null) && (
              <div style={{ background: "#fff", borderRadius: 18, padding: "20px 22px", border: "1.5px solid rgba(196,122,46,0.1)", marginBottom: 18 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 16px" }}>Property Details</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    place.bhk       && { icon: "🏠", label: "BHK",           v: place.bhk },
                    place.checkIn   && { icon: "🕐", label: "Check-in",       v: place.checkIn },
                    place.checkOut  && { icon: "🕙", label: "Check-out",       v: place.checkOut },
                    place.caretaker != null && { icon: "👷", label: "Caretaker",  v: place.caretaker    ? "Available"     : "Not available", pos: place.caretaker },
                    place.securityGuard != null && { icon: "🛡️", label: "Security", v: place.securityGuard ? "Available"  : "Not available", pos: place.securityGuard },
                    place.liftAvailable != null && { icon: "🛗", label: "Lift",     v: place.liftAvailable ? "Available"  : "Not available", pos: place.liftAvailable },
                    place.floorNumber != null && { icon: "📶", label: "Floor",     v: `${place.floorNumber}th Floor` },
                  ].filter(Boolean).map(({ icon, label, v, pos }) => (
                    <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 10.5, color: "#9B7450", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: pos === true ? "#16a34a" : pos === false ? "#dc2626" : ink, marginTop: 1 }}>{v}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Package Builder ── */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: ink, margin: 0 }}>Build your event</h2>
                <span style={{ fontSize: 12, color: selectedCount === 0 ? "#9B7450" : "#16a34a", fontWeight: 700, background: selectedCount === 0 ? "rgba(155,116,80,0.1)" : "rgba(22,163,74,0.1)", borderRadius: 100, padding: "4px 12px" }}>
                  {selectedCount === 0 ? "Select at least 1 package" : `${selectedCount} package${selectedCount > 1 ? "s" : ""} selected`}
                </span>
              </div>

              {Object.keys(place.packages || {})
                .filter(cat => !place.allowedServices || place.allowedServices.includes(cat))
                .map(cat => {
                  const cfg = SVC_CONFIG[cat] || { icon: "✓", color: gold, bg: "rgba(196,122,46,0.06)", desc: "" };
                  const isOpen = openCats[cat];
                  const selPkg = place.packages[cat]?.find(p => p.id === selectedPkgs[cat]);
                  return (
                    <div key={cat} style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${isOpen ? gold : "rgba(196,122,46,0.12)"}`, marginBottom: 10, overflow: "hidden", transition: "border-color 0.2s" }}>
                      <button onClick={() => toggleCat(cat)}
                        style={{ width: "100%", padding: "15px 18px", border: "none", background: "transparent", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: font, textAlign: "left" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>{cfg.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: ink }}>{cat}</div>
                          <div style={{ fontSize: 11.5, color: "#9B7450", marginTop: 1 }}>{cfg.desc}</div>
                        </div>
                        {selPkg && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d", background: "rgba(21,128,61,0.1)", borderRadius: 100, padding: "3px 10px", flexShrink: 0 }}>✓ {selPkg.name}</span>
                        )}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>

                      {isOpen && (
                        <div style={{ borderTop: "1px solid rgba(196,122,46,0.08)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                          {place.packages[cat].map(pkg => {
                            const sel = selectedPkgs[cat] === pkg.id;
                            return (
                              <button key={pkg.id} onClick={() => togglePkg(cat, pkg.id)}
                                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, border: `2px solid ${sel ? gold : "rgba(196,122,46,0.15)"}`, background: sel ? "rgba(196,122,46,0.06)" : cream, cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.15s" }}>
                                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2.5px solid ${sel ? gold : "rgba(196,122,46,0.3)"}`, background: sel ? gold : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                                  {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13.5, fontWeight: 800, color: ink, marginBottom: 5 }}>
                                    {pkg.name} — <span style={{ color: gold }}>{fmt(pkg.price)}</span>
                                  </div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                    {pkg.includes.map((item, i) => (
                                      <span key={i} style={{ fontSize: 11, color: "#7A5535", background: "rgba(196,122,46,0.07)", borderRadius: 100, padding: "2px 9px" }}>{item}</span>
                                    ))}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
              })}
            </div>

            {/* Rules */}
            <div style={{ background: "#fff", borderRadius: 18, padding: "20px 22px", border: "1.5px solid rgba(196,122,46,0.1)", marginBottom: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>Rules & Regulations</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {place.rules?.map((rule, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#5a3a1a" }}>
                    <span style={{ color: "#D97706", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>⚠</span> {rule}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: ink, margin: "0 0 6px" }}>Guest Reviews</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Stars rating={place.rating || 4.8} size={16} showNum />
                    <span style={{ fontSize: 13, color: "#9B7450" }}>· {reviews.length} reviews</span>
                  </div>
                </div>
                <button onClick={() => setShowReviewForm(v => !v)}
                  style={{ padding: "9px 18px", borderRadius: 10, border: `1.5px solid rgba(196,122,46,0.3)`, background: showReviewForm ? "rgba(196,122,46,0.08)" : "#fff", color: gold, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </button>
              </div>

              {showReviewForm && (
                <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.18)", padding: "22px 24px", marginBottom: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input placeholder="Your name" value={reviewForm.name} onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))}
                      style={{ padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: font, fontSize: 13, outline: "none", color: ink }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#6B3A1F", marginBottom: 6 }}>Rating</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[1,2,3,4,5].map(s => (
                          <button key={s} onClick={() => setReviewForm(p => ({ ...p, rating: s }))}
                            style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", color: s <= reviewForm.rating ? gold : "#ddd", padding: 0, lineHeight: 1 }}>★</button>
                        ))}
                      </div>
                    </div>
                    <textarea placeholder="Tell us about your experience..." value={reviewForm.text} onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))} rows={3}
                      style={{ padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: font, fontSize: 13, outline: "none", resize: "vertical", color: ink }} />
                    <button onClick={() => {
                      if (!reviewForm.name.trim() || !reviewForm.text.trim()) return;
                      const month = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
                      setReviews(prev => [{ name: reviewForm.name, rating: reviewForm.rating, date: month, text: reviewForm.text }, ...prev]);
                      setReviewForm({ name: "", rating: 5, text: "" }); setShowReviewForm(false);
                    }} style={{ alignSelf: "flex-start", padding: "10px 22px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                      Submit Review →
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
                {reviews.map((r, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.1)", padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: ink }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2 }}>{r.date}</div>
                      </div>
                      <Stars rating={r.rating} size={13} />
                    </div>
                    <p style={{ fontSize: 13, color: "#5a3a1a", lineHeight: 1.65, margin: 0 }}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT — Sticky Price Card ── */}
          <div className="ppp-sticky" style={{ position: "sticky", top: 80 }}>
            <div style={{ background: "#fff", borderRadius: 22, border: "1.5px solid rgba(196,122,46,0.18)", boxShadow: "0 8px 40px rgba(28,9,0,0.1)", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: `linear-gradient(135deg,${ink},#3D1C08)`, padding: "20px 22px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Price</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: goldLt }}>{fmt(grandTotal)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Room + charges + selected packages</div>
              </div>

              {/* Price breakdown */}
              <div style={{ padding: "16px 20px 0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5a3a1a" }}>
                    <span>Venue / Room</span><span style={{ fontWeight: 700 }}>{fmt(place.roomPrice)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5a3a1a" }}>
                    <span>Service charges</span><span style={{ fontWeight: 700 }}>{fmt(place.serviceCharge)}</span>
                  </div>
                  {Object.entries(selectedPkgs).map(([cat, pkgId]) => {
                    if (!pkgId) return null;
                    const pkg = place.packages[cat]?.find(p => p.id === pkgId);
                    if (!pkg) return null;
                    return (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5a3a1a" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span>{SVC_CONFIG[cat]?.icon}</span> {pkg.name}
                        </span>
                        <span style={{ fontWeight: 700 }}>{fmt(pkg.price)}</span>
                      </div>
                    );
                  })}
                  <div style={{ height: 1, background: "rgba(196,122,46,0.1)", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: ink, fontWeight: 900 }}>
                    <span>Total</span><span style={{ color: gold }}>{fmt(grandTotal)}</span>
                  </div>
                </div>

                {selectedCount === 0 && (
                  <div style={{ fontSize: 11.5, color: "#9B7450", background: "rgba(196,122,46,0.07)", borderRadius: 10, padding: "9px 12px", marginBottom: 14, textAlign: "center" }}>
                    ↑ Add at least 1 service package above
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 20 }}>
                  <button onClick={() => setShowBookForm(true)}
                    style={{ width: "100%", padding: "14px", borderRadius: 13, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    Book Now via WhatsApp
                  </button>
                  <button onClick={openChatWA}
                    style={{ width: "100%", padding: "12px", borderRadius: 13, border: "1.5px solid #25D366", background: "rgba(37,211,102,0.06)", color: "#16a34a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    💬 Chat — Ask questions or customise
                  </button>
                </div>
              </div>
            </div>

            {/* Trust chips */}
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {["Free cancellation (7 days)", "Instant response", "Verified space"].map(t => (
                <div key={t} style={{ fontSize: 11, color: "#5a3a1a", background: "#fff", border: "1.5px solid rgba(196,122,46,0.12)", borderRadius: 100, padding: "4px 11px", fontWeight: 600 }}>✓ {t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="ppp-mob-book" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1.5px solid rgba(196,122,46,0.12)", padding: "12px 20px", zIndex: 200, alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: "calc(12px + env(safe-area-inset-bottom,0px))" }}>
        <div>
          <div style={{ fontSize: 11, color: "#9B7450" }}>Total</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: gold }}>{fmt(grandTotal)}</div>
        </div>
        <button onClick={() => setShowBookForm(true)}
          style={{ flex: 1, padding: "13px", borderRadius: 13, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.3)" }}>
          Book Now
        </button>
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.94)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setLightboxOpen(false)}>
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + photos.length) % photos.length); }}
            style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <img src={photos[lightboxIdx]} alt={`Photo ${lightboxIdx + 1}`} onClick={e => e.stopPropagation()}
            style={{ maxHeight: "88vh", maxWidth: "90vw", objectFit: "contain", borderRadius: 12 }} />
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % photos.length); }}
            style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600 }}>{lightboxIdx + 1} / {photos.length}</div>
          <button onClick={() => setLightboxOpen(false)}
            style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      )}

      {/* ── Book Form Modal ── */}
      {showBookForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: cream, borderRadius: 22, padding: "24px 26px", maxWidth: 440, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", fontFamily: font }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: ink, margin: "0 0 2px" }}>Almost there!</h2>
                <p style={{ fontSize: 11.5, color: "#9B7450", margin: 0 }}>{place.name} · {fmt(grandTotal)} total</p>
              </div>
              <button onClick={() => setShowBookForm(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9B7450", lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={openBookWA} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Your Name *",      field: "name",     type: "text",   ph: "Full name" },
                { label: "Phone Number *",   field: "phone",    type: "tel",    ph: "+91 9XXXXXXXXX" },
                { label: "Event Date *",     field: "date",     type: "date",   ph: "" },
                { label: "No. of Guests *",  field: "guests",   type: "number", ph: `${place.minGuests}–${place.maxGuests}` },
                { label: "Occasion",         field: "occasion", type: "text",   ph: "e.g. Birthday, Anniversary" },
              ].map(({ label, field, type, ph }) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 }}>{label}</label>
                  <input type={type} required={label.includes("*")} value={bookForm[field]} placeholder={ph}
                    min={type === "date" ? today : type === "number" ? place.minGuests : undefined}
                    max={type === "number" ? place.maxGuests : undefined}
                    onChange={e => setBookForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: ink, outline: "none", boxSizing: "border-box", background: "#fff" }} />
                </div>
              ))}
              <button type="submit" style={{ width: "100%", marginTop: 4, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#25D366,#16a34a)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}>
                📲 Send Booking on WhatsApp →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

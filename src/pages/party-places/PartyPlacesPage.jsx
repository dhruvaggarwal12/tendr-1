import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PLACE_TYPES, OCCASION_TAGS, getPlacesByType, PARTY_PLACES } from "../../data/partyPlaces";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font  = "'Outfit', sans-serif";
const gold  = "#C47A2E";
const goldLt= "#CCAB4A";
const ink   = "#1C0900";
const cream = "#FFFCF5";
const bg    = "#F7F3ED";

const SAVED_KEY = "tendr_saved_places";
const getSaved  = () => { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; } };
const savePlaces= (ids) => localStorage.setItem(SAVED_KEY, JSON.stringify(ids));

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const SVC_ICONS = { Decoration: "🎀", Catering: "🍽️", Photography: "📸", DJ: "🎵" };

function Stars({ rating, size = 12 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill={gold} aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <span style={{ fontSize: size, fontWeight: 700, color: ink, lineHeight: 1 }}>{rating}</span>
    </span>
  );
}

export default function PartyPlacesPage() {
  const navigate = useNavigate();
  const [placeType,   setPlaceType]   = useState("all");
  const [occasion,    setOccasion]    = useState("all");
  const [search,      setSearch]      = useState({ date: "", guests: "", location: "" });
  const [savedIds,    setSavedIds]    = useState(() => getSaved());
  const [hoveredCard, setHoveredCard] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const places = useMemo(() => {
    let list = getPlacesByType(placeType);
    if (occasion !== "all") list = list.filter(p => p.occasionTags?.includes(occasion));
    if (search.guests) {
      const g = Number(search.guests);
      list = list.filter(p => g >= p.minGuests && g <= p.maxGuests);
    }
    if (search.location) {
      const q = search.location.toLowerCase();
      list = list.filter(p => p.location.toLowerCase().includes(q));
    }
    return list;
  }, [placeType, occasion, search]);

  const toggleSave = (e, id) => {
    e.stopPropagation();
    const next = savedIds.includes(id) ? savedIds.filter(x => x !== id) : [...savedIds, id];
    setSavedIds(next);
    savePlaces(next);
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: font }}>
      <SEO
        title="Party Places — Book a fully arranged venue | Tendr"
        description="Book villas, farmhouses, flats & terraces for your celebration — with decoration, catering, DJ & photography bundled."
        path="/party-places"
      />
      <HamburgerNav />

      <style>{`
        @keyframes fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .pp-card { animation: fadein 0.42s cubic-bezier(.22,1,.36,1) both; }
        .pp-card-photo img { transition: transform 0.5s cubic-bezier(.22,1,.36,1); }
        .pp-card:hover .pp-card-photo img { transform: scale(1.06); }
        @media(max-width:640px){
          .pp-grid{grid-template-columns:1fr!important}
          .pp-filters{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px}
          .pp-filters::-webkit-scrollbar{display:none}
        }
        @media(max-width:900px) and (min-width:641px){
          .pp-grid{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(160deg, ${ink} 0%, #3D1C08 55%, #5A2D0C 100%)`, padding: "52px 28px 56px", position: "relative", overflow: "hidden" }}>
        {/* Ambient circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(196,122,46,0.18) 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, rgba(204,171,74,0.12) 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: goldLt, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 14 }}>
            Tendr Party Places
          </div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, color: "#fff", margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Party places.<br />Fully arranged.
          </h1>
          <p style={{ fontSize: "clamp(13px,2vw,15px)", color: "rgba(255,255,255,0.62)", margin: "0 0 32px", lineHeight: 1.6, maxWidth: 520 }}>
            Villas, farmhouses, flats &amp; terraces — with decoration, catering, DJ and photography bundled in. Not just a venue. A complete party.
          </p>

          {/* Search bar */}
          <div style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.14)", borderRadius: 18, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }} className="pp-search-bar">
            <style>{`.pp-search-bar{@media(max-width:640px){grid-template-columns:1fr!important}}`}</style>
            {[
              { label: "Event Date",       field: "date",     type: "date",   ph: "" },
              { label: "Guests",           field: "guests",   type: "number", ph: "How many?" },
              { label: "Location / Area",  field: "location", type: "text",   ph: "Delhi, Noida…" },
            ].map(({ label, field, type, ph }) => (
              <div key={field}>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{label}</label>
                <input
                  type={type} value={search[field]} placeholder={ph}
                  min={type === "date" ? today : type === "number" ? 1 : undefined}
                  onChange={e => setSearch(p => ({ ...p, [field]: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: font, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <button
              onClick={() => {}}
              style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontFamily: font, fontSize: 13.5, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", boxShadow: `0 4px 16px rgba(196,122,46,0.4)` }}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Why Tendr USP strip ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 28px", display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: "🎀", text: "Decor arranged" },
            { icon: "🍽️", text: "Catering on-site" },
            { icon: "🎵", text: "DJ & sound" },
            { icon: "📸", text: "Photography" },
            { icon: "💬", text: "Book via WhatsApp" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#5a3a1a", fontWeight: 600, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 16 }}>{icon}</span> {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.08)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px" }}>
          {/* Place type pills */}
          <div className="pp-filters" style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {PLACE_TYPES.map(t => {
              const active = placeType === t.id;
              return (
                <button key={t.id} onClick={() => setPlaceType(t.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, border: `1.5px solid ${active ? gold : "rgba(196,122,46,0.2)"}`, background: active ? `rgba(196,122,46,0.1)` : "transparent", color: active ? gold : "#7A5535", fontFamily: font, fontSize: 12.5, fontWeight: active ? 800 : 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s", flexShrink: 0 }}>
                  <span>{t.icon}</span> {t.label}
                </button>
              );
            })}
          </div>
          {/* Occasion chips */}
          <div className="pp-filters" style={{ display: "flex", gap: 7 }}>
            {OCCASION_TAGS.map(o => {
              const active = occasion === o.id;
              return (
                <button key={o.id} onClick={() => setOccasion(o.id)}
                  style={{ padding: "5px 12px", borderRadius: 100, border: "none", background: active ? ink : "rgba(28,9,0,0.06)", color: active ? "#fff" : "#5a3a1a", fontFamily: font, fontSize: 11.5, fontWeight: active ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s", flexShrink: 0 }}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#7A5535", fontWeight: 600 }}>
            {places.length === 0 ? "No places found" : `${places.length} place${places.length > 1 ? "s" : ""} available`}
            {occasion !== "all" ? ` for ${OCCASION_TAGS.find(o => o.id === occasion)?.label}` : ""}
          </div>
          {(search.guests || search.location || placeType !== "all" || occasion !== "all") && (
            <button onClick={() => { setSearch({ date: "", guests: "", location: "" }); setPlaceType("all"); setOccasion("all"); }}
              style={{ fontSize: 12, color: gold, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: font, textDecoration: "underline" }}>
              Clear filters
            </button>
          )}
        </div>

        {places.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.1)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏡</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ink, marginBottom: 8 }}>No places found</div>
            <div style={{ fontSize: 13, color: "#9B7450" }}>Try adjusting your filters or clearing the guest count and location.</div>
          </div>
        ) : (
          <div className="pp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {places.map((place, idx) => {
              const basePrice = place.roomPrice + place.serviceCharge;
              const svcCount  = Object.keys(place.packages || {}).length;
              const isSaved   = savedIds.includes(place.id);
              const isHovered = hoveredCard === place.id;

              return (
                <div key={place.id} className="pp-card"
                  style={{ background: "#fff", borderRadius: 20, overflow: "hidden", cursor: "pointer", boxShadow: isHovered ? "0 14px 40px rgba(28,9,0,0.12)" : "0 2px 12px rgba(28,9,0,0.05)", transform: isHovered ? "translateY(-4px)" : "translateY(0)", transition: "all 0.25s cubic-bezier(.22,1,.36,1)", animationDelay: `${idx * 0.05}s`, border: "1.5px solid rgba(196,122,46,0.1)" }}
                  onClick={() => navigate(`/party-places/${place.id}`)}
                  onMouseEnter={() => setHoveredCard(place.id)}
                  onMouseLeave={() => setHoveredCard(null)}>

                  {/* Photo */}
                  <div className="pp-card-photo" style={{ position: "relative", height: 220, overflow: "hidden", background: "#e8ddd0" }}>
                    <img src={place.coverPhoto} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 45%, transparent 100%)" }} />

                    {/* Services badge */}
                    <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(28,9,0,0.7)", backdropFilter: "blur(6px)", color: "#fff", borderRadius: 100, padding: "4px 10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                      <span>🎉</span> {svcCount} services included
                    </div>

                    {/* Save heart */}
                    <button onClick={e => toggleSave(e, place.id)}
                      style={{ position: "absolute", top: 10, right: 10, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "transform 0.15s" }}
                      aria-label={isSaved ? "Remove from saved" : "Save place"}>
                      {isSaved ? "♥" : "♡"}
                    </button>

                    {/* Rating chip */}
                    <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(255,255,255,0.95)", borderRadius: 100, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                      <Stars rating={place.rating || 4.8} />
                      <span style={{ fontSize: 11, color: "#5a3a1a", fontWeight: 600 }}>({place.reviewCount || 0})</span>
                    </div>

                    {/* Type chip */}
                    <div style={{ position: "absolute", bottom: 12, left: 12, background: `rgba(196,122,46,0.88)`, color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 10.5, fontWeight: 700 }}>
                      {PLACE_TYPES.find(t => t.id === place.type)?.icon} {PLACE_TYPES.find(t => t.id === place.type)?.label}
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "14px 16px 16px" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: ink, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{place.name}</div>
                    <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {place.location}
                    </div>

                    {/* Service icons */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                      {Object.keys(place.packages || {}).map(svc => (
                        <span key={svc} style={{ fontSize: 11, color: "#5a3a1a", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "3px 9px", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                          {SVC_ICONS[svc]} {svc}
                        </span>
                      ))}
                    </div>

                    {/* Capacity + price row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11.5, color: "#7A5535", fontWeight: 600 }}>
                        👥 {place.minGuests}–{place.maxGuests} guests
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 11, color: "#9B7450" }}>from </span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: gold }}>{fmt(basePrice)}</span>
                      </div>
                    </div>

                    {/* Occasion tags */}
                    {place.occasionTags?.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(196,122,46,0.08)", display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {place.occasionTags.slice(0, 3).map(tag => (
                          <span key={tag} style={{ fontSize: 10.5, color: "#7A5535", background: "rgba(28,9,0,0.04)", borderRadius: 100, padding: "2px 8px", fontWeight: 600 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

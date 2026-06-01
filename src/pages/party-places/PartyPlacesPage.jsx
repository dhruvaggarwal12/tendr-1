import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PLACE_TYPES, getPlacesByType } from "../../data/partyPlaces";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function PartyPlacesPage() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [activeType, setActiveType] = useState("all");
  const [form, setForm] = useState({ date: "", guests: "", location: "", occasion: "" });

  if (!user?.isAdmin) { navigate("/"); return null; }

  const today = new Date().toISOString().split("T")[0];
  const places = getPlacesByType(activeType).filter(p => {
    if (form.guests && Number(form.guests) > p.maxGuests) return false;
    if (form.guests && Number(form.guests) < p.minGuests) return false;
    if (form.location && !p.location.toLowerCase().includes(form.location.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Book a Party Place — Tendr" description="Villas, farmhouses, flats and venues for your celebration" path="/party-places" noIndex />
      <HamburgerNav noSidebar />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "44px 24px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(204,171,74,0.15)", border: "1px solid rgba(204,171,74,0.3)", borderRadius: 100, padding: "4px 14px", marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin Preview</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Book a Party Place
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", margin: "0 auto", maxWidth: 500 }}>
          Villas, farmhouses, penthouses and banquet halls — with decoration, catering and entertainment included.
        </p>
      </div>

      {/* Place type filter */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", overflowX: "auto" }}>
        <div style={{ display: "flex", padding: "0 24px", maxWidth: 1200, margin: "0 auto" }}>
          {PLACE_TYPES.map(t => (
            <button key={t.id} onClick={() => setActiveType(t.id)}
              style={{ padding: "14px 20px", border: "none", borderBottom: activeType === t.id ? "2.5px solid #C47A2E" : "2.5px solid transparent", background: "transparent", fontSize: 13, fontWeight: activeType === t.id ? 700 : 500, color: activeType === t.id ? "#C47A2E" : "#9B7450", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 80px" }}>

        {/* Search/Filter form */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.15)", padding: "22px 24px", marginBottom: 32, boxShadow: "0 2px 12px rgba(196,122,46,0.07)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: "0 0 16px" }}>Find your perfect party place</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {[
              { label: "Event Date", field: "date", type: "date", placeholder: "" },
              { label: "Number of Guests", field: "guests", type: "number", placeholder: "e.g. 50" },
              { label: "Location / Area", field: "location", type: "text", placeholder: "e.g. Noida, Delhi" },
              { label: "Occasion Type", field: "occasion", type: "select", options: ["Birthday", "Anniversary", "Get-together", "Corporate", "Pre-wedding", "Baby Shower", "House Party", "Other"] },
            ].map(({ label, field, type, placeholder, options }) => (
              <div key={field}>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#6B3A1F", marginBottom: 5 }}>{label}</label>
                {type === "select" ? (
                  <select value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", background: "#fff", boxSizing: "border-box" }}>
                    <option value="">Select occasion</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={type} value={form[field]} placeholder={placeholder} min={type === "date" ? today : undefined}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "#9B7450" }}>
            Showing {places.length} place{places.length !== 1 ? "s" : ""}{form.guests ? ` for ${form.guests} guests` : ""}{form.location ? ` near "${form.location}"` : ""}
          </div>
        </div>

        {/* Place cards */}
        {places.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.1)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>No places found</div>
            <div style={{ fontSize: 13, color: "#9B7450" }}>Try adjusting your guest count or location filter.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 22 }}>
            {places.map(place => (
              <div key={place.id} style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden", boxShadow: "0 4px 20px rgba(139,69,19,0.07)", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(139,69,19,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,69,19,0.07)"; }}>
                {/* Photo */}
                <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                  <img src={place.coverPhoto} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
                  <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(196,122,46,0.9)", color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 10.5, fontWeight: 700 }}>
                    {PLACE_TYPES.find(t => t.id === place.type)?.icon} {PLACE_TYPES.find(t => t.id === place.type)?.label}
                  </div>
                  <div style={{ position: "absolute", bottom: 12, left: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{place.name}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)" }}>📍 {place.location}</div>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "16px 18px" }}>
                  <p style={{ fontSize: 12.5, color: "#7A5535", margin: "0 0 12px", lineHeight: 1.5 }}>{place.tagline}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#5a3a1a", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "3px 10px" }}>👥 {place.minGuests}–{place.maxGuests} guests</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#5a3a1a", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "3px 10px" }}>📐 {place.area}</span>
                  </div>
                  {/* Pricing */}
                  <div style={{ marginBottom: 14, padding: "10px 14px", background: "#FFFCF5", borderRadius: 10, border: "1px solid rgba(196,122,46,0.12)" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#C47A2E" }}>{fmt(place.roomPrice)}</div>
                    <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2 }}>
                      Room/venue price + {fmt(place.serviceCharge)} service charges
                    </div>
                    <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>* Package pricing added separately</div>
                  </div>
                  <button
                    onClick={() => window.open(`/party-places/${place.id}`, "_blank")}
                    style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 12px rgba(196,122,46,0.3)" }}>
                    View Profile ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

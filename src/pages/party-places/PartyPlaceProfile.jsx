import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPlaceById } from "../../data/partyPlaces";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const CAT_ICONS = { Decoration: "🎀", Catering: "🍽", Photography: "📸", DJ: "🎵" };
const CAT_DESC = {
  Decoration: "Choose a decor package — our team will set up and take down everything.",
  Catering: "All food prepared fresh on-site by our verified catering partners.",
  Photography: "Professional coverage — edited photos delivered within 48 hours.",
  DJ: "DJ + sound system included. We handle setup and takedown.",
};

export default function PartyPlaceProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const place = getPlaceById(id);

  const [activePhoto, setActivePhoto] = useState(0);
  const [openCats, setOpenCats] = useState({});
  const [selectedPkgs, setSelectedPkgs] = useState({});
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", email: "", date: "", guests: "", occasion: "" });
  const [showBookForm, setShowBookForm] = useState(false);
  const [booked, setBooked] = useState(false);

  if (!user?.isAdmin) { navigate("/"); return null; }
  if (!place) { navigate("/party-places"); return null; }

  const today = new Date().toISOString().split("T")[0];

  const toggleCat = (cat) => setOpenCats(p => ({ ...p, [cat]: !p[cat] }));
  const togglePkg = (cat, pkgId) => setSelectedPkgs(p => ({
    ...p,
    [cat]: p[cat] === pkgId ? null : pkgId,
  }));

  const selectedCount = Object.values(selectedPkgs).filter(Boolean).length;
  const totalPackagePrice = Object.entries(selectedPkgs).reduce((sum, [cat, pkgId]) => {
    if (!pkgId) return sum;
    const pkg = place.packages[cat]?.find(p => p.id === pkgId);
    return sum + (pkg?.price || 0);
  }, 0);
  const grandTotal = place.roomPrice + place.serviceCharge + totalPackagePrice;

  const handleBook = (e) => {
    e.preventDefault();
    setBooked(true);
    setShowBookForm(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title={`${place.name} — Tendr Party Places`} description={place.tagline} path={`/party-places/${id}`} noIndex />
      <HamburgerNav noSidebar />

      {/* Photo gallery */}
      <div style={{ position: "relative", height: "clamp(260px,40vw,420px)", background: "#2C1A0E", overflow: "hidden" }}>
        <img src={place.photos[activePhoto]} alt={place.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)" }} />
        {/* Nav arrows */}
        <button onClick={() => setActivePhoto(i => (i - 1 + place.photos.length) % place.photos.length)}
          style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        <button onClick={() => setActivePhoto(i => (i + 1) % place.photos.length)}
          style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        {/* Thumbnails */}
        <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {place.photos.map((_, i) => (
            <button key={i} onClick={() => setActivePhoto(i)}
              style={{ width: i === activePhoto ? 24 : 8, height: 8, borderRadius: 100, border: "none", background: i === activePhoto ? "#CCAB4A" : "rgba(255,255,255,0.5)", cursor: "pointer", padding: 0, transition: "all 0.2s" }} />
          ))}
        </div>
        {/* Name overlay */}
        <div style={{ position: "absolute", bottom: 32, left: 24 }}>
          <div style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "#fff", marginBottom: 4 }}>{place.name}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>📍 {place.location} · {place.area}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }} className="party-profile-grid">

          {/* Left: Info */}
          <div>
            {/* Quick stats */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              {[
                { icon: "👥", label: `${place.minGuests}–${place.maxGuests} guests` },
                { icon: "📐", label: place.area },
                ...place.amenities.slice(0, 3).map(a => ({ icon: "✓", label: a })),
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5a3a1a", background: "#fff", borderRadius: 100, padding: "6px 14px", border: "1.5px solid rgba(196,122,46,0.12)" }}>
                  <span style={{ fontSize: 14 }}>{icon}</span> {label}
                </div>
              ))}
            </div>

            {/* About */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1.5px solid rgba(196,122,46,0.1)", marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>About this place</h3>
              <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 14px" }}>{place.tagline}. A perfect setting for birthdays, anniversaries, corporate events, pre-wedding functions, and intimate gatherings in the Delhi NCR region.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {place.amenities.map(a => (
                  <div key={a} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#5a3a1a" }}>
                    <span style={{ color: "#C47A2E", fontWeight: 700 }}>✓</span> {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1.5px solid rgba(196,122,46,0.1)", marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Rules & Regulations</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {place.rules.map((rule, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#5a3a1a" }}>
                    <span style={{ color: "#C47A2E", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>⚠</span> {rule}
                  </div>
                ))}
              </div>
            </div>

            {/* Package dropdowns — select at least 1 */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#2C1A0E", margin: 0 }}>Choose Your Packages</h3>
                <span style={{ fontSize: 12, color: selectedCount === 0 ? "#ef4444" : "#15803d", fontWeight: 700 }}>
                  {selectedCount === 0 ? "Select at least 1 package" : `${selectedCount} package${selectedCount > 1 ? "s" : ""} selected`}
                </span>
              </div>

              {Object.keys(place.packages).map(cat => (
                <div key={cat} style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${openCats[cat] ? "#C47A2E" : "rgba(196,122,46,0.12)"}`, marginBottom: 10, overflow: "hidden", transition: "border-color 0.2s" }}>
                  {/* Category header */}
                  <button onClick={() => toggleCat(cat)}
                    style={{ width: "100%", padding: "15px 18px", border: "none", background: "transparent", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: font, textAlign: "left" }}>
                    <span style={{ fontSize: 22 }}>{CAT_ICONS[cat]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E" }}>{cat}</div>
                      <div style={{ fontSize: 11.5, color: "#9B7450" }}>{CAT_DESC[cat]}</div>
                    </div>
                    {selectedPkgs[cat] && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d", background: "rgba(21,128,61,0.1)", borderRadius: 100, padding: "2px 9px", flexShrink: 0 }}>
                        ✓ {place.packages[cat].find(p => p.id === selectedPkgs[cat])?.name}
                      </span>
                    )}
                    <span style={{ fontSize: 16, color: "#C47A2E", transform: openCats[cat] ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>⌄</span>
                  </button>

                  {/* Options */}
                  {openCats[cat] && (
                    <div style={{ borderTop: "1px solid rgba(196,122,46,0.08)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {place.packages[cat].map(pkg => {
                        const sel = selectedPkgs[cat] === pkg.id;
                        return (
                          <button key={pkg.id} onClick={() => togglePkg(cat, pkg.id)}
                            style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.15)"}`, background: sel ? "rgba(196,122,46,0.06)" : "#FFFCF5", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.15s" }}>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: sel ? "#C47A2E" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                              {sel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>
                                {pkg.name} — <span style={{ color: "#C47A2E" }}>{fmt(pkg.price)}</span>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                {pkg.includes.map((item, i) => (
                                  <span key={i} style={{ fontSize: 11, color: "#7A5535", background: "rgba(196,122,46,0.07)", borderRadius: 100, padding: "2px 8px" }}>{item}</span>
                                ))}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Pricing + Book */}
          <div style={{ position: "sticky", top: 80 }}>
            <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.2)", boxShadow: "0 8px 32px rgba(139,69,19,0.1)", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "18px 22px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Price</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#CCAB4A" }}>{fmt(grandTotal)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Room + service charges + selected packages</div>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5a3a1a" }}>
                    <span>Room / Venue price</span><span style={{ fontWeight: 700 }}>{fmt(place.roomPrice)}</span>
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
                        <span>{CAT_ICONS[cat]} {pkg.name}</span><span style={{ fontWeight: 700 }}>{fmt(pkg.price)}</span>
                      </div>
                    );
                  })}
                  <div style={{ height: 1, background: "rgba(196,122,46,0.1)", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#2C1A0E", fontWeight: 800 }}>
                    <span>Total</span><span style={{ color: "#C47A2E" }}>{fmt(grandTotal)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { if (selectedCount === 0) { alert("Please select at least 1 package to continue."); return; } setShowBookForm(true); }}
                    style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: selectedCount > 0 ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: selectedCount > 0 ? "#fff" : "#9ca3af", fontSize: 14, fontWeight: 800, cursor: selectedCount > 0 ? "pointer" : "not-allowed", fontFamily: font, boxShadow: selectedCount > 0 ? "0 4px 14px rgba(196,122,46,0.3)" : "none" }}>
                    Book Now →
                  </button>
                  <button
                    style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    Save ♡
                  </button>
                </div>
                {selectedCount === 0 && <p style={{ fontSize: 11, color: "#ef4444", textAlign: "center", margin: "8px 0 0" }}>Select at least 1 package to book</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking form modal */}
      {showBookForm && !booked && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#FFFCF5", borderRadius: 22, padding: "28px 28px", maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", fontFamily: font }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 3px" }}>Complete Booking</h2>
                <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>{place.name} — {fmt(grandTotal)}</p>
              </div>
              <button onClick={() => setShowBookForm(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9B7450", padding: 0 }}>✕</button>
            </div>
            <form onSubmit={handleBook} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Full Name *", field: "name", type: "text", placeholder: "Your full name" },
                { label: "Phone Number *", field: "phone", type: "tel", placeholder: "+91 9XXXXXXXXX" },
                { label: "Email", field: "email", type: "email", placeholder: "your@email.com" },
                { label: "Event Date *", field: "date", type: "date", placeholder: "" },
                { label: "Number of Guests *", field: "guests", type: "number", placeholder: `${place.minGuests}–${place.maxGuests}` },
                { label: "Occasion", field: "occasion", type: "text", placeholder: "e.g. Birthday, Anniversary" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 5 }}>{label}</label>
                  <input type={type} required={label.includes("*")} value={bookingForm[field]} placeholder={placeholder}
                    min={type === "date" ? today : type === "number" ? place.minGuests : undefined}
                    max={type === "number" ? place.maxGuests : undefined}
                    onChange={e => setBookingForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ padding: "12px 14px", background: "rgba(196,122,46,0.06)", borderRadius: 10, fontSize: 12, color: "#7A5535" }}>
                <strong>Summary:</strong> {place.name} · {fmt(grandTotal)} · {selectedCount} package{selectedCount > 1 ? "s" : ""}
              </div>
              <button type="submit" style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.35)" }}>
                Confirm Booking →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking confirmed */}
      {booked && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#FFFCF5", borderRadius: 22, padding: "40px 32px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", fontFamily: font }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#15803d,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(21,128,61,0.3)" }}>✓</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px" }}>Booking Confirmed!</h2>
            <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 6px" }}>{place.name}</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#C47A2E", margin: "0 0 20px" }}>{fmt(grandTotal)}</p>
            <p style={{ fontSize: 13, color: "#7A5535", margin: "0 0 24px", lineHeight: 1.6 }}>Our team will contact you within 2 hours to confirm details and next steps.</p>
            <button onClick={() => { setBooked(false); window.close(); }}
              style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .party-profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

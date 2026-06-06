import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPlaceById } from "../../data/partyPlaces";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const CAT_ICONS = { Decoration: "🎀", Catering: "🍽", Photography: "📸", DJ: "🎵" }

const DetailRow = ({ icon, label, value, positive }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.3 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 10.5, color: "#9B7450", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: positive === false ? "#dc2626" : positive === true ? "#16a34a" : "#2C1A0E", marginTop: 1 }}>{value}</div>
    </div>
  </div>
);;
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
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookForm, setBookForm] = useState({ name: "", phone: "", date: "", guests: "", occasion: "" });
  const [reviews, setReviews] = useState([
    { name: "Priya Sharma", rating: 5, date: "March 2025", text: "Absolutely stunning venue! The decoration team was professional and the catering was top-notch. Our anniversary party was a huge hit. Highly recommend Tendr for hassle-free party planning." },
    { name: "Rohan Mehta", rating: 5, date: "February 2025", text: "Booked the villa for my birthday and it was beyond expectations. Beautiful setup, great food, and everything was handled by the team. Will definitely book again!" },
    { name: "Simran Kaur", rating: 4, date: "January 2025", text: "Great experience overall. The place looked amazing with the decor package. Only minor issue was the parking — but the team sorted it quickly. Would recommend." },
  ]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, text: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const reviewsRef = useRef(null);

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

  const TENDR_WA = "919211668427";

  const pkgSummaryLines = () =>
    Object.entries(selectedPkgs)
      .filter(([, v]) => v)
      .map(([cat, pkgId]) => {
        const pkg = place.packages[cat]?.find(p => p.id === pkgId);
        return pkg ? `  • ${cat}: ${pkg.name} — ${fmt(pkg.price)}` : null;
      })
      .filter(Boolean);

  const openBookWhatsApp = (e) => {
    e.preventDefault();
    const lines = pkgSummaryLines();
    const msg = [
      `🎉 Party Place Booking Request`,
      ``,
      `📍 Place: ${place.name}`,
      `🗺 Location: ${place.location}`,
      ``,
      `👤 Name: ${bookForm.name}`,
      `📞 Phone: ${bookForm.phone}`,
      `📅 Date: ${bookForm.date}`,
      `👥 Guests: ${bookForm.guests}`,
      `🎊 Occasion: ${bookForm.occasion || "Not specified"}`,
      ``,
      `💰 Pricing:`,
      `  Room/Venue: ${fmt(place.roomPrice)}`,
      `  Service Charges: ${fmt(place.serviceCharge)}`,
      lines.length ? lines.join("\n") : `  Packages: None selected`,
      `  ─────────────`,
      `  Total: ${fmt(grandTotal)}`,
      ``,
      `Please confirm my booking. Thank you!`,
    ].join("\n");
    window.open(`https://wa.me/${TENDR_WA}?text=${encodeURIComponent(msg)}`, "_blank");
    setShowBookForm(false);
  };

  const openChatWhatsApp = () => {
    const lines = pkgSummaryLines();
    const msg = [
      `Hi Tendr! I'm interested in ${place.name} and have some questions.`,
      ``,
      `📍 Place: ${place.name}`,
      `🗺 Location: ${place.location}`,
      lines.length ? `\nPackages I'm considering:\n${lines.join("\n")}` : ``,
      ``,
      `💰 Estimated total: ${fmt(grandTotal)}`,
      ``,
      `Could we discuss the details?`,
    ].filter(x => x !== undefined).join("\n");
    window.open(`https://wa.me/${TENDR_WA}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title={`${place.name} — Tendr Party Places`} description={place.tagline} path={`/party-places/${id}`} noIndex />
      <HamburgerNav />

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

            {/* Property Details — villa and flat only */}
            {(place.type === "villa" || place.type === "flat") && place.checkIn && (
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1.5px solid rgba(196,122,46,0.1)", marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>Property Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <DetailRow icon="🚗" label="Parking"
                    value={place.parking?.available
                      ? `Available${place.parking.spots ? ` · ${place.parking.spots} spots` : ""}`
                      : "Not available"}
                    positive={place.parking?.available} />
                  {place.bhk && <DetailRow icon="🏠" label="BHK" value={place.bhk} />}
                  <DetailRow icon="🕐" label="Check-in" value={place.checkIn} />
                  <DetailRow icon="🕙" label="Check-out" value={place.checkOut} />
                  <DetailRow icon="👷" label="Caretaker"
                    value={place.caretaker ? "Available" : "Not available"}
                    positive={place.caretaker} />
                  <DetailRow icon="🛡️" label="Security Guard"
                    value={place.securityGuard ? "Available" : "Not available"}
                    positive={place.securityGuard} />
                  {place.type === "flat" && place.bhkType && (
                    <DetailRow icon="🏢" label="BHK Type" value={place.bhkType} />
                  )}
                  {place.type === "flat" && place.floorNumber != null && (
                    <DetailRow icon="📶" label="Floor" value={`${place.floorNumber}th Floor`} />
                  )}
                  {place.type === "flat" && place.liftAvailable != null && (
                    <DetailRow icon="🛗" label="Lift"
                      value={place.liftAvailable ? "Available" : "Not available"}
                      positive={place.liftAvailable} />
                  )}
                </div>

                {/* Allowed services chips */}
                {place.allowedServices?.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(196,122,46,0.08)" }}>
                    <div style={{ fontSize: 10.5, color: "#9B7450", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Services Available Here</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {place.allowedServices.map(svc => (
                        <span key={svc} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#5a3a1a", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "4px 12px", border: "1px solid rgba(196,122,46,0.15)" }}>
                          {CAT_ICONS[svc]} {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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

              {Object.keys(place.packages)
                .filter(cat => !place.allowedServices || place.allowedServices.includes(cat))
                .map(cat => (
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
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => setShowBookForm(true)}
                    style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    💬 Book Now on WhatsApp
                  </button>
                  <button
                    onClick={openChatWhatsApp}
                    style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid #25D366", background: "rgba(37,211,102,0.06)", color: "#16a34a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    💬 Chat for Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Now — collect quick details then open WhatsApp */}
      {showBookForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "24px 26px", maxWidth: 440, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", fontFamily: font }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#2C1A0E", margin: "0 0 2px" }}>Quick Details</h2>
                <p style={{ fontSize: 11.5, color: "#9B7450", margin: 0 }}>{place.name} · Total: {fmt(grandTotal)}</p>
              </div>
              <button onClick={() => setShowBookForm(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9B7450", padding: 0, lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={openBookWhatsApp} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Your Name *", field: "name", type: "text", placeholder: "Full name" },
                { label: "Phone Number *", field: "phone", type: "tel", placeholder: "+91 9XXXXXXXXX" },
                { label: "Event Date *", field: "date", type: "date" },
                { label: "No. of Guests *", field: "guests", type: "number", placeholder: `${place.minGuests}–${place.maxGuests}` },
                { label: "Occasion", field: "occasion", type: "text", placeholder: "e.g. Birthday, Anniversary" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#6B3A1F", marginBottom: 4 }}>{label}</label>
                  <input type={type} required={label.includes("*")} value={bookForm[field]} placeholder={placeholder}
                    min={type === "date" ? today : type === "number" ? place.minGuests : undefined}
                    max={type === "number" ? place.maxGuests : undefined}
                    onChange={e => setBookForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <button type="submit" style={{ width: "100%", marginTop: 4, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#25D366,#16a34a)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(37,211,102,0.35)" }}>
                📲 Send Booking on WhatsApp →
              </button>
            </form>
          </div>
        </div>
      )}


      {/* ── Public Reviews ── */}
      <div ref={reviewsRef} style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ borderTop: "1px solid rgba(196,122,46,0.12)", paddingTop: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: "0 0 4px" }}>Guest Reviews</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 16, color: "#C47A2E" }}>★</span>)}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>5.0</span>
                <span style={{ fontSize: 13, color: "#9B7450" }}>· {reviews.length} reviews</span>
              </div>
            </div>
            <button onClick={() => setShowReviewForm(v => !v)}
              style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: showReviewForm ? "rgba(196,122,46,0.08)" : "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              {showReviewForm ? "Cancel" : "✏ Write a Review"}
            </button>
          </div>

          {/* Review form */}
          {showReviewForm && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.18)", padding: "22px 24px", marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: "0 0 16px" }}>Share your experience</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input placeholder="Your name" value={reviewForm.name}
                  onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))}
                  style={{ padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: font, fontSize: 13, outline: "none" }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 6 }}>Rating</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReviewForm(p => ({ ...p, rating: s }))}
                        style={{ fontSize: 22, background: "none", border: "none", cursor: "pointer", color: s <= reviewForm.rating ? "#C47A2E" : "#ddd", padding: 0, lineHeight: 1 }}>★</button>
                    ))}
                  </div>
                </div>
                <textarea placeholder="Tell us about your experience..." value={reviewForm.text}
                  onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))}
                  rows={3}
                  style={{ padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: font, fontSize: 13, outline: "none", resize: "vertical" }} />
                <button
                  onClick={() => {
                    if (!reviewForm.name.trim() || !reviewForm.text.trim()) return;
                    const now = new Date();
                    const month = now.toLocaleString("en-IN", { month: "long", year: "numeric" });
                    setReviews(prev => [{ name: reviewForm.name, rating: reviewForm.rating, date: month, text: reviewForm.text }, ...prev]);
                    setReviewForm({ name: "", rating: 5, text: "" });
                    setShowReviewForm(false);
                  }}
                  style={{ alignSelf: "flex-start", padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Submit Review →
                </button>
              </div>
            </div>
          )}

          {/* Review cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.1)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(139,69,19,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2 }}>{r.date}</div>
                  </div>
                  <div style={{ display: "flex", gap: 1 }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ fontSize: 13, color: s <= r.rating ? "#C47A2E" : "#e5e7eb" }}>★</span>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#5a3a1a", lineHeight: 1.6, margin: 0 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .party-profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

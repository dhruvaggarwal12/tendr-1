import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setMultipleFormData, setBookingType } from "../../redux/eventPlanningSlice";
import { addVendorToCompare, removeVendorFromCompare } from "../../redux/listingFiltersSlice";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import SelectedVendorsFloat from "../../components/SelectedVendorsFloat";
import HamburgerNav from "../../components/HamburgerNav";
import SEO, { categoryTitle, categoryDescription } from "../../components/SEO";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const CATEGORY_MAP = {
  Photographer: { label: "Photography Vendors", color: "#C47A2E" },
  Caterer: { label: "Catering Vendors", color: "#C47A2E" },
  DJ: { label: "DJ & Music Vendors", color: "#C47A2E" },
  Decorator: { label: "Decoration Vendors", color: "#C47A2E" },
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80";

// ── Quick Event Form Modal ───────────────────────────────────────────────────
function QuickEventForm({ vendor, onClose, onSubmit }) {
  const [form, setForm] = useState({
    eventName: "", eventType: "", guests: "",
    budget: "", location: "", date: "", additionalInfo: "",
  });
  const [errors, setErrors] = useState({});

  const change = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.eventName.trim()) e.eventName = "Required";
    if (!form.eventType) e.eventType = "Required";
    if (!form.guests) e.guests = "Required";
    if (!form.budget) e.budget = "Required";
    if (!form.location) e.location = "Required";
    if (!form.date) e.date = "Required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  const inputCls = (field) => ({
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14,
    fontFamily: font, color: "#2C1A0E", background: "#fff", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.18s",
    border: `1.5px solid ${errors[field] ? "#c0392b" : "rgba(196,122,46,0.3)"}`,
  });

  const labelCls = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#6B3A1F", marginBottom: 5, fontFamily: font };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "28px 28px", maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto", fontFamily: font, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Your Event Details</h2>
            <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Tell us about your event to view {vendor?.name}'s profile</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#f3f4f6", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#555", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelCls}>Event Name *</label>
            <input name="eventName" placeholder="e.g. Priya's Birthday" value={form.eventName} onChange={change} style={inputCls("eventName")} />
            {errors.eventName && <p style={{ fontSize: 11, color: "#c0392b", margin: "3px 0 0" }}>{errors.eventName}</p>}
          </div>

          <div>
            <label style={labelCls}>Event Type *</label>
            <select name="eventType" value={form.eventType} onChange={change} style={inputCls("eventType")}>
              <option value="">Select</option>
              {["Get-together","Birthday","Office Party","Concert","Anniversary","Pre Wedding","Rituals","Festival","Others"].map(t => <option key={t}>{t}</option>)}
            </select>
            {errors.eventType && <p style={{ fontSize: 11, color: "#c0392b", margin: "3px 0 0" }}>{errors.eventType}</p>}
          </div>

          <div>
            <label style={labelCls}>Guests *</label>
            <input name="guests" type="number" placeholder="e.g. 100" value={form.guests} onChange={change} style={inputCls("guests")} />
            {errors.guests && <p style={{ fontSize: 11, color: "#c0392b", margin: "3px 0 0" }}>{errors.guests}</p>}
          </div>

          <div>
            <label style={labelCls}>Budget *</label>
            <select name="budget" value={form.budget} onChange={change} style={inputCls("budget")}>
              <option value="">Select</option>
              {["Under ₹1,000","₹1,000 - ₹5,000","₹5,000 - ₹10,000","₹10,000 - ₹25,000","₹25,000 - ₹50,000","Over ₹50,000"].map(b => <option key={b}>{b}</option>)}
            </select>
            {errors.budget && <p style={{ fontSize: 11, color: "#c0392b", margin: "3px 0 0" }}>{errors.budget}</p>}
          </div>

          <div>
            <label style={labelCls}>Location *</label>
            <select name="location" value={form.location} onChange={change} style={inputCls("location")}>
              <option value="">Select</option>
              {["Delhi","Noida","Greater Noida","Ghaziabad"].map(l => <option key={l}>{l}</option>)}
            </select>
            {errors.location && <p style={{ fontSize: 11, color: "#c0392b", margin: "3px 0 0" }}>{errors.location}</p>}
          </div>

          <div>
            <label style={labelCls}>Event Date *</label>
            <input name="date" type="date" value={form.date} onChange={change} style={inputCls("date")} min={new Date().toISOString().split("T")[0]} />
            {errors.date && <p style={{ fontSize: 11, color: "#c0392b", margin: "3px 0 0" }}>{errors.date}</p>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelCls}>Additional Requirements</label>
            <textarea name="additionalInfo" rows={2} placeholder="e.g. outdoor setup, microphone, projector..." value={form.additionalInfo} onChange={change}
              style={{ ...inputCls("additionalInfo"), resize: "vertical" }} />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid rgba(139,69,19,0.2)", background: "#fff", color: "#6B3A1F", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit"
              style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
              View Profile →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TopRatedVendors() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { category } = useParams();
  const compareSelected = useSelector((s) => s.listingFilters.compareSelected);
  const token = useSelector((s) => s.auth.token);

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const info = CATEGORY_MAP[category] || { label: `${category} Vendors`, color: "#C47A2E" };

  const loadVendors = () => {
    setLoading(true);
    setFetchError(false);
    fetch(`${BASE_URL}/vendors?serviceTypes=${category}&sortBy=rankingScore&limit=20`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setVendors(d.vendors || []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadVendors();
  }, [category]);

  const handleViewProfile = (vendor) => setSelectedVendor(vendor);

  const handleFormSubmit = (formData) => {
    dispatch(setMultipleFormData(formData));
    dispatch(setBookingType("you-do-it"));
    setSelectedVendor(null);
    navigate(`/vendor/${selectedVendor._id}`);
  };

  const toggleCompare = (vendor) => {
    const exists = compareSelected.find((v) => v._id === vendor._id);
    if (exists) dispatch(removeVendorFromCompare(vendor._id));
    else dispatch(addVendorToCompare(vendor));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <BasicSpeedDial />
      <SelectedVendorsFloat />

      {/* Main Navbar */}
      <SEO
        title={categoryTitle(category)}
        description={categoryDescription(category)}
        path={`/top-rated/${category || ""}`}
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Browse Vendors", path: "/listings" }, { name: category || "Vendors", path: `/top-rated/${category || ""}` }]}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": categoryTitle(category),
          "description": categoryDescription(category),
          "url": `https://tendr.co.in/top-rated/${category || ""}`,
          "provider": { "@type": "Organization", "name": "Tendr", "url": "https://tendr.co.in" },
          "about": vendors.length > 0 ? {
            "@type": "ItemList",
            "name": `Top Rated ${category || "Event Vendors"} in Delhi NCR`,
            "numberOfItems": vendors.length,
            "itemListElement": vendors.slice(0, 10).map((v, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "name": v.name,
              "url": `https://tendr.co.in/vendor/${v._id}`,
              "item": {
                "@type": "LocalBusiness",
                "name": v.name,
                "description": v.bio || `${v.serviceType || category} in ${v.city || "Delhi NCR"}`,
                "image": v.image || v.portfolioPhotos?.[0],
                "aggregateRating": v.avgReviewScore ? {
                  "@type": "AggregateRating",
                  "ratingValue": v.avgReviewScore.toFixed(1),
                  "bestRating": "5",
                  "worstRating": "1",
                  "ratingCount": v.reviewCount || 1,
                } : undefined,
              },
            })),
          } : undefined,
        }}
      />
      <HamburgerNav />
      {/* Category filter bar */}
      <div style={{ background: "rgba(255,252,245,0.97)", borderBottom: "1px solid rgba(139,69,19,0.1)", padding: "0 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 52, display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => navigate("/")} style={{ fontSize: 13, fontWeight: 600, color: "#6B3A1F", background: "rgba(139,69,19,0.06)", border: "1px solid rgba(139,69,19,0.18)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: font }}>
            ← Home
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.keys(CATEGORY_MAP).map((cat) => (
              <button key={cat} onClick={() => navigate(`/top-rated/${cat}`)}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: font, transition: "all 0.18s",
                  borderColor: cat === category ? "#C47A2E" : "rgba(139,69,19,0.2)",
                  background: cat === category ? "#C47A2E" : "transparent",
                  color: cat === category ? "#fff" : "#6B3A1F",
                }}>
                {CATEGORY_MAP[cat].label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>{/* end category bar */}

      {/* Header */}
      <div style={{ background: "linear-gradient(160deg, #FFF8F2, #F5E6CC)", padding: "52px 32px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Top Rated</p>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>{info.label}</h1>
        <p style={{ fontSize: 15, color: "#9B7450", margin: 0 }}>Verified, top-rated vendors ready for your event</p>
        <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "16px auto 0" }} />
      </div>

      {/* Vendor grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 80px", position: "relative" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: "#FFFCF5", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.08)", overflow: "hidden" }}>
                <div style={{ height: 200, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ height: 16, borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", width: "65%" }} />
                  <div style={{ height: 12, borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", width: "45%" }} />
                  <div style={{ height: 34, borderRadius: 10, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", marginTop: 4 }} />
                </div>
              </div>
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : fetchError ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
            <p style={{ color: "#9B7450", fontSize: 16, marginBottom: 18 }}>Couldn't load vendors. Please try again.</p>
            <button onClick={loadVendors} style={{ padding: "10px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Try Again</button>
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
            <p style={{ color: "#9B7450", fontSize: 16 }}>No vendors found for this category yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {vendors.map((vendor) => {
              const isInCompare = compareSelected.some((v) => v._id === vendor._id);
              return (
                <div key={vendor._id}
                  style={{ background: "#FFFCF5", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.12)", boxShadow: "0 4px 20px rgba(139,69,19,0.07)", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(139,69,19,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,69,19,0.07)"; }}
                >
                  {/* Image */}
                  <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                    <img src={vendor.image || vendor.portfolioPhotos?.[0] || FALLBACK_IMG} alt={`${vendor.serviceType || "Event Vendor"} ${vendor.name} in ${vendor.city || "Delhi NCR"} | Tendr`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(196,122,46,0.9)", color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                      ⭐ {vendor.avgReviewScore?.toFixed(1) || "4.9"}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>{vendor.name}</h3>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "rgba(196,122,46,0.1)", color: "#C47A2E" }}>{vendor.serviceType}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9B7450", marginBottom: 14 }}>
                      {vendor.city && <span>📍 {vendor.city}</span>}
                      {vendor.yearsOfExperience > 0 && <span>⏱ {vendor.yearsOfExperience}y exp</span>}
                      {vendor.teamSize > 0 && <span>👥 Team {vendor.teamSize}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleViewProfile(vendor)}
                        style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
                        Quick View
                      </button>
                      <button onClick={() => toggleCompare(vendor)}
                        style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${isInCompare ? "#C47A2E" : "rgba(139,69,19,0.2)"}`, background: isInCompare ? "rgba(196,122,46,0.1)" : "#fff", color: isInCompare ? "#C47A2E" : "#6B3A1F", fontSize: 12, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
                        title={isInCompare ? "Saved" : "Save vendor"}>
                        {isInCompare ? "♥ Saved" : "♡ Save"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Quick Event Form modal */}
      {selectedVendor && (
        <QuickEventForm vendor={selectedVendor} onClose={() => setSelectedVendor(null)} onSubmit={handleFormSubmit} />
      )}
    </div>
  );
}

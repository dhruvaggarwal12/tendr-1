import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatOverlay } from "../context/ChatContext";

const font = "'Outfit', sans-serif";
const FALLBACK = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&q=80";

const fmtINR = (p) => p == null || p === "" ? null : `₹${Number(p).toLocaleString("en-IN")}`;
const join   = (v, sep = ", ") => Array.isArray(v) && v.length ? v.join(sep) : null;
const getName  = (v) => v?.name ?? v?.businessName ?? "Vendor";
const getPrice = (v) => fmtINR(v?.startingPrice ?? v?.minPrice ?? v?.price ?? null);
const getRating = (v) => v?.rating ?? v?.avgRating ?? v?.avgReviewScore ?? null;
const getReviews = (v) => v?.reviewCount ?? v?.number_of_reviews ?? v?.totalReviews ?? (Array.isArray(v?.clientReferences) ? v.clientReferences.length : null);
const getLocation = (v) => {
  if (v?.location) return v.location;
  if (Array.isArray(v?.locations) && v.locations.length) return join(v.locations);
  const { city, state } = v?.address || {};
  return [city, state].filter(Boolean).join(", ") || null;
};
const getExperience = (v) => v?.yearsOfExperience ?? null;
const getTeam  = (v) => v?.teamSize ?? null;
const getEvents = (v) => v?.totalEventsCompleted ?? null;
const getServices = (v) => {
  const s = v?.services ?? v?.serviceCategories;
  if (Array.isArray(s) && s.length) return join(s);
  return v?.serviceType ?? null;
};
const getVerified = (v) => !!(v?.isVerified ?? v?.phoneVerified);
const getPhoto = (v) => v?.image || v?.portfolioPhotos?.[0] || null;
const getResponse = (v) => v?.responseTime ?? v?.avgResponseTime ?? null;

const STAT_ROWS = [
  { label: "Location",         fn: getLocation },
  { label: "Starting Price",   fn: getPrice },
  { label: "Experience",       fn: (v) => getExperience(v) != null ? `${getExperience(v)} yrs` : null },
  { label: "Events Done",      fn: (v) => getEvents(v) != null ? `${getEvents(v)}+` : null },
  { label: "Team Size",        fn: (v) => getTeam(v) != null ? `${getTeam(v)} people` : null },
  { label: "Services",         fn: getServices },
  { label: "Response Time",    fn: getResponse },
];

function Stars({ rating }) {
  if (rating == null) return <span style={{ color: "#ccc", fontSize: 12 }}>No rating</span>;
  const n = Number(rating);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", gap: 1 }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ fontSize: 13, color: i <= Math.round(n) ? "#F59E0B" : "#E5E7EB" }}>★</span>
        ))}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{n.toFixed(1)}</span>
    </div>
  );
}

function Badge({ children, color = "#C9A84C" }) {
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: `${color}18`, color, padding: "3px 9px", borderRadius: 20, border: `1px solid ${color}30` }}>
      {children}
    </span>
  );
}

function Crown() {
  return <span title="Best overall" style={{ fontSize: 15, marginLeft: 5 }}>👑</span>;
}

const ComparisonMatrix = ({ vendors = [] }) => {
  const navigate = useNavigate();
  const { openVendorChat } = useChatOverlay();
  const [tab, setTab] = useState("overview");

  if (!vendors.length) return null;

  // Determine "Best" per category
  const prices = vendors.map(v => {
    const raw = v?.startingPrice ?? v?.minPrice ?? v?.price ?? null;
    return raw != null ? Number(raw) : Infinity;
  });
  const ratings = vendors.map(v => Number(getRating(v) ?? 0));
  const lowestPriceIdx = prices.indexOf(Math.min(...prices.filter(p => p < Infinity)));
  const highestRatingIdx = ratings.indexOf(Math.max(...ratings));

  return (
    <div style={{ fontFamily: font }}>
      {/* Tab toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["overview", "details"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "7px 18px", borderRadius: 100, border: "1.5px solid", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "all 0.15s",
              borderColor: tab === t ? "#C9A84C" : "rgba(201,168,76,0.25)",
              background: tab === t ? "#C9A84C" : "transparent",
              color: tab === t ? "#fff" : "#9B7450",
            }}>
            {t === "overview" ? "Overview" : "Full Details"}
          </button>
        ))}
      </div>

      {/* Vendor columns */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${vendors.length}, 1fr)`, gap: 16, marginBottom: 24 }}>
        {vendors.map((v, i) => {
          const isBestPrice  = i === lowestPriceIdx && prices[i] < Infinity;
          const isBestRating = i === highestRatingIdx && ratings[i] > 0;
          const photo = getPhoto(v);
          return (
            <div key={v?._id || i} style={{ background: "#FFFCF7", borderRadius: 16, overflow: "hidden", border: "1.5px solid rgba(201,168,76,0.18)", boxShadow: "0 3px 14px rgba(139,69,19,0.07)" }}>
              {/* Photo */}
              <div style={{ height: 140, background: "#F0EBE3", overflow: "hidden", position: "relative" }}>
                <img src={photo || FALLBACK} alt={getName(v)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,10,0,0.5) 0%, transparent 55%)" }} />
                {getVerified(v) && (
                  <span style={{ position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700, background: "rgba(21,128,61,0.9)", color: "#fff", padding: "3px 8px", borderRadius: 20 }}>✓ Verified</span>
                )}
                {(isBestPrice || isBestRating) && (
                  <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 4, flexDirection: "column", alignItems: "flex-end" }}>
                    {isBestPrice  && <Badge color="#15803d">Best Price</Badge>}
                    {isBestRating && <Badge color="#C9A84C">Top Rated</Badge>}
                  </div>
                )}
              </div>

              {/* Header */}
              <div style={{ padding: "14px 14px 12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: 0, lineHeight: 1.3 }}>
                    {getName(v)}
                    {(isBestRating && highestRatingIdx === lowestPriceIdx && i === highestRatingIdx) && <Crown />}
                  </h3>
                </div>
                <Stars rating={getRating(v)} />
                {getReviews(v) != null && (
                  <div style={{ fontSize: 11, color: "#9B7450", marginTop: 3 }}>{getReviews(v)} review{getReviews(v) !== 1 ? "s" : ""}</div>
                )}
              </div>

              {/* Price highlight */}
              {getPrice(v) && (
                <div style={{ margin: "0 14px 12px", padding: "10px 12px", borderRadius: 10, background: isBestPrice ? "rgba(21,128,61,0.06)" : "rgba(201,168,76,0.06)", border: `1px solid ${isBestPrice ? "rgba(21,128,61,0.2)" : "rgba(201,168,76,0.2)"}`, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#9B7450", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>Starting at</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: isBestPrice ? "#15803d" : "#C9A84C" }}>{getPrice(v)}</div>
                </div>
              )}

              {/* CTA buttons */}
              <div style={{ padding: "0 14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  onClick={() => navigate(`/vendor/${v._id}`)}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C9A84C,#D4B86A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 3px 10px rgba(201,168,76,0.3)" }}
                >
                  View Full Profile
                </button>
                <button
                  onClick={() => openVendorChat(v)}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid rgba(201,168,76,0.35)", background: "transparent", color: "#C9A84C", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
                >
                  Chat with Vendor
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail table — only in "details" tab */}
      {tab === "details" && (
        <div style={{ background: "#FFFCF7", borderRadius: 14, border: "1px solid rgba(201,168,76,0.15)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: font }}>
            <thead>
              <tr style={{ background: "rgba(201,168,76,0.06)", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#9B7450", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", width: 140 }}>Feature</th>
                {vendors.map((v, i) => (
                  <th key={v?._id || i} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 800, color: "#2C1A0E", fontSize: 14 }}>{getName(v)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAT_ROWS.map(({ label, fn }) => {
                const vals = vendors.map(fn);
                if (vals.every(v => !v)) return null;
                return (
                  <tr key={label} style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
                    <td style={{ padding: "11px 16px", color: "#9B7450", fontWeight: 600, fontSize: 12, letterSpacing: "0.02em" }}>{label}</td>
                    {vals.map((val, i) => (
                      <td key={i} style={{ padding: "11px 16px", color: val ? "#2C1A0E" : "#ccc", fontWeight: val ? 500 : 400 }}>
                        {val ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparisonMatrix;

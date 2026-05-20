import React from "react";
import { useNavigate } from "react-router-dom";
import { useChatOverlay } from "../context/ChatContext";

const font = "'Outfit', sans-serif";
const FALLBACK = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80";

// ── Data extractors ───────────────────────────────────────────────────────────
const getName     = (v) => v?.name ?? v?.businessName ?? "Vendor";
const getPhoto    = (v) => v?.image || v?.portfolioPhotos?.[0] || null;
const getRating   = (v) => v?.rating ?? v?.avgRating ?? v?.avgReviewScore ?? null;
const getReviews  = (v) => v?.reviewCount ?? v?.number_of_reviews ?? v?.totalReviews ?? (Array.isArray(v?.clientReferences) ? v.clientReferences.length : null);
const getPrice    = (v) => v?.startingPrice ?? v?.minPrice ?? v?.price ?? null;
const getExp      = (v) => v?.yearsOfExperience ?? null;
const getEvents   = (v) => v?.totalEventsCompleted ?? null;
const getTeam     = (v) => v?.teamSize ?? null;
const getVerified = (v) => !!(v?.isVerified ?? v?.phoneVerified);
const getLocation = (v) => {
  if (v?.location) return v.location;
  if (Array.isArray(v?.locations) && v.locations.length) return v.locations.join(", ");
  const { city, state } = v?.address || {};
  return [city, state].filter(Boolean).join(", ") || null;
};
const getServices = (v) => {
  const s = v?.services ?? v?.serviceCategories;
  if (Array.isArray(s) && s.length) return s.join(", ");
  return v?.serviceType ?? null;
};

const fmtINR = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : null;

// ── Win logic: returns index of winner, or null ───────────────────────────────
const winnerIndex = (vals, mode) => {
  const nums = vals.map(v => (v != null && !isNaN(Number(v))) ? Number(v) : null);
  const valid = nums.filter(n => n != null);
  if (valid.length < 2) return null;
  const target = mode === "low" ? Math.min(...valid) : Math.max(...valid);
  const idx = nums.indexOf(target);
  return idx >= 0 ? idx : null;
};

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  if (rating == null) return <span style={{ fontSize: 12, color: "#ccc" }}>—</span>;
  const n = Number(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 14, color: i <= Math.round(n) ? "#F59E0B" : "#E5E7EB" }}>★</span>
      ))}
      <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginLeft: 4 }}>{n.toFixed(1)}</span>
    </span>
  );
}

// ── Stat row ──────────────────────────────────────────────────────────────────
function StatRow({ label, values, winIdx, icon }) {
  const hasAny = values.some(v => v != null && v !== "");
  if (!hasAny) return null;
  return (
    <tr>
      <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", background: "#FDFAF5", borderBottom: "1px solid rgba(201,168,76,0.08)", verticalAlign: "middle" }}>
        {icon && <span style={{ marginRight: 5 }}>{icon}</span>}{label}
      </td>
      {values.map((val, i) => {
        const isWinner = winIdx != null && i === winIdx && val != null;
        return (
          <td key={i} style={{
            padding: "11px 16px",
            background: isWinner ? "rgba(201,168,76,0.1)" : "transparent",
            borderBottom: "1px solid rgba(201,168,76,0.08)",
            verticalAlign: "middle",
            borderLeft: isWinner ? "3px solid #C9A84C" : "3px solid transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13.5, fontWeight: isWinner ? 800 : 500, color: isWinner ? "#2C1A0E" : "#5A3A1A" }}>
                {val ?? <span style={{ color: "#ccc" }}>—</span>}
              </span>
              {isWinner && (
                <span style={{ fontSize: 10, fontWeight: 700, background: "#C9A84C", color: "#fff", padding: "2px 7px", borderRadius: 20, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  Best
                </span>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
const ComparisonMatrix = ({ vendors = [] }) => {
  const navigate = useNavigate();
  const { openVendorChat } = useChatOverlay();

  if (!vendors.length) return null;

  const n = vendors.length;
  const colW = `${Math.floor(100 / n)}%`;

  // Stat data
  const prices    = vendors.map(getPrice);
  const ratings   = vendors.map(getRating);
  const exps      = vendors.map(getExp);
  const events    = vendors.map(getEvents);
  const teams     = vendors.map(getTeam);
  const locations = vendors.map(getLocation);
  const services  = vendors.map(getServices);

  // Winner indices
  const bestPriceIdx   = winnerIndex(prices,  "low");
  const bestRatingIdx  = winnerIndex(ratings, "high");
  const bestExpIdx     = winnerIndex(exps,    "high");
  const bestEventsIdx  = winnerIndex(events,  "high");

  return (
    <div style={{ fontFamily: font, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>

        {/* ── Photo + name + rating + price header ── */}
        <thead>
          <tr>
            {/* Label column */}
            <th style={{ width: 130, background: "rgba(201,168,76,0.05)", borderBottom: "2px solid rgba(201,168,76,0.15)" }} />

            {vendors.map((v, i) => {
              const photo       = getPhoto(v);
              const rating      = getRating(v);
              const reviews     = getReviews(v);
              const price       = getPrice(v);
              const isBestPrice = i === bestPriceIdx && price != null;
              const isBestRating= i === bestRatingIdx && rating != null;
              const verified    = getVerified(v);

              return (
                <th key={v?._id || i} style={{ padding: 0, borderBottom: "2px solid rgba(201,168,76,0.15)", verticalAlign: "top", width: colW }}>
                  <div style={{ background: "#FFFCF7" }}>

                    {/* Photo */}
                    <div style={{ height: 180, position: "relative", overflow: "hidden" }}>
                      <img
                        src={photo || FALLBACK}
                        alt={getName(v)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,10,0,0.6) 0%, transparent 50%)" }} />
                      {verified && (
                        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 700, background: "rgba(21,128,61,0.92)", color: "#fff", padding: "3px 8px", borderRadius: 20 }}>
                          ✓ Verified
                        </span>
                      )}
                      {/* Best-of badges */}
                      <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                        {isBestRating && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: "#C9A84C", color: "#fff", padding: "3px 8px", borderRadius: 20 }}>Top Rated</span>
                        )}
                        {isBestPrice && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: "#15803d", color: "#fff", padding: "3px 8px", borderRadius: 20 }}>Best Price</span>
                        )}
                      </div>
                    </div>

                    {/* Name + rating */}
                    <div style={{ padding: "14px 16px 10px", textAlign: "left" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 5, lineHeight: 1.3 }}>{getName(v)}</div>
                      <Stars rating={rating} />
                      {reviews != null && (
                        <div style={{ fontSize: 11, color: "#9B7450", marginTop: 3 }}>{reviews} review{reviews !== 1 ? "s" : ""}</div>
                      )}
                    </div>

                    {/* Price */}
                    <div style={{ margin: "0 14px 14px", padding: "10px 14px", borderRadius: 10, textAlign: "center", background: isBestPrice ? "rgba(21,128,61,0.07)" : "rgba(201,168,76,0.06)", border: `1.5px solid ${isBestPrice ? "rgba(21,128,61,0.25)" : "rgba(201,168,76,0.2)"}` }}>
                      <div style={{ fontSize: 10, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Starting at</div>
                      <div style={{ fontSize: 19, fontWeight: 900, color: isBestPrice ? "#15803d" : "#C9A84C" }}>
                        {price != null ? fmtINR(price) : <span style={{ color: "#ccc", fontSize: 13 }}>Quote on chat</span>}
                      </div>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* ── Stat rows ── */}
        <tbody>
          <StatRow label="Location"     icon="📍" values={locations} winIdx={null} />
          <StatRow label="Experience"   icon="⏱"  values={exps.map(e => e != null ? `${e} yrs` : null)} winIdx={bestExpIdx} />
          <StatRow label="Events Done"  icon="🎉" values={events.map(e => e != null ? `${e}+` : null)} winIdx={bestEventsIdx} />
          <StatRow label="Team Size"    icon="👥" values={teams.map(t => t != null ? `${t} people` : null)} winIdx={null} />
          <StatRow label="Services"     icon="✦"  values={services} winIdx={null} />

          {/* CTA row */}
          <tr>
            <td style={{ padding: "16px", background: "#FDFAF5", borderTop: "1px solid rgba(201,168,76,0.12)" }} />
            {vendors.map((v, i) => (
              <td key={v?._id || i} style={{ padding: "14px 14px 18px", background: "#FDFAF5", borderTop: "1px solid rgba(201,168,76,0.12)", verticalAlign: "top" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => navigate(`/vendor/${v._id}`)}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C9A84C,#D4B86A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 3px 10px rgba(201,168,76,0.3)" }}
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => openVendorChat(v)}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid rgba(201,168,76,0.35)", background: "transparent", color: "#C9A84C", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
                  >
                    Chat
                  </button>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonMatrix;

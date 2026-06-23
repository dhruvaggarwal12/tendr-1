import React, { useState, useEffect } from "react";
import router from "../router";
import { useChatOverlay } from "../context/ChatContext";

const font    = "'Outfit', sans-serif";
const FALLBACK = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80";
const ICON_W  = 34;   // px — narrow icon-only column (no text label)
const COL_W   = 175;  // px — per vendor column

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
const getSpeciality = (v) => {
  if (Array.isArray(v?.themes) && v.themes.length) return v.themes.slice(0, 3).join(", ");
  if (Array.isArray(v?.eventTypes) && v.eventTypes.length) return v.eventTypes.slice(0, 3).join(", ");
  if (Array.isArray(v?.photographyType) && v.photographyType.length) return v.photographyType.slice(0, 3).join(", ");
  if (Array.isArray(v?.cuisine) && v.cuisine.length) return v.cuisine.slice(0, 3).join(", ");
  if (Array.isArray(v?.typesOfDecoration) && v.typesOfDecoration.length) return v.typesOfDecoration.slice(0, 3).join(", ");
  return null;
};
const getAvailability = (v) => v?.maxConcurrentEvents ?? null;
const fmtINR = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : null;

// ── Win logic ─────────────────────────────────────────────────────────────────
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
  if (rating == null) return <span style={{ fontSize: 11, color: "#ccc" }}>—</span>;
  const n = Number(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 12, color: i <= Math.round(n) ? "#F59E0B" : "#E5E7EB" }}>★</span>
      ))}
      <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E", marginLeft: 3 }}>{n.toFixed(1)}</span>
    </span>
  );
}

// ── Stat row — icon only, no text label ───────────────────────────────────────
function StatRow({ values, winIdx, icon }) {
  const hasAny = values.some(v => v != null && v !== "");
  if (!hasAny) return null;
  return (
    <tr>
      {/* Icon-only cell — no text heading */}
      <td style={{
        width: ICON_W, padding: "10px 4px",
        fontSize: 15, textAlign: "center",
        background: "#FDFAF5", borderBottom: "1px solid rgba(201,168,76,0.08)",
        verticalAlign: "middle",
      }}>
        {icon}
      </td>
      {values.map((val, i) => {
        const isWinner = winIdx != null && i === winIdx && val != null;
        return (
          <td key={i} style={{
            width: COL_W, padding: "10px 12px",
            background: isWinner ? "rgba(201,168,76,0.1)" : "transparent",
            borderBottom: "1px solid rgba(201,168,76,0.08)",
            verticalAlign: "middle",
            borderLeft: isWinner ? "3px solid #C9A84C" : "3px solid transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, fontWeight: isWinner ? 800 : 500, color: isWinner ? "#2C1A0E" : "#5A3A1A", lineHeight: 1.4 }}>
                {val ?? <span style={{ color: "#ccc" }}>—</span>}
              </span>
              {isWinner && (
                <span style={{ fontSize: 9, fontWeight: 700, background: "#C9A84C", color: "#fff", padding: "2px 6px", borderRadius: 20, whiteSpace: "nowrap" }}>
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

// ── Mobile card (used when n≥3 on narrow screens) ────────────────────────────
function MobileVendorCard({ v, isBestPrice, isBestRating, openVendorChat }) {
  const photo    = getPhoto(v);
  const rating   = getRating(v);
  const reviews  = getReviews(v);
  const price    = getPrice(v);
  const verified = getVerified(v);
  const loc      = getLocation(v);
  const exp      = getExp(v);
  const events   = getEvents(v);
  const team     = getTeam(v);
  const spec     = getSpeciality(v);

  return (
    <div style={{ background: "#FFFCF7", borderRadius: 14, border: `1.5px solid ${isBestPrice || isBestRating ? "rgba(201,168,76,0.45)" : "rgba(201,168,76,0.18)"}`, overflow: "hidden", fontFamily: font, boxShadow: "0 2px 10px rgba(28,10,0,0.07)" }}>
      {/* Photo */}
      <div style={{ position: "relative", height: 110, overflow: "hidden" }}>
        <img src={photo || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80"} alt={getName(v)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,10,0,0.65) 0%, transparent 55%)" }} />
        {verified && <span style={{ position: "absolute", top: 6, left: 6, fontSize: 9, fontWeight: 700, background: "rgba(21,128,61,0.92)", color: "#fff", padding: "2px 6px", borderRadius: 20 }}>✓ Verified</span>}
        <div style={{ position: "absolute", bottom: 6, right: 6, display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
          {isBestRating && <span style={{ fontSize: 8, fontWeight: 700, background: "#C9A84C", color: "#fff", padding: "2px 6px", borderRadius: 20 }}>Top Rated</span>}
          {isBestPrice  && <span style={{ fontSize: 8, fontWeight: 700, background: "#15803d", color: "#fff", padding: "2px 6px", borderRadius: 20 }}>Best Price</span>}
        </div>
      </div>

      {/* Name + rating */}
      <div style={{ padding: "8px 10px 6px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#2C1A0E", marginBottom: 3, lineHeight: 1.3, wordBreak: "break-word" }}>{getName(v)}</div>
        <Stars rating={rating} />
        {reviews != null && <div style={{ fontSize: 9, color: "#9B7450", marginTop: 2 }}>{reviews} review{reviews !== 1 ? "s" : ""}</div>}
      </div>

      {/* Price */}
      <div style={{ margin: "0 8px 8px", padding: "5px 8px", borderRadius: 7, textAlign: "center", background: isBestPrice ? "rgba(21,128,61,0.07)" : "rgba(201,168,76,0.06)", border: `1.5px solid ${isBestPrice ? "rgba(21,128,61,0.25)" : "rgba(201,168,76,0.2)"}` }}>
        <div style={{ fontSize: 8, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>Starting at</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: isBestPrice ? "#15803d" : "#C9A84C" }}>
          {price != null ? fmtINR(price) : <span style={{ color: "#bbb", fontSize: 10 }}>Quote on chat</span>}
        </div>
      </div>

      {/* Key stats */}
      <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        {loc  && <div style={{ fontSize: 10, color: "#5A3A1A" }}>📍 {loc}</div>}
        {spec && <div style={{ fontSize: 10, color: "#5A3A1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🌟 {spec}</div>}
        {exp  != null && <div style={{ fontSize: 10, color: "#5A3A1A" }}>⏱ {exp} yrs exp</div>}
        {events != null && <div style={{ fontSize: 10, color: "#5A3A1A" }}>🎉 {events}+ events</div>}
        {team != null && <div style={{ fontSize: 10, color: "#5A3A1A" }}>👥 Team of {team}</div>}
      </div>

      {/* CTAs */}
      <div style={{ padding: "6px 8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        <button onClick={() => openVendorChat(v)} style={{ width: "100%", padding: "8px 4px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: font, cursor: "pointer", touchAction: "manipulation" }}>
          Request Chat →
        </button>
        <button onClick={() => router.navigate(`/vendor/${v._id}`)} style={{ width: "100%", padding: "7px 4px", borderRadius: 8, border: "1.5px solid rgba(201,168,76,0.35)", background: "transparent", color: "#9B7450", fontSize: 11, fontWeight: 600, fontFamily: font, cursor: "pointer", touchAction: "manipulation" }}>
          View Profile
        </button>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
const ComparisonMatrix = ({ vendors = [] }) => {
  const { openVendorChat } = useChatOverlay();
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 640 : false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (!vendors.length) return null;

  const n = vendors.length;
  const tableW = ICON_W + n * COL_W;

  const prices       = vendors.map(getPrice);
  const ratings      = vendors.map(getRating);
  const exps         = vendors.map(getExp);
  const events       = vendors.map(getEvents);
  const teams        = vendors.map(getTeam);
  const locations    = vendors.map(getLocation);
  const services     = vendors.map(getServices);
  const specialities = vendors.map(getSpeciality);
  const availability = vendors.map(getAvailability);

  const bestPriceIdx  = winnerIndex(prices,      "low");
  const bestRatingIdx = winnerIndex(ratings,      "high");
  const bestExpIdx    = winnerIndex(exps,         "high");
  const bestEventsIdx = winnerIndex(events,       "high");
  const bestSlotsIdx  = winnerIndex(availability, "high");

  // Mobile layout: stacked 2-column card grid — no horizontal scrolling
  if (isMobile && n >= 3) {
    return (
      <div style={{ fontFamily: font, padding: "4px 2px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {vendors.map((v, i) => (
            <MobileVendorCard
              key={v?._id || i}
              v={v}
              isBestPrice={i === bestPriceIdx  && getPrice(v)   != null}
              isBestRating={i === bestRatingIdx && getRating(v) != null}
              openVendorChat={openVendorChat}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: font, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table style={{ width: tableW, minWidth: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>

        {/* Colgroup — explicit widths */}
        <colgroup>
          <col style={{ width: ICON_W }} />
          {vendors.map((_, i) => <col key={i} style={{ width: COL_W }} />)}
        </colgroup>

        {/* Photo + name + rating + price header */}
        <thead>
          <tr>
            {/* Narrow spacer cell for icon column */}
            <th style={{ background: "rgba(201,168,76,0.05)", borderBottom: "2px solid rgba(201,168,76,0.15)" }} />

            {vendors.map((v, i) => {
              const photo        = getPhoto(v);
              const rating       = getRating(v);
              const reviews      = getReviews(v);
              const price        = getPrice(v);
              const isBestPrice  = i === bestPriceIdx  && price  != null;
              const isBestRating = i === bestRatingIdx && rating != null;
              const verified     = getVerified(v);

              return (
                <th key={v?._id || i} style={{ padding: 0, borderBottom: "2px solid rgba(201,168,76,0.15)", verticalAlign: "top" }}>
                  <div style={{ background: "#FFFCF7" }}>

                    {/* Photo — hidden on mobile via CSS */}
                    <div className="cm-vendor-photo" style={{ height: 140, position: "relative", overflow: "hidden" }}>
                      <img
                        src={photo || FALLBACK}
                        alt={getName(v)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,10,0,0.6) 0%, transparent 50%)" }} />
                      {verified && (
                        <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700, background: "rgba(21,128,61,0.92)", color: "#fff", padding: "2px 7px", borderRadius: 20 }}>
                          ✓ Verified
                        </span>
                      )}
                      <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                        {isBestRating && (
                          <span style={{ fontSize: 9, fontWeight: 700, background: "#C9A84C", color: "#fff", padding: "2px 7px", borderRadius: 20 }}>Top Rated</span>
                        )}
                        {isBestPrice && (
                          <span style={{ fontSize: 9, fontWeight: 700, background: "#15803d", color: "#fff", padding: "2px 7px", borderRadius: 20 }}>Best Price</span>
                        )}
                      </div>
                    </div>

                    {/* Name + rating */}
                    <div style={{ padding: "10px 10px 8px", textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 4, lineHeight: 1.3, wordBreak: "break-word" }}>{getName(v)}</div>
                      <Stars rating={rating} />
                      {reviews != null && (
                        <div style={{ fontSize: 10, color: "#9B7450", marginTop: 2 }}>{reviews} review{reviews !== 1 ? "s" : ""}</div>
                      )}
                    </div>

                    {/* Price */}
                    <div style={{ margin: "0 10px 10px", padding: "8px 10px", borderRadius: 8, textAlign: "center", background: isBestPrice ? "rgba(21,128,61,0.07)" : "rgba(201,168,76,0.06)", border: `1.5px solid ${isBestPrice ? "rgba(21,128,61,0.25)" : "rgba(201,168,76,0.2)"}` }}>
                      <div style={{ fontSize: 9, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Starting at</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: isBestPrice ? "#15803d" : "#C9A84C", lineHeight: 1.3 }}>
                        {price != null ? fmtINR(price) : <span style={{ color: "#bbb", fontSize: 11 }}>Quote on chat</span>}
                      </div>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Stat rows — icon only, no text labels */}
        <tbody>
          <StatRow icon="📍" values={locations}                                                    winIdx={null} />
          <StatRow icon="🌟" values={specialities}                                                 winIdx={null} />
          <StatRow icon="⏱"  values={exps.map(e => e != null ? `${e} yrs` : null)}               winIdx={bestExpIdx} />
          <StatRow icon="🎉" values={events.map(e => e != null ? `${e}+` : null)}                 winIdx={bestEventsIdx} />
          <StatRow icon="👥" values={teams.map(t => t != null ? `${t} people` : null)}            winIdx={null} />
          <StatRow icon="📅" values={availability.map(a => a != null ? `${a} at once` : null)}    winIdx={bestSlotsIdx} />
          <StatRow icon="✦"  values={services}                                                     winIdx={null} />

          {/* CTA row */}
          <tr>
            <td style={{ padding: "12px 4px", background: "#FDFAF5", borderTop: "1px solid rgba(201,168,76,0.12)" }} />
            {vendors.map((v, i) => (
              <td key={v?._id || i} style={{ padding: "10px 10px 14px", background: "#FDFAF5", borderTop: "1px solid rgba(201,168,76,0.12)", verticalAlign: "top" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    onClick={() => openVendorChat(v)}
                    style={{ width: "100%", padding: "9px 6px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}>
                    Request Chat →
                  </button>
                  <button
                    onClick={() => router.navigate(`/vendor/${v._id}`)}
                    style={{ width: "100%", padding: "9px 6px", borderRadius: 9, border: "1.5px solid rgba(201,168,76,0.35)", background: "transparent", color: "#9B7450", fontSize: 12, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
                    View Profile
                  </button>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    <style>{`@media (max-width: 767px) { .cm-vendor-photo { display: none !important; } }`}</style>
    </div>
  );
};

export default ComparisonMatrix;

import React, { useState, useEffect } from "react";
import router from "../router";
import { useChatOverlay } from "../context/ChatContext";

const font    = "'Outfit', sans-serif";
const FALLBACK = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80";

// ── Data extractors ───────────────────────────────────────────────────────────
const getName      = (v) => v?.name ?? v?.businessName ?? "Vendor";
const getPhoto     = (v) => v?.image || v?.portfolioPhotos?.[0] || null;
const getRating    = (v) => v?.rating ?? v?.avgRating ?? v?.avgReviewScore ?? null;
const getReviews   = (v) => v?.reviewCount ?? v?.number_of_reviews ?? v?.totalReviews ?? (Array.isArray(v?.clientReferences) ? v.clientReferences.length : null);
const getPrice     = (v) => v?.startingPrice ?? v?.minPrice ?? v?.price ?? null;
const getExp       = (v) => v?.yearsOfExperience ?? null;
const getEvents    = (v) => v?.totalEventsCompleted ?? null;
const getTeam      = (v) => v?.teamSize ?? null;
const getVerified  = (v) => !!(v?.isVerified ?? v?.phoneVerified);
const getPortfolio = (v) => Array.isArray(v?.portfolioPhotos) ? v.portfolioPhotos.length : null;
const getLocation  = (v) => {
  if (v?.location) return v.location;
  if (Array.isArray(v?.locations) && v.locations.length) return v.locations.join(", ");
  const { city, state } = v?.address || {};
  return [city, state].filter(Boolean).join(", ") || null;
};
const getSpeciality = (v) => {
  if (Array.isArray(v?.themes)             && v.themes.length)             return v.themes.slice(0, 3).join(", ");
  if (Array.isArray(v?.eventTypes)          && v.eventTypes.length)          return v.eventTypes.slice(0, 3).join(", ");
  if (Array.isArray(v?.photographyType)     && v.photographyType.length)     return v.photographyType.slice(0, 3).join(", ");
  if (Array.isArray(v?.cuisine)             && v.cuisine.length)             return v.cuisine.slice(0, 3).join(", ");
  if (Array.isArray(v?.typesOfDecoration)   && v.typesOfDecoration.length)   return v.typesOfDecoration.slice(0, 3).join(", ");
  return null;
};
const fmtINR = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : null;

// ── Win logic ─────────────────────────────────────────────────────────────────
const winnerIndex = (vals, mode) => {
  const nums  = vals.map(v => (v != null && !isNaN(Number(v))) ? Number(v) : null);
  const valid = nums.filter(n => n != null);
  if (valid.length < 2) return null;
  const target = mode === "low" ? Math.min(...valid) : Math.max(...valid);
  const idx = nums.indexOf(target);
  return idx >= 0 ? idx : null;
};

// Tendr's Pick: rating (40%) + experience (30%) + events (20%) + portfolio (10%)
// Falls back gracefully when data is missing — uses whatever signals exist
function calcTendersPickIdx(vendors) {
  const ratings = vendors.map(v => getRating(v)    ?? 0);
  const exps    = vendors.map(v => getExp(v)        ?? 0);
  const evts    = vendors.map(v => getEvents(v)     ?? 0);
  const ports   = vendors.map(v => getPortfolio(v)  ?? 0);
  const prices  = vendors.map(v => getPrice(v));
  const maxR = Math.max(...ratings) || 0;
  const maxE = Math.max(...exps)    || 0;
  const maxV = Math.max(...evts)    || 0;
  const maxP = Math.max(...ports)   || 0;
  // If absolutely no signal data, fall back to lowest price
  if (maxR === 0 && maxE === 0 && maxV === 0 && maxP === 0) {
    return winnerIndex(prices, "low");
  }
  const scores = vendors.map((_, i) =>
    (maxR ? ratings[i] / maxR : 0) * 0.4 +
    (maxE ? exps[i]    / maxE : 0) * 0.3 +
    (maxV ? evts[i]    / maxV : 0) * 0.2 +
    (maxP ? ports[i]   / maxP : 0) * 0.1
  );
  const best = Math.max(...scores);
  return best > 0 ? scores.indexOf(best) : winnerIndex(prices, "low");
}

// What the pick is actually based on (for the strip description)
function pickReason(v) {
  const parts = [];
  if (getExp(v))       parts.push(`${getExp(v)} yrs experience`);
  if (getEvents(v))    parts.push(`${getEvents(v)}+ events done`);
  if (getPortfolio(v)) parts.push(`${getPortfolio(v)} portfolio photos`);
  if (!parts.length && getPrice(v)) parts.push("best starting price");
  return parts.slice(0, 2).join(" · ");
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 13 }) {
  if (rating == null) return null;
  const n = Number(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(n) ? "#F59E0B" : "#E5E7EB" }}>★</span>
      ))}
      <span style={{ fontSize: size, fontWeight: 700, color: "#2C1A0E", marginLeft: 3 }}>{n.toFixed(1)}</span>
    </span>
  );
}

// ── Mobile snap-scroll card ───────────────────────────────────────────────────
function MobileCard({ v, isTendrsPick, isBestPrice, isBestRating, openVendorChat }) {
  const photo     = getPhoto(v);
  const rating    = getRating(v);
  const reviews   = getReviews(v);
  const price     = getPrice(v);
  const verified  = getVerified(v);
  const loc       = getLocation(v);
  const exp       = getExp(v);
  const evts      = getEvents(v);
  const team      = getTeam(v);
  const spec      = getSpeciality(v);
  const portfolio = getPortfolio(v);

  return (
    <div style={{
      background: "#FFFCF7",
      borderRadius: 16,
      border: `2px solid ${isTendrsPick ? "#C9A84C" : "rgba(201,168,76,0.2)"}`,
      overflow: "hidden",
      boxShadow: isTendrsPick ? "0 6px 24px rgba(201,168,76,0.28)" : "0 2px 10px rgba(28,10,0,0.07)",
      display: "flex", flexDirection: "column",
      fontFamily: font, height: "100%",
    }}>
      {/* Tendr's Pick banner */}
      {isTendrsPick && (
        <div style={{ background: "linear-gradient(90deg,#C9A84C,#e0c060)", padding: "6px 10px", textAlign: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>⭐ Tendr's Pick</span>
        </div>
      )}

      {/* Photo */}
      <div style={{ position: "relative", height: 150, overflow: "hidden", flexShrink: 0 }}>
        <img src={photo || FALLBACK} alt={getName(v)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,10,0,0.75) 0%, transparent 50%)" }} />
        {verified && (
          <span style={{ position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700, background: "rgba(21,128,61,0.92)", color: "#fff", padding: "3px 8px", borderRadius: 20 }}>✓ Verified</span>
        )}
        <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
            {isBestPrice  && <span style={{ fontSize: 10, fontWeight: 700, background: "#15803d", color: "#fff", padding: "3px 8px", borderRadius: 20 }}>Best Price</span>}
        </div>
        <div style={{ position: "absolute", bottom: 8, left: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.3, textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>{getName(v)}</div>
        </div>
      </div>

      {/* Price */}
      <div style={{ margin: "8px 10px", padding: "10px 12px", borderRadius: 10, textAlign: "center", background: isBestPrice ? "rgba(21,128,61,0.07)" : "rgba(201,168,76,0.06)", border: `1.5px solid ${isBestPrice ? "rgba(21,128,61,0.3)" : "rgba(201,168,76,0.2)"}` }}>
        <div style={{ fontSize: 10, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Starting at</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: isBestPrice ? "#15803d" : "#C9A84C" }}>
          {price != null ? fmtINR(price) : <span style={{ color: "#bbb", fontSize: 12 }}>Quote on chat</span>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "0 12px 10px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {loc               && <div style={{ fontSize: 12, color: "#5A3A1A" }}>📍 {loc}</div>}
        {spec              && <div style={{ fontSize: 12, color: "#5A3A1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🌟 {spec}</div>}
        {exp  != null      && <div style={{ fontSize: 12, color: "#5A3A1A" }}>⏱ {exp} yrs experience</div>}
        {evts != null      && <div style={{ fontSize: 12, color: "#5A3A1A" }}>🎉 {evts}+ events done</div>}
        {team != null      && <div style={{ fontSize: 12, color: "#5A3A1A" }}>👥 Team of {team}</div>}
        {portfolio != null && portfolio > 0 && <div style={{ fontSize: 12, color: "#5A3A1A" }}>📸 {portfolio} portfolio photos</div>}
      </div>

      {/* CTAs */}
      <div style={{ padding: "8px 10px 14px", display: "flex", flexDirection: "column", gap: 7, flexShrink: 0 }}>
        <button
          onClick={() => openVendorChat(v)}
          style={{ width: "100%", padding: "11px 6px", borderRadius: 10, border: "none", background: isTendrsPick ? "linear-gradient(135deg,#C9A84C,#e0c060)" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 3px 12px rgba(196,122,46,0.35)" }}>
          Chat Now →
        </button>
        <button
          onClick={() => router.navigate(`/vendor/${v._id}`)}
          style={{ width: "100%", padding: "10px 6px", borderRadius: 10, border: "1.5px solid rgba(201,168,76,0.35)", background: "transparent", color: "#9B7450", fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
          View Profile
        </button>
      </div>
    </div>
  );
}

// ── Desktop stat row ──────────────────────────────────────────────────────────
function StatRow({ values, winIdx, icon, label, tendersPickIdx }) {
  const hasAny = values.some(v => v != null && v !== "");
  if (!hasAny) return null;
  return (
    <tr>
      <td style={{ width: 70, padding: "10px 6px", background: "#FDFAF5", borderBottom: "1px solid rgba(201,168,76,0.08)", verticalAlign: "middle", textAlign: "center" }}>
        <div style={{ fontSize: 16, lineHeight: 1 }}>{icon}</div>
        {label && <div style={{ fontSize: 9, fontWeight: 700, color: "#9B7450", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.2 }}>{label}</div>}
      </td>
      {values.map((val, i) => {
        const isWinner = winIdx != null && i === winIdx && val != null;
        const isPick   = i === tendersPickIdx;
        return (
          <td key={i} style={{
            padding: "10px 14px",
            background: isWinner ? "rgba(34,197,94,0.08)" : isPick ? "rgba(201,168,76,0.04)" : "transparent",
            borderBottom: "1px solid rgba(201,168,76,0.08)",
            verticalAlign: "middle",
            borderLeft: isWinner ? "3px solid #22c55e" : isPick ? "3px solid rgba(201,168,76,0.35)" : "3px solid transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: isWinner ? 800 : 500, color: isWinner ? "#15803d" : "#5A3A1A", lineHeight: 1.4 }}>
                {val ?? <span style={{ color: "#d1d5db" }}>—</span>}
              </span>
              {isWinner && (
                <span style={{ fontSize: 11, fontWeight: 700, background: "#22c55e", color: "#fff", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  Best ✓
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
  const { openVendorChat } = useChatOverlay();
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 640 : false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (!vendors.length) return null;

  const n           = vendors.length;
  const prices      = vendors.map(getPrice);
  const ratings     = vendors.map(getRating);
  const exps        = vendors.map(getExp);
  const evts        = vendors.map(getEvents);
  const teams       = vendors.map(getTeam);
  const locations   = vendors.map(getLocation);
  const specialties = vendors.map(getSpeciality);
  const portfolios  = vendors.map(getPortfolio);
  const slots       = vendors.map(v => v?.maxConcurrentEvents ?? null);

  const bestPriceIdx    = winnerIndex(prices,    "low");
  const bestRatingIdx   = winnerIndex(ratings,   "high");
  const bestExpIdx      = winnerIndex(exps,      "high");
  const bestEventsIdx   = winnerIndex(evts,      "high");
  const bestPortIdx     = winnerIndex(portfolios,"high");
  const bestSlotsIdx    = winnerIndex(slots,     "high");
  const tendersPickIdx  = calcTendersPickIdx(vendors);

  const pickVendor = tendersPickIdx != null ? vendors[tendersPickIdx] : null;

  // ── Tendr's Pick summary strip ──────────────────────────────────────────
  const PickStrip = () => pickVendor ? (
    <div style={{ margin: "0 10px 14px", padding: "11px 16px", borderRadius: 13, background: "linear-gradient(135deg,rgba(201,168,76,0.13),rgba(201,168,76,0.05))", border: "1.5px solid rgba(201,168,76,0.35)", display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⭐</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#7A5C1E" }}>
          Tendr's Pick: {getName(pickVendor)}
        </div>
        <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2, lineHeight: 1.5 }}>
          {pickReason(pickVendor) || "Best available option based on profile strength"}. Chat with them first.
        </div>
      </div>
    </div>
  ) : null;

  // ── Mobile: horizontal snap-scroll cards ──────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ fontFamily: font }}>
        <style>{`.cmp-snap::-webkit-scrollbar { display: none; }`}</style>
        <PickStrip />
        <div
          className="cmp-snap"
          style={{
            display: "flex", gap: 12,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            padding: "0 12px 16px",
            scrollbarWidth: "none",
            alignItems: "stretch",
          }}
        >
          {vendors.map((v, i) => (
            <div
              key={v?._id || i}
              style={{
                flex: `0 0 ${n === 1 ? "100%" : n === 2 ? "calc(50% - 6px)" : "82%"}`,
                maxWidth: n <= 2 ? "none" : 300,
                scrollSnapAlign: "start",
                display: "flex", flexDirection: "column",
              }}
            >
              <MobileCard
                v={v}
                isTendrsPick={i === tendersPickIdx}
                isBestPrice={i === bestPriceIdx  && getPrice(v) != null}
                isBestRating={i === bestRatingIdx && getRating(v) != null}
                openVendorChat={openVendorChat}
              />
            </div>
          ))}
        </div>
        {n >= 3 && (
          <div style={{ textAlign: "center", fontSize: 11, color: "#9B7450", paddingBottom: 8 }}>← swipe to see all vendors →</div>
        )}
      </div>
    );
  }

  // ── Desktop: improved table ───────────────────────────────────────────────
  const COL_W  = 190;
  const tableW = 70 + n * COL_W;

  return (
    <div style={{ fontFamily: font, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <PickStrip />

      <table style={{ width: tableW, minWidth: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 70 }} />
          {vendors.map((_, i) => <col key={i} style={{ width: COL_W }} />)}
        </colgroup>

        <thead>
          <tr>
            <th style={{ background: "rgba(201,168,76,0.05)", borderBottom: "2px solid rgba(201,168,76,0.15)" }} />
            {vendors.map((v, i) => {
              const photo        = getPhoto(v);
              const rating       = getRating(v);
              const reviews      = getReviews(v);
              const price        = getPrice(v);
              const isBestPrice  = i === bestPriceIdx  && price  != null;
              const isBestRating = i === bestRatingIdx && rating != null;
              const isPick       = i === tendersPickIdx;
              const verified     = getVerified(v);

              return (
                <th key={v?._id || i} style={{
                  padding: 0,
                  borderBottom: "2px solid rgba(201,168,76,0.15)",
                  verticalAlign: "top",
                  background: isPick ? "rgba(201,168,76,0.05)" : "transparent",
                  borderLeft: isPick ? "3px solid #C9A84C" : "3px solid transparent",
                }}>
                  {isPick && (
                    <div style={{ background: "linear-gradient(90deg,#C9A84C,#e0c060)", padding: "6px 10px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>⭐ Tendr's Pick</span>
                    </div>
                  )}
                  <div style={{ background: "#FFFCF7" }}>
                    {/* Photo */}
                    <div style={{ height: 155, position: "relative", overflow: "hidden" }}>
                      <img src={photo || FALLBACK} alt={getName(v)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,10,0,0.65) 0%, transparent 50%)" }} />
                      {verified && (
                        <span style={{ position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700, background: "rgba(21,128,61,0.92)", color: "#fff", padding: "3px 8px", borderRadius: 20 }}>✓ Verified</span>
                      )}
                      <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                        {isBestPrice  && <span style={{ fontSize: 11, fontWeight: 700, background: "#15803d", color: "#fff", padding: "3px 8px", borderRadius: 20 }}>Best Price</span>}
                      </div>
                    </div>

                    {/* Name */}
                    <div style={{ padding: "10px 12px 8px" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", lineHeight: 1.3 }}>{getName(v)}</div>
                    </div>

                    {/* Price */}
                    <div style={{ margin: "0 12px 12px", padding: "10px 12px", borderRadius: 10, textAlign: "center", background: isBestPrice ? "rgba(21,128,61,0.07)" : "rgba(201,168,76,0.06)", border: `1.5px solid ${isBestPrice ? "rgba(21,128,61,0.3)" : "rgba(201,168,76,0.2)"}` }}>
                      <div style={{ fontSize: 10, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Starting at</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: isBestPrice ? "#15803d" : "#C9A84C", lineHeight: 1.2 }}>
                        {price != null ? fmtINR(price) : <span style={{ color: "#bbb", fontSize: 12 }}>Quote on chat</span>}
                      </div>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          <StatRow icon="📍" label="Location"    values={locations}                                                      winIdx={null}          tendersPickIdx={tendersPickIdx} />
          <StatRow icon="🌟" label="Speciality"  values={specialties}                                                    winIdx={null}          tendersPickIdx={tendersPickIdx} />
          <StatRow icon="⏱"  label="Experience"  values={exps.map(e  => e  != null ? `${e} yrs`   : null)}              winIdx={bestExpIdx}    tendersPickIdx={tendersPickIdx} />
          <StatRow icon="🎉" label="Events Done"  values={evts.map(e  => e  != null ? `${e}+`      : null)}              winIdx={bestEventsIdx} tendersPickIdx={tendersPickIdx} />
          <StatRow icon="👥" label="Team Size"    values={teams.map(t => t  != null ? `${t} people`: null)}              winIdx={null}          tendersPickIdx={tendersPickIdx} />
          <StatRow icon="📸" label="Portfolio"    values={portfolios.map(p => p != null && p > 0 ? `${p} photos` : null)} winIdx={bestPortIdx}   tendersPickIdx={tendersPickIdx} />
          <StatRow icon="📅" label="Slots"        values={slots.map(a => a  != null ? `${a} at once`: null)}             winIdx={bestSlotsIdx}  tendersPickIdx={tendersPickIdx} />

          {/* CTA row */}
          <tr>
            <td style={{ padding: "14px 4px", background: "#FDFAF5", borderTop: "1px solid rgba(201,168,76,0.12)" }} />
            {vendors.map((v, i) => {
              const isPick = i === tendersPickIdx;
              return (
                <td key={v?._id || i} style={{
                  padding: "12px 12px 18px",
                  background: isPick ? "rgba(201,168,76,0.05)" : "#FDFAF5",
                  borderTop: "1px solid rgba(201,168,76,0.12)",
                  borderLeft: isPick ? "3px solid #C9A84C" : "3px solid transparent",
                  verticalAlign: "top",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <button
                      onClick={() => openVendorChat(v)}
                      style={{ width: "100%", padding: "11px 6px", borderRadius: 10, border: "none", background: isPick ? "linear-gradient(135deg,#C9A84C,#e0c060)" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 3px 12px rgba(196,122,46,0.32)" }}>
                      Chat Now →
                    </button>
                    <button
                      onClick={() => router.navigate(`/vendor/${v._id}`)}
                      style={{ width: "100%", padding: "10px 6px", borderRadius: 10, border: "1.5px solid rgba(201,168,76,0.35)", background: "transparent", color: "#9B7450", fontSize: 12, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
                      View Profile
                    </button>
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonMatrix;

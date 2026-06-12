import React from "react";
import router from "../router";
import { useChatOverlay } from "../context/ChatContext";

const font = "'Outfit', sans-serif";
const FALLBACK = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80";

const getName     = (v) => v?.name ?? v?.businessName ?? "Vendor";
const getPhoto    = (v) => v?.image || v?.portfolioPhotos?.[0] || null;
const getRating   = (v) => v?.rating ?? v?.avgRating ?? v?.avgReviewScore ?? null;
const getReviews  = (v) => v?.reviewCount ?? v?.number_of_reviews ?? v?.totalReviews ?? (Array.isArray(v?.clientReferences) ? v.clientReferences.length : null);
const getPrice    = (v) => v?.startingPrice ?? v?.minPrice ?? v?.price ?? null;
const getVerified = (v) => !!(v?.isVerified ?? v?.phoneVerified);
const fmtINR      = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : null;

const winnerIndex = (vals, mode) => {
  const nums = vals.map(v => (v != null && !isNaN(Number(v))) ? Number(v) : null);
  const valid = nums.filter(n => n != null);
  if (valid.length < 2) return null;
  const target = mode === "low" ? Math.min(...valid) : Math.max(...valid);
  const idx = nums.indexOf(target);
  return idx >= 0 ? idx : null;
};

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

const ComparisonMatrix = ({ vendors = [] }) => {
  const { openVendorChat } = useChatOverlay();

  if (!vendors.length) return null;

  const prices  = vendors.map(getPrice);
  const ratings = vendors.map(getRating);
  const bestPriceIdx  = winnerIndex(prices,  "low");
  const bestRatingIdx = winnerIndex(ratings, "high");

  return (
    <div style={{ display: "flex", gap: 14, overflowX: "auto", WebkitOverflowScrolling: "touch", padding: "4px 8px 8px", fontFamily: font }}>
      {vendors.map((v, i) => {
        const photo      = getPhoto(v);
        const rating     = getRating(v);
        const reviews    = getReviews(v);
        const price      = getPrice(v);
        const verified   = getVerified(v);
        const isBestPrice  = i === bestPriceIdx  && price  != null;
        const isBestRating = i === bestRatingIdx && rating != null;

        return (
          <div key={v?._id || i} style={{ flex: "0 0 200px", borderRadius: 16, overflow: "hidden", border: "1.5px solid rgba(201,168,76,0.15)", background: "#FFFCF7", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>

            {/* Photo */}
            <div style={{ height: 160, position: "relative" }}>
              <img src={photo || FALLBACK} alt={getName(v)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,10,0,0.55) 0%, transparent 50%)" }} />
              {verified && (
                <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700, background: "rgba(21,128,61,0.92)", color: "#fff", padding: "2px 7px", borderRadius: 20 }}>✓ Verified</span>
              )}
              <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                {isBestRating && <span style={{ fontSize: 9, fontWeight: 700, background: "#C9A84C", color: "#fff", padding: "2px 7px", borderRadius: 20 }}>Top Rated</span>}
                {isBestPrice  && <span style={{ fontSize: 9, fontWeight: 700, background: "#15803d", color: "#fff", padding: "2px 7px", borderRadius: 20 }}>Best Price</span>}
              </div>
            </div>

            {/* Name + stars + reviews */}
            <div style={{ padding: "12px 12px 0" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 5, lineHeight: 1.3, wordBreak: "break-word" }}>{getName(v)}</div>
              <Stars rating={rating} />
              {reviews != null && (
                <div style={{ fontSize: 10, color: "#9B7450", marginTop: 2 }}>{reviews} review{reviews !== 1 ? "s" : ""}</div>
              )}
            </div>

            {/* Price */}
            <div style={{ margin: "10px 12px", padding: "8px 10px", borderRadius: 8, textAlign: "center", background: isBestPrice ? "rgba(21,128,61,0.07)" : "rgba(201,168,76,0.06)", border: `1.5px solid ${isBestPrice ? "rgba(21,128,61,0.25)" : "rgba(201,168,76,0.2)"}` }}>
              <div style={{ fontSize: 9, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Starting at</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: isBestPrice ? "#15803d" : "#C9A84C", lineHeight: 1.2 }}>
                {price != null ? fmtINR(price) : <span style={{ color: "#bbb", fontSize: 11 }}>Quote on chat</span>}
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ padding: "0 12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                onClick={() => openVendorChat(v)}
                style={{ width: "100%", padding: "9px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}>
                Request Chat →
              </button>
              <button
                onClick={() => router.navigate(`/vendor/${v._id}`)}
                style={{ width: "100%", padding: "9px", borderRadius: 9, border: "1.5px solid rgba(201,168,76,0.35)", background: "transparent", color: "#9B7450", fontSize: 12, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
                View Profile
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComparisonMatrix;

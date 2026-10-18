import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectFunCartItems, selectFunConfirmed } from "../redux/funActivitiesCartSlice";
import { selectCartItems as selectGhCartItems, selectGhConfirmed } from "../redux/giftHamperCartSlice";
import { useStationeryCart } from "../context/StationeryCartContext";

const F = "'Outfit', sans-serif";
const GOLD = "#0EA5E9"; // distinct accent from the vendor shortlist's gold, so the two icons read as separate collections
const INK = "#0C2A3A";
const CREAM = "#F0F9FF";

export const CAT_META = {
  "fun-activity": { label: "Fun Activities", emoji: "🎉" },
  "gift-hamper":  { label: "Gift Hampers",   emoji: "🎁" },
  "stationery":   { label: "Stationery",     emoji: "💌" },
};

export default function TripleShortlistFloat() {
  const bookingType = useSelector(s => s.eventPlanning?.bookingType || "");

  const funItems = useSelector(selectFunCartItems);
  const funConfirmed = useSelector(selectFunConfirmed);
  const ghItems = useSelector(selectGhCartItems);
  const ghConfirmed = useSelector(selectGhConfirmed);
  const { cart: stCart } = useStationeryCart();

  // Vendor shortlist (ShortlistFloat) occupies bottom:150 whenever it's showing (DIY flow +
  // at least one shortlisted vendor) — stack this icon directly above it in that case, or
  // take its slot when it isn't showing, so the two never overlap.
  const vendorShortlistShowing = (() => {
    try {
      const sl = JSON.parse(localStorage.getItem("tendr_shortlist") || "{}");
      const vendorCount = Object.values(sl).reduce((s, arr) => s + arr.length, 0);
      return bookingType === "you-do-it" && vendorCount > 0;
    } catch { return false; }
  })();

  const [chipVisible, setChipVisible] = useState(true);
  const [, forceTick] = useState(0);

  const refresh = useCallback(() => { setChipVisible(true); forceTick(t => t + 1); }, []);
  useEffect(() => {
    window.addEventListener("tendr:shortlist-update", refresh);
    window.addEventListener("tendr:stationery-cart-changed", refresh);
    return () => {
      window.removeEventListener("tendr:shortlist-update", refresh);
      window.removeEventListener("tendr:stationery-cart-changed", refresh);
    };
  }, [refresh]);

  const counts = {
    "fun-activity": funItems.length,
    "gift-hamper":  ghItems.length,
    "stationery":   stCart.length,
  };
  const totalCount = counts["fun-activity"] + counts["gift-hamper"] + counts["stationery"];
  // Nudge only clears once every non-empty category has actually been sent/confirmed —
  // not dismissible by a simple close, per how this is meant to behave until the booking
  // is confirmed (date-passed cleanup would need a stored event date; deferred for now).
  const allConfirmed =
    (counts["fun-activity"] === 0 || funConfirmed) &&
    (counts["gift-hamper"] === 0 || ghConfirmed);
  // Stationery has no "confirmed" flag today — treat a non-empty stationery cart as always
  // pending until the customer clears it via the review page.
  const anyPending = totalCount > 0 && (!allConfirmed || counts["stationery"] > 0);

  if (!anyPending) return null;

  const bottom = vendorShortlistShowing ? 220 : 150;
  const btnBase = { border: "none", cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <>
      <style>{`
        @media (min-width: 768px) { .tsl-btn { display: flex !important; } .tsl-mobile { display: none !important; } }
        @media (max-width: 767px) { .tsl-btn { display: none !important; } .tsl-mobile { display: flex !important; } }
        @keyframes tsl-pop { from{opacity:0;transform:scale(0.85) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes tsl-chip { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Desktop */}
      <div className="tsl-btn" style={{ position: "fixed", bottom, right: 84, zIndex: 8945, flexDirection: "column", alignItems: "flex-end", gap: 8, display: "none" }}>
        {chipVisible && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: INK, borderRadius: 100, padding: "6px 12px 6px 10px", boxShadow: "0 4px 16px rgba(12,42,58,0.35)", animation: "tsl-chip 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontFamily: F, fontWeight: 600, whiteSpace: "nowrap" }}>
              {totalCount} item{totalCount !== 1 ? "s" : ""} shortlisted — check this
            </span>
            <button onClick={() => setChipVisible(false)} style={{ ...btnBase, width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 11, padding: 0 }}>✕</button>
          </div>
        )}
        <button
          onClick={() => { window.location.href = "/my-extras"; }}
          style={{ width: 54, height: 54, borderRadius: "50%", border: "2px solid rgba(14,165,233,0.35)", background: "rgba(240,249,255,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 8px 28px rgba(12,42,58,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "transform 0.18s, box-shadow 0.18s", fontFamily: F }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.07)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span style={{ position: "absolute", top: -4, right: -4, width: 20, height: 20, borderRadius: "50%", background: GOLD, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, border: "2px solid #F0F9FF", animation: "tsl-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
            {totalCount}
          </span>
        </button>
      </div>

      {/* Mobile */}
      <div className="tsl-mobile" style={{ position: "fixed", bottom: `calc(${vendorShortlistShowing ? 196 : 138}px + env(safe-area-inset-bottom,0px))`, right: 16, zIndex: 8945, display: "none", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => { window.location.href = "/my-extras"; }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px 10px 12px", borderRadius: 100, border: "none", background: `linear-gradient(135deg,${INK},#164E63)`, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: F, cursor: "pointer", boxShadow: "0 6px 20px rgba(12,42,58,0.4)", whiteSpace: "nowrap" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7DD3FC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Extras
          <span style={{ background: GOLD, borderRadius: 100, padding: "1px 7px", fontSize: 12, fontWeight: 800 }}>{totalCount}</span>
        </button>
      </div>
    </>
  );
}

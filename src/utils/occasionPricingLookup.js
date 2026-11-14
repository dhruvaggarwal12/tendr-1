import pricingRows from "../data/occasionVendorPricing.json";

// Real, sourced vendor prices collected for "Plan an Occasion" (see
// scripts/importOccasionPricing.mjs for how this file gets built/updated). This is
// intentionally kept SEPARATE from getVendorPackages()'s existing synthetic Essential/
// Standard/Premium tiers in OccasionDetail.jsx, not a replacement for them — coverage here
// is real but partial (most occasion/category pairs have one or two real prices found, not
// three full tiers), so it's surfaced as a "here's what real vendors actually charge"
// reference alongside the existing package picker, not swapped in as the picker itself.

// Rough guest-count-band overlap check — bands are free text ("20-50", "Up to 30-40",
// "100-200", "200+", "Minimum 20 guests"), not a fixed enum, so this only does a soft
// substring/number match rather than parsing every phrasing precisely.
function bandRoughlyMatches(band, guests) {
  if (!band) return true; // no band stated = applies generally
  const nums = (band.match(/\d+/g) || []).map(Number);
  if (!nums.length) return true;
  if (nums.length === 1) return guests >= nums[0] * 0.5; // "200+", "Minimum 20 guests"
  const [lo, hi] = [Math.min(...nums), Math.max(...nums)];
  return guests >= lo * 0.6 && guests <= hi * 1.4; // generous overlap, not exact
}

// Returns the real priced rows found for this occasion + vendor category, best guest-count
// match first. Never throws / never invents — returns [] when nothing real exists yet.
export function getRealPricedRows(occasionName, vendorCategory, { guests } = {}) {
  const rows = pricingRows.filter(
    (r) => r.occasion === occasionName && r.vendorCategory === vendorCategory
  );
  if (!guests) return rows;
  return [...rows].sort((a, b) => {
    const am = bandRoughlyMatches(a.guestBand, guests) ? 0 : 1;
    const bm = bandRoughlyMatches(b.guestBand, guests) ? 0 : 1;
    return am - bm;
  });
}

export function formatRealPrice(row) {
  if (row.minPrice == null) return "Quote on request";
  const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;
  const base =
    row.maxPrice != null && row.maxPrice !== row.minPrice
      ? `${fmt(row.minPrice)}–${fmt(row.maxPrice)}`
      : fmt(row.minPrice);
  const basis = row.priceBasis && row.priceBasis !== "per event" ? ` ${row.priceBasis}` : "";
  return `${base}${basis}`;
}

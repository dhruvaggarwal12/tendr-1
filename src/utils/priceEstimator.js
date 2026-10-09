import pricingData from "../data/pricingData.json";

export const PRICING_DISCLAIMER = pricingData.disclaimer;

export function getOccasionNames() {
  return Object.keys(pricingData.occasions);
}

export function getCategoriesForOccasion(occasion) {
  const occ = pricingData.occasions[occasion];
  if (!occ) return [];
  return Object.keys(occ);
}

export function getServicesForOccasion(occasion) {
  return pricingData.occasions[occasion] || {};
}

// Whether a line item's price scales with guest count, based on its pricing-basis text
// (e.g. "per guest", "per person", "per person/event") vs a flat per-event/per-unit price.
export function isPerGuest(basis = "") {
  const b = basis.toLowerCase();
  return b.includes("guest") || b.includes("person");
}

// Computes the min/max cost contribution of one selected line item.
// Per-guest items are multiplied by guestCount automatically; everything else
// uses the quantity the user picked (defaults to 1) since table/chair/counter
// counts depend on layout choices this data can't infer on its own.
export function lineTotal(item, { guestCount = 1, qty = 1 } = {}) {
  const perGuest = isPerGuest(item.basis);
  const multiplier = perGuest ? guestCount : qty;
  return {
    min: item.min * multiplier,
    max: item.max * multiplier,
    multiplier,
    perGuest,
  };
}

// Sums a set of selected { item, qty } entries into an overall estimate.
export function estimateTotal(selections, { guestCount = 1 } = {}) {
  let min = 0;
  let max = 0;
  for (const { item, qty } of selections) {
    const t = lineTotal(item, { guestCount, qty });
    min += t.min;
    max += t.max;
  }
  return { min, max };
}

export const formatINR = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

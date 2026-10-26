import pricingData from "../data/pricingData.json";

export const PRICING_DISCLAIMER = pricingData.disclaimer;

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Real average price Tendr customers actually paid for a similar completed event —
// a live data point shown alongside the static catalog estimate below, never used
// to silently rewrite it. Resolves to null when there isn't enough real data yet
// for this eventType/city, so callers fall back to showing only the static range.
export async function fetchPriceBenchmark(eventType, city) {
  if (!eventType) return null;
  try {
    const params = new URLSearchParams({ eventType });
    if (city) params.set("city", city);
    const res = await fetch(`${BASE_URL}/event-plans/price-benchmark?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.available ? data : null;
  } catch {
    return null;
  }
}

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

// ── Simplified-category model for the guided "tell us → price" estimator ──
// Maps the handful of plain-language categories a customer actually thinks in
// to the real (and more numerous) raw categories pricingData.json uses.
export const SIMPLE_CATEGORIES = [
  { key: "decor",      label: "Decor",                     raw: ["Decor"] },
  { key: "catering",   label: "Catering & beverages",       raw: ["Catering", "Bar"] },
  { key: "cake",       label: "Cake & desserts",            raw: ["Cake"] },
  { key: "photo",      label: "Photography & videography",  raw: ["Photography"] },
  { key: "dj",         label: "DJ & entertainment",         raw: ["Entertainment"] },
  { key: "activities", label: "Games & activities",         raw: ["Activities"] },
  { key: "gifting",    label: "Return gifts & hampers",     raw: ["Gifting"] },
];

// Maps the vendor-booking flow's serviceType vocabulary (Caterer/Decorator/
// Photographer/DJ, as used in CAT_BUDGET_RANGES etc.) to this estimator's simple
// category keys, so a screen that already knows "services required" can hand
// them straight to the estimator instead of asking the customer to re-pick them.
const SERVICE_TYPE_TO_SIMPLE_KEY = {
  Caterer: "catering",
  Decorator: "decor",
  Photographer: "photo",
  Videographer: "photo",
  DJ: "dj",
};
export function mapServiceTypeToSimpleCategory(serviceType) {
  return SERVICE_TYPE_TO_SIMPLE_KEY[serviceType] || null;
}

export const GUEST_BUCKETS = [
  { key: "10-20",   label: "10–20 guests",   guests: 15 },
  { key: "21-50",   label: "21–50 guests",   guests: 35 },
  { key: "51-100",  label: "51–100 guests",  guests: 75 },
  { key: "101-200", label: "101–200 guests", guests: 150 },
  { key: "200+",    label: "200+ guests",    guests: 250 },
];

// Maps an actual guest count (e.g. from a form the customer already filled in) to
// its nearest bucket, so that number doesn't have to be re-entered as a band.
export function nearestGuestBucket(count) {
  const n = Number(count);
  if (!n || n <= 0) return null;
  if (n <= 20) return GUEST_BUCKETS[0].key;
  if (n <= 50) return GUEST_BUCKETS[1].key;
  if (n <= 100) return GUEST_BUCKETS[2].key;
  if (n <= 200) return GUEST_BUCKETS[3].key;
  return GUEST_BUCKETS[4].key;
}

export const VENUE_TYPES = [
  { key: "home",    label: "At home / apartment",        needsVenue: false },
  { key: "booked",  label: "Already-booked banquet/hall", needsVenue: true },
  { key: "restro",  label: "Restaurant / rooftop",        needsVenue: true },
  { key: "outdoor", label: "Farmhouse / outdoor space",   needsVenue: true },
  { key: "office",  label: "Office",                      needsVenue: false },
  { key: "other",   label: "Other",                       needsVenue: true },
];

const SIMPLE_RAW_NAMES = SIMPLE_CATEGORIES.flatMap((c) => c.raw).concat(["Venue"]);

// The simplified categories actually available for this occasion, plus an
// "Other requirements" entry bundling any raw categories not already covered
// (and not Venue, which the wizard asks about as its own step).
export function getSimpleCategories(occasion) {
  const rawCats = getCategoriesForOccasion(occasion);
  const present = SIMPLE_CATEGORIES.filter((c) => c.raw.some((r) => rawCats.includes(r)));
  const leftover = rawCats.filter((r) => !SIMPLE_RAW_NAMES.includes(r));
  if (leftover.length) present.push({ key: "other", label: "Other requirements", raw: leftover });
  return present;
}

const TIER_LABEL_SETS = {
  1: ["Standard"],
  2: ["Basic", "Premium"],
  3: ["Basic", "Standard", "Premium"],
};

// A catalog row's own min–max often already spans cheap-to-fancy versions of that one
// service (that's real — it's why a single "Entrance Decoration" row can run
// ₹3,000–₹20,000). Presenting that whole span as the price for one tier overstates the
// range, so this takes a 40%-wide slice of the row's real span, positioned at `center`
// (0 = bottom of the row's range, 1 = top) — still only ever real numbers off that row,
// just the portion of it that matches the tier being priced.
export function narrowRange(min, max, center) {
  const span = max - min;
  const lo = Math.max(0, center - 0.2);
  const hi = Math.min(1, center + 0.2);
  return { min: Math.round(min + span * lo), max: Math.round(min + span * hi) };
}

// Sorts a category's real line items by price and splits into (up to) three bands,
// then picks the median-priced item within each band as that tier's representative
// row, narrowed to the slice of that row's own range matching the tier's position —
// never invents a number, only selects and slices a real catalog row.
export function tierBuckets(occasion, rawCategories) {
  const services = getServicesForOccasion(occasion);
  const items = rawCategories.flatMap((c) => services[c] || []);
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => (a.min + a.max) - (b.min + b.max));
  const n = Math.min(3, sorted.length);
  const size = Math.ceil(sorted.length / n);
  const buckets = [];
  for (let i = 0; i < n; i++) buckets.push(sorted.slice(i * size, (i + 1) * size).filter(Boolean));
  const labels = TIER_LABEL_SETS[buckets.length] || TIER_LABEL_SETS[3];
  return buckets.map((b, i) => {
    const rep = b[Math.floor((b.length - 1) / 2)];
    const center = buckets.length > 1 ? i / (buckets.length - 1) : 0.5;
    const r = narrowRange(rep.min, rep.max, center);
    return {
      tier: labels[i],
      min: r.min,
      max: r.max,
      perGuest: isPerGuest(rep.basis),
      service: rep.service,
    };
  });
}

export const CATERING_MEAL_TYPES = [
  { key: "buffet",    label: "Buffet" },
  { key: "plated",    label: "Plated meal" },
  { key: "hightea",   label: "High tea" },
  { key: "breakfast", label: "Breakfast" },
  { key: "brunch",    label: "Brunch" },
];

const CATERING_ITEM_NAME = {
  plated: "Plated Meal",
  hightea: "High Tea",
  breakfast: "Breakfast",
  brunch: "Brunch",
};

// Veg/non-veg only actually changes the catalog row for a standard buffet — the other
// meal formats aren't split by veg/non-veg in the source data, so they use one row each.
export function getCateringItem(occasion, mealType, isVeg) {
  const items = getServicesForOccasion(occasion)["Catering"] || [];
  if (mealType === "buffet") {
    return items.find((i) => i.service === (isVeg ? "Veg Catering" : "Non-Veg Catering")) || null;
  }
  const name = CATERING_ITEM_NAME[mealType];
  return items.find((i) => i.service === name) || null;
}

// ── Ready-made packages — 3 alternatives spanning every category the customer
// already said they want. Reuses tierBuckets' existing Basic/Standard/Premium
// bands (one real representative item per band) for each category rather than
// summing every item at a priority level — summing would double-count items
// that are really alternatives to each other (e.g. a basic vs. premium backdrop
// aren't two things to buy, they're two versions of the same one thing).
const PACKAGE_TIER_LABELS = ["Smart Saver", "Balanced", "Premium"];
const PACKAGE_TIER_KEYS = ["saver", "balanced", "premium"];

// `cateringChoice` ({ mealType, isVeg }), if the customer already answered the
// catering question, keeps that real preference the same across all 3 tiers
// instead of re-guessing it.
export function buildPackageTiers(occasion, chosenCategoryKeys, cateringChoice, guestCount) {
  const defs = getSimpleCategories(occasion).filter((c) => chosenCategoryKeys.includes(c.key));

  return PACKAGE_TIER_LABELS.map((label, tierIdx) => {
    const rows = [];
    defs.forEach((def) => {
      if (def.key === "catering") {
        if (!cateringChoice?.mealType) return;
        const item = getCateringItem(occasion, cateringChoice.mealType, cateringChoice.isVeg !== false);
        if (!item) return;
        const r = narrowRange(item.min, item.max, 0.5);
        rows.push({ key: def.key, label: def.label, min: r.min * guestCount, max: r.max * guestCount, items: [item.service] });
        return;
      }
      const bands = tierBuckets(occasion, def.raw);
      if (!bands.length) return;
      const band = bands[bands.length === 1 ? 0 : Math.round((tierIdx * (bands.length - 1)) / 2)];
      rows.push({ key: def.key, label: def.label, min: band.min, max: band.max, items: [band.service] });
    });
    const total = rows.reduce((a, r) => ({ min: a.min + r.min, max: a.max + r.max }), { min: 0, max: 0 });
    return { key: PACKAGE_TIER_KEYS[tierIdx], label, rows, total };
  });
}

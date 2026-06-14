const STORAGE_KEY = "tendr:stationery_products";

export const STATIONERY_CATEGORIES = [
  "Invitation",
  "Save the Date",
  "Menu Card",
  "Place Card",
  "Thank You Card",
  "Ceremony Program",
  "RSVP Card",
  "Other",
];

export const DEFAULT_STATIONERY = [];

export function getStationeryProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_STATIONERY;
}

export function saveStationeryProducts(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getStationeryProductById(id) {
  return getStationeryProducts().find((p) => p.id === id) || null;
}

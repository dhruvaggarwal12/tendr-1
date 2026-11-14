// Reconciles the occasion/vendor-category vocabulary used by real-world pricing research
// (scripts/importOccasionPricing.mjs's source spreadsheets) with the exact strings the app
// itself uses (src/data/occasions.js's `name` field, and the vendor-category switch in
// src/pages/occasions/OccasionDetail.jsx's getVendorPackages). Both sides already match for
// most values — this only lists the handful that don't, so a research pass never has to be
// re-typed to match the app's exact punctuation/wording.

// Spreadsheet occasion name -> app's occasion name (src/data/occasions.js `name` field).
// Only entries that actually differ — anything not listed here is assumed to already match.
export const OCCASION_NAME_ALIASES = {
  'Bachelorette/Bachelor Party': 'Bachelorette / Bachelor Party',
  'Get-Together/House Party': 'Get-Together / House Party',
  'Navratri/Garba Night': 'Navratri / Garba Night',
};

// Spreadsheet vendor-category name -> app's internal category name (the string
// getVendorPackages() switches on). Only entries that actually differ.
export const VENDOR_CATEGORY_ALIASES = {
  'Emcee': 'Emcee / Host',
};

export function normalizeOccasionName(name) {
  return OCCASION_NAME_ALIASES[name] || name;
}

export function normalizeVendorCategory(name) {
  return VENDOR_CATEGORY_ALIASES[name] || name;
}

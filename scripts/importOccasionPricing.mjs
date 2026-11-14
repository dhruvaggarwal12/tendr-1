/**
 * importOccasionPricing.mjs
 *
 * Merges a new real-vendor-pricing research pass (an .xlsx file, same shape as the one
 * used to seed this dataset — a "Vendor price data" sheet with columns: Occasion, Vendor
 * category, Service/item name, City, Guest count band, Price basis, Min price, Max price,
 * What's typically included, What's typically excluded, Source, Confidence, Last verified,
 * GST included?) into src/data/occasionVendorPricing.json, the canonical dataset
 * src/utils/occasionPricingLookup.js reads from.
 *
 * This is the "when new data comes in, it merges and improves" system: every future
 * research pass (more vendors, more occasions, corrected prices) runs through this same
 * script instead of being hand-copied in. Rows are matched by
 * (occasion, vendor category, service name, city, guest band) — an existing match gets its
 * price/source/confidence/etc. OVERWRITTEN by the new row (newer research wins), anything
 * new is appended, nothing already in the file is silently dropped.
 *
 * Usage: node scripts/importOccasionPricing.mjs "path/to/NewResearchPass.xlsx"
 */
import XLSX from 'xlsx';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { normalizeOccasionName, normalizeVendorCategory } from '../src/data/occasionPricingAliases.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../src/data/occasionVendorPricing.json');
const ALLOWED_CONFIDENCE = ['Reliable', 'Quote-first'];
const ALLOWED_GST = ['Yes', 'No', 'Not stated'];

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/importOccasionPricing.mjs "path/to/ResearchPass.xlsx"');
  process.exit(1);
}

function parseMoney(v) {
  if (v === '' || v == null) return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function rowKey(r) {
  return [r.occasion, r.vendorCategory, r.service, r.city, r.guestBand].join('||');
}

// ── Read the new pass ───────────────────────────────────────────────────────────────
const wb = XLSX.readFile(inputPath);
const sheetName = wb.SheetNames.find(n => /vendor price data/i.test(n)) || wb.SheetNames[0];
const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

const newRows = [];
const skipped = [];
for (const raw of rawRows) {
  const occasion = normalizeOccasionName(String(raw['Occasion'] || '').trim());
  const vendorCategory = normalizeVendorCategory(String(raw['Vendor category'] || '').trim());
  const service = String(raw['Service/item name'] || '').trim();
  const confidence = String(raw['Confidence'] || '').trim();
  const gstIncluded = String(raw["GST included?"] || 'Not stated').trim() || 'Not stated';

  if (!occasion || !vendorCategory || !service) {
    skipped.push({ reason: 'missing occasion/category/service', raw });
    continue;
  }
  if (!ALLOWED_CONFIDENCE.includes(confidence)) {
    skipped.push({ reason: `confidence must be one of ${ALLOWED_CONFIDENCE.join('/')}, got "${confidence}"`, raw });
    continue;
  }
  if (!ALLOWED_GST.includes(gstIncluded)) {
    skipped.push({ reason: `GST included? must be one of ${ALLOWED_GST.join('/')}, got "${gstIncluded}"`, raw });
    continue;
  }
  const minPrice = parseMoney(raw['Min price']);
  const maxPrice = parseMoney(raw['Max price']);
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    skipped.push({ reason: `min price ${minPrice} > max price ${maxPrice}`, raw });
    continue;
  }
  if (!String(raw['Source'] || '').trim()) {
    skipped.push({ reason: 'missing source', raw });
    continue;
  }

  newRows.push({
    occasion,
    vendorCategory,
    service,
    city: String(raw['City'] || '').trim(),
    guestBand: String(raw['Guest count band'] || '').trim(),
    priceBasis: String(raw['Price basis'] || '').trim(),
    minPrice,
    maxPrice,
    includes: String(raw["What's typically included"] || '').trim(),
    excludes: String(raw["What's typically excluded"] || '').trim(),
    source: String(raw['Source'] || '').trim(),
    confidence,
    lastVerified: String(raw['Last verified'] || '').trim(),
    gstIncluded,
  });
}

// ── Merge into the existing canonical dataset ───────────────────────────────────────
const existing = existsSync(OUTPUT_PATH) ? JSON.parse(readFileSync(OUTPUT_PATH, 'utf8')) : [];
const byKey = new Map(existing.map(r => [rowKey(r), r]));

let added = 0, updated = 0, unchanged = 0;
for (const row of newRows) {
  const key = rowKey(row);
  const prev = byKey.get(key);
  if (!prev) {
    byKey.set(key, row);
    added++;
  } else if (JSON.stringify(prev) !== JSON.stringify(row)) {
    byKey.set(key, row); // newer research overwrites the old row for this exact item
    updated++;
  } else {
    unchanged++;
  }
}

const merged = [...byKey.values()].sort((a, b) =>
  a.occasion.localeCompare(b.occasion) ||
  a.vendorCategory.localeCompare(b.vendorCategory) ||
  a.service.localeCompare(b.service)
);

writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2) + '\n');

console.log(`Read ${rawRows.length} rows from "${sheetName}" in ${inputPath}`);
console.log(`  added: ${added}, updated: ${updated}, unchanged: ${unchanged}, skipped: ${skipped.length}`);
console.log(`Dataset now has ${merged.length} rows total -> ${OUTPUT_PATH}`);
if (skipped.length) {
  console.log('\nSkipped rows (not merged):');
  skipped.forEach(s => console.log(`  - ${s.reason}: ${s.raw['Occasion'] || '?'} / ${s.raw['Vendor category'] || '?'} / ${s.raw['Service/item name'] || '?'}`));
}

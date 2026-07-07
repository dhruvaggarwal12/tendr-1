/**
 * fetchThemePhotos.mjs
 * Fetches 8 Unsplash photos per theme (140 themes) + 2 per venue (4 venues)
 * Saves permanently to MongoDB via backend API.
 *
 * Run: node scripts/fetchThemePhotos.mjs
 * Takes ~3 hours at Unsplash free tier (50 req/hour). Leave it running overnight.
 */

import BIRTHDAY_THEMES        from '../src/data/birthdayThemes.js';
import ANNIVERSARY_THEMES     from '../src/data/anniversaryThemes.js';
import BABY_SHOWER_THEMES     from '../src/data/babyShowerThemes.js';
import KITTY_PARTY_THEMES     from '../src/data/kittyPartyThemes.js';
import GET_TOGETHER_THEMES    from '../src/data/getTogetherThemes.js';
import HOUSE_PARTY_THEMES     from '../src/data/housePartyThemes.js';
import NAMING_CEREMONY_THEMES from '../src/data/namingCeremonyThemes.js';
import HOUSEWARMING_THEMES    from '../src/data/housewarmingThemes.js';

// ── Config ────────────────────────────────────────────────────────────────────
const UNSPLASH_KEY = 'lnuDfQXD3lfJGqb9dHiEpEAIu2P4f8h9OLQqMaHuTC8';
const BASE_URL     = 'https://api.tendr.co.in';
const PHOTOS_PER_THEME = 8;
const PHOTOS_PER_VENUE = 2;
const DELAY_MS = 75_000; // 75s between requests → safely under 50/hour Unsplash limit

// ── All themes with occasion label ────────────────────────────────────────────
const ALL_THEMES = [
  ...BIRTHDAY_THEMES       .map(t => ({ ...t, occasion: 'Birthday' })),
  ...ANNIVERSARY_THEMES    .map(t => ({ ...t, occasion: 'Anniversary' })),
  ...BABY_SHOWER_THEMES    .map(t => ({ ...t, occasion: 'Baby Shower' })),
  ...KITTY_PARTY_THEMES    .map(t => ({ ...t, occasion: 'Kitty Party' })),
  ...GET_TOGETHER_THEMES   .map(t => ({ ...t, occasion: 'Get Together' })),
  ...HOUSE_PARTY_THEMES    .map(t => ({ ...t, occasion: 'House Party' })),
  ...NAMING_CEREMONY_THEMES.map(t => ({ ...t, occasion: 'Naming Ceremony' })),
  ...HOUSEWARMING_THEMES   .map(t => ({ ...t, occasion: 'Housewarming' })),
];

// ── Venue entries ─────────────────────────────────────────────────────────────
const VENUES = [
  { id: 'venue-home',              label: 'Home',              query: 'indian home party decoration celebration indoor' },
  { id: 'venue-lawn-farmhouse',    label: 'Lawn / Farmhouse',  query: 'indian farmhouse lawn party decoration outdoor event' },
  { id: 'venue-garden',            label: 'Garden',            query: 'indian garden party decoration flowers outdoor celebration' },
  { id: 'venue-terrace-rooftop',   label: 'Terrace / Rooftop', query: 'indian rooftop terrace party decoration lights night' },
];

// ── Build India-specific Unsplash query per theme ─────────────────────────────
function buildQuery(theme, occasion) {
  const themeName = theme.theme.toLowerCase();
  const occ       = occasion.toLowerCase();
  return `indian ${themeName} ${occ} decoration celebration real photo`;
}

// ── Fetch URLs from Unsplash ──────────────────────────────────────────────────
async function fetchUnsplashUrls(query, count) {
  const q   = encodeURIComponent(query);
  const url = `https://api.unsplash.com/search/photos?query=${q}&per_page=${count}&orientation=landscape&content_filter=high&client_id=${UNSPLASH_KEY}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Unsplash ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.results || []).map(r => r.urls.regular).filter(Boolean);
}

// ── Check if already saved in DB ─────────────────────────────────────────────
async function alreadySaved(themeId) {
  try {
    const res  = await fetch(`${BASE_URL}/theme-photos/${themeId}`);
    const data = await res.json();
    return data.urls && data.urls.length >= 2; // consider saved if has at least 2 URLs
  } catch {
    return false;
  }
}

// ── Save URLs to backend ──────────────────────────────────────────────────────
async function saveToBackend(themeId, urls) {
  const res = await fetch(`${BASE_URL}/theme-photos/${themeId}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ urls }),
  });
  if (!res.ok) throw new Error(`Save failed ${res.status}`);
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const allItems = [
    ...ALL_THEMES.map(t => ({
      id:    t.id,
      label: `[${t.occasion}] ${t.theme}`,
      query: buildQuery(t, t.occasion),
      count: PHOTOS_PER_THEME,
    })),
    ...VENUES.map(v => ({
      id:    v.id,
      label: `[Venue] ${v.label}`,
      query: v.query,
      count: PHOTOS_PER_VENUE,
    })),
  ];

  console.log(`\n📸 Starting fetch for ${allItems.length} items (${ALL_THEMES.length} themes + ${VENUES.length} venues)`);
  console.log(`⏱  ~${Math.ceil(allItems.length * DELAY_MS / 1000 / 60)} minutes total at ${DELAY_MS/1000}s delay\n`);

  let done = 0, skipped = 0, failed = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    process.stdout.write(`[${i+1}/${allItems.length}] ${item.label} ... `);

    // Skip if already saved with enough photos
    if (await alreadySaved(item.id)) {
      console.log('already saved ✓');
      skipped++;
      continue;
    }

    try {
      const urls = await fetchUnsplashUrls(item.query, item.count);
      if (!urls.length) {
        console.log('no results');
        failed++;
      } else {
        await saveToBackend(item.id, urls);
        console.log(`saved ${urls.length} photos ✓`);
        done++;
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      failed++;
    }

    // Throttle — wait between requests (skip after last item)
    if (i < allItems.length - 1) {
      process.stdout.write(`   waiting ${DELAY_MS/1000}s...\n`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n✅ Done — saved: ${done}, skipped (already in DB): ${skipped}, failed: ${failed}`);
}

main().catch(err => { console.error(err); process.exit(1); });

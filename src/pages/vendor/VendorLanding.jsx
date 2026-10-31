import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import SEO from "../../components/SEO";
import { setFilters } from "../../redux/listingFiltersSlice";
import NotFound from "../shared/NotFound";

const font = "'Outfit', sans-serif";

// Every SEO entry URL handled by this catch-all (/:slug) is a thin redirect into a
// real, already-built page — never a separate written content page. Two families:
//
//  1. Occasion-intent slugs ("plan-a-birthday-with-tendr", "birthday-planner",
//     "surprise-birthday-planner") land on that occasion's real planning flow —
//     the Occasion Hub — for every occasion Tendr supports.
//  2. Service(+occasion)-in-city slugs ("caterer-in-delhi",
//     "birthday-decoration-in-noida") land on the real vendor listings page,
//     pre-filtered (serviceType + city, and eventType when an occasion was named)
//     via the same Redux filters the rest of the app already uses to drive that
//     page — never a stand-in page with its own vendor list.

// ── Family 1: occasion → Occasion Hub ──────────────────────────────────────────
// Matches the `occasion="…"` values OccasionHub is routed with in router.jsx
// (each has a real /{occasion}-hub route already).
const OCCASION_SLUGS = [
  "birthday", "first-birthday", "anniversary", "baby-shower", "newborn-welcome",
  "gender-reveal", "housewarming", "get-together", "kitty-party", "naming-ceremony",
  "office-party", "graduation", "wedding", "bachelorette", "farewell", "retirement",
  "diwali-party", "holi-party", "navratri-garba",
];
const occasionLabel = (occ) => occ.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

// slug -> { hubPath, occasion }, built once from OCCASION_SLUGS so every occasion
// gets the same handful of real-world search phrasings for free.
const OCCASION_INTENT_SLUGS = {};
OCCASION_SLUGS.forEach(occ => {
  const entry = { hubPath: `/${occ}-hub`, occasion: occ };
  OCCASION_INTENT_SLUGS[`plan-a-${occ}-with-tendr`] = entry;
  OCCASION_INTENT_SLUGS[`${occ}-planner`] = entry;
  OCCASION_INTENT_SLUGS[`surprise-${occ}-planner`] = entry;
  // Skip for occasions whose slug already ends in "-party" (kitty-party,
  // office-party, diwali-party, holi-party) so this never produces
  // "kitty-party-party-planner" — "{occ}-planner" above already covers it.
  if (!occ.endsWith("-party")) OCCASION_INTENT_SLUGS[`${occ}-party-planner`] = entry;
});

// ── Family 2: service(+occasion)-in-city → filtered listings ──────────────────
// Only the 4 cities the real listings page's Location filter actually supports
// (PrimaryFilters_ListingPage.jsx) — no Gurgaon, no "near me" (nothing to filter
// by without real geolocation).
const CITY_MAP = {
  "delhi":         "Delhi",
  "noida":         "Noida",
  "greater-noida": "Greater Noida",
  "ghaziabad":     "Ghaziabad",
};

// Real listings serviceType values, plus the extra nouns people actually search
// ("decoration" as often as "decorator").
const SERVICE_WORDS = {
  "decorator":    "Decorator",
  "decoration":   "Decorator",
  "decorations":  "Decorator",
  "caterer":      "Caterer",
  "catering":     "Caterer",
  "photographer": "Photographer",
  "photography":  "Photographer",
  "dj":           "DJ Setup",
  "music":        "DJ Setup",
};

// Services that aren't on the listings page at all — always a fixed redirect to
// their own dedicated page, regardless of which city was in the slug (matches
// the previous behaviour of this file).
const FIXED_REDIRECT_SLUGS = {
  "gift-hamper":        "/gift-hampers-cakes",
  "fun-activities":     "/fun-activities",
  "wedding-stationery": "/stationery",
};

// Longest-first so "first-birthday-decoration-in-delhi" matches the occasion
// "first-birthday", not just "birthday" inside it.
const OCCASION_SLUGS_BY_LENGTH = [...OCCASION_SLUGS].sort((a, b) => b.length - a.length);

function parseSlug(slug) {
  if (!slug) return null;

  if (OCCASION_INTENT_SLUGS[slug]) {
    const { hubPath, occasion } = OCCASION_INTENT_SLUGS[slug];
    return { kind: "occasion", hubPath, occasion };
  }

  const inIdx = slug.indexOf("-in-");
  if (inIdx === -1) return null;
  const prefix = slug.slice(0, inIdx);
  // Strips a legacy "-under-50000" / "-under-1-lakh" budget suffix, if present —
  // the old budget-tier URLs this used to render separate pricing content for.
  // There's no real budget filter on the listings page to apply it to, so these
  // now just redirect to the plain service+city listings rather than 404ing.
  const citySlug = slug.slice(inIdx + 4).replace(/-under-.+$/, "");
  const city = CITY_MAP[citySlug];
  if (!city) return null;

  if (FIXED_REDIRECT_SLUGS[prefix]) {
    return { kind: "fixed", path: FIXED_REDIRECT_SLUGS[prefix] };
  }

  // Bare service + city — "caterer-in-delhi", no occasion named.
  if (SERVICE_WORDS[prefix]) {
    return { kind: "listings", serviceType: SERVICE_WORDS[prefix], city, eventType: "" };
  }

  // Occasion + service + city — "birthday-decoration-in-noida".
  for (const occ of OCCASION_SLUGS_BY_LENGTH) {
    if (prefix.startsWith(`${occ}-`)) {
      const serviceWord = prefix.slice(occ.length + 1);
      if (SERVICE_WORDS[serviceWord]) {
        return { kind: "listings", serviceType: SERVICE_WORDS[serviceWord], city, eventType: occasionLabel(occ) };
      }
    }
  }

  return null;
}

export default function VendorLanding() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const parsed = parseSlug(slug);

  useEffect(() => {
    if (!parsed) return;
    if (parsed.kind === "occasion") { navigate(parsed.hubPath, { replace: true }); return; }
    if (parsed.kind === "fixed") { navigate(parsed.path, { replace: true }); return; }
    // "listings": eventType is informational only (shown in context/used for the
    // corporate-event special case) — the real filter fields that change which
    // vendors show are serviceType and locationType, same as the rest of the app.
    dispatch(setFilters({ serviceType: parsed.serviceType, locationType: parsed.city, eventType: parsed.eventType }));
    navigate("/listings", { replace: true });
  }, [slug]); // eslint-disable-line

  if (!parsed) return <NotFound />;

  // Renders for one tick before the redirect above fires — just enough for a real
  // title/description on the search term that landed here (Googlebot executes JS
  // and follows the navigate() call), not a standalone page with its own content.
  const title = parsed.kind === "occasion"
    ? `Plan Your ${occasionLabel(parsed.occasion)} with Tendr`
    : `${parsed.serviceType}s in ${parsed.city} — Book Verified Vendors | Tendr`;
  const description = parsed.kind === "occasion"
    ? `Plan your ${occasionLabel(parsed.occasion)} with Tendr — verified vendors, guided planning, and real pricing in one place.`
    : `Find verified ${parsed.serviceType.toLowerCase()}s in ${parsed.city} on Tendr. Real photos, transparent pricing, and customer reviews.`;

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, color: "#9B7450", fontSize: 14 }}>
      <SEO title={title} description={description} path={`/${slug}`} />
      Taking you there…
    </div>
  );
}

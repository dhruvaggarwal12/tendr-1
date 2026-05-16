import { Helmet } from "react-helmet-async";

const BASE_URL = "https://tendr.co.in";
const DEFAULT_IMG = `${BASE_URL}/og-image.png`;
const SITE_NAME = "Tendr";

// Celebration types Tendr covers — used for rich descriptions
export const CELEBRATION_TYPES = [
  "birthdays", "anniversaries", "balloon decoration", "surprise parties",
  "house parties", "baby showers", "office celebrations", "farewell parties",
  "festive celebrations", "engagements", "romantic room setups", "corporate events",
];

// Cities served
export const CITIES = ["Delhi", "Noida", "Gurgaon", "Ghaziabad", "Faridabad", "Greater Noida"];

// Vendor service types → human-readable
export const SERVICE_LABELS = {
  Caterer:      "Caterers & Catering Services",
  Photographer: "Photographers & Videographers",
  DJ:           "DJs & Entertainment",
  Decorator:    "Decorators & Event Stylists",
};

// Generate dynamic title for vendor listing filtered by service + city
export function vendorListTitle(serviceType, city) {
  if (serviceType && city)
    return `Best ${SERVICE_LABELS[serviceType] || serviceType} in ${city} | Tendr`;
  if (serviceType)
    return `Top ${SERVICE_LABELS[serviceType] || serviceType} in Delhi NCR | Compare & Book | Tendr`;
  if (city)
    return `Trusted Event Vendors in ${city} | Tendr`;
  return "Browse Verified Event & Celebration Vendors in Delhi NCR | Tendr";
}

export function vendorListDescription(serviceType, city) {
  const svc = SERVICE_LABELS[serviceType] || "caterers, DJs, photographers and decorators";
  const loc = city || "Delhi, Noida, Gurgaon and Ghaziabad";
  return `Discover and compare trusted ${svc} in ${loc} for birthdays, anniversaries, corporate events, house parties and more. Browse portfolios, read reviews and book instantly through Tendr.`;
}

// Dynamic metadata for a single vendor
export function vendorPageTitle(vendor) {
  if (!vendor) return "Vendor Profile | Tendr";
  const city = vendor.city || vendor.address?.city || vendor.locations?.[0] || "Delhi NCR";
  const svc  = vendor.serviceType || "Event Vendor";
  return `${vendor.name} — Trusted ${svc} in ${city} | Tendr`;
}

export function vendorPageDescription(vendor) {
  if (!vendor) return "View vendor profile, portfolio and pricing on Tendr.";
  const city  = vendor.city || vendor.address?.city || vendor.locations?.[0] || "Delhi NCR";
  const exp   = vendor.yearsOfExperience ? `${vendor.yearsOfExperience} years of experience. ` : "";
  const team  = vendor.teamSize ? `Team of ${vendor.teamSize}. ` : "";
  const svc   = vendor.serviceType || "event services";
  return `Book ${vendor.name} for your next celebration in ${city}. ${exp}${team}Specialising in ${svc.toLowerCase()} for birthdays, anniversaries, corporate events and more. Compare, chat and book on Tendr.`;
}

// Category page titles
export function categoryTitle(category, city) {
  const labels = {
    Photographer: "Top Rated Photographers",
    Caterer:      "Top Rated Caterers",
    DJ:           "Top Rated DJs & Entertainment",
    Decorator:    "Top Rated Decorators",
  };
  const label = labels[category] || `Top Rated ${category}s`;
  if (city) return `${label} in ${city} | Tendr`;
  return `${label} in Delhi NCR for Celebrations & Events | Tendr`;
}

export function categoryDescription(category, city) {
  const loc  = city || "Delhi NCR";
  const map  = {
    Photographer: `Find the best event photographers in ${loc} for birthdays, weddings, corporate events and celebrations. View portfolios, compare packages and book verified photographers through Tendr.`,
    Caterer:      `Discover trusted caterers in ${loc} for birthdays, house parties, corporate lunches and celebratory events. Compare menus, pricing and book catering services on Tendr.`,
    DJ:           `Book top DJs and entertainment in ${loc} for birthdays, anniversaries, house parties and corporate events. Browse profiles and book through Tendr.`,
    Decorator:    `Find expert decorators and event stylists in ${loc} for balloon setups, birthday themes, romantic room setups and corporate events. Compare and book on Tendr.`,
  };
  return map[category] || `Discover top-rated ${category} vendors in ${loc} for celebrations and events. Compare, shortlist and book through Tendr.`;
}

// Core SEO component
export default function SEO({
  title,
  description,
  path = "",
  image = DEFAULT_IMG,
  noIndex = false,
  schema = null,
  breadcrumbs = null,
}) {
  const fullTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : `${SITE_NAME} — Celebration & Event Planning Platform in Delhi NCR`;

  const canonical = `${BASE_URL}${path}`;

  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": b.name,
      "item": `${BASE_URL}${b.path}`,
    })),
  } : null;

  return (
    <Helmet>
      <html lang="en-IN" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      }
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:image"       content={image} />
      <meta property="og:image:alt"   content={fullTitle} />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />

      {/* Breadcrumb schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}

      {/* Page-specific schema */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SEO from "../../components/SEO";
import HamburgerNav from "../../components/HamburgerNav";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import { getVendors } from "../../apis/vendorApi";
import NotFound from "../shared/NotFound";

const font = "'Outfit', sans-serif";

// ── Slug lookup maps ───────────────────────────────────────────────────────────

const SERVICE_MAP = {
  "decorator":           { type: "Decorator",         label: "Decorators",         plural: "decorators",          icon: "🎨", redirect: null },
  "caterer":             { type: "Caterer",            label: "Caterers",           plural: "caterers",            icon: "🍽️", redirect: null },
  "photographer":        { type: "Photographer",       label: "Photographers",      plural: "photographers",       icon: "📸", redirect: null },
  "dj":                  { type: "DJ",                 label: "DJs & Music",        plural: "DJs",                 icon: "🎵", redirect: null },
  "gift-hamper":         { type: "Gift Hamper",        label: "Gift Hampers",       plural: "gift hampers",        icon: "🎁", redirect: "/gift-hampers-cakes" },
  "fun-activities":      { type: "Fun Activities",     label: "Fun Activities",     plural: "fun activities",      icon: "🎯", redirect: "/fun-activities" },
  "wedding-stationery":  { type: "Wedding Stationery", label: "Wedding Stationery", plural: "stationery options",  icon: "💌", redirect: "/stationery" },
};

const CITY_MAP = {
  "delhi":         "Delhi",
  "ghaziabad":     "Ghaziabad",
  "noida":         "Noida",
  "greater-noida": "Greater Noida",
  "gurgaon":       "Gurgaon",
};

const BUDGET_MAP = {
  "under-20000":  { max: 20000,  label: "under ₹20,000",  display: "Under ₹20k" },
  "under-50000":  { max: 50000,  label: "under ₹50,000",  display: "Under ₹50k" },
  "under-1-lakh": { max: 100000, label: "under ₹1 Lakh",  display: "Under ₹1L" },
};

function parseSlug(slug) {
  if (!slug) return null;
  let budget = null;
  let remaining = slug;
  for (const [key, val] of Object.entries(BUDGET_MAP)) {
    if (slug.endsWith(`-${key}`)) {
      budget = { slug: key, ...val };
      remaining = slug.slice(0, -(key.length + 1));
      break;
    }
  }
  const inIdx = remaining.indexOf("-in-");
  if (inIdx === -1) return null;
  const serviceSlug = remaining.slice(0, inIdx);
  const citySlug = remaining.slice(inIdx + 4);
  const service = SERVICE_MAP[serviceSlug];
  const city = CITY_MAP[citySlug];
  if (!service || !city) return null;
  return { service, city, budget, serviceSlug, citySlug };
}

// ── Per-service content ────────────────────────────────────────────────────────

const VENDOR_CONTENT = {
  Decorator: {
    about: (city, budget) =>
      `Find verified event decorators in ${city}${budget ? ` ${budget.label}` : ""} on Tendr. From balloon birthday setups to floral anniversary arrangements and LED corporate backdrops — every decorator is reviewed by real customers with real event photos.`,
    tip: "Ask for full galleries from 3–4 recent events in a similar style to yours — not just portfolio highlights. A decorator's typical work differs from their best work, and that gap shows on your event day.",
    pricing: (city) =>
      `Event decoration in ${city} starts at ₹4,000 for basic balloon setups and goes up to ₹80,000+ for premium floral and LED arrangements. Birthday theme setups typically run ₹8,000–₹25,000. Anniversary setups with roses and candles range from ₹6,000–₹30,000. Corporate backdrop and stage decor usually starts at ₹15,000.`,
    faqs: (city, budget) => [
      {
        q: `How much does event decoration cost in ${city}?`,
        a: `Decoration in ${city} ranges from ₹4,000 for basic balloon setups to ₹80,000+ for premium floral and LED arrangements.${budget ? ` For budgets ${budget.label}, you can get well-designed themed setups for parties with 30–100 guests.` : ""} Pricing depends on theme, venue size, and number of props. Most decorators require a 40–50% advance at booking.`,
      },
      {
        q: `How far in advance should I book a decorator in ${city}?`,
        a: `In ${city}, weekend decorators book 3–6 weeks in advance — especially October to February. Weekday events usually have 1–2 week flexibility. Premium decorators with floral expertise or LED setups need 4–8 weeks. Always confirm with a written agreement, not just a chat message.`,
      },
      {
        q: "What does basic event decoration include?",
        a: "Basic decoration in Delhi NCR typically includes balloon arrangements, a themed backdrop, table centrepieces, and entry arch decoration. Floral walls, LED setups, custom cutouts, photo booths, and stage mandaps are charged separately. Always ask for a line-item quote before paying any advance — verbal inclusions get disputed on the day.",
      },
      {
        q: "Can decorators handle both balloons and fresh flowers?",
        a: `Some decorators in ${city} specialize in floral decoration and source fresh flowers from wholesale markets. Not all balloon decorators offer floral setups — ask specifically when enquiring. Floral decor typically costs 20–40% more in winter (December–February) due to higher demand.`,
      },
    ],
  },
  Caterer: {
    about: (city, budget) =>
      `Find verified caterers in ${city}${budget ? ` ${budget.label}` : ""} on Tendr. From North Indian buffets and live counters to customized menus for 20–500 guests — all caterers show real per-plate pricing, menu photos, and verified customer reviews.`,
    tip: "Always do a food tasting before finalising a caterer. Most established caterers offer this free. It's the only reliable way to judge food quality and hygiene beyond the photos — and it's your chance to confirm substitutions before signing the contract.",
    pricing: (city) =>
      `Catering in ${city} starts at ₹120–₹180 per plate for a basic 8-dish buffet and goes up to ₹500–₹800+ for premium menus with live counters and dessert stations. A typical 100-guest birthday party costs ₹20,000–₹40,000 including serving staff.`,
    faqs: (city, budget) => [
      {
        q: `What does catering cost per plate in ${city}?`,
        a: `Catering in ${city} costs ₹150–₹250 per plate for a standard North Indian buffet with 10–12 dishes. Premium menus with live counters run ₹350–₹600 per plate.${budget ? ` For budgets ${budget.label}, most caterers can offer a solid buffet for 50–150 guests with quality food and serving staff.` : ""} Confirm whether the price includes staff, crockery, and service charges.`,
      },
      {
        q: `Can caterers in ${city} handle 300+ guest events?`,
        a: `Yes — most established caterers in ${city} handle 100–2,000+ guests. For large events, book 4–6 weeks in advance and confirm equipment capacity and staff numbers. Ask for a client reference from a previous event of similar size. Always get a per-head breakdown in writing.`,
      },
      {
        q: "Do caterers provide serving staff and equipment?",
        a: "Most catering packages in Delhi NCR include serving staff, basic crockery, and chafing dishes. A good benchmark: 1 server per 15–20 guests for sit-down service, or 1 per 30–40 for buffet. Premium crockery and linen are sometimes charged extra.",
      },
      {
        q: "Can caterers accommodate Jain, vegan, or allergy-specific menus?",
        a: "Most experienced caterers in Delhi NCR handle Jain food and vegan menus with 1–2 weeks advance notice. Specific allergy-free cooking (nut-free, gluten-free) requires confirmation of a separate prep area. Always communicate dietary requirements in writing when signing the contract.",
      },
    ],
  },
  Photographer: {
    about: (city, budget) =>
      `Browse verified event photographers in ${city}${budget ? ` ${budget.label}` : ""} on Tendr. From birthday candid shoots to wedding coverage and corporate events — real portfolios, transparent pricing, and verified reviews so you can book with confidence.`,
    tip: "Ask to see 3–5 complete event albums — not just the 20 best shots from a reel. A full album shows how a photographer handles an entire event: pre-event setup, mid-event crowd shots, and final moments. That's where the real skill difference shows.",
    pricing: (city) =>
      `Event photography in ${city} starts at ₹4,000–₹8,000 for a 2-hour birthday shoot and goes up to ₹30,000–₹80,000 for full-day wedding coverage with edited delivery. Corporate event photography for 4–6 hours is typically ₹8,000–₹20,000.`,
    faqs: (city, budget) => [
      {
        q: `How much does event photography cost in ${city}?`,
        a: `Photography in ${city} ranges from ₹4,000 for a 2-hour birthday shoot to ₹80,000+ for full-day wedding coverage.${budget ? ` For budgets ${budget.label}, you can find professional candid photographers for birthdays, anniversaries, and corporate events with edited delivery.` : ""} Always confirm how many edited photos are included before signing.`,
      },
      {
        q: "What is the difference between candid and traditional photography?",
        a: "Traditional photography stages posed shots — family portraits and formal groups. Candid photography captures natural moments: laughter, reactions, and spontaneous interactions. Most Delhi NCR events now prefer candid or a combination of both. Wedding photography has almost entirely shifted to candid-first coverage.",
      },
      {
        q: "When will I receive my photos after the event?",
        a: "Most photographers in Delhi NCR deliver edited photos within 7–21 days. Confirm the turnaround time in writing. Clarify what's included: number of edited photos, highlight reel, online gallery, or USB. Cinematic videos typically take 3–5 weeks longer than photos.",
      },
      {
        q: "Do I need a separate photographer and videographer?",
        a: "Many photographers in Delhi NCR offer photo + video packages. For weddings, a 2-person team (1 photo, 1 video) is standard — solo coverage of both means constantly switching between stills and video, missing moments in both. For small birthdays, one person shooting both is usually fine.",
      },
    ],
  },
  DJ: {
    about: (city, budget) =>
      `Book verified DJs in ${city}${budget ? ` ${budget.label}` : ""} for birthdays, weddings, corporate parties, and get-togethers. Tendr's DJs bring their own professional sound systems, LED lighting, and curated playlists — a complete entertainment package without the logistics headache.`,
    tip: "Send your DJ a specific playlist of 15–20 must-play songs and 5 songs to never play, at least a week before the event. Don't just say 'Bollywood and EDM.' The more specific you are, the better the DJ can read the room and keep energy right throughout.",
    pricing: (city) =>
      `DJ pricing in ${city} starts from ₹7,000–₹12,000 for a 3–4 hour birthday setup with basic sound and lights. Premium wedding DJs with full sound systems, LED walls, and effects cost ₹40,000–₹80,000+. Corporate event DJs for 200+ guests typically run ₹20,000–₹50,000.`,
    faqs: (city, budget) => [
      {
        q: `How much does a DJ cost in ${city}?`,
        a: `DJ pricing in ${city} starts from ₹7,000 for a 3–4 hour birthday setup and goes up to ₹80,000+ for premium wedding DJs.${budget ? ` For budgets ${budget.label}, you can get a professional DJ with PA sound system and LED lights for indoor parties and birthdays.` : ""} Pricing depends on duration, sound system size, and add-ons like LED walls or fog machines.`,
      },
      {
        q: "Does the DJ bring their own sound system and equipment?",
        a: `Most DJs in ${city} include a basic PA sound system and LED uplighting. For large venues or open-air events with 200+ guests, confirm the wattage is adequate for your space — under-powered audio is one of the most common event complaints. Ask for speaker brand and wattage specs before booking.`,
      },
      {
        q: `How far in advance should I book a DJ for a wedding in ${city}?`,
        a: `For weddings in ${city} — especially October through February — book your DJ at least 6–8 weeks in advance. Weekend slots for popular DJs fill fast during December–January peak. For a birthday or small party, 1–2 weeks notice is usually enough. For multi-day weddings, book a separate DJ for each function.`,
      },
      {
        q: "Can the DJ also manage dinner background music?",
        a: "Yes — good DJs build a full progression: low-energy ambient music during dinner, building through classics as guests settle, peaking with dance music later. Brief them on dinner duration and energy curve you want. Confirm they also handle background music before guests arrive.",
      },
    ],
  },
};

const NON_VENDOR_CONTENT = {
  "Gift Hamper": {
    about: (city) =>
      `Looking for custom gift hampers and cake deliveries in ${city}? Tendr curates premium gift hampers for birthdays, anniversaries, corporate gifting, and weddings across ${city} and NCR — delivered to your venue or home.`,
    tip: "For corporate gifting orders above 20 units, confirm lead time and customization availability at least 2 weeks in advance. Bulk orders with custom branding need 3–4 weeks.",
  },
  "Fun Activities": {
    about: (city) =>
      `Planning fun activities for your event in ${city}? From photo booths and game stalls to live entertainment packages and team-building experiences — Tendr helps you add excitement to birthdays, corporate events, and parties across ${city}.`,
    tip: "For kids' birthday activities or team-building games, always confirm the facilitator's experience with your specific group size and age range before booking.",
  },
  "Wedding Stationery": {
    about: (city) =>
      `Find beautiful wedding stationery for your ${city} wedding on Tendr. Digital and print wedding invitations, menu cards, table name cards, welcome boards, and full stationery sets — all customized to your wedding theme and color palette.`,
    tip: "Order print stationery at least 3 weeks before your event to allow for design revisions, printing time, and delivery. Digital invitations can be turned around in 2–3 days.",
  },
};

const formatINR = (n) => "₹" + Number(n).toLocaleString("en-IN");

// ── Sub-components ─────────────────────────────────────────────────────────────

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", padding: "15px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", fontFamily: font, textAlign: "left", gap: 12 }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", flex: 1 }}>{q}</span>
        <span style={{ fontSize: 12, color: "#C47A2E", flexShrink: 0, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>⌄</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 15px", fontSize: 14, color: "#6b4c2a", lineHeight: 1.75 }}>{a}</div>
      )}
    </div>
  );
}

function VendorCard({ vendor, onClick }) {
  const photo = vendor.image || vendor.portfolioPhotos?.[0] || null;
  const price = vendor.price || vendor.startingPrice || null;
  const rating = vendor.rating || vendor.averageRating || null;
  const isVerified = vendor.isVerified || vendor.verified || false;

  return (
    <div
      onClick={onClick}
      className="vl-card"
      style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.12)", boxShadow: "0 2px 10px rgba(139,69,19,0.06)", overflow: "hidden", cursor: "pointer", fontFamily: font, transition: "all 0.2s" }}
    >
      {/* Image */}
      <div style={{ height: 180, background: "#f5ede0", overflow: "hidden", position: "relative" }}>
        {photo
          ? <img src={photo} alt={vendor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#C47A2E", opacity: 0.25 }}>📷</div>
        }
        {isVerified && (
          <div style={{ position: "absolute", top: 10, left: 10, background: "#C47A2E", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 100, letterSpacing: "0.04em" }}>
            ✓ Verified
          </div>
        )}
        {rating && (
          <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 100 }}>
            ⭐ {Number(rating).toFixed(1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "13px 14px 14px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{vendor.name}</div>
        <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 10 }}>
          {vendor.serviceType || ""}{(vendor.address?.city || vendor.city) ? ` · ${vendor.address?.city || vendor.city}` : ""}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {price
              ? <span style={{ fontSize: 14, fontWeight: 800, color: "#C47A2E" }}>Starting {formatINR(price)}</span>
              : <span style={{ fontSize: 12, color: "#9B7450" }}>Price on request</span>
            }
          </div>
          <div style={{ padding: "6px 14px", borderRadius: 8, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            View Profile →
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.08)", overflow: "hidden" }}>
      <div style={{ height: 180, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      <div style={{ padding: "13px 14px" }}>
        {[70, 50, 90].map((w, i) => (
          <div key={i} style={{ height: 12, width: `${w}%`, background: "#f0ebe3", borderRadius: 6, marginBottom: 10, animation: "shimmer 1.4s infinite" }} />
        ))}
        <div style={{ height: 32, background: "#f0ebe3", borderRadius: 8, animation: "shimmer 1.4s infinite" }} />
      </div>
    </div>
  );
}

// ── Pill / chip component ──────────────────────────────────────────────────────

function Pill({ label, active, to, onClick }) {
  const style = {
    display: "inline-flex", alignItems: "center",
    padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: active ? 700 : 500,
    border: `1.5px solid ${active ? "#C47A2E" : "rgba(196,122,46,0.22)"}`,
    background: active ? "rgba(196,122,46,0.1)" : "#fff",
    color: active ? "#C47A2E" : "#6b4c2a",
    textDecoration: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: font,
    transition: "all 0.15s",
  };
  if (to) return <Link to={to} style={style}>{label}</Link>;
  return <button onClick={onClick} style={{ ...style, border: style.border }}>{label}</button>;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function VendorLanding() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const parsed = parseSlug(slug);

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("rankingScore");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    if (!parsed || parsed.service.redirect) return;
    setLoading(true);
    getVendors({
      location: parsed.city,
      serviceTypes: [parsed.service.type],
      ...(parsed.budget && { maxPrice: parsed.budget.max }),
      sortBy,
      sortOrder,
      page: 1,
      limit: 16,
    })
      .then(data => setVendors(data.vendors || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [slug, sortBy, sortOrder]); // eslint-disable-line

  if (!parsed) return <NotFound />;

  const { service, city, budget, serviceSlug, citySlug } = parsed;
  const details = VENDOR_CONTENT[service.type];
  const nonVendorDetails = NON_VENDOR_CONTENT[service.type];
  const budgetStr = budget ? ` ${budget.label}` : "";

  const seoTitle = `${service.label} in ${city}${budgetStr} — Book Verified ${service.label} | Tendr`;
  const seoDescription = `Find the best ${service.plural} in ${city}${budgetStr} on Tendr. Real photos, transparent pricing, and customer reviews. Book top-rated ${service.plural} for birthdays, weddings, and corporate events in ${city}.`;

  const faqSchema = details ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": details.faqs(city, budget).map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  } : null;

  const otherCities = Object.entries(CITY_MAP).filter(([, c]) => c !== city);
  const budgetVariants = Object.entries(BUDGET_MAP);

  // ── Non-vendor service page ────────────────────────────────────────────────
  if (service.redirect) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
        <SEO
          title={seoTitle}
          description={seoDescription}
          path={`/${slug}`}
          breadcrumbs={[{ name: "Home", path: "/" }, { name: service.label, path: service.redirect }]}
        />
        <BasicSpeedDial />
        <HamburgerNav active="Browse" showBack />

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9B7450", marginBottom: 20 }}>
            <Link to="/" style={{ color: "#9B7450", textDecoration: "none" }}>Home</Link>
            <span>›</span>
            <span style={{ color: "#C47A2E", fontWeight: 600 }}>{service.label}</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 28, marginRight: 10 }}>{service.icon}</span>
            <h1 style={{ display: "inline", fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em" }}>
              {service.label} in {city}
            </h1>
            <p style={{ fontSize: 14, color: "#6b4c2a", lineHeight: 1.65, marginTop: 10, maxWidth: 600 }}>
              {nonVendorDetails?.about(city)}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate(service.redirect)}
            style={{ padding: "13px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.3)", marginBottom: 32 }}
          >
            Browse {service.label} →
          </button>

          {nonVendorDetails?.tip && (
            <div style={{ background: "rgba(196,122,46,0.06)", borderRadius: 14, padding: "18px 20px", border: "1.5px solid rgba(196,122,46,0.18)", marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>Pro tip</p>
              <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.75, margin: 0 }}>{nonVendorDetails.tip}</p>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 10 }}>{service.label} in other cities</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {otherCities.map(([cs, cn]) => (
                <Pill key={cs} label={`${service.label} in ${cn}`} to={`/${serviceSlug}-in-${cs}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vendor service page ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title={seoTitle}
        description={seoDescription}
        path={`/${slug}`}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: service.label, path: `/listings?serviceType=${service.type}` },
          { name: city, path: `/${serviceSlug}-in-${citySlug}` },
        ]}
        schema={faqSchema}
      />
      <BasicSpeedDial />
      <HamburgerNav active="Browse" showBack />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 16px calc(80px + env(safe-area-inset-bottom, 0px))" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9B7450", marginBottom: 12 }}>
          <Link to="/" style={{ color: "#9B7450", textDecoration: "none" }}>Home</Link>
          <span style={{ opacity: 0.5 }}>›</span>
          <Link to={`/listings?serviceType=${service.type}`} style={{ color: "#9B7450", textDecoration: "none" }}>{service.label}</Link>
          <span style={{ opacity: 0.5 }}>›</span>
          <span style={{ color: "#C47A2E", fontWeight: 600 }}>{city}{budget ? ` · ${budget.display}` : ""}</span>
        </div>

        {/* H1 */}
        <h1 style={{ fontFamily: font, fontWeight: 800, fontSize: "clamp(1.4rem,3vw,1.9rem)", color: "#1a1a1a", margin: "0 0 4px", lineHeight: 1.2, textDecoration: "underline", textDecorationColor: "rgba(196,122,46,0.4)", textUnderlineOffset: 6 }}>
          {service.label} in {city}{budget ? ` · ${budget.display}` : ""}
        </h1>
        <p style={{ fontSize: 13, color: "#7a5535", lineHeight: 1.55, margin: "0 0 16px", maxWidth: 620 }}>
          {details?.about(city, budget)}
        </p>

        {/* Filter toolbar card */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.13)", padding: "14px 16px", marginBottom: 14, boxShadow: "0 1px 6px rgba(139,69,19,0.06)" }}>

          {/* City row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>City</span>
            <div className="vl-pill-row" style={{ display: "flex", gap: 6, overflowX: "auto", flex: 1 }}>
              <Pill label="All" active={false} to={`/listings?serviceType=${service.type}`} />
              {Object.entries(CITY_MAP).map(([cs, cn]) => (
                <Pill key={cs} label={cn} active={cn === city}
                  to={`/${serviceSlug}-in-${cs}${budget ? `-${budget.slug}` : ""}`} />
              ))}
            </div>
          </div>

          {/* Budget row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>Budget</span>
            <div className="vl-pill-row" style={{ display: "flex", gap: 6, overflowX: "auto", flex: 1 }}>
              <Pill label="Any" active={!budget} to={`/${serviceSlug}-in-${citySlug}`} />
              {budgetVariants.map(([bs, bv]) => (
                <Pill key={bs} label={bv.display} active={budget?.slug === bs}
                  to={`/${serviceSlug}-in-${citySlug}-${bs}`} />
              ))}
            </div>
          </div>

          {/* Sort + CTA row */}
          <div className="vl-sort-row" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#9B7450" }}>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ fontFamily: font, fontSize: 12, padding: "4px 10px", borderRadius: 100, border: "1px solid rgba(196,122,46,0.35)", background: "#F8F4EF", color: "#4a2c0e", cursor: "pointer", outline: "none" }}>
              <option value="rankingScore">Best Match</option>
              <option value="rating">Rating</option>
              <option value="price">Price</option>
            </select>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
              style={{ fontFamily: font, fontSize: 12, padding: "4px 10px", borderRadius: 100, border: "1px solid rgba(196,122,46,0.35)", background: "#F8F4EF", color: "#4a2c0e", cursor: "pointer", outline: "none" }}>
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => navigate(`/listings?serviceType=${service.type}&location=${city}`)}
                style={{ padding: "6px 14px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.3)", background: "#F8F4EF", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}
              >
                All {service.plural} in {city} →
              </button>
              <button
                onClick={() => navigate("/booking")}
                style={{ padding: "6px 16px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(196,122,46,0.3)" }}
              >
                Plan my event →
              </button>
            </div>
          </div>
        </div>

        {/* How to book strip */}
        {showHint && (
          <div style={{ background: "linear-gradient(135deg,rgba(196,122,46,0.08),rgba(204,171,74,0.04))", border: "1.5px solid rgba(196,122,46,0.18)", borderRadius: 10, padding: "9px 14px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11.5, color: "#7A4A1A", fontWeight: 700 }}>💡 How to book:</span>
              <button onClick={() => setShowHint(false)} style={{ background: "none", border: "none", color: "#9B7450", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 5, overflowX: "auto", scrollbarWidth: "none", alignItems: "center" }}>
              {[
                { label: "1. Quick View" }, { sep: true },
                { label: "2. Request to Chat" }, { sep: true },
                { label: "3. Finalise Vendor" }, { sep: true },
                { label: "4. Review & Pay" }
              ].map((item, i) =>
                item.sep ? (
                  <span key={i} style={{ color: "rgba(196,122,46,0.35)", fontSize: 10, flexShrink: 0 }}>›</span>
                ) : (
                  <span key={i} style={{ background: "rgba(196,122,46,0.12)", color: "#7A4020", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 100, whiteSpace: "nowrap", flexShrink: 0, border: "1px solid rgba(196,122,46,0.18)" }}>
                    {item.label}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Vendor count label */}
        <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 14 }}>
          {loading
            ? `Finding ${service.plural} in ${city}…`
            : vendors.length > 0
              ? `${vendors.length} ${service.plural} found in ${city}${budgetStr}`
              : `${service.label} in ${city}`
          }
        </div>

        {/* Vendor grid */}
        <div className="vl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 14, marginBottom: 28 }}>
          {loading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
            : vendors.length > 0
              ? vendors.map(v => <VendorCard key={v._id} vendor={v} onClick={() => navigate(`/vendor/${v._id}`)} />)
              : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 20px" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                  <p style={{ fontSize: 14, color: "#9B7450", marginBottom: 16 }}>
                    No vendors listed here yet. Browse all {service.plural} or try a nearby city.
                  </p>
                  <button onClick={() => navigate(`/listings?serviceType=${service.type}`)}
                    style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    Browse All {service.label} →
                  </button>
                </div>
              )
          }
        </div>

        {/* CTA row below grid */}
        {vendors.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate(`/listings?serviceType=${service.type}&location=${city}`)}
              style={{ padding: "11px 28px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}
            >
              See all {service.plural} in {city} →
            </button>
            <button
              onClick={() => navigate("/booking")}
              style={{ padding: "11px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}
            >
              Plan your event →
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: "1.5px solid rgba(196,122,46,0.1)", marginBottom: 28 }} />

        {/* Pricing guide + Pro tip — side by side on desktop */}
        <div className="vl-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
          {details?.pricing && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1.5px solid rgba(196,122,46,0.12)" }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px" }}>
                💰 Pricing guide — {service.label} in {city}
              </h2>
              <p style={{ fontSize: 13, color: "#6b4c2a", lineHeight: 1.7, margin: 0 }}>{details.pricing(city)}</p>
            </div>
          )}
          {details?.tip && (
            <div style={{ background: "rgba(196,122,46,0.05)", borderRadius: 14, padding: "20px", border: "1.5px solid rgba(196,122,46,0.15)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Pro tip</p>
              <p style={{ fontSize: 13, color: "#5a3a1a", lineHeight: 1.7, margin: 0 }}>{details.tip}</p>
            </div>
          )}
        </div>

        {/* FAQs */}
        {details?.faqs && (
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", marginBottom: 12 }}>
              Frequently asked questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {details.faqs(city, budget).map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        )}

        <div style={{ borderTop: "1.5px solid rgba(196,122,46,0.1)", marginBottom: 20 }} />

        {/* Combined cross-links: all city × budget combinations in one scrollable row */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 10 }}>
            Also browse {service.label}
          </h3>
          <div className="vl-crosslinks" style={{ display: "flex", gap: 8, overflowX: "auto", flexWrap: "wrap" }}>
            {Object.entries(CITY_MAP).map(([cs, cn]) => {
              const isCurrentCity = cn === city;
              return [
                // City with no budget
                <Pill
                  key={`${cs}-all`}
                  label={`${cn}`}
                  active={isCurrentCity && !budget}
                  to={`/${serviceSlug}-in-${cs}`}
                />,
                // City + each budget
                ...budgetVariants.map(([bs, bv]) => (
                  <Pill
                    key={`${cs}-${bs}`}
                    label={`${cn} · ${bv.display}`}
                    active={isCurrentCity && budget?.slug === bs}
                    to={`/${serviceSlug}-in-${cs}-${bs}`}
                  />
                )),
              ];
            })}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .vl-card:hover { box-shadow: 0 6px 22px rgba(196,122,46,0.14) !important; transform: translateY(-2px) !important; }
        .vl-pill-row, .vl-crosslinks { scrollbar-width: none; }
        .vl-pill-row::-webkit-scrollbar, .vl-crosslinks::-webkit-scrollbar { display: none; }
        @media(max-width:640px) {
          .vl-grid { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
          .vl-info-grid { grid-template-columns: 1fr !important; }
          .vl-sort-row { flex-wrap: wrap !important; }
          .vl-sort-row > div[style*="margin-left"] { margin-left: 0 !important; width: 100%; }
          .vl-sort-row > div[style*="margin-left"] button { flex: 1; }
        }
        @media(max-width:360px) {
          .vl-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

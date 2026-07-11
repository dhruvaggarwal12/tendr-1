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
  "under-20000":  { max: 20000,  label: "under ₹20,000",  display: "₹20,000" },
  "under-50000":  { max: 50000,  label: "under ₹50,000",  display: "₹50,000" },
  "under-1-lakh": { max: 100000, label: "under ₹1 Lakh",  display: "₹1 Lakh" },
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
    <div style={{ background: "#FFFCF5", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", fontFamily: font, textAlign: "left", gap: 12 }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", flex: 1 }}>{q}</span>
        <span style={{ fontSize: 14, color: "#C47A2E", flexShrink: 0, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>↓</span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 16px", fontSize: 14, color: "#9B7450", lineHeight: 1.75 }}>{a}</div>
      )}
    </div>
  );
}

function VendorCard({ vendor, onClick }) {
  const photo = vendor.image || vendor.portfolioPhotos?.[0] || null;
  const price = vendor.price || vendor.startingPrice || null;
  return (
    <div
      onClick={onClick}
      style={{ background: "#FFFCF5", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 16px rgba(139,69,19,0.07)", overflow: "hidden", cursor: "pointer", fontFamily: font, transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 3px 16px rgba(139,69,19,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ height: 160, background: "#f0e8d8", overflow: "hidden" }}>
        {photo
          ? <img src={photo} alt={vendor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "#C47A2E", opacity: 0.4 }}>📷</div>
        }
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{vendor.name}</div>
        <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 10 }}>
          {vendor.serviceType || ""}{(vendor.address?.city || vendor.city) ? ` · ${vendor.address?.city || vendor.city}` : ""}
        </div>
        <div style={{ marginBottom: 12 }}>
          {price
            ? <span style={{ fontSize: 14, fontWeight: 800, color: "#C47A2E" }}>Starting {formatINR(price)}</span>
            : <span style={{ fontSize: 12, color: "#9B7450" }}>Price on request</span>
          }
        </div>
        <div style={{ padding: "8px", borderRadius: 10, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
          View Profile →
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#FFFCF5", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.1)", overflow: "hidden" }}>
      <div style={{ height: 160, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      <div style={{ padding: "14px 16px" }}>
        {[80, 55, 40, "100%"].map((w, i) => (
          <div key={i} style={{ height: i === 3 ? 34 : 12, width: w, background: "#f0ebe3", borderRadius: i === 3 ? 10 : 8, marginBottom: i < 3 ? 10 : 0, animation: "shimmer 1.4s infinite" }} />
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function VendorLanding() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const parsed = parseSlug(slug);

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parsed || parsed.service.redirect) return;
    setLoading(true);
    getVendors({
      location: parsed.city,
      serviceTypes: [parsed.service.type],
      ...(parsed.budget && { maxPrice: parsed.budget.max }),
      sortBy: "rankingScore",
      sortOrder: "desc",
      page: 1,
      limit: 12,
    })
      .then(data => setVendors(data.vendors || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [slug]); // eslint-disable-line

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

  // ── Non-vendor service page (Gift Hampers / Fun Activities / Wedding Stationery) ──
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
        <HamburgerNav />

        <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "clamp(28px,5vw,56px) 24px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <span style={{ fontSize: 52 }}>{service.icon}</span>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, color: "#fff", margin: "14px 0 10px", letterSpacing: "-0.02em" }}>
              {service.label} in {city}
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", maxWidth: 520, margin: "0 auto 28px" }}>
              {nonVendorDetails?.about(city)}
            </p>
            <button
              onClick={() => navigate(service.redirect)}
              style={{ padding: "14px 36px", borderRadius: 14, border: "none", background: "#fff", color: "#C47A2E", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}
            >
              Browse {service.label} →
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
          {nonVendorDetails?.tip && (
            <div style={{ background: "linear-gradient(135deg,rgba(196,122,46,0.07),rgba(204,171,74,0.05))", borderRadius: 18, padding: "22px 24px", border: "1.5px solid rgba(196,122,46,0.2)", marginBottom: 32 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>Pro tip</p>
              <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.75, margin: 0 }}>{nonVendorDetails.tip}</p>
            </div>
          )}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 10 }}>{service.label} in other cities</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {otherCities.map(([cs, cn]) => (
                <Link key={cs} to={`/${serviceSlug}-in-${cs}`}
                  style={{ padding: "6px 16px", borderRadius: 100, background: "#FFFCF5", border: "1.5px solid rgba(196,122,46,0.2)", fontSize: 13, fontWeight: 600, color: "#C47A2E", textDecoration: "none" }}>
                  {service.label} in {cn}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vendor service page (Decorator / Caterer / Photographer / DJ) ──
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
      <HamburgerNav />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "clamp(24px,5vw,48px) 24px clamp(28px,5vw,52px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
            {city} · {service.label}
          </p>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            {service.label} in {city}{budgetStr}
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", maxWidth: 580, margin: "0 0 20px", lineHeight: 1.6 }}>
            {details?.about(city, budget)}
          </p>
          {budget && (
            <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ padding: "5px 14px", borderRadius: 100, background: "rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                Budget {budget.label}
              </span>
              <span style={{ padding: "5px 14px", borderRadius: 100, background: "rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                📍 {city}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px calc(80px + env(safe-area-inset-bottom, 0px))" }}>

        {/* Vendor grid */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", marginBottom: 16 }}>
          {loading
            ? `Finding ${service.plural} in ${city}…`
            : vendors.length > 0
              ? `${vendors.length} ${service.plural} found in ${city}${budgetStr}`
              : `${service.label} in ${city}`
          }
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }} className="vl-grid">
          {loading
            ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
            : vendors.length > 0
              ? vendors.map(v => <VendorCard key={v._id} vendor={v} onClick={() => navigate(`/vendor/${v._id}`)} />)
              : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 20px" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <p style={{ fontSize: 14, color: "#9B7450", marginBottom: 16 }}>
                    No vendors listed in this category yet. Browse all {service.plural} or try a different city.
                  </p>
                  <button onClick={() => navigate("/listings")}
                    style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    Browse All Vendors →
                  </button>
                </div>
              )
          }
        </div>

        {vendors.length > 0 && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <button
              onClick={() => navigate(`/listings?serviceType=${service.type}`)}
              style={{ padding: "12px 32px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}
            >
              See all {service.plural} →
            </button>
          </div>
        )}

        {/* Pricing guide */}
        {details?.pricing && (
          <div style={{ background: "#FFFCF5", borderRadius: 18, padding: "24px", border: "1.5px solid rgba(196,122,46,0.15)", marginBottom: 16, boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px" }}>
              Pricing guide: {service.label} in {city}
            </h2>
            <p style={{ fontSize: 14, color: "#9B7450", lineHeight: 1.75, margin: 0 }}>{details.pricing(city)}</p>
          </div>
        )}

        {/* Pro tip */}
        {details?.tip && (
          <div style={{ background: "linear-gradient(135deg,rgba(196,122,46,0.07),rgba(204,171,74,0.05))", borderRadius: 18, padding: "22px 24px", border: "1.5px solid rgba(196,122,46,0.2)", marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>Pro tip</p>
            <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.75, margin: 0 }}>{details.tip}</p>
          </div>
        )}

        {/* FAQs */}
        {details?.faqs && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", marginBottom: 14 }}>
              Frequently asked questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {details.faqs(city, budget).map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        )}

        {/* Cross-links: other cities */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 10 }}>
            {service.label} in other cities
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {otherCities.map(([cs, cn]) => (
              <Link key={cs} to={`/${serviceSlug}-in-${cs}${budget ? `-${budget.slug}` : ""}`}
                style={{ padding: "6px 16px", borderRadius: 100, background: "#FFFCF5", border: "1.5px solid rgba(196,122,46,0.2)", fontSize: 13, fontWeight: 600, color: "#C47A2E", textDecoration: "none" }}>
                {service.label} in {cn}
              </Link>
            ))}
          </div>
        </div>

        {/* Cross-links: budget variants */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 10 }}>
            Browse {service.label} by budget in {city}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link to={`/${serviceSlug}-in-${citySlug}`}
              style={{ padding: "6px 16px", borderRadius: 100, background: !budget ? "rgba(196,122,46,0.12)" : "#FFFCF5", border: `1.5px solid ${!budget ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, fontSize: 13, fontWeight: 600, color: "#C47A2E", textDecoration: "none" }}>
              All budgets
            </Link>
            {budgetVariants.map(([bs, bv]) => (
              <Link key={bs} to={`/${serviceSlug}-in-${citySlug}-${bs}`}
                style={{ padding: "6px 16px", borderRadius: 100, background: budget?.slug === bs ? "rgba(196,122,46,0.12)" : "#FFFCF5", border: `1.5px solid ${budget?.slug === bs ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, fontSize: 13, fontWeight: 600, color: "#C47A2E", textDecoration: "none" }}>
                {bv.label}
              </Link>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media(max-width:480px) { .vl-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; } }
        @media(max-width:360px) { .vl-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

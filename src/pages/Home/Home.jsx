// src/pages/Home/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate as useNav, useSearchParams } from "react-router-dom";
import PageTour from "../../components/PageTour";
import { GUIDES } from "../guides/guideData";
import SEO from "../../components/SEO";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";
import PlatformFlow from "../../components/PlatformFlow";
import OccasionPlanner from "../../components/OccasionPlanner";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import Footer from "../../components/Footer";
import { easeIn, motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import corpo from "../../assets/ui/corpo.jpg";
import celebrationKit from "../../assets/ui/celebration-kit.jpeg";
import heroCorporate from "../../assets/ui/hero-corporate.png";
import heroHouseParty from "../../assets/ui/hero-house-party.png";
import heroAnniversary from "../../assets/ui/hero-anniversary.png";
import heroBirthday from "../../assets/ui/hero-birthday.png";
import heroFestive from "../../assets/ui/hero-festive.png";
import CorporateLogin from "../../components/corporateEventPlanning.jsx";
import JourneyFlow from "../../components/JourneyFlow";

// WhatsApp icon
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "../../components/Navbar.jsx";
import SelectedVendorsFloat from "../../components/SelectedVendorsFloat";
import { useSelector } from "react-redux";
import { FUN_ACTIVITIES } from "../../data/funActivitiesData";

const FunActivitiesLazy = React.lazy(() => import("../../components/FunActivitiesSection"));

const HERO_FEATURES = [
  {
    tag: "Budget Allocator",
    headline: "Split your budget across every category",
    desc: "Divide your total budget across catering, decor, photography, DJ and more — and track every rupee in real time.",
    where: "Planning Tools → Budget Allocator",
    href: "/budget-picker",
    emoji: "💰",
  },
  {
    tag: "Gift Hampers & Cakes",
    headline: "Custom gift hampers delivered to your door",
    desc: "Order personalised gift hampers, celebration cakes and curated kits for birthdays, anniversaries and every occasion.",
    where: "Gift Hampers & Cakes",
    href: "/gift-hampers-cakes",
    emoji: "🎁",
  },
  {
    tag: "Tendr Celebration Kit",
    headline: "Everything you need — packed in one kit",
    desc: "Curated decoration kits delivered to your doorstep so you can set the vibe in minutes, no vendor needed.",
    where: "Home → Tendr Celebration Kit",
    href: "/",
    emoji: "🎊",
  },
  {
    tag: "Wedding Stationery",
    headline: "Design beautiful stationery for your wedding",
    desc: "Create custom wedding invitations, menus and stationery with our ready-made designer templates.",
    where: "Memories → Wedding Stationery",
    href: "/stationery",
    emoji: "💌",
  },
  {
    tag: "Wedding Stationery",
    headline: "Beautiful stationery for every celebration",
    desc: "From invitations to menus and table cards — order premium printed stationery delivered to your door.",
    where: "Wedding Stationery",
    href: "/stationery",
    emoji: "💍",
  },
  // { tag: "Decor Finder", headline: "Discover your perfect decoration theme", href: "/decor-finder", emoji: "🎨" }, // disabled
  {
    tag: "For Vendors",
    headline: "Register your business & get booked on Tendr",
    desc: "List your services on Delhi NCR's fastest-growing event platform and connect directly with verified customers.",
    where: "Vendors → Register as Vendor",
    href: "/vendor/register",
    emoji: "🏪",
  },
];

const CELEBRATION_PHOTOS = [
  { url: heroBirthday,    label: "Birthday Celebration" },
  { url: heroAnniversary, label: "Anniversary Decoration" },
  { url: heroHouseParty,  label: "House Party" },
  { url: heroFestive,     label: "Festive Celebration" },
  { url: heroCorporate,   label: "Corporate Event" },
];

const FAQS = [
  { q: "Is Tendr free to use?", a: "Browsing vendors, saving favourites and filling your event form is completely free. You only pay when you confirm your booking and proceed to payment." },
  { q: "What is the difference between 'I'll Find My Vendors' and 'Tendr Plans It For Me'?", a: "'I'll Find My Vendors' lets you browse and shortlist vendors yourself, then chat with them to confirm pricing. 'Tendr Plans It For Me' means our concierge team selects the right vendors for your event and handles the coordination — you just review and approve." },
  { q: "How do I know if vendors are trustworthy?", a: "Every vendor on Tendr goes through a manual verification process before being listed. They are checked for legitimacy, experience and service quality. You can also see their ratings, years of experience and portfolio before reaching out." },
  { q: "When do I pay, and is my payment safe?", a: "Payment happens only after you have chatted with vendors, reviewed the full price breakdown and confirmed everything. We never charge before you are satisfied with the quote." },
  { q: "What if I need to cancel my booking?", a: "You can raise a change request or cancellation directly from your dashboard. Our team will guide you through the process. Refer to our Cancellation Policy for details on refunds." },
  { q: "How long does it take to get vendor quotes?", a: "Once your chat is approved, most vendors respond within a few hours. Price confirmation typically happens within 24–48 hours of starting the conversation." },
  { q: "What cities does Tendr currently serve?", a: "We currently operate across Delhi, Noida, Greater Noida and Ghaziabad — covering all major event venues across the NCR region." },
  { q: "What happens if there is no activity on my chat for 24 hours?", a: "If neither you nor the vendor sends a message for 24 hours, the chat request and conversation are automatically removed from our system and your booking moves to Cancelled status. This keeps our platform clean and responsive. Simply start a new chat request if you would like to reconnect with the vendor." },
  { q: "How do I open a chat with a vendor I was already talking to?", a: "Go to your Dashboard → Chats tab to see all your active vendor conversations and open them directly. You can also click the 💛 Saved Vendors icon in the top-right corner and tap 'Chat' next to any saved vendor. Alternatively, visit the vendor's profile page and click 'Request to Chat' to start a new conversation." },
];

function TipsByTendrSection() {
  const navigate = useNav();
  const font = "'Outfit', sans-serif";
  const preview = GUIDES.slice(0, 3);
  return (
    <section style={{ background: "#070B14", padding: "72px 24px 80px", fontFamily: font, position: "relative", overflow: "hidden" }}>
      {/* Subtle glow blobs */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,122,46,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 100, padding: "5px 14px", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4F8EF7", textTransform: "uppercase", letterSpacing: "0.14em" }}>Tips by Tendr</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 400, color: "#FFFFFF", letterSpacing: "0.01em", lineHeight: 1.15, margin: "0 0 8px" }}>
              Free Event Planning Guides
            </h2>
            <p style={{ fontSize: 15, color: "#7A8BA8", margin: 0, lineHeight: 1.65, maxWidth: 480 }}>
              Practical guides for budgeting, decorating, and planning any event. Unlock with a WhatsApp number.
            </p>
          </div>
          <button
            onClick={() => navigate("/guides")}
            style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid rgba(79,142,247,0.3)", background: "transparent", color: "#4F8EF7", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            View All Guides →
          </button>
        </div>

        {/* Guide cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {preview.map((guide) => (
            <div
              key={guide.slug}
              onClick={() => navigate(`/guides/${guide.slug}`)}
              style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "24px 22px 20px", cursor: "pointer", transition: "transform 0.2s, border-color 0.2s", position: "relative", overflow: "hidden" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = `${guide.theme.accent}40`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: guide.theme.accent, opacity: 0.7 }} />
              <div style={{ fontSize: 32, marginBottom: 12, lineHeight: 1 }}>{guide.coverEmoji}</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: guide.theme.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{guide.tags[0]}</div>
              <h3 style={{ fontSize: 16.5, fontWeight: 700, color: "#FFFFFF", margin: "0 0 6px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>{guide.title}</h3>
              <p style={{ fontSize: 12.5, color: "#7A8BA8", margin: "0 0 16px", lineHeight: 1.6 }}>{guide.subtitle}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11.5, color: "#4A5E7A" }}>{guide.readTime} · {guide.pages}pp</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: guide.theme.accent }}>Free →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Community row */}
        <div
          onClick={() => navigate("/community")}
          style={{ marginTop: 20, padding: "18px 24px", borderRadius: 16, border: "1px solid rgba(196,122,46,0.15)", background: "rgba(196,122,46,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, transition: "border-color 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(196,122,46,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28 }}>💬</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>Community Wall</div>
              <div style={{ fontSize: 12.5, color: "#7A8BA8", marginTop: 2 }}>See real events shared by customers — photos, setups, and ideas.</div>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#C47A2E" }}>Explore →</span>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = React.useState(null);
  const navigate = useNavigate();
  return (
    <section style={{ background: "linear-gradient(180deg,#FFF8F0 0%,#F0EBE3 100%)", padding: "88px 24px 96px", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 12px" }}>Got Questions?</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 400, color: "#2C1A0E", letterSpacing: "0.01em", margin: "0 0 12px", lineHeight: 1.15 }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: 15, color: "#6B4226", maxWidth: 460, margin: "0 auto" }}>
            Everything you need to know before you start planning your celebration.
          </p>
        </div>

        {/* FAQ items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map(({ q, a }, i) => (
            <div key={i}
              style={{
                background: "#FFFCF5",
                borderRadius: 16,
                border: `1.5px solid ${open === i ? "#C47A2E" : "rgba(196,122,46,0.14)"}`,
                overflow: "hidden",
                transition: "border-color 0.22s, box-shadow 0.22s",
                boxShadow: open === i ? "0 6px 24px rgba(196,122,46,0.12)" : "0 2px 8px rgba(139,69,19,0.04)",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: open === i ? "rgba(196,122,46,0.03)" : "none", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "left", gap: 16 }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 8, padding: "3px 8px", flexShrink: 0, marginTop: 2, letterSpacing: "0.04em" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: "#2C1A0E", lineHeight: 1.45 }}>{q}</span>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: open === i ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.25s",
                }}>
                  <span style={{ fontSize: 16, color: open === i ? "#fff" : "#C47A2E", fontWeight: 700, lineHeight: 1, transform: open === i ? "rotate(45deg)" : "rotate(0)", display: "inline-block", transition: "transform 0.25s ease" }}>+</span>
                </div>
              </button>
              <div style={{ maxHeight: open === i ? 400 : 0, overflow: "hidden", transition: "max-height 0.38s cubic-bezier(0.4,0,0.2,1)" }}>
                <div style={{ borderLeft: "3px solid #C47A2E", margin: "0 24px 20px 58px", paddingLeft: 16 }}>
                  <p style={{ margin: 0, fontSize: 14.5, color: "#6B4226", lineHeight: 1.75 }}>{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div style={{ textAlign: "center", marginTop: 44, padding: "28px 24px", background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 4px 20px rgba(139,69,19,0.06)" }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#2C1A0E", margin: "0 0 6px" }}>Still have questions?</p>
          <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 18px" }}>Our team is happy to help you plan your perfect event.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://wa.me/919211668427" target="_blank" rel="noopener noreferrer"
              style={{ padding: "10px 24px", borderRadius: 10, background: "#25d366", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
              💬 WhatsApp Us
            </a>
            <button onClick={() => navigate("/contact-us")}
              style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Contact Us →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

const BASE_URL = import.meta.env.VITE_BASE_URL;

const GH_FALLBACKS = [
  { _id: "f1", name: "Birthday Surprise Box", category: "Gift Box",    pricePerUnit: 1299, images: ["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=75"] },
  { _id: "f2", name: "Anniversary Hamper",    category: "Hamper",      pricePerUnit: 1899, images: ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=75"] },
  { _id: "f3", name: "Wedding Sweet Box",     category: "Sweet Box",   pricePerUnit: 899,  images: ["https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=75"] },
  { _id: "f4", name: "Celebration Cake",      category: "Cake",        pricePerUnit: 1499, images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=75"] },
  { _id: "f5", name: "Corporate Gift Set",    category: "Corporate",   pricePerUnit: 2499, images: ["https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&q=75"] },
  { _id: "f6", name: "Premium Gift Hamper",   category: "Hamper",      pricePerUnit: 3499, images: ["https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=75"] },
];

const GALLERY_FALLBACKS = {
  "Decoration":        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&h=400&q=80",
  "Entertainment":     "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&h=400&q=80",
  "Catering":          "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&h=400&q=80",
  "Photography":       "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&h=400&q=80",
  "Full Event Setup":  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&h=400&q=80",
  "Corporate Events":  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&h=400&q=80",
};

const Home = () => {
  const navigate = useNavigate();
  const bookingType = useSelector((s) => s.eventPlanning.bookingType);
  const formEventName = useSelector((s) => s.eventPlanning.formData.eventName);
  const showVendorScreen = useSelector((s) => s.eventPlanning.showVendorScreen);
  const { user } = useSelector((s) => s.auth);
  const formData = useSelector((s) => s.eventPlanning.formData);
  const hasEventDetails = !!(formData.eventType && formData.guests && formData.date && formData.location);

  const handlePlanEvent = () => {
    // If form already filled and service screen was shown, go back to service selection
    if (bookingType && formEventName) {
      navigate("/plan-event/form");
    } else {
      navigate("/booking");
    }
  };

  const [scrolled, setScrolled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    // Hide if already installed
    window.addEventListener('appinstalled', () => setShowInstall(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
    setInstallPrompt(null);
  };

  const [heroSearch, setHeroSearch] = useState("");
  const handleHeroSearch = (e) => {
    e.preventDefault();
    const q = heroSearch.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPrev, setHeroPrev] = useState(null);
  const [heroFading, setHeroFading] = useState(false);
  const [galleryByCategory, setGalleryByCategory] = useState({});
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [ghSamplePhotos, setGhSamplePhotos] = useState([]);
  const [glimpseCounter, setGlimpseCounter] = useState(0);
  const [featureIdx, setFeatureIdx]   = useState(0);
  const [featureVisible, setFeatureVisible] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);
  const faCarouselRef = useRef(null);
  const occRef = useRef(null);
  const [htwStep, setHtwStep] = useState(0);
  const [faModal, setFaModal] = useState(null);
  const [vendorStripOpen, setVendorStripOpen] = useState(false);
  const [ghProducts, setGhProducts] = useState([]);
  const ghCarouselRef = useRef(null);
  const [plannerOccasion, setPlannerOccasion] = useState(null); // null = closed, "" = all-occasions, string = specific occasion
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const occ = searchParams.get("occasion");
    if (occ) setPlannerOccasion(occ);
  }, []);
  const scrollFaCarousel = (dir) => {
    const el = faCarouselRef.current;
    if (!el) return;
    const card = el.querySelector(".fa-carousel-card");
    const cardW = card ? card.offsetWidth + 16 : 220;
    el.scrollBy({ left: dir * cardW, behavior: "smooth" });
  };

  const FEATURE_SLIDES = [
    { id: "smart-planner",  tag: "Smart Planner",        icon: "✨", iconBg: "linear-gradient(135deg,#C47A2E,#CCAB4A)", headline: "Your complete vendor package, built in seconds",          desc: "Tell us your event once. We match caterers, decorators, photographers and DJs within your budget. You confirm, we coordinate everything.", where: "Booking → Tendr Plans It For Me", href: "/booking",          accent: "#C47A2E" },
    { id: "browse-vendors", tag: "Browse Vendors",        icon: "🔍", iconBg: "linear-gradient(135deg,#7A4A1E,#C47A2E)",  headline: "Find the right vendor. Compare. Chat. Book.",              desc: "Browse top-rated vendors in Delhi NCR. Compare profiles side by side, chat directly, and lock in your price — all in one place.", where: "Vendors → Browse Vendors", href: "/listings",          accent: "#7A4A1E" },
    { id: "timeline",       tag: "Event Timeline",        icon: "⏱️", iconBg: "linear-gradient(135deg,#2C1A0E,#7A4A1E)",  headline: "Every milestone, perfectly timed",                        desc: "Build a day-by-day countdown. Download a timeline slip you can share with every vendor on your list.", where: "Our Products → Timeline", href: "/timeline-picker",  accent: "#2C1A0E" },
    // { id: "decor-finder", tag: "Decor Finder", icon: "🎨", href: "/decor-finder", accent: "#C47A2E" }, // disabled
    { id: "budget",         tag: "Budget Allocator",      icon: "💰", iconBg: "linear-gradient(135deg,#7A4A1E,#CCAB4A)",  headline: "Know exactly what you can afford — before you start",     desc: "Set your budget per service. We filter and sort vendors so every option you see is within reach.", where: "Our Products → Budget Allocator", href: "/budget-picker",    accent: "#7A4A1E" },
    { id: "gift-hampers",   tag: "Gift Hampers & Cakes",  icon: "🎁", iconBg: "linear-gradient(135deg,#C47A2E,#CCAB4A)",  headline: "The perfect gift, delivered to the door",                 desc: "Curated hampers and custom cakes for birthdays, anniversaries and corporate celebrations.", where: "Gift & Hampers", href: "/gift-hampers-cakes",  accent: "#C47A2E" },
    { id: "fun-activities",  tag: "Fun Activities",        icon: "🎭", iconBg: "linear-gradient(135deg,#C47A2E,#E8A84A)",  headline: "Add magic, games & live entertainment to any event",     desc: "Magic shows, game coordinators, dhol players, live teddy, stone art and more — fixed prices, confirmed in 2 hours.", where: "Fun Activities", href: "/fun-activities", accent: "#C47A2E" },
    { id: "stationery",      tag: "Wedding Stationeries",  icon: "💒", iconBg: "linear-gradient(135deg,#7A3A1E,#C47A2E)",  headline: "Your wedding, beautifully told — no templates, ever",    desc: "Itineraries, invitations, money envelopes, hashtag packages, coffee table booklets and more — each piece crafted exclusively for you.", where: "Wedding Stationeries", href: "/stationery", accent: "#7A3A1E" },
    { id: "baat-karo",      tag: "Baat Karo",             icon: "💬", iconBg: "linear-gradient(135deg,#25D366,#128C7E)",  headline: "Just tell us — Tendr team will handle the rest",          desc: "Write your requirements in Hindi, English or Hinglish. Our team replies on WhatsApp with vendor options, pricing and availability — no forms, no hassle.", where: "Booking → Baat Karo", href: "/baat-karo", accent: "#128C7E" },
    { id: "celebration-kit",tag: "Tendr Celebration Kit", icon: "🎉", iconBg: "linear-gradient(135deg,#2C1A0E,#C47A2E)",  headline: "Everything for a home celebration — under ₹1,499",        desc: "Balloons, fairy lights, games, decor disposals and a letter from Tendr. Unbox and celebrate.", where: "Coming Soon", href: null, accent: "#2C1A0E", isKit: true },
  ];

  const goToSlide = (idx) => {
    if (heroFading) return;
    setHeroPrev(heroIndex);
    setHeroFading(true);
    setTimeout(() => {
      setHeroIndex(idx);
      setHeroPrev(null);
      setHeroFading(false);
    }, 420);
  };

  // Build hero slideshow from gallery photos + gift hamper samples
  const heroPhotos = (() => {
    const allPhotos = Object.values(galleryByCategory).flat().filter(p => p.imageUrl);
    return [...allPhotos.map(p => ({ url: p.imageUrl, label: p.category })), ...ghSamplePhotos];
  })();

  const heroNext = () => goToSlide((heroIndex + 1) % heroPhotos.length);
  const heroPrevSlide = () =>
    goToSlide((heroIndex - 1 + heroPhotos.length) % heroPhotos.length);

  useEffect(() => {
    if (!galleryLoaded || heroPhotos.length === 0) return;
    const t = setInterval(heroNext, 4500);
    return () => clearInterval(t);
  }, [heroIndex, heroFading, galleryLoaded, heroPhotos.length]);

  useEffect(() => {
    const t = setInterval(() => {
      setFeatureVisible(false);
      setTimeout(() => {
        setFeatureIdx(i => (i + 1) % HERO_FEATURES.length);
        setFeatureVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setSlideVisible(false);
      setTimeout(() => {
        setSlideIdx(i => (i + 1) % FEATURE_SLIDES.length);
        setSlideVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(t);
  }, [FEATURE_SLIDES.length]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let retryCount = 0;
    const STATIC_FALLBACK = {
      Decoration: [
        { imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80", label: "Decoration" },
        { imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80", label: "Decoration" },
      ],
      Photography: [
        { imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80", label: "Photography" },
      ],
      Catering: [
        { imageUrl: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=900&q=80", label: "Catering" },
      ],
    };

    const fetchGallery = () => {
      fetch(`${BASE_URL}/gallery`)
        .then(r => r.ok ? r.json() : { grouped: {} })
        .then(d => {
          if (d.grouped && Object.keys(d.grouped).length > 0) {
            setGalleryByCategory(d.grouped);
            setGalleryLoaded(true);
          } else if (retryCount < 2) {
            retryCount++;
            setTimeout(fetchGallery, 3000);
          } else {
            // Use static fallback after 2 retries
            setGalleryByCategory(STATIC_FALLBACK);
            setGalleryLoaded(true);
          }
        })
        .catch(() => {
          if (retryCount < 2) {
            retryCount++;
            setTimeout(fetchGallery, 3000);
          } else {
            setGalleryByCategory(STATIC_FALLBACK);
            setGalleryLoaded(true);
          }
        });
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/admin/gift-hamper-samples`)
      .then(r => r.ok ? r.json() : { samples: [] })
      .then(d => { if (d.samples?.length) setGhSamplePhotos(d.samples.map(s => ({ url: s.url, label: s.name || "Gift Hamper" }))); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setGlimpseCounter(c => c + 1), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/gift-hampers/products`)
      .then(r => r.ok ? r.json() : { products: [] })
      .then(d => { if (d.products?.length) setGhProducts(d.products); })
      .catch(() => {});
  }, []);


  // Logo should navigate to the home route (works from other pages as well)
  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    window.open("https://wa.me/9211668427", "_blank");
  };

  const handleSignInClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  // removed sign up - not needed per requirements

  const handleBookingSelect = (e) => {
    const val = e.target.value;
    if (!val) return;
    if (val === "corporate") {
      navigate("/corporate/login"); // your corporate booking route
    } else if (val === "celebration") {
      navigate("/booking"); // general booking / choose booking
    }
    // reset select to default (optional)
    e.target.selectedIndex = 0;
  };

  const handleVendorSelect = (e) => {
    const val = e.target.value;
    if (!val) return;
    if (val === "register") {
      navigate("/vendor/register");
    } else if (val === "portfolio") {
      navigate("/listings"); // vendor listings / portfolio area
    }
    e.target.selectedIndex = 0;
  };

  const handledropdownChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) return;
    if (selectedValue === "timeline") {
      navigate("/timeline-picker");
    } else if (selectedValue === "Budget Allocator") {
      navigate("/budget-allocator");
    } else if (selectedValue === "invitation") {
      navigate("/stationery");
    } else if (selectedValue === "our-products") {
      // Gift Hampers disabled
    }
    event.target.selectedIndex = 0;
  };

  const handleGiftHampersClick = (e) => {
    e.preventDefault();
    navigate("/gift-hampers-cakes");
  };

  const handlePartnerClick = (e) => {
    e.preventDefault();
    navigate("/vendor/register");
  };

  const handleCorporateClick = (e) => {
    e.preventDefault();
    navigate("/corporate-signup");
  };

  const services = [
    {
      id: 1,
      title: "Photography",
      image:
        "https://artincontext.org/wp-content/uploads/2022/07/What-Is-the-Definition-of-Fine-Art-Photography.avif",
    },
    {
      id: 2,
      title: "Entertainment",
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Decor",
      image:
        "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Catering",
      image:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
    },
  ];

  const events = [
    {
      id: 1,
      title: "Sangeet Night",
      image:
        "https://images.unsplash.com/photo-1619529398688-b99e1cc3c4e5?auto=format&fit=crop&w=600&h=400&q=80",
    },
    {
      id: 2,
      title: "Holi Celebration",
      image:
        "https://images.unsplash.com/photo-1576473550018-d9fa22c3fb47?auto=format&fit=crop&w=600&h=400&q=80",
    },
    {
      id: 3,
      title: "Diwali Gala",
      image:
        "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=600&h=400&q=80",
    },
    {
      id: 4,
      title: "Wedding Reception",
      image:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&h=400&q=80",
    },
    {
      id: 5,
      title: "Birthday Bash",
      image:
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&h=400&q=80",
    },
    {
      id: 6,
      title: "Gala Dinner",
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&h=400&q=80",
    },
  ];

  const features = [
    {
      id: 1,
      icon: "🏢",
      title: "Corporate Events",
      description: "Meetings, conferences, and seminars",
    },
    {
      id: 2,
      icon: "🎯",
      title: "Team Building",
      description: "Engaging activities and workshops",
    },
    {
      id: 3,
      icon: "🏆",
      title: "Award Ceremonies",
      description: "Recognition events and galas",
    },
  ];

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isSignedIn = !!user;

  const HOME_TOUR_STEPS = isMobile ? [
    {
      target: "body",
      placement: "center",
      title: "Welcome to Tendr! 🎉",
      content: "Plan any event — find vendors, book services, shop gifts. Here's a quick look at everything.",
    },
    {
      target: '[data-tour="mob-search"]',
      placement: "bottom",
      title: "Search Vendors",
      content: 'Tap here to search — try "decorator in Noida" or "caterer under ₹30K". Tendr finds the right match instantly.',
    },
    {
      target: '[data-tour="mob-icon-row"]',
      placement: "bottom",
      title: "Quick Access",
      content: "Jump straight to Vendors, Gift Hampers, Fun Activities or Wedding Stationeries from here.",
    },
    {
      target: '[data-tour="mob-burger"]',
      placement: "bottom",
      title: "More Options",
      content: "Tap the three lines to access Community, About Us and Contact — all in one menu.",
    },
    {
      target: '[data-tour="mob-nav-products"]',
      placement: "top",
      title: "Planning Tools",
      content: "Budget Allocator, Timeline Builder and Decor Finder — everything you need to plan the perfect event.",
    },
    {
      target: '[data-tour="mob-nav-plan"]',
      placement: "top",
      title: "Plan Your Event",
      content: "Start here to plan your full event. Pick vendors yourself or let Smart Plan build the best lineup within your budget.",
    },
    {
      target: '[data-tour="mob-nav-tips"]',
      placement: "top",
      title: "Tips by Tendr",
      content: "Free event planning guides on budgeting, decor, corporate events and more. Unlock any guide instantly with your WhatsApp number.",
    },
    isSignedIn ? {
      target: '[data-tour="mob-nav-profile"]',
      placement: "top",
      title: "Your Bookings",
      content: "Tap Profile to open your dashboard. Once Tendr confirms your booking it shows up under Upcoming — with all documents ready to download.",
    } : {
      target: '[data-tour="mob-nav-profile"]',
      placement: "top",
      title: "Sign In to Book",
      content: "Tap here to sign in. Once you book, your confirmed events and documents will be waiting for you in your dashboard.",
    },
  ] : [
    {
      target: "body",
      placement: "center",
      title: "Welcome to Tendr! 🎉",
      content: "India's smartest event platform. Here's a quick look at everything you can do.",
    },
    {
      target: '[data-tour="search-bar"]',
      placement: "bottom",
      title: "Smart Search",
      content: 'Type naturally — "decorator under ₹20K in Noida" or "photographer for 200 guests". Tendr understands vendor types, budgets and cities.',
    },
    {
      target: '[data-tour="nav-browse"]',
      placement: "bottom",
      title: "Browse Vendors",
      content: "Decorators, Caterers, Photographers, DJs, Venues, Makeup and more. Filter by location, budget and rating. Top Rated shows our best-reviewed vendors.",
    },
    {
      target: '[data-tour="nav-products"]',
      placement: "bottom",
      title: "Our Products",
      content: "Gift Hampers & Cakes, Wedding Stationeries, and Fun Activities like magic shows, live bands and photo booths — all curated for your event.",
    },
    {
      target: '[data-tour="nav-booking"]',
      placement: "bottom",
      title: "Plan Your Event",
      content: "Start here to plan your full event. Pick vendors yourself or use Smart Plan — it builds the best lineup within your total budget automatically.",
    },
    {
      target: '[data-tour="nav-tools"]',
      placement: "bottom",
      title: "Tools & Extras",
      content: "Budget Allocator, Decor Finder, Timeline Builder, Gift Hampers, Wedding Stationeries, Fun Activities and Party Places — all in one place.",
    },
    {
      target: '[data-tour="nav-tips"]',
      placement: "bottom",
      title: "Tips by Tendr",
      content: "Free event planning guides on budgeting, decor, corporate events and more. Unlock any guide instantly with your WhatsApp number.",
    },
    {
      target: '[data-tour="nav-company"]',
      placement: "bottom",
      title: "About & Contact",
      content: "Learn about Tendr's story and reach us directly — we're always happy to help plan your event.",
    },
    isSignedIn ? {
      target: '[data-tour="profile-btn"]',
      placement: "bottom",
      title: "Your Bookings",
      content: "Click here to open your dashboard. Once Tendr confirms your booking it appears under Upcoming — with Invoice, Event Details, Timeline and Invitation all ready to download.",
    } : {
      target: '[data-tour="signin-btn"]',
      placement: "bottom",
      title: "Sign In to Book",
      content: "Sign in to confirm bookings and access your dashboard — where your upcoming events, vendor details and downloadable documents will live.",
    },
  ];

  return (
    <div className="App">
      <PageTour pageKey="home" steps={HOME_TOUR_STEPS} onDone={() => window.dispatchEvent(new CustomEvent("tendr:show-signin"))} />
      <SEO title="Tendr — Celebration & Event Planning Platform in Delhi NCR" description="Plan birthdays, anniversaries, balloon decorations, surprise parties, baby showers, house parties and corporate events across Delhi, Noida, Gurgaon, Ghaziabad and Faridabad. Compare 100+ verified vendors and book instantly." path="/" />
      {/* Speed dial (floating) */}
      <div
        className={`sticky bottom-2 right-1 z-50 transform transition-all duration-500 ${
          scrolled
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <BasicSpeedDial />
      </div>
      <SelectedVendorsFloat />

      {/* Header / Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 bg-white shadow transition-transform duration-500 ease-in-out ${
          scrolled ? "translate-y-0 opacity-100" : "translate-y-0 opacity-100"
        }`}
      >
        <Navbar handleLogoClick={handleLogoClick} tendrLogo={tendrLogo} handleGiftHampersClick={handleGiftHampersClick} handleSignInClick={handleSignInClick} />  
      </nav>

      {/* Hero Section */}
      <section
        className="hero-section-wrap"
        style={{
          height: "92vh",
          minHeight: 600,
          paddingTop: 88,
          background: "linear-gradient(135deg, #FFF8EE 0%, #FFF3DC 60%, #FDE8C8 100%)",
          display: "flex",
          alignItems: "stretch",
          fontFamily: "'Outfit', sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "stretch",
            flex: 1,
          }}
          className="hero-split"
        >
          {/* ── Left: fixed hero headline + CTA ── */}
          <div style={{ flex: "0 0 48%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px 0 64px" }}>

            {/* Mobile only: 4 main category chips */}
            <div className="hero-mobile-cats" data-tour="mob-icon-row" style={{ display: "none", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
                {[
                  { emoji: "🏪", label: "Vendors",       path: null,                  bg: "linear-gradient(135deg,#FFF0E0,#FFE4C4)", isVendors: true },
                  { emoji: "🎁", label: "Gift Hampers",   path: "/gift-hampers-cakes", bg: "linear-gradient(135deg,#FFF0F8,#FFE4F2)" },
                  { emoji: "🎭", label: "Fun Activities", path: "/fun-activities",      bg: "linear-gradient(135deg,#F0FFF4,#E0FFE8)" },
                  { emoji: "💒", label: "Stationeries",   path: "/stationery",          bg: "linear-gradient(135deg,#FDF0D8,#FBE0C0)" },
                ].map(({ emoji, label, path, bg, isVendors }) => (
                  <button key={label}
                    onClick={() => isVendors ? setVendorStripOpen(o => !o) : navigate(path)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "4px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", width: 70 }}>
                    <div style={{ width: 58, height: 58, borderRadius: 16, background: isVendors && vendorStripOpen ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : bg, border: `1.5px solid ${isVendors && vendorStripOpen ? "#C47A2E" : "rgba(196,122,46,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 2px 8px rgba(196,122,46,0.12)", transition: "background 0.2s" }}>
                      {isVendors && vendorStripOpen ? "✕" : emoji}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isVendors && vendorStripOpen ? "#C47A2E" : "#2C1A0E", textAlign: "center", lineHeight: 1.2 }}>{label}</span>
                  </button>
                ))}
              </div>
              {/* Vendor sub-strip — appears below the main row when Vendors tapped */}
              {vendorStripOpen && (
                <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 12 }}>
                  {[
                    { emoji: "🎀", label: "Decorator",    path: "/search?categories=Decorator" },
                    { emoji: "🍽", label: "Caterer",       path: "/search?categories=Caterer" },
                    { emoji: "📸", label: "Photographer",  path: "/search?categories=Photographer" },
                    { emoji: "🎵", label: "DJ",            path: "/search?categories=DJ" },
                  ].map(({ emoji, label, path }) => (
                    <button key={label} onClick={() => { setVendorStripOpen(false); navigate(path); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", width: 56 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#FFF0E0,#FFE4C4)", border: "1.5px solid rgba(196,122,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 2px 5px rgba(196,122,46,0.1)" }}>
                        {emoji}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#2C1A0E", textAlign: "center", lineHeight: 1.2 }}>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fixed headline block */}
            <div style={{ marginBottom: 36 }}>
              <div className="home-hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.25)", borderRadius: 100, padding: "5px 14px", marginBottom: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C47A2E", display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: "#C47A2E" }}>Delhi NCR's Celebration Platform</span>
              </div>

              <h1 className="home-hero-h1" style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", lineHeight: 1.12, color: "#2C1A0E", marginBottom: 18, letterSpacing: "-0.03em" }}>
                Everything your event needs.<br />
                <span style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  One place.
                </span>
              </h1>

              <p className="home-hero-para" style={{ fontSize: 15, fontWeight: 400, color: "#6B4226", lineHeight: 1.65, maxWidth: 420, margin: 0 }}>
                Birthdays, anniversaries, house parties and more — find vendors, plan the details, and book everything in Delhi NCR.
              </p>
            </div>

            {/* Trust chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {["✓ Verified vendors", "✓ Free to browse", "✓ Price locked before you pay", "✓ 100+ vendors"].map(chip => (
                <span key={chip} style={{ fontSize: 12, fontWeight: 500, color: "#7A5535", background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "5px 12px", whiteSpace: "nowrap" }}>
                  {chip}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => navigate("/booking")}
                className="home-hero-cta"
                style={{ background: "linear-gradient(135deg, #C47A2E 0%, #D4A848 100%)", color: "#fff", fontSize: 17, fontWeight: 600, letterSpacing: "0.02em", padding: "15px 40px", borderRadius: 14, border: "none", cursor: "pointer", boxShadow: "0 6px 28px rgba(196,122,46,0.45)", transition: "transform 0.2s, box-shadow 0.2s", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap", alignSelf: "flex-start" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(196,122,46,0.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(196,122,46,0.45)"; }}
              >
                Start Planning →
              </button>
            </div>

          </div>

          {/* ── Right: photo carousel ── */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "0 0 0 32px",
                overflow: "hidden",
                boxShadow: "-8px 0 40px rgba(139,69,19,0.15)",
                background: "#2C1A0E",
              }}
            >
              {/* Loading state while gallery fetches */}
              {!galleryLoaded && (
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#2C1A0E,#4A2810)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", color: "rgba(204,171,74,0.6)" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
                    <div style={{ fontSize: 13, letterSpacing: "0.1em" }}>Loading gallery...</div>
                  </div>
                </div>
              )}
              {/* Current photo — only shown when gallery loaded */}
              {galleryLoaded && heroPhotos.length > 0 && (
              <img
                key={heroIndex}
                src={heroPhotos[Math.min(heroIndex, heroPhotos.length - 1)].url}
                alt={heroPhotos[Math.min(heroIndex, heroPhotos.length - 1)].label}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 20%",
                  animation: "heroFadeIn 0.42s ease",
                }}
              />
              )}

              {/* Gradient overlay at bottom */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "45%",
                  background: "linear-gradient(to top, rgba(30,15,5,0.72) 0%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />

              {/* Mobile glass search bar — absolute overlay on photos, hidden on desktop via CSS */}
              <form
                onSubmit={handleHeroSearch}
                className="mobile-hero-search"
                style={{ display: "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" flexShrink="0" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  value={heroSearch}
                  onChange={e => setHeroSearch(e.target.value)}
                  placeholder="Search vendors, decorators, DJ..."
                  className="mobile-hero-search-input"
                />
                {heroSearch && (
                  <button
                    type="button"
                    onClick={() => setHeroSearch("")}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 0, fontSize: 16, lineHeight: 1, flexShrink: 0 }}
                  >×</button>
                )}
              </form>

              {/* Event label */}
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 20,
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }}
              >
                {galleryLoaded && heroPhotos.length > 0 ? heroPhotos[Math.min(heroIndex, heroPhotos.length - 1)].label : ""}
              </div>

              {/* Prev arrow */}
              <button
                onClick={heroPrevSlide}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                  zIndex: 2,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.38)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              >
                ‹
              </button>

              {/* Next arrow */}
              <button
                onClick={heroNext}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                  zIndex: 2,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.38)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              >
                ›
              </button>

              {/* Dot indicators removed */}
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee strip — right under hero text ── */}
      {(() => {
        const GROUPS = [
          { icon: "🏙", label: "Cities", color: "#7A4A1E", items: ["Delhi", "Noida", "Gurgaon", "Ghaziabad", "Faridabad", "Greater Noida"] },
          { icon: "🎯", label: "Services", color: "#C47A2E", items: ["Photography", "Catering", "DJ & Music", "Decoration", "Balloon Setup", "Fun Activities"] },
          { icon: "🎉", label: "Events", color: "#8B4513", items: ["Birthday Parties", "Anniversaries", "Corporate Events", "Baby Showers", "House Parties", "Surprise Setups"] },
          { icon: "✨", label: "Platform", color: "#C47A2E", items: ["Delhi NCR's Trusted Platform", "Free to Browse", "Instant Chat", "100+ Verified Vendors", "Verified Reviews", "Same-Day Support"] },
        ];

        const strip = [...GROUPS, ...GROUPS]; // duplicate for seamless loop

        return (
          <div style={{
            background: "linear-gradient(90deg,rgba(196,122,46,0.08),rgba(204,171,74,0.06),rgba(196,122,46,0.08))",
            borderTop: "1px solid rgba(196,122,46,0.18)",
            borderBottom: "1px solid rgba(196,122,46,0.18)",
            padding: "10px 0", overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", width: "max-content", animation: "tendr-marquee 40s linear infinite" }}>
              {strip.map((group, gi) => (
                <React.Fragment key={gi}>
                  {/* Group items with · between */}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
                    <span style={{ fontSize: 14, marginRight: 8 }}>{group.icon}</span>
                    {group.items.map((item, ii) => (
                      <React.Fragment key={ii}>
                        <span style={{ color: group.color, fontSize: 11.5, fontWeight: 500, letterSpacing: "0.08em", whiteSpace: "nowrap", textTransform: "uppercase" }}>
                          {item}
                        </span>
                        {ii < group.items.length - 1 && (
                          <span style={{ color: "rgba(196,122,46,0.4)", fontSize: 10, padding: "0 10px" }}>·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </span>
                  {/* | divider between groups */}
                  <span style={{
                    display: "inline-block", width: 1.5, height: 16,
                    background: "linear-gradient(180deg,transparent,#C47A2E,transparent)",
                    margin: "0 24px", opacity: 0.6, verticalAlign: "middle", flexShrink: 0,
                  }} />
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes tendr-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 900px) {
          .hero-split {
            flex-direction: column !important;
          }
          .hero-split > div:first-child {
            flex: unset !important;
            padding: 10px 22px 24px !important;
          }
          .hero-split > div:last-child {
            display: none !important;
          }
          .hero-mobile-cats {
            display: block !important;
          }
          .hero-mobile-cats::-webkit-scrollbar { display: none; }
        }
      `}</style>

      {/* ── Which path is for you ── */}
      <section style={{ background: "#F8F4EF", padding: "64px 24px 72px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C47A2E", margin: "0 0 12px" }}>Find Your Way</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 12px", letterSpacing: "0.01em" }}>
              Which one is for you?
            </h2>
            <p style={{ fontSize: 15, fontWeight: 400, color: "#6B4226", maxWidth: 360, margin: "0 auto", lineHeight: 1.65 }}>
              Two ways to use Tendr — pick whichever fits how you think.
            </p>
          </div>

          <div className="path-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, maxWidth: 720, margin: "0 auto" }}>
            {[
              {
                icon: "🔍",
                eyebrow: "Browse & Search",
                title: "You know what you want",
                desc: "Search for a vendor type, compare profiles, and chat to confirm price.",
                startFrom: "Use the search bar or Browse in the menu",
                accent: "#C47A2E",
              },
              {
                icon: "✨",
                eyebrow: "Start Planning",
                title: "You want help figuring it out",
                desc: "Tell us your event once — we match you with the right vendors.",
                startFrom: "Click 'Start Planning' above",
                accent: "#7A4A1E",
              },
            ].map(({ icon, eyebrow, title, desc, startFrom, accent }) => (
              <div key={eyebrow} style={{
                background: "#FFFCF7",
                border: "1px solid rgba(196,122,46,0.13)",
                borderRadius: 20,
                padding: "28px 24px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "0 2px 12px rgba(44,26,14,0.05)",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(196,122,46,0.07)", border: "1px solid rgba(196,122,46,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
                <p style={{ fontSize: 10, fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>{eyebrow}</p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.2rem,1.8vw,1.45rem)", fontWeight: 400, color: "#2C1A0E", margin: 0, lineHeight: 1.25, letterSpacing: "0.01em" }}>{title}</h3>
                <p style={{ fontSize: 13, fontWeight: 400, color: "#6B4226", margin: 0, lineHeight: 1.65 }}>{desc}</p>
                <div style={{ marginTop: 6, paddingTop: 12, borderTop: "1px solid rgba(196,122,46,0.1)", fontSize: 11, color: "#B08A6A", fontWeight: 500 }}>
                  ↳ {startFrom}
                </div>
              </div>
            ))}
          </div>

          <style>{`
            @media (max-width: 540px) {
              .path-cards-grid {
                grid-template-columns: 1fr !important;
                max-width: 100% !important;
              }
            }
          `}</style>
        </div>
      </section>

      {/* ── Everything for your celebration — static 2-tier grid ── */}
      <section style={{ background: "#FFFFFF", padding: "60px 24px 56px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 8px", letterSpacing: "0.01em" }}>Everything for your celebration</h2>
            <p style={{ fontSize: 15, color: "#6B4226", margin: 0 }}>Pick what you need — vendors, planning tools, entertainment, stationery and more.</p>
          </div>

          {/* Tier 1 — How do you want to plan? */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 12px" }}>How do you want to plan?</p>
          <div className="offer-tier1-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { icon: "✨", label: "Smart Planner",  desc: "Tell us once — we build your complete vendor package within budget.", accent: "#C47A2E", bg: "linear-gradient(135deg,#C47A2E,#CCAB4A)", href: "/booking" },
              { icon: "🔍", label: "Browse Vendors", desc: "Compare verified vendors, chat directly, and lock in your price.", accent: "#7A4A1E", bg: "linear-gradient(135deg,#7A4A1E,#C47A2E)", href: "/listings" },
              { icon: "💬", label: "Baat Karo",       desc: "Write in Hindi or English — our team replies in 2 hours.", accent: "#128C7E", bg: "linear-gradient(135deg,#25D366,#128C7E)", href: "/baat-karo" },
            ].map(({ icon, label, desc, accent, bg, href }) => (
              <div key={label} onClick={() => navigate(href)}
                style={{ background: "#FFFCF5", border: `1.5px solid ${accent}28`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", transition: "transform 0.18s, box-shadow 0.18s", display: "flex", flexDirection: "column", gap: 10 }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 10px 28px ${accent}18`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
                  <span style={{ fontSize: 16, color: `${accent}88` }}>→</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tier 2 — Also on Tendr */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 12px" }}>Also on Tendr</p>
          <div className="offer-tier2-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[
              { icon: "💒", label: "Wedding Stationeries", desc: "Invitations, itineraries, thank you cards — personalised.", href: "/stationery" },
              { icon: "⏱️", label: "Event Timeline",       desc: "Build a day-by-day countdown for your event.", href: "/timeline-picker" },
              { icon: "💰", label: "Budget Allocator",     desc: "Set budget per category and track every rupee.", href: "/budget-picker" },
              { icon: "🎁", label: "Gift Hampers & Cakes", desc: "Curated gifts and cakes — delivered for your event.", href: "/gift-hampers-cakes" },
              { icon: "🎭", label: "Fun Activities",       desc: "Magic shows, games, dhol players and live entertainment.", href: "/fun-activities" },
              { icon: "🔍", label: "Find by Style",        desc: "Upload a photo and find vendors who match your vibe.", href: "/find-by-style" },
              { icon: "📚", label: "Tips by Tendr",        desc: "Free guides, community ideas and planning tips.", href: "/guides" },
            ].map(({ icon, label, desc, href }) => (
              <div key={label} className="offer-tier2-item" onClick={() => navigate(href)}
                style={{ background: "#F9F6F2", border: "1px solid rgba(196,122,46,0.12)", borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12, transition: "background 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#FFF8EE"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#F9F6F2"; e.currentTarget.style.boxShadow = "none"; }}>
                <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <div className="offer-tier2-inner" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#2C1A0E" }}>{label}</span>
                    <span className="offer-tier2-arrow" style={{ fontSize: 13, color: "rgba(196,122,46,0.5)", flexShrink: 0 }}>→</span>
                  </div>
                  <div className="offer-tier2-desc" style={{ fontSize: 11, color: "#9B7450", lineHeight: 1.5, marginTop: 3 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <style>{`
            @media (max-width: 640px) {
              /* Tier 1 — horizontal scroll row */
              .offer-tier1-grid {
                display: flex !important;
                overflow-x: auto !important;
                gap: 10px !important;
                padding-bottom: 8px !important;
                scrollbar-width: none;
                -webkit-overflow-scrolling: touch;
                margin-bottom: 24px !important;
              }
              .offer-tier1-grid::-webkit-scrollbar { display: none; }
              .offer-tier1-grid > div {
                min-width: 196px !important;
                max-width: 196px !important;
                flex-shrink: 0 !important;
              }

              /* Tier 2 — compact pill scroll row */
              .offer-tier2-grid {
                display: flex !important;
                overflow-x: auto !important;
                gap: 8px !important;
                padding-bottom: 8px !important;
                scrollbar-width: none;
                -webkit-overflow-scrolling: touch;
              }
              .offer-tier2-grid::-webkit-scrollbar { display: none; }
              .offer-tier2-item {
                min-width: 96px !important;
                max-width: 96px !important;
                flex-shrink: 0 !important;
                flex-direction: column !important;
                align-items: center !important;
                text-align: center !important;
                padding: 14px 8px 12px !important;
                gap: 6px !important;
              }
              .offer-tier2-item > span { margin-top: 0 !important; }
              .offer-tier2-inner { flex: unset !important; min-width: unset !important; width: 100%; }
              .offer-tier2-inner > div:first-child { justify-content: center !important; }
              .offer-tier2-arrow { display: none !important; }
              .offer-tier2-desc  { display: none !important; }
            }
            @media (min-width: 641px) and (max-width: 960px) {
              .offer-tier1-grid { grid-template-columns: repeat(3,1fr) !important; }
              .offer-tier2-grid { grid-template-columns: repeat(4,1fr) !important; }
            }
          `}</style>
        </div>
      </section>

      {/* ── Live Entertainment Add-ons ── */}
      <section style={{ background:"linear-gradient(180deg,#FFF8EF 0%,#F8F4EF 60%,#F0EBE3 100%)", padding:"60px 24px 64px", fontFamily:"'Outfit', sans-serif" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28, flexWrap:"wrap", gap:12 }}>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:"#C47A2E", textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 8px" }}>Live Entertainment</p>
              <h2 style={{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:400, color:"#2C1A0E", margin:"0 0 8px", letterSpacing:"0.01em" }}>
                Add Some Magic —<br /><span style={{ color:"#C47A2E" }}>Fun Activities</span>
              </h2>
              <p style={{ fontSize:15, color:"#6B4226", margin:0, maxWidth:480, lineHeight:1.65 }}>
                Fixed-price entertainment add-ons — magic shows, game zones, live counters and more. Confirmed within 2 hours.
              </p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={() => scrollFaCarousel(-1)}
                style={{ width:38, height:38, borderRadius:"50%", border:"1.5px solid rgba(196,122,46,0.25)", background:"#fff", color:"#C47A2E", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(196,122,46,0.1)", flexShrink:0, transition:"all 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#C47A2E";e.currentTarget.style.color="#fff";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color="#C47A2E";}}>‹</button>
              <button onClick={() => scrollFaCarousel(1)}
                style={{ width:38, height:38, borderRadius:"50%", border:"1.5px solid rgba(196,122,46,0.25)", background:"#fff", color:"#C47A2E", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(196,122,46,0.1)", flexShrink:0, transition:"all 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#C47A2E";e.currentTarget.style.color="#fff";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color="#C47A2E";}}>›</button>
              <button onClick={() => navigate("/fun-activities")}
                style={{ padding:"10px 22px", borderRadius:12, border:"1.5px solid rgba(196,122,46,0.35)", background:"transparent", color:"#C47A2E", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif", whiteSpace:"nowrap" }}>
                See All →
              </button>
            </div>
          </div>

          {/* Arrow-navigated cards */}
          <div
            ref={faCarouselRef}
            className="fa-carousel-track"
            style={{ display:"flex", gap:16, overflowX:"auto", scrollbarWidth:"none", msOverflowStyle:"none", paddingBottom:8 }}
          >
            {FUN_ACTIVITIES.map((act) => (
              <div
                key={act.id}
                className="fa-carousel-card"
                onClick={() => setFaModal(act)}
                style={{
                  flexShrink:0, width:200, background:"#fff",
                  borderRadius:18, border:"1.5px solid rgba(196,122,46,0.15)",
                  boxShadow:"0 4px 16px rgba(196,122,46,0.1)",
                  display:"flex", flexDirection:"column", alignItems:"stretch",
                  cursor:"pointer", transition:"transform 0.2s, box-shadow 0.2s",
                  fontFamily:"'Outfit',sans-serif",
                  overflow:"hidden",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(196,122,46,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.1)"; }}
              >
                {/* Photo header */}
                <div className="fa-card-img" style={{ position:"relative", height:130, flexShrink:0 }}>
                  <img src={act.image} alt={act.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)", pointerEvents:"none" }} />
                  <div style={{ position:"absolute", top:8, right:8, background:"linear-gradient(135deg,#C47A2E,#CCAB4A)", color:"#fff", fontSize:10, fontWeight:600, padding:"3px 9px", borderRadius:"100px 100px 100px 4px", fontFamily:"'Outfit',sans-serif" }}>
                    ₹{act.price.toLocaleString()}{act.perUnit ? <span style={{ fontSize:8, fontWeight:500 }}> /{act.unitLabel}</span> : ""}
                  </div>
                </div>
                {/* Text body */}
                <div className="fa-card-body" style={{ padding:"12px 14px 14px", display:"flex", flexDirection:"column", gap:6, flex:1 }}>
                  <h4 className="fa-card-name" style={{ fontSize:13, fontWeight:600, color:"#2C1A0E", margin:0, lineHeight:1.3 }}>{act.name}</h4>
                  <p className="fa-card-desc" style={{ fontSize:11, color:"#9B7450", margin:0, lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", flex:1 }}>{act.desc}</p>
                  <span className="fa-card-cta" style={{ fontSize:11, fontWeight:500, color:"#C47A2E", background:"rgba(196,122,46,0.08)", borderRadius:100, padding:"3px 10px", textAlign:"center" }}>View Details →</span>
                </div>
              </div>
            ))}
          </div>
          <style>{`
            .fa-carousel-track::-webkit-scrollbar { display:none; }
            @media (max-width: 640px) {
              .fa-carousel-card { width: 148px !important; }
              .fa-card-img { height: 108px !important; }
              .fa-card-body { padding: 10px 12px 12px !important; gap: 5px !important; }
              .fa-card-name { font-size: 12px !important; }
              .fa-card-desc { font-size: 10px !important; }
              .fa-card-cta { font-size: 10px !important; padding: 2px 8px !important; }
            }
          `}</style>
        </div>
      </section>

      {/* ── Gift Hampers & Cakes ── */}
      <section style={{ background: "#FFFDF7", padding: "36px 24px", fontFamily: "'Outfit', sans-serif", borderTop: "1px solid rgba(196,122,46,0.08)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: 0 }}>Gift Hampers & Cakes</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.5rem,2.8vw,2rem)", fontWeight: 400, color: "#2C1A0E", margin: 0, letterSpacing: "0.01em", lineHeight: 1.2 }}>
            The Perfect Gift,&nbsp;<span style={{ color: "#C47A2E" }}>Delivered to the Door</span>
          </h2>
          <p style={{ fontSize: 14, color: "#6B4226", margin: 0 }}>Our team can help with gifting for any occasion.</p>
          <button
            onClick={() => navigate("/baat-karo")}
            style={{ background: "transparent", color: "#C47A2E", border: "1.5px solid rgba(196,122,46,0.4)", fontSize: 14, fontWeight: 600, padding: "10px 28px", borderRadius: 10, cursor: "pointer", fontFamily: "'Outfit',sans-serif", marginTop: 4 }}
          >
            Chat with Our Team →
          </button>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section style={{ background: "#fff", borderTop: "1px solid rgba(196,122,46,0.1)", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "28px 24px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
          {[
            { stat: "Manually Verified",        sub: "Every vendor is personally reviewed before listing" },
            { stat: "5,000+ Events Completed",  sub: "Collectively delivered by our vendor network" },
            { stat: "Response in 24 hrs",       sub: "A real person responds to every booking request" },
          ].map(({ stat, sub }, i, arr) => (
            <div key={stat} style={{ display: "flex", alignItems: "center", gap: 0, flex: "1 1 220px", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 28px", flex: 1 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0E", lineHeight: 1.3 }}>{stat}</div>
                  <div style={{ fontSize: 11.5, color: "#9B7450", lineHeight: 1.4, marginTop: 2 }}>{sub}</div>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 1, height: 40, background: "rgba(196,122,46,0.18)", flexShrink: 0, alignSelf: "center" }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {false && <JourneyFlow />}


      {/* ── Book a Party Place — admin preview only ── */}
      {user?.isAdmin && (
        <section style={{ position: "relative", overflow: "hidden", fontFamily: "'Outfit', sans-serif" }}>
          <style>{`
            @media (max-width: 767px) {
              .pp-home-content { padding: 28px 20px 24px !important; flex-direction: column !important; gap: 16px !important; }
              .pp-home-title { font-size: 1.45rem !important; margin-bottom: 8px !important; }
              .pp-home-desc { font-size: 12.5px !important; margin-bottom: 12px !important; max-width: 100% !important; }
              .pp-home-pills { display: none !important; }
              .pp-home-stats { display: none !important; }
              .pp-home-ctas { gap: 8px !important; }
              .pp-home-ctas button { padding: 9px 16px !important; font-size: 13px !important; }
              .pp-mobile-types { display: flex !important; }
            }
          `}</style>
          {/* Split background — villa left, flat right */}
          <div style={{ position: "absolute", inset: 0, display: "flex" }}>
            <img src="https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=900&q=80" alt="Villa"
              style={{ width: "50%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
            <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80" alt="Flat decoration"
              style={{ width: "50%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(15,8,0,0.88) 0%,rgba(44,26,14,0.82) 50%,rgba(30,15,5,0.87) 100%)" }} />

          <div className="pp-home-content" style={{ position: "relative", zIndex: 2, maxWidth: 1160, margin: "0 auto", padding: "60px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 36 }}>

            {/* Left */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(204,171,74,0.15)", border: "1px solid rgba(204,171,74,0.25)", borderRadius: 100, padding: "3px 12px", marginBottom: 14 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#CCAB4A", display: "inline-block" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.12em" }}>Admin Preview</span>
              </div>
              <h2 className="pp-home-title" style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 400, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
                Book a Party Place<br /><span style={{ color: "#CCAB4A" }}>Through Us</span>
              </h2>
              <p className="pp-home-desc" style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 0 20px", maxWidth: 400, lineHeight: 1.65 }}>
                Villas and flats — fully decorated, catered and ready for your celebration. One booking, everything sorted.
              </p>
              <div className="pp-home-pills" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
                {["🏡 Villa", "🏢 Flat"].map(t => (
                  <span key={t} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 100, padding: "4px 14px" }}>{t}</span>
                ))}
              </div>
              <div className="pp-home-ctas" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => window.open("/party-places", "_blank")}
                  style={{ padding: "12px 24px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 16px rgba(196,122,46,0.4)", transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  Browse All Places ↗
                </button>
              </div>
            </div>

            {/* Right: stat cards — desktop only */}
            <div className="pp-home-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: 260, flexShrink: 0 }}>
              {[
                { num: "2",    label: "Property types" },
                { num: "400",  label: "Max guests" },
                { num: "4",    label: "Packages per venue" },
                { num: "100%", label: "End-to-end handled" },
              ].map(({ num, label }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 14px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#CCAB4A", lineHeight: 1, marginBottom: 4 }}>{num}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, lineHeight: 1.4 }}>{label}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Mobile-only: horizontal venue type tiles */}
          <div className="pp-mobile-types" style={{ display: "none", position: "relative", zIndex: 2, gap: 10, padding: "0 20px 24px" }}>
            {[
              { icon: "🏡", label: "Villas", sub: "Spacious · Pool · Garden" },
              { icon: "🏢", label: "Party Flats", sub: "Decorated · City View" },
            ].map(({ icon, label, sub }) => (
              <button key={label} onClick={() => window.open("/party-places", "_blank")}
                style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", cursor: "pointer", fontFamily: "'Outfit',sans-serif", textAlign: "left" }}>
                <span style={{ fontSize: 28 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{label}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{sub}</div>
                </div>
              </button>
            ))}
          </div>

        </section>
      )}

      {/* ── Wedding Stationeries Section ── */}
      {(() => {
        const STAT_CATS = [
          {
            icon: "📋",
            label: "Itineraries",
            sub: "3-Fold style",
            from: "From ₹650",
            overlay: "linear-gradient(0deg,rgba(14,22,80,0.88) 0%,rgba(30,43,110,0.5) 50%,rgba(40,55,140,0.18) 100%)",
            desc: "3-Fold — tri-panel schedule design, fully personalised",
            img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&q=75",
          },
          {
            icon: "💌",
            label: "Invitations",
            sub: "3 premium styles",
            from: "Price on request",
            overlay: "linear-gradient(0deg,rgba(80,25,5,0.9) 0%,rgba(130,55,15,0.55) 50%,rgba(160,80,20,0.2) 100%)",
            desc: "Pull-Out · Open Door · Roll-Up — luxury personalised designs",
            img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&q=75",
          },
          {
            icon: "💝",
            label: "Thank You Card",
            sub: "Heartfelt gratitude",
            from: "From ₹90",
            overlay: "linear-gradient(0deg,rgba(90,20,40,0.92) 0%,rgba(150,50,80,0.6) 50%,rgba(190,80,110,0.2) 100%)",
            desc: "A6 — elegant personalised thank you cards for all your guests",
            img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&q=75",
          },
          {
            icon: "🪧",
            label: "Welcome Card",
            sub: "Grand entrance",
            from: "From ₹220",
            overlay: "linear-gradient(0deg,rgba(8,40,20,0.92) 0%,rgba(20,90,50,0.6) 50%,rgba(30,120,70,0.2) 100%)",
            desc: "A4 — stunning printed welcome sign for your ceremony entrance",
            img: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&auto=format&q=75",
          },
        ];

        const SECTION_BG = "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1600&auto=format&q=70";

        return (
          <section style={{ position: "relative", padding: "88px 24px 96px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
            {/* Background image */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${SECTION_BG}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }} />
            {/* Dark overlay on top of bg image */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(18,8,2,0.88) 0%,rgba(25,12,4,0.82) 60%,rgba(18,8,2,0.9) 100%)" }} />
            {/* Gold shimmer blobs */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 15% 30%,rgba(204,171,74,0.07),transparent 40%), radial-gradient(circle at 85% 70%,rgba(196,122,46,0.06),transparent 40%)", pointerEvents: "none" }} />

            <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative" }}>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                style={{ textAlign: "center", marginBottom: 52 }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{ flex: 1, maxWidth: 80, height: 1, background: "linear-gradient(90deg,transparent,rgba(204,171,74,0.4))" }} />
                  <span style={{ color: "#CCAB4A", fontSize: 11, letterSpacing: "0.15em" }}>✦ ✦ ✦</span>
                  <div style={{ flex: 1, maxWidth: 80, height: 1, background: "linear-gradient(90deg,rgba(204,171,74,0.4),transparent)" }} />
                </div>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#CCAB4A", margin: "0 0 14px" }}>Crafted with Love</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.4rem,5vw,3.8rem)", fontWeight: 300, color: "#FFF8EC", margin: "0 0 14px", letterSpacing: "0.04em", fontStyle: "italic", lineHeight: 1.08 }}>
                  Wedding Stationeries
                </h2>
                <p style={{ fontSize: 14, color: "rgba(255,248,236,0.5)", margin: "0 auto 28px", maxWidth: 420, lineHeight: 1.65 }}>
                  Fully personalised for your wedding. No templates, no shortcuts.
                </p>
                <button
                  onClick={() => navigate("/stationery")}
                  style={{ display: "inline-block", padding: "12px 32px", borderRadius: 100, border: "1.5px solid rgba(204,171,74,0.35)", background: "transparent", color: "#CCAB4A", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", letterSpacing: "0.05em", transition: "all 0.22s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#C47A2E,#CCAB4A)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.border = "1.5px solid transparent"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#CCAB4A"; e.currentTarget.style.border = "1.5px solid rgba(204,171,74,0.35)"; }}
                >
                  View All Stationery →
                </button>
              </motion.div>

              {/* Category cards */}
              <div className="stat-home-grid2" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                {STAT_CATS.map((cat, i) => (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.09 }}
                    onClick={() => navigate("/stationery")}
                    style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer", position: "relative", minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "flex-end", boxShadow: "0 8px 32px rgba(0,0,0,0.55)", transition: "transform 0.28s, box-shadow 0.28s", border: "1px solid rgba(255,255,255,0.08)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px) scale(1.015)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.65)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.55)"; }}
                  >
                    {/* Photo background */}
                    <img
                      src={cat.img}
                      alt={cat.label}
                      loading="lazy"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                    {/* Colour-tinted gradient overlay */}
                    <div style={{ position: "absolute", inset: 0, background: cat.overlay }} />


                    {/* Content bottom */}
                    <div style={{ position: "relative", zIndex: 2, padding: "0 20px 22px" }}>
                      <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>{cat.sub}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 23, fontWeight: 400, color: "#fff", lineHeight: 1.15, marginBottom: 7 }}>{cat.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4, marginBottom: 12 }}>{cat.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#CCAB4A" }}>{cat.from}</div>
                        <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em" }}>EXPLORE →</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontStyle: "italic" }}>Design prices shown. Printing &amp; delivery charged separately.</p>
              </div>
            </div>
            <style>{`
              @media(max-width:900px){.stat-home-grid2{grid-template-columns:repeat(2,1fr)!important;gap:14px!important;}}
              @media(max-width:560px){
                .stat-home-grid2{
                  display:flex!important;
                  overflow-x:auto!important;
                  scroll-snap-type:x mandatory!important;
                  gap:12px!important;
                  padding:4px 24px 14px!important;
                  margin:0 -24px!important;
                  -webkit-overflow-scrolling:touch;
                  scrollbar-width:none;
                }
                .stat-home-grid2::-webkit-scrollbar{display:none}
                .stat-home-grid2>div{flex:0 0 80%!important;scroll-snap-align:start!important;min-width:0!important;}
              }
            `}</style>
          </section>
        );
      })()}

      {/* Events Portfolio Gallery */}
      <section style={{ background: "#FFFFFF", padding: "88px 24px 96px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 12 }}>Vendor Portfolio</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 400, color: "#2C1A0E", letterSpacing: "0.01em", margin: "0 0 14px" }}>What Our Vendors Can Do</h2>
            <p style={{ fontSize: 15, color: "#6B4226", maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>Real photos from vendor portfolios — showing exactly what they can deliver for your event.</p>
            <div style={{ width: 48, height: 3, background: "linear-gradient(90deg, #C47A2E, #CCAB4A)", borderRadius: 100, margin: "18px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} className="events-portfolio-grid">
            {[
              { title: "Decoration",       slug: "decoration",    key: "Decoration" },
              { title: "DJ & Entertainment", slug: "entertainment", key: "Entertainment" },
              { title: "Photography",      slug: "photography",   key: "Photography" },
              { title: "Catering",         slug: "catering",      key: "Catering" },
            ].map(({ title, slug, key }, catIdx) => {
              const catPhotos = galleryByCategory[key] || [];
              // Each tile cycles at a different offset so they don't all flip at the same time
              const imgIdx = catPhotos.length > 0
                ? Math.floor((glimpseCounter + catIdx * 2) / 1) % catPhotos.length
                : 0;
              const img = catPhotos[imgIdx]?.imageUrl || GALLERY_FALLBACKS[key];
              return (
              <div key={title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="portfolio-img-wrap" style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 220, background: "#2C1A0E" }}>
                  <img key={img} src={img} alt={title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", animation: "glimpseFade 0.6s ease" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,10,0,0.65) 0%, transparent 55%)", display: "flex", alignItems: "flex-end", padding: "14px 18px" }}>
                    <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>{title}</span>
                  </div>
                  {catPhotos.length > 1 && (
                    <div style={{ position: "absolute", top: 10, right: 12, display: "flex", gap: 4 }}>
                      {catPhotos.slice(0, Math.min(catPhotos.length, 5)).map((_, di) => (
                        <div key={di} style={{ width: 5, height: 5, borderRadius: "50%", background: di === imgIdx % Math.min(catPhotos.length, 5) ? "#fff" : "rgba(255,255,255,0.4)", transition: "background 0.3s" }} />
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => navigate(`/gallery/${slug}`)}
                  style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.28)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#C47A2E"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#C47A2E"; }}>
                  Explore {title} →
                </button>
              </div>
            ); })}
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) { .events-portfolio-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 520px) {
            .events-portfolio-grid {
              display: flex !important;
              overflow-x: auto !important;
              scroll-snap-type: x mandatory !important;
              gap: 14px !important;
              padding: 4px 2px 14px !important;
              margin: 0 -24px !important;
              padding-left: 24px !important;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
            }
            .events-portfolio-grid::-webkit-scrollbar { display: none; }
            .events-portfolio-grid > div {
              flex: 0 0 72% !important;
              scroll-snap-align: start !important;
              min-width: 0 !important;
            }
            .portfolio-img-wrap { height: 160px !important; }
          }
          @keyframes glimpseFade { from { opacity: 0.4; } to { opacity: 1; } }
        `}</style>
      </section>


      {/* ── Tips by Tendr ── */}
      <TipsByTendrSection />

      {/* Become a Partner Section */}
      <section style={{ background: "#2C1A0E", padding: "96px 24px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="partner-grid">

          {/* Left: text */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CCAB4A", marginBottom: 16 }}>
              For Vendors
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 400, color: "#fff", letterSpacing: "0.01em", lineHeight: 1.2, margin: "0 0 20px" }}>
              Grow your business<br />
              <span style={{ background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                with Tendr
              </span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 420 }}>
              Join Delhi NCR's most trusted event services marketplace. Get discovered by customers actively looking for photographers, caterers, decorators, and DJs.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
              {[
                "No paid ads needed — we bring customers to you",
                "Verified profile builds trust instantly",
                "Direct chat with clients before committing",
                "Grow your reviews and ranking over time",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(204,171,74,0.2)", border: "1.5px solid rgba(204,171,74,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#CCAB4A", flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 14.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/vendor/register")}
              style={{ background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 16, fontWeight: 600, fontFamily: "'Outfit', sans-serif", cursor: "pointer", boxShadow: "0 4px 18px rgba(196,122,46,0.45)", transition: "opacity 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              List Your Service →
            </button>
          </div>

          {/* Right: 3 steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { num: "01", title: "Submit Your Details", desc: "Fill in your name, phone, and address. Takes under 2 minutes." },
              { num: "02", title: "Get Verified", desc: "Our team reviews your profile and approves your listing within 24–48 hours." },
              { num: "03", title: "Start Receiving Bookings", desc: "Go live on Tendr and get discovered by customers across Delhi NCR." },
            ].map((step, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 24px", display: "flex", gap: 20, alignItems: "flex-start" }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: "#CCAB4A", lineHeight: 1, flexShrink: 0, fontFamily: "'Outfit', sans-serif" }}>{step.num}</span>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>{step.title}</h4>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.55 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`.partner-grid { } @media (max-width: 768px) { .partner-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* Footer */}
      <Footer />

      {/* ── Fun Activity detail modal ── */}
      {faModal && (
        <>
          <div onClick={() => setFaModal(null)} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.46)", backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 2001, width: "min(92vw,440px)", maxHeight: "82vh", borderRadius: 22, background: "#FFFCF5", boxShadow: "0 24px 72px rgba(44,26,14,0.28)", overflow: "hidden", fontFamily: "'Outfit',sans-serif", display: "flex", flexDirection: "column" }}>
            {/* Gradient photo header — fixed, not scrollable */}
            <div style={{ background: "linear-gradient(135deg,#FFF3E0,#FFE0B2)", padding: "32px 24px 24px", position: "relative", textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 12 }}>{faModal.emoji}</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: "0 0 4px", lineHeight: 1.2 }}>{faModal.name}</h3>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#C47A2E" }}>₹{faModal.price.toLocaleString()}{faModal.perUnit ? <span style={{ fontSize: 11, fontWeight: 500 }}> /{faModal.unitLabel}</span> : ""}</span>
                {faModal.duration && <span style={{ fontSize: 12, color: "#9B7450", alignSelf: "center" }}>· {faModal.duration}</span>}
                {faModal.guests && <span style={{ fontSize: 12, color: "#9B7450", alignSelf: "center" }}>· {faModal.guests}</span>}
              </div>
              <button onClick={() => setFaModal(null)} style={{ position: "absolute", top: 12, right: 14, width: 30, height: 30, borderRadius: "50%", background: "rgba(44,26,14,0.12)", border: "none", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2C1A0E" }}>✕</button>
            </div>
            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 8px" }}>
              <p style={{ fontSize: 13.5, color: "#4A2810", lineHeight: 1.65, margin: "0 0 16px" }}>{faModal.desc}</p>
              {faModal.includes?.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>What's Included</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {faModal.includes.map((item, idx) => (
                      <span key={idx} style={{ fontSize: 11.5, background: "rgba(196,122,46,0.08)", color: "#2C1A0E", borderRadius: 100, padding: "3px 10px", fontWeight: 600 }}>✓ {item}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Sticky footer — Book Now always visible */}
            <div style={{ flexShrink: 0, padding: "12px 24px 20px", borderTop: "1px solid rgba(196,122,46,0.12)", background: "#FFFCF5" }}>
              <button
                onClick={() => { setFaModal(null); navigate("/fun-activities"); }}
                style={{ width: "100%", padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 16px rgba(196,122,46,0.35)", letterSpacing: "0.01em" }}>
                Book Now →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Occasion Planner Modal ── */}
      {plannerOccasion !== null && (
        <OccasionPlanner
          initialOccasion={plannerOccasion || null}
          onClose={() => setPlannerOccasion(null)}
        />
      )}
    </div>
  );
};

export default Home;

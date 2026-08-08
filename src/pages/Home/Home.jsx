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
import IndependenceDayFlow from "../independence-day/IndependenceDayFlow";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import Footer from "../../components/Footer";
import { easeIn, motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import corpo from "../../assets/ui/corpo.jpg";
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
    tag: "Gift Hampers",
    headline: "Custom gift hampers delivered to your door",
    desc: "Order personalised gift hampers and curated kits for birthdays, anniversaries and every occasion.",
    where: "Gift Hampers",
    href: "/gift-hampers-cakes",
    emoji: "🎁",
  },
  {
    tag: "Stationery by Tendr",
    headline: "Design beautiful stationery for your wedding",
    desc: "Create custom wedding invitations, menus and stationery with our ready-made designer templates.",
    where: "Memories → Stationery by Tendr",
    href: "/stationery",
    emoji: "💌",
  },
  {
    tag: "Stationery by Tendr",
    headline: "Beautiful stationery for every celebration",
    desc: "From invitations to menus and table cards — order premium printed stationery delivered to your door.",
    where: "Stationery by Tendr",
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
    <section style={{ background: "#1C0E04", padding: "72px 24px 80px", fontFamily: font, position: "relative", overflow: "hidden" }}>
      {/* Ambient gold glow blobs */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(204,171,74,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,122,46,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(204,171,74,0.1)", border: "1px solid rgba(204,171,74,0.22)", borderRadius: 100, padding: "5px 14px", marginBottom: 14 }}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.14em" }}>Tips by Tendr</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 400, color: "#FFF8EC", letterSpacing: "0.01em", lineHeight: 1.15, margin: "0 0 8px" }}>
              Free Event Planning Guides
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,247,235,0.5)", margin: 0, lineHeight: 1.65, maxWidth: 480 }}>
              Practical guides for budgeting, decorating, and planning any event. Unlock with a WhatsApp number.
            </p>
          </div>
          <button
            onClick={() => navigate("/guides")}
            style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid rgba(204,171,74,0.28)", background: "transparent", color: "#CCAB4A", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(204,171,74,0.1)"; e.currentTarget.style.borderColor = "rgba(204,171,74,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(204,171,74,0.28)"; }}
          >
            View All Guides →
          </button>
        </motion.div>

        {/* Guide cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {preview.map((guide, gi) => (
            <motion.div
              key={guide.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: gi * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={() => navigate(`/guides/${guide.slug}`)}
              style={{ background: "rgba(255,247,235,0.04)", border: "1px solid rgba(204,171,74,0.1)", borderRadius: 18, padding: "24px 22px 20px", cursor: "pointer", position: "relative", overflow: "hidden" }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 340, damping: 26 } }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #C47A2E, #CCAB4A)", opacity: 0.6 }} />
              {/* Category pill in place of emoji */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(196,122,46,0.12)", borderRadius: 100, padding: "4px 12px", marginBottom: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#CCAB4A", display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.1em" }}>{guide.tags[0]}</span>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 500, color: "#FFF8EC", margin: "0 0 6px", lineHeight: 1.25, letterSpacing: "0.01em" }}>{guide.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,247,235,0.45)", margin: "0 0 18px", lineHeight: 1.6 }}>{guide.subtitle}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11.5, color: "rgba(255,247,235,0.3)" }}>{guide.readTime} · {guide.pages}pp</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#C47A2E" }}>Free →</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={() => navigate("/community")}
          style={{ marginTop: 20, padding: "18px 24px", borderRadius: 16, border: "1px solid rgba(196,122,46,0.15)", background: "rgba(196,122,46,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
          whileHover={{ borderColor: "rgba(196,122,46,0.35)", transition: { duration: 0.2 } }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#FFF8EC" }}>Community Wall</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,247,235,0.4)", marginTop: 2 }}>See real events shared by customers — photos, setups, and ideas.</div>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#C47A2E" }}>Explore →</span>
        </motion.div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = React.useState(null);
  const navigate = useNavigate();
  return (
    <section style={{ background: "#FAF7F2", padding: "80px 24px 88px", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ textAlign: "center", marginBottom: 44 }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.22em", margin: "0 0 14px" }}>Got Questions?</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 400, color: "#1C0E04", letterSpacing: "-0.01em", margin: "0 0 12px", lineHeight: 1.1 }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: 14.5, color: "#7A5535", maxWidth: 420, margin: "0 auto", lineHeight: 1.65 }}>
            Everything you need to know before you start planning.
          </p>
        </motion.div>

        {/* FAQ items — spring accordion */}
        <motion.div
          style={{ display: "flex", flexDirection: "column" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {FAQS.map(({ q, a }, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } } }}
              style={{
                borderTop: i === 0 ? "1px solid rgba(196,122,46,0.18)" : "none",
                borderBottom: "1px solid rgba(196,122,46,0.18)",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 4px", background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "left", gap: 20 }}
              >
                <span style={{ fontSize: 14.5, fontWeight: open === i ? 600 : 500, color: open === i ? "#1C0E04" : "#3B2410", lineHeight: 1.45, transition: "color 0.18s" }}>{q}</span>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  border: `1.5px solid ${open === i ? "#C47A2E" : "rgba(196,122,46,0.3)"}`,
                  background: open === i ? "linear-gradient(135deg,#C47A2E,#D4A848)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.22s ease",
                }}>
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={open === i ? "#fff" : "#C47A2E"} strokeWidth={2.5} strokeLinecap="round">
                    {open === i
                      ? <line x1="5" y1="12" x2="19" y2="12" />
                      : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>
                    }
                  </svg>
                </div>
              </button>
              <div style={{ maxHeight: open === i ? 400 : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
                <p style={{ margin: "0 0 20px 0", fontSize: 14, color: "#6B4A2A", lineHeight: 1.78 }}>{a}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ textAlign: "center", marginTop: 44, padding: "28px 32px", background: "#fff", borderRadius: 18, border: "1px solid rgba(196,122,46,0.14)", boxShadow: "0 2px 16px rgba(139,69,19,0.06)" }}
        >
          <p style={{ fontSize: 16, fontWeight: 700, color: "#1C0E04", margin: "0 0 5px", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.01em" }}>Still have questions?</p>
          <p style={{ fontSize: 13.5, color: "#9B7450", margin: "0 0 18px", lineHeight: 1.6 }}>Our team is happy to help you plan your perfect event.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.a
              href="https://wa.me/919211668427"
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "10px 22px", borderRadius: 10, background: "#25d366", color: "#fff", fontSize: 13.5, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(37,211,102,0.28)" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
            >
              <FaWhatsapp size={15} /> WhatsApp Us
            </motion.a>
            <motion.button
              onClick={() => navigate("/contact-us")}
              style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.28)", background: "transparent", color: "#C47A2E", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
              whileHover={{ scale: 1.03, backgroundColor: "#C47A2E", color: "#fff" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
            >
              Contact Us →
            </motion.button>
          </div>
        </motion.div>

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
  const [plannerOccasion, setPlannerOccasion] = useState(null);
  const [activePath, setActivePath] = useState(0);
  const [showIndepDay, setShowIndepDay] = useState(false);
  const [showRakhi, setShowRakhi] = useState(false);
  const [hoveredOcc, setHoveredOcc] = useState(null);
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
    { id: "gift-hampers",   tag: "Gift Hampers",           icon: "🎁", iconBg: "linear-gradient(135deg,#C47A2E,#CCAB4A)",  headline: "The perfect gift, delivered to the door",                 desc: "Curated hampers for birthdays, anniversaries and corporate celebrations.", where: "Gift Hampers", href: "/gift-hampers-cakes",  accent: "#C47A2E" },
    { id: "fun-activities",  tag: "Fun Activities",        icon: "🎭", iconBg: "linear-gradient(135deg,#C47A2E,#E8A84A)",  headline: "Add magic, games & live entertainment to any event",     desc: "Magic shows, game coordinators, dhol players, live teddy, stone art and more — fixed prices, confirmed in 2 hours.", where: "Fun Activities", href: "/fun-activities", accent: "#C47A2E" },
    { id: "stationery",      tag: "Wedding Stationeries",  icon: "💒", iconBg: "linear-gradient(135deg,#7A3A1E,#C47A2E)",  headline: "Your wedding, beautifully told — no templates, ever",    desc: "Itineraries, invitations, money envelopes, hashtag packages, coffee table booklets and more — each piece crafted exclusively for you.", where: "Wedding Stationeries", href: "/stationery", accent: "#7A3A1E" },
    { id: "baat-karo",      tag: "Baat Karo",             icon: "💬", iconBg: "linear-gradient(135deg,#25D366,#128C7E)",  headline: "Just tell us — Tendr team will handle the rest",          desc: "Write your requirements in Hindi, English or Hinglish. Our team replies on WhatsApp with vendor options, pricing and availability — no forms, no hassle.", where: "Booking → Baat Karo", href: "/baat-karo", accent: "#128C7E" },
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
      content: "Gift Hampers, Wedding Stationeries, and Fun Activities like magic shows, live bands and photo booths — all curated for your event.",
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
      <SEO title="Tendr — Celebration & Event Planning Platform in Delhi NCR" description="Plan birthdays, anniversaries, balloon decorations, surprise parties, baby showers, house parties and corporate events across Delhi, Noida, Gurgaon, Ghaziabad and Greater Noida. Compare 100+ verified vendors and book instantly." path="/" />
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
          paddingTop: 74,
          background: "#1C0E04",
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
          <div style={{ flex: "0 0 48%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px 0 64px", position: "relative", overflow: "hidden" }}>
            {/* Primary ambient orb — top right (Apple Glow Hero pattern) */}
            <div aria-hidden style={{ position: "absolute", top: "-22%", right: "-16%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,122,46,0.28) 0%, rgba(196,122,46,0.1) 40%, transparent 70%)", pointerEvents: "none" }} />
            {/* Secondary ambient orb — bottom left */}
            <div aria-hidden style={{ position: "absolute", bottom: "-18%", left: "-14%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(204,171,74,0.16) 0%, transparent 65%)", pointerEvents: "none" }} />
            {/* Centre warmth — mid-depth glow */}
            <div aria-hidden style={{ position: "absolute", top: "38%", left: "42%", transform: "translate(-50%,-50%)", width: 480, height: 360, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(196,122,46,0.07) 0%, transparent 72%)", pointerEvents: "none" }} />
            {/* Fine grid texture — replaces dot grid for more editorial feel */}
            <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(204,171,74,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(204,171,74,0.04) 1px, transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />
            {/* Large decorative "T" lettermark — watermark behind content */}
            <div aria-hidden style={{ position: "absolute", top: "-8%", left: "-12%", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "min(50vw, 480px)", fontWeight: 700, fontStyle: "italic", color: "rgba(196,122,46,0.042)", lineHeight: 1, pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none", letterSpacing: "-0.03em", zIndex: 0 }}>T</div>
            {/* Top horizontal hairline accent */}
            <div aria-hidden style={{ position: "absolute", top: 0, left: "18%", right: "18%", height: 1, background: "linear-gradient(90deg, transparent, rgba(196,122,46,0.32), transparent)", pointerEvents: "none" }} />
            {/* Right-edge gold hairline separator */}
            <div aria-hidden style={{ position: "absolute", top: "6%", bottom: "6%", right: 0, width: 1, background: "linear-gradient(180deg, transparent, rgba(196,122,46,0.4) 28%, rgba(204,171,74,0.48) 72%, transparent)", pointerEvents: "none" }} />

            {/* Mobile only: 4 service shortcuts — SVG icons, editorial style */}
            <div className="hero-mobile-cats" data-tour="mob-icon-row" style={{ display: "none", marginBottom: 20, position: "relative", zIndex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[
                  { label: "Vendors", isVendors: true, path: null,
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                  { label: "Hampers", isVendors: false, path: "/gift-hampers-cakes",
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> },
                  { label: "Activities", isVendors: false, path: "/fun-activities",
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
                  { label: "Stationery", isVendors: false, path: "/stationery",
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
                ].map(({ icon, label, path, isVendors }) => (
                  <button key={label}
                    onClick={() => isVendors ? setVendorStripOpen(o => !o) : navigate(path)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "12px 6px", background: isVendors && vendorStripOpen ? "rgba(196,122,46,0.18)" : "rgba(255,248,236,0.05)", border: `1px solid ${isVendors && vendorStripOpen ? "rgba(196,122,46,0.5)" : "rgba(255,248,236,0.08)"}`, borderRadius: 14, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.18s", color: isVendors && vendorStripOpen ? "#CCAB4A" : "rgba(255,248,236,0.72)" }}>
                    {vendorStripOpen && isVendors
                      ? <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9"/></svg>
                      : icon}
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.2, textAlign: "center" }}>{label}</span>
                  </button>
                ))}
              </div>
              {/* Vendor sub-strip — SVG icons */}
              {vendorStripOpen && (
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {[
                    { label: "Decorator", path: "/search?categories=Decorator",
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="3.5"/><path d="M10 10L4 20h16"/><path d="M4 20h4l4-7"/></svg> },
                    { label: "Caterer", path: "/search?categories=Caterer",
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
                    { label: "Photo", path: "/search?categories=Photographer",
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
                    { label: "DJ", path: "/search?categories=DJ",
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 9v-7"/><path d="M15.5 12.5L21 9"/><path d="M12 15v7"/><path d="M8.5 12.5L3 9"/></svg> },
                  ].map(({ icon, label, path }) => (
                    <button key={label} onClick={() => { setVendorStripOpen(false); navigate(path); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 4px", background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.18)", borderRadius: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif", color: "#CCAB4A" }}>
                      {icon}
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.2 }}>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Headline block — stagger entrance (ui-ux-pro-max: stagger-sequence, spring-physics) */}
            <div style={{ marginBottom: 28 }}>
              {/* Badge */}
              <motion.div
                className="home-hero-badge"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(204,171,74,0.1)", border: "1px solid rgba(204,171,74,0.3)", borderRadius: 100, padding: "5px 13px", marginBottom: 20, position: "relative", zIndex: 1 }}
              >
                <span style={{ position: "relative", width: 6, height: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ position: "absolute", width: 12, height: 12, borderRadius: "50%", background: "rgba(204,171,74,0.3)", animation: "tendrPing 1.8s cubic-bezier(0,0,0.2,1) infinite" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#CCAB4A", display: "inline-block", position: "relative" }} />
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CCAB4A" }}>Delhi NCR's Celebration Platform</span>
              </motion.div>

              <motion.h1
                className="home-hero-h1"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.08 }}
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.85rem, 3vw, 2.72rem)", fontWeight: 300, lineHeight: 1.08, color: "#FFF8EC", marginBottom: 14, letterSpacing: "-0.02em", position: "relative", zIndex: 1 }}
              >
                Everything your<br />event needs.&nbsp;
                <span style={{ position: "relative", display: "inline-block" }}>
                  {/* Glow halo behind gradient text — Apple Glow Hero pattern */}
                  <span aria-hidden style={{ position: "absolute", inset: "-8px -12px", borderRadius: 12, background: "radial-gradient(ellipse, rgba(196,122,46,0.38) 0%, transparent 72%)", filter: "blur(12px)", pointerEvents: "none" }} />
                  <em style={{ fontStyle: "italic", fontWeight: 700, background: "linear-gradient(135deg,#C47A2E 0%,#D4A848 50%,#CCAB4A 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", position: "relative" }}>
                    One place.
                  </em>
                </span>
              </motion.h1>

              <motion.p
                className="home-hero-para"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.16 }}
                style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,247,235,0.62)", lineHeight: 1.75, maxWidth: 348, margin: 0, letterSpacing: "0.005em", position: "relative", zIndex: 1 }}
              >
                Birthdays, anniversaries, house parties and more — find verified vendors, plan every detail, and book everything across Delhi NCR.
              </motion.p>
            </div>

            {/* CTA row — primary action dominant, seasonal events subordinate (ui-ux-pro-max: primary-action) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.24 }}
              style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", position: "relative", zIndex: 1 }}
            >
              {/* Primary CTA */}
              <button
                onClick={() => navigate("/booking")}
                className="home-hero-cta"
                style={{ background: "linear-gradient(135deg, #C47A2E 0%, #D4A848 100%)", color: "#fff", fontSize: 14.5, fontWeight: 600, letterSpacing: "0.02em", padding: "11px 28px", borderRadius: 11, border: "none", cursor: "pointer", boxShadow: "0 4px 22px rgba(196,122,46,0.5)", transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(196,122,46,0.65)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 22px rgba(196,122,46,0.5)"; }}
              >
                Start Planning →
              </button>

              {/* Divider */}
              <div style={{ width: 1, height: 22, background: "rgba(204,171,74,0.25)", flexShrink: 0 }} />

              {/* Seasonal — subordinate ghost-pill style */}
              <button
                onClick={() => navigate("/rakhi-hampers")}
                className="home-seasonal-btn"
                style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.32)", color: "rgba(255,247,235,0.8)", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 100, cursor: "pointer", transition: "all 0.18s", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.2)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.55)"; e.currentTarget.style.color = "#FFF8EC"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(196,122,46,0.1)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.32)"; e.currentTarget.style.color = "rgba(255,247,235,0.8)"; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Rakhi Hampers
              </button>
              <button
                onClick={() => setShowIndepDay(true)}
                className="home-seasonal-btn"
                style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,153,51,0.08)", border: "1px solid rgba(255,153,51,0.28)", color: "rgba(255,247,235,0.8)", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 100, cursor: "pointer", transition: "all 0.18s", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,153,51,0.16)"; e.currentTarget.style.borderColor = "rgba(255,153,51,0.48)"; e.currentTarget.style.color = "#FFF8EC"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,153,51,0.08)"; e.currentTarget.style.borderColor = "rgba(255,153,51,0.28)"; e.currentTarget.style.color = "rgba(255,247,235,0.8)"; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF9933" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                Independence Day
              </button>
            </motion.div>

            {/* Social proof trust bar — below CTAs */}
            <motion.div
              className="home-hero-trust"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.34 }}
              style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, position: "relative", zIndex: 1, flexWrap: "wrap" }}
            >
              {/* Star rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#CCAB4A" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                <span style={{ fontSize: 11, color: "#CCAB4A", fontWeight: 700, marginLeft: 5, fontFamily: "'Outfit',sans-serif", letterSpacing: "0.02em" }}>4.9</span>
              </div>
              <div style={{ width: 1, height: 14, background: "rgba(204,171,74,0.2)", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "rgba(255,247,235,0.4)", fontFamily: "'Outfit',sans-serif", letterSpacing: "0.04em" }}>500+ verified vendors</span>
              <div style={{ width: 1, height: 14, background: "rgba(204,171,74,0.2)", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "rgba(255,247,235,0.4)", fontFamily: "'Outfit',sans-serif", letterSpacing: "0.04em" }}>Delhi · Noida · NCR</span>
            </motion.div>

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
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(204,171,74,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12, display: "block", margin: "0 auto 12px" }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>Loading gallery</div>
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

      {/* ── Mobile photo strip — Editorial Image Hero pattern (felipemenezes098/hero-05) ── */}
      {/* Shows below hero on mobile, hidden on desktop */}
      <div className="home-mob-img-strip" style={{ display: "none", background: "#1C0E04", paddingBottom: 0, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
        <style>{`.home-mob-img-strip::-webkit-scrollbar{display:none}`}</style>
        <div style={{ display: "flex", gap: 10, padding: "0 20px 20px" }}>
          {CELEBRATION_PHOTOS.map((p, i) => (
            <div key={i} style={{ flexShrink: 0, width: "72vw", maxWidth: 280, borderRadius: 16, overflow: "hidden", position: "relative", scrollSnapAlign: "start", aspectRatio: "3/4" }}>
              <img src={p.url} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,14,4,0.72) 0%, transparent 55%)", pointerEvents: "none" }} />
              <span style={{ position: "absolute", bottom: 14, left: 14, fontSize: 11, fontWeight: 700, color: "#FFF8EC", fontFamily: "'Outfit',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.88 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Marquee strip — right under hero text ── */}
      {(() => {
        const GROUPS = [
          { label: "Cities", color: "#CCAB4A", items: ["Delhi", "Noida", "Gurgaon", "Ghaziabad", "Greater Noida"] },
          { label: "Services", color: "#E8C87A", items: ["Photography", "Catering", "DJ & Music", "Decoration", "Balloon Setup", "Fun Activities"] },
          { label: "Events", color: "#CCAB4A", items: ["Birthday Parties", "Anniversaries", "Corporate Events", "Baby Showers", "House Parties", "Surprise Setups"] },
          { label: "Platform", color: "#E8C87A", items: ["Delhi NCR's Trusted Platform", "Free to Browse", "Instant Chat", "100+ Verified Vendors", "Verified Reviews", "Same-Day Support"] },
        ];

        const strip = [...GROUPS, ...GROUPS]; // duplicate for seamless loop

        return (
          <div style={{
            background: "#1C0E04",
            borderTop: "1px solid rgba(204,171,74,0.12)",
            borderBottom: "1px solid rgba(204,171,74,0.12)",
            padding: "11px 0", overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", width: "max-content", animation: "tendr-marquee 40s linear infinite" }}>
              {strip.map((group, gi) => (
                <React.Fragment key={gi}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
                    {group.items.map((item, ii) => (
                      <React.Fragment key={ii}>
                        <span style={{ color: group.color, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", whiteSpace: "nowrap", textTransform: "uppercase" }}>
                          {item}
                        </span>
                        {ii < group.items.length - 1 && (
                          <span style={{ color: "rgba(204,171,74,0.3)", fontSize: 10, padding: "0 10px" }}>·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </span>
                  <span style={{
                    display: "inline-block", width: 1, height: 14,
                    background: "linear-gradient(180deg,transparent,rgba(204,171,74,0.5),transparent)",
                    margin: "0 28px", verticalAlign: "middle", flexShrink: 0,
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
        @keyframes tendrPing {
          0%   { transform: scale(0.85); opacity: 0.9; }
          70%  { transform: scale(1.9);  opacity: 0; }
          100% { transform: scale(0.85); opacity: 0; }
        }
        .hero-desktop-search { display: flex !important; }
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
          .hero-desktop-search { display: none !important; }
        }
      `}</style>

      {/* ── Rakhi Hampers Banner ── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45 }}
        style={{ background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 60%,#3A200C 100%)", padding: "36px 24px", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 5% 50%, rgba(204,171,74,0.07), transparent 40%), radial-gradient(circle at 95% 50%, rgba(196,122,46,0.06), transparent 40%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* SVG thread/ribbon icon */}
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(204,171,74,0.12)", border: "1px solid rgba(204,171,74,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>Raksha Bandhan Special</div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.4rem,2.8vw,2rem)", fontWeight: 300, color: "#fff", lineHeight: 1.15 }}>
                Rakhi Hampers, curated for your loved ones
              </div>
            </div>
          </div>
          <motion.button
            onClick={() => navigate("/rakhi-hampers")}
            style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, padding: "13px 28px", borderRadius: 10, border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "'Outfit', sans-serif" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          >
            Explore Now →
          </motion.button>
        </div>
      </motion.section>

      {/* ── Plan by Occasion ── */}
      <section id="plan-by-occasion" style={{ background: "#F5EFE6", padding: "76px 28px 84px", fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>
        {/* Ambient warm glow */}
        <div aria-hidden style={{ position: "absolute", top: -100, right: -60, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,122,46,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, flexWrap: "wrap", gap: 16 }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 1.5, background: "linear-gradient(90deg, #C47A2E, #CCAB4A)" }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.3em", fontFamily: "'Outfit', sans-serif" }}>Plan by Occasion</span>
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,3.4vw,2.8rem)", fontWeight: 600, color: "#1C0E04", margin: 0, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                What's the{" "}
                <em style={{ fontStyle: "italic", fontWeight: 700, background: "linear-gradient(135deg,#C47A2E 0%,#CCAB4A 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>occasion?</em>
              </h2>
            </div>
            <button
              onClick={() => setShowIndepDay(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.72)", border: "1px solid rgba(196,122,46,0.28)", borderRadius: 100, padding: "9px 18px 9px 14px", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Outfit',sans-serif", backdropFilter: "blur(8px)", boxShadow: "0 2px 10px rgba(196,122,46,0.07)", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 22px rgba(196,122,46,0.16)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.45)"; e.currentTarget.style.background = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(196,122,46,0.07)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.28)"; e.currentTarget.style.background = "rgba(255,255,255,0.72)"; }}
            >
              <span style={{ fontSize: 16 }}>🇮🇳</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#2C1A0E" }}>Independence Day</span>
              <span style={{ fontSize: 11, color: "#C47A2E", fontWeight: 700 }}>→</span>
            </button>
          </motion.div>

          {/* Single-row strip — hover-reveal: non-hovered cards dim */}
          <div className="occ-strip" style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 6 }}>
            {[
              { label: "Birthday",        photo: "/occasions/birthday-mobile.png" },
              { label: "Anniversary",     photo: "/occasions/anniversary-mobile.png" },
              { label: "Baby Shower",     photo: "/occasions/baby-shower-mobile.png" },
              { label: "House Party",     photo: "/occasions/house-party-mobile.png" },
              { label: "Housewarming",    photo: "/occasions/housewarming-mobile.png" },
              { label: "Get Together",    photo: "/occasions/get-together-mobile.png" },
              { label: "Kitty Party",     photo: "/occasions/kitty-party-mobile.png" },
              { label: "Naming Ceremony", photo: "/occasions/naming-ceremony-mobile.png" },
            ].map(({ label, photo }, i) => {
              const isHovered = hoveredOcc === label;
              const isDimmed  = hoveredOcc !== null && !isHovered;
              return (
                <motion.button
                  key={label}
                  onClick={() => setPlannerOccasion(label)}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.04 }}
                  whileHover={{ y: -5, scale: 1.02, boxShadow: "0 14px 36px rgba(28,14,4,0.22)" }}
                  onHoverStart={() => setHoveredOcc(label)}
                  onHoverEnd={() => setHoveredOcc(null)}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    width: 128,
                    height: 172,
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "none",
                    background: "#D4C0A8",
                    cursor: "pointer",
                    padding: 0,
                    display: "block",
                    opacity: isDimmed ? 0.52 : 1,
                    transition: "opacity 0.28s ease",
                    boxShadow: "0 2px 8px rgba(28,14,4,0.08)",
                  }}
                >
                  <motion.img
                    src={photo} alt={label} loading="lazy"
                    animate={{ scale: isHovered ? 1.09 : 1 }}
                    transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", transformOrigin: "center" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,2,0,0.88) 0%, rgba(6,2,0,0.18) 52%, transparent 100%)" }} />
                  <motion.div
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ position: "absolute", inset: 0, borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.6)", pointerEvents: "none" }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 10px 10px" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, fontWeight: 600, fontStyle: "italic", color: "#fff", display: "block", lineHeight: 1.25, textShadow: "0 1px 4px rgba(0,0,0,0.45)" }}>{label}</span>
                    <motion.span
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ fontSize: 9.5, color: "#CCAB4A", fontWeight: 600, display: "block", marginTop: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}
                    >Explore →</motion.span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <style>{`.occ-strip::-webkit-scrollbar { display: none; }`}</style>
        </div>
      </section>
      {/* ── END Plan by Occasion ── */}

      {/* ── Which path is for you ── */}
      {(() => {
        const PATHS = [
          {
            title: "Browse & Search",
            hook: "You know exactly what you want",
            tag: "Self-directed",
            steps: [
              { n: "01", text: "Search by vendor type — Photographer, Caterer, DJ, Decorator" },
              { n: "02", text: "Filter by location and budget, compare profiles side by side" },
              { n: "03", text: "Chat directly to confirm price — no middlemen, no commission" },
            ],
            cta: "Browse Vendors",
            action: () => navigate("/listings"),
          },
          {
            title: "Smart Planning",
            hook: "You want the best vendors for your budget",
            tag: "Guided",
            steps: [
              { n: "01", text: "Tell us your event type, date, guest count and total budget" },
              { n: "02", text: "We shortlist verified vendors that fit your requirements" },
              { n: "03", text: "Review, chat and confirm — we handle all the matching" },
            ],
            cta: "Start Planning",
            action: () => navigate("/booking"),
          },
          {
            title: "By Occasion",
            hook: "You have an occasion in mind",
            tag: "Occasion-first",
            steps: [
              { n: "01", text: "Pick your celebration — Birthday, Anniversary, House Party…" },
              { n: "02", text: "Browse curated ideas and vendor packages for that occasion" },
              { n: "03", text: "Book everything in one place, all in under 10 minutes" },
            ],
            cta: "Pick Occasion",
            action: () => document.getElementById("plan-by-occasion")?.scrollIntoView({ behavior: "smooth" }),
          },
        ];
        const ap = PATHS[activePath];
        return (
          <section style={{ background: "#F5EFE6", padding: "80px 28px 88px", fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ maxWidth: 1080, margin: "0 auto" }}>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ marginBottom: 48 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 1.5, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)" }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.28em" }}>Find your way</span>
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,3.4vw,2.8rem)", fontWeight: 600, color: "#1C0E04", margin: 0, lineHeight: 1.06, letterSpacing: "-0.02em" }}>
                  Which path suits you?
                </h2>
              </motion.div>

              <div className="path-two-col" style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 20, alignItems: "stretch" }}>

                {/* Left: tab pills — no numbered badges, clean state clarity (ui-ux-pro-max: state-clarity) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PATHS.map((p, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setActivePath(i)}
                      whileHover={{ x: activePath === i ? 0 : 3 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      style={{
                        textAlign: "left",
                        cursor: "pointer",
                        fontFamily: "'Outfit', sans-serif",
                        background: activePath === i ? "#fff" : "rgba(255,255,255,0.45)",
                        borderRadius: 14,
                        padding: "20px 22px",
                        border: "1px solid",
                        borderColor: activePath === i ? "rgba(196,122,46,0.28)" : "rgba(196,122,46,0.1)",
                        borderLeft: `3px solid ${activePath === i ? "#C47A2E" : "rgba(196,122,46,0.12)"}`,
                        boxShadow: activePath === i ? "0 6px 28px rgba(196,122,46,0.13)" : "none",
                        transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s",
                        outline: "none",
                      }}
                    >
                      {/* Tag pill */}
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: activePath === i ? "#C47A2E" : "#B8956A", textTransform: "uppercase", letterSpacing: "0.16em", display: "block", marginBottom: 8 }}>
                        {p.tag}
                      </span>
                      <p style={{ fontSize: 15, fontWeight: 600, color: activePath === i ? "#1C0E04" : "#6B4528", margin: "0 0 5px", lineHeight: 1.3, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        {p.title}
                      </p>
                      <p style={{ fontSize: 12.5, color: activePath === i ? "#7A5535" : "rgba(107,69,40,0.6)", margin: 0, lineHeight: 1.45 }}>
                        {p.hook}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {/* Right: dark panel — strong contrast, premium feel */}
                <div style={{ background: "#1C0E04", borderRadius: 20, padding: "36px 36px 32px", position: "relative", overflow: "hidden" }}>
                  {/* Ambient glow */}
                  <div aria-hidden style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,122,46,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

                  {/* AnimatePresence for content switch (ui-ux-pro-max: motion-meaning) */}
                  <motion.div
                    key={activePath}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <p style={{ fontSize: 9.5, fontWeight: 700, color: "rgba(196,122,46,0.7)", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 12px" }}>How it works</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.25rem,2.2vw,1.55rem)", fontWeight: 600, fontStyle: "italic", color: "rgba(255,247,235,0.92)", margin: "0 0 32px", lineHeight: 1.28 }}>
                      {ap.hook}
                    </p>

                    {/* Steps — clean numbered lines, no circle bubbles */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                      {ap.steps.map(({ n, text }, i) => (
                        <motion.div
                          key={n}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                          style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                        >
                          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(196,122,46,0.6)", letterSpacing: "0.1em", minWidth: 22, paddingTop: 2, fontFamily: "monospace" }}>{n}</span>
                          <div style={{ flex: 1, borderTop: "1px solid rgba(255,247,235,0.07)", paddingTop: 12 }}>
                            <p style={{ fontSize: 13.5, color: "rgba(255,247,235,0.72)", margin: 0, lineHeight: 1.65, fontWeight: 400 }}>{text}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <button
                      onClick={ap.action}
                      style={{ background: "linear-gradient(135deg,#C47A2E,#D4A848)", color: "#fff", fontSize: 13.5, fontWeight: 600, padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 18px rgba(196,122,46,0.38)", transition: "transform 0.2s, box-shadow 0.2s", letterSpacing: "0.02em" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(196,122,46,0.5)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(196,122,46,0.38)"; }}
                    >
                      {ap.cta} →
                    </button>
                  </motion.div>
                </div>

              </div>
            </div>
            <style>{`@media (max-width: 760px) { .path-two-col { grid-template-columns: 1fr !important; } }`}</style>
          </section>
        );
      })()}

      {/* ── Everything for your celebration ── */}
      <section style={{ background: "#FAF7F2", padding: "72px 28px 80px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 1.5, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)" }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.28em" }}>Built for your event</span>
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.9rem,3.2vw,2.6rem)", fontWeight: 600, color: "#1C0E04", margin: 0, lineHeight: 1.06, letterSpacing: "-0.02em" }}>
                Everything for your celebration
              </h2>
            </div>
          </motion.div>

          {/* Bento grid — 4 cols, warm tiles, stagger entrance (21st.dev bento + ui-ux-pro-max stagger-sequence) */}
          <div className="efc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Wedding Stationeries", desc: "Invitations, itineraries & thank you cards", href: "/stationery", span: 2,
                icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg> },
              { label: "Event Timeline",       desc: "Day-by-day countdown for your event",        href: "/timeline-picker", span: 1,
                icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14" strokeWidth={2.5}/><line x1="12" y1="14" x2="16" y2="14"/></svg> },
              { label: "Budget Allocator",     desc: "Track every rupee across all categories",    href: "/budget-picker", span: 1,
                icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z"/><path d="M20 12h-4a2 2 0 0 0 0 4h4"/></svg> },
              { label: "Fun Activities",       desc: "Magic shows, games & live entertainment",    href: "/fun-activities", span: 1,
                icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
              { label: "Find by Style",        desc: "Upload a photo, match your vibe",            href: "/find-by-style", span: 1,
                icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
              { label: "Gift Hampers",         desc: "Curated hampers delivered to your door",     href: "/gift-hampers-cakes", span: 2,
                icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C10 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C14 2 12 7 12 7z"/></svg> },
              { label: "Upcoming Events",      desc: "See your confirmed bookings & documents",    href: "__upcoming__", span: 1,
                icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
              { label: "Tips by Tendr",        desc: "Free guides, ideas and planning checklists", href: "/guides", span: 1,
                icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.17-3 5.2V17H9v-2.8C7.21 13.17 6 11.22 6 9a6 6 0 0 1 6-6z"/></svg> },
            ].map(({ label, desc, href, icon, span }, i) => (
              <motion.div
                key={label}
                className="efc-tile"
                onClick={() => {
                  if (href === "__upcoming__") {
                    if (isSignedIn) navigate("/dashboard");
                    else navigate("/login", { state: { returnTo: "/dashboard" } });
                  } else navigate(href);
                }}
                /* stagger entrance (ui-ux-pro-max: stagger-sequence, spring-physics) */
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ type: "spring", stiffness: 240, damping: 22, delay: i * 0.04 }}
                whileHover={{ y: -4, scale: 1.01 }}
                style={{
                  gridColumn: span > 1 ? `span ${span}` : undefined,
                  background: "#fff",
                  border: "1px solid rgba(196,122,46,0.12)",
                  borderRadius: 16,
                  padding: span > 1 ? "24px 26px" : "20px 20px 18px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: span > 1 ? 14 : 10,
                  boxShadow: "0 1px 4px rgba(28,14,4,0.04)",
                  transition: "border-color 0.22s, box-shadow 0.22s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.3)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.12)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}
              >
                {/* Icon pill */}
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, rgba(196,122,46,0.1) 0%, rgba(204,171,74,0.07) 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C47A2E", flexShrink: 0 }}>
                  {icon}
                </div>

                {/* Label + arrow */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontSize: span > 1 ? 15 : 13.5, fontWeight: 600, color: "#1C0E04", lineHeight: 1.28, fontFamily: "'Outfit', sans-serif" }}>{label}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2, color: "rgba(196,122,46,0.4)" }}>
                    <path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Description */}
                <span style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.5, display: "block" }}>{desc}</span>

                {/* Wide tile: subtle warm wash at bottom-right */}
                {span > 1 && (
                  <div aria-hidden style={{ position: "absolute", bottom: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,122,46,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
                )}
              </motion.div>
            ))}
          </div>

          <style>{`
            @media (max-width: 640px) {
              .efc-grid { display: flex !important; overflow-x: auto !important; gap: 10px !important; padding-bottom: 8px !important; scrollbar-width: none; }
              .efc-grid::-webkit-scrollbar { display: none; }
              .efc-tile { min-width: 148px !important; max-width: 148px !important; flex-shrink: 0 !important; }
            }
            @media (min-width: 641px) and (max-width: 900px) {
              .efc-grid { grid-template-columns: repeat(2,1fr) !important; }
              .efc-tile[style*="span 2"] { grid-column: span 2 !important; }
            }
          `}</style>
        </div>
      </section>

      {/* ── Live Entertainment Add-ons ── */}
      <section style={{ background:"#FAF7F2", padding:"72px 24px 68px", fontFamily:"'Outfit', sans-serif", borderTop:"1px solid rgba(196,122,46,0.07)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>

          {/* Editorial split header */}
          <motion.div
            className="fa-header-grid"
            style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px 64px", alignItems:"end", marginBottom:36 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.28em", textTransform:"uppercase", color:"#C47A2E", margin:"0 0 18px" }}>Live Entertainment</p>
              <h2 style={{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"clamp(2rem,3.8vw,2.9rem)", fontWeight:300, color:"#1C0E04", margin:0, letterSpacing:"0.01em", lineHeight:1.08 }}>
                Add some magic<br />to your event.
              </h2>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16, paddingBottom:"0.2em" }}>
              <p style={{ fontSize:14.5, color:"#7A5535", margin:0, lineHeight:1.72 }}>
                Fixed-price entertainment — magic shows, game zones, live counters and more. Confirmed within 2 hours.
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <button onClick={() => scrollFaCarousel(-1)}
                  style={{ width:36, height:36, borderRadius:"50%", border:"1.5px solid rgba(196,122,46,0.28)", background:"transparent", color:"#C47A2E", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="#C47A2E";e.currentTarget.style.color="#fff";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#C47A2E";}}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button onClick={() => scrollFaCarousel(1)}
                  style={{ width:36, height:36, borderRadius:"50%", border:"1.5px solid rgba(196,122,46,0.28)", background:"transparent", color:"#C47A2E", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="#C47A2E";e.currentTarget.style.color="#fff";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#C47A2E";}}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <button onClick={() => navigate("/fun-activities")}
                  style={{ background:"none", border:"1.5px solid rgba(196,122,46,0.38)", color:"#C47A2E", fontSize:13, fontWeight:600, padding:"9px 22px", borderRadius:8, cursor:"pointer", fontFamily:"'Outfit',sans-serif", letterSpacing:"0.04em", transition:"all 0.22s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="#C47A2E";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#C47A2E";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="#C47A2E";e.currentTarget.style.borderColor="rgba(196,122,46,0.38)";}}>
                  View all →
                </button>
              </div>
            </div>
          </motion.div>
          <style>{`.fa-header-grid { } @media (max-width: 720px) { .fa-header-grid { grid-template-columns: 1fr !important; gap: 16px !important; } }`}</style>

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

      {/* ── Gift Hampers ── */}
      <section style={{ background: "#F5EFE6", padding: "72px 24px 80px", fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>
        {/* Subtle radial warmth */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 10% 50%,rgba(196,122,46,0.06),transparent 50%), radial-gradient(circle at 90% 50%,rgba(204,171,74,0.05),transparent 50%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative" }}>
          <motion.div
            className="gh-band"
            style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "center" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >

            {/* Left: stacked images + text inline */}
            <div style={{ display: "flex", alignItems: "center", gap: 36, flexWrap: "wrap" }}>
              {/* Staggered thumbnails */}
              <div style={{ display: "flex", alignItems: "flex-end", flexShrink: 0, position: "relative", height: 100 }}>
                {[
                  { src: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80", h: 80 },
                  { src: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=80", h: 100 },
                  { src: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=300&q=80", h: 80 },
                ].map(({ src, h }, i) => (
                  <div key={i} style={{ width: 82, height: h, borderRadius: 14, overflow: "hidden", border: "2.5px solid #F5EFE6", flexShrink: 0, marginLeft: i > 0 ? -18 : 0, position: "relative", zIndex: i === 1 ? 2 : 1, boxShadow: "0 6px 20px rgba(28,14,4,0.14)", transition: "transform 0.2s" }}>
                    <img src={src} alt="hamper" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>

              {/* Text block */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.22em", margin: "0 0 10px" }}>Gift Hampers</p>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.5rem,2.8vw,2.1rem)", fontWeight: 600, color: "#1C0E04", margin: "0 0 10px", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                  The perfect gift,<br />delivered.
                </p>
                <p style={{ fontSize: 14, color: "#7A5535", margin: "0 0 18px", lineHeight: 1.6, maxWidth: 320 }}>
                  Curated hampers for birthdays, anniversaries &amp; corporates — delivered across Delhi NCR.
                </p>
                <div style={{ display: "flex", gap: 16 }}>
                  {["Birthday Specials", "Corporate Gifts", "Festival Hampers"].map((tag, i) => (
                    <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "#9B7450", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "4px 12px" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: CTA */}
            <motion.button
              onClick={() => navigate("/gift-hampers-cakes")}
              style={{ background: "linear-gradient(135deg,#C47A2E,#D4A848)", color: "#fff", fontSize: 14.5, fontWeight: 700, padding: "14px 30px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 6px 22px rgba(196,122,46,0.38)" }}
              whileHover={{ scale: 1.03, boxShadow: "0 12px 32px rgba(196,122,46,0.5)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
            >
              Browse Hampers →
            </motion.button>
          </motion.div>
        </div>
        <style>{`
          @media (max-width: 760px) { .gh-band { grid-template-columns: 1fr !important; gap: 24px !important; } }
        `}</style>
      </section>

      {/* ── Trust bar ── */}
      <section style={{ background: "#1C0E04", padding: "52px 24px 60px", fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>
        {/* Gold glow blobs */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 15% 60%,rgba(204,171,74,0.07),transparent 45%), radial-gradient(circle at 85% 40%,rgba(196,122,46,0.06),transparent 45%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 1, background: "linear-gradient(90deg,transparent,rgba(204,171,74,0.5))" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#CCAB4A" }}>Why Tendr</span>
              <div style={{ width: 32, height: 1, background: "linear-gradient(90deg,rgba(204,171,74,0.5),transparent)" }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.5rem,2.8vw,2.2rem)", fontWeight: 300, color: "#FFF8EC", margin: 0, lineHeight: 1.1, fontStyle: "italic", letterSpacing: "0.01em" }}>
              Built on trust. Proven by results.
            </h2>
          </div>

          {/* Stats */}
          <motion.div
            className="trust-bar-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(204,171,74,0.1)" }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {[
              {
                num: "100%",
                label: "Manually Verified",
                sub: "Every vendor personally reviewed before listing",
                icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
              },
              {
                num: "5,000+",
                label: "Events Delivered",
                sub: "Collectively by our network across Delhi NCR",
                icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
              },
              {
                num: "24 hrs",
                label: "Response Guarantee",
                sub: "A real person responds to every booking request",
                icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              },
            ].map(({ num, label, sub, icon }, i, arr) => (
              <motion.div
                key={label}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } }}
                style={{ padding: "32px 28px 28px", background: "rgba(255,255,255,0.025)", position: "relative", textAlign: "center" }}
              >
                {i < arr.length - 1 && (
                  <div style={{ position: "absolute", right: 0, top: "20%", bottom: "20%", width: 1, background: "rgba(204,171,74,0.1)" }} />
                )}
                {/* Icon */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(204,171,74,0.08)", border: "1px solid rgba(204,171,74,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {icon}
                  </div>
                </div>
                {/* Number */}
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 300, color: "#CCAB4A", lineHeight: 1, marginBottom: 8, letterSpacing: "-0.01em" }}>{num}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F5EDD9", marginBottom: 6, letterSpacing: "0.01em" }}>{label}</div>
                <div style={{ fontSize: 12, color: "rgba(245,237,217,0.4)", lineHeight: 1.5, maxWidth: 190, margin: "0 auto" }}>{sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .trust-bar-grid { grid-template-columns: 1fr !important; border-radius: 16px !important; }
          }
        `}</style>
      </section>

      {false && <JourneyFlow />}



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
          <section style={{ position: "relative", padding: "56px 24px 64px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
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
                style={{ textAlign: "center", marginBottom: 36 }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{ flex: 1, maxWidth: 100, height: 1, background: "linear-gradient(90deg,transparent,rgba(204,171,74,0.5))" }} />
                  <span style={{ color: "#CCAB4A", fontSize: 12, letterSpacing: "0.2em" }}>✦ ✦ ✦</span>
                  <div style={{ flex: 1, maxWidth: 100, height: 1, background: "linear-gradient(90deg,rgba(204,171,74,0.5),transparent)" }} />
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "#CCAB4A", margin: "0 0 16px" }}>Crafted with Love · Delhi NCR</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, color: "#FFF8EC", margin: "0 0 12px", letterSpacing: "0.02em", fontStyle: "italic", lineHeight: 1.05 }}>
                  Wedding Stationeries
                </h2>
                <p style={{ fontSize: 14, color: "rgba(255,248,236,0.5)", margin: "0 auto 24px", maxWidth: 400, lineHeight: 1.65 }}>
                  Fully personalised for your wedding — invitations, itineraries, thank you cards and more.
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
                    style={{ borderRadius: 18, overflow: "hidden", cursor: "pointer", position: "relative", minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "flex-end", boxShadow: "0 8px 32px rgba(0,0,0,0.55)", transition: "transform 0.28s, box-shadow 0.28s", border: "1px solid rgba(255,255,255,0.08)" }}
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
      <section style={{ background: "#F8F5F0", padding: "88px 24px 96px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Editorial split header */}
          <div className="portfolio-header-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px 72px", alignItems: "end", marginBottom: 52 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#C47A2E", margin: "0 0 18px" }}>From the field</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, color: "#1C0E04", letterSpacing: "0.01em", margin: 0, lineHeight: 1.06 }}>
                Real work.<br />Real vendors.
              </h2>
            </div>
            <p style={{ fontSize: 15, color: "#7A5535", maxWidth: 400, lineHeight: 1.72, margin: 0 }}>
              Every photo here is from a verified Tendr vendor's actual portfolio — showing exactly what they've delivered for clients across Delhi NCR.
            </p>
          </div>

          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
            className="events-portfolio-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {[
              { title: "Decoration",         slug: "decoration",    key: "Decoration" },
              { title: "DJ & Entertainment", slug: "entertainment",  key: "Entertainment" },
              { title: "Photography",        slug: "photography",   key: "Photography" },
              { title: "Catering",           slug: "catering",      key: "Catering" },
            ].map(({ title, slug, key }, catIdx) => {
              const catPhotos = galleryByCategory[key] || [];
              const imgIdx = catPhotos.length > 0
                ? Math.floor((glimpseCounter + catIdx * 2) / 1) % catPhotos.length
                : 0;
              const img = catPhotos[imgIdx]?.imageUrl || GALLERY_FALLBACKS[key];
              return (
              <motion.div key={title}
                variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } }}
                className="portfolio-tile"
                onClick={() => navigate(`/gallery/${slug}`)}
                style={{ position: "relative", borderRadius: 18, overflow: "hidden", cursor: "pointer", background: "#2C1A0E" }}
                onMouseEnter={e => { e.currentTarget.querySelector(".portfolio-tile-overlay").style.opacity = "1"; e.currentTarget.querySelector(".portfolio-tile-img").style.transform = "scale(1.04)"; }}
                onMouseLeave={e => { e.currentTarget.querySelector(".portfolio-tile-overlay").style.opacity = "0"; e.currentTarget.querySelector(".portfolio-tile-img").style.transform = "scale(1)"; }}
              >
                {/* Photo — tall 4:5 aspect */}
                <div className="portfolio-img-wrap" style={{ aspectRatio: "4/5", overflow: "hidden" }}>
                  <img key={img} src={img} alt={title} className="portfolio-tile-img"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", animation: "glimpseFade 0.6s ease", transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)" }} />
                </div>

                {/* Permanent bottom gradient + label */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,8,0,0.78) 0%, rgba(20,8,0,0.15) 45%, transparent 75%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 18px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#fff", letterSpacing: "0.01em", textShadow: "0 1px 6px rgba(0,0,0,0.4)", display: "block", lineHeight: 1.2 }}>{title}</span>
                  </div>
                  {catPhotos.length > 1 && (
                    <div style={{ display: "flex", gap: 4 }}>
                      {catPhotos.slice(0, Math.min(catPhotos.length, 5)).map((_, di) => (
                        <div key={di} style={{ width: 4, height: 4, borderRadius: "50%", background: di === imgIdx % Math.min(catPhotos.length, 5) ? "#CCAB4A" : "rgba(255,255,255,0.35)", transition: "background 0.3s" }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover overlay — explore CTA */}
                <div className="portfolio-tile-overlay" style={{ position: "absolute", inset: 0, background: "rgba(196,122,46,0.12)", backdropFilter: "blur(1px)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.28s ease", pointerEvents: "none" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "rgba(196,122,46,0.9)", borderRadius: 100, padding: "8px 20px", letterSpacing: "0.05em" }}>Explore →</span>
                </div>
              </motion.div>
            ); })}
          </motion.div>
        </div>
        <style>{`
          .portfolio-header-grid { }
          @media (max-width: 720px) { .portfolio-header-grid { grid-template-columns: 1fr !important; gap: 16px !important; } }
          @media (max-width: 900px) { .events-portfolio-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 520px) {
            .events-portfolio-grid {
              display: flex !important;
              overflow-x: auto !important;
              scroll-snap-type: x mandatory !important;
              gap: 12px !important;
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
            .portfolio-img-wrap { aspect-ratio: 3/4 !important; }
          }
          @keyframes glimpseFade { from { opacity: 0.4; } to { opacity: 1; } }
        `}</style>
      </section>


      {/* ── Tips by Tendr ── */}
      <TipsByTendrSection />

      {/* Become a Partner Section */}
      <section style={{ background: "#1C0E04", padding: "96px 24px 100px", fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>
        {/* Subtle dot texture overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(204,171,74,0.08) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        {/* Gold glow blobs */}
        <div style={{ position: "absolute", top: "20%", left: "-5%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,122,46,0.1),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(204,171,74,0.08),transparent 70%)", pointerEvents: "none" }} />

        <motion.div
          style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center", position: "relative" }}
          className="partner-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        >

          {/* Left: text */}
          <motion.div variants={{ hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 24 } } }}>
            {/* Social proof chip */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(204,171,74,0.1)", border: "1px solid rgba(204,171,74,0.25)", borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#CCAB4A", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#CCAB4A", letterSpacing: "0.04em" }}>200+ vendors already on Tendr</span>
            </div>

            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(204,171,74,0.6)", marginBottom: 14 }}>
              For Vendors
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,3.8vw,3rem)", fontWeight: 300, color: "#fff", letterSpacing: "0.01em", lineHeight: 1.12, margin: "0 0 20px" }}>
              Grow your business<br />
              <span style={{ fontStyle: "italic", fontWeight: 600, background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                with Tendr.
              </span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 400 }}>
              Join Delhi NCR's most trusted event marketplace. Get discovered by customers actively looking for photographers, caterers, decorators and DJs.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 36 }}>
              {[
                "No paid ads needed — we bring customers to you",
                "Verified profile builds instant credibility",
                "Direct chat with clients before committing",
                "Grow your reviews and ranking over time",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(204,171,74,0.12)", border: "1px solid rgba(204,171,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: 14.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => navigate("/vendor/register")}
                style={{ background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: "pointer", boxShadow: "0 6px 24px rgba(196,122,46,0.4)", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(196,122,46,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.4)"; }}
              >
                List Your Service →
              </button>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Free to register · No commission</span>
            </div>
          </motion.div>

          {/* Right: 3 steps */}
          <motion.div
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
            variants={{ hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 24 } } }}
          >
            {[
              { num: "01", title: "Submit Your Details", desc: "Fill in your name, phone, and address. Takes under 2 minutes." },
              { num: "02", title: "Get Verified", desc: "Our team reviews your profile and approves your listing within 24–48 hours." },
              { num: "03", title: "Start Receiving Bookings", desc: "Go live on Tendr and get discovered by customers across Delhi NCR." },
            ].map((step, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "3px solid rgba(204,171,74,0.4)", borderRadius: "0 16px 16px 0", padding: "22px 24px", display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(204,171,74,0.5)", letterSpacing: "0.05em", fontFamily: "'Outfit', sans-serif" }}>{step.num}</span>
                  {i < 2 && <div style={{ width: 1, height: 20, background: "rgba(204,171,74,0.15)" }} />}
                </div>
                <div>
                  <h4 style={{ fontSize: 15.5, fontWeight: 700, color: "#fff", margin: "0 0 6px", letterSpacing: "0.005em" }}>{step.title}</h4>
                  <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

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

      {/* ── Independence Day Flow Modal ── */}
      {showIndepDay && (
        <IndependenceDayFlow onClose={() => setShowIndepDay(false)} />
      )}
    </div>
  );
};

export default Home;

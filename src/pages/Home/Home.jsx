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
import ChatNudge from "../../components/ChatNudge";
import { AnimatePresence, easeIn, motion } from "framer-motion";
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
import { OCCASIONS } from "../../data/occasions";
import { PARTY_PLACES } from "../../data/partyPlaces";

const FunActivitiesLazy = React.lazy(() => import("../../components/FunActivitiesSection"));

const _ic = (d, sz = 16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const OCCASION_ICONS = {
  "baby-shower":     _ic(<><path d="M12 2a5 5 0 0 1 5 5c0 5-5 11-5 11S7 12 7 7a5 5 0 0 1 5-5z"/><circle cx="12" cy="7" r="2"/></>),
  "newborn-welcome": _ic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></>),
  "first-birthday":  _ic(<><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><line x1="2" y1="21" x2="22" y2="21"/><line x1="7" y1="8" x2="7" y2="11"/><line x1="12" y1="6" x2="12" y2="11"/><line x1="17" y1="8" x2="17" y2="11"/></>),
  "naming-ceremony": _ic(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>),
  "birthday-party":  _ic(<><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><line x1="2" y1="21" x2="22" y2="21"/><line x1="7" y1="8" x2="7" y2="11"/><line x1="12" y1="6" x2="12" y2="11"/><line x1="17" y1="8" x2="17" y2="11"/></>),
  "anniversary":     _ic(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>),
  "gender-reveal":   _ic(<><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></>),
  "housewarming":    _ic(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>),
  "graduation":      _ic(<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>),
  "farewell":        _ic(<><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></>),
  "retirement":      _ic(<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>),
  "get-together":    _ic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
};

const HUB_ROUTES = {
  "birthday-party":  "/birthday-hub",
  "first-birthday":  "/birthday-hub",
  "anniversary":     "/anniversary-hub",
  "baby-shower":     "/baby-shower-hub",
  "gender-reveal":   "/baby-shower-hub",
  "newborn-welcome": "/baby-shower-hub",
  "housewarming":    "/housewarming-hub",
  "get-together":    "/get-together-hub",
  "naming-ceremony": "/naming-ceremony-hub",
  "office-party":    "/office-party-hub",
};

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
  { q: "How do I open a chat with a vendor I was already talking to?", a: "Go to your Dashboard → Chats tab to see all your active vendor conversations and open them directly. You can also click the Saved Vendors icon in the top-right corner and tap 'Chat' next to any saved vendor. Alternatively, visit the vendor's profile page and click 'Request to Chat' to start a new conversation." },
];

function TipsByTendrSection() {
  const navigate = useNav();
  const font = "'Outfit', sans-serif";
  const preview = GUIDES.slice(0, 3);
  return (
    <section style={{ background: "#0E0700", padding: "56px 24px 60px", fontFamily: font }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(196,122,46,0.15)", border: "1px solid rgba(196,122,46,0.35)", borderRadius: 100, padding: "5px 14px", marginBottom: 14 }}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.14em" }}>Tips by Tendr</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, color: "#FFF8EC", letterSpacing: "-0.01em", lineHeight: 1.1, margin: "0 0 8px" }}>
              Free Event Planning Guides
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,248,236,0.58)", margin: 0, lineHeight: 1.65, maxWidth: 480 }}>
              Practical guides for budgeting, decorating, and planning any event. Unlock with a WhatsApp number.
            </p>
          </div>
          <button
            onClick={() => navigate("/guides")}
            style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid rgba(204,171,74,0.38)", background: "transparent", color: "#CCAB4A", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.12)"; e.currentTarget.style.borderColor = "rgba(204,171,74,0.65)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(204,171,74,0.38)"; }}
          >
            View All Guides →
          </button>
        </motion.div>

        {/* Guide cards — editorial book-spine style */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {preview.map((guide, gi) => (
            <motion.div
              key={guide.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: gi * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={() => navigate(`/guides/${guide.slug}`)}
              style={{ background: "#1A0F05", border: "1px solid rgba(196,122,46,0.18)", borderLeft: "3px solid #C47A2E", borderRadius: 14, padding: "18px 20px 14px", cursor: "pointer", boxShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
              whileHover={{ y: -4, boxShadow: "0 10px 32px rgba(196,122,46,0.18)", transition: { type: "spring", stiffness: 340, damping: 26 } }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(196,122,46,0.07)", borderRadius: 100, padding: "3px 10px", marginBottom: 10 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C47A2E", display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em" }}>{guide.tags[0]}</span>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#FFF8EC", margin: "0 0 12px", lineHeight: 1.25, letterSpacing: "0.01em" }}>{guide.title}</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(196,122,46,0.12)", paddingTop: 12 }}>
                <span style={{ fontSize: 11.5, color: "rgba(204,171,74,0.6)" }}>{guide.readTime} · {guide.pages}pp</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#CCAB4A" }}>Free →</span>
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
          style={{ marginTop: 16, padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(196,122,46,0.2)", background: "#1A0F05", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
          whileHover={{ borderColor: "rgba(196,122,46,0.45)", boxShadow: "0 4px 20px rgba(196,122,46,0.15)", transition: { duration: 0.2 } }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(196,122,46,0.12)", border: "1px solid rgba(196,122,46,0.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#FFF8EC" }}>Community Wall</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,248,236,0.5)", marginTop: 2 }}>See real events shared by customers — photos, setups, and ideas.</div>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#CCAB4A" }}>Explore →</span>
        </motion.div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = React.useState(null);
  const navigate = useNavigate();
  return (
    <section style={{ background: "#070400", padding: "80px 24px 88px", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ textAlign: "center", marginBottom: 44 }}
        >
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:9, margin:"0 0 14px" }}>
            <div style={{ width:24, height:1.5, background:"#CCAB4A", flexShrink:0 }} />
            <span style={{ fontSize:13, fontWeight:500, color:"#CCAB4A" }}>Got Questions?</span>
            <div style={{ width:24, height:1.5, background:"#CCAB4A", flexShrink:0 }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, color: "#FFF8EC", letterSpacing: "-0.02em", margin: "0 0 12px", lineHeight: 1.1 }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: 14.5, color: "rgba(255,248,236,0.52)", maxWidth: 420, margin: "0 auto", lineHeight: 1.65 }}>
            Everything you need to know before you start planning.
          </p>
        </motion.div>

        {/* FAQ items — framer-motion height anim + chat-bubble answers, pattern from 21st.dev/anshuman008/faq-chat-accordion */}
        <motion.div
          style={{ display: "flex", flexDirection: "column" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.045 } } }}
        >
          {FAQS.map(({ q, a }, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } } }}
              style={{
                borderTop: i === 0 ? "1px solid rgba(196,122,46,0.14)" : "none",
                borderBottom: "1px solid rgba(196,122,46,0.14)",
              }}
            >
              {/* Trigger — ui-ux-pro-max: touch-target ≥44px, scale-feedback on press */}
              <motion.button
                onClick={() => setOpen(open === i ? null : i)}
                whileTap={{ scale: 0.985 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                style={{ width: "100%", minHeight: 44, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 4px", background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "left", gap: 20 }}
              >
                <span style={{ fontSize: 14.5, fontWeight: open === i ? 600 : 500, color: open === i ? "#FFF8EC" : "rgba(255,248,236,0.78)", lineHeight: 1.45, transition: "color 0.18s" }}>{q}</span>
                {/* +/− icon — clean SVG, no circle (ui-ux-pro-max: no decorative-only shapes) */}
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  style={{ flexShrink: 0, color: "#C47A2E", display: "flex", alignItems: "center" }}
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </motion.span>
              </motion.button>
              {/* Answer — framer-motion height:"auto", chat-bubble style (21st.dev pattern) */}
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ paddingBottom: 20, paddingLeft: 0 }}>
                      <p style={{
                        display: "inline-block", margin: 0,
                        padding: "12px 18px",
                        background: "rgba(196,122,46,0.1)",
                        border: "1px solid rgba(196,122,46,0.18)",
                        borderRadius: "4px 14px 14px 14px",
                        fontSize: 14, color: "rgba(255,248,236,0.68)", lineHeight: 1.75,
                        maxWidth: "92%",
                      }}>{a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ textAlign: "center", marginTop: 44, padding: "28px 32px", background: "#140B03", borderRadius: 18, border: "1px solid rgba(196,122,46,0.2)", boxShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
        >
          <p style={{ fontSize: 16, fontWeight: 700, color: "#FFF8EC", margin: "0 0 5px", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.01em" }}>Still have questions?</p>
          <p style={{ fontSize: 13.5, color: "rgba(255,248,236,0.52)", margin: "0 0 18px", lineHeight: 1.6 }}>Our team is happy to help you plan your perfect event.</p>
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

// ── Website intro overlay (mobile-only, light theme) ─────────────────────────
const INTRO_CAT = [
  { emoji: "📸", label: "Photography" },
  { emoji: "🌸", label: "Decor" },
  { emoji: "🍽️", label: "Catering" },
  { emoji: "🎵", label: "DJ & Music" },
  { emoji: "🎁", label: "Gift Hampers" },
  { emoji: "🎪", label: "Activities" },
];
const INTRO_OCC = ["🎂 Birthday","💕 Anniversary","🏢 Corporate","🏠 Housewarming","🎓 Graduation","🎉 Get-Together"];
const INTRO_TOTAL = 4;
const IB  = "#FFFDF9";
const IT  = "#1A0D03";
const IM  = "rgba(26,13,3,0.42)";
const IG  = "#C47A2E";
const IGL = "#CCAB4A";
const IC  = "rgba(196,122,46,0.06)";
const IB2 = "rgba(196,122,46,0.14)";
const IDF = "'DM Serif Display', Georgia, serif";

function WebsiteIntro({ onDone }) {
  const [slide, setSlide] = React.useState(0);
  const [dir, setDir] = React.useState(1);

  const dismiss = () => onDone();
  const goNext = () => { if (slide < INTRO_TOTAL - 1) { setDir(1); setSlide(s => s + 1); } };
  const goPrev = () => { if (slide > 0) { setDir(-1); setSlide(s => s - 1); } };
  const goTo   = (i) => { setDir(i > slide ? 1 : -1); setSlide(i); };

  const sv = {
    enter: (d) => ({ x: d > 0 ? "100%" : "-60%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.34, ease: [0.4, 0, 0.2, 1] } },
    exit:  (d) => ({ x: d > 0 ? "-20%" : "100%", opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } }),
  };

  const slides = [
    /* ── 0: Photo backdrop — real image, clean text at bottom ── */
    <div key="s0" style={{ position:"relative", display:"flex", flexDirection:"column", justifyContent:"flex-end", height:"100%" }}>
      <img src={heroBirthday} alt="" aria-hidden
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to top, rgba(4,1,0,0.86) 0%, rgba(4,1,0,0.42) 50%, rgba(4,1,0,0.15) 100%)" }}/>
      <motion.div initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }}
        transition={{ duration:0.44, ease:[0.25,0.46,0.45,0.94] }}
        style={{ position:"relative", zIndex:1, padding:"0 24px 28px" }}>
        <div style={{ fontSize:9, fontWeight:400, textTransform:"uppercase", letterSpacing:"0.26em",
          color:"rgba(196,122,46,0.75)", marginBottom:14 }}>
          Delhi NCR's Event Platform
        </div>
        <h2 style={{ fontFamily:IDF, fontSize:"2.3rem", fontWeight:400,
          color:"#FFF8EC", lineHeight:1.06, margin:"0 0 16px", letterSpacing:"-0.01em" }}>
          Your occasion,<br/>our obsession.
        </h2>
        <p style={{ fontSize:11.5, fontWeight:400, color:"rgba(255,248,236,0.45)",
          margin:0, letterSpacing:"0.05em" }}>
          100+ vendors &nbsp;·&nbsp; 5,000+ events &nbsp;·&nbsp; &lt;2hr response
        </p>
      </motion.div>
    </div>,

    /* ── 1: Vendors — editorial list ── */
    <div key="s1" style={{ display:"flex", flexDirection:"column", padding:"28px 24px 0" }}>
      <motion.div initial={{ y:14, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.34 }}>
        <div style={{ fontFamily:IDF, fontSize:"2.8rem", fontWeight:400, color:IT,
          lineHeight:1, letterSpacing:"-0.02em", margin:"0 0 6px" }}>100+ vendors</div>
        <div style={{ fontSize:12.5, color:IM, margin:"0 0 24px", fontWeight:400, letterSpacing:"0.01em" }}>
          Verified &amp; reviewed across Delhi NCR
        </div>
      </motion.div>
      <div style={{ borderTop:`1px solid ${IB2}` }}>
        {INTRO_CAT.map(({emoji,label},i)=>(
          <motion.div key={label}
            initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.06 + i*0.07, duration:0.28 }}
            style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 0",
              borderBottom:`1px solid ${IB2}` }}>
            <span style={{ fontSize:17, lineHeight:1, opacity:0.85 }}>{emoji}</span>
            <span style={{ fontSize:14, fontWeight:400, color:IT, letterSpacing:"0.01em" }}>{label}</span>
            <svg style={{ marginLeft:"auto", opacity:0.22 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={IT} strokeWidth="1.8" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </motion.div>
        ))}
      </div>
    </div>,

    /* ── 2: Occasions ── */
    <div key="s2" style={{ display:"flex", flexDirection:"column", padding:"28px 24px 0" }}>
      <motion.div initial={{ y:14, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.34 }}>
        <h2 style={{ fontFamily:IDF, fontSize:"2.4rem", fontWeight:400, color:IT,
          lineHeight:1.06, margin:"0 0 8px", letterSpacing:"-0.01em" }}>Every celebration,<br/>covered.</h2>
        <p style={{ fontSize:12.5, color:IM, margin:"0 0 22px", fontWeight:400, letterSpacing:"0.01em" }}>Birthdays to corporate events — all in one place.</p>
      </motion.div>
      <div style={{ display:"flex", flexDirection:"column", gap:0, borderTop:`1px solid ${IB2}` }}>
        {INTRO_OCC.map((occ,i)=>(
          <motion.div key={occ}
            initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.06+i*0.06, duration:0.26 }}
            style={{ fontSize:14, fontWeight:400, color:IT, letterSpacing:"0.01em",
              padding:"11px 0", borderBottom:`1px solid ${IB2}` }}>
            {occ}
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
        style={{ paddingTop:16, display:"flex", flexWrap:"wrap", gap:7 }}>
        {["Budget Tools","Timeline","Stationery","Gift Hampers"].map(t=>(
          <span key={t} style={{ fontSize:10.5, fontWeight:400, color:IG,
            background:"rgba(196,122,46,0.06)", border:`1px solid rgba(196,122,46,0.14)`,
            borderRadius:6, padding:"4px 10px", letterSpacing:"0.03em" }}>{t}</span>
        ))}
      </motion.div>
    </div>,

    /* ── 3: CTA ── */
    <div key="s3" style={{ display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", textAlign:"center", padding:"24px 24px", paddingBottom:"calc(env(safe-area-inset-bottom, 12px) + 24px)", height:"100%" }}>
      <motion.div initial={{ scale:0.7, opacity:0 }} animate={{ scale:1, opacity:1 }}
        transition={{ duration:0.48, ease:[0.34,1.56,0.64,1] }}
        style={{ fontSize:44, marginBottom:16, lineHeight:1 }}>🎉</motion.div>
      <motion.h2 initial={{ y:14, opacity:0 }} animate={{ y:0, opacity:1 }}
        transition={{ delay:0.12, duration:0.36 }}
        style={{ fontFamily:IDF, fontSize:"2.2rem", fontWeight:400,
          color:IT, lineHeight:1.1, margin:"0 0 20px" }}>
        Ready to celebrate?
      </motion.h2>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.22 }}
        style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:24, alignSelf:"flex-start", paddingLeft:4 }}>
        {["100+ verified vendors","Free to browse","Secure payments"].map(t=>(
          <div key={t} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13.5, color:IT, fontWeight:400 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={IG} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {t}
          </div>
        ))}
      </motion.div>
      <motion.button initial={{ y:14, opacity:0 }} animate={{ y:0, opacity:1 }}
        transition={{ delay:0.3, duration:0.36 }}
        whileTap={{ scale:0.975 }} onClick={dismiss}
        style={{ width:"100%", height:54, background:`linear-gradient(135deg,${IG},${IGL})`,
          border:"none", borderRadius:16, color:"#0A0500", fontWeight:700, fontSize:16,
          fontFamily:"inherit", cursor:"pointer" }}>
        Let's Plan
      </motion.button>
      <button onClick={goPrev}
        style={{ marginTop:14, background:"none", border:"none", cursor:"pointer",
          fontSize:12, color:IM, fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>
    </div>,
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.38 } }}
      style={{ position:"fixed", inset:0, zIndex:9999, background:IB,
        display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"'Outfit',sans-serif" }}
    >
      {/* Gold progress bar */}
      <div style={{ height:3, background:"rgba(196,122,46,0.1)", flexShrink:0 }}>
        <motion.div
          animate={{ width:`${((slide + 1) / INTRO_TOTAL) * 100}%` }}
          transition={{ duration:0.36, ease:[0.4,0,0.2,1] }}
          style={{ height:"100%", background:IG, borderRadius:"0 2px 2px 0" }}
        />
      </div>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 18px 0", flexShrink:0 }}>
        <div style={{ fontFamily:IDF, fontSize:16, color:IT, letterSpacing:"0.07em" }}>TENDR</div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:11, fontWeight:600, color:"rgba(26,13,3,0.28)", letterSpacing:"0.08em" }}>
            {slide + 1} / {INTRO_TOTAL}
          </span>
          <motion.button whileTap={{ scale:0.92 }} onClick={dismiss}
            style={{ width:34, height:34, minWidth:44, minHeight:44, borderRadius:"50%",
              background:"rgba(26,13,3,0.06)", border:"1px solid rgba(26,13,3,0.1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", fontSize:17, color:"rgba(26,13,3,0.35)", fontFamily:"inherit" }}>
            ×
          </motion.button>
        </div>
      </div>

      {/* Slides */}
      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
        <AnimatePresence initial={false} custom={dir}>
          <motion.div key={slide} custom={dir} variants={sv}
            initial="enter" animate="center" exit="exit"
            style={{ position:"absolute", inset:0, overflowY:"auto" }}>
            {slides[slide]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav — slides 0–2 */}
      {slide < INTRO_TOTAL - 1 && (
        <div style={{ padding:"10px 20px", paddingBottom:"calc(env(safe-area-inset-bottom, 12px) + 18px)", display:"flex", alignItems:"center",
          gap:12, flexShrink:0, borderTop:`1px solid rgba(196,122,46,0.1)` }}>
          {slide > 0 ? (
            <motion.button whileTap={{ scale:0.93 }} onClick={goPrev}
              style={{ width:42, height:42, borderRadius:"50%",
                background:"rgba(26,13,3,0.05)", border:"1px solid rgba(26,13,3,0.1)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", flexShrink:0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(26,13,3,0.4)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </motion.button>
          ) : <div style={{ width:42 }}/>}

          <div style={{ flex:1, display:"flex", justifyContent:"center", gap:6, alignItems:"center" }}>
            {Array.from({ length: INTRO_TOTAL }).map((_,i) => (
              <motion.div key={i}
                animate={{ width: i === slide ? 22 : 6, background: i === slide ? IG : "rgba(26,13,3,0.13)" }}
                transition={{ duration:0.2 }}
                style={{ height:6, borderRadius:100, cursor:"pointer" }}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <motion.button whileTap={{ scale:0.975 }} onClick={goNext}
            style={{ height:42, padding:"0 22px",
              background:`linear-gradient(135deg,${IG},${IGL})`,
              border:"none", borderRadius:11, color:"#0A0500",
              fontWeight:700, fontSize:13.5, fontFamily:"inherit",
              cursor:"pointer", flexShrink:0 }}>
            Continue
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

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
  const [faCarouselActive, setFaCarouselActive] = useState(0);
  const faTouchStartX = useRef(null);
  const [vendorStripOpen, setVendorStripOpen] = useState(false);
  const [ghProducts, setGhProducts] = useState([]);
  const ghCarouselRef = useRef(null);
  const [plannerOccasion, setPlannerOccasion] = useState(null);
  const [activePath, setActivePath] = useState(null);
  const [pathsRevealed, setPathsRevealed] = useState(false);
  const [occasionFlow, setOccasionFlow] = useState(null); // null | "grid" | occasionObject
  const [occasionSearch, setOccasionSearch] = useState("");
  const [hoveredOcc, setHoveredOcc] = useState(null);
  const [occModal, setOccModal] = useState(null);
  const [showIntro, setShowIntro] = useState(() => {
    try { return !localStorage.getItem("tendr_intro_seen") && window.innerWidth <= 768; } catch { return false; }
  });
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
    return allPhotos.map(p => ({ url: p.imageUrl, label: p.category }));
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
    const GH_HERO_FALLBACK = GH_FALLBACKS.map(p => ({
      url: p.images[0].replace("w=400&q=75", "w=900&q=80"),
      label: p.name,
    }));
    fetch(`${BASE_URL}/admin/gift-hamper-samples`)
      .then(r => r.ok ? r.json() : { samples: [] })
      .then(d => {
        if (d.samples?.length) {
          setGhSamplePhotos(d.samples.map(s => ({ url: s.url, label: s.name || "Gift Hamper" })));
        } else {
          setGhSamplePhotos(GH_HERO_FALLBACK);
        }
      })
      .catch(() => setGhSamplePhotos(GH_HERO_FALLBACK));
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
      title: "Welcome to Tendr",
      content: "Book verified vendors and plan every detail of your event in Delhi NCR — from one place.",
    },
    {
      target: "body",
      placement: "center",
      title: "Start here",
      content: "Use 'Book Vendors' to browse the vendor directory, or hit 'Plan an Occasion' for a step-by-step flow — pick your occasion, date and budget.",
    },
    {
      target: '[data-tour="mob-nav-profile"]',
      placement: "top",
      title: isSignedIn ? "Your bookings" : "Sign in to save",
      content: isSignedIn ? "View confirmed bookings and event documents from your account." : "Sign in to save vendors, confirm bookings and access your documents anytime.",
    },
  ] : [
    {
      target: "body",
      placement: "center",
      title: "Welcome to Tendr",
      content: "Book verified vendors and plan every detail of your celebration in Delhi NCR — from one place.",
    },
    {
      target: "body",
      placement: "center",
      title: "Start here",
      content: "Use 'Book Vendors' to browse the vendor directory, or hit 'Plan an Occasion' for a step-by-step flow — pick your occasion, date and budget.",
    },
    {
      target: '[data-tour="nav-browse"]',
      placement: "bottom",
      title: "Browse vendors",
      content: "Decorators, caterers, photographers, DJs, bands and emcees — all in one place. Sort by ratings or location.",
    },
    {
      target: '[data-tour="nav-products"]',
      placement: "bottom",
      title: "Our products",
      content: "Gift hampers, stationery, fun activities and party essentials — order directly through Tendr.",
    },
    {
      target: '[data-tour="nav-tools"]',
      placement: "bottom",
      title: "Planning tools",
      content: "Event timeline, budget allocator, style finder and more — free tools to organise every detail of your celebration.",
    },
    {
      target: '[data-tour="nav-booking"]',
      placement: "bottom",
      title: "Plan your event",
      content: "Use our guided planner, smart occasion planner, or chat with our team on Baat Karo. You can also explore occasions by type.",
    },
    isSignedIn ? {
      target: '[data-tour="profile-btn"]',
      placement: "bottom",
      title: "Your account",
      content: "Confirmed bookings, vendor contacts and downloadable documents — all here.",
    } : {
      target: '[data-tour="signin-btn"]',
      placement: "bottom",
      title: "Sign in",
      content: "Sign in to confirm bookings and access your event documents anytime.",
    },
  ];

  return (
    <div className="App">
      {/* Website intro — shown on first visit, stored in localStorage */}
      <AnimatePresence>
        {showIntro && (
          <WebsiteIntro
            key="intro"
            onDone={() => {
              try { localStorage.setItem("tendr_intro_seen", "1"); } catch {}
              setShowIntro(false);
            }}
          />
        )}
      </AnimatePresence>

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
        {/* Mobile-only background photo */}
        <img
          className="hero-mobile-photo-bg"
          src="/hero-mobile-bg.png"
          alt=""
          aria-hidden
          style={{ display: "none", position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", zIndex: 0 }}
        />
        {/* Dark overlay so cream text stays readable over the bright photo */}
        <div
          className="hero-mobile-photo-overlay"
          aria-hidden
          style={{ display: "none", position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,4,0,0.62) 0%, rgba(8,4,0,0.28) 42%, rgba(8,4,0,0.22) 100%)", zIndex: 1 }}
        />
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "stretch",
            flex: 1,
            position: "relative",
            zIndex: 2,
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


            {/* Headline block — stagger entrance (ui-ux-pro-max: stagger-sequence, spring-physics) */}
            <div style={{ marginBottom: 28 }}>

              <motion.h1
                className="home-hero-h1"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.08 }}
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.3rem, 3.8vw, 3.6rem)", fontWeight: 800, lineHeight: 1.04, color: "#FFF8EC", marginBottom: 16, letterSpacing: "-0.03em", position: "relative", zIndex: 1, textShadow: "0 4px 24px rgba(0,0,0,0.65)" }}
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
                style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,247,235,0.9)", lineHeight: 1.75, maxWidth: 348, margin: 0, letterSpacing: "0.005em", position: "relative", zIndex: 1, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
              >
                Birthdays, anniversaries, house parties and more — find verified vendors, plan every detail, and book everything across Delhi NCR.
              </motion.p>
            </div>

            {/* CTA row — primary action dominant, seasonal events subordinate (ui-ux-pro-max: primary-action) */}
            <motion.div
              className="home-hero-cta-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.24 }}
              style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", position: "relative", zIndex: 1 }}
              data-tour="hero-ctas"
            >
              {/* Primary CTA */}
              <button
                onClick={() => navigate("/booking")}
                className="home-hero-cta"
                style={{ background: "linear-gradient(135deg, #C47A2E 0%, #D4A848 100%)", color: "#fff", fontSize: 14.5, fontWeight: 600, letterSpacing: "0.02em", padding: "11px 28px", borderRadius: 11, border: "none", cursor: "pointer", boxShadow: "0 4px 22px rgba(196,122,46,0.5)", transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(196,122,46,0.65)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 22px rgba(196,122,46,0.5)"; }}
              >
                Book Vendors →
              </button>

              {/* Plan an Occasion — secondary CTA */}
              <button
                onClick={() => { setOccasionFlow("grid"); setOccasionSearch(""); }}
                className="home-hero-cta"
                style={{ background: "transparent", color: "rgba(255,247,235,0.88)", fontSize: 14.5, fontWeight: 600, letterSpacing: "0.02em", padding: "10px 22px", borderRadius: 11, border: "1.5px solid rgba(196,122,46,0.5)", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.85)"; e.currentTarget.style.background = "rgba(196,122,46,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.5)"; e.currentTarget.style.background = "transparent"; }}
              >
                Plan an Occasion ✦
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
              <span style={{ fontSize: 11, color: "rgba(255,247,235,0.72)", fontFamily: "'Outfit',sans-serif", letterSpacing: "0.04em", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>100+ verified vendors</span>
              <div style={{ width: 1, height: 14, background: "rgba(204,171,74,0.35)", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "rgba(255,247,235,0.72)", fontFamily: "'Outfit',sans-serif", letterSpacing: "0.04em", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>Delhi · Noida · NCR</span>
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

              {/* Left-edge blend — covers the dark strip at the column boundary */}
              <div
                style={{
                  position: "absolute",
                  top: 0, left: 0, bottom: 0,
                  width: 72,
                  background: "linear-gradient(to right, #1C0E04 0%, transparent 100%)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

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

      {/* ── Browse by Category ── */}
      <section style={{ background: "#FFFCF5", padding: "20px 24px", fontFamily: "'Outfit', sans-serif", borderBottom: "1px solid rgba(28,14,4,0.07)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="cat-strip" style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {[
              { label: "Caterer",        type: "Caterer",      href: null,                  photoMob: "https://images.unsplash.com/photo-1555244162-803834f70033?w=200&q=70", photoDesk: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80" },
              { label: "Decorator",      type: "Decorator",    href: null,                  photoMob: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&q=70", photoDesk: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80" },
              { label: "Photographer",   type: "Photographer", href: null,                  photoMob: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=70", photoDesk: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80" },
              { label: "DJ",             type: "DJ",           href: null,                  photoMob: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&q=70", photoDesk: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80" },
              { label: "Gift Hampers",   type: null,           href: "/gift-hampers-cakes", photoMob: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&q=70", photoDesk: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80" },
              { label: "Stationery",     type: null,           href: "/stationery",         photoMob: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=200&q=70", photoDesk: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&q=80" },
              { label: "Fun Activities", type: null,           href: "/fun-activities",     photoMob: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=200&q=70", photoDesk: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80" },
            ].map(({ label, type, href, photoMob, photoDesk }) => (
              <button
                key={label}
                className="cat-tile"
                onClick={() => href ? navigate(href) : navigate(`/listings?serviceType=${encodeURIComponent(type)}`)}
                style={{
                  flexShrink: 0,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  minWidth: 80,
                  flex: "1 1 0",
                  padding: 0,
                  fontFamily: "'Outfit', sans-serif",
                  transition: "transform 0.18s, box-shadow 0.18s",
                  boxShadow: "0 2px 8px rgba(28,14,4,0.1)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(28,14,4,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(28,14,4,0.1)"; }}
              >
                {/* Separate image source for mobile (200px) and desktop (400px) */}
                <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <source media="(min-width: 900px)" srcSet={photoDesk} />
                  <img src={photoMob} alt={label} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </picture>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,3,0,0.72) 0%, rgba(8,3,0,0.18) 55%, transparent 100%)" }} />
                <span className="cat-tile-label" style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontWeight: 700, color: "#fff", letterSpacing: "0.02em", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{label}</span>
              </button>
            ))}
          </div>
          <style>{`
            .cat-strip::-webkit-scrollbar{display:none}
            /* Tile dimensions: mobile 80×80px, desktop 112×108px */
            .cat-tile { height: 80px; }
            .cat-tile-label { font-size: 11px; }
            @media (min-width: 900px) {
              .cat-tile { height: 108px; min-width: 112px !important; border-radius: 14px !important; }
              .cat-tile-label { font-size: 12.5px; bottom: 10px !important; }
            }
          `}</style>
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

      <style>{`
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
          .hero-mobile-photo-bg { display: block !important; }
          .hero-mobile-photo-overlay { display: block !important; }
          .hero-section-wrap { height: auto !important; min-height: 100svh !important; position: relative !important; }
          .hero-split { flex-direction: column !important; }
          .hero-split > div:first-child {
            flex: 1 !important;
            padding: 36px 24px 52px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          .home-hero-h1 { font-size: clamp(2.1rem, 7.5vw, 2.8rem) !important; }
          .home-hero-para { font-size: 14px !important; }
          .hero-split > div:last-child { display: none !important; }
          .hero-mobile-cats {
            display: flex !important;
            flex-direction: column !important;
            order: 5 !important;
            margin-top: 24px !important;
            margin-bottom: 0 !important;
          }
          .hero-mobile-cats::-webkit-scrollbar { display: none; }
          .hero-desktop-search { display: none !important; }
          .home-hero-cta-wrap { flex-wrap: nowrap !important; gap: 8px !important; }
          .home-hero-cta { flex: 1 !important; padding: 11px 6px !important; font-size: 13px !important; text-align: center !important; justify-content: center !important; white-space: normal !important; }
        }
      `}</style>

      {/* ── Plan by Occasion ── */}
      <section id="plan-by-occasion" data-tour="occasion-strip" style={{ background: "#ffffff", padding: "72px 28px 80px", fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>

        <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}
          >
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.9rem,3.2vw,2.6rem)", fontWeight: 700, color: "#1C0E04", margin: 0, lineHeight: 1.04, letterSpacing: "-0.03em" }}>
                Pick your occasion
              </h2>
            </div>
          </motion.div>

          {/* Single-row strip — hover-reveal: non-hovered cards dim */}
          <div style={{ position: "relative" }}>
          <div className="occ-strip" style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 6 }}>
            {[
              { label: "Birthday",        photo: "/occasions/birthday-mobile.png" },
              { label: "Anniversary",     photo: "/occasions/anniversary-mobile.png" },
              { label: "Baby Shower",     photo: "/occasions/baby-shower-mobile.png" },
              { label: "First Birthday",  photo: "/occasions/birthday-mobile.png" },
              { label: "House Party",     photo: "/occasions/house-party-mobile.png" },
              { label: "Housewarming",    photo: "/occasions/housewarming-mobile.png" },
              { label: "Get Together",    photo: "/occasions/get-together-mobile.png" },
              { label: "Naming Ceremony", photo: "/occasions/naming-ceremony-mobile.png" },
              { label: "Gender Reveal",   photo: "/occasions/baby-shower-mobile.png" },
              { label: "Newborn Welcome", photo: "/occasions/baby-shower-mobile.png" },
              { label: "Kitty Party",     photo: "/occasions/kitty-party-mobile.png" },
              { label: "Graduation",      photo: "/occasions/get-together-mobile.png" },
              { label: "Office Party",    photo: "/occasions/get-together-mobile.png" },
            ].map(({ label, photo }, i) => {
              const isHovered = hoveredOcc === label;
              const isDimmed  = hoveredOcc !== null && !isHovered;
              return (
                <motion.button
                  key={label}
                  onClick={() => {
                    const slugMap = {
                      "Birthday":"birthday-party","Anniversary":"anniversary","Baby Shower":"baby-shower",
                      "First Birthday":"first-birthday","House Party":"get-together","Housewarming":"housewarming",
                      "Get Together":"get-together","Naming Ceremony":"naming-ceremony",
                      "Gender Reveal":"gender-reveal","Newborn Welcome":"newborn-welcome",
                      "Kitty Party":"get-together","Graduation":"graduation",
                      "Office Party":"office-party",
                    };
                    const hubMap = {
                      "birthday-party":"/birthday-hub","first-birthday":"/birthday-hub",
                      "anniversary":"/anniversary-hub","baby-shower":"/baby-shower-hub",
                      "gender-reveal":"/baby-shower-hub","newborn-welcome":"/baby-shower-hub",
                      "get-together":"/get-together-hub","housewarming":"/housewarming-hub",
                      "naming-ceremony":"/naming-ceremony-hub","graduation":"/get-together-hub",
                      "office-party":"/office-party-hub",
                    };
                    const slug = slugMap[label] || "birthday-party";
                    setOccModal({ label, slug, hub: hubMap[slug] || "/birthday-hub", photo, step: 1 });
                  }}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.04 }}
                  whileHover={{ y: -5, scale: 1.02, boxShadow: "0 14px 36px rgba(28,14,4,0.22)" }}
                  onHoverStart={() => setHoveredOcc(label)}
                  onHoverEnd={() => setHoveredOcc(null)}
                  className="occ-strip-card"
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    width: 136,
                    height: 192,
                    borderRadius: 16,
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
                      animate={{ opacity: isHovered ? 1 : 0.55 }}
                      transition={{ duration: 0.18 }}
                      style={{ fontSize: 11, color: "#CCAB4A", fontWeight: 600, display: "block", marginTop: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}
                    >Explore →</motion.span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div style={{ position: "absolute", right: 0, top: 0, bottom: 6, width: 80, background: "linear-gradient(to right, transparent, #ffffff)", pointerEvents: "none", zIndex: 1 }} />
          </div>
          <style>{`
            .occ-strip::-webkit-scrollbar { display: none; }
            @media (max-width: 480px) {
              .occ-strip-card { width: 108px !important; height: 152px !important; border-radius: 13px !important; }
            }
          `}</style>
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
        const ap = activePath !== null ? PATHS[activePath] : null;
        return (
          <section style={{ background: "#F5EFE6", padding: "48px 28px 52px", fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>

              {/* Discovery gate — single button until revealed */}
              {!pathsRevealed ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32 }}
                  style={{ textAlign: "center" }}
                >
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#B8956A", textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 10px" }}>Not sure where to start?</p>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 700, color: "#1C0E04", margin: "0 0 28px", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
                    Find the right way<br/>to plan your event
                  </h2>
                  <motion.button
                    onClick={() => setPathsRevealed(true)}
                    whileTap={{ scale: 0.97 }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#1C0E04", color: "#FFF8EC", fontSize: 14.5, fontWeight: 600, padding: "14px 28px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 20px rgba(28,14,4,0.22)", letterSpacing: "0.01em" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#2C1A0E"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#1C0E04"; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Find out which path is right for you
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#B8956A", textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 8px" }}>How do you want to plan?</p>
                  <p style={{ fontSize: 15, color: "rgba(28,14,4,0.55)", margin: "0 0 20px", lineHeight: 1.5 }}>Pick the approach that fits your style.</p>

                  {/* 3 cards */}
                  <div className="path-strip" style={{ display: "flex", gap: 10, marginBottom: ap ? 14 : 0, flexWrap: "wrap" }}>
                    {PATHS.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePath(activePath === i ? null : i)}
                        style={{
                          flex: "1 1 160px",
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "'Outfit', sans-serif",
                          background: activePath === i ? "#fff" : "rgba(255,255,255,0.58)",
                          borderRadius: 14,
                          padding: "16px 18px",
                          border: `1.5px solid ${activePath === i ? "rgba(196,122,46,0.32)" : "rgba(196,122,46,0.1)"}`,
                          borderLeft: `3px solid ${activePath === i ? "#C47A2E" : "rgba(196,122,46,0.15)"}`,
                          boxShadow: activePath === i ? "0 4px 16px rgba(196,122,46,0.13)" : "none",
                          transition: "all 0.2s",
                          outline: "none",
                        }}
                      >
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: activePath === i ? "#C47A2E" : "#B8956A", textTransform: "uppercase", letterSpacing: "0.16em", display: "block", marginBottom: 6 }}>{p.tag}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: activePath === i ? "#1C0E04" : "#4A2C0E", display: "block", lineHeight: 1.15, marginBottom: 4 }}>{p.title}</span>
                        <span style={{ fontSize: 12, color: activePath === i ? "#7A5535" : "rgba(107,69,40,0.52)", display: "block", lineHeight: 1.45 }}>{p.hook}</span>
                      </button>
                    ))}
                  </div>

                  {/* Expandable steps panel */}
                  {ap && (
                    <motion.div
                      key={activePath}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
                      style={{ background: "#1C0E04", borderRadius: 16, padding: "24px 28px", position: "relative", overflow: "hidden" }}
                    >
                      <div aria-hidden style={{ position: "absolute", top: -50, right: -30, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,122,46,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
                      <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(196,122,46,0.65)", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 6px" }}>How it works</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1rem,2vw,1.25rem)", fontWeight: 600, fontStyle: "italic", color: "rgba(255,247,235,0.9)", margin: "0 0 20px", lineHeight: 1.3 }}>{ap.hook}</p>
                      <div className="path-steps-row" style={{ display: "flex", gap: 0, marginBottom: 22 }}>
                        {ap.steps.map(({ n, text }, i) => (
                          <div key={n} style={{ flex: 1, paddingRight: i < 2 ? 18 : 0, borderRight: i < 2 ? "1px solid rgba(255,247,235,0.07)" : "none", paddingLeft: i > 0 ? 18 : 0 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(196,122,46,0.55)", letterSpacing: "0.1em", display: "block", marginBottom: 7, fontFamily: "monospace" }}>{n}</span>
                            <p style={{ fontSize: 12.5, color: "rgba(255,247,235,0.7)", margin: 0, lineHeight: 1.6 }}>{text}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={ap.action}
                        style={{ background: "linear-gradient(135deg,#C47A2E,#D4A848)", color: "#fff", fontSize: 13.5, fontWeight: 600, padding: "11px 26px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 18px rgba(196,122,46,0.38)", letterSpacing: "0.02em", transition: "transform 0.2s, box-shadow 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(196,122,46,0.5)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(196,122,46,0.38)"; }}
                      >
                        {ap.cta} →
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
            <style>{`
              @media (max-width: 640px) {
                .path-strip { flex-direction: column !important; }
                .path-steps-row { flex-direction: column !important; gap: 14px !important; }
                .path-steps-row > div { border-right: none !important; border-bottom: 1px solid rgba(255,247,235,0.07) !important; padding: 0 0 14px 0 !important; }
                .path-steps-row > div:last-child { border-bottom: none !important; padding-bottom: 0 !important; }
              }
            `}</style>
          </section>
        );
      })()}

      {/* ── Everything for your celebration — removed ── */}
      {false && <section data-tour="efc-section" style={{ background: "#ffffff", padding: "72px 28px 80px", fontFamily: "'Outfit', sans-serif" }}>
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
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.9rem,3.2vw,2.6rem)", fontWeight: 700, color: "#1C0E04", margin: 0, lineHeight: 1.04, letterSpacing: "-0.03em" }}>
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
              .efc-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; overflow-x: unset !important; }
              .efc-tile { min-width: unset !important; max-width: unset !important; flex-shrink: unset !important; padding: 14px 12px 12px !important; gap: 8px !important; }
              .efc-tile[style*="span 2"] { grid-column: span 2 !important; }
            }
            @media (min-width: 641px) and (max-width: 900px) {
              .efc-grid { grid-template-columns: repeat(2,1fr) !important; }
              .efc-tile[style*="span 2"] { grid-column: span 2 !important; }
            }
          `}</style>
        </div>
      </section>}

      {/* ── Live Entertainment Add-ons — coverflow carousel ── */}
      <section data-tour="fun-activities-section" style={{ background:"#0C0600", padding:"48px 0 52px", fontFamily:"'Outfit', sans-serif", overflow:"hidden" }}>
        <style>{`
          .fa-cov-outer { overflow:hidden; position:relative; height:340px; }
          .fa-cov-track { display:flex; gap:16px; align-items:center; height:100%; will-change:transform; }
          .fa-cov-card { flex-shrink:0; width:250px; height:320px; border-radius:14px; overflow:hidden; position:relative; cursor:pointer; }
          @media(max-width:640px){
            .fa-cov-outer { height:272px; }
            .fa-cov-card { width:198px; height:254px; }
          }
        `}</style>

        {/* Header */}
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(196,122,46,0.65)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:6 }}>Add-ons</div>
            <h2 style={{ fontSize:"clamp(1.5rem,2.8vw,2.1rem)", fontWeight:800, color:"#FFF8EC", margin:0, letterSpacing:"-0.02em", lineHeight:1.1 }}>
              Live Entertainment
            </h2>
          </div>
          <button onClick={() => navigate("/fun-activities")}
            style={{ background:"rgba(196,122,46,0.1)", border:"1px solid rgba(196,122,46,0.22)", color:"#CCAB4A", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", padding:"8px 16px", borderRadius:8, letterSpacing:"0.02em", whiteSpace:"nowrap", flexShrink:0 }}>
            See all →
          </button>
        </div>

        {/* Coverflow carousel */}
        {(() => {
          const acts = FUN_ACTIVITIES.slice(0, 8);
          const mob = typeof window !== "undefined" && window.innerWidth < 640;
          const CW = mob ? 198 : 250; // card width px
          const GAP = mob ? 10 : 16;  // flex gap px
          const step = CW + GAP;
          // translateX so active card center sits at 50% of container
          const trackX = `calc(50% - ${faCarouselActive * step + CW / 2}px)`;

          const handlePrev = () => setFaCarouselActive(c => Math.max(c - 1, 0));
          const handleNext = () => setFaCarouselActive(c => Math.min(c + 1, acts.length - 1));

          return (
            <>
              <div
                className="fa-cov-outer"
                onTouchStart={e => { faTouchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={e => {
                  const dx = e.changedTouches[0].clientX - (faTouchStartX.current ?? 0);
                  if (Math.abs(dx) > 40) dx < 0 ? handleNext() : handlePrev();
                }}
              >
                <div
                  className="fa-cov-track"
                  style={{ transform:`translateX(${trackX})`, transition:"transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)" }}
                >
                  {acts.map((act, i) => {
                    const off = Math.abs(i - faCarouselActive);
                    const scale   = [1, 0.80, 0.63, 0.50][Math.min(off, 3)];
                    const opacity = [1, 0.72, 0.42, 0.18][Math.min(off, 3)];
                    const isC = off === 0;
                    return (
                      <div
                        key={act.id}
                        className="fa-cov-card"
                        onClick={() => isC ? setFaModal(act) : setFaCarouselActive(i)}
                        style={{
                          transform: `scale(${scale})`,
                          opacity,
                          transition: "transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.35s, box-shadow 0.35s",
                          boxShadow: isC ? "0 24px 64px rgba(0,0,0,0.78), 0 0 0 1.5px rgba(196,122,46,0.28)" : "0 6px 20px rgba(0,0,0,0.45)",
                          zIndex: 10 - off,
                          position: "relative",
                        }}
                      >
                        <img src={act.image} alt={act.name} loading="lazy"
                          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                        <div style={{ position:"absolute", inset:0, background: isC
                          ? "linear-gradient(to top, rgba(4,2,0,0.95) 0%, rgba(4,2,0,0.12) 52%, transparent 100%)"
                          : "linear-gradient(to top, rgba(4,2,0,0.82) 0%, rgba(4,2,0,0.45) 60%, rgba(4,2,0,0.22) 100%)"
                        }} />
                        {isC && (
                          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"18px 16px" }}>
                            <div style={{ fontSize:15, fontWeight:800, color:"#FFF8EC", marginBottom:4, lineHeight:1.2 }}>{act.name}</div>
                            <div style={{ fontSize:13, fontWeight:700, color:"#CCAB4A", marginBottom:10, fontVariantNumeric:"tabular-nums" }}>from ₹{act.price.toLocaleString()}</div>
                            <span style={{ display:"inline-block", background:"#C47A2E", color:"#fff", fontSize:11, fontWeight:800, padding:"7px 16px", borderRadius:7, letterSpacing:"0.05em" }}>BOOK NOW</span>
                          </div>
                        )}
                        {!isC && (
                          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"12px 13px" }}>
                            <div style={{ fontSize:12.5, fontWeight:700, color:"rgba(255,248,236,0.9)", lineHeight:1.3 }}>{act.name}</div>
                            <div style={{ fontSize:11, fontWeight:600, color:"rgba(204,171,74,0.75)", marginTop:2, fontVariantNumeric:"tabular-nums" }}>₹{act.price.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Controls */}
              <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:14, marginTop:18, padding:"0 24px" }}>
                <button
                  onClick={handlePrev}
                  disabled={faCarouselActive === 0}
                  aria-label="Previous"
                  style={{ width:34, height:34, borderRadius:"50%", border:"1px solid rgba(196,122,46,0.3)", background:"rgba(196,122,46,0.08)", color:"#CCAB4A", fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity: faCarouselActive === 0 ? 0.3 : 1, transition:"opacity 0.2s", fontFamily:"inherit" }}
                >←</button>
                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                  {acts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFaCarouselActive(i)}
                      aria-label={`Go to ${i + 1}`}
                      style={{ width: i === faCarouselActive ? 22 : 6, height:6, borderRadius:3, border:"none", background: i === faCarouselActive ? "#C47A2E" : "rgba(255,240,210,0.2)", cursor:"pointer", padding:0, transition:"all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)" }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  disabled={faCarouselActive === acts.length - 1}
                  aria-label="Next"
                  style={{ width:34, height:34, borderRadius:"50%", border:"1px solid rgba(196,122,46,0.3)", background:"rgba(196,122,46,0.08)", color:"#CCAB4A", fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity: faCarouselActive === acts.length - 1 ? 0.3 : 1, transition:"opacity 0.2s", fontFamily:"inherit" }}
                >→</button>
              </div>
            </>
          );
        })()}
      </section>

      {/* ── Gift Hampers ── */}
      <section data-tour="gift-hampers-section" style={{ position: "relative", padding: "72px 24px 80px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&auto=format&q=70')", backgroundSize: "cover", backgroundPosition: "center" }} />
        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(12,5,0,0.91) 0%,rgba(18,8,2,0.84) 55%,rgba(10,4,0,0.93) 100%)" }} />
        {/* Gold shimmer blobs */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 40%,rgba(196,122,46,0.09),transparent 45%), radial-gradient(circle at 80% 65%,rgba(204,171,74,0.07),transparent 40%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:10, margin:"0 0 20px" }}>
              <div style={{ width:28, height:1.5, background:"#C47A2E", flexShrink:0 }} />
              <span style={{ fontSize:12, fontWeight:700, color:"#C47A2E", letterSpacing:"0.12em", textTransform:"uppercase" }}>Gift Hampers</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.2rem,4vw,3.4rem)", fontWeight: 500, color: "#F5ECD8", margin: "0 0 20px", lineHeight: 1.08, letterSpacing: "-0.01em" }}>
              The perfect gift,<br />delivered.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(245,236,216,0.62)", margin: "0 0 38px", lineHeight: 1.75, maxWidth: 480 }}>
              Curated hampers for birthdays, anniversaries and corporate celebrations — delivered fresh across Delhi NCR.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/gift-hampers-cakes")}
                style={{ background: "#C47A2E", color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 28px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", letterSpacing: "0.01em" }}
              >Browse Hampers →</button>
              <button onClick={() => navigate("/hamper-builder")}
                style={{ background: "transparent", color: "rgba(204,171,74,0.75)", fontSize: 13, fontWeight: 600, padding: 0, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", textDecoration: "underline", textDecorationColor: "rgba(204,171,74,0.3)", textUnderlineOffset: "4px" }}>
                Build your own
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section style={{ background: "#1C0E04", padding: "52px 24px 60px", fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>
        {/* Gold glow blobs */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 15% 60%,rgba(204,171,74,0.07),transparent 45%), radial-gradient(circle at 85% 40%,rgba(196,122,46,0.06),transparent 45%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.4rem,2.4vw,1.9rem)", fontWeight: 700, color: "#FFF8EC", margin: 0, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              Trusted by Delhi NCR.
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
            .trust-bar-grid { display: flex !important; flex-direction: column !important; overflow-x: unset !important; scroll-snap-type: none !important; border-radius: 14px !important; }
            .trust-bar-grid > div { min-width: unset !important; flex-shrink: 0 !important; scroll-snap-align: unset !important; padding: 24px 20px !important; }
          }
        `}</style>
      </section>

      {false && <JourneyFlow />}

      {/* Plan summary icon lives in the Navbar — no strip here */}

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
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${SECTION_BG}')`, backgroundSize: "cover", backgroundPosition: "center", }} />
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
                <div style={{ display:"flex", alignItems:"center", gap:9, margin:"0 0 16px" }}>
                  <div style={{ width:24, height:1.5, background:"#CCAB4A", flexShrink:0 }} />
                  <span style={{ fontSize:13, fontWeight:500, color:"#CCAB4A" }}>Crafted with Love · Delhi NCR</span>
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, color: "#FFF8EC", margin: "0 0 12px", letterSpacing: "0.02em", fontStyle: "italic", lineHeight: 1.05 }}>
                  Wedding Stationeries
                </h2>
                <p style={{ fontSize: 14, color: "rgba(255,248,236,0.72)", margin: "0 auto 24px", maxWidth: 400, lineHeight: 1.65 }}>
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
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.62)", marginBottom: 5 }}>{cat.sub}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 23, fontWeight: 400, color: "#fff", lineHeight: 1.15, marginBottom: 7 }}>{cat.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.68)", lineHeight: 1.4, marginBottom: 12 }}>{cat.desc}</div>
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
      <section style={{ background: "#F8F5F0", padding: "56px 24px 60px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Editorial split header */}
          <div className="portfolio-header-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 72px", alignItems: "end", marginBottom: 36 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:9, margin:"0 0 16px" }}>
                <div style={{ width:24, height:1.5, background:"#C47A2E", flexShrink:0 }} />
                <span style={{ fontSize:13, fontWeight:500, color:"#C47A2E" }}>From the field</span>
              </div>
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
                {/* Photo — 3:4 aspect */}
                <div className="portfolio-img-wrap" style={{ aspectRatio: "3/4", overflow: "hidden" }}>
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
              flex: 0 0 58% !important;
              scroll-snap-align: start !important;
              min-width: 0 !important;
            }
            .portfolio-img-wrap { aspect-ratio: 4/5 !important; }
          }
          @keyframes glimpseFade { from { opacity: 0.4; } to { opacity: 1; } }
        `}</style>
      </section>


      {/* ── Party Places ── */}
      <section style={{ background: "#FFFCF5", padding: "22px 24px 28px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}
          >
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:9, margin:"0 0 14px" }}>
                <div style={{ width:24, height:1.5, background:"#C47A2E", flexShrink:0 }} />
                <span style={{ fontSize:13, fontWeight:500, color:"#C47A2E" }}>Party Places</span>
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 400, color: "#1C0E04", letterSpacing: "0.01em", lineHeight: 1.15, margin: "0 0 8px" }}>
                Private venues for your next celebration
              </h2>
              <p style={{ fontSize: 15, color: "#9B7450", margin: 0, lineHeight: 1.65, maxWidth: 480 }}>
                Villas, farmhouses, terraces, and venue halls across Delhi NCR — bookable with your Tendr vendors included.
              </p>
            </div>
            <button
              onClick={() => navigate("/party-places")}
              style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.06)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.3)"; }}
            >
              Browse All Venues →
            </button>
          </motion.div>

          {/* Venue cards — asymmetric bento: 1 featured tall + 2 compact */}
          <motion.div
            className="party-places-grid"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: 14 }}
          >
            {/* Featured card — spans both rows */}
            <motion.div
              className="pp-featured"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } } }}
              onClick={() => navigate(`/party-places/${PARTY_PLACES[0].id}`)}
              style={{ gridRow: "span 2", borderRadius: 13, overflow: "hidden", cursor: "pointer", position: "relative", minHeight: 200 }}
              whileHover={{ scale: 1.012, transition: { type: "spring", stiffness: 340, damping: 28 } }}
            >
              <img src={PARTY_PLACES[0].coverPhoto} alt={PARTY_PLACES[0].name} loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,14,4,0.78) 0%, transparent 52%)" }} />
              <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(28,14,4,0.62)", backdropFilter: "blur(6px)", borderRadius: 100, padding: "3px 11px" }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", textTransform: "capitalize" }}>{PARTY_PLACES[0].type}</span>
              </div>
              {PARTY_PLACES[0].rating >= 4.8 && (
                <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(196,122,46,0.88)", borderRadius: 100, padding: "3px 9px", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 9, color: "#fff" }}>★</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff" }}>{PARTY_PLACES[0].rating}</span>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 22px" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>{PARTY_PLACES[0].name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 10 }}>{PARTY_PLACES[0].location} · up to {PARTY_PLACES[0].maxGuests} guests</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#CCAB4A" }}>from ₹{PARTY_PLACES[0].roomPrice.toLocaleString("en-IN")}</div>
              </div>
            </motion.div>

            {/* Two compact cards stacked on right */}
            {PARTY_PLACES.slice(1, 3).map((place) => (
              <motion.div
                key={place.id}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } } }}
                onClick={() => navigate(`/party-places/${place.id}`)}
                style={{ borderRadius: 13, overflow: "hidden", background: "#fff", cursor: "pointer", boxShadow: "0 2px 10px rgba(139,69,19,0.07)" }}
                whileHover={{ y: -3, transition: { type: "spring", stiffness: 340, damping: 26 } }}
              >
                <div style={{ position: "relative", paddingBottom: "36%" }}>
                  <img src={place.coverPhoto} alt={place.name} loading="lazy"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(28,14,4,0.62)", backdropFilter: "blur(6px)", borderRadius: 100, padding: "3px 10px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "capitalize" }}>{place.type}</span>
                  </div>
                  {place.rating >= 4.8 && (
                    <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(196,122,46,0.88)", borderRadius: 100, padding: "3px 8px", display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 9, color: "#fff" }}>★</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{place.rating}</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1C0E04", marginBottom: 3, lineHeight: 1.3 }}>{place.name}</div>
                  <div style={{ fontSize: 11.5, color: "#9B7450", marginBottom: 8 }}>{place.location} · up to {place.maxGuests} guests</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#C47A2E" }}>from ₹{place.roomPrice.toLocaleString("en-IN")}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <style>{`
            .pp-featured { min-height: 200px !important; }
            @media (max-width: 640px) {
              .party-places-grid { display: flex !important; overflow-x: auto !important; scroll-snap-type: x mandatory !important; gap: 14px !important; padding-bottom: 12px !important; margin: 0 -24px !important; padding-left: 24px !important; scrollbar-width: none; grid-template-rows: unset !important; }
              .party-places-grid::-webkit-scrollbar { display: none; }
              .pp-featured { grid-row: unset !important; flex: 0 0 75% !important; scroll-snap-align: start !important; min-height: 260px !important; }
              .party-places-grid > div:not(.pp-featured) { flex: 0 0 65% !important; scroll-snap-align: start !important; }
            }
          `}</style>
        </div>
      </section>

      {/* ── Tips by Tendr ── */}
      <TipsByTendrSection />

      {/* Become a Partner Section */}
      <section style={{ background: "#130900", padding: "72px 24px 80px", fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 70% 0%,rgba(196,122,46,0.13),transparent 55%), radial-gradient(ellipse at 5% 90%,rgba(204,171,74,0.07),transparent 50%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ marginBottom: 52 }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(204,171,74,0.09)", border: "1px solid rgba(204,171,74,0.22)", borderRadius: 100, padding: "5px 14px", marginBottom: 18 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#CCAB4A", display: "inline-block", animation: "tendrPing 2s ease-out infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", letterSpacing: "0.1em", textTransform: "uppercase" }}>For Vendors &amp; Artists</span>
            </div>
            <div className="partner-header" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "end", gap: 40 }}>
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.1rem, 3.8vw, 3.1rem)", fontWeight: 300, color: "#fff", lineHeight: 1.08, margin: "0 0 12px", letterSpacing: "0.01em" }}>
                  Your next booking is{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 600, background: "linear-gradient(135deg,#C47A2E 0%,#D4A848 50%,#CCAB4A 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    already looking for you.
                  </em>
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: 0, maxWidth: 380 }}>
                  Real customers. Real dates. No ads or middlemen — just direct bookings.
                </p>
              </div>
              {/* Vendor type pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "flex-end" }}>
                {[
                  { path: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>, label: "DJ" },
                  { path: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>, label: "Emcee" },
                  { path: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>, label: "Photographer" },
                  { path: <><path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10"/><path d="M8 3.06A10 10 0 0 0 8 21"/><path d="M16 3.05a10 10 0 0 1 0 17.9"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20"/></>, label: "Decorator" },
                  { path: <><path d="M3 11l19-9-9 19-2-8-8-2z"/></>, label: "Caterer" },
                  { path: <><path d="M9 18V5l12-2v13"/><polyline points="9 9 21 7"/></>, label: "Band" },
                  { path: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>, label: "Videographer" },
                  { path: <><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></>, label: "AV Setup" },
                ].map(t => (
                  <span key={t.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "rgba(255,247,235,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, padding: "5px 12px", letterSpacing: "0.01em" }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{t.path}</svg>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Two-column: left benefits+CTA / right profile card */}
          <motion.div
            className="partner-grid"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 64, alignItems: "start" }}
          >

            {/* Left — benefit list + CTA */}
            <motion.div variants={{ hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 220, damping: 28 } } }}>
              {[
                { num: "01", stat: "4×", title: "More bookings with a verified badge", sub: "Verified vendors receive 4 times more confirmed bookings than unverified listings.", icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></> },
                { num: "02", stat: "₹0", title: "Commission — ever", sub: "No percentage taken from your earnings. What you quote is what you keep.", icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
                { num: "03", stat: "24h", title: "Approval — then you're live", sub: "Submit your details, get approved in one business day, start receiving requests.", icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
                { num: "04", stat: "Direct", title: "Chat with every customer", sub: "No gatekeeping. Discuss requirements, negotiate, and close the booking yourself.", icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></> },
              ].map((b, i, arr) => (
                <div key={b.num} style={{ display: "flex", gap: 20, padding: "22px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: "rgba(196,122,46,0.5)", letterSpacing: "0.08em", paddingTop: 3, flexShrink: 0, width: 20, fontVariantNumeric: "tabular-nums" }}>{b.num}</div>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{b.icon}</svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(1.5rem,2.5vw,1.9rem)", fontWeight: 600, color: "#CCAB4A", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{b.stat}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#FFF8EC", lineHeight: 1.3 }}>{b.title}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>{b.sub}</div>
                  </div>
                </div>
              ))}

              {/* CTA */}
              <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <button
                  onClick={() => navigate("/vendor/register")}
                  style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit',sans-serif", cursor: "pointer", boxShadow: "0 8px 28px rgba(196,122,46,0.42)", transition: "transform 0.18s,box-shadow 0.18s", minHeight: 44 }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(196,122,46,0.58)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.42)"; }}
                >
                  List Your Service Free →
                </button>
                <button
                  onClick={() => navigate("/vendor/login")}
                  style={{ background: "none", color: "rgba(255,247,235,0.55)", border: "none", fontSize: 13.5, fontWeight: 600, fontFamily: "'Outfit',sans-serif", cursor: "pointer", padding: "14px 4px", minHeight: 44, transition: "color 0.15s", textDecoration: "underline", textDecorationColor: "rgba(255,247,235,0.15)", textUnderlineOffset: 4 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#CCAB4A"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,247,235,0.55)"}
                >
                  Already a vendor? Log in
                </button>
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: "rgba(255,255,255,0.22)", letterSpacing: "0.03em" }}>
                Join 100+ verified vendors · No credit card · No setup fee
              </div>
            </motion.div>

            {/* Right — mock vendor profile card */}
            <motion.div
              variants={{ hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 220, damping: 28 } } }}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {/* Profile card */}
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, overflow: "hidden", position: "relative" }}>
                {/* "New request" live badge */}
                <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2, background: "#16A34A", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, letterSpacing: "0.04em", boxShadow: "0 2px 10px rgba(22,163,74,0.4)" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block", animation: "tendrPing 1.8s ease-out infinite" }} />
                  2 new requests
                </div>

                {/* Card top bar */}
                <div style={{ background: "linear-gradient(135deg,rgba(196,122,46,0.18),rgba(204,171,74,0.1))", padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,247,235,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Your Tendr Profile</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Active</span>
                  </div>
                </div>

                <div style={{ padding: "16px 18px 20px" }}>
                  {/* Profile info */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#FFF8EC" }}>Your Name Here</span>
                        <span style={{ fontSize: 9, fontWeight: 800, color: "#CCAB4A", background: "rgba(204,171,74,0.14)", border: "1px solid rgba(204,171,74,0.28)", borderRadius: 100, padding: "2px 7px" }}>✓ Verified</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>DJ · Delhi NCR</div>
                      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ color: "#CCAB4A", fontSize: 10 }}>★</span>)}
                        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginLeft: 3 }}>4.9 · 28 reviews</span>
                      </div>
                    </div>
                  </div>

                  {/* This-week activity strip */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                    <div style={{ background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.14)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#CCAB4A", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>24</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 3, lineHeight: 1.3 }}>Profile views this week</div>
                    </div>
                    <div style={{ background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.15)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#4ADE80", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>3</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 3, lineHeight: 1.3 }}>Booking requests</div>
                    </div>
                  </div>

                  {/* Photo grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 14 }}>
                    {[
                      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=100&fit=crop&q=70",
                      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&h=100&fit=crop&q=70",
                      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200&h=100&fit=crop&q=70",
                    ].map((src, i) => (
                      <div key={i} style={{ height: 54, borderRadius: 8, overflow: "hidden" }}>
                        <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.82 }} />
                      </div>
                    ))}
                  </div>

                  {/* Book Now */}
                  <div style={{ display: "flex", gap: 7 }}>
                    <div style={{ flex: 1, padding: "10px 12px", borderRadius: 9, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", textAlign: "center", fontSize: 12.5, fontWeight: 800, color: "#fff", letterSpacing: "0.02em" }}>Book Now</div>
                    <div style={{ width: 38, height: 38, borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings callout */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginBottom: 3, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Avg. monthly earnings</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#CCAB4A", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>₹32,000</div>
                </div>
                <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.07)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#FFF8EC", lineHeight: 1 }}>100+</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 3, fontWeight: 500 }}>Vendors live</div>
                </div>
                <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.07)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#FFF8EC", lineHeight: 1 }}>24h</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 3, fontWeight: 500 }}>Approval</div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .partner-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
            .partner-header { grid-template-columns: 1fr !important; gap: 20px !important; }
            .partner-header > div:last-child { justify-content: flex-start !important; }
          }
        `}</style>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* Footer */}
      <Footer />

      <ChatNudge />

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


      {/* ── Plan an Occasion Flow ── */}
      {occasionFlow && (() => {
        const isGrid = occasionFlow === "grid";
        const occ = isGrid ? null : occasionFlow;
        const hub = occ ? HUB_ROUTES[occ.id] : null;
        const filtered = OCCASIONS.filter(o =>
          !occasionSearch.trim() ||
          o.name.toLowerCase().includes(occasionSearch.toLowerCase()) ||
          (o.localName || "").toLowerCase().includes(occasionSearch.toLowerCase())
        );
        const f = "'Outfit', sans-serif";
        return (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setOccasionFlow(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.68)", zIndex: 9000, backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
            />

            {/* Center modal */}
            <div style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              zIndex: 9001, width: "min(94vw, 560px)", maxHeight: "82dvh",
              background: "linear-gradient(180deg,#1D0E03 0%,#120700 100%)",
              borderRadius: 22, display: "flex", flexDirection: "column",
              boxShadow: "0 24px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(196,122,46,0.18)",
              overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 4px", fontFamily: f }}>Plan an Occasion</p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.25rem,3vw,1.7rem)", fontWeight: 400, color: "#F5ECD8", margin: 0, lineHeight: 1.15 }}>What are you celebrating?</h2>
                  </div>
                  <button onClick={() => setOccasionFlow(null)} style={{ background: "rgba(255,247,235,0.08)", border: "1px solid rgba(255,247,235,0.1)", color: "#F5ECD8", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,247,235,0.16)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,247,235,0.08)"; }}>✕</button>
                </div>
                {/* Search */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,247,235,0.06)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "0 14px" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(245,236,216,0.4)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    value={occasionSearch}
                    onChange={e => setOccasionSearch(e.target.value)}
                    placeholder="Search occasions…"
                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, fontFamily: f, color: "#F5ECD8", padding: "10px 0" }}
                  />
                  {occasionSearch && <button onClick={() => setOccasionSearch("")} style={{ background: "none", border: "none", color: "rgba(245,236,216,0.4)", cursor: "pointer", fontSize: 15, padding: 0 }}>✕</button>}
                </div>
              </div>

              {/* Grid */}
              <div style={{ overflowY: "auto", flex: 1, padding: "14px 14px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10 }}>
                  {filtered.map(o => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setOccasionFlow(null);
                        const hub = HUB_ROUTES[o.id];
                        setOccModal({ label: o.name, slug: o.id, hub: hub || null, photo: o.coverImage, step: hub ? 1 : 2 });
                      }}
                      style={{ background: "rgba(255,247,235,0.04)", border: "1.5px solid rgba(196,122,46,0.12)", borderRadius: 14, overflow: "hidden", cursor: "pointer", textAlign: "left", padding: 0, fontFamily: f, transition: "all 0.18s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.45)"; e.currentTarget.style.background = "rgba(196,122,46,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.12)"; e.currentTarget.style.background = "rgba(255,247,235,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <div style={{ height: 80, overflow: "hidden", position: "relative" }}>
                        <img src={o.coverImage} alt={o.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.78 }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.52) 0%,transparent 55%)" }} />
                        <span style={{ position: "absolute", top: 7, left: 8, color: "#fff", display: "flex" }}>{OCCASION_ICONS[o.id] || _ic(<><circle cx="12" cy="12" r="10"/></>)}</span>
                      </div>
                      <div style={{ padding: "7px 10px 9px" }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#F5ECD8", lineHeight: 1.25 }}>{o.name}</div>
                        {o.localName && <div style={{ fontSize: 11, color: "#C47A2E", fontWeight: 600, marginTop: 2 }}>{o.localName}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Occasion Strip: two-step modal ── */}
      {occModal && (()=>{
        const f="'Outfit',sans-serif";
        const ser="'Cormorant Garamond',Georgia,serif";
        const g="#C47A2E";
        const step=occModal.step||1;
        return(
          <div
            style={{position:"fixed",inset:0,zIndex:3000,background:"rgba(8,4,0,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
            onClick={()=>setOccModal(null)}
          >
            <style>{`
              @keyframes occm-in{from{opacity:0;transform:scale(0.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
              @keyframes occm-slide{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
            `}</style>
            <div
              style={{background:"#FDFAF5",borderRadius:28,overflow:"hidden",maxWidth:380,width:"100%",boxShadow:"0 36px 90px rgba(28,9,0,0.38)",animation:"occm-in 0.26s cubic-bezier(0.22,1,0.36,1)"}}
              onClick={e=>e.stopPropagation()}
            >
              {/* photo header */}
              <div style={{position:"relative",height:140,overflow:"hidden"}}>
                {occModal.photo&&<img src={occModal.photo} alt={occModal.label} style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(8,4,0,0.82) 0%,rgba(8,4,0,0.3) 60%,transparent 100%)"}}/>
                <div style={{position:"absolute",bottom:16,left:20,right:20}}>
                  {step===2&&occModal.hub&&(
                    <button onClick={()=>setOccModal(m=>({...m,step:1}))} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"rgba(255,255,255,0.7)",fontSize:11,fontWeight:600,borderRadius:100,padding:"4px 12px",cursor:"pointer",fontFamily:f,marginBottom:8,display:"block"}}>← Back</button>
                  )}
                  <p style={{fontSize:10,color:"rgba(255,255,255,0.55)",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",margin:"0 0 2px",fontFamily:f}}>{step===1?"Choose":"How to plan"}</p>
                  <p style={{fontFamily:ser,fontSize:22,fontWeight:500,color:"#fff",margin:0,lineHeight:1.15}}>{occModal.label}</p>
                </div>
              </div>

              <div style={{padding:"20px 20px 24px",animation:"occm-slide 0.2s ease both"}}>
                {step===1&&(
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    {/* Party Hub */}
                    {occModal.hub&&(<button
                      onClick={()=>{setOccModal(null);navigate(occModal.hub);}}
                      style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",borderRadius:16,border:"none",background:"#1C0900",cursor:"pointer",textAlign:"left",fontFamily:f,transition:"opacity 0.14s"}}
                      onMouseEnter={e=>e.currentTarget.style.opacity="0.88"}
                      onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                    >
                      <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🎮</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:2}}>Party Hub</div>
                        <div style={{fontSize:11.5,color:"rgba(255,255,255,0.5)",lineHeight:1.4}}>Games, tools & activities</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>)}
                    {/* Plan the Party */}
                    <button
                      onClick={()=>setOccModal(m=>({...m,step:2}))}
                      style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",borderRadius:16,border:`1.5px solid rgba(196,122,46,0.2)`,background:"rgba(196,122,46,0.04)",cursor:"pointer",textAlign:"left",fontFamily:f,transition:"all 0.16s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(196,122,46,0.09)";e.currentTarget.style.borderColor="#C47A2E";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(196,122,46,0.04)";e.currentTarget.style.borderColor="rgba(196,122,46,0.2)";}}
                    >
                      <div style={{width:42,height:42,borderRadius:13,background:`linear-gradient(135deg,${g},#D4A848)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px rgba(196,122,46,0.28)",color:"#fff"}}>{_ic(<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>, 20)}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,color:"#1C0900",marginBottom:2}}>Plan the Party</div>
                        <div style={{fontSize:11.5,color:"rgba(28,9,0,0.5)",lineHeight:1.4}}>Vendors, timeline & full blueprint</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={g} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                )}

                {step===2&&(
                  <div style={{display:"flex",flexDirection:"column",gap:9,animation:"occm-slide 0.2s ease both"}}>
                    {/* With Theme */}
                    <button
                      onClick={()=>{setOccModal(null);navigate(`/occasions/${occModal.slug}?planMode=with`);}}
                      style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",borderRadius:16,border:"none",
                        background:`linear-gradient(135deg,rgba(196,122,46,0.12),rgba(196,122,46,0.04))`,
                        cursor:"pointer",textAlign:"left",fontFamily:f,transition:"transform 0.15s,box-shadow 0.15s",boxShadow:"0 2px 10px rgba(196,122,46,0.1)"}}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 22px rgba(196,122,46,0.2)";}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 10px rgba(196,122,46,0.1)";}}
                    >
                      <div style={{width:42,height:42,borderRadius:13,background:`linear-gradient(135deg,${g},#D4A848)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px rgba(196,122,46,0.3)",color:"#fff"}}>{_ic(<><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28-.1-.53-.26-.74-.16-.21-.24-.47-.24-.76 0-.55.45-1 1-1h1.46c2.5 0 4.54-2.04 4.54-4.54C22 6.75 17.52 2 12 2z"/><circle cx="7.5" cy="12.5" r="1"/><circle cx="10.5" cy="8.5" r="1"/><circle cx="14.5" cy="8.5" r="1"/><circle cx="17" cy="12.5" r="1"/></>, 20)}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                          <span style={{fontSize:15,fontWeight:700,color:"#1C0900"}}>Plan with a Theme</span>
                          <span style={{fontSize:11,fontWeight:800,color:"#fff",background:g,borderRadius:100,padding:"1px 7px",letterSpacing:"0.06em",textTransform:"uppercase"}}>Best</span>
                        </div>
                        <div style={{fontSize:11.5,color:"rgba(28,9,0,0.5)",lineHeight:1.4}}>Choose a look — we tailor everything to it</div>
                      </div>
                    </button>
                    {/* Jump in */}
                    <button
                      onClick={()=>{setOccModal(null);navigate(`/occasions/${occModal.slug}?planMode=without`);}}
                      style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",borderRadius:16,border:`1.5px solid rgba(28,9,0,0.08)`,background:"#fff",cursor:"pointer",textAlign:"left",fontFamily:f,transition:"all 0.16s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(196,122,46,0.25)";e.currentTarget.style.background="rgba(196,122,46,0.03)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(28,9,0,0.08)";e.currentTarget.style.background="#fff";}}
                    >
                      <div style={{width:42,height:42,borderRadius:13,background:"rgba(28,9,0,0.05)",border:"1.5px solid rgba(28,9,0,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>⚡</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,color:"#1C0900",marginBottom:2}}>Jump Straight In</div>
                        <div style={{fontSize:11.5,color:"rgba(28,9,0,0.5)",lineHeight:1.4}}>Skip theme — go directly to vendors</div>
                      </div>
                    </button>
                  </div>
                )}
                <button onClick={()=>setOccModal(null)} style={{display:"block",width:"100%",marginTop:12,padding:"9px 0",border:"none",background:"none",color:"rgba(28,9,0,0.3)",fontSize:12,cursor:"pointer",fontFamily:f}}>Cancel</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Home;

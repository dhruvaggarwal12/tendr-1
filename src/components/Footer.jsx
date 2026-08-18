import React, { useState } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";
import { motion } from "framer-motion";
import tendrLogo from "../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";

const SOCIAL = [
  { Icon: FaInstagram,  href: "https://www.instagram.com/justtendrit?igsh=ZzlxcDhqOXo0dzVu&utm_source=qr", label: "Instagram" },
  { Icon: FaWhatsapp,   href: "https://wa.me/919211668427",                                                  label: "WhatsApp" },
  { Icon: FaFacebookF,  href: "https://www.facebook.com/share/1RENaQTgyj/?mibextid=wwXIfr",                 label: "Facebook" },
  { Icon: FaXTwitter,   href: "https://x.com/tendr293418?s=21",                                              label: "Twitter" },
  { Icon: FaLinkedinIn, href: "https://www.linkedin.com/company/justtendrit/",                               label: "LinkedIn" },
];

const COLS = [
  {
    title: "Services",
    links: [
      { label: "Photography",        href: "/listings" },
      { label: "Catering",           href: "/listings" },
      { label: "Decoration",         href: "/listings" },
      { label: "DJ & Entertainment", href: "/listings" },
      { label: "Gift Hampers",       href: "/gift-hampers-cakes" },
      { label: "Wedding Stationery", href: "/stationery" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us",        href: "/about-us" },
      { label: "Become a Vendor", href: "/vendor/register" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us",          href: "/contact-us" },
      { label: "Refund Policy",       href: "/refund-policy" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
    ],
  },
];

/* stagger variant for link columns (ui-ux-pro-max: stagger-sequence) */
const colVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const linkVariants = {
  hidden:  { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

export default function Footer() {
  return (
    <footer style={{ fontFamily: font, background: "#1C0E04", position: "relative", overflow: "hidden" }}>

      {/* Ambient glow blobs */}
      <div aria-hidden style={{ position: "absolute", top: -100, left: -80, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,122,46,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: 80, right: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(204,171,74,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* ── Top gold hairline ── */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(196,122,46,0.4) 25%, rgba(204,171,74,0.4) 75%, transparent)" }} />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 48px 0", position: "relative" }}>

        {/* ── Main 4-col grid ── */}
        <div className="footer-main-grid" style={{ display: "grid", gridTemplateColumns: "1.9fr 1fr 1fr 1fr", gap: 48, alignItems: "start" }}>

          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Logo — inverted white */}
            <img
              src={tendrLogo}
              alt="Tendr"
              style={{ height: 36, maxWidth: 150, objectFit: "contain", display: "block", filter: "brightness(0) invert(1)", marginBottom: 20, opacity: 0.92 }}
            />

            {/* Brand tagline in Cormorant (ui-ux-pro-max: font-pairing, typography carries personality) */}
            <p style={{ fontFamily: serif, fontSize: 17, fontWeight: 400, fontStyle: "italic", color: "rgba(255,247,235,0.55)", lineHeight: 1.62, marginBottom: 28, maxWidth: 268 }}>
              Curated vendors, effortless planning — unforgettable celebrations across Delhi NCR.
            </p>

            {/* Contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                { label: "Email", value: "contact@tendr.co.in", href: "mailto:contact@tendr.co.in" },
                { label: "Phone", value: "+91-9211668427",       href: "tel:+919211668427" },
                { label: "City",  value: "Delhi NCR, India",     href: null },
              ].map(({ label, value, href }) => (
                <div key={label} style={{ fontSize: 13, color: "rgba(255,247,235,0.4)", display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ color: "rgba(196,122,46,0.65)", fontWeight: 600, minWidth: 40, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
                  {href ? (
                    <a href={href} style={{ color: "rgba(255,247,235,0.42)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#CCAB4A")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,247,235,0.42)")}
                    >{value}</a>
                  ) : <span>{value}</span>}
                </div>
              ))}
            </div>

            {/* Social icons — stagger on view (ui-ux-pro-max: stagger-sequence) */}
            <motion.div
              style={{ display: "flex", gap: 8, marginBottom: 32 }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }}
            >
              {SOCIAL.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  variants={{ hidden: { opacity: 0, scale: 0.7 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 320, damping: 20 } } }}
                  whileHover={{ scale: 1.15, y: -3 }}
                  style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,247,235,0.06)", border: "1px solid rgba(196,122,46,0.16)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,247,235,0.42)", fontSize: 14, textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.14)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.45)"; e.currentTarget.style.color = "#CCAB4A"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,247,235,0.06)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.16)"; e.currentTarget.style.color = "rgba(255,247,235,0.42)"; }}
                >
                  <Icon />
                </motion.a>
              ))}
            </motion.div>

            {/* Back to top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: "rgba(255,247,235,0.28)", fontSize: 12, fontWeight: 500, letterSpacing: "0.07em", padding: 0, border: "none", cursor: "pointer", transition: "color 0.18s", fontFamily: font, textTransform: "uppercase" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#CCAB4A")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,247,235,0.28)")}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M5.5 9V2M5.5 2L2 5.5M5.5 2L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to top
            </button>
          </motion.div>

          {/* Link columns — stagger entrance per column */}
          {COLS.map((col, ci) => (
            <motion.div
              key={col.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={colVariants}
              style={{ transitionDelay: `${ci * 0.08}s` }}
            >
              <motion.h3
                variants={linkVariants}
                style={{ fontSize: 10, fontWeight: 700, color: "rgba(196,122,46,0.7)", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 24px" }}
              >
                {col.title}
              </motion.h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {col.links.map(({ label, href }) => (
                  <motion.li key={label} variants={linkVariants}>
                    <a
                      href={href}
                      style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,247,235,0.42)", textDecoration: "none", transition: "color 0.15s", display: "inline-block", lineHeight: 1.4 }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,247,235,0.88)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,247,235,0.42)")}
                    >
                      {label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── App strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
          style={{ marginTop: 52, padding: "28px 32px", borderRadius: 16, background: "rgba(255,247,235,0.04)", border: "1px solid rgba(196,122,46,0.14)", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", justifyContent: "space-between" }}
        >
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 5px" }}>Tendr App</p>
            <h3 style={{ fontFamily: serif, fontSize: 19, fontWeight: 600, fontStyle: "italic", color: "rgba(255,247,235,0.88)", margin: "0 0 4px", lineHeight: 1.2 }}>Celebrate on the go</h3>
            <p style={{ fontSize: 13, color: "rgba(255,247,235,0.36)", margin: 0 }}>Android · iOS · Desktop — no app store needed.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ label: "Android", icon: "🤖" }, { label: "iPhone", icon: "🍎" }, { label: "Desktop", icon: "💻" }].map(({ label, icon }) => (
              <a key={label} href="/install"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 17px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", background: "rgba(255,247,235,0.04)", color: "rgba(255,247,235,0.5)", fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.1)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.38)"; e.currentTarget.style.color = "#CCAB4A"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,247,235,0.04)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.2)"; e.currentTarget.style.color = "rgba(255,247,235,0.5)"; }}
              >
                <span style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </a>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom bar ── */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(196,122,46,0.18) 30%, rgba(204,171,74,0.18) 70%, transparent)", margin: "36px 0 0" }} />
        <div className="footer-bottom-bar" style={{ padding: "22px 0 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: 13, color: "rgba(255,247,235,0.25)", margin: 0 }}>© 2026 Tendr. All rights reserved.</p>
          <p style={{ fontSize: 13, color: "rgba(255,247,235,0.18)", margin: 0 }}>Made with care in Delhi NCR</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .footer-main-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
        }
        @media (max-width: 560px) {
          .footer-main-grid { grid-template-columns: 1fr !important; }
          .footer-bottom-bar { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important; }
        }
      `}</style>
    </footer>
  );
}

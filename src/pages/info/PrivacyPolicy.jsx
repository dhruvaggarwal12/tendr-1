import React from "react";
import SEO from "../../components/SEO";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";

const SECTIONS = [
  {
    title: "Information We Collect",
    items: [
      { heading: "Account Information", body: "When you sign up, we collect your name, phone number, email address, and city. If you sign in with Google, we also receive your Google account's name and profile picture." },
      { heading: "Event & Planning Data", body: "Information you provide while using planning tools — vendor selections, event dates, guest counts, budgets, checklists, and timelines — is stored to power your dashboard." },
      { heading: "Usage Data", body: "We collect standard server logs including IP address, device type, browser, and pages visited to diagnose issues and improve the product." },
      { heading: "Payment Information", body: "Payments are processed by Razorpay. Tendr does not store your card or bank details — only the transaction reference and status." },
      { heading: "Community Content", body: "Photos, reviews, and posts you share on the Community Wall are stored and displayed to other users." },
    ],
  },
  {
    title: "How We Use Your Information",
    items: [
      { heading: "Service Delivery", body: "To create your account, match you with vendors, process bookings, and send event reminders." },
      { heading: "Communication", body: "We send transactional messages (booking confirmations, OTPs) via WhatsApp and SMS. We may send occasional product updates — you can opt out at any time." },
      { heading: "Improvement", body: "Aggregated, anonymised usage data is used to improve features and fix bugs. We do not sell your personal data." },
      { heading: "Legal Compliance", body: "We may use or disclose your data when required by law, court order, or to protect the rights and safety of Tendr, its users, or the public." },
    ],
  },
  {
    title: "How We Share Your Information",
    items: [
      { heading: "With Vendors", body: "When you send a booking enquiry, your name, event details, and contact number are shared with the relevant vendor so they can respond to your request." },
      { heading: "Service Providers", body: "We use third-party services including Cloudinary (file storage), Razorpay (payments), and Redis Cloud (session data). These providers process data only as necessary to deliver their service." },
      { heading: "No Sale of Data", body: "We do not sell, rent, or trade your personal information to any third party for marketing purposes." },
    ],
  },
  {
    title: "Data Retention",
    items: [
      { heading: "Active Accounts", body: "We retain your data for as long as your account is active or as needed to provide the service." },
      { heading: "Account Deletion", body: "You can request account deletion by contacting us at support@tendr.co.in. We will delete your personal data within 30 days, except where retention is required by law." },
      { heading: "OTP & Temporary Data", body: "OTPs and Google sign-in pending tokens are stored in Redis with a short TTL (5–10 minutes) and are automatically deleted." },
    ],
  },
  {
    title: "Your Rights",
    items: [
      { heading: "Access & Correction", body: "You can view and update your profile information at any time from your dashboard." },
      { heading: "Data Portability", body: "You may request a copy of your personal data by emailing support@tendr.co.in." },
      { heading: "Withdrawal of Consent", body: "You may withdraw consent for non-essential communications at any time by contacting us or using the opt-out link in any message we send." },
    ],
  },
  {
    title: "Security",
    items: [
      { heading: "Technical Measures", body: "All data is transmitted over HTTPS. Passwords are hashed using bcrypt. JWTs are signed and expire after 7 days." },
      { heading: "Limitation", body: "No system is 100% secure. If you suspect unauthorised access to your account, contact us immediately at support@tendr.co.in." },
    ],
  },
  {
    title: "Cookies & Local Storage",
    items: [
      { heading: "What We Store", body: "We use browser localStorage to remember your session token, UI preferences (e.g. dark mode), and tool data (timelines, budgets) you create locally." },
      { heading: "No Third-Party Tracking Cookies", body: "We do not use advertising cookies or third-party trackers. Google OAuth uses its own cookies on Google's domain during sign-in, which is governed by Google's privacy policy." },
    ],
  },
  {
    title: "Children's Privacy",
    items: [
      { heading: "Age Requirement", body: "Tendr is not directed at children under 13. We do not knowingly collect personal information from anyone under 13. If you believe a child has provided us data, contact us and we will delete it promptly." },
    ],
  },
  {
    title: "Changes to This Policy",
    items: [
      { heading: "Updates", body: "We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the app or sending you a message. Continued use of Tendr after changes constitutes acceptance." },
    ],
  },
  {
    title: "Contact Us",
    items: [
      { heading: "Questions or Requests", body: "Email: support@tendr.co.in\nAddress: New Delhi, India\n\nWe aim to respond to all privacy-related requests within 7 business days." },
    ],
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: font, background: "#FFFCF5", minHeight: "100vh" }}>
      <SEO
        title="Privacy Policy — Tendr"
        description="How Tendr collects, uses, and protects your personal information. Read our full privacy policy."
        path="/privacy"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy" }]}
      />
      <HamburgerNav />

      <style>{`
        .pp-dot-bg { background-color: #FFFCF5; background-image: radial-gradient(circle, rgba(196,122,46,0.22) 1.5px, transparent 1.5px); background-size: 26px 26px; }
        @keyframes pp-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .pp-in-0 { animation: pp-in 0.52s 0.05s cubic-bezier(.22,1,.36,1) both; }
        .pp-in-1 { animation: pp-in 0.52s 0.13s cubic-bezier(.22,1,.36,1) both; }
        .pp-in-2 { animation: pp-in 0.52s 0.21s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .pp-in-0,.pp-in-1,.pp-in-2 { animation: none !important; opacity: 1 !important; } }
      `}</style>

      {/* Hero */}
      <div className="pp-dot-bg" style={{ padding: "80px 24px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 62% 72% at 50% 50%, rgba(255,252,245,0.95) 0%, rgba(255,252,245,0.58) 60%, transparent 100%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <span className="pp-in-0" style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C47A2E", background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.22)", padding: "4px 14px", borderRadius: 100, marginBottom: 18 }}>
            Legal
          </span>
          <h1 className="pp-in-1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.2rem, 5vw, 3.4rem)", fontWeight: 300, color: "#2C1A0E", margin: "0 0 16px", lineHeight: 1.15 }}>
            Privacy <em style={{ color: "#C47A2E", fontStyle: "italic" }}>Policy</em>
          </h1>
          <p className="pp-in-2" style={{ fontSize: 17, color: "#7A5535", maxWidth: 540, margin: "0 auto", lineHeight: 1.65 }}>
            We believe your data is yours. Here's exactly what we collect, why we collect it, and how we keep it safe.
          </p>
          <p style={{ fontSize: 13, color: "#9B7450", marginTop: 16 }}>Last updated: October 2026</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px 80px" }}>
        {SECTIONS.map(({ title, items }) => (
          <div key={title} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 20px", letterSpacing: "-0.01em", borderBottom: "2px solid rgba(196,122,46,0.15)", paddingBottom: 10 }}>{title}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map(({ heading, body }) => (
                <div key={heading} style={{ background: "#fff", border: "1.5px solid rgba(196,122,46,0.12)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(196,122,46,0.06)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#7A5535", marginBottom: 6 }}>{heading}</div>
                  <div style={{ fontSize: 14, color: "#4A3020", lineHeight: 1.7, whiteSpace: "pre-line" }}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ background: "rgba(196,122,46,0.06)", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 16, padding: "24px", textAlign: "center", marginTop: 16 }}>
          <p style={{ fontSize: 14, color: "#7A5535", margin: 0, lineHeight: 1.7 }}>
            By using Tendr, you agree to this Privacy Policy. If you have any questions, email us at{" "}
            <a href="mailto:support@tendr.co.in" style={{ color: "#C47A2E", fontWeight: 700 }}>support@tendr.co.in</a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

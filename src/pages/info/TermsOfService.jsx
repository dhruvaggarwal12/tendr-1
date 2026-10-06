import React from "react";
import SEO from "../../components/SEO";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    items: [
      { heading: "Agreement", body: "By creating an account or using Tendr (the platform available at tendr.co.in and the Tendr mobile app), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use Tendr." },
      { heading: "Eligibility", body: "You must be at least 18 years old to use Tendr. By using the platform, you represent and warrant that you meet this requirement." },
    ],
  },
  {
    title: "About Tendr",
    items: [
      { heading: "What Tendr Is", body: "Tendr is an event planning platform that connects individuals and businesses with vendors (decorators, caterers, photographers, and others) for events in India. Tendr facilitates discovery, planning, and booking — it is not itself a vendor." },
      { heading: "Tendr as Marketplace", body: "Contracts for services are between you and the vendor directly. Tendr is not a party to those contracts and is not responsible for the vendor's performance, quality, or conduct." },
    ],
  },
  {
    title: "Accounts",
    items: [
      { heading: "Registration", body: "You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account." },
      { heading: "Google Sign-In", body: "If you choose to sign in with Google, you authorise Tendr to receive your name, email address, and profile picture from Google. Your use of Google Sign-In is also subject to Google's Terms of Service." },
      { heading: "One Account Per Person", body: "You may not create multiple accounts for the same person. Tendr reserves the right to merge or close duplicate accounts." },
    ],
  },
  {
    title: "Acceptable Use",
    items: [
      { heading: "Permitted Use", body: "You may use Tendr to discover vendors, plan events, manage bookings, and engage with community features for lawful purposes." },
      { heading: "Prohibited Conduct", body: "You must not:\n• Post false, misleading, or fraudulent reviews or content\n• Scrape, copy, or redistribute Tendr's data or listings\n• Attempt to circumvent Tendr's platform to conduct off-platform transactions with vendors you found through Tendr\n• Use the platform to harass, spam, or defraud vendors or other users\n• Impersonate any person or entity\n• Interfere with or disrupt the platform's infrastructure" },
      { heading: "Community Content", body: "Content you post on the Community Wall (photos, reviews, comments) must be your own original content. You grant Tendr a non-exclusive, royalty-free licence to display and share that content on the platform." },
    ],
  },
  {
    title: "Bookings & Payments",
    items: [
      { heading: "Booking Process", body: "Bookings are confirmed only when both you and the vendor have agreed to the terms and payment has been processed or a deposit has been received." },
      { heading: "Payments", body: "Payments are processed by Razorpay. By making a payment through Tendr, you agree to Razorpay's terms. Tendr is not responsible for payment failures, gateway errors, or bank-related delays." },
      { heading: "Cancellations & Refunds", body: "Cancellation and refund terms are governed by the individual vendor's policy and Tendr's Refund Policy (available at tendr.co.in/refund-policy). Tendr does not guarantee refunds from vendors." },
    ],
  },
  {
    title: "Vendor Listings",
    items: [
      { heading: "Accuracy", body: "Tendr attempts to display accurate vendor information but does not guarantee that listings, prices, availability, or portfolios are up to date. Always confirm details directly with the vendor before booking." },
      { heading: "Vendor Independence", body: "Vendors on Tendr are independent businesses, not employees or agents of Tendr. Tendr does not endorse any vendor and is not liable for the quality, safety, or legality of their services." },
    ],
  },
  {
    title: "Intellectual Property",
    items: [
      { heading: "Tendr's IP", body: "The Tendr name, logo, website design, and all original content produced by Tendr are owned by Tendr and may not be copied, reproduced, or used without written permission." },
      { heading: "Your Content", body: "You retain ownership of content you create. By posting it on Tendr, you grant us a licence to display it within the platform. You may request removal of your content by contacting support@tendr.co.in." },
    ],
  },
  {
    title: "Disclaimers & Limitation of Liability",
    items: [
      { heading: "As-Is Service", body: "Tendr is provided 'as is' and 'as available' without warranties of any kind, express or implied, including warranties of merchantability or fitness for a particular purpose." },
      { heading: "No Liability for Vendor Actions", body: "Tendr is not liable for any loss, damage, injury, or disappointment resulting from a vendor's actions, omissions, cancellations, or quality of service." },
      { heading: "Cap on Liability", body: "To the maximum extent permitted by applicable law, Tendr's total liability to you for any claim arising from your use of the platform shall not exceed the amount you paid to Tendr (not to vendors) in the 3 months preceding the claim." },
    ],
  },
  {
    title: "Termination",
    items: [
      { heading: "By You", body: "You may delete your account at any time by contacting support@tendr.co.in. Pending bookings or payments should be resolved before account deletion." },
      { heading: "By Tendr", body: "Tendr may suspend or terminate your account immediately if you breach these Terms, engage in fraudulent activity, or if required by law." },
    ],
  },
  {
    title: "Governing Law",
    items: [
      { heading: "Jurisdiction", body: "These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India." },
    ],
  },
  {
    title: "Changes to These Terms",
    items: [
      { heading: "Updates", body: "We may update these Terms from time to time. We will notify you of material changes by posting a notice on the platform. Continued use of Tendr after changes constitutes your acceptance of the revised Terms." },
    ],
  },
  {
    title: "Contact",
    items: [
      { heading: "Questions", body: "If you have questions about these Terms, contact us at:\n\nEmail: support@tendr.co.in\nAddress: New Delhi, India" },
    ],
  },
];

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: font, background: "#FFFCF5", minHeight: "100vh" }}>
      <SEO
        title="Terms of Service — Tendr"
        description="The terms and conditions governing your use of Tendr, India's event planning platform."
        path="/terms"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Terms of Service", path: "/terms" }]}
      />
      <HamburgerNav />

      <style>{`
        .tos-dot-bg { background-color: #FFFCF5; background-image: radial-gradient(circle, rgba(196,122,46,0.22) 1.5px, transparent 1.5px); background-size: 26px 26px; }
        @keyframes tos-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .tos-in-0 { animation: tos-in 0.52s 0.05s cubic-bezier(.22,1,.36,1) both; }
        .tos-in-1 { animation: tos-in 0.52s 0.13s cubic-bezier(.22,1,.36,1) both; }
        .tos-in-2 { animation: tos-in 0.52s 0.21s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .tos-in-0,.tos-in-1,.tos-in-2 { animation: none !important; opacity: 1 !important; } }
      `}</style>

      {/* Hero */}
      <div className="tos-dot-bg" style={{ padding: "80px 24px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 62% 72% at 50% 50%, rgba(255,252,245,0.95) 0%, rgba(255,252,245,0.58) 60%, transparent 100%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <span className="tos-in-0" style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C47A2E", background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.22)", padding: "4px 14px", borderRadius: 100, marginBottom: 18 }}>
            Legal
          </span>
          <h1 className="tos-in-1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.2rem, 5vw, 3.4rem)", fontWeight: 300, color: "#2C1A0E", margin: "0 0 16px", lineHeight: 1.15 }}>
            Terms of <em style={{ color: "#C47A2E", fontStyle: "italic" }}>Service</em>
          </h1>
          <p className="tos-in-2" style={{ fontSize: 17, color: "#7A5535", maxWidth: 540, margin: "0 auto", lineHeight: 1.65 }}>
            Please read these terms carefully. They govern your use of Tendr and define our responsibilities to each other.
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
            Questions about these terms? Email us at{" "}
            <a href="mailto:support@tendr.co.in" style={{ color: "#C47A2E", fontWeight: 700 }}>support@tendr.co.in</a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

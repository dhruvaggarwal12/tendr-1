import React, { useState, useRef } from "react";
import SEO from "../../components/SEO";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";

export default function ContactUs() {
  const navigate = useNavigate();
  const [focused, setFocused] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "b6e1a881-5d38-4228-bfc4-379df27385c0",
          name: form.name,
          email: form.email,
          message: form.message,
          subject: `New message from ${form.name} via Tendr Contact Form`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError("Something went wrong. Please email us directly at contacttendr@gmail.com");
      }
    } catch {
      setError("Network error. Please try again or email contacttendr@gmail.com");
    } finally {
      setSending(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: 12,
    border: `1.5px solid ${focused === field ? "#C47A2E" : "rgba(196,122,46,0.25)"}`,
    fontSize: 15,
    fontFamily: font,
    color: "#2C1A0E",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.18s",
  });

  return (
    <div style={{ fontFamily: font, background: "#FFFCF5", minHeight: "100vh" }}>
      <SEO
        title="Contact Tendr — Get Help Planning Your Event in Delhi NCR"
        description="Get in touch with the Tendr team for help planning birthdays, anniversaries, corporate events and more across Delhi, Noida, Gurgaon and Ghaziabad. Email or chat with us today."
        path="/contact-us"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Contact Us", path: "/contact-us" }]}
        schema={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Tendr",
          "url": "https://tendr.co.in/contact-us",
          "description": "Contact the Tendr team for event planning support across Delhi NCR.",
          "mainEntity": {
            "@type": "Organization",
            "@id": "https://tendr.co.in/#organization",
            "name": "Tendr",
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "contactType": "Customer Support",
                "email": "contacttendr@gmail.com",
                "telephone": "+919211668427",
                "availableLanguage": ["English", "Hindi"],
                "areaServed": "IN",
                "hoursAvailable": { "@type": "OpeningHoursSpecification", "opens": "09:00", "closes": "21:00", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] },
              },
            ],
          },
        }}
      />

      <HamburgerNav />

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)", padding: "72px 24px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 14 }}>Get in Touch</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 16px" }}>Contact Us</h1>
        <p style={{ fontSize: 17, color: "#7A5535", maxWidth: 500, margin: "0 auto" }}>We're here to help. Reach out and we'll get back to you within a few hours.</p>
        <div style={{ width: 48, height: 3, background: "linear-gradient(90deg, #C47A2E, #CCAB4A)", borderRadius: 100, margin: "20px auto 0" }} />
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="contact-layout">

        {/* Left: contact info */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 28px", letterSpacing: "-0.01em" }}>Our Contact Details</h2>

          {[
            { icon: "📧", label: "Email", value: "contacttendr@gmail.com", href: "mailto:contacttendr@gmail.com" },
            { icon: "📞", label: "Phone", value: "+91-9211668427", href: "tel:+919211668427" },
            { icon: "💬", label: "WhatsApp", value: "+91-9211668427", href: "https://wa.me/919211668427" },
            { icon: "📍", label: "Location", value: "Delhi NCR, India", href: null },
            { icon: "🕐", label: "Hours", value: "Mon–Sat, 10 AM – 6 PM IST", href: null },
          ].map(({ icon, label, value, href }) => (
            <div key={label} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(196,122,46,0.1)", border: "1.5px solid rgba(196,122,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{label}</div>
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    style={{ fontSize: 15, color: "#2C1A0E", fontWeight: 500, textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#C47A2E")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#2C1A0E")}
                  >{value}</a>
                ) : (
                  <span style={{ fontSize: 15, color: "#2C1A0E", fontWeight: 500 }}>{value}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right: message form */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", boxShadow: "0 4px 24px rgba(139,69,19,0.08)", border: "1px solid rgba(196,122,46,0.1)" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px" }}>Message Sent!</h3>
              <p style={{ fontSize: 14, color: "#9B7450" }}>We'll get back to you within a few hours.</p>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 24px" }}>Send us a Message</h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6B3A1F", marginBottom: 6 }}>Your Name</label>
                  <input name="name" type="text" placeholder="Rahul Sharma" value={form.name} onChange={handleChange} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} style={inputStyle("name")} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6B3A1F", marginBottom: 6 }}>Email Address</label>
                  <input name="email" type="email" placeholder="rahul@example.com" value={form.email} onChange={handleChange} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} style={inputStyle("email")} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6B3A1F", marginBottom: 6 }}>Message</label>
                  <textarea name="message" rows={4} placeholder="How can we help you?" value={form.message} onChange={handleChange} onFocus={() => setFocused("message")} onBlur={() => setFocused("")} style={{ ...inputStyle("message"), resize: "vertical" }} required />
                </div>
                {error && (
                  <p style={{ fontSize: 13, color: "#c0392b", margin: "0 0 4px", background: "rgba(192,57,43,0.07)", padding: "10px 14px", borderRadius: 8 }}>{error}</p>
                )}
                <button type="submit" disabled={sending} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: sending ? "#d4a96a" : "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: sending ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)", transition: "background 0.2s" }}>
                  {sending ? "Sending…" : "Send Message"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`@media (max-width: 700px) { .contact-layout { grid-template-columns: 1fr !important; } }`}</style>
      <Footer />
    </div>
  );
}

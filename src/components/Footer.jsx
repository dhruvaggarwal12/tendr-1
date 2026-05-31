import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";
import tendrLogo from "../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";

export default function Footer() {

  return (
    <footer style={{ fontFamily: font }}>

      {/* ── Main footer body ── */}
      <div style={{ background: "linear-gradient(180deg, #FDF0DC 0%, #F5E6CC 100%)", padding: "64px 0 0" }}>
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr 1fr", gap: 48, alignItems: "start" }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <img
              src={tendrLogo}
              alt="Tendr"
              style={{ height: 44, objectFit: "contain", marginBottom: 14 }}
            />
            <p style={{ fontSize: 15, color: "#7A5535", lineHeight: 1.65, marginBottom: 22, maxWidth: 280 }}>
              Empowering your celebrations with curated planning and unforgettable experiences across Delhi NCR.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 26 }}>
              {[
                { label: "Email", value: "contacttendr@gmail.com", href: "mailto:contacttendr@gmail.com" },
                { label: "Phone", value: "+91-9211668427", href: "tel:+919211668427" },
                { label: "Area", value: "Delhi NCR, India", href: null },
              ].map(({ label, value, href }) => (
                <p key={label} style={{ margin: 0, fontSize: 14, color: "#7A5535" }}>
                  <span style={{ fontWeight: 700, color: "#3B2110" }}>{label}: </span>
                  {href ? (
                    <a href={href} style={{ color: "#7A5535", textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#C47A2E")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#7A5535")}
                    >{value}</a>
                  ) : value}
                </p>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
              {[
                { Icon: FaInstagram, href: "https://www.instagram.com/justtendrit?igsh=ZzlxcDhqOXo0dzVu&utm_source=qr", label: "Instagram" },
                { Icon: FaFacebookF, href: "https://www.facebook.com/share/1RENaQTgyj/?mibextid=wwXIfr", label: "Facebook" },
                { Icon: FaWhatsapp, href: "https://wa.me/919211668427", label: "WhatsApp" },
                { Icon: FaXTwitter, href: "https://x.com/tendr293418?s=21", label: "Twitter" },
                { Icon: FaLinkedinIn, href: "https://www.linkedin.com/company/justtendrit/", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(44,26,14,0.08)", border: "1px solid rgba(139,69,19,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B3A1F", fontSize: 15, textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg,#C47A2E,#DEB887)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.border = "1px solid transparent"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(44,26,14,0.08)"; e.currentTarget.style.color = "#6B3A1F"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.border = "1px solid rgba(139,69,19,0.15)"; }}
                >
                  <Icon />
                </a>
              ))}
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{ background: "#2C1A0E", color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", padding: "8px 18px", borderRadius: 100, border: "none", cursor: "pointer", transition: "background 0.2s", fontFamily: font }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#C47A2E")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2C1A0E")}
            >
              ↑ Back to Top
            </button>
          </div>

          {/* Services */}
          <FooterColumn title="Services" links={[
            { label: "Photography", href: "/listings" },
            { label: "Catering", href: "/listings" },
            { label: "Decoration", href: "/listings" },
            { label: "DJ & Entertainment", href: "/listings" },
            { label: "Gift Hampers & Cakes", href: "/gift-hampers-cakes" },
            { label: "Invitation Flyers", href: "/invitation" },
          ]} />

          {/* Company */}
          <FooterColumn title="Company" links={[
            { label: "About Us", href: "/about-us" },
            { label: "Become a Vendor", href: "/vendor/register" },
          ]} />

          {/* Support */}
          <FooterColumn title="Support" links={[
            { label: "Contact Us", href: "/contact-us" },
            { label: "Refund Policy", href: "/refund-policy" },
            { label: "Cancellation Policy", href: "/cancellation-policy" },
          ]} />
        </div>

        {/* ── Install Tendr App ── */}
        <div style={{ borderTop: "1px solid rgba(139,69,19,0.1)", marginTop: 48, padding: "36px 48px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
              {/* Left: headline */}
              <div style={{ flex: "0 0 260px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>📲 Install Tendr App</p>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px", lineHeight: 1.25 }}>Celebrate on the go</h3>
                <p style={{ fontSize: 13, color: "#9B7450", margin: 0, lineHeight: 1.6 }}>
                  Get instant booking updates, chat with vendors and manage your event from your phone.
                </p>
              </div>
              {/* Right: device instructions */}
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {[
                  { icon: "🍎", title: "iPhone / iPad", steps: ["Open tendr-1.vercel.app in Safari", "Tap the Share button (□↑)", "Scroll down → tap Add to Home Screen", "Tap Add — done!"] },
                  { icon: "🤖", title: "Android", steps: ["Open tendr-1.vercel.app in Chrome", "Tap the ⋮ menu (top right)", "Tap Add to Home Screen", "Tap Add — done!"] },
                  { icon: "💻", title: "Desktop (Chrome / Edge)", steps: ["Open tendr-1.vercel.app", "Look for the ⊕ install icon in the address bar", "Click it → click Install", "Tendr opens as a standalone app!"] },
                ].map(({ icon, title, steps }) => (
                  <div key={title} style={{ background: "rgba(196,122,46,0.05)", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.12)", padding: "16px 18px" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 10 }}>{title}</div>
                    <ol style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 5 }}>
                      {steps.map((s, i) => (
                        <li key={i} style={{ fontSize: 12, color: "#7A5535", lineHeight: 1.5 }}>{s}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{ borderTop: "1px solid rgba(139,69,19,0.12)", marginTop: 52, padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, maxWidth: 1200, margin: "52px auto 0" }}
          className="footer-bottom"
        >
          <p style={{ fontSize: 13.5, color: "#9B7450", margin: 0 }}>
            © 2026 Tendr. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 22 }}>
            <span style={{ fontSize: 13, color: "#bbb" }}>Made with ♥ in Delhi NCR</span>
          </div>
        </div>
        <div style={{ height: 20 }} />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; padding: 0 28px !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; padding: 18px 24px !important; }
        }
      `}</style>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 style={{ fontSize: 11.5, fontWeight: 800, color: "#2C1A0E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
        {title}
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
        {links.map(({ label, href, disabled }) => (
          <li key={label}>
            {disabled ? (
              <span
                title="Coming Soon"
                style={{ fontSize: 14.5, fontWeight: 400, color: "#ccc", display: "inline-block", cursor: "not-allowed" }}
              >
                {label}
              </span>
            ) : (
              <a
                href={href}
                style={{ fontSize: 14.5, fontWeight: 400, color: "#7A5535", textDecoration: "none", transition: "color 0.15s, padding-left 0.15s", display: "inline-block" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#C47A2E"; e.currentTarget.style.paddingLeft = "5px"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#7A5535"; e.currentTarget.style.paddingLeft = "0"; }}
              >
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

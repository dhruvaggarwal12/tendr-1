// src/pages/Home/Home.jsx
import React, { useEffect, useState } from "react";
import SEO from "../../components/SEO";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";
import PlatformFlow from "../../components/PlatformFlow";
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
];

function FaqSection() {
  const [open, setOpen] = React.useState(null);
  const navigate = useNavigate();
  return (
    <section style={{ background: "linear-gradient(180deg,#FFF8F2 0%,#F5E6CC 100%)", padding: "88px 24px 96px", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span style={{ display: "inline-block", background: "rgba(196,122,46,0.1)", color: "#C47A2E", fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "5px 16px", borderRadius: 100, marginBottom: 16 }}>
            Got Questions?
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px", lineHeight: 1.15 }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: 16, color: "#9B7450", maxWidth: 460, margin: "0 auto" }}>
            Everything you need to know before you start planning your celebration.
          </p>
        </div>

        {/* FAQ items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map(({ q, a }, i) => (
            <div key={i}
              style={{
                background: "#fff",
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
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 8, padding: "3px 8px", flexShrink: 0, marginTop: 2, letterSpacing: "0.04em" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", lineHeight: 1.45 }}>{q}</span>
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
                  <p style={{ margin: 0, fontSize: 14.5, color: "#7A5535", lineHeight: 1.75 }}>{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div style={{ textAlign: "center", marginTop: 44, padding: "28px 24px", background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 4px 20px rgba(139,69,19,0.06)" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#2C1A0E", margin: "0 0 6px" }}>Still have questions?</p>
          <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 18px" }}>Our team is happy to help you plan your perfect event.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://wa.me/919211668427" target="_blank" rel="noopener noreferrer"
              style={{ padding: "10px 24px", borderRadius: 10, background: "#25d366", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
              💬 WhatsApp Us
            </a>
            <button onClick={() => navigate("/contact-us")}
              style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Contact Us →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const bookingType = useSelector((s) => s.eventPlanning.bookingType);
  const formEventName = useSelector((s) => s.eventPlanning.formData.eventName);
  const showVendorScreen = useSelector((s) => s.eventPlanning.showVendorScreen);

  const handlePlanEvent = () => {
    // If form already filled and service screen was shown, go back to service selection
    if (bookingType && formEventName) {
      navigate("/plan-event/form");
    } else {
      navigate("/booking");
    }
  };

  const [scrolled, setScrolled] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPrev, setHeroPrev] = useState(null);
  const [heroFading, setHeroFading] = useState(false);

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

  const heroNext = () => goToSlide((heroIndex + 1) % CELEBRATION_PHOTOS.length);
  const heroPrevSlide = () =>
    goToSlide((heroIndex - 1 + CELEBRATION_PHOTOS.length) % CELEBRATION_PHOTOS.length);

  useEffect(() => {
    const t = setInterval(heroNext, 4500);
    return () => clearInterval(t);
  }, [heroIndex, heroFading]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    } else if (selectedValue === "aftermovie") {
      navigate("/aftermovie");
    } else if (selectedValue === "checklist") {
      navigate("/checklist-picker");
    } else if (selectedValue === "Budget Allocator") {
      navigate("/budget-allocator");
    } else if (selectedValue === "invitation") {
      navigate("/invitation");
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

  return (
    <div className="App">
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
          {/* ── Left: copy + CTA ── */}
          <div style={{ flex: "0 0 48%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px 0 64px" }}>
            <span
              style={{
                display: "inline-block",
                background: "rgba(139,69,19,0.1)",
                color: "#8B4513",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "5px 14px",
                borderRadius: 100,
                marginBottom: 28,
                width: "fit-content",
              }}
            >
              Delhi NCR's Trusted Platform
            </span>

            <h1
              style={{
                fontSize: "clamp(2rem, 3.2vw, 3.4rem)",
                fontWeight: 800,
                lineHeight: 1.18,
                color: "#2C1A0E",
                marginBottom: 24,
                letterSpacing: "-0.02em",
              }}
            >
              Plan, organize, and celebrate unforgettable moments —{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #C47A2E, #DEB887)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                effortlessly
              </span>
              {" "}and all in one place.
            </h1>

            <p
              style={{
                fontSize: 17,
                fontWeight: 400,
                color: "#6B4226",
                lineHeight: 1.65,
                marginBottom: 40,
                maxWidth: 480,
              }}
            >
              From discovering ideas to managing vendors, budgets, guest lists, and bookings, Tendr helps you handle every part of your celebration without the usual stress.
            </p>

            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/booking")}
                style={{
                  background: "linear-gradient(135deg, #C47A2E 0%, #DEB887 100%)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  padding: "14px 36px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(196,122,46,0.38)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  fontFamily: "'Outfit', sans-serif",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(196,122,46,0.38)";
                }}
              >
                Plan Your Event →
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
              }}
            >
              {/* Current photo */}
              <img
                key={heroIndex}
                src={CELEBRATION_PHOTOS[heroIndex].url}
                alt={CELEBRATION_PHOTOS[heroIndex].label}
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
                {CELEBRATION_PHOTOS[heroIndex].label}
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

              {/* Dot indicators */}
              <div
                style={{
                  position: "absolute",
                  bottom: 18,
                  right: 18,
                  display: "flex",
                  gap: 6,
                  zIndex: 2,
                }}
              >
                {CELEBRATION_PHOTOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    style={{
                      width: i === heroIndex ? 20 : 7,
                      height: 7,
                      borderRadius: 4,
                      background: i === heroIndex ? "#fff" : "rgba(255,255,255,0.5)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee strip — right under hero text ── */}
      {(() => {
        const GROUPS = [
          { icon: "🏙", label: "Cities", color: "#7A4A1E", items: ["Delhi", "Noida", "Gurgaon", "Ghaziabad", "Faridabad", "Greater Noida"] },
          { icon: "🎯", label: "Services", color: "#C47A2E", items: ["Photography", "Catering", "DJ & Music", "Decoration", "Balloon Setup"] },
          { icon: "🎉", label: "Events", color: "#8B4513", items: ["Birthday Parties", "Anniversaries", "Corporate Events", "Baby Showers", "House Parties", "Surprise Setups"] },
          { icon: "✨", label: "Platform", color: "#C47A2E", items: ["Free to Browse", "Instant Chat", "100+ Verified Vendors", "Verified Reviews", "Same-Day Support"] },
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
                        <span style={{ color: group.color, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", whiteSpace: "nowrap", textTransform: "uppercase" }}>
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
            padding: 40px 28px 32px !important;
          }
          .hero-split > div:last-child {
            flex: unset !important;
            position: relative !important;
            height: 340px !important;
            width: 100% !important;
          }
          .hero-split > div:last-child > div {
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* How Tendr Works — horizontal animated */}
      <section style={{ background: "#FFFCF5", padding: "80px 24px 88px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Your Journey</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 10px" }}>How Tendr Works</h2>
            <p style={{ fontSize: 15, color: "#9B7450", maxWidth: 480, margin: "0 auto" }}>Five simple steps from idea to celebration — most events booked within 48 hours.</p>
          </div>

          {/* Steps row */}
          <div style={{ position: "relative" }}>

            {/* Animated connecting line with glow pulse */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeInOut", delay: 0.2 }}
              style={{
                position: "absolute", top: 36, left: "10%", right: "10%", height: 2,
                background: "linear-gradient(90deg,#C47A2E,#CCAB4A,#7c3aed,#0369a1,#15803d)",
                transformOrigin: "left", borderRadius: 100,
              }}
              animate={{ opacity: [0.3, 0.65, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="htw-line"
            />

            <div style={{ display: "flex", gap: 20 }} className="htw-row">
              {[
                { step: "1", icon: "📋", color: "#C47A2E", time: "~2 min",    title: "Share Event Details",  desc: "Click 'Plan Your Event', fill in event type, date, location, guests and budget." },
                { step: "2", icon: "🔍", color: "#7c3aed", time: "5–10 min",  title: "Explore & Shortlist",  desc: "Browse caterers, decorators, photographers and DJs. Shortlist your favourites." },
                { step: "3", icon: "💬", color: "#0369a1", time: "24–48 hrs", title: "Chat & Get a Price",   desc: "Chat with vendors directly and get a confirmed price before committing." },
                { step: "4", icon: "💰", color: "#b45309", time: "5 min",     title: "Review & Confirm",     desc: "See all vendors and prices in one clear summary — no hidden charges." },
                { step: "5", icon: "🎉", color: "#15803d", time: "Instant",   title: "Pay & Celebrate",      desc: "Pay securely. Vendors confirmed, timings locked — just show up and enjoy." },
              ].map(({ step, icon, color, time, title, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.13 }}
                  whileHover={{ y: -5 }}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", cursor: "default" }}
                >
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: [0, -6, 6, -3, 3, 0] }}
                    transition={{ duration: 0.4 }}
                    style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: `linear-gradient(135deg,${color},${color}aa)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 26, marginBottom: 16, position: "relative", zIndex: 1,
                      boxShadow: `0 6px 18px ${color}30`,
                      border: `3px solid #FFFCF5`,
                    }}
                  >
                    {icon}
                  </motion.div>

                  {/* Step + time on one line */}
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color, marginBottom: 6, opacity: 0.85 }}>
                    Step {step} · {time}
                  </span>

                  {/* Title */}
                  <h3 style={{ fontSize: 14.5, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px", lineHeight: 1.3 }}>{title}</h3>

                  {/* Description — short */}
                  <p style={{ fontSize: 12.5, color: "#9B7450", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Booking modes callout */}
          <div style={{ margin: "40px auto 0", maxWidth: 680, background: "linear-gradient(135deg,rgba(196,122,46,0.07),rgba(204,171,74,0.07))", border: "1.5px solid rgba(196,122,46,0.18)", borderRadius: 16, padding: "20px 28px", display: "flex", gap: 20, alignItems: "flex-start" }} className="htw-callout">
            <div style={{ fontSize: 28, flexShrink: 0 }}>💡</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", margin: "0 0 5px" }}>Not sure how involved you want to be?</p>
              <p style={{ fontSize: 13.5, color: "#7A5535", margin: 0, lineHeight: 1.65 }}>
                Click on <strong style={{ color: "#C47A2E" }}>Plan Your Event</strong>, then choose <strong style={{ color: "#C47A2E" }}>I'll Find My Vendors</strong> to browse and book vendors yourself at your own pace, or <strong style={{ color: "#C47A2E" }}>Tendr Plans It For Me</strong> and our team selects the best vendors for your event, coordinates everything and presents a full plan for your approval.
              </p>
            </div>
          </div>

          {/* Start Planning CTA */}
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 10px 32px rgba(196,122,46,0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/booking")}
              style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 16, fontWeight: 700, padding: "14px 44px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 20px rgba(196,122,46,0.35)", letterSpacing: "0.02em" }}
            >
              Plan Your Event →
            </motion.button>
            <p style={{ fontSize: 13, color: "#9B7450", marginTop: 10 }}>Free to browse · No commitment until you pay</p>
          </div>

        </div>

        <style>{`
          @media (max-width: 860px) {
            .htw-row { flex-wrap: wrap !important; }
            .htw-row > div { flex: 0 0 calc(33% - 12px) !important; min-width: 140px; }
            .htw-line { display: none !important; }
            .htw-callout { flex-direction: column !important; gap: 10px !important; }
          }
          @media (max-width: 540px) {
            .htw-row > div { flex: 0 0 calc(50% - 8px) !important; }
          }
        `}</style>
      </section>

      <JourneyFlow />

      {/* Events Portfolio Gallery */}
      <section style={{ background: "#FFFCF5", padding: "80px 24px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 12 }}>Our Work</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 14px" }}>A Glimpse Into Our Events</h2>
            <p style={{ fontSize: 16, color: "#9B7450", maxWidth: 500, margin: "0 auto" }}>From intimate birthdays to grand weddings — events we have curated across Delhi NCR.</p>
            <div style={{ width: 48, height: 3, background: "linear-gradient(90deg, #C47A2E, #CCAB4A)", borderRadius: 100, margin: "18px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="events-portfolio-grid">
            {[
              { title: "Wedding Ceremony", img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&h=400&q=80" },
              { title: "Sangeet Night", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&h=400&q=80" },
              { title: "Birthday Bash", img: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&h=400&q=80" },
              { title: "Gala Dinner", img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&h=400&q=80" },
              { title: "Ring Ceremony", img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&h=400&q=80" },
              { title: "Family Gathering", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=400&q=80" },
            ].map(({ title, img }) => (
              <div key={title}
                style={{ position: "relative", borderRadius: 16, overflow: "hidden", cursor: "pointer", height: 220 }}
                onMouseEnter={(e) => { e.currentTarget.querySelector("div").style.opacity = "1"; }}
                onMouseLeave={(e) => { e.currentTarget.querySelector("div").style.opacity = "0"; }}
              >
                <img src={img} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,10,0,0.75) 0%, transparent 55%)", opacity: 0, transition: "opacity 0.3s ease", display: "flex", alignItems: "flex-end", padding: "16px 20px" }}>
                  <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{title}</span>
                </div>
                <div style={{ position: "absolute", bottom: 14, left: 16 }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 768px) { .events-portfolio-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 480px) { .events-portfolio-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* Become a Partner Section */}
      <section style={{ background: "#2C1A0E", padding: "96px 24px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="partner-grid">

          {/* Left: text */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CCAB4A", marginBottom: 16 }}>
              For Vendors
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 20px" }}>
              Grow your business<br />
              <span style={{ background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                with Tendr
              </span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, margin: "0 0 32px", maxWidth: 420 }}>
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
              style={{ background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: "pointer", boxShadow: "0 4px 18px rgba(196,122,46,0.45)", transition: "opacity 0.2s" }}
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
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>{step.title}</h4>
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
    </div>
  );
};

export default Home;

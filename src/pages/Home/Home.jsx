// src/pages/Home/Home.jsx
import React, { useEffect, useState } from "react";
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
import CorporateLogin from "../../components/corporateEventPlanning.jsx";
import JourneyFlow from "../../components/JourneyFlow";

// WhatsApp icon
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "../../components/Navbar.jsx";
import SelectedVendorsFloat from "../../components/SelectedVendorsFloat";
import { useSelector } from "react-redux";

const CELEBRATION_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1100&q=85",
    label: "Wedding Decor",
  },
  {
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1100&q=85",
    label: "Wedding Ceremony",
  },
  {
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1100&q=85",
    label: "Golden Celebration",
  },
  {
    url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1100&q=85",
    label: "Festive Moments",
  },
  {
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1100&q=85",
    label: "Celebration Feast",
  },
];

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
    // Gift Hampers disabled
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
        style={{
          height: "100vh",
          paddingTop: 76,
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
              Plan, organize, and bring your entire party to life—
              <span
                style={{
                  background: "linear-gradient(135deg, #C47A2E, #DEB887)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                without the chaos
              </span>
              {" "}of managing everything on your own
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
              From ideas to execution, handle every part of your celebration in one seamless flow with smart tools and trusted services.
            </p>

            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={handlePlanEvent}
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
                Plan Your Event
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

      <style>{`
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

      {/* ── How Tendr Works ── */}
      <section style={{ background: "#FFFCF5", padding: "80px 24px 88px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Your Journey</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 14px" }}>How Tendr Works</h2>
            <p style={{ fontSize: 16, color: "#9B7450", maxWidth: 520, margin: "0 auto" }}>From filling your event details to celebrating your perfect day — here's how the platform guides you through every step.</p>
            <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "18px auto 0" }} />
          </div>

          {/* Steps — 5 steps in a flow */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }} className="htw-flow">
            {[
              {
                step: "1",
                icon: "📋",
                color: "#C47A2E",
                title: "Share Your Event Details",
                desc: "Fill a quick 5-question form — event type, date, location, number of guests and your budget. The whole thing takes under 2 minutes.",
                tag: "Start here",
              },
              {
                step: "2",
                icon: "🔍",
                color: "#7c3aed",
                title: "Explore & Save Vendors",
                desc: "Browse our curated list of DJs, caterers, decorators and photographers in your city. Click 'Quick View' to preview profiles and 'Save Vendor' to shortlist the ones you like.",
                tag: "You Do It mode",
              },
              {
                step: "3",
                icon: "💬",
                color: "#0369a1",
                title: "Chat & Confirm Requirements",
                desc: "Our team approves your chat request and connects you with each vendor. Discuss your exact requirements, share ideas, and get a confirmed price — all within the platform chat.",
                tag: "Both modes",
              },
              {
                step: "4",
                icon: "💰",
                color: "#b45309",
                title: "Review the Full Quote",
                desc: "Once all chats are done and vendors are finalised, open the Review & Pay page. See every vendor's confirmed price in one place, with a clear total. No surprises.",
                tag: "Pricing locked in",
              },
              {
                step: "5",
                icon: "🎉",
                color: "#15803d",
                title: "Pay & Enjoy Your Event",
                desc: "Complete your payment securely. Every vendor is confirmed, timings are set — all you have to do is show up and celebrate.",
                tag: "You're done!",
              },
            ].map(({ step, icon, color, title, desc, tag }, i, arr) => (
              <div key={step} style={{ display: "flex", gap: 0, alignItems: "stretch" }} className="htw-step-row">
                {/* Left: step number + connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 64, flexShrink: 0 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${color},${color}bb)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: `0 4px 14px ${color}40`, zIndex: 1 }}>
                    {icon}
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 32, background: `linear-gradient(to bottom,${color}60,${arr[i+1].color}60)`, margin: "6px 0" }} />
                  )}
                </div>

                {/* Right: content card */}
                <div style={{ flex: 1, background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.1)", boxShadow: "0 3px 14px rgba(139,69,19,0.06)", padding: "22px 26px", marginBottom: i < arr.length - 1 ? 12 : 0, marginLeft: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>Step {step}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 100, background: `${color}14`, color, border: `1px solid ${color}40` }}>{tag}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px", lineHeight: 1.3 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "#7A5535", lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        <style>{`
          @media (max-width: 640px) {
            .htw-flow { gap: 0 !important; }
            .htw-step-row > div:first-child { width: 44px !important; }
            .htw-step-row > div:first-child > div:first-child { width: 40px !important; height: 40px !important; font-size: 18px !important; }
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;

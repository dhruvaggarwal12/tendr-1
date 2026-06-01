// src/pages/Home/Home.jsx
import React, { useEffect, useState, useRef } from "react";
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
import celebrationKit from "../../assets/ui/celebration-kit.jpeg";
import heroCorporate from "../../assets/ui/hero-corporate.png";
import heroHouseParty from "../../assets/ui/hero-house-party.png";
import heroAnniversary from "../../assets/ui/hero-anniversary.png";
import heroBirthday from "../../assets/ui/hero-birthday.png";
import heroFestive from "../../assets/ui/hero-festive.png";
import CorporateLogin from "../../components/corporateEventPlanning.jsx";
import JourneyFlow from "../../components/JourneyFlow";
import { TEMPLATES } from "../stationery/templates";
import { RENDERERS } from "../stationery/TemplateRenderer";

// WhatsApp icon
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "../../components/Navbar.jsx";
import SelectedVendorsFloat from "../../components/SelectedVendorsFloat";
import { useSelector } from "react-redux";

const HERO_FEATURES = [
  {
    tag: "Smart Planning Tools",
    headline: "Checklists & timelines built for your event",
    desc: "Stay on top of every task with personalised checklists and timelines designed around your event date.",
    where: "Planning Tools → Checklist / Timeline",
    href: "/checklist-picker",
    emoji: "✅",
  },
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
    tag: "Invitation Flyers",
    headline: "Share stunning digital invite flyers instantly",
    desc: "Pick a template, personalise the details and send your event invite via WhatsApp or Instagram in seconds.",
    where: "Memories → Invitation Flyers",
    href: "/invitation",
    emoji: "📩",
  },
  {
    tag: "Decor Finder",
    headline: "Discover your perfect decoration theme",
    desc: "Not sure what decor you want? Our quiz matches your personality and budget to the ideal decoration style.",
    where: "Planning Tools → 🎨 Decor Finder",
    href: "/decor-finder",
    emoji: "🎨",
  },
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

const BASE_URL = import.meta.env.VITE_BASE_URL;

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

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPrev, setHeroPrev] = useState(null);
  const [heroFading, setHeroFading] = useState(false);
  const [galleryByCategory, setGalleryByCategory] = useState({});
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [glimpseCounter, setGlimpseCounter] = useState(0);
  const [featureIdx, setFeatureIdx]   = useState(0);
  const [featureVisible, setFeatureVisible] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);

  const FEATURE_SLIDES = [
    { id: "smart-planner",  tag: "Smart Planner",        icon: "✨", iconBg: "linear-gradient(135deg,#C47A2E,#CCAB4A)", headline: "Your complete vendor package, built in seconds",          desc: "Tell us your event once. We match caterers, decorators, photographers and DJs within your budget. You confirm, we coordinate everything.", where: "Booking → Tendr Plans It For Me", href: "/booking",          accent: "#C47A2E" },
    { id: "browse-vendors", tag: "Browse Vendors",        icon: "🔍", iconBg: "linear-gradient(135deg,#7A4A1E,#C47A2E)",  headline: "Find the right vendor. Compare. Chat. Book.",              desc: "Browse top-rated vendors in Delhi NCR. Compare profiles side by side, chat directly, and lock in your price — all in one place.", where: "Vendors → Browse Vendors", href: "/listings",          accent: "#7A4A1E" },
    { id: "checklist",      tag: "Event Checklist",       icon: "✅", iconBg: "linear-gradient(135deg,#9B7450,#C47A2E)",  headline: "Never miss a single detail",                              desc: "A personalised checklist sorted by your event date. Every task timed perfectly so nothing falls through the cracks.", where: "Our Products → Checklist", href: "/checklist-picker", accent: "#9B7450" },
    { id: "timeline",       tag: "Event Timeline",        icon: "⏱️", iconBg: "linear-gradient(135deg,#2C1A0E,#7A4A1E)",  headline: "Every milestone, perfectly timed",                        desc: "Build a day-by-day countdown. Download a timeline slip you can share with every vendor on your list.", where: "Our Products → Timeline", href: "/timeline-picker",  accent: "#2C1A0E" },
    { id: "decor-finder",   tag: "Decor Finder",          icon: "🎨", iconBg: "linear-gradient(135deg,#C47A2E,#E8A84A)",  headline: "Discover your decoration style before you book",          desc: "Take a short quiz → get your perfect theme. Browse real vendor photos by style and go straight from inspiration to booking.", where: "Our Products → Decor Finder", href: "/decor-finder",    accent: "#C47A2E" },
    { id: "budget",         tag: "Budget Allocator",      icon: "💰", iconBg: "linear-gradient(135deg,#7A4A1E,#CCAB4A)",  headline: "Know exactly what you can afford — before you start",     desc: "Set your budget per service. We filter and sort vendors so every option you see is within reach.", where: "Our Products → Budget Allocator", href: "/budget-picker",    accent: "#7A4A1E" },
    { id: "gift-hampers",   tag: "Gift Hampers & Cakes",  icon: "🎁", iconBg: "linear-gradient(135deg,#C47A2E,#CCAB4A)",  headline: "The perfect gift, delivered to the door",                 desc: "Curated hampers and custom cakes for birthdays, anniversaries and corporate celebrations.", where: "Gift & Hampers", href: "/gift-hampers-cakes",  accent: "#C47A2E" },
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

  // Build hero slideshow from gallery photos only — no static fallback
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
    const t = setInterval(() => setGlimpseCounter(c => c + 1), 2500);
    return () => clearInterval(t);
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
          {/* ── Left: fixed hero headline + CTA ── */}
          <div style={{ flex: "0 0 48%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px 0 64px" }}>

            {/* Fixed headline block */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.25)", borderRadius: 100, padding: "5px 14px", marginBottom: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C47A2E", display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: "#C47A2E" }}>Delhi NCR's Celebration Platform</span>
              </div>

              <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", fontWeight: 900, lineHeight: 1.12, color: "#2C1A0E", marginBottom: 18, letterSpacing: "-0.02em", fontFamily: "'Outfit', sans-serif" }}>
                Everything your event needs.<br />
                <span style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  One place.
                </span>
              </h1>

              <p style={{ fontSize: 16, fontWeight: 400, color: "#6B4226", lineHeight: 1.7, maxWidth: 440, margin: 0 }}>
                From birthday parties and home celebrations to corporate events and house parties — book vendors, plan your budget, send invitations, manage guests, track payments and send curated gift hampers. All of it, right here.
              </p>
            </div>

            {/* CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => navigate("/booking")}
                style={{ background: "linear-gradient(135deg, #E8820C 0%, #CCAB4A 100%)", color: "#fff", fontSize: 17, fontWeight: 800, letterSpacing: "0.02em", padding: "15px 40px", borderRadius: 14, border: "none", cursor: "pointer", boxShadow: "0 6px 28px rgba(232,130,12,0.55)", transition: "transform 0.2s, box-shadow 0.2s", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap", alignSelf: "flex-start" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(232,130,12,0.65)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(232,130,12,0.55)"; }}
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
                {galleryLoaded && heroPhotos.map((_, i) => (
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

      {/* How Tendr Works */}
      <section style={{ background: "#F8F4EF", padding: "88px 24px 96px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 12 }}>Your Journey</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 12px", letterSpacing: "0.02em" }}>
              How Tendr Works
            </h2>
            <p style={{ fontSize: 15, color: "#9B7450", maxWidth: 400, margin: "0 auto" }}>
              From idea to celebration in five steps.
            </p>
          </motion.div>

          {/* Steps */}
          <div style={{ display: "flex", gap: 16, alignItems: "stretch" }} className="htw-row">
            {[
              { n: "01", icon: "📋", title: "Tell Us About Your Event",  desc: "Event type, date, budget, guests — 2 minutes.",          time: "2 min"    },
              { n: "02", icon: "🔍", title: "Browse & Shortlist",        desc: "Find verified caterers, decorators, photographers, DJs.", time: "5–10 min" },
              { n: "03", icon: "💬", title: "Chat & Get a Price",        desc: "Direct chat. Real quote. No surprises.",                 time: "24–48 hrs" },
              { n: "04", icon: "✅", title: "Review & Confirm",          desc: "One summary page. All vendors. All prices.",              time: "5 min"    },
              { n: "05", icon: "🎉", title: "Pay & Celebrate",           desc: "Pay securely. Show up and enjoy.",                       time: "Instant"  },
            ].map(({ n, icon, title, desc, time }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 50, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 120, damping: 14 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                style={{
                  flex: 1,
                  background: "#2C1A0E",
                  border: "1px solid rgba(196,122,46,0.2)",
                  borderRadius: 20, padding: "28px 22px 26px",
                  display: "flex", flexDirection: "column", gap: 14,
                  cursor: "default",
                  position: "relative", overflow: "hidden",
                  boxShadow: "0 6px 24px rgba(44,26,14,0.14)",
                }}
              >
                {/* Step number watermark */}
                <span style={{
                  position: "absolute", top: -8, right: 14,
                  fontSize: 72, fontWeight: 900, color: "rgba(204,171,74,0.08)",
                  lineHeight: 1, fontFamily: "'Outfit',sans-serif", pointerEvents: "none", userSelect: "none",
                }}>
                  {n}
                </span>

                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CCAB4A" }}>
                  Step {n} · {time}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.35 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", margin: 0, lineHeight: 1.6 }}>{desc}</p>

                {/* Connector arrow */}
                {i < 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.4, duration: 0.3 }}
                    style={{ position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)", zIndex: 10, fontSize: 18, color: "rgba(196,122,46,0.4)" }}
                  >
                    ›
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Callout + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{ textAlign: "center", marginTop: 52 }}
          >
            <p style={{ fontSize: 13.5, color: "#9B7450", marginBottom: 24, maxWidth: 520, margin: "0 auto 28px" }}>
              Choose <strong style={{ color: "#C47A2E" }}>I'll Find My Vendors</strong> to explore yourself, or{" "}
              <strong style={{ color: "#C47A2E" }}>Tendr Plans It For Me</strong> and we handle everything.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 12px 36px rgba(196,122,46,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/booking")}
              style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 16, fontWeight: 700, padding: "15px 48px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 20px rgba(196,122,46,0.3)", letterSpacing: "0.02em" }}
            >
              Plan Your Event →
            </motion.button>
            <p style={{ fontSize: 12, color: "#C0A070", marginTop: 12 }}>Free to browse · No commitment until you pay</p>
          </motion.div>

        </div>

        <style>{`
          @media (max-width: 860px) {
            .htw-row { flex-wrap: wrap !important; }
            .htw-row > div { flex: 0 0 calc(33% - 10px) !important; }
          }
          @media (max-width: 540px) {
            .htw-row > div { flex: 0 0 calc(50% - 8px) !important; }
          }
          @media (max-width: 360px) {
            .htw-row > div { flex: 0 0 100% !important; }
          }
        `}</style>
      </section>

      {/* ── 5s Rotating Feature Carousel ── */}
      <section style={{ background: "#FFFCF5", padding: "60px 24px 56px", fontFamily: "'Outfit', sans-serif", overflow: "hidden", position: "relative" }}>
        {/* Decorative background blobs — no photos, warm light tones */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,122,46,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(204,171,74,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 920, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Section heading */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "0.01em" }}>What We Offer</h2>
            <p style={{ fontSize: 15, color: "#9B7450", margin: 0 }}>Everything you need for a perfect event — in one place</p>
          </div>

          {(() => {
            const slide = FEATURE_SLIDES[slideIdx];
            const goSlide = (dir) => {
              setSlideVisible(false);
              setTimeout(() => { setSlideIdx(i => (i + dir + FEATURE_SLIDES.length) % FEATURE_SLIDES.length); setSlideVisible(true); }, 400);
            };

            return (
              <div>
                {/* Main slide card */}
                <div className="offer-slide-card" style={{
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                  opacity: slideVisible ? 1 : 0,
                  transform: slideVisible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)",
                  background: "#fff",
                  borderRadius: 24,
                  border: `1.5px solid ${slide.accent}22`,
                  boxShadow: `0 8px 40px ${slide.accent}14, 0 2px 12px rgba(0,0,0,0.04)`,
                  overflow: "hidden",
                  display: "flex",
                  minHeight: 220,
                }}>
                  {/* Left accent strip */}
                  <div style={{ width: 5, background: `linear-gradient(180deg,${slide.accent},${slide.accent}44)`, flexShrink: 0 }} />

                  {/* Icon column */}
                  <div className="offer-slide-icon-col" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 28px", background: `${slide.accent}08`, flexShrink: 0, minWidth: 130 }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: 22,
                      background: slide.iconBg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 38,
                      boxShadow: `0 8px 24px ${slide.accent}30`,
                      flexShrink: 0,
                    }}>
                      {slide.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: "28px 28px 28px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: slide.accent, marginBottom: 8, display: "block" }}>{slide.tag}</span>
                    <h3 style={{ fontSize: "clamp(1.2rem,2.5vw,1.7rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 10px", letterSpacing: "-0.01em", lineHeight: 1.25 }}>{slide.headline}</h3>
                    <p style={{ fontSize: 14.5, color: "#7A5535", lineHeight: 1.65, margin: "0 0 18px", maxWidth: 520 }}>{slide.desc}</p>
                    {slide.isKit ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {["Balloons", "Fairy Lights", "Games", "Confetti"].map(t => (
                          <span key={t} style={{ fontSize: 11, color: slide.accent, background: `${slide.accent}0f`, border: `1px solid ${slide.accent}30`, borderRadius: 100, padding: "3px 10px", fontWeight: 600 }}>{t}</span>
                        ))}
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", background: slide.iconBg, borderRadius: 100, padding: "4px 14px", boxShadow: `0 3px 10px ${slide.accent}30` }}>Under ₹1,499</span>
                      </div>
                    ) : slide.href ? (
                      <a href={slide.href}
                        style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", background: slide.iconBg, padding: "9px 18px", borderRadius: 10, boxShadow: `0 4px 14px ${slide.accent}30`, alignSelf: "flex-start", transition: "opacity 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                        Explore {slide.tag} →
                      </a>
                    ) : null}
                  </div>
                </div>

                {/* Controls row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 24 }}>
                  <button onClick={() => goSlide(-1)}
                    style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(196,122,46,0.1)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#C47A2E"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#C47A2E"; }}>‹</button>

                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {FEATURE_SLIDES.map((fs, i) => (
                      <button key={i} onClick={() => { setSlideVisible(false); setTimeout(() => { setSlideIdx(i); setSlideVisible(true); }, 400); }}
                        style={{ width: i === slideIdx ? 24 : 8, height: 8, borderRadius: 100, border: "none", background: i === slideIdx ? (FEATURE_SLIDES[i].accent || "#C47A2E") : "rgba(139,69,19,0.15)", cursor: "pointer", padding: 0, transition: "all 0.3s ease" }} />
                    ))}
                  </div>

                  <button onClick={() => goSlide(1)}
                    style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(196,122,46,0.1)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#C47A2E"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#C47A2E"; }}>›</button>
                </div>

                {/* Feature chips — quick pick all slides */}
                <div style={{ display: "flex", gap: 8, flexWrap: "nowrap", justifyContent: "center", marginTop: 20, overflowX: "auto", paddingBottom: 4 }}>
                  {FEATURE_SLIDES.map((fs, i) => (
                    <button key={i} onClick={() => { setSlideVisible(false); setTimeout(() => { setSlideIdx(i); setSlideVisible(true); }, 400); }}
                      style={{ padding: "5px 14px", borderRadius: 100, border: `1.5px solid ${i === slideIdx ? "#C47A2E" : "rgba(139,69,19,0.12)"}`, background: i === slideIdx ? "rgba(196,122,46,0.1)" : "#fff", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: i === slideIdx ? 700 : 500, color: i === slideIdx ? "#C47A2E" : "#9B7450", transition: "all 0.18s" }}>
                      {fs.tag}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
        <style>{`@keyframes kit-pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
      </section>

      {/* ── Trust bar ── */}
      <section style={{ background: "#fff", borderTop: "1px solid rgba(196,122,46,0.1)", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "28px 24px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
          {[
            { icon: "🛡️", stat: "Manually Verified",        sub: "Every vendor is personally reviewed before listing" },
            { icon: "🎉", stat: "5,000+ Events Completed",  sub: "Collectively delivered by our vendor network" },
            { icon: "⚡", stat: "Response in 24 hrs",       sub: "A real person responds to every booking request" },
          ].map(({ icon, stat, sub }, i, arr) => (
            <div key={stat} style={{ display: "flex", alignItems: "center", gap: 0, flex: "1 1 220px", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 28px", flex: 1 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", lineHeight: 1.3 }}>{stat}</div>
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

      <JourneyFlow />

      {/* ── Book a Party Place — admin preview only ── */}
      {user?.isAdmin && (
        <section style={{ background: "#fff", padding: "72px 24px 80px", fontFamily: "'Outfit', sans-serif", borderTop: "1px solid rgba(196,122,46,0.08)" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 10px" }}>
                🏡 Admin Preview
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 10px", letterSpacing: "0.02em" }}>
                Book a Party Place Through Us
              </h2>
              <p style={{ fontSize: 15, color: "#9B7450", margin: "0 auto", maxWidth: 480 }}>
                Villas, farmhouses, penthouses and banquet halls — with decoration, catering and entertainment included.
              </p>
            </div>

            {/* Place type cards */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
              {[
                { icon: "🏡", label: "Villa",       type: "villa" },
                { icon: "🌾", label: "Farm House",  type: "farmhouse" },
                { icon: "🏢", label: "Flat",        type: "flat" },
                { icon: "🏛", label: "Venue Hall",  type: "venue" },
                { icon: "🌆", label: "Terrace",     type: "terrace" },
                { icon: "🔍", label: "All Places",  type: "all" },
              ].map(({ icon, label, type }) => (
                <button
                  key={type}
                  onClick={() => window.open(`/party-places?type=${type}`, "_blank")}
                  style={{
                    width: 110, height: 110,
                    borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.18)",
                    background: "#FFFCF5", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 2px 12px rgba(196,122,46,0.08)", transition: "all 0.18s",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.06)"; e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#FFFCF5"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.18)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ fontSize: 30 }}>{icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{label}</span>
                </button>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => window.open("/party-places", "_blank")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
                Browse All Party Places ↗
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Plan by Occasion — admin preview only ── */}
      {user?.isAdmin && (
        <section style={{ background: "#F8F4EF", padding: "80px 24px 88px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 10px" }}>
                🎉 Admin Preview
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 10px", letterSpacing: "0.02em" }}>
                Plan by Occasion
              </h2>
              <p style={{ fontSize: 15, color: "#9B7450", margin: "0 auto", maxWidth: 480 }}>
                Curated guides for every celebration — decor, gifts, activities and checklists.
              </p>
            </div>

            {/* Occasion card strip */}
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
              {[
                { id: "baby-shower",    icon: "🍼", name: "Baby Shower",    color: "#FFB6C1", img: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=400&q=70" },
                { id: "newborn-welcome",icon: "👶", name: "Newborn Welcome", color: "#B5EAD7", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=70" },
                { id: "first-birthday", icon: "🎂", name: "First Birthday",  color: "#FFDAC1", img: "https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=400&q=70" },
                { id: "anniversary",    icon: "💍", name: "Anniversary",     color: "#FF6B9D", img: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=70" },
                { id: "housewarming",   icon: "🏠", name: "Housewarming",    color: "#FFEAA7", img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=70" },
                { id: "graduation",     icon: "🎓", name: "Graduation",      color: "#89CFF0", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=70" },
              ].map(({ id, icon, name, color, img }) => (
                <button
                  key={id}
                  onClick={() => window.open(`/occasions/${id}`, "_blank")}
                  style={{
                    flex: "0 0 200px", borderRadius: 18, overflow: "hidden",
                    border: "1.5px solid rgba(196,122,46,0.12)", cursor: "pointer",
                    background: "#fff", textAlign: "left",
                    boxShadow: "0 4px 20px rgba(139,69,19,0.08)", transition: "transform 0.2s",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ height: 130, position: "relative", overflow: "hidden" }}>
                    <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)" }} />
                    <span style={{ position: "absolute", top: 10, left: 12, fontSize: 22 }}>{icon}</span>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E" }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#C47A2E", marginTop: 3, fontWeight: 600 }}>Themes · Gifts · Checklist ↗</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 28 }}>
              <button
                onClick={() => window.open("/occasions", "_blank")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
                View All Occasions →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Memories Section — admin preview only ── */}
      {user?.isAdmin && (() => {
        const BLANK_D = { coupleName: "Rahul & Priya", date: "15th Dec 2025", day: "Saturday", time: "7 PM", venue: "The Grand Palace", rsvp: "+91 9XXXXXXXXX" };
        const PREVIEW_TEMPLATES = [TEMPLATES[0], TEMPLATES[1], TEMPLATES[2]]; // Botanical, Royal Noir, Blush
        return (
          <section style={{ background: "#FFFCF7", padding: "88px 24px 96px", fontFamily: "'Outfit', sans-serif", overflow: "hidden", position: "relative" }}>

            <div style={{ maxWidth: 1160, margin: "0 auto" }}>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}
              >
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C47A2E", margin: "0 0 10px" }}>Create &amp; Share</p>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.2rem,4.5vw,3.4rem)", fontWeight: 300, color: "#2C1A0E", margin: "0 0 10px", letterSpacing: "0.02em", fontStyle: "italic" }}>
                    Beautiful Memories
                  </h2>
                  <p style={{ fontSize: 14, color: "#9B7450", margin: 0, maxWidth: 340 }}>
                    Design your invites &amp; stationery — customise and share in minutes.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => navigate("/stationery")}
                    style={{ padding: "11px 24px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 16px rgba(196,122,46,0.28)", letterSpacing: "0.02em" }}
                  >
                    Wedding Stationery
                  </button>
                  <button
                    onClick={() => navigate("/invitation")}
                    style={{ padding: "11px 24px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.35)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    Invitation Flyers
                  </button>
                </div>
              </motion.div>

              {/* Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="memories-grid">

                {PREVIEW_TEMPLATES.map((tpl, i) => {
                  const Renderer = RENDERERS[tpl.id];
                  return (
                    <motion.div
                      key={tpl.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      onClick={() => navigate(`/stationery/${tpl.id}`)}
                      style={{ borderRadius: 18, overflow: "hidden", cursor: "pointer", position: "relative", border: "1.5px solid rgba(196,122,46,0.14)", boxShadow: "0 6px 24px rgba(139,69,19,0.1)", transition: "transform 0.25s, box-shadow 0.25s", background: tpl.palette?.bg || "#F8F4EF" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(139,69,19,0.18)"; e.currentTarget.querySelector(".mem-overlay").style.opacity = "1"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(139,69,19,0.1)"; e.currentTarget.querySelector(".mem-overlay").style.opacity = "0"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "center", padding: "16px 12px 0", overflow: "hidden", background: tpl.palette?.bg || "#F8F4EF" }}>
                        <div style={{ pointerEvents: "none", flexShrink: 0 }}>
                          {Renderer && <Renderer d={BLANK_D} onChange={() => {}} mini={true} />}
                        </div>
                      </div>

                      {/* Dark label bar — stays dark even on light background */}
                      <div style={{ padding: "12px 16px 14px", background: "#2C1A0E" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{tpl.name}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.08em" }}>{tpl.category}</div>
                      </div>

                      <div className="mem-overlay" style={{ position: "absolute", inset: 0, background: "rgba(28,10,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.22s", borderRadius: 18 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Customise This Design</div>
                          <div style={{ display: "inline-block", padding: "9px 22px", borderRadius: 100, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700 }}>Open Editor →</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* See All card — dark card on light background */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  onClick={() => navigate("/stationery")}
                  style={{ borderRadius: 18, cursor: "pointer", border: "1.5px solid rgba(196,122,46,0.2)", boxShadow: "0 6px 24px rgba(139,69,19,0.1)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, background: "#2C1A0E", transition: "all 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.background = "#3D2410"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(139,69,19,0.22)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = "#2C1A0E"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(139,69,19,0.1)"; }}
                >
                  {(() => {
                    const R4 = RENDERERS[TEMPLATES[3].id];
                    return R4 ? (
                      <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", paddingTop: 16, filter: "blur(5px)", opacity: 0.12, overflow: "hidden" }}>
                        <div style={{ pointerEvents: "none" }}><R4 d={BLANK_D} onChange={() => {}} mini={true} /></div>
                      </div>
                    ) : null;
                  })()}
                  <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "24px 20px" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(204,171,74,0.15)", border: "1.5px solid rgba(204,171,74,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 16px", color: "#CCAB4A" }}>→</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>See All Designs</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>10 templates to choose from</div>
                    <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: 100, border: "1.5px solid rgba(204,171,74,0.5)", color: "#CCAB4A", fontSize: 12, fontWeight: 700 }}>Browse All →</div>
                  </div>
                </motion.div>

              </div>
            </div>
            <style>{`
              @media(max-width:900px){.memories-grid{grid-template-columns:repeat(2,1fr)!important;gap:16px!important;}}
              @media(max-width:480px){.memories-grid{grid-template-columns:1fr!important;}}
            `}</style>
          </section>
        );
      })()}

      {/* Events Portfolio Gallery */}
      <section style={{ background: "#F0EBE3", padding: "88px 24px 96px", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 12 }}>Vendor Portfolio</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 14px" }}>What Our Vendors Can Do</h2>
            <p style={{ fontSize: 16, color: "#9B7450", maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>We're just getting started — but the vendors on Tendr aren't. These are real photos from their portfolios, showing exactly what they're capable of delivering for your event.</p>
            <div style={{ width: 48, height: 3, background: "linear-gradient(90deg, #C47A2E, #CCAB4A)", borderRadius: 100, margin: "18px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="events-portfolio-grid">
            {[
              { title: "Decoration",       slug: "decoration" },
              { title: "Entertainment",    slug: "entertainment" },
              { title: "Catering",         slug: "catering" },
              { title: "Photography",      slug: "photography" },
              { title: "Full Event Setup", slug: "full-event-setup" },
              { title: "Corporate Events", slug: "corporate-events" },
            ].map(({ title, slug }, catIdx) => {
              const catPhotos = galleryByCategory[title] || [];
              // Each tile cycles at a different offset so they don't all flip at the same time
              const imgIdx = catPhotos.length > 0
                ? Math.floor((glimpseCounter + catIdx * 2) / 1) % catPhotos.length
                : 0;
              const img = catPhotos[imgIdx]?.imageUrl || GALLERY_FALLBACKS[title];
              return (
              <div key={title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 220, background: "#2C1A0E" }}>
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
          @media (max-width: 768px) { .events-portfolio-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 480px) { .events-portfolio-grid { grid-template-columns: 1fr !important; } }
          @keyframes glimpseFade { from { opacity: 0.4; } to { opacity: 1; } }
        `}</style>
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

import { useCallback } from "react";
import { Joyride, STATUS } from "react-joyride";
import { useTour } from "../context/TourContext";

const GOLD = "#C47A2E";
const CREAM = "#FFFCF7";
const DARK = "#2C1A0E";
const MUTED = "#9B7450";
const font = "'Outfit', sans-serif";

const STEPS = [
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Welcome to Tendr! 🎉",
    content:
      "India's smartest event platform — find vendors, plan your event, shop for gifts and stationery, explore venues, and more. Let's take a quick tour of everything.",
  },
  {
    target: '[data-tour="search-bar"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Smart Search",
    content:
      'Type naturally — "photographer under ₹20K in Noida", "decorator for 150 guests in Delhi". It understands vendor types, budgets, locations, and even navigates straight to tools like Budget Allocator or Gift Hampers.',
  },
  {
    target: '[data-tour="nav-browse"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Browse & Top Rated",
    content:
      "Browse Decorators, Caterers, Photographers, and DJs. Filter by location, budget, guest count, ratings, and availability. Top Rated shows only our highest-reviewed vendors across every category.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Quick View & Compare",
    content:
      "Click any vendor card to open Quick View — photos, packages, pricing, and reviews without leaving the page. Add up to 3 vendors to Compare and see them side-by-side across every attribute.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Chat & Availability Check",
    content:
      "Hit Chat on any vendor card and fill in your event details. Tendr automatically checks if the vendor is free on your date — if they're booked, we instantly surface alternatives so you're never stuck.",
  },
  {
    target: '[data-tour="nav-booking"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Plan Your Event",
    content:
      "Two planning modes: You Do It — you pick each vendor one by one. Smart Plan — our AI selects the best combination of Decorator, Caterer, Photographer, and DJ within your total budget automatically.",
  },
  {
    target: '[data-tour="nav-tools"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Event Tools",
    content:
      "Budget Allocator splits your total budget across vendor categories. Decor Finder lets you explore decoration themes and styles. Timeline Builder creates a minute-by-minute day-of schedule. Guest List and Payment Tracker keep everything organised in one place.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Gift Hampers & Cakes 🎁",
    content:
      "Order personalised wedding gift hampers and custom celebration cakes directly through Tendr — perfect for guest favours, welcome kits, and corporate gifting.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Wedding Stationeries 💌",
    content:
      "Design custom invitation cards, event flyers, and after-movie graphics. Pick a template, personalise with your event details, and download or share instantly.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Fun Activities 🎊",
    content:
      "Add entertainment to your event — photo booths, live caricature artists, magicians, dance floors, and more. Browse by activity type and book directly.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Party Places 🏛️",
    content:
      "Discover venues — banquet halls, rooftop spaces, farmhouses, and more. View photos, capacity, and amenities, and reach out directly from the listing.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Occasions & Ideas ✨",
    content:
      "Explore occasion-specific guides for birthdays, corporate events, weddings, anniversaries, and more. Each page has curated vendor suggestions, decor ideas, and typical budget ranges.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Community Wall 📸",
    content:
      "See real events hosted through Tendr — customers share photos and setups. Get inspired, gauge the quality of vendor work, and see what's trending in your city.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Memories 🎞️",
    content:
      "After your event, your photos and highlights are preserved in your Memories gallery on Tendr — a permanent keepsake of every event you've hosted.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "4 Documents After Booking 📄",
    content:
      "Once payment is confirmed, instantly download four personalised documents: Invoice, Event Details PDF, Day-of Timeline slip, and a custom Invitation Flyer — all branded with your event details.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Reviews & Future Events ⭐",
    content:
      "After your event, leave a vendor review in seconds. We also ask about upcoming events — so your next booking starts with vendors who already know your preferences.",
  },
  {
    target: '[data-tour="profile-btn"]',
    placement: "bottom-end",
    disableBeacon: true,
    title: "Your Dashboard 🏠",
    content:
      "All your vendor conversations, booking statuses, event documents, and payment history live here. The badge shows any pending actions. That's the full Tendr experience — enjoy your event! 🎊",
  },
];

function TourTooltip({ continuous, index, step, backProps, closeProps, primaryProps, tooltipProps, size }) {
  return (
    <div
      {...tooltipProps}
      style={{
        background: CREAM,
        borderRadius: 18,
        padding: "26px 28px 22px",
        maxWidth: 400,
        boxShadow: "0 20px 60px rgba(44,26,14,0.2), 0 0 0 2px rgba(196,122,46,0.18)",
        fontFamily: font,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gold top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${GOLD}, #CCAB4A, ${GOLD})` }} />

      <div style={{ fontSize: 10.5, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>
        Step {index + 1} of {size}
      </div>

      {step.title && (
        <div style={{ fontSize: 17, fontWeight: 800, color: DARK, marginBottom: 10, lineHeight: 1.3 }}>
          {step.title}
        </div>
      )}

      <div style={{ fontSize: 14, lineHeight: 1.7, color: "#5C3D1E" }}>
        {step.content}
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 4, marginTop: 18, marginBottom: 14, flexWrap: "wrap" }}>
        {Array.from({ length: size }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 18 : 5,
              height: 5,
              borderRadius: 100,
              background: i === index ? GOLD : "rgba(196,122,46,0.25)",
              transition: "all 0.25s",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <button
          {...closeProps}
          style={{ background: "none", border: "none", fontSize: 12.5, color: MUTED, cursor: "pointer", padding: "4px 0", fontFamily: font, fontWeight: 600 }}
        >
          Skip tour
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{ padding: "7px 16px", borderRadius: 9, border: `1.5px solid rgba(196,122,46,0.35)`, background: "transparent", fontSize: 13, fontWeight: 700, color: GOLD, cursor: "pointer", fontFamily: font }}
            >
              ← Back
            </button>
          )}
          <button
            {...primaryProps}
            style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: `linear-gradient(135deg, ${GOLD}, #CCAB4A)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}
          >
            {index === size - 1 ? "Done! 🎊" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SiteTour() {
  const { tourActive, endTour } = useTour();

  const handleCallback = useCallback(
    (data) => {
      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
        endTour();
      }
    },
    [endTour]
  );

  if (!tourActive) return null;

  return (
    <Joyride
      steps={STEPS}
      run={tourActive}
      callback={handleCallback}
      tooltipComponent={TourTooltip}
      continuous
      scrollToFirstStep
      showSkipButton
      disableOverlayClose
      floaterProps={{ disableAnimation: false }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: GOLD,
          arrowColor: CREAM,
        },
        overlay: { backgroundColor: "rgba(28, 10, 0, 0.52)" },
        spotlight: { borderRadius: 14 },
      }}
    />
  );
}

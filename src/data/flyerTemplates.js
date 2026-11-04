import BotanicalTemplate from "../components/invitation/templates/BotanicalTemplate";
import ModernMinimalTemplate from "../components/invitation/templates/ModernMinimalTemplate";
import RoyalGoldTemplate from "../components/invitation/templates/RoyalGoldTemplate";
import FestiveConfettiTemplate from "../components/invitation/templates/FestiveConfettiTemplate";
import MidnightTemplate from "../components/invitation/templates/MidnightTemplate";

// 5 built-in, Tendr-branded invitation flyer designs — used by the
// self-service Invitation Customizer, the guest-facing RSVP page, and the
// auto-created flyer on "Mark Payment Done". Distinct from the separate
// 63-item external stock-photo gallery in invitationTemplates.js.
export const FLYER_TEMPLATES = [
  { id: "botanical", name: "Botanical Elegance", tagline: "Soft watercolour, gold accents", accent: "#B8922A", Component: BotanicalTemplate },
  { id: "modern-minimal", name: "Modern Minimal", tagline: "Bold, editorial, high-contrast", accent: "#2563EB", Component: ModernMinimalTemplate },
  { id: "royal-gold", name: "Royal Gold", tagline: "Jewel tones, ornate gold frame", accent: "#D4AF5E", Component: RoyalGoldTemplate },
  { id: "festive-confetti", name: "Festive Confetti", tagline: "Bright, playful, balloons & confetti", accent: "#FF6F91", Component: FestiveConfettiTemplate },
  { id: "midnight", name: "Midnight", tagline: "Moody dark gradient, starlit", accent: "#7C3AED", Component: MidnightTemplate },
];

export function getFlyerTemplate(id) {
  return FLYER_TEMPLATES.find(t => t.id === id) || null;
}

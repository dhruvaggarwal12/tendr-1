// Tendr Smart Suggestions — Phase 1 recommendation engine
// Pure function: swap this logic for ML/analytics later without touching the UI

const GUEST_TIER = (n) => {
  if (n < 20)  return "intimate";
  if (n < 50)  return "small";
  if (n < 150) return "medium";
  return "large";
};

// Templates keyed by event type, then by guest tier
const TEMPLATES = {
  "Birthday": {
    services: {
      intimate: ["Decorator", "Photographer"],
      small:    ["Decorator", "Photographer", "Caterer"],
      medium:   ["Decorator", "Photographer", "Caterer", "DJ"],
      large:    ["Decorator", "Caterer", "DJ", "Photographer"],
    },
    themes: {
      intimate: ["🎈 Pastel Birthday", "🌸 Floral Brunch", "🕯️ Candlelit Dinner"],
      small:    ["🎈 Pastel Birthday", "🌿 Tropical Party", "🎭 Bollywood Night"],
      medium:   ["🌈 Retro Neon Party", "🎭 Bollywood Night", "🎪 Carnival Theme"],
      large:    ["🎪 Carnival Theme", "🎭 Masquerade Ball", "🌈 Retro Neon"],
    },
    tips: {
      intimate: "Intimate birthdays work best with a themed setup and a photographer to capture the moments.",
      small:    "Most birthday parties with 20–50 guests book Decoration + Photography together.",
      medium:   "With 50+ guests, adding a DJ significantly lifts the energy.",
      large:    "Large birthday parties in NCR usually book all 4 services — confirm at least 3 weeks ahead.",
    },
  },

  "1st Birthday": {
    services: {
      intimate: ["Decorator", "Photographer"],
      small:    ["Decorator", "Photographer"],
      medium:   ["Decorator", "Photographer", "Caterer"],
      large:    ["Decorator", "Photographer", "Caterer"],
    },
    themes: {
      intimate: ["🦁 Jungle Safari", "⭐ Twinkle Twinkle", "🌊 Underwater World"],
      small:    ["🦁 Jungle Safari", "📖 Storybook Theme", "🌸 Floral Garden"],
      medium:   ["🦁 Jungle Safari", "🦄 Unicorn Magic", "🚀 Space Adventure"],
      large:    ["🎪 Grand Carnival", "🦁 Jungle Safari", "🌈 Rainbow Party"],
    },
    tips: {
      intimate: "1st birthdays have more family than friends — a cozy setup with a great photographer is the priority.",
      small:    "Book a smash cake backdrop. It creates the most memorable photo of the event.",
      medium:   "1st birthday parties often run longer — make sure catering covers multiple meal rounds.",
      large:    "Large 1st birthday celebrations benefit from a dedicated coordinator. Chat with the Tendr team.",
    },
  },

  "Baby Shower": {
    services: {
      intimate: ["Decorator", "Photographer"],
      small:    ["Decorator", "Photographer"],
      medium:   ["Decorator", "Photographer", "Caterer"],
      large:    ["Decorator", "Photographer", "Caterer"],
    },
    themes: {
      intimate: ["🌸 Pastel Garden", "🌙 Stars & Moon", "🍃 Neutral Boho"],
      small:    ["🌸 Pastel Garden", "💫 Baby in Bloom", "🌈 Rainbow Welcome"],
      medium:   ["🌸 Pastel Garden", "👑 Royal Baby", "🌻 Sunflower Fields"],
      large:    ["🌸 Grand Floral", "💎 Luxury Pastel", "🌟 Golden Baby"],
    },
    tips: {
      intimate: "Baby showers work best with 15–30 guests in an intimate, decorated setting.",
      small:    "Focus your budget on decoration — it creates the backdrop for all the keepsake photos.",
      medium:   "Include a high-tea or brunch setup with catering for a premium feel.",
      large:    "Large baby showers need seating and catering carefully planned in advance.",
    },
  },

  "Newborn Welcome": {
    services: {
      intimate: ["Decorator", "Photographer"],
      small:    ["Decorator", "Photographer", "Caterer"],
      medium:   ["Decorator", "Photographer", "Caterer"],
      large:    ["Decorator", "Photographer", "Caterer"],
    },
    themes: {
      intimate: ["🌸 Soft Pastels", "⭐ Stork & Stars", "🌿 Nature Welcome"],
      small:    ["💛 Golden Welcome", "🌸 Baby Bloom", "🌙 Moon & Stars"],
      medium:   ["👑 Royal Welcome", "🌸 Grand Garden", "💎 Elegant Pastels"],
      large:    ["✨ Grand Welcome", "👑 Royal Arrival", "💎 Luxury Pastels"],
    },
    tips: {
      intimate: "Newborn welcomes are best kept to 15–25 guests — intimate and warm.",
      small:    "Decoration and photography together make the strongest memory combination.",
      medium:   "A high-tea catering setup alongside decoration gives this a premium feel.",
      large:    "Large newborn welcomes need full catering and decoration coordination.",
    },
  },

  "Anniversary": {
    services: {
      intimate: ["Decorator", "Photographer"],
      small:    ["Decorator", "Photographer"],
      medium:   ["Decorator", "Photographer", "Caterer"],
      large:    ["Decorator", "Caterer", "Photographer", "DJ"],
    },
    themes: {
      intimate: ["🕯️ Romantic Candlelight", "🌹 Rose Garden", "✨ Fairy Lights"],
      small:    ["🕯️ Romantic Candlelight", "💛 Gold & White", "🌹 Floral Romance"],
      medium:   ["💫 Starlit Evening", "💛 Gold & White Elegance", "🌹 Garden Romance"],
      large:    ["✨ Grand Celebration", "💎 Black & Gold Gala", "🌸 Garden Party"],
    },
    tips: {
      intimate: "A surprise candlelight setup with a photographer captures anniversary memories perfectly.",
      small:    "Anniversary setups with 20–50 guests work best with a themed backdrop and dinner.",
      medium:   "Most anniversary celebrations in NCR combine decoration, catering and photography.",
      large:    "For 100+ guests, add a DJ to keep the energy going through the evening.",
    },
  },

  "Get-together": {
    services: {
      intimate: ["Caterer"],
      small:    ["Caterer", "Decorator"],
      medium:   ["Caterer", "DJ", "Decorator"],
      large:    ["Caterer", "DJ", "Decorator", "Photographer"],
    },
    themes: {
      intimate: ["🍔 Barbecue & Bonfire", "🌿 Garden Brunch", "☕ Cozy Gathering"],
      small:    ["🎉 House Party Vibes", "🌴 Tropical Party", "🎵 Retro Night"],
      medium:   ["🌈 Retro Neon Night", "🎭 Bollywood Party", "🍕 Fiesta"],
      large:    ["🎪 Festival Vibes", "🌈 Colour Party", "🎭 Theme Night"],
    },
    tips: {
      intimate: "Good food is the priority for intimate get-togethers — invest in quality catering.",
      small:    "Get-togethers with 20–50 guests benefit from light decoration to set the mood.",
      medium:   "Adding a DJ for 50+ guests dramatically improves the party atmosphere.",
      large:    "Large get-togethers need proper catering planning — budget a 20% food buffer.",
    },
  },

  "Office Party": {
    services: {
      intimate: ["Caterer"],
      small:    ["Caterer", "Decorator"],
      medium:   ["Caterer", "Decorator", "Photographer"],
      large:    ["Caterer", "Decorator", "Photographer", "DJ"],
    },
    themes: {
      intimate: ["🏢 Corporate Brunch", "🎯 Team Lunch"],
      small:    ["🏆 Award Night", "🎊 Office Celebration", "🌟 Year-End Party"],
      medium:   ["⚡ Neon Office Party", "🏆 Black & Gold Award Night", "🎉 Festival Corporate"],
      large:    ["💎 Grand Gala Night", "🌟 Annual Awards", "🎪 Company Carnival"],
    },
    tips: {
      intimate: "Office parties focus on food quality — allocate 50–60% of budget to catering.",
      small:    "Light decoration creates a celebration vibe away from the usual office feel.",
      medium:   "Photography captures team memories — great content for company social media.",
      large:    "Large office parties benefit from professional coordination. Explore Tendr Smart Plans.",
    },
  },

  "Corporate Event": {
    services: {
      intimate: ["Caterer"],
      small:    ["Caterer", "Decorator"],
      medium:   ["Caterer", "Decorator", "Photographer"],
      large:    ["Caterer", "Decorator", "Photographer", "DJ"],
    },
    themes: {
      intimate: ["🏢 Corporate Lunch", "🎯 Team Building"],
      small:    ["🏆 Award Ceremony", "🎊 Corporate Mixer", "⚡ Innovation Summit"],
      medium:   ["💼 Black & Gold Gala", "🌟 Annual Awards Night", "🏆 Leadership Summit"],
      large:    ["💎 Grand Corporate Gala", "⚡ Tech Conference", "🌟 Annual Day Celebration"],
    },
    tips: {
      intimate: "Corporate events prioritize punctual service and food quality.",
      small:    "Branding colours in decoration creates a premium corporate atmosphere.",
      medium:   "Photography and video are key for corporate PR and internal HR content.",
      large:    "Large corporate events need 3+ week advance booking. Ask Tendr about a dedicated coordinator.",
    },
  },

  "Housewarming": {
    services: {
      intimate: ["Caterer", "Decorator"],
      small:    ["Caterer", "Decorator"],
      medium:   ["Caterer", "Decorator", "Photographer"],
      large:    ["Caterer", "Decorator", "Photographer"],
    },
    themes: {
      intimate: ["🌸 Floral Fresh", "🏠 Minimal Modern", "🪔 Traditional Puja"],
      small:    ["🌿 Garden Fresh", "🏠 Contemporary Chic", "🪔 Traditional Welcome"],
      medium:   ["✨ Golden Welcome", "🌸 Elegant Floral", "🪔 Grand Traditional"],
      large:    ["💎 Luxury Housewarming", "✨ Grand Welcome", "🌸 Premium Floral"],
    },
    tips: {
      intimate: "Housewarmings focus on puja setup and catering — keep the vibe warm and traditional.",
      small:    "Fresh floral decoration with home-style catering is the most popular combo for housewarmings.",
      medium:   "Photography is a great addition to capture the first memories in your new home.",
      large:    "Large housewarmings need proper seating and catering — plan for both veg and non-veg options.",
    },
  },

  "Graduation": {
    services: {
      intimate: ["Decorator", "Photographer"],
      small:    ["Decorator", "Photographer", "Caterer"],
      medium:   ["Decorator", "Photographer", "Caterer", "DJ"],
      large:    ["Decorator", "Caterer", "DJ", "Photographer"],
    },
    themes: {
      intimate: ["🎓 Academic Gold", "✈️ Travel & Adventure", "🌟 Future Forward"],
      small:    ["🎓 Cap & Gown Glam", "🌍 World Explorer", "💫 Dream Big"],
      medium:   ["🎉 Grad Night Party", "🌈 Colour Splash", "🎭 Bollywood Grad Night"],
      large:    ["🎊 Grand Graduation Gala", "🌟 Alumni Night", "🎪 Celebration Carnival"],
    },
    tips: {
      intimate: "Graduation parties work beautifully with a photo booth and themed backdrop.",
      small:    "Keep the vibe inclusive for both parents and friends — mixed age groups need neutral themes.",
      medium:   "Graduation parties with 50+ guests usually add a DJ for the evening celebration.",
      large:    "Large graduation events benefit from a stage setup and an MC.",
    },
  },

  "Festival": {
    services: {
      intimate: ["Decorator"],
      small:    ["Decorator", "Caterer"],
      medium:   ["Decorator", "Caterer", "DJ"],
      large:    ["Decorator", "Caterer", "DJ", "Photographer"],
    },
    themes: {
      intimate: ["🪔 Diwali Glow", "🌸 Navratri Colours", "🎨 Holi Rangoli"],
      small:    ["🪔 Diwali Glam", "🌺 Navratri Night", "🎊 Festive Celebration"],
      medium:   ["🌟 Grand Diwali Night", "💃 Navratri Garba", "🎆 Festive Gala"],
      large:    ["✨ Mega Festive Night", "💃 Grand Garba Night", "🪔 Luxury Diwali"],
    },
    tips: {
      intimate: "Festival vendors book up very fast — confirm at least 3 weeks ahead.",
      small:    "Festive season in Delhi NCR is high demand — early booking gets better rates.",
      medium:   "Add a DJ for festive parties with 50+ guests — it transforms the energy completely.",
      large:    "Large festive events need a decorator with specific festival experience.",
    },
  },

  "Others": {
    services: {
      intimate: ["Decorator", "Photographer"],
      small:    ["Decorator", "Photographer", "Caterer"],
      medium:   ["Decorator", "Caterer", "Photographer", "DJ"],
      large:    ["Caterer", "Decorator", "DJ", "Photographer"],
    },
    themes: {
      intimate: ["✨ Elegant Setup", "🌸 Floral Theme", "🕯️ Romantic Evening"],
      small:    ["🎉 Celebration Night", "🌈 Colourful Party", "🌿 Garden Theme"],
      medium:   ["🎊 Grand Celebration", "🎭 Theme Party", "🌟 Gala Night"],
      large:    ["💎 Luxury Event", "🎪 Grand Gala", "✨ Premium Celebration"],
    },
    tips: {
      intimate: "Tell us more about your event and our team can suggest the right vendors.",
      small:    "Our concierge team can build a custom plan for your event — start a chat from your dashboard.",
      medium:   "For custom events, Tendr Smart Plans can create your complete vendor lineup.",
      large:    "Large events benefit from professional coordination — explore Tendr Smart Plans.",
    },
  },
};

/**
 * getRecommendations
 * @param {{ eventType: string, guests: string|number, categoryBudgets: object }} input
 * @returns {{ services: string[], themes: string[], tip: string, totalBudget: number, guestTier: string }}
 */
export function getRecommendations({ eventType, guests, categoryBudgets }) {
  const guestCount = parseInt(guests, 10) || 0;
  const tier = GUEST_TIER(guestCount);

  const template = TEMPLATES[eventType] || TEMPLATES["Others"];

  const services = template.services[tier] || template.services.medium;
  const themes   = (template.themes[tier]  || template.themes.medium).slice(0, 3);
  const tip      = template.tips[tier]     || template.tips.medium;

  const totalBudget = categoryBudgets
    ? Object.values(categoryBudgets).reduce((s, v) => s + (Number(v) || 0), 0)
    : 0;

  return { services, themes, tip, totalBudget, guestTier: tier };
}

// Display label per service ID — matches vendor card titles in EventPlanning
export const SERVICE_LABELS = {
  Caterer:      "Catering",
  Photographer: "Photography",
  DJ:           "DJ & Music",
  Decorator:    "Decoration",
};

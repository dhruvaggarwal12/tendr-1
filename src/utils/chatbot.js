/**
 * Chatbot question flows per service category.
 *
 * Rules:
 * - NO occasion / event type (already in event form)
 * - NO guest count (already in event form)
 * - NO city (already in event form)
 * - Every flow ends with "full address" (type: "text" — free input)
 * - Extra category-specific questions only
 *
 * step shape:
 *   key      — saved to eventDetails
 *   question — bot message text
 *   options  — MCQ options (omit for text input)
 *   type     — "mcq" (default) | "text"
 */

export const TIME_STEP = {
  key:      "eventTiming",
  question: "What time should the vendor arrive, and when does your event end? (e.g. 5:00 PM – 11:00 PM)",
  type:     "text",
};

export const ADDRESS_STEP = {
  key:      "venueAddress",
  question: "What is your full event address or venue name?",
  type:     "text",
};

// Sentinel value — when user picks this, show a free-text input
export const OTHER_OPTION = "Other...";

export const BOT_FLOWS = {

  Decorator: [
    {
      key:      "decorationType",
      question: "What type of decoration are you looking for?",
      options:  ["Balloon Setup", "Floral & Fairy Lights", "Theme Decoration", "Full Venue Styling", OTHER_OPTION],
    },
    {
      key:      "venueType",
      question: "What is the venue type?",
      options:  ["Hall / Banquet", "Terrace", "Garden / Outdoor", "Home Setup"],
    },
    {
      key:      "timeline",
      question: "When is your event?",
      options:  ["This week", "This month", "1–3 months away", "Just exploring"],
    },
    TIME_STEP,
    ADDRESS_STEP,
  ],

  Caterer: [
    {
      key:      "cateringType",
      question: "What type of catering do you need?",
      options:  ["Buffet Setup", "Live Counters", "Plated Meals", "Snacks & Drinks Only", OTHER_OPTION],
    },
    {
      key:      "foodPreference",
      question: "What's your food preference?",
      options:  ["Veg Only", "Non-Veg", "Both Veg & Non-Veg"],
    },
    {
      key:      "timeline",
      question: "When is your event?",
      options:  ["This week", "This month", "1–3 months away", "Just exploring"],
    },
    TIME_STEP,
    ADDRESS_STEP,
  ],

  Photographer: [
    {
      key:      "photographyType",
      question: "What coverage do you need?",
      options:  ["Photography Only", "Videography Only", "Both Photo + Video", "Candid + Traditional"],
    },
    {
      key:      "albumRequired",
      question: "Is a printed album required?",
      options:  ["Yes, album required", "No, digital delivery only", "Discuss with photographer"],
    },
    {
      key:      "coverage",
      question: "How many hours of coverage do you need?",
      options:  ["2–3 hours", "Half day (4–5 hrs)", "Full day", "Not sure yet"],
    },
    TIME_STEP,
    ADDRESS_STEP,
  ],

  DJ: [
    {
      key:      "musicVibe",
      question: "What music vibe are you looking for?",
      options:  ["Bollywood", "EDM & Electronic", "Mix of Both", "Open to DJ's choice", OTHER_OPTION],
    },
    {
      key:      "djHours",
      question: "How many hours do you need the DJ?",
      options:  ["2–3 hours", "4–5 hours", "Full night", "Not sure yet"],
    },
    {
      key:      "soundSetup",
      question: "Do you need a sound system & lighting setup too?",
      options:  ["Yes, full setup needed", "I have my own setup", "Just the DJ, no setup"],
    },
    TIME_STEP,
    ADDRESS_STEP,
  ],

  // Tendr Concierge — asks across all services
  concierge: [
    {
      key:      "servicesNeeded",
      question: "Which services do you need help with?",
      options:  ["Decoration Only", "Catering Only", "Photography Only", "DJ Only", "Multiple Services"],
    },
    {
      key:      "budget",
      question: "What's your total budget for the event?",
      options:  ["Under ₹10,000", "₹10,000–25,000", "₹25,000–50,000", "₹50,000+"],
    },
    {
      key:      "timeline",
      question: "When is your event?",
      options:  ["This week", "This month", "1–3 months away", "Just exploring"],
    },
    TIME_STEP,
    ADDRESS_STEP,
  ],

  // Support — one question only
  support: [
    {
      key:      "queryType",
      question: "How can we help you today?",
      options:  ["Booking Query", "Vendor Issue", "Payment Help", "General Question"],
    },
  ],
};

/**
 * Returns the bot question flow, automatically skipping questions
 * whose answers are already known from the event planning form.
 *
 * @param {string} serviceType
 * @param {string} chatMode
 * @param {object} formData - Redux eventPlanning.formData (pre-filled answers to skip)
 */
export function getBotFlow(serviceType, chatMode, formData = {}) {
  let flow;
  if (chatMode === "concierge") flow = [...BOT_FLOWS.concierge];
  else if (chatMode === "support")   flow = [...BOT_FLOWS.support];
  else flow = [...(BOT_FLOWS[serviceType] || BOT_FLOWS.concierge)];

  // If the event date is already set, skip the "When is your event?" timeline question
  if (formData.date) {
    flow = flow.filter(s => s.key !== "timeline");
  }
  // If budget is already set, skip the concierge budget question
  if (formData.budget) {
    flow = flow.filter(s => s.key !== "budget");
  }

  return flow;
}

/**
 * Build the summary message that goes into the chat as the first message.
 * Combines form data (already collected) + bot answers.
 */
export function buildSummaryMessage(formAnswers, botAnswers, vendorName, serviceType) {
  const lines = [
    `📋 Chat Request Details`,
    `──────────────────────`,
    vendorName                    ? `👤 Vendor: ${vendorName}` : null,
    serviceType                   ? `🛠 Service: ${serviceType}` : null,
    ``,
    `From event form:`,
    formAnswers.eventType         ? `  🎉 Event type: ${formAnswers.eventType}` : null,
    formAnswers.date              ? `  📅 Event date: ${formAnswers.date}` : null,
    formAnswers.guests            ? `  👥 Guests: ${formAnswers.guests}` : null,
    formAnswers.budget            ? `  💰 Budget: ${formAnswers.budget}` : null,
    formAnswers.location          ? `  📍 City: ${formAnswers.location}` : null,
    ``,
    `Additional details:`,
    botAnswers.decorationType     ? `  🎀 Decoration: ${botAnswers.decorationType}` : null,
    botAnswers.venueType          ? `  🏛 Venue type: ${botAnswers.venueType}` : null,
    botAnswers.cateringType       ? `  🍽 Catering: ${botAnswers.cateringType}` : null,
    botAnswers.foodPreference     ? `  🥗 Food: ${botAnswers.foodPreference}` : null,
    botAnswers.photographyType    ? `  📷 Coverage: ${botAnswers.photographyType}` : null,
    botAnswers.albumRequired      ? `  📕 Album: ${botAnswers.albumRequired}` : null,
    botAnswers.coverage           ? `  ⏱ Hours: ${botAnswers.coverage}` : null,
    botAnswers.musicVibe          ? `  🎵 Music: ${botAnswers.musicVibe}` : null,
    botAnswers.djHours            ? `  ⏰ DJ hours: ${botAnswers.djHours}` : null,
    botAnswers.soundSetup         ? `  🔊 Sound setup: ${botAnswers.soundSetup}` : null,
    botAnswers.servicesNeeded     ? `  🔧 Services: ${botAnswers.servicesNeeded}` : null,
    botAnswers.budget             ? `  💰 Budget: ${botAnswers.budget}` : null,
    botAnswers.timeline           ? `  🗓 Timeline: ${botAnswers.timeline}` : null,
    botAnswers.queryType          ? `  ❓ Query: ${botAnswers.queryType}` : null,
    botAnswers.eventTiming        ? `  🕐 Timing: ${botAnswers.eventTiming}` : null,
    botAnswers.venueAddress       ? `  📌 Address: ${botAnswers.venueAddress}` : null,
    botAnswers.selectedPackage    ? `  📦 Package: ${botAnswers.selectedPackage}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

/** Packages per service type — used in chat wizard and admin send-packages */
export const CHAT_PACKAGES = {
  Caterer: [
    {
      tier: "Basic", guests: "20–40",
      desc: "Veg Menu · 2 Starters · 1 Main Course · 1 Dessert · Basic Serving",
      items: ["Veg Menu", "2 Starters", "1 Main Course", "1 Dessert", "Basic Serving"],
    },
    {
      tier: "Standard", guests: "40–80",
      desc: "Veg/Non-Veg · 3 Starters · 2 Main Course · 2 Desserts · Live Counter · Professional Staff",
      items: ["Veg/Non-Veg", "3 Starters", "2 Main Course", "2 Desserts", "Live Counter", "Professional Staff"],
    },
    {
      tier: "Premium", guests: "80+",
      desc: "Custom Menu · 4+ Starters · 3+ Main Course · 3+ Desserts · Live Counters · Fine Dining Setup",
      items: ["Custom Menu", "4+ Starters", "3+ Main Course", "3+ Desserts", "Live Counters", "Fine Dining Setup"],
    },
  ],
  Photographer: [
    {
      tier: "Basic", guests: "20–40",
      desc: "2–3 Hrs Coverage · 1 Photographer · 100+ Edited Photos · Online Gallery",
      items: ["2–3 Hrs Coverage", "1 Photographer", "100+ Edited Photos", "Online Gallery"],
    },
    {
      tier: "Standard", guests: "40–80",
      desc: "4–6 Hrs Coverage · 1 Photographer · 300+ Edited Photos · Candid + Group · Highlight Reel",
      items: ["4–6 Hrs Coverage", "1 Photographer", "300+ Edited Photos", "Candid + Group", "Highlight Reel"],
    },
    {
      tier: "Premium", guests: "80+",
      desc: "Full Day Coverage · 2 Photographers · 500+ Photos · Candid + Group · Highlight Reel · Teaser Video",
      items: ["Full Day Coverage", "2 Photographers", "500+ Photos", "Candid + Group", "Highlight Reel", "Teaser Video"],
    },
  ],
  Decorator: [
    {
      tier: "Basic", guests: "20–40",
      desc: "Basic Backdrop · Balloon Decor · Table Decor · Fairy Lights",
      items: ["Basic Backdrop", "Balloon Decor", "Table Decor", "Fairy Lights"],
    },
    {
      tier: "Standard", guests: "40–80",
      desc: "Themed Backdrop · Balloon & Floral · Table & Entrance Decor · Custom Signage · Lighting Setup",
      items: ["Themed Backdrop", "Balloon & Floral", "Table & Entrance Decor", "Custom Signage", "Lighting Setup"],
    },
    {
      tier: "Premium", guests: "80+",
      desc: "Premium Theme Decor · Floral & Balloon Design · Stage Setup · Custom Installations · Full Venue Styling",
      items: ["Premium Theme Decor", "Floral & Balloon Design", "Stage Setup", "Custom Installations", "Full Venue Styling"],
    },
  ],
  DJ: [
    {
      tier: "Basic", guests: "20–40",
      desc: "3 Hrs Set · 1 DJ · Basic Sound System · Standard Lighting",
      items: ["3 Hrs Set", "1 DJ", "Basic Sound System", "Standard Lighting"],
    },
    {
      tier: "Standard", guests: "40–80",
      desc: "5 Hrs Set · 1 DJ · Professional Sound · LED Lighting · Wireless Mic",
      items: ["5 Hrs Set", "1 DJ", "Professional Sound", "LED Lighting", "Wireless Mic"],
    },
    {
      tier: "Premium", guests: "80+",
      desc: "Full Event Coverage · 1 DJ + Assistant · Premium Sound System · Dance Floor Lighting · Wireless Mics · Fog Machine",
      items: ["Full Event Coverage", "1 DJ + Assistant", "Premium Sound System", "Dance Floor Lighting", "Wireless Mics", "Fog Machine"],
    },
  ],
};

/** Build the auto package MCQ message for a service type */
export function buildAutoPackageMessage(serviceType) {
  const pkgs = CHAT_PACKAGES[serviceType];
  if (!pkgs) return null;
  const lines = [
    `📦 Package Options for ${serviceType}`,
    `──────────────────────────────────`,
    `Please choose a package that suits your needs:`,
    ``,
    ...pkgs.map((p, i) => `${['1️⃣','2️⃣','3️⃣'][i]} ${p.tier}\n   ${p.desc}`),
    ``,
    `Reply with 1, 2 or 3 — or tap the option below.`,
  ];
  return `[MCQ_PACKAGES:${serviceType}]\n` + lines.join("\n");
}

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

const ADDRESS_STEP = {
  key:      "venueAddress",
  question: "What is your full event address or venue name?",
  type:     "text",
};

export const BOT_FLOWS = {

  Decorator: [
    {
      key:      "decorationType",
      question: "What type of decoration are you looking for?",
      options:  ["Balloon Setup", "Floral & Fairy Lights", "Theme Decoration", "Full Venue Styling"],
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
    ADDRESS_STEP,
  ],

  Caterer: [
    {
      key:      "cateringType",
      question: "What type of catering do you need?",
      options:  ["Buffet Setup", "Live Counters", "Plated Meals", "Snacks & Drinks Only"],
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
    ADDRESS_STEP,
  ],

  DJ: [
    {
      key:      "musicVibe",
      question: "What music vibe are you looking for?",
      options:  ["Bollywood", "EDM & Electronic", "Mix of Both", "Open to DJ's choice"],
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

export function getBotFlow(serviceType, chatMode) {
  if (chatMode === "concierge") return BOT_FLOWS.concierge;
  if (chatMode === "support")   return BOT_FLOWS.support;
  return BOT_FLOWS[serviceType] || BOT_FLOWS.concierge;
}

/**
 * Build the summary message that goes into the chat as the first message.
 * Combines form data (already collected) + bot answers.
 */
export function buildSummaryMessage(formAnswers, botAnswers, vendorName, serviceType) {
  const lines = [
    `📋 *Chat Request Details*`,
    ``,
    vendorName                    ? `👤 Vendor: ${vendorName}` : null,
    serviceType                   ? `🛠 Service: ${serviceType}` : null,
    ``,
    `*From event form:*`,
    formAnswers.eventType         ? `🎉 Event type: ${formAnswers.eventType}` : null,
    formAnswers.date              ? `📅 Event date: ${formAnswers.date}` : null,
    formAnswers.guests            ? `👥 Guests: ${formAnswers.guests}` : null,
    formAnswers.budget            ? `💰 Budget: ${formAnswers.budget}` : null,
    formAnswers.location          ? `📍 City: ${formAnswers.location}` : null,
    ``,
    `*Additional details:*`,
    botAnswers.decorationType     ? `🎀 Decoration: ${botAnswers.decorationType}` : null,
    botAnswers.venueType          ? `🏛 Venue type: ${botAnswers.venueType}` : null,
    botAnswers.cateringType       ? `🍽 Catering: ${botAnswers.cateringType}` : null,
    botAnswers.foodPreference     ? `🥗 Food: ${botAnswers.foodPreference}` : null,
    botAnswers.photographyType    ? `📷 Coverage: ${botAnswers.photographyType}` : null,
    botAnswers.albumRequired      ? `📕 Album: ${botAnswers.albumRequired}` : null,
    botAnswers.coverage           ? `⏱ Hours: ${botAnswers.coverage}` : null,
    botAnswers.musicVibe          ? `🎵 Music: ${botAnswers.musicVibe}` : null,
    botAnswers.djHours            ? `⏰ DJ hours: ${botAnswers.djHours}` : null,
    botAnswers.soundSetup         ? `🔊 Sound setup: ${botAnswers.soundSetup}` : null,
    botAnswers.servicesNeeded     ? `🔧 Services: ${botAnswers.servicesNeeded}` : null,
    botAnswers.budget             ? `💰 Budget: ${botAnswers.budget}` : null,
    botAnswers.timeline           ? `🗓 Timeline: ${botAnswers.timeline}` : null,
    botAnswers.queryType          ? `❓ Query: ${botAnswers.queryType}` : null,
    botAnswers.venueAddress       ? `📌 Address: ${botAnswers.venueAddress}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

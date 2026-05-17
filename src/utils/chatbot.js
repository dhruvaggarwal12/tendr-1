/**
 * Pre-written chatbot question flows per service category.
 * Each flow is an array of steps. Each step has:
 *   - key:      field name saved to eventDetails
 *   - question: text the bot sends
 *   - options:  array of clickable answers (no free typing)
 *
 * The last step in every flow is always the city question (shared).
 * After all steps, a formatted summary is auto-sent as the first message.
 */

const CITY_STEP = {
  key: "location",
  question: "Which city is your event in?",
  options: ["Delhi", "Noida", "Gurgaon", "Ghaziabad", "Faridabad", "Other"],
};

export const BOT_FLOWS = {
  Decorator: [
    {
      key: "decorationType",
      question: "What type of decoration are you looking for?",
      options: ["Balloon Setup", "Floral & Fairy Lights", "Theme Decoration", "Full Venue Styling"],
    },
    {
      key: "eventType",
      question: "What's the occasion?",
      options: ["Birthday", "Anniversary", "Baby Shower", "Engagement", "Corporate Event", "Other"],
    },
    {
      key: "guests",
      question: "How many guests are you expecting?",
      options: ["Under 20", "20–50", "50–100", "100+"],
    },
    {
      key: "timeline",
      question: "When is your event?",
      options: ["This week", "This month", "1–3 months away", "Just exploring"],
    },
    CITY_STEP,
  ],

  Caterer: [
    {
      key: "cateringType",
      question: "What type of catering do you need?",
      options: ["Buffet Setup", "Live Counters", "Plated Meals", "Snacks & Drinks Only"],
    },
    {
      key: "foodPreference",
      question: "What's your food preference?",
      options: ["Veg Only", "Non-Veg", "Both Veg & Non-Veg"],
    },
    {
      key: "guests",
      question: "How many guests are you expecting?",
      options: ["Under 20", "20–50", "50–100", "100+"],
    },
    {
      key: "timeline",
      question: "When is your event?",
      options: ["This week", "This month", "1–3 months away", "Just exploring"],
    },
    CITY_STEP,
  ],

  Photographer: [
    {
      key: "photographyType",
      question: "What do you need?",
      options: ["Photography Only", "Videography Only", "Both Photo + Video", "Candid + Traditional"],
    },
    {
      key: "eventType",
      question: "What's the occasion?",
      options: ["Birthday", "Anniversary", "Pre-Wedding", "Corporate Event", "Other"],
    },
    {
      key: "coverage",
      question: "How many hours of coverage do you need?",
      options: ["2–3 hours", "Half day (4–5 hrs)", "Full day", "Not sure yet"],
    },
    {
      key: "timeline",
      question: "When is your event?",
      options: ["This week", "This month", "1–3 months away", "Just exploring"],
    },
    CITY_STEP,
  ],

  DJ: [
    {
      key: "eventType",
      question: "What type of event is it?",
      options: ["Birthday Party", "House Party", "Corporate Event", "Wedding Function", "Other"],
    },
    {
      key: "musicVibe",
      question: "What music vibe are you looking for?",
      options: ["Bollywood", "EDM & Electronic", "Mix of Both", "Open to DJ's choice"],
    },
    {
      key: "djHours",
      question: "How many hours do you need the DJ?",
      options: ["2–3 hours", "4–5 hours", "Full night", "Not sure yet"],
    },
    {
      key: "guests",
      question: "How many guests are you expecting?",
      options: ["Under 20", "20–50", "50–100", "100+"],
    },
    CITY_STEP,
  ],

  // Tendr Concierge — combined questions for all services
  concierge: [
    {
      key: "eventType",
      question: "What's your event type?",
      options: ["Birthday", "Anniversary", "House Party", "Corporate Event", "Baby Shower", "Other"],
    },
    {
      key: "servicesNeeded",
      question: "Which services do you need?",
      options: ["Decoration", "Catering", "Photography", "DJ & Music", "Multiple Services"],
    },
    {
      key: "guests",
      question: "How many guests are you expecting?",
      options: ["Under 20", "20–50", "50–100", "100+"],
    },
    {
      key: "budget",
      question: "What's your total budget for the event?",
      options: ["Under ₹10,000", "₹10,000–25,000", "₹25,000–50,000", "₹50,000+"],
    },
    CITY_STEP,
  ],

  // Support chat — just one question
  support: [
    {
      key: "queryType",
      question: "How can we help you today?",
      options: ["Booking Query", "Vendor Issue", "Payment Help", "General Question"],
    },
  ],
};

/** Get the flow for a given service type / chat mode */
export function getBotFlow(serviceType, chatMode) {
  if (chatMode === "concierge") return BOT_FLOWS.concierge;
  if (chatMode === "support")   return BOT_FLOWS.support;
  return BOT_FLOWS[serviceType] || BOT_FLOWS.concierge;
}

/** Build a formatted summary message from collected answers */
export function buildSummaryMessage(answers, vendorName, serviceType) {
  const lines = [
    `📋 *Chat Request Summary*`,
    ``,
    vendorName   ? `👤 Vendor requested: ${vendorName}` : null,
    serviceType  ? `🛠 Service: ${serviceType}` : null,
    answers.eventType      ? `🎉 Event: ${answers.eventType}` : null,
    answers.decorationType ? `🎀 Decoration type: ${answers.decorationType}` : null,
    answers.cateringType   ? `🍽 Catering: ${answers.cateringType}` : null,
    answers.foodPreference ? `🥗 Food preference: ${answers.foodPreference}` : null,
    answers.photographyType? `📷 Photography: ${answers.photographyType}` : null,
    answers.coverage       ? `⏱ Coverage: ${answers.coverage}` : null,
    answers.musicVibe      ? `🎵 Music vibe: ${answers.musicVibe}` : null,
    answers.djHours        ? `⏰ DJ hours: ${answers.djHours}` : null,
    answers.servicesNeeded ? `🔧 Services needed: ${answers.servicesNeeded}` : null,
    answers.guests         ? `👥 Guests: ${answers.guests}` : null,
    answers.budget         ? `💰 Budget: ${answers.budget}` : null,
    answers.timeline       ? `📅 Timeline: ${answers.timeline}` : null,
    answers.location       ? `📍 City: ${answers.location}` : null,
    answers.queryType      ? `❓ Query: ${answers.queryType}` : null,
    ``,
    `_Collected automatically before admin approval._`,
  ].filter(Boolean);
  return lines.join("\n");
}

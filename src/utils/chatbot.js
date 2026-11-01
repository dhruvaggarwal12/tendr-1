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
 *   multi    — true for a multi-select step (answer saved as a ", "-joined string)
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
      key:      "venueType",
      question: "What is the venue type?",
      options:  ["Indoor hall", "Outdoor", "Home", "Farmhouse"],
    },
    {
      key:      "theme",
      question: "What theme or color palette do you have in mind?",
      options:  ["Pastel", "Gold & White", "Vibrant & Colorful", "Monochrome", "Floral/Garden", "No preference"],
    },
    {
      key:      "mustHave",
      question: "Any must-haves for the decor?",
      options:  ["Balloon decor", "Floral arrangements", "Fairy lights", "Backdrop/Photo wall", "Stage decor", "Table centerpieces"],
      multi:    true,
    },
    {
      key:      "timeline",
      question: "When is your event?",
      options:  ["This week", "This month", "1–3 months away", "Just exploring"],
    },
    TIME_STEP,
    ADDRESS_STEP,
  ],

  // Cuisine + dish selection are handled by the dedicated post-package wizard
  // step for Caterer (see showCuisineStep/showDishStep in VendorChatModal) —
  // deliberately not duplicated here.
  Caterer: [
    {
      key:      "foodPreference",
      question: "What's your food preference?",
      options:  ["Veg only", "Non-veg", "Both"],
    },
    {
      key:      "mealType",
      question: "What meal type are you looking for?",
      options:  ["Buffet", "Plated", "Live counters", "High Tea"],
    },
    {
      key:      "beverages",
      question: "What beverage service do you need?",
      options:  ["Soft drinks only", "Mocktails included", "Alcohol permitted (BYO)", "Not needed"],
    },
    {
      key:      "serviceStaff",
      question: "Do you need the vendor to provide service staff?",
      options:  ["Vendor provides staff", "We'll arrange our own"],
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
      key:      "coverageType",
      question: "What do you need?",
      options:  ["Photos only", "Video only", "Both"],
    },
    {
      key:      "style",
      question: "What style are you going for?",
      options:  ["Candid", "Traditional", "Cinematic"],
    },
    {
      key:      "duration",
      question: "How long do you need coverage for?",
      options:  ["Half day (4 hrs)", "Full day (8 hrs)"],
    },
    {
      key:      "deliverables",
      question: "What deliverables do you need?",
      options:  ["Edited photos", "Printed album", "Highlights reel", "Full video"],
      multi:    true,
    },
    {
      key:      "teamSize",
      question: "What team size do you need?",
      options:  ["1 photographer", "2 photographers", "Photographer + videographer"],
    },
    {
      key:      "drone",
      question: "Do you need drone coverage?",
      options:  ["Yes", "No"],
    },
    {
      key:      "timeline",
      question: "When is your event?",
      options:  ["This week", "This month", "1–3 months away", "Just exploring"],
    },
    TIME_STEP,
    ADDRESS_STEP,
  ],

  "DJ Setup": [
    {
      key:      "genre",
      question: "What music genre are you looking for?",
      options:  ["Bollywood", "English", "Both", "Regional"],
    },
    {
      key:      "duration",
      question: "How long do you need the DJ for?",
      options:  ["2 hrs", "4 hrs", "Full event"],
    },
    {
      key:      "mcNeeded",
      question: "Do you need an MC / anchor?",
      options:  ["Yes", "No"],
    },
    {
      key:      "soundSetup",
      question: "What sound setup do you need?",
      options:  ["Basic PA system", "Premium sound + lighting", "Not sure — vendor to advise"],
    },
    {
      key:      "extras",
      question: "Any extras you'd like?",
      options:  ["Dance floor lighting", "Fog/smoke effect", "LED screen", "Not needed"],
      multi:    true,
    },
    {
      key:      "timeline",
      question: "When is your event?",
      options:  ["This week", "This month", "1–3 months away", "Just exploring"],
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
    formAnswers.extraRequirements?.length ? `  🔧 Extra needs: ${formAnswers.extraRequirements.join(", ")}` : null,
    ``,
    `Additional details:`,
    botAnswers.venueType          ? `  🏛 Venue type: ${botAnswers.venueType}` : null,
    botAnswers.theme              ? `  🎨 Theme: ${botAnswers.theme}` : null,
    botAnswers.mustHave           ? `  ✨ Must-haves: ${botAnswers.mustHave}` : null,
    botAnswers.foodPreference     ? `  🥗 Food: ${botAnswers.foodPreference}` : null,
    botAnswers.mealType           ? `  🍽 Meal type: ${botAnswers.mealType}` : null,
    botAnswers.beverages          ? `  🥤 Beverages: ${botAnswers.beverages}` : null,
    botAnswers.serviceStaff       ? `  🧑‍🍳 Service staff: ${botAnswers.serviceStaff}` : null,
    botAnswers.cuisinePreference  ? `  🍛 Cuisine: ${botAnswers.cuisinePreference}` : null,
    botAnswers.dishSelection      ? `  📋 Dishes:\n${botAnswers.dishSelection}` : null,
    botAnswers.coverageType       ? `  📷 Coverage: ${botAnswers.coverageType}` : null,
    botAnswers.style              ? `  🎞 Style: ${botAnswers.style}` : null,
    botAnswers.duration           ? `  ⏱ Duration: ${botAnswers.duration}` : null,
    botAnswers.deliverables       ? `  📦 Deliverables: ${botAnswers.deliverables}` : null,
    botAnswers.teamSize           ? `  👥 Team size: ${botAnswers.teamSize}` : null,
    botAnswers.drone              ? `  🚁 Drone: ${botAnswers.drone}` : null,
    botAnswers.genre              ? `  🎵 Music genre: ${botAnswers.genre}` : null,
    botAnswers.mcNeeded           ? `  🎤 MC/Anchor: ${botAnswers.mcNeeded}` : null,
    botAnswers.soundSetup         ? `  🔊 Sound setup: ${botAnswers.soundSetup}` : null,
    botAnswers.extras             ? `  ➕ Extras: ${botAnswers.extras}` : null,
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
  "DJ Setup": [
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

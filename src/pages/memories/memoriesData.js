const STORAGE_KEY = "tendr:memories_products";

export const DEFAULT_PRODUCTS = [
  {
    id: "invitation-flyer",
    name: "Invitation Flyer",
    tagline: "Custom-designed digital invitations for any event",
    startingPrice: 299,
    unit: "per design",
    perfectFor: ["Birthday", "Anniversary", "Baby Shower", "Get-together", "Housewarming", "Graduation", "1st Birthday", "Newborn Welcome"],
    description:
      "Beautiful, print-ready digital invitation flyers designed specially for your event. Share on WhatsApp, Instagram, or print at home. Delivered within 24–48 hours after your details are received.",
    includes: [
      "High-resolution PNG + PDF",
      "WhatsApp-ready format",
      "2 free revision rounds",
      "Name & date personalization",
      "Custom color theme",
    ],
    images: [
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=700&q=80",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=700&q=80",
      "https://images.unsplash.com/photo-1470290378698-263fa7ca60ab?w=700&q=80",
    ],
    available: true,
    bookingFields: [
      { key: "contactName", label: "Your Name", type: "text", required: true },
      { key: "phone", label: "Phone Number", type: "tel", required: true },
      { key: "eventType", label: "Event Type", type: "text", placeholder: "e.g. Birthday, Baby Shower", required: true },
      { key: "eventDate", label: "Event Date", type: "date", required: true },
      { key: "honorName", label: "Guest of Honor / Event Name", type: "text", placeholder: "e.g. Riya's 1st Birthday", required: true },
      { key: "quantity", label: "Quantity", type: "number", placeholder: "1", required: false },
      { key: "colorTheme", label: "Color / Theme Preference", type: "text", placeholder: "e.g. Pastel pink, Floral, Boho", required: false },
      { key: "notes", label: "Design Notes", type: "textarea", placeholder: "Any specific text, fonts, or elements you want included", required: false },
    ],
  },
  {
    id: "handler-cone",
    name: "Handler Cone",
    tagline: "Handcrafted petal cones for picture-perfect moments",
    startingPrice: 49,
    unit: "per cone (min. 10)",
    perfectFor: ["Birthday", "Anniversary", "Pre Wedding", "Housewarming", "Graduation", "Get-together"],
    description:
      "Elegant hand-crafted paper cones filled with dried flowers or rose petals — the perfect touch for a memorable guest shower or send-off moment. Customized with your event's colors and theme.",
    includes: [
      "Custom printed cone",
      "Filled with dried petals or flowers",
      "Ribbon tie included",
      "Minimum order: 10 cones",
      "Delivery 3–5 days before event",
    ],
    images: [
      "https://images.unsplash.com/photo-1487530811015-780dee70f70c?w=700&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80",
      "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=700&q=80",
    ],
    available: true,
    bookingFields: [
      { key: "contactName", label: "Your Name", type: "text", required: true },
      { key: "phone", label: "Phone Number", type: "tel", required: true },
      { key: "eventType", label: "Event Type", type: "text", placeholder: "e.g. Birthday, Anniversary", required: true },
      { key: "eventDate", label: "Event Date", type: "date", required: true },
      { key: "quantity", label: "Quantity", type: "number", placeholder: "Min. 10", required: true },
      { key: "colorTheme", label: "Color / Theme", type: "text", placeholder: "e.g. White & gold, Pastel pink", required: false },
      { key: "fillType", label: "Fill Type", type: "select", options: ["Rose petals", "Dried flowers", "Mixed"], required: false },
      { key: "notes", label: "Special Instructions", type: "textarea", placeholder: "Any specific requirements", required: false },
    ],
  },
];

export function getProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_PRODUCTS;
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function getProductById(id) {
  return getProducts().find((p) => p.id === id) || null;
}

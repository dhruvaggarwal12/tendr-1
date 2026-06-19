const CATALOGUE_KEY = "ws_admin_catalogue";

export const STATIONERY_CATEGORIES = [
  "Branding & Identity",
  "Event Signage",
  "Itinerary",
  "Guest Accessories",
  "Hashtag Services",
  "Invitations",
  "Envelopes",
  "Coffee Table Booklet",
  "Cards",
  "Other",
];

export const DEFAULT_STATIONERY = [
  { id: "logo-monogram",              name: "Logo / Monogram",                   category: "Branding & Identity",    tagline: "Your story, beautifully monogrammed",                       startingPrice: 799,  priceRange: "₹799 – ₹1,999", unit: "per design",   description: "Pricing depends on design complexity and customization requirements.",                                       features: ["Custom couple logo or monogram","Multiple design concepts","Digital file for all uses"],                                          images: [], available: true },
  { id: "welcome-board",              name: "Welcome Board / Sunboard",          category: "Event Signage",          tagline: "Make a grand welcome statement at your venue",               startingPrice: 999,  unit: "per piece",    description: "Large-format welcome board customised with your couple name and event details.",                             features: ["Custom couple name & date","Premium sunboard print","Ready to display"],                                                          images: [], available: true },
  { id: "3-fold-itinerary-key-holder",name: "3-Fold Itinerary with Key Holder",  category: "Itinerary",              tagline: "Premium three-fold itinerary with key holder",               startingPrice: 1900, unit: "per piece",    description: "A premium three-fold itinerary with built-in key holder for hotel room keys.",                              features: ["3-fold design","Key holder sleeve","Detailed event schedule","Luxurious finish"],                                                 images: [], available: true },
  { id: "luggage-tags",               name: "Luggage Tags",                      category: "Guest Accessories",      tagline: "Personalized tags for your guests' luggage",                startingPrice: 650,  unit: "per set",      description: "Custom-designed luggage tags for your wedding guests.",                                                      features: ["Custom design","Durable material","Elegant finish"],                                                                              images: [], available: true },
  { id: "door-danglers",              name: "Door Danglers",                     category: "Guest Accessories",      tagline: "Charming room door hangers for your guests",                startingPrice: 650,  unit: "per set",      description: "Custom-printed door hanger tags to make your guests' stay extra special.",                                  features: ["Custom design","Premium card stock","Personalized message"],                                                                      images: [], available: true },
  { id: "rose-petal-cones",           name: "Rose Petal Cones",                  category: "Guest Accessories",      tagline: "Beautifully designed cones for flower petals",              startingPrice: 650,  unit: "per set",      description: "Elegant printed paper cones for rose petal confetti showers.",                                               features: ["Custom print","Premium paper","Couple name & design"],                                                                            images: [], available: true },
  { id: "favour-tags",                name: "Favour Tags",                       category: "Guest Accessories",      tagline: "Personalized tags for wedding favours",                     startingPrice: 650,  unit: "per set",      description: "Customised tags to attach to your wedding favour boxes and gifts.",                                          features: ["Custom message","Multiple string options","Theme-matching design"],                                                               images: [], available: true },
  { id: "professional-hashtag",       name: "Professional Hashtag Package",      category: "Hashtag Services",       tagline: "7–8 unique hashtags crafted just for your love story",      startingPrice: 1200, unit: "per package",  description: "7–8 customized hashtag options based on a detailed questionnaire to understand your story and requirements.", features: ["7–8 unique hashtag options","Based on your couple story","Detailed questionnaire","Shareable digital card"],                    images: [], available: true },
  { id: "basic-hashtag",              name: "Basic Hashtag Package",             category: "Hashtag Services",       tagline: "Simple name-based hashtag combinations",                    startingPrice: 500,  unit: "per package",  description: "Simple name combinations and generic hashtag options for your wedding.",                                     features: ["Name-based hashtags","Generic options","Quick turnaround"],                                                                       images: [], available: true },
  { id: "printed-invitations",        name: "Printed Invitations",               category: "Invitations",            tagline: "Pull-Out · Open Door · Roll-Up styles",                     startingPrice: 0,    priceOnRequest: true, unit: "per set",      description: "Pricing depends on the invitation style selected and the number of events covered.",                        features: ["Pull-Out Invitations","Open Door Invitations","Roll-Up Invitations","Fully customized to your theme"],                           images: [], available: true },
  { id: "money-envelopes",            name: "Fully Customized Money Envelopes",  category: "Envelopes",              tagline: "Your couple monogram on every envelope",                    startingPrice: 750,  unit: "per set",      description: "Featuring the couple's logo/monogram for a personalized touch.",                                             features: ["Couple monogram design","Premium envelope material","Custom color options"],                                                      images: [], available: true },
  { id: "gold-foil-envelopes",        name: "Gold Foiling Envelopes",            category: "Envelopes",              tagline: "Luxurious gold foil accents for your envelopes",            startingPrice: 0,    priceOnRequest: true, unit: "per set",      description: "Pricing available on request based on selected options.",                                                   features: ["Real gold foil printing","Multiple foil patterns","Premium luxury finish"],                                                       images: [], available: true },
  { id: "coffee-table-12",            name: "Coffee Table Booklet – 12 Pages",   category: "Coffee Table Booklet",   tagline: "A curated 12-page wedding magazine",                        startingPrice: 2000, unit: "per booklet",  description: "Fully customized and designed exclusively for your event. No templates used.",                               features: ["12 custom pages","Exclusive design — no templates","Premium print & binding","Your love story beautifully told"],                 images: [], available: true },
  { id: "coffee-table-24",            name: "Coffee Table Booklet – 24 Pages",   category: "Coffee Table Booklet",   tagline: "A premium 24-page wedding magazine keepsake",               startingPrice: 3200, unit: "per booklet",  description: "Fully customized and designed exclusively for your event. No templates used.",                               features: ["24 custom pages","Exclusive design — no templates","Premium print & binding","Extended coverage of your journey"],                images: [], available: true },
  { id: "thank-you-card",             name: "Thank You Card",                    category: "Cards",                  tagline: "Express heartfelt gratitude in style",                      startingPrice: 90,   unit: "per piece",    description: "A personalised thank you card for each of your wedding guests.",                                             features: ["Custom message","A6 size","Matching wedding theme"],                                                                              images: [], available: true },
  { id: "welcome-card",               name: "Welcome Card",                      category: "Cards",                  tagline: "A warm welcome for every guest",                            startingPrice: 220,  unit: "per piece",    description: "A stunning printed welcome card to greet guests at your ceremony or reception entrance.",                    features: ["A4 size","Custom couple name & date","Premium print"],                                                                            images: [], available: true },
];

// ── localStorage helpers ──────────────────────────────────────────────────────

function genId() {
  return `ws_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadCatalogue() {
  try {
    const stored = localStorage.getItem(CATALOGUE_KEY);
    if (stored) {
      const items = JSON.parse(stored);
      if (Array.isArray(items) && items.length > 0) return items;
    }
  } catch {}
  return null;
}

function saveCatalogue(items) {
  try {
    localStorage.setItem(CATALOGUE_KEY, JSON.stringify(items));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      throw new Error("Storage full — remove some images before saving.");
    }
    throw e;
  }
}

function seedIfEmpty() {
  const existing = loadCatalogue();
  if (existing) return existing;
  const seeded = DEFAULT_STATIONERY.map(item => ({
    ...item,
    _id: item.id || genId(),
  }));
  saveCatalogue(seeded);
  return seeded;
}

// ── Public API (customers) ────────────────────────────────────────────────────

export async function getStationeryProducts() {
  return seedIfEmpty().filter(i => i.available !== false);
}

// ── Admin API (localStorage-backed, no backend needed) ────────────────────────

export async function getAdminStationeryProducts(_token) {
  return seedIfEmpty();
}

export async function createStationeryItem(_token, fields) {
  const items = seedIfEmpty();
  const newItem = {
    ...fields,
    _id: genId(),
    images: [],
    available: fields.available !== false,
    createdAt: new Date().toISOString(),
  };
  saveCatalogue([...items, newItem]);
  return newItem;
}

export async function updateStationeryItem(_token, id, fields) {
  const items = seedIfEmpty();
  let updated = null;
  const next = items.map(i => {
    if (i._id === id || i.id === id) {
      updated = { ...i, ...fields };
      return updated;
    }
    return i;
  });
  if (!updated) throw new Error("Item not found");
  saveCatalogue(next);
  return updated;
}

export async function deleteStationeryItem(_token, id) {
  const items = seedIfEmpty();
  saveCatalogue(items.filter(i => i._id !== id && i.id !== id));
}

// Converts files to base64 DataURLs and stores them (max 300 KB per file)
export async function uploadStationeryImages(_token, id, files) {
  const items = seedIfEmpty();
  const item = items.find(i => i._id === id || i.id === id);
  if (!item) throw new Error("Item not found");

  const newImages = await Promise.all(
    files.map(async file => {
      if (file.size > 300 * 1024) {
        throw new Error(`"${file.name}" exceeds 300 KB. Resize the image first.`);
      }
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return { url: dataUrl, publicId: genId() };
    })
  );

  const updatedItem = { ...item, images: [...(item.images || []), ...newImages] };
  saveCatalogue(items.map(i => (i._id === id || i.id === id) ? updatedItem : i));
  return updatedItem;
}

export async function removeStationeryImage(_token, id, publicId) {
  const items = seedIfEmpty();
  const item = items.find(i => i._id === id || i.id === id);
  if (!item) throw new Error("Item not found");

  const updatedItem = {
    ...item,
    images: (item.images || []).filter(img => img.publicId !== publicId),
  };
  saveCatalogue(items.map(i => (i._id === id || i.id === id) ? updatedItem : i));
  return updatedItem;
}

export async function resetStationeryToDefaults(_token) {
  const seeded = DEFAULT_STATIONERY.map(item => ({
    ...item,
    _id: item.id || genId(),
    images: [],
  }));
  saveCatalogue(seeded);
  return seeded;
}

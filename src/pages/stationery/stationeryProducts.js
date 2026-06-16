const BASE_URL = import.meta.env.VITE_BASE_URL;

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

// Kept as offline fallback only — source of truth is now MongoDB
export const DEFAULT_STATIONERY = [
  { id: "logo-monogram",              name: "Logo / Monogram",                   category: "Branding & Identity",    tagline: "Your story, beautifully monogrammed",                       startingPrice: 799,  priceRange: "₹799 – ₹1,999", unit: "per design",   description: "Pricing depends on design complexity and customization requirements.",                                       features: ["Custom couple logo or monogram","Multiple design concepts","Digital file for all uses"],                                          images: [], available: true },
  { id: "welcome-board",              name: "Welcome Board / Sunboard",          category: "Event Signage",          tagline: "Make a grand welcome statement at your venue",               startingPrice: 999,  unit: "per piece",    description: "Large-format welcome board customised with your couple name and event details.",                             features: ["Custom couple name & date","Premium sunboard print","Ready to display"],                                                          images: [], available: true },
  { id: "a5-leaf-itinerary",          name: "A5 Leaf Itinerary",                 category: "Itinerary",              tagline: "Elegant single-page itinerary for your guests",              startingPrice: 650,  unit: "per piece",    description: "A clean A5 itinerary card with your complete wedding schedule.",                                             features: ["A5 size","Custom schedule & details","Premium paper print"],                                                                      images: [], available: true },
  { id: "single-fold-itinerary",      name: "Single Fold Itinerary",             category: "Itinerary",              tagline: "Classic folded wedding schedule",                            startingPrice: 1100, unit: "per piece",    description: "A single fold itinerary with more space to detail every event of your wedding.",                            features: ["Elegant fold design","Custom text & branding","Premium print quality"],                                                           images: [], available: true },
  { id: "2-fold-itinerary-key-holder",name: "2-Fold Itinerary with Key Holder",  category: "Itinerary",              tagline: "Itinerary plus key holder — all in one",                    startingPrice: 1200, unit: "per piece",    description: "A dual-fold itinerary with a built-in key holder sleeve for hotel room keys.",                              features: ["2-fold design","Key holder sleeve","Full wedding schedule","Personalized branding"],                                              images: [], available: true },
  { id: "3-fold-itinerary-key-holder",name: "3-Fold Itinerary with Key Holder",  category: "Itinerary",              tagline: "Premium three-fold itinerary with key holder",               startingPrice: 1900, unit: "per piece",    description: "A premium three-fold itinerary with built-in key holder for hotel room keys.",                              features: ["3-fold design","Key holder sleeve","Detailed event schedule","Luxurious finish"],                                                 images: [], available: true },
  { id: "newspaper-itinerary",        name: "Newspaper Style Itinerary",         category: "Itinerary",              tagline: "4-page newspaper format — a one-of-a-kind keepsake",        startingPrice: 2000, unit: "per piece",    description: "A fun, story-driven 4-page newspaper style wedding itinerary that doubles as a keepsake.",                  features: ["4-page newspaper format","Couple story & schedule","Unique keepsake design"],                                                     images: [], available: true },
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
  { id: "thank-you-welcome-cards",    name: "Thank You & Welcome Card Set",      category: "Cards",                  tagline: "Express gratitude and warmth in style",                     startingPrice: 800,  unit: "per set",      description: "A matching set of thank you and welcome cards personalised for your wedding.",                               features: ["Thank You card design","Welcome card design","Matching theme","Custom message"],                                                  images: [], available: true },
];

// Public: fetch all available items from the backend
export async function getStationeryProducts() {
  try {
    const res = await fetch(`${BASE_URL}/stationery`);
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return data.items || [];
  } catch {
    return DEFAULT_STATIONERY; // offline fallback
  }
}

// Admin: fetch all items (including hidden) with auth token
export async function getAdminStationeryProducts(token) {
  const res = await fetch(`${BASE_URL}/admin/stationery`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load stationery");
  const data = await res.json();
  return data.items || [];
}

// Admin: create item (returns created item)
export async function createStationeryItem(token, fields) {
  const res = await fetch(`${BASE_URL}/admin/stationery`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    credentials: "include",
    body: JSON.stringify(fields),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create item");
  return data.item;
}

// Admin: update item fields (not images)
export async function updateStationeryItem(token, id, fields) {
  const res = await fetch(`${BASE_URL}/admin/stationery/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    credentials: "include",
    body: JSON.stringify(fields),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update item");
  return data.item;
}

// Admin: delete item
export async function deleteStationeryItem(token, id) {
  const res = await fetch(`${BASE_URL}/admin/stationery/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to delete"); }
}

// Admin: upload images for an existing item (returns updated item)
export async function uploadStationeryImages(token, id, files) {
  const form = new FormData();
  files.forEach(f => form.append("images", f));
  const res = await fetch(`${BASE_URL}/admin/stationery/${id}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to upload images");
  return data.item;
}

// Admin: remove one image from an item by publicId
export async function removeStationeryImage(token, id, publicId) {
  const res = await fetch(`${BASE_URL}/admin/stationery/${id}/images`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    credentials: "include",
    body: JSON.stringify({ publicId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to remove image");
  return data.item;
}

// Admin: wipe all and reseed with defaults
export async function resetStationeryToDefaults(token) {
  const res = await fetch(`${BASE_URL}/admin/stationery/reset`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to reset");
  return data.items || [];
}

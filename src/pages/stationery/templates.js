// 10 Wedding Stationery Templates
// Each template defines: id, name, category, colors, layout style, fields

export const TEMPLATES = [
  {
    id: "botanical-sage",
    name: "Botanical Sage",
    category: "Invitation",
    desc: "Watercolour botanicals with gold frame",
    palette: { bg: "#F7F2E9", accent: "#B8922A", text: "#3B5048", script: "#8B6914" },
    style: "botanical",
  },
  {
    id: "royal-noir",
    name: "Royal Noir",
    category: "Invitation",
    desc: "Dark luxury with gold calligraphy",
    palette: { bg: "#1A1208", accent: "#D4A843", text: "#F5E9C8", script: "#D4A843" },
    style: "royal",
  },
  {
    id: "blush-romance",
    name: "Blush Romance",
    category: "Invitation",
    desc: "Soft pink florals, delicate & feminine",
    palette: { bg: "#FDF0F0", accent: "#C4748A", text: "#7B3F55", script: "#C4748A" },
    style: "blush",
  },
  {
    id: "minimalist-linen",
    name: "Minimalist Linen",
    category: "Invitation",
    desc: "Clean, modern, understated elegance",
    palette: { bg: "#FAFAF8", accent: "#2C2C2C", text: "#2C2C2C", script: "#6B6B6B" },
    style: "minimal",
  },
  {
    id: "marble-gold",
    name: "Marble & Gold",
    category: "Invitation",
    desc: "Luxurious marble texture with gold foil effect",
    palette: { bg: "#F0ECE8", accent: "#C9A84C", text: "#2A2016", script: "#C9A84C" },
    style: "marble",
  },
  {
    id: "dusty-mauve",
    name: "Dusty Mauve",
    category: "Invitation",
    desc: "Romantic muted tones, soft lavender accents",
    palette: { bg: "#F5EEF2", accent: "#9B7BAD", text: "#4A3050", script: "#9B7BAD" },
    style: "mauve",
  },
  {
    id: "navy-celestial",
    name: "Navy Celestial",
    category: "Invitation",
    desc: "Deep navy with gold stars and moonlight",
    palette: { bg: "#0D1B35", accent: "#D4A843", text: "#F0E6CC", script: "#D4A843" },
    style: "navy",
  },
  {
    id: "terracotta-boho",
    name: "Terracotta Boho",
    category: "Invitation",
    desc: "Earthy warm tones with boho florals",
    palette: { bg: "#F7EDE5", accent: "#C27040", text: "#5C2E10", script: "#C27040" },
    style: "boho",
  },
  {
    id: "vintage-garden",
    name: "Vintage Garden",
    category: "Menu Card",
    desc: "Aged paper, garden flowers, classic serif",
    palette: { bg: "#F5EDD8", accent: "#7A6A3A", text: "#3D2E10", script: "#7A6A3A" },
    style: "vintage",
  },
  {
    id: "modern-arch",
    name: "Modern Arch",
    category: "Thank You Card",
    desc: "Contemporary arch shape, clean lines",
    palette: { bg: "#FFFFFF", accent: "#1A1A1A", text: "#1A1A1A", script: "#888" },
    style: "arch",
  },
];

export const FIELDS = [
  { key: "coupleName",   label: "Couple / Host Name",  placeholder: "Rahul & Priya" },
  { key: "date",         label: "Date",                 placeholder: "12th December 2025" },
  { key: "day",          label: "Day",                  placeholder: "Saturday" },
  { key: "time",         label: "Time",                 placeholder: "7:00 PM Onwards" },
  { key: "venue",        label: "Venue",                placeholder: "The Grand Palace, New Delhi" },
  { key: "rsvp",         label: "RSVP",                 placeholder: "+91 9XXXXXXXXX" },
];

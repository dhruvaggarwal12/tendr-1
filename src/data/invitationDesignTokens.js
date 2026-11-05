// Shared color palettes + font pairings for the Tendr Invitation Studio.
// Template configs (invitationStudioTemplates.js) reference these by id —
// fixing a palette/font pairing here updates every template that uses it.

export const PALETTES = {
  "cream-gold":        { bg: "#F7F2E9", bg2: "#FBF8F1", ink: "#2C1A0E", muted: "#7A5535", accent: "#B8922A", accent2: "#D4AF5E" },
  "royal-maroon-gold":  { bg: "#2A0E14", bg2: "#3B1220", ink: "#F6E7C9", muted: "#D4AF5E", accent: "#D4AF5E", accent2: "#E8C878" },
  "navy-gold":          { bg: "#121B35", bg2: "#1B2B4F", ink: "#F3E9C8", muted: "#C9AD6B", accent: "#D4AF5E", accent2: "#F0D98C" },
  "blush-pink-gold":    { bg: "#FDF2F4", bg2: "#FCE8EC", ink: "#5A2436", muted: "#B8728A", accent: "#D88BA3", accent2: "#C98A3E" },
  "pastel-teddy-brown": { bg: "#FBF3E7", bg2: "#F6E8D5", ink: "#5B4330", muted: "#A9825E", accent: "#C98A4F", accent2: "#E8A6AE" },
  "sage-botanical":     { bg: "#F7F2E9", bg2: "#F0EBDC", ink: "#3B5048", muted: "#6E8C64", accent: "#B8922A", accent2: "#8CA583" },
  "charcoal-editorial": { bg: "#FAFAF8", bg2: "#F1F1EE", ink: "#1A1A1A", muted: "#6B6B68", accent: "#2563EB", accent2: "#111111" },
  "midnight-purple":    { bg: "#16132E", bg2: "#2A2550", ink: "#FFFFFF", muted: "#C4B5FD", accent: "#7C3AED", accent2: "#A78BFA" },
  "confetti-coral":     { bg: "#FF8A5B", bg2: "#FF6F91", ink: "#3A1410", muted: "#FFE7D6", accent: "#FFD66B", accent2: "#E8456B" },
  "safari-earth":       { bg: "#F3EEDF", bg2: "#E8E0C6", ink: "#3E3522", muted: "#7A6B45", accent: "#C0742F", accent2: "#5F7A4A" },
  "sky-cloud":          { bg: "#EEF3FB", bg2: "#E4ECF9", ink: "#2E3A5C", muted: "#7E8FBD", accent: "#C9A567", accent2: "#A8BEE8" },
  "terracotta-heritage":{ bg: "#F4E7D8", bg2: "#E9D3B8", ink: "#4A2A18", muted: "#8A5A36", accent: "#B5541F", accent2: "#D4AF5E" },
  "rangoli-multicolor": { bg: "#FFF8ED", bg2: "#FDEFD8", ink: "#3A1F0E", muted: "#A9752E", accent: "#E0632B", accent2: "#2E8B82" },
  "forest-home":        { bg: "#F5F1E6", bg2: "#2F3B2E", ink: "#243122", muted: "#5C6E52", accent: "#B8922A", accent2: "#8BA07A" },
  "terrace-nightsky":   { bg: "#0E1326", bg2: "#1A2140", ink: "#FFF6DE", muted: "#F4D06F", accent: "#F4D06F", accent2: "#6B7FD7" },
  "corporate-navy":     { bg: "#0F1E3D", bg2: "#16294F", ink: "#F2F5FA", muted: "#9FB2D9", accent: "#D4AF5E", accent2: "#5B8DEF" },
  "academic-gold-navy": { bg: "#0D1B33", bg2: "#152748", ink: "#F6EFD8", muted: "#C9AD6B", accent: "#E7C25C", accent2: "#D4AF5E" },
  "vip-black-gold":     { bg: "#0A0A0A", bg2: "#181818", ink: "#F3E6C4", muted: "#8A7A52", accent: "#D4AF5E", accent2: "#F0D98C" },
  "dusty-blue-emotion": { bg: "#EEF1F4", bg2: "#DCE3EA", ink: "#38454F", muted: "#7E8C96", accent: "#B8922A", accent2: "#8FA6B8" },
  "amber-retirement":   { bg: "#FBF1DF", bg2: "#F3E2BD", ink: "#4A3214", muted: "#8C6A33", accent: "#C47A2E", accent2: "#D4AF5E" },
  "diwali-maroon-gold": { bg: "#2B0F10", bg2: "#45161A", ink: "#F8E7C4", muted: "#D4AF5E", accent: "#E88A2E", accent2: "#D4AF5E" },
  "holi-rainbow":       { bg: "#FFFBF2", bg2: "#FFF0E0", ink: "#3A2A1A", muted: "#9B7450", accent: "#E0632B", accent2: "#2E8B82" },
  "garba-vibrant":      { bg: "#3B0F14", bg2: "#53161C", ink: "#FDECC8", muted: "#E8A64A", accent: "#E8456B", accent2: "#D4AF5E" },
  "wedding-ivory-gold": { bg: "#FBF6EC", bg2: "#F3E8CF", ink: "#3A2412", muted: "#8A5A2E", accent: "#B5812E", accent2: "#D4AF5E" },
  "wedding-blush-modern":{ bg: "#FFFBF9", bg2: "#FBEEEE", ink: "#3A2A2A", muted: "#9C7A78", accent: "#C98A5E", accent2: "#D8A6A0" },
};

export const FONT_PAIRS = {
  "serif-display":  { heading: "'Playfair Display', Georgia, serif", body: "'Cormorant Garamond', Georgia, serif", label: "'Outfit', sans-serif" },
  "script-elegant":  { heading: "'Great Vibes', 'Dancing Script', cursive", body: "'Cormorant Garamond', Georgia, serif", label: "'Outfit', sans-serif" },
  "modern-sans":     { heading: "'Outfit', sans-serif", body: "'Outfit', sans-serif", label: "'Outfit', sans-serif" },
  "rounded-playful":  { heading: "'Fredoka', 'Outfit', sans-serif", body: "'Outfit', sans-serif", label: "'Outfit', sans-serif" },
  "serif-heritage":  { heading: "'DM Serif Display', Georgia, serif", body: "'Outfit', sans-serif", label: "'Outfit', sans-serif" },
  "script-casual":   { heading: "'Caveat', 'Dancing Script', cursive", body: "'Outfit', sans-serif", label: "'Outfit', sans-serif" },
  "condensed-bold":  { heading: "'Oswald', 'Outfit', sans-serif", body: "'Outfit', sans-serif", label: "'Outfit', sans-serif" },
  "fraunces-editorial":{ heading: "'Fraunces', Georgia, serif", body: "'Outfit', sans-serif", label: "'Outfit', sans-serif" },
  "classic-serif-formal":{ heading: "'Cormorant Garamond', Georgia, serif", body: "'Outfit', sans-serif", label: "'Outfit', sans-serif" },
  "display-festive": { heading: "'Yeseva One', Georgia, serif", body: "'Outfit', sans-serif", label: "'Outfit', sans-serif" },
};

// Loaded once by the Studio pages — fonts not already pulled in elsewhere.
export const STUDIO_GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Dancing+Script:wght@600&family=Fredoka:wght@500;600&family=DM+Serif+Display&family=Caveat:wght@600&family=Oswald:wght@500;600&family=Fraunces:wght@600;700&family=Yeseva+One&display=swap";

// Per-kit curated alternates offered in the style panel — swapping only
// within combinations vetted to stay readable against that kit's artwork
// (never an open picker). Every kit lists itself first (= the template
// default) so "no change" is always option 0.
export const KIT_PALETTE_OPTIONS = {
  elegantSerif: ["cream-gold", "sage-botanical", "wedding-ivory-gold"],
  luxuryDarkGold: ["royal-maroon-gold", "vip-black-gold", "diwali-maroon-gold"],
  modernEditorial: ["charcoal-editorial", "corporate-navy", "academic-gold-navy"],
  illustratedPlayful: ["confetti-coral", "holi-rainbow", "pastel-teddy-brown"],
  botanicalFloral: ["sage-botanical", "blush-pink-gold", "wedding-blush-modern"],
  royalFrame: ["navy-gold", "royal-maroon-gold", "academic-gold-navy"],
  celestialStars: ["midnight-purple", "navy-gold", "sky-cloud"],
  safariAnimal: ["safari-earth", "sage-botanical", "pastel-teddy-brown"],
  pastelClouds: ["sky-cloud", "pastel-teddy-brown", "blush-pink-gold"],
  traditionalIndian: ["terracotta-heritage", "rangoli-multicolor", "royal-maroon-gold"],
  teaVintage: ["pastel-teddy-brown", "blush-pink-gold", "cream-gold"],
  corporateMinimal: ["corporate-navy", "charcoal-editorial", "academic-gold-navy"],
  heritageOrnate: ["terracotta-heritage", "royal-maroon-gold", "wedding-ivory-gold"],
  natureOrganic: ["sage-botanical", "safari-earth", "forest-home"],
  neonVipDark: ["vip-black-gold", "midnight-purple", "garba-vibrant"],
  achievementBadge: ["academic-gold-navy", "corporate-navy", "amber-retirement"],
};

export const KIT_FONT_OPTIONS = {
  elegantSerif: ["serif-display", "fraunces-editorial", "classic-serif-formal"],
  luxuryDarkGold: ["serif-display", "classic-serif-formal", "display-festive"],
  modernEditorial: ["modern-sans", "fraunces-editorial", "condensed-bold"],
  illustratedPlayful: ["rounded-playful", "script-casual", "modern-sans"],
  botanicalFloral: ["script-elegant", "serif-display", "fraunces-editorial"],
  royalFrame: ["serif-display", "classic-serif-formal", "display-festive"],
  celestialStars: ["serif-display", "modern-sans", "fraunces-editorial"],
  safariAnimal: ["rounded-playful", "modern-sans", "script-casual"],
  pastelClouds: ["script-casual", "serif-display", "rounded-playful"],
  traditionalIndian: ["display-festive", "serif-heritage", "classic-serif-formal"],
  teaVintage: ["script-casual", "serif-display", "script-elegant"],
  corporateMinimal: ["modern-sans", "condensed-bold", "classic-serif-formal"],
  heritageOrnate: ["serif-heritage", "display-festive", "classic-serif-formal"],
  natureOrganic: ["serif-display", "modern-sans", "script-elegant"],
  neonVipDark: ["condensed-bold", "modern-sans", "display-festive"],
  achievementBadge: ["classic-serif-formal", "modern-sans", "condensed-bold"],
};

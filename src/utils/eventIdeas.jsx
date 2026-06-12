import React from "react";

const font = "'Outfit', sans-serif";

export const EVENT_IDEAS = {
  "Birthday": {
    themes: ["Bollywood Night", "Garden Party", "Vintage Hollywood"],
    mustHave: ["Cake + balloon arch", "Photographer"],
    tip: "Book weekend venues 3-4 weeks ahead",
  },
  "1st Birthday": {
    themes: ["Jungle Safari", "Pastel Rainbow", "Under the Sea"],
    mustHave: ["Smash cake session", "Return gifts for kids"],
    tip: "Keep it 2-3 hrs — toddlers tire quickly",
  },
  "Baby Shower": {
    themes: ["Floral Garden", "Twinkle Little Star", "Safari"],
    mustHave: ["Games host", "Mocktail bar", "Gift table"],
    tip: "Keep seating comfortable — mom-to-be stands longest",
  },
  "Newborn Welcome": {
    themes: ["Traditional Puja", "Floral Naming"],
    mustHave: ["Pandit", "Sweets + full meal catering"],
    tip: "Morning or early afternoon, max 3 hours",
  },
  "Anniversary": {
    themes: ["Golden Evening", "Garden Romance", "Decade Throwback"],
    mustHave: ["Couple photographer", "Milestone cake"],
    tip: "Old photo slideshow — always the biggest hit",
  },
  "Housewarming": {
    themes: ["Griha Pravesh", "Modern Open House"],
    mustHave: ["Pandit for pooja", "Flowers", "Snack catering"],
    tip: "Guests bring gifts — keep a dedicated table near entry",
  },
  "Graduation": {
    themes: ["Future is Bright", "Black & Gold", "World Map"],
    mustHave: ["Photo booth", "Memory collage", "Milestone cake"],
    tip: "Plan party after the official ceremony ends",
  },
  "Get-together": {
    themes: ["Rooftop Night", "Game Night", "Potluck"],
    mustHave: ["Music", "Enough seating", "Snacks + drinks"],
    tip: "Assign a theme color — makes group photos look great",
  },
  "Office Party": {
    themes: ["Awards Gala", "Casino Evening", "Cultural Fusion"],
    mustHave: ["Varied menu (veg + non-veg)", "Group activity"],
    tip: "Pick games everyone can join regardless of role or age",
  },
  "Pre Wedding": {
    themes: ["Mehendi (floral)", "Sangeet (Bollywood)", "Haldi (yellow)"],
    mustHave: ["DJ for Sangeet", "Flower decor", "Photographer"],
    tip: "Coordinate guest outfit colors per function in the invite",
  },
  "Festival": {
    themes: ["Diwali (lights)", "Holi (colors)", "Navratri (garba)"],
    mustHave: ["Theme decor", "Traditional food", "Cultural activity"],
    tip: "Book vendors 4-6 weeks out — everyone books the same dates",
  },
  "Corporate Event": {
    themes: ["Awards Night", "Team Building Day", "Annual Gala"],
    mustHave: ["AV setup", "MC/host", "Varied menu"],
    tip: "Label dietary options clearly — Jain, vegan, non-veg separately",
  },
};

export function EventIdeasPanel({ eventType, style = {} }) {
  const ideas = EVENT_IDEAS[eventType];
  if (!ideas) return null;
  return (
    <div style={{ marginTop: 10, padding: "12px 14px", background: "rgba(196,122,46,0.05)", borderRadius: 12, border: "1px solid rgba(196,122,46,0.15)", fontFamily: font, ...style }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>✨ Ideas for {eventType}</div>
      <div style={{ fontSize: 12, color: "#3D2210", marginBottom: 5, lineHeight: 1.6 }}>
        <span style={{ fontWeight: 700 }}>Themes — </span>{ideas.themes.join(" · ")}
      </div>
      <div style={{ fontSize: 12, color: "#3D2210", marginBottom: 5, lineHeight: 1.6 }}>
        <span style={{ fontWeight: 700 }}>Must-have — </span>{ideas.mustHave.join(", ")}
      </div>
      <div style={{ fontSize: 11.5, color: "#9B7450", fontStyle: "italic" }}>💡 {ideas.tip}</div>
    </div>
  );
}

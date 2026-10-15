/* Decor focus areas — the 8 "places" decor can cover. Shared between the
   Plan-an-Occasion Decorator panel (OccasionDetail.jsx) and the You-Do-It /
   Let-Us-Do-It wizard (EventPlanning.jsx) so Decorator asks the same thing
   in both flows. */
export const DECOR_FOCUS_AREAS = {
  "entrance":        { name:"Entrance Decor",              tagline:"The first impression",             emoji:"🚪", items:["Welcome board","Balloon arch","Entrance pillars","Floral arch","Character cutouts","Decorated pathway"] },
  "stage-backdrop":  { name:"Stage & Backdrop Decor",       tagline:"The main focal point",              emoji:"🎭", items:["Main backdrop","Balloon garlands","Name signage","Cake table setup","Stage props","Milestone-number display"] },
  "ceiling-draping": { name:"Ceiling & Draping",            tagline:"Transforms the venue atmosphere",   emoji:"🎪", items:["Ceiling fabric drape","Fairy-light canopy","Hanging installations","Streamers","Overhead decor elements"] },
  "hall-space":      { name:"Hall & Space Decor",           tagline:"Decor throughout the venue",        emoji:"🏛️", items:["Balloon pillars","Wall decorations","Decorative columns","Aisle styling","Corner installations","Coordinated venue styling"] },
  "table-seating":   { name:"Table & Seating Decor",        tagline:"Guest dining and seating areas",    emoji:"🍽️", items:["Table centrepieces","Table runners","Chair covers","Floral table arrangements","Decorative table settings"] },
  "photo-booth":     { name:"Photo Booth & Selfie Points",  tagline:"Designed for photographs",          emoji:"🤳", items:["Selfie wall","Themed props","Neon signs","Standees","Dedicated photo corner"] },
  "personalised":    { name:"Personalised Decor & Props",   tagline:"Makes the celebration personal",    emoji:"✨", items:["Custom name board","Age / milestone numbers","Character cutouts","Themed props","Welcome sign"] },
  "lighting":        { name:"Lighting & Decorative Effects",tagline:"Creates the mood",                  emoji:"💡", items:["Fairy lights","LED lighting","Uplighting","Decorative lanterns","Candles","Illuminated installations"] },
};
export const DECOR_FOCUS_AREA_IDS = Object.keys(DECOR_FOCUS_AREAS);

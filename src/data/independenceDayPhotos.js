// Independence Day decoration reference photo database
// venueTypes: "room" | "hall" | "terrace" | "garden" | "office" | "roadside"
// style: "grand" | "festive" | "minimal" | "outdoor"

export const INDEPENDENCE_DAY_PHOTOS = [
  // ── HALL ─────────────────────────────────────────────────────────────────
  {
    id: "hall_01",
    url: "https://picsum.photos/seed/indday_hall1/600/400",
    title: "Tricolor Stage Backdrop",
    description: "Grand saffron-white-green backdrop with Ashoka Chakra centrepiece and LED border lighting",
    themes: ["backdrop", "tricolor", "led", "stage"],
    venueTypes: ["hall"],
    style: "grand",
  },
  {
    id: "hall_02",
    url: "https://picsum.photos/seed/indday_hall2/600/400",
    title: "Grand Balloon Arch Entrance",
    description: "Massive tricolor balloon arch framing hall entrance, with flag bunting draped on sides",
    themes: ["balloon", "arch", "tricolor", "entrance"],
    venueTypes: ["hall"],
    style: "grand",
  },
  {
    id: "hall_03",
    url: "https://picsum.photos/seed/indday_hall3/600/400",
    title: "Chandelier with Tricolor Ribbons",
    description: "Chandelier wrapped with saffron, white and green ribbon cascades and mini flag garlands",
    themes: ["chandelier", "ribbon", "tricolor", "ceiling"],
    venueTypes: ["hall"],
    style: "festive",
  },
  {
    id: "hall_04",
    url: "https://picsum.photos/seed/indday_hall4/600/400",
    title: "Marigold Floral Stage",
    description: "Stage flanked with marigold and white jasmine pillars in patriotic colour palette",
    themes: ["floral", "marigold", "stage", "pillar"],
    venueTypes: ["hall"],
    style: "grand",
  },

  // ── ROOM ─────────────────────────────────────────────────────────────────
  {
    id: "room_01",
    url: "https://picsum.photos/seed/indday_room1/600/400",
    title: "Corner Tricolor Balloon Cluster",
    description: "Floor-to-ceiling balloon cluster in saffron, white and green for a cosy corner",
    themes: ["balloon", "corner", "tricolor", "cluster"],
    venueTypes: ["room"],
    style: "festive",
  },
  {
    id: "room_02",
    url: "https://picsum.photos/seed/indday_room2/600/400",
    title: "Window Flag Bunting",
    description: "Miniature Indian flag bunting draped across windows with fairy lights",
    themes: ["bunting", "flag", "window", "fairy lights"],
    venueTypes: ["room", "office"],
    style: "minimal",
  },
  {
    id: "room_03",
    url: "https://picsum.photos/seed/indday_room3/600/400",
    title: "Tricolor Table Centrepiece",
    description: "Table centrepiece with saffron roses, white lilies and green leaves in a tricolor vase",
    themes: ["floral", "table", "centrepiece", "tricolor"],
    venueTypes: ["room", "hall", "office"],
    style: "minimal",
  },
  {
    id: "room_04",
    url: "https://picsum.photos/seed/indday_room4/600/400",
    title: "Ashoka Chakra Wall Art",
    description: "Hand-crafted Ashoka Chakra mounted on a white wall with tricolor petal border",
    themes: ["wall art", "ashoka chakra", "floral", "tricolor"],
    venueTypes: ["room", "office"],
    style: "minimal",
  },

  // ── TERRACE ──────────────────────────────────────────────────────────────
  {
    id: "terrace_01",
    url: "https://picsum.photos/seed/indday_terrace1/600/400",
    title: "String Lights Canopy",
    description: "Criss-cross string lights canopy over terrace with tricolor balloon clusters at poles",
    themes: ["string lights", "canopy", "balloon", "tricolor"],
    venueTypes: ["terrace"],
    style: "festive",
  },
  {
    id: "terrace_02",
    url: "https://picsum.photos/seed/indday_terrace2/600/400",
    title: "Rooftop Patriotic Setup",
    description: "Rooftop stage with saffron-white-green draping, fairy lights and flag backdrop",
    themes: ["stage", "draping", "fairy lights", "flag"],
    venueTypes: ["terrace"],
    style: "grand",
  },
  {
    id: "terrace_03",
    url: "https://picsum.photos/seed/indday_terrace3/600/400",
    title: "Terrace Balloon Arch",
    description: "Open-air balloon arch in tricolor perfect for flag hoisting ceremonies on terrace",
    themes: ["balloon", "arch", "outdoor", "tricolor"],
    venueTypes: ["terrace", "garden"],
    style: "festive",
  },
  {
    id: "terrace_04",
    url: "https://picsum.photos/seed/indday_terrace4/600/400",
    title: "Flag Bunting with Fairy Lights",
    description: "Rows of Indian flag buntings strung across the terrace with warm fairy lights",
    themes: ["bunting", "flag", "fairy lights", "outdoor"],
    venueTypes: ["terrace", "garden"],
    style: "minimal",
  },

  // ── GARDEN / PARK ────────────────────────────────────────────────────────
  {
    id: "garden_01",
    url: "https://picsum.photos/seed/indday_garden1/600/400",
    title: "Garden Pavilion Stage",
    description: "Open garden stage with tricolor draping, marigold borders and flag display",
    themes: ["stage", "draping", "marigold", "outdoor"],
    venueTypes: ["garden"],
    style: "grand",
  },
  {
    id: "garden_02",
    url: "https://picsum.photos/seed/indday_garden2/600/400",
    title: "Tree-Mounted Flag Decoration",
    description: "Trees adorned with Indian flags, marigold garlands and patriotic satin ribbons",
    themes: ["flag", "marigold", "garland", "outdoor"],
    venueTypes: ["garden"],
    style: "outdoor",
  },
  {
    id: "garden_03",
    url: "https://picsum.photos/seed/indday_garden3/600/400",
    title: "Tricolor Flower Path",
    description: "Walkway lined with saffron marigold, white jasmine and green leaf petal arrangements",
    themes: ["floral", "pathway", "marigold", "tricolor"],
    venueTypes: ["garden"],
    style: "outdoor",
  },
  {
    id: "garden_04",
    url: "https://picsum.photos/seed/indday_garden4/600/400",
    title: "Flag Hoisting Ceremony Setup",
    description: "Formal flag hoisting area with tricolor canopy, seating arrangements and floral border",
    themes: ["flag hoisting", "canopy", "formal", "outdoor"],
    venueTypes: ["garden", "roadside"],
    style: "grand",
  },

  // ── OFFICE ───────────────────────────────────────────────────────────────
  {
    id: "office_01",
    url: "https://picsum.photos/seed/indday_office1/600/400",
    title: "Office Reception Balloon Display",
    description: "Reception desk with tricolor balloon column, mini flags and marigold vase",
    themes: ["balloon", "reception", "tricolor", "office"],
    venueTypes: ["office"],
    style: "festive",
  },
  {
    id: "office_02",
    url: "https://picsum.photos/seed/indday_office2/600/400",
    title: "Desk Patriotic Arrangement",
    description: "Individual desk setup with mini Indian flag, small tricolor balloon and marigold sprig",
    themes: ["desk", "flag", "balloon", "minimal"],
    venueTypes: ["office"],
    style: "minimal",
  },
  {
    id: "office_03",
    url: "https://picsum.photos/seed/indday_office3/600/400",
    title: "Conference Room Bunting",
    description: "Meeting room with tricolor bunting across walls, potted plants and Indian flag display",
    themes: ["bunting", "conference", "flag", "tricolor"],
    venueTypes: ["office"],
    style: "minimal",
  },
  {
    id: "office_04",
    url: "https://picsum.photos/seed/indday_office4/600/400",
    title: "Lobby Entrance Arch",
    description: "Corporate lobby with tricolor balloon arch, national flag standees and marigold garland",
    themes: ["arch", "balloon", "lobby", "entrance"],
    venueTypes: ["office", "hall"],
    style: "festive",
  },

  // ── ROADSIDE ─────────────────────────────────────────────────────────────
  {
    id: "roadside_01",
    url: "https://picsum.photos/seed/indday_road1/600/400",
    title: "Community Gate Arch",
    description: "Society gate arch with marigold-flag bunting, tricolor balloons and welcome banner",
    themes: ["arch", "gate", "marigold", "community"],
    venueTypes: ["roadside"],
    style: "festive",
  },
  {
    id: "roadside_02",
    url: "https://picsum.photos/seed/indday_road2/600/400",
    title: "Street Tricolor Lights",
    description: "Street poles decorated with tricolor LED strips, flag buntings and hanging lanterns",
    themes: ["led", "street", "flag", "tricolor"],
    venueTypes: ["roadside"],
    style: "grand",
  },
  {
    id: "roadside_03",
    url: "https://picsum.photos/seed/indday_road3/600/400",
    title: "Community Pandal Setup",
    description: "Open-air pandal with tricolor draping, stage and patriotic banner display",
    themes: ["pandal", "stage", "draping", "community"],
    venueTypes: ["roadside", "garden"],
    style: "outdoor",
  },
  {
    id: "roadside_04",
    url: "https://picsum.photos/seed/indday_road4/600/400",
    title: "Flag Hoisting Open Area",
    description: "Open roadside area with formal flag hoisting post, tricolor floral border and speaker setup",
    themes: ["flag hoisting", "outdoor", "formal", "community"],
    venueTypes: ["roadside", "garden"],
    style: "outdoor",
  },
];

// Get photos matching a specific venue type
export function getPhotosByVenue(venueType) {
  if (!venueType) return INDEPENDENCE_DAY_PHOTOS;
  return INDEPENDENCE_DAY_PHOTOS.filter((p) => p.venueTypes.includes(venueType));
}

// Get photos matching a list of theme keywords
export function getPhotosByThemes(themes = []) {
  if (!themes.length) return INDEPENDENCE_DAY_PHOTOS;
  const lower = themes.map((t) => t.toLowerCase());
  return INDEPENDENCE_DAY_PHOTOS.filter((p) =>
    p.themes.some((t) => lower.some((kw) => t.includes(kw)))
  );
}

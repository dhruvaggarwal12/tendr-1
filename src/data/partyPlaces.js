// Party Places data — admin preview only
// Photos from Unsplash, all data curated for demo

export const PLACE_TYPES = [
  { id: "all",   label: "All",   icon: "🏠" },
  { id: "villa", label: "Villa", icon: "🏡" },
  { id: "flat",  label: "Flat",  icon: "🏢" },
];

export const PARTY_PLACES = [
  // ── VILLA ──────────────────────────────────────────────────────────────────
  {
    id: "green-meadows-villa",
    type: "villa",
    name: "Green Meadows Villa",
    tagline: "A lush private villa with sprawling lawns for celebrations",
    location: "Sector 126, Noida",
    area: "4,200 sq ft + 6,000 sq ft lawn",
    minGuests: 30, maxGuests: 180,
    roomPrice: 18000,
    serviceCharge: 2500,
    coverPhoto: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    ],
    parking: { available: true, spots: 40 },
    allowedServices: ["Decoration", "Catering", "Photography", "DJ"],
    bhk: "5 BHK",
    checkIn: "9:00 AM",
    checkOut: "11:00 PM",
    caretaker: true,
    securityGuard: true,
    amenities: ["Private lawn", "Swimming pool", "2 halls", "Parking for 40 cars", "Generator backup", "Air-conditioned rooms", "Changing rooms"],
    rules: [
      "Music to be stopped by 11:00 PM",
      "No outside alcohol — bar services available through us",
      "Smoking only in designated outdoor areas",
      "Damage deposit of ₹10,000 required at check-in",
      "No outside catering — kitchen available for Tendr caterers only",
      "Decoration must be completed by 2 hours before event start",
      "Garbage disposal is the responsibility of the booking party",
      "Maximum capacity of 180 guests strictly enforced",
      "Parking for up to 40 cars within premises",
    ],
    packages: {
      Decoration: [
        { id: "dec-basic", name: "Bloom Basic", price: 8000, includes: ["80 balloons in 2 colours", "Welcome arch (balloon)", "Happy Birthday / Event banner", "Table centrepieces (5 tables)", "Fairy lights (basic)"] },
        { id: "dec-garden", name: "Garden Party", price: 18000, includes: ["Fresh flower arrangements", "Floral arch at entrance", "Table settings with flowers", "Fairy lights throughout lawn", "Photo backdrop with florals", "Candle lanterns (20 pcs)"] },
        { id: "dec-premium", name: "Royal Affair", price: 35000, includes: ["Full venue draping", "LED uplighting (8 points)", "Premium floral centrepieces", "Custom neon sign with name", "Balloon ceiling installation", "Photo booth setup", "Welcome aisle with flowers"] },
      ],
      Catering: [
        { id: "cat-veg50", name: "Veg Delight (50 pax)", price: 22000, includes: ["3 starters", "2 main curries", "Dal & paneer", "Rice & 3 breads", "2 desserts", "Soft drinks (unlimited)"] },
        { id: "cat-nonveg50", name: "Non-Veg Feast (50 pax)", price: 30000, includes: ["4 starters (veg + non-veg)", "Chicken & mutton curry", "Biryani", "Dal & paneer", "Rice & breads", "2 desserts", "Soft drinks (unlimited)"] },
        { id: "cat-live100", name: "Live Counter (100 pax)", price: 55000, includes: ["Live chaat counter", "Live dosa station", "3 main dishes", "Biryani station", "Tandoori section", "Dessert counter", "Mocktail bar"] },
      ],
      Photography: [
        { id: "photo-2hr", name: "2-Hour Coverage", price: 6000, includes: ["1 photographer", "150+ edited photos", "Online delivery (48 hrs)", "Basic editing"] },
        { id: "photo-5hr", name: "5-Hour Full Event", price: 12000, includes: ["1 photographer + assistant", "400+ edited photos", "Same-day highlights reel (30 photos)", "Premium editing", "USB delivery"] },
        { id: "photo-fullday", name: "Full Day + Videography", price: 22000, includes: ["2 photographers", "1 videographer", "600+ edited photos", "3-minute highlight video", "Cinematic edit", "Premium album (50 pages)"] },
      ],
      DJ: [
        { id: "dj-3hr", name: "DJ + Basic Sound (3 hrs)", price: 8000, includes: ["Professional DJ", "2 speakers (JBL)", "Basic lighting", "Playlist coordination", "Mic for announcements"] },
        { id: "dj-5hr", name: "DJ + Premium Setup (5 hrs)", price: 15000, includes: ["Professional DJ", "4 speakers + subwoofer", "LED dance floor lights", "Fog machine", "Wireless mic", "Custom playlist", "LED par lights (8 pcs)"] },
        { id: "dj-full", name: "Full Party Package (8 hrs)", price: 25000, includes: ["Professional DJ", "Full speaker array (1000W)", "Laser + LED lighting", "Smoke + bubble machine", "Wireless mics (2)", "Live requests", "LED strip backdrop", "Strobe lights"] },
      ],
    },
  },

  {
    id: "sunset-villa-retreat",
    type: "villa",
    name: "Sunset Villa Retreat",
    tagline: "Elegant private villa with pool and open terrace",
    location: "Sector 50, Noida",
    area: "3,500 sq ft + rooftop terrace",
    minGuests: 20, maxGuests: 100,
    roomPrice: 14000,
    serviceCharge: 2000,
    coverPhoto: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    ],
    parking: { available: true, spots: 20 },
    allowedServices: ["Decoration", "Catering", "Photography", "DJ"],
    bhk: "3 BHK",
    checkIn: "11:00 AM",
    checkOut: "10:30 PM",
    caretaker: true,
    securityGuard: false,
    amenities: ["Private pool", "Rooftop terrace", "Modular kitchen", "AC rooms (3)", "Parking for 20 cars", "Garden area"],
    rules: [
      "Music must stop by 10:30 PM",
      "Pool area accessible only till 9 PM",
      "No smoking indoors",
      "Outside food allowed only with prior permission",
      "Damage deposit of ₹8,000 required",
      "Maximum 100 guests",
    ],
    packages: {
      Decoration: [
        { id: "dec-minimal", name: "Minimal Chic", price: 5000, includes: ["50 balloons", "Printed banner", "Table flowers (3 tables)", "Fairy lights"] },
        { id: "dec-pool", name: "Pool Party Decor", price: 14000, includes: ["Floating pool flowers", "Tropical theme setup", "Tiki torches (8)", "Balloon arch", "String lights", "Welcome board"] },
        { id: "dec-terrace", name: "Rooftop Elegance", price: 22000, includes: ["Fairy light canopy", "Floral centrepieces", "Candle arrangement", "Draping for terrace railing", "Flower arch", "Neon sign"] },
      ],
      Catering: [
        { id: "cat-small", name: "Intimate Veg (30 pax)", price: 13000, includes: ["2 starters", "2 mains", "Dal + rice", "2 breads", "Dessert", "Drinks"] },
        { id: "cat-nonveg30", name: "Non-Veg (30 pax)", price: 18000, includes: ["3 starters", "Chicken main", "Dal + rice", "Breads", "2 desserts", "Drinks"] },
      ],
      Photography: [
        { id: "photo-2hr", name: "2-Hour Coverage", price: 5500, includes: ["1 photographer", "120+ edited photos", "Online delivery"] },
        { id: "photo-4hr", name: "4-Hour Event", price: 10000, includes: ["1 photographer", "300+ edited photos", "Highlights album", "Premium editing"] },
      ],
      DJ: [
        { id: "dj-2hr", name: "DJ Starter (2 hrs)", price: 6000, includes: ["DJ", "2 JBL speakers", "Basic lights", "Mic"] },
        { id: "dj-4hr", name: "Pool Party Set (4 hrs)", price: 11000, includes: ["DJ", "4 speakers", "LED party lights", "Wireless mic", "Smoke machine"] },
      ],
    },
  },

  // ── FARM HOUSE ─────────────────────────────────────────────────────────────
  {
    id: "sunrise-farmhouse",
    type: "farmhouse",
    name: "Sunrise Farmhouse",
    tagline: "Sprawling farmhouse with open grounds for large gatherings",
    location: "Crossings Republik, Ghaziabad",
    area: "12,000 sq ft + 2 acres open grounds",
    minGuests: 80, maxGuests: 400,
    roomPrice: 35000,
    serviceCharge: 5000,
    coverPhoto: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800&q=80",
      "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800&q=80",
      "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800&q=80",
      "https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=800&q=80",
    ],
    amenities: ["2 acres open lawn", "Indoor banquet hall (200 pax)", "Stage setup", "Generator backup", "Parking for 100 cars", "Getting-ready rooms (4)", "Outdoor fire pit area"],
    rules: [
      "Music allowed till midnight",
      "Fireworks with prior permission only",
      "No alcohol without license",
      "Damage deposit of ₹25,000 required",
      "Setup can begin 1 day before event",
      "All waste must be cleared by next morning",
      "Maximum 400 guests in combined indoor + outdoor",
    ],
    packages: {
      Decoration: [
        { id: "dec-outdoor", name: "Outdoor Fiesta", price: 22000, includes: ["String lights across lawn", "Balloon arch at entrance", "Table centrepieces (10 tables)", "Flower pathway", "Stage backdrop", "Lanterns (30 pcs)"] },
        { id: "dec-grand", name: "Grand Celebration", price: 55000, includes: ["Full stage decoration", "LED wash lighting on grounds", "Floral entrance gate", "Mandap or theme backdrop", "Draping for all tables", "Photo zone with props", "Balloon ceiling inside hall", "Custom monogram"] },
        { id: "dec-wedding", name: "Premium Wedding Style", price: 95000, includes: ["Full venue decoration", "Floral mandap", "Aisle setup", "Stage flowers", "LED uplighting (20 points)", "Photo wall", "Floating candles", "Custom neon sign", "Petal pathway"] },
      ],
      Catering: [
        { id: "cat-100veg", name: "Veg Buffet (100 pax)", price: 40000, includes: ["5 starters", "3 main courses", "Biryani", "Dal + rice", "4 breads", "3 desserts", "Live chaat", "Beverages"] },
        { id: "cat-100nonveg", name: "Non-Veg Buffet (100 pax)", price: 55000, includes: ["6 starters (veg + non-veg)", "Chicken + mutton main", "Biryani (2 types)", "Dal + rice", "4 breads", "3 desserts", "Mocktail bar", "Beverages"] },
        { id: "cat-200live", name: "Live Station (200 pax)", price: 95000, includes: ["Full live station setup", "Dosa + chaat counters", "Tandoor section", "Biryani counter", "5 main dishes", "Dessert live counter", "Mocktail + juice bar"] },
      ],
      Photography: [
        { id: "photo-half", name: "Half Day (5 hrs)", price: 18000, includes: ["2 photographers", "500+ edited photos", "Cinematic highlight video (2 min)", "Online gallery"] },
        { id: "photo-full", name: "Full Day Package", price: 32000, includes: ["2 photographers + 1 videographer", "800+ edited photos", "5-min cinematic video", "Candid + portrait shots", "Premium album (80 pages)", "Same-day preview"] },
      ],
      DJ: [
        { id: "dj-event", name: "Event DJ (6 hrs)", price: 20000, includes: ["Professional DJ", "Line array speakers", "Laser lighting", "Fog machine", "Wireless mics (2)", "LED backdrop", "Subwoofer"] },
        { id: "dj-fullnight", name: "Full Night Party (10 hrs)", price: 38000, includes: ["2 DJs (rotation)", "Professional sound system (3000W)", "Full lighting rig", "Confetti machine", "Strobe + UV lights", "Custom playlist", "Live song requests"] },
      ],
    },
  },

  // ── FLAT ───────────────────────────────────────────────────────────────────
  {
    id: "urban-sky-penthouse",
    type: "flat",
    name: "Urban Sky Penthouse",
    tagline: "Premium penthouse with city views for intimate celebrations",
    location: "Sector 18, Noida",
    area: "2,800 sq ft + private balcony",
    minGuests: 10, maxGuests: 50,
    roomPrice: 9500,
    serviceCharge: 1500,
    coverPhoto: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    ],
    parking: { available: true, spots: 5 },
    allowedServices: ["Decoration", "Catering", "Photography", "DJ"],
    bhk: "2 BHK",
    bhkType: "Penthouse",
    floorNumber: 18,
    liftAvailable: true,
    checkIn: "12:00 PM",
    checkOut: "11:00 PM",
    caretaker: false,
    securityGuard: true,
    amenities: ["City view balcony", "Modular kitchen", "2 BHK layout", "Home theatre system", "High-speed WiFi", "Smart lighting", "Parking for 5 cars"],
    rules: [
      "Music to stop by 10:00 PM strictly",
      "No smoking anywhere on premises",
      "Guests limited to 50 maximum",
      "No outside catering — use Tendr partners only",
      "Damage deposit of ₹5,000 required",
      "Decoration pins/tape not allowed on walls",
      "Event must conclude by 11:00 PM",
    ],
    packages: {
      Decoration: [
        { id: "dec-cozy", name: "Cozy & Intimate", price: 3500, includes: ["30 balloons", "Personalised banner", "Fairy lights", "Table flowers (2 tables)", "Photo backdrop (simple)"] },
        { id: "dec-balcony", name: "Balcony Sunset Party", price: 8000, includes: ["String lights on balcony", "Candle arrangement", "Floral table setting", "Welcome board", "Balloon bouquets (5)", "Twinkling star lights"] },
      ],
      Catering: [
        { id: "cat-finger", name: "Finger Food (20 pax)", price: 7000, includes: ["3 snack options", "Mini sandwiches", "Chips & dips", "Soft drinks", "Tea/coffee setup"] },
        { id: "cat-dinner", name: "Sit-Down Dinner (25 pax)", price: 14000, includes: ["2 starters", "2 main curries", "Rice + 2 breads", "Dal", "Dessert", "Soft drinks"] },
      ],
      Photography: [
        { id: "photo-2hr", name: "2-Hour Coverage", price: 4500, includes: ["1 photographer", "100+ edited photos", "Same-day delivery", "Basic editing"] },
      ],
      DJ: [
        { id: "dj-house", name: "House Party Set (3 hrs)", price: 5000, includes: ["DJ + Bluetooth speaker system", "Party lights", "Custom playlist", "No heavy subwoofer (building rules)"] },
      ],
    },
  },

  // ── VENUE HALL ─────────────────────────────────────────────────────────────
  {
    id: "crystal-banquet-hall",
    type: "venue",
    name: "Crystal Banquet Hall",
    tagline: "Classic banquet hall with full amenities for every occasion",
    location: "Indirapuram, Ghaziabad",
    area: "5,000 sq ft air-conditioned hall",
    minGuests: 60, maxGuests: 250,
    roomPrice: 28000,
    serviceCharge: 4000,
    coverPhoto: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    ],
    amenities: ["Full AC hall", "Built-in stage with lights", "Bridal room (2)", "Parking for 60 cars", "Generator backup", "Coat check", "Sound system (built-in)", "Projector screen"],
    rules: [
      "Music permitted till 11:30 PM",
      "Hall access from 10 AM on event day",
      "No outside decorators — use Tendr partners",
      "Damage deposit ₹15,000",
      "Children under 5 not counted in guest count",
      "Photography equipment must be pre-approved",
      "Cooking inside hall not permitted",
    ],
    packages: {
      Decoration: [
        { id: "dec-hall-basic", name: "Hall Essentials", price: 12000, includes: ["Stage backdrop", "Table centrepieces (10 tables)", "Entrance arch", "Aisle flowers", "Stage flowers", "Fairy lights"] },
        { id: "dec-hall-full", name: "Grand Banquet", price: 30000, includes: ["Full hall draping", "LED column lights", "Floral stage", "Aisle setup with flowers", "Photo wall", "Ceiling balloons", "Table draping", "Custom monogram"] },
        { id: "dec-hall-luxury", name: "Luxury Crystal", price: 60000, includes: ["Crystal chandelier rental", "Full venue draping", "Premium floral stage", "LED par can uplighting (16)", "Luxury table settings", "Photo wall + neon", "Welcome floral arch", "Custom centrepieces"] },
      ],
      Catering: [
        { id: "cat-veg100", name: "Veg Package (100 pax)", price: 45000, includes: ["6 starters", "3 main courses", "Biryani", "Dal + rice", "4 breads", "3 desserts", "Chaat counter", "Beverage station"] },
        { id: "cat-nonveg100", name: "Non-Veg Package (100 pax)", price: 60000, includes: ["7 starters", "Chicken + mutton + fish", "Biryani (2 types)", "3 desserts", "Dal + rice", "Beverage station", "Live counter"] },
        { id: "cat-royal", name: "Royal Feast (150 pax)", price: 90000, includes: ["Full live station", "Welcome mocktails", "7 starters", "5 main dishes", "Biryani counter", "Dessert counter", "Tea/coffee station", "Soft drink unlimited"] },
      ],
      Photography: [
        { id: "photo-hall", name: "Event Coverage (6 hrs)", price: 15000, includes: ["2 photographers", "500+ edited photos", "2-min highlight video", "Online gallery", "Printed album (40 pages)"] },
        { id: "photo-hall-full", name: "Full Package", price: 28000, includes: ["2 photographers + 1 videographer", "800+ edited photos", "5-min cinematic video", "Drone shots (if outdoor)", "Premium album", "Same-day previews"] },
      ],
      DJ: [
        { id: "dj-hall-5hr", name: "Banquet DJ (5 hrs)", price: 18000, includes: ["Professional DJ", "Line array speakers (built-in supported)", "Laser + LED lighting", "Wireless mics (3)", "Custom playlist", "MC services"] },
        { id: "dj-hall-full", name: "Full Night (8 hrs)", price: 30000, includes: ["Premium DJ", "Full sound system", "LED dance floor", "Confetti cannon", "Fog + laser", "Strobe + UV", "Live requests"] },
      ],
    },
  },

  // ── TERRACE ────────────────────────────────────────────────────────────────
  {
    id: "delhi-skyline-terrace",
    type: "terrace",
    name: "Delhi Skyline Terrace",
    tagline: "Panoramic city terrace for open-air evening events",
    location: "Connaught Place, Delhi",
    area: "3,200 sq ft open terrace",
    minGuests: 20, maxGuests: 120,
    roomPrice: 22000,
    serviceCharge: 3000,
    coverPhoto: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
      "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800&q=80",
    ],
    amenities: ["360° city view", "Retractable awning", "Bar counter area", "Green wall backdrop", "Premium flooring", "Separate washrooms", "Lift access", "Parking (basement)"],
    rules: [
      "Music to stop at 11:00 PM",
      "Rain cover policy: refund if heavy rain — check cancellation terms",
      "No confetti or glitter (environmental policy)",
      "No open flames",
      "Smoking only in designated area",
      "Damage deposit ₹12,000",
      "Decorations must not damage structure",
    ],
    packages: {
      Decoration: [
        { id: "dec-skyline", name: "Skyline Glow", price: 10000, includes: ["Edison bulb string lights", "Candle centerpieces", "Greenery arrangements", "Welcome signage", "Bar area flowers", "Lounge cushion setup"] },
        { id: "dec-rooftop", name: "Rooftop Luxe", price: 22000, includes: ["Fairy light canopy", "Floral arches (2)", "Premium table settings", "Hanging lanterns", "Photo wall", "Pampas grass decor", "Ambient votives"] },
      ],
      Catering: [
        { id: "cat-cocktail", name: "Cocktail Party (40 pax)", price: 18000, includes: ["6 finger food options", "Live chaat station", "Mini desserts", "Mocktail setup", "Soft drinks unlimited"] },
        { id: "cat-dinner-terrace", name: "Sit-Down Dinner (60 pax)", price: 32000, includes: ["4 starters", "3 main courses", "Biryani", "Breads + rice", "2 desserts", "Beverage station"] },
      ],
      Photography: [
        { id: "photo-golden", name: "Golden Hour (3 hrs)", price: 8000, includes: ["1 photographer", "200+ edited photos", "Sunset portrait session", "Online delivery"] },
        { id: "photo-night", name: "Evening + Night (5 hrs)", price: 14000, includes: ["1 photographer + assistant", "400+ edited photos", "City light backdrop shots", "Highlight reel", "Online gallery"] },
      ],
      DJ: [
        { id: "dj-terrace", name: "Open Air DJ (4 hrs)", price: 12000, includes: ["Professional DJ", "Line array outdoor speakers", "LED lighting", "Wireless mic", "Custom playlist"] },
      ],
    },
  },
];

export const getPlaceById = (id) => PARTY_PLACES.find(p => p.id === id);
export const getPlacesByType = (type) => type === "all" ? PARTY_PLACES : PARTY_PLACES.filter(p => p.type === type);

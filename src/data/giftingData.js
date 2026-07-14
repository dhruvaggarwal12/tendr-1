// Real Indian gift hamper data — Delhi NCR market research 2024–25
// Brands: Blue Tokai, Vahdam, Plum, Juicy Chemistry, Forest Essentials, Ferrero, etc.

export const OCCASIONS = [
  { id: "birthday",        label: "🎂 Birthday" },
  { id: "anniversary",     label: "💍 Anniversary" },
  { id: "thank_you",       label: "🙏 Thank You" },
  { id: "congratulations", label: "🎉 Congratulations" },
  { id: "get_well",        label: "💊 Get Well Soon" },
  { id: "housewarming",    label: "🏠 Housewarming" },
  { id: "baby_shower",     label: "👶 Baby Shower" },
  { id: "corporate",       label: "💼 Corporate" },
  { id: "festival",        label: "🪔 Festival" },
  { id: "farewell",        label: "✈️ Farewell" },
  { id: "just_because",    label: "💛 Just Because" },
];

export const RECIPIENTS = [
  { id: "friend",    label: "👫 Friend" },
  { id: "partner",   label: "❤️ Partner" },
  { id: "parent",    label: "👩 Parent" },
  { id: "sibling",   label: "🤝 Sibling" },
  { id: "colleague", label: "💼 Colleague" },
  { id: "boss",      label: "🎯 Boss / Client" },
  { id: "teacher",   label: "📚 Teacher / Mentor" },
];

export const INTERESTS = [
  { id: "coffee",      label: "☕ Coffee" },
  { id: "tea",         label: "🍵 Tea" },
  { id: "chocolate",   label: "🍫 Chocolate" },
  { id: "skincare",    label: "✨ Skincare" },
  { id: "books",       label: "📚 Books" },
  { id: "wellness",    label: "🧘 Wellness" },
  { id: "plants",      label: "🌿 Plants" },
  { id: "snacks",      label: "🍿 Snacks" },
  { id: "cooking",     label: "🍳 Cooking & Gourmet" },
  { id: "fitness",     label: "💪 Fitness" },
  { id: "home_decor",  label: "🏡 Home Decor" },
  { id: "stationery",  label: "✏️ Stationery" },
];

export const BUDGET_PRESETS = [
  { label: "Under ₹1,000",   min: 300,  max: 1000 },
  { label: "₹1,000–₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500–₹5,000", min: 2500, max: 5000 },
  { label: "₹5,000+",        min: 5000, max: 15000 },
];

// Individual catalog items — real products with real Delhi NCR pricing
export const CATALOG_ITEMS = [
  // ── Coffee & Tea ──────────────────────────────────────────────
  { id: "blue_tokai",      cat: "coffee",     name: "Blue Tokai Attikan Estate Coffee (250g)",   price: [350, 450], emoji: "☕", tags: ["coffee"] },
  { id: "third_wave_drip", cat: "coffee",     name: "Third Wave Drip Bags (Pack of 5)",          price: [250, 350], emoji: "☕", tags: ["coffee"] },
  { id: "sleepy_owl_cold", cat: "coffee",     name: "Sleepy Owl Cold Brew Bags (5pc)",           price: [250, 350], emoji: "☕", tags: ["coffee"] },
  { id: "vahdam_darj",     cat: "tea",        name: "Vahdam Darjeeling First Flush Tea (50g)",   price: [300, 450], emoji: "🍵", tags: ["tea", "wellness"] },
  { id: "bombay_tea",      cat: "tea",        name: "Bombay Tea Co. Assorted Gift Box",          price: [400, 600], emoji: "🍵", tags: ["tea"] },
  { id: "herbal_tea",      cat: "tea",        name: "Organic Green & Herbal Tea Sampler",        price: [250, 400], emoji: "🍵", tags: ["tea", "wellness", "fitness"] },

  // ── Chocolates & Sweets ────────────────────────────────────────
  { id: "belgian_truffles",  cat: "chocolate", name: "Belgian Dark Chocolate Truffles (12pc)",  price: [400, 650], emoji: "🍫", tags: ["chocolate"] },
  { id: "ferrero_rocher",    cat: "chocolate", name: "Ferrero Rocher Collection Box (16pc)",    price: [380, 450], emoji: "🍫", tags: ["chocolate"] },
  { id: "dark_choc_bark",    cat: "chocolate", name: "Dark Chocolate Bark with Sea Salt (200g)",price: [300, 450], emoji: "🍫", tags: ["chocolate"] },
  { id: "bournville_box",    cat: "chocolate", name: "Bournville Rich Dark Chocolate Box",      price: [200, 320], emoji: "🍫", tags: ["chocolate"] },
  { id: "artisan_choc",      cat: "chocolate", name: "Handmade Artisan Chocolates (10pc)",      price: [450, 700], emoji: "🍫", tags: ["chocolate"] },

  // ── Skincare & Beauty ─────────────────────────────────────────
  { id: "plum_travel",       cat: "skincare",  name: "Plum Goodness Skincare Travel Kit (3pc)", price: [350, 500], emoji: "✨", tags: ["skincare"] },
  { id: "juicy_chem_oil",    cat: "skincare",  name: "Juicy Chemistry Rosehip Face Oil (15ml)", price: [450, 600], emoji: "✨", tags: ["skincare"] },
  { id: "dot_key_serum",     cat: "skincare",  name: "Dot & Key Vitamin C Brightening Serum",  price: [400, 550], emoji: "✨", tags: ["skincare"] },
  { id: "forest_essentials",  cat: "skincare", name: "Forest Essentials Mini Moisture Surge",   price: [550, 800], emoji: "✨", tags: ["skincare"] },
  { id: "pilgrim_duo",       cat: "skincare",  name: "Pilgrim SPF 50 Sunscreen + Moisturiser", price: [350, 500], emoji: "✨", tags: ["skincare", "fitness"] },

  // ── Candles & Fragrance ───────────────────────────────────────
  { id: "soy_candle",        cat: "candles",   name: "Soy Wax Scented Candle (180g)",           price: [350, 550], emoji: "🕯️", tags: ["wellness", "home_decor"] },
  { id: "aromatherapy_set",  cat: "candles",   name: "Aromatherapy Candle Set (3 Votives)",     price: [400, 650], emoji: "🕯️", tags: ["wellness", "home_decor"] },
  { id: "reed_diffuser",     cat: "candles",   name: "Reed Diffuser — Sandalwood Rose (100ml)", price: [450, 700], emoji: "🕯️", tags: ["home_decor", "wellness"] },

  // ── Wellness & Self-Care ──────────────────────────────────────
  { id: "epsom_bath",        cat: "wellness",  name: "Lavender Epsom Salt Bath Soak (500g)",    price: [250, 400], emoji: "🧘", tags: ["wellness", "fitness"] },
  { id: "face_mask_set",     cat: "wellness",  name: "Rose Clay Mask + Korean Sheet Mask Set",  price: [300, 450], emoji: "🧘", tags: ["wellness", "skincare"] },
  { id: "jade_roller",       cat: "wellness",  name: "Rose Quartz Gua Sha + Facial Roller Set", price: [350, 550], emoji: "🧘", tags: ["wellness", "skincare"] },
  { id: "silk_eye_mask",     cat: "wellness",  name: "Mulberry Silk Sleep Eye Mask",            price: [200, 350], emoji: "🧘", tags: ["wellness"] },
  { id: "himalayan_scrub",   cat: "wellness",  name: "Himalayan Pink Salt Body Scrub (200g)",   price: [250, 400], emoji: "🧘", tags: ["wellness"] },

  // ── Books & Stationery ────────────────────────────────────────
  { id: "atomic_habits",     cat: "books",     name: "Atomic Habits — James Clear",             price: [350, 450], emoji: "📚", tags: ["books"] },
  { id: "psych_money",       cat: "books",     name: "The Psychology of Money — Morgan Housel", price: [350, 450], emoji: "📚", tags: ["books"] },
  { id: "ikigai_book",       cat: "books",     name: "Ikigai — The Japanese Secret to a Long Life", price: [250, 380], emoji: "📚", tags: ["books", "wellness"] },
  { id: "leuchtturm",        cat: "stationery",name: "Leuchtturm1917 Notebook A5 (Dotted)",    price: [700, 900], emoji: "✏️", tags: ["stationery", "books"] },
  { id: "artisan_journal",   cat: "stationery",name: "Handmade Artisan Journal (A5)",           price: [350, 550], emoji: "✏️", tags: ["stationery"] },
  { id: "premium_pen_set",   cat: "stationery",name: "Parker / Pilot Premium Pen Set (2pc)",   price: [400, 650], emoji: "✏️", tags: ["stationery"] },

  // ── Home & Kitchen ────────────────────────────────────────────
  { id: "ceramic_mug",       cat: "home",      name: "Handcrafted Ceramic Mug (350ml)",         price: [350, 550], emoji: "🏡", tags: ["coffee", "tea", "home_decor"] },
  { id: "coaster_set",       cat: "home",      name: "Wooden Coaster Set (4pc)",                price: [300, 500], emoji: "🏡", tags: ["home_decor"] },
  { id: "bamboo_board",      cat: "home",      name: "Artisanal Bamboo Serving Board",          price: [500, 800], emoji: "🏡", tags: ["cooking", "home_decor"] },
  { id: "organic_honey",     cat: "home",      name: "Raw Organic Multiflower Honey (250g)",    price: [300, 500], emoji: "🍯", tags: ["cooking", "wellness", "tea"] },
  { id: "succulent",         cat: "plants",    name: "Mini Succulents Set (3pc) with Planters", price: [250, 450], emoji: "🌿", tags: ["plants", "home_decor"] },

  // ── Snacks & Gourmet ──────────────────────────────────────────
  { id: "artisan_granola",   cat: "snacks",    name: "Artisanal Granola — Mixed Berry (200g)",  price: [280, 420], emoji: "🍿", tags: ["snacks", "fitness"] },
  { id: "mixed_nuts",        cat: "snacks",    name: "Premium Mixed Nuts & Raisins (250g)",     price: [350, 550], emoji: "🍿", tags: ["snacks"] },
  { id: "gourmet_popcorn",   cat: "snacks",    name: "Gourmet Popcorn — 3 Flavours",            price: [250, 400], emoji: "🍿", tags: ["snacks"] },
  { id: "choc_almonds",      cat: "snacks",    name: "Dark Chocolate Coated Almonds (200g)",    price: [300, 500], emoji: "🍿", tags: ["snacks", "chocolate"] },
  { id: "trail_mix",         cat: "snacks",    name: "Exotic Seeds & Dried Fruits Trail Mix",   price: [280, 420], emoji: "🍿", tags: ["snacks", "fitness", "wellness"] },

  // ── Packaging ─────────────────────────────────────────────────
  { id: "kraft_box",         cat: "packaging", name: "Kraft Gift Box with Satin Ribbon",        price: [150, 250], emoji: "📦", tags: [] },
  { id: "luxury_box",        cat: "packaging", name: "Rigid Luxury Gift Box with Tissue Paper", price: [250, 400], emoji: "📦", tags: [] },
  { id: "jute_tote",         cat: "packaging", name: "Premium Jute Tote Bag",                   price: [150, 300], emoji: "👜", tags: [] },
  { id: "greeting_card",     cat: "packaging", name: "Handwritten Greeting Card",               price: [50,  100], emoji: "💌", tags: [] },
];

export const CATALOG_CATS = [
  { id: "coffee",     label: "☕ Coffee" },
  { id: "tea",        label: "🍵 Tea" },
  { id: "chocolate",  label: "🍫 Chocolate" },
  { id: "skincare",   label: "✨ Skincare" },
  { id: "candles",    label: "🕯️ Candles" },
  { id: "wellness",   label: "🧘 Wellness" },
  { id: "books",      label: "📚 Books" },
  { id: "stationery", label: "✏️ Stationery" },
  { id: "home",       label: "🏡 Home" },
  { id: "plants",     label: "🌿 Plants" },
  { id: "snacks",     label: "🍿 Snacks" },
  { id: "packaging",  label: "📦 Packaging" },
];

// Curated collections — each with a real Unsplash photo
export const COLLECTIONS = [
  {
    id: "coffee-ritual",
    name: "The Coffee Ritual",
    emoji: "☕",
    tagline: "For the one who runs on coffee",
    description: "Artisan coffee, a handcrafted mug, dark chocolate — the complete coffee lover's package.",
    occasions: ["birthday", "thank_you", "farewell", "corporate", "just_because"],
    interestTags: ["coffee"],
    priceRange: [1200, 2000],
    items: [
      "Blue Tokai Attikan Estate Coffee (250g)",
      "Third Wave Drip Bags (5pc)",
      "Sleepy Owl Cold Brew Bags",
      "Handcrafted Ceramic Mug (350ml)",
      "Dark Chocolate Bark with Sea Salt",
      "Kraft Gift Box with Ribbon",
    ],
    photo: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80",
    badge: "Most Loved",
    filterTags: ["birthday", "corporate", "farewell", "thank_you"],
  },
  {
    id: "chocolate-bliss",
    name: "Chocolate Bliss Box",
    emoji: "🍫",
    tagline: "A heavenly assortment for chocolate obsessives",
    description: "Belgian truffles, Ferrero Rocher, dark chocolate bark — pure indulgence in a beautiful box.",
    occasions: ["birthday", "anniversary", "thank_you", "just_because", "festival"],
    interestTags: ["chocolate"],
    priceRange: [800, 1600],
    items: [
      "Belgian Dark Chocolate Truffles (12pc)",
      "Ferrero Rocher Collection (16pc)",
      "Dark Chocolate Bark with Sea Salt",
      "Bournville Rich Dark Chocolate Box",
      "Kraft Gift Box with Ribbon",
    ],
    photo: "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=500&q=80",
    badge: null,
    filterTags: ["birthday", "anniversary", "festival"],
  },
  {
    id: "glow-up",
    name: "Glow Up Kit",
    emoji: "✨",
    tagline: "Skincare essentials they'll actually use",
    description: "Plum, Juicy Chemistry, Dot & Key — real skincare from brands that work.",
    occasions: ["birthday", "anniversary", "just_because", "get_well", "baby_shower"],
    interestTags: ["skincare", "wellness"],
    priceRange: [1500, 2800],
    items: [
      "Plum Goodness Skincare Travel Kit",
      "Juicy Chemistry Rosehip Face Oil",
      "Dot & Key Vitamin C Brightening Serum",
      "Rose Clay Mask + Korean Sheet Mask Set",
      "Soy Wax Scented Candle",
      "Luxury Gift Box with Tissue Paper",
    ],
    photo: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80",
    badge: "Bestseller",
    filterTags: ["birthday", "anniversary", "wellness"],
  },
  {
    id: "reading-nook",
    name: "The Reading Nook",
    emoji: "📚",
    tagline: "For the bookworm who deserves everything",
    description: "A bestseller, a Leuchtturm notebook, a great pen, and something sweet to read with.",
    occasions: ["birthday", "farewell", "thank_you", "congratulations"],
    interestTags: ["books", "stationery", "coffee"],
    priceRange: [1300, 2500],
    items: [
      "Atomic Habits — James Clear",
      "Leuchtturm1917 Notebook A5",
      "Parker / Pilot Premium Pen Set",
      "Vahdam Darjeeling Tea (50g)",
      "Dark Chocolate Coated Almonds",
      "Kraft Gift Box with Ribbon",
    ],
    photo: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&q=80",
    badge: null,
    filterTags: ["birthday", "farewell", "thank_you"],
  },
  {
    id: "self-care-sunday",
    name: "Self Care Sunday",
    emoji: "🧘",
    tagline: "The ultimate wind-down hamper",
    description: "Bath salts, a roller, aromatherapy candles, silk eye mask — a spa day in a box.",
    occasions: ["birthday", "get_well", "anniversary", "just_because", "baby_shower"],
    interestTags: ["wellness", "skincare"],
    priceRange: [1500, 2800],
    items: [
      "Lavender Epsom Salt Bath Soak (500g)",
      "Rose Quartz Gua Sha + Facial Roller Set",
      "Aromatherapy Candle Set (3 Votives)",
      "Mulberry Silk Sleep Eye Mask",
      "Organic Green & Herbal Tea Sampler",
      "Luxury Gift Box with Tissue Paper",
    ],
    photo: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80",
    badge: "Fan Favourite",
    filterTags: ["birthday", "anniversary", "wellness"],
  },
  {
    id: "tea-ritual",
    name: "The Tea Ritual",
    emoji: "🍵",
    tagline: "A ceremony for the chai connoisseur",
    description: "Vahdam's finest, Bombay Tea Co.'s assortment, organic honey — the complete tea set.",
    occasions: ["birthday", "thank_you", "get_well", "farewell", "corporate"],
    interestTags: ["tea", "wellness"],
    priceRange: [1000, 1900],
    items: [
      "Vahdam Darjeeling First Flush Tea",
      "Bombay Tea Co. Assorted Gift Box",
      "Handcrafted Ceramic Mug (350ml)",
      "Raw Organic Honey (250g)",
      "Handmade Artisan Chocolates (10pc)",
      "Kraft Gift Box with Ribbon",
    ],
    photo: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80",
    badge: null,
    filterTags: ["birthday", "corporate", "thank_you"],
  },
  {
    id: "housewarming",
    name: "Home Sweet Home",
    emoji: "🏠",
    tagline: "Everything to make a new space feel like home",
    description: "Succulents, a reed diffuser, bamboo board, honey — warmth for their new space.",
    occasions: ["housewarming"],
    interestTags: ["home_decor", "cooking", "plants"],
    priceRange: [1800, 3200],
    items: [
      "Mini Succulents Set (3pc) with Planters",
      "Reed Diffuser — Sandalwood Rose",
      "Wooden Coaster Set (4pc)",
      "Raw Organic Multiflower Honey",
      "Artisanal Bamboo Serving Board",
      "Soy Wax Scented Candle",
      "Luxury Gift Box with Tissue Paper",
    ],
    photo: "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=500&q=80",
    badge: null,
    filterTags: ["housewarming"],
  },
  {
    id: "midnight-snacker",
    name: "The Midnight Snacker",
    emoji: "🍿",
    tagline: "Netflix + snacks in the most beautiful box",
    description: "Gourmet popcorn, dark chocolate almonds, trail mix — the snack lover's dream.",
    occasions: ["birthday", "just_because", "farewell"],
    interestTags: ["snacks", "chocolate"],
    priceRange: [800, 1600],
    items: [
      "Gourmet Popcorn — 3 Flavours",
      "Dark Chocolate Coated Almonds (200g)",
      "Premium Mixed Nuts & Raisins (250g)",
      "Handmade Artisan Chocolates (10pc)",
      "Exotic Seeds & Dried Fruits Trail Mix",
      "Kraft Gift Box with Ribbon",
    ],
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
    badge: null,
    filterTags: ["birthday", "just_because"],
  },
  {
    id: "corporate-premium",
    name: "The Premium Corporate Hamper",
    emoji: "💼",
    tagline: "Classy gifting — no generic dry fruits",
    description: "Premium dry fruits, a quality pen, artisan journal, and Blue Tokai coffee.",
    occasions: ["corporate", "thank_you", "congratulations"],
    interestTags: ["stationery", "coffee"],
    priceRange: [800, 1600],
    items: [
      "Premium Mixed Nuts & Raisins (250g)",
      "Parker / Pilot Premium Pen Set",
      "Handmade Artisan Journal (A5)",
      "Blue Tokai Attikan Estate Coffee",
      "Belgian Dark Chocolate Truffles",
      "Kraft Gift Box with Ribbon",
    ],
    photo: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80",
    badge: null,
    filterTags: ["corporate"],
  },
  {
    id: "festive-hamper",
    name: "Festive Celebration Box",
    emoji: "🪔",
    tagline: "Diwali, Eid, Christmas — joy in a box",
    description: "Dry fruits, artisan sweets, handmade chocolates, and a fragrant candle.",
    occasions: ["festival"],
    interestTags: ["chocolate", "snacks"],
    priceRange: [800, 2200],
    items: [
      "Premium Mixed Nuts & Raisins (250g)",
      "Handmade Artisan Chocolates (10pc)",
      "Belgian Dark Chocolate Truffles",
      "Reed Diffuser — Sandalwood Rose",
      "Raw Organic Honey",
      "Luxury Festive Gift Box",
    ],
    photo: "https://images.unsplash.com/photo-1607290019234-c1a71b7985b7?w=500&q=80",
    badge: "Seasonal Pick",
    filterTags: ["festival"],
  },
  {
    id: "plant-parent",
    name: "Plant Parent Kit",
    emoji: "🌿",
    tagline: "For the one turning their home into a jungle",
    description: "A trio of succulents, organic tea, wooden coasters — earthy and delightful.",
    occasions: ["birthday", "housewarming", "just_because"],
    interestTags: ["plants", "home_decor"],
    priceRange: [900, 1700],
    items: [
      "Mini Succulents Set (3pc) with Planters",
      "Wooden Coaster Set (4pc)",
      "Organic Green & Herbal Tea Sampler",
      "Soy Wax Scented Candle",
      "Handwritten Greeting Card",
      "Jute Tote Bag",
    ],
    photo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80",
    badge: null,
    filterTags: ["birthday", "housewarming"],
  },
  {
    id: "wellness-warrior",
    name: "Wellness Warrior",
    emoji: "💪",
    tagline: "For the gym rat, the yogi, the health nut",
    description: "Artisanal granola, trail mix, herbal tea, bath salts — functional and thoughtful.",
    occasions: ["birthday", "congratulations", "just_because"],
    interestTags: ["fitness", "wellness", "snacks"],
    priceRange: [1000, 1800],
    items: [
      "Artisanal Granola — Mixed Berry (200g)",
      "Exotic Seeds & Dried Fruits Trail Mix",
      "Organic Green & Herbal Tea Sampler",
      "Lavender Epsom Salt Bath Soak",
      "Mulberry Silk Sleep Eye Mask",
      "Kraft Gift Box with Ribbon",
    ],
    photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80",
    badge: null,
    filterTags: ["birthday", "wellness"],
  },
];

// Bulk return gift options (for events, weddings, corporate)
export const BULK_COLLECTIONS = [
  {
    id: "bulk-wedding-shagun",
    name: "Wedding Shagun Box",
    emoji: "💒",
    tagline: "Classic return gift for wedding guests",
    description: "Premium dry fruits, artisan sweets, and a decorative item in a festive box.",
    pricePerUnit: [200, 400],
    minQty: 50,
    idealFor: "Wedding Guests",
    items: ["Premium Dry Fruits (100g)", "Artisan Sweet Box (2pc)", "Decorative Return Token"],
    photo: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=500&q=80",
  },
  {
    id: "bulk-chocolate-favors",
    name: "Chocolate Favor Box",
    emoji: "🍫",
    tagline: "3–5 chocolates in a cute mini box",
    description: "Handmade chocolates in a beautiful miniature box — always a hit with guests.",
    pricePerUnit: [100, 250],
    minQty: 50,
    idealFor: "Birthday / Baby Shower",
    items: ["3–5 Handmade Chocolates", "Mini Gift Box with Ribbon", "Name Card"],
    photo: "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=500&q=80",
  },
  {
    id: "bulk-corporate",
    name: "Corporate Return Gift",
    emoji: "💼",
    tagline: "Branded notebooks, pens, or tumblers",
    description: "Customizable with your company name/logo. Notebooks, pens, or coffee mugs.",
    pricePerUnit: [300, 600],
    minQty: 25,
    idealFor: "Corporate Events",
    items: ["Branded Notebook or Tumbler", "Premium Pen", "Packaging with Brand Card"],
    photo: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80",
  },
  {
    id: "bulk-diwali-tins",
    name: "Festive Diwali Tin",
    emoji: "🪔",
    tagline: "Sweets + dry fruits in decorative tins",
    description: "A festive tin with dry fruits and artisan sweets — ideal for Diwali distribution.",
    pricePerUnit: [200, 500],
    minQty: 50,
    idealFor: "Festival Distribution",
    items: ["Dry Fruits Mix (75g)", "Artisan Sweet Box (3pc)", "Decorative Tin with Lid"],
    photo: "https://images.unsplash.com/photo-1607290019234-c1a71b7985b7?w=500&q=80",
  },
  {
    id: "bulk-candle-favors",
    name: "Mini Candle Favors",
    emoji: "🕯️",
    tagline: "Tiny soy candles in cute jars with ribbon",
    description: "Compact 50g soy wax candles in mini glass jars — elegant and memorable.",
    pricePerUnit: [150, 300],
    minQty: 50,
    idealFor: "Wedding / Birthday",
    items: ["Mini Soy Wax Candle (50g)", "Glass Jar", "Personalized Label + Ribbon"],
    photo: "https://images.unsplash.com/photo-1608155686393-8fdd966d784b?w=500&q=80",
  },
  {
    id: "bulk-plants",
    name: "Mini Succulent Favors",
    emoji: "🌿",
    tagline: "A tiny plant — the gift that keeps growing",
    description: "Mini succulents in terracotta pots with a personalized note tag.",
    pricePerUnit: [100, 200],
    minQty: 30,
    idealFor: "Birthday / Eco Event",
    items: ["Mini Succulent", "Terracotta Pot", "Personalized Note Tag"],
    photo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80",
  },
];

// AI suggestion engine — pure data logic, no API
export function suggestHampers(occasion, recipient, interests, budget) {
  const scored = COLLECTIONS.map(col => {
    let score = 0;

    // Occasion match — heavy weight
    if (col.occasions.includes(occasion)) score += 40;

    // Interest overlap
    const overlap = interests.filter(i => col.interestTags.includes(i)).length;
    score += overlap * 25;

    // Budget fit
    const [minP, maxP] = col.priceRange;
    if (budget >= minP && budget <= maxP * 1.4) score += 25;
    else if (budget > maxP * 1.4) score += 10;
    else if (budget < minP) score -= 15;

    // General fit for recipient type
    if (recipient === "boss" || recipient === "client") {
      if (col.id === "corporate-premium" || col.id === "coffee-ritual" || col.id === "tea-ritual") score += 20;
    }
    if (recipient === "partner") {
      if (col.id === "glow-up" || col.id === "self-care-sunday" || col.id === "chocolate-bliss") score += 20;
    }
    if (recipient === "parent") {
      if (col.id === "tea-ritual" || col.id === "festive-hamper" || col.id === "housewarming") score += 15;
    }

    const budgetFit = budget >= minP;
    return { ...col, score, budgetFit };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  const affordable = sorted.filter(c => c.budgetFit).slice(0, 3);
  const stretch = sorted.filter(c => !c.budgetFit)[0];

  const results = [...affordable];
  if (stretch && results.length < 4) results.push({ ...stretch, isStretch: true });

  return results.map(col => ({
    ...col,
    estimatedPrice: col.isStretch
      ? col.priceRange[0]
      : Math.min(Math.round(budget * 0.88 / 50) * 50, col.priceRange[1]),
  }));
}

export function fmt(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getOccasionById } from "../../data/occasions";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

/* ── tokens ── */
const font  = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";
const gold  = "#C47A2E";
const goldLt= "#D4A848";
const bg    = "#FDFAF5";
const ink   = "#1C0900";
const muted = "rgba(28,9,0,0.55)";
const border= "rgba(196,122,46,0.2)";

const HUB_ROUTES = {
  "birthday-party":"\/birthday-hub","first-birthday":"\/birthday-hub",
  "anniversary":"\/anniversary-hub","baby-shower":"\/baby-shower-hub",
  "gender-reveal":"\/baby-shower-hub","newborn-welcome":"\/baby-shower-hub",
  "housewarming":"\/housewarming-hub","get-together":"\/get-together-hub",
  "naming-ceremony":"\/naming-ceremony-hub",
};

/* ── lookup tables ── */
const AGE_GROUPS = [
  { id:"Toddlers", label:"Toddlers", sub:"0–5 yrs", icon:"👶" },
  { id:"Kids",     label:"Kids",     sub:"6–12 yrs", icon:"🧒" },
  { id:"Teens",    label:"Teens",    sub:"13–19 yrs", icon:"🧑" },
  { id:"Adults",   label:"Adults",   sub:"20–60 yrs", icon:"👨" },
  { id:"Seniors",  label:"Seniors",  sub:"60+ yrs",   icon:"👴" },
];

const VENUE_TYPES = [
  { id:"Home / Apartment",  icon:"🏠" },
  { id:"Banquet Hall",      icon:"🏛️" },
  { id:"Garden / Lawn",     icon:"🌿" },
  { id:"Restaurant",        icon:"🍽️" },
  { id:"Farmhouse",         icon:"🌾" },
  { id:"Rooftop / Terrace", icon:"🌆" },
  { id:"Community Centre",  icon:"🏢" },
  { id:"Outdoor / Open Air",icon:"☀️" },
];

const ALL_VENDORS = [
  "Decorator","Caterer","DJ","Photographer","Videographer",
  "Florist","Entertainer","Photo Booth","Live Band","Emcee / Host",
  "Lighting Setup","Sound System","Makeup Artist","Balloon Artist","Cake Artist",
];

/* catering service styles — shown inside the Caterer tip card */
const CATERING_STYLES = [
  "Buffet — self serve",
  "Buffet + waiter service",
  "Plated meal",
  "Live counters",
  "Finger foods / cocktail",
  "High tea",
  "Dessert station only",
  "Custom — I'll discuss",
];

const CAKE_OPTS = ["Single Tier","Multi-Tier","Cupcake Tower","Jar Cakes","Themed Cake","No Cake","Custom"];

/* ── equipment calculator ── */
function getEquipment(id, guests) {
  const g=guests, t=Math.ceil(g/6);
  const common=[
    {cat:"Seating & Tables",items:[{name:"Folding chairs",qty:`${g+5} chairs`},{name:"Tables (6-seater)",qty:`${t} tables`}]},
    {cat:"Serving",items:[{name:"Disposable plates",qty:`${Math.ceil(g*1.5)} pcs`},{name:"Cups / glasses",qty:`${g*2} pcs`},{name:"Napkins",qty:`${g*3} pcs`},{name:"Serving spoons",qty:"5–6 pcs"},{name:"Garbage bags",qty:"4–5 bags"}]},
  ];
  const extra={
    "birthday-party":[{cat:"Décor",items:[{name:"Balloon bouquets",qty:`${Math.ceil(g/3)}`},{name:"Fairy lights",qty:"3 sets"},{name:"Photo backdrop",qty:"1"},{name:"Birthday banner",qty:"1"}]},{cat:"Entertainment",items:[{name:g>40?"Sound system":"Bluetooth speaker",qty:g>40?"1 system":"1–2"},{name:"Cake knife+server",qty:"1 set"}]}],
    "first-birthday":[{cat:"Décor",items:[{name:"Balloon arch",qty:"1"},{name:"Theme backdrop",qty:"1"},{name:"Highchair deco kit",qty:"1 set"}]},{cat:"Baby Safety",items:[{name:"Soft play mat",qty:"1–2"},{name:"Baby gate",qty:"1–2"}]}],
    "baby-shower":[{cat:"Décor",items:[{name:"Pastel balloon clusters",qty:`${Math.ceil(g/5)}`},{name:"Fairy lights",qty:"2–3 sets"},{name:"Floral centrepieces",qty:`${t} pcs`}]},{cat:"Activity Supplies",items:[{name:"Plain onesies",qty:`${Math.ceil(g*0.5)}`},{name:"Fabric markers",qty:"6–8"}]}],
    "anniversary":[{cat:"Décor",items:[{name:"Candles",qty:`${Math.ceil(g/2)} pcs`},{name:"Flower centrepieces",qty:`${t} pcs`},{name:"Fairy lights",qty:"3 sets"}]},{cat:"Table Setting",items:[{name:"Champagne glasses",qty:`${g+5}`},{name:"Cloth napkins",qty:`${g}`},{name:"Table runners",qty:`${t}`}]}],
    "housewarming":[{cat:"Décor",items:[{name:"Welcome floral arch",qty:"1"},{name:"Indoor fairy lights",qty:"2 sets"},{name:"Potted plants",qty:"3–4"}]},{cat:"Serving",items:[{name:"Serving trays",qty:`${Math.ceil(g/10)}`},{name:"Chafing dishes",qty:"4–5 pcs"}]}],
    "get-together":[{cat:"Entertainment",items:[{name:"Bluetooth speaker",qty:"1–2"},{name:"Board games",qty:"2–3"}]}],
    "naming-ceremony":[{cat:"Ceremony",items:[{name:"Marigold garlands",qty:"4–6"},{name:"Diyas",qty:"10–15"},{name:"Puja thali",qty:"1–2 sets"}]},{cat:"Décor",items:[{name:"Fabric backdrop",qty:"1"},{name:"Fairy lights",qty:"2 sets"}]}],
    "gender-reveal":[{cat:"Reveal Items",items:[{name:"Gender reveal box",qty:"1"},{name:"Confetti cannons",qty:"4–6"}]}],
    "graduation":[{cat:"Décor",items:[{name:"Graduation balloon arch",qty:"1"},{name:"Memory photo wall",qty:"1"}]}],
    "farewell":[{cat:"Décor",items:[{name:"Memory photo wall",qty:"1"},{name:"Farewell banner",qty:"1"}]},{cat:"Keepsakes",items:[{name:"Memory scrapbook",qty:"1"}]}],
    "retirement":[{cat:"Décor",items:[{name:"Retirement banner",qty:"1"},{name:"Career memory wall",qty:"1"}]}],
    "newborn-welcome":[{cat:"Décor",items:[{name:"Flower arch",qty:"1"},{name:"Welcome balloons",qty:`${Math.ceil(g/4)}`}]}],
  };
  return [...common,...(extra[id]||[])];
}

/* ── theme helpers ── */
function themeColor(tags=[]) {
  const t=tags.join(" ").toLowerCase();
  if(t.includes("pastel")||t.includes("floral")||t.includes("pink")) return "#FFB6C1";
  if(t.includes("neon")||t.includes("glow"))  return "#A855F7";
  if(t.includes("green")||t.includes("nature")||t.includes("garden")||t.includes("jungle")) return "#4D8C6F";
  if(t.includes("navy")||t.includes("stars")) return "#2D3A8C";
  if(t.includes("bollywood")||t.includes("indian")) return "#FF6B35";
  if(t.includes("red")||t.includes("red-carpet")) return "#C0392B";
  if(t.includes("gold")||t.includes("elegant")||t.includes("glam")) return "#D4A848";
  if(t.includes("minimal")||t.includes("white")||t.includes("modern")) return "#A09080";
  return "#C47A2E";
}

/* ── vendor recommendations based on theme + age groups + venue ── */
function getRecommended(occasion, theme, ageGroups, venueType) {
  const recs = new Set(occasion.vendorCategories||[]);
  const venue=(venueType||"").toLowerCase();
  if(theme) {
    const t=(theme.tags||[]).join(" ").toLowerCase();
    if(t.includes("floral")||t.includes("garden")||t.includes("nature")) recs.add("Florist");
    if(t.includes("neon")||t.includes("glow")||t.includes("teen")) recs.add("DJ");
    if(t.includes("bollywood")||t.includes("indian")) recs.add("Emcee / Host");
    if(t.includes("gold")||t.includes("elegant")||t.includes("glam")) recs.add("Lighting Setup");
    if(t.includes("photo")||t.includes("memories")||t.includes("red-carpet")) recs.add("Photo Booth");
  }
  if(venue.includes("garden")||venue.includes("outdoor")||venue.includes("farmhouse")||venue.includes("rooftop")) {
    recs.add("Lighting Setup");
  }
  if(venue.includes("banquet")||venue.includes("hall")) {
    recs.add("Sound System");
  }
  if(ageGroups.includes("Kids")||ageGroups.includes("Toddlers")) {
    recs.add("Entertainer"); recs.add("Balloon Artist");
  }
  if(ageGroups.includes("Teens")) { recs.add("DJ"); recs.add("Photo Booth"); }
  if(ageGroups.includes("Seniors")) { recs.add("Live Band"); }
  return recs;
}

function getSmartVendors(occasion, theme, ageGroups, venueType, max=7) {
  const recs = getRecommended(occasion, theme, ageGroups, venueType);
  const base = occasion.vendorCategories || [];
  return [...new Set([...base, ...recs])].slice(0, max);
}

/* ── vendor tips (what to actually ask for) ── */
function getVendorTips(type, {theme, venueType, ageGroups, cateringType}) {
  const tags=(theme?.tags||[]).join(" ").toLowerCase();
  const venue=(venueType||"").toLowerCase();
  const ages=ageGroups||[];

  if(type==="Decorator") {
    const items=[];
    // venue-specific items
    if(venue.includes("garden")||venue.includes("lawn")||venue.includes("outdoor")) {
      items.push("String lights strung overhead","Floral arch at entrance","Lanterns along pathways","Ground flowers/petals");
    } else if(venue.includes("banquet")||venue.includes("hall")) {
      items.push("Backdrop wall behind the main table","Table centrepieces for each table","Ceiling draping or balloon ceiling","Stage/podium décor");
    } else if(venue.includes("home")||venue.includes("room")||venue.includes("apartment")) {
      items.push("Balloon cluster at the entrance","Living room focal point (arch or wall)","Door frame décor","Photo corner with props");
    } else if(venue.includes("rooftop")||venue.includes("terrace")) {
      items.push("Edison bulb string lights","Low seating with cushions","Potted plants as dividers","Fairy light curtain");
    } else if(venue.includes("farmhouse")) {
      items.push("Hanging fairy lights from trees","Rustic wooden props","Floral installation at entrance");
    } else if(venue.includes("restaurant")) {
      items.push("Table centrepieces","Backdrop behind the cake table","Balloon clusters on tables");
    } else {
      items.push("Backdrop wall","Balloon arch","Table centrepieces");
    }
    // theme items
    if(tags.includes("pastel")||tags.includes("floral")) {
      items.push("Pastel balloon cloud","Floral centrepieces (roses/peonies)","Tulle draping","Pampas grass accents");
    } else if(tags.includes("neon")||tags.includes("glow")) {
      items.push("Custom neon sign with name","UV-reactive props","RGB LED strip lighting","Black fabric backdrop");
    } else if(tags.includes("bollywood")||tags.includes("indian")) {
      items.push("Marigold garlands","Colourful dupatta draping","Diya clusters","Rangoli at entrance");
    } else if(tags.includes("gold")||tags.includes("elegant")) {
      items.push("Gold balloon arch","Crystal candle holders","Metallic table runners","Warm uplighting");
    } else if(tags.includes("jungle")||tags.includes("nature")||tags.includes("green")) {
      items.push("Tropical leaf backdrop","Moss table runner","Terracotta pots","Monstera leaf accents");
    } else if(tags.includes("minimal")||tags.includes("white")||tags.includes("modern")) {
      items.push("White balloon wall","Geometric frames","Monochrome floral","Floating candles");
    }
    if(ages.includes("Kids")||ages.includes("Toddlers")) {
      items.push("Character-themed balloons","Colourful streamers","Soft safe props (no sharp edges)");
    }
    return {
      heading:"Ask your decorator for",
      items:[...new Set(items)].slice(0,7),
      tip:venueType?`Tip: Tell the decorator it's a ${venueType} — setup time and equipment change significantly.`:"Tip: Share reference photos and the venue size before finalising quotes.",
    };
  }

  if(type==="Caterer") {
    const menu=[];
    const cs=cateringType||"";
    if(cs.includes("Buffet + waiter")) {
      menu.push("Waiter-served starter rounds","2–3 main course options","Live chaat or pasta counter","Dal + rice + bread","Dessert table");
    } else if(cs.includes("Buffet")) {
      menu.push("Self-serve starters section","2–3 mains (veg + non-veg)","Dal + rice + roti","Salad bar","Dessert counter");
    } else if(cs.includes("Plated")) {
      menu.push("Welcome amuse-bouche","Soup + salad course","Plated main with 2 sides","Dessert per person","Bread rolls");
    } else if(cs.includes("Live counter")) {
      menu.push("Live chaat / pani puri counter","Pasta or pizza station","Dosa / Frankies counter","Grilled section","Beverage station");
    } else if(cs.includes("Finger foods")) {
      menu.push("Mini sandwiches & sliders","Cocktail samosas & spring rolls","Bruschetta","Cheese & cracker platter","Dips with nachos");
    } else if(cs.includes("High tea")) {
      menu.push("Assorted teas & coffees","Finger sandwiches (4 varieties)","Scones with cream & jam","Mini pastries","Macarons");
    } else if(cs.includes("Dessert")) {
      menu.push("Assorted mithais","Brownies & mini cakes","Jar desserts","Ice cream station","Chocolate fountain");
    } else {
      menu.push("Discuss service style with caterer","2–3 main options","Starters + mains + dessert","Beverage station");
    }
    if(ages.includes("Kids")||ages.includes("Toddlers")) {
      menu.push("Kids corner: mini pizza + pasta + fries","Juice station (no aerated drinks)");
    }
    if(ages.includes("Teens")) menu.push("Live pizza/pasta counter","Mocktail bar");
    if(ages.includes("Seniors")) menu.push("Soft/easy options + low-spice section");
    return {
      heading:"Menu to plan with caterer",
      items:[...new Set(menu)].slice(0,8),
      tip:"Tip: Tell the caterer your service style, guest count, veg/non-veg split, and venue type upfront — they'll size everything correctly.",
    };
  }

  if(type==="DJ") {
    const sets=[];
    if(tags.includes("bollywood")||tags.includes("indian")) {
      sets.push("Bollywood hits (2015–present)","90s Bollywood classics","Bhangra floor set","Filmi slow dance numbers");
    } else if(tags.includes("neon")||tags.includes("glow")) {
      sets.push("EDM / progressive house mix","Trending Insta/Reels music","Hip-hop & trap set","Big room anthems");
    } else if(tags.includes("elegant")||tags.includes("gold")) {
      sets.push("Lounge jazz for dinner","Soft Bollywood for cocktail hour","Build-up to dance set","Slow dance finale");
    }
    if(ages.includes("Kids")) sets.push("Kids dance anthems (Baby Shark, etc.)","Cartoon theme songs");
    if(ages.includes("Teens")) sets.push("Trending Spotify Top 50","BTS / K-pop set if relevant");
    if(ages.includes("Seniors")) sets.push("Old Hindi film songs (Kishore Kumar, Lata Mangeshkar)","Mohammad Rafi classics");
    if(!sets.length) sets.push("Bollywood mix (old + new)","Top 40 pop","Dance floor anthems","Slow close");
    return {
      heading:"Tell your DJ to play",
      items:[...new Set(sets)].slice(0,6),
      tip:"Tip: Send a 10-song reference playlist when you enquire — helps the DJ match the vibe without guesswork.",
    };
  }

  if(type==="Florist") {
    const flowers=[];
    if(tags.includes("pastel")||tags.includes("floral")||tags.includes("pink")) {
      flowers.push("Pink roses + baby's breath","Lavender sprigs","Gerbera daisies (soft cream/pink)","Peonies (if in season)","Eucalyptus greenery");
    } else if(tags.includes("bollywood")||tags.includes("indian")) {
      flowers.push("Marigold strings & garlands","Mogra / jasmine bunches","Tuberose strands","Rose petals for pathway","Banana leaf accents");
    } else if(tags.includes("gold")||tags.includes("elegant")) {
      flowers.push("White orchids","Calla lilies","Gold-spray foliage","Dark greenery filler","Crystal-pin roses");
    } else if(tags.includes("jungle")||tags.includes("nature")||tags.includes("green")) {
      flowers.push("Bird of paradise","Anthuriums","Monstera leaves","Tropical palm fronds","Exotic ferns");
    } else if(tags.includes("minimal")||tags.includes("white")||tags.includes("modern")) {
      flowers.push("White roses","Gypsophila (baby's breath)","Dried pampas grass","Greenery-only arrangements");
    } else {
      flowers.push("Mixed seasonal blooms","Greenery filler","2–3 focal statement flowers");
    }
    return {
      heading:"Request from your florist",
      items:[...new Set(flowers)].slice(0,6),
      tip:"Tip: Book 2 weeks before — fresh flowers need advance ordering. Ask if they can deliver day-of for freshness.",
    };
  }

  if(type==="Photographer") {
    const shots=["Candid group moments","Detail shots (décor, cake, table settings)","Arrival / entrance shots","Cake-cutting / key moment close-ups"];
    if(ages.includes("Kids")||ages.includes("Toddlers")) shots.push("Kids playing candid shots","Parent + child portrait");
    if(ages.includes("Seniors")) shots.push("Multi-generational family portrait");
    if(tags.includes("bollywood")||tags.includes("indian")) shots.push("Celebration/dance candids","Traditional ritual close-ups");
    shots.push("Wide venue establishing shot","Group photo at end");
    return {
      heading:"Shot list to share",
      items:[...new Set(shots)].slice(0,7),
      tip:"Tip: Walk the photographer through the venue 30 mins before guests arrive. Agree on 1–2 'must-have' hero shots upfront.",
    };
  }

  if(type==="Lighting Setup") {
    const lights=[];
    if(tags.includes("gold")||tags.includes("elegant")) {
      lights.push("Warm white uplighting on walls","Spotlights on centrepieces","Pendant / chandelier hire","Candle-effect LED clusters");
    } else if(tags.includes("neon")||tags.includes("glow")) {
      lights.push("Coloured LED wash lights","Mirror ball / disco ball","Neon sign hire","RGB moving spotlights");
    } else if(venue.includes("garden")||venue.includes("outdoor")||venue.includes("rooftop")) {
      lights.push("String lights overhead","Pathway lantern hire","Uplighting on trees","Fairy light curtain backdrop");
    } else {
      lights.push("Warm ambient wash","Coloured mood lighting","Uplighting on backdrop wall","Spotlit cake table");
    }
    return {
      heading:"Lighting to request",
      items:[...new Set(lights)].slice(0,6),
      tip:"Tip: Ask for 'warm-white for dinner, switch to coloured for dancing' — most lighting vendors offer this as a scene change.",
    };
  }

  if(type==="Entertainer") {
    const acts=[];
    if(ages.includes("Toddlers")) acts.push("Puppet show","Soft play area","Bubble machine","Face painting (toddler-safe)");
    if(ages.includes("Kids")) acts.push("Magician","Clown (optional)","Balloon twisting artist","Treasure hunt MC","Craft activity station");
    if(ages.includes("Teens")) acts.push("Escape room challenge","Photo booth with props","Beat the DJ activity","Trivia host");
    if(!acts.length) acts.push("Interactive games host","Icebreaker activities","Memory wall setup");
    return {
      heading:"Entertainment to arrange",
      items:[...new Set(acts)].slice(0,6),
      tip:"Tip: Book entertainer separately from DJ — they play different roles. Confirm safety certifications for kids' entertainers.",
    };
  }

  if(type==="Cake Artist") {
    const flavours=[];
    if(tags.includes("pastel")||tags.includes("floral")) {
      flavours.push("Vanilla with floral fondant décor","Pastel ombre layers","Pressed flower cake","Watercolour frosting");
    } else if(tags.includes("bollywood")||tags.includes("indian")) {
      flavours.push("Rose & cardamom flavour","Gold leaf tiers","Traditional motif fondant","Saffron & pistachio filling");
    } else if(tags.includes("neon")||tags.includes("glow")) {
      flavours.push("Dark chocolate with neon drip","UV-reactive icing (special order)","Electric blue + purple tiers");
    } else {
      flavours.push("Classic vanilla / chocolate","Custom message on top","Character topper","Matching colour scheme frosting");
    }
    if(ages.includes("Kids")||ages.includes("Toddlers")) {
      flavours.push("No-alcohol flavours","Allergen-free option available?","Smash cake for toddler (separate)");
    }
    return {
      heading:"Discuss with your cake artist",
      items:[...new Set(flavours)].slice(0,6),
      tip:"Tip: Share theme colours + a reference photo. Confirm delivery time — cakes need to arrive 2 hrs before cutting.",
    };
  }

  if(type==="Photo Booth") {
    return {
      heading:"What to set up",
      items:["Printed or digital instant photos","Props box (hats, signs, glasses)","Themed backdrop matching décor","GIF/video booth option","Unlimited prints for guests"],
      tip:"Tip: Place the photo booth near the entrance or bar area — it gets used more. Confirm if props are included in the quote.",
    };
  }

  // generic
  return {
    heading:"What to discuss when you call",
    items:["Your event date & location","Guest count","Budget range","Any special requirements","References / inspiration photos"],
    tip:"Tip: Always share date, guest count, venue name and city when first reaching out — it speeds up quotes significantly.",
  };
}

/* ── vendor packages (3 tiers per vendor type) ── */
function getVendorPackages(type, {guests=20, venueType="", theme=null, ageGroups=[]}) {
  const g=guests;
  const venue=venueType.toLowerCase();
  const tags=(theme?.tags||[]).join(" ").toLowerCase();
  const ages=ageGroups;
  const outdoor=venue.includes("garden")||venue.includes("outdoor")||venue.includes("farmhouse")||venue.includes("rooftop")||venue.includes("terrace");
  const large=g>60;
  const hasKids=ages.includes("Kids")||ages.includes("Toddlers");

  if(type==="Decorator") return [
    {label:"Essential",price:outdoor?"₹8K–15K":"₹5K–10K",
      items:["Balloon clusters at entry","Simple backdrop wall","Basic table centrepieces"],
      note:"Clean, minimal setup — ideal for intimate gatherings"},
    {label:"Standard",price:outdoor?"₹20K–38K":"₹14K–26K",popular:true,
      items:["Themed backdrop + arch","Table décor for all tables",outdoor?"String lights overhead":"Balloon ceiling",tags.includes("floral")?"Fresh floral elements":"Colour-matched props"],
      note:"Full venue coverage — most popular choice"},
    {label:"Premium",price:outdoor?"₹50K+":"₹35K+",
      items:["Full venue transformation",tags.includes("neon")?"Custom neon signs":"Custom floral installations",large?"Stage & focal-point décor":"Immersive themed corners","Day-of coordination included"],
      note:"Showstopper — every detail custom-matched"},
  ];

  if(type==="Caterer") return [
    {label:"Essential",price:"₹350–450/head",
      items:["Buffet service","1 veg + 1 non-veg main","Dal, rice & bread","Basic dessert",hasKids?"Kids-friendly options":"Water station"],
      note:"Simple & reliable for any occasion"},
    {label:"Standard",price:"₹550–750/head",popular:true,
      items:["Buffet + waiter service","2–3 main options","Live starters counter","Salad bar & dessert station",hasKids?"Kids corner (mini pizza, fries)":"Custom beverage station"],
      note:"Covers all tastes — most popular"},
    {label:"Premium",price:"₹850–1,200/head",
      items:["Full waiter service","4+ mains + live counters","Cocktail starter round","Curated dessert table","Custom menu cards"],
      note:"Full-service dining experience"},
  ];

  if(type==="DJ") return [
    {label:"Essential",price:"₹8K–12K",
      items:["3-hour set","Basic speaker setup","Standard playlist"],
      note:"Solid music — no frills"},
    {label:"Standard",price:"₹15K–22K",popular:true,
      items:["4-hour set","DJ + LED light effects","Custom playlist coordination","Mic for announcements"],
      note:"Dance floor guaranteed"},
    {label:"Premium",price:"₹28K–45K",
      items:["5-hour set","Moving heads + smoke machine","Custom mashups & remixing","Dedicated setup engineer"],
      note:"Full club experience at your event"},
  ];

  if(type==="Photographer") return [
    {label:"Essential",price:"₹8K–14K",
      items:["3-hour coverage","150–200 edited photos","Delivery in 7 days"],
      note:"Key moments captured"},
    {label:"Standard",price:"₹18K–28K",popular:true,
      items:["5-hour coverage","400+ edited photos","Candid + group shots","Delivery in 5 days"],
      note:"Full event covered — most popular"},
    {label:"Premium",price:"₹35K–55K",
      items:["Full-day coverage","600+ edited photos","2nd photographer","Printed photo album"],
      note:"Every moment beautifully archived"},
  ];

  if(type==="Videographer") return [
    {label:"Essential",price:"₹10K–18K",
      items:["3-hour coverage","3–5 min edited highlight reel","Basic colour grade"],
      note:"Key moments in a shareable reel"},
    {label:"Standard",price:"₹22K–35K",popular:true,
      items:["5-hour coverage","Full event + highlight reel","Licensed background music","Delivery in 7 days"],
      note:"Cinematic full coverage"},
    {label:"Premium",price:"₹45K–70K",
      items:["Full-day coverage","Drone aerial shots","Cinematic edit + reel","2 videographers"],
      note:"Film-quality production"},
  ];

  if(type==="Florist") return [
    {label:"Essential",price:"₹4K–8K",
      items:["Entry arrangement","2–3 table centrepieces","Seasonal flowers"],
      note:"Fresh, simple floral touches"},
    {label:"Standard",price:"₹12K–22K",popular:true,
      items:["Full table florals","Entrance arch / display",tags.includes("bollywood")||tags.includes("indian")?"Marigold garlands":"Focal floral installation"],
      note:"Cohesive floral look throughout"},
    {label:"Premium",price:"₹30K+",
      items:["Custom floral installation","Ceiling / hanging arrangements","Imported blooms on request","Florist on-site for setup"],
      note:"Garden-in-a-room effect"},
  ];

  if(type==="Entertainer") return [
    {label:"Essential",price:"₹5K–9K",
      items:[hasKids?"Magician (45 min)":"Games host (1 hr)","Basic props","1 activity"],
      note:"One solid act for the crowd"},
    {label:"Standard",price:"₹12K–18K",popular:true,
      items:[hasKids?"Magician + balloon twisting":"Interactive games MC","2 activities / acts","Tailored to your age groups"],
      note:"Keeps the crowd engaged throughout"},
    {label:"Premium",price:"₹22K–35K",
      items:[hasKids?"Multi-act kids package":"Full event host","Face painting + crafts + show","Customised for your theme"],
      note:"Full entertainment programme"},
  ];

  if(type==="Photo Booth") return [
    {label:"Essential",price:"₹6K–9K",
      items:["Digital photo booth","Basic props box","QR share to phone"],
      note:"Instant fun — guests love it"},
    {label:"Standard",price:"₹11K–17K",popular:true,
      items:["Prints + digital","Themed backdrop","Full props collection","Unlimited sessions"],
      note:"Most popular party setup"},
    {label:"Premium",price:"₹20K–32K",
      items:["GIF + Boomerang + video booth","Custom overlay with event name","Roaming camera option","Full digital album"],
      note:"Full interactive photo experience"},
  ];

  if(type==="Live Band") return [
    {label:"Essential",price:"₹15K–22K",
      items:["3-piece band","2-hour performance","Standard setlist"],
      note:"Live music energy on a budget"},
    {label:"Standard",price:"₹28K–45K",popular:true,
      items:["5-piece band","3-hour performance","Customised song requests","Sound system included"],
      note:"Full live band experience"},
    {label:"Premium",price:"₹55K+",
      items:["7+ piece band","4-hour set","Original arrangements","Lighting & sound engineer"],
      note:"Concert-quality performance"},
  ];

  if(type==="Emcee / Host") return [
    {label:"Essential",price:"₹8K–13K",
      items:["3-hour hosting","Standard script","Mic + basic AV support"],
      note:"Smooth event flow"},
    {label:"Standard",price:"₹18K–28K",popular:true,
      items:["Full event hosting","Custom script & games","Guest engagement activities","Bilingual (Hindi + English)"],
      note:"Energetic host — vibe stays up"},
    {label:"Premium",price:"₹35K+",
      items:["Celebrity-style host","Full script coordination","Custom games & trivia","Pre-event rehearsal"],
      note:"Professional show-runner experience"},
  ];

  if(type==="Lighting Setup") return [
    {label:"Essential",price:outdoor?"₹8K–14K":"₹5K–9K",
      items:["Warm ambient wash","Basic uplighting","Standard fixtures"],
      note:"Sets the mood without breaking budget"},
    {label:"Standard",price:outdoor?"₹15K–25K":"₹10K–18K",popular:true,
      items:[outdoor?"String lights + pathway lights":"Themed LED wash",tags.includes("neon")?"Coloured LED wash":"Warm uplighting","Spotlit key areas (cake, backdrop)"],
      note:"Full venue lighting transformation"},
    {label:"Premium",price:outdoor?"₹30K+":"₹22K+",
      items:["Moving head spotlights","Scene changes (dinner → dance)","Gobo / pattern projections","Lighting engineer on-site"],
      note:"Dynamic, show-quality lighting"},
  ];

  if(type==="Sound System") return [
    {label:"Essential",price:"₹5K–8K",
      items:[`${g>40?"Dual speaker":"Single PA"} system`,"Basic mic setup","Plug & play"],
      note:"Clear audio for speeches & music"},
    {label:"Standard",price:"₹10K–16K",popular:true,
      items:[`${large?"Multi-speaker line array":"4-speaker surround"}`,"2 wireless mics","Mixing board","On-call technician"],
      note:"Full venue sound coverage"},
    {label:"Premium",price:"₹20K+",
      items:["Pro PA system","4+ wireless mics","In-ear monitors","Dedicated sound engineer"],
      note:"Studio-quality sound"},
  ];

  if(type==="Makeup Artist") return [
    {label:"Essential",price:"₹3K–6K",
      items:["Party makeup (1 person)","1–1.5 hours","Basic touch-up kit"],
      note:"Looking great for the party"},
    {label:"Standard",price:"₹8K–14K",popular:true,
      items:["Airbrush or HD makeup","1 person + assistant","2 hours + touch-ups during event"],
      note:"Camera-ready, long-lasting look"},
    {label:"Premium",price:"₹18K–30K",
      items:["Celebrity-style makeup","Full beauty team","Customised look design","Group rates for multiple guests"],
      note:"Flawless for every shot"},
  ];

  if(type==="Balloon Artist") return [
    {label:"Essential",price:"₹4K–7K",
      items:["Entry balloon cluster","2–3 balloon bouquets","Matching colour palette"],
      note:"Cheerful, instant ambience"},
    {label:"Standard",price:"₹9K–16K",popular:true,
      items:["Balloon arch (entry or backdrop)","Table centrepiece balloons","Chrome or foil accents"],
      note:"Full balloon décor — most popular"},
    {label:"Premium",price:"₹20K+",
      items:["Organic balloon wall / cloud","Custom balloon sculptures","Double-stuffed foil centrepieces","Artist on-site 3+ hours"],
      note:"Statement organic balloon setup"},
  ];

  if(type==="Cake Artist") return [
    {label:"Essential",price:"₹2K–4K",
      items:[`${Math.max(1,Math.ceil(g/30))} kg themed cake`,"Fondant or buttercream","Custom message on top"],
      note:"Classic cake — done right"},
    {label:"Standard",price:"₹5K–10K",popular:true,
      items:["Multi-tier or sculpted cake","Matching theme colours","Figurines or custom topper","Extra cupcakes for guests"],
      note:"Showstopper cake — most popular"},
    {label:"Premium",price:"₹12K–25K",
      items:["Luxury custom cake","Hand-painted or sugar flowers","Multi-flavour tiers","Cake cutting service"],
      note:"Bespoke luxury cake piece"},
  ];

  return [
    {label:"Essential",price:"Budget-friendly",items:["Basic service package","Standard setup"],note:"Gets the job done"},
    {label:"Standard",price:"Mid-range",popular:true,items:["Full service package","Customisation available","On-site support"],note:"Best value for most events"},
    {label:"Premium",price:"Full-service",items:["Premium setup","Dedicated coordinator","Priority booking"],note:"Top-tier experience"},
  ];
}

/* ── build WhatsApp Baat Karo message ── */
function buildBaatKaroMsg(occasion, {guests, date, city, venueType, theme, vendors, vendorPackages, budget}) {
  const pkgNames=["Essential","Standard","Premium"];
  const vLines=vendors.filter(v=>ALL_VENDORS.includes(v)).map(v=>{
    const pi=vendorPackages[v];
    return `• ${v}${pi!==undefined?` — ${pkgNames[pi]}`:""}`;
  });
  const customLines=vendors.filter(v=>!ALL_VENDORS.includes(v)).map(v=>`• ${v}`);
  const allLines=[...vLines,...customLines].join("\n");
  const dateStr=date?new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}):"";
  const parts=[
    `Hi Tendr! I've planned a ${occasion.name} and need help booking.`,
    "",
    `👥 Guests: ${guests}`,
    dateStr?`📅 Date: ${dateStr}`:null,
    (city||venueType)?`📍 ${[city,venueType].filter(Boolean).join(" · ")}`:null,
    theme?`🎨 Theme: ${theme.name}`:null,
    budget?`💰 Budget: ₹${Number(budget).toLocaleString("en-IN")}`:null,
    allLines?`\n*Services I need:*\n${allLines}`:null,
    "\nCan you help me book these?",
  ].filter(x=>x!==null).join("\n");
  return `https://wa.me/919211668427?text=${encodeURIComponent(parts)}`;
}

/* ── timeline ── */
function buildTimeline(dateStr, vendors) {
  if(!dateStr) return null;
  const event=new Date(dateStr+"T00:00:00");
  const today=new Date(); today.setHours(0,0,0,0);
  const days=Math.round((event-today)/86400000);
  if(days<0) return null;
  const fmt=d=>d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
  const offset=n=>{const d=new Date(event);d.setDate(d.getDate()+n);return d;};
  const phases=[];
  const needsCaterer=!vendors||vendors.includes("Caterer");
  const needsDecor=!vendors||vendors.includes("Decorator");
  const firstTask=needsDecor&&needsCaterer?"Book your decorator & caterer first":"Book decorator now";
  const rightNow=days>=30
    ? [firstTask,"Lock the venue","Draft your guest list"]
    : days>=7
    ? ["Call vendors today — urgently","Confirm caterer & menu","Finalise headcount"]
    : ["Arrange whatever you can now","Call vendors immediately"];
  const urgentLabel=days>=7?"Right now":"Urgent — right now";
  phases.push({when:urgentLabel,date:null,tasks:rightNow});
  if(days>=21) phases.push({when:"3 weeks out",date:fmt(offset(-21)),tasks:["Send invitations","Order the cake","Share final menu with caterer"]});
  if(days>=14) phases.push({when:"2 weeks out",date:fmt(offset(-14)),tasks:["Confirm final headcount","Finalise entertainment","Order any printed items"]});
  if(days>=7)  phases.push({when:"1 week out",date:fmt(offset(-7)),tasks:["All vendor confirmations in writing","Buy remaining décor supplies","Create the day-of schedule"]});
  if(days>=1)  phases.push({when:"Day before",date:fmt(offset(-1)),tasks:["Venue setup (if allowed)","Charge all cameras & phones","Confirm all delivery times"]});
  phases.push({when:"🎉 Party day",date:fmt(event),tasks:["Brief your helpers on roles","Welcome guests warmly","Take lots of candid photos"]});
  return {days,phases};
}

/* ── budget split ── */
function buildBudgetSplit(total) {
  const n=Number(total);
  if(!n||n<=0) return null;
  return [
    {label:"Décor & Setup",   pct:28,color:"#C47A2E"},
    {label:"Catering",        pct:32,color:"#D4A848"},
    {label:"Photography",     pct:14,color:"#B8956A"},
    {label:"Entertainment",   pct:12,color:"#9B7450"},
    {label:"Cake & Sweets",   pct:8, color:"#8B6545"},
    {label:"Miscellaneous",   pct:6, color:"#7A5535"},
  ].map(c=>({...c,amt:Math.round(n*c.pct/100)}));
}

/* ── plan card download ── */
async function downloadPlanCard(el,name){
  try{
    const h2c=(await import("html2canvas")).default;
    const canvas=await h2c(el,{scale:2,useCORS:true,backgroundColor:"#FDFAF5"});
    const a=document.createElement("a");
    a.download=`${name.replace(/\s+/g,"-").toLowerCase()}-plan.png`;
    a.href=canvas.toDataURL("image/png");a.click();
  }catch{window.print();}
}

const fmtNum=n=>`₹${Number(n).toLocaleString("en-IN")}`;

function timeAgo(iso) {
  if(!iso) return "";
  const ms=Date.now()-new Date(iso).getTime();
  const h=Math.floor(ms/3600000);
  const m=Math.floor(ms/60000);
  if(h>23) return `${Math.floor(h/24)}d ago`;
  if(h>0) return `${h}h ago`;
  if(m>0) return `${m}m ago`;
  return "just now";
}

/* ── inline CSS ── */
const css=`
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .os{animation:fadeUp 0.28s cubic-bezier(0.22,1,0.36,1);}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:100px;border:1.5px solid rgba(196,122,46,0.22);background:rgba(196,122,46,0.03);color:${ink};font-size:13px;font-weight:500;cursor:pointer;transition:all 0.16s;font-family:${font};white-space:nowrap;position:relative;}
  .chip:hover{border-color:rgba(196,122,46,0.5);background:rgba(196,122,46,0.07);color:${gold};}
  .chip.sel{border-color:${gold};background:rgba(196,122,46,0.12);color:${gold};font-weight:700;box-shadow:0 0 0 3px rgba(196,122,46,0.08);}
  input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.45;cursor:pointer;filter:invert(60%) sepia(60%) saturate(400%) hue-rotate(5deg);}
  ::-webkit-scrollbar{display:none;}
  @media(min-width:600px){.g2{grid-template-columns:repeat(2,1fr)!important;}}
  @media(min-width:600px){.age-g{grid-template-columns:repeat(5,1fr)!important;}}
  @media(min-width:600px){.venue-g{grid-template-columns:repeat(4,1fr)!important;}}
`;

/* ── Progress bar ── */
function Progress({step,withTheme}){
  const labels=withTheme?["Details","Guests","Theme","Services","Gifts","Plan"]:["Details","Guests","Services","Gifts","Plan"];
  const cur=withTheme?step:(step<=2?step:step>=4?step-1:step);
  return(
    <div style={{padding:"0 20px 0"}}>
      <div style={{display:"flex",gap:3,marginBottom:8}}>
        {labels.map((_,i)=>(
          <div key={i} style={{flex:1,height:2,borderRadius:1,background:i<cur?gold:"rgba(196,122,46,0.14)",transition:"background 0.3s"}}/>
        ))}
      </div>
      <div style={{display:"flex",gap:0,overflow:"hidden"}}>
        {labels.map((l,i)=>(
          <div key={l} style={{flex:1,fontSize:9,fontWeight:i+1===cur?700:400,color:i+1===cur?gold:"rgba(196,122,46,0.35)",fontFamily:font,textAlign:"center",textTransform:"uppercase",letterSpacing:"0.06em",transition:"all 0.3s",paddingBottom:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── MAIN ─────────────────── */
export default function OccasionDetail(){
  const {slug}=useParams();
  const navigate=useNavigate();
  const [searchParams]=useSearchParams();
  const cardRef=useRef(null);

  const [planMode,setPlanMode]=useState(null);
  const [step,setStep]=useState(0);
  const [guests,setGuests]=useState(20);
  const [date,setDate]=useState("");
  const [budget,setBudget]=useState("");
  const [city,setCity]=useState("");
  const [venueType,setVenueType]=useState("");
  const [ageGroups,setAgeGroups]=useState([]);
  const [theme,setTheme]=useState(null);
  const [vendors,setVendors]=useState([]);
  const [cateringType,setCateringType]=useState("");
  const [cakeType,setCakeType]=useState("");
  const [inviteType,setInviteType]=useState("");
  const [customVendor,setCustomVendor]=useState("");
  const [expandedTip,setExpandedTip]=useState(null);
  const [gifts,setGifts]=useState([]);
  const [checked,setChecked]=useState({});
  const [vendorPackages,setVendorPackages]=useState({});
  const [downloading,setDownloading]=useState(false);
  const [savedPlan,setSavedPlan]=useState(null);
  const dateInputRef=useRef(null);

  const PLAN_KEY=`tendr-plan-${slug}`;

  /* load saved plan on mount */
  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(PLAN_KEY)||"null");
      if(saved&&saved.step>0) setSavedPlan(saved);
    }catch{}
    /* honour ?planMode= from home modal */
    const pm=searchParams.get("planMode");
    if(pm==="with"||pm==="without"){setPlanMode(pm);setStep(1);}
  },[slug]);

  /* save on any change */
  useEffect(()=>{
    if(step>0){
      localStorage.setItem(PLAN_KEY,JSON.stringify({
        planMode,step,guests,date,budget,city,venueType,
        ageGroups,theme,vendors,vendorPackages,cateringType,cakeType,inviteType,gifts,checked,
        savedAt:new Date().toISOString(),
      }));
    }
  },[planMode,step,guests,date,budget,city,venueType,ageGroups,theme,vendors,vendorPackages,cateringType,cakeType,inviteType,gifts,checked]);

  function restorePlan(s){
    setPlanMode(s.planMode);setStep(s.step);setGuests(s.guests||20);
    setDate(s.date||"");setBudget(s.budget||"");setCity(s.city||"");
    setVenueType(s.venueType||"");setAgeGroups(s.ageGroups||[]);
    setTheme(s.theme||null);setVendors(s.vendors||[]);
    setVendorPackages(s.vendorPackages||{});
    setCateringType(s.cateringType||"");setCakeType(s.cakeType||"");
    setInviteType(s.inviteType||"");setGifts(s.gifts||[]);
    setChecked(s.checked||{});setSavedPlan(null);
  }

  const occasion=getOccasionById(slug);
  if(!occasion){navigate("/");return null;}

  const hub=HUB_ROUTES[slug];
  const equipment=getEquipment(slug,guests);
  const withTheme=planMode==="with";
  const recommended=getRecommended(occasion,theme,ageGroups,venueType);
  const tasksDone=Object.values(checked).filter(Boolean).length;
  const tasksTotal=(occasion.checklist||[]).length;
  const catVendors=vendors.filter(v=>(occasion.vendorCategories||[]).includes(v)||ALL_VENDORS.includes(v));
  const timeline=buildTimeline(date,vendors);
  const budgetSplit=buildBudgetSplit(budget);

  /* vendor link URL */
  const vendorUrl=(cat)=>{
    const params=new URLSearchParams({serviceType:cat});
    if(city.trim()) params.set("city",city.trim());
    if(venueType) params.set("venueType",venueType);
    return `/listings?${params.toString()}`;
  };

  const smartVendors=getSmartVendors(occasion,theme,ageGroups,venueType);
  const mainVendors=vendors.filter(v=>ALL_VENDORS.includes(v));
  const allVendorsChosen=mainVendors.length>0&&mainVendors.every(v=>vendorPackages[v]!==undefined);

  /* navigation */
  const next=()=>{
    if(step===1){setStep(2);return;}
    if(step===2){
      const toStep=withTheme?3:4;
      setStep(toStep);
      if(toStep===4&&vendors.length===0) setVendors(smartVendors);
      return;
    }
    if(step===3){setStep(4);if(vendors.length===0)setVendors(smartVendors);return;}
    setStep(s=>Math.min(s+1,6));
  };
  const back=()=>{
    if(step===0){navigate(-1);return;}
    if(step===1){setStep(0);return;}
    if(step===2){setStep(1);return;}
    if(step===4&&!withTheme){setStep(2);return;}
    setStep(s=>s-1);
  };
  const canNext=()=>{
    if(step===1) return !!date&&guests>0;
    return true;
  };

  const toggleVendor=c=>setVendors(v=>v.includes(c)?v.filter(x=>x!==c):[...v,c]);
  const toggleGift=n=>setGifts(g=>g.includes(n)?g.filter(x=>x!==n):[...g,n]);
  const toggleAge=id=>setAgeGroups(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);

  const addCustomVendor=()=>{
    if(!customVendor.trim())return;
    if(!vendors.includes(customVendor.trim())) toggleVendor(customVendor.trim());
    setCustomVendor("");
  };

  /* styles */
  const btnPrimary={flex:1,padding:"15px 20px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:font,boxShadow:"0 4px 18px rgba(196,122,46,0.26)",transition:"all 0.2s",letterSpacing:"0.01em",opacity:canNext()?1:0.45};
  const btnGhost={padding:"13px 18px",borderRadius:14,border:`1.5px solid rgba(196,122,46,0.22)`,background:"transparent",color:gold,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:font,transition:"all 0.2s",whiteSpace:"nowrap"};
  const sLabel={fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontFamily:font};
  const fieldCard={background:"#fff",borderRadius:18,padding:"20px 22px",border:`1.5px solid ${border}`,marginBottom:12,transition:"border-color 0.2s"};

  /* theme-aware gift sort */
  const sortedGifts=[...(occasion.giftIdeas||[])].sort((a,b)=>{
    if(!theme) return 0;
    const tags=(theme.tags||[]).join(" ").toLowerCase();
    const score=x=>[x.name,x.desc||""].join(" ").toLowerCase().split(/\s+/).filter(w=>tags.includes(w)).length;
    return score(b)-score(a);
  });

  return(
    <div style={{minHeight:"100dvh",background:bg,fontFamily:font,display:"flex",flexDirection:"column"}}>
      <style>{css}</style>
      <SEO title={`Plan your ${occasion.name} — Tendr`} description={`Guided ${occasion.name} planner`} path={`/occasions/${slug}`}/>

      {/* sticky header */}
      <div style={{position:"sticky",top:0,zIndex:100,background:bg,borderBottom:`1px solid ${border}`}}>
        <HamburgerNav active="Occasions"/>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 20px 6px"}}>
          <button onClick={back} style={{width:36,height:36,borderRadius:10,border:"none",background:"rgba(196,122,46,0.08)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <span style={{fontSize:22}}>{occasion.icon}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:800,color:ink,letterSpacing:"-0.01em"}}>{occasion.name}</div>
            {occasion.localName&&<div style={{fontSize:10,color:gold,fontWeight:600}}>{occasion.localName}</div>}
          </div>
          {hub&&<button onClick={()=>navigate(hub)} style={{fontSize:11,fontWeight:700,color:"#7C3AED",background:"rgba(124,58,237,0.07)",border:"1px solid rgba(124,58,237,0.18)",borderRadius:8,padding:"6px 11px",cursor:"pointer",fontFamily:font,flexShrink:0}}>🛠️ Tools</button>}
        </div>
        {step>0&&<Progress step={step} withTheme={withTheme}/>}
      </div>

      {/* content */}
      <div style={{flex:1,overflowY:"auto",padding:"28px 20px 140px",maxWidth:680,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {/* ══ STEP 0: mode choice ══ */}
        {step===0&&(
          <div className="os" style={{paddingBottom:0}}>
            {/* Occasion hero — photo backdrop */}
            <div style={{position:"relative",borderRadius:24,overflow:"hidden",marginBottom:24,height:180}}>
              <img src={occasion.coverImage} alt={occasion.name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:`linear-gradient(160deg,${ink}CC 0%,${ink}88 55%,${ink}44 100%)`}}/>
              <div style={{position:"absolute",inset:0,padding:"22px 22px 20px",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                <div style={{fontSize:36,marginBottom:8,lineHeight:1}}>{occasion.icon}</div>
                <div style={{fontFamily:serif,fontSize:"clamp(1.4rem,4vw,1.8rem)",fontWeight:500,color:"#fff",lineHeight:1.2,letterSpacing:"-0.02em"}}>{occasion.name}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:4}}>{occasion.tagline}</div>
              </div>
            </div>

            {/* saved plan banner */}
            {savedPlan&&(
              <div style={{background:"rgba(196,122,46,0.06)",border:`1.5px solid rgba(196,122,46,0.18)`,borderRadius:16,padding:"14px 16px",marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:32,height:32,borderRadius:10,background:"rgba(196,122,46,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📋</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:gold}}>Saved plan · {timeAgo(savedPlan.savedAt)}</div>
                    <div style={{fontSize:11,color:muted,marginTop:1}}>{savedPlan.guests} guests{savedPlan.date?` · ${new Date(savedPlan.date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"})}`:""}
                    {savedPlan.city?` · ${savedPlan.city}`:""}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>restorePlan(savedPlan)} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",background:gold,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:font}}>Continue plan</button>
                  <button onClick={()=>{setSavedPlan(null);localStorage.removeItem(PLAN_KEY);}} style={{padding:"10px 14px",borderRadius:10,border:`1px solid rgba(196,122,46,0.18)`,background:"transparent",color:muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:font,whiteSpace:"nowrap"}}>Start fresh</button>
                </div>
              </div>
            )}

            <p style={{fontSize:11,fontWeight:700,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",margin:"0 0 6px",fontFamily:font}}>How would you like to plan?</p>
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,4vw,1.7rem)",color:ink,lineHeight:1.2,margin:"0 0 20px",letterSpacing:"-0.01em",fontWeight:400}}>Choose your approach</p>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* ── With Theme ── */}
              <button onClick={()=>{setPlanMode("with");setStep(1);}}
                style={{padding:"22px 20px",borderRadius:20,textAlign:"left",cursor:"pointer",border:"none",
                  background:`linear-gradient(135deg, rgba(196,122,46,0.11) 0%, rgba(196,122,46,0.04) 100%)`,
                  fontFamily:font,position:"relative",overflow:"hidden",transition:"transform 0.18s,box-shadow 0.18s",
                  boxShadow:"0 2px 12px rgba(196,122,46,0.08)"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(196,122,46,0.18)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 12px rgba(196,122,46,0.08)";}}>
                {/* decorative circle */}
                <div style={{position:"absolute",right:-30,top:-30,width:120,height:120,borderRadius:"50%",background:"rgba(196,122,46,0.08)",pointerEvents:"none"}}/>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,position:"relative"}}>
                  <div style={{width:50,height:50,borderRadius:16,background:`linear-gradient(135deg,${gold},${goldLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:`0 6px 16px rgba(196,122,46,0.3)`}}>🎨</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                      <div style={{fontFamily:serif,fontSize:17,fontWeight:500,color:ink}}>Plan with a Theme</div>
                      <span style={{fontSize:9,fontWeight:800,color:"#fff",background:gold,borderRadius:100,padding:"2px 7px",letterSpacing:"0.06em",textTransform:"uppercase",flexShrink:0}}>Best</span>
                    </div>
                    <p style={{fontSize:12.5,color:muted,margin:"0 0 12px",lineHeight:1.6}}>Pick a look — we'll customise vendors, décor, gifts and the full plan around it.</p>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {["Theme picker","Tailored vendors","Full blueprint"].map(t=>(
                        <span key={t} style={{fontSize:10,fontWeight:600,color:gold,background:"rgba(196,122,46,0.09)",border:"1px solid rgba(196,122,46,0.16)",borderRadius:100,padding:"3px 9px"}}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <svg style={{flexShrink:0,marginTop:14}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </button>

              {/* ── Jump straight in ── */}
              <button onClick={()=>{setPlanMode("without");setStep(1);}}
                style={{padding:"22px 20px",borderRadius:20,textAlign:"left",cursor:"pointer",
                  border:`1.5px solid rgba(28,9,0,0.08)`,background:"#fff",
                  fontFamily:font,position:"relative",overflow:"hidden",transition:"transform 0.18s,box-shadow 0.18s",
                  boxShadow:"0 2px 8px rgba(28,9,0,0.04)"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(28,9,0,0.08)";e.currentTarget.style.borderColor="rgba(196,122,46,0.25)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 8px rgba(28,9,0,0.04)";e.currentTarget.style.borderColor="rgba(28,9,0,0.08)";}}>
                <div style={{position:"absolute",right:-30,top:-30,width:120,height:120,borderRadius:"50%",background:"rgba(28,9,0,0.02)",pointerEvents:"none"}}/>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,position:"relative"}}>
                  <div style={{width:50,height:50,borderRadius:16,background:"rgba(28,9,0,0.05)",border:"1.5px solid rgba(28,9,0,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>⚡</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:serif,fontSize:17,fontWeight:500,color:ink,marginBottom:4}}>Jump straight in</div>
                    <p style={{fontSize:12.5,color:muted,margin:"0 0 12px",lineHeight:1.6}}>Skip the theme — go straight to vendors, timeline and budget.</p>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {["Faster","Direct to vendors"].map(t=>(
                        <span key={t} style={{fontSize:10,fontWeight:600,color:"rgba(28,9,0,0.38)",background:"rgba(28,9,0,0.04)",border:"1px solid rgba(28,9,0,0.08)",borderRadius:100,padding:"3px 9px"}}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <svg style={{flexShrink:0,marginTop:14}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(28,9,0,0.25)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 1: details (sentence form) ══ */}
        {step===1&&(
          <div className="os">
            {/* heading */}
            <div style={{marginBottom:36}}>
              <div style={{fontSize:11,fontWeight:700,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:10,fontFamily:font}}>Tell us about your celebration</div>
              <div style={{fontFamily:serif,fontSize:"clamp(1.6rem,4vw,2.2rem)",color:ink,lineHeight:1.2,letterSpacing:"-0.01em"}}>
                {occasion.name} <span style={{fontSize:"0.75em"}}>{occasion.icon}</span>
              </div>
            </div>

            {/* ── sentence rows ── */}
            <div style={{display:"flex",flexDirection:"column"}}>

              {/* for N guests */}
              <div style={{paddingBottom:28,borderBottom:`1px solid rgba(196,122,46,0.08)`,marginBottom:28}}>
                <div style={{fontSize:12,color:muted,fontWeight:500,marginBottom:10,fontFamily:font,letterSpacing:"0.02em"}}>for how many guests?</div>
                <div style={{display:"flex",alignItems:"center",gap:0}}>
                  <button onClick={()=>setGuests(g=>Math.max(5,g-5))}
                    style={{width:44,height:52,borderRadius:"12px 0 0 12px",border:`1.5px solid rgba(196,122,46,0.2)`,borderRight:"none",background:"#F8F4EF",color:gold,fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:300,transition:"background 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(196,122,46,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="#F8F4EF"}>−</button>
                  <div style={{height:52,flex:1,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid rgba(196,122,46,0.2)`,background:"#fff",borderLeft:"none",borderRight:"none"}}>
                    <span style={{fontFamily:serif,fontSize:32,fontWeight:900,color:ink,letterSpacing:"-0.03em"}}>{guests}</span>
                    <span style={{fontSize:13,color:muted,marginLeft:8}}>guests</span>
                  </div>
                  <button onClick={()=>setGuests(g=>g+5)}
                    style={{width:44,height:52,borderRadius:"0 12px 12px 0",border:"none",background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:300,boxShadow:"0 3px 10px rgba(196,122,46,0.3)"}}>+</button>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
                  {[10,20,30,50,75,100,150].map(n=>(
                    <button key={n} onClick={()=>setGuests(n)}
                      style={{fontSize:12,fontWeight:600,padding:"5px 12px",borderRadius:100,border:`1.5px solid ${guests===n?gold:"rgba(196,122,46,0.14)"}`,background:guests===n?"rgba(196,122,46,0.09)":"transparent",color:guests===n?gold:muted,cursor:"pointer",fontFamily:font,transition:"all 0.15s"}}>{n}</button>
                  ))}
                </div>
              </div>

              {/* on [date] */}
              <div style={{paddingBottom:28,borderBottom:`1px solid rgba(196,122,46,0.08)`,marginBottom:28}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:12,color:muted,fontWeight:500,fontFamily:font,letterSpacing:"0.02em"}}>on what date?</div>
                  {!date&&<span style={{fontSize:10,color:"#E05252",fontWeight:800,letterSpacing:"0.08em"}}>Required</span>}
                  {date&&<span style={{fontSize:10,color:gold,fontWeight:700}}>✓ {timeline?.days} days away</span>}
                </div>
                <div style={{display:"block",position:"relative",cursor:"pointer"}} onClick={()=>{try{dateInputRef.current?.showPicker?.()}catch{dateInputRef.current?.click()}}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderRadius:12,border:`1.5px solid ${date?gold:"rgba(196,122,46,0.18)"}`,background:date?"rgba(196,122,46,0.04)":"#fff",transition:"all 0.2s"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={date?gold:muted} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style={{fontFamily:serif,fontSize:20,fontWeight:date?700:400,color:date?ink:muted,flex:1,letterSpacing:"-0.01em"}}>
                      {date?new Date(date+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long",year:"numeric"}):"Pick a date"}
                    </span>
                    {date&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <input ref={dateInputRef} type="date" value={date} onChange={e=>setDate(e.target.value)}
                    style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%",pointerEvents:"none"}}/>
                </div>
              </div>

              {/* at [venue] */}
              <div style={{paddingBottom:28,borderBottom:`1px solid rgba(196,122,46,0.08)`,marginBottom:28}}>
                <div style={{fontSize:12,color:muted,fontWeight:500,marginBottom:10,fontFamily:font,letterSpacing:"0.02em"}}>at what kind of venue?</div>
                <div className="venue-g" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                  {VENUE_TYPES.map(v=>{
                    const sel=venueType===v.id;
                    return(
                      <button key={v.id} onClick={()=>setVenueType(t=>t===v.id?"":v.id)}
                        style={{display:"flex",alignItems:"center",gap:9,padding:"11px 14px",borderRadius:12,border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.12)"}`,background:sel?"rgba(196,122,46,0.07)":"#fff",cursor:"pointer",fontFamily:font,transition:"all 0.16s",textAlign:"left",minHeight:44}}>
                        <span style={{fontSize:17,flexShrink:0,lineHeight:1}}>{v.icon}</span>
                        <span style={{fontSize:12.5,fontWeight:sel?700:500,color:sel?gold:ink,lineHeight:1.3}}>{v.id}</span>
                        {sel&&<svg style={{marginLeft:"auto",flexShrink:0}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* in [city] */}
              <div style={{paddingBottom:28,borderBottom:`1px solid rgba(196,122,46,0.08)`,marginBottom:28}}>
                <div style={{fontSize:12,color:muted,fontWeight:500,marginBottom:10,fontFamily:font,letterSpacing:"0.02em"}}>in which city?</div>
                <div style={{position:"relative"}}>
                  <svg style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={city?gold:muted} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <input type="text" value={city} onChange={e=>setCity(e.target.value)}
                    placeholder="Delhi, Mumbai, Bengaluru…"
                    style={{width:"100%",padding:"14px 14px 14px 40px",borderRadius:12,border:`1.5px solid ${city?gold:"rgba(196,122,46,0.18)"}`,background:city?"rgba(196,122,46,0.03)":"#fff",fontSize:16,fontFamily:serif,fontWeight:city?700:400,color:city?ink:muted,outline:"none",boxSizing:"border-box",transition:"all 0.2s"}}/>
                </div>
                <div style={{fontSize:11,color:muted,marginTop:7}}>We'll show vendors near you</div>
              </div>

              {/* budget */}
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:12,color:muted,fontWeight:500,fontFamily:font,letterSpacing:"0.02em"}}>what's your budget?</div>
                  <span style={{fontSize:10,color:muted,fontWeight:500}}>optional</span>
                </div>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:18,fontWeight:700,color:budget?gold:"rgba(196,122,46,0.25)",fontFamily:serif}}>₹</span>
                  <input type="number" value={budget} onChange={e=>setBudget(e.target.value)}
                    placeholder={String(Math.round((occasion.budgetMin+occasion.budgetMax)/2))}
                    style={{width:"100%",padding:"14px 14px 14px 34px",borderRadius:12,border:`1.5px solid ${budget?gold:"rgba(196,122,46,0.18)"}`,background:budget?"rgba(196,122,46,0.03)":"#fff",fontSize:16,fontFamily:serif,fontWeight:budget?700:400,color:budget?ink:muted,outline:"none",boxSizing:"border-box",transition:"all 0.2s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:7}}>
                  <span style={{fontSize:11,color:"rgba(30,15,0,0.28)"}}>Typical for {guests} guests</span>
                  <span style={{fontSize:11,fontWeight:700,color:gold}}>{fmtNum(occasion.budgetMin)} – {fmtNum(occasion.budgetMax)}</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══ STEP 2: who's coming ══ */}
        {step===2&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:6}}>Who's coming?</p>
            <p style={{fontSize:13,color:muted,marginBottom:28,lineHeight:1.6}}>Helps us tailor entertainment and catering to your crowd.</p>
            <div className="age-g" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {AGE_GROUPS.map(ag=>{
                const sel=ageGroups.includes(ag.id);
                return(
                  <button key={ag.id} onClick={()=>toggleAge(ag.id)}
                    style={{padding:"18px 10px",borderRadius:16,border:`1.5px solid ${sel?gold:border}`,background:sel?"rgba(196,122,46,0.07)":"#fff",cursor:"pointer",textAlign:"center",transition:"all 0.18s",display:"flex",flexDirection:"column",alignItems:"center",gap:8,minHeight:44}}>
                    <span style={{fontSize:26}}>{ag.icon}</span>
                    <div style={{fontSize:13,fontWeight:700,color:sel?gold:ink}}>{ag.label}</div>
                    <div style={{fontSize:10,color:muted}}>{ag.sub}</div>
                    {sel&&<div style={{width:6,height:6,borderRadius:"50%",background:gold,marginTop:2}}/>}
                  </button>
                );
              })}
            </div>
            {ageGroups.length===0&&<p style={{fontSize:12,color:"rgba(30,15,0,0.28)",textAlign:"center",marginTop:18}}>Select all that apply — or skip to continue</p>}
          </div>
        )}

        {/* ══ STEP 3: theme ══ */}
        {step===3&&withTheme&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:6}}>Pick your vibe</p>
            <p style={{fontSize:13,color:muted,marginBottom:24,lineHeight:1.6}}>Sets the look for everything — décor advice, vendor tips and gift suggestions will match.</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {(occasion.decorThemes||[]).map((t,i)=>{
                const sel=theme?.name===t.name;
                const tc=themeColor(t.tags);
                return(
                  <button key={i} onClick={()=>setTheme(sel?null:t)}
                    style={{padding:"16px 18px",borderRadius:16,border:`1.5px solid ${sel?gold:border}`,background:sel?"rgba(196,122,46,0.06)":"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.2s",display:"flex",alignItems:"center",gap:14,minHeight:44}}
                    onMouseEnter={e=>{if(!sel){e.currentTarget.style.borderColor="rgba(196,122,46,0.32)";e.currentTarget.style.transform="translateY(-1px)";}}}
                    onMouseLeave={e=>{if(!sel){e.currentTarget.style.borderColor=border;e.currentTarget.style.transform="translateY(0)";}}}
                  >
                    <div style={{width:32,height:32,borderRadius:9,background:tc,flexShrink:0,boxShadow:`0 2px 8px ${tc}60`}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:sel?gold:ink}}>{t.name}</div>
                      <div style={{fontSize:11,color:muted,marginTop:2}}>{(t.tags||[]).join(" · ")}</div>
                    </div>
                    {sel&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                );
              })}
            </div>
            {!theme&&<p style={{fontSize:12,color:"rgba(30,15,0,0.28)",textAlign:"center",marginTop:14}}>Tap to select — or skip to continue without a theme</p>}
          </div>
        )}

        {/* ══ STEP 4: services ══ */}
        {step===4&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:10}}>Services for your plan</p>

            {/* context pills */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
              <span style={{fontSize:11,fontWeight:600,color:muted,background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"4px 10px"}}>{guests} guests</span>
              {venueType&&<span style={{fontSize:11,fontWeight:600,color:muted,background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"4px 10px"}}>{venueType}</span>}
              {city&&<span style={{fontSize:11,fontWeight:600,color:muted,background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"4px 10px"}}>{city}</span>}
              {theme&&<span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:gold,background:"rgba(196,122,46,0.07)",border:`1px solid rgba(196,122,46,0.18)`,borderRadius:100,padding:"4px 10px"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:themeColor(theme.tags),flexShrink:0}}/>{theme.name}
              </span>}
            </div>

            {/* vendor package cards */}
            {vendors.map(v=>{
              const isKnown=ALL_VENDORS.includes(v);
              const pkgs=isKnown?getVendorPackages(v,{guests,venueType,theme,ageGroups}):null;
              const chosen=vendorPackages[v];
              const tips=isKnown?getVendorTips(v,{theme,venueType,ageGroups,cateringType}):null;
              const isRec=recommended.has(v);
              return(
                <div key={v} style={{marginBottom:12,borderRadius:18,border:`1.5px solid ${chosen!==undefined?gold:border}`,background:"#fff",overflow:"hidden",transition:"border-color 0.2s"}}>
                  {/* header */}
                  <div style={{padding:"14px 18px 12px",background:chosen!==undefined?"rgba(196,122,46,0.04)":"#fff"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:14,fontWeight:800,color:chosen!==undefined?gold:ink}}>{v}</span>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {chosen!==undefined&&<span style={{fontSize:9,fontWeight:800,color:gold,background:"rgba(196,122,46,0.1)",border:`1px solid rgba(196,122,46,0.22)`,borderRadius:100,padding:"2px 8px"}}>Chosen</span>}
                        {isRec&&chosen===undefined&&<span style={{fontSize:9,fontWeight:800,color:"#fff",background:gold,borderRadius:100,padding:"2px 8px",letterSpacing:"0.04em"}}>For you</span>}
                      </div>
                    </div>
                    {tips&&<p style={{fontSize:11.5,color:muted,margin:0,lineHeight:1.5}}>{tips.tip.replace("Tip: ","")}</p>}
                  </div>

                  {/* packages — only for known vendor types */}
                  {pkgs&&(
                    <div style={{borderTop:`1px solid rgba(196,122,46,0.08)`,padding:"12px 18px 14px"}}>
                      <div style={{fontSize:9,fontWeight:800,color:"rgba(196,122,46,0.5)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Pick a package</div>
                      <div style={{display:"flex",flexDirection:"column",gap:7}}>
                        {pkgs.map((pkg,pi)=>{
                          const sel=chosen===pi;
                          return(
                            <button key={pkg.label} onClick={()=>setVendorPackages(vp=>({...vp,[v]:pi}))}
                              style={{textAlign:"left",padding:"11px 14px",borderRadius:12,border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.12)"}`,background:sel?"rgba(196,122,46,0.07)":"#fff",cursor:"pointer",fontFamily:font,transition:"all 0.18s"}}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${sel?gold:"rgba(196,122,46,0.22)"}`,background:sel?gold:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s"}}>
                                    {sel&&<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                  </div>
                                  <span style={{fontSize:13,fontWeight:700,color:sel?gold:ink}}>{pkg.label}</span>
                                  {pkg.popular&&<span style={{fontSize:9,fontWeight:800,color:gold,background:"rgba(196,122,46,0.1)",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:100,padding:"1px 7px"}}>Popular</span>}
                                </div>
                                <span style={{fontSize:11.5,fontWeight:700,color:sel?gold:"rgba(196,122,46,0.55)",flexShrink:0,marginLeft:8}}>≈{pkg.price}</span>
                              </div>
                              <div style={{marginLeft:24,display:"flex",flexDirection:"column",gap:2}}>
                                {pkg.items.map((it,ii)=><div key={ii} style={{fontSize:11,color:sel?ink:muted,lineHeight:1.45}}>· {it}</div>)}
                              </div>
                              {sel&&pkg.note&&<div style={{marginLeft:24,marginTop:6,fontSize:11,color:gold,fontWeight:600,fontStyle:"italic"}}>{pkg.note}</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* remove */}
                  <div style={{padding:"0 18px 12px"}}>
                    <button onClick={()=>{toggleVendor(v);setVendorPackages(vp=>{const n={...vp};delete n[v];return n;});}}
                      style={{fontSize:11,color:"rgba(30,15,0,0.3)",background:"none",border:"none",cursor:"pointer",fontFamily:font,padding:"4px 0"}}>
                      Remove {v}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* add more */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,fontWeight:800,color:"rgba(196,122,46,0.4)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Add more services</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
                {ALL_VENDORS.filter(v=>!vendors.includes(v)).map(v=>(
                  <button key={v} onClick={()=>toggleVendor(v)} className="chip" style={{fontSize:12,padding:"6px 12px"}}>+ {v}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="text" value={customVendor} onChange={e=>setCustomVendor(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")addCustomVendor();}}
                  placeholder="Add a custom service…"
                  style={{flex:1,padding:"9px 14px",borderRadius:100,border:`1.5px solid ${border}`,background:"#fff",fontSize:12,fontFamily:font,outline:"none",minHeight:38}}/>
                {customVendor.trim()&&<button onClick={addCustomVendor} style={{width:36,height:36,borderRadius:"50%",background:gold,border:"none",color:"#fff",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:300,flexShrink:0}}>+</button>}
              </div>
            </div>

            {/* all-chosen completion banner */}
            {allVendorsChosen&&vendors.length>0&&(
              <div style={{background:`linear-gradient(135deg,rgba(196,122,46,0.1),rgba(212,168,72,0.05))`,border:`2px solid ${gold}`,borderRadius:20,padding:"20px 20px 16px",marginTop:4}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:36,height:36,borderRadius:12,background:`linear-gradient(135deg,${gold},${goldLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>✦</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:ink}}>Vendor plan complete</div>
                    <div style={{fontSize:11,color:muted,marginTop:1}}>{mainVendors.length} services selected — send to Tendr to book</div>
                  </div>
                </div>
                <a href={buildBaatKaroMsg(occasion,{guests,date,city,venueType,theme,vendors,vendorPackages,budget})}
                  target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:10,padding:"13px 16px",borderRadius:12,background:"#25D366",textDecoration:"none",marginBottom:8}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.942-1.42A9.959 9.959 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 01-4.065-1.112l-.29-.173-3.013.866.847-3.093-.19-.307A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Send to Baat Karo</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.82)",marginTop:1}}>We'll help you book all {mainVendors.length} vendors</div>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <button onClick={next}
                  style={{width:"100%",padding:"11px 0",borderRadius:12,border:`1.5px solid rgba(196,122,46,0.3)`,background:"transparent",color:gold,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:font}}>
                  Continue — see full plan →
                </button>
              </div>
            )}

            {/* theme hint when no vendors yet */}
            {theme&&vendors.length===0&&(
              <div style={{background:"rgba(196,122,46,0.05)",border:`1px solid ${border}`,borderRadius:14,padding:"14px 16px",marginTop:8}}>
                <div style={{...sLabel,marginBottom:6}}>About {theme.name}</div>
                <p style={{fontSize:12.5,color:muted,margin:0,lineHeight:1.6}}>{theme.desc}</p>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 5: gifts ══ */}
        {step===5&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:6}}>Any gifts?</p>
            <p style={{fontSize:13,color:muted,marginBottom:24,lineHeight:1.6}}>Add to your plan or skip straight to the blueprint.</p>
            {theme&&<div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(196,122,46,0.07)",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:100,padding:"4px 12px",marginBottom:16}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:themeColor(theme.tags)}}/>
              <span style={{fontSize:11,fontWeight:700,color:gold}}>Curated for {theme.name}</span>
            </div>}
            <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr",gap:10}}>
              {sortedGifts.map((g,i)=>{
                const sel=gifts.includes(g.name);
                return(
                  <button key={i} onClick={()=>toggleGift(g.name)}
                    style={{padding:"15px 16px",borderRadius:14,textAlign:"left",cursor:"pointer",border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.12)"}`,background:sel?"rgba(196,122,46,0.06)":"#fff",fontFamily:font,transition:"all 0.18s",minHeight:44}}
                    onMouseEnter={e=>{if(!sel)e.currentTarget.style.borderColor="rgba(196,122,46,0.3)";}}
                    onMouseLeave={e=>{if(!sel)e.currentTarget.style.borderColor="rgba(196,122,46,0.12)";}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:5}}>
                      <div style={{fontSize:13,fontWeight:700,color:sel?gold:ink,lineHeight:1.3}}>{g.name}</div>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${sel?gold:"rgba(196,122,46,0.18)"}`,background:sel?gold:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s",marginTop:1}}>
                        {sel&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </div>
                    <div style={{fontSize:11.5,color:muted,lineHeight:1.5,marginBottom:6}}>{(g.desc||"").slice(0,70)}{(g.desc||"").length>70?"…":""}</div>
                    <div style={{display:"inline-block",fontSize:11.5,fontWeight:800,color:gold,background:"rgba(196,122,46,0.08)",borderRadius:100,padding:"3px 10px"}}>{g.price}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ STEP 6: blueprint ══ */}
        {step===6&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:4}}>Your plan is ready ✦</p>
            <p style={{fontSize:13,color:muted,marginBottom:24,lineHeight:1.6}}>Download your card, book your vendors, and tick off the list.</p>

            {/* downloadable card */}
            <div ref={cardRef} style={{background:"linear-gradient(145deg,#FFF8EE,#FFFDF7)",border:`1.5px solid rgba(196,122,46,0.2)`,borderRadius:20,overflow:"hidden",marginBottom:12}}>
              <div style={{background:`linear-gradient(135deg,${gold},${goldLt})`,padding:"18px 20px 16px",position:"relative",overflow:"hidden"}}>
                <div aria-hidden style={{position:"absolute",top:-24,right:-24,width:90,height:90,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.14)"}}/>
                <div style={{display:"flex",alignItems:"center",gap:10,position:"relative"}}>
                  <span style={{fontSize:30}}>{occasion.icon}</span>
                  <div>
                    <div style={{fontFamily:serif,fontSize:18,fontWeight:400,color:"#fff",lineHeight:1.1}}>{occasion.name}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontWeight:600,marginTop:2,fontFamily:font}}>Celebration Plan · Tendr</div>
                  </div>
                </div>
              </div>
              <div style={{padding:"16px 18px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  {[
                    {icon:"👥",label:"Guests",val:`${guests} people`},
                    {icon:"💰",label:"Budget",val:budget?fmtNum(Number(budget)):`${fmtNum(occasion.budgetMin)}–${fmtNum(occasion.budgetMax)}`},
                    {icon:"📅",label:"Date",val:date?new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"TBD"},
                    {icon:"📍",label:"Location",val:city?(venueType?`${city} · ${venueType}`:city):(venueType||"TBD")},
                  ].map(({icon,label,val})=>(
                    <div key={label} style={{background:"#fff",borderRadius:10,padding:"10px 12px",border:`1px solid rgba(196,122,46,0.1)`}}>
                      <div style={{fontSize:9,fontWeight:700,color:"rgba(196,122,46,0.45)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2}}>{icon} {label}</div>
                      <div style={{fontSize:12.5,fontWeight:700,color:val==="TBD"?"rgba(30,15,0,0.25)":ink}}>{val}</div>
                    </div>
                  ))}
                </div>
                {theme&&<div style={{marginBottom:8,fontSize:11.5,fontWeight:700,color:gold}}>🎨 {theme.name} theme</div>}
                {cateringType&&<div style={{marginBottom:8,fontSize:11.5,color:muted}}>🍽️ {cateringType}{cakeType&&` · ${cakeType}`}{inviteType&&` · ${inviteType}`}</div>}
                {catVendors.length>0&&(
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:9,fontWeight:700,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Vendors needed</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {catVendors.map(v=><span key={v} style={{fontSize:10.5,fontWeight:600,color:gold,background:"rgba(196,122,46,0.08)",border:"1px solid rgba(196,122,46,0.16)",borderRadius:100,padding:"3px 9px"}}>{v}</span>)}
                    </div>
                  </div>
                )}
                <div style={{borderTop:`1px solid rgba(196,122,46,0.1)`,paddingTop:10,marginTop:2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:9.5,color:muted,fontFamily:font}}>Generated with Tendr</span>
                  <span style={{fontSize:10,letterSpacing:2}}>★★★★★</span>
                </div>
              </div>
            </div>

            {/* download button */}
            <button onClick={async()=>{setDownloading(true);await downloadPlanCard(cardRef.current,occasion.name);setDownloading(false);}} disabled={downloading}
              style={{width:"100%",padding:"13px 20px",borderRadius:12,border:`1px solid rgba(196,122,46,0.25)`,background:"#fff",color:gold,fontSize:13.5,fontWeight:700,cursor:downloading?"wait":"pointer",fontFamily:font,transition:"all 0.2s",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {downloading?<><div style={{width:15,height:15,borderRadius:"50%",border:`2px solid rgba(196,122,46,0.2)`,borderTopColor:gold,animation:"spin 0.7s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Generating…</>:<><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download Plan Card</>}
            </button>

            {/* timeline */}
            {timeline&&(
              <div style={{marginBottom:24}}>
                <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:16,fontFamily:font}}>Your timeline · {timeline.days} days to go</div>
                <div style={{position:"relative",paddingLeft:24}}>
                  <div style={{position:"absolute",left:7,top:8,bottom:8,width:1.5,background:`linear-gradient(180deg,${gold},rgba(196,122,46,0.1))`}}/>
                  {timeline.phases.map((p,i)=>(
                    <div key={i} style={{position:"relative",marginBottom:i<timeline.phases.length-1?20:0}}>
                      <div style={{position:"absolute",left:-21,top:2,width:10,height:10,borderRadius:"50%",background:i===timeline.phases.length-1?gold:"#fff",border:`2px solid ${gold}`}}/>
                      <div style={{fontSize:10.5,fontWeight:700,color:gold,marginBottom:4}}>{p.when}{p.date&&<span style={{color:muted,fontWeight:400,marginLeft:6}}>{p.date}</span>}</div>
                      {p.tasks.map((t,j)=><div key={j} style={{fontSize:12,color:muted,lineHeight:1.5,marginBottom:1}}>· {t}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* budget split */}
            {budgetSplit&&(
              <div style={{marginBottom:24}}>
                <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:14,fontFamily:font}}>Budget breakdown · {fmtNum(Number(budget))}</div>
                {budgetSplit.map(c=>(
                  <div key={c.label} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:600,color:ink}}>{c.label}</span>
                      <span style={{fontSize:12,fontWeight:700,color:gold}}>{fmtNum(c.amt)}</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"rgba(196,122,46,0.1)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${c.pct}%`,background:c.color,borderRadius:3,transition:"width 0.8s ease"}}/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* WhatsApp CTA — includes all selected vendors + packages */}
            <a href={buildBaatKaroMsg(occasion,{guests,date,city,venueType,theme,vendors,vendorPackages,budget})}
              target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderRadius:14,background:"#25D366",marginBottom:20,textDecoration:"none",transition:"opacity 0.18s"}}
              onMouseEnter={e=>{e.currentTarget.style.opacity="0.88";}} onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.942-1.42A9.959 9.959 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 01-4.065-1.112l-.29-.173-3.013.866.847-3.093-.19-.307A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"#fff",lineHeight:1.2}}>Baat Karo — Book via Tendr</div>
                <div style={{fontSize:11.5,color:"rgba(255,255,255,0.82)",marginTop:2}}>{vendors.length>0?`${vendors.length} vendors ready — share plan & we'll book`:"Chat on WhatsApp — we'll help you plan"}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

            {/* gifts */}
            {gifts.length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontFamily:font}}>Gift ideas</div>
                {gifts.map(name=>{
                  const g=(occasion.giftIdeas||[]).find(g=>g.name===name);
                  return g?(
                    <div key={name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderRadius:10,background:"#fff",border:`1px solid ${border}`,marginBottom:6}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:ink}}>{g.name}</div>
                        <div style={{fontSize:11,fontWeight:700,color:gold,marginTop:1}}>{g.price}</div>
                      </div>
                      <button onClick={()=>window.open("/gift-hampers-cakes","_blank","noopener")} style={{fontSize:11,fontWeight:700,color:gold,background:"rgba(196,122,46,0.07)",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontFamily:font}}>View ↗</button>
                    </div>
                  ):null;
                })}
              </div>
            )}

            {/* checklist */}
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:font}}>Checklist</div>
                {tasksDone>0&&<span style={{fontSize:11,fontWeight:700,color:gold}}>{tasksDone}/{tasksTotal}</span>}
              </div>
              {tasksDone>0&&(
                <div style={{height:4,background:"rgba(196,122,46,0.1)",borderRadius:2,overflow:"hidden",marginBottom:10}}>
                  <div style={{height:"100%",width:`${(tasksDone/tasksTotal)*100}%`,background:`linear-gradient(90deg,${gold},${goldLt})`,borderRadius:2,transition:"width 0.3s"}}/>
                </div>
              )}
              {(occasion.checklist||[]).map((item,i)=>(
                <div key={i} onClick={()=>setChecked(c=>({...c,[i]:!c[i]}))}
                  style={{display:"flex",alignItems:"flex-start",gap:10,padding:"11px 13px",background:checked[i]?"rgba(196,122,46,0.04)":"#fff",borderRadius:10,border:`1.5px solid ${checked[i]?"rgba(196,122,46,0.18)":border}`,marginBottom:5,cursor:"pointer",transition:"all 0.15s",minHeight:44,boxSizing:"border-box"}}>
                  <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${checked[i]?gold:"rgba(196,122,46,0.2)"}`,background:checked[i]?gold:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1,transition:"all 0.15s"}}>
                    {checked[i]&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{fontSize:12.5,color:checked[i]?"rgba(30,15,0,0.3)":ink,textDecoration:checked[i]?"line-through":"none",lineHeight:1.55,transition:"all 0.15s"}}>{item}</span>
                </div>
              ))}
            </div>

            {/* equipment */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontFamily:font}}>What to arrange · {guests} guests</div>
              {equipment.map(({cat,items})=>(
                <div key={cat} style={{marginBottom:12}}>
                  <div style={{fontSize:9.5,fontWeight:700,color:"rgba(196,122,46,0.5)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{cat}</div>
                  {items.map(({name,qty})=>(
                    <div key={name} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#fff",borderRadius:8,marginBottom:4,border:`1px solid rgba(196,122,46,0.08)`}}>
                      <span style={{fontSize:12.5,color:ink}}>{name}</span>
                      <span style={{fontSize:11.5,fontWeight:700,color:gold,flexShrink:0,marginLeft:8}}>{qty}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* hub banner */}
            {hub&&(
              <div onClick={()=>navigate(hub)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"linear-gradient(135deg,#1a0a2e,#2d1060)",borderRadius:14,cursor:"pointer",marginBottom:20}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>Party day is here? 🎉</div>
                  <div style={{fontSize:11,color:"rgba(167,139,250,0.8)",marginTop:2}}>Games, playlists, bill split & more</div>
                </div>
                <div style={{background:"rgba(124,58,237,0.35)",border:"1px solid rgba(124,58,237,0.5)",borderRadius:9,padding:"7px 13px",flexShrink:0}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#C4B5FD"}}>Open Hub →</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* fixed bottom CTA */}
      {step>0&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:bg,borderTop:`1px solid ${border}`,padding:"12px 20px calc(12px + env(safe-area-inset-bottom,0px))",zIndex:50}}>
          <div style={{maxWidth:680,margin:"0 auto",display:"flex",gap:10}}>
            {step>0&&<button onClick={back} style={btnGhost}>← Back</button>}
            {step<6&&(
              <button onClick={next} disabled={!canNext()} style={btnPrimary}>
                {step===1&&(!date?"Set a date first →":"Next — Who's coming? →")}
                {step===2&&"Next →"}
                {step===3&&(theme?`Use "${theme.name}" →`:"Skip — no theme →")}
                {step===4&&(vendors.length>0?allVendorsChosen?"Skip to Gifts →":"Choose packages above →":"Skip →")}
                {step===5&&(gifts.length>0?"See my plan →":"Skip — see plan →")}
              </button>
            )}
            {step===6&&(
              <button onClick={()=>window.open(buildBaatKaroMsg(occasion,{guests,date,city,venueType,theme,vendors,vendorPackages,budget}),"_blank","noopener")} style={btnPrimary}>
                Send to Baat Karo ↗
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

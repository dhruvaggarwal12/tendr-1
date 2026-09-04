import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setMultipleFormData, setBookingType } from "../../redux/eventPlanningSlice";
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
  "office-party":"\/office-party-hub",
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
  "AV Setup",
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

/* ── cuisine / menu builder data ── */
const CUISINES = [
  { id:"north-indian",  label:"North Indian",   icon:"🍛" },
  { id:"south-indian",  label:"South Indian",   icon:"🍚" },
  { id:"chinese",       label:"Chinese",        icon:"🥢" },
  { id:"continental",   label:"Continental",    icon:"🥗" },
  { id:"mughlai",       label:"Mughlai",        icon:"🍖" },
  { id:"street-food",   label:"Street Food",    icon:"🌮" },
  { id:"mixed",         label:"Mix of Everything", icon:"🎉" },
  { id:"desserts-only", label:"Desserts Only",  icon:"🍰" },
];

const MENU_ITEMS = {
  "north-indian":  { Starters:["Paneer Tikka","Hara Bhara Kabab","Aloo Tikki","Dahi Puri","Samosa","Chicken Tikka","Seekh Kabab","Veg Spring Rolls"], Mains:["Dal Makhani","Paneer Butter Masala","Chole","Rajma","Aloo Gobi","Butter Chicken","Mutton Curry","Fish Curry","Mix Veg"], Breads:["Tandoori Roti","Butter Naan","Garlic Naan","Paratha","Kulcha","Puri"], Rice:["Steamed Rice","Jeera Rice","Veg Biryani","Chicken Biryani","Mutton Biryani","Pulao"], Desserts:["Gulab Jamun","Kheer","Gajar Ka Halwa","Ras Malai","Kulfi","Ice Cream","Jalebi","Ladoo"], Beverages:["Lassi (sweet)","Lassi (salted)","Chaas","Nimbu Pani","Rose Sharbat","Mango Panna"] },
  "south-indian":  { Starters:["Masala Dosa","Vada","Idli","Uttapam","Mysore Bonda","Medu Vada"], Mains:["Sambar","Rasam","Avial","Kootu","Chettinad Chicken","Fish Curry (Malabar)","Egg Curry"], Breads:["Appam","Idiappam","Poori","Parotta"], Rice:["Plain Rice","Lemon Rice","Tamarind Rice","Coconut Rice","Curd Rice","Biryani (Hyderabadi)"], Desserts:["Payasam","Mysore Pak","Sweet Pongal","Banana Halwa","Paal Paniyaram"], Beverages:["Filter Coffee","Tender Coconut","Buttermilk","Panakam"] },
  "chinese":       { Starters:["Veg Manchurian","Chicken Manchurian","Chilli Paneer","Chilli Chicken","Crispy Corn","Spring Rolls","Veg Momos","Chicken Momos"], Mains:["Veg Hakka Noodles","Chicken Hakka Noodles","Schezwan Noodles","Kung Pao Chicken","Sweet & Sour Veg","Fried Rice"], Breads:["Garlic Bread","Steamed Buns"], Rice:["Veg Fried Rice","Egg Fried Rice","Chicken Fried Rice","Schezwan Fried Rice"], Desserts:["Banana Fritters","Honey Noodles","Date Pancake","Ice Cream"], Beverages:["Lychee Mocktail","Green Tea","Lemonade","Virgin Mojito"] },
  "continental":   { Starters:["Bruschetta","Cream of Mushroom Soup","Garden Salad","Caesar Salad","Stuffed Mushrooms","Garlic Bread"], Mains:["Pasta Arrabiata","Pasta Alfredo","Grilled Chicken","Grilled Fish","Pizza (assorted)","Baked Vegetables"], Breads:["Dinner Rolls","Garlic Bread","Focaccia","Ciabatta"], Rice:["Herb Rice","Spanish Rice","Risotto"], Desserts:["Chocolate Mousse","Tiramisu","Cheesecake","Panna Cotta","Brownie with Ice Cream"], Beverages:["Lemonade","Iced Tea","Virgin Sangria","Mocktail of the Day"] },
  "mughlai":       { Starters:["Galouti Kabab","Kakori Kabab","Chicken Seekh","Boti Kabab","Shami Kabab","Malai Tikka"], Mains:["Mutton Rogan Josh","Chicken Korma","Nihari","Keema Matar","Paneer Shahi Kofta","Dal Bukhara"], Breads:["Sheermal","Warqi Paratha","Rumali Roti","Naan","Tandoori Roti"], Rice:["Mutton Biryani","Chicken Biryani","Zafrani Pulao","Yakhni Pulao"], Desserts:["Shahi Tukda","Phirni","Sewai Kheer","Halwa"], Beverages:["Rose Sharbat","Thandai","Kesar Milk","Kala Khatta"] },
  "street-food":   { Starters:["Pani Puri","Dahi Puri","Bhel Puri","Sev Puri","Aloo Tikki Chaat","Raj Kachori"], Mains:["Pav Bhaji","Chole Bhature","Frankie / Kathi Roll","Vada Pav","Corn Chaat","Dahi Vada"], Breads:["Pav","Kulcha","Rumali Roti"], Rice:["Masala Khichdi","Veg Pulao"], Desserts:["Kulfi on Stick","Jalebi","Rabri","Malpua","Meetha Pani with Gol Gappe"], Beverages:["Aam Panna","Jaljeera","Sugarcane Juice","Nimbu Soda","Lassi"] },
  "mixed":         { Starters:["Paneer Tikka","Chicken Tikka","Spring Rolls","Bruschetta","Dahi Puri","Momos"], Mains:["Dal Makhani","Butter Chicken","Pasta","Stir Fry Veg","Chole","Fish Curry"], Breads:["Naan","Garlic Bread","Roti","Paratha"], Rice:["Jeera Rice","Veg Biryani","Chicken Biryani","Fried Rice"], Desserts:["Gulab Jamun","Ice Cream","Brownie","Kheer","Cake Slices"], Beverages:["Lemonade","Lassi","Iced Tea","Nimbu Pani"] },
  "desserts-only": { Starters:[], Mains:[], Breads:[], Rice:[], Desserts:["Gulab Jamun","Jalebi","Kheer","Ras Malai","Gajar Ka Halwa","Brownie","Tiramisu","Cheesecake","Kulfi","Ice Cream (3 flavours)","Malpua","Rabri","Chocolate Fondue","Cake Pops","Mini Cupcakes"], Beverages:["Hot Chocolate","Milkshakes (3 flavours)","Rose Milk","Cold Coffee"] },
};
const MENU_CATEGORIES = ["Starters","Mains","Breads","Rice","Desserts","Beverages"];

/* ── bookable entertainment master list (6 categories) ── */
const ALL_ACTIVITIES = {
  anchors: [
    { id:"anchor-bilingual",  name:"Bilingual Anchor",         icon:"🎙️", desc:"Hindi + English MC who keeps the energy high all evening — introductions, transitions, crowd work",  price:"₹6K–15K",  tags:["adult","all"], occasions:["birthday-party","anniversary","get-together","office-party","naming-ceremony","housewarming","first-birthday"] },
    { id:"anchor-corporate",  name:"Corporate Emcee",          icon:"🏆", desc:"Professional anchor for awards nights, annual parties, product launches — polished and on-brand",     price:"₹12K–28K", tags:["adult"],       occasions:["office-party"] },
    { id:"anchor-kids",       name:"Kids' Party Host",         icon:"🎉", desc:"High-energy host who manages games, leads activities, and keeps little ones fully entertained",        price:"₹5K–12K",  tags:["kids"],        occasions:["birthday-party","first-birthday","baby-shower","gender-reveal"] },
    { id:"anchor-celeb",      name:"Celebrity Anchor",         icon:"⭐", desc:"TV/YouTube personality as your event host — wow factor for milestone birthdays and big celebrations", price:"₹30K–80K", tags:["adult"],       occasions:["birthday-party","anniversary","office-party"] },
  ],
  bands: [
    { id:"band-bollywood",    name:"Bollywood Live Band",      icon:"🎺", desc:"3–6 piece band playing Hindi film hits all evening — classic songs + latest chartbusters",           price:"₹15K–40K", tags:["adult","all"], occasions:["birthday-party","anniversary","get-together","housewarming","office-party"] },
    { id:"band-sufi",         name:"Sufi / Ghazal Ensemble",  icon:"🪘", desc:"Soulful sufi qawwali or ghazal set — perfect for anniversaries and intimate celebrations",            price:"₹12K–30K", tags:["adult"],       occasions:["anniversary","housewarming","get-together","naming-ceremony"] },
    { id:"band-jazz",         name:"Jazz / Lounge Band",       icon:"🎷", desc:"Smooth jazz or lounge music for sophisticated events — dinner background or full set",                price:"₹12K–28K", tags:["adult"],       occasions:["anniversary","office-party","get-together"] },
    { id:"band-folk",         name:"Folk / Bhangra Troupe",   icon:"🥁", desc:"High-energy folk music and dance — bhangra, giddha, rajasthani folk — non-stop energy on the floor", price:"₹15K–35K", tags:["adult","all"], occasions:["birthday-party","housewarming","get-together","naming-ceremony"] },
    { id:"band-rock",         name:"Rock / Pop Cover Band",   icon:"🎸", desc:"Covers of popular English and Hindi rock/pop hits — great for corporate parties and young crowds",    price:"₹18K–45K", tags:["adult"],       occasions:["birthday-party","office-party","get-together"] },
    { id:"band-classical",    name:"Classical Instrumental",  icon:"🎻", desc:"Sitar, tabla, flute or violin ensemble — elegant background music for formal celebrations",            price:"₹10K–22K", tags:["adult"],       occasions:["anniversary","housewarming","naming-ceremony"] },
  ],
  stalls: [
    { id:"chaat-stall",       name:"Chaat Stall",              icon:"🌮", desc:"Live pani puri, bhel & dahi puri counter — always the longest queue at any event",                   price:"₹4K–8K",   tags:["food","all"],  occasions:["birthday-party","get-together","housewarming","office-party","anniversary","naming-ceremony"] },
    { id:"mocktail-bar",      name:"Mocktail Bar",             icon:"🍹", desc:"Live mixologist making fresh mocktails, lemonades and shakes",                                       price:"₹5K–10K",  tags:["food","adult"],occasions:["birthday-party","anniversary","get-together","office-party","housewarming"] },
    { id:"ice-cream-cart",    name:"Ice Cream / Kulfi Cart",   icon:"🍦", desc:"Scoops, sundaes and kulfi on a vintage-styled cart — guests love it",                               price:"₹4K–8K",   tags:["food","kids"], occasions:["birthday-party","first-birthday","baby-shower","get-together","anniversary"] },
    { id:"candy-floss",       name:"Candy Floss Cart",         icon:"🍭", desc:"Pink & blue spun sugar — kids go absolutely wild, parents love the photos",                          price:"₹3K–6K",   tags:["food","kids"], occasions:["birthday-party","first-birthday","gender-reveal","baby-shower"] },
    { id:"chocolate-fountain",name:"Chocolate Fountain",       icon:"🍫", desc:"Flowing melted chocolate for dipping fruits, marshmallows and cookies",                             price:"₹4K–8K",   tags:["food","sweet"],occasions:["birthday-party","anniversary","baby-shower","get-together"] },
    { id:"turkish-icecream",  name:"Turkish Ice Cream Stall",  icon:"🍦", desc:"The entertaining stretchy ice cream with the classic trolling tricks — total crowd pleaser",         price:"₹3.5K–7K", tags:["food","kids"], occasions:["birthday-party","first-birthday","get-together","office-party"] },
    { id:"waffle-stall",      name:"Waffle & Crepe Stall",     icon:"🧇", desc:"Made-to-order waffles with sweet + savoury toppings — always a hit",                               price:"₹4K–7K",   tags:["food","sweet"],occasions:["birthday-party","anniversary","get-together"] },
    { id:"mehendi-stall",     name:"Mehendi Artist",           icon:"✍️", desc:"Intricate henna designs — guests carry a beautiful piece of the event home",                        price:"₹3K–7K",   tags:["craft","adult"],occasions:["baby-shower","anniversary","birthday-party","housewarming","naming-ceremony"] },
    { id:"face-painting",     name:"Face Painting Stall",      icon:"🎨", desc:"Fun designs for kids and brave adults — always a queue, always hilarious photos",                   price:"₹3K–6K",   tags:["craft","kids"],occasions:["birthday-party","first-birthday","get-together","baby-shower"] },
    { id:"popcorn-cart",      name:"Popcorn Cart",             icon:"🍿", desc:"Flavoured popcorn in cute themed bags guests can munch through the event",                          price:"₹3K–5K",   tags:["food","kids"], occasions:["birthday-party","get-together","office-party","first-birthday"] },
    { id:"pan-counter",       name:"Pan Counter",              icon:"🌿", desc:"Meetha pan, fire pan, gulkand — the perfect finish to every great Indian event",                    price:"₹2K–4K",   tags:["food","adult"],occasions:["birthday-party","anniversary","get-together","housewarming","naming-ceremony"] },
    { id:"tattoo-stall",      name:"Temporary Tattoo Stall",   icon:"🖊️", desc:"Glitter & henna-style temporary tattoos — surprisingly popular with all ages",                     price:"₹2.5K–5K", tags:["craft","kids"],occasions:["birthday-party","get-together","office-party","first-birthday"] },
  ],
  performers: [
    { id:"magician",          name:"Magician",                 icon:"🎩", desc:"Close-up card tricks + stage magic — genuinely stuns every age group",                              price:"₹5K–12K",  tags:["all"],         occasions:["birthday-party","first-birthday","get-together","housewarming","office-party"] },
    { id:"caricature",        name:"Caricature Artist",        icon:"🖼️", desc:"Hilarious take-home portraits — guests queue up and the art is always spot-on",                    price:"₹4K–9K",   tags:["adult"],       occasions:["birthday-party","get-together","office-party","anniversary"] },
    { id:"standup",           name:"Stand-Up Comedian",        icon:"🎤", desc:"Corporate-clean comedy set tailored to the crowd — gets the whole room going",                      price:"₹8K–20K",  tags:["adult"],       occasions:["birthday-party","office-party","get-together"] },
    { id:"bollywood-dancer",  name:"Bollywood Dance Show",     icon:"💃", desc:"High-energy Bollywood group performance — 20-30 min set that energises the floor",                 price:"₹8K–18K",  tags:["adult"],       occasions:["birthday-party","get-together","anniversary","office-party"] },
    { id:"classical-dancer",  name:"Classical Dance Performance",icon:"🕺",desc:"Kathak, Bharatanatyam or Odissi solo — elegant cultural performance for formal events",            price:"₹8K–20K",  tags:["adult"],       occasions:["anniversary","housewarming","naming-ceremony","get-together"] },
    { id:"bhangra-troupe",    name:"Bhangra / Folk Troupe",   icon:"🥳", desc:"High-decibel bhangra or giddha group performance — gets everyone on their feet",                   price:"₹10K–25K", tags:["all"],         occasions:["birthday-party","get-together","housewarming","office-party"] },
    { id:"mimicry",           name:"Mimicry Artist",           icon:"🎭", desc:"Spot-on celebrity voice impressions + comedy — unique and always gets massive laughs",               price:"₹5K–15K",  tags:["adult"],       occasions:["birthday-party","get-together","office-party"] },
    { id:"fire-led",          name:"Fire / LED Light Show",    icon:"🔥", desc:"Fire juggling or LED poi light show — jaw-dropping 15-min performance for big events",              price:"₹8K–20K",  tags:["adult"],       occasions:["birthday-party","get-together","anniversary","office-party"] },
    { id:"mentalist",         name:"Mentalist",                icon:"🧠", desc:"Mind-reading + psychological illusions — the most unique act you can book",                         price:"₹10K–22K", tags:["adult"],       occasions:["birthday-party","office-party","get-together"] },
    { id:"puppet-show",       name:"Puppet Show",              icon:"🎪", desc:"Interactive storytelling puppet show for little ones — keeps toddlers & kids mesmerised",           price:"₹4K–8K",   tags:["kids"],        occasions:["first-birthday","birthday-party","baby-shower","gender-reveal"] },
    { id:"balloon-artist",    name:"Balloon Twisting Artist",  icon:"🎈", desc:"Makes balloon animals, swords, hats, flowers on the spot — kids follow them everywhere",            price:"₹3K–6K",   tags:["kids"],        occasions:["birthday-party","first-birthday","baby-shower","get-together"] },
    { id:"clown",             name:"Clown / Party Joker",      icon:"🤡", desc:"Classic slapstick — balloon animals, gags, physical comedy that kids lose their minds over",        price:"₹3K–7K",   tags:["kids"],        occasions:["birthday-party","first-birthday"] },
  ],
  shows: [
    { id:"laser-show",        name:"Laser Light Show",         icon:"✨", desc:"Aerial laser beams choreographed to music — stunning visual spectacle for large events",             price:"₹20K–60K", tags:["adult"],       occasions:["birthday-party","anniversary","office-party","get-together"] },
    { id:"drone-show",        name:"Drone Light Show",         icon:"🚁", desc:"Drone swarm forming shapes, names, messages in the sky — the most talked-about event moment of 2025",price:"₹80K+",   tags:["adult"],       occasions:["birthday-party","anniversary","office-party"] },
    { id:"fireworks",         name:"Fireworks / Sparklers",    icon:"🎆", desc:"Indoor sparklers or outdoor fireworks burst — the classic grand finale",                            price:"₹8K–30K",  tags:["all"],         occasions:["birthday-party","anniversary","get-together","housewarming","naming-ceremony"] },
    { id:"projection-mapping",name:"Projection Mapping Show",  icon:"🎬", desc:"Video art projected onto walls or objects — immersive visual storytelling",                         price:"₹25K–70K", tags:["adult"],       occasions:["birthday-party","anniversary","office-party"] },
    { id:"photo-booth-pro",   name:"Pro Photo Booth (360°)",   icon:"📸", desc:"360-degree video booth — slow-mo clips guests share instantly on social media",                     price:"₹8K–18K",  tags:["all"],         occasions:["birthday-party","anniversary","get-together","office-party","first-birthday"] },
    { id:"magic-show",        name:"Grand Magic Show",         icon:"🎩", desc:"45-min stage magic show with big illusions, levitation, disappearing acts — full audience show",    price:"₹15K–35K", tags:["all"],         occasions:["birthday-party","first-birthday","get-together","office-party"] },
  ],
  games: [
    { id:"tambola",           name:"Tambola / Housie",         icon:"🎱", desc:"Classic housie with prizes — works for every age, every occasion, every crowd",                    price:"₹500–2K",  tags:["all"],         occasions:["birthday-party","anniversary","get-together","housewarming","office-party","naming-ceremony"] },
    { id:"karaoke",           name:"Karaoke Corner",           icon:"🎤", desc:"Wireless mic + lyrics screen — guaranteed chaos, laughs, and viral moments",                       price:"₹3K–6K",   tags:["adult"],       occasions:["birthday-party","get-together","office-party","anniversary"] },
    { id:"antakshari",        name:"Antakshari",               icon:"🎵", desc:"Classic Hindi song game with teams — nostalgia, friendly competition, non-stop laughs",             price:"Free",     tags:["all"],         occasions:["anniversary","get-together","housewarming","birthday-party","naming-ceremony"] },
    { id:"dumb-charades",     name:"Dumb Charades",            icon:"🙅", desc:"Bollywood movie acting game — teams, time pressure, maximum hilarity",                             price:"Free",     tags:["all"],         occasions:["birthday-party","get-together","anniversary","office-party"] },
    { id:"quiz",              name:"Pub Quiz / Team Trivia",   icon:"❓", desc:"Custom questions about the guest of honour + general rounds — hosted or DIY",                      price:"₹2K–5K",   tags:["adult"],       occasions:["birthday-party","office-party","get-together"] },
    { id:"treasure-hunt",     name:"Treasure Hunt",            icon:"🗺️", desc:"Clues hidden around the venue — teams race against time to find the prize",                       price:"Free",     tags:["all"],         occasions:["birthday-party","first-birthday","get-together","office-party"] },
    { id:"couple-games",      name:"Couple Games",             icon:"💑", desc:"Newlywed game, shoe game, predictions — perfectly curated for anniversaries",                      price:"Free",     tags:["adult"],       occasions:["anniversary","baby-shower","gender-reveal"] },
    { id:"baby-games",        name:"Baby Shower Game Pack",    icon:"👶", desc:"Bingo, price guessing, baby food tasting — 5-in-1 game kit for the whole group",                  price:"₹500–1.5K",tags:["adult"],       occasions:["baby-shower","newborn-welcome","gender-reveal"] },
    { id:"craft-station",     name:"Craft / Activity Station", icon:"🎨", desc:"Onesie painting, canvas art, greeting card making — interactive and creative for guests",           price:"₹3K–6K",   tags:["adult","kids"],occasions:["baby-shower","first-birthday","birthday-party","gender-reveal"] },
    { id:"diy-photo-booth",   name:"DIY Photo Booth",          icon:"📸", desc:"Props basket + backdrop — guests take their own fun shots with instant digital share",             price:"₹2K–5K",   tags:["all"],         occasions:["birthday-party","baby-shower","gender-reveal","get-together","office-party"] },
  ],
};

const ACTIVITY_TYPES = [
  { key:"anchors",    label:"Anchor / Emcee", icon:"🎙️", singular:"Anchor" },
  { key:"bands",      label:"Live Bands",     icon:"🎺",  singular:"Band" },
  { key:"stalls",     label:"Stalls",         icon:"🛒",  singular:"Stall" },
  { key:"performers", label:"Performers",     icon:"🎪",  singular:"Performer" },
  { key:"shows",      label:"Special Shows",  icon:"✨",  singular:"Show" },
  { key:"games",      label:"Activities & Games", icon:"🎲", singular:"Activity" },
];

const ALL_ACTIVITY_ITEMS = Object.values(ALL_ACTIVITIES).flat();

/* ── score + filter activities for this occasion ── */
function getActivitySuggestions(occasion, {ageGroups=[], theme=null}) {
  const id  = occasion?.id||"";
  const hasKids = (ageGroups||[]).includes("Kids")||(ageGroups||[]).includes("Toddlers");
  const tags = (theme?.tags||[]).join(" ").toLowerCase();
  const result = {};
  for(const {key} of ACTIVITY_TYPES) {
    const items = (ALL_ACTIVITIES[key]||[]).map(a => {
      let score = 0;
      if(a.occasions.includes(id)) score += 4;
      if(hasKids && a.tags.includes("kids")) score += 2;
      if(!hasKids && a.tags.includes("kids") && !a.tags.some(t=>["all","food","adult","craft"].includes(t))) score -= 2;
      if((ageGroups||[]).includes("Seniors") && a.tags.includes("adult")) score += 1;
      if(tags.includes("bollywood") && (a.id==="bollywood-dancer"||a.id==="antakshari"||a.id==="band-bollywood")) score += 2;
      if(tags.includes("neon") && (a.id==="laser-show"||a.id==="fire-led"||a.id==="projection-mapping")) score += 2;
      if(tags.includes("sufi")||tags.includes("ghazal")) { if(a.id==="band-sufi") score += 3; }
      if(id==="office-party" && a.id==="anchor-corporate") score += 3;
      if((id==="baby-shower"||id==="first-birthday") && a.id==="anchor-kids") score += 3;
      return {...a, score};
    }).sort((a,b)=>b.score-a.score).slice(0,4);
    result[key] = items;
  }
  return result;
}

/* ── event itinerary builder ── */
function buildItinerary(occasion, {guests=20, vendors=[], selectedActivities=[], venueType="", ageGroups=[]}) {
  const id        = occasion?.id||"";
  const hasKids   = (ageGroups||[]).includes("Kids")||(ageGroups||[]).includes("Toddlers");
  const hasCaterer= vendors.includes("Caterer");
  const hasDJ     = vendors.includes("DJ");
  const hasBand   = vendors.includes("Live Band") || selectedActivities.some(a=>a.startsWith("band-"));
  const hasPhotog = vendors.includes("Photographer")||vendors.includes("Videographer");
  const hasDecor  = vendors.includes("Decorator");
  const hasAnchor = vendors.includes("Emcee / Host")||selectedActivities.some(a=>a.startsWith("anchor"));
  const hasEntertainment = selectedActivities.length>0;

  const slots = [];
  const add = (time, title, desc, type="normal") => slots.push({time, title, desc, type});

  const isOffice  = id==="office-party";
  const isAnniv   = id==="anniversary";
  const isHouse   = id==="housewarming";
  const isBirthday= id==="birthday-party"||id==="first-birthday";
  const isBabyEvt = ["baby-shower","newborn-welcome","gender-reveal","naming-ceremony"].includes(id);

  if(isOffice) {
    add("6:30 PM","Venue Setup & Sound Check","Decorator, AV team and caterer finalize setup — 1 hr before guests","setup");
    add("7:00 PM","Doors Open — Team Arrives","Welcome desk with name badges, background music, welcome mocktail served");
    add("7:15 PM","Networking & Mingling","Starters served, team members mingle freely — no formal agenda yet");
    if(hasAnchor) add("7:45 PM","Opening Address & Welcome","Anchor introduces the evening — MD/Director gives year-in-review address","highlight");
    else add("7:45 PM","Welcome by Leadership","Opening speech by management, team acknowledgements");
    if(hasCaterer) add("8:15 PM","Dinner Buffet Opens","Full buffet service begins — team seated or mingling");
    if(selectedActivities.some(a=>["quiz","dumb-charades","tambola","karaoke","treasure-hunt"].includes(a))) add("8:30 PM","Team Game / Activity Round",hasAnchor?"Anchor leads the team activity — trivia, dumb charades or team challenge":"Team activity begins — trivia, dumb charades or challenge","fun");
    if(selectedActivities.some(a=>["standup","mimicry","mentalist","magic-show"].includes(a))) add("9:00 PM","Live Entertainment Set","Performer takes the stage — comedy, magic or live act","fun");
    add("9:30 PM","🏆 Awards & Recognition Ceremony","Category winners announced, trophies / mementos presented on stage","highlight");
    if(hasDJ||hasBand||selectedActivities.some(a=>a.startsWith("band-"))) add("10:15 PM","Dance Floor Opens","DJ / Band kicks in — high energy floor, everyone joins");
    add("11:00 PM","Desserts & Group Photo","Dessert station opens, all-team group photo, event wraps up");
    add("11:30 PM","Farewell","Event concludes — team disperses");
  } else if(isAnniv) {
    add("6:30 PM","Venue Setup Finalized","Decorator ensures candles lit, flowers fresh, music cued","setup");
    add("7:00 PM","Guests Arrive","Welcome drinks served — soft background music playing");
    if(hasPhotog) add("7:15 PM","Candid Arrival Shots","Photographer captures guests arriving and mingling");
    add("7:30 PM","💍 Couple's Grand Entry","Couple enters to their chosen song — first golden moment of the evening","highlight");
    if(hasCaterer) add("7:45 PM","Dinner / Starters Served","Starters served at tables or buffet opens");
    if(hasAnchor) add("8:00 PM","Anchor Sets the Tone","Anchor welcomes everyone and guides the evening flow");
    add("8:15 PM","Speeches & Memory Sharing","Family and friends share favourite memories — toasts raised","highlight");
    if(selectedActivities.includes("couple-games")) add("8:30 PM","Couple Games","Shoe game, predictions, audience participation — hilarious & heartwarming","fun");
    if(selectedActivities.some(a=>a.startsWith("band-"))||hasBand) add("8:30 PM","Live Music Set","Band plays romantic hits — background music during dinner","fun");
    add("9:00 PM","🎂 Anniversary Cake Cutting","Cake cutting with family gathered — beautiful captured moment","highlight");
    if(hasDJ||hasBand) add("9:30 PM","Dance Floor Opens","Couple's first dance, then open floor for all guests","fun");
    else if(selectedActivities.some(a=>["antakshari","karaoke","tambola"].includes(a))) add("9:30 PM","Group Activity","Antakshari / tambola / karaoke — everyone joins in","fun");
    if(selectedActivities.some(a=>["laser-show","fireworks","drone-show"].includes(a))) add("10:15 PM","Special Show","Grand finale performance — laser / fireworks / drone show","highlight");
    add("10:30 PM","Desserts & Group Photos","Dessert table opens, family group photo, guests depart");
  } else if(isBabyEvt&&id==="baby-shower") {
    add("11:00 AM","Venue Setup","Decorator finalizes pastel setup, caterer prepares high tea","setup");
    add("11:30 AM","Guests Arrive","Welcome tea, snacks served — guests settle and mingle");
    add("12:00 PM","Baby Shower Games Begin","Host leads the group — bingo, prediction cards, price guessing","fun");
    if(selectedActivities.includes("craft-station")) add("12:30 PM","Onesie / Craft Station","Guests decorate a onesie or make a craft gift for the baby","fun");
    if(hasCaterer) add("1:00 PM","Lunch / High Tea Served","Full food service — guests eat and chat");
    add("1:45 PM","Gift Opening Ceremony","Mom-to-be opens all gifts, guests cheer and react — lots of photos","highlight");
    add("2:15 PM","🎂 Cake Cutting","Baby shower cake cut — theme moment","highlight");
    if(hasPhotog) add("2:30 PM","Group Photo Session","Full group with mom-to-be, individual portraits");
    add("3:00 PM","Return Gifts & Farewell","Guests receive return gifts and the event wraps up warmly");
  } else if(isBabyEvt&&id==="gender-reveal") {
    add("11:00 AM","Setup & Team Prep","Reveal prop prepared, décor finalized — only 1 person knows the secret!","setup");
    add("11:30 AM","Guests Arrive","Welcome drinks + team pink vs team blue accessories at the door");
    add("12:00 PM","Ice Breaker Games","Pregnancy trivia, name guessing, team activities — suspense builds","fun");
    if(hasCaterer) add("12:30 PM","Finger Foods & Snacks Served","Light bites while anticipation builds");
    add("1:00 PM","🎀 THE BIG REVEAL!","Balloon burst / cake cut / smoke bomb — THE moment everyone's waiting for!","highlight");
    if(hasPhotog) add("1:10 PM","Reveal Photo Session","Confetti, reactions, family portraits — capture everything in the next 20 minutes");
    if(hasCaterer) add("1:30 PM","Celebration Lunch","Full meal to celebrate the news");
    add("2:30 PM","Cake Cutting & Farewell","Gender reveal cake cut, return gifts distributed, event ends");
  } else if(id==="first-birthday") {
    add("10:30 AM","Setup","Decorator and caterer finalize — balloon arch, kids setup all ready","setup");
    add("11:00 AM","Guests Arrive","Welcome drinks for adults, juice for kids — little ones start playing");
    if(hasPhotog) add("11:15 AM","Candid Play Shots","Photographer captures the birthday baby and guests arriving");
    if(selectedActivities.some(a=>["magician","clown","puppet-show","balloon-artist","anchor-kids"].includes(a))) add("11:30 AM","Kids Entertainment Show","Magician / clown / puppet show — little guests completely hooked","fun");
    if(hasCaterer) add("12:00 PM","Lunch / Kids Menu Opens","Kids meal + adult buffet begins");
    add("12:45 PM","🎂 Smash Cake Moment","Birthday baby gets their own smash cake — this is THE photo moment","highlight");
    add("1:00 PM","Main Cake Cutting","Everyone gathers, Happy Birthday sung, family cake cut together","highlight");
    if(hasPhotog) add("1:15 PM","Group & Portrait Photos","Family portraits, full group shot, baby solo shots");
    add("2:00 PM","Return Gifts & Farewell","Kids receive return gifts, parents collect belongings, event ends");
  } else if(isHouse) {
    add("9:30 AM","Puja Setup","Priest sets up, flowers and diyas arranged, family prepares","setup");
    add("10:00 AM","Griha Pravesh Puja","Priest conducts housewarming ceremony — family blessings, sacred rituals","highlight");
    add("11:00 AM","First Entry — Grihapravesh","Family / couple enters the new home with aarti and milk boil","highlight");
    add("11:30 AM","House Tour & Blessings Round","Guests tour the home, elders bless each room");
    if(hasCaterer) add("12:30 PM","Lunch Served","Traditional housewarming meal — guests seated");
    add("1:30 PM","Gifts & Community Blessings","Gifts placed in the home, informal gifting and blessings");
    if(selectedActivities.some(a=>["tambola","antakshari","dumb-charades"].includes(a))) add("2:30 PM","Post-lunch Fun","Tambola / antakshari — keeping the celebration alive after lunch","fun");
    add("4:00 PM","Evening Chai & Mithai","Tea, sweets served, guests enjoy the new home space");
    add("5:30 PM","Farewell","Event wraps up — guests depart with blessings");
  } else {
    // Default: birthday-party, get-together
    const startHour = guests>50 ? 19 : 19;
    add("5:30 PM","Venue & Setup Complete","All décor, stalls and setup ready before guests arrive","setup");
    add("6:00 PM","Doors Open — Guests Arrive",hasPhotog?"Photographer captures arrivals — candid entry shots":"Welcome drinks served, guests arrive and settle in");
    if(selectedActivities.some(a=>["chaat-stall","mocktail-bar","turkish-icecream","candy-floss","popcorn-cart"].includes(a))) add("6:15 PM","Stalls Open","Food and fun stalls begin — guests explore and enjoy","fun");
    if(selectedActivities.some(a=>["mehendi-stall","face-painting","tattoo-stall","caricature"].includes(a))) add("6:30 PM","Activity Stalls Running","Mehendi / face painting / caricature stalls running — queues forming","fun");
    if(hasCaterer) add("7:00 PM","Starters Served","Starter round begins — waiters serve / live counter opens");
    if(hasAnchor) add("7:30 PM","Anchor Kicks Off","Anchor welcomes guests, sets the mood, introductions made");
    if(selectedActivities.some(a=>["tambola","quiz","dumb-charades","treasure-hunt","karaoke"].includes(a))) add("7:45 PM","Games & Group Activity","Main activity session — high energy, everyone participates","fun");
    if(selectedActivities.some(a=>["magician","standup","bollywood-dancer","mimicry","fire-led","magic-show","laser-show","bhangra-troupe"].includes(a))) add("8:00 PM","Live Performance / Show","Performer / show takes centre stage — the wow moment of the evening","highlight");
    if(hasCaterer) add("8:30 PM","Main Course Opens","Dinner buffet begins — full service");
    add("9:00 PM","🎂 Cake Cutting","Everyone gathers for the birthday moment — candles lit, song sung","highlight");
    if(hasDJ||hasBand||selectedActivities.some(a=>a.startsWith("band-"))) add("9:30 PM","Dance Floor Opens / Live Music","DJ set / band takes the stage — everyone on the floor","fun");
    if(selectedActivities.some(a=>["fireworks","drone-show","laser-show","photo-booth-pro"].includes(a))) add("10:30 PM","Grand Finale Moment","Special show or 360° photo moment — perfect send-off","highlight");
    add("10:45 PM","Desserts & Group Photo","Dessert station opens, big group photo, event begins to wind down");
    add("11:00 PM","Farewell","Guests receive return gifts and head home — event concludes");
  }

  return slots.filter(s=>s.type!=="setup");
}

/* ── decorator items builder data ── */
const DECOR_ITEMS = {
  "Backdrop & Wall":    ["Backdrop wall (printed/fabric)","Balloon wall","Flower wall","Neon sign (custom name)","Photo frame wall","Sequin backdrop","Fairy light curtain","Tulle backdrop"],
  "Balloons":           ["Balloon arch at entry","Balloon arch at backdrop","Table centrepiece balloons","Ceiling balloons","Foil number / letter balloons","Chrome / metallic balloons","Balloon bouquets (per table)","Organic balloon installation"],
  "Flowers":            ["Floral arch at entrance","Table floral centrepieces","Flower wall panel","Flower petals on pathway","Marigold garlands","Flower ceiling hanging","Loose flower bunches"],
  "Lighting":           ["String lights overhead","Fairy light curtain","Uplighting on walls","Spotlights on key areas","Neon LED signs","RGB colour wash","Warm Edison bulbs","Lanterns along pathway","Candle clusters"],
  "Table & Seating":    ["Table runner","Centrepieces per table","Candle holders","Charger plates","Napkin folds / rings","Menu cards per seat","Chair bows or sashes"],
  "Entry & Walkway":    ["Welcome signboard / easel","Entrance arch","Pathway decor (petals / lanterns)","Name or message board","Ribbon / floral gate"],
  "Photo Corner":       ["Photo booth setup","Props box","Selfie corner backdrop","Polaroid station","Memory jar station"],
  "Theme Items":        ["Character cutouts / standees","Themed banners","Custom bunting","Themed table covers","Personalized name boards"],
};
const DECOR_CATEGORIES = Object.keys(DECOR_ITEMS);

/* ── 3 personalised catering style options ── */
function getCateringOptions(occasion, {guests=20, venueType="", ageGroups=[], budget=0}) {
  const id     = occasion?.id||"";
  const venue  = venueType.toLowerCase();
  const ages   = ageGroups;
  const b      = Number(budget)||0;
  const hasKids= ages.includes("Kids")||ages.includes("Toddlers");
  const isBig  = guests>50;
  const isFormal= venue.includes("banquet")||venue.includes("hall");
  const isOutdoor= venue.includes("garden")||venue.includes("outdoor")||venue.includes("rooftop")||venue.includes("farmhouse");
  const ph = b>0 ? Math.round(b*0.3/guests) : null;
  const fmt = n => `≈₹${n.toLocaleString("en-IN")}/head`;

  /* occasion-specific overrides */
  const isOffice    = id==="office-party";
  const isAnniv     = id==="anniversary";
  const isBabyEvent = id==="baby-shower"||id==="newborn-welcome"||id==="gender-reveal"||id==="naming-ceremony"||id==="first-birthday";
  const isHouse     = id==="housewarming";

  if(isOffice) return [
    { style:"Corporate Buffet", tagline:"Professional, clean — works for all teams", priceHint: ph?fmt(ph):"₹450–650/head", icon:"🍽️", dishes:["Sandwiches & wraps station","Salad bar","1 veg + 1 non-veg main","Dal + rice","Dessert corner"] },
    { style:"Buffet + Live Counters", tagline:"Popular for office dos — interactive and fun", priceHint: ph?fmt(Math.round(ph*1.2)):"₹600–800/head", icon:"🧑‍🍳", popular:true, dishes:["Waiter-served starters","Live pasta / pizza counter","2 mains","Mocktail bar","Dessert table"] },
    { style:"Full Service Dinner", tagline:"Awards night or annual party — premium feel", priceHint: ph?fmt(Math.round(ph*1.6)):"₹800–1,200/head", icon:"✨", dishes:["Welcome drink + starters","Plated main course","Live dessert station","Custom menu cards","Dedicated service staff"] },
  ];

  if(isAnniv) return [
    { style:"Intimate Dinner Setup", tagline:"Romantic plating, courses served at the table", priceHint: ph?fmt(ph):"₹550–750/head", icon:"🍽️", dishes:["Welcome champagne mocktail","Soup + salad","Plated main with 2 sides","Candle-lit dessert presentation"] },
    { style:"Buffet + Live Counter", tagline:"Great for a larger anniversary with family & friends", priceHint: ph?fmt(Math.round(ph*1.1)):"₹600–800/head", icon:"🧑‍🍳", popular:true, dishes:["Starter round by waiter","3 mains + live pasta/chaat counter","Salad bar","Dessert table with couple's cake"] },
    { style:"Full Waiter Service", tagline:"Formal, sophisticated — a true celebration dinner", priceHint: ph?fmt(Math.round(ph*1.5)):"₹800–1,200/head", icon:"✨", dishes:["Multi-course plated meal","4+ mains with accompaniments","Custom anniversary cake served","Personalised menu cards"] },
  ];

  if(isBabyEvent) return [
    { style:"Light Snacks & High Tea", tagline:"Ideal for daytime baby events — easy, elegant", priceHint: ph?fmt(Math.round(ph*0.7)):"₹300–450/head", icon:"☕", dishes:["Sandwiches & wraps","Mini pastries & biscuits","Juice / mocktail bar","Fruit platter","Cake station"] },
    { style:"Buffet with Kids Corner", tagline:"Feeds all ages — most popular for baby events", priceHint: ph?fmt(ph):"₹450–650/head", icon:"🍽️", popular:true, dishes:["1 veg + 1 non-veg main","Dal + rice + roti","Kids corner: mini pizza & fries","Dessert table","Juice station (no aerated drinks)"] },
    { style:"Finger Food & Live Counters", tagline:"Fun and casual — great if guests will be standing", priceHint: ph?fmt(Math.round(ph*1.1)):"₹450–650/head", icon:"🧆", dishes:["Live chaat counter","Mini sandwiches & sliders","Healthy fruit skewers","Cake + dessert table","Mocktails"] },
  ];

  if(isHouse) return [
    { style:"Traditional Thali", tagline:"Warm, homely, auspicious — perfect for housewarming", priceHint: ph?fmt(ph):"₹350–500/head", icon:"🍛", dishes:["Puja prasad (halwa/puri)","Full North/South Indian thali","Dal + rice + roti","Sweet mithai plate","Aam panna / chaas"] },
    { style:"Buffet with Live Starters", tagline:"Traditional + a touch of fun — crowd pleaser", priceHint: ph?fmt(Math.round(ph*1.2)):"₹500–700/head", icon:"🧑‍🍳", popular:true, dishes:["Live chaat / samosa counter","Thali-style mains","Dessert platter","Fresh juices + mocktails"] },
    { style:"Full Buffet & Service", tagline:"If you want to go all out for the housewarming", priceHint: ph?fmt(Math.round(ph*1.5)):"₹700–1,000/head", icon:"✨", dishes:["Welcome sherbet + starters","4 mains + dal + rice + breads","Live dessert counter","Service staff throughout"] },
  ];

  /* default (birthday-party, get-together, etc.) */
  return [
    {
      style: isOutdoor ? "Finger Food & Live Counters" : "Simple Buffet",
      tagline: isOutdoor ? "Great for outdoor, casual events" : "Self-serve, easy for any size",
      priceHint: ph ? fmt(Math.round(ph*0.75)) : (isOutdoor?"₹350–500/head":"₹300–450/head"),
      icon:"🍽️",
      dishes: isOutdoor
        ? ["Live chaat counter","Mini sandwiches & sliders","Grilled section",hasKids?"Kids snack corner":"Mocktail bar"]
        : ["2 mains (veg + non-veg)","Dal + rice + roti","Starters section",hasKids?"Kids corner":"Basic dessert"],
    },
    {
      style: (isFormal||isBig) ? "Buffet + Waiter Service" : "Buffet + Live Counter",
      tagline: (isFormal||isBig) ? "Most popular for halls & big events" : "Fun, interactive — guests love it",
      priceHint: ph?fmt(ph):"₹500–700/head", icon:"🧑‍🍳", popular:true,
      dishes: (isFormal||isBig)
        ? ["Waiter-served starters","3 mains + live counter",hasKids?"Kids corner":"Salad bar","Dessert table"]
        : ["Live chaat / pav bhaji counter","2–3 mains",hasKids?"Kids corner":"Salad bar","Dessert station"],
    },
    {
      style:"Full Waiter Service",
      tagline:"Elegant, course-by-course dining",
      priceHint: ph?fmt(Math.round(ph*1.5)):"₹750–1,200/head",
      icon:"✨",
      dishes:["Welcome drink + amuse-bouche","Plated starters","4+ mains with sides","Curated dessert table","Custom menu cards"],
    },
  ];
}

/* ── 3 personalised decorator style options (occasion-aware) ── */
function getDecorOptions(occasion, {guests=20, venueType="", theme=null, ageGroups=[]}) {
  const id     = occasion?.id||"";
  const venue  = venueType.toLowerCase();
  const tags   = (theme?.tags||[]).join(" ").toLowerCase();
  const outdoor= venue.includes("garden")||venue.includes("outdoor")||venue.includes("farmhouse")||venue.includes("rooftop");
  const hasKids= (ageGroups||[]).includes("Kids")||(ageGroups||[]).includes("Toddlers");
  const isBaby = ["baby-shower","newborn-welcome","first-birthday","naming-ceremony","gender-reveal"].includes(id);
  const isAnniv= id==="anniversary";
  const isOffice=id==="office-party";
  const isHouse= id==="housewarming";

  if(isBaby) return [
    { style:"Soft & Sweet",       tagline:"Pastel setup — gentle, airy, baby-perfect",       priceHint:outdoor?"₹8K–14K":"₹5K–9K",   icon:"🍼", items:["Pastel balloon clusters at entry","Soft backdrop with baby motifs","Table centrepieces","Cradle / highchair decor"] },
    { style:"Full Baby Setup",    tagline:"Full venue coverage — most popular for baby events",priceHint:outdoor?"₹18K–32K":"₹12K–22K",icon:"🎀",popular:true, items:["Balloon arch at entry","Themed backdrop + name board","All table décor",id==="gender-reveal"?"Pink & Blue reveal corner":"Dedicated cake/gift table area"] },
    { style:"Premium Baby Event", tagline:"Every corner styled, photo-ready throughout",      priceHint:outdoor?"₹40K+":"₹28K+",       icon:"✨", items:["Custom floral installation","Balloon ceiling or canopy","Personalised name / age banner","Photo corner with full props","Cake table centrepiece"] },
  ];
  if(isAnniv) return [
    { style:"Romantic Essentials",tagline:"Intimate candle-lit setup — couple-focused",       priceHint:outdoor?"₹10K–18K":"₹7K–14K", icon:"🕯️",items:["Fairy light backdrop","Rose & candle centrepieces","Couple photo timeline wall","Welcome garland at entry"] },
    { style:"Full Celebration",   tagline:"Guests + couple — full venue dressed beautifully", priceHint:outdoor?"₹22K–40K":"₹15K–28K",icon:"💍",popular:true,items:["Floral arch at entry","Backdrop + couple photos","All table décor (candles + flowers)",outdoor?"String lights overhead":"Balloon ceiling or draping"] },
    { style:"Grand Anniversary",  tagline:"Golden or silver jubilee — nothing held back",     priceHint:outdoor?"₹55K+":"₹38K+",       icon:"👑", items:["Floral wall or floral arch installation","Custom milestone backdrop (25/50 years)","Lighting setup included","Photo corner + memory wall","Floating candles or lantern arrangement"] },
  ];
  if(isOffice) return [
    { style:"Corporate Clean",    tagline:"Professional branded setup — minimal & sharp",     priceHint:"₹8K–15K",  icon:"🏢", items:["Company branding backdrop","Branded table signage","Clean floral centrepieces","Award / recognition display area"] },
    { style:"Corporate Festive",  tagline:"Professional + a warm festive feel",              priceHint:"₹18K–32K", icon:"🎊",popular:true,items:["Branded backdrop + balloon columns","Themed table décor","Recognition board / award wall","Photo corner with company branding"] },
    { style:"Premium Office Event",tagline:"Awards night or big team party — full setup",    priceHint:"₹35K+",    icon:"✨", items:["Full venue branding","Stage décor for awards ceremony","LED lighting + ambience","Photo wall + step & repeat backdrop","Custom table naming"] },
  ];
  if(isHouse) return [
    { style:"Auspicious & Warm",  tagline:"Traditional feel — flowers, diyas, warm tones",  priceHint:outdoor?"₹8K–15K":"₹5K–10K",  icon:"🪔", items:["Marigold garlands at entry","Diya clusters on tables","Traditional flower centrepieces","Welcome rangoli at door"] },
    { style:"Full House Décor",   tagline:"Entire home / venue dressed — most popular",      priceHint:outdoor?"₹18K–32K":"₹12K–22K",icon:"🏠",popular:true,items:["Flower arch at main entrance","Table centrepieces for all areas","Living room focal point (arch or wall)",outdoor?"String lights in garden":"Fairy light interior setup"] },
    { style:"Grand Housewarming", tagline:"Statement event — every room styled",             priceHint:outdoor?"₹40K+":"₹28K+",       icon:"✨", items:["Full venue transformation","Outdoor lighting setup","Custom welcome board","Flower wall installation","Puja area decorated separately"] },
  ];
  return [
    { style:"Simple & Sweet",   tagline:"Looks great, stays within budget", priceHint:outdoor?"₹8K–15K":"₹5K–10K",   icon:"🎈", items:["Balloon clusters at entry","Simple backdrop wall","Table centrepieces",tags.includes("floral")?"Floral accents":"Colour-matched props"] },
    { style:"Full Venue Setup", tagline:"Covers the whole venue — most popular", priceHint:outdoor?"₹20K–38K":"₹14K–26K",icon:"🎨",popular:true,items:[outdoor?"String lights overhead":"Balloon ceiling","Themed backdrop + arch","All table décor",hasKids?"Character balloons & props":tags.includes("floral")?"Fresh floral centrepieces":"Premium centrepieces"] },
    { style:"Showstopper",      tagline:"Every corner transformed, fully custom", priceHint:outdoor?"₹50K+":"₹35K+",     icon:"👑", items:[tags.includes("neon")?"Custom neon sign":tags.includes("floral")?"Floor-to-ceiling floral wall":"Full venue transformation","Themed entry arch","Custom backdrop + photo corner","Lighting setup included"] },
  ];
}

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
    "office-party":[
      {cat:"AV & Presentation",items:[{name:"Projector + screen / LED display",qty:"1"},{name:"Wireless lapel mic (CEO/speaker)",qty:"2"},{name:"Handheld wireless mic (emcee)",qty:"1"},{name:"Click presenter / slide remote",qty:"1"},{name:"HDMI + USB-C adapters",qty:"3–4"}]},
      {cat:"Stage & Awards",items:[{name:"Podium / lectern",qty:"1"},{name:"Award table with drape",qty:"1"},{name:"Step-and-repeat branded backdrop",qty:"1"},{name:"Spotlights on stage",qty:"2"}]},
      {cat:"Décor",items:[{name:"Balloon arch or clusters",qty:`${Math.ceil(g/30)} sets`},{name:"Table centrepieces",qty:`${t}`},{name:"Fairy lights / ambient lighting",qty:"3–4 sets"}]},
    ],
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

function themeEmoji(tags=[]) {
  const t=tags.join(" ").toLowerCase();
  if(t.includes("bollywood")||t.includes("indian")||t.includes("dance")) return "💃";
  if(t.includes("neon")||t.includes("glow")||t.includes("rave")) return "🌈";
  if(t.includes("floral")||t.includes("garden")||t.includes("flower")) return "🌸";
  if(t.includes("pastel")||t.includes("pink")||t.includes("baby")) return "🩷";
  if(t.includes("gold")||t.includes("glam")||t.includes("royal")) return "👑";
  if(t.includes("elegant")||t.includes("luxury")||t.includes("red-carpet")) return "✨";
  if(t.includes("jungle")||t.includes("safari")||t.includes("animal")) return "🦁";
  if(t.includes("nature")||t.includes("green")||t.includes("earth")) return "🌿";
  if(t.includes("stars")||t.includes("dreamy")||t.includes("navy")||t.includes("night")) return "⭐";
  if(t.includes("minimal")||t.includes("modern")||t.includes("white")||t.includes("clean")) return "🤍";
  if(t.includes("red")||t.includes("romantic")||t.includes("valentine")) return "🌹";
  if(t.includes("brown")||t.includes("bear")||t.includes("cute")||t.includes("teddy")) return "🧸";
  if(t.includes("clouds")||t.includes("sky")||t.includes("blue")) return "☁️";
  if(t.includes("entrance")||t.includes("arch")) return "🌺";
  if(t.includes("personal")||t.includes("footprint")) return "💝";
  if(t.includes("sufi")||t.includes("ghazal")||t.includes("classical")) return "🎵";
  if(t.includes("retro")||t.includes("vintage")) return "📷";
  if(t.includes("dark")||t.includes("black")||t.includes("gothic")) return "🖤";
  return "🎨";
}

/* ── vendor recommendations based on theme + age groups + venue ── */
function getRecommended(occasion, theme, ageGroups, venueType) {
  const recs = new Set(occasion.vendorCategories||[]);
  const venue=(venueType||"").toLowerCase();
  if(theme) {
    const t=(theme.tags||[]).join(" ").toLowerCase();
    if(t.includes("floral")||t.includes("garden")||t.includes("nature")) recs.add("Florist");
    if(t.includes("neon")||t.includes("glow")||t.includes("teen")||t.includes("dance")||t.includes("fun")) recs.add("DJ");
    if(t.includes("bollywood")||t.includes("indian")||t.includes("colourful")) recs.add("Emcee / Host");
    if(t.includes("gold")||t.includes("elegant")||t.includes("glam")) recs.add("Lighting Setup");
    if(t.includes("photo")||t.includes("memories")||t.includes("red-carpet")) recs.add("Photo Booth");
    if(t.includes("corporate")||t.includes("professional")||t.includes("modern")||t.includes("minimal")) {
      recs.add("AV Setup"); recs.add("Photo Booth");
    }
  }
  if(occasion.id==="office-party") { recs.add("AV Setup"); recs.add("Emcee / Host"); }
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

function getSmartVendors(occasion, theme, ageGroups, venueType, budget, max=7) {
  const recs = getRecommended(occasion, theme, ageGroups, venueType);
  const base = occasion.vendorCategories || [];
  // Limit pre-selected vendors by budget — tight budgets can't cover too many
  const b = Number(budget)||0;
  const limit = b>0 ? (b<20000?3 : b<40000?4 : b<80000?5 : max) : max;
  return [...new Set([...base, ...recs])].slice(0, limit);
}

/* ── vendor tips (what to actually ask for) ── */
function getVendorTips(type, {theme, venueType, ageGroups, cateringType, budget, guests}) {
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
    const decorBudget = budget&&guests ? Math.round(Number(budget)*0.28) : null;
    return {
      heading:"Ask your decorator for",
      items:[...new Set(items)].slice(0,7),
      tip: decorBudget
        ? `~28% of your budget (≈₹${decorBudget.toLocaleString("en-IN")}) for décor. ${venueType?`Tell them it's a ${venueType} — setup time changes.`:"Share reference photos and venue size before finalising."}`
        : venueType?`Tip: Tell the decorator it's a ${venueType} — setup time and equipment change significantly.`:"Tip: Share reference photos and the venue size before finalising quotes.",
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
    const foodBudget = budget&&guests ? Math.round(Number(budget)*0.3/guests) : null;
    return {
      heading:"Menu to plan with caterer",
      items:[...new Set(menu)].slice(0,8),
      tip: foodBudget
        ? `~30% of your budget = ₹${foodBudget}/head for food. Share service style, guest count, veg/non-veg split and venue upfront — they'll size everything correctly.`
        : "Tip: Tell the caterer your service style, guest count, veg/non-veg split, and venue type upfront — they'll size everything correctly.",
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

  if(type==="Emcee / Host") {
    const isCorp=tags.includes("corporate")||tags.includes("professional")||tags.includes("modern")||tags.includes("minimal");
    const items=isCorp
      ? ["Awards ceremony script with winner names and citations","Company milestone acknowledgements for the year","Trivia / quiz round between departments","Transition between dinner, entertainment and awards","Bilingual hosting (Hindi + English)","Coordinate with AV team for slide cues"]
      : ["Opening + welcome","Introduce the occasion and key guests","Host games and activities","Coordinate cake-cutting or key moment","Thank-you and closing","Bilingual hosting if needed"];
    return {
      heading:"Brief your emcee on",
      items:items.slice(0,6),
      tip:isCorp
        ?"Tip: Send the emcee a run-of-show document with timings, award winner names (marked confidential), and any sensitive topics to avoid — a good corporate host needs the full picture."
        :"Tip: Brief the host on guest demographics, any inside jokes and the flow order — a well-briefed emcee makes the event feel effortless.",
    };
  }

  if(type==="Photo Booth") {
    const isCorp=tags.includes("corporate")||tags.includes("professional")||tags.includes("minimal");
    return {
      heading:"What to set up",
      items:[
        isCorp?"Branded backdrop with company logo + name":"Themed backdrop matching décor",
        "Printed or digital instant photos","Props box (hats, signs, glasses)",
        "GIF/video booth option","Unlimited sessions for guests",
        isCorp?"Digital album shared with HR for internal comms":"QR share to phone",
      ],
      tip:isCorp
        ?"Tip: Ask for a custom overlay with the company name and event date on every photo — great for internal social media."
        :"Tip: Place the photo booth near the entrance or bar area — it gets used more. Confirm if props are included in the quote.",
    };
  }

  if(type==="AV Setup") {
    const isCorp=tags.includes("corporate")||tags.includes("professional")||tags.includes("minimal")||tags.includes("modern");
    return {
      heading:"What to confirm with your AV vendor",
      items:[
        "Projector + screen OR LED display (confirm hall size first)",
        `${isCorp?"2 lapel mics (CEO + speaker) + 1 handheld for emcee":"Mics for speeches, awards and emcee"}`,
        "HDMI and USB-C adaptors for all presenter laptops",
        "Click presenter / wireless slide remote",
        "On-site technician for the full event duration",
        isCorp?"Live streaming setup if remote employees will join":"Backup speaker/mic in case of failure",
        "Walk-through / tech rehearsal 1 hour before guests arrive",
      ],
      tip:`Tip: Share the hall dimensions, ceiling height, and laptop model upfront — screen size and cable needs depend on these. ${isCorp?"For award ceremonies, ask them to pre-load the presentation so there's zero delay.":""}`,
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

  if(type==="Emcee / Host") {
    const isCorp=tags.includes("corporate")||tags.includes("professional")||tags.includes("modern")||tags.includes("minimal");
    return [
      {label:"Essential",price:"₹8K–13K",
        items:["3-hour hosting","Standard script","Mic + basic AV support"],
        note:"Smooth event flow"},
      {label:"Standard",price:"₹18K–28K",popular:true,
        items:["Full event hosting",isCorp?"Corporate awards ceremony script":"Custom script & games","Guest engagement activities","Bilingual (Hindi + English)"],
        note:isCorp?"Keeps the corporate evening moving with polish":"Energetic host — vibe stays up"},
      {label:"Premium",price:"₹35K+",
        items:[isCorp?"Seasoned corporate host (MNC experience)":"Celebrity-style host","Full script coordination",isCorp?"Awards + trivia + live games":"Custom games & trivia","Pre-event rehearsal + run-of-show doc"],
        note:isCorp?"Professional MC who handles awards and crowd equally well":"Professional show-runner experience"},
    ];
  }

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

  if(type==="AV Setup") return [
    {label:"Essential",price:"₹8K–14K",
      items:["Projector + 8ft screen","2 wireless mics","Basic sound system","HDMI cables"],
      note:"Clear audio and visuals for speeches"},
    {label:"Standard",price:"₹18K–28K",popular:true,
      items:["LED display or 12ft screen","4 wireless mics (lapel + handheld)","Mixing board","Click presenter","On-site technician"],
      note:"Full AV for awards + presentations — most popular"},
    {label:"Premium",price:"₹35K+",
      items:["Dual LED screens","6+ mics + in-ear monitors","Live streaming to remote guests","Custom presentation loading + rehearsal","Dedicated AV engineer full event"],
      note:"Broadcast-quality setup — nothing goes wrong"},
  ];

  return [
    {label:"Essential",price:"Budget-friendly",items:["Basic service package","Standard setup"],note:"Gets the job done"},
    {label:"Standard",price:"Mid-range",popular:true,items:["Full service package","Customisation available","On-site support"],note:"Best value for most events"},
    {label:"Premium",price:"Full-service",items:["Premium setup","Dedicated coordinator","Priority booking"],note:"Top-tier experience"},
  ];
}

/* ── build WhatsApp Baat Karo message ── */
function buildBaatKaroMsg(occasion, {guests, date, city, venueType, theme, vendors, vendorPackages, budget, selectedActivities=[], customActivities=[]}) {
  const pkgNames=["Essential","Standard","Premium"];
  const vLines=vendors.filter(v=>ALL_VENDORS.includes(v)).map(v=>{
    const pi=vendorPackages[v];
    if(pi==="custom") return `• ${v} — Custom`;
    return `• ${v}${typeof pi==="number"?` — ${pkgNames[pi]}`:""}`;
  });
  const customLines=vendors.filter(v=>!ALL_VENDORS.includes(v)).map(v=>`• ${v}`);
  const allLines=[...vLines,...customLines].join("\n");
  const allActItems=[
    ...selectedActivities.map(id=>{const a=ALL_ACTIVITY_ITEMS.find(x=>x.id===id);return a?`• ${a.name}`:`• ${id}`;}),
    ...(customActivities||[]).map(a=>`• ${a} (custom)`),
  ];
  const actLines=allActItems.length?allActItems.join("\n"):null;
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
    actLines?`\n*Fun activities:*\n${actLines}`:null,
    "\nCan you help me book these?",
  ].filter(x=>x!==null).join("\n");
  return `https://wa.me/919211668427?text=${encodeURIComponent(parts)}`;
}

/* ── build plain-text plan for in-app chat ── */
function buildPlanText(occasion, {guests, date, city, venueType, theme, vendors, vendorPackages, budget, ageGroups=[], selectedActivities=[], customActivities=[], customCatering={}, customDecor={}}) {
  const vLines = vendors.filter(v => ALL_VENDORS.includes(v)).map(v => {
    const pi = vendorPackages[v];
    if (pi === undefined) return `• ${v} — no package selected`;
    if (pi === "custom") {
      if (v === "Caterer") {
        const cui = CUISINES.find(c=>c.id===customCatering.cuisine)?.label||"";
        const dishes = Object.entries(customCatering.dishes||{}).filter(([,arr])=>arr.length).map(([cat,arr])=>`    ${cat}: ${arr.join(", ")}`).join("\n");
        return `• Caterer — Custom menu${cui?` (${cui})`:""}${dishes?"\n"+dishes:""}`;
      }
      if (v === "Decorator") {
        const items = Object.entries(customDecor).filter(([,arr])=>arr.length).map(([cat,arr])=>`    ${cat}: ${arr.join(", ")}`).join("\n");
        return `• Decorator — Custom setup${items?"\n"+items:""}`;
      }
      return `• ${v} — Custom`;
    }
    const pkg = getVendorPackages(v, {guests, venueType, theme, ageGroups})[pi];
    if (!pkg) return `• ${v}`;
    const itemsList = pkg.items.map(it => `    - ${it}`).join("\n");
    return `• ${v} — ${pkg.label} (${pkg.price})\n${itemsList}\n    "${pkg.note}"`;
  });
  const customLines = vendors.filter(v => !ALL_VENDORS.includes(v)).map(v => `• ${v}`);
  const allLines = [...vLines, ...customLines].join("\n\n");
  const allActItemsText=[
    ...selectedActivities.map(id=>{const a=ALL_ACTIVITY_ITEMS.find(x=>x.id===id);return a?`• ${a.name} (${a.price})`:`• ${id}`;}),
    ...(customActivities||[]).map(a=>`• ${a}`),
  ];
  const actLines = allActItemsText.length
    ? "\nFun activities:\n"+allActItemsText.join("\n")
    : null;
  const dateStr = date ? new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "";
  return [
    `Hi Tendr Team! Here's my ${occasion.name} plan — please help me book:`,
    "",
    `👥 Guests: ${guests}`,
    dateStr ? `📅 Date: ${dateStr}` : null,
    (city||venueType) ? `📍 ${[city,venueType].filter(Boolean).join(" · ")}` : null,
    theme ? `🎨 Theme: ${theme.name}` : null,
    budget ? `💰 Budget: ₹${Number(budget).toLocaleString("en-IN")}` : null,
    allLines ? `\nServices needed:\n\n${allLines}` : null,
    actLines,
    "\nCan you help me book these?",
  ].filter(x => x !== null).join("\n");
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

/* ── gift personalization score ── */
function scoreGift(g, {theme, ageGroups=[], budget=null, guests=20}) {
  let sc=0, reason=null;
  const text=[g.name,g.desc||""].join(" ").toLowerCase();

  // Budget fit — assume ~12% of total budget goes to gifts
  if(budget&&Number(budget)>0) {
    const nums=(g.price||"").replace(/[₹+, ]/g,"").replace(/K/g,"000").match(/\d+/g)?.map(Number)||[];
    if(nums.length) {
      const low=nums[0], high=nums[nums.length-1]||low, mid=(low+high)/2;
      const giftAlloc=Number(budget)*0.12;
      if(mid<=giftAlloc){sc+=3;if(!reason)reason="Fits your gift budget";}
      else if(mid>giftAlloc*4){sc-=2;}
    }
  }

  // Theme keyword match
  if(theme) {
    const tWords=(theme.tags||[]).join(" ").toLowerCase().split(/\s+/).filter(w=>w.length>3);
    const hits=tWords.filter(tw=>text.includes(tw)).length;
    if(hits>0){sc+=hits*3;if(!reason)reason=`Curated for ${theme.name}`;}
  }

  // Age group relevance
  const hasKids=ageGroups.includes("Kids")||ageGroups.includes("Toddlers");
  const hasSeniors=ageGroups.includes("Seniors");
  const hasTeens=ageGroups.includes("Teens");
  if(hasKids&&/baby|child|kid|play|soft|toy|onesie|swaddle|learn|craft|magic|puzzle/i.test(text)){sc+=5;if(!reason)reason="Great for little ones";}
  if(hasSeniors&&/comfort|relax|memory|book|plant|health|garden|travel|journey|classic|watch|craft|hobby|keepsake|album|plaque/i.test(text)){sc+=4;if(!reason)reason="Ideal for seniors";}
  if(hasSeniors&&/baby|kid|toy|game/i.test(text)){sc-=3;}
  if(hasTeens&&/game|music|photo|gadget|fashion|experience|fun|tech|polaroid/i.test(text)){sc+=4;if(!reason)reason="Teens will love this";}
  if(hasKids&&/alcohol|wine|premium watch|luxury|jewellery/i.test(text)){sc-=3;}

  return {score:sc,reason};
}

/* ── approximate cost parser for budget matching ── */
function approxCost(priceStr, guests) {
  if(!priceStr) return null;
  const isPerHead=/head/i.test(priceStr);
  const nums=priceStr.replace(/[₹+, ]/g,"").replace(/K/g,"000").match(/\d+/g)?.map(Number)||[];
  if(!nums.length) return null;
  const mid=(nums[0]+(nums[nums.length-1]||nums[0]))/2;
  return isPerHead?mid*guests:mid;
}

/* ── plan card download (PDF) ── */
async function downloadPlanCard(el,name){
  try{
    const h2c=(await import("html2canvas")).default;
    const {jsPDF}=await import("jspdf");
    const canvas=await h2c(el,{scale:2,useCORS:true,backgroundColor:"#FDFAF5"});
    const imgData=canvas.toDataURL("image/png");
    const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const pW=pdf.internal.pageSize.getWidth();
    const pH=pdf.internal.pageSize.getHeight();
    const ratio=pW/canvas.width;
    const totalH=canvas.height*ratio;
    let yOff=0;
    while(yOff<totalH){
      if(yOff>0)pdf.addPage();
      pdf.addImage(imgData,"PNG",0,-yOff,pW,totalH);
      yOff+=pH;
    }
    pdf.save(`${name.replace(/\s+/g,"-").toLowerCase()}-plan.pdf`);
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
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .os{animation:fadeUp 0.24s cubic-bezier(0.22,1,0.36,1);}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:10px;border:1.5px solid rgba(196,122,46,0.22);background:rgba(196,122,46,0.03);color:${ink};font-size:14px;font-weight:500;cursor:pointer;transition:all 0.14s;font-family:${font};white-space:nowrap;position:relative;}
  .chip:hover{border-color:rgba(196,122,46,0.45);background:rgba(196,122,46,0.06);}
  .chip.sel{border-color:${gold};background:rgba(196,122,46,0.10);color:${gold};font-weight:600;}
  input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.45;cursor:pointer;filter:invert(60%) sepia(60%) saturate(400%) hue-rotate(5deg);}
  ::-webkit-scrollbar{display:none;}
  @media(min-width:600px){.g2{grid-template-columns:repeat(2,1fr)!important;}}
  @media(min-width:600px){.age-g{grid-template-columns:repeat(5,1fr)!important;}}
  @media(min-width:600px){.venue-g{grid-template-columns:repeat(4,1fr)!important;}}
`;

/* ── Progress bar ── */
function Progress({step,withTheme}){
  const labels=withTheme?["Details","Theme","Services","Fun","Gifts","Plan"]:["Details","Services","Fun","Gifts","Plan"];
  const cur=withTheme?step:(step<=1?step:step-1);
  return(
    <div style={{padding:"0 20px 0"}}>
      <div style={{display:"flex",gap:3,marginBottom:8}}>
        {labels.map((_,i)=>(
          <div key={i} style={{flex:1,height:2,borderRadius:1,background:i<cur?gold:"rgba(196,122,46,0.14)",transition:"background 0.3s"}}/>
        ))}
      </div>
      <div style={{display:"flex",gap:0,overflow:"hidden"}}>
        {labels.map((l,i)=>(
          <div key={l} style={{flex:1,fontSize:10.5,fontWeight:i+1===cur?700:400,color:i+1===cur?gold:"rgba(196,122,46,0.40)",fontFamily:font,textAlign:"center",textTransform:"uppercase",letterSpacing:"0.05em",transition:"all 0.3s",paddingBottom:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── MAIN ─────────────────── */
export default function OccasionDetail(){
  const {slug}=useParams();
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const [searchParams]=useSearchParams();
  const cardRef=useRef(null);
  const planRef=useRef(null);

  // Initialise from URL so ?planMode=with skips straight to step 1 without a flash of step 0
  const _initPm = searchParams.get("planMode");
  const _validPm = (_initPm==="with"||_initPm==="without") ? _initPm : null;
  const [planMode,setPlanMode]=useState(_validPm);
  const [step,setStep]=useState(_validPm ? 1 : 0);
  const [guests,setGuests]=useState(20);
  const [date,setDate]=useState("");
  const [budget,setBudget]=useState("");
  const [notes,setNotes]=useState("");
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
  const contentRef=useRef(null);

  /* catering builder */
  const [showCateringBuilder,setShowCateringBuilder]=useState(false);
  const [cateringBuilderStep,setCateringBuilderStep]=useState("cuisine"); // "cuisine" | "dishes"
  const [customCatering,setCustomCatering]=useState({cuisine:"",dishes:{}}); // {cuisine, dishes:{Starters:[],…}}

  /* decor builder */
  const [showDecorBuilder,setShowDecorBuilder]=useState(false);
  const [customDecor,setCustomDecor]=useState({}); // {category:[items]}
  const [editedPackageItems,setEditedPackageItems]=useState(null); // null | string[] — package item editing

  /* fun activities */
  const [selectedActivities,setSelectedActivities]=useState([]); // array of activity ids
  const toggleActivity=id=>setSelectedActivities(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);

  /* custom activities (free-text) */
  const [customActivities,setCustomActivities]=useState([]);
  const [customActivityInput,setCustomActivityInput]=useState("");
  const [showCustomActivityInput,setShowCustomActivityInput]=useState(false);
  const addCustomActivity=()=>{
    const t=customActivityInput.trim();
    if(!t)return;
    setCustomActivities(a=>[...a,t]);
    setCustomActivityInput("");
  };

  /* custom occasion name + description */
  const [customEventName,setCustomEventName]=useState("");
  const [customEventDesc,setCustomEventDesc]=useState("");

  /* custom vendor input visibility */
  const [showCustomVendorInput,setShowCustomVendorInput]=useState(false);

  /* which vendor's package panel is open */
  const [expandedVendor,setExpandedVendor]=useState(null);

  /* activity category expansion */
  const [expandedActivityType,setExpandedActivityType]=useState(null);

  /* builder free-text inputs per category */
  const [decorOtherInputs,setDecorOtherInputs]=useState({});
  const [cateringOtherInputs,setCateringOtherInputs]=useState({});

  const PLAN_KEY=`tendr-plan-${slug}`;

  /* Derive occasion early — must be before any useEffect that references it,
     so the production bundle (where esbuild merges const blocks) doesn't hit TDZ */
  const isCustomOccasion = slug === 'custom';
  const rawOccasion = getOccasionById(slug);

  // Build smart vendor recs from free-text description
  const getCustomRecommended=(desc="")=>{
    const d=desc.toLowerCase();
    const r=[];
    if(d.includes("food")||d.includes("cater")||d.includes("dinner")||d.includes("lunch")||d.includes("snack")) r.push("Caterer");
    if(d.includes("decor")||d.includes("balloon")||d.includes("flower")||d.includes("theme")) r.push("Decorator");
    if(d.includes("photo")) r.push("Photographer");
    if(d.includes("video")||d.includes("film")||d.includes("reel")) r.push("Videographer");
    if(d.includes("dj")||d.includes("music")||d.includes("dance")) r.push("DJ");
    if(d.includes("anchor")||d.includes("host")||d.includes("emcee")||d.includes("mc")||d.includes("ceremony")||d.includes("farewell")||d.includes("convocation")) r.push("Emcee / Host");
    if(d.includes("av")||d.includes("sound")||d.includes("screen")||d.includes("projector")||d.includes("stage")||d.includes("led")||d.includes("convocation")||d.includes("conference")||d.includes("seminar")) r.push("AV Setup");
    if(d.includes("cake")||d.includes("dessert")) r.push("Cake");
    if(d.includes("gift")||d.includes("hamper")) r.push("Gift Hamper");
    if(d.includes("magic")||d.includes("comedian")||d.includes("entertain")||d.includes("perform")) r.push("Magician / Entertainer");
    if(d.includes("photo booth")||d.includes("selfie")) r.push("Photo Booth");
    return r.length ? [...new Set(r)] : ["Decorator","Caterer","Photographer"];
  };

  const occasion = isCustomOccasion ? {
    id:"custom",
    name: customEventName||"My Event",
    localName:"",
    icon:"✨",
    tagline:"Your event, your way",
    coverImage:"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    vendorCategories: getCustomRecommended(customEventDesc),
    checklist:[
      "Set your event date","Confirm guest headcount","Book key vendors",
      "Confirm venue and logistics","Send out invites","Arrange transport if needed",
    ],
    giftIdeas:[],decorThemes:[],activities:[],
    budgetMin:5000,budgetMax:500000,typicalGuests:"10–500",
  } : rawOccasion;

  /* load saved plan on mount */
  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(PLAN_KEY)||"null");
      if(saved&&saved.step>0) setSavedPlan(saved);
    }catch{}
  },[slug]);

  /* save on any change */
  useEffect(()=>{
    if(step>0){
      localStorage.setItem(PLAN_KEY,JSON.stringify({
        planMode,step,guests,date,budget,city,venueType,
        ageGroups,theme,vendors,vendorPackages,cateringType,cakeType,inviteType,gifts,checked,
        selectedActivities,customCatering,customDecor,customActivities,customEventName,customEventDesc,
        savedAt:new Date().toISOString(),
      }));
    }
  },[planMode,step,guests,date,budget,city,venueType,ageGroups,theme,vendors,vendorPackages,cateringType,cakeType,inviteType,gifts,checked]);

  /* Sync to main eventPlanning session so the Navbar plan icon activates.
     Placed after `occasion` is declared to avoid TDZ in the production bundle. */
  useEffect(()=>{
    if(!occasion||step<1) return;
    dispatch(setBookingType('you-do-it'));
    dispatch(setMultipleFormData({
      eventType: occasion.name || '',
      ...(date   ? { date }           : {}),
      ...(guests ? { guests: String(guests) } : {}),
      ...(city   ? { location: city } : {}),
      ...(budget ? { budget: String(budget) } : {}),
    }));
  },[occasion?.name, date, guests, city, budget, step]);

  /* scroll content to top whenever step changes */
  useEffect(()=>{
    if(contentRef.current) contentRef.current.scrollTop=0;
  },[step]);

  function restorePlan(s){
    setPlanMode(s.planMode);setStep(s.step);setGuests(s.guests||20);
    setDate(s.date||"");setBudget(s.budget||"");setCity(s.city||"");
    setVenueType(s.venueType||"");setAgeGroups(s.ageGroups||[]);
    setTheme(s.theme||null);setVendors(s.vendors||[]);
    setVendorPackages(s.vendorPackages||{});
    setCateringType(s.cateringType||"");setCakeType(s.cakeType||"");
    setInviteType(s.inviteType||"");setGifts(s.gifts||[]);
    setChecked(s.checked||{});
    setSelectedActivities(s.selectedActivities||[]);
    if(s.customCatering) setCustomCatering(s.customCatering);
    if(s.customDecor) setCustomDecor(s.customDecor);
    if(s.customActivities) setCustomActivities(s.customActivities);
    if(s.customEventName) setCustomEventName(s.customEventName);
    if(s.customEventDesc) setCustomEventDesc(s.customEventDesc);
    setSavedPlan(null);
  }

  if(!occasion){navigate("/occasions");return null;}

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

  const smartVendors=getSmartVendors(occasion,theme,ageGroups,venueType,budget);
  const mainVendors=vendors.filter(v=>ALL_VENDORS.includes(v));
  const allVendorsChosen=mainVendors.length>0&&mainVendors.every(v=>vendorPackages[v]!==undefined&&vendorPackages[v]!==null);
  // per-vendor budget allocation (used for package tier highlighting)
  const perVendorBudget=budget&&mainVendors.length?Math.round(Number(budget)/mainVendors.length):null;

  /* navigation */
  const next=()=>{
    if(step===1){
      const toStep=withTheme?2:3;
      setStep(toStep);
      return;
    }
    if(step===2){setStep(3);return;}
    if(step===3){setStep(4);return;}
    setStep(s=>Math.min(s+1,6));
  };
  const back=()=>{
    if(step===0){navigate(-1);return;}
    if(step===1){setStep(0);return;}
    if(step===2){setStep(1);return;}
    if(step===3&&withTheme){setStep(2);return;}
    if(step===3&&!withTheme){setStep(1);return;}
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
  const btnPrimary={flex:1,padding:"15px 20px",borderRadius:10,border:"none",background:gold,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:font,boxShadow:"0 2px 10px rgba(196,122,46,0.28)",transition:"all 0.18s",letterSpacing:"0.01em",opacity:canNext()?1:0.4};
  const btnGhost={padding:"13px 18px",borderRadius:10,border:`1.5px solid rgba(196,122,46,0.28)`,background:"transparent",color:gold,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:font,transition:"all 0.18s",whiteSpace:"nowrap"};
  const sLabel={fontSize:12,fontWeight:600,color:"rgba(28,9,0,0.45)",textTransform:"uppercase",letterSpacing:"0.10em",marginBottom:14,fontFamily:font};
  const fieldCard={background:"#fff",borderRadius:12,padding:"22px 22px",border:`1px solid rgba(196,122,46,0.18)`,marginBottom:14,transition:"border-color 0.2s"};

  /* fully personalized gift sort — theme + age groups + budget */
  const sortedGifts=(occasion.giftIdeas||[]).map(g=>({
    ...g,...scoreGift(g,{theme,ageGroups,budget,guests})
  })).sort((a,b)=>b.score-a.score);

  return(
    <div style={{height:"100dvh",background:bg,fontFamily:font,display:"flex",flexDirection:"column",overflow:"hidden"}}>
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
            <div style={{fontSize:15,fontWeight:700,color:ink,letterSpacing:"-0.01em"}}>{occasion.name}</div>
            {occasion.localName&&<div style={{fontSize:11,color:gold,fontWeight:600}}>{occasion.localName}</div>}
          </div>
          {hub&&<button onClick={()=>navigate(hub)} style={{fontSize:11,fontWeight:700,color:"#7C3AED",background:"rgba(124,58,237,0.07)",border:"1px solid rgba(124,58,237,0.18)",borderRadius:8,padding:"6px 11px",cursor:"pointer",fontFamily:font,flexShrink:0}}>🛠️ Tools</button>}
        </div>
        {step>0&&<Progress step={step} withTheme={withTheme}/>}
      </div>

      {/* content */}
      <div ref={contentRef} style={{flex:1,overflowY:"auto",padding:"28px 20px 32px",maxWidth:680,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {/* ══ STEP 0: CUSTOM OCCASION — name & describe ══ */}
        {step===0&&isCustomOccasion&&(
          <div className="os">
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:52,lineHeight:1,marginBottom:12}}>✨</div>
              <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,4vw,1.8rem)",color:ink,margin:"0 0 8px",lineHeight:1.2}}>Plan your own event</p>
              <p style={{fontSize:13,color:muted,margin:0,lineHeight:1.55,maxWidth:320,marginLeft:"auto",marginRight:"auto"}}>Tell us what you're celebrating and we'll help you build it out.</p>
            </div>

            <div style={{marginBottom:18}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>What's the occasion?</label>
              <input
                type="text"
                value={customEventName}
                onChange={e=>setCustomEventName(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&customEventName.trim()){setPlanMode("without");setStep(1);}}}
                placeholder="e.g. Convocation, Team Outing, Store Launch, Farewell…"
                autoFocus
                style={{width:"100%",boxSizing:"border-box",padding:"13px 16px",borderRadius:12,border:`1.5px solid ${customEventName.trim()?"rgba(196,122,46,0.4)":"rgba(196,122,46,0.2)"}`,fontSize:15,fontFamily:font,outline:"none",color:ink,background:"#fff",transition:"border-color 0.2s"}}
              />
            </div>

            <div style={{marginBottom:24}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Describe it briefly <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional — helps us suggest the right vendors)</span></label>
              <textarea
                value={customEventDesc}
                onChange={e=>setCustomEventDesc(e.target.value)}
                placeholder="e.g. College farewell for 200 students, outdoor venue, need stage setup and catering"
                rows={3}
                style={{width:"100%",boxSizing:"border-box",padding:"12px 16px",borderRadius:12,border:"1.5px solid rgba(196,122,46,0.2)",fontSize:13.5,fontFamily:font,outline:"none",color:ink,background:"#fff",resize:"vertical",lineHeight:1.5}}
              />
            </div>

            {/* Smart vendor preview from description */}
            {customEventDesc.trim().length>8&&(()=>{
              const recs=getCustomRecommended(customEventDesc);
              return recs.length>0?(
                <div style={{marginBottom:22,padding:"12px 14px",borderRadius:12,background:"rgba(196,122,46,0.05)",border:"1px solid rgba(196,122,46,0.14)"}}>
                  <div style={{fontSize:10,fontWeight:800,color:"rgba(196,122,46,0.6)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>Vendors we'll suggest</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {recs.map(v=>(
                      <span key={v} style={{fontSize:11.5,fontWeight:600,color:gold,background:"rgba(196,122,46,0.08)",border:"1px solid rgba(196,122,46,0.2)",borderRadius:100,padding:"3px 10px"}}>{v}</span>
                    ))}
                  </div>
                  <p style={{fontSize:11,color:muted,margin:"8px 0 0",lineHeight:1.4}}>You can add or remove any of these in the next step.</p>
                </div>
              ):null;
            })()}

            <button
              onClick={()=>{if(!customEventName.trim())return;setPlanMode("without");setStep(1);}}
              disabled={!customEventName.trim()}
              style={{width:"100%",padding:"14px",borderRadius:14,background:customEventName.trim()?gold:"rgba(196,122,46,0.25)",color:"#fff",fontFamily:font,fontWeight:800,fontSize:15,border:"none",cursor:customEventName.trim()?"pointer":"not-allowed",transition:"background 0.2s"}}>
              Start planning →
            </button>
          </div>
        )}

        {/* ══ STEP 0: mode choice ══ */}
        {step===0&&!isCustomOccasion&&(
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

            <p style={{fontSize:12,fontWeight:600,color:"rgba(28,9,0,0.45)",textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 8px",fontFamily:font}}>How would you like to plan?</p>
            <p style={{fontFamily:serif,fontSize:"clamp(1.5rem,4vw,1.9rem)",color:ink,lineHeight:1.2,margin:"0 0 22px",letterSpacing:"-0.02em",fontWeight:400}}>Choose your approach</p>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* ── With Theme ── */}
              <button onClick={()=>{setPlanMode("with");setStep(1);}}
                style={{padding:"22px 20px",borderRadius:12,textAlign:"left",cursor:"pointer",border:`1.5px solid rgba(196,122,46,0.28)`,
                  background:"rgba(196,122,46,0.04)",
                  fontFamily:font,transition:"border-color 0.16s,background 0.16s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(196,122,46,0.55)";e.currentTarget.style.background="rgba(196,122,46,0.07)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(196,122,46,0.28)";e.currentTarget.style.background="rgba(196,122,46,0.04)";}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                  <div style={{width:44,height:44,borderRadius:10,background:gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🎨</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <div style={{fontFamily:serif,fontSize:18,fontWeight:500,color:ink}}>Plan with a Theme</div>
                      <span style={{fontSize:10,fontWeight:700,color:"#fff",background:gold,borderRadius:4,padding:"2px 7px",letterSpacing:"0.04em",textTransform:"uppercase",flexShrink:0}}>Recommended</span>
                    </div>
                    <p style={{fontSize:14,color:muted,margin:"0 0 12px",lineHeight:1.55}}>Pick a look — we'll customise vendors, décor, gifts and the full plan around it.</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {["Theme picker","Tailored vendors","Full blueprint"].map(t=>(
                        <span key={t} style={{fontSize:11,fontWeight:600,color:gold,background:"rgba(196,122,46,0.08)",border:"1px solid rgba(196,122,46,0.18)",borderRadius:6,padding:"3px 9px"}}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <svg style={{flexShrink:0,marginTop:14}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </button>

              {/* ── Jump straight in ── */}
              <button onClick={()=>{setPlanMode("without");setStep(1);}}
                style={{padding:"22px 20px",borderRadius:12,textAlign:"left",cursor:"pointer",
                  border:`1px solid rgba(28,9,0,0.10)`,background:"#fff",
                  fontFamily:font,transition:"border-color 0.16s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(196,122,46,0.30)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(28,9,0,0.10)";}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                  <div style={{width:44,height:44,borderRadius:10,background:"rgba(28,9,0,0.05)",border:"1px solid rgba(28,9,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>⚡</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:serif,fontSize:18,fontWeight:500,color:ink,marginBottom:5}}>Jump straight in</div>
                    <p style={{fontSize:14,color:muted,margin:"0 0 12px",lineHeight:1.55}}>Skip the theme — go straight to vendors, timeline and budget.</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {["Faster","Direct to vendors"].map(t=>(
                        <span key={t} style={{fontSize:11,fontWeight:600,color:"rgba(28,9,0,0.42)",background:"rgba(28,9,0,0.04)",border:"1px solid rgba(28,9,0,0.08)",borderRadius:6,padding:"3px 9px"}}>{t}</span>
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
              <div style={{fontSize:12,fontWeight:600,color:"rgba(28,9,0,0.42)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,fontFamily:font}}>Tell us about your celebration</div>
              <div style={{fontFamily:serif,fontSize:"clamp(1.7rem,4.5vw,2.4rem)",color:ink,lineHeight:1.15,letterSpacing:"-0.02em",fontWeight:400}}>
                {occasion.name} <span style={{fontSize:"0.7em"}}>{occasion.icon}</span>
              </div>
            </div>

            {/* ── sentence rows ── */}
            <div style={{display:"flex",flexDirection:"column"}}>

              {/* for N guests */}
              <div style={{paddingBottom:28,borderBottom:`1px solid rgba(196,122,46,0.08)`,marginBottom:28}}>
                <div style={{fontSize:14,color:muted,fontWeight:500,marginBottom:12,fontFamily:font,letterSpacing:"0.01em"}}>for how many guests?</div>
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
                    min={new Date().toISOString().split("T")[0]}
                    style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
                </div>
              </div>

              {/* at [venue] */}
              <div style={{paddingBottom:28,borderBottom:`1px solid rgba(196,122,46,0.08)`,marginBottom:28}}>
                <div style={{fontSize:14,color:muted,fontWeight:500,marginBottom:12,fontFamily:font,letterSpacing:"0.01em"}}>at what kind of venue?</div>
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
                <div style={{fontSize:14,color:muted,fontWeight:500,marginBottom:12,fontFamily:font,letterSpacing:"0.01em"}}>in which city?</div>
                <div style={{position:"relative"}}>
                  <svg style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={city?gold:muted} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <input type="text" value={city} onChange={e=>setCity(e.target.value)}
                    placeholder="Delhi, Mumbai, Bengaluru…"
                    style={{width:"100%",padding:"14px 14px 14px 40px",borderRadius:12,border:`1.5px solid ${city?gold:"rgba(196,122,46,0.18)"}`,background:city?"rgba(196,122,46,0.03)":"#fff",fontSize:16,fontFamily:serif,fontWeight:city?700:400,color:city?ink:muted,outline:"none",boxSizing:"border-box",transition:"all 0.2s"}}/>
                </div>
                <div style={{fontSize:11,color:muted,marginTop:7}}>We'll show vendors near you</div>
              </div>

              {/* budget */}
              <div style={{paddingBottom:28,borderBottom:`1px solid rgba(196,122,46,0.08)`,marginBottom:28}}>
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

              {/* who's coming — age groups (inline, last field) */}
              <div>
                <div style={{fontSize:14,color:muted,fontWeight:500,marginBottom:12,fontFamily:font,letterSpacing:"0.01em"}}>who's coming?</div>
                <p style={{fontSize:11.5,color:muted,margin:"0 0 14px",lineHeight:1.5}}>Helps us tailor catering, entertainment and activities to your crowd.</p>
                <div className="age-g" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {AGE_GROUPS.map(ag=>{
                    const sel=ageGroups.includes(ag.id);
                    return(
                      <button key={ag.id} onClick={()=>toggleAge(ag.id)}
                        style={{padding:"14px 8px",borderRadius:14,border:`1.5px solid ${sel?gold:border}`,background:sel?"rgba(196,122,46,0.09)":"#fff",cursor:"pointer",textAlign:"center",transition:"all 0.18s",display:"flex",flexDirection:"column",alignItems:"center",gap:6,minHeight:44}}>
                        <span style={{fontSize:22}}>{ag.icon}</span>
                        <div style={{fontSize:11.5,fontWeight:700,color:sel?gold:ink,lineHeight:1.2}}>{ag.label}</div>
                        <div style={{fontSize:9.5,color:muted,lineHeight:1.2}}>{ag.sub}</div>
                        {sel&&<div style={{width:5,height:5,borderRadius:"50%",background:gold}}/>}
                      </button>
                    );
                  })}
                </div>
                {ageGroups.length===0&&<p style={{fontSize:11,color:"rgba(30,15,0,0.28)",textAlign:"center",marginTop:10}}>Select all that apply — or skip</p>}
              </div>

              {/* anything else? */}
              <div style={{paddingTop:28,borderTop:`1px solid rgba(196,122,46,0.08)`,marginTop:28}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:14,color:muted,fontWeight:500,fontFamily:font,letterSpacing:"0.01em"}}>anything else we should know?</div>
                  <span style={{fontSize:10,color:muted,fontWeight:500}}>optional</span>
                </div>
                <textarea
                  value={notes}
                  onChange={e=>setNotes(e.target.value)}
                  placeholder={`e.g. it's a surprise party, guests are mostly family, prefer vegetarian food…`}
                  rows={3}
                  style={{width:"100%",padding:"13px 15px",borderRadius:12,border:`1.5px solid ${notes?gold:"rgba(196,122,46,0.18)"}`,background:notes?"rgba(196,122,46,0.03)":"#fff",fontSize:14,fontFamily:font,color:ink,outline:"none",resize:"none",lineHeight:1.55,boxSizing:"border-box",transition:"border-color 0.2s,background 0.2s"}}
                  onFocus={e=>{e.target.style.borderColor=gold;e.target.style.background="rgba(196,122,46,0.03)";}}
                  onBlur={e=>{e.target.style.borderColor=notes?gold:"rgba(196,122,46,0.18)";e.target.style.background=notes?"rgba(196,122,46,0.03)":"#fff";}}
                />
                <div style={{fontSize:11,color:muted,marginTop:6}}>Shared with your planning summary</div>
              </div>

            </div>
          </div>
        )}

        {/* ══ STEP 2: theme ══ */}
        {step===2&&withTheme&&(
          <div className="os">
            {/* heading */}
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.25,marginBottom:6}}>How should it look?</p>
            <p style={{fontSize:13,color:muted,marginBottom:16,lineHeight:1.6}}>Choose a decoration style for your event. This is optional — but it helps us suggest the right décor, colours, gifts and vendor tips.</p>

            {/* what this does — plain explainer */}
            <div style={{display:"flex",gap:10,padding:"12px 14px",borderRadius:12,background:"rgba(196,122,46,0.05)",border:"1px solid rgba(196,122,46,0.12)",marginBottom:20,alignItems:"flex-start"}}>
              <span style={{fontSize:18,flexShrink:0,lineHeight:1.3}}>🎨</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:ink,marginBottom:3}}>What does this mean?</div>
                <div style={{fontSize:11.5,color:muted,lineHeight:1.55}}>Think of it as the overall look of your decorations — the colours, style and feel. Once you pick one, everything we suggest (décor, gifts, vendor tips) will match that look.</div>
              </div>
            </div>

            {/* theme cards — 2-col image grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {(occasion.decorThemes||[]).map((t,i)=>{
                const sel=theme?.name===t.name;
                const tc=themeColor(t.tags);
                const te=themeEmoji(t.tags);
                const isLast=i===(occasion.decorThemes||[]).length-1;
                const isOdd=(occasion.decorThemes||[]).length%2===1;
                return(
                  <button key={i} onClick={()=>setTheme(sel?null:t)}
                    style={{padding:0,borderRadius:16,border:`2px solid ${sel?gold:"rgba(196,122,46,0.13)"}`,background:"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.18s",overflow:"hidden",boxShadow:sel?"0 4px 20px rgba(196,122,46,0.22)":"0 1px 5px rgba(0,0,0,0.06)",gridColumn:(isOdd&&isLast)?"1 / -1":"auto"}}
                  >
                    {/* photo / gradient fallback */}
                    <div style={{position:"relative",height:isOdd&&isLast?160:140,overflow:"hidden",background:`linear-gradient(160deg,${tc}66,${tc}28)`}}>
                      {t.photo&&(
                        <img src={t.photo} alt={t.name}
                          style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                          onError={e=>{e.currentTarget.style.display="none";}}
                        />
                      )}
                      {!t.photo&&(
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:isOdd&&isLast?44:36,filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.12))"}}>{te}</span>
                        </div>
                      )}
                      {/* bottom gradient for text legibility */}
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.62) 0%,transparent 55%)"}}/>
                      {/* theme name on photo */}
                      <div style={{position:"absolute",bottom:10,left:10,right:32}}>
                        <span style={{fontSize:12,fontWeight:800,color:"#fff",lineHeight:1.25,textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{t.name}</span>
                      </div>
                      {/* selected check */}
                      {sel&&(
                        <div style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:"50%",background:gold,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </div>
                    {/* desc + tags */}
                    <div style={{padding:"9px 11px 11px"}}>
                      <div style={{fontSize:11,color:muted,lineHeight:1.5,marginBottom:6}}>{t.desc}</div>
                      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                        {(t.tags||[]).slice(0,2).map(tag=>(
                          <span key={tag} style={{fontSize:9,fontWeight:600,color:"rgba(30,15,0,0.38)",background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"2px 7px"}}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {!theme&&<p style={{fontSize:12,color:"rgba(30,15,0,0.28)",textAlign:"center",marginTop:16}}>Tap any style to select — or press "Skip" to continue without one</p>}
            {theme&&(
              <div style={{marginTop:16,padding:"12px 16px",borderRadius:12,background:`rgba(196,122,46,0.06)`,border:`1px solid rgba(196,122,46,0.18)`,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>{themeEmoji(theme.tags)}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:gold}}>"{theme.name}" selected</div>
                  <div style={{fontSize:11,color:muted,marginTop:1}}>Décor, gifts and tips will all match this look</div>
                </div>
                <button onClick={()=>setTheme(null)} style={{fontSize:11,color:muted,background:"none",border:"none",cursor:"pointer",padding:"4px 8px",fontFamily:font}}>Clear</button>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 3: services ══ */}
        {step===3&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.3rem,3vw,1.7rem)",color:ink,lineHeight:1.3,marginBottom:6}}>What do you need?</p>
            <p style={{fontSize:12.5,color:muted,marginBottom:18,lineHeight:1.55}}>Tap to select services — we'll show the best options for each.</p>

            {/* context pills */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
              <span style={{fontSize:11,fontWeight:600,color:muted,background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"4px 10px"}}>{guests} guests</span>
              {venueType&&<span style={{fontSize:11,fontWeight:600,color:muted,background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"4px 10px"}}>{venueType}</span>}
              {city&&<span style={{fontSize:11,fontWeight:600,color:muted,background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"4px 10px"}}>{city}</span>}
              {budget&&Number(budget)>0&&<span style={{fontSize:11,fontWeight:600,color:muted,background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"4px 10px"}}>₹{Number(budget).toLocaleString("en-IN")} budget</span>}
              {ageGroups.length>0&&<span style={{fontSize:11,fontWeight:600,color:muted,background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"4px 10px"}}>{ageGroups.join(", ")}</span>}
              {theme&&<span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:gold,background:"rgba(196,122,46,0.07)",border:`1px solid rgba(196,122,46,0.18)`,borderRadius:100,padding:"4px 10px"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:themeColor(theme.tags),flexShrink:0}}/>{theme.name}
              </span>}
            </div>

            {/* ── Service picker — 3 tiers ── */}
            {(()=>{
              const essential=occasion.vendorCategories||[];
              const recOnly=[...recommended].filter(v=>!essential.includes(v));
              const addOns=ALL_VENDORS.filter(v=>!essential.includes(v)&&!recOnly.includes(v));
              const tierLabel=(label,color)=>(
                <div style={{fontSize:10,fontWeight:800,color,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:8,marginTop:4}}>{label}</div>
              );
              const chip=(v)=>{
                const sel=vendors.includes(v);
                const isRec=recommended.has(v);
                return(
                  <button key={v} onClick={()=>toggleVendor(v)}
                    style={{
                      display:"inline-flex",alignItems:"center",gap:6,
                      padding:"9px 15px",borderRadius:100,
                      border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.22)"}`,
                      background:sel?`rgba(196,122,46,0.1)`:"#fff",
                      color:sel?gold:ink,
                      fontSize:13.5,fontWeight:sel?700:600,
                      letterSpacing:"-0.01em",
                      cursor:"pointer",fontFamily:font,
                      transition:"all 0.18s",
                      boxShadow:sel?`0 0 0 3px rgba(196,122,46,0.08)`:"0 1px 3px rgba(0,0,0,0.06)",
                    }}>
                    {sel
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(196,122,46,0.4)" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    }
                    {v}
                    {isRec&&!sel&&<span style={{fontSize:9,fontWeight:800,color:"#fff",background:gold,borderRadius:100,padding:"1px 5px",marginLeft:1}}>✦</span>}
                  </button>
                );
              };
              return(
                <div style={{marginBottom:16}}>
                  {essential.length>0&&<>{tierLabel("Essential","#92400E")}<div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>{essential.filter(v=>ALL_VENDORS.includes(v)).map(chip)}</div></>}
                  {recOnly.length>0&&<>{tierLabel("Recommended for your event",gold)}<div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>{recOnly.filter(v=>ALL_VENDORS.includes(v)).map(chip)}</div></>}
                  {addOns.length>0&&<>{tierLabel("Add-ons","rgba(28,9,0,0.4)")}<div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>{addOns.map(chip)}
                    <button onClick={()=>setShowCustomVendorInput(v=>!v)}
                      style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 15px",borderRadius:100,border:`1.5px dashed ${showCustomVendorInput?"rgba(196,122,46,0.5)":"rgba(196,122,46,0.28)"}`,background:showCustomVendorInput?"rgba(196,122,46,0.06)":"#fff",color:"rgba(196,122,46,0.7)",fontSize:13.5,fontWeight:600,cursor:"pointer",fontFamily:font,transition:"all 0.18s",letterSpacing:"-0.01em"}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Other
                    </button>
                  </div></>}
                </div>
              );
            })()}

            {/* custom service input — revealed when + Other is tapped */}
            {showCustomVendorInput&&(
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:20,padding:"12px 14px",borderRadius:14,background:"rgba(196,122,46,0.04)",border:"1.5px solid rgba(196,122,46,0.16)"}}>
                <input type="text" value={customVendor} onChange={e=>setCustomVendor(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")addCustomVendor();}}
                  placeholder="e.g. Live Streaming, Gown Rental, Security…"
                  autoFocus
                  style={{flex:1,padding:"9px 14px",borderRadius:100,border:`1.5px solid rgba(196,122,46,0.25)`,background:"#fff",fontSize:13,fontFamily:font,outline:"none",color:ink}}/>
                <button onClick={addCustomVendor} disabled={!customVendor.trim()}
                  style={{flexShrink:0,padding:"9px 16px",borderRadius:100,background:customVendor.trim()?gold:"rgba(196,122,46,0.2)",color:"#fff",fontFamily:font,fontWeight:700,fontSize:13,border:"none",cursor:customVendor.trim()?"pointer":"default",transition:"background 0.2s"}}>
                  Add
                </button>
              </div>
            )}
            {/* show already-added custom vendors as removable chips */}
            {vendors.filter(v=>!ALL_VENDORS.includes(v)).length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
                {vendors.filter(v=>!ALL_VENDORS.includes(v)).map(v=>(
                  <span key={v} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",border:"1.5px solid rgba(196,122,46,0.25)",color:gold,fontSize:12.5,fontWeight:700,fontFamily:font}}>
                    {v}
                    <button onClick={()=>toggleVendor(v)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(196,122,46,0.6)",fontSize:13,padding:0,lineHeight:1,display:"flex",alignItems:"center"}}>✕</button>
                  </span>
                ))}
              </div>
            )}

            {/* ── Packages for selected vendors (collapse by default, expand on tap) ── */}
            {vendors.length>0&&(
              <div>
                <div style={{fontSize:11,fontWeight:700,color:muted,letterSpacing:"0.04em",marginBottom:12,textTransform:"uppercase",fontSize:10}}>
                  Tap a service to set your options
                </div>
                {vendors.map(v=>{
                  const isKnown=ALL_VENDORS.includes(v);
                  const pkgs=isKnown?getVendorPackages(v,{guests,venueType,theme,ageGroups}):null;
                  const chosen=vendorPackages[v];
                  const tips=isKnown?getVendorTips(v,{theme,venueType,ageGroups,cateringType,budget,guests}):null;

                  /* ── Caterer card with 3 style options + menu builder ── */
                  if(v==="Caterer"){
                    const cOpts=getCateringOptions(occasion,{guests,venueType,ageGroups,budget});
                    const isCustom=chosen==="custom";
                    const hasCustomDishes=Object.values(customCatering.dishes).some(arr=>arr.length>0);
                    const isOpen=expandedVendor==="Caterer";
                    const chosenLabel=chosen==="custom"?(hasCustomDishes?`Custom · ${Object.values(customCatering.dishes).flat().length} dishes`:"Custom menu"):typeof chosen==="number"?cOpts[chosen]?.style:null;
                    return(
                      <div key={v} style={{marginBottom:10,borderRadius:14,border:`1.5px solid ${chosen!==undefined?gold:isOpen?"rgba(196,122,46,0.4)":border}`,background:"#fff",overflow:"hidden",transition:"border-color 0.2s"}}>
                        {/* header — clickable to expand */}
                        <div onClick={()=>setExpandedVendor(ev=>ev==="Caterer"?null:"Caterer")}
                          style={{padding:"12px 14px",background:chosen!==undefined?"rgba(196,122,46,0.04)":"#fff",display:"flex",alignItems:"center",cursor:"pointer",gap:10}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <span style={{fontSize:13,fontWeight:700,color:chosen!==undefined?gold:ink}}>Caterer</span>
                              {chosenLabel&&<span style={{fontSize:9,fontWeight:700,color:gold,background:"rgba(196,122,46,0.1)",borderRadius:6,padding:"1px 7px"}}>{chosenLabel}</span>}
                              {!chosenLabel&&<span style={{fontSize:9,color:muted}}>Tap to choose style</span>}
                            </div>
                          </div>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2.5" strokeLinecap="round" style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
                          <button onClick={e=>{e.stopPropagation();toggleVendor("Caterer");setVendorPackages(vp=>{const n={...vp};delete n["Caterer"];return n;});setShowCateringBuilder(false);setExpandedVendor(null);}}
                            style={{width:26,height:26,borderRadius:"50%",background:"rgba(28,9,0,0.05)",border:"none",cursor:"pointer",fontSize:14,color:"rgba(30,15,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
                        </div>

                        {/* Options panel — only when expanded */}
                        {isOpen&&(<>
                        <div style={{borderTop:`1px solid rgba(196,122,46,0.07)`,padding:"10px 14px 0"}}>
                          <div style={{fontSize:9,fontWeight:800,color:"rgba(196,122,46,0.45)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>Choose your catering style</div>
                          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:2}}>
                            {cOpts.map((opt,oi)=>{
                              const sel=chosen===oi;
                              return(
                                <button key={oi} onClick={()=>{setVendorPackages(vp=>({...vp,Caterer:oi}));setShowCateringBuilder(false);}}
                                  style={{flex:"0 0 auto",width:"31%",minWidth:108,maxWidth:145,textAlign:"left",padding:"10px 11px",borderRadius:12,border:`1.5px solid ${sel?gold:opt.popular?"rgba(34,197,94,0.3)":"rgba(196,122,46,0.14)"}`,background:sel?"rgba(196,122,46,0.07)":"#FAFAF8",cursor:"pointer",fontFamily:font,transition:"all 0.18s",display:"flex",flexDirection:"column",gap:4}}>
                                  <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"space-between",flexWrap:"wrap"}}>
                                    <span style={{fontSize:16}}>{opt.icon}</span>
                                    {opt.popular&&!sel&&<span style={{fontSize:7.5,fontWeight:800,color:"#16a34a",background:"rgba(34,197,94,0.1)",borderRadius:100,padding:"1px 5px"}}>Best</span>}
                                    {sel&&<span style={{fontSize:7.5,fontWeight:800,color:gold,background:"rgba(196,122,46,0.12)",borderRadius:100,padding:"1px 5px"}}>✓</span>}
                                  </div>
                                  <div style={{fontSize:11.5,fontWeight:700,color:sel?gold:ink,lineHeight:1.2}}>{opt.style}</div>
                                  <div style={{fontSize:10,fontWeight:700,color:"rgba(196,122,46,0.65)"}}>{opt.priceHint}</div>
                                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                                    {opt.dishes.map((d,di)=><div key={di} style={{fontSize:10,color:muted,lineHeight:1.4}}>· {d}</div>)}
                                  </div>
                                  {sel&&<button onClick={e=>{e.stopPropagation();setShowCateringBuilder(b=>!b);setCateringBuilderStep("cuisine");}}
                                    style={{marginTop:4,fontSize:10,fontWeight:700,color:gold,background:"rgba(196,122,46,0.08)",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:8,padding:"4px 8px",cursor:"pointer",fontFamily:font,textAlign:"center"}}>
                                    ✏️ Edit dishes
                                  </button>}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fix your menu yourself option */}
                        <div style={{padding:"10px 14px 12px"}}>
                          <button onClick={()=>{setVendorPackages(vp=>({...vp,Caterer:"custom"}));setCateringBuilderStep("cuisine");setShowCateringBuilder(true);}}
                            style={{width:"100%",padding:"10px 14px",borderRadius:11,border:`1.5px dashed ${isCustom?gold:"rgba(196,122,46,0.3)"}`,background:isCustom?"rgba(196,122,46,0.05)":"transparent",color:isCustom?gold:muted,fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:font,display:"flex",alignItems:"center",gap:8,transition:"all 0.18s"}}>
                            <span style={{fontSize:16}}>📋</span>
                            <span style={{flex:1,textAlign:"left"}}>Fix your menu yourself</span>
                            {isCustom&&hasCustomDishes&&<span style={{fontSize:10,fontWeight:600,color:"#16a34a",background:"rgba(34,197,94,0.1)",borderRadius:100,padding:"2px 8px"}}>{Object.values(customCatering.dishes).flat().length} dishes picked</span>}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </button>
                        </div>

                        {/* Menu Builder panel */}
                        {showCateringBuilder&&(chosen==="custom"||typeof chosen==="number")&&(
                          <div style={{borderTop:`1px solid rgba(196,122,46,0.1)`,background:"#FFFDF8",padding:"14px 14px 16px"}}>
                            {cateringBuilderStep==="cuisine"&&(
                              <>
                                <div style={{fontSize:11,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Pick your cuisine</div>
                                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:7}}>
                                  {CUISINES.map(c=>{
                                    const sel=customCatering.cuisine===c.id;
                                    return(
                                      <button key={c.id} onClick={()=>{setCustomCatering(prev=>({...prev,cuisine:c.id,dishes:{}}));setCateringBuilderStep("dishes");}}
                                        style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.15)"}`,background:sel?"rgba(196,122,46,0.07)":"#fff",cursor:"pointer",fontFamily:font,transition:"all 0.15s",minHeight:44}}>
                                        <span style={{fontSize:18}}>{c.icon}</span>
                                        <span style={{fontSize:12.5,fontWeight:sel?700:500,color:sel?gold:ink,textAlign:"left",lineHeight:1.3}}>{c.label}</span>
                                        {sel&&<svg style={{marginLeft:"auto",flexShrink:0}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                            {cateringBuilderStep==="dishes"&&customCatering.cuisine&&(()=>{
                              const menuData=MENU_ITEMS[customCatering.cuisine]||{};
                              const totalPicked=Object.values(customCatering.dishes).flat().length;
                              return(
                                <>
                                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                                    <div style={{fontSize:11,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em"}}>
                                      {CUISINES.find(c=>c.id===customCatering.cuisine)?.label} menu
                                    </div>
                                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                                      {totalPicked>0&&<button onClick={()=>setCustomCatering(prev=>({...prev,dishes:{}}))} style={{fontSize:11,fontWeight:600,color:"rgba(196,122,46,0.6)",background:"none",border:"none",cursor:"pointer",fontFamily:font,padding:0,textDecoration:"underline"}}>Clear all</button>}
                                      <button onClick={()=>setCateringBuilderStep("cuisine")} style={{fontSize:11,fontWeight:600,color:muted,background:"transparent",border:"none",cursor:"pointer",fontFamily:font,padding:0,textDecoration:"underline"}}>Change cuisine</button>
                                    </div>
                                  </div>
                                  {MENU_CATEGORIES.filter(cat=>(menuData[cat]||[]).length>0).map(cat=>{
                                    const items=menuData[cat]||[];
                                    const picked=customCatering.dishes[cat]||[];
                                    const otherVal=cateringOtherInputs[cat]||"";
                                    return(
                                      <div key={cat} style={{marginBottom:12}}>
                                        <div style={{fontSize:11,fontWeight:700,color:ink,marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
                                          {cat}
                                          {picked.length>0&&<span style={{fontSize:9,fontWeight:800,color:"#16a34a",background:"rgba(34,197,94,0.1)",borderRadius:100,padding:"1px 6px"}}>{picked.length} picked</span>}
                                          {picked.length>0&&<button onClick={()=>setCustomCatering(prev=>({...prev,dishes:{...prev.dishes,[cat]:[]}}))} style={{fontSize:9,fontWeight:600,color:muted,background:"none",border:"none",cursor:"pointer",fontFamily:font,padding:"0 4px",marginLeft:"auto",textDecoration:"underline"}}>Clear</button>}
                                        </div>
                                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                                          {items.map(item=>{
                                            const isSel=picked.includes(item);
                                            return(
                                              <button key={item}
                                                onClick={()=>setCustomCatering(prev=>({...prev,dishes:{...prev.dishes,[cat]:isSel?picked.filter(x=>x!==item):[...picked,item]}}))}
                                                style={{padding:"6px 12px",borderRadius:100,border:`1.5px solid ${isSel?gold:"rgba(196,122,46,0.18)"}`,background:isSel?"rgba(196,122,46,0.1)":"#fff",color:isSel?gold:ink,fontSize:12,fontWeight:isSel?700:400,cursor:"pointer",fontFamily:font,transition:"all 0.15s",minHeight:32}}>
                                                {item}
                                              </button>
                                            );
                                          })}
                                          {/* Other input */}
                                          <div style={{display:"flex",gap:4,alignItems:"center"}}>
                                            <input type="text" value={otherVal}
                                              onChange={e=>setCateringOtherInputs(prev=>({...prev,[cat]:e.target.value}))}
                                              onKeyDown={e=>{if(e.key==="Enter"&&otherVal.trim()){setCustomCatering(prev=>({...prev,dishes:{...prev.dishes,[cat]:[...(prev.dishes[cat]||[]),otherVal.trim()]}}));setCateringOtherInputs(prev=>({...prev,[cat]:""}));}}}
                                              placeholder="Other…"
                                              style={{padding:"5px 10px",borderRadius:100,border:"1.5px dashed rgba(196,122,46,0.28)",background:"transparent",fontSize:12,fontFamily:font,outline:"none",color:ink,width:90,minHeight:32}}/>
                                            {otherVal.trim()&&<button onClick={()=>{setCustomCatering(prev=>({...prev,dishes:{...prev.dishes,[cat]:[...(prev.dishes[cat]||[]),otherVal.trim()]}}));setCateringOtherInputs(prev=>({...prev,[cat]:""}));}}
                                              style={{padding:"5px 10px",borderRadius:100,background:gold,color:"#fff",fontFamily:font,fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>+</button>}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {totalPicked>0&&<div style={{marginTop:8,fontSize:11.5,fontWeight:600,color:"#16a34a"}}>{totalPicked} dish{totalPicked!==1?"es":""} selected — looks great!</div>}
                                </>
                              );
                            })()}
                          </div>
                        )}
                        </>)}
                      </div>
                    );
                  }

                  /* ── Decorator card with 3 style options + decor builder ── */
                  if(v==="Decorator"){
                    const dOpts=getDecorOptions(occasion,{guests,venueType,theme,ageGroups});
                    const isCustom=chosen==="custom";
                    const totalDecorItems=Object.values(customDecor).flat().length;
                    const isOpen=expandedVendor==="Decorator";
                    const dPkgs=dOpts;
                    const chosenLabel=chosen==="custom"?(totalDecorItems?`Custom · ${totalDecorItems} items`:"Custom"):typeof chosen==="number"?dOpts[chosen]?.style:null;
                    return(
                      <div key={v} style={{marginBottom:10,borderRadius:14,border:`1.5px solid ${chosen!==undefined?gold:isOpen?"rgba(196,122,46,0.4)":border}`,background:"#fff",overflow:"hidden",transition:"border-color 0.2s"}}>
                        {/* header — clickable */}
                        <div onClick={()=>setExpandedVendor(ev=>ev==="Decorator"?null:"Decorator")}
                          style={{padding:"12px 14px",background:chosen!==undefined?"rgba(196,122,46,0.04)":"#fff",display:"flex",alignItems:"center",cursor:"pointer",gap:10}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <span style={{fontSize:13,fontWeight:700,color:chosen!==undefined?gold:ink}}>Decorator</span>
                              {chosenLabel&&<span style={{fontSize:9,fontWeight:700,color:gold,background:"rgba(196,122,46,0.1)",borderRadius:6,padding:"1px 7px"}}>{chosenLabel}</span>}
                              {!chosenLabel&&<span style={{fontSize:9,color:muted}}>Tap to choose style</span>}
                            </div>
                          </div>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2.5" strokeLinecap="round" style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
                          <button onClick={e=>{e.stopPropagation();toggleVendor("Decorator");setVendorPackages(vp=>{const n={...vp};delete n["Decorator"];return n;});setShowDecorBuilder(false);setExpandedVendor(null);}}
                            style={{width:26,height:26,borderRadius:"50%",background:"rgba(28,9,0,0.05)",border:"none",cursor:"pointer",fontSize:14,color:"rgba(30,15,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
                        </div>

                        {/* Options panel — only when expanded */}
                        {isOpen&&(<>
                        <div style={{borderTop:`1px solid rgba(196,122,46,0.07)`,padding:"10px 14px 0"}}>
                          <div style={{fontSize:9,fontWeight:800,color:"rgba(196,122,46,0.45)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>Choose your decor style</div>
                          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:2}}>
                            {dOpts.map((opt,oi)=>{
                              const sel=chosen===oi;
                              return(
                                <button key={oi} onClick={()=>{setVendorPackages(vp=>({...vp,Decorator:oi}));setShowDecorBuilder(false);}}
                                  style={{flex:"0 0 auto",width:"31%",minWidth:108,maxWidth:145,textAlign:"left",padding:"10px 11px",borderRadius:12,border:`1.5px solid ${sel?gold:opt.popular?"rgba(34,197,94,0.3)":"rgba(196,122,46,0.14)"}`,background:sel?"rgba(196,122,46,0.07)":"#FAFAF8",cursor:"pointer",fontFamily:font,transition:"all 0.18s",display:"flex",flexDirection:"column",gap:4}}>
                                  <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"space-between",flexWrap:"wrap"}}>
                                    <span style={{fontSize:16}}>{opt.icon}</span>
                                    {opt.popular&&!sel&&<span style={{fontSize:7.5,fontWeight:800,color:"#16a34a",background:"rgba(34,197,94,0.1)",borderRadius:100,padding:"1px 5px"}}>Best</span>}
                                    {sel&&<span style={{fontSize:7.5,fontWeight:800,color:gold,background:"rgba(196,122,46,0.12)",borderRadius:100,padding:"1px 5px"}}>✓</span>}
                                  </div>
                                  <div style={{fontSize:11.5,fontWeight:700,color:sel?gold:ink,lineHeight:1.2}}>{opt.style}</div>
                                  <div style={{fontSize:10,fontWeight:700,color:"rgba(196,122,46,0.65)"}}>{opt.priceHint}</div>
                                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                                    {(sel&&editedPackageItems!==null?editedPackageItems:opt.items).map((it,ii)=>(
                                      <div key={ii} style={{fontSize:11,color:muted,lineHeight:1.45,display:"flex",alignItems:"flex-start",gap:3}}>
                                        <span style={{flexShrink:0}}>·</span><span>{it}</span>
                                      </div>
                                    ))}
                                  </div>
                                  {sel&&<button onClick={e=>{e.stopPropagation();if(showDecorBuilder&&editedPackageItems!==null){setShowDecorBuilder(false);setEditedPackageItems(null);}else{setEditedPackageItems([...opt.items]);setShowDecorBuilder(true);}}}
                                    style={{marginTop:4,fontSize:10,fontWeight:700,color:gold,background:"rgba(196,122,46,0.08)",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:8,padding:"4px 8px",cursor:"pointer",fontFamily:font,textAlign:"center"}}>
                                    {showDecorBuilder&&editedPackageItems!==null?"✓ Done":"✏️ Edit items"}
                                  </button>}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fix the things required option */}
                        <div style={{padding:"10px 14px 12px"}}>
                          <button onClick={()=>{setVendorPackages(vp=>({...vp,Decorator:"custom"}));setShowDecorBuilder(true);}}
                            style={{width:"100%",padding:"10px 14px",borderRadius:11,border:`1.5px dashed ${isCustom?gold:"rgba(196,122,46,0.3)"}`,background:isCustom?"rgba(196,122,46,0.05)":"transparent",color:isCustom?gold:muted,fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:font,display:"flex",alignItems:"center",gap:8,transition:"all 0.18s"}}>
                            <span style={{fontSize:16}}>🎨</span>
                            <span style={{flex:1,textAlign:"left"}}>Fix the items yourself</span>
                            {isCustom&&totalDecorItems>0&&<span style={{fontSize:10,fontWeight:600,color:"#16a34a",background:"rgba(34,197,94,0.1)",borderRadius:100,padding:"2px 8px"}}>{totalDecorItems} items picked</span>}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </button>
                        </div>

                        {/* Decor Builder panel */}
                        {showDecorBuilder&&(chosen==="custom"||typeof chosen==="number")&&(
                          <div style={{borderTop:`1px solid rgba(196,122,46,0.1)`,background:"#FFFDF8",padding:"14px 14px 16px"}}>

                            {/* Package edit mode — remove existing + add from categories */}
                            {editedPackageItems!==null&&typeof chosen==="number"&&(
                              <div style={{marginBottom:16}}>
                                <div style={{fontSize:11,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Current items</div>
                                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:4}}>
                                  {editedPackageItems.map((item,idx)=>(
                                    <div key={idx} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:100,background:"rgba(196,122,46,0.1)",border:`1.5px solid ${gold}`,fontSize:12,fontWeight:600,color:gold,fontFamily:font}}>
                                      <span>{item}</span>
                                      <button onClick={()=>setEditedPackageItems(prev=>prev.filter((_,i)=>i!==idx))}
                                        style={{display:"flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"rgba(196,122,46,0.2)",border:"none",color:gold,fontSize:9,fontWeight:900,cursor:"pointer",padding:0,lineHeight:1}}>✕</button>
                                    </div>
                                  ))}
                                  {editedPackageItems.length===0&&<div style={{fontSize:12,color:muted,padding:"4px 0"}}>No items — add from below</div>}
                                </div>
                                <div style={{borderTop:`1px solid rgba(196,122,46,0.1)`,marginTop:10,paddingTop:10,fontSize:11,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Add items</div>
                              </div>
                            )}

                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                              {editedPackageItems===null&&<div style={{fontSize:11,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em"}}>Pick what you need</div>}
                              {editedPackageItems===null&&totalDecorItems>0&&<button onClick={()=>setCustomDecor({})} style={{fontSize:11,fontWeight:600,color:"rgba(196,122,46,0.6)",background:"none",border:"none",cursor:"pointer",fontFamily:font,padding:0,textDecoration:"underline"}}>Clear all</button>}
                            </div>
                            {DECOR_CATEGORIES.map(cat=>{
                              const items=DECOR_ITEMS[cat]||[];
                              const picked=editedPackageItems!==null
                                ? editedPackageItems.filter(i=>items.includes(i))
                                : (customDecor[cat]||[]);
                              const otherVal=decorOtherInputs[cat]||"";
                              return(
                                <div key={cat} style={{marginBottom:14}}>
                                  <div style={{fontSize:11,fontWeight:700,color:ink,marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
                                    {cat}
                                    {picked.length>0&&<span style={{fontSize:9,fontWeight:800,color:"#16a34a",background:"rgba(34,197,94,0.1)",borderRadius:100,padding:"1px 6px"}}>{picked.length} picked</span>}
                                    {picked.length>0&&editedPackageItems===null&&<button onClick={()=>setCustomDecor(prev=>({...prev,[cat]:[]}))} style={{fontSize:9,fontWeight:600,color:muted,background:"none",border:"none",cursor:"pointer",fontFamily:font,padding:"0 4px",marginLeft:"auto",textDecoration:"underline"}}>Clear</button>}
                                  </div>
                                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                                    {items.map(item=>{
                                      const isSel=picked.includes(item);
                                      return(
                                        <button key={item}
                                          onClick={()=>{
                                            if(editedPackageItems!==null){
                                              setEditedPackageItems(prev=>isSel?prev.filter(x=>x!==item):[...prev,item]);
                                            } else {
                                              setCustomDecor(prev=>({...prev,[cat]:isSel?picked.filter(x=>x!==item):[...picked,item]}));
                                            }
                                          }}
                                          style={{padding:"6px 12px",borderRadius:100,border:`1.5px solid ${isSel?gold:"rgba(196,122,46,0.18)"}`,background:isSel?"rgba(196,122,46,0.1)":"#fff",color:isSel?gold:ink,fontSize:12,fontWeight:isSel?700:500,cursor:"pointer",fontFamily:font,transition:"all 0.15s",minHeight:32}}>
                                          {item}
                                        </button>
                                      );
                                    })}
                                    {/* Other input */}
                                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                                      <input type="text" value={otherVal}
                                        onChange={e=>setDecorOtherInputs(prev=>({...prev,[cat]:e.target.value}))}
                                        onKeyDown={e=>{if(e.key==="Enter"&&otherVal.trim()){
                                          if(editedPackageItems!==null){setEditedPackageItems(prev=>[...prev,otherVal.trim()]);}
                                          else{setCustomDecor(prev=>({...prev,[cat]:[...(prev[cat]||[]),otherVal.trim()]}));}
                                          setDecorOtherInputs(prev=>({...prev,[cat]:""}));
                                        }}}
                                        placeholder="Other…"
                                        style={{padding:"5px 10px",borderRadius:100,border:"1.5px dashed rgba(196,122,46,0.28)",background:"transparent",fontSize:12,fontFamily:font,outline:"none",color:ink,width:90,minHeight:32}}/>
                                      {otherVal.trim()&&<button onClick={()=>{
                                          if(editedPackageItems!==null){setEditedPackageItems(prev=>[...prev,otherVal.trim()]);}
                                          else{setCustomDecor(prev=>({...prev,[cat]:[...(prev[cat]||[]),otherVal.trim()]}));}
                                          setDecorOtherInputs(prev=>({...prev,[cat]:""}));
                                        }}
                                        style={{padding:"5px 10px",borderRadius:100,background:gold,color:"#fff",fontFamily:font,fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>+</button>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {editedPackageItems!==null&&<div style={{marginTop:8,fontSize:12,fontWeight:700,color:gold}}>{editedPackageItems.length} item{editedPackageItems.length!==1?"s":""} in your package</div>}
                            {editedPackageItems===null&&totalDecorItems>0&&<div style={{marginTop:4,fontSize:11.5,fontWeight:600,color:"#16a34a"}}>{totalDecorItems} item{totalDecorItems!==1?"s":""} selected</div>}
                          </div>
                        )}
                        </>)}
                      </div>
                    );
                  }

                  /* ── all other vendors — click-to-expand ── */
                  const isOpen=expandedVendor===v;
                  const chosenPkgLabel=typeof chosen==="number"&&pkgs?pkgs[chosen]?.label:null;
                  return(
                    <div key={v} style={{marginBottom:10,borderRadius:14,border:`1.5px solid ${chosen!==undefined?gold:isOpen?"rgba(196,122,46,0.4)":border}`,background:"#fff",overflow:"hidden",transition:"border-color 0.2s"}}>
                      {/* header row — clickable */}
                      <div onClick={()=>setExpandedVendor(ev=>ev===v?null:v)}
                        style={{padding:"12px 14px",background:chosen!==undefined?"rgba(196,122,46,0.04)":"#fff",display:"flex",alignItems:"center",cursor:"pointer",gap:10}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <span style={{fontSize:13,fontWeight:700,color:chosen!==undefined?gold:ink}}>{v}</span>
                            {chosenPkgLabel&&<span style={{fontSize:9,fontWeight:700,color:gold,background:"rgba(196,122,46,0.1)",borderRadius:6,padding:"1px 7px"}}>{chosenPkgLabel}</span>}
                            {chosen===undefined&&<span style={{fontSize:9,color:muted}}>Tap to choose package</span>}
                          </div>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2.5" strokeLinecap="round" style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
                        <button onClick={e=>{e.stopPropagation();toggleVendor(v);setVendorPackages(vp=>{const n={...vp};delete n[v];return n;});setExpandedVendor(null);}}
                          style={{width:26,height:26,borderRadius:"50%",background:"rgba(28,9,0,0.05)",border:"none",cursor:"pointer",fontSize:14,color:"rgba(30,15,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
                      </div>
                      {/* packages — only when expanded */}
                      {isOpen&&pkgs&&(
                        <div style={{borderTop:`1px solid rgba(196,122,46,0.07)`,padding:"10px 14px 12px"}}>
                          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:2}}>
                            {pkgs.slice(0,3).map((pkg,pi)=>{
                              const sel=chosen===pi;
                              const cost=approxCost(pkg.price,guests);
                              const budgetFit=perVendorBudget&&cost?(cost<=perVendorBudget*1.25?"fits":cost<=perVendorBudget*2?"stretch":"over"):null;
                              return(
                                <button key={pkg.label} onClick={()=>{setVendorPackages(vp=>({...vp,[v]:pi}));setExpandedVendor(null);}}
                                  style={{flex:"0 0 auto",width:"31%",minWidth:100,maxWidth:140,textAlign:"left",padding:"10px 11px",borderRadius:12,border:`1.5px solid ${sel?gold:budgetFit==="fits"?"rgba(34,197,94,0.35)":"rgba(196,122,46,0.14)"}`,background:sel?"rgba(196,122,46,0.07)":"#FAFAF8",cursor:"pointer",fontFamily:font,transition:"all 0.18s",display:"flex",flexDirection:"column",gap:4}}>
                                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:4,flexWrap:"wrap"}}>
                                    <span style={{fontSize:12,fontWeight:700,color:sel?gold:ink,lineHeight:1.2}}>{pkg.label}</span>
                                    {budgetFit==="fits"&&!sel&&<span style={{fontSize:7.5,fontWeight:800,color:"#16a34a",background:"rgba(34,197,94,0.1)",borderRadius:100,padding:"1px 5px",flexShrink:0}}>✓ Budget</span>}
                                    {pkg.popular&&budgetFit!=="fits"&&<span style={{fontSize:8,fontWeight:800,color:gold,background:"rgba(196,122,46,0.1)",borderRadius:100,padding:"1px 5px",flexShrink:0}}>Best</span>}
                                  </div>
                                  <div style={{display:"flex",flexDirection:"column",gap:1.5}}>
                                    {pkg.items.map((it,ii)=><div key={ii} style={{fontSize:10,color:muted,lineHeight:1.4}}>· {it}</div>)}
                                  </div>
                                  {sel&&<div style={{width:16,height:16,borderRadius:"50%",background:gold,display:"flex",alignItems:"center",justifyContent:"center",alignSelf:"flex-end",marginTop:2}}>
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  </div>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* selection count pill */}
                {mainVendors.length>0&&(
                  <div style={{marginTop:8,padding:"10px 16px",borderRadius:12,background:"rgba(196,122,46,0.06)",border:`1px solid rgba(196,122,46,0.15)`,display:"flex",alignItems:"center",gap:8}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{fontSize:12,fontWeight:700,color:gold}}>{mainVendors.length} service{mainVendors.length>1?"s":""} selected</span>
                    <span style={{fontSize:11,color:muted,marginLeft:"auto"}}>Tap next to continue →</span>
                  </div>
                )}
              </div>
            )}

            {/* theme hint when no vendors yet */}
            {theme&&vendors.length===0&&(
              <div style={{background:"rgba(196,122,46,0.05)",border:`1px solid ${border}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{...sLabel,marginBottom:6}}>About {theme.name}</div>
                <p style={{fontSize:12.5,color:muted,margin:0,lineHeight:1.6}}>{theme.desc}</p>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 4: entertainment & activities ══ */}
        {step===4&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.3rem,3vw,1.7rem)",color:ink,lineHeight:1.3,marginBottom:6}}>Add entertainment</p>
            <p style={{fontSize:12.5,color:muted,marginBottom:20,lineHeight:1.55}}>Pick a category to see what's available — all bookable through Tendr.</p>
            {(()=>{
              const actSuggestions=getActivitySuggestions(occasion,{ageGroups,theme});
              const totalSelected=selectedActivities.length+customActivities.length;
              return(
                <div>
                  {totalSelected>0&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"10px 14px",borderRadius:10,background:"rgba(196,122,46,0.06)",border:`1px solid rgba(196,122,46,0.15)`}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{fontSize:12,fontWeight:700,color:gold}}>{totalSelected} item{totalSelected!==1?"s":""} added</span>
                    </div>
                  )}

                  {/* Category cards — 2 per row */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                    {ACTIVITY_TYPES.map(({key,label,icon:typeIcon})=>{
                      const items=actSuggestions[key]||[];
                      if(!items.length) return null;
                      const selCount=items.filter(a=>selectedActivities.includes(a.id)).length;
                      const isOpen=expandedActivityType===key;
                      return(
                        <button key={key} onClick={()=>setExpandedActivityType(isOpen?null:key)}
                          style={{
                            padding:"16px 14px",borderRadius:14,textAlign:"left",cursor:"pointer",
                            border:`1.5px solid ${isOpen?gold:selCount>0?"rgba(196,122,46,0.4)":"rgba(196,122,46,0.14)"}`,
                            background:isOpen?"rgba(196,122,46,0.07)":selCount>0?"rgba(196,122,46,0.04)":"#fff",
                            fontFamily:font,transition:"all 0.18s",position:"relative",
                          }}>
                          <div style={{fontSize:24,marginBottom:8,lineHeight:1}}>{typeIcon}</div>
                          <div style={{fontSize:12.5,fontWeight:700,color:isOpen?gold:ink,lineHeight:1.3,marginBottom:2}}>{label}</div>
                          <div style={{fontSize:10.5,color:muted}}>{items.length} options</div>
                          {selCount>0&&(
                            <div style={{position:"absolute",top:10,right:10,width:20,height:20,borderRadius:"50%",background:gold,display:"flex",alignItems:"center",justifyContent:"center"}}>
                              <span style={{fontSize:10,fontWeight:800,color:"#fff"}}>{selCount}</span>
                            </div>
                          )}
                          {isOpen&&(
                            <div style={{position:"absolute",bottom:10,right:10}}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Expanded items for selected category */}
                  {expandedActivityType&&(()=>{
                    const {key,label,singular}=ACTIVITY_TYPES.find(t=>t.key===expandedActivityType)||{};
                    const items=actSuggestions[key]||[];
                    return(
                      <div style={{marginBottom:20,borderRadius:16,border:`1.5px solid ${gold}`,background:"#fff",overflow:"hidden"}}>
                        <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(196,122,46,0.1)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span style={{fontSize:13,fontWeight:800,color:gold}}>{label}</span>
                          <button onClick={()=>setExpandedActivityType(null)} style={{background:"none",border:"none",cursor:"pointer",color:muted,fontSize:18,lineHeight:1,padding:"0 0 0 8px"}}>×</button>
                        </div>
                        <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                          {items.map(a=>{
                            const sel=selectedActivities.includes(a.id);
                            return(
                              <button key={a.id} onClick={()=>toggleActivity(a.id)}
                                style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.14)"}`,background:sel?"rgba(196,122,46,0.06)":"#FAFAF8",cursor:"pointer",fontFamily:font,transition:"all 0.16s",textAlign:"left"}}>
                                <div style={{width:38,height:38,borderRadius:10,background:sel?"rgba(196,122,46,0.12)":"rgba(196,122,46,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>
                                  {a.icon}
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:13,fontWeight:700,color:sel?gold:ink,lineHeight:1.25,marginBottom:2}}>{a.name}</div>
                                  <div style={{fontSize:11,color:muted,lineHeight:1.4,marginBottom:2}}>{a.desc}</div>
                                </div>
                                <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${sel?gold:"rgba(196,122,46,0.2)"}`,background:sel?gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.16s"}}>
                                  {sel&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Custom activity */}
                  <div style={{paddingTop:16,borderTop:"1px solid rgba(196,122,46,0.08)"}}>
                    <div style={{fontSize:11,fontWeight:700,color:muted,letterSpacing:"0.06em",marginBottom:10,textTransform:"uppercase"}}>Something else in mind?</div>

                    {customActivities.length>0&&(
                      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
                        {customActivities.map((act,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,border:`1px solid ${gold}`,background:"rgba(196,122,46,0.05)"}}>
                            <span style={{flex:1,fontSize:13,fontWeight:600,color:ink}}>{act}</span>
                            <button onClick={()=>setCustomActivities(a=>a.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(196,122,46,0.5)",fontSize:15,padding:0,lineHeight:1}}>×</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showCustomActivityInput?(
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <input type="text" value={customActivityInput} onChange={e=>setCustomActivityInput(e.target.value)}
                          onKeyDown={e=>{if(e.key==="Enter")addCustomActivity();if(e.key==="Escape")setShowCustomActivityInput(false);}}
                          placeholder="e.g. Live streaming, Air hockey, Magic show…"
                          autoFocus
                          style={{flex:1,padding:"10px 14px",borderRadius:10,border:"1.5px solid rgba(196,122,46,0.3)",background:"#fff",fontSize:13,fontFamily:font,outline:"none",color:ink}}/>
                        <button onClick={addCustomActivity} disabled={!customActivityInput.trim()}
                          style={{flexShrink:0,padding:"10px 18px",borderRadius:10,background:customActivityInput.trim()?gold:"rgba(196,122,46,0.2)",color:"#fff",fontFamily:font,fontWeight:700,fontSize:13,border:"none",cursor:customActivityInput.trim()?"pointer":"default",transition:"background 0.2s"}}>
                          Add
                        </button>
                      </div>
                    ):(
                      <button onClick={()=>setShowCustomActivityInput(true)}
                        style={{display:"inline-flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,border:"1.5px dashed rgba(196,122,46,0.3)",background:"transparent",color:muted,fontFamily:font,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all 0.18s"}}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add custom entertainment
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ STEP 5: gifts ══ */}
        {step===5&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:6}}>Any gifts?</p>
            <p style={{fontSize:13,color:muted,marginBottom:16,lineHeight:1.6}}>
              {[theme&&`Curated for ${theme.name}`,ageGroups.length>0&&`tailored for ${ageGroups.join(" & ")}`,budget&&Number(budget)>0&&`within ₹${Math.round(Number(budget)*0.12).toLocaleString("en-IN")} gift budget`].filter(Boolean).join(" · ")||"Pick gifts to add to your plan."}
              {(theme||ageGroups.length>0||budget)&&" — ranked for your event."}
            </p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {theme&&<span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:gold,background:"rgba(196,122,46,0.07)",border:`1px solid rgba(196,122,46,0.18)`,borderRadius:100,padding:"3px 10px"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:themeColor(theme.tags)}}/>{theme.name}
              </span>}
              {ageGroups.map(ag=><span key={ag} style={{fontSize:11,fontWeight:600,color:muted,background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"3px 10px"}}>{ag}</span>)}
              {budget&&Number(budget)>0&&<span style={{fontSize:11,fontWeight:600,color:muted,background:"rgba(28,9,0,0.05)",borderRadius:100,padding:"3px 10px"}}>₹{Number(budget).toLocaleString("en-IN")} total</span>}
            </div>
            <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr",gap:10}}>
              {sortedGifts.map((g,i)=>{
                const sel=gifts.includes(g.name);
                return(
                  <button key={i} onClick={()=>toggleGift(g.name)}
                    style={{padding:"15px 16px",borderRadius:14,textAlign:"left",cursor:"pointer",border:`1.5px solid ${sel?gold:g.score>0?"rgba(196,122,46,0.22)":"rgba(196,122,46,0.12)"}`,background:sel?"rgba(196,122,46,0.06)":"#fff",fontFamily:font,transition:"all 0.18s",minHeight:44}}
                    onMouseEnter={e=>{if(!sel)e.currentTarget.style.borderColor="rgba(196,122,46,0.3)";}}
                    onMouseLeave={e=>{if(!sel)e.currentTarget.style.borderColor=g.score>0?"rgba(196,122,46,0.22)":"rgba(196,122,46,0.12)";}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:4}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:sel?gold:ink,lineHeight:1.3,marginBottom:3}}>{g.name}</div>
                        {g.reason&&!sel&&<span style={{fontSize:9.5,fontWeight:700,color:g.reason.includes("Budget")||g.reason.includes("budget")?"#16a34a":gold,background:g.reason.includes("Budget")||g.reason.includes("budget")?"rgba(34,197,94,0.09)":"rgba(196,122,46,0.08)",borderRadius:100,padding:"2px 8px"}}>{g.reason}</span>}
                      </div>
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
            <p style={{fontSize:13,color:muted,marginBottom:16,lineHeight:1.6}}>Full plan below — download as a PDF to save or share.</p>

            {/* download + send buttons */}
            <div style={{display:"flex",gap:10,marginBottom:20}}>
              <button onClick={async()=>{setDownloading(true);await downloadPlanCard(planRef.current,occasion.name);setDownloading(false);}} disabled={downloading}
                style={{flex:1,padding:"13px 16px",borderRadius:12,border:`1px solid rgba(196,122,46,0.25)`,background:"#fff",color:gold,fontSize:13,fontWeight:700,cursor:downloading?"wait":"pointer",fontFamily:font,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                {downloading?<><div style={{width:14,height:14,borderRadius:"50%",border:`2px solid rgba(196,122,46,0.2)`,borderTopColor:gold,animation:"spin 0.7s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Generating…</>:<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download PDF</>}
              </button>
              <button
                onClick={()=>{
                  const msg=buildPlanText(occasion,{guests,date,city,venueType,theme,vendors,vendorPackages,budget,ageGroups,selectedActivities,customActivities,customCatering,customDecor});
                  document.dispatchEvent(new CustomEvent("tendr:open-chat-with-plan",{detail:{message:msg}}));
                }}
                style={{flex:1,padding:"13px 16px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:font,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Send to Chat
              </button>
            </div>

            {/* everything below this is captured by planRef */}
            <div ref={planRef} style={{background:"#FDFAF5",borderRadius:20,padding:"20px",border:`1px solid rgba(196,122,46,0.1)`}}>

            {/* plan overview card */}
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
                    <div style={{fontSize:9,fontWeight:700,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Services planned</div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {catVendors.map(v=>{
                        const pkgIdx=vendorPackages[v];
                        const pkgs=ALL_VENDORS.includes(v)?getVendorPackages(v,{guests,venueType,theme,ageGroups}):null;
                        const pkgLabel=pkgIdx==="custom"?"Custom":typeof pkgIdx==="number"&&pkgs?pkgs[pkgIdx]?.label:null;
                        const pkgPrice=pkgIdx==="custom"?null:typeof pkgIdx==="number"&&pkgs?pkgs[pkgIdx]?.price:null;
                        const pkgItems=pkgIdx==="custom"
                          ?(v==="Decorator"?Object.values(customDecor).flat().slice(0,3):v==="Caterer"?Object.values(customCatering.dishes).flat().slice(0,3):[])
                          :typeof pkgIdx==="number"&&pkgs?pkgs[pkgIdx]?.items||[]:[];
                        return(
                          <div key={v} style={{display:"flex",alignItems:"flex-start",gap:10,background:"rgba(196,122,46,0.06)",border:"1px solid rgba(196,122,46,0.13)",borderRadius:10,padding:"8px 11px"}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:pkgItems?.length?3:0}}>
                                <span style={{fontSize:11,fontWeight:700,color:gold}}>{v}</span>
                                {pkgLabel&&<span style={{fontSize:9,fontWeight:700,color:muted,background:"rgba(28,9,0,0.06)",borderRadius:6,padding:"1px 6px"}}>{pkgLabel}</span>}
                              </div>
                              {pkgItems&&pkgItems.length>0&&(
                                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                                  {pkgItems.map((it,ii)=><span key={ii} style={{fontSize:9,color:muted}}>· {it}</span>)}
                                </div>
                              )}
                            </div>
                            {pkgPrice&&<span style={{fontSize:9.5,fontWeight:700,color:gold,flexShrink:0}}>{pkgPrice}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div style={{borderTop:`1px solid rgba(196,122,46,0.1)`,paddingTop:10,marginTop:2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:9.5,color:muted,fontFamily:font}}>Generated with Tendr</span>
                  <span style={{fontSize:10,letterSpacing:2}}>★★★★★</span>
                </div>
              </div>
            </div>

            {/* event itinerary — hero of the plan */}
            {(()=>{
              const itinerary=buildItinerary(occasion,{guests,vendors,selectedActivities,venueType,ageGroups});
              if(!itinerary.length) return null;
              return(
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontFamily:font}}>Your event itinerary</div>
                  <div style={{background:"#fff",borderRadius:14,border:`1px solid ${border}`,overflow:"hidden"}}>
                    {itinerary.map((slot,i)=>{
                      const isHighlight=slot.type==="highlight";
                      const isFun=slot.type==="fun";
                      const isLast=i===itinerary.length-1;
                      return(
                        <div key={i} style={{display:"flex",gap:0,position:"relative"}}>
                          <div style={{width:72,flexShrink:0,padding:"12px 10px 12px 14px",display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"flex-start",paddingTop:14}}>
                            <span style={{fontSize:10.5,fontWeight:700,color:isHighlight?gold:muted,lineHeight:1.2,textAlign:"right",letterSpacing:"-0.01em"}}>{slot.time}</span>
                          </div>
                          <div style={{width:24,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
                            <div style={{width:10,height:10,borderRadius:"50%",background:isHighlight?gold:isFun?"#7C3AED":"rgba(196,122,46,0.3)",border:`2px solid ${isHighlight?gold:isFun?"#7C3AED":"rgba(196,122,46,0.15)"}`,marginTop:16,flexShrink:0,zIndex:1}}/>
                            {!isLast&&<div style={{width:2,flex:1,background:"rgba(196,122,46,0.08)",marginTop:2}}/>}
                          </div>
                          <div style={{flex:1,padding:"12px 14px 12px 8px",borderBottom:isLast?"none":`1px solid rgba(196,122,46,0.06)`}}>
                            <div style={{fontSize:12.5,fontWeight:isHighlight?800:700,color:isHighlight?gold:ink,lineHeight:1.3,marginBottom:slot.desc?3:0}}>{slot.title}</div>
                            {slot.desc&&<div style={{fontSize:11.5,color:muted,lineHeight:1.45}}>{slot.desc}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{fontSize:11,color:muted,marginTop:8,textAlign:"center",lineHeight:1.4}}>Timings are approximate — adjust as needed for your event</div>
                </div>
              );
            })()}

            {/* timeline — booking countdown */}
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

            {/* fun activities in plan */}
            {(selectedActivities.length>0||customActivities.length>0)&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontFamily:font}}>Entertainment & Activities</div>
                {selectedActivities.map(id=>{
                  const a=ALL_ACTIVITY_ITEMS.find(x=>x.id===id);
                  if(!a) return null;
                  const typeEntry=ACTIVITY_TYPES.find(t=>ALL_ACTIVITIES[t.key]?.some(x=>x.id===id));
                  const typeLabel=typeEntry?.singular||"Activity";
                  return(
                    <div key={id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:"#fff",border:`1px solid ${border}`,marginBottom:6}}>
                      <span style={{fontSize:18,flexShrink:0}}>{a.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12.5,fontWeight:700,color:ink}}>{a.name}</div>
                        <div style={{fontSize:10.5,color:muted}}>{typeLabel}</div>
                      </div>
                    </div>
                  );
                })}
                {customActivities.map((act,i)=>(
                  <div key={`custom-${i}`} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:"#fff",border:`1px solid ${border}`,marginBottom:6}}>
                    <span style={{fontSize:18,flexShrink:0}}>✦</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:700,color:ink}}>{act}</div>
                      <div style={{fontSize:10.5,color:muted}}>Custom · Added by you</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
            <div style={{marginBottom:8}}>
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

            </div>{/* end planRef */}

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

      {/* bottom CTA — flex footer, always visible */}
      {step>0&&(
        <div style={{flexShrink:0,background:bg,borderTop:`1px solid ${border}`,padding:"12px 20px calc(12px + env(safe-area-inset-bottom,0px))",zIndex:50}}>
          <div style={{maxWidth:680,margin:"0 auto",display:"flex",gap:10}}>
            {step>0&&<button onClick={back} style={btnGhost}>← Back</button>}
            {step<6&&(
              <button onClick={next} disabled={!canNext()} style={btnPrimary}>
                {step===1&&(!date?"Set a date first →":"Next →")}
                {step===2&&(theme?`Use "${theme.name}" →`:"Skip — no theme →")}
                {step===3&&(vendors.length>0?"Next — Add Entertainment →":"Skip →")}
                {step===4&&(selectedActivities.length>0?`Next — Pick Gifts →`:"Skip — pick gifts →")}
                {step===5&&(gifts.length>0?"See my plan →":"Skip — see plan →")}
              </button>
            )}
            {step===6&&(
              <button onClick={()=>window.open(buildBaatKaroMsg(occasion,{guests,date,city,venueType,theme,vendors,vendorPackages,budget,selectedActivities,customActivities}),"_blank","noopener")} style={btnPrimary}>
                Send to Baat Karo ↗
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

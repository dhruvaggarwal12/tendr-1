import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useChatOverlay } from "../../context/ChatContext";
import { usePriceEstimator } from "../../context/PriceEstimatorContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
import { setMultipleFormData, setBookingType, setSelectedPerformer } from "../../redux/eventPlanningSlice";
import { PERFORMER_TYPES } from "../../components/PerformerSuggestions";
import { getVendors } from "../../apis/vendorApi";
import { getOccasionById } from "../../data/occasions";
import { getEntryExperienceById, entryEmoji } from "../../data/entryExperiences";
import { DECOR_FOCUS_AREAS, DECOR_FOCUS_AREA_IDS } from "../../data/decorFocusAreas";
import { ALL_INDIAN_CITIES, SERVICED_CITIES } from "../../data/indianCities";
import { saveResumeUrl } from "../../utils/planningResume";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import PerformerSuggestions from "../../components/PerformerSuggestions";
import DecorAnalyzer from "../../components/DecorAnalyzer";
import EntryExperiences from "../../components/EntryExperiences";

/* ── tokens ── */
const font  = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";
// Brand defaults — used as-is when planning without a theme. When planning WITH a theme,
// OccasionDetail() shadows these with theme-derived values (see themeColor()) so the whole
// flow from step 3 onward reads as "this event, in this theme" rather than generic brand gold.
const BRAND_GOLD   = "#C47A2E";
const BRAND_GOLD_LT= "#D4A848";
const BRAND_BORDER = "rgba(196,122,46,0.2)";
const bg    = "#FDFAF5";
const ink   = "#1C0900";
const muted = "rgba(28,9,0,0.55)";

const HUB_ROUTES = {
  "birthday-party":"\/birthday-hub","first-birthday":"\/birthday-hub",
  "anniversary":"\/anniversary-hub","baby-shower":"\/baby-shower-hub",
  "office-party":"\/office-party-hub",
  "gender-reveal":"\/baby-shower-hub","newborn-welcome":"\/baby-shower-hub",
  "housewarming":"\/housewarming-hub","get-together":"\/get-together-hub",
  "naming-ceremony":"\/naming-ceremony-hub",
};

const OCC_ACCENT = {
  "birthday-party":"#E86060","first-birthday":"#F0A050","baby-shower":"#D4856E",
  "anniversary":"#C47A2E","housewarming":"#E0A030","get-together":"#5080D0",
  "office-party":"#5878C0","farewell":"#9070D0","retirement":"#C06030",
  "graduation":"#4878B8","navratri-garba":"#F0A020","diwali":"#E8900A",
  "holi":"#D040A0","bachelorette":"#E878B8","wedding":"#C05080",
  "gender-reveal":"#A060C0","naming-ceremony":"#D08040","newborn-welcome":"#60A090",
  "house-party":"#E87840","dussehra":"#D04040",
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

// A few ALL_VENDORS display labels don't match the backend's SERVICE_TYPES enum exactly
// (the backend already has an equivalent under a different string). Translate only at
// the POST/PATCH boundary — never rename ALL_VENDORS itself, since these exact strings
// are used as lookup keys in ~30 places across this file (getVendorTips, getVendorPackages,
// getRecommended, buildItinerary, notesKeywords, etc.).
const SERVICE_TYPE_BACKEND_MAP = { "Live Band":"Band", "Emcee / Host":"Emcee/Host", "Cake Artist":"Cake" };
const toBackendServiceType = v => SERVICE_TYPE_BACKEND_MAP[v] || v;

// Presentational copy + images for the Services step's card picker (spec section 4).
// Purely cosmetic — keyed by the exact ALL_VENDORS strings, never renamed/translated.
const SERVICE_CARD_INFO = {
  "Decorator":      { emoji:"🎊", props:["🎈","✨","🌸"], description:"Backdrops, balloons, florals and lighting that set the scene." },
  "Caterer":        { emoji:"🍽️", props:["🍲","🥂","🍰"], description:"Buffets, live counters and multi-cuisine menus for your guest count." },
  "DJ":             { emoji:"🎧", props:["🎵","💿","🔊"], description:"Music, mixing and dance-floor energy for the whole event." },
  "Photographer":   { emoji:"📷", props:["📸","✨","🖼️"], description:"Candid and traditional coverage to capture every moment." },
  "Videographer":   { emoji:"🎥", props:["🎬","📽️","✨"], description:"Cinematic highlight reels and full-event video coverage." },
  "Florist":        { emoji:"💐", props:["🌸","🌷","🍃"], description:"Fresh floral arrangements for stages, tables and entryways." },
  "Entertainer":    { emoji:"🎭", props:["🎪","🎶","✨"], description:"Dancers, performers and acts that keep guests engaged." },
  "Photo Booth":    { emoji:"📸", props:["🎉","🕶️","🖼️"], description:"Props, backdrops and instant prints guests love." },
  "Live Band":      { emoji:"🎸", props:["🎷","🥁","🎶"], description:"Live musicians for a warmer, more personal soundtrack." },
  "Emcee / Host":   { emoji:"🎤", props:["🎙️","✨","🗣️"], description:"A confident host to keep the event flowing smoothly." },
  "Lighting Setup": { emoji:"💡", props:["✨","🕯️","🌟"], description:"Ambient and stage lighting that transforms any venue." },
  "Sound System":   { emoji:"🔊", props:["🎚️","🎵","📢"], description:"Clear, powerful audio for speeches, music and announcements." },
  "Makeup Artist":  { emoji:"💄", props:["💅","✨","🪞"], description:"Professional makeup and styling for you and your guests." },
  "Balloon Artist": { emoji:"🎈", props:["🎊","🎀","✨"], description:"Balloon decor, arches and sculptures for a festive look." },
  "Cake Artist":    { emoji:"🎂", props:["🍰","🍫","✨"], description:"Custom cakes and desserts designed around your theme." },
  "AV Setup":       { emoji:"📽️", props:["🖥️","🔌","✨"], description:"Screens, projectors and AV support for presentations or visuals." },
};

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
  { key:"stalls",     label:"Stalls",         icon:"🛒",  singular:"Stall" },
  { key:"shows",      label:"Special Shows",  icon:"✨",  singular:"Show" },
  { key:"games",      label:"Fun Activities", icon:"🎉",  singular:"Activity" },
];

// Merge anchors, bands, performers into games so they show under Fun Activities
(function mergeIntoGames() {
  const extra = [
    ...ALL_ACTIVITIES.anchors,
    ...ALL_ACTIVITIES.bands,
    ...ALL_ACTIVITIES.performers,
  ];
  ALL_ACTIVITIES.games = [...extra, ...ALL_ACTIVITIES.games];
})();

const ALL_ACTIVITY_ITEMS = Object.values(ALL_ACTIVITIES).flat();

/* ── score + filter activities for this occasion ── */
function getActivitySuggestions(occasion, {ageGroups=[], theme=null}) {
  const id  = occasion?.id||"";
  const hasKids   = (ageGroups||[]).includes("Kids")||(ageGroups||[]).includes("Toddlers");
  const hasSeniors= (ageGroups||[]).includes("Seniors");
  const mixedAge  = hasKids && hasSeniors;
  const tags = (theme?.tags||[]).join(" ").toLowerCase();
  const result = {};
  for(const {key} of ACTIVITY_TYPES) {
    const scored = (ALL_ACTIVITIES[key]||[]).map(a => {
      let score = 0;
      if(a.occasions.includes(id)) score += 4;
      if(hasKids && a.tags.includes("kids")) score += 2;
      if(!hasKids && a.tags.includes("kids") && !a.tags.some(t=>["all","food","adult","craft"].includes(t))) score -= 2;
      if(hasSeniors && a.tags.includes("adult")) score += 1;
      // Mixed age conflict: penalise loud acts, boost quiet/visual ones
      if(mixedAge && (a.id==="DJ"||a.id.startsWith("band-")||a.id==="laser-show"||a.id==="fire-led")) score -= 3;
      if(mixedAge && (a.id==="diy-photo-booth"||a.id==="craft-station"||a.id==="balloon-artist"||a.id==="face-painting"||a.id==="tambola")) score += 2;
      if(tags.includes("bollywood") && (a.id==="bollywood-dancer"||a.id==="antakshari"||a.id==="band-bollywood")) score += 2;
      if(tags.includes("neon") && (a.id==="laser-show"||a.id==="fire-led"||a.id==="projection-mapping")) score += 2;
      if(tags.includes("sufi")||tags.includes("ghazal")) { if(a.id==="band-sufi") score += 3; }
      if(id==="office-party" && a.id==="anchor-corporate") score += 3;
      if((id==="baby-shower"||id==="first-birthday") && a.id==="anchor-kids") score += 3;
      return {...a, score};
    }).filter(a=>a.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
    result[key] = scored;
  }
  return result;
}

/* ── event itinerary builder ── */
// "6:30 PM" -> minutes since midnight, for shifting the itinerary below.
function parseClockTime(str) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((str||"").trim());
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h*60 + Number(m[2]);
}
function formatClockTime(mins) {
  const norm = ((mins % 1440) + 1440) % 1440;
  let h = Math.floor(norm/60), mm = norm%60;
  const ampm = h>=12 ? "PM" : "AM";
  h = h % 12; if (h===0) h = 12;
  return `${h}:${String(mm).padStart(2,"0")} ${ampm}`;
}
// Half-hour presets from 7 AM to 11:30 PM — a dropdown of real values instead of a free-text
// time, since all that's needed is an approximate start, not a minute-exact one.
const EVENT_START_TIME_OPTIONS = Array.from({length:34},(_,i)=>formatClockTime(7*60+i*30));

function buildItinerary(occasion, {guests=20, vendors=[], selectedActivities=[], venueType="", ageGroups=[], startTime=""}) {
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

  const visible = slots.filter(s=>s.type!=="setup");

  // Shift every slot by the gap between the customer's real approx. start time and the
  // template's assumed one, so "Guests Arrive" lands on the time they actually gave us
  // (collected as a required field in step 1) instead of a generic placeholder hour.
  const wantedStart = parseClockTime(startTime);
  const templateStart = visible.length ? parseClockTime(visible[0].time) : null;
  if (wantedStart!=null && templateStart!=null && wantedStart!==templateStart) {
    const delta = wantedStart - templateStart;
    return visible.map(s=>({...s, time: formatClockTime(parseClockTime(s.time)+delta)}));
  }
  return visible;
}

// Old DECOR_CATEGORIES names → closest new focus-area id, so an in-progress
// localStorage draft saved before this redesign doesn't lose its decor picks.
const LEGACY_DECOR_CATEGORY_MAP = {
  "Backdrop & Wall":"stage-backdrop", "Balloons":"hall-space", "Flowers":"table-seating",
  "Lighting":"lighting", "Table & Seating":"table-seating", "Entry & Walkway":"entrance",
  "Photo Corner":"photo-booth", "Theme Items":"personalised",
};
function migrateDecorAreaKeys(customDecorObj){
  if(!customDecorObj) return customDecorObj;
  const out={};
  Object.entries(customDecorObj).forEach(([key,items])=>{
    const newKey = DECOR_FOCUS_AREAS[key] ? key : (LEGACY_DECOR_CATEGORY_MAP[key]||key);
    out[newKey]=[...new Set([...(out[newKey]||[]),...items])];
  });
  return out;
}

/* ── Suggest 3 of the 8 focus areas based on occasion/venue/guest count,
   optionally biased by areas matched from an analysed venue photo ── */
function getSuggestedDecorFocusAreas(occasion, {venueType="", guests=20, matchedAreas=[]}={}) {
  const id=occasion?.id||"";
  const venue=venueType.toLowerCase();
  const outdoor=venue.includes("garden")||venue.includes("outdoor")||venue.includes("farmhouse")||venue.includes("rooftop")||venue.includes("terrace");
  const large=Number(guests)>=100;
  let picks;
  if(id==="birthday-party"||id==="first-birthday") picks=["stage-backdrop","personalised","photo-booth"];
  else if(["baby-shower","newborn-welcome","gender-reveal","naming-ceremony"].includes(id)) picks=["stage-backdrop","table-seating","personalised"];
  else if(id==="anniversary") picks=["stage-backdrop","ceiling-draping","table-seating"];
  else if(id==="office-party") picks=["entrance","lighting","stage-backdrop"];
  else if(id==="housewarming"||id==="get-together") picks=["entrance","table-seating","lighting"];
  else picks=["stage-backdrop","entrance","lighting"];
  if(outdoor&&!picks.includes("lighting")) picks=[picks[0],picks[1],"lighting"];
  if(large&&!picks.includes("hall-space")) picks=[picks[0],picks[1],"hall-space"];
  if(matchedAreas.length){
    return [...new Set([...matchedAreas,...picks])].slice(0,3);
  }
  return picks.slice(0,3);
}

/* ── Suggested food quick-picks per occasion ── */
const SUGGESTED_FOOD = {
  default:          ["Mini sandwiches","Pasta","Fruit platter","Cupcakes","Cookies","Mocktails","Juices","Tea & coffee","Fries","Brownies"],
  "birthday-party": ["Mini burgers","Pizza bites","Pasta","Fruit cups","Cupcakes","Cookies","Mocktails","Fries","Brownie bites","Popcorn"],
  "first-birthday": ["Mini sandwiches","Fruit cups","Cupcakes","Cookies","Juices","Fries","Mini pizza","Cake pops","Milkshakes","Veggie sticks"],
  "baby-shower":    ["Mini sandwiches","Fruit cups","Mocktails","Juices","Tea & coffee","Cupcakes","Cookies","Pastries","Brownie bites","Fruit platter"],
  "anniversary":    ["Welcome mocktail","Soup","Pasta","Grilled items","Salad","Dessert platter","Cake slices","Tea & coffee","Bread rolls","Fruit platter"],
  "housewarming":   ["Puri sabzi","Halwa","Mithai","Chaat","Tea & coffee","Fruit platter","Juices","Lassi","Samosa","Cookies"],
  "get-together":   ["Chaat counter","Mini sliders","Pasta","Mocktails","Fruit cups","Cookies","Fries","Tea & coffee","Brownie bites","Popcorn"],
  "naming-ceremony":["Puri sabzi","Halwa","Mithai","Kheer","Tea & coffee","Fruit platter","Juices","Lassi","Sweets box","Prasad"],
  "office-party":   ["Sandwiches","Wraps","Salad bar","Mocktail bar","Tea & coffee","Mini desserts","Cookies","Fries","Pasta","Fruit platter"],
};

// One menu touch per theme mood, layered onto the mid-tier catering option so the
// theme shows up in what's actually served, not just how the page looks.
function themedCateringTouch(tags) {
  if(tags.includes("bollywood")||tags.includes("indian")||tags.includes("desi")) return "Live chaat / pani puri counter with regional specialties";
  if(tags.includes("pastel")||tags.includes("floral")) return "High-tea styling with floral-themed mini desserts";
  if(tags.includes("neon")||tags.includes("glow")||tags.includes("disco")) return "Late-night snack bar with a neon-lit dessert station";
  if(tags.includes("gold")||tags.includes("elegant")||tags.includes("glam")) return "Plated fine-dining presentation with premium garnish";
  if(tags.includes("jungle")||tags.includes("safari")||tags.includes("nature")||tags.includes("green")) return "Live BBQ / grill station with rustic plating";
  if(tags.includes("minimal")||tags.includes("white")||tags.includes("modern")) return "Clean, minimalist plated service";
  if(tags.includes("royal")||tags.includes("mughal")) return "Mughlai specialty counter with a royal thali presentation";
  if(tags.includes("corporate")||tags.includes("professional")) return "Branded napkins and professional plated service";
  if(tags.includes("colourful")||tags.includes("rainbow")) return "Candy-colour dessert bar with rainbow treats";
  return null;
}

/* ── 3 personalised catering style options ── */
function getCateringOptions(occasion, {guests=20, venueType="", ageGroups=[], budget=0, theme=null}) {
  const id     = occasion?.id||"";
  const venue  = venueType.toLowerCase();
  const ages   = ageGroups;
  const b      = Number(budget)||0;
  const hasKids= ages.includes("Kids")||ages.includes("Toddlers");
  const isBig  = guests>50;
  const isFormal= venue.includes("banquet")||venue.includes("hall");
  const isOutdoor= venue.includes("garden")||venue.includes("outdoor")||venue.includes("rooftop")||venue.includes("farmhouse");
  const tags   = (theme?.tags||[]).join(" ").toLowerCase();
  const themeTouch = themedCateringTouch(tags);
  const withTouch = (dishes) => themeTouch ? [...dishes, themeTouch] : dishes;
  /* occasion-specific overrides */
  const isOffice    = id==="office-party";
  const isAnniv     = id==="anniversary";
  const isBabyEvent = id==="baby-shower"||id==="newborn-welcome"||id==="gender-reveal"||id==="naming-ceremony"||id==="first-birthday";
  const isHouse     = id==="housewarming";

  if(isOffice) return [
    { style:"Corporate Buffet", tagline:"Professional, clean — works for all teams", tier:"Budget-friendly", icon:"🍽️", dishes:["Sandwiches & wraps station","Salad bar","1 veg + 1 non-veg main","Dal + rice","Dessert corner"] },
    { style:"Buffet + Live Counters", tagline:"Popular for office dos — interactive and fun", tier:"Mid-range", icon:"🧑‍🍳", popular:true, dishes:withTouch(["Waiter-served starters","Live pasta / pizza counter","2 mains","Mocktail bar","Dessert table"]) },
    { style:"Full Service Dinner", tagline:"Awards night or annual party — premium feel", tier:"Premium", icon:"✨", dishes:["Welcome drink + starters","Plated main course","Live dessert station","Custom menu cards","Dedicated service staff"] },
  ];

  if(isAnniv) return [
    { style:"Intimate Dinner Setup", tagline:"Romantic plating, courses served at the table", tier:"Budget-friendly", icon:"🍽️", dishes:["Welcome champagne mocktail","Soup + salad","Plated main with 2 sides","Candle-lit dessert presentation"] },
    { style:"Buffet + Live Counter", tagline:"Great for a larger anniversary with family & friends", tier:"Mid-range", icon:"🧑‍🍳", popular:true, dishes:withTouch(["Starter round by waiter","3 mains + live pasta/chaat counter","Salad bar","Dessert table with couple's cake"]) },
    { style:"Full Waiter Service", tagline:"Formal, sophisticated — a true celebration dinner", tier:"Premium", icon:"✨", dishes:["Multi-course plated meal","4+ mains with accompaniments","Custom anniversary cake served","Personalised menu cards"] },
  ];

  if(isBabyEvent) return [
    { style:"Light Snacks & High Tea", tagline:"Ideal for daytime baby events — easy, elegant", tier:"Budget-friendly", icon:"☕", dishes:["Sandwiches & wraps","Mini pastries & biscuits","Juice / mocktail bar","Fruit platter","Cake station"] },
    { style:"Buffet with Kids Corner", tagline:"Feeds all ages — most popular for baby events", tier:"Mid-range", icon:"🍽️", popular:true, dishes:withTouch(["1 veg + 1 non-veg main","Dal + rice + roti","Kids corner: mini pizza & fries","Dessert table","Juice station (no aerated drinks)"]) },
    { style:"Finger Food & Live Counters", tagline:"Fun and casual — great if guests will be standing", tier:"Mid-range", icon:"🧆", dishes:["Live chaat counter","Mini sandwiches & sliders","Healthy fruit skewers","Cake + dessert table","Mocktails"] },
  ];

  if(isHouse) return [
    { style:"Traditional Thali", tagline:"Warm, homely, auspicious — perfect for housewarming", tier:"Budget-friendly", icon:"🍛", dishes:["Puja prasad (halwa/puri)","Full North/South Indian thali","Dal + rice + roti","Sweet mithai plate","Aam panna / chaas"] },
    { style:"Buffet with Live Starters", tagline:"Traditional + a touch of fun — crowd pleaser", tier:"Mid-range", icon:"🧑‍🍳", popular:true, dishes:withTouch(["Live chaat / samosa counter","Thali-style mains","Dessert platter","Fresh juices + mocktails"]) },
    { style:"Full Buffet & Service", tagline:"If you want to go all out for the housewarming", tier:"Premium", icon:"✨", dishes:["Welcome sherbet + starters","4 mains + dal + rice + breads","Live dessert counter","Service staff throughout"] },
  ];

  /* default (birthday-party, get-together, etc.) */
  return [
    {
      style: isOutdoor ? "Finger Food & Live Counters" : "Simple Buffet",
      tagline: isOutdoor ? "Great for outdoor, casual events" : "Self-serve, easy for any size",
      tier:"Budget-friendly",
      icon:"🍽️",
      dishes: isOutdoor
        ? ["Live chaat counter","Mini sandwiches & sliders","Grilled section",hasKids?"Kids snack corner":"Mocktail bar"]
        : ["2 mains (veg + non-veg)","Dal + rice + roti","Starters section",hasKids?"Kids corner":"Basic dessert"],
    },
    {
      style: (isFormal||isBig) ? "Buffet + Waiter Service" : "Buffet + Live Counter",
      tagline: (isFormal||isBig) ? "Most popular for halls & big events" : "Fun, interactive — guests love it",
      tier:"Mid-range", icon:"🧑‍🍳", popular:true,
      dishes: withTouch((isFormal||isBig)
        ? ["Waiter-served starters","3 mains + live counter",hasKids?"Kids corner":"Salad bar","Dessert table"]
        : ["Live chaat / pav bhaji counter","2–3 mains",hasKids?"Kids corner":"Salad bar","Dessert station"]),
    },
    {
      style:"Full Waiter Service",
      tagline:"Elegant, course-by-course dining",
      tier:"Premium",
      icon:"✨",
      dishes:["Welcome drink + amuse-bouche","Plated starters","4+ mains with sides","Curated dessert table","Custom menu cards"],
    },
  ];
}

// One decor item per theme mood, layered onto the mid-tier decor option of every
// occasion branch below — mirrors themedCateringTouch's role for catering.
function themedDecorTouch(tags) {
  if(tags.includes("pastel")||tags.includes("floral")) return "Fresh floral centrepieces in soft pastel tones";
  if(tags.includes("neon")||tags.includes("glow")||tags.includes("disco")) return "Neon sign with the celebrant's name/age";
  if(tags.includes("bollywood")||tags.includes("indian")||tags.includes("desi")) return "Marigold garlands and colourful dupatta draping";
  if(tags.includes("gold")||tags.includes("elegant")||tags.includes("glam")) return "Gold balloon arch with warm uplighting";
  if(tags.includes("jungle")||tags.includes("safari")||tags.includes("nature")||tags.includes("green")) return "Tropical leaf backdrop with terracotta pot accents";
  if(tags.includes("minimal")||tags.includes("white")||tags.includes("modern")) return "White balloon wall with geometric frames";
  if(tags.includes("royal")||tags.includes("mughal")) return "Regal drapery with chandelier-style lighting";
  if(tags.includes("colourful")||tags.includes("rainbow")) return "Rainbow balloon garland with cloud cutouts";
  return null;
}

/* ── 3 personalised decorator style options (occasion-aware) ── */
function getDecorOptions(occasion, {guests=20, venueType="", theme=null, ageGroups=[]}) {
  const id     = occasion?.id||"";
  const venue  = venueType.toLowerCase();
  const tags   = (theme?.tags||[]).join(" ").toLowerCase();
  const decorTouch = themedDecorTouch(tags);
  const withDecorTouch = (items) => decorTouch ? [...items, decorTouch] : items;
  const outdoor= venue.includes("garden")||venue.includes("outdoor")||venue.includes("farmhouse")||venue.includes("rooftop");
  const hasKids= (ageGroups||[]).includes("Kids")||(ageGroups||[]).includes("Toddlers");
  const isBaby = ["baby-shower","newborn-welcome","first-birthday","naming-ceremony","gender-reveal"].includes(id);
  const isAnniv= id==="anniversary";
  const isOffice=id==="office-party";
  const isHouse= id==="housewarming";

  if(isBaby) return [
    { style:"Soft & Sweet",       tagline:"Pastel setup — gentle, airy, baby-perfect",       tier:"Budget-friendly", icon:"🍼", items:["Pastel balloon clusters at entry","Soft backdrop with baby motifs","Table centrepieces","Cradle / highchair decor"] },
    { style:"Full Baby Setup",    tagline:"Full venue coverage — most popular for baby events",tier:"Mid-range",      icon:"🎀",popular:true, items:withDecorTouch(["Balloon arch at entry","Themed backdrop + name board","All table décor",id==="gender-reveal"?"Pink & Blue reveal corner":"Dedicated cake/gift table area"]) },
    { style:"Premium Baby Event", tagline:"Every corner styled, photo-ready throughout",      tier:"Premium",         icon:"✨", items:["Custom floral installation","Balloon ceiling or canopy","Personalised name / age banner","Photo corner with full props","Cake table centrepiece"] },
  ];
  if(isAnniv) return [
    { style:"Romantic Essentials",tagline:"Intimate candle-lit setup — couple-focused",       tier:"Budget-friendly", icon:"🕯️",items:["Fairy light backdrop","Rose & candle centrepieces","Couple photo timeline wall","Welcome garland at entry"] },
    { style:"Full Celebration",   tagline:"Guests + couple — full venue dressed beautifully", tier:"Mid-range",       icon:"💍",popular:true,items:withDecorTouch(["Floral arch at entry","Backdrop + couple photos","All table décor (candles + flowers)",outdoor?"String lights overhead":"Balloon ceiling or draping"]) },
    { style:"Grand Anniversary",  tagline:"Golden or silver jubilee — nothing held back",     tier:"Premium",         icon:"👑", items:["Floral wall or floral arch installation","Custom milestone backdrop (25/50 years)","Lighting setup included","Photo corner + memory wall","Floating candles or lantern arrangement"] },
  ];
  if(isOffice) return [
    { style:"Corporate Clean",    tagline:"Professional branded setup — minimal & sharp",     tier:"Budget-friendly", icon:"🏢", items:["Company branding backdrop","Branded table signage","Clean floral centrepieces","Award / recognition display area"] },
    { style:"Corporate Festive",  tagline:"Professional + a warm festive feel",               tier:"Mid-range",       icon:"🎊",popular:true,items:withDecorTouch(["Branded backdrop + balloon columns","Themed table décor","Recognition board / award wall","Photo corner with company branding"]) },
    { style:"Premium Office Event",tagline:"Awards night or big team party — full setup",     tier:"Premium",         icon:"✨", items:["Full venue branding","Stage décor for awards ceremony","LED lighting + ambience","Photo wall + step & repeat backdrop","Custom table naming"] },
  ];
  if(isHouse) return [
    { style:"Auspicious & Warm",  tagline:"Traditional feel — flowers, diyas, warm tones",   tier:"Budget-friendly", icon:"🪔", items:["Marigold garlands at entry","Diya clusters on tables","Traditional flower centrepieces","Welcome rangoli at door"] },
    { style:"Full House Décor",   tagline:"Entire home / venue dressed — most popular",       tier:"Mid-range",       icon:"🏠",popular:true,items:withDecorTouch(["Flower arch at main entrance","Table centrepieces for all areas","Living room focal point (arch or wall)",outdoor?"String lights in garden":"Fairy light interior setup"]) },
    { style:"Grand Housewarming", tagline:"Statement event — every room styled",              tier:"Premium",         icon:"✨", items:["Full venue transformation","Outdoor lighting setup","Custom welcome board","Flower wall installation","Puja area decorated separately"] },
  ];
  return [
    { style:"Simple & Sweet",   tagline:"Looks great, stays within budget", tier:"Budget-friendly", icon:"🎈", items:["Balloon clusters at entry","Simple backdrop wall","Table centrepieces",tags.includes("floral")?"Floral accents":"Colour-matched props"] },
    { style:"Full Venue Setup", tagline:"Covers the whole venue — most popular", tier:"Mid-range",    icon:"🎨",popular:true,items:[outdoor?"String lights overhead":"Balloon ceiling","Themed backdrop + arch","All table décor",hasKids?"Character balloons & props":tags.includes("floral")?"Fresh floral centrepieces":"Premium centrepieces"] },
    { style:"Showstopper",      tagline:"Every corner transformed, fully custom", tier:"Premium",     icon:"👑", items:[tags.includes("neon")?"Custom neon sign":tags.includes("floral")?"Floor-to-ceiling floral wall":"Full venue transformation","Themed entry arch","Custom backdrop + photo corner","Lighting setup included"] },
  ];
}

// Turns a decor option's item list into one plain-English paragraph, personalised
// with what's actually been filled in so far (occasion, guest count, venue).
// Combines the occasion-style package's base items with the full item list of
// every focus area the customer picked, so "What's included" genuinely reflects
// what they selected (not just a generic occasion template).
function buildDecorDisplayItems(opt, decorFocusAreas=[]) {
  const base = opt.items || [];
  const fromAreas = decorFocusAreas.flatMap(id => DECOR_FOCUS_AREAS[id]?.items || []);
  return [...new Set([...base, ...fromAreas])];
}

/* ── generic paragraph for any category's package tier (used by every category
   that isn't Decorator/Caterer, which have their own richer paragraph builders) ── */
// Plain, simple sentences — written the way you'd explain this to someone who
// has never planned an event before, not formal/technical phrasing.
function buildGenericPackageParagraph(type, pkg, {occasionName="your event", guests=20, venueType=""}={}) {
  const venueClause = venueType ? ` at your ${venueType.toLowerCase()}` : "";
  return `This is the ${pkg.label} option for ${type} at your ${guests}-guest ${occasionName}${venueClause}. ${pkg.note||""}. You can see exactly what's included below.`;
}

function buildCateringParagraph(opt, {occasionName="your event", guests=20, venueType=""}={}) {
  const venueClause = venueType ? ` at your ${venueType.toLowerCase()}` : "";
  const tierPlain = opt.tier==="Premium" ? "the most expensive, full option" : opt.tier==="Mid-range" ? "a mid-priced, balanced option" : "the simplest, lowest-cost option";
  return `This is the ${opt.style} menu for your ${guests}-guest ${occasionName}${venueClause}. ${opt.tagline}. It's ${tierPlain} — the dishes you'll get are listed below.`;
}

/* ── lightweight client-side photo resize — same approach as DecorAnalyzer.jsx's
   resizeImage(), duplicated here since this is a plain, non-AI upload gate (not
   worth coupling to that component's export surface for one small helper). ── */
function resizeVenuePhoto(file, maxPx=1200) {
  return new Promise((resolve)=>{
    const img=new Image();
    const url=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(url);
      const scale=Math.min(1,maxPx/Math.max(img.width,img.height));
      const w=Math.round(img.width*scale), h=Math.round(img.height*scale);
      const canvas=document.createElement("canvas");
      canvas.width=w; canvas.height=h;
      canvas.getContext("2d").drawImage(img,0,0,w,h);
      resolve(canvas.toDataURL("image/jpeg",0.82));
    };
    img.src=url;
  });
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
// Blends a hex color toward white by `amt` (0-1) — used to derive a "light" companion
// shade for theme-driven gradients, mirroring the brand's gold/goldLt pairing.
function lightenHex(hex, amt=0.3) {
  const h = hex.replace("#","");
  const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
  const mix = (c) => Math.round(c + (255-c)*amt).toString(16).padStart(2,"0");
  return `#${mix(r)}${mix(g)}${mix(b)}`;
}
// Returns "r,g,b" for use inside an rgba(...) string.
function hexToRgb(hex) {
  const h = hex.replace("#","");
  return `${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)}`;
}

function themeColor(tags=[]) {
  const t=tags.join(" ").toLowerCase();
  if(t.includes("pastel")||t.includes("floral")||t.includes("pink")||t.includes("blush")||t.includes("instagram")) return "#FFB6C1";
  if(t.includes("neon")||t.includes("glow")||t.includes("disco")) return "#A855F7";
  if(t.includes("green")||t.includes("nature")||t.includes("garden")||t.includes("jungle")||t.includes("casual")) return "#4D8C6F";
  if(t.includes("navy")||t.includes("stars")) return "#2D3A8C";
  if(t.includes("bollywood")||t.includes("indian")||t.includes("desi")||t.includes("ethnic")||t.includes("saree")) return "#FF6B35";
  if(t.includes("red")||t.includes("red-carpet")||t.includes("romantic")) return "#C0392B";
  if(t.includes("royal")||t.includes("mughal")||t.includes("palace")) return "#6B3FA0";
  if(t.includes("gold")||t.includes("elegant")||t.includes("glam")||t.includes("luxe")||t.includes("golden-jubilee")) return "#D4A848";
  if(t.includes("corporate")||t.includes("professional")||t.includes("office")) return "#4A6FA5";
  if(t.includes("travel")||t.includes("destination")||t.includes("world")||t.includes("freedom")) return "#2A9D8F";
  if(t.includes("rooftop")||t.includes("outdoor")||t.includes("water")||t.includes("pool")||t.includes("spa")) return "#5FA8D3";
  if(t.includes("yellow")||t.includes("bee")||t.includes("bright")||t.includes("optimistic")) return "#E8B339";
  if(t.includes("casino")||t.includes("dark")||t.includes("gothic")) return "#3A3A3A";
  if(t.includes("silver")) return "#9CA3AF";
  if(t.includes("minimal")||t.includes("white")||t.includes("modern")||t.includes("classic")) return "#A09080";
  if(t.includes("colourful")||t.includes("rainbow")||t.includes("confetti")||t.includes("lego")) return "#E54B8A";
  return BRAND_GOLD;
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

// A handful of related motifs per theme family — used to scatter a few different icons as
// ambient background decoration, instead of repeating the single themeEmoji() pick everywhere.
function themeProps(tags=[]) {
  const t=tags.join(" ").toLowerCase();
  if(t.includes("bollywood")||t.includes("indian")||t.includes("dance")) return ["💃","🎵","🪔","✨"];
  if(t.includes("neon")||t.includes("glow")||t.includes("rave")) return ["🌈","💿","⚡","🎉"];
  if(t.includes("floral")||t.includes("garden")||t.includes("flower")) return ["🌸","🌷","🌺","🍃"];
  if(t.includes("pastel")||t.includes("pink")||t.includes("baby")) return ["🩷","🎀","🧸","⭐"];
  if(t.includes("gold")||t.includes("glam")||t.includes("royal")) return ["👑","✨","🎊","🥂"];
  if(t.includes("elegant")||t.includes("luxury")||t.includes("red-carpet")) return ["✨","🥂","🎩","💎"];
  if(t.includes("jungle")||t.includes("safari")||t.includes("animal")) return ["🦁","🐾","🌿","🦋"];
  if(t.includes("nature")||t.includes("green")||t.includes("earth")) return ["🌿","🍃","🌳","🦋"];
  if(t.includes("stars")||t.includes("dreamy")||t.includes("navy")||t.includes("night")) return ["⭐","🌙","✨","🪐"];
  if(t.includes("minimal")||t.includes("modern")||t.includes("white")||t.includes("clean")) return ["🤍","◻️","✨"];
  if(t.includes("red")||t.includes("romantic")||t.includes("valentine")) return ["🌹","💕","🕯️","✨"];
  if(t.includes("brown")||t.includes("bear")||t.includes("cute")||t.includes("teddy")) return ["🧸","🎈","🍼","⭐"];
  if(t.includes("clouds")||t.includes("sky")||t.includes("blue")) return ["☁️","⭐","🎈","🩵"];
  if(t.includes("entrance")||t.includes("arch")) return ["🌺","🎈","✨"];
  if(t.includes("personal")||t.includes("footprint")) return ["💝","🎈","✨"];
  if(t.includes("sufi")||t.includes("ghazal")||t.includes("classical")) return ["🎵","🕯️","✨"];
  if(t.includes("retro")||t.includes("vintage")) return ["📷","🎞️","✨"];
  if(t.includes("dark")||t.includes("black")||t.includes("gothic")) return ["🖤","🕯️","✨"];
  if(t.includes("corporate")||t.includes("professional")||t.includes("office")) return ["🎉","🎊","⭐"];
  if(t.includes("colourful")||t.includes("rainbow")||t.includes("confetti")||t.includes("lego")) return ["🎊","🎉","🌈","⭐"];
  return ["🎈","🎉","✨"];
}

// Picks a representative emoji for a gift-idea card from its name/description, instead of
// always showing a generic 🎁 — used wherever a stock photo used to stand in for the gift.
function giftEmoji(name="", desc=""){
  const t=(name+" "+desc).toLowerCase();
  if(t.includes("hamper")||t.includes("basket")) return "🧺";
  if(t.includes("photo")||t.includes("frame")||t.includes("album")) return "🖼️";
  if(t.includes("candle")) return "🕯️";
  if(t.includes("flower")||t.includes("floral")||t.includes("bouquet")) return "💐";
  if(t.includes("cake")||t.includes("dessert")||t.includes("sweet")||t.includes("chocolate")) return "🍰";
  if(t.includes("jewel")||t.includes("necklace")||t.includes("bracelet")||t.includes("ring")) return "💍";
  if(t.includes("book")||t.includes("journal")||t.includes("card")) return "📔";
  if(t.includes("spa")||t.includes("pamper")||t.includes("mask")||t.includes("skincare")) return "🧖";
  if(t.includes("tech")||t.includes("gadget")||t.includes("speaker")||t.includes("earphone")) return "🎧";
  if(t.includes("blanket")||t.includes("swaddle")||t.includes("clothing")||t.includes("outfit")) return "🧸";
  if(t.includes("toy")||t.includes("game")) return "🧩";
  if(t.includes("makeup")||t.includes("cosmetic")||t.includes("beauty")) return "💄";
  if(t.includes("plant")||t.includes("succulent")) return "🪴";
  if(t.includes("tea")||t.includes("coffee")) return "☕";
  if(t.includes("box")||t.includes("kit")||t.includes("set")) return "📦";
  return "🎁";
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
    if(t.includes("gold")||t.includes("elegant")||t.includes("glam")) { recs.add("Lighting Setup"); recs.add("Makeup Artist"); }
    if(t.includes("photo")||t.includes("memories")||t.includes("red-carpet")) recs.add("Photo Booth");
    if(t.includes("corporate")||t.includes("professional")||t.includes("modern")||t.includes("minimal")) {
      recs.add("AV Setup"); recs.add("Photo Booth");
    }
    // Baby-shower-specific theme tags
    if(t.includes("pastel")||t.includes("nursery")||t.includes("baby")||t.includes("pink")) {
      recs.add("Florist"); recs.add("Cake Artist");
    }
    if(t.includes("jungle")||t.includes("safari")||t.includes("animal")) {
      recs.add("Florist"); recs.add("Entertainer");
    }
    if(t.includes("teddy")||t.includes("bear")||t.includes("plush")||t.includes("cute")) {
      recs.add("Balloon Artist"); recs.add("Cake Artist");
    }
    if(t.includes("stars")||t.includes("twinkle")||t.includes("sky")||t.includes("dreamy")) {
      recs.add("Lighting Setup");
    }
    if(t.includes("royal")) {
      recs.add("Makeup Artist"); recs.add("Lighting Setup");
    }
  }
  if(occasion.id==="office-party") { recs.add("AV Setup"); recs.add("Emcee / Host"); }
  if(venue.includes("garden")||venue.includes("outdoor")||venue.includes("farmhouse")||venue.includes("rooftop")) {
    recs.add("Lighting Setup");
  }
  if(venue.includes("banquet")||venue.includes("hall")) {
    recs.add("Sound System");
  }
  // Age group conflict: Kids + Seniors together → quiet activities, no DJ
  const hasKids  = ageGroups.includes("Kids")||ageGroups.includes("Toddlers");
  const hasTeen  = ageGroups.includes("Teens");
  const hasSenior= ageGroups.includes("Seniors");
  if(hasKids && hasSenior) {
    // Mixed age: boost visual/craft activities, skip loud entertainment
    recs.add("Photo Booth"); recs.add("Balloon Artist");
  } else if(hasKids) {
    recs.add("Entertainer"); recs.add("Balloon Artist");
  }
  if(hasTeen && !hasSenior) { recs.add("DJ"); recs.add("Photo Booth"); }
  if(hasSenior && !hasKids) { recs.add("Live Band"); }
  // Always ensure at least some items in the "recommended" tier (middle tier)
  // so there are never fewer than 3 tiers in the services step
  const essential=occasion.vendorCategories||[];
  if(!recs.has("Photographer")&&!essential.includes("Photographer")) recs.add("Photographer");
  if(occasion.id!=="office-party"&&!recs.has("Cake Artist")&&!essential.includes("Cake Artist")) recs.add("Cake Artist");
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
    return {
      heading:"Ask your decorator for",
      items:[...new Set(items)].slice(0,7),
      tip: venueType
        ? `Décor typically takes the largest share of your budget. Tell them it's a ${venueType} — setup time and equipment change significantly.`
        : "Décor typically takes the largest share of your budget. Share reference photos and venue size before finalising.",
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
    const cateringTouch = themedCateringTouch(tags);
    if(cateringTouch) menu.push(cateringTouch);
    if(ages.includes("Kids")||ages.includes("Toddlers")) {
      menu.push("Kids corner: mini pizza + pasta + fries","Juice station (no aerated drinks)");
    }
    if(ages.includes("Teens")) menu.push("Live pizza/pasta counter","Mocktail bar");
    if(ages.includes("Seniors")) menu.push("Soft/easy options + low-spice section");
    return {
      heading:"Menu to plan with caterer",
      items:[...new Set(menu)].slice(0,8),
      tip:"Catering is usually the biggest cost in any event. Share your service style, guest count, veg/non-veg split and venue upfront — they'll size everything correctly.",
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
      items:["Buffet + waiter service","2–3 main options","Live starters counter","Salad bar & dessert station",hasKids?"Kids corner (mini pizza, fries)":(themedCateringTouch(tags)||"Custom beverage station")],
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
      items:["4-hour set","DJ + LED light effects",tags.includes("bollywood")||tags.includes("indian")?"Bollywood & regional playlist":tags.includes("neon")||tags.includes("glow")?"EDM / dance-floor playlist":tags.includes("gold")||tags.includes("elegant")?"Lounge + dinner playlist":"Custom playlist coordination","Mic for announcements"],
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
      items: theme ? ["5-hour coverage","400+ edited photos","Candid + group shots",`Shots styled around your "${theme.name}" look`] : ["5-hour coverage","400+ edited photos","Candid + group shots","Delivery in 5 days"],
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
      items: theme ? ["5-hour coverage","Full event + highlight reel",`Reel edited to match your "${theme.name}" mood`,"Delivery in 7 days"] : ["5-hour coverage","Full event + highlight reel","Licensed background music","Delivery in 7 days"],
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
      items:[hasKids?"Magician + balloon twisting":tags.includes("bollywood")||tags.includes("indian")?"Bollywood dance performance":tags.includes("neon")||tags.includes("glow")?"Glow / LED performance act":"Interactive games MC","2 activities / acts","Tailored to your age groups"],
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
      items:["Prints + digital",theme?`Backdrop matching "${theme.name}"`:"Themed backdrop","Full props collection","Unlimited sessions"],
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
      items:["5-piece band","3-hour performance",tags.includes("bollywood")||tags.includes("indian")?"Bollywood & regional setlist":tags.includes("gold")||tags.includes("elegant")?"Jazz & lounge setlist":"Customised song requests","Sound system included"],
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
    `Guests: ${guests}`,
    dateStr?`Date: ${dateStr}`:null,
    (city||venueType)?`Location: ${[city,venueType].filter(Boolean).join(" - ")}`:null,
    theme?`Theme: ${theme.name}`:null,
    budget?`Budget: Rs ${Number(budget).toLocaleString("en-IN")}`:null,
    allLines?`\n*Services I need:*\n${allLines}`:null,
    actLines?`\n*Fun activities:*\n${actLines}`:null,
    "\nCan you help me book these?",
  ].filter(x=>x!==null).join("\n");
  return `https://wa.me/919211668427?text=${encodeURIComponent(parts)}`;
}

/* ── "Your event, start to end" — a short narrative walkthrough for the Final
   Plan's first page, built from what's actually been selected (never invented).
   Not a timestamped itinerary (that's a separate section later in the plan) —
   this is the emotional arc: arrival → setting → celebration → send-off. ── */
function buildEventJourney(occasion, {celebrantName="", guests=20, venueType="", city="", theme=null, decorFocusAreas=[], customDecor={}, selectedEntryExperiences=[], vendors=[], cateringType="", cakeType="", customCatering={}, selectedActivities=[], customActivities=[], gifts=[]}={}) {
  const who = celebrantName || null;
  const venueClause = venueType ? ` at your ${venueType.toLowerCase()}` : "";
  const hasPhotographer = vendors.includes("Photographer") || vendors.includes("Videographer");
  const beats = [];

  // 1. Arrival — names the actual entry experience and its feel, not just its category
  const entry = selectedEntryExperiences[0] ? getEntryExperienceById(selectedEntryExperiences[0]) : null;
  const photoClause = hasPhotographer ? ` Your ${vendors.includes("Photographer")&&vendors.includes("Videographer")?"photographer and videographer are":"photographer is"} already there, catching these first reactions.` : "";
  beats.push({
    icon: "🚪", title: "Guests arrive",
    text: entry
      ? `As guests step in${venueClause}, they're welcomed with ${entry.title.toLowerCase()} — ${(entry.howItFeels || entry.shortDesc || "").replace(/\.$/,"")}.${photoClause}`
      : `Guests arrive${venueClause}${city?` in ${city}`:""}, stepping straight into the mood of ${who?`${who}'s`:"your"} ${occasion.name.toLowerCase()}.${photoClause}`,
  });

  // 2. The setting — names the actual decor items chosen, not just the focus-area category
  const areaNames = decorFocusAreas.map(id=>DECOR_FOCUS_AREAS[id]?.name).filter(Boolean);
  const decorItems = Object.values(customDecor||{}).flat().filter(Boolean);
  let settingText;
  if (decorItems.length) {
    const itemsStr = decorItems.slice(0,3).join(", ").toLowerCase() + (decorItems.length>3 ? `, and ${decorItems.length-3} more touch${decorItems.length-3===1?"":"es"}` : "");
    settingText = theme
      ? `The space carries a ${theme.name} look — ${itemsStr}, styled across ${areaNames.slice(0,2).join(" and ").toLowerCase()||"the venue"}.`
      : `${areaNames.slice(0,2).join(" and ")||"The venue"} come alive with ${itemsStr}.`;
  } else if (theme && areaNames.length) settingText = `The space carries a ${theme.name} look, with ${areaNames.slice(0,2).join(" and ").toLowerCase()} styled to match.`;
  else if (theme) settingText = `A ${theme.name} theme runs through the décor, setting the tone the moment guests look around.`;
  else if (areaNames.length) settingText = `${areaNames.slice(0,2).join(" and ")} are styled for the occasion, giving the space its character.`;
  else settingText = `The venue is dressed to suit a ${occasion.name.toLowerCase()} — simple, warm, and ready for guests.`;
  beats.push({ icon: "🎨", title: "The setting", text: settingText });

  // 3. Food — names the actual catering style, cuisine and dishes, not just "a spread"
  const hasCaterer = vendors.includes("Caterer");
  let foodText = null;
  if (hasCaterer) {
    const dishList = Object.values(customCatering?.dishes || {}).flat().filter(Boolean);
    if (cateringType && dishList.length) {
      foodText = `${cateringType}${customCatering.cuisine ? ` — ${customCatering.cuisine} flavours` : ""} is served, with ${dishList.slice(0,3).join(", ").toLowerCase()}${dishList.length>3?" among the highlights":""}.`;
    } else if (cateringType) {
      foodText = `${cateringType}${customCatering.cuisine ? ` in a ${customCatering.cuisine} spread` : ""} keeps everyone fed through the celebration.`;
    } else {
      foodText = `Guests settle in for a spread crafted for ${who?`${who}'s`:"your"} ${occasion.name.toLowerCase()}.`;
    }
    if (cakeType) foodText += ` ${cakeType} rounds things off.`;
  }

  // 4. Entertainment — names the actual activities, not just a count
  const entertainers = vendors.filter(v => ["DJ","Live Band","Band","Entertainer","Emcee / Host","Anchor"].includes(v));
  const allActivities = [...selectedActivities, ...customActivities].filter(Boolean);
  let funText = null;
  if (entertainers.length || allActivities.length) {
    const parts = [];
    if (entertainers.length) parts.push(`${entertainers.join(" and ")} keeping the energy up`);
    if (allActivities.length) parts.push(`${allActivities.slice(0,3).join(", ")}${allActivities.length>3?` and ${allActivities.length-3} more`:""} woven through the evening`);
    funText = parts.join(", with ") + ".";
  }

  beats.push({ icon: "🎉", title: "The celebration", text: [foodText, funText].filter(Boolean).join(" ") || "The celebration settles into its own easy rhythm." });

  // 5. Send-off — names the actual gifts, not just a count
  const giftText = gifts.length
    ? `Before heading home, guests leave with ${gifts.length>1?`${gifts.slice(0,2).join(" and ").toLowerCase()}${gifts.length>2?`, among ${gifts.length} favours chosen`:""}`:String(gifts[0]).toLowerCase()} to remember the day by.`
    : `As the evening winds down, guests head home with the day's memories — nothing more needed.`;
  beats.push({ icon: "🎁", title: "The send-off", text: giftText });

  return beats;
}

// Mirrors buildEventJourney's shape (icon/title/text beats) but narrates the LEAD-UP instead
// of the day itself — what's still open, what Tendr does vs what the customer still decides,
// and how the final week actually goes. Built from the same timeline/gap data already used
// elsewhere (the "Make it even better" tips, buildTimeline's phases) so it stays consistent
// with the rest of the page instead of inventing a second source of truth.
function buildPreparationJourney(occasion, {timeline=null, vendors=[], date="", budget=null, city="", selectedEntryExperiences=[], entryExperiencesSkipped=false, selectedActivities=[], customActivities=[], gifts=[]}={}) {
  const beats = [];

  // 1. What's still open — same gap conditions as the Recommendations tips, as prose
  const gaps = [];
  if (!date) gaps.push("a date");
  if (!budget || Number(budget)<=0) gaps.push("a budget");
  if (!city.trim()) gaps.push("your city");
  if (vendors.length < 2) gaps.push("your core vendors — decor & catering");
  if (selectedEntryExperiences.length===0 && !entryExperiencesSkipped) gaps.push("an entry experience");
  if (selectedActivities.length===0 && customActivities.length===0) gaps.push("entertainment");
  if (gifts.length===0) gaps.push("return gifts");
  beats.push({
    icon: "📝", title: "Right now",
    text: gaps.length
      ? `A few things are still open — ${gaps.slice(0,3).join(", ")}${gaps.length>3?`, and ${gaps.length-3} more`:""}. Nothing is locked in until you confirm it, so there's no rush, but the earlier these are set, the more choice you'll have.`
      : `Everything that matters is already set — date, budget, vendors, and the extras. From here it's just confirmations and the countdown.`,
  });

  // 2. What Tendr handles — reassurance, grounded in the vendors actually chosen
  beats.push({
    icon: "🤝", title: "What we handle",
    text: vendors.length>0
      ? `Once you move ahead, your Tendr coordinator confirms availability with ${vendors.slice(0,3).join(", ")}${vendors.length>3?` and ${vendors.length-3} more`:""}, chases every confirmation in writing, and steps in with an alternative if anyone falls through — you're never left chasing a vendor yourself.`
      : `Once vendors are picked, your Tendr coordinator takes over confirming availability, chasing written confirmations, and swapping in an alternative if anyone falls through.`,
  });

  // 3. What's still on the customer — the genuinely personal calls, by category
  const onYouParts = [];
  if (vendors.includes("Caterer")) onYouParts.push("final menu & headcount");
  if (vendors.includes("Decorator")) onYouParts.push("décor colour/style sign-off");
  if (gifts.length>0) onYouParts.push("gift quantities");
  if (!onYouParts.length) onYouParts.push("final headcount and any last preferences");
  beats.push({
    icon: "✅", title: "What's on you",
    text: `The big decisions are the fun part — ${onYouParts.join(", ")}. Everything else — scheduling, follow-ups, paperwork — is ours to manage.`,
  });

  // 4. The final stretch — the same buildTimeline() phases, written as a walkthrough instead of bullets
  if (timeline?.phases?.length) {
    const weekOut = timeline.phases.find(p => p.when === "1 week out");
    const dayBefore = timeline.phases.find(p => p.when === "Day before");
    const parts = [];
    if (weekOut) parts.push(`by ${weekOut.date}, ${weekOut.tasks.map(t=>t.toLowerCase()).join(", ")}`);
    if (dayBefore) parts.push(`the day before (${dayBefore.date}), it's ${dayBefore.tasks.map(t=>t.toLowerCase()).join(", ")}`);
    if (parts.length) beats.push({ icon: "⏳", title: "The final stretch", text: parts.join("; then ") + "." });
  } else {
    beats.push({ icon: "⏳", title: "The final stretch", text: "Once a date is set, this fills in with an exact week-by-week countdown — right now there's nothing to schedule against yet." });
  }

  // 5. Bridge to the day itself — self-contained, doesn't assume page position
  beats.push({ icon: "🎊", title: "Then, the day itself", text: "Every open item above gets closed out well before this — so on the day, nothing's being figured out live, it's simply happening." });

  return beats;
}

// Used only by the "Tendr wishes you" reveal page (step 7). Writes ONE short, warm
// paragraph (~60-100 words) like a person describing the celebration face to face —
// simple everyday words, describes what the customer will actually SEE, and only
// credits services that are genuinely selected (never implies an unselected one is
// booked). No numbers, no completeness scoring, no budget commentary — that's what
// the rest of the plan is for; this page is just the picture of the day.
function buildEventSummary(occasion, {celebrantName="", guests=20, date="", city="", venueType="", theme=null, vendors=[], decorFocusAreas=[], customDecor={}, selectedActivities=[], customActivities=[], gifts=[]}={}) {
  const who=celebrantName?`${celebrantName}'s`:"your";
  const guestStr=guests===1?"1 guest":`${guests} guests`;
  const dateStr=date?new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long"}):null;
  const locationStr=[city,venueType].filter(Boolean).join(", ");
  const opener=`You're planning ${who} ${occasion.name.toLowerCase()} for ${guestStr}${dateStr?` on ${dateStr}`:""}${locationStr?` in ${locationStr}`:""}.`;

  // What they'll actually see — only from what's genuinely selected so far.
  const seeParts=[];
  if(vendors.includes("Decorator")){
    const items=Object.values(customDecor||{}).flat().filter(Boolean);
    const areaNames=decorFocusAreas.map(id=>DECOR_FOCUS_AREAS[id]?.name).filter(Boolean);
    if(items.length) seeParts.push(`a beautiful setup with ${items.slice(0,2).join(" and ").toLowerCase()}`);
    else if(theme) seeParts.push(`a lovely ${theme.name} look`);
    else if(areaNames.length) seeParts.push(`${areaNames[0].toLowerCase()} styled just for the day`);
    else seeParts.push(`pretty decorations and a warm, festive setup`);
  }
  if(vendors.includes("Caterer")) seeParts.push(`tasty food for everyone to enjoy`);
  if(vendors.includes("Photographer")||vendors.includes("Videographer")) seeParts.push(`someone capturing all the special moments`);
  const entertain=vendors.filter(v=>["DJ","Live Band","Entertainer","Emcee / Host"].includes(v));
  if(entertain.length||selectedActivities.length||customActivities.length) seeParts.push(`music and fun to keep everyone smiling`);
  if(gifts.length>0) seeParts.push(`lovely little gifts for your guests to take home`);

  const seeSentence=seeParts.length
    ? `Imagine ${seeParts.slice(0,3).join(", ")}.`
    : `We'll help you fill in the little details that make a day feel special.`;

  const whyGood=vendors.length>0
    ? `These little touches will help make the celebration feel warm, happy and truly special.`
    : `Even the simple things, done with care, can make a celebration feel truly special.`;

  const summary=`${opener} ${seeSentence} ${whyGood} It will be a lovely day to spend with your loved ones and create beautiful memories!`;
  return { summary };
}

/* ── build plain-text plan for in-app chat ── */
function buildPlanText(occasion, {guests, date, city, venueType, theme, vendors, vendorPackages, budget, ageGroups=[], selectedActivities=[], customActivities=[], customCatering={}, customDecor={}, celebrantName="", gifts=[], giftQuantities={}, selectedEntryExperiences=[]}) {
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
  const giftLines = gifts.length
    ? "\nGifts:\n"+gifts.map(name=>{
        const g=(occasion.giftIdeas||[]).find(gi=>gi.name===name);
        const qty=giftQuantities[name]>1?` ×${giftQuantities[name]}`:"";
        return g?`• ${g.name}${qty} (${g.price})`:`• ${name}${qty}`;
      }).join("\n")
    : null;
  const entryExpLines = selectedEntryExperiences.length
    ? "\nEntry Experience:\n"+selectedEntryExperiences.map(id=>{
        const e=getEntryExperienceById(id);
        return e?`• ${e.title} (${e.priceDisplay})`:`• ${id}`;
      }).join("\n")
    : null;
  const dateStr = date ? new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "";
  return [
    `Hi Tendr Team! Here's my ${celebrantName?`${celebrantName}'s `:``}${occasion.name} plan — please help me book:`,
    "",
    `👥 Guests: ${guests}`,
    dateStr ? `📅 Date: ${dateStr}` : null,
    (city||venueType) ? `📍 ${[city,venueType].filter(Boolean).join(" · ")}` : null,
    theme ? `🎨 Theme: ${theme.name}` : null,
    budget ? `💰 Budget: ₹${Number(budget).toLocaleString("en-IN")}` : null,
    allLines ? `\nServices needed:\n\n${allLines}` : null,
    entryExpLines,
    actLines,
    giftLines,
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

/* ── budget split — recalculates based on selected vendors ── */
function buildBudgetSplit(total, vendors=[]) {
  const n=Number(total);
  if(!n||n<=0) return null;
  const anySelected = vendors.length > 0;
  const hasDecor    = !anySelected || vendors.some(v=>["Decorator","Florist","Lighting Setup","Balloon Artist"].includes(v));
  const hasCatering = !anySelected || vendors.includes("Caterer");
  const hasPhoto    = !anySelected || vendors.some(v=>["Photographer","Videographer"].includes(v));
  const hasEntertain= !anySelected || vendors.some(v=>["DJ","Live Band","Entertainer","Photo Booth","Emcee / Host","AV Setup"].includes(v));
  const hasCake     = !anySelected || vendors.includes("Cake Artist");
  const cats=[
    {label:"Décor & Setup",  w:hasDecor?28:0,    color:"#C47A2E"},
    {label:"Catering",       w:hasCatering?32:0,  color:"#D4A848"},
    {label:"Photography",    w:hasPhoto?14:0,     color:"#B8956A"},
    {label:"Entertainment",  w:hasEntertain?12:0, color:"#9B7450"},
    {label:"Cake & Sweets",  w:hasCake?8:0,       color:"#8B6545"},
    {label:"Miscellaneous",  w:6,                 color:"#7A5535"},
  ].filter(c=>c.w>0);
  const sum=cats.reduce((s,c)=>s+c.w,0);
  return cats.map(c=>({...c,pct:Math.round(c.w*100/sum),amt:Math.round(n*c.w/sum)}));
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

/* ── estimated gift spend — shared by the step-6 tracker and the step-7 budget summary,
     so the two never disagree on the same number ── */
function computeGiftSpend(gifts, giftQuantities, sortedGifts, guests) {
  return gifts.reduce((sum,name)=>{
    const g=sortedGifts.find(x=>x.name===name);
    const unit=g?(approxCost(g.price,guests)||0):0;
    return sum+unit*(giftQuantities[name]||1);
  },0);
}

/* ── estimated Entry Experience spend — same approxCost parser, over each selected
     idea's priceDisplay (e.g. "₹6K–11K") ── */
function computeEntryExperienceSpend(selectedEntryExperiences) {
  return selectedEntryExperiences.reduce((sum,id)=>{
    const e=getEntryExperienceById(id);
    return sum+(e?(approxCost(e.priceDisplay,1)||0):0);
  },0);
}

/* ── plan card PDF generation — shared by the Download-PDF button and the
   Send-to-Chat flow, which also attaches the same PDF as a [pdf:...] message. ── */
async function generatePlanPdf(el){
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
  return pdf;
}

async function downloadPlanCard(el,name){
  try{
    const pdf=await generatePlanPdf(el);
    pdf.save(`${name.replace(/\s+/g,"-").toLowerCase()}-plan.pdf`);
  }catch{window.print();}
}

/* Builds the [pdf:filename|dataURI] chat-attachment token for the plan PDF,
   reusing the same base64-embed convention already used for [img:...] photos
   in chat (no backend/schema change needed). Returns "" if generation fails —
   caller still sends the text summary even if the PDF attach silently fails. */
async function buildPlanPdfChatToken(el,name){
  try{
    const pdf=await generatePlanPdf(el);
    const fileName=`${name.replace(/\s+/g,"-").toLowerCase()}-plan.pdf`;
    const dataUri=pdf.output("datauristring");
    return `[pdf:${fileName}|${dataUri}]`;
  }catch{ return ""; }
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
  @keyframes chipPop{0%{transform:scale(1)}40%{transform:scale(1.12)}70%{transform:scale(0.96)}100%{transform:scale(1)}}
  .os{animation:fadeUp 0.24s cubic-bezier(0.22,1,0.36,1);}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:10px;border:1.5px solid var(--plan-border,rgba(196,122,46,0.22));background:var(--plan-wash,rgba(196,122,46,0.03));color:${ink};font-size:14px;font-weight:500;cursor:pointer;transition:all 0.14s;font-family:${font};white-space:nowrap;position:relative;}
  .chip:hover{border-color:var(--plan-border-hover,rgba(196,122,46,0.45));background:var(--plan-wash-hover,rgba(196,122,46,0.06));}
  .chip.sel{border-color:var(--plan-accent,${BRAND_GOLD});background:var(--plan-wash-sel,rgba(196,122,46,0.10));color:var(--plan-accent,${BRAND_GOLD});font-weight:600;}
  .chip-pop{animation:chipPop 0.25s cubic-bezier(0.34,1.56,0.64,1);}
  input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.45;cursor:pointer;filter:invert(60%) sepia(60%) saturate(400%) hue-rotate(5deg);}
  ::-webkit-scrollbar{display:none;}
  @media(min-width:600px){.g2{grid-template-columns:repeat(2,1fr)!important;}}
  @media(min-width:600px){.age-g{grid-template-columns:repeat(5,1fr)!important;}}
  @media(min-width:600px){.venue-g{grid-template-columns:repeat(4,1fr)!important;}}
  /* Below 768px the global mobile bottom nav is fixed over the page, so this footer
     needs extra bottom padding or its Next/Back buttons sit underneath it. The padding
     comes from a CSS var MobileBottomNav keeps updated with its own collapsed/expanded
     state, so this footer follows the nav down when it's collapsed instead of always
     reserving room for the full-height bar (which left a dead gap when collapsed). */
  @media(max-width:767px){.od-step-footer{padding-bottom:var(--mobile-nav-clearance, calc(66px + env(safe-area-inset-bottom,0px)))!important;transition:padding-bottom 0.22s ease;}}
  /* 100vh is set inline as a safe fallback for WebViews (e.g. WhatsApp's in-app browser) that
     don't size dvh correctly, which otherwise left a gap between the step footer and the
     fixed bottom nav. Real browsers that support dvh get the more accurate dynamic height. */
  @supports (height:100dvh){.od-page-wrap{height:100dvh!important;}}
`;

/* ── Tab bar ── */
function TabBar({step,withTheme,occAccent,onTab}){
  const tabs=[
    {label:"DETAILS",targetStep:1},
    {label:"SERVICES",targetStep:withTheme?3:3},
    {label:"FUN",targetStep:5},
    {label:"GIFTS",targetStep:6},
    {label:"PLAN",targetStep:7},
  ];
  // step 4 (Entry Experiences) keeps the SERVICES tab highlighted — it's an optional
  // substep of Services, not a peer stage with its own tab.
  const activeIdx=step<=1?0:step===2?0:step===3?1:step===4?1:step===5?2:step===6?3:4;
  return(
    <div style={{display:"flex",borderBottom:"1.5px solid rgba(0,0,0,0.06)",background:"#fff",overflow:"hidden"}}>
      {tabs.map((t,i)=>{
        const isActive=activeIdx===i;
        const isReached=step>=t.targetStep;
        return(
          <button key={t.label}
            onClick={()=>{if(isReached)onTab(t.targetStep);}}
            style={{flex:1,padding:"12px 2px 10px",border:"none",background:"transparent",fontSize:9.5,fontWeight:isActive?800:600,color:isActive?occAccent:"rgba(28,9,0,0.32)",fontFamily:font,letterSpacing:"0.08em",cursor:isReached?"pointer":"default",textAlign:"center",borderBottom:`2.5px solid ${isActive?occAccent:"transparent"}`,transition:"all 0.2s",lineHeight:1}}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────── MAIN ─────────────────── */
export default function OccasionDetail(){
  const {slug}=useParams();
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const token=useSelector(s=>s.auth?.token);
  const { openOccasionsChat } = useChatOverlay();
  const { openPriceEstimator } = usePriceEstimator();
  const [searchParams]=useSearchParams();
  const cardRef=useRef(null);
  const planRef=useRef(null);

  // Landing here from the occasion picker (a tall page, often scrolled down when
  // tapped) could otherwise leave the window scrolled from wherever the previous
  // page was — clipping the sticky header behind the browser chrome until the
  // user manually scrolled up. <ScrollRestoration/> in RootLayout should already
  // cover this, but it hasn't proven reliable in the WhatsApp in-app WebView, so
  // force it here too on every fresh landing / occasion switch.
  useEffect(()=>{ window.scrollTo(0,0); },[slug]);

  // Home.jsx's "Plan with a Theme"/"Jump Straight In" buttons navigate here with
  // ?planMode=with|without — read it once as the initial mode so the upfront theme-pick
  // carousel (gated on withTheme, below) actually opens instead of silently defaulting to
  // "without". A saved draft's own planMode (restorePlan, below) still takes over once it loads.
  const [planMode,setPlanMode]=useState(()=>{
    const m=searchParams.get("planMode");
    return m==="with"?"with":"without";
  });
  const [step,setStep]=useState(1);
  const [guests,setGuests]=useState(20);
  const [date,setDate]=useState("");
  // Approximate start time — required so the itinerary below can show real times instead
  // of a generic placeholder hour (format "H:MM AM/PM", parsed by buildItinerary).
  const [eventStartTime,setEventStartTime]=useState("");
  const [budget,setBudget]=useState("");
  const [celebrantName,setCelebrantName]=useState("");
  const [notes,setNotes]=useState("");
  const notesKeywords=React.useMemo(()=>{
    if(!notes.trim()) return [];
    const n=notes.toLowerCase();
    const hits=[];
    if(n.includes("dj")||n.includes(" music")||n.includes("dance")) hits.push("DJ");
    if(n.includes("makeup")||n.includes("make up")) hits.push("Makeup Artist");
    if(n.includes("cake")) hits.push("Cake Artist");
    if(n.includes("photo")||n.includes("camera")||n.includes("photograph")) hits.push("Photographer");
    if(n.includes("video")) hits.push("Videographer");
    if(n.includes("balloon")) hits.push("Balloon Artist");
    if(n.includes("band")||n.includes("live music")) hits.push("Live Band");
    if(n.includes("catering")||n.includes("food")||n.includes("caterer")) hits.push("Caterer");
    if(n.includes("decor")||n.includes("decoration")||n.includes("balloon")) hits.push("Decorator");
    if(n.includes("flower")||n.includes("floral")||n.includes("bouquet")) hits.push("Florist");
    if(n.includes("lighting")||n.includes("lights")) hits.push("Lighting Setup");
    if(n.includes("anchor")||n.includes("emcee")||n.includes("host")) hits.push("Emcee / Host");
    return [...new Set(hits)].filter(v=>ALL_VENDORS.includes(v));
  },[notes]);
  const [city,setCity]=useState("");
  const [cityDropdownOpen,setCityDropdownOpen]=useState(false);
  const [venueType,setVenueType]=useState("");
  const [venueProvides,setVenueProvides]=useState([]);
  const [showVenueOthersModal,setShowVenueOthersModal]=useState(false);
  const [ageGroups,setAgeGroups]=useState([]);
  const [theme,setTheme]=useState(null);
  const [vibeFilter,setVibeFilter]=useState(null);
  // Tracks whether the upfront "pick your theme" carousel has been resolved (picked or
  // skipped) this session, so it only ever appears once — never re-asked mid-wizard.
  const [themeChoiceMade,setThemeChoiceMade]=useState(false);
  // The theme a customer has tapped in the carousel but not yet committed to — shows a
  // small per-theme intro (its own desc/tags/props) before they confirm it.
  const [previewTheme,setPreviewTheme]=useState(null);
  const [decorAnalyserOpen,setDecorAnalyserOpen]=useState(false);
  const [venueAnalysis,setVenueAnalysis]=useState(null); // result from DecorAnalyzer
  const [venuePhoto,setVenuePhoto]=useState(null); // data URL — from the Decor Analyser upload, or the standalone pre-Plan gate
  const [venuePhotoGateSeen,setVenuePhotoGateSeen]=useState(false); // true once the pre-Plan upload gate has been shown+dismissed/skipped
  const [planSectionsOpen,setPlanSectionsOpen]=useState({itinerary:true,timeline:true,checklist:true,equipment:true}); // Final Plan accordions — default open
  const togglePlanSection=(key)=>setPlanSectionsOpen(s=>({...s,[key]:!s[key]}));
  // Full-screen "story" walkthrough of the plan — shown first whenever step 7 is reached,
  // no header/tabs/bottom-nav visible underneath (portaled above everything). Timeline/
  // Checklist/Equipment live in the normal page below instead of in the story, since
  // they're ongoing tools rather than "the plan" itself.
  const [planStoryOpen,setPlanStoryOpen]=useState(false);
  const [storyIdx,setStoryIdx]=useState(0);
  const [storyDirection,setStoryDirection]=useState(1);
  const goToStory=(n)=>{setStoryDirection(n>storyIdx?1:-1);setStoryIdx(n);};
  useEffect(()=>{ if(step===8){ setStoryIdx(0); setPlanStoryOpen(true); } },[step]);
  const [planExportMode,setPlanExportMode]=useState(false); // true only while generating a PDF — briefly shows all 3 plan pages stacked so the capture is complete
  // Expands the flip-pager to all 3 pages (normal document flow, so html2canvas captures
  // it correctly), waits for layout, runs fn, then restores the paginated view.
  const withPlanExportMode=async(fn)=>{
    setPlanExportMode(true);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    try{ return await fn(); } finally { setPlanExportMode(false); }
  };

  /* Map analysis → DECOR_FOCUS_AREAS suggestions */
  const matchDecorFromAnalysis = useCallback((analysis)=>{
    if(!analysis) return {};
    const KEYWORD_MAP = {
      "entrance":        ["entry","entrance","walkway","gate","pathway","arch","ribbon","welcome","signboard"],
      "stage-backdrop":  ["backdrop","wall","banner","stage","signage","cake table","milestone","neon","sequin","tulle"],
      "ceiling-draping": ["ceiling","drape","draping","canopy","hanging","streamer","overhead"],
      "hall-space":      ["hall","column","pillar","corner","venue styling","balloon pillar"],
      "table-seating":   ["table","chair","centrepiece","runner","charger","napkin","menu card","seating"],
      "photo-booth":     ["photo","booth","selfie","polaroid","props","memory","standee"],
      "personalised":    ["character","cutout","themed","custom","personalized","personalised","name board"],
      "lighting":        ["light","lamp","lantern","candle","glow","edison","string light","uplighting","spotlight","led","warm","fairy"],
    };
    const allText = [
      ...(analysis.topPicks||[]).map(p=>`${p.title} ${p.description}`),
      ...(analysis.decorZones||[]).map(z=>`${z.zone} ${z.suggestion} ${z.details}`),
      ...(analysis.tips||[]),
      analysis.style||"",
      analysis.styleNote||"",
    ].join(" ").toLowerCase();

    const result = {};
    Object.entries(KEYWORD_MAP).forEach(([areaId, keywords])=>{
      if(!keywords.some(kw=>allText.includes(kw))) return;
      const areaItems = DECOR_FOCUS_AREAS[areaId]?.items||[];
      const matched = areaItems.filter(item=>keywords.some(kw=>item.toLowerCase().includes(kw.split(" ")[0])));
      result[areaId] = matched.length ? matched.slice(0,3) : areaItems.slice(0,2);
    });
    return result;
  },[]);

  const handleVenueAnalysisDone = useCallback((analysis,photoDataUrl)=>{
    setVenueAnalysis(analysis);
    setDecorAnalyserOpen(false);
    if(photoDataUrl) setVenuePhoto(photoDataUrl);
    // Auto-populate decor items + pre-check matched focus areas from the photo analysis
    const suggested = matchDecorFromAnalysis(analysis);
    const matchedIds = Object.keys(suggested);
    if(matchedIds.length>0){
      setCustomDecor(prev=>{
        const merged={...prev};
        Object.entries(suggested).forEach(([areaId,items])=>{
          merged[areaId]=[...new Set([...(merged[areaId]||[]),...items])];
        });
        return merged;
      });
      setDecorFocusAreas(prev=>[...new Set([...prev,...matchedIds])]);
    }
  },[matchDecorFromAnalysis]);
  const [vendors,setVendors]=useState([]);
  const [cateringType,setCateringType]=useState("");
  const [cakeType,setCakeType]=useState("");
  const [inviteType,setInviteType]=useState("");
  const [customVendor,setCustomVendor]=useState("");
  const [expandedTip,setExpandedTip]=useState(null);
  const [createdPlanId,setCreatedPlanId]=useState(null); // set once the one-shot POST /event-plans succeeds this session
  const [gifts,setGifts]=useState([]);
  const [giftQuantities,setGiftQuantities]=useState({}); // {giftName: qty} — only meaningful for names present in `gifts`
  const setGiftQty=(name,qty)=>setGiftQuantities(q=>({...q,[name]:Math.max(1,qty)}));
  const [checked,setChecked]=useState({});
  const [vendorPackages,setVendorPackages]=useState({});
  const [downloading,setDownloading]=useState(false);
  const [savedPlan,setSavedPlan]=useState(null);
  const dateInputRef=useRef(null);
  const contentRef=useRef(null);
  const themeTrackRef=useRef(null);
  const scrollThemeCarousel=(dir)=>{
    const el=themeTrackRef.current;
    if(!el) return;
    const card=el.querySelector(".theme-carousel-card");
    const w=(card?.getBoundingClientRect().width||300)+14;
    el.scrollBy({left:dir*w,behavior:"smooth"});
  };

  /* catering builder */
  const [showCateringBuilder,setShowCateringBuilder]=useState(false);
  const [cateringBuilderStep,setCateringBuilderStep]=useState("cuisine"); // "cuisine" | "dishes"
  const [customCatering,setCustomCatering]=useState({cuisine:"",dishes:{}}); // {cuisine, dishes:{Starters:[],…}}

  /* decor builder */
  const [showDecorBuilder,setShowDecorBuilder]=useState(false);
  const [customDecor,setCustomDecor]=useState({}); // {focusAreaId:[items]}
  const [editedPackageItems,setEditedPackageItems]=useState(null); // null | string[] — package item editing
  const [decorFocusAreas,setDecorFocusAreas]=useState([]); // string[] — selected DECOR_FOCUS_AREAS ids
  const [expandedStyleIdx,setExpandedStyleIdx]=useState(null); // oi of the decor-style card whose full item list is expanded

  /* suggested quick-picks */
  const [suggestedFood,setSuggestedFood]=useState([]); // string[]

  /* fun activities */
  const [selectedActivities,setSelectedActivities]=useState([]); // array of activity ids
  const toggleActivity=id=>setSelectedActivities(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);

  /* entry experiences (optional step between Services and Fun) */
  const [selectedEntryExperiences,setSelectedEntryExperiences]=useState([]); // array of entry-experience ids
  const toggleEntryExperience=id=>setSelectedEntryExperiences(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);
  const [entryExperiencesSkipped,setEntryExperiencesSkipped]=useState(false);

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

  /* progressive form: lower fields revealed once date + guests are both set */
  const [advancedUnlocked,setAdvancedUnlocked]=useState(false);
  useEffect(()=>{ if(date&&guests>0) setAdvancedUnlocked(true); },[date,guests]);

  /* live performance prompt state */
  const [showOccPerfModal,setShowOccPerfModal]=useState(false);
  const [occPerfLoading,setOccPerfLoading]=useState(false);
  const [occAvailPerfs,setOccAvailPerfs]=useState(null);
  const [occPerfSkipped,setOccPerfSkipped]=useState(false);
  const [occSelectedPerf,setOccSelectedPerf]=useState(null);

  /* which vendor's package panel is open */
  const [expandedVendor,setExpandedVendor]=useState(null);

  /* Pre-check the 3 suggested decor focus areas the first time the Decorator
     panel is opened (customer can freely deselect/add afterwards). */
  useEffect(()=>{
    if(expandedVendor==="Decorator"&&decorFocusAreas.length===0){
      setDecorFocusAreas(getSuggestedDecorFocusAreas(occasion,{venueType,guests,matchedAreas:venueAnalysis?Object.keys(matchDecorFromAnalysis(venueAnalysis)):[]}));
    }
  },[expandedVendor]);

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
    vendorCategories: getCustomRecommended(customEventDesc),
    checklist:[
      "Set your event date","Confirm guest headcount","Book key vendors",
      "Confirm venue and logistics","Send out invites","Arrange transport if needed",
    ],
    giftIdeas:[],decorThemes:[],activities:[],
    budgetMin:5000,budgetMax:500000,typicalGuests:"10–500",
  } : rawOccasion;

  /* Step renumbering migration (Entry Experiences inserted as new step 4 — everything
     from old step 4 onward shifted up by one). A draft saved before this change would
     otherwise reopen on the wrong stage. */
  function migrateStepNumber(saved){
    if(saved.planVersion>=2) return saved;
    if(saved.step>=4) return {...saved, step:saved.step+1};
    return saved;
  }

  /* load saved plan on mount — restores all form state including step */
  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(PLAN_KEY)||"null");
      if(saved&&saved.step>0){
        const migrated=migrateStepNumber(saved);
        setSavedPlan(migrated);
        restorePlan(migrated);
      }
    }catch{}
  },[slug]);

  /* save on any change */
  useEffect(()=>{
    if(step>0){
      localStorage.setItem(PLAN_KEY,JSON.stringify({
        planVersion:2,
        planMode,step,guests,date,eventStartTime,budget,city,venueType,venueProvides,celebrantName,
        ageGroups,theme,themeChoiceMade,vendors,vendorPackages,cateringType,cakeType,inviteType,gifts,giftQuantities,checked,
        selectedActivities,customCatering,customDecor,decorFocusAreas,customActivities,customEventName,customEventDesc,
        selectedEntryExperiences,entryExperiencesSkipped,
        savedAt:new Date().toISOString(),
      }));
      saveResumeUrl(`/occasions/${slug}`);
    }
  },[planMode,step,guests,date,eventStartTime,budget,city,venueType,venueProvides,ageGroups,theme,themeChoiceMade,vendors,vendorPackages,cateringType,cakeType,inviteType,gifts,giftQuantities,checked,selectedEntryExperiences,entryExperiencesSkipped]);

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

  /* scroll content to top whenever step changes — smooth */
  useEffect(()=>{
    if(contentRef.current) contentRef.current.scrollTo({top:0,behavior:"smooth"});
  },[step]);

  /* Pre-fill from OccasionPlanner modal if a fresh draft was written */
  useEffect(()=>{
    try{
      const raw=sessionStorage.getItem(`tendr-planner-prefill-${slug}`);
      if(!raw) return;
      sessionStorage.removeItem(`tendr-planner-prefill-${slug}`);
      const d=JSON.parse(raw);
      // Only prefill if there's no existing in-progress plan
      const existingRaw=localStorage.getItem(PLAN_KEY);
      if(existingRaw){const ex=JSON.parse(existingRaw); if(ex.step>1) return;}
      // Match theme by name in occasion.decorThemes
      if(d.themeName && occasion?.decorThemes){
        const match=occasion.decorThemes.find(t=>t.name.toLowerCase()===d.themeName.toLowerCase());
        if(match) setTheme(match);
      }
      if(d.guests) setGuests(d.guests);
      if(d.date) setDate(d.date);
      if(d.city) setCity(d.city);
      if(d.planMode) setPlanMode(d.planMode);
    }catch{}
  },[slug]);

  function restorePlan(s){
    setPlanMode(s.planMode);setStep(s.step);setGuests(s.guests||20);
    // Restore the real prior choice rather than assuming "any restore means resolved" — a
    // draft auto-saved moments after mount (before the user ever saw the carousel) would
    // otherwise silently cancel it on the next render.
    setThemeChoiceMade(!!s.themeChoiceMade);
    setDate(s.date||"");setEventStartTime(s.eventStartTime||"");setBudget(s.budget||"");setCity(s.city||"");
    setCelebrantName(s.celebrantName||"");
    setVenueType(s.venueType||"");setVenueProvides(s.venueProvides||[]);setAgeGroups(s.ageGroups||[]);
    setTheme(s.theme||null);setVendors(s.vendors||[]);
    setVendorPackages(s.vendorPackages||{});
    setCateringType(s.cateringType||"");setCakeType(s.cakeType||"");
    setInviteType(s.inviteType||"");setGifts(s.gifts||[]);
    setGiftQuantities(s.giftQuantities||{});
    setChecked(s.checked||{});
    setSelectedActivities(s.selectedActivities||[]);
    setSelectedEntryExperiences(s.selectedEntryExperiences||[]);
    setEntryExperiencesSkipped(!!s.entryExperiencesSkipped);
    if(s.customCatering) setCustomCatering(s.customCatering);
    if(s.customDecor) setCustomDecor(migrateDecorAreaKeys(s.customDecor));
    setDecorFocusAreas((s.decorFocusAreas||[]).filter(id=>DECOR_FOCUS_AREAS[id]));
    if(s.customActivities) setCustomActivities(s.customActivities);
    if(s.customEventName) setCustomEventName(s.customEventName);
    if(s.customEventDesc) setCustomEventDesc(s.customEventDesc);
    setSavedPlan(null);
  }

  if(!occasion){navigate("/occasions");return null;}

  const hub=HUB_ROUTES[slug];
  const withTheme=planMode==="with";
  // Once a theme is picked, it becomes the page's accent + background for every step from
  // here on — Services, Fun, Gifts, Plan all read as "this event, in this theme" instead of
  // generic brand gold. Falls back to the brand defaults for the un-themed "Jump Straight In"
  // path, so that flow is pixel-identical to before.
  const themed = withTheme && !!theme;
  const gold = themed ? themeColor(theme.tags) : BRAND_GOLD;
  const goldLt = themed ? lightenHex(gold, 0.3) : BRAND_GOLD_LT;
  const goldRgb = themed ? hexToRgb(gold) : "196,122,46";
  const border = themed ? `rgba(${goldRgb},0.2)` : BRAND_BORDER;
  const occAccent = themed ? gold : (OCC_ACCENT[slug]||gold);
  const equipment=getEquipment(slug,guests);
  const recommended=getRecommended(occasion,theme,ageGroups,venueType);

  /* Theme gallery grid — superseded by the upfront carousel overlay (above) for normal
     navigation; next()/back() no longer route through step 2, so this only still renders
     for an old saved draft that happens to be sitting on step 2. Left in place rather than
     deleted so such a draft doesn't hit a blank step. */
  const renderThemeGallery=()=>{
    const VIBES=[
      {label:"Soft & Intimate",  tags:["pastel","floral","soft","pink","dreamy","nursery","gentle","light","baby","minimal","white"]},
      {label:"Grand & Celebratory",tags:["gold","royal","elegant","glam","red-carpet","luxe","premium","formal","opulent"]},
      {label:"Playful & Fun",    tags:["fun","neon","glow","dance","teen","colourful","bold","jungle","safari","teddy","bear","cute","cartoon","vibrant"]},
      {label:"Warm & Traditional",tags:["bollywood","indian","marigold","ghazal","sufi","classic","heritage","traditional","stars","twinkle"]},
    ];
    const filteredThemes=(occasion.decorThemes||[]).filter(t=>{
      if(!vibeFilter) return true;
      const vibe=VIBES.find(v=>v.label===vibeFilter);
      if(!vibe) return true;
      return (t.tags||[]).some(tag=>vibe.tags.some(vt=>tag.toLowerCase().includes(vt)||vt.includes(tag.toLowerCase())));
    });
    const displayThemes=filteredThemes.length>0?filteredThemes:(occasion.decorThemes||[]);
    return(
      <>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7}}>Filter by vibe</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {VIBES.map(v=>{
              const sel=vibeFilter===v.label;
              return(
                <button key={v.label} onClick={()=>setVibeFilter(sel?null:v.label)}
                  style={{fontSize:11.5,fontWeight:sel?700:500,color:sel?gold:muted,background:sel?`rgba(${goldRgb},0.1)`:"rgba(28,9,0,0.04)",border:`1px solid ${sel?`rgba(${goldRgb},0.3)`:"rgba(28,9,0,0.1)"}`,borderRadius:100,padding:"5px 12px",cursor:"pointer",fontFamily:font,transition:"all 0.15s"}}>
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {displayThemes.map((t,i)=>{
            const sel=theme?.name===t.name;
            const tc=themeColor(t.tags);
            const te=themeEmoji(t.tags);
            const isLast=i===(occasion.decorThemes||[]).length-1;
            const isOdd=(occasion.decorThemes||[]).length%2===1;
            return(
              <button key={i} onClick={()=>setTheme(sel?null:t)}
                style={{padding:0,borderRadius:16,border:`2px solid ${sel?gold:"rgba(196,122,46,0.13)"}`,background:"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.18s",overflow:"hidden",boxShadow:sel?"0 4px 20px rgba(196,122,46,0.22)":"0 1px 5px rgba(0,0,0,0.06)",gridColumn:(isOdd&&isLast)?"1 / -1":"auto"}}
              >
                <div style={{position:"relative",height:isOdd&&isLast?160:140,overflow:"hidden",background:`linear-gradient(160deg,${tc}66,${tc}28)`}}>
                  <div style={{position:"absolute",inset:0}}>
                    {[
                      {top:"10%",left:"8%",size:16,rot:-12,op:0.4},
                      {bottom:"38%",right:"10%",size:14,rot:10,op:0.32},
                    ].map((p,pi)=>themeProps(t.tags)[pi%themeProps(t.tags).length]&&(
                      <span key={pi} style={{position:"absolute",top:p.top,left:p.left,right:p.right,bottom:p.bottom,fontSize:p.size,opacity:p.op,transform:`rotate(${p.rot}deg)`}}>
                        {themeProps(t.tags)[pi%themeProps(t.tags).length]}
                      </span>
                    ))}
                  </div>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:isOdd&&isLast?44:36,filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.12))"}}>{te}</span>
                  </div>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.62) 0%,transparent 55%)"}}/>
                  <div style={{position:"absolute",bottom:10,left:10,right:32}}>
                    <span style={{fontSize:12,fontWeight:800,color:"#fff",lineHeight:1.25,textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{t.name}</span>
                  </div>
                  {sel&&(
                    <div style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:"50%",background:gold,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
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
      </>
    );
  };
  const tasksDone=Object.values(checked).filter(Boolean).length;
  const tasksTotal=(occasion.checklist||[]).length;
  const catVendors=vendors.filter(v=>(occasion.vendorCategories||[]).includes(v)||ALL_VENDORS.includes(v));
  const timeline=buildTimeline(date,vendors);
  const budgetSplit=buildBudgetSplit(budget, vendors);

  /* vendor link URL */
  const vendorUrl=(cat)=>{
    const params=new URLSearchParams({serviceType:cat});
    if(city.trim()) params.set("city",city.trim());
    if(venueType) params.set("venueType",venueType);
    return `/listings?${params.toString()}`;
  };

  /* ── Plan step, section C: "Selected services & experiences" — grouped into
     paragraph-led mini-sections (one sentence naming what's included, then the
     items below) instead of a flat invoice-style row list, per the redesign. */
  const renderSelectedItemsSection=()=>{
    const STATUS_STYLE={
      "Selected":{bg:"rgba(34,197,94,0.1)",color:"#16a34a"},
      "Estimate available":{bg:"rgba(196,122,46,0.1)",color:gold},
      "Quote required":{bg:"rgba(28,9,0,0.06)",color:muted},
    };
    const joinNames=(arr)=>arr.length>1?`${arr.slice(0,-1).join(", ")} and ${arr[arr.length-1]}`:(arr[0]||"");

    const serviceRows=catVendors.map(v=>{
      const pkgIdx=vendorPackages[v];
      const pkgs=ALL_VENDORS.includes(v)?getVendorPackages(v,{guests,venueType,theme,ageGroups}):null;
      const hasPkg=pkgIdx==="custom"||(typeof pkgIdx==="number"&&pkgs);
      const pkgLabel=pkgIdx==="custom"?"Custom":typeof pkgIdx==="number"&&pkgs?pkgs[pkgIdx]?.label:null;
      const pkgPrice=pkgIdx==="custom"?null:typeof pkgIdx==="number"&&pkgs?pkgs[pkgIdx]?.price:null;
      return{key:`v-${v}`,icon:"🛠️",title:v,sub:pkgLabel,status:hasPkg?"Selected":"Quote required",price:pkgPrice,onEdit:()=>setStep(3)};
    });
    if(theme) serviceRows.push({key:"theme",icon:"🎨",title:theme.name,sub:"Decor style",status:"Selected",price:null,onEdit:()=>setStep(3)});
    if(decorFocusAreas.length) serviceRows.push({key:"decor-areas",icon:"📍",title:decorFocusAreas.map(id=>DECOR_FOCUS_AREAS[id]?.name).filter(Boolean).join(", "),sub:"Decor focus areas",status:"Selected",price:null,onEdit:()=>setStep(3)});

    const entryRows=selectedEntryExperiences.map(id=>{
      const e=getEntryExperienceById(id);
      if(!e) return null;
      return{key:`ee-${id}`,icon:entryEmoji(e),title:e.title,sub:"Entry Experience",status:"Estimate available",price:e.priceDisplay,onEdit:()=>setStep(4)};
    }).filter(Boolean);

    const activityRows=[
      ...selectedActivities.map(id=>{
        const a=ALL_ACTIVITY_ITEMS.find(x=>x.id===id);
        if(!a) return null;
        const typeEntry=ACTIVITY_TYPES.find(t=>ALL_ACTIVITIES[t.key]?.some(x=>x.id===id));
        return{key:`act-${id}`,icon:a.icon,title:a.name,sub:typeEntry?.singular||"Activity",status:"Estimate available",price:a.price,onEdit:()=>setStep(5)};
      }).filter(Boolean),
      ...customActivities.map((act,i)=>({key:`cact-${i}`,icon:"✦",title:act,sub:"Custom · Added by you",status:"Selected",price:null,onEdit:()=>setStep(5)})),
    ];

    const giftRows=gifts.map(name=>{
      const g=(occasion.giftIdeas||[]).find(g=>g.name===name);
      if(!g) return null;
      const qty=giftQuantities[name]||1;
      return{key:`gift-${name}`,icon:giftEmoji(g.name,g.desc),title:qty>1?`${g.name} ×${qty}`:g.name,sub:"Gift",status:"Estimate available",price:g.price,onEdit:()=>setStep(6)};
    }).filter(Boolean);

    const groups=[
      {label:"Services", rows:serviceRows, paragraph: serviceRows.length?`You've booked ${serviceRows.length} service${serviceRows.length!==1?"s":""} for ${occasion.name.toLowerCase()} — ${joinNames(serviceRows.map(r=>r.title))}.`:null},
      {label:"Entrance experience", rows:entryRows, paragraph: entryRows.length?`Guests will be welcomed with ${entryRows.length>1?"these entry experiences":"this entry experience"}: ${joinNames(entryRows.map(r=>r.title))}.`:null},
      {label:"Fun & activities", rows:activityRows, paragraph: activityRows.length?`You've added ${activityRows.length} activit${activityRows.length!==1?"ies":"y"} to keep guests engaged: ${joinNames(activityRows.map(r=>r.title))}.`:null},
      {label:"Gifts", rows:giftRows, paragraph: giftRows.length?`You've picked ${giftRows.length} gift${giftRows.length!==1?"s":""} for your guests: ${joinNames(giftRows.map(r=>r.title))}.`:null},
    ].filter(g=>g.rows.length>0);

    if(!groups.length) return null;

    return(
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{width:26,height:26,borderRadius:8,background:`rgba(196,122,46,0.1)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          </div>
          <span style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:font}}>Selected services & experiences</span>
          <div style={{flex:1,height:1,background:`rgba(196,122,46,0.12)`}}/>
        </div>
        {groups.map(g=>(
          <div key={g.label} style={{marginBottom:16,padding:"13px 14px",borderRadius:14,background:"#fff",border:`1px solid ${border}`}}>
            <div style={{fontSize:9.5,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{g.label}</div>
            <div style={{fontSize:12.5,color:ink,lineHeight:1.6,marginBottom:10}}>{g.paragraph}</div>
            {g.rows.map(r=>{
              const s=STATUS_STYLE[r.status]||STATUS_STYLE["Selected"];
              return(
                <div key={r.key} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 9px",borderRadius:10,background:"#FAFAF8",marginBottom:6}}>
                  <span style={{fontSize:14,flexShrink:0,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(196,122,46,0.08)",borderRadius:8}}>{r.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:r.sub?2:0}}>
                      <span style={{fontSize:12,fontWeight:700,color:ink}}>{r.title}</span>
                      <span style={{fontSize:9,fontWeight:700,color:s.color,background:s.bg,borderRadius:100,padding:"2px 7px",flexShrink:0}}>{r.status}</span>
                    </div>
                    {r.sub&&<div style={{fontSize:10,color:muted}}>{r.sub}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                    <button onClick={r.onEdit} style={{fontSize:10,fontWeight:700,color:gold,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:font}}>Edit</button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const smartVendors=getSmartVendors(occasion,theme,ageGroups,venueType,budget);
  const mainVendors=vendors.filter(v=>ALL_VENDORS.includes(v));
  const allVendorsChosen=mainVendors.length>0&&mainVendors.every(v=>vendorPackages[v]!==undefined&&vendorPackages[v]!==null);
  // per-vendor budget allocation (used for package tier highlighting)
  const perVendorBudget=budget&&mainVendors.length?Math.round(Number(budget)/mainVendors.length):null;

  /* Cross-sell strip — shown under a category's chosen package, pointing at up to 2
     other already-recommended categories (from getRecommended()) the customer hasn't
     added yet. Reuses the existing recommendation data, just a new presentation layer. */
  const renderCrossSell=(excludeV)=>{
    const picks=[...recommended].filter(c=>c!==excludeV&&!vendors.includes(c)&&ALL_VENDORS.includes(c)).slice(0,2);
    if(!picks.length) return null;
    return(
      <div style={{marginTop:10,paddingTop:10,borderTop:"1px dashed rgba(196,122,46,0.15)"}}>
        <div style={{fontSize:9.5,fontWeight:700,color:muted,marginBottom:7}}>Pairs well with your event:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {picks.map(c=>(
            <button key={c} onClick={()=>toggleVendor(c)}
              style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:100,border:"1.5px solid rgba(196,122,46,0.25)",background:"#fff",color:gold,fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:font}}>
              <span style={{fontSize:12}}>+</span>{c}
            </button>
          ))}
        </div>
      </div>
    );
  };

  /* navigation */
  const next=()=>{
    // Theme (when wanted) is resolved upfront by the carousel overlay below, before step 1
    // is even interactive — so step 1 always moves straight to Services, never back through
    // the legacy embedded theme step.
    if(step===1){setStep(3);return;}
    if(step===2){setStep(3);return;}
    if(step===3){setStep(4);return;}
    if(step===4){
      if(selectedEntryExperiences.length===0) setEntryExperiencesSkipped(true);
      setStep(5);
      return;
    }
    if(step===6 && token && occasion && date && guests && city){
      const patchWizardSelections=(planId)=>{
        fetch(`${BASE_URL}/event-plans/${planId}/wizard-selections`,{
          method:'PATCH',
          headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
          credentials:'include',
          body:JSON.stringify({
            selectedTheme: theme?.name||'',
            giftSelections: gifts.map(name=>({name,qty:giftQuantities[name]||1})),
            selectedActivities,
            customActivities,
            selectedEntryExperiences,
          }),
        }).catch(()=>{});
      };
      try{
        if(createdPlanId){
          // Already created earlier this session (e.g. user went back to step 6 and forward again) — just sync selections.
          patchWizardSelections(createdPlanId);
        } else if(!sessionStorage.getItem('tendr_early_plan_created')){
          sessionStorage.setItem('tendr_early_plan_created','1');
          fetch(`${BASE_URL}/event-plans`,{
            method:'POST',
            headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
            credentials:'include',
            body:JSON.stringify({
              bookingType:'you-do-it',
              eventName: occasion.name,
              eventType: occasion.name,
              guests: String(guests),
              location: city,
              date,
              budget: budget ? String(budget) : '',
              additionalInfo: '',
              selectedServices: vendors.map(toBackendServiceType),
              finalisedVendors: {},
            }),
          }).then(res=>{
            if(!res.ok){ console.warn('[event-plan] create failed', res.status); return null; }
            return res.json();
          }).then(data=>{
            if(data?.eventPlan?._id){
              setCreatedPlanId(data.eventPlan._id);
              patchWizardSelections(data.eventPlan._id);
            }
          }).catch(()=>{ try{sessionStorage.removeItem('tendr_early_plan_created');}catch{} });
        }
      }catch{}
    }
    setStep(s=>Math.min(s+1,8));
  };
  const back=()=>{
    if(step===1){navigate(-1);return;}
    if(step===2){setStep(1);return;}
    if(step===3){setStep(1);return;}
    setStep(s=>s-1);
  };
  const canNext=()=>{
    if(step===1) return guests>0 && !!date && !!eventStartTime && !!venueType && city.trim().length>0;
    return true;
  };
  const step1Hint=()=>{
    if(!date) return "Set your event date →";
    if(!eventStartTime) return "Give us an approx. start time →";
    if(!venueType) return "Pick a venue type →";
    if(!city.trim()) return "Add your city →";
    return "Next: Services →";
  };

  const toggleVendor=c=>setVendors(v=>v.includes(c)?v.filter(x=>x!==c):[...v,c]);
  const toggleGift=n=>setGifts(g=>{
    if(g.includes(n)){
      setGiftQuantities(q=>{const nq={...q};delete nq[n];return nq;});
      return g.filter(x=>x!==n);
    }
    return [...g,n];
  });
  const toggleAge=id=>setAgeGroups(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);

  const addCustomVendor=()=>{
    if(!customVendor.trim())return;
    if(!vendors.includes(customVendor.trim())) toggleVendor(customVendor.trim());
    setCustomVendor("");
  };

  /* styles */
  const canProceed=canNext();
  const btnPrimary={flex:1,padding:"13px 20px",borderRadius:10,border:"none",background:canProceed?occAccent:"rgba(28,9,0,0.06)",color:canProceed?"#fff":"rgba(28,9,0,0.30)",fontSize:14,fontWeight:700,cursor:canProceed?"pointer":"not-allowed",fontFamily:font,transition:"all 0.2s",letterSpacing:"0.01em"};
  const btnGhost={padding:"12px 18px",borderRadius:10,border:`1px solid rgba(28,9,0,0.15)`,background:"transparent",color:"rgba(28,9,0,0.50)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:font,transition:"all 0.18s",whiteSpace:"nowrap"};
  const sLabel={fontSize:12,fontWeight:600,color:"rgba(28,9,0,0.45)",textTransform:"uppercase",letterSpacing:"0.10em",marginBottom:14,fontFamily:font};
  const fieldCard={background:"#fff",borderRadius:12,padding:"22px 22px",border:`1px solid rgba(196,122,46,0.18)`,marginBottom:14,transition:"border-color 0.2s"};

  /* fully personalized gift sort — theme + age groups + budget */
  const sortedGifts=(occasion.giftIdeas||[]).map(g=>({
    ...g,...scoreGift(g,{theme,ageGroups,budget,guests})
  })).sort((a,b)=>b.score-a.score);

  const pageBg = step>0
    ? (themed
        ? `radial-gradient(ellipse 90% 50% at 10% 0%, ${gold}4a 0%, transparent 58%), radial-gradient(ellipse 80% 45% at 100% 100%, ${gold}3c 0%, transparent 62%), ${lightenHex(gold,0.88)}`
        : "#F5F3F0")
    : bg;
  const themeIcons = themed ? themeProps(theme.tags) : [];
  const planCssVars = themed ? {
    "--plan-accent": gold,
    "--plan-border": border,
    "--plan-border-hover": `rgba(${goldRgb},0.45)`,
    "--plan-wash": `rgba(${goldRgb},0.03)`,
    "--plan-wash-hover": `rgba(${goldRgb},0.06)`,
    "--plan-wash-sel": `rgba(${goldRgb},0.10)`,
  } : {};
  return(
    <div className="od-page-wrap" style={{height:"100vh",background:pageBg,fontFamily:font,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",...planCssVars}}>
      <style>{css}</style>
      <SEO title={`Plan your ${occasion.name} — Tendr`} description={`Guided ${occasion.name} planner`} path={`/occasions/${slug}`}/>

      {/* Ambient theme props — a handful of soft, oversized motifs matching the chosen theme,
          anchored to the viewport so they stay put behind the scrolling content on every step. */}
      {themeIcons.length>0 && (
        <div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden"}}>
          {[
            {top:"4%",left:"2%",size:46,rot:-18,op:0.4},
            {top:"9%",right:"4%",size:38,rot:16,op:0.32},
            {top:"33%",left:"1.5%",size:30,rot:8,op:0.3},
            {top:"46%",right:"2%",size:50,rot:-10,op:0.34},
            {bottom:"32%",left:"3%",size:36,rot:14,op:0.32},
            {bottom:"19%",right:"5%",size:42,rot:-14,op:0.38},
            {bottom:"7%",left:"7%",size:28,rot:6,op:0.28},
            {bottom:"5%",right:"20%",size:32,rot:-6,op:0.26},
          ].map((p,i)=>themeIcons[i%themeIcons.length]&&(
            <span key={i} style={{position:"absolute",top:p.top,left:p.left,right:p.right,bottom:p.bottom,fontSize:p.size,opacity:p.op,transform:`rotate(${p.rot}deg)`,filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.08))"}}>
              {themeIcons[i%themeIcons.length]}
            </span>
          ))}
        </div>
      )}

      {/* sticky header — hidden on the "Tendr wishes you" reveal (step 7) and the final Plan
          view (step 8), both of which are standalone pages with their own navigation */}
      {step!==7&&step!==8&&(
      <div style={{position:"sticky",top:0,zIndex:100,background:"#fff",borderBottom:"1px solid rgba(0,0,0,0.07)"}}>
        <HamburgerNav active="Occasions" hideTopBar/>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 20px 6px"}}>
          <button onClick={back} style={{width:36,height:36,borderRadius:10,border:"none",background:`${occAccent}10`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={occAccent} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <span style={{fontSize:22}}>{occasion.icon}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:700,color:ink,letterSpacing:"-0.01em"}}>{occasion.name}{occasion.localName&&<span style={{fontSize:12,color:occAccent,fontWeight:600,marginLeft:6}}>/ {occasion.localName}</span>}</div>
          </div>
        </div>
        {step>0&&<TabBar step={step} withTheme={withTheme} occAccent={occAccent} onTab={setStep}/>}
      </div>
      )}

      {/* Upfront theme-pick carousel — shown once, right when "Plan with a Theme" lands here,
          before step 1 is interactive. Picking (or skipping) resolves it for the rest of the
          session, so the old embedded theme step never needs to ask again. */}
      {withTheme&&!theme&&!themeChoiceMade&&step===1&&(occasion.decorThemes||[]).length>0&&(
        <div
          style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(20,10,0,0.55)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:18}}
        >
          <style>{`
            @keyframes themeCarouselIn{from{opacity:0;transform:scale(0.94) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
            .theme-carousel-track{scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
            .theme-carousel-track::-webkit-scrollbar{display:none;}
            .theme-carousel-card{scroll-snap-align:center;}
            .theme-carousel-card:hover{transform:translateY(-6px) scale(1.015);box-shadow:0 28px 60px -10px rgba(0,0,0,0.45),0 10px 22px rgba(0,0,0,0.2)!important;}
            .theme-carousel-card:active{transform:translateY(-2px) scale(0.985);}
            .theme-carousel-arrow{transition:transform 0.15s ease,background 0.15s ease;}
            .theme-carousel-arrow:hover{background:rgba(255,255,255,0.55)!important;transform:translateY(-50%) scale(1.08);}
            .theme-carousel-arrow:active{transform:translateY(-50%) scale(0.92);}
          `}</style>
          <div
            onClick={e=>e.stopPropagation()}
            style={{background:"rgba(255,252,245,0.6)",backdropFilter:"blur(32px) saturate(180%)",WebkitBackdropFilter:"blur(32px) saturate(180%)",border:"none",borderRadius:26,maxWidth:420,width:"100%",maxHeight:"88dvh",overflow:"hidden",boxShadow:"0 1px 0 rgba(255,255,255,0.6) inset, 0 18px 46px -12px rgba(0,0,0,0.4), 0 50px 130px rgba(0,0,0,0.6)",display:"flex",flexDirection:"column",animation:"themeCarouselIn 0.26s cubic-bezier(0.22,1,0.36,1)"}}
          >
          {previewTheme?(()=>{
            const t=previewTheme, tc=themeColor(t.tags), te=themeEmoji(t.tags), tp=themeProps(t.tags);
            const vibe=(t.tags||[])[0]||t.name;
            return(
              <div style={{display:"flex",flexDirection:"column",overflowY:"auto"}}>
                <div style={{position:"relative",height:200,flexShrink:0,overflow:"hidden",background:`linear-gradient(160deg,${tc}75,${tc}30)`}}>
                  <button onClick={()=>setPreviewTheme(null)}
                    style={{position:"absolute",top:14,left:14,zIndex:3,background:"rgba(255,255,255,0.4)",backdropFilter:"blur(8px)",border:"none",color:ink,fontSize:11,fontWeight:700,borderRadius:100,padding:"5px 12px",cursor:"pointer",fontFamily:font}}>
                    ← All themes
                  </button>
                  <div style={{position:"absolute",inset:0}}>
                    {[
                      {top:"12%",left:"10%",size:30,rot:-14,op:0.55},
                      {top:"16%",right:"12%",size:24,rot:12,op:0.42},
                      {bottom:"48%",left:"20%",size:20,rot:8,op:0.38},
                      {bottom:"42%",right:"16%",size:28,rot:-10,op:0.48},
                    ].map((p,pi)=>tp[pi%tp.length]&&(
                      <span key={pi} style={{position:"absolute",top:p.top,left:p.left,right:p.right,bottom:p.bottom,fontSize:p.size,opacity:p.op,transform:`rotate(${p.rot}deg)`}}>{tp[pi%tp.length]}</span>
                    ))}
                  </div>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:64,filter:"drop-shadow(0 2px 10px rgba(0,0,0,0.16))"}}>{te}</span>
                  </div>
                </div>
                <div style={{padding:"18px 22px 22px"}}>
                  <div style={{fontFamily:serif,fontSize:"clamp(1.25rem,4vw,1.5rem)",fontWeight:500,color:ink,lineHeight:1.2,marginBottom:6}}>{t.name}</div>
                  <div style={{fontSize:13,color:muted,lineHeight:1.55,marginBottom:14}}>{t.desc}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:18}}>
                    {(t.tags||[]).map(tag=>(
                      <span key={tag} style={{fontSize:10,fontWeight:600,color:tc,background:`${tc}18`,border:`1px solid ${tc}35`,borderRadius:100,padding:"3px 10px"}}>{tag}</span>
                    ))}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:20}}>
                    {[
                      {icon:"🎨",label:`Decor styled around ${vibe}`},
                      {icon:"🎁",label:`Gift picks that fit a ${t.name} vibe`},
                      {icon:"🧑‍🍳",label:`Vendors experienced with this look`},
                    ].map(row=>(
                      <div key={row.label} style={{display:"flex",alignItems:"center",gap:11}}>
                        <div style={{width:30,height:30,borderRadius:9,background:`${tc}16`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{row.icon}</div>
                        <div style={{fontSize:12.5,color:ink,fontWeight:600,lineHeight:1.35}}>{row.label}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{setTheme(t);setThemeChoiceMade(true);}}
                    style={{width:"100%",padding:"13px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${tc},${lightenHex(tc,0.2)})`,color:"#fff",fontSize:14.5,fontWeight:700,cursor:"pointer",fontFamily:font,boxShadow:`0 6px 18px ${tc}55`}}>
                    Use "{t.name}" →
                  </button>
                </div>
              </div>
            );
          })():(<>
            <div style={{padding:"26px 22px 16px",textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:6}}>Choose your look</div>
              <div style={{fontFamily:serif,fontSize:"clamp(1.3rem,4vw,1.6rem)",fontWeight:500,color:ink,lineHeight:1.2,marginBottom:6}}>How should your {occasion.name.toLowerCase()} look?</div>
              <div style={{fontSize:12.5,color:muted,lineHeight:1.5}}>Swipe to browse — tap one to see what it changes.</div>
            </div>

            <div style={{position:"relative",flexShrink:0}}>
              <div className="theme-carousel-track" ref={themeTrackRef} style={{display:"flex",overflowX:"auto",gap:14,padding:"4px 22px 6px"}}>
                {occasion.decorThemes.map((t,i)=>{
                  const tc=themeColor(t.tags);
                  const te=themeEmoji(t.tags);
                  const tp=themeProps(t.tags);
                  return(
                    <button key={i} className="theme-carousel-card" onClick={()=>setPreviewTheme(t)}
                      style={{flex:"0 0 76%",padding:0,borderRadius:18,border:"none",background:"rgba(255,255,255,0.16)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",cursor:"pointer",textAlign:"left",overflow:"hidden",boxShadow:"0 20px 46px -12px rgba(0,0,0,0.4), 0 8px 18px rgba(0,0,0,0.18)",transition:"transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s"}}>
                      <div style={{position:"relative",height:190,overflow:"hidden",background:`linear-gradient(160deg,${tc}70,${tc}2e)`}}>
                        {/* Scattered theme props instead of a stock photo */}
                        <div style={{position:"absolute",inset:0}}>
                          {[
                            {top:"10%",left:"8%",size:26,rot:-14,op:0.55},
                            {top:"14%",right:"10%",size:20,rot:12,op:0.42},
                            {bottom:"44%",left:"16%",size:18,rot:8,op:0.38},
                            {bottom:"40%",right:"14%",size:24,rot:-10,op:0.48},
                            {top:"8%",left:"42%",size:16,rot:4,op:0.32},
                          ].map((p,pi)=>tp[pi%tp.length]&&(
                            <span key={pi} style={{position:"absolute",top:p.top,left:p.left,right:p.right,bottom:p.bottom,fontSize:p.size,opacity:p.op,transform:`rotate(${p.rot}deg)`}}>
                              {tp[pi%tp.length]}
                            </span>
                          ))}
                        </div>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:54,filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.14))"}}>{te}</span>
                        </div>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)"}}/>
                        <div style={{position:"absolute",bottom:12,left:14,right:14}}>
                          <span style={{fontSize:15,fontWeight:800,color:"#fff",lineHeight:1.25,textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{t.name}</span>
                        </div>
                      </div>
                      <div style={{padding:"12px 14px 16px"}}>
                        <div style={{fontSize:12,color:muted,lineHeight:1.5,marginBottom:8}}>{t.desc}</div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {(t.tags||[]).slice(0,3).map(tag=>(
                            <span key={tag} style={{fontSize:9.5,fontWeight:600,color:"rgba(30,15,0,0.4)",background:"rgba(28,9,0,0.08)",borderRadius:100,padding:"2px 8px"}}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {occasion.decorThemes.length>1&&(<>
                <button
                  className="theme-carousel-arrow"
                  onClick={()=>scrollThemeCarousel(-1)}
                  aria-label="Previous theme"
                  style={{position:"absolute",top:95,left:6,transform:"translateY(-50%)",width:38,height:38,borderRadius:"50%",border:"none",background:"rgba(255,255,255,0.4)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 8px 20px rgba(0,0,0,0.28),0 2px 6px rgba(0,0,0,0.15)",zIndex:5}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  className="theme-carousel-arrow"
                  onClick={()=>scrollThemeCarousel(1)}
                  aria-label="Next theme"
                  style={{position:"absolute",top:95,right:6,transform:"translateY(-50%)",width:38,height:38,borderRadius:"50%",border:"none",background:"rgba(255,255,255,0.4)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 8px 20px rgba(0,0,0,0.28),0 2px 6px rgba(0,0,0,0.15)",zIndex:5}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </>)}
            </div>

            <div style={{padding:"14px 22px 22px",textAlign:"center",flexShrink:0}}>
              <button onClick={()=>setThemeChoiceMade(true)}
                style={{background:"none",border:"none",cursor:"pointer",color:"rgba(30,15,0,0.4)",fontSize:12.5,fontWeight:600,fontFamily:font,textDecoration:"underline",textUnderlineOffset:3}}>
                Skip — no theme
              </button>
            </div>
          </>)}
          </div>
        </div>
      )}

      {/* content */}
      <div ref={contentRef} style={{flex:1,overflowY:"auto",padding:"28px 20px 32px",maxWidth:680,margin:"0 auto",width:"100%",boxSizing:"border-box",scrollBehavior:"smooth",position:"relative",zIndex:2}}>

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

        {/* ══ STEP 1: details ══ */}
        {step===1&&(
          <div className="os">

            {/* Hero header card */}
            <div style={{borderRadius:14,background:"#fff",border:`1px solid rgba(28,9,0,0.08)`,marginBottom:10,padding:"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:9.5,fontWeight:800,color:occAccent,textTransform:"uppercase",letterSpacing:"0.16em",marginBottom:6,fontFamily:font}}>Tell us about your celebration</div>
                <div style={{fontFamily:serif,fontSize:"clamp(1.25rem,4vw,1.65rem)",color:ink,lineHeight:1.2,fontWeight:600,marginBottom:5}}>
                  {isCustomOccasion?customEventName||"Your Event":occasion.name}
                </div>
                <div style={{fontSize:12.5,color:muted,lineHeight:1.5}}>{occasion.tagline||"Let's start with the essentials."}</div>
              </div>
              <div style={{flexShrink:0,width:72,height:72,borderRadius:"50%",background:`${occAccent}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,userSelect:"none"}}>
                {occasion.icon||"🎉"}
              </div>
            </div>

            {/* Progress bar — counts required fields filled */}
            {(()=>{
              const fields=[!!date,!!eventStartTime,guests>0,!!venueType,city.trim().length>0];
              const filled=fields.filter(Boolean).length;
              const total=fields.length;
              const pct=Math.round(filled*100/total);
              return(
                <div style={{marginBottom:10,padding:"10px 16px",borderRadius:10,background:"#fff",border:"1px solid rgba(28,9,0,0.07)"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:10.5,fontWeight:600,color:pct===100?occAccent:muted}}>{pct===100?"Ready to go! →":`${filled} of ${total} basics filled`}</span>
                    <span style={{fontSize:10,fontWeight:700,color:pct===100?occAccent:"rgba(28,9,0,0.25)"}}>{pct}%</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:"rgba(28,9,0,0.06)",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:pct===100?occAccent:gold,borderRadius:2,transition:"width 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}/>
                  </div>
                  {pct<100&&<div style={{fontSize:10,color:muted,marginTop:5}}>
                    {!date?"Set your event date":""}
                    {date&&!eventStartTime?" · Give us an approx. start time":""}
                    {date&&eventStartTime&&!venueType?" · Pick a venue type":""}
                    {date&&eventStartTime&&venueType&&!city.trim()?" · Add your city":""}
                  </div>}
                </div>
              );
            })()}

            {/* Conversational summary sentence */}
            {(()=>{
              const occName=isCustomOccasion?(customEventName||"your event"):occasion.name;
              const guestStr=guests>0?<span style={{fontWeight:700,color:ink}}>{guests} guests</span>:<span style={{color:"rgba(28,9,0,0.22)"}}>__ guests</span>;
              const dateStr=date?<span style={{fontWeight:700,color:ink}}>{new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>:<span style={{color:"rgba(28,9,0,0.22)"}}>a date</span>;
              const cityStr=city.trim()?<span style={{fontWeight:700,color:ink}}>{city}</span>:<span style={{color:"rgba(28,9,0,0.22)"}}>your city</span>;
              const venueStr=venueType?<span style={{fontWeight:700,color:ink}}>{venueType}</span>:null;
              return(
                <div style={{marginBottom:10,padding:"12px 16px",borderRadius:12,background:"rgba(196,122,46,0.03)",border:"1px solid rgba(196,122,46,0.1)",lineHeight:1.7,fontSize:14,color:muted}}>
                  <span>I'm planning a </span>
                  <span style={{fontWeight:700,color:occAccent}}>{occName}</span>
                  <span> for </span>{guestStr}
                  <span> on </span>{dateStr}
                  {venueStr&&<><span> at a </span>{venueStr}</>}
                  <span> in </span>{cityStr}
                  <span>.</span>
                  {celebrantName&&<span style={{display:"block",fontSize:12,marginTop:3,color:"rgba(28,9,0,0.35)"}}>For {celebrantName} ✦</span>}
                </div>
              );
            })()}

            {/* Who is this for card */}
            {!isCustomOccasion&&(()=>{
              const labels={
                "birthday-party":"Birthday person's name","first-birthday":"Baby's name",
                "anniversary":"Couple's names","baby-shower":"Mom-to-be's name",
                "gender-reveal":"Mom-to-be's name","newborn-welcome":"Baby's name",
                "bachelorette":"Bride-to-be's name","wedding":"Couple's names",
                "graduation":"Graduate's name","farewell":"Person's name",
                "retirement":"Person's name","naming-ceremony":"Baby's name",
                "housewarming":"Host's name","get-together":"Host's name",
              };
              const label=labels[slug]||"Honoree's name";
              const placeholder={
                "anniversary":"e.g. Rahul & Priya","wedding":"e.g. Arjun & Sneha",
                "get-together":"e.g. Dhruv","housewarming":"e.g. Sharma family",
              }[slug]||"e.g. Priya";
              return(
                <div style={{borderRadius:12,background:"#fff",border:`1px solid rgba(28,9,0,0.08)`,marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px"}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:`${occAccent}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:20}}>🎀</div>
                    <div style={{flex:1,minWidth:0,paddingTop:2}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                        <div style={{fontSize:13,fontWeight:700,color:ink}}>Who is this for?</div>
                        <span style={{fontSize:9.5,color:muted,fontWeight:500}}>optional</span>
                      </div>
                      <div style={{fontSize:11.5,color:muted,lineHeight:1.4,marginBottom:9}}>{label} — personalises your plan and messages.</div>
                      <input type="text" value={celebrantName} onChange={e=>setCelebrantName(e.target.value)}
                        placeholder={placeholder}
                        style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${celebrantName?occAccent:`rgba(28,9,0,0.12)`}`,background:celebrantName?`${occAccent}05`:"rgba(28,9,0,0.02)",fontSize:13,fontFamily:font,fontWeight:celebrantName?500:400,color:celebrantName?ink:muted,outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Guest count card */}
            <div style={{borderRadius:12,background:"#fff",border:`1px solid rgba(28,9,0,0.08)`,marginBottom:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px 12px"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:`${occAccent}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:20}}>👥</div>
                <div style={{flex:1,minWidth:0,paddingTop:2}}>
                  <div style={{fontSize:13,fontWeight:700,color:ink,marginBottom:2}}>How many guests?</div>
                  <div style={{fontSize:11.5,color:muted,lineHeight:1.4}}>This helps us suggest the best options for you.</div>
                </div>
                <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:0}}>
                  <button onClick={()=>setGuests(g=>Math.max(1,g-(g<=20?1:5)))}
                    style={{width:36,height:36,borderRadius:"8px 0 0 8px",border:`1px solid rgba(28,9,0,0.12)`,borderRight:"none",background:"rgba(28,9,0,0.03)",color:ink,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
                  <div style={{height:36,minWidth:52,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid rgba(28,9,0,0.12)`,background:"#fff",flexDirection:"column",gap:0}}>
                    <span style={{fontFamily:serif,fontSize:16,fontWeight:700,color:ink,lineHeight:1}}>{guests}</span>
                  </div>
                  <button onClick={()=>setGuests(g=>g+(g<20?1:5))}
                    style={{width:36,height:36,borderRadius:"0 8px 8px 0",border:`1px solid ${occAccent}`,background:occAccent,color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                </div>
              </div>
              <div style={{padding:"0 18px 14px"}}>
                <div style={{fontSize:10.5,fontWeight:600,color:muted,marginBottom:7,letterSpacing:"0.02em"}}>Popular choices:</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {[10,20,30,50,75,100,150].map(n=>(
                    <button key={n} onClick={()=>setGuests(n)}
                      style={{fontSize:12,fontWeight:600,padding:"4px 11px",borderRadius:20,border:`1px solid ${guests===n?occAccent:`rgba(28,9,0,0.12)`}`,background:guests===n?`${occAccent}12`:"transparent",color:guests===n?occAccent:`rgba(28,9,0,0.45)`,cursor:"pointer",fontFamily:font,transition:"all 0.12s"}}>{n}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date card */}
            <div style={{borderRadius:12,background:"#fff",border:`1px solid rgba(28,9,0,0.08)`,marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:`${occAccent}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:20}}>📅</div>
                <div style={{flex:1,minWidth:0,paddingTop:2}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <div style={{fontSize:13,fontWeight:700,color:ink}}>When is your celebration?</div>
                    {!date&&<span style={{fontSize:9,color:muted,fontWeight:600,letterSpacing:"0.04em",background:"rgba(28,9,0,0.05)",padding:"1px 6px",borderRadius:4}}>required</span>}
                    {date&&<span style={{fontSize:9,color:occAccent,fontWeight:700}}>✓ {timeline?.days}d away</span>}
                  </div>
                  <div style={{fontSize:11.5,color:muted,lineHeight:1.4,marginBottom:10}}>Select the date of your event.</div>
                  <div style={{position:"relative",cursor:"pointer"}} onClick={()=>{try{dateInputRef.current?.showPicker?.()}catch{dateInputRef.current?.click()}}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:8,border:`1px solid ${date?occAccent:`rgba(28,9,0,0.12)`}`,background:date?`${occAccent}06`:"rgba(28,9,0,0.02)",transition:"all 0.2s"}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={date?occAccent:"rgba(28,9,0,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span style={{fontSize:13,fontWeight:date?600:400,color:date?ink:muted,flex:1}}>
                        {date?new Date(date+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long",year:"numeric"}):"Pick a date"}
                      </span>
                      {date&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={occAccent} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <input ref={dateInputRef} type="date" value={date}
                      onChange={e=>{
                        const v=e.target.value;
                        const todayStr=new Date().toISOString().split("T")[0];
                        // Defensive clamp — some embedded WebViews (e.g. in-app browsers) don't
                        // reliably enforce the native picker's `min` attribute in their UI.
                        if(v && v<todayStr){ setDate(todayStr); return; }
                        setDate(v);
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Approx start time card — required so the itinerary later can show real times
                instead of a generic placeholder hour */}
            <div style={{borderRadius:12,background:"#fff",border:`1px solid rgba(28,9,0,0.08)`,marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:`${occAccent}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:20}}>🕐</div>
                <div style={{flex:1,minWidth:0,paddingTop:2}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <div style={{fontSize:13,fontWeight:700,color:ink}}>What time will it start?</div>
                    {!eventStartTime&&<span style={{fontSize:9,color:muted,fontWeight:600,letterSpacing:"0.04em",background:"rgba(28,9,0,0.05)",padding:"1px 6px",borderRadius:4}}>required</span>}
                    {eventStartTime&&<span style={{fontSize:9,color:occAccent,fontWeight:700}}>✓ set</span>}
                  </div>
                  <div style={{fontSize:11.5,color:muted,lineHeight:1.4,marginBottom:10}}>Just give us an approx. time — we'll build your itinerary around it.</div>
                  <select value={eventStartTime} onChange={e=>setEventStartTime(e.target.value)}
                    style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${eventStartTime?occAccent:"rgba(28,9,0,0.12)"}`,background:eventStartTime?`${occAccent}06`:"rgba(28,9,0,0.02)",fontSize:13,fontWeight:eventStartTime?600:400,color:eventStartTime?ink:muted,fontFamily:font,cursor:"pointer",appearance:"none",WebkitAppearance:"none"}}>
                    <option value="">Pick an approx. time</option>
                    {EVENT_START_TIME_OPTIONS.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Progressive reveal nudge — visible only until date+guests are set */}
            {!advancedUnlocked&&(
              <div style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",borderRadius:10,background:"rgba(196,122,46,0.05)",border:"1px dashed rgba(196,122,46,0.2)",marginBottom:10}}>
                <span style={{fontSize:14,lineHeight:1}}>💡</span>
                <span style={{fontSize:11.5,color:muted,lineHeight:1.4}}>Set a date and guest count above to unlock venue, budget & recommendation options.</span>
              </div>
            )}

            {/* Venue card */}
            <div style={{opacity:advancedUnlocked?1:0.55,transition:"opacity 0.3s",pointerEvents:advancedUnlocked?"auto":"none"}}>
            <div style={{borderRadius:12,background:"#fff",border:`1px solid rgba(28,9,0,0.08)`,marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px 12px"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:`${occAccent}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:20}}>📍</div>
                <div style={{flex:1,minWidth:0,paddingTop:2}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <div style={{fontSize:13,fontWeight:700,color:ink}}>Where is your celebration?</div>
                    {!venueType&&<span style={{fontSize:9,color:muted,fontWeight:600,background:"rgba(28,9,0,0.05)",padding:"1px 6px",borderRadius:4}}>required</span>}
                    {venueType&&<span style={{fontSize:9,color:occAccent,fontWeight:700}}>✓ {venueType}</span>}
                  </div>
                  <div style={{fontSize:11.5,color:muted,lineHeight:1.4}}>Select the type of venue.</div>
                </div>
              </div>
              <div style={{padding:"0 18px 16px"}}>
                <div className="venue-g" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
                  {VENUE_TYPES.map(v=>{
                    const sel=venueType===v.id;
                    return(
                      <button key={v.id} onClick={()=>{setVenueType(t=>t===v.id?"":v.id);if(venueType===v.id)setVenueProvides([]);}}
                        style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:8,border:`1px solid ${sel?occAccent:`rgba(28,9,0,0.09)`}`,background:sel?`${occAccent}10`:"transparent",cursor:"pointer",fontFamily:font,transition:"all 0.12s",textAlign:"left",minHeight:40}}>
                        <span style={{fontSize:16,flexShrink:0,lineHeight:1}}>{v.icon}</span>
                        <span style={{fontSize:12,fontWeight:sel?600:400,color:sel?occAccent:ink,lineHeight:1.3,flex:1}}>{v.id}</span>
                        {sel&&<svg style={{flexShrink:0}} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={occAccent} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* What does your venue provide — shown only when a venue is selected */}
              {venueType&&(
                <div style={{padding:"12px 18px 16px",borderTop:"1px solid rgba(28,9,0,0.06)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:9}}>
                    <div style={{fontSize:11.5,fontWeight:600,color:muted}}>What does your venue already provide?</div>
                    <span style={{fontSize:9,color:"#DC2626",fontWeight:700,background:"rgba(220,38,38,0.07)",padding:"1px 6px",borderRadius:4}}>required</span>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {/* None option */}
                    {(()=>{
                      const noneSelected=venueProvides.includes("__none__");
                      return(
                        <button onClick={()=>setVenueProvides(noneSelected?[]:["__none__"])}
                          style={{fontSize:12,fontWeight:noneSelected?700:500,color:noneSelected?"#fff":muted,background:noneSelected?occAccent:"rgba(28,9,0,0.04)",border:`1px solid ${noneSelected?occAccent:"rgba(28,9,0,0.1)"}`,borderRadius:100,padding:"5px 13px",cursor:"pointer",fontFamily:font,transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:5}}>
                          {noneSelected&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          None
                        </button>
                      );
                    })()}
                    {["Catering","Decoration","DJ / Sound","Lighting"].map(item=>{
                      const sel=venueProvides.includes(item);
                      return(
                        <button key={item} onClick={()=>setVenueProvides(p=>{const base=p.filter(x=>x!=="__none__");return sel?base.filter(x=>x!==item):[...base,item];})}
                          style={{fontSize:12,fontWeight:sel?700:500,color:sel?"#fff":muted,background:sel?occAccent:"rgba(28,9,0,0.04)",border:`1px solid ${sel?occAccent:"rgba(28,9,0,0.1)"}`,borderRadius:100,padding:"5px 13px",cursor:"pointer",fontFamily:font,transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:5}}>
                          {sel&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          {item}
                        </button>
                      );
                    })}
                    <button onClick={()=>setShowVenueOthersModal(true)}
                      style={{fontSize:12,fontWeight:500,color:occAccent,background:"transparent",border:`1px dashed ${occAccent}60`,borderRadius:100,padding:"5px 13px",cursor:"pointer",fontFamily:font,transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:5}}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Others
                      {venueProvides.filter(p=>!["Catering","Decoration","DJ / Sound","Lighting","__none__"].includes(p)).length>0&&
                        <span style={{fontSize:10,fontWeight:800,color:"#fff",background:occAccent,borderRadius:100,padding:"0px 5px",minWidth:14,textAlign:"center"}}>
                          {venueProvides.filter(p=>!["Catering","Decoration","DJ / Sound","Lighting","__none__"].includes(p)).length}
                        </span>
                      }
                    </button>
                  </div>
                  {venueProvides.length===0&&<div style={{fontSize:10.5,color:"#DC2626",marginTop:8}}>Please select at least one option — or choose "None" if nothing is included.</div>}
                  {venueProvides.filter(p=>p!=="__none__").length>0&&<div style={{fontSize:10.5,color:muted,marginTop:8}}>These will be marked as covered in Services — you can still add them back if upgrading.</div>}
                </div>
              )}
            </div>

            {/* Others modal — full service list */}
            {showVenueOthersModal&&(
              <div onClick={()=>setShowVenueOthersModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
                <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,padding:"20px 20px 28px",width:"100%",maxWidth:480,maxHeight:"75vh",overflowY:"auto",boxSizing:"border-box"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:800,color:ink}}>What else does your venue provide?</div>
                      <div style={{fontSize:11,color:muted,marginTop:2}}>Select anything already included in your booking.</div>
                    </div>
                    <button onClick={()=>setShowVenueOthersModal(false)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:muted,padding:"0 0 0 12px",lineHeight:1}}>×</button>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {ALL_VENDORS.filter(v=>!["Catering","Decoration","DJ / Sound","Lighting"].includes(v)).map(v=>{
                      const sel=venueProvides.includes(v);
                      return(
                        <button key={v} onClick={()=>setVenueProvides(p=>sel?p.filter(x=>x!==v):[...p,v])}
                          style={{fontSize:13,fontWeight:sel?700:500,color:sel?"#fff":ink,background:sel?occAccent:"rgba(28,9,0,0.04)",border:`1.5px solid ${sel?occAccent:"rgba(28,9,0,0.1)"}`,borderRadius:100,padding:"7px 15px",cursor:"pointer",fontFamily:font,transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:6}}>
                          {sel&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          {v}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={()=>setShowVenueOthersModal(false)} style={{marginTop:20,width:"100%",padding:"13px",borderRadius:12,background:occAccent,color:"#fff",fontSize:14,fontWeight:700,border:"none",cursor:"pointer",fontFamily:font}}>
                    Done{venueProvides.length>0?` · ${venueProvides.length} selected`:""}
                  </button>
                </div>
              </div>
            )}

            {/* City card */}
            <div style={{borderRadius:12,background:"#fff",border:`1px solid rgba(28,9,0,0.08)`,marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:`${occAccent}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:20}}>🏙️</div>
                <div style={{flex:1,minWidth:0,paddingTop:2}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <div style={{fontSize:13,fontWeight:700,color:ink}}>In which city?</div>
                    {!city.trim()&&<span style={{fontSize:9,color:muted,fontWeight:600,background:"rgba(28,9,0,0.05)",padding:"1px 6px",borderRadius:4}}>required</span>}
                    {city.trim()&&<span style={{fontSize:9,color:occAccent,fontWeight:700}}>✓ {city}</span>}
                  </div>
                  <div style={{fontSize:11.5,color:muted,lineHeight:1.4,marginBottom:9}}>We'll show vendors near you.</div>
                  <div style={{position:"relative"}}>
                    <input type="text" value={city}
                      onChange={e=>{setCity(e.target.value);setCityDropdownOpen(true);}}
                      onFocus={()=>setCityDropdownOpen(true)}
                      onBlur={()=>setTimeout(()=>setCityDropdownOpen(false),150)}
                      placeholder="Search for your city…"
                      style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${city?occAccent:`rgba(28,9,0,0.12)`}`,background:city?`${occAccent}05`:"rgba(28,9,0,0.02)",fontSize:13,fontFamily:font,fontWeight:city?500:400,color:city?ink:muted,outline:"none",boxSizing:"border-box"}}/>
                    {cityDropdownOpen&&(()=>{
                      const q=city.trim().toLowerCase();
                      const matches=ALL_INDIAN_CITIES.filter(c=>c.toLowerCase().includes(q)).slice(0,30);
                      if(!matches.length) return null;
                      return(
                        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:20,background:"#fff",borderRadius:10,border:"1px solid rgba(28,9,0,0.1)",boxShadow:"0 10px 30px rgba(0,0,0,0.12)",maxHeight:240,overflowY:"auto"}}>
                          {matches.map(c=>{
                            const serviced=SERVICED_CITIES.includes(c);
                            return(
                              <button key={c}
                                onMouseDown={e=>e.preventDefault()}
                                onClick={()=>{setCity(c);setCityDropdownOpen(false);}}
                                style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"9px 12px",border:"none",background:c===city?`${occAccent}10`:"#fff",cursor:"pointer",fontFamily:font,fontSize:12.5,color:ink,textAlign:"left"}}>
                                <span>{c}</span>
                                {serviced&&<span style={{fontSize:9,fontWeight:700,color:"#16a34a",background:"rgba(34,197,94,0.1)",borderRadius:100,padding:"2px 7px",flexShrink:0}}>Vendors here</span>}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                  <div style={{marginTop:7,padding:"7px 10px",borderRadius:7,background:"rgba(196,122,46,0.04)",border:"1px solid rgba(196,122,46,0.1)",fontSize:10.5,color:muted,lineHeight:1.5}}>
                    📍 We currently have vendors in <span style={{fontWeight:700,color:ink}}>Delhi, Noida, Ghaziabad & Greater Noida</span>. From other cities? You can still plan — we'll coordinate for you.
                  </div>
                </div>
              </div>
            </div>

            {/* Budget card */}
            {(()=>{
              const lo=occasion.budgetMin||5000;
              const hi=occasion.budgetMax||200000;
              const mid=Math.round((lo+hi)/2);
              // Four chips: under lo, lo–mid, mid–hi, over hi
              const chips=[
                {label:`Under ₹${fmtNum(lo)}`,val:String(lo-1)},
                {label:`₹${fmtNum(lo)}–${fmtNum(mid)}`,val:String(mid)},
                {label:`₹${fmtNum(mid)}–${fmtNum(hi)}`,val:String(hi)},
                {label:`₹${fmtNum(hi)}+`,val:String(hi+1)},
              ];
              return(
                <div style={{borderRadius:12,background:"#fff",border:`1px solid rgba(28,9,0,0.08)`,marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px 12px"}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:`${occAccent}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:20}}>₹</div>
                    <div style={{flex:1,minWidth:0,paddingTop:2}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                        <div style={{fontSize:13,fontWeight:700,color:ink}}>Budget</div>
                        <span style={{fontSize:9.5,color:muted,fontWeight:500}}>optional</span>
                      </div>
                      <div style={{fontSize:11.5,color:muted,lineHeight:1.4,marginBottom:9}}>Typical for this occasion: ₹{fmtNum(lo)}–₹{fmtNum(hi)}</div>
                      <input type="number" value={budget} onChange={e=>setBudget(e.target.value)}
                        placeholder={String(mid)}
                        style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${budget?occAccent:`rgba(28,9,0,0.12)`}`,background:budget?`${occAccent}05`:"rgba(28,9,0,0.02)",fontSize:13,fontFamily:font,fontWeight:budget?500:400,color:budget?ink:muted,outline:"none",boxSizing:"border-box"}}/>
                      <button onClick={()=>openPriceEstimator({occasion:occasion.name,onFinalise:(avg)=>setBudget(String(avg))})}
                        style={{background:"none",border:"none",padding:0,marginTop:6,fontSize:11,fontWeight:700,color:occAccent,cursor:"pointer",fontFamily:font,textDecoration:"underline"}}>
                        Not sure? Try the Price Estimator →
                      </button>
                    </div>
                  </div>
                  <div style={{padding:"0 18px 14px"}}>
                    <div style={{fontSize:10.5,fontWeight:600,color:muted,marginBottom:7,letterSpacing:"0.02em"}}>Quick pick:</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {chips.map(c=>{
                        const sel=budget===c.val;
                        return(
                          <button key={c.val} onClick={()=>setBudget(b=>b===c.val?"":c.val)}
                            style={{fontSize:11.5,fontWeight:600,padding:"5px 11px",borderRadius:20,border:`1px solid ${sel?occAccent:`rgba(28,9,0,0.12)`}`,background:sel?`${occAccent}12`:"transparent",color:sel?occAccent:`rgba(28,9,0,0.45)`,cursor:"pointer",fontFamily:font,transition:"all 0.12s"}}>{c.label}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Who's coming card */}
            <div style={{borderRadius:12,background:"#fff",border:`1px solid rgba(28,9,0,0.08)`,marginBottom:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px 12px"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:`${occAccent}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:20}}>🎈</div>
                <div style={{flex:1,minWidth:0,paddingTop:2}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <div style={{fontSize:13,fontWeight:700,color:ink}}>Who's coming?</div>
                    <span style={{fontSize:9.5,color:muted,fontWeight:500}}>optional</span>
                  </div>
                  <div style={{fontSize:11.5,color:muted,lineHeight:1.4}}>Select all age groups that apply.</div>
                </div>
              </div>
              <div style={{padding:"0 18px 16px"}}>
                <div className="age-g" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                  {AGE_GROUPS.map(ag=>{
                    const sel=ageGroups.includes(ag.id);
                    return(
                      <button key={ag.id} onClick={()=>toggleAge(ag.id)}
                        style={{padding:"10px 6px",borderRadius:8,border:`1px solid ${sel?occAccent:`rgba(28,9,0,0.09)`}`,background:sel?`${occAccent}10`:"transparent",cursor:"pointer",textAlign:"center",transition:"all 0.12s",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <span style={{fontSize:20}}>{ag.icon}</span>
                        <div style={{fontSize:11,fontWeight:sel?700:400,color:sel?occAccent:ink,lineHeight:1.2}}>{ag.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notes card */}
            <div style={{borderRadius:12,background:"#fff",border:`1px solid rgba(28,9,0,0.08)`,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:`${occAccent}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:20}}>📝</div>
                <div style={{flex:1,minWidth:0,paddingTop:2}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <div style={{fontSize:13,fontWeight:700,color:ink}}>Any special notes?</div>
                    <span style={{fontSize:9.5,color:muted,fontWeight:500}}>optional</span>
                  </div>
                  <div style={{fontSize:11.5,color:muted,lineHeight:1.4,marginBottom:9}}>Tell us about themes, dietary needs, surprises…</div>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                    placeholder="e.g. it's a surprise party, guests are mostly family, prefer vegetarian food…"
                    rows={3}
                    style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${notes?occAccent:`rgba(28,9,0,0.12)`}`,background:notes?`${occAccent}05`:"rgba(28,9,0,0.02)",fontSize:13,fontFamily:font,color:ink,outline:"none",resize:"none",lineHeight:1.55,boxSizing:"border-box"}}/>
                  {notesKeywords.length>0&&(
                    <div style={{display:"flex",alignItems:"flex-start",gap:7,marginTop:8,padding:"8px 10px",borderRadius:8,background:"rgba(196,122,46,0.05)",border:"1px solid rgba(196,122,46,0.15)"}}>
                      <svg style={{flexShrink:0,marginTop:1}} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                      <div style={{flex:1,minWidth:0}}>
                        <span style={{fontSize:10.5,color:muted}}>We noticed </span>
                        {notesKeywords.map((v,i)=><span key={v} style={{fontSize:10.5,fontWeight:700,color:gold}}>{i>0?", ":""}{v}</span>)}
                        <span style={{fontSize:10.5,color:muted}}> — we'll suggest {notesKeywords.length===1?"this":"these"} in the </span>
                        <span style={{fontSize:10.5,fontWeight:700,color:gold}}>Services tab →</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>{/* end progressive wrapper */}

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

            {/* Venue photo analyser CTA */}
            <button onClick={()=>setDecorAnalyserOpen(true)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:12,border:"1.5px solid rgba(196,122,46,0.25)",background:"rgba(196,122,46,0.04)",cursor:"pointer",width:"100%",marginBottom:20,fontFamily:font,textAlign:"left"}}>
              <span style={{fontSize:20,flexShrink:0}}>📷</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:ink}}>Analyse your venue</div>
                <div style={{fontSize:11.5,color:muted,marginTop:1}}>Upload a photo — AI will suggest decoration zones, colours & ideas</div>
              </div>
              <span style={{color:gold,fontSize:14,flexShrink:0}}>→</span>
            </button>

            {/* Decor analyser modal */}
            {decorAnalyserOpen&&(
              <div style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(28,9,0,0.65)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
                onClick={e=>{if(e.target===e.currentTarget)setDecorAnalyserOpen(false);}}>
                <div style={{width:"100%",maxWidth:640,background:"#FFFCF5",borderRadius:"20px 20px 0 0",padding:"20px 18px 32px",maxHeight:"93dvh",overflowY:"auto",fontFamily:font}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                    <div>
                      <div style={{fontSize:10.5,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.12em"}}>AI Tool</div>
                      <div style={{fontSize:18,fontWeight:800,color:ink,marginTop:2}}>Venue Decor Analyser</div>
                    </div>
                    <button onClick={()=>setDecorAnalyserOpen(false)}
                      style={{width:32,height:32,borderRadius:"50%",border:"1.5px solid rgba(196,122,46,0.25)",background:"#fff",cursor:"pointer",fontSize:16,color:"#9B7450",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font}}>×</button>
                  </div>
                  <DecorAnalyzer onClose={()=>setDecorAnalyserOpen(false)} initialEventType={occasion?.name||""} compact onAnalysisComplete={handleVenueAnalysisDone} />
                </div>
              </div>
            )}

            {/* ── Venue analysis result banner ── */}
            {venueAnalysis&&(
              <div style={{borderRadius:14,border:"1.5px solid rgba(196,122,46,0.25)",background:"linear-gradient(135deg,rgba(196,122,46,0.06),rgba(196,122,46,0.02))",padding:"14px",marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em"}}>Your venue · AI analysis</div>
                    <div style={{fontSize:14,fontWeight:800,color:ink,marginTop:2}}>{venueAnalysis.spaceType} — {venueAnalysis.style}</div>
                  </div>
                  <button onClick={()=>setVenueAnalysis(null)} style={{background:"none",border:"none",fontSize:16,color:muted,cursor:"pointer",padding:4}}>×</button>
                </div>
                {/* Colour palette */}
                {venueAnalysis.colorPalette?.length>0&&(
                  <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}>
                    {venueAnalysis.colorPalette.map((c,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:5,background:"#fff",borderRadius:8,padding:"4px 9px",border:"1px solid rgba(196,122,46,0.12)"}}>
                        <div style={{width:14,height:14,borderRadius:3,background:c.hex,border:"1.5px solid rgba(0,0,0,0.1)",flexShrink:0}}/>
                        <span style={{fontSize:11,fontWeight:600,color:ink}}>{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Top picks from analysis */}
                {venueAnalysis.topPicks?.length>0&&(
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
                    {venueAnalysis.topPicks.slice(0,3).map((p,i)=>(
                      <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:12}}>
                        <span style={{color:gold,fontSize:10,marginTop:1,flexShrink:0}}>★</span>
                        <div><span style={{fontWeight:700,color:ink}}>{p.title}</span>{p.cost&&<span style={{color:muted,marginLeft:6}}>· {p.cost}</span>}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{fontSize:11,color:gold,fontWeight:700}}>✓ Decor items auto-suggested when you pick Decorator in Services</div>
                  <button onClick={()=>setDecorAnalyserOpen(true)} style={{fontSize:11,fontWeight:600,color:muted,background:"none",border:"none",cursor:"pointer",fontFamily:font,textDecoration:"underline",padding:0}}>Re-analyse</button>
                </div>
              </div>
            )}

            {renderThemeGallery()}
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

            {/* ── Smart booking tips ── */}
            {(()=>{
              const tips=[];
              const occ=occasion.id||"";
              const venue=(venueType||"").toLowerCase();
              if(occ==="baby-shower"||occ==="gender-reveal"||occ==="newborn-welcome"){
                tips.push({icon:"💄",text:"Makeup Artist for the mom-to-be — a staple at every Godh Bharai."});
                tips.push({icon:"🎂",text:"Cake Artist matching your décor theme makes the cutting moment iconic."});
                tips.push({icon:"✍️",text:"Mehendi stall — guests love carrying a beautiful design home."});
              } else if(occ==="birthday-party"||occ==="first-birthday"){
                tips.push({icon:"📸",text:"Photographer + Videographer together — reels have 3× more memories than photos alone."});
                tips.push({icon:"🎈",text:"Balloon Artist keeps kids entertained while adults settle in."});
                tips.push({icon:"🎂",text:"Cake Artist for a theme-matched cake — the most-photographed moment of any birthday."});
              } else if(occ==="anniversary"){
                tips.push({icon:"🎵",text:"Live Band or Sufi ensemble — background music elevates the entire mood."});
                tips.push({icon:"🎙️",text:"Emcee / Anchor for speeches and couple games — keeps the evening flowing."});
                tips.push({icon:"💐",text:"Florist for table centrepieces — makes a big visual difference in a banquet or garden."});
              } else if(occ==="office-party"){
                tips.push({icon:"🎤",text:"Corporate Emcee — awards nights without an anchor feel flat."});
                tips.push({icon:"📽️",text:"AV Setup for presentations and awards — non-negotiable for large venues."});
                tips.push({icon:"📸",text:"Photo Booth — team candids are better engagement than posed group photos."});
              } else if(occ==="housewarming"||occ==="get-together"){
                tips.push({icon:"🍽️",text:"Caterer with live counters — chaat or mocktail bar gets guests mingling fast."});
                tips.push({icon:"📸",text:"A Photographer for 2 hours captures the key moments without feeling formal."});
                tips.push({icon:"🌿",text:"Florist for entrance and table arrangements — sets the vibe from the door."});
              } else {
                tips.push({icon:"📸",text:"A Photographer is worth it — memories fade, photos don't."});
                tips.push({icon:"🎂",text:"A themed cake elevates the occasion and photographs beautifully."});
                tips.push({icon:"🎙️",text:"An Emcee keeps the event flowing and guests engaged."});
              }
              if(venue.includes("banquet")||venue.includes("hall")){
                // Replace 3rd tip with banquet-specific advice
                tips[2]={icon:"🔊",text:"Sound System check before guests arrive — banquet halls need proper setup."};
              }
              if(!tips.length) return null;
              return(
                <div style={{marginBottom:20,borderRadius:12,background:"rgba(196,122,46,0.04)",border:"1px solid rgba(196,122,46,0.12)",padding:"12px 14px"}}>
                  <div style={{fontSize:9.5,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Smart booking tips</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {tips.map((t,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                        <span style={{fontSize:16,flexShrink:0,lineHeight:1.3}}>{t.icon}</span>
                        <span style={{fontSize:12,color:ink,lineHeight:1.5}}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── From your notes: detected vendor suggestions ── */}
            {notesKeywords.length>0&&(
              <div style={{marginBottom:16,padding:"10px 13px",borderRadius:10,background:"rgba(196,122,46,0.05)",border:"1px solid rgba(196,122,46,0.15)"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  <span style={{fontSize:9.5,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.12em"}}>From your notes</span>
                  <span style={{fontSize:9,color:muted,fontWeight:500}}>· Step 1</span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {notesKeywords.map(v=>{
                    const sel=vendors.includes(v);
                    return(
                      <button key={v} onClick={()=>!sel&&toggleVendor(v)}
                        style={{fontSize:12,fontWeight:700,color:sel?gold:ink,background:sel?`rgba(${goldRgb},0.12)`:"rgba(28,9,0,0.04)",border:`1px solid ${sel?`rgba(${goldRgb},0.35)`:"rgba(28,9,0,0.1)"}`,borderRadius:100,padding:"4px 11px",cursor:sel?"default":"pointer",fontFamily:font,display:"inline-flex",alignItems:"center",gap:5}}>
                        {sel?<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>:<span>+</span>}
                        {v}
                      </button>
                    );
                  })}
                </div>
                <div style={{fontSize:10.5,color:muted,marginTop:7}}>Tap any to add it to your plan.</div>
              </div>
            )}

            {/* ── Service picker — 3 tiers ── */}
            {(()=>{
              const essential=occasion.vendorCategories||[];
              const recOnly=[...recommended].filter(v=>!essential.includes(v));
              const addOns=ALL_VENDORS.filter(v=>!essential.includes(v)&&!recOnly.includes(v));
              const tierLabel=(label,color,sub)=>(
                <div style={{marginBottom:8,marginTop:4}}>
                  <span style={{fontSize:10,fontWeight:800,color,textTransform:"uppercase",letterSpacing:"0.13em"}}>{label}</span>
                  {sub&&<span style={{fontSize:10,fontWeight:500,color:"rgba(28,9,0,0.35)",marginLeft:7}}>{sub}</span>}
                </div>
              );
              // Normalise venueProvides vendor names to match ALL_VENDORS keys
              // e.g. "DJ / Sound" → "DJ", "Decoration" → "Decorator"
              const VP_MAP={"DJ / Sound":"DJ","Decoration":"Decorator","Lighting":"Lighting Setup"};
              const venueCovers=venueProvides.filter(p=>p!=="__none__").map(p=>VP_MAP[p]||p);
              // Image-led card — same visual pattern as renderThemeGallery()/the gift-card
              // grid: height:120 image block, gold selected border+checkmark, content strip below.
              const serviceCard=(v,size="large")=>{
                const sel=vendors.includes(v);
                const byVenue=venueCovers.includes(v);
                if(byVenue) return null;
                const isRec=recommended.has(v);
                const info=SERVICE_CARD_INFO[v]||{};
                const isSmall=size==="small";
                const imgH=isSmall?46:112;
                return(
                  <div key={v} id={`chip-${v}`}
                    style={{padding:0,borderRadius:isSmall?11:14,overflow:"hidden",border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.13)"}`,background:"#fff",transition:"all 0.18s",boxShadow:sel?"0 3px 14px rgba(196,122,46,0.2)":"0 1px 4px rgba(0,0,0,0.05)"}}>
                    <button onClick={()=>{toggleVendor(v);const el=document.getElementById(`chip-${v}`);if(el){el.classList.remove("chip-pop");void el.offsetWidth;el.classList.add("chip-pop");}}}
                      style={{display:"block",width:"100%",padding:0,border:"none",background:"none",cursor:"pointer",textAlign:"left",fontFamily:font}}>
                      <div style={{position:"relative",height:imgH,overflow:"hidden",background:"linear-gradient(160deg,rgba(196,122,46,0.4),rgba(196,122,46,0.15))"}}>
                        {!isSmall&&info.props&&(
                          <div style={{position:"absolute",inset:0}}>
                            <span style={{position:"absolute",top:"10%",left:"8%",fontSize:12,opacity:0.4,transform:"rotate(-10deg)"}}>{info.props[0]}</span>
                            <span style={{position:"absolute",top:"14%",right:"10%",fontSize:10,opacity:0.32,transform:"rotate(8deg)"}}>{info.props[1]}</span>
                          </div>
                        )}
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:isSmall?15:27}}>{info.emoji||"🎉"}</span>
                        </div>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 55%)"}}/>
                        <div style={{position:"absolute",bottom:isSmall?4:8,left:isSmall?5:11,right:isSmall?5:30}}>
                          <span style={{fontSize:isSmall?8.5:13.5,fontWeight:800,color:"#fff",lineHeight:1.2,textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{v}</span>
                        </div>
                        {sel
                          ? <div style={{position:"absolute",top:4,right:4,width:isSmall?12:20,height:isSmall?12:20,borderRadius:"50%",background:gold,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
                              <svg width={isSmall?5:9} height={isSmall?5:9} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          : isRec&&<div style={{position:"absolute",top:4,right:4,fontSize:isSmall?6:8.5,fontWeight:800,color:"#fff",background:gold,borderRadius:100,padding:isSmall?"1px 3px":"2px 5px",boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}>✦</div>
                        }
                      </div>
                      {!isSmall&&info.description&&(
                        <div style={{padding:"9px 12px 11px"}}>
                          <div style={{fontSize:12,color:muted,lineHeight:1.4}}>{info.description}</div>
                        </div>
                      )}
                    </button>
                  </div>
                );
              };
              const byVenueTier=ALL_VENDORS.filter(v=>venueCovers.includes(v));
              return(
                <div style={{marginBottom:16}}>
                  {essential.length>0&&(
                    <div style={{background:"rgba(146,64,14,0.04)",border:"1px solid rgba(146,64,14,0.1)",borderRadius:12,padding:"12px 14px",marginBottom:14}}>
                      {tierLabel(city.trim()?`Every ${occasion.name} in ${city} books these`:"Every event books these","#92400E")}
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>{essential.filter(v=>ALL_VENDORS.includes(v)).map(v=>serviceCard(v,"large"))}</div>
                    </div>
                  )}
                  {recOnly.length>0&&<>{tierLabel(`Most people add these${city.trim()?` · ${city}`:""}`,gold,"Based on your venue, guests & theme")}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:14}}>{recOnly.filter(v=>ALL_VENDORS.includes(v)).map(v=>serviceCard(v,"small"))}</div></>}
                  {addOns.length>0&&<>{tierLabel("Nice to have","rgba(28,9,0,0.4)","Browse extras — add anything that fits")}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:14}}>
                    {addOns.filter(v=>!venueCovers.includes(v)).map(v=>serviceCard(v,"small"))}
                    <button onClick={()=>setShowCustomVendorInput(v=>!v)}
                      style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,minHeight:46,borderRadius:11,border:`1.5px dashed ${showCustomVendorInput?"rgba(196,122,46,0.5)":"rgba(196,122,46,0.28)"}`,background:showCustomVendorInput?"rgba(196,122,46,0.06)":"#fff",color:"rgba(196,122,46,0.7)",fontSize:8.5,fontWeight:600,cursor:"pointer",fontFamily:font,transition:"all 0.18s",letterSpacing:"-0.01em"}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Add other
                    </button>
                  </div></>}
                  {byVenueTier.length>0&&(
                    <>
                      {tierLabel("By your venue","rgba(28,9,0,0.28)","Already included in your venue booking")}
                      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                        {byVenueTier.map(v=>(
                          <div key={v}
                            style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 13px",borderRadius:10,border:"1px solid rgba(28,9,0,0.08)",background:"rgba(28,9,0,0.03)",color:"rgba(28,9,0,0.4)",fontSize:12.5,fontWeight:600,fontFamily:font}}>
                            <span>{v}</span>
                            <span style={{fontSize:10,fontWeight:700,color:"rgba(28,9,0,0.3)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Included</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
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

            {/* ── Live performance prompt ── */}
            {vendors.length > 0 && !occPerfSkipped && (() => {
              const openOccPerfModal = async () => {
                setShowOccPerfModal(true);
                if (occAvailPerfs !== null) return;
                setOccPerfLoading(true);
                try {
                  const cached = (() => { try { const r = sessionStorage.getItem('tendr_perf_avail_v1'); return r ? JSON.parse(r) : null; } catch { return null; } })();
                  if (cached) {
                    setOccAvailPerfs(PERFORMER_TYPES.filter(p => cached.includes(p.type)));
                  } else {
                    const results = await Promise.all(
                      PERFORMER_TYPES.map(p =>
                        getVendors({ serviceTypes: [p.type], limit: 1 })
                          .then(r => ({ type: p.type, has: (r?.vendors || []).length > 0 }))
                          .catch(() => ({ type: p.type, has: false }))
                      )
                    );
                    const avail = results.filter(r => r.has).map(r => r.type);
                    try { sessionStorage.setItem('tendr_perf_avail_v1', JSON.stringify(avail)); } catch {}
                    setOccAvailPerfs(PERFORMER_TYPES.filter(p => avail.includes(p.type)));
                  }
                } finally {
                  setOccPerfLoading(false);
                }
              };
              if (occSelectedPerf) {
                return (
                  <div style={{ borderRadius: 14, border: `1.5px solid ${gold}`, background: "linear-gradient(135deg,rgba(196,122,46,0.07),rgba(204,171,74,0.05))", padding: "14px 16px", fontFamily: font, display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{occSelectedPerf.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: ink, marginBottom: 2 }}>{occSelectedPerf.label} added</div>
                      <div style={{ fontSize: 11.5, color: muted, lineHeight: 1.4 }}>
                        We'll recommend the best {occSelectedPerf.label.toLowerCase()} for your event.
                        <button onClick={() => { setOccSelectedPerf(null); dispatch(setSelectedPerformer(null)); }} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: gold, fontSize: 11.5, fontWeight: 700, padding: 0, fontFamily: font }}>Change →</button>
                      </div>
                    </div>
                    <button onClick={() => { setOccSelectedPerf(null); dispatch(setSelectedPerformer(null)); setOccPerfSkipped(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: muted, fontSize: 16, padding: 4, lineHeight: 1 }}>✕</button>
                  </div>
                );
              }
              return (
                <div style={{ borderRadius: 14, border: `1.5px solid ${border}`, background: "#fff", padding: "14px 16px", fontFamily: font, display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>🎤</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: ink, marginBottom: 3 }}>Want live performance?</div>
                    <div style={{ fontSize: 11.5, color: muted, marginBottom: 10, lineHeight: 1.4 }}>Add a singer, live band, anchor, choreographer and more.</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={openOccPerfModal} style={{ padding: "7px 14px", borderRadius: 10, background: `linear-gradient(135deg,${gold},#CCAB4A)`, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Yes, show options</button>
                      <button onClick={() => setOccPerfSkipped(true)} style={{ padding: "7px 12px", borderRadius: 10, border: `1.5px solid ${border}`, background: "#fff", color: muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Not now</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Performer picker modal for OccasionDetail */}
            {showOccPerfModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
                onClick={() => setShowOccPerfModal(false)}>
                <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, padding: "28px 24px", maxWidth: 460, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.22)", fontFamily: font }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: ink }}>Live Performance</div>
                      <div style={{ fontSize: 12.5, color: muted, marginTop: 3 }}>Select what kind you'd like for your event</div>
                    </div>
                    <button onClick={() => setShowOccPerfModal(false)} style={{ background: "rgba(196,122,46,0.08)", border: "none", cursor: "pointer", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: muted, flexShrink: 0 }}>✕</button>
                  </div>
                  {occPerfLoading ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: muted }}>Checking availability…</div>
                  ) : !occAvailPerfs || occAvailPerfs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: muted }}>No performers available right now.</div>
                  ) : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                        {occAvailPerfs.map(p => (
                          <button key={p.type}
                            onClick={() => { setOccSelectedPerf(p); dispatch(setSelectedPerformer(p)); setShowOccPerfModal(false); }}
                            style={{ padding: "15px 6px", borderRadius: 14, border: `1.5px solid ${border}`, background: "#FDFAF5", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${gold}`; e.currentTarget.style.background = "rgba(196,122,46,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.border = `1.5px solid ${border}`; e.currentTarget.style.background = "#FDFAF5"; e.currentTarget.style.transform = ""; }}>
                            <span style={{ fontSize: 26 }}>{p.emoji}</span>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: ink, textAlign: "center", lineHeight: 1.3 }}>{p.label}</span>
                          </button>
                        ))}
                      </div>
                      <p style={{ fontSize: 11.5, color: "#B8956A", textAlign: "center", margin: 0, lineHeight: 1.4 }}>We'll share the best options for your event.</p>
                    </>
                  )}
                </div>
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
                    const cOpts=getCateringOptions(occasion,{guests,venueType,ageGroups,budget,theme});
                    const isCustom=chosen==="custom";
                    const hasCustomDishes=Object.values(customCatering.dishes).some(arr=>arr.length>0);
                    const isOpen=expandedVendor==="Caterer";
                    const chosenLabel=chosen==="custom"?(hasCustomDishes?`Custom · ${Object.values(customCatering.dishes).flat().length} dishes`:"Custom menu"):typeof chosen==="number"?cOpts[chosen]?.style:null;
                    return(
                      <div key={v} style={{marginBottom:10,borderRadius:14,border:`1.5px solid ${chosen!==undefined?gold:isOpen?"rgba(196,122,46,0.4)":border}`,background:"#fff",overflow:"hidden",transition:"border-color 0.2s"}}>
                        {/* header — clickable to expand */}
                        <div onClick={()=>setExpandedVendor(ev=>ev==="Caterer"?null:"Caterer")}
                          style={{padding:"12px 14px",background:chosen!==undefined?`rgba(${goldRgb},0.04)`:"#fff",display:"flex",alignItems:"center",cursor:"pointer",gap:10}}>
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
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            {cOpts.map((opt,oi)=>{
                              const sel=chosen===oi;
                              const paragraph=buildCateringParagraph(opt,{occasionName:occasion.name,guests,venueType});
                              return(
                                <button key={oi} onClick={()=>{setVendorPackages(vp=>({...vp,Caterer:oi}));setShowCateringBuilder(false);}}
                                  style={{textAlign:"left",padding:"13px 14px",borderRadius:12,border:`1.5px solid ${sel?gold:opt.popular?"rgba(34,197,94,0.3)":"rgba(196,122,46,0.14)"}`,background:sel?`rgba(${goldRgb},0.07)`:"#FAFAF8",cursor:"pointer",fontFamily:font,transition:"all 0.18s",display:"flex",flexDirection:"column",gap:7}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                                    <span style={{fontSize:19,flexShrink:0}}>{opt.icon}</span>
                                    <span style={{fontSize:14.5,fontWeight:700,color:sel?gold:ink,flex:1,minWidth:80}}>{opt.style}</span>
                                    {opt.tier&&<span style={{fontSize:10,fontWeight:700,color:opt.tier==="Premium"?"#7C3AED":opt.tier==="Mid-range"?gold:"#16a34a",background:opt.tier==="Premium"?"rgba(124,58,237,0.08)":opt.tier==="Mid-range"?"rgba(196,122,46,0.08)":"rgba(22,163,74,0.08)",borderRadius:100,padding:"2px 8px",flexShrink:0}}>{opt.tier}</span>}
                                    {opt.popular&&!sel&&<span style={{fontSize:9,fontWeight:800,color:gold,background:"rgba(196,122,46,0.12)",borderRadius:100,padding:"2px 7px",flexShrink:0}}>Recommended</span>}
                                    {sel&&<span style={{fontSize:9,fontWeight:800,color:gold,background:"rgba(196,122,46,0.12)",borderRadius:100,padding:"2px 7px",flexShrink:0}}>✓ Selected</span>}
                                  </div>
                                  <div style={{fontSize:13.5,color:sel?"#4A2810":muted,lineHeight:1.65}}>{paragraph}</div>
                                  {sel&&(
                                    <div style={{marginTop:2,paddingTop:10,borderTop:"1px solid rgba(196,122,46,0.14)",display:"flex",flexDirection:"column",gap:5}}>
                                      <div style={{fontSize:10.5,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>What's included</div>
                                      {opt.dishes.map((d,di)=>(
                                        <div key={di} style={{fontSize:13,color:ink,lineHeight:1.55,display:"flex",alignItems:"flex-start",gap:6}}>
                                          <span style={{flexShrink:0,color:gold}}>·</span><span>{d}</span>
                                        </div>
                                      ))}
                                      <button onClick={e=>{e.stopPropagation();setShowCateringBuilder(b=>!b);setCateringBuilderStep("cuisine");}}
                                        style={{marginTop:4,alignSelf:"flex-start",fontSize:11,fontWeight:700,color:gold,background:"rgba(196,122,46,0.08)",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:8,padding:"5px 11px",cursor:"pointer",fontFamily:font,textAlign:"center"}}>
                                        ✏️ Edit dishes
                                      </button>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {typeof chosen==="number"&&renderCrossSell("Caterer")}
                        </div>

                        {/* Suggested food items */}
                        {(()=>{
                          const suggestions=SUGGESTED_FOOD[occasion.id]||SUGGESTED_FOOD.default;
                          return(
                            <div style={{padding:"8px 14px 4px",borderTop:`1px solid rgba(196,122,46,0.06)`}}>
                              <div style={{fontSize:9,fontWeight:800,color:"rgba(196,122,46,0.45)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>Suggested dishes — tap to add</div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                                {suggestions.map(item=>{
                                  const isSel=suggestedFood.includes(item);
                                  return(
                                    <button key={item}
                                      onClick={()=>setSuggestedFood(prev=>isSel?prev.filter(x=>x!==item):[...prev,item])}
                                      style={{padding:"5px 12px",borderRadius:100,border:`1.5px solid ${isSel?gold:"rgba(196,122,46,0.18)"}`,background:isSel?"rgba(196,122,46,0.1)":"transparent",color:isSel?gold:ink,fontSize:12,fontWeight:isSel?700:400,cursor:"pointer",fontFamily:font,transition:"all 0.15s",minHeight:30}}>
                                      {item}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

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
                                        style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.15)"}`,background:sel?`rgba(${goldRgb},0.07)`:"#fff",cursor:"pointer",fontFamily:font,transition:"all 0.15s",minHeight:44}}>
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
                          style={{padding:"12px 14px",background:chosen!==undefined?`rgba(${goldRgb},0.04)`:"#fff",display:"flex",alignItems:"center",cursor:"pointer",gap:10}}>
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

                          {/* Ask venue type inline — only if it hasn't been set yet, since the
                              paragraph below reads better once we know where this is happening */}
                          {!venueType&&(
                            <div style={{marginBottom:10,padding:"9px 11px",borderRadius:10,background:"rgba(196,122,46,0.05)",border:"1px dashed rgba(196,122,46,0.25)"}}>
                              <div style={{fontSize:10.5,fontWeight:700,color:ink,marginBottom:6,lineHeight:1.4}}>
                                Quick question — where's this happening? <span style={{fontWeight:500,color:muted}}>(so we can describe the setup accurately)</span>
                              </div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                                {VENUE_TYPES.map(v=>(
                                  <button key={v.id} onClick={()=>setVenueType(v.id)}
                                    style={{fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:100,border:"1.5px solid rgba(196,122,46,0.25)",background:"#fff",color:ink,cursor:"pointer",fontFamily:font,display:"flex",alignItems:"center",gap:4}}>
                                    {v.icon} {v.id}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Decor Analyser CTA — moved above the focus-area picker so an
                              analysed photo can influence which areas get suggested below. */}
                          <div style={{marginBottom:16}}>
                            <button onClick={()=>setDecorAnalyserOpen(true)}
                              style={{display:"flex",alignItems:"center",gap:9,padding:"11px 13px",borderRadius:11,border:`1.5px solid ${venueAnalysis?"rgba(34,197,94,0.35)":"rgba(196,122,46,0.25)"}`,background:venueAnalysis?"rgba(34,197,94,0.05)":"rgba(196,122,46,0.04)",cursor:"pointer",width:"100%",fontFamily:font,textAlign:"left"}}>
                              <span style={{fontSize:19,flexShrink:0}}>{venueAnalysis?"✅":"📷"}</span>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:13,fontWeight:700,color:ink}}>{venueAnalysis?"Venue analysed — tap to re-analyse":"Analyse your venue with AI"}</div>
                                <div style={{fontSize:11.5,color:muted,marginTop:1}}>{venueAnalysis?`${venueAnalysis.spaceType} · ${venueAnalysis.style}`:"Upload a photo — get decor zones, colours & package recs"}</div>
                              </div>
                              <span style={{color:venueAnalysis?"#16a34a":gold,fontSize:13,flexShrink:0,fontWeight:700}}>{venueAnalysis?"✓":"→"}</span>
                            </button>
                          </div>

                          {/* Which places need decor? — 8 focus areas, suggested ones shown first */}
                          {(()=>{
                            const suggested=getSuggestedDecorFocusAreas(occasion,{venueType,guests,matchedAreas:venueAnalysis?Object.keys(matchDecorFromAnalysis(venueAnalysis)):[]});
                            const orderedAreaIds=[...DECOR_FOCUS_AREA_IDS].sort((a,b)=>(suggested.includes(b)?1:0)-(suggested.includes(a)?1:0));
                            const toggleArea=id=>setDecorFocusAreas(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
                            return(
                              <div style={{marginBottom:16}}>
                                <div style={{fontSize:10.5,fontWeight:800,color:"rgba(196,122,46,0.5)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3}}>Which places need decor?</div>
                                <div style={{fontSize:12.5,color:muted,marginBottom:10,lineHeight:1.5}}>Pick the areas you want styled — we'll shape your packages around them.</div>

                                {suggested.length>0&&(
                                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,fontSize:11.5,fontWeight:700,color:gold}}>
                                    <span>✨</span>
                                    <span>{suggested.length} picks suggested for your {occasion.name} — marked ✦ below</span>
                                  </div>
                                )}

                                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                                  {orderedAreaIds.map(id=>{
                                    const area=DECOR_FOCUS_AREAS[id];
                                    const sel=decorFocusAreas.includes(id);
                                    const isSuggested=suggested.includes(id);
                                    return(
                                      <button key={id} onClick={()=>toggleArea(id)} title={area.tagline}
                                        style={{textAlign:"center",padding:"9px 5px",borderRadius:11,border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.18)"}`,background:sel?`rgba(${goldRgb},0.08)`:"#FAFAF8",cursor:"pointer",fontFamily:font,transition:"all 0.18s",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
                                        <span style={{fontSize:18,lineHeight:1}}>{area.emoji}</span>
                                        <span style={{fontSize:10.5,fontWeight:700,color:sel?gold:ink,lineHeight:1.2}}>{area.name}</span>
                                        {sel&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                        {isSuggested&&!sel&&<span style={{position:"absolute",top:4,right:4,fontSize:7,fontWeight:800,color:"#fff",background:gold,borderRadius:100,padding:"1px 4px"}}>✦</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          <div style={{fontSize:9,fontWeight:800,color:"rgba(196,122,46,0.45)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>Choose your decor style</div>
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            {dOpts.map((opt,oi)=>{
                              const sel=chosen===oi;
                              const displayItems=buildDecorDisplayItems(opt,decorFocusAreas);
                              const itemsToShow=(sel&&editedPackageItems!==null)?editedPackageItems:displayItems;
                              const isExpanded=expandedStyleIdx===oi||(sel&&editedPackageItems!==null);
                              const visibleItems=isExpanded?itemsToShow:itemsToShow.slice(0,3);
                              const hiddenCount=itemsToShow.length-visibleItems.length;
                              return(
                                <button key={oi} onClick={()=>{setVendorPackages(vp=>({...vp,Decorator:oi}));setShowDecorBuilder(false);}}
                                  style={{textAlign:"left",padding:"13px 14px",borderRadius:12,border:`1.5px solid ${sel?gold:opt.popular?"rgba(34,197,94,0.3)":"rgba(196,122,46,0.14)"}`,background:sel?`rgba(${goldRgb},0.07)`:"#FAFAF8",cursor:"pointer",fontFamily:font,transition:"all 0.18s",display:"flex",flexDirection:"column",gap:7}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                                    <span style={{fontSize:19,flexShrink:0}}>{opt.icon}</span>
                                    <span style={{fontSize:14.5,fontWeight:700,color:sel?gold:ink,flex:1,minWidth:80}}>{opt.style}</span>
                                    {opt.tier&&<span style={{fontSize:10,fontWeight:700,color:opt.tier==="Premium"?"#7C3AED":opt.tier==="Mid-range"?gold:"#16a34a",background:opt.tier==="Premium"?"rgba(124,58,237,0.08)":opt.tier==="Mid-range"?"rgba(196,122,46,0.08)":"rgba(22,163,74,0.08)",borderRadius:100,padding:"2px 8px",flexShrink:0}}>{opt.tier}</span>}
                                    {opt.popular&&!sel&&<span style={{fontSize:9,fontWeight:800,color:gold,background:"rgba(196,122,46,0.12)",borderRadius:100,padding:"2px 7px",flexShrink:0}}>Recommended</span>}
                                    {sel&&<span style={{fontSize:9,fontWeight:800,color:gold,background:"rgba(196,122,46,0.12)",borderRadius:100,padding:"2px 7px",flexShrink:0}}>✓ Selected</span>}
                                  </div>

                                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                                    {visibleItems.map((it,ii)=>(
                                      <div key={ii} style={{fontSize:13,color:sel?"#4A2810":muted,lineHeight:1.5,display:"flex",alignItems:"flex-start",gap:6}}>
                                        <span style={{flexShrink:0,color:sel?gold:"rgba(196,122,46,0.5)"}}>·</span><span>{it}</span>
                                      </div>
                                    ))}
                                  </div>
                                  {(hiddenCount>0||isExpanded&&itemsToShow.length>3)&&!(sel&&editedPackageItems!==null)&&(
                                    <button onClick={e=>{e.stopPropagation();setExpandedStyleIdx(isExpanded?null:oi);}}
                                      style={{alignSelf:"flex-start",fontSize:11.5,fontWeight:700,color:sel?gold:"#9B7450",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:font,textDecoration:"underline",textUnderlineOffset:2}}>
                                      {isExpanded?"Show less":`+${hiddenCount} more — tap to see all`}
                                    </button>
                                  )}

                                  {sel&&(
                                    <div style={{marginTop:2,paddingTop:10,borderTop:"1px solid rgba(196,122,46,0.14)"}}>
                                      <button onClick={e=>{e.stopPropagation();if(showDecorBuilder&&editedPackageItems!==null){setShowDecorBuilder(false);setEditedPackageItems(null);}else{setEditedPackageItems([...displayItems]);setShowDecorBuilder(true);}}}
                                        style={{alignSelf:"flex-start",fontSize:11,fontWeight:700,color:gold,background:"rgba(196,122,46,0.08)",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:8,padding:"5px 11px",cursor:"pointer",fontFamily:font,textAlign:"center"}}>
                                        {showDecorBuilder&&editedPackageItems!==null?"✓ Done":"✏️ Edit items"}
                                      </button>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {typeof chosen==="number"&&renderCrossSell("Decorator")}
                        </div>

                        {/* Fix the things required option — browses items within the focus areas just picked above */}
                        <div style={{padding:"10px 14px 12px"}}>
                          <button onClick={()=>{setVendorPackages(vp=>({...vp,Decorator:"custom"}));setShowDecorBuilder(true);}}
                            disabled={decorFocusAreas.length===0}
                            style={{width:"100%",padding:"10px 14px",borderRadius:11,border:`1.5px dashed ${isCustom?gold:"rgba(196,122,46,0.3)"}`,background:isCustom?"rgba(196,122,46,0.05)":"transparent",color:decorFocusAreas.length===0?"rgba(28,9,0,0.25)":isCustom?gold:muted,fontSize:12.5,fontWeight:700,cursor:decorFocusAreas.length===0?"default":"pointer",fontFamily:font,display:"flex",alignItems:"center",gap:8,transition:"all 0.18s"}}>
                            <span style={{fontSize:16}}>🎨</span>
                            <span style={{flex:1,textAlign:"left"}}>{decorFocusAreas.length===0?"Pick a place above to fix items":"Fix the items yourself"}</span>
                            {isCustom&&totalDecorItems>0&&<span style={{fontSize:10,fontWeight:600,color:"#16a34a",background:"rgba(34,197,94,0.1)",borderRadius:100,padding:"2px 8px"}}>{totalDecorItems} items picked</span>}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </button>
                        </div>

                        {/* Decor Builder panel */}
                        {showDecorBuilder&&(chosen==="custom"||typeof chosen==="number")&&(
                          <div style={{borderTop:`1px solid rgba(196,122,46,0.1)`,background:"#FFFDF8",padding:"14px 14px 16px"}}>

                            {/* AI venue suggestions strip */}
                            {venueAnalysis&&Object.keys(matchDecorFromAnalysis(venueAnalysis)).length>0&&(
                              <div style={{marginBottom:16,padding:"12px 12px 10px",borderRadius:12,background:"rgba(196,122,46,0.06)",border:"1.5px solid rgba(196,122,46,0.2)"}}>
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                                  <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em"}}>📷 From your venue analysis</div>
                                  <span style={{fontSize:10.5,fontWeight:600,color:muted}}>{venueAnalysis.spaceType}</span>
                                </div>
                                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                                  {Object.entries(matchDecorFromAnalysis(venueAnalysis)).flatMap(([cat,items])=>
                                    items.map(item=>{
                                      const already=(customDecor[cat]||[]).includes(item);
                                      return(
                                        <button key={`${cat}:${item}`}
                                          onClick={()=>!already&&setCustomDecor(prev=>({...prev,[cat]:[...(prev[cat]||[]),item]}))}
                                          style={{fontSize:11.5,fontWeight:600,padding:"5px 11px",borderRadius:100,border:`1.5px solid ${already?gold:"rgba(196,122,46,0.3)"}`,background:already?"rgba(196,122,46,0.12)":"#fff",color:already?gold:ink,cursor:already?"default":"pointer",fontFamily:font,display:"flex",alignItems:"center",gap:4}}>
                                          {already&&<span style={{fontSize:9}}>✓</span>}
                                          {item}
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}

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
                            {decorFocusAreas.map(cat=>{
                              const items=DECOR_FOCUS_AREAS[cat]?.items||[];
                              const picked=editedPackageItems!==null
                                ? editedPackageItems.filter(i=>items.includes(i))
                                : (customDecor[cat]||[]);
                              const otherVal=decorOtherInputs[cat]||"";
                              return(
                                <div key={cat} style={{marginBottom:14}}>
                                  <div style={{fontSize:11,fontWeight:700,color:ink,marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
                                    {DECOR_FOCUS_AREAS[cat]?.emoji} {DECOR_FOCUS_AREAS[cat]?.name}
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
                    <div key={v} id={`vendor-card-${v}`} style={{marginBottom:10,borderRadius:14,border:`1.5px solid ${chosen!==undefined?gold:isOpen?"rgba(196,122,46,0.4)":border}`,background:"#fff",overflow:"hidden",transition:"border-color 0.2s"}}>
                      {/* header row — clickable */}
                      <div onClick={()=>{
                        const opening=expandedVendor!==v;
                        setExpandedVendor(ev=>ev===v?null:v);
                        // When another category's panel is open above this one, collapsing it
                        // shifts the whole list up the instant this one opens — re-anchor on
                        // this card so it doesn't look like the new panel "jumped" upward.
                        if(opening) setTimeout(()=>document.getElementById(`vendor-card-${v}`)?.scrollIntoView({behavior:"smooth",block:"start"}),80);
                      }}
                        style={{padding:"12px 14px",background:chosen!==undefined?`rgba(${goldRgb},0.04)`:"#fff",display:"flex",alignItems:"center",cursor:"pointer",gap:10}}>
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
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            {pkgs.slice(0,3).map((pkg,pi)=>{
                              const sel=chosen===pi;
                              const cost=approxCost(pkg.price,guests);
                              const budgetFit=perVendorBudget&&cost?(cost<=perVendorBudget*1.25?"fits":cost<=perVendorBudget*2?"stretch":"over"):null;
                              const paragraph=buildGenericPackageParagraph(v,pkg,{occasionName:occasion.name,guests,venueType});
                              return(
                                <button key={pkg.label} onClick={()=>setVendorPackages(vp=>({...vp,[v]:pi}))}
                                  style={{textAlign:"left",padding:"13px 14px",borderRadius:12,border:`1.5px solid ${sel?gold:budgetFit==="fits"?"rgba(34,197,94,0.35)":"rgba(196,122,46,0.14)"}`,background:sel?`rgba(${goldRgb},0.07)`:"#FAFAF8",cursor:"pointer",fontFamily:font,transition:"all 0.18s",display:"flex",flexDirection:"column",gap:7}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                                    <span style={{fontSize:14.5,fontWeight:700,color:sel?gold:ink,flex:1,minWidth:80}}>{pkg.label}</span>
                                    <span style={{fontSize:13,fontWeight:700,color:sel?gold:muted}}>{pkg.price}</span>
                                    {budgetFit==="fits"&&!sel&&<span style={{fontSize:9,fontWeight:800,color:"#16a34a",background:"rgba(34,197,94,0.1)",borderRadius:100,padding:"2px 7px",flexShrink:0}}>✓ Budget</span>}
                                    {pkg.popular&&!sel&&<span style={{fontSize:9,fontWeight:800,color:gold,background:"rgba(196,122,46,0.12)",borderRadius:100,padding:"2px 7px",flexShrink:0}}>Recommended</span>}
                                    {sel&&<span style={{fontSize:9,fontWeight:800,color:gold,background:"rgba(196,122,46,0.12)",borderRadius:100,padding:"2px 7px",flexShrink:0}}>✓ Selected</span>}
                                  </div>
                                  <div style={{fontSize:13.5,color:sel?"#4A2810":muted,lineHeight:1.65}}>{paragraph}</div>
                                  {sel&&(
                                    <div style={{marginTop:2,paddingTop:10,borderTop:"1px solid rgba(196,122,46,0.14)",display:"flex",flexDirection:"column",gap:5}}>
                                      <div style={{fontSize:10.5,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>What's included</div>
                                      {pkg.items.map((it,ii)=>(
                                        <div key={ii} style={{fontSize:13,color:ink,lineHeight:1.55,display:"flex",alignItems:"flex-start",gap:6}}>
                                          <span style={{flexShrink:0,color:gold}}>·</span><span>{it}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {typeof chosen==="number"&&renderCrossSell(v)}
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

        {/* ══ STEP 4: entry experiences (optional) ══ */}
        {step===4&&(
          <div className="os">
            <EntryExperiences
              occasion={occasion}
              ageGroups={ageGroups}
              guests={guests}
              venueType={venueType}
              budget={budget}
              vendors={vendors}
              onToggleVendor={toggleVendor}
              selectedIds={selectedEntryExperiences}
              onToggleSelect={toggleEntryExperience}
              occAccent={occAccent}
            />
          </div>
        )}

        {/* ══ STEP 5: entertainment & activities ══ */}
        {step===5&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.3rem,3vw,1.7rem)",color:ink,lineHeight:1.3,marginBottom:6}}>Add entertainment</p>
            <p style={{fontSize:12.5,color:muted,marginBottom:16,lineHeight:1.55}}>All options below are bookable through Tendr — tap a category to browse.</p>

            {/* Smart entertainment tips */}
            {(()=>{
              const occ=occasion.id||"";
              const tips=occ==="baby-shower"||occ==="gender-reveal"||occ==="newborn-welcome"?[
                {icon:"🎵",text:"Gentle live music or a playlist curated for mom-to-be creates a warm atmosphere."},
                {icon:"🎮",text:"Baby-themed quiz or 'Guess the due date' games keep guests engaged."},
                {icon:"🎨",text:"Onesie painting or craft stall — guests take a personalised memento home."},
              ]:occ==="birthday-party"||occ==="first-birthday"?[
                {icon:"🎪",text:"A magician or balloon artist keeps younger guests entertained during setup."},
                {icon:"🎯",text:"Fun stalls (ring toss, carnival games) work for all ages — adults love them too."},
                {icon:"🎤",text:"An anchor / emcee to run games and cake-cutting keeps the energy high."},
              ]:occ==="anniversary"?[
                {icon:"🎸",text:"Live acoustic band or a singer — sets a romantic tone guests will remember."},
                {icon:"🎬",text:"Slideshow or video montage of couple's journey — guaranteed emotional highlight."},
                {icon:"🎲",text:"Couple trivia game hosted by an emcee — gets guests laughing and involved."},
              ]:occ==="office-party"?[
                {icon:"🎤",text:"Corporate emcee to run awards, games, and transitions — essential for 50+ people."},
                {icon:"🎯",text:"Team-building games or a treasure hunt — boosts bonding without being cringe."},
                {icon:"🎭",text:"A stand-up comedian or improv act — works great for year-end parties."},
              ]:[
                {icon:"🎮",text:"Fun stalls (games, food counters) are easy crowd-pleasers that work for all ages."},
                {icon:"🎵",text:"Live music or a DJ elevates the mood — even a 2-hour set makes a big difference."},
                {icon:"🎯",text:"An interactive game or quiz hosted by an anchor keeps guests engaged."},
              ];
              return(
                <div style={{marginBottom:18,borderRadius:12,background:"rgba(196,122,46,0.04)",border:"1px solid rgba(196,122,46,0.12)",padding:"12px 14px"}}>
                  <div style={{fontSize:9.5,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Entertainment tips</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {tips.map((t,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                        <span style={{fontSize:16,flexShrink:0,lineHeight:1.3}}>{t.icon}</span>
                        <span style={{fontSize:12,color:ink,lineHeight:1.5}}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
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
                  {(()=>{
                    const CAT_META={
                      stalls:{tagline:"Food & craft counters guests love",color:"#E8A020"},
                      shows:{tagline:"Wow moments & grand finales",color:"#7B5EA7"},
                      games:{tagline:"Activities & entertainment packages",color:"#2E8B7A"},
                    };
                    const cards=ACTIVITY_TYPES.map(({key,label,icon:typeIcon})=>{
                      const items=actSuggestions[key]||[];
                      if(!items.length) return null;
                      return {key,label,typeIcon,items};
                    }).filter(Boolean);
                    return(
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                        {cards.map(({key,label,typeIcon,items})=>{
                          const selCount=items.filter(a=>selectedActivities.includes(a.id)).length;
                          const isOpen=expandedActivityType===key;
                          const meta=CAT_META[key]||{tagline:"",color:gold};
                          const topItem=items[0];
                          return(
                            <button key={key} onClick={()=>setExpandedActivityType(isOpen?null:key)}
                              style={{
                                padding:0,borderRadius:14,textAlign:"left",cursor:"pointer",
                                border:`1.5px solid ${isOpen?meta.color:selCount>0?`${meta.color}60`:"rgba(28,9,0,0.08)"}`,
                                background:isOpen?`${meta.color}08`:selCount>0?`${meta.color}04`:"#fff",
                                fontFamily:font,transition:"all 0.18s",position:"relative",overflow:"hidden",
                              }}>
                              <div style={{padding:"3px 12px 3px",background:`${meta.color}12`,borderBottom:`1px solid ${meta.color}20`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                <span style={{fontSize:18,lineHeight:1.6}}>{typeIcon}</span>
                                {selCount>0&&<div style={{minWidth:18,height:18,borderRadius:9,background:meta.color,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>
                                  <span style={{fontSize:9.5,fontWeight:800,color:"#fff"}}>{selCount} added</span>
                                </div>}
                              </div>
                              <div style={{padding:"10px 12px 12px"}}>
                                <div style={{fontSize:12.5,fontWeight:800,color:isOpen?meta.color:ink,lineHeight:1.2,marginBottom:3}}>{label}</div>
                                <div style={{fontSize:10.5,color:muted,lineHeight:1.35,marginBottom:6}}>{CAT_META[key]?.tagline}</div>
                                {topItem&&<div style={{fontSize:10,color:meta.color,fontWeight:700,background:`${meta.color}10`,borderRadius:6,padding:"2px 7px",display:"inline-block"}}>{topItem.icon} {topItem.name}</div>}
                              </div>
                              <div style={{position:"absolute",bottom:10,right:10}}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isOpen?meta.color:"rgba(28,9,0,0.3)"} strokeWidth="2.5" strokeLinecap="round">
                                  {isOpen?<polyline points="18 15 12 9 6 15"/>:<polyline points="6 9 12 15 18 9"/>}
                                </svg>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

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
                          {items.map((a,ai)=>{
                            const sel=selectedActivities.includes(a.id);
                            const tierBreak=ai===0?<div style={{marginBottom:4}}><span style={{fontSize:10,fontWeight:800,color:"#92400E",textTransform:"uppercase",letterSpacing:"0.13em"}}>Top picks</span><span style={{fontSize:10,fontWeight:500,color:"rgba(28,9,0,0.35)",marginLeft:7}}>Crowd favourites for this event</span></div>:ai===2?<div style={{margin:"4px 0"}}><span style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.13em"}}>Also great</span><span style={{fontSize:10,fontWeight:500,color:"rgba(28,9,0,0.35)",marginLeft:7}}>Popular additions</span></div>:ai===4?<div style={{margin:"4px 0"}}><span style={{fontSize:10,fontWeight:800,color:"rgba(28,9,0,0.4)",textTransform:"uppercase",letterSpacing:"0.13em"}}>More options</span><span style={{fontSize:10,fontWeight:500,color:"rgba(28,9,0,0.35)",marginLeft:7}}>Browse everything available</span></div>:null;
                            return(
                              <React.Fragment key={a.id}>
                              {tierBreak}
                              <button onClick={()=>toggleActivity(a.id)}
                                style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.14)"}`,background:sel?`rgba(${goldRgb},0.06)`:"#FAFAF8",cursor:"pointer",fontFamily:font,transition:"all 0.16s",textAlign:"left"}}>
                                <div style={{width:38,height:38,borderRadius:10,background:sel?`rgba(${goldRgb},0.12)`:"rgba(196,122,46,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>
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
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Live artist marketplace — shown when vendor-side performers are available */}
                  <PerformerSuggestions
                    title="Also hire a live artist from Tendr"
                    wrapStyle={{ marginBottom: 16, padding: "14px", background: "rgba(196,122,46,0.03)", borderRadius: 14, border: "1px solid rgba(196,122,46,0.12)" }}
                  />

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

            {/* Tools CTA — visible at bottom of FUN tab */}
            {hub&&(
              <div onClick={()=>navigate(hub)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderRadius:14,background:"linear-gradient(135deg,rgba(26,10,46,0.96),rgba(45,16,96,0.92))",cursor:"pointer",marginTop:22,border:"1px solid rgba(124,58,237,0.25)"}}>
                <div style={{width:36,height:36,borderRadius:10,background:"rgba(124,58,237,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>🛠️</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#fff",lineHeight:1.2}}>Party-day tools</div>
                  <div style={{fontSize:11,color:"rgba(167,139,250,0.75)",marginTop:2}}>Games, playlists, bill split & more — all in one hub</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 6: gifts ══ */}
        {step===6&&(
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
            {/* Gift budget tracker — estimate only, never claims exact precision since
                prices are free-text ranges, not numbers */}
            {(()=>{
              const giftBudgetAlloc=budget&&Number(budget)>0?Number(budget)*0.12:null;
              const estimatedGiftSpend=computeGiftSpend(gifts,giftQuantities,sortedGifts,guests);
              if(!gifts.length&&!giftBudgetAlloc) return null;
              const pct=giftBudgetAlloc?Math.min(100,Math.round((estimatedGiftSpend/giftBudgetAlloc)*100)):0;
              const over=giftBudgetAlloc&&estimatedGiftSpend>giftBudgetAlloc;
              return(
                <div style={{marginBottom:16,borderRadius:12,border:`1px solid ${over?"rgba(239,68,68,0.3)":border}`,background:over?"rgba(239,68,68,0.04)":"#fff",padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:giftBudgetAlloc?8:0}}>
                    <span style={{fontSize:11.5,fontWeight:700,color:ink}}>
                      ~₹{Math.round(estimatedGiftSpend).toLocaleString("en-IN")}{giftBudgetAlloc&&` of ~₹${Math.round(giftBudgetAlloc).toLocaleString("en-IN")} gift budget`}
                    </span>
                    {over&&<span style={{fontSize:10.5,fontWeight:700,color:"#dc2626"}}>Over estimate</span>}
                  </div>
                  {giftBudgetAlloc&&(
                    <div style={{height:6,borderRadius:100,background:"rgba(28,9,0,0.06)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,borderRadius:100,background:over?"#dc2626":gold,transition:"width 0.25s"}}/>
                    </div>
                  )}
                  <div style={{fontSize:10,color:muted,marginTop:6}}>Estimated from typical price ranges — exact cost depends on the vendor you choose.</div>
                </div>
              );
            })()}
            {/* Gift tips */}
            {(()=>{
              const occ=occasion.id||"";
              const giftTips={
                "baby-shower":[{icon:"🧸",text:"Diaper Hamper — always the most appreciated practical gift."},{icon:"💆",text:"Mother Pampering Box — for the mom-to-be, not just the baby."},{icon:"📦",text:"Personalised Memory Box — something they'll cherish for years."}],
                "gender-reveal":[{icon:"🎀",text:"Gender-reveal themed gifts score extra — pink or blue details matter."},{icon:"💆",text:"Pregnancy spa voucher — the mom-to-be will love you for this."},{icon:"📸",text:"Photo album or milestone frame set for the first year."}],
                "birthday-party":[{icon:"🎂",text:"Personalised gifts (name-engraved, photo-printed) always land well."},{icon:"💝",text:"Experience gifts (movie tickets, spa, trip) for adults over 30."},{icon:"🎁",text:"Hampers with their favourite snacks/drinks — easy and crowd-pleasing."}],
                "anniversary":[{icon:"💑",text:"Couple experiences (candlelight dinner, staycation) beat physical gifts."},{icon:"📸",text:"Photo book of the past years — deeply personal and always emotional."},{icon:"🍾",text:"Wine or champagne set with personalised label."}],
                "office-party":[{icon:"🏆",text:"Personalised awards or mementos for the occasion."},{icon:"🎁",text:"Branded gift hampers — safe, professional, appreciated by all."},{icon:"☕",text:"Desk essentials or premium stationery — practical and well-received."}],
              };
              const tips=giftTips[occ]||[{icon:"🎁",text:"Personalised gifts make a bigger impression than generic ones."},{icon:"📦",text:"Hampers and curated sets feel premium even at modest budgets."},{icon:"💝",text:"Consider experience gifts — they create memories, not clutter."}];
              return(
                <div style={{marginBottom:16,borderRadius:12,background:"rgba(196,122,46,0.04)",border:"1px solid rgba(196,122,46,0.12)",padding:"12px 14px"}}>
                  <div style={{fontSize:9.5,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Gift tips</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {tips.map((t,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                        <span style={{fontSize:16,flexShrink:0,lineHeight:1.3}}>{t.icon}</span>
                        <span style={{fontSize:12,color:ink,lineHeight:1.5}}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Gift tiers */}
            {(()=>{
              const curated=sortedGifts.filter(g=>g.score>=4);
              const good=sortedGifts.filter(g=>g.score>0&&g.score<4);
              const more=sortedGifts.filter(g=>g.score<=0);
              const tierLabel=(label,color,sub)=><div style={{marginBottom:8,marginTop:4}}><span style={{fontSize:10,fontWeight:800,color,textTransform:"uppercase",letterSpacing:"0.13em"}}>{label}</span>{sub&&<span style={{fontSize:10,fontWeight:500,color:"rgba(28,9,0,0.35)",marginLeft:7}}>{sub}</span>}</div>;
              // Image-led card — same visual pattern as renderThemeGallery()/EntryExperiences.jsx's
              // EntryCard: height:140 image block, gold selected border+checkmark, tag-style chips.
              const giftCard=(g,i)=>{
                const sel=gifts.includes(g.name);
                const qty=giftQuantities[g.name]||1;
                return(
                  <div key={i}
                    style={{padding:0,borderRadius:16,overflow:"hidden",border:`2px solid ${sel?gold:"rgba(196,122,46,0.13)"}`,background:"#fff",transition:"all 0.18s",boxShadow:sel?"0 4px 20px rgba(196,122,46,0.22)":"0 1px 5px rgba(0,0,0,0.06)"}}>
                    <button onClick={()=>toggleGift(g.name)} style={{display:"block",width:"100%",padding:0,border:"none",background:"none",cursor:"pointer",textAlign:"left",fontFamily:font}}>
                      <div style={{position:"relative",height:140,overflow:"hidden",background:"linear-gradient(160deg,rgba(196,122,46,0.4),rgba(196,122,46,0.15))"}}>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:36}}>{giftEmoji(g.name,g.desc)}</span>
                        </div>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 55%)"}}/>
                        <div style={{position:"absolute",bottom:9,left:10,right:32}}>
                          <span style={{fontSize:12,fontWeight:800,color:"#fff",lineHeight:1.25,textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{g.name}</span>
                        </div>
                        {sel&&(
                          <div style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:"50%",background:gold,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                      </div>
                      <div style={{padding:"9px 11px 4px"}}>
                        {g.reason&&!sel&&<div style={{marginBottom:5}}><span style={{fontSize:9,fontWeight:700,color:g.reason.includes("Budget")||g.reason.includes("budget")?"#16a34a":gold,background:g.reason.includes("Budget")||g.reason.includes("budget")?"rgba(34,197,94,0.09)":"rgba(196,122,46,0.08)",borderRadius:100,padding:"2px 8px"}}>{g.reason}</span></div>}
                        <div style={{fontSize:11,color:muted,lineHeight:1.5,marginBottom:6}}>{(g.desc||"").slice(0,70)}{(g.desc||"").length>70?"…":""}</div>
                        <div style={{fontSize:11.5,fontWeight:700,color:ink}}>{g.price}</div>
                      </div>
                    </button>
                    {sel&&(
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px 11px"}}>
                        <span style={{fontSize:10,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Quantity</span>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <button onClick={()=>setGiftQty(g.name,qty-1)} disabled={qty<=1}
                            style={{width:24,height:24,borderRadius:"50%",border:`1.5px solid ${border}`,background:"#fff",color:qty<=1?"rgba(28,9,0,0.2)":gold,fontSize:14,fontWeight:700,cursor:qty<=1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font}}>−</button>
                          <span style={{fontSize:13,fontWeight:700,color:ink,minWidth:16,textAlign:"center"}}>{qty}</span>
                          <button onClick={()=>setGiftQty(g.name,qty+1)}
                            style={{width:24,height:24,borderRadius:"50%",border:"none",background:gold,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font}}>+</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              };
              // Fallback: if no tier has gifts, show all flat
              if(!curated.length&&!good.length&&!more.length){
                return <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{sortedGifts.map(giftCard)}</div>;
              }
              return(
                <div>
                  {curated.length>0&&<>{tierLabel("Perfect picks","#92400E","Matched to your event & theme")}<div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>{curated.map(giftCard)}</div></>}
                  {good.length>0&&<>{tierLabel("Also great",gold,"Good choices for most guests")}<div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>{good.map(giftCard)}</div></>}
                  {more.length>0&&<>{tierLabel("More options","rgba(28,9,0,0.4)","Browse everything else")}<div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>{more.map(giftCard)}</div></>}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ STEP 7: "Tendr wishes you" — decorative reveal between Gifts and the full plan ══ */}
        {step===7&&(
          <div className="os" style={{position:"relative",minHeight:"calc(100dvh - 180px)",display:"flex",flexDirection:"column",justifyContent:"center",padding:"10px 2px 20px",overflow:"hidden"}}>
            {/* decorative glow + sparkles — this page has no sticky header, so it needs its own back control */}
            <div aria-hidden style={{position:"absolute",top:"-14%",left:"50%",transform:"translateX(-50%)",width:380,height:380,borderRadius:"50%",background:`radial-gradient(circle,${gold}1f 0%,transparent 70%)`,pointerEvents:"none"}}/>
            {["8%","85%","15%","78%"].map((left,i)=>(
              <span key={i} aria-hidden style={{position:"absolute",top:`${8+i*20}%`,left,fontSize:14+((i%2)*6),opacity:0.3,transform:`rotate(${i%2?-12:14}deg)`,pointerEvents:"none"}}>✦</span>
            ))}

            <button onClick={back} style={{position:"relative",display:"flex",alignItems:"center",gap:5,marginBottom:18,padding:"5px 10px 5px 6px",borderRadius:100,border:"none",background:`${gold}10`,color:gold,fontFamily:font,fontWeight:700,fontSize:11.5,cursor:"pointer",alignSelf:"flex-start"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>

            <div style={{position:"relative",textAlign:"center",marginBottom:22}}>
              <div style={{fontSize:30,marginBottom:10}}>✨</div>
              <div style={{fontSize:10.5,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.2em",marginBottom:10}}>Tendr wishes you</div>
              <div style={{fontFamily:serif,fontSize:"clamp(1.7rem,5.5vw,2.4rem)",fontWeight:600,color:ink,lineHeight:1.2}}>
                Your {occasion.name} Is Going to Be Beautiful!
              </div>
              <div style={{fontSize:14,color:muted,marginTop:10}}>Here's how your special day could look.</div>
            </div>

            {(()=>{
              const {summary}=buildEventSummary(occasion,{celebrantName,guests,date,city,venueType,theme,vendors,decorFocusAreas,customDecor,selectedActivities,customActivities,gifts});
              return(
                <div style={{position:"relative",background:"linear-gradient(145deg,#FFF8EE,#FFFDF7)",border:`1.5px solid ${gold}30`,borderRadius:22,padding:"24px 22px",marginBottom:20,boxShadow:"0 10px 32px rgba(0,0,0,0.06)"}}>
                  <p style={{fontSize:15,color:ink,lineHeight:1.8,margin:0}}>{summary}</p>
                </div>
              );
            })()}

            <div style={{position:"relative",display:"flex",gap:10}}>
              <button onClick={back} style={{flex:1,padding:"14px",borderRadius:14,border:`1.5px solid ${gold}30`,background:"#fff",color:gold,fontFamily:font,fontWeight:700,fontSize:13.5,cursor:"pointer"}}>
                ← Back
              </button>
              <button onClick={next} style={{flex:2,padding:"14px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",fontFamily:font,fontWeight:800,fontSize:13.5,cursor:"pointer",boxShadow:`0 6px 20px rgba(196,122,46,0.35)`}}>
                See My Full Plan →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 8: blueprint ══ */}
        {step===8&&(
          <div className="os">
            {/* Standalone plan view has no sticky header — this is its only way back */}
            <button onClick={back} style={{display:"flex",alignItems:"center",gap:5,marginBottom:10,padding:"5px 10px 5px 6px",borderRadius:100,border:"none",background:`${occAccent}10`,color:occAccent,fontFamily:font,fontWeight:700,fontSize:11.5,cursor:"pointer"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={occAccent} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:4}}>Your plan is ready ✦</p>

            {/* Upload-venue-photo gate — shown once before the plan, unless a photo was
                already captured via the Decor Analyser earlier in the flow. Dismissible
                (upload or skip); never asked twice in the same session. */}
            {!venuePhoto&&!venueAnalysis&&!venuePhotoGateSeen&&(
              <div style={{marginBottom:16,borderRadius:16,border:"1.5px solid rgba(196,122,46,0.22)",background:"rgba(196,122,46,0.04)",padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:16}}>📷</span>
                  <span style={{fontSize:13,fontWeight:700,color:ink}}>Add a photo of your venue</span>
                  <span style={{fontSize:10,fontWeight:600,color:muted}}>(optional)</span>
                </div>
                <div style={{fontSize:11.5,color:muted,lineHeight:1.5,marginBottom:10}}>Helps your Tendr coordinator understand the space — and sharpens our decor suggestions.</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <input id="venue-photo-gate-input" type="file" accept="image/*" style={{display:"none"}}
                    onChange={async e=>{
                      const file=e.target.files?.[0];
                      if(file){ const dataUrl=await resizeVenuePhoto(file); setVenuePhoto(dataUrl); }
                      setVenuePhotoGateSeen(true);
                      e.target.value="";
                    }}/>
                  <button onClick={()=>document.getElementById("venue-photo-gate-input").click()}
                    style={{padding:"9px 16px",borderRadius:100,background:gold,color:"#fff",fontFamily:font,fontWeight:700,fontSize:12.5,border:"none",cursor:"pointer"}}>
                    Upload photo
                  </button>
                  <button onClick={()=>setVenuePhotoGateSeen(true)}
                    style={{padding:"9px 14px",borderRadius:100,background:"none",border:"none",color:muted,fontFamily:font,fontWeight:600,fontSize:12.5,cursor:"pointer",textDecoration:"underline"}}>
                    Skip for now
                  </button>
                </div>
              </div>
            )}
            {venuePhoto&&(
              <div style={{marginBottom:16,display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:14,border:"1px solid rgba(196,122,46,0.15)",background:"#fff"}}>
                <img src={venuePhoto} alt="Venue" style={{width:48,height:48,borderRadius:10,objectFit:"cover",flexShrink:0}}/>
                <div style={{flex:1,fontSize:11.5,color:ink,fontWeight:600}}>Venue photo added</div>
                <button onClick={()=>{setVenuePhoto(null);setVenuePhotoGateSeen(false);}}
                  style={{fontSize:11,fontWeight:600,color:muted,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:font}}>Change</button>
              </div>
            )}

            {/* Final Plan content. The "story" (Journey, Overview, Budget, Selected items,
                Itinerary) is five short full-screen slides shown first in an overlay with
                no header/tabs/bottom-nav — see planStoryOpen below. Timeline/Checklist/
                Equipment are ongoing tools, not "the plan" itself, so they render normally
                on the page underneath instead of being part of the story. All eight pieces
                are still assembled into one planSections array for the PDF/share-to-chat
                capture further below, so that output stays exactly as complete as before. */}
            {(()=>{
            const journeySlide=(
            <React.Fragment key="plan-journey">
            {/* "Your event, start to end" — narrative walkthrough, built from real selections */}
            {(()=>{
              const journey=buildEventJourney(occasion,{celebrantName,guests,venueType,city,theme,decorFocusAreas,customDecor,selectedEntryExperiences,vendors,cateringType,cakeType,customCatering,selectedActivities,customActivities,gifts});
              return(
                <div style={{marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontSize:16}}>✦</span>
                    <span style={{fontFamily:serif,fontSize:17,color:ink,fontWeight:400}}>Your {occasion.name.toLowerCase()}, start to end</span>
                  </div>
                  <div style={{fontSize:11.5,color:muted,marginBottom:14,lineHeight:1.5}}>Here's a picture of how the day will actually feel, based on everything you've chosen so far.</div>
                  <div style={{position:"relative",paddingLeft:30}}>
                    <div aria-hidden style={{position:"absolute",left:13,top:6,bottom:6,width:1.5,background:`linear-gradient(180deg,${gold},rgba(196,122,46,0.1))`}}/>
                    {journey.map((beat,i)=>(
                      <div key={i} style={{position:"relative",marginBottom:i<journey.length-1?18:0}}>
                        <div aria-hidden style={{position:"absolute",left:-30,top:0,width:26,height:26,borderRadius:"50%",background:"#fff",border:`1.5px solid ${gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{beat.icon}</div>
                        <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{beat.title}</div>
                        <div style={{fontSize:13,color:ink,lineHeight:1.6}}>{beat.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            </React.Fragment>
            );

            const prepSlide=(
            <React.Fragment key="plan-prep">
            {/* "How your preparation will go" — the lead-up walkthrough companion to the
                day-of journey above: what's open, what we do, what's on the customer, and
                how the final week actually unfolds. */}
            {(()=>{
              const prep=buildPreparationJourney(occasion,{timeline,vendors,date,budget,city,selectedEntryExperiences,entryExperiencesSkipped,selectedActivities,customActivities,gifts});
              return(
                <div style={{marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontSize:16}}>✦</span>
                    <span style={{fontFamily:serif,fontSize:17,color:ink,fontWeight:400}}>How your preparation will go</span>
                  </div>
                  <div style={{fontSize:11.5,color:muted,marginBottom:14,lineHeight:1.5}}>And here's the lead-up to it — what's still open, what we take off your plate, and what's left for you.</div>
                  <div style={{position:"relative",paddingLeft:30}}>
                    <div aria-hidden style={{position:"absolute",left:13,top:6,bottom:6,width:1.5,background:`linear-gradient(180deg,${gold},rgba(196,122,46,0.1))`}}/>
                    {prep.map((beat,i)=>(
                      <div key={i} style={{position:"relative",marginBottom:i<prep.length-1?18:0}}>
                        <div aria-hidden style={{position:"absolute",left:-30,top:0,width:26,height:26,borderRadius:"50%",background:"#fff",border:`1.5px solid ${gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{beat.icon}</div>
                        <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{beat.title}</div>
                        <div style={{fontSize:13,color:ink,lineHeight:1.6}}>{beat.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            </React.Fragment>
            );

            const overviewSlide=(
            <React.Fragment key="plan-overview">
            {/* plan overview card */}
            <div ref={cardRef} style={{background:"linear-gradient(145deg,#FFF8EE,#FFFDF7)",border:`1.5px solid rgba(196,122,46,0.2)`,borderRadius:20,overflow:"hidden",marginBottom:12}}>
              <div style={{background:`linear-gradient(135deg,${gold},${goldLt})`,padding:"18px 20px 16px",position:"relative",overflow:"hidden"}}>
                <div aria-hidden style={{position:"absolute",top:-24,right:-24,width:90,height:90,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.14)"}}/>
                <div style={{display:"flex",alignItems:"center",gap:10,position:"relative"}}>
                  <span style={{fontSize:30}}>{occasion.icon}</span>
                  <div>
                    <div style={{fontFamily:serif,fontSize:18,fontWeight:400,color:"#fff",lineHeight:1.1}}>{celebrantName?`${celebrantName}'s ${occasion.name}`:occasion.name}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontWeight:600,marginTop:2,fontFamily:font}}>Celebration Plan · Tendr</div>
                  </div>
                </div>
              </div>
              <div style={{padding:"16px 18px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  {[
                    celebrantName?{icon:"🎀",label:"For",val:celebrantName}:null,
                    {icon:"👥",label:"Guests",val:`${guests} people`},
                    {icon:"💰",label:"Budget",val:budget?fmtNum(Number(budget)):`${fmtNum(occasion.budgetMin)}–${fmtNum(occasion.budgetMax)}`},
                    {icon:"📅",label:"Date",val:date?new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"TBD"},
                    {icon:"📍",label:"Location",val:city?(venueType?`${city} · ${venueType}`:city):(venueType||"TBD")},
                  ].filter(Boolean).map(({icon,label,val})=>(
                    <div key={label} style={{background:"#fff",borderRadius:10,padding:"10px 12px",border:`1px solid rgba(196,122,46,0.1)`}}>
                      <div style={{fontSize:9,fontWeight:700,color:"rgba(196,122,46,0.45)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2}}>{icon} {label}</div>
                      <div style={{fontSize:12.5,fontWeight:700,color:val==="TBD"?"rgba(30,15,0,0.25)":ink}}>{val}</div>
                    </div>
                  ))}
                </div>
                {theme&&<div style={{marginBottom:8,fontSize:11.5,fontWeight:700,color:gold}}>🎨 {theme.name} theme</div>}
                {cateringType&&<div style={{marginBottom:8,fontSize:11.5,color:muted}}>🍽️ {cateringType}{cakeType&&` · ${cakeType}`}{inviteType&&` · ${inviteType}`}</div>}
                <div style={{borderTop:`1px solid rgba(196,122,46,0.1)`,paddingTop:10,marginTop:2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:9.5,color:muted,fontFamily:font}}>Generated with Tendr</span>
                  <span style={{fontSize:10,letterSpacing:2}}>★★★★★</span>
                </div>
              </div>
            </div>
            {/* What you've planned — shown together with the overview on the same, first slide */}
            {renderSelectedItemsSection()}
            </React.Fragment>
            );

            const budgetSlide=(
            <React.Fragment key="plan-budget">
            {/* budget split — centrepiece */}
            {budgetSplit&&(
              <div style={{marginBottom:20,padding:"18px 18px 16px",borderRadius:16,background:"linear-gradient(145deg,#FFF8EE,#FFFDF7)",border:`1.5px solid rgba(196,122,46,0.18)`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <div style={{width:26,height:26,borderRadius:8,background:`rgba(196,122,46,0.1)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <span style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:font}}>{vendors.length>0?"How your budget is split":"How budgets are typically split"}</span>
                  <div style={{flex:1,height:1,background:`rgba(196,122,46,0.12)`}}/>
                </div>
                {budget&&Number(budget)>0&&(
                  <div style={{textAlign:"center",marginBottom:16,padding:"10px 0 4px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"rgba(196,122,46,0.5)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2}}>Total budget</div>
                    <div style={{fontFamily:serif,fontSize:28,fontWeight:400,color:gold,lineHeight:1}}>₹{Number(budget).toLocaleString("en-IN")}</div>
                  </div>
                )}
                {budgetSplit.map(c=>(
                  <div key={c.label} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:600,color:ink}}>{c.label}</span>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {budget&&Number(budget)>0&&<span style={{fontSize:11,color:muted}}>~₹{Math.round(Number(budget)*c.pct/100).toLocaleString("en-IN")}</span>}
                        <span style={{fontSize:12,fontWeight:700,color:gold}}>{c.pct}%</span>
                      </div>
                    </div>
                    <div style={{height:7,borderRadius:3.5,background:"rgba(196,122,46,0.1)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${c.pct}%`,background:c.color,borderRadius:3.5,transition:"width 0.8s ease"}}/>
                    </div>
                  </div>
                ))}
                {/* Entry Experience + gift estimates — separate from the vendor-package split
                    above since they're absolute ₹ estimates, not a percentage of one total. */}
                {selectedEntryExperiences.length>0&&(
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid rgba(196,122,46,0.1)",marginTop:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:ink}}>Entry Experiences (estimate)</span>
                    <span style={{fontSize:12,fontWeight:700,color:gold}}>~₹{Math.round(computeEntryExperienceSpend(selectedEntryExperiences)).toLocaleString("en-IN")}</span>
                  </div>
                )}
                {gifts.length>0&&(
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid rgba(196,122,46,0.1)"}}>
                    <span style={{fontSize:12,fontWeight:600,color:ink}}>Gifts (estimate)</span>
                    <span style={{fontSize:12,fontWeight:700,color:gold}}>~₹{Math.round(computeGiftSpend(gifts,giftQuantities,sortedGifts,guests)).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div style={{fontSize:11,color:muted,marginTop:12,lineHeight:1.6,padding:"10px 12px",background:"rgba(196,122,46,0.04)",borderRadius:8,border:`1px solid rgba(196,122,46,0.12)`}}>
                  Exact pricing will be shared by your Tendr coordinator once you connect — Entry Experience and gift totals above are estimates based on typical price ranges.
                </div>
              </div>
            )}
            </React.Fragment>
            );

            // Hoisted so both the slide content below and the emptiness check that decides
            // whether "Itinerary" even appears in the story can share one computation.
            const storyItinerary=buildItinerary(occasion,{guests,vendors,selectedActivities,venueType,ageGroups,startTime:eventStartTime});
            const itinerarySlide=(
            <React.Fragment key="plan-itinerary">
            {/* event itinerary — hero of the plan */}
            {(()=>{
              const itinerary=storyItinerary;
              if(!itinerary.length) return null;
              const open=planSectionsOpen.itinerary;
              return(
                <div style={{marginBottom:20}}>
                  <div onClick={()=>togglePlanSection("itinerary")} style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,cursor:"pointer"}}>
                    <div style={{width:26,height:26,borderRadius:8,background:`rgba(196,122,46,0.1)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <span style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:font}}>Your event itinerary</span>
                    <div style={{flex:1,height:1,background:`rgba(196,122,46,0.12)`}}/>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  {open&&<>
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
                  <div style={{marginTop:10,padding:"9px 12px",borderRadius:8,background:"rgba(196,122,46,0.04)",border:"1px solid rgba(196,122,46,0.09)"}}>
                    <div style={{fontSize:10,fontWeight:700,color:gold,marginBottom:3}}>How is this itinerary built?</div>
                    <div style={{fontSize:11,color:muted,lineHeight:1.55}}>Based on: your <strong style={{color:ink}}>services selected</strong> (Decorator, Caterer, DJ, etc.), any <strong style={{color:ink}}>entertainment & activities</strong> you've added, your <strong style={{color:ink}}>venue type</strong>, and standard timings for a {occasion.name.toLowerCase()}. Timings are estimates — adjust to fit your actual event flow.</div>
                  </div>
                  </>}
                </div>
              );
            })()}
            </React.Fragment>
            );

            // Paired with their labels and filtered together so a slide with nothing to
            // show (no budget split yet, no itinerary yet) never appears as a blank page.
            // Overview is first — it's the facts of the event plus what's been booked,
            // read together before the narrative/prep/itinerary slides that follow.
            const storyItems=[
              {label:"Overview",content:overviewSlide,show:true},
              {label:"Your Event",content:journeySlide,show:true},
              {label:"Preparation",content:prepSlide,show:true},
              {label:"Budget",content:budgetSlide,show:!!budgetSplit},
              {label:"Itinerary",content:itinerarySlide,show:storyItinerary.length>0},
            ].filter(s=>s.show);
            const storySlides=storyItems.map(s=>s.content);

            const timelineSection=(
            <React.Fragment key="plan-timeline">
            {/* timeline — booking countdown */}
            {timeline&&(()=>{
              const open=planSectionsOpen.timeline;
              return(
              <div style={{marginBottom:24}}>
                <div onClick={()=>togglePlanSection("timeline")} style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,cursor:"pointer"}}>
                  <div style={{width:26,height:26,borderRadius:8,background:`rgba(196,122,46,0.1)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <span style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:font}}>Your timeline · {timeline.days} days to go</span>
                  <div style={{flex:1,height:1,background:`rgba(196,122,46,0.12)`}}/>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {open&&
                <div style={{position:"relative",paddingLeft:24}}>
                  <div style={{position:"absolute",left:7,top:8,bottom:8,width:1.5,background:`linear-gradient(180deg,${gold},rgba(196,122,46,0.1))`}}/>
                  {timeline.phases.map((p,i)=>(
                    <div key={i} style={{position:"relative",marginBottom:i<timeline.phases.length-1?20:0}}>
                      <div style={{position:"absolute",left:-21,top:2,width:10,height:10,borderRadius:"50%",background:i===timeline.phases.length-1?gold:"#fff",border:`2px solid ${gold}`}}/>
                      <div style={{fontSize:10.5,fontWeight:700,color:gold,marginBottom:4}}>{p.when}{p.date&&<span style={{color:muted,fontWeight:400,marginLeft:6}}>{p.date}</span>}</div>
                      {p.tasks.map((t,j)=><div key={j} style={{fontSize:12,color:muted,lineHeight:1.5,marginBottom:1}}>· {t}</div>)}
                    </div>
                  ))}
                </div>}
              </div>
              );
            })()}
            </React.Fragment>
            );

            const checklistSection=(
            <React.Fragment key="plan-checklist">
            {/* checklist */}
            <div style={{marginBottom:20}}>
              <div onClick={()=>togglePlanSection("checklist")} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,cursor:"pointer"}}>
                <div style={{width:26,height:26,borderRadius:8,background:`rgba(196,122,46,0.1)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <span style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:font}}>Checklist</span>
                <div style={{flex:1,height:1,background:`rgba(196,122,46,0.12)`}}/>
                {tasksDone>0&&<span style={{fontSize:11,fontWeight:700,color:gold,flexShrink:0}}>{tasksDone}/{tasksTotal}</span>}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" style={{transform:planSectionsOpen.checklist?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {planSectionsOpen.checklist&&<>
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
              </>}
            </div>
            </React.Fragment>
            );

            const equipmentSection=(
            <React.Fragment key="plan-equipment">
            {/* equipment */}
            <div style={{marginBottom:8}}>
              <div onClick={()=>togglePlanSection("equipment")} style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,cursor:"pointer"}}>
                <span style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:font,flex:1}}>What to arrange · {guests} guests</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" style={{transform:planSectionsOpen.equipment?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {planSectionsOpen.equipment&&equipment.map(({cat,items})=>(
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
            </React.Fragment>
            );

            // Full ordered content for the PDF / share-to-chat capture — unchanged from before,
            // just assembled from the now-separate pieces instead of 3 bundled fragments.
            const planSections=[...storySlides,timelineSection,checklistSection,equipmentSection];
            const storyLabels=storyItems.map(s=>s.label);

            return (<>
            {/* ── Full-screen plan story — no header/tabs/bottom-nav, shown first on arrival ── */}
            {planStoryOpen&&createPortal(
              <div style={{position:"fixed",inset:0,zIndex:999999,background:"#FDFAF5",display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{flexShrink:0,width:"100%",maxWidth:680,padding:"calc(14px + env(safe-area-inset-top,0px)) 20px 10px",display:"flex",flexDirection:"column",gap:10,boxSizing:"border-box"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,fontWeight:700,color:muted}}>{storyLabels[storyIdx]}</span>
                    <button onClick={()=>setPlanStoryOpen(false)} style={{width:30,height:30,borderRadius:"50%",border:"1.5px solid rgba(196,122,46,0.2)",background:"#fff",color:muted,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} aria-label="Skip to full plan">×</button>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    {storySlides.map((_,i)=>(
                      <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=storyIdx?gold:"rgba(196,122,46,0.15)",transition:"background 0.2s"}}/>
                    ))}
                  </div>
                </div>
                <div style={{flex:1,minHeight:0,overflowY:"auto",width:"100%",maxWidth:680,padding:"4px 20px",boxSizing:"border-box"}}>
                  <AnimatePresence mode="wait" initial={false} custom={storyDirection}>
                    <motion.div key={storyIdx}
                      initial={{opacity:0,x:storyDirection>0?44:-44}}
                      animate={{opacity:1,x:0}}
                      exit={{opacity:0,x:storyDirection>0?-44:44}}
                      transition={{duration:0.3,ease:[0.25,0.46,0.45,0.94]}}>
                      {storySlides[storyIdx]}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div style={{flexShrink:0,width:"100%",maxWidth:680,padding:"12px 20px calc(14px + env(safe-area-inset-bottom,0px))",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,borderTop:"1px solid rgba(196,122,46,0.12)",background:"#FDFAF5",boxSizing:"border-box"}}>
                  <button onClick={()=>storyIdx>0&&goToStory(storyIdx-1)} disabled={storyIdx===0}
                    style={{padding:"11px 18px",borderRadius:100,border:`1.5px solid ${storyIdx===0?"rgba(28,9,0,0.08)":"rgba(196,122,46,0.3)"}`,background:"#fff",color:storyIdx===0?"rgba(28,9,0,0.2)":gold,fontSize:13,fontWeight:700,cursor:storyIdx===0?"default":"pointer",fontFamily:font}}>
                    ← Back
                  </button>
                  <span style={{fontSize:11,color:muted,fontWeight:600}}>{storyIdx+1} / {storySlides.length}</span>
                  {storyIdx<storySlides.length-1 ? (
                    <button onClick={()=>goToStory(storyIdx+1)}
                      style={{padding:"11px 20px",borderRadius:100,border:"none",background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:font}}>
                      Next →
                    </button>
                  ) : (
                    <button onClick={()=>setPlanStoryOpen(false)}
                      style={{padding:"11px 20px",borderRadius:100,border:"none",background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:font}}>
                      See full plan →
                    </button>
                  )}
                </div>
              </div>,
              document.body
            )}

            {/* Replay — the story above only auto-opens on arrival, this reopens it later */}
            <button onClick={()=>{setStoryIdx(0);setPlanStoryOpen(true);}}
              style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",marginBottom:16,borderRadius:14,border:`1.5px solid rgba(196,122,46,0.2)`,background:"linear-gradient(145deg,#FFF8EE,#FFFDF7)",cursor:"pointer",fontFamily:font,textAlign:"left"}}>
              <span style={{fontSize:18}}>✦</span>
              <span style={{flex:1}}>
                <div style={{fontSize:12.5,fontWeight:700,color:ink}}>Replay your plan</div>
                <div style={{fontSize:11,color:muted}}>Walk through it again, one page at a time</div>
              </span>
              <span style={{fontSize:13,color:gold,fontWeight:700}}>→</span>
            </button>

            {/* Timeline / Checklist / Equipment — ongoing tools, always visible here (not part of the story) */}
            {timelineSection}
            {checklistSection}
            {equipmentSection}

            {/* Off-screen, mounted only while generating a PDF / share-to-chat token so
                html2canvas captures the complete plan — never shown to the user otherwise. */}
            {planExportMode&&(
              <div ref={planRef} style={{background:"#FDFAF5",borderRadius:14,padding:"4px 2px"}}>{planSections}</div>
            )}
            </>); })()}

            {/* F. Recommendations — improvement tips + cross-sell. The summary/conclusion
                paragraphs that used to live here moved to the "Tendr wishes you" reveal
                page (step 7) instead, so the event description exists in exactly one place. */}
            {(()=>{
              const guestStr=guests===1?"1 guest":`${guests} guests`;

              // ── Make it even better — exactly 2, most relevant first ──
              const tips=[];
              if(!budget||Number(budget)<=0) tips.push({t:"Confirm your budget",d:`Run the Price Estimator for ${occasion.name} with ${guestStr} to get real ₹ ranges before you start calling vendors — it stops the first few quotes from anchoring you too high.`,action:()=>openPriceEstimator({occasion:occasion.name,onFinalise:(avg)=>setBudget(String(avg))})});
              if(vendors.length<2) tips.push({t:"Add more services",d:`Only ${vendors.length} service${vendors.length===1?"":"s"} picked so far — most ${occasion.name} plans need at least catering and decor booked together so timings don't clash.`,action:()=>setStep(3)});
              if(date){
                const daysOut=Math.ceil((new Date(date+"T00:00:00")-new Date())/86400000);
                if(daysOut>=0&&daysOut<14) tips.push({t:"Book soon — date is close",d:`Your event is ${daysOut<=0?"today or has passed":`only ${daysOut} day${daysOut===1?"":"s"} away`} — decorators and photographers get booked out fastest, so confirm those first.`,action:()=>setStep(3)});
              }
              if(selectedEntryExperiences.length===0&&!entryExperiencesSkipped) tips.push({t:"Explore entrance ideas",d:"You haven't looked at Entry Experiences yet — a balloon tunnel or themed welcome is an easy way to make the arrival memorable.",action:()=>setStep(4)});
              if(selectedActivities.length===0&&customActivities.length===0) tips.push({t:"Add an activity",d:"No entertainment or games added yet — even one simple activity keeps guests engaged once the main event winds down.",action:()=>setStep(5)});
              if(gifts.length===0) tips.push({t:"Pick return gifts",d:"You haven't chosen any gifts or favours yet — these are easy to forget until the week of the event.",action:()=>setStep(6)});
              if(!city.trim()) tips.push({t:"Add your city",d:"Without a city we can't match you to local vendors or show realistic pricing — add it in the first step.",action:()=>setStep(1)});
              const topTips=tips.slice(0,2);

              // ── Things you can add from Tendr — only what isn't already in this plan ──
              const crossSell=[];
              if(gifts.length===0) crossSell.push({label:"Gift Hampers",icon:"🎁",href:"/gifting"});
              if(!inviteType) crossSell.push({label:"Invitations & Stationery",icon:"💌",href:"/stationery"});
              if(selectedActivities.length===0&&customActivities.length===0) crossSell.push({label:"Fun Activities",icon:"🎮",href:"/fun-activities"});
              if(!budget||Number(budget)<=0) crossSell.push({label:"Price Estimator",icon:"💰",onClick:()=>openPriceEstimator({occasion:occasion.name,onFinalise:(avg)=>setBudget(String(avg))})});
              crossSell.push({label:"Event Timeline",icon:"🗓️",href:"/timeline-picker"});

              return(
                <div style={{marginBottom:16,display:"flex",flexDirection:"column",gap:12}}>
                  {/* Make it even better — 2 points */}
                  {topTips.length>0&&(
                    <div style={{padding:"14px 16px",borderRadius:12,background:"rgba(196,122,46,0.04)",border:"1px solid rgba(196,122,46,0.12)"}}>
                      <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Make it even better</div>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {topTips.map((tip,i)=>(
                          <button key={i} onClick={tip.action}
                            style={{display:"flex",alignItems:"flex-start",gap:10,textAlign:"left",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:font}}>
                            <span style={{flexShrink:0,width:20,height:20,borderRadius:"50%",background:"rgba(196,122,46,0.12)",color:gold,fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>{i+1}</span>
                            <span>
                              <div style={{fontSize:12.5,fontWeight:700,color:ink,marginBottom:2}}>{tip.t}</div>
                              <div style={{fontSize:11.5,color:muted,lineHeight:1.5}}>{tip.d}</div>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cross-sell — things you can add from the platform */}
                  <div style={{padding:"14px 16px",borderRadius:12,background:"#fff",border:`1px solid rgba(196,122,46,0.14)`}}>
                    <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:9}}>You can also add, from Tendr</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                      {crossSell.map((c,i)=>(
                        <button key={i} onClick={()=>c.onClick?c.onClick():window.open(c.href,"_blank")}
                          style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:100,border:"1.5px solid rgba(196,122,46,0.2)",background:"rgba(196,122,46,0.03)",color:ink,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:font}}>
                          <span>{c.icon}</span>{c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* G. Share actions */}
            <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
              <button onClick={async()=>{setDownloading(true);await withPlanExportMode(()=>downloadPlanCard(planRef.current,occasion.name));setDownloading(false);}} disabled={downloading}
                style={{flex:1,minWidth:120,padding:"12px 14px",borderRadius:12,border:`1px solid rgba(196,122,46,0.25)`,background:"#fff",color:gold,fontSize:12.5,fontWeight:700,cursor:downloading?"wait":"pointer",fontFamily:font,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                {downloading?<><div style={{width:13,height:13,borderRadius:"50%",border:`2px solid rgba(196,122,46,0.2)`,borderTopColor:gold,animation:"spin 0.7s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Generating…</>:<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download PDF</>}
              </button>
              <button
                onClick={()=>{
                  const msg=buildPlanText(occasion,{guests,date,city,venueType,theme,vendors,vendorPackages,budget,ageGroups,selectedActivities,customActivities,customCatering,customDecor,celebrantName,gifts,giftQuantities,selectedEntryExperiences});
                  const who=celebrantName?`${celebrantName}'s `:"";
                  const shareText=`🎉 ${who}${occasion.name} Plan\n\n${msg}\n\n— Made with Tendr`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`,"_blank","noopener");
                }}
                style={{padding:"12px 14px",borderRadius:12,border:"none",background:"#25D366",color:"#fff",fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:font,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.115 1.522 5.845L.057 23.704a.5.5 0 0 0 .614.639l5.975-1.565A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.645-.518-5.148-1.418l-.37-.221-3.814.999.998-3.74-.241-.381A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp
              </button>
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

      {/* bottom CTA — flex footer, always visible except step 7 (the "Tendr wishes you"
          reveal page), which has its own embedded Back/See Plan buttons */}
      {step>0&&step!==7&&(
        <div className="od-step-footer" style={{flexShrink:0,background:"#fff",borderTop:"1px solid rgba(0,0,0,0.07)",padding:"12px 20px calc(12px + env(safe-area-inset-bottom,0px))",zIndex:50}}>
          <div style={{maxWidth:680,margin:"0 auto",display:"flex",gap:10}}>
            {step>0&&<button onClick={back} style={btnGhost}>← Back</button>}
            {step<7&&(
              <button onClick={next} disabled={!canNext()} style={btnPrimary}>
                {step===1&&step1Hint()}
                {step===2&&(theme?`Use "${theme.name}" →`:"Skip — no theme →")}
                {step===3&&(vendors.length>0?"Next: Grand Entrance →":"Skip →")}
                {step===4&&(selectedEntryExperiences.length>0?"Next: Entertainment →":"Skip — explore entertainment →")}
                {step===5&&(selectedActivities.length>0?"Next: Gifts →":"Skip — pick gifts →")}
                {step===6&&(gifts.length>0?"Continue →":"Skip — continue →")}
              </button>
            )}
            {step===8&&(
              <button onClick={async()=>{
                if(token){
                  const planText = buildPlanText(occasion,{guests,date,city,venueType,theme,vendors,vendorPackages,budget,ageGroups,selectedActivities,customActivities,celebrantName,gifts,giftQuantities,selectedEntryExperiences});
                  const pdfToken=planRef.current?await withPlanExportMode(()=>buildPlanPdfChatToken(planRef.current,occasion.name)):"";
                  openOccasionsChat(pdfToken?`${planText}\n\n${pdfToken}`:planText);
                  try{
                    const sp={eventDetails:{eventType:occasion.name,date,location:city,guests,budget},vendorSlots:vendors.map(cat=>({category:cat,vendorName:"",estimatedCost:0,status:"Pending"})),selectedPackages:vendorPackages,chatSent:true,slug};
                    localStorage.setItem("tendr_smart_plan",JSON.stringify(sp));
                    window.dispatchEvent(new CustomEvent("tendr:plan-confirmed"));
                  }catch{}
                } else {
                  navigate("/signup");
                }
              }} style={btnPrimary}>
                Share with Tendr Team →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

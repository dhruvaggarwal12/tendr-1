import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Design tokens ─────────────────────────────────────────────────────────────
const gold    = "#C47A2E";
const goldLt  = "#CCAB4A";
const ink     = "#1C0A04";
const cream   = "#FAF7F2";
const parch   = "#F0E8DC";
const muted   = "#9B7450";
const font    = "'Outfit', sans-serif";
const serif   = "'Cormorant Garamond', Georgia, serif";

// ── Demo data per vendor type ─────────────────────────────────────────────────
const DEMOS = {
  Decorator: {
    name: "Blooms & Beyond Decor Studio",
    tagline: "Where every detail tells your story",
    serviceType: "Decorator",
    city: "South Delhi",
    locations: ["South Delhi", "Gurgaon", "Noida", "Faridabad"],
    rating: 4.9,
    reviews: 142,
    events: 380,
    responseTime: "< 2 hrs",
    years: 8,
    teamSize: 14,
    verified: true,
    bio: "We are a full-service decoration studio specialising in luxury floral arrangements, themed draping, balloon art, and ambient lighting for weddings, corporate events, and intimate celebrations. Every setup is custom-designed — no two events look alike. Our team of 14 professional decorators has transformed 380+ venues across Delhi NCR.",
    specialties: ["Floral Arch & Mandap", "Balloon Canopy", "LED Backdrop", "Draping & Valance", "Table Centrepieces", "Fairy Light Ceiling", "Photobooth Setup", "Stage Décor"],
    eventTypes: ["Wedding", "Engagement", "Birthday", "Baby Shower", "Corporate", "Anniversary", "Sangeet"],
    genres: [],
    instruments: [],
    performingStyle: [],
    social: { instagram: "@bloomsandbeyond", youtube: "", website: "bloomsandbeyond.in" },
    showreel: "",
    packages: [
      {
        name: "Essential",
        price: "₹18,000",
        unit: "per event",
        color: "#F0E8DC",
        accent: gold,
        items: ["Entrance floral gate", "Stage backdrop (8×6 ft)", "2 centrepiece tables", "Balloon clusters", "Basic fairy lights", "Setup & breakdown"],
        bestFor: "Birthdays & small get-togethers",
      },
      {
        name: "Premium",
        price: "₹42,000",
        unit: "per event",
        color: ink,
        accent: goldLt,
        badge: "Most Popular",
        items: ["Grand floral arch (12 ft)", "Full draping & valance", "LED star backdrop", "6 centrepiece tables", "Fairy light canopy ceiling", "Photo-booth corner", "Customised name board", "Setup & full-day standby crew"],
        bestFor: "Engagements, Anniversaries & Birthdays",
      },
      {
        name: "Luxury",
        price: "₹95,000+",
        unit: "starting at",
        color: "#2C1208",
        accent: goldLt,
        items: ["Fully bespoke theme concept", "Full-venue floral installation", "Crystal & chandelier draping", "Branded signage & monogram", "12+ centrepiece tables", "Dedicated art director", "Pre-event site visit", "24-hr setup crew"],
        bestFor: "Weddings & premium corporate events",
      },
    ],
    portfolio: [
      { label: "Wedding Mandap", tags: ["Wedding", "Floral"], gradient: "linear-gradient(135deg,#8B4513,#D4A76A)" },
      { label: "Balloon Canopy", tags: ["Birthday", "Balloon"], gradient: "linear-gradient(135deg,#C2185B,#E91E63)" },
      { label: "LED Backdrop", tags: ["Corporate", "LED"], gradient: "linear-gradient(135deg,#1A237E,#3949AB)" },
      { label: "Sangeet Night", tags: ["Sangeet", "Floral"], gradient: "linear-gradient(135deg,#4A148C,#7B1FA2)" },
      { label: "Baby Shower", tags: ["Baby Shower", "Pastel"], gradient: "linear-gradient(135deg,#F06292,#F8BBD0)" },
      { label: "Anniversary", tags: ["Anniversary", "Romantic"], gradient: "linear-gradient(135deg,#B71C1C,#EF5350)" },
      { label: "Engagement Ring Ceremony", tags: ["Engagement", "Luxury"], gradient: "linear-gradient(135deg,#4E342E,#8D6E63)" },
      { label: "Corporate Launch", tags: ["Corporate", "Minimal"], gradient: "linear-gradient(135deg,#263238,#546E7A)" },
      { label: "Mehendi Decor", tags: ["Wedding", "Traditional"], gradient: "linear-gradient(135deg,#2E7D32,#66BB6A)" },
    ],
    testimonials: [
      { name: "Priya & Rohan Kapoor", event: "Wedding, Feb 2025", rating: 5, text: "The mandap was beyond beautiful — exactly the aesthetic I'd pinned for years. The floral arch was magazine-worthy. Every guest kept complimenting the décor. 100% recommend!" },
      { name: "Sneha Agarwal", event: "30th Birthday, Dec 2024", rating: 5, text: "I gave them one photo reference and they turned the entire venue into a dream. The balloon canopy and fairy lights were perfect. On time, professional, and so creative." },
      { name: "TechStar India Pvt. Ltd.", event: "Product Launch, Jan 2025", rating: 4, text: "Handled a 250-pax corporate event beautifully. Clean, branded setup. Minor delivery delay but the crew resolved it quickly. Would book again for our next quarter event." },
      { name: "Anjali Mehta", event: "Baby Shower, Nov 2024", rating: 5, text: "The pastel floral setup was so delicate and perfect. Loved that they brought their own props. Saved us so much stress on the day itself." },
    ],
  },

  Photographer: {
    name: "Frames by Kabir",
    tagline: "Candid moments, timeless memories",
    serviceType: "Photographer",
    city: "Noida",
    locations: ["Noida", "Delhi", "Gurgaon", "Agra (outstation +extra)"],
    rating: 4.8,
    reviews: 97,
    events: 220,
    responseTime: "< 4 hrs",
    years: 6,
    teamSize: 4,
    verified: true,
    bio: "Kabir & team are candid wedding and portrait photographers based in Noida. With 6 years of experience and 220+ events, we specialise in natural-light storytelling — capturing the real laughs, the tears, the stolen glances. We shoot on Sony mirrorless + drone for aerial coverage. Delivery: 400 edited photos in 21 days.",
    specialties: ["Candid Wedding", "Pre-Wedding Shoot", "Maternity & Newborn", "Corporate Headshots", "Drone Coverage", "Same-Day Edit Reel"],
    eventTypes: ["Wedding", "Pre-Wedding", "Engagement", "Birthday", "Baby Shower", "Corporate"],
    genres: [],
    instruments: [],
    performingStyle: [],
    social: { instagram: "@framesbyKabir", youtube: "Frames by Kabir", website: "" },
    showreel: "",
    packages: [
      {
        name: "Half Day",
        price: "₹22,000",
        unit: "4 hours",
        color: "#F0E8DC",
        accent: gold,
        items: ["1 photographer", "Up to 4 hrs coverage", "300+ raw clicks", "150 edited photos", "Online gallery (30 days)", "Delivery in 15 days"],
        bestFor: "Engagement, Birthday or small events",
      },
      {
        name: "Full Day",
        price: "₹48,000",
        unit: "full day",
        color: ink,
        accent: goldLt,
        badge: "Most Popular",
        items: ["2 photographers + 1 assistant", "Full day (10 hrs) coverage", "800+ raw clicks", "400 edited photos", "1 highlight reel (3 min)", "Drone session (30 min)", "Private gallery link", "Delivery in 21 days"],
        bestFor: "Weddings & Sangeet coverage",
      },
      {
        name: "Wedding Package",
        price: "₹1,10,000+",
        unit: "2-day coverage",
        color: "#2C1208",
        accent: goldLt,
        items: ["2-day full coverage (mehendi to reception)", "3 photographers + drone pilot", "2000+ edited photos", "10-min cinematic film", "Pre-wedding session included", "Album design & print (optional)", "Priority delivery in 14 days"],
        bestFor: "Full wedding multi-event coverage",
      },
    ],
    portfolio: [
      { label: "Bridal Portrait", tags: ["Wedding", "Portrait"], gradient: "linear-gradient(135deg,#880E4F,#F06292)" },
      { label: "Couple Candid", tags: ["Pre-Wedding", "Candid"], gradient: "linear-gradient(135deg,#1A237E,#42A5F5)" },
      { label: "Phera Ceremony", tags: ["Wedding", "Ritual"], gradient: "linear-gradient(135deg,#4E342E,#FF8A65)" },
      { label: "Aerial Venue Shot", tags: ["Wedding", "Drone"], gradient: "linear-gradient(135deg,#004D40,#26A69A)" },
      { label: "Baby Shower", tags: ["Baby Shower", "Portrait"], gradient: "linear-gradient(135deg,#F8BBD0,#CE93D8)" },
      { label: "Corporate Headshot", tags: ["Corporate", "Studio"], gradient: "linear-gradient(135deg,#263238,#607D8B)" },
      { label: "Reception Night", tags: ["Wedding", "Night"], gradient: "linear-gradient(135deg,#212121,#FDD835)" },
      { label: "Mehendi Candid", tags: ["Wedding", "Candid"], gradient: "linear-gradient(135deg,#1B5E20,#AED581)" },
    ],
    testimonials: [
      { name: "Simran & Aarav Joshi", event: "Wedding, Mar 2025", rating: 5, text: "Kabir captured emotions we didn't even notice in the moment. The photos made us cry all over again. The drone shots of the venue were spectacular. Delivery was right on time." },
      { name: "Riya Sharma", event: "Maternity Shoot, Jan 2025", rating: 5, text: "So patient, so professional. The photos are ethereal. He set up a little natural-light studio on location and the results are truly stunning." },
      { name: "Nexus Corp Events", event: "Annual Day, Dec 2024", rating: 4, text: "Good coverage of our 500-pax annual day. Delivered all headshots within 10 days as promised. Would prefer more variety in group shots next time." },
    ],
  },

  DJ: {
    name: "DJ Anmol Singh",
    tagline: "Drop the beat, own the night",
    serviceType: "DJ",
    city: "Gurgaon",
    locations: ["Gurgaon", "Delhi", "Noida", "Chandigarh (outstation)"],
    rating: 4.7,
    reviews: 78,
    events: 310,
    responseTime: "< 1 hr",
    years: 9,
    teamSize: 3,
    verified: true,
    bio: "DJ Anmol Singh is a Gurgaon-based open-format DJ with 9 years on the decks and 300+ events under his belt. Specialising in weddings, corporate parties, and nightclub residencies, Anmol reads the room and tailors every set live — from smooth Bollywood classics to hard-hitting EDM drops. Full pro-grade Pioneer setup included in every booking.",
    specialties: ["Wedding DJ", "Corporate Events", "Bollywood Night", "EDM Drops", "Sufi Evening", "Live Mashups"],
    eventTypes: ["Wedding", "Sangeet", "Corporate Party", "Birthday", "Club Night", "College Fest"],
    genres: ["Bollywood", "EDM", "Sufi", "Punjabi", "Hip-Hop", "House"],
    instruments: ["Pioneer CDJ-3000", "Pioneer DJM-A9 Mixer", "Pioneer RMX-1000"],
    performingStyle: ["Indoor", "Outdoor", "Wedding", "Corporate", "Club"],
    social: { instagram: "@djanmolsingh_official", youtube: "DJ Anmol Live", website: "" },
    showreel: "youtube.com/djanmol-showreel",
    packages: [
      {
        name: "Basic Gig",
        price: "₹15,000",
        unit: "3 hours",
        color: "#F0E8DC",
        accent: gold,
        items: ["DJ Anmol or associate", "3 hrs performance", "Basic Pioneer controller setup", "1 speaker pair (1500W)", "Standard light bar", "Bollywood / commercial set"],
        bestFor: "Birthday parties & small gatherings",
      },
      {
        name: "Event Night",
        price: "₹35,000",
        unit: "5 hours",
        color: ink,
        accent: goldLt,
        badge: "Most Popular",
        items: ["DJ Anmol performing live", "5 hrs full-night set", "Pro Pioneer CDJ-3000 deck", "2×1500W QSC speakers", "Moving head lights + laser", "Custom playlist consultation", "MC coordination", "Crowd hyping & live mashups"],
        bestFor: "Sangeet, Corporate parties & Birthdays",
      },
      {
        name: "Wedding Package",
        price: "₹75,000+",
        unit: "full day",
        color: "#2C1208",
        accent: goldLt,
        items: ["Mehendi → Reception full-day", "Anmol + associate DJ", "Full Pioneer touring rig", "4× JBL line-array speakers", "Full stage lighting truss", "Fog machine & LED dance floor", "Personalised Bride & Groom remix", "Sound check & tech rider met"],
        bestFor: "Full wedding — Sangeet + Reception",
      },
    ],
    portfolio: [
      { label: "Sangeet Night", tags: ["Wedding", "Bollywood"], gradient: "linear-gradient(135deg,#7B1FA2,#E040FB)" },
      { label: "Corporate Bash", tags: ["Corporate", "EDM"], gradient: "linear-gradient(135deg,#0D47A1,#1E88E5)" },
      { label: "Birthday Bash", tags: ["Birthday", "Commercial"], gradient: "linear-gradient(135deg,#C62828,#EF9A9A)" },
      { label: "Sufi Evening", tags: ["Wedding", "Sufi"], gradient: "linear-gradient(135deg,#4E342E,#D7CCC8)" },
      { label: "College Fest", tags: ["College", "EDM"], gradient: "linear-gradient(135deg,#1B5E20,#69F0AE)" },
      { label: "Outdoor Wedding", tags: ["Wedding", "Outdoor"], gradient: "linear-gradient(135deg,#212121,#FDD835)" },
    ],
    testimonials: [
      { name: "Natasha & Vikram Malhotra", event: "Sangeet, Apr 2025", rating: 5, text: "The dance floor was PACKED from 9pm to 2am. Anmol nailed every request — from classic Bollywood to EDM transitions. Our guests are still talking about it." },
      { name: "Pulse HR Solutions", event: "Year-End Party, Dec 2024", rating: 5, text: "Perfectly curated set for a corporate crowd — professional, no inappropriate content, great energy. Employees loved it. Already re-booking for next year." },
      { name: "Rahul Bajaj", event: "25th Birthday, Nov 2024", rating: 4, text: "Great energy and sound quality. Took a bit of time to warm up the crowd but once he got going it was amazing. Good guy, easy to work with." },
    ],
  },

  Caterer: {
    name: "Royal Feast Caterers",
    tagline: "Every dish, a memory",
    serviceType: "Caterer",
    city: "Delhi",
    locations: ["Delhi", "Noida", "Gurgaon", "Greater Noida"],
    rating: 4.8,
    reviews: 203,
    events: 560,
    responseTime: "< 3 hrs",
    years: 12,
    teamSize: 45,
    verified: true,
    bio: "Royal Feast is a Delhi-based premium catering company with 12 years of experience and 560+ events served. We specialise in multi-cuisine buffets, live counters, plated dinners, and corporate lunch boxes. Our kitchen is FSSAI certified and we source fresh local produce daily. Min. order: 50 pax.",
    specialties: ["Multi-Cuisine Buffet", "Live Counters (Chaat, BBQ, Pasta)", "North Indian Thali", "Continental Breakfast", "Corporate Lunch Boxes", "Dessert Station", "Custom Wedding Menu", "Jain & Vegan Options"],
    eventTypes: ["Wedding", "Birthday", "Corporate", "Baby Shower", "Pooja", "Get-together", "Office Lunch"],
    genres: [],
    instruments: [],
    performingStyle: [],
    social: { instagram: "@royalfeastcaterers", youtube: "", website: "royalfeastcaterers.com" },
    showreel: "",
    packages: [
      {
        name: "Starter",
        price: "₹650",
        unit: "per plate (min 50 pax)",
        color: "#F0E8DC",
        accent: gold,
        items: ["2 veg starters", "1 non-veg starter", "3 veg main course", "1 non-veg main course", "Dal + rice + bread", "1 dessert", "Disposable serviceware"],
        bestFor: "Get-togethers & small family events",
      },
      {
        name: "Grand Buffet",
        price: "₹1,200",
        unit: "per plate (min 100 pax)",
        color: ink,
        accent: goldLt,
        badge: "Most Popular",
        items: ["4 veg + 2 non-veg starters", "5 veg + 2 non-veg mains", "Live chaat counter", "Live pasta station", "Biryani live counter", "3 dessert stations", "Mocktail welcome drink", "Staff (1 per 20 guests)", "Premium crockery & linen"],
        bestFor: "Weddings, Engagements & large parties",
      },
      {
        name: "Royal Wedding",
        price: "₹2,100+",
        unit: "per plate",
        color: "#2C1208",
        accent: goldLt,
        items: ["Custom menu consultation", "6+ starters, 8+ mains", "5 live counters (BBQ, chaat, pasta, dessert, mocktail bar)", "Pan-Asian + North Indian + Continental spread", "Dedicated catering manager", "Premium cutlery, bone china & floral centrepieces", "Waitstaff in uniform", "Post-event cleanup"],
        bestFor: "Luxury weddings & corporate galas",
      },
    ],
    portfolio: [
      { label: "Wedding Buffet", tags: ["Wedding", "Buffet"], gradient: "linear-gradient(135deg,#BF360C,#FF8A65)" },
      { label: "Live BBQ Counter", tags: ["Party", "Live Counter"], gradient: "linear-gradient(135deg,#4E342E,#A1887F)" },
      { label: "Chaat Station", tags: ["Wedding", "Chaat"], gradient: "linear-gradient(135deg,#F57F17,#FFCC02)" },
      { label: "Corporate Lunch", tags: ["Corporate", "Plated"], gradient: "linear-gradient(135deg,#1A237E,#5C6BC0)" },
      { label: "Dessert Station", tags: ["Wedding", "Dessert"], gradient: "linear-gradient(135deg,#880E4F,#F48FB1)" },
      { label: "Continental Breakfast", tags: ["Corporate", "Breakfast"], gradient: "linear-gradient(135deg,#1B5E20,#A5D6A7)" },
    ],
    testimonials: [
      { name: "Gupta Wedding Family", event: "Wedding, Jan 2025", rating: 5, text: "600 guests and not a single complaint about food. The live counters were a hit — especially the BBQ and the chaat station. The team was impeccably dressed and very professional." },
      { name: "Zomato India HQ", event: "Quarterly Town Hall, Feb 2025", rating: 5, text: "Fed 300 people a multi-cuisine spread for our Q1 town hall. Delivered on time, set up beautifully, food quality was excellent. Our go-to caterer now." },
      { name: "Meera Agarwal", event: "Baby Shower, Dec 2024", rating: 4, text: "Really nice food and lovely presentation. The mocktail station was a hit. Small hiccup with one live counter starting late but they handled it gracefully." },
    ],
  },

  Band: {
    name: "The Saptarang Ensemble",
    tagline: "Live music that moves you",
    serviceType: "Band",
    city: "Delhi",
    locations: ["Delhi", "Noida", "Gurgaon", "Agra", "Jaipur (outstation)"],
    rating: 4.9,
    reviews: 63,
    events: 175,
    responseTime: "< 6 hrs",
    years: 11,
    teamSize: 7,
    verified: true,
    bio: "Saptarang is a 7-piece live music ensemble specialising in Bollywood classics, sufi nights, jazz brunches, and high-energy wedding sangeet sets. Our band includes 2 vocalists (male + female), rhythm & lead guitar, keys, tabla, and sound. We carry our own 4kW PA system — no extra AV vendor needed.",
    specialties: ["Bollywood Medley", "Sufi Night", "Ghazal Evening", "Sangeet Choreography Songs", "Jazz Brunch Set", "Retro 70s/80s", "Punjabi Folk"],
    eventTypes: ["Wedding", "Sangeet", "Corporate", "Birthday", "College Fest", "Restaurant Shows"],
    genres: ["Bollywood", "Sufi", "Ghazal", "Jazz", "Punjabi", "Retro", "Folk"],
    instruments: ["Guitar (Lead + Rhythm)", "Keyboards", "Tabla", "Cajon", "Bass Guitar", "Violin (on request)"],
    performingStyle: ["Live Band", "Cover Songs", "Bollywood Night", "Sufi Night", "Jazz Set"],
    social: { instagram: "@saptarangmusic", youtube: "Saptarang Official", website: "saptarang.in" },
    showreel: "youtube.com/saptarang-showreel",
    packages: [
      {
        name: "Acoustic Set",
        price: "₹28,000",
        unit: "2 hours",
        color: "#F0E8DC",
        accent: gold,
        items: ["3-piece acoustic setup (vocals + guitar + cajon)", "2 hours live performance", "Basic PA included", "20-song playlist (approved in advance)", "Bollywood / Sufi / Jazz set options"],
        bestFor: "Cocktail hour, small birthday, restaurant show",
      },
      {
        name: "Full Band Night",
        price: "₹65,000",
        unit: "3 hours",
        color: ink,
        accent: goldLt,
        badge: "Most Popular",
        items: ["Full 7-piece band", "3 hrs live performance", "Full 4kW PA system included", "Stage monitors & backline", "30-song custom set list", "Male + female vocalist duet", "Jukebox round (audience requests)", "Sound check included"],
        bestFor: "Sangeet, Corporate parties, College Fest",
      },
      {
        name: "Wedding Special",
        price: "₹1,20,000+",
        unit: "multi-event",
        color: "#2C1208",
        accent: goldLt,
        items: ["Mehendi + Sangeet coverage", "Full band both evenings", "1 dedicated rehearsal session with you", "Custom opening number for couple", "Choreographed group song option", "Full touring PA + stage lighting", "Coordination with DJ for transitions", "Wedding anthem composition (add-on)"],
        bestFor: "Full 2-day wedding music experience",
      },
    ],
    portfolio: [
      { label: "Sangeet Night", tags: ["Wedding", "Bollywood"], gradient: "linear-gradient(135deg,#4A148C,#CE93D8)" },
      { label: "Sufi Evening", tags: ["Corporate", "Sufi"], gradient: "linear-gradient(135deg,#4E342E,#D7CCC8)" },
      { label: "Jazz Brunch", tags: ["Restaurant", "Jazz"], gradient: "linear-gradient(135deg,#BF360C,#FF8A65)" },
      { label: "Corporate Gala", tags: ["Corporate", "Bollywood"], gradient: "linear-gradient(135deg,#1A237E,#5C6BC0)" },
      { label: "Mehendi Evening", tags: ["Wedding", "Folk"], gradient: "linear-gradient(135deg,#1B5E20,#A5D6A7)" },
      { label: "Retro Night", tags: ["Birthday", "Retro"], gradient: "linear-gradient(135deg,#880E4F,#F48FB1)" },
    ],
    testimonials: [
      { name: "Aisha & Devan Nair Wedding", event: "Sangeet, Mar 2025", rating: 5, text: "Everyone was on their feet within 10 minutes. The female vocalist's sufi set had people in tears. They learned our special song in 2 days. Absolutely magical." },
      { name: "Google India", event: "Annual Day, Jan 2025", rating: 5, text: "Performed for our 400-pax annual day. Seamless coordination, incredible energy, zero technical issues. The jazz set during dinner and Bollywood for dancing was the perfect mix." },
      { name: "Rohan Khanna", event: "30th Birthday, Dec 2024", rating: 5, text: "I booked them for a surprise party. The surprise was on me too — they were even better than I expected. The Jukebox round where guests requested songs was a massive hit." },
    ],
  },

  "Makeup Artist": {
    name: "Glam by Rhea Khanna",
    tagline: "Your beauty, amplified",
    serviceType: "Makeup Artist",
    city: "West Delhi",
    locations: ["West Delhi", "South Delhi", "Gurgaon", "Noida"],
    rating: 4.9,
    reviews: 118,
    events: 290,
    responseTime: "< 2 hrs",
    years: 7,
    teamSize: 3,
    verified: true,
    bio: "Rhea Khanna is a Delhi-based bridal and party makeup artist with 7 years of experience and 290+ clients. Trained at VLCC and advanced in K-Beauty techniques, Rhea specialises in flawless HD makeup, skin-prep facials, and hair styling. She uses only premium international brands — Huda Beauty, Charlotte Tilbury, MAC, and Airbrush system. Home visits available across Delhi NCR.",
    specialties: ["Bridal HD Makeup", "Airbrush Makeup", "Party Glam", "Engagement Look", "Hair Styling & Blowout", "Pre-Bridal Facial", "Saree Draping", "Editorial & Shoot Looks"],
    eventTypes: ["Wedding", "Engagement", "Birthday", "Anniversary", "Pre-Wedding Shoot", "Corporate Event", "Reception"],
    genres: [],
    instruments: [],
    performingStyle: [],
    social: { instagram: "@glambyrheakhanna", youtube: "Glam by Rhea", website: "" },
    showreel: "",
    packages: [
      {
        name: "Party Glam",
        price: "₹4,500",
        unit: "per person",
        color: "#F0E8DC",
        accent: gold,
        items: ["HD party makeup", "Hair styling (blowout or updo)", "Lashes included", "Premium international products", "Home visit available", "1.5 hr session"],
        bestFor: "Birthday, Anniversary, Party night",
      },
      {
        name: "Engagement / Pre-Wedding",
        price: "₹9,000",
        unit: "per person",
        color: ink,
        accent: goldLt,
        badge: "Most Popular",
        items: ["Full HD or Airbrush makeup", "Detailed hair styling with accessories setting", "Eye lashes + bindi + tikka", "Pre-bridal skin consultation", "Touch-up kit gifted", "Trial session included", "2.5 hr session"],
        bestFor: "Engagement, Pre-Wedding Shoot, Reception",
      },
      {
        name: "Bridal Full Package",
        price: "₹22,000+",
        unit: "full day",
        color: "#2C1208",
        accent: goldLt,
        items: ["Bridal HD Airbrush makeup + hair", "Includes Mehendi + Sangeet + Wedding day", "Trial session + pre-bridal facial", "Bridesmaid makeup (up to 3 included)", "Premium Charlotte Tilbury + MAC kit", "Saree draping included", "Dedicated assistant on wedding day", "Emergency touch-up kit left with bride"],
        bestFor: "Full bridal experience across all events",
      },
    ],
    portfolio: [
      { label: "Bridal Look", tags: ["Wedding", "Bridal"], gradient: "linear-gradient(135deg,#880E4F,#F48FB1)" },
      { label: "Reception Glam", tags: ["Reception", "Glam"], gradient: "linear-gradient(135deg,#BF360C,#FFAB91)" },
      { label: "Engagement", tags: ["Engagement", "Soft Glam"], gradient: "linear-gradient(135deg,#4A148C,#CE93D8)" },
      { label: "Party Look", tags: ["Birthday", "HD"], gradient: "linear-gradient(135deg,#1A237E,#90CAF9)" },
      { label: "Mehendi Look", tags: ["Wedding", "Traditional"], gradient: "linear-gradient(135deg,#1B5E20,#A5D6A7)" },
      { label: "Shoot Look", tags: ["Editorial", "Bold"], gradient: "linear-gradient(135deg,#212121,#B0BEC5)" },
    ],
    testimonials: [
      { name: "Divya Sharma", event: "Bridal Package, Feb 2025", rating: 5, text: "Rhea is an artist in every sense. The bridal look lasted 14 hours — through the pheras, through happy tears, everything. Her pre-bridal facial a week before made my skin glow. Book her NOW." },
      { name: "Pooja Gupta", event: "Engagement, Jan 2025", rating: 5, text: "I showed her 2 photos and she created something even better. My skin looked like glass. The hair lasted all night. So calm and professional — made me feel so comfortable." },
      { name: "Sunita Kapoor", event: "Birthday Party, Dec 2024", rating: 4, text: "Great makeup, lasted the whole evening. Arrived 15 mins late but made up for it with a stunning look. Products smell amazing — definitely coming back." },
    ],
  },

  Anchor: {
    name: "Rahul Khanna — Live Host",
    tagline: "Every event needs a voice. Let's make it unforgettable.",
    serviceType: "Anchor",
    city: "Delhi",
    locations: ["Delhi", "Noida", "Gurgaon", "All India (outstation)"],
    rating: 4.8,
    reviews: 54,
    events: 430,
    responseTime: "< 2 hrs",
    years: 10,
    teamSize: 1,
    verified: true,
    bio: "Rahul Khanna is a bilingual (Hindi + English) anchor and emcee with 10 years of live event experience. Having hosted 430+ events — from intimate mehendi ceremonies to 2000-pax corporate award nights — Rahul brings warmth, wit, and perfect pacing to every stage. Specialises in weddings, award shows, product launches, and school annual days.",
    specialties: ["Wedding Anchor", "Corporate Award Night", "Product Launch MC", "School Annual Day", "Charity Galas", "Bilingual (Hindi + English)", "Roast & Comedy MC", "Interactive Games Host"],
    eventTypes: ["Wedding", "Corporate", "Award Night", "Product Launch", "Birthday", "School Annual Day", "Conference"],
    genres: [],
    instruments: [],
    performingStyle: ["Formal", "Casual", "Bilingual", "Interactive", "High-energy", "Scripted", "Improvised"],
    social: { instagram: "@rahulkhannaanchor", youtube: "Rahul Khanna Official", website: "rahulkhanna.in" },
    showreel: "youtube.com/rahulkhanna-reel",
    packages: [
      {
        name: "Half Day",
        price: "₹18,000",
        unit: "up to 4 hours",
        color: "#F0E8DC",
        accent: gold,
        items: ["Rahul Khanna anchoring", "Up to 4 hrs on stage", "Script consultation call", "Bilingual (Hindi + English)", "Basic mic & monitor provided", "Customised script segment included"],
        bestFor: "Birthday, small corporate meet, engagements",
      },
      {
        name: "Full Event",
        price: "₹38,000",
        unit: "full day",
        color: ink,
        accent: goldLt,
        badge: "Most Popular",
        items: ["Full-day event anchoring (8 hrs)", "Dedicated script writing session", "Icebreaker games & interactive segments", "Award night or sangeet ceremonies", "Coordination with DJ, band & AV team", "Rehearsal on event day", "Personalised couple/guest shoutouts", "Crowd games & fun rounds"],
        bestFor: "Weddings, Corporate Award Nights, Annual Days",
      },
      {
        name: "Premium Wedding",
        price: "₹75,000+",
        unit: "multi-event",
        color: "#2C1208",
        accent: goldLt,
        items: ["Mehendi + Sangeet + Wedding anchoring", "Full script for each event", "Game design & prize coordination", "Personalised couple documentary voiceover", "Video highlight narration (add-on)", "Multiple language support (Hindi, English, Punjabi)", "Full-day + post-event coordination"],
        bestFor: "Full wedding — 3 events over 2 days",
      },
    ],
    portfolio: [
      { label: "Wedding Ceremony", tags: ["Wedding", "Bilingual"], gradient: "linear-gradient(135deg,#4E342E,#D7CCC8)" },
      { label: "Corporate Award Night", tags: ["Corporate", "Formal"], gradient: "linear-gradient(135deg,#1A237E,#5C6BC0)" },
      { label: "Sangeet Night", tags: ["Wedding", "Fun"], gradient: "linear-gradient(135deg,#7B1FA2,#CE93D8)" },
      { label: "Product Launch", tags: ["Corporate", "MC"], gradient: "linear-gradient(135deg,#263238,#90A4AE)" },
      { label: "School Annual Day", tags: ["School", "Kids"], gradient: "linear-gradient(135deg,#1B5E20,#A5D6A7)" },
      { label: "Birthday Roast", tags: ["Birthday", "Comedy"], gradient: "linear-gradient(135deg,#BF360C,#FF8A65)" },
    ],
    testimonials: [
      { name: "Ananya & Karan Wedding", event: "Wedding + Sangeet, Apr 2025", rating: 5, text: "Rahul made our wedding feel like a Bollywood film. He knew exactly when to be emotional and when to get the crowd laughing. Every family member loved him — especially the dadis!", response: "Thank you so much Ananya & Karan — this was one of my favourite weddings of 2025. Wishing you both a lifetime of happiness! 🥂" },
      { name: "HDFC Life Insurance", event: "Annual Award Night, Feb 2025", rating: 5, text: "Hosted our 800-pax national award night with complete professionalism. His energy was electric. We've already rebooked him for our next quarter summit.", response: "Truly an honour to host HDFC Life — what a fantastic team and audience. Looking forward to the Q3 summit!" },
      { name: "Meghna Patel", event: "30th Birthday, Jan 2025", rating: 5, text: "He turned a party into an experience. The roast segment had everyone in tears laughing. He spent time beforehand to understand our group — it showed.", response: "Meghna — your friends were the best crowd! The prep call really helped me tailor the roast perfectly. Thank you for trusting me with your big 3-0! 🎉" },
    ],
    gst: "07AABKU1234R1Z5",
    performance: {
      genres: ["Bollywood", "Corporate Hosting", "Comedy Roast", "Bilingual (Hindi + English)", "Punjabi"],
      instruments: [],
      showreel: "https://youtube.com/watch?v=demo-anchor-reel",
      instagram: "@rahulkhanna.mc",
      youtube: "youtube.com/@rahulkhannaMC",
      setlist: "Opening ceremony address\nInteractive icebreaker games (6 variations)\nAward presentation scripts\nSangeet games & fun rounds\nCouple Q&A segment\nGuest shoutout moments\nComedic roast format (birthday / farewell)\nMulti-language transitions",
    },
  },
};

const TYPES = Object.keys(DEMOS);
const TABS  = ["Portfolio", "Packages", "About", "Reviews", "Performance"];

// ── Star renderer ─────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? goldLt : "rgba(196,164,130,0.2)"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

// ── Check icon ────────────────────────────────────────────────────────────────
function Check({ size = 14, color = gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VendorDemo() {
  const navigate    = useNavigate();
  const [type, setType] = useState("Anchor");
  const [tab, setTab]   = useState("Portfolio");
  const d = DEMOS[type];

  return (
    <div style={{ minHeight: "100vh", background: cream, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .vd-type-pill { padding: 8px 18px; border-radius: 100px; border: 1.5px solid rgba(196,122,46,0.22); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; background: #fff; color: #9B7450; white-space: nowrap; }
        .vd-type-pill.active { background: ${ink}; color: ${goldLt}; border-color: ${ink}; }
        .vd-tab { padding: 10px 20px; font-size: 14px; font-weight: 600; border: none; background: none; cursor: pointer; color: #9B7450; border-bottom: 2.5px solid transparent; transition: all 0.15s; font-family: ${font}; }
        .vd-tab.active { color: ${ink}; border-color: ${gold}; }
        .vd-portfolio-card { border-radius: 14px; overflow: hidden; break-inside: avoid; margin-bottom: 10px; position: relative; cursor: pointer; transition: transform 0.22s, box-shadow 0.22s; }
        .vd-portfolio-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(28,10,4,0.18) !important; }
        .vd-pkg-card { border-radius: 20px; padding: 28px 24px 24px; flex: 1 1 0; min-width: 240px; position: relative; overflow: hidden; }
        .vd-review-card { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid rgba(196,122,46,0.1); }
        .vd-chip { display: inline-flex; padding: 3px 9px; border-radius: 100px; font-size: 10.5px; font-weight: 700; background: rgba(196,122,46,0.1); color: ${gold}; letter-spacing: 0.03em; }
        .vd-cta-book { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 100px; background: linear-gradient(135deg,${gold},${goldLt}); color: #fff; font-size: 15px; font-weight: 700; border: none; cursor: pointer; font-family: ${font}; box-shadow: 0 6px 24px rgba(196,122,46,0.38); transition: box-shadow 0.18s, transform 0.12s; }
        .vd-cta-book:hover { box-shadow: 0 10px 36px rgba(196,122,46,0.52); transform: translateY(-1px); }
        .vd-cta-chat { display: inline-flex; align-items: center; gap: 8px; padding: 14px 24px; border-radius: 100px; background: rgba(28,10,4,0.06); color: ${ink}; font-size: 15px; font-weight: 600; border: 1.5px solid rgba(28,10,4,0.14); cursor: pointer; font-family: ${font}; transition: background 0.15s; }
        .vd-cta-chat:hover { background: rgba(28,10,4,0.10); }
        @media (max-width: 700px) {
          .vd-hero-stats { flex-direction: column !important; gap: 12px !important; }
          .vd-packages-row { flex-direction: column !important; }
          .vd-about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ background: ink, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "rgba(255,248,236,0.55)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, fontFamily: font }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: goldLt, fontFamily: font }}>Demo Vendor Portfolio</span>
        </div>
        <div style={{ width: 50 }} />
      </div>

      {/* ── Vendor type switcher ── */}
      <div style={{ background: "#fff", borderBottom: `1px solid rgba(196,122,46,0.1)`, padding: "14px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10, fontFamily: font }}>Switch vendor type</p>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {TYPES.map(t => (
              <button key={t} className={`vd-type-pill${type === t ? " active" : ""}`} onClick={() => { setType(t); setTab("Portfolio"); }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero cover ── */}
      <div style={{ height: 160, position: "relative", overflow: "hidden" }}>
        <img
          src={`https://picsum.photos/seed/${encodeURIComponent(d.serviceType + "-cover")}/1200/320`}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(28,10,4,0.72) 0%, rgba(44,18,8,0.55) 60%, rgba(61,26,6,0.4) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top, rgba(250,247,242,0.25) 0%, transparent 100%)" }} />
      </div>

      {/* ── Profile header ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ marginTop: -48, marginBottom: 24, display: "flex", gap: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${gold}, ${goldLt})`, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 18px rgba(28,10,4,0.18)" }}>
            <span style={{ fontSize: 32, fontFamily: serif, color: "#fff", fontWeight: 400 }}>{d.name[0]}</span>
          </div>
          {/* Name + badges */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: serif, fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 500, color: ink, lineHeight: 1.15 }}>{d.name}</h1>
              {d.verified && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.12)", color: "#16A34A", borderRadius: 100, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Verified
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
              <span style={{ background: `rgba(196,122,46,0.1)`, color: gold, borderRadius: 100, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{d.serviceType}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: muted }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {d.city}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: muted }}>
                <Stars rating={d.rating} size={12} />
                {d.rating} ({d.reviews} reviews)
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: muted, marginTop: 5, fontStyle: "italic" }}>"{d.tagline}"</p>
          </div>
          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", paddingBottom: 4 }}>
            <button className="vd-cta-book">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Book Now
            </button>
            <button className="vd-cta-chat">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat
            </button>
          </div>
        </div>

        {/* ── Quick stats bar ── */}
        <div className="vd-hero-stats" style={{ display: "flex", gap: 0, background: "#fff", borderRadius: 16, border: `1px solid rgba(196,122,46,0.12)`, overflow: "hidden", marginBottom: 24, boxShadow: "0 2px 12px rgba(28,10,4,0.06)" }}>
          {[
            { label: "Events Done", value: d.events + "+" },
            { label: "Years Active", value: d.years },
            { label: "Team Size", value: d.teamSize },
            { label: "Response Time", value: d.responseTime },
            { label: "Rating", value: d.rating },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "14px 12px", textAlign: "center", borderRight: i < 4 ? "1px solid rgba(196,122,46,0.1)" : "none" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: ink, fontFamily: font }}>{s.value}</div>
              <div style={{ fontSize: 10.5, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tab nav ── */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid rgba(196,122,46,0.12)`, marginBottom: 28, background: "#fff", borderRadius: "12px 12px 0 0", overflow: "hidden", boxShadow: "0 2px 8px rgba(28,10,4,0.04)", overflowX: "auto" }}>
          {TABS.filter(t => t !== "Performance" || !!d.performance).map(t => (
            <button key={t} className={`vd-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {/* ══ PORTFOLIO TAB ══ */}
        {tab === "Portfolio" && (
          <div>
            {/* Occasion chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {d.eventTypes.map(e => (
                <span key={e} className="vd-chip">{e}</span>
              ))}
            </div>
            {/* Masonry grid */}
            <div style={{ columns: "3 200px", columnGap: 10 }}>
              {d.portfolio.map((p, i) => {
                const seed = encodeURIComponent((d.serviceType + "-" + p.label).toLowerCase().replace(/\s+/g, "-"));
                const ar = i % 3 === 0 ? "3/4" : "4/3";
                return (
                  <div key={i} className="vd-portfolio-card" style={{ boxShadow: "0 2px 10px rgba(28,10,4,0.1)" }}>
                    <div style={{ aspectRatio: ar, position: "relative", overflow: "hidden" }}>
                      <img
                        src={`https://picsum.photos/seed/${seed}/480/640`}
                        alt={p.label}
                        loading="lazy"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,4,2,0.78) 0%, rgba(10,4,2,0.18) 55%, transparent 100%)" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#FFF8EC", marginBottom: 4, fontFamily: serif }}>{p.label}</div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {p.tags.map(t => (
                            <span key={t} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,248,236,0.85)", background: "rgba(0,0,0,0.32)", borderRadius: 100, padding: "2px 7px", backdropFilter: "blur(6px)" }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ textAlign: "center", fontSize: 12.5, color: muted, marginTop: 20, fontStyle: "italic" }}>
              These are representative portfolio samples. Actual work photos will appear when vendors upload their portfolio.
            </p>
          </div>
        )}

        {/* ══ PACKAGES TAB ══ */}
        {tab === "Packages" && (
          <div>
            <div className="vd-packages-row" style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
              {d.packages.map((pkg, i) => (
                <div key={i} className="vd-pkg-card" style={{ background: pkg.color, color: pkg.color === "#F0E8DC" ? ink : "#FFF8EC" }}>
                  {pkg.badge && (
                    <div style={{ position: "absolute", top: 16, right: 16, background: gold, color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em" }}>{pkg.badge}</div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: pkg.accent, marginBottom: 8 }}>Package</div>
                  <div style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 500, color: pkg.color === "#F0E8DC" ? ink : "#FFF8EC", marginBottom: 4 }}>{pkg.name}</div>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontFamily: serif, fontSize: "2.2rem", fontWeight: 500, color: pkg.accent }}>{pkg.price}</span>
                    <span style={{ fontSize: 12, color: pkg.color === "#F0E8DC" ? muted : "rgba(255,248,236,0.55)", marginLeft: 6 }}>{pkg.unit}</span>
                  </div>
                  <div style={{ fontSize: 11, color: pkg.color === "#F0E8DC" ? muted : "rgba(255,248,236,0.5)", marginBottom: 16, fontStyle: "italic" }}>Best for: {pkg.bestFor}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    {pkg.items.map((item, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ marginTop: 1, flexShrink: 0 }}><Check size={13} color={pkg.accent} /></span>
                        <span style={{ fontSize: 13, color: pkg.color === "#F0E8DC" ? ink : "rgba(255,248,236,0.85)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <button style={{ width: "100%", padding: "12px", borderRadius: 100, background: pkg.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    Request this Package →
                  </button>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 20, fontStyle: "italic" }}>
              Prices are indicative and vary by date, location, and event size. Chat with the vendor for a custom quote.
            </p>
          </div>
        )}

        {/* ══ ABOUT TAB ══ */}
        {tab === "About" && (
          <div>
            {/* Bio */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", marginBottom: 20, border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
              <h3 style={{ fontFamily: serif, fontSize: "1.25rem", fontWeight: 500, color: ink, marginBottom: 12 }}>About</h3>
              <p style={{ fontSize: 14, color: "#4A3020", lineHeight: 1.8 }}>{d.bio}</p>
            </div>

            <div className="vd-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Specialties */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Specialties</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {d.specialties.map(s => (
                    <span key={s} style={{ background: cream, border: "1px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: muted }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Events served */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Event Types</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {d.eventTypes.map(e => (
                    <span key={e} className="vd-chip">{e}</span>
                  ))}
                </div>
              </div>

              {/* Service areas */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Service Areas</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {d.locations.map(loc => (
                    <div key={loc} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#4A3020" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {loc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gig-specific details (genres, instruments, styles) */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Years of Experience", value: `${d.years} years` },
                    { label: "Team Size", value: `${d.teamSize} ${d.teamSize === 1 ? "person" : "people"}` },
                    ...(d.genres.length ? [{ label: "Genres", value: d.genres.join(", ") }] : []),
                    ...(d.instruments.length ? [{ label: "Instruments / Gear", value: d.instruments.join(", ") }] : []),
                    ...(d.performingStyle.length ? [{ label: "Style", value: d.performingStyle.join(", ") }] : []),
                    ...(d.social.instagram ? [{ label: "Instagram", value: d.social.instagram }] : []),
                    ...(d.social.website ? [{ label: "Website", value: d.social.website }] : []),
                    ...(d.showreel ? [{ label: "Showreel", value: d.showreel }] : []),
                  ].map((row, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{row.label}</div>
                      <div style={{ fontSize: 13.5, color: ink, marginTop: 2 }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ REVIEWS TAB ══ */}
        {tab === "Reviews" && (
          <div>
            {/* Rating summary */}
            <div style={{ background: ink, borderRadius: 20, padding: "24px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: serif, fontSize: "3.5rem", fontWeight: 400, color: goldLt, lineHeight: 1 }}>{d.rating}</div>
                <Stars rating={d.rating} size={16} />
                <div style={{ fontSize: 12, color: "rgba(255,248,236,0.45)", marginTop: 6 }}>{d.reviews} reviews</div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                {[5, 4, 3, 2, 1].map(n => {
                  const pct = n === 5 ? 78 : n === 4 ? 16 : n === 3 ? 4 : n === 2 ? 1 : 1;
                  return (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,248,236,0.55)", width: 10, textAlign: "right" }}>{n}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill={goldLt} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: goldLt, borderRadius: 100 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "rgba(255,248,236,0.35)", width: 28 }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {d.testimonials.map((r, i) => (
                <div key={i} className="vd-review-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{r.name}</div>
                      <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{r.event}</div>
                    </div>
                    <Stars rating={r.rating} size={13} />
                  </div>
                  <p style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.7 }}>"{r.text}"</p>
                  {r.response && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(196,122,46,0.12)", display: "flex", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${gold}, ${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: gold, marginBottom: 4 }}>Vendor Response</div>
                        <p style={{ fontSize: 13, color: "#4A3020", lineHeight: 1.65, margin: 0 }}>{r.response}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 20, fontStyle: "italic" }}>
              Live reviews are pulled from verified bookings on Tendr. These are demo samples.
            </p>
          </div>
        )}

        {/* ══ PERFORMANCE TAB ══ */}
        {tab === "Performance" && d.performance && (
          <div>
            {/* Showreel */}
            {d.performance.showreel && (
              <div style={{ background: ink, borderRadius: 20, padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `rgba(196,122,46,0.15)`, border: `1px solid rgba(196,122,46,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={goldLt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,248,236,0.45)", marginBottom: 4 }}>Showreel</div>
                  <div style={{ fontFamily: serif, fontSize: "1.1rem", fontWeight: 500, color: "#FFF8EC", marginBottom: 6 }}>Watch {d.name.split(" ")[0]} in action</div>
                  <a href={d.performance.showreel} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: goldLt, textDecoration: "none", fontWeight: 600 }}>▶ Open Showreel →</a>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Genres */}
              {d.performance.genres?.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)", gridColumn: d.performance.instruments?.length ? "auto" : "1 / -1" }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Genres / Styles</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {d.performance.genres.map(g => (
                      <span key={g} style={{ background: cream, border: `1px solid rgba(196,122,46,0.2)`, borderRadius: 100, padding: "5px 13px", fontSize: 12.5, fontWeight: 600, color: "#4A3020" }}>{g}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instruments */}
              {d.performance.instruments?.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Instruments / Gear</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {d.performance.instruments.map(inst => (
                      <span key={inst} style={{ background: cream, border: `1px solid rgba(196,122,46,0.2)`, borderRadius: 100, padding: "5px 13px", fontSize: 12.5, fontWeight: 600, color: "#4A3020" }}>{inst}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Social links */}
            {(d.performance.instagram || d.performance.youtube) && (
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Social & Links</h3>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {d.performance.instagram && (
                    <a href={`https://instagram.com/${d.performance.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 100, background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      {d.performance.instagram}
                    </a>
                  )}
                  {d.performance.youtube && (
                    <a href={`https://${d.performance.youtube}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 100, background: "#FF0000", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Setlist */}
            {d.performance.setlist && (
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Sample Set / Rundown</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {d.performance.setlist.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: cream, border: `1px solid rgba(196,122,46,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: gold, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                      <span style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.5 }}>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Bottom padding ── */}
        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}

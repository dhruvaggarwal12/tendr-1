import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const gold   = "#C47A2E";
const goldLt = "#CCAB4A";
const ink    = "#1C0A04";
const cream  = "#FAF7F2";
const parch  = "#F0E8DC";
const muted  = "#9B7450";
const font   = "'Outfit', sans-serif";
const serif  = "'Cormorant Garamond', Georgia, serif";
const dance  = "'Dancing Script', cursive";

const GIG_PROS = ["Anchor", "DJ", "Band", "Coordinator", "Choreographer"];

const DEMOS = {
  Decorator: {
    name: "Blooms & Beyond Decor Studio",
    tagline: "Where every detail tells your story",
    serviceType: "Decorator",
    city: "South Delhi",
    locations: ["South Delhi", "Gurgaon", "Noida", "Faridabad"],
    rating: 4.9, reviews: 142, events: 380, responseTime: "< 2 hrs", years: 8, teamSize: 14,
    verified: true,
    bio: "We are a full-service decoration studio specialising in luxury floral arrangements, themed draping, balloon art, and ambient lighting for weddings, corporate events, and intimate celebrations. Every setup is custom-designed — no two events look alike. Our team of 14 professional decorators has transformed 380+ venues across Delhi NCR.",
    specialties: ["Floral Arch & Mandap","Balloon Canopy","LED Backdrop","Draping & Valance","Table Centrepieces","Fairy Light Ceiling","Photobooth Setup","Stage Décor"],
    eventTypes: ["Wedding","Engagement","Birthday","Baby Shower","Corporate","Anniversary","Sangeet"],
    genres: [], instruments: [], performingStyle: [],
    social: { instagram: "@bloomsandbeyond", youtube: "", website: "bloomsandbeyond.in" },
    showreel: "",
    packages: [
      { name: "Essential", price: "₹18,000", unit: "per event", color: "#F0E8DC", accent: gold, items: ["Entrance floral gate","Stage backdrop (8×6 ft)","2 centrepiece tables","Balloon clusters","Basic fairy lights","Setup & breakdown"], bestFor: "Birthdays & small get-togethers" },
      { name: "Premium", price: "₹42,000", unit: "per event", color: ink, accent: goldLt, badge: "Most Popular", items: ["Grand floral arch (12 ft)","Full draping & valance","LED star backdrop","6 centrepiece tables","Fairy light canopy ceiling","Photo-booth corner","Customised name board","Setup & full-day standby crew"], bestFor: "Engagements, Anniversaries & Birthdays" },
      { name: "Luxury", price: "₹95,000+", unit: "starting at", color: "#2C1208", accent: goldLt, items: ["Fully bespoke theme concept","Full-venue floral installation","Crystal & chandelier draping","Branded signage & monogram","12+ centrepiece tables","Dedicated art director","Pre-event site visit","24-hr setup crew"], bestFor: "Weddings & premium corporate events" },
    ],
    portfolio: [
      { label: "Wedding Mandap", tags: ["Wedding","Floral"] },
      { label: "Balloon Canopy", tags: ["Birthday","Balloon"] },
      { label: "LED Backdrop", tags: ["Corporate","LED"] },
      { label: "Sangeet Night", tags: ["Sangeet","Floral"] },
      { label: "Baby Shower", tags: ["Baby Shower","Pastel"] },
      { label: "Anniversary", tags: ["Anniversary","Romantic"] },
      { label: "Engagement Ring Ceremony", tags: ["Engagement","Luxury"] },
      { label: "Corporate Launch", tags: ["Corporate","Minimal"] },
      { label: "Mehendi Decor", tags: ["Wedding","Traditional"] },
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
    locations: ["Noida","Delhi","Gurgaon","Agra (outstation +extra)"],
    rating: 4.8, reviews: 97, events: 220, responseTime: "< 4 hrs", years: 6, teamSize: 4,
    verified: true,
    bio: "Kabir & team are candid wedding and portrait photographers based in Noida. With 6 years of experience and 220+ events, we specialise in natural-light storytelling — capturing the real laughs, the tears, the stolen glances. We shoot on Sony mirrorless + drone for aerial coverage. Delivery: 400 edited photos in 21 days.",
    specialties: ["Candid Wedding","Pre-Wedding Shoot","Maternity & Newborn","Corporate Headshots","Drone Coverage","Same-Day Edit Reel"],
    eventTypes: ["Wedding","Pre-Wedding","Engagement","Birthday","Baby Shower","Corporate"],
    genres: [], instruments: [], performingStyle: [],
    social: { instagram: "@framesbyKabir", youtube: "Frames by Kabir", website: "" },
    showreel: "",
    packages: [
      { name: "Half Day", price: "₹22,000", unit: "4 hours", color: "#F0E8DC", accent: gold, items: ["1 photographer","Up to 4 hrs coverage","300+ raw clicks","150 edited photos","Online gallery (30 days)","Delivery in 15 days"], bestFor: "Engagement, Birthday or small events" },
      { name: "Full Day", price: "₹48,000", unit: "full day", color: ink, accent: goldLt, badge: "Most Popular", items: ["2 photographers + 1 assistant","Full day (10 hrs) coverage","800+ raw clicks","400 edited photos","1 highlight reel (3 min)","Drone session (30 min)","Private gallery link","Delivery in 21 days"], bestFor: "Weddings & Sangeet coverage" },
      { name: "Wedding Package", price: "₹1,10,000+", unit: "2-day coverage", color: "#2C1208", accent: goldLt, items: ["2-day full coverage (mehendi to reception)","3 photographers + drone pilot","2000+ edited photos","10-min cinematic film","Pre-wedding session included","Album design & print (optional)","Priority delivery in 14 days"], bestFor: "Full wedding multi-event coverage" },
    ],
    portfolio: [
      { label: "Bridal Portrait", tags: ["Wedding","Portrait"] },
      { label: "Couple Candid", tags: ["Pre-Wedding","Candid"] },
      { label: "Phera Ceremony", tags: ["Wedding","Ritual"] },
      { label: "Aerial Venue Shot", tags: ["Wedding","Drone"] },
      { label: "Baby Shower", tags: ["Baby Shower","Portrait"] },
      { label: "Corporate Headshot", tags: ["Corporate","Studio"] },
      { label: "Reception Night", tags: ["Wedding","Night"] },
      { label: "Mehendi Candid", tags: ["Wedding","Candid"] },
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
    locations: ["Gurgaon","Delhi","Noida","Chandigarh (outstation)"],
    rating: 4.7, reviews: 78, events: 310, responseTime: "< 1 hr", years: 9, teamSize: 3,
    verified: true,
    phone: "+91 98765 11111",
    available: true,
    bio: "DJ Anmol Singh is a Gurgaon-based open-format DJ with 9 years on the decks and 300+ events under his belt. Specialising in weddings, corporate parties, and nightclub residencies, Anmol reads the room and tailors every set live — from smooth Bollywood classics to hard-hitting EDM drops. Full pro-grade Pioneer setup included in every booking.",
    specialties: ["Wedding DJ","Corporate Events","Bollywood Night","EDM Drops","Sufi Evening","Live Mashups"],
    eventTypes: ["Wedding","Sangeet","Corporate Party","Birthday","Club Night","College Fest"],
    genres: ["Bollywood","EDM","Sufi","Punjabi","Hip-Hop","House"],
    instruments: ["Pioneer CDJ-3000","Pioneer DJM-A9 Mixer","Pioneer RMX-1000"],
    performingStyle: ["Indoor","Outdoor","Wedding","Corporate","Club"],
    social: { instagram: "@djanmolsingh_official", youtube: "DJ Anmol Live", website: "" },
    showreel: "youtube.com/djanmol-showreel",
    sellingPoints: [
      { title: "Reads the Room", sub: "Live set tailored every night" },
      { title: "Pro Pioneer Setup", sub: "CDJ-3000 + DJM-A9 rig" },
      { title: "All Genres", sub: "Bollywood to EDM and beyond" },
      { title: "9 Years on the Decks", sub: "300+ events delivered" },
    ],
    portfolioCategories: [
      { label: "Wedding", count: 28 },
      { label: "Corporate", count: 15 },
      { label: "Birthday", count: 20 },
      { label: "Club Night", count: 12 },
      { label: "College Fest", count: 9 },
      { label: "Sangeet", count: 18 },
    ],
    packages: [
      { name: "Basic Gig", price: "₹15,000", unit: "3 hours", color: "#F0E8DC", accent: gold, items: ["DJ Anmol or associate","3 hrs performance","Basic Pioneer controller setup","1 speaker pair (1500W)","Standard light bar","Bollywood / commercial set"], bestFor: "Birthday parties & small gatherings" },
      { name: "Event Night", price: "₹35,000", unit: "5 hours", color: ink, accent: goldLt, badge: "Most Popular", items: ["DJ Anmol performing live","5 hrs full-night set","Pro Pioneer CDJ-3000 deck","2×1500W QSC speakers","Moving head lights + laser","Custom playlist consultation","MC coordination","Crowd hyping & live mashups"], bestFor: "Sangeet, Corporate parties & Birthdays" },
      { name: "Wedding Package", price: "₹75,000+", unit: "full day", color: "#2C1208", accent: goldLt, items: ["Mehendi → Reception full-day","Anmol + associate DJ","Full Pioneer touring rig","4× JBL line-array speakers","Full stage lighting truss","Fog machine & LED dance floor","Personalised Bride & Groom remix","Sound check & tech rider met"], bestFor: "Full wedding — Sangeet + Reception" },
    ],
    portfolio: [
      { label: "Sangeet Night", tags: ["Wedding","Bollywood"] },
      { label: "Corporate Bash", tags: ["Corporate","EDM"] },
      { label: "Birthday Bash", tags: ["Birthday","Commercial"] },
      { label: "Sufi Evening", tags: ["Wedding","Sufi"] },
      { label: "College Fest", tags: ["College","EDM"] },
      { label: "Outdoor Wedding", tags: ["Wedding","Outdoor"] },
    ],
    testimonials: [
      { name: "Natasha & Vikram Malhotra", event: "Sangeet, Apr 2025", rating: 5, text: "The dance floor was PACKED from 9pm to 2am. Anmol nailed every request — from classic Bollywood to EDM transitions. Our guests are still talking about it." },
      { name: "Pulse HR Solutions", event: "Year-End Party, Dec 2024", rating: 5, text: "Perfectly curated set for a corporate crowd — professional, no inappropriate content, great energy. Employees loved it. Already re-booking for next year." },
      { name: "Rahul Bajaj", event: "25th Birthday, Nov 2024", rating: 4, text: "Great energy and sound quality. Took a bit of time to warm up the crowd but once he got going it was amazing. Good guy, easy to work with." },
    ],
    performance: {
      genres: ["Bollywood","EDM","Sufi","Punjabi","Hip-Hop","House"],
      instruments: ["Pioneer CDJ-3000","Pioneer DJM-A9 Mixer","Pioneer RMX-1000"],
      showreel: "https://youtube.com/watch?v=djanmol-showreel",
      instagram: "@djanmolsingh_official",
      youtube: "youtube.com/djAnmolLive",
      setlist: "Opening set — Bollywood arrivals (90 min)\nCrowd warm-up — Punjabi commercial (45 min)\nSangeet games & interactive rounds\nMashup set — Bollywood × EDM crossover\nPeak hour — Full EDM drops\nPrime time — Guest requests & dedications\nClosing set — Retro Bollywood midnight special",
    },
  },

  Caterer: {
    name: "Royal Feast Caterers",
    tagline: "Every dish, a memory",
    serviceType: "Caterer",
    city: "Delhi",
    locations: ["Delhi","Noida","Gurgaon","Greater Noida"],
    rating: 4.8, reviews: 203, events: 560, responseTime: "< 3 hrs", years: 12, teamSize: 45,
    verified: true,
    bio: "Royal Feast is a Delhi-based premium catering company with 12 years of experience and 560+ events served. We specialise in multi-cuisine buffets, live counters, plated dinners, and corporate lunch boxes. Our kitchen is FSSAI certified and we source fresh local produce daily. Min. order: 50 pax.",
    specialties: ["Multi-Cuisine Buffet","Live Counters (Chaat, BBQ, Pasta)","North Indian Thali","Continental Breakfast","Corporate Lunch Boxes","Dessert Station","Custom Wedding Menu","Jain & Vegan Options"],
    eventTypes: ["Wedding","Birthday","Corporate","Baby Shower","Pooja","Get-together","Office Lunch"],
    genres: [], instruments: [], performingStyle: [],
    social: { instagram: "@royalfeastcaterers", youtube: "", website: "royalfeastcaterers.com" },
    showreel: "",
    packages: [
      { name: "Starter", price: "₹650", unit: "per plate (min 50 pax)", color: "#F0E8DC", accent: gold, items: ["2 veg starters","1 non-veg starter","3 veg main course","1 non-veg main course","Dal + rice + bread","1 dessert","Disposable serviceware"], bestFor: "Get-togethers & small family events" },
      { name: "Grand Buffet", price: "₹1,200", unit: "per plate (min 100 pax)", color: ink, accent: goldLt, badge: "Most Popular", items: ["4 veg + 2 non-veg starters","5 veg + 2 non-veg mains","Live chaat counter","Live pasta station","Biryani live counter","3 dessert stations","Mocktail welcome drink","Staff (1 per 20 guests)","Premium crockery & linen"], bestFor: "Weddings, Engagements & large parties" },
      { name: "Royal Wedding", price: "₹2,100+", unit: "per plate", color: "#2C1208", accent: goldLt, items: ["Custom menu consultation","6+ starters, 8+ mains","5 live counters (BBQ, chaat, pasta, dessert, mocktail bar)","Pan-Asian + North Indian + Continental spread","Dedicated catering manager","Premium cutlery, bone china & floral centrepieces","Waitstaff in uniform","Post-event cleanup"], bestFor: "Luxury weddings & corporate galas" },
    ],
    portfolio: [
      { label: "Wedding Buffet", tags: ["Wedding","Buffet"] },
      { label: "Live BBQ Counter", tags: ["Party","Live Counter"] },
      { label: "Chaat Station", tags: ["Wedding","Chaat"] },
      { label: "Corporate Lunch", tags: ["Corporate","Plated"] },
      { label: "Dessert Station", tags: ["Wedding","Dessert"] },
      { label: "Continental Breakfast", tags: ["Corporate","Breakfast"] },
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
    locations: ["Delhi","Noida","Gurgaon","Agra","Jaipur (outstation)"],
    rating: 4.9, reviews: 63, events: 175, responseTime: "< 6 hrs", years: 11, teamSize: 7,
    verified: true,
    phone: "+91 98765 22222",
    available: true,
    bio: "Saptarang is a 7-piece live music ensemble specialising in Bollywood classics, sufi nights, jazz brunches, and high-energy wedding sangeet sets. Our band includes 2 vocalists (male + female), rhythm & lead guitar, keys, tabla, and sound. We carry our own 4kW PA system — no extra AV vendor needed.",
    specialties: ["Bollywood Medley","Sufi Night","Ghazal Evening","Sangeet Choreography Songs","Jazz Brunch Set","Retro 70s/80s","Punjabi Folk"],
    eventTypes: ["Wedding","Sangeet","Corporate","Birthday","College Fest","Restaurant Shows"],
    genres: ["Bollywood","Sufi","Ghazal","Jazz","Punjabi","Retro","Folk"],
    instruments: ["Guitar (Lead + Rhythm)","Keyboards","Tabla","Cajon","Bass Guitar","Violin (on request)"],
    performingStyle: ["Live Band","Cover Songs","Bollywood Night","Sufi Night","Jazz Set"],
    social: { instagram: "@saptarangmusic", youtube: "Saptarang Official", website: "saptarang.in" },
    showreel: "youtube.com/saptarang-showreel",
    sellingPoints: [
      { title: "7-Piece Live Ensemble", sub: "Full band, full energy" },
      { title: "PA System Included", sub: "No extra AV vendor needed" },
      { title: "Original + Covers", sub: "Bollywood, Sufi, Jazz & more" },
      { title: "Wedding Specialists", sub: "175+ weddings performed" },
    ],
    portfolioCategories: [
      { label: "Wedding", count: 32 },
      { label: "Corporate", count: 14 },
      { label: "Sangeet", count: 22 },
      { label: "Birthday", count: 10 },
      { label: "Restaurant Shows", count: 8 },
      { label: "College Fest", count: 6 },
    ],
    packages: [
      { name: "Acoustic Set", price: "₹28,000", unit: "2 hours", color: "#F0E8DC", accent: gold, items: ["3-piece acoustic setup (vocals + guitar + cajon)","2 hours live performance","Basic PA included","20-song playlist (approved in advance)","Bollywood / Sufi / Jazz set options"], bestFor: "Cocktail hour, small birthday, restaurant show" },
      { name: "Full Band Night", price: "₹65,000", unit: "3 hours", color: ink, accent: goldLt, badge: "Most Popular", items: ["Full 7-piece band","3 hrs live performance","Full 4kW PA system included","Stage monitors & backline","30-song custom set list","Male + female vocalist duet","Jukebox round (audience requests)","Sound check included"], bestFor: "Sangeet, Corporate parties, College Fest" },
      { name: "Wedding Special", price: "₹1,20,000+", unit: "multi-event", color: "#2C1208", accent: goldLt, items: ["Mehendi + Sangeet coverage","Full band both evenings","1 dedicated rehearsal session with you","Custom opening number for couple","Choreographed group song option","Full touring PA + stage lighting","Coordination with DJ for transitions","Wedding anthem composition (add-on)"], bestFor: "Full 2-day wedding music experience" },
    ],
    portfolio: [
      { label: "Sangeet Night", tags: ["Wedding","Bollywood"] },
      { label: "Sufi Evening", tags: ["Corporate","Sufi"] },
      { label: "Jazz Brunch", tags: ["Restaurant","Jazz"] },
      { label: "Corporate Gala", tags: ["Corporate","Bollywood"] },
      { label: "Mehendi Evening", tags: ["Wedding","Folk"] },
      { label: "Retro Night", tags: ["Birthday","Retro"] },
    ],
    testimonials: [
      { name: "Aisha & Devan Nair Wedding", event: "Sangeet, Mar 2025", rating: 5, text: "Everyone was on their feet within 10 minutes. The female vocalist's sufi set had people in tears. They learned our special song in 2 days. Absolutely magical." },
      { name: "Google India", event: "Annual Day, Jan 2025", rating: 5, text: "Performed for our 400-pax annual day. Seamless coordination, incredible energy, zero technical issues. The jazz set during dinner and Bollywood for dancing was the perfect mix." },
      { name: "Rohan Khanna", event: "30th Birthday, Dec 2024", rating: 5, text: "I booked them for a surprise party. The surprise was on me too — they were even better than I expected. The Jukebox round where guests requested songs was a massive hit." },
    ],
    performance: {
      genres: ["Bollywood","Sufi","Ghazal","Jazz","Punjabi","Retro","Folk"],
      instruments: ["Guitar (Lead + Rhythm)","Keyboards","Tabla","Cajon","Bass Guitar","Violin (on request)"],
      showreel: "https://youtube.com/watch?v=saptarang-showreel",
      instagram: "@saptarangmusic",
      youtube: "youtube.com/SaptarangOfficial",
      setlist: "Soundcheck & lineup walk-through\nOpening medley — Arijit Singh classics\nSufi segment — Bulleh Shah to Rahat Fateh Ali Khan\nBollywood retro — 70s & 80s hits\nPunjabi set — crowd energy up\nJukebox round — audience requests\nCouple special song (customised)\nClosing anthem",
    },
  },

  "Makeup Artist": {
    name: "Glam by Rhea Khanna",
    tagline: "Your beauty, amplified",
    serviceType: "Makeup Artist",
    city: "West Delhi",
    locations: ["West Delhi","South Delhi","Gurgaon","Noida"],
    rating: 4.9, reviews: 118, events: 290, responseTime: "< 2 hrs", years: 7, teamSize: 3,
    verified: true,
    bio: "Rhea Khanna is a Delhi-based bridal and party makeup artist with 7 years of experience and 290+ clients. Trained at VLCC and advanced in K-Beauty techniques, Rhea specialises in flawless HD makeup, skin-prep facials, and hair styling. She uses only premium international brands — Huda Beauty, Charlotte Tilbury, MAC, and Airbrush system. Home visits available across Delhi NCR.",
    specialties: ["Bridal HD Makeup","Airbrush Makeup","Party Glam","Engagement Look","Hair Styling & Blowout","Pre-Bridal Facial","Saree Draping","Editorial & Shoot Looks"],
    eventTypes: ["Wedding","Engagement","Birthday","Anniversary","Pre-Wedding Shoot","Corporate Event","Reception"],
    genres: [], instruments: [], performingStyle: [],
    social: { instagram: "@glambyrheakhanna", youtube: "Glam by Rhea", website: "" },
    showreel: "",
    packages: [
      { name: "Party Glam", price: "₹4,500", unit: "per person", color: "#F0E8DC", accent: gold, items: ["HD party makeup","Hair styling (blowout or updo)","Lashes included","Premium international products","Home visit available","1.5 hr session"], bestFor: "Birthday, Anniversary, Party night" },
      { name: "Engagement / Pre-Wedding", price: "₹9,000", unit: "per person", color: ink, accent: goldLt, badge: "Most Popular", items: ["Full HD or Airbrush makeup","Detailed hair styling with accessories setting","Eye lashes + bindi + tikka","Pre-bridal skin consultation","Touch-up kit gifted","Trial session included","2.5 hr session"], bestFor: "Engagement, Pre-Wedding Shoot, Reception" },
      { name: "Bridal Full Package", price: "₹22,000+", unit: "full day", color: "#2C1208", accent: goldLt, items: ["Bridal HD Airbrush makeup + hair","Includes Mehendi + Sangeet + Wedding day","Trial session + pre-bridal facial","Bridesmaid makeup (up to 3 included)","Premium Charlotte Tilbury + MAC kit","Saree draping included","Dedicated assistant on wedding day","Emergency touch-up kit left with bride"], bestFor: "Full bridal experience across all events" },
    ],
    portfolio: [
      { label: "Bridal Look", tags: ["Wedding","Bridal"] },
      { label: "Reception Glam", tags: ["Reception","Glam"] },
      { label: "Engagement", tags: ["Engagement","Soft Glam"] },
      { label: "Party Look", tags: ["Birthday","HD"] },
      { label: "Mehendi Look", tags: ["Wedding","Traditional"] },
      { label: "Shoot Look", tags: ["Editorial","Bold"] },
    ],
    testimonials: [
      { name: "Divya Sharma", event: "Bridal Package, Feb 2025", rating: 5, text: "Rhea is an artist in every sense. The bridal look lasted 14 hours — through the pheras, through happy tears, everything. Her pre-bridal facial a week before made my skin glow. Book her NOW." },
      { name: "Pooja Gupta", event: "Engagement, Jan 2025", rating: 5, text: "I showed her 2 photos and she created something even better. My skin looked like glass. The hair lasted all night. So calm and professional — made me feel so comfortable." },
      { name: "Sunita Kapoor", event: "Birthday Party, Dec 2024", rating: 4, text: "Great makeup, lasted the whole evening. Arrived 15 mins late but made up for it with a stunning look. Products smell amazing — definitely coming back." },
    ],
  },

  Anchor: {
    name: "Rohan Mehta",
    tagline: "Every event needs a voice. Let's make it unforgettable.",
    serviceType: "Anchor",
    city: "Delhi NCR",
    locations: ["Delhi NCR","Noida","Gurgaon","All India (outstation)"],
    rating: 4.8, reviews: 154, events: 430, responseTime: "< 2 hrs", years: 10, teamSize: 1,
    verified: true,
    phone: "+91 98765 43210",
    available: true,
    bio: "Rahul Khanna is a bilingual (Hindi + English) anchor and emcee with 10 years of live event experience. Having hosted 430+ events — from intimate mehendi ceremonies to 2000-pax corporate award nights — Rahul brings warmth, wit, and perfect pacing to every stage. Specialises in weddings, award shows, product launches, and school annual days.",
    specialties: ["Wedding Anchor","Corporate Award Night","Product Launch MC","School Annual Day","Charity Galas","Bilingual (Hindi + English)","Roast & Comedy MC","Interactive Games Host"],
    eventTypes: ["Wedding","Corporate","Award Night","Product Launch","Birthday","School Annual Day","Conference"],
    genres: [],
    instruments: [],
    performingStyle: ["Formal","Casual","Bilingual","Interactive","High-energy","Scripted","Improvised"],
    social: { instagram: "@rahulkhannaanchor", youtube: "Rahul Khanna Official", linkedin: "rahulkhanna", website: "rahulkhanna.in" },
    showreel: "youtube.com/rahulkhanna-reel",
    sellingPoints: [
      { title: "Engaging & Energetic", sub: "Keeps every crowd involved" },
      { title: "Customized Scripts", sub: "Tailored to your event" },
      { title: "Bilingual EN / HI", sub: "Connects with every audience" },
      { title: "Punctual & Professional", sub: "On time, every time" },
    ],
    portfolioCategories: [
      { label: "Wedding", count: 24 },
      { label: "Corporate", count: 18 },
      { label: "Award Night", count: 12 },
      { label: "Birthday", count: 16 },
      { label: "Product Launch", count: 10 },
      { label: "School / Annual Day", count: 8 },
    ],
    packages: [
      { name: "Half Day", price: "₹18,000", unit: "up to 4 hours", color: "#F0E8DC", accent: gold, items: ["Rahul Khanna anchoring","Up to 4 hrs on stage","Script consultation call","Bilingual (Hindi + English)","Basic mic & monitor provided","Customised script segment included"], bestFor: "Birthday, small corporate meet, engagements" },
      { name: "Full Event", price: "₹38,000", unit: "full day", color: ink, accent: goldLt, badge: "Most Popular", items: ["Full-day event anchoring (8 hrs)","Dedicated script writing session","Icebreaker games & interactive segments","Award night or sangeet ceremonies","Coordination with DJ, band & AV team","Rehearsal on event day","Personalised couple/guest shoutouts","Crowd games & fun rounds"], bestFor: "Weddings, Corporate Award Nights, Annual Days" },
      { name: "Premium Wedding", price: "₹75,000+", unit: "multi-event", color: "#2C1208", accent: goldLt, items: ["Mehendi + Sangeet + Wedding anchoring","Full script for each event","Game design & prize coordination","Personalised couple documentary voiceover","Video highlight narration (add-on)","Multiple language support (Hindi, English, Punjabi)","Full-day + post-event coordination"], bestFor: "Full wedding — 3 events over 2 days" },
    ],
    portfolio: [
      { label: "Wedding Ceremony", tags: ["Wedding","Bilingual"] },
      { label: "Corporate Award Night", tags: ["Corporate","Formal"] },
      { label: "Sangeet Night", tags: ["Wedding","Fun"] },
      { label: "Product Launch", tags: ["Corporate","MC"] },
      { label: "School Annual Day", tags: ["School","Kids"] },
      { label: "Birthday Roast", tags: ["Birthday","Comedy"] },
    ],
    testimonials: [
      { name: "Ananya & Karan Wedding", event: "Wedding + Sangeet, Apr 2025", rating: 5, text: "Rahul made our wedding feel like a Bollywood film. He knew exactly when to be emotional and when to get the crowd laughing. Every family member loved him — especially the dadis!", response: "Thank you so much Ananya & Karan — this was one of my favourite weddings of 2025. Wishing you both a lifetime of happiness!" },
      { name: "HDFC Life Insurance", event: "Annual Award Night, Feb 2025", rating: 5, text: "Hosted our 800-pax national award night with complete professionalism. His energy was electric. We've already rebooked him for our next quarter summit.", response: "Truly an honour to host HDFC Life — what a fantastic team and audience. Looking forward to the Q3 summit!" },
      { name: "Meghna Patel", event: "30th Birthday, Jan 2025", rating: 5, text: "He turned a party into an experience. The roast segment had everyone in tears laughing. He spent time beforehand to understand our group — it showed.", response: "Meghna — your friends were the best crowd! The prep call really helped me tailor the roast perfectly. Thank you for trusting me with your big 3-0!" },
    ],
    gst: "07AABKU1234R1Z5",
    performance: {
      genres: ["Bollywood","Corporate Hosting","Comedy Roast","Bilingual (Hindi + English)","Punjabi"],
      instruments: [],
      showreel: "https://youtube.com/watch?v=demo-anchor-reel",
      instagram: "@rahulkhanna.mc",
      youtube: "youtube.com/@rahulkhannaMC",
      setlist: "Opening ceremony address\nInteractive icebreaker games (6 variations)\nAward presentation scripts\nSangeet games & fun rounds\nCouple Q&A segment\nGuest shoutout moments\nComedic roast format (birthday / farewell)\nMulti-language transitions",
    },
  },

  Coordinator: {
    name: "Nisha Verma",
    tagline: "Every detail planned. Every moment magical.",
    serviceType: "Coordinator",
    city: "Mumbai",
    locations: ["Mumbai","Pune","Goa","Delhi","Destination (Pan-India)"],
    rating: 4.9, reviews: 187, events: 310, responseTime: "< 1 hr", years: 8, teamSize: 4,
    verified: true,
    phone: "+91 99887 76655",
    available: true,
    bio: "Nisha Verma is a Tendr-certified event coordinator with 8 years of experience orchestrating 310+ events across India. From intimate home ceremonies to 1,500-guest destination banquets, her meticulous timelines, curated vendor network of 200+ professionals, and calm-under-pressure approach have earned her a 4.9 rating. She handles everything — venues, vendors, budgets, decor, catering, music — so you show up and enjoy.",
    specialties: ["Full Wedding Planning","Day-Of Coordination","Destination Weddings","Corporate Galas","Vendor Management","Budget Planning","Venue Sourcing","Decor Direction"],
    eventTypes: ["Wedding","Sangeet","Reception","Corporate","Destination","Engagement","Anniversary"],
    genres: [], instruments: [], performingStyle: [],
    social: { instagram: "@nisha.events.in", youtube: "", linkedin: "nishaverma-events", website: "nishaevents.in" },
    showreel: "",
    sellingPoints: [
      { title: "200+ Vendor Network", sub: "Best vendors, pre-vetted" },
      { title: "Minute-by-Minute Timeline", sub: "Nothing left to chance" },
      { title: "Budget Guardians", sub: "Not a rupee wasted" },
      { title: "Tendr Certified", sub: "Background-verified & trained" },
    ],
    portfolioCategories: [
      { label: "Wedding", count: 84 },
      { label: "Sangeet", count: 52 },
      { label: "Destination", count: 28 },
      { label: "Corporate", count: 36 },
      { label: "Reception", count: 64 },
      { label: "Engagement", count: 46 },
    ],
    packages: [
      { name: "Day-Of Coordination", price: "₹25,000", unit: "1 day", color: "#F0E8DC", accent: gold, items: ["Full day coordination (12 hrs)","Vendor check-in & briefing","Master timeline management","Runsheet for all vendors","Emergency toolkit on-site","Dedicated team of 2"], bestFor: "Couples who planned themselves but want a pro on the day" },
      { name: "Month-Of Planning", price: "₹55,000", unit: "4 weeks", color: ink, accent: goldLt, badge: "Most Popular", items: ["4-week pre-event coordination","Vendor confirmation & follow-ups","Detailed runsheet & timeline","Budget reconciliation","Full day-of execution team","Payment tracker & wrap-up report"], bestFor: "Weddings, galas, destination events" },
      { name: "Full Event Planning", price: "₹1,50,000+", unit: "end-to-end", color: "#2C1208", accent: goldLt, items: ["Venue sourcing & negotiation","Complete vendor curation (200+ network)","Budget planning & tracking","Decor direction & concept","All pre-event meetings","Destination event logistics","Legal & contract review","Day-of team of 4","Post-event guest survey"], bestFor: "Couples who want everything handled, start to finish" },
    ],
    portfolio: [
      { label: "Grand Wedding Ceremony", tags: ["Wedding","Luxury"] },
      { label: "Sangeet Night Setup", tags: ["Sangeet","Decor"] },
      { label: "Destination Goa Wedding", tags: ["Destination","Beach"] },
      { label: "Corporate Gala Dinner", tags: ["Corporate","Formal"] },
      { label: "Grand Reception Banquet", tags: ["Reception","Grand"] },
      { label: "Intimate Engagement", tags: ["Engagement","Intimate"] },
    ],
    testimonials: [
      { name: "Priya & Rohit Sharma", event: "Full Wedding Planning, Mar 2025", rating: 5, text: "Nisha coordinated our 3-day Goa wedding flawlessly — 240 guests, 18 vendors, multiple venues. We didn't stress once. She's an absolute magician.", response: "Priya & Rohit, your Goa wedding was a dream to plan. Three days, eighteen vendors, one perfect memory. Thank you for trusting me!" },
      { name: "TechCorp India Pvt Ltd", event: "Leadership Summit, Jan 2025", rating: 5, text: "Nisha managed our 600-person corporate gala end-to-end. The AV, catering, programme flow — everything was flawless. Our CEO personally complimented the event design.", response: "Loved working with the TechCorp team — the award segment was spectacular. Looking forward to your next event!" },
      { name: "Ananya & Dev Mehra", event: "Destination Wedding, Feb 2025", rating: 5, text: "Guests flying in from 5 countries, hotel blocks, airport pickups, 3 events across 2 days. We were sipping cocktails while Nisha handled everything.", response: "International weddings are my favourite challenge! Ananya & Dev, wishing you a lifetime of adventures together!" },
    ],
    gst: "27AAJCA1234K1Z3",
    performance: null,
  },

  Choreographer: {
    name: "Riya Kapoor",
    tagline: "Your story, told through movement.",
    serviceType: "Choreographer",
    city: "Delhi",
    locations: ["Delhi","Noida","Gurgaon","Jaipur","Mumbai","Destination"],
    rating: 4.9, reviews: 214, events: 280, responseTime: "< 2 hrs", years: 9, teamSize: 6,
    verified: true,
    phone: "+91 98765 43200",
    available: true,
    bio: "Riya Kapoor is one of Delhi's most sought-after choreographers with 9 years of experience turning stages into stories. From bridal solos and flash mobs to multi-generational family performances and corporate group acts, her choreography blends Bollywood, contemporary, and folk styles into performances that audiences remember for years. She works with beginners and seasoned dancers alike — her signature 'learn-in-5-sessions' method guarantees a polished performance every time.",
    specialties: ["Bridal Choreography","Sangeet Performances","Family Group Acts","Flash Mobs","Corporate Team Events","Kids Dance Workshops","Bollywood Fusion","Contemporary Choreography"],
    eventTypes: ["Sangeet","Wedding","Reception","Corporate","Birthday","Anniversary","Engagement"],
    genres: ["Bollywood","Contemporary","Kathak Fusion","Hip-Hop","Garba/Dandiya","Western","Sufi"],
    instruments: [], performingStyle: ["Group Choreography","Solo Coaching","Flash Mob Direction","Stage Direction"],
    social: { instagram: "@riya.dances", youtube: "RiyaKapoorChoreography", linkedin: "", website: "riyadances.in" },
    showreel: "",
    sellingPoints: [
      { title: "Learn in 5 Sessions", sub: "Beginner-friendly method" },
      { title: "On-Stage Backup", sub: "Riya performs alongside you" },
      { title: "Custom Soundtrack", sub: "Music edits included" },
      { title: "280+ Performances", sub: "Every event a standing ovation" },
    ],
    portfolioCategories: [
      { label: "Sangeet", count: 96 },
      { label: "Bridal Solo", count: 48 },
      { label: "Family Group", count: 62 },
      { label: "Flash Mob", count: 24 },
      { label: "Corporate", count: 34 },
      { label: "Kids Shows", count: 16 },
    ],
    packages: [
      { name: "Solo / Couple", price: "₹18,000", unit: "5 sessions", color: "#F0E8DC", accent: gold, items: ["5 one-hour rehearsal sessions","Custom song edit & mix","Costume styling guidance","Rehearsal venue coordination","1 backup dancer on stage","Final run-through on event day"], bestFor: "Bride, groom, or couple sangeet performance" },
      { name: "Family Group Act", price: "₹35,000", unit: "6 sessions", color: ink, accent: goldLt, badge: "Most Popular", items: ["Up to 15 family members","6 group rehearsal sessions","2 choreographers on the floor","Custom medley composition","Costume colour coordination","Riya performs alongside group","Full day-of stage direction"], bestFor: "Sangeet group acts, multi-family performances" },
      { name: "Full Sangeet Show", price: "₹75,000+", unit: "end-to-end", color: "#2C1208", accent: goldLt, items: ["Complete sangeet show direction","All acts — solo, couple, family, kids","Unlimited rehearsal sessions","Professional soundtrack production","LED backdrop & stage concept","Anchor briefing & show script","Live DJ coordination","Team of 6 choreographers on day","Post-event highlight reel"], bestFor: "Families who want a Bollywood-level sangeet night" },
    ],
    portfolio: [
      { label: "Bride's Sangeet Solo", tags: ["Sangeet","Bridal"] },
      { label: "Family Flash Mob Surprise", tags: ["Flash Mob","Family"] },
      { label: "Corporate Team Bollywood Act", tags: ["Corporate","Bollywood"] },
      { label: "Kids Garba Performance", tags: ["Kids","Garba"] },
      { label: "Couple's First Dance", tags: ["Couple","Contemporary"] },
      { label: "Grand Sangeet Finale", tags: ["Sangeet","Group"] },
    ],
    testimonials: [
      { name: "Sneha & Arjun Malhotra", event: "Full Sangeet Show, Apr 2025", rating: 5, text: "Riya choreographed 6 acts for our sangeet — bride solo, groom solo, couple act, family group, kids number, and a flash mob surprise. Every single one got a standing ovation. Our guests thought it was a Bollywood show.", response: "Sneha & Arjun, your sangeet was the most fun stage I've ever directed! The flash mob moment had everyone in tears. Wishing you both a beautiful life ahead!" },
      { name: "Priya Bhatia", event: "Bridal Choreography, Feb 2025", rating: 5, text: "I had zero dancing experience. Riya's 5-session method had me doing a full 4-minute Bollywood routine with confidence. My relatives couldn't believe it was me on stage.", response: "Priya, watching you own that stage after just 5 sessions was everything! You were absolutely stunning." },
      { name: "TechNova India", event: "Corporate Team Act, Jan 2025", rating: 5, text: "We had 40 employees with no dance background. Riya pulled off a 7-minute medley in 3 rehearsals. The energy in the room when they performed was electric.", response: "Corporate flash mobs are so special — when colleagues cheer each other on like that, it's magic. Thank you TechNova for trusting us!" },
    ],
    gst: "07AAAJK5678L1Z9",
    performance: {
      events: [
        { date: "2025-11-08", venue: "ITC Maurya, Delhi", type: "Sangeet Night", status: "upcoming" },
        { date: "2025-10-26", venue: "Jai Mahal Palace, Jaipur", type: "Royal Sangeet", status: "upcoming" },
        { date: "2025-10-12", venue: "Leela Ambience, Gurugram", type: "Corporate Gala", status: "past" },
      ],
    },
  },
};

const TYPES = Object.keys(DEMOS);
const TABS  = ["Portfolio", "Packages", "About", "Reviews", "Performance"];

// ── Helpers ──────────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? goldLt : "rgba(196,164,130,0.2)"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function Check({ size = 14, color = gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// Selling point icons (4 fixed positions cycle)
function SpIcon({ index }) {
  const icons = [
    // mic
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    // file-text
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    // globe
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    // clock
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  ];
  return icons[index % 4];
}

// ── BookModal ─────────────────────────────────────────────────────────────────
function BookModal({ vendor, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", date: "", eventType: vendor.eventTypes?.[0] || "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, outline: "none" };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(28,10,4,0.65)", backdropFilter: "blur(4px)", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "min(480px, 100%)", position: "relative", boxShadow: "0 24px 64px rgba(28,10,4,0.28)", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(28,10,4,0.06)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18, color: muted, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>

        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style={{ fontFamily: serif, fontSize: "1.5rem", color: ink, marginBottom: 8 }}>Request Sent!</h3>
            <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.6 }}>{vendor.name.split("—")[0].trim()} will respond within <strong style={{ color: gold }}>{vendor.responseTime}</strong>.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: "12px 32px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3 style={{ fontFamily: serif, fontSize: "1.4rem", color: ink, marginBottom: 4 }}>Book {vendor.name.split("—")[0].split(" ").slice(0,2).join(" ")}</h3>
            <p style={{ fontSize: 12.5, color: muted, marginBottom: 24 }}>Fill in your details and {vendor.responseTime === "< 1 hr" ? "expect a reply within the hour" : `they'll reply within ${vendor.responseTime}`}.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Your Name *</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone *</label>
                <input required value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 00000" style={inputStyle} type="tel" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Event Date *</label>
                  <input required value={form.date} onChange={e => set("date", e.target.value)} type="date" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Event Type *</label>
                  <select required value={form.eventType} onChange={e => set("eventType", e.target.value)} style={{ ...inputStyle }}>
                    {(vendor.eventTypes || []).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Message</label>
                <textarea value={form.message} onChange={e => set("message", e.target.value)} placeholder="Venue, guest count, special requirements…" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </div>

            <button type="submit" style={{ width: "100%", marginTop: 22, padding: "14px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: `0 6px 20px rgba(196,122,46,0.35)` }}>
              Send Booking Request →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Shared tab content renderers ──────────────────────────────────────────────
function PackagesContent({ d }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {d.packages.map((pkg, i) => (
          <div key={i} style={{ borderRadius: 20, padding: "28px 24px 24px", flex: "1 1 240px", position: "relative", overflow: "hidden", background: pkg.color, color: pkg.color === "#F0E8DC" ? ink : "#FFF8EC" }}>
            {pkg.badge && <div style={{ position: "absolute", top: 16, right: 16, background: gold, color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 10.5, fontWeight: 800 }}>{pkg.badge}</div>}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: pkg.accent, marginBottom: 8 }}>Package</div>
            <div style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 500, marginBottom: 4 }}>{pkg.name}</div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontFamily: serif, fontSize: "2.2rem", fontWeight: 500, color: pkg.accent }}>{pkg.price}</span>
              <span style={{ fontSize: 12, marginLeft: 6, opacity: 0.55 }}>{pkg.unit}</span>
            </div>
            <div style={{ fontSize: 11, fontStyle: "italic", opacity: 0.6, marginBottom: 16 }}>Best for: {pkg.bestFor}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {pkg.items.map((item, j) => (
                <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ marginTop: 1, flexShrink: 0 }}><Check size={13} color={pkg.accent} /></span>
                  <span style={{ fontSize: 13, opacity: 0.85 }}>{item}</span>
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
        Prices are indicative. Chat with the vendor for a custom quote.
      </p>
    </div>
  );
}

function AboutContent({ d }) {
  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 16, padding: "24px", marginBottom: 20, border: "1px solid rgba(196,122,46,0.1)" }}>
        <h3 style={{ fontFamily: serif, fontSize: "1.25rem", fontWeight: 500, color: ink, marginBottom: 12 }}>About</h3>
        <p style={{ fontSize: 14, color: "#4A3020", lineHeight: 1.8 }}>{d.bio}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Specialties</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {d.specialties.map(s => <span key={s} style={{ background: cream, border: "1px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: muted }}>{s}</span>)}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Event Types</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {d.eventTypes.map(e => <span key={e} style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 100, fontSize: 10.5, fontWeight: 700, background: "rgba(196,122,46,0.1)", color: gold }}>{e}</span>)}
          </div>
        </div>
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
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Experience", value: `${d.years} years` },
              { label: "Team Size", value: `${d.teamSize} ${d.teamSize === 1 ? "person" : "people"}` },
              ...(d.genres?.length ? [{ label: "Genres", value: d.genres.join(", ") }] : []),
              ...(d.instruments?.length ? [{ label: "Gear", value: d.instruments.join(", ") }] : []),
              ...(d.social?.instagram ? [{ label: "Instagram", value: d.social.instagram }] : []),
              ...(d.social?.website ? [{ label: "Website", value: d.social.website }] : []),
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
  );
}

function ReviewsContent({ d }) {
  return (
    <div>
      <div style={{ background: ink, borderRadius: 20, padding: "24px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: "3.5rem", fontWeight: 400, color: goldLt, lineHeight: 1 }}>{d.rating}</div>
          <Stars rating={d.rating} size={16} />
          <div style={{ fontSize: 12, color: "rgba(255,248,236,0.45)", marginTop: 6 }}>{d.reviews} reviews</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          {[5,4,3,2,1].map(n => {
            const pct = n === 5 ? 78 : n === 4 ? 16 : n === 3 ? 4 : 1;
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
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {d.testimonials.map((r, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(196,122,46,0.1)" }}>
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
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
    </div>
  );
}

function PerformanceContent({ d }) {
  if (!d.performance) return null;
  const p = d.performance;
  return (
    <div>
      {p.showreel && (
        <div style={{ background: ink, borderRadius: 20, padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(196,122,46,0.15)", border: "1px solid rgba(196,122,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={goldLt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,248,236,0.45)", marginBottom: 4 }}>Showreel</div>
            <div style={{ fontFamily: serif, fontSize: "1.1rem", fontWeight: 500, color: "#FFF8EC", marginBottom: 6 }}>Watch {d.name.split(" ")[0]} in action</div>
            <a href={p.showreel} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: goldLt, textDecoration: "none", fontWeight: 600 }}>▶ Open Showreel →</a>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {p.genres?.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)", gridColumn: p.instruments?.length ? "auto" : "1 / -1" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Genres / Styles</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {p.genres.map(g => <span key={g} style={{ background: cream, border: "1px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "5px 13px", fontSize: 12.5, fontWeight: 600, color: "#4A3020" }}>{g}</span>)}
            </div>
          </div>
        )}
        {p.instruments?.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Instruments / Gear</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {p.instruments.map(inst => <span key={inst} style={{ background: cream, border: "1px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "5px 13px", fontSize: 12.5, fontWeight: 600, color: "#4A3020" }}>{inst}</span>)}
            </div>
          </div>
        )}
      </div>
      {(p.instagram || p.youtube) && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Social & Links</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {p.instagram && (
              <a href={`https://instagram.com/${p.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 100, background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                {p.instagram}
              </a>
            )}
            {p.youtube && (
              <a href={`https://${p.youtube}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 100, background: "#FF0000", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                YouTube
              </a>
            )}
          </div>
        </div>
      )}
      {p.setlist && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Sample Set / Rundown</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {p.setlist.split("\n").filter(Boolean).map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: cream, border: "1px solid rgba(196,122,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: gold, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <span style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.5 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── GigProProfile — magazine layout for Anchor / DJ / Band ───────────────────
// Portrait sources per vendor type (Anchor uses local asset)
const PORTRAIT_IDS = { Anchor: null, DJ: { g: "men", id: 32 }, Band: { g: "men", id: 67 }, Coordinator: { g: "women", id: 44 }, Choreographer: { g: "women", id: 26 } };
// Pool of randomuser.me IDs for portfolio grid photos (alternating men/women)
const PORTFOLIO_POOL = [
  { g: "men",   id: 24 }, { g: "women", id: 15 }, { g: "men",   id: 37 },
  { g: "women", id: 28 }, { g: "men",   id: 52 }, { g: "women", id: 41 },
  { g: "men",   id: 68 }, { g: "women", id: 33 }, { g: "men",   id: 12 },
  { g: "women", id: 56 }, { g: "men",   id: 79 }, { g: "women", id: 19 },
];

function GigProProfile({ d, tab, setTab, showBook, setShowBook }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const visibleTabs = TABS.filter(t => t !== "Performance" || !!d.performance);
  const _pid = PORTRAIT_IDS[d.serviceType];
  const portraitSrc = _pid === null || _pid === undefined
    ? "/anchor-portrait.png"
    : `https://randomuser.me/api/portraits/${_pid.g}/${_pid.id}.jpg`;
  const PORTFOLIO_OBJ_POS = ["center top", "20% top", "80% top", "center 25%", "10% top", "90% top", "50% 15%", "40% top"];
  const portfolioImgSrc = () => portraitSrc;
  const portfolioObjPos = (idx) => PORTFOLIO_OBJ_POS[idx % PORTFOLIO_OBJ_POS.length];

  const filteredPortfolio = activeCategory === "All"
    ? (d.portfolioCategories || [])
    : (d.portfolioCategories || []).filter(c => c.label === activeCategory);

  return (
    <div style={{ overflowX: "hidden", width: "100%" }}>
      {/* Mobile-only: portrait + organic parch info blob */}
      <div className="gp-mobile-hero-portrait" style={{ display: "none", background: parch }}>
        {/* Photo area */}
        <div style={{ position: "relative", width: "100%", height: 340, overflow: "hidden" }}>
          <img src={portraitSrc} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          {/* Subtle top vignette only */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(28,10,4,0.2) 0%, transparent 35%, transparent 60%, rgba(240,232,220,0.5) 88%, rgba(240,232,220,1) 100%)" }} />
        </div>
        {/* Organic parch blob — overlaps bottom of photo */}
        <div style={{ marginTop: -56, position: "relative", zIndex: 2, background: parch, borderRadius: "58% 42% 0 0 / 44% 36% 0 0", paddingTop: 32, paddingLeft: 22, paddingRight: 22, paddingBottom: 8 }}>
          {d.available && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.12)", color: "#16A34A", borderRadius: 100, padding: "4px 12px", fontSize: 11, fontWeight: 700, marginBottom: 10, border: "1px solid rgba(34,197,94,0.22)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
              Available for Bookings
            </div>
          )}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
            <h1 style={{ fontFamily: serif, fontSize: "1.95rem", fontWeight: 500, color: ink, lineHeight: 1.1 }}>{d.name}</h1>
            {d.verified && (
              <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(34,197,94,0.1)", color: "#16A34A", borderRadius: 100, padding: "3px 8px", fontSize: 11, fontWeight: 700, marginTop: 6 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Verified
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: muted, fontWeight: 500 }}>Professional {d.serviceType}</span>
            <span style={{ color: "rgba(155,116,80,0.4)" }}>·</span>
            <span style={{ fontSize: 12.5, color: muted, display: "flex", alignItems: "center", gap: 3 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {d.city}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Stars rating={d.rating} size={14} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: ink }}>{d.rating}</span>
            <span style={{ fontSize: 12, color: muted }}>({d.reviews} reviews)</span>
          </div>
          <p style={{ fontFamily: serif, fontSize: "0.92rem", fontStyle: "italic", color: "#6B4B2A", lineHeight: 1.55 }}>"{d.tagline}"</p>
        </div>
      </div>

      {/* Desktop: 2-column layout — portrait sticky LEFT, all content RIGHT */}
      <div className="gp-page-layout" style={{ display: "grid", gridTemplateColumns: "420px 1fr", alignItems: "flex-start" }}>

        {/* LEFT col: sticky portrait (hidden on mobile) */}
        <div className="gp-portrait-col" style={{ position: "sticky", top: 0, height: "100vh", background: parch, overflow: "hidden", borderRight: "1px solid rgba(196,122,46,0.08)" }}>
          {/* Warm blob */}
          <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-30%)", width: 440, height: 540, borderRadius: "50%", background: "rgba(196,122,46,0.12)", zIndex: 0 }} />
          {/* People · Events · Stories strip */}
          <div style={{ display: "flex", gap: 10, position: "absolute", left: 20, top: 40, zIndex: 2 }}>
            <div style={{ width: 2, borderRadius: 2, background: "rgba(196,122,46,0.35)", minHeight: 100 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {["People", "Events", "Stories"].map(w => (
                <span key={w} style={{ fontFamily: dance, fontSize: 17, color: muted, lineHeight: 1.55 }}>{w}</span>
              ))}
            </div>
          </div>
          {/* Arch portrait */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 36, height: "calc(100% - 64px)", position: "relative", zIndex: 1 }}>
            <div style={{ width: 360, height: 540, borderRadius: "180px 180px 22px 22px", overflow: "hidden", boxShadow: "0 28px 72px rgba(28,10,4,0.28)" }}>
              <img src={portraitSrc} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
            </div>
          </div>
          {/* "Real moments. Real me." card */}
          <div style={{ position: "absolute", bottom: 24, left: 20, background: "#fff", borderRadius: 12, padding: "10px 16px", boxShadow: "0 6px 24px rgba(28,10,4,0.1)", zIndex: 2 }}>
            <div style={{ fontFamily: dance, fontSize: 15, color: muted, lineHeight: 1.5 }}>Real moments.</div>
            <div style={{ fontFamily: dance, fontSize: 15, color: muted, lineHeight: 1.5 }}>Real me.</div>
          </div>
        </div>

        {/* RIGHT col: all scrollable content */}
        <div className="gp-content-col" style={{ minWidth: 0, overflowX: "hidden" }}>
          {/* Info section */}
          <div className="gp-info-header" style={{ background: parch, borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "36px 32px 28px" }}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              {/* Name / rating / CTAs */}
              <div style={{ flex: 1 }}>
                <div className="gp-hero-info-box">
                  {d.available && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(34,197,94,0.12)", color: "#16A34A", borderRadius: 100, padding: "5px 13px", fontSize: 12, fontWeight: 700, marginBottom: 16, alignSelf: "flex-start", border: "1px solid rgba(34,197,94,0.2)" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
                      Available for Bookings
                    </div>
                  )}
                  <h1 style={{ fontFamily: serif, fontSize: "clamp(1.9rem, 3.5vw, 2.7rem)", fontWeight: 500, color: ink, lineHeight: 1.05, marginBottom: 10 }}>{d.name}</h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {d.verified && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.1)", color: "#16A34A", borderRadius: 100, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Verified
                      </span>
                    )}
                    <span style={{ fontSize: 13.5, color: muted, fontWeight: 500 }}>Professional {d.serviceType}</span>
                    <span style={{ color: "rgba(155,116,80,0.4)" }}>|</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: muted }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {d.city}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Stars rating={d.rating} size={16} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: ink }}>{d.rating}</span>
                    <span style={{ fontSize: 13, color: muted }}>({d.reviews} reviews)</span>
                  </div>
                  <p style={{ fontFamily: serif, fontSize: "1.05rem", fontStyle: "italic", color: "#6B4B2A", lineHeight: 1.6, marginBottom: 28 }}>"{d.tagline}"</p>
                </div>
                {/* Desktop CTAs */}
                <div className="gp-desktop-ctas" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => setShowBook(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font, boxShadow: `0 6px 20px rgba(196,122,46,0.38)` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Book Now
                  </button>
                  <a href={`https://wa.me/${(d.phone || "+919876543210").replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 20px", borderRadius: 100, background: "rgba(28,10,4,0.06)", color: ink, fontSize: 14, fontWeight: 600, border: "1.5px solid rgba(28,10,4,0.14)", cursor: "pointer", fontFamily: font, textDecoration: "none" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Chat
                  </a>
                  {d.phone && (
                    <a href={`tel:${d.phone.replace(/\s/g,"")}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 20px", borderRadius: 100, background: "rgba(28,10,4,0.04)", color: ink, fontSize: 14, fontWeight: 600, border: "1.5px solid rgba(28,10,4,0.12)", cursor: "pointer", fontFamily: font, textDecoration: "none" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>
                      Call
                    </a>
                  )}
                </div>
                {d.serviceType === "Anchor" && (
                  <button onClick={() => navigate("/vendor/demo-dashboard")} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 100, background: "rgba(28,10,4,0.06)", color: ink, fontSize: 13, fontWeight: 700, border: "1.5px solid rgba(28,10,4,0.16)", cursor: "pointer", fontFamily: font, marginTop: 10 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    View Vendor Dashboard
                  </button>
                )}
                {d.serviceType === "Coordinator" && (
                  <button onClick={() => navigate("/vendor/coordinator-dash")} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 100, background: "rgba(28,10,4,0.06)", color: ink, fontSize: 13, fontWeight: 700, border: "1.5px solid rgba(28,10,4,0.16)", cursor: "pointer", fontFamily: font, marginTop: 10 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    View Coordinator Dashboard
                  </button>
                )}
                {/* Mobile CTAs */}
                <div className="gp-mobile-ctas" style={{ display: "none", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => setShowBook(true)} style={{ width: "100%", padding: "15px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font, boxShadow: `0 6px 20px rgba(196,122,46,0.38)` }}>Book Now</button>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href={`https://wa.me/${(d.phone||"+919876543210").replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 8px", borderRadius: 100, background: "rgba(28,10,4,0.06)", color: ink, fontSize: 14, fontWeight: 600, border: "1.5px solid rgba(28,10,4,0.14)", textDecoration: "none", fontFamily: font }}>Chat</a>
                    {d.phone && <a href={`tel:${d.phone.replace(/\s/g,"")}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 8px", borderRadius: 100, background: "rgba(28,10,4,0.04)", color: ink, fontSize: 14, fontWeight: 600, border: "1.5px solid rgba(28,10,4,0.12)", textDecoration: "none", fontFamily: font }}>Call</a>}
                    <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 8px", borderRadius: 100, background: "rgba(28,10,4,0.04)", color: ink, fontSize: 14, fontWeight: 600, border: "1.5px solid rgba(28,10,4,0.12)", cursor: "pointer", fontFamily: font }}>Share</button>
                  </div>
                </div>
              </div>
              {/* Selling points */}
              <div className="gp-hero-col-right" style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
                {(d.sellingPoints || []).map((sp, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(28,10,4,0.08)", border: "1px solid rgba(196,122,46,0.12)" }}>
                      <SpIcon index={i} />
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: ink, lineHeight: 1.2 }}>{sp.title}</div>
                      <div style={{ fontSize: 11.5, color: muted, marginTop: 3 }}>{sp.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="gp-stats-bar" style={{ background: cream, padding: "20px 32px 0" }}>
            <div className="gp-stats-row" style={{ background: "#fff", borderRadius: 16, display: "flex", flexWrap: "wrap", border: "1px solid rgba(196,122,46,0.1)", overflow: "hidden", boxShadow: "0 2px 12px rgba(28,10,4,0.05)" }}>
              {[
                { label: "Events Done",   value: `${d.events}+`,    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                { label: "Rating",         value: d.rating,          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill={gold} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
                { label: "Years Active",   value: d.years,           icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                { label: "Response Time",  value: d.responseTime,    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                { label: "Team Size",      value: d.teamSize,        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, padding: "16px 12px", textAlign: "center", borderRight: i < 4 ? "1px solid rgba(196,122,46,0.1)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: ink, fontFamily: font }}>{s.value}</div>
                  <div style={{ fontSize: 10.5, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Content + Sidebar ── */}
          <div style={{ background: cream }}>
            <div className="gp-content-grid" style={{ padding: "24px 32px 48px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>

          {/* Main content */}
          <div>
            {/* Tab nav */}
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(196,122,46,0.12)", marginBottom: 24, background: "#fff", borderRadius: "12px 12px 0 0", overflow: "hidden", boxShadow: "0 2px 8px rgba(28,10,4,0.04)", overflowX: "auto" }}>
              {visibleTabs.map(t => (
                <button key={t} className={`vd-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>

            {/* Portfolio tab */}
            {tab === "Portfolio" && (
              <div>
                {/* Category filter chips */}
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18, overflowX: "auto", paddingBottom: 2 }}>
                  {["All", ...(d.portfolioCategories || []).map(c => c.label)].map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "6px 16px", borderRadius: 100, border: `1.5px solid ${activeCategory === cat ? ink : "rgba(196,122,46,0.2)"}`, background: activeCategory === cat ? ink : "#fff", color: activeCategory === cat ? goldLt : muted, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Category photo grid — 4 columns */}
                <div className="gp-cat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
                  {filteredPortfolio.map((cat, i) => {
                    return (
                      <div key={i} style={{ borderRadius: 16, overflow: "hidden", position: "relative", cursor: "pointer", aspectRatio: "3/4", transition: "transform 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                      >
                        <img src={portfolioImgSrc(i)} alt={cat.label} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: portfolioObjPos(i) }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,4,2,0.85) 0%, rgba(10,4,2,0.15) 50%, transparent 100%)" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#FFF8EC", fontFamily: serif, marginBottom: 4 }}>{cat.label}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={goldLt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span style={{ fontSize: 11, color: goldLt, fontWeight: 600 }}>{cat.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* About Me + Client Love side by side */}
                <div className="gp-about-love" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, borderTop: "1px solid rgba(196,122,46,0.1)", paddingTop: 28 }}>
                  {/* About Me */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <h3 style={{ fontFamily: serif, fontSize: "1.35rem", fontWeight: 500, color: ink }}>About Me</h3>
                      <button onClick={() => {}} style={{ fontSize: 13, fontWeight: 600, color: gold, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>Read More →</button>
                    </div>
                    <p style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.8 }}>
                      {d.bio.slice(0, 220)}…
                    </p>
                    {(d.sellingPoints || []).length > 0 && (
                      <div style={{ display: "flex", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
                        {(d.sellingPoints || []).map((sp, i) => (
                          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center", minWidth: 60 }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: parch, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(196,122,46,0.15)" }}>
                              <SpIcon index={i} />
                            </div>
                            <span style={{ fontSize: 10.5, fontWeight: 600, color: muted, lineHeight: 1.3, maxWidth: 64 }}>{sp.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Client Love */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <h3 style={{ fontFamily: serif, fontSize: "1.35rem", fontWeight: 500, color: ink }}>Client Love</h3>
                      <button onClick={() => setTab("Reviews")} style={{ fontSize: 13, fontWeight: 600, color: gold, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>View All →</button>
                    </div>
                    {(() => {
                      const avatarPool = [
                        { g: "women", id: 44 }, { g: "men", id: 55 }, { g: "women", id: 22 },
                        { g: "men", id: 33 }, { g: "women", id: 66 }, { g: "men", id: 11 },
                      ];
                      const relTime = ["2 weeks ago", "1 month ago", "3 weeks ago", "2 months ago"];
                      const r = d.testimonials[testimonialIdx % d.testimonials.length];
                      const av = avatarPool[testimonialIdx % avatarPool.length];
                      const total = d.testimonials.length;
                      const eventLabel = r.event.split(/[,+]/)[0].trim();
                      return (
                        <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)", position: "relative" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <img
                              src={`https://randomuser.me/api/portraits/${av.g}/${av.id}.jpg`}
                              alt={r.name}
                              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${goldLt}` }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: ink, marginBottom: 3 }}>{r.name}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: gold, background: "rgba(196,122,46,0.1)", borderRadius: 20, padding: "2px 8px" }}>{eventLabel}</span>
                                <span style={{ fontSize: 11, color: muted }}>· {d.city}</span>
                              </div>
                            </div>
                          </div>
                          <Stars rating={r.rating} size={13} />
                          <p style={{ fontSize: 13, color: "#4A3020", lineHeight: 1.75, marginTop: 10, fontStyle: "italic" }}>"{r.text.slice(0, 180)}{r.text.length > 180 ? "…" : ""}"</p>
                          <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>{relTime[testimonialIdx % relTime.length]}</div>
                          {/* Carousel controls */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                            <button
                              onClick={() => setTestimonialIdx(i => (i - 1 + total) % total)}
                              style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${gold}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: gold, fontSize: 18, lineHeight: 1 }}
                            >‹</button>
                            <div style={{ display: "flex", gap: 6 }}>
                              {d.testimonials.map((_, dotIdx) => (
                                <button
                                  key={dotIdx}
                                  onClick={() => setTestimonialIdx(dotIdx)}
                                  style={{ width: dotIdx === testimonialIdx % total ? 20 : 7, height: 7, borderRadius: 4, border: "none", cursor: "pointer", background: dotIdx === testimonialIdx % total ? gold : "rgba(196,122,46,0.25)", transition: "all 0.2s", padding: 0 }}
                                />
                              ))}
                            </div>
                            <button
                              onClick={() => setTestimonialIdx(i => (i + 1) % total)}
                              style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${gold}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: gold, fontSize: 18, lineHeight: 1 }}
                            >›</button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 20, fontStyle: "italic" }}>
                  Representative samples. Actual work photos appear when vendors upload their portfolio.
                </p>
              </div>
            )}

            {tab === "Packages"    && <PackagesContent d={d} />}
            {tab === "About"       && <AboutContent d={d} />}
            {tab === "Reviews"     && <ReviewsContent d={d} />}
            {tab === "Performance" && d.performance && <PerformanceContent d={d} />}
          </div>

          {/* Sidebar */}
          <div className="gp-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 20 }}>
            {/* Connect with me — icon row */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Connect with me</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {d.social?.instagram && (
                  <a href={`https://instagram.com/${d.social.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" title={d.social.instagram} style={{ width: 40, height: 40, borderRadius: 12, background: parch, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(196,122,46,0.12)", transition: "background 0.15s" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C62B6D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </a>
                )}
                {d.social?.youtube && (
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube" style={{ width: 40, height: 40, borderRadius: 12, background: parch, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(196,122,46,0.12)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {d.social?.linkedin && (
                  <a href={`https://linkedin.com/in/${d.social.linkedin}`} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ width: 40, height: 40, borderRadius: 12, background: parch, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(196,122,46,0.12)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
                {d.phone && (
                  <a href={`https://wa.me/${(d.phone).replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{ width: 40, height: 40, borderRadius: 12, background: parch, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(196,122,46,0.12)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  </a>
                )}
                {d.social?.website && (
                  <a href={`https://${d.social.website}`} target="_blank" rel="noopener noreferrer" title={d.social.website} style={{ width: 40, height: 40, borderRadius: 12, background: parch, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(196,122,46,0.12)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </a>
                )}
                {d.phone && (
                  <a href={`tel:${d.phone.replace(/\s/g,"")}`} title="Call" style={{ width: 40, height: 40, borderRadius: 12, background: parch, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(196,122,46,0.12)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Quote card */}
            <div style={{ background: cream, borderRadius: 16, padding: "22px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
              <div style={{ fontFamily: serif, fontSize: 42, color: gold, lineHeight: 0.6, marginBottom: 14, opacity: 0.7 }}>"</div>
              <p style={{ fontFamily: serif, fontSize: "1.05rem", fontStyle: "italic", color: "#5A3820", lineHeight: 1.65, margin: 0 }}>
                Let's create an experience your guests will talk about.
              </p>
              <div style={{ width: 36, height: 2.5, background: gold, marginTop: 16, borderRadius: 2 }} />
            </div>

            {/* Dark stat card */}
            <div style={{ background: ink, borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
              <p style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 400, color: "#FFF8EC", lineHeight: 1.25, marginBottom: 20 }}>
                Great Events<br/>Start with<br/>a Great Host.
              </p>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 20, padding: "12px 0", borderTop: "1px solid rgba(255,248,236,0.08)", borderBottom: "1px solid rgba(255,248,236,0.08)" }}>
                {[
                  { val: `${d.events}+`, label: "Events" },
                  { val: `${d.years}`, label: "Years" },
                  { val: `${d.rating}★`, label: "Rating" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: serif, fontSize: "1.4rem", fontWeight: 500, color: goldLt, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,248,236,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowBook(true)} style={{ width: "100%", padding: "12px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                Book Now →
              </button>
            </div>
          </div>
        </div>
      </div>
          </div>{/* /gp-content-col */}
        </div>{/* /gp-page-layout */}
    </div>
  );
}

// ── StandardProfile — existing card layout for service vendors ────────────────
function StandardProfile({ d, tab, setTab }) {
  const visibleTabs = TABS.filter(t => t !== "Performance" || !!d.performance);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
      {/* Hero cover */}
      <div style={{ height: 160, position: "relative", overflow: "hidden", borderRadius: "0 0 12px 12px" }}>
        <img src={`https://picsum.photos/seed/${encodeURIComponent(d.serviceType + "-cover")}/1200/320`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(28,10,4,0.72) 0%, rgba(44,18,8,0.55) 60%, rgba(61,26,6,0.4) 100%)" }} />
      </div>

      {/* Profile header */}
      <div style={{ marginTop: -48, marginBottom: 24, display: "flex", gap: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 18px rgba(28,10,4,0.18)" }}>
          <span style={{ fontSize: 32, fontFamily: serif, color: "#fff", fontWeight: 400 }}>{d.name[0]}</span>
        </div>
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
            <span style={{ background: "rgba(196,122,46,0.1)", color: gold, borderRadius: 100, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{d.serviceType}</span>
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
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", paddingBottom: 4 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font, boxShadow: `0 6px 24px rgba(196,122,46,0.38)` }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Book Now
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px", borderRadius: 100, background: "rgba(28,10,4,0.06)", color: ink, fontSize: 15, fontWeight: 600, border: "1.5px solid rgba(28,10,4,0.14)", cursor: "pointer", fontFamily: font }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Chat
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "flex", gap: 0, background: "#fff", borderRadius: 16, border: "1px solid rgba(196,122,46,0.12)", overflow: "hidden", marginBottom: 24, boxShadow: "0 2px 12px rgba(28,10,4,0.06)", flexWrap: "wrap" }}>
        {[
          { label: "Events Done", value: `${d.events}+` },
          { label: "Years Active", value: d.years },
          { label: "Team Size", value: d.teamSize },
          { label: "Response Time", value: d.responseTime },
          { label: "Rating", value: d.rating },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 80, padding: "14px 12px", textAlign: "center", borderRight: i < 4 ? "1px solid rgba(196,122,46,0.1)" : "none" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: ink, fontFamily: font }}>{s.value}</div>
            <div style={{ fontSize: 10.5, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(196,122,46,0.12)", marginBottom: 28, background: "#fff", borderRadius: "12px 12px 0 0", overflow: "hidden", boxShadow: "0 2px 8px rgba(28,10,4,0.04)", overflowX: "auto" }}>
        {visibleTabs.map(t => (
          <button key={t} className={`vd-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* Portfolio */}
      {tab === "Portfolio" && (
        <div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
            {d.eventTypes.map(e => <span key={e} style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 100, fontSize: 10.5, fontWeight: 700, background: "rgba(196,122,46,0.1)", color: gold }}>{e}</span>)}
          </div>
          <div style={{ columns: "3 180px", columnGap: 10 }}>
            {d.portfolio.map((p, i) => {
              const seed = encodeURIComponent((d.serviceType + "-" + p.label).toLowerCase().replace(/\s+/g,"-"));
              const ar = i % 3 === 0 ? "3/4" : "4/3";
              return (
                <div key={i} style={{ borderRadius: 14, overflow: "hidden", breakInsideAvoid: "column", marginBottom: 10, position: "relative", cursor: "pointer", boxShadow: "0 2px 10px rgba(28,10,4,0.1)" }}>
                  <div style={{ aspectRatio: ar, position: "relative", overflow: "hidden" }}>
                    <img src={`https://picsum.photos/seed/${seed}/480/640`} alt={p.label} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,4,2,0.78) 0%, rgba(10,4,2,0.18) 55%, transparent 100%)" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#FFF8EC", marginBottom: 4, fontFamily: serif }}>{p.label}</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {p.tags.map(t => <span key={t} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,248,236,0.85)", background: "rgba(0,0,0,0.32)", borderRadius: 100, padding: "2px 7px" }}>{t}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ textAlign: "center", fontSize: 12.5, color: muted, marginTop: 20, fontStyle: "italic" }}>
            Representative portfolio samples. Actual work photos appear when vendors upload their portfolio.
          </p>
        </div>
      )}

      {tab === "Packages"    && <PackagesContent d={d} />}
      {tab === "About"       && <AboutContent d={d} />}
      {tab === "Reviews"     && <ReviewsContent d={d} />}
      {tab === "Performance" && d.performance && <PerformanceContent d={d} />}

      <div style={{ height: 48 }} />
    </div>
  );
}

// ── Main dispatcher ───────────────────────────────────────────────────────────
export default function VendorDemo() {
  const navigate = useNavigate();
  const [type, setType]     = useState("Anchor");
  const [tab, setTab]       = useState("Portfolio");
  const [showBook, setShowBook] = useState(false);
  const d = DEMOS[type];
  const isGigPro = GIG_PROS.includes(type);

  const handleTypeChange = (t) => { setType(t); setTab("Portfolio"); };

  return (
    <div style={{ minHeight: "100vh", background: cream, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Outfit:wght@400;500;600;700&family=Dancing+Script:wght@600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .vd-type-pill { padding: 8px 18px; border-radius: 100px; border: 1.5px solid rgba(196,122,46,0.22); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; background: #fff; color: #9B7450; white-space: nowrap; }
        .vd-type-pill.active { background: ${ink}; color: ${goldLt}; border-color: ${ink}; }
        .vd-tab { padding: 10px 20px; font-size: 14px; font-weight: 600; border: none; background: none; cursor: pointer; color: #9B7450; border-bottom: 2.5px solid transparent; transition: all 0.15s; font-family: ${font}; white-space: nowrap; }
        .vd-tab.active { color: ${ink}; border-color: ${gold}; }
        .gp-content-grid > div { min-width: 0; }
        @media (max-width: 900px) {
          .gp-content-grid { grid-template-columns: 1fr !important; }
          .gp-cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .gp-about-love { grid-template-columns: 1fr !important; }
          .gp-top-btns { display: none !important; }
          .gp-hero-col-right { display: none !important; }
        }
        @media (max-width: 768px) {
          .gp-mobile-hero-portrait { display: block !important; overflow: hidden; }
          .gp-portrait-col { display: none !important; }
          .gp-page-layout { grid-template-columns: 1fr !important; width: 100% !important; overflow-x: hidden !important; }
          .gp-content-col { min-width: 0 !important; max-width: 100vw !important; overflow-x: hidden !important; }
          .gp-hero-col-right { display: none !important; }
          .gp-hero-info-box { display: none !important; }
          .gp-info-header { padding: 20px 16px 20px !important; }
          .gp-stats-bar { padding: 14px 16px 0 !important; }
          .gp-desktop-ctas { display: none !important; }
          .gp-mobile-ctas { display: flex !important; }
          .gp-stats-row > div { flex: 0 0 50% !important; border-right: none !important; border-bottom: 1px solid rgba(196,122,46,0.1) !important; }
          .gp-stats-row > div:nth-child(odd) { border-right: 1px solid rgba(196,122,46,0.1) !important; }
          .gp-stats-row > div:last-child { border-bottom: none !important; }
          .gp-sidebar { display: none !important; }
          .gp-content-grid { padding: 16px 16px 32px !important; overflow-x: hidden !important; }
          .gp-about-love > div { min-width: 0 !important; overflow-x: hidden !important; }
        }
      `}</style>

      {/* BookModal rendered at top level */}
      {showBook && <BookModal vendor={d} onClose={() => setShowBook(false)} />}

      {/* Top bar */}
      <div style={{ background: ink, padding: "13px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "rgba(255,248,236,0.55)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, fontFamily: font }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: goldLt, fontFamily: font }}>Demo Vendor Portfolio</span>
        </div>
        {/* Share Profile + Book Now — only for gig pros */}
        {isGigPro ? (
          <div className="gp-top-btns" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 100, background: "rgba(255,248,236,0.08)", border: "1.5px solid rgba(255,248,236,0.18)", color: "rgba(255,248,236,0.75)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share Profile
            </button>
            <button onClick={() => setShowBook(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.4)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Book Now
            </button>
          </div>
        ) : (
          <div style={{ width: 50 }} />
        )}
      </div>

      {/* Type switcher */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "14px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>Switch vendor type</p>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {TYPES.map(t => (
              <button key={t} className={`vd-type-pill${type === t ? " active" : ""}`} onClick={() => handleTypeChange(t)}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile */}
      {isGigPro
        ? <GigProProfile d={d} tab={tab} setTab={setTab} showBook={showBook} setShowBook={setShowBook} />
        : <StandardProfile d={d} tab={tab} setTab={setTab} />
      }
    </div>
  );
}

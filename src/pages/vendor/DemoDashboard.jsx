import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ── Design tokens ──────────────────────────────────────────────────────────────
const gold   = "#C47A2E";
const goldLt = "#CCAB4A";
const ink    = "#1C0A04";
const cream  = "#FAF7F2";
const muted  = "#9B7450";
const font   = "'Outfit', sans-serif";
const serif  = "'Cormorant Garamond', Georgia, serif";

// ── GigPro type list ──────────────────────────────────────────────────────────
const GIG_PRO_TYPES = ["DJ","Anchor","Emcee/Host","Band","Singer","Musician","Performer","Stand-up Comedian","Magician","AV Setup","Choreographer"];

// ── Inventory tab label per type ──────────────────────────────────────────────
const INVENTORY_LABELS = {
  DJ:"Set List", Band:"Song List", Singer:"Repertoire", Musician:"Repertoire",
  Choreographer:"Routines", "Stand-up Comedian":"Material", Magician:"Act List",
  "AV Setup":"Equipment", Performer:"Act List", Anchor:"Setlist", "Emcee/Host":"Setlist",
};

// ── Profiles per type ─────────────────────────────────────────────────────────
const PROFILES_BY_TYPE = {
  Anchor:{name:"Rahul Khanna",type:"Anchor",city:"Delhi",phone:"+91 98765 43210",email:"rahul@rahulkhanna.mc",bio:"Delhi-based bilingual anchor & corporate emcee with 10+ years hosting 430+ events — from intimate weddings to 1,000-pax galas. Known for my comedy-roast style and seamless Hindi–English hosting.",rating:4.8,reviewCount:54,events:430,responseTime:"< 2 hrs",teamSize:1,years:10,instagram:"@rahulkhanna.mc",youtube:"youtube.com/@rahulkhannaMC",showreel:"https://youtube.com/watch?v=demo-anchor",genres:["Bollywood","Corporate Hosting","Comedy Roast","Bilingual (Hindi + English)","Punjabi"],instruments:[],setlist:"Opening ceremony address\nInteractive icebreaker games\nAwards & recognition ceremony\nLive audience Q&A moderation\nEvening entertainment & comedy set\nClosing vote of thanks"},
  "Emcee/Host":{name:"Sonali Verma",type:"Emcee/Host",city:"Bengaluru",phone:"+91 99887 22110",email:"sonali@sonaliverma.host",bio:"Bengaluru-based trilingual emcee (English · Hindi · Kannada) with 6 years and 200+ events. Specialist in product launches, award nights, and corporate galas.",rating:4.7,reviewCount:38,events:204,responseTime:"< 3 hrs",teamSize:1,years:6,instagram:"@sonaliverma.host",youtube:"youtube.com/@SonaliVHost",showreel:"https://youtube.com/watch?v=demo-emcee",genres:["Corporate Hosting","Product Launches","Award Nights","Trilingual","Fashion Shows"],instruments:[],setlist:"Welcome address & housekeeping\nSpeaker introductions\nProduct / brand reveal moment\nLive polling & audience Q&A\nAward ceremony hosting\nClosing & vote of thanks"},
  DJ:{name:"Arjun Mehta",type:"DJ",city:"Mumbai",phone:"+91 98000 11234",email:"arjun@arjunmehta.dj",bio:"Mumbai-based DJ with 8+ years spinning at 312+ events — clubs, weddings, and corporate nights. Known for seamless Bollywood-to-deep-house blending.",rating:4.9,reviewCount:67,events:312,responseTime:"< 1 hr",teamSize:1,years:8,instagram:"@arjunmehta.dj",youtube:"youtube.com/@ArjunMehtaDJ",showreel:"https://youtube.com/watch?v=demo-dj",genres:["Deep House","Bollywood Remixes","EDM","Hip-Hop","Techno","Afrobeats"],instruments:["Pioneer CDJ-3000","Allen & Heath Xone 96","Pioneer DJM-900NXS2"],setlist:"Warm-up — Deep House / Afrobeats\nPre-peak Bollywood anthems\nEDM / Progressive build + drop\nBollywood peak-hour block\nHip-Hop / trap room hour\nSlow closer / last dance set"},
  Band:{name:"The Velvet Collective",type:"Band",city:"Bengaluru",phone:"+91 98123 55678",email:"booking@velvetcollective.in",bio:"6-piece versatile live band from Bengaluru. 280+ events from intimate sangeet soirées to 1,000-guest receptions. Signature sound: Bollywood meets Sufi meets retro gold.",rating:4.8,reviewCount:49,events:280,responseTime:"< 4 hrs",teamSize:6,years:7,instagram:"@thevelvetcollective",youtube:"youtube.com/@VelvetCollectiveBand",showreel:"https://youtube.com/watch?v=demo-band",genres:["Bollywood","Sufi","Punjabi Folk","Classic Retro","Semi-Classical","Pop"],instruments:["Vocals (2)","Guitar","Keyboard","Drums","Bass","Tabla / Percussion"],setlist:"Sufi opening medley\nClassic Bollywood 70s–80s set\nPunjabi wedding anthems\nRetro Rock Bollywood fusion\nContemporary Bollywood peak hour\nFolk & Sufi wind-down set"},
  Singer:{name:"Priya Sharma",type:"Singer",city:"Delhi",phone:"+91 97654 33221",email:"priya@priyasharma.singer",bio:"Delhi-based playback and live singer, 5 years at 160+ events. Trained in Hindustani classical, known for soulful Bollywood covers and ghazals.",rating:4.9,reviewCount:44,events:160,responseTime:"< 2 hrs",teamSize:1,years:5,instagram:"@priyasharma.sings",youtube:"youtube.com/@PriyaSharmaOfficial",showreel:"https://youtube.com/watch?v=demo-singer",genres:["Bollywood","Ghazals","Sufi","Devotional","Hindustani Classical","Pop"],instruments:[],setlist:"Ghazal opening medley (3 songs)\nBollywood 2010s wedding hits\nSufi classics block\nDevotional aarti set (on request)\nContemporary Bollywood chartbusters\nSlowing-down romantic finale"},
  Musician:{name:"Vikram Nair",type:"Musician",city:"Chennai",phone:"+91 94456 78900",email:"vikram@vikramnair.music",bio:"Multi-instrumentalist from Chennai — guitar, keyboard, bass. 9 years, 220+ events from ambient cocktail hours to full concert experiences.",rating:4.7,reviewCount:31,events:220,responseTime:"< 3 hrs",teamSize:1,years:9,instagram:"@vikramnair.music",youtube:"youtube.com/@VikramNairMusic",showreel:"https://youtube.com/watch?v=demo-musician",genres:["Instrumental Jazz","Bollywood Acoustic","Carnatic Classical","Ambient / Lo-fi","Fusion"],instruments:["Acoustic Guitar","Electric Guitar","Piano / Keyboard","Bass Guitar"],setlist:"Ambient cocktail set (acoustic Bollywood)\nJazz standard trio set\nCarnatic fusion interlude\nBollywood acoustic medley\nContemporary instrumental pop\nFull concert finale piece"},
  Performer:{name:"Ankit Sharma",type:"Performer",city:"Jaipur",phone:"+91 95678 44332",email:"ankit@ankitsharma.perform",bio:"Jaipur-based live performer — fire shows, LED acts, Rajasthani folk. 7 years, 190+ events bringing visual spectacle to weddings and corporate nights.",rating:4.8,reviewCount:36,events:190,responseTime:"< 2 hrs",teamSize:3,years:7,instagram:"@ankitsharma.perform",youtube:"youtube.com/@AnkitPerforms",showreel:"https://youtube.com/watch?v=demo-performer",genres:["Fire Show","LED Performance","Rajasthani Folk","Aerial Hoop","Juggling & Props"],instruments:[],setlist:"Grand entrance fire welcome act\nLED dance interlude\nRajasthani folk performance set\nAerial hoop showcase\nFire finale & grand close"},
  "Stand-up Comedian":{name:"Kabir Sinha",type:"Stand-up Comedian",city:"Mumbai",phone:"+91 96543 21098",email:"kabir@kabirsinha.comedy",bio:"Mumbai-based stand-up comedian, 240+ shows since 2018 — corporates, weddings, and open mics. Clean, relatable humour in Hindi and English.",rating:4.8,reviewCount:52,events:240,responseTime:"< 2 hrs",teamSize:1,years:7,instagram:"@kabir.sinha.comedy",youtube:"youtube.com/@KabirSinhaComedy",showreel:"https://youtube.com/watch?v=demo-comedy",genres:["Corporate Clean Comedy","Hindi Stand-up","Wedding Comedy","English Stand-up","Observational"],instruments:[],setlist:"Crowd warm-up & icebreaker (5 min)\nObservational opener set (10 min)\nRelationship & wedding material (10 min)\nCrowd work & personalization (5 min)\nBig closer / punchline finale (5 min)"},
  Magician:{name:"Arav The Mystic",type:"Magician",city:"Hyderabad",phone:"+91 93456 78901",email:"arav@aravthemystic.com",bio:"Hyderabad-based professional magician, 6 years and 175+ events. Close-up magic, stage illusions, and jaw-dropping mentalism for corporates, weddings, and private parties.",rating:4.9,reviewCount:41,events:175,responseTime:"< 2 hrs",teamSize:1,years:6,instagram:"@aravthemystic",youtube:"youtube.com/@AravMystic",showreel:"https://youtube.com/watch?v=demo-magic",genres:["Close-up Magic","Stage Illusions","Mentalism","Kids' Magic","Corporate Magic"],instruments:[],setlist:"Strolling close-up table magic (during dinner)\nOpening mind-reading reveal (stage)\nLarge-scale card illusion sequence\nAudience volunteer levitation act\nMind-reading finale & grand illusion"},
  "AV Setup":{name:"SoundPro Events",type:"AV Setup",city:"Delhi",phone:"+91 98001 55443",email:"ops@soundproevent.in",bio:"Delhi's premier AV company, 12 years and 500+ events. Full-service sound, lighting, LED walls, truss, and live streaming — from intimate boardrooms to 2,000-pax arenas.",rating:4.7,reviewCount:89,events:512,responseTime:"< 1 hr",teamSize:12,years:12,instagram:"@soundproevent",youtube:"youtube.com/@SoundProEvents",showreel:"https://youtube.com/watch?v=demo-av",genres:["Line Array Sound","LED Video Walls","Concert Lighting","Truss & Rigging","Live Streaming"],instruments:[],setlist:"Site survey & acoustic assessment\nEquipment load-in & rigging\nSound check & line check\nLighting cue programming\nLive event operation\nPost-event teardown & load-out"},
  Choreographer:{name:"Neha Kapoor",type:"Choreographer",city:"Delhi",phone:"+91 95000 33221",email:"neha@nehakaporchoreography.in",bio:"Delhi's go-to wedding choreographer since 2019. 145+ groups trained — from couple first dances to 25-person sangeet flash mobs. Bollywood, Sufi, Bhangra, and contemporary.",rating:4.9,reviewCount:38,events:145,responseTime:"< 3 hrs",teamSize:2,years:6,instagram:"@nehakaporchoreography",youtube:"youtube.com/@NehaKapoorDance",showreel:"https://youtube.com/watch?v=demo-choreo",genres:["Bollywood","Bhangra / Giddha","Contemporary","Wedding Sangeet","Couple Dance","Hip-Hop"],instruments:[],setlist:"Sangeet opening group Bollywood number\nCouple's first dance choreography\nBridesmaids' surprise number\nBest men Bhangra set\nFamily group medley (all-ages)\nGrand finale flash mob"},
};

// ── Tendr bookings per type ───────────────────────────────────────────────────
const TENDR_BY_TYPE = {
  Anchor:[
    {id:"TND001",client:"Mehta Wedding",event:"Wedding Reception",date:"2026-09-20",venue:"The Grand, Delhi",budget:"₹35,000",status:"Pending",message:"Looking for a bilingual MC for our reception. 200 guests, 6 pm onwards."},
    {id:"TND002",client:"HDFC Life Insurance",event:"Annual Awards Night",date:"2026-09-28",venue:"Taj Palace, Delhi",budget:"₹75,000",status:"Confirmed",message:"Corporate awards night for 400 employees. Formal + fun tone."},
    {id:"TND003",client:"Priya Kapoor",event:"30th Birthday Bash",date:"2026-10-05",venue:"Rosewood Club, Gurgaon",budget:"₹20,000",status:"Pending",message:"Fun, energetic MC for a birthday party. 80 close friends."},
    {id:"TND004",client:"Startup Delhi Summit",event:"Investor Demo Day",date:"2026-10-14",venue:"India Habitat Centre",budget:"₹50,000",status:"Pending",message:"Hosting a demo day for 20 startups + 50 VCs. Professional tone."},
    {id:"TND005",client:"Sharma Family",event:"25th Anniversary",date:"2026-10-22",venue:"ITC Maurya, Delhi",budget:"₹30,000",status:"Declined",message:"Silver jubilee anniversary party, ~120 guests."},
  ],
  "Emcee/Host":[
    {id:"TND001",client:"Adobe India",event:"Annual Product Summit",date:"2026-09-22",venue:"JW Marriott, Bengaluru",budget:"₹60,000",status:"Confirmed",message:"Trilingual emcee for 300-pax tech summit. English primary, Hindi/Kannada for breaks."},
    {id:"TND002",client:"Tata Motors",event:"National Dealer Awards",date:"2026-09-30",venue:"The Lalit, Bengaluru",budget:"₹85,000",status:"Pending",message:"High-energy awards night host for 500 dealers. Bilingual."},
    {id:"TND003",client:"Nykaa",event:"D2C Fashion Show",date:"2026-10-08",venue:"Conrad Hotel, Bengaluru",budget:"₹40,000",status:"Pending",message:"Runway fashion show host — energetic, style-savvy."},
    {id:"TND004",client:"Ananya Mehta",event:"Engagement Ceremony",date:"2026-10-18",venue:"Taj West End",budget:"₹25,000",status:"Pending",message:"Elegant engagement ceremony host, 150 guests."},
    {id:"TND005",client:"IIM Bangalore",event:"Convocation 2026",date:"2026-11-02",venue:"IIM Campus, Bengaluru",budget:"₹45,000",status:"Declined",message:"Academic convocation host. Formal, dignified tone required."},
  ],
  DJ:[
    {id:"TND001",client:"Sharma Wedding",event:"Wedding Reception",date:"2026-09-20",venue:"Leela Palace, Delhi",budget:"₹28,000",status:"Pending",message:"DJ for wedding reception, 300 guests, 9 pm. Mix of Bollywood and EDM."},
    {id:"TND002",client:"StartupFest 2026",event:"Corporate After-Party",date:"2026-09-27",venue:"The Clubhouse, BKC",budget:"₹55,000",status:"Confirmed",message:"High-energy DJ for startup conference after-party. 150 attendees, house + commercial."},
    {id:"TND003",client:"Riya Kapoor",event:"25th Birthday Pool Party",date:"2026-10-05",venue:"Juhu Beach Club",budget:"₹22,000",status:"Pending",message:"DJ for pool party birthday. ~60 friends, EDM and hip-hop."},
    {id:"TND004",client:"Taj Hotels",event:"New Year's Eve Gala",date:"2026-12-31",venue:"Taj Mahal Palace, Mumbai",budget:"₹90,000",status:"Pending",message:"Premium NYE gala DJ for 400 guests. Luxury hotel experience required."},
    {id:"TND005",client:"IndiGo Airlines",event:"Employee Awards Night",date:"2026-10-18",venue:"Hyatt Regency, Mumbai",budget:"₹35,000",status:"Declined",message:"Corporate DJ, clean mix, no explicit content."},
  ],
  Band:[
    {id:"TND001",client:"Gupta Wedding",event:"Sangeet Ceremony",date:"2026-09-19",venue:"Leela Palace, Bengaluru",budget:"₹80,000",status:"Confirmed",message:"Full live band for sangeet night. 250 guests. Bollywood, Sufi, Punjabi."},
    {id:"TND002",client:"Infosys Ltd",event:"Foundation Day Gala",date:"2026-09-26",venue:"Taj Vivanta, Bengaluru",budget:"₹1,20,000",status:"Pending",message:"Live band for annual foundation day dinner. 600 employees. Corporate + Bollywood mix."},
    {id:"TND003",client:"Priya & Karan",event:"Wedding Reception",date:"2026-10-10",venue:"ITC Gardenia",budget:"₹95,000",status:"Pending",message:"6-hr reception with live band. 400 guests. Contemporary + retro."},
    {id:"TND004",client:"Hard Rock Café",event:"Saturday Night Live",date:"2026-10-19",venue:"Hard Rock Café, Bengaluru",budget:"₹45,000",status:"Pending",message:"Live band for restaurant gig. 3-hr set, rock + Bollywood crowd pleasers."},
    {id:"TND005",client:"Meghna Patel",event:"30th Birthday Bash",date:"2026-11-02",venue:"Conrad Hotel Rooftop",budget:"₹60,000",status:"Declined",message:"Live band for intimate rooftop birthday. 80 guests."},
  ],
  Singer:[
    {id:"TND001",client:"Verma Wedding",event:"Sangeet Night",date:"2026-09-21",venue:"The Grand, Delhi",budget:"₹30,000",status:"Confirmed",message:"Live singer for sangeet, 2-hr set. Bollywood + Sufi. 180 guests."},
    {id:"TND002",client:"Diwali Corporate Night",event:"Festive Gala",date:"2026-10-02",venue:"Trident Hotel, Delhi",budget:"₹40,000",status:"Pending",message:"Live singer for Diwali corporate party. 300 guests. Festive + Bollywood."},
    {id:"TND003",client:"Kavya Reddy",event:"25th Birthday",date:"2026-10-12",venue:"The Piano Man, Delhi",budget:"₹18,000",status:"Pending",message:"Intimate birthday performance. 40 guests. Romantic Bollywood."},
    {id:"TND004",client:"Radio City",event:"Live Concert Recording",date:"2026-10-25",venue:"Kingdom of Dreams, Gurgaon",budget:"₹55,000",status:"Pending",message:"Live concert for radio station event. 500 audience. 45-min set."},
    {id:"TND005",client:"Navratri Committee",event:"Navratri Celebration",date:"2026-10-08",venue:"Community Ground, Delhi",budget:"₹25,000",status:"Declined",message:"Devotional + Navratri folk singer for 1,000-person community event."},
  ],
  Musician:[
    {id:"TND001",client:"Ahuja Wedding",event:"Cocktail Hour",date:"2026-09-18",venue:"Taj Coromandel, Chennai",budget:"₹22,000",status:"Confirmed",message:"Ambient acoustic set for cocktail hour. 150 guests. Soft Bollywood + jazz."},
    {id:"TND002",client:"Taj Hotels",event:"Sunday Jazz Brunch",date:"2026-09-28",venue:"Taj Fisherman's Cove",budget:"₹18,000",status:"Pending",message:"Weekly jazz brunch musician. 3-hr set. Jazz standards + bossa nova."},
    {id:"TND003",client:"Anand Shankar",event:"House Concert",date:"2026-10-06",venue:"Private Villa, Adyar",budget:"₹30,000",status:"Pending",message:"Intimate house concert for 30 music lovers. Carnatic fusion."},
    {id:"TND004",client:"Alliance Française",event:"French Music Evening",date:"2026-10-20",venue:"Alliance Française, Chennai",budget:"₹25,000",status:"Pending",message:"French chansons + jazz. Bilingual audience. 80 guests."},
    {id:"TND005",client:"Chennai Schools",event:"Annual Day Performance",date:"2026-11-10",venue:"Music Academy, Chennai",budget:"₹15,000",status:"Declined",message:"Classical Carnatic performance for school annual day."},
  ],
  Performer:[
    {id:"TND001",client:"Kapoor Wedding",event:"Wedding Sangeet",date:"2026-09-22",venue:"Rambagh Palace, Jaipur",budget:"₹45,000",status:"Confirmed",message:"Fire show + Rajasthani folk act for sangeet night. 300 guests. 45 min."},
    {id:"TND002",client:"Rajasthan Tourism",event:"Tourism Festival",date:"2026-10-03",venue:"Nahargarh Fort, Jaipur",budget:"₹80,000",status:"Pending",message:"Grand folk performance showcase for international tourists. 2 hrs."},
    {id:"TND003",client:"Amazon India",event:"Diwali Corporate Party",date:"2026-10-22",venue:"JW Marriott, Delhi",budget:"₹55,000",status:"Pending",message:"LED performance + fire show for Diwali corporate night. 400 employees."},
    {id:"TND004",client:"Park Hotel",event:"New Year Countdown",date:"2026-12-31",venue:"Park Hotel, Jaipur",budget:"₹65,000",status:"Pending",message:"Fire show finale at NYE countdown. Outdoor poolside. 600 guests."},
    {id:"TND005",client:"Shivani Mehta",event:"30th Birthday Bash",date:"2026-10-15",venue:"Home Garden, Jaipur",budget:"₹20,000",status:"Declined",message:"Fun LED and juggling act for birthday party. 60 guests."},
  ],
  "Stand-up Comedian":[
    {id:"TND001",client:"Zomato",event:"Quarterly All-Hands",date:"2026-09-25",venue:"Zomato HQ, Gurugram",budget:"₹50,000",status:"Confirmed",message:"Clean corporate comedy for 400-person all-hands. 30-min set. Relatable tech humour."},
    {id:"TND002",client:"Vikram & Pooja",event:"Wedding Night",date:"2026-10-04",venue:"Sofitel, Mumbai",budget:"₹35,000",status:"Pending",message:"Wedding comedian for reception. 200 guests. Family-friendly, mix of Hindi-English."},
    {id:"TND003",client:"BookMyShow",event:"Comedy Night",date:"2026-10-18",venue:"Canvas Laugh Club, Mumbai",budget:"₹25,000",status:"Pending",message:"45-min headliner slot at ticketed comedy night. 150 audience."},
    {id:"TND004",client:"Wipro",event:"Annual Day Comedy Night",date:"2026-11-05",venue:"JW Marriott, Bengaluru",budget:"₹70,000",status:"Pending",message:"Corporate comedy for 800 employees. 1-hr set. Diverse audience, clean material."},
    {id:"TND005",client:"Neha Joshi",event:"Bachelorette Night",date:"2026-10-10",venue:"The Bar Stock Exchange",budget:"₹18,000",status:"Declined",message:"Roast-style comedy for bachelorette party. 25 guests."},
  ],
  Magician:[
    {id:"TND001",client:"Patil Wedding",event:"Wedding Cocktail Hour",date:"2026-09-23",venue:"Novotel, Hyderabad",budget:"₹25,000",status:"Confirmed",message:"Strolling close-up magic during cocktail dinner. 200 guests. 90 min."},
    {id:"TND002",client:"Microsoft India",event:"Annual Kids' Day",date:"2026-10-06",venue:"Microsoft Campus, Hyderabad",budget:"₹40,000",status:"Pending",message:"Kids' magic show for employee family day. 150 kids + parents. 45 min stage show."},
    {id:"TND003",client:"Siddharth Rao",event:"7th Birthday Party",date:"2026-10-15",venue:"Home, Jubilee Hills",budget:"₹15,000",status:"Pending",message:"Fun birthday magic show for 40 kids. Interactive, comedy-magic style."},
    {id:"TND004",client:"Hyatt Hotel",event:"New Year Gala",date:"2026-12-31",venue:"Hyatt Regency, Hyderabad",budget:"₹60,000",status:"Pending",message:"Stage magic show + strolling magic. NYE gala, 500 guests. 30 min stage + 2 hr roaming."},
    {id:"TND005",client:"Cyberabad Police",event:"Community Event",date:"2026-11-14",venue:"Community Hall, Hyderabad",budget:"₹8,000",status:"Declined",message:"Public community magic show. Free event, 300 audience."},
  ],
  "AV Setup":[
    {id:"TND001",client:"Samsung India",event:"Product Launch Delhi",date:"2026-09-26",venue:"Aerocity Arena, Delhi",budget:"₹3,50,000",status:"Confirmed",message:"Full AV production for flagship product launch. LED wall, line array, lighting. 800 attendees."},
    {id:"TND002",client:"Kapoor Wedding",event:"Wedding Ceremony + Reception",date:"2026-10-05",venue:"Leela Palace, Delhi",budget:"₹2,20,000",status:"Pending",message:"Full sound, lights, LED backdrop for 2-day wedding. 500 guests per function."},
    {id:"TND003",client:"FICCI",event:"Annual Conference",date:"2026-10-14",venue:"Vigyan Bhavan, Delhi",budget:"₹4,50,000",status:"Pending",message:"Conference-grade AV, 3 halls, live streaming, simultaneous translation booths. 1,200 delegates."},
    {id:"TND004",client:"Times Now",event:"Debate Night",date:"2026-10-22",venue:"Times Now Studio, Delhi",budget:"₹1,80,000",status:"Pending",message:"Broadcast-quality AV for live TV debate event. 200 audience + broadcast feed."},
    {id:"TND005",client:"Gupta Birthday",event:"50th Birthday Party",date:"2026-11-01",venue:"Home Farmhouse, Delhi NCR",budget:"₹60,000",status:"Declined",message:"Basic sound + lights for farmhouse birthday. 150 guests."},
  ],
  Choreographer:[
    {id:"TND001",client:"Sharma Wedding",event:"Sangeet Choreography",date:"2026-09-20",venue:"ITC Maurya, Delhi",budget:"₹40,000",status:"Confirmed",message:"Choreography for 3 groups + couple's first dance. 6 weeks of classes. 220 guests at event."},
    {id:"TND002",client:"Mehta Family",event:"Mehndi & Sangeet",date:"2026-10-03",venue:"Taj Palace, Delhi",budget:"₹55,000",status:"Pending",message:"Full sangeet choreography — 4 groups, 25 people total. Hindi + Punjabi songs."},
    {id:"TND003",client:"Nisha Kapoor",event:"Bachelorette Flash Mob",date:"2026-10-12",venue:"DLF Mall of India",budget:"₹22,000",status:"Pending",message:"Surprise flash mob choreography for 12 bridesmaids. 4 rehearsals, 3-min Bollywood number."},
    {id:"TND004",client:"Delhi Corporate League",event:"Annual Sports Day Dance",date:"2026-10-25",venue:"Siri Fort Auditorium",budget:"₹35,000",status:"Pending",message:"Group dance for 20 corporate employees. Contemporary Bollywood. 2-week prep."},
    {id:"TND005",client:"St. Thomas School",event:"Annual Day Performance",date:"2026-11-08",venue:"School Auditorium, Delhi",budget:"₹18,000",status:"Declined",message:"Choreography for school annual day. 30 students, 4 performances."},
  ],
};

// ── Mock outside orders ────────────────────────────────────────────────────────
const INIT_OUTSIDE = [
  { id: "OUT001", client: "TechConf India", event: "Product Launch", date: "2026-09-15", amount: 55000, paidAmount: 55000, expenses: [{ label: "Travel", amount: 2000 }], status: "Completed" },
  { id: "OUT002", client: "Ananya & Karan", event: "Wedding Ceremony", date: "2026-08-10", amount: 45000, paidAmount: 45000, expenses: [{ label: "Prep materials", amount: 1500 }], status: "Completed" },
  { id: "OUT003", client: "ITC Hotels", event: "Corporate Gala Dinner", date: "2026-09-30", amount: 60000, paidAmount: 30000, expenses: [], status: "Upcoming" },
  { id: "OUT004", client: "Meghna Patel", event: "30th Birthday Bash", date: "2026-07-25", amount: 18000, paidAmount: 18000, expenses: [], status: "Completed" },
  { id: "OUT005", client: "EduSpark Summit", event: "School Annual Day", date: "2026-08-28", amount: 25000, paidAmount: 25000, expenses: [{ label: "Props", amount: 800 }], status: "Completed" },
  { id: "OUT006", client: "Samsung India", event: "Product Launch Delhi", date: "2026-07-08", amount: 70000, paidAmount: 70000, expenses: [{ label: "Outfit rental", amount: 3000 }], status: "Completed" },
  { id: "OUT007", client: "Kapoor & Sons", event: "Wedding Reception", date: "2026-06-14", amount: 40000, paidAmount: 40000, expenses: [], status: "Completed" },
];

// ── Monthly P&L ────────────────────────────────────────────────────────────────
const MONTHLY = [
  { month: "Mar", revenue: 85000, expenses: 9000 },
  { month: "Apr", revenue: 92000, expenses: 11000 },
  { month: "May", revenue: 63000, expenses: 7500 },
  { month: "Jun", revenue: 118000, expenses: 16000 },
  { month: "Jul", revenue: 98000, expenses: 12000 },
  { month: "Aug", revenue: 143000, expenses: 19000 },
  { month: "Sep", revenue: 55000, expenses: 6000 },
];

// ── Mock reviews ───────────────────────────────────────────────────────────────
const INIT_REVIEWS = [
  { id: 1, name: "Ananya & Karan Wedding", event: "Wedding, Aug 2025", rating: 5, text: "Rahul was exceptional! He kept the energy alive through the entire ceremony and reception. Guests are still talking about how smooth the evening flowed.", response: "Thank you so much Ananya & Karan — this was one of my favourite weddings of 2025. Wishing you both a lifetime of happiness! 🥂" },
  { id: 2, name: "HDFC Life Insurance", event: "Awards Night, Jun 2025", rating: 5, text: "Outstanding professionalism. Rahul adapted seamlessly to our corporate tone and had the audience engaged throughout. Will definitely book him again.", response: "Truly an honour to host HDFC Life — what a fantastic team and audience. Looking forward to the Q3 summit!" },
  { id: 3, name: "Meghna Patel", event: "Birthday, Jul 2025", rating: 5, text: "Best birthday ever! He had the crowd roaring with laughter within 5 minutes. The personalised roast was perfectly tailored to our group.", response: "Meghna — your friends were the best crowd! The prep call really helped me tailor the roast perfectly. Thank you for trusting me with your big 3-0! 🎉" },
  { id: 4, name: "EduSpark Summit", event: "School Annual Day, Aug 2025", rating: 4, text: "Very good with the kids and parents. Slightly rushed at the end but overall a great experience. Would recommend for school events.", response: null },
  { id: 5, name: "TechConf India", event: "Product Launch, Sep 2025", rating: 5, text: "Rahul elevated our product launch with energy and sharp wit. The tech crowd loved him. Very punctual and well-prepared.", response: null },
  { id: 6, name: "Samsung India", event: "Product Launch, Jul 2025", rating: 5, text: "Phenomenal hosting. Perfect balance of hype and information. The 1,500-person crowd was engaged the whole time.", response: "Samsung events are always special — the scale and energy are unmatched. Thank you for having me! 🙏" },
];

// ── Packages per type ─────────────────────────────────────────────────────────
const PACKAGES_BY_TYPE = {
  Anchor:[
    {id:1,name:"Half Day",price:25000,unit:"4 hours",icon:"🥉",items:"Pre-event briefing call\nBilingual hosting\nUp to 4 hrs coverage\nScript + cue card prep"},
    {id:2,name:"Full Day",price:45000,unit:"full event",icon:"🥇",badge:"Most Popular",items:"Pre-event strategy call\nBilingual hosting\nFull-day coverage (10 hrs)\nCustom script writing\nLive audience games\nEmcee standby between segments"},
    {id:3,name:"Premium Corporate",price:85000,unit:"full event",icon:"💎",items:"2 planning calls + site visit\nCorporate-grade scripting\nAwards & recognition hosting\nPanel moderation\nLive crowd interaction design"},
  ],
  "Emcee/Host":[
    {id:1,name:"Half Day Host",price:20000,unit:"4 hours",icon:"🥉",items:"Pre-event briefing\nTrilingual hosting\n4 hrs coverage\nCue card prep"},
    {id:2,name:"Full Event",price:38000,unit:"full event",icon:"🥇",badge:"Most Popular",items:"Planning call + site check\nFull-day hosting\nCustom script\nAward ceremony facilitation\nLive audience interaction"},
    {id:3,name:"Corporate Premium",price:70000,unit:"full event",icon:"💎",items:"2 strategy calls\nConference scripting\nPanel moderation\nSpeaker coaching\nLive Q&A management\nPost-event recap"},
  ],
  DJ:[
    {id:1,name:"2-Hour Mix",price:15000,unit:"2 hours",icon:"🥉",items:"2 hrs live DJing\nBasic sound system\nBollywood + commercial set"},
    {id:2,name:"4-Hour Party",price:28000,unit:"4 hours",icon:"🥇",badge:"Most Popular",items:"4 hrs live DJing\nProfessional PA + subwoofers\nCustom playlist consultation\nWireless mic included\nSmoke machine"},
    {id:3,name:"Full Night Production",price:55000,unit:"6-8 hours",icon:"💎",items:"6–8 hrs DJing\nLine-array speaker system\nFull LED lighting rig\nLaser show\nCustom event mix prep"},
  ],
  Band:[
    {id:1,name:"1-Hour Set",price:40000,unit:"1 hour",icon:"🥉",items:"1 hr live performance\n6 musicians\nSound system included\n10-song set"},
    {id:2,name:"2-Hour Evening",price:70000,unit:"2 hours",icon:"🥇",badge:"Most Popular",items:"2 hr live performance\nFull 6-piece band\nCustom setlist planning\nSoundcheck + rehearsal\n20-song mixed set"},
    {id:3,name:"Full Wedding Package",price:120000,unit:"full event",icon:"💎",items:"4 hrs coverage\nFull band + PA\nCustom medleys\nDedicatory songs\nIntermission playlist\nPost-event recording"},
  ],
  Singer:[
    {id:1,name:"10-Song Set",price:18000,unit:"45 min",icon:"🥉",items:"10 pre-selected songs\nPersonal mic + in-ear\nBacktrack included"},
    {id:2,name:"20-Song Evening",price:32000,unit:"90 min",icon:"🥇",badge:"Most Popular",items:"Custom 20-song list\nFull rehearsal call\nMix of Bollywood & Sufi\nDedication requests (3)"},
    {id:3,name:"Concert Experience",price:58000,unit:"2+ hours",icon:"💎",items:"Full 2+ hr performance\nCurated custom setlist\nLive band option (+cost)\nBackstage meet & greet\nPersonalised intro for client"},
  ],
  Musician:[
    {id:1,name:"Cocktail Set",price:15000,unit:"2 hours",icon:"🥉",items:"2 hrs ambient solo performance\nAcoustic guitar or keyboard\nSoft Bollywood + jazz mix"},
    {id:2,name:"Event Performance",price:28000,unit:"3 hours",icon:"🥇",badge:"Most Popular",items:"3 hrs mixed performance\nInstrument of choice\nCustom genre consultation\nWireless setup included"},
    {id:3,name:"Concert Set",price:50000,unit:"full evening",icon:"💎",items:"Full evening 4+ hrs\nMulti-instrument showcase\nCustom compositions\nLive looping included\nPost-show recording"},
  ],
  Performer:[
    {id:1,name:"Fire Welcome Act",price:20000,unit:"20 min",icon:"🥉",items:"Grand entrance fire act\n2 performers\nBasic props included\nOutdoor venues only"},
    {id:2,name:"Full Show Package",price:45000,unit:"45 min",icon:"🥇",badge:"Most Popular",items:"Fire + LED combined show\n3 performers\nRajasthani folk segment\nCustom choreography\nProp setup included"},
    {id:3,name:"Grand Production",price:80000,unit:"90 min",icon:"💎",items:"Fire + LED + aerial acts\n5 performers\nCustom theme integration\nFull rehearsal walk-through\nOutdoor / indoor flexible"},
  ],
  "Stand-up Comedian":[
    {id:1,name:"20-Min Set",price:20000,unit:"20 min",icon:"🥉",items:"Clean 20-min stand-up\nHindi + English\nBasic crowd interaction"},
    {id:2,name:"40-Min Show",price:38000,unit:"40 min",icon:"🥇",badge:"Most Popular",items:"40-min full show\nCustom crowd roast material\nInteractive segment\nPre-show briefing call"},
    {id:3,name:"Full Hour Corporate",price:70000,unit:"60 min",icon:"💎",items:"60-min headliner set\nCompany-specific jokes\nPre-event research call\nVideo recording rights\nPost-show meet & greet"},
  ],
  Magician:[
    {id:1,name:"Table Magic (90 min)",price:18000,unit:"90 min",icon:"🥉",items:"Strolling close-up magic\nCovers 15–20 tables\nCard + coin routines"},
    {id:2,name:"Stage Show (45 min)",price:35000,unit:"45 min",icon:"🥇",badge:"Most Popular",items:"Full stage magic show\nAudience volunteers\nLevitation act\nMentalism segment\nCustom reveal for client"},
    {id:3,name:"Grand Experience",price:60000,unit:"full event",icon:"💎",items:"Stage show + roaming magic\nMindreading finale\nCustom-branded reveals\nPre-event personalisation\nPhoto opportunities included"},
  ],
  "AV Setup":[
    {id:1,name:"Basic Sound & Light",price:35000,unit:"per day",icon:"🥉",items:"2 column speakers + subwoofer\nWireless mics (2)\nBasic wash lighting\nTechnician included"},
    {id:2,name:"Event Production",price:120000,unit:"full event",icon:"🥇",badge:"Most Popular",items:"Line array PA system\nLED moving heads (12)\nLED backdrop 10×6 ft\nWireless mics (6)\nFOH engineer + tech crew"},
    {id:3,name:"Full AV Production",price:350000,unit:"full event",icon:"💎",items:"Concert-grade line array\nLED video wall 20×12 ft\nFull concert lighting rig\nLive streaming setup\nBroadcast-quality cameras (3)\nFull crew + project manager"},
  ],
  Choreographer:[
    {id:1,name:"Couple's Dance",price:15000,unit:"5 sessions",icon:"🥉",items:"5 rehearsal sessions\nCouple first dance\nSong selection help\nDay-of guidance"},
    {id:2,name:"Group Sangeet",price:35000,unit:"10 sessions",icon:"🥇",badge:"Most Popular",items:"10 group sessions\nUp to 15 performers\n2 choreography numbers\nCostume & prop guidance\nDay-of rehearsal included"},
    {id:3,name:"Full Wedding Package",price:65000,unit:"full event",icon:"💎",items:"Unlimited sessions (3 weeks)\nAll groups covered\n4+ performance numbers\nFlash mob option\nFilming of final performance\nDay-of coordination"},
  ],
};

// ── Setlist / inventory per type ──────────────────────────────────────────────
const SETLIST_BY_TYPE = {
  Anchor:["Opening ceremony address","Interactive icebreaker games","Awards & recognition ceremony","Live audience Q&A moderation","Evening entertainment & comedy set","Closing vote of thanks"],
  "Emcee/Host":["Welcome address & housekeeping","Speaker introductions","Product / brand reveal moment","Live polling & audience Q&A","Award ceremony hosting","Closing & vote of thanks"],
  DJ:["Warm-up — Deep House / Afrobeats","Pre-peak Bollywood anthems","EDM / Progressive build + drop","Bollywood peak-hour block","Hip-Hop / trap room hour","Slow closer / last dance set"],
  Band:["Sufi opening medley","Classic Bollywood 70s–80s set","Punjabi wedding anthems","Retro Rock Bollywood fusion","Contemporary Bollywood peak hour","Folk & Sufi wind-down set"],
  Singer:["Ghazal opening medley (3 songs)","Bollywood 2010s wedding hits","Sufi classics block","Devotional aarti set (on request)","Contemporary Bollywood chartbusters","Slow romantic finale"],
  Musician:["Ambient cocktail set (acoustic Bollywood)","Jazz standard trio set","Carnatic fusion interlude","Bollywood acoustic medley","Contemporary instrumental pop","Full concert finale piece"],
  Performer:["Grand entrance fire welcome act","LED dance interlude","Rajasthani folk performance set","Aerial hoop showcase","Fire finale & grand close"],
  "Stand-up Comedian":["Crowd warm-up & icebreaker (5 min)","Observational opener set (10 min)","Relationship & wedding material (10 min)","Crowd work & personalization (5 min)","Big closer / punchline finale (5 min)"],
  Magician:["Strolling close-up table magic (during dinner)","Opening mind-reading reveal (stage)","Large-scale card illusion sequence","Audience volunteer levitation act","Mind-reading finale & grand illusion"],
  "AV Setup":["Site survey & acoustic assessment","Equipment load-in & rigging","Sound check & line check","Lighting cue programming","Live event operation","Post-event teardown & load-out"],
  Choreographer:["Sangeet opening group Bollywood number","Couple's first dance choreography","Bridesmaids' surprise number","Best men Bhangra set","Family group medley (all-ages)","Grand finale flash mob"],
};

// ── Booked dates for calendar ─────────────────────────────────────────────────
const BOOKED_DATES = new Set(["2026-09-15", "2026-09-20", "2026-09-28", "2026-09-30", "2026-10-05", "2026-10-14", "2026-10-22"]);

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV = [
  { key: "home",        group: "EVENTS",   label: "Home",        icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { key: "work",        group: "EVENTS",   label: "Work",        icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
  { key: "money",       group: "MONEY",    label: "Money",       icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { key: "invoice",     group: "MONEY",    label: "Invoices",    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" },
  { key: "contract",    group: "MONEY",    label: "Contracts",   icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" },
  { key: "packages",    group: "MANAGE",   label: "Packages",    icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" },
  { key: "reviews",     group: "MANAGE",   label: "Reviews",     icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { key: "inventory",   group: "MANAGE",   label: "Setlist",     icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  { key: "profile",     group: "MANAGE",   label: "Profile",     icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { key: "gig",         group: "ARTIST",   label: "Performance", icon: "M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { key: "calendar",    group: "SCHEDULE", label: "Availability",icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" },
  { key: "market",      group: "GROW",     label: "Grow",        icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function Icon({ d: path, size = 18, color = "currentColor", fill = "none", strokeW = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function Stars({ r, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(r) ? goldLt : "none"} stroke={goldLt} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function fmt(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

function Badge({ count, color = "#DC2626" }) {
  if (!count) return null;
  return <span style={{ background: color, color: "#fff", borderRadius: 100, padding: "1px 6px", fontSize: 10, fontWeight: 800, marginLeft: 6 }}>{count}</span>;
}

// ── localStorage helpers ───────────────────────────────────────────────────────
const LS_KEY = "tendr_demo_dash_v1";
function lsGet(key, fallback) {
  try { const s = localStorage.getItem(`${LS_KEY}:${key}`); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(`${LS_KEY}:${key}`, JSON.stringify(val)); } catch {}
}
function lsClear() {
  try { Object.keys(localStorage).filter(k => k.startsWith(LS_KEY)).forEach(k => localStorage.removeItem(k)); } catch {}
}

// ── Persisted state hook ───────────────────────────────────────────────────────
function usePersisted(key, init) {
  const [val, setVal] = useState(() => lsGet(key, init));
  const setAndPersist = (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    lsSet(key, next);
  };
  return [val, setAndPersist];
}

// ══ MAIN COMPONENT ════════════════════════════════════════════════════════════
export default function DemoDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("home");
  const [searchParams, setSearchParams] = useSearchParams();

  // Auth first — needed to select type-specific initial data
  const { user: authUser, token: authToken } = useSelector(s => s.auth);
  const vendorId = authUser?._id || authUser?.id;
  // URL param ?type=DJ overrides auth serviceType — allows no-login demo browsing
  const sType = searchParams.get("type") || authUser?.serviceType || "Anchor";
  const initProfile = PROFILES_BY_TYPE[sType] || PROFILES_BY_TYPE.Anchor;
  const initTendr   = TENDR_BY_TYPE[sType]    || TENDR_BY_TYPE.Anchor;
  const initPkgs    = PACKAGES_BY_TYPE[sType] || PACKAGES_BY_TYPE.Anchor;
  const initSetlist = SETLIST_BY_TYPE[sType]  || SETLIST_BY_TYPE.Anchor;
  const inventoryLabel = INVENTORY_LABELS[sType] || "Setlist";

  // Keys are type-prefixed so each performer type has its own isolated state
  const [profile, setProfile]   = usePersisted(`${sType}:profile`, initProfile);
  const [tendr,   setTendr]     = usePersisted(`${sType}:tendr`,   initTendr);
  const [reviews, setReviews]   = usePersisted(`${sType}:reviews`, INIT_REVIEWS);
  const [pkgs,    setPkgs]      = usePersisted(`${sType}:pkgs`,    initPkgs);
  const [setlist, setSetlist]   = usePersisted(`${sType}:setlist`, initSetlist);
  const [outside]               = useState(INIT_OUTSIDE); // outside orders: read-only mock

  const [profEdit, setProfEdit]   = useState(false);
  const [profDraft, setProfDraft] = useState({});
  const [replyDraft, setReplyDraft] = useState({});
  const [pkgModal, setPkgModal]   = useState(null);
  const [pkgDraft, setPkgDraft]   = useState({});
  const [newItem, setNewItem]     = useState("");
  const [moneyView, setMoneyView] = useState("pl");
  const [workView, setWorkView]   = useState("tendr");
  const [gigDraft, setGigDraft]   = useState({ genres: profile.genres.join(", "), showreel: profile.showreel, instagram: profile.instagram, youtube: profile.youtube, setlist: profile.setlist });
  const [gigSaved, setGigSaved]   = useState(false);
  const [dispModal, setDispModal] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outsideModal, setOutsideModal] = useState(false);
  const [outsideDraft, setOutsideDraft] = useState({ client: "", event: "", date: "", amount: "", status: "Upcoming" });
  const [outsideGigs, setOutsideGigs] = useState(INIT_OUTSIDE);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceDraft, setInvoiceDraft] = useState({ client: "", event: "", date: "", amount: "", notes: "" });
  const [invoices, setInvoices] = usePersisted(`${sType}:invoices`, []);
  const [linkHubPreview, setLinkHubPreview] = useState(false);
  const [profileCopied, setProfileCopied] = useState(false);
  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [blockedDates, setBlockedDates] = usePersisted(`${sType}:blockedDates`, []);
  const [contracts, setContracts] = usePersisted(`${sType}:contracts`, []);
  const [contractModal, setContractModal] = useState(false);
  const [contractDraft, setContractDraft] = useState({ client: "", event: "", date: "", amount: "", terms: "50% advance before event. Balance due on completion. Cancellation within 7 days: full advance forfeited." });

  // Keep gigDraft in sync when profile loads from localStorage
  useEffect(() => {
    setGigDraft({ genres: (profile.genres || []).join(", "), showreel: profile.showreel || "", instagram: profile.instagram || "", youtube: profile.youtube || "", setlist: profile.setlist || "" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real vendor API sync ───────────────────────────────────────────────────
  const isGigProVendor = !!(authToken && vendorId && GIG_PRO_TYPES.includes(authUser?.serviceType));

  function syncToApi(overProfile = profile, overPkgs = pkgs, overSetlist = setlist) {
    if (!isGigProVendor) return;
    const payload = {
      bio:    overProfile.bio || '',
      genres: Array.isArray(overProfile.genres) ? overProfile.genres : (overProfile.genres || '').split(',').map(g => g.trim()).filter(Boolean),
      social: {
        instagram: overProfile.instagram || '',
        youtube:   overProfile.youtube   || '',
        showreel:  overProfile.showreel  || '',
      },
      packages: (overPkgs || []).map(p => ({
        name:    p.name    || '',
        price:   Number(p.price) || 0,
        unit:    p.unit    || 'per event',
        badge:   p.badge   || '',
        bestFor: p.bestFor || '',
        items:   typeof p.items === 'string' ? p.items.split('\n').filter(s => s.trim()) : (p.items || []),
      })),
      setlist: overSetlist || [],
    };
    fetch(`${BASE_URL}/vendors/${vendorId}/gigpro`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      credentials: 'include',
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  function handleReset() {
    lsClear();
    setProfile(initProfile); lsSet(`${sType}:profile`, initProfile);
    setTendr(initTendr);     lsSet(`${sType}:tendr`,   initTendr);
    setReviews(INIT_REVIEWS); lsSet(`${sType}:reviews`, INIT_REVIEWS);
    setPkgs(initPkgs);       lsSet(`${sType}:pkgs`,    initPkgs);
    setSetlist(initSetlist); lsSet(`${sType}:setlist`, initSetlist);
    setGigDraft({ genres: (initProfile.genres||[]).join(", "), showreel: initProfile.showreel, instagram: initProfile.instagram, youtube: initProfile.youtube, setlist: initProfile.setlist });
    setResetConfirm(false);
  }

  // Derived counts for badges
  const pendingTendr = tendr.filter(b => b.status === "Pending").length;
  const unrespondedReviews = reviews.filter(r => !r.response).length;

  // ── Sidebar ────────────────────────────────────────────────────────────────
  function Sidebar() {
    let prevGroup = null;
    return (
      <div style={{ width: 214, background: ink, display: "flex", flexDirection: "column", minHeight: "100vh", flexShrink: 0 }}>
        {/* Logo + close button (close only visible on mobile) */}
        <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid rgba(204,171,74,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: serif, fontSize: "1.5rem", color: goldLt, fontWeight: 400, letterSpacing: "0.02em" }}>tendr</div>
            <div style={{ fontSize: 10, color: "rgba(204,171,74,0.6)", marginTop: 2, fontWeight: 700, letterSpacing: "0.15em" }}>VENDOR DEMO</div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,248,236,0.45)", cursor: "pointer", padding: 4, display: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {NAV.map(item => {
            const showDivider = item.group !== prevGroup;
            prevGroup = item.group;
            return (
              <React.Fragment key={item.key}>
                {showDivider && (
                  <div style={{ padding: "14px 20px 5px", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(204,171,74,0.6)", textTransform: "uppercase" }}>
                    {item.group}
                  </div>
                )}
                <button
                  onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "11px 20px", background: tab === item.key ? "rgba(204,171,74,0.14)" : "none", border: "none", cursor: "pointer", color: tab === item.key ? goldLt : "rgba(255,248,236,0.82)", fontSize: 14, fontWeight: tab === item.key ? 700 : 500, fontFamily: font, textAlign: "left", borderLeft: tab === item.key ? `3px solid ${goldLt}` : "3px solid transparent", transition: "all 0.15s" }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  {item.key === "inventory" ? inventoryLabel : item.label}
                  {item.key === "work" && <Badge count={pendingTendr} />}
                  {item.key === "reviews" && <Badge count={unrespondedReviews} color={gold} />}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Type switcher */}
        <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(204,171,74,0.12)" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(204,171,74,0.55)", textTransform: "uppercase", marginBottom: 7 }}>Switch Type</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {GIG_PRO_TYPES.map(t => (
              <button key={t} onClick={() => { setSearchParams({ type: t }); setSidebarOpen(false); }}
                style={{ padding: "3px 8px", borderRadius: 100, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: font, border: "1px solid", transition: "all 0.12s",
                  background: sType === t ? goldLt : "transparent",
                  color: sType === t ? ink : "rgba(204,171,74,0.6)",
                  borderColor: sType === t ? goldLt : "rgba(204,171,74,0.25)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Profile footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(204,171,74,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${gold}, ${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontFamily: serif, color: "#fff", fontWeight: 400, flexShrink: 0 }}>
              {profile.name[0]}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,248,236,0.92)", fontFamily: font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,248,236,0.45)" }}>{profile.type}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
            <button onClick={() => { nav(`/vendor/demo?type=${sType}`); setSidebarOpen(false); }} style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View Profile
            </button>
            <button onClick={() => { setProfDraft({ ...profile }); setProfEdit(true); setTab("profile"); setSidebarOpen(false); }} style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: "rgba(204,171,74,0.12)", color: goldLt, fontSize: 11, fontWeight: 700, border: "1px solid rgba(204,171,74,0.25)", cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
              Edit Profile
            </button>
          </div>
          {resetConfirm ? (
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,248,236,0.55)", marginBottom: 6, fontFamily: font }}>Reset all demo data?</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={handleReset} style={{ flex: 1, padding: "5px 0", borderRadius: 8, background: "#BE123C", color: "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font }}>Yes, Reset</button>
                <button onClick={() => setResetConfirm(false)} style={{ flex: 1, padding: "5px 0", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "rgba(255,248,236,0.6)", fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: font }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setResetConfirm(true)} style={{ width: "100%", padding: "6px 0", borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "rgba(255,248,236,0.4)", fontSize: 10.5, fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontFamily: font }}>↺ Reset demo data</button>
          )}
        </div>
      </div>
    );
  }

  // ── Content area ───────────────────────────────────────────────────────────
  const content = (() => {
    // ── HOME ──────────────────────────────────────────────────────────────────
    if (tab === "home") {
      const totalRevenue = outside.reduce((s, o) => s + o.paidAmount, 0);
      const today = new Date().toISOString().slice(0, 10);
      const todayGigs = [...tendr.filter(b => b.date === today && b.status === "Confirmed"), ...outside.filter(o => o.date === today)];
      const upcoming = [...tendr.filter(b => b.status === "Confirmed" && b.date >= today), ...outside.filter(o => o.status === "Upcoming")].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.8rem", fontWeight: 400, color: ink, marginBottom: 4 }}>Good morning, {profile.name.split(" ")[0]} 👋</h2>
          <p style={{ color: muted, fontSize: 13.5, marginBottom: 24 }}>Here's your event overview</p>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
            {[
              { label: "Total Gigs", value: profile.events + "+", sub: "all time" },
              { label: "Total Earned", value: fmt(totalRevenue), sub: "collected" },
              { label: "Rating", value: `${profile.rating} ★`, sub: `${profile.reviewCount} reviews` },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink, fontFamily: font }}>{s.value}</div>
                <div style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "rgba(155,116,80,0.6)", marginTop: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Today's gigs */}
          {todayGigs.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 18, border: `1.5px solid rgba(34,197,94,0.3)`, boxShadow: "0 2px 10px rgba(34,197,94,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Today's Gigs</div>
              {todayGigs.map((g, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{g.client}</div>
                    <div style={{ fontSize: 12, color: muted }}>{g.event} · {g.venue || "—"}</div>
                  </div>
                  <span style={{ background: "rgba(34,197,94,0.1)", color: "#16A34A", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>Today</span>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Upcoming Confirmed</div>
            {upcoming.length === 0 && <p style={{ fontSize: 13, color: muted }}>No upcoming confirmed gigs.</p>}
            {upcoming.map((g, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: i > 0 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{g.client}</div>
                  <div style={{ fontSize: 12, color: muted }}>{g.event}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: gold }}>{g.date}</div>
                  <div style={{ fontSize: 11.5, color: muted }}>{g.budget || fmt(g.amount)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 18 }}>
            {[
              { label: "View Public Profile", icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", action: () => nav(`/vendor/demo?type=${sType}`), accent: gold },
              { label: "Share Profile", icon: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13", action: () => { navigator.clipboard.writeText(`${window.location.origin}/vendor/demo?type=${sType}`).catch(()=>{}); setProfileCopied(true); setTimeout(()=>setProfileCopied(false), 2500); }, accent: "#16A34A" },
              { label: "Create Invoice", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6", action: () => { setInvoiceDraft({ client: "", event: "", date: "", amount: "", notes: "" }); setInvoiceModal(true); }, accent: "#7C3AED" },
              { label: "Edit Profile", icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z", action: () => { setProfDraft({ ...profile }); setProfEdit(true); setTab("profile"); }, accent: muted },
            ].map((a, i) => (
              <button key={i} onClick={a.action} style={{ padding: "12px 14px", borderRadius: 14, background: "#fff", border: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: font, boxShadow: "0 2px 8px rgba(28,10,4,0.04)", textAlign: "left" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${a.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={a.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={a.icon}/></svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: ink }}>{i === 1 && profileCopied ? "✓ Link copied!" : a.label}</span>
              </button>
            ))}
          </div>

          {/* Smart Reminders */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", marginTop: 18, boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>🔔 Smart Reminders</div>
            {[
              { text: `Follow up with ${tendr.filter(b=>b.status==="Pending")[0]?.client || "pending clients"} — request pending for 3 days`, type: "warn" },
              { text: "Send invoice for HDFC Life Insurance event (Confirmed)", type: "warn" },
              { text: "Update availability calendar for October", type: "info" },
              { text: "Reply to 2 unanswered reviews to maintain response rate", type: "info" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderTop: i > 0 ? "1px solid rgba(196,122,46,0.06)" : "none" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.type === "warn" ? "#F59E0B" : gold, marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#4A3020", lineHeight: 1.5 }}>{r.text}</span>
              </div>
            ))}
          </div>

          {/* Conflict Alerts */}
          {(() => {
            const confirmed = tendr.filter(b => b.status === "Confirmed").map(b => b.date);
            const conflicts = tendr.filter(b => b.status === "Pending" && confirmed.includes(b.date));
            return conflicts.length > 0 ? (
              <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 14, padding: "16px 18px", marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>⚡ Conflict Alerts</div>
                {conflicts.map((c, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#B91C1C", marginBottom: 4 }}>
                    <strong>{c.client}</strong> ({c.date}) overlaps with a confirmed booking — review before accepting.
                  </div>
                ))}
              </div>
            ) : null;
          })()}

          {/* Pending requests alert */}
          {pendingTendr > 0 && (
            <div onClick={() => setTab("work")} style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "14px 18px", marginTop: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#DC2626" }}>{pendingTendr} new booking request{pendingTendr > 1 ? "s" : ""} waiting</div>
                <div style={{ fontSize: 12, color: "#EF4444" }}>Tap to review and accept</div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── WORK ──────────────────────────────────────────────────────────────────
    if (tab === "work") {
      return (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Work</h2>
            {workView === "outside" && (
              <button onClick={() => { setOutsideDraft({ client: "", event: "", date: "", amount: "", status: "Upcoming" }); setOutsideModal(true); }} style={{ padding: "9px 18px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                + Log Outside Gig
              </button>
            )}
          </div>
          {/* Sub-nav */}
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {[["tendr", "Tendr Requests"], ["outside", "Direct / Outside"]].map(([k, l]) => (
              <button key={k} onClick={() => setWorkView(k)} style={{ padding: "8px 18px", borderRadius: 100, background: workView === k ? ink : "#fff", color: workView === k ? "#FFF8EC" : muted, border: `1px solid ${workView === k ? ink : "rgba(196,122,46,0.2)"}`, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                {l}{k === "tendr" && pendingTendr > 0 && <Badge count={pendingTendr} />}
              </button>
            ))}
          </div>

          {workView === "tendr" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {tendr.map(b => (
                <div key={b.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: `1.5px solid ${b.status === "Pending" ? "rgba(196,122,46,0.3)" : b.status === "Confirmed" ? "rgba(34,197,94,0.25)" : "rgba(0,0,0,0.08)"}`, boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{b.client}</div>
                      <div style={{ fontSize: 12.5, color: muted }}>{b.event} · {b.date} · {b.venue}</div>
                    </div>
                    <span style={{ background: b.status === "Pending" ? "rgba(196,122,46,0.1)" : b.status === "Confirmed" ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.05)", color: b.status === "Pending" ? gold : b.status === "Confirmed" ? "#16A34A" : muted, borderRadius: 100, padding: "3px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {b.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#4A3020", lineHeight: 1.6, marginBottom: 10 }}>"{b.message}"</p>
                  <div style={{ fontSize: 13, fontWeight: 700, color: gold, marginBottom: b.status === "Pending" ? 14 : 0 }}>Budget: {b.budget}</div>
                  {b.status === "Pending" && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setTendr(p => p.map(x => x.id === b.id ? { ...x, status: "Confirmed" } : x))} style={{ flex: 1, padding: "10px", borderRadius: 100, background: `linear-gradient(135deg, ${gold}, ${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                        ✓ Accept
                      </button>
                      <button onClick={() => setTendr(p => p.map(x => x.id === b.id ? { ...x, status: "Declined" } : x))} style={{ flex: 1, padding: "10px", borderRadius: 100, background: "#fff", color: "#DC2626", border: "1.5px solid #FECACA", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                        ✕ Decline
                      </button>
                    </div>
                  )}
                  {b.status === "Confirmed" && (
                    <button onClick={() => setDispModal(b)} style={{ padding: "8px 16px", borderRadius: 100, background: "none", border: "1px solid #FECACA", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, marginTop: 4 }}>
                      ⚑ Dispute / Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {workView === "outside" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {outsideGigs.map(o => (
                <div key={o.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{o.client}</div>
                      <div style={{ fontSize: 12.5, color: muted }}>{o.event} · {o.date}</div>
                    </div>
                    <span style={{ background: o.status === "Completed" ? "rgba(34,197,94,0.1)" : "rgba(196,122,46,0.1)", color: o.status === "Completed" ? "#16A34A" : gold, borderRadius: 100, padding: "3px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{o.status}</span>
                  </div>
                  <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
                    <div><div style={{ fontSize: 10, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</div><div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{fmt(o.amount)}</div></div>
                    <div><div style={{ fontSize: 10, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Collected</div><div style={{ fontSize: 14, fontWeight: 700, color: "#16A34A" }}>{fmt(o.paidAmount || o.amount)}</div></div>
                    {(o.paidAmount || 0) < o.amount && <div><div style={{ fontSize: 10, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Pending</div><div style={{ fontSize: 14, fontWeight: 700, color: "#DC2626" }}>{fmt(o.amount - (o.paidAmount || 0))}</div></div>}
                  </div>
                </div>
              ))}
              {outsideGigs.length === 0 && <p style={{ fontSize: 13, color: muted, textAlign: "center", padding: "24px 0" }}>No outside gigs logged yet. Tap "+ Log Outside Gig" to add one.</p>}
            </div>
          )}

          {/* Add outside gig modal */}
          {outsideModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(28,10,4,0.25)" }}>
                <h3 style={{ fontFamily: serif, fontSize: "1.3rem", fontWeight: 500, color: ink, marginBottom: 20 }}>Log Outside Gig</h3>
                {[["client","Client Name","text"],["event","Event Type","text"],["date","Date","date"],["amount","Amount (₹)","number"]].map(([k,l,t]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{l}</label>
                    <input type={t} value={outsideDraft[k] || ""} onChange={e => setOutsideDraft(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Status</label>
                  <select value={outsideDraft.status} onChange={e => setOutsideDraft(p => ({ ...p, status: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream }}>
                    {["Upcoming", "Completed"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setOutsideGigs(p => [{ ...outsideDraft, id: `OUT${Date.now()}`, amount: Number(outsideDraft.amount), paidAmount: outsideDraft.status === "Completed" ? Number(outsideDraft.amount) : 0, expenses: [] }, ...p]); setOutsideModal(false); }} style={{ flex: 1, padding: "12px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Save Gig</button>
                  <button onClick={() => setOutsideModal(false)} style={{ padding: "12px 20px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 14, cursor: "pointer", fontFamily: font }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── MONEY ─────────────────────────────────────────────────────────────────
    if (tab === "money") {
      const totalRevenue = MONTHLY.reduce((s, m) => s + m.revenue, 0);
      const totalExpenses = MONTHLY.reduce((s, m) => s + m.expenses, 0);
      const totalProfit = totalRevenue - totalExpenses;
      const maxBar = Math.max(...MONTHLY.map(m => m.revenue));
      const curMonth = MONTHLY[MONTHLY.length - 1];

      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 18 }}>Money</h2>
          {/* Toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {[["pl", "P & L"], ["stats", "Stats"]].map(([k, l]) => (
              <button key={k} onClick={() => setMoneyView(k)} style={{ padding: "8px 18px", borderRadius: 100, background: moneyView === k ? ink : "#fff", color: moneyView === k ? "#FFF8EC" : muted, border: `1px solid ${moneyView === k ? ink : "rgba(196,122,46,0.2)"}`, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                {l}
              </button>
            ))}
          </div>

          {moneyView === "pl" && (
            <>
              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
                {[
                  { label: "Total Revenue", value: fmt(totalRevenue), color: gold },
                  { label: "Total Expenses", value: fmt(totalExpenses), color: "#DC2626" },
                  { label: "Net Profit", value: fmt(totalProfit), color: "#16A34A" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: font }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>Monthly Revenue (Mar–Sep 2026)</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
                  {MONTHLY.map((m, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ width: "100%", height: Math.round((m.revenue / maxBar) * 100) + "px", background: i === MONTHLY.length - 1 ? `linear-gradient(180deg, ${goldLt}, ${gold})` : `linear-gradient(180deg, rgba(196,122,46,0.5), rgba(196,122,46,0.25))`, borderRadius: "4px 4px 0 0", minHeight: 4 }} />
                      <div style={{ fontSize: 10, color: muted, fontWeight: 600 }}>{m.month}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly breakdown */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "0 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                {MONTHLY.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < MONTHLY.length - 1 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: ink, width: 40 }}>{m.month}</div>
                    <div style={{ fontSize: 13, color: gold, fontWeight: 700 }}>+{fmt(m.revenue)}</div>
                    <div style={{ fontSize: 13, color: "#DC2626", fontWeight: 600 }}>−{fmt(m.expenses)}</div>
                    <div style={{ fontSize: 13, color: "#16A34A", fontWeight: 800 }}>{fmt(m.revenue - m.expenses)}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {moneyView === "stats" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { label: "Gigs This Month", value: "4" },
                  { label: "Avg per Gig", value: fmt(Math.round(curMonth.revenue / 4)) },
                  { label: "Highest Month", value: "Aug 2026" },
                  { label: "YTD Profit", value: fmt(totalProfit) },
                  { label: "Expense Ratio", value: Math.round((totalExpenses / totalRevenue) * 100) + "%" },
                  { label: "Repeat Clients", value: "62%" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: ink, fontFamily: font }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    // ── PACKAGES ──────────────────────────────────────────────────────────────
    if (tab === "packages") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Packages</h2>
            <button onClick={() => { setPkgDraft({ name: "", price: "", unit: "per event", icon: "🥈", items: "" }); setPkgModal("new"); }} style={{ padding: "10px 20px", borderRadius: 100, background: `linear-gradient(135deg, ${gold}, ${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              + New Package
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pkgs.map(pkg => (
              <div key={pkg.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.12)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: 20, marginRight: 8 }}>{pkg.icon}</span>
                    <span style={{ fontSize: 16, fontFamily: serif, fontWeight: 500, color: ink }}>{pkg.name}</span>
                    {pkg.badge && <span style={{ background: gold, color: "#fff", borderRadius: 100, padding: "2px 10px", fontSize: 10, fontWeight: 800, marginLeft: 8 }}>{pkg.badge}</span>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: gold, fontFamily: font }}>{fmt(pkg.price)}</div>
                    <div style={{ fontSize: 11.5, color: muted }}>{pkg.unit}</div>
                  </div>
                </div>
                <ul style={{ margin: "12px 0 14px 20px", padding: 0 }}>
                  {pkg.items.split("\n").filter(Boolean).map((item, i) => <li key={i} style={{ fontSize: 13, color: "#4A3020", marginBottom: 4 }}>{item}</li>)}
                </ul>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setPkgDraft({ ...pkg }); setPkgModal(pkg); }} style={{ padding: "7px 16px", borderRadius: 100, background: cream, border: "1px solid rgba(196,122,46,0.15)", color: muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit</button>
                  <button onClick={() => { const np = pkgs.filter(x => x.id !== pkg.id); setPkgs(np); syncToApi(profile, np, setlist); }} style={{ padding: "7px 16px", borderRadius: 100, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Package modal */}
          {pkgModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(28,10,4,0.25)" }}>
                <h3 style={{ fontFamily: serif, fontSize: "1.3rem", fontWeight: 500, color: ink, marginBottom: 20 }}>{pkgModal === "new" ? "New Package" : "Edit Package"}</h3>
                {[
                  ["name", "Package Name", "text"],
                  ["price", "Price (₹)", "number"],
                  ["unit", "Unit (e.g. per event)", "text"],
                  ["icon", "Icon (emoji)", "text"],
                ].map(([key, label, type]) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={pkgDraft[key] || ""} onChange={e => setPkgDraft(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Inclusions (one per line)</label>
                  <textarea value={pkgDraft.items || ""} onChange={e => setPkgDraft(p => ({ ...p, items: e.target.value }))} rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => {
                    let newPkgs;
                    if (pkgModal === "new") newPkgs = [...pkgs, { ...pkgDraft, id: Date.now(), price: Number(pkgDraft.price) }];
                    else newPkgs = pkgs.map(x => x.id === pkgModal.id ? { ...pkgDraft, id: pkgModal.id, price: Number(pkgDraft.price) } : x);
                    setPkgs(newPkgs);
                    setPkgModal(null);
                    syncToApi(profile, newPkgs, setlist);
                  }} style={{ flex: 1, padding: "12px", borderRadius: 100, background: `linear-gradient(135deg, ${gold}, ${goldLt})`, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Save Package</button>
                  <button onClick={() => setPkgModal(null)} style={{ padding: "12px 20px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── REVIEWS ───────────────────────────────────────────────────────────────
    if (tab === "reviews") {
      const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 20 }}>Reviews</h2>

          {/* Summary */}
          <div style={{ background: ink, borderRadius: 20, padding: "22px 26px", marginBottom: 22, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: serif, fontSize: "3rem", fontWeight: 400, color: goldLt, lineHeight: 1 }}>{avg}</div>
              <Stars r={Number(avg)} size={15} />
              <div style={{ fontSize: 12, color: "rgba(255,248,236,0.45)", marginTop: 5 }}>{reviews.length} reviews</div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              {[5,4,3,2,1].map(n => {
                const cnt = reviews.filter(r => r.rating === n).length;
                const pct = Math.round((cnt / reviews.length) * 100);
                return (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,248,236,0.5)", width: 8 }}>{n}</span>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill={goldLt}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 100 }}>
                      <div style={{ width: pct + "%", height: "100%", background: goldLt, borderRadius: 100 }} />
                    </div>
                    <span style={{ fontSize: 10.5, color: "rgba(255,248,236,0.3)", width: 24 }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{r.name}</div>
                    <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{r.event}</div>
                  </div>
                  <Stars r={r.rating} />
                </div>
                <p style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.7, marginBottom: r.response || !r._editing ? 10 : 0 }}>"{r.text}"</p>

                {r.response && (
                  <div style={{ padding: "12px 14px", background: cream, borderRadius: 10, display: "flex", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: gold, marginBottom: 3 }}>Your Response</div>
                      <p style={{ fontSize: 13, color: "#4A3020", lineHeight: 1.6, margin: 0 }}>{r.response}</p>
                    </div>
                  </div>
                )}

                {!r.response && (
                  <div>
                    {r._editing ? (
                      <div>
                        <textarea
                          value={replyDraft[r.id] || ""}
                          onChange={e => setReplyDraft(p => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="Write a response..."
                          rows={3}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical", boxSizing: "border-box", marginBottom: 8 }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => {
                            if (!replyDraft[r.id]?.trim()) return;
                            setReviews(prev => prev.map(x => x.id === r.id ? { ...x, response: replyDraft[r.id], _editing: false } : x));
                          }} style={{ padding: "8px 18px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Post Response</button>
                          <button onClick={() => setReviews(prev => prev.map(x => x.id === r.id ? { ...x, _editing: false } : x))} style={{ padding: "8px 16px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setReviews(prev => prev.map(x => x.id === r.id ? { ...x, _editing: true } : x))} style={{ padding: "7px 16px", borderRadius: 100, background: cream, border: "1px solid rgba(196,122,46,0.15)", color: muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                        Reply to this review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── SETLIST / INVENTORY ────────────────────────────────────────────────────
    if (tab === "inventory") {
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 6 }}>Setlist / Rundown</h2>
          <p style={{ fontSize: 13, color: muted, marginBottom: 22 }}>Your standard show segments — drag to reorder, add or remove as needed.</p>

          <div style={{ background: "#fff", borderRadius: 16, padding: "6px 20px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 16 }}>
            {setlist.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: i < setlist.length - 1 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: cream, border: `1px solid rgba(196,122,46,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: gold, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 14, color: ink }}>{item}</span>
                <button onClick={() => { const nl = setlist.filter((_, j) => j !== i); setSetlist(nl); syncToApi(profile, pkgs, nl); }} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 16, padding: "4px", lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newItem.trim()) { const nl = [...setlist, newItem.trim()]; setSetlist(nl); setNewItem(""); syncToApi(profile, pkgs, nl); } }} placeholder="Add new segment..." style={{ flex: 1, padding: "10px 16px", borderRadius: 100, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13.5, fontFamily: font, color: ink, background: "#fff" }} />
            <button onClick={() => { if (newItem.trim()) { const nl = [...setlist, newItem.trim()]; setSetlist(nl); setNewItem(""); syncToApi(profile, pkgs, nl); } }} style={{ padding: "10px 22px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Add</button>
          </div>
        </div>
      );
    }

    // ── PROFILE ───────────────────────────────────────────────────────────────
    if (tab === "profile") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Profile</h2>
            {!profEdit ? (
              <button onClick={() => { setProfDraft({ ...profile }); setProfEdit(true); }} style={{ padding: "10px 20px", borderRadius: 100, background: cream, border: "1px solid rgba(196,122,46,0.2)", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit Profile</button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setProfile(profDraft); setProfEdit(false); syncToApi(profDraft, pkgs, setlist); }} style={{ padding: "10px 20px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Save</button>
                <button onClick={() => setProfEdit(false)} style={{ padding: "10px 16px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 13, cursor: "pointer", fontFamily: font }}>Cancel</button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontFamily: serif, color: "#fff" }}>{profile.name[0]}</div>
            <div>
              <div style={{ fontSize: 18, fontFamily: serif, fontWeight: 500, color: ink }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: muted }}>{profile.type} · {profile.city}</div>
              <Stars r={profile.rating} /> <span style={{ fontSize: 12, color: muted, marginLeft: 4 }}>{profile.rating} ({profile.reviewCount} reviews)</span>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Basic Info</div>
            {[["name","Name"],["phone","Phone"],["email","Email"],["city","City"]].map(([k, l]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>{l}</label>
                {profEdit ? (
                  <input value={profDraft[k] || ""} onChange={e => setProfDraft(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
                ) : (
                  <div style={{ fontSize: 14, color: ink, padding: "9px 0" }}>{profile[k]}</div>
                )}
              </div>
            ))}
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>Bio</label>
              {profEdit ? (
                <textarea value={profDraft.bio || ""} onChange={e => setProfDraft(p => ({ ...p, bio: e.target.value }))} rows={4} style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical", boxSizing: "border-box" }} />
              ) : (
                <div style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.7 }}>{profile.bio}</div>
              )}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>GST & Business</div>
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>GST Number</label>
              {profEdit ? (
                <input value={profDraft.gstNumber || ""} onChange={e => setProfDraft(p => ({ ...p, gstNumber: e.target.value }))} placeholder="e.g. 07AABKU1234R1Z5" style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
              ) : (
                <div style={{ fontSize: 14, color: ink, padding: "9px 0", fontFamily: "monospace" }}>{profile.gstNumber || <span style={{ color: muted, fontStyle: "italic" }}>Not set</span>}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ── PERFORMANCE / GIG PROFILE ─────────────────────────────────────────────
    if (tab === "gig") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Performance Profile</h2>
            <button onClick={() => { const newGenres = gigDraft.genres.split(",").map(g => g.trim()).filter(Boolean); const newProf = { ...profile, genres: newGenres, showreel: gigDraft.showreel, instagram: gigDraft.instagram, youtube: gigDraft.youtube, setlist: gigDraft.setlist }; setProfile(newProf); setGigSaved(true); setTimeout(() => setGigSaved(false), 2000); syncToApi(newProf, pkgs, setlist); }} style={{ padding: "10px 20px", borderRadius: 100, background: gigSaved ? "#16A34A" : `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "background 0.2s" }}>
              {gigSaved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>

          {[
            ["genres", "Genres / Styles (comma-separated)", "input", "Bollywood, Corporate Hosting, Comedy Roast..."],
            ["showreel", "Showreel URL", "input", "https://youtube.com/watch?v=..."],
            ["instagram", "Instagram Handle", "input", "@yourhandle"],
            ["youtube", "YouTube Channel", "input", "youtube.com/@yourchannel"],
          ].map(([key, label, type, ph]) => (
            <div key={key} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>{label}</label>
              <input value={gigDraft[key] || ""} onChange={e => setGigDraft(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.15)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
            </div>
          ))}

          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Sample Set / Rundown (one segment per line)</label>
            <textarea value={gigDraft.setlist || ""} onChange={e => setGigDraft(p => ({ ...p, setlist: e.target.value }))} rows={7} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.15)", fontSize: 13.5, fontFamily: font, color: ink, background: cream, resize: "vertical", boxSizing: "border-box" }} />
          </div>
        </div>
      );
    }

    // ── CALENDAR ──────────────────────────────────────────────────────────────
    if (tab === "calendar") {
      const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
      const daysInMonth = new Date(calYear, calMonth, 0).getDate();
      const cells = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
      while (cells.length % 7 !== 0) cells.push(null);
      const todayStr = new Date().toISOString().slice(0, 10);
      // Confirmed bookings from tendr
      const confirmedDates = new Set(tendr.filter(b => b.status === "Confirmed").map(b => b.date));
      const blockedSet = new Set(blockedDates);
      const monthName = new Date(calYear, calMonth - 1, 1).toLocaleString("default", { month: "long" });

      const prevMonth = () => { if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
      const nextMonth = () => { if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };
      const toggleBlocked = (dateStr) => {
        if (confirmedDates.has(dateStr)) return; // can't unblock a confirmed booking
        setBlockedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
      };

      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Availability</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={prevMonth} style={{ background: cream, border: "1px solid rgba(196,122,46,0.2)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: muted }}>‹</button>
              <span style={{ fontSize: 14, fontWeight: 600, color: ink, minWidth: 120, textAlign: "center" }}>{monthName} {calYear}</span>
              <button onClick={nextMonth} style={{ background: cream, border: "1px solid rgba(196,122,46,0.2)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: muted }}>›</button>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: muted, marginBottom: 18 }}>Tap any available date to mark it as blocked/unavailable. Confirmed bookings are locked.</p>

          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: muted, padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateStr = `${calYear}-${String(calMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const isConfirmed = confirmedDates.has(dateStr);
                const isBlocked   = blockedSet.has(dateStr);
                const isToday     = dateStr === todayStr;
                const bg = isConfirmed ? `linear-gradient(135deg,${gold},${goldLt})` : isBlocked ? "rgba(220,38,38,0.12)" : isToday ? cream : "transparent";
                const color = isConfirmed ? "#fff" : isBlocked ? "#DC2626" : ink;
                const border = isToday && !isConfirmed && !isBlocked ? `1.5px solid ${gold}` : isBlocked ? "1.5px solid rgba(220,38,38,0.3)" : "none";
                return (
                  <div key={i} onClick={() => toggleBlocked(dateStr)} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: bg, color, fontSize: 13, fontWeight: isConfirmed || isToday || isBlocked ? 700 : 400, border, cursor: isConfirmed ? "default" : "pointer", userSelect: "none" }}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { bg: `linear-gradient(135deg,${gold},${goldLt})`, label: "Booked (confirmed)" },
              { bg: "rgba(220,38,38,0.12)", border: "1.5px solid rgba(220,38,38,0.3)", color: "#DC2626", label: "Blocked (unavailable)" },
              { bg: cream, border: `1.5px solid ${gold}`, label: "Today" },
              { bg: "#F3F4F6", label: "Available" },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: muted }}>
                <div style={{ width: 13, height: 13, borderRadius: 3, background: l.bg, border: l.border || "none", flexShrink: 0 }} />
                {l.label}
              </div>
            ))}
          </div>

          {confirmedDates.size > 0 && (
            <div style={{ marginTop: 18, background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(196,122,46,0.1)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Confirmed Bookings This Month</div>
              {tendr.filter(b => b.status === "Confirmed" && b.date.startsWith(`${calYear}-${String(calMonth).padStart(2,"0")}`)).map(b => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(196,122,46,0.06)" }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: ink }}>{b.client}</div>
                    <div style={{ fontSize: 12, color: muted }}>{b.event}</div>
                  </div>
                  <div style={{ fontSize: 12, color: gold, fontWeight: 600 }}>{b.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ── MARKET / GROW ─────────────────────────────────────────────────────────
    if (tab === "market") {
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 22 }}>Grow</h2>

          {/* Flyer builder */}
          <div style={{ background: ink, borderRadius: 20, padding: "24px 26px", marginBottom: 18, display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(204,171,74,0.12)", border: "1px solid rgba(204,171,74,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={goldLt} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: serif, fontSize: "1.15rem", fontWeight: 500, color: "#FFF8EC", marginBottom: 4 }}>Flyer Builder</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,248,236,0.45)", marginBottom: 12 }}>Create branded promo flyers for Instagram, WhatsApp, and print in seconds.</div>
              <button onClick={() => nav('/vendor/flyer-builder')} style={{ padding: "9px 20px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Open Builder →</button>
            </div>
          </div>

          {/* Link Hub */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px 26px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Link Hub</div>
              <button onClick={() => setLinkHubPreview(true)} style={{ padding: "7px 16px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share
              </button>
            </div>
            <div style={{ background: cream, borderRadius: 12, padding: "12px 16px", fontSize: 13, color: gold, fontFamily: "monospace", marginBottom: 12, wordBreak: "break-all" }}>
              tendr.in/@{(profile.name || "vendor").toLowerCase().replace(/\s+/g, "")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Book Me", url: `tendr.in/book/${(profile.name || "vendor").toLowerCase().replace(/\s+/g, "")}` },
                { label: "View Portfolio", url: `tendr.in/vendor/demo?type=${sType}` },
                { label: "Instagram", url: profile.instagram ? profile.instagram.replace("@", "instagram.com/") : "instagram.com/" },
                { label: "YouTube", url: profile.youtube || "youtube.com/" },
              ].map((link, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: cream, borderRadius: 10, border: "1px solid rgba(196,122,46,0.1)" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: ink }}>{link.label}</span>
                  <span style={{ fontSize: 11.5, color: muted, fontFamily: "monospace", maxWidth: "55%", textAlign: "right", wordBreak: "break-all" }}>{link.url}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics preview */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Profile Views (last 30 days)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[{ label: "Profile Views", value: "1,247" }, { label: "Link Clicks", value: "389" }, { label: "Booking Leads", value: "23" }].map((s, i) => (
                <div key={i} style={{ textAlign: "center", padding: "14px", background: cream, borderRadius: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: ink, fontFamily: font }}>{s.value}</div>
                  <div style={{ fontSize: 10.5, color: muted, fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (tab === "contract") {
      return (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Contracts</h2>
            <button onClick={() => { setContractDraft({ client: "", event: "", date: "", amount: "", terms: "50% advance before event. Balance due on completion. Cancellation within 7 days: full advance forfeited." }); setContractModal(true); }} style={{ padding: "9px 18px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>+ New Contract</button>
          </div>

          {contracts.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 20, padding: "40px 24px", textAlign: "center", border: "1px solid rgba(196,122,46,0.1)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
              <p style={{ fontSize: 14, color: muted, marginBottom: 18 }}>No contracts yet. Create one to protect yourself legally and set clear expectations.</p>
              <button onClick={() => { setContractDraft({ client: "", event: "", date: "", amount: "", terms: "50% advance before event. Balance due on completion. Cancellation within 7 days: full advance forfeited." }); setContractModal(true); }} style={{ padding: "11px 24px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Create Contract</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {contracts.map((c, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{c.client}</div>
                      <div style={{ fontSize: 12.5, color: muted }}>{c.event} · {c.date}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: ink }}>{fmt(c.amount)}</div>
                      <span style={{ background: c.signed ? "rgba(34,197,94,0.1)" : "rgba(196,122,46,0.1)", color: c.signed ? "#16A34A" : gold, borderRadius: 100, padding: "3px 12px", fontSize: 11, fontWeight: 700, display: "inline-block", marginTop: 4 }}>{c.signed ? "Signed" : "Draft"}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: muted, lineHeight: 1.6, borderTop: "1px solid rgba(196,122,46,0.07)", paddingTop: 10, marginBottom: 10, fontStyle: "italic" }}>{c.terms}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setContracts(p => p.map((x, j) => j === i ? { ...x, signed: !x.signed } : x))} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 100, border: `1px solid ${c.signed ? "rgba(34,197,94,0.3)" : "rgba(196,122,46,0.25)"}`, background: "transparent", color: c.signed ? "#16A34A" : gold, cursor: "pointer", fontFamily: font, fontWeight: 600 }}>{c.signed ? "Mark Unsigned" : "Mark Signed"}</button>
                    <button onClick={() => { const txt = `CONTRACT\nClient: ${c.client}\nEvent: ${c.event}\nDate: ${c.date}\nAmount: ${fmt(c.amount)}\n\nTERMS:\n${c.terms}\n\nStatus: ${c.signed ? "Signed" : "Draft"}`; navigator.clipboard.writeText(txt); }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 100, border: "1px solid rgba(196,122,46,0.15)", background: "transparent", color: muted, cursor: "pointer", fontFamily: font }}>Copy Text</button>
                    <button onClick={() => { const wa = `CONTRACT%0AClient%3A%20${encodeURIComponent(c.client)}%0AEvent%3A%20${encodeURIComponent(c.event)}%0ADate%3A%20${c.date}%0AAmount%3A%20${encodeURIComponent(fmt(c.amount))}%0A%0ATerms%3A%20${encodeURIComponent(c.terms)}`; window.open(`https://wa.me/?text=${wa}`); }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 100, border: "none", background: "rgba(37,211,102,0.08)", color: "#25D366", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>Send via WA</button>
                    <button onClick={() => setContracts(p => p.filter((_, j) => j !== i))} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 100, border: "none", background: "rgba(220,38,38,0.06)", color: "#DC2626", cursor: "pointer", fontFamily: font }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (tab === "invoice") {
      const totalEarned = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + Number(i.amount), 0);
      const totalPending = invoices.filter(i => i.status !== "Paid").reduce((s, i) => s + Number(i.amount), 0);
      return (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Invoices</h2>
            <button onClick={() => { setInvoiceDraft({ client: "", event: "", date: "", amount: "", notes: "" }); setInvoiceModal(true); }} style={{ padding: "9px 18px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>+ New Invoice</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 22 }}>
            {[{ label: "Total Earned", value: fmt(totalEarned), color: "#16A34A" }, { label: "Pending", value: fmt(totalPending), color: gold }, { label: "Invoices Sent", value: invoices.length, color: ink }].map((s, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px", border: "1px solid rgba(196,122,46,0.1)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: font }}>{s.value}</div>
              </div>
            ))}
          </div>

          {invoices.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 20, padding: "40px 24px", textAlign: "center", border: "1px solid rgba(196,122,46,0.1)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🧾</div>
              <p style={{ fontSize: 14, color: muted, marginBottom: 18 }}>No invoices yet. Create your first invoice to get paid professionally.</p>
              <button onClick={() => { setInvoiceDraft({ client: "", event: "", date: "", amount: "", notes: "" }); setInvoiceModal(true); }} style={{ padding: "11px 24px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Create Invoice</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {invoices.map((inv, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{inv.client}</div>
                      <div style={{ fontSize: 12.5, color: muted }}>{inv.event} · {inv.date}</div>
                      {inv.notes && <div style={{ fontSize: 12, color: muted, marginTop: 4, fontStyle: "italic" }}>{inv.notes}</div>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: ink }}>{fmt(inv.amount)}</div>
                      <span style={{ background: inv.status === "Paid" ? "rgba(34,197,94,0.1)" : "rgba(196,122,46,0.1)", color: inv.status === "Paid" ? "#16A34A" : gold, borderRadius: 100, padding: "3px 12px", fontSize: 11, fontWeight: 700, display: "inline-block", marginTop: 4 }}>{inv.status || "Sent"}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={() => setInvoices(p => p.map((x, j) => j === i ? { ...x, status: x.status === "Paid" ? "Sent" : "Paid" } : x))} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 100, border: `1px solid ${inv.status === "Paid" ? "rgba(34,197,94,0.3)" : "rgba(196,122,46,0.25)"}`, background: "transparent", color: inv.status === "Paid" ? "#16A34A" : gold, cursor: "pointer", fontFamily: font, fontWeight: 600 }}>{inv.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}</button>
                    <button onClick={() => { const txt = `INVOICE\nClient: ${inv.client}\nEvent: ${inv.event}\nDate: ${inv.date}\nAmount: ${fmt(inv.amount)}\nNotes: ${inv.notes || "-"}\nStatus: ${inv.status || "Sent"}`; navigator.clipboard.writeText(txt); }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 100, border: "1px solid rgba(196,122,46,0.15)", background: "transparent", color: muted, cursor: "pointer", fontFamily: font }}>Copy</button>
                    <button onClick={() => setInvoices(p => p.filter((_, j) => j !== i))} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 100, border: "none", background: "rgba(220,38,38,0.06)", color: "#DC2626", cursor: "pointer", fontFamily: font }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  })();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: cream, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus { outline: 2px solid ${gold}; outline-offset: 1px; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(196,122,46,0.25); border-radius: 100px; }
        .dash-sidebar { position: sticky; top: 0; height: 100vh; }
        @media (max-width: 768px) {
          .dash-sidebar { position: fixed !important; left: 0; top: 0; height: 100vh; z-index: 300; transform: translateX(-100%); transition: transform 0.25s ease; }
          .dash-sidebar.open { transform: translateX(0); }
          .dash-mobile-topbar { display: flex !important; }
          .sidebar-close-btn { display: flex !important; }
          .dash-main { padding: 16px 16px 80px !important; }
        }
      `}</style>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.55)", zIndex: 299, backdropFilter: "blur(2px)" }} />
      )}

      {/* Sidebar */}
      <div className={`dash-sidebar${sidebarOpen ? " open" : ""}`}>
        <Sidebar />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="dash-mobile-topbar" style={{ display: "none", background: ink, padding: "13px 18px", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 100, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: goldLt, cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontFamily: serif, fontSize: "1.3rem", color: goldLt, flex: 1 }}>tendr</span>
          <button onClick={() => nav(`/vendor/demo?type=${sType}`)} style={{ background: `linear-gradient(135deg,${gold},${goldLt})`, border: "none", color: "#fff", fontSize: 11.5, fontWeight: 700, borderRadius: 100, padding: "6px 14px", cursor: "pointer", fontFamily: font }}>View Profile</button>
        </div>

        <div className="dash-main" style={{ flex: 1, overflowY: "auto", padding: "32px 28px" }}>
          {/* Demo notice */}
          <div style={{ background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 12, padding: "10px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: gold, fontWeight: 600, flexWrap: "wrap" }}>
            <span>🎭</span>
            <span style={{ flex: 1 }}>Demo mode — explore freely. <strong>Changes you make are saved</strong> and survive refresh.</span>
            <button onClick={() => nav(`/vendor/demo?type=${sType}`)} style={{ background: "none", border: "none", color: gold, fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontFamily: font, whiteSpace: "nowrap" }}>View Public Profile →</button>
          </div>

          {content}
        </div>
      </div>

      {/* Contract modal */}
      {contractModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(28,10,4,0.25)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontFamily: serif, fontSize: "1.3rem", fontWeight: 500, color: ink, marginBottom: 20 }}>New Contract</h3>
            {[["client","Client Name","text"],["event","Event / Service","text"],["date","Event Date","date"],["amount","Contract Amount (₹)","number"]].map(([k,l,t]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{l}</label>
                <input type={t} value={contractDraft[k] || ""} onChange={e => setContractDraft(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Terms & Conditions</label>
              <textarea rows={5} value={contractDraft.terms || ""} onChange={e => setContractDraft(p => ({ ...p, terms: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { if (!contractDraft.client || !contractDraft.amount) return; setContracts(p => [{ ...contractDraft, id: `CTR${Date.now()}`, amount: Number(contractDraft.amount), signed: false }, ...p]); setContractModal(false); setTab("contract"); }} style={{ flex: 1, padding: "12px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Create Contract</button>
              <button onClick={() => setContractModal(false)} style={{ padding: "12px 20px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 14, cursor: "pointer", fontFamily: font }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice modal */}
      {invoiceModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(28,10,4,0.25)" }}>
            <h3 style={{ fontFamily: serif, fontSize: "1.3rem", fontWeight: 500, color: ink, marginBottom: 20 }}>New Invoice</h3>
            {[["client","Client Name","text"],["event","Event / Service","text"],["date","Date","date"],["amount","Amount (₹)","number"]].map(([k,l,t]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{l}</label>
                <input type={t} value={invoiceDraft[k] || ""} onChange={e => setInvoiceDraft(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Notes (optional)</label>
              <textarea rows={2} value={invoiceDraft.notes || ""} onChange={e => setInvoiceDraft(p => ({ ...p, notes: e.target.value }))} placeholder="Payment details, terms, etc." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { if (!invoiceDraft.client || !invoiceDraft.amount) return; setInvoices(p => [{ ...invoiceDraft, id: `INV${Date.now()}`, amount: Number(invoiceDraft.amount), status: "Sent" }, ...p]); setInvoiceModal(false); setTab("invoice"); }} style={{ flex: 1, padding: "12px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Create Invoice</button>
              <button onClick={() => setInvoiceModal(false)} style={{ padding: "12px 20px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 14, cursor: "pointer", fontFamily: font }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Link Hub Share Preview */}
      {linkHubPreview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setLinkHubPreview(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 360, boxShadow: "0 24px 80px rgba(28,10,4,0.3)" }}>
            {/* Slip header */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: serif, fontSize: "1.6rem", color: gold, marginBottom: 2 }}>tendr</div>
              <div style={{ fontSize: 12, color: muted, letterSpacing: "0.06em" }}>YOUR LINK HUB</div>
            </div>
            {/* Profile row */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 10 }}>
                {(profile.name || sType)[0]}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: ink }}>{profile.name || sType}</div>
              <div style={{ fontSize: 12.5, color: muted }}>{profile.type || sType} · {profile.city || "India"}</div>
              <div style={{ fontSize: 12, color: gold, marginTop: 4, fontFamily: "monospace" }}>tendr.in/@{(profile.name || "vendor").toLowerCase().replace(/\s+/g, "")}</div>
            </div>
            {/* Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {[
                { label: "📅 Book Me", url: `tendr.in/book/${(profile.name || "vendor").toLowerCase().replace(/\s+/g, "")}`, primary: true },
                { label: "🖼️ View Portfolio", url: `tendr.in/vendor/demo?type=${sType}`, primary: false },
                { label: "📸 Instagram", url: profile.instagram ? profile.instagram.replace("@", "instagram.com/") : "instagram.com/", primary: false },
                { label: "▶️ YouTube", url: profile.youtube || "youtube.com/", primary: false },
              ].map((l, i) => (
                <div key={i} style={{ padding: "12px 16px", borderRadius: 12, background: l.primary ? `linear-gradient(135deg,${gold},${goldLt})` : cream, border: l.primary ? "none" : "1px solid rgba(196,122,46,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: l.primary ? "#fff" : ink }}>{l.label}</span>
                  <span style={{ fontSize: 10.5, color: l.primary ? "rgba(255,255,255,0.75)" : muted, fontFamily: "monospace" }}>{l.url}</span>
                </div>
              ))}
            </div>
            {/* Share buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { navigator.clipboard.writeText(`Check out my tendr link hub: tendr.in/@${(profile.name || "vendor").toLowerCase().replace(/\s+/g, "")}`); }} style={{ flex: 1, padding: "11px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Copy Link</button>
              <button onClick={() => { window.open(`https://wa.me/?text=Check%20out%20my%20tendr%20profile%3A%20tendr.in%2F%40${(profile.name || "vendor").toLowerCase().replace(/\s+/g, "")}`); }} style={{ flex: 1, padding: "11px", borderRadius: 100, background: "#25D366", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>WhatsApp</button>
              <button onClick={() => setLinkHubPreview(false)} style={{ padding: "11px 16px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 13, cursor: "pointer", fontFamily: font }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute modal */}
      {dispModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(28,10,4,0.25)" }}>
            <h3 style={{ fontFamily: serif, fontSize: "1.3rem", fontWeight: 500, color: ink, marginBottom: 8 }}>Dispute / Cancel</h3>
            <p style={{ fontSize: 13, color: muted, marginBottom: 20 }}>{dispModal.client} · {dispModal.event}</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Reason</label>
              <select style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream }}>
                {["Payment issue", "Client unresponsive", "Event cancelled", "Scope changed without agreement", "Other"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Details</label>
              <textarea rows={3} placeholder="Describe the issue..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { window.open(`https://wa.me/919999999999?text=Dispute%20for%20booking%20${dispModal.id}%20-%20${dispModal.client}`); setDispModal(null); }} style={{ flex: 1, padding: "12px", borderRadius: 100, background: "#25D366", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>📲 Send to Support</button>
              <button onClick={() => setDispModal(null)} style={{ padding: "12px 20px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 13, cursor: "pointer", fontFamily: font }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

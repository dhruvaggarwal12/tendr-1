/**
 * Generates pre-populated checklist and day-of-schedule data
 * based on booked event type and confirmed vendors.
 * Written to localStorage so the Checklist and Timeline Builder pages
 * read them immediately on mount.
 */

const TTL_7D = 7 * 24 * 60 * 60 * 1000;

// ── Checklist templates (mirrors Checkbox.jsx TEMPLATES) ─────────────────────
const TEMPLATES = {
  birthday: {
    categories: [
      { name: "Planning & Booking",    items: ["Set date and guest count", "Finalize budget", "Book venue", "Book caterer", "Book photographer", "Book DJ / musician"] },
      { name: "Venue & Decor",         items: ["Confirm venue booking", "Plan seating arrangement", "Finalize decoration theme", "Book balloon / floral decorator", "Arrange photo booth setup", "Confirm lighting and ambience"] },
      { name: "Food & Catering",       items: ["Finalize menu", "Confirm serving style (buffet / live counter)", "Order birthday cake", "Arrange beverages and mocktails", "Confirm serving staff count"] },
      { name: "Photography & Media",   items: ["Share shot list with photographer", "Confirm videographer if needed", "Plan Reels / story content", "Setup backdrop for portraits"] },
      { name: "Entertainment",         items: ["Finalize DJ set and playlist", "Plan games or activities for guests", "Arrange mic and sound system", "Plan surprise moment if any"] },
      { name: "Guests & Invites",      items: ["Create final guest list", "Send WhatsApp invites", "Track RSVPs", "Arrange parking passes if needed"] },
      { name: "Day-of",                items: ["Confirm vendor arrival times", "Do a final venue walkthrough", "Brief all vendor teams", "Enjoy!"] },
    ],
  },
  prewedding: {
    categories: [
      { name: "Planning",              items: ["Fix date and venue", "Finalize guest list", "Set budget", "Book all vendors"] },
      { name: "Venue & Decor",         items: ["Book venue", "Choose theme (floral / festive / modern)", "Finalize draping and lighting", "Arrange entrance decor", "Organize sitting arrangement"] },
      { name: "Catering",              items: ["Finalize menu (North Indian / fusion)", "Arrange welcome drinks", "Confirm live counters", "Arrange mithai and desserts"] },
      { name: "Entertainment & Music", items: ["Book DJ", "Plan sangeet / mehendi performances", "Arrange dhol / live music", "Plan special dance segment"] },
      { name: "Photography & Media",   items: ["Brief photographer on must-have shots", "Pre-wedding shoot (if applicable)", "Arrange candid videographer", "Drone coverage if needed"] },
      { name: "Mehendi & Beauty",      items: ["Book mehendi artist", "Arrange touch-up team for bride", "Setup beauty station if needed"] },
      { name: "Invites & Guests",      items: ["Send e-invites", "WhatsApp wedding group", "RSVP tracking", "Arrange guest pick-up if needed"] },
    ],
  },
  wedding: {
    categories: [
      { name: "Venue & Logistics",     items: ["Final venue walkthrough", "Confirm mandap setup timing", "Arrange parking management", "Brief event coordinator", "Floral and décor final setup"] },
      { name: "Catering",              items: ["Confirm head count with caterer", "Confirm menu", "Arrange cocktail/welcome area", "Confirm number of servers", "Arrange separate kids menu if needed"] },
      { name: "Photography & Media",   items: ["Confirm photographer arrival time", "Brief on ceremony moments", "Drone coverage plan", "Live streaming setup if needed", "Same-day edit arrangements"] },
      { name: "Bridal & Groom Prep",   items: ["Bridal makeup and hair", "Bridal outfit final fitting", "Groom outfit ironing/steaming", "Family outfits coordination"] },
      { name: "Ceremony",              items: ["Pandit / priest confirmed", "Mandap setup complete", "Varmala and pheras sequence", "Ring ceremony if planned"] },
      { name: "Payments & Admin",      items: ["All vendor balance payments ready", "Contracts filed", "Thank-you gifts for family", "Emergency fund in cash"] },
    ],
  },
  corporate: {
    categories: [
      { name: "Planning",              items: ["Fix date, time and venue", "Define agenda and schedule", "Finalize budget", "Identify key stakeholders", "Create communication plan"] },
      { name: "Venue & Setup",         items: ["Book conference hall / banquet", "Arrange AV equipment (projector, mics)", "Stage and podium setup", "Registration desk setup", "Branding and signage placement"] },
      { name: "Catering",              items: ["Corporate breakfast / lunch menu", "Tea and coffee breaks", "Mocktails / welcome drinks", "Special dietary needs", "Confirm catering staff count"] },
      { name: "Speakers & Program",    items: ["Confirm all speakers", "Collect speaker bios and presentations", "Prepare run-of-show document", "MC / emcee briefing", "Award or recognition ceremony prep"] },
      { name: "Guests & Invites",      items: ["Send official invitations", "Track confirmations", "Prepare name badges", "Guest registration process", "VIP seating plan"] },
      { name: "Photography & Media",   items: ["Book event photographer", "Press / media briefing if needed", "Social media live coverage plan", "Post-event photo sharing plan"] },
    ],
  },
  custom: {
    categories: [
      { name: "Planning",   items: ["Set date and budget", "Finalize guest list", "Book key vendors"] },
      { name: "Venue & Decor", items: ["Book venue", "Finalize décor theme"] },
      { name: "Catering",   items: ["Book caterer", "Finalize menu"] },
      { name: "Media",      items: ["Book photographer"] },
      { name: "Guests",     items: ["Send invitations", "Track RSVPs"] },
    ],
  },
};

/** Map event type string to one of our template keys */
export function mapEventTypeToTemplate(eventType = "") {
  const t = eventType.toLowerCase();
  if (t.includes("wedding") && !t.includes("pre")) return "wedding";
  if (t.includes("birthday") || t.includes("bday") || t.includes("party")) return "birthday";
  if (t.includes("pre") || t.includes("engagement") || t.includes("sangeet") || t.includes("mehendi") || t.includes("haldi")) return "prewedding";
  if (t.includes("corporate") || t.includes("conference") || t.includes("seminar") || t.includes("office")) return "corporate";
  return "birthday";
}

/** Write a pre-populated checklist to localStorage based on event type */
export function writeChecklistToStorage(eventType = "") {
  const key = mapEventTypeToTemplate(eventType);
  const tpl = TEMPLATES[key] || TEMPLATES.birthday;
  const now = Date.now();
  const categories = tpl.categories.map((cat, ci) => ({
    id: `cat_${ci}_${now}`,
    name: cat.name,
    items: cat.items.map((text, ii) => ({
      id: `item_${ci}_${ii}_${now}`,
      text,
      done: false,
    })),
  }));
  const data = { templateKey: key, categories, __expiresAt: now + TTL_7D };
  try { localStorage.setItem("tendr_checklist_v2", JSON.stringify(data)); } catch {}
  return key;
}

// ── Day-of schedule generator ────────────────────────────────────────────────

/** Parse a timing string like "5:00 PM – 11:00 PM" → { startH, startM, endH, endM } */
function parseTiming(str = "") {
  const re = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi;
  const matches = [...str.matchAll(re)];
  if (matches.length < 2) return null;
  const toH = (m) => {
    let h = parseInt(m[1]);
    const min = parseInt(m[2] || "0");
    const p = (m[3] || "").toLowerCase();
    if (p === "pm" && h !== 12) h += 12;
    if (p === "am" && h === 12) h = 0;
    return { h, min };
  };
  return { start: toH(matches[0]), end: toH(matches[1]) };
}

function toStr(h, m = 0) {
  return `${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function subMins({ h, min }, totalSubMins) {
  let t = h * 60 + min - totalSubMins;
  if (t < 0) t += 24 * 60;
  return { h: Math.floor(t / 60) % 24, min: t % 60 };
}

function addMins({ h, min }, totalAddMins) {
  let t = h * 60 + min + totalAddMins;
  return { h: Math.floor(t / 60) % 24, min: t % 60 };
}

/** Generate day-of schedule slots from confirmed vendors + optional event timing string */
export function generateDayOfSchedule(confirmedVendors = [], eventTiming = "", extraDayOfSlots = []) {
  const parsed = parseTiming(eventTiming);
  const startTime = parsed?.start ?? { h: 18, min: 0 };
  const endTime   = parsed?.end   ?? { h: 23, min: 0 };

  let id = Date.now();
  const slots = [];

  // Vendor arrival slots (relative to event start)
  confirmedVendors.forEach(v => {
    let arrivalTime = null;
    switch (v.serviceType) {
      case "Decorator":    arrivalTime = subMins(startTime, 180); break; // -3 hrs
      case "Caterer":      arrivalTime = subMins(startTime, 120); break; // -2 hrs
      case "Photographer": arrivalTime = subMins(startTime, 90);  break; // -1.5 hrs
      case "DJ":           arrivalTime = subMins(startTime, 60);  break; // -1 hr
      default:             arrivalTime = subMins(startTime, 60);  break;
    }
    if (arrivalTime) {
      slots.push({
        id: String(id++),
        time: toStr(arrivalTime.h, arrivalTime.min),
        title: `${v.name || v.serviceType} arrives${v.serviceType === "Decorator" ? " for setup" : v.serviceType === "Caterer" ? " for preparation" : v.serviceType === "DJ" ? " for soundcheck" : " for venue shots"}`,
        who: v.name || "",
        done: false,
      });
    }
  });

  // Standard milestones
  const guestsStart   = startTime;
  const eventBegins   = addMins(startTime, 30);
  const peakTime      = addMins(startTime, 90);
  const lastCall      = subMins(endTime, 45);
  const wrapsUp       = endTime;

  slots.push({ id: String(id++), time: toStr(guestsStart.h, guestsStart.min),  title: "Guests start arriving",              who: "", done: false });
  slots.push({ id: String(id++), time: toStr(eventBegins.h, eventBegins.min),  title: "Main event / program begins",        who: "", done: false });
  slots.push({ id: String(id++), time: toStr(peakTime.h, peakTime.min),        title: "Peak celebration time",              who: "", done: false });
  slots.push({ id: String(id++), time: toStr(lastCall.h, lastCall.min),        title: "Last call for food & music",         who: "", done: false });
  slots.push({ id: String(id++), time: toStr(wrapsUp.h, wrapsUp.min),          title: "Event wraps up — vendors pack down", who: "", done: false });

  return [...slots, ...extraDayOfSlots].sort((a, b) => a.time.localeCompare(b.time));
}

/** Write day-of schedule to localStorage, including the event date for auto-tick */
export function writeDayOfToStorage(confirmedVendors = [], eventTiming = "", eventDate = "", extraDayOfSlots = []) {
  const slots = generateDayOfSchedule(confirmedVendors, eventTiming, extraDayOfSlots);
  const data = { slots, eventDate, __expiresAt: Date.now() + TTL_7D };
  try { localStorage.setItem("tendr_dayof", JSON.stringify(data)); } catch {}
  return slots;
}

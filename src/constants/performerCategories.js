// Single source of truth for performer/artist categories used across Registration.jsx,
// Profile.jsx, VendorDetails.jsx and GigProProfileView.jsx. These files used to each keep
// their own copy of "which categories are GigPro" / "which are bookable as a performer" —
// they drifted (e.g. "Emcee" vs the real submitted value "Emcee/Host", "Comedian" vs the
// real "Stand-up Comedian"), which silently routed real Magician/Comedian/DJ/Performer
// vendors to the wrong customer-facing profile template and 400'd their dashboard saves.
// Every value here must exactly match what Registration.jsx/AddVendorModal.jsx submit as
// `serviceType`, and the backend's constants/index.js GIG_PRO_TYPES list.

export const PERFORMER_CATEGORIES = [
  { value: "DJ",                 label: "DJ",               emoji: "🎧", sub: "Open format, commercial, wedding" },
  { value: "Anchor",             label: "Anchor",            emoji: "🎙️", sub: "Professional host for weddings & events" },
  { value: "Emcee/Host",         label: "Emcee / Host",      emoji: "🎭", sub: "Stage hosting & live shows" },
  { value: "Band",               label: "Live Band",         emoji: "🎸", sub: "Bollywood, jazz, rock or fusion band" },
  { value: "Singer",             label: "Singer",            emoji: "🎤", sub: "Solo vocalist — Bollywood, classical, western & more" },
  { value: "Musician",           label: "Musician",          emoji: "🎹", sub: "Instrumentalist — piano, guitar, tabla & more" },
  { value: "Choreographer",      label: "Choreographer",     emoji: "💃", sub: "Dance performances & group choreography" },
  { value: "Performer",          label: "Solo Performer",    emoji: "🎪", sub: "Dancer, acrobat, circus & specialty act", hasArtForm: true },
  { value: "Stand-up Comedian",  label: "Stand-up Comedian", emoji: "😂", sub: "Corporate & private shows" },
  { value: "Magician",           label: "Magician",          emoji: "🪄", sub: "Close-up & stage magic" },
];

export const PERFORMER_ART_FORMS = [
  { value: "Classical Dance",        label: "Classical Dance",         sub: "Bharatnatyam · Kathak · Odissi · Kuchipudi", emoji: "🪷" },
  { value: "Contemporary Dance",     label: "Contemporary Dance",      sub: "Hip-hop · Breaking · Freestyle · Jazz", emoji: "💃" },
  { value: "Folk & Cultural Dance",  label: "Folk & Cultural Dance",   sub: "Bhangra · Garba · Lavani · Bihu · Ghoomar", emoji: "🎊" },
  { value: "Aerial & Acrobatics",    label: "Aerial & Acrobatics",     sub: "Silk aerials · Hoop · Contortion · Tumbling", emoji: "🎪" },
  { value: "Fire & Circus Arts",     label: "Fire & Circus Arts",      sub: "Fire poi · Juggling · Clowning · Stilt walk", emoji: "🔥" },
  { value: "Belly Dance / Sufi",     label: "Belly Dance / Sufi",      sub: "Sufi whirling · Belly dance · Tribal fusion", emoji: "✨" },
  { value: "Mime & Physical Theater",label: "Mime & Physical Theater", sub: "Street mime · Physical comedy · Living statue", emoji: "🎭" },
  { value: "Other Art Form",         label: "Other / Mixed",           sub: "Combination or a style not listed here", emoji: "🎨" },
];

// Categories that get the GigPro profile layout + dashboard "Performance Details"/
// "Setlist & Performance"/"Packages" tabs. AV Setup is a technical service, not a
// performer, but the dashboard has long treated it as GigPro-like (its own
// Setup/Lights style options) — kept here so nothing regresses for existing AV
// Setup vendors.
export const GIG_PRO_TYPES = ["DJ", "Anchor", "Emcee/Host", "Band", "Choreographer", "Singer", "Musician", "Performer", "Stand-up Comedian", "Magician", "AV Setup"];

// Categories that get the "Book Now" → Artist T&C → direct booking modal on the
// customer-facing profile, instead of the generic chat flow. AV Setup is excluded —
// it behaves like a regular equipment/service vendor for booking purposes.
export const PERFORMER_SERVICE_TYPES = ["DJ", "Anchor", "Emcee/Host", "Band", "Choreographer", "Singer", "Musician", "Performer", "Stand-up Comedian", "Magician"];

export const GIG_GENRE_OPTIONS = ['Bollywood', 'EDM', 'Classical', 'Hip-Hop', 'Sufi', 'Punjabi', 'Jazz', 'Rock', 'Pop', 'Folk', 'Ghazal', 'Devotional'];
export const GIG_LANG_OPTIONS = ['Hindi', 'English', 'Punjabi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Marathi'];

// Only these categories show a Languages picker — matches what's actually
// relevant (a DJ's genre list matters more than "which language", etc.)
export const GIG_LANGUAGE_CATEGORIES = ['Emcee/Host', 'Anchor', 'Singer', 'Stand-up Comedian'];

export const GIG_STYLE_OPTIONS = {
  DJ:                  ['Indoor', 'Outdoor', 'Wedding', 'Corporate', 'Club', 'Festival'],
  'Emcee/Host':        ['Formal', 'Casual', 'Bilingual', 'Interactive', 'High-energy'],
  Anchor:              ['Formal', 'Casual', 'Bilingual', 'Scripted', 'Improvised'],
  Band:                ['Live Band', 'Cover Songs', 'Original Compositions', 'Jazz Set', 'Bollywood Night', 'Sufi Night'],
  Choreographer:       ['Bollywood', 'Contemporary', 'Hip-Hop', 'Classical', 'Wedding Sangeet', 'Couple Dance', 'Group Choreography'],
  Performer:           ['Stage Act', 'Walk Act', 'Flash Mob', 'Stunt', 'Dance', 'Comedy', 'Circus'],
  Musician:            ['Solo', 'Duo', 'Ensemble', 'Classical', 'Fusion', 'Acoustic'],
  Singer:              ['Solo Vocals', 'Duet', 'Background Vocals', 'Live Looping', 'Classical', 'Ghazal'],
  'Stand-up Comedian': ['Stand-Up', 'Roast', 'Mimicry', 'Improv', 'Corporate Safe', 'Open Mic'],
  Magician:            ['Close-up Magic', 'Table Magic', 'Stage Illusions', 'Mentalism', 'Comedy Magic', "Children's Show", 'Interactive Magic', 'Corporate Magic'],
  'AV Setup':          ['Basic', 'Standard', 'Premium', 'Full Production'],
};

// Only Stand-up Comedian gets this today — surfaced as a prominent badge near the
// name on the public profile, not buried in a chip list, since it affects whether
// a customer should book at all.
export const CONTENT_RATING_OPTIONS = ['Family-Friendly', 'Clean', 'Adult-Oriented', 'Customised for Professional Audience'];

// Per-category label for the "Setlist & Performance" tab/section — same
// {title, note} structure underneath for every category, just worded differently.
export function performanceLabel(svc) {
  if (svc === 'DJ') return 'Typical Set / Playlist Theme';
  if (['Emcee/Host', 'Anchor'].includes(svc)) return 'Script Outline / Typical Segments';
  if (svc === 'Stand-up Comedian') return 'Set Material / Topics';
  if (svc === 'Choreographer') return 'Routine Description';
  if (svc === 'Magician') return 'Show Description / Acts';
  if (svc === 'Musician') return 'Repertoire / Sets';
  return 'Setlist / Repertoire';
}

// What the two fields of one row mean, per category — shown as the input
// placeholders so vendors fill in *fields*, not a freeform example paragraph.
export function performanceFieldHints(svc) {
  if (['Emcee/Host', 'Anchor'].includes(svc)) return { title: 'e.g. Welcome address & intro', note: 'e.g. 5 min, bilingual' };
  if (svc === 'DJ') return { title: 'e.g. Bollywood Party Mix', note: 'e.g. 2 hrs, cocktail hour' };
  if (svc === 'Magician') return { title: 'e.g. Close-up card magic', note: 'e.g. table-to-table, 15 min' };
  if (svc === 'Stand-up Comedian') return { title: 'e.g. Crowd work opener', note: 'e.g. clean, corporate-safe' };
  if (svc === 'Choreographer') return { title: 'e.g. Couple first dance', note: 'e.g. 1 min, Bollywood' };
  if (svc === 'Singer') return { title: 'e.g. Tum Hi Ho', note: 'e.g. Bollywood romantic, Hindi' };
  if (svc === 'Musician') return { title: 'e.g. Classical Raag performance', note: 'e.g. 20 min, sitar' };
  if (svc === 'Band') return { title: 'e.g. Bollywood Live Set', note: 'e.g. 90 min' };
  return { title: 'e.g. Signature act or segment', note: 'e.g. duration or style' };
}

// Quick-add starting points so a vendor can tap instead of typing from a blank
// row — still produces a real structured {title, note} entry, not a text blob.
export const QUICK_PERFORMANCE_ITEMS = {
  DJ:                  ['Bollywood Party Mix', 'EDM Drop Set', 'Sufi Night Set', 'Retro Classics', 'Cocktail Hour Lounge', 'Punjabi Wedding Bangers', 'Late Night High Energy'],
  Singer:              ['Ghazal Set', 'Bollywood Romantic Set', 'Sufi / Devotional Set', 'Live Unplugged Session', 'Custom Song Requests', 'Title Song Medley'],
  Musician:            ['Classical Raag Performance', 'Fusion Set', 'Instrumental Background Music', 'Solo Recital', 'Jugalbandi / Duet'],
  Band:                ['Bollywood Live Set', 'Retro Classics Set', 'Sufi Night', 'Jazz Lounge Set', 'Rock / Fusion Set'],
  Choreographer:       ['Couple First Dance', 'Group Sangeet Performance', 'Flash Mob Coordination', 'Kids Dance Act', 'Bridal Entry Choreography'],
  Anchor:              ['Welcome & Introductions', 'Couple Q&A Game', 'Audience Fun Games', 'Award / Felicitation Rounds', 'Closing Ceremony'],
  'Emcee/Host':        ['High-Energy Opening', 'Brand Activation Segment', 'Audience Interaction Games', 'Product Launch Script', 'Closing & Thank You'],
  'Stand-up Comedian': ['Clean Corporate Set', 'Wedding Roast (family-friendly)', 'Open Mic Material', 'Crowd Work Segment', 'Mimicry & Impressions'],
  Magician:            ['Close-Up Card Magic', 'Stage Illusion Act', 'Mentalism / Mind Reading', "Children's Show Set", 'Corporate Branded Finale'],
  Performer:           ['Stage Act', 'Walk-Around Meet & Greet', 'Flash Mob Surprise', 'Stunt / Fire Act', 'Comedy Sketch'],
};

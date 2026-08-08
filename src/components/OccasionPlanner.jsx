import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useChatOverlay } from '../context/ChatContext';

import BIRTHDAY_THEMES from '../data/birthdayThemes';
import ANNIVERSARY_THEMES from '../data/anniversaryThemes';
import BABY_SHOWER_THEMES from '../data/babyShowerThemes';
import HOUSE_PARTY_THEMES from '../data/housePartyThemes';
import HOUSEWARMING_THEMES from '../data/housewarmingThemes';
import GET_TOGETHER_THEMES from '../data/getTogetherThemes';
import KITTY_PARTY_THEMES from '../data/kittyPartyThemes';
import NAMING_CEREMONY_THEMES from '../data/namingCeremonyThemes';

const INDIAN_CITIES = ['Delhi','Greater Noida','Noida','Ghaziabad'];

// ── Data maps ─────────────────────────────────────────────────────────────

const THEME_DATA_MAP = {
  'Birthday':        BIRTHDAY_THEMES,
  'Anniversary':     ANNIVERSARY_THEMES,
  'Baby Shower':     BABY_SHOWER_THEMES,
  'House Party':     HOUSE_PARTY_THEMES,
  'Housewarming':    HOUSEWARMING_THEMES,
  'Get Together':    GET_TOGETHER_THEMES,
  'Kitty Party':     KITTY_PARTY_THEMES,
  'Naming Ceremony': NAMING_CEREMONY_THEMES,
};

const OCCASIONS_LIST = [
  { label: 'Birthday',        photo: '/occasions/birthday-desktop.png' },
  { label: 'Anniversary',     photo: '/occasions/anniversary-desktop.png' },
  { label: 'Baby Shower',     photo: '/occasions/baby-shower-desktop.png' },
  { label: 'House Party',     photo: '/occasions/house-party-desktop.png' },
  { label: 'Housewarming',    photo: '/occasions/housewarming-desktop.png' },
  { label: 'Get Together',    photo: '/occasions/get-together-desktop.png' },
  { label: 'Kitty Party',     photo: '/occasions/kitty-party-desktop.png' },
  { label: 'Naming Ceremony', photo: '/occasions/naming-ceremony-desktop.png' },
];

const BUDGET_OPTIONS = [
  { key: 'Budget',   label: 'Basic',    desc: 'Simple & charming',    stars: 1 },
  { key: 'Standard', label: 'Standard', desc: 'Balanced & beautiful', stars: 2 },
  { key: 'Premium',  label: 'Premium',  desc: 'Elevated & elegant',   stars: 3 },
  { key: 'Luxury',   label: 'Luxury',   desc: 'Opulent & grand',      stars: 4 },
];

const VENUE_OPTIONS = [
  { key: 'house',   label: 'At Home / Venue',    desc: 'House, apartment, banquet hall', venues: ['Home','Apartment','Villa','Hotel','Banquet','Club','Indoor Party Hall','Studio','Library Café','Café','Gaming Café','Heritage Venue','Ancestral Home','Community Hall','Sports Bar','Winery'] },
  { key: 'lawn',    label: 'Lawn / Farmhouse',   desc: 'Open outdoor ground or resort',  venues: ['Lawn','Farmhouse','Resort','Ground','Poolside','Beach Resort'] },
  { key: 'garden',  label: 'Garden',             desc: 'Lush green garden setting',      venues: ['Garden','Farmhouse','Lawn'] },
  { key: 'terrace', label: 'Terrace / Rooftop',  desc: 'Elevated open-sky spot',         venues: ['Rooftop','Penthouse','Terrace','Villa','Hotel'] },
];

const TIME_OPTIONS = [
  { key: 'Morning',   label: 'Morning',   desc: '8 am – 12 pm' },
  { key: 'Afternoon', label: 'Afternoon', desc: '12 pm – 4 pm' },
  { key: 'Evening',   label: 'Evening',   desc: '4 pm – 8 pm'  },
  { key: 'Night',     label: 'Night',     desc: '8 pm onwards' },
];

const PAGE_NAMES = ['Overview', 'Customise', 'Plan & Decor'];

// ── Colour system (warm, Tendr-resonant) ──────────────────────────────────

// Per-occasion accent colours — all warm earth/gold tones matching the website
const OCC_COLOR = {
  'Birthday':        '#FF4B8B',  // vibrant pink — festive & fun
  'Anniversary':     '#C4728A',  // dusty rose
  'Baby Shower':     '#8AB4A0',  // sage mint
  'House Party':     '#D4A53A',  // bright amber
  'Housewarming':    '#C47A2E',  // exact Tendr gold
  'Get Together':    '#7A9A5A',  // forest sage
  'Kitty Party':     '#D4778A',  // warm pink
  'Naming Ceremony': '#D4922E',  // saffron
};
const FALLBACK_COLOR = '#C47A2E';

const OCC_BG = {
  'Birthday':        ['#220814', '#140408'],  // deep pink/berry
  'Anniversary':     ['#1E0A18', '#120412'],
  'Baby Shower':     ['#061A14', '#031008'],
  'House Party':     ['#1E1608', '#120E02'],
  'Housewarming':    ['#1C0A04', '#130600'],
  'Get Together':    ['#081806', '#041002'],
  'Kitty Party':     ['#220A14', '#140408'],
  'Naming Ceremony': ['#201008', '#140802'],
};

// Warm palette for per-theme unique colours (hashed from theme id)
const WARM_SWATCHES = [
  '#C47A2E','#E8855A','#D4A53A','#C4728A',
  '#D4778A','#D4922E','#8AB4A0','#7A9A5A',
  '#9A7A50','#C47A5A','#B47A30','#A4728A',
  '#9A5A3A','#D49A5A','#8A7A50','#C4924A',
];

function themeAccentColor(themeId) {
  let h = 5381;
  for (const c of (themeId || '')) { h = ((h << 5) + h) + c.charCodeAt(0); h |= 0; }
  return WARM_SWATCHES[Math.abs(h) % WARM_SWATCHES.length];
}

function timeIcon(key) {
  const p = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  if (key === 'Morning')   return <svg {...p}><circle cx="12" cy="9" r="4"/><path d="M12 1v2M12 15v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M3 20h18" strokeOpacity="0.45"/></svg>;
  if (key === 'Afternoon') return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
  if (key === 'Evening')   return <svg {...p}><path d="M3 19h18"/><circle cx="12" cy="15" r="4"/><path d="M12 11V7M8.46 9.46 6.34 7.34M15.54 9.46l2.12-2.12"/></svg>;
  if (key === 'Night')     return <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
  return null;
}

function venueIcon(key, color) {
  const c = color || 'currentColor';
  const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  if (key === 'house')   return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  if (key === 'lawn')    return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12"/></svg>;
  if (key === 'garden')  return <svg {...p}><path d="M12 22V10"/><path d="M12 10C12 6.69 9.31 4 6 4c0 3.31 2.69 6 6 6z"/><path d="M12 10c0-3.31 2.69-6 6-6 0 3.31-2.69 6-6 6z"/></svg>;
  if (key === 'terrace') return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
  return null;
}

function darken(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16);
  const f = 1 - pct / 100;
  const r = Math.max(0, Math.round(((n >> 16) & 255) * f));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * f));
  const b = Math.max(0, Math.round((n & 255) * f));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Unsplash photo hook ───────────────────────────────────────────────────

const _photoCache = new Map();

async function resolveThemePhoto(themeId, themeName, occasion) {
  const BASE = import.meta.env.VITE_BASE_URL;

  // 1. Check DB first
  try {
    const res  = await fetch(`${BASE}/theme-photos/${themeId}`);
    const data = await res.json();
    if (data.url) { _photoCache.set(themeId, data.url); return data.url; }
  } catch {}

  // 2. Fetch from Unsplash (fallback — bulk script handles this permanently)
  const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  try {
    const q   = encodeURIComponent(`indian ${themeName} ${occasion} decoration celebration`);
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${q}&per_page=8&orientation=landscape&content_filter=high&client_id=${key}`);
    const data = await res.json();
    const urls = (data?.results || []).map(r => r.urls?.regular).filter(Boolean);
    if (urls.length) {
      // 3. Save all photos to DB permanently
      fetch(`${BASE}/theme-photos/${themeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      }).catch(() => {});
      _photoCache.set(themeId, urls[0]);
      return urls[0];
    }
  } catch {}
  return null;
}

function useUnsplashPhoto(themeId, themeName, occasion, fallback) {
  const [url, setUrl] = useState(fallback);
  useEffect(() => {
    if (_photoCache.has(themeId)) { setUrl(_photoCache.get(themeId)); return; }
    resolveThemePhoto(themeId, themeName, occasion)
      .then(photoUrl => { if (photoUrl) setUrl(photoUrl); })
      .catch(() => {});
  }, [themeId]);
  return url;
}

// ── Photos ────────────────────────────────────────────────────────────────

const U = 'https://images.unsplash.com/';
const PH = {
  elegant_night:  `${U}photo-1530103862676-de8c9debad1d?w=800&h=480&fit=crop&auto=format&q=80`,
  luxury_gold:    `${U}photo-1464366400600-7168b8af9bc3?w=800&h=480&fit=crop&auto=format&q=80`,
  kids_fun:       `${U}photo-1513151233558-d860c5398176?w=800&h=480&fit=crop&auto=format&q=80`,
  garden_day:     `${U}photo-1510076857177-7470076d4098?w=800&h=480&fit=crop&auto=format&q=80`,
  romantic:       `${U}photo-1519167758481-83f575bb0ea2?w=800&h=480&fit=crop&auto=format&q=80`,
  dj_neon:        `${U}photo-1574391884720-bbc3740c59d1?w=800&h=480&fit=crop&auto=format&q=80`,
  baby_pastel:    `${U}photo-1587825140708-dfaf72ae4b04?w=800&h=480&fit=crop&auto=format&q=80`,
  traditional:    `${U}photo-1576091160550-2173dba999ef?w=800&h=480&fit=crop&auto=format&q=80`,
  boho_rustic:    `${U}photo-1501339847302-ac426a4a7cbb?w=800&h=480&fit=crop&auto=format&q=80`,
  outdoor:        `${U}photo-1506157786151-b8491531f063?w=800&h=480&fit=crop&auto=format&q=80`,
  masquerade:     `${U}photo-1493843978996-26b3a5d03ae5?w=800&h=480&fit=crop&auto=format&q=80`,
  movie:          `${U}photo-1489599849927-2ee91cede3ba?w=800&h=480&fit=crop&auto=format&q=80`,
  pool:           `${U}photo-1519046904884-53103b34b206?w=800&h=480&fit=crop&auto=format&q=80`,
  carnival:       `${U}photo-1429514513361-8fa32282fd5f?w=800&h=480&fit=crop&auto=format&q=80`,
};

const PHOTO_ID_MAP = {
  'neon-glow':PH.dj_neon,'neon-glow-party':PH.dj_neon,'retro-disco':PH.dj_neon,'dj-night':PH.dj_neon,'silent-disco':PH.dj_neon,
  'gaming':PH.elegant_night,'gaming-party':PH.elegant_night,
  'masquerade':PH.masquerade,'mystery-murder-night':PH.masquerade,
  'movie-night':PH.movie,
  'carnival':PH.carnival,'circus':PH.carnival,
  'pool-party':PH.pool,
  'boho-picnic':PH.boho_rustic,'rustic-chic':PH.boho_rustic,'boho-home':PH.boho_rustic,'boho-chic':PH.boho_rustic,'rustic-garden':PH.boho_rustic,
  'garden-party':PH.garden_day,'garden-picnic':PH.garden_day,'garden-brunch':PH.garden_day,'eco-green-home':PH.garden_day,
  'black-and-gold':PH.luxury_gold,'black-and-gold-elegance':PH.luxury_gold,'black-and-gold-night':PH.luxury_gold,
  'royal-celebration':PH.luxury_gold,'silver-jubilee':PH.luxury_gold,'royal-welcome':PH.luxury_gold,
  'royal-queen':PH.luxury_gold,'royal-prince':PH.luxury_gold,'royal-princess':PH.luxury_gold,
  'denim-and-diamonds':PH.luxury_gold,'white-and-gold':PH.luxury_gold,
  'romantic-candlelight':PH.romantic,'rooftop-dinner':PH.romantic,'starry-night':PH.romantic,'paris-romance':PH.romantic,'cruise-night':PH.romantic,
  'beach-sunset':PH.outdoor,'tropical-paradise':PH.outdoor,'tropical-escape':PH.outdoor,'backyard-bbq':PH.outdoor,
  'bonfire-night':PH.outdoor,'camping-adventure':PH.outdoor,'hawaiian-luau':PH.outdoor,
  'traditional-namkaran':PH.traditional,'traditional-griha-pravesh':PH.traditional,'temple-blessing':PH.traditional,'heritage-haveli':PH.traditional,'festival-home':PH.traditional,
  'pastel-dreams':PH.baby_pastel,'teddy-bear':PH.baby_pastel,'cloud-and-moon':PH.baby_pastel,'twinkle-twinkle':PH.baby_pastel,'moon-and-stars':PH.baby_pastel,
  'bollywood-glam':PH.elegant_night,'casino-night':PH.elegant_night,'hollywood-glam':PH.elegant_night,'white-party':PH.elegant_night,'cocktail-lounge':PH.elegant_night,'rooftop-vibes':PH.elegant_night,'festival-house-party':PH.elegant_night,
};

function occFallback(occasion) {
  return `/occasions/${(occasion||'birthday').toLowerCase().replace(/ /g,'-')}-desktop.png`;
}

function getThemePhoto(theme, occasion) {
  if (PHOTO_ID_MAP[theme.id]) return PHOTO_ID_MAP[theme.id];
  const bt = theme.bestTime || [];
  const isBaby   = occasion === 'Baby Shower' || occasion === 'Naming Ceremony';
  const isKids   = occasion === 'Birthday' && parseInt((theme.bestAgeGroup||'').split(/[-–]/)[1]) <= 13;
  const isLux    = theme.budget === 'Luxury';
  const isGarden = (theme.bestVenue||[]).includes('Garden');
  const isNight  = bt.includes('Night') && !bt.includes('Morning');
  if (isBaby)   return PH.baby_pastel;
  if (isKids)   return PH.kids_fun;
  if (isLux)    return PH.luxury_gold;
  if (isGarden) return PH.garden_day;
  if (isNight)  return PH.dj_neon;
  return occFallback(occasion);
}

// ── Filtering ─────────────────────────────────────────────────────────────

function parseGuestRange(s = '') {
  const m = s.match(/(\d+)[–\-](\d+)/);
  return m ? [parseInt(m[1]), parseInt(m[2])] : [0, 999];
}

function filterThemes(themes, { budget, guests, venue, timeOfDay }) {
  return themes.filter(t => {
    if (budget && !(t.budget||'').includes(budget)) return false;
    if (guests && !isNaN(parseInt(guests))) {
      const g = parseInt(guests);
      const [mn, mx] = parseGuestRange(t.recommendedGuests);
      if (g < mn * 0.65 || g > mx * 1.4) return false;
    }
    if (venue) {
      const opt = VENUE_OPTIONS.find(v => v.key === venue);
      if (opt && !(t.bestVenue||[]).some(v => opt.venues.includes(v))) return false;
    }
    if (timeOfDay && !(t.bestTime||[]).includes(timeOfDay)) return false;
    return true;
  });
}

function getFiltered(occasion, filters) {
  const all = THEME_DATA_MAP[occasion] || [];
  let r = filterThemes(all, filters);
  if (!r.length) r = filterThemes(all, { ...filters, budget: null });
  if (!r.length) r = filterThemes(all, { ...filters, budget: null, venue: null });
  if (!r.length) r = all.slice(0, 8);
  return r;
}

// ── CSS ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');

  @keyframes op-rise {
    from { opacity:0; transform:scale(0.97) translateY(10px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes op-step {
    from { opacity:0; transform:translateY(18px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes book-fwd {
    from { opacity:0; transform:perspective(900px) rotateY(22deg) translateX(6%) scale(0.97); }
    to   { opacity:1; transform:perspective(900px) rotateY(0) translateX(0) scale(1); }
  }
  @keyframes book-bwd {
    from { opacity:0; transform:perspective(900px) rotateY(-22deg) translateX(-6%) scale(0.97); }
    to   { opacity:1; transform:perspective(900px) rotateY(0) translateX(0) scale(1); }
  }

  .op-rise  { animation: op-rise  0.28s cubic-bezier(0.3,0,0.2,1) forwards; }
  .op-step  { animation: op-step  0.22s cubic-bezier(0.3,0,0.2,1) forwards; }
  .book-fwd { animation: book-fwd 0.38s cubic-bezier(0.25,0.8,0.25,1) forwards; }
  .book-bwd { animation: book-bwd 0.38s cubic-bezier(0.25,0.8,0.25,1) forwards; }

  .op-scroll::-webkit-scrollbar { display:none; }
  .op-scroll { scrollbar-width:none; -webkit-overflow-scrolling:touch; }

  .pf-datetime { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

  .op-occ-card:hover  { transform:translateY(-4px) scale(1.02) !important; box-shadow:0 16px 44px rgba(0,0,0,0.62) !important; border-color:rgba(245,236,216,0.18) !important; }
  .op-occ-card:hover img { transform:scale(1.06) !important; opacity:0.92 !important; }
  .op-theme-card:hover { background:rgba(245,236,216,0.06) !important; transform:translateY(-2px) !important; box-shadow:0 8px 28px rgba(0,0,0,0.38) !important; border-color:rgba(196,122,46,0.48) !important; }
  .op-theme-card:hover .op-theme-img { transform:scale(1.07) !important; }

  .op-opt:hover { background:rgba(245,236,216,0.07) !important; }
  .op-sel-chip:hover { opacity:0.9; }

  button { user-select:none; -webkit-user-select:none; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  input[type=number] { -moz-appearance:textfield; }

  @media (max-width:600px) {
    .op-panel        { border-radius:20px !important; max-height:82vh !important; margin:auto !important; }
    .op-overlay-wrap { align-items:center !important; padding:16px !important; }
    .op-picker-grid  { gap:7px !important; }
    .op-picker-card  { height:84px !important; }
    .op-2col-form    { grid-template-columns:1fr 1fr !important; }
    .book-detail-panel{ border-radius:20px !important; max-height:80vh !important; margin:auto !important; }
    .book-detail-wrap { align-items:center !important; padding:16px !important; }
    .book-detail-col  { grid-template-columns:1fr !important; }
    .op-sel-chip      { font-size:10px !important; padding:5px 10px !important; }
    .book-photo-grid  { grid-template-columns:repeat(2,1fr) !important; }
    .book-hero-img    { height:210px !important; }
    .book-title       { font-size:1.7rem !important; }
    .op-theme-grid    { grid-template-columns:1fr !important; }
    .pf-datetime      { grid-template-columns:1fr !important; }
  }
`;

// ── Helper components ─────────────────────────────────────────────────────

function SectionLabel({ color, children }) {
  return (
    <h4 style={{
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em',
      margin: '0 0 10px', color: color || FALLBACK_COLOR,
      fontFamily: "'Outfit', sans-serif",
    }}>{children}</h4>
  );
}

function StatTile({ label, value, color }) {
  return (
    <div style={{
      padding: '16px 11px', borderRadius: 14, textAlign: 'center',
      background: `${color}0D`, border: `1px solid ${color}24`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 40, height: 1.5, background: `linear-gradient(90deg, transparent, ${color}88, transparent)`, pointerEvents: 'none' }} />
      <div style={{ fontSize: 15, fontWeight: 400, color: '#F5ECD8', lineHeight: 1.3, marginBottom: 5, fontFamily: "'Cormorant Garamond',serif", letterSpacing: '0.01em' }}>{value}</div>
      <div style={{ fontSize: 9, color: `${color}80`, textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: "'Outfit',sans-serif", fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function BulletList({ items, color, max = 5 }) {
  const [expanded, setExpanded] = useState(false);
  if (!items?.length) return null;
  const shown = expanded ? items : items.slice(0, max);
  return (
    <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none' }}>
      {shown.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
          <svg width="5" height="5" viewBox="0 0 5 5" style={{ marginTop: 8, flexShrink: 0 }}><circle cx="2.5" cy="2.5" r="2.5" fill={color} /></svg>
          <span style={{ fontSize: 13, color: 'rgba(245,236,216,0.97)', lineHeight: 1.6, fontFamily: "'Outfit',sans-serif" }}>{item}</span>
        </li>
      ))}
      {!expanded && items.length > max && (
        <li>
          <button onClick={() => setExpanded(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color, fontFamily: "'Outfit',sans-serif", fontWeight: 700, padding: '2px 0', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            +{items.length - max} more
          </button>
        </li>
      )}
    </ul>
  );
}

function PageDots({ current, total, color }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 22 : 6, height: 6, borderRadius: 3,
          background: i === current ? color : 'rgba(245,236,216,0.2)',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel = 'Next', color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'rgba(245,236,216,0.58)', fontSize: 13, cursor: 'pointer', padding: '8px 0', fontFamily: "'Outfit',sans-serif", WebkitAppearance: 'none', appearance: 'none', outline: 'none', display: 'flex', alignItems: 'center', gap: 5, letterSpacing: '0.02em' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>
      {onNext && (
        <button onClick={onNext} style={{ padding: '12px 32px', borderRadius: 100, background: `linear-gradient(135deg, ${color || FALLBACK_COLOR}, ${color ? darken(color, 18) : '#A0621C'})`, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", boxShadow: `0 5px 18px ${color||FALLBACK_COLOR}45`, letterSpacing: '0.02em' }}>
          {nextLabel}
        </button>
      )}
    </div>
  );
}

function Breadcrumb({ occasion, current, color }) {
  if (!occasion) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
      <span style={{ fontSize: 11, color: 'rgba(245,236,216,0.48)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Outfit',sans-serif" }}>{occasion}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,236,216,0.28)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      <span style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>{current}</span>
    </div>
  );
}

function OptButton({ selected, color, onClick, children, className = 'op-opt' }) {
  return (
    <button className={className} onClick={onClick} style={{
      padding: '18px 15px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
      border: `1.5px solid ${selected ? color + 'BB' : 'rgba(245,236,216,0.1)'}`,
      background: selected ? `${color}1A` : 'rgba(245,236,216,0.04)',
      boxShadow: selected ? `0 0 0 1px ${color}22, 0 4px 22px ${color}1E` : 'none',
      transition: 'all 0.2s', fontFamily: "'Outfit',sans-serif",
    }}>
      {children}
    </button>
  );
}

// ── Copy chip (tap to copy text, shows ✓ Copied briefly) ─────────────────

function CopyChip({ text, color }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button onClick={copy} style={{
      fontSize: 12, padding: '7px 14px', borderRadius: 100,
      background: copied ? `${color}28` : `${color}0A`,
      border: `1.5px solid ${copied ? color : `${color}22`}`,
      color: copied ? '#F5ECD8' : 'rgba(245,236,216,0.85)',
      fontFamily: "'Outfit',sans-serif", fontWeight: copied ? 600 : 400,
      cursor: 'pointer', lineHeight: 1.4, transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>
      {copied ? '✓ Copied' : text}
    </button>
  );
}

// ── Book carousel pages ───────────────────────────────────────────────────

function BookPage1({ theme, occasion, photo, color }) {
  return (
    <div>
      {/* Full-bleed hero — negative margin to cancel parent padding */}
      <div className="book-hero-img" style={{ margin: '0 -24px', height: 295, position: 'relative', overflow: 'hidden' }}>
        <img src={photo} alt={theme.theme} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 6s ease' }}
          onError={e => { e.target.src = occFallback(occasion); }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, #1A0902 0%, rgba(26,9,2,0.62) 35%, rgba(26,9,2,0.12) 65%, transparent 100%)` }} />
        {/* Ambient top edge glow */}
        <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to bottom, rgba(26,9,2,0.38), transparent)', pointerEvents: 'none' }} />
        {/* Badges + Title inside photo */}
        <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '3px 10px', borderRadius: 100, background: `${color}28`, border: `1px solid ${color}55`, color, backdropFilter: 'blur(8px)', fontFamily: "'Outfit',sans-serif" }}>{occasion}</span>
            <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '3px 10px', borderRadius: 100, background: 'rgba(245,236,216,0.12)', border: '1px solid rgba(245,236,216,0.25)', color: 'rgba(245,236,216,0.8)', backdropFilter: 'blur(8px)', fontFamily: "'Outfit',sans-serif" }}>{theme.budget}</span>
          </div>
          <h2 className="book-title" style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.9rem,5vw,2.8rem)', fontWeight: 400, letterSpacing: '-0.01em',
            color: '#F5ECD8', margin: '0 0 5px', lineHeight: 1.1,
          }}>{theme.theme}</h2>
          <p style={{ fontSize: 13, color: 'rgba(245,236,216,0.95)', margin: 0, fontStyle: 'italic', fontFamily: "'Cormorant Garamond',serif", letterSpacing: '0.02em' }}>{theme.oneLineDesc}</p>
        </div>
      </div>

      <div style={{ paddingTop: 22 }}>
        {/* Overview */}
        {theme.overview && (
          <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 400, color: 'rgba(245,236,216,0.88)', lineHeight: 2, margin: '0 0 24px', borderLeft: `2.5px solid ${color}55`, paddingLeft: 16 }}>{theme.overview}</p>
        )}

        {/* Stats row — 2×2 when age group present, 3-col otherwise */}
        <div style={{ display: 'grid', gridTemplateColumns: theme.bestAgeGroup ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 10 }}>
          <StatTile label="Guests" value={theme.recommendedGuests} color={color} />
          <StatTile label="Budget" value={theme.budget} color={color} />
          <StatTile label="Best Time" value={(theme.bestTime||[]).join(' · ')} color={color} />
          {theme.bestAgeGroup && <StatTile label="Age Group" value={theme.bestAgeGroup} color={color} />}
        </div>

        {/* Best Venue chips */}
        {theme.bestVenue?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 16, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: "'Outfit',sans-serif" }}>Best Venue</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {theme.bestVenue.map((v, i) => (
                <span key={i} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, background: `${color}0A`, border: `1px solid ${color}22`, color: 'rgba(245,236,216,0.90)', fontFamily: "'Outfit',sans-serif" }}>{v}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookPage2({ theme, color, selections, onToggle, onCustomChange }) {
  const sections = [
    { key: 'colourPalette', title: 'Colour Palette',  items: theme.colourPalette || [] },
    { key: 'decoration',    title: 'Decoration',        items: theme.decorationIdeas || [] },
    { key: 'food',          title: 'Food & Snacks',    items: (theme.foodSuggestions || theme.foodIdeas || []) },
    { key: 'entertainment', title: 'Entertainment',     items: theme.entertainment || [] },
    { key: 'gifts',         title: 'Gifts',             items: theme.returnGiftIdeas || [] },
    { key: 'photography',   title: 'Photography Style', items: theme.photographyIdeas || [] },
  ].filter(s => s.items.length > 0);

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ marginBottom: 22, paddingBottom: 14, borderBottom: `1px solid ${color}18` }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.2rem,3.5vw,1.8rem)', fontWeight: 400, color: '#F5ECD8', margin: '0 0 4px', letterSpacing: '0.01em' }}>
          Customise Your Vision
        </h3>
        <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 400, color: 'rgba(245,236,216,0.60)', margin: 0, letterSpacing: '0.02em' }}>Select what you'd like — pick as many as you want</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {sections.map(({ key, title, items }) => {
          const sec = selections?.[key] || { picked: [], custom: '' };
          return (
            <div key={key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 16, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: "'Outfit',sans-serif" }}>{title}</span>
                {sec.picked.length > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: `${color}22`, color, fontFamily: "'Outfit',sans-serif" }}>{sec.picked.length} selected</span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
                {items.map((item, i) => {
                  const isSel = sec.picked.includes(item);
                  return (
                    <button key={i} onClick={() => onToggle(key, item)} className="op-sel-chip" style={{
                      fontSize: 12, padding: '7px 14px', borderRadius: 100,
                      background: isSel ? `${color}28` : `${color}0A`,
                      border: `1.5px solid ${isSel ? color : `${color}22`}`,
                      color: isSel ? '#F5ECD8' : 'rgba(245,236,216,0.85)',
                      fontFamily: "'Outfit',sans-serif", fontWeight: isSel ? 600 : 400,
                      cursor: 'pointer', lineHeight: 1.4, transition: 'all 0.15s',
                    }}>
                      {isSel && <span style={{ marginRight: 5, fontSize: 10 }}>✓</span>}
                      {item}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder={`Add your own ${title.toLowerCase()}…`}
                value={sec.custom}
                onChange={e => onCustomChange(key, e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 14px', borderRadius: 10,
                  background: 'rgba(245,236,216,0.04)',
                  border: `1px solid ${sec.custom ? color : 'rgba(245,236,216,0.1)'}`,
                  color: '#F5ECD8', fontSize: 12,
                  fontFamily: "'Outfit',sans-serif", outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = color}
                onBlur={e => e.target.style.borderColor = sec.custom ? color : 'rgba(245,236,216,0.1)'}
              />
            </div>
          );
        })}
      </div>

      {/* More Ideas — copyable, not selectable */}
      {(theme.cakeIdeas?.length > 0 || theme.gamesActivities?.length > 0) && (
        <div style={{ marginTop: 10, paddingTop: 24, borderTop: `1px solid ${color}18` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 16, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: "'Outfit',sans-serif" }}>More Ideas</span>
            <span style={{ fontSize: 10, color: 'rgba(245,236,216,0.38)', fontFamily: "'Outfit',sans-serif" }}>· tap to copy</span>
          </div>
          {theme.cakeIdeas?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: 'rgba(245,236,216,0.60)', fontFamily: "'Outfit',sans-serif", marginBottom: 9 }}>Cake Ideas</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {theme.cakeIdeas.map((item, i) => <CopyChip key={i} text={item} color={color} />)}
              </div>
            </div>
          )}
          {theme.gamesActivities?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'rgba(245,236,216,0.60)', fontFamily: "'Outfit',sans-serif", marginBottom: 9 }}>Games & Activities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {theme.gamesActivities.map((item, i) => <CopyChip key={i} text={item} color={color} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookPage3({ theme, color, galleryUrls = [], selectedPhotos = [], onTogglePhoto, onProceedNow, onBrowseOtherThemes }) {
  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${color}18` }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.2rem,3.5vw,1.8rem)', fontWeight: 400, color: '#F5ECD8', margin: '0 0 4px', letterSpacing: '0.01em' }}>
          Plan &amp; Decor
        </h3>
        <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 400, color: 'rgba(245,236,216,0.50)', margin: 0, letterSpacing: '0.02em' }}>Select decor photos and proceed when ready</p>
      </div>

      {/* Planning checklist */}
      {theme.planningChecklist?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: "'Outfit',sans-serif" }}>Planning Checklist</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {theme.planningChecklist.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(245,236,216,0.03)', border: '1px solid rgba(245,236,216,0.07)',
              }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${color}18`, border: `1.5px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l3 3 5-5"/>
                  </svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(245,236,216,0.88)', fontFamily: "'Outfit',sans-serif", lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decor photos — selectable */}
      {galleryUrls.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 16, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: "'Outfit',sans-serif" }}>Decor Photos</span>
            {selectedPhotos.length > 0 && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: `${color}22`, color, fontFamily: "'Outfit',sans-serif" }}>{selectedPhotos.length} selected</span>
            )}
          </div>
          <div className="book-photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
            {galleryUrls.slice(0, 6).map((url, i) => {
              const isSel = selectedPhotos.includes(url);
              return (
                <div key={i}
                  onClick={() => onTogglePhoto && onTogglePhoto(url)}
                  style={{
                    aspectRatio: '4/3', borderRadius: 11, overflow: 'hidden',
                    background: `${color}0A`, position: 'relative', cursor: 'pointer',
                    border: `2px solid ${isSel ? color : 'transparent'}`,
                    transition: 'border-color 0.15s',
                  }}>
                  <img src={url} alt="" loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {isSel && (
                    <div style={{ position: 'absolute', inset: 0, background: `${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>✓</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(245,236,216,0.46)', margin: '8px 0 0', fontFamily: "'Outfit',sans-serif" }}>Tap photos to select your favourites</p>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 20, borderTop: `1px solid ${color}18` }}>
        <button onClick={onProceedNow} style={{
          flex: 1, minWidth: 130, padding: '15px 22px', borderRadius: 100,
          background: `linear-gradient(135deg, ${color}, ${darken(color,22)})`,
          color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: "'Outfit',sans-serif",
          boxShadow: `0 6px 26px ${color}52, 0 2px 8px ${color}28`,
          letterSpacing: '0.03em',
        }}>Proceed Now</button>
        <button onClick={onBrowseOtherThemes} style={{
          flex: 1, minWidth: 130, padding: '15px 22px', borderRadius: 100,
          background: 'rgba(245,236,216,0.05)', color: 'rgba(245,236,216,0.72)',
          border: '1.5px solid rgba(245,236,216,0.12)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: "'Outfit',sans-serif", letterSpacing: '0.01em',
        }}>Browse Other Themes</button>
      </div>
    </div>
  );
}

// ── Book Detail modal (3-page carousel) ──────────────────────────────────

function BookDetail({ theme, occasion, onClose, onBrowseOtherThemes }) {
  const [pg, setPg]               = useState(0);
  const [animDir, setAnimDir]     = useState(null);
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [proceedFormOpen, setProceedFormOpen] = useState(false);
  const [pForm, setPForm] = useState({
    date: '', time: '', address: '', city: '', guests: '', notes: '',
  });
  const [selections, setSelections] = useState({
    colourPalette: { picked: [], custom: '' },
    decoration:    { picked: [], custom: '' },
    food:          { picked: [], custom: '' },
    entertainment: { picked: [], custom: '' },
    gifts:         { picked: [], custom: '' },
    photography:   { picked: [], custom: '' },
    photos:        [],
  });
  const [venuePhoto, setVenuePhoto] = useState(null);
  const venuePhotoInputRef = useRef(null);
  const navigate = useNavigate();
  const { token } = useSelector(s => s.auth);
  const { openExistingChat } = useChatOverlay();

  const color = themeAccentColor(theme.id);

  const handleToggle = (key, item) => {
    setSelections(prev => {
      const sec = prev[key];
      const picked = sec.picked.includes(item)
        ? sec.picked.filter(p => p !== item)
        : [...sec.picked, item];
      return { ...prev, [key]: { ...sec, picked } };
    });
  };

  const handleCustomChange = (key, val) => {
    setSelections(prev => ({ ...prev, [key]: { ...prev[key], custom: val } }));
  };

  const handleTogglePhoto = (url) => {
    setSelections(prev => ({
      ...prev,
      photos: prev.photos.includes(url)
        ? prev.photos.filter(u => u !== url)
        : [...prev.photos, url],
    }));
  };

  const SEL_META = [
    { key: 'colourPalette', icon: '🎨', label: 'Colour Palette' },
    { key: 'decoration',    icon: '✨', label: 'Decoration' },
    { key: 'food',          icon: '🍽️', label: 'Food & Snacks' },
    { key: 'entertainment', icon: '🎭', label: 'Entertainment' },
    { key: 'gifts',         icon: '🎁', label: 'Gifts' },
    { key: 'photography',   icon: '📸', label: 'Photography' },
  ];

  const handleProceed = async () => {
    const selLines = SEL_META.map(({ key, icon, label }) => {
      const { picked, custom } = selections[key];
      const all = [...picked, ...(custom.trim() ? [custom.trim()] : [])];
      return all.length ? `${icon} ${label}: ${all.join(', ')}` : null;
    }).filter(Boolean);

    const parts = [
      `Hi! I'm planning a ${occasion} with the "${theme.theme}" theme.`,
      '',
      '📋 Event Details:',
      pForm.date    ? `📅 Date: ${pForm.date}` : null,
      pForm.time    ? `🕐 Time: ${pForm.time}` : null,
      pForm.address ? `🏛️ Address: ${pForm.address}` : null,
      pForm.city    ? `📍 City: ${pForm.city}` : null,
      pForm.guests  ? `👥 Guests: ${pForm.guests}` : null,
      pForm.notes   ? `📝 Special Requests: ${pForm.notes}` : null,
      ...(selLines.length ? ['', '🎯 My Preferences:'] : []),
      ...selLines,
      ...(selections.photos.length ? [`🖼️ Sample decor photos: ${selections.photos.length} selected`] : []),
      ...(venuePhoto ? ['📷 Venue photo: Attached'] : []),
      '',
      'Can you help with planning, vendor booking, and coordination?',
    ].filter(l => l !== null).join('\n');

    if (!token) {
      try { sessionStorage.setItem('baat_karo_draft', parts); } catch {}
      if (venuePhoto) try { sessionStorage.setItem('baat_karo_venue_photo', venuePhoto); } catch {}
      onClose();
      navigate('/occasions/chat');
      return;
    }

    onClose();
    const hdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    try {
      const res = await fetch(`${BASE_URL}/conversations/baat-karo`, {
        method: 'POST', headers: hdrs, credentials: 'include',
        body: JSON.stringify({ message: parts, serviceType: 'Occasions' }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        const cid = data.conversationId;
        window.dispatchEvent(new CustomEvent("tendr:chat-started"));
        if (venuePhoto) {
          try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: 'POST', headers: hdrs, body: JSON.stringify({ sender: 'user', content: '📷 Venue / place photo:' }) }); } catch {}
          try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: 'POST', headers: hdrs, body: JSON.stringify({ sender: 'user', content: `[img:${venuePhoto}]` }) }); } catch {}
        }
        for (const url of selections.photos) {
          try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: 'POST', headers: hdrs, body: JSON.stringify({ sender: 'user', content: `[img:${url}]` }) }); } catch {}
        }
        openExistingChat(cid, { _id: null, name: 'Tendr Team', serviceType: 'Occasions', approved: false });
      }
    } catch (e) { console.error('OccasionPlanner chat failed:', e); }
  };

  const downloadPhoto = async (url, index) => {
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = `${theme.theme}-decor-${index + 1}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  };

  const photo = useUnsplashPhoto(theme.id, theme.theme, occasion, getThemePhoto(theme, occasion));

  useEffect(() => {
    const BASE = import.meta.env.VITE_BASE_URL;
    fetch(`${BASE}/theme-photos/${theme.id}`)
      .then(r => r.ok ? r.json() : {})
      .then(d => { if (Array.isArray(d.urls) && d.urls.length) setGalleryUrls(d.urls); })
      .catch(() => {});
  }, [theme.id]);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const scrollRef = useRef(null);

  const goPage = (dir) => {
    const next = pg + dir;
    if (next < 0 || next > 2) return;
    setAnimDir(dir > 0 ? 'fwd' : 'bwd');
    setPg(next);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const pageAnimClass = animDir ? `book-${animDir}` : '';
  const panelBg = (() => { const b = OCC_BG[occasion] || ['#1C0A04','#130600']; return `linear-gradient(160deg, ${b[0]} 0%, ${b[1]} 100%)`; })();
  const headerBg = (OCC_BG[occasion] || ['#1C0A04'])[0];

  const inputStyle = {
    padding: '12px 16px', borderRadius: 12,
    background: 'rgba(245,236,216,0.04)', border: `1px solid ${color}30`,
    color: '#F5ECD8', fontSize: 14, fontFamily: "'Outfit',sans-serif", fontWeight: 400, outline: 'none', width: '100%', boxSizing: 'border-box',
  };
  const selectStyle = {
    ...inputStyle,
    WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(245%2C236%2C216%2C0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40,
  };
  const labelStyle = { fontSize: 10.5, fontWeight: 500, color: 'rgba(245,236,216,0.65)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Outfit',sans-serif" };
  const optLabel = <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10 }}> (optional)</span>;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 10100,
      background: 'rgba(10,4,0,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
    }}>
      <div className="book-detail-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '100%' }}>
        <div className="book-detail-panel" onClick={e => e.stopPropagation()} style={{
          width: '100%', maxWidth: 680, maxHeight: '92vh',
          display: 'flex', flexDirection: 'column', position: 'relative',
          background: panelBg,
          border: `1px solid ${color}40`,
          borderRadius: 26, overflow: 'hidden',
          boxShadow: `0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px ${color}18`,
        }}>

          {/* Proceed Now form overlay */}
          {proceedFormOpen && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 30,
              background: panelBg,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Scrollable form area */}
              <div className="op-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 8px' }}>

                {/* Form header */}
                <button onClick={() => setProceedFormOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(245,236,216,0.62)', fontSize: 13, cursor: 'pointer', padding: '0 0 20px', fontFamily: "'Outfit',sans-serif", WebkitAppearance: 'none', appearance: 'none', textAlign: 'left', outline: 'none', letterSpacing: '0.02em' }}>← Back</button>

                <p style={{ fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 8px', fontFamily: "'Outfit',sans-serif" }}>Let's Plan</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.7rem,4vw,2.4rem)', fontWeight: 400, color: '#F5ECD8', margin: '0 0 8px', lineHeight: 1.1, letterSpacing: '0.01em' }}>{theme.theme}</h2>
                <p style={{ fontSize: 13.5, fontWeight: 400, color: 'rgba(245,236,216,0.70)', margin: '0 0 22px', fontFamily: "'Outfit',sans-serif", lineHeight: 1.65 }}>Share a few details so we can put together the perfect plan for you.</p>

                <div style={{ height: 1, background: `${color}20`, marginBottom: 22 }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Date + Time row */}
                  <div className="pf-datetime">
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <span style={labelStyle}>Event Date</span>
                      <input type="date" value={pForm.date} onChange={e => setPForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <span style={labelStyle}>Time</span>
                      <input type="time" value={pForm.time} onChange={e => setPForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} />
                    </label>
                  </div>

                  {/* Address */}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <span style={labelStyle}>Address{optLabel}</span>
                    <input type="text" placeholder="e.g. 12 Park Street, Sector 62" value={pForm.address} onChange={e => setPForm(f => ({ ...f, address: e.target.value }))} style={inputStyle} />
                  </label>

                  {/* City dropdown */}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <span style={labelStyle}>City</span>
                    <select value={pForm.city} onChange={e => setPForm(f => ({ ...f, city: e.target.value }))} style={selectStyle}>
                      <option value="" style={{ background: '#1C0A04' }}>Select your city</option>
                      {INDIAN_CITIES.map(c => <option key={c} value={c} style={{ background: '#1C0A04' }}>{c}</option>)}
                    </select>
                  </label>

                  {/* Guests */}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <span style={labelStyle}>How Many Guests?</span>
                    <input type="number" min="1" placeholder="e.g. 80" value={pForm.guests} onChange={e => setPForm(f => ({ ...f, guests: e.target.value }))} style={inputStyle} />
                  </label>

                  {/* Notes */}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <span style={labelStyle}>Special Requests{optLabel}</span>
                    <textarea rows={3} placeholder="e.g. outdoor setup, vegan menu, specific colour palette..." value={pForm.notes} onChange={e => setPForm(f => ({ ...f, notes: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 84 }} />
                  </label>

                  {/* Venue photo */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <span style={labelStyle}>Photo of your venue{optLabel}</span>
                    <input ref={venuePhotoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => setVenuePhoto(ev.target.result);
                      reader.readAsDataURL(file);
                    }} />
                    {venuePhoto ? (
                      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
                        <img src={venuePhoto} alt="Venue" style={{ width: '100%', maxHeight: 110, objectFit: 'cover', display: 'block' }} />
                        <button
                          onClick={() => { setVenuePhoto(null); if (venuePhotoInputRef.current) venuePhotoInputRef.current.value = ''; }}
                          style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif" }}
                        >✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => venuePhotoInputRef.current?.click()}
                        style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px dashed ${color}40`, background: `${color}06`, cursor: 'pointer', fontSize: 12, color: 'rgba(245,236,216,0.65)', fontWeight: 500, fontFamily: "'Outfit',sans-serif", textAlign: 'center' }}
                      >
                        Upload a photo →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky button — always visible at the bottom */}
              <div style={{ flexShrink: 0, padding: '14px 24px calc(18px + env(safe-area-inset-bottom, 0px))', background: panelBg, borderTop: `1px solid ${color}18` }}>
                <button onClick={handleProceed} style={{
                  width: '100%', padding: '15px 24px', borderRadius: 100,
                  background: `linear-gradient(135deg, ${color}, ${darken(color,22)})`,
                  color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Outfit',sans-serif", boxShadow: `0 5px 20px ${color}42`, letterSpacing: '0.02em',
                }}>Send to Baat Karo</button>
              </div>
            </div>
          )}

          {/* Header — always visible */}
          <div style={{
            flexShrink: 0, zIndex: 20,
            background: headerBg,
            padding: '14px 20px 6px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <PageDots current={pg} total={3} color={color} />
              <span style={{ fontSize: 10, color: 'rgba(245,236,216,0.52)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Outfit',sans-serif" }}>{PAGE_NAMES[pg]}</span>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(245,236,216,0.07)', border: '1px solid rgba(245,236,216,0.12)',
              color: 'rgba(245,236,216,0.85)', fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>✕</button>
          </div>

          {/* Scrollable page content */}
          <div ref={scrollRef} className="op-scroll" style={{ flex: 1, overflowY: 'auto' }}>
            <div key={pg} className={pageAnimClass} style={{ padding: '0 24px 8px' }}>
              {pg === 0 && <BookPage1 theme={theme} occasion={occasion} photo={photo} color={color} />}
              {pg === 1 && <BookPage2 theme={theme} color={color} selections={selections} onToggle={handleToggle} onCustomChange={handleCustomChange} />}
              {pg === 2 && <BookPage3 theme={theme} color={color} galleryUrls={galleryUrls} selectedPhotos={selections.photos} onTogglePhoto={handleTogglePhoto} onProceedNow={() => setProceedFormOpen(true)} onBrowseOtherThemes={onBrowseOtherThemes} />}
            </div>
          </div>

          {/* Navigation footer — always visible */}
          <div style={{
            flexShrink: 0,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 24px 26px',
            background: headerBg,
            borderTop: `1px solid ${color}14`,
          }}>
            <button onClick={() => goPage(-1)} disabled={pg === 0} style={{
              background: 'transparent', border: 'none', cursor: pg === 0 ? 'not-allowed' : 'pointer',
              color: pg === 0 ? 'rgba(245,236,216,0.18)' : 'rgba(245,236,216,0.65)',
              fontSize: 13, padding: '8px 0', fontFamily: "'Outfit',sans-serif",
              WebkitAppearance: 'none', appearance: 'none', outline: 'none',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>Previous</button>

            <span style={{ fontSize: 10, color: 'rgba(245,236,216,0.44)', fontFamily: "'Outfit',sans-serif" }}>{pg + 1} / 3</span>

            {pg < 2 ? (
              <button onClick={() => goPage(1)} style={{
                padding: '9px 22px', borderRadius: 100,
                background: `linear-gradient(135deg, ${color}, ${darken(color,20)})`,
                color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Outfit',sans-serif",
              }}>Next</button>
            ) : (
              <span style={{ fontSize: 10, color: `${color}88`, fontFamily: "'Outfit',sans-serif" }}>Last page</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Theme card (results grid) ─────────────────────────────────────────────

const BUDGET_BADGE_COLOR = {
  Luxury: '#A4728A', Premium: '#C47A2E', Standard: '#7A9A5A', Budget: '#8AB4A0',
  'Budget / Standard': '#8AB4A0',
};

function ThemeCard({ theme, occasion, onExpand, occColor }) {
  const photo = useUnsplashPhoto(theme.id, theme.theme, occasion, getThemePhoto(theme, occasion));
  const badgeColor = BUDGET_BADGE_COLOR[theme.budget] || occColor;

  return (
    <button className="op-theme-card" onClick={onExpand} style={{
      width: '100%', borderRadius: 14, overflow: 'hidden',
      border: `1.5px solid ${occColor}22`, cursor: 'pointer', padding: 0,
      background: 'rgba(245,236,216,0.03)',
      transition: 'all 0.22s', textAlign: 'left', display: 'block',
    }}>
      <div style={{ width: '100%', aspectRatio: '3/2', overflow: 'hidden', position: 'relative' }}>
        <img src={photo} alt={theme.theme}
          className="op-theme-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
          onError={e => { e.target.src = occFallback(occasion); }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', top: 8, right: 9 }}>
          <span style={{
            fontSize: 8.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            padding: '2px 9px', borderRadius: 100,
            background: `${badgeColor}28`, border: `1px solid ${badgeColor}50`,
            color: badgeColor, backdropFilter: 'blur(8px)',
            fontFamily: "'Outfit',sans-serif",
          }}>{theme.budget}</span>
        </div>
      </div>
      <div style={{ padding: '11px 13px 13px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#F5ECD8', lineHeight: 1.25, fontFamily: "'Cormorant Garamond',serif", marginBottom: theme.oneLineDesc ? 3 : 0 }}>{theme.theme}</div>
          {theme.oneLineDesc && (
            <div style={{ fontSize: 11, color: 'rgba(245,236,216,0.46)', fontFamily: "'Outfit',sans-serif", lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{theme.oneLineDesc}</div>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={occColor} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 3, opacity: 0.7 }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </button>
  );
}

// ── Main OccasionPlanner component ────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function OccasionPlanner({ initialOccasion, onClose }) {
  const fromCard = !!initialOccasion;
  const navigate = useNavigate();
  const { token } = useSelector(s => s.auth);
  const { openExistingChat } = useChatOverlay();
  const [existingChat, setExistingChat] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/conversations`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then(r => r.ok ? r.json() : { conversations: [] })
      .then(data => {
        const found = (data.conversations || []).find(c => c.serviceType === 'Occasions' && !c.vendorId);
        if (found) setExistingChat(found);
      }).catch(() => {});
  }, [token]);

  const [step,      setStep]      = useState(fromCard ? 0.5 : 0);
  const [occasion,  setOccasion]  = useState(initialOccasion || null);
  const [budget,    setBudget]    = useState(null);
  const [guests,    setGuests]    = useState('');
  const [venue,     setVenue]     = useState(null);
  const [timeOfDay, setTimeOfDay] = useState(null);
  const [showAll,   setShowAll]   = useState(false);
  const [expandedTheme, setExpandedTheme] = useState(null);

  const occColor = OCC_COLOR[occasion] || FALLBACK_COLOR;

  const results = step === 5 && occasion
    ? (showAll ? (THEME_DATA_MAP[occasion] || []) : getFiltered(occasion, { budget, guests, venue, timeOfDay }))
    : [];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && !expandedTheme) onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [expandedTheme, onClose]);

  const goNext = (n) => setStep(s => n !== undefined ? n : s + 1);
  const goBack = () => {
    setShowAll(false);
    if (step === 0.5) { if (fromCard) { onClose(); return; } setStep(0); return; }
    if (step === 1 && fromCard) { setStep(0.5); return; }
    setStep(s => s - 1);
  };
  const adjustFilters = () => { setShowAll(false); setStep(1); };
  const restart = () => { setBudget(null); setGuests(''); setVenue(null); setTimeOfDay(null); setShowAll(false); setStep(fromCard ? 0.5 : 0); if (!fromCard) setOccasion(null); };

  // Form option button shared style
  const optStyle = (selected) => ({
    padding: '18px 15px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
    border: `1.5px solid ${selected ? occColor + 'BB' : 'rgba(245,236,216,0.1)'}`,
    background: selected ? `${occColor}1A` : 'rgba(245,236,216,0.04)',
    boxShadow: selected ? `0 0 0 1px ${occColor}22, 0 4px 22px ${occColor}1E` : 'none',
    transition: 'all 0.2s', fontFamily: "'Outfit',sans-serif",
  });

  const occBg = OCC_BG[occasion] || ['#1C0A04', '#130600'];
  const occBgGradient = `linear-gradient(160deg, ${occBg[0]} 0%, ${occBg[1]} 100%)`;

  const h2Style = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 'clamp(2rem,4.5vw,2.8rem)', fontWeight: 400,
    color: '#F5ECD8', margin: '0 0 8px', letterSpacing: '0.01em',
  };
  const subStyle = { fontSize: 15, color: 'rgba(245,236,216,0.92)', margin: '0 0 22px', fontFamily: "'Outfit',sans-serif" };

  return (
    <>
      <style>{CSS}</style>

      {/* Backdrop */}
      <div className="op-rise" onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        background: 'rgba(10,4,0,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px', overflowY: 'auto',
      }}>
        <div className="op-overlay-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '100%' }}>

          {existingChat && (
            <div style={{ width: '100%', maxWidth: 640, marginBottom: 10 }}>
              <button
                onClick={() => { openExistingChat(existingChat._id, { _id: null, name: 'Tendr Team', serviceType: 'Occasions', approved: true }); onClose(); }}
                style={{ width: '100%', background: 'rgba(196,122,46,0.2)', border: '1.5px solid rgba(196,122,46,0.5)', borderRadius: 12, padding: '10px 16px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left', fontFamily: "'Outfit',sans-serif" }}
              >
                You have an active Occasions chat &nbsp;→ Resume Chat
              </button>
            </div>
          )}

          {/* Panel */}
          <div className="op-panel op-scroll" onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
            background: occBgGradient,
            border: `1px solid ${occColor}3A`,
            borderRadius: 26,
            fontFamily: "'Outfit',sans-serif",
            boxShadow: `0 36px 110px rgba(0,0,0,0.78), 0 0 0 1px ${occColor}18`,
            position: 'relative',
          }}>
            {/* Top ambient glow hairline */}
            <div aria-hidden style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '55%', height: 1, background: `linear-gradient(90deg, transparent, ${occColor}70, transparent)`, pointerEvents: 'none', zIndex: 1 }} />

            {/* Close */}
            <button onClick={onClose} style={{
              position: 'absolute', top: 16, right: 16, zIndex: 20,
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(245,236,216,0.07)', border: '1px solid rgba(245,236,216,0.12)',
              color: 'rgba(245,236,216,0.82)', fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>✕</button>

            {/* Progress bar — steps 1-4 */}
            {step >= 1 && step <= 4 && (
              <div style={{ padding: '18px 22px 0' }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 7 }}>
                  {[1,2,3,4].map(s => (
                    <div key={s} style={{
                      flex: 1, height: 2.5, borderRadius: 2,
                      background: s <= step ? occColor : 'rgba(245,236,216,0.1)',
                      transition: 'background 0.32s',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex' }}>
                  {['Budget', 'Guests', 'Venue', 'Time'].map((lbl, i) => (
                    <span key={lbl} style={{
                      flex: 1, fontSize: 8.5, fontFamily: "'Outfit',sans-serif",
                      color: (i + 1) <= step ? occColor : 'rgba(245,236,216,0.22)',
                      textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
                      textAlign: 'center', transition: 'color 0.32s',
                    }}>{lbl}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Step content ─── */}
            <div key={step} className="op-step" style={{ padding: '26px 24px 32px' }}>

              {/* Step 0 — Occasion picker */}
              {step === 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: FALLBACK_COLOR, textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 8px', fontFamily: "'Outfit',sans-serif" }}>Plan your event</p>
                  <h2 style={h2Style}>What's the occasion?</h2>
                  <p style={subStyle}>Choose your celebration to get started</p>
                  <div className="op-picker-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {OCCASIONS_LIST.map(({ label, photo }) => (
                      <button key={label} className="op-occ-card op-picker-card" onClick={() => { setOccasion(label); goNext(0.5); }}
                        style={{
                          position: 'relative', height: 112, borderRadius: 14,
                          overflow: 'hidden', border: '1.5px solid rgba(245,236,216,0.06)',
                          cursor: 'pointer', padding: 0, background: '#160800',
                          transition: 'transform 0.22s, box-shadow 0.22s, border-color 0.22s',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.52)',
                        }}>
                        <img src={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.82, transition: 'transform 0.4s, opacity 0.22s' }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.14) 52%, transparent 100%)',
                          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '8px 8px',
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#F5ECD8', lineHeight: 1.2, fontFamily: "'Outfit',sans-serif", letterSpacing: '0.01em' }}>{label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 0.5 — Plan with / without theme */}
              {step === 0.5 && (
                <div>
                  <button onClick={() => setStep(0)} style={{ background: 'transparent', border: 'none', color: 'rgba(245,236,216,0.6)', fontSize: 13, cursor: 'pointer', padding: '0 0 20px', fontFamily: "'Outfit',sans-serif", WebkitAppearance: 'none', appearance: 'none', outline: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Back
                  </button>
                  <p style={{ fontSize: 10, fontWeight: 800, color: occColor, textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 8px', fontFamily: "'Outfit',sans-serif" }}>Plan your {occasion}</p>
                  <h2 style={{ ...h2Style, marginBottom: 24 }}>How would you<br/>like to plan?</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Primary: Plan with Theme */}
                    <button onClick={() => goNext(1)}
                      style={{
                        padding: '22px 20px', borderRadius: 18, textAlign: 'left', cursor: 'pointer',
                        border: `1.5px solid ${occColor}55`,
                        background: `linear-gradient(135deg, ${occColor}16 0%, ${occColor}06 100%)`,
                        transition: 'all 0.2s', fontFamily: "'Outfit',sans-serif",
                        position: 'relative', overflow: 'hidden',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${occColor}85`; e.currentTarget.style.background = `linear-gradient(135deg, ${occColor}22 0%, ${occColor}0D 100%)`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${occColor}55`; e.currentTarget.style.background = `linear-gradient(135deg, ${occColor}16 0%, ${occColor}06 100%)`; }}
                    >
                      {/* Decorative concentric rings top-right */}
                      <div aria-hidden style={{ position: 'absolute', top: -32, right: -32, width: 100, height: 100, borderRadius: '50%', border: `1px solid ${occColor}18`, pointerEvents: 'none' }} />
                      <div aria-hidden style={{ position: 'absolute', top: -16, right: -16, width: 64, height: 64, borderRadius: '50%', border: `1px solid ${occColor}12`, pointerEvents: 'none' }} />

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, background: `${occColor}1C`, border: `1px solid ${occColor}38`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={occColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 19, fontWeight: 500, color: '#F5ECD8', marginBottom: 5, fontFamily: "'Cormorant Garamond',serif", letterSpacing: '0.01em', lineHeight: 1.15 }}>Plan with Theme</div>
                          <div style={{ fontSize: 13, fontWeight: 400, color: 'rgba(245,236,216,0.70)', lineHeight: 1.6 }}>Browse curated themes and get tailored vendor suggestions for your event</div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={occColor} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 15, opacity: 0.75 }}>
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </div>

                      <div style={{ display: 'flex', gap: 7, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${occColor}18` }}>
                        {['Curated Themes', 'Vendor Match', 'Full Planning'].map((tag, i) => (
                          <span key={i} style={{ fontSize: 9.5, padding: '3px 10px', borderRadius: 100, background: `${occColor}10`, border: `1px solid ${occColor}28`, color: occColor, fontFamily: "'Outfit',sans-serif", fontWeight: 600, letterSpacing: '0.04em' }}>{tag}</span>
                        ))}
                      </div>
                    </button>

                    {/* Secondary: Plan without Theme */}
                    <button onClick={() => { onClose(); navigate('/booking'); }}
                      style={{
                        padding: '18px 20px', borderRadius: 18, textAlign: 'left', cursor: 'pointer',
                        border: '1px solid rgba(245,236,216,0.1)', background: 'rgba(245,236,216,0.03)',
                        transition: 'all 0.18s', fontFamily: "'Outfit',sans-serif",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,236,216,0.2)'; e.currentTarget.style.background = 'rgba(245,236,216,0.055)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,236,216,0.1)'; e.currentTarget.style.background = 'rgba(245,236,216,0.03)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(245,236,216,0.06)', border: '1px solid rgba(245,236,216,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(245,236,216,0.48)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 17, fontWeight: 400, color: 'rgba(245,236,216,0.82)', marginBottom: 3, fontFamily: "'Cormorant Garamond',serif", letterSpacing: '0.01em', lineHeight: 1.2 }}>Plan without Theme</div>
                          <div style={{ fontSize: 12.5, fontWeight: 400, color: 'rgba(245,236,216,0.44)', lineHeight: 1.5 }}>Browse vendors directly, get quotes, and finalise</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,236,216,0.25)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1 — Budget */}
              {step === 1 && (
                <div>
                  <Breadcrumb occasion={occasion} current="Budget" color={occColor} />
                  <h2 style={h2Style}>What's your budget?</h2>
                  <p style={subStyle}>Pick your range</p>
                  <div className="op-2col-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 11 }}>
                    {BUDGET_OPTIONS.map(({ key, label, desc, stars }) => (
                      <button key={key} onClick={() => { setBudget(key); setTimeout(() => goNext(), 260); }}
                        style={optStyle(budget === key)}>
                        <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
                          {[1,2,3,4].map(s => (
                            <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: s <= stars ? occColor : 'rgba(245,236,216,0.12)', transition: 'background 0.2s' }} />
                          ))}
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 400, color: '#F5ECD8', marginBottom: 5, fontFamily: "'Cormorant Garamond',serif", letterSpacing: '0.01em' }}>{label}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 400, color: 'rgba(245,236,216,0.82)', lineHeight: 1.5 }}>{desc}</div>
                      </button>
                    ))}
                  </div>
                  <NavRow onBack={goBack} onNext={budget ? () => goNext() : null} color={occColor} />
                </div>
              )}

              {/* Step 2 — Guests */}
              {step === 2 && (
                <div>
                  <Breadcrumb occasion={occasion} current="Guests" color={occColor} />
                  <h2 style={h2Style}>How many guests?</h2>
                  <p style={subStyle}>Rough number is fine</p>
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <input
                      type="number" min="1" max="1000" placeholder="e.g. 50"
                      value={guests} onChange={e => setGuests(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && guests && goNext()}
                      autoFocus
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '18px 90px 18px 22px',
                        fontSize: 32, fontWeight: 700,
                        background: 'rgba(245,236,216,0.05)', border: `1.5px solid ${occColor}40`,
                        borderRadius: 16, color: '#F5ECD8', outline: 'none', fontFamily: "'Outfit',sans-serif",
                        letterSpacing: '-0.01em',
                      }}
                    />
                    <span style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'rgba(245,236,216,0.40)', pointerEvents: 'none', fontFamily: "'Outfit',sans-serif", fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>guests</span>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
                    {['10','25','50','100','150','250'].map(g => (
                      <button key={g} onClick={() => setGuests(g)} style={{
                        padding: '8px 15px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: guests === g ? `${occColor}1E` : 'rgba(245,236,216,0.05)',
                        border: `1.5px solid ${guests === g ? occColor + 'BB' : 'rgba(245,236,216,0.1)'}`,
                        color: guests === g ? occColor : 'rgba(245,236,216,0.62)',
                        boxShadow: guests === g ? `0 0 0 1px ${occColor}1A` : 'none',
                        transition: 'all 0.18s', fontFamily: "'Outfit',sans-serif",
                      }}>{g}</button>
                    ))}
                  </div>
                  <NavRow onBack={goBack} onNext={guests ? () => goNext() : null} nextLabel="Continue" color={occColor} />
                </div>
              )}

              {/* Step 3 — Venue */}
              {step === 3 && (
                <div>
                  <Breadcrumb occasion={occasion} current="Venue" color={occColor} />
                  <h2 style={h2Style}>Where is the event?</h2>
                  <p style={subStyle}>Pick your venue type</p>
                  <div className="op-2col-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 11, marginBottom: 20 }}>
                    {VENUE_OPTIONS.map(({ key, label, desc }) => {
                      const sel = venue === key;
                      return (
                        <button key={key} onClick={() => { setVenue(key); setTimeout(() => goNext(), 260); }}
                          style={optStyle(sel)}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: sel ? `${occColor}22` : 'rgba(245,236,216,0.07)', border: `1px solid ${sel ? occColor + '45' : 'rgba(245,236,216,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, transition: 'all 0.18s' }}>
                            {venueIcon(key, sel ? occColor : 'rgba(245,236,216,0.5)')}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 400, color: '#F5ECD8', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.2, marginBottom: 3 }}>{label}</div>
                          {desc && <div style={{ fontSize: 11, color: 'rgba(245,236,216,0.46)', fontFamily: "'Outfit',sans-serif", lineHeight: 1.35 }}>{desc}</div>}
                        </button>
                      );
                    })}
                  </div>
                  <NavRow onBack={goBack} onNext={venue ? () => goNext() : null} color={occColor} />
                </div>
              )}

              {/* Step 4 — Time */}
              {step === 4 && (
                <div>
                  <Breadcrumb occasion={occasion} current="Time" color={occColor} />
                  <h2 style={h2Style}>When is the celebration?</h2>
                  <p style={subStyle}>Choose a time slot</p>
                  <div className="op-2col-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 11, marginBottom: 20 }}>
                    {TIME_OPTIONS.map(({ key, label, desc }) => (
                      <button key={key} onClick={() => { setTimeOfDay(key); setTimeout(() => goNext(5), 260); }}
                        style={optStyle(timeOfDay === key)}>
                        <div style={{ width: 26, height: 26, marginBottom: 8, color: timeOfDay === key ? occColor : 'rgba(245,236,216,0.5)', display: 'flex' }}>{timeIcon(key)}</div>
                        <div style={{ fontSize: 17, fontWeight: 400, color: '#F5ECD8', marginBottom: 4, fontFamily: "'Cormorant Garamond',serif", letterSpacing: '0.01em' }}>{label}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 400, color: 'rgba(245,236,216,0.82)' }}>{desc}</div>
                      </button>
                    ))}
                  </div>
                  <NavRow onBack={goBack} onNext={timeOfDay ? () => goNext(5) : null} nextLabel="See themes" color={occColor} />
                </div>
              )}

              {/* Step 5 — Results */}
              {step === 5 && (
                <div>
                  {/* Header */}
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: occColor, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 6px', fontFamily: "'Outfit',sans-serif" }}>
                      {showAll ? `All ${results.length} themes` : `${results.length} theme${results.length !== 1 ? 's' : ''} matched`}
                    </p>
                    <h2 style={{ ...h2Style, margin: '0 0 10px' }}>
                      {showAll ? `All ${occasion} Themes` : `${occasion} themes for you`}
                    </h2>
                    {!showAll && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {budget    && <span style={{ fontSize: 11, padding: '4px 11px', borderRadius: 100, background: `${occColor}18`, border: `1px solid ${occColor}44`, color: occColor, fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>{BUDGET_OPTIONS.find(b => b.key === budget)?.label}</span>}
                        {guests    && <span style={{ fontSize: 11, padding: '4px 11px', borderRadius: 100, background: 'rgba(245,236,216,0.07)', border: '1px solid rgba(245,236,216,0.14)', color: 'rgba(245,236,216,0.80)', fontFamily: "'Outfit',sans-serif" }}>{guests} guests</span>}
                        {venue     && <span style={{ fontSize: 11, padding: '4px 11px', borderRadius: 100, background: 'rgba(245,236,216,0.07)', border: '1px solid rgba(245,236,216,0.14)', color: 'rgba(245,236,216,0.80)', fontFamily: "'Outfit',sans-serif" }}>{VENUE_OPTIONS.find(v => v.key === venue)?.label}</span>}
                        {timeOfDay && <span style={{ fontSize: 11, padding: '4px 11px', borderRadius: 100, background: 'rgba(245,236,216,0.07)', border: '1px solid rgba(245,236,216,0.14)', color: 'rgba(245,236,216,0.80)', fontFamily: "'Outfit',sans-serif" }}>{timeOfDay}</span>}
                      </div>
                    )}
                  </div>

                  {results.length > 0 ? (
                    <div className="op-theme-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                      {results.map(theme => (
                        <ThemeCard key={theme.id} theme={theme} occasion={occasion} occColor={occColor} onExpand={() => setExpandedTheme(theme)} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                      <div style={{ fontSize: 36, opacity: 0.25, marginBottom: 10 }}>✦</div>
                      <p style={{ color: 'rgba(245,236,216,0.56)', fontSize: 14, fontFamily: "'Outfit',sans-serif" }}>No themes matched — try adjusting your filters</p>
                    </div>
                  )}

                  {/* Action buttons below results */}
                  <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                    {!showAll && (
                      <button onClick={() => setShowAll(true)} style={{
                        width: '100%', padding: '12px 20px', borderRadius: 12,
                        background: `${occColor}14`, border: `1.5px solid ${occColor}38`,
                        color: occColor, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: "'Outfit',sans-serif", transition: 'all 0.18s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}>
                        See all {occasion} themes →
                      </button>
                    )}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <button onClick={adjustFilters} style={{ background: 'none', border: 'none', color: 'rgba(245,236,216,0.62)', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", textDecoration: 'underline', textUnderlineOffset: 3 }}>
                        Adjust filters
                      </button>
                      <span style={{ color: 'rgba(245,236,216,0.18)' }}>·</span>
                      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(245,236,216,0.62)', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", textDecoration: 'underline', textUnderlineOffset: 3 }}>
                        Continue without theme
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>{/* /step content */}
          </div>
        </div>
      </div>

      {/* Book detail carousel overlay */}
      {expandedTheme && (
        <BookDetail
          theme={expandedTheme}
          occasion={occasion}
          onClose={() => setExpandedTheme(null)}
          onBrowseOtherThemes={() => { setExpandedTheme(null); setShowAll(true); }}
        />
      )}
    </>
  );
}

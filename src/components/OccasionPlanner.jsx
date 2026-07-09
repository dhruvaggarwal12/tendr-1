import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  { key: 'Morning',   label: 'Morning',   desc: '8 am – 12 pm', icon: '🌅' },
  { key: 'Afternoon', label: 'Afternoon', desc: '12 pm – 4 pm', icon: '☀️' },
  { key: 'Evening',   label: 'Evening',   desc: '4 pm – 8 pm',  icon: '🌆' },
  { key: 'Night',     label: 'Night',     desc: '8 pm onwards', icon: '🌙' },
];

const PAGE_NAMES = ['Overview', 'The Details', 'Checklist & Decor'];

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
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
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

  .op-occ-card:hover  { transform:translateY(-5px) scale(1.03) !important; box-shadow:0 14px 40px rgba(0,0,0,0.5) !important; }
  .op-theme-card:hover{ background:rgba(245,236,216,0.07) !important; }

  .op-opt:hover { opacity:0.95; }

  @media (max-width:600px) {
    .op-panel        { border-radius:22px 22px 0 0 !important; max-height:93vh !important; margin-top:auto; }
    .op-overlay-wrap { align-items:flex-end !important; padding:0 !important; }
    .op-picker-grid  { gap:7px !important; }
    .op-picker-card  { height:78px !important; }
    .op-2col-form    { grid-template-columns:1fr 1fr !important; }
    .book-detail-panel{ border-radius:20px 20px 0 0 !important; max-height:96vh !important; margin-top:auto; }
    .book-detail-wrap { align-items:flex-end !important; padding:0 !important; }
    .book-detail-col  { grid-template-columns:1fr !important; }
    .book-photo-grid  { grid-template-columns:repeat(2,1fr) !important; }
    .book-hero-img    { height:190px !important; }
    .book-title       { font-size:1.7rem !important; }
    .op-theme-grid    { grid-template-columns:1fr !important; }
    .pf-datetime      { grid-template-columns:1fr !important; }
  }
`;

// ── Helper components ─────────────────────────────────────────────────────

function SectionLabel({ color, children }) {
  return (
    <h4 style={{
      fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
      margin: '0 0 10px', color: color || FALLBACK_COLOR,
      fontFamily: "'Outfit', sans-serif",
    }}>{children}</h4>
  );
}

function StatTile({ label, value, color }) {
  return (
    <div style={{
      padding: '12px 10px', borderRadius: 12, textAlign: 'center',
      background: `${color}12`, border: `1px solid ${color}28`,
    }}>
      <div style={{ fontSize: 11, color: `${color}CC`, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 5, fontFamily: "'Outfit',sans-serif" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#F5ECD8', lineHeight: 1.3, fontFamily: "'Outfit',sans-serif" }}>{value}</div>
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
          <span style={{ color, fontSize: 7, marginTop: 5, flexShrink: 0 }}>◆</span>
          <span style={{ fontSize: 13, color: 'rgba(245,236,216,0.88)', lineHeight: 1.6, fontFamily: "'Outfit',sans-serif" }}>{item}</span>
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'rgba(245,236,216,0.55)', fontSize: 15, cursor: 'pointer', padding: '8px 0', fontFamily: "'Outfit',sans-serif", WebkitAppearance: 'none', appearance: 'none', outline: 'none' }}>Back</button>
      {onNext && (
        <button onClick={onNext} style={{ padding: '12px 30px', borderRadius: 100, background: color || FALLBACK_COLOR, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", boxShadow: `0 4px 14px ${color||FALLBACK_COLOR}44` }}>
          {nextLabel}
        </button>
      )}
    </div>
  );
}

function Breadcrumb({ occasion, current, color }) {
  if (!occasion) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
      <span style={{ fontSize: 12, color: 'rgba(245,236,216,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Outfit',sans-serif" }}>{occasion}</span>
      <span style={{ color: 'rgba(245,236,216,0.3)', fontSize: 14 }}>›</span>
      <span style={{ fontSize: 12, color, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>{current}</span>
    </div>
  );
}

function OptButton({ selected, color, onClick, children, className = 'op-opt' }) {
  return (
    <button className={className} onClick={onClick} style={{
      padding: '18px 15px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
      border: `1.5px solid ${selected ? color : 'rgba(245,236,216,0.12)'}`,
      background: selected ? `${color}1C` : 'rgba(245,236,216,0.04)',
      transition: 'all 0.18s', fontFamily: "'Outfit',sans-serif",
    }}>
      {children}
    </button>
  );
}

// ── Book carousel pages ───────────────────────────────────────────────────

function BookPage1({ theme, occasion, photo, color }) {
  return (
    <div>
      {/* Full-bleed hero — negative margin to cancel parent padding */}
      <div className="book-hero-img" style={{ margin: '0 -24px', height: 250, position: 'relative', overflow: 'hidden' }}>
        <img src={photo} alt={theme.theme} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.src = occFallback(occasion); }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, #1A0902 0%, rgba(26,9,2,0.5) 45%, transparent 100%)` }} />
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
          <p style={{ fontSize: 13, color: 'rgba(245,236,216,0.82)', margin: 0, fontStyle: 'italic', fontFamily: "'Cormorant Garamond',serif", letterSpacing: '0.02em' }}>{theme.oneLineDesc}</p>
        </div>
      </div>

      <div style={{ paddingTop: 22 }}>
        {/* Overview */}
        {theme.overview && (
          <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, color: 'rgba(245,236,216,0.82)', lineHeight: 1.85, margin: '0 0 22px', borderLeft: `3px solid ${color}40`, paddingLeft: 14 }}>{theme.overview}</p>
        )}

        {/* Colour palette */}
        {theme.colourPalette?.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <SectionLabel color={color}>Colour Palette</SectionLabel>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 4 }}>
              {theme.colourPalette.map(c => (
                <span key={c} style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, background: `${color}14`, border: `1px solid ${color}35`, color: 'rgba(245,236,216,0.8)', fontFamily: "'Outfit',sans-serif" }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          <StatTile label="Guests" value={theme.recommendedGuests} color={color} />
          <StatTile label="Budget" value={theme.budget} color={color} />
          <StatTile label="Best Time" value={(theme.bestTime||[]).join(' · ')} color={color} />
        </div>
      </div>
    </div>
  );
}

function BookPage2({ theme, color }) {
  const food = theme.foodSuggestions || theme.foodIdeas || [];
  const col1 = [
    { title: 'Decoration Ideas',  items: theme.decorationIdeas },
    { title: 'Food & Drinks',     items: food },
    { title: 'Entertainment',     items: theme.entertainment },
  ];
  const col2 = [
    { title: 'Games & Activities', items: theme.gamesActivities },
    { title: 'Cake Ideas',         items: theme.cakeIdeas || theme.returnGiftIdeas },
    { title: 'Photography Tips',   items: theme.photographyIdeas },
  ];

  return (
    <div style={{ paddingTop: 8 }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.7rem,4vw,2.2rem)', fontWeight: 400, color: '#F5ECD8', margin: '0 0 18px', letterSpacing: '0.01em', borderBottom: `1px solid ${color}22`, paddingBottom: 10 }}>
        What's Included
      </h3>
      <div className="book-detail-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <div>
          {col1.map(({ title, items }) => items?.length > 0 && (
            <div key={title} style={{ marginBottom: 22 }}>
              <SectionLabel color={color}>{title}</SectionLabel>
              <BulletList items={items} color={color} max={5} />
            </div>
          ))}
        </div>
        <div>
          {col2.map(({ title, items }) => items?.length > 0 && (
            <div key={title} style={{ marginBottom: 22 }}>
              <SectionLabel color={color}>{title}</SectionLabel>
              <BulletList items={items} color={color} max={5} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookPage3({ theme, color, galleryUrls = [], downloadPhoto, onProceedNow, onBrowseOtherThemes }) {
  return (
    <div style={{ paddingTop: 8 }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.7rem,4vw,2.2rem)', fontWeight: 400, color: '#F5ECD8', margin: '0 0 18px', letterSpacing: '0.01em', borderBottom: `1px solid ${color}22`, paddingBottom: 10 }}>
        Plan & Decor
      </h3>

      {/* Planning checklist */}
      {theme.planningChecklist?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionLabel color={color}>Planning Checklist</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
            {theme.planningChecklist.map((item, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 100, fontSize: 11,
                background: `${color}12`, border: `1px solid ${color}2E`,
                color: 'rgba(245,236,216,0.72)', fontFamily: "'Outfit',sans-serif",
              }}>
                <span style={{ color, fontSize: 8 }}>✓</span>{item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Decor photos with download */}
      {galleryUrls.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionLabel color={color}>Suggested Decor Photos</SectionLabel>
          <div className="book-photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
            {galleryUrls.slice(0, 6).map((url, i) => (
              <div key={i} style={{ aspectRatio: '4/3', borderRadius: 11, overflow: 'hidden', background: `${color}0A`, position: 'relative' }}
                onMouseEnter={e => e.currentTarget.querySelector('.dl-btn').style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.querySelector('.dl-btn').style.opacity = '0'}>
                <img src={url} alt="" loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button className="dl-btn"
                  onClick={() => downloadPhoto && downloadPhoto(url, i)}
                  style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: 0, transition: 'opacity 0.18s', fontFamily: "'Outfit',sans-serif", backdropFilter: 'blur(4px)' }}>
                  ↓ Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 18, borderTop: `1px solid ${color}18` }}>
        <button onClick={onProceedNow} style={{
          flex: 1, minWidth: 130, padding: '14px 20px', borderRadius: 100,
          background: `linear-gradient(135deg, ${color}, ${darken(color,22)})`,
          color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: "'Outfit',sans-serif", boxShadow: `0 5px 18px ${color}45`,
        }}>Proceed Now</button>
        <button onClick={onBrowseOtherThemes} style={{
          flex: 1, minWidth: 130, padding: '14px 20px', borderRadius: 100,
          background: 'rgba(245,236,216,0.05)', color: 'rgba(245,236,216,0.52)',
          border: '1px solid rgba(245,236,216,0.12)', fontSize: 14, cursor: 'pointer',
          fontFamily: "'Outfit',sans-serif",
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
  const navigate = useNavigate();

  const color = themeAccentColor(theme.id);

  const handleProceed = () => {
    const parts = [
      `Hi! I'm planning a ${occasion} with the "${theme.theme}" theme.`,
      pForm.date    ? `📅 Date: ${pForm.date}` : null,
      pForm.time    ? `🕐 Time: ${pForm.time}` : null,
      pForm.address ? `🏛️ Address: ${pForm.address}` : null,
      pForm.city    ? `📍 City: ${pForm.city}` : null,
      pForm.guests  ? `👥 Guests: ${pForm.guests}` : null,
      pForm.notes   ? `📝 Notes: ${pForm.notes}` : null,
      `\nCan you help with decor, vendor suggestions, and planning?`,
    ].filter(Boolean).join('\n');
    try { sessionStorage.setItem('baat_karo_draft', parts); } catch {}
    onClose();
    navigate('/baat-karo');
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

  const goPage = (dir) => {
    const next = pg + dir;
    if (next < 0 || next > 2) return;
    setAnimDir(dir > 0 ? 'fwd' : 'bwd');
    setPg(next);
  };

  const pageAnimClass = animDir ? `book-${animDir}` : '';
  const panelBg = (() => { const b = OCC_BG[occasion] || ['#1C0A04','#130600']; return `linear-gradient(160deg, ${b[0]} 0%, ${b[1]} 100%)`; })();
  const headerBg = (OCC_BG[occasion] || ['#1C0A04'])[0];

  const inputStyle = {
    padding: '12px 16px', borderRadius: 12,
    background: 'rgba(245,236,216,0.05)', border: `1.5px solid ${color}35`,
    color: '#F5ECD8', fontSize: 15, fontFamily: "'Outfit',sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box',
  };
  const selectStyle = {
    ...inputStyle,
    WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(245%2C236%2C216%2C0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40,
  };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: 'rgba(245,236,216,0.48)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Outfit',sans-serif" };
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
            <div className="op-scroll" style={{
              position: 'absolute', inset: 0, zIndex: 30,
              background: panelBg,
              display: 'flex', flexDirection: 'column',
              padding: '22px 20px 52px',
              overflowY: 'auto',
            }}>
              <button onClick={() => setProceedFormOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(245,236,216,0.55)', fontSize: 15, cursor: 'pointer', padding: '0 0 18px', fontFamily: "'Outfit',sans-serif", WebkitAppearance: 'none', appearance: 'none', textAlign: 'left', outline: 'none' }}>Back</button>
              <p style={{ fontSize: 10, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 6px', fontFamily: "'Outfit',sans-serif" }}>Let's Plan</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 400, color: '#F5ECD8', margin: '0 0 6px' }}>{theme.theme}</h2>
              <p style={{ fontSize: 14, color: 'rgba(245,236,216,0.58)', margin: '0 0 24px', fontFamily: "'Outfit',sans-serif" }}>Share a few details so we can curate the perfect plan for you.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Date + Time row */}
                <div className="pf-datetime">
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={labelStyle}>Event Date</span>
                    <input type="date" value={pForm.date} onChange={e => setPForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={labelStyle}>Time</span>
                    <input type="time" value={pForm.time} onChange={e => setPForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} />
                  </label>
                </div>

                {/* Address */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={labelStyle}>Address{optLabel}</span>
                  <input type="text" placeholder="e.g. 12 Park Street, Sector 62" value={pForm.address} onChange={e => setPForm(f => ({ ...f, address: e.target.value }))} style={inputStyle} />
                </label>

                {/* City dropdown */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={labelStyle}>City</span>
                  <select value={pForm.city} onChange={e => setPForm(f => ({ ...f, city: e.target.value }))} style={selectStyle}>
                    <option value="" style={{ background: '#1C0A04' }}>Select your city</option>
                    {INDIAN_CITIES.map(c => <option key={c} value={c} style={{ background: '#1C0A04' }}>{c}</option>)}
                  </select>
                </label>

                {/* Guests */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={labelStyle}>How Many Guests?</span>
                  <input type="number" min="1" placeholder="e.g. 80" value={pForm.guests} onChange={e => setPForm(f => ({ ...f, guests: e.target.value }))} style={inputStyle} />
                </label>

                {/* Notes */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={labelStyle}>Special Requests{optLabel}</span>
                  <textarea rows={3} placeholder="e.g. outdoor setup, vegan menu, specific colour palette..." value={pForm.notes} onChange={e => setPForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 76 }} />
                </label>
              </div>

              <button onClick={handleProceed} style={{
                marginTop: 22, padding: '14px 24px', borderRadius: 100,
                background: `linear-gradient(135deg, ${color}, ${darken(color,22)})`,
                color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Outfit',sans-serif", boxShadow: `0 5px 18px ${color}45`,
              }}>Send to Baat Karo</button>
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
              <span style={{ fontSize: 10, color: 'rgba(245,236,216,0.35)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Outfit',sans-serif" }}>{PAGE_NAMES[pg]}</span>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(245,236,216,0.07)', border: '1px solid rgba(245,236,216,0.12)',
              color: 'rgba(245,236,216,0.65)', fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>✕</button>
          </div>

          {/* Scrollable page content */}
          <div className="op-scroll" style={{ flex: 1, overflowY: 'auto' }}>
            <div key={pg} className={pageAnimClass} style={{ padding: '0 24px 8px' }}>
              {pg === 0 && <BookPage1 theme={theme} occasion={occasion} photo={photo} color={color} />}
              {pg === 1 && <BookPage2 theme={theme} color={color} />}
              {pg === 2 && <BookPage3 theme={theme} color={color} galleryUrls={galleryUrls} downloadPhoto={downloadPhoto} onProceedNow={() => setProceedFormOpen(true)} onBrowseOtherThemes={onBrowseOtherThemes} />}
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
              color: pg === 0 ? 'rgba(245,236,216,0.18)' : 'rgba(245,236,216,0.48)',
              fontSize: 13, padding: '8px 0', fontFamily: "'Outfit',sans-serif",
              WebkitAppearance: 'none', appearance: 'none', outline: 'none',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>Previous</button>

            <span style={{ fontSize: 10, color: 'rgba(245,236,216,0.28)', fontFamily: "'Outfit',sans-serif" }}>{pg + 1} / 3</span>

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
      display: 'flex', flexDirection: 'row', alignItems: 'center',
      width: '100%', borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${occColor}22`, cursor: 'pointer', padding: 0,
      background: 'rgba(245,236,216,0.04)',
      transition: 'background 0.18s', textAlign: 'left',
    }}>
      <div style={{ width: 80, height: 60, flexShrink: 0, overflow: 'hidden' }}>
        <img src={photo} alt={theme.theme} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.src = occFallback(occasion); }} />
      </div>
      <div style={{ flex: 1, padding: '0 12px', minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#F5ECD8', lineHeight: 1.2, fontFamily: "'Outfit',sans-serif" }}>{theme.theme}</div>
        <div style={{ fontSize: 13, color: 'rgba(245,236,216,0.78)', lineHeight: 1.3, marginTop: 3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: "'Outfit',sans-serif" }}>{theme.oneLineDesc}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: `${badgeColor}22`, border: `1px solid ${badgeColor}50`, color: badgeColor, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Outfit',sans-serif" }}>{theme.budget}</span>
        <span style={{ fontSize: 12, color: occColor, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>↗</span>
      </div>
    </button>
  );
}

// ── Main OccasionPlanner component ────────────────────────────────────────

export default function OccasionPlanner({ initialOccasion, onClose }) {
  const fromCard = !!initialOccasion;
  const navigate = useNavigate();

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
    border: `1.5px solid ${selected ? occColor : 'rgba(245,236,216,0.11)'}`,
    background: selected ? `${occColor}1C` : 'rgba(245,236,216,0.04)',
    transition: 'all 0.18s', fontFamily: "'Outfit',sans-serif",
  });

  const occBg = OCC_BG[occasion] || ['#1C0A04', '#130600'];
  const occBgGradient = `linear-gradient(160deg, ${occBg[0]} 0%, ${occBg[1]} 100%)`;

  const h2Style = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 'clamp(2rem,4.5vw,2.8rem)', fontWeight: 400,
    color: '#F5ECD8', margin: '0 0 8px', letterSpacing: '0.01em',
  };
  const subStyle = { fontSize: 15, color: 'rgba(245,236,216,0.78)', margin: '0 0 22px', fontFamily: "'Outfit',sans-serif" };

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

          {/* Panel */}
          <div className="op-panel op-scroll" onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
            background: occBgGradient,
            border: `1px solid ${occColor}38`,
            borderRadius: 26,
            fontFamily: "'Outfit',sans-serif",
            boxShadow: `0 32px 100px rgba(0,0,0,0.75), 0 0 0 1px ${occColor}14`,
            position: 'relative',
          }}>

            {/* Close */}
            <button onClick={onClose} style={{
              position: 'absolute', top: 16, right: 16, zIndex: 20,
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(245,236,216,0.07)', border: '1px solid rgba(245,236,216,0.12)',
              color: 'rgba(245,236,216,0.62)', fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>✕</button>

            {/* Progress bar — steps 1-4 */}
            {step >= 1 && step <= 4 && (
              <div style={{ padding: '18px 22px 0', display: 'flex', gap: 5 }}>
                {[1,2,3,4].map(s => (
                  <div key={s} style={{
                    flex: 1, height: 3, borderRadius: 3,
                    background: s <= step ? occColor : 'rgba(245,236,216,0.1)',
                    transition: 'background 0.3s',
                  }} />
                ))}
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
                          position: 'relative', height: 94, borderRadius: 14,
                          overflow: 'hidden', border: '1.5px solid rgba(245,236,216,0.07)',
                          cursor: 'pointer', padding: 0, background: '#160800',
                          transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 18px rgba(0,0,0,0.42)',
                        }}>
                        <img src={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.78 }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
                          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '7px 7px',
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#F5ECD8', lineHeight: 1.2, fontFamily: "'Outfit',sans-serif" }}>{label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 0.5 — Plan with / without theme */}
              {step === 0.5 && (
                <div>
                  <button onClick={() => setStep(0)} style={{ background: 'transparent', border: 'none', color: 'rgba(245,236,216,0.55)', fontSize: 15, cursor: 'pointer', padding: '0 0 18px', fontFamily: "'Outfit',sans-serif", WebkitAppearance: 'none', appearance: 'none', outline: 'none' }}>Back</button>
                  <p style={{ fontSize: 10, fontWeight: 800, color: occColor, textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 8px', fontFamily: "'Outfit',sans-serif" }}>Plan your {occasion}</p>
                  <h2 style={h2Style}>How would you like to plan?</h2>
                  <p style={subStyle}>Choose your planning style</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <button onClick={() => goNext(1)} style={{
                      padding: '20px 18px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                      border: `1.5px solid ${occColor}55`, background: `${occColor}10`,
                      transition: 'all 0.18s', fontFamily: "'Outfit',sans-serif",
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#F5ECD8', marginBottom: 5 }}>🎨 Plan with Theme</div>
                      <div style={{ fontSize: 13, color: 'rgba(245,236,216,0.72)' }}>Browse curated themes and get tailored vendor suggestions for your event</div>
                    </button>
                    <button onClick={() => { onClose(); navigate('/booking'); }} style={{
                      padding: '20px 18px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                      border: '1.5px solid rgba(245,236,216,0.14)', background: 'rgba(245,236,216,0.04)',
                      transition: 'all 0.18s', fontFamily: "'Outfit',sans-serif",
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#F5ECD8', marginBottom: 5 }}>⚡ Plan without Theme</div>
                      <div style={{ fontSize: 13, color: 'rgba(245,236,216,0.72)' }}>Jump straight to planning — browse vendors, get quotes, and finalise</div>
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
                        <div style={{ color: occColor, fontSize: 13, letterSpacing: 3, marginBottom: 6 }}>{'★'.repeat(stars)}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#F5ECD8', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 13, color: 'rgba(245,236,216,0.82)' }}>{desc}</div>
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
                        width: '100%', boxSizing: 'border-box', padding: '16px 80px 16px 20px',
                        fontSize: 28, fontWeight: 700,
                        background: 'rgba(245,236,216,0.05)', border: `1.5px solid ${occColor}35`,
                        borderRadius: 14, color: '#F5ECD8', outline: 'none', fontFamily: "'Outfit',sans-serif",
                      }}
                    />
                    <span style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(245,236,216,0.28)', pointerEvents: 'none', fontFamily: "'Outfit',sans-serif" }}>guests</span>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
                    {['10','25','50','100','150','250'].map(g => (
                      <button key={g} onClick={() => setGuests(g)} style={{
                        padding: '7px 13px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: guests === g ? `${occColor}20` : 'rgba(245,236,216,0.05)',
                        border: `1px solid ${guests === g ? occColor : 'rgba(245,236,216,0.12)'}`,
                        color: guests === g ? occColor : 'rgba(245,236,216,0.48)',
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
                    {VENUE_OPTIONS.map(({ key, label }) => (
                      <button key={key} onClick={() => { setVenue(key); setTimeout(() => goNext(), 260); }}
                        style={{ ...optStyle(venue === key), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#F5ECD8', textAlign: 'center' }}>{label}</div>
                      </button>
                    ))}
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
                    {TIME_OPTIONS.map(({ key, label, desc, icon }) => (
                      <button key={key} onClick={() => { setTimeOfDay(key); setTimeout(() => goNext(5), 260); }}
                        style={optStyle(timeOfDay === key)}>
                        <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#F5ECD8', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 14, color: 'rgba(245,236,216,0.82)', fontWeight: 600 }}>{desc}</div>
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
                        {budget    && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: `${occColor}14`, border: `1px solid ${occColor}38`, color: occColor, fontFamily: "'Outfit',sans-serif" }}>{BUDGET_OPTIONS.find(b => b.key === budget)?.label}</span>}
                        {guests    && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(245,236,216,0.06)', border: '1px solid rgba(245,236,216,0.12)', color: 'rgba(245,236,216,0.55)', fontFamily: "'Outfit',sans-serif" }}>{guests} guests</span>}
                        {venue     && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(245,236,216,0.06)', border: '1px solid rgba(245,236,216,0.12)', color: 'rgba(245,236,216,0.55)', fontFamily: "'Outfit',sans-serif" }}>{VENUE_OPTIONS.find(v => v.key === venue)?.label}</span>}
                        {timeOfDay && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(245,236,216,0.06)', border: '1px solid rgba(245,236,216,0.12)', color: 'rgba(245,236,216,0.55)', fontFamily: "'Outfit',sans-serif" }}>{timeOfDay}</span>}
                      </div>
                    )}
                  </div>

                  {results.length > 0 ? (
                    <div className="op-theme-grid" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {results.map(theme => (
                        <ThemeCard key={theme.id} theme={theme} occasion={occasion} occColor={occColor} onExpand={() => setExpandedTheme(theme)} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                      <div style={{ fontSize: 36, opacity: 0.25, marginBottom: 10 }}>✦</div>
                      <p style={{ color: 'rgba(245,236,216,0.38)', fontSize: 14, fontFamily: "'Outfit',sans-serif" }}>No themes matched — try adjusting your filters</p>
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
                      <button onClick={adjustFilters} style={{ background: 'none', border: 'none', color: 'rgba(245,236,216,0.42)', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", textDecoration: 'underline', textUnderlineOffset: 3 }}>
                        Adjust filters
                      </button>
                      <span style={{ color: 'rgba(245,236,216,0.18)' }}>·</span>
                      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(245,236,216,0.42)', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", textDecoration: 'underline', textUnderlineOffset: 3 }}>
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

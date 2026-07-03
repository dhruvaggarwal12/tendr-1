import { useState, useEffect } from 'react';

import BIRTHDAY_THEMES from '../data/birthdayThemes';
import ANNIVERSARY_THEMES from '../data/anniversaryThemes';
import BABY_SHOWER_THEMES from '../data/babyShowerThemes';
import HOUSE_PARTY_THEMES from '../data/housePartyThemes';
import HOUSEWARMING_THEMES from '../data/housewarmingThemes';
import GET_TOGETHER_THEMES from '../data/getTogetherThemes';
import KITTY_PARTY_THEMES from '../data/kittyPartyThemes';
import NAMING_CEREMONY_THEMES from '../data/namingCeremonyThemes';

// ── Data ──────────────────────────────────────────────────────────────────

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
  { key: 'Budget',   label: 'Basic',    desc: 'Simple & charming',      stars: 1 },
  { key: 'Standard', label: 'Standard', desc: 'Balanced & beautiful',   stars: 2 },
  { key: 'Premium',  label: 'Premium',  desc: 'Elevated & elegant',     stars: 3 },
  { key: 'Luxury',   label: 'Luxury',   desc: 'Opulent & grand',        stars: 4 },
];

const VENUE_OPTIONS = [
  {
    key: 'house', label: 'At Home / Venue', desc: 'House, apartment, banquet hall',
    venues: ['Home','Apartment','Villa','Hotel','Banquet','Club','Indoor Party Hall','Studio','Library Café','Café','Gaming Café','Heritage Venue','Ancestral Home','Community Hall','Sports Bar','Winery'],
  },
  {
    key: 'lawn', label: 'Lawn / Farmhouse', desc: 'Open outdoor ground or resort',
    venues: ['Lawn','Farmhouse','Resort','Ground','Poolside','Beach Resort'],
  },
  {
    key: 'garden', label: 'Garden', desc: 'Lush green garden setting',
    venues: ['Garden','Farmhouse','Lawn'],
  },
  {
    key: 'terrace', label: 'Terrace / Rooftop', desc: 'Elevated open-sky spot',
    venues: ['Rooftop','Penthouse','Terrace','Villa','Hotel'],
  },
];

const TIME_OPTIONS = [
  { key: 'Morning',   label: 'Morning',   desc: '8 am – 12 pm',  icon: '🌅' },
  { key: 'Afternoon', label: 'Afternoon', desc: '12 pm – 4 pm',  icon: '☀️' },
  { key: 'Evening',   label: 'Evening',   desc: '4 pm – 8 pm',   icon: '🌆' },
  { key: 'Night',     label: 'Night',     desc: '8 pm onwards',  icon: '🌙' },
];

// ── Photos ────────────────────────────────────────────────────────────────

const U = 'https://images.unsplash.com/';
const PHOTOS = {
  elegant_night:  `${U}photo-1530103862676-de8c9debad1d?w=720&h=440&fit=crop&auto=format&q=80`,
  luxury_gold:    `${U}photo-1464366400600-7168b8af9bc3?w=720&h=440&fit=crop&auto=format&q=80`,
  kids_fun:       `${U}photo-1513151233558-d860c5398176?w=720&h=440&fit=crop&auto=format&q=80`,
  garden_day:     `${U}photo-1510076857177-7470076d4098?w=720&h=440&fit=crop&auto=format&q=80`,
  romantic:       `${U}photo-1519167758481-83f575bb0ea2?w=720&h=440&fit=crop&auto=format&q=80`,
  dj_neon:        `${U}photo-1574391884720-bbc3740c59d1?w=720&h=440&fit=crop&auto=format&q=80`,
  baby_pastel:    `${U}photo-1587825140708-dfaf72ae4b04?w=720&h=440&fit=crop&auto=format&q=80`,
  traditional:    `${U}photo-1576091160550-2173dba999ef?w=720&h=440&fit=crop&auto=format&q=80`,
  boho_rustic:    `${U}photo-1501339847302-ac426a4a7cbb?w=720&h=440&fit=crop&auto=format&q=80`,
  outdoor:        `${U}photo-1506157786151-b8491531f063?w=720&h=440&fit=crop&auto=format&q=80`,
  masquerade:     `${U}photo-1493843978996-26b3a5d03ae5?w=720&h=440&fit=crop&auto=format&q=80`,
  movie:          `${U}photo-1489599849927-2ee91cede3ba?w=720&h=440&fit=crop&auto=format&q=80`,
  pool:           `${U}photo-1519046904884-53103b34b206?w=720&h=440&fit=crop&auto=format&q=80`,
  carnival:       `${U}photo-1429514513361-8fa32282fd5f?w=720&h=440&fit=crop&auto=format&q=80`,
};

const THEME_PHOTO_OVERRIDES = {
  'neon-glow': PHOTOS.dj_neon, 'neon-glow-party': PHOTOS.dj_neon,
  'retro-disco': PHOTOS.dj_neon, 'dj-night': PHOTOS.dj_neon,
  'silent-disco': PHOTOS.dj_neon, 'gaming': PHOTOS.elegant_night,
  'gaming-party': PHOTOS.elegant_night,
  'masquerade': PHOTOS.masquerade,
  'movie-night': PHOTOS.movie,
  'carnival': PHOTOS.carnival, 'circus': PHOTOS.carnival,
  'pool-party': PHOTOS.pool,
  'boho-picnic': PHOTOS.boho_rustic, 'rustic-chic': PHOTOS.boho_rustic,
  'boho-home': PHOTOS.boho_rustic, 'boho-chic': PHOTOS.boho_rustic,
  'garden-party': PHOTOS.garden_day, 'garden-picnic': PHOTOS.garden_day,
  'garden-brunch': PHOTOS.garden_day, 'rustic-garden': PHOTOS.garden_day,
  'eco-green-home': PHOTOS.garden_day,
  'black-and-gold': PHOTOS.luxury_gold, 'black-and-gold-elegance': PHOTOS.luxury_gold,
  'black-and-gold-night': PHOTOS.luxury_gold, 'royal-celebration': PHOTOS.luxury_gold,
  'silver-jubilee': PHOTOS.luxury_gold, 'royal-welcome': PHOTOS.luxury_gold,
  'royal-queen': PHOTOS.luxury_gold, 'royal-prince': PHOTOS.luxury_gold,
  'royal-princess': PHOTOS.luxury_gold,
  'romantic-candlelight': PHOTOS.romantic, 'rooftop-dinner': PHOTOS.romantic,
  'starry-night': PHOTOS.romantic, 'paris-romance': PHOTOS.romantic,
  'cruise-night': PHOTOS.romantic, 'rooftop-chill': PHOTOS.romantic,
  'rooftop-vibes': PHOTOS.elegant_night,
  'beach-sunset': PHOTOS.outdoor, 'tropical-paradise': PHOTOS.outdoor,
  'tropical-escape': PHOTOS.outdoor, 'backyard-bbq': PHOTOS.outdoor,
  'bonfire-night': PHOTOS.outdoor, 'camping-adventure': PHOTOS.outdoor,
  'hawaiian-luau': PHOTOS.outdoor,
  'traditional-namkaran': PHOTOS.traditional, 'traditional-griha-pravesh': PHOTOS.traditional,
  'temple-blessing': PHOTOS.traditional, 'heritage-haveli': PHOTOS.traditional,
  'festival-home': PHOTOS.traditional, 'festival-house-party': PHOTOS.elegant_night,
  'pastel-dreams': PHOTOS.baby_pastel, 'teddy-bear': PHOTOS.baby_pastel,
  'cloud-and-moon': PHOTOS.baby_pastel, 'twinkle-twinkle': PHOTOS.baby_pastel,
  'moon-and-stars': PHOTOS.baby_pastel, 'little-prince': PHOTOS.baby_pastel,
  'little-princess': PHOTOS.baby_pastel,
  'bollywood-glam': PHOTOS.elegant_night, 'casino-night': PHOTOS.elegant_night,
  'hollywood-glam': PHOTOS.elegant_night,
  'white-party': PHOTOS.elegant_night, 'white-and-gold': PHOTOS.luxury_gold,
  'cocktail-lounge': PHOTOS.elegant_night, 'mystery-murder-night': PHOTOS.masquerade,
  'denim-and-diamonds': PHOTOS.luxury_gold,
};

function occFallback(occasion) {
  return `/occasions/${occasion.toLowerCase().replace(/ /g, '-')}-desktop.png`;
}

function getThemePhoto(theme, occasion) {
  if (THEME_PHOTO_OVERRIDES[theme.id]) return THEME_PHOTO_OVERRIDES[theme.id];
  const bestTime = theme.bestTime || [];
  const budget = theme.budget || '';
  const isNight = bestTime.includes('Night') && !bestTime.includes('Morning');
  const isKids  = occasion === 'Birthday' && parseInt((theme.bestAgeGroup || '').split(/[-–]/)[1]) <= 13;
  const isGarden = (theme.bestVenue || []).includes('Garden');
  const isBaby = occasion === 'Baby Shower' || occasion === 'Naming Ceremony';
  if (isBaby)         return PHOTOS.baby_pastel;
  if (isKids)         return PHOTOS.kids_fun;
  if (budget === 'Luxury') return PHOTOS.luxury_gold;
  if (isGarden)       return PHOTOS.garden_day;
  if (isNight)        return PHOTOS.dj_neon;
  return occFallback(occasion);
}

// ── Filtering ─────────────────────────────────────────────────────────────

function parseGuestRange(str = '') {
  const m = str.match(/(\d+)[–\-](\d+)/);
  if (m) return [parseInt(m[1]), parseInt(m[2])];
  const s = str.match(/(\d+)/);
  return s ? [0, parseInt(s[1])] : [0, 999];
}

function filterThemes(themes, { budget, guests, venue, timeOfDay }) {
  return themes.filter(theme => {
    if (budget) {
      const tb = (theme.budget || '');
      if (!tb.includes(budget)) return false;
    }
    if (guests && !isNaN(parseInt(guests))) {
      const g = parseInt(guests);
      const [min, max] = parseGuestRange(theme.recommendedGuests);
      if (g < min * 0.65 || g > max * 1.4) return false;
    }
    if (venue) {
      const opt = VENUE_OPTIONS.find(v => v.key === venue);
      if (opt) {
        const tv = theme.bestVenue || [];
        if (!tv.some(v => opt.venues.includes(v))) return false;
      }
    }
    if (timeOfDay) {
      const tt = theme.bestTime || [];
      if (!tt.includes(timeOfDay)) return false;
    }
    return true;
  });
}

function getFilteredWithFallback(occasion, filters) {
  const all = THEME_DATA_MAP[occasion] || [];
  let r = filterThemes(all, filters);
  if (r.length === 0) r = filterThemes(all, { ...filters, budget: null });
  if (r.length === 0) r = filterThemes(all, { ...filters, budget: null, venue: null });
  if (r.length === 0) r = all.slice(0, 8);
  return r;
}

// ── Styles ────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes op-fadein { from { opacity:0; transform:scale(0.96) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes op-slide  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  .op-overlay   { animation: op-fadein 0.25s ease forwards; }
  .op-step      { animation: op-slide  0.22s ease forwards; }
  .op-occ-card:hover { transform:translateY(-4px) scale(1.02) !important; box-shadow:0 12px 36px rgba(0,0,0,0.45) !important; }
  .op-occ-card:hover .op-occ-label { opacity:1 !important; }
  .op-budget-btn:hover, .op-venue-btn:hover, .op-time-btn:hover { border-color:rgba(201,168,76,0.7) !important; background:rgba(201,168,76,0.1) !important; }
  .op-theme-card:hover { transform:translateY(-5px) scale(1.015) !important; box-shadow:0 20px 56px rgba(0,0,0,0.55) !important; }
  .op-quick-pill:hover { border-color:#C9A84C !important; color:#C9A84C !important; }
  .op-scroll::-webkit-scrollbar { display:none; }
  .op-scroll { scrollbar-width:none; }
  @media (max-width:600px) {
    .op-panel { border-radius:20px 20px 0 0 !important; margin-top:auto !important; max-height:93vh !important; }
    .op-overlay-wrap { align-items:flex-end !important; padding:0 !important; }
    .op-results-grid { grid-template-columns:1fr 1fr !important; }
    .op-detail-hero { height:200px !important; }
    .op-detail-grid { grid-template-columns:1fr !important; }
    .op-occ-picker-grid { grid-template-columns:repeat(4,1fr) !important; gap:8px !important; }
    .op-occ-picker-card { height:82px !important; }
    .op-budget-grid { grid-template-columns:1fr 1fr !important; }
    .op-venue-grid  { grid-template-columns:1fr 1fr !important; }
    .op-time-grid   { grid-template-columns:1fr 1fr !important; }
  }
`;

// ── Main Component ────────────────────────────────────────────────────────

export default function OccasionPlanner({ initialOccasion, onClose }) {
  const fromCard = !!initialOccasion;
  const [step, setStep] = useState(fromCard ? 1 : 0);
  const [occasion, setOccasion] = useState(initialOccasion || null);
  const [budget, setBudget] = useState(null);
  const [guests, setGuests] = useState('');
  const [venue, setVenue] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState(null);
  const [expandedTheme, setExpandedTheme] = useState(null);

  const results = step === 5 && occasion
    ? getFilteredWithFallback(occasion, { budget, guests, venue, timeOfDay })
    : [];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape') expandedTheme ? setExpandedTheme(null) : onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [expandedTheme, onClose]);

  const goNext = (n) => setStep(s => n !== undefined ? n : s + 1);
  const goBack = () => {
    if (step === 1 && fromCard) { onClose(); return; }
    setStep(s => s - 1);
  };
  const restart = () => {
    setBudget(null); setGuests(''); setVenue(null); setTimeOfDay(null);
    setStep(fromCard ? 1 : 0);
    if (!fromCard) setOccasion(null);
  };

  const occInfo = OCCASIONS_LIST.find(o => o.label === occasion);

  return (
    <>
      <style>{CSS}</style>

      {/* ── Backdrop ── */}
      <div className="op-overlay" onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        background: 'rgba(6,3,14,0.88)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px', overflowY: 'auto',
      }}>
        <div className="op-overlay-wrap" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', minHeight: '100%',
        }}>
          {/* ── Panel ── */}
          <div className="op-panel op-scroll" onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 640, maxHeight: '90vh',
            overflowY: 'auto',
            background: 'linear-gradient(160deg, #0e0920 0%, #0a0618 100%)',
            border: '1px solid rgba(201,168,76,0.22)',
            borderRadius: 26,
            fontFamily: "'Outfit', sans-serif",
            position: 'relative',
            boxShadow: '0 32px 100px rgba(0,0,0,0.7)',
          }}>

            {/* Close */}
            <button onClick={onClose} style={{
              position: 'absolute', top: 16, right: 16, zIndex: 20,
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.65)', fontSize: 16,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>✕</button>

            {/* Progress bar (steps 1-4) */}
            {step >= 1 && step <= 4 && (
              <div style={{ padding: '18px 22px 0', display: 'flex', gap: 5 }}>
                {[1,2,3,4].map(s => (
                  <div key={s} style={{
                    flex: 1, height: 3, borderRadius: 3,
                    background: s <= step ? '#C9A84C' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
            )}

            {/* ── Content ── */}
            <div key={step} className="op-step" style={{ padding: '26px 24px 32px' }}>

              {/* ── Step 0: Occasion picker ── */}
              {step === 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 8px' }}>Plan your event</p>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.55rem,4vw,2.1rem)', fontWeight: 400, color: '#fff', margin: '0 0 5px', letterSpacing: '0.01em' }}>What's the occasion?</h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 22px' }}>Select to get personalised theme suggestions</p>
                  <div className="op-occ-picker-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {OCCASIONS_LIST.map(({ label, photo }) => (
                      <button key={label} className="op-occ-card op-occ-picker-card" onClick={() => { setOccasion(label); goNext(1); }}
                        style={{
                          position: 'relative', height: 96, borderRadius: 14,
                          overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.07)',
                          cursor: 'pointer', padding: 0, background: '#0f0a1e',
                          transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 18px rgba(0,0,0,0.4)',
                        }}>
                        <img src={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
                          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '8px 7px',
                        }}>
                          <span className="op-occ-label" style={{ fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 1: Budget ── */}
              {step === 1 && (
                <div>
                  <Breadcrumb occasion={occasion} current="Budget" />
                  <h2 style={stepH2}>What's your budget range?</h2>
                  <p style={stepSub}>We'll match themes that fit your spending comfort</p>
                  <div className="op-budget-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 11 }}>
                    {BUDGET_OPTIONS.map(({ key, label, desc, stars }) => (
                      <button key={key} className="op-budget-btn"
                        onClick={() => { setBudget(key); setTimeout(() => goNext(), 260); }}
                        style={optBtn(budget === key)}>
                        <div style={{ color: '#C9A84C', fontSize: 11, letterSpacing: 2, marginBottom: 5 }}>{'★'.repeat(stars)}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)' }}>{desc}</div>
                      </button>
                    ))}
                  </div>
                  <NavRow onBack={goBack} onNext={budget ? () => goNext() : null} />
                </div>
              )}

              {/* ── Step 2: Guests ── */}
              {step === 2 && (
                <div>
                  <Breadcrumb occasion={occasion} current="Guests" />
                  <h2 style={stepH2}>How many guests?</h2>
                  <p style={stepSub}>Approximate headcount helps us suggest the right scale</p>
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <input
                      type="number" min="1" max="1000"
                      placeholder="e.g. 50"
                      value={guests}
                      onChange={e => setGuests(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && guests && goNext()}
                      autoFocus
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '16px 80px 16px 20px',
                        fontSize: 28, fontWeight: 700,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1.5px solid rgba(201,168,76,0.3)',
                        borderRadius: 14, color: '#fff', outline: 'none',
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    />
                    <span style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>guests</span>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
                    {['10','25','50','100','150','250'].map(g => (
                      <button key={g} className="op-quick-pill" onClick={() => setGuests(g)} style={{
                        padding: '7px 13px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: guests === g ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${guests === g ? '#C9A84C' : 'rgba(255,255,255,0.12)'}`,
                        color: guests === g ? '#C9A84C' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.18s',
                      }}>{g}</button>
                    ))}
                  </div>
                  <NavRow onBack={goBack} onNext={guests ? () => goNext() : null} nextLabel="Continue →" />
                </div>
              )}

              {/* ── Step 3: Venue ── */}
              {step === 3 && (
                <div>
                  <Breadcrumb occasion={occasion} current="Venue" />
                  <h2 style={stepH2}>Where is the event?</h2>
                  <p style={stepSub}>The setting shapes the mood of your celebration</p>
                  <div className="op-venue-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 11, marginBottom: 20 }}>
                    {VENUE_OPTIONS.map(({ key, label, desc }) => (
                      <button key={key} className="op-venue-btn"
                        onClick={() => { setVenue(key); setTimeout(() => goNext(), 260); }}
                        style={optBtn(venue === key)}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)' }}>{desc}</div>
                      </button>
                    ))}
                  </div>
                  <NavRow onBack={goBack} onNext={venue ? () => goNext() : null} />
                </div>
              )}

              {/* ── Step 4: Time ── */}
              {step === 4 && (
                <div>
                  <Breadcrumb occasion={occasion} current="Time" />
                  <h2 style={stepH2}>When is the celebration?</h2>
                  <p style={stepSub}>Timing shapes the ambiance and lighting of your theme</p>
                  <div className="op-time-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 11, marginBottom: 20 }}>
                    {TIME_OPTIONS.map(({ key, label, desc, icon }) => (
                      <button key={key} className="op-time-btn"
                        onClick={() => { setTimeOfDay(key); setTimeout(() => goNext(5), 260); }}
                        style={optBtn(timeOfDay === key)}>
                        <div style={{ fontSize: 22, marginBottom: 5 }}>{icon}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)' }}>{desc}</div>
                      </button>
                    ))}
                  </div>
                  <NavRow onBack={goBack} onNext={timeOfDay ? () => goNext(5) : null} nextLabel="See themes →" />
                </div>
              )}

              {/* ── Step 5: Results ── */}
              {step === 5 && (
                <div>
                  {/* Header */}
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 4px' }}>
                      {results.length} theme{results.length !== 1 ? 's' : ''} matched
                    </p>
                    <h2 style={{ ...stepH2, margin: '0 0 10px' }}>
                      {occasion} themes for you
                    </h2>
                    {/* Filter pills */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {budget && <Pill label={BUDGET_OPTIONS.find(b => b.key === budget)?.label} gold />}
                      {guests && <Pill label={`${guests} guests`} />}
                      {venue && <Pill label={VENUE_OPTIONS.find(v => v.key === venue)?.label} />}
                      {timeOfDay && <Pill label={timeOfDay} />}
                    </div>
                  </div>

                  {results.length > 0 ? (
                    <div className="op-results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 13 }}>
                      {results.map(theme => (
                        <ThemeCard key={theme.id} theme={theme} occasion={occasion} onExpand={() => setExpandedTheme(theme)} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>✦</div>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No themes matched exactly — try adjusting your filters</p>
                    </div>
                  )}

                  <div style={{ marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => goBack()} style={ghostBtn}>← Adjust filters</button>
                    <button onClick={restart} style={ghostBtn}>Start over</button>
                  </div>
                </div>
              )}

            </div>{/* /step content */}
          </div>
        </div>
      </div>

      {/* ── Theme detail overlay ── */}
      {expandedTheme && (
        <ThemeDetail theme={expandedTheme} occasion={occasion} onClose={() => setExpandedTheme(null)} />
      )}
    </>
  );
}

// ── Shared style objects ──────────────────────────────────────────────────

const stepH2 = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: 'clamp(1.45rem,3.8vw,2rem)', fontWeight: 400,
  color: '#fff', margin: '0 0 5px', letterSpacing: '0.01em',
};
const stepSub = { fontSize: 13, color: 'rgba(255,255,255,0.43)', margin: '0 0 22px' };
const optBtn = (selected) => ({
  padding: '18px 15px', borderRadius: 16, textAlign: 'left',
  border: `1.5px solid ${selected ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`,
  background: selected ? 'rgba(201,168,76,0.16)' : 'rgba(255,255,255,0.04)',
  cursor: 'pointer', transition: 'all 0.18s',
});
const ghostBtn = {
  padding: '9px 20px', borderRadius: 100,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer',
};

// ── Sub-components ────────────────────────────────────────────────────────

function Breadcrumb({ occasion, current }) {
  if (!occasion) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{occasion}</span>
      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>›</span>
      <span style={{ fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{current}</span>
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel = 'Next →' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.38)', fontSize: 14, cursor: 'pointer', padding: '8px 0' }}>← Back</button>
      {onNext && (
        <button onClick={onNext} style={{ padding: '10px 26px', borderRadius: 100, background: '#C9A84C', color: '#0a0618', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{nextLabel}</button>
      )}
    </div>
  );
}

function Pill({ label, gold }) {
  return (
    <span style={{
      fontSize: 11, padding: '3px 10px', borderRadius: 100,
      background: gold ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
      border: `1px solid ${gold ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.12)'}`,
      color: gold ? '#C9A84C' : 'rgba(255,255,255,0.55)',
    }}>{label}</span>
  );
}

const BUDGET_BADGE = {
  Luxury: '#A855F7', Premium: '#C9A84C',
  Standard: '#22C55E', Budget: '#3B82F6',
  'Budget / Standard': '#3B82F6',
};

function ThemeCard({ theme, occasion, onExpand }) {
  const photo = getThemePhoto(theme, occasion);
  const badgeColor = BUDGET_BADGE[theme.budget] || '#C9A84C';
  return (
    <button className="op-theme-card" onClick={onExpand} style={{
      position: 'relative', height: 208, borderRadius: 18,
      overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)',
      cursor: 'pointer', padding: 0, background: '#0d0920',
      transition: 'transform 0.22s, box-shadow 0.22s',
      boxShadow: '0 8px 30px rgba(0,0,0,0.45)', textAlign: 'left',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Photo */}
      <div style={{ height: '58%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        <img src={photo} alt={theme.theme}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.src = occFallback(occasion); }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))' }} />
      </div>
      {/* Budget badge */}
      <div style={{
        position: 'absolute', top: 9, right: 9,
        padding: '2px 8px', borderRadius: 100, fontSize: 9, fontWeight: 800,
        background: `${badgeColor}25`, border: `1px solid ${badgeColor}55`,
        color: badgeColor, backdropFilter: 'blur(8px)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>{theme.budget}</div>
      {/* Text */}
      <div style={{ flex: 1, padding: '10px 11px 11px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 3 }}>{theme.theme}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.47)', lineHeight: 1.35 }}>{theme.oneLineDesc}</div>
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', marginTop: 6 }}>
          {theme.recommendedGuests} · Tap to explore ↗
        </div>
      </div>
    </button>
  );
}

// ── Theme Detail ──────────────────────────────────────────────────────────

function ThemeDetail({ theme, occasion, onClose }) {
  const photo = getThemePhoto(theme, occasion);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const food = theme.foodSuggestions || theme.foodIdeas;
  const badgeColor = BUDGET_BADGE[theme.budget] || '#C9A84C';

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(18px)',
      overflowY: 'auto', padding: '20px 16px',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 700, borderRadius: 26,
        background: 'linear-gradient(160deg,#0e0920,#0a0618)',
        border: '1px solid rgba(201,168,76,0.2)',
        overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
        animation: 'op-fadein 0.25s ease',
      }}>
        {/* Hero */}
        <div className="op-detail-hero" style={{ position: 'relative', height: 260 }}>
          <img src={photo} alt={theme.theme}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.src = occFallback(occasion); }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,6,24,1) 0%, rgba(10,6,24,0.25) 50%, transparent 100%)' }} />
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
            fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
          {/* Title overlay */}
          <div style={{ position: 'absolute', bottom: 20, left: 24, right: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{occasion}</span>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 100, background: `${badgeColor}30`, border: `1px solid ${badgeColor}55`, color: badgeColor, fontWeight: 700, textTransform: 'uppercase' }}>{theme.budget}</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 400, color: '#fff', margin: '0 0 4px', letterSpacing: '0.01em' }}>{theme.theme}</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{theme.oneLineDesc}</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px 30px' }}>
          {/* Overview */}
          {theme.overview && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: '0 0 22px' }}>{theme.overview}</p>
          )}

          {/* Colour palette */}
          {theme.colourPalette?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <SectionLabel>Colour Palette</SectionLabel>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {theme.colourPalette.map(c => (
                  <span key={c} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.68)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
            <StatBox label="Guests" value={theme.recommendedGuests} />
            <StatBox label="Budget" value={theme.budget} />
            <StatBox label="Best Time" value={(theme.bestTime || []).join(' · ')} />
          </div>

          {/* Info grid */}
          <div className="op-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18, marginBottom: 22 }}>
            <InfoBlock title="Decoration Ideas" items={theme.decorationIdeas} />
            <InfoBlock title="Food & Drinks" items={food} />
            <InfoBlock title="Entertainment" items={theme.entertainment} />
            <InfoBlock title="Games & Activities" items={theme.gamesActivities} />
          </div>

          {theme.cakeIdeas?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <InfoBlock title="Cake Ideas" items={theme.cakeIdeas} />
            </div>
          )}

          {theme.photographyIdeas?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <InfoBlock title="Photography Tips" items={theme.photographyIdeas} />
            </div>
          )}

          {/* Planning checklist */}
          {theme.planningChecklist?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionLabel>Planning Checklist</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {theme.planningChecklist.slice(0, 10).map((item, i) => (
                  <span key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 11, color: 'rgba(255,255,255,0.52)',
                    padding: '4px 10px', borderRadius: 100,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <span style={{ color: '#C9A84C', fontSize: 8 }}>✓</span>{item}
                  </span>
                ))}
                {theme.planningChecklist.length > 10 && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', padding: '4px 0' }}>+{theme.planningChecklist.length - 10} more</span>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={{
              flex: 1, minWidth: 140, padding: '13px 22px', borderRadius: 100,
              background: 'linear-gradient(135deg,#C9A84C,#8B6914)',
              color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>Book This Theme</button>
            <button onClick={onClose} style={{
              flex: 1, minWidth: 140, padding: '13px 22px', borderRadius: 100,
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.12)', fontSize: 14, cursor: 'pointer',
            }}>See Other Themes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <h4 style={{ fontSize: 10, fontWeight: 800, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 10px' }}>{children}</h4>;
}

function InfoBlock({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {items.slice(0, 5).map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 5 }}>
            <span style={{ color: '#C9A84C', fontSize: 8, marginTop: 4, flexShrink: 0 }}>◆</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', lineHeight: 1.5 }}>{item}</span>
          </li>
        ))}
        {items.length > 5 && <li style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 3 }}>+{items.length - 5} more</li>}
      </ul>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

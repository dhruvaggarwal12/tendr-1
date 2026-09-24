import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerNav from '../../components/HamburgerNav';
import SEO from '../../components/SEO';
import { PERFORMER_TYPES } from '../../components/PerformerSuggestions';
import { getVendors } from '../../apis/vendorApi';
import BasicSpeedDial from '../../components/BasicSpeedDial';
import { useChatOverlay } from '../../context/ChatContext';

const CACHE_KEY = 'tendr_perf_avail_v1';

const font = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";

const PERFORMER_DETAIL = {
  Singer: {
    subtitle: 'Bollywood, classical, western & more',
    color: '#D94F7A',
    bg: 'linear-gradient(140deg, #2a0a18 0%, #4a1030 100%)',
    occasions: ['Birthdays', 'Anniversaries', 'Weddings'],
    price: '₹8K – ₹60K',
    desc: 'Set the mood from arrival to finale — our vocalists adapt to any crowd and genre.',
    icon: '🎤',
  },
  Band: {
    subtitle: 'Live band for weddings & corporate events',
    color: '#4A7EE0',
    bg: 'linear-gradient(140deg, #0a1228 0%, #1a2a50 100%)',
    occasions: ['Weddings', 'Corporate', 'Get-togethers'],
    price: '₹15K – ₹80K',
    desc: '3 to 8-piece bands playing non-stop Bollywood, jazz, folk or rock sets.',
    icon: '🎸',
  },
  Anchor: {
    subtitle: 'Engage your audience with a pro host',
    color: '#E8932E',
    bg: 'linear-gradient(140deg, #281200 0%, #4a2800 100%)',
    occasions: ['Corporate Events', 'Award Nights', 'All Occasions'],
    price: '₹6K – ₹30K',
    desc: 'From icebreakers to award presentations — a great anchor makes everything flow.',
    icon: '🎙️',
  },
  Choreographer: {
    subtitle: 'Dance performances & group choreography',
    color: '#9B4FD0',
    bg: 'linear-gradient(140deg, #18082a 0%, #30104a 100%)',
    occasions: ['Weddings', 'Birthdays', 'Sangeet'],
    price: '₹8K – ₹40K',
    desc: 'Solo performers, group acts, or choreography workshops for your team or family.',
    icon: '💃',
  },
  Musician: {
    subtitle: 'Instrumentalists — piano, guitar, tabla & more',
    color: '#27A090',
    bg: 'linear-gradient(140deg, #071e1c 0%, #0e3430 100%)',
    occasions: ['Anniversaries', 'Housewarmings', 'Fine Dining'],
    price: '₹6K – ₹25K',
    desc: 'Ambient and elegant — a live musician transforms the atmosphere of any space.',
    icon: '🎹',
  },
  Emcee: {
    subtitle: 'Master of ceremonies for every occasion',
    color: '#D06040',
    bg: 'linear-gradient(140deg, #200a00 0%, #3c1800 100%)',
    occasions: ['Weddings', 'Corporate', 'Galas'],
    price: '₹8K – ₹35K',
    desc: 'Charismatic hosts who keep energy high and transitions smooth all evening.',
    icon: '🎭',
  },
};

const OCCASION_FILTERS = ['All', 'Birthdays', 'Weddings', 'Corporate', 'Anniversaries', 'Get-togethers'];

export default function ArtistsPage() {
  const navigate = useNavigate();
  const { openTendrTeamChat } = useChatOverlay();
  const [available, setAvailable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const cached = (() => { try { return JSON.parse(sessionStorage.getItem(CACHE_KEY)); } catch { return null; } })();
    if (cached !== null) { setAvailable(cached); setLoading(false); return; }
    Promise.all(
      PERFORMER_TYPES.map(p =>
        getVendors({ serviceTypes: [p.type], limit: 1, includeDemo: true })
          .then(r => ({ type: p.type, has: (r?.vendors || []).length > 0 }))
          .catch(() => ({ type: p.type, has: false }))
      )
    ).then(results => {
      const avail = results.filter(r => r.has).map(r => r.type);
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(avail)); } catch {}
      setAvailable(avail);
      setLoading(false);
    });
  }, []);

  const base = PERFORMER_TYPES.filter(p => !available || available.includes(p.type));
  const shown = activeFilter === 'All'
    ? base
    : base.filter(p => (PERFORMER_DETAIL[p.type]?.occasions || []).some(o => o.includes(activeFilter) || activeFilter.includes(o)));

  return (
    <>
      <SEO title="Live Artists & Performers — Tendr" description="Book singers, bands, anchors, choreographers and more for your event." path="/artists" />
      <style>{`
        @keyframes tp-pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes tp-float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
        @keyframes tp-shimmer { from{background-position:-200% center} to{background-position:200% center} }
        .tp-card { transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s; cursor: pointer; }
        .tp-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.22) !important; }
        .tp-filter { transition: all 0.15s; }
        .tp-filter:hover { opacity: 0.85; }
      `}</style>
      <BasicSpeedDial />
      <HamburgerNav title="Artists & Performers" />

      <div style={{ minHeight: '100vh', background: '#0E0A06', fontFamily: font, paddingBottom: 80 }}>

        {/* ── Hero ── */}
        <div style={{ position: 'relative', overflow: 'hidden', padding: '48px 24px 52px', textAlign: 'center', background: 'linear-gradient(180deg, #100800 0%, #1C0F02 60%, #0E0A06 100%)' }}>
          {/* ambient glow orbs */}
          <div aria-hidden style={{ position: 'absolute', top: -60, left: '15%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(216,96,120,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', top: -40, right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,126,224,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', bottom: 0, left: '40%', width: 300, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,147,46,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Floating emoji trio */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
              {['🎤', '🎸', '🎭'].map((e, i) => (
                <div key={i} style={{ fontSize: 32, animation: `tp-float ${1.8 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>{e}</div>
              ))}
            </div>

            <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 400, color: '#FFFCF5', margin: '0 0 10px', lineHeight: 1.1, fontStyle: 'italic', letterSpacing: '-0.01em' }}>
              Live Artists &amp; Performers
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,252,245,0.55)', margin: '0 auto 28px', maxWidth: 420, lineHeight: 1.6 }}>
              Every great event needs a live moment. Singers, bands, anchors, dancers &amp; more — all bookable through Tendr.
            </p>

            {/* Occasion filter pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 7, flexWrap: 'wrap' }}>
              {OCCASION_FILTERS.map(f => {
                const isActive = activeFilter === f;
                return (
                  <button key={f} className="tp-filter"
                    onClick={() => setActiveFilter(f)}
                    style={{
                      fontSize: 11.5, fontWeight: 700, padding: '5px 14px', borderRadius: 100,
                      background: isActive ? 'rgba(196,122,46,0.9)' : 'rgba(255,252,245,0.08)',
                      color: isActive ? '#fff' : 'rgba(255,252,245,0.6)',
                      border: `1px solid ${isActive ? 'transparent' : 'rgba(255,252,245,0.12)'}`,
                      cursor: 'pointer', fontFamily: font,
                    }}>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Availability label ── */}
        <div style={{ textAlign: 'center', padding: '20px 20px 4px' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,252,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {loading ? 'Checking availability…' : `${shown.length} ${shown.length === 1 ? 'category' : 'categories'} available`}
          </span>
        </div>

        {/* ── Category cards ── */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 16px 0' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ borderRadius: 20, background: 'rgba(255,252,245,0.06)', height: 220, animation: 'tp-pulse 1.2s ease-in-out infinite' }} />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(255,252,245,0.4)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎭</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,252,245,0.8)', marginBottom: 8 }}>Coming soon</div>
              <div style={{ fontSize: 13 }}>No artists in this category yet — check back soon.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {shown.map(p => {
                const d = PERFORMER_DETAIL[p.type] || { subtitle: '', color: '#C47A2E', bg: 'linear-gradient(140deg,#1a0a00,#2c1400)', occasions: [], price: '', desc: '', icon: p.emoji };
                return (
                  <div key={p.type} className="tp-card"
                    onClick={() => navigate(`/artists/${p.type}`)}
                    style={{ borderRadius: 20, background: d.bg, overflow: 'hidden', boxShadow: '0 6px 30px rgba(0,0,0,0.3)', position: 'relative' }}>

                    {/* Top glow */}
                    <div aria-hidden style={{ position: 'absolute', top: -30, right: -20, width: 130, height: 130, borderRadius: '50%', background: `radial-gradient(circle, ${d.color}40 0%, transparent 70%)`, pointerEvents: 'none' }} />

                    <div style={{ padding: '24px 22px 20px', position: 'relative', zIndex: 1 }}>
                      {/* Icon + price row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: `${d.color}22`, border: `1.5px solid ${d.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                          {d.icon}
                        </div>
                        {d.price && (
                          <div style={{ fontSize: 11, fontWeight: 700, color: d.color, background: `${d.color}18`, borderRadius: 100, padding: '4px 10px', border: `1px solid ${d.color}30`, marginTop: 4, whiteSpace: 'nowrap' }}>
                            {d.price}
                          </div>
                        )}
                      </div>

                      {/* Name & desc */}
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFCF5', marginBottom: 5, letterSpacing: '-0.01em' }}>{p.label}</div>
                      <div style={{ fontSize: 12.5, color: 'rgba(255,252,245,0.55)', lineHeight: 1.5, marginBottom: 16 }}>{d.desc}</div>

                      {/* Occasion tags */}
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 20 }}>
                        {d.occasions.map(o => (
                          <span key={o} style={{ fontSize: 10, fontWeight: 700, color: d.color, background: `${d.color}18`, borderRadius: 100, padding: '3px 9px', border: `1px solid ${d.color}28` }}>{o}</span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: `1px solid ${d.color}25` }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>Browse artists</span>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${d.color}22`, border: `1.5px solid ${d.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={d.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── How it works ── */}
        <div style={{ maxWidth: 960, margin: '48px auto 0', padding: '0 16px' }}>
          <div style={{ borderRadius: 20, background: 'rgba(255,252,245,0.04)', border: '1px solid rgba(255,252,245,0.08)', padding: '32px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'rgba(196,122,46,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>The process</div>
              <div style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', color: '#FFFCF5', fontStyle: 'italic' }}>How Artist Booking Works</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { icon: '🔍', title: 'Browse & Shortlist', desc: 'Filter by occasion, genre or vibe. Read profiles and samples.' },
                { icon: '💬', title: 'Chat or Book', desc: 'Discuss event details directly, or book instantly and pay later.' },
                { icon: '✅', title: 'Confirmed & Done', desc: 'Tendr confirms availability and coordinates everything for you.' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '18px 14px' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#FFFCF5', marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,252,245,0.45)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Not sure CTA ── */}
        <div style={{ maxWidth: 960, margin: '16px auto 0', padding: '0 16px' }}>
          <button
            onClick={() => openTendrTeamChat()}
            style={{ width: '100%', padding: '18px 24px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(196,122,46,0.14), rgba(204,171,74,0.08))', border: '1.5px solid rgba(196,122,46,0.22)', cursor: 'pointer', fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFCF5', marginBottom: 3 }}>Not sure who to book?</div>
              <div style={{ fontSize: 12, color: 'rgba(255,252,245,0.45)' }}>Tell us your event and budget — we'll suggest the right artist.</div>
            </div>
            <div style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#C47A2E', whiteSpace: 'nowrap' }}>Chat with us →</div>
          </button>
        </div>

      </div>
    </>
  );
}

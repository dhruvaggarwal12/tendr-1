import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerNav from '../../components/HamburgerNav';
import SEO from '../../components/SEO';
import { PERFORMER_TYPES } from '../../components/PerformerSuggestions';
import { getVendors } from '../../apis/vendorApi';
import BasicSpeedDial from '../../components/BasicSpeedDial';

const CACHE_KEY = 'tendr_perf_avail_v1';

const PERFORMER_INFO = {
  Singer:        { subtitle: 'Bollywood, classical, western & more', color: '#E85C8A' },
  Band:          { subtitle: 'Live band for weddings & corporate events', color: '#5B8BE8' },
  Anchor:        { subtitle: 'Engage your audience with a pro host', color: '#E8A030' },
  Choreographer: { subtitle: 'Dance performances & group choreography', color: '#A050D0' },
  Musician:      { subtitle: 'Instrumentalists — piano, guitar, tabla & more', color: '#30A090' },
  Emcee:         { subtitle: 'Master of ceremonies for every occasion', color: '#E87040' },
};

export default function ArtistsPage() {
  const navigate = useNavigate();
  const [available, setAvailable] = useState(null); // string[] of available types
  const [loading, setLoading] = useState(true);

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

  const shown = PERFORMER_TYPES.filter(p => !available || available.includes(p.type));

  return (
    <>
      <SEO title="Live Artists & Performers — Tendr" description="Book singers, bands, anchors, choreographers and more for your event." path="/artists" />
      <BasicSpeedDial />
      <HamburgerNav title="Artists & Performers" />

      <div style={{ minHeight: '100vh', background: '#FDFAF5', fontFamily: "'Outfit', sans-serif", paddingBottom: 80 }}>

        {/* Hero section */}
        <div style={{ background: 'linear-gradient(135deg, #2C1A0E 0%, #4a2e18 100%)', padding: '40px 24px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎤</div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 800, color: '#FFFCF5', margin: '0 0 10px', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
            Live Artists &amp; Performers
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,252,245,0.7)', margin: '0 0 24px', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
            Bring your event to life with world-class performers. Browse, chat or book directly.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {['Weddings', 'Corporate Events', 'Birthdays', 'Concerts', 'Any Occasion'].map(tag => (
              <span key={tag} style={{ fontSize: 11, fontWeight: 600, color: '#CCAB4A', background: 'rgba(204,171,74,0.15)', borderRadius: 100, padding: '4px 12px', border: '1px solid rgba(204,171,74,0.25)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Categories grid */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20, textAlign: 'center' }}>
            {loading ? 'Checking availability…' : `${shown.length} categories available`}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ borderRadius: 20, background: 'rgba(196,122,46,0.06)', height: 140, animation: 'tendr-pulse 1.2s ease-in-out infinite' }} />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9B7450' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎭</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#2C1A0E', marginBottom: 8 }}>Coming soon to your city</div>
              <div style={{ fontSize: 13 }}>We're onboarding performers right now. Check back soon!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {shown.map(p => {
                const info = PERFORMER_INFO[p.type] || { subtitle: 'Available for your event', color: '#C47A2E' };
                return (
                  <div key={p.type}
                    style={{ borderRadius: 20, background: '#fff', border: '1.5px solid rgba(196,122,46,0.14)', boxShadow: '0 4px 20px rgba(28,9,0,0.06)', overflow: 'hidden', transition: 'transform 0.18s, box-shadow 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(196,122,46,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(28,9,0,0.06)'; }}>
                    {/* Card color stripe */}
                    <div style={{ height: 6, background: `linear-gradient(90deg, ${info.color}cc, ${info.color}55)` }} />
                    <div style={{ padding: '22px 22px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${info.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, border: `1.5px solid ${info.color}25` }}>
                          {p.emoji}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#2C1A0E', marginBottom: 3 }}>{p.label}</div>
                          <div style={{ fontSize: 12, color: '#9B7450', lineHeight: 1.35 }}>{info.subtitle}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/artists/${p.type}`)}
                        style={{ width: '100%', padding: '11px', borderRadius: 12, background: `linear-gradient(135deg, ${info.color}dd, ${info.color}aa)`, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'opacity 0.15s', letterSpacing: '0.01em' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        View Artists →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* How it works */}
        <div style={{ maxWidth: 900, margin: '48px auto 0', padding: '0 20px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#2C1A0E', marginBottom: 20, textAlign: 'center' }}>How Artist Booking Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { step: '1', icon: '🔍', title: 'Browse & Shortlist', desc: 'Find performers that match your vibe and event type.' },
              { step: '2', icon: '💬', title: 'Chat or Book Directly', desc: 'Chat to discuss details, or book directly and pay later.' },
              { step: '3', icon: '✅', title: 'Confirm & Pay', desc: 'Our team confirms availability and pricing within hours.' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center', padding: '20px 16px', borderRadius: 16, background: '#fff', border: '1.5px solid rgba(196,122,46,0.1)' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#2C1A0E', marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#9B7450', lineHeight: 1.45 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <style>{`@keyframes tendr-pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
    </>
  );
}

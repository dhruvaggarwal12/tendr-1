import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import HamburgerNav from '../../components/HamburgerNav';
import SEO from '../../components/SEO';
import BasicSpeedDial from '../../components/BasicSpeedDial';
import { PERFORMER_TYPES } from '../../components/PerformerSuggestions';
import { getVendors } from '../../apis/vendorApi';
import { setFinalisedVendor } from '../../redux/listingFiltersSlice';
import { addSelectedVendor } from '../../redux/eventPlanningSlice';

const font = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";
const gold = '#C47A2E';
const bg = '#FDFAF5';

const placeholderImg = 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80';

const PERFORMER_INFO = {
  Singer:        { color: '#E85C8A', bg: '#FFF0F5', label: 'Singer' },
  Band:          { color: '#5B8BE8', bg: '#EFF4FF', label: 'Live Band' },
  Anchor:        { color: '#E8A030', bg: '#FFF8EF', label: 'Anchor / MC' },
  Choreographer: { color: '#A050D0', bg: '#F8EFFF', label: 'Choreographer' },
  Musician:      { color: '#30A090', bg: '#EDFAF8', label: 'Musician' },
  Emcee:         { color: '#E87040', bg: '#FFF3EF', label: 'Emcee' },
};

export default function ArtistListingsPage() {
  const { serviceType } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(s => s.auth?.token);

  const activeType = PERFORMER_TYPES.find(p => p.type.toLowerCase() === serviceType?.toLowerCase()) || PERFORMER_TYPES[0];
  const info = PERFORMER_INFO[activeType.type] || { color: gold, bg: '#FFFCF5', label: activeType.label };

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [animDir, setAnimDir] = useState(null); // 'left' | 'right' | null
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Artist booking state
  const [showBookModal, setShowBookModal] = useState(false);
  const [showTCModal, setShowTCModal] = useState(false);
  const [tcChecked, setTCChecked] = useState(false);

  // Touch swipe
  const touchStartX = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setCurrentIdx(0);
    getVendors({ serviceTypes: [activeType.type], limit: 30, sortBy: 'rankingScore', sortOrder: 'desc' })
      .then(r => { setVendors(r?.vendors || []); })
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [activeType.type]);

  const go = useCallback((dir) => {
    setAnimDir(dir);
    setTimeout(() => {
      setCurrentIdx(i => dir === 'next'
        ? Math.min(i + 1, vendors.length - 1)
        : Math.max(i - 1, 0)
      );
      setAnimDir(null);
    }, 200);
  }, [vendors.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go('prev');
      if (e.key === 'ArrowRight') go('next');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const vendor = vendors[currentIdx] || null;
  const photo = vendor?.portfolioPhotos?.[0] || vendor?.image || placeholderImg;
  const rating = vendor?.rating ? Number(vendor.rating).toFixed(1) : null;

  const openBookModal = () => {
    if (!token) { navigate('/login'); return; }
    setTCChecked(false);
    setShowBookModal(true);
  };

  const confirmBooking = () => {
    if (!vendor) return;
    dispatch(setFinalisedVendor(vendor));
    dispatch(addSelectedVendor(vendor.serviceType));
    setShowTCModal(false);
    navigate('/booking/review');
  };

  // visible tabs: all 6 types, scroll on mobile
  const visibleTabs = PERFORMER_TYPES;

  return (
    <>
      <SEO
        title={`${activeType.label}s for Events — Tendr`}
        description={`Book the best ${activeType.label.toLowerCase()}s for your event. Browse artists, chat or book directly.`}
        path={`/artists/${activeType.type}`}
      />
      <BasicSpeedDial />
      <HamburgerNav title="Artists" />

      <div style={{ minHeight: '100vh', background: bg, fontFamily: font, paddingBottom: 80 }}>

        {/* Category tab strip */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(196,122,46,0.12)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', gap: 6, padding: '10px 16px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', alignItems: 'center' }}>
            <style>{`._cat-scroll::-webkit-scrollbar{display:none}`}</style>
            <div className="_cat-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
              {visibleTabs.map(p => {
                const isActive = p.type === activeType.type;
                const pinf = PERFORMER_INFO[p.type] || { color: gold, bg: '#fff' };
                return (
                  <button
                    key={p.type}
                    onClick={() => navigate(`/artists/${p.type}`)}
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 100,
                      border: `1.5px solid ${isActive ? pinf.color : 'rgba(196,122,46,0.18)'}`,
                      background: isActive ? pinf.bg : '#fff',
                      color: isActive ? pinf.color : '#9B7450',
                      fontSize: 12.5, fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{p.emoji}</span>
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '28px 24px 8px' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>{activeType.emoji}</div>
          <h1 style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 300, fontFamily: serif, color: '#1C0900', margin: '0 0 6px', fontStyle: 'italic' }}>
            {activeType.label}s for your event
          </h1>
          {!loading && vendors.length > 0 && (
            <div style={{ fontSize: 12, color: '#9B7450', fontWeight: 600 }}>
              {vendors.length} artist{vendors.length !== 1 ? 's' : ''} available
            </div>
          )}
        </div>

        {/* Carousel area */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 24px' }}>
            <div style={{ textAlign: 'center', color: '#9B7450' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎭</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Finding artists…</div>
            </div>
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9B7450' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>{activeType.emoji}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2C1A0E', marginBottom: 8 }}>No {activeType.label}s listed yet</div>
            <div style={{ fontSize: 13, marginBottom: 24 }}>We're onboarding artists in your city. Check back soon!</div>
            <button onClick={() => navigate('/artists')}
              style={{ padding: '10px 24px', borderRadius: 12, background: `linear-gradient(135deg,${gold},#CCAB4A)`, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
              Browse Other Categories
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 12px 0', gap: 12, position: 'relative' }}>

            {/* Left arrow */}
            <button
              onClick={() => go('prev')}
              disabled={currentIdx === 0}
              style={{
                flexShrink: 0, width: 48, height: 48, borderRadius: '50%',
                border: `2px solid ${currentIdx === 0 ? 'rgba(196,122,46,0.12)' : 'rgba(196,122,46,0.35)'}`,
                background: currentIdx === 0 ? 'rgba(196,122,46,0.04)' : '#fff',
                color: currentIdx === 0 ? 'rgba(196,122,46,0.25)' : gold,
                fontSize: 18, cursor: currentIdx === 0 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: currentIdx === 0 ? 'none' : '0 4px 16px rgba(196,122,46,0.18)',
                transition: 'all 0.2s',
              }}
              aria-label="Previous artist"
            >
              ‹
            </button>

            {/* Big vendor card */}
            <div
              ref={cardRef}
              onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={e => {
                if (touchStartX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                touchStartX.current = null;
                if (Math.abs(dx) < 40) return;
                if (dx < 0 && currentIdx < vendors.length - 1) go('next');
                if (dx > 0 && currentIdx > 0) go('prev');
              }}
              style={{
                flex: '1 1 0', maxWidth: 560, minWidth: 0,
                borderRadius: 28,
                background: '#fff',
                border: `1.5px solid ${info.color}30`,
                boxShadow: `0 8px 48px ${info.color}22`,
                overflow: 'hidden',
                opacity: animDir ? 0 : 1,
                transform: animDir === 'next' ? 'translateX(-24px)' : animDir === 'prev' ? 'translateX(24px)' : 'translateX(0)',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
                userSelect: 'none',
              }}
            >
              {/* Photo */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#1C0A04' }}>
                <img
                  src={photo}
                  alt={vendor?.name || activeType.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                  onError={e => { e.currentTarget.src = placeholderImg; }}
                />
                {/* Gradient overlay at bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(28,9,0,0.75), transparent)' }} />
                {/* Service type badge */}
                <div style={{ position: 'absolute', top: 14, left: 14, background: info.color, borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
                  {activeType.emoji} {activeType.label}
                </div>
                {/* Badges */}
                <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
                  {vendor?.isPhoneVerified && (
                    <span style={{ background: '#16a34a', borderRadius: 100, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#fff' }}>✓ Verified</span>
                  )}
                  {vendor?.isTopRated && (
                    <span style={{ background: 'linear-gradient(135deg,#C47A2E,#CCAB4A)', borderRadius: 100, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#fff' }}>⭐ Top Rated</span>
                  )}
                </div>
                {/* Name overlay */}
                <div style={{ position: 'absolute', bottom: 14, left: 18, right: 18 }}>
                  <div style={{ fontSize: 'clamp(1.2rem,4vw,1.6rem)', fontWeight: 300, fontFamily: serif, color: '#fff', fontStyle: 'italic', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    {vendor?.name || 'Artist'}
                  </div>
                  {vendor?.tagline && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>{vendor.tagline}</div>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '20px 22px 22px' }}>
                {/* Stats row */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  {rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: '#F59E0B', fontSize: 14 }}>★</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#2C1A0E' }}>{rating}</span>
                      {vendor.reviewCount > 0 && <span style={{ fontSize: 12, color: '#9B7450' }}>({vendor.reviewCount})</span>}
                    </div>
                  )}
                  {vendor?.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#9B7450' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {vendor.location}
                    </div>
                  )}
                  {vendor?.totalEventsCompleted > 0 && (
                    <div style={{ fontSize: 12.5, color: '#9B7450' }}>
                      🎪 {vendor.totalEventsCompleted} events done
                    </div>
                  )}
                  {vendor?.price > 0 && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: gold }}>
                      From ₹{Number(vendor.price).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                {/* Description */}
                {vendor?.description && (
                  <p style={{ fontSize: 13, color: '#5a3a1a', lineHeight: 1.55, margin: '0 0 18px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {vendor.description}
                  </p>
                )}

                {/* CTA buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={openBookModal}
                    style={{ flex: 1, padding: '13px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg,${info.color},${info.color}bb)`, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: font, boxShadow: `0 4px 16px ${info.color}40`, letterSpacing: '0.01em' }}
                  >
                    🎤 Book Artist
                  </button>
                  <button
                    onClick={() => navigate(`/vendor/${vendor._id}`)}
                    style={{ flexShrink: 0, padding: '13px 16px', borderRadius: 14, border: `1.5px solid rgba(196,122,46,0.25)`, background: '#fff', color: gold, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font }}
                  >
                    Profile →
                  </button>
                </div>
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={() => go('next')}
              disabled={currentIdx === vendors.length - 1}
              style={{
                flexShrink: 0, width: 48, height: 48, borderRadius: '50%',
                border: `2px solid ${currentIdx === vendors.length - 1 ? 'rgba(196,122,46,0.12)' : 'rgba(196,122,46,0.35)'}`,
                background: currentIdx === vendors.length - 1 ? 'rgba(196,122,46,0.04)' : '#fff',
                color: currentIdx === vendors.length - 1 ? 'rgba(196,122,46,0.25)' : gold,
                fontSize: 18, cursor: currentIdx === vendors.length - 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: currentIdx === vendors.length - 1 ? 'none' : '0 4px 16px rgba(196,122,46,0.18)',
                transition: 'all 0.2s',
              }}
              aria-label="Next artist"
            >
              ›
            </button>
          </div>
        )}

        {/* Counter + dots */}
        {vendors.length > 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '16px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {/* Dot indicators (up to 10) */}
            {vendors.length <= 20 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 320 }}>
                {vendors.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setAnimDir(i > currentIdx ? 'next' : 'prev'); setTimeout(() => { setCurrentIdx(i); setAnimDir(null); }, 200); }}
                    style={{
                      width: i === currentIdx ? 20 : 8, height: 8, borderRadius: 100,
                      background: i === currentIdx ? info.color : 'rgba(196,122,46,0.18)',
                      border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s',
                    }}
                    aria-label={`Go to artist ${i + 1}`}
                  />
                ))}
              </div>
            )}
            <span style={{ fontSize: 12, color: '#B8956A', fontWeight: 600 }}>
              {currentIdx + 1} of {vendors.length}
            </span>
          </div>
        )}

        {/* Bottom hint */}
        {vendors.length > 1 && !loading && (
          <p style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(155,116,80,0.6)', marginTop: 8, padding: '0 24px' }}>
            Use arrow keys or swipe to browse
          </p>
        )}

      </div>

      {/* ── Book Artist modal: Chat or Book Directly ── */}
      {showBookModal && vendor && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowBookModal(false)}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '30px 26px', maxWidth: 420, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.28)', fontFamily: font }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: info.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Book Artist</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: '#2C1A0E', lineHeight: 1.2 }}>{vendor.name}</div>
                <div style={{ fontSize: 12.5, color: '#9B7450', marginTop: 3 }}>{activeType.label} · How would you like to proceed?</div>
              </div>
              <button onClick={() => setShowBookModal(false)} style={{ background: 'rgba(196,122,46,0.08)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#9B7450', flexShrink: 0 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => { setShowBookModal(false); navigate(`/vendor/${vendor._id}`); }}
                style={{ padding: '18px 20px', borderRadius: 16, border: '2px solid rgba(196,122,46,0.2)', background: '#FDFAF5', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.border = `2px solid ${gold}`; e.currentTarget.style.background = 'rgba(196,122,46,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '2px solid rgba(196,122,46,0.2)'; e.currentTarget.style.background = '#FDFAF5'; }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(196,122,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💬</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#2C1A0E', marginBottom: 3 }}>Chat with Artist</div>
                  <div style={{ fontSize: 12, color: '#9B7450', lineHeight: 1.4 }}>Discuss details, availability and pricing. Finalize and pay after approval.</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <button
                onClick={() => { setShowBookModal(false); setTCChecked(false); setShowTCModal(true); }}
                style={{ padding: '18px 20px', borderRadius: 16, border: '2px solid rgba(196,122,46,0.2)', background: `linear-gradient(135deg, ${info.bg}, rgba(204,171,74,0.04))`, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.border = `2px solid ${gold}`}
                onMouseLeave={e => e.currentTarget.style.border = '2px solid rgba(196,122,46,0.2)'}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,${info.color},${info.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⚡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#2C1A0E', marginBottom: 3 }}>Book Directly</div>
                  <div style={{ fontSize: 12, color: '#9B7450', lineHeight: 1.4 }}>Add to your booking and proceed to payment. Confirmed within hours.</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <p style={{ fontSize: 11.5, color: '#B8956A', textAlign: 'center', margin: '18px 0 0', lineHeight: 1.4 }}>
              Both options handled by Tendr. Payment collected after final confirmation.
            </p>
          </div>
        </div>
      )}

      {/* ── T&C modal ── */}
      {showTCModal && vendor && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2001, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowTCModal(false)}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '30px 26px', maxWidth: 440, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.28)', fontFamily: font }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#2C1A0E', marginBottom: 5 }}>Artist Booking Terms</div>
              <div style={{ fontSize: 12.5, color: '#9B7450' }}>Please review before proceeding</div>
            </div>

            <div style={{ background: '#FDFAF5', borderRadius: 14, padding: '16px 18px', marginBottom: 18, fontSize: 12.5, color: '#5a3a1a', lineHeight: 1.6 }}>
              {[
                'By booking, you are requesting this artist through Tendr\'s platform.',
                'Final pricing and availability will be confirmed by our team within 2–4 hours.',
                'Payment is due before the event date. You will be guided to complete payment via the Review & Pay page.',
                'Cancellation must be made at least 48 hours before the event for a full refund.',
                'Tendr acts as a facilitator — we ensure quality and timely communication between you and the artist.',
              ].map((t, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                  <span style={{ color: gold, fontWeight: 700, flexShrink: 0 }}>·</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
              <input type="checkbox" checked={tcChecked} onChange={e => setTCChecked(e.target.checked)}
                style={{ width: 17, height: 17, accentColor: gold, marginTop: 2, flexShrink: 0, cursor: 'pointer' }} />
              <span style={{ fontSize: 12.5, color: '#5a3a1a', lineHeight: 1.45 }}>
                I have read and agree to the artist booking terms and conditions.
              </span>
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowTCModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid rgba(196,122,46,0.25)', background: '#fff', color: '#9B7450', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                Back
              </button>
              <button
                disabled={!tcChecked}
                onClick={confirmBooking}
                style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: tcChecked ? `linear-gradient(135deg,${gold},#CCAB4A)` : 'rgba(196,122,46,0.2)', color: tcChecked ? '#fff' : 'rgba(196,122,46,0.5)', fontSize: 13.5, fontWeight: 800, cursor: tcChecked ? 'pointer' : 'default', fontFamily: font, boxShadow: tcChecked ? '0 4px 16px rgba(196,122,46,0.4)' : 'none', transition: 'all 0.2s' }}>
                Confirm &amp; Proceed to Pay →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

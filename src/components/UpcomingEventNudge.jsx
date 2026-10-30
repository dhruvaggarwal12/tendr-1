import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const INITIAL_DELAY_MS = 2 * 60 * 1000;  // first appears 2 min after landing
const REPEAT_INTERVAL_MS = 15 * 60 * 1000; // re-appears every 15 min after that
const gold   = '#C47A2E';
const goldLt = '#CCAB4A';
const ink    = '#2C1A0E';
const font   = "'Outfit', sans-serif";

export default function UpcomingEventNudge() {
  const { token } = useSelector((s) => s.auth);
  const [visible, setVisible] = useState(false);
  const navigate   = useNavigate();
  const location   = useLocation();
  const timerRef   = useRef(null);

  // Don't show on auth or vendor pages
  const isVendorPage   = location.pathname.startsWith('/vendor-dashboard') || location.pathname.startsWith('/vendor/');
  const isAuthPage     = location.pathname.startsWith('/auth') || location.pathname.startsWith('/otp');
  const isDashboard    = location.pathname === '/dashboard';

  const schedule = (delay) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!isVendorPage && !isAuthPage && !isDashboard) setVisible(true);
    }, delay);
  };

  // Only (re-)arms the initial 2-minute timer on navigation — a route change while
  // already waiting shouldn't reset a 15-minute repeat back down to 2 minutes.
  useEffect(() => {
    if (!visible) schedule(INITIAL_DELAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  const dismiss = () => {
    setVisible(false);
    schedule(REPEAT_INTERVAL_MS);
  };

  const handleCTA = () => {
    setVisible(false);
    schedule(REPEAT_INTERVAL_MS);
    if (token) {
      navigate('/dashboard', { state: { scrollTo: 'upcoming-events' } });
    } else {
      navigate('/auth', { state: { next: '/dashboard', scrollTo: 'upcoming-events' } });
    }
  };

  if (!visible) return null;

  return (
    <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', zIndex:9000, width:'calc(100% - 32px)', maxWidth:300, fontFamily:font }}>
      <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 10px 36px rgba(44,26,14,0.16)', border:'1.5px solid rgba(196,122,46,0.2)', overflow:'hidden' }}>
        {/* Gold top bar */}
        <div style={{ height:3, background:`linear-gradient(90deg,${gold},${goldLt})` }} />

        <div style={{ padding:'13px 13px 12px', position:'relative' }}>
          {/* Close */}
          <button onClick={dismiss}
            style={{ position:'absolute', top:9, right:9, background:'none', border:'none', color:'#C4B09A', fontSize:13, cursor:'pointer', lineHeight:1, padding:4 }}
            aria-label="Dismiss">✕</button>

          {/* Icon + headline */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'rgba(196,122,46,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>
              🎉
            </div>
            <div style={{ minWidth:0, paddingRight:14 }}>
              <div style={{ fontSize:12.5, fontWeight:800, color:ink, lineHeight:1.25, marginBottom:3 }}>
                Got an event coming up?
              </div>
              <div style={{ fontSize:11, color:'#9B7450', lineHeight:1.4 }}>
                Save it once — get vendor suggestions and reminders before your date.
              </div>
            </div>
          </div>

          {/* CTA */}
          <button onClick={handleCTA}
            style={{ marginTop:10, width:'100%', padding:'8px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:font, boxShadow:'0 3px 10px rgba(196,122,46,0.3)' }}>
            {token ? 'Set My Upcoming Events →' : 'Sign in & Set Events →'}
          </button>
        </div>
      </div>
    </div>
  );
}

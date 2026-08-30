import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
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

  const schedule = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!isVendorPage && !isAuthPage && !isDashboard) setVisible(true);
    }, INTERVAL_MS);
  };

  useEffect(() => {
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  const dismiss = () => {
    setVisible(false);
    schedule(); // re-arm for next 7 min
  };

  const handleCTA = () => {
    setVisible(false);
    if (token) {
      navigate('/dashboard', { state: { scrollTo: 'upcoming-events' } });
    } else {
      navigate('/auth', { state: { next: '/dashboard', scrollTo: 'upcoming-events' } });
    }
  };

  if (!visible) return null;

  return (
    <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', zIndex:9000, width:'calc(100% - 32px)', maxWidth:380, fontFamily:font }}>
      <div style={{ background:'#fff', borderRadius:20, boxShadow:'0 12px 48px rgba(44,26,14,0.18)', border:'1.5px solid rgba(196,122,46,0.2)', overflow:'hidden' }}>
        {/* Gold top bar */}
        <div style={{ height:4, background:`linear-gradient(90deg,${gold},${goldLt})` }} />

        <div style={{ padding:'18px 18px 16px' }}>
          {/* Close */}
          <button onClick={dismiss}
            style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:'#C4B09A', fontSize:16, cursor:'pointer', lineHeight:1, padding:4 }}
            aria-label="Dismiss">✕</button>

          {/* Icon + headline */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'rgba(196,122,46,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:22 }}>
              🎉
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:ink, lineHeight:1.25, marginBottom:4 }}>
                Got an event coming up?
              </div>
              <div style={{ fontSize:12.5, color:'#9B7450', lineHeight:1.5 }}>
                Save it once — get vendor suggestions and reminders 30, 14 and 7 days before.
              </div>
            </div>
          </div>

          {/* CTA */}
          <button onClick={handleCTA}
            style={{ marginTop:14, width:'100%', padding:'11px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font, boxShadow:'0 4px 14px rgba(196,122,46,0.3)' }}>
            {token ? 'Set My Upcoming Events →' : 'Sign in & Set Events →'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';

const gold   = '#C47A2E';
const goldLt = '#CCAB4A';
const ink    = '#2C1A0E';
const cream  = '#FFFCF5';
const font   = "'Outfit', sans-serif";

const EVENT_OPTS = [
  'Weddings','Birthdays','Corporate Events','House Parties',
  'Anniversaries','Baby Showers','College Fests','Award Nights',
  'Product Launches','Sangeet / Mehendi','Haldi','Kitty Parties',
];

// ── Template render functions ─────────────────────────────────────────────────
// Each receives { name, tagline, phone, events, photo, accent } and returns JSX
// All templates are 400 × 600 px so html2canvas captures consistently.

const SIZE = { width: 400, height: 600 };

function T1_RoyalGold({ d }) {
  // Deep navy, centered, gold accents
  return (
    <div style={{ ...SIZE, background:'#110B2E', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', padding:'40px 32px 28px', boxSizing:'border-box', fontFamily:font, position:'relative', overflow:'hidden' }}>
      {/* Background circle */}
      <div style={{ position:'absolute', width:320, height:320, borderRadius:'50%', border:`1px solid rgba(196,122,46,0.18)`, top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', border:`1px solid rgba(196,122,46,0.1)`, top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />

      {/* Top */}
      <div style={{ textAlign:'center', zIndex:1 }}>
        <div style={{ fontSize:11, fontWeight:700, color:d.accent, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:8 }}>✦ Available for Bookings ✦</div>
      </div>

      {/* Photo */}
      {d.photo ? (
        <div style={{ width:130, height:130, borderRadius:'50%', overflow:'hidden', border:`3px solid ${d.accent}`, boxShadow:`0 0 0 6px rgba(196,122,46,0.15)`, zIndex:1 }}>
          <img src={d.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      ) : (
        <div style={{ width:130, height:130, borderRadius:'50%', background:`rgba(196,122,46,0.12)`, border:`3px solid ${d.accent}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, zIndex:1 }}>🎵</div>
      )}

      {/* Name + tagline */}
      <div style={{ textAlign:'center', zIndex:1 }}>
        <div style={{ fontSize:26, fontWeight:900, color:'#fff', lineHeight:1.2, letterSpacing:'-0.01em', marginBottom:6 }}>{d.name || 'Your Name'}</div>
        {d.tagline && <div style={{ fontSize:13, color:d.accent, fontWeight:600, marginBottom:14 }}>{d.tagline}</div>}
        {d.events.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginTop:6 }}>
            {d.events.slice(0,5).map(e => (
              <span key={e} style={{ fontSize:10.5, fontWeight:600, color:'rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.07)', padding:'4px 10px', borderRadius:100, border:'1px solid rgba(255,255,255,0.1)' }}>{e}</span>
            ))}
          </div>
        )}
      </div>

      {/* Phone */}
      {d.phone && (
        <div style={{ fontSize:14, fontWeight:700, color:'#fff', background:`rgba(196,122,46,0.2)`, padding:'8px 22px', borderRadius:100, border:`1px solid ${d.accent}`, zIndex:1 }}>
          📞 {d.phone}
        </div>
      )}

      {/* Tendr branding */}
      <div style={{ textAlign:'center', zIndex:1 }}>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', letterSpacing:'0.1em' }}>Book via</div>
        <div style={{ fontSize:13, fontWeight:800, color:d.accent, letterSpacing:'0.05em' }}>tendr.in</div>
      </div>
    </div>
  );
}

function T2_CleanIvory({ d }) {
  // Clean ivory, gold underline, minimal
  return (
    <div style={{ ...SIZE, background:'#FEFAF3', display:'flex', flexDirection:'column', fontFamily:font, position:'relative', overflow:'hidden' }}>
      {/* Top accent */}
      <div style={{ height:5, background:`linear-gradient(90deg,${d.accent},${goldLt})` }} />

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'28px 36px', gap:20 }}>
        {/* Photo */}
        {d.photo ? (
          <div style={{ width:110, height:110, borderRadius:20, overflow:'hidden', boxShadow:'0 8px 24px rgba(196,122,46,0.2)' }}>
            <img src={d.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        ) : (
          <div style={{ width:110, height:110, borderRadius:20, background:`rgba(196,122,46,0.08)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>🎤</div>
        )}

        {/* Name */}
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:28, fontWeight:900, color:ink, letterSpacing:'-0.02em', lineHeight:1.1 }}>{d.name || 'Your Name'}</div>
          <div style={{ width:40, height:3, background:d.accent, borderRadius:2, margin:'10px auto' }} />
          {d.tagline && <div style={{ fontSize:13, color:'#7B5E3F', fontWeight:500, marginTop:4 }}>{d.tagline}</div>}
        </div>

        {/* Events */}
        {d.events.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, justifyContent:'center' }}>
            {d.events.slice(0,6).map(e => (
              <span key={e} style={{ fontSize:11, fontWeight:600, color:ink, background:`rgba(196,122,46,0.1)`, padding:'4px 12px', borderRadius:100 }}>{e}</span>
            ))}
          </div>
        )}

        {/* Phone */}
        {d.phone && <div style={{ fontSize:15, fontWeight:700, color:d.accent }}>📞 {d.phone}</div>}
      </div>

      {/* Bottom branding */}
      <div style={{ height:36, background:ink, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:11, fontWeight:800, color:d.accent, letterSpacing:'0.12em' }}>TENDR.IN</span>
      </div>
    </div>
  );
}

function T3_MidnightPro({ d }) {
  // Pure black, punchy, gold text
  return (
    <div style={{ ...SIZE, background:'#0A0A0A', display:'flex', flexDirection:'column', fontFamily:font, overflow:'hidden' }}>
      {/* Gold side bar */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:`linear-gradient(180deg,${d.accent},${goldLt},${d.accent})` }} />

      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'36px 32px 28px 40px' }}>
        {/* Header */}
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:d.accent, letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:20 }}>FOR HIRE</div>
          {d.photo && (
            <div style={{ width:'100%', height:180, borderRadius:14, overflow:'hidden', marginBottom:20 }}>
              <img src={d.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'contrast(1.05)' }} />
            </div>
          )}
          <div style={{ fontSize:32, fontWeight:900, color:'#fff', lineHeight:1.1, letterSpacing:'-0.02em' }}>{d.name || 'YOUR NAME'}</div>
          {d.tagline && <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', fontWeight:500, marginTop:8 }}>{d.tagline}</div>}
        </div>

        {/* Events */}
        {d.events.length > 0 && (
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:d.accent, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:10 }}>AVAILABLE FOR</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {d.events.slice(0,5).map(e => (
                <div key={e} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:4, height:4, borderRadius:'50%', background:d.accent, flexShrink:0 }} />
                  <span style={{ fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,0.8)' }}>{e}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          {d.phone && <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{d.phone}</div>}
          <div style={{ fontSize:11, fontWeight:800, color:d.accent, letterSpacing:'0.1em' }}>tendr.in</div>
        </div>
      </div>
    </div>
  );
}

function T4_WarmSaffron({ d }) {
  // Warm orange/gold gradient, white text, festive
  return (
    <div style={{ ...SIZE, background:`linear-gradient(160deg,#C47A2E 0%,#E8922A 40%,#F5A623 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', padding:'36px 28px 28px', fontFamily:font, position:'relative', overflow:'hidden' }}>
      {/* Decorative circles */}
      <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.06)', top:-80, right:-80, pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.05)', bottom:-60, left:-60, pointerEvents:'none' }} />

      <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.8)', letterSpacing:'0.2em', textTransform:'uppercase', zIndex:1 }}>✦ BOOK NOW ✦</div>

      {/* Photo */}
      {d.photo ? (
        <div style={{ width:140, height:140, borderRadius:'50%', overflow:'hidden', border:'4px solid rgba(255,255,255,0.5)', boxShadow:'0 8px 32px rgba(0,0,0,0.2)', zIndex:1 }}>
          <img src={d.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      ) : (
        <div style={{ width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'4px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, zIndex:1 }}>🎉</div>
      )}

      <div style={{ textAlign:'center', zIndex:1 }}>
        <div style={{ fontSize:30, fontWeight:900, color:'#fff', lineHeight:1.1, textShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>{d.name || 'Your Name'}</div>
        {d.tagline && <div style={{ fontSize:13, color:'rgba(255,255,255,0.88)', marginTop:6, fontWeight:500 }}>{d.tagline}</div>}
        {d.events.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginTop:14 }}>
            {d.events.slice(0,5).map(e => (
              <span key={e} style={{ fontSize:10.5, fontWeight:700, color:'#C47A2E', background:'rgba(255,255,255,0.92)', padding:'4px 11px', borderRadius:100 }}>{e}</span>
            ))}
          </div>
        )}
      </div>

      {d.phone && <div style={{ fontSize:15, fontWeight:700, color:'#fff', background:'rgba(0,0,0,0.18)', padding:'9px 24px', borderRadius:100, zIndex:1 }}>📞 {d.phone}</div>}

      <div style={{ textAlign:'center', zIndex:1 }}>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.6)', letterSpacing:'0.15em', textTransform:'uppercase' }}>Powered by</div>
        <div style={{ fontSize:14, fontWeight:900, color:'#fff', letterSpacing:'0.06em' }}>tendr.in</div>
      </div>
    </div>
  );
}

function T5_SplitCard({ d }) {
  // Left dark photo half, right cream info half
  return (
    <div style={{ ...SIZE, display:'flex', fontFamily:font, overflow:'hidden' }}>
      {/* Left: photo / accent */}
      <div style={{ width:'42%', background:`linear-gradient(180deg,${ink} 0%,#3D2010 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'24px 16px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', border:`1px solid rgba(196,122,46,0.2)`, top:'-20%', left:'-30%', pointerEvents:'none' }} />
        {d.photo ? (
          <div style={{ width:110, height:110, borderRadius:'50%', overflow:'hidden', border:`3px solid ${d.accent}` }}>
            <img src={d.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        ) : (
          <div style={{ width:110, height:110, borderRadius:'50%', background:'rgba(196,122,46,0.1)', border:`3px solid ${d.accent}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>🎵</div>
        )}
        <div style={{ width:3, height:40, background:d.accent, borderRadius:2 }} />
        <div style={{ fontSize:10, fontWeight:700, color:d.accent, textTransform:'uppercase', letterSpacing:'0.18em', textAlign:'center', lineHeight:1.6 }}>tendr.in</div>
      </div>

      {/* Right: info */}
      <div style={{ flex:1, background:'#FEFAF3', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'32px 22px' }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:d.accent, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:10 }}>Available for Bookings</div>
          <div style={{ fontSize:22, fontWeight:900, color:ink, lineHeight:1.2, marginBottom:6 }}>{d.name || 'Your Name'}</div>
          <div style={{ width:28, height:3, background:d.accent, borderRadius:2, marginBottom:10 }} />
          {d.tagline && <div style={{ fontSize:12, color:'#7B5E3F', fontWeight:500, lineHeight:1.5 }}>{d.tagline}</div>}
        </div>

        {d.events.length > 0 && (
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>For</div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {d.events.slice(0,6).map(e => (
                <div key={e} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:d.accent, flexShrink:0 }} />
                  <span style={{ fontSize:11.5, color:ink, fontWeight:600 }}>{e}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {d.phone && (
          <div style={{ background:`rgba(196,122,46,0.08)`, borderRadius:10, padding:'10px 14px', border:`1px solid rgba(196,122,46,0.2)` }}>
            <div style={{ fontSize:9, color:'#9B7450', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3 }}>Contact</div>
            <div style={{ fontSize:13, fontWeight:700, color:ink }}>📞 {d.phone}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function T6_FestiveNight({ d }) {
  // Deep purple with gold/rose gradient headline, festive
  return (
    <div style={{ ...SIZE, background:'#1C0E3A', display:'flex', flexDirection:'column', alignItems:'center', fontFamily:font, position:'relative', overflow:'hidden' }}>
      {/* Top decoration */}
      <div style={{ width:'100%', height:90, background:`linear-gradient(180deg,rgba(196,122,46,0.18) 0%,transparent 100%)`, position:'absolute', top:0 }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(196,122,46,0.08) 0%,transparent 70%)', top:'30%', left:'50%', transform:'translateX(-50%)', pointerEvents:'none' }} />

      {/* Stars */}
      <div style={{ position:'absolute', top:18, left:0, right:0, textAlign:'center', fontSize:16, letterSpacing:12, opacity:0.6, zIndex:1 }}>✦ ✦ ✦</div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-evenly', padding:'48px 28px 28px', width:'100%', boxSizing:'border-box', zIndex:1 }}>
        {/* Photo */}
        {d.photo ? (
          <div style={{ width:120, height:120, borderRadius:18, overflow:'hidden', boxShadow:`0 0 0 3px ${d.accent}, 0 0 0 6px rgba(196,122,46,0.2)` }}>
            <img src={d.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        ) : (
          <div style={{ width:120, height:120, borderRadius:18, background:'rgba(196,122,46,0.1)', boxShadow:`0 0 0 3px ${d.accent}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:46 }}>🎶</div>
        )}

        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:29, fontWeight:900, background:`linear-gradient(135deg,${d.accent},#F5C842,${d.accent})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1.2 }}>
            {d.name || 'Your Name'}
          </div>
          {d.tagline && <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.6)', fontWeight:500, marginTop:8 }}>{d.tagline}</div>}
        </div>

        {d.events.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, justifyContent:'center' }}>
            {d.events.slice(0,5).map(e => (
              <span key={e} style={{ fontSize:10.5, fontWeight:600, color:d.accent, border:`1px solid rgba(196,122,46,0.4)`, padding:'4px 12px', borderRadius:100 }}>{e}</span>
            ))}
          </div>
        )}

        {d.phone && <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>📞 {d.phone}</div>}

        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', letterSpacing:'0.15em' }}>DISCOVER · BOOK · CELEBRATE</div>
          <div style={{ fontSize:13, fontWeight:800, color:d.accent, letterSpacing:'0.08em', marginTop:3 }}>tendr.in</div>
        </div>
      </div>
    </div>
  );
}

function T7_Editorial({ d }) {
  // Bold editorial — white bg, oversized name, gold rule
  return (
    <div style={{ ...SIZE, background:'#fff', display:'flex', flexDirection:'column', fontFamily:font, overflow:'hidden' }}>
      {/* Photo full bleed top */}
      {d.photo ? (
        <div style={{ height:220, overflow:'hidden', flexShrink:0 }}>
          <img src={d.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          <div style={{ position:'absolute', top:0, left:0, right:0, height:220, background:'linear-gradient(180deg,transparent 50%,rgba(255,255,255,0.4) 100%)' }} />
        </div>
      ) : (
        <div style={{ height:180, background:`linear-gradient(135deg,${d.accent} 0%,${goldLt} 100%)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:64 }}>🎵</div>
      )}

      <div style={{ flex:1, padding:'22px 28px 20px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        {/* Name */}
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:d.accent, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:8 }}>Now Booking</div>
          <div style={{ fontSize:30, fontWeight:900, color:ink, lineHeight:1.05, letterSpacing:'-0.02em' }}>{d.name || 'Your Name'}</div>
          <div style={{ height:3, width:'100%', background:`linear-gradient(90deg,${d.accent},transparent)`, marginTop:10, marginBottom:10, borderRadius:2 }} />
          {d.tagline && <div style={{ fontSize:13, color:'#6B4F3A', lineHeight:1.5 }}>{d.tagline}</div>}
        </div>

        {/* Events grid */}
        {d.events.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {d.events.slice(0,6).map(e => (
              <span key={e} style={{ fontSize:10.5, fontWeight:700, color:ink, background:'rgba(44,26,14,0.06)', padding:'4px 10px', borderRadius:6 }}>{e}</span>
            ))}
          </div>
        )}

        {/* Footer row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, borderTop:'1px solid rgba(196,122,46,0.15)' }}>
          {d.phone ? <div style={{ fontSize:13, fontWeight:700, color:ink }}>📞 {d.phone}</div> : <div />}
          <div style={{ fontSize:11, fontWeight:800, color:d.accent, letterSpacing:'0.1em' }}>tendr.in</div>
        </div>
      </div>
    </div>
  );
}

const TEMPLATES = [
  { id: 1, name: 'Royal Gold',    preview: '🌙', Comp: T1_RoyalGold  },
  { id: 2, name: 'Clean Ivory',   preview: '☀️', Comp: T2_CleanIvory  },
  { id: 3, name: 'Midnight Pro',  preview: '⚫', Comp: T3_MidnightPro },
  { id: 4, name: 'Warm Saffron',  preview: '🟠', Comp: T4_WarmSaffron },
  { id: 5, name: 'Split Card',    preview: '🎴', Comp: T5_SplitCard   },
  { id: 6, name: 'Festive Night', preview: '💜', Comp: T6_FestiveNight },
  { id: 7, name: 'Editorial',     preview: '📰', Comp: T7_Editorial   },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function FlyerBuilder({ vendorName = '', serviceType = '' }) {
  const [sel, setSel]         = useState(1);
  const [name, setName]       = useState(vendorName);
  const [tagline, setTagline] = useState(serviceType ? `Professional ${serviceType}` : '');
  const [phone, setPhone]     = useState('');
  const [events, setEvents]   = useState([]);
  const [photo, setPhoto]     = useState(null);
  const [accent, setAccent]   = useState(gold);
  const [downloading, setDl]  = useState(false);

  const previewRef = useRef(null);

  const toggleEvent = (e) => setEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const handlePhoto = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (r) => setPhoto(r.target.result);
    reader.readAsDataURL(file);
  };

  const download = useCallback(async () => {
    if (!previewRef.current) return;
    setDl(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2.5, useCORS: true, backgroundColor: null });
      const link   = document.createElement('a');
      link.download = `${name || 'flyer'}-tendr.png`;
      link.href    = canvas.toDataURL('image/png');
      link.click();
    } catch {}
    setDl(false);
  }, [name]);

  const d = { name, tagline, phone, events, photo, accent };
  const SelComp = TEMPLATES.find(t => t.id === sel)?.Comp;

  return (
    <div style={{ fontFamily: font, color: ink }}>
      <div style={{ fontSize: 13, color: '#9B7450', marginBottom: 20, lineHeight: 1.6 }}>
        Pick a template, fill in your details, and download a flyer to share with clients on WhatsApp or Instagram.
      </div>

      {/* ── Template picker ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Choose Template</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setSel(t.id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '12px 14px', borderRadius: 12, border: sel === t.id ? `2px solid ${gold}` : '1.5px solid rgba(196,122,46,0.18)', background: sel === t.id ? 'rgba(196,122,46,0.06)' : '#fff', cursor: 'pointer', minWidth: 70, fontFamily: font }}>
              <span style={{ fontSize: 22 }}>{t.preview}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: sel === t.id ? gold : '#9B7450' }}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* ── Form ── */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Your Name *">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. DJ Rahul" style={inp} />
          </Field>

          <Field label="Tagline">
            <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Premium DJ for all occasions" style={inp} />
          </Field>

          <Field label="Phone / WhatsApp">
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" style={inp} />
          </Field>

          <Field label="Accent Colour">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="color" value={accent} onChange={e => setAccent(e.target.value)}
                style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid rgba(196,122,46,0.3)', padding: 2, cursor: 'pointer', background: 'none' }} />
              <span style={{ fontSize: 12, color: '#9B7450' }}>{accent}</span>
              <button onClick={() => setAccent(gold)} style={{ fontSize: 11, color: gold, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Reset</button>
            </div>
          </Field>

          <Field label="Your Photo (optional)">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ padding: '8px 16px', borderRadius: 9, border: `1.5px dashed rgba(196,122,46,0.4)`, background: 'rgba(196,122,46,0.04)', fontSize: 13, fontWeight: 600, color: gold }}>
                {photo ? '✓ Photo added' : '+ Upload Photo'}
              </div>
              {photo && <button onClick={() => setPhoto(null)} style={{ fontSize: 11, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>}
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
          </Field>

          <Field label="Event Types">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {EVENT_OPTS.map(e => (
                <button key={e} onClick={() => toggleEvent(e)}
                  style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 100, border: events.includes(e) ? `1.5px solid ${gold}` : '1.5px solid rgba(196,122,46,0.2)', background: events.includes(e) ? `rgba(196,122,46,0.1)` : '#fff', color: events.includes(e) ? gold : '#9B7450', cursor: 'pointer', fontFamily: font }}>
                  {e}
                </button>
              ))}
            </div>
          </Field>

          <button onClick={download} disabled={downloading}
            style={{ marginTop: 6, width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: downloading ? 'rgba(196,122,46,0.4)' : `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontSize: 14, fontWeight: 800, cursor: downloading ? 'wait' : 'pointer', fontFamily: font, boxShadow: '0 4px 14px rgba(196,122,46,0.3)' }}>
            {downloading ? 'Generating…' : '⬇ Download Flyer (PNG)'}
          </button>
        </div>

        {/* ── Live preview ── */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'flex-start' }}>Preview</div>
          <div ref={previewRef} style={{ width: SIZE.width, height: SIZE.height, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 40px rgba(44,26,14,0.18)', position: 'relative', flexShrink: 0, transform: 'scale(0.65)', transformOrigin: 'top center', marginBottom: -210 }}>
            {SelComp && <SelComp d={d} />}
          </div>
          <div style={{ fontSize: 11, color: '#BDA282', marginTop: 4 }}>400 × 600 px · Downloads full size</div>
        </div>
      </div>
    </div>
  );
}

const inp = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid rgba(196,122,46,0.2)', fontFamily: font, fontSize: 13.5, color: ink, outline: 'none', background: '#FFFCF5', boxSizing: 'border-box' };

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

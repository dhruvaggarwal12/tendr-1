import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import HamburgerNav from '../../components/HamburgerNav';

const font = "'Outfit', sans-serif";
const gold = "#C47A2E";

const VENDOR_TYPES = ["Decorator","Photographer","Caterer","DJ / Music","Venue","Gift Hampers","Cake","Makeup Artist","Other"];
const VIBES = ["Traditional / Classic","Modern / Minimalist","Luxurious / Grand","Fun & Colourful","Intimate & Personal","Outdoor / Garden","Bollywood / Themed"];

/* Read saved event data from redux first, fall back to localStorage */
function useSavedEvent() {
  const redux = useSelector(s => s.eventPlanning?.formData || {});
  return useMemo(() => {
    if (redux.eventType) return redux;
    try {
      const raw = localStorage.getItem('tendr_ep_session');
      return raw ? (JSON.parse(raw).formData || {}) : {};
    } catch { return {}; }
  }, [redux]);
}

function Chip({ label, selected, onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding:'7px 14px', borderRadius:100, border:`1.5px solid ${selected ? gold : 'rgba(196,122,46,0.25)'}`, background: selected ? 'rgba(196,122,46,0.1)' : '#fff', color: selected ? gold : '#6B4226', fontSize:13, fontWeight: selected ? 700 : 500, cursor:'pointer', fontFamily:font, transition:'all 0.15s' }}>
      {label}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type='text', readOnly }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <label style={{ fontSize:11, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
        style={{ padding:'9px 12px', borderRadius:10, border:`1.5px solid ${readOnly ? 'rgba(196,122,46,0.12)' : 'rgba(196,122,46,0.25)'}`, fontSize:13, fontFamily:font, outline:'none', color:'#2C1A0E', background: readOnly ? 'rgba(196,122,46,0.04)' : '#fff', boxSizing:'border-box', width:'100%' }}
      />
    </div>
  );
}

export default function VendorBrief() {
  const saved = useSavedEvent();

  const [f, setF] = useState({
    name:       '',
    phone:      '',
    eventType:  saved.eventType  || '',
    date:       saved.date       || '',
    city:       saved.location   || '',
    venue:      '',
    guests:     saved.guestCount ? String(saved.guestCount) : (saved.guests || ''),
    budget:     saved.budget     || '',
    vendorType: '',
    vibe:       '',
    notes:      '',
  });

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggle = (k, v) => set(k, f[k] === v ? '' : v);

  const hasEvent = !!(saved.eventType || saved.location || saved.date);

  /* Live brief text */
  const briefLines = [
    `Hi! I'm ${f.name || 'a customer'}${f.phone ? ` (+91 ${f.phone.replace(/^(\+91|0)/,'')})` : ''} and I'm planning a${f.eventType ? ' ' + f.eventType : 'n event'}.`,
    '',
    `📅 Event Date: ${f.date || 'TBD'}`,
    `📍 City / Venue: ${f.city || 'TBD'}${f.venue ? ' — ' + f.venue : ''}`,
    `👥 Guest Count: ${f.guests || 'TBD'}`,
    `💰 Budget: ${f.budget || 'To be discussed'}`,
    f.vibe ? `🎨 Style / Vibe: ${f.vibe}` : '',
    '',
    `I'm looking for: ${f.vendorType || 'a vendor'}`,
    f.notes ? `📝 Additional details: ${f.notes}` : '',
    '',
    'Please share your availability, portfolio, and package details.',
    'Looking forward to hearing from you!',
  ].filter(l => l !== null);

  const briefText = briefLines.join('\n');
  const canShare = !!(f.vendorType);

  const copyBrief = async () => {
    await navigator.clipboard?.writeText(briefText);
    alert('Brief copied!');
  };

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(briefText)}`, '_blank');

  return (
    <div style={{ minHeight:'100vh', background:'#FFFCF5', fontFamily:font }}>
      <HamburgerNav/>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'28px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:11, fontWeight:800, color:gold, textTransform:'uppercase', letterSpacing:'0.16em', margin:'0 0 6px' }}>Vendor Brief</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(1.8rem,5vw,2.4rem)', fontWeight:400, color:'#2C1A0E', margin:'0 0 6px' }}>
            Share your requirements instantly
          </h1>
          <p style={{ fontSize:13, color:'#9B7450', margin:0, lineHeight:1.6 }}>
            {hasEvent
              ? 'We\'ve pre-filled your event details from your planning form. Edit anything, pick a vendor type, and share.'
              : 'Fill in your event details and get a ready-to-send brief for any vendor.'}
          </p>
        </div>

        {/* Pre-fill notice */}
        {hasEvent && (
          <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(34,197,94,0.07)', border:'1.5px solid rgba(34,197,94,0.2)', borderRadius:12, padding:'10px 16px', marginBottom:20 }}>
            <span style={{ fontSize:18 }}>✓</span>
            <span style={{ fontSize:13, color:'#166534', fontWeight:600 }}>Event details loaded from your planning form. All fields are editable.</span>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }} className="brief-grid">

          {/* ── Left: form ───────────────────────────────────────── */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Event details */}
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid rgba(196,122,46,0.15)', padding:'20px' }}>
              <h3 style={{ fontSize:13, fontWeight:800, color:'#2C1A0E', margin:'0 0 14px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Event Details</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <Field label="Event Type" value={f.eventType} onChange={v=>set('eventType',v)} placeholder="Birthday, Wedding…"/>
                  <Field label="Event Date" value={f.date} onChange={v=>set('date',v)} placeholder="15 June 2025"/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <Field label="City" value={f.city} onChange={v=>set('city',v)} placeholder="Delhi, Noida…"/>
                  <Field label="No. of Guests" value={f.guests} onChange={v=>set('guests',v)} placeholder="e.g. 80" type="number"/>
                </div>
                <Field label="Venue (optional)" value={f.venue} onChange={v=>set('venue',v)} placeholder="If you already have one"/>
                <Field label="Budget" value={f.budget} onChange={v=>set('budget',v)} placeholder="e.g. ₹50,000 or 'flexible'"/>
              </div>
            </div>

            {/* Vendor + vibe */}
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid rgba(196,122,46,0.15)', padding:'20px' }}>
              <h3 style={{ fontSize:13, fontWeight:800, color:'#2C1A0E', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Who are you sending this to?</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                {VENDOR_TYPES.map(v => <Chip key={v} label={v} selected={f.vendorType===v} onClick={()=>toggle('vendorType',v)}/>)}
              </div>
              <p style={{ fontSize:11, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 8px' }}>Style / Vibe (optional)</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
                {VIBES.map(v => <Chip key={v} label={v} selected={f.vibe===v} onClick={()=>toggle('vibe',v)}/>)}
              </div>
              <label style={{ fontSize:11, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Specific requirements (optional)</label>
              <textarea value={f.notes} onChange={e=>set('notes',e.target.value)} rows={3}
                placeholder="e.g. I want a jungle theme, need a 20-ft stage, veg food only…"
                style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1.5px solid rgba(196,122,46,0.25)', fontSize:13, fontFamily:font, outline:'none', resize:'vertical', color:'#2C1A0E', boxSizing:'border-box' }}/>
            </div>

            {/* Your contact */}
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid rgba(196,122,46,0.15)', padding:'20px' }}>
              <h3 style={{ fontSize:13, fontWeight:800, color:'#2C1A0E', margin:'0 0 14px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Your Contact</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Field label="Name" value={f.name} onChange={v=>set('name',v)} placeholder="Your name"/>
                <Field label="Phone" value={f.phone} onChange={v=>set('phone',v)} placeholder="9XXXXXXXXX" type="tel"/>
              </div>
            </div>
          </div>

          {/* ── Right: live preview ───────────────────────────────── */}
          <div style={{ position:'sticky', top:80 }}>
            <div style={{ background:'linear-gradient(135deg,#2C1A0E,#4A2810)', borderRadius:16, padding:'22px', marginBottom:14 }}>
              {/* Preview header */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(196,122,46,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>📋</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{f.name || 'Your Name'}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>{f.eventType || 'Event'}{f.city ? ` · ${f.city}` : ''}</div>
                </div>
              </div>
              {/* Brief lines */}
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {briefLines.map((line, i) =>
                  line === '' ? <div key={i} style={{ height:6 }}/> : (
                    <div key={i} style={{ fontSize:12.5, lineHeight:1.65, color: line.startsWith('Hi') ? 'rgba(255,255,255,0.9)' : line.match(/^[📅📍👥💰🎨📝]/) ? '#CCAB4A' : 'rgba(255,255,255,0.72)' }}>
                      {line}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {!canShare && (
                <p style={{ fontSize:12, color:'#9B7450', textAlign:'center', margin:'0 0 4px' }}>Select a vendor type above to enable sharing</p>
              )}
              <button onClick={shareWhatsApp} disabled={!canShare}
                style={{ width:'100%', padding:'13px', borderRadius:100, border:'none', background: canShare ? '#25D366' : '#e5e7eb', color: canShare ? '#fff' : '#9ca3af', fontSize:15, fontWeight:700, cursor: canShare ? 'pointer' : 'not-allowed', fontFamily:font }}>
                📲 Send on WhatsApp
              </button>
              <button onClick={copyBrief} disabled={!canShare}
                style={{ width:'100%', padding:'12px', borderRadius:100, border:`1.5px solid ${canShare ? 'rgba(196,122,46,0.35)' : 'rgba(0,0,0,0.08)'}`, background:'#fff', color: canShare ? gold : '#9ca3af', fontSize:14, fontWeight:700, cursor: canShare ? 'pointer' : 'not-allowed', fontFamily:font }}>
                Copy Text
              </button>
            </div>
            <p style={{ fontSize:11, color:'#9B7450', textAlign:'center', marginTop:12 }}>Paste this brief directly into any WhatsApp chat or DM with a vendor.</p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) { .brief-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

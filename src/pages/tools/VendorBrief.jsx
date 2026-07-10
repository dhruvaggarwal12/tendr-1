import { useState } from 'react';
import HamburgerNav from '../../components/HamburgerNav';

const font = "'Outfit', sans-serif";
const gold = "#C47A2E";

const OCCASIONS = ["Birthday","Anniversary","Wedding","Engagement","Baby Shower","Corporate Event","Festival/Puja","Get-together","Other"];
const VENDOR_TYPES = ["Decorator","Photographer","Caterer","DJ / Music","Venue","Gift Hampers","Cake","Makeup Artist","Other"];
const BUDGETS = ["Under ₹10,000","₹10,000 – ₹25,000","₹25,000 – ₹50,000","₹50,000 – ₹1,00,000","₹1,00,000+","Not decided yet"];
const VIBES = ["Traditional / Classic","Modern / Minimalist","Luxurious / Grand","Fun & Colourful","Intimate & Personal","Outdoor / Garden","Bollywood / Themed"];

function Step({ n, title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${gold},#CCAB4A)`, color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#2C1A0E' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Chip({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${selected ? gold : 'rgba(196,122,46,0.3)'}`, background: selected ? 'rgba(196,122,46,0.1)' : '#fff', color: selected ? gold : '#6B4226', fontSize: 13, fontWeight: selected ? 700 : 500, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}>
      {label}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(196,122,46,0.25)', fontSize: 14, fontFamily: font, outline: 'none', boxSizing: 'border-box', color: '#2C1A0E' }}/>
    </div>
  );
}

function BriefPreview({ f }) {
  const lines = [
    `Hi! I'm ${f.name}${f.phone ? ` (+91 ${f.phone.replace(/^(\+91|0)/, '')})` : ''} and I'm planning a${f.occasion ? ' ' + f.occasion : 'n event'}.`,
    '',
    `📅 Event Date: ${f.date || 'TBD'}`,
    `📍 City / Venue: ${f.city || 'TBD'}${f.venue ? ' — ' + f.venue : ''}`,
    `👥 Guest Count: ${f.guests || 'TBD'}`,
    '',
    `I'm looking for: ${f.vendorType || 'a vendor'}`,
    `💰 Budget: ${f.budget || 'To be discussed'}`,
    f.vibe ? `🎨 Style / Vibe: ${f.vibe}` : '',
    f.notes ? `📝 Additional details: ${f.notes}` : '',
    '',
    'Please share your availability, portfolio, and package details.',
    'Looking forward to hearing from you!',
  ].filter(l => l !== null);

  const text = lines.join('\n');

  return (
    <div style={{ background: '#FFFCF5', borderRadius: 16, border: '1.5px solid rgba(196,122,46,0.25)', padding: '24px', fontFamily: font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#2C1A0E' }}>Your Vendor Brief</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { navigator.clipboard?.writeText(text); alert('Brief copied to clipboard!'); }}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid rgba(196,122,46,0.3)`, background: '#fff', color: gold, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
            Copy Text
          </button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')}
            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#25D366', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
            📲 WhatsApp
          </button>
        </div>
      </div>
      {/* Brief card */}
      <div style={{ background: 'linear-gradient(135deg,#2C1A0E,#4A2810)', borderRadius: 12, padding: '20px 24px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(196,122,46,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📋</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{f.name || 'Your Name'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{f.occasion || 'Event'} · {f.city || 'City'}</div>
          </div>
        </div>
        {lines.map((line, i) =>
          line === '' ? <div key={i} style={{ height: 8 }}/> : (
            <div key={i} style={{ fontSize: 13, color: line.startsWith('Hi') ? 'rgba(255,255,255,0.9)' : line.match(/^[📅📍👥💰🎨📝]/) ? '#CCAB4A' : 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 2 }}>
              {line}
            </div>
          )
        )}
      </div>
      <p style={{ fontSize: 11, color: '#9B7450', margin: 0 }}>Share this brief directly with vendors on WhatsApp or copy the text to paste anywhere.</p>
    </div>
  );
}

export default function VendorBrief() {
  const [f, setF] = useState({ name:'', phone:'', occasion:'', date:'', city:'', venue:'', guests:'', vendorType:'', budget:'', vibe:'', notes:'' });
  const [showPreview, setShowPreview] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggle = (k, v) => set(k, f[k] === v ? '' : v);

  const canPreview = f.occasion || f.vendorType || f.city;

  return (
    <div style={{ minHeight: '100vh', background: '#FFFCF5', fontFamily: font }}>
      <HamburgerNav/>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: gold, textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 6px' }}>Vendor Brief</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 400, color: '#2C1A0E', margin: '0 0 8px' }}>
            Tell vendors what you need
          </h1>
          <p style={{ fontSize: 14, color: '#6B4226', margin: 0, lineHeight: 1.6 }}>
            Fill in your event details and get a ready-to-share brief you can send to any vendor on WhatsApp.
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid rgba(196,122,46,0.15)', padding: '28px 24px', marginBottom: 20 }}>

          <Step n={1} title="Your Event">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {OCCASIONS.map(o => <Chip key={o} label={o} selected={f.occasion===o} onClick={()=>toggle('occasion',o)}/>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <Field label="Event Date" value={f.date} onChange={v=>set('date',v)} placeholder="e.g. 15 June 2025" type="text"/>
              <div style={{ paddingLeft: 14 }}>
                <Field label="No. of Guests" value={f.guests} onChange={v=>set('guests',v)} placeholder="e.g. 80"/>
              </div>
            </div>
            <Field label="City" value={f.city} onChange={v=>set('city',v)} placeholder="e.g. Delhi, Noida, Gurugram"/>
            <Field label="Venue (optional)" value={f.venue} onChange={v=>set('venue',v)} placeholder="If you already have one"/>
          </Step>

          <div style={{ height: 1, background: 'rgba(196,122,46,0.1)', margin: '4px 0 24px' }}/>

          <Step n={2} title="What You're Looking For">
            <p style={{ fontSize: 12, color: '#9B7450', margin: '0 0 10px' }}>Vendor type</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {VENDOR_TYPES.map(v => <Chip key={v} label={v} selected={f.vendorType===v} onClick={()=>toggle('vendorType',v)}/>)}
            </div>
            <p style={{ fontSize: 12, color: '#9B7450', margin: '0 0 10px' }}>Budget</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {BUDGETS.map(b => <Chip key={b} label={b} selected={f.budget===b} onClick={()=>toggle('budget',b)}/>)}
            </div>
            <p style={{ fontSize: 12, color: '#9B7450', margin: '0 0 10px' }}>Style / Vibe</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {VIBES.map(v => <Chip key={v} label={v} selected={f.vibe===v} onClick={()=>toggle('vibe',v)}/>)}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>Any specific requirements (optional)</label>
              <textarea value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="e.g. I want a jungle theme, need a 20-ft stage, veg food only..."
                rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(196,122,46,0.25)', fontSize: 13, fontFamily: font, outline: 'none', boxSizing: 'border-box', resize: 'vertical', color: '#2C1A0E' }}/>
            </div>
          </Step>

          <div style={{ height: 1, background: 'rgba(196,122,46,0.1)', margin: '4px 0 24px' }}/>

          <Step n={3} title="Your Contact">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <Field label="Your Name" value={f.name} onChange={v=>set('name',v)} placeholder="First name"/>
              <div style={{ paddingLeft: 14 }}>
                <Field label="Phone Number" value={f.phone} onChange={v=>set('phone',v)} placeholder="9XXXXXXXXX" type="tel"/>
              </div>
            </div>
          </Step>

          <button onClick={() => setShowPreview(true)} disabled={!canPreview}
            style={{ width: '100%', padding: '14px', borderRadius: 100, border: 'none', background: canPreview ? `linear-gradient(135deg,${gold},#CCAB4A)` : '#e5e7eb', color: canPreview ? '#fff' : '#9ca3af', fontSize: 16, fontWeight: 700, cursor: canPreview ? 'pointer' : 'not-allowed', fontFamily: font, boxShadow: canPreview ? '0 4px 18px rgba(196,122,46,0.35)' : 'none', transition: 'all 0.2s' }}>
            Generate My Brief →
          </button>
        </div>

        {showPreview && <BriefPreview f={f}/>}
      </div>
    </div>
  );
}

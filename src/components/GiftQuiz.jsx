import { useState, useMemo } from 'react';

const gold  = '#C47A2E';
const ink   = '#2C1A0E';
const cream = '#FFFCF5';
const muted = '#9B7450';
const font  = "'Outfit', sans-serif";

// ── Data ────────────────────────────────────────────────────────────────────

const RECIPIENTS = [
  { id:'him',          emoji:'👨',  label:'Him',               sub:'Husband, boyfriend, brother',    cats:['Dry Fruits & Nuts','Drinkware'], occs:[] },
  { id:'her',          emoji:'👩',  label:'Her',               sub:'Wife, girlfriend, sister',       cats:['Chocolates & Sweets','Decorative Boxes','Spiritual & Pooja'], occs:[] },
  { id:'couple',       emoji:'💑',  label:'Couple',            sub:'Newlyweds or anniversary pair',  cats:['Decorative Boxes','Tokri & Hampers','Drinkware'], occs:['Wedding','Anniversary'] },
  { id:'parents',      emoji:'👴',  label:'Parents / In-laws', sub:'Mom, dad, in-laws',              cats:['Spiritual & Pooja','Dry Fruits & Nuts','Tokri & Hampers'], occs:[] },
  { id:'grandparents', emoji:'🧓',  label:'Grandparents',      sub:'Nana, nani, dada, dadi',         cats:['Spiritual & Pooja','Dry Fruits & Nuts'], occs:[] },
  { id:'baby',         emoji:'👶',  label:'New Baby',          sub:'Baby shower or welcome gift',    cats:['Chocolates & Sweets','Decorative Boxes'], occs:['Baby Shower'] },
  { id:'kids',         emoji:'🧒',  label:'Kids',              sub:'Children 4–12 years',            cats:['Chocolates & Sweets','Tokri & Hampers'], occs:['Birthday'] },
  { id:'boss',         emoji:'👔',  label:'Boss / Senior',     sub:'A thoughtful professional gift', cats:['Drinkware','Dry Fruits & Nuts','Decorative Boxes'], occs:['Corporate'] },
  { id:'colleague',    emoji:'🤝',  label:'Colleague / Client',sub:'Thank-you or festive gifts',     cats:['Dry Fruits & Nuts','Chocolates & Sweets','Drinkware'], occs:['Corporate','Thank You'] },
  { id:'teacher',      emoji:'📚',  label:'Teacher / Mentor',  sub:'Show appreciation',             cats:['Dry Fruits & Nuts','Decorative Boxes'], occs:['Thank You'] },
  { id:'friend',       emoji:'🥳',  label:'Friends',           sub:'BFF or group of friends',        cats:['Chocolates & Sweets','Tokri & Hampers'], occs:['Birthday','Thank You'] },
  { id:'family',       emoji:'🏠',  label:'Whole Family',      sub:'For the entire household',       cats:['Tokri & Hampers','Dry Fruits & Nuts','Chocolates & Sweets'], occs:['Diwali','General'] },
];

const VIBES = [
  { id:'traditional', emoji:'🪔', label:'Traditional & Festive', sub:'Spiritual, classic, rooted in culture',   cats:['Spiritual & Pooja','Tokri & Hampers','Dry Fruits & Nuts'], occs:['Diwali'] },
  { id:'premium',     emoji:'💎', label:'Premium & Luxurious',   sub:'Elegant, upscale, makes an impression',   cats:['Decorative Boxes','Drinkware','Dry Fruits & Nuts'], occs:[] },
  { id:'sweet',       emoji:'🍫', label:'Sweet & Indulgent',     sub:'Chocolates, sweets, joyful treats',       cats:['Chocolates & Sweets','Tokri & Hampers'], occs:[] },
  { id:'healthy',     emoji:'🌿', label:'Healthy & Nutritious',  sub:'Dry fruits, nuts, wholesome hampers',     cats:['Dry Fruits & Nuts','Tokri & Hampers'], occs:[] },
  { id:'artistic',    emoji:'✨', label:'Elegant & Artistic',    sub:'Decorative pieces, artisan collectibles', cats:['Decorative Boxes','Drinkware'], occs:[] },
  { id:'fun',         emoji:'🎉', label:'Fun & Celebratory',     sub:'Colourful, festive, full of cheer',       cats:['Chocolates & Sweets','Tokri & Hampers'], occs:['Birthday'] },
];

// Base / container options — not just tokri!
const BASES = [
  { id:'tokri',   emoji:'🧺', label:'Tokri',         sub:'Classic woven basket — timeless & festive',       size:'any' },
  { id:'box',     emoji:'📦', label:'Gift Box',       sub:'Rigid decorative box — premium & structured',     size:'any' },
  { id:'tray',    emoji:'🪵', label:'Wooden Tray',    sub:'Open display tray — rustic, visible contents',    size:'any' },
  { id:'bag',     emoji:'🛍️', label:'Jute / Gift Bag',sub:'Eco-friendly bag — casual and easy to carry',    size:'any' },
  { id:'crate',   emoji:'📫', label:'Wooden Crate',   sub:'Rustic crate — great for large assortments',      size:'large' },
  { id:'tin',     emoji:'🫙', label:'Tin / Jar',      sub:'Reusable tin or glass jar — neat & minimalist',   size:'small' },
  { id:'sleeve',  emoji:'📜', label:'Tube / Sleeve',  sub:'Paper tube or sleeve wrap — modern & compact',    size:'small' },
  { id:'thali',   emoji:'🪬', label:'Pooja Thali',    sub:'Traditional thali — perfect for spiritual gifts', size:'any' },
  { id:'surprise',emoji:'✨', label:'Surprise me',    sub:'Let our team choose the best fit',                size:'any' },
];

// Capacity tiers — user picks how much they want to fit
const CAPACITY = [
  { id:'small',  emoji:'🌱', label:'Compact',    sub:'3–5 items · personal, thoughtful',  hint:'₹400–₹900' },
  { id:'medium', emoji:'🌿', label:'Standard',   sub:'5–8 items · balanced & popular',    hint:'₹900–₹2,000' },
  { id:'large',  emoji:'🌳', label:'Grand',      sub:'8–12 items · lavish & impressive',  hint:'₹2,000–₹5,000' },
];

const OCC_ICON = {
  'Birthday':'🎂','Anniversary':'💑','Diwali':'🪔','Festival':'🪔',
  'Corporate':'💼','Wedding':'💍','Baby Shower':'👶',
  'Thank You':'🙏','General':'🎁','Holi':'🎨','Raksha Bandhan':'🧿',
  'Christmas':'🎄','Eid':'🌙',
};

const CAT_ICON = {
  'Dry Fruits & Nuts':'🥜','Chocolates & Sweets':'🍫',
  'Spiritual & Pooja':'🪔','Decorative Boxes':'📦',
  'Tokri & Hampers':'🧺','Drinkware':'☕',
};

const gi = (map, k) => map[k] || '🎁';

// ── Product scoring ──────────────────────────────────────────────────────────

function scoreProduct(product, ans) {
  let s = 0;
  const pCat = product.category || '';

  if (ans.recipient) {
    const r = RECIPIENTS.find(r => r.id === ans.recipient);
    if (r && r.cats.includes(pCat)) s += 4;
  }
  if (ans.vibe) {
    const v = VIBES.find(v => v.id === ans.vibe);
    if (v && v.cats.includes(pCat)) s += 3;
  }
  if (ans.occasion) {
    const r = RECIPIENTS.find(r => r.id === ans.recipient);
    if (r && r.occs.includes(ans.occasion)) s += 2;
  }
  // Slight boost so all products stay in view
  s += 0.5;
  return s;
}

// Sample photo scoring (unchanged, for backwards-compat onSelect)
function scoreSample(sample, ans) {
  let s = 0;
  const sOcc  = sample.occasion || [];
  const sCats = Array.isArray(sample.category) ? sample.category : (sample.category ? [sample.category] : []);
  if (ans.occasion && sOcc.includes(ans.occasion))  s += 5;
  if (ans.recipient) {
    const r = RECIPIENTS.find(r => r.id === ans.recipient);
    if (r) { r.occs.forEach(o => { if (sOcc.includes(o)) s += 2; }); r.cats.forEach(c => { if (sCats.includes(c)) s += 2; }); }
  }
  if (ans.vibe) {
    const v = VIBES.find(v => v.id === ans.vibe);
    if (v) { v.occs.forEach(o => { if (sOcc.includes(o)) s += 2; }); v.cats.forEach(c => { if (sCats.includes(c)) s += 3; }); }
  }
  if (sOcc.length > 0 || sCats.length > 0) s += 0.5;
  return s;
}

// How many product results to show per capacity
const CAP_LIMIT = { small: 5, medium: 8, large: 12 };

// ── Sub-components ───────────────────────────────────────────────────────────

function SelectCard({ emoji, label, sub, selected, onClick, wide }) {
  return (
    <button onClick={onClick}
      style={{
        background: selected ? `${gold}12` : '#fff',
        border: `1.5px solid ${selected ? gold : 'rgba(196,122,46,0.15)'}`,
        borderRadius: wide ? 14 : 14,
        padding: wide ? '13px 14px' : '12px 8px',
        cursor: 'pointer', fontFamily: font,
        display: 'flex', flexDirection: wide ? 'row' : 'column',
        alignItems: wide ? 'flex-start' : 'center',
        gap: wide ? 12 : 4,
        textAlign: wide ? 'left' : 'center',
        transition: 'all 0.12s',
        boxShadow: selected ? `0 0 0 2.5px ${gold}44` : 'none',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background=`${gold}06`; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor='rgba(196,122,46,0.15)'; e.currentTarget.style.background='#fff'; }}}>
      <span style={{ fontSize: wide ? 28 : 28, flexShrink: 0, marginTop: wide ? 1 : 0 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: ink, lineHeight: 1.2, marginBottom: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 10.5, color: muted, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {selected && <svg style={{ marginLeft:'auto', flexShrink:0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
    </button>
  );
}

function NavRow({ onBack, onSkip, skipLabel = 'Skip this →' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
      {onBack
        ? <button onClick={onBack} style={{ background: 'none', border: 'none', color: muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: font }}>← Back</button>
        : <span />}
      {onSkip
        ? <button onClick={onSkip} style={{ background: 'none', border: 'none', color: muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: font }}>{skipLabel}</button>
        : <span />}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

// Steps: recipient → occasion → vibe → base → capacity → results
const STEPS = ['recipient', 'occasion', 'vibe', 'base', 'capacity'];

export default function GiftQuiz({ samples, occasions, categories, products = [], cartItems = {}, setQty, onSelect, onClose }) {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({});

  const total = STEPS.length;
  const hasProducts = products.length > 0;

  const pick = (key, val) => {
    const next = { ...answers, [key]: val };
    setAnswers(next);
    setTimeout(() => setStep(s => Math.min(s + 1, total)), 140);
  };

  const skip = (key) => {
    setAnswers(a => ({ ...a, [key]: null }));
    setStep(s => Math.min(s + 1, total));
  };

  const back = () => setStep(s => Math.max(s - 1, 0));
  const restart = () => { setStep(0); setAnswers({}); };

  // Product recommendations — scored and limited by capacity
  const recommendedProducts = useMemo(() => {
    if (step !== total || !hasProducts) return [];
    const limit = CAP_LIMIT[answers.capacity] || 8;
    return products
      .map(p => ({ ...p, _score: scoreProduct(p, answers) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);
  }, [step, products, answers, hasProducts]);

  // Sample photo fallback (when no products)
  const photoResults = useMemo(() => {
    if (step !== total || hasProducts) return [];
    const scored = samples.map(s => ({ ...s, _score: scoreSample(s, answers) }));
    scored.sort((a, b) => b._score - a._score);
    const hit = scored.filter(s => s._score > 0);
    return (hit.length >= 4 ? hit : scored).slice(0, 12);
  }, [step, samples, answers, hasProducts]);

  const progress = Math.round((step / total) * 100);
  const stepMeta = [
    { key:'recipient', label:'Who' },
    { key:'occasion',  label:'Occasion' },
    { key:'vibe',      label:'Vibe' },
    { key:'base',      label:'Base' },
    { key:'capacity',  label:'Size' },
  ];

  const cartCount  = Object.values(cartItems).reduce((s, q) => s + q, 0);
  const cartTotal  = Object.entries(cartItems).reduce((s, [id, qty]) => {
    const p = products.find(p => p._id === id);
    return s + (p ? p.pricePerUnit * qty : 0);
  }, 0);

  const selectedBase     = answers.base     ? BASES.find(b => b.id === answers.base)     : null;
  const selectedCapacity = answers.capacity ? CAPACITY.find(c => c.id === answers.capacity) : null;

  return (
    <div onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(44,26,14,0.6)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:cream, borderRadius:24, width:'100%', maxWidth: step === total ? 760 : 540, maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column', fontFamily:font, boxShadow:'0 28px 90px rgba(44,26,14,0.25)', transition:'max-width 0.3s ease' }}>

        {/* ── Header ── */}
        <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid rgba(196,122,46,0.1)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {step > 0 && step < total && (
                <button onClick={back} style={{ background:`${gold}12`, border:'none', borderRadius:8, width:28, height:28, cursor:'pointer', color:gold, fontWeight:800, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
              )}
              <div style={{ fontSize:11.5, fontWeight:800, color:gold, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                {step === total ? '🎁 Your Gift Recommendations' : `Step ${step + 1} of ${total}`}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {step === total && cartCount > 0 && (
                <button onClick={onClose}
                  style={{ fontSize:12, fontWeight:700, color:'#fff', background:gold, padding:'5px 12px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:font }}>
                  🛒 {cartCount} · ₹{cartTotal.toLocaleString('en-IN')} →
                </button>
              )}
              <button onClick={onClose} style={{ background:'none', border:'none', fontSize:18, color:'#C4B09A', cursor:'pointer', padding:4, lineHeight:1 }}>✕</button>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height:4, background:'rgba(196,122,46,0.12)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${gold},#E8C074)`, borderRadius:4, transition:'width 0.4s cubic-bezier(.4,0,.2,1)' }} />
          </div>

          {/* Step dots */}
          {step < total && (
            <div style={{ display:'flex', gap:6, marginTop:10, alignItems:'center' }}>
              {stepMeta.map((s, i) => (
                <div key={s.key} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width: i < step ? 8 : i === step ? 10 : 8, height: i < step ? 8 : i === step ? 10 : 8, borderRadius:'50%', background: i <= step ? gold : 'rgba(196,122,46,0.2)', transition:'all 0.2s', flexShrink:0 }} />
                  {i === step && <span style={{ fontSize:11, fontWeight:700, color:gold }}>{s.label}</span>}
                  {i < total - 1 && i !== step && <div style={{ width:12, height:1, background:'rgba(196,122,46,0.15)' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 24px' }}>

          {/* ─── STEP 0: Who ─── */}
          {step === 0 && (
            <div>
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:21, fontWeight:800, color:ink }}>Who is the gift for?</div>
                <div style={{ fontSize:13, color:muted, marginTop:4 }}>We'll find products that suit them best</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:9 }}>
                {RECIPIENTS.map(r => (
                  <SelectCard key={r.id} emoji={r.emoji} label={r.label} sub={r.sub} selected={answers.recipient === r.id} onClick={() => pick('recipient', r.id)} />
                ))}
              </div>
              <NavRow onSkip={() => skip('recipient')} skipLabel="Skip, show all →" />
            </div>
          )}

          {/* ─── STEP 1: Occasion ─── */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:21, fontWeight:800, color:ink }}>What's the occasion?</div>
                <div style={{ fontSize:13, color:muted, marginTop:4 }}>Helps us suggest the right type of products</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(105px,1fr))', gap:9 }}>
                {occasions.map(occ => (
                  <SelectCard key={occ} emoji={gi(OCC_ICON, occ)} label={occ} selected={answers.occasion === occ} onClick={() => pick('occasion', occ)} />
                ))}
              </div>
              <NavRow onBack={back} onSkip={() => skip('occasion')} />
            </div>
          )}

          {/* ─── STEP 2: Vibe ─── */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:21, fontWeight:800, color:ink }}>What's the feel?</div>
                <div style={{ fontSize:13, color:muted, marginTop:4 }}>Pick the mood that fits your gift</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
                {VIBES.map(v => (
                  <SelectCard key={v.id} emoji={v.emoji} label={v.label} sub={v.sub} selected={answers.vibe === v.id} onClick={() => pick('vibe', v.id)} wide />
                ))}
              </div>
              <NavRow onBack={back} onSkip={() => skip('vibe')} skipLabel="Skip, any vibe →" />
            </div>
          )}

          {/* ─── STEP 3: Base / Container ─── */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:21, fontWeight:800, color:ink }}>Choose a base</div>
                <div style={{ fontSize:13, color:muted, marginTop:4 }}>What should your products be presented in?</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:9 }}>
                {BASES.map(b => (
                  <SelectCard key={b.id} emoji={b.emoji} label={b.label} sub={b.sub} selected={answers.base === b.id} onClick={() => pick('base', b.id)} wide />
                ))}
              </div>
              <NavRow onBack={back} onSkip={() => skip('base')} skipLabel="Skip, any base →" />
            </div>
          )}

          {/* ─── STEP 4: Capacity / Size ─── */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:21, fontWeight:800, color:ink }}>How much to fill it?</div>
                <div style={{ fontSize:13, color:muted, marginTop:4 }}>Choose how many products go inside</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {CAPACITY.map(c => (
                  <button key={c.id} onClick={() => pick('capacity', c.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:16,
                      padding:'16px 18px', borderRadius:16, textAlign:'left',
                      border:`1.5px solid ${answers.capacity===c.id ? gold : 'rgba(196,122,46,0.15)'}`,
                      background: answers.capacity===c.id ? `${gold}10` : '#fff',
                      cursor:'pointer', fontFamily:font, transition:'all 0.12s',
                      boxShadow: answers.capacity===c.id ? `0 0 0 2.5px ${gold}44` : 'none',
                    }}
                    onMouseEnter={e => { if (answers.capacity!==c.id) { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background=`${gold}06`; }}}
                    onMouseLeave={e => { if (answers.capacity!==c.id) { e.currentTarget.style.borderColor='rgba(196,122,46,0.15)'; e.currentTarget.style.background='#fff'; }}}>
                    <span style={{ fontSize:36, flexShrink:0 }}>{c.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:800, color:ink, marginBottom:2 }}>{c.label}</div>
                      <div style={{ fontSize:12, color:muted }}>{c.sub}</div>
                    </div>
                    <div style={{ fontSize:12, fontWeight:700, color:gold, background:`${gold}10`, padding:'4px 10px', borderRadius:100, flexShrink:0 }}>{c.hint}</div>
                    {answers.capacity===c.id && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                ))}
              </div>
              <NavRow onBack={back} onSkip={() => skip('capacity')} skipLabel="Skip, show all →" />
            </div>
          )}

          {/* ─── RESULTS ─── */}
          {step === total && (
            <div>
              {/* Summary pills */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16, alignItems:'center' }}>
                {answers.recipient && (() => { const r = RECIPIENTS.find(r=>r.id===answers.recipient); return r ? <button onClick={()=>{setAnswers(a=>({...a,recipient:null}));setStep(0);}} style={{ fontSize:11.5,fontWeight:700,color:gold,background:`${gold}12`,padding:'4px 10px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:font }}>{r.emoji} {r.label} ×</button>:null; })()}
                {answers.occasion  && <button onClick={()=>{setAnswers(a=>({...a,occasion:null}));setStep(1);}}  style={{ fontSize:11.5,fontWeight:700,color:gold,background:`${gold}12`,padding:'4px 10px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:font }}>{gi(OCC_ICON,answers.occasion)} {answers.occasion} ×</button>}
                {answers.vibe      && (() => { const v = VIBES.find(v=>v.id===answers.vibe); return v ? <button onClick={()=>{setAnswers(a=>({...a,vibe:null}));setStep(2);}} style={{ fontSize:11.5,fontWeight:700,color:gold,background:`${gold}12`,padding:'4px 10px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:font }}>{v.emoji} {v.label} ×</button>:null; })()}
                {answers.base      && (() => { const b = BASES.find(b=>b.id===answers.base); return b ? <button onClick={()=>{setAnswers(a=>({...a,base:null}));setStep(3);}} style={{ fontSize:11.5,fontWeight:700,color:gold,background:`${gold}12`,padding:'4px 10px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:font }}>{b.emoji} {b.label} ×</button>:null; })()}
                {answers.capacity  && (() => { const c = CAPACITY.find(c=>c.id===answers.capacity); return c ? <button onClick={()=>{setAnswers(a=>({...a,capacity:null}));setStep(4);}} style={{ fontSize:11.5,fontWeight:700,color:gold,background:`${gold}12`,padding:'4px 10px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:font }}>{c.emoji} {c.label} ×</button>:null; })()}
                <button onClick={restart} style={{ fontSize:11.5,color:muted,background:'none',border:`1px solid ${gold}30`,padding:'4px 10px',borderRadius:100,cursor:'pointer',fontFamily:font }}>↺ Start over</button>
              </div>

              {/* Base + capacity summary banner */}
              {(selectedBase || selectedCapacity) && (
                <div style={{ display:'flex', gap:10, padding:'11px 14px', borderRadius:12, background:`${gold}08`, border:`1px solid ${gold}25`, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
                  {selectedBase && (
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:18 }}>{selectedBase.emoji}</span>
                      <div>
                        <div style={{ fontSize:11, fontWeight:800, color:ink }}>{selectedBase.label}</div>
                        <div style={{ fontSize:10, color:muted }}>your base</div>
                      </div>
                    </div>
                  )}
                  {selectedBase && selectedCapacity && <div style={{ width:1, height:30, background:`${gold}20` }} />}
                  {selectedCapacity && (
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:18 }}>{selectedCapacity.emoji}</span>
                      <div>
                        <div style={{ fontSize:11, fontWeight:800, color:ink }}>{selectedCapacity.label} · {selectedCapacity.sub.split('·')[0].trim()}</div>
                        <div style={{ fontSize:10, color:muted }}>{selectedCapacity.hint}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize:11, color:muted, marginLeft:'auto', fontStyle:'italic' }}>Add items to cart → checkout to confirm your hamper</div>
                </div>
              )}

              {/* ── Product results (when products available) ── */}
              {hasProducts ? (
                recommendedProducts.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'36px 0' }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>😔</div>
                    <div style={{ fontSize:16, fontWeight:700, color:ink }}>No products found</div>
                    <div style={{ fontSize:13, color:muted, marginTop:6 }}>Try a different combination.</div>
                    <button onClick={restart} style={{ marginTop:16, padding:'10px 22px', borderRadius:12, border:`1.5px solid ${gold}`, background:'transparent', color:gold, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>Try again</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:13, fontWeight:700, color:muted, marginBottom:14 }}>
                      {recommendedProducts.length} product{recommendedProducts.length !== 1 ? 's' : ''} recommended for you
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
                      {recommendedProducts.map((p, i) => {
                        const qty    = cartItems[p._id] || 0;
                        const img    = p.images?.[0] || p.imageUrl;
                        const hasDisc = p.originalPrice && p.originalPrice > p.pricePerUnit;
                        return (
                          <div key={p._id}
                            style={{ borderRadius:14, overflow:'hidden', background:'#fff', border:'1px solid rgba(196,122,46,0.12)', display:'flex', flexDirection:'column', boxShadow:'0 2px 8px rgba(196,122,46,0.07)' }}>
                            <div style={{ height:140, overflow:'hidden', position:'relative', background:'rgba(196,122,46,0.04)' }}>
                              {img
                                ? <img src={img} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>🎁</div>
                              }
                              {i < 3 && (
                                <div style={{ position:'absolute', top:7, left:7, fontSize:9.5, fontWeight:800, color:'#fff', background: i===0 ? '#B8860B' : gold, padding:'2px 8px', borderRadius:100 }}>
                                  {i===0 ? '⭐ Best Match' : i===1 ? '✨ Great Pick' : '💛 Top Choice'}
                                </div>
                              )}
                            </div>
                            <div style={{ padding:'10px 12px', flex:1 }}>
                              <div style={{ fontSize:12.5, fontWeight:700, color:ink, lineHeight:1.3, marginBottom:4 }}>{p.name}</div>
                              {p.category && <div style={{ fontSize:10.5, color:muted, marginBottom:5 }}>{gi(CAT_ICON, p.category)} {p.category}</div>}
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <span style={{ fontSize:14, fontWeight:800, color:gold }}>₹{p.pricePerUnit?.toLocaleString('en-IN')}</span>
                                {hasDisc && <span style={{ fontSize:11, color:muted, textDecoration:'line-through' }}>₹{p.originalPrice.toLocaleString('en-IN')}</span>}
                              </div>
                            </div>
                            <div style={{ padding:'0 12px 12px' }}>
                              {qty === 0 ? (
                                <button
                                  onClick={() => setQty && setQty(p._id, Math.max(1, p.minOrderQuantity || 1))}
                                  style={{ width:'100%', padding:'8px', borderRadius:9, border:`1.5px solid ${gold}`, background:'transparent', color:gold, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:font }}>
                                  + Add
                                </button>
                              ) : (
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:4 }}>
                                  <button onClick={() => setQty && setQty(p._id, -1)} style={{ width:30, height:30, borderRadius:8, border:'1.5px solid rgba(196,122,46,0.3)', background:'#fff', color:gold, fontSize:16, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                                  <span style={{ fontSize:14, fontWeight:800, color:ink, minWidth:20, textAlign:'center' }}>{qty}</span>
                                  <button onClick={() => setQty && setQty(p._id, 1)} style={{ width:30, height:30, borderRadius:8, border:'none', background:gold, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {cartCount > 0 && (
                      <div style={{ marginTop:20, padding:'14px 16px', borderRadius:14, background:`${gold}08`, border:`1px solid ${gold}22`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:800, color:ink }}>{cartCount} item{cartCount!==1?'s':''} in your hamper</div>
                          <div style={{ fontSize:12, color:muted }}>₹{cartTotal.toLocaleString('en-IN')} total</div>
                        </div>
                        <button onClick={onClose} style={{ padding:'10px 20px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${gold},#E8C074)`, color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:font }}>
                          Checkout →
                        </button>
                      </div>
                    )}
                  </>
                )
              ) : (
                /* ── Photo fallback (no products in catalogue) ── */
                photoResults.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'36px 0' }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>😔</div>
                    <div style={{ fontSize:16, fontWeight:700, color:ink }}>No matches found</div>
                    <div style={{ fontSize:13, color:muted, marginTop:6 }}>Try a different combination or chat with us.</div>
                    <button onClick={restart} style={{ marginTop:16, padding:'10px 22px', borderRadius:12, border:`1.5px solid ${gold}`, background:'transparent', color:gold, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>Try again</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:13, fontWeight:700, color:muted, marginBottom:14 }}>
                      {photoResults.length} hamper{photoResults.length!==1?'s':''} found for you
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))', gap:12 }}>
                      {photoResults.map((s, i) => (
                        <div key={s._id || i}
                          onClick={() => { onSelect && onSelect(s); onClose(); }}
                          style={{ borderRadius:14, overflow:'hidden', background:'#fff', border:'1px solid rgba(196,122,46,0.12)', cursor:'pointer', boxShadow:'0 2px 10px rgba(196,122,46,0.07)', transition:'transform 0.14s, box-shadow 0.14s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(196,122,46,0.18)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(196,122,46,0.07)'; }}>
                          <div style={{ height:155, overflow:'hidden', position:'relative' }}>
                            <img src={s.url} alt={s.name||'Gift'} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                            {i < 3 && (
                              <div style={{ position:'absolute', top:8, left:8, fontSize:9.5, fontWeight:800, color:'#fff', background: i===0 ? '#B8860B' : gold, padding:'3px 9px', borderRadius:100, backdropFilter:'blur(4px)' }}>
                                {i===0 ? '⭐ Best Match' : i===1 ? '✨ Great Pick' : '💛 Top Choice'}
                              </div>
                            )}
                          </div>
                          <div style={{ padding:'10px 12px' }}>
                            {s.name && <div style={{ fontSize:12.5, fontWeight:700, color:ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>}
                            {(Array.isArray(s.category) ? s.category[0] : s.category) && (
                              <div style={{ fontSize:10.5, color:muted, marginTop:2 }}>{gi(CAT_ICON, Array.isArray(s.category) ? s.category[0] : s.category)} {Array.isArray(s.category) ? s.category[0] : s.category}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              )}

              <button onClick={onClose}
                style={{ marginTop:20, width:'100%', padding:'13px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${gold},#E8C074)`, color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:font, boxShadow:`0 4px 16px ${gold}44` }}>
                {hasProducts && cartCount > 0 ? `Proceed to Checkout (${cartCount} items) →` : 'Browse All Hampers →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

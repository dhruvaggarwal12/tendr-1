import { useState, useMemo } from 'react';

const gold  = '#C47A2E';
const ink   = '#2C1A0E';
const cream = '#FFFCF5';
const muted = '#9B7450';
const font  = "'Outfit', sans-serif";

// ── Data ────────────────────────────────────────────────────────────────────

const RECIPIENTS = [
  { id:'him',          emoji:'👨',  label:'Him',               sub:'Husband, boyfriend, brother',    cats:['Dry Fruits & Nuts','Drinkware'] },
  { id:'her',          emoji:'👩',  label:'Her',               sub:'Wife, girlfriend, sister',       cats:['Chocolates & Sweets','Decorative Boxes','Spiritual & Pooja'] },
  { id:'couple',       emoji:'💑',  label:'Couple',            sub:'Newlyweds or anniversary pair',  cats:['Decorative Boxes','Tokri & Hampers','Drinkware'] },
  { id:'parents',      emoji:'👴',  label:'Parents / In-laws', sub:'Mom, dad, in-laws',              cats:['Spiritual & Pooja','Dry Fruits & Nuts','Tokri & Hampers'] },
  { id:'grandparents', emoji:'🧓',  label:'Grandparents',      sub:'Nana, nani, dada, dadi',         cats:['Spiritual & Pooja','Dry Fruits & Nuts'] },
  { id:'baby',         emoji:'👶',  label:'New Baby',          sub:'Baby shower or welcome gift',    cats:['Chocolates & Sweets','Decorative Boxes'] },
  { id:'kids',         emoji:'🧒',  label:'Kids',              sub:'Children 4–12 years',            cats:['Chocolates & Sweets','Tokri & Hampers'] },
  { id:'boss',         emoji:'👔',  label:'Boss / Senior',     sub:'A thoughtful professional gift', cats:['Drinkware','Dry Fruits & Nuts','Decorative Boxes'] },
  { id:'colleague',    emoji:'🤝',  label:'Colleague / Client',sub:'Thank-you or festive gifts',     cats:['Dry Fruits & Nuts','Chocolates & Sweets','Drinkware'] },
  { id:'teacher',      emoji:'📚',  label:'Teacher / Mentor',  sub:'Show appreciation',             cats:['Dry Fruits & Nuts','Decorative Boxes'] },
  { id:'friend',       emoji:'🥳',  label:'Friends',           sub:'BFF or group of friends',        cats:['Chocolates & Sweets','Tokri & Hampers'] },
  { id:'family',       emoji:'🏠',  label:'Whole Family',      sub:'For the entire household',       cats:['Tokri & Hampers','Dry Fruits & Nuts','Chocolates & Sweets'] },
];

const VIBES = [
  { id:'traditional', emoji:'🪔', label:'Traditional & Festive', sub:'Spiritual, classic, rooted in culture',   cats:['Spiritual & Pooja','Tokri & Hampers','Dry Fruits & Nuts'] },
  { id:'premium',     emoji:'💎', label:'Premium & Luxurious',   sub:'Elegant, upscale, makes an impression',   cats:['Decorative Boxes','Drinkware','Dry Fruits & Nuts'] },
  { id:'sweet',       emoji:'🍫', label:'Sweet & Indulgent',     sub:'Chocolates, sweets, joyful treats',       cats:['Chocolates & Sweets','Tokri & Hampers'] },
  { id:'healthy',     emoji:'🌿', label:'Healthy & Nutritious',  sub:'Dry fruits, nuts, wholesome hampers',     cats:['Dry Fruits & Nuts','Tokri & Hampers'] },
  { id:'artistic',    emoji:'✨', label:'Elegant & Artistic',    sub:'Decorative pieces, artisan collectibles', cats:['Decorative Boxes','Drinkware'] },
  { id:'fun',         emoji:'🎉', label:'Fun & Celebratory',     sub:'Colourful, festive, full of cheer',       cats:['Chocolates & Sweets','Tokri & Hampers'] },
];

// Base / container options
const BASES = [
  { id:'tokri',   emoji:'🧺', label:'Tokri',          sub:'Classic woven basket — timeless & festive' },
  { id:'box',     emoji:'📦', label:'Gift Box',        sub:'Rigid decorative box — premium & structured' },
  { id:'tray',    emoji:'🪵', label:'Wooden Tray',     sub:'Open display tray — rustic, visible contents' },
  { id:'bag',     emoji:'🛍️', label:'Jute / Gift Bag', sub:'Eco-friendly bag — casual and easy to carry' },
  { id:'crate',   emoji:'📫', label:'Wooden Crate',    sub:'Rustic crate — great for large assortments' },
  { id:'tin',     emoji:'🫙', label:'Tin / Jar',       sub:'Reusable tin or glass jar — neat & minimalist' },
  { id:'sleeve',  emoji:'📜', label:'Tube / Sleeve',   sub:'Paper tube or sleeve wrap — modern & compact' },
  { id:'thali',   emoji:'🪬', label:'Pooja Thali',     sub:'Traditional thali — perfect for spiritual gifts' },
  { id:'surprise',emoji:'✨', label:'Surprise me',     sub:'Let our team choose the best fit' },
];

// What goes inside — product categories + loose items (multi-select)
const FILLINGS = [
  { id:'dryfruits',   emoji:'🥜', label:'Dry Fruits & Nuts',     sub:'Almonds, cashews, pistachios, dates' },
  { id:'chocolates',  emoji:'🍫', label:'Chocolates & Sweets',   sub:'Premium chocolates, mithai, treats' },
  { id:'drinkware',   emoji:'☕', label:'Tea / Coffee / Drinks',  sub:'Specialty teas, coffee, herbal blends' },
  { id:'pooja',       emoji:'🪔', label:'Spiritual & Pooja',     sub:'Diyas, incense, holy items, sindoor' },
  { id:'decor',       emoji:'🎀', label:'Decorative Items',      sub:'Artisan pieces, keepsakes, showpieces' },
  { id:'skincare',    emoji:'🧴', label:'Skincare / Wellness',   sub:'Soaps, oils, bath salts, creams' },
  { id:'snacks',      emoji:'🍪', label:'Snacks & Munchies',     sub:'Cookies, chips, roasted makhana' },
  { id:'stationary',  emoji:'📓', label:'Stationery / Books',    sub:'Journals, pens, small books' },
  { id:'candles',     emoji:'🕯️', label:'Candles',              sub:'Scented, pillar, tealight candles' },
  { id:'flowers',     emoji:'🌸', label:'Dried / Artificial Flowers', sub:'Preserved roses, potpourri, botanicals' },
];

// Garnishing & finishing touches (multi-select)
const GARNISH = [
  { id:'ribbon',      emoji:'🎀', label:'Satin Ribbon & Bow',    sub:'Tied at the top — classic finish' },
  { id:'tissue',      emoji:'🌟', label:'Tissue / Crinkle Paper', sub:'Colourful filler inside the base' },
  { id:'driedflower', emoji:'🌸', label:'Dried Flower Sprigs',   sub:'Natural dried flowers tucked in' },
  { id:'shredpaper',  emoji:'✨', label:'Shredded Paper Fill',   sub:'Eco shredded paper as base filler' },
  { id:'card',        emoji:'💌', label:'Handwritten Note Card', sub:'Personal message from you' },
  { id:'tag',         emoji:'🏷️', label:'Personalised Gift Tag',  sub:'Name or message on a hang tag' },
  { id:'wax',         emoji:'🖊️', label:'Wax Seal',             sub:'Sealing wax on the packaging' },
  { id:'wrap',        emoji:'🎁', label:'Cellophane Wrap',       sub:'Clear wrap with a bow on top' },
  { id:'jute',        emoji:'🪢', label:'Jute / Twine Tie',      sub:'Rustic natural rope tie' },
  { id:'petals',      emoji:'🌺', label:'Flower Petals Scatter', sub:'Loose petals scattered inside' },
  { id:'confetti',    emoji:'🎊', label:'Gold / Silver Confetti',sub:'Metallic confetti for a festive feel' },
  { id:'incense',     emoji:'🕯️', label:'Incense / Fragrance',   sub:'Small incense stick or room spray' },
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

// ── Scoring ──────────────────────────────────────────────────────────────────

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
  // Boost products whose category matches selected fillings
  if (ans.fillings && ans.fillings.length > 0) {
    const fillCatMap = {
      dryfruits:'Dry Fruits & Nuts', chocolates:'Chocolates & Sweets',
      drinkware:'Drinkware', pooja:'Spiritual & Pooja', decor:'Decorative Boxes',
    };
    ans.fillings.forEach(f => { if (fillCatMap[f] === pCat) s += 5; });
  }
  s += 0.5;
  return s;
}

function scoreSample(sample, ans) {
  let s = 0;
  const sOcc  = sample.occasion || [];
  const sCats = Array.isArray(sample.category) ? sample.category : (sample.category ? [sample.category] : []);
  if (ans.occasion && sOcc.includes(ans.occasion)) s += 5;
  if (ans.recipient) {
    const r = RECIPIENTS.find(r => r.id === ans.recipient);
    if (r) { r.cats.forEach(c => { if (sCats.includes(c)) s += 2; }); }
  }
  if (ans.vibe) {
    const v = VIBES.find(v => v.id === ans.vibe);
    if (v) { v.cats.forEach(c => { if (sCats.includes(c)) s += 3; }); }
  }
  if (sOcc.length > 0 || sCats.length > 0) s += 0.5;
  return s;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ChoiceCard({ emoji, label, sub, selected, onClick, wide }) {
  return (
    <button onClick={onClick}
      style={{
        background: selected ? `${gold}12` : '#fff',
        border: `1.5px solid ${selected ? gold : 'rgba(196,122,46,0.15)'}`,
        borderRadius: 14, padding: wide ? '12px 14px' : '11px 8px',
        cursor: 'pointer', fontFamily: font,
        display: 'flex', flexDirection: wide ? 'row' : 'column',
        alignItems: wide ? 'flex-start' : 'center',
        gap: wide ? 11 : 4, textAlign: wide ? 'left' : 'center',
        transition: 'all 0.12s',
        boxShadow: selected ? `0 0 0 2.5px ${gold}40` : 'none',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background=`${gold}06`; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor='rgba(196,122,46,0.15)'; e.currentTarget.style.background=selected?`${gold}12`:'#fff'; }}}>
      <span style={{ fontSize: wide ? 26 : 26, flexShrink:0, marginTop: wide ? 1 : 0 }}>{emoji}</span>
      <div style={{ flex: wide ? 1 : undefined }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: ink, lineHeight: 1.25, marginBottom: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 10.5, color: muted, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {selected && (
        <div style={{ position: wide ? 'static' : 'absolute', top: wide ? undefined : 7, right: wide ? undefined : 7, flexShrink: 0, marginLeft: wide ? 'auto' : undefined }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}
    </button>
  );
}

function NavRow({ onBack, onSkip, skipLabel = 'Skip →', nextLabel, onNext }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:18 }}>
      {onBack
        ? <button onClick={onBack} style={{ background:'none', border:'none', color:muted, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>← Back</button>
        : <span />}
      <div style={{ display:'flex', gap:10 }}>
        {onSkip && <button onClick={onSkip} style={{ background:'none', border:'none', color:muted, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>{skipLabel}</button>}
        {onNext && <button onClick={onNext} style={{ background:gold, border:'none', color:'#fff', fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:font, padding:'7px 16px', borderRadius:100 }}>{nextLabel||'Next →'}</button>}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

// Steps: who → occasion → vibe → base → what's inside → garnishing
const STEPS = ['recipient','occasion','vibe','base','fillings','garnish'];

export default function GiftQuiz({ samples, occasions, products=[], cartItems={}, setQty, onSelect, onClose }) {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({ fillings:[], garnish:[] });

  const total = STEPS.length;
  const hasProducts = products.length > 0;

  // Single-choice pick → auto advance
  const pick = (key, val) => {
    setAnswers(a => ({ ...a, [key]: val }));
    setTimeout(() => setStep(s => Math.min(s+1, total)), 140);
  };

  // Multi-choice toggle — no auto advance
  const toggle = (key, val) => {
    setAnswers(a => {
      const cur = a[key] || [];
      return { ...a, [key]: cur.includes(val) ? cur.filter(x=>x!==val) : [...cur, val] };
    });
  };

  const skip  = () => setStep(s => Math.min(s+1, total));
  const next  = () => setStep(s => Math.min(s+1, total));
  const back  = () => setStep(s => Math.max(s-1, 0));
  const restart = () => { setStep(0); setAnswers({ fillings:[], garnish:[] }); };

  const recommendedProducts = useMemo(() => {
    if (step !== total || !hasProducts) return [];
    return products
      .map(p => ({ ...p, _score: scoreProduct(p, answers) }))
      .sort((a,b) => b._score - a._score)
      .slice(0, 12);
  }, [step, products, answers, hasProducts]);

  const photoResults = useMemo(() => {
    if (step !== total || hasProducts) return [];
    const scored = samples.map(s => ({ ...s, _score: scoreSample(s, answers) })).sort((a,b) => b._score - a._score);
    const hit = scored.filter(s => s._score > 0);
    return (hit.length >= 4 ? hit : scored).slice(0, 12);
  }, [step, samples, answers, hasProducts]);

  const progress = Math.round((step/total)*100);
  const stepLabels = ['Who','Occasion','Vibe','Base','Inside','Garnish'];

  const cartCount = Object.values(cartItems).reduce((s,q)=>s+q,0);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div onClick={onClose}
      style={{ position:'fixed',inset:0,background:'rgba(44,26,14,0.6)',zIndex:9100,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(4px)' }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:cream,borderRadius:24,width:'100%',maxWidth:step===total?760:540,maxHeight:'92vh',overflow:'hidden',display:'flex',flexDirection:'column',fontFamily:font,boxShadow:'0 28px 90px rgba(44,26,14,0.25)',transition:'max-width 0.3s ease' }}>

        {/* Header */}
        <div style={{ padding:'15px 20px 11px',borderBottom:'1px solid rgba(196,122,46,0.1)',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              {step>0&&step<total&&(
                <button onClick={back} style={{ background:`${gold}12`,border:'none',borderRadius:8,width:28,height:28,cursor:'pointer',color:gold,fontWeight:800,fontSize:15,display:'flex',alignItems:'center',justifyContent:'center' }}>‹</button>
              )}
              <div style={{ fontSize:11.5,fontWeight:800,color:gold,letterSpacing:'0.1em',textTransform:'uppercase' }}>
                {step===total ? '🎁 Your Gift Build' : `Step ${step+1} of ${total} · ${stepLabels[step]}`}
              </div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              {step===total&&cartCount>0&&(
                <button onClick={onClose} style={{ fontSize:12,fontWeight:700,color:'#fff',background:gold,padding:'5px 12px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:font }}>
                  🛒 {cartCount} items →
                </button>
              )}
              <button onClick={onClose} style={{ background:'none',border:'none',fontSize:18,color:'#C4B09A',cursor:'pointer',padding:4,lineHeight:1 }}>✕</button>
            </div>
          </div>
          <div style={{ height:4,background:'rgba(196,122,46,0.12)',borderRadius:4,overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${progress}%`,background:`linear-gradient(90deg,${gold},#E8C074)`,borderRadius:4,transition:'width 0.4s cubic-bezier(.4,0,.2,1)' }}/>
          </div>
          {step<total&&(
            <div style={{ display:'flex',gap:5,marginTop:9,alignItems:'center' }}>
              {stepLabels.map((lbl,i)=>(
                <div key={lbl} style={{ display:'flex',alignItems:'center',gap:5 }}>
                  <div style={{ width:i===step?10:8,height:i===step?10:8,borderRadius:'50%',background:i<=step?gold:'rgba(196,122,46,0.2)',transition:'all 0.2s',flexShrink:0 }}/>
                  {i===step&&<span style={{ fontSize:11,fontWeight:700,color:gold }}>{lbl}</span>}
                  {i<total-1&&i!==step&&<div style={{ width:10,height:1,background:'rgba(196,122,46,0.15)' }}/>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex:1,overflowY:'auto',padding:'20px 20px 24px' }}>

          {/* STEP 0 — Who */}
          {step===0&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:21,fontWeight:800,color:ink }}>Who is this for?</div>
                <div style={{ fontSize:13,color:muted,marginTop:4 }}>We'll tailor every recommendation to them</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:8 }}>
                {RECIPIENTS.map(r=>(
                  <ChoiceCard key={r.id} emoji={r.emoji} label={r.label} sub={r.sub} selected={answers.recipient===r.id} onClick={()=>pick('recipient',r.id)}/>
                ))}
              </div>
              <NavRow onSkip={skip} skipLabel="Skip →"/>
            </div>
          )}

          {/* STEP 1 — Occasion */}
          {step===1&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:21,fontWeight:800,color:ink }}>What's the occasion?</div>
                <div style={{ fontSize:13,color:muted,marginTop:4 }}>Helps us match the right products and feel</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(105px,1fr))',gap:8 }}>
                {occasions.map(occ=>(
                  <ChoiceCard key={occ} emoji={gi(OCC_ICON,occ)} label={occ} selected={answers.occasion===occ} onClick={()=>pick('occasion',occ)}/>
                ))}
              </div>
              <NavRow onBack={back} onSkip={skip}/>
            </div>
          )}

          {/* STEP 2 — Vibe */}
          {step===2&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:21,fontWeight:800,color:ink }}>What's the feel?</div>
                <div style={{ fontSize:13,color:muted,marginTop:4 }}>Sets the overall tone of your hamper</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:9 }}>
                {VIBES.map(v=>(
                  <ChoiceCard key={v.id} emoji={v.emoji} label={v.label} sub={v.sub} selected={answers.vibe===v.id} onClick={()=>pick('vibe',v.id)} wide/>
                ))}
              </div>
              <NavRow onBack={back} onSkip={skip} skipLabel="Skip, any vibe →"/>
            </div>
          )}

          {/* STEP 3 — Base */}
          {step===3&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:21,fontWeight:800,color:ink }}>Choose a base</div>
                <div style={{ fontSize:13,color:muted,marginTop:4 }}>What should everything be presented in?</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:9 }}>
                {BASES.map(b=>(
                  <ChoiceCard key={b.id} emoji={b.emoji} label={b.label} sub={b.sub} selected={answers.base===b.id} onClick={()=>pick('base',b.id)} wide/>
                ))}
              </div>
              <NavRow onBack={back} onSkip={skip} skipLabel="Skip, any base →"/>
            </div>
          )}

          {/* STEP 4 — What's inside (multi-select) */}
          {step===4&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:21,fontWeight:800,color:ink }}>What goes inside?</div>
                <div style={{ fontSize:13,color:muted,marginTop:4 }}>Select everything you'd like to include — pick as many as you want</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:9 }}>
                {FILLINGS.map(f=>{
                  const sel=(answers.fillings||[]).includes(f.id);
                  return <ChoiceCard key={f.id} emoji={f.emoji} label={f.label} sub={f.sub} selected={sel} onClick={()=>toggle('fillings',f.id)} wide/>;
                })}
              </div>
              <NavRow
                onBack={back}
                onSkip={skip}
                skipLabel="Skip →"
                onNext={next}
                nextLabel={(answers.fillings||[]).length>0 ? `Next (${answers.fillings.length} selected) →` : 'Next →'}
              />
            </div>
          )}

          {/* STEP 5 — Garnishing (multi-select) */}
          {step===5&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:21,fontWeight:800,color:ink }}>Garnishing & finishing</div>
                <div style={{ fontSize:13,color:muted,marginTop:4 }}>The little touches that make it feel special — pick as many as you want</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:9 }}>
                {GARNISH.map(g=>{
                  const sel=(answers.garnish||[]).includes(g.id);
                  return <ChoiceCard key={g.id} emoji={g.emoji} label={g.label} sub={g.sub} selected={sel} onClick={()=>toggle('garnish',g.id)} wide/>;
                })}
              </div>
              <NavRow
                onBack={back}
                onSkip={skip}
                skipLabel="Skip →"
                onNext={next}
                nextLabel={(answers.garnish||[]).length>0 ? `See recommendations (${answers.garnish.length} extras) →` : 'See recommendations →'}
              />
            </div>
          )}

          {/* RESULTS */}
          {step===total&&(
            <div>
              {/* Summary pills */}
              <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:14,alignItems:'center' }}>
                {answers.recipient&&(()=>{const r=RECIPIENTS.find(r=>r.id===answers.recipient);return r?<button onClick={()=>{setAnswers(a=>({...a,recipient:null}));setStep(0);}} style={{ fontSize:11.5,fontWeight:700,color:gold,background:`${gold}12`,padding:'4px 10px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:font }}>{r.emoji} {r.label} ×</button>:null;})()}
                {answers.occasion&&<button onClick={()=>{setAnswers(a=>({...a,occasion:null}));setStep(1);}} style={{ fontSize:11.5,fontWeight:700,color:gold,background:`${gold}12`,padding:'4px 10px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:font }}>{gi(OCC_ICON,answers.occasion)} {answers.occasion} ×</button>}
                {answers.vibe&&(()=>{const v=VIBES.find(v=>v.id===answers.vibe);return v?<button onClick={()=>{setAnswers(a=>({...a,vibe:null}));setStep(2);}} style={{ fontSize:11.5,fontWeight:700,color:gold,background:`${gold}12`,padding:'4px 10px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:font }}>{v.emoji} {v.label} ×</button>:null;})()}
                {answers.base&&(()=>{const b=BASES.find(b=>b.id===answers.base);return b?<button onClick={()=>{setAnswers(a=>({...a,base:null}));setStep(3);}} style={{ fontSize:11.5,fontWeight:700,color:gold,background:`${gold}12`,padding:'4px 10px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:font }}>{b.emoji} {b.label} ×</button>:null;})()}
                <button onClick={restart} style={{ fontSize:11.5,color:muted,background:'none',border:`1px solid ${gold}30`,padding:'4px 10px',borderRadius:100,cursor:'pointer',fontFamily:font }}>↺ Start over</button>
              </div>

              {/* Build summary card */}
              {(answers.base||(answers.fillings||[]).length>0||(answers.garnish||[]).length>0)&&(
                <div style={{ padding:'13px 15px',borderRadius:14,background:`${gold}07`,border:`1px solid ${gold}22`,marginBottom:18 }}>
                  <div style={{ fontSize:11,fontWeight:800,color:gold,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10 }}>Your hamper build</div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:12 }}>
                    {answers.base&&(()=>{const b=BASES.find(b=>b.id===answers.base);return b?(
                      <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                        <div style={{ width:36,height:36,borderRadius:10,background:`${gold}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>{b.emoji}</div>
                        <div>
                          <div style={{ fontSize:10,color:muted,fontWeight:600 }}>Base</div>
                          <div style={{ fontSize:12,fontWeight:800,color:ink }}>{b.label}</div>
                        </div>
                      </div>
                    ):null;})()}
                    {(answers.fillings||[]).length>0&&(
                      <div>
                        <div style={{ fontSize:10,color:muted,fontWeight:600,marginBottom:5 }}>Inside</div>
                        <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                          {(answers.fillings||[]).map(id=>{const f=FILLINGS.find(f=>f.id===id);return f?<span key={id} style={{ fontSize:11,fontWeight:700,color:ink,background:'rgba(196,122,46,0.1)',padding:'3px 9px',borderRadius:100 }}>{f.emoji} {f.label}</span>:null;})}
                        </div>
                      </div>
                    )}
                    {(answers.garnish||[]).length>0&&(
                      <div>
                        <div style={{ fontSize:10,color:muted,fontWeight:600,marginBottom:5 }}>Garnishing</div>
                        <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                          {(answers.garnish||[]).map(id=>{const g=GARNISH.find(g=>g.id===id);return g?<span key={id} style={{ fontSize:11,fontWeight:700,color:ink,background:'rgba(196,122,46,0.1)',padding:'3px 9px',borderRadius:100 }}>{g.emoji} {g.label}</span>:null;})}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:11,color:muted,marginTop:10,fontStyle:'italic' }}>Our team will put this together and confirm with you on WhatsApp before dispatch.</div>
                </div>
              )}

              {/* Products */}
              {hasProducts ? (
                recommendedProducts.length===0 ? (
                  <div style={{ textAlign:'center',padding:'36px 0' }}>
                    <div style={{ fontSize:40,marginBottom:12 }}>😔</div>
                    <div style={{ fontSize:16,fontWeight:700,color:ink }}>No products found</div>
                    <button onClick={restart} style={{ marginTop:16,padding:'10px 22px',borderRadius:12,border:`1.5px solid ${gold}`,background:'transparent',color:gold,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:font }}>Try again</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:13,fontWeight:700,color:muted,marginBottom:14 }}>
                      {recommendedProducts.length} recommended products to add
                    </div>
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12 }}>
                      {recommendedProducts.map((p,i)=>{
                        const qty=cartItems[p._id]||0;
                        const img=p.images?.[0]||p.imageUrl;
                        const hasDisc=p.originalPrice&&p.originalPrice>p.pricePerUnit;
                        return(
                          <div key={p._id} style={{ borderRadius:14,overflow:'hidden',background:'#fff',border:'1px solid rgba(196,122,46,0.12)',display:'flex',flexDirection:'column',boxShadow:'0 2px 8px rgba(196,122,46,0.07)' }}>
                            <div style={{ height:140,overflow:'hidden',position:'relative',background:'rgba(196,122,46,0.04)' }}>
                              {img?<img src={img} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} loading="lazy"/>:<div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40 }}>🎁</div>}
                              {i<3&&<div style={{ position:'absolute',top:7,left:7,fontSize:9.5,fontWeight:800,color:'#fff',background:i===0?'#B8860B':gold,padding:'2px 8px',borderRadius:100 }}>{i===0?'⭐ Best Match':i===1?'✨ Great Pick':'💛 Top Choice'}</div>}
                            </div>
                            <div style={{ padding:'10px 12px',flex:1 }}>
                              <div style={{ fontSize:12.5,fontWeight:700,color:ink,lineHeight:1.3,marginBottom:4 }}>{p.name}</div>
                              {p.category&&<div style={{ fontSize:10.5,color:muted }}>{gi(CAT_ICON,p.category)} {p.category}</div>}
                            </div>
                            <div style={{ padding:'0 12px 12px' }}>
                              {qty===0?(
                                <button onClick={()=>setQty&&setQty(p._id,Math.max(1,p.minOrderQuantity||1))} style={{ width:'100%',padding:'8px',borderRadius:9,border:`1.5px solid ${gold}`,background:'transparent',color:gold,fontSize:12.5,fontWeight:700,cursor:'pointer',fontFamily:font }}>+ Add</button>
                              ):(
                                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:4 }}>
                                  <button onClick={()=>setQty&&setQty(p._id,-1)} style={{ width:30,height:30,borderRadius:8,border:'1.5px solid rgba(196,122,46,0.3)',background:'#fff',color:gold,fontSize:16,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>−</button>
                                  <span style={{ fontSize:14,fontWeight:800,color:ink,minWidth:20,textAlign:'center' }}>{qty}</span>
                                  <button onClick={()=>setQty&&setQty(p._id,1)} style={{ width:30,height:30,borderRadius:8,border:'none',background:gold,color:'#fff',fontSize:16,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>+</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {cartCount>0&&(
                      <div style={{ marginTop:18,padding:'14px 16px',borderRadius:14,background:`${gold}08`,border:`1px solid ${gold}22`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap' }}>
                        <div style={{ fontSize:13,fontWeight:800,color:ink }}>{cartCount} item{cartCount!==1?'s':''} added to your hamper</div>
                        <button onClick={onClose} style={{ padding:'10px 20px',borderRadius:12,border:'none',background:`linear-gradient(135deg,${gold},#E8C074)`,color:'#fff',fontSize:13,fontWeight:800,cursor:'pointer',fontFamily:font }}>Checkout →</button>
                      </div>
                    )}
                  </>
                )
              ) : (
                /* Photo fallback */
                photoResults.length===0?(
                  <div style={{ textAlign:'center',padding:'36px 0' }}>
                    <div style={{ fontSize:40,marginBottom:12 }}>😔</div>
                    <div style={{ fontSize:16,fontWeight:700,color:ink }}>No matches found</div>
                    <button onClick={restart} style={{ marginTop:16,padding:'10px 22px',borderRadius:12,border:`1.5px solid ${gold}`,background:'transparent',color:gold,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:font }}>Try again</button>
                  </div>
                ):(
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))',gap:12 }}>
                    {photoResults.map((s,i)=>(
                      <div key={s._id||i} onClick={()=>{onSelect&&onSelect(s);onClose();}}
                        style={{ borderRadius:14,overflow:'hidden',background:'#fff',border:'1px solid rgba(196,122,46,0.12)',cursor:'pointer',boxShadow:'0 2px 10px rgba(196,122,46,0.07)',transition:'transform 0.14s,box-shadow 0.14s' }}
                        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(196,122,46,0.18)';}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 10px rgba(196,122,46,0.07)';}}>
                        <div style={{ height:155,overflow:'hidden',position:'relative' }}>
                          <img src={s.url} alt={s.name||'Gift'} style={{ width:'100%',height:'100%',objectFit:'cover' }} loading="lazy"/>
                          {i<3&&<div style={{ position:'absolute',top:8,left:8,fontSize:9.5,fontWeight:800,color:'#fff',background:i===0?'#B8860B':gold,padding:'3px 9px',borderRadius:100,backdropFilter:'blur(4px)' }}>{i===0?'⭐ Best Match':i===1?'✨ Great Pick':'💛 Top Choice'}</div>}
                        </div>
                        <div style={{ padding:'10px 12px' }}>
                          {s.name&&<div style={{ fontSize:12.5,fontWeight:700,color:ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{s.name}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              <button onClick={onClose}
                style={{ marginTop:20,width:'100%',padding:'13px',borderRadius:12,border:'none',background:`linear-gradient(135deg,${gold},#E8C074)`,color:'#fff',fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:font,boxShadow:`0 4px 16px ${gold}44` }}>
                {cartCount>0 ? `Proceed · ${cartCount} item${cartCount!==1?'s':''} →` : 'Browse All Hampers →'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

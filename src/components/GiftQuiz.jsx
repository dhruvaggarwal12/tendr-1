import { useState, useMemo } from 'react';

const gold  = '#C47A2E';
const ink   = '#2C1A0E';
const cream = '#FFFCF5';
const muted = '#9B7450';
const font  = "'Outfit', sans-serif";

// ── Data ────────────────────────────────────────────────────────────────────

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

const FILLINGS = [
  { id:'dryfruits',  emoji:'🥜', label:'Dry Fruits & Nuts',        sub:'Almonds, cashews, pistachios, dates',      cat:'Dry Fruits & Nuts' },
  { id:'chocolates', emoji:'🍫', label:'Chocolates & Sweets',      sub:'Premium chocolates, mithai, treats',       cat:'Chocolates & Sweets' },
  { id:'drinkware',  emoji:'☕', label:'Tea / Coffee / Drinks',     sub:'Specialty teas, coffee, herbal blends',    cat:'Drinkware' },
  { id:'pooja',      emoji:'🪔', label:'Spiritual & Pooja',        sub:'Diyas, incense, holy items, sindoor',      cat:'Spiritual & Pooja' },
  { id:'decor',      emoji:'🎀', label:'Decorative Items',         sub:'Artisan pieces, keepsakes, showpieces',    cat:'Decorative Boxes' },
  { id:'skincare',   emoji:'🧴', label:'Skincare / Wellness',      sub:'Soaps, oils, bath salts, creams',          cat:null },
  { id:'snacks',     emoji:'🍪', label:'Snacks & Munchies',        sub:'Cookies, chips, roasted makhana',          cat:null },
  { id:'stationary', emoji:'📓', label:'Stationery / Books',       sub:'Journals, pens, small books',              cat:null },
  { id:'candles',    emoji:'🕯️', label:'Candles',                 sub:'Scented, pillar, tealight candles',        cat:null },
  { id:'flowers',    emoji:'🌸', label:'Dried / Artificial Flowers',sub:'Preserved roses, potpourri, botanicals',  cat:null },
];

const GARNISH = [
  { id:'ribbon',      emoji:'🎀', label:'Satin Ribbon & Bow',      sub:'Tied at the top — classic finish' },
  { id:'tissue',      emoji:'🌟', label:'Tissue / Crinkle Paper',  sub:'Colourful filler inside the base' },
  { id:'driedflower', emoji:'🌸', label:'Dried Flower Sprigs',     sub:'Natural dried flowers tucked in' },
  { id:'shredpaper',  emoji:'✨', label:'Shredded Paper Fill',     sub:'Eco shredded paper as base filler' },
  { id:'card',        emoji:'💌', label:'Handwritten Note Card',   sub:'Personal message from you' },
  { id:'tag',         emoji:'🏷️', label:'Personalised Gift Tag',   sub:'Name or message on a hang tag' },
  { id:'wax',         emoji:'🖊️', label:'Wax Seal',               sub:'Sealing wax on the packaging' },
  { id:'wrap',        emoji:'🎁', label:'Cellophane Wrap',         sub:'Clear wrap with a bow on top' },
  { id:'jute',        emoji:'🪢', label:'Jute / Twine Tie',        sub:'Rustic natural rope tie' },
  { id:'petals',      emoji:'🌺', label:'Flower Petals Scatter',   sub:'Loose petals scattered inside' },
  { id:'confetti',    emoji:'🎊', label:'Gold / Silver Confetti',  sub:'Metallic confetti for a festive feel' },
  { id:'incense',     emoji:'🕯️', label:'Incense / Fragrance',    sub:'Small incense stick or room spray' },
];

const CAT_ICON = {
  'Dry Fruits & Nuts':'🥜','Chocolates & Sweets':'🍫',
  'Spiritual & Pooja':'🪔','Decorative Boxes':'📦',
  'Tokri & Hampers':'🧺','Drinkware':'☕',
};

// ── Scoring ──────────────────────────────────────────────────────────────────

function scoreProduct(product, fillings) {
  let s = 0.5;
  const pCat = product.category || '';
  if (fillings && fillings.length > 0) {
    fillings.forEach(id => {
      const f = FILLINGS.find(f => f.id === id);
      if (f && f.cat && f.cat === pCat) s += 5;
    });
  }
  return s;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ChoiceCard({ emoji, label, sub, selected, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        background: selected ? `${gold}12` : '#fff',
        border: `1.5px solid ${selected ? gold : 'rgba(196,122,46,0.15)'}`,
        borderRadius: 14, padding: '12px 14px',
        cursor: 'pointer', fontFamily: font,
        display: 'flex', flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 11, textAlign: 'left',
        transition: 'all 0.12s',
        boxShadow: selected ? `0 0 0 2.5px ${gold}40` : 'none',
        width: '100%',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background=`${gold}06`; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor='rgba(196,122,46,0.15)'; e.currentTarget.style.background=selected?`${gold}12`:'#fff'; }}}>
      <span style={{ fontSize:26, flexShrink:0, marginTop:1 }}>{emoji}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12.5, fontWeight:800, color:ink, lineHeight:1.25, marginBottom:2 }}>{label}</div>
        {sub && <div style={{ fontSize:10.5, color:muted, lineHeight:1.4 }}>{sub}</div>}
      </div>
      {selected && (
        <div style={{ flexShrink:0, marginLeft:'auto', paddingTop:2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

const STEPS = ['base', 'fillings', 'garnish'];
const STEP_LABELS = ['Base', 'Inside', 'Garnish'];

export default function GiftQuiz({ samples, occasions, products=[], cartItems={}, setQty, onSelect, onClose }) {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({ fillings:[], garnish:[] });

  const total = STEPS.length;
  const hasProducts = products.length > 0;

  // Single pick → auto advance
  const pick = (key, val) => {
    setAnswers(a => ({ ...a, [key]: val }));
    setTimeout(() => setStep(s => Math.min(s+1, total)), 140);
  };

  // Multi toggle
  const toggle = (key, val) => {
    setAnswers(a => {
      const cur = a[key] || [];
      return { ...a, [key]: cur.includes(val) ? cur.filter(x=>x!==val) : [...cur, val] };
    });
  };

  const skip    = () => setStep(s => Math.min(s+1, total));
  const next    = () => setStep(s => Math.min(s+1, total));
  const back    = () => setStep(s => Math.max(s-1, 0));
  const restart = () => { setStep(0); setAnswers({ fillings:[], garnish:[] }); };

  const recommendedProducts = useMemo(() => {
    if (step !== total || !hasProducts) return [];
    return products
      .map(p => ({ ...p, _score: scoreProduct(p, answers.fillings) }))
      .sort((a,b) => b._score - a._score)
      .slice(0, 16);
  }, [step, products, answers.fillings, hasProducts]);

  const photoResults = useMemo(() => {
    if (step !== total || hasProducts) return [];
    return samples.slice(0, 12);
  }, [step, samples, hasProducts]);

  const progress = Math.round((step / total) * 100);
  const cartCount = Object.values(cartItems).reduce((s,q) => s+q, 0);

  return (
    <div onClick={onClose}
      style={{ position:'fixed',inset:0,background:'rgba(44,26,14,0.6)',zIndex:9100,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:cream,borderRadius:24,width:'100%',maxWidth:step===total?780:560,maxHeight:'92vh',overflow:'hidden',display:'flex',flexDirection:'column',fontFamily:font,boxShadow:'0 28px 90px rgba(44,26,14,0.25)',transition:'max-width 0.3s ease' }}>

        {/* Header */}
        <div style={{ padding:'15px 20px 11px',borderBottom:'1px solid rgba(196,122,46,0.1)',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              {step>0&&step<total&&(
                <button onClick={back} style={{ background:`${gold}12`,border:'none',borderRadius:8,width:28,height:28,cursor:'pointer',color:gold,fontWeight:800,fontSize:15,display:'flex',alignItems:'center',justifyContent:'center' }}>‹</button>
              )}
              <div style={{ fontSize:11.5,fontWeight:800,color:gold,letterSpacing:'0.1em',textTransform:'uppercase' }}>
                {step===total ? '🎁 Your Hamper Build' : `Step ${step+1} of ${total} · ${STEP_LABELS[step]}`}
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
          {/* Progress bar */}
          <div style={{ height:4,background:'rgba(196,122,46,0.12)',borderRadius:4,overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${progress}%`,background:`linear-gradient(90deg,${gold},#E8C074)`,borderRadius:4,transition:'width 0.4s cubic-bezier(.4,0,.2,1)' }}/>
          </div>
          {/* Step dots */}
          {step<total&&(
            <div style={{ display:'flex',gap:6,marginTop:9,alignItems:'center' }}>
              {STEP_LABELS.map((lbl,i) => (
                <div key={lbl} style={{ display:'flex',alignItems:'center',gap:6 }}>
                  <div style={{ width:i===step?10:8,height:i===step?10:8,borderRadius:'50%',background:i<=step?gold:'rgba(196,122,46,0.2)',transition:'all 0.2s',flexShrink:0 }}/>
                  {i===step&&<span style={{ fontSize:11,fontWeight:700,color:gold }}>{lbl}</span>}
                  {i<total-1&&i!==step&&<div style={{ width:14,height:1,background:'rgba(196,122,46,0.15)' }}/>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex:1,overflowY:'auto',padding:'20px 20px 24px' }}>

          {/* STEP 0 — Base */}
          {step===0&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:21,fontWeight:800,color:ink }}>Choose a base</div>
                <div style={{ fontSize:13,color:muted,marginTop:4 }}>What should everything be presented in?</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:9 }}>
                {BASES.map(b => (
                  <ChoiceCard key={b.id} emoji={b.emoji} label={b.label} sub={b.sub}
                    selected={answers.base===b.id} onClick={()=>pick('base',b.id)}/>
                ))}
              </div>
              <div style={{ display:'flex',justifyContent:'flex-end',marginTop:18 }}>
                <button onClick={skip} style={{ background:'none',border:'none',color:muted,fontSize:12.5,fontWeight:600,cursor:'pointer',fontFamily:font }}>Skip, any base →</button>
              </div>
            </div>
          )}

          {/* STEP 1 — What's inside */}
          {step===1&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:21,fontWeight:800,color:ink }}>What goes inside?</div>
                <div style={{ fontSize:13,color:muted,marginTop:4 }}>Pick everything you'd like to include — as many as you want</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:9 }}>
                {FILLINGS.map(f => {
                  const sel = (answers.fillings||[]).includes(f.id);
                  return <ChoiceCard key={f.id} emoji={f.emoji} label={f.label} sub={f.sub} selected={sel} onClick={()=>toggle('fillings',f.id)}/>;
                })}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:18 }}>
                <button onClick={back} style={{ background:'none',border:'none',color:muted,fontSize:12.5,fontWeight:600,cursor:'pointer',fontFamily:font }}>← Back</button>
                <div style={{ display:'flex',gap:10 }}>
                  <button onClick={skip} style={{ background:'none',border:'none',color:muted,fontSize:12.5,fontWeight:600,cursor:'pointer',fontFamily:font }}>Skip →</button>
                  <button onClick={next} style={{ background:gold,border:'none',color:'#fff',fontSize:12.5,fontWeight:700,cursor:'pointer',fontFamily:font,padding:'7px 16px',borderRadius:100 }}>
                    {(answers.fillings||[]).length>0 ? `Next (${answers.fillings.length} selected) →` : 'Next →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Garnishing */}
          {step===2&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:21,fontWeight:800,color:ink }}>Garnishing & finishing</div>
                <div style={{ fontSize:13,color:muted,marginTop:4 }}>The little touches that make it feel special — pick as many as you want</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:9 }}>
                {GARNISH.map(g => {
                  const sel = (answers.garnish||[]).includes(g.id);
                  return <ChoiceCard key={g.id} emoji={g.emoji} label={g.label} sub={g.sub} selected={sel} onClick={()=>toggle('garnish',g.id)}/>;
                })}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:18 }}>
                <button onClick={back} style={{ background:'none',border:'none',color:muted,fontSize:12.5,fontWeight:600,cursor:'pointer',fontFamily:font }}>← Back</button>
                <div style={{ display:'flex',gap:10 }}>
                  <button onClick={skip} style={{ background:'none',border:'none',color:muted,fontSize:12.5,fontWeight:600,cursor:'pointer',fontFamily:font }}>Skip →</button>
                  <button onClick={next} style={{ background:gold,border:'none',color:'#fff',fontSize:12.5,fontWeight:700,cursor:'pointer',fontFamily:font,padding:'7px 16px',borderRadius:100 }}>
                    {(answers.garnish||[]).length>0 ? `See recommendations (${answers.garnish.length} extras) →` : 'See recommendations →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {step===total&&(
            <div>
              {/* Build summary card */}
              {(answers.base||(answers.fillings||[]).length>0||(answers.garnish||[]).length>0)&&(
                <div style={{ padding:'13px 15px',borderRadius:14,background:`${gold}07`,border:`1px solid ${gold}22`,marginBottom:18 }}>
                  <div style={{ fontSize:11,fontWeight:800,color:gold,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10 }}>Your hamper build</div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:16 }}>
                    {answers.base&&(()=>{
                      const b=BASES.find(b=>b.id===answers.base);
                      return b?(
                        <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                          <div style={{ width:36,height:36,borderRadius:10,background:`${gold}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>{b.emoji}</div>
                          <div>
                            <div style={{ fontSize:10,color:muted,fontWeight:600 }}>Base</div>
                            <div style={{ fontSize:12,fontWeight:800,color:ink }}>{b.label}</div>
                          </div>
                        </div>
                      ):null;
                    })()}
                    {(answers.fillings||[]).length>0&&(
                      <div>
                        <div style={{ fontSize:10,color:muted,fontWeight:600,marginBottom:5 }}>Inside</div>
                        <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                          {(answers.fillings||[]).map(id=>{
                            const f=FILLINGS.find(f=>f.id===id);
                            return f?<span key={id} style={{ fontSize:11,fontWeight:700,color:ink,background:'rgba(196,122,46,0.1)',padding:'3px 9px',borderRadius:100 }}>{f.emoji} {f.label}</span>:null;
                          })}
                        </div>
                      </div>
                    )}
                    {(answers.garnish||[]).length>0&&(
                      <div>
                        <div style={{ fontSize:10,color:muted,fontWeight:600,marginBottom:5 }}>Garnishing</div>
                        <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                          {(answers.garnish||[]).map(id=>{
                            const g=GARNISH.find(g=>g.id===id);
                            return g?<span key={id} style={{ fontSize:11,fontWeight:700,color:ink,background:'rgba(196,122,46,0.1)',padding:'3px 9px',borderRadius:100 }}>{g.emoji} {g.label}</span>:null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:11,color:muted,marginTop:10,fontStyle:'italic' }}>Our team will put this together and confirm with you on WhatsApp before dispatch.</div>
                  <button onClick={restart} style={{ marginTop:10,fontSize:11.5,color:muted,background:'none',border:`1px solid ${gold}30`,padding:'4px 12px',borderRadius:100,cursor:'pointer',fontFamily:font }}>↺ Start over</button>
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
                      {recommendedProducts.map((p,i) => {
                        const qty = cartItems[p._id]||0;
                        const img = p.images?.[0]||p.imageUrl;
                        return (
                          <div key={p._id} style={{ borderRadius:14,overflow:'hidden',background:'#fff',border:'1px solid rgba(196,122,46,0.12)',display:'flex',flexDirection:'column',boxShadow:'0 2px 8px rgba(196,122,46,0.07)' }}>
                            <div style={{ height:140,overflow:'hidden',position:'relative',background:'rgba(196,122,46,0.04)' }}>
                              {img
                                ? <img src={img} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} loading="lazy"/>
                                : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40 }}>🎁</div>
                              }
                              {i<3&&<div style={{ position:'absolute',top:7,left:7,fontSize:9.5,fontWeight:800,color:'#fff',background:i===0?'#B8860B':gold,padding:'2px 8px',borderRadius:100 }}>{i===0?'⭐ Best Match':i===1?'✨ Great Pick':'💛 Top Choice'}</div>}
                            </div>
                            <div style={{ padding:'10px 12px',flex:1 }}>
                              <div style={{ fontSize:12.5,fontWeight:700,color:ink,lineHeight:1.3,marginBottom:4 }}>{p.name}</div>
                              {p.category&&<div style={{ fontSize:10.5,color:muted }}>{CAT_ICON[p.category]||'🎁'} {p.category}</div>}
                            </div>
                            <div style={{ padding:'0 12px 12px' }}>
                              {qty===0 ? (
                                <button onClick={()=>setQty&&setQty(p._id, Math.max(1, p.minOrderQuantity||1))}
                                  style={{ width:'100%',padding:'8px',borderRadius:9,border:`1.5px solid ${gold}`,background:'transparent',color:gold,fontSize:12.5,fontWeight:700,cursor:'pointer',fontFamily:font }}>
                                  + Add
                                </button>
                              ) : (
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
                photoResults.length===0 ? (
                  <div style={{ textAlign:'center',padding:'36px 0' }}>
                    <div style={{ fontSize:40,marginBottom:12 }}>😔</div>
                    <div style={{ fontSize:16,fontWeight:700,color:ink }}>No matches found</div>
                    <button onClick={restart} style={{ marginTop:16,padding:'10px 22px',borderRadius:12,border:`1.5px solid ${gold}`,background:'transparent',color:gold,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:font }}>Try again</button>
                  </div>
                ) : (
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))',gap:12 }}>
                    {photoResults.map((s,i) => (
                      <div key={s._id||i} onClick={()=>{onSelect&&onSelect(s);onClose();}}
                        style={{ borderRadius:14,overflow:'hidden',background:'#fff',border:'1px solid rgba(196,122,46,0.12)',cursor:'pointer',boxShadow:'0 2px 10px rgba(196,122,46,0.07)',transition:'transform 0.14s,box-shadow 0.14s' }}
                        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(196,122,46,0.18)';}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 10px rgba(196,122,46,0.07)';}}>
                        <div style={{ height:155,overflow:'hidden',position:'relative' }}>
                          <img src={s.url} alt={s.name||'Gift'} style={{ width:'100%',height:'100%',objectFit:'cover' }} loading="lazy"/>
                          {i<3&&<div style={{ position:'absolute',top:8,left:8,fontSize:9.5,fontWeight:800,color:'#fff',background:i===0?'#B8860B':gold,padding:'3px 9px',borderRadius:100,backdropFilter:'blur(4px)' }}>{i===0?'⭐ Best Match':i===1?'✨ Great Pick':'💛 Top Choice'}</div>}
                        </div>
                        {s.name&&<div style={{ padding:'10px 12px',fontSize:12.5,fontWeight:700,color:ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{s.name}</div>}
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

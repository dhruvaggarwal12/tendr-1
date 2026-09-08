import { useState, useMemo } from 'react';

const gold   = '#C47A2E';
const ink    = '#2C1A0E';
const muted  = '#9B7450';
const cream  = '#FFFCF8';
const softBg = '#FAF6F0';
const font   = "'Outfit', sans-serif";
const serif  = "'Cormorant Garamond', Georgia, serif";

// ── Data ─────────────────────────────────────────────────────────────────────

const BASES = [
  { id:'tokri',    emoji:'🧺', label:'Tokri',            sub:'Classic woven basket — timeless & festive' },
  { id:'box',      emoji:'📦', label:'Gift Box',          sub:'Rigid decorative box — premium & structured' },
  { id:'tray',     emoji:'🪵', label:'Wooden Tray',       sub:'Open display tray — rustic, visible contents' },
  { id:'bag',      emoji:'🛍️', label:'Jute / Gift Bag',  sub:'Eco-friendly bag — casual and easy to carry' },
  { id:'crate',    emoji:'📫', label:'Wooden Crate',      sub:'Rustic crate — great for large assortments' },
  { id:'tin',      emoji:'🫙', label:'Tin / Jar',         sub:'Reusable tin or glass jar — neat & minimalist' },
  { id:'sleeve',   emoji:'📜', label:'Tube / Sleeve',     sub:'Paper tube or sleeve wrap — modern & compact' },
  { id:'thali',    emoji:'🪬', label:'Pooja Thali',       sub:'Traditional thali — perfect for spiritual gifts' },
  { id:'surprise', emoji:'✨', label:'Surprise me',       sub:'Let our team choose the best fit' },
];

// cat = category keywords used to match against sample.category
const FILLINGS = [
  { id:'dryfruits',   emoji:'🥜', label:'Dry Fruits & Nuts',       cats:['Dry Fruits & Nuts','dry fruits','nuts'] },
  { id:'chocolates',  emoji:'🍫', label:'Chocolates & Sweets',     cats:['Chocolates & Sweets','chocolate','sweets','mithai'] },
  { id:'drinkware',   emoji:'☕', label:'Tea / Coffee / Drinks',   cats:['Drinkware','tea','coffee','drinks'] },
  { id:'pooja',       emoji:'🪔', label:'Spiritual & Pooja',       cats:['Spiritual & Pooja','pooja','spiritual','diya','religious'] },
  { id:'decor',       emoji:'🎀', label:'Decorative Items',        cats:['Decorative Boxes','decor','decorative'] },
  { id:'skincare',    emoji:'🧴', label:'Skincare / Wellness',     cats:['skincare','wellness','beauty'] },
  { id:'snacks',      emoji:'🍪', label:'Snacks & Munchies',       cats:['snacks','munchies','food'] },
  { id:'stationary',  emoji:'📓', label:'Stationery / Books',      cats:['stationery','books','journal'] },
  { id:'candles',     emoji:'🕯️', label:'Candles',                cats:['candles','candle'] },
  { id:'flowers',     emoji:'🌸', label:'Dried / Artificial Flowers', cats:['flowers','floral','dried flowers'] },
];

// Exact category → filling id map (mirrors AI tagger's GH_CATEGORIES)
const CAT_TO_FILLING = {
  'Dry Fruits & Nuts':   'dryfruits',
  'Chocolates & Sweets': 'chocolates',
  'Drinkware':           'drinkware',
  'Spiritual & Pooja':   'pooja',
  'Decorative Boxes':    'decor',
  'Tokri & Hampers':     null, // base container — scored via BASE_TO_CAT
};

// Quiz base id → photo category that signals this base type
const BASE_TO_CAT = {
  'tokri': 'Tokri & Hampers',
  'box':   'Decorative Boxes',
  'thali': 'Spiritual & Pooja',
};

function scoreSample(sample, chosenFillings, chosenBase) {
  const rawCat = sample.category || [];
  const cats   = (Array.isArray(rawCat) ? rawCat : [rawCat]).map(c => (c || '').trim());
  const name   = (sample.name || '').toLowerCase();

  let score = 0;

  // Base match: +3 if the photo's category matches the chosen base type
  if (chosenBase && BASE_TO_CAT[chosenBase]) {
    if (cats.includes(BASE_TO_CAT[chosenBase])) score += 3;
  }

  if (!chosenFillings || chosenFillings.length === 0) return score;

  // Exact category → filling match: +5 per match (highest signal)
  for (const cat of cats) {
    const fillingId = CAT_TO_FILLING[cat];
    if (fillingId && chosenFillings.includes(fillingId)) score += 5;
  }

  // Keyword fallback on name: +2 per matched filling (handles untagged photos)
  for (const id of chosenFillings) {
    const filling = FILLINGS.find(f => f.id === id);
    if (!filling) continue;
    for (const kw of filling.cats) {
      if (name.includes(kw.toLowerCase())) { score += 2; break; }
    }
  }

  return score;
}

const GARNISH = [
  { id:'ribbon',      emoji:'🎀', label:'Satin Ribbon & Bow' },
  { id:'tissue',      emoji:'🌟', label:'Tissue / Crinkle Paper' },
  { id:'driedflower', emoji:'🌸', label:'Dried Flower Sprigs' },
  { id:'shredpaper',  emoji:'✨', label:'Shredded Paper Fill' },
  { id:'card',        emoji:'💌', label:'Handwritten Note Card' },
  { id:'tag',         emoji:'🏷️', label:'Personalised Gift Tag' },
  { id:'wax',         emoji:'🖊️', label:'Wax Seal' },
  { id:'wrap',        emoji:'🎁', label:'Cellophane Wrap' },
  { id:'jute',        emoji:'🪢', label:'Jute / Twine Tie' },
  { id:'petals',      emoji:'🌺', label:'Flower Petals Scatter' },
  { id:'confetti',    emoji:'🎊', label:'Gold / Silver Confetti' },
  { id:'incense',     emoji:'🕯️', label:'Incense / Fragrance' },
];

const STEPS = ['base', 'fillings', 'garnish'];
const STEP_META = [
  { key:'base',     label:'Choose a base',         sub:'What should your hamper be presented in?', icon:'🧺', single:true },
  { key:'fillings', label:"What goes inside?",     sub:'Pick everything you\'d like to include — as many as you want', icon:'🎁', single:false },
  { key:'garnish',  label:'Finishing touches',      sub:'The little details that make it feel special', icon:'✨', single:false },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function BaseRow({ emoji, label, sub, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '13px 15px', borderRadius: 12, cursor: 'pointer',
      fontFamily: font, textAlign: 'left', transition: 'all 0.13s',
      background: selected ? 'rgba(196,122,46,0.07)' : '#fff',
      border: `1.5px solid ${selected ? gold : 'rgba(196,122,46,0.14)'}`,
      boxShadow: selected ? `0 0 0 3px rgba(196,122,46,0.12)` : '0 1px 3px rgba(44,26,14,0.05)',
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(196,122,46,0.38)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(196,122,46,0.14)'; }}>
      <span style={{ fontSize:22, width:32, textAlign:'center', flexShrink:0 }}>{emoji}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13.5, fontWeight:700, color:ink, lineHeight:1.2 }}>{label}</div>
        {sub && <div style={{ fontSize:11.5, color:muted, marginTop:2, lineHeight:1.35 }}>{sub}</div>}
      </div>
      <div style={{
        width:20, height:20, borderRadius:'50%', flexShrink:0,
        background: selected ? gold : 'rgba(196,122,46,0.12)',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'background 0.13s',
      }}>
        {selected && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
    </button>
  );
}

function Chip({ emoji, label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'10px 14px', borderRadius:10, cursor:'pointer',
      fontFamily:font, textAlign:'left', width:'100%',
      transition:'all 0.13s',
      background: selected ? 'rgba(196,122,46,0.09)' : '#fff',
      border: `1.5px solid ${selected ? gold : 'rgba(196,122,46,0.14)'}`,
      boxShadow: selected ? `0 0 0 3px rgba(196,122,46,0.12)` : '0 1px 3px rgba(44,26,14,0.04)',
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor='rgba(196,122,46,0.38)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor=selected?gold:'rgba(196,122,46,0.14)'; }}>
      <span style={{ fontSize:17, flexShrink:0 }}>{emoji}</span>
      <span style={{ fontSize:13, fontWeight:selected?700:600, color:selected?ink:'#5A3A1A', lineHeight:1.2, flex:1 }}>{label}</span>
      {selected && (
        <div style={{ width:16,height:16,borderRadius:'50%',background:gold,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function GiftQuiz({ samples, onSelect, onClose }) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({ fillings:[], garnish:[] });

  const total = STEPS.length;

  const pick   = (key, val) => { setAnswers(a => ({ ...a, [key]: val })); setTimeout(() => setStep(s => Math.min(s+1, total)), 160); };
  const toggle = (key, val) => setAnswers(a => { const cur = a[key]||[]; return { ...a, [key]: cur.includes(val) ? cur.filter(x=>x!==val) : [...cur, val] }; });
  const skip   = () => setStep(s => Math.min(s+1, total));
  const next   = () => setStep(s => Math.min(s+1, total));
  const back   = () => setStep(s => Math.max(s-1, 0));
  const restart= () => { setStep(0); setAnswers({ fillings:[], garnish:[] }); };

  const photoResults = useMemo(() => {
    if (step !== total) return [];
    const all = samples || [];
    const scored = all.map(s => ({ ...s, _score: scoreSample(s, answers.fillings, answers.base) }));
    const matched   = scored.filter(s => s._score > 0).sort((a,b) => b._score - a._score);
    const unmatched = scored.filter(s => s._score === 0);
    return [...matched, ...unmatched].slice(0, 12);
  }, [step, samples, answers.fillings, answers.base]);

  const progress = Math.round((step / total) * 100);
  const isResult = step === total;

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(28,10,4,0.62)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', backdropFilter:'blur(5px)' }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: cream, borderRadius:24, width:'100%',
        maxWidth: isResult ? 820 : 560,
        maxHeight:'92vh', overflow:'hidden',
        display:'flex', flexDirection:'column',
        fontFamily:font,
        boxShadow:'0 32px 100px rgba(28,10,4,0.28)',
        transition:'max-width 0.3s ease',
      }}>

        {/* ── Header ── */}
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid rgba(196,122,46,0.1)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>

            {/* Left: back + step label */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {step > 0 && step < total && (
                <button onClick={back} style={{ width:30, height:30, borderRadius:8, border:'1.5px solid rgba(196,122,46,0.2)', background:'#fff', color:gold, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700 }}>‹</button>
              )}
              <span style={{ fontSize:11, fontWeight:700, color:gold, letterSpacing:'0.12em', textTransform:'uppercase' }}>
                {isResult ? 'Your Hamper Build' : `Step ${step+1} of ${total}`}
              </span>
            </div>

            {/* Right: close */}
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:'rgba(196,122,46,0.07)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:muted, fontSize:16 }}>✕</button>
          </div>

          {/* Progress bar */}
          <div style={{ height:3, background:'rgba(196,122,46,0.1)', borderRadius:3, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${gold},#E8C074)`, borderRadius:3, transition:'width 0.4s ease' }}/>
          </div>

          {/* Step pills */}
          {!isResult && (
            <div style={{ display:'flex', gap:6, marginTop:12 }}>
              {STEP_META.map((m, i) => (
                <div key={m.key} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{
                    height:24, padding:'0 10px', borderRadius:100,
                    background: i < step ? `${gold}18` : i === step ? gold : 'rgba(196,122,46,0.08)',
                    color: i === step ? '#fff' : i < step ? gold : muted,
                    fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:5,
                    transition:'all 0.2s',
                  }}>
                    {i < step && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {m.label.split(' ')[0]}
                  </div>
                  {i < STEP_META.length-1 && <div style={{ width:12, height:1, background:'rgba(196,122,46,0.15)' }}/>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ flex:1, overflowY:'auto', padding:'22px 22px 26px' }}>

          {/* STEP 0 — Base */}
          {step === 0 && (
            <div>
              <div style={{ marginBottom:20 }}>
                <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:400, fontStyle:'italic', color:ink, margin:'0 0 5px', lineHeight:1.15 }}>Choose a base</h2>
                <p style={{ fontSize:13, color:muted, margin:0, lineHeight:1.5 }}>What should everything be presented in?</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {BASES.map(b => (
                  <BaseRow key={b.id} {...b} selected={answers.base===b.id} onClick={() => pick('base', b.id)}/>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
                <button onClick={skip} style={{ background:'none', border:'none', color:muted, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>Skip, any base →</button>
              </div>
            </div>
          )}

          {/* STEP 1 — What's inside */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom:20 }}>
                <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:400, fontStyle:'italic', color:ink, margin:'0 0 5px', lineHeight:1.15 }}>What goes inside?</h2>
                <p style={{ fontSize:13, color:muted, margin:0, lineHeight:1.5 }}>Pick everything you'd like to include</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {FILLINGS.map(f => (
                  <Chip key={f.id} emoji={f.emoji} label={f.label}
                    selected={(answers.fillings||[]).includes(f.id)}
                    onClick={() => toggle('fillings', f.id)}/>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:18 }}>
                <button onClick={back} style={{ background:'none', border:'none', color:muted, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>← Back</button>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <button onClick={skip} style={{ background:'none', border:'none', color:muted, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>Skip</button>
                  <button onClick={next} style={{ background:`linear-gradient(135deg,${gold},#E8C074)`, border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, padding:'9px 22px', borderRadius:100, boxShadow:`0 4px 14px ${gold}44` }}>
                    {(answers.fillings||[]).length > 0 ? `Next · ${answers.fillings.length} selected →` : 'Next →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Garnishing */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom:20 }}>
                <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:400, fontStyle:'italic', color:ink, margin:'0 0 5px', lineHeight:1.15 }}>Finishing touches</h2>
                <p style={{ fontSize:13, color:muted, margin:0, lineHeight:1.5 }}>The little details that make it feel special</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {GARNISH.map(g => (
                  <Chip key={g.id} emoji={g.emoji} label={g.label}
                    selected={(answers.garnish||[]).includes(g.id)}
                    onClick={() => toggle('garnish', g.id)}/>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:18 }}>
                <button onClick={back} style={{ background:'none', border:'none', color:muted, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>← Back</button>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <button onClick={skip} style={{ background:'none', border:'none', color:muted, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>Skip</button>
                  <button onClick={next} style={{ background:`linear-gradient(135deg,${gold},#E8C074)`, border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font, padding:'9px 22px', borderRadius:100, boxShadow:`0 4px 14px ${gold}44` }}>
                    {(answers.garnish||[]).length > 0 ? `See results · ${answers.garnish.length} extras →` : 'See results →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {isResult && (
            <div>
              {/* Build summary */}
              {(answers.base || (answers.fillings||[]).length > 0 || (answers.garnish||[]).length > 0) && (
                <div style={{ padding:'14px 16px', borderRadius:14, background:`${gold}07`, border:`1px solid ${gold}1A`, marginBottom:22 }}>
                  <div style={{ fontSize:10.5, fontWeight:800, color:gold, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:11 }}>Your hamper build</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
                    {answers.base && (() => {
                      const b = BASES.find(b => b.id === answers.base);
                      return b ? (
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:34, height:34, borderRadius:9, background:`${gold}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{b.emoji}</div>
                          <div>
                            <div style={{ fontSize:9.5, color:muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Base</div>
                            <div style={{ fontSize:12.5, fontWeight:700, color:ink }}>{b.label}</div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                    {(answers.fillings||[]).length > 0 && (
                      <div>
                        <div style={{ fontSize:9.5, color:muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Inside</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                          {(answers.fillings||[]).map(id => { const f=FILLINGS.find(f=>f.id===id); return f ? <span key={id} style={{ fontSize:11, fontWeight:700, color:ink, background:'rgba(196,122,46,0.1)', padding:'3px 9px', borderRadius:100 }}>{f.emoji} {f.label}</span> : null; })}
                        </div>
                      </div>
                    )}
                    {(answers.garnish||[]).length > 0 && (
                      <div>
                        <div style={{ fontSize:9.5, color:muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Finishing</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                          {(answers.garnish||[]).map(id => { const g=GARNISH.find(g=>g.id===id); return g ? <span key={id} style={{ fontSize:11, fontWeight:700, color:ink, background:'rgba(196,122,46,0.1)', padding:'3px 9px', borderRadius:100 }}>{g.emoji} {g.label}</span> : null; })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:11, color:muted, marginTop:10, lineHeight:1.5 }}>Our team will put this together and confirm with you on WhatsApp before dispatch.</div>
                  <button onClick={restart} style={{ marginTop:8, fontSize:11.5, color:muted, background:'none', border:`1px solid ${gold}28`, padding:'4px 13px', borderRadius:100, cursor:'pointer', fontFamily:font }}>↺ Start over</button>
                </div>
              )}

              {/* Sample photos */}
              {photoResults.length > 0 ? (
                <>
                  <div style={{ marginBottom:14 }}>
                    <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:400, fontStyle:'italic', color:ink, margin:'0 0 3px' }}>Hampers we've made</h3>
                    <p style={{ fontSize:12, color:muted, margin:0 }}>Tap any to add to your wishlist</p>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:12 }}>
                    {photoResults.map((s, i) => (
                      <div key={s._id||i}
                        onClick={() => { onSelect && onSelect(s); onClose(); }}
                        style={{ borderRadius:14, overflow:'hidden', background:'#fff', border:'1px solid rgba(196,122,46,0.12)', cursor:'pointer', boxShadow:'0 2px 10px rgba(196,122,46,0.07)', transition:'transform 0.14s,box-shadow 0.14s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(196,122,46,0.18)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(196,122,46,0.07)'; }}>
                        <div style={{ height:150, overflow:'hidden', position:'relative' }}>
                          <img src={s.url} alt={s.name||'Gift'} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy"/>
                          {i < 3 && (
                            <div style={{ position:'absolute', top:8, left:8, fontSize:9.5, fontWeight:800, color:'#fff', background:i===0?'#8B6914':gold, padding:'3px 9px', borderRadius:100, backdropFilter:'blur(4px)' }}>
                              {i===0?'⭐ Top Pick':i===1?'✨ Popular':'💛 Fan Fav'}
                            </div>
                          )}
                        </div>
                        {s.name && <div style={{ padding:'10px 12px', fontSize:12.5, fontWeight:700, color:ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'40px 0' }}>
                  <div style={{ fontSize:38, marginBottom:10 }}>🎁</div>
                  <div style={{ fontFamily:serif, fontSize:20, fontWeight:400, fontStyle:'italic', color:ink, marginBottom:6 }}>We'll curate it for you</div>
                  <div style={{ fontSize:13, color:muted }}>Share your preferences with our team and we'll put together the perfect hamper.</div>
                </div>
              )}

              {/* CTA */}
              <button onClick={onClose} style={{ marginTop:20, width:'100%', padding:'14px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${gold},#E8C074)`, color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:font, boxShadow:`0 4px 18px ${gold}44`, letterSpacing:'0.01em' }}>
                Talk to Our Team →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

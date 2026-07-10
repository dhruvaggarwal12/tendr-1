import { useState } from 'react';
import HamburgerNav from '../../components/HamburgerNav';

const font = "'Outfit', sans-serif";
const gold = "#C47A2E";

/* ─── Quiz steps ──────────────────────────────────────────────────────────
   Each gift sample has tags: occasion[], recipient[], budget, vibe[]
   Photos are placeholders — replace photoUrl values with real Cloudinary URLs
──────────────────────────────────────────────────────────────────────────── */
const QUIZ = [
  {
    key: 'occasion',
    question: "What's the occasion?",
    options: [
      { label: 'Birthday',      emoji: '🎂' },
      { label: 'Anniversary',   emoji: '💕' },
      { label: 'Wedding',       emoji: '💒' },
      { label: 'Baby Shower',   emoji: '🍼' },
      { label: 'Corporate',     emoji: '💼' },
      { label: 'Festival',      emoji: '🪔' },
      { label: 'Thank You',     emoji: '🙏' },
      { label: 'Just Because',  emoji: '🌸' },
    ],
  },
  {
    key: 'recipient',
    question: 'Who is it for?',
    options: [
      { label: 'Parent',    emoji: '👨‍👩‍👧' },
      { label: 'Partner',   emoji: '❤️' },
      { label: 'Friend',    emoji: '🤝' },
      { label: 'Kids',      emoji: '🧒' },
      { label: 'Colleague', emoji: '👔' },
      { label: 'Client',    emoji: '🤝🏽' },
    ],
  },
  {
    key: 'budget',
    question: "What's your budget?",
    options: [
      { label: 'Under ₹500',       emoji: '💸' },
      { label: '₹500 – ₹1,000',   emoji: '💰' },
      { label: '₹1,000 – ₹2,500', emoji: '💳' },
      { label: '₹2,500 – ₹5,000', emoji: '🏅' },
      { label: '₹5,000+',         emoji: '✨' },
    ],
  },
  {
    key: 'vibe',
    question: 'What vibe are you going for?',
    options: [
      { label: 'Luxurious',    emoji: '👑' },
      { label: 'Thoughtful',   emoji: '💌' },
      { label: 'Fun & Quirky', emoji: '🎉' },
      { label: 'Traditional',  emoji: '🪔' },
      { label: 'Healthy',      emoji: '🌿' },
    ],
  },
];

/* ─── Gift sample data ───────────────────────────────────────────────────
   Replace photoUrl with real Cloudinary/S3 image URLs.
   Tags must match QUIZ option labels exactly.
──────────────────────────────────────────────────────────────────────────── */
const GIFT_SAMPLES = [
  { id:1,  name:"Luxury Birthday Hamper",     photoUrl:"", tags:{ occasion:["Birthday"],              recipient:["Friend","Partner","Parent"], budget:["₹2,500 – ₹5,000","₹5,000+"],         vibe:["Luxurious","Thoughtful"]   } },
  { id:2,  name:"Sweet Celebration Box",       photoUrl:"", tags:{ occasion:["Birthday","Anniversary"],  recipient:["Partner","Friend"],          budget:["₹1,000 – ₹2,500","₹2,500 – ₹5,000"], vibe:["Fun & Quirky","Thoughtful"] } },
  { id:3,  name:"Anniversary Love Hamper",     photoUrl:"", tags:{ occasion:["Anniversary","Wedding"],   recipient:["Partner"],                   budget:["₹2,500 – ₹5,000","₹5,000+"],         vibe:["Luxurious","Thoughtful"]   } },
  { id:4,  name:"Wedding Welcome Basket",      photoUrl:"", tags:{ occasion:["Wedding"],                 recipient:["Parent","Friend"],            budget:["₹2,500 – ₹5,000","₹5,000+"],         vibe:["Luxurious","Traditional"]  } },
  { id:5,  name:"Baby Shower Essentials",      photoUrl:"", tags:{ occasion:["Baby Shower"],             recipient:["Parent","Friend"],            budget:["₹1,000 – ₹2,500","₹2,500 – ₹5,000"], vibe:["Thoughtful","Fun & Quirky"] } },
  { id:6,  name:"Corporate Gift Set",          photoUrl:"", tags:{ occasion:["Corporate","Thank You"],   recipient:["Colleague","Client"],        budget:["₹1,000 – ₹2,500","₹2,500 – ₹5,000"], vibe:["Luxurious","Thoughtful"]   } },
  { id:7,  name:"Festive Diwali Box",          photoUrl:"", tags:{ occasion:["Festival"],                recipient:["Parent","Friend","Colleague","Client"], budget:["₹500 – ₹1,000","₹1,000 – ₹2,500"], vibe:["Traditional","Luxurious"] } },
  { id:8,  name:"Wellness & Self-Care Kit",    photoUrl:"", tags:{ occasion:["Birthday","Thank You","Just Because"], recipient:["Friend","Partner","Parent"], budget:["₹1,000 – ₹2,500","₹2,500 – ₹5,000"], vibe:["Healthy","Thoughtful"] } },
  { id:9,  name:"Mini Thank You Box",          photoUrl:"", tags:{ occasion:["Thank You","Just Because"], recipient:["Friend","Colleague","Client"], budget:["Under ₹500","₹500 – ₹1,000"],        vibe:["Thoughtful","Fun & Quirky"] } },
  { id:10, name:"Kids Fun Gift Pack",          photoUrl:"", tags:{ occasion:["Birthday","Just Because"],  recipient:["Kids"],                      budget:["₹500 – ₹1,000","₹1,000 – ₹2,500"],   vibe:["Fun & Quirky"]             } },
  { id:11, name:"Premium Chocolate Assortment",photoUrl:"", tags:{ occasion:["Birthday","Anniversary","Festival"], recipient:["Partner","Parent","Friend","Client"], budget:["₹1,000 – ₹2,500"], vibe:["Luxurious","Traditional"] } },
  { id:12, name:"Eco-Friendly Wellness Hamper",photoUrl:"", tags:{ occasion:["Just Because","Thank You"], recipient:["Friend","Colleague"],        budget:["₹1,000 – ₹2,500","₹2,500 – ₹5,000"], vibe:["Healthy","Thoughtful"]   } },
];

function scoreMatch(sample, answers) {
  let score = 0;
  for (const [key, val] of Object.entries(answers)) {
    if (!val) continue;
    const tagList = sample.tags[key];
    if (!tagList) continue;
    if (tagList.includes(val)) score += 1;
  }
  return score;
}

function PhotoPlaceholder({ name }) {
  return (
    <div style={{ width:'100%', aspectRatio:'4/3', background:'linear-gradient(135deg,rgba(196,122,46,0.12),rgba(196,122,46,0.06))', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
      <div style={{ fontSize:36 }}>🎁</div>
      <div style={{ fontSize:11, color:'#9B7450', fontWeight:600, textAlign:'center', padding:'0 12px', lineHeight:1.4 }}>{name}</div>
    </div>
  );
}

export default function GiftAdvisor() {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone]       = useState(false);

  const current = QUIZ[step];
  const progress = (step / QUIZ.length) * 100;

  const pick = (val) => {
    const next = { ...answers, [current.key]: val };
    setAnswers(next);
    if (step < QUIZ.length - 1) {
      setStep(s => s + 1);
    } else {
      setDone(true);
    }
  };

  const restart = () => { setStep(0); setAnswers({}); setDone(false); };

  const results = done
    ? GIFT_SAMPLES
        .map(g => ({ ...g, score: scoreMatch(g, answers) }))
        .sort((a, b) => b.score - a.score)
        .filter(g => g.score > 0)
        .slice(0, 6)
    : [];

  const waMsg = (name) => `Hi! I saw the "${name}" gift sample on Tendr and I'm interested. Could you share more details?`;

  return (
    <div style={{ minHeight:'100vh', background:'#FFFCF5', fontFamily:font }}>
      <HamburgerNav/>
      <div style={{ maxWidth: 640, margin:'0 auto', padding:'28px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize:11, fontWeight:800, color:gold, textTransform:'uppercase', letterSpacing:'0.16em', margin:'0 0 6px' }}>Gift Advisor</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(1.8rem,5vw,2.6rem)', fontWeight:400, color:'#2C1A0E', margin:'0 0 8px' }}>
            Find the perfect gift
          </h1>
          <p style={{ fontSize:14, color:'#6B4226', margin:0, lineHeight:1.6 }}>
            Answer 4 quick questions and we'll show you gift hampers that fit.
          </p>
        </div>

        {!done ? (
          <>
            {/* Progress bar */}
            <div style={{ height:4, background:'rgba(196,122,46,0.15)', borderRadius:100, marginBottom:28, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(to right,${gold},#CCAB4A)`, borderRadius:100, transition:'width 0.3s' }}/>
            </div>

            {/* Question */}
            <div style={{ background:'#fff', borderRadius:20, border:'1.5px solid rgba(196,122,46,0.15)', padding:'28px 24px', marginBottom:16 }}>
              <div style={{ fontSize:11, color:'#9B7450', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>
                Question {step+1} of {QUIZ.length}
              </div>
              <h2 style={{ fontSize:'clamp(1.1rem,3vw,1.4rem)', fontWeight:800, color:'#2C1A0E', margin:'0 0 22px', lineHeight:1.3 }}>
                {current.question}
              </h2>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {current.options.map(({ label, emoji }) => (
                  <button key={label} onClick={() => pick(label)}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 18px', borderRadius:12, border:'1.5px solid rgba(196,122,46,0.25)', background:'#FFFCF5', color:'#2C1A0E', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:font, transition:'all 0.15s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=gold; e.currentTarget.style.background='rgba(196,122,46,0.08)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(196,122,46,0.25)'; e.currentTarget.style.background='#FFFCF5'; }}>
                    <span style={{ fontSize:20 }}>{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Back / skip */}
            <div style={{ display:'flex', gap:12 }}>
              {step > 0 && (
                <button onClick={() => setStep(s=>s-1)}
                  style={{ padding:'8px 20px', borderRadius:100, border:'1.5px solid rgba(196,122,46,0.3)', background:'#fff', color:'#9B7450', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:font }}>
                  ← Back
                </button>
              )}
              <button onClick={() => pick(null)}
                style={{ padding:'8px 20px', borderRadius:100, border:'1.5px solid rgba(196,122,46,0.2)', background:'transparent', color:'#9B7450', fontSize:13, cursor:'pointer', fontFamily:font }}>
                Skip
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Results header */}
            <div style={{ background:'linear-gradient(135deg,#2C1A0E,#4A2810)', borderRadius:16, padding:'20px 24px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:'#CCAB4A', marginBottom:4 }}>
                  {results.length > 0 ? `${results.length} gift suggestions for you` : 'No exact matches'}
                </div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }}>
                  {answers.occasion && `${answers.occasion} · `}{answers.recipient && `${answers.recipient} · `}{answers.budget}
                </div>
              </div>
              <button onClick={restart}
                style={{ padding:'8px 16px', borderRadius:100, border:'1.5px solid rgba(200,167,74,0.4)', background:'transparent', color:'#CCAB4A', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:font }}>
                Start Over
              </button>
            </div>

            {results.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 24px', background:'#fff', borderRadius:16, border:'1.5px solid rgba(196,122,46,0.15)' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🎁</div>
                <div style={{ fontSize:16, fontWeight:700, color:'#2C1A0E', marginBottom:8 }}>No exact match</div>
                <p style={{ fontSize:13, color:'#9B7450', marginBottom:20 }}>Try different answers or browse all our gift hampers.</p>
                <button onClick={restart}
                  style={{ padding:'10px 24px', borderRadius:100, border:'none', background:`linear-gradient(135deg,${gold},#CCAB4A)`, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:font }}>
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }} className="gift-grid">
                  {results.map(g => (
                    <div key={g.id} style={{ borderRadius:14, overflow:'hidden', border:'1.5px solid rgba(196,122,46,0.18)', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column' }}>
                      {g.photoUrl
                        ? <img src={g.photoUrl} alt={g.name} style={{ width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block' }}/>
                        : <PhotoPlaceholder name={g.name}/>
                      }
                      <div style={{ padding:'10px 12px 12px', display:'flex', flexDirection:'column', gap:8 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:'#2C1A0E', lineHeight:1.3 }}>{g.name}</div>
                        <button
                          onClick={() => window.open(`https://wa.me/919XXXXXXXXX?text=${encodeURIComponent(waMsg(g.name))}`, '_blank')}
                          style={{ width:'100%', padding:'8px', borderRadius:8, border:'none', background:'#25D366', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:font }}>
                          📲 Enquire on WhatsApp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop:24, background:'rgba(196,122,46,0.07)', borderRadius:14, padding:'16px 20px', border:'1.5px solid rgba(196,122,46,0.15)', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ fontSize:28, flexShrink:0 }}>🎁</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#2C1A0E', marginBottom:3 }}>Don't see what you want?</div>
                    <div style={{ fontSize:12, color:'#9B7450', lineHeight:1.5 }}>Chat with us and we'll put together a custom gift hamper for your occasion.</div>
                  </div>
                  <button onClick={() => window.open('https://wa.me/919XXXXXXXXX?text=' + encodeURIComponent('Hi! I need help choosing a gift hamper. Can you help me?'), '_blank')}
                    style={{ padding:'8px 14px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${gold},#CCAB4A)`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:font, flexShrink:0 }}>
                    Chat with us
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 480px) { .gift-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

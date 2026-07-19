import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";
import {
  OCCASIONS, RECIPIENTS, INTERESTS, CATALOG_ITEMS, CATALOG_CATS,
  COLLECTIONS, BULK_COLLECTIONS, suggestHampers, fmt,
} from "../../data/giftingData";

const font = "'Outfit', 'Inter', sans-serif";
const GOLD = "#C47A2E";
const DARK = "#2C1A0E";
const CREAM = "#FDF8F0";

// ── Shared helpers ────────────────────────────────────────────────────────────

function Chip({ label, active, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 50, border: `1.5px solid ${active ? GOLD : "rgba(44,26,14,0.18)"}`,
      background: active ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#fff",
      color: active ? "#fff" : DARK, fontSize: 13, fontWeight: active ? 700 : 500,
      cursor: "pointer", fontFamily: font, transition: "all 0.18s", whiteSpace: "nowrap", ...style,
    }}>{label}</button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
      color: GOLD, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, padding: "0 0 4px",
    }}>← Back</button>
  );
}

function FloatingGetBtn({ label = "Get This Hamper", onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "14px", borderRadius: 14, border: "none",
      background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff",
      fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font,
      boxShadow: "0 4px 18px rgba(196,122,46,0.35)", marginTop: 2,
    }}>{label} →</button>
  );
}

function CollectionCard({ col, onGet, isStretch }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={{
      background: "#fff", borderRadius: 18, overflow: "hidden",
      boxShadow: "0 2px 16px rgba(44,26,14,0.09)", border: "1.5px solid rgba(196,122,46,0.12)",
      display: "flex", flexDirection: "column",
      ...(isStretch ? { opacity: 0.88, border: "1.5px dashed rgba(196,122,46,0.35)" } : {}),
    }}>
      {/* Photo */}
      <div style={{ height: 160, background: "#f5ede0", position: "relative", overflow: "hidden" }}>
        {!imgErr
          ? <img src={col.photo} alt={col.name} onError={() => setImgErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 52 }}>{col.emoji}</div>
        }
        {col.badge && (
          <div style={{
            position: "absolute", top: 10, left: 10, background: GOLD, color: "#fff",
            fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, fontFamily: font,
          }}>{col.badge}</div>
        )}
        {isStretch && (
          <div style={{
            position: "absolute", top: 10, right: 10, background: "#7C3AED", color: "#fff",
            fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, fontFamily: font,
          }}>Stretch Pick</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: DARK, fontFamily: font, lineHeight: 1.2 }}>{col.name}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, whiteSpace: "nowrap", marginLeft: 8 }}>
            {fmt(col.priceRange[0])}–{fmt(col.priceRange[1])}
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: "#9B7450", fontFamily: font }}>{col.tagline}</div>

        {/* Items */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
          {col.items.slice(0, 4).map((item, i) => (
            <span key={i} style={{
              fontSize: 10.5, background: "rgba(196,122,46,0.09)", color: "#7A5020",
              padding: "3px 8px", borderRadius: 20, fontFamily: font,
            }}>{item}</span>
          ))}
          {col.items.length > 4 && (
            <span style={{ fontSize: 10.5, color: "#9B7450", fontFamily: font, padding: "3px 0" }}>+{col.items.length - 4} more</span>
          )}
        </div>

        {isStretch && (
          <div style={{ fontSize: 11, color: "#7C3AED", fontFamily: font, fontStyle: "italic" }}>
            Slightly above your budget — but a great fit!
          </div>
        )}

        <FloatingGetBtn onClick={onGet} />
      </div>
    </div>
  );
}

// ── Baat Karo pre-fill helper ─────────────────────────────────────────────────
function openBaatKaro(navigate, message) {
  sessionStorage.setItem("baat_karo_draft", JSON.stringify({ message }));
  navigate("/baat-karo");
}

// ════════════════════════════════════════════════════════════════════════════
// HOME VIEW
// ════════════════════════════════════════════════════════════════════════════
function HomeView({ setView, setBulk }) {
  return (
    <div style={{ padding: "0 16px 48px", maxWidth: 560, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
        <div style={{ fontSize: 38 }}>🎁</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: DARK, margin: "8px 0 6px", fontFamily: font }}>Gift Something Special</h1>
        <p style={{ fontSize: 14, color: "#9B7450", fontFamily: font, margin: 0, lineHeight: 1.6 }}>
          Real gift hampers · Curated by us · Fulfilled by local vendors<br />
          No in-house stock — vendor confirms price in 2–4 hrs
        </p>
      </div>

      {/* 3 main flows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <FlowCard
          emoji="🤖" label="AI Creates My Gift"
          sub="Tell us who & why — we suggest the perfect hamper"
          badge="Smart Pick"
          badgeColor="#7C3AED"
          onClick={() => setView("ai")}
        />

        <FlowCard
          emoji="🛍️" label="Browse Collections"
          sub="12+ curated hampers for every occasion"
          onClick={() => setView("collections")}
        />

        <FlowCard
          emoji="🎨" label="Build From Scratch"
          sub="Pick items one by one and we'll box it beautifully"
          onClick={() => setView("builder")}
        />
      </div>

      {/* Bulk divider */}
      <div style={{ margin: "28px 0 0" }}>
        <div style={{
          background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 16,
          padding: "20px 20px", cursor: "pointer",
        }} onClick={() => { setBulk(true); setView("collections"); }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#CCAB4A", fontFamily: font, marginBottom: 4 }}>
            📦 Bulk Return Gifts (50+ pieces)
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", fontFamily: font, lineHeight: 1.5 }}>
            Wedding favors · Diwali corporate gifts · Birthday party returns<br />
            Starting ₹100/pc · Minimum 30 pieces
          </div>
          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: GOLD, fontFamily: font }}>
            Browse bulk options →
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: DARK, fontFamily: font, marginBottom: 12 }}>How it works</div>
        {[
          ["✦", "Pick a hamper or build your own"],
          ["✦", "We send the brief to vendors in your area"],
          ["✦", "Vendor confirms price & availability in 2–4 hrs"],
          ["✦", "You confirm → they deliver on your date"],
        ].map(([icon, text], i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
            <div style={{ color: GOLD, fontSize: 14, fontWeight: 900, marginTop: 1 }}>{icon}</div>
            <div style={{ fontSize: 13, color: "#5A3A1A", fontFamily: font }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowCard({ emoji, label, sub, badge, badgeColor, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 18, padding: "20px 18px",
      boxShadow: "0 2px 16px rgba(44,26,14,0.08)", border: "1.5px solid rgba(196,122,46,0.14)",
      cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
      transition: "box-shadow 0.15s",
    }}>
      <div style={{ fontSize: 34, flexShrink: 0 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: DARK, fontFamily: font }}>{label}</div>
          {badge && (
            <span style={{ fontSize: 9, fontWeight: 800, background: badgeColor, color: "#fff", padding: "2px 8px", borderRadius: 20, fontFamily: font }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: "#9B7450", fontFamily: font, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ color: GOLD, fontSize: 18, fontWeight: 900 }}>›</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AI FLOW VIEW
// ════════════════════════════════════════════════════════════════════════════
function AIView({ setView, navigate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ occasion: "", recipient: "", interests: [], budget: 2000 });
  const [results, setResults] = useState(null);

  const toggleInterest = (id) =>
    setForm(f => ({
      ...f,
      interests: f.interests.includes(id) ? f.interests.filter(x => x !== id) : [...f.interests, id],
    }));

  const handleSuggest = () => {
    const r = suggestHampers(form.occasion, form.recipient, form.interests, form.budget);
    setResults(r);
    setStep("results");
  };

  const budgetPresets = [
    { label: "Under ₹1,000", val: 900 },
    { label: "₹1,000–₹2,500", val: 1800 },
    { label: "₹2,500–₹5,000", val: 3500 },
    { label: "₹5,000+", val: 7000 },
  ];

  const stepConfig = { 1: 4, 2: 4, 3: 4, 4: 4 };
  const progress = step === "results" ? 100 : (step / 4) * 100;

  const canNext = step === 1 ? !!form.occasion : step === 2 ? !!form.recipient : step === 3 ? true : true;

  if (step === "results") {
    return (
      <div style={{ padding: "0 16px 48px", maxWidth: 560, margin: "0 auto" }}>
        <BackBtn onClick={() => setStep(4)} />
        <div style={{ marginBottom: 20, marginTop: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: DARK, fontFamily: font }}>
            🤖 AI's Top Picks For You
          </div>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginTop: 4 }}>
            Based on: {OCCASIONS.find(o => o.id === form.occasion)?.label} ·
            Budget {fmt(form.budget)} · {form.interests.length ? form.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ") : "General"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {results?.map((col, i) => (
            <CollectionCard key={col.id} col={col} isStretch={col.isStretch} onGet={() => {
              const items = col.items.join(", ");
              openBaatKaro(navigate, `Hi! I'd like to order a "${col.name}" hamper.\n\nOccasion: ${OCCASIONS.find(o => o.id === form.occasion)?.label}\nBudget: ~${fmt(form.budget)}\n\nItems I have in mind: ${items}\n\nCan you confirm price and availability?`);
            }} />
          ))}
        </div>

        <div style={{ marginTop: 24, padding: 16, background: "rgba(196,122,46,0.06)", borderRadius: 14, border: "1px solid rgba(196,122,46,0.18)" }}>
          <div style={{ fontSize: 12.5, color: "#7A5020", fontFamily: font, lineHeight: 1.6 }}>
            <strong>Not quite right?</strong> Tap any hamper to chat with us and customise items, add a personal note, or adjust the budget.
          </div>
        </div>

        <button onClick={() => setView("builder")} style={{
          width: "100%", marginTop: 16, padding: "13px", borderRadius: 14,
          border: "1.5px solid rgba(196,122,46,0.4)", background: "transparent",
          color: GOLD, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font,
        }}>🎨 Prefer to build it yourself?</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 48px", maxWidth: 560, margin: "0 auto" }}>
      <BackBtn onClick={() => step > 1 ? setStep(s => s - 1) : setView("home")} />

      {/* Progress */}
      <div style={{ margin: "12px 0 24px", display: "flex", gap: 6 }}>
        {[1, 2, 3, 4].map(n => (
          <div key={n} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: n <= step ? "linear-gradient(90deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.15)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>

      {step === 1 && (
        <>
          <div style={{ fontSize: 19, fontWeight: 800, color: DARK, fontFamily: font, marginBottom: 6 }}>What's the occasion?</div>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginBottom: 18 }}>We'll match hampers made for this moment</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {OCCASIONS.map(o => (
              <Chip key={o.id} label={o.label} active={form.occasion === o.id}
                onClick={() => setForm(f => ({ ...f, occasion: o.id }))} />
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontSize: 19, fontWeight: 800, color: DARK, fontFamily: font, marginBottom: 6 }}>Who's it for?</div>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginBottom: 18 }}>Helps us tailor the pick</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {RECIPIENTS.map(r => (
              <Chip key={r.id} label={r.label} active={form.recipient === r.id}
                onClick={() => setForm(f => ({ ...f, recipient: r.id }))} />
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div style={{ fontSize: 19, fontWeight: 800, color: DARK, fontFamily: font, marginBottom: 6 }}>What are their interests?</div>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginBottom: 18 }}>Pick all that apply (or skip)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {INTERESTS.map(i => (
              <Chip key={i.id} label={i.label} active={form.interests.includes(i.id)}
                onClick={() => toggleInterest(i.id)} />
            ))}
          </div>
          {form.interests.length > 0 && (
            <button onClick={() => setForm(f => ({ ...f, interests: [] }))}
              style={{ marginTop: 12, fontSize: 12, color: "#9B7450", background: "none", border: "none", cursor: "pointer", fontFamily: font }}>
              Clear selection
            </button>
          )}
        </>
      )}

      {step === 4 && (
        <>
          <div style={{ fontSize: 19, fontWeight: 800, color: DARK, fontFamily: font, marginBottom: 6 }}>What's your budget?</div>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginBottom: 20 }}>Approximate is fine — vendor confirms the exact price</div>

          {/* Budget display */}
          <div style={{
            textAlign: "center", padding: "18px 0 12px",
            background: "linear-gradient(135deg,rgba(196,122,46,0.08),rgba(204,171,74,0.06))",
            borderRadius: 14, marginBottom: 18,
          }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: GOLD, fontFamily: font }}>{fmt(form.budget)}</div>
            <div style={{ fontSize: 12, color: "#9B7450", fontFamily: font, marginTop: 2 }}>approximate budget</div>
          </div>

          <input type="range" min={500} max={10000} step={100} value={form.budget}
            onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
            style={{ width: "100%", accentColor: GOLD, marginBottom: 16, cursor: "pointer" }} />

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: "#9B7450", fontFamily: font }}>₹500</span>
            <span style={{ fontSize: 11, color: "#9B7450", fontFamily: font }}>₹10,000</span>
          </div>

          {/* Quick presets */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ label: "Under ₹1K", val: 900 }, { label: "₹1–₂.5K", val: 1800 }, { label: "₹2.5–5K", val: 3500 }, { label: "₹5K+", val: 7000 }].map(p => (
              <Chip key={p.val} label={p.label} active={Math.abs(form.budget - p.val) < 300}
                onClick={() => setForm(f => ({ ...f, budget: p.val }))} />
            ))}
          </div>
        </>
      )}

      {/* Next button */}
      <div style={{ marginTop: 28 }}>
        {step < 4 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
            style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: canNext ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.2)",
              color: canNext ? "#fff" : "#9B7450", fontSize: 15, fontWeight: 800,
              cursor: canNext ? "pointer" : "not-allowed", fontFamily: font,
            }}>
            {step === 3 ? (form.interests.length === 0 ? "Skip →" : "Next →") : "Next →"}
          </button>
        ) : (
          <button onClick={handleSuggest} style={{
            width: "100%", padding: "14px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff",
            fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font,
            boxShadow: "0 4px 18px rgba(196,122,46,0.35)",
          }}>
            🤖 Show My Suggestions →
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COLLECTIONS VIEW (single + bulk)
// ════════════════════════════════════════════════════════════════════════════
function CollectionsView({ setView, navigate, isBulk, setBulk }) {
  const [filter, setFilter] = useState("all");

  const occasionFilters = [
    { id: "all", label: "All" },
    { id: "birthday", label: "🎂 Birthday" },
    { id: "anniversary", label: "💍 Anniversary" },
    { id: "corporate", label: "💼 Corporate" },
    { id: "festival", label: "🪔 Festival" },
    { id: "housewarming", label: "🏠 Housewarming" },
    { id: "wellness", label: "🧘 Wellness" },
    { id: "farewell", label: "✈️ Farewell" },
    { id: "thank_you", label: "🙏 Thank You" },
    { id: "just_because", label: "💛 Just Because" },
  ];

  const filtered = COLLECTIONS.filter(c =>
    filter === "all"
      ? true
      : c.filterTags.includes(filter) || c.interestTags.includes(filter)
  );

  const handleGet = (col) => {
    openBaatKaro(navigate, `Hi! I'm interested in the "${col.name}" gift hamper.\n\nItems: ${col.items.join(", ")}\nBudget range: ${fmt(col.priceRange[0])} – ${fmt(col.priceRange[1])}\n\nCan you confirm price and availability for delivery?`);
  };

  const handleBulkGet = (col) => {
    openBaatKaro(navigate, `Hi! I'm interested in bulk return gifts — "${col.name}".\n\nItems: ${col.items.join(", ")}\nPrice per piece: ${fmt(col.pricePerUnit[0])} – ${fmt(col.pricePerUnit[1])}\n\nPlease confirm minimum quantity, customization options, and delivery timeline.`);
  };

  return (
    <div style={{ padding: "0 0 48px" }}>
      {/* Toggle: Single vs Bulk */}
      <div style={{ padding: "0 16px 16px", maxWidth: 560, margin: "0 auto" }}>
        <BackBtn onClick={() => setView("home")} />
        <div style={{ display: "flex", gap: 0, marginTop: 14, background: "rgba(196,122,46,0.08)", borderRadius: 14, padding: 4 }}>
          {[
            { label: "🎁 Single Hamper", val: false },
            { label: "📦 Bulk Return Gifts", val: true },
          ].map(t => (
            <button key={String(t.val)} onClick={() => setBulk(t.val)} style={{
              flex: 1, padding: "10px", borderRadius: 11, border: "none",
              background: isBulk === t.val ? "#fff" : "transparent",
              color: isBulk === t.val ? DARK : "#9B7450",
              fontSize: 13, fontWeight: isBulk === t.val ? 800 : 500, cursor: "pointer",
              fontFamily: font, boxShadow: isBulk === t.val ? "0 2px 8px rgba(44,26,14,0.1)" : "none",
              transition: "all 0.18s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {!isBulk ? (
        <>
          {/* Occasion filter chips */}
          <div style={{ overflowX: "auto", padding: "4px 16px 16px", display: "flex", gap: 8, scrollbarWidth: "none" }}>
            {occasionFilters.map(f => (
              <Chip key={f.id} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} style={{ flexShrink: 0 }} />
            ))}
          </div>

          {/* Grid */}
          <div style={{ padding: "0 16px", maxWidth: 560, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {filtered.map(col => (
              <CollectionCard key={col.id} col={col} onGet={() => handleGet(col)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#9B7450", fontFamily: font, fontSize: 14 }}>
              No hampers found for this filter. Try "All"!
            </div>
          )}
        </>
      ) : (
        /* Bulk collections */
        <div style={{ padding: "0 16px", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginBottom: 4 }}>
            Minimum 30–50 pieces per order · Customizable labels · Pan-India delivery
          </div>
          {BULK_COLLECTIONS.map(col => (
            <BulkCard key={col.id} col={col} onGet={() => handleBulkGet(col)} />
          ))}
        </div>
      )}
    </div>
  );
}

function BulkCard({ col, onGet }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={{
      background: "#fff", borderRadius: 18, overflow: "hidden",
      boxShadow: "0 2px 16px rgba(44,26,14,0.09)", border: "1.5px solid rgba(196,122,46,0.12)",
      display: "flex", gap: 0,
    }}>
      <div style={{ width: 100, flexShrink: 0, background: "#f5ede0", overflow: "hidden" }}>
        {!imgErr
          ? <img src={col.photo} alt={col.name} onError={() => setImgErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 36 }}>{col.emoji}</div>
        }
      </div>
      <div style={{ padding: "14px 16px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: DARK, fontFamily: font }}>{col.name}</div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, fontFamily: font }}>{fmt(col.pricePerUnit[0])}–{fmt(col.pricePerUnit[1])}/pc</div>
            <div style={{ fontSize: 10, color: "#9B7450", fontFamily: font }}>min {col.minQty} pcs</div>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: "#9B7450", fontFamily: font, margin: "4px 0 8px" }}>{col.tagline}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
          {col.items.map((item, i) => (
            <span key={i} style={{ fontSize: 10, background: "rgba(196,122,46,0.09)", color: "#7A5020", padding: "2px 7px", borderRadius: 20, fontFamily: font }}>
              {item}
            </span>
          ))}
        </div>
        <button onClick={onGet} style={{
          padding: "9px 16px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff",
          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font,
        }}>Get a Quote →</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BUILDER VIEW — Build From Scratch
// ════════════════════════════════════════════════════════════════════════════
function BuilderView({ setView, navigate }) {
  const [activeCat, setActiveCat] = useState("chocolate");
  const [box, setBox] = useState([]); // [{...item, qty}]

  const catItems = CATALOG_ITEMS.filter(i => i.cat === activeCat);

  const addItem = (item) => {
    setBox(b => {
      const existing = b.find(x => x.id === item.id);
      if (existing) return b.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x);
      return [...b, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    setBox(b => {
      const existing = b.find(x => x.id === id);
      if (!existing || existing.qty <= 1) return b.filter(x => x.id !== id);
      return b.map(x => x.id === id ? { ...x, qty: x.qty - 1 } : x);
    });
  };

  const totalMin = box.reduce((sum, x) => sum + x.price[0] * x.qty, 0);
  const totalMax = box.reduce((sum, x) => sum + x.price[1] * x.qty, 0);

  const handleQuote = () => {
    if (!box.length) return;
    const itemLines = box.map(x => `• ${x.name}${x.qty > 1 ? ` (×${x.qty})` : ""}`).join("\n");
    openBaatKaro(navigate, `Hi! I'd like a custom gift hamper with the following items:\n\n${itemLines}\n\nEstimated budget: ${fmt(totalMin)} – ${fmt(totalMax)}\n\nCan you confirm the price and packaging options?`);
  };

  const getQtyInBox = (id) => box.find(x => x.id === id)?.qty || 0;

  return (
    <div style={{ padding: "0 0 120px" }}>
      <div style={{ padding: "0 16px", maxWidth: 560, margin: "0 auto 12px" }}>
        <BackBtn onClick={() => setView("home")} />
        <div style={{ fontSize: 20, fontWeight: 900, color: DARK, fontFamily: font, marginTop: 10 }}>🎨 Build Your Hamper</div>
        <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginTop: 4 }}>Pick items, we box them beautifully</div>
      </div>

      {/* Category tabs */}
      <div style={{ overflowX: "auto", padding: "4px 16px 14px", display: "flex", gap: 8, scrollbarWidth: "none" }}>
        {CATALOG_CATS.map(c => (
          <Chip key={c.id} label={c.label} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} style={{ flexShrink: 0 }} />
        ))}
      </div>

      {/* Item grid */}
      <div style={{ padding: "0 16px", maxWidth: 560, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {catItems.map(item => {
          const qty = getQtyInBox(item.id);
          return (
            <div key={item.id} style={{
              background: "#fff", borderRadius: 14, padding: "14px 12px",
              boxShadow: "0 2px 12px rgba(44,26,14,0.07)", border: `1.5px solid ${qty > 0 ? GOLD : "rgba(196,122,46,0.12)"}`,
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ fontSize: 26 }}>{item.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: DARK, fontFamily: font, lineHeight: 1.3 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: GOLD, fontFamily: font, fontWeight: 700 }}>
                {fmt(item.price[0])} – {fmt(item.price[1])}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                {qty > 0 ? (
                  <>
                    <button onClick={() => removeItem(item.id)} style={{
                      width: 28, height: 28, borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.35)",
                      background: "#fff", color: GOLD, fontSize: 16, cursor: "pointer", fontFamily: font, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>−</button>
                    <span style={{ fontSize: 14, fontWeight: 800, color: DARK, fontFamily: font, minWidth: 16, textAlign: "center" }}>{qty}</span>
                    <button onClick={() => addItem(item)} style={{
                      width: 28, height: 28, borderRadius: 8, border: "none",
                      background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff",
                      fontSize: 16, cursor: "pointer", fontFamily: font, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                  </>
                ) : (
                  <button onClick={() => addItem(item)} style={{
                    width: "100%", padding: "7px 0", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.35)",
                    background: "#fff", color: GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font,
                  }}>+ Add</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky box summary */}
      {box.length > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff",
          borderTop: "1.5px solid rgba(196,122,46,0.2)", padding: "14px 20px",
          boxShadow: "0 -4px 24px rgba(44,26,14,0.12)", zIndex: 100,
        }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: "#9B7450", fontFamily: font }}>
                  {box.reduce((s, x) => s + x.qty, 0)} item{box.reduce((s, x) => s + x.qty, 0) !== 1 ? "s" : ""} in your box
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: DARK, fontFamily: font }}>
                  {fmt(totalMin)} – {fmt(totalMax)}
                </div>
              </div>
              <button onClick={() => setBox([])} style={{
                fontSize: 11, color: "#9B7450", background: "none", border: "1px solid rgba(155,116,80,0.3)",
                padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontFamily: font,
              }}>Clear</button>
            </div>

            {/* Box preview scrollable */}
            <div style={{ overflowX: "auto", display: "flex", gap: 6, marginBottom: 12, scrollbarWidth: "none" }}>
              {box.map(x => (
                <div key={x.id} style={{
                  flexShrink: 0, background: "rgba(196,122,46,0.08)", borderRadius: 8,
                  padding: "4px 10px", fontSize: 11, color: "#7A5020", fontFamily: font, fontWeight: 600,
                }}>
                  {x.emoji} {x.name.split("(")[0].trim().slice(0, 20)}{x.qty > 1 ? ` ×${x.qty}` : ""}
                </div>
              ))}
            </div>

            <button onClick={handleQuote} style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff",
              fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font,
              boxShadow: "0 4px 18px rgba(196,122,46,0.35)",
            }}>Request Quote for This Box →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function GiftingHub() {
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [isBulk, setIsBulk] = useState(false);

  const handleSetView = useCallback((v) => setView(v), []);

  return (
    <div style={{ minHeight: "100dvh", background: CREAM, fontFamily: font }}>
      <SEO
        title="Gift Hampers — Tendr"
        description="Curated gift hampers for every occasion. AI-powered suggestions, browse collections, or build your own. Local vendors, real products."
        path="/gifting"
      />
      <HamburgerNav />

      {/* View header bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.12)",
        padding: "16px 20px 14px", position: "sticky", top: 0, zIndex: 90,
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: DARK, fontFamily: font }}>
            {view === "home" && "🎁 Gifting"}
            {view === "ai" && "🤖 AI Gift Suggester"}
            {view === "collections" && (isBulk ? "📦 Bulk Return Gifts" : "🛍️ Browse Collections")}
            {view === "builder" && "🎨 Build From Scratch"}
          </div>
          {view !== "home" && (
            <button onClick={() => setView("home")} style={{
              marginLeft: "auto", fontSize: 11, color: "#9B7450", background: "none",
              border: "1px solid rgba(155,116,80,0.3)", padding: "4px 10px",
              borderRadius: 8, cursor: "pointer", fontFamily: font,
            }}>Home</button>
          )}
        </div>
      </div>

      {/* Views */}
      <div>
        {view === "home" && <HomeView setView={handleSetView} setBulk={setIsBulk} />}
        {view === "ai" && <AIView setView={handleSetView} navigate={navigate} />}
        {view === "collections" && (
          <CollectionsView
            setView={handleSetView} navigate={navigate}
            isBulk={isBulk} setBulk={setIsBulk}
          />
        )}
        {view === "builder" && <BuilderView setView={handleSetView} navigate={navigate} />}
      </div>

      <Footer />
    </div>
  );
}

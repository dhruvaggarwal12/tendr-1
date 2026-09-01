import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import { CATALOG_ITEMS, CATALOG_CATS } from "../../data/giftingData";

const FONT  = "'Outfit', sans-serif";
const GOLD  = "#C47A2E";
const INK   = "#1C0E04";
const CREAM = "#FFF8EC";
const fmt   = (n) => `₹${n.toLocaleString("en-IN")}`;

const CHIP_BG = { coffee:"#FEF3C7", tea:"#DCFCE7", chocolate:"#FEE2E2", skincare:"#FCE7F3", candles:"#EDE9FE", wellness:"#DBEAFE", books:"#FEF9E7", stationery:"#F5F3FF", home:"#FEFCE8", plants:"#D1FAE5", snacks:"#FFF3E0", packaging:"#F1F5F9" };
const CHIP_AC = { coffee:"#D97706", tea:"#16A34A", chocolate:"#DC2626", skincare:"#DB2777", candles:"#7C3AED", wellness:"#2563EB", books:"#92400E", stationery:"#5B21B6", home:"#CA8A04", plants:"#059669", snacks:"#B45309", packaging:"#64748B" };

// ── BASES ──────────────────────────────────────────────────────────────────────
const BASES = [
  {
    id: "tokri", name: "Tokri", sub: "Wicker Basket",
    hint: "Traditional & charming — the most loved choice",
    palette: { body: "#B8894E", bg: "#FEF6E4", rimBg: "#C8A060" },
    zone: { top: "43%", left: "13%", width: "74%", height: "44%" },
  },
  {
    id: "kraft", name: "Kraft Box", sub: "Eco Gift Box",
    hint: "Minimal & sustainable — for the thoughtful gifter",
    palette: { body: "#8B6540", bg: "#F5EDE0", rimBg: "#9B7450" },
    zone: { top: "44%", left: "18%", width: "64%", height: "42%" },
  },
  {
    id: "luxury", name: "Luxury Box", sub: "Premium Gift Box",
    hint: "Gold ribbon, white gloss — the grand statement",
    palette: { body: "#C47A2E", bg: "#F8F4EE", rimBg: "#CCAB4A" },
    zone: { top: "51%", left: "20%", width: "60%", height: "36%" },
  },
  {
    id: "tote", name: "Jute Tote", sub: "Carry-Home Bag",
    hint: "Natural jute with cloth handles — casual & reusable",
    palette: { body: "#7A6245", bg: "#F0EAD8", rimBg: "#8B7355" },
    zone: { top: "48%", left: "21%", width: "58%", height: "39%" },
  },
];

// ── SVGs ───────────────────────────────────────────────────────────────────────
function TokriSVG({ color = "#B8894E", rimColor = "#C8A060" }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ display: "block" }}>
      <path d="M28 72 Q18 160 100 174 Q182 160 172 72 Z" fill={color} opacity="0.11"/>
      <path d="M28 72 Q18 160 100 174 Q182 160 172 72" stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <ellipse cx="100" cy="72" rx="72" ry="19" fill={rimColor} opacity="0.22"/>
      <ellipse cx="100" cy="72" rx="72" ry="19" stroke={color} strokeWidth="2.2" fill="none"/>
      {[93,109,124,138,152,165].map((y, i) => (
        <path key={i} d={`M${30+i} ${y} Q100 ${y + (i % 2 ? 7 : -5) + 4} ${170-i} ${y}`}
          stroke={color} strokeWidth="1.6" fill="none" opacity="0.5"/>
      ))}
      {[50, 66, 82, 100, 118, 134, 150].map((x, i) => (
        <line key={i} x1={x} y1="77" x2={x + (x < 100 ? -5 : 5)} y2="170"
          stroke={color} strokeWidth="0.9" opacity="0.26"/>
      ))}
      <path d="M44 67 Q30 26 62 20 Q82 16 82 52" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M156 67 Q170 26 138 20 Q118 16 118 52" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function KraftBoxSVG({ color = "#8B6540" }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ display: "block" }}>
      <rect x="26" y="82" width="148" height="100" rx="4" fill={color} opacity="0.11"/>
      <rect x="26" y="82" width="148" height="100" rx="4" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M26 82 L26 52 Q26 47 30 45 L100 60 L170 45 Q174 47 174 52 L174 82"
        fill={color} opacity="0.2" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <line x1="100" y1="60" x2="100" y2="82" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      {[97,110,123,136,149,162,175].map((y, i) => (
        <line key={i} x1="31" y1={y} x2="169" y2={y} stroke={color} strokeWidth="0.8" opacity="0.16"/>
      ))}
      <line x1="100" y1="82" x2="100" y2="182" stroke="#B89B50" strokeWidth="2.4" opacity="0.55"/>
      <line x1="26" y1="132" x2="174" y2="132" stroke="#B89B50" strokeWidth="2.4" opacity="0.55"/>
      <circle cx="100" cy="132" r="5" fill="#B89B50" opacity="0.75"/>
    </svg>
  );
}

function LuxuryBoxSVG({ color = "#C47A2E" }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ display: "block" }}>
      <rect x="20" y="92" width="160" height="90" rx="8" fill="#FDF9F3" opacity="0.85"/>
      <rect x="20" y="92" width="160" height="90" rx="8" stroke={color} strokeWidth="2.2" fill="none"/>
      <rect x="14" y="68" width="172" height="30" rx="7" fill={color} opacity="0.2"/>
      <rect x="14" y="68" width="172" height="30" rx="7" stroke={color} strokeWidth="2" fill="none"/>
      <rect x="92" y="68" width="16" height="114" rx="4" fill={color} opacity="0.24"/>
      <rect x="20" y="100" width="160" height="13" rx="3" fill={color} opacity="0.2"/>
      <path d="M100 68 Q70 44 73 27 Q76 12 91 25 Q100 68 100 68" fill={color} opacity="0.52"/>
      <path d="M100 68 Q130 44 127 27 Q124 12 109 25 Q100 68 100 68" fill={color} opacity="0.52"/>
      <circle cx="100" cy="68" r="8" fill={color}/>
      <path d="M100 68 Q86 82 78 98" stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M100 68 Q114 82 122 98" stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function JuteToteSVG({ color = "#7A6245" }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ display: "block" }}>
      <path d="M44 84 L36 178 Q36 184 44 184 L156 184 Q164 184 164 178 L156 84 Z" fill={color} opacity="0.12"/>
      <path d="M44 84 L36 178 Q36 184 44 184 L156 184 Q164 184 164 178 L156 84 Z"
        stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <line x1="44" y1="84" x2="156" y2="84" stroke={color} strokeWidth="2.2" opacity="0.8"/>
      {[100,116,132,148,164,180].map((y, i) => (
        <line key={i} x1="38" y1={y} x2="162" y2={y} stroke={color} strokeWidth="0.8" opacity="0.26"/>
      ))}
      {[60,80,100,120,140].map((x, i) => (
        <line key={i} x1={x} y1="86" x2={x + (x < 100 ? -5 : 5)} y2="182"
          stroke={color} strokeWidth="0.8" opacity="0.2"/>
      ))}
      <path d="M64 84 Q50 38 70 26 Q88 18 88 58" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M136 84 Q150 38 130 26 Q112 18 112 58" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M64 82 Q52 40 72 28 Q88 22 88 58" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.32" strokeDasharray="4 4"/>
      <path d="M136 82 Q148 40 128 28 Q112 22 112 58" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.32" strokeDasharray="4 4"/>
    </svg>
  );
}

const SVG_MAP = { tokri: TokriSVG, kraft: KraftBoxSVG, luxury: LuxuryBoxSVG, tote: JuteToteSVG };

// ── STEP 1 – BASE CAROUSEL ─────────────────────────────────────────────────────
function BaseStep({ onSelect }) {
  const [centeredIdx, setCenteredIdx] = useState(0);
  const scrollRef = useRef(null);
  const CARD_W = 200;
  const GAP    = 18;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    const idx = Math.round((center - CARD_W / 2) / (CARD_W + GAP));
    setCenteredIdx(Math.max(0, Math.min(BASES.length - 1, idx)));
  }, []);

  const scrollTo = (i) => {
    scrollRef.current?.scrollTo({ left: i * (CARD_W + GAP), behavior: "smooth" });
    setCenteredIdx(i);
  };

  const base = BASES[centeredIdx];

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingTop: 64, background: CREAM, fontFamily: FONT }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42 }}
        style={{ textAlign: "center", padding: "32px 24px 20px" }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10 }}>
          Build Your Hamper · Step 1
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.9rem, 5.5vw, 2.8rem)", fontWeight: 600, color: INK, margin: 0, lineHeight: 1.08 }}>
          Choose your base
        </h1>
        <p style={{ fontSize: 13.5, color: "#9B7450", margin: "10px 0 0", lineHeight: 1.6 }}>
          Slide to browse · the centred one is your pick
        </p>
      </motion.div>

      {/* Scroll carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1, display: "flex", gap: GAP, overflowX: "auto",
          scrollSnapType: "x mandatory", scrollbarWidth: "none",
          padding: `16px calc(50vw - ${CARD_W / 2}px) 24px`,
          alignItems: "center",
        }}
      >
        <style>{`[data-base-scroll]::-webkit-scrollbar{display:none}`}</style>
        {BASES.map((b, i) => {
          const Svg = SVG_MAP[b.id];
          const active = centeredIdx === i;
          return (
            <motion.button
              key={b.id}
              data-base-scroll
              animate={{ scale: active ? 1 : 0.82, opacity: active ? 1 : 0.46 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={() => scrollTo(i)}
              style={{
                flexShrink: 0, width: CARD_W, scrollSnapAlign: "center",
                background: "#fff", borderRadius: 28,
                border: `2.5px solid ${active ? GOLD : "rgba(196,122,46,0.12)"}`,
                boxShadow: active ? "0 14px 44px rgba(196,122,46,0.24)" : "0 2px 12px rgba(28,14,4,0.06)",
                cursor: "pointer", padding: "26px 20px 22px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                transition: "border-color 0.25s, box-shadow 0.25s",
              }}
            >
              {/* SVG visual */}
              <div style={{
                width: 156, height: 156, borderRadius: 20,
                background: b.palette.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 14, boxSizing: "border-box",
              }}>
                <Svg color={b.palette.body} rimColor={b.palette.rimBg} />
              </div>
              {/* Labels */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: INK, marginBottom: 3 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: "#9B7450" }}>{b.sub}</div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Hint + CTA */}
      <div style={{ padding: "0 24px", paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))", maxWidth: 480, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={base.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28 }}
            style={{ textAlign: "center", fontSize: 13, color: "#9B7450", marginBottom: 18, lineHeight: 1.6 }}
          >
            {base.hint}
          </motion.p>
        </AnimatePresence>

        {/* Dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
          {BASES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              style={{
                width: centeredIdx === i ? 22 : 7,
                height: 7, borderRadius: 100,
                background: centeredIdx === i ? GOLD : "rgba(196,122,46,0.25)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(BASES[centeredIdx])}
          style={{
            width: "100%", padding: "16px", borderRadius: 18, border: "none",
            background: `linear-gradient(135deg, ${GOLD}, #D4A848)`,
            color: "#fff", fontSize: 15, fontWeight: 800,
            cursor: "pointer", fontFamily: FONT,
            boxShadow: "0 8px 28px rgba(196,122,46,0.38)",
          }}
        >
          Fill this {base.name} →
        </motion.button>
      </div>
    </div>
  );
}

// ── STEP 2 – FILL THE HAMPER ────────────────────────────────────────────────────
function FillStep({ base, placedItems, activeCategory, setActiveCategory, addItem, removeItem, justAdded, total, onBack, onDone }) {
  const Svg = SVG_MAP[base.id];
  const basketRef = useRef(null);

  const catItems = activeCategory === "all"
    ? CATALOG_ITEMS.filter(i => i.cat !== "packaging")
    : CATALOG_ITEMS.filter(i => i.cat === activeCategory);

  // Grid positions for 46px product cards (3-col grid, % relative to drop zone)
  const chipPos = useCallback((idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    return { left: `${2 + col * 33}%`, top: `${2 + row * 51}%` };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", fontFamily: FONT, background: "#F7F3ED", paddingTop: 64, overflow: "hidden" }}>

      {/* Top nav strip */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 18px 10px",
        background: CREAM, borderBottom: "1px solid rgba(196,122,46,0.1)",
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: GOLD, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT, padding: 0 }}>
          ← Base
        </button>
        <div style={{ fontSize: 12, color: "#9B7450", fontWeight: 600 }}>
          {base.name} · {placedItems.length} item{placedItems.length !== 1 ? "s" : ""}
        </div>
        <AnimatePresence>
          {placedItems.length > 0 ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDone}
              style={{
                background: GOLD, color: "#fff", border: "none",
                borderRadius: 10, padding: "7px 14px",
                fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: FONT,
              }}
            >
              Done →
            </motion.button>
          ) : (
            <div style={{ width: 58 }} />
          )}
        </AnimatePresence>
      </div>

      {/* Basket canvas */}
      <div style={{
        flexShrink: 0, background: base.palette.bg,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: 14, paddingBottom: 14, position: "relative", minHeight: 268,
      }}>
        {/* SVG + draggable zone layered */}
        <div style={{ position: "relative", width: 240, height: 240 }}>
          <Svg color={base.palette.body} rimColor={base.palette.rimBg} />

          {/* Drop zone (inner basket area) */}
          <div
            ref={basketRef}
            style={{
              position: "absolute",
              top: base.zone.top, left: base.zone.left,
              width: base.zone.width, height: base.zone.height,
              overflow: "hidden",
            }}
          >
            {/* Empty hint */}
            {placedItems.length === 0 && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 10, color: "rgba(120,80,30,0.45)", fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>
                  Tap below<br />to add items
                </span>
              </div>
            )}

            {/* Draggable product cards */}
            <AnimatePresence>
              {placedItems.slice(0, 9).map((item, idx) => {
                const pos = chipPos(idx);
                const bg  = CHIP_BG[item.cat]  || "#FEF3C7";
                const ac  = CHIP_AC[item.cat]  || "#D97706";
                return (
                  <motion.div
                    key={item.key}
                    drag
                    dragConstraints={basketRef}
                    dragElastic={0.04}
                    whileDrag={{ scale: 1.14, zIndex: 20, cursor: "grabbing" }}
                    initial={{ scale: 0, opacity: 0, y: 14, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ type: "spring", stiffness: 460, damping: 22 }}
                    style={{
                      position: "absolute",
                      left: pos.left, top: pos.top,
                      width: 46, height: 52,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      background: bg,
                      border: `1.5px solid ${ac}44`,
                      borderRadius: 9,
                      boxShadow: `0 3px 10px rgba(28,14,4,0.13), 0 1px 3px ${ac}22`,
                      cursor: "grab", userSelect: "none",
                      touchAction: "none", zIndex: 2,
                      gap: 2, padding: "4px 2px 3px",
                      overflow: "hidden",
                    }}
                  >
                    {/* × remove button — inside card top-right */}
                    <button
                      onClick={e => { e.stopPropagation(); removeItem(item.key); }}
                      onPointerDown={e => e.stopPropagation()}
                      style={{
                        position: "absolute", top: 2, right: 2,
                        width: 13, height: 13,
                        background: "rgba(255,255,255,0.88)", border: "none",
                        borderRadius: "50%", cursor: "pointer",
                        color: ac, fontSize: 9, fontWeight: 900,
                        lineHeight: 1, display: "flex", alignItems: "center",
                        justifyContent: "center", padding: 0, flexShrink: 0,
                      }}
                    >×</button>
                    {/* Product emoji — large, centered */}
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
                    {/* Product name */}
                    <span style={{
                      fontSize: 7.5, fontWeight: 700, color: ac,
                      fontFamily: FONT, width: "100%", textAlign: "center",
                      lineHeight: 1.15, padding: "0 3px",
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      {item.name.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Overflow badge */}
            {placedItems.length > 9 && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{
                  position: "absolute", bottom: "4%", right: "4%",
                  background: GOLD, color: "#fff", borderRadius: 100,
                  fontSize: 9, fontWeight: 800, padding: "3px 7px",
                }}
              >+{placedItems.length - 9}</motion.div>
            )}
          </div>
        </div>

        {/* Running total badge */}
        <AnimatePresence>
          {total.min > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                position: "absolute", bottom: 10, right: 16,
                background: "#fff", border: "1.5px solid rgba(196,122,46,0.22)",
                borderRadius: 12, padding: "4px 12px",
                fontSize: 11, fontWeight: 700, color: GOLD,
                boxShadow: "0 2px 10px rgba(196,122,46,0.14)",
              }}
            >
              ~{fmt(Math.round((total.min + total.max) / 2))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category tabs */}
      <div style={{
        flexShrink: 0, background: "#fff",
        borderBottom: "1px solid rgba(196,122,46,0.09)",
        display: "flex", gap: 6, padding: "8px 14px",
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        {[{ id: "all", label: "All" }, ...CATALOG_CATS.filter(c => c.id !== "packaging")].map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            style={{
              flexShrink: 0, padding: "6px 13px", borderRadius: 100,
              border: `1.5px solid ${activeCategory === c.id ? GOLD : "rgba(196,122,46,0.18)"}`,
              background: activeCategory === c.id ? GOLD : "#fff",
              color: activeCategory === c.id ? "#fff" : "#7A5535",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
              transition: "all 0.17s", whiteSpace: "nowrap",
            }}
          >{c.label}</button>
        ))}
      </div>

      {/* Item list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 24px" }}>
        {catItems.map(item => {
          const count = placedItems.filter(p => p.id === item.id).length;
          const isJust = justAdded === item.id;
          return (
            <motion.div
              key={item.id}
              animate={isJust ? { x: [0, -5, 5, -3, 0] } : {}}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 13px", marginBottom: 8,
                background: count > 0 ? "rgba(196,122,46,0.06)" : "#fff",
                borderRadius: 14,
                border: `1.5px solid ${count > 0 ? "rgba(196,122,46,0.3)" : "rgba(196,122,46,0.1)"}`,
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: INK, lineHeight: 1.3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, marginTop: 2 }}>
                  {fmt(item.price[0])}–{fmt(item.price[1])}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => addItem(item)}
                style={{
                  flexShrink: 0, minWidth: 44, height: 36, borderRadius: 12,
                  border: "none",
                  background: count > 0 ? `linear-gradient(135deg, ${GOLD}, #D4A848)` : "rgba(196,122,46,0.1)",
                  color: count > 0 ? "#fff" : GOLD,
                  fontSize: count > 0 ? 12 : 20, fontWeight: 800,
                  cursor: "pointer", fontFamily: FONT,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s", padding: "0 10px",
                }}
              >
                {count > 0 ? `×${count}` : "+"}
              </motion.button>
            </motion.div>
          );
        })}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

// ── STEP 3 – REVIEW ─────────────────────────────────────────────────────────────
function ReviewStep({ base, placedItems, total, onBack, onEnquire }) {
  const Svg = SVG_MAP[base.id];
  const deduplicated = Object.values(
    placedItems.reduce((acc, item) => {
      if (acc[item.id]) acc[item.id].qty += 1;
      else acc[item.id] = { ...item, qty: 1 };
      return acc;
    }, {})
  );

  return (
    <div style={{ minHeight: "100dvh", fontFamily: FONT, background: CREAM, paddingTop: 64 }}>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "28px 20px 100px", boxSizing: "border-box" }}>

        <button onClick={onBack} style={{ background: "none", border: "none", color: GOLD, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT, padding: "0 0 20px", display: "block" }}>
          ← Edit Hamper
        </button>

        {/* Basket preview card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: base.palette.bg, borderRadius: 24,
            border: `1.5px solid ${base.palette.body}30`,
            padding: "28px 20px 22px", textAlign: "center", marginBottom: 22,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}
        >
          <div style={{ width: 140, height: 140 }}>
            <Svg color={base.palette.body} rimColor={base.palette.rimBg} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>Your {base.name} Hamper</div>
          <div style={{ fontSize: 13, color: "#9B7450" }}>
            {placedItems.length} item{placedItems.length !== 1 ? "s" : ""} selected
          </div>
        </motion.div>

        {/* Item breakdown */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(196,122,46,0.13)", overflow: "hidden", marginBottom: 16 }}>
          {deduplicated.map((item, i) => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "13px 18px",
              borderBottom: i < deduplicated.length - 1 ? "1px solid rgba(196,122,46,0.08)" : "none",
            }}>
              <span style={{ fontSize: 22 }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{item.name}</div>
                <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, marginTop: 1 }}>
                  {fmt(item.price[0])}–{fmt(item.price[1])}
                  {item.qty > 1 && <span style={{ color: "#9B7450", fontWeight: 600 }}> × {item.qty}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total estimate */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid rgba(196,122,46,0.13)",
          padding: "15px 20px", marginBottom: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 13, color: "#9B7450", fontWeight: 600 }}>Estimated total</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: INK }}>
            {fmt(total.min)}–{fmt(total.max)}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onEnquire}
          style={{
            width: "100%", padding: "18px", borderRadius: 18, border: "none",
            background: `linear-gradient(135deg, ${GOLD}, #D4A848)`,
            color: "#fff", fontSize: 15, fontWeight: 800,
            cursor: "pointer", fontFamily: FONT,
            boxShadow: "0 10px 32px rgba(196,122,46,0.38)",
          }}
        >
          Enquire for this Hamper →
        </motion.button>
        <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#9B7450", lineHeight: 1.6 }}>
          A vendor confirms price &amp; packaging within 2–4 hrs
        </p>
      </div>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────────
export default function HamperBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState("base");
  const [selectedBase, setSelectedBase] = useState(null);
  const [placedItems, setPlacedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [justAdded, setJustAdded] = useState(null);

  const addItem = useCallback((item) => {
    if (placedItems.length >= 12) return;
    setJustAdded(item.id);
    setPlacedItems(prev => [...prev, { ...item, key: `${item.id}-${Date.now()}` }]);
    setTimeout(() => setJustAdded(null), 500);
  }, [placedItems.length]);

  const removeItem = useCallback((key) => {
    setPlacedItems(prev => prev.filter(i => i.key !== key));
  }, []);

  const totalMin = placedItems.reduce((s, i) => s + i.price[0], 0);
  const totalMax = placedItems.reduce((s, i) => s + i.price[1], 0);

  return (
    <>
      <HamburgerNav />
      {step === "base" && (
        <BaseStep onSelect={b => { setSelectedBase(b); setStep("fill"); }} />
      )}
      {step === "fill" && selectedBase && (
        <FillStep
          base={selectedBase}
          placedItems={placedItems}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          addItem={addItem}
          removeItem={removeItem}
          justAdded={justAdded}
          total={{ min: totalMin, max: totalMax }}
          onBack={() => setStep("base")}
          onDone={() => setStep("review")}
        />
      )}
      {step === "review" && selectedBase && (
        <ReviewStep
          base={selectedBase}
          placedItems={placedItems}
          total={{ min: totalMin, max: totalMax }}
          onBack={() => setStep("fill")}
          onEnquire={() => navigate("/gifting")}
        />
      )}
    </>
  );
}

import React from "react";

/* ─────────────────────────────────────────────────────────────────────────
   Invitation Studio — visual "kit" components.

   A kit draws ONLY the background + decorative/motif layer for a flyer —
   never text, never the logo (the engine owns both of those so every one
   of the 95 templates guarantees the same logo placement and text system).
   Each kit receives `{ palette }` (resolved color tokens, see
   invitationDesignTokens.js) and returns absolutely-positioned,
   pointer-events:none layers filling its parent.
   ───────────────────────────────────────────────────────────────────────── */

const Dots = ({ n, fill, seed = 1, rMin = 0.8, rMax = 2.2, oMin = 0.2, oMax = 0.5 }) =>
  Array.from({ length: n }, (_, i) => {
    const x = (i * seed * 37) % 100;
    const y = (i * seed * 53) % 100;
    const r = rMin + ((i * 7) % 10) / 10 * (rMax - rMin);
    const o = oMin + ((i * 3) % 10) / 10 * (oMax - oMin);
    return <circle key={i} cx={x} cy={y} r={r} fill={fill} opacity={o} />;
  });

const Layer = ({ children, style }) => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
    style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }}>
    {children}
  </svg>
);

/* 1 — Elegant Serif: cream ground, hairline double-rule frame, thin corner flourish. */
export function ElegantSerif({ palette: p }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: p.bg }} />
      <div style={{ position: "absolute", inset: 18, border: `1px solid ${p.accent}`, opacity: 0.35 }} />
      <Layer>
        {[["tl", 6, 6, 0], ["tr", 94, 6, 90], ["bl", 6, 94, -90], ["br", 94, 94, 180]].map(([k, x, y, rot]) => (
          <g key={k} transform={`translate(${x} ${y}) rotate(${rot})`}>
            <path d="M0 0 L0 7 M0 0 L7 0" stroke={p.accent} strokeWidth="0.35" opacity="0.7" />
            <circle r="0.5" fill={p.accent} opacity="0.7" />
          </g>
        ))}
      </Layer>
    </>
  );
}

/* 2 — Luxury Dark Gold: jewel-tone gradient, ornate corner motif, double frame. */
export function LuxuryDarkGold({ palette: p }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${p.bg} 0%, ${p.bg2} 55%, ${p.bg} 100%)` }} />
      <div style={{ position: "absolute", inset: 16, border: `1px solid ${p.accent}`, opacity: 0.5 }} />
      <div style={{ position: "absolute", inset: 22, border: `0.5px solid ${p.accent}`, opacity: 0.3 }} />
      <Layer>
        {[[6, 6, 1, 1], [94, 6, -1, 1], [6, 94, 1, -1], [94, 94, -1, -1]].map(([x, y, sx, sy], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
            <path d="M0 0 L0 10 Q0 3 10 0 Z" fill="none" stroke={p.accent} strokeWidth="0.3" opacity="0.7" />
            <circle r="0.6" fill={p.accent} opacity="0.9" />
          </g>
        ))}
      </Layer>
    </>
  );
}

/* 3 — Modern Editorial: ivory ground, bold top rule + bottom color bar. */
export function ModernEditorial({ palette: p }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: p.bg }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3%", background: p.ink }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1.6%", background: p.accent }} />
    </>
  );
}

/* 4 — Illustrated Playful: warm gradient, confetti shards + balloon silhouettes. */
export function IllustratedPlayful({ palette: p }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${p.bg} 0%, ${p.bg2} 50%, ${p.accent2 || p.bg} 100%)` }} />
      <Layer>
        {[[8, 10, 45], [85, 8, -20], [15, 88, 15], [90, 85, -60], [50, 6, 10], [6, 50, 30], [94, 50, -30], [48, 94, 5]].map(([x, y, r], i) => (
          <rect key={i} x={x} y={y} width="2.2" height="3.8" rx="0.6" fill={i % 2 ? p.accent : "#fff"} opacity="0.6" transform={`rotate(${r} ${x} ${y})`} />
        ))}
        <Dots n={6} fill="#fff" seed={5} rMin={0.6} rMax={1.1} oMin={0.3} oMax={0.5} />
      </Layer>
      {[[7, p.accent], [16, "#fff"]].map(([x, c], i) => (
        <svg key={i} width="9%" height="16%" viewBox="0 0 34 60" style={{ position: "absolute", top: "-2%", left: `${x}%`, pointerEvents: "none" }}>
          <ellipse cx="17" cy="20" rx="16" ry="20" fill={c} opacity="0.85" />
          <line x1="17" y1="40" x2="17" y2="58" stroke={c} strokeWidth="1" opacity="0.6" />
        </svg>
      ))}
    </>
  );
}

/* 5 — Botanical Floral: cream ground, soft leaf-cluster corners. */
export function BotanicalFloral({ palette: p }) {
  const leaf = (flipX, flipY) => (
    <g transform={`scale(${flipX ? -1 : 1} ${flipY ? -1 : 1})`}>
      <ellipse cx="18" cy="14" rx="16" ry="9" fill={p.accent2 || p.accent} opacity="0.2" transform="rotate(-35 18 14)" />
      <ellipse cx="26" cy="22" rx="14" ry="7" fill={p.accent2 || p.accent} opacity="0.15" transform="rotate(-50 26 22)" />
      <path d="M3 44 Q14 12 46 3" stroke={p.accent} strokeWidth="0.25" fill="none" opacity="0.6" />
      {[[30, 10], [36, 7], [40, 5]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.5" fill={p.accent} opacity="0.5" />)}
    </g>
  );
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: p.bg, border: `1.5px solid ${p.accent}` }} />
      <div style={{ position: "absolute", inset: 8, border: `0.6px solid ${p.accent}`, opacity: 0.3 }} />
      <svg width="30%" height="22%" viewBox="0 0 50 50" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>{leaf(false, false)}</svg>
      <svg width="30%" height="22%" viewBox="0 0 50 50" style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none" }}>{leaf(true, false)}</svg>
      <svg width="30%" height="22%" viewBox="0 0 50 50" style={{ position: "absolute", bottom: 0, left: 0, pointerEvents: "none" }}>{leaf(false, true)}</svg>
      <svg width="30%" height="22%" viewBox="0 0 50 50" style={{ position: "absolute", bottom: 0, right: 0, pointerEvents: "none" }}>{leaf(true, true)}</svg>
    </>
  );
}

/* 6 — Royal Frame: deep ground, ornate single-line corner frame + top jewel. */
export function RoyalFrame({ palette: p }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${p.bg} 0%, ${p.bg2} 100%)` }} />
      <div style={{ position: "absolute", inset: 14, border: `1.2px solid ${p.accent}`, opacity: 0.6 }} />
      <div style={{ position: "absolute", inset: 14, border: `1.2px solid ${p.accent}`, opacity: 0.25, transform: "scale(0.97)" }} />
      <Layer>
        <g transform="translate(50 9)">
          <path d="M-7 0 L-3 -6 L0 -1 L3 -6 L7 0 Z" fill={p.accent} opacity="0.85" />
          <circle r="1" fill={p.accent} />
        </g>
      </Layer>
    </>
  );
}

/* 7 — Celestial Stars: dark starfield + radial glow. */
export function CelestialStars({ palette: p }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 20%, ${p.bg2} 0%, ${p.bg} 55%, #0A0818 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 85%, ${p.accent}33 0%, transparent 60%)` }} />
      <Layer><Dots n={45} fill="#fff" seed={3} rMin={0.25} rMax={0.6} oMin={0.25} oMax={0.6} /></Layer>
    </>
  );
}

/* 8 — Safari Animal: earthy ground, leaf silhouettes + dot "animal print" cluster. */
export function SafariAnimal({ palette: p }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: p.bg }} />
      <Layer>
        <path d="M0 18 Q20 2 42 14 Q24 10 0 18Z" fill={p.accent2 || p.accent} opacity="0.3" />
        <path d="M100 85 Q78 98 58 88 Q78 92 100 85Z" fill={p.accent2 || p.accent} opacity="0.3" />
        {[[82, 14], [88, 20], [76, 10], [14, 88], [8, 80], [20, 92]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r="2.1" fill="none" stroke={p.accent} strokeWidth="0.3" opacity="0.5" />
            <circle r="0.9" fill={p.accent} opacity="0.35" />
          </g>
        ))}
      </Layer>
    </>
  );
}

/* 9 — Pastel Clouds: soft sky gradient, cloud puffs + twinkle stars. */
export function PastelClouds({ palette: p }) {
  const cloud = (x, y, s) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="9" ry="4.2" fill="#fff" opacity="0.8" />
      <ellipse cx="-5" cy="1" rx="5" ry="3" fill="#fff" opacity="0.7" />
      <ellipse cx="5" cy="1" rx="5.5" ry="3.2" fill="#fff" opacity="0.7" />
    </g>
  );
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${p.bg} 0%, ${p.bg2} 100%)` }} />
      <Layer>
        {cloud(16, 12, 1)}
        {cloud(84, 18, 0.8)}
        {cloud(10, 90, 0.7)}
        {cloud(90, 86, 0.9)}
        {[[50, 8], [30, 20], [70, 22], [20, 70], [80, 68]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 1.4} L${x + 0.5} ${y - 0.2} L${x + 1.6} ${y} L${x + 0.5} ${y + 0.2} L${x} ${y + 1.4} L${x - 0.5} ${y + 0.2} L${x - 1.6} ${y} L${x - 0.5} ${y - 0.2}Z`} fill={p.accent} opacity="0.6" />
        ))}
      </Layer>
    </>
  );
}

/* 10 — Traditional Indian: warm ground, mandala/rangoli corner motif + diya glow. */
export function TraditionalIndian({ palette: p }) {
  const mandala = (x, y) => (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M0 0 L0 -7" stroke={p.accent} strokeWidth="0.4" opacity="0.5" transform={`rotate(${i * 45})`} />
      ))}
      <circle r="2.4" fill="none" stroke={p.accent} strokeWidth="0.5" opacity="0.7" />
      <circle r="1" fill={p.accent2 || p.accent} opacity="0.7" />
    </g>
  );
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${p.accent2 || p.accent}22 0%, transparent 55%), ${p.bg}` }} />
      <div style={{ position: "absolute", inset: 14, border: `1px solid ${p.accent}`, opacity: 0.4 }} />
      <Layer>{mandala(10, 10)}{mandala(90, 10)}{mandala(10, 90)}{mandala(90, 90)}</Layer>
    </>
  );
}

/* 11 — Tea Vintage: soft ground, scalloped doily border + small teacup glyph. */
export function TeaVintage({ palette: p }) {
  const scallop = Array.from({ length: 14 }, (_, i) => `M${i * 7.2} 0 Q${i * 7.2 + 3.6} 4 ${i * 7.2 + 7.2} 0`).join(" ");
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: p.bg }} />
      <Layer>
        <path d={scallop} stroke={p.accent} strokeWidth="0.4" fill="none" opacity="0.55" />
        <g transform="translate(100 100) scale(-1 -1)"><path d={scallop} stroke={p.accent} strokeWidth="0.4" fill="none" opacity="0.55" /></g>
        <g transform="translate(8 50)">
          <path d="M0 0 h9 v4 a4.5 4 0 0 1 -9 0 Z" fill="none" stroke={p.accent} strokeWidth="0.4" opacity="0.6" />
          <path d="M9 1 q3 0 3 2 t-3 2" fill="none" stroke={p.accent} strokeWidth="0.4" opacity="0.6" />
        </g>
      </Layer>
    </>
  );
}

/* 12 — Corporate Minimal: clean ground, single hairline grid + accent tab. */
export function CorporateMinimal({ palette: p }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: p.bg }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "2.5%", height: "100%", background: p.accent }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${p.ink}0d 1px, transparent 1px)`, backgroundSize: "100% 12.5%", opacity: 0.4 }} />
    </>
  );
}

/* 13 — Heritage Ornate: deep ground, paisley/mehendi-style border line art. */
export function HeritageOrnate({ palette: p }) {
  const paisley = (x, y, r) => (
    <path key={`${x}-${y}`} d="M0 0 C 4 -4, 4 -10, 0 -12 C -4 -10, -4 -4, 0 0 Z" fill="none" stroke={p.accent} strokeWidth="0.35" opacity="0.5" transform={`translate(${x} ${y}) rotate(${r}) scale(0.9)`} />
  );
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${p.bg} 0%, ${p.bg2} 100%)` }} />
      <div style={{ position: "absolute", inset: 12, border: `1px solid ${p.accent}`, opacity: 0.45 }} />
      <Layer>
        {Array.from({ length: 10 }, (_, i) => paisley(5 + i * 10, 4, 0))}
        {Array.from({ length: 10 }, (_, i) => paisley(5 + i * 10, 96, 180))}
      </Layer>
    </>
  );
}

/* 14 — Nature Organic: greenery blobs + leaf veins, no florals. */
export function NatureOrganic({ palette: p }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: p.bg }} />
      <div style={{ position: "absolute", top: -60, left: -60, width: 260, height: 220, borderRadius: "60% 40% 55% 50%", background: `radial-gradient(ellipse, ${p.accent2 || p.accent}2e 0%, transparent 70%)` }} />
      <div style={{ position: "absolute", bottom: -50, right: -50, width: 240, height: 210, borderRadius: "45% 55% 50% 60%", background: `radial-gradient(ellipse, ${p.accent2 || p.accent}2e 0%, transparent 70%)` }} />
      <Layer>
        <path d="M6 30 Q30 10 40 2" stroke={p.accent} strokeWidth="0.3" fill="none" opacity="0.4" />
        <path d="M94 70 Q70 90 60 98" stroke={p.accent} strokeWidth="0.3" fill="none" opacity="0.4" />
      </Layer>
    </>
  );
}

/* 15 — Neon VIP Dark: black ground, neon ring glow + spotlight. */
export function NeonVipDark({ palette: p }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: p.bg }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 30%, ${p.accent}26 0%, transparent 55%)` }} />
      <div style={{ position: "absolute", inset: 16, border: `1px solid ${p.accent}`, opacity: 0.55, boxShadow: `0 0 18px ${p.accent}55 inset` }} />
    </>
  );
}

/* 16 — Achievement Badge: formal ground, laurel-wreath medal motif top center. */
export function AchievementBadge({ palette: p }) {
  const leaf = (side) => Array.from({ length: 5 }, (_, i) => (
    <ellipse key={i} cx={side * (3 + i * 2)} cy={-i * 1.6} rx="1.6" ry="3.2" fill="none" stroke={p.accent} strokeWidth="0.3" opacity="0.65" transform={`rotate(${side * (20 + i * 6)} ${side * (3 + i * 2)} ${-i * 1.6})`} />
  ));
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${p.bg} 0%, ${p.bg2} 100%)` }} />
      <Layer>
        <g transform="translate(50 10)">{leaf(-1)}{leaf(1)}<circle r="1.1" fill={p.accent} /></g>
      </Layer>
      <div style={{ position: "absolute", inset: 15, border: `1px solid ${p.accent}`, opacity: 0.3 }} />
    </>
  );
}

export const KITS = {
  elegantSerif: ElegantSerif,
  luxuryDarkGold: LuxuryDarkGold,
  modernEditorial: ModernEditorial,
  illustratedPlayful: IllustratedPlayful,
  botanicalFloral: BotanicalFloral,
  royalFrame: RoyalFrame,
  celestialStars: CelestialStars,
  safariAnimal: SafariAnimal,
  pastelClouds: PastelClouds,
  traditionalIndian: TraditionalIndian,
  teaVintage: TeaVintage,
  corporateMinimal: CorporateMinimal,
  heritageOrnate: HeritageOrnate,
  natureOrganic: NatureOrganic,
  neonVipDark: NeonVipDark,
  achievementBadge: AchievementBadge,
};

export function getKit(kitId) {
  return KITS[kitId] || ElegantSerif;
}

import React from "react";

/* Illustrated occasion-card art — a consistent family of simple line-art scenes
   (not photos), one motif per occasion, each on its own two-tone palette. Shared
   visual language: soft gradient backdrop, fine-stroke line art, scattered
   accent dots/sparkles, so 20 distinct personalities still read as one system. */

export const OCCASION_CARD_PALETTE = {
  "birthday-party":     { bg1: "#D7B58C", bg2: "#E8CFA8", footer: "#75482F", motif: "birthday" },
  "anniversary":         { bg1: "#DCC7D5", bg2: "#EAD9E4", footer: "#80576F", motif: "anniversary" },
  "baby-shower":         { bg1: "#E3E7D7", bg2: "#EFF2E6", footer: "#61724F", motif: "babyShower" },
  "first-birthday":      { bg1: "#EBCDB6", bg2: "#F4DFC9", footer: "#9A5C40", motif: "firstBirthday" },
  "get-together":        { bg1: "#E6D7C8", bg2: "#F0E5D9", footer: "#85664F", motif: "getTogether" },
  "housewarming":        { bg1: "#D9C3A6", bg2: "#E8D7BE", footer: "#75543B", motif: "housewarming" },
  "naming-ceremony":     { bg1: "#E8D8A8", bg2: "#F2E7C2", footer: "#806332", motif: "namingCeremony" },
  "gender-reveal":       { bg1: "#E6C8D0", bg2: "#F0DAE0", footer: "#93566A", motif: "genderReveal" },
  "newborn-welcome":     { bg1: "#DCE5E5", bg2: "#EAF0F0", footer: "#5B777A", motif: "newbornWelcome" },
  "kitty-party":         { bg1: "#E7D9C8", bg2: "#F1E8DB", footer: "#856448", motif: "kittyParty" },
  "graduation":          { bg1: "#D5E1EB", bg2: "#E6EEF4", footer: "#476785", motif: "graduation" },
  "office-party":        { bg1: "#D4DDE5", bg2: "#E5EBF0", footer: "#4E687D", motif: "officeParty" },
  "wedding":             { bg1: "#E6D2B6", bg2: "#F1E4CE", footer: "#9A6747", motif: "wedding" },
  "bachelorette":        { bg1: "#E8C8D4", bg2: "#F2DBE4", footer: "#91566E", motif: "bachelorette" },
  "farewell":            { bg1: "#D8E4E8", bg2: "#E9F0F2", footer: "#4D7483", motif: "farewell" },
  "retirement":          { bg1: "#D9D6C6", bg2: "#E9E7DB", footer: "#77734F", motif: "retirement" },
  "diwali-party":        { bg1: "#E9D0A1", bg2: "#F3E3C1", footer: "#8A5B2D", motif: "diwali" },
  "holi-party":          { bg1: "#E8D2D0", bg2: "#F2E3E1", footer: "#995F69", motif: "holi" },
  "navratri-garba":      { bg1: "#E2D0AF", bg2: "#EEE2C8", footer: "#8A6538", motif: "navratri" },
  "house-party":         { bg1: "#D3C7E0", bg2: "#E4DCED", footer: "#65517F", motif: "houseParty" },
};

const Sparkle = ({ x, y, s = 1, c }) => (
  <path d={`M${x} ${y - 4 * s} L${x + 1 * s} ${y - 1 * s} L${x + 4 * s} ${y} L${x + 1 * s} ${y + 1 * s} L${x} ${y + 4 * s} L${x - 1 * s} ${y + 1 * s} L${x - 4 * s} ${y} L${x - 1 * s} ${y - 1 * s} Z`} fill={c} opacity={0.8} />
);
const Dot = ({ x, y, r = 1.6, c }) => <circle cx={x} cy={y} r={r} fill={c} opacity={0.7} />;

function Motif({ motif, stroke, soft, deep }) {
  const sw = 2.2;
  switch (motif) {
    case "birthday": return (
      <g>
        <rect x="38" y="58" width="44" height="22" rx="3" fill={soft} stroke={stroke} strokeWidth={sw} />
        <rect x="42" y="48" width="36" height="12" rx="2" fill={soft} stroke={stroke} strokeWidth={sw} />
        <rect x="46" y="40" width="28" height="10" rx="2" fill={soft} stroke={stroke} strokeWidth={sw} />
        {[52, 60, 68].map((cx, i) => (
          <g key={i}>
            <line x1={cx} y1="40" x2={cx} y2="32" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
            <circle cx={cx} cy="29" r="2.6" fill={deep} />
          </g>
        ))}
        <line x1="38" y1="69" x2="82" y2="69" stroke={stroke} strokeWidth={1.4} opacity={0.5} />
        <Sparkle x={24} y={30} s={2.4} c={deep} />
        <Sparkle x={94} y={46} s={1.8} c={deep} />
        <Dot x={30} y={55} r={2} c={deep} />
        <Dot x={92} y={64} r={1.6} c={deep} />
      </g>
    );
    case "anniversary": return (
      <g>
        <circle cx="48" cy="52" r="15" fill="none" stroke={stroke} strokeWidth={sw} />
        <circle cx="68" cy="52" r="15" fill="none" stroke={stroke} strokeWidth={sw} />
        <path d="M44 40 C44 34 54 34 54 42 C54 34 64 34 64 40 C64 48 54 54 54 54 C54 54 44 48 44 40 Z" fill={deep} opacity={0.18} />
        <Dot x={30} y={34} r={1.8} c={deep} />
        <Dot x={88} y={70} r={1.8} c={deep} />
        <Sparkle x={90} y={34} s={2} c={deep} />
        <path d="M24 70 Q30 64 36 70" fill="none" stroke={stroke} strokeWidth={1.4} opacity={0.5} />
      </g>
    );
    case "babyShower": return (
      <g>
        <ellipse cx="60" cy="62" rx="20" ry="17" fill={soft} stroke={stroke} strokeWidth={sw} />
        <circle cx="60" cy="38" r="12" fill={soft} stroke={stroke} strokeWidth={sw} />
        <circle cx="50" cy="30" r="5" fill={soft} stroke={stroke} strokeWidth={1.6} />
        <circle cx="70" cy="30" r="5" fill={soft} stroke={stroke} strokeWidth={1.6} />
        <circle cx="55" cy="38" r="1.6" fill={deep} />
        <circle cx="65" cy="38" r="1.6" fill={deep} />
        <path d="M55 43 Q60 46 65 43" fill="none" stroke={deep} strokeWidth={1.4} strokeLinecap="round" />
        <path d="M20 40 Q26 34 32 40 Q38 46 44 40" fill="none" stroke={stroke} strokeWidth={1.6} opacity={0.6} />
        <Sparkle x={92} y={36} s={2} c={deep} />
        <Dot x={88} y={58} r={1.6} c={deep} />
      </g>
    );
    case "firstBirthday": return (
      <g>
        <path d="M54 72 V34 L46 40" fill="none" stroke={stroke} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="54" cy="24" r="3" fill={deep} />
        <rect x="76" y="56" width="18" height="16" rx="2.5" fill={soft} stroke={stroke} strokeWidth={1.8} />
        <line x1="85" y1="56" x2="85" y2="48" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
        <circle cx="85" cy="45" r="2" fill={deep} />
        <Sparkle x={26} y={32} s={2.4} c={deep} />
        <Sparkle x={34} y={58} s={1.6} c={deep} />
        <Dot x={70} y={28} r={1.8} c={deep} />
      </g>
    );
    case "houseParty": return (
      <g>
        <circle cx="60" cy="40" r="9" fill="none" stroke={stroke} strokeWidth={sw} />
        <path d="M51 40 h18 M60 31 v18 M54.3 33.7 l11.4 12.6 M65.7 33.7 l-11.4 12.6" stroke={stroke} strokeWidth={1.2} opacity={0.55} />
        <line x1="60" y1="49" x2="60" y2="60" stroke={stroke} strokeWidth={1.8} />
        <path d="M30 66 Q34 58 38 66" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
        <path d="M82 70 Q86 62 90 70" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
        <circle cx="40" cy="76" r="1.6" fill={deep} />
        <circle cx="80" cy="50" r="1.6" fill={deep} />
        <Sparkle x={24} y={46} s={2.2} c={deep} />
        <Sparkle x={94} y={30} s={1.8} c={deep} />
        <Sparkle x={70} y={74} s={1.6} c={deep} />
      </g>
    );
    case "housewarming": return (
      <g>
        <path d="M40 58 L60 40 L80 58 V76 H40 Z" fill={soft} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <rect x="55" y="62" width="10" height="14" fill="none" stroke={stroke} strokeWidth={1.6} />
        <path d="M30 76 Q28 64 34 58 Q32 70 38 76 Z" fill={deep} opacity={0.22} />
        <path d="M86 76 Q88 66 84 60 Q86 70 80 76 Z" fill={deep} opacity={0.18} />
        <circle cx="60" cy="48" r="2" fill={deep} />
        <Sparkle x={94} y={38} s={1.8} c={deep} />
      </g>
    );
    case "getTogether": return (
      <g>
        <path d="M48 44 L46 64 Q46 68 50 68 Q54 68 54 64 L52 44 Z" fill={soft} stroke={stroke} strokeWidth={1.8} />
        <path d="M68 44 L66 64 Q66 68 70 68 Q74 68 74 64 L72 44 Z" fill={soft} stroke={stroke} strokeWidth={1.8} />
        <line x1="50" y1="68" x2="50" y2="76" stroke={stroke} strokeWidth={1.6} />
        <line x1="70" y1="68" x2="70" y2="76" stroke={stroke} strokeWidth={1.6} />
        <path d="M32 74 Q60 82 88 74" fill="none" stroke={stroke} strokeWidth={1.6} opacity={0.5} />
        <Sparkle x={26} y={40} s={1.8} c={deep} />
        <Dot x={90} y={54} r={1.8} c={deep} />
      </g>
    );
    case "namingCeremony": return (
      <g>
        <path d="M60 30 C56 38 56 44 60 50 C64 44 64 38 60 30 Z" fill={deep} opacity={0.85} />
        <ellipse cx="60" cy="58" rx="14" ry="10" fill={soft} stroke={stroke} strokeWidth={sw} />
        <path d="M46 58 Q60 46 74 58" fill="none" stroke={stroke} strokeWidth={1.8} />
        <path d="M30 70 Q40 62 50 70 Q60 62 70 70 Q80 62 90 70" fill="none" stroke={stroke} strokeWidth={1.4} opacity={0.5} />
        <Dot x={30} y={44} r={1.6} c={deep} />
        <Dot x={92} y={48} r={1.6} c={deep} />
      </g>
    );
    case "genderReveal": return (
      <g>
        <rect x="46" y="52" width="28" height="24" rx="2" fill={soft} stroke={stroke} strokeWidth={sw} />
        <line x1="60" y1="52" x2="60" y2="76" stroke={stroke} strokeWidth={1.8} />
        <path d="M46 52 Q60 42 74 52" fill="none" stroke={stroke} strokeWidth={1.8} />
        <text x="60" y="44" textAnchor="middle" fontSize="16" fontWeight="700" fill={deep} fontFamily="Georgia, serif">?</text>
        <path d="M22 40 Q28 34 34 40 Q40 46 46 40" fill="none" stroke={stroke} strokeWidth={1.6} opacity={0.55} />
        <Sparkle x={88} y={64} s={2} c={deep} />
        <Dot x={84} y={40} r={1.6} c={deep} />
      </g>
    );
    case "newbornWelcome": return (
      <g>
        <path d="M70 32 A16 16 0 1 0 70 64 A12 12 0 1 1 70 32 Z" fill={deep} opacity={0.75} />
        <Sparkle x={42} y={34} s={2} c={deep} />
        <Sparkle x={34} y={52} s={1.6} c={deep} />
        <Sparkle x={50} y={60} s={1.4} c={deep} />
        <path d="M32 68 Q46 58 60 68 Q68 74 60 76 Q44 78 32 68 Z" fill={soft} stroke={stroke} strokeWidth={1.8} />
      </g>
    );
    case "kittyParty": return (
      <g>
        <path d="M44 56 h26 v6 a13 13 0 0 1 -13 13 a13 13 0 0 1 -13 -13 Z" fill={soft} stroke={stroke} strokeWidth={sw} />
        <path d="M70 58 q8 0 8 7 q0 7 -8 6" fill="none" stroke={stroke} strokeWidth={1.8} />
        <line x1="40" y1="76" x2="78" y2="76" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
        <path d="M38 44 Q46 38 54 44" fill="none" stroke={stroke} strokeWidth={1.4} opacity={0.5} />
        <Dot x={30} y={56} r={1.8} c={deep} />
        <Dot x={88} y={40} r={1.6} c={deep} />
        <Dot x={82} y={68} r={1.4} c={deep} />
      </g>
    );
    case "graduation": return (
      <g>
        <path d="M60 40 L90 50 L60 60 L30 50 Z" fill={soft} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M44 54 v12 q16 8 32 0 v-12" fill="none" stroke={stroke} strokeWidth={1.8} />
        <line x1="90" y1="50" x2="90" y2="64" stroke={stroke} strokeWidth={1.6} />
        <circle cx="90" cy="66" r="1.8" fill={deep} />
        <path d="M34 70 q6 -8 12 0 q6 -8 12 0" fill="none" stroke={stroke} strokeWidth={1.4} opacity={0.5} />
        <Sparkle x={26} y={40} s={1.8} c={deep} />
      </g>
    );
    case "officeParty": return (
      <g>
        <rect x="36" y="46" width="14" height="30" fill="none" stroke={stroke} strokeWidth={1.8} />
        <rect x="53" y="36" width="14" height="40" fill="none" stroke={stroke} strokeWidth={1.8} />
        <rect x="70" y="54" width="14" height="22" fill="none" stroke={stroke} strokeWidth={1.8} />
        {[40, 44, 57, 61, 74, 78].map((x, i) => <circle key={i} cx={x} cy={i < 2 ? 54 : i < 4 ? 44 : 62} r="1.2" fill={deep} />)}
        <Sparkle x={92} y={36} s={2} c={deep} />
        <Sparkle x={26} y={40} s={1.6} c={deep} />
      </g>
    );
    case "wedding": return (
      <g>
        <circle cx="52" cy="54" r="13" fill="none" stroke={stroke} strokeWidth={sw} />
        <circle cx="70" cy="54" r="13" fill="none" stroke={stroke} strokeWidth={sw} />
        <path d="M26 40 Q34 32 42 40 Q34 36 26 40 Z" fill={deep} opacity={0.3} />
        <path d="M80 70 Q88 62 96 70 Q88 66 80 70 Z" fill={deep} opacity={0.3} />
        <Dot x={30} y={70} r={1.6} c={deep} />
        <Sparkle x={94} y={38} s={1.8} c={deep} />
      </g>
    );
    case "bachelorette": return (
      <g>
        <path d="M50 38 L70 38 L60 54 Z" fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="60" y1="54" x2="60" y2="68" stroke={stroke} strokeWidth={1.8} />
        <line x1="50" y1="72" x2="70" y2="72" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
        <path d="M38 50 q4 -6 8 0 q-4 2 -8 0 Z M38 50 q4 6 8 0 q-4 -2 -8 0 Z" fill={deep} opacity={0.75} />
        <Sparkle x={88} y={46} s={2} c={deep} />
        <Sparkle x={30} y={66} s={1.6} c={deep} />
        <Dot x={82} y={62} r={1.6} c={deep} />
      </g>
    );
    case "farewell": return (
      <g>
        <path d="M30 56 L92 40 L66 50 L72 74 L58 58 L30 56 Z" fill={soft} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="30" y1="56" x2="66" y2="50" stroke={stroke} strokeWidth={1.4} opacity={0.6} />
        <path d="M22 72 Q40 64 58 72" fill="none" stroke={stroke} strokeWidth={1.4} opacity={0.45} />
        <Sparkle x={90} y={32} s={1.8} c={deep} />
      </g>
    );
    case "retirement": return (
      <g>
        <path d="M34 62 A26 26 0 0 1 86 62 Z" fill={soft} stroke={stroke} strokeWidth={sw} />
        <line x1="24" y1="62" x2="96" y2="62" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
        {[40, 60, 80].map((x, i) => <line key={i} x1={x} y1="54" x2={x} y2="46" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />)}
        <path d="M28 72 Q36 66 44 72" fill="none" stroke={stroke} strokeWidth={1.4} opacity={0.45} />
        <path d="M76 72 Q84 66 92 72" fill="none" stroke={stroke} strokeWidth={1.4} opacity={0.45} />
      </g>
    );
    case "diwali": return (
      <g>
        <path d="M40 64 Q60 58 80 64 Q80 72 60 74 Q40 72 40 64 Z" fill={soft} stroke={stroke} strokeWidth={sw} />
        <path d="M58 54 Q60 44 62 54 Q64 48 60 40 Q56 48 58 54 Z" fill={deep} />
        <Sparkle x={30} y={42} s={2.2} c={deep} />
        <Sparkle x={92} y={46} s={2} c={deep} />
        <Sparkle x={24} y={62} s={1.6} c={deep} />
        <Sparkle x={94} y={66} s={1.8} c={deep} />
        <Dot x={60} y={30} r={1.6} c={deep} />
      </g>
    );
    case "holi": return (
      <g>
        <circle cx="42" cy="44" r="10" fill={deep} opacity={0.5} />
        <circle cx="70" cy="38" r="8" fill={deep} opacity={0.35} />
        <circle cx="78" cy="60" r="11" fill={deep} opacity={0.4} />
        <circle cx="48" cy="68" r="7" fill={deep} opacity={0.3} />
        <Sparkle x={30} y={64} s={1.8} c={deep} />
        <Sparkle x={62} y={56} s={1.6} c={deep} />
        <Sparkle x={90} y={36} s={1.6} c={deep} />
        <Dot x={56} y={30} r={1.6} c={deep} />
      </g>
    );
    case "navratri": return (
      <g>
        <line x1="44" y1="38" x2="76" y2="70" stroke={stroke} strokeWidth={3.2} strokeLinecap="round" />
        <line x1="76" y1="38" x2="44" y2="70" stroke={stroke} strokeWidth={3.2} strokeLinecap="round" />
        <circle cx="44" cy="38" r="4" fill={deep} />
        <circle cx="76" cy="38" r="4" fill={deep} />
        <circle cx="44" cy="70" r="4" fill={deep} />
        <circle cx="76" cy="70" r="4" fill={deep} />
        <circle cx="60" cy="54" r="3" fill="none" stroke={deep} strokeWidth={1.4} />
        <Sparkle x={28} y={54} s={1.8} c={deep} />
        <Sparkle x={92} y={54} s={1.8} c={deep} />
      </g>
    );
    default: return (
      <g>
        <circle cx="60" cy="54" r="16" fill="none" stroke={stroke} strokeWidth={sw} />
        <Sparkle x={60} y={54} s={3} c={deep} />
      </g>
    );
  }
}

export default function OccasionCardArt({ slug, small }) {
  const p = OCCASION_CARD_PALETTE[slug] || { bg1: "#D7B58C", bg2: "#E8CFA8", footer: "#75482F", motif: "birthday" };
  return (
    <svg viewBox="0 0 120 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <defs>
        <radialGradient id={`occg-${slug}`} cx="35%" cy="25%" r="85%">
          <stop offset="0%" stopColor={p.bg2} />
          <stop offset="100%" stopColor={p.bg1} />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="120" height="100" fill={`url(#occg-${slug})`} />
      {/* soft translucent decorative blobs */}
      <circle cx="105" cy="8" r="22" fill={p.footer} opacity={0.07} />
      <circle cx="4" cy="92" r="26" fill={p.footer} opacity={0.06} />
      <Motif motif={p.motif} stroke={p.footer} soft={p.bg2} deep={p.footer} />
    </svg>
  );
}

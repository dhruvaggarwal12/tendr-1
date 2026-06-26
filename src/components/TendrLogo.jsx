export default function TendrLogo({ height = 44, dark = false }) {
  const gw = Math.round(height * 0.62);
  const gh = height;
  const showTagline = height >= 38;

  const glassColor  = dark ? "#CCAB4A" : "#C47A2E";
  const sparkColor  = dark ? "#FFD07A" : "#CCAB4A";
  const liquidColor = dark ? "#FFD07A" : "#CCAB4A";
  const wordColor   = dark ? "#CCAB4A" : "#C47A2E";
  const tagColor    = dark ? "rgba(255,255,255,0.5)" : "#9B7450";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(height * 0.18), flexShrink: 0 }}>
      {/* Wine glass SVG */}
      <svg
        width={gw}
        height={gh}
        viewBox="0 0 24 40"
        fill="none"
        style={{ overflow: "visible", flexShrink: 0 }}
      >
        {/* Bowl outline */}
        <path
          d="M 2,2 L 22,2 C 22,2 25,14 20,22 C 17,27 15,29 12,29 C 9,29 7,27 4,22 C -1,14 2,2 2,2 Z"
          stroke={glassColor}
          strokeWidth="1.4"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Liquid fill */}
        <path
          d="M 4,20 C 2,24 4,27 7,28.2 C 9,28.8 11,29 12,29 C 13,29 15,28.8 17,28.2 C 20,27 22,24 20,20 Z"
          fill={liquidColor}
          fillOpacity="0.28"
        />
        {/* Stem */}
        <line x1="12" y1="29" x2="12" y2="37" stroke={glassColor} strokeWidth="1.4" strokeLinecap="round" />
        {/* Base */}
        <ellipse cx="12" cy="38.5" rx="5.5" ry="1.4" stroke={glassColor} strokeWidth="1.3" fill="none" />

        {/* Sparkles */}
        <line x1="22" y1="6" x2="22" y2="11" stroke={sparkColor} strokeWidth="0.9" strokeLinecap="round" />
        <line x1="19.5" y1="8.5" x2="24.5" y2="8.5" stroke={sparkColor} strokeWidth="0.9" strokeLinecap="round" />
        <line x1="1" y1="15" x2="1" y2="19" stroke={sparkColor} strokeWidth="0.8" strokeLinecap="round" />
        <line x1="-1.5" y1="17" x2="3.5" y2="17" stroke={sparkColor} strokeWidth="0.8" strokeLinecap="round" />
        <line x1="19" y1="3" x2="19" y2="5.5" stroke={sparkColor} strokeWidth="0.7" strokeLinecap="round" />
        <line x1="17.75" y1="4.25" x2="20.25" y2="4.25" stroke={sparkColor} strokeWidth="0.7" strokeLinecap="round" />
      </svg>

      {/* Wordmark */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: 1 }}>
        <span style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: Math.round(height * 0.54),
          color: wordColor,
          letterSpacing: "-0.02em",
          fontWeight: 400,
          lineHeight: 1,
          display: "block",
        }}>
          tendr
        </span>
        {showTagline && (
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: Math.round(height * 0.13),
            color: tagColor,
            letterSpacing: "0.15em",
            fontWeight: 700,
            textTransform: "uppercase",
            lineHeight: 1,
            marginTop: Math.round(height * 0.06),
            display: "block",
          }}>
            we curate · you celebrate
          </span>
        )}
      </div>
    </div>
  );
}

import { useDispatch } from "react-redux";
import { useBookVendors } from "../context/BookVendorsContext";
import { setBookingType } from "../redux/eventPlanningSlice";
import { clearVendorCompare } from "../redux/listingFiltersSlice";
import router from "../router";

const font = "'Outfit', sans-serif";
const gold = "#C47A2E";
const goldLt = "#CCAB4A";
const ink = "#1C0E04";
const inkMid = "#2C1A0E";
const cream = "#FFF8EC";

const IconGrid = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);
const IconBuild = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const IconSparkle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z"/>
  </svg>
);

const CARDS = [
  {
    type: "browse",
    Icon: IconGrid,
    title: "Browse",
    tag: "Explore",
    subtitle: "Want to book just one vendor? Browse the full directory and pick them directly.",
    accent: "#2563eb",
    cardBg: "#F7FAFF",
    borderColor: "rgba(37,99,235,0.2)",
    iconBg: "rgba(37,99,235,0.1)",
    ctaBg: "linear-gradient(135deg,#2563eb,#3b82f6)",
    route: "/listings?serviceType=Caterer",
  },
  {
    type: "you-do-it",
    Icon: IconBuild,
    title: "Build a Package",
    tag: "Full Control",
    subtitle: "Want to book multiple vendors yourself? Pick one per category, one at a time.",
    accent: "#7c3aed",
    cardBg: "#FAF8FF",
    borderColor: "rgba(124,58,237,0.2)",
    iconBg: "rgba(124,58,237,0.1)",
    ctaBg: "linear-gradient(135deg,#7c3aed,#9333ea)",
    route: null,
  },
  {
    type: "let-us-do-it",
    Icon: IconSparkle,
    title: "Get a Package",
    tag: "Recommended",
    subtitle: "Want us to suggest the whole lineup? Set your budget and we'll assemble it instantly.",
    accent: "#fff",
    cardBg: `linear-gradient(145deg,${inkMid},${ink})`,
    borderColor: "rgba(204,171,74,0.35)",
    iconBg: "rgba(204,171,74,0.12)",
    ctaBg: `linear-gradient(135deg,${goldLt},${gold})`,
    route: null,
    dark: true,
  },
];

export default function BookVendorsModal() {
  const { open, closeBookVendors } = useBookVendors();
  const dispatch = useDispatch();

  if (!open) return null;

  // Rendered as a sibling of <RouterProvider> in App.jsx (so it can float above every
  // route), which means it's outside Router context — useNavigate() would throw here.
  // router.navigate() is the data-router API for navigating from outside that context.
  const handleChoose = (type, route) => {
    closeBookVendors();
    if (route) { router.navigate(route); return; }
    dispatch(clearVendorCompare());
    dispatch(setBookingType(type));
    router.navigate("/plan-event/form?bookingType=" + type);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(20,10,4,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) closeBookVendors(); }}
    >
      <div style={{ width: "100%", maxWidth: 820, background: "#F5F0E8", borderRadius: 24, padding: "28px 22px", maxHeight: "92dvh", overflowY: "auto", fontFamily: font, boxShadow: "0 32px 80px rgba(28,9,0,0.4)", position: "relative" }}>
        <button
          onClick={closeBookVendors}
          aria-label="Close"
          style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", cursor: "pointer", fontSize: 16, color: "#9B7450", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
        >×</button>

        <div style={{ textAlign: "center", marginBottom: 22, paddingRight: 30 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: gold, marginBottom: 6 }}>
            Book Vendors
          </div>
          <h2 style={{ fontFamily: font, fontSize: "clamp(1.3rem,3vw,1.7rem)", fontWeight: 800, color: inkMid, margin: 0 }}>
            How would you like to book?
          </h2>
        </div>

        <div className="bvm-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {CARDS.map((c) => {
            const { Icon } = c;
            const isDark = !!c.dark;
            const textColor = isDark ? cream : ink;
            const subColor = isDark ? "rgba(255,248,236,0.6)" : "#7A5A3A";
            return (
              <div
                key={c.type}
                className="bvm-card"
                onClick={() => handleChoose(c.type, c.route)}
                style={{
                  background: c.cardBg, border: `1.5px solid ${c.borderColor}`, borderRadius: 18,
                  padding: "20px 16px", cursor: "pointer", display: "flex", flexDirection: "column",
                  boxShadow: "0 4px 16px rgba(28,9,0,0.08)", transition: "transform 0.15s ease",
                  position: "relative",
                }}
              >
                {c.type === "let-us-do-it" && (
                  <div className="bvm-card-tag" style={{ alignSelf: "flex-start", background: `linear-gradient(135deg,${gold},${goldLt})`, borderRadius: 100, padding: "3px 10px", marginBottom: 10 }}>
                    <span style={{ fontSize: 8.5, fontWeight: 800, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recommended</span>
                  </div>
                )}
                <div className="bvm-card-icon" style={{ width: 44, height: 44, borderRadius: 13, background: c.iconBg, border: `1.5px solid ${c.borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", color: isDark ? goldLt : c.accent, marginBottom: 14 }}>
                  <Icon />
                </div>
                <div className="bvm-card-body" style={{ flex: 1 }}>
                  <div className="bvm-card-title" style={{ fontSize: 15.5, fontWeight: 800, color: textColor, marginBottom: 5 }}>{c.title}</div>
                  <div className="bvm-card-desc" style={{ fontSize: 12.5, color: subColor, lineHeight: 1.5, marginBottom: 16 }}>{c.subtitle}</div>
                </div>
                <button
                  className="bvm-card-cta"
                  onClick={(e) => { e.stopPropagation(); handleChoose(c.type, c.route); }}
                  style={{ width: "100%", padding: "11px 0", borderRadius: 11, border: "none", background: c.ctaBg, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
                >
                  {c.title} →
                </button>
              </div>
            );
          })}
        </div>

        <style>{`
          @media (max-width: 680px) {
            .bvm-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
            .bvm-card { padding: 14px 14px !important; flex-direction: row !important; align-items: center !important; gap: 12px !important; }
            .bvm-card-icon { width: 36px !important; height: 36px !important; border-radius: 11px !important; margin-bottom: 0 !important; flex-shrink: 0 !important; }
            .bvm-card-icon svg { width: 18px !important; height: 18px !important; }
            .bvm-card-body { flex: 1 !important; min-width: 0 !important; }
            .bvm-card-title { font-size: 13.5px !important; margin-bottom: 2px !important; }
            .bvm-card-desc { display: none !important; }
            .bvm-card-cta { width: auto !important; padding: 8px 14px !important; font-size: 11.5px !important; flex-shrink: 0 !important; }
            .bvm-card-tag { position: absolute !important; top: 8px !important; right: 8px !important; margin-bottom: 0 !important; }
          }
        `}</style>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import mascotImg from "../assets/ui/tendr-mascot.png";

const font = "'Outfit', sans-serif";
export const ONBOARDING_KEY = "tendr_onboarding_v1";

// ── Category data ─────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    label: "Vendor Services",
    items: [
      { id: "Photographer", icon: "📸", label: "Photography",  color: "#15803d", route: "/listings" },
      { id: "Decorator",    icon: "🎨", label: "Decoration",   color: "#b45309", route: "/listings" },
      { id: "Caterer",      icon: "🍽️", label: "Catering",     color: "#0369a1", route: "/listings" },
      { id: "DJ",           icon: "🎧", label: "DJ & Music",   color: "#7c3aed", route: "/listings" },
    ],
  },
  {
    label: "Memories",
    items: [
      { id: "Stationery",  icon: "📜", label: "Wedding Stationery", color: "#9B7BAD", route: "/stationery" },
      { id: "Invitation",  icon: "💌", label: "Invitation Flyers",  color: "#C4748A", route: "/invitation" },
    ],
  },
  {
    label: "Gifting",
    items: [
      { id: "GiftHampers", icon: "🎁", label: "Gift Hampers", color: "#be185d", route: "/gift-hampers-cakes" },
    ],
  },
];

export const ALL_ITEMS = SECTIONS.flatMap(s => s.items);
const VENDOR_IDS = ["Photographer", "Decorator", "Caterer", "DJ"];

// ── Check if event planning form is filled ────────────────────────────────────
function hasFormFilled() {
  try {
    const raw = localStorage.getItem("tendr_ep_session");
    if (raw) {
      const d = JSON.parse(raw);
      return !!(d.formData?.eventType || d.eventType);
    }
    const fv = localStorage.getItem("tendr_finalised");
    if (fv) {
      const d = JSON.parse(fv);
      return Object.keys(d).some(k => k !== "__expiresAt");
    }
  } catch {}
  return false;
}

// ── Category chip ─────────────────────────────────────────────────────────────
function Chip({ item, selected, onToggle }) {
  const isSel = selected.includes(item.id);
  return (
    <button onClick={() => onToggle(item.id)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 100, cursor: "pointer",
        border: `1.5px solid ${isSel ? item.color : "rgba(0,0,0,0.1)"}`,
        background: isSel ? `${item.color}14` : "#fff",
        fontFamily: font, fontSize: 13, fontWeight: isSel ? 700 : 500,
        color: isSel ? item.color : "#5a3a1a",
        transition: "all 0.15s",
        boxShadow: isSel ? `0 2px 8px ${item.color}22` : "none",
      }}>
      <span style={{ fontSize: 16 }}>{item.icon}</span>
      {item.label}
      {isSel && <span style={{ fontSize: 10, fontWeight: 900, marginLeft: 2 }}>✓</span>}
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
const FREE_TOOLS = [
  { icon: "📊", title: "Budget Allocator", desc: "Split your budget across services and track spending in real time.", route: "/budget-picker" },
  { icon: "✅", title: "Event Checklist", desc: "Get a pre-built checklist for your event type — never miss a task.", route: "/prebuilt-checklist" },
  { icon: "⚖️", title: "Compare Vendors", desc: "Add vendors to a comparison board and decide with all data visible.", route: "/listings" },
];

export default function OnboardingWelcome({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep]       = useState("first-time"); // first-time | tools | pick | start-with
  const [selected, setSelected] = useState([]);
  const [startChoice, setStartChoice] = useState(null);

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  // ── Save checklist + navigate ─────────────────────────────────────────────
  const finalise = (categoryId) => {
    const items = selected.map(id => {
      const cat = ALL_ITEMS.find(c => c.id === id);
      return { id: `ob_${id}`, label: cat.label, category: id, done: false, icon: cat.icon, route: cat.route };
    });
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ items }));
    onClose();

    const cat = ALL_ITEMS.find(c => c.id === categoryId);
    if (!cat) return;

    // Vendor category — check form
    if (VENDOR_IDS.includes(categoryId)) {
      if (hasFormFilled()) {
        navigate("/listings", { state: { selectedCategories: [categoryId] } });
      } else {
        navigate("/booking");
      }
    } else {
      navigate(cat.route);
    }
  };

  // ── On submit from picker ─────────────────────────────────────────────────
  const handleSubmit = () => {
    if (selected.length === 0) return;
    const vendorSelected = selected.filter(id => VENDOR_IDS.includes(id));
    const nonVendor = selected.filter(id => !VENDOR_IDS.includes(id));

    // Only non-vendor (memories/gifting) — go directly
    if (vendorSelected.length === 0) {
      finalise(selected[0]); return;
    }
    // Single vendor category — go directly
    if (vendorSelected.length === 1 && nonVendor.length === 0) {
      finalise(vendorSelected[0]); return;
    }
    // Multiple — ask "start with what?"
    setStep("start-with");
  };

  // ── STEP: first-time ──────────────────────────────────────────────────────
  if (step === "first-time") return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign: "center", padding: "36px 32px 32px" }}>
        <BowingMascot size={120} />
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.7rem", fontWeight: 400, color: "#2C1A0E", margin: "0 0 6px" }}>
          Welcome to Tendr! 🎉
        </h2>
        <p style={{ fontSize: 13.5, color: "#9B7450", margin: "0 0 28px", lineHeight: 1.6 }}>
          Delhi NCR's celebration planning platform — vendors, tools, memories all in one place.
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", margin: "0 0 16px" }}>
          Is this your first time here?
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setStep("tools")}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
            Yes, first time! 👋
          </button>
          <button onClick={onClose}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Nope, I know my way →
          </button>
        </div>
      </div>
    </Overlay>
  );

  // ── STEP: tools teaser ───────────────────────────────────────────────────
  if (step === "tools") return (
    <Overlay onClose={onClose}>
      <div style={{ padding: "30px 28px 26px" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎁</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.55rem", fontWeight: 400, color: "#2C1A0E", margin: "0 0 4px" }}>
            Here's what Tendr gives you — free
          </h2>
          <p style={{ fontSize: 12.5, color: "#9B7450", margin: 0 }}>Planning tools built for Indian celebrations</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {FREE_TOOLS.map(tool => (
            <div key={tool.title}
              onClick={() => { onClose(); navigate(tool.route); }}
              style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.18)", background: "#FFFCF5", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.06)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FFFCF5"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.18)"; }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,rgba(196,122,46,0.12),rgba(204,171,74,0.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {tool.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>{tool.title}</div>
                <div style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.45 }}>{tool.desc}</div>
              </div>
              <span style={{ fontSize: 16, color: "#C47A2E", flexShrink: 0, marginTop: 4 }}>→</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setStep("pick")}
            style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
            Start Planning →
          </button>
          <button onClick={onClose}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.28)", background: "transparent", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            Skip
          </button>
        </div>
      </div>
    </Overlay>
  );

  // ── STEP: pick categories ─────────────────────────────────────────────────
  if (step === "pick") return (
    <Overlay onClose={onClose}>
      <div style={{ padding: "28px 28px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <BowingMascot size={80} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", fontWeight: 400, color: "#2C1A0E", margin: "0 0 4px" }}>
            What are you planning? 🎉
          </h2>
          <p style={{ fontSize: 12.5, color: "#9B7450", margin: 0 }}>Select everything you need</p>
        </div>

        {SECTIONS.map(section => (
          <div key={section.label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
              {section.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {section.items.map(item => (
                <Chip key={item.id} item={item} selected={selected} onToggle={toggle} />
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 20 }}>
          <button onClick={handleSubmit} disabled={selected.length === 0}
            style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: selected.length > 0 ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: selected.length > 0 ? "#fff" : "#9ca3af", fontSize: 14, fontWeight: 800, cursor: selected.length > 0 ? "pointer" : "not-allowed", fontFamily: font, boxShadow: selected.length > 0 ? "0 4px 14px rgba(196,122,46,0.3)" : "none" }}>
            {selected.length > 0 ? `Start Planning — ${selected.length} selected →` : "Select something first"}
          </button>
        </div>
      </div>
    </Overlay>
  );

  // ── STEP: start-with ─────────────────────────────────────────────────────
  if (step === "start-with") {
    const vendorSelected = selected.filter(id => VENDOR_IDS.includes(id));
    const nonVendor      = selected.filter(id => !VENDOR_IDS.includes(id));
    return (
      <Overlay onClose={onClose}>
        <div style={{ padding: "32px 28px 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🗂️</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", fontWeight: 400, color: "#2C1A0E", margin: "0 0 6px" }}>
              What do you want to start with?
            </h2>
            <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>
              You can come back for the others from your checklist
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {vendorSelected.map(id => {
              const cat = ALL_ITEMS.find(c => c.id === id);
              return (
                <button key={id} onClick={() => finalise(id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 14, border: `1.5px solid ${cat.color}30`, background: `${cat.color}08`, cursor: "pointer", fontFamily: font, textAlign: "left", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${cat.color}14`; e.currentTarget.style.borderColor = `${cat.color}60`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${cat.color}08`; e.currentTarget.style.borderColor = `${cat.color}30`; }}
                >
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{cat.label}</div>
                    <div style={{ fontSize: 11, color: "#9B7450" }}>
                      {hasFormFilled() ? "Go to vendor listing →" : "Fill event form first →"}
                    </div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 18, color: cat.color }}>→</span>
                </button>
              );
            })}

            {/* Non-vendor options shown smaller */}
            {nonVendor.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>Or browse directly</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {nonVendor.map(id => {
                    const cat = ALL_ITEMS.find(c => c.id === id);
                    return (
                      <button key={id} onClick={() => finalise(id)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 100, border: `1.5px solid ${cat.color}40`, background: `${cat.color}08`, cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: 600, color: cat.color }}>
                        {cat.icon} {cat.label} →
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <button onClick={() => setStep("pick")}
            style={{ width: "100%", marginTop: 16, padding: "10px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "transparent", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            ← Change selection
          </button>
        </div>
      </Overlay>
    );
  }

  return null;
}

// ── Bowing mascot ────────────────────────────────────────────────────────────
function BowingMascot({ size = 110 }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <img
          src={mascotImg}
          alt="Tendr mascot"
          className="tendr-bow"
          style={{
            width: size,
            objectFit: "contain",
            transformOrigin: "bottom center",
            display: "block",
          }}
        />
      </div>
      <style>{`
        @keyframes tendr-bow {
          0%   { transform: rotate(0deg);   }
          10%  { transform: rotate(0deg);   }
          30%  { transform: rotate(22deg);  }
          50%  { transform: rotate(22deg);  }
          68%  { transform: rotate(0deg);   }
          78%  { transform: rotate(0deg);   }
          88%  { transform: rotate(16deg);  }
          96%  { transform: rotate(16deg);  }
          100% { transform: rotate(0deg);   }
        }
        .tendr-bow {
          animation: tendr-bow 2.8s ease-in-out 1 forwards;
        }
      `}</style>
    </>
  );
}

// ── Shared overlay wrapper ───────────────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(28,10,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, padding: 20, animation: "fadeInBg 0.3s ease" }}>
      <div style={{ background: "#FFFCF7", borderRadius: 24, width: "min(94vw, 520px)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(28,10,0,0.25)", border: "1.5px solid rgba(196,122,46,0.18)", position: "relative", animation: "slideUpModal 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <button onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, zIndex: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(44,26,14,0.08)", border: "none", color: "#9B7450", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ✕
        </button>
        {children}
      </div>
      <style>{`
        @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpModal { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ── Hook to read/use checklist ───────────────────────────────────────────────
export function useOnboardingChecklist() {
  const raw   = (() => { try { return JSON.parse(localStorage.getItem(ONBOARDING_KEY) || "{}"); } catch { return {}; } })();
  const items = raw.items || [];
  const markDone = (categoryId) => {
    const updated = { ...raw, items: items.map(i => i.category === categoryId ? { ...i, done: true } : i) };
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
  };
  return { items, markDone, total: items.length, done: items.filter(i => i.done).length };
}

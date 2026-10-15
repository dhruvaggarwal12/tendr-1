import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ENTRY_EXPERIENCES, getEntryExperienceById } from "../data/entryExperiences";

const font = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";
const ink = "#1C0900";
const muted = "rgba(28,9,0,0.55)";
const border = "rgba(196,122,46,0.2)";

const BUDGET_RANK = { budget: 1, mid: 2, premium: 3 };

// Score → filter → sort, mirroring OccasionDetail.jsx's getActivitySuggestions shape —
// occasion + age-group + guest-count + venue + budget fit, most relevant first, no cap.
function getEntryExperienceSuggestions(occasion, { ageGroups = [], guests = 20, venueType = "", budget = 0 } = {}) {
  const occId = occasion?.id || "";
  const venue = (venueType || "").toLowerCase();
  const b = Number(budget) || 0;
  return ENTRY_EXPERIENCES.map((e) => {
    let score = 0;
    // Occasion mismatch is a hard negative, not just a missed bonus — otherwise an
    // idea tagged only for other occasions (e.g. a kids' mascot) can still sneak
    // through on guest-count/budget score alone for something like an office party.
    if (e.suitableOccasions.includes(occId)) score += 4;
    else score -= 3;
    if (e.ageGroups?.length) {
      if (ageGroups.some((a) => e.ageGroups.includes(a))) score += 2;
      else score -= 1; // age-restricted idea that doesn't match this crowd
    } else {
      score += 1; // age-agnostic ideas stay broadly relevant
    }
    if (guests >= e.guestRange[0] && guests <= e.guestRange[1]) score += 2;
    else if (guests > e.guestRange[1]) score -= 1;
    if (venue && e.venueRequirements.some((r) => r.toLowerCase().includes(venue.split(" ")[0]))) score += 1;
    if (b > 0) {
      const guess = b < 30000 ? 1 : b < 80000 ? 2 : 3;
      if (BUDGET_RANK[e.budgetLevel] <= guess) score += 1;
      else score -= 1;
    }
    return { ...e, score };
  })
    .filter((e) => e.score > 0)
    .sort((a, b2) => b2.score - a.score);
}

function Chip({ label, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      style={{
        fontSize: 11.5, fontWeight: 600, padding: "6px 12px", borderRadius: 100, fontFamily: font,
        border: `1.5px solid ${selected ? "rgba(34,197,94,0.35)" : border}`,
        background: selected ? "rgba(34,197,94,0.08)" : "rgba(196,122,46,0.04)",
        color: selected ? "#16a34a" : ink,
        cursor: disabled ? "default" : "pointer",
        display: "inline-flex", alignItems: "center", gap: 5,
      }}
    >
      {selected ? "✓" : "+"} {label}
    </button>
  );
}

function EntryCard({ idea, selected, occAccent, onExplore }) {
  return (
    <button
      type="button"
      onClick={onExplore}
      style={{
        padding: 0, borderRadius: 16, overflow: "hidden", textAlign: "left", cursor: "pointer",
        border: `2px solid ${selected ? occAccent : "rgba(196,122,46,0.13)"}`,
        background: "#fff", transition: "all 0.18s",
        boxShadow: selected ? `0 4px 20px ${occAccent}38` : "0 1px 5px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ position: "relative", height: 140, overflow: "hidden", background: "linear-gradient(160deg,#C47A2E44,#C47A2E18)" }}>
        {idea.images?.[0] && (
          <img
            src={idea.images[0]}
            alt={idea.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.62) 0%,transparent 55%)" }} />
        <div style={{ position: "absolute", bottom: 10, left: 11, right: 32 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.25, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{idea.title}</span>
        </div>
        {selected && (
          <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: occAccent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 11.5, color: muted, lineHeight: 1.5, marginBottom: 8, minHeight: 34 }}>{idea.shortDesc}</div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 8 }}>
          {idea.tags.slice(0, 3).map((tag) => (
            <span key={tag} style={{ fontSize: 9, fontWeight: 600, color: "rgba(30,15,0,0.38)", background: "rgba(28,9,0,0.05)", borderRadius: 100, padding: "2px 7px" }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: idea.priceDisplay === "Quote required" ? muted : ink }}>{idea.priceDisplay}</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: occAccent }}>Explore idea →</span>
        </div>
      </div>
    </button>
  );
}

function ListSection({ title, items, dash }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(196,122,46,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {items.map((it, i) => (
          <div key={i} style={{ fontSize: 12.5, color: ink, lineHeight: 1.55, display: "flex", alignItems: "flex-start", gap: 7 }}>
            <span style={{ flexShrink: 0, color: dash ? muted : "#C47A2E", marginTop: 1 }}>{dash ? "–" : "·"}</span>
            <span>{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailDrawer({ idea, selected, vendors, onToggleVendor, onToggleSelect, onClose, onOpenRelated, occAccent }) {
  const navigate = useNavigate();
  const vendorUrl = (cat) => `/listings?${new URLSearchParams({ serviceType: cat }).toString()}`;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(28,9,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "100%", maxWidth: 640, background: "#FFFCF5", borderRadius: "20px 20px 0 0", padding: "20px 18px 32px", maxHeight: "93dvh", overflowY: "auto", fontFamily: font }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: occAccent, textTransform: "uppercase", letterSpacing: "0.12em" }}>Entry Experience</div>
            <div style={{ fontFamily: serif, fontSize: "clamp(1.2rem,3vw,1.5rem)", fontWeight: 700, color: ink, marginTop: 2 }}>{idea.title}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", cursor: "pointer", fontSize: 16, color: muted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
        </div>

        {idea.images?.[0] && (
          <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 16, height: 180 }}>
            <img src={idea.images[0]} alt={idea.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }} />
          </div>
        )}

        <p style={{ fontSize: 13.5, color: ink, lineHeight: 1.65, marginBottom: 18 }}>{idea.shortDesc}</p>

        <ListSection title="What's included" items={idea.inclusions} />
        <ListSection title="What's not included" items={idea.exclusions} dash />
        <ListSection title="Space & venue requirements" items={idea.venueRequirements} />

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(196,122,46,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Setup time</div>
          <p style={{ fontSize: 12.5, color: ink, lineHeight: 1.55, margin: 0 }}>{idea.setupDuration}</p>
        </div>

        {idea.requiredVendorCategories?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(196,122,46,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>You'll also need</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {idea.requiredVendorCategories.map((cat) => {
                const sel = vendors.includes(cat);
                return <Chip key={cat} label={cat} selected={sel} disabled={sel} onClick={() => onToggleVendor(cat)} />;
              })}
            </div>
          </div>
        )}

        <ListSection title="Safety notes" items={idea.safetyNotes} dash />

        {idea.pricingComponents?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(196,122,46,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Estimated pricing</div>
            <div style={{ borderRadius: 12, border: `1px solid ${border}`, overflow: "hidden" }}>
              {idea.pricingComponents.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", fontSize: 12.5, borderTop: i > 0 ? `1px solid ${border}` : "none", background: "#fff" }}>
                  <span style={{ color: ink }}>{p.label}</span>
                  <span style={{ color: muted, fontWeight: 600 }}>{p.range}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", fontSize: 12.5, borderTop: `1px solid ${border}`, background: "rgba(196,122,46,0.04)" }}>
                <span style={{ color: ink, fontWeight: 700 }}>Typical total</span>
                <span style={{ color: occAccent, fontWeight: 800 }}>{idea.priceDisplay}</span>
              </div>
            </div>
          </div>
        )}

        {idea.relatedConcepts?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(196,122,46,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Similar ideas</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              {idea.relatedConcepts.map((id) => {
                const rel = getEntryExperienceById(id);
                if (!rel) return null;
                return (
                  <button key={id} onClick={() => onOpenRelated(rel)} style={{ flexShrink: 0, width: 140, textAlign: "left", padding: "9px 10px", borderRadius: 10, border: `1px solid ${border}`, background: "#fff", cursor: "pointer", fontFamily: font }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: ink }}>{rel.title}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onToggleSelect(idea.id)}
            style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: selected ? "rgba(34,197,94,0.1)" : occAccent, color: selected ? "#16a34a" : "#fff", fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: font }}
          >
            {selected ? "✓ Added to My Plan" : "Add to My Plan"}
          </button>
          {idea.requiredVendorCategories?.[0] && (
            <button
              onClick={() => navigate(vendorUrl(idea.requiredVendorCategories[0]))}
              style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1.5px solid ${border}`, background: "#fff", color: ink, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}
            >
              Find Vendors
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EntryExperiences({ occasion, ageGroups, guests, venueType, budget, vendors, onToggleVendor, selectedIds, onToggleSelect, occAccent }) {
  const [openIdea, setOpenIdea] = useState(null);

  const ideas = getEntryExperienceSuggestions(occasion, { ageGroups, guests, venueType, budget });

  return (
    <div>
      <p style={{ fontFamily: serif, fontSize: "clamp(1.3rem,3vw,1.7rem)", color: ink, lineHeight: 1.3, marginBottom: 6 }}>Make a Grand Entrance ✨</p>
      <p style={{ fontSize: 12.5, color: muted, marginBottom: 18, lineHeight: 1.55 }}>Discover special ways to welcome your guests and make your celebration memorable. Totally optional — skip ahead if this isn't for you.</p>

      {selectedIds.length > 0 && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 12.5, color: "#16a34a", fontWeight: 600 }}>
          ✓ {selectedIds.length} idea{selectedIds.length > 1 ? "s" : ""} added to your plan
        </div>
      )}

      {ideas.length === 0 ? (
        <p style={{ fontSize: 12.5, color: muted, textAlign: "center", padding: "24px 0" }}>No specific entrance ideas for this event yet — that's fine, you can always skip ahead.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {ideas.map((idea) => (
            <EntryCard key={idea.id} idea={idea} selected={selectedIds.includes(idea.id)} occAccent={occAccent} onExplore={() => setOpenIdea(idea)} />
          ))}
        </div>
      )}

      {openIdea && (
        <DetailDrawer
          idea={openIdea}
          selected={selectedIds.includes(openIdea.id)}
          vendors={vendors}
          onToggleVendor={onToggleVendor}
          onToggleSelect={onToggleSelect}
          onClose={() => setOpenIdea(null)}
          onOpenRelated={(rel) => setOpenIdea(rel)}
          occAccent={occAccent}
        />
      )}
    </div>
  );
}

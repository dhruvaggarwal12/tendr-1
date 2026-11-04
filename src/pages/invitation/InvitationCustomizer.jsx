import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import { getTemplate } from "../../data/invitationTemplates";
import { getFlyerTemplate } from "../../data/flyerTemplates";
import Editable from "../../components/invitation/Editable";
import tendrLogoImg from "../../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";
const BASE_URL = import.meta.env.VITE_BASE_URL;

/* ─── Photo flyer — full-bleed template image with overlaid details (legacy
   external stock-photo gallery only; the 5 built-in templates live in
   src/components/invitation/templates/) ─────────────────────────────────── */
function PhotoFlyer({ template, data, onChange }) {
  return (
    <div style={{
      width: 460, minHeight: 660,
      borderRadius: 3,
      position: "relative",
      boxShadow: "0 12px 48px rgba(0,0,0,0.3)",
      overflow: "hidden",
      backgroundImage: `url(${template.image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,6,2,0.92) 0%, rgba(10,6,2,0.55) 42%, rgba(10,6,2,0.1) 68%, transparent 85%)" }} />

      {/* Brand mark */}
      <img src={tendrLogoImg} alt="tendr" style={{ position: "absolute", top: 18, left: 18, width: 72, height: "auto", zIndex: 6, pointerEvents: "none", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />

      <div style={{ position: "relative", zIndex: 5, padding: "40px 36px 34px", textAlign: "center", fontFamily: "Georgia, 'Times New Roman', serif", color: "#fff" }}>
        <p style={{ fontSize: 10.5, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", margin: "0 0 8px", fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>
          You're cordially invited to
        </p>

        <div style={{ marginBottom: 18 }}>
          <Editable
            value={data.eventTitle}
            onChange={v => onChange("eventTitle", v)}
            placeholder="Join us for a Special Celebration"
            style={{ fontSize: 20, letterSpacing: "0.02em", color: "#fff", fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, textAlign: "center" }}
          />
        </div>

        <div style={{ textAlign: "left" }}>
          {[
            { icon: "📅", label: "DATE",  key: "date",  placeholder: "Saturday, 15th June 2025" },
            { icon: "🕐", label: "TIME",  key: "time",  placeholder: "7:00 PM Onwards" },
            { icon: "📍", label: "VENUE", key: "venue", placeholder: "Venue name & full address" },
            { icon: "✉️", label: "RSVP",  key: "rsvp",  placeholder: "Optional note for guests" },
          ].map(({ icon, label, key, placeholder }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                {icon}
              </div>
              <div style={{ flex: 1, borderBottom: "1px dashed rgba(255,255,255,0.3)", paddingBottom: 2 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)", fontFamily: "'Outfit', sans-serif", textTransform: "uppercase" }}>{label}: </span>
                <Editable
                  value={data[key]}
                  onChange={v => onChange(key, v)}
                  placeholder={placeholder}
                  style={{ fontSize: 12.5, color: "#fff", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.01em", textAlign: "left" }}
                  width="calc(100% - 48px)"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function InvitationCustomizer() {
  const navigate = useNavigate();
  const { eventType, id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, token } = useSelector(s => s.auth || {});
  const selectedTemplate = eventType && id ? getTemplate(eventType, id) : null;
  // Built-in Tendr template — only relevant when there's no stock-photo
  // template selected; defaults to "botanical" (today's implicit default).
  const builtIn = !selectedTemplate ? (getFlyerTemplate(searchParams.get("template")) || getFlyerTemplate("botanical")) : null;

  const _ik = "tendr_invitation_draft";
  const [data, setData] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(_ik) || 'null'); return s?.data ?? { eventTitle: "", date: "", time: "", venue: "", rsvp: "", hostName: user?.name || "" }; } catch { return { eventTitle: "", date: "", time: "", venue: "", rsvp: "", hostName: user?.name || "" }; }
  });
  const [createdInvite, setCreatedInvite] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(_ik) || 'null'); return s?.createdInvite ?? null; } catch { return null; }
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const change = (k, v) => { setData(p => ({ ...p, [k]: v })); setCreatedInvite(null); };

  useEffect(() => {
    try { localStorage.setItem(_ik, JSON.stringify({ data, createdInvite })); } catch {}
  }, [data, createdInvite]);
  const allFilled = data.date && data.time && data.venue && data.hostName;

  const createInvite = async () => {
    if (!allFilled || creating) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch(`${BASE_URL}/house-party/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyName: data.eventTitle || "My Event",
          hostName: data.hostName,
          date: data.date,
          time: data.time,
          location: data.venue,
          note: data.rsvp,
          templateImage: selectedTemplate?.image || "",
          templateId: selectedTemplate ? `${eventType}/${selectedTemplate.id}` : (builtIn?.id || ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create invite");
      // The shared link points at the backend's /share preview page — WhatsApp/
      // Instagram etc. unfurl that page's server-rendered OG tags (flyer image,
      // event name) into a rich card, then redirect the real visitor straight
      // through to the actual RSVP page below.
      setCreatedInvite({ inviteId: json.inviteId, link: `${BASE_URL}/house-party/invite/${json.inviteId}/share` });

      // Attach this invite to the logged-in host's account so it shows up on their
      // Dashboard's "Guest List" tab — fire-and-forget, the flyer/RSVP link above
      // already works standalone even if this fails (e.g. logged-out host).
      if (token) {
        (async () => {
          try {
            const partyRes = await fetch(`${BASE_URL}/parties`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              credentials: "include",
              body: JSON.stringify({ eventName: data.eventTitle || "My Event", eventDate: data.date, venue: data.venue }),
            });
            const partyJson = await partyRes.json();
            if (!partyRes.ok || !partyJson.party?._id) return;
            await fetch(`${BASE_URL}/parties/${partyJson.party._id}/link`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              credentials: "include",
              body: JSON.stringify({ type: "invite", id: json.inviteId }),
            });
          } catch {}
        })();
      }
    } catch (e) {
      setCreateError(e.message || "Something went wrong — please try again");
    } finally {
      setCreating(false);
    }
  };

  const waText = createdInvite
    ? `You're Invited! ${data.eventTitle ? 'to ' + data.eventTitle : ''}\nDate: ${data.date}\nTime: ${data.time}\nVenue: ${data.venue}\n\nPlease RSVP here: ${createdInvite.link}`
    : `You're Invited! ${data.eventTitle ? 'to ' + data.eventTitle : ''}\nDate: ${data.date}\nTime: ${data.time}\nVenue: ${data.venue}${data.rsvp ? `\nRSVP: ${data.rsvp}` : ''}`;

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBE0", fontFamily: font }}>
      <SEO title="Invitation Flyer Customiser — Tendr" description="Customise your invitation flyer and get a shareable RSVP link." path="/invitation/customize" />
      {/* Load fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:wght@400;500;600;700&family=Dancing+Script:wght@600&display=swap" rel="stylesheet" />

      <HamburgerNav title="Invitation Flyer" />

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "-0.01em" }}>Customise Your Invitation</h1>
          <p style={{ fontSize: 13.5, color: "#7A5535", margin: 0 }}>Click any text on the flyer to edit it directly</p>
          {eventType ? (
            <Link to={`/invitation/templates/${eventType}`} style={{ fontSize: 12.5, color: "#C47A2E", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>Change template</Link>
          ) : (
            <Link to="/invitation" style={{ fontSize: 12.5, color: "#C47A2E", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>Browse templates</Link>
          )}
        </div>

        <div style={{ display: "flex", gap: 40, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* ── Centred flyer ── */}
          {selectedTemplate ? (
            <PhotoFlyer template={selectedTemplate} data={data} onChange={change} />
          ) : (
            <builtIn.Component data={data} editable onChange={change} />
          )}

          {/* ── Controls panel ── */}
          <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 14, flexShrink: 0 }}>

            {/* Quick fill */}
            <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: "20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 12px" }}>Quick Fill</h3>
              {[
                { key: "eventTitle", label: "Event / Occasion",  placeholder: "e.g. Birthday Celebration" },
                { key: "hostName",   label: "Your Name *",        placeholder: "e.g. Priya Sharma" },
                { key: "date",       label: "Date *",             placeholder: "e.g. 15th June 2025" },
                { key: "time",       label: "Time *",             placeholder: "e.g. 7:00 PM Onwards" },
                { key: "venue",      label: "Venue *",            placeholder: "Venue name & address" },
                { key: "rsvp",       label: "Note (optional)",    placeholder: "Dress code, parking, etc." },
              ].map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom: 11 }}>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{label}</label>
                  <input value={data[key]} onChange={e => change(key, e.target.value)} placeholder={placeholder}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>

            {/* Create invite & RSVP link */}
            <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: "20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Invite & RSVP</h3>
              <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.5 }}>Get a link guests can open to RSVP — no account needed, responses update live.</p>

              {!allFilled && <p style={{ fontSize: 11, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 10px", margin: "0 0 10px" }}>Fill your name, Date, Time & Venue to continue</p>}
              {createError && <p style={{ fontSize: 11, color: "#991B1B", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 10px", margin: "0 0 10px" }}>{createError}</p>}

              {createdInvite ? (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "12px", textAlign: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>🎉</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>Invite created!</div>
                    <div style={{ fontSize: 11, color: "#9B7450", marginTop: 3 }}>Share this link — guests RSVP instantly.</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <input readOnly value={createdInvite.link} onFocus={e => e.target.select()}
                      style={{ flex: 1, minWidth: 0, padding: "7px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 11.5, fontFamily: font, color: "#6B3A1F", background: "#fff" }} />
                    <button onClick={() => { navigator.clipboard?.writeText(createdInvite.link); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1800); }}
                      style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: linkCopied ? "rgba(196,122,46,0.15)" : "#fff", color: "#C47A2E", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
                      {linkCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <button onClick={() => navigate(`/house-party/invite/${createdInvite.inviteId}`)}
                    style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    View Live RSVPs →
                  </button>
                </div>
              ) : (
                <button disabled={!allFilled || creating} onClick={createInvite}
                  style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: allFilled ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: allFilled ? "#fff" : "#9ca3af", fontSize: 14, fontWeight: 800, cursor: allFilled ? "pointer" : "not-allowed", fontFamily: font, boxShadow: allFilled ? "0 3px 12px rgba(196,122,46,0.35)" : "none", marginBottom: 8 }}>
                  {creating ? "Creating…" : "Create Invite & Get RSVP Link →"}
                </button>
              )}

              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`)}
                style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1.5px solid rgba(37,211,102,0.4)", background: "rgba(37,211,102,0.07)", color: "#15803d", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                📲 Share via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

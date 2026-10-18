import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import JSZip from "jszip";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const gold = "#C47A2E";

const REPORT_SUBJECTS = [
  { key: "dancefloor", label: "Dance Floor",     emoji: "💃" },
  { key: "vibes",      label: "Overall Vibes",   emoji: "✨" },
  { key: "music",      label: "Music Selection", emoji: "🎵" },
  { key: "food",       label: "Food & Drinks",   emoji: "🍕" },
  { key: "host",       label: "Host Behaviour",  emoji: "👑" },
  { key: "drama",      label: "Drama Generated", emoji: "💀" },
  { key: "timeliness", label: "Leaving on Time", emoji: "⏰" },
];
const GRADE_MAP = { 5: "A+", 4: "A", 3: "B", 2: "C", 1: "D", 0: "—" };
const GRADE_COLOR = { "A+": "#22C55E", A: "#34D399", B: "#FBBF24", C: "#F97316", D: "#EF4444", "—": "#6B7280" };

export default function PartyRecap() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(s => s.auth || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null); // { party, invite, potluck, photoWall, gameHistory }
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const reportCardRef = useRef(null);
  const [downloadingCardPdf, setDownloadingCardPdf] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login", { state: { returnTo: `/house-party/recap/${partyId}` } }); return; }
    fetch(`${BASE_URL}/parties/${partyId}`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => setData(d))
      .catch(() => setError("Couldn't load this party — it may not exist, or belong to a different account."))
      .finally(() => setLoading(false));
  }, [token, partyId]);

  if (loading) return <Screen><p style={{ color: "#9B7450", textAlign: "center", padding: 60 }}>Loading…</p></Screen>;
  if (error) return <Screen><p style={{ color: "#c0392b", textAlign: "center", padding: 60 }}>{error}</p></Screen>;

  const { party, invite, photoWall, gameHistory } = data;
  const rsvps = invite?.rsvps || [];
  const yes = rsvps.filter(r => r.status === "yes");
  const maybe = rsvps.filter(r => r.status === "maybe");
  const no = rsvps.filter(r => r.status === "no");
  const photos = photoWall?.photos || [];
  const reportCard = party.toolData?.reportcard;
  const reportSubmitted = reportCard?.submitted && Object.keys(reportCard.ratings || {}).length === REPORT_SUBJECTS.length;
  const reportGrade = reportSubmitted ? (() => {
    const avg = REPORT_SUBJECTS.reduce((a, s) => a + (reportCard.ratings[s.key] || 0), 0) / REPORT_SUBJECTS.length;
    return avg >= 4.5 ? "A+" : avg >= 4 ? "A" : avg >= 3 ? "B" : avg >= 2 ? "C" : "D";
  })() : null;

  const downloadAllPhotos = async () => {
    if (!photos.length || zipping) return;
    setZipping(true);
    setZipProgress(0);
    try {
      const zip = new JSZip();
      for (let i = 0; i < photos.length; i++) {
        const res = await fetch(photos[i].url);
        const blob = await res.blob();
        const ext = (photos[i].url.split(".").pop() || "jpg").split("?")[0];
        zip.file(`photo-${i + 1}.${ext}`, blob);
        setZipProgress(Math.round(((i + 1) / photos.length) * 100));
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(party.eventName || "party-photos").replace(/[^a-z0-9]+/gi, "-")}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Zip download failed", e);
      alert("Couldn't build the zip — please try again.");
    }
    setZipping(false);
  };

  const downloadReportCardPdf = async () => {
    if (!reportCardRef.current || downloadingCardPdf) return;
    setDownloadingCardPdf(true);
    try {
      const canvas = await html2canvas(reportCardRef.current, { scale: 2, useCORS: true, backgroundColor: "#FFFBEB" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save("party-report-card.pdf");
    } catch (e) {
      console.error("Report card PDF failed", e);
    }
    setDownloadingCardPdf(false);
  };

  const waText = encodeURIComponent(
    `Thank you so much for being part of ${party.eventName || "the party"}! 🎉 It meant a lot having you there.` +
    (photos.length ? `\n\nHere are the photos from the night: ${window.location.origin}/house-party/photo-wall/${party.photoWallId}` : "")
  );

  return (
    <Screen>
      <SEO title={`${party.eventName || "Party"} — Memories`} description="Everything from your event, in one place." path={`/house-party/recap/${partyId}`} noIndex />
      <HamburgerNav title="Memories" />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 60px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px" }}>{party.eventName || "My House Party"}</h1>
          <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>
            {[party.eventDate, party.venue].filter(Boolean).join(" · ") || "No date or venue saved"}
          </p>
        </div>

        {/* Guest summary */}
        {rsvps.length > 0 && (
          <Section title="Who came" emoji="👥">
            <div style={{ display: "flex", gap: 10, marginBottom: yes.length ? 14 : 0 }}>
              <StatChip label="Yes" count={yes.length} color="#16A34A" />
              <StatChip label="Maybe" count={maybe.length} color="#D97706" />
              <StatChip label="No" count={no.length} color="#DC2626" />
            </div>
            {yes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {yes.map((r, i) => (
                  <span key={i} style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A", padding: "4px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600 }}>{r.name}</span>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Photo gallery */}
        {photos.length > 0 && (
          <Section title={`Photos (${photos.length})`} emoji="📸">
            <button onClick={downloadAllPhotos} disabled={zipping}
              style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "rgba(196,122,46,0.08)", color: gold, fontSize: 13, fontWeight: 700, cursor: zipping ? "default" : "pointer", fontFamily: font, marginBottom: 12, opacity: zipping ? 0.7 : 1 }}>
              {zipping ? `Zipping… ${zipProgress}%` : `⬇️ Download All (${photos.length}) as ZIP`}
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {photos.map((p, i) => (
                <a key={i} href={p.url} download target="_blank" rel="noopener noreferrer" style={{ display: "block", aspectRatio: "1", borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </a>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: "#9B7450", margin: "10px 0 0", textAlign: "center" }}>Tap any photo to save it — uploaded by {[...new Set(photos.map(p => p.uploadedBy))].join(", ")}</p>
          </Section>
        )}

        {/* Party report card */}
        {reportSubmitted && (
          <Section title="Party Report Card" emoji="📝">
            <div ref={reportCardRef} style={{ background: "#FFFBEB", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ background: "#DC2626", padding: "14px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Official Party Report Card</div>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Final Grade</div>
                    <div style={{ fontSize: 34, fontWeight: 900, color: GRADE_COLOR[reportGrade], lineHeight: 1 }}>{reportGrade}</div>
                  </div>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", border: `3px solid ${GRADE_COLOR[reportGrade]}`, display: "flex", alignItems: "center", justifyContent: "center", background: GRADE_COLOR[reportGrade] + "22" }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: GRADE_COLOR[reportGrade] }}>{reportGrade}</span>
                  </div>
                </div>
                {REPORT_SUBJECTS.map(s => {
                  const g = GRADE_MAP[reportCard.ratings[s.key] || 0];
                  return (
                    <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px dashed rgba(0,0,0,0.07)" }}>
                      <span style={{ fontSize: 13, minWidth: 20 }}>{s.emoji}</span>
                      <span style={{ flex: 1, fontSize: 12, color: "#374151" }}>{s.label}</span>
                      <span style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: GRADE_COLOR[g], borderRadius: 6, fontSize: 11, fontWeight: 900, color: "#fff" }}>{g}</span>
                    </div>
                  );
                })}
                {reportCard.comment && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#1F2937", fontStyle: "italic", lineHeight: 1.6 }}>"{reportCard.comment}"</div>
                )}
              </div>
            </div>
            <button onClick={downloadReportCardPdf} disabled={downloadingCardPdf}
              style={{ width: "100%", marginTop: 10, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "rgba(196,122,46,0.08)", color: gold, fontSize: 13, fontWeight: 700, cursor: downloadingCardPdf ? "default" : "pointer", fontFamily: font, opacity: downloadingCardPdf ? 0.7 : 1 }}>
              {downloadingCardPdf ? "Saving…" : "⬇️ Download as PDF"}
            </button>
          </Section>
        )}

        {/* Games played */}
        {gameHistory?.length > 0 && (
          <Section title="Games played that night" emoji="🎮">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {gameHistory.map((g, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fff", borderRadius: 10, border: "1px solid rgba(196,122,46,0.12)" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#2C1A0E" }}>{g.gameName}</span>
                  <span style={{ fontSize: 11.5, color: "#9B7450" }}>{g.players?.length || 0} players</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Thank-you composer */}
        {yes.length > 0 && (
          <Section title="Say thank you" emoji="💌">
            <p style={{ fontSize: 12.5, color: "#9B7450", margin: "0 0 12px", lineHeight: 1.5 }}>
              One message for everyone who came — includes the photo link if you have one.
            </p>
            <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 12, background: "#25D366", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              📲 Send Thank-You via WhatsApp
            </a>
          </Section>
        )}

        {rsvps.length === 0 && photos.length === 0 && !gameHistory?.length && !reportSubmitted && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#9B7450" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🕊️</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>Nothing to show yet — once guests RSVP, upload photos, or you play a game in the live room, it'll all land here.</p>
          </div>
        )}
      </div>
    </Screen>
  );
}

function Section({ title, emoji, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 13, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 7 }}>
        <span>{emoji}</span>{title}
      </h2>
      {children}
    </div>
  );
}

function StatChip({ label, count, color }) {
  return (
    <div style={{ flex: 1, background: `${color}14`, borderRadius: 12, padding: "10px 8px", textAlign: "center", border: `1px solid ${color}33` }}>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{count}</div>
      <div style={{ fontSize: 10.5, color: "#9B7450", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Screen({ children }) {
  return <div style={{ minHeight: "100dvh", background: "#F8F4EF", fontFamily: font }}>{children}</div>;
}

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getOccasionById } from "../../data/occasions";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const TABS = ["Overview", "Decor Ideas", "Gift Ideas", "Activities", "Checklist", "Community"];

export default function OccasionDetail() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("Overview");
  const [communityPhotos, setCommunityPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ caption: "", imageUrl: "" });
  const [uploadDone, setUploadDone] = useState(false);

  const occasion = getOccasionById(slug);

  // Admin-only
  if (!user?.isAdmin) { navigate("/"); return null; }
  if (!occasion) { navigate("/occasions"); return null; }

  // Fetch community photos for this occasion
  useEffect(() => {
    fetch(`${BASE_URL}/occasions/${slug}/photos`)
      .then(r => r.ok ? r.json() : { photos: [] })
      .then(d => setCommunityPhotos(d.photos || []))
      .catch(() => {});
  }, [slug]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.imageUrl.trim()) return;
    setUploading(true);
    try {
      await fetch(`${BASE_URL}/occasions/${slug}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ caption: uploadForm.caption, imageUrl: uploadForm.imageUrl }),
      });
      setUploadDone(true);
      setUploadForm({ caption: "", imageUrl: "" });
    } catch {}
    setUploading(false);
  };

  const fmtBudget = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title={`${occasion.name} — Tendr Occasions`} description={occasion.tagline} path={`/occasions/${slug}`} noIndex />
      <HamburgerNav active="Occasions" />

      {/* Hero */}
      <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
        <img src={occasion.coverImage} alt={occasion.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%)" }} />
        <div style={{ position: "absolute", bottom: 24, left: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 4 }}>{occasion.icon}</div>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
            {occasion.name}
          </h1>
          {occasion.localName && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{occasion.localName}</div>
          )}
        </div>
      </div>

      {/* Quick stats bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Typical guests", val: occasion.typicalGuests },
            { label: "Budget range", val: `${fmtBudget(occasion.budgetMin)} – ${fmtBudget(occasion.budgetMax)}` },
            { label: "Vendor types", val: occasion.vendorCategories.join(", ") },
          ].map(({ label, val }) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", overflowX: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", padding: "0 24px" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "14px 18px", border: "none", borderBottom: activeTab === tab ? "2.5px solid #C47A2E" : "2.5px solid transparent", background: "transparent", fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? "#C47A2E" : "#9B7450", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
              {tab} {tab === "Community" && communityPhotos.length > 0 && `(${communityPhotos.length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <p style={{ fontSize: 16, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 24px" }}>{occasion.tagline}</p>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Decor Themes</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {occasion.decorThemes.slice(0, 3).map(t => (
                  <div key={t.name} style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", border: "1.5px solid rgba(196,122,46,0.12)" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 3 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.5 }}>{t.desc}</div>
                  </div>
                ))}
                <button onClick={() => setActiveTab("Decor Ideas")}
                  style={{ fontSize: 12, color: "#C47A2E", background: "none", border: "none", cursor: "pointer", fontFamily: font, textAlign: "left", padding: 0, fontWeight: 700 }}>
                  See all {occasion.decorThemes.length} themes →
                </button>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Checklist Preview</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {occasion.checklist.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.3)", flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: "#5a3a1a", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
                <button onClick={() => setActiveTab("Checklist")}
                  style={{ fontSize: 12, color: "#C47A2E", background: "none", border: "none", cursor: "pointer", fontFamily: font, textAlign: "left", padding: 0, fontWeight: 700, marginTop: 4 }}>
                  Full checklist ({occasion.checklist.length} items) →
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => navigate(`/listings?serviceType=${occasion.vendorCategories[0]}`)}
                  style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Find Vendors →
                </button>
                <button onClick={() => navigate("/gift-hampers-cakes")}
                  style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Gift Hampers →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DECOR IDEAS ── */}
        {activeTab === "Decor Ideas" && (
          <div>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 24px" }}>
              {occasion.decorThemes.length} curated decor themes for {occasion.name}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {occasion.decorThemes.map((theme, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1.5px solid rgba(196,122,46,0.12)", boxShadow: "0 2px 12px rgba(196,122,46,0.06)" }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#2C1A0E", marginBottom: 6 }}>{theme.name}</div>
                  <div style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.6, marginBottom: 12 }}>{theme.desc}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(theme.tags || []).map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 9px" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, padding: "18px 22px", background: "rgba(196,122,46,0.06)", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>💡 Book a decorator</div>
              <div style={{ fontSize: 13, color: "#7A5535", marginBottom: 12 }}>Browse verified decorators who specialise in {occasion.vendorCategories.includes("Decorator") ? occasion.name.toLowerCase() : "events like this"}.</div>
              <button onClick={() => navigate("/listings?serviceType=Decorator")}
                style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                Browse Decorators →
              </button>
            </div>
          </div>
        )}

        {/* ── GIFT IDEAS ── */}
        {activeTab === "Gift Ideas" && (
          <div>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 24px" }}>
              {occasion.giftIdeas.length} curated gift ideas for {occasion.name}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {occasion.giftIdeas.map((gift, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 22px", border: "1.5px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(196,122,46,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    🎁
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 3 }}>{gift.name}</div>
                    <div style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.55, marginBottom: 6 }}>{gift.desc}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E" }}>{gift.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, padding: "18px 22px", background: "rgba(196,122,46,0.06)", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>🎁 Browse Tendr Gift Hampers</div>
              <div style={{ fontSize: 13, color: "#7A5535", marginBottom: 12 }}>Curated hampers delivered to your door — perfect for {occasion.name.toLowerCase()}.</div>
              <button onClick={() => navigate("/gift-hampers-cakes")}
                style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                View Gift Hampers →
              </button>
            </div>
          </div>
        )}

        {/* ── ACTIVITIES ── */}
        {activeTab === "Activities" && (
          <div>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 24px" }}>
              {occasion.activities.length} fun activity ideas to make the event memorable
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {occasion.activities.map((activity, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1.5px solid rgba(196,122,46,0.12)" }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>🎯</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 6 }}>{activity.name}</div>
                  <div style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.6 }}>{activity.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHECKLIST ── */}
        {activeTab === "Checklist" && (
          <div style={{ maxWidth: 640 }}>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 24px" }}>
              Complete checklist for planning your {occasion.name.toLowerCase()} — tick these off as you go.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {occasion.checklist.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 18px", background: "#fff", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.1)" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid rgba(196,122,46,0.3)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 0, background: "rgba(196,122,46,0.05)" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E" }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 14, color: "#2C1A0E", lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
              <button onClick={() => navigate("/booking")}
                style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                Start Planning →
              </button>
            </div>
          </div>
        )}

        {/* ── COMMUNITY ── */}
        {activeTab === "Community" && (
          <div>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 24px" }}>
              Real {occasion.name.toLowerCase()} photos shared by Tendr customers — inspiration from actual events.
            </p>

            {communityPhotos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.25)", marginBottom: 28 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>No photos yet</div>
                <div style={{ fontSize: 13, color: "#9B7450" }}>Be the first to share a {occasion.name.toLowerCase()} photo below.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
                {communityPhotos.map((p, i) => (
                  <div key={i} style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid rgba(196,122,46,0.12)" }}>
                    <img src={p.imageUrl} alt={p.caption || occasion.name}
                      style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                    {p.caption && (
                      <div style={{ padding: "10px 14px", background: "#fff", fontSize: 12, color: "#5a3a1a" }}>{p.caption}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload form */}
            {uploadDone ? (
              <div style={{ padding: "20px", background: "rgba(21,128,61,0.08)", borderRadius: 14, border: "1.5px solid rgba(21,128,61,0.2)", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>Photo submitted! It will appear here after review.</div>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1.5px solid rgba(196,122,46,0.15)" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>📸 Share your {occasion.name}</div>
                <div style={{ fontSize: 13, color: "#9B7450", marginBottom: 20 }}>Hosted a {occasion.name.toLowerCase()}? Share a photo — it helps others get inspired.</div>
                <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B3A1F", display: "block", marginBottom: 5 }}>Image URL *</label>
                    <input value={uploadForm.imageUrl} onChange={e => setUploadForm(p => ({ ...p, imageUrl: e.target.value }))}
                      placeholder="Paste a photo URL from Cloudinary, Google Photos, etc."
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B3A1F", display: "block", marginBottom: 5 }}>Caption (optional)</label>
                    <input value={uploadForm.caption} onChange={e => setUploadForm(p => ({ ...p, caption: e.target.value }))}
                      placeholder="e.g. Our daughter's first birthday — jungle theme"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <button type="submit" disabled={uploading || !uploadForm.imageUrl.trim()}
                    style={{ padding: "11px", borderRadius: 12, border: "none", background: uploading || !uploadForm.imageUrl.trim() ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: uploading || !uploadForm.imageUrl.trim() ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 700, cursor: uploading || !uploadForm.imageUrl.trim() ? "not-allowed" : "pointer", fontFamily: font }}>
                    {uploading ? "Submitting…" : "Submit Photo →"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

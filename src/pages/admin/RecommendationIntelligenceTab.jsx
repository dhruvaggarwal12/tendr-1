import React, { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const gold = "#C47A2E";
const darkBg = "#F8F4EF";
const cardBg = "#fff";

function adminFetch(path) {
  const token = localStorage.getItem("tendr_token");
  return fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  }).then(r => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  });
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: cardBg, borderRadius: 16, padding: "20px 22px", border: `1.5px solid ${accent ? "rgba(196,122,46,0.25)" : "rgba(0,0,0,0.07)"}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", fontFamily: font, minWidth: 130 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent ? gold : "#2C1A0E", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function pct(n) {
  return typeof n === "number" ? `${n.toFixed(1)}%` : "—";
}

export default function RecommendationIntelligenceTab() {
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminFetch("/recommendations/admin/stats"),
      adminFetch("/recommendations/admin/services"),
      adminFetch("/recommendations/admin/event-insights"),
    ])
      .then(([s, sv, ins]) => {
        setStats(s);
        setServices(sv);
        setInsights(ins);
        setLoading(false);
      })
      .catch(e => {
        setError(`Failed to load: ${e.message}`);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "60px 32px", textAlign: "center", fontFamily: font, color: "#9B7450" }}>
        Loading Recommendation Intelligence…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "60px 32px", textAlign: "center", fontFamily: font, color: "#e11d48" }}>
        {error}
      </div>
    );
  }

  const noData = !stats || stats.totalShown === 0;

  return (
    <div style={{ padding: "28px 32px", fontFamily: font, maxWidth: 1100, background: darkBg, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>📊 Recommendation Intelligence</h2>
        <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Tracks how customers interact with Tendr Smart Suggestions on the booking flow.</p>
      </div>

      {noData && (
        <div style={{ background: "#fff8f2", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 14, padding: "24px 28px", marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>No recommendation data yet</div>
          <div style={{ fontSize: 12, color: "#9B7450", marginTop: 4 }}>Data will appear here as customers use the booking flow with Smart Suggestions enabled.</div>
        </div>
      )}

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14, marginBottom: 32 }}>
        <StatCard label="Total Shown"      value={stats.totalShown?.toLocaleString() ?? 0} />
        <StatCard label="Clicked"          value={stats.totalClicked?.toLocaleString() ?? 0} />
        <StatCard label="Selected"         value={stats.totalSelected?.toLocaleString() ?? 0} />
        <StatCard label="Booked"           value={stats.totalBooked?.toLocaleString() ?? 0} accent />
        <StatCard label="Ignored"          value={stats.totalIgnored?.toLocaleString() ?? 0} />
        <StatCard label="Click-through Rate" value={pct(stats.ctr)} sub="Clicked ÷ Shown" accent />
        <StatCard label="Selection Rate"   value={pct(stats.selectionRate)} sub="Selected ÷ Shown" />
        <StatCard label="Booking Rate"     value={pct(stats.bookingRate)} sub="Booked ÷ Shown" accent />
      </div>

      {/* Top Recommended Services table */}
      <div style={{ background: cardBg, borderRadius: 18, border: "1.5px solid rgba(0,0,0,0.07)", marginBottom: 28, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: "1.5px solid rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>Top Recommended Services</div>
          <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>Breakdown by service type across all recommendation sessions</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8F4EF" }}>
                {["Service", "Shown", "Clicked", "Selected", "Booked", "Conversion %"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: h === "Service" ? "left" : "center", fontWeight: 700, color: "#2C1A0E", fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "#9B7450", fontSize: 13 }}>No service data yet.</td>
                </tr>
              )}
              {services.map((row, i) => (
                <tr key={row.name} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: i % 2 === 0 ? "#fff" : "#FAFAF8" }}>
                  <td style={{ padding: "11px 16px", fontWeight: 700, color: "#2C1A0E" }}>{row.name}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center", color: "#555" }}>{row.shown}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center", color: "#555" }}>{row.clicked}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center", color: "#555" }}>{row.selected}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center", fontWeight: 700, color: gold }}>{row.booked}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center" }}>
                    <span style={{ background: row.conversionPct > 10 ? "rgba(196,122,46,0.12)" : "rgba(0,0,0,0.04)", color: row.conversionPct > 10 ? gold : "#555", fontWeight: 700, borderRadius: 100, padding: "3px 10px", fontSize: 12 }}>
                      {row.conversionPct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event-type Insights */}
      <div style={{ background: cardBg, borderRadius: 18, border: "1.5px solid rgba(0,0,0,0.07)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: "1.5px solid rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>Event Type Insights</div>
          <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>What customers are planning and which services they pick</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8F4EF" }}>
                {["Event Type", "Sessions", "Avg Guests", "Top Services Selected"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: h === "Event Type" ? "left" : "center", fontWeight: 700, color: "#2C1A0E", fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {insights.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "24px 16px", textAlign: "center", color: "#9B7450", fontSize: 13 }}>No event data yet.</td>
                </tr>
              )}
              {insights.map((row, i) => (
                <tr key={row.eventType} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: i % 2 === 0 ? "#fff" : "#FAFAF8" }}>
                  <td style={{ padding: "11px 16px", fontWeight: 700, color: "#2C1A0E" }}>{row.eventType || "—"}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center", color: "#555" }}>{row.count}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center", color: "#555" }}>{row.avgGuests || "—"}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center" }}>
                    {row.topServices?.length > 0
                      ? row.topServices.map((s, si) => (
                          <span key={s} style={{ display: "inline-block", background: "rgba(196,122,46,0.1)", color: gold, borderRadius: 100, padding: "2px 10px", fontSize: 11, fontWeight: 700, margin: "2px 3px" }}>{s}</span>
                        ))
                      : <span style={{ color: "#bbb", fontSize: 12 }}>none yet</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

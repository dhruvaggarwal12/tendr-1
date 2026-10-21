import React, { useState, useEffect } from "react";

const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const INK = "#2C1A0E";
const MUTED = "#9B7450";

const STATUS_COLOR = { pending: "#C47A2E", approved: "#0EA5E9", processing: "#0EA5E9", paid: "#16A34A", rejected: "#DC2626", failed: "#DC2626" };
const STATUS_FLOW = { pending: "approved", approved: "processing", processing: "paid" };

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}
function inr(n) { return `₹${Number(n || 0).toLocaleString("en-IN")}`; }

export default function ReferralsTab({ token, BASE_URL }) {
  const [overview, setOverview] = useState(null);
  const [payouts, setPayouts] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const loadOverview = () => {
    fetch(`${BASE_URL}/admin/referral-overview`, { headers: authHeaders(token) })
      .then(r => r.json()).then(setOverview).catch(() => {});
  };
  const loadPayouts = () => {
    const q = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`${BASE_URL}/admin/payout-requests${q}`, { headers: authHeaders(token) })
      .then(r => r.json()).then(d => setPayouts(d.payouts || [])).catch(() => {});
  };

  useEffect(loadOverview, [token, BASE_URL]); // eslint-disable-line
  useEffect(loadPayouts, [token, BASE_URL, statusFilter]); // eslint-disable-line

  const updateStatus = async (id, status) => {
    await fetch(`${BASE_URL}/admin/payout-requests/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ status }) });
    loadPayouts();
    loadOverview();
  };

  return (
    <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-6 overflow-y-auto">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, fontFamily: F, marginBottom: 4 }}>🎁 Referrals</h2>
      <p style={{ fontSize: 13, color: MUTED, fontFamily: F, marginBottom: 20 }}>Who has a code, what's been earned, and what Tendr still owes.</p>

      {overview && (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
            {[
              ["Total customers", overview.totalCustomers],
              ["Used a referral code", overview.customersWhoUsedACode],
              ["Have referred someone", overview.referrersWithAtLeastOneCredit],
              ["Earned all-time", inr(overview.totalEverEarned)],
              ["Currently owed (unwithdrawn)", inr(overview.totalCurrentlyOwed)],
              ["Paid out", inr(overview.totalPaidOut)],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(196,122,46,0.15)", padding: "14px 18px", minWidth: 150 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: INK, marginTop: 4 }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {Object.entries(overview.payoutsByStatus).map(([status, d]) => (
              <div key={status} style={{ background: "#fff", borderRadius: 10, border: `1px solid ${STATUS_COLOR[status]}40`, padding: "8px 14px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[status], textTransform: "capitalize" }}>{status}</span>
                <span style={{ fontSize: 11, color: MUTED, marginLeft: 6 }}>{d.count} · {inr(d.total)}</span>
              </div>
            ))}
          </div>

          {overview.topReferrers?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: INK, fontFamily: F, marginBottom: 10 }}>Top referrers</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {overview.topReferrers.map(r => (
                  <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#fff", borderRadius: 9, border: "1px solid rgba(196,122,46,0.12)" }}>
                    <div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{r.name}</span>
                      <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>{r.phoneNumber}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: MUTED }}>
                      <strong style={{ color: INK }}>{r.referralCount}</strong> referred · wallet {inr(r.referralWalletBalance)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 800, color: INK, fontFamily: F, marginBottom: 10 }}>Withdrawal requests</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {["", "pending", "approved", "processing", "paid", "rejected", "failed"].map(s => (
          <button key={s || "all"} onClick={() => setStatusFilter(s)}
            style={{ padding: "5px 13px", borderRadius: 100, border: `1.5px solid ${statusFilter === s ? GOLD : "rgba(196,122,46,0.2)"}`, background: statusFilter === s ? "rgba(196,122,46,0.1)" : "#fff", color: statusFilter === s ? GOLD : MUTED, fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: F, textTransform: "capitalize" }}>
            {s || "All"}
          </button>
        ))}
      </div>

      {payouts === null ? <p style={{ fontFamily: F, color: MUTED }}>Loading…</p> : payouts.length === 0 ? (
        <p style={{ fontFamily: F, color: MUTED, fontSize: 13 }}>No withdrawal requests{statusFilter ? ` with status "${statusFilter}"` : ""}.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {payouts.map(p => {
            const nextStatus = STATUS_FLOW[p.status];
            const final = ["paid", "rejected", "failed"].includes(p.status);
            return (
              <div key={p._id} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(196,122,46,0.15)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{p.consumerId?.name || "Unknown"} <span style={{ fontWeight: 500, color: MUTED }}>· {p.consumerId?.phoneNumber}</span></div>
                  <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{inr(p.amount)} → {p.upiId} · {new Date(p.createdAt).toLocaleDateString("en-IN")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: STATUS_COLOR[p.status], textTransform: "uppercase", letterSpacing: "0.04em", padding: "3px 10px", borderRadius: 100, background: `${STATUS_COLOR[p.status]}18` }}>{p.status}</span>
                  {!final && (
                    <>
                      {nextStatus && (
                        <button onClick={() => updateStatus(p._id, nextStatus)}
                          style={{ fontSize: 11, fontWeight: 700, padding: "5px 11px", borderRadius: 8, border: "none", background: GOLD, color: "#fff", cursor: "pointer", fontFamily: F, textTransform: "capitalize" }}>
                          Mark {nextStatus}
                        </button>
                      )}
                      <button onClick={() => updateStatus(p._id, "rejected")}
                        style={{ fontSize: 11, fontWeight: 700, padding: "5px 11px", borderRadius: 8, border: "1.5px solid rgba(220,38,38,0.3)", background: "#fff", color: "#DC2626", cursor: "pointer", fontFamily: F }}>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

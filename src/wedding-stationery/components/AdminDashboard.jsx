import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STATUSES = ["Pending", "In Design", "Sent"];
const STATUS_COLORS = {
  "Pending":   { bg: "#FFF8EC", color: "#C9A84C", border: "#F0DFA0" },
  "In Design": { bg: "#EEF4FF", color: "#4A6EBE", border: "#B8CCEE" },
  "Sent":      { bg: "#EDF7EE", color: "#3A8A40", border: "#B0D8B2" },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("ws_orders") || "[]");
    setOrders(stored);
  }, []);

  const updateStatus = (orderId, newStatus) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem("ws_orders", JSON.stringify(updated));
  };

  const deleteOrder = (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    const updated = orders.filter(o => o.orderId !== orderId);
    setOrders(updated);
    localStorage.setItem("ws_orders", JSON.stringify(updated));
  };

  const filtered = orders
    .filter(o => filter === "All" || o.status === filter)
    .filter(o => !search || o.customer.name.toLowerCase().includes(search.toLowerCase()) || o.orderId.toLowerCase().includes(search.toLowerCase()) || o.stationery.name.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    inDesign: orders.filter(o => o.status === "In Design").length,
    sent: orders.filter(o => o.status === "Sent").length,
    revenue: orders.reduce((s, o) => s + (o.total || 0), 0),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "'Lato', sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#1C1C1C", padding: "20px 36px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: "#FAF7F2", margin: 0, letterSpacing: "0.05em" }}>
            Orders Dashboard
          </h1>
          <p style={{ fontSize: 12, color: "#9B8C78", margin: "2px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Wedding Stationery Studio
          </p>
        </div>
        <button onClick={() => navigate("/wedding")}
          style={{ fontSize: 13, color: "#C9A84C", background: "none", border: "1px solid #C9A84C", borderRadius: 4, padding: "8px 18px", cursor: "pointer", fontFamily: "'Lato', sans-serif" }}>
          ← Back to Studio
        </button>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            ["Total Orders", stats.total, "#C9A84C"],
            ["Pending", stats.pending, "#E8A028"],
            ["In Design", stats.inDesign, "#4A6EBE"],
            ["Sent", stats.sent, "#3A8A40"],
            ["Total Revenue", `₹${stats.revenue.toLocaleString("en-IN")}`, "#1C1C1C"],
          ].map(([label, value, color]) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #EDE6D8", borderRadius: 8, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9B8C78", margin: "0 0 6px" }}>{label}</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["All", ...STATUSES].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                style={{
                  padding: "7px 18px", borderRadius: 100, fontSize: 13, cursor: "pointer", fontFamily: "'Lato', sans-serif",
                  background: filter === s ? "#1C1C1C" : "transparent",
                  color: filter === s ? "#fff" : "#6B5E52",
                  border: filter === s ? "1px solid #1C1C1C" : "1px solid #D4C8B8",
                  transition: "all 0.15s",
                }}>
                {s} {s !== "All" ? `(${orders.filter(o => o.status === s).length})` : `(${orders.length})`}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, order ID, type..."
            style={{ padding: "9px 14px", border: "1.5px solid #EDE6D8", borderRadius: 6, fontSize: 13, fontFamily: "'Lato', sans-serif", color: "#1C1C1C", background: "#fff", outline: "none", width: 260 }}
            onFocus={e => (e.currentTarget.style.borderColor = "#C9A84C")}
            onBlur={e => (e.currentTarget.style.borderColor = "#EDE6D8")} />
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #EDE6D8", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ color: "#9B8C78", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
                {orders.length === 0 ? "No orders yet." : "No orders match your filter."}
              </p>
              {orders.length === 0 && (
                <button onClick={() => navigate("/wedding")}
                  style={{ marginTop: 12, color: "#C9A84C", background: "none", border: "none", cursor: "pointer", fontFamily: "'Lato', sans-serif", fontSize: 13, textDecoration: "underline" }}>
                  View Stationery Studio →
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #EDE6D8", background: "#FDFAF6" }}>
                  {["Order ID", "Customer", "Stationery", "Palette / Font", "Qty", "Total", "Placed", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B8C78" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <tr key={order.orderId} style={{ borderBottom: "1px solid #EDE6D8", background: i % 2 === 0 ? "#fff" : "#FDFAF6", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FAF5EC")}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#FDFAF6")}>
                    <td style={{ padding: "13px 16px", fontSize: 12, fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C", fontWeight: 600 }}>{order.orderId}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1C" }}>{order.customer.name}</div>
                      <div style={{ fontSize: 11, color: "#9B8C78" }}>{order.customer.email}</div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#1C1C1C" }}>{order.stationery.name}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: 12, color: "#6B5E52" }}>{order.design?.palette}</div>
                      <div style={{ fontSize: 11, color: "#9B8C78" }}>{order.design?.font?.split("+")[0].trim()}</div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#1C1C1C", fontWeight: 600 }}>{order.quantity}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontFamily: "'Cormorant Garamond', serif", color: "#1C1C1C", fontWeight: 600 }}>₹{order.total?.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#9B8C78" }}>
                      {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <select value={order.status} onChange={e => updateStatus(order.orderId, e.target.value)}
                        style={{
                          padding: "5px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, border: `1px solid ${STATUS_COLORS[order.status]?.border || "#EDE6D8"}`,
                          background: STATUS_COLORS[order.status]?.bg || "#fff",
                          color: STATUS_COLORS[order.status]?.color || "#1C1C1C",
                          cursor: "pointer", fontFamily: "'Lato', sans-serif",
                        }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button onClick={() => deleteOrder(order.orderId)}
                        style={{ fontSize: 11, color: "#C0392B", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "'Lato', sans-serif" }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ fontSize: 11, color: "#B8A898", marginTop: 16, textAlign: "center" }}>
          Orders are stored locally in your browser · {orders.length} total order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logos/tendr-logo-secondary.png";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const STATUS_TABS = [
  { key: "all",       label: "All" },
  { key: "Pending",   label: "Pending" },
  { key: "Confirmed", label: "Confirmed" },
  { key: "Completed", label: "Completed" },
  { key: "Cancelled", label: "Cancelled" },
];

const STATUS_STYLE = {
  Pending:   "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-green-100 text-green-800",
  Completed: "bg-blue-100 text-blue-800",
  Cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_STYLE = {
  Paid:    "text-green-600",
  Pending: "text-yellow-600",
  Refunded:"text-gray-400",
};

export default function VendorBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("all");
  const [search, setSearch]     = useState("");
  const [acting, setActing]     = useState(null); // bookingId currently being actioned
  const [toast, setToast]       = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch(`${BASE_URL}/vendor/bookings`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setBookings(Array.isArray(d) ? d : d.data || []))
      .catch(() => showToast("Failed to load bookings", false))
      .finally(() => setLoading(false));
  }, []);

  const action = async (id, act) => {
    setActing(id);
    try {
      const r = await fetch(`${BASE_URL}/vendor/bookings/${id}/${act}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error();
      const newStatus = act === "accept" ? "Confirmed" : act === "complete" ? "Completed" : "Cancelled";
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: newStatus } : b));
      showToast(act === "accept" ? "Booking confirmed!" : act === "complete" ? "Marked as completed!" : "Booking declined");
    } catch {
      showToast("Action failed. Please try again.", false);
    } finally {
      setActing(null);
    }
  };

  const visible = bookings
    .filter(b => tab === "all" || b.status === tab)
    .filter(b => !search || b.customerName?.toLowerCase().includes(search.toLowerCase()) || b.eventType?.toLowerCase().includes(search.toLowerCase()));

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "12px 20px", borderRadius: 12, background: toast.ok ? "#16a34a" : "#dc2626", color: "#fff", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}>
          {toast.ok ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/vendor/dashboard")} className="text-yellow-700 hover:text-yellow-900 font-semibold text-sm">
              ← Dashboard
            </button>
            <img src={logo} alt="tendr" className="h-9" />
            <span className="text-xl font-bold text-gray-800">Bookings</span>
          </div>
          <div className="text-sm text-gray-500">{bookings.length} total booking{bookings.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Summary pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[["Pending", "🟡"], ["Confirmed", "🟢"], ["Completed", "🔵"], ["Cancelled", "🔴"]].map(([s, e]) => counts[s] ? (
            <div key={s} className="bg-white rounded-xl px-4 py-2 shadow-sm flex items-center gap-2 text-sm">
              <span>{e}</span>
              <span className="font-bold text-gray-800">{counts[s]}</span>
              <span className="text-gray-500">{s}</span>
            </div>
          ) : null)}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-wrap flex-1">
            {STATUS_TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${tab === key ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {label}
                {key !== "all" && counts[key] ? <span className="ml-1.5 text-xs opacity-70">({counts[key]})</span> : null}
              </button>
            ))}
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or event…"
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 min-w-0 w-full sm:w-56"
          />
        </div>

        {/* Bookings list */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading bookings…</div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <div className="text-gray-600 font-semibold text-lg mb-1">
              {tab === "all" && !search ? "No bookings yet" : "No bookings match this filter"}
            </div>
            <div className="text-gray-400 text-sm">
              {tab === "all" && !search ? "When customers book you, they'll appear here." : "Try a different tab or clear the search."}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left: Customer + event info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-lg flex-shrink-0">
                      {b.customerName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-base">{b.customerName || "Unknown"}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_STYLE[b.status] || "bg-gray-100 text-gray-600"}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                        {b.eventType && <span>🎉 {b.eventType}</span>}
                        {b.eventDate && <span>📅 {new Date(b.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                        {b.guestCount && <span>👥 {b.guestCount} guests</span>}
                        {b.timeSlot && <span>⏰ {b.timeSlot}</span>}
                      </div>
                      {b.notes && <div className="mt-1.5 text-sm text-gray-500 italic">"{b.notes}"</div>}
                    </div>
                  </div>

                  {/* Right: Amount + actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      {b.amount != null && (
                        <div className="text-xl font-bold text-gray-800">₹{b.amount?.toLocaleString("en-IN")}</div>
                      )}
                      {b.paymentStatus && (
                        <div className={`text-xs font-semibold mt-0.5 ${PAYMENT_STYLE[b.paymentStatus] || "text-gray-500"}`}>
                          {b.paymentStatus}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {b.status === "Pending" && (
                        <>
                          <button
                            onClick={() => action(b.id, "accept")}
                            disabled={acting === b.id}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                          >
                            {acting === b.id ? "…" : "✓ Accept"}
                          </button>
                          <button
                            onClick={() => action(b.id, "decline")}
                            disabled={acting === b.id}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {b.status === "Confirmed" && (
                        <button
                          onClick={() => action(b.id, "complete")}
                          disabled={acting === b.id}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                          {acting === b.id ? "…" : "Mark Completed"}
                        </button>
                      )}
                      {(b.status === "Completed" || b.status === "Cancelled") && (
                        <span className="text-xs text-gray-400 font-medium py-2">No actions</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

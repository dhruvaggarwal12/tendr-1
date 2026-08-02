import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../assets/logos/tendr-logo-secondary.png";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const LOCATION_OPTIONS = [
  "Delhi", "Noida", "Gurgaon", "Ghaziabad",
  "Greater Noida", "South Delhi", "North Delhi", "East Delhi", "West Delhi",
];

const SERVICE_TYPE_LABELS = {
  DJ: "DJ", Decorator: "Decorator", Photographer: "Photographer",
  Caterer: "Caterer", GiftHamper: "Gift Hamper", Cake: "Cake",
};

export default function VendorProfile() {
  const navigate   = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const vendorId   = user?._id || user?.id;
  const fileRef    = useRef();

  const [tab, setTab]       = useState("info");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]       = useState(null);
  const [profile, setProfile]   = useState(null);

  const [form, setForm] = useState({
    name: "", yearsOfExperience: "", teamSize: "",
    upiId: "", city: "", state: "",
  });
  const [locations, setLocations] = useState([]);
  const [locInput, setLocInput]   = useState("");

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!vendorId) return;
    fetch(`${BASE_URL}/vendors/${vendorId}`, { credentials: "include" })
      .then(r => r.json())
      .then(v => {
        setProfile(v);
        setForm({
          name: v.name || "",
          yearsOfExperience: v.yearsOfExperience ?? "",
          teamSize: v.teamSize ?? "",
          upiId: v.upiId || "",
          city: v.address?.city || "",
          state: v.address?.state || "",
        });
        setLocations(v.locations || []);
      })
      .catch(() => showToast("Failed to load profile", false))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveInfo = async () => {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        teamSize: Number(form.teamSize) || 0,
        upiId: form.upiId,
        locations,
        address: { city: form.city, state: form.state },
      };
      const r = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      showToast("Profile saved!");
    } catch {
      showToast("Failed to save. Try again.", false);
    } finally {
      setSaving(false);
    }
  };

  const addLocation = (loc) => {
    if (loc && !locations.includes(loc)) setLocations(l => [...l, loc]);
    setLocInput("");
  };
  const removeLocation = (loc) => setLocations(l => l.filter(x => x !== loc));

  const uploadPhotos = async (files) => {
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("photos", f));
    try {
      const r = await fetch(`${BASE_URL}/vendors/${vendorId}/portfolio-photos`, {
        method: "POST", credentials: "include", body: fd,
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Upload failed");
      setProfile(p => ({ ...p, portfolioPhotos: json.portfolioPhotos }));
      showToast(`${files.length} photo${files.length > 1 ? "s" : ""} uploaded!`);
    } catch (e) {
      showToast(e.message || "Upload failed", false);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deletePhoto = async (url) => {
    const publicId = url.split("/").pop().split(".")[0];
    try {
      const r = await fetch(`${BASE_URL}/vendors/${vendorId}/portfolio-photos/${publicId}`, {
        method: "DELETE", credentials: "include",
      });
      if (!r.ok) throw new Error();
      setProfile(p => ({ ...p, portfolioPhotos: p.portfolioPhotos.filter(u => u !== url) }));
      showToast("Photo removed");
    } catch {
      showToast("Failed to remove photo", false);
    }
  };

  const photos = profile?.portfolioPhotos || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading profile…</div>
      </div>
    );
  }

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
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/vendor/dashboard")} className="text-yellow-700 hover:text-yellow-900 font-semibold text-sm flex items-center gap-1">
              ← Dashboard
            </button>
            <img src={logo} alt="tendr" className="h-9" />
            <span className="text-xl font-bold text-gray-800">My Profile</span>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
            {SERVICE_TYPE_LABELS[profile?.serviceType] || profile?.serviceType || "Vendor"}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {[["info", "Business Info"], ["portfolio", "Portfolio Photos"], ["bank", "Bank & Payments"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${tab === id ? "bg-yellow-500 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Business Info Tab ── */}
        {tab === "info" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Business Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Business Name</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Service Type</label>
                <input value={SERVICE_TYPE_LABELS[profile?.serviceType] || profile?.serviceType || "—"} disabled className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Years of Experience</label>
                <input type="number" min="0" value={form.yearsOfExperience} onChange={e => set("yearsOfExperience", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Team Size</label>
                <input type="number" min="1" value={form.teamSize} onChange={e => set("teamSize", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">City</label>
                <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="e.g. Noida" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">State</label>
                <input value={form.state} onChange={e => set("state", e.target.value)} placeholder="e.g. Uttar Pradesh" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
              </div>
            </div>

            {/* Service areas */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Service Areas</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {locations.map(loc => (
                  <span key={loc} className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {loc}
                    <button onClick={() => removeLocation(loc)} className="text-yellow-600 hover:text-yellow-900 leading-none">×</button>
                  </span>
                ))}
                {locations.length === 0 && <span className="text-sm text-gray-400">No areas added yet</span>}
              </div>
              <div className="flex gap-2">
                <select value={locInput} onChange={e => setLocInput(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm">
                  <option value="">Select an area to add…</option>
                  {LOCATION_OPTIONS.filter(l => !locations.includes(l)).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <button onClick={() => addLocation(locInput)} disabled={!locInput} className="px-5 py-2.5 bg-yellow-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-yellow-600 transition-colors">
                  Add
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={saveInfo} disabled={saving} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* ── Portfolio Tab ── */}
        {tab === "portfolio" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Portfolio Photos</h2>
                <p className="text-sm text-gray-500 mt-1">{photos.length}/10 photos · Customers see these on your profile</p>
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => uploadPhotos(e.target.files)} />
                <button onClick={() => fileRef.current?.click()} disabled={uploading || photos.length >= 10} className="px-5 py-2.5 bg-yellow-500 text-white rounded-xl font-semibold text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50">
                  {uploading ? "Uploading…" : photos.length >= 10 ? "Max reached" : "+ Upload Photos"}
                </button>
              </div>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-4xl mb-3">📷</div>
                <div className="text-gray-500 font-medium">No portfolio photos yet</div>
                <div className="text-gray-400 text-sm mt-1">Upload photos to showcase your work to customers</div>
                <button onClick={() => fileRef.current?.click()} className="mt-4 px-6 py-2.5 bg-yellow-500 text-white rounded-xl font-semibold text-sm hover:bg-yellow-600 transition-colors">
                  Upload First Photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((url, i) => (
                  <div key={url} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                    <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => deletePhoto(url)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        Remove
                      </button>
                    </div>
                    {i === 0 && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
                {photos.length < 10 && (
                  <button onClick={() => fileRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-yellow-400 hover:text-yellow-500 transition-colors">
                    <span className="text-3xl mb-1">+</span>
                    <span className="text-sm font-medium">Add Photo</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Bank & Payments Tab ── */}
        {tab === "bank" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Bank & Payments</h2>
            <p className="text-sm text-gray-500 mb-6">Earnings are transferred to your registered bank account after each confirmed event.</p>

            {/* UPI */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">UPI ID</label>
              <div className="flex gap-2">
                <input value={form.upiId} onChange={e => set("upiId", e.target.value)} placeholder="yourname@upi" className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                <button onClick={saveInfo} disabled={saving} className="px-5 py-3 bg-yellow-500 text-white rounded-xl font-semibold text-sm hover:bg-yellow-600 transition-colors disabled:opacity-60">
                  {saving ? "…" : "Save"}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-gray-800">Bank Account Details</div>
                  <div className="text-sm text-gray-500">For NEFT/RTGS payouts</div>
                </div>
              </div>
              <BankDetailsForm vendorId={vendorId} showToast={showToast} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BankDetailsForm({ vendorId, showToast }) {
  const [bank, setBank]     = useState({ accountHolder: "", accountNumber: "", ifsc: "", bankName: "" });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    fetch(`${BASE_URL}/vendors/${vendorId}/bank-details`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setBank({ accountHolder: d.accountHolder || "", accountNumber: d.accountNumber || "", ifsc: d.ifsc || "", bankName: d.bankName || "" });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [vendorId]);

  const setF = (k, v) => setBank(b => ({ ...b, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${BASE_URL}/vendors/${vendorId}/bank-details`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bank),
      });
      if (!r.ok) throw new Error();
      showToast("Bank details saved!");
    } catch {
      showToast("Failed to save bank details", false);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Account Holder Name</label>
        <input value={bank.accountHolder} onChange={e => setF("accountHolder", e.target.value)} placeholder="As per bank records" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Bank Name</label>
        <input value={bank.bankName} onChange={e => setF("bankName", e.target.value)} placeholder="e.g. HDFC Bank" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Account Number</label>
        <input value={bank.accountNumber} onChange={e => setF("accountNumber", e.target.value)} placeholder="Account number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">IFSC Code</label>
        <input value={bank.ifsc} onChange={e => setF("ifsc", e.target.value.toUpperCase())} placeholder="e.g. HDFC0001234" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
      </div>
      <div className="md:col-span-2 flex justify-end mt-2">
        <button onClick={save} disabled={saving} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
          {saving ? "Saving…" : "Save Bank Details"}
        </button>
      </div>
    </div>
  );
}

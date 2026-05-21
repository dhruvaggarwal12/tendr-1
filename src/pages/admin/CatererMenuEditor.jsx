import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const COURSES = ["Starters", "Mains", "Breads", "Rice", "Desserts", "Beverages"];

// Default dish suggestions per cuisine
const DEFAULT_DISHES = {
  "North Indian": {
    Starters:   ["Paneer Tikka", "Veg Seekh Kebab", "Hara Bhara Kebab", "Dahi Ke Sholay", "Aloo Tikki", "Veg Shammi Kebab"],
    Mains:      ["Dal Makhani", "Paneer Butter Masala", "Shahi Paneer", "Palak Paneer", "Kadhai Paneer", "Aloo Jeera", "Mixed Veg", "Matar Paneer"],
    Breads:     ["Butter Naan", "Tandoori Roti", "Laccha Paratha", "Kulcha", "Puri"],
    Rice:       ["Steamed Rice", "Jeera Rice", "Veg Biryani", "Veg Pulao"],
    Desserts:   ["Gulab Jamun", "Gajar Ka Halwa", "Kheer", "Jalebi", "Rasgulla", "Rasmalai"],
    Beverages:  ["Sweet Lassi", "Salted Lassi", "Buttermilk", "Sharbat"],
  },
  "South Indian": {
    Starters:   ["Medu Vada", "Rava Idli", "Mini Dosa", "Veg Cutlet", "Paniyaram"],
    Mains:      ["Sambar", "Rasam", "Avial", "Kootu", "Pulissery", "Kerala Veg Curry"],
    Breads:     ["Appam", "Kerala Parotta", "Idiyappam"],
    Rice:       ["Steamed Rice", "Tamarind Rice", "Lemon Rice", "Curd Rice"],
    Desserts:   ["Payasam", "Kesari", "Pongal"],
    Beverages:  ["Filter Coffee", "Tender Coconut"],
  },
  "Punjabi": {
    Starters:   ["Amritsari Fish Tikka", "Paneer Pakoda", "Makki Roti Bites"],
    Mains:      ["Sarson Da Saag", "Chole Masala", "Rajma Masala", "Paneer Bhurji", "Kadhi Pakoda"],
    Breads:     ["Makki Di Roti", "Tandoori Naan", "Butter Paratha"],
    Rice:       ["Jeera Rice", "Veg Pulao"],
    Desserts:   ["Phirni", "Pinni", "Gajrela"],
    Beverages:  ["Mango Lassi", "Sweet Lassi", "Chaas"],
  },
  "Snacks": {
    Starters:   ["Pani Puri", "Bhel Puri", "Sev Puri", "Dahi Puri", "Samosa", "Kachori", "Vada Pav"],
    Mains:      [],
    Breads:     [],
    Rice:       [],
    Desserts:   ["Rabri Falooda", "Kulfi"],
    Beverages:  ["Masala Chai", "Cold Coffee"],
  },
  "Chinese Starters": {
    Starters:   ["Veg Manchurian", "Chilli Paneer", "Veg Spring Roll", "Crispy Corn", "Chilli Mushroom", "Dimsums"],
    Mains:      ["Hakka Noodles", "Fried Rice", "Manchow Soup", "Sweet Corn Soup"],
    Breads:     [],
    Rice:       ["Veg Fried Rice", "Schezwan Fried Rice"],
    Desserts:   ["Honey Chilli Potatoes", "Toffee Banana"],
    Beverages:  [],
  },
  "Desserts": {
    Starters:   [],
    Mains:      [],
    Breads:     [],
    Rice:       [],
    Desserts:   ["Gulab Jamun", "Rasgulla", "Rasmalai", "Kheer", "Gajar Halwa", "Jalebi", "Rabri", "Ice Cream", "Kulfi", "Brownie", "Pastry", "Fruit Custard"],
    Beverages:  ["Sharbat", "Sherbet", "Mocktail"],
  },
  "Italian": {
    Starters:   ["Bruschetta", "Garlic Bread", "Caprese Salad", "Stuffed Mushrooms"],
    Mains:      ["Pasta Arrabbiata", "Pasta Alfredo", "Penne Pesto", "Veg Pizza", "Risotto"],
    Breads:     ["Focaccia", "Garlic Baguette"],
    Rice:       ["Risotto"],
    Desserts:   ["Tiramisu", "Panna Cotta", "Gelato"],
    Beverages:  ["Lemonade", "Iced Tea"],
  },
};

function CourseSection({ course, items, onAdd, onDelete, suggestions }) {
  const [newName, setNewName] = useState("");
  const [isVeg, setIsVeg] = useState(true);

  const handleAdd = (name, veg = true) => {
    if (!name.trim()) return;
    onAdd({ id: `${Date.now()}_${Math.random()}`, name: name.trim(), course, isVeg: veg });
    setNewName("");
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <span>{course}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#9B7450", textTransform: "none", letterSpacing: 0 }}>({items.length} dishes)</span>
      </div>

      {/* Existing dishes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {items.map(item => (
          <span key={item.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: item.isVeg ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${item.isVeg ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, fontSize: 12, color: "#2C1A0E" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.isVeg ? "#22c55e" : "#ef4444", flexShrink: 0 }} />
            {item.name}
            <button onClick={() => onDelete(item.id)} style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1, marginLeft: 2 }}>✕</button>
          </span>
        ))}
        {items.length === 0 && <span style={{ fontSize: 11, color: "#bbb" }}>No dishes yet</span>}
      </div>

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#9B7450", marginBottom: 5 }}>Quick add:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {suggestions.filter(s => !items.find(i => i.name === s)).map(s => (
              <button key={s} onClick={() => handleAdd(s)}
                style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, border: "1.5px dashed rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", cursor: "pointer", fontFamily: font }}>
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual add */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd(newName, isVeg)}
          placeholder={`Add ${course.toLowerCase()} dish…`}
          style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", fontFamily: font, fontSize: 12, outline: "none" }} />
        <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11, color: "#2C1A0E", whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={isVeg} onChange={e => setIsVeg(e.target.checked)} style={{ accentColor: "#22c55e" }} />
          Veg
        </label>
        <button onClick={() => handleAdd(newName, isVeg)}
          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
          Add
        </button>
      </div>
    </div>
  );
}

export default function CatererMenuEditor({ vendor, onClose }) {
  const { token } = useSelector(s => s.auth);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/admin/vendors/${vendor._id}/menu`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then(r => r.ok ? r.json() : { menuItems: [] })
      .then(data => { setMenuItems(data.menuItems || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [vendor._id]);

  const addDish = (dish) => setMenuItems(prev => [...prev, dish]);
  const deleteDish = (id) => setMenuItems(prev => prev.filter(d => d.id !== id));

  const loadDefaults = () => {
    const cuisines = vendor.cuisine || [];
    const defaults = [];
    cuisines.forEach(cuisine => {
      const map = DEFAULT_DISHES[cuisine] || {};
      COURSES.forEach(course => {
        (map[course] || []).forEach(name => {
          if (!menuItems.find(m => m.name === name && m.course === course)) {
            defaults.push({ id: `${Date.now()}_${Math.random()}_${name}`, name, course, isVeg: true });
          }
        });
      });
    });
    setMenuItems(prev => [...prev, ...defaults]);
    setMsg(`Loaded ${defaults.length} default dishes`);
    setTimeout(() => setMsg(""), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/vendors/${vendor._id}/menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ menuItems }),
      });
      const data = await res.json();
      if (res.ok) { setMsg(`Saved ${data.count} dishes`); setTimeout(() => setMsg(""), 2000); }
      else setMsg(`Error: ${data.error}`);
    } catch (e) { setMsg(e.message); }
    finally { setSaving(false); }
  };

  // Get suggestions from cuisines
  const getSuggestions = (course) => {
    const all = [];
    (vendor.cuisine || []).forEach(c => {
      const map = DEFAULT_DISHES[c] || {};
      (map[course] || []).forEach(d => { if (!all.includes(d)) all.push(d); });
    });
    return all;
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(28,10,0,0.5)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 601, width: "min(96vw,820px)", height: "min(92vh,900px)", background: "#FAF7F2", borderRadius: 20, boxShadow: "0 32px 80px rgba(28,10,0,0.2)", border: "1.5px solid rgba(196,122,46,0.2)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: font }}>

        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFCF7", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>Menu Editor — {vendor.name}</h3>
            <p style={{ fontSize: 12, color: "#9B7450", margin: "3px 0 0" }}>
              Cuisines: {(vendor.cuisine || []).join(", ") || "None listed"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {msg && <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>{msg}</span>}
            <button onClick={loadDefaults} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              ⚡ Load Defaults
            </button>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(196,122,46,0.1)", border: "none", color: "#9B7450", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#9B7450" }}>Loading menu…</div>
          ) : (
            COURSES.map(course => (
              <CourseSection
                key={course}
                course={course}
                items={menuItems.filter(m => m.course === course)}
                onAdd={addDish}
                onDelete={deleteDish}
                suggestions={getSuggestions(course)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(196,122,46,0.12)", background: "#FFFCF7", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: saving ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: saving ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: font, boxShadow: saving ? "none" : "0 4px 14px rgba(196,122,46,0.3)" }}>
            {saving ? "Saving…" : `Save Menu (${menuItems.length} dishes)`}
          </button>
          <button onClick={onClose} style={{ padding: "12px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

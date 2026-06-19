import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import router from "../router";
import { io } from "socket.io-client";
import { getBotFlow, BOT_FLOWS, ADDRESS_STEP, OTHER_OPTION, CHAT_PACKAGES, buildSummaryMessage } from "../utils/chatbot";
import { addVendorToCompare, setFinalisedVendor } from "../redux/listingFiltersSlice";
import { saveVendorTiming } from "../redux/eventPlanningSlice";
import { getVendorAvailability, holdVendorSlot } from "../apis/vendorApi";
import { useChatOverlay } from "../context/ChatContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

// ── Caterer menu: dishes per cuisine per course ───────────────────────────────
const CATERER_DISHES = {
  "North Indian": {
    Starters: ["Paneer Tikka","Hara Bhara Kebab","Veg Seekh Kebab","Dahi Ke Sholay","Aloo Tikki","Veg Shammi Kebab","Dal Makhani Tikki"],
    Mains:    ["Dal Makhani","Paneer Butter Masala","Shahi Paneer","Palak Paneer","Kadhai Paneer","Matar Paneer","Mixed Veg","Aloo Jeera","Navratan Korma"],
    Breads:   ["Butter Naan","Tandoori Roti","Laccha Paratha","Kulcha","Puri","Missi Roti"],
    Rice:     ["Steamed Rice","Jeera Rice","Veg Biryani","Veg Pulao","Matar Pulao"],
    Desserts: ["Gulab Jamun","Gajar Ka Halwa","Kheer","Jalebi","Rasgulla","Rasmalai","Halwa"],
    Beverages:["Sweet Lassi","Salted Lassi","Buttermilk","Sharbat"],
  },
  "South Indian": {
    Starters: ["Medu Vada","Rava Idli","Mini Dosa","Veg Cutlet","Paniyaram","Uttapam"],
    Mains:    ["Sambar","Rasam","Avial","Kootu","Pulissery","Kerala Veg Curry","Chettinad Masala"],
    Breads:   ["Appam","Kerala Parotta","Idiyappam","Poori"],
    Rice:     ["Steamed Rice","Tamarind Rice","Lemon Rice","Curd Rice","Bisi Bele Bath"],
    Desserts: ["Payasam","Kesari","Pongal","Banana Halwa"],
    Beverages:["Filter Coffee","Tender Coconut Water","Buttermilk"],
  },
  "Punjabi": {
    Starters: ["Paneer Pakoda","Amritsari Aloo","Makki Roti Bites","Veg Tikka","Chole Tikki"],
    Mains:    ["Sarson Da Saag","Chole Masala","Rajma Masala","Paneer Bhurji","Kadhi Pakoda","Dal Tadka"],
    Breads:   ["Makki Di Roti","Butter Naan","Tandoori Paratha","Kulcha"],
    Rice:     ["Jeera Rice","Veg Pulao","Veg Biryani"],
    Desserts: ["Phirni","Pinni","Gajrela","Moong Dal Halwa"],
    Beverages:["Mango Lassi","Sweet Lassi","Chaas"],
  },
  "Snacks": {
    Starters: ["Pani Puri","Bhel Puri","Sev Puri","Dahi Puri","Samosa","Kachori","Vada Pav","Pav Bhaji","Dahi Vada"],
    Mains:    [],
    Breads:   [],
    Rice:     [],
    Desserts: ["Rabri Falooda","Kulfi","Chaat Papdi"],
    Beverages:["Masala Chai","Cold Coffee","Nimbu Pani"],
  },
  "Chinese Starters": {
    Starters: ["Veg Manchurian","Chilli Paneer","Veg Spring Roll","Crispy Corn","Chilli Mushroom","Veg Dimsums","Honey Chilli Potatoes","Chilli Baby Corn"],
    Mains:    ["Hakka Noodles","Veg Fried Rice","Manchow Soup","Sweet Corn Soup","Hot & Sour Soup"],
    Breads:   [],
    Rice:     ["Veg Fried Rice","Schezwan Fried Rice","Burnt Garlic Fried Rice"],
    Desserts: ["Toffee Banana","Date Pancake"],
    Beverages:["Virgin Mojito","Lemonade"],
  },
  "Desserts": {
    Starters: [],
    Mains:    [],
    Breads:   [],
    Rice:     [],
    Desserts: ["Gulab Jamun","Rasgulla","Rasmalai","Kheer","Gajar Halwa","Jalebi","Rabri","Kulfi","Phirni","Halwa","Fruit Custard","Ice Cream","Brownie","Pastry"],
    Beverages:["Sharbat","Mocktail","Fruit Punch"],
  },
  "Italian": {
    Starters: ["Bruschetta","Garlic Bread","Caprese Salad","Stuffed Mushrooms","Tomato Soup"],
    Mains:    ["Pasta Arrabbiata","Pasta Alfredo","Penne Pesto","Veg Pizza","Veg Lasagna","Risotto"],
    Breads:   ["Focaccia","Garlic Baguette","Ciabatta"],
    Rice:     ["Risotto","Veg Pilaf"],
    Desserts: ["Tiramisu","Panna Cotta","Gelato","Chocolate Mousse"],
    Beverages:["Lemonade","Iced Tea","Sparkling Water"],
  },
  "Sweets": {
    Starters: [],
    Mains:    [],
    Breads:   [],
    Rice:     [],
    Desserts: ["Gulab Jamun","Rasgulla","Rasmalai","Kheer","Gajar Ka Halwa","Jalebi","Rabri","Kulfi","Phirni","Moong Dal Halwa","Pinni","Peda","Motichoor Ladoo","Kaju Barfi","Besan Barfi","Coconut Barfi","Sooji Halwa","Fruit Custard","Rabri Falooda","Shahi Tukda","Malpua","Imarti","Gajrela"],
    Beverages:["Sharbat","Rose Milk","Thandai","Rabri Lassi","Badam Milk"],
  },
  "Other": {
    Starters: ["Veg Appetizer Platter","Seasonal Starters"],
    Mains:    ["Chef Special","Seasonal Main Course"],
    Breads:   ["Assorted Breads"],
    Rice:     ["Steamed Rice","Special Rice"],
    Desserts: ["Chef Special Dessert"],
    Beverages:["Seasonal Beverages"],
  },
};

const PACKAGE_LIMITS = {
  Basic:    { Starters: 2, Mains: 1, Breads: 1, Rice: 1, Desserts: 1, Beverages: 0 },
  Standard: { Starters: 3, Mains: 2, Breads: 2, Rice: 1, Desserts: 2, Beverages: 1 },
  Premium:  { Starters: 99, Mains: 99, Breads: 99, Rice: 99, Desserts: 99, Beverages: 99 },
  Free:     { Starters: 99, Mains: 99, Breads: 99, Rice: 99, Desserts: 99, Beverages: 99 },
};

const COURSE_ICONS = { Starters: "🥗", Mains: "🍛", Breads: "🫓", Rice: "🍚", Desserts: "🍮", Beverages: "🥤" };

// ── Customer interactive menu card ────────────────────────────────────────────
function MenuSelectCard({ payload, onSend }) {
  const { vendorName, pkg, dishes } = payload;
  const limits = PACKAGE_LIMITS[pkg] || PACKAGE_LIMITS.Free;
  const [selected, setSelected] = useState({});
  const [sent, setSent] = useState(false);

  const toggle = (course, dish) => {
    setSelected(prev => {
      const cur = prev[course] || [];
      if (cur.includes(dish)) return { ...prev, [course]: cur.filter(d => d !== dish) };
      if (cur.length >= (limits[course] ?? 99)) return prev; // at limit
      return { ...prev, [course]: [...cur, dish] };
    });
  };

  const handleSend = () => {
    const lines = [`My Menu Selection — ${pkg} Package\n`];
    Object.entries(selected).forEach(([course, dishes]) => {
      if (dishes.length) lines.push(`${COURSE_ICONS[course] || "•"} ${course}:\n${dishes.map(d => `  • ${d}`).join("\n")}`);
    });
    if (lines.length === 1) return;
    onSend(lines.join("\n"));
    setSent(true);
  };

  if (sent) return <span style={{ color: "#15803d", fontWeight: 600 }}>✓ Menu selection sent!</span>;

  const coursesWithDishes = Object.entries(dishes).filter(([, d]) => d.length > 0);

  return (
    <div style={{ border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 12, overflow: "hidden", maxWidth: 340, fontFamily: font }}>
      <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "10px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>📋 Menu from {vendorName}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
          Package: <span style={{ color: "#CCAB4A", fontWeight: 700 }}>{pkg}</span>
          {pkg !== "Free" && " · select per course below"}
        </div>
      </div>
      <div style={{ padding: "10px 12px", background: "#FFFCF7", maxHeight: 360, overflowY: "auto" }}>
        {coursesWithDishes.map(([course, courseDishes]) => {
          const limit = limits[course] ?? 99;
          const selCount = (selected[course] || []).length;
          return (
            <div key={course} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E" }}>{COURSE_ICONS[course]} {course}</span>
                {pkg !== "Free" && <span style={{ fontSize: 10, color: selCount >= limit ? "#ef4444" : "#9B7450" }}>
                  {selCount}/{limit === 99 ? "∞" : limit} selected
                </span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {courseDishes.map(dish => {
                  const isSel = (selected[course] || []).includes(dish);
                  const atLimit = selCount >= limit && !isSel;
                  return (
                    <button key={dish} onClick={() => !atLimit && toggle(course, dish)}
                      className="vcm-dish-pill"
                      style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: isSel ? 700 : 500, cursor: atLimit ? "not-allowed" : "pointer", fontFamily: font, border: `1.5px solid ${isSel ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: isSel ? "rgba(196,122,46,0.12)" : "#fff", color: isSel ? "#C47A2E" : atLimit ? "#ccc" : "#2C1A0E", transition: "all 0.12s" }}>
                      {isSel && "✓ "}{dish}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(196,122,46,0.1)", background: "#FFFCF7" }}>
        <button onClick={handleSend}
          style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}>
          Send My Selection →
        </button>
      </div>
    </div>
  );
}

const ALL_MENU_CUISINES = ["North Indian","South Indian","Snacks","Chinese Starters","Punjabi","Sweets","Italian"];

// ── Full menu card (cuisine tabs + dish picker + plates step) ─────────────────
function FullMenuCard({ payload, onSend }) {
  const { pkg, cuisines = ALL_MENU_CUISINES } = payload;
  const limits = PACKAGE_LIMITS[pkg] || PACKAGE_LIMITS.Free;

  const [activeCuisine, setActiveCuisine] = React.useState(cuisines[0] || "North Indian");
  const [selected, setSelected] = React.useState({}); // { dishName: { course, cuisine } }
  const [step, setStep] = React.useState("select");    // "select" | "plates"
  const [plates, setPlates] = React.useState(1);       // single count for all dishes
  const [sent, setSent] = React.useState(false);

  const countByCourse = React.useMemo(() => {
    const c = {};
    Object.values(selected).forEach(({ course }) => { c[course] = (c[course] || 0) + 1; });
    return c;
  }, [selected]);

  const totalSelected = Object.keys(selected).length;

  const toggleDish = (dish, course) => {
    setSelected(prev => {
      if (prev[dish]) { const next = { ...prev }; delete next[dish]; return next; }
      const limit = limits[course] ?? 99;
      if ((countByCourse[course] || 0) >= limit) return prev;
      return { ...prev, [dish]: { course, cuisine: activeCuisine } };
    });
  };

  const handleConfirmSelection = () => {
    if (totalSelected === 0) return;
    setStep("plates");
  };

  const handleSend = () => {
    const byCuisine = {};
    Object.entries(selected).forEach(([dish, { course, cuisine }]) => {
      if (!byCuisine[cuisine]) byCuisine[cuisine] = {};
      if (!byCuisine[cuisine][course]) byCuisine[cuisine][course] = [];
      byCuisine[cuisine][course].push(dish);
    });
    const lines = [`🍽️ My Menu Selection${pkg !== "Free" ? ` — ${pkg} Package` : ""} · ${plates} plates each\n`];
    Object.entries(byCuisine).forEach(([cuisine, courses]) => {
      lines.push(`\n${cuisine}:`);
      Object.entries(courses).forEach(([course, dishes]) => {
        const label = cuisine === "Sweets" && course === "Desserts" ? "Sweets" : course;
        lines.push(`  ${COURSE_ICONS[course] || "•"} ${label}:`);
        dishes.forEach(d => lines.push(`    • ${d}`));
      });
    });
    onSend(lines.join("\n"));
    setSent(true);
  };

  if (sent) return (
    <div style={{ padding: "10px 14px", color: "#15803d", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
      ✅ Menu selection sent!
    </div>
  );

  // ── Plates step ──
  if (step === "plates") {
    const selEntries = Object.entries(selected);
    return (
      <div style={{ border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 12, overflow: "hidden", maxWidth: 340, fontFamily: font }}>
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "10px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>🍽️ Number of Plates</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Same count for all {totalSelected} selected dishes</div>
        </div>
        <div style={{ padding: "18px 16px", background: "#FFFCF7" }}>
          {/* Single plate counter */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 16 }}>
            <button onClick={() => setPlates(p => Math.max(1, p - 1))}
              style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(196,122,46,0.4)", background: "#fff", color: "#C47A2E", fontSize: 22, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>−</button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: "#2C1A0E", lineHeight: 1 }}>{plates}</div>
              <div style={{ fontSize: 11, color: "#9B7450", marginTop: 3 }}>plates each</div>
            </div>
            <button onClick={() => setPlates(p => p + 1)}
              style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(196,122,46,0.4)", background: "#fff", color: "#C47A2E", fontSize: 22, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>+</button>
          </div>
          {/* Selected dishes summary */}
          <div style={{ background: "rgba(196,122,46,0.06)", borderRadius: 8, padding: "8px 10px", maxHeight: 160, overflowY: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{totalSelected} dishes selected</div>
            {selEntries.map(([dish, { cuisine }]) => (
              <div key={dish} style={{ fontSize: 11, color: "#2C1A0E", padding: "2px 0", display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "#C47A2E", fontWeight: 700 }}>•</span>
                <span style={{ fontWeight: 600 }}>{dish}</span>
                <span style={{ color: "#9B7450", fontSize: 10 }}>({cuisine})</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(196,122,46,0.1)", background: "#FFFCF7", display: "flex", gap: 8 }}>
          <button onClick={() => setStep("select")}
            style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>← Back</button>
          <button onClick={handleSend}
            style={{ flex: 2, padding: "9px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 2px 8px rgba(196,122,46,0.3)" }}>Send My Order →</button>
        </div>
      </div>
    );
  }

  // ── Dish selection step ──
  const currentDishes = CATERER_DISHES[activeCuisine] || {};
  const coursesWithDishes = Object.entries(currentDishes).filter(([, d]) => d.length > 0);

  return (
    <div style={{ border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 12, overflow: "hidden", maxWidth: 360, fontFamily: font }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "10px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>🍽️ Choose Your Menu</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
          {pkg !== "Free"
            ? `${pkg} Package · ${limits.Starters > 50 ? "Unlimited" : limits.Starters} starters · ${limits.Mains > 50 ? "Unlimited" : limits.Mains} mains · ${limits.Desserts > 50 ? "Unlimited" : limits.Desserts} desserts`
            : "Free selection — pick as you like"}
        </div>
      </div>

      {/* Cuisine tabs */}
      <div style={{ display: "flex", overflowX: "auto", background: "#FFFCF7", borderBottom: "1px solid rgba(196,122,46,0.12)", scrollbarWidth: "none" }}>
        {cuisines.map(c => {
          const isActive = c === activeCuisine;
          const cnt = Object.values(selected).filter(v => v.cuisine === c).length;
          return (
            <button key={c} onClick={() => setActiveCuisine(c)}
              className="vcm-cuisine-tab"
              style={{ flexShrink: 0, padding: "8px 12px", border: "none", borderBottom: isActive ? "2.5px solid #C47A2E" : "2.5px solid transparent", background: "transparent", color: isActive ? "#C47A2E" : "#9B7450", fontSize: 11, fontWeight: isActive ? 800 : 500, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
              {c}
              {cnt > 0 && <span style={{ background: "#C47A2E", color: "#fff", borderRadius: 10, fontSize: 9, fontWeight: 700, padding: "1px 5px", lineHeight: 1.4 }}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* Dishes */}
      <div style={{ padding: "10px 12px", background: "#FFFCF7", maxHeight: 310, overflowY: "auto" }}>
        {coursesWithDishes.length === 0 && (
          <div style={{ textAlign: "center", color: "#9B7450", fontSize: 12, padding: "20px 0" }}>No items listed for this cuisine</div>
        )}
        {coursesWithDishes.map(([course, dishList]) => {
          const limit = limits[course] ?? 99;
          const selCount = countByCourse[course] || 0;
          const courseLabel = activeCuisine === "Sweets" && course === "Desserts" ? "Sweets" : course;
          return (
            <div key={course} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E" }}>{COURSE_ICONS[course] || "•"} {courseLabel}</span>
                {pkg !== "Free" && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: selCount >= limit && limit < 99 ? "#ef4444" : "#9B7450" }}>
                    {selCount}/{limit > 50 ? "∞" : limit} selected
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {dishList.map(dish => {
                  const isSel = !!selected[dish];
                  const atLimit = !isSel && (countByCourse[course] || 0) >= limit;
                  return (
                    <button key={dish} onClick={() => !atLimit && toggleDish(dish, course)}
                      style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: isSel ? 700 : 500, cursor: atLimit ? "not-allowed" : "pointer", fontFamily: font, border: `1.5px solid ${isSel ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: isSel ? "rgba(196,122,46,0.12)" : "#fff", color: isSel ? "#C47A2E" : atLimit ? "#ccc" : "#2C1A0E", transition: "all 0.12s" }}>
                      {isSel && "✓ "}{dish}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(196,122,46,0.1)", background: "#FFFCF7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#9B7450", fontWeight: 500 }}>
          {totalSelected > 0 ? `${totalSelected} dish${totalSelected !== 1 ? "es" : ""} selected` : "Tap dishes to select"}
        </span>
        <button onClick={handleConfirmSelection} disabled={totalSelected === 0}
          style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: totalSelected > 0 ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: totalSelected > 0 ? "#fff" : "#9ca3af", fontSize: 12, fontWeight: 700, cursor: totalSelected > 0 ? "pointer" : "not-allowed", fontFamily: font, boxShadow: totalSelected > 0 ? "0 2px 8px rgba(196,122,46,0.3)" : "none" }}>
          Confirm Selection →
        </button>
      </div>
    </div>
  );
}

function BotTextInput({ onSubmit, placeholder = "Type your answer…" }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onSubmit(val.trim()); setVal(""); } }}
        placeholder={placeholder}
        style={{ flex: 1, padding: "9px 14px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.3)", fontSize: 13, fontFamily: font, outline: "none", background: "#fff" }}
      />
      <button onClick={() => { if (val.trim()) { onSubmit(val.trim()); setVal(""); } }}
        style={{ padding: "9px 18px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
        Next →
      </button>
    </div>
  );
}

export default function VendorChatModal() {
  const { chatState, minimizeChat, closeChat, setConversationId: setCtxConvoId } = useChatOverlay();
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.auth.user);
  const authToken = useSelector(s => s.auth.token);
  const reduxFormData = useSelector(s => s.eventPlanning.formData || {});

  const vendor = chatState?.vendor;
  const isExistingChat = !!chatState?.isExisting;
  const fromActiveChats = !!chatState?.vendor?.fromActiveChats;
  const isConcierge = !!chatState?.isConcierge;

  // ── Bot state ────────────────────────────────────────────────────────────────
  const selectedVendorTypes = useSelector(s => s.eventPlanning.selectedVendors || []);

  // Concierge bot: combine questions from all selected service categories
  const conciergeFlow = React.useMemo(() => {
    if (!isConcierge || isExistingChat) return [];
    const combined = selectedVendorTypes.flatMap(type => {
      const flow = BOT_FLOWS[type] || [];
      // Skip timeline if date already filled, skip address (add one at end)
      return flow.filter(s => s.key !== 'venueAddress' && (s.key !== 'timeline' || !reduxFormData.date));
    });
    // Add single address step at the end if not already there
    return combined.length > 0 ? [...combined, ADDRESS_STEP] : [ADDRESS_STEP];
  }, [selectedVendorTypes, isConcierge, isExistingChat, reduxFormData.date]);

  const botFlow = isExistingChat ? []
    : isConcierge ? conciergeFlow
    : vendor ? getBotFlow(vendor.serviceType, undefined, reduxFormData)
    : [];
  const [botStep, setBotStep] = useState(0);
  const [botAnswers, setBotAnswers] = useState({});
  const [botDone, setBotDone] = useState(isExistingChat || botFlow.length === 0);
  const botAnswersRef = useRef({});
  const botDoneRef = useRef(isExistingChat || botFlow.length === 0);
  const summarySentRef = useRef(false);
  // Package step — shown after last bot question, before chat opens (vendor chats only)
  const PACKAGE_SERVICES = ['Caterer', 'Photographer', 'Decorator', 'DJ'];
  const shouldShowPkgStep = !isConcierge && PACKAGE_SERVICES.includes(vendor?.serviceType) && !isExistingChat;
  const [showPkgStep, setShowPkgStep] = useState(false);
  const [pkgExpanded, setPkgExpanded] = useState({});
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [confirmedPkg, setConfirmedPkg] = useState(null);
  const chatPackages = CHAT_PACKAGES[vendor?.serviceType] || [];

  // Photo reference step (Decorator only)
  const [showPhotoStep, setShowPhotoStep] = useState(false);
  const [selectedRefPhotos, setSelectedRefPhotos] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [gallerySelected, setGallerySelected] = useState([]);
  const refPhotosRef = useRef([]);

  // ── Chat state ───────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [text, setText] = useState("");
  const [botOtherMode, setBotOtherMode] = useState(false); // "Other..." selected — show text input
  const [conversationId, setConversationId] = useState(null);
  const [approved, setApproved] = useState(false);
  const [justApproved, setJustApproved] = useState(false); // shows install banner on first approval
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ── Chat action state ────────────────────────────────────────────────────────
  const [chatCompleted, setChatCompleted] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const finalisedVendors = useSelector(s => s.listingFilters.finalisedVendors || {});
  const isThisVendorFinalised = vendor?._id && (() => {
    const entry = finalisedVendors[vendor?.serviceType];
    if (!entry) return false;
    const arr = Array.isArray(entry) ? entry : [entry];
    return arr.some(v => v._id === vendor._id);
  })();

  // ── Minimise animation state ─────────────────────────────────────────────────
  const [minimizing, setMinimizing] = useState(false);

  // ── Mobile detection ─────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Track previous vendor so we only reset when vendor ACTUALLY changes
  const prevResetKeyRef = useRef(null);

  // ── Reset when vendor/mode changes ──────────────────────────────────────────
  useEffect(() => {
    if (!chatState) return;
    const resetKey = `${chatState.vendor?._id}-${chatState.isExisting}`;
    // Don't reset if same vendor + same mode (prevents progress loss on re-renders)
    if (resetKey === prevResetKeyRef.current) return;
    prevResetKeyRef.current = resetKey;

    const existing = !!chatState.isExisting;
    setBotStep(0);
    setBotAnswers({});
    botAnswersRef.current = {};
    const flow = existing ? [] : getBotFlow(chatState.vendor?.serviceType, undefined, reduxFormData);
    const done = existing || flow.length === 0;
    setBotDone(done);
    botDoneRef.current = done;
    summarySentRef.current = false;
    setMessages([]);
    setText("");
    setConversationId(chatState.conversationId || null);
    setApproved(existing ? !!chatState.vendor?.approved : false);
    setChatCompleted(false);
    setShowReviewPopup(false);
    setMinimizing(false);
    // Reset package step for every new vendor chat
    setShowPkgStep(false);
    setSelectedPkg(null);
    setConfirmedPkg(null);
    setPkgExpanded({});

    // Auto-add to Compare Vendors whenever a real vendor chat opens
    if (chatState?.vendor?._id && chatState.vendor._id !== "concierge" && !chatState.isConcierge) {
      dispatch(addVendorToCompare(chatState.vendor));
    }
  }, [chatState?.vendor?._id, chatState?.isExisting]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botStep]);

  // ── Escape key ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chatState || chatState.minimized) return;
    const handler = (e) => { if (e.key === "Escape") handleMinimize(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [chatState?.minimized]);

  // ── Minimize with animation ──────────────────────────────────────────────────
  const handleMinimize = () => {
    setMinimizing(true);
    setTimeout(() => {
      setMinimizing(false);
      minimizeChat();
    }, 350);
  };

  // ── Socket ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chatState || !currentUser?._id) return;

    const socket = io(BASE_URL, {
      auth: { token: authToken },
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    // New concierge chat: open immediately on connect (no bot)
    if (isConcierge && !chatState.conversationId) {
      socket.on("connect", () => {
        socket.emit("open_conversation", { chatType: "concierge" });
      });
    }

    // Existing chat: join room directly
    if (isExistingChat && chatState.conversationId) {
      socket.on("connect", async () => {
        const cid = chatState.conversationId;
        socket.emit("join_conversation", { conversationId: cid });
        setConversationId(cid);
        if (vendor?.approved) setApproved(true);
        setMessagesLoading(true);
        try {
          const res = await fetch(`${BASE_URL}/messages/${cid}/messages`, {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            credentials: "include",
          });
          if (res.ok) {
            const hist = await res.json();
            if (Array.isArray(hist) && hist.length > 0) {
              setMessages(hist.map(m => ({
                text: m.content, sender: m.sender === "user" ? "user" : "vendor",
                ts: new Date(m.createdAt).getTime(),
              })));
            }
          }
        } catch {} finally { setMessagesLoading(false); }
      });
    }

    socket.on("conversation_opened", async ({ _id, chatApproved: isApproved }) => {
      setConversationId(_id);
      setCtxConvoId(_id);
      if (isApproved) setApproved(true);
      dispatch(addVendorToCompare(vendor));

      if (botDoneRef.current && Object.keys(botAnswersRef.current).length > 0 && !summarySentRef.current) {
        summarySentRef.current = true;
        const fullMsg = buildSummaryMessage(reduxFormData, botAnswersRef.current, vendor?.name, vendor?.serviceType);
        dispatch(saveVendorTiming({
          serviceType:  vendor?.serviceType,
          eventTiming:  botAnswersRef.current.eventTiming || "",
          djHours:      botAnswersRef.current.djHours     || "",
          coverage:     botAnswersRef.current.coverage    || "",
        }));
        setTimeout(() => {
          socket.emit("send_message", { conversationId: _id, sender: "user", content: fullMsg });
        }, 400);

        if (refPhotosRef.current.length > 0) {
          refPhotosRef.current.forEach((photo, idx) => {
            setTimeout(() => {
              const content = `[img:${photo.src}]`;
              socket.emit("send_message", { conversationId: _id, sender: "user", content });
              setMessages(prev => [...prev, { text: content, sender: "user", ts: Date.now() + idx }]);
            }, 900 + idx * 300);
          });
        }
      }

      try {
        const res = await fetch(`${BASE_URL}/messages/${_id}/messages`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          credentials: "include",
        });
        if (res.ok) {
          const hist = await res.json();
          if (Array.isArray(hist) && hist.length > 0) {
            setMessages(hist.map(m => ({
              text: m.content, sender: m.sender === "user" ? "user" : "vendor",
              ts: new Date(m.createdAt).getTime(),
            })));
          }
        }
      } catch {}
    });

    socket.on("chat_approved", () => { setApproved(true); setJustApproved(true); });
    socket.on("new_message", (msg) => {
      if (msg.sender === "user") return;
      setMessages(prev => [...prev, { text: msg.content, sender: "vendor", ts: Date.now() }]);
    });

    return () => socket.disconnect();
  }, [chatState?.vendor?._id, currentUser?._id]);

  const openConversation = useCallback((answers) => {
    if (!socketRef.current) return;
    if (isConcierge) {
      socketRef.current.emit("open_conversation", { chatType: "concierge" });
    } else if (vendor?._id && vendor._id !== "concierge") {
      socketRef.current.emit("open_conversation", {
        chatType: "VENDOR",
        vendorId: vendor._id,
        eventDetails: { ...reduxFormData, ...answers },
      });
    }
  }, [vendor?._id, isConcierge, reduxFormData]);

  const handleBotAnswer = (answer) => {
    if (answer === OTHER_OPTION) {
      // Don't advance — show a text input so user can describe their specific need
      setBotOtherMode(true);
      return;
    }
    setBotOtherMode(false);
    const step = botFlow[botStep];
    const newAnswers = { ...botAnswers, [step.key]: answer };
    setBotAnswers(newAnswers);
    botAnswersRef.current = newAnswers;
    if (botStep + 1 < botFlow.length) {
      setBotStep(p => p + 1);
    } else if (shouldShowPkgStep) {
      // Advance step so the last answer (address) renders as a completed QA bubble
      setBotStep(p => p + 1);
      setShowPkgStep(true);
    } else {
      setBotDone(true);
      botDoneRef.current = true;
      openConversation(newAnswers);
    }
  };

  const handlePkgConfirm = (tier) => {
    const pkgLabel = tier ? `${tier} Package` : null;
    const answersWithPkg = { ...botAnswersRef.current, selectedPackage: tier ? `${tier} Package — ${chatPackages.find(p => p.tier === tier)?.desc || ""}` : null };
    setBotAnswers(answersWithPkg);
    botAnswersRef.current = answersWithPkg;
    setSelectedPkg(tier);
    setConfirmedPkg(pkgLabel);
    setShowPkgStep(false);
    if (vendor?.serviceType === 'Decorator') {
      setShowPhotoStep(true);
    } else {
      setBotDone(true);
      botDoneRef.current = true;
      openConversation(answersWithPkg);
    }
  };

  const handlePhotoConfirm = (photos) => {
    refPhotosRef.current = photos;
    setSelectedRefPhotos(photos);
    setShowPhotoStep(false);
    setGalleryOpen(false);
    setBotDone(true);
    botDoneRef.current = true;
    openConversation(botAnswersRef.current);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    Promise.all(
      files.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = ev => resolve({ src: ev.target.result });
        reader.readAsDataURL(file);
      }))
    ).then(photos => setSelectedRefPhotos(prev => [...prev, ...photos]));
    e.target.value = "";
  };

  const openGallery = async () => {
    setGalleryOpen(true);
    if (galleryPhotos.length > 0) return;
    setGalleryLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/gallery`);
      const data = await res.json();
      setGalleryPhotos((data.grouped?.["Decoration"] || []).filter(p => p.imageUrl));
    } catch {}
    setGalleryLoading(false);
  };

  const toggleGallerySelect = (url) => {
    setGallerySelected(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  };

  const handleFinalise = async () => {
    if (!chatCompleted || !vendor) return;

    // Hold a slot on the vendor's availability calendar for the event date
    const eventDate = reduxFormData?.date;
    if (eventDate && vendor._id && authToken) {
      const monthKey = eventDate.slice(0, 7); // "YYYY-MM"
      const availability = await getVendorAvailability(vendor._id, monthKey, authToken);
      const daySlots = availability[eventDate] || {};

      // Pick first available slot (slot1 → slot2)
      const slotToHold = daySlots.slot1 !== false ? "slot1"
        : daySlots.slot2 !== false ? "slot2"
        : null;

      if (!slotToHold) {
        setMessages(prev => [...prev, {
          text: `⚠️ No available slots left for ${vendor.name} on ${eventDate}. Please choose a different date or vendor.`,
          sender: "system", ts: Date.now(),
        }]);
        return;
      }

      await holdVendorSlot(vendor._id, eventDate, slotToHold, authToken);

      // Persist held slot info so BookingConfirmation can confirm it on payment
      localStorage.setItem(`tendr:held:${vendor._id}`, JSON.stringify({
        date: eventDate, slot: slotToHold, heldAt: Date.now(),
      }));
    }

    dispatch(setFinalisedVendor(vendor));
    if (socketRef.current && conversationId) {
      socketRef.current.emit("send_message", {
        conversationId,
        sender: "customer-care",
        content: `[FINALISED] ✅ Customer has completed the chat and finalised ${vendor.name || "this vendor"}. Ready for payment.`,
      });
    }
    setMessages(prev => [...prev, {
      text: `✅ ${vendor.name} added to your booking. Slot held for 2 hours. Tap "Review & Pay" when ready.`,
      sender: "system", ts: Date.now(),
    }]);
  };

  const sendText = (override) => {
    const content = typeof override === "string" ? override : text.trim();
    if (!approved || !content || !conversationId) return;
    setMessages(prev => [...prev, { text: content, sender: "user", ts: Date.now() }]);
    socketRef.current?.emit("send_message", { conversationId, sender: "user", content });
    localStorage.setItem("tendr:lastMsgAt", Date.now().toString());
    if (!override) setText("");
  };

  const sendImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId || !approved) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = `[img:${ev.target.result}]`;
      setMessages(prev => [...prev, { text: content, sender: "user", ts: Date.now() }]);
      socketRef.current?.emit("send_message", { conversationId, sender: "user", content });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const renderMsg = (text) => {
    if (!text) return null;
    if (text.startsWith("[img:")) {
      const src = text.replace("[img:", "").replace(/\]$/, "");
      return <img src={src} alt="sent" style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8, display: "block", objectFit: "contain" }} />;
    }
    if (text.startsWith("[FINALISED]")) {
      return <span style={{ color: "#15803d", fontWeight: 600 }}>{text.replace("[FINALISED] ", "")}</span>;
    }
    // MCQ packages — render as selectable option buttons
    if (text.startsWith("[MCQ_PACKAGES:")) {
      const clean = text.replace(/\[MCQ_PACKAGES:[^\]]+\]\n?/, "");
      const tierNames = ["Basic", "Standard", "Premium"];
      const optionLines = ["1️⃣","2️⃣","3️⃣"].map((em, i) => {
        const start = clean.indexOf(em);
        const next = ["1️⃣","2️⃣","3️⃣"][i + 1];
        const end = next ? clean.indexOf(next) : clean.indexOf("\nReply with");
        return start >= 0 ? clean.slice(start, end > 0 ? end : undefined).trim() : null;
      }).filter(Boolean);
      return (
        <div>
          <p style={{ margin: "0 0 8px", whiteSpace: "pre-line", fontWeight: 600, fontSize: 13 }}>
            {clean.split('\n').slice(0, 2).join('\n')}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {optionLines.map((opt, i) => (
              <button key={i}
                onClick={() => {
                  const reply = `I'd like the ${tierNames[i]} package:\n\n${opt}`;
                  setMessages(prev => [...prev, { text: reply, sender: "user", ts: Date.now() }]);
                  socketRef.current?.emit("send_message", { conversationId, sender: "user", content: reply });
                }}
                style={{ textAlign: "left", padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", color: "#2C1A0E", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "pre-line", lineHeight: 1.4 }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,122,46,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
              >{opt}</button>
            ))}
            <button
              onClick={() => {
                const reply = "No specific package — please suggest what suits my event.";
                setMessages(prev => [...prev, { text: reply, sender: "user", ts: Date.now() }]);
                socketRef.current?.emit("send_message", { conversationId, sender: "user", content: reply });
              }}
              style={{ textAlign: "center", padding: "7px 12px", borderRadius: 10, border: "1px dashed rgba(139,69,19,0.25)", background: "transparent", color: "#9B7450", fontSize: 11, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
            >Skip → discuss directly</button>
          </div>
        </div>
      );
    }
    // Full cuisine-tab menu (new format)
    if (text.startsWith("[FULL_MENU:")) {
      try {
        const json = text.slice("[FULL_MENU:".length, -1);
        const payload = JSON.parse(json);
        return (
          <FullMenuCard
            payload={payload}
            onSend={(selection) => {
              setMessages(prev => [...prev, { text: selection, sender: "user", ts: Date.now() }]);
              socketRef.current?.emit("send_message", { conversationId, sender: "user", content: selection });
            }}
          />
        );
      } catch { /* fall through */ }
    }
    // Legacy caterer menu (backwards compat)
    if (text.startsWith("[CATERER_MENU:")) {
      try {
        const json = text.replace(/^\[CATERER_MENU:/, "").replace(/\]$/, "");
        const payload = JSON.parse(json);
        return (
          <MenuSelectCard
            payload={payload}
            onSend={(selection) => {
              setMessages(prev => [...prev, { text: selection, sender: "user", ts: Date.now() }]);
              socketRef.current?.emit("send_message", { conversationId, sender: "user", content: selection });
            }}
          />
        );
      } catch { /* fall through */ }
    }
    return <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>;
  };

  if (!chatState || chatState.minimized) return null;

  // Event details from form
  const fd = reduxFormData || {};
  const formLines = [
    fd.eventType && { label: "Event", value: fd.eventType },
    fd.date && { label: "Date", value: fd.date },
    fd.guests && { label: "Guests", value: fd.guests },
    fd.budget && { label: "Budget", value: fd.budget },
    fd.location && { label: "City", value: fd.location },
  ].filter(Boolean);

  return (
    <>
      <style>{`
        @keyframes vcm-in {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.94); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes vcm-out {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to   { opacity: 0; transform: translate(-50%, 120%) scale(0.5); }
        }
        .vcm-enter { animation: vcm-in 0.22s cubic-bezier(0.4,0,0.2,1) forwards; }
        .vcm-exit  { animation: vcm-out 0.32s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleMinimize}
        style={{
          position: "fixed", inset: 0, zIndex: 1200,
          background: "rgba(0,0,0,0.38)",
          backdropFilter: "blur(2px)",
          opacity: minimizing ? 0 : 1,
          transition: "opacity 0.3s",
        }}
      />

      {/* Modal window */}
      <div
        className={minimizing ? "vcm-exit" : "vcm-enter vcm-root"}
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: isMobile ? 6 : "50%",
          bottom: isMobile ? "calc(60px + env(safe-area-inset-bottom, 0px))" : "auto",
          left: "50%",
          transform: isMobile ? "translateX(-50%)" : "translate(-50%, -50%)",
          zIndex: 1201,
          width:  isMobile ? "96vw" : "min(94vw, 660px)",
          height: isMobile ? "calc(100dvh - 6px - 60px - env(safe-area-inset-bottom, 0px))" : "min(86vh, 700px)",
          maxHeight: isMobile ? "calc(100dvh - 6px - 60px - env(safe-area-inset-bottom, 0px))" : "min(86vh, 700px)",
          background: "#FFFCF5",
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(44,26,14,0.22), 0 4px 20px rgba(0,0,0,0.1)",
          border: "1.5px solid rgba(196,122,46,0.18)",
          display: "flex",
          flexDirection: "column",
          fontFamily: font,
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div style={{ background: isConcierge ? "linear-gradient(135deg,#0369a1 0%,#0284c7 100%)" : "linear-gradient(135deg,#2C1A0E 0%,#4A2810 100%)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Back to Active Chats button */}
          {fromActiveChats && (
            <button
              onClick={() => {
                closeChat();
                document.dispatchEvent(new CustomEvent("tendr:open-active-chats"));
              }}
              title="Back to all chats"
              style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >‹</button>
          )}
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 17, flexShrink: 0 }}>
            {(vendor?.name || "V")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor?.name || "Vendor"}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              {vendor?.serviceType || "Service"} · {approved ? "Chat active" : "Awaiting approval"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleMinimize}
              title="Minimise (Esc)"
              style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, paddingBottom: 3 }}
            >—</button>
            <button
              onClick={closeChat}
              title="Close chat"
              style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >✕</button>
          </div>
        </div>

        {/* ── Event details bar (always visible if form data exists) ── */}
        {formLines.length > 0 && (
          <div style={{ background: "rgba(196,122,46,0.06)", borderBottom: "1px solid rgba(196,122,46,0.12)", padding: "10px 18px", flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Your Event Details</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {formLines.map(({ label, value }) => (
                <span key={label} style={{ fontSize: 12, fontWeight: 500, background: "#fff", borderRadius: 100, padding: "3px 11px", color: "#5a3a1a", border: "1px solid rgba(196,122,46,0.2)" }}>
                  <b style={{ color: "#C47A2E" }}>{label}:</b> {value}
                </span>
              ))}
            </div>
          </div>
        )}
        {formLines.length === 0 && (
          <div style={{ background: "rgba(196,122,46,0.04)", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "8px 18px", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#9B7450" }}>ℹ️ No event details yet —</span>
            <a href="/booking" style={{ fontSize: 12, color: "#C47A2E", fontWeight: 700, textDecoration: "none" }} onClick={closeChat}>fill the event form first →</a>
          </div>
        )}

        {/* ── Messages / Bot area ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Bot questions (new chats only) */}
          {!botDone && (
            <>
              {botStep === 0 && (
                <div style={{ alignSelf: "flex-start", maxWidth: "82%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontSize: 13, color: "#1a1a1a", lineHeight: 1.55 }}>
                  👋 A few quick questions before connecting you with <strong>{vendor?.name}</strong>.
                </div>
              )}
              {botFlow.slice(0, botStep).map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ alignSelf: "flex-start", maxWidth: "80%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "9px 13px", boxShadow: "0 1px 5px rgba(0,0,0,0.05)", fontSize: 13, color: "#1a1a1a" }}>{step.question}</div>
                  <div style={{ alignSelf: "flex-end", maxWidth: "80%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", borderRadius: "16px 16px 4px 16px", padding: "9px 13px", fontSize: 13, color: "#fff", fontWeight: 600 }}>{botAnswers[step.key]}</div>
                </div>
              ))}
              {botStep < botFlow.length && (() => {
                const cur = botFlow[botStep];
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ alignSelf: "flex-start", maxWidth: "82%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontSize: 13, color: "#1a1a1a", lineHeight: 1.5 }}>{cur.question}</div>
                    {cur.type === "text" || botOtherMode
                      ? <BotTextInput
                          onSubmit={(val) => { setBotOtherMode(false); handleBotAnswer(val); }}
                          placeholder={botOtherMode ? "Describe what you need…" : "Type your answer…"}
                        />
                      : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {cur.options.map(opt => (
                            <button key={opt} onClick={() => handleBotAnswer(opt)}
                              style={{ padding: "8px 16px", borderRadius: 100, border: `1.5px solid ${opt === OTHER_OPTION ? "rgba(139,69,19,0.25)" : "rgba(196,122,46,0.4)"}`, background: opt === OTHER_OPTION ? "#f9f9f9" : "#fff", color: opt === OTHER_OPTION ? "#9B7450" : "#C47A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.08)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = opt === OTHER_OPTION ? "#f9f9f9" : "#fff"; }}
                            >{opt}</button>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })()}
            </>
          )}

          {/* Package selection step */}
          {showPkgStep && !botDone && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 0" }}>
              <div style={{ alignSelf: "flex-start", maxWidth: "84%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontSize: 13, color: "#1a1a1a", lineHeight: 1.5 }}>
                📦 Would you like to choose a package? This helps us give you a faster quote.
              </div>
              {chatPackages.map(p => {
                const key = p.tier;
                const open = !!pkgExpanded[key];
                const sel = selectedPkg === key;
                return (
                  <div key={key} style={{ borderRadius: 12, border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: sel ? "rgba(196,122,46,0.05)" : "#FFFCF5", overflow: "hidden", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px" }}
                      onClick={() => setSelectedPkg(sel ? null : key)}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: sel ? "#C47A2E" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {sel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{key}</div>
                        {p.guests && <div style={{ fontSize: 10, color: "#9B7450", marginTop: 1 }}>{p.guests} guests</div>}
                      </div>
                      <button onClick={e => { e.stopPropagation(); setPkgExpanded(x => ({ ...x, [key]: !open })); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 16, padding: "2px 4px", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>⌄</button>
                    </div>
                    {open && (
                      <div style={{ padding: "0 14px 12px", borderTop: "1px solid rgba(196,122,46,0.1)" }}>
                        {p.items ? (
                          <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 3 }}>
                            {p.items.map(item => (
                              <li key={item} style={{ fontSize: 12, color: "#5a3a1a", lineHeight: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ color: "#C47A2E", fontSize: 10 }}>•</span>{item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ fontSize: 12, color: "#5a3a1a", lineHeight: 1.6, margin: "8px 0 0" }}>{p.desc}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {selectedPkg && (
                  <button onClick={() => handlePkgConfirm(selectedPkg)}
                    style={{ flex: 2, padding: "11px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    Continue with {selectedPkg} →
                  </button>
                )}
                <button onClick={() => handlePkgConfirm(null)}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Package selection confirmed bubble */}
          {confirmedPkg && !showPkgStep && !approved && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ alignSelf: "flex-start", maxWidth: "80%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "9px 13px", boxShadow: "0 1px 5px rgba(0,0,0,0.05)", fontSize: 13, color: "#1a1a1a" }}>📦 Which package suits your needs?</div>
              <div style={{ alignSelf: "flex-end", maxWidth: "80%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", borderRadius: "16px 16px 4px 16px", padding: "9px 13px", fontSize: 13, color: "#fff", fontWeight: 600 }}>{confirmedPkg}</div>
            </div>
          )}

          {/* Reference photo step (Decorator only) */}
          {showPhotoStep && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 0" }}>
              <div style={{ alignSelf: "flex-start", maxWidth: "84%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontSize: 13, color: "#1a1a1a", lineHeight: 1.5 }}>
                🖼️ Would you like to add reference photos? It helps the decorator understand your style.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  📷 Upload
                  <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
                </label>
                <button onClick={openGallery}
                  style={{ flex: 2, padding: "10px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  🖼️ Choose from Gallery
                </button>
              </div>
              {selectedRefPhotos.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", marginBottom: 6 }}>{selectedRefPhotos.length} photo{selectedRefPhotos.length !== 1 ? "s" : ""} selected</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                    {selectedRefPhotos.map((p, i) => (
                      <img key={i} src={p.src} alt="" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 8, display: "block" }} />
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {selectedRefPhotos.length > 0 && (
                  <button onClick={() => handlePhotoConfirm(selectedRefPhotos)}
                    style={{ flex: 2, padding: "10px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    Send {selectedRefPhotos.length} photo{selectedRefPhotos.length !== 1 ? "s" : ""} →
                  </button>
                )}
                <button onClick={() => handlePhotoConfirm([])}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Waiting state */}
          {botDone && !approved && (
            <div style={{ textAlign: "center", padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E22,#CCAB4A22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⏳</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E" }}>Request Sent!</div>
              <div style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.7, maxWidth: 300 }}>
                Your request to chat with <strong>{vendor?.name}</strong> has been submitted.
              </div>
              {/* Expectation + next steps */}
              <div style={{ background: "rgba(196,122,46,0.06)", border: "1.5px solid rgba(196,122,46,0.18)", borderRadius: 14, padding: "14px 18px", maxWidth: 320, textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>📲 What happens next</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { icon: "⏱️", text: "You'll hear back within 2 hours" },
                    { icon: "💬", text: "We'll notify you on WhatsApp when your chat is approved" },
                    { icon: "✅", text: "Once approved, open it from Active Chats at the bottom right" },
                  ].map(({ icon, text }) => (
                    <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ flexShrink: 0 }}>{icon}</span>
                      <span style={{ fontSize: 13, color: "#5a3a1a", lineHeight: 1.5 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Install App highlight */}
              <a href="https://tendr-1.vercel.app" target="_blank" rel="noopener noreferrer"
                onClick={e => { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,rgba(196,122,46,0.1),rgba(204,171,74,0.08))", border: "1.5px solid rgba(196,122,46,0.28)", borderRadius: 10, padding: "10px 16px", maxWidth: 320, textDecoration: "none", cursor: "pointer" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📲</span>
                <span style={{ fontSize: 12, color: "#C47A2E", fontWeight: 700, lineHeight: 1.4 }}>Install the Tendr App for instant notifications when your chat is approved</span>
              </a>
              <button onClick={handleMinimize}
                style={{ marginTop: 4, padding: "9px 20px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                Minimise & wait
              </button>
            </div>
          )}

          {/* Q&A recap as chat bubbles — new chats only, shown below waiting state */}
          {botDone && !approved && !isExistingChat && botFlow.filter(s => botAnswers[s.key]).length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {botFlow.filter(s => botAnswers[s.key]).map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ alignSelf: "flex-start", maxWidth: "80%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "9px 13px", boxShadow: "0 1px 5px rgba(0,0,0,0.05)", fontSize: 13, color: "#1a1a1a" }}>{step.question}</div>
                  <div style={{ alignSelf: "flex-end", maxWidth: "80%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", borderRadius: "16px 16px 4px 16px", padding: "9px 13px", fontSize: 13, color: "#fff", fontWeight: 600 }}>{botAnswers[step.key]}</div>
                </div>
              ))}
              {confirmedPkg && (() => {
                const tier = confirmedPkg.replace(" Package", "");
                const pkg = chatPackages.find(p => p.tier === tier);
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ alignSelf: "flex-start", maxWidth: "80%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "9px 13px", boxShadow: "0 1px 5px rgba(0,0,0,0.05)", fontSize: 13, color: "#1a1a1a" }}>📦 Which package suits your needs?</div>
                    <div style={{ alignSelf: "flex-end", maxWidth: "84%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", borderRadius: "16px 16px 4px 16px", padding: "9px 13px", fontSize: 13, color: "#fff", fontWeight: 600, whiteSpace: "pre-wrap" }}>
                      {confirmedPkg}{pkg?.items?.length ? "\n" + pkg.items.join(" · ") : ""}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Install App banner — shown once when chat first gets approved */}
          {justApproved && (
            <div style={{ alignSelf: "stretch", margin: "8px 4px", background: "linear-gradient(135deg,rgba(196,122,46,0.1),rgba(204,171,74,0.08))", border: "1.5px solid rgba(196,122,46,0.28)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>📲</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#C47A2E", marginBottom: 2 }}>Your chat is now live!</div>
                <div style={{ fontSize: 11, color: "#7A5535", lineHeight: 1.4 }}>Install the app to never miss a message from {vendor?.name}.</div>
              </div>
              <a href="/install"
                style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 8, background: "#C47A2E", color: "#fff", fontSize: 11, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                Install →
              </a>
              <button onClick={() => setJustApproved(false)}
                style={{ flexShrink: 0, background: "none", border: "none", color: "#9B7450", fontSize: 14, cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>
            </div>
          )}

          {/* Chat messages */}
          {(approved || isExistingChat) && messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.sender === "user" ? "flex-end" : msg.sender === "system" ? "center" : "flex-start", maxWidth: "80%" }}>
              {msg.sender === "system" ? (
                <div style={{ fontSize: 12, color: "#9B7450", textAlign: "center", padding: "2px 8px" }}>{renderMsg(msg.text)}</div>
              ) : (
                <div style={{
                  background: msg.sender === "user" ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#fff",
                  color: msg.sender === "user" ? "#fff" : "#1a1a1a",
                  padding: "9px 13px",
                  borderRadius: msg.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  fontSize: 13, lineHeight: 1.5,
                  boxShadow: msg.sender === "user" ? "0 2px 8px rgba(196,122,46,0.25)" : "0 1px 4px rgba(0,0,0,0.07)",
                }}>
                  {renderMsg(msg.text)}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input + action bar ── */}
        <div style={{ borderTop: "1px solid rgba(196,122,46,0.1)", padding: "10px 14px", paddingBottom: isMobile ? "calc(10px + env(safe-area-inset-bottom, 0px))" : "10px", flexShrink: 0, background: "#fff", position: "relative" }}>
          {/* Suggested questions — hidden by default, toggled by arrow */}
          {(approved || isExistingChat) && !messagesLoading && (() => {
            const QA = {
              Photographer: ["What is your style — candid or traditional?","How many hours are included?","Do you have backup equipment?","How long for edited photos?","Can we see a full gallery?"],
              Decorator:    ["Can you visit the venue first?","Do you handle setup and cleanup?","Can you work with our colour theme?","What is your cancellation policy?","Do you provide fresh or artificial flowers?"],
              Caterer:      ["Is your quote per plate or flat fee?","Can we do a tasting?","Do you handle serving staff?","What is included — crockery, chafing dishes?","What is your minimum guest count?"],
              DJ:           ["Do you do a playlist session before the event?","Can you take guest requests?","What if equipment fails?","Do you provide sound and lighting both?","How early do you arrive to set up?"],
            };
            const questions = QA[vendor?.serviceType] || ["What packages do you offer?","What is your availability?","Can you share pricing?","What is included?","Can we schedule a call?"];
            return (
              <div style={{ borderTop: "1px solid rgba(196,122,46,0.08)", background: "#FDFCF8" }}>
                <button onClick={() => setShowSuggestions(p => !p)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 12px", background: "none", border: "none", cursor: "pointer", fontFamily: font }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", letterSpacing: "0.08em", textTransform: "uppercase" }}>Quick questions</span>
                  <span style={{ fontSize: 12, color: "#C47A2E", transition: "transform 0.2s", display: "inline-block", transform: showSuggestions ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                </button>
                {showSuggestions && (
                  <div style={{ padding: "4px 12px 8px", display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {questions.map(q => (
                      <button key={q} onClick={() => { sendText(q); setShowSuggestions(false); }}
                        style={{ whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.22)", background: "#fff", color: "#6B3A1F", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: font, transition: "all 0.12s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.07)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.45)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.22)"; }}
                      >{q}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}


          {(approved || isExistingChat) ? (
            <>
              {/* Message row */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <label title="Attach image" style={{ width: 34, height: 34, borderRadius: "50%", background: "#f5f0ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: approved ? "pointer" : "not-allowed", flexShrink: 0, opacity: approved ? 1 : 0.4 }}>
                  📌
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={approved ? sendImage : undefined} disabled={!approved} />
                </label>
                <input
                  value={text}
                  onChange={e => approved && setText(e.target.value)}
                  onKeyDown={e => approved && e.key === "Enter" && !e.shiftKey && sendText()}
                  placeholder={approved ? "Write your message…" : "Waiting for approval…"}
                  disabled={!approved}
                  style={{ flex: 1, padding: "9px 14px", borderRadius: 100, border: `1.5px solid ${approved ? "rgba(196,122,46,0.22)" : "rgba(0,0,0,0.08)"}`, fontSize: 13, fontFamily: font, outline: "none", background: approved ? "#fff" : "#f5f5f5", color: approved ? "inherit" : "#bbb", cursor: approved ? "text" : "not-allowed" }}
                />
                <button onClick={sendText} disabled={!text.trim() || !approved}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: text.trim() && approved ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: "#fff", cursor: text.trim() && approved ? "pointer" : "not-allowed", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  ➤
                </button>
              </div>
              {/* Review & Pay + Book Other Vendors — shows after vendor/concierge is finalised */}
              {isThisVendorFinalised && (() => {
                const bookedCount = Object.keys(finalisedVendors).length;
                const totalCount  = selectedVendorTypes.length;
                return (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <button
                        onClick={() => setShowReviewPopup(true)}
                        style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "'Outfit', sans-serif", cursor: "pointer", boxShadow: "0 3px 12px rgba(21,128,61,0.35)" }}
                      >
                        Review & Pay →
                      </button>
                      <button
                        onClick={() => { closeChat(); router.navigate("/listings"); }}
                        style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: "pointer" }}
                      >
                        Book Other Vendors
                      </button>
                    </div>
                    {totalCount > 0 && (
                      <div style={{ textAlign: "center", fontSize: 11, color: "#9B7450", fontWeight: 600 }}>
                        {bookedCount}/{totalCount} vendors booked
                        {bookedCount < totalCount && <span style={{ color: "#C47A2E" }}> — {totalCount - bookedCount} more to go</span>}
                      </div>
                    )}
                  </div>
                );
              })()}
              {/* Action buttons row — only after chat is approved */}
              {approved && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                  {!chatCompleted ? (
                    <p style={{ fontSize: 11, color: "#7A5535", margin: 0, fontWeight: 600, borderLeft: "3px solid #C47A2E", paddingLeft: 8, lineHeight: 1.4 }}>
                      Click <b>Mark as Done</b> when price is finalised
                    </p>
                  ) : <span />}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => setChatCompleted(true)}
                    disabled={chatCompleted}
                    style={{ padding: "6px 14px", borderRadius: 100, border: "none", background: chatCompleted ? "#f0fdf4" : "linear-gradient(135deg,#0369a1,#3b82f6)", color: chatCompleted ? "#15803d" : "#fff", fontSize: 12, fontWeight: 700, cursor: chatCompleted ? "default" : "pointer", fontFamily: font, whiteSpace: "nowrap" }}
                  >
                    {chatCompleted ? "✓ Completed" : "Chat Completed"}
                  </button>
                  <button
                    onClick={handleFinalise}
                    disabled={!chatCompleted || isThisVendorFinalised}
                    title={!chatCompleted ? "Mark chat as completed first" : ""}
                    style={{ padding: "6px 14px", borderRadius: 100, border: "none", background: isThisVendorFinalised ? "linear-gradient(135deg,#15803d,#22c55e)" : !chatCompleted ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: (!chatCompleted && !isThisVendorFinalised) ? "#9ca3af" : "#fff", fontSize: 12, fontWeight: 700, cursor: (!chatCompleted && !isThisVendorFinalised) ? "not-allowed" : "pointer", fontFamily: font, whiteSpace: "nowrap", boxShadow: (chatCompleted && !isThisVendorFinalised) ? "0 2px 8px rgba(196,122,46,0.35)" : "none" }}
                  >
                    {isThisVendorFinalised ? "✓ Finalised" : "Finalise Vendor"}
                  </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", fontSize: 12, color: "#9B7450", padding: "4px 0" }}>
              {botDone ? "Waiting for team approval…" : showPkgStep ? "Choose a package or skip to continue" : "Answer the questions above to continue"}
            </div>
          )}
        </div>

        {/* ── Review & Pay popup — full modal overlay (not clipped by input bar) ── */}
        {showReviewPopup && (
          <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 24 }}>
            <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "28px 24px", width: "85%", maxWidth: 340, boxShadow: "0 20px 60px rgba(44,26,14,0.25)", fontFamily: font, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px" }}>Ready to proceed?</h3>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 20px", lineHeight: 1.6 }}>
                Complete your booking now, or browse more vendors first.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => { closeChat(); router.navigate("/booking/review"); }}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Continue to Booking →
                </button>
                <button onClick={() => { closeChat(); router.navigate("/listings"); }}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Browse More Vendors
                </button>
                <button onClick={() => setShowReviewPopup(false)}
                  style={{ fontSize: 12, color: "#9B7450", background: "none", border: "none", cursor: "pointer", fontFamily: font }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Messages loading spinner ── */}
        {messagesLoading && (
          <div style={{ position: "absolute", inset: 0, zIndex: 15, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,252,245,0.85)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <style>{`@keyframes vcm-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(196,122,46,0.2)", borderTopColor: "#C47A2E", animation: "vcm-spin 0.7s linear infinite" }} />
              <span style={{ fontSize: 13, color: "#9B7450", fontFamily: font }}>Loading messages…</span>
            </div>
          </div>
        )}
      </div>

      {/* Gallery Picker Modal */}
      {galleryOpen && (
        <>
          {!isMobile && (
            <div onClick={() => setGalleryOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 1300, background: "rgba(0,0,0,0.45)" }} />
          )}
          <div style={isMobile ? {
            position: "fixed", left: 0, right: 0,
            bottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
            zIndex: 1301, background: "#FFFCF5",
            borderRadius: "20px 20px 0 0", maxHeight: "70vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          } : {
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 1301, background: "#FFFCF5",
            borderRadius: 20, width: "min(94vw, 640px)",
            maxHeight: "80vh", display: "flex", flexDirection: "column",
            boxShadow: "0 32px 80px rgba(44,26,14,0.22)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", fontFamily: font }}>Decoration Gallery</div>
                <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2, fontFamily: font }}>
                  Tap to select{gallerySelected.length > 0 ? ` · ${gallerySelected.length} selected` : ""}
                </div>
              </div>
              <button onClick={() => setGalleryOpen(false)}
                style={{ background: "none", border: "none", fontSize: 18, color: "#9B7450", cursor: "pointer", padding: "4px 8px" }}>✕</button>
            </div>
            {/* Photo grid */}
            <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
              {galleryLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#9B7450", fontFamily: font }}>Loading…</div>
              ) : galleryPhotos.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#9B7450", fontFamily: font }}>No photos available</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {galleryPhotos.map(p => {
                    const sel = gallerySelected.includes(p.imageUrl);
                    return (
                      <div key={p.imageUrl} onClick={() => toggleGallerySelect(p.imageUrl)}
                        style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: `2.5px solid ${sel ? "#C47A2E" : "transparent"}` }}>
                        <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        {sel && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(196,122,46,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#C47A2E", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 900 }}>✓</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Footer */}
            <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(196,122,46,0.12)", flexShrink: 0, display: "flex", gap: 8 }}>
              {gallerySelected.length > 0 && (
                <button onClick={() => { setSelectedRefPhotos(gallerySelected.map(url => ({ src: url }))); setGalleryOpen(false); }}
                  style={{ flex: 2, padding: "12px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Add {gallerySelected.length} photo{gallerySelected.length !== 1 ? "s" : ""} →
                </button>
              )}
              <button onClick={() => setGalleryOpen(false)}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

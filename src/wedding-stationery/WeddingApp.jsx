/**
 * Wedding Stationery Design + Ordering System
 * ============================================
 * Standalone sub-app running at /wedding/*
 * Uses localStorage for orders — no backend required.
 *
 * Routes:
 *   /wedding           → StationeryPicker (15 stationery types)
 *   /wedding/design/:type → TemplateDesigner (live preview + customiser)
 *   /wedding/order     → OrderForm
 *   /wedding/confirmation → OrderConfirmation
 *   /wedding/admin     → AdminDashboard (orders table)
 *
 * To enable in the main app, uncomment the route in src/router.jsx:
 *   { path: "/wedding/*", element: <WeddingApp /> }
 */

import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import StationeryPicker    from "./components/StationeryPicker";
import TemplateDesigner    from "./components/TemplateDesigner";
import OrderForm           from "./components/OrderForm";
import OrderConfirmation   from "./components/OrderConfirmation";
import AdminDashboard      from "./components/AdminDashboard";

// Load Google Fonts globally for the stationery sub-app
function FontLoader() {
  useEffect(() => {
    const id = "ws-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id   = id;
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Raleway:wght@300;400;600&family=Great+Vibes&family=Montserrat:wght@300;400;600&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
}

export default function WeddingApp() {
  return (
    <>
      <FontLoader />
      <Routes>
        <Route index                   element={<StationeryPicker />} />
        <Route path="design/:type"     element={<TemplateDesigner />} />
        <Route path="order"            element={<OrderForm />} />
        <Route path="confirmation"     element={<OrderConfirmation />} />
        <Route path="admin"            element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const CART_KEY = "tendr_stationery_cart";

const StationeryCartContext = createContext(null);

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
}

function saveCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
  window.dispatchEvent(new CustomEvent("tendr:stationery-cart-changed"));
}

export function StationeryCartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  // Keep localStorage in sync
  useEffect(() => { saveCart(cart); }, [cart]);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => { if (e.key === CART_KEY) setCart(loadCart()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const cartCount = cart.reduce((s, c) => s + Number(c.quantity), 0);

  const addToCart = useCallback((item, quantity) => {
    setCart(prev => {
      const id = item._id || item.id;
      const exists = prev.find(c => (c.item._id || c.item.id) === id);
      if (exists) return prev.map(c => (c.item._id || c.item.id) === id ? { ...c, quantity: Number(quantity) } : c);
      return [...prev, { item, quantity: Number(quantity) }];
    });
  }, []);

  const removeFromCart = useCallback((item) => {
    const id = item._id || item.id;
    setCart(prev => prev.filter(c => (c.item._id || c.item.id) !== id));
  }, []);

  const updateQty = useCallback((item, quantity) => {
    if (quantity < 1) return;
    const id = item._id || item.id;
    setCart(prev => prev.map(c => (c.item._id || c.item.id) === id ? { ...c, quantity: Number(quantity) } : c));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const itemInCart = useCallback((item) => {
    const id = item._id || item.id;
    return cart.find(c => (c.item._id || c.item.id) === id);
  }, [cart]);

  return (
    <StationeryCartContext.Provider value={{ cart, cartCount, addToCart, removeFromCart, updateQty, clearCart, itemInCart }}>
      {children}
    </StationeryCartContext.Provider>
  );
}

export function useStationeryCart() {
  const ctx = useContext(StationeryCartContext);
  if (!ctx) throw new Error("useStationeryCart must be used inside StationeryCartProvider");
  return ctx;
}

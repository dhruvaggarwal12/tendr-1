import { createContext, useContext, useState, useCallback } from "react";

const BookVendorsContext = createContext(null);

export function BookVendorsProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openBookVendors = useCallback(() => setOpen(true), []);
  const closeBookVendors = useCallback(() => setOpen(false), []);

  return (
    <BookVendorsContext.Provider value={{ open, openBookVendors, closeBookVendors }}>
      {children}
    </BookVendorsContext.Provider>
  );
}

export function useBookVendors() {
  const ctx = useContext(BookVendorsContext);
  if (!ctx) throw new Error("useBookVendors must be used within a BookVendorsProvider");
  return ctx;
}

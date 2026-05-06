// redux/listingFiltersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const loadFilters = () => {
  try {
    const saved = localStorage.getItem("listingFilters");
    return saved ? JSON.parse(saved) : {};
  } catch (err) {
    console.error("Failed to load saved filters:", err);
    return {};
  }
};

// Clean up any stale localStorage keys from the old implementation
try { localStorage.removeItem("compareSelected"); localStorage.removeItem("finalisedVendors"); } catch {}

const loadCompareSelected = () => {
  try {
    const saved = sessionStorage.getItem("compareSelected");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveCompareSelected = (arr) => {
  try { sessionStorage.setItem("compareSelected", JSON.stringify(arr)); } catch {}
};

const loadFinalisedVendors = () => {
  try {
    const saved = sessionStorage.getItem("finalisedVendors");
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};

const saveFinalisedVendors = (obj) => {
  try { sessionStorage.setItem("finalisedVendors", JSON.stringify(obj)); } catch {}
};

const initialState = {
  eventType: "",
  serviceType: "",
  locationType: "",
  date: "",
  guestCount: 0,
  compareSelected: loadCompareSelected(),
  finalisedVendors: loadFinalisedVendors(),
  ...loadFilters(),
};

const listingFiltersSlice = createSlice({
  name: "listingFilters",
  initialState,
  reducers: {
    setFilters(state, action) {
      const { compareSelected, ...rest } = action.payload;
      const newState = { ...state, ...rest };
      localStorage.setItem("listingFilters", JSON.stringify({ ...newState, compareSelected: undefined }));
      return newState;
    },
    resetFilters(state) {
      localStorage.removeItem("listingFilters");
      return {
        eventType: "",
        serviceType: "",
        locationType: "",
        date: "",
        guestCount: 0,
        compareSelected: state.compareSelected,
      };
    },
    addVendorToCompare(state, action) {
      const vendor = action.payload;
      if (!state.compareSelected.find((v) => v._id === vendor._id)) {
        state.compareSelected.push(vendor);
        saveCompareSelected(state.compareSelected);
      }
    },
    removeVendorFromCompare(state, action) {
      state.compareSelected = state.compareSelected.filter((v) => v._id !== action.payload);
      saveCompareSelected(state.compareSelected);
    },
    clearVendorCompare(state) {
      state.compareSelected = [];
      saveCompareSelected([]);
    },
    setFinalisedVendor(state, action) {
      const vendor = action.payload;
      const key = vendor?.serviceType || "Other";
      state.finalisedVendors = { ...state.finalisedVendors, [key]: vendor };
      saveFinalisedVendors(state.finalisedVendors);
    },
    clearFinalisedVendor(state, action) {
      const key = action.payload;
      if (key) {
        const updated = { ...state.finalisedVendors };
        delete updated[key];
        state.finalisedVendors = updated;
      } else {
        state.finalisedVendors = {};
      }
      saveFinalisedVendors(state.finalisedVendors);
    },
  },
});

export const { setFilters, resetFilters, addVendorToCompare, removeVendorFromCompare, clearVendorCompare, setFinalisedVendor, clearFinalisedVendor } = listingFiltersSlice.actions;
export default listingFiltersSlice.reducer;

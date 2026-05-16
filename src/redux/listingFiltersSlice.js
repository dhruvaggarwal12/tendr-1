// redux/listingFiltersSlice.js
import { createSlice } from "@reduxjs/toolkit";
// Use string literals to avoid circular import with authSlice
const LOGOUT_TYPE   = 'auth/logout/fulfilled';
const LOGIN_TYPE    = 'auth/login/fulfilled';
const VERIFY_TYPE   = 'auth/verifyOtp/fulfilled';

const loadFilters = () => {
  try {
    const saved = localStorage.getItem("listingFilters");
    return saved ? JSON.parse(saved) : {};
  } catch (err) {
    console.error("Failed to load saved filters:", err);
    return {};
  }
};

// Get current user ID for scoped storage
const getUserId = () => {
  try {
    const u = localStorage.getItem('tendr_user');
    return u ? JSON.parse(u)._id : 'guest';
  } catch { return 'guest'; }
};

const loadCompareSelected = () => {
  try {
    const uid = getUserId();
    const saved = localStorage.getItem(`compareSelected_${uid}`);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveCompareSelected = (arr) => {
  try {
    const uid = getUserId();
    localStorage.setItem(`compareSelected_${uid}`, JSON.stringify(arr));
  } catch {}
};

const TTL_24H = 24 * 60 * 60 * 1000;

const loadFinalisedVendors = () => {
  try {
    const uid = getUserId();
    const raw = localStorage.getItem(`finalisedVendors_${uid}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Support both plain object (legacy) and TTL-wrapped format
    if (parsed && parsed.__expiresAt) {
      if (Date.now() > parsed.__expiresAt) {
        localStorage.removeItem(`finalisedVendors_${uid}`);
        return {};
      }
      const { __expiresAt, ...data } = parsed;
      return data;
    }
    return parsed;
  } catch { return {}; }
};

const saveFinalisedVendors = (obj) => {
  try {
    const uid = getUserId();
    const withTTL = { ...obj, __expiresAt: Date.now() + TTL_24H };
    localStorage.setItem(`finalisedVendors_${uid}`, JSON.stringify(withTTL));
  } catch {}
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

const listingFiltersReducer = listingFiltersSlice.reducer;
const listingFiltersWithLogout = (state, action) => {
  // On logout: wipe in-memory state; user-scoped localStorage keys are kept as cache
  if (action.type === LOGOUT_TYPE) {
    return { ...state, compareSelected: [], finalisedVendors: {} };
  }
  // On login/signup: DB data is the source of truth (included in consumer payload).
  // Fall back to user-scoped localStorage if DB data is absent.
  // auth reducer runs first → tendr_user already set in localStorage by this point.
  if (
    action.type === LOGIN_TYPE ||
    action.type === VERIFY_TYPE
  ) {
    const dbSelections = action.payload?.consumer?.vendorSelections;
    const compareSelected = dbSelections?.compareSelected?.length
      ? dbSelections.compareSelected
      : loadCompareSelected();
    const finalisedVendors =
      dbSelections?.finalisedVendors && Object.keys(dbSelections.finalisedVendors).length
        ? dbSelections.finalisedVendors
        : loadFinalisedVendors();
    // Keep localStorage cache in sync
    saveCompareSelected(compareSelected);
    saveFinalisedVendors(finalisedVendors);
    return { ...state, compareSelected, finalisedVendors };
  }
  return listingFiltersReducer(state, action);
};

export const { setFilters, resetFilters, addVendorToCompare, removeVendorFromCompare, clearVendorCompare, setFinalisedVendor, clearFinalisedVendor } = listingFiltersSlice.actions;
export default listingFiltersWithLogout;

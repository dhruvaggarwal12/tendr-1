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

const TTL_24H = 7 * 24 * 60 * 60 * 1000; // 7 days — so vendors stay after dashboard revisit

const loadFinalisedVendors = () => {
  // Try user-specific key first, fall back to simple key, then empty
  const uid = getUserId();
  return loadFinalisedVendorsFromKey(`finalisedVendors_${uid}`)
      || loadFinalisedVendorsFromKey('tendr_finalised')
      || {};
};

const saveFinalisedVendors = (obj) => {
  try {
    const uid = getUserId();
    const withTTL = { ...obj, __expiresAt: Date.now() + TTL_24H };
    const encoded = JSON.stringify(withTTL);
    // Save to both user-specific AND a simple fallback key for reliability
    localStorage.setItem(`finalisedVendors_${uid}`, encoded);
    localStorage.setItem('tendr_finalised', encoded);
  } catch {}
};

const loadFinalisedVendorsFromKey = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.__expiresAt) {
      if (Date.now() > parsed.__expiresAt) {
        localStorage.removeItem(key);
        return null;
      }
      const { __expiresAt, ...data } = parsed;
      return Object.keys(data).length > 0 ? data : null;
    }
    return parsed && Object.keys(parsed).length > 0 ? parsed : null;
  } catch { return null; }
};

// loadFilters may have stale finalisedVendors — exclude it so the
// dedicated loadFinalisedVendors() (with TTL) is always the source of truth
const { finalisedVendors: _ignored, compareSelected: _ignored2, ...savedFilters } = loadFilters();

const initialState = {
  eventType: "",
  serviceType: "",
  locationType: "",
  date: "",
  guestCount: 0,
  corporateOnly: false,
  ...savedFilters,
  compareSelected: loadCompareSelected(),
  finalisedVendors: loadFinalisedVendors(),
};

const listingFiltersSlice = createSlice({
  name: "listingFilters",
  initialState,
  reducers: {
    setFilters(state, action) {
      const { compareSelected, finalisedVendors: _fv, ...rest } = action.payload;
      const newState = { ...state, ...rest };
      // Never save compareSelected or finalisedVendors here — they have their own storage
      const { compareSelected: _cs, finalisedVendors: _fv2, ...toSave } = newState;
      localStorage.setItem("listingFilters", JSON.stringify(toSave));
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
      // Support multiple vendors per category — stored as an array
      const existing = state.finalisedVendors[key];
      let arr = Array.isArray(existing) ? existing : existing ? [existing] : [];
      // Deduplicate by _id
      if (!arr.find(v => v._id === vendor._id)) arr = [...arr, vendor];
      state.finalisedVendors = { ...state.finalisedVendors, [key]: arr };
      saveFinalisedVendors(state.finalisedVendors);
    },
    clearFinalisedVendor(state, action) {
      const key = action.payload;
      if (key) {
        const updated = { ...state.finalisedVendors };
        delete updated[key];
        state.finalisedVendors = updated;
        saveFinalisedVendors(state.finalisedVendors);
      } else {
        // Full clear — remove localStorage keys entirely instead of saving empty object
        state.finalisedVendors = {};
        try {
          localStorage.removeItem('tendr_finalised');
          // Remove ALL user-scoped keys (handles guest + any logged-in user)
          Object.keys(localStorage)
            .filter(k => k.startsWith('finalisedVendors_'))
            .forEach(k => localStorage.removeItem(k));
        } catch {}
      }
    },
  },
});

const listingFiltersReducer = listingFiltersSlice.reducer;
const listingFiltersWithLogout = (state, action) => {
  // On logout: wipe in-memory state; user-scoped localStorage keys are kept as cache
  if (action.type === LOGOUT_TYPE) {
    // Clear both keys on logout
    try {
      localStorage.removeItem('tendr_finalised');
      localStorage.removeItem(`finalisedVendors_${getUserId()}`);
    } catch {}
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

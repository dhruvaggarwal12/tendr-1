// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   formData: {
//     eventName: '',
//     eventType: '',
//     guests: '',
//     budget: '',
//     location: '',
//     date: '',
//     additionalInfo: '',
//   },
//   currentStep: 0,
//   showVendorScreen: false,
//   selectedVendors: [],
//   bookingType: "you-do-it",
// };

// const eventPlanningSlice = createSlice({
//   name: 'eventPlanning',
//   initialState,
//   reducers: {
//     setFormData: (state, action) => {
//       const { field, value } = action.payload;
//       state.formData[field] = value;
//     },
//     goToNextStep: (state) => {
//       state.currentStep += 1;
//     },
//     goToPreviousStep: (state) => {
//       if (state.currentStep > 0) state.currentStep -= 1;
//     },
//     showVendorScreenAction: (state) => {
//       state.showVendorScreen = true;
//     },
//     backToFormAction: (state) => {
//       state.showVendorScreen = false;
//     },
//     addSelectedVendor: (state, action) => {
//       if (!state.selectedVendors.includes(action.payload)) {
//         state.selectedVendors.push(action.payload);
//       }
//     },
//     resetEventPlanning: () => initialState,
//   },
// });

// export const {
//   setFormData,
//   goToNextStep,
//   goToPreviousStep,
//   showVendorScreenAction,
//   backToFormAction, // ← ✅ ensure this line exists
//   addSelectedVendor,
//   resetEventPlanning,
// } = eventPlanningSlice.actions;

// export default eventPlanningSlice.reducer;

// export const selectEventPlanning = (state) => state.eventPlanning;
// export const selectFormData = (state) => state.eventPlanning.formData;
// export const selectCurrentStep = (state) => state.eventPlanning.currentStep;
// export const selectShowVendors = (state) => state.eventPlanning.showVendorScreen;
// export const selectSelectedVendors = (state) => state.eventPlanning.selectedVendors;


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { saveUserEventData, loadUserEventData } from "../apis/userApi";
const LOGOUT_TYPE = 'auth/logout/fulfilled';

const BACKEND_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Load saved event data from backend on login — respects 24h TTL */
export const fetchEventData = createAsyncThunk(
  "eventPlanning/fetchEventData",
  async (token, { rejectWithValue }) => {
    try {
      const data = await loadUserEventData(token);
      if (!data) return null;
      // Check 24h TTL stamped at save time
      if (data.__savedAt && Date.now() - data.__savedAt > BACKEND_TTL_MS) {
        // Expired — clear from backend and don't restore
        saveUserEventData(token, {});
        return null;
      }
      // Strip the internal timestamp before merging into Redux state
      const { __savedAt, ...formData } = data;
      return Object.keys(formData).length ? formData : null;
    } catch (err) {
      return rejectWithValue(err?.message);
    }
  }
);

let _saveTimer = null;
const debouncedSaveToBackend = (formData, token) => {
  if (!token) return;
  clearTimeout(_saveTimer);
  // Include __savedAt so the TTL can be enforced when data is loaded on next login
  _saveTimer = setTimeout(() => saveUserEventData(token, { ...formData, __savedAt: Date.now() }), 1500);
};

const loadFormData = () => {
  try {
    const saved = localStorage.getItem("eventPlanningFormData");
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};

const saveFormData = (formData) => {
  try { localStorage.setItem("eventPlanningFormData", JSON.stringify(formData)); } catch {}
};

/** Example async submit (replace with your real API) */
export const submitEventPlan = createAsyncThunk(
  "eventPlanning/submitEventPlan",
  async (formData, { getState, rejectWithValue }) => {
    try {
      // const res = await api.saveEvent(formData)
      // return res.data   // must include bookingId
      await new Promise((r) => setTimeout(r, 400));
      const { eventPlanning } = getState();
      return {
        bookingId: crypto?.randomUUID?.() || String(Date.now()),
        bookingType: eventPlanning.bookingType,
        formData,
      };
    } catch (err) {
      return rejectWithValue(err?.message || "Submit failed");
    }
  }
);

const SESSION_KEY = 'tendr_ep_session';
const SESSION_TTL = 24 * 60 * 60 * 1000; // fallback: 24h when no event date is set

const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem('tendr_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const eventDate = parsed.formData?.date;
    if (eventDate) {
      // Keep session until event date + 1 day so chat progress is never lost before the event
      const eventExpiry = new Date(eventDate).getTime() + 24 * 60 * 60 * 1000;
      if (Date.now() > eventExpiry) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
    } else {
      // No event date set yet: use 24h sliding TTL
      if (parsed.__savedAt && Date.now() - parsed.__savedAt > SESSION_TTL) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
    }
    return parsed;
  } catch { return null; }
};
const saveSession = (state) => {
  try {
    const data = {
      formData: state.formData,
      categoryBudgets: state.categoryBudgets,
      bookingType: state.bookingType,
      currentStep: state.currentStep,
      showVendorScreen: state.showVendorScreen,
      selectedVendors: state.selectedVendors,
      __savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
};
const savedSession = loadSession();

const initialState = {
  formData: savedSession?.formData || {
    eventType: "",
    guests: "",
    budget: "",
    location: "",
    date: "",
    companyName: "", // corporate only
  },
  categoryBudgets: savedSession?.categoryBudgets || {}, // { Caterer: 25000, DJ: 10000, ... }
  currentStep: savedSession?.currentStep || 0,
  showVendorScreen: savedSession?.showVendorScreen || false,
  selectedVendors: savedSession?.selectedVendors || [],
  bookingType: savedSession?.bookingType || "", // 'you-do-it' | 'let-us-do-it'
  submitting: false,
  submitError: null,
  lastSubmission: null, // { bookingId, bookingType }
};

const eventPlanningSlice = createSlice({
  name: "eventPlanning",
  initialState,
  reducers: {
    setFormData: (state, action) => {
      const { field, value, token } = action.payload;
      state.formData[field] = value;
      saveFormData(state.formData);
      saveSession(state);
      debouncedSaveToBackend(state.formData, token);
    },
    setMultipleFormData: (state, action) => {
      const { token, ...fields } = action.payload || {};
      Object.entries(fields).forEach(([k, v]) => {
        if (k in state.formData) state.formData[k] = v;
      });
      saveFormData(state.formData);
      saveSession(state);
      debouncedSaveToBackend(state.formData, token);
    },
    setBookingType: (state, action) => {
      state.bookingType = action.payload || "you-do-it";
      saveSession(state);
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
      saveSession(state);
    },
    goToNextStep: (state) => {
      state.currentStep += 1;
      saveSession(state);
    },
    goToPreviousStep: (state) => {
      if (state.currentStep > 0) state.currentStep -= 1;
      saveSession(state);
    },
    showVendorScreenAction: (state) => {
      state.showVendorScreen = true;
      saveSession(state);
    },
    backToFormAction: (state) => {
      state.showVendorScreen = false;
      saveSession(state);
    },
    addSelectedVendor: (state, action) => {
      const id = action.payload;
      if (id && !state.selectedVendors.includes(id)) {
        state.selectedVendors.push(id);
        saveSession(state);
      }
    },
    removeSelectedVendor: (state, action) => {
      const id = action.payload;
      state.selectedVendors = state.selectedVendors.filter((v) => v !== id);
      saveSession(state);
    },
    setSelectedVendors: (state, action) => {
      state.selectedVendors = Array.isArray(action.payload) ? action.payload : [];
      saveSession(state);
    },
    setCategoryBudgets: (state, action) => {
      state.categoryBudgets = action.payload || {};
      saveSession(state);
    },
    resetEventPlanning: () => {
      try {
        localStorage.removeItem("eventPlanningFormData");
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem("tendr_formData");
        sessionStorage.removeItem("tendr_session");
      } catch {}
      return {
        formData: { eventType: "", guests: "", budget: "", location: "", date: "" },
        categoryBudgets: {},
        currentStep: 0,
        showVendorScreen: false,
        selectedVendors: [],
        bookingType: "",
        submitting: false,
        submitError: null,
        lastSubmission: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitEventPlan.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitEventPlan.fulfilled, (state, action) => {
        state.submitting = false;
        state.lastSubmission = {
          bookingId: action.payload.bookingId,
          bookingType: action.payload.bookingType,
        };
      })
      .addCase(submitEventPlan.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload || "Submit failed";
      })
      .addCase(fetchEventData.fulfilled, (state, action) => {
        // Merge backend data, but only overwrite if backend has values (don't clobber local edits)
        const remote = action.payload;
        if (!remote) return;
        Object.entries(remote).forEach(([k, v]) => {
          if (v && k in state.formData && !state.formData[k]) {
            state.formData[k] = v;
          }
        });
        saveFormData(state.formData);
        saveSession(state);
      });
  },
});

export const {
  setFormData,
  setMultipleFormData,
  setBookingType,
  setCurrentStep,
  goToNextStep,
  goToPreviousStep,
  showVendorScreenAction,
  backToFormAction,
  addSelectedVendor,
  removeSelectedVendor,
  setSelectedVendors,
  setCategoryBudgets,
  resetEventPlanning,
} = eventPlanningSlice.actions;

const eventPlanningReducer = eventPlanningSlice.reducer;
const eventPlanningWithLogout = (state, action) => {
  if (action.type === LOGOUT_TYPE) {
    try {
      localStorage.removeItem("eventPlanningFormData");
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem("tendr_session");
    } catch {}
    return {
      formData: { eventType: "", guests: "", budget: "", location: "", date: "" },
      categoryBudgets: {},
      currentStep: 0,
      showVendorScreen: false,
      selectedVendors: [],
      bookingType: "",
      submitting: false,
      submitError: null,
      lastSubmission: null,
    };
  }
  return eventPlanningReducer(state, action);
};

export default eventPlanningWithLogout;

/** Selectors */
export const selectEventPlanning = (state) => state.eventPlanning;
export const selectFormData = (state) => state.eventPlanning.formData;
export const selectCurrentStep = (state) => state.eventPlanning.currentStep;
export const selectShowVendors = (state) =>
  state.eventPlanning.showVendorScreen;
export const selectSelectedVendors = (state) =>
  state.eventPlanning.selectedVendors;
export const selectBookingType = (state) => state.eventPlanning.bookingType;
export const selectSubmitting = (state) => state.eventPlanning.submitting;
export const selectSubmitError = (state) => state.eventPlanning.submitError;
export const selectLastSubmission = (state) =>
  state.eventPlanning.lastSubmission;

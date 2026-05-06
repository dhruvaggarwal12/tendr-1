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

const initialState = {
  formData: {
    eventName: "",
    eventType: "",
    guests: "",
    budget: "",
    location: "",
    date: "",
    additionalInfo: "",
  },
  currentStep: 0,
  showVendorScreen: false,
  selectedVendors: [],
  bookingType: "", // 'you-do-it' | 'let-us-do-it'
  submitting: false,
  submitError: null,
  lastSubmission: null, // { bookingId, bookingType }
};

const eventPlanningSlice = createSlice({
  name: "eventPlanning",
  initialState,
  reducers: {
    setFormData: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
      saveFormData(state.formData);
    },
    setMultipleFormData: (state, action) => {
      Object.entries(action.payload || {}).forEach(([k, v]) => {
        if (k in state.formData) state.formData[k] = v;
      });
      saveFormData(state.formData);
    },
    setBookingType: (state, action) => {
      state.bookingType = action.payload || "you-do-it";
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    goToNextStep: (state) => {
      state.currentStep += 1;
    },
    goToPreviousStep: (state) => {
      if (state.currentStep > 0) state.currentStep -= 1;
    },
    showVendorScreenAction: (state) => {
      state.showVendorScreen = true;
    },
    backToFormAction: (state) => {
      state.showVendorScreen = false;
    },
    addSelectedVendor: (state, action) => {
      const id = action.payload;
      if (id && !state.selectedVendors.includes(id)) {
        state.selectedVendors.push(id);
      }
    },
    removeSelectedVendor: (state, action) => {
      const id = action.payload;
      state.selectedVendors = state.selectedVendors.filter((v) => v !== id);
    },
    setSelectedVendors: (state, action) => {
      state.selectedVendors = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
    resetEventPlanning: () => {
      try { localStorage.removeItem("eventPlanningFormData"); } catch {}
      return {
        formData: {
          eventName: "",
          eventType: "",
          guests: "",
          budget: "",
          location: "",
          date: "",
          additionalInfo: "",
        },
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
  resetEventPlanning,
} = eventPlanningSlice.actions;

export default eventPlanningSlice.reducer;

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

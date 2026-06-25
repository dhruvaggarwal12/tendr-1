import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './redux/tendrSlice.js'
import authReducer from './redux/authSlice.js'
import eventPlanningReducer from './redux/eventPlanningSlice.js';
import listingFiltersReducer from './redux/listingFiltersSlice.js';
import giftHamperCartReducer from './redux/giftHamperCartSlice.js';
import funActivitiesCartReducer from './redux/funActivitiesCartSlice.js';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Debounce timer shared across dispatches
let _syncTimer = null;

// Middleware: whenever compareSelected or finalisedVendors change, save to DB after 1.5s idle
const vendorSyncMiddleware = store => next => action => {
  const result = next(action);

  const SYNC_ACTIONS = new Set([
    'listingFilters/addVendorToCompare',
    'listingFilters/removeVendorFromCompare',
    'listingFilters/clearVendorCompare',
    'listingFilters/setFinalisedVendor',
    'listingFilters/clearFinalisedVendor',
  ]);

  if (SYNC_ACTIONS.has(action.type)) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      const state = store.getState();
      const token = state.auth.token;
      if (!token) return;
      const { compareSelected, finalisedVendors } = state.listingFilters;
      fetch(`${BASE_URL}/consumers/me/vendor-selections`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ compareSelected, finalisedVendors }),
      }).catch(() => {});
    }, 1500);
  }

  return result;
};

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    eventPlanning: eventPlanningReducer,
    listingFilters: listingFiltersReducer,
    giftHamperCart: giftHamperCartReducer,
    funActivitiesCart: funActivitiesCartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(vendorSyncMiddleware),
})

export default store;

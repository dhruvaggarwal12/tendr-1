import { createSlice } from '@reduxjs/toolkit';

const stationeryBookingSlice = createSlice({
  name: 'stationeryBooking',
  initialState: { confirmed: false, form: null, cartSnapshot: [], customizations: null },
  reducers: {
    setStBooking(state, action) {
      state.form = action.payload.form;
      state.cartSnapshot = action.payload.cartSnapshot;
      state.customizations = action.payload.customizations || null;
      state.confirmed = true;
    },
    clearStBooking(state) {
      state.confirmed = false;
      state.form = null;
      state.cartSnapshot = [];
      state.customizations = null;
    },
  },
});

export const { setStBooking, clearStBooking } = stationeryBookingSlice.actions;
export const selectStConfirmed      = s => s.stationeryBooking.confirmed;
export const selectStForm           = s => s.stationeryBooking.form;
export const selectStCartSnapshot   = s => s.stationeryBooking.cartSnapshot;
export const selectStCustomizations = s => s.stationeryBooking.customizations;
export default stationeryBookingSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const stationeryBookingSlice = createSlice({
  name: 'stationeryBooking',
  initialState: { confirmed: false, form: null, cartSnapshot: [] },
  reducers: {
    setStBooking(state, action) {
      state.form = action.payload.form;
      state.cartSnapshot = action.payload.cartSnapshot;
      state.confirmed = true;
    },
    clearStBooking(state) {
      state.confirmed = false;
      state.form = null;
      state.cartSnapshot = [];
    },
  },
});

export const { setStBooking, clearStBooking } = stationeryBookingSlice.actions;
export const selectStConfirmed    = s => s.stationeryBooking.confirmed;
export const selectStForm         = s => s.stationeryBooking.form;
export const selectStCartSnapshot = s => s.stationeryBooking.cartSnapshot;
export default stationeryBookingSlice.reducer;

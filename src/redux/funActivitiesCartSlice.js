import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'fa_cart';

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};
const save = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

const funActivitiesCartSlice = createSlice({
  name: 'funActivitiesCart',
  initialState: { items: load() },
  reducers: {
    addActivity(state, action) {
      const { id, name, emoji, price, perUnit, unitLabel } = action.payload;
      const exists = state.items.find(i => i.id === id);
      if (!exists) {
        state.items.push({ id, name, emoji, price, perUnit: perUnit || false, unitLabel: unitLabel || '', form: null });
        save(state.items);
      }
    },
    removeActivity(state, action) {
      state.items = state.items.filter(i => i.id !== action.payload);
      save(state.items);
    },
    saveActivityForm(state, action) {
      const { id, form, totalPrice } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.form = form;
        item.totalPrice = totalPrice;
        save(state.items);
      }
    },
    clearFunCart(state) {
      state.items = [];
      save([]);
    },
  },
});

export const { addActivity, removeActivity, saveActivityForm, clearFunCart } = funActivitiesCartSlice.actions;
export const selectFunCartItems = s => s.funActivitiesCart.items;
export const selectFunCartCount = s => s.funActivitiesCart.items.length;
export const selectFunCartTotal = s => s.funActivitiesCart.items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
export default funActivitiesCartSlice.reducer;

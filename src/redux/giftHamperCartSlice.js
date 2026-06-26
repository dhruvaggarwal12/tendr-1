import { createSlice } from '@reduxjs/toolkit';

const load = () => {
  try { return JSON.parse(localStorage.getItem('gh_cart') || '[]'); }
  catch { return []; }
};
const save = (items) => localStorage.setItem('gh_cart', JSON.stringify(items));

const giftHamperCartSlice = createSlice({
  name: 'giftHamperCart',
  initialState: { items: load(), confirmed: false, deliveryForm: null },
  reducers: {
    addToCart(state, action) {
      const { product, quantity } = action.payload;
      const existing = state.items.find(i => i.productId === product._id);
      if (existing) {
        existing.quantity = Math.max(existing.quantity + quantity, product.minOrderQuantity || 1);
        existing.subtotal  = existing.pricePerUnit * existing.quantity;
      } else {
        const qty = Math.max(quantity, product.minOrderQuantity || 1);
        state.items.push({
          productId:     product._id,
          vendorId:      product.vendorId,
          name:          product.name,
          productNumber: product.productNumber || '',
          imageUrl:      product.images?.[0] || '',
          pricePerUnit:  product.pricePerUnit,
          quantity:      qty,
          subtotal:      product.pricePerUnit * qty,
          minOrderQuantity: product.minOrderQuantity || 1,
        });
      }
      save(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(i => i.productId !== action.payload);
      save(state.items);
    },
    updateQuantity(state, action) {
      const { productId, quantity } = action.payload;
      const item = state.items.find(i => i.productId === productId);
      if (item) {
        item.quantity = Math.max(quantity, item.minOrderQuantity || 1);
        item.subtotal = item.pricePerUnit * item.quantity;
      }
      save(state.items);
    },
    clearCart(state) {
      state.items = [];
      state.confirmed = false;
      state.deliveryForm = null;
      save([]);
    },
    setGhConfirmed(state, action) {
      state.confirmed = action.payload;
    },
    setGhDelivery(state, action) {
      state.deliveryForm = action.payload;
      state.confirmed = true;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setGhConfirmed, setGhDelivery } = giftHamperCartSlice.actions;
export const selectCartItems      = s => s.giftHamperCart.items;
export const selectCartTotal      = s => s.giftHamperCart.items.reduce((sum, i) => sum + i.subtotal, 0);
export const selectCartCount      = s => s.giftHamperCart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectGhConfirmed    = s => s.giftHamperCart.confirmed;
export const selectGhDeliveryForm = s => s.giftHamperCart.deliveryForm;
export default giftHamperCartSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  totalCount: 0,
};

export const cartSlice = createSlice({
  name: "cartSlice",
  initialState,
  reducers: {
    updateCart: (state, action) => {
      return action.payload;
    },
    clearCart: () => {
      return initialState;
    },
  },
});

export const { updateCart, clearCart } = cartSlice.actions;

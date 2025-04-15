import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  wishlists: [],
  totalCount: 0,
};

export const wishlistSlice = createSlice({
  name: "wishlistSlice",
  initialState,
  reducers: {
    updateWishlist: (state, action) => {
      return action.payload;
    },
    clearWishlist: () => {
      return initialState;
    },
  },
});

export const { updateWishlist, clearWishlist } = wishlistSlice.actions;

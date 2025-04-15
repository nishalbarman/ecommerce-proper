import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: null,
  code: null,
  off: 0,
  isPercentage: false,
  description: null,
  minPurchasePrice: null,
};

export const appliedCouponSlice = createSlice({
  name: "appliedCouponSlice",
  initialState,
  reducers: {
    updateAppliedCoupon: (state, { payload }) => {
      return { ...state, ...payload };
    },
    clearCouponData: () => {
      return initialState;
    },
  },
});

export const { updateAppliedCoupon, clearCouponData } =
  appliedCouponSlice.actions;

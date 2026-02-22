import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedPaymentMethod: null,
};

export const selectedPaymentMethodSlice = createSlice({
  name: "selectedPaymentMethod",
  initialState,
  reducers: {
    setSelectedPaymentMethod: (state, { payload }) => {
      state.selectedPaymentMethod = payload;
      
    },
    clearSelectedPaymentMethod: () => {
      return initialState;
    },
  },
});

export const { setSelectedPaymentMethod, clearSelectedPaymentMethod } = selectedPaymentMethodSlice.actions;

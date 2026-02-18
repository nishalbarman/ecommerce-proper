import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedAddress: null,
};

export const addressSlice = createSlice({
  name: "userAddress",
  initialState,
  reducers: {
    setUserSelectedAddress: (state, { payload }) => {
      console.log("What is selected address slice",payload)
      state.selectedAddress = payload;
      
    },
    clearAddressData: () => {
      return initialState;
    },
  },
});

export const { setUserSelectedAddress, clearAddressData } = addressSlice.actions;

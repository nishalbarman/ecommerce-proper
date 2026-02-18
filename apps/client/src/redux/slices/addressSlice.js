import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  defaultSelectedAddress: null,
};

export const addressSlice = createSlice({
  name: "userAddress",
  initialState,
  reducers: {
    setUserSelectedAddress: (state, { payload }) => {
      state.coordinates = { ...payload.coordinates };
      state.address = {
        ...payload.address,
        name: payload?.address?.name,
        streetName: payload?.address?.thoroughfare,
      };
    },
    clearAddressData: () => {
      return initialState;
    },
  },
});

export const { setUserSelectedAddress, clearAddressData } = addressSlice.actions;

import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  redirectTo: null,
  modalVisible: false,
};

export const loginModalSlice = createSlice({
  name: "loginModalSlice",
  initialState,
  reducers: {
    setLoginModalState: (state, { payload }) => {
      state.redirectTo = payload.redirectTo;
      state.modalVisible = payload.modalVisible;
    },
    clearLoginModalState: () => {
      return initialState;
    },
  },
});

export const { setAddressDataFromMap, clearAddressData } = loginModalSlice.actions;

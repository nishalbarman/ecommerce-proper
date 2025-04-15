import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: null,
  email: null,
  mobileNo: null,
  jwtToken: null,
  defaultSelectedAddress: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserAuthData: (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.mobileNo = action.payload.mobileNo;
      state.jwtToken = action.payload.jwtToken;
    },
    updateDefaultSelectedAddress: (state, action) => {
      state.defaultSelectedAddress = action.payload;
    },
    clearLoginSession: () => {
      return initialState;
    },
  },
});

export const {
  setUserAuthData,
  updateDefaultSelectedAddress,
  clearLoginSession,
} = authSlice.actions;

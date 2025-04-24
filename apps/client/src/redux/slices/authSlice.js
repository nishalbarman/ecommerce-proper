import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
  mobileNo: "",
  jwtToken: "",
  isAuthenticated: false,
  defaultSelectedAddress: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserAuth: (state, action) => {
      const { name, email, mobileNo, jwtToken } = action.payload;
      state.name = name || state.name;
      state.email = email || state.email;
      state.mobileNo = mobileNo || state.mobileNo;
      state.jwtToken = jwtToken || state.jwtToken;
      state.isAuthenticated = !!jwtToken;
    },
    updateDefaultSelectedAddress: (state, action) => {
      state.defaultSelectedAddress = action.payload;
    },
    clearLoginSession: (state) => {
      state.name = "";
      state.email = "";
      state.mobileNo = "";
      state.jwtToken = "";
      state.isAuthenticated = false;
      state.defaultSelectedAddress = null;
    },
    clearToken: (state) => {
      state.jwtToken = "";
      state.isAuthenticated = false;
    },
  },
});

export const {
  setUserAuth,
  updateDefaultSelectedAddress,
  clearLoginSession,
  clearToken,
} = authSlice.actions;

export default authSlice.reducer;

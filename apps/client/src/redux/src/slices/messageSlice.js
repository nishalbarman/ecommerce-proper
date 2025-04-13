import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  message: "How it looks",
  duration: 300,
  isVisible: true,
  actionText: false,
};

export const globalMessage = createSlice({
  name: "global_message",
  initialState,
  reducers: {
    setReduxGlobalMessage: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearReduxGlobalMessage: () => {
      return initialState;
    },
  },
});

export const { setReduxGlobalMessage, clearReduxGlobalMessage } =
  globalMessage.actions;

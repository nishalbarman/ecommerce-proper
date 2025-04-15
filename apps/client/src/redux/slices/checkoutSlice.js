import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartCheckout: { address: undefined },
  singleCheckout: {
    address: undefined,
    productId: undefined,
    productVariant: undefined,
  },
};

export const checkoutInformationSlice = createSlice({
  name: "checkout_informations",
  initialState,
  reducers: {
    setCartCheckout: (state, action) => {
      state.cartCheckout = action.payload;
    },
    setSingleCheckout: (state, action) => {
      state.cartCheckout = { ...state.cartCheckout, ...action.payload };
    },
    clearCheckoutInformation: () => {
      return initialState;
    },
  },
});

export const { setCartCheckout, setSingleCheckout } =
  checkoutInformationSlice.actions;

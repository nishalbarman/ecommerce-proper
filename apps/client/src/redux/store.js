import { combineReducers, configureStore } from "@reduxjs/toolkit";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  PersistConfig,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { setupListeners } from "@reduxjs/toolkit/query";

// import { userAPI } from "./apis/userApi.js";
import { addressSlice } from "./slices/addressSlice.js";
// import { authApi } from "./apis/authApi.js";
import { addressApi } from "./apis/addressApi.js";

import { wishlistApi } from "./apis/wishlistApi.js";
// import { productsApi } from "./apis/productApi.ts.bak";
import { categoryApi } from "./apis/categoryApi.js";
import { storeTypeSlice } from "./slices/storeTypeSlice.js";
import { cartApi } from "./apis/cartApi.js";
import { centerAddressSlice } from "./slices/centerAddressSlice.js";
import { centerAddressApi } from "./apis/centerAddresApi.js";
// import { orderSlice } from "./slices/orderSlice";
import { productSortingFilteringSlice } from "./slices/productSortingFiltering.js";
import { authSlice } from "./slices/authSlice.js";
import { refetchSlice } from "./slices/refetchSlice.js";
import { globalMessage } from "./slices/messageSlice.js";
import { checkoutInformationSlice } from "./slices/checkoutSlice.js";
import { wishlistSlice } from "./slices/wishlistSlice.js";
import { cartSlice } from "./slices/cartSlice.js";
import { appliedCouponSlice } from "./slices/appliedCouponSlice.js";

const rootReducer = combineReducers({
  // [userAPI.reducerPath]: userAPI.reducer,
  // [authApi.reducerPath]: authApi.reducer,
  [authSlice.name]: authSlice.reducer,
  [addressSlice.name]: addressSlice.reducer,
  [addressApi.reducerPath]: addressApi.reducer,
  // [productsApi.reducerPath]: productsApi.reducer,
  [productSortingFilteringSlice.name]: productSortingFilteringSlice.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [wishlistApi.reducerPath]: wishlistApi.reducer,

  [wishlistSlice.name]: wishlistSlice.reducer,
  [cartSlice.name]: cartSlice.reducer,

  [categoryApi.reducerPath]: categoryApi.reducer,
  [storeTypeSlice.name]: storeTypeSlice.reducer,
  [appliedCouponSlice.name]: appliedCouponSlice.reducer,
  [checkoutInformationSlice.name]: checkoutInformationSlice.reducer,
  // [orderSlice.name]: orderSlice.reducer,
  [centerAddressApi.reducerPath]: centerAddressApi.reducer,
  [centerAddressSlice.name]: centerAddressSlice.reducer,

  // refetch slice
  [refetchSlice.name]: refetchSlice.reducer,

  // global error
  [globalMessage.name]: globalMessage.reducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  blacklist: [
    cartApi.reducerPath,
    wishlistApi.reducerPath,
    wishlistSlice.name,

    cartSlice.name,
    categoryApi.reducerPath,

    appliedCouponSlice.name,
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create an array of middleware
const middlewares = [
  cartApi.middleware,
  wishlistApi.middleware,
  // authApi.middleware,
  addressApi.middleware,
  categoryApi.middleware,
  centerAddressApi.middleware,
  // userAPI.middleware,
];

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });

    // Use type assertion to resolve type compatibility issue
    return defaultMiddleware.concat(...middlewares);
  },
});

store.subscribe(() => {
  console.log("State after change:", store.getState().appliedCouponSlice);
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

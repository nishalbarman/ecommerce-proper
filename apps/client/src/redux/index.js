import { selectedPaymentMethodSlice } from "./slices/selectedPaymentMethod";

// Export all slices with namespace
export * as AddressSlice from "./slices/addressSlice";
export * as AuthSlice from "./slices/authSlice";
export * as CenterAddressSlice from "./slices/centerAddressSlice";
export * as ProductSortingFiltering from "./slices/productSortingFiltering";
export * as StoreTypeSlice from "./slices/storeTypeSlice";
export * as RefetchSlice from "./slices/refetchSlice";
export * as MessageSlice from "./slices/messageSlice";
export * as WishlistSlice from "./slices/wishlistSlice";
export * as CartSlice from "./slices/cartSlice";
export * as AppliedCouponSlice from "./slices/appliedCouponSlice";
export * as loginModalSlice from "./slices/loginModalSlice";

// Export all APIs with namespace
export * as AddressApi from "./apis/addressApi";
// export * as AuthApi from "./apis/authApi";
export * as CartApi from "./apis/cartApi";
export * as CategoryApi from "./apis/categoryApi";
export * as CenterAddressApi from "./apis/centerAddresApi";
// export * as UserApi from "./apis/userApi";
export * as WishlistApi from "./apis/wishlistApi";
export * as ProductApi from "./apis/productApi";
export * as ReviewApi from "./apis/reviewApi";
// export * as CouponApi from "./apis/couponApi";
// export * as OrderApi from "./apis/orderApi";
export * as pgApi from "./apis/paymentGatewayApi";
export * as selectedPaymentMethodSlice from "./slices/selectedPaymentMethod";

// Export store normally
export * from "./store";

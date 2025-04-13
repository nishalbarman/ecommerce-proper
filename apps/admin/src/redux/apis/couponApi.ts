import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const couponApi = createApi({
  reducerPath: "couponApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_APP_API_URL,
    credentials: "include"
  }),
  tagTypes: ["Coupon"],
  endpoints: (builder) => ({
    getCoupons: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/coupons/list?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Coupon"],
    }),
    addCoupon: builder.mutation({
      query: (couponData) => ({
        url: "/coupons",
        method: "POST",
        body: couponData,
      }),
      invalidatesTags: ["Coupon"],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, couponData }) => ({
        url: `/coupons/${id}`,
        method: "PUT",
        body: couponData,
      }),
      invalidatesTags: ["Coupon"],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupon"],
    }),
    validateCoupon: builder.query({
      query: (code) => ({
        url: `/coupons?code=${code}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useAddCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponQuery,
} = couponApi;
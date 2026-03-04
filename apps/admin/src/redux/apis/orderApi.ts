import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `${process.env.VITE_APP_API_URL}/orders`;

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set(
        "Authorization",
        `Bearer ${(getState() as any).auth.jwtToken}`,
      );
      return headers;
    },
  }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    // ✅ CANCEL FULL ORDER
    cancelOrder: builder.mutation({
      query: ({ orderGroupId }) => ({
        url: "cancel",
        method: "PATCH",
        body: { orderGroupId },
      }),

      invalidatesTags: (result, error, arg) => [
        { type: "Order", id: arg.orderGroupId },
      ],
    }),

    // ✅ CANCEL SINGLE ITEM
    cancelOrderItem: builder.mutation({
      query: ({ orderItemId, orderGroupID }) => ({
        url: "cancel-item",
        method: "PATCH",
        body: { orderItemId, orderGroupID },
      }),

      invalidatesTags: ["Order"],
    }),
  }),
});

export const { useCancelOrderItemMutation, useCancelOrderMutation } = orderApi;

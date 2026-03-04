import { OrderGroup } from "@/types";
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
    // ✅ GET ALL ORDERS

    getOrderGroupDetails: builder.query<OrderGroup, string>({
      query: (orderGroupId) => `details/${orderGroupId}`,
      providesTags: (result, error, arg) => [{ type: "Order", id: arg }],
      transformResponse: (
        response: { orderGroup: OrderGroup }, // server response structure is {orderGroup: OrderGroup}
      ) => {
        return response.orderGroup;
      },
    }),

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

    resetOrderInfo: builder.mutation({
      query: ({ orderGroupId }) => ({
        url: "admin/reset-order",
        method: "PATCH",
        body: { orderGroupId },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Order", id: arg.orderGroupId },
      ],
    }),
  }),
});

export const {
  useGetOrderGroupDetailsQuery,
  useCancelOrderItemMutation,
  useCancelOrderMutation,
  useResetOrderInfoMutation,
} = orderApi;

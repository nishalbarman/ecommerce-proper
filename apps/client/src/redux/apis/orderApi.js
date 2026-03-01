import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/proxy/orders/`;

export const orderApi = createApi({
  reducerPath: "orderApi",
  tagTypes: ["Order"],
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      // headers.set("Authorization", `Bearer ${getState().auth.jwtToken}`);
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // ✅ UPDATED PAGINATION QUERY
    getOrderGroupList: builder.query({
      query: ({ productType = "buy", page = 0, limit = 10 }) => ({
        url: `list-group/${productType}`,
        params: {
          page, // 0-based index
          limit,
        },
      }),

      providesTags: ["Order"],

      // Optional: clean response
      transformResponse: (response) => ({
        orders: response.data,
        pagination: response.pagination,
      }),

      transformErrorResponse: (res) => res.message,
    }),

    getOrderListByGroupId: builder.query({
      query: ({ orderGroupId, page = 0, limit = 10 }) => ({
        url: `view-orders/${orderGroupId}`,
        params: {
          page, // 0-based index
          limit,
        },
      }),
      providesTags: ["Order"],
      transformErrorResponse: (res) => res.message,
    }),

    viewOneOrderGroupById: builder.query({
      query: ({ orderGroupId }) => ({
        url: `view-group-order/${orderGroupId}`,
      }),
      providesTags: ["Order"],
      transformErrorResponse: (res) => res.message,
      transformResponse: (response) => response.data,
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
      query: ({ orderItemId }) => ({
        url: "cancel-item",
        method: "PATCH",
        body: { orderItemId },
      }),

      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetOrderGroupListQuery,
  useGetOrderListByGroupIdQuery,
  useViewOneOrderGroupByIdQuery,
  useCancelOrderMutation,
  useCancelOrderItemMutation,
} = orderApi;

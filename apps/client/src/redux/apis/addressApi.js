import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/`;

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      headers.set("Authorization", `Bearer ${getState().auth.jwtToken}`);
      return headers;
    },
  }),
  tagTypes: ["Address"],
  endpoints: (builder) => ({
    getAddress: builder.query({
      query: () => ({
        url: `address`,
        method: "GET",
      }),
      providesTags: ["Address"],
      // transformResponse: (response, meta) => response.data,
      // transformErrorResponse: (response, meta, arg) => response.message,
    }),

    addAddress: builder.mutation({
      query: ({ address }) => ({
        url: `address`,
        method: "POST",
        body: address,
      }),
      invalidatesTags: ["Address"],
      // transformErrorResponse: (response, meta, arg) => response.message,
    }),

    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `address/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
      // transformErrorResponse: (response, meta, arg) => response.message,
    }),

    updateAddress: builder.mutation({
      query: ({ id, updatedAddress }) => ({
        url: `address/${id}`,
        method: "PATCH",
        body: updatedAddress,
      }),
      invalidatesTags: ["Address"],
      // transformErrorResponse: (response, meta, arg) => response.message,
    }),

    getDefaultAddress: builder.query({
      query: () => ({
        url: `address/get-default-address`,
        method: "GET",
      }),
      invalidatesTags: ["Address"],
      // transformResponse: (response, meta) => response.data,
    }),
  }),
});

export const {
  useGetAddressQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetDefaultAddressQuery,
} = addressApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const newArrivalApi = createApi({
  reducerPath: "newArrivalApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_APP_API_URL}/`,
    credentials: "include",
  }),
  tagTypes: ["NewArrival"],
  endpoints: (builder) => ({
    getNewArrivals: builder.query({
      query: ({ page, limit }) => `new-arrival/?page=${page}&limit=${limit}`,
      providesTags: ["NewArrival"],
    }),
    addNewArrival: builder.mutation({
      query: (newArrivalData) => ({
        url: "new-arrival",
        method: "POST",
        body: newArrivalData,
      }),
      invalidatesTags: ["NewArrival"],
    }),
    updateNewArrival: builder.mutation({
      query: ({ id, newArrivalData }) => ({
        url: `new-arrival/${id}`,
        method: "PATCH",
        body: newArrivalData,
      }),
      invalidatesTags: ["NewArrival"],
    }),
    deleteNewArrival: builder.mutation({
      query: (id) => ({
        url: `new-arrival/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["NewArrival"],
    }),
  }),
});

export const {
  useGetNewArrivalsQuery,
  useAddNewArrivalMutation,
  useUpdateNewArrivalMutation,
  useDeleteNewArrivalMutation,
} = newArrivalApi;

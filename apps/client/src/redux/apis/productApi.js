import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URL,
    prepareHeaders: (headers) => {
      // Add any auth headers here if needed
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page, limit, query, sort, filter }) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);
        if (query) params.set("query", query);
        if (sort) params.set("sort", sort);
        if (filter) params.set("filter", filter);

        return `products?${params.toString()}`;
      },
      // Cache behavior
      keepUnusedDataFor: 60, // Keep unused data for 60 seconds
    }),
  }),
});

export const { useGetProductsQuery } = productApi;

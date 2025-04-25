import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.jwtToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page, limit, query, sort, category, minPrice, maxPrice }) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);

        // Add optional parameters if they exist
        if (query) params.set("query", query);
        if (sort) params.set("sort", sort);
        if (category) params.set("category", category);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);

        return `products?${params.toString()}`;
      },
      // Cache behavior
      keepUnusedDataFor: 60, // Keep unused data for 60 seconds
    }),
  }),
});

export const { useGetProductsQuery } = productApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/proxy/`;

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    prepareHeaders: (headers, { getState }) => {
      // const token = getState().auth.jwtToken;
      // if (token) {
      //   headers.set("Authorization", `Bearer ${token}`);
      // }
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

    getOneProduct: builder.query({
      query: ({ productSlug }) => ({
        url: `products/view/${productSlug}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { productType: "buy" }, // or send data if needed
      }),
    }),

    getBuySingleProduct: builder.query({
      query: ({ productSlug, productVariantId }) => {
        if (productVariantId) {
          return {
            url: `products/view-variant/${productVariantId}`,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          };
        }

        return {
          url: `products/view/${productSlug}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: { productType: "buy" }, // or send data if needed
        };
      },
      transformResponse: (response) => {
        // If the response is already in JSON format, return it directly
        if (response.hasOwnProperty("variant")) {
          return {
            ...response.variant.product,
            ...response.variant,
          };
        }
        return {
          ...data?.proudct,
        };
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetOneProductQuery,
  useGetBuySingleProductQuery,
} = productApi;

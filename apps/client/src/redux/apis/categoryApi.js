import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/`;

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    prepareHeaders: (headers, { getState }) => {
      // headers.set("Authorization", `Bearer ${getState().auth.jwtToken}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllCategory: builder.query({
      query: () => ({
        url: "categories",
        method: "GET",
      }),
    }),
    getOneCategory: builder.query({
      query: (categorySlug) => ({
        url: `categories/view/${categorySlug}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllCategoryQuery, useGetOneCategoryQuery } = categoryApi;

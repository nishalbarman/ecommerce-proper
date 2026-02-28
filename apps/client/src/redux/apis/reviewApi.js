// reviewApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `/`;

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      // headers.set("Authorization", `Bearer ${getState().auth.jwtToken}`);
      return headers;
    },
  }),
  tagTypes: ["Review"],
  endpoints: (builder) => ({
    // Get reviews for a product
    getReviews: builder.query({
      query: ({ productId, page = 1, productType = "buy" }) => ({
        url: `feedbacks/list/${productId}`,
        params: { page, productType },
      }),
      providesTags: ["Review"],
      //   transformResponse: (response) => response.data,
    }),

    // Submit a new review
    submitReview: builder.mutation({
      query: ({
        productId,
        productType,
        description,
        starsGiven,
        imageIds,
      }) => ({
        url: `feedbacks`,
        method: "POST",
        body: {
          product: productId,
          productType,
          description,
          starsGiven,
          imageIds,
        },
      }),
      invalidatesTags: ["Review"],
    }),

    // Upload review image
    uploadReviewImage: builder.mutation({
      query: (base64String) => ({
        url: `feedbacks/upload-image`,
        method: "POST",
        body: { imageData: { base64String } },
      }),
    }),

    updateReview: builder.mutation({
      query: ({
        reviewId,
        productId,
        productType,
        description,
        starsGiven,
        imageIds,
      }) => ({
        url: `feedbacks`,
        method: "PATCH",
        body: {
          product: productId,
          productType,
          description,
          starsGiven,
          imageIds,
        },
      }),
      invalidatesTags: ["Review"],
    }),

    // fetch user's review for a product
    getUserReview: builder.query({
      query: ({ fetchingId, fetchBy, productType }) => ({
        url: `feedbacks/view/${fetchingId}`,
        method: "POST",
        body: { productType },
        params: { fetchBy },
      }),
      providesTags: ["Review"],
      transformResponse: (response) => response.feedback,
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useSubmitReviewMutation,
  useUploadReviewImageMutation,
  useUpdateReviewMutation,
  useGetUserReviewQuery,
} = reviewApi;

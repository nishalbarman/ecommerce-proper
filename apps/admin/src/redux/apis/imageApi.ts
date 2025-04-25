import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `${process.env.VITE_APP_API_URL}/uploader/image/`;

export const imageApi = createApi({
  reducerPath: "imageManagement",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set(
        "Authorization",
        `Bearer ${(getState() as any).auth.jwtToken}`
      );
      return headers;
    },
  }),
  tagTypes: ["ImageManagement"],
  endpoints: (builder) => ({
    getImages: builder.query({
      query: () => `list`,
      providesTags: ["ImageManagement"],
      transformResponse: (res) => (res as any).data,
      transformErrorResponse: (res) => (res as any).message,
    }),

    addOneImage: builder.mutation({
      query: ({ imageData }) => ({
        url: `imgbb/upload`,
        method: "POST",
        body: {
          imageData,
        },
      }),
      invalidatesTags: ["ImageManagement"],
      // transformErrorResponse: (res) => res.message,
    }),

    // updateCart: builder.mutation({
    //   query: ({ id, updatedItem }) => {
    //     return {
    //       url: `cart/${id}`,
    //       method: "PATCH",
    //       body: updatedItem,
    //     };
    //   },
    //   invalidatesTags: ["ImageManagement"],
    //   transformErrorResponse: (res) => (res as any).message,
    // }),

    deleteImage: builder.mutation({
      query: ({ reference }) => ({
        url: `imgbb/delete/${reference}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ImageManagement"],
      // transformErrorResponse: (res) => res.message,
    }),
  }),
});

export const {
  useGetImagesQuery,
  useAddOneImageMutation,
  useDeleteImageMutation,
} = imageApi;

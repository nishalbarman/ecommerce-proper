import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `${process.env.VITE_APP_API_URL}/uploader/image/`;

// Enhanced types for your API response
export interface ImageItem {
  _id: string;
  title: string;
  thumbnailUrl: string;
  imageLink: string;
  bgColor: string;
  deleteLink: string;
  reference: string;
  platform: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PaginatedImageResponse {
  totalPages: number;
  pageLimit: number;
  totalCount: number;
  data: ImageItem[];
}

// Transformed type for component compatibility
export interface FileLibraryListItem {
  _id: string;
  title?: string;
  fileName: string;
  size?: number;
  src: string;
  imageLink: string;
  thumbnail?: string;
  bgColor?: string;
  createdAt?: string;
  deleteLink?: string;
  mimeType?: string;
}

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
    // Original getImages endpoint (for backward compatibility)
    getImages: builder.query<FileLibraryListItem[], void>({
      query: () => `list`,
      providesTags: ["ImageManagement"],
      transformResponse: (res: PaginatedImageResponse) => {
        // Transform your server response to match component expectations
        return res.data.map(
          (image): FileLibraryListItem => ({
            _id: image._id,
            title: image.title,
            fileName: image.title || `image-${image._id}`,
            size: 0, // Size not provided by server
            src: image.imageLink,
            thumbnail: image.thumbnailUrl,
            imageLink: image.imageLink,
            bgColor: image.bgColor,
            createdAt: image.createdAt,
            deleteLink: image.deleteLink,
            mimeType: "image/png", // Default based on imgbb
          })
        );
      },
      transformErrorResponse: (res: any) => res?.message || "Unknown error",
    }),

    // New paginated endpoint for server-side pagination
    getPaginatedImages: builder.query<
      {
        items: FileLibraryListItem[];
        totalPages: number;
        pageLimit: number;
        totalCount: number;
      },
      {
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: ({ page = 1, limit = 20, search = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        // Add search parameter if your server supports it
        if (search) {
          params.append("search", search);
        }

        return `list?${params}`;
      },
      providesTags: ["ImageManagement"],
      transformResponse: (res: PaginatedImageResponse, meta) => {
        // Transform your server response
        const transformedItems = res.data.map(
          (image): FileLibraryListItem => ({
            _id: image._id,
            title: image.title,
            fileName: image.title || `image-${image._id}`,
            size: 0,
            src: image.imageLink,
            imageLink: image.imageLink,
            bgColor: image.bgColor,
            thumbnail: image.thumbnailUrl,
            createdAt: image.createdAt,
            deleteLink: image.deleteLink,
            mimeType: "image/png",
          })
        );

        return {
          items: transformedItems,
          totalPages: res.totalPages,
          pageLimit: res.pageLimit,
          totalCount: res.totalCount,
        };
      },
      transformErrorResponse: (res: any) => res?.message || "Unknown error",
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
    }),

    deleteImage: builder.mutation({
      query: ({ reference }) => ({
        url: `imgbb/delete/${reference}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ImageManagement"],
    }),
  }),
});

export const {
  useGetImagesQuery,
  useGetPaginatedImagesQuery,
  useAddOneImageMutation,
  useDeleteImageMutation,
} = imageApi;

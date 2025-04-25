import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `${process.env.VITE_APP_API_URL}/`;

export const productApi = createApi({
  reducerPath: "product",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.jwtToken; // Adjust based on your state structure
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Product"], // Tag for caching and invalidation
  endpoints: (builder) => ({
    // Fetch all products with pagination
    getProducts: builder.query({
      query: ({ page, limit }) => `products?page=${page}&limit=${limit}`,
      providesTags: ["Product"],
      transformResponse: (res: any) => ({
        data: res.data, // List of products
        totalProductCount: res.totalProductCount, // Total count for pagination
      }),
      transformErrorResponse: (res: any) => res.message,
    }),

    // Fetch a single product by ID
    getProductById: builder.query({
      query: (productId) => `products/admin-view/${productId}`,
      providesTags: ["Product"],
      transformResponse: (res: any) => res.product, // Single product details
      transformErrorResponse: (res: any) => res.message,
    }),

    // Delete one or more products
    deleteProducts: builder.mutation({
      query: (deletableProductIds) => ({
        url: "products/delete",
        method: "POST",
        body: { deletableProductIds },
      }),
      invalidatesTags: ["Product"], // Invalidate cache after deletion
      transformErrorResponse: (res: any) => res.message,
    }),

    // Update a product
    updateProduct: builder.mutation({
      query: ({ productId, updatedData }) => ({
        url: `products/${productId}`,
        method: "PATCH",
        body: { productData: updatedData },
      }),
      invalidatesTags: ["Product"], // Invalidate cache after update
      transformErrorResponse: (res: any) => res.message,
    }),

    // Add a new product
    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: "products",
        method: "POST",
        body: { productData: newProduct },
      }),
      invalidatesTags: ["Product"], // Invalidate cache after adding
      transformErrorResponse: (res: any) => res.message,
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useDeleteProductsMutation,
  useUpdateProductMutation,
  useAddProductMutation,
} = productApi;

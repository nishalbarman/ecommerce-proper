import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `${process.env.VITE_APP_API_URL}/`;

export const roleApi = createApi({
  reducerPath: "role",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.jwtToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Role"],
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: ({ page = 1, limit = 10 }) => `roles?page=${page}&limit=${limit}`,
      providesTags: ["Role"],
    }),
    addRole: builder.mutation({
      query: (roleData) => ({
        url: "roles",
        method: "POST",
        body: { roleData },
      }),
      invalidatesTags: ["Role"],
    }),
    updateRole: builder.mutation({
      query: ({ id, roleData }) => ({
        url: `roles/update/${id}`,
        method: "PATCH",
        body: { roleData },
      }),
      invalidatesTags: ["Role"],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;

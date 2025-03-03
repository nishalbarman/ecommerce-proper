import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setUserAuthData } from "../slices/authSlice";

const SERVER_URL = `${process.env.VITE_APP_API_URL}/`;

export const userApi = createApi({
  reducerPath: "user",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.jwtToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // Get all users with pagination
    getUsers: builder.query({
      query: ({ page = 1, limit = 10, userType="user" }) => `user?userType=${userType}&page=${page}&limit=${limit}`,
      providesTags: ["User"],
    }),

    // Get a single user by ID
    getUserById: builder.query({
      query: (id) => `user/${id}`,
      providesTags: ["User"],
    }),

    // Add a new user
    addUser: builder.mutation({
      query: (userData) => ({
        url: "user",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    // Update a user by ID
    updateUser: builder.mutation({
      query: ({ id, userData }) => ({
        url: `user/update/${id}`,
        method: "PATCH",
        body: { userData },
      }),
      invalidatesTags: ["User"],
    }),

    // Delete a user by ID
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    /* UPDATES LOGGED IN USERS DATA, ID GETS RETRIEVED FROM JWT TOKEN WHILE UPDATING */
    updateUserEmail: builder.mutation({
      query: ({ newEmail, prevEmailOTP, newEmailOTP }) => ({
        url: "user/update_email",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: { email: newEmail, prevEmailOTP, newEmailOTP },
      }),
      onQueryStarted: async (_: any, { dispatch, queryFulfilled }) => {
        try {
          const response = await queryFulfilled;
          dispatch(setUserAuthData(response.data));
        } catch (error) {
          console.error("Update user Email -->> ", error);
        }
      },
    }),

    /* UPDATES LOGGED IN USERS DATA, ID GETS RETRIEVED FROM JWT TOKEN WHILE UPDATING */
    updateUserMobile: builder.mutation({
      query: ({ newMobileNo, prevMobileOTP, newMobileOTP }) => ({
        url: "user/update_mobile",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: { mobileNo: newMobileNo, prevMobileOTP, newMobileOTP },
      }),
      onQueryStarted: async (_: any, { dispatch, queryFulfilled }) => {
        try {
          const response = await queryFulfilled;
          dispatch(setUserAuthData(response.data));
        } catch (error) {
          console.error("Update user Email -->> ", error);
        }
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;

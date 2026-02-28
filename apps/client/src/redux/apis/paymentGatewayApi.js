import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `/api/proxy/payment/`;

export const pgApi = createApi({
  reducerPath: "paymentGatewayApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    prepareHeaders: (headers, { getState }) => {
      // headers.set(
      //   "Authorization",
      //   `Bearer ${(getState()).auth.jwtToken}`,
      // );
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllPaymentGateways: builder.query({
      query: () => ({
        url: "gateways",
        method: "GET",
      }),
      transformResponse: (response, meta, arg) => response.data,
      // transformErrorResponse: (response, meta, arg) => response.message,
    }),
  }),
});

export const { useGetAllPaymentGatewaysQuery } = pgApi;

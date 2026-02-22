import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SERVER_URL = `${process.env.EXPO_PUBLIC_API_URL}/payment/`;
console.log(SERVER_URL);

export const pgApi = createApi({
  reducerPath: "paymentGatewayApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set(
        "Authorization",
        `Bearer ${(getState() as any).auth.jwtToken}`,
      );
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllPaymentGateways: builder.query({
      query: () => ({
        url: "gateways",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllPaymentGatewaysQuery } = pgApi;

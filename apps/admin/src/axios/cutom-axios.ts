import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// Create an Axios instance
const cAxios: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL, // Replace with your API base URL
  withCredentials: true, // Enable sending cookies with requests
});

cAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    // You can modify the response here
    console.log("Response Interceptor:", response);
    return response;
  },
  (error: AxiosError) => {
    // Handle response errors
    return Promise.reject(error);
  }
);

export default cAxios;

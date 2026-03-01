import axios from "axios";
import { store } from "../redux/store";

const API_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// this needs to be enabled if requests are using token from redux (jwt based), now I am using cookie based auth so commenting.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.jwtToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = store.getState().auth.jwtToken;
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.token) {
          store.dispatch(setUserAuth({ jwtToken: response.data.token }));
          processQueue(null, response.data.token);
          originalRequest.headers["Authorization"] =
            `Bearer ${response.data.token}`;
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error("Token refresh failed"));
          store.dispatch(clearToken());
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        store.dispatch(clearToken());
        if (refreshError.response?.data?.redirectTo) {
          window.location.href = refreshError.response.data.redirectTo;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && error.response?.data?.redirectTo) {
      store.dispatch(clearToken());
      window.location.href = error.response.data.redirectTo;
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

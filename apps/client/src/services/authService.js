import axiosInstance from "./axiosInstance";
import { store } from "../redux/store";
import { setUserAuth, clearToken } from "../redux/slices/authSlice";

const authService = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      const { token, user } = response.data;

      // Store token in Redux (will be persisted automatically)
      store.dispatch(
        setUserAuth({
          name: user.name,
          email: user.email,
          mobileNo: user.mobileNo,
          jwtToken: token,
        })
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/signup", userData);
      const { token, user } = response.data;

      // Store token in Redux (will be persisted automatically)
      store.dispatch(
        setUserAuth({
          name: user.name,
          email: user.email,
          mobileNo: user.mobileNo,
          jwtToken: token,
        })
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const token = store.getState().auth.jwtToken;
      if (token) {
        await axiosInstance.post(
          "/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      // Clear token from Redux (will be cleared from persistence automatically)
      store.dispatch(clearToken());
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear token even if logout request fails
      store.dispatch(clearToken());
    }
  },

  refreshToken: async () => {
    try {
      const token = store.getState().auth.jwtToken;
      if (!token) return null;

      const response = await axiosInstance.post(
        "/auth/refresh-token",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.token) {
        // Update token in Redux (will be persisted automatically)
        store.dispatch(setUserAuth({ jwtToken: response.data.token }));
        return response.data.token;
      }
      return null;
    } catch (error) {
      store.dispatch(clearToken());
      return null;
    }
  },

  // Helper function to check if user is authenticated
  isAuthenticated: () => {
    const token = store.getState().auth.jwtToken;
    return !!token;
  },

  // Helper function to get the current token
  getToken: () => {
    return store.getState().auth.jwtToken;
  },
};

export default authService;

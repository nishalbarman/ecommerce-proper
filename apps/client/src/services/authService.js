import axiosInstance from "./axiosInstance";
import { store } from "../redux/store";
import { setUserAuth, clearToken } from "../redux/slices/authSlice";

const SERVER_URL = `${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/proxy`;

const authService = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      const { token, user } = data;

      // Store token in Redux (will be persisted automatically)
      store.dispatch(
        setUserAuth({
          name: user.name,
          email: user.email,
          mobileNo: user.mobileNo,
          jwtToken: token,
        }),
      );

      return data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      // const response = await axiosInstance.post("/auth/signup", userData);
      const response = await fetch(`${SERVER_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      const { token, user } = data;

      // Store token in Redux (will be persisted automatically)
      store.dispatch(
        setUserAuth({
          name: user.name,
          email: user.email,
          mobileNo: user.mobileNo,
          jwtToken: token,
        }),
      );

      return data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async (token) => {
    try {
      // const token = cookieStore.get("token");

      // const token = store.getState().auth.jwtToken;

      if (token) {
        // await axiosInstance.post(
        //   "/auth/logout",
        //   {},
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //   },
        // );
        await fetch(`${SERVER_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
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
        },
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

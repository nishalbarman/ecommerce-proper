import { BaseSyntheticEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";

// custom redux package
import {
  clearLoginSession,
  setUserAuthData,
  useAppDispatch,
  useAppSelector,
} from "../redux";
import { isValidEmail } from "../validator";

import axios from "axios";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { FaSpinner } from "react-icons/fa";

const Logout = () => {
  const dispatch = useAppDispatch();

  const navigator = useNavigate();

  const { jwtToken } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      dispatch(clearLoginSession());
      navigator("/login");
      toast.update(toastId, {
        type: "success",
        render: "You have been logged out.",
        autoClose: 2000,
        isLoading: false,
      });
    } catch (error: any) {
      console.error(error);
      toast.update(toastId, {
        type: "error",
        render:
          error.response?.data.message || "Logout failed! Please try again",
        autoClose: 2000,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 w-full">
      <div className="flex w-full flex-col max-w-md bg-white shadow-lg justify-center items-center py-20 gap-5 rounded">
        <FaSpinner className="animate-spin" /> <span>Logging out...</span>
      </div>
    </div>
  );
};

export default Logout;

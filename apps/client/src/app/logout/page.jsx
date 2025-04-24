"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getBackendUrl } from "../../helpter/utils";
import { clearLoginSession } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";

function page() {
  const navigator = useRouter();
  const dispatch = useDispatch();

  const doLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      dispatch(clearLoginSession());
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/logout`);
    } catch (error) {
      console.log("Axios Error-->", error);
    } finally {
      navigator.push("/");
    }
  };

  useEffect(() => {
    doLogout();
  }, []);

  return <></>;
}

export default page;

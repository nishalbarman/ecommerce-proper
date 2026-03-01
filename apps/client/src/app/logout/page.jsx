"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getBackendUrl } from "../../helpter/utils";
import { clearLoginSession } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { clearCookiesAfterLogout } from "@/lib/logout/clearCookiesAfterLogout";

function page() {
  const navigator = useRouter();
  const dispatch = useDispatch();

  const doLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      dispatch(clearLoginSession());
      await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/proxy/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      clearCookiesAfterLogout();
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

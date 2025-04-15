"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getBackendUrl } from "../../helpter/utils";

function page() {
  const navigator = useRouter();

  const doLogout = async () => {
    try {
      const serverUrl = getBackendUrl();
      axios.defaults.withCredentials = true;
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

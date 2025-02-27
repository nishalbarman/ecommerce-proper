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
      await axios.get(`${process.env.NEXT_BACKEND_SERVER}/logout`);
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

import React from "react";
// import { useCookies } from "react-cookie";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux";

type PrivateRouteProps = {
  children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // const [cookies] = useCookies(); // cookies will contain all the keys and values of the cookies = {[key]: value}

  // console.log("Cookies in private route", cookies);

  // if (!cookies.token) {
  //   return <Navigate to={"/login"} />;
  // }

  const jwtToken = useAppSelector((state) => state.auth.jwtToken);
  if (!jwtToken) {
    return <Navigate to={"/login"} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

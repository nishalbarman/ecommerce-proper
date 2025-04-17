import React from "react";
import { useCookies } from "react-cookie";
import { Navigate } from "react-router-dom";

type PrivateRouteProps = {
  children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [cookies] = useCookies(); // cookies will contain all the keys and values of the cookies = {[key]: value}

  console.log("Cookies in private route", cookies);

  if (!cookies.token) {
    return <Navigate to={"/login"} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

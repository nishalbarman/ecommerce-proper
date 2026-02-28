const getTokenDetails = require("../helpter/getTokenDetails");

const checkRole = (...allowedRoles) => {
  // 0 = user, 1 = admin, 2 = center - more can be added through admin panel

  return (req, res, next) => {
    try {
      console.log("REQUEST PATH: ", req.path);
      console.log("REQUEST METHOD: ", req.method);

      console.log("Cookies", req?.cookies);

      const token =
        req?.cookies?.token || req?.headers?.authorization?.split(" ")[1];

      console.log("What are cookies -->", JSON.stringify(req?.cookies));
      console.log("The Token Extracted From Cookies -->", token);

      if (!token) {
        return res
          .clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            // process.env.NODE_ENV === "production"
            //   ? ".cartshopping.in"
            //   : undefined,
          })
          .status(401)
          .json({
            message: "No token found on Cookies/Authorization.",
            redirectTo: "/auth/login",
          });
      }

      req.jwt = { token: token };

      let userDetails = getTokenDetails(token);
      if (userDetails.message === "TOKEN_EXPIRED") {
        console.log("Token Expired");
        return res
          .clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            // process.env.NODE_ENV === "production"
            //   ? ".cartshopping.in"
            //   : undefined,
          })
          .status(401)
          .json({
            message: "Token expired, please login again.",
            redirectTo: "/auth/login",
          });
      }

      if (!userDetails || userDetails.message === "TOKEN_INVALID") {
        return res
          .status(400)
          .json({ message: "Token validation failed, JWT validation failed." });
      }
      userDetails = userDetails.userDetails;
      req.user = userDetails;

      console.log("User Details", JSON.stringify(userDetails));
      console.log("Allowed Roles", allowedRoles);
      console.log("User Role", userDetails.roleNumber);

      if (allowedRoles.includes(userDetails.roleNumber)) {
        req.jwt.role = userDetails?.roleNumber;
        req.jwt.center = userDetails?.center;
        return next();
      }

      return res
        .status(401)
        .json({ message: "Authentication Error: Required role not found." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };
};

module.exports = checkRole;

const getTokenDetails = require("../helpter/getTokenDetails");

const checkRole = (...allowedRoles) => {
  // 0 = user, 1 = admin, 2 = center - more can be added through admin panel

  return (req, res, next) => {
    try {
      const token = req?.cookies?.token;

      console.log("What are cookies -->", JSON.stringify(req?.cookies));
      console.log("The Token Extracted From Cookies -->", token);

      if (!token) {
        return res.status(401).json({ message: "No token found on Cookies." });
      }

      req.jwt = { token: token };

      const userDetails = getTokenDetails(token);
      if (!userDetails) {
        return res
          .status(400)
          .json({ message: "Token validation failed, JWT validation failed." });
      }

      req.user = userDetails;

      console.log(
        "User Details from checkRole middleware function ->",
        userDetails.roleNumber
      );

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

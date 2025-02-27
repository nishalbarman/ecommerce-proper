const getTokenDetails = require("../helpter/getTokenDetails");

const checkRole = (...allowedRoles) => {
  // 0 = user, 1 = admin, 2 = center - more can be added through admin panel

  return (req, res, next) => {
    try {
      const token = req?.jwt?.token;
      if (!token) {
        return res.status(400).json({ message: "JWT Token Not Found" });
      }

      const userDetails = getTokenDetails(token);
      if (!userDetails) {
        return res.status(400).json({ message: "Token validation failed" });
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
        .json({ message: "Authentication error: Required role not found." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };
};

module.exports = checkRole;

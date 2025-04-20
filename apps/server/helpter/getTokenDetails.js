const jwt = require("jsonwebtoken");

function getTokenDetails(token) {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    return { message: "TOKEN_VALIDATED", userDetails: decoded };
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return { message: "TOKEN_EXPIRED", userDetails: null };
    }
    throw new Error("Invalid token");
    // console.error("JWT Decode Error -->", err);
    // return null;
  }
}

module.exports = getTokenDetails;

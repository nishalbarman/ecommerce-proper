const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const passValidator = require("password-validator");
const { v4: uuidv4 } = require("uuid");

const User = require("../../models/user.model");
const Otp = require("../../models/otp.model");
const Role = require("../../models/role.model");

const {
  isValidEmail,
  isValidIndianMobileNumber,
  hasOneSpaceBetweenNames,
} = require("custom-validator-renting");
const { globalErrorHandler } = require("../../helpter/globalErrorHandler");

const validatePass = new passValidator();
validatePass.is().min(8).has().uppercase().has().lowercase();

const secret = process.env.JWT_SECRET;

const router = express.Router();

router.post("/admin-login", async (req, res) => {
  try {
    const error = [];
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      error.push("Invalid email address");
    }

    if (error.length > 0) {
      return res.status(400).json({ message: error.join(", ") });
    }

    const user = await User.findOne({ email }).populate("role");

    console.log(
      !!user
        ? `We got one user with given email: ${user?.email} and Role: ${user.role?.roleName}`
        : "No user found for the given email"
    );

    console.log(user.role);

    if (!user || user.role?.roleKey !== "admin") {
      return res.status(400).json({
        message: "The provided credentials are invalid.",
      });
    }

    const isPassValid = bcrypt.compareSync(password, user.password);

    console.log(
      `Is the provided password valid after comparing with bcrypt: for password: ${password} ---> ${isPassValid}`
    );

    if (!isPassValid) {
      return res.status(400).json({
        message: "The provided credentials are invalid.",
      });
    }

    const jwtToken = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        roleName: user.role.roleName,
        roleNumber: user.role.roleNumber,
        roleKey: user.role.roleKey,
        email: user.email,
        mobileNo: user.mobileNo,
      },
      secret
    );

    return res
      .cookie("token", jwtToken, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production", // true in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        // Omit domain for localhost, set only in production
        ...(process.env.NODE_ENV === "production" && {
          domain: "jharna-mehendi-api.onrender.com",
        }),
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email,
          roleName: user.role.roleName,
          roleNumber: user.role.roleNumber,
          roleKey: user.role.roleKey,
          mobileNo: user.mobileNo,
          jwtToken: jwtToken,
        },
      });
  } catch (error) {
    globalErrorHandler(res, error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const error = [];
    const { mobileNo, password } = req.body;

    console.log(mobileNo, password);

    if (!isValidIndianMobileNumber(mobileNo)) {
      error.push("Invalid mobile No");
    }

    if (error.length > 0) {
      return res.status(400).json({ status: false, message: error.join(", ") });
    }

    const user = await User.findOne({ mobileNo }).populate("role");

    if (!user) {
      return res.status(400).json({
        message: "The provided credentials are invalid.",
      });
    }

    const isPassValid = bcrypt.compareSync(password, user.password);
    if (!isPassValid) {
      return res.status(400).json({
        message: "The provided credentials are invalid.",
      });
    }

    // TODO : Uncomment this code when mobile verification is implemented
    // if (!user?.isMobileNoVerified) {
    //   return res.status(403).json({
    //     message: "Account not verified yet!",
    //   });
    // }

    const jwtToken = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        roleName: user.role.roleName,
        roleNumber: user.role.roleNumber,
        roleKey: user.role.roleKey,
        email: user.email,
        mobileNo: user.mobileNo,
        center: user?.center,
      },
      secret,
      { expiresIn: 1 + "h" }
    );

    const oneDay = 24 * 60 * 60 * 1000;

    res.cookie("token", jwtToken, {
      maxAge: Date.now() + oneDay,
    });
    res.cookie("name", user.name, {
      maxAge: Date.now() + oneDay,
    });
    res.cookie("email", user.email, {
      maxAge: Date.now() + oneDay,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo,
        jwtToken: jwtToken,
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof mongoose.Error && error?.errors) {
      const errArray = Object.values(error.errors).map(
        (properties) => properties.message
      );

      return res.status(400).json({
        message: errArray.join(", "),
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const error = [];
    const { email, name, mobileNo, password, otp } = req.body;

    if (!isValidEmail(email)) {
      error.push("Invalid email");
    }

    if (!hasOneSpaceBetweenNames(name)) {
      error.push("Full name required");
    }

    if (!isValidIndianMobileNumber(mobileNo)) {
      error.push("Invalid phone number");
    }

    if (!validatePass.validate(password)) {
      error.push(
        "Password should be of minimum 8 digits containing uppercase and lowercase characters"
      );
    }

    if (error.length > 0) {
      return res.status(400).json({ status: false, message: error.join(", ") });
    }

    // const otpFromDatabase = await Otp.findOne({ mobileNo, email, name }).sort({
    //   createdAt: "desc",
    // });

    // if (!otpFromDatabase) {
    //   error.push("OTP is invalid");
    // }

    // const dateObject = new Date(otpFromDatabase?.createdAt);
    // const dueTimestamp = dateObject.getTime() + 10 * 60 * 1000;

    // console.log(req.body.otp);
    // // console.log("retrieved OTP from db", otpFromDatabase.otp);
    // // console.log("Due time ==>", Math.round(dueTimestamp));
    // // console.log("Current time ==>", Date.now());
    // // console.log(Math.round(dueTimestamp) < Date.now());

    // if (
    //   otpFromDatabase?.otp != req.body.otp ||
    //   Math.round(dueTimestamp) < Date.now()
    // ) {
    //   error.push("OTP is invalid");
    // }

    if (error.length > 0) {
      return res.status(400).json({ status: false, message: error.join(", ") });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(password, salt);

    const verifyToken = uuidv4();

    const userObject = await User.create({
      email,
      name,
      mobileNo,
      password: hashedPass,
      mobileNoVerifyToken: verifyToken,
      role: "67ba036ea088fcf4f8e539c1", // default id for user role
    });

    const jwtToken = jwt.sign(
      {
        _id: userObject._id,
        name: userObject.name,
        roleName: "user",
        roleKey: "user",
        roleNumber: 0, //! Default role for user is 0
        email: userObject.email,
        mobileNo: userObject.mobileNo,
        center: userObject?.center,
      },
      secret
    );

    console.log("User Created");

    return res.status(200).json({
      status: true,
      message: "Registration successful",
      user: {
        name: userObject.name,
        email: userObject.email,
        mobileNo: userObject.mobileNo,
        jwtToken: jwtToken,
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof mongoose.Error && error?.errors) {
      const errArray = Object.values(error.errors).map(
        (properties) => properties.message
      );

      return res.status(400).json({
        status: false,
        message: errArray.join(", "),
      });
    }
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

router.post("/logout", async (req, res) => {
  return res
    .clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json({ message: "Logged out" });
});

module.exports = router;

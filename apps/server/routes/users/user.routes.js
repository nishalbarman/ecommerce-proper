const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const passValidator = require("password-validator");

const User = require("../../models/user.model");
const checkRole = require("../../middlewares");

const {
  isValidEmail,
  hasOneSpaceBetweenNames,
  isValidIndianMobileNumber,
} = require("../../utils/validator");
const getTokenDetails = require("../../helpter/getTokenDetails");

const validatePass = new passValidator();
validatePass.is().min(8).has().uppercase().has().lowercase();

const secret = process.env.JWT_SECRET;

const router = express.Router();

// ----------------------------------------->
/****************************************** */
/**          Existing Endpoints            **/
/****************************************** */
// ----------------------------------------->

router.patch("/update", checkRole(0, 1, 2), async (req, res) => {
  try {
    const error = [];

    const email = req.body?.email;
    const name = req.body?.name;
    const password = req.body?.password;

    const updateObject = {};
    if (email) {
      if (!isValidEmail(email)) {
        error.push("Invalid email");
      }
      updateObject.email = email;
    }

    if (name) {
      if (!hasOneSpaceBetweenNames(name)) {
        error.push("Full name required");
      }
      updateObject.name = name;
    }

    if (password) {
      if (!validatePass.validate(password)) {
        error.push(
          "Password should be of minimum 8 digits containing uppercase and lowercase characters"
        );
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedPass = bcrypt.hashSync(password, salt);
      updateObject.password = hashedPass;
    }

    if (error.length > 0) {
      return res.status(400).json({ message: error.join(", ") });
    }

    const update = await User.findOneAndUpdate(
      { _id: userDetails._id },
      {
        $set: updateObject,
      }
    ).populate("role");

    const jwtToken = jwt.sign(
      {
        _id: update._id,
        name: update.name,
        roleName: update.role.roleName,
        roleNumber: update.role.roleNumber,
        roleKey: update.role.roleKey,
        email: update.email,
        mobileNo: update.mobileNo,
      },
      secret
    );

    return res.status(200).json({
      message: "User Updated",
      user: {
        name: update.name,
        email: update.email,
        mobileNo: update.mobileNo,
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

router.get("/get-user-chart-data", checkRole(1, 2), async (req, res) => {
  try {
    const year = parseInt(req.query?.year);
    const month = parseInt(req.query?.month);

    const pipeline = [
      // Stage 1: Match users created within the specified date range
      {
        $match: {
          createdAt: {
            $gte: new Date(year, month - 1, 1), // Start of the month
            $lt: new Date(year, month, 1), // Start of the next month
          },
        },
      },
      // Stage 2: Group by date and count users
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 }, // Count users
        },
      },
      // Stage 3: Project to format date and rename fields
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%B %d, %Y",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                },
              },
            },
          },
          count: 1,
        },
      },
      // Stage 4: Sort by date
      {
        $sort: { date: 1 },
      },
      // Stage 5: Group to calculate total users
      {
        $group: {
          _id: null,
          totalUsers: { $sum: "$count" },
          chartData: { $push: "$$ROOT" },
        },
      },
      // Stage 6: Project to reshape output
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          chartData: 1,
        },
      },
    ];

    // Replace "createdAt" with the appropriate timestamp field if you're using a different field
    // Execute the pipeline using the aggregate function on your User model
    const chartData = await User.aggregate(pipeline);
    return res.status(200).json(chartData[0]);
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
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ----------------------------------------->
/****************************************** */
/**          New Endpoints                **/
/****************************************** */
// ----------------------------------------->

// Get all users with pagination (Admin-only)
router.get("/", checkRole(1, 2), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 users per page
    const skip = (page - 1) * limit;

    const userType = req.query?.userType; // Get userType from query params

    // Construct the match query for roleNumber
    const matchQuery = {};
    if (userType) {
      matchQuery["role.roleNumber"] = +userType;
    } else {
      delete matchQuery["role.roleNumber"];
    }

    console.log("matchQuery", matchQuery);

    // Aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "roles", // The collection to join with
          localField: "role", // Field from the users collection
          foreignField: "_id", // Field from the roles collection
          as: "role", // Output array field
        },
      },
      { $unwind: "$role" }, // Unwind the role array
      { $match: matchQuery }, // Apply the match query
      { $skip: skip }, // Pagination: skip
      { $limit: limit }, // Pagination: limit
      { $sort: { createdAt: -1 } }, // Sort by createdAt
      {
        $project: {
          password: 0, // Exclude password
          "role._id": 0, // Exclude role._id
        },
      },
    ];

    // Execute the aggregation pipeline
    const users = await User.aggregate(pipeline);

    // Count total users based on the match query
    const totalUsers = await User.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role",
        },
      },
      { $unwind: "$role" },
      { $match: matchQuery },
      { $count: "totalUsers" },
    ]);

    const totalPages = Math.ceil((totalUsers[0]?.totalUsers || 0) / limit);

    return res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        totalUsers: totalUsers[0]?.totalUsers || 0,
        totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get a single user by ID (Admin-only)
router.get("/admin/view/:id", checkRole(1, 2), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id, { password: 0 }).populate("role"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new user (Admin-only)
router.post("/", checkRole(1, 2), async (req, res) => {
  try {
    const { name, email, mobileNo, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !mobileNo || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Validate mobile number
    if (!isValidIndianMobileNumber(mobileNo)) {
      return res.status(400).json({ message: "Invalid Indian mobile number" });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      mobileNo,
      password: hashedPassword,
      role,
      isEmailVerified: false,
      isMobileNoVerified: false,
    });

    // Save the user to the database
    await newUser.save();

    // Return success response
    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobileNo: newUser.mobileNo,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
        isMobileNoVerified: newUser.isMobileNoVerified,
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.ValidationError) {
      // Handle validation errors
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update a user by ID (Admin-only)
router.patch("/update/:id", checkRole(1, 2), async (req, res) => {
  try {
    const { id } = req.params;

    const userData = req.body?.userData;

    if (!userData) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { name, email, mobileNo, password, role } = userData;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Validate required fields
    if (!name || !email || !mobileNo || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let error = [];

    // Validate email
    if (!isValidEmail(email)) {
      error.push("Invalid email address");
      // return res.status(400).json({ message: "Invalid email address" });
    }

    // Validate mobile number
    if (!isValidIndianMobileNumber(mobileNo)) {
      error.push("Invalid Indian mobile number");
      // return res.status(400).json({ message: "Invalid Indian mobile number" });
    }

    if (!mongoose.Types.ObjectId.isValid(role)) {
      error.push("Invalid role ID");
      // return res.status(400).json({ message: "Invalid role ID" });
    }

    if (password && !validatePass.validate(password)) {
      error.push(
        "Password should be of minimum 8 digits containing uppercase and lowercase characters"
      );
    }

    if (error.length > 0) {
      return res.status(400).json({ message: error.join(",\n") });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // const user = User.findOneAndUpdate({ _id: id }, { $set: req.body });

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobileNo) user.mobileNo = mobileNo;
    if (role) user.role = role;

    // Update password if provided
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(password, salt);
    }

    // Save the updated user
    await user.save({ validateBeforeSave: false });

    // Return success response
    return res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileNoVerified: user.isMobileNoVerified,
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.ValidationError) {
      // Handle validation errors
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a user by ID (Admin-only)
router.delete("/:id", checkRole(1, 2), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add this to your user routes file (user.routes.js)
router.get("/me", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user in database (excluding sensitive fields)
    const user = await User.findById(userId)
      .select("-password -emailVerifyToken -resetToken")
      .populate("role", "roleName roleNumber roleKey")
      .populate("defaultAddress")
      .populate("center");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
      isEmailVerfied: user.isEmailVerfied,
      isMobileNoVerified: user.isMobileNoVerified,
      role: user.role,
      defaultAddress: user.defaultAddress,
      center: user.center,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;

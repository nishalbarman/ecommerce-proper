const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const Role = require("../../models/role.model");
const checkRole = require("../../middlewares");

const TAG = "roles.routes.js:--";

// Get all roles
router.get(
  "/",
  checkRole("admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const searchQuery = req.query;

      const PAGE = searchQuery?.page || 1;
      const LIMIT = searchQuery?.limit || 20;
      const SKIP = (PAGE - 1) * LIMIT;

      const totalCounts = await Role.countDocuments({});

      let roles;

      if (LIMIT === 0) {
        roles = await Role.find({}).sort({ createdAt: "desc" });
      } else {
        roles = await Role.find({})
          .sort({ createdAt: "desc" })
          .skip(SKIP)
          .limit(LIMIT);
      }

      const totalPages = Math.ceil(totalCounts / LIMIT);

      return res.status(200).json({ totalPages, roles });
    } catch (error) {
      console.log(TAG, error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", status: false });
    }
  },
);

// ADMIN ROUTE: Create a new role
router.post("/", checkRole("super-admin"), async (req, res) => {
  try {
    const roleData = req.body?.roleData;

    if (!roleData) {
      return res.status(400).json({ message: "Role Data Not Found" });
    }

    // Generate roleSlug from roleName
    const roleSlug = slugify(roleData.roleName, {
      lower: true,
      strict: true,
    });

    // Create a new role document
    const newRole = await Role.create({
      roleName: roleData.roleName,
      roleNumber: roleData.roleNumber,
      roleSlug, // Add roleSlug
    });

    return res.status(200).json({
      message: `Role created`,
      data: newRole,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ADMIN ROUTE: Update a role
router.patch(
  "/update/:roleId",
  checkRole("admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const roleId = req.params?.roleId;
      const roleData = req.body?.roleData;

      if (!roleData) {
        return res.status(400).json({ message: "Role Data Not Found" });
      }

      if (!roleId) {
        return res.status(400).json({ message: "Role Id Not Found" });
      }

      // Generate roleSlug if roleName is updated
      if (roleData.roleName) {
        roleData.roleSlug = slugify(roleData.roleName, {
          lower: true,
          strict: true,
        });
      }

      await Role.updateOne({ _id: roleId }, { $set: roleData });

      return res.status(200).json({
        message: `Role updated`,
      });
    } catch (error) {
      console.error(TAG, error);
      return res.status(500).json({ message: error.message });
    }
  },
);

// ADMIN ROUTE: Delete a role
router.delete(
  "/:roleId",
  checkRole("admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const roleId = req.params?.roleId;

      if (!roleId) {
        return res.status(400).json({ message: "Role ID Not Found" });
      }

      await Role.deleteOne({ _id: roleId });

      return res.status(200).json({
        message: `Role Deleted`,
      });
    } catch (error) {
      console.error(TAG, error);
      return res.status(500).json({ message: error.message });
    }
  },
);

// Get a single role by ID
router.get(
  "/view/:roleId",
  checkRole("admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const roleId = req.params?.roleId;

      if (!roleId) {
        return res.status(400).json({ message: "Role ID Not Found" });
      }

      const role = await Role.findOne({ _id: roleId });

      return res.status(200).json({
        role,
      });
    } catch (error) {
      console.error(TAG, error);
      return res.status(500).json({ message: error.message });
    }
  },
);

module.exports = router;

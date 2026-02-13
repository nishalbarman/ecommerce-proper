const express = require("express");
const router = express.Router();

const checkRole = require("../../middlewares");
const Coupon = require("../../models/coupon.model");

// Get all coupons (for admin)
router.get("/list", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const coupons = await Coupon.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Coupon.countDocuments();

    return res.json({
      success: true,
      coupons,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Create new coupon
router.post("/", checkRole(1, 2), async (req, res) => {
  try {
    const { code, off, minPurchasePrice, isPercentage, description } = req.body;

    // Validate input
    if (!code || !description || off <= 0) {
      return res.status(400).json({ message: "Invalid coupon data" });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      off,
      minPurchasePrice,
      isPercentage,
      description,
    });

    await newCoupon.save();

    return res.json({
      success: true,
      message: "Coupon created successfully",
      coupon: newCoupon,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update coupon
router.put("/:id", checkRole(1, 2), async (req, res) => {
  try {
    const { code, off, minPurchasePrice, isPercentage, description } = req.body;
    const couponId = req.params.id;

    // Validate input
    if (!code || !description || off <= 0) {
      return res.status(400).json({ message: "Invalid coupon data" });
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Check if new code conflicts with other coupons
    if (code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
    }

    coupon.code = code.toUpperCase();
    coupon.off = off;
    coupon.minPurchasePrice = minPurchasePrice;
    coupon.isPercentage = isPercentage;
    coupon.description = description;

    await coupon.save();

    return res.json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete coupon
router.delete("/:id", checkRole(1, 2), async (req, res) => {
  try {
    const couponId = req.params.id;

    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    return res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Validate coupon (existing route)
router.get("/validate", async (req, res) => {
  try {
    const code = req.query.code || null;

    if (!code) {
      return res.json({
        status: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.json({
        status: false,
        message: "Coupon not found",
      });
    }

    return res.json({
      status: true,
      message: "Coupon is valid",
      coupon: coupon,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

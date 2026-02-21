const express = require("express");
const router = express.Router();
const Category = require("../../models/category.model");
const getTokenDetails = require("../../helpter/getTokenDetails");
const { ImageUploadHelper } = require("../../helpter/imgUploadhelpter");
const checkRole = require("../../middlewares");
const { default: mongoose } = require("mongoose");

const TAG = "categories.routes.js:--";

router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query;

    const PAGE = searchQuery?.page || 1;
    const LIMIT = searchQuery?.limit || 20;
    const SKIP = (PAGE - 1) * LIMIT;

    const totalCounts = await Category.countDocuments({});

    let categories;

    if (LIMIT === 0) {
      categories = await Category.find({}).sort({ createdAt: "desc" });
    } else {
      categories = await Category.find({})
        .sort({ createdAt: "desc" })
        .skip(SKIP)
        .limit(LIMIT);
    }

    const totalPages = Math.ceil(totalCounts / LIMIT);

    return res.status(200).json({ totalPages, categories });
  } catch (error) {
    console.log(TAG, error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: false });
  }
});

// ADMIN ROUTE : Category create route
router.post("/", checkRole(1, 2), async (req, res) => {
  try {
    const categoryData = req.body?.categoryData;

    if (!categoryData) {
      return res.status(400).json({ message: "Category Data Not Found" });
    }

    // Now we are going to save the product to our database

    console.log(categoryData);

    // Create a new product document
    const newCategory = await Category.create({
      categoryImageUrl: categoryData.categoryImageUrl,
      categoryName: categoryData.categoryName,
      categoryKey: categoryData.categoryName
        .trim()
        .replaceAll(" ", "-")
        .toLowerCase(),
    });

    return res.status(200).json({
      message: `Category created`,
      data: newCategory,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ADMIN ROUTE : Category update route
router.patch("/update/:categoryId", checkRole(1, 2), async (req, res) => {
  try {
    const categoryId = req.params?.categoryId;

    const categoryData = req.body?.categoryData;

    if (!categoryData) {
      return res.status(400).json({ message: "Category Data Not Found" });
    }

    if (!categoryId) {
      return res.status(400).json({ message: "Category Id Not Found" });
    }

    if (categoryData?.categoryName) {
      categoryData.categoryKey = categoryData.categoryName
        .trim()
        .replaceAll(" ", "-")
        .toLowerCase();
    } else {
      delete categoryData.categoryName;
    }

    await Category.updateOne({ _id: categoryId }, { $set: categoryData });

    return res.status(200).json({
      message: `Category updated`,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ADMIN ROUTE : Category delete route
router.delete("/:categoryId", checkRole(1, 2), async (req, res) => {
  try {
    // const token = req?.jwt?.token || null;
    // if (!token) {
    //   return res.redirect("/#login/login");
    // }

    // const userDetails = getTokenDetails(token);
    // if (!userDetails || !userDetails?.role || userDetails.role !== 1) {
    //   return res.redirect("/#login/login");
    // }

    const categoryId = req.params?.categoryId;

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID Found" });
    }

    const categoryDelete = await Category.deleteOne({
      _id: categoryId,
    });

    return res.status(200).json({
      message: `Category Deleted`,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/view/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params?.categoryId;
    let isSlug = false;
    if (
      !mongoose.Types.ObjectId.isValid(categoryId) ||
      String(new mongoose.Types.ObjectId(categoryId)) !== categoryId
    ) {
      isSlug = true;
    }

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID Found" });
    }

    const filter = {};

    if (isSlug) {
      filter.categoryKey = categoryId;
    } else {
      filter._id = categoryId;
    }

    const category = await Category.findOne(filter);

    return res.status(200).json({
      category,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

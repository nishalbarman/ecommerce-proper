const mongoose = require("mongoose");
const express = require("express");
const getImageColors = require("get-image-colors");

const Banner = require("../../models/banner.model");

const checkRole = require("../../middlewares");

const router = express.Router();

const TAG = "";

router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query;

    const PAGE = searchQuery?.page || 1;
    const LIMIT = searchQuery?.limit || 20;
    const SKIP = (PAGE - 1) * LIMIT;

    const totalCounts = await Banner.countDocuments({});

    let banners;

    if (LIMIT === 0) {
      banners = await Banner.find({}).sort({ createdAt: "desc" });
    } else {
      banners = await Banner.find({})
        .sort({ createdAt: "desc" })
        .skip(SKIP)
        .limit(LIMIT);
    }

    const totalPages = Math.ceil(totalCounts / LIMIT);

    return res.status(200).json({ totalPages, banners });
  } catch (error) {
    console.log(TAG, error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: false });
  }
});

// ADMIN ROUTE : Category create route
router.post("/", checkRole(1), async (req, res) => {
  try {
    const categoryData = req.body?.categoryData;

    if (!categoryData) {
      return res.status(400).json({ message: "Category Data Not Found" });
    }

    // Now we are going to save the product to our database

    console.log(categoryData);

    const imageColors = await getImageColors(categoryData.imageUrl, {
      count: 5,
    });

    const [first, second, third, ...rest] = imageColors[0]._rgb;

    const averageColor = `rgba(${first},${second},${third},0.8)`;

    // Create a new product document
    const newCategory = await Banner.create({
      imageUrl: categoryData.imageUrl,
      title: categoryData.title,
      description: categoryData.description,
      redirectUrl: categoryData.redirectUrl,
      bgColor: averageColor,
      altText: categoryData.title.replaceAll(" ", "-").toLowerCase(),
      key: categoryData.title.trim().replaceAll(" ", "-").toLowerCase(),
    });

    return res.status(200).json({
      message: `Banner created`,
      data: newCategory,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ADMIN ROUTE : Category update route
router.patch("/update/:categoryId", checkRole(1), async (req, res) => {
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

    await Banner.updateOne({ _id: categoryId }, { $set: categoryData });

    return res.status(200).json({
      message: `Category updated`,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ADMIN ROUTE : Category delete route
router.delete("/:categoryId", checkRole(1), async (req, res) => {
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

    const categoryDelete = await Banner.deleteOne({
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

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID Found" });
    }

    const category = await Banner.findOne({
      _id: categoryId,
    });

    return res.status(200).json({
      banner: category,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

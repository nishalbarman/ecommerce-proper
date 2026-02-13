const express = require("express");
const router = express.Router();
const Feature = require("../../models/feature.model");
const checkRole = require("../../middlewares");

const TAG = "features.routes.js:--";

router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query;

    const PAGE = searchQuery?.page || 1;
    const LIMIT = searchQuery?.limit || 20;
    const SKIP = (PAGE - 1) * LIMIT;

    const totalCounts = await Feature.countDocuments({});

    let features;

    if (LIMIT === 0) {
      features = await Feature.find({}).sort({ createdAt: "desc" });
    } else {
      features = await Feature.find({})
        .sort({ createdAt: "desc" })
        .skip(SKIP)
        .limit(LIMIT);
    }

    const totalPages = Math.ceil(totalCounts / LIMIT);

    return res.status(200).json({ totalPages, features });
  } catch (error) {
    console.log(TAG, error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: false });
  }
});

// ADMIN ROUTE : Feature create route
router.post("/", checkRole(1, 2), async (req, res) => {
  try {
    const featureData = req.body?.featureData;

    if (!featureData) {
      return res.status(400).json({ message: "Feature Data Not Found" });
    }

    // Now we are going to save the product to our database

    console.log(featureData);

    // Create a new product document
    const newFeature = await Feature.create({
      featureImageUrl: featureData.featureImageUrl,
      featureName: featureData.featureName,
      featureKey: featureData.featureName
        .trim()
        .replaceAll(" ", "-")
        .toLowerCase(),
    });

    return res.status(200).json({
      message: `Feature created`,
      data: newFeature,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ADMIN ROUTE : Feature update route
router.patch("/update/:featureId", checkRole(1, 2), async (req, res) => {
  try {
    const featureId = req.params?.featureId;

    const featureData = req.body?.featureData;

    if (!featureData) {
      return res.status(400).json({ message: "Feature Data Not Found" });
    }

    if (!featureId) {
      return res.status(400).json({ message: "Feature Id Not Found" });
    }

    if (featureData?.featureName) {
      featureData.featureKey = featureData.featureName
        .trim()
        .replaceAll(" ", "-")
        .toLowerCase();
    } else {
      delete featureData.featureName;
    }

    await Feature.updateOne({ _id: featureId }, { $set: featureData });

    return res.status(200).json({
      message: `Feature updated`,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ADMIN ROUTE : Feature delete route
router.delete("/:featureId", checkRole(1, 2), async (req, res) => {
  try {
    const featureId = req.params?.featureId;

    if (!featureId) {
      return res.status(400).json({ message: "Feature ID Found" });
    }

    const featureDelete = await Feature.deleteOne({
      _id: featureId,
    });

    return res.status(200).json({
      message: `Feature Deleted`,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/view/:featureId", async (req, res) => {
  try {
    const featureId = req.params?.featureId;

    if (!featureId) {
      return res.status(400).json({ message: "Feature ID Found" });
    }

    const feature = await Feature.findOne({
      _id: featureId,
    });

    return res.status(200).json({
      feature,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

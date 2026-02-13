const express = require("express");
const router = express.Router();
const WebConfig = require("../../models/webConfig.model");
const checkRole = require("../../middlewares");

// Get web config
router.get("/", async (req, res) => {
  try {
    const config = await WebConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return res.status(404).json({ message: "No configuration found" });
    }
    return res.json(config);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Create or update web config (admin only)
router.post("/", checkRole(1, 2), async (req, res) => {
  try {
    const configData = req.body;

    // Validate required fields
    if (
      !configData.brandName ||
      !configData.brandEmail ||
      !configData.address ||
      !configData.websiteUrl
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the latest config
    let config = await WebConfig.findOne().sort({ createdAt: -1 });

    if (config) {
      // Update existing config
      config = await WebConfig.findByIdAndUpdate(
        config._id,
        {
          $set: configData,
          updatedAt: Date.now(),
        },
        { new: true }
      );
    } else {
      // Create new config
      config = new WebConfig(configData);
      await config.save();
    }

    return res.json(config);
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error) {
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

module.exports = router;

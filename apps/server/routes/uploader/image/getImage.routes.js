const express = require("express");
const Image = require("../../../models/image.model");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Get page and limit from request query parameters
    const PAGE = req.query?.page || 1;
    const LIMIT = req.query?.limit || 50;

    // Calculate the number of items to skip based on pagination
    const SKIP = (PAGE - 1) * LIMIT;

    // Retrieve total count of images in the database
    const totalCount = await Image.countDocuments();

    // Query the database for images with pagination
    const images = await Image.find({})
      .sort({ createdAt: "desc" })
      .skip(SKIP)
      .limit(LIMIT);

    // Calculate total number of pages for pagination
    const totalPages = Math.ceil(totalCount / LIMIT);

    return res.status(200).json({
      totalPages,
      pageLimit: parseInt(LIMIT),
      totalCount: totalCount,
      data: images,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;

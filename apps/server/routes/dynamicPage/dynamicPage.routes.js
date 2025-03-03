const express = require("express");
const DynamicPage = require("../../models/dynamicPage.model");

const router = express.Router();

// Fetch a dynamic page by slug
router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query;

    const PAGE = searchQuery?.page || 1;
    const LIMIT = searchQuery?.limit || 20;
    const SKIP = (PAGE - 1) * LIMIT;

    const totalCounts = await DynamicPage.countDocuments({});

    let dynamicPages;

    if (LIMIT === 0) {
      dynamicPages = await DynamicPage.find({}).sort({ createdAt: "desc" });
    } else {
      dynamicPages = await DynamicPage.find({})
        .sort({ createdAt: "desc" })
        .skip(SKIP)
        .limit(LIMIT);
    }

    const totalPages = Math.ceil(totalCounts / LIMIT);

    return res.status(200).json({ totalPages, dynamicPages });
  } catch (error) {
    console.log(TAG, error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: false });
  }
});

// Create a new dynamic page
router.post("/", async (req, res) => {
  try {
    const { slug, title, description, shortDescription, avatar, cover } =
      req.body?.dynamicPageData;
    const newPage = new DynamicPage({
      slug,
      title,
      description,
      shortDescription,
      avatar,
      cover,
    });
    await newPage.save();
    res.status(201).json({ message: "Dynamic page created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating dynamic page", error });
  }
});

// Fetch a dynamic page by slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await DynamicPage.findOne({ slug });
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dynamic page", error });
  }
});

// Update a dynamic page by slug
router.patch("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, description, shortDescription, avatar, cover } =
      req.body?.dynamicPageData;
    const updatedPage = await DynamicPage.findOneAndUpdate(
      { _id: slug },
      { title, description, shortDescription, avatar, cover },
      { new: true }
    );
    if (!updatedPage) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.status(200).json({ message: "Dynamic page updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating dynamic page", error });
  }
});

// Delete a dynamic page by slug
router.delete("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const deletedPage = await DynamicPage.findOneAndDelete({ _id: slug });
    if (!deletedPage) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.status(200).json({ message: "Dynamic page deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting dynamic page", error });
  }
});

module.exports = router;

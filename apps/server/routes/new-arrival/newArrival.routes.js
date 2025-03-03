const express = require("express");
const NewArrival = require("../../models/NewArrival.model");

const router = express.Router();

// Create New Arrival
router.post("/", async (req, res) => {
  try {
    const { title, shortDescription, imageUrl, productId } = req.body;
    const newArrival = new NewArrival({
      title,
      shortDescription,
      imageUrl,
      productId,
    });
    await newArrival.save();
    res.status(201).json(newArrival);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All New Arrivals
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const newArrivals = await NewArrival.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await NewArrival.countDocuments();
    res.status(200).json({
      newArrivals,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update New Arrival
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedNewArrival = await NewArrival.findByIdAndUpdate(id, req.body, {
      new: false,
    });
    res.status(200).json(updatedNewArrival);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete New Arrival
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await NewArrival.findByIdAndDelete(id);
    res.status(200).json({ message: "New Arrival deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

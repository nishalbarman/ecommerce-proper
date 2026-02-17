const express = require("express");
const HeroProduct = require("../../models/heroProduct.model");

const router = express.Router();

// Create Hero Product
router.post("/", async (req, res) => {
  try {
    const { heroProductData } = req.body;
    const newHeroProduct = new HeroProduct(heroProductData);
    await newHeroProduct.save();
    res.status(201).json({ message: "Hero Product created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating hero product", error });
  }
});

// Fetch All Hero Products
router.get("/", async (req, res) => {
  try {
    const heroProducts = await HeroProduct.find();
    res.status(200).json(heroProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hero products", error });
  }
});

// Update Hero Product
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { heroProductData } = req.body;
    console.log(heroProductData)
    await HeroProduct.findByIdAndUpdate(id, heroProductData);
    res.status(200).json({ message: "Hero Product updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating hero product", error });
  }
});

// Delete Hero Product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await HeroProduct.findByIdAndDelete(id);
    res.status(200).json({ message: "Hero Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting hero product", error });
  }
});

module.exports =router;

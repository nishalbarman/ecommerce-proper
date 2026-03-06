const mongoose = require("mongoose");

const heroProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    shortDescription: { type: String, required: true },
    heroImage: {
      imageUrl: { type: String, required: true },
      bgColor: { type: String, required: true },
    },
    heroBgImage: {
      imageUrl: { type: String, required: true },
      bgColor: { type: String, required: true },
    },
    productSlug: { type: String, required: true },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "products",
      required: true,
    },
  },
  { timestamps: true },
);

const HeroProduct =
  mongoose.models.hero_product ||
  mongoose.model("hero_product", heroProductSchema);

module.exports = HeroProduct;

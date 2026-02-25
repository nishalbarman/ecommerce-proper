const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true },
    categoryImage: {
      imageUrl: { type: String, required: true },
      bgColor: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true },
    categoryKey: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

const Category =
  mongoose.models.categories || mongoose.model("categories", categorySchema);

module.exports = Category;

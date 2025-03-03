const mongoose = require("mongoose");

const dynamicPageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // Unique identifier for the page
    title: { type: String, required: true }, // Title of the page
    description: { type: String, required: true }, // Main content of the page
    shortDescription: { type: String }, // Short summary of the page
    avatar: { type: String }, // URL for the avatar/image
    cover: { type: String }, // URL for the cover image
  },
  { timestamps: true }
);

const DynamicPage =
  mongoose.models.dynamic_page ||
  mongoose.model("dynamic_page", dynamicPageSchema);

module.exports = DynamicPage;

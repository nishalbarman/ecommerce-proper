const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    title: { type: String },
    thumbnailUrl: { type: String, required: true },
    imageLink: { type: String, required: true },
    deleteLink: { type: String, required: true },
    reference: { type: String, required: false },
    platform: { type: String, required: true },
    uploadedBy: { type: String, required: true },
  },
  {
    timestamps: true,
    query: {
      all() {
        return this.where({});
      },
    },
  }
);

const Image = mongoose.models.images || mongoose.model("images", imageSchema);

module.exports = Image;

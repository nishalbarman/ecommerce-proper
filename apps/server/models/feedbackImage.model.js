const mongoose = require("mongoose");

const feedbackImageSchema = new mongoose.Schema(
  {
    title: { type: String },
    thumbnailUrl: { type: String, required: true },
    imageUrl: { type: String, required: true },
    bgColor: { type: String, required: true, default: null },
    reference: { type: String, required: false },
    platform: { type: String, required: true },
    uploadedBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const FeedbackImage =
  mongoose.models.feedback_images ||
  mongoose.model("feedback_images", feedbackImageSchema);

module.exports = FeedbackImage;

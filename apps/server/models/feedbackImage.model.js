const mongoose = require("mongoose");

const feedbackImageSchema = new mongoose.Schema(
  {
    title: { type: String },
    thumbnailUrl: { type: String, required: true },
    imageLink: { type: String, required: true },
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

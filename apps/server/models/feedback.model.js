const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    starsGiven: {
      type: Number,
      default: 1,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
      required: [true, "Rating is required"],
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "products",
      required: [true, "Product reference is required"],
    },
    givenBy: {
      type: String,
      required: [true, "Reviewer name is required"],
      trim: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: [true, "User reference is required"],
    },
    productType: {
      type: String,
      enum: ["buy", "rent", "subscription"],
      required: [true, "Product type is required"],
    },
    images: [
      {
        type: mongoose.Types.ObjectId,
        ref: "feedback_images",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
feedbackSchema.index({ product: 1, status: 1 });
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback =
  mongoose.models.feedbacks || mongoose.model("feedbacks", feedbackSchema);

module.exports = Feedback;

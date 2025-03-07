const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema(
  {
    featureName: { type: String, required: true },
    featureImageUrl: { type: String, required: true },
    featureKey: { type: String, required: false, unique: true },
  },
  {
    timestamps: true,
  }
);

const Feature =
  mongoose.models.features || mongoose.model("features", featureSchema);

module.exports = Feature;

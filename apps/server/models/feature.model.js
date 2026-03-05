const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema(
  {
    featureName: { type: String, required: true },
    featureDescription: { type: String, required: true },
    featureImage: {
      imageUrl: { type: String, required: true },
      bgColor: { type: String, required: true },
    },
    featureSlug: { type: String, required: false, unique: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "stores", required: false },
  },
  {
    timestamps: true,
  },
);

const Feature =
  mongoose.models.features || mongoose.model("features", featureSchema);

module.exports = Feature;

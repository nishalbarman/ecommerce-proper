const mongoose = require("mongoose");

const newArrivalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    imageUrl: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const NewArrival =
  mongoose.models.new_arrival ||
  mongoose.model("new_arrival", newArrivalSchema);

module.exports = NewArrival;

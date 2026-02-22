// models/paymentGateway.model.js
const mongoose = require("mongoose");

const paymentGatewaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    gatewayImageUrl: {
      type: String,
      default: "",
    },
    priority: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.payment_gateway || mongoose.model(
  "payment_gateway",
  paymentGatewaySchema
);
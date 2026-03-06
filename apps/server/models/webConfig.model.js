const mongoose = require("mongoose");

const WebConfigSchema = new mongoose.Schema(
  {
    brandLogo: {
      imageUrl: { type: String, required: true, trim: true },
      bgColor: { type: String, required: true, trim: true },
    },
    brandName: { type: String, required: true, trim: true },
    brandEmail: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    whatsAppLink: { type: String, trim: true },
    facebookLink: { type: String, trim: true },
    instagramLink: { type: String, trim: true },
    websiteUrl: { type: String, required: true, trim: true },
    newsletterDiscount: { type: Number, default: 5 },
    deliveryPrice: { type: Number, default: 45 },
    freeDeliveryAbove: { type: Number, default: 0 },
    about: { type: String, required: true, default: "" },
  },
  { timestamps: true },
);

const WebConfig =
  mongoose.models.web_config || mongoose.model("web_config", WebConfigSchema);

module.exports = WebConfig;

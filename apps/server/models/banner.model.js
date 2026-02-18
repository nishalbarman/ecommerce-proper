const mongoose = require("mongoose");
const {
  hasOneSpaceBetweenNames,
  isValidEmail,
  isValidIndianMobileNumber,
  isValidUrl,
} = require("../utils/validator");

const bannerSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    title: { type: String, required: true },
    altText: { type: String, required: true },
    description: { type: String, required: true },
    redirectUrl: { type: String, required: false, default: null },
    bgColor: { type: String, required: true },
    key: { type: String, required: true, unique: true },
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

const Banner =
  mongoose.models.banners || mongoose.model("banners", bannerSchema);

// ----------------------------------------->
/****************************************** */
/**        Banner Schema Validator         **/
/****************************************** */
// ----------------------------------------->

// Banner.schema.path("imageUrl").validate({
//   validator: function (value) {
//     return value && isValidUrl(value);
//   },
//   message: "Invalid Url",
// });

// Banner.schema.path("redirectUrl").validate({
//   validator: function (value) {
//     return value && value.includes("/");
//   },
//   message: "Invalid Link",
// });

module.exports = Banner;

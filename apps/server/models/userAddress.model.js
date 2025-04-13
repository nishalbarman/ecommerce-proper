const mongoose = require("mongoose");

const userAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: "users", required: false },
    landmark: { type: String, required: false },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    streetName: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Address =
  mongoose.models.userAddresses ||
  mongoose.model("user_addresses", userAddressSchema);

module.exports = Address;

const mongoose = require("mongoose");

const orderGroupSchema = new mongoose.Schema(
  {
    orderGroupID: { type: String, required: false },
    paymentTransactionID: { type: String, required: false },

    user: { type: mongoose.Types.ObjectId, ref: "users" },

    orders: { type: mongoose.Types.ObjectId, ref: "orders" },

    originalPrice: { type: Number, required: true },
    couponDiscountedPrice: { type: Number, default: 0 },
    appliedCoupon: {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: "coupons",
    },
    discountedPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },

    address: {
      physicalAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        landmark: { type: String, required: false },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        streetName: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
      },
      location: {
        type: [Number, Number], // Array of [longitude, latitude]
        required: false,
      },
    },

    orderType: { type: String, required: true, enums: ["buy", "rent"] },

    // status related
    orderStatus: {
      type: String,
      default: "On Hold",
      enums: [
        "On Hold",
        "Pending",
        "On Progress",
        "Accepted",
        "Rejected",
        "Cancelled",
        "On The Way",
        "PickUp Ready",
        "Delivered",
      ],
    },

    paymentMode: {
      type: String,
      enums: ["Prepaid", "Cash On Delivery", "Cash On Pickup"],
    },

    paymentStatus: {
      type: String,
      default: "Pending",
      enums: ["Success", "Failed", "Pending"],
    },

    shipmentType: {
      type: String,
      required: false,
      enums: ["self_pickup", "delivery_partner"],
      default: "self_pickup",
    },

    store: { type: mongoose.Types.ObjectId, required: false, default: null },

    // tracking link for the order track
    trackingLink: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

orderGroupSchema.index({ "$**": "text" });

const OrderGroup =
  mongoose.models.order_group ||
  mongoose.model("order_group", orderGroupSchema);

module.exports = OrderGroup;

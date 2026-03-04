const mongoose = require("mongoose");

const orderGroupSchema = new mongoose.Schema(
  {
    orderGroupID: { type: String, required: false },
    paymentTransactionID: { type: String, required: false },

    user: { type: mongoose.Types.ObjectId, ref: "users" },

    previewImages: [{ imageUrl: { type: String }, bgColor: { type: String } }],

    orders: [{ type: mongoose.Types.ObjectId, ref: "orders" }],

    pricingDetails: {
      groupOriginalPrice: { type: Number, default: 0 },
      groupDiscountedPrice: { type: Number, default: 0 },
      groupSaleDiscount: { type: Number, default: 0 },
      couponDiscountGiven: { type: Number, default: 0 },
      shippingPrice: { type: Number, default: 0 },
      groupFinalOrderPrice: { type: Number, default: 0 },
    },

    appliedCoupon: {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: "coupons",
    },

    shippingApplied: { type: Boolean, default: false },

    address: {
      fullAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        landmark: { type: String, required: false },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        streetName: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
      },
      coordinates: {
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
        "Processing",
        "Unable To Fulfill",
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
      default: "delivery_partner",
    },

    store: { type: mongoose.Types.ObjectId, required: false, default: null },

    // tracking link for the order track
    trackingUrl: { type: String, default: "" },

    refundStatus: {
      type: String,
      enums: ["No Refund", "Refund Requested", "Refunded"],
      default: "No Refund",
    },
  },
  {
    timestamps: true,
  },
);

orderGroupSchema.index({ "$**": "text" });

// 1️⃣ Search by orderGroupID (very common)
orderGroupSchema.index({ orderGroupID: 1 });

orderGroupSchema.index({ orderGroupID: 1, orderStatus: 1 });

// 2️⃣ Search by paymentTransactionID
orderGroupSchema.index({ paymentTransactionID: 1 });

// 3️⃣ User order listing (VERY IMPORTANT)
orderGroupSchema.index({ user: 1, createdAt: -1 });

// 4️⃣ Filter by orderStatus
orderGroupSchema.index({ orderStatus: 1 });

// 5️⃣ Filter by paymentStatus
orderGroupSchema.index({ paymentStatus: 1 });

// 6️⃣ Admin panel filtering (status + payment)
orderGroupSchema.index({ orderStatus: 1, paymentStatus: 1 });

// 7️⃣ Store wise orders
orderGroupSchema.index({ store: 1, createdAt: -1 });

// 8️⃣ Order type filtering (buy / rent)
orderGroupSchema.index({ orderType: 1 });

// 9️⃣ If you frequently filter by both orderStatus + createdAt
orderGroupSchema.index({ orderStatus: 1, createdAt: -1 });

const OrderGroup =
  mongoose.models.order_group ||
  mongoose.model("order_group", orderGroupSchema);

module.exports = OrderGroup;

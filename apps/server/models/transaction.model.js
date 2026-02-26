const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  orderGroupID: { type: String, required: true },
  paymentTransactionID: { type: String, required: true },
  orders: { type: [mongoose.Types.ObjectId], ref: "orders", required: true },
  user: { type: mongoose.Types.ObjectId, ref: "users", required: true },

  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed", "COC"] },

  gateway: { type: String, required: true },

  pricingDetails: {
    originalPrice: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },
    saleDiscount: { type: Number, default: 0 },
    couponDiscountGiven: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    finalOrderPrice: { type: Number, default: 0 },
  },

  appliedCoupon: { type: mongoose.Types.ObjectId, ref: "coupons" },
  shippingApplied: { type: Boolean, required: true },
});

const PaymentTransModel =
  mongoose.models.payment_transactions ||
  mongoose.model("payment_transactions", transactionSchema);

module.exports = PaymentTransModel;

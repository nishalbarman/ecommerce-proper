const express = require("express");
const router = express.Router();
const RazorPay = require("razorpay");
const { v4: uuidv4 } = require("uuid");

const checkRole = require("../../middlewares");

const User = require("../../models/user.model");
const Cart = require("../../models/cart.model");
const Coupon = require("../../models/coupon.model");
const Order = require("../../models/order.model");
const UserAddress = require("../../models/userAddress.model");
const PaymentTransModel = require("../../models/transaction.model");
const generateUniqueId = require("../../helpter/generateUniqueId");
const OrderGroupModel = require("../../models/orderGroup.model");
const WebConfig = require("../../models/webConfig.model");

const RAZORPAY_KEY = process.env.RAZORPAY_KEY;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

const razorpayInstance = new RazorPay({
  key_id: RAZORPAY_KEY,
  key_secret: RAZORPAY_SECRET,
});

router.get("/shipping-pricing/:productType", async (req, res) => {
  try {
    const productType = req.params?.productType || "buy";

    const userDetails = req.user;

    if (!productType) {
      return res.status(403).json({ message: "Bad Request" });
    }

    let deliveryChargeDetails = await WebConfig.findOne()
      .sort({ createdAt: -1 })
      .select("deliveryPrice freeDeliveryAbove");
    if (!deliveryChargeDetails) {
      deliveryChargeDetails = { deliveryPrice: 100, freeDeliveryAbove: 0 };
    }

    const freeDeliveryAboveMinimumPurchase =
      deliveryChargeDetails?.freeDeliveryAbove > 0;
    const freeDeliveryMinimumAmount = deliveryChargeDetails?.freeDeliveryAbove;

    // const user = await User.findById(userDetails._id);

    return res.status(200).json({
      shippingPrice: deliveryChargeDetails.deliveryPrice,
      isFreeDeliveryAvailable: freeDeliveryAboveMinimumPurchase,
      requiredMinimumAmountForFreeDelivery: freeDeliveryMinimumAmount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;

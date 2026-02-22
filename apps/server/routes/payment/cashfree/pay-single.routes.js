const express = require("express");
const router = express.Router();
const { Cashfree } = require("cashfree-pg");

const checkRole = require("../../../middlewares");

const User = require("../../../models/user.model");
const Cart = require("../../../models/cart.model");
const { Product, ProductVariant } = require("../../../models/product.model");
const Coupon = require("../../../models/coupon.model");
const Order = require("../../../models/order.model");
const UserAddress = require("../../../models/userAddress.model");
const PaymentTransModel = require("../../../models/transaction.model");
const generateUniqueId = require("../../../helpter/generateUniqueId");
const WebConfig = require("../../../models/webConfig.model");

// ✅ Cashfree Init
const cashfree = new Cashfree(
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? "production"
    : "sandbox",
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

router.post("/:productType", checkRole(0, 1, 2), async (req, res) => {
  try {
    const productType = req.params?.productType || "buy";
    const productVariantId = req.body?.productVariantId || null;
    const productId = req.body?.productId || null;
    const address = req.body?.address;
    const quantity = req.body?.quantity || 1;

    const userDetails = req.user;

    if (!productType || !address || (!productVariantId && !productId)) {
      return res.status(403).json({ message: "Bad Request" });
    }

    const appliedCouponID = req.body?.coupon || null;

    let productData = null;

    if (productVariantId) {
      productData = await ProductVariant.findOne({
        _id: productVariantId,
      }).populate({ path: "product", select: "title" });
    } else {
      productData = await Product.findOne({
        _id: productId,
      });
    }

    if (!productData) {
      return res.status(400).json({ message: "Product not found" });
    }

    let totalPrice = 0;
    const Title = productData?.product?.title || productData?.title;

    // Price Calculation
    if (productType === "buy") {
      totalPrice = productData.discountedPrice * +quantity;
    } else if (productType === "rent") {
      const RentDays = req.body?.rentDays;
      totalPrice = productData.rentingPrice * +quantity * RentDays;
    }

    const totalDiscountedPriceWithoutAnyCouponAndShipping = totalPrice;
    let couponDiscountedPrice = 0;

    let deliveryChargeDetails = await WebConfig.findOne()
      .sort({ createdAt: -1 })
      .select("deliveryPrice freeDeliveryAbove");

    if (!deliveryChargeDetails) {
      deliveryChargeDetails = { deliveryPrice: 100, freeDeliveryAbove: 0 };
    }

    let shippingApplied = false;

    if (
      !(
        deliveryChargeDetails.freeDeliveryAbove > 0 &&
        totalPrice >= deliveryChargeDetails.freeDeliveryAbove
      )
    ) {
      totalPrice += deliveryChargeDetails.deliveryPrice;
      shippingApplied = true;
    }

    // Coupon
    if (appliedCouponID) {
      const appliedCoupon = await Coupon.findById(appliedCouponID);

      if (appliedCoupon) {
        const discount = appliedCoupon.isPercentage
          ? (totalPrice / 100) * appliedCoupon.off
          : appliedCoupon.off;

        couponDiscountedPrice = discount;
        totalPrice -= discount;
      }
    }

    const productNames = Title;

    const addressDocument = await UserAddress.findById(address);

    const paymentTxnId = generateUniqueId("PT");
    const orderGroupID = generateUniqueId("OD");

    // ✅ CASHFREE ORDER CREATE
    const orderRequest = {
      order_id: paymentTxnId,
      order_amount: totalPrice, // ✅ no *100
      order_currency: "INR",

      customer_details: {
        customer_id: userDetails._id.toString(),
        customer_email: userDetails.email,
        customer_phone: userDetails.mobileNo,
        customer_name: userDetails.name,
      },

      order_meta: {
        return_url: `https://yourfrontend.com/payment-success?order_id={order_id}`,
      },

      order_note: productNames,
    };

    const response = await cashfree.PGCreateOrder(orderRequest);

    // Create Order in DB
    let createdOrder = {
      product: productData?.product?._id || productData?._id,
      user: userDetails._id,
      orderGroupID,
      paymentTxnId,
      title: productNames,
      quantity: +quantity,
      orderType: "buy",
      address: { physicalAddress: addressDocument },
      orderStatus: "Pending",
      paymentMode: "Prepaid",
      shipmentType: "delivery_partner",
      previewImage: productData.previewImage,
      price: productData.discountedPrice * +quantity,
      shippingPrice: +productData.shippingPrice,
      color: productData.color || null,
      size: productData.size || null,
    };

    const order = await Order.create(createdOrder);

    await PaymentTransModel.create({
      orderGroupID,
      paymentTransactionID: paymentTxnId,
      user: userDetails._id,
      order: order._id,
      paymentStatus: "Pending",
      shippingPrice: shippingApplied ? deliveryChargeDetails.deliveryPrice : 0,
      subTotalPrice:
        totalPrice - (shippingApplied ? deliveryChargeDetails.deliveryPrice : 0),
      totalPrice: totalPrice,
    });

    return res.status(200).json({
      payment_session_id: response.data.payment_session_id,
      order_id: paymentTxnId,
      amount: totalPrice,
      name: userDetails.name,
      email: userDetails.email,
      mobileNo: userDetails.mobileNo,
      productinfo: productNames,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

module.exports = router;
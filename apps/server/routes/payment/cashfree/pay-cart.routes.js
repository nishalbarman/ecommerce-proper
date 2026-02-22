const express = require("express");
const router = express.Router();
const { Cashfree, CFEnvironment } = require("cashfree-pg");

const checkRole = require("../../../middlewares");

const User = require("../../../models/user.model");
const Cart = require("../../../models/cart.model");
const Coupon = require("../../../models/coupon.model");
const Order = require("../../../models/order.model");
const UserAddress = require("../../../models/userAddress.model");
const PaymentTransModel = require("../../../models/transaction.model");
const generateUniqueId = require("../../../helpter/generateUniqueId");
const WebConfig = require("../../../models/webConfig.model");

// ✅ Initialize Cashfree
const cashfree = new Cashfree(
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY,
);

router.post("/:productType", checkRole(0, 1, 2), async (req, res) => {
  try {
    const productType = req.params?.productType || "buy";
    const address = req.body?.address;

    const userDetails = req.user;

    if (!productType || !address) {
      return res.status(403).json({ message: "Bad Request" });
    }

    const appliedCouponID = req.query.coupon || null;

    const cartItemsForUser = await Cart.find({
      user: userDetails._id,
      productType: productType,
    }).populate([
      { path: "product", select: "-productVariant" },
      { path: "variant", select: "-product" },
    ]);

    if (!cartItemsForUser || cartItemsForUser.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const cartIds = [];

    const paymentObject = cartItemsForUser.reduce(
      (pay, cartItem) => {
        cartIds.push(cartItem._id);

        let totalPrice = 0;
        const Title = cartItem.product.title;

        if (productType === "buy" && !!cartItem.variant) {
          totalPrice = cartItem.variant.discountedPrice * cartItem.quantity;
        } else if (productType === "buy" && !cartItem.variant) {
          totalPrice = cartItem.product.discountedPrice * cartItem.quantity;
        }

        return {
          amount: pay.amount + totalPrice,
          productinfo: [...pay.productinfo, Title],
        };
      },
      { amount: 0, productinfo: [] },
    );

    let deliveryChargeDetails = await WebConfig.findOne()
      .sort({ createdAt: -1 })
      .select("deliveryPrice freeDeliveryAbove");

    if (!deliveryChargeDetails) {
      deliveryChargeDetails = { deliveryPrice: 100, freeDeliveryAbove: 0 };
    }

    if (
      !(
        deliveryChargeDetails.freeDeliveryAbove > 0 &&
        paymentObject.amount >= deliveryChargeDetails.freeDeliveryAbove
      )
    ) {
      paymentObject.amount += deliveryChargeDetails.deliveryPrice;
    }

    // Coupon logic
    if (!!appliedCouponID) {
      const appliedCoupon = await Coupon.findById(appliedCouponID);

      if (appliedCoupon) {
        const discount = appliedCoupon.isPercentage
          ? (paymentObject.amount / 100) * appliedCoupon.off
          : appliedCoupon.off;

        paymentObject.amount -= discount;
      }
    }

    const productNames = paymentObject.productinfo.join(", ");

    const addressDocument = await UserAddress.findById(address);

    const paymentTxnId = generateUniqueId("PT");
    const orderGroupID = generateUniqueId("OD");

    // ✅ CASHFREE ORDER CREATE
    const orderRequest = {
      order_id: paymentTxnId,
      order_amount: paymentObject.amount,
      order_currency: "INR",

      customer_details: {
        customer_id: userDetails._id.toString(),
        customer_email: userDetails.email,
        customer_phone: userDetails.mobileNo,
        customer_name: userDetails.name,
      },

      order_meta: {
        return_url: `https://cartshopping.in/payment-success?order_id=`,
      },

      order_note: productNames,
    };

    const response = await cashfree.PGCreateOrder(orderRequest, "2025/01/01");

    // Save Orders (same as your logic)
    const orders = await Order.insertMany(
      cartItemsForUser.map((item) => ({
        product: item.product._id,
        user: userDetails._id,
        orderGroupID,
        paymentTxnId,
        title: item.product.title,
        quantity: item.quantity,
        orderType: "buy",
        address: { physicalAddress: addressDocument },
        orderStatus: "Pending",
        paymentMode: "Prepaid",
      })),
    );

    await PaymentTransModel.create({
      orderGroupID,
      paymentTransactionID: paymentTxnId,
      user: userDetails._id,
      order: orders.map((item) => item._id),
      paymentStatus: "Pending",
      totalPrice: paymentObject.amount,
    });

    return res.status(200).json({
      payment_session_id: response.data.payment_session_id,
      order_id: paymentTxnId,
      amount: paymentObject.amount,
      name: userDetails.name,
      email: userDetails.email,
      mobileNo: userDetails.mobileNo,
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

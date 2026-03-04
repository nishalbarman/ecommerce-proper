const express = require("express");
const router = express.Router();
const https = require("https");

const PaytmChecksum = require("paytmchecksum");

const { v4: uuidv4 } = require("uuid");

const checkRole = require("../../../middlewares");

const User = require("../../../models/user.model");
const Cart = require("../../../models/cart.model");
const Coupon = require("../../../models/coupon.model");
const Order = require("../../../models/order.model");
const Address = require("../../../models/centerAddress.model");
const PaymentTransModel = require("../../../models/transaction.model");
const { default: axios } = require("axios");
const { resolve } = require("path");
const calculateCart = require("../../../helpter/cart/calculateCart");
const createOrderWithTransaction = require("../../../helpter/order/createOrder");

const PAYTM_MERCHANT_KEY = process.env.PAYTM_MKEY;
const PAYTM_MID = process.env.PAYTM_MID;
const PAYTM_CHANNEL_ID = process.env.PAYTM_CHANNEL_ID;

router.post(
  "/:productType",
  checkRole("user", "admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const productType = req.params?.productType || "buy";
      const address = req.body?.address;

      const userDetails = req.user;

      if (!productType || !address) {
        return res.status(403).json({ message: "Bad Request" });
      }

      const appliedCouponID = req.query.coupon || null;
      console.log("Applied coupon id is: : ", appliedCouponID);

      const cartItemsForUser = await Cart.find({
        user: userDetails._id,
        productType: productType,
      }).populate([
        {
          path: "product",
          select: "-productVariant",
        },
        {
          path: "variant",
          select: "-product",
        },
      ]);

      if (!cartItemsForUser) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // TODO: Still NEED to handle out of stock products

      const {
        cartIds,
        productNames,
        MRP,
        saleDiscountedPrice,
        totalSaleDiscount,
        shippingPrice,
        shippingApplied,
        couponDiscount,
        finalOrderPrice,
      } = await calculateCart({
        cartItems: cartItemsForUser,
        productType,
        couponId: appliedCouponID,
      });

      const addressDocument = await UserAddress.findById(address);

      const user = await User.findById(userDetails._id);

      const paymentTxnId = generateUniqueId("pt");
      const orderGroupID = generateUniqueId("od");

      let paytmParams = {};

      paytmParams.body = {
        requestType: "Payment",
        mid: PAYTM_MID,
        websiteName: "WEBSTAGING",
        orderId: orderGroupID,
        callbackUrl:
          "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=" +
          orderGroupID,
        txnAmount: {
          value: Number(finalOrderPrice).toFixed(2).toString(),
          currency: "INR",
        },
        userInfo: {
          orderGroupID,
          user: `${userDetails._id.toString()}, ${user.name.toString()}`,
          phoneNumber: user.mobileNo.toString(),
          email: user.email.toString(),
          address: address.toString(),
          cartProductIds: cartIds.join(","),
          productIds: cartItemsForUser
            .map((item) => item.product._id)
            .join(","),
          description: productNames,
          paymentTxnId: paymentTxnId,
          MRP,
          saleDiscountedPrice,
          totalSaleDiscount,
          shippingPrice,
          shippingApplied,
          couponDiscount,
          finalOrderPrice,
        },
      };

      console.log(paytmParams.body);

      /*
       * Generate checksum by parameters we have in body
       * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
       */
      const checksum = await PaytmChecksum.generateSignature(
        JSON.stringify(paytmParams.body),
        PAYTM_MERCHANT_KEY,
      );

      paytmParams.head = {
        channelId: PAYTM_CHANNEL_ID,
        signature: checksum,
      };

      console.log("Did I got the checksum", checksum);

      const post_data = JSON.stringify(paytmParams);

      const response = await axios.post(
        `https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${orderGroupID}`,
        paytmParams,
        {
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        },
      );

      console.log("Payment gateway Response: ", response.data);

      const orders = await createOrderWithTransaction({
        cartItemsForUser,

        userId: userDetails._id,
        addressDocument,

        orderGroupID,
        paymentTxnId,

        pricingDetails: {
          MRP,
          saleDiscountedPrice,
          totalSaleDiscount,
          shippingPrice,
          shippingApplied,
          couponDiscount,
          finalOrderPrice,
        },

        appliedCouponID,
        orderType: "buy",
        gateway: "Razorpay",
      });

      return res.status(200).json({
        txnToken: response.data.body.txnToken,
        order_id: orderGroupID,
        gatewayOrderId: response.data.body.orderId,
        amount: finalOrderPrice,
        name: userDetails.name,
        email: userDetails.email,
        mobileNo: userDetails.mobileNo,
        productinfo: productNames,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: error.message });
    }
  },
);

module.exports = router;

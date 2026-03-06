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
const createOrderWithTransaction = require("../../../helpter/order/createOrder");
const calculateCart = require("../../../helpter/cart/calculateCart");

// ✅ Cashfree Init
const cashfree = new Cashfree(
  process.env.CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox",
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY,
);

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

      // const user = await User.findById(userDetails._id);

      // const paymentTxnId = uuidv4();
      // const orderGroupID = uuidv4();
      const paymentTxnId = generateUniqueId("pt");
      const orderGroupID = generateUniqueId("od");

      console.log("What is the payment final amount", +finalOrderPrice);

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

      const response = await cashfree.PGCreateOrder(orderRequest, "2025/01/01");

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
        payment_session_id: response.data.payment_session_id,
        order_id: orderGroupID,
        gatewayOrderId: response.data.order_id,
        amount: response.data.order_amount || finalOrderPrice,
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

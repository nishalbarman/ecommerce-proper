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
const createOrderWithTransaction = require("../../../helpter/order/createOrder");
const calculateCart = require("../../../helpter/cart/calculateCart");

// ✅ Initialize Cashfree
const cashfree = new Cashfree(
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX,
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

      console.log("What is the address document", addressDocument);

      const user = await User.findById(userDetails._id);

      // const paymentTxnId = uuidv4();
      // const orderGroupID = uuidv4();
      const paymentTxnId = generateUniqueId("pt");
      const orderGroupID = generateUniqueId("od");

      console.log("What is the payment final amount", +finalOrderPrice);

      // ✅ CASHFREE ORDER CREATE
      const orderRequest = {
        order_id: paymentTxnId,
        order_amount: finalOrderPrice,
        order_currency: "INR",

        customer_details: {
          customer_id: userDetails._id.toString(),
          customer_email: userDetails.email,
          customer_phone: userDetails.mobileNo,
          customer_name: userDetails.name,
        },

        order_meta: {
          return_url: `https://cartshopping.in/profile/myorders?order_id=`,
        },

        order_note: productNames,
      };

      let response = null;
      try {
        response = await cashfree.PGCreateOrder(orderRequest, "2025/01/01", {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        });
      } catch (error) {
        console.log("Error in creating order with transaction: ", error);
        return res.status(500).json({ status: false, message: error.message });
      }

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
        gateway: "Cashfree",
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

module.exports = router;

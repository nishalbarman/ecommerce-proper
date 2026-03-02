const express = require("express");
const router = express.Router();
const RazorPay = require("razorpay");
const { v4: uuidv4 } = require("uuid");

const checkRole = require("../../../middlewares");

const User = require("../../../models/user.model");
const Cart = require("../../../models/cart.model");
const { Product, ProductVariant } = require("../../../models/product.model");
const Coupon = require("../../../models/coupon.model");
const Order = require("../../../models/order.model");
const UserAddress = require("../../../models/userAddress.model");
const PaymentTransModel = require("../../../models/transaction.model");
const generateUniqueId = require("../../../helpter/generateUniqueId");
const OrderGroupModel = require("../../../models/orderGroup.model");
const WebConfig = require("../../../models/webConfig.model");
const calculateCart = require("../../../helpter/cart/calculateCart");
const createOrderWithTransaction = require("../../../helpter/order/createOrder");

const RAZORPAY_KEY = process.env.RAZORPAY_KEY;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

const razorpayInstance = new RazorPay({
  key_id: RAZORPAY_KEY,
  key_secret: RAZORPAY_SECRET,
});

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
    console.log("Applied coupon id is: : ", appliedCouponID);

    let productData = null;

    if (productVariantId) {
      productData = await ProductVariant.findOne({
        _id: productVariantId,
      }).populate({ path: "product", select: "title slug _id" });
    } else {
      productData = await Product.findOne({
        _id: productId,
      });
    }

    if (!productData) {
      return res.status(400).json({ message: "Product information is empty" });
    }

    console.log("What is product data", productData);

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
      singleProduct: productData,
      productType: "buy",
      quantity: 1,
      rentDays: 1,
      couponId: appliedCouponID,
    });

    const addressDocument = await UserAddress.findById(address);

    const user = await User.findById(userDetails._id);

    // const paymentTxnId = uuidv4();
    // const orderGroupID = uuidv4();
    const paymentTxnId = generateUniqueId("pt");
    const orderGroupID = generateUniqueId("od");

    // create one razor pay order with the amount
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: parseInt(finalOrderPrice) * 100,
      currency: "INR",
      receipt: paymentTxnId,
      partial_payment: false,
      notes: {
        orderGroupID,
        user: userDetails._id.toString(),
        address: addressDocument._id?.toString(),
        cartProductIds: "NA",
        productIds: productData?.product?._id || productData?._id,
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
    });

    console.log("Payment gateway response: ", razorpayOrder);

    const cartItem = {
      quantity,
      rentDays: 1,
    };

    if (productVariantId) {
      cartItem.variant = productData;
      cartItem.product = productData.product;
    } else {
      cartItem.product = productData;
    }

    const cartItemsForUser = [cartItem];

    const orders = await createOrderWithTransaction({
      cartItemsForUser: cartItemsForUser,

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
      razorpayOrderId: razorpayOrder.id,
      order_id: orderGroupID,
      gatewayOrderId: razorpayOrder?.receipt,
      amount: razorpayOrder.amount,
      name: userDetails.name,
      email: userDetails.email,
      mobileNo: userDetails.mobileNo,
      productinfo: productNames,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;

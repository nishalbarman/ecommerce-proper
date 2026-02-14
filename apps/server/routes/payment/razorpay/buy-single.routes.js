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
      }).populate({ path: "product", select: "title" });
    } else {
      productData = await Product.findOne({
        _id: productId,
      });
    }

    if (!productData) {
      return res.status(400).json({ message: "Product information is empty" });
    }

    console.log("What is product data", productData)

    let shippingPrice = 0;

    // TODO: Still NEED to handle out of stock products

    let totalPrice; // price for one cart item
    const Title = productData?.product?.title || productData?.title;

    // if type is buy and product have variants (diffent color different size etc etc)
    if (productType === "buy" && !!productVariantId) {
      const Price = productData.discountedPrice;
      const Quantity = +quantity;
      totalPrice = Price * Quantity;
    }
    // else if type is buy and product does not have variants (diffent color different size etc etc)
    else if (productType === "buy" && !productVariantId) {
      const Price = productData.discountedPrice;
      const Quantity = +quantity;
      totalPrice = Price * Quantity;
    }
    // else if type is rent and product does not have variants (diffent color different size etc etc)
    else if (productType === "rent" && !!productVariantId) {
      const Price = productData.rentingPrice;
      const Quantity = +quantity;
      const RentDays = req.body?.rentDays;
      totalPrice = Price * Quantity * RentDays;
    }
    // else if type is rent and product does not have variants (diffent color different size etc etc)
    else if (productType === "rent" && !productVariantId) {
      const Price = cartItem.product.rentingPrice;
      const Quantity = +quantity;
      const RentDays = req.body?.rentDays;
      totalPrice = Price * Quantity * RentDays;
    }

    const totalDiscountedPriceWithoutAnyCouponAndShipping = totalPrice;
    let couponDiscountedPrice = 0;

    let deliveryChargeDetails = await WebConfig.findOne()
      .sort({ createdAt: -1 })
      .select("deliveryPrice freeDeliveryAbove");
    if (!deliveryChargeDetails) {
      deliveryChargeDetails = { deliveryPrice: 100, freeDeliveryAbove: 0 };
    }

    console.log(deliveryChargeDetails);

    const freeDeliveryAboveMinimumPurchase =
      deliveryChargeDetails?.freeDeliveryAbove > 0;
    const freeDeliveryMinimumAmount = deliveryChargeDetails?.freeDeliveryAbove;
    let shippingApplied = !freeDeliveryAboveMinimumPurchase;

    // console.log("What is the shipping price: ", shippingPrice);

    if (
      !(
        freeDeliveryAboveMinimumPurchase &&
        totalPrice >= freeDeliveryMinimumAmount
      )
    ) {
      totalPrice += deliveryChargeDetails.deliveryPrice;
      shippingApplied = true;
    }

    if (!!appliedCouponID) {
      const appliedCoupon = await Coupon.findOne({ _id: appliedCouponID });

      console.log(
        "What are the prices after coupon: ",
        appliedCoupon,
        totalPrice,
        appliedCoupon.minPurchasePrice,
        totalPrice > appliedCoupon.minPurchasePrice,
      );
      if (!!appliedCoupon) {
        const discountedPrice = appliedCoupon?.isPercentage
          ? (totalPrice / 100) * parseInt(appliedCoupon.off) || 0
          : totalPrice > appliedCoupon.minPurchasePrice
            ? appliedCoupon.off
            : 0;

        couponDiscountedPrice = discountedPrice;
        totalPrice -= discountedPrice;

        console.log("What are the prices after coupon: ", discountedPrice);
      }
    }

    totalPrice *= 100; // gateway takes amount as paisa (1 rupee = 100 paisa)

    const productNames = productData.title;

    const addressDocument = await UserAddress.findById(address);

    const user = await User.findById(userDetails._id);

    // const paymentTxnId = uuidv4();
    // const orderGroupID = uuidv4();
    const paymentTxnId = generateUniqueId("PT");
    const orderGroupID = generateUniqueId("OD");

    console.log("What is the payment final amount", +totalPrice);

    // create one razor pay order with the amount
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: parseInt(totalPrice),
      currency: "INR",
      receipt: paymentTxnId,
      partial_payment: false,
      notes: {
        orderGroupID,
        user: userDetails._id.toString(),
        address: address.toString(),
        cartProductIds: "NA",
        productIds: productData?.product?._id || productData?._id,
        description: productNames,
        paymentTxnId: paymentTxnId,
        totalDiscountedPriceWithoutAnyCouponAndShipping:
          totalDiscountedPriceWithoutAnyCouponAndShipping,
        shippingPrice: shippingApplied ? shippingPrice : 0,
        couponDiscountedPrice: couponDiscountedPrice,
      },
    });

    console.log(razorpayOrder);

    let createdOrder;

    if (productType === "buy") {
      let product = null;
      if (productData?.product) {
        product = { ...productData?.product };
      } else {
        product = { ...productData };
      }
      createdOrder = {
        ...product,

        product: productData?.product?._id || productData?._id,
        user: userDetails._id,

        // order related
        orderGroupID: orderGroupID,
        // paymentTxnId: paymentIntent.id,
        paymentTxnId: paymentTxnId,

        // product details
        title: productNames,

        quantity: +quantity,
        orderType: "buy",

        // address: {
        //   address: {
        //     // prefix: addressDocument?.prefix,
        //     streetName: addressDocument.streetName,
        //     locality: addressDocument.locality,
        //     city: addressDocument.locality,
        //     state: addressDocument.locality,
        //     postalCode: addressDocument.postalCode,
        //     country: addressDocument.country,
        //   },
        //   // location: [addressDocument.longitude, addressDocument.latitude],
        // },
        address: {
          physicalAddress: addressDocument,
        },
        // center: centerAddresses[0]._id,
        center: null,

        orderStatus: "Pending",
        paymentMode: "Prepaid",
        shipmentType: "delivery_partner",
      };

      if (!!productData.product) {
        createdOrder.previewImage = productData.previewImage;
        createdOrder.price = productData.discountedPrice * +quantity;
        createdOrder.shippingPrice = +productData.shippingPrice;

        createdOrder.color = productData.color;
        createdOrder.size = productData.size;
      } else {
        createdOrder.previewImage = productData.previewImage;
        createdOrder.price = productData.discountedPrice * +quantity;
        createdOrder.shippingPrice = +productData.shippingPrice;

        createdOrder.color = null;
        createdOrder.size = null;
      }
    }

    console.log("Order Details", createdOrder)

    const order = await Order.insertOne(createdOrder);

    await PaymentTransModel.create({
      orderGroupID,
      // paymentTransactionID: paymentIntent.id,
      paymentTransactionID: paymentTxnId,
      user: userDetails._id,
      order: order._id,

      paymentStatus: "Pending",

      shippingPrice: !!shippingApplied ? shippingPrice : 0,
      subTotalPrice: totalPrice / 100 - (!!shippingApplied ? shippingPrice : 0),
      totalPrice: totalPrice / 100,
    });

    // await OrderGroupModel.create({
    //   orderGroupID,
    //   // paymentTransactionID: paymentIntent.id,
    //   paymentTransactionID: paymentTxnId,
    //   user: userDetails._id,
    //   order: orders.map((item) => item._id),

    //   paymentStatus: "Pending",

    //   originalPrice: paymentObject.amount / 100,
    //   couponDiscountedPrice: { type: Number, default: 0 },
    //   appliedCoupon: appliedCouponID,
    //   discountedPrice:
    //     paymentObject.amount / 100 - (!!shippingApplied ? shippingPrice : 0),
    //   shippingPrice: !!shippingApplied ? shippingPrice : 0,

    //   address: {
    //     physicalAddress: addressDocument,
    //     location: null,
    //   },

    //   orderType: { type: String, required: true, enums: ["buy", "rent"] },

    //   // status related
    //   orderStatus: {
    //     type: String,
    //     default: "On Hold",
    //     enums: [
    //       "On Hold",
    //       "Pending",
    //       "On Progress",
    //       "Accepted",
    //       "Rejected",
    //       "Cancelled",
    //       "On The Way",
    //       "PickUp Ready",
    //       "Delivered",
    //     ],
    //   },

    //   paymentMode: {
    //     type: String,
    //     enums: ["Prepaid", "Cash On Delivery", "Cash On Pickup"],
    //   },

    //   paymentStatus: {
    //     type: String,
    //     default: "Pending",
    //     enums: ["Success", "Failed", "Pending"],
    //   },

    //   shipmentType: {
    //     type: String,
    //     required: false,
    //     enums: ["self_pickup", "delivery_partner"],
    //     default: "self_pickup",
    //   },

    //   store: { type: mongoose.Types.ObjectId, required: false, default: null },

    //   // tracking link for the order track
    //   trackingLink: { type: String, default: "" },
    // });

    return res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
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

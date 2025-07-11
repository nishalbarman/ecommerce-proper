const express = require("express");
const router = express.Router();
const RazorPay = require("razorpay");
const { v4: uuidv4 } = require("uuid");

const checkRole = require("../../../middlewares");

const User = require("../../../models/user.model");
const Cart = require("../../../models/cart.model");
const Coupon = require("../../../models/coupon.model");
const Order = require("../../../models/order.model");
const UserAddress = require("../../../models/userAddress.model");
const PaymentTransModel = require("../../../models/transaction.model");
const generateUniqueId = require("../../../helpter/generateUniqueId");
const OrderGroupModel = require("../../../models/orderGroup.model");

const RAZORPAY_KEY = process.env.RAZORPAY_KEY;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

const razorpayInstance = new RazorPay({
  key_id: RAZORPAY_KEY,
  key_secret: RAZORPAY_SECRET,
});

router.post("/:productType", checkRole(0, 1), async (req, res) => {
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

    let shippingPrice = 0;

    // TODO: Still NEED to handle out of stock products

    const cartIds = [];

    const paymentObject = cartItemsForUser.reduce(
      (pay, cartItem) => {
        cartIds.push(cartItem._id);

        let totalPrice; // price for one cart item
        const Title = cartItem.product.title;

        // if type is buy and product have variants (diffent color different size etc etc)
        if (productType === "buy" && !!cartItem.variant) {
          const Price = cartItem.variant.discountedPrice;
          const Quantity = cartItem.quantity;
          totalPrice = Price * Quantity;

          shippingPrice += cartItem.variant.shippingPrice;
        }
        // else if type is buy and product does not have variants (diffent color different size etc etc)
        else if (productType === "buy" && !cartItem.variant) {
          const Price = cartItem.product.discountedPrice;
          const Quantity = cartItem.quantity;
          totalPrice = Price * Quantity;

          shippingPrice += cartItem.product.shippingPrice;
        }
        // else if type is rent and product does not have variants (diffent color different size etc etc)
        else if (productType === "rent" && !!cartItem.variant) {
          const Price = cartItem.variant.rentingPrice;
          const Quantity = cartItem.quantity;
          const RentDays = cartItem.rentDays;
          totalPrice = Price * Quantity * RentDays;

          shippingPrice += cartItem.variant.shippingPrice;
        }
        // else if type is rent and product does not have variants (diffent color different size etc etc)
        else if (productType === "rent" && !cartItem.variant) {
          const Price = cartItem.product.rentingPrice;
          const Quantity = cartItem.quantity;
          const RentDays = cartItem.rentDays;
          totalPrice = Price * Quantity * RentDays;

          shippingPrice += cartItem.variant.shippingPrice;
        }

        return {
          amount: pay.amount + totalPrice,
          productinfo: [...pay.productinfo, Title],
        };
      },
      { amount: 0, productinfo: [] }
    );

    if (!!appliedCouponID) {
      const appliedCoupon = await Coupon.findOne({ _id: appliedCouponID });

      if (!!appliedCoupon) {
        const discountedPrice = appliedCoupon?.isPercentage
          ? (paymentObject.amount / 100) * parseInt(appliedCoupon.off) || 0
          : paymentObject.amount > appliedCoupon.minPurchasePrice
            ? appliedCoupon.off
            : 0;

        paymentObject.amount -= discountedPrice;
      }
    }

    const freeDeliveryAboveMinimumPurchase = false; // TODO: Need to get it from server.
    const freeDeliveryMinimumAmount = 500;
    let shippingApplied = false;

    if (
      !(
        freeDeliveryAboveMinimumPurchase &&
        paymentObject.amount >= freeDeliveryMinimumAmount
      )
    ) {
      paymentObject.amount += shippingPrice;
      shippingApplied = true;
    }

    paymentObject.amount *= 100; // gateway takes amount as paisa (1 rupee = 100 paisa)

    const productNames = paymentObject.productinfo.join(", ");

    const addressDocument = await UserAddress.findById(address);

    const user = await User.findById(userDetails._id);

    // const paymentTxnId = uuidv4();
    // const orderGroupID = uuidv4();
    const paymentTxnId = generateUniqueId("PT");
    const orderGroupID = generateUniqueId("OD");

    console.log("What is the payment final amount", +paymentObject.amount);

    // create one razor pay order with the amount
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: parseInt(paymentObject.amount),
      currency: "INR",
      receipt: paymentTxnId,
      partial_payment: false,
      notes: {
        orderGroupID,
        user: userDetails._id.toString(),
        address: address.toString(),
        cartProductIds: cartIds.join(","),
        productIds: cartItemsForUser.map((item) => item.product._id).join(","),
        description: productNames,
        paymentTxnId: paymentTxnId,
      },
    });

    console.log(razorpayOrder);

    let orderItemsWithOrderIDandPaymentId;

    if (productType === "buy") {
      orderItemsWithOrderIDandPaymentId = cartItemsForUser.map((item) => {
        const createdOrder = {
          ...item,

          product: item.product._id,
          user: userDetails._id,

          // order related
          orderGroupID: orderGroupID,
          // paymentTxnId: paymentIntent.id,
          paymentTxnId: paymentTxnId,

          // product details
          title: item.product.title,

          quantity: item.quantity,
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

        if (!!item.variant) {
          createdOrder.previewImage = item.variant.previewImage;
          createdOrder.price = item.variant.discountedPrice * item.quantity;
          createdOrder.shippingPrice = +item.variant.shippingPrice;

          createdOrder.color = item.variant.color;
          createdOrder.size = item.variant.size;
        } else {
          createdOrder.previewImage = item.product.previewImage;
          createdOrder.price = item.product.discountedPrice * item.quantity;
          createdOrder.shippingPrice = +item.product.shippingPrice;

          createdOrder.color = null;
          createdOrder.size = null;
        }

        return createdOrder;
      });
    }

    const orders = await Order.insertMany(orderItemsWithOrderIDandPaymentId);

    await PaymentTransModel.create({
      orderGroupID,
      // paymentTransactionID: paymentIntent.id,
      paymentTransactionID: paymentTxnId,
      user: userDetails._id,
      order: orders.map((item) => item._id),

      paymentStatus: "Pending",

      shippingPrice: !!shippingApplied ? shippingPrice : 0,
      subTotalPrice:
        paymentObject.amount / 100 - (!!shippingApplied ? shippingPrice : 0),
      totalPrice: paymentObject.amount / 100,
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

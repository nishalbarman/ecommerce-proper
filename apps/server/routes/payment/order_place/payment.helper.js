const RazorPay = require("razorpay");
const Stripe = require("stripe");
const Paytm = require("paytmchecksum");
const Coupon = require("../../../models/coupon.model");

// Initialize payment gateway instances
const razorpayInstance = new RazorPay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to calculate cart totals
const calculateCartTotals = (cartItems, productType) => {
  return cartItems.reduce(
    (totals, cartItem) => {
      const { product, variant, quantity, rentDays } = cartItem;
      let itemPrice = 0;
      let shippingPrice = 0;

      if (productType === "buy") {
        itemPrice = variant ? variant.discountedPrice : product.discountedPrice;
        shippingPrice = variant ? variant.shippingPrice : product.shippingPrice;
      } else if (productType === "rent") {
        itemPrice = variant ? variant.rentingPrice : product.rentingPrice;
        shippingPrice = variant ? variant.shippingPrice : product.shippingPrice;
        itemPrice *= rentDays;
      }

      return {
        amount: totals.amount + itemPrice * quantity,
        shippingPrice: totals.shippingPrice + shippingPrice,
        productInfo: [...totals.productInfo, product.title],
      };
    },
    { amount: 0, shippingPrice: 0, productInfo: [] }
  );
};

// Helper function to apply coupon discount
const applyCouponDiscount = async (amount, couponId) => {
  if (!couponId) return amount;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) return amount;

  const discount = coupon.isPercentage
    ? (amount / 100) * parseInt(coupon.off)
    : amount > coupon.minPurchasePrice
      ? coupon.off
      : 0;

  return amount - discount;
};

// Payment gateway specific functions
const paymentGateways = {
  razorpay: {
    createOrder: async (amount, orderDetails) => {
      return await razorpayInstance.orders.create({
        amount: parseInt(amount * 100), // Convert to paise
        currency: "INR",
        receipt: orderDetails.paymentTxnId,
        notes: orderDetails,
      });
    },
  },
  stripe: {
    createOrder: async (amount, orderDetails) => {
      return await stripeInstance.paymentIntents.create({
        amount: parseInt(amount * 100),
        currency: "inr",
        metadata: orderDetails,
      });
    },
  },
  paytm: {
    createOrder: async (amount, orderDetails) => {
      // Implement Paytm order creation
    },
  },
};

module.exports = {
  calculateCartTotals,
  applyCouponDiscount,
  paymentGateways,
};

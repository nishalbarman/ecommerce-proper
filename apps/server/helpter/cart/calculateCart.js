const Coupon = require("../../models/coupon.model");
const WebConfig = require("../../models/webConfig.model");

const calculateCart = async ({
  cartItems = [],
  singleProduct = null,
  productType = "buy",
  quantity = 1,
  rentDays = 1,
  couponId = null,
}) => {
  let cartIds = [];

  let MRP = 0;
  let afterDiscountPrice = 0;
  let totalSaleDiscountPrice = 0;

  let totalAmount = 0;
  let productNames = [];

  // =========================
  // ✅ HANDLE CART ITEMS
  // =========================
  if (cartItems.length > 0) {
    cartItems.forEach((item) => {
      cartIds.push(item._id);

      let totalPrice = 0;
      const title = item.product.title;
      productNames.push(title);

      // BUY WITH VARIANT
      if (productType === "buy" && item.variant) {
        const price = item.variant.discountedPrice;
        const qty = item.quantity;

        totalPrice = price * qty;

        MRP += item.variant.originalPrice * qty;
        afterDiscountPrice += price * qty;
      }

      // BUY WITHOUT VARIANT
      else if (productType === "buy" && !item.variant) {
        const price = item.product.discountedPrice;
        const qty = item.quantity;

        totalPrice = price * qty;

        MRP += item.product.originalPrice * qty;
        afterDiscountPrice += price * qty;
      }

      // RENT WITH VARIANT
      else if (productType === "rent" && item.variant) {
        const price = item.variant.rentingPrice;
        const qty = item.quantity;

        totalPrice = price * qty * item.rentDays;

        MRP += totalPrice;
        afterDiscountPrice += totalPrice;
      }

      // RENT WITHOUT VARIANT
      else if (productType === "rent" && !item.variant) {
        const price = item.product.rentingPrice;
        const qty = item.quantity;

        totalPrice = price * qty * item.rentDays;

        MRP += totalPrice;
        afterDiscountPrice += totalPrice;
      }

      totalAmount += totalPrice;
    });
  }

  // =========================
  // ✅ HANDLE SINGLE PRODUCT (Cashfree case)
  // =========================
  if (singleProduct) {
    const title = singleProduct?.product?.title || singleProduct.title;
    productNames.push(title);

    if (productType === "buy") {
      totalAmount = singleProduct.discountedPrice * quantity;

      MRP = singleProduct.originalPrice * quantity;
      afterDiscountPrice = totalAmount;
    } else {
      totalAmount = singleProduct.rentingPrice * quantity * rentDays;

      MRP = totalAmount;
      afterDiscountPrice = totalAmount;
    }
  }

  totalSaleDiscountPrice = MRP - afterDiscountPrice;

  // =========================
  // ✅ SHIPPING
  // =========================
  let shippingPrice = 0;
  let shippingApplied = false;

  let deliveryChargeDetails = await WebConfig.findOne()
    .sort({ createdAt: -1 })
    .select("deliveryPrice freeDeliveryAbove");

  if (!deliveryChargeDetails) {
    deliveryChargeDetails = { deliveryPrice: 100, freeDeliveryAbove: 0 };
  }

  if (
    !(
      deliveryChargeDetails.freeDeliveryAbove > 0 &&
      totalAmount >= deliveryChargeDetails.freeDeliveryAbove
    )
  ) {
    shippingPrice = deliveryChargeDetails.deliveryPrice;
    totalAmount += shippingPrice;
    shippingApplied = true;
  }

  // =========================
  // ✅ COUPON
  // =========================
  let couponDiscount = 0;

  if (couponId) {
    const coupon = await Coupon.findById(couponId);

    if (coupon) {
      const discount = coupon.isPercentage
        ? (totalAmount / 100) * coupon.off
        : totalAmount > coupon.minPurchasePrice
          ? coupon.off
          : 0;

      couponDiscount = discount;
      totalAmount -= discount;
    }
  }

  // =========================
  // ✅ FINAL RETURN
  // =========================
  return {
    cartIds,
    productNames: productNames.join(", "),

    MRP,
    saleDiscountedPrice: afterDiscountPrice,
    totalSaleDiscount: totalSaleDiscountPrice,

    shippingPrice,
    shippingApplied,

    couponDiscount,

    finalOrderPrice: totalAmount,
  };
};

module.exports = calculateCart;

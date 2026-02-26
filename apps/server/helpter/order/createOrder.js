const mongoose = require("mongoose");

const Order = require("../../models/order.model");
const PaymentTransModel = require("../../models/transaction.model");
const OrderGroupModel = require("../../models/orderGroup.model");

const createOrderWithTransaction = async ({
  cartItemsForUser,

  userId,
  addressDocument,

  orderGroupID,
  paymentTxnId,

  pricingDetails, // 👈 pass calculated data object
  appliedCouponID,

  orderType = "buy",
  gateway,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // =========================
    // ✅ CREATE ORDERS
    // =========================

    let orderItemsWithOrderIDandPaymentId;
    const orderPreviewImages = [];

    if (orderType === "buy") {
      orderItemsWithOrderIDandPaymentId = cartItemsForUser.map((item) => {
        const createdOrder = {
          ...item,

          product: item.product._id,
          user: userId,

          originalPrice:
            item.variant?.originalPrice * item.quantity ||
            item.product?.originalPrice * item.quantity,
          discountedPrice:
            item.variant?.discountedPrice * item.quantity ||
            item.product?.discountedPrice * item.quantity,

          orderGroupID: orderGroupID,
          paymentTxnId: paymentTxnId,

          title: item.product.title,

          quantity: item.quantity,
          orderType: "buy",

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
          orderPreviewImages.push(item.variant.previewImage);
        } else {
          createdOrder.previewImage = item.product.previewImage;
          createdOrder.price = item.product.discountedPrice * item.quantity;
          createdOrder.shippingPrice = +item.product.shippingPrice;

          createdOrder.color = null;
          createdOrder.size = null;
          orderPreviewImages.push(item.product.previewImage);
        }

        return createdOrder;
      });
    }

    // =========================
    // ✅ INSERT ORDERS
    // =========================
    const orders = await Order.insertMany(orderItemsWithOrderIDandPaymentId, {
      session,
    });

    const orderIds = orders.map((item) => item._id);

    // =========================
    // ✅ PAYMENT + GROUP (PARALLEL)
    // =========================
    await Promise.all([
      PaymentTransModel.create(
        [
          {
            orderGroupID,
            paymentTransactionID: paymentTxnId,
            user: userId,
            orders: orderIds,

            paymentStatus: "Pending",
            gateway: gateway,

            pricingDetails: {
              originalPrice: pricingDetails.MRP,
              discountedPrice: pricingDetails.saleDiscountedPrice,
              saleDiscount: pricingDetails.totalSaleDiscount,
              couponDiscountGiven: pricingDetails.couponDiscount,
              shippingPrice: pricingDetails.shippingPrice,
              finalOrderPrice: pricingDetails.finalOrderPrice,
            },

            shippingApplied: pricingDetails.shippingApplied,
          },
        ],
        { session },
      ),

      OrderGroupModel.create(
        [
          {
            orderGroupID,
            paymentTransactionID: paymentTxnId,
            user: userId,
            orders: orderIds,

            paymentStatus: "Pending",

            previewImages: orderPreviewImages,

            pricingDetails: {
              groupOriginalPrice: pricingDetails.MRP,
              groupDiscountedPrice: pricingDetails.saleDiscountedPrice,
              groupSaleDiscount: pricingDetails.totalSaleDiscount,
              couponDiscountGiven: pricingDetails.couponDiscount,
              shippingPrice: pricingDetails.shippingPrice,
              groupFinalOrderPrice: pricingDetails.finalOrderPrice,
            },

            appliedCoupon: appliedCouponID,

            shippingApplied: pricingDetails.shippingApplied,

            address: {
              physicalAddress: addressDocument,
              location: null,
            },

            orderType,

            orderStatus: "Pending",
            paymentMode: "Prepaid",
            shipmentType: "delivery_partner",

            store: null,
            trackingLink: "",
          },
        ],
        { session },
      ),
    ]);

    // =========================
    // ✅ COMMIT
    // =========================
    await session.commitTransaction();
    session.endSession();

    return orders;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = createOrderWithTransaction;

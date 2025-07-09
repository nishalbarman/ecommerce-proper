const {
  calculateCartTotals,
  applyCouponDiscount,
  paymentGateways,
} = require("./payment.helper");
const { generateUniqueId } = require("../../../helpter/generateUniqueId");
const Order = require("../../../models/order.model");
const Cart = require("../../../models/cart.model");

class PaymentService {
  static async processPayment({
    user,
    cartItems,
    productType,
    address,
    couponId,
    paymentGateway,
  }) {
    try {
      // Calculate cart totals
      const totals = calculateCartTotals(cartItems, productType);

      // Apply coupon if exists
      const amountAfterCoupon = await applyCouponDiscount(
        totals.amount,
        couponId
      );

      // Add shipping if applicable
      const finalAmount = this.applyShipping(
        amountAfterCoupon,
        totals.shippingPrice
      );

      // Generate unique IDs
      const paymentTxnId = generateUniqueId("pt");
      const orderGroupID = generateUniqueId("od");

      // Create orders for each cart item
      const orders = await Promise.all(
        cartItems.map(async (item) => {
          const orderData = {
            orderGroupID,
            paymentTxnId,
            user: user._id,
            product: item.product._id,
            title: item.product.title,
            quantity: item.quantity,
            orderType: productType,
            address: address,
            paymentMode:
              paymentGateway === "cod" ? "Cash On Delivery" : "Prepaid",
            paymentStatus: "Pending",
            shipmentType: "delivery_partner",
          };

          // Handle variant details if available
          if (item.variant) {
            orderData.previewImage = item.variant.previewImage;
            orderData.price = item.variant.discountedPrice * item.quantity;
            orderData.shippingPrice = +item.variant.shippingPrice;
            orderData.color = item.variant.color;
            orderData.size = item.variant.size;
          } else {
            orderData.previewImage = item.product.previewImage;
            orderData.price = item.product.discountedPrice * item.quantity;
            orderData.shippingPrice = +item.product.shippingPrice;
            orderData.color = null;
            orderData.size = null;
          }

          // Handle rental specific fields
          if (productType === "rent") {
            orderData.rentDays = item.rentDays;
            orderData.pickupDate = item.pickupDate;
          }

          const order = new Order(orderData);
          return order.save();
        })
      );

      // Prepare order details for payment gateway
      const orderDetails = {
        orderGroupID,
        user: user._id.toString(),
        address: address.toString(),
        cartProductIds: cartItems.map((item) => item._id).join(","),
        productIds: cartItems.map((item) => item.product._id).join(","),
        description: totals.productInfo.join(", "),
        paymentTxnId,
      };

      // Create payment order based on gateway
      const paymentOrder = await paymentGateways[paymentGateway].createOrder(
        finalAmount,
        orderDetails
      );

      return {
        paymentOrder,
        orderDetails,
        finalAmount,
        orders,
      };
    } catch (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  static applyShipping(amount, shippingPrice) {
    const freeDeliveryMinimumAmount = 500;
    return amount >= freeDeliveryMinimumAmount
      ? amount
      : amount + shippingPrice;
  }

  static async verifyPayment(paymentGateway, paymentData) {
    try {
      const verificationResult =
        await paymentGateways[paymentGateway].verifyPayment(paymentData);

      // Update order payment status if payment is successful
      if (verificationResult.success) {
        await Order.updateMany(
          { paymentTxnId: paymentData.paymentTxnId },
          {
            paymentStatus: "Success",
            orderStatus: "Pending",
          }
        );
      } else {
        await Order.updateMany(
          { paymentTxnId: paymentData.paymentTxnId },
          {
            paymentStatus: "Failed",
            orderStatus: "Cancelled",
          }
        );
      }

      return verificationResult;
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }
}

module.exports = PaymentService;

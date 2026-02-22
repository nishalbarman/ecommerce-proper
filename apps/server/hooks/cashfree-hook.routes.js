const express = require("express");
const crypto = require("crypto");

const OrderModel = require("../models/order.model");
const User = require("../models/user.model");
const { sendMail } = require("../helpter/sendEmail");
const Cart = require("../models/cart.model");
const { default: mongoose } = require("mongoose");
const PaymentTransModel = require("../models/transaction.model");
const { Product } = require("../models/product.model");
const OrderGroup = require("../models/orderGroup.model");

const router = express.Router();

const CASHFREE_WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;

// ✅ Verify Signature
const verifySignature = (rawBody, signature) => {
  const expectedSignature = crypto
    .createHmac("sha256", CASHFREE_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("base64");

  return expectedSignature === signature;
};

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  console.log("GOT CASHFREE WEBHOOK -->");

  try {
    const signature = req.headers["x-webhook-signature"];

    const rawBody = req.body.toString();

    if (!verifySignature(rawBody, signature)) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const data = JSON.parse(rawBody);

    console.log("Cashfree Webhook Data -->", data);

    const order_id = data.order.order_id; // your paymentTxnId
    const payment_status = data.payment.payment_status;

    switch (payment_status) {
      case "SUCCESS":
        // ✅ Update Orders
        const pipeline = [
          { $match: { paymentTxnId: order_id } },
          {
            $set: {
              paymentStatus: "Success",
              orderStatus: "On Progress",
            },
          },
          {
            $group: {
              _id: null,
              productIds: { $addToSet: "$product" },
              orders: { $push: "$$ROOT" },
            },
          },
          {
            $lookup: {
              from: "products",
              let: { productIds: "$productIds" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$productIds"] } } },
              ],
              as: "updatedProducts",
            },
          },
        ];

        const result = await OrderModel.aggregate(pipeline);

        // Update Payment
        await PaymentTransModel.updateOne(
          { paymentTransactionID: order_id },
          { $set: { paymentStatus: "Paid" } }
        );

        await OrderGroup.updateOne(
          { paymentTransactionID: order_id },
          { $set: { paymentStatus: "Paid", orderStatus: "On Progress" } }
        );

        if (result.length > 0) {
          const { orders, updatedProducts } = result[0];

          const orderBulkOps = orders.map((order) => ({
            updateOne: {
              filter: { _id: order._id },
              update: {
                $set: {
                  paymentStatus: "Success",
                  orderStatus: "On Progress",
                },
              },
            },
          }));

          const productBulkOps = updatedProducts.map((product) => ({
            updateOne: {
              filter: { _id: product._id },
              update: {
                $inc: { buyTotalOrders: 1 },
              },
            },
          }));

          await OrderModel.bulkWrite(orderBulkOps);
          await Product.bulkWrite(productBulkOps);
        }

        // ✅ Send Email
        await sendMail({
          from: `"${process.env.BRAND_NAME}" <${process.env.SENDER_EMAIL_ADDRESS}>`,
          to: process.env.OWNER_EMAIL,
          subject: "New Order Received",
          html: `<h2>New Order Received 🎉</h2>`,
        });

        return res.status(200).json({ message: "Payment Success Updated" });

      case "FAILED":
        await OrderModel.updateMany(
          { paymentTxnId: order_id },
          { $set: { paymentStatus: "Failed", orderStatus: "Rejected" } }
        );

        await PaymentTransModel.updateOne(
          { paymentTransactionID: order_id },
          { $set: { paymentStatus: "Failed" } }
        );

        return res.status(200).json({ message: "Payment Failed Updated" });

      default:
        return res
          .status(200)
          .json({ message: "Unhandled status: " + payment_status });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
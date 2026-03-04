const express = require("express");
const router = express.Router();

const { globalErrorHandler } = require("../../helpter/globalErrorHandler");
const checkRole = require("../../middlewares");

const PaymentTransModel = require("../../models/transaction.model");

router.get(
  "/:orderGroupId",
  checkRole("admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const orderGroupId = req.params?.orderGroupId;

      if (!orderGroupId) {
        return res.status(400).json({ message: "Order Group ID missing" });
      }

      const paymentTransaction = await PaymentTransModel.findOne({
        orderGroupID: orderGroupId,
      });
      // .select("paymentStatus ");

      console.log(paymentTransaction);

      return res.status(200).json({
        paymentTransaction: paymentTransaction,
      });
    } catch (error) {
      globalErrorHandler(res, error);
    }
  },
);

module.exports = router;

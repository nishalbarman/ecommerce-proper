const express = require("express");
const router = express.Router();
const PaymentService = require("./payment.service");
const checkRole = require("../../../middlewares");

// Route to initiate payment
router.post(
  "/:productType/:paymentGateway",
  checkRole(0, 1, 2),
  async (req, res) => {
    try {
      const { productType, paymentGateway } = req.params;
      const { address, coupon } = req.body;
      const userDetails = req.user;

      // Validate request
      if (!productType || !address || !paymentGateway) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Get cart items
      const cartItems = await Cart.find({
        user: userDetails._id,
        productType: productType,
      }).populate([
        { path: "product", select: "-productVariant" },
        { path: "variant", select: "-product" },
      ]);

      if (!cartItems.length) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Process payment
      const paymentResult = await PaymentService.processPayment({
        user: userDetails,
        cartItems,
        productType,
        address,
        couponId: coupon,
        paymentGateway,
      });

      res.json(paymentResult);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Route to verify payment
router.post("/verify/:paymentGateway", checkRole(0, 1, 2), async (req, res) => {
  try {
    const { paymentGateway } = req.params;
    const paymentData = req.body;

    const verificationResult = await PaymentService.verifyPayment(
      paymentGateway,
      paymentData
    );

    res.json(verificationResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// routes/payment-gateway.routes.js
const express = require("express");
const router = express.Router();
const PaymentGateway = require("../../models/paymentGateway.model");
const checkRole = require("../../middlewares");

const TAG = "payment-gateway.routes.js:--";

// ✅ GET ALL
router.get("/", async (req, res) => {
  try {
    const PAGE = parseInt(req.query.page) || 1;
    const LIMIT = parseInt(req.query.limit) || 10;
    const SKIP = (PAGE - 1) * LIMIT;

    const totalCounts = await PaymentGateway.countDocuments();

    const gateways =
      LIMIT === 0
        ? await PaymentGateway.find({ isActive: true }).sort({ priority: 1 })
        : await PaymentGateway.find({ isActive: true })
            .sort({ priority: 1 })
            .skip(SKIP)
            .limit(LIMIT);

    const totalPages = Math.ceil(totalCounts / LIMIT);

    return res.status(200).json({
      totalPages,
      data: gateways,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ✅ CREATE
router.post("/", checkRole(1, 2), async (req, res) => {
  try {
    const data = req.body;

    if (!data?.title || !data?.code) {
      return res.status(400).json({
        message: "Title and Code are required",
      });
    }

    const newGateway = await PaymentGateway.create({
      title: data.title,
      code: data.code.toLowerCase(),
      description: data.description,
      isActive: data.isActive,
      gatewayImageUrl: data.gatewayImageUrl,
      priority: data.priority,
    });

    return res.status(200).json({
      message: "Gateway created",
      data: newGateway,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ✅ UPDATE
router.patch("/:id", checkRole(1, 2), async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    await PaymentGateway.updateOne({ _id: id }, { $set: data });

    return res.status(200).json({
      message: "Gateway updated",
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ✅ DELETE
router.delete("/:id", checkRole(1, 2), async (req, res) => {
  try {
    const id = req.params.id;

    await PaymentGateway.deleteOne({ _id: id });

    return res.status(200).json({
      message: "Gateway deleted",
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ✅ VIEW SINGLE
router.get("/view/:id", async (req, res) => {
  try {
    const gateway = await PaymentGateway.findById(req.params.id);

    return res.status(200).json({ gateway });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

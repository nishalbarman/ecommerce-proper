const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Product } = require("../../models/product.model");
const getTokenDetails = require("../../helpter/getTokenDetails");
const Feedback = require("../../models/feedback.model");
const Order = require("../../models/order.model");

const checkRole = require("../../middlewares");

const TAG = "feedbacks.routes.js:--";

// get all feedbacks, helpfull to track by admin.. this route lists all available feedbacks for all products
router.get("/", checkRole(1), async (req, res) => {
  try {
    const searchParams = req.query;
    let dbSearchQuery = {};
    if (searchParams?.productId) {
      dbSearchQuery = { product: searchParams.productId };
    }

    const PAGE = searchParams.page || 1;
    const LIMIT = searchParams.limit || 20;
    const SKIP = (PAGE - 1) * LIMIT;

    const feedbacks = await Feedback.find(dbSearchQuery)
      .sort({ createdAt: "desc" })
      .skip(SKIP)
      .limit(LIMIT);

    console.log(feedbacks);

    return res.status(200).json({ data: feedbacks || [] });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/all", checkRole(1, 0), async (req, res) => {
  try {
    let dbSearchQuery = { user: req.user._id };

    const searchParams = req.query;

    const PAGE = searchParams.page || 1;
    const LIMIT = searchParams.limit || 20;
    const SKIP = (PAGE - 1) * LIMIT;

    const feedbacks = await Feedback.find(dbSearchQuery)
      .sort({ createdAt: "desc" })
      .populate("product")
      .skip(SKIP)
      .limit(LIMIT);

    return res.status(200).json({ data: feedbacks || [] });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// get the feedbacks for one individual product
router.get("/list/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const searchParams = req.query;

    if (!productId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const PAGE = searchParams.page || 1;
    const LIMIT = searchParams.limit || 20;
    const SKIP = (PAGE - 1) * LIMIT;

    const feedbackCount = await Feedback.countDocuments({
      product: productId,
    });
    const totalPages = Math.ceil(feedbackCount / LIMIT);

    const feedbacks = await Feedback.find({
      product: productId,
    })
      .sort({ createdAt: "desc" })
      .skip(SKIP)
      .limit(LIMIT);

    console.log("Feedbacks for one product ID -->", feedbacks);

    return res.status(200).json({ feedbacks, totalPages });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// FEEDBACK: get one feedback with feedback id
router.get("/:feedbackId", async (req, res) => {
  try {
    const params = req.params;
    console.log(TAG, params);

    // check whether we have the product id or not
    if (!params.feedbackId) {
      return res.status(400).json({ message: "Feedback ID missing!" });
    }

    const feedback = await Feedback.findOne({ _id: params.feedbackId });
    console.log(TAG, feedback);
    if (!feedback) {
      return res.status(404).json({ message: "No such feedback found." });
    }

    return res.status(200).json({ feedback });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// FEEDBACK CREATE ROUTE
router.post("/", checkRole(1), async (req, res) => {
  try {
    const reqBody = req.body;
    const productType = req.body?.productType;

    const error = [];

    if (!productType) {
      error.push("Product Type is missing");
    }

    if (!reqBody.product) {
      error.push("product id is missing");
    }

    if (!reqBody.description) {
      error.push("review description is missing");
    }

    if (
      !reqBody.givenStars ||
      !reqBody.givenStars > 5 ||
      !reqBody.givenStars <= 0
    ) {
      error.push("Review star is not properly set");
    }

    // ENABLE THESE LINES ONE PUSHED TO FINAL PRODUCTION
    // check if user really purchased the product
    // const userOrder = await Order.findOne({
    //   user: req.user._id,
    //   product: reqBody.product,
    //   orderType: productType,
    //   orderStatus: "Delivered",
    // });

    // if (!userOrder) {
    //   return res.status(400).json({
    //     message:
    //       "You did not purchased this order yet! So not possible to add review.",
    //   });
    // }

    // check if this user have already gave review or not
    const alreadyGivenFeedback = await Feedback.countDocuments({
      user: req.user._id,
      product: reqBody.product,
      productType: productType,
    });

    console.log("Is Feedback Already Given ->", alreadyGivenFeedback);

    if (alreadyGivenFeedback !== 0) {
      const feedbackUpdate = await Feedback.updateOne(
        {
          user: req.user._id,
          product: reqBody.product,
          productType: productType,
        },
        {
          $set: {
            ...reqBody,
            givenBy: req.user.name,
            user: req.user._id,
            productType: productType,
          },
        }
      );
      return res.status(200).json({
        message: `Feedback added`,
      });
    }

    // insert into database
    const feedback = new Feedback({
      ...reqBody,
      givenBy: req.user.name,
      user: req.user._id,
      productType: productType,
    });
    await feedback.save();

    const product = await Product.findById(reqBody.product);
    console.log(product);
    // Step 1: Calculate the current total score
    const totalRatings = product.stars * product.totalFeedbacks;

    // Step 2: Add the new rating
    const newTotalRatings = totalRatings + reqBody.starsGiven;

    // Step 3: Increment the total number of reviews
    const newTotalFeedbacks = product.totalFeedbacks + 1;

    // Step 4: Calculate the new average rating
    const newAverage = (newTotalRatings / newTotalFeedbacks).toFixed(2);

    product.stars = newAverage;
    product.totalFeedbacks = newTotalFeedbacks;

    await product.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: `Feedback added`,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// FETCH FEEDBACK FOR ONE PRODUCT GIVEN BY ONE USER
router.post("/view/:productId", checkRole(0), async (req, res) => {
  try {
    const productId = req.params?.productId;
    const productType = req.body?.productType;

    if (!productId || !productType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const feedback = await Feedback.findOne({
      product: productId,
      productType: productType,
      user: req.user._id,
    });

    return res.status(200).json({ feedback: feedback });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

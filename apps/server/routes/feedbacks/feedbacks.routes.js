const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const rateLimit = require("express-rate-limit");

const { Product } = require("../../models/product.model");
const getTokenDetails = require("../../helpter/getTokenDetails");
const Feedback = require("../../models/feedback.model");
const Order = require("../../models/order.model");

const checkRole = require("../../middlewares");
const FeedbackImage = require("../../models/feedbackImage.model");
const imgbbUploader = require("imgbb-uploader");

// Rate limiting for image uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 6, // limit each IP to 6 requests per windowMs
  message:
    "Too many image uploads from this IP, please try again after a minute",
});

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
      .populate("images")
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
// Create feedback
router.post("/", checkRole(0, 1), async (req, res) => {
  try {
    const { product, productType, description, starsGiven, imageIds } =
      req.body;

    const errors = [];

    if (!productType) errors.push("Product type is required");
    if (!product) errors.push("Product ID is required");
    if (!description) errors.push("Description is required");
    if (!starsGiven || starsGiven < 1 || starsGiven > 5) {
      errors.push("Rating must be between 1 and 5 stars");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors,
      });
    }

    // Check if user already reviewed this product
    const existingFeedback = await Feedback.findOne({
      user: req.user._id,
      product,
      productType,
    });

    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.description = description;
      existingFeedback.starsGiven = starsGiven;

      if (imageIds && imageIds.length > 0) {
        // Link images to this feedback
        await FeedbackImage.updateMany(
          { _id: { $in: imageIds }, uploadedBy: req.user._id },
          { feedback: existingFeedback._id }
        );
        existingFeedback.images = imageIds;
      }

      await existingFeedback.save();

      return res.status(200).json({
        success: true,
        message: "Feedback updated successfully",
      });
    }

    // Create new feedback
    const feedback = new Feedback({
      description,
      starsGiven,
      product,
      productType,
      givenBy: req.user.name,
      user: req.user._id,
      images: imageIds || [],
    });

    await feedback.save();

    // Link images to this feedback if any
    if (imageIds && imageIds.length > 0) {
      await FeedbackImage.updateMany(
        { _id: { $in: imageIds }, uploadedBy: req.user._id },
        { feedback: feedback._id }
      );
    }

    // Update product rating (your existing logic)
    const productDoc = await Product.findById(product);
    const totalRatings = productDoc.stars * productDoc.totalFeedbacks;
    const newTotalRatings = totalRatings + starsGiven;
    const newTotalFeedbacks = productDoc.totalFeedbacks + 1;
    const newAverage = (newTotalRatings / newTotalFeedbacks).toFixed(2);

    productDoc.stars = newAverage;
    productDoc.totalFeedbacks = newTotalFeedbacks;
    await productDoc.save({ validateBeforeSave: false });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
    });
  }
});

// FETCH FEEDBACK FOR ONE PRODUCT GIVEN BY ONE USER
router.post("/view/:productId", checkRole(0, 1), async (req, res) => {
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

// Upload feedback image
router.post("/upload-image", checkRole(0, 1), async (req, res) => {
  try {
    // Extract image data from the request body
    const imageData = req.body?.imageData;

    if (!imageData)
      return res.status(403).json({
        status: false,
        message: "Image Data Not Found",
      });

    // Process the base64 string to prepare for upload
    const base64string = imageData.base64String.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    let uploadResponse;
    try {
      console.log("Going for uploading the image to imagebb");
      // Upload the image using imgbb API
      uploadResponse = await imgbbUploader({
        apiKey: process.env.IMGBB_API_KEY, // MANDATORY
        base64string: base64string,
      });
      console.log("Upload success response", uploadResponse);
    } catch (err) {
      console.error(JSON.stringify(err.response));
      return res.status(403).json({ message: err.message });
    }

    let mongoResponse;
    if (uploadResponse) {
      // Create a new image document in the database
      mongoResponse = new FeedbackImage({
        title: uploadResponse.title,
        imageLink: uploadResponse.display_url,
        reference: uploadResponse.id,
        platform: "imgbb",
        thumbnailUrl: uploadResponse.display_url,
        uploadedBy: req.user._id,
      });
      await mongoResponse.save();
    }

    if (mongoResponse) {
      // Return success response with image details
      return res.status(200).json({
        message: "Feedback Images Uploaded",
        data: {
          ...mongoResponse._doc,
        },
      });
    }

    // If no response, return failure
    return res.status(200).json({
      status: false,
      message: "Feedback Image Upload Failed",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;

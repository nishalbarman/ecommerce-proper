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
router.get("/", checkRole(1, 2), async (req, res) => {
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

router.get("/all", checkRole(0, 1, 2), async (req, res) => {
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
router.post("/", checkRole(0, 1, 2), async (req, res) => {
  try {
    const { product, productType, description, starsGiven, imageIds } =
      req.body;

    console.log(req.body);

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

    console.log("Existing feedback ", existingFeedback);

    if (existingFeedback) {
      const oldStarsGiven = existingFeedback.starsGiven;
      const ratingChanged = oldStarsGiven !== starsGiven;

      // Update existing feedback
      existingFeedback.description = description;
      existingFeedback.starsGiven = starsGiven;

      if (imageIds && imageIds.length > 0) {
        // Link images to this feedback
        await FeedbackImage.updateMany(
          { _id: { $in: imageIds }, uploadedBy: req.user._id },
          { feedback: existingFeedback._id },
        );
        existingFeedback.images = imageIds;
      }

      await existingFeedback.save();

      if (ratingChanged) {
        await Product.updateOne({ _id: product }, [
          {
            $set: {
              totalRatings: {
                $add: ["$totalRatings", starsGiven - oldStarsGiven],
              },
            },
          },
          {
            $set: {
              stars: {
                $cond: [
                  { $gt: ["$totalFeedbacks", 0] },
                  {
                    $round: [
                      { $divide: ["$totalRatings", "$totalFeedbacks"] },
                      2,
                    ],
                  },
                  0,
                ],
              },
            },
          },
        ]);
      }

      return res.status(200).json({
        success: true,
        message: "Feedback updated successfully",
      });
    }

    console.log("What is users name", req.user);

    // Create new feedback
    const feedback = new Feedback({
      description,
      starsGiven,
      product,
      productType,
      givenBy: req.user?.name || req.user?.email.split("@")[0],
      user: req.user._id,
      images: imageIds || [],
    });

    await feedback.save();

    // Link images to this feedback if any
    if (imageIds && imageIds.length > 0) {
      await FeedbackImage.updateMany(
        { _id: { $in: imageIds }, uploadedBy: req.user._id },
        { feedback: feedback._id },
      );
    }

    // Update product rating (your existing logic)
    // const productDoc = await Product.findById(product);
    // const totalRatings = productDoc.stars * productDoc.totalFeedbacks;
    // const newTotalRatings = totalRatings + starsGiven;
    // const newTotalFeedbacks = productDoc.totalFeedbacks + 1;
    // const newAverage = (newTotalRatings / newTotalFeedbacks).toFixed(2);

    // productDoc.stars = newAverage;
    // productDoc.totalFeedbacks = newTotalFeedbacks;
    // await productDoc.save({ validateBeforeSave: false });

    await Product.updateOne({ _id: product }, [
      {
        $set: {
          totalRatings: { $add: ["$totalRatings", starsGiven] },
          totalFeedbacks: { $add: ["$totalFeedbacks", 1] },
        },
      },
      {
        $set: {
          stars: {
            $cond: [
              { $gt: ["$totalFeedbacks", 0] },
              {
                $round: [{ $divide: ["$totalRatings", "$totalFeedbacks"] }, 2],
              },
              0,
            ],
          },
        },
      },
    ]);

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

router.patch("/:reviewFetchBy", checkRole(0, 1, 2), async (req, res) => {
  try {
    const feedbackFetchBy = req.params?.reviewFetchBy; // can be feedback id or product id
    const {
      product,
      productType,
      description,
      starsGiven,
      imageIds,
      feedbackId,
    } = req.body;

    const errors = [];

    // if (!productType) errors.push("Product type is required");
    if (feedbackFetchBy === "product" && !product)
      errors.push("Product ID is required");
    if (!description) errors.push("Description is required");
    if (!starsGiven || starsGiven < 1 || starsGiven > 5) {
      errors.push("Rating must be between 1 and 5 stars");
    }
    if (!feedbackId) {
      errors.push("Feedback ID is required for review update");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors,
      });
    }

    const filter = {
      user: req.user._id,
      productType: productType || "buy",
    };

    console.log("Product, product", product);

    if (product) {
      filter.product = product;
    }

    if (feedbackFetchBy === "review") {
      filter._id = feedbackId;
    }

    console.log("Filter for feedback update", filter);

    // Check if user already reviewed this product
    const existingFeedback = await Feedback.findOne(filter);

    console.log("Existing feedback found for update", existingFeedback);

    if (existingFeedback) {
      // Store old rating before update
      const oldStarsGiven = existingFeedback.starsGiven;
      const ratingChanged = oldStarsGiven !== starsGiven;

      // Update existing feedback
      existingFeedback.description = description;
      existingFeedback.starsGiven = starsGiven;

      if (imageIds && imageIds.length > 0) {
        // Link images to this feedback
        await FeedbackImage.updateMany(
          { _id: { $in: imageIds }, uploadedBy: req.user._id },
          { feedback: existingFeedback._id },
        );
        existingFeedback.images = [...imageIds];
      }

      await existingFeedback.save();

      // Only update product stats if rating changed
      if (ratingChanged) {
        await Product.updateOne({ _id: existingFeedback.product }, [
          {
            $set: {
              totalRatings: {
                $add: ["$totalRatings", starsGiven - oldStarsGiven],
              },
            },
          },
          {
            $set: {
              stars: {
                $cond: [
                  { $gt: ["$totalFeedbacks", 0] },
                  {
                    $round: [
                      { $divide: ["$totalRatings", "$totalFeedbacks"] },
                      2,
                    ],
                  },
                  0,
                ],
              },
            },
          },
        ]);

        // const productDoc = await Product.findById(existingFeedback.product);
        // const currentTotal = productDoc.stars * productDoc.totalFeedbacks;
        // const newTotal = currentTotal - oldStarsGiven + starsGiven;
        // productDoc.stars = (newTotal / productDoc.totalFeedbacks).toFixed(2);
        // await productDoc.save({ validateBeforeSave: false });
      }

      return res.status(200).json({
        success: true,
        message: "Feedback updated successfully",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Feedback Update Failed",
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
router.post("/view/:fetchingId", checkRole(0, 1, 2), async (req, res) => {
  try {
    const fetchingId = req.params?.fetchingId;
    const productType = req.body?.productType || "buy";
    const fetchBy = req.query?.fetchBy;

    if (!fetchingId || !productType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const filter = {
      // productType: productType,
      user: req.user._id,
    };

    // product can be fetched by user with either product id or feedback id
    if (fetchBy === "product") {
      filter.product = fetchingId;
    } else {
      filter._id = fetchingId;
    }

    console.log("Filter This One", filter, fetchBy);

    const feedback = await Feedback.findOne(filter).populate("images  product");

    return res.status(200).json({ data: feedback });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// FEEDBACK: delete one feedback with feedback id
router.delete("/delete/:feedbackId", checkRole(0, 1), async (req, res) => {
  try {
    const params = req.params;
    console.log(TAG, params);

    // check whether we have the product id or not
    if (!params.feedbackId) {
      return res.status(400).json({ message: "Feedback ID missing!" });
    }

    const feedbackDoc = await Feedback.findOne({
      _id: params.feedbackId,
      user: req.user._id,
    });
    console.log(TAG, feedbackDoc);

    if (!feedbackDoc) {
      return res.status(404).json({ message: "No such feedback found." });
    }
    const oldStarsGiven = feedbackDoc?.starsGiven || 0;

    const deleteFeedback = await Feedback.deleteOne({
      _id: params.feedbackId,
      user: req.user._id,
    });

    if (!deleteFeedback) {
      return res.status(400).json({ message: "Delete feedback failed." });
    }

    console.log(TAG, feedbackDoc);

    await Product.updateOne({ _id: feedbackDoc.product }, [
      {
        $set: {
          totalRatings: { $subtract: ["$totalRatings", oldStarsGiven] },
          totalFeedbacks: {
            $cond: [
              { $gt: ["$totalFeedbacks", 0] },
              { $subtract: ["$totalFeedbacks", 1] },
              0,
            ],
          },
        },
      },
      {
        $set: {
          // Optionally clamp totalRatings to >= 0
          totalRatings: {
            $cond: [{ $lt: ["$totalRatings", 0] }, 0, "$totalRatings"],
          },
        },
      },
      {
        $set: {
          stars: {
            $cond: [
              { $gt: ["$totalFeedbacks", 0] },
              {
                $round: [{ $divide: ["$totalRatings", "$totalFeedbacks"] }, 2],
              },
              0,
            ],
          },
        },
      },
    ]);

    return res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// Upload feedback image
router.post("/upload-image", checkRole(0, 1, 2), async (req, res) => {
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
      "",
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
    return res.status(400).json({
      status: false,
      message: "Feedback Image Upload Failed",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;

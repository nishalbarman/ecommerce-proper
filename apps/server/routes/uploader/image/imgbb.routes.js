const express = require("express");
const imgbbUploader = require("imgbb-uploader");
const getImageColors = require("get-image-colors");
const Image = require("../../../models/image.model");

const router = express.Router();

router.post("/upload", async (req, res) => {
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
      return res.status(403).json({ status: false, message: err.message });
    }

    let mongoResponse;
    if (uploadResponse) {
      const imageColors = await getImageColors(uploadResponse.display_url, {
        count: 5,
      });

      const [first, second, third] = imageColors[0]._rgb;

      const averageColor = `rgba(${first},${second},${third},0.8)`;

      // Create a new image document in the database
      mongoResponse = await Image.create({
        title: uploadResponse.title,
        imageLink: uploadResponse.display_url,
        bgColor: averageColor,
        reference: uploadResponse.id,
        platform: "imgbb",
        thumbnailUrl: uploadResponse.thumb.url || uploadResponse.display_url,
        deleteLink: uploadResponse.delete_url,
        // uploadedBy: req.jwt.user,
        uploadedBy: req.jwt?.user || "Test",
      });
    }

    if (mongoResponse) {
      // Return success response with image details
      return res.status(200).json({
        status: true,
        message: "Image uploaded",
        // data: {
        //   ...mongoResponse,
        // },
      });
    }

    // If no response, return failure
    return res.status(200).json({
      status: false,
      message: "Image upload Failed",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

router.get("/imageBackgroundSet", async (req, res) => {
  try {
    const images = await Image.find({bgColor: {$exists: false}}).lean(); // faster
    console.log("Total images:", images.length);

    const chunkSize = 10; // control load
    const finalResults = [];

    for (let i = 0; i < images.length; i += chunkSize) {
      const chunk = images.slice(i, i + chunkSize);

      const chunkResults = await Promise.all(
        chunk.map(async (image) => {
          try {
            if (!image.imageLink) return null;

            const imageColors = await getImageColors(image.imageLink, {
              count: 5,
            });

            if (!imageColors || !imageColors[0]?._rgb) return null;

            const [r, g, b] = imageColors[0]._rgb;

            return {
              _id: image._id,
              color: `rgba(${r},${g},${b},0.8)`,
            };
          } catch (err) {
            console.error("Image failed:", image._id, err.message);
            return null; // ✅ safe skip
          }
        })
      );

      // filter valid results
      const valid = chunkResults.filter(Boolean);
      finalResults.push(...valid);
    }

    console.log("Processed:", finalResults.length);

    // ✅ Avoid empty bulkWrite
    if (finalResults.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No valid images to update",
      });
    }

    const bulkOps = finalResults.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { bgColor: item.color } },
      },
    }));

    const result = await Image.bulkWrite(bulkOps);

    return res.status(200).json({
      status: true,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error("Main Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
});
module.exports = router;

const express = require("express");
const imgbbUploader = require("imgbb-uploader");
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
      return res.status(403).json({ status: false, message: err.message });
    }

    let mongoResponse;
    if (uploadResponse) {
      // Create a new image document in the database
      mongoResponse = await Image.create({
        title: uploadResponse.title,
        imageLink: uploadResponse.display_url,
        reference: uploadResponse.id,
        platform: "imgbb",
        thumbnailUrl: uploadResponse.thumb.url || uploadResponse.display_url,
        deleteLink: uploadResponse.delete_url,
        // uploadedBy: req.jwt.user,
        uploadedBy: "Test",
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

module.exports = router;

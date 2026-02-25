const { default: axios } = require("axios");
const express = require("express");
const imgbbUploader = require("imgbb-uploader");
const { ImageUploadHelper } = require("../../../helpter/imgUploadhelpter");
const Image = require("../../../models/image.model");

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    let publicUrl;
    const imageData = req.body.imageData;
    console.log("ImageData", JSON.stringify(req.body));
    const base64string = imageData.base64String;
    try {
      console.log("Going for uploading the image to imagebb");

      const response = await ImageUploadHelper.uploadBulkImages([base64string]);

      console.log(response);
    } catch (err) {
      console.error(JSON.stringify(err));
      return res.status(403).json({ status: false, message: err.message });
    }

    const mongooseResponse = await Image.insertMany(
      response.map((url) => {
        return {
        title: "notitle" || uploadResponse.title,
        imageLink: url,
        averageColor: averageColor,
        reference: uploadResponse.id,
        platform: "firebase",
        thumbnailUrl: url || url,
        deleteLink: "" || uploadResponse.delete_url,
        // uploadedBy: req.jwt.user,
        uploadedBy: req.user?.name || "",
      }}),
    );

    // Create a new image document in the database
    return res.status(200).json({
      status: true,
      message: "Image uploaded",
      // publicUrl: url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;

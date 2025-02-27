const { default: axios } = require("axios");
const express = require("express");
const imgbbUploader = require("imgbb-uploader");
const { ImageUploadHelper } = require("../../../helpter/imgUploadhelpter");

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

    return res.status(200).json({
      status: true,
      message: "Image uploaded",
      publicUrl: publicUrl,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;

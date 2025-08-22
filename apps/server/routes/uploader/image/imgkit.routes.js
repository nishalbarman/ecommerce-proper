const express = require("express");
const imgbbUploader = require("imgbb-uploader");
const ImageKit = require("imagekit");
const { v4: uuidv4 } = require("uuid");
const Image = require("../../../models/image.model");

const router = express.Router();

const imagekit = new ImageKit({
  publicKey: process.env.IMGKIT_PUBLIC_API_KEY,
  privateKey: process.env.IMGKIT_PRIVATE_API_KEY,
  urlEndpoint: process.env.IMGKIT_ENDPOINT_URL,
});

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
      console.log("Going for uploading the image to imagekit");
      // Upload the image using imgbb API
      // uploadResponse = await imgbbUploader({
      //   apiKey: process.env.IMGBB_API_KEY, // MANDATORY
      //   base64string: base64string,
      // });

      // Upload the image using ImageKit API
      uploadResponse = await imagekit.upload({
        file: base64string, //required
        fileName: uuidv4(), //required
        extensions: [
          {
            name: "google-auto-tagging",
            maxTags: 5,
            minConfidence: 95,
          },
        ],
        // transformation: {
        //     pre: 'l-text,i-Imagekit,fs-50,l-end',
        //     post: [
        //         {
        //             type: 'transformation',
        //             value: 'w-100'
        //         }
        //     ]
        // },
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
        title: uploadResponse.name,
        imageLink: uploadResponse.url,
        reference: uploadResponse.fileId,
        platform: "imgkit",
        thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
        deleteLink: "",
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

router.post("/delete/:deleteId", async (req, res) => {
  try {
    // Extract image data from the request body
    const imageId = req.query?.imageId;

    if (!imageId)
      return res.status(403).json({
        status: false,
        message: "Image Data Not Found",
      });

    try {
      // Upload the image using ImageKit API
      uploadResponse = await imagekit.deleteFile(imageId);
      // ({
      //   file: base64string, //required
      //   fileName: uuidv4(), //required
      //   extensions: [
      //     {
      //       name: "google-auto-tagging",
      //       maxTags: 5,
      //       minConfidence: 95,
      //     },
      //   ],
      // });

      console.log("Upload success response", uploadResponse);
    } catch (err) {
      console.error(JSON.stringify(err.response));
      return res.status(403).json({ status: false, message: err.message });
    }

    // Return success response with image details
    return res.status(200).json({
      status: true,
      message: "Image uploaded",
    });

    // // If no response, return failure
    // return res.status(200).json({
    //   status: false,
    //   message: "Image upload Failed",
    // });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;

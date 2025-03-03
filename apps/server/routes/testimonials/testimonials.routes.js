const mongoose = require("mongoose");
const express = require("express");
const Testimonials = require("../../models/testimonials.model");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const searchQuery = req.searchQuery;

    const PAGE = searchQuery?.page || 1;
    const LIMIT = searchQuery?.limit || 20;
    const SKIP = (PAGE - 1) * LIMIT;

    const totalTestimonialsCount = await Testimonials.countDocuments();

    const testimonialsList = await Testimonials.find({})
      .sort({ createdAt: "desc" })
      .skip(SKIP)
      .limit(LIMIT);

    const totalPages = Math.ceil(totalTestimonialsCount / LIMIT);

    return res.status(200).json({
      totalPages,
      data: testimonialsList,
      totalCount: totalTestimonialsCount,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof mongoose.Error) {
      /* I added custom validator functions in mongoose models, so the code is to chcek whether the errors are from mongoose or not */
      const errArray = [];
      for (let key in err.errors) {
        errArray.push(err.errors[key].properties.message);
      }

      return res
        .status(400)
        .json({ message: errArray.join(", ").replaceAll(" Path", "") });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const testimonialsData = req.body?.testimonialData;

    const { clientName, clientSpeech, clientAvatar, clientChatImage } =
      testimonialsData;

    // Validate required fields
    if (!clientName || !clientSpeech || !clientAvatar || !clientChatImage) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTestimonial = new Testimonials({
      clientName,
      clientSpeech,
      clientAvatar,
      clientChatImage,
    });

    await newTestimonial.save();

    return res.status(201).json({
      message: "Testimonial created successfully",
      data: newTestimonial,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof mongoose.Error) {
      const errArray = [];
      for (let key in err.errors) {
        errArray.push(err.errors[key].properties.message);
      }

      return res
        .status(400)
        .json({ message: errArray.join(", ").replaceAll(" Path", "") });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const testimonialsData = req.body?.testimonialData;

    const { clientName, clientSpeech, clientAvatar, clientChatImage } =
      testimonialsData;

    // Validate required fields
    if (!clientName || !clientSpeech || !clientAvatar || !clientChatImage) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedTestimonial = await Testimonials.findByIdAndUpdate(
      id,
      { clientName, clientSpeech, clientAvatar, clientChatImage },
      { new: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    return res.status(200).json({
      message: "Testimonial updated successfully",
      data: updatedTestimonial,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof mongoose.Error) {
      const errArray = [];
      for (let key in err.errors) {
        errArray.push(err.errors[key].properties.message);
      }

      return res
        .status(400)
        .json({ message: errArray.join(", ").replaceAll(" Path", "") });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTestimonial = await Testimonials.findByIdAndDelete(id);

    if (!deletedTestimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    return res.status(200).json({
      message: "Testimonial deleted successfully",
      data: deletedTestimonial,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

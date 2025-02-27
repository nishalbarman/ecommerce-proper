const mongoose = require("mongoose");
const express = require("express");
const { Banner } = require("../../models/models");

const bannerRouter = express.Router();

bannerRouter.get("/", async (req, response) => {
  try {
    const searchQuery = req.searchQuery;

    const PAGE = searchQuery?.page || 1;
    const LIMIT = searchQuery?.limit || 20;
    const SKIP = (PAGE - 1) * LIMIT;

    const bannerList = await Banner.find({})
      .sort({ createdAt: "desc" })
      .skip(SKIP)
      .limit(LIMIT);
    if (bannerList) {
      return response.json({ status: true, data: bannerList });
    }
    return response.json({ status: false, message: "No Banner Found" });
  } catch (err) {
    console.log(err);
    if (err instanceof mongoose.Error) {
      /* I added custom validator functions in mongoose models, so the code is to chcek whether the errors are from mongoose or not */
      const errArray = [];
      for (let key in err.errors) {
        errArray.push(err.errors[key].properties.message);
      }

      return response.json(
        { status: false, message: errArray.join(", ").replaceAll(" Path", "") },
        { status: 404 }
      );
    }
    return response.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});

module.exports = bannerRouter;

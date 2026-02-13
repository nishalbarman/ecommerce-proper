const express = require("express");
const router = express.Router();
const UserAddress = require("../../models/userAddress.model");
const User = require("../../models/user.model");
const mongoose = require("mongoose");

const checkRole = require("../../middlewares");

router.get("/", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;

    if (!userDetails) {
      return res.status(400).json({
        status: false,
        message: "Token validation failed",
      });
    }

    const address = await UserAddress.find({
      user: userDetails._id,
    })
      .sort({ createdAt: "desc" })
      .select("-user");

    return res.json({
      data: address,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
});

router.post("/", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;

    const oldAddressCount = await UserAddress.countDocuments({
      user: userDetails._id,
    });

    if (oldAddressCount >= 5) {
      return res.status(400).json({
        status: false,
        message: "UserAddress limit reached, you can only add upto 5 addresses",
      });
    }

    const newAddress = new UserAddress({
      user: userDetails._id,
      ...req.body,
    });
    await newAddress.save();

    return res.json({
      message: "Address added.",
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

router.get("/get-default-address", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;

    const user = await User.findOneById(userDetails._id)
      .sort({ createdAt: "desc" })
      .select("defaultAddress");

    return res.json({
      defaultAddress: user?.defaultAddress,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
});

router.post("/update-default-address", checkRole(0, 1, 2), async (req, res) => {
  try {
    const reqBody = req.body;
    const userDetails = req.user;

    if (reqBody.addressId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const addressDetail = await UserAddress.finedOne(reqBody.addressId);

    if (!addressDetail) {
      return res.status(400).json({ message: "Invalid Adress Id" });
    }

    const updatedAddress = await User.findByIdAndUpdate(userDetails._id, {
      $set: {
        defaultAddress: addressDetail._id,
      },
    });

    return res.json({
      message: "Default Address Updated.",
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

router.patch("/:address_item_id", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;

    const { address_item_id } = req.params;

    if (!req?.body) {
      return res.status(400).json({
        message: "expected some values to update, no values found",
      });
    }

    const updatedAddress = {};
    Object.keys(req?.body).map((key) => {
      if (!!req?.body[key]) updatedAddress[key] = req.body[key];
    });

    if (!updatedAddress) {
      return res.status(400).json({
        message: "expected some values to update, no values found",
      });
    }

    const address = await UserAddress.findOneAndUpdate(
      {
        user: userDetails._id,
        _id: address_item_id,
      },
      {
        $set: req.body,
      }
    );

    if (!address) {
      return res.status(400).json({ message: "Address update failed" });
    }

    return res.json({
      message: "Address updated.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.delete("/:address_item_id", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;

    if (!userDetails) {
      return res.status(400).json({
        message: "Token validation failed",
      });
    }

    const { address_item_id } = req.params;

    console.log("address_item_id", address_item_id);

    const addressDetails = await UserAddress.findOneAndDelete({
      _id: address_item_id,
      user: userDetails._id,
    });

    if (!addressDetails) {
      return res.status(400).json({
        message: "No address found with provided id!",
      });
    }

    return res.json({
      status: true,
      message: "Address deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

module.exports = router;

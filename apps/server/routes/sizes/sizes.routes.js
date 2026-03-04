const express = require("express");
const router = express.Router();
const Size = require("../../models/size.model");

const checkRole = require("../../middlewares");

router.get(
  "/",
  checkRole("user", "admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const sizes = await Size.find();

      return res.json({
        ...sizes,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;

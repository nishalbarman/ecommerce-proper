const { Router } = require("express");
const mongoose = require("mongoose");
const Message = require("../../models/message.model");
const checkRole = require("../../middlewares");

const router = Router();

router.get("/", checkRole(1), async (req, res) => {
  try {
    const page = req.query?.page || 1;
    const limit = req.query?.limit || 20;
    const skipDocuments = (page - 1) * +limit;

    const totalCounts = await Message.countDocuments();

    const totalPages = Math.ceil(totalCounts / limit);

    const sortBy = req.query?.sortBy || "createdAt";
    const order = req.query?.order || "desc";

    let messages = null;
    if (sortBy) {
      messages = await Message.find()
        .sort({ [sortBy]: order })
        .skip(skipDocuments)
        .limit(+limit);
    } else {
      messages = await Message.find().skip(skipDocuments).limit(+limit);
    }
    return res.status(200).json({ totalCounts, totalPages, messages });
  } catch (err) {
    console.error("Get message error => ", err);

    if (err instanceof mongoose.MongooseError) {
      return res.status(400).json({ message: JSON.stringify(err) });
    } else {
      return res.sendStatus(500);
    }
  }
});

router.get("/:id", checkRole(1), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    return res.status(200).json({
      message,
    });
  } catch (err) {
    console.log("Get message error => ", err);
    if (err instanceof mongoose.MongooseError) {
      return res.status(400).json({ message: JSON.stringify(err) });
    } else {
      return res.sendStatus(500);
    }
  }
});

router.post("/create", async (req, res) => {
  try {
    const message = new Message(req.body);
    console.log(message);
    await message.save();
    res.send({ status: true, message: "Message submitted!" });
  } catch (err) {
    if (err instanceof mongoose.Error) {
      const errors = [];
      for (key in err.errors) {
        errors.push(err.errors[key].properties.message);
      }
      return res.status(400).json({ message: errors.join(", ") });
    } else {
      res.sendStatus(500);
    }
  }
});

router.patch("/:id/read", checkRole(1), async (req, res) => {
  try {
    if (req.body._id) {
      delete req.body._id;
    }
    console.log(req.body);
    await Message.updateOne(
      { _id: req.params.id },
      {
        $set: { readStatus: true },
      },
      { runValidators: false }
    );
    res.send({ message: "Marked as Read!" });
  } catch (err) {
    if (err instanceof mongoose.Error) {
      const errors = [];
      for (key in err.errors) {
        errors.push(err.errors[key].properties.message);
      }
      res.status(400).send({ status: false, message: errors.join(", ") });
    } else {
      res.sendStatus(500);
    }
    console.log("Patch message eror => ", err);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    await Message.deleteOne({ _id: req.params.id });
    return res.send({ message: "Message deleted!" });
  } catch (err) {
    console.log("Delete message error => ", err);
    return res.sendStatus(500);
  }
});

module.exports = router;

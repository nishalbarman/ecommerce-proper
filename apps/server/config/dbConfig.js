const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

module.exports = function connect() {
  try {
    mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000
    });
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("Database is ready.");
    });

    connection.on("error", (error) => {
      console.error("Database error --> ", error);
    });
  } catch (error) {
    console.error("Mongoose error --> ", error);
  }
};

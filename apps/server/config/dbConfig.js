const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB

// function connect() {
//   try {
//     mongoose.connect(MONGO_URI, {
//       serverSelectionTimeoutMS: 60000,
//       socketTimeoutMS: 60000,
//     });
//     const connection = mongoose.connection;

//     connection.on("connected", () => {
//       console.log("Database is ready.");
//     });

//     connection.on("error", (error) => {
//       console.error("Database error --> ", error);
//     });
//   } catch (error) {
//     console.error("Mongoose error --> ", error);
//   }
// };

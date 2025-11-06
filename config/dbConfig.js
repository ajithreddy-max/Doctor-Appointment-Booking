const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/doctor-appointment-booking");

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("MongoDB connection is successful");
});

connection.on("error", (error) => {
  console.log("Error in MongoDB connection", error);
});

module.exports = mongoose;

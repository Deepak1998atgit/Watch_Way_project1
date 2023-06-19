const mongoose = require("mongoose");

const connectDB = mongoose
  .connect(process.env.MONGODB_CONNECTION_URL)
  
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = connectDB;
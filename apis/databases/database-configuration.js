const mongoose = require("mongoose");
require("dotenv").config();

exports.databaseConnection = () => {
  try {
    mongoose.connect(process.env.DATABASE_CONNECTION_KEY);
    console.log("Database connected successfully.");
  } catch (error) {
    console.log(`${error}`);
  }
};

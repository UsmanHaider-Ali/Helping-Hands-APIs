const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("dotenv").config();
dotenv.config();

exports.databaseConnection = () => {
  try {
    console.log(process.env.DATABASE_CONNECTION_KEY);
    mongoose.connect(process.env.DATABASE_CONNECTION_KEY);
    console.log("Database connected successfully.");
  } catch (error) {
    console.log(`${error}`);
  }
};

const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

exports.databaseConnection = async () => {
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    await mongoose.connect(
      process.env.DATABASE_CONNECTION_KEY,
      connectionOptions
    );
    console.log("Database Connected");
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

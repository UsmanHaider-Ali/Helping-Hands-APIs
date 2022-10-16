const express = require("express");
const app = express();

const databaseConnection = require("./api/databases/database-configuration.js");

// const bodyParser = require("body-parser");

require("dotenv/config");

databaseConnection.databaseConnection();

console.log("Connecting...");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/storage/images/profile", express.static("storage/images/profile"));

const userRoutes = require("./api/routes/user-routes");

//User routes
app.use("/apis/users", userRoutes);

module.exports = app;

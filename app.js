const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const databaseConnection = require("./databases/database-configuration.js");
const userRoutes = require("./routes/user-routes");

databaseConnection.databaseConnection();

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/storage/images/profile", express.static("storage/images/profile"));

//User routes
app.use("/users", userRoutes);

module.exports = app;

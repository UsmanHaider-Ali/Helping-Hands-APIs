const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

const databaseConnection = require("./databases/database-configuration.js");
const userRoutes = require("./routes/user-routes");

databaseConnection.databaseConnection();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const campaignRoutes = require("./routes/campaign-routes.js");

app.use("/storage/images/profile", express.static("storage/images/profile"));

app.use("/users", userRoutes);
app.use("/campaigns", campaignRoutes);

module.exports = app;

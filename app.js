const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

const databaseConnection = require("./databases/database-configuration.js");

const userRoutes = require("./routes/user-routes");
const categoryRoutes = require("./routes/category-routes.js");
const questionRoutes = require("./routes/question-routes.js");
const answerRoutes = require("./routes/answer-routes.js");
const campaignRoutes = require("./routes/campaign-routes.js");
const projectRoutes = require("./routes/project-routes.js");
const successStoriesRoutes = require("./routes/success-stories-routes.js");

databaseConnection.databaseConnection();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("/storage/images", express.static("storage/images"));

app.use("/user", userRoutes);
app.use("/campaign", campaignRoutes);
app.use("/project", projectRoutes);
app.use("/category", categoryRoutes);
app.use("/question", questionRoutes);
app.use("/answer", answerRoutes);
app.use("/success-stories", successStoriesRoutes);

module.exports = app;

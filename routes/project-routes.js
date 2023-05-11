const express = require("express");
const routes = express.Router();

const uploadImage = require("../middlewares/image-upload.js");

const projectController = require("../controllers/project-controller.js");

routes.post(
  "/deploy-project-contract",
  projectController.deployeProjectContract
);
module.exports = routes;

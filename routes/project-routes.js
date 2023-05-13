const express = require("express");
const routes = express.Router();

const uploadImage = require("../middlewares/image-upload.js");

const projectController = require("../controllers/project-controller.js");

routes.post("/deploy-contract", projectController.deployContract);
routes.post(
  "/create-project",
  uploadImage.single("imageUrl"),
  projectController.createProject
);
routes.post("/create-module", projectController.createModule);
routes.post("/get-project", projectController.getProject);
routes.post("/get-projects", projectController.getProjects);
routes.post("/donate-project", projectController.donateProject);
routes.post("/withdraw-funds", projectController.withdrawFunds);
routes.post("/get-users-stats", projectController.getUserStats);

module.exports = routes;

const express = require("express");
const routes = express.Router();

const uploadImage = require("../middlewares/image-upload.js");

const projectController = require("../controllers/project-controller.js");

routes.post(
  "/deploy-project-contract",
  projectController.deployeProjectContract
);
routes.post(
  "/create-project",
  uploadImage.single("imageUrl"),
  projectController.createProject
);
routes.post("/create-project-module", projectController.createProjectModule);
routes.post("/get-project", projectController.getProject);
routes.post("/get-all-projects", projectController.getAllProjects);
routes.post("/donate-project-module", projectController.donateProjectModule);

module.exports = routes;

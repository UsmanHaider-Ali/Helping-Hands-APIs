const express = require("express");
const routes = express.Router();

const successStoriesController = require("../controllers/success-stories-controller.js");

const uploadImage = require("../middlewares/image-upload.js");

routes.post(
  "/create-storey",
  uploadImage.single("image"),
  successStoriesController.createSuccessStory
);
routes.get("/get-all-stories", successStoriesController.getAllSuccessStories);
routes.delete("/delete-story", successStoriesController.deleteStory);

module.exports = routes;

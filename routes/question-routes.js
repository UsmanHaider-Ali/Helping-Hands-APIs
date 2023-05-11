const express = require("express");
const routes = express.Router();

const questionController = require("../controllers/question-controller.js");

const uploadImage = require("../middlewares/image-upload.js");

routes.post(
  "/create-question",
  uploadImage.single("image"),
  questionController.createQuestion
);
routes.get("/get-all-questions", questionController.getAllQuestions);
routes.post(
  "/get-questions-by-category",
  questionController.getQuestionByCategory
);
routes.post("/get-questions-by-user", questionController.getQuestionByUser);
routes.post("/get-questions-by-id", questionController.getQuestionById);
routes.delete("/delete-question", questionController.deleteQuestion);
routes.post(
  "/update-question",
  uploadImage.single("image"),
  questionController.updateQuestion
);
module.exports = routes;
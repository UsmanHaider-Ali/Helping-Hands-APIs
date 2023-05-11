const express = require("express");
const routes = express.Router();

const answerController = require("../controllers/answer-controller.js");
const uploadImage = require("../middlewares/image-upload.js");

routes.post(
  "/create-answer",
  uploadImage.single("image"),
  answerController.createAnswer
);
routes.post("/get-answer-by-question", answerController.getAnswerByQuestion);
routes.delete("/delete-anwer", answerController.deleteAnswer);
routes.post(
  "/update-anwer",
  uploadImage.single("image"),
  answerController.updateAnswer
);

module.exports = routes;

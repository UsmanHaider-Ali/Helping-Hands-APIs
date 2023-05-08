const express = require("express");
const routes = express.Router();

const answerController = require("../controllers/answer-controller.js");

routes.post("/create-answer", answerController.createAnswer);
routes.post("/get-answer-by-question", answerController.getAnswerByQuestion);
routes.delete("/delete-anwer", answerController.deleteAnswer);
routes.put("/update-anwer", answerController.updateAnswer);

module.exports = routes;

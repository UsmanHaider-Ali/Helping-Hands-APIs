const express = require("express");
const routes = express.Router();

const questionController = require("../controllers/question-controller.js");

//Create Question
routes.post("/create-question", questionController.createQuestion);
routes.get("/get-all-questions", questionController.getAllQuestions);
routes.post("/get-questions-by-category", questionController.getQuestionByCategory);
routes.post("/get-questions-by-user", questionController.getQuestionByUser);
routes.post("/get-questions-by-id", questionController.getQuestionById);
routes.delete("/delete-question", questionController.deleteQuestion);

module.exports = routes;

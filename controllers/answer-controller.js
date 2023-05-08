const Validator = require("validatorjs");
const mongoose = require("mongoose");

const validationRules = require("../middlewares/validations.js");

const answerModel = require("../models/answer-model.js");
const questionModel = require("../models/question-model.js");

//Create Answer
exports.createAnswer = async (req, res, next) => {
  const { answer, userId, questionId } = req.body;

  const validation = new Validator(
    { questionId, userId, answer },
    validationRules.answerValidation
  );

  if (validation.fails()) {
    var msg = "";

    if (validation.errors.has("answer")) msg = "Answer can't be empty.";
    else if (validation.errors.has("questionId"))
      msg = "QuestionId can't be empty.";
    else if (validation.errors.has("userId")) msg = "UserId can't be empty.";

    res.json({
      message: msg,
      success: false,
    });
    return;
  }

  const newAnswer = new answerModel({
    _id: new mongoose.Types.ObjectId(),
    answer: answer,
    userId: userId,
    questionId: questionId,
  });

  const result = await newAnswer.save();

  if (result == null) {
    res.send({
      message: "Something wrong, please try again.",
      success: false,
    });
    return;
  }
  res.send({
    message: "Answer created successfully.",
    success: true,
    data: result,
  });
};

//Get Answers By Question
exports.getAnswerByQuestion = async (req, res, next) => {
  const { questionId } = req.body;

  if (questionId == null) {
    res.send({
      message: "QuestionId can't be empty.",
      success: false,
    });
    return;
  }

  const answers = await answerModel.find({ questionId });

  res.send({
    message: "Answers fetched successfully.",
    success: true,
    data: answers,
  });
};

//Delete Answer
exports.deleteAnswer = async (req, res, next) => {
  const { _id } = req.body;

  if (_id == null || _id == "") {
    res.send({
      message: "AnswerId can't be emtpy.",
      success: false,
    });
    return;
  }

  const result = await answerModel.deleteOne({ _id });

  if (result.deletedCount > 0) {
    res.send({
      message: "Answer delete successfully.",
      success: true,
    });
  } else {
    res.send({
      message: "Answer not found.",
      success: false,
    });
  }
};

//Update Answer
exports.updateAnswer = async (req, res, next) => {
  const { answerId, updatedAnswer } = req.body;

  if (answerId == null || answerId == "") {
    res.send({
      message: "AnswerId can't be empty.",
      success: false,
    });
    return;
  }

  if (updatedAnswer == null || updatedAnswer == "") {
    res.send({
      message: "Answer can't be empty.",
      success: false,
    });
    return;
  }
  var _id = answerId;
  const answer = await answerModel.findById({ _id });

  if (answer == null) {
    res.json({
      message: "Answer not found.",
      success: false,
    });
    return;
  }

  var updatedAns = await answerModel.updateOne(
    { _id },
    {
      answer: updatedAnswer,
    },
    { new: true }
  );

  updatedAns = await answerModel.findOne({ _id });

  res.json({
    message: "Answer updated successfully.",
    success: true,
    data: {
      _id: updatedAns["_id"],
      userId: updatedAns["userId"],
      questionId: updatedAns["questionId"],
      answer: updatedAns["answer"],
    },
  });
};

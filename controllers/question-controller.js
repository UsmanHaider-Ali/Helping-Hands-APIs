const Validator = require("validatorjs");
const mongoose = require("mongoose");

const validationRules = require("../middlewares/validations.js");

const questionModel = require("../models/question-model.js");

//Create Question
exports.createQuestion = async (req, res, next) => {
  const { question, userId, categoryId } = req.body;

  const validation = new Validator(
    { question, userId, categoryId },
    validationRules.questionValidation
  );

  if (validation.fails()) {
    var msg = "";

    if (validation.errors.has("question")) msg = "Question can't be empty.";
    else if (validation.errors.has("userId")) msg = "userId can't be empty.";
    else if (validation.errors.has("categoryId"))
      msg = "categoryId can't be empty.";

    res.json({
      message: msg,
      success: false,
    });
    return;
  }

  const newQuestion = new questionModel({
    _id: new mongoose.Types.ObjectId(),
    question: question,
    userId: userId,
    categoryId: categoryId,
  });

  const result = await newQuestion.save();

  if (result == null) {
    res.send({
      message: "Something wrong, please try again.",
      success: false,
    });
    return;
  }

  res.send({
    message: "question created successfully.",
    success: true,
    data: result,
  });
};

//Get All Questions
exports.getAllQuestions = async (req, res, next) => {
  const questions = await questionModel.find().populate("answers");

  res.send({
    message: "Questions fetched successfully.",
    success: true,
    data: questions,
  });
};

//Get Questions By Category
exports.getQuestionByCategory = async (req, res, next) => {
  const { categoryId } = req.body;

  if (categoryId == null) {
    res.send({
      message: "CategoryId can't be empty.",
      success: false,
    });
    return;
  }

  const questions = await questionModel.find({ categoryId });

  res.send({
    message: "Questions fetched successfully.",
    success: true,
    data: questions,
  });
};

//Get Questions By User
exports.getQuestionByUser = async (req, res, next) => {
  const { userId } = req.body;

  if (userId == null) {
    res.send({
      message: "userId can't be empty.",
      success: false,
    });
    return;
  }

  const questions = await questionModel.find({ userId });

  res.send({
    message: "Questions fetched successfully.",
    success: true,
    data: questions,
  });
};

//Get Questions By Id
exports.getQuestionById = async (req, res, next) => {
  const { _id } = req.body;

  if (_id == null || _id == "") {
    res.send({
      message: "QuestionId can't be empty.",
      success: false,
    });
    return;
  }

  const question = await questionModel.findOne({ _id }).populate("answers");

  if (question) {
    res.send({
      message: "Question fetched successfully.",
      success: true,
      data: question,
    });
  } else {
    res.send({
      message: "Question not found.",
      success: false,
    });
  }
};

//Delete Question
exports.deleteQuestion = async (req, res, next) => {
  const { _id } = req.body;

  if (_id == null || _id == "") {
    res.send({
      message: "QuestionId can't be emtpy.",
      success: false,
    });
    return;
  }

  const result = await questionModel.deleteOne({ _id });

  if (result.deletedCount > 0) {
    res.send({
      message: "Question delete successfully.",
      success: true,
    });
  } else {
    res.send({
      message: "Question not found.",
      success: false,
    });
  }
};

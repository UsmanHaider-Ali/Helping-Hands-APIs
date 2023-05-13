const Validator = require("validatorjs");
const mongoose = require("mongoose");
const moment = require("moment");

const validationRules = require("../middlewares/validations.js");

const questionModel = require("../models/question-model.js");

exports.createQuestion = async (req, res, next) => {
  var imagePath = "";

  if (req.file === undefined) {
    imagePath = "_";
  } else {
    imagePath = req.file.path;
  }

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

  const now = moment().format("HH:mm DD-MM-YYYY ");

  const newQuestion = new questionModel({
    _id: new mongoose.Types.ObjectId(),
    question: question,
    userId: userId,
    categoryId: categoryId,
    image: imagePath,
    timestamp: now,
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
    question: result,
  });
};

exports.getAllQuestions = async (req, res, next) => {
  const questions = await questionModel.find();

  res.send({
    message: "Questions fetched successfully.",
    success: true,
    questions: questions,
  });
};

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
    questions: questions,
  });
};

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
    questions: questions,
  });
};

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
      question: question,
    });
  } else {
    res.send({
      message: "Question not found.",
      success: false,
    });
  }
};

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

exports.updateQuestion = async (req, res, next) => {
  const { questionId, updatedQuestion } = req.body;

  if (questionId == null || questionId == "") {
    res.send({
      message: "QuestionId can't be empty.",
      success: false,
    });
    return;
  }

  if (updatedQuestion == null || updatedQuestion == "") {
    res.send({
      message: "Question can't be empty.",
      success: false,
    });
    return;
  }
  var _id = questionId;
  const question = await questionModel.findById({ _id });

  if (question == null) {
    res.json({
      message: "Question not found.",
      success: false,
    });
    return;
  }

  var imagePath = question.image;

  if (req.file === undefined) {
  } else {
    imagePath = req.file.path;
  }

  var updatedQuest = await questionModel.updateOne(
    { _id },
    {
      question: updatedQuestion,
      image: imagePath,
    },
    { new: true }
  );

  updatedQuest = await questionModel.findOne({ _id });

  res.json({
    message: "Question updated successfully.",
    success: true,
    question: {
      _id: updatedQuest["_id"],
      userId: updatedQuest["userId"],
      categoryId: updatedQuest["categoryId"],
      question: updatedQuest["question"],
      image: updatedQuest["image"],
    },
  });
};

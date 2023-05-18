const Validator = require("validatorjs");
const mongoose = require("mongoose");

const validationRules = require("../middlewares/validations.js");

const successStoriesModel = require("../models/success-stories-model.js");

exports.createSuccessStory = async (req, res, next) => {
  var imagePath = "";

  if (req.file === undefined) {
    res.json({
      message: "Please select the image.",
      success: false,
    });
    return;
  } else {
    imagePath = req.file.path;
  }

  const { userId, categoryId, title, description } = req.body;

  const validation = new Validator(
    { userId, categoryId, title, description },
    validationRules.storyValidation
  );

  if (validation.fails()) {
    res.json({
      message:
        "Please fill all the fields like userId, categoryId, title, description.",
      success: false,
    });
    return;
  }
  const now = new Date().getTime();

  const newStory = new successStoriesModel({
    _id: new mongoose.Types.ObjectId(),
    userId: userId,
    categoryId: categoryId,
    title: title,
    description: description,
    image: imagePath,
    timeStamp: now,
  });

  const story = await newStory.save();

  if (story == null) {
    res.send({
      message: "Something wrong, please try again.",
      success: false,
    });
    return;
  }

  res.send({
    message: "Success Story created successfully.",
    success: true,
    story: story,
  });
};

exports.getAllSuccessStories = async (req, res, next) => {
  const stories = await successStoriesModel.find();

  res.send({
    message: "Success Stories fetched successfully.",
    success: true,
    stories: stories,
  });
};

exports.deleteStory = async (req, res, next) => {
  const { _id } = req.body;

  if (_id == null || _id == "") {
    res.send({
      message: "StoryId can't be emtpy.",
      success: false,
    });
  }

  const result = await successStoriesModel.deleteOne({ _id });

  if (result.deletedCount > 0) {
    res.send({
      message: "Story delete successfully.",
      success: true,
    });
  } else {
    res.send({
      message: "Something wrong, please try again.",
      success: false,
    });
  }
};

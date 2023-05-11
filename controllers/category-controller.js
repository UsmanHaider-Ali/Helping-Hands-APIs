const Validator = require("validatorjs");
const mongoose = require("mongoose");

const validationRules = require("../middlewares/validations.js");

const categoryModel = require("../models/category-model.js");

exports.createCategory = async (req, res, next) => {
  const { name } = req.body;

  const validation = new Validator({ name }, validationRules.nameValidation);

  if (validation.fails()) {
    res.json({
      message: "Category name can't be empty.",
      success: false,
    });
    return;
  }

  const category = await categoryModel.findOne({ name });

  if (category) {
    res.json({
      message: "This category is already created.",
      success: false,
    });
    return;
  }

  const newCategory = new categoryModel({
    _id: new mongoose.Types.ObjectId(),
    name: name,
  });

  const result = await newCategory.save();

  if (result == null) {
    res.send({
      message: "Something wrong, please try again.",
      success: false,
    });
    return;
  }

  res.send({
    message: "Category created successfully.",
    success: true,
    data: result,
  });
};

exports.getAllCategories = async (req, res, next) => {
  const category = await categoryModel.find();

  res.send({
    message: "Category fetched successfully.",
    success: true,
    data: category,
  });
};

exports.deleteCategory = async (req, res, next) => {
  const { _id } = req.body;

  if (_id == null || _id == "") {
    res.send({
      message: "CategoryId can't be emtpy.",
      success: false,
    });
  }

  const result = await categoryModel.deleteOne({ _id });

  if (result.deletedCount > 0) {
    res.send({
      message: "Category delete successfully.",
      success: true,
    });
  } else {
    res.send({
      message: "Something wrong, please try again.",
      success: false,
    });
  }
};

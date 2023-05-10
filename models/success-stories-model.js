const mongoose = require("mongoose");

const successStoriesSchema = mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    trim: true,
  },
  categoryId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
    default: "_",
  },
  timeStamp: {
    type: String,
    required: true,
    trim: true,
  },
});

const successStoriesModel = mongoose.model(
  "success-stories",
  successStoriesSchema
);

module.exports = successStoriesModel;

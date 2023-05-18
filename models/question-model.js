const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
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
  question: {
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
    default: "",
    trim: true,
  },
  timestamp: {
    type: String,
    required: true,
    trim: true,
  },
});

const questionModel = mongoose.model("questions", questionSchema);

module.exports = questionModel;

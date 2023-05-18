const mongoose = require("mongoose");

const answerSchema = mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    trim: true,
  },
  questionId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    default: "",
    trim: true,
  },
  image: {
    type: String,
    trim: true,
    default: "",
  },
  timestamp: {
    type: String,
    required: true,
    trim: true,
  },
});

const answerModel = mongoose.model("answers", answerSchema);

module.exports = answerModel;

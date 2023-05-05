const mongoose = require("mongoose");

const answerSchema = mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  questionId: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "questions",
  },
});

const answerModel = mongoose.model("answers", answerSchema);

module.exports = answerModel;

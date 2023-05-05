const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  categoryId: {
    type: String,
    required: true,
    trim: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answers: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "answers",
  },
});

const questionModel = mongoose.model("questions", questionSchema);

module.exports = questionModel;

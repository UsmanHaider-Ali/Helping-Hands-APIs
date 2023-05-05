const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

const categoryModel = mongoose.model("categories", categorySchema);

module.exports = categoryModel;

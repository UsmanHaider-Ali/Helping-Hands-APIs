const mongoose = require("mongoose");

const campaignSchema = mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    trim: true,
  },
  creatorAddress: {
    type: String,
    required: true,
    trim: true,
  },
  campaignAddress: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: "_",
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
  categoryId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    trim: true,
  },
  startingDate: {
    type: Number,
    required: true,
    trim: true,
  },
  endindDate: {
    type: Number,
    required: true,
    trim: true,
  },
  targetAmount: {
    type: Number,
    required: true,
    trim: true,
  },
  raisedAmount: {
    type: Number,
    required: true,
    trim: true,
  },
});

const campaignModel = mongoose.model("campaigns", campaignSchema);

module.exports = campaignModel;

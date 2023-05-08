const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
  wallet_key: {
    type: String,
    default: "_",
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: "_",
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
    enum: [true, false],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
    enum: [true, false],
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  latitude: {
    type: String,
    required: true,
    trim: true,
  },
  longitude: {
    type: String,
    required: true,
    trim: true,
  },
  date_of_birth: {
    type: String,
    required: true,
  },
  user_type: {
    type: String,
    required: true,
    enum: ["_", "Invester", "Entrepreneur", "Charity Organization"],
  },
  password: {
    type: String,
    required: true,
    trim: true,
    select: false,
  },
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
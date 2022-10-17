const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
let Validator = require("validatorjs");

// const multer = require("multer");

const User = require("../models/user-model.js");
const userModel = require("../models/user-model.js");
const validationRules = require("../middlewares/validations.js");

// const imageStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./storage/images/profile/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + file.originalname.replace(/\s/g, "_"));
//   },
// });

// const imageFilter = (req, file, cb) => {
//   if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const uploadImage = multer({
//   storage: imageStorage,
//   limits: {
//     fileSize: 1024 * 1024 * 5,
//   },
//   fileFilter: imageFilter,
// });

//User Registration Controller
exports.registerUser = async (req, res, next) => {
  const {
    wallet_key,
    name,
    email,
    phone,
    address,
    date_of_birth,
    password,
    user_type,
    longitude,
    latitude,
    address_details,
  } = req.body;

  const validation = new Validator(
    {
      wallet_key,
      // image,
      name,
      email,
      phone,
      address,
      date_of_birth,
      password,
      user_type,
      longitude,
      latitude,
      address_details,
    },
    validationRules.registerUserValidation
  );

  if (validation.fails()) {
    res.json({
      message: validation.errors.all(),
      success: false,
    });
    return;
  }

  //   if (req.file.path == null) {
  //     res.json({
  //       message: "The image field is required.",
  //       success: false,
  //     });
  //     return;
  // }

  const user = await userModel.findOne({ email });

  if (user) {
    res.json({
      message: "This email is already registered.",
      success: false,
    });
    return;
  }

  const newPassword = await bcrypt.hash(password, 10);

  if (newPassword == null) {
    res.send({
      message: "Something wrong with password, please try again.",
      success: false,
    });
    return;
  }

  const newUser = new User({
    _id: new mongoose.Types.ObjectId(),
    wallet_key: wallet_key,
    image: req.file.path,
    name: name,
    email: email,
    isEmailVerified: false,
    phone: phone,
    isPhoneVerified: false,
    address: address,
    addressDetails: address_details,
    latitude: latitude,
    longitude: longitude,
    date_of_birth: date_of_birth,
    user_type: user_type,
    password: newPassword,
  });

  const result = await newUser.save();

  if (result == null) {
    res.send({
      message: "Something wrong, please try again.",
      success: true,
    });
    return;
  }

  res.send({
    message: "User registered successfully.",
    success: true,
    data: {
      id: result["_id"],
      wallet_key: result["wallet_key"],
      image: result["image"],
      name: result["name"],
      email: result["email"],
      isEmailVerified: result["isEmailVerified"],
      phone: result["phone"],
      isPhoneVerified: result["isPhoneVerified"],
      address: result["address"],
      date_of_birth: result["date_of_birth"],
      user_type: result["user_type"],
    },
  });
};

//User Login Controller
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const validation = new Validator(
    { email, password },
    validationRules.loginValidations
  );

  if (validation.fails()) {
    res.json({
      message: validation.errors.has("email")
        ? validation.errors.first("email")
        : validation.errors.first("password"),
      success: false,
    });
    return;
  }

  const user = await userModel.findOne({ email }).select("+password");

  if (user == null) {
    res.json({
      message: "User not found.",
      success: false,
    });
    return;
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    res.json({
      message: "Incorrect password.",
      success: false,
    });
    return;
  }

  const newToken = jwt.sign(
    {
      email: user["email"],
      id: user["_id"],
    },
    "key",
    {
      expiresIn: "1h",
    }
  );

  res.json({
    message: "User login successfully.",
    success: true,
    data: {
      id: user["_id"],
      wallet_key: user["wallet_key"],
      image: user["image"],
      name: user["name"],
      email: user["email"],
      isEmailVerified: user["isEmailVerified"],
      phone: user["phone"],
      isPhoneVerified: user["isPhoneVerified"],
      address: user["address"],
      addressDetails: user["addressDetails"],
      latitude: user["latitude"],
      longitude: user["longitude"],
      date_of_birth: user["date_of_birth"],
      user_type: user["user_type"],
      token: newToken,
    },
  });
};

//Social Login Controller
exports.socialLogin = async (req, res, next) => {
  const {
    // wallet_key,
    name,
    email,
    // phone,
    // address,
    // date_of_birth,
    // password,
    // user_type,
    // longitude,
    // latitude,
    // address_details,
  } = req.body;

  const validation = new Validator(
    {
      // wallet_key,
      // image,
      name,
      email,
      // phone,
      // address,
      // date_of_birth,
      // password,
      // user_type,
      // longitude,
      // latitude,
      // address_details,
    },
    validationRules.socialLoginValidation
  );

  if (validation.fails()) {
    res.json({
      message: validation.errors.all(),
      success: false,
    });
    return;
  }

  //   if (req.file.path == null) {
  //     res.json({
  //       message: "The image field is required.",
  //       success: false,
  //     });
  //     return;
  // }

  const user = await userModel.findOne({ email });

  if (user) {
    res.json({
      message: "This email is already registered.",
      success: false,
    });
    return;
  }

  const newUser = new User({
    _id: new mongoose.Types.ObjectId(),
    wallet_key: "_",
    image: "_",
    name: name,
    email: email,
    isEmailVerified: false,
    phone: "_",
    isPhoneVerified: false,
    address: "_",
    addressDetails: "_",
    latitude: "_",
    longitude: "_",
    date_of_birth: "_",
    user_type: "_",
    password: "_",
  });

  const result = await newUser.save();

  if (result == null) {
    res.send({
      message: "Something wrong, please try again.",
      success: true,
    });
    return;
  }

  const newToken = jwt.sign(
    {
      email: result["email"],
      id: result["_id"],
    },
    "key",
    {
      expiresIn: "1h",
    }
  );

  res.send({
    message: "Social login successfully.",
    success: true,
    data: {
      id: result["_id"],
      wallet_key: "_",
      image: "_",
      name: result["name"],
      email: result["email"],
      isEmailVerified: result["isEmailVerified"],
      phone: "_",
      isPhoneVerified: result["isPhoneVerified"],
      address: "_",
      date_of_birth: "_",
      user_type: "_",
      token: newToken,
    },
  });
};

//Send OTP
exports.sendOpt = async (req, res, next) => {
  const { email } = req.body;

  const validation = new Validator(
    { email },
    validationRules.sendOtpValidations
  );

  if (validation.fails()) {
    res.json({
      message: validation.errors.first("email"),
      success: false,
    });
    return;
  }

  const user = await userModel.findOne({ email });

  if (user == null) {
    res.json({
      message: "User not found.",
      success: false,
    });
    return;
  }

  const otp = Math.floor(Math.random() * (999999 - 100000)) + 100000;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_APP_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });

  const mailOption = {
    from: process.env.GOOGLE_APP_EMAIL,
    to: req.body.email,
    subject: "Email Verification Code",
    text: `${otp}`,
  };

  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      res.json({
        message: error,
        success: false,
      });
      return;
    }

    res.json({
      message: "Verification code has sent.",
      success: true,
      data: {
        otp_code: otp,
        email: email,
      },
    });
  });
};

//Verify Email
exports.verifyEmail = async (req, res, next) => {
  const { email } = req.body;

  const validation = new Validator(
    { email },
    validationRules.sendOtpValidations
  );

  if (validation.fails()) {
    res.json({
      message: validation.errors.first("email"),
      success: false,
    });
    return;
  }

  const user = await userModel.findOneAndUpdate(
    { email },
    { isEmailVerified: true },
    { new: true }
  );

  if (user == null) {
    res.json({
      message: "User not found.",
      success: false,
    });
    return;
  }

  res.json({
    message: "Email verified successfully.",
    success: true,
    data: {
      id: user["_id"],
      wallet_key: user["wallet_key"],
      image: user["image"],
      name: user["name"],
      email: user["email"],
      isEmailVerified: user["isEmailVerified"],
      phone: user["phone"],
      isPhoneVerified: user["isPhoneVerified"],
      address: user["address"],
      addressDetails: user["addressDetails"],
      latitude: user["latitude"],
      longitude: user["longitude"],
      date_of_birth: user["date_of_birth"],
      user_type: user["user_type"],
    },
  });
};

//Update Password
exports.updatePassword = async (req, res, next) => {
  const { email, old_password, new_password } = req.body;

  const validation = new Validator(
    { email, old_password, new_password },
    validationRules.updatePassrodValidations
  );

  if (validation.fails()) {
    res.json({
      message: validation.errors.all(),
      success: false,
    });
    return;
  }

  const newPassword = await bcrypt.hash(new_password, 10);

  const user = await userModel
    .findOneAndUpdate({ email }, { password: newPassword }, { new: false })
    .select("+password");

  if (user == null) {
    res.json({
      message: "User not found.",
      success: false,
    });
    return;
  }

  const isPasswordMatched = await bcrypt.compare(old_password, user.password);

  if (!isPasswordMatched) {
    res.json({
      message: "Incorrect old password.",
      success: false,
    });
    return;
  }

  res.json({
    message: "Password updated successfully.",
    success: true,
    data: {
      id: user["_id"],
      wallet_key: user["wallet_key"],
      image: user["image"],
      name: user["name"],
      email: user["email"],
      isEmailVerified: user["isEmailVerified"],
      phone: user["phone"],
      isPhoneVerified: user["isPhoneVerified"],
      address: user["address"],
      addressDetails: user["addressDetails"],
      latitude: user["latitude"],
      longitude: user["longitude"],
      date_of_birth: user["date_of_birth"],
      user_type: user["user_type"],
    },
  });
};

//Reset Password
exports.resetPassword = async (req, res, next) => {
  const { email, new_password } = req.body;

  const validation = new Validator(
    { email, new_password },
    validationRules.resetPasswordValidations
  );

  if (validation.fails()) {
    res.json({
      message: validation.errors.has("email")
        ? validation.errors.first("email")
        : validation.errors.first("new_password"),
      success: false,
    });
    return;
  }

  const newPassword = await bcrypt.hash(new_password, 10);

  const user = await userModel.findOneAndUpdate(
    { email },
    { password: newPassword },
    { new: false }
  );

  if (user == null) {
    res.json({
      message: "User not found.",
      success: false,
    });
    return;
  }

  res.json({
    message: "Password updated successfully.",
    success: true,
  });
};

//Update User
exports.updateUser = async (req, res, next) => {
  const {
    email,
    wallet_key,
    // image,
    name,
    address,
    date_of_birth,
    longitude,
    latitude,
    address_details,
  } = req.body;

  const validation = new Validator(
    {
      email,
      wallet_key,
      // image,
      name,
      address,
      date_of_birth,
      longitude,
      latitude,
      address_details,
    },
    validationRules.updateUserValidation
  );

  if (validation.fails()) {
    res.json({
      message: validation.errors.all(),
      success: false,
    });
    return;
  }

  //   if (req.file.path == null) {
  //     res.json({
  //       message: "The image field is required.",
  //       success: false,
  //     });
  //     return;
  // }
  // console.log(user);

  const user = await userModel.findOneAndUpdate(
    { email },
    {
      wallet_key: wallet_key,
      image: req.file.path,
      name: name,
      address: address,
      date_of_birth: date_of_birth,
      longitude: longitude,
      latitude: latitude,
      addressDetails: address_details,
    },
    { new: true }
  );

  if (user == null) {
    res.json({
      message: "User not found.",
      success: false,
    });
    return;
  }

  res.json({
    message: "User updated successfully.",
    success: true,
    data: {
      id: user["_id"],
      wallet_key: user["wallet_key"],
      image: user["image"],
      name: user["name"],
      email: user["email"],
      isEmailVerified: user["isEmailVerified"],
      phone: user["phone"],
      isPhoneVerified: user["isPhoneVerified"],
      address: user["address"],
      addressDetails: user["addressDetails"],
      latitude: user["latitude"],
      longitude: user["longitude"],
      date_of_birth: user["date_of_birth"],
      user_type: user["user_type"],
    },
  });
};

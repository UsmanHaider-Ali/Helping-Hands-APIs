const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Validator = require("validatorjs");
const fs = require("fs");

const User = require("../models/user-model.js");
const userModel = require("../models/user-model.js");
const validationRules = require("../middlewares/validations.js");
const sendEmail = require("../middlewares/send-mail.js");

//User Registration Controller
exports.registerUser = async (req, res, next) => {
  var imagePath = "";

  if (req.file === undefined) {
    imagePath = "_";
  } else {
    imagePath = req.file.path;
  }

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
  } = req.body;

  const validation = new Validator(
    {
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

  const user = await userModel.findOne({ email });

  if (user) {
    res.json({
      message: "This email is already registered.",
      success: false,
    });
    if (!(req.file === undefined)) {
      var filePath = req.file.path;
      fs.unlinkSync(filePath);
    }
    return;
  }

  const newPassword = await bcrypt.hash(password, 10);

  if (newPassword == null) {
    res.send({
      message: "Something wrong with password, please try again.",
      success: false,
    });
    if (!(req.file === undefined)) {
      var filePath = req.file.path;
      fs.unlinkSync(filePath);
    }
    return;
  }

  const newUser = new User({
    _id: new mongoose.Types.ObjectId(),
    wallet_key: wallet_key,
    image: imagePath,
    name: name,
    email: email,
    isEmailVerified: false,
    phone: phone,
    isPhoneVerified: false,
    address: address,
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
    if (!(req.file === undefined)) {
      var filePath = req.file.path;
      fs.unlinkSync(filePath);
    }
    return;
  }

  sendEmail(
    req,
    res,
    next,
    "User registered, check email for OTP verification."
  );
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

  if (user["isEmailVerified"]) {
    res.json({
      message: "User login successfully.",
      success: true,
      token: newToken,
      user: {
        id: user["_id"],
        wallet_key: user["wallet_key"],
        image: user["image"],
        name: user["name"],
        email: user["email"],
        isEmailVerified: user["isEmailVerified"],
        phone: user["phone"],
        isPhoneVerified: user["isPhoneVerified"],
        address: user["address"],
        latitude: user["latitude"],
        longitude: user["longitude"],
        date_of_birth: user["date_of_birth"],
        user_type: user["user_type"],
      },
    });
    return;
  }

  sendEmail(
    req,
    res,
    next,
    "Email not verified, check email for OTP verification."
  );
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

  const validation = new Validator({ email }, validationRules.emailValidations);

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

  sendEmail(req, res, next, "Check email for OTP verification.");
};

//Verify Email
exports.verifyEmail = async (req, res, next) => {
  const { email } = req.body;

  const validation = new Validator({ email }, validationRules.emailValidations);

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
    // data: {
    //   id: user["_id"],
    //   wallet_key: user["wallet_key"],
    //   image: user["image"],
    //   name: user["name"],
    //   email: user["email"],
    //   isEmailVerified: user["isEmailVerified"],
    //   phone: user["phone"],
    //   isPhoneVerified: user["isPhoneVerified"],
    //   address: user["address"],
    //   latitude: user["latitude"],
    //   longitude: user["longitude"],
    //   date_of_birth: user["date_of_birth"],
    //   user_type: user["user_type"],
    // },
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

  const user = await userModel.findOne({ email }).select("+password");

  if (user == null) {
    res.json({
      message: "User not found.",
      success: false,
    });
    return;
  }

  if (!user.isEmailVerified) {
    sendEmail(
      req,
      res,
      next,
      "Email not verified, check email for OTP verification."
    );
    return;
  }

  const isPasswordMatched = await bcrypt.compare(old_password, user.password);

  if (!isPasswordMatched) {
    if (!isPasswordMatched) {
      res.json({
        message: "Incorrect old password.",
        success: false,
      });
      return;
    }
  }

  const isNewOldPassworSame = await bcrypt.compare(new_password, user.password);
  if (isNewOldPassworSame) {
    res.json({
      message: "Please choose a different password.",
      success: false,
    });
    return;
  }

  const newPassword = await bcrypt.hash(new_password, 10);

  const verifiedUser = await userModel.updateOne(
    { email },
    { password: newPassword },
    { new: false }
  );

  if (verifiedUser.modifiedCount > 0) {
    res.json({
      message: "Password updated successfully.",
      success: true,
    });
    return;
  }
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

  const user = await userModel.findOne({ email }).select("+password");

  if (user == null) {
    res.json({
      message: "User not found.",
      success: false,
    });
    return;
  }

  if (!user.isEmailVerified) {
    sendEmail(
      req,
      res,
      next,
      "Email not verified, check email for OTP verification."
    );
    return;
  }

  const isNewOldPassworSame = await bcrypt.compare(new_password, user.password);
  if (isNewOldPassworSame) {
    res.json({
      message: "Please choose a different password.",
      success: false,
    });
    return;
  }

  const newPassword = await bcrypt.hash(new_password, 10);

  const verifiedUser = await userModel.updateOne(
    { email },
    { password: newPassword },
    { new: false }
  );

  if (verifiedUser.modifiedCount > 0) {
    res.json({
      message: "Password updated successfully.",
      success: true,
    });
    return;
  }
};

//Update User
exports.updateUser = async (req, res, next) => {
  const {
    email,
    wallet_key,
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

  const user = await userModel.findOne({ email });

  if (user == null) {
    res.json({
      message: "User not found.",
      success: false,
    });
    return;
  }

  if (!user.isEmailVerified) {
    sendEmail(
      req,
      res,
      next,
      "Email not verified, check email for OTP verification."
    );
    return;
  }

  // const updatedData =
  //   req.file === undefined
  //     ? {
  //         wallet_key: wallet_key,
  //         name: name,
  //         address: address,
  //         date_of_birth: date_of_birth,
  //         longitude: longitude,
  //         latitude: latitude,
  //       }
  //     : {
  //         wallet_key: wallet_key,
  //         image: req.file.path,
  //         name: name,
  //         address: address,
  //         date_of_birth: date_of_birth,
  //         longitude: longitude,
  //         latitude: latitude,
  //       };

  var updatedUser = null;

  if (req.file === undefined) {
    updatedUser = await userModel.updateOne(
      { email },
      {
        wallet_key: wallet_key,
        name: name,
        address: address,
        date_of_birth: date_of_birth,
        longitude: longitude,
        latitude: latitude,
      },
      { new: true }
    );
  } else {
    updatedUser = await userModel.updateOne(
      { email },
      {
        wallet_key: wallet_key,
        image: req.file.path,
        name: name,
        address: address,
        date_of_birth: date_of_birth,
        longitude: longitude,
        latitude: latitude,
      },
      { new: true }
    );
    if (user != null) {
      var filePath = user.image;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  const updatedUserData = await userModel.findOne({ email });

  res.json({
    message: "User updated successfully.",
    success: true,
    data: {
      _id: updatedUserData["_id"],
      wallet_key: updatedUserData["wallet_key"],
      image: updatedUserData["image"],
      name: updatedUserData["name"],
      email: updatedUserData["email"],
      isEmailVerified: updatedUserData["isEmailVerified"],
      phone: updatedUserData["phone"],
      isPhoneVerified: updatedUserData["isPhoneVerified"],
      address: updatedUserData["address"],
      latitude: updatedUserData["latitude"],
      longitude: updatedUserData["longitude"],
      date_of_birth: updatedUserData["date_of_birth"],
      user_type: updatedUserData["user_type"],
    },
  });
};

const express = require("express");
const routes = express.Router();

const multer = require("multer");

const userController = require("../controllers/user-controllers.js");
const checkAuth = require("../middlewares/check-auth.js");
const uploadImage = require("../middlewares/image-upload.js");

//Registration Route
routes.post(
  "/register-user",
  uploadImage.single("image"),
  userController.registerUser
);

//Login Route
routes.post("/login-user", userController.loginUser);

//Social Login Route
routes.post("/social-login", userController.socialLogin);

//Send OTP
routes.post("/send-otp", userController.sendOpt);

//Verify User/Email
routes.post("/verify-email", userController.verifyEmail);

//Update Password
routes.post("/update-password", userController.updatePassword);

//Reset Password
routes.post("/reset-password", userController.resetPassword);

//Update User
routes.post(
  "/update-user",
  checkAuth,
  uploadImage.single("image"),
  userController.updateUser
);

module.exports = routes;

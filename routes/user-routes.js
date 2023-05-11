const express = require("express");
const routes = express.Router();

const userController = require("../controllers/user-controllers.js");
const checkAuth = require("../middlewares/check-auth.js");
const uploadImage = require("../middlewares/image-upload.js");

routes.post(
  "/register-user",
  uploadImage.single("image"),
  userController.registerUser
);

routes.post("/login-user", userController.loginUser);

routes.post("/social-login", userController.socialLogin);

routes.post("/send-otp", userController.sendOpt);

routes.post("/verify-email", userController.verifyEmail);

routes.post("/update-password", userController.updatePassword);

routes.post("/reset-password", userController.resetPassword);

routes.post(
  "/update-user",
  checkAuth,
  uploadImage.single("image"),
  userController.updateUser
);

module.exports = routes;

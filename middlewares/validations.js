exports.registerUserValidation = {
  wallet_key: "required",
  name: "required",
  email: "required|email",
  phone: "required",
  address: "required",
  date_of_birth: "required",
  password: "required",
  user_type: "required",
  longitude: "required",
  latitude: "required",
};

exports.loginValidations = {
  email: "required|email",
  password: "required",
};

exports.nameValidation = {
  name: "required",
};

exports.questionValidation = {
  question: "required",
  userId: "required",
  categoryId: "required",
};
exports.answerValidation = {
  answer: "required",
  userId: "required",
  questionId: "required",
};

exports.emailValidations = {
  email: "required|email",
};

exports.updatePassrodValidations = {
  email: "required|email",
  old_password: "required",
  new_password: "required",
};

exports.resetPasswordValidations = {
  email: "required|email",
  new_password: "required",
};

exports.updateUserValidation = {
  email: "required|email",
  wallet_key: "required",
  name: "required",
  address: "required",
  date_of_birth: "required",
  longitude: "required",
  latitude: "required",
  address_details: "required",
};

exports.socialLoginValidation = {
  // wallet_key: "required",
  // image: "required",
  name: "required",
  email: "required|email",
  // phone: "required",
  // address: "required",
  // date_of_birth: "required",
  // password: "required",
  // user_type: "required",
  // longitude: "required",
  // latitude: "required",
  // address_details: "required",
};

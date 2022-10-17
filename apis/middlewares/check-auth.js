const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[2];
    const decode = jwt.verify(token, "key");
    req.userData = decode;
    next();
  } catch (error) {
    res.send({
      message: "Authorization failed",
      success: false,
    });
  }
};

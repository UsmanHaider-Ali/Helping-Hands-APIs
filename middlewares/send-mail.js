const nodemailer = require("nodemailer");

const sendEmail = (req, res, next, message) => {
  const { email } = req.body;

  const otp = Math.floor(Math.random() * (999999 - 100000)) + 100000;

  const mailOption = {
    from: process.env.GOOGLE_APP_EMAIL,
    to: email,
    subject: "Email Verification Code",
    text: `${otp}`,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_APP_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });

  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      res.json({
        message: error,
        success: false,
      });
      return;
    }
    
    res.json({
      message: message,
      success: true,
      data: {
        otp_code: otp,
        email: email,
      },
    });
  });
};

module.exports = sendEmail;

const multer = require("multer");

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./storage/images/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname.replace(/\s/g, "_"));
  },
});

const imageFilter = (req, file, cb) => {
  cb(null, true);
};

const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: imageFilter,
});

module.exports = uploadImage;

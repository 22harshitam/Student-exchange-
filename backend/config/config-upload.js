const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
  cb(null, path.join(__dirname, "..", "uploads"));
},
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");

    cb(null, Date.now() + "-" + safeName);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/octet-stream"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};


const upload = multer({ storage, fileFilter });

module.exports = upload;

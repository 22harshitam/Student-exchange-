const express = require("express");
const router = express.Router();
const upload = require("../config/config-upload");

// ================== UPLOAD ROUTE ==================
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `http://127.0.0.1:5001/uploads/${req.file.filename}`;

  res.status(200).json({
    fileName: req.file.originalname,
    fileUrl
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../config/config-upload");
const Library = require("../models/Library");

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    await Library.create({
      title: req.file.originalname,
      cohortName: req.body.cohortId,
      filePath: req.file.path
    });

    res.json({ filePath: req.file.path });
  } catch (err) {
    res.status(500).json({ msg: "Upload failed" });
  }
});

module.exports = router;

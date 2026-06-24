const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const upload = require("../config/config-upload"); // ✅ multer

const {
  sendMessage,
  uploadPdf,
  getResources,
  rateMessage,
  deleteMessage
} = require("../controllers/messageController");

router.get("/library/all", async (req, res) => {
  const resources = await Message.find({ messageType: "pdf" });
  res.json(resources);
});

router.get("/resources/:cohortId", getResources);

// ✅ THIS NOW WORKS
router.post("/upload", upload.single("pdf"), uploadPdf);

router.post("/", sendMessage);
router.post("/rate", rateMessage);
router.post("/delete", deleteMessage);

router.get("/:cohortId", async (req, res) => {
  const messages = await Message.find({ cohortId: req.params.cohortId });
  res.json(messages);
});

module.exports = router;

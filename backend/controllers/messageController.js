const Message = require("../models/Message");
const User = require("../models/User");
const Library = require("../models/Library");
const Cohort = require("../models/Cohort");

/* ================= SEND MESSAGE (TEXT / PDF URL) ================= */
// ❌ No UniPoints here (avoid farming)
exports.sendMessage = async (req, res) => {
  console.log("DEBUG body:", req.body);

  try {
    const {
      cohortId,
      userId,
      userName,
      text,
      messageType = "text",
      fileUrl
    } = req.body;

    // ✅ Validation
    if (messageType === "text" && (!text || text.trim() === "")) {
      return res.status(400).json({ msg: "Message cannot be empty" });
    }

    if (messageType === "pdf" && !fileUrl) {
      return res.status(400).json({ msg: "PDF link required" });
    }

    const msg = await Message.create({
      cohortId,
      userId,
      userName,
      text: messageType === "text" ? text : "",
      messageType,
      fileUrl,
      rating: 0,
      ratedBy: []
    });
     // STEP 3: Save PDF to Free Learning Library
 if (fileUrl)  {
  await Library.create({
    title: fileUrl.split("/").pop(),   // pdf filename
    cohortName: cohortId,              // later we can improve this
    filePath: fileUrl                 // uploads/xyz.pdf
  });
}


    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error sending message" });
  }
};

/* ================= UPLOAD ACTUAL PDF FILE ================= */


exports.uploadPdf = async (req, res) => {
  try {
    const { cohortId, userId, userName } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: "No PDF uploaded" });
    }

    // ✅ IMPORTANT: use PUBLIC filename, not disk path
    const fileName = req.file.filename;

    /* 1️⃣ Save as chat message */
    const message = await Message.create({
      cohortId,
      userId,
      userName,
      messageType: "pdf",
      fileUrl: `/uploads/${fileName}`, // ✅ CORRECT
      text: "",
      rating: 0
    });

    /* 2️⃣ Save to Library */
    const cohort = await Cohort.findById(cohortId);

    await Library.create({
      title: req.file.originalname,
      cohortName: cohort ? cohort.name : "Unknown Cohort",
      filePath: `/uploads/${fileName}` // ✅ CORRECT
    });

    /* 3️⃣ Send response back to chat */
    res.status(200).json(message);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "PDF upload failed" });
  }
};
/* ================= GET MESSAGES ================= */

exports.getMessages = async (req, res) => {
  try {
    const { cohortId } = req.params;

    const messages = await Message.find({ cohortId })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error loading messages" });
  }
};

/* ================= RESOURCE HISTORY (PDFs ONLY) ================= */

exports.getResources = async (req, res) => {
  try {
    const { cohortId } = req.params;

    const resources = await Message.find({
      cohortId,
      messageType: "pdf"
    }).sort({ createdAt: -1 });

    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error loading resources" });
  }
};

/* ================= RATE MESSAGE ================= */
// ⭐ Give UniPoints ONLY here


exports.rateMessage = async (req, res) => {
  try {
    const { messageId, userId } = req.body;

    // ❌ validation
    if (!messageId || !userId) {
      return res.status(400).json({ msg: "Missing data" });
    }

    // 🔹 find message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    // ❌ cannot rate own message
    if (message.userId.toString() === userId) {
      return res.status(400).json({ msg: "Cannot rate your own message" });
    }

    // ❌ already rated
    if (message.ratedBy.includes(userId)) {
      return res.status(400).json({ msg: "Already rated" });
    }

    /* ================= UPDATE MESSAGE ================= */

    message.rating += 1;
    message.ratedBy.push(userId);
    await message.save();

    /* ================= UPDATE USER UNIPOINTS ================= */

    // ⭐ reward message owner
    await User.findByIdAndUpdate(
      message.userId,
      { $inc: { uniPoints: 5 } }, // ⭐ 5 UniPoints per rating
      { new: true }
    );

    /* ================= RESPONSE ================= */

    res.json({
      msg: "Rated successfully",
      rating: message.rating
    });

  } catch (err) {
    console.error("Rate Message Error:", err);
    res.status(500).json({ msg: "Rating failed" });
  }
};

/* ================= DELETE MESSAGE ================= */
// 🗑 only sender can delete their message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId, userId } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    // ❌ only owner can delete
    if (message.userId.toString() !== userId) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    await Message.findByIdAndDelete(messageId);

    // 🔔 notify everyone in cohort
    const io = req.app.get("io");
    io.to(message.cohortId.toString()).emit("messageDeleted", messageId);

    res.json({ msg: "Message deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ msg: "Delete failed" });
  }
};

exports.getPopularCohorts = async (req, res) => {
  try {
    const cohorts = await Cohort.aggregate([
      {
        $addFields: {
          memberCount: { $size: "$members" }
        }
      },
      {
        $sort: { memberCount: -1 }
      },
      {
        $limit: 6
      }
    ]);

    res.json(cohorts);
  } catch (err) {
    console.error("POPULAR COHORT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


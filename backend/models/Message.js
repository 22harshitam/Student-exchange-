const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    cohortId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cohort",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true
    },

    text: String,

    messageType: {
      type: String,
      enum: ["text", "pdf", "link"],
      default: "text"
    },

    fileUrl: String,
    fileName: String,

    linkUrl: String,   // ✅ REQUIRED FOR LINKS

    rating: {
      type: Number,
      default: 0
    },

    ratedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);

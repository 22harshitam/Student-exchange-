const mongoose = require("mongoose");

const CohortSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  // 🔐 who created the cohort
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // 👥 users who joined
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

module.exports = mongoose.model("Cohort", CohortSchema);

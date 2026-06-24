const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {              // 🔑 THIS WAS MISSING
    type: String,
    required: true
  },
  teachSkills: [String],
  learnSkills: [String],
  uniPoints: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("User", userSchema);

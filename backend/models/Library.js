const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema(
  {
    title: String,
    cohortName: String,
    filePath: String
  },
  { timestamps: true } // ✅ THIS LINE IS REQUIRED
);

module.exports = mongoose.model("Library", librarySchema);

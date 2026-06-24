const Library = require("../models/Library");

exports.getAllLibraryFiles = async (req, res) => {
  try {
    const files = await Library.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch library files" });
  }
};

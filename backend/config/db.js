const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("Starting MongoDB connection...");

  try {
    await mongoose.connect(
      "mongodb+srv://harshita:harshita123@cluster0.eddwysp.mongodb.net/unilearn?retryWrites=true&w=majority",
      {
        serverSelectionTimeoutMS: 5000,
      }
    );

    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.log("❌ MongoDB ERROR OCCURRED:");
    console.error(err);
  }
};

module.exports = connectDB;



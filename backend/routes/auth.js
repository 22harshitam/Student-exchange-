const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* ======================
   SIGNUP
====================== */
router.post("/signup", async (req, res) => {
  console.log("SIGNUP BODY:", req.body);

  try {
    let {
      name,
      email,
      password,
      teachSkills = [],
      learnSkills = []
    } = req.body;

    // 🔑 normalize inputs
    name = name?.trim();
    email = email?.trim();
    password = password?.trim();

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password, // TEMP: plain text (safe for now)
      teachSkills,
      learnSkills
    });

    await user.save();

    console.log("USER SAVED:", {
      email: user.email,
      password: JSON.stringify(user.password)
    });

    res.status(201).json({ msg: "Signup successful" });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ======================
   LOGIN
====================== */
router.post("/login", async (req, res) => {
  console.log("LOGIN BODY:", req.body);

  try {
    let { email, password } = req.body;

    // 🔑 normalize inputs
    email = email?.trim();
    password = password?.trim();

    if (!email || !password) {
      return res.status(400).json({ msg: "Missing credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "Invalid email" });
    }

    // 🔍 DEBUG (temporary but important)
    console.log("INPUT PASSWORD:", JSON.stringify(password));
    console.log("DB PASSWORD   :", JSON.stringify(user.password));

    if (password !== user.password) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    res.json({
      userId: user._id,
      userName: user.name,
      uniPoints: user.uniPoints || 0
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

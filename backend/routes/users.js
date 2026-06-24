const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("name uniPoints teachSkills learnSkills");
  res.json(user);
});

router.get("/:id/points", async (req, res) => {
  const user = await User.findById(req.params.id).select("uniPoints");
  res.json({ uniPoints: user.uniPoints });
});

module.exports = router;

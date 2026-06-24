const express = require("express");
const router = express.Router();
const User = require("../models/User");

const {
  createCohort,
  getCohorts,
  joinCohort,
  leaveCohort,
  deleteCohort,
  getMyCohorts,
  getPopularCohorts
} = require("../controllers/cohortController");

// Leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ uniPoints: -1 })
      .limit(10)
      .select("name uniPoints");

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Failed to load leaderboard" });
  }
});

router.post("/create", createCohort);
router.get("/", getCohorts);
router.get("/popular", getPopularCohorts);
router.post("/join", joinCohort);
router.post("/leave", leaveCohort);
router.delete("/:id", deleteCohort);
router.get("/my/:userId", getMyCohorts);

module.exports = router;

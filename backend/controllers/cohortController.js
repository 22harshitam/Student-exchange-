const Cohort = require("../models/Cohort");

/* ================= CREATE COHORT ================= */
exports.createCohort = async (req, res) => {
  try {
    const { name, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ msg: "Name and user required" });
    }

    const cohort = await Cohort.create({
      name,
      createdBy,
      members: [createdBy]
    });

    res.status(201).json(cohort);
  } catch (err) {
    console.error("CREATE COHORT ERROR:", err);
    res.status(500).json({ msg: "Failed to create cohort" });
  }
};

/* ================= GET ALL COHORTS ================= */
exports.getCohorts = async (req, res) => {
  try {
    const cohorts = await Cohort.find();
    res.json(cohorts);
  } catch (err) {
    res.status(500).json({ msg: "Failed to load cohorts" });
  }
};

/* ================= JOIN COHORT ================= */
exports.joinCohort = async (req, res) => {
  try {
    const { cohortId, userId } = req.body;

    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      return res.status(404).json({ msg: "Cohort not found" });
    }

    if (!cohort.members.includes(userId)) {
      cohort.members.push(userId);
      await cohort.save();
    }

    res.json({ msg: "Joined cohort" });
  } catch (err) {
    res.status(500).json({ msg: "Join failed" });
  }
};

/* ================= LEAVE COHORT ================= */
exports.leaveCohort = async (req, res) => {
  try {
    const { cohortId, userId } = req.body;

    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      return res.status(404).json({ msg: "Cohort not found" });
    }

    cohort.members = cohort.members.filter(
      (m) => m.toString() !== userId
    );
    await cohort.save();

    res.json({ msg: "Left cohort" });
  } catch (err) {
    res.status(500).json({ msg: "Leave failed" });
  }
};

/* ================= DELETE COHORT ================= */
exports.deleteCohort = async (req, res) => {
  try {
    const { userId } = req.body;

    const cohort = await Cohort.findById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ msg: "Cohort not found" });
    }

    if (cohort.createdBy.toString() !== userId) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    await Cohort.findByIdAndDelete(req.params.id);
    res.json({ msg: "Cohort deleted" });
  } catch (err) {
    console.error("DELETE COHORT ERROR:", err);
    res.status(500).json({ msg: "Delete failed" });
  }
};

/* ================= USER COHORTS ================= */
exports.getMyCohorts = async (req, res) => {
  try {
    const userId = req.params.userId;

    const created = await Cohort.find({ createdBy: userId });
    const joined = await Cohort.find({ members: userId });

    res.json({ created, joined });
  } catch (err) {
    res.status(500).json({ msg: "Failed to load user cohorts" });
  }
};

/* ================= POPULAR COHORTS ================= */
exports.getPopularCohorts = async (req, res) => {
  try {
    const cohorts = await Cohort.find()
      .sort({ "members.length": -1 })
      .limit(5);

    res.json(cohorts);
  } catch (err) {
    res.status(500).json({ msg: "Failed to load popular cohorts" });
  }
};

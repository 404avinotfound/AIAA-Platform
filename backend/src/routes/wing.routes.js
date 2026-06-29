const express = require("express");
const Wing = require("../models/Wing");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const wings = await Wing.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ wings });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const wing = await Wing.findOne({ slug: req.params.slug });
    if (!wing) return res.status(404).json({ message: "Wing not found" });
    res.json({ wing });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const wing = await Wing.create(req.body);
    res.status(201).json({ wing });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const wing = await Wing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!wing) return res.status(404).json({ message: "Wing not found" });
    res.json({ wing });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    await Wing.findByIdAndDelete(req.params.id);
    res.json({ message: "Wing deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

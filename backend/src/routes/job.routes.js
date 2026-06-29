const express = require("express");
const Job = require("../models/Job");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { syncGovernmentJobs } = require("../services/jobSync.service");

const router = express.Router();

// GET /api/jobs?search=&location=&page=&size=
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const { search, location, page = 0, size = 12 } = req.query;
    const filter = {};
    if (search) filter.$text = { $search: search };
    if (location) filter.location = location;

    const jobs = await Job.find(filter)
      .sort({ publishedAt: -1 })
      .skip(Number(page) * Number(size))
      .limit(Number(size));

    const total = await Job.countDocuments(filter);
    res.json({ jobs, total });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id
router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ job });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/bookmark
router.post("/:id/bookmark", requireAuth, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const alreadyBookmarked = job.bookmarkedBy.some((id) => id.equals(req.user._id));
    if (alreadyBookmarked) {
      job.bookmarkedBy.pull(req.user._id);
    } else {
      job.bookmarkedBy.push(req.user._id);
    }
    await job.save();
    res.json({ bookmarked: !alreadyBookmarked });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/manual - admin adds a manual job listing
router.post("/manual", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, isManual: true, isGovernmentJob: req.body.isGovernmentJob ?? true });
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/sync-now - admin manually triggers an NCS sync instead of waiting for the cron job
router.post("/sync-now", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const count = await syncGovernmentJobs();
    res.json({ message: `Synced ${count} jobs from NCS` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

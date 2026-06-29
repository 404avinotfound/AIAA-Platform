const express = require("express");
const Announcement = require("../models/Announcement");
const { requireAuth } = require("../middleware/auth");
const { requireRole, requireActiveMember } = require("../middleware/role");

const router = express.Router();

// GET /api/announcements - members-only announcement feed
router.get("/", requireAuth, requireActiveMember, async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate("postedBy", "fullName")
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ announcements });
  } catch (err) {
    next(err);
  }
});

// POST /api/announcements - admin/moderator publishes a new announcement
router.post("/", requireAuth, requireRole("admin", "super_admin", "moderator"), async (req, res, next) => {
  try {
    const { title, body, isPinned } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    const announcement = await Announcement.create({
      title,
      body,
      isPinned: isPinned === true || isPinned === "true",
      postedBy: req.user._id,
    });

    res.status(201).json({ announcement });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/announcements/:id - admin/moderator removes an announcement
router.delete("/:id", requireAuth, requireRole("admin", "super_admin", "moderator"), async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement removed" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

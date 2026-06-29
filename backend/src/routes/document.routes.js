const express = require("express");
const Document = require("../models/Document");
const Member = require("../models/Member");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { uploadDocument } = require("../middleware/upload");

const router = express.Router();

// GET /api/documents - public Side Wing / Resources list.
// "Members only" documents are hidden unless the caller is an active member
// (or staff). optionalAuth attaches req.user when a valid token is present,
// but never blocks the request, so this still works for logged-out visitors.
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    let canSeeMembersOnly = false;
    if (req.user) {
      if (["admin", "super_admin", "moderator"].includes(req.user.role)) {
        canSeeMembersOnly = true;
      } else {
        const member = await Member.findOne({ user: req.user._id });
        canSeeMembersOnly = member?.status === "active";
      }
    }
    if (!canSeeMembersOnly) filter.membersOnly = { $ne: true };

    const documents = await Document.find(filter).sort({ isPinned: -1, createdAt: -1 });
    res.json({ documents });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("admin", "super_admin", "moderator"),
  uploadDocument.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: "A PDF file (max 250KB) is required" });

      const document = await Document.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        isPinned: req.body.isPinned === "true",
        membersOnly: req.body.membersOnly === "true" || req.body.membersOnly === true,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        uploadedBy: req.user._id,
      });

      res.status(201).json({ document });
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Document removed" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require("express");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const Member = require("../models/Member");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const { requireRole, requireActiveMember } = require("../middleware/role");
const { uploadGeneral, fileUrl } = require("../middleware/upload");

const router = express.Router();

// GET /api/community/users/:userId/questions - legal queries asked by a
// specific member, shown on their profile page. Anonymous questions are
// excluded since they're not meant to be tied back to the asker's identity.
router.get("/users/:userId/questions", async (req, res, next) => {
  try {
    const questions = await Question.find({ author: req.params.userId, isAnonymous: false })
      .select("title status createdAt views upvotes")
      .sort({ createdAt: -1 });
    res.json({ questions });
  } catch (err) {
    next(err);
  }
});

// GET /api/community/questions?search=&tag=&status=&page=&size=
router.get("/questions", optionalAuth, async (req, res, next) => {
  try {
    const { search, tag, status, page = 0, size = 15 } = req.query;
    const filter = {};
    if (search) filter.$text = { $search: search };
    if (tag) filter.tags = tag;
    if (status) filter.status = status;

    const questions = await Question.find(filter)
      .populate("author", "fullName avatarUrl headline")
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(Number(page) * Number(size))
      .limit(Number(size));

    const total = await Question.countDocuments(filter);
    res.json({ questions, total });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/questions - ask a question, optionally with document/image attachments
router.post("/questions", requireAuth, uploadGeneral.array("attachments", 5), async (req, res, next) => {
  try {
    const { title, body, tags, isAnonymous } = req.body;
    const attachments = (req.files || []).map((f) => ({
      url: fileUrl(f),
      fileName: f.originalname,
      fileType: f.mimetype,
    }));

    const question = await Question.create({
      author: req.user._id,
      title,
      body,
      tags: tags ? String(tags).split(",").map((t) => t.trim()).filter(Boolean) : [],
      isAnonymous: isAnonymous === "true" || isAnonymous === true,
      attachments,
    });

    res.status(201).json({ question });
  } catch (err) {
    next(err);
  }
});

// GET /api/community/questions/:id - question detail with its answers
router.get("/questions/:id", optionalAuth, async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author", "fullName avatarUrl headline");

    if (!question) return res.status(404).json({ message: "Question not found" });

    const answers = await Answer.find({ question: question._id, isModeratorApproved: true })
      .populate("author", "fullName avatarUrl headline role")
      .sort({ createdAt: 1 });

    const activeMembers = await Member.find({
      user: { $in: answers.map((a) => a.author?._id).filter(Boolean) },
      status: "active",
    }).select("user");
    const activeMemberIds = new Set(activeMembers.map((m) => String(m.user)));

    const answersWithBadge = answers.map((a) => ({
      ...a.toObject(),
      authorIsMember: activeMemberIds.has(String(a.author?._id)),
    }));

    res.json({ question, answers: answersWithBadge });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/questions/:id/answers - only active AIAA members (or
// staff) may answer a legal query
router.post(
  "/questions/:id/answers",
  requireAuth,
  requireActiveMember,
  uploadGeneral.array("attachments", 5),
  async (req, res, next) => {
    try {
      const question = await Question.findById(req.params.id);
      if (!question) return res.status(404).json({ message: "Question not found" });

      const attachments = (req.files || []).map((f) => ({
        url: fileUrl(f),
        fileName: f.originalname,
        fileType: f.mimetype,
      }));

      const answer = await Answer.create({
        question: question._id,
        author: req.user._id,
        body: req.body.body,
        attachments,
      });

      if (question.status === "open") {
        question.status = "answered";
        await question.save();
      }

      res.status(201).json({ answer });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/community/questions/:id/answers/:answerId - admin/moderator
// removes a single answer (lets staff monitor and moderate the Q&A board).
router.delete(
  "/questions/:id/answers/:answerId",
  requireAuth,
  requireRole("admin", "super_admin", "moderator"),
  async (req, res, next) => {
    try {
      const answer = await Answer.findOneAndDelete({ _id: req.params.answerId, question: req.params.id });
      if (!answer) return res.status(404).json({ message: "Answer not found" });

      const question = await Question.findById(req.params.id);
      if (question && String(question.acceptedAnswer) === req.params.answerId) {
        question.acceptedAnswer = null;
        await question.save();
      }

      res.json({ message: "Answer removed" });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/community/questions/:id/accept/:answerId - author marks an answer as accepted
router.post("/questions/:id/accept/:answerId", requireAuth, async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    if (!question.author.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the question author can accept an answer" });
    }
    question.acceptedAnswer = req.params.answerId;
    await question.save();
    res.json({ question });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/questions/:id/upvote
router.post("/questions/:id/upvote", requireAuth, async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const alreadyUpvoted = question.upvotes.some((id) => id.equals(req.user._id));
    if (alreadyUpvoted) question.upvotes.pull(req.user._id);
    else question.upvotes.push(req.user._id);

    await question.save();
    res.json({ upvoted: !alreadyUpvoted, count: question.upvotes.length });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/community/questions/:id - admin/moderator removes a question and its answers
router.delete(
  "/questions/:id",
  requireAuth,
  requireRole("admin", "super_admin", "moderator"),
  async (req, res, next) => {
    try {
      const question = await Question.findByIdAndDelete(req.params.id);
      if (!question) return res.status(404).json({ message: "Question not found" });
      await Answer.deleteMany({ question: question._id });
      res.json({ message: "Question and its answers removed" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

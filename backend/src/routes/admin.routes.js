const express = require("express");
const User = require("../models/User");
const Member = require("../models/Member");
const Job = require("../models/Job");
const Question = require("../models/Question");
const Payment = require("../models/Payment");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { activateMembership } = require("../services/membership.service");

const router = express.Router();

router.get("/summary", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const [totalUsers, totalMembers, activeMembers, pendingMembers, totalJobs, totalQuestions, revenue] =
      await Promise.all([
        User.countDocuments(),
        Member.countDocuments(),
        Member.countDocuments({ status: "active" }),
        Member.countDocuments({ status: "pending_payment" }),
        Job.countDocuments(),
        Question.countDocuments(),
        Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      ]);

    res.json({
      totalUsers,
      totalMembers,
      activeMembers,
      pendingMembers,
      totalJobs,
      totalQuestions,
      totalRevenuePaise: revenue[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
router.get("/users", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const { search, page = 0, size = 20 } = req.query;
    const filter = search
      ? { $or: [{ fullName: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] }
      : {};

    const users = await User.find(filter)
      .select("-passwordHash -refreshTokens -otpCode")
      .skip(Number(page) * Number(size))
      .limit(Number(size))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    const members = await Member.find({ user: { $in: users.map((u) => u._id) } }).select(
      "user membershipType plan status membershipNumber"
    );
    const memberByUser = new Map(members.map((m) => [String(m.user), m]));

    const enriched = users.map((u) => ({
      ...u.toObject(),
      membership: memberByUser.get(String(u._id)) || null,
    }));

    res.json({ users: enriched, total });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/block - suspend or reinstate a user account
router.patch("/users/:id/block", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot block your own account" });
    }
    const { isBlocked, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: !!isBlocked, blockedReason: isBlocked ? reason || "" : "" },
      { new: true }
    ).select("-passwordHash -refreshTokens -otpCode");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users/:id/grant-lifetime - comp a lifetime membership without payment
router.post("/users/:id/grant-lifetime", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const { membershipType } = req.body;
    const member = await activateMembership(req.params.id, { plan: "lifetime", membershipType });
    res.json({ message: "Lifetime membership granted", member });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users/:id/revoke-membership - turn off an active membership
// (e.g. undoing a comped lifetime grant). Keeps the Member record/history,
// it just stops counting as active.
router.post("/users/:id/revoke-membership", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const member = await Member.findOneAndUpdate(
      { user: req.params.id },
      { status: "suspended" },
      { new: true }
    ).populate("user", "fullName email");
    if (!member) return res.status(404).json({ message: "This user has no membership to revoke." });
    res.json({ message: "Membership revoked", member });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

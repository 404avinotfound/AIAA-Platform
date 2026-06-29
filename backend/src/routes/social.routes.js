const express = require("express");
const User = require("../models/User");
const Member = require("../models/Member");
const Leader = require("../models/Leader");
const { Conversation, Message } = require("../models/Chat");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/social/search?q= - find members/users by name for the Header
// search bar. Returns each match's active-membership status so the results
// page can show a "Verified Member" badge.
router.get("/search", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ users: [] });

    const matches = await User.find({ fullName: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") })
      .select("fullName avatarUrl headline role")
      .limit(30);

    const members = await Member.find({
      user: { $in: matches.map((u) => u._id) },
      status: "active",
    }).select("user plan membershipType");
    const memberByUser = new Map(members.map((m) => [String(m.user), m]));

    const users = matches.map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      headline: u.headline,
      isMember: memberByUser.has(String(u._id)),
      plan: memberByUser.get(String(u._id))?.plan || null,
    }));

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// POST /api/social/follow/:userId
router.post("/follow/:userId", requireAuth, async (req, res, next) => {
  try {
    if (req.params.userId === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    const target = await User.findById(req.params.userId);
    if (!target) return res.status(404).json({ message: "User not found" });

    const alreadyFollowing = req.user.following.some((id) => id.equals(target._id));

    if (alreadyFollowing) {
      req.user.following.pull(target._id);
      target.followers.pull(req.user._id);
    } else {
      req.user.following.push(target._id);
      target.followers.push(req.user._id);
    }

    await req.user.save();
    await target.save();

    res.json({ following: !alreadyFollowing });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/:userId/profile - basic public profile info, plus
// membership/practice details and a leadership badge when applicable.
router.get("/:userId/profile", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "fullName avatarUrl headline bio role phone createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const member = await Member.findOne({ user: user._id })
      .select("status plan membershipType courtOfPractice areaOfPractice state district executivePositionInterested preferredWing")
      .populate("preferredWing", "name");

    const membership =
      member && member.status === "active"
        ? {
            plan: member.plan,
            membershipType: member.membershipType,
            courtOfPractice: member.courtOfPractice,
            areaOfPractice: member.areaOfPractice,
            state: member.state,
            district: member.district,
            designation: member.executivePositionInterested,
            wing: member.preferredWing?.name || null,
          }
        : null;

    const leadership = await Leader.findOne({ user: user._id, isVisible: true }).select("designation tier state");

    res.json({ user, membership, leadership: leadership || null });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/:userId/followers
router.get("/:userId/followers", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate("followers", "fullName avatarUrl headline");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ followers: user.followers });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/:userId/following
router.get("/:userId/following", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate("following", "fullName avatarUrl headline");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ following: user.following });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/unread-count - total unread messages across all of the
// caller's conversations, shown as a badge on the Header's notification bell.
router.get("/unread-count", requireAuth, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id }).select("_id");
    const count = await Message.countDocuments({
      conversation: { $in: conversations.map((c) => c._id) },
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/conversations - list the logged-in user's chats
router.get("/conversations", requireAuth, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "fullName avatarUrl")
      .sort({ lastMessageAt: -1 });
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
});

// POST /api/social/conversations/:userId - start or fetch a 1:1 conversation
// You must follow someone before you can start a conversation with them
// (this only applies to creating a brand-new conversation - once a thread
// exists, either side can keep replying even if the follow is later removed).
router.post("/conversations/:userId", requireAuth, async (req, res, next) => {
  try {
    if (req.params.userId === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, req.params.userId], $size: 2 },
    });

    if (!conversation) {
      const isFollowing = req.user.following.some((id) => id.equals(req.params.userId));
      if (!isFollowing) {
        return res.status(403).json({ message: "Follow this member first to send them a message." });
      }

      const target = await User.findById(req.params.userId);
      if (!target) return res.status(404).json({ message: "User not found" });

      conversation = await Conversation.create({ participants: [req.user._id, req.params.userId] });
    }

    res.json({ conversation });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/conversations/:id/messages
router.get("/conversations/:id/messages", requireAuth, async (req, res, next) => {
  try {
    const messages = await Message.find({ conversation: req.params.id })
      .populate("sender", "fullName avatarUrl")
      .sort({ createdAt: 1 });

    // Opening a conversation marks its messages as read for this user,
    // which clears the unread badge on the Header's notification bell.
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $push: { readBy: req.user._id } }
    );

    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// POST /api/social/conversations/:id/messages - the realtime broadcast happens via Socket.IO in server.js
// POST /api/social/conversations/:id/messages
router.post("/conversations/:id/messages", requireAuth, async (req, res, next) => {
  try {
    // Create the message
    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      text: req.body.text,
      attachmentUrl: req.body.attachmentUrl,
      readBy: [req.user._id],
    });

    // Populate sender so the frontend immediately knows who sent it
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "fullName avatarUrl");

    // Update conversation preview
    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage: req.body.text,
      lastMessageAt: new Date(),
    });

    // Broadcast to everyone in the room (including sender)
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${req.params.id}`).emit(
        "new_message",
        populatedMessage
      );
    }

    // Return populated message
    res.status(201).json({
      message: populatedMessage,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

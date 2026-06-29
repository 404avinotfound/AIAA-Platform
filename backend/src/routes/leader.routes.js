const express = require("express");
const Leader = require("../models/Leader");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { tier, user } = req.query;
    const filter = { isVisible: true };
    if (tier) filter.tier = tier;
    if (user) filter.user = user;
    const leaders = await Leader.find(filter).sort({ displayOrder: 1 });
    res.json({ leaders });
  } catch (err) {
    next(err);
  }
});

// Resolves an optional "linked account" email into a User id, so the
// leadership card on the public site can link to that person's real
// profile. Leaves `user` untouched if no email was sent, and clears it if
// an empty string was explicitly sent.
async function resolveLinkedUser(req, res, next) {
  try {
    const { userEmail } = req.body;
    if (userEmail === undefined) {
      req.body.user = undefined;
    } else if (!userEmail) {
      req.body.user = null;
    } else {
      const account = await User.findOne({ email: userEmail.toLowerCase().trim() }).select("_id");
      if (!account) {
        return res.status(400).json({ message: `No registered user found with the email "${userEmail}".` });
      }
      req.body.user = account._id;
    }
    delete req.body.userEmail;
    next();
  } catch (err) {
    next(err);
  }
}

router.post("/", requireAuth, requireRole("admin", "super_admin"), resolveLinkedUser, async (req, res, next) => {
  try {
    const leader = await Leader.create(req.body);
    res.status(201).json({ leader });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireRole("admin", "super_admin"), resolveLinkedUser, async (req, res, next) => {
  try {
    const leader = await Leader.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!leader) return res.status(404).json({ message: "Leader not found" });
    res.json({ leader });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    await Leader.findByIdAndDelete(req.params.id);
    res.json({ message: "Leader removed" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const Member = require("../models/Member");

function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
}

// Lets admins/moderators through automatically; everyone else must have an
// active Member record (an approved, paid-up membership plan). Used to gate
// member-only actions like answering legal queries or viewing the
// Membership Hub.
async function requireActiveMember(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (["admin", "super_admin", "moderator"].includes(req.user.role)) return next();

  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member || member.status !== "active") {
      return res.status(403).json({
        message: "Only active AIAA members with a membership plan can do this. Apply for membership or complete your payment first.",
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireRole, requireActiveMember };

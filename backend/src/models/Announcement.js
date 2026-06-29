const mongoose = require("mongoose");

// Announcements are only ever shown to active members (and staff) via the
// requireActiveMemberOrStaff check in announcement.routes.js - there is no
// "public" announcement concept in this model.
const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);

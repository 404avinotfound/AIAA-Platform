const mongoose = require("mongoose");

const LeaderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true }, // e.g. "Patron in Chief", "State Director"
    tier: {
      type: String,
      enum: [
        "patron_in_chief",
        "pioneer",
        "national_head",
        "board_of_national_directors",
        "supreme_court_coordinator",
        "state_director",
        "high_court_coordinator",
        "state_ceo",
        "district_court_coordinator",
        "executive_member",
      ],
      default: "executive_member",
    },
    photoUrl: String,
    state: String,
    email: String,
    phone: String,
    // Optional link to a registered user account, set by the admin when
    // adding/editing a leader. When present, the leadership card on the
    // public site links to /members/:user.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String, // their personal message, shown via "Read More"
    description: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
    },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leader", LeaderSchema);

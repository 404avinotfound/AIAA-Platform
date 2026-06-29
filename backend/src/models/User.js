const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: [
        "member",
        "moderator",
        "state_head",
        "district_head",
        "admin",
        "super_admin",
      ],
      default: "member",
    },

    state: { type: String },
    district: { type: String },

    isVerified: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },

    twoFactorEnabled: { type: Boolean, default: false },

    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String },

    refreshTokens: [{ type: String }],

    avatarUrl: { type: String },
    headline: { type: String }, // short professional tagline, like LinkedIn
    bio: { type: String },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

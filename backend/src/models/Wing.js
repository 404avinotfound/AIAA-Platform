const mongoose = require("mongoose");

const WingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, default: "⚖" },
    purpose: { type: String },
    objectives: [{ type: String }],
    rolesAndFunctions: [{ type: String }],
    mission: { type: String },

    committeeMembers: [
      {
        name: String,
        designation: String,
        photoUrl: String,
      },
    ],

    news: [
      {
        title: String,
        content: String,
        publishedAt: { type: Date, default: Date.now },
      },
    ],

    galleryImages: [{ type: String }],
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wing", WingSchema);

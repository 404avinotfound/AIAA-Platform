const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    sourceJobId: { type: String, index: true }, // ID from NCS API, absent for manual jobs
    title: { type: String, required: true },
    organization: String,
    description: String,
    vacancies: Number,
    location: [{
      city: String,
      state: String,
      country: String,
      pincode: String,
      latitude: Number,
      longitude: Number,
      isprimary: { type: Boolean, default: true },
    }],
    education: [{
      degree: String,
      educationType: String,
      specialization: String,
    }],
    experience: String,
    minAge: Number,
    maxAge: Number,
    minSalary: Number,
    maxSalary: Number,
    skills: [String],
    applyLink: String,
    jobType: String,
    isGovernmentJob: { type: Boolean, default: true },
    publishedAt: Date,
    expiresAt: Date,
    isManual: { type: Boolean, default: false }, // true if added by admin, not from NCS sync
    bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

JobSchema.index({ title: "text", organization: "text", description: "text" });

module.exports = mongoose.model("Job", JobSchema);

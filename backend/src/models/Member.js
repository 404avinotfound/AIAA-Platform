const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    membershipNumber: { type: String, unique: true, sparse: true },
    qrCode: { type: String }, // data URL or storage URL for QR

    membershipType: {
      type: String,
      enum: [
        "advocate",
        "legal_aspirant",
        "law_student",
        "law_firm",
        "institution",
        "corporate_member",
        "honorary_member",
        "life_member",
        "national_member",
        "state_member",
        "district_member",
      ],
      required: true,
    },

    plan: {
      type: String,
      enum: ["annual", "lifetime", "premium", "student", "corporate"],
      default: "annual",
    },

    status: {
      type: String,
      enum: ["pending_payment", "active", "expired", "rejected", "suspended", "resubmission_required"],
      default: "pending_payment",
    },

    fatherName: String,
    motherName: String,
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: Date,
    bloodGroup: String,

    alternatePhone: String,
    address: String,
    city: String,
    district: String,
    state: String,
    pin: String,

    enrollmentNumber: String,
    barCouncil: String,
    courtOfPractice: String,
    areaOfPractice: String,
    experienceYears: Number,
    education: String,

    preferredWing: { type: mongoose.Schema.Types.ObjectId, ref: "Wing" },
    executivePositionInterested: String,

    profilePhotoUrl: String,
    govtIdUrl: String,
    advocateIdUrl: String,
    enrollmentCertificateUrl: String,
    signatureUrl: String,

    emergencyContactName: String,
    emergencyContactPhone: String,

    termsAccepted: { type: Boolean, default: false },

    issueDate: Date,
    expiryDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", MemberSchema);

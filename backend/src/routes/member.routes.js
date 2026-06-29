const express = require("express");
const Member = require("../models/Member");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { uploadMembershipFiles, enforceMembershipFileSizes } = require("../middleware/upload");

const router = express.Router();

// POST /api/members - submit membership application (logged-in user)
router.post(
  "/",
  requireAuth,
  uploadMembershipFiles.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "govtId", maxCount: 1 },
    { name: "advocateId", maxCount: 1 },
    { name: "enrollmentCertificate", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  enforceMembershipFileSizes,
  async (req, res, next) => {
    try {
      const existing = await Member.findOne({ user: req.user._id });
      if (existing && existing.status !== "resubmission_required") {
        return res.status(409).json({ message: "You already have a membership application on file" });
      }

      const files = req.files || {};
      const fileUrl = (field) => (files[field]?.[0] ? `/uploads/${files[field][0].filename}` : undefined);

      const payload = {
        membershipType: req.body.membershipType,
        plan: req.body.plan || "annual",
        fatherName: req.body.fatherName,
        motherName: req.body.motherName,
        gender: req.body.gender,
        dob: req.body.dob,
        bloodGroup: req.body.bloodGroup,
        alternatePhone: req.body.alternatePhone,
        address: req.body.address,
        city: req.body.city,
        district: req.body.district,
        state: req.body.state,
        pin: req.body.pin,
        enrollmentNumber: req.body.enrollmentNumber,
        barCouncil: req.body.barCouncil,
        courtOfPractice: req.body.courtOfPractice,
        areaOfPractice: req.body.areaOfPractice,
        experienceYears: req.body.experienceYears,
        education: req.body.education,
        preferredWing: req.body.preferredWing || undefined,
        executivePositionInterested: req.body.executivePositionInterested,
        emergencyContactName: req.body.emergencyContactName,
        emergencyContactPhone: req.body.emergencyContactPhone,
        termsAccepted: req.body.termsAccepted === "true" || req.body.termsAccepted === true,
        profilePhotoUrl: fileUrl("profilePhoto"),
        govtIdUrl: fileUrl("govtId"),
        advocateIdUrl: fileUrl("advocateId"),
        enrollmentCertificateUrl: fileUrl("enrollmentCertificate"),
        signatureUrl: fileUrl("signature"),
      };

      let member;
      if (existing) {
        // Resubmission after the admin asked the member to refill the form:
        // overwrite the previous answers/files and send it back for review.
        Object.assign(existing, payload, { status: "pending_payment" });
        member = await existing.save();
      } else {
        member = await Member.create({ user: req.user._id, ...payload });
      }

      res.status(201).json({ member });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/members/me
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id }).populate("preferredWing", "name slug");
    res.json({ member });
  } catch (err) {
    next(err);
  }
});

// GET /api/members - admin list with filters
router.get("/", requireAuth, requireRole("admin", "super_admin", "state_head", "district_head"), async (req, res, next) => {
  try {
    const { status, membershipType, state, page = 0, size = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (membershipType) filter.membershipType = membershipType;
    if (state) filter.state = state;

    const members = await Member.find(filter)
      .populate("user", "fullName email phone")
      .skip(Number(page) * Number(size))
      .limit(Number(size))
      .sort({ createdAt: -1 });

    const total = await Member.countDocuments(filter);
    res.json({ members, total });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/members/:id/status - admin approves/rejects/activates a member
router.patch("/:id/status", requireAuth, requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    const member = await Member.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json({ member });
  } catch (err) {
    next(err);
  }
});

// GET /api/members/verify/:membershipNumber - public verification page data
router.get("/verify/:membershipNumber", async (req, res, next) => {
  try {
    const member = await Member.findOne({ membershipNumber: req.params.membershipNumber }).populate(
      "user",
      "fullName avatarUrl"
    );
    if (!member) return res.status(404).json({ message: "Membership number not found" });

    res.json({
      fullName: member.user.fullName,
      photoUrl: member.profilePhotoUrl,
      status: member.status,
      membershipType: member.membershipType,
      issueDate: member.issueDate,
      expiryDate: member.expiryDate,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

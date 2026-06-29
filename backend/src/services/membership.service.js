const Member = require("../models/Member");
const generateMembershipNumber = require("../utils/generateMembershipId");
const { generateQrDataUrl } = require("../utils/qrcode");

// Activates (or creates + activates) a membership for a user. Used both when
// a Razorpay payment is verified, and when an admin manually grants a
// membership (e.g. comping a lifetime membership) without going through payment.
async function activateMembership(userId, { plan = "lifetime", membershipType } = {}) {
  let member = await Member.findOne({ user: userId });

  if (!member) {
    member = await Member.create({
      user: userId,
      membershipType: membershipType || "honorary_member",
      plan,
      status: "pending_payment",
    });
  }

  const membershipNumber = member.membershipNumber || (await generateMembershipNumber());
  const issueDate = member.issueDate || new Date();
  const expiryDate =
    plan === "lifetime" ? null : new Date(issueDate.getFullYear() + 1, issueDate.getMonth(), issueDate.getDate());
  const qrCode = member.qrCode || (await generateQrDataUrl(membershipNumber));

  member.membershipNumber = membershipNumber;
  member.plan = plan;
  if (membershipType) member.membershipType = membershipType;
  member.status = "active";
  member.issueDate = issueDate;
  member.expiryDate = expiryDate;
  member.qrCode = qrCode;
  await member.save();

  return member.populate("user", "fullName email");
}

module.exports = { activateMembership };

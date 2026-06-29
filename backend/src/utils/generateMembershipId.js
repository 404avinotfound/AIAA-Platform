const Member = require("../models/Member");

// Format: AIAA-2026-000123
async function generateMembershipNumber() {
  const year = new Date().getFullYear();
  const count = await Member.countDocuments({ membershipNumber: { $exists: true, $ne: null } });
  const next = String(count + 1).padStart(6, "0");
  return `AIAA-${year}-${next}`;
}

module.exports = generateMembershipNumber;

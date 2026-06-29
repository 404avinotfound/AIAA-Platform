require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");
const Wing = require("../src/models/Wing");
const User = require("../src/models/User");
const Leader = require("../src/models/Leader");

const wings = [
  {
    name: "RTI & PIL Council",
    slug: "rti-pil-council",
    purpose:
      "To promote transparency, accountability, constitutional governance, and public welfare through the effective use of the Right to Information Act and Public Interest Litigation.",
    rolesAndFunctions: [
      "Assist members in drafting and filing RTI applications.",
      "Promote transparency and accountability in public institutions.",
      "Identify issues affecting public interest and constitutional rights.",
      "Conduct legal research for Public Interest Litigations.",
      "Organize workshops on RTI, PIL, and Constitutional Remedies.",
      "Collaborate with civil society organizations on governance-related issues.",
      "Monitor implementation of welfare schemes and public policies.",
      "Develop model RTI applications and PIL petitions.",
    ],
    displayOrder: 1,
  },
  {
    name: "Litigation Resourcing & Case Management Cell",
    slug: "litigation-resourcing-case-management",
    purpose: "To provide litigation support, resource sharing, legal research, and professional assistance to advocates.",
    rolesAndFunctions: [
      "Maintain a database of legal precedents and research materials.",
      "Facilitate coordination among advocates handling multi-jurisdictional matters.",
      "Provide drafting assistance for pleadings, petitions, and legal notices.",
      "Develop standard templates and legal formats.",
      "Assist in case tracking and management.",
      "Promote collaboration among members for specialized legal matters.",
      "Organize legal research teams for important cases.",
      "Create a repository of judgments and legal resources.",
    ],
    displayOrder: 2,
  },
  {
    name: "Legal Aid & Human Rights Protection Council",
    slug: "legal-aid-human-rights",
    purpose: "To ensure access to justice and promote the protection of fundamental and human rights.",
    rolesAndFunctions: [
      "Organize legal aid camps and awareness programs.",
      "Provide pro bono legal assistance to needy persons.",
      "Monitor human rights violations and assist affected individuals.",
      "Conduct awareness campaigns on constitutional and legal rights.",
      "Support vulnerable communities through legal intervention.",
      "Coordinate with NGOs and social organizations.",
      "Promote gender justice, child rights, and social welfare initiatives.",
      "Prepare reports and recommendations on human rights issues.",
    ],
    displayOrder: 3,
  },
  {
    name: "Arbitration & ADR Council",
    slug: "arbitration-adr-council",
    purpose: "To promote Alternative Dispute Resolution mechanisms as efficient and cost-effective means of dispute settlement.",
    rolesAndFunctions: [
      "Promote arbitration, mediation, conciliation, and negotiation.",
      "Conduct ADR training and certification programs.",
      "Develop a panel of arbitrators, mediators, and conciliators.",
      "Facilitate pre-litigation settlement mechanisms.",
      "Organize national and international ADR conferences.",
      "Promote institutional arbitration practices.",
      "Assist parties in dispute resolution proceedings.",
      "Publish research and updates on ADR laws and practices.",
    ],
    displayOrder: 4,
  },
  {
    name: "Training & Academic Council",
    slug: "training-academic-council",
    purpose: "To strengthen legal knowledge, advocacy skills, and professional competence among members.",
    rolesAndFunctions: [
      "Organize seminars, webinars, workshops, and conferences.",
      "Conduct advocacy skill development programs.",
      "Provide training on drafting, litigation, arbitration, and emerging laws.",
      "Facilitate Continuing Legal Education (CLE) initiatives.",
      "Coordinate academic collaborations with law schools and universities.",
      "Publish journals, newsletters, and legal research papers.",
      "Organize moot courts, debates, and legal competitions.",
      "Develop leadership and professional development programs.",
    ],
    displayOrder: 5,
  },
  {
    name: "IT & PR Team",
    slug: "it-pr-team",
    purpose: "To manage digital transformation, communication, branding, and public outreach of the Association.",
    rolesAndFunctions: [
      "Develop and maintain the Association's website and digital platforms.",
      "Manage social media and public communication channels.",
      "Coordinate media relations and press releases.",
      "Promote digital legal education initiatives.",
      "Maintain membership databases and online registration systems.",
      "Ensure cybersecurity and data protection measures.",
      "Design promotional materials and branding campaigns.",
      "Facilitate online meetings, webinars, and virtual conferences.",
    ],
    displayOrder: 6,
  },
  {
    name: "Placement & Internships Cell",
    slug: "placement-internships-cell",
    purpose: "To create professional opportunities for advocates, law graduates, and law students.",
    rolesAndFunctions: [
      "Facilitate internships with advocates, law firms, and institutions.",
      "Maintain a placement and career support network.",
      "Organize career counseling and mentorship programs.",
      "Connect members with employment and professional opportunities.",
      "Assist young advocates in establishing legal practice.",
      "Coordinate chamber attachment and apprenticeship opportunities.",
      "Develop partnerships with law firms and corporate legal departments.",
      "Maintain a national legal opportunities portal.",
    ],
    displayOrder: 7,
  },
  {
    name: "Disciplinary & Ethics Committee",
    slug: "disciplinary-ethics-committee",
    purpose: "To uphold professional ethics, organizational discipline, and the integrity of the Association.",
    rolesAndFunctions: [
      "Promote ethical standards among members.",
      "Examine complaints regarding misconduct within the Association.",
      "Recommend disciplinary measures where necessary.",
      "Develop and enforce a Code of Conduct for members.",
      "Encourage professionalism and responsible advocacy.",
      "Resolve internal disputes through fair procedures.",
      "Safeguard the reputation and credibility of the Association.",
      "Advise the Executive Committee on disciplinary and ethical matters.",
    ],
    displayOrder: 8,
  },
  {
    name: "Events & Engagement Team",
    slug: "events-engagement-team",
    purpose:
      "To strengthen member participation, professional networking, organizational visibility, and community engagement through well-planned events, conferences, outreach programs, and interactive initiatives.",
    rolesAndFunctions: [
      "Plan, organize, and coordinate national, state, district, and virtual events.",
      "Conduct conferences, conclaves, seminars, workshops, legal summits, and award ceremonies.",
      "Facilitate networking among advocates, judges, academicians, and policymakers.",
      "Organize social, cultural, sports, and welfare activities for members and families.",
      "Coordinate annual general meetings and executive meetings.",
      "Develop member engagement programs to encourage leadership.",
      "Build strategic partnerships with institutions, universities, and government bodies.",
      "Maintain an annual calendar of events across all chapters.",
    ],
    displayOrder: 9,
  },
];

async function seed() {
  await connectDB();

  console.log("Seeding wings...");
  for (const wing of wings) {
    await Wing.findOneAndUpdate({ slug: wing.slug }, wing, { upsert: true });
  }

  console.log("Seeding default admin user...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@aiaa.org.in";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeThisPassword123!", 12);
    await User.create({
      fullName: "AIAA Administrator",
      email: adminEmail,
      passwordHash,
      role: "super_admin",
      isVerified: true,
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  console.log("Seeding sample leadership placeholders...");
  const leaders = [
    { name: "To be appointed", designation: "Patron in Chief", tier: "patron_in_chief", displayOrder: 1 },
    { name: "To be appointed", designation: "Pioneer", tier: "pioneer", displayOrder: 2 },
    { name: "To be appointed", designation: "National Head", tier: "national_head", displayOrder: 3 },
  ];
  for (const leader of leaders) {
    const exists = await Leader.findOne({ designation: leader.designation, tier: leader.tier });
    if (!exists) await Leader.create(leader);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

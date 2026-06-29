"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeading from "../../components/SectionHeading";
import { api } from "../../lib/api";
import { Users, Briefcase, MessageSquare, IndianRupee, UserCheck, Clock } from "lucide-react";

const cards = [
  { key: "totalUsers", label: "Total Users", icon: Users },
  { key: "activeMembers", label: "Active Members", icon: UserCheck },
  { key: "pendingMembers", label: "Pending Members", icon: Clock },
  { key: "totalJobs", label: "Government Jobs", icon: Briefcase },
  { key: "totalQuestions", label: "Community Questions", icon: MessageSquare },
];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/summary")
      .then(({ data }) => setSummary(data))
      .catch(() => setError("Admin access required. Please log in with an admin account."));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading eyebrow="Admin Panel" title="Dashboard" align="left" />

      {error && <p className="rounded-lg bg-maroon/10 p-4 text-sm text-maroon">{error}</p>}

      {summary && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map(({ key, label, icon: Icon }) => (
            <div key={key} className="card-official rounded-lg p-5 text-center">
              <Icon className="mx-auto mb-2 text-gold-dim" size={22} />
              <p className="font-serif text-2xl font-bold text-navy">{summary[key] ?? 0}</p>
              <p className="text-xs text-ink/55">{label}</p>
            </div>
          ))}
          <div className="card-official rounded-lg p-5 text-center">
            <IndianRupee className="mx-auto mb-2 text-gold-dim" size={22} />
            <p className="font-serif text-2xl font-bold text-navy">
              ₹{((summary.totalRevenuePaise || 0) / 100).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-ink/55">Revenue Collected</p>
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["/admin/leaders", "Manage Leadership"],
          ["/admin/wings", "Manage Wings"],
          ["/admin/jobs", "Manage Jobs"],
          ["/admin/members", "Manage Members"],
          ["/admin/users", "Manage Users"],
          ["/admin/documents", "Side Wing Documents"],
          ["/admin/announcements", "Membership Announcements"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="card-official rounded-lg p-5 text-center font-semibold text-navy hover:border-gold/50">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

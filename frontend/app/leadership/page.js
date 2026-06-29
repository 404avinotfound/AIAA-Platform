"use client";

import { useEffect, useState } from "react";
import SectionHeading from "../../components/SectionHeading";
import LeadershipCard from "../../components/LeadershipCard";
import { api } from "../../lib/api";

export default function LeadershipPage() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    api.get("/leaders").then(({ data }) => setLeaders(data.leaders || [])).catch(() => {});
  }, []);

  const topTier = leaders.filter((l) => ["patron_in_chief", "pioneer", "national_head"].includes(l.tier));
  const rest = leaders.filter((l) => !["patron_in_chief", "pioneer", "national_head"].includes(l.tier));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeading eyebrow="Patron & Core Committee" title="Our Leadership" />

      {topTier.length > 0 && (
        <div className="mb-14 grid gap-6 sm:grid-cols-3">
          {topTier.map((leader) => (
            <LeadershipCard key={leader._id} leader={leader} large />
          ))}
        </div>
      )}

      {rest.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((leader) => (
            <LeadershipCard key={leader._id} leader={leader} />
          ))}
        </div>
      ) : (
        topTier.length === 0 && (
          <p className="rounded-lg border border-dashed border-ink/20 p-10 text-center text-sm text-ink/55">
            Leadership profiles will appear here once added from the admin panel.
          </p>
        )
      )}
    </div>
  );
}

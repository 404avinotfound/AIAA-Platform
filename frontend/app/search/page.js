"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SectionHeading from "../../components/SectionHeading";
import { api, mediaUrl } from "../../lib/api";
import { BadgeCheck, ExternalLink, Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="px-6 py-20 text-center text-sm text-ink/55">Loading…</p>}>
      <SearchResults />
    </Suspense>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q.trim()) {
      setUsers([]);
      return;
    }
    setLoading(true);
    setError("");
    api
      .get("/social/search", { params: { q } })
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => setError("Could not run that search. Please try again."))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading eyebrow="Search" title={q ? `Results for "${q}"` : "Search the Members and Users"} align="left" />

      {loading && <p className="text-sm text-ink/55">Searching…</p>}
      {error && <p className="rounded-lg bg-maroon/10 p-4 text-sm text-maroon">{error}</p>}

      {!loading && !error && q && users.length === 0 && (
        <p className="card-official flex flex-col items-center gap-2 rounded-lg p-10 text-center text-sm text-ink/55">
          <SearchIcon size={24} className="text-ink/30" />
          No members or users found matching "{q}".
        </p>
      )}

      <div className="grid gap-3">
        {users.map((u) => (
          <div key={u._id} className="card-official flex items-center justify-between gap-4 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-navy text-sm font-bold text-gold">
                {u.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(u.avatarUrl)} alt={u.fullName} className="h-full w-full object-cover" />
                ) : (
                  u.fullName?.[0] || "?"
                )}
              </div>
              <div>
                <p className="flex items-center gap-1.5 font-semibold text-navy">
                  {u.fullName}
                  {u.isMember && (
                    <span className="flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold-dim">
                      <BadgeCheck size={12} /> Member
                    </span>
                  )}
                </p>
                {u.headline && <p className="text-xs text-ink/55">{u.headline}</p>}
              </div>
            </div>
            <Link
              href={`/members/${u._id}`}
              className="flex shrink-0 items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-navy hover:border-gold/50"
            >
              <ExternalLink size={13} /> Visit Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

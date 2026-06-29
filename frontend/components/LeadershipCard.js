"use client";

import { useState } from "react";
import Link from "next/link";
import { mediaUrl } from "../lib/api";

export default function LeadershipCard({ leader, large = false }) {
  const [expanded, setExpanded] = useState(false);
  const initials = (leader.name || "AIAA")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const linked = Boolean(leader.user);

  const cardInner = (
    <div className={`card-official flex flex-col items-center rounded-lg p-6 text-center ${linked ? "transition hover:border-gold/50" : ""}`}>
      <div
        className={`flex items-center justify-center overflow-hidden rounded-full border-4 border-gold/30 bg-navy ${
          large ? "h-36 w-36" : "h-24 w-24"
        }`}
      >
        {leader.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(leader.photoUrl)} alt={leader.name} width={144} height={144} className="h-full w-full object-cover" />
        ) : (
          <span className="font-serif text-2xl font-bold text-gold">{initials}</span>
        )}
      </div>

      <h3 className="mt-4 font-serif text-lg font-bold text-navy">{leader.name}</h3>
      <p className="text-sm font-medium text-maroon">{leader.designation}</p>
      {leader.state && <p className="text-xs text-ink/60">{leader.state}</p>}
      {linked && <p className="mt-1 text-[11px] font-semibold text-gold-dim">View Profile →</p>}

      {leader.message && (
        <>
          <p className={`mt-3 text-sm text-ink/70 ${expanded ? "" : "line-clamp-3"}`}>{leader.message}</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="mt-2 text-xs font-semibold text-gold-dim hover:text-maroon"
          >
            {expanded ? "Show less" : "Read More"}
          </button>
        </>
      )}
    </div>
  );

  // Only leaders linked to a registered account (set by the admin in
  // Manage Leadership) are clickable - placeholders like "To be appointed"
  // have nowhere to link to.
  if (!linked) return cardInner;

  return <Link href={`/members/${leader.user}`}>{cardInner}</Link>;
}

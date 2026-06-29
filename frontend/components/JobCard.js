"use client";

import { Bookmark, MapPin, Briefcase, IndianRupee, ExternalLink } from "lucide-react";

export default function JobCard({ job, onBookmark, bookmarked }) {
  return (
    <div className="card-official flex flex-col rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-gold-dim">{job.isGovernmentJob ? "Government" : "Job"}</p>
          <h3 className="mt-1 font-serif text-lg font-bold leading-snug text-navy">{job.title}</h3>
          <p className="text-sm text-ink/60">{job.organization}</p>
        </div>
        <button
          aria-label="Bookmark job"
          onClick={() => onBookmark?.(job)}
          className={`rounded-full border p-2 ${bookmarked ? "border-gold bg-gold/10 text-gold-dim" : "border-ink/15 text-ink/40 hover:text-gold-dim"}`}
        >
          <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {job.description && (
        <p className="mt-3 line-clamp-2 text-sm text-ink/70">{job.description}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink/60">
        {job.location?.length > 0 && (
          <span className="flex items-center gap-1"><MapPin size={13} /> {job.location.join(", ")}</span>
        )}
        {job.vacancies != null && (
          <span className="flex items-center gap-1"><Briefcase size={13} /> {job.vacancies} vacancies</span>
        )}
        {(job.minSalary || job.maxSalary) && (
          <span className="flex items-center gap-1">
            <IndianRupee size={13} /> {job.minSalary || "—"} - {job.maxSalary || "—"}
          </span>
        )}
      </div>

      <a
        href={job.applyLink || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-gold mt-5 flex items-center justify-center gap-2 rounded-full py-2 text-sm"
      >
        Apply Now <ExternalLink size={14} />
      </a>
    </div>
  );
}

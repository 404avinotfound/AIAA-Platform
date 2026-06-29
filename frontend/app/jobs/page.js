"use client";

import { useEffect, useState } from "react";
import SectionHeading from "../../components/SectionHeading";
import JobCard from "../../components/JobCard";
import { api } from "../../lib/api";
import { Search } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/jobs", { params: { search: search || undefined, page, size: 12 } })
      .then(({ data }) => {
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [search, page]);

  async function handleBookmark(job) {
    try {
      await api.post(`/jobs/${job._id}/bookmark`);
    } catch {
      alert("Please log in to bookmark jobs.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeading eyebrow="Government Opportunities" title="Government Jobs & Exams" />

      <div className="mx-auto mb-10 flex max-w-lg items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 shadow-card">
        <Search size={16} className="text-ink/40" />
        <input
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          placeholder="Search by title, organisation, or department"
          className="w-full text-sm focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-center text-sm text-ink/55">Loading opportunities…</p>
      ) : jobs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink/20 p-10 text-center text-sm text-ink/55">
          No jobs found yet. Once the backend's National Career Service sync runs, live government
          vacancies will appear here automatically (refreshed every 6 hours).
        </p>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} onBookmark={handleBookmark} />
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-full border border-ink/15 px-4 py-1.5 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-ink/55">Page {page + 1}</span>
            <button
              disabled={(page + 1) * 12 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-ink/15 px-4 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

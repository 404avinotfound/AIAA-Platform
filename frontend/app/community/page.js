"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeading from "../../components/SectionHeading";
import QuestionCard from "../../components/QuestionCard";
import { api } from "../../lib/api";
import { Search, PlusCircle } from "lucide-react";

export default function CommunityPage() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/community/questions", { params: { search: search || undefined } })
      .then(({ data }) => setQuestions(data.questions || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading eyebrow="Legal Community" title="Ask & Answer Legal Queries" />

      <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 shadow-card">
          <Search size={16} className="text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions"
            className="w-full text-sm focus:outline-none"
          />
        </div>
        <Link href="/community/ask" className="btn-gold flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2 text-sm">
          <PlusCircle size={16} /> Ask a Question
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-sm text-ink/55">Loading questions…</p>
      ) : questions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink/20 p-10 text-center text-sm text-ink/55">
          No questions yet. Be the first to ask the AIAA legal community.
        </p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionCard key={q._id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}

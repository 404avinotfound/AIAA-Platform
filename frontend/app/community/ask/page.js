"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SectionHeading from "../../../components/SectionHeading";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/AuthContext";
import { Paperclip, Lock } from "lucide-react";

export default function AskQuestionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("body", body);
      fd.append("tags", tags);
      fd.append("isAnonymous", isAnonymous);
      attachments.forEach((f) => fd.append("attachments", f));

      const { data } = await api.post("/community/questions", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push(`/community/${data.question._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Please log in to ask a question.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="px-6 py-20 text-center text-sm text-ink/55">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <SectionHeading eyebrow="Legal Community" title="Ask a Legal Query" />
        <div className="card-official flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <Lock size={36} className="text-gold-dim" />
          <p className="text-sm text-ink/65">You must be logged in to ask a legal query.</p>
          <div className="mt-2 flex gap-3">
            <button onClick={() => router.push("/auth/login")} className="btn-gold rounded-full px-5 py-2 text-sm">
              Log In
            </button>
            <Link href="/auth/register" className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-navy hover:border-gold/50">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <SectionHeading eyebrow="Legal Community" title="Ask a Legal Query" align="left" />

      <form onSubmit={handleSubmit} className="card-official space-y-5 rounded-lg p-6">
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your legal question in one line"
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Details</label>
          <textarea
            required
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe your situation, relevant facts, and what you'd like to know"
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Tags (comma separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. property law, RTI, criminal procedure"
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-navy">
            <Paperclip size={14} /> Attach Documents or Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
            className="w-full text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          Post anonymously
        </label>

        {error && <p className="text-sm text-maroon">{error}</p>}

        <button disabled={submitting} className="btn-gold w-full rounded-full py-2.5 text-sm disabled:opacity-60">
          {submitting ? "Posting…" : "Post Question"}
        </button>
      </form>
    </div>
  );
}

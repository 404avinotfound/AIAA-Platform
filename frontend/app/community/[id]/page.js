"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/AuthContext";
import { ThumbsUp, CheckCircle2, Paperclip, Eye, Trash2, Lock, BadgeCheck } from "lucide-react";

function AttachmentList({ attachments }) {
  if (!attachments?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {attachments.map((a) => (
        <a
          key={a.url}
          href={a.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-full bg-navy/5 px-3 py-1 text-xs text-navy/70 hover:bg-navy/10"
        >
          <Paperclip size={12} /> {a.fileName}
        </a>
      ))}
    </div>
  );
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, member } = useAuth();
  const canModerate = user && ["admin", "super_admin", "moderator"].includes(user.role);
  const canAnswer = canModerate || member?.status === "active";
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerBody, setAnswerBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { data } = await api.get(`/community/questions/${id}`);
    setQuestion(data.question);
    setAnswers(data.answers || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, [id]);

  async function handleUpvote() {
    try {
      await api.post(`/community/questions/${id}/upvote`);
      load();
    } catch {
      alert("Please log in to upvote.");
    }
  }

  async function handleAccept(answerId) {
    try {
      await api.post(`/community/questions/${id}/accept/${answerId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not accept answer.");
    }
  }

  async function handleDeleteQuestion() {
    if (!confirm("Remove this question and all its answers? This cannot be undone.")) return;
    try {
      await api.delete(`/community/questions/${id}`);
      router.push("/community");
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove this question.");
    }
  }

  async function handleDeleteAnswer(answerId) {
    if (!confirm("Remove this answer?")) return;
    try {
      await api.delete(`/community/questions/${id}/answers/${answerId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove this answer.");
    }
  }

  async function submitAnswer(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("body", answerBody);
      attachments.forEach((f) => fd.append("attachments", f));
      await api.post(`/community/questions/${id}/answers`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnswerBody("");
      setAttachments([]);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Please log in to answer.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!question) return <p className="px-6 py-20 text-center text-sm text-ink/55">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <Link href="/community" className="text-sm text-gold-dim hover:text-maroon">← Back to all questions</Link>
        {canModerate && (
          <button onClick={handleDeleteQuestion} className="flex items-center gap-1.5 text-sm font-semibold text-maroon hover:underline">
            <Trash2 size={14} /> Remove Question
          </button>
        )}
      </div>

      <div className="card-official mt-4 rounded-lg p-6">
        <p className="text-xs text-ink/50">
          Asked by {question.isAnonymous ? "Anonymous" : question.author?.fullName || "a member"} ·{" "}
          {new Date(question.createdAt).toLocaleDateString()}
        </p>
        <h1 className="mt-1 font-serif text-2xl font-bold text-navy">{question.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm text-ink/75">{question.body}</p>
        <AttachmentList attachments={question.attachments} />

        <div className="mt-5 flex items-center gap-4 text-sm text-ink/55">
          <button onClick={handleUpvote} className="flex items-center gap-1 hover:text-gold-dim">
            <ThumbsUp size={14} /> {question.upvotes?.length || 0}
          </button>
          <span className="flex items-center gap-1"><Eye size={14} /> {question.views} views</span>
        </div>
      </div>

      <h2 className="mt-10 mb-4 font-serif text-xl font-bold text-navy">{answers.length} Answers</h2>
      <div className="space-y-4">
        {answers.map((a) => (
          <div key={a._id} className={`card-official rounded-lg p-5 ${question.acceptedAnswer === a._id ? "border-2 border-green-500" : ""}`}>
            {question.acceptedAnswer === a._id && (
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-green-700">
                <CheckCircle2 size={14} /> Accepted Answer
              </p>
            )}
            <p className="whitespace-pre-wrap text-sm text-ink/80">{a.body}</p>
            <AttachmentList attachments={a.attachments} />
            <div className="mt-3 flex items-center justify-between text-xs text-ink/50">
              <span className="flex items-center gap-1">
                — {a.author?.fullName || "Member"}
                {a.authorIsMember && <BadgeCheck size={13} className="text-gold-dim" />}
              </span>
              <div className="flex items-center gap-3">
                {question.acceptedAnswer !== a._id && (
                  <button onClick={() => handleAccept(a._id)} className="font-semibold text-gold-dim hover:text-maroon">
                    Mark as Accepted
                  </button>
                )}
                {canModerate && (
                  <button onClick={() => handleDeleteAnswer(a._id)} className="text-maroon hover:text-maroon/70" aria-label="Remove answer">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {canAnswer ? (
        <form onSubmit={submitAnswer} className="card-official mt-8 space-y-3 rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-navy">Write an Answer</h3>
          <textarea
            required
            rows={4}
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
            placeholder="Share your legal opinion or guidance"
          />
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
            className="text-sm"
          />
          <button disabled={submitting} className="btn-gold rounded-full px-5 py-2 text-sm disabled:opacity-60">
            {submitting ? "Posting…" : "Post Answer"}
          </button>
        </form>
      ) : (
        <div className="card-official mt-8 flex flex-col items-center gap-2 rounded-lg p-8 text-center">
          <Lock size={28} className="text-gold-dim" />
          <p className="text-sm text-ink/65">
            {user
              ? "Only active AIAA members with a membership plan can answer legal queries."
              : "Please log in as an active AIAA member to answer this query."}
          </p>
          {!user && (
            <button onClick={() => router.push("/auth/login")} className="btn-gold mt-1 rounded-full px-5 py-2 text-sm">
              Log In
            </button>
          )}
          {user && member?.status !== "active" && (
            <Link href="/membership" className="btn-gold mt-1 rounded-full px-5 py-2 text-sm">
              Become a Member
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { MessageSquare, Eye, ThumbsUp, Paperclip, CheckCircle2, Pin } from "lucide-react";

export default function QuestionCard({ question, answerCount = 0 }) {
  return (
    <Link
      href={`/community/${question._id}`}
      className="card-official flex flex-col gap-2 rounded-lg p-5 transition hover:border-gold/40"
    >
      <div className="flex items-center gap-2 text-xs text-ink/50">
        {question.isPinned && <span className="flex items-center gap-1 text-maroon"><Pin size={12} /> Pinned</span>}
        {question.status === "answered" && (
          <span className="flex items-center gap-1 text-green-700"><CheckCircle2 size={12} /> Answered</span>
        )}
        <span>
          Asked by {question.isAnonymous ? "Anonymous" : question.author?.fullName || "a member"}
        </span>
      </div>

      <h3 className="font-serif text-lg font-bold text-navy">{question.title}</h3>
      <p className="line-clamp-2 text-sm text-ink/65">{question.body}</p>

      {question.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {question.tags.map((t) => (
            <span key={t} className="rounded-full bg-navy/5 px-2.5 py-0.5 text-xs text-navy/70">#{t}</span>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center gap-4 text-xs text-ink/50">
        <span className="flex items-center gap-1"><MessageSquare size={13} /> {answerCount} answers</span>
        <span className="flex items-center gap-1"><ThumbsUp size={13} /> {question.upvotes?.length || 0}</span>
        <span className="flex items-center gap-1"><Eye size={13} /> {question.views || 0} views</span>
        {question.attachments?.length > 0 && (
          <span className="flex items-center gap-1"><Paperclip size={13} /> {question.attachments.length}</span>
        )}
      </div>
    </Link>
  );
}

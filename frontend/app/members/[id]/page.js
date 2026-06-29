"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FollowButton from "../../../components/FollowButton";
import { api, mediaUrl } from "../../../lib/api";
import { MessageCircle, BadgeCheck, MessageSquareText, Gavel, MapPin, Phone, Briefcase, Crown } from "lucide-react";

const statusStyles = {
  open: "bg-navy/10 text-navy",
  answered: "bg-green-100 text-green-700",
  closed: "bg-ink/10 text-ink/60",
  flagged: "bg-maroon/10 text-maroon",
};

export default function MemberProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [leadership, setLeadership] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [messaging, setMessaging] = useState(false);
  const [messageError, setMessageError] = useState("");

  useEffect(() => {
    api
      .get(`/social/${id}/profile`)
      .then(({ data }) => {
        setProfile(data.user);
        setMembership(data.membership);
        setLeadership(data.leadership);
      })
      .catch(() => {});
    api.get(`/social/${id}/followers`).then(({ data }) => setFollowers(data.followers || [])).catch(() => {});
    api.get(`/social/${id}/following`).then(({ data }) => setFollowing(data.following || [])).catch(() => {});
    api.get(`/community/users/${id}/questions`).then(({ data }) => setQuestions(data.questions || [])).catch(() => {});
  }, [id]);

  // Starts (or re-opens) a 1:1 conversation with this member, then jumps
  // straight to it in the Messages page. The backend requires the visitor
  // to already follow this member before a brand-new conversation can be
  // created - if that hasn't happened yet, show why instead of a silent dead end.
  async function handleMessage() {
    setMessageError("");
    setMessaging(true);
    try {
      const { data } = await api.post(`/social/conversations/${id}`);
      router.push(`/messages?conversation=${data.conversation._id}`);
    } catch (err) {
      setMessageError(
        err.response?.data?.message || "Please log in and follow this member before messaging them."
      );
    } finally {
      setMessaging(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="card-official rounded-lg p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold/30 bg-navy text-xl font-bold text-gold">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(profile.avatarUrl)} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              profile?.fullName?.[0] || "?"
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="flex items-center justify-center gap-2 font-serif text-2xl font-bold text-navy sm:justify-start">
              {profile?.fullName || "Member Profile"}
              {membership && (
                <span className="flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold-dim">
                  <BadgeCheck size={13} /> Member
                </span>
              )}
            </h1>
            {profile?.headline && <p className="text-sm font-medium text-maroon">{profile.headline}</p>}
            <p className="mt-1 text-sm text-ink/55">{followers.length} followers · {following.length} following</p>
            <div className="mt-3 flex justify-center gap-3 sm:justify-start">
              <FollowButton userId={id} />
              <button
                onClick={handleMessage}
                disabled={messaging}
                className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-1.5 text-sm font-medium text-navy hover:border-gold/50 disabled:opacity-60"
              >
                <MessageCircle size={15} /> {messaging ? "Opening…" : "Message"}
              </button>
            </div>
            {messageError && <p className="mt-2 text-xs text-maroon">{messageError}</p>}
            {!messageError && (
              <p className="mt-2 text-xs text-ink/45">
                Follow this member first to be able to message them.
              </p>
            )}
          </div>
        </div>

        {profile?.bio && (
          <div className="mt-6 border-t border-ink/10 pt-5">
            <h3 className="mb-1 font-serif text-base font-bold text-navy">About</h3>
            <p className="whitespace-pre-wrap text-sm text-ink/70">{profile.bio}</p>
          </div>
        )}
      </div>

      {membership && (
        <div className="card-official mt-6 rounded-lg p-6">
          <h3 className="mb-3 font-serif text-base font-bold text-navy">Professional Details</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            {membership.courtOfPractice && (
              <div className="flex items-start gap-2">
                <Gavel size={15} className="mt-0.5 text-gold-dim" />
                <div>
                  <dt className="text-xs text-ink/45">Court of Practice</dt>
                  <dd className="text-sm font-medium text-navy">{membership.courtOfPractice}</dd>
                </div>
              </div>
            )}
            {membership.areaOfPractice && (
              <div className="flex items-start gap-2">
                <Briefcase size={15} className="mt-0.5 text-gold-dim" />
                <div>
                  <dt className="text-xs text-ink/45">Area of Practice</dt>
                  <dd className="text-sm font-medium text-navy">{membership.areaOfPractice}</dd>
                </div>
              </div>
            )}
            {(membership.state || membership.district) && (
              <div className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 text-gold-dim" />
                <div>
                  <dt className="text-xs text-ink/45">Residential State / District</dt>
                  <dd className="text-sm font-medium text-navy">
                    {[membership.district, membership.state].filter(Boolean).join(", ")}
                  </dd>
                </div>
              </div>
            )}
            {profile?.phone && (
              <div className="flex items-start gap-2">
                <Phone size={15} className="mt-0.5 text-gold-dim" />
                <div>
                  <dt className="text-xs text-ink/45">Phone Number</dt>
                  <dd className="text-sm font-medium text-navy">{profile.phone}</dd>
                </div>
              </div>
            )}
            {(membership.designation || membership.wing) && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Briefcase size={15} className="mt-0.5 text-gold-dim" />
                <div>
                  <dt className="text-xs text-ink/45">Designation</dt>
                  <dd className="text-sm font-medium text-navy">
                    {membership.designation || "Member"}
                    {membership.wing && <span className="text-ink/55"> · {membership.wing} Wing</span>}
                  </dd>
                </div>
              </div>
            )}
          </dl>
        </div>
      )}

      {leadership && (
        <div className="card-official mt-6 flex items-center gap-3 rounded-lg p-6">
          <Crown size={22} className="text-gold-dim" />
          <div>
            <p className="text-xs text-ink/45">Leadership Position</p>
            <p className="font-serif text-base font-bold text-navy">
              {leadership.designation}
              {leadership.state && <span className="text-sm font-medium text-maroon"> · {leadership.state}</span>}
            </p>
          </div>
        </div>
      )}

      <div className="card-official mt-6 rounded-lg p-6">
        <h3 className="mb-3 flex items-center gap-1.5 font-serif text-base font-bold text-navy">
          <MessageSquareText size={16} className="text-gold-dim" /> Legal Queries Asked
        </h3>
        {questions.length === 0 ? (
          <p className="text-sm text-ink/50">No legal queries asked yet.</p>
        ) : (
          <ul className="space-y-2">
            {questions.map((q) => (
              <li key={q._id}>
                <Link
                  href={`/community/${q._id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-ink/10 p-3 text-sm hover:border-gold/50"
                >
                  <span className="font-medium text-navy">{q.title}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusStyles[q.status] || statusStyles.open}`}>
                    {q.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

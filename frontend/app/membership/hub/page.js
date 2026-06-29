"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SectionHeading from "../../../components/SectionHeading";
import SideWings from "../../../components/SideWings";
import { useAuth } from "../../../lib/AuthContext";
import { api } from "../../../lib/api";
import { Pin, Megaphone, Lock } from "lucide-react";

export default function MembershipHubPage() {
  const router = useRouter();
  const { user, member, loading } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [accessError, setAccessError] = useState("");

  const isStaff = ["admin", "super_admin", "moderator"].includes(user?.role);
  const isActiveMember = member?.status === "active" || isStaff;

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !isActiveMember) return;

    api
      .get("/announcements")
      .then(({ data }) => setAnnouncements(data.announcements || []))
      .catch((err) => setAccessError(err.response?.data?.message || "Could not load announcements."));

    // Members-only documents are simply documents marked membersOnly=true on
    // the backend - GET /documents already returns those to active members,
    // so we just filter the same response client-side for this section.
    api
      .get("/documents")
      .then(({ data }) => setDocuments((data.documents || []).filter((d) => d.membersOnly)))
      .catch(() => {});
  }, [user, isActiveMember]);

  if (loading || !user) {
    return <p className="px-6 py-20 text-center text-sm text-ink/55">Loading…</p>;
  }

  if (!isActiveMember) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <SectionHeading eyebrow="Membership Hub" title="Members Only" />
        <div className="card-official flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <Lock size={36} className="text-gold-dim" />
          <p className="text-sm text-ink/65">
            This area — membership announcements and members-only documents — is reserved for active AIAA members.
          </p>
          <Link href="/membership" className="btn-gold mt-2 rounded-full px-5 py-2 text-sm">
            Become a Member
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading eyebrow="Membership Hub" title="Announcements & Member Documents" align="left" />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-bold text-navy">
            <Megaphone size={18} className="text-gold-dim" /> Announcements
          </h3>
          {accessError && <p className="rounded-lg bg-maroon/10 p-4 text-sm text-maroon">{accessError}</p>}
          {!accessError && announcements.length === 0 && (
            <p className="card-official rounded-lg p-6 text-center text-sm text-ink/50">
              No announcements yet. Check back soon.
            </p>
          )}
          <div className="grid gap-3">
            {announcements.map((a) => (
              <div key={a._id} className="card-official rounded-lg p-4">
                <p className="flex items-center gap-1.5 font-semibold text-navy">
                  {a.isPinned && <Pin size={13} className="text-maroon" />}
                  {a.title}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink/65">{a.body}</p>
                <p className="mt-2 text-[11px] text-ink/40">
                  {a.postedBy?.fullName ? `By ${a.postedBy.fullName} · ` : ""}
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <SideWings documents={documents} />
      </div>
    </div>
  );
}

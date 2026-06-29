"use client";

import { useEffect, useState } from "react";
import SectionHeading from "../../../components/SectionHeading";
import { api } from "../../../lib/api";
import { Trash2, Pin, Megaphone } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", isPinned: false });
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  function load() {
    api
      .get("/announcements")
      .then(({ data }) => setAnnouncements(data.announcements || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load announcements."));
  }
  useEffect(load, []);

  async function handlePost(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.body.trim()) {
      setError("Please fill in both a title and a message.");
      return;
    }
    setPosting(true);
    try {
      await api.post("/announcements", form);
      setForm({ title: "", body: "", isPinned: false });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not post the announcement. Admin/moderator login required.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this announcement?")) return;
    await api.delete(`/announcements/${id}`);
    load();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading eyebrow="Admin Panel" title="Membership Announcements" align="left" />
      <p className="mb-6 text-sm text-ink/60">
        Announcements posted here only appear to active AIAA members (and staff) in the Membership Hub.
      </p>

      <form onSubmit={handlePost} className="card-official mb-10 grid gap-4 rounded-lg p-6">
        <input
          required
          placeholder="Announcement title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="rounded-md border border-ink/15 px-3 py-2 text-sm"
        />
        <textarea
          required
          rows={4}
          placeholder="Announcement message"
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          className="rounded-md border border-ink/15 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={form.isPinned}
            onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))}
          />
          Pin to top
        </label>
        {error && <p className="text-sm text-maroon">{error}</p>}
        <button disabled={posting} className="btn-gold flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm disabled:opacity-60">
          <Megaphone size={15} /> {posting ? "Posting…" : "Post Announcement"}
        </button>
      </form>

      <div className="grid gap-3">
        {announcements.map((a) => (
          <div key={a._id} className="card-official flex items-start justify-between gap-4 rounded-lg p-4">
            <div>
              <p className="flex items-center gap-1.5 font-semibold text-navy">
                {a.isPinned && <Pin size={13} className="text-maroon" />}
                {a.title}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink/65">{a.body}</p>
              <p className="mt-1 text-[11px] text-ink/40">
                {a.postedBy?.fullName ? `By ${a.postedBy.fullName} · ` : ""}
                {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}
              </p>
            </div>
            <button onClick={() => handleDelete(a._id)} className="shrink-0 text-maroon hover:text-maroon/70">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

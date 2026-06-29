"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeading from "../../../components/SectionHeading";
import { useAuth } from "../../../lib/AuthContext";
import { api, mediaUrl } from "../../../lib/api";
import { Camera } from "lucide-react";

const MAX_AVATAR_BYTES = 100 * 1024; // 100KB
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setHeadline(user.headline || "");
      setBio(user.bio || "");
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setMessage("Only image files (JPG, PNG, WEBP, GIF) are allowed for the profile photo.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setMessage("Profile photo must be 100KB or smaller. Please compress it and try again.");
      e.target.value = "";
      return;
    }

    setMessage("");
    setAvatarPreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("avatar", file);
    try {
      await api.post("/auth/me/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await refresh();
      setMessage("Profile photo updated.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not upload photo.");
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.patch("/auth/me", { headline, bio });
      await refresh();
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return <p className="px-6 py-20 text-center text-sm text-ink/55">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <SectionHeading eyebrow="My Account" title="Edit Profile" align="left" />

      <div className="card-official rounded-lg p-6">
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gold/30 bg-navy">
            {avatarPreview || user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview || mediaUrl(user.avatarUrl)}
                alt={user.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-serif text-xl font-bold text-gold">
                {user.fullName?.[0]}
              </span>
            )}
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/40 hover:opacity-100">
              <Camera size={20} className="text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-serif text-lg font-bold text-navy">{user.fullName}</p>
            <p className="text-sm text-ink/55">{user.email}</p>
            <label className="mt-1 inline-block cursor-pointer text-xs font-semibold text-gold-dim hover:text-maroon">
              Change photo
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            <p className="mt-0.5 text-[11px] text-ink/40">JPG, PNG, WEBP or GIF, max 100KB.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Professional Headline</label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Advocate, Delhi High Court"
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">About Me</label>
            <textarea
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other members a bit about your practice and interests"
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
            />
          </div>

          {message && <p className="text-sm text-ink/65">{message}</p>}

          <button disabled={saving} className="btn-gold rounded-full px-5 py-2 text-sm disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

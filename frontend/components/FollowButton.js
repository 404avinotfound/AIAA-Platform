"use client";

import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { api } from "../lib/api";

export default function FollowButton({ userId, initiallyFollowing = false }) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [loading, setLoading] = useState(false);

  async function toggleFollow() {
    setLoading(true);
    try {
      const { data } = await api.post(`/social/follow/${userId}`);
      setFollowing(data.following);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Please log in to follow members.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
        following ? "border border-gold/50 text-gold-dim hover:bg-gold/10" : "btn-gold"
      }`}
    >
      {following ? <UserCheck size={15} /> : <UserPlus size={15} />}
      {following ? "Following" : "Follow"}
    </button>
  );
}

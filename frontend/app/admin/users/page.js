"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeading from "../../../components/SectionHeading";
import { api } from "../../../lib/api";
import { Search, ShieldOff, ShieldCheck, Crown, ExternalLink } from "lucide-react";

const membershipFilters = [
  ["all", "All Users"],
  ["none", "No Membership Plan"],
  ["active", "Active Members"],
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function load() {
    api
      .get("/admin/users", { params: { search: search || undefined } })
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => setError("Admin access required."));
  }

  useEffect(() => {
    const timer = setTimeout(load, 300); // debounce search typing
    return () => clearTimeout(timer);
  }, [search]);

  const visibleUsers = users.filter((u) => {
    if (membershipFilter === "none") return !u.membership;
    if (membershipFilter === "active") return u.membership?.status === "active";
    return true;
  });

  async function toggleBlock(user) {
    setBusyId(user._id);
    try {
      await api.patch(`/admin/users/${user._id}/block`, { isBlocked: !user.isBlocked });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update this account.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleLifetime(user) {
    const hasActiveMembership = user.membership?.status === "active";
    const confirmMsg = hasActiveMembership
      ? `Revoke ${user.fullName}'s membership?`
      : `Grant a free lifetime membership to ${user.fullName}?`;
    if (!confirm(confirmMsg)) return;

    setBusyId(user._id);
    try {
      if (hasActiveMembership) {
        await api.post(`/admin/users/${user._id}/revoke-membership`);
      } else {
        await api.post(`/admin/users/${user._id}/grant-lifetime`);
      }
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update this membership.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading eyebrow="Admin Panel" title="Manage Users" align="left" />
      {error && <p className="mb-6 rounded-lg bg-maroon/10 p-4 text-sm text-maroon">{error}</p>}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex max-w-sm items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 shadow-card">
          <Search size={16} className="text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full text-sm focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {membershipFilters.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setMembershipFilter(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                membershipFilter === value ? "bg-navy text-gold" : "bg-navy/5 text-ink/60 hover:bg-navy/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {visibleUsers.map((u) => (
          <div key={u._id} className="card-official flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-semibold text-navy">
                {u.fullName}
                {u.isBlocked && <span className="rounded-full bg-maroon/10 px-2 py-0.5 text-xs text-maroon">Blocked</span>}
                {u.membership?.status === "active" && (
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold-dim capitalize">
                    {u.membership.plan} member
                  </span>
                )}
                {!u.membership && (
                  <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink/55">No membership plan</span>
                )}
              </p>
              <p className="text-xs text-ink/55">
                {u.email} {u.phone ? `· ${u.phone}` : ""} · {u.role.replace("_", " ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/members/${u._id}`}
                className="flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-navy hover:border-gold/50"
              >
                <ExternalLink size={13} /> View Profile
              </Link>
              <button
                disabled={busyId === u._id}
                onClick={() => toggleLifetime(u)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                  u.membership?.status === "active"
                    ? "bg-ink/10 text-ink/60 hover:bg-ink/20"
                    : "bg-gold/10 text-gold-dim hover:bg-gold/20"
                }`}
              >
                <Crown size={13} /> {u.membership?.status === "active" ? "Revoke Membership" : "Grant Lifetime"}
              </button>
              <button
                disabled={busyId === u._id}
                onClick={() => toggleBlock(u)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                  u.isBlocked ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-maroon/10 text-maroon hover:bg-maroon/20"
                }`}
              >
                {u.isBlocked ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                {u.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        ))}
        {!error && visibleUsers.length === 0 && (
          <p className="rounded-lg border border-dashed border-ink/20 p-10 text-center text-sm text-ink/55">
            No users found.
          </p>
        )}
      </div>
    </div>
  );
}

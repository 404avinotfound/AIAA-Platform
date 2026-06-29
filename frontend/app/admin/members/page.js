"use client";

import { useEffect, useState } from "react";
import SectionHeading from "../../../components/SectionHeading";
import { api } from "../../../lib/api";
import { Check, X, PauseCircle, PlayCircle, FileEdit } from "lucide-react";

const statusLabels = {
  pending_payment: "Pending Payment",
  active: "Active",
  expired: "Expired",
  rejected: "Rejected",
  suspended: "Suspended",
  resubmission_required: "Refill Requested",
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function load() {
    api
      .get("/members")
      .then(({ data }) => setMembers(data.members || []))
      .catch(() => setError("Admin access required."));
  }
  useEffect(load, []);

  async function updateStatus(id, status) {
    setBusyId(id);
    try {
      await api.patch(`/members/${id}/status`, { status });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading eyebrow="Admin Panel" title="Manage Members" align="left" />
      {error && <p className="rounded-lg bg-maroon/10 p-4 text-sm text-maroon">{error}</p>}

      <div className="grid gap-3">
        {members.map((m) => {
          const isActive = m.status === "active";
          const isSuspended = m.status === "suspended";
          const busy = busyId === m._id;

          return (
            <div key={m._id} className="card-official flex flex-col items-start justify-between gap-3 rounded-lg p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-navy">{m.user?.fullName} ({m.user?.email})</p>
                <p className="text-xs capitalize text-ink/55">
                  {m.membershipType?.replace("_", " ")} · {statusLabels[m.status] || m.status?.replace(/_/g, " ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Approve/Reject toggle: shows the action that applies given the current state */}
                {isActive ? (
                  <button
                    disabled={busy}
                    onClick={() => updateStatus(m._id, "rejected")}
                    className="flex items-center gap-1 rounded-full bg-maroon px-3 py-1 text-xs text-white disabled:opacity-50"
                  >
                    <X size={13} /> Reject
                  </button>
                ) : (
                  <button
                    disabled={busy}
                    onClick={() => updateStatus(m._id, "active")}
                    className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs text-white disabled:opacity-50"
                  >
                    <Check size={13} /> Approve
                  </button>
                )}

                {/* Suspend/Unsuspend toggle */}
                {isSuspended ? (
                  <button
                    disabled={busy}
                    onClick={() => updateStatus(m._id, "active")}
                    className="flex items-center gap-1 rounded-full bg-green-700 px-3 py-1 text-xs text-white disabled:opacity-50"
                  >
                    <PlayCircle size={13} /> Unsuspend
                  </button>
                ) : (
                  <button
                    disabled={busy}
                    onClick={() => updateStatus(m._id, "suspended")}
                    className="flex items-center gap-1 rounded-full bg-ink/70 px-3 py-1 text-xs text-white disabled:opacity-50"
                  >
                    <PauseCircle size={13} /> Suspend
                  </button>
                )}

                {/* Ask the applicant to refill/resubmit their application */}
                <button
                  disabled={busy || m.status === "resubmission_required"}
                  onClick={() => updateStatus(m._id, "resubmission_required")}
                  className="flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-dim hover:bg-gold/25 disabled:opacity-50"
                >
                  <FileEdit size={13} /> {m.status === "resubmission_required" ? "Refill Requested" : "Ask to Refill Form"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import SectionHeading from "../../../components/SectionHeading";
import { api } from "../../../lib/api";

export default function AdminWingsPage() {
  const [wings, setWings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  function load() {
    api.get("/wings").then(({ data }) => setWings(data.wings || [])).catch(() => {});
  }
  useEffect(load, []);

  async function save() {
    setError("");
    try {
      await api.put(`/wings/${editing._id}`, editing);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save. Admin login required.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading eyebrow="Admin Panel" title="Manage Wings" align="left" />
      <p className="mb-6 text-sm text-ink/60">
        Run <code>npm run seed</code> in <code>/backend</code> once to load the 9 wings from the AIAA
        document, then edit their content here — no code changes needed.
      </p>

      <div className="grid gap-3">
        {wings.map((w) => (
          <div key={w._id} className="card-official rounded-lg p-4">
            {editing?._id === w._id ? (
              <div className="space-y-3">
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm" />
                <textarea value={editing.purpose} onChange={(e) => setEditing({ ...editing, purpose: e.target.value })} className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm" rows={3} />
                {error && <p className="text-sm text-maroon">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={save} className="btn-gold rounded-full px-4 py-1.5 text-xs">Save</button>
                  <button onClick={() => setEditing(null)} className="rounded-full border border-ink/15 px-4 py-1.5 text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy">{w.name}</p>
                  <p className="line-clamp-1 text-xs text-ink/55">{w.purpose}</p>
                </div>
                <button onClick={() => setEditing(w)} className="text-sm font-semibold text-gold-dim hover:text-maroon">Edit</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

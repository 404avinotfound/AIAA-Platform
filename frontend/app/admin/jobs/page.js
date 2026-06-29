"use client";

import { useState } from "react";
import SectionHeading from "../../../components/SectionHeading";
import { api } from "../../../lib/api";

export default function AdminJobsPage() {
  const [form, setForm] = useState({ title: "", organization: "", description: "", applyLink: "" });
  const [message, setMessage] = useState("");
  const [syncing, setSyncing] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/jobs/manual", form);
      setForm({ title: "", organization: "", description: "", applyLink: "" });
      setMessage("Job added successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add job. Admin login required.");
    }
  }

  async function handleSync() {
    setSyncing(true);
    setMessage("");
    try {
      const { data } = await api.post("/jobs/sync-now");
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading eyebrow="Admin Panel" title="Manage Government Jobs" align="left" />

      <button onClick={handleSync} disabled={syncing} className="btn-gold mb-8 rounded-full px-5 py-2 text-sm disabled:opacity-60">
        {syncing ? "Syncing with NCS…" : "Sync Now from NCS API"}
      </button>

      <form onSubmit={handleAdd} className="card-official space-y-4 rounded-lg p-6">
        <h3 className="font-serif text-lg font-bold text-navy">Add a Manual Job Listing</h3>
        <input required placeholder="Job Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm" />
        <input placeholder="Organization" value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm" />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm" />
        <input placeholder="Apply Link" value={form.applyLink} onChange={(e) => setForm((f) => ({ ...f, applyLink: e.target.value }))} className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm" />
        {message && <p className="text-sm text-ink/70">{message}</p>}
        <button className="btn-gold rounded-full px-5 py-2 text-sm">Add Job</button>
      </form>
    </div>
  );
}
